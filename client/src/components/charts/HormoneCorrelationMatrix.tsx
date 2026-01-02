// ============================================================================
// METABOLIC SIMULATOR - HORMONE CORRELATION MATRIX COMPONENT
// ============================================================================

import { memo, useState, useMemo, useCallback } from 'react';
import { useSimulationStore } from '../../state/store';
import { selectHormoneHistory } from '../../state/selectors';
import { HORMONE_EDUCATION } from '../../data/hormoneEducation';
import HormoneTooltip from '../ui/HormoneTooltip';
import {
  calculatePearsonCorrelation,
  classifyCorrelation,
  getCorrelationDescription,
  calculateCorrelationMatrix,
} from '../../utils/correlation';

interface CorrelationData {
  relationship: 'synergistic' | 'antagonistic' | 'permissive' | 'neutral';
  strength: number; // 0-1
  description: string;
  actualCorrelation?: number; // Calculated from historical data
}

// Define hormone relationships as a 2D array
const HORMONE_RELATIONSHIPS: CorrelationData[][] = Array(9).fill(null).map(() =>
  Array(9).fill(null).map(() => ({ relationship: 'neutral' as const, strength: 0, description: '' }))
);

// Fill in the relationships (only upper triangle needed, will mirror)
const hormones = ['insulin', 'glucagon', 'cortisol', 'testosterone', 'growthHormone', 'igf1', 'epinephrine', 'leptin', 'ghrelin'];

// Helper to set relationship
function setRel(h1: number, h2: number, rel: CorrelationData['relationship'], strength: number, desc: string) {
  HORMONE_RELATIONSHIPS[h1][h2] = { relationship: rel, strength, description: desc };
  HORMONE_RELATIONSHIPS[h2][h1] = { relationship: rel, strength, description: desc };
}

// Insulin relationships
setRel(0, 1, 'antagonistic', 0.9, 'Insulin lowers blood glucose while glucagon raises it');
setRel(0, 2, 'antagonistic', 0.6, 'Cortisol induces insulin resistance');
setRel(0, 3, 'synergistic', 0.7, 'Insulin enhances testosterone production');
setRel(0, 4, 'synergistic', 0.5, 'Both support anabolic processes post-meal');
setRel(0, 5, 'synergistic', 0.6, 'Shared signaling pathways for growth');
setRel(0, 6, 'antagonistic', 0.8, 'Epinephrine suppresses insulin during stress');
setRel(0, 7, 'synergistic', 0.5, 'Both signal satiety and energy storage');
setRel(0, 8, 'antagonistic', 0.7, 'Insulin suppresses ghrelin (hunger)');

// Glucagon relationships
setRel(1, 2, 'synergistic', 0.6, 'Both mobilize energy during stress/fasting');
setRel(1, 3, 'antagonistic', 0.4, 'Glucagon can inhibit anabolic processes');
setRel(1, 4, 'synergistic', 0.3, 'Both elevated during fasting');
setRel(1, 6, 'synergistic', 0.8, 'Both raise blood glucose rapidly');
setRel(1, 7, 'antagonistic', 0.5, 'Glucagon associated with fasting, leptin with fed');
setRel(1, 8, 'synergistic', 0.6, 'Both increase during fasting');

// Cortisol relationships
setRel(2, 3, 'antagonistic', 0.8, 'Cortisol suppresses testosterone production');
setRel(2, 4, 'antagonistic', 0.7, 'Cortisol inhibits growth hormone release');
setRel(2, 5, 'antagonistic', 0.5, 'Cortisol impairs IGF-1 signaling');
setRel(2, 6, 'synergistic', 0.6, 'Both respond to stress');
setRel(2, 7, 'antagonistic', 0.4, 'Chronic cortisol lowers leptin sensitivity');
setRel(2, 8, 'synergistic', 0.5, 'Stress can increase ghrelin');

// Testosterone relationships
setRel(3, 4, 'synergistic', 0.7, 'Both support muscle anabolism');
setRel(3, 5, 'synergistic', 0.6, 'Testosterone supports IGF-1 production');
setRel(3, 7, 'synergistic', 0.4, 'Testosterone supports leptin sensitivity');
setRel(3, 8, 'antagonistic', 0.3, 'Testosterone may reduce ghrelin');

// Growth Hormone relationships
setRel(4, 5, 'synergistic', 0.9, 'GH stimulates IGF-1 production in liver');
setRel(4, 8, 'synergistic', 0.8, 'Ghrelin potently stimulates GH release');

// IGF-1 relationships
setRel(5, 7, 'synergistic', 0.3, 'Both support anabolic processes');

// Epinephrine relationships
setRel(6, 8, 'synergistic', 0.4, 'Stress hormones often co-elevated');

// Leptin-Ghrelin (inverse relationship)
setRel(7, 8, 'antagonistic', 0.8, 'Leptin suppresses ghrelin (satiety vs hunger)');

// Move helper functions outside component to avoid recreation on every render
const getRelationshipColor = (relationship: CorrelationData['relationship'], strength: number) => {
  const alpha = 0.3 + strength * 0.7;
  switch (relationship) {
    case 'synergistic': return `rgba(34, 197, 94, ${alpha})`; // green
    case 'antagonistic': return `rgba(239, 68, 68, ${alpha})`; // red
    case 'permissive': return `rgba(234, 179, 8, ${alpha})`; // yellow
    default: return `rgba(71, 85, 105, ${alpha})`; // slate
  }
};

const getRelationshipIcon = (relationship: CorrelationData['relationship']) => {
  switch (relationship) {
    case 'synergistic': return '⊕';
    case 'antagonistic': return '⊖';
    case 'permissive': return '⊙';
    default: return '•';
  }
};

const getShortName = (hormoneId: string) => {
  const edu = HORMONE_EDUCATION[hormoneId];
  return edu?.abbreviation || hormoneId.slice(0, 3).toUpperCase();
};

const getFullName = (hormoneId: string) => {
  const edu = HORMONE_EDUCATION[hormoneId];
  return edu?.name || hormoneId;
};

// Memoized matrix cell component for performance
const MatrixCell = memo(function MatrixCell({
  hormoneId,
  currentValue,
  selectedHormone,
  isHovered,
  onSelect,
}: {
  hormoneId: string;
  currentValue: number;
  selectedHormone: string | null;
  isHovered: boolean;
  onSelect: () => void;
}) {
  const edu = HORMONE_EDUCATION[hormoneId];
  if (!currentValue || !edu) return null;

  const isSelected = selectedHormone === hormoneId;

  return (
    <HormoneTooltip hormoneId={hormoneId} currentValue={currentValue}>
      <button
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={`${edu.name} (${edu.abbreviation}): ${currentValue.toFixed(1)} - ${isSelected ? 'Click to deselect' : 'Click to select'}`}
        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        {edu.abbreviation}: {currentValue.toFixed(1)}
      </button>
    </HormoneTooltip>
  );
});

// Memoized correlation cell component for performance
const CorrelationCell = memo(function CorrelationCell({
  h1,
  h2,
  rel,
  selectedHormone,
  isHovered,
  onHover,
  onLeave,
  value1,
  value2,
  showActual,
}: {
  h1: string;
  h2: string;
  rel: CorrelationData;
  selectedHormone: string | null;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  value1: number;
  value2: number;
  showActual: boolean;
}) {
  const isSelected = selectedHormone === h1 || selectedHormone === h2;

  let bgClass = 'bg-slate-900/50';
  let bgColor: string | undefined;
  let icon: string | null = null;
  let opacity = 1;

  if (showActual && rel.actualCorrelation !== undefined) {
    // Show actual correlation
    const { strength, direction } = classifyCorrelation(rel.actualCorrelation);
    const alpha = 0.2 + Math.abs(rel.actualCorrelation) * 0.6;

    if (direction === 'positive') {
      bgColor = `rgba(34, 197, 94, ${alpha})`; // green
      icon = direction === 'positive' ? '+' : '-';
    } else if (direction === 'negative') {
      bgColor = `rgba(239, 68, 68, ${alpha})`; // red
    }

    opacity = 0.3 + Math.abs(rel.actualCorrelation) * 0.7;
  } else if (rel.strength > 0) {
    // Show theoretical relationship
    bgColor = getRelationshipColor(rel.relationship, rel.strength);
    icon = getRelationshipIcon(rel.relationship);
    opacity = 0.5 + rel.strength * 0.5;
  }

  if (isSelected && (rel.strength > 0 || rel.actualCorrelation !== undefined)) {
    bgClass = 'bg-blue-500/20';
  } else if (isHovered) {
    bgClass = 'bg-slate-700/50';
  } else if (selectedHormone && (h1 === selectedHormone || h2 === selectedHormone)) {
    bgClass = 'bg-slate-800';
  }

  const title = showActual && rel.actualCorrelation !== undefined
    ? getCorrelationDescription(getShortName(h1), getShortName(h2), rel.actualCorrelation)
    : rel.description || `${getFullName(h1)} & ${getFullName(h2)}`;

  return (
    <HormoneTooltip hormoneId={h2} currentValue={value2}>
      <div
        role="gridcell"
        className={`aspect-square ${bgClass} rounded flex items-center justify-center cursor-help transition-all`}
        style={{ backgroundColor: bgColor }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        title={title}
        aria-label={`${getFullName(h1)} and ${getFullName(h2)}: ${rel.description || 'No significant relationship'}`}
      >
        {(rel.strength > 0 || rel.actualCorrelation !== undefined) && (
          <span className="text-sm" style={{ opacity }}>
            {icon || getRelationshipIcon(rel.relationship)}
          </span>
        )}
        {showActual && rel.actualCorrelation !== undefined && (
          <span className="absolute text-[10px] bottom-0.5 right-0.5 opacity-70">
            {rel.actualCorrelation > 0 ? '+' : ''}{rel.actualCorrelation.toFixed(2)}
          </span>
        )}
      </div>
    </HormoneTooltip>
  );
});

const HormoneCorrelationMatrix = memo(function HormoneCorrelationMatrix() {
  const { state } = useSimulationStore();
  const hormoneHistory = useSimulationStore(selectHormoneHistory);
  const [selectedHormone, setSelectedHormone] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ h1: number; h2: number } | null>(null);
  const [showActualCorrelations, setShowActualCorrelations] = useState(false);

  const currentValues = useMemo(() => {
    if (!state?.hormones) return {};
    const values: Record<string, number> = {};
    hormones.forEach(h => {
      const data = state.hormones[h as keyof typeof state.hormones];
      if (data) {
        values[h] = data.currentValue;
      }
    });
    return values;
  }, [state?.hormones]);

  // Calculate actual correlations from historical data
  const actualCorrelations = useMemo(() => {
    if (!hormoneHistory || showActualCorrelations === false) return {};

    // Build data arrays for each hormone
    const dataArrays: Record<string, number[]> = {};
    const maxLength = Math.max(...Object.values(hormoneHistory).map(h => h.length), 0);

    if (maxLength < 3) return {}; // Need at least 3 data points

    hormones.forEach(h => {
      const history = hormoneHistory[h] || [];
      dataArrays[h] = history;
    });

    return calculateCorrelationMatrix(dataArrays);
  }, [hormoneHistory, showActualCorrelations]);

  // Enhanced relationships with actual correlations
  const enhancedRelationships = useMemo(() => {
    const enhanced: CorrelationData[][] = HORMONE_RELATIONSHIPS.map(row =>
      row.map(cell => ({ ...cell }))
    );

    if (showActualCorrelations && actualCorrelations) {
      hormones.forEach((h1, i) => {
        hormones.forEach((h2, j) => {
          const actual = actualCorrelations[h1]?.[h2];
          if (actual !== undefined) {
            enhanced[i][j].actualCorrelation = actual;
          }
        });
      });
    }

    return enhanced;
  }, [showActualCorrelations, actualCorrelations]);

  // Memoize filtered relationships for selected hormone to avoid recalculation
  const selectedRelationships = useMemo(() => {
    if (!selectedHormone) return [];
    const selectedIndex = hormones.indexOf(selectedHormone);
    return hormones
      .map((h, idx) => ({ hormone: h, rel: enhancedRelationships[selectedIndex][idx] }))
      .filter(({ rel }) => rel.strength > 0 || (showActualCorrelations && rel.actualCorrelation !== undefined));
  }, [selectedHormone, enhancedRelationships, showActualCorrelations]);

  // Use useCallback for event handlers to prevent recreation
  const handleToggleHormone = useCallback((hormone: string) => {
    setSelectedHormone(prev => prev === hormone ? null : hormone);
  }, []);

  const handleCellHover = useCallback((h1: number, h2: number) => {
    setHoveredCell({ h1, h2 });
  }, []);

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5" role="region" aria-labelledby="correlation-matrix-title">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 id="correlation-matrix-title" className="text-lg font-semibold text-white">Hormone Correlation Matrix</h2>
        <div className="flex items-center gap-4">
          {/* Toggle between theoretical and actual correlations */}
          <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-1.5" role="group" aria-label="Correlation mode toggle">
            <span className="text-xs text-slate-400">Theoretical</span>
            <button
              onClick={() => setShowActualCorrelations(!showActualCorrelations)}
              className={`w-10 h-5 rounded-full transition-colors ${
                showActualCorrelations ? 'bg-blue-600' : 'bg-slate-600'
              }`}
              aria-pressed={showActualCorrelations}
              aria-label={`Show ${showActualCorrelations ? 'theoretical' : 'actual'} correlations`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  showActualCorrelations ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-xs text-slate-300">Actual Data</span>
          </div>

          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-slate-400">Synergistic</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-slate-400">Antagonistic</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-slate-400">Permissive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info text about current mode */}
      {showActualCorrelations && (
        <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
          Showing actual correlations calculated from your hormone history data.
          {Object.keys(actualCorrelations).length < hormones.length && (
            <span className="block mt-1 text-blue-400">
              Collecting more data points will improve accuracy...
            </span>
          )}
        </div>
      )}

      {/* Current values row */}
      <div className="mb-4 flex flex-wrap gap-2">
        {hormones.map(h => (
          <MatrixCell
            key={h}
            hormoneId={h}
            currentValue={currentValues[h] || 0}
            selectedHormone={selectedHormone}
            isHovered={false}
            onSelect={() => handleToggleHormone(h)}
          />
        ))}
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `40px repeat(${hormones.length}, 1fr)` }}
            role="table"
            aria-label="Hormone correlation matrix showing relationships between hormones"
          >
            {/* Header row */}
            <div />
            {hormones.map((h, i) => (
              <HormoneTooltip key={h} hormoneId={h} currentValue={currentValues[h] || 0}>
                <div
                  className="text-xs font-semibold text-slate-400 p-2 text-center cursor-help hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                  style={{ gridColumn: i + 2 }}
                  role="columnheader"
                >
                  {getShortName(h)}
                </div>
              </HormoneTooltip>
            ))}

            {/* Matrix rows */}
            {hormones.map((h1, i) => (
              <div key={h1} className="contents" role="row">
                {/* Row header */}
                <HormoneTooltip hormoneId={h1} currentValue={currentValues[h1] || 0}>
                  <div
                    className="text-xs font-semibold text-slate-400 p-2 text-right cursor-help hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                    role="rowheader"
                  >
                    {getShortName(h1)}
                  </div>
                </HormoneTooltip>

                {/* Cells */}
                {hormones.map((h2, j) => (
                  <CorrelationCell
                    key={h2}
                    h1={h1}
                    h2={h2}
                    rel={enhancedRelationships[i][j]}
                    selectedHormone={selectedHormone}
                    isHovered={hoveredCell?.h1 === i && hoveredCell?.h2 === j}
                    onHover={() => handleCellHover(i, j)}
                    onLeave={handleCellLeave}
                    value1={currentValues[h1] || 0}
                    value2={currentValues[h2] || 0}
                    showActual={showActualCorrelations}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected relationship detail */}
      {selectedHormone && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">
              {getFullName(selectedHormone)} Relationships
            </h4>
            <button
              onClick={() => setSelectedHormone(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {selectedRelationships.map(({ hormone, rel }) => (
              <div
                key={hormone}
                className={`p-2 rounded ${
                  rel.relationship === 'synergistic'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : rel.relationship === 'antagonistic'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{getFullName(hormone)}</span>
                  <span className={`font-medium ${
                    rel.relationship === 'synergistic'
                      ? 'text-green-400'
                      : rel.relationship === 'antagonistic'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}>
                    {rel.relationship.charAt(0).toUpperCase() + rel.relationship.slice(1)}
                  </span>
                </div>
                <p className="text-slate-400">{rel.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 text-xs text-slate-500">
        {showActualCorrelations ? (
          <p>
            Showing Pearson correlation coefficients calculated from your hormone history.
            Click on a hormone to see its relationships. Values range from -1 (strong negative) to +1 (strong positive).
          </p>
        ) : (
          <p>
            Showing theoretical hormone relationships based on physiological knowledge.
            Toggle to "Actual Data" to see correlations calculated from your hormone history.
            Click on a hormone to see its relationships. Hover over cells for details.
          </p>
        )}
      </div>
    </div>
  );
});

export default HormoneCorrelationMatrix;

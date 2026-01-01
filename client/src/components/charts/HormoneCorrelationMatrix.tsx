// ============================================================================
// METABOLIC SIMULATOR - HORMONE CORRELATION MATRIX COMPONENT
// ============================================================================

import { memo, useState, useMemo } from 'react';
import { useSimulationStore } from '../../state/store';
import { HORMONE_EDUCATION } from '../../data/hormoneEducation';
import HormoneTooltip from '../ui/HormoneTooltip';

interface CorrelationData {
  relationship: 'synergistic' | 'antagonistic' | 'permissive' | 'neutral';
  strength: number; // 0-1
  description: string;
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

const HormoneCorrelationMatrix = memo(function HormoneCorrelationMatrix() {
  const { state } = useSimulationStore();
  const [selectedHormone, setSelectedHormone] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ h1: number; h2: number } | null>(null);

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

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Hormone Correlation Matrix</h2>
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

      {/* Current values row */}
      <div className="mb-4 flex flex-wrap gap-2">
        {hormones.map(h => {
          const value = currentValues[h];
          const edu = HORMONE_EDUCATION[h];
          if (!value || !edu) return null;
          const isSelected = selectedHormone === h;
          return (
            <HormoneTooltip key={h} hormoneId={h} currentValue={value}>
              <button
                onClick={() => setSelectedHormone(isSelected ? null : h)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {edu.abbreviation}: {value.toFixed(1)}
              </button>
            </HormoneTooltip>
          );
        })}
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `40px repeat(${hormones.length}, 1fr)` }}>
            {/* Header row */}
            <div />
            {hormones.map((h, i) => (
              <HormoneTooltip key={h} hormoneId={h} currentValue={currentValues[h] || 0}>
                <div
                  className="text-xs font-semibold text-slate-400 p-2 text-center cursor-help hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                  style={{ gridColumn: i + 2 }}
                >
                  {getShortName(h)}
                </div>
              </HormoneTooltip>
            ))}

            {/* Matrix rows */}
            {hormones.map((h1, i) => (
              <div key={h1} className="contents">
                {/* Row header */}
                <HormoneTooltip hormoneId={h1} currentValue={currentValues[h1] || 0}>
                  <div className="text-xs font-semibold text-slate-400 p-2 text-right cursor-help hover:text-white hover:bg-slate-700/50 rounded transition-colors">
                    {getShortName(h1)}
                  </div>
                </HormoneTooltip>

                {/* Cells */}
                {hormones.map((h2, j) => {
                  const isSelected = selectedHormone === h1 || selectedHormone === h2;
                  const isHovered = hoveredCell?.h1 === i && hoveredCell?.h2 === j;
                  const rel = HORMONE_RELATIONSHIPS[i][j];

                  // Highlight row/column if hormone selected
                  let bgClass = 'bg-slate-900/50';
                  if (isSelected && rel.strength > 0) {
                    bgClass = 'bg-blue-500/20';
                  } else if (isHovered) {
                    bgClass = 'bg-slate-700/50';
                  } else if (selectedHormone && (h1 === selectedHormone || h2 === selectedHormone)) {
                    bgClass = 'bg-slate-800';
                  }

                  return (
                    <div
                      key={h2}
                      className={`aspect-square ${bgClass} rounded flex items-center justify-center cursor-help transition-all`}
                      style={{
                        backgroundColor: rel.strength > 0 ? getRelationshipColor(rel.relationship, rel.strength) : undefined,
                        gridColumn: j + 2
                      }}
                      onMouseEnter={() => setHoveredCell({ h1: i, h2: j })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={rel.description || `${getFullName(h1)} & ${getFullName(h2)}`}
                    >
                      {rel.strength > 0 && (
                        <span className="text-sm" style={{ opacity: 0.5 + rel.strength * 0.5 }}>
                          {getRelationshipIcon(rel.relationship)}
                        </span>
                      )}
                    </div>
                  );
                })}
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
            {hormones
              .map((h, idx) => ({ hormone: h, rel: HORMONE_RELATIONSHIPS[hormones.indexOf(selectedHormone)][idx] }))
              .filter(({ rel }) => rel.strength > 0)
              .map(({ hormone, rel }) => (
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
        <p>Click on a hormone to see its relationships. Hover over cells for details. Darker colors indicate stronger relationships.</p>
      </div>
    </div>
  );
});

export default HormoneCorrelationMatrix;

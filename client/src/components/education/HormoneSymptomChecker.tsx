// ============================================================================
// METABOLIC SIMULATOR - HORMONE SYMPTOM CHECKER COMPONENT
// ============================================================================

import { useState, useMemo, memo } from 'react';
import { HORMONE_EDUCATION, type HormoneEducation } from '../../data/hormoneEducation';
import { useSimulationStore } from '../../state/store';
import type { SimulationState } from '@metabol-sim/shared';

// All unique symptoms from the education data
interface SymptomMatch {
  hormone: string;
  hormoneId: string;
}

// Build symptom data maps at module level (not using hooks)
const buildSymptomMaps = () => {
  const highSymptoms = new Map<string, SymptomMatch[]>();
  const lowSymptoms = new Map<string, SymptomMatch[]>();

  Object.entries(HORMONE_EDUCATION).forEach(([id, hormone]) => {
    hormone.symptomsOfHigh.forEach(symptom => {
      const normalized = symptom.toLowerCase();
      if (!highSymptoms.has(normalized)) {
        highSymptoms.set(normalized, []);
      }
      highSymptoms.get(normalized)!.push({ hormone: hormone.name, hormoneId: id });
    });

    hormone.symptomsOfLow.forEach(symptom => {
      const normalized = symptom.toLowerCase();
      if (!lowSymptoms.has(normalized)) {
        lowSymptoms.set(normalized, []);
      }
      lowSymptoms.get(normalized)!.push({ hormone: hormone.name, hormoneId: id });
    });
  });

  return { highSymptoms, lowSymptoms };
};

const SYMPTOM_DATA = buildSymptomMaps();

// Common symptoms for quick selection
const COMMON_SYMPTOMS = [
  'Fatigue',
  'Weight gain',
  'Difficulty losing weight',
  'Muscle loss',
  'Poor sleep',
  'High blood sugar',
  'Low blood sugar',
  'Increased hunger',
  'Reduced appetite',
  'Anxiety',
  'Low libido',
  'Poor recovery',
  'Difficulty building muscle'
];

// Symptom checkbox item
const SymptomCheckbox = memo(function SymptomCheckbox({
  symptom,
  isSelected,
  onToggle,
  count
}: {
  symptom: string;
  isSelected: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected
          ? 'bg-blue-600/20 border-blue-500/50'
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
            isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-500'
          }`}>
            {isSelected && <span className="text-white text-xs">✓</span>}
          </div>
          <span className="text-sm text-white">{symptom}</span>
        </div>
        {count !== undefined && count > 0 && (
          <span className="text-xs text-slate-500">({count} hormones)</span>
        )}
      </div>
    </button>
  );
});

// Hormone match result
const HormoneMatchCard = memo(function HormoneMatchCard({
  hormone,
  highMatches,
  lowMatches,
  score,
  onViewDetails
}: {
  hormone: HormoneEducation;
  highMatches: string[];
  lowMatches: string[];
  score: number;
  onViewDetails: (hormoneId: string) => void;
}) {
  const { state } = useSimulationStore();
  const hormoneKey = hormone.id as keyof SimulationState['hormones'];
  const currentHormone = state?.hormones?.[hormoneKey];
  const currentValue = currentHormone?.currentValue || 0;

  const isHigh = currentValue > hormone.normalRange.max;
  const isLow = currentValue < hormone.normalRange.min;
  const isOptimal = !isHigh && !isLow;

  const statusClass = isLow ? 'bg-blue-500/20 text-blue-400' :
                      isHigh ? 'bg-red-500/20 text-red-400' :
                      'bg-green-500/20 text-green-400';

  const statusLabel = isLow ? 'Currently Low' : isHigh ? 'Currently High' : 'Currently Optimal';

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-white">{hormone.name}</h4>
            <p className="text-xs text-slate-400">{hormone.abbreviation}</p>
          </div>
          <div className="text-right">
            <div className={`text-xs px-2 py-1 rounded ${statusClass}`}>
              {statusLabel}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {score}% match
            </div>
          </div>
        </div>

        {highMatches.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-red-400 font-medium">High symptoms:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {highMatches.map((symptom, i) => (
                <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        {lowMatches.length > 0 && (
          <div>
            <span className="text-xs text-blue-400 font-medium">Low symptoms:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {lowMatches.map((symptom, i) => (
                <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onViewDetails(hormone.id)}
        className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 text-sm text-slate-300 transition-colors border-t border-slate-700"
      >
        Learn More About {hormone.name}
      </button>
    </div>
  );
});

// Main symptom checker component
const HormoneSymptomChecker = memo(function HormoneSymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all unique symptoms from the database
  const allSymptoms = useMemo(() => {
    const symptoms = new Set<string>();
    Object.values(HORMONE_EDUCATION).forEach(hormone => {
      hormone.symptomsOfHigh.forEach(s => symptoms.add(s));
      hormone.symptomsOfLow.forEach(s => symptoms.add(s));
    });
    return Array.from(symptoms).sort();
  }, []);

  // Filter symptoms based on search
  const filteredSymptoms = useMemo(() => {
    let symptoms = showAllSymptoms ? allSymptoms : COMMON_SYMPTOMS;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      symptoms = symptoms.filter(s => s.toLowerCase().includes(query));
    }
    return symptoms;
  }, [showAllSymptoms, searchQuery, allSymptoms]);

  // Calculate hormone matches based on selected symptoms
  const hormoneMatches = useMemo(() => {
    if (selectedSymptoms.size === 0) return [];

    const matches: Array<{
      hormone: HormoneEducation;
      highMatches: string[];
      lowMatches: string[];
      score: number;
    }> = [];

    Object.entries(HORMONE_EDUCATION).forEach(([id, hormone]) => {
      const highMatches = hormone.symptomsOfHigh.filter(s =>
        selectedSymptoms.has(s.toLowerCase()) || selectedSymptoms.has(s)
      );
      const lowMatches = hormone.symptomsOfLow.filter(s =>
        selectedSymptoms.has(s.toLowerCase()) || selectedSymptoms.has(s)
      );

      if (highMatches.length > 0 || lowMatches.length > 0) {
        const totalPossible = hormone.symptomsOfHigh.length + hormone.symptomsOfLow.length;
        const score = Math.round(((highMatches.length + lowMatches.length) / totalPossible) * 100);
        matches.push({
          hormone,
          highMatches,
          lowMatches,
          score
        });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  }, [selectedSymptoms]);

  const toggleSymptom = (symptom: string) => {
    const newSelected = new Set(selectedSymptoms);
    const normalized = symptom.toLowerCase();
    if (newSelected.has(normalized)) {
      newSelected.delete(normalized);
    } else {
      newSelected.add(normalized);
    }
    setSelectedSymptoms(newSelected);
  };

  const clearAll = () => {
    setSelectedSymptoms(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Symptom Checker</h2>
        <p className="text-slate-400">
          Select symptoms you're experiencing to see which hormones might be imbalanced.
          This is for educational purposes only.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - symptom selection */}
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <input
              type="text"
              placeholder="Search symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:outline-none"
            />

            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setShowAllSymptoms(!showAllSymptoms)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {showAllSymptoms ? 'Show common' : 'Show all symptoms'}
              </button>
              {selectedSymptoms.size > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear all ({selectedSymptoms.size})
                </button>
              )}
            </div>
          </div>

          {/* Symptom list */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-3">
              Select Symptoms ({selectedSymptoms.size} selected)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSymptoms.length > 0 ? filteredSymptoms.map(symptom => (
                <SymptomCheckbox
                  key={symptom}
                  symptom={symptom}
                  isSelected={selectedSymptoms.has(symptom.toLowerCase())}
                  onToggle={() => toggleSymptom(symptom)}
                />
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No symptoms match "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right side - results */}
        <div className="space-y-4">
          {hormoneMatches.length > 0 ? (
            <>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Potential Hormone Imbalances
                </h3>
                <p className="text-xs text-slate-400">
                  Based on your selected symptoms, these hormones may be worth investigating.
                </p>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {hormoneMatches.map(match => (
                  <HormoneMatchCard
                    key={match.hormone.id}
                    hormone={match.hormone}
                    highMatches={match.highMatches}
                    lowMatches={match.lowMatches}
                    score={match.score}
                    onViewDetails={(hormoneId) => {
                      // Navigate to hormone explorer
                      document.dispatchEvent(new CustomEvent('navigate-to-hormone', { detail: hormoneId }));
                    }}
                  />
                ))}
              </div>

              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                <p className="text-xs text-blue-300">
                  💡 <strong>Tip:</strong> Use the Hormone Explorer tab to learn more about these hormones
                  and how to optimize their levels through lifestyle changes.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 text-center">
              <span className="text-4xl mb-4 block">🩺</span>
              <h3 className="text-lg font-semibold text-white mb-2">No Symptoms Selected</h3>
              <p className="text-sm text-slate-400">
                Select symptoms from the list to see which hormones might be imbalanced.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default HormoneSymptomChecker;

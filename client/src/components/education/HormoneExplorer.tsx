// ============================================================================
// METABOLIC SIMULATOR - HORMONE EXPLORER COMPONENT
// ============================================================================

import { useState, useMemo, memo } from 'react';
import { HORMONE_EDUCATION, type HormoneEducation } from '../../data/hormoneEducation';
import { useSimulationStore } from '../../state/store';
import type { SimulationState } from '@metabol-sim/shared';

// Category icons and colors
const CATEGORY_CONFIG: Record<HormoneEducation['category'], { icon: string; bgClass: string }> = {
  storage: { icon: '📦', bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  mobilization: { icon: '⚡', bgClass: 'bg-green-500/20 text-green-400 border-green-500/30' },
  anabolic: { icon: '💪', bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  catabolic: { icon: '🔥', bgClass: 'bg-red-500/20 text-red-400 border-red-500/30' },
  appetite: { icon: '🍽️', bgClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  stress: { icon: '😰', bgClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

// Relationship badge colors
const RELATIONSHIP_CONFIG: Record<HormoneEducation['relatedHormones'][number]['relationship'], { bgClass: string; label: string }> = {
  synergistic: { bgClass: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Synergistic' },
  antagonistic: { bgClass: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Antagonistic' },
  permissive: { bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Permissive' },
};

// Hormone card in the list
const HormoneListCard = memo(function HormoneListCard({
  hormone,
  isActive,
  onClick
}: {
  hormone: HormoneEducation;
  isActive: boolean;
  onClick: () => void;
}) {
  const config = CATEGORY_CONFIG[hormone.category];
  const { state } = useSimulationStore();
  const hormoneKey = hormone.id as keyof SimulationState['hormones'];
  const currentHormone = state?.hormones?.[hormoneKey];
  const currentValue = currentHormone?.currentValue || 0;

  const status = currentValue < hormone.normalRange.min ? 'low' :
                 currentValue > hormone.normalRange.max ? 'high' : 'optimal';

  const statusConfig = {
    low: { bgClass: 'bg-blue-500/20 text-blue-400', label: 'Low' },
    optimal: { bgClass: 'bg-green-500/20 text-green-400', label: 'Optimal' },
    high: { bgClass: 'bg-red-500/20 text-red-400', label: 'High' }
  }[status];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        isActive
          ? 'bg-blue-600/20 border-blue-500/50'
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{config.icon}</span>
            <h4 className="font-semibold text-white">{hormone.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded ${config.bgClass} border`}>
              {hormone.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${statusConfig.bgClass}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{hormone.description}</p>
        </div>
        <svg className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

// Factor list item
const FactorItem = memo(function FactorItem({
  type,
  factors
}: {
  type: 'increase' | 'decrease';
  factors: string[];
}) {
  const isIncrease = type === 'increase';
  return (
    <div className="flex-1">
      <h5 className={`text-sm font-semibold mb-2 ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
        {isIncrease ? 'Increases' : 'Decreases'} {isIncrease ? '↑' : '↓'}
      </h5>
      <ul className="space-y-1">
        {factors.map((factor, i) => (
          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
            <span className="text-slate-500">•</span>
            <span>{factor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

// Symptom list item
const SymptomItem = memo(function SymptomItem({
  type,
  symptoms
}: {
  type: 'high' | 'low';
  symptoms: string[];
}) {
  const isHigh = type === 'high';
  return (
    <div className="flex-1">
      <h5 className={`text-sm font-semibold mb-2 ${isHigh ? 'text-red-400' : 'text-blue-400'}`}>
        When {isHigh ? 'High' : 'Low'}
      </h5>
      <ul className="space-y-1">
        {symptoms.map((symptom, i) => (
          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
            <span className="text-slate-500">•</span>
            <span>{symptom}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

// Related hormone card
const RelatedHormoneCard = memo(function RelatedHormoneCard({
  related,
  onNavigate
}: {
  related: HormoneEducation['relatedHormones'][number];
  onNavigate: (hormoneId: string) => void;
}) {
  const config = RELATIONSHIP_CONFIG[related.relationship];
  const hormoneData = HORMONE_EDUCATION[related.hormone];

  if (!hormoneData) return null;

  return (
    <button
      onClick={() => onNavigate(related.hormone)}
      className="w-full text-left p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-all"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-medium text-white text-sm">{hormoneData.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded border ${config.bgClass}`}>
          {config.label}
        </span>
      </div>
      <p className="text-xs text-slate-400">{related.description}</p>
    </button>
  );
});

// Main detail view
const HormoneDetailView = memo(function HormoneDetailView({
  hormone,
  onBack,
  onNavigateToHormone
}: {
  hormone: HormoneEducation;
  onBack: () => void;
  onNavigateToHormone: (hormoneId: string) => void;
}) {
  const config = CATEGORY_CONFIG[hormone.category];
  const { state } = useSimulationStore();
  const hormoneKey = hormone.id as keyof SimulationState['hormones'];
  const currentHormone = state?.hormones?.[hormoneKey];
  const currentValue = currentHormone?.currentValue || 0;

  const statusPercent = ((currentValue - hormone.normalRange.min) / (hormone.normalRange.max - hormone.normalRange.min)) * 100;
  const isLow = currentValue < hormone.normalRange.min;
  const isHigh = currentValue > hormone.normalRange.max;
  const isOptimal = !isLow && !isHigh;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to all hormones</span>
      </button>

      {/* Header */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-4xl">{config.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{hormone.name}</h2>
                <p className="text-sm text-slate-400">{hormone.abbreviation} • {hormone.unit}</p>
              </div>
            </div>
            <span className={`inline-block px-3 py-1 rounded border ${config.bgClass}`}>
              {hormone.category}
            </span>
          </div>
        </div>

        <p className="text-slate-300 mb-4">{hormone.description}</p>

        {/* Current value display */}
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Your Current Level</span>
            <span className={`text-sm font-semibold ${
              isLow ? 'text-blue-400' : isHigh ? 'text-red-400' : 'text-green-400'
            }`}>
              {isLow ? 'Low' : isHigh ? 'High' : 'Optimal'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isLow ? 'bg-blue-500' : isHigh ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, statusPercent))}%` }}
              />
            </div>
            <span className="text-lg font-mono font-bold text-white">
              {currentValue.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Normal: {hormone.normalRange.min} - {hormone.normalRange.max}</span>
          </div>
        </div>
      </div>

      {/* Function */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">Function</h3>
        <p className="text-slate-300">{hormone.function}</p>
      </div>

      {/* Factors that affect levels */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3">What Affects Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FactorItem type="increase" factors={hormone.factorsThatIncrease} />
          <FactorItem type="decrease" factors={hormone.factorsThatDecrease} />
        </div>
      </div>

      {/* Symptoms */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3">Symptoms of Imbalance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SymptomItem type="high" symptoms={hormone.symptomsOfHigh} />
          <SymptomItem type="low" symptoms={hormone.symptomsOfLow} />
        </div>
      </div>

      {/* Optimal for */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3">Optimal For</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {hormone.optimalFor.map((item, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Timing info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-400 mb-1">Time to Peak</h4>
          <p className="text-white">{hormone.timeToPeak}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-400 mb-1">Half Life</h4>
          <p className="text-white">{hormone.halfLife}</p>
        </div>
      </div>

      {/* Related hormones */}
      {hormone.relatedHormones.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">Related Hormones</h3>
          <div className="grid grid-cols-1 gap-2">
            {hormone.relatedHormones.map((related, i) => (
              <RelatedHormoneCard
                key={i}
                related={related}
                onNavigate={onNavigateToHormone}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Main explorer component
const HormoneExplorer = memo(function HormoneExplorer() {
  const [selectedHormoneId, setSelectedHormoneId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredHormones = useMemo(() => {
    let hormones = Object.values(HORMONE_EDUCATION);
    if (categoryFilter !== 'all') {
      hormones = hormones.filter(h => h.category === categoryFilter);
    }
    return hormones;
  }, [categoryFilter]);

  const selectedHormone = selectedHormoneId ? HORMONE_EDUCATION[selectedHormoneId] : null;

  if (selectedHormone) {
    return (
      <HormoneDetailView
        hormone={selectedHormone}
        onBack={() => setSelectedHormoneId(null)}
        onNavigateToHormone={setSelectedHormoneId}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Hormone Explorer</h2>
        <p className="text-slate-400">
          Click on any hormone to learn more about its functions, effects, and relationships.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            categoryFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All ({Object.values(HORMONE_EDUCATION).length})
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
          const count = Object.values(HORMONE_EDUCATION).filter(h => h.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>{config.icon}</span>
              <span className="capitalize">{cat}</span>
              <span className="text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Hormone list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredHormones.map((hormone) => (
          <HormoneListCard
            key={hormone.id}
            hormone={hormone}
            isActive={false}
            onClick={() => setSelectedHormoneId(hormone.id)}
          />
        ))}
      </div>
    </div>
  );
});

export default HormoneExplorer;

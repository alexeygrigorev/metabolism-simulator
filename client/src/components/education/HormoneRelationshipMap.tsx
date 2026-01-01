// ============================================================================
// METABOLIC SIMULATOR - HORMONE RELATIONSHIP MAP COMPONENT
// ============================================================================

import { useState, useMemo, memo } from 'react';
import { HORMONE_EDUCATION, type HormoneEducation } from '../../data/hormoneEducation';

// Relationship type configuration
const RELATIONSHIP_CONFIG: Record<'synergistic' | 'antagonistic' | 'permissive', {
  icon: string;
  color: string;
  bgClass: string;
  label: string;
  description: string;
}> = {
  synergistic: {
    icon: '🤝',
    color: '#22c55e',
    bgClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    label: 'Synergistic',
    description: 'These hormones work together to enhance their effects'
  },
  antagonistic: {
    icon: '⚔️',
    color: '#ef4444',
    bgClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: 'Antagonistic',
    description: 'These hormones have opposing effects and balance each other'
  },
  permissive: {
    icon: '🔓',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    label: 'Permissive',
    description: 'One hormone enables the action of another'
  }
};

// Relationship legend item
const RelationshipLegend = memo(function RelationshipLegend() {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {Object.entries(RELATIONSHIP_CONFIG).map(([key, config]) => (
        <div key={key} className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded border ${config.bgClass} text-xs`}>
            {config.icon} {config.label}
          </span>
        </div>
      ))}
    </div>
  );
});

// Relationship card
const RelationshipCard = memo(function RelationshipCard({
  fromHormone,
  toHormone,
  relationship
}: {
  fromHormone: HormoneEducation;
  toHormone: HormoneEducation;
  relationship: HormoneEducation['relatedHormones'][number];
}) {
  const config = RELATIONSHIP_CONFIG[relationship.relationship];

  return (
    <div className={`bg-slate-800/50 rounded-lg p-4 border ${config.bgClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className={`text-sm font-medium ${config.bgClass.split(' ')[1]}`}>
          {config.label}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-white">{fromHormone.name}</span>
        <span className="text-slate-500">↔</span>
        <span className="text-sm font-medium text-white">{toHormone.name}</span>
      </div>
      <p className="text-xs text-slate-400 mt-2">{relationship.description}</p>
    </div>
  );
});

// Hormone node in the grid
const HormoneNode = memo(function HormoneNode({
  hormone,
  isActive,
  onClick
}: {
  hormone: HormoneEducation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all text-left ${
        isActive
          ? 'bg-blue-600/30 border-blue-500/50 ring-2 ring-blue-500/30'
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
      }`}
    >
      <div className="font-medium text-white text-sm">{hormone.name}</div>
      <div className="text-xs text-slate-500">{hormone.abbreviation}</div>
    </button>
  );
});

// Detailed relationship view
const RelationshipDetailView = memo(function RelationshipDetailView({
  hormone,
  onBack
}: {
  hormone: HormoneEducation;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to relationship map</span>
      </button>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2">{hormone.name} Relationships</h2>
        <p className="text-slate-400">{hormone.description}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          How {hormone.name} Interacts with Other Hormones
        </h3>

        {hormone.relatedHormones.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {hormone.relatedHormones.map((rel, i) => {
              const relatedHormone = HORMONE_EDUCATION[rel.hormone];
              if (!relatedHormone) return null;
              return (
                <RelationshipCard
                  key={i}
                  fromHormone={hormone}
                  toHormone={relatedHormone}
                  relationship={rel}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 text-center">
            <p className="text-slate-400">No direct relationships documented for this hormone.</p>
          </div>
        )}
      </div>

      {/* Key relationships summary */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-2">Key Takeaways</h4>
        <ul className="text-xs text-slate-300 space-y-1">
          {hormone.relatedHormones.filter(r => r.relationship === 'antagonistic').length > 0 && (
            <li>
              • Balances with {hormone.relatedHormones.filter(r => r.relationship === 'antagonistic').length} other hormone(s)
            </li>
          )}
          {hormone.relatedHormones.filter(r => r.relationship === 'synergistic').length > 0 && (
            <li>
              • Works together with {hormone.relatedHormones.filter(r => r.relationship === 'synergistic').length} hormone(s)
            </li>
          )}
        </ul>
      </div>
    </div>
  );
});

// Relationship grid view
const RelationshipGridView = memo(function RelationshipGridView({
  onSelectHormone
}: {
  onSelectHormone: (hormone: HormoneEducation) => void;
}) {
  const [filterType, setFilterType] = useState<'all' | 'synergistic' | 'antagonistic' | 'permissive'>('all');

  const hormones = Object.values(HORMONE_EDUCATION);

  // Get all relationships
  const allRelationships = useMemo(() => {
    const relationships: Array<{
      from: HormoneEducation;
      to: HormoneEducation;
      rel: HormoneEducation['relatedHormones'][number];
    }> = [];

    Object.entries(HORMONE_EDUCATION).forEach(([id, hormone]) => {
      hormone.relatedHormones.forEach(rel => {
        const relatedHormone = HORMONE_EDUCATION[rel.hormone];
        if (relatedHormone) {
          relationships.push({ from: hormone, to: relatedHormone, rel });
        }
      });
    });

    if (filterType !== 'all') {
      return relationships.filter(r => r.rel.relationship === filterType);
    }
    return relationships;
  }, [filterType]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Hormone Relationship Map</h2>
        <p className="text-slate-400">
          Explore how hormones interact with each other. Understanding these relationships helps you see the bigger picture of metabolic health.
        </p>
      </div>

      {/* Legend and filter */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <RelationshipLegend />

        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-slate-400">Filter:</span>
          {Object.entries(RELATIONSHIP_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterType(filterType === key ? 'all' : key as any)}
              className={`px-3 py-1 rounded text-xs transition-all ${
                filterType === key
                  ? config.bgClass
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {config.label}
            </button>
          ))}
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded text-xs transition-all ${
              filterType === 'all'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* All hormones grid */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-3">Click a hormone to see its relationships</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {hormones.map(hormone => (
            <HormoneNode
              key={hormone.id}
              hormone={hormone}
              isActive={false}
              onClick={() => onSelectHormone(hormone)}
            />
          ))}
        </div>
      </div>

      {/* Key relationship patterns */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-3">Key Metabolic Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-1">🔄 Insulin-Glucagon Seesaw</h4>
            <p className="text-xs text-slate-400">
              These hormones work in opposition to maintain blood glucose balance. When one rises, the other falls.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-1">⚔️ Stress-Anabolic Battle</h4>
            <p className="text-xs text-slate-400">
              Cortisol and testosterone have an antagonistic relationship. Chronic stress can suppress muscle growth.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-1">🤝 Growth Cascade</h4>
            <p className="text-xs text-slate-400">
              Growth hormone stimulates IGF-1 production, working together to promote tissue repair and muscle growth.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-1">⚖️ Appetite Balance</h4>
            <p className="text-xs text-slate-400">
              Leptin (satiety) and ghrelin (hunger) act as opposing signals to regulate appetite and energy intake.
            </p>
          </div>
        </div>
      </div>

      {/* Relationship stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-white">{hormones.length}</div>
          <div className="text-xs text-slate-500">Hormones</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-green-400">
            {allRelationships.filter(r => r.rel.relationship === 'synergistic').length}
          </div>
          <div className="text-xs text-slate-500">Synergistic</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-red-400">
            {allRelationships.filter(r => r.rel.relationship === 'antagonistic').length}
          </div>
          <div className="text-xs text-slate-500">Antagonistic</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {allRelationships.filter(r => r.rel.relationship === 'permissive').length}
          </div>
          <div className="text-xs text-slate-500">Permissive</div>
        </div>
      </div>
    </div>
  );
});

// Main component
const HormoneRelationshipMap = memo(function HormoneRelationshipMap() {
  const [selectedHormone, setSelectedHormone] = useState<HormoneEducation | null>(null);

  if (selectedHormone) {
    return <RelationshipDetailView hormone={selectedHormone} onBack={() => setSelectedHormone(null)} />;
  }

  return <RelationshipGridView onSelectHormone={setSelectedHormone} />;
});

export default HormoneRelationshipMap;

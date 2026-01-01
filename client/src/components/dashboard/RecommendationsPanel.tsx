// ============================================================================
// METABOLIC SIMULATOR - RECOMMENDATIONS PANEL COMPONENT
// ============================================================================
// Displays personalized, actionable recommendations based on metabolic state

import { memo, useState } from 'react';
import { useRecommendations, type RecommendationPriority } from '../../hooks/useRecommendations';
import { useSimulationStore } from '../../state/store';

// Priority badge component
const PriorityBadge = memo(function PriorityBadge({ priority }: { priority: RecommendationPriority }) {
  const config = {
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Critical' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'High' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Medium' },
    low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Low' },
  };

  const { bg, text, border, label } = config[priority];

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${bg} ${text} ${border} font-medium`}>
      {label}
    </span>
  );
});

// Category icon
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    nutrition: '🍽️',
    exercise: '🏃',
    sleep: '😴',
    stress: '🧘',
    hormones: '🧬',
    lifestyle: '✨',
  };
  return icons[category] || '💡';
};

// Individual recommendation card
const RecommendationCard = memo(function RecommendationCard({
  recommendation,
  isExpanded,
  onToggle
}: {
  recommendation: ReturnType<typeof useRecommendations>['recommendations'][number];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { addToast } = useSimulationStore();

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToast(`Action noted: ${recommendation.title}`, 'success');
  };

  return (
    <div
      className={`bg-slate-800/50 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-slate-700/30 ${
        recommendation.priority === 'critical'
          ? 'border-red-500/50 shadow-lg shadow-red-500/10'
          : recommendation.priority === 'high'
          ? 'border-orange-500/30'
          : 'border-slate-700'
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="p-3 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{recommendation.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-white text-sm">{recommendation.title}</h4>
            <PriorityBadge priority={recommendation.priority} />
          </div>

          <p className={`text-xs text-slate-400 mt-1 ${isExpanded ? '' : 'line-clamp-1'}`}>
            {recommendation.description}
          </p>

          {isExpanded && (
            <div className="mt-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <span className="text-xs text-blue-400">💡 {recommendation.impact}</span>
              {recommendation.actionable && (
                <button
                  onClick={handleAction}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
                >
                  Mark as Done
                </button>
              )}
            </div>
          )}
        </div>

        <svg
          className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

// Filter chips
const FilterChip = memo(function FilterChip({
  label,
  count,
  isActive,
  onClick,
  color
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        isActive
          ? `${color} text-white shadow-lg`
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
      }`}
    >
      {label} ({count})
    </button>
  );
});

// Main panel component
const RecommendationsPanel = memo(function RecommendationsPanel() {
  const { recommendations, summary, quickInsight, isLoading } = useRecommendations();
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter recommendations
  const filteredRecs = recommendations.filter((rec) =>
    filter === 'all' ? true : rec.priority === filter
  );

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-2">Recommendations</h2>
        <p className="text-sm text-slate-400">Loading recommendations...</p>
      </div>
    );
  }

  const hasRecommendations = recommendations.length > 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>💡</span>
            <span>Personalized Recommendations</span>
          </h2>
          {hasRecommendations && (
            <span className={`text-xs px-2 py-1 rounded ${
              summary.critical > 0
                ? 'bg-red-500/20 text-red-400'
                : summary.high > 0
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {summary.actionable} actionable
            </span>
          )}
        </div>

        {/* Quick Insight */}
        <p className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-2.5">
          {quickInsight}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {hasRecommendations ? (
          <>
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              <FilterChip
                label="All"
                count={recommendations.length}
                isActive={filter === 'all'}
                onClick={() => setFilter('all')}
                color="bg-slate-600"
              />
              <FilterChip
                label="Critical"
                count={summary.critical}
                isActive={filter === 'critical'}
                onClick={() => setFilter('critical')}
                color="bg-red-600"
              />
              <FilterChip
                label="High"
                count={summary.high}
                isActive={filter === 'high'}
                onClick={() => setFilter('high')}
                color="bg-orange-600"
              />
              <FilterChip
                label="Medium"
                count={summary.medium}
                isActive={filter === 'medium'}
                onClick={() => setFilter('medium')}
                color="bg-yellow-600"
              />
              <FilterChip
                label="Low"
                count={summary.low}
                isActive={filter === 'low'}
                onClick={() => setFilter('low')}
                color="bg-green-600"
              />
            </div>

            {/* Recommendations list */}
            <div className="space-y-2">
              {filteredRecs.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  isExpanded={expandedId === rec.id}
                  onToggle={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                />
              ))}
            </div>

            {filteredRecs.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No recommendations match the selected filter.
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <span className="text-4xl mb-2 block">✨</span>
            <p className="text-slate-400 text-sm">
              No specific recommendations at this time. Your metabolic state is well balanced!
            </p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      {hasRecommendations && (
        <div className="p-3 bg-slate-900/50 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            Click on a recommendation to see more details and impact
          </p>
        </div>
      )}
    </div>
  );
});

export default RecommendationsPanel;

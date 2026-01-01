// ============================================================================
// METABOLIC SIMULATOR - BIOMARKER TRENDS PANEL
// ============================================================================

import { memo } from 'react';
import { useMetabolicInsights } from '../../hooks/useMetabolicInsights';

const BiomarkerTrendsPanel = memo(function BiomarkerTrendsPanel() {
  const { biomarkerTrends } = useMetabolicInsights();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'optimal':
        return { bgClass: 'bg-green-500/20', textClass: 'text-green-400', label: 'Optimal' };
      case 'elevated':
        return { bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400', label: 'Elevated' };
      case 'depressed':
        return { bgClass: 'bg-blue-500/20', textClass: 'text-blue-400', label: 'Low' };
      case 'critical':
        return { bgClass: 'bg-red-500/20', textClass: 'text-red-400', label: 'Critical' };
      default:
        return { bgClass: 'bg-slate-500/20', textClass: 'text-slate-400', label: status };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Biomarker Trends</h3>
        <p className="text-sm text-slate-400">
          Track how your hormone levels compare to baseline and optimal ranges.
        </p>
      </div>

      {biomarkerTrends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {biomarkerTrends.map((trend, i) => {
            const statusConfig = getStatusConfig(trend.status);
            const isImproving = trend.trend === 'improving';
            const isDeclining = trend.trend === 'declining';

            return (
              <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{trend.hormone}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-white">
                      {trend.current.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-500">Baseline: {trend.baseline.toFixed(1)}</div>
                  </div>
                </div>

                {/* Visual bar showing current vs baseline */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${isImproving ? 'bg-green-500' : isDeclining ? 'bg-red-500' : 'bg-slate-500'}`}
                        style={{ width: `${Math.min(100, Math.abs(trend.percentChange) * 2)}%` }}
                      />
                    </div>
                    <span className="text-xs whitespace-nowrap">
                      {getTrendIcon(trend.trend)}
                      <span className={isImproving ? 'text-green-400' : isDeclining ? 'text-red-400' : 'text-slate-400'}>
                        {trend.percentChange > 0 ? '+' : ''}{trend.percentChange.toFixed(0)}%
                      </span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {trend.trend === 'improving' && 'Moving toward optimal range'}
                    {trend.trend === 'declining' && 'Moving away from optimal range'}
                    {trend.trend === 'stable' && 'Stable over time'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          No biomarker data available yet.
        </div>
      )}

      {/* Educational note */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Understanding Trends</span>
        </h4>
        <p className="text-xs text-slate-300">
          <strong>Optimal:</strong> Within normal range. <strong>Elevated:</strong> Above normal.
          <strong>Low:</strong> Below normal. <strong>Critical:</strong> Significantly outside range.
          Track changes over time to see how your lifestyle affects your biomarkers.
        </p>
      </div>
    </div>
  );
});

export default BiomarkerTrendsPanel;

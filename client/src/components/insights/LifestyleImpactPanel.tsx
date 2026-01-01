// ============================================================================
// METABOLIC SIMULATOR - LIFESTYLE IMPACT PANEL
// ============================================================================

import { memo } from 'react';
import { useMetabolicInsights } from '../../hooks/useMetabolicInsights';

const LifestyleImpactPanel = memo(function LifestyleImpactPanel() {
  const { lifestyleImpacts } = useMetabolicInsights();

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'exercise':
        return { icon: '🏃', label: 'Exercise', color: 'blue' };
      case 'sleep':
        return { icon: '😴', label: 'Sleep', color: 'purple' };
      case 'nutrition':
        return { icon: '🍽️', label: 'Nutrition', color: 'green' };
      case 'stress':
        return { icon: '😰', label: 'Stress', color: 'red' };
      default:
        return { icon: '📊', label: category, color: 'slate' };
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Lifestyle Impact Analysis</h3>
        <p className="text-sm text-slate-400">
          See how your daily habits are affecting your metabolic health.
        </p>
      </div>

      {lifestyleImpacts.length > 0 ? (
        <div className="space-y-3">
          {lifestyleImpacts.map((impact, i) => {
            const config = getCategoryConfig(impact.category);
            const isPositive = impact.impact > 0;
            const impactColor = isPositive ? 'green' : 'red';

            return (
              <div key={i} className={`bg-slate-800/50 rounded-lg p-4 border border-slate-700`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{config.label}</h4>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold ${
                          isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isPositive ? '+' : ''}{impact.impact}%
                        </span>
                        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                          {isPositive ? '↑' : '↓'}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 mb-3">{impact.description}</p>

                    {/* Impact bar */}
                    <div className="bg-slate-700 rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(impact.impact)}%` }}
                      />
                    </div>

                    {/* Recommendations */}
                    {impact.recommendations.length > 0 && (
                      <div className="border-t border-slate-700 pt-3">
                        <div className="text-xs text-slate-500 mb-1">Recommendations:</div>
                        <ul className="space-y-1">
                          {impact.recommendations.map((rec, ri) => (
                            <li key={ri} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-blue-400">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <span className="text-4xl mb-2 block">📊</span>
          <p>Log activities to see lifestyle impact analysis.</p>
        </div>
      )}

      {/* Educational tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
          <h4 className="text-xs font-semibold text-white mb-1">💪 Exercise</h4>
          <p className="text-xs text-slate-400">
            Regular exercise improves insulin sensitivity, boosts testosterone, and enhances metabolic flexibility.
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
          <h4 className="text-xs font-semibold text-white mb-1">😴 Sleep</h4>
          <p className="text-xs text-slate-400">
            Quality sleep is essential for hormone balance, recovery, and optimal metabolic function.
          </p>
        </div>
      </div>
    </div>
  );
});

export default LifestyleImpactPanel;

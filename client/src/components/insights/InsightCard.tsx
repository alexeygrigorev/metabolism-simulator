// ============================================================================
// METABOLIC SIMULATOR - INSIGHT CARD
// ============================================================================

import { memo } from 'react';
import type { Insight } from '../../hooks/useMetabolicInsights';

const InsightCard = memo(function InsightCard({ insight }: { insight: Insight }) {
  const config = {
    success: {
      icon: '✅',
      bgClass: 'bg-green-500/20',
      textClass: 'text-green-400',
      borderClass: 'border-green-500/30',
      label: 'Success'
    },
    warning: {
      icon: '⚠️',
      bgClass: 'bg-yellow-500/20',
      textClass: 'text-yellow-400',
      borderClass: 'border-yellow-500/30',
      label: 'Warning'
    },
    info: {
      icon: 'ℹ️',
      bgClass: 'bg-blue-500/20',
      textClass: 'text-blue-400',
      borderClass: 'border-blue-500/30',
      label: 'Info'
    },
    alert: {
      icon: '🚨',
      bgClass: 'bg-red-500/20',
      textClass: 'text-red-400',
      borderClass: 'border-red-500/30',
      label: 'Alert'
    }
  }[insight.type];

  return (
    <div className={`bg-slate-800/50 rounded-lg p-4 border ${config.borderClass} transition-all hover:bg-slate-700/30`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded ${config.bgClass} ${config.textClass} border`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">{insight.description}</p>
          {insight.relatedHormone && (
            <div className="mt-2 text-xs text-slate-500">
              Related: <span className="text-slate-400">{insight.relatedHormone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default InsightCard;

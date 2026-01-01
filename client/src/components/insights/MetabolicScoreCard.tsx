// ============================================================================
// METABOLIC SIMULATOR - METABOLIC SCORE CARD
// ============================================================================

import { memo } from 'react';
import { useMetabolicInsights } from '../../hooks/useMetabolicInsights';

const MetabolicScoreCard = memo(function MetabolicScoreCard() {
  const { metabolicScore } = useMetabolicInsights();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const circumference = 2 * Math.PI * 54; // radius = 54
  const offset = circumference - (metabolicScore.overall / 100) * circumference;

  return (
    <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-700"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`text-${getScoreBg(metabolicScore.overall).replace('bg-', '')} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(metabolicScore.overall)}`}>
                {metabolicScore.overall}
              </div>
              <div className="text-xs text-slate-500">/ 100</div>
            </div>
          </div>
        </div>

        {/* Score info */}
        <div className="flex-1">
          <div className="text-sm text-slate-500 mb-1">Overall Metabolic Score</div>
          <div className={`text-lg font-semibold ${getScoreColor(metabolicScore.overall)}`}>
            {getScoreLabel(metabolicScore.overall)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-sm ${
              metabolicScore.trend === 'improving' ? 'text-green-400' :
              metabolicScore.trend === 'declining' ? 'text-red-400' :
              'text-slate-400'
            }`}>
              {metabolicScore.trend === 'improving' ? '↑' :
               metabolicScore.trend === 'declining' ? '↓' : '→'}
            </span>
            <span className="text-xs text-slate-400 capitalize">{metabolicScore.trend}</span>
          </div>
        </div>
      </div>

      {/* Category bars */}
      <div className="mt-4 space-y-2">
        {Object.entries(metabolicScore.categories).map(([key, value]) => {
          const labels: Record<string, string> = {
            hormonal: 'Hormonal',
            metabolic: 'Metabolic',
            lifestyle: 'Lifestyle',
            recovery: 'Recovery'
          };
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-20">{labels[key]}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    value >= 80 ? 'bg-green-500' :
                    value >= 60 ? 'bg-yellow-500' :
                    value >= 40 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MetabolicScoreCard;

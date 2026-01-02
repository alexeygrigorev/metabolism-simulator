// ============================================================================
// METABOLIC SIMULATOR - RECOVERY & READINESS DASHBOARD COMPONENT
// ============================================================================

import { useEffect, useState, useMemo } from 'react';
import { useRecoveryStore, RecoveryLevel, RecoveryRecommendation } from '../../state/recoveryStore';
import { useSimulationStore } from '../../state/store';

// Recovery score colors
const recoveryColors: Record<RecoveryLevel, { bg: string; text: string; border: string }> = {
  excellent: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  good: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  moderate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  poor: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
};

// Training readiness config
const trainingReadinessConfig = {
  'go-hard': {
    label: 'Go Hard',
    icon: '🚀',
    color: 'text-emerald-400',
    description: 'Excellent recovery - ready for intense training',
  },
  'moderate': {
    label: 'Moderate',
    icon: '💪',
    color: 'text-green-400',
    description: 'Good recovery - normal training recommended',
  },
  'easy': {
    label: 'Take Easy',
    icon: '🌱',
    color: 'text-yellow-400',
    description: 'Lower recovery - light activity only',
  },
  'rest': {
    label: 'Rest Day',
    icon: '🛏️',
    color: 'text-red-400',
    description: 'Poor recovery - rest recommended',
  },
};

// Factor icons
const factorIcons = {
  sleep: '😴',
  stress: '😰',
  muscleRecovery: '💪',
  glycogen: '🔋',
  hormoneBalance: '🧬',
  hydration: '💧',
};

const factorLabels = {
  sleep: 'Sleep Quality',
  stress: 'Stress Management',
  muscleRecovery: 'Muscle Recovery',
  glycogen: 'Energy Stores',
  hormoneBalance: 'Hormone Balance',
  hydration: 'Hydration',
};

// Priority icons
const priorityIcons = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

export default function RecoveryDashboard({ className = '' }: { className?: string }) {
  const [record, setRecord] = useState<ReturnType<typeof useRecoveryStore>['calculateTodayRecovery'] | null>(null);
  const [trends, setTrends] = useState<ReturnType<typeof useRecoveryStore>['getTrends'] | null>(null);
  const [recentRecords, setRecentRecords] = useState<ReturnType<typeof useRecoveryStore>['getRecentRecords'] | null>(null);

  const calculateTodayRecovery = useRecoveryStore((state) => state.calculateTodayRecovery);
  const getTrends = useRecoveryStore((state) => state.getTrends);
  const getRecentRecords = useRecoveryStore((state) => state.getRecentRecords);

  useEffect(() => {
    // Initial calculation
    const todayRecord = calculateTodayRecovery();
    setRecord(todayRecord);
    setTrends(getTrends());
    setRecentRecords(getRecentRecords(7));

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      setRecord(calculateTodayRecovery());
      setTrends(getTrends());
    }, 30000);

    return () => clearInterval(interval);
  }, [calculateTodayRecovery, getTrends, getRecentRecords]);

  // Get top 3 recommendations by priority - call this before any early returns
  const topRecommendations = useMemo(() => {
    if (!record) return [];
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...record.recommendations].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 3);
  }, [record?.recommendations]);

  if (!record) {
    return (
      <div className={`bg-slate-800/50 rounded-lg border border-slate-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
          <div className="h-24 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const colors = recoveryColors[record.level];
  const readiness = trainingReadinessConfig[record.trainingReadiness];

  return (
    <div className={`bg-slate-800/50 rounded-lg border border-slate-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span>📊</span>
          Recovery & Readiness
        </h2>
        {recentRecords && recentRecords.length > 1 && (
          <span className={`text-sm ${trends?.trend === 'up' ? 'text-emerald-400' : trends?.trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
            {trends?.trend === 'up' && '↑ Improving'}
            {trends?.trend === 'down' && '↓ Declining'}
            {trends?.trend === 'stable' && '→ Stable'}
          </span>
        )}
      </div>

      {/* Overall Score and Training Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Recovery Score */}
        <div className={`${colors.bg} rounded-lg border ${colors.border} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Recovery Score</span>
            <span className={`text-xs px-2 py-1 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
              {record.level.toUpperCase()}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold ${colors.text}`}>{record.overallScore}</span>
            <span className={`text-sm ${colors.text} mb-1`}>/ 100</span>
          </div>
          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                record.overallScore >= 80 ? 'bg-emerald-500' :
                record.overallScore >= 60 ? 'bg-yellow-500' :
                record.overallScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${record.overallScore}%` }}
            />
          </div>
        </div>

        {/* Training Readiness */}
        <div className={`rounded-lg border p-4 ${readiness.color.replace('text-', 'bg-').replace('400', '500/20')} border-${readiness.color.replace('text-', '').replace('400', '500')}/50`}>
          <div className="text-slate-300 text-sm mb-2">Training Readiness</div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{readiness.icon}</span>
            <div>
              <div className={`text-xl font-bold ${readiness.color}`}>{readiness.label}</div>
              <div className="text-slate-400 text-sm">{readiness.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Factors */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">RECOVERY FACTORS</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(record.factors).map(([key, value]) => {
            const score = value as number;
            const isGood = score >= 70;
            const isWarning = score >= 40 && score < 70;
            const isPoor = score < 40;

            return (
              <div
                key={key}
                className={`rounded-lg p-3 ${
                  isGood ? 'bg-emerald-500/10' : isWarning ? 'bg-yellow-500/10' : 'bg-red-500/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{factorIcons[key as keyof typeof factorIcons]}</span>
                  <span className={`text-sm font-medium ${
                    isGood ? 'text-emerald-400' : isWarning ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {score.toFixed(0)}%
                  </span>
                </div>
                <div className="text-slate-400 text-xs">
                  {factorLabels[key as keyof typeof factorLabels]}
                </div>
                <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isGood ? 'bg-emerald-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {topRecommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">RECOMMENDATIONS</h3>
          <div className="space-y-2">
            {topRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{priorityIcons[rec.priority]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium">{rec.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{rec.description}</p>
                    {rec.action && (
                      <p className="text-blue-400 text-xs">💡 {rec.action}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trend */}
      {recentRecords && recentRecords.length > 1 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Weekly Average</span>
            <span className="text-white font-medium">
              {trends?.averageScore ? Math.round(trends.averageScore) : 0}
              <span className="text-slate-500 text-sm"> / 100</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// METABOLIC SIMULATOR - STREAKS PANEL COMPONENT
// ============================================================================
//
// Displays user's current streaks for various health habits to motivate
// consistency. Shows supplement streaks, water goal streaks, and more.
// ============================================================================

import { memo, useMemo } from 'react';
import { useAchievementsStore } from '../../state/achievementsStore';

interface Streak {
  id: string;
  name: string;
  icon: string;
  current: number;
  target: number;
  color: string;
  unit: string;
}

const StreaksPanel = memo(function StreaksPanel() {
  const { stats } = useAchievementsStore();

  const streaks = useMemo((): Streak[] => {
    const today = new Date().toDateString();
    const lastSupplement = stats.lastSupplementDate;
    const lastActive = stats.lastActiveDate;

    // Calculate if streaks are active
    const supplementStreakActive = lastSupplement === today || lastSupplement === new Date(Date.now() - 86400000).toDateString();
    const waterGoalActive = lastActive === today;

    return [
      {
        id: 'supplements',
        name: 'Supplements',
        icon: '💊',
        current: supplementStreakActive ? stats.supplementsStreak : 0,
        target: 7,
        color: 'from-purple-500 to-pink-500',
        unit: 'days',
      },
      {
        id: 'water',
        name: 'Hydration',
        icon: '💧',
        current: waterGoalActive ? stats.waterGoalDays : 0,
        target: 7,
        color: 'from-cyan-500 to-blue-500',
        unit: 'days',
      },
      {
        id: 'protein',
        name: 'Protein Target',
        icon: '🥩',
        current: stats.proteinStreak,
        target: 5,
        color: 'from-orange-500 to-red-500',
        unit: 'times',
      },
    ];
  }, [stats]);

  const getStreakStatus = (streak: Streak) => {
    const percent = Math.min(100, (streak.current / streak.target) * 100);
    if (percent >= 100) return 'complete';
    if (percent >= 50) return 'good';
    if (percent > 0) return 'started';
    return 'inactive';
  };

  const hasActiveStreaks = streaks.some(s => s.current > 0);

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden" data-testid="streaks-panel">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h3 className="text-lg font-semibold text-white">Current Streaks</h3>
        </div>
      </div>

      <div className="p-4">
        {!hasActiveStreaks ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">💪</span>
            <p className="text-slate-400 text-sm">Start tracking to build your streaks!</p>
            <p className="text-slate-500 text-xs mt-1">Consistency is key to reaching your goals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {streaks.map(streak => {
              const status = getStreakStatus(streak);
              const percent = Math.min(100, (streak.current / streak.target) * 100);

              return (
                <div key={streak.id} className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{streak.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{streak.name}</div>
                        <div className="text-xs text-slate-500">
                          {streak.current > 0 ? `${streak.current} ${streak.unit}` : 'Not started'}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${
                      status === 'complete' ? 'text-green-400' :
                      status === 'good' ? 'text-blue-400' :
                      status === 'started' ? 'text-yellow-400' :
                      'text-slate-500'
                    }`}>
                      {status === 'complete' && (
                        <span className="text-xs">🔥 On fire!</span>
                      )}
                      {status === 'good' && (
                        <span className="text-xs">Keep going!</span>
                      )}
                      {status === 'started' && (
                        <span className="text-xs">Building...</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${streak.color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Milestones */}
                  <div className="flex justify-between mt-2">
                    {[0, 25, 50, 75, 100].map(milestone => {
                      const isReached = percent >= milestone;
                      return (
                        <div
                          key={milestone}
                          className={`w-2 h-2 rounded-full ${
                            isReached ? `bg-gradient-to-r ${streak.color}` : 'bg-slate-700'
                          }`}
                          title={`${milestone}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Motivational tip */}
        {hasActiveStreaks && (
          <div className="mt-4 p-3 bg-slate-900/30 rounded-lg">
            <p className="text-xs text-slate-400 flex items-start gap-2">
              <span>💡</span>
              <span>
                {streaks.filter(s => getStreakStatus(s) === 'complete').length >= 2
                  ? "Amazing work! You're building healthy habits that stick."
                  : streaks.some(s => getStreakStatus(s) === 'complete')
                    ? "Great progress! Keep the momentum going."
                    : "Every day counts. Small consistent actions lead to big results."}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default StreaksPanel;

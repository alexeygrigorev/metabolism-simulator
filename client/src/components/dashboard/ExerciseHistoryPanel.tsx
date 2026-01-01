// ============================================================================
// METABOLIC SIMULATOR - EXERCISE HISTORY PANEL
// ============================================================================
//
// Displays recent workout sessions with volume, intensity, and exercise details.
// Shows progress trends and allows viewing individual workout breakdowns.
// ============================================================================

import { useState, useMemo, memo } from 'react';
import { useSimulationStore } from '../../state/store';
import { CATEGORY_INFO, MUSCLE_INFO } from '../../data/exerciseDatabase';
import type { ExerciseSession } from '@metabol-sim/shared';

interface ExerciseHistoryPanelProps {
  showEmpty?: boolean;
  maxSessions?: number;
}

// Format duration (seconds to readable string)
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// Format date for display
function formatSessionDate(date: Date): string {
  const now = new Date();
  const sessionDate = new Date(date);
  const diffMs = now.getTime() - sessionDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return sessionDate.toLocaleDateString();
}

// Individual session card
const SessionCard = memo(function SessionCard({
  session,
  onToggle
}: {
  session: ExerciseSession;
  onToggle: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate session stats
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const avgRPE = session.perceivedExertion || 0;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium">{formatSessionDate(session.startTime)}</span>
            <span className="text-xs text-slate-500">
              {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span>{session.exercises.length} exercises</span>
            <span>{totalSets} sets</span>
            <span>{session.totalVolume.toLocaleString()} kg volume</span>
            <span className="text-orange-400">RPE {avgRPE.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-slate-400">
          <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 border-t border-slate-700 space-y-2">
          {session.exercises.map((ex, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded p-2 text-xs">
              <div className="font-medium text-white mb-1">Exercise {idx + 1}</div>
              <div className="grid grid-cols-4 gap-2 text-slate-400">
                <div>
                  <span className="block text-slate-500">Set</span>
                  {ex.sets.map((_, i) => (
                    <div key={i} className="text-white">{i + 1}</div>
                  ))}
                </div>
                <div>
                  <span className="block text-slate-500">Reps</span>
                  {ex.sets.map((set, i) => (
                    <div key={i} className="text-white">{set.reps || '-'}</div>
                  ))}
                </div>
                <div>
                  <span className="block text-slate-500">Load</span>
                  {ex.sets.map((set, i) => (
                    <div key={i} className="text-white">{set.load}kg</div>
                  ))}
                </div>
                <div>
                  <span className="block text-slate-500">RPE</span>
                  {ex.sets.map((set, i) => (
                    <div key={i} className={
                      set.rpe >= 9 ? 'text-red-400' :
                      set.rpe >= 7 ? 'text-orange-400' :
                      set.rpe >= 5 ? 'text-yellow-400' :
                      'text-green-400'
                    }>{set.rpe}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Weekly stats summary
const WeeklyStats = memo(function WeeklyStats({
  sessions
}: {
  sessions: ExerciseSession[];
}) {
  const weekStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekSessions = sessions.filter(s => new Date(s.startTime) >= weekAgo);

    return {
      sessionCount: weekSessions.length,
      totalVolume: weekSessions.reduce((sum, s) => sum + s.totalVolume, 0),
      avgRPE: weekSessions.length > 0
        ? weekSessions.reduce((sum, s) => sum + s.perceivedExertion, 0) / weekSessions.length
        : 0,
      totalSets: weekSessions.reduce((sum, s) =>
        sum + s.exercises.reduce((eSum, e) => eSum + e.sets.length, 0), 0
      ),
    };
  }, [sessions]);

  return (
    <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50">
      <h4 className="text-sm font-semibold text-white mb-2">This Week</h4>
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{weekStats.sessionCount}</div>
          <div className="text-xs text-slate-500">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{weekStats.totalSets}</div>
          <div className="text-xs text-slate-500">Sets</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">
            {(weekStats.totalVolume / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-slate-500">Volume (kg)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-400">
            {weekStats.avgRPE > 0 ? weekStats.avgRPE.toFixed(1) : '-'}
          </div>
          <div className="text-xs text-slate-500">Avg RPE</div>
        </div>
      </div>
    </div>
  );
});

// Main ExerciseHistoryPanel component
const ExerciseHistoryPanel = memo(function ExerciseHistoryPanel({
  showEmpty = true,
  maxSessions = 10
}: ExerciseHistoryPanelProps) {
  const { state } = useSimulationStore();
  const sessions = state?.recentExercises || [];

  const displaySessions = useMemo(() => {
    return sessions
      .slice(-maxSessions)
      .reverse(); // Show most recent first
  }, [sessions, maxSessions]);

  const hasSessions = sessions.length > 0;

  if (!hasSessions && !showEmpty) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h2 className="text-lg font-semibold text-white">Exercise History</h2>
        </div>
        <span className="text-xs text-slate-500">{sessions.length} total sessions</span>
      </div>

      {!hasSessions ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💪</div>
          <h3 className="text-white font-semibold mb-1">No Workouts Logged</h3>
          <p className="text-sm text-slate-400">
            Start logging your workouts to track progress over time.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Use the Log Workout button to add your first session.
          </p>
        </div>
      ) : (
        <>
          <WeeklyStats sessions={sessions} />

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-white mb-3">Recent Sessions</h3>
            {displaySessions.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                No recent sessions
              </div>
            ) : (
              <div className="space-y-2">
                {displaySessions.map((session) => (
                  <SessionCard key={session.id} session={session} onToggle={() => {}} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default ExerciseHistoryPanel;

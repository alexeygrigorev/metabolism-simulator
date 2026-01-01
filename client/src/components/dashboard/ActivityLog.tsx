// ============================================================================
// METABOLIC SIMULATOR - ACTIVITY LOG COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { selectActivities } from '../../state/selectors';
import { memo, useMemo } from 'react';

// Extended interfaces to include 'name' property added by demo mode
interface MealWithName {
  id: string;
  time: Date | string;
  name?: string;
  totalMacros?: {
    carbohydrates?: number;
    proteins?: number;
    fats?: number;
    fiber?: number;
    water?: number;
  };
}

interface ExerciseWithName {
  id: string;
  startTime: Date | string;
  name?: string;
  category?: string;
  exercises?: Array<{ sets: Array<{ duration: number }> }>;
  perceivedExertion?: number;
}

interface SleepEntry {
  id: string;
  endTime: Date | string;
  duration: number;
  quality: number;
  cycles?: number;
}

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: 'meal' | 'exercise' | 'sleep';
  description: string;
  details: string;
  icon: string;
}

const typeColors = {
  meal: 'bg-green-500/20 text-green-400 border-green-500/30',
  exercise: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sleep: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  stress: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Moved outside component to avoid recreation on each render
function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

const ActivityLog = memo(function ActivityLog() {
  // Use stable selector - only re-renders when activities change
  const { meals, exercises, sleep } = useSimulationStore(selectActivities);

  const activities = useMemo(() => {
    const entries: ActivityLogEntry[] = [];

    // Add meals
    meals.forEach((meal: MealWithName) => {
      const timestamp = typeof meal.time === 'string' ? meal.time : meal.time.toISOString();
      const macros = meal.totalMacros;
      const calories = macros
        ? (macros.carbohydrates || 0) * 4 +
          (macros.proteins || 0) * 4 +
          (macros.fats || 0) * 9
        : 0;

      entries.push({
        id: meal.id,
        timestamp,
        type: 'meal',
        description: meal.name || 'Meal',
        details: `${Math.round(calories)} kcal • ${macros?.carbohydrates || 0}g carbs`,
        icon: '🍽️',
      });
    });

    // Add exercises
    exercises.forEach((exercise: ExerciseWithName) => {
      const timestamp = typeof exercise.startTime === 'string'
        ? exercise.startTime
        : exercise.startTime.toISOString();
      const duration = exercise.exercises?.[0]?.sets?.reduce(
        (sum: number, s: { duration: number }) => sum + s.duration, 0
      ) || 0;
      const durationMin = Math.round(duration / 60);

      entries.push({
        id: exercise.id,
        timestamp,
        type: 'exercise',
        description: exercise.name || 'Exercise',
        details: `${durationMin} min • RPE ${exercise.perceivedExertion?.toFixed(1) || 'N/A'}`,
        icon: '💪',
      });
    });

    // Add sleep
    sleep.forEach((sleepEntry: SleepEntry) => {
      const timestamp = typeof sleepEntry.endTime === 'string'
        ? sleepEntry.endTime
        : sleepEntry.endTime.toISOString();
      const cycles = sleepEntry.cycles || Math.floor(sleepEntry.duration * 1.5);

      entries.push({
        id: sleepEntry.id,
        timestamp,
        type: 'sleep',
        description: 'Sleep',
        details: `${sleepEntry.duration}h • Quality ${(sleepEntry.quality * 100).toFixed(0)}% • ${cycles} cycles`,
        icon: '😴',
      });
    });

    // Sort by timestamp (newest first)
    return entries.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10); // Show last 10 activities
  }, [meals, exercises, sleep]);

  if (activities.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center" data-testid="activity-log-panel">
        <p className="text-slate-400 text-sm">No activities logged yet</p>
        <p className="text-slate-500 text-xs mt-1">Log a meal or exercise to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden" data-testid="activity-log-panel">
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <h3 className="font-semibold text-white">Activity Log</h3>
      </div>

      <div className="divide-y divide-slate-700">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="px-4 py-3 hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white truncate">{activity.description}</span>
                  <span className="text-xs text-slate-400 shrink-0">{formatTime(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{activity.details}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded border ${typeColors[activity.type]}`}>
                {activity.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ActivityLog;

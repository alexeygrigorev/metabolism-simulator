// ============================================================================
// METABOLIC SIMULATOR - DAILY GOALS PANEL COMPONENT
// ============================================================================

import { memo, useState } from 'react';
import { useSimulationStore } from '../../state/store';
import { DAILY_GOALS, getGoalProgress, GOAL_CATEGORIES, DailyGoal } from '../../data/dailyGoals';

const DailyGoals = memo(function DailyGoals() {
  const { state } = useSimulationStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const filteredGoals = DAILY_GOALS.filter(
    (goal) => selectedCategory === 'all' || goal.category === selectedCategory
  );

  const totalGoals = filteredGoals.length;
  const completedGoals = filteredGoals.filter((goal) => getGoalProgress(goal, state).complete).length;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const GoalCard = memo(function GoalCard({ goal }: { goal: DailyGoal }) {
    const progress = getGoalProgress(goal, state);
    const isExpanded = expandedGoal === goal.id;

    return (
      <div
        className={`bg-slate-800/50 border rounded-lg overflow-hidden transition-all ${
          progress.complete
            ? 'border-green-500/50 bg-green-500/5'
            : 'border-slate-700/50'
        }`}
      >
        <button
          onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
          className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{goal.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-white">{goal.name}</h4>
                {progress.complete && (
                  <span className="text-green-400 text-sm">✓ Complete</span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1">{goal.description}</p>

              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{goal.advice}</span>
                  <span>
                    {goal.id === 'insulin-sensitivity'
                      ? `${progress.current} ${goal.unit} (lower is better)`
                      : `${progress.current} / ${goal.target} ${goal.unit}`
                    }
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress.complete ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            </div>
            <span className="text-slate-500">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-slate-700/50 mt-2 pt-3">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-blue-400 mb-2">💡 Educational Info</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{goal.educationalInfo}</p>
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Daily Goals</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{overallProgress}%</div>
          <div className="text-xs text-slate-400">{completedGoals}/{totalGoals} complete</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {GOAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No goals in this category</p>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        )}
      </div>
    </div>
  );
});

export default DailyGoals;

// ============================================================================
// METABOLIC SIMULATOR - ACTIVE SCENARIO PANEL COMPONENT
// ============================================================================

import { memo, useEffect } from 'react';
import useScenarioStore from '../../state/scenarioStore';
import { useSimulationStore } from '../../state/store';

const ActiveScenarioPanel = memo(function ActiveScenarioPanel() {
  const {
    activeScenario,
    currentPhaseIndex,
    advancePhase,
    abandonScenario,
    completionPercentage,
  } = useScenarioStore();

  const { state } = useSimulationStore();

  if (!activeScenario) return null;

  const currentPhase = activeScenario.phases[currentPhaseIndex];
  const isLastPhase = currentPhaseIndex === activeScenario.phases.length - 1;
  const phaseComplete = currentPhase?.objectives.every(obj => obj.completed) ?? false;

  // Auto-check objectives based on simulation state
  useEffect(() => {
    if (!state || !currentPhase) return;

    const { updateObjective, completeObjective } = useScenarioStore.getState();

    // Check each objective
    currentPhase.objectives.forEach((objective) => {
      if (objective.completed) return;

      switch (objective.description) {
        case 'Log a resistance exercise':
        case 'Log a high-protein meal':
        case 'Log a balanced meal':
        case 'Log low-protein meal':
        case 'Log high-leucine meal':
        case 'Log a high-carb meal':
        case 'Log 3 protein-containing meals':
          if (state.recentMeals.length > 0) {
            completeObjective(objective.id);
          }
          break;

        case 'Log a resistance exercise':
        case 'Log 8 hours of quality sleep':
        case 'Apply high stress':
        case 'Skip sleep or log poor sleep':
          // These are checked by action logging
          break;

        case 'Observe testosterone increase':
        case 'Observe insulin spike':
        case 'Observe blunted response':
        case 'Observe glucagon increase':
        case 'Observe minimal mTOR activation':
        case 'Achieve mTOR activation':
        case 'Observe elevated cortisol':
        case 'Reduce cortisol to baseline':
        case 'Reduce cortisol below baseline':
        case 'Reduce sleep debt':
        case 'Keep insulin elevated':
        case 'Increase fat oxidation':
        case 'Log 8 hours of sleep':
          // These are checked by hormone/energy state
          break;
      }
    });
  }, [state, currentPhase]);

  const handleAdvance = () => {
    if (isLastPhase) {
      // Scenario complete
      abandonScenario();
    } else {
      advancePhase();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-900/20 border-b border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">{activeScenario.name}</h3>
            <p className="text-xs text-blue-300">
              Phase {currentPhaseIndex + 1} of {activeScenario.phases.length}
            </p>
          </div>
          <button
            onClick={abandonScenario}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ✕ Exit
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Phase content */}
      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-1">{currentPhase.name}</h4>
          <p className="text-sm text-slate-300">{currentPhase.description}</p>
        </div>

        {/* Objectives */}
        <div className="space-y-2 mb-4">
          <h5 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Objectives</h5>
          {currentPhase.objectives.map((objective) => (
            <div
              key={objective.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                objective.completed
                  ? 'bg-green-900/30 border border-green-500/30'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  objective.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {objective.completed ? '✓' : (
                  <span className="text-xs">{Math.round((objective.current / objective.target) * 100)}%</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${objective.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                  {objective.description}
                </p>
                <p className="text-xs text-slate-500">
                  {objective.current} / {objective.target} {objective.unit}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Educational tip */}
        {activeScenario.educationalContent && (
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 mb-4">
            <h5 className="text-sm font-semibold text-cyan-400 mb-1">
              💡 {activeScenario.educationalContent.title}
            </h5>
            <p className="text-xs text-slate-400">{activeScenario.educationalContent.body}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAdvance}
            disabled={!phaseComplete}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              phaseComplete
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLastPhase ? 'Complete Scenario' : 'Next Phase'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ActiveScenarioPanel;

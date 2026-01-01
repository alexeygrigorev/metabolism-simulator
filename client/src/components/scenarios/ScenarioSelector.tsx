// ============================================================================
// METABOLIC SIMULATOR - SCENARIO SELECTOR COMPONENT
// ============================================================================

import { memo, useState } from 'react';
import { SCENARIOS, Scenario } from '../../data/scenarios';
import useScenarioStore from '../../state/scenarioStore';

const CATEGORY_COLORS = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const DIFFICULTY_STARS = (level: number) => '⭐'.repeat(level);

interface ScenarioCardProps {
  scenario: Scenario;
  isCompleted: boolean;
  onStart: () => void;
}

const ScenarioCard = memo(function ScenarioCard({ scenario, isCompleted, onStart }: ScenarioCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`bg-slate-800 rounded-lg border ${
        isCompleted ? 'border-green-500/50' : 'border-slate-700'
      } hover:border-slate-600 transition-all overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">{scenario.name}</h3>
              {isCompleted && <span className="text-green-400">✓</span>}
            </div>
            <p className="text-sm text-slate-400">{scenario.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span
            className={`px-2 py-0.5 text-xs rounded border ${CATEGORY_COLORS[scenario.category]}`}
          >
            {scenario.category}
          </span>
          <span className="text-xs text-yellow-400">{DIFFICULTY_STARS(scenario.difficulty)}</span>
          <span className="text-xs text-slate-500 ml-auto">{scenario.estimatedTime}</span>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-700 animate-fadeIn">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Learning Objectives</h4>
            <ul className="space-y-1">
              {scenario.phases.map((phase) => (
                <li key={phase.id} className="text-xs text-slate-400">
                  • {phase.name}
                </li>
              ))}
            </ul>

            <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
              <h4 className="text-sm font-semibold text-cyan-400 mb-1">
                {scenario.educationalContent.title}
              </h4>
              <p className="text-xs text-slate-400 mb-2">{scenario.educationalContent.body}</p>
              <ul className="space-y-0.5">
                {scenario.educationalContent.keyPoints.map((point, i) => (
                  <li key={i} className="text-xs text-slate-500 flex gap-2">
                    <span>→</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
          >
            {isCompleted ? 'Retry' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
});

const ScenarioSelector = memo(function ScenarioSelector() {
  const { startScenario, abandonScenario, activeScenario, completedScenarios } = useScenarioStore();

  if (activeScenario) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Scenario in Progress</h3>
        <p className="text-slate-400 mb-4">
          You are currently in: <span className="text-blue-400">{activeScenario.name}</span>
        </p>
        <button
          onClick={abandonScenario}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Abandon Scenario
        </button>
      </div>
    );
  }

  const beginnerScenarios = SCENARIOS.filter(s => s.category === 'beginner');
  const intermediateScenarios = SCENARIOS.filter(s => s.category === 'intermediate');
  const advancedScenarios = SCENARIOS.filter(s => s.category === 'advanced');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Educational Scenarios</h2>
          <p className="text-sm text-slate-400 mt-1">
            Learn metabolism through guided interactive scenarios
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Completed</div>
          <div className="text-2xl font-bold text-green-400">
            {completedScenarios.length}/{SCENARIOS.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${(completedScenarios.length / SCENARIOS.length) * 100}%` }}
        />
      </div>

      {/* Beginner Scenarios */}
      {beginnerScenarios.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-green-400 mb-3">Beginner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beginnerScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isCompleted={completedScenarios.includes(scenario.id)}
                onStart={() => startScenario(scenario.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Intermediate Scenarios */}
      {intermediateScenarios.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-yellow-400 mb-3">Intermediate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intermediateScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isCompleted={completedScenarios.includes(scenario.id)}
                onStart={() => startScenario(scenario.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Advanced Scenarios */}
      {advancedScenarios.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-red-400 mb-3">Advanced</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advancedScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isCompleted={completedScenarios.includes(scenario.id)}
                onStart={() => startScenario(scenario.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ScenarioSelector;

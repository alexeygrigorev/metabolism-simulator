// ============================================================================
// METABOLIC SIMULATOR - SCENARIO STORE
// ============================================================================

import { create } from 'zustand';
import { Scenario, ScenarioPhase, ScenarioObjective } from '../data/scenarios';

interface ScenarioStore {
  // State
  activeScenario: Scenario | null;
  currentPhaseIndex: number;
  completedScenarios: string[];
  startTime: number | null;
  phaseStartTime: number | null;

  // Actions
  startScenario: (scenarioId: string) => void;
  advancePhase: () => void;
  updateObjective: (objectiveId: string, value: number) => void;
  completeObjective: (objectiveId: string) => void;
  abandonScenario: () => void;
  resetProgress: () => void;

  // Computed
  currentPhase: ScenarioPhase | null;
  isPhaseComplete: boolean;
  isScenarioComplete: boolean;
  completionPercentage: number;
}

const useScenarioStore = create<ScenarioStore>((set, get) => ({
  // Initial state
  activeScenario: null,
  currentPhaseIndex: 0,
  completedScenarios: [],
  startTime: null,
  phaseStartTime: null,

  // Computed values
  get currentPhase() {
    const { activeScenario, currentPhaseIndex } = get();
    if (!activeScenario) return null;
    return activeScenario.phases[currentPhaseIndex] || null;
  },
  get isPhaseComplete() {
    const { currentPhase } = get();
    if (!currentPhase) return false;
    return currentPhase.objectives.every(obj => obj.completed);
  },
  get isScenarioComplete() {
    const { activeScenario, currentPhaseIndex } = get();
    if (!activeScenario) return false;
    return currentPhaseIndex >= activeScenario.phases.length;
  },
  get completionPercentage() {
    const { activeScenario, currentPhaseIndex } = get();
    if (!activeScenario) return 0;
    const totalObjectives = activeScenario.phases.reduce(
      (sum, phase) => sum + phase.objectives.length,
      0
    );
    const completedObjectives = activeScenario.phases.reduce(
      (sum, phase, index) => {
        if (index < currentPhaseIndex) {
          return sum + phase.objectives.length;
        }
        if (index === currentPhaseIndex) {
          return sum + phase.objectives.filter(obj => obj.completed).length;
        }
        return sum;
      },
      0
    );
    return Math.round((completedObjectives / totalObjectives) * 100);
  },

  // Actions
  startScenario: (scenarioId: string) => {
    const { SCENARIOS } = require('../data/scenarios');
    const scenario = SCENARIOS.find((s: Scenario) => s.id === scenarioId);

    if (!scenario) return;

    // Apply initial conditions
    const { useSimulationStore } = require('./store');
    const simulationStore = useSimulationStore.getState();

    // Reset state for scenario
    simulationStore.reset();

    set({
      activeScenario: scenario,
      currentPhaseIndex: 0,
      startTime: Date.now(),
      phaseStartTime: Date.now(),
    });
  },

  advancePhase: () => {
    const { activeScenario, currentPhaseIndex } = get();
    if (!activeScenario) return;

    const nextPhase = currentPhaseIndex + 1;
    if (nextPhase < activeScenario.phases.length) {
      set({
        currentPhaseIndex: nextPhase,
        phaseStartTime: Date.now(),
      });
    } else {
      // Scenario complete
      set((state) => ({
        completedScenarios: [...state.completedScenarios, activeScenario.id],
      }));
    }
  },

  updateObjective: (objectiveId: string, value: number) => {
    const { activeScenario, currentPhaseIndex } = get();
    if (!activeScenario) return;

    const phase = activeScenario.phases[currentPhaseIndex];
    const objective = phase?.objectives.find(obj => obj.id === objectiveId);

    if (objective) {
      objective.current = Math.min(value, objective.target);
      objective.completed = objective.current >= objective.target;
      set({ activeScenario: { ...activeScenario } });
    }
  },

  completeObjective: (objectiveId: string) => {
    const { activeScenario, currentPhaseIndex } = get();
    if (!activeScenario) return;

    const phase = activeScenario.phases[currentPhaseIndex];
    const objective = phase?.objectives.find(obj => obj.id === objectiveId);

    if (objective) {
      objective.current = objective.target;
      objective.completed = true;
      set({ activeScenario: { ...activeScenario } });
    }
  },

  abandonScenario: () => {
    set({
      activeScenario: null,
      currentPhaseIndex: 0,
      startTime: null,
      phaseStartTime: null,
    });
  },

  resetProgress: () => {
    set({
      activeScenario: null,
      currentPhaseIndex: 0,
      completedScenarios: [],
      startTime: null,
      phaseStartTime: null,
    });
  },
}));

export default useScenarioStore;

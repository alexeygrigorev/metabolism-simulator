// ============================================================================
// METABOLIC SIMULATOR - SELECTOR UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '../../src/state/store';
import * as selectors from '../../src/state/selectors';

describe('Store Selectors', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  describe('Base State Selectors', () => {
    it('selectState should return the simulation state', () => {
      const state = useSimulationStore.getState();
      expect(selectors.selectState(state)).toBe(null);

      // Set up a minimal state
      useSimulationStore.getState().setState({
        id: 'test',
        userId: 'user1',
        timestamp: new Date(),
        gameTime: new Date(),
        user: {
          id: 'user1',
          age: 30,
          biologicalSex: 'male' as const,
          weight: 75,
          height: 180,
          bodyFatPercentage: 0.18,
          activityLevel: 1.55,
        },
        energy: {
          bmr: 1750,
          tdee: 2700,
          caloriesConsumed: 0,
          caloriesBurned: 0,
          netCalories: 0,
          carbohydrates: { consumed: 0, burned: 0, target: 300 },
          proteins: { consumed: 0, burned: 0, target: 120 },
          fats: { consumed: 0, burned: 0, target: 75 },
          glycogen: { muscle: 1, liver: 1, capacity: { muscle: 400, liver: 100 } },
          bodyFat: 13.5,
          leanMass: 61.5,
          substrateUtilization: {
            fatOxidation: 0.1,
            glucoseOxidation: 0.08,
            proteinOxidation: 0.001,
            metabolicState: 'fasted' as const,
          },
        },
        hormones: {
          insulin: { currentValue: 5, baseline: 5, peak: 5, trough: 5, trend: 0, sensitivity: 1 },
          glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
          cortisol: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
          growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
          igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
          epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
          leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        },
        muscle: {
          totalMass: 61.5,
          skeletalMuscleMass: 58.5,
          fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
          proteinBalance: { synthesisRate: 0.01, breakdownRate: 0.01, netBalance: 0, anabolicWindowRemaining: 0 },
          satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
          mtorSignaling: { activity: 0, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
          recoveryStatus: { muscleDamage: 0, glycogenRepletion: 1, inflammation: 0, centralFatigue: 0, sleepDebt: 0 },
          trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
        },
        recentMeals: [],
        recentExercises: [],
        recentSleep: [],
        settings: { timeScale: 1, paused: false, autoSave: true },
      });

      const stateAfter = useSimulationStore.getState();
      expect(selectors.selectState(stateAfter)).toBeDefined();
      expect(selectors.selectState(stateAfter)?.userId).toBe('user1');
    });

    it('selectConnected should return connection status', () => {
      const state = useSimulationStore.getState();
      expect(selectors.selectConnected(state)).toBe(false);
    });

    it('selectLoading should return loading status', () => {
      const state = useSimulationStore.getState();
      expect(selectors.selectLoading(state)).toBe(true);
    });

    it('selectPaused should return paused status', () => {
      const state = useSimulationStore.getState();
      expect(selectors.selectPaused(state)).toBe(false);
    });

    it('selectTimeScale should return time scale', () => {
      const state = useSimulationStore.getState();
      expect(selectors.selectTimeScale(state)).toBe(1);
    });
  });

  describe('Energy Selectors', () => {
    beforeEach(() => {
      // Set up state with energy data
      useSimulationStore.getState().setState({
        id: 'test',
        userId: 'user1',
        timestamp: new Date(),
        gameTime: new Date(),
        user: {
          id: 'user1',
          age: 30,
          biologicalSex: 'male' as const,
          weight: 75,
          height: 180,
          bodyFatPercentage: 0.18,
          activityLevel: 1.55,
        },
        energy: {
          bmr: 1750,
          tdee: 2700,
          caloriesConsumed: 500,
          caloriesBurned: 300,
          netCalories: 200,
          carbohydrates: { consumed: 50, burned: 20, target: 300 },
          proteins: { consumed: 30, burned: 10, target: 120 },
          fats: { consumed: 20, burned: 5, target: 75 },
          glycogen: { muscle: 0.8, liver: 0.9, capacity: { muscle: 400, liver: 100 } },
          bodyFat: 13.5,
          leanMass: 61.5,
          substrateUtilization: {
            fatOxidation: 0.15,
            glucoseOxidation: 0.1,
            proteinOxidation: 0.001,
            metabolicState: 'fasted' as const,
          },
          bloodGlucose: {
            currentValue: 85,
            baseline: 85,
            peak: 85,
            trough: 85,
            trend: 0,
            lastMealTime: undefined,
            lastMealGlycemicLoad: 0,
            units: 'mg/dL',
          },
        },
        hormones: {
          insulin: { currentValue: 5, baseline: 5, peak: 5, trough: 5, trend: 0, sensitivity: 1 },
          glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
          cortisol: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
          growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
          igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
          epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
          leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        },
        muscle: {
          totalMass: 61.5,
          skeletalMuscleMass: 58.5,
          fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
          proteinBalance: { synthesisRate: 0.01, breakdownRate: 0.01, netBalance: 0, anabolicWindowRemaining: 0 },
          satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
          mtorSignaling: { activity: 0, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
          recoveryStatus: { muscleDamage: 0, glycogenRepletion: 1, inflammation: 0, centralFatigue: 0, sleepDebt: 0 },
          trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
        },
        recentMeals: [],
        recentExercises: [],
        recentSleep: [],
        settings: { timeScale: 1, paused: false, autoSave: true },
      });
    });

    it('selectEnergy should return energy data', () => {
      const state = useSimulationStore.getState();
      const energy = selectors.selectEnergy(state);
      expect(energy).toBeDefined();
      expect(energy?.caloriesConsumed).toBe(500);
      expect(energy?.caloriesBurned).toBe(300);
      expect(energy?.netCalories).toBe(200);
    });

    it('selectBloodGlucose should return blood glucose data', () => {
      const state = useSimulationStore.getState();
      const bg = selectors.selectBloodGlucose(state);
      expect(bg).toBeDefined();
      expect(bg?.currentValue).toBe(85);
    });

    it('selectNetCalories should return net calories', () => {
      const state = useSimulationStore.getState();
      expect(selectors.selectNetCalories(state)).toBe(200);
    });

    it('selectSubstrateUtilization should return substrate data', () => {
      const state = useSimulationStore.getState();
      const substrate = selectors.selectSubstrateUtilization(state);
      expect(substrate).toBeDefined();
      expect(substrate?.fatOxidation).toBe(0.15);
      expect(substrate?.glucoseOxidation).toBe(0.1);
    });
  });

  describe('Hormone Selectors', () => {
    beforeEach(() => {
      useSimulationStore.getState().setState({
        id: 'test',
        userId: 'user1',
        timestamp: new Date(),
        gameTime: new Date(),
        user: {
          id: 'user1',
          age: 30,
          biologicalSex: 'male' as const,
          weight: 75,
          height: 180,
          bodyFatPercentage: 0.18,
          activityLevel: 1.55,
        },
        energy: {
          bmr: 1750,
          tdee: 2700,
          caloriesConsumed: 0,
          caloriesBurned: 0,
          netCalories: 0,
          carbohydrates: { consumed: 0, burned: 0, target: 300 },
          proteins: { consumed: 0, burned: 0, target: 120 },
          fats: { consumed: 0, burned: 0, target: 75 },
          glycogen: { muscle: 1, liver: 1, capacity: { muscle: 400, liver: 100 } },
          bodyFat: 13.5,
          leanMass: 61.5,
          substrateUtilization: {
            fatOxidation: 0.1,
            glucoseOxidation: 0.08,
            proteinOxidation: 0.001,
            metabolicState: 'fasted' as const,
          },
        },
        hormones: {
          insulin: { currentValue: 8, baseline: 5, peak: 10, trough: 3, trend: 1, sensitivity: 1 },
          glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
          cortisol: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
          growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
          igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
          epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
          leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        },
        muscle: {
          totalMass: 61.5,
          skeletalMuscleMass: 58.5,
          fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
          proteinBalance: { synthesisRate: 0.01, breakdownRate: 0.01, netBalance: 0, anabolicWindowRemaining: 0 },
          satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
          mtorSignaling: { activity: 0, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
          recoveryStatus: { muscleDamage: 0, glycogenRepletion: 1, inflammation: 0, centralFatigue: 0, sleepDebt: 0 },
          trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
        },
        recentMeals: [],
        recentExercises: [],
        recentSleep: [],
        settings: { timeScale: 1, paused: false, autoSave: true },
      });
    });

    it('selectHormones should return all hormones', () => {
      const state = useSimulationStore.getState();
      const hormones = selectors.selectHormones(state);
      expect(hormones).toBeDefined();
      expect(hormones?.insulin?.currentValue).toBe(8);
    });

    it('selectInsulin should return insulin data', () => {
      const state = useSimulationStore.getState();
      const insulin = selectors.selectInsulin(state);
      expect(insulin?.currentValue).toBe(8);
    });

    it('selectCortisol should return cortisol data', () => {
      const state = useSimulationStore.getState();
      const cortisol = selectors.selectCortisol(state);
      expect(cortisol?.currentValue).toBe(10);
    });

    it('createHormonePanelSelector should return hormone and history', () => {
      const state = useSimulationStore.getState();
      const insulinSelector = selectors.createHormonePanelSelector('insulin');
      const result = insulinSelector(state);
      expect(result.data).toBeDefined();
      expect(result.data?.currentValue).toBe(8);
      expect(result.history).toBeDefined();
      expect(Array.isArray(result.history)).toBe(true);
    });
  });

  describe('Muscle Selectors', () => {
    beforeEach(() => {
      useSimulationStore.getState().setState({
        id: 'test',
        userId: 'user1',
        timestamp: new Date(),
        gameTime: new Date(),
        user: {
          id: 'user1',
          age: 30,
          biologicalSex: 'male' as const,
          weight: 75,
          height: 180,
          bodyFatPercentage: 0.18,
          activityLevel: 1.55,
        },
        energy: {
          bmr: 1750,
          tdee: 2700,
          caloriesConsumed: 0,
          caloriesBurned: 0,
          netCalories: 0,
          carbohydrates: { consumed: 0, burned: 0, target: 300 },
          proteins: { consumed: 0, burned: 0, target: 120 },
          fats: { consumed: 0, burned: 0, target: 75 },
          glycogen: { muscle: 1, liver: 1, capacity: { muscle: 400, liver: 100 } },
          bodyFat: 13.5,
          leanMass: 61.5,
          substrateUtilization: {
            fatOxidation: 0.1,
            glucoseOxidation: 0.08,
            proteinOxidation: 0.001,
            metabolicState: 'fasted' as const,
          },
        },
        hormones: {
          insulin: { currentValue: 5, baseline: 5, peak: 5, trough: 5, trend: 0, sensitivity: 1 },
          glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
          cortisol: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
          growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
          igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
          epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
          leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        },
        muscle: {
          totalMass: 61.5,
          skeletalMuscleMass: 58.5,
          fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
          proteinBalance: { synthesisRate: 0.02, breakdownRate: 0.01, netBalance: 0.01, anabolicWindowRemaining: 120 },
          satelliteCells: { active: 1, proliferating: 1, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
          mtorSignaling: { activity: 0.5, leucineThresholdMet: true, insulinSufficient: true, mechanicalStimulus: 0.3, energyStatus: 1 },
          recoveryStatus: { muscleDamage: 0.1, glycogenRepletion: 0.8, inflammation: 0.1, centralFatigue: 0.1, sleepDebt: 0 },
          trainingAdaptations: { strength: 1.1, endurance: 1, power: 1, workCapacity: 50, lastWorkout: null, consecutiveDays: 3 },
        },
        recentMeals: [],
        recentExercises: [],
        recentSleep: [],
        settings: { timeScale: 1, paused: false, autoSave: true },
      });
    });

    it('selectMuscle should return muscle data', () => {
      const state = useSimulationStore.getState();
      const muscle = selectors.selectMuscle(state);
      expect(muscle).toBeDefined();
      expect(muscle?.skeletalMuscleMass).toBe(58.5);
    });

    it('selectProteinBalance should return protein balance', () => {
      const state = useSimulationStore.getState();
      const pb = selectors.selectProteinBalance(state);
      expect(pb?.netBalance).toBe(0.01);
    });

    it('selectMtorSignaling should return mTOR signaling data', () => {
      const state = useSimulationStore.getState();
      const mtor = selectors.selectMtorSignaling(state);
      expect(mtor?.activity).toBe(0.5);
    });

    it('selectRecoveryStatus should return recovery status', () => {
      const state = useSimulationStore.getState();
      const recovery = selectors.selectRecoveryStatus(state);
      expect(recovery?.muscleDamage).toBe(0.1);
    });
  });

  describe('Activity Selectors', () => {
    beforeEach(() => {
      useSimulationStore.getState().setState({
        id: 'test',
        userId: 'user1',
        timestamp: new Date(),
        gameTime: new Date(),
        user: {
          id: 'user1',
          age: 30,
          biologicalSex: 'male' as const,
          weight: 75,
          height: 180,
          bodyFatPercentage: 0.18,
          activityLevel: 1.55,
        },
        energy: {
          bmr: 1750,
          tdee: 2700,
          caloriesConsumed: 0,
          caloriesBurned: 0,
          netCalories: 0,
          carbohydrates: { consumed: 0, burned: 0, target: 300 },
          proteins: { consumed: 0, burned: 0, target: 120 },
          fats: { consumed: 0, burned: 0, target: 75 },
          glycogen: { muscle: 1, liver: 1, capacity: { muscle: 400, liver: 100 } },
          bodyFat: 13.5,
          leanMass: 61.5,
          substrateUtilization: {
            fatOxidation: 0.1,
            glucoseOxidation: 0.08,
            proteinOxidation: 0.001,
            metabolicState: 'fasted' as const,
          },
        },
        hormones: {
          insulin: { currentValue: 5, baseline: 5, peak: 5, trough: 5, trend: 0, sensitivity: 1 },
          glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
          cortisol: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
          growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
          igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
          epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
          leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        },
        muscle: {
          totalMass: 61.5,
          skeletalMuscleMass: 58.5,
          fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
          proteinBalance: { synthesisRate: 0.01, breakdownRate: 0.01, netBalance: 0, anabolicWindowRemaining: 0 },
          satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
          mtorSignaling: { activity: 0, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
          recoveryStatus: { muscleDamage: 0, glycogenRepletion: 1, inflammation: 0, centralFatigue: 0, sleepDebt: 0 },
          trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
        },
        recentMeals: [
          { id: 'meal1', time: new Date(), name: 'Test Meal', totalMacros: { carbohydrates: 50, proteins: 20, fats: 10 } }
        ] as any,
        recentExercises: [
          { id: 'ex1', startTime: new Date(), name: 'Test Exercise', category: 'cardio', exercises: [{ sets: [{ duration: 1800 }] }] }
        ] as any,
        recentSleep: [
          { id: 'sleep1', endTime: new Date(), duration: 8, quality: 0.8 }
        ] as any,
        settings: { timeScale: 1, paused: false, autoSave: true },
      });
    });

    it('selectActivities should return all activities', () => {
      const state = useSimulationStore.getState();
      const activities = selectors.selectActivities(state);
      expect(activities.meals).toHaveLength(1);
      expect(activities.exercises).toHaveLength(1);
      expect(activities.sleep).toHaveLength(1);
    });

    it('selectRecentMeals should return meals', () => {
      const state = useSimulationStore.getState();
      const meals = selectors.selectRecentMeals(state);
      expect(meals).toHaveLength(1);
      expect(meals[0].name).toBe('Test Meal');
    });
  });

  describe('Selector Stability', () => {
    it('selector references should be stable across calls', () => {
      const selectEnergy1 = selectors.selectEnergy;
      const selectEnergy2 = selectors.selectEnergy;
      expect(selectEnergy1).toBe(selectEnergy2);
    });

    it('createHormonePanelSelector should create new function each time', () => {
      const selector1 = selectors.createHormonePanelSelector('insulin');
      const selector2 = selectors.createHormonePanelSelector('insulin');
      expect(selector1).not.toBe(selector2); // Different function instances
    });
  });
});

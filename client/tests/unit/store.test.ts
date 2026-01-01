// ============================================================================
// METABOLIC SIMULATOR - FRONTEND UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulationStore } from '../../src/state/store';

describe('Simulation Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useSimulationStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have default initial values', () => {
      const { result } = renderHook(() => useSimulationStore());

      expect(result.current.state).toBeNull();
      expect(result.current.connected).toBe(false);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.timeScale).toBe(1);
      expect(result.current.paused).toBe(false);
      expect(result.current.toasts).toEqual([]);
    });
  });

  describe('setState', () => {
    it('should set simulation state', () => {
      const { result } = renderHook(() => useSimulationStore());

      const mockState = {
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
      };

      act(() => {
        result.current.setState(mockState as any);
      });

      expect(result.current.state).toEqual(mockState);
    });
  });

  describe('setTimeScale', () => {
    it('should update time scale', () => {
      const { result } = renderHook(() => useSimulationStore());

      act(() => {
        result.current.setTimeScale(10);
      });

      expect(result.current.timeScale).toBe(10);
    });
  });

  describe('setPaused', () => {
    it('should update paused state', () => {
      const { result } = renderHook(() => useSimulationStore());

      expect(result.current.paused).toBe(false);

      act(() => {
        result.current.setPaused(true);
      });

      expect(result.current.paused).toBe(true);
    });
  });

  describe('togglePause', () => {
    it('should toggle paused state', () => {
      const { result } = renderHook(() => useSimulationStore());

      expect(result.current.paused).toBe(false);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.paused).toBe(true);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.paused).toBe(false);
    });
  });

  describe('Toast Notifications', () => {
    it('should add a toast notification', () => {
      const { result } = renderHook(() => useSimulationStore());

      act(() => {
        result.current.addToast('Test message', 'success');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Test message');
      expect(result.current.toasts[0].type).toBe('success');
    });

    it('should add multiple toasts', () => {
      const { result } = renderHook(() => useSimulationStore());

      act(() => {
        result.current.addToast('First', 'info');
        result.current.addToast('Second', 'warning');
      });

      expect(result.current.toasts).toHaveLength(2);
    });

    it('should remove a toast by id', () => {
      const { result } = renderHook(() => useSimulationStore());

      act(() => {
        result.current.addToast('Test message', 'success');
      });

      const toastId = result.current.toasts[0].id;

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should reset clear all toasts', () => {
      const { result } = renderHook(() => useSimulationStore());

      act(() => {
        result.current.addToast('Test', 'info');
        result.current.reset();
      });

      expect(result.current.toasts).toEqual([]);
    });
  });

  describe('Hormone History', () => {
    it('should initialize with empty hormone history', () => {
      const { result } = renderHook(() => useSimulationStore());

      expect(result.current.hormoneHistory.insulin).toEqual([]);
      expect(result.current.hormoneHistory.cortisol).toEqual([]);
    });

    it('should update hormone history when state is set', () => {
      const { result } = renderHook(() => useSimulationStore());

      const mockState = {
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
          insulin: { currentValue: 15, baseline: 5, peak: 15, trough: 5, trend: 1, sensitivity: 1 },
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
      };

      act(() => {
        result.current.setState(mockState as any);
      });

      expect(result.current.hormoneHistory.insulin).toHaveLength(1);
      expect(result.current.hormoneHistory.insulin[0]).toBe(15);
    });

    it('should limit hormone history to MAX_HISTORY_POINTS', () => {
      const { result } = renderHook(() => useSimulationStore());

      const baseState = {
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
      };

      // Add 25 states (more than MAX_HISTORY_POINTS of 20)
      act(() => {
        for (let i = 0; i < 25; i++) {
          const state = JSON.parse(JSON.stringify(baseState));
          state.hormones.insulin.currentValue = i;
          result.current.setState(state as any);
        }
      });

      // Should be limited to 20
      expect(result.current.hormoneHistory.insulin.length).toBeLessThanOrEqual(20);
    });
  });
});

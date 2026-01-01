// ============================================================================
// METABOLIC SIMULATOR - HEALTH ALERTS UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulationStore } from '../../src/state/store';
import { useHealthAlerts } from '../../src/hooks/useHealthAlerts';
import {
  ALERT_THRESHOLDS,
  getActiveAlerts,
  getAlertCountByLevel,
  evaluateAlertThreshold,
  getAlertConfig,
  type AlertLevel,
} from '../../src/data/alertThresholds';

describe('Alert Thresholds', () => {
  it('should have all required alert thresholds defined', () => {
    expect(ALERT_THRESHOLDS.length).toBeGreaterThan(0);
    expect(ALERT_THRESHOLDS.every(alert => alert.id)).toBeTruthy();
    expect(ALERT_THRESHOLDS.every(alert => alert.title)).toBeTruthy();
    expect(ALERT_THRESHOLDS.every(alert => alert.message)).toBeTruthy();
  });

  it('should have proper alert level distribution', () => {
    const levels = ALERT_THRESHOLDS.map(a => a.level);
    expect(levels).toContain('critical');
    expect(levels).toContain('warning');
    expect(levels).toContain('advisory');
  });

  it('should evaluate insulin critical threshold', () => {
    const insulinCritical = ALERT_THRESHOLDS.find(a => a.id === 'insulin-critical');
    expect(insulinCritical).toBeDefined();

    const mockState = {
      hormones: {
        insulin: { currentValue: 40, baseline: 5 },
      },
    };

    const result = evaluateAlertThreshold(insulinCritical!, mockState);
    expect(result).toBe(true);
  });

  it('should evaluate cortisol warning threshold', () => {
    const cortisolWarning = ALERT_THRESHOLDS.find(a => a.id === 'cortisol-warning');
    expect(cortisolWarning).toBeDefined();

    const mockState = {
      hormones: {
        cortisol: { currentValue: 22, baseline: 10 },
      },
    };

    const result = evaluateAlertThreshold(cortisolWarning!, mockState);
    expect(result).toBe(true);
  });

  it('should evaluate testosterone critical threshold', () => {
    const testosteroneCritical = ALERT_THRESHOLDS.find(a => a.id === 'testosterone-critical');
    expect(testosteroneCritical).toBeDefined();

    const mockState = {
      hormones: {
        testosterone: { currentValue: 5, baseline: 20 },
      },
    };

    const result = evaluateAlertThreshold(testosteroneCritical!, mockState);
    expect(result).toBe(true);
  });

  it('should evaluate blood glucose critical high threshold', () => {
    const bgCriticalHigh = ALERT_THRESHOLDS.find(a => a.id === 'bg-critical-high');
    expect(bgCriticalHigh).toBeDefined();

    const mockState = {
      energy: {
        bloodGlucose: { currentValue: 200 },
      },
    };

    const result = evaluateAlertThreshold(bgCriticalHigh!, mockState);
    expect(result).toBe(true);
  });

  it('should evaluate blood glucose critical low threshold', () => {
    const bgCriticalLow = ALERT_THRESHOLDS.find(a => a.id === 'bg-critical-low');
    expect(bgCriticalLow).toBeDefined();

    const mockState = {
      energy: {
        bloodGlucose: { currentValue: 45 },
      },
    };

    const result = evaluateAlertThreshold(bgCriticalLow!, mockState);
    expect(result).toBe(true);
  });

  it('should evaluate muscle damage critical threshold', () => {
    const muscleDamageCritical = ALERT_THRESHOLDS.find(a => a.id === 'muscle-damage-critical');
    expect(muscleDamageCritical).toBeDefined();

    const mockState = {
      muscle: {
        recoveryStatus: { muscleDamage: 0.5 },
      },
    };

    const result = evaluateAlertThreshold(muscleDamageCritical!, mockState);
    expect(result).toBe(true);
  });

  it('should evaluate sleep debt critical threshold', () => {
    const sleepDebtCritical = ALERT_THRESHOLDS.find(a => a.id === 'sleep-debt-critical');
    expect(sleepDebtCritical).toBeDefined();

    const mockState = {
      muscle: {
        recoveryStatus: { sleepDebt: 5 },
      },
    };

    const result = evaluateAlertThreshold(sleepDebtCritical!, mockState);
    expect(result).toBe(true);
  });
});

describe('Alert Helpers', () => {
  it('getAlertConfig should return correct config for each level', () => {
    const critical = getAlertConfig('critical');
    expect(critical.bgColor).toBe('bg-red-500/20');
    expect(critical.textColor).toBe('text-red-400');

    const warning = getAlertConfig('warning');
    expect(warning.bgColor).toBe('bg-orange-500/20');
    expect(warning.textColor).toBe('text-orange-400');

    const advisory = getAlertConfig('advisory');
    expect(advisory.bgColor).toBe('bg-yellow-500/20');
    expect(advisory.textColor).toBe('text-yellow-400');
  });

  it('getActiveAlerts should return empty array for null state', () => {
    const alerts = getActiveAlerts(null);
    expect(alerts).toEqual([]);
  });

  it('getActiveAlerts should filter out dismissed alerts', () => {
    const mockState = {
      hormones: {
        insulin: { currentValue: 40, baseline: 5 },
        cortisol: { currentValue: 25, baseline: 10 },
      },
    };

    const dismissed = new Set(['insulin-critical']);
    const alerts = getActiveAlerts(mockState, dismissed);

    // Should only have cortisol alert, insulin should be filtered out
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.every(a => a.id !== 'insulin-critical')).toBe(true);
  });

  it('getAlertCountByLevel should return correct counts', () => {
    const mockState = {
      hormones: {
        insulin: { currentValue: 40, baseline: 5 },  // critical
        cortisol: { currentValue: 25, baseline: 10 },  // warning
      },
    };

    const counts = getAlertCountByLevel(mockState);
    expect(counts.critical).toBeGreaterThan(0);
    expect(counts.warning).toBeGreaterThan(0);
    expect(counts.total).toBeGreaterThan(0);
  });
});

describe('useHealthAlerts Hook', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should initialize with no alerts', () => {
    const { result } = renderHook(() => useHealthAlerts());

    expect(result.current.activeAlerts).toEqual([]);
    expect(result.current.alertCounts.total).toBe(0);
    expect(result.current.hasAnyAlerts).toBe(false);
    expect(result.current.hasCriticalAlerts).toBe(false);
  });

  it('should detect critical insulin alert', () => {
    // Set up state with critically high insulin
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
        insulin: { currentValue: 40, baseline: 5, peak: 40, trough: 5, trend: 1, sensitivity: 1 },
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

    const { result } = renderHook(() => useHealthAlerts());

    expect(result.current.activeAlerts.length).toBeGreaterThan(0);
    expect(result.current.hasCriticalAlerts).toBe(true);
    expect(result.current.alertCounts.critical).toBeGreaterThan(0);

    // Find the insulin critical alert
    const insulinAlert = result.current.activeAlerts.find(a => a.id === 'insulin-critical');
    expect(insulinAlert).toBeDefined();
    expect(insulinAlert?.title).toBe('Critical Insulin Elevation');
  });

  it('should detect multiple alerts', () => {
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
        insulin: { currentValue: 30, baseline: 5, peak: 30, trough: 5, trend: 1, sensitivity: 1 },
        cortisol: { currentValue: 25, baseline: 10, peak: 25, trough: 10, trend: 1, sensitivity: 1 },
        testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
        growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
        igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
        leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
        ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
      },
      muscle: {
        totalMass: 61.5,
        skeletalMuscleMass: 58.5,
        fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
        proteinBalance: { synthesisRate: 0.01, breakdownRate: 0.01, netBalance: 0, anabolicWindowRemaining: 0 },
        satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
        mtorSignaling: { activity: 0, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
        recoveryStatus: { muscleDamage: 0.5, glycogenRepletion: 1, inflammation: 0, centralFatigue: 0, sleepDebt: 0 },
        trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
      },
      recentMeals: [],
      recentExercises: [],
      recentSleep: [],
      settings: { timeScale: 1, paused: false, autoSave: true },
    });

    const { result } = renderHook(() => useHealthAlerts());

    expect(result.current.activeAlerts.length).toBeGreaterThan(1);
    expect(result.current.alertCounts.total).toBeGreaterThan(1);
  });

  it('should detect blood glucose alerts', () => {
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
        bloodGlucose: { currentValue: 190, baseline: 85, peak: 190, trough: 80, trend: 1, lastMealTime: undefined, lastMealGlycemicLoad: 0, units: 'mg/dL' },
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

    const { result } = renderHook(() => useHealthAlerts());

    expect(result.current.activeAlerts.length).toBeGreaterThan(0);

    const bgAlert = result.current.activeAlerts.find(a => a.id === 'bg-critical-high');
    expect(bgAlert).toBeDefined();
  });

  it('should allow dismissing alerts', () => {
    // Set up state with alerts
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
        insulin: { currentValue: 40, baseline: 5, peak: 40, trough: 5, trend: 1, sensitivity: 1 },
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

    const { result } = renderHook(() => useHealthAlerts());

    const initialCount = result.current.alertCounts.total;
    expect(initialCount).toBeGreaterThan(0);

    // Dismiss an alert
    act(() => {
      result.current.dismissAlert('insulin-critical');
    });

    // The alert should be removed
    const alertsAfterDismiss = result.current.activeAlerts;
    expect(alertsAfterDismiss.every(a => a.id !== 'insulin-critical')).toBe(true);
  });

  it('should group alerts by level', () => {
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
        insulin: { currentValue: 20, baseline: 5, peak: 20, trough: 5, trend: 1, sensitivity: 1 },
        cortisol: { currentValue: 22, baseline: 10, peak: 22, trough: 10, trend: 1, sensitivity: 1 },
        testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
        growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
        igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
        leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
        ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
      },
      muscle: {
        totalMass: 61.5,
        skeletalMuscleMass: 58.5,
        fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
        proteinBalance: { synthesisRate: 0.01, breakdownRate: 0.01, netBalance: 0, anabolicWindowRemaining: 0 },
        satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
        mtorSignaling: { activity: 0, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
        recoveryStatus: { muscleDamage: 0.5, glycogenRepletion: 1, inflammation: 0, centralFatigue: 0, sleepDebt: 0 },
        trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
      },
      recentMeals: [],
      recentExercises: [],
      recentSleep: [],
      settings: { timeScale: 1, paused: false, autoSave: true },
    });

    const { result } = renderHook(() => useHealthAlerts());

    const { alertsByLevel } = result.current;
    expect(alertsByLevel.critical).toBeInstanceOf(Array);
    expect(alertsByLevel.warning).toBeInstanceOf(Array);
    expect(alertsByLevel.advisory).toBeInstanceOf(Array);
  });

  it('should dismiss all alerts by level', () => {
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
        insulin: { currentValue: 30, baseline: 5, peak: 30, trough: 5, trend: 1, sensitivity: 1 },
        cortisol: { currentValue: 25, baseline: 10, peak: 25, trough: 10, trend: 1, sensitivity: 1 },
        testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
        growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
        igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
        leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
        ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
      },
      muscle: {
        totalMass: 61.5,
        skeletalMuscleMass: 58.5,
        fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
        proteinBalance: { synthesisRate: 0.01, breakdownRate: 0.01, netBalance: 0, anabolicWindowRemaining: 0 },
        satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
        mtorSignaling: { activity: 0, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
        recoveryStatus: { muscleDamage: 0, glycogenRepletion: 1, inflammation: 0, centralFatigue: 0, sleepDebt: 5 },
        trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
      },
      recentMeals: [],
      recentExercises: [],
      recentSleep: [],
      settings: { timeScale: 1, paused: false, autoSave: true },
    });

    const { result } = renderHook(() => useHealthAlerts());

    // Should have critical alerts initially
    const initialCriticalCount = result.current.alertCounts.critical;
    expect(initialCriticalCount).toBeGreaterThan(0);

    // Dismiss all critical alerts
    act(() => {
      result.current.dismissAlertsByLevel('critical');
    });

    // Should have no critical alerts after dismissal
    expect(result.current.alertCounts.critical).toBe(0);
  });
});

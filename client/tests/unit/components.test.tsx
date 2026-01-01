// ============================================================================
// METABOLIC SIMULATOR - COMPONENT UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useSimulationStore } from '../../src/state/store';
import ActivityLog from '../../src/components/dashboard/ActivityLog';
import HormoneTimeSeries from '../../src/components/charts/HormoneTimeSeries';
import '@testing-library/jest-dom';

describe('ActivityLog Component', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  it('should render empty state when no activities', () => {
    // Set up state with empty activities
    const { result } = renderHook(() => useSimulationStore());
    act(() => {
      result.current.setState({
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
      } as any);
    });

    render(<ActivityLog />);

    expect(screen.getByText('No activities logged yet')).toBeInTheDocument();
    expect(screen.getByText('Log a meal or exercise to get started')).toBeInTheDocument();
  });

  it('should render with data-testid attribute', () => {
    const { result } = renderHook(() => useSimulationStore());
    act(() => {
      result.current.setState({
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
      } as any);
    });

    const { container } = render(<ActivityLog />);
    expect(container.querySelector('[data-testid="activity-log-panel"]')).toBeInTheDocument();
  });
});

describe('HormoneTimeSeries Component', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  it('should render waiting state when no data available', () => {
    render(<HormoneTimeSeries />);

    expect(screen.getByText('Waiting for hormone data...')).toBeInTheDocument();
  });

  it('should render with data-testid when chart is shown', async () => {
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
    } as any;

    act(() => {
      result.current.setState(baseState);
    });

    // Wait for throttle to pass (HISTORY_THROTTLE_MS = 500)
    await new Promise(resolve => setTimeout(resolve, 600));

    act(() => {
      // Add second state to build history
      result.current.setState({
        ...baseState,
        hormones: {
          ...baseState.hormones,
          insulin: { currentValue: 20, baseline: 5, peak: 20, trough: 5, trend: 1, sensitivity: 1 },
        },
      } as any);
    });

    const { container } = render(<HormoneTimeSeries />);
    expect(screen.getByText('Hormone Time Series')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

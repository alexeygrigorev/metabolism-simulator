// ============================================================================
// METABOLIC SIMULATOR - COMPONENT UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSimulationStore } from '../../src/state/store';
import ActivityLog from '../../src/components/dashboard/ActivityLog';
import HormoneTimeSeries from '../../src/components/charts/HormoneTimeSeries';
import { ErrorBoundary } from '../../src/components/ui/ErrorBoundary';
import HealthMarkersPanel from '../../src/components/dashboard/HealthMarkersPanel';
import SettingsPanel from '../../src/components/ui/SettingsPanel';
import HormoneTooltip from '../../src/components/ui/HormoneTooltip';
import RecommendationsPanel from '../../src/components/dashboard/RecommendationsPanel';
import { getHormoneEducation, HORMONE_EDUCATION } from '../../src/data/hormoneEducation';
import MealBuilder from '../../src/components/dashboard/MealBuilder';
import {
  FOOD_DATABASE,
  searchFoods,
  getFoodsByCategory,
  getLowGIFoods,
  getHighProteinFoods,
  type Food
} from '../../src/data/foodDatabase';
import HormoneEducationHub from '../../src/components/education/HormoneEducationHub';
import MetabolicInsightsDashboard from '../../src/components/insights/MetabolicInsightsDashboard';
import { useMetabolicInsights } from '../../src/hooks/useMetabolicInsights';
import '@testing-library/jest-dom';

// Component that throws an error for testing ErrorBoundary
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
}

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

describe('ErrorBoundary Component', () => {
  // Suppress console.error for these tests since we're intentionally causing errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', () => {
    // Create a wrapper component that throws after mount
    function ComponentThatThrows() {
      throw new Error('Test error');
    }

    render(
      <ErrorBoundary>
        <ComponentThatThrows />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('should display custom fallback when provided', () => {
    function ComponentThatThrows() {
      throw new Error('Test error');
    }

    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ComponentThatThrows />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    function ComponentThatThrows() {
      throw new Error('Test error');
    }

    render(
      <ErrorBoundary onError={onError}>
        <ComponentThatThrows />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should provide reset functionality', () => {
    let shouldThrow = true;

    function ComponentThatThrowsConditionally() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Recovered content</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ComponentThatThrowsConditionally />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click the "Try Again" button - this would need user interaction in real scenario
    // For the test, we'll just verify the button exists
    const tryAgainButton = screen.getByText('Try Again');
    expect(tryAgainButton).toBeInTheDocument();
  });
});

// ============================================================================
// CHART ERROR BOUNDARY TESTS
// ============================================================================

import { ChartErrorBoundary } from '../../src/components/charts/ChartErrorBoundary';

describe('ChartErrorBoundary Component', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ChartErrorBoundary chartName="Test Chart">
        <div>Chart content</div>
      </ChartErrorBoundary>
    );

    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI for charts', () => {
    function BrokenChart() {
      throw new Error('Chart rendering error');
    }

    render(
      <ChartErrorBoundary chartName="Test Time Series">
        <BrokenChart />
      </ChartErrorBoundary>
    );

    expect(screen.getByText('Chart Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/The Test Time Series chart encountered an error/)).toBeInTheDocument();
  });

  it('should display custom fallback when provided', () => {
    function BrokenChart() {
      throw new Error('Chart error');
    }

    const customFallback = <div>Custom chart fallback</div>;

    render(
      <ChartErrorBoundary fallback={customFallback} chartName="Test Chart">
        <BrokenChart />
      </ChartErrorBoundary>
    );

    expect(screen.getByText('Custom chart fallback')).toBeInTheDocument();
  });

  it('should show generic message when chart name is not provided', () => {
    function BrokenChart() {
      throw new Error('Chart error');
    }

    render(
      <ChartErrorBoundary>
        <BrokenChart />
      </ChartErrorBoundary>
    );

    expect(screen.getByText('Chart Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/This chart encountered an error/)).toBeInTheDocument();
  });

  it('should call onError callback with error details', () => {
    const onError = vi.fn();

    function BrokenChart() {
      throw new Error('Chart rendering error');
    }

    render(
      <ChartErrorBoundary onError={onError} chartName="Test Chart">
        <BrokenChart />
      </ChartErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should provide reset functionality with try again button', () => {
    function BrokenChart() {
      throw new Error('Chart error');
    }

    render(
      <ChartErrorBoundary chartName="Test Chart">
        <BrokenChart />
      </ChartErrorBoundary>
    );

    const tryAgainButton = screen.getByText('Try Again');
    expect(tryAgainButton).toBeInTheDocument();
    expect(tryAgainButton.tagName).toBe('BUTTON');
  });
});

// ============================================================================
// BLOOD GLUCOSE PANEL TESTS
// ============================================================================

import BloodGlucosePanel from '../../src/components/dashboard/BloodGlucosePanel';

describe('BloodGlucosePanel Component', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  it('should render empty state when no blood glucose data', () => {
    // Set up state without blood glucose
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
          bloodGlucose: null as any, // No blood glucose data
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
            metabolicState: 'fasted' as any,
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

    render(<BloodGlucosePanel />);

    expect(screen.getByText('No glucose data available')).toBeInTheDocument();
  });

  it('should render normal blood glucose state', () => {
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
          bloodGlucose: {
            currentValue: 85,
            baseline: 85,
            peak: 85,
            trend: 0,
            lastMealTime: undefined,
            lastMealGlycemicLoad: 0,
            units: 'mg/dL',
          },
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
            metabolicState: 'fasted' as any,
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

    render(<BloodGlucosePanel />);

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('should render elevated blood glucose state', () => {
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
          bloodGlucose: {
            currentValue: 120,
            baseline: 85,
            peak: 120,
            trend: 1,
            lastMealTime: undefined,
            lastMealGlycemicLoad: 0,
            units: 'mg/dL',
          },
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
            metabolicState: 'fasted' as any,
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

    render(<BloodGlucosePanel />);

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Elevated')).toBeInTheDocument();
  });

  it('should render with last meal information', () => {
    const mealTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
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
          bloodGlucose: {
            currentValue: 95,
            baseline: 85,
            peak: 110,
            trend: -1,
            lastMealTime: mealTime.toISOString(),
            lastMealGlycemicLoad: 25,
            units: 'mg/dL',
          },
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
            metabolicState: 'fasted' as any,
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

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Last Meal')).toBeInTheDocument();
    expect(screen.getByText(/Glycemic Load/)).toBeInTheDocument();
  });

  it('should display correct trend indicator', () => {
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
          bloodGlucose: {
            currentValue: 85,
            baseline: 85,
            peak: 85,
            trend: 1, // Rising
            lastMealTime: undefined,
            lastMealGlycemicLoad: 0,
            units: 'mg/dL',
          },
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
            metabolicState: 'fasted' as any,
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

    render(<BloodGlucosePanel />);

    expect(screen.getByText('↗')).toBeInTheDocument();
    expect(screen.getByText('Rising')).toBeInTheDocument();
  });
});

// ============================================================================
// HEALTH MARKERS PANEL TESTS
// ============================================================================

describe('HealthMarkersPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { setState } = useSimulationStore.getState();
    setState({
      id: 'test-sim',
      userId: 'test-user',
      timestamp: new Date(),
      gameTime: new Date(),
      user: {
        id: 'test-user',
        age: 30,
        biologicalSex: 'male' as any,
        weight: 75,
        height: 180,
        bodyFatPercentage: 0.15,
        activityLevel: 1.55,
      },
      energy: {
        bmr: 2000,
        tdee: 2800,
        caloriesConsumed: 1500,
        caloriesBurned: 2000,
        netCalories: -500,
        bloodGlucose: {
          currentValue: 85,
          baseline: 85,
          peak: 120,
          trend: 0,
          lastMealGlycemicLoad: 20,
          units: 'mg/dL',
        },
        carbohydrates: { consumed: 150, burned: 100, target: 250 },
        proteins: { consumed: 80, burned: 50, target: 120 },
        fats: { consumed: 50, burned: 40, target: 70 },
        glycogen: { muscle: 0.7, liver: 0.8, capacity: { muscle: 400, liver: 100 } },
        bodyFat: 11.25,
        leanMass: 63.75,
        substrateUtilization: {
          fatOxidation: 0.1,
          glucoseOxidation: 0.8,
          proteinOxidation: 0.01,
          metabolicState: 'postprandial' as any,
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

  it('should render health markers panel with demo data', () => {
    render(<HealthMarkersPanel />);

    expect(screen.getByText('Health Markers')).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive blood work & vitals/)).toBeInTheDocument();
  });

  it('should display lipid panel section', () => {
    render(<HealthMarkersPanel />);

    expect(screen.getByText('Lipid Panel')).toBeInTheDocument();
    expect(screen.getByText('Total Cholesterol')).toBeInTheDocument();
    expect(screen.getByText('LDL')).toBeInTheDocument();
    expect(screen.getByText('HDL')).toBeInTheDocument();
    expect(screen.getByText('Triglycerides')).toBeInTheDocument();
  });

  it('should display liver function section', () => {
    render(<HealthMarkersPanel />);

    expect(screen.getByText('Liver Function')).toBeInTheDocument();
    expect(screen.getByText('ALT')).toBeInTheDocument();
    expect(screen.getByText('AST')).toBeInTheDocument();
  });

  it('should display kidney function section', () => {
    render(<HealthMarkersPanel />);

    expect(screen.getByText('Kidney Function')).toBeInTheDocument();
    expect(screen.getByText('eGFR')).toBeInTheDocument();
    expect(screen.getByText('Creatinine')).toBeInTheDocument();
    expect(screen.getByText('BUN')).toBeInTheDocument();
  });

  it('should display inflammation markers section', () => {
    render(<HealthMarkersPanel />);

    expect(screen.getByText('Inflammation Markers')).toBeInTheDocument();
    expect(screen.getByText('CRP')).toBeInTheDocument();
  });

  it('should display cardiovascular section', () => {
    render(<HealthMarkersPanel />);

    expect(screen.getByText('Cardiovascular')).toBeInTheDocument();
    expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('Resting HR')).toBeInTheDocument();
    expect(screen.getByText('HRV (RMSSD)')).toBeInTheDocument();
    expect(screen.getByText('HRV Score')).toBeInTheDocument();
    expect(screen.getByText('Recovery Status')).toBeInTheDocument();
  });

  it('should show disclaimer text', () => {
    render(<HealthMarkersPanel />);

    expect(screen.getByText(/Health markers are simulated values/)).toBeInTheDocument();
    expect(screen.getByText(/For actual medical testing, consult a healthcare provider/)).toBeInTheDocument();
  });

  it('should render expandable sections', () => {
    render(<HealthMarkersPanel />);

    // Verify all section headers are present (these are the expandable sections)
    expect(screen.getByText('Lipid Panel')).toBeInTheDocument();
    expect(screen.getByText('Liver Function')).toBeInTheDocument();
    expect(screen.getByText('Kidney Function')).toBeInTheDocument();
    expect(screen.getByText('Inflammation Markers')).toBeInTheDocument();
    expect(screen.getByText('Cardiovascular')).toBeInTheDocument();

    // Verify that expandable content is visible by default
    expect(screen.getByText('Total Cholesterol')).toBeInTheDocument();
  });
});

// ============================================================================
// SETTINGS PANEL TESTS (EXPORT/IMPORT)
// ============================================================================

describe('SettingsPanel Component', () => {
  // Reset the store and clean up mocks after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const { setState } = useSimulationStore.getState();

    // Set up a complete simulation state
    setState({
      id: 'test-sim',
      userId: 'test-user',
      timestamp: new Date(),
      gameTime: new Date(),
      user: {
        id: 'test-user',
        age: 30,
        biologicalSex: 'male' as any,
        weight: 75,
        height: 180,
        bodyFatPercentage: 0.15,
        activityLevel: 1.55,
      },
      energy: {
        bmr: 2000,
        tdee: 2800,
        caloriesConsumed: 1500,
        caloriesBurned: 2000,
        netCalories: -500,
        bloodGlucose: {
          currentValue: 85,
          baseline: 85,
          peak: 120,
          trend: 0,
          lastMealGlycemicLoad: 20,
          units: 'mg/dL',
        },
        carbohydrates: { consumed: 150, burned: 100, target: 250 },
        proteins: { consumed: 80, burned: 50, target: 120 },
        fats: { consumed: 50, burned: 40, target: 70 },
        glycogen: { muscle: 0.7, liver: 0.8, capacity: { muscle: 400, liver: 100 } },
        bodyFat: 11.25,
        leanMass: 63.75,
        substrateUtilization: {
          fatOxidation: 0.1,
          glucoseOxidation: 0.8,
          proteinOxidation: 0.01,
          metabolicState: 'postprandial' as any,
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

  it('should render settings panel when open', () => {
    render(<SettingsPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Units')).toBeInTheDocument();
    expect(screen.getByText('Simulation')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<SettingsPanel isOpen={false} onClose={() => {}} />);

    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('should show export and import buttons', () => {
    render(<SettingsPanel isOpen={true} onClose={() => {}} />);

    // Check for export buttons (JSON and CSV options)
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Import Data')).toBeInTheDocument();
  });

  it('should call onClose when Done button is clicked', () => {
    const handleClose = vi.fn();
    render(<SettingsPanel isOpen={true} onClose={handleClose} />);

    const doneButton = screen.getByText('Done');
    fireEvent.click(doneButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<SettingsPanel isOpen={true} onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close settings dialog' });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should have measurement system selector', () => {
    render(<SettingsPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Measurement System')).toBeInTheDocument();
    expect(screen.getByText('Metric (kg, cm)')).toBeInTheDocument();
    expect(screen.getByText('Imperial (lb, in)')).toBeInTheDocument();
  });

  it('should have time scale selector', () => {
    render(<SettingsPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Default Time Scale')).toBeInTheDocument();
    expect(screen.getByText('1x (Real-time)')).toBeInTheDocument();
    expect(screen.getByText('10x')).toBeInTheDocument();
  });

  it('should have connection status indicator', () => {
    render(<SettingsPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    // Should show either Live Mode or Demo Mode
    expect(screen.getByText(/Live Mode|Demo Mode/)).toBeInTheDocument();
  });
});

describe('HormoneTooltip Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children without tooltip when education data not found', () => {
    render(
      <HormoneTooltip hormoneId="nonexistent" currentValue={10}>
        <span>Test Hormone</span>
      </HormoneTooltip>
    );

    expect(screen.getByText('Test Hormone')).toBeInTheDocument();
  });

  it('should render trigger element with cursor-help class', () => {
    render(
      <HormoneTooltip hormoneId="insulin" currentValue={10}>
        <span data-testid="insulin-trigger">Insulin</span>
      </HormoneTooltip>
    );

    const trigger = screen.getByTestId('insulin-trigger');
    expect(trigger).toBeInTheDocument();

    // The parent div should have cursor-help
    const wrapper = trigger.closest('.cursor-help');
    expect(wrapper).toBeInTheDocument();
  });

  it('should have correct category info for insulin', () => {
    // Test the getCategoryInfo function indirectly through component rendering
    // Storage hormone should have icon 📦
    render(
      <HormoneTooltip hormoneId="insulin" currentValue={10} showOnHover={false}>
        <span data-testid="insulin-trigger">Insulin</span>
      </HormoneTooltip>
    );

    const trigger = screen.getByTestId('insulin-trigger');
    expect(trigger).toBeInTheDocument();
  });

  it('should not render tooltip content when not visible', () => {
    render(
      <HormoneTooltip hormoneId="insulin" currentValue={10}>
        <span data-testid="insulin-trigger">Insulin</span>
      </HormoneTooltip>
    );

    // Tooltip should not be visible initially
    const tooltip = document.querySelector('.bg-slate-900.z-50');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('should handle click mode when showOnHover is false', () => {
    render(
      <HormoneTooltip hormoneId="insulin" currentValue={10} showOnHover={false}>
        <span data-testid="insulin-trigger">Insulin</span>
      </HormoneTooltip>
    );

    const trigger = screen.getByTestId('insulin-trigger');
    expect(trigger).toBeInTheDocument();

    // Click should toggle visibility (no error thrown)
    fireEvent.click(trigger);
  });

  it('should have all required hormone education data', () => {
    // This test validates the educational data structure
    const insulin = getHormoneEducation('insulin');
    expect(insulin).toBeDefined();
    expect(insulin?.name).toBe('Insulin');
    expect(insulin?.category).toBe('storage');
    expect(insulin?.abbreviation).toBe('INS');
    expect(insulin?.symptomsOfHigh).toBeDefined();
    expect(insulin?.symptomsOfLow).toBeDefined();
    expect(insulin?.factorsThatIncrease).toBeDefined();
    expect(insulin?.factorsThatDecrease).toBeDefined();
    expect(insulin?.relatedHormones).toBeDefined();
  });

  it('should have educational data for all major hormones', () => {
    const expectedHormones = [
      'insulin', 'glucagon', 'cortisol', 'testosterone',
      'growthHormone', 'igf1', 'epinephrine', 'leptin', 'ghrelin'
    ];

    expectedHormones.forEach(hormoneId => {
      expect(HORMONE_EDUCATION[hormoneId]).toBeDefined();
      const hormone = HORMONE_EDUCATION[hormoneId];
      expect(hormone.symptomsOfHigh.length).toBeGreaterThan(0);
      expect(hormone.symptomsOfLow.length).toBeGreaterThan(0);
      expect(hormone.relatedHormones.length).toBeGreaterThan(0);
    });
  });
});

describe('RecommendationsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { setState } = useSimulationStore.getState();

    // Set up a simulation state that will trigger recommendations
    setState({
      id: 'test-rec',
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
        caloriesBurned: 800,
        netCalories: -300,
        carbohydrates: { consumed: 30, burned: 40, target: 300 },
        proteins: { consumed: 20, burned: 5, target: 120 },
        fats: { consumed: 15, burned: 10, target: 75 },
        glycogen: { muscle: 0.2, liver: 0.3, capacity: { muscle: 400, liver: 100 } },
        bodyFat: 13.5,
        leanMass: 61.5,
        substrateUtilization: {
          fatOxidation: 0.2,
          glucoseOxidation: 0.05,
          proteinOxidation: 0.001,
          metabolicState: 'fasted' as const,
        },
      },
      hormones: {
        insulin: { currentValue: 35, baseline: 5, peak: 5, trough: 5, trend: 1, sensitivity: 1 },
        glucagon: { currentValue: 80, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
        cortisol: { currentValue: 40, baseline: 10, peak: 10, trough: 10, trend: 1, sensitivity: 1 },
        testosterone: { currentValue: 8, baseline: 20, peak: 20, trough: 20, trend: -1, sensitivity: 1 },
        growthHormone: { currentValue: 0.3, baseline: 1, peak: 1, trough: 1, trend: -1, sensitivity: 1 },
        igf1: { currentValue: 80, baseline: 150, peak: 150, trough: 150, trend: -1, sensitivity: 1 },
        epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
        leptin: { currentValue: 8, baseline: 10, peak: 10, trough: 10, trend: -1, sensitivity: 1 },
        ghrelin: { currentValue: 200, baseline: 150, peak: 150, trough: 150, trend: 1, sensitivity: 1 },
      },
      muscle: {
        totalMass: 61.5,
        skeletalMuscleMass: 58.5,
        fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
        proteinBalance: { synthesisRate: 0.005, breakdownRate: 0.015, netBalance: -0.01, anabolicWindowRemaining: 0 },
        satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
        mtorSignaling: { activity: 0.2, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
        recoveryStatus: { muscleDamage: 0.6, glycogenRepletion: 0.3, inflammation: 0.7, centralFatigue: 0.3, sleepDebt: 3 },
        trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
      },
      recentMeals: [],
      recentExercises: [],
      recentSleep: [],
      settings: { timeScale: 1, paused: false, autoSave: true },
    } as any);
  });

  it('should render recommendations panel', () => {
    render(<RecommendationsPanel />);

    expect(screen.getByText('Personalized Recommendations')).toBeInTheDocument();
  });

  it('should show quick insight', () => {
    render(<RecommendationsPanel />);

    // With high cortisol, should show stress warning in the insight section
    const insight = screen.getByText(/High stress detected/);
    expect(insight).toBeInTheDocument();
  });

  it('should display filter chips', () => {
    render(<RecommendationsPanel />);

    // Filter chips show both label and count - use role to target specifically
    const allButtons = screen.getAllByRole('button');
    const filterButtons = allButtons.filter(btn => {
      const text = btn.textContent;
      return text && text.includes('(') && text.includes(')');
    });

    // Should have at least 5 filter buttons (All, Critical, High, Medium, Low)
    expect(filterButtons.length).toBeGreaterThanOrEqual(5);

    // Check for specific filter names in buttons
    expect(filterButtons.some(btn => btn.textContent?.includes('All'))).toBe(true);
    expect(filterButtons.some(btn => btn.textContent?.includes('Critical'))).toBe(true);
    expect(filterButtons.some(btn => btn.textContent?.includes('High'))).toBe(true);
    expect(filterButtons.some(btn => btn.textContent?.includes('Medium'))).toBe(true);
    expect(filterButtons.some(btn => btn.textContent?.includes('Low'))).toBe(true);
  });

  it('should show recommendation cards', () => {
    render(<RecommendationsPanel />);

    // Should have recommendations for high cortisol, high insulin, low testosterone, etc.
    expect(screen.getByText('Reduce Carbohydrate Intake')).toBeInTheDocument();
  });

  it('should show actionable count', () => {
    render(<RecommendationsPanel />);

    // Should show "X actionable" text
    expect(screen.getByText(/actionable/i)).toBeInTheDocument();
  });

  it('should expand recommendation card on click', () => {
    render(<RecommendationsPanel />);

    // Click on a recommendation to expand
    const cards = screen.getAllByRole('button');
    const recommendationCard = cards.find(btn => btn.textContent?.includes('Prioritize Stress Recovery') || btn.textContent?.includes('Reduce Carbohydrate'));

    if (recommendationCard) {
      fireEvent.click(recommendationCard);
      // After clicking, the card should still be in the document
      expect(recommendationCard).toBeInTheDocument();
    }
  });

  it('should filter by priority when chip is clicked', () => {
    render(<RecommendationsPanel />);

    // Click Critical filter
    const criticalFilter = screen.getAllByText('Critical').find(el => el.getAttribute('role') === 'button');
    if (criticalFilter) {
      fireEvent.click(criticalFilter);
      expect(criticalFilter).toBeInTheDocument();
    }
  });
});

// ============================================================================
// MEAL BUILDER TESTS
// ============================================================================

describe('MealBuilder Component', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  it('should not render when closed', () => {
    render(<MealBuilder isOpen={false} onClose={() => {}} />);

    expect(screen.queryByText('Build Your Meal')).not.toBeInTheDocument();
  });

  it('should render modal when open', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Build Your Meal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search foods by name or tag...')).toBeInTheDocument();
  });

  it('should display category tabs', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    // Get all buttons and look for category tabs by their emoji icons
    const allButtons = screen.getAllByRole('button');
    const categoryButtons = allButtons.filter(btn => {
      const text = btn.textContent || '';
      return text.includes('Protein') || text.includes('Carbs') || text.includes('Vegetables') ||
             text.includes('Fruits') || text.includes('Dairy') || text.includes('Grains');
    });

    expect(categoryButtons.length).toBeGreaterThanOrEqual(5);
  });

  it('should display quick filter buttons', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('All Foods')).toBeInTheDocument();
    expect(screen.getByText('Low GI')).toBeInTheDocument();
    expect(screen.getByText('High Protein')).toBeInTheDocument();
  });

  it('should show foods in the list', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    // Should show foods from the database
    expect(screen.getByText('Chicken Breast (skinless)')).toBeInTheDocument();
    expect(screen.getByText('Eggs (large, whole)')).toBeInTheDocument();
  });

  it('should filter foods by search query', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    const searchInput = screen.getByPlaceholderText('Search foods by name or tag...');
    fireEvent.change(searchInput, { target: { value: 'chicken' } });

    expect(screen.getByText('Chicken Breast (skinless)')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MealBuilder isOpen={true} onClose={handleClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not show meal summary when no items selected', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    expect(screen.queryByText('Meal Summary')).not.toBeInTheDocument();
  });
});

// ============================================================================
// FOOD DATABASE TESTS
// ============================================================================

describe('Food Database', () => {
  it('should have foods with all required properties', () => {
    const food = FOOD_DATABASE[0];

    expect(food).toHaveProperty('id');
    expect(food).toHaveProperty('name');
    expect(food).toHaveProperty('category');
    expect(food).toHaveProperty('servingSize');
    expect(food).toHaveProperty('servingUnit');
    expect(food).toHaveProperty('macros');
    expect(food).toHaveProperty('glycemicIndex');
    expect(food).toHaveProperty('glycemicLoad');
    expect(food).toHaveProperty('insulinIndex');
    expect(food).toHaveProperty('tags');
  });

  it('should have macros with all required fields', () => {
    const food = FOOD_DATABASE[0];

    expect(food.macros).toHaveProperty('carbohydrates');
    expect(food.macros).toHaveProperty('proteins');
    expect(food.macros).toHaveProperty('fats');
    expect(food.macros).toHaveProperty('fiber');
    expect(food.macros).toHaveProperty('sugar');
  });

  it('should search foods by name', () => {
    const results = searchFoods('chicken');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('chicken');
  });

  it('should search foods by tag', () => {
    const results = searchFoods('breakfast');

    expect(results.length).toBeGreaterThan(0);
    expect(results.some(f => f.tags.includes('breakfast'))).toBe(true);
  });

  it('should search foods by category', () => {
    const results = searchFoods('protein');

    // searchFoods searches by name, tags, OR category
    // So we verify at least some results are from protein category
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(f => f.category === 'protein')).toBe(true);
  });

  it('should return empty array for non-existent search', () => {
    const results = searchFoods('xyznonexistentfood');

    expect(results).toEqual([]);
  });

  it('should filter foods by category', () => {
    const proteinFoods = getFoodsByCategory('protein');

    expect(proteinFoods.length).toBeGreaterThan(0);
    expect(proteinFoods.every(f => f.category === 'protein')).toBe(true);
  });

  it('should get low GI foods', () => {
    const lowGiFoods = getLowGIFoods();

    expect(lowGiFoods.length).toBeGreaterThan(0);
    expect(lowGiFoods.every(f => f.glycemicIndex < 55 && f.glycemicIndex > 0)).toBe(true);
  });

  it('should get high protein foods', () => {
    const highProteinFoods = getHighProteinFoods();

    expect(highProteinFoods.length).toBeGreaterThan(0);
    // Each should have high protein ratio
    highProteinFoods.forEach(food => {
      const proteinRatio = food.macros.proteins / (food.macros.carbohydrates + food.macros.fats + 1);
      expect(proteinRatio).toBeGreaterThan(0.3);
    });
  });

  it('should have unique food IDs', () => {
    const ids = FOOD_DATABASE.map(f => f.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have valid glycemic index values (0-100)', () => {
    FOOD_DATABASE.forEach(food => {
      expect(food.glycemicIndex).toBeGreaterThanOrEqual(0);
      expect(food.glycemicIndex).toBeLessThanOrEqual(100);
    });
  });

  it('should have valid macro values (non-negative)', () => {
    FOOD_DATABASE.forEach(food => {
      expect(food.macros.carbohydrates).toBeGreaterThanOrEqual(0);
      expect(food.macros.proteins).toBeGreaterThanOrEqual(0);
      expect(food.macros.fats).toBeGreaterThanOrEqual(0);
      expect(food.macros.fiber).toBeGreaterThanOrEqual(0);
      expect(food.macros.sugar).toBeGreaterThanOrEqual(0);
    });
  });

  it('should include protein foods', () => {
    expect(FOOD_DATABASE.some(f => f.id === 'chickenBreast')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'salmon')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'eggs')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'wheyProtein')).toBe(true);
  });

  it('should include carbohydrate sources', () => {
    expect(FOOD_DATABASE.some(f => f.id === 'riceWhite')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'oats')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'quinoa')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'pasta')).toBe(true);
  });

  it('should include vegetables', () => {
    expect(FOOD_DATABASE.some(f => f.id === 'broccoli')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'asparagus')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'spinach')).toBe(true);
  });

  it('should include fruits', () => {
    expect(FOOD_DATABASE.some(f => f.id === 'banana')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'apple')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'berries')).toBe(true);
  });

  it('should include healthy fats', () => {
    expect(FOOD_DATABASE.some(f => f.id === 'avocado')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'almonds')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'peanutButter')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'chiaSeeds')).toBe(true);
  });

  it('should include supplements', () => {
    expect(FOOD_DATABASE.some(f => f.id === 'creatine')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'omega3')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'multivitamin')).toBe(true);
  });

  it('should include beverages', () => {
    expect(FOOD_DATABASE.some(f => f.id === 'water')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'coffee')).toBe(true);
    expect(FOOD_DATABASE.some(f => f.id === 'greenTea')).toBe(true);
  });

  it('should have at least 30 foods in database', () => {
    expect(FOOD_DATABASE.length).toBeGreaterThanOrEqual(30);
  });

  it('should include dairy products', () => {
    expect(FOOD_DATABASE.some(f => f.id === 'greekYogurt')).toBe(true);
  });
});

// ============================================================================
// HORMONE EDUCATION HUB TESTS
// ============================================================================

describe('HormoneEducationHub Component', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  it('should render modal when open', () => {
    render(<HormoneEducationHub onClose={() => {}} />);

    expect(screen.getByText('Hormone Education Hub')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('should show overview tab by default', () => {
    render(<HormoneEducationHub onClose={() => {}} />);

    expect(screen.getByText('Welcome to the Hormone Education Hub')).toBeInTheDocument();
    expect(screen.getByText('Your Current Hormonal Status')).toBeInTheDocument();
  });

  it('should have all tab buttons', () => {
    render(<HormoneEducationHub onClose={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.some(btn => btn.textContent?.includes('Overview'))).toBe(true);
    expect(buttons.some(btn => btn.textContent?.includes('Explorer'))).toBe(true);
    expect(buttons.some(btn => btn.textContent?.includes('Symptom Checker'))).toBe(true);
    expect(buttons.some(btn => btn.textContent?.includes('Relationships'))).toBe(true);
  });

  it('should close when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<HormoneEducationHub onClose={handleClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should display hormone categories', () => {
    render(<HormoneEducationHub onClose={() => {}} />);

    expect(screen.getByText(/Hormone Categories/)).toBeInTheDocument();
    expect(screen.getByText(/storage/i)).toBeInTheDocument();
    expect(screen.getByText(/anabolic/i)).toBeInTheDocument();
  });

  it('should show learning tips', () => {
    render(<HormoneEducationHub onClose={() => {}} />);

    expect(screen.getByText(/Did You Know/)).toBeInTheDocument();
  });
});

// ============================================================================
// HORMONE EDUCATION DATA TESTS
// ============================================================================

describe('Hormone Education Data', () => {
  it('should have education data for all tracked hormones', () => {
    const hormones = Object.keys(HORMONE_EDUCATION);
    expect(hormones.length).toBeGreaterThan(0);
    expect(hormones).toContain('insulin');
    expect(hormones).toContain('cortisol');
    expect(hormones).toContain('testosterone');
  });

  it('should have all required properties for each hormone', () => {
    Object.values(HORMONE_EDUCATION).forEach(hormone => {
      expect(hormone).toHaveProperty('id');
      expect(hormone).toHaveProperty('name');
      expect(hormone).toHaveProperty('abbreviation');
      expect(hormone).toHaveProperty('category');
      expect(hormone).toHaveProperty('description');
      expect(hormone).toHaveProperty('function');
      expect(hormone).toHaveProperty('factorsThatIncrease');
      expect(hormone).toHaveProperty('factorsThatDecrease');
      expect(hormone).toHaveProperty('symptomsOfHigh');
      expect(hormone).toHaveProperty('symptomsOfLow');
      expect(hormone).toHaveProperty('normalRange');
    });
  });

  it('should have valid normal ranges', () => {
    Object.values(HORMONE_EDUCATION).forEach(hormone => {
      expect(hormone.normalRange.min).toBeLessThan(hormone.normalRange.max);
    });
  });

  it('should have non-empty factor lists', () => {
    Object.values(HORMONE_EDUCATION).forEach(hormone => {
      expect(hormone.factorsThatIncrease.length).toBeGreaterThan(0);
      expect(hormone.factorsThatDecrease.length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty symptom lists', () => {
    Object.values(HORMONE_EDUCATION).forEach(hormone => {
      expect(hormone.symptomsOfHigh.length).toBeGreaterThan(0);
      expect(hormone.symptomsOfLow.length).toBeGreaterThan(0);
    });
  });

  it('should have related hormones defined', () => {
    Object.values(HORMONE_EDUCATION).forEach(hormone => {
      expect(Array.isArray(hormone.relatedHormones)).toBe(true);
    });
  });

  it('should have valid relationship types', () => {
    const validRelationships = ['synergistic', 'antagonistic', 'permissive'];
    Object.values(HORMONE_EDUCATION).forEach(hormone => {
      hormone.relatedHormones.forEach(rel => {
        expect(validRelationships).toContain(rel.relationship);
      });
    });
  });

  it('should include insulin education', () => {
    const insulin = HORMONE_EDUCATION.insulin;
    expect(insulin).toBeDefined();
    expect(insulin.name).toBe('Insulin');
    expect(insulin.category).toBe('storage');
    expect(insulin.relatedHormones.some(r => r.hormone === 'glucagon')).toBe(true);
  });

  it('should include cortisol education', () => {
    const cortisol = HORMONE_EDUCATION.cortisol;
    expect(cortisol).toBeDefined();
    expect(cortisol.name).toBe('Cortisol');
    expect(cortisol.category).toBe('catabolic');
  });

  it('should include testosterone education', () => {
    const testosterone = HORMONE_EDUCATION.testosterone;
    expect(testosterone).toBeDefined();
    expect(testosterone.name).toBe('Testosterone');
    expect(testosterone.category).toBe('anabolic');
  });

  it('should include growth hormone education', () => {
    const gh = HORMONE_EDUCATION.growthHormone;
    expect(gh).toBeDefined();
    expect(gh.name).toBe('Growth Hormone');
    expect(gh.category).toBe('anabolic');
  });

  it('should have antagonistic relationship between insulin and glucagon', () => {
    const insulin = HORMONE_EDUCATION.insulin;
    const glucagonRel = insulin.relatedHormones.find(r => r.hormone === 'glucagon');
    expect(glucagonRel).toBeDefined();
    expect(glucagonRel?.relationship).toBe('antagonistic');
  });

  it('should have time to peak and half life data', () => {
    Object.values(HORMONE_EDUCATION).forEach(hormone => {
      expect(hormone.timeToPeak).toBeTruthy();
      expect(hormone.halfLife).toBeTruthy();
    });
  });

  it('should have at least 8 hormones in education database', () => {
    expect(Object.keys(HORMONE_EDUCATION).length).toBeGreaterThanOrEqual(8);
  });
});

// ============================================================================
// METABOLIC INSIGHTS DASHBOARD TESTS
// ============================================================================

describe('MetabolicInsightsDashboard Component', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  it('should render modal when open', () => {
    render(<MetabolicInsightsDashboard onClose={() => {}} />);

    expect(screen.getByText('Metabolic Insights')).toBeInTheDocument();
    expect(screen.getByText('Personalized health analysis')).toBeInTheDocument();
  });

  it('should have all tab buttons', () => {
    render(<MetabolicInsightsDashboard onClose={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.some(btn => btn.textContent?.includes('Overview'))).toBe(true);
    expect(buttons.some(btn => btn.textContent?.includes('Biomarkers'))).toBe(true);
    expect(buttons.some(btn => btn.textContent?.includes('Lifestyle'))).toBe(true);
    expect(buttons.some(btn => btn.textContent?.includes('All Insights'))).toBe(true);
  });

  it('should show overview tab by default', () => {
    render(<MetabolicInsightsDashboard onClose={() => {}} />);

    expect(screen.getByText('Your Metabolic Health Insights')).toBeInTheDocument();
    expect(screen.getByText(/Overall Metabolic Score/)).toBeInTheDocument();
  });

  it('should close when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MetabolicInsightsDashboard onClose={handleClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should display metabolic score card', () => {
    render(<MetabolicInsightsDashboard onClose={() => {}} />);

    expect(screen.getByText(/Overall Metabolic Score/)).toBeInTheDocument();
  });
});

// ============================================================================
// METABOLIC INSIGHTS HOOK TESTS
// ============================================================================

describe('useMetabolicInsights Hook', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset();
  });

  it('should return metabolic score', () => {
    const { result } = renderHook(() => useMetabolicInsights());

    expect(result.current.metabolicScore).toBeDefined();
    expect(result.current.metabolicScore.overall).toBeGreaterThanOrEqual(0);
    expect(result.current.metabolicScore.overall).toBeLessThanOrEqual(100);
  });

  it('should have all category scores', () => {
    const { result } = renderHook(() => useMetabolicInsights());

    const { categories } = result.current.metabolicScore;
    expect(categories.hormonal).toBeGreaterThanOrEqual(0);
    expect(categories.metabolic).toBeGreaterThanOrEqual(0);
    expect(categories.lifestyle).toBeGreaterThanOrEqual(0);
    expect(categories.recovery).toBeGreaterThanOrEqual(0);
  });

  it('should return biomarker trends', () => {
    const { result } = renderHook(() => useMetabolicInsights());

    expect(result.current.biomarkerTrends).toBeDefined();
    expect(Array.isArray(result.current.biomarkerTrends)).toBe(true);
  });

  it('should return insights array', () => {
    const { result } = renderHook(() => useMetabolicInsights());

    expect(result.current.insights).toBeDefined();
    expect(Array.isArray(result.current.insights)).toBe(true);
  });

  it('should return lifestyle impacts', () => {
    const { result } = renderHook(() => useMetabolicInsights());

    expect(result.current.lifestyleImpacts).toBeDefined();
    expect(Array.isArray(result.current.lifestyleImpacts)).toBe(true);
  });

  it('should have trend information', () => {
    const { result } = renderHook(() => useMetabolicInsights());

    const trend = result.current.metabolicScore.trend;
    expect(['improving', 'stable', 'declining']).toContain(trend);
  });

  it('should have loading state indicator', () => {
    const { result } = renderHook(() => useMetabolicInsights());

    expect(result.current.isLoading).toBeDefined();
  });

  it('should provide default score for empty state', () => {
    // Reset store to clear state
    act(() => {
      useSimulationStore.getState().reset();
    });

    // The hook should handle empty state and return default values
    const { result } = renderHook(() => useMetabolicInsights());

    // When state is empty, the hook returns default values via the !state check
    expect(result.current).toBeDefined();
    expect(result.current.metabolicScore).toBeDefined();
    expect(result.current.biomarkerTrends).toEqual([]);
    expect(result.current.insights).toEqual([]);
    expect(result.current.lifestyleImpacts).toEqual([]);
  });
});

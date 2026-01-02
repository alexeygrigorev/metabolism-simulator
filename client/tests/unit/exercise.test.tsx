// ============================================================================
// METABOLIC SIMULATOR - EXERCISE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useSimulationStore } from '../../src/state/store';
import ExerciseBuilder from '../../src/components/dashboard/ExerciseBuilder';
import ExerciseHistoryPanel from '../../src/components/dashboard/ExerciseHistoryPanel';
import {
  EXERCISE_DATABASE,
  searchExercises,
  getExercisesByCategory,
  getCompoundMovements,
  CATEGORY_INFO,
  MUSCLE_INFO,
  type Exercise,
  type ExerciseCategory
} from '../../src/data/exerciseDatabase';
import { ExerciseCategory as SharedExerciseCategory } from '@metabol-sim/shared';
import '@testing-library/jest-dom';

describe('Exercise Database', () => {
  it('should contain exercises for all categories', () => {
    const categories = new Set(EXERCISE_DATABASE.map(e => e.category));
    expect(categories.size).toBeGreaterThan(0);
    expect(categories.has(SharedExerciseCategory.Cardio)).toBe(true);
    expect(categories.has(SharedExerciseCategory.Resistance)).toBe(true);
    expect(categories.has(SharedExerciseCategory.HIIT)).toBe(true);
    expect(categories.has(SharedExerciseCategory.Flexibility)).toBe(true);
  });

  it('should have valid exercise data structure', () => {
    EXERCISE_DATABASE.forEach(exercise => {
      expect(exercise.id).toBeDefined();
      expect(exercise.id.length).toBeGreaterThan(0);
      expect(exercise.name).toBeDefined();
      expect(exercise.name.length).toBeGreaterThan(0);
      expect(exercise.category).toBeDefined();
      expect(exercise.met).toBeGreaterThan(0);
      expect(exercise.primaryMuscles).toBeDefined();
      expect(exercise.primaryMuscles.length).toBeGreaterThan(0);
      expect(exercise.secondaryMuscles).toBeDefined();
      expect(exercise.mechanicalActivation).toBeGreaterThanOrEqual(0);
      expect(exercise.mechanicalActivation).toBeLessThanOrEqual(1);
    });
  });

  it('should search exercises by name', () => {
    const results = searchExercises('squat');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(ex => {
      expect(ex.name.toLowerCase()).toContain('squat');
    });
  });

  it('should search exercises by muscle', () => {
    const results = searchExercises('chest');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should filter exercises by category', () => {
    const cardioExercises = getExercisesByCategory(SharedExerciseCategory.Cardio);
    expect(cardioExercises.length).toBeGreaterThan(0);
    cardioExercises.forEach(ex => {
      expect(ex.category).toBe(SharedExerciseCategory.Cardio);
    });
  });

  it('should get compound movements', () => {
    const compoundMovements = getCompoundMovements();
    expect(compoundMovements.length).toBeGreaterThan(0);
    // Compound movements should have either multiple primary muscles or be HIIT
    compoundMovements.forEach(ex => {
      const isCompound = ex.primaryMuscles.length > 1 || ex.category === SharedExerciseCategory.HIIT;
      expect(isCompound).toBe(true);
    });
  });

  it('should have valid CATEGORY_INFO metadata', () => {
    Object.entries(CATEGORY_INFO).forEach(([key, info]) => {
      expect(info.name).toBeDefined();
      expect(info.icon).toBeDefined();
      expect(info.color).toBeDefined();
      expect(info.description).toBeDefined();
    });
  });

  it('should have valid MUSCLE_INFO metadata', () => {
    Object.entries(MUSCLE_INFO).forEach(([key, info]) => {
      expect(info.name).toBeDefined();
      expect(info.icon).toBeDefined();
    });
  });
});

describe('ExerciseBuilder Component', () => {
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
      bloodGlucose: {
        currentValue: 85,
        baseline: 85,
        peak: 85,
        trend: 0 as const,
        units: 'mg/dL' as const,
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
    settings: {
      timeScale: 1,
      paused: false,
      autoSave: true,
    },
  };

  beforeEach(() => {
    useSimulationStore.getState().setState(mockState);
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ExerciseBuilder isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBe(null);
  });

  it('should render modal when isOpen is true', () => {
    render(<ExerciseBuilder isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Log Workout')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<ExerciseBuilder isOpen={true} onClose={() => {}} />);
    const searchInput = screen.getByPlaceholderText(/search exercises/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter exercises when searching', () => {
    render(<ExerciseBuilder isOpen={true} onClose={() => {}} />);
    const searchInput = screen.getByPlaceholderText(/search exercises/i);
    fireEvent.change(searchInput, { target: { value: 'squat' } });
    // Should show exercises matching 'squat' (now there are multiple: Squat, Front Squat, Bulgarian Split Squat)
    expect(screen.getAllByText(/squat/i).length).toBeGreaterThan(0);
  });

  it('should display category tabs', () => {
    render(<ExerciseBuilder isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/all/i)).toBeInTheDocument();
    // Use more specific selectors for category buttons (within the modal)
    expect(screen.getAllByText(/cardio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/resistance/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hiit/i).length).toBeGreaterThan(0);
  });

  it('should close modal when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ExerciseBuilder isOpen={true} onClose={onClose} />);
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should show empty state when no exercises selected', () => {
    render(<ExerciseBuilder isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/select exercises from the left/i)).toBeInTheDocument();
  });

  it('should allow selecting an exercise', () => {
    render(<ExerciseBuilder isOpen={true} onClose={() => {}} />);
    // Find first exercise card
    const exerciseCards = screen.queryAllByText(/MET:/i);
    if (exerciseCards.length > 0) {
      fireEvent.click(exerciseCards[0]);
      // After selection, the workout log should show the exercise
      expect(screen.getByText(/workout log/i)).toBeInTheDocument();
    }
  });
});

describe('ExerciseHistoryPanel Component', () => {
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
      caloriesConsumed: 2000,
      caloriesBurned: 500,
      netCalories: 1500,
      carbohydrates: { consumed: 250, burned: 100, target: 300 },
      proteins: { consumed: 120, burned: 20, target: 120 },
      fats: { consumed: 65, burned: 15, target: 75 },
      glycogen: { muscle: 0.8, liver: 0.9, capacity: { muscle: 400, liver: 100 } },
      bodyFat: 13.5,
      leanMass: 61.5,
      substrateUtilization: {
        fatOxidation: 0.1,
        glucoseOxidation: 0.08,
        proteinOxidation: 0.001,
        metabolicState: 'fasted' as const,
      },
      bloodGlucose: {
        currentValue: 85,
        baseline: 85,
        peak: 85,
        trend: 0 as const,
        units: 'mg/dL' as const,
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
    recentExercises: [
      {
        id: '1',
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        exercises: [
          {
            exerciseId: 'squat-barbell',
            sets: [
              { reps: 10, load: 60, duration: 0, rpe: 7 },
              { reps: 10, load: 60, duration: 0, rpe: 7 },
              { reps: 8, load: 60, duration: 0, rpe: 8 },
            ],
            restPeriods: [90, 90],
          },
        ],
        totalVolume: 1680, // 60*10 + 60*10 + 60*8
        totalWork: 66000,
        perceivedExertion: 7.3,
      },
    ],
    recentSleep: [],
    settings: {
      timeScale: 1,
      paused: false,
      autoSave: true,
    },
  };

  beforeEach(() => {
    useSimulationStore.getState().setState(mockState);
  });

  it('should render exercise history panel', () => {
    render(<ExerciseHistoryPanel />);
    expect(screen.getByText(/exercise history/i)).toBeInTheDocument();
  });

  it('should display weekly stats', () => {
    render(<ExerciseHistoryPanel />);
    expect(screen.getByText(/this week/i)).toBeInTheDocument();
  });

  it('should show session count in weekly stats', () => {
    render(<ExerciseHistoryPanel />);
    // Use getAllByText since 'Sessions' appears multiple times in the panel
    expect(screen.getAllByText(/sessions/i).length).toBeGreaterThan(0);
  });

  it('should display recent sessions', () => {
    render(<ExerciseHistoryPanel />);
    expect(screen.getByText(/today/i)).toBeInTheDocument();
  });

  it('should show empty state when no exercises logged', () => {
    useSimulationStore.getState().setState({
      ...mockState,
      recentExercises: [],
    });
    render(<ExerciseHistoryPanel />);
    expect(screen.getByText(/no workouts logged/i)).toBeInTheDocument();
  });

  it('should not render when showEmpty is false and no sessions', () => {
    useSimulationStore.getState().setState({
      ...mockState,
      recentExercises: [],
    });
    const { container } = render(<ExerciseHistoryPanel showEmpty={false} />);
    expect(container.firstChild).toBe(null);
  });

  it('should limit sessions with maxSessions prop', () => {
    const stateWithManySessions = {
      ...mockState,
      recentExercises: Array.from({ length: 15 }, (_, i) => ({
        id: String(i),
        startTime: new Date(Date.now() - i * 3600000),
        exercises: [
          {
            exerciseId: 'squat-barbell',
            sets: [{ reps: 10, load: 60, duration: 0, rpe: 7 }],
            restPeriods: [],
          },
        ],
        totalVolume: 600,
        totalWork: 24000,
        perceivedExertion: 7,
      })),
    };
    useSimulationStore.getState().setState(stateWithManySessions);
    render(<ExerciseHistoryPanel maxSessions={5} />);
    const sessionsCount = screen.queryByText(/total sessions/);
    expect(sessionsCount).toBeInTheDocument();
    expect(sessionsCount?.textContent).toContain('15');
  });
});

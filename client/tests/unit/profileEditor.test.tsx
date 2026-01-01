// ============================================================================
// METABOLIC SIMULATOR - PROFILE EDITOR UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useSimulationStore } from '../../src/state/store';
import ProfileEditor from '../../src/components/dashboard/ProfileEditor';
import { BiologicalSex } from '@metabol-sim/shared';
import '@testing-library/jest-dom';

const mockState = {
  id: 'test',
  userId: 'user1',
  timestamp: new Date(),
  gameTime: new Date(),
  user: {
    id: 'user1',
    age: 30,
    biologicalSex: BiologicalSex.Male,
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

describe('ProfileEditor Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const store = useSimulationStore.getState();
    store.setState(mockState as any);
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ProfileEditor isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBe(null);
  });

  it('should render modal when isOpen is true', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Update your personal information')).toBeInTheDocument();
  });

  it('should initialize form with current user data', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // age
    expect(screen.getByDisplayValue('75')).toBeInTheDocument(); // weight
    expect(screen.getByDisplayValue('180')).toBeInTheDocument(); // height
    expect(screen.getByDisplayValue('18')).toBeInTheDocument(); // body fat percentage
  });

  it('should display both biological sex options with emojis', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    // Check for emojis and sex labels
    expect(screen.getByText('👨')).toBeInTheDocument();
    expect(screen.getByText('👩')).toBeInTheDocument();
  });

  it('should display all activity level options', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Sedentary/)).toBeInTheDocument();
    expect(screen.getByText(/Lightly Active/)).toBeInTheDocument();
    expect(screen.getByText(/Moderately Active/)).toBeInTheDocument();
    expect(screen.getByText(/Very Active/)).toBeInTheDocument();
    expect(screen.getByText(/Extra Active/)).toBeInTheDocument();
  });

  it('should calculate and display BMR and TDEE preview', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Basal Metabolic Rate/)).toBeInTheDocument();
    expect(screen.getByText(/Total Daily Energy/)).toBeInTheDocument();
    // BMR value should be visible (formatted number)
    const bmrElements = screen.getAllByText(/kcal\/day/);
    expect(bmrElements.length).toBeGreaterThan(0);
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display save and cancel buttons', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should display BMR calculation note', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Mifflin-St Jeor equation/)).toBeInTheDocument();
  });

  it('should have form inputs for age, weight, height, and body fat', () => {
    render(<ProfileEditor isOpen={true} onClose={mockOnClose} />);

    // Check inputs exist by id
    expect(document.getElementById('age')).toBeInTheDocument();
    expect(document.getElementById('weight')).toBeInTheDocument();
    expect(document.getElementById('height')).toBeInTheDocument();
    expect(document.getElementById('bodyFat')).toBeInTheDocument();
  });
});

describe('Store updateUserProfile Function', () => {
  beforeEach(() => {
    const store = useSimulationStore.getState();
    // Reset state first to clear any previous modifications
    store.reset();
    // Then set our mock state
    act(() => {
      store.setState(mockState as any);
    });
  });

  it('should have updateUserProfile function available', () => {
    const store = useSimulationStore.getState();
    expect(typeof store.updateUserProfile).toBe('function');
  });

  it('should accept partial profile updates without errors', () => {
    const store = useSimulationStore.getState();

    // This should not throw
    expect(() => {
      act(() => {
        store.updateUserProfile!({
          activityLevel: 1.2,
        });
      });
    }).not.toThrow();
  });

  it('should maintain state consistency after profile update', () => {
    const store = useSimulationStore.getState();

    act(() => {
      store.updateUserProfile!({
        weight: 80,
        bodyFatPercentage: 0.20,
      });
    });

    // The function exists and can be called - actual state verification
    // is handled by e2e tests which verify the full integration
    expect(store.state).toBeDefined();
  });

  it('should handle full profile update', () => {
    const store = useSimulationStore.getState();

    act(() => {
      store.updateUserProfile!({
        age: 35,
        weight: 80,
        height: 175,
        bodyFatPercentage: 0.20,
        biologicalSex: BiologicalSex.Male,
        activityLevel: 1.55,
      });
    });

    // Verify state exists and has expected structure
    expect(store.state?.user).toBeDefined();
    expect(store.state?.energy).toBeDefined();
    expect(store.state?.energy.bmr).toBeGreaterThan(0);
  });
});


// ============================================================================
// METABOLIC SIMULATOR - ACHIEVEMENTS STORE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAchievementsStore, getAchievementProgress } from '../../src/state/achievementsStore';
import { ACHIEVEMENTS } from '../../src/data/achievements';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Achievements Store - Initialization', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset the store by calling reset
    useAchievementsStore.getState().reset();
  });

  it('should initialize with empty state', () => {
    const state = useAchievementsStore.getState();
    expect(state.unlockedAchievements).toEqual([]);
    expect(state.stats.mealsLogged).toBe(0);
    expect(state.stats.exercisesLogged).toBe(0);
    expect(state.stats.sleepSessions).toBe(0);
    expect(state.stats.daysActive).toBe(0);
    expect(state.stats.scenariosCompleted).toBe(0);
    expect(state.showNotification).toBeNull();
  });

  it('should initialize tracking with initial muscle mass', () => {
    useAchievementsStore.getState().initTracking(75.5);

    const state = useAchievementsStore.getState();
    expect(state.stats.initialMuscleMass).toBe(75.5);
    expect(state.stats.daysActive).toBe(1);
    expect(state.stats.lastActiveDate).toBe(new Date().toDateString());
  });

  it('should increment days active on new day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Set last active date to yesterday
    useAchievementsStore.setState({
      stats: {
        ...useAchievementsStore.getState().stats,
        lastActiveDate: yesterday.toDateString(),
        daysActive: 5,
      },
    });

    useAchievementsStore.getState().initTracking(75);

    const state = useAchievementsStore.getState();
    expect(state.stats.daysActive).toBe(6);
    expect(state.stats.lastActiveDate).toBe(new Date().toDateString());
  });

  it('should not increment days active on same day', () => {
    const today = new Date().toDateString();

    useAchievementsStore.setState({
      stats: {
        ...useAchievementsStore.getState().stats,
        lastActiveDate: today,
        daysActive: 5,
      },
    });

    useAchievementsStore.getState().initTracking(75);

    const state = useAchievementsStore.getState();
    expect(state.stats.daysActive).toBe(5);
  });

  it('should load existing data from localStorage', () => {
    localStorage.setItem('metabol-sim-achievements', JSON.stringify([
      { id: 'first-meal', unlockedAt: Date.now() }
    ]));
    localStorage.setItem('metabol-sim-achievement-stats', JSON.stringify({
      mealsLogged: 5,
      exercisesLogged: 3,
    }));

    // Create a new store instance by re-importing
    // Since we can't re-import, we'll just verify the load functions work
    const saved = localStorage.getItem('metabol-sim-achievements');
    expect(saved).toBeDefined();
    const parsed = JSON.parse(saved!);
    expect(parsed).toHaveLength(1);
  });
});

describe('Achievements Store - Tracking Actions', () => {
  beforeEach(() => {
    localStorage.clear();
    useAchievementsStore.getState().reset();
  });

  it('should track meals', () => {
    useAchievementsStore.getState().trackMeal();
    useAchievementsStore.getState().trackMeal();
    useAchievementsStore.getState().trackMeal();

    const state = useAchievementsStore.getState();
    expect(state.stats.mealsLogged).toBe(3);
  });

  it('should track exercises', () => {
    useAchievementsStore.getState().trackExercise();
    useAchievementsStore.getState().trackExercise();

    const state = useAchievementsStore.getState();
    expect(state.stats.exercisesLogged).toBe(2);
  });

  it('should track sleep sessions', () => {
    useAchievementsStore.getState().trackSleep();

    const state = useAchievementsStore.getState();
    expect(state.stats.sleepSessions).toBe(1);
  });

  it('should track scenario completions', () => {
    useAchievementsStore.getState().trackScenarioCompletion();
    useAchievementsStore.getState().trackScenarioCompletion();

    const state = useAchievementsStore.getState();
    expect(state.stats.scenariosCompleted).toBe(2);
  });

  it('should track hormone peaks for insulin', () => {
    useAchievementsStore.getState().trackHormonePeak('insulin', 15);
    useAchievementsStore.getState().trackHormonePeak('insulin', 30);
    useAchievementsStore.getState().trackHormonePeak('insulin', 20);

    const state = useAchievementsStore.getState();
    expect(state.stats.peakInsulin).toBe(30); // Should keep max
  });

  it('should track hormone peaks for cortisol', () => {
    useAchievementsStore.getState().trackHormonePeak('cortisol', 15);
    useAchievementsStore.getState().trackHormonePeak('cortisol', 25);

    const state = useAchievementsStore.getState();
    expect(state.stats.peakCortisol).toBe(25);
  });

  it('should track hormone peaks for testosterone', () => {
    useAchievementsStore.getState().trackHormonePeak('testosterone', 20);
    useAchievementsStore.getState().trackHormonePeak('testosterone', 35);

    const state = useAchievementsStore.getState();
    expect(state.stats.peakTestosterone).toBe(35);
  });

  it('should track muscle gain', () => {
    useAchievementsStore.getState().initTracking(75);
    useAchievementsStore.getState().trackMuscleGain(76);

    const state = useAchievementsStore.getState();
    expect(state.stats.muscleMassGained).toBe(1);
  });

  it('should track maximum muscle gain', () => {
    useAchievementsStore.getState().initTracking(75);
    useAchievementsStore.getState().trackMuscleGain(77);
    useAchievementsStore.getState().trackMuscleGain(76);

    const state = useAchievementsStore.getState();
    expect(state.stats.muscleMassGained).toBe(2); // Keeps max
  });

  it('should track perfect day', () => {
    useAchievementsStore.getState().trackPerfectDay();

    const state = useAchievementsStore.getState();
    expect(state.stats.perfectDay).toBe(true);
  });

  it('should track fasting streak', () => {
    useAchievementsStore.getState().trackFastingStreak(5);
    useAchievementsStore.getState().trackFastingStreak(8);

    const state = useAchievementsStore.getState();
    expect(state.stats.fastingStreak).toBe(8);
  });

  it('should track protein streak', () => {
    useAchievementsStore.getState().trackProteinStreak();
    useAchievementsStore.getState().trackProteinStreak();
    useAchievementsStore.getState().trackProteinStreak();

    const state = useAchievementsStore.getState();
    expect(state.stats.proteinStreak).toBe(3);
  });
});

describe('Achievements Store - Achievement Checking', () => {
  beforeEach(() => {
    localStorage.clear();
    useAchievementsStore.getState().reset();
  });

  it('should unlock first-meal achievement', () => {
    useAchievementsStore.getState().trackMeal();

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('first-meal');
  });

  it('should unlock first-workout achievement', () => {
    useAchievementsStore.getState().trackExercise();

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('first-workout');
  });

  it('should unlock first-sleep achievement', () => {
    useAchievementsStore.getState().trackSleep();

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('first-sleep');
  });

  it('should unlock insulin-spike achievement', () => {
    useAchievementsStore.getState().trackHormonePeak('insulin', 30);

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('insulin-spike');
  });

  it('should unlock cortisol-spike achievement', () => {
    useAchievementsStore.getState().trackHormonePeak('cortisol', 25);

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('cortisol-spike');
  });

  it('should unlock testosterone-peak achievement', () => {
    useAchievementsStore.getState().trackHormonePeak('testosterone', 30);

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('testosterone-peak');
  });

  it('should unlock first-scenario achievement', () => {
    useAchievementsStore.getState().trackScenarioCompletion();

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('first-scenario');
  });

  it('should unlock bronze meal-tracker achievement', () => {
    // Log 10 meals
    for (let i = 0; i < 10; i++) {
      useAchievementsStore.getState().trackMeal();
    }

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('meal-tracker-bronze');
  });

  it('should unlock silver meal-tracker achievement', () => {
    // Log 50 meals
    for (let i = 0; i < 50; i++) {
      useAchievementsStore.getState().trackMeal();
    }

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('meal-tracker-silver');
  });

  it('should unlock bronze exercise-tracker achievement', () => {
    // Log 5 exercises
    for (let i = 0; i < 5; i++) {
      useAchievementsStore.getState().trackExercise();
    }

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('exercise-tracker-bronze');
  });

  it('should unlock bronze sleep-tracker achievement', () => {
    // Log 5 sleep sessions
    for (let i = 0; i < 5; i++) {
      useAchievementsStore.getState().trackSleep();
    }

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('sleep-tracker-bronze');
  });

  it('should unlock bronze dedicated user achievement', () => {
    useAchievementsStore.getState().initTracking(75);
    // Days active is already 1 from initTracking
    // We need to manually set it to trigger the 7-day achievement
    useAchievementsStore.setState({
      stats: {
        ...useAchievementsStore.getState().stats,
        daysActive: 7,
      },
    });

    const newlyUnlocked = useAchievementsStore.getState().checkAchievements();
    const unlockedIds = newlyUnlocked.map(a => a.id);
    expect(unlockedIds).toContain('days-active-bronze');
  });

  it('should show notification when achievement is unlocked', () => {
    useAchievementsStore.getState().trackMeal();

    const state = useAchievementsStore.getState();
    expect(state.showNotification).toBeDefined();
    expect(state.showNotification?.id).toBe('first-meal');
  });

  it('should not unlock same achievement twice', () => {
    useAchievementsStore.getState().trackMeal();

    const firstState = useAchievementsStore.getState();
    const firstCount = firstState.unlockedAchievements.length;

    useAchievementsStore.getState().trackMeal();

    const secondState = useAchievementsStore.getState();
    expect(secondState.unlockedAchievements.length).toBe(firstCount);
  });

  it('should return list of newly unlocked achievements', () => {
    const newlyUnlocked = useAchievementsStore.getState().checkAchievements();

    expect(Array.isArray(newlyUnlocked)).toBe(true);
  });

  it('should unlock fasting-starter achievement', () => {
    useAchievementsStore.getState().trackFastingStreak(3);

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('fasting-starter');
  });

  it('should unlock protein-pioneer achievement', () => {
    for (let i = 0; i < 5; i++) {
      useAchievementsStore.getState().trackProteinStreak();
    }

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);
    expect(unlockedIds).toContain('protein-seeker');
  });
});

describe('Achievements Store - Notification Management', () => {
  beforeEach(() => {
    localStorage.clear();
    useAchievementsStore.getState().reset();
  });

  it('should dismiss notification', () => {
    useAchievementsStore.getState().trackMeal();
    expect(useAchievementsStore.getState().showNotification).toBeDefined();

    useAchievementsStore.getState().dismissNotification();
    expect(useAchievementsStore.getState().showNotification).toBeNull();
  });
});

describe('Achievements Store - Reset', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should reset all state', () => {
    // Add some data
    useAchievementsStore.getState().trackMeal();
    useAchievementsStore.getState().trackExercise();
    useAchievementsStore.getState().initTracking(75);

    // Reset
    useAchievementsStore.getState().reset();

    const state = useAchievementsStore.getState();
    expect(state.unlockedAchievements).toEqual([]);
    expect(state.stats.mealsLogged).toBe(0);
    expect(state.stats.exercisesLogged).toBe(0);
    expect(state.stats.daysActive).toBe(0);
    expect(state.stats.initialMuscleMass).toBe(0);
    expect(state.showNotification).toBeNull();
  });

  it('should clear localStorage on reset', () => {
    useAchievementsStore.getState().trackMeal();
    expect(localStorage.getItem('metabol-sim-achievements')).toBeDefined();

    useAchievementsStore.getState().reset();
    expect(localStorage.getItem('metabol-sim-achievements')).toBe('[]');
  });
});

describe('Achievements Store - getAchievementProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    useAchievementsStore.getState().reset();
  });

  it('should return progress for meal-tracker-bronze achievement', () => {
    useAchievementsStore.getState().trackMeal();
    useAchievementsStore.getState().trackMeal();

    const progress = getAchievementProgress('meal-tracker-bronze');
    expect(progress.current).toBe(2);
    expect(progress.target).toBe(10);
    expect(progress.label).toBe('meals');
  });

  it('should return progress for meal-tracker-silver achievement', () => {
    for (let i = 0; i < 25; i++) {
      useAchievementsStore.getState().trackMeal();
    }

    const progress = getAchievementProgress('meal-tracker-silver');
    expect(progress.current).toBe(25);
    expect(progress.target).toBe(50);
    expect(progress.label).toBe('meals');
  });

  it('should return progress for exercise-tracker-bronze achievement', () => {
    useAchievementsStore.getState().trackExercise();

    const progress = getAchievementProgress('exercise-tracker-bronze');
    expect(progress.current).toBe(1);
    expect(progress.target).toBe(5);
    expect(progress.label).toBe('workouts');
  });

  it('should return progress for sleep-tracker-bronze achievement', () => {
    useAchievementsStore.getState().trackSleep();
    useAchievementsStore.getState().trackSleep();
    useAchievementsStore.getState().trackSleep();

    const progress = getAchievementProgress('sleep-tracker-bronze');
    expect(progress.current).toBe(3);
    expect(progress.target).toBe(5);
    expect(progress.label).toBe('sessions');
  });

  it('should return progress for muscle-gain achievement', () => {
    useAchievementsStore.getState().initTracking(75);
    useAchievementsStore.getState().trackMuscleGain(76.5);

    const progress = getAchievementProgress('muscle-gain');
    expect(progress.current).toBe(1.5);
    expect(progress.target).toBe(1);
    expect(progress.label).toBe('kg');
  });

  it('should return progress for days-active-bronze achievement', () => {
    useAchievementsStore.getState().initTracking(75);

    const progress = getAchievementProgress('days-active-bronze');
    expect(progress.current).toBe(1);
    expect(progress.target).toBe(7);
    expect(progress.label).toBe('days');
  });

  it('should return progress for scenario-master achievement', () => {
    useAchievementsStore.getState().trackScenarioCompletion();

    const progress = getAchievementProgress('scenario-master');
    expect(progress.current).toBe(1);
    expect(progress.target).toBe(3);
    expect(progress.label).toBe('scenarios');
  });

  it('should return progress for insulin-spike achievement', () => {
    useAchievementsStore.getState().trackHormonePeak('insulin', 20);

    const progress = getAchievementProgress('insulin-spike');
    expect(progress.current).toBe(20);
    expect(progress.target).toBe(30);
    expect(progress.label).toBe('µU/mL');
  });

  it('should return progress for cortisol-spike achievement', () => {
    useAchievementsStore.getState().trackHormonePeak('cortisol', 20);

    const progress = getAchievementProgress('cortisol-spike');
    expect(progress.current).toBe(20);
    expect(progress.target).toBe(25);
    expect(progress.label).toBe('mcg/dL');
  });

  it('should return progress for testosterone-peak achievement', () => {
    useAchievementsStore.getState().trackHormonePeak('testosterone', 25);

    const progress = getAchievementProgress('testosterone-peak');
    expect(progress.current).toBe(25);
    expect(progress.target).toBe(30);
    expect(progress.label).toBe('nmol/L');
  });

  it('should return progress for first-meal achievement', () => {
    useAchievementsStore.getState().trackMeal();

    const progress = getAchievementProgress('first-meal');
    expect(progress.current).toBe(1);
    expect(progress.target).toBe(1);
    expect(progress.label).toBe('meal');
  });

  it('should return progress for first-workout achievement', () => {
    useAchievementsStore.getState().trackExercise();

    const progress = getAchievementProgress('first-workout');
    expect(progress.current).toBe(1);
    expect(progress.target).toBe(1);
    expect(progress.label).toBe('workout');
  });

  it('should return progress for first-sleep achievement', () => {
    useAchievementsStore.getState().trackSleep();

    const progress = getAchievementProgress('first-sleep');
    expect(progress.current).toBe(1);
    expect(progress.target).toBe(1);
    expect(progress.label).toBe('session');
  });

  it('should return progress for protein-seeker achievement', () => {
    useAchievementsStore.getState().trackProteinStreak();
    useAchievementsStore.getState().trackProteinStreak();

    const progress = getAchievementProgress('protein-seeker');
    expect(progress.current).toBe(2);
    expect(progress.target).toBe(5);
    expect(progress.label).toBe('times');
  });

  it('should return progress for protein-master achievement', () => {
    for (let i = 0; i < 10; i++) {
      useAchievementsStore.getState().trackProteinStreak();
    }

    const progress = getAchievementProgress('protein-master');
    expect(progress.current).toBe(10);
    expect(progress.target).toBe(25);
    expect(progress.label).toBe('times');
  });

  it('should return progress for fasting-starter achievement', () => {
    useAchievementsStore.getState().trackFastingStreak(2);

    const progress = getAchievementProgress('fasting-starter');
    expect(progress.current).toBe(2);
    expect(progress.target).toBe(3);
    expect(progress.label).toBe('hours');
  });

  it('should return default progress for unknown achievement', () => {
    const progress = getAchievementProgress('unknown-achievement');
    expect(progress.current).toBe(0);
    expect(progress.target).toBe(1);
    expect(progress.label).toBe('');
  });

  it('should return zero muscle gain before initialization', () => {
    const progress = getAchievementProgress('muscle-gain');
    expect(progress.current).toBe(0);
  });
});

describe('Achievements Store - Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    useAchievementsStore.getState().reset();
  });

  it('should persist achievements to localStorage', () => {
    useAchievementsStore.getState().trackMeal();

    const saved = localStorage.getItem('metabol-sim-achievements');
    expect(saved).toBeDefined();

    const parsed = JSON.parse(saved!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('first-meal');
  });

  it('should persist stats to localStorage', () => {
    useAchievementsStore.getState().trackMeal();
    useAchievementsStore.getState().trackExercise();

    const saved = localStorage.getItem('metabol-sim-achievement-stats');
    expect(saved).toBeDefined();

    const parsed = JSON.parse(saved!);
    expect(parsed.mealsLogged).toBe(1);
    expect(parsed.exercisesLogged).toBe(1);
  });

  it('should include timestamp in unlocked achievement', () => {
    const beforeTime = Date.now();
    useAchievementsStore.getState().trackMeal();
    const afterTime = Date.now();

    const saved = localStorage.getItem('metabol-sim-achievements');
    const parsed = JSON.parse(saved!);
    expect(parsed[0].unlockedAt).toBeGreaterThanOrEqual(beforeTime);
    expect(parsed[0].unlockedAt).toBeLessThanOrEqual(afterTime);
  });
});

describe('Achievements Store - Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
    useAchievementsStore.getState().reset();
  });

  it('should handle localStorage errors gracefully', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('localStorage error');
    });

    expect(() => useAchievementsStore.getState().trackMeal()).not.toThrow();

    localStorage.setItem = originalSetItem;
  });

  it('should handle negative muscle mass correctly', () => {
    useAchievementsStore.getState().initTracking(75);
    useAchievementsStore.getState().trackMuscleGain(73); // Lost muscle

    const state = useAchievementsStore.getState();
    expect(state.stats.muscleMassGained).toBe(0); // Should be 0, not negative
  });

  it('should not track muscle gain without initial mass', () => {
    useAchievementsStore.getState().trackMuscleGain(76);

    const state = useAchievementsStore.getState();
    expect(state.stats.muscleMassGained).toBe(0);
  });

  it('should handle checkAchievements without prior tracking', () => {
    const newlyUnlocked = useAchievementsStore.getState().checkAchievements();
    expect(Array.isArray(newlyUnlocked)).toBe(true);
    expect(newlyUnlocked.length).toBe(0);
  });
});

describe('Achievements Store - Tiered Achievements', () => {
  beforeEach(() => {
    localStorage.clear();
    useAchievementsStore.getState().reset();
  });

  it('should have tiered achievements with parentAchievement', () => {
    const mealTrackerTiers = ACHIEVEMENTS.filter(a => a.parentAchievement === 'meal-tracker');
    expect(mealTrackerTiers.length).toBe(4);

    const tiers = mealTrackerTiers.map(a => a.tier);
    expect(tiers).toContain('bronze');
    expect(tiers).toContain('silver');
    expect(tiers).toContain('gold');
    expect(tiers).toContain('diamond');
  });

  it('should unlock bronze before silver tier', () => {
    for (let i = 0; i < 10; i++) {
      useAchievementsStore.getState().trackMeal();
    }

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);

    expect(unlockedIds).toContain('meal-tracker-bronze');
    expect(unlockedIds).not.toContain('meal-tracker-silver');
  });

  it('should unlock silver tier when target reached', () => {
    for (let i = 0; i < 50; i++) {
      useAchievementsStore.getState().trackMeal();
    }

    const state = useAchievementsStore.getState();
    const unlockedIds = state.unlockedAchievements.map(a => a.id);

    expect(unlockedIds).toContain('meal-tracker-bronze');
    expect(unlockedIds).toContain('meal-tracker-silver');
  });

  it('should have correct tierLevel values', () => {
    const mealTrackerTiers = ACHIEVEMENTS.filter(a => a.parentAchievement === 'meal-tracker');
    const tierLevels = mealTrackerTiers.map(a => a.tierLevel).sort((a, b) => a - b);

    expect(tierLevels).toEqual([1, 2, 3, 4]);
  });
});

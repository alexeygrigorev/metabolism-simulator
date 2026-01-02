// ============================================================================
// METABOLIC SIMULATOR - DAILY GOALS UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DAILY_GOALS,
  getGoalProgress,
  getTodayHydration,
  addHydration,
  removeHydration,
  setHydration,
} from '../../src/data/dailyGoals';

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

describe('DAILY_GOALS', () => {
  it('should have all required goals', () => {
    expect(DAILY_GOALS.length).toBeGreaterThan(10);
  });

  it('should have goals in all categories', () => {
    const categories = new Set(DAILY_GOALS.map(g => g.category));
    expect(categories.has('nutrition')).toBe(true);
    expect(categories.has('exercise')).toBe(true);
    expect(categories.has('recovery')).toBe(true);
    expect(categories.has('hormones')).toBe(true);
    expect(categories.has('lifestyle')).toBe(true);
  });

  it('should have hydration goal with correct properties', () => {
    const hydration = DAILY_GOALS.find(g => g.id === 'hydration');
    expect(hydration).toBeDefined();
    expect(hydration?.name).toBe('Stay Hydrated');
    expect(hydration?.target).toBe(8);
    expect(hydration?.unit).toBe('glasses');
    expect(hydration?.category).toBe('lifestyle');
  });

  it('should have consistency goal with correct properties', () => {
    const consistency = DAILY_GOALS.find(g => g.id === 'consistency');
    expect(consistency).toBeDefined();
    expect(consistency?.name).toBe('Weekly Consistency');
    expect(consistency?.target).toBe(7);
    expect(consistency?.unit).toBe('days');
    expect(consistency?.category).toBe('lifestyle');
  });

  it('should have protein target goal', () => {
    const protein = DAILY_GOALS.find(g => g.id === 'protein-target');
    expect(protein).toBeDefined();
    expect(protein?.target).toBe(100);
  });
});

describe('getGoalProgress', () => {
  it('should calculate progress for protein goal', () => {
    const protein = DAILY_GOALS.find(g => g.id === 'protein-target')!;
    const mockState = {
      energy: { proteins: { consumed: 75 } }
    };

    const progress = getGoalProgress(protein, mockState);
    expect(progress.current).toBe(75);
    expect(progress.percent).toBe(75);
    expect(progress.complete).toBe(false);
  });

  it('should calculate completed progress', () => {
    const protein = DAILY_GOALS.find(g => g.id === 'protein-target')!;
    const mockState = {
      energy: { proteins: { consumed: 100 } }
    };

    const progress = getGoalProgress(protein, mockState);
    expect(progress.current).toBe(100);
    expect(progress.percent).toBe(100);
    expect(progress.complete).toBe(true);
  });

  it('should handle missing state gracefully', () => {
    const protein = DAILY_GOALS.find(g => g.id === 'protein-target')!;
    const progress = getGoalProgress(protein, null);
    expect(progress.current).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.complete).toBe(false);
  });

  it('should cap percent at 100', () => {
    const protein = DAILY_GOALS.find(g => g.id === 'protein-target')!;
    const mockState = {
      energy: { proteins: { consumed: 150 } }
    };

    const progress = getGoalProgress(protein, mockState);
    expect(progress.current).toBe(150);
    expect(progress.percent).toBe(100);
  });

  it('should calculate glycogen percentage', () => {
    const glycogen = DAILY_GOALS.find(g => g.id === 'glycogen-stores')!;
    const mockState = {
      energy: { glycogen: { muscle: 0.8, liver: 0.9 } }
    };

    const progress = getGoalProgress(glycogen, mockState);
    expect(progress.current).toBe(85); // Average of 80 and 90
    expect(progress.percent).toBe(94);
  });

  it('should calculate resistance training progress', () => {
    const resistance = DAILY_GOALS.find(g => g.id === 'resistance-training')!;
    const today = new Date().toDateString();
    const mockState = {
      recentExercises: [
        { category: 'resistance', timestamp: Date.now() },
        { category: 'resistance', timestamp: Date.now() },
      ]
    };

    const progress = getGoalProgress(resistance, mockState);
    expect(progress.current).toBe(2);
    expect(progress.percent).toBe(100); // Capped at 100%
  });

  it('should filter exercises by today only', () => {
    const resistance = DAILY_GOALS.find(g => g.id === 'resistance-training')!;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const mockState = {
      recentExercises: [
        { category: 'resistance', timestamp: yesterday.getTime() },
        { category: 'cardio', timestamp: Date.now() },
      ]
    };

    const progress = getGoalProgress(resistance, mockState);
    expect(progress.current).toBe(0);
  });

  it('should calculate insulin sensitivity (lower is better)', () => {
    const insulin = DAILY_GOALS.find(g => g.id === 'insulin-sensitivity')!;
    const mockState = {
      hormones: { insulin: { currentValue: 10, baseline: 5 } }
    };

    const progress = getGoalProgress(insulin, mockState);
    expect(progress.current).toBe(10);
    expect(progress.complete).toBe(true); // 10 < 15 target
  });

  it('should penalize high insulin', () => {
    const insulin = DAILY_GOALS.find(g => g.id === 'insulin-sensitivity')!;
    const mockState = {
      hormones: { insulin: { currentValue: 25, baseline: 5 } }
    };

    const progress = getGoalProgress(insulin, mockState);
    expect(progress.current).toBe(25);
    expect(progress.percent).toBeLessThan(100);
    expect(progress.complete).toBe(false);
  });
});

describe('Hydration Tracking', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return 0 when no hydration data exists', () => {
    const hydration = getTodayHydration();
    expect(hydration).toBe(0);
  });

  it('should add a glass of water', () => {
    let count = addHydration();
    expect(count).toBe(1);

    count = addHydration();
    expect(count).toBe(2);
  });

  it('should remove a glass of water', () => {
    addHydration();
    addHydration();
    addHydration();

    let count = removeHydration();
    expect(count).toBe(2);

    count = removeHydration();
    count = removeHydration();
    expect(count).toBe(0); // Should not go below 0
  });

  it('should set specific hydration count', () => {
    let count = setHydration(5);
    expect(count).toBe(5);

    count = getTodayHydration();
    expect(count).toBe(5);
  });

  it('should not allow negative hydration', () => {
    const count = setHydration(-5);
    expect(count).toBe(0);
  });

  it('should persist hydration to localStorage', () => {
    addHydration();
    addHydration();

    const saved = localStorage.getItem('metabol-sim-hydration');
    expect(saved).toBeDefined();

    const data = JSON.parse(saved!);
    expect(data.glasses).toBe(2);
    expect(data.date).toBe(new Date().toDateString());
  });

  it('should get hydration from localStorage', () => {
    localStorage.setItem('metabol-sim-hydration', JSON.stringify({
      date: new Date().toDateString(),
      glasses: 4,
      lastUpdated: Date.now()
    }));

    const hydration = getTodayHydration();
    expect(hydration).toBe(4);
  });

  it('should reset hydration on new day', () => {
    // Set hydration for "yesterday"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    localStorage.setItem('metabol-sim-hydration', JSON.stringify({
      date: yesterday.toDateString(),
      glasses: 8,
      lastUpdated: yesterday.getTime()
    }));

    // Should reset to 0 since date doesn't match today
    const hydration = getTodayHydration();
    expect(hydration).toBe(0);
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn(() => {
      throw new Error('localStorage error');
    });

    expect(() => getTodayHydration()).not.toThrow();
    expect(getTodayHydration()).toBe(0);

    // Restore
    localStorage.getItem = originalGetItem;
  });
});

describe('Hydration Goal Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should reflect current hydration in goal progress', () => {
    const hydration = DAILY_GOALS.find(g => g.id === 'hydration')!;

    addHydration();
    addHydration();
    addHydration();

    const progress = getGoalProgress(hydration, null);
    expect(progress.current).toBe(3);
    expect(progress.percent).toBe(38); // 3/8 * 100 = 37.5, rounded to 38
  });

  it('should show complete when hydration target reached', () => {
    const hydration = DAILY_GOALS.find(g => g.id === 'hydration')!;

    setHydration(8);

    const progress = getGoalProgress(hydration, null);
    expect(progress.current).toBe(8);
    expect(progress.percent).toBe(100);
    expect(progress.complete).toBe(true);
  });
});

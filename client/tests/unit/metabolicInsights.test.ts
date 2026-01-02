// ============================================================================
// METABOLIC SIMULATOR - METABOLIC INSIGHTS UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateBloodGlucoseResponse,
  addBloodGlucoseEffect,
  getCurrentBloodGlucose,
  getBloodGlucoseTrend,
  calculateHormoneResponse,
  simulateMealEffect,
  simulateExerciseEffect,
  simulateStressEffect,
  simulateSleepEffect,
  addHormoneEffect,
  getActiveEffect,
  clearAllEffects,
  HORMONE_BASELINES,
  BLOOD_GLUCOSE_BASELINE,
} from '../../src/utils/demoSimulation';

describe('Blood Glucose Calculations', () => {
  afterEach(() => {
    // Clear any active effects after each test
    vi.clearAllMocks();
  });

  describe('calculateBloodGlucoseResponse', () => {
    it('should calculate correct peak for low glycemic load', () => {
      const result = calculateBloodGlucoseResponse(10);
      expect(result.peak).toBe(45); // 20 + 10 * 2.5 = 45
      expect(result.timeToPeak).toBe(30);
      expect(result.duration).toBe(120);
    });

    it('should calculate correct peak for high glycemic load', () => {
      const result = calculateBloodGlucoseResponse(50);
      expect(result.peak).toBe(145); // 20 + 50 * 2.5 = 145
    });

    it('should calculate correct peak for moderate glycemic load', () => {
      const result = calculateBloodGlucoseResponse(25);
      expect(result.peak).toBe(83); // 20 + 25 * 2.5 = 82.5, rounded to 83
    });

    it('should always return consistent timeToPeak and duration', () => {
      const result1 = calculateBloodGlucoseResponse(10);
      const result2 = calculateBloodGlucoseResponse(100);
      expect(result1.timeToPeak).toBe(result2.timeToPeak);
      expect(result1.duration).toBe(result2.duration);
    });
  });

  describe('addBloodGlucoseEffect and getCurrentBloodGlucose', () => {
    it('should return baseline when no effect is active', () => {
      clearAllEffects();
      const glucose = getCurrentBloodGlucose();
      expect(glucose).toBe(BLOOD_GLUCOSE_BASELINE);
    });

    it('should add blood glucose effect', () => {
      addBloodGlucoseEffect(30);
      const glucose = getCurrentBloodGlucose();
      // Should be above baseline immediately after adding effect
      expect(glucose).toBeGreaterThanOrEqual(BLOOD_GLUCOSE_BASELINE);
      expect(glucose).toBeLessThanOrEqual(BLOOD_GLUCOSE_BASELINE + 100);
    });

    it('should return to baseline after effect expires', () => {
      clearAllEffects();
      addBloodGlucoseEffect(30);

      // Fast forward past effect duration (2x duration for full decay)
      vi.useFakeTimers();
      vi.advanceTimersByTime(250 * 60 * 1000); // 250 minutes in ms

      const glucose = getCurrentBloodGlucose();
      expect(glucose).toBe(BLOOD_GLUCOSE_BASELINE);

      vi.useRealTimers();
    });
  });

  describe('getBloodGlucoseTrend', () => {
    it('should return 0 (stable) when no effect is active', () => {
      clearAllEffects();
      expect(getBloodGlucoseTrend()).toBe(0);
    });

    it('should return 1 (rising) immediately after adding effect', () => {
      addBloodGlucoseEffect(30);
      expect(getBloodGlucoseTrend()).toBe(1);
    });
  });
});

describe('Hormone Response Calculations', () => {
  it('should calculate hormone response at baseline', () => {
    const result = calculateHormoneResponse('insulin', 0, 5);
    expect(result).toBeCloseTo(HORMONE_BASELINES.insulin.baseline, 1);
  });

  it('should calculate peak hormone response', () => {
    const baseline = HORMONE_BASELINES.insulin.baseline;
    const responsePeak = 20;
    const duration = 120;

    // At time to peak (25% of duration = 30 minutes)
    const result = calculateHormoneResponse('insulin', 30, responsePeak, duration);
    expect(result).toBeGreaterThan(baseline);
    expect(result).toBeLessThanOrEqual(HORMONE_BASELINES.insulin.peak);
  });

  it('should respect hormone peak limits', () => {
    const result = calculateHormoneResponse('insulin', 30, 1000);
    expect(result).toBeLessThanOrEqual(HORMONE_BASELINES.insulin.peak);
  });

  it('should respect hormone trough limits', () => {
    const result = calculateHormoneResponse('insulin', 30, -1000);
    expect(result).toBeGreaterThanOrEqual(HORMONE_BASELINES.insulin.trough);
  });

  it('should return different values for different hormones at different response peaks', () => {
    // Use different response peaks to get different values
    const insulin = calculateHormoneResponse('insulin', 30, 10);
    const cortisol = calculateHormoneResponse('cortisol', 30, 15);
    expect(insulin).not.toBe(cortisol);
  });

  it('should have different baselines for different hormones', () => {
    expect(HORMONE_BASELINES.insulin.baseline).not.toBe(HORMONE_BASELINES.cortisol.baseline);
    expect(HORMONE_BASELINES.testosterone.baseline).not.toBe(HORMONE_BASELINES.growthHormone.baseline);
  });
});

describe('Meal Simulation Effects', () => {
  it('should trigger insulin response based on glycemic load', () => {
    const meal = { glycemicLoad: 30, macros: { proteins: 10 } };
    const effects = simulateMealEffect(meal);

    expect(effects.insulin).toBeDefined();
    expect(effects.insulin.peak).toBeGreaterThan(HORMONE_BASELINES.insulin.baseline);
    expect(effects.insulin.duration).toBe(120);
  });

  it('should decrease glucagon after meal', () => {
    const meal = { glycemicLoad: 30, macros: { proteins: 10 } };
    const effects = simulateMealEffect(meal);

    expect(effects.glucagon.peak).toBeLessThan(HORMONE_BASELINES.glucagon.baseline);
  });

  it('should decrease ghrelin (satiety) after meal', () => {
    const meal = { glycemicLoad: 30, macros: { proteins: 10 } };
    const effects = simulateMealEffect(meal);

    expect(effects.ghrelin.peak).toBe(HORMONE_BASELINES.ghrelin.trough);
  });

  it('should increase testosterone with high protein meal', () => {
    const meal = { glycemicLoad: 20, macros: { proteins: 30 } };
    const effects = simulateMealEffect(meal);

    expect(effects.testosterone).toBeDefined();
    expect(effects.testosterone.peak).toBeGreaterThan(HORMONE_BASELINES.testosterone.baseline);
  });

  it('should not increase testosterone with low protein meal', () => {
    const meal = { glycemicLoad: 20, macros: { proteins: 10 } };
    const effects = simulateMealEffect(meal);

    expect(effects.testosterone).toBeUndefined();
  });

  it('should calculate higher insulin peak for higher glycemic load', () => {
    const lowGL = simulateMealEffect({ glycemicLoad: 10, macros: { proteins: 10 } });
    const highGL = simulateMealEffect({ glycemicLoad: 50, macros: { proteins: 10 } });

    expect(highGL.insulin.peak).toBeGreaterThan(lowGL.insulin.peak);
  });

  it('should decrease cortisol after eating', () => {
    const meal = { glycemicLoad: 30, macros: { proteins: 10 } };
    const effects = simulateMealEffect(meal);

    expect(effects.cortisol.peak).toBeLessThan(HORMONE_BASELINES.cortisol.baseline);
  });
});

describe('Exercise Simulation Effects', () => {
  it('should increase cortisol with exercise intensity', () => {
    const lowIntensity = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 3 });
    const highIntensity = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 9 });

    expect(highIntensity.cortisol.peak).toBeGreaterThan(lowIntensity.cortisol.peak);
  });

  it('should spike epinephrine during exercise', () => {
    const exercise = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 7 });

    expect(exercise.epinephrine).toBeDefined();
    expect(exercise.epinephrine.peak).toBeGreaterThan(HORMONE_BASELINES.epinephrine.baseline);
  });

  it('should increase growth hormone with high intensity', () => {
    const highIntensity = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 8 });

    expect(highIntensity.growthHormone).toBeDefined();
  });

  it('should not trigger growth hormone with low intensity', () => {
    const lowIntensity = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 5 });

    expect(lowIntensity.growthHormone).toBeUndefined();
  });

  it('should increase testosterone with resistance exercise', () => {
    const resistance = simulateExerciseEffect({ category: 'resistance', duration: 1800, rpe: 7 });

    expect(resistance.testosterone).toBeDefined();
    expect(resistance.testosterone.peak).toBeGreaterThan(HORMONE_BASELINES.testosterone.baseline);
  });

  it('should not increase testosterone with cardio exercise', () => {
    const cardio = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 7 });

    expect(cardio.testosterone).toBeUndefined();
  });

  it('should increase glucagon during exercise', () => {
    const exercise = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 7 });

    expect(exercise.glucagon.peak).toBeGreaterThan(HORMONE_BASELINES.glucagon.baseline);
  });

  it('should decrease insulin during exercise', () => {
    const exercise = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 7 });

    expect(exercise.insulin.peak).toBeLessThan(HORMONE_BASELINES.insulin.baseline);
  });

  it('should increase ghrelin after intense exercise', () => {
    const intense = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 8 });

    expect(intense.ghrelin).toBeDefined();
    expect(intense.ghrelin.peak).toBeGreaterThan(HORMONE_BASELINES.ghrelin.baseline);
  });
});

describe('Stress Simulation Effects', () => {
  it('should increase cortisol proportionally to stress intensity', () => {
    const lowStress = simulateStressEffect(0.3);
    const highStress = simulateStressEffect(1.0);

    expect(highStress.cortisol.peak).toBeGreaterThan(lowStress.cortisol.peak);
  });

  it('should increase epinephrine with stress', () => {
    const stress = simulateStressEffect(0.7);

    expect(stress.epinephrine.peak).toBeGreaterThan(HORMONE_BASELINES.epinephrine.baseline);
  });

  it('should decrease testosterone with chronic stress', () => {
    const stress = simulateStressEffect(0.8);

    expect(stress.testosterone.peak).toBeLessThan(HORMONE_BASELINES.testosterone.baseline);
  });

  it('should increase insulin with stress (insulin resistance)', () => {
    const stress = simulateStressEffect(0.5);

    expect(stress.insulin.peak).toBeGreaterThan(HORMONE_BASELINES.insulin.baseline);
  });

  it('should increase ghrelin with stress (stress eating)', () => {
    const stress = simulateStressEffect(0.6);

    expect(stress.ghrelin.peak).toBeGreaterThan(HORMONE_BASELINES.ghrelin.baseline);
  });

  it('should have longer duration for testosterone effect', () => {
    const stress = simulateStressEffect(0.5);

    expect(stress.testosterone.duration).toBe(240); // 4 hours
  });
});

describe('Sleep Simulation Effects', () => {
  it('should decrease cortisol after good sleep', () => {
    const sleep = simulateSleepEffect(8, 0.9);

    expect(sleep.cortisol.peak).toBeLessThan(HORMONE_BASELINES.cortisol.baseline);
  });

  it('should increase growth hormone with sleep duration', () => {
    const shortSleep = simulateSleepEffect(4, 0.8);
    const longSleep = simulateSleepEffect(8, 0.8);

    expect(longSleep.growthHormone.peak).toBeGreaterThan(shortSleep.growthHormone.peak);
  });

  it('should increase testosterone with good sleep', () => {
    const goodSleep = simulateSleepEffect(8, 0.9);

    expect(goodSleep.testosterone.peak).toBeGreaterThan(HORMONE_BASELINES.testosterone.baseline);
  });

  it('should improve insulin sensitivity after sleep', () => {
    const sleep = simulateSleepEffect(7, 0.8);

    expect(sleep.insulin.peak).toBeLessThan(HORMONE_BASELINES.insulin.baseline);
  });

  it('should increase leptin with sleep', () => {
    const sleep = simulateSleepEffect(8, 0.85);

    expect(sleep.leptin).toBeDefined();
    expect(sleep.leptin.peak).toBeGreaterThan(HORMONE_BASELINES.leptin.baseline);
  });

  it('should have longer testosterone duration', () => {
    const sleep = simulateSleepEffect(8, 0.8);

    expect(sleep.testosterone.duration).toBe(360); // 6 hours
  });

  it('should respect sleep quality in cortisol reduction', () => {
    const poorQuality = simulateSleepEffect(8, 0.5);
    const highQuality = simulateSleepEffect(8, 0.95);

    expect(highQuality.cortisol.peak).toBeLessThan(poorQuality.cortisol.peak);
  });

  it('should balance ghrelin after sleep', () => {
    const sleep = simulateSleepEffect(8, 0.8);

    expect(sleep.ghrelin.peak).toBe(HORMONE_BASELINES.ghrelin.baseline);
  });
});

describe('Active Hormone Effects Management', () => {
  beforeEach(() => {
    clearAllEffects();
  });

  it('should add hormone effect', () => {
    addHormoneEffect('insulin', 20, 60);
    const effect = getActiveEffect('insulin');

    expect(effect).toBeDefined();
    expect(effect).toBeGreaterThan(0);
  });

  it('should return null for non-existent effect', () => {
    const effect = getActiveEffect('nonexistent');
    expect(effect).toBeNull();
  });

  it('should decay effect over time', () => {
    vi.useFakeTimers();

    addHormoneEffect('test', 100, 60); // 60 minutes duration
    const initial = getActiveEffect('test');

    vi.advanceTimersByTime(30 * 60 * 1000); // 30 minutes later
    const halfway = getActiveEffect('test');

    expect(halfway).toBeLessThan(initial!);
    expect(halfway).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  it('should expire effect after duration', () => {
    vi.useFakeTimers();

    addHormoneEffect('test', 100, 1); // 1 minute duration
    expect(getActiveEffect('test')).toBeDefined();

    vi.advanceTimersByTime(2 * 60 * 1000); // 2 minutes later
    expect(getActiveEffect('test')).toBeNull();

    vi.useRealTimers();
  });

  it('should clear all effects', () => {
    addHormoneEffect('insulin', 20, 60);
    addHormoneEffect('cortisol', 15, 60);

    expect(getActiveEffect('insulin')).toBeDefined();
    expect(getActiveEffect('cortisol')).toBeDefined();

    clearAllEffects();

    expect(getActiveEffect('insulin')).toBeNull();
    expect(getActiveEffect('cortisol')).toBeNull();
  });

  it('should handle multiple effects for different hormones', () => {
    addHormoneEffect('insulin', 20, 60);
    addHormoneEffect('testosterone', 25, 90);
    addHormoneEffect('cortisol', 15, 45);

    expect(getActiveEffect('insulin')).toBeDefined();
    expect(getActiveEffect('testosterone')).toBeDefined();
    expect(getActiveEffect('cortisol')).toBeDefined();
  });
});

describe('Hormone Baselines', () => {
  it('should have all required hormones', () => {
    const hormones = [
      'insulin',
      'glucagon',
      'cortisol',
      'testosterone',
      'growthHormone',
      'igf1',
      'epinephrine',
      'leptin',
      'ghrelin',
    ] as const;

    hormones.forEach(hormone => {
      expect(HORMONE_BASELINES[hormone]).toBeDefined();
      expect(HORMONE_BASELINES[hormone].baseline).toBeDefined();
      expect(HORMONE_BASELINES[hormone].peak).toBeDefined();
      expect(HORMONE_BASELINES[hormone].trough).toBeDefined();
    });
  });

  it('should have sensible baseline values', () => {
    // Insulin baseline should be relatively low (µIU/mL)
    expect(HORMONE_BASELINES.insulin.baseline).toBe(5);

    // Cortisol baseline (µg/dL)
    expect(HORMONE_BASELINES.cortisol.baseline).toBe(10);

    // Testosterone baseline (ng/dL for males)
    expect(HORMONE_BASELINES.testosterone.baseline).toBe(20);
  });

  it('should have peak greater than baseline greater than trough', () => {
    Object.values(HORMONE_BASELINES).forEach(({ baseline, peak, trough }) => {
      expect(peak).toBeGreaterThan(baseline);
      expect(baseline).toBeGreaterThan(trough);
    });
  });
});

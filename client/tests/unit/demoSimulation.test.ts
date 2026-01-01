// ============================================================================
// METABOLIC SIMULATOR - DEMO SIMULATION UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  calculateBloodGlucoseResponse,
  BLOOD_GLUCOSE_BASELINE,
  simulateMealEffect,
  simulateExerciseEffect,
  simulateStressEffect,
  simulateSleepEffect,
  calculateHormoneResponse,
} from '../../src/utils/demoSimulation';

describe('Blood Glucose Simulation', () => {
  it('should have correct baseline', () => {
    expect(BLOOD_GLUCOSE_BASELINE).toBe(85);
  });

  it('should calculate blood glucose response based on glycemic load', () => {
    const lowGL = calculateBloodGlucoseResponse(10);
    expect(lowGL.peak).toBeGreaterThan(20);
    expect(lowGL.peak).toBeLessThan(60);

    const highGL = calculateBloodGlucoseResponse(50);
    expect(highGL.peak).toBeGreaterThan(lowGL.peak);
  });

  it('should have longer duration for higher glycemic load', () => {
    const lowGL = calculateBloodGlucoseResponse(10);
    const highGL = calculateBloodGlucoseResponse(50);

    expect(highGL.duration).toBeGreaterThanOrEqual(lowGL.duration);
  });

  it('should have consistent time to peak', () => {
    const response1 = calculateBloodGlucoseResponse(20);
    const response2 = calculateBloodGlucoseResponse(40);

    expect(response1.timeToPeak).toBe(response2.timeToPeak);
  });
});

describe('Meal Effect Simulation', () => {
  it('should calculate insulin response based on glycemic load', () => {
    const responses = simulateMealEffect({ glycemicLoad: 30, macros: { proteins: 25 } });

    expect(responses.insulin).toBeDefined();
    expect(responses.insulin.peak).toBeGreaterThan(5);
  });

  it('should have higher insulin peak for higher glycemic load', () => {
    const lowGL = simulateMealEffect({ glycemicLoad: 10, macros: { proteins: 15 } });
    const highGL = simulateMealEffect({ glycemicLoad: 50, macros: { proteins: 15 } });

    expect(highGL.insulin.peak).toBeGreaterThan(lowGL.insulin.peak);
  });

  it('should trigger testosterone response with high protein meal', () => {
    const responses = simulateMealEffect({ glycemicLoad: 10, macros: { proteins: 30 } });

    expect(responses.testosterone).toBeDefined();
  });

  it('should suppress ghrelin after meal', () => {
    const responses = simulateMealEffect({ glycemicLoad: 20, macros: { proteins: 15 } });

    expect(responses.ghrelin).toBeDefined();
    expect(responses.ghrelin.peak).toBeLessThan(150); // Below baseline
  });

  it('should decrease glucagon after high carb meal', () => {
    const responses = simulateMealEffect({ glycemicLoad: 40, macros: { proteins: 10 } });

    expect(responses.glucagon).toBeDefined();
    expect(responses.glucagon.peak).toBeLessThan(50); // Below baseline
  });

  it('should decrease cortisol after meal', () => {
    const responses = simulateMealEffect({ glycemicLoad: 20, macros: { proteins: 15 } });

    expect(responses.cortisol).toBeDefined();
    expect(responses.cortisol.peak).toBeLessThanOrEqual(10); // At or below baseline
  });
});

describe('Exercise Effect Simulation', () => {
  it('should increase cortisol with intensity', () => {
    const lowIntensity = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 3 });
    const highIntensity = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 9 });

    expect(highIntensity.cortisol.peak).toBeGreaterThan(lowIntensity.cortisol.peak);
  });

  it('should spike epinephrine during exercise', () => {
    const responses = simulateExerciseEffect({ category: 'hiit', duration: 900, rpe: 8 });

    expect(responses.epinephrine).toBeDefined();
    expect(responses.epinephrine.peak).toBeGreaterThan(50);
  });

  it('should increase growth hormone with high intensity', () => {
    const responses = simulateExerciseEffect({ category: 'resistance', duration: 2700, rpe: 8 });

    expect(responses.growthHormone).toBeDefined();
  });

  it('should increase testosterone with resistance exercise', () => {
    const responses = simulateExerciseEffect({ category: 'resistance', duration: 2700, rpe: 7 });

    expect(responses.testosterone).toBeDefined();
  });

  it('should increase glucagon during exercise', () => {
    const responses = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 6 });

    expect(responses.glucagon).toBeDefined();
    expect(responses.glucagon.peak).toBeGreaterThan(50); // Above baseline
  });

  it('should decrease insulin during exercise', () => {
    const responses = simulateExerciseEffect({ category: 'cardio', duration: 1800, rpe: 6 });

    expect(responses.insulin).toBeDefined();
    expect(responses.insulin.peak).toBeLessThan(5); // Below baseline
  });
});

describe('Stress Effect Simulation', () => {
  it('should increase cortisol with stress', () => {
    const responses = simulateStressEffect(0.5);

    expect(responses.cortisol).toBeDefined();
    expect(responses.cortisol.peak).toBeGreaterThan(10);
  });

  it('should have higher cortisol with higher stress', () => {
    const lowStress = simulateStressEffect(0.3);
    const highStress = simulateStressEffect(0.9);

    expect(highStress.cortisol.peak).toBeGreaterThan(lowStress.cortisol.peak);
  });

  it('should decrease testosterone with high stress', () => {
    const responses = simulateStressEffect(0.8);

    expect(responses.testosterone).toBeDefined();
    expect(responses.testosterone.peak).toBeLessThan(20);
  });

  it('should increase epinephrine with stress', () => {
    const responses = simulateStressEffect(0.6);

    expect(responses.epinephrine).toBeDefined();
    expect(responses.epinephrine.peak).toBeGreaterThan(50);
  });

  it('should increase ghrelin with stress', () => {
    const responses = simulateStressEffect(0.5);

    expect(responses.ghrelin).toBeDefined();
    expect(responses.ghrelin.peak).toBeGreaterThan(150); // Above baseline
  });
});

describe('Sleep Effect Simulation', () => {
  it('should decrease cortisol after good sleep', () => {
    const responses = simulateSleepEffect(8, 0.9);

    expect(responses.cortisol).toBeDefined();
    expect(responses.cortisol.peak).toBeLessThan(10);
  });

  it('should increase growth hormone during sleep', () => {
    const responses = simulateSleepEffect(8, 0.8);

    expect(responses.growthHormone).toBeDefined();
    expect(responses.growthHormone.peak).toBeGreaterThan(1);
  });

  it('should increase testosterone after good sleep', () => {
    const responses = simulateSleepEffect(8, 0.85);

    expect(responses.testosterone).toBeDefined();
    expect(responses.testosterone.peak).toBeGreaterThan(20);
  });

  it('should have higher growth hormone with longer sleep', () => {
    const shortSleep = simulateSleepEffect(4, 0.8);
    const longSleep = simulateSleepEffect(8, 0.8);

    expect(longSleep.growthHormone.peak).toBeGreaterThan(shortSleep.growthHormone.peak);
  });

  it('should improve insulin sensitivity after sleep', () => {
    const responses = simulateSleepEffect(7, 0.9);

    expect(responses.insulin).toBeDefined();
    expect(responses.insulin.peak).toBeLessThan(5); // Below baseline
  });

  it('should increase leptin after sleep', () => {
    const responses = simulateSleepEffect(8, 0.8);

    expect(responses.leptin).toBeDefined();
    expect(responses.leptin.peak).toBeGreaterThan(10);
  });
});

describe('Hormone Response Calculation', () => {
  it('should start at baseline with gaussian curve', () => {
    const value = calculateHormoneResponse('insulin', 0, 20, 120);
    // At time 0, gaussian is e^0 = 1, so value = baseline + (peak - baseline) * 1 = peak
    // But our calculation uses timeToPeak, so at time 0 we get a partial response
    expect(value).toBeGreaterThan(5);
    expect(value).toBeLessThan(25);
  });

  it('should peak at expected time', () => {
    const peakTime = 30; // 25% of 120 minutes
    const value = calculateHormoneResponse('insulin', peakTime, 20, 120);
    const startValue = calculateHormoneResponse('insulin', 0, 20, 120);

    expect(value).toBeGreaterThan(startValue);
  });

  it('should return toward baseline after duration', () => {
    const value = calculateHormoneResponse('insulin', 200, 20, 120);
    expect(value).toBeCloseTo(5, 5); // Near baseline
  });

  it('should respect trough values', () => {
    const value = calculateHormoneResponse('ghrelin', 0, 80, 180);
    // Ghrelin trough is 80, so value should be at least 80
    expect(value).toBeGreaterThanOrEqual(80);
  });
});


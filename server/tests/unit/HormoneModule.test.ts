// ============================================================================
// METABOLIC SIMULATOR - HORMONE MODULE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { HormoneModule } from '../../src/modules/HormoneModule';
import { BiologicalSex } from '@metabol-sim/shared';
import { createInitialState } from '../../src/engine/SimulationLoop';

describe('HormoneModule', () => {
  let hormoneModule: HormoneModule;
  let state: ReturnType<typeof createInitialState>;

  beforeEach(() => {
    hormoneModule = new HormoneModule();

    state = createInitialState('test-user', {
      id: 'test-user',
      age: 30,
      biologicalSex: BiologicalSex.Male,
      weight: 80,
      height: 180,
      bodyFatPercentage: 0.15,
      activityLevel: 1.55,
    });
  });

  describe('triggerResponse', () => {
    it('should trigger insulin response to carbohydrate meal', () => {
      const initialInsulin = state.hormones.insulin.currentValue;

      hormoneModule.triggerResponse(
        state.hormones,
        'insulin',
        'carbohydrateMeal',
        1.0
      );

      // Run simulation for 30 minutes (peak time)
      hormoneModule.update(state, 30);

      expect(state.hormones.insulin.currentValue).toBeGreaterThan(initialInsulin);
      expect(state.hormones.insulin.currentValue).toBeGreaterThan(state.hormones.insulin.baseline);
    });

    it('should trigger cortisol response to stress', () => {
      const initialCortisol = state.hormones.cortisol.currentValue;

      hormoneModule.applyStress(state, 0.5);

      // Update to process the stress response (past onset delay)
      hormoneModule.update(state, 5);

      expect(state.hormones.cortisol.currentValue).toBeGreaterThan(initialCortisol);
    });

    it('should increase testosterone with resistance exercise', () => {
      const initialTestosterone = state.hormones.testosterone.currentValue;

      hormoneModule.applyExerciseEffects(state, 'resistance', 0.8);

      // Testosterone response to resistance exercise:
      // - onsetDelay: 10 min
      // - peakTime: 45 min
      // - duration: 180 min
      // Update to 50 minutes (past onset, before peak)
      hormoneModule.update(state, 50);

      // Testosterone should be higher after resistance exercise
      expect(state.hormones.testosterone.currentValue).toBeGreaterThan(initialTestosterone);
    });

    it('should increase growth hormone with HIIT exercise', () => {
      hormoneModule.applyExerciseEffects(state, 'hiit', 0.9);

      hormoneModule.update(state, 20); // Peak time for GH

      expect(state.hormones.growthHormone.currentValue).toBeGreaterThan(
        state.hormones.growthHormone.baseline
      );
    });
  });

  describe('update', () => {
    it('should decay hormones toward baseline over time', () => {
      // Set elevated hormone
      state.hormones.cortisol.currentValue = 20;
      state.hormones.cortisol.baseline = 10;

      hormoneModule.update(state, 120); // 2 hours

      expect(state.hormones.cortisol.currentValue).toBeLessThan(20);
      expect(state.hormones.cortisol.currentValue).toBeGreaterThan(9);
    });

    it('should return hormone to baseline after response duration', () => {
      hormoneModule.triggerResponse(
        state.hormones,
        'insulin',
        'carbohydrateMeal',
        1.0
      );

      // Run for 4 hours (longer than 3 hour duration)
      hormoneModule.update(state, 240);

      // Should be close to baseline
      expect(state.hormones.insulin.currentValue).toBeCloseTo(
        state.hormones.insulin.baseline,
        1
      );
    });

    it('should update trends correctly', () => {
      state.hormones.insulin.currentValue = 15; // Above baseline
      state.hormones.insulin.baseline = 5;

      hormoneModule.update(state, 1);

      expect(state.hormones.insulin.trend).toBe(1); // Rising
    });
  });

  describe('applyStress', () => {
    it('should increase cortisol and epinephrine', () => {
      const initialCortisol = state.hormones.cortisol.currentValue;
      const initialEpinephrine = state.hormones.epinephrine.currentValue;

      hormoneModule.applyStress(state, 0.8);

      // Update to process the stress response (past onset delay)
      hormoneModule.update(state, 5);

      expect(state.hormones.cortisol.currentValue).toBeGreaterThan(initialCortisol);
      expect(state.hormones.epinephrine.currentValue).toBeGreaterThan(initialEpinephrine);
    });

    it('should suppress testosterone during stress', () => {
      const initialTestosterone = state.hormones.testosterone.currentValue;
      const baseline = state.hormones.testosterone.baseline;

      hormoneModule.applyStress(state, 1.0);

      expect(state.hormones.testosterone.currentValue).toBeLessThan(initialTestosterone);
      expect(state.hormones.testosterone.currentValue).toBeLessThan(baseline);
    });
  });

  describe('clearResponses', () => {
    it('should clear all active responses', () => {
      hormoneModule.triggerResponse(
        state.hormones,
        'insulin',
        'carbohydrateMeal',
        1.0
      );

      expect(hormoneModule.getActiveResponseCount()).toBeGreaterThan(0);

      hormoneModule.clearResponses();

      expect(hormoneModule.getActiveResponseCount()).toBe(0);
    });
  });
});

// ============================================================================
// METABOLIC SIMULATOR - ENERGY MODULE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { EnergyModule } from '../../src/modules/EnergyModule';
import { BiologicalSex } from '@metabol-sim/shared';
import { createInitialState } from '../../src/engine/SimulationLoop';

describe('EnergyModule', () => {
  let energyModule: EnergyModule;
  let state: ReturnType<typeof createInitialState>;

  beforeEach(() => {
    energyModule = new EnergyModule();

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

  describe('calculateBMR', () => {
    it('should calculate BMR using Mifflin-St Jeor equation for male', () => {
      const profile = {
        id: 'test',
        age: 30,
        biologicalSex: BiologicalSex.Male,
        weight: 80,
        height: 180,
        bodyFatPercentage: 0.15,
        activityLevel: 1.55,
      };

      const bmr = energyModule.calculateBMR(profile);

      // Expected: 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(bmr).toBeCloseTo(1780, 0);
    });

    it('should calculate BMR for female', () => {
      const profile = {
        id: 'test',
        age: 30,
        biologicalSex: BiologicalSex.Female,
        weight: 60,
        height: 165,
        bodyFatPercentage: 0.25,
        activityLevel: 1.55,
      };

      const bmr = energyModule.calculateBMR(profile);

      // Expected: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031 - 150 - 161 = 1320
      expect(bmr).toBeCloseTo(1320, 0);
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE with activity multiplier', () => {
      const bmr = 1800;
      const activityLevel = 1.55; // Moderately active

      const tdee = energyModule.calculateTDEE(bmr, activityLevel);

      expect(tdee).toBe(2790); // 1800 * 1.55
    });
  });

  describe('update', () => {
    it('should burn BMR calories over time', () => {
      const initialBurned = state.energy.caloriesBurned;

      // Update for 1 hour (60 minutes)
      energyModule.update(state, 60);

      // The update function burns both BMR and NEAT (activity calories)
      const bmrPerMinute = state.energy.bmr / (24 * 60);
      const neatPerMinute = (state.energy.tdee - state.energy.bmr) / (24 * 60);
      const expectedBurn = initialBurned + (bmrPerMinute + neatPerMinute) * 60;

      expect(state.energy.caloriesBurned).toBeCloseTo(expectedBurn, 2);
    });

    it('should increase fat oxidation in fasted state', () => {
      state.hormones.insulin.currentValue = 3; // Low insulin
      state.hormones.insulin.baseline = 5;

      energyModule.update(state, 10);

      expect(state.energy.substrateUtilization.fatOxidation).toBeGreaterThan(0.1);
    });

    it('should increase glucose oxidation in postprandial state', () => {
      state.hormones.insulin.currentValue = 15; // High insulin
      state.hormones.insulin.baseline = 5;

      energyModule.update(state, 10);

      expect(state.energy.substrateUtilization.glucoseOxidation).toBeGreaterThan(0.08);
    });
  });

  describe('addCalories', () => {
    it('should add calories from macros', () => {
      const initialConsumed = state.energy.caloriesConsumed;

      energyModule.addCalories(state.energy, 50, 30, 15); // carbs, protein, fat

      // Expected: 50*4 + 30*4 + 15*9 = 200 + 120 + 135 = 455
      expect(state.energy.caloriesConsumed).toBe(initialConsumed + 455);
      expect(state.energy.carbohydrates.consumed).toBe(50);
      expect(state.energy.proteins.consumed).toBe(30);
      expect(state.energy.fats.consumed).toBe(15);
    });
  });

  describe('burnExerciseCalories', () => {
    it('should add exercise calories to burned total', () => {
      const initialBurned = state.energy.caloriesBurned;

      energyModule.burnExerciseCalories(state.energy, 300);

      expect(state.energy.caloriesBurned).toBe(initialBurned + 300);
    });
  });
});

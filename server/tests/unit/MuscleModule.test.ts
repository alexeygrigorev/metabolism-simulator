// ============================================================================
// METABOLIC SIMULATOR - MUSCLE MODULE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { MuscleModule } from '../../src/modules/MuscleModule';
import { BiologicalSex } from '@metabol-sim/shared';
import { createInitialState } from '../../src/engine/SimulationLoop';

describe('MuscleModule', () => {
  let muscleModule: MuscleModule;
  let state: ReturnType<typeof createInitialState>;

  beforeEach(() => {
    muscleModule = new MuscleModule();

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

  describe('activateMtorMechanically', () => {
    it('should activate mTOR with mechanical stimulus', () => {
      muscleModule.activateMtorMechanically(state.muscle, 0.7);

      expect(state.muscle.mtorSignaling.mechanicalStimulus).toBeGreaterThan(0.5);
      expect(state.muscle.proteinBalance.anabolicWindowRemaining).toBe(48 * 60); // 48 hours
    });

    it('should cap mechanical stimulus at 1.0', () => {
      muscleModule.activateMtorMechanically(state.muscle, 1.5);

      expect(state.muscle.mtorSignaling.mechanicalStimulus).toBeLessThanOrEqual(1.0);
    });
  });

  describe('setLeucineThreshold', () => {
    it('should set leucine threshold met flag', () => {
      muscleModule.setLeucineThreshold(state.muscle, true);

      expect(state.muscle.mtorSignaling.leucineThresholdMet).toBe(true);
    });
  });

  describe('update', () => {
    it('should calculate positive net protein balance in anabolic conditions', () => {
      // Set anabolic conditions
      state.hormones.insulin.currentValue = 15;
      state.hormones.testosterone.currentValue = 25;
      state.energy.netCalories = 500;
      state.muscle.mtorSignaling.activity = 0.8;
      state.muscle.mtorSignaling.leucineThresholdMet = true;
      state.muscle.mtorSignaling.insulinSufficient = true;

      muscleModule.update(state, 60);

      expect(state.muscle.proteinBalance.synthesisRate).toBeGreaterThan(0);
      expect(state.muscle.proteinBalance.netBalance).toBeGreaterThan(0);
    });

    it('should calculate negative net protein balance in catabolic conditions', () => {
      // Set catabolic conditions
      state.hormones.cortisol.currentValue = 20;
      state.hormones.cortisol.baseline = 10;
      state.hormones.insulin.currentValue = 3;
      state.energy.netCalories = -1000;
      state.muscle.recoveryStatus.muscleDamage = 0.5;

      muscleModule.update(state, 60);

      expect(state.muscle.proteinBalance.breakdownRate).toBeGreaterThan(0.01);
      expect(state.muscle.proteinBalance.netBalance).toBeLessThan(0);
    });

    it('should decay mechanical stimulus over time', () => {
      state.muscle.mtorSignaling.mechanicalStimulus = 0.8;

      muscleModule.update(state, 60); // 1 hour

      expect(state.muscle.mtorSignaling.mechanicalStimulus).toBeLessThan(0.8);
      expect(state.muscle.mtorSignaling.mechanicalStimulus).toBeGreaterThan(0);
    });

    it('should decrease anabolic window over time', () => {
      state.muscle.proteinBalance.anabolicWindowRemaining = 120; // 2 hours

      muscleModule.update(state, 60); // 1 hour

      expect(state.muscle.proteinBalance.anabolicWindowRemaining).toBeLessThan(120);
      expect(state.muscle.proteinBalance.anabolicWindowRemaining).toBeGreaterThan(0);
    });
  });

  describe('applyExerciseDamage', () => {
    it('should apply muscle damage based on volume and intensity', () => {
      const initialDamage = state.muscle.recoveryStatus.muscleDamage;

      muscleModule.applyExerciseDamage(state.muscle, 5000, 0.8);

      expect(state.muscle.recoveryStatus.muscleDamage).toBeGreaterThan(initialDamage);
      expect(state.muscle.recoveryStatus.muscleDamage).toBeLessThanOrEqual(1);
    });

    it('should apply central fatigue', () => {
      const initialFatigue = state.muscle.recoveryStatus.centralFatigue;

      muscleModule.applyExerciseDamage(state.muscle, 3000, 0.7);

      expect(state.muscle.recoveryStatus.centralFatigue).toBeGreaterThan(initialFatigue);
    });

    it('should cap damage and fatigue at 1.0', () => {
      muscleModule.applyExerciseDamage(state.muscle, 100000, 1.0);

      expect(state.muscle.recoveryStatus.muscleDamage).toBeLessThanOrEqual(1);
      expect(state.muscle.recoveryStatus.centralFatigue).toBeLessThanOrEqual(1);
    });
  });

  describe('applySleep', () => {
    it('should reduce central fatigue with quality sleep', () => {
      state.muscle.recoveryStatus.centralFatigue = 0.8;
      state.muscle.recoveryStatus.sleepDebt = 4;

      muscleModule.applySleep(state, 8, 0.9);

      expect(state.muscle.recoveryStatus.centralFatigue).toBeLessThan(0.8);
      expect(state.muscle.recoveryStatus.sleepDebt).toBeLessThan(4);
    });

    it('should increase growth hormone during sleep', () => {
      const baselineGH = state.hormones.growthHormone.baseline;

      muscleModule.applySleep(state, 8, 0.9);

      expect(state.hormones.growthHormone.currentValue).toBeGreaterThan(baselineGH);
    });
  });

  describe('getRecoveryPercentage', () => {
    it('should return 100% when fully recovered', () => {
      state.muscle.recoveryStatus.muscleDamage = 0;
      state.muscle.recoveryStatus.centralFatigue = 0;
      state.muscle.recoveryStatus.inflammation = 0;

      const recovery = muscleModule.getRecoveryPercentage(state.muscle);

      expect(recovery).toBe(100);
    });

    it('should return lower percentage when damaged', () => {
      state.muscle.recoveryStatus.muscleDamage = 0.5;
      state.muscle.recoveryStatus.centralFatigue = 0.3;
      state.muscle.recoveryStatus.inflammation = 0.2;

      const recovery = muscleModule.getRecoveryPercentage(state.muscle);

      expect(recovery).toBeLessThan(100);
      expect(recovery).toBeGreaterThan(0);
    });
  });
});

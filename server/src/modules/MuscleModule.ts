// ============================================================================
// METABOLIC SIMULATOR - MUSCLE MODULE
// ============================================================================

import {
  SimulationState,
  MuscleState,
  HormonalState,
  EnergyState,
  MPS_CONSTANTS,
} from '@metabol-sim/shared';

// ----------------------------------------------------------------------------
// Muscle Module
// ----------------------------------------------------------------------------

export class MuscleModule {
  /**
   * Main update function called by simulation loop
   */
  public update(state: SimulationState, dtMinutes: number): void {
    const muscle = state.muscle;
    const hormones = state.hormones;
    const energy = state.energy;

    // Update mTOR signaling state
    this.updateMtorSignaling(muscle, hormones, energy);

    // Calculate MPS rate
    const mpsRate = this.calculateMPS(muscle, hormones, energy);

    // Calculate MPB rate
    const mpbRate = this.calculateMPB(muscle, hormones, energy);

    // Update protein balance
    muscle.proteinBalance.synthesisRate = mpsRate;
    muscle.proteinBalance.breakdownRate = mpbRate;
    muscle.proteinBalance.netBalance = mpsRate - mpbRate;

    // Update anabolic window
    if (muscle.proteinBalance.anabolicWindowRemaining > 0) {
      muscle.proteinBalance.anabolicWindowRemaining = Math.max(
        0,
        muscle.proteinBalance.anabolicWindowRemaining - dtMinutes
      );
    }

    // Update muscle mass (very slow process)
    this.updateMuscleMass(muscle, dtMinutes);

    // Update satellite cells
    this.updateSatelliteCells(muscle, hormones, dtMinutes);

    // Update recovery status
    this.updateRecovery(muscle, hormones, energy, dtMinutes);
  }

  /**
   * Calculate Muscle Protein Synthesis rate
   * Based on mTOR activity, insulin, amino acid availability
   */
  private calculateMPS(
    muscle: MuscleState,
    hormones: HormonalState,
    energy: EnergyState
  ): number {
    const mtor = muscle.mtorSignaling;
    const insulin = hormones.insulin.currentValue;
    const insulinBaseline = hormones.insulin.baseline;

    // Base synthesis from mTOR activation
    let synthesis = MPS_CONSTANTS.maxSynthesisRate * mtor.activity;

    // Insulin is permissive for protein synthesis
    if (insulin > MPS_CONSTANTS.insulinThreshold) {
      synthesis *= 1.2; // 20% boost when insulin is sufficient
      mtor.insulinSufficient = true;
    } else {
      mtor.insulinSufficient = false;
    }

    // Anabolic window multiplier (diminishing returns over time)
    const windowHours = muscle.proteinBalance.anabolicWindowRemaining / 60;
    if (windowHours > 0) {
      synthesis *= 1 + Math.min(2, windowHours / 24); // Up to 3x in first 48 hours
    }

    // Testosterone boost (minor direct effect, major via mTOR)
    const testRatio = hormones.testosterone.currentValue / hormones.testosterone.baseline;
    synthesis *= 1 + (testRatio - 1) * 0.2;

    // Growth hormone contribution
    const ghRatio = hormones.growthHormone.currentValue / hormones.growthHormone.baseline;
    synthesis *= 1 + (ghRatio - 1) * 0.1;

    // Energy deficit reduces MPS
    if (energy.netCalories < -500) {
      synthesis *= 0.8;
    }

    return Math.max(0.001, synthesis);
  }

  /**
   * Calculate Muscle Protein Breakdown rate
   * Driven by cortisol, fasting, energy deficit
   */
  private calculateMPB(
    muscle: MuscleState,
    hormones: HormonalState,
    energy: EnergyState
  ): number {
    let breakdown = MPS_CONSTANTS.breakdownBaseRate;

    // Cortisol increases protein breakdown
    const cortisolRatio = hormones.cortisol.currentValue / hormones.cortisol.baseline;
    breakdown *= Math.pow(cortisolRatio, 1.5);

    // Energy deficit increases breakdown
    if (energy.netCalories < -500) {
      breakdown *= 1.5;
    } else if (energy.netCalories < -1000) {
      breakdown *= 2;
    }

    // Fasted state increases breakdown
    if (energy.substrateUtilization.metabolicState === 'fasted') {
      breakdown *= 1.3;
    }

    // Insulin suppresses breakdown (anti-catabolic)
    const insulinRatio = hormones.insulin.currentValue / hormones.insulin.baseline;
    breakdown /= Math.max(1, insulinRatio * 0.8);

    // Exercise-induced muscle damage increases temporary breakdown
    breakdown *= 1 + muscle.recoveryStatus.muscleDamage * 0.5;

    // Testosterone reduces breakdown
    const testRatio = hormones.testosterone.currentValue / hormones.testosterone.baseline;
    breakdown *= 1 - (testRatio - 1) * 0.15;

    return Math.max(0.005, breakdown);
  }

  /**
   * Update mTOR signaling based on stimuli
   */
  private updateMtorSignaling(
    muscle: MuscleState,
    hormones: HormonalState,
    energy: EnergyState
  ): void {
    const mtor = muscle.mtorSignaling;

    // Check leucine threshold (set by food module)
    // If not explicitly set, check recent protein intake
    if (!mtor.leucineThresholdMet) {
      // This would be set by food module when sufficient protein consumed
      mtor.leucineThresholdMet = false;
    }

    // Energy status based on ATP availability
    mtor.energyStatus = energy.netCalories < -1000 ? 0.7 : 1;

    // Calculate total mTOR activity
    let activation = 0;

    if (mtor.leucineThresholdMet) {
      activation += 0.3;
    }
    if (mtor.insulinSufficient) {
      activation += 0.2;
    }
    activation += mtor.mechanicalStimulus * 0.4;
    activation *= mtor.energyStatus;

    // Decay mechanical stimulus over time
    mtor.mechanicalStimulus *= 0.995; // Half-life of ~2 hours

    mtor.activity = Math.min(1, Math.max(0, activation));
  }

  /**
   * Activate mTOR via mechanical stimulus (exercise)
   */
  public activateMtorMechanically(muscle: MuscleState, intensity: number): void {
    muscle.mtorSignaling.mechanicalStimulus = Math.min(
      1,
      muscle.mtorSignaling.mechanicalStimulus + intensity
    );

    // Set anabolic window (typically 24-48 hours post-exercise)
    muscle.proteinBalance.anabolicWindowRemaining = MPS_CONSTANTS.anabolicWindowDuration;
  }

  /**
   * Set leucine threshold (called by food module)
   */
  public setLeucineThreshold(muscle: MuscleState, met: boolean): void {
    muscle.mtorSignaling.leucineThresholdMet = met;
  }

  /**
   * Update satellite cell dynamics
   */
  private updateSatelliteCells(
    muscle: MuscleState,
    hormones: HormonalState,
    dtMinutes: number
  ): void {
    const sc = muscle.satelliteCells;

    // Activation signal based on damage and growth factors
    const activationSignal =
      muscle.recoveryStatus.muscleDamage * 0.5 +
      (hormones.growthHormone.currentValue / hormones.growthHormone.baseline - 1) * 0.3 +
      (hormones.testosterone.currentValue / hormones.testosterone.baseline - 1) * 0.2;

    // State transitions
    if (activationSignal > 0.3 && sc.active < 0.1) {
      sc.active = Math.min(1, sc.active + dtMinutes / 60); // Activate over hours
    }

    // Proliferation phase (activated -> proliferating)
    if (sc.active > 0.1 && sc.proliferating < sc.active) {
      sc.proliferating = Math.min(sc.active, sc.proliferating + dtMinutes / 120);
    }

    // Differentiation phase (proliferating -> differentiating)
    if (sc.proliferating > 0.1) {
      sc.differentiating = Math.min(
        sc.proliferating,
        sc.differentiating + dtMinutes / 180
      );
    }

    // Fusion phase (adds myonuclei to fibers)
    if (sc.differentiating > 0.05) {
      const fusionRate = sc.differentiating * dtMinutes / (24 * 60); // Daily rate
      sc.nucleiPerFiber += fusionRate * 0.01; // Small increment
    }

    // Decay activation signals over time
    sc.active *= 0.995;
    sc.proliferating *= 0.995;
    sc.differentiating *= 0.995;
  }

  /**
   * Update recovery status
   */
  private updateRecovery(
    muscle: MuscleState,
    hormones: HormonalState,
    energy: EnergyState,
    dtMinutes: number
  ): void {
    const recovery = muscle.recoveryStatus;

    // Muscle damage recovery (protein synthesis dependent)
    const recoveryRate = muscle.proteinBalance.synthesisRate * 0.1;
    recovery.muscleDamage = Math.max(
      0,
      recovery.muscleDamage - recoveryRate * (dtMinutes / 60)
    );

    // Glycogen repletion (handled by energy module)
    recovery.glycogenRepletion = energy.glycogen.muscle;

    // Inflammation clears over time
    recovery.inflammation = Math.max(
      0,
      recovery.inflammation * (1 - dtMinutes / (12 * 60))
    ); // 12 hour half-life

    // Central fatigue recovery
    recovery.centralFatigue = Math.max(
      0,
      recovery.centralFatigue - dtMinutes / (30 * 60)
    ); // 30 minutes per 0.1 fatigue

    // Sleep debt
    if (recovery.sleepDebt > 0) {
      recovery.sleepDebt = Math.max(0, recovery.sleepDebt - dtMinutes / 60);
    }
  }

  /**
   * Apply muscle damage from exercise
   */
  public applyExerciseDamage(
    muscle: MuscleState,
    volume: number,
    intensity: number
  ): void {
    // Calculate damage based on volume and intensity
    const damage = (volume * intensity) / 10000; // Normalized damage
    muscle.recoveryStatus.muscleDamage = Math.min(
      1,
      muscle.recoveryStatus.muscleDamage + damage
    );
    muscle.recoveryStatus.centralFatigue = Math.min(
      1,
      muscle.recoveryStatus.centralFatigue + intensity * 0.3
    );
  }

  /**
   * Update actual muscle mass (very slow accumulation)
   */
  private updateMuscleMass(muscle: MuscleState, dtMinutes: number): void {
    const netDaily = muscle.proteinBalance.netBalance; // Fraction per day
    const netPerMinute = netDaily / (24 * 60);

    // Only accumulate mass with positive net balance over time
    const massChange = muscle.skeletalMuscleMass * netPerMinute * dtMinutes;

    if (massChange > 0) {
      muscle.skeletalMuscleMass += massChange * 0.1; // Damped for realism
      muscle.totalMass = muscle.skeletalMuscleMass * 1.05; // ~5% non-skeletal
    } else if (massChange < 0) {
      // Loss is also gradual
      muscle.skeletalMuscleMass += massChange * 0.05;
      muscle.totalMass = muscle.skeletalMuscleMass * 1.05;
    }
  }

  /**
   * Apply sleep effects
   */
  public applySleep(state: SimulationState, hours: number, quality: number): void {
    const muscle = state.muscle;
    const hormones = state.hormones;

    // High quality sleep enhances recovery
    if (quality > 0.7) {
      muscle.recoveryStatus.centralFatigue *= 0.5;
      muscle.recoveryStatus.inflammation *= 0.7;

      // GH release during sleep
      hormones.growthHormone.currentValue = hormones.growthHormone.baseline * 3;
      hormones.growthHormone.peak = hormones.growthHormone.currentValue;

      // Testosterone boost (mainly from REM sleep)
      if (hours >= 7) {
        hormones.testosterone.currentValue = hormones.testosterone.baseline * 1.2;
      }
    }

    // Reduce sleep debt
    muscle.recoveryStatus.sleepDebt = Math.max(0, muscle.recoveryStatus.sleepDebt - hours);
  }

  /**
   * Get current recovery percentage
   */
  public getRecoveryPercentage(muscle: MuscleState): number {
    const { muscleDamage, centralFatigue, inflammation } = muscle.recoveryStatus;

    // Recovery is inverse of damage/fatigue
    return (
      (1 - muscleDamage * 0.4 - centralFatigue * 0.3 - inflammation * 0.3) * 100
    );
  }
}

// ============================================================================
// METABOLIC SIMULATOR - ENERGY MODULE
// ============================================================================

import {
  SimulationState,
  EnergyState,
  UserProfile,
  MetabolicState,
  BiologicalSex,
  BMR_CONSTANTS,
  RESTING_SUBSTRATE_UTILIZATION,
} from '@metabol-sim/shared';

// ----------------------------------------------------------------------------
// Energy Module
// ----------------------------------------------------------------------------

export class EnergyModule {
  private lastUpdateTime: number = 0;

  /**
   * Main update function called by simulation loop
   */
  public update(state: SimulationState, dtMinutes: number): void {
    const energy = state.energy;
    const user = state.user;

    // Calculate BMR and TDEE if not set
    if (energy.bmr === 0) {
      energy.bmr = this.calculateBMR(user);
      energy.tdee = this.calculateTDEE(energy.bmr, user.activityLevel);
    }

    // Burn BMR calories continuously
    const bmrPerMinute = energy.bmr / (24 * 60);
    energy.caloriesBurned += bmrPerMinute * dtMinutes;

    // Calculate and burn NEAT (Non-Exercise Activity Thermogenesis)
    const neatPerMinute = (energy.tdee - energy.bmr) / (24 * 60);
    energy.caloriesBurned += neatPerMinute * dtMinutes;

    // Update substrate utilization
    this.updateSubstrateUtilization(state, dtMinutes);

    // Update glycogen levels
    this.updateGlycogen(state, dtMinutes);

    // Update net calories
    energy.netCalories = energy.caloriesConsumed - energy.caloriesBurned;

    // Update body composition (slow process)
    this.updateBodyComposition(energy, dtMinutes);
  }

  /**
   * Calculate BMR using Mifflin-St Jeor equation
   */
  public calculateBMR(profile: UserProfile): number {
    const constants = profile.biologicalSex === BiologicalSex.Male
      ? BMR_CONSTANTS.mifflinStJeor.male
      : BMR_CONSTANTS.mifflinStJeor.female;

    const bmr = (
      constants.weight * profile.weight +
      constants.height * profile.height +
      constants.age * profile.age +
      constants.constant
    );

    return bmr;
  }

  /**
   * Calculate BMR using Katch-McArdle (based on lean mass)
   */
  public calculateBMRKatchMcArdle(profile: UserProfile, leanMass: number): number {
    return (
      BMR_CONSTANTS.katchMcArdle.leanMassConstant +
      BMR_CONSTANTS.katchMcArdle.leanMassMultiplier * leanMass
    );
  }

  /**
   * Calculate TDEE from BMR and activity level
   */
  public calculateTDEE(bmr: number, activityLevel: number): number {
    return bmr * activityLevel;
  }

  /**
   * Update substrate utilization based on hormonal state and activity
   */
  private updateSubstrateUtilization(state: SimulationState, dtMinutes: number): void {
    const energy = state.energy;
    const hormones = state.hormones;
    const insulin = hormones.insulin.currentValue;
    const insulinBaseline = hormones.insulin.baseline;

    // Base rates at rest
    let fatOx = RESTING_SUBSTRATE_UTILIZATION.fatOxidation;
    let glucoseOx = RESTING_SUBSTRATE_UTILIZATION.glucoseOxidation;

    // Insulin effect
    const insulinRatio = insulin / insulinBaseline;

    if (insulinRatio > 1.5) {
      // Postprandial - more glucose, less fat
      glucoseOx *= 2;
      fatOx *= 0.2;
      energy.substrateUtilization.metabolicState = MetabolicState.Postprandial;
    } else if (insulinRatio < 0.8) {
      // Fasted - more fat, less glucose
      fatOx *= 2.5;
      glucoseOx *= 0.5;
      if (energy.substrateUtilization.metabolicState !== MetabolicState.Exercise) {
        energy.substrateUtilization.metabolicState = MetabolicState.Fasted;
      }
    }

    // Exercise effect (handled by exercise module)
    if (energy.substrateUtilization.metabolicState === MetabolicState.Exercise) {
      // Exercise module sets intensity-specific rates
      // This is just the baseline adjustment
    }

    energy.substrateUtilization.fatOxidation = fatOx;
    energy.substrateUtilization.glucoseOxidation = glucoseOx;

    // Protein oxidation only in significant deficit
    energy.substrateUtilization.proteinOxidation =
      energy.netCalories < -1000 ? 0.01 : 0.001;
  }

  /**
   * Update glycogen stores based on metabolic state
   */
  private updateGlycogen(state: SimulationState, dtMinutes: number): void {
    const energy = state.energy;
    const glycogen = energy.glycogen;

    switch (energy.substrateUtilization.metabolicState) {
      case MetabolicState.Postprandial: {
        // Replenishing glycogen
        const repletionRate = 0.5 + (state.hormones.insulin.currentValue / 20);
        glycogen.muscle = Math.min(
          1,
          glycogen.muscle + (repletionRate * dtMinutes) / (glycogen.capacity.muscle * 10)
        );
        glycogen.liver = Math.min(
          1,
          glycogen.liver + (repletionRate * dtMinutes) / (glycogen.capacity.liver * 10)
        );
        break;
      }

      case MetabolicState.Exercise: {
        // Depleting glycogen based on intensity
        const intensity = this.getExerciseIntensity(state);
        const depletionRate = 0.5 + intensity * 3;
        glycogen.muscle = Math.max(
          0,
          glycogen.muscle - (depletionRate * dtMinutes) / (glycogen.capacity.muscle * 5)
        );
        break;
      }

      case MetabolicState.Fasted: {
        // Slow glycogen usage to maintain blood glucose
        glycogen.liver = Math.max(
          0,
          glycogen.liver - (0.05 * dtMinutes) / (glycogen.capacity.liver * 60)
        );
        break;
      }

      case MetabolicState.Sleep: {
        // Minimal usage, mostly fat
        glycogen.muscle = Math.max(
          0,
          glycogen.muscle - (0.02 * dtMinutes) / (glycogen.capacity.muscle * 60)
        );
        break;
      }

      case MetabolicState.Recovery: {
        // Replenishing
        const repletionRate = 0.3;
        glycogen.muscle = Math.min(
          1,
          glycogen.muscle + (repletionRate * dtMinutes) / (glycogen.capacity.muscle * 10)
        );
        break;
      }
    }
  }

  /**
   * Update body composition based on sustained calorie balance
   * Note: Lean mass is updated by the MuscleModule
   */
  private updateBodyComposition(energy: EnergyState, dtMinutes: number): void {
    // Body composition changes very slowly
    const dailyCalorieBalance = energy.netCalories;

    if (Math.abs(dailyCalorieBalance) > 500) {
      // ~7700 kcal per kg of fat
      const fatChangeRate = (dailyCalorieBalance / 7700) / (24 * 60);
      energy.bodyFat = Math.max(
        3,
        Math.min(50, energy.bodyFat + fatChangeRate * dtMinutes)
      );
    }
    // Note: leanMass is updated by MuscleModule based on protein balance
  }

  /**
   * Get current exercise intensity (0-1)
   * Used by other modules for calculations
   */
  public getExerciseIntensity(state: SimulationState): number {
    // Check if there's active exercise
    const now = state.gameTime;
    for (const session of state.recentExercises) {
      const start = new Date(session.startTime).getTime();
      const end = session.endTime ? new Date(session.endTime).getTime() : now.getTime();

      if (now.getTime() >= start && now.getTime() <= end) {
        // Active exercise - estimate intensity from RPE
        return session.perceivedExertion / 10;
      }
    }
    return 0;
  }

  /**
   * Set metabolic state explicitly
   */
  public setMetabolicState(state: SimulationState, metabolicState: MetabolicState): void {
    state.energy.substrateUtilization.metabolicState = metabolicState;
  }

  /**
   * Add calories from food
   */
  public addCalories(
    energy: EnergyState,
    carbs: number,
    protein: number,
    fat: number
  ): void {
    const carbCalories = carbs * 4;
    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;

    energy.caloriesConsumed += carbCalories + proteinCalories + fatCalories;
    energy.carbohydrates.consumed += carbs;
    energy.proteins.consumed += protein;
    energy.fats.consumed += fat;
  }

  /**
   * Burn calories from exercise
   */
  public burnExerciseCalories(energy: EnergyState, calories: number): void {
    energy.caloriesBurned += calories;
  }
}

// Helper function to get state reference in body composition update
function state(arg0: EnergyState): any {
    throw new Error('Function not implemented.');
}

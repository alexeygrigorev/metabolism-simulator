// ============================================================================
// METABOLIC SIMULATOR - MEMOIZED STORE SELECTORS
// ============================================================================
//
// These selectors use Zustand's selector pattern to prevent unnecessary
// re-renders. By defining stable selector functions outside of components,
// we ensure that the selector reference doesn't change between renders.
//
// This is critical for performance: components using these selectors will
// only re-render when the specific data they depend on changes, not when
// unrelated parts of the store update.
//
// Usage:
//   const energy = useSimulationStore(selectEnergy);
//   const hormones = useSimulationStore(selectHormones);
// ============================================================================

import type { SimulationState } from '@metabol-sim/shared';
import type { SimulationStore } from './store';

// ============================================================================
// BASE STATE SELECTORS
// ============================================================================

/** Select the full simulation state */
export const selectState = (state: SimulationStore) => state.state;

/** Select if simulation is connected to server */
export const selectConnected = (state: SimulationStore) => state.connected;

/** Select if simulation is loading */
export const selectLoading = (state: SimulationStore) => state.loading;

/** Select connection error */
export const selectError = (state: SimulationStore) => state.error;

/** Select time scale setting */
export const selectTimeScale = (state: SimulationStore) => state.timeScale;

/** Select paused state */
export const selectPaused = (state: SimulationStore) => state.paused;

/** Select hormone history for sparklines */
export const selectHormoneHistory = (state: SimulationStore) => state.hormoneHistory;

/** Select toast notifications */
export const selectToasts = (state: SimulationStore) => state.toasts;

// ============================================================================
// ENERGY SELECTORS
// ============================================================================

/** Select energy balance data */
export const selectEnergy = (state: SimulationStore) => state.state?.energy;

/** Select blood glucose value */
export const selectBloodGlucose = (state: SimulationStore) =>
  state.state?.energy?.bloodGlucose;

/** Select net calories */
export const selectNetCalories = (state: SimulationStore) =>
  state.state?.energy?.netCalories ?? 0;

/** Select consumed calories */
export const selectCaloriesConsumed = (state: SimulationStore) =>
  state.state?.energy?.caloriesConsumed ?? 0;

/** Select burned calories */
export const selectCaloriesBurned = (state: SimulationStore) =>
  state.state?.energy?.caloriesBurned ?? 0;

/** Select glycogen levels */
export const selectGlycogen = (state: SimulationStore) =>
  state.state?.energy?.glycogen;

/** Select substrate utilization */
export const selectSubstrateUtilization = (state: SimulationStore) =>
  state.state?.energy?.substrateUtilization;

// ============================================================================
// HORMONE SELECTORS
// ============================================================================

import type { HormonalState, HormoneName } from '@metabol-sim/shared';

/** Select all hormones */
export const selectHormones = (state: SimulationStore) => state.state?.hormones;

/** Create a selector for a specific hormone */
export const createHormoneSelector = (hormoneKey: HormoneName) =>
  (state: SimulationStore) => state.state?.hormones?.[hormoneKey];

/** Select insulin data */
export const selectInsulin = createHormoneSelector('insulin');

/** Select glucagon data */
export const selectGlucagon = createHormoneSelector('glucagon');

/** Select cortisol data */
export const selectCortisol = createHormoneSelector('cortisol');

/** Select testosterone data */
export const selectTestosterone = createHormoneSelector('testosterone');

/** Select growth hormone data */
export const selectGrowthHormone = createHormoneSelector('growthHormone');

/** Select IGF-1 data */
export const selectIgf1 = createHormoneSelector('igf1');

/** Select epinephrine data */
export const selectEpinephrine = createHormoneSelector('epinephrine');

/** Select leptin data */
export const selectLeptin = createHormoneSelector('leptin');

/** Select ghrelin data */
export const selectGhrelin = createHormoneSelector('ghrelin');

/** Select hormone and history for a specific hormone (for panels) */
export const createHormonePanelSelector = (hormoneKey: HormoneName) =>
  (state: SimulationStore) => ({
    data: state.state?.hormones?.[hormoneKey],
    history: state.hormoneHistory?.[hormoneKey],
  });

// ============================================================================
// MUSCLE SELECTORS
// ============================================================================

/** Select muscle data */
export const selectMuscle = (state: SimulationStore) => state.state?.muscle;

/** Select protein balance */
export const selectProteinBalance = (state: SimulationStore) =>
  state.state?.muscle?.proteinBalance;

/** Select mTOR signaling */
export const selectMtorSignaling = (state: SimulationStore) =>
  state.state?.muscle?.mtorSignaling;

/** Select recovery status */
export const selectRecoveryStatus = (state: SimulationStore) =>
  state.state?.muscle?.recoveryStatus;

/** Select skeletal muscle mass */
export const selectSkeletalMuscleMass = (state: SimulationStore) =>
  state.state?.muscle?.skeletalMuscleMass ?? 0;

// ============================================================================
// ACTIVITY LOG SELECTORS
// ============================================================================

/** Select recent meals */
export const selectRecentMeals = (state: SimulationStore) =>
  state.state?.recentMeals ?? [];

/** Select recent exercises */
export const selectRecentExercises = (state: SimulationStore) =>
  state.state?.recentExercises ?? [];

/** Select recent sleep */
export const selectRecentSleep = (state: SimulationStore) =>
  state.state?.recentSleep ?? [];

/** Select all activity data (for ActivityLog component) */
export const selectActivities = (state: SimulationStore) => {
  if (!state.state) {
    return { meals: [], exercises: [], sleep: [] };
  }
  return {
    meals: state.state.recentMeals ?? [],
    exercises: state.state.recentExercises ?? [],
    sleep: state.state.recentSleep ?? [],
  };
};

// ============================================================================
// USER PROFILE SELECTORS
// ============================================================================

/** Select user profile data */
export const selectUser = (state: SimulationStore) => state.state?.user;

/** Select user age */
export const selectUserAge = (state: SimulationStore) =>
  state.state?.user?.age;

/** Select user weight */
export const selectUserWeight = (state: SimulationStore) =>
  state.state?.user?.weight;

/** Select user height */
export const selectUserHeight = (state: SimulationStore) =>
  state.state?.user?.height;

// ============================================================================
// SETTINGS SELECTORS
// ============================================================================

/** Select simulation settings */
export const selectSettings = (state: SimulationStore) =>
  state.state?.settings;

/** Select combined settings from store and state */
export const selectCombinedSettings = (state: SimulationStore) => ({
  timeScale: state.state?.settings?.timeScale ?? state.timeScale,
  paused: state.state?.settings?.paused ?? state.paused,
  autoSave: state.state?.settings?.autoSave ?? true,
});

// ============================================================================
// COMPOSITE SELECTORS FOR DASHBOARD
// ============================================================================

/** Select data needed for UserProfileCard */
export const selectUserProfileData = (state: SimulationStore) => {
  const user = state.state?.user;
  if (!user) return null;
  return {
    age: user.age,
    weight: user.weight,
    height: user.height,
    bodyFatPercentage: user.bodyFatPercentage,
  };
};

/** Select data needed for MacroTracker */
export const selectMacros = (state: SimulationStore) => {
  const energy = state.state?.energy;
  if (!energy) return null;
  return {
    carbohydrates: energy.carbohydrates,
    proteins: energy.proteins,
    fats: energy.fats,
    caloriesConsumed: energy.caloriesConsumed,
    caloriesBurned: energy.caloriesBurned,
  };
};

/** Select data needed for HealthMarkersPanel */
export const selectHealthMarkers = (state: SimulationStore) => {
  const energy = state.state?.energy;
  const muscle = state.state?.muscle;
  if (!energy || !muscle) return null;
  return {
    bloodGlucose: energy.bloodGlucose,
    glycogen: energy.glycogen,
    recoveryStatus: muscle.recoveryStatus,
  };
};

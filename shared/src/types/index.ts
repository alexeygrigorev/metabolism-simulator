// ============================================================================
// METABOLIC SIMULATOR - SHARED TYPES
// ============================================================================

// ----------------------------------------------------------------------------
// Enums
// ----------------------------------------------------------------------------

export enum BiologicalSex {
  Male = 'male',
  Female = 'female'
}

export enum MetabolicState {
  Fasted = 'fasted',
  Postprandial = 'postprandial',
  Exercise = 'exercise',
  Recovery = 'recovery',
  Sleep = 'sleep'
}

export enum ExerciseCategory {
  Cardio = 'cardio',
  Resistance = 'resistance',
  HIIT = 'hiit',
  Flexibility = 'flexibility'
}

export enum MuscleGroup {
  Chest = 'chest',
  Back = 'back',
  Shoulders = 'shoulders',
  Biceps = 'biceps',
  Triceps = 'triceps',
  Forearms = 'forearms',
  Abs = 'abs',
  Obliques = 'obliques',
  Quadriceps = 'quadriceps',
  Hamstrings = 'hamstrings',
  Glutes = 'glutes',
  Calves = 'calves',
  LowerBack = 'lowerBack',
  Traps = 'traps',
  Lats = 'lats'
}

export enum FoodCategory {
  Carbohydrates = 'carbohydrates',
  Proteins = 'proteins',
  Fats = 'fats',
  Vegetables = 'vegetables',
  Fruits = 'fruits',
  Dairy = 'dairy',
  Legumes = 'legumes',
  NutsSeeds = 'nutsSeeds',
  Beverages = 'beverages',
  Processed = 'processed',
  Supplements = 'supplements'
}

export enum ComplexityLevel {
  Simplified = 1,
  Moderate = 2,
  Detailed = 3
}

export enum Trend {
  Rising = 1,
  Stable = 0,
  Falling = -1
}

export enum ResponseCurve {
  ExponentialRiseDecay = 'exponential-rise-decay',
  Gaussian = 'gaussian',
  Sigmoid = 'sigmoid',
  LinearPulse = 'linear-pulse'
}

export enum SimulationEventType {
  Meal = 'meal',
  Exercise = 'exercise',
  Sleep = 'sleep',
  Stress = 'stress'
}

// ----------------------------------------------------------------------------
// User Profile
// ----------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  age: number;
  biologicalSex: BiologicalSex;
  weight: number;           // kg
  height: number;           // cm
  bodyFatPercentage: number; // 0-1
  activityLevel: ActivityLevel;
  fitnessLevel?: FitnessLevel;
}

export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

export enum FitnessLevel {
  Beginner = 0,
  Intermediate = 1,
  Advanced = 2,
  Elite = 3
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  complexityLevel: ComplexityLevel;
  notificationsEnabled: boolean;
}

// ----------------------------------------------------------------------------
// Energy State
// ----------------------------------------------------------------------------

export interface EnergyState {
  bmr: number;              // Basal Metabolic Rate (kcal/day)
  tdee: number;             // Total Daily Energy Expenditure
  caloriesConsumed: number; // Today's intake
  caloriesBurned: number;   // Today's burn (BMR + activity + exercise)
  netCalories: number;      // Consumed - Burned

  // Macronutrients (grams)
  carbohydrates: MacroState;
  proteins: MacroState;
  fats: MacroState;

  // Storage
  glycogen: GlycogenState;

  // Body composition
  bodyFat: number;          // kg
  leanMass: number;         // kg

  // Substrate utilization
  substrateUtilization: SubstrateUtilization;
}

export interface MacroState {
  consumed: number;
  burned: number;
  target: number;
}

export interface GlycogenState {
  muscle: number;      // 0-1 (percentage of capacity)
  liver: number;       // 0-1 (percentage of capacity)
  capacity: {
    muscle: number;    // grams
    liver: number;     // grams
  };
}

export interface SubstrateUtilization {
  fatOxidation: number;     // g/min
  glucoseOxidation: number; // g/min
  proteinOxidation: number; // g/min
  metabolicState: MetabolicState;
}

// ----------------------------------------------------------------------------
// Hormonal State
// ----------------------------------------------------------------------------

export type HormoneName =
  | 'insulin'
  | 'glucagon'
  | 'cortisol'
  | 'testosterone'
  | 'growthHormone'
  | 'igf1'
  | 'epinephrine'
  | 'leptin'
  | 'ghrelin';

export interface HormonalState {
  insulin: HormoneLevel;
  glucagon: HormoneLevel;
  cortisol: HormoneLevel;
  testosterone: HormoneLevel;
  growthHormone: HormoneLevel;
  igf1: HormoneLevel;
  epinephrine: HormoneLevel;
  leptin: HormoneLevel;
  ghrelin: HormoneLevel;
}

export interface HormoneLevel {
  currentValue: number;    // Current absolute value
  baseline: number;        // Personal baseline
  peak: number;           // Recent peak value
  trough: number;         // Recent trough value
  trend: Trend;           // Rising, falling, stable
  sensitivity: number;    // Individual sensitivity factor (0.5-1.5)
}

export type StimulusType =
  | 'carbohydrateMeal'
  | 'proteinMeal'
  | 'mixedMeal'
  | 'resistanceExercise'
  | 'cardioExercise'
  | 'hiitExercise'
  | 'stress'
  | 'sleep'
  | 'fasting';

export interface HormoneResponse {
  hormone: HormoneName;
  stimulus: StimulusType;
  onsetDelay: number;      // minutes until response begins
  peakTime: number;        // minutes until peak
  duration: number;        // minutes until return to baseline
  magnitude: number;       // percent change from baseline
  curve: ResponseCurve;
}

// ----------------------------------------------------------------------------
// Muscle State
// ----------------------------------------------------------------------------

export interface MuscleState {
  // Mass and composition
  totalMass: number;           // kg
  skeletalMuscleMass: number;  // kg
  fiberTypeDistribution: FiberTypeDistribution;

  // Protein dynamics
  proteinBalance: ProteinBalance;

  // Cellular state
  satelliteCells: SatelliteCellState;
  mtorSignaling: MtorState;

  // Recovery status
  recoveryStatus: RecoveryStatus;

  // Adaptation
  trainingAdaptations: TrainingAdaptations;
}

export interface FiberTypeDistribution {
  type1: number;   // Slow-twitch oxidative (percentage)
  type2a: number;  // Fast-twitch oxidative-glycolytic
  type2x: number;  // Fast-twitch glycolytic
}

export interface ProteinBalance {
  synthesisRate: number;      // MPS rate (relative units)
  breakdownRate: number;      // MPB rate (relative units)
  netBalance: number;         // Synthesis - Breakdown
  anabolicWindowRemaining: number; // Time left in anabolic window (minutes)
}

export interface SatelliteCellState {
  active: number;             // Percentage activated
  proliferating: number;      // Percentage proliferating
  differentiating: number;    // Percentage differentiating
  fusing: number;             // Percentage fusing to fibers
  nucleiPerFiber: number;     // Myonuclei count
}

export interface MtorState {
  activity: number;           // 0-1 (percentage activation)
  leucineThresholdMet: boolean;  // Whether leucine threshold met
  insulinSufficient: boolean; // Whether insulin sufficient for MPS
  mechanicalStimulus: number; // From exercise
  energyStatus: number;       // ATP/energy availability
}

export interface RecoveryStatus {
  muscleDamage: number;       // 0-1 (0 = fresh, 1 = severe damage)
  glycogenRepletion: number;  // 0-1 (percentage)
  inflammation: number;       // 0-1
  centralFatigue: number;     // 0-1
  sleepDebt: number;          // hours
}

export interface TrainingAdaptations {
  strength: number;           // Relative strength score
  endurance: number;          // Relative endurance score
  power: number;              // Relative power score
  workCapacity: number;       // Total work capacity
  lastWorkout: Date | null;
  consecutiveDays: number;
}

// ----------------------------------------------------------------------------
// Exercise
// ----------------------------------------------------------------------------

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  met: number;                // Metabolic Equivalent
  load?: number;              // kg (for strength exercises)
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  mechanicalActivation: number; // 0-1, mTOR activation potential
}

export interface ExerciseSet {
  reps: number;
  load: number;               // kg
  duration: number;           // seconds
  distance?: number;          // meters (for cardio)
  rpe: number;                // Rate of Perceived Exertion 1-10
}

export interface CompletedExercise {
  exerciseId: string;
  sets: ExerciseSet[];
  restPeriods: number[];      // seconds between sets
}

export interface ExerciseSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  exercises: CompletedExercise[];
  totalVolume: number;        // kg * reps
  totalWork: number;          // Joules
  peakHeartRate?: number;
  averageHeartRate?: number;
  perceivedExertion: number;  // RPE 1-10
}

export interface ExerciseEffects {
  hormonal: HormonalChanges;
  metabolic: MetabolicChanges;
  muscular: MuscularChanges;
}

export interface HormonalChanges {
  testosterone?: number;       // percent change
  growthHormone?: number;      // percent change
  cortisol?: number;           // percent change
  insulin?: number;            // percent change
  igf1?: number;               // percent change
  epinephrine?: number;        // percent change
}

export interface MetabolicChanges {
  caloriesBurned: number;
  glycogenDepleted: number;   // grams
  lactateProduction: number;  // mmol/L equivalent
  epoc: number;               // Excess Post-exercise Oxygen Consumption (calories)
}

export interface MuscularChanges {
  mTORActivation: number;     // 0-1
  proteinBreakdown: number;   // relative increase
  microTrauma: number;        // 0-1
  fatigue: number;            // 0-1
}

// ----------------------------------------------------------------------------
// Food
// ----------------------------------------------------------------------------

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: number;        // grams
  macros: Macros;
  micros?: Micros;
  glycemicIndex: number;
  glycemicLoad: number;
  leucineContent: number;     // grams per serving
  insulinIndex: number;
}

export interface Macros {
  carbohydrates: number;
  proteins: number;
  fats: number;
  alcohol?: number;
  fiber: number;              // grams
  water: number;              // grams
}

export interface Micros {
  vitamins?: VitaminProfile;
  minerals?: MineralProfile;
  otherCompounds?: OtherCompounds;
}

export interface VitaminProfile {
  vitaminA?: number;           // mcg
  vitaminB6?: number;          // mg
  vitaminB12?: number;         // mcg
  vitaminC?: number;           // mg
  vitaminD?: number;           // IU
  vitaminE?: number;           // mg
  vitaminK?: number;           // mcg
  folate?: number;             // mcg
}

export interface MineralProfile {
  calcium?: number;            // mg
  iron?: number;               // mg
  magnesium?: number;          // mg
  phosphorus?: number;         // mg
  potassium?: number;          // mg
  sodium?: number;             // mg
  zinc?: number;               // mg
}

export interface OtherCompounds {
  caffeine?: number;           // mg
  creatine?: number;           // mg
  betaAlanine?: number;        // mg
  citrulline?: number;         // mg
  antioxidants?: number;       // ORAC units
}

export interface MealItem {
  foodId: string;
  servings: number;
}

export interface Meal {
  id: string;
  time: Date;
  items: MealItem[];
  totalMacros: Macros;
  glycemicLoad: number;
  insulinResponse: InsulinResponse;
}

export interface InsulinResponse {
  peak: number;               // minutes to peak
  magnitude: number;          // percent increase
  duration: number;           // minutes
  areaUnderCurve: number;     // total insulin response
}

// ----------------------------------------------------------------------------
// Sleep
// ----------------------------------------------------------------------------

export interface SleepSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;           // hours
  quality: number;            // 0-1
  deepSleep: number;          // hours
  remSleep: number;           // hours
  cycles: number;
}

// ----------------------------------------------------------------------------
// Simulation State
// ----------------------------------------------------------------------------

export interface SimulationState {
  id: string;
  userId: string;
  timestamp: Date;            // Current real-world time
  gameTime: Date;             // Game/simulation time (may differ)

  // Core physiology
  user: UserProfile;
  energy: EnergyState;
  hormones: HormonalState;
  muscle: MuscleState;

  // Recent events
  recentMeals: Meal[];
  recentExercises: ExerciseSession[];
  recentSleep: SleepSession[];

  // Settings
  settings: SimulationSettings;
}

export interface SimulationSettings {
  timeScale: number;          // 1 = real-time, 10 = 10x speed
  paused: boolean;
  autoSave: boolean;
}

export interface SimulationEvent {
  id: string;
  type: SimulationEventType;
  scheduledTime: Date;
  data: unknown;
}

// ----------------------------------------------------------------------------
// API Types
// ----------------------------------------------------------------------------

export interface ApiState {
  simulation: SimulationState;
  connected: boolean;
  loading: boolean;
  error?: string;
}

// ----------------------------------------------------------------------------
// Chart Data
// ----------------------------------------------------------------------------

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  event?: string;
}

export interface ChartDataPoint {
  time: string;
  [key: string]: string | number | undefined;
}

// ============================================================================
// METABOLIC SIMULATOR - SHARED CONSTANTS
// ============================================================================

import { HormoneResponse, HormoneName, StimulusType, ResponseCurve } from '../types';

// ----------------------------------------------------------------------------
// Hormonal Response Curves
// ----------------------------------------------------------------------------

// Response curves define how hormones react to different stimuli
// Values are based on physiological research

export const HORMONE_RESPONSES: HormoneResponse[] = [
  // Insulin responses
  {
    hormone: 'insulin',
    stimulus: 'carbohydrateMeal',
    onsetDelay: 2,        // 2 minutes to start rising
    peakTime: 30,         // Peak at 30 minutes
    duration: 180,        // Return to baseline in 3 hours
    magnitude: 400,       // 400% increase (5x baseline)
    curve: ResponseCurve.ExponentialRiseDecay
  },
  {
    hormone: 'insulin',
    stimulus: 'proteinMeal',
    onsetDelay: 5,
    peakTime: 45,
    duration: 120,
    magnitude: 50,        // Mild increase
    curve: ResponseCurve.ExponentialRiseDecay
  },
  {
    hormone: 'insulin',
    stimulus: 'mixedMeal',
    onsetDelay: 3,
    peakTime: 40,
    duration: 150,
    magnitude: 250,
    curve: ResponseCurve.ExponentialRiseDecay
  },

  // Glucagon responses
  {
    hormone: 'glucagon',
    stimulus: 'proteinMeal',
    onsetDelay: 5,
    peakTime: 30,
    duration: 120,
    magnitude: 30,
    curve: ResponseCurve.Gaussian
  },
  {
    hormone: 'glucagon',
    stimulus: 'fasting',
    onsetDelay: 180,
    peakTime: 720,
    duration: 1440,
    magnitude: 80,
    curve: ResponseCurve.Sigmoid
  },

  // Cortisol responses
  {
    hormone: 'cortisol',
    stimulus: 'stress',
    onsetDelay: 2,
    peakTime: 20,
    duration: 90,
    magnitude: 150,
    curve: ResponseCurve.ExponentialRiseDecay
  },
  {
    hormone: 'cortisol',
    stimulus: 'resistanceExercise',
    onsetDelay: 5,
    peakTime: 30,
    duration: 120,
    magnitude: 60,
    curve: ResponseCurve.Gaussian
  },
  {
    hormone: 'cortisol',
    stimulus: 'sleep',
    onsetDelay: 0,
    peakTime: 60,
    duration: 480,
    magnitude: -70,       // Decreases during sleep
    curve: ResponseCurve.Gaussian
  },

  // Testosterone responses
  {
    hormone: 'testosterone',
    stimulus: 'resistanceExercise',
    onsetDelay: 10,
    peakTime: 45,
    duration: 180,
    magnitude: 30,
    curve: ResponseCurve.Gaussian
  },
  {
    hormone: 'testosterone',
    stimulus: 'stress',
    onsetDelay: 30,
    peakTime: 120,
    duration: 360,
    magnitude: -40,
    curve: ResponseCurve.Sigmoid
  },
  {
    hormone: 'testosterone',
    stimulus: 'sleep',
    onsetDelay: 120,
    peakTime: 240,
    duration: 480,
    magnitude: 25,
    curve: ResponseCurve.Gaussian
  },

  // Growth Hormone responses
  {
    hormone: 'growthHormone',
    stimulus: 'resistanceExercise',
    onsetDelay: 15,
    peakTime: 30,
    duration: 90,
    magnitude: 400,
    curve: ResponseCurve.Gaussian
  },
  {
    hormone: 'growthHormone',
    stimulus: 'hiitExercise',
    onsetDelay: 5,
    peakTime: 20,
    duration: 60,
    magnitude: 600,
    curve: ResponseCurve.Gaussian
  },
  {
    hormone: 'growthHormone',
    stimulus: 'sleep',
    onsetDelay: 60,
    peakTime: 120,
    duration: 240,
    magnitude: 350,
    curve: ResponseCurve.Gaussian
  },

  // IGF-1 responses (slower, more sustained)
  {
    hormone: 'igf1',
    stimulus: 'resistanceExercise',
    onsetDelay: 240,
    peakTime: 1440,
    duration: 4320,
    magnitude: 20,
    curve: ResponseCurve.Sigmoid
  },

  // Epinephrine (adrenaline) responses
  {
    hormone: 'epinephrine',
    stimulus: 'hiitExercise',
    onsetDelay: 1,
    peakTime: 5,
    duration: 30,
    magnitude: 800,
    curve: ResponseCurve.ExponentialRiseDecay
  },
  {
    hormone: 'epinephrine',
    stimulus: 'stress',
    onsetDelay: 1,
    peakTime: 5,
    duration: 20,
    magnitude: 500,
    curve: ResponseCurve.ExponentialRiseDecay
  },
  {
    hormone: 'epinephrine',
    stimulus: 'cardioExercise',
    onsetDelay: 2,
    peakTime: 10,
    duration: 45,
    magnitude: 200,
    curve: ResponseCurve.Gaussian
  },

  // Leptin (satiety hormone)
  {
    hormone: 'leptin',
    stimulus: 'mixedMeal',
    onsetDelay: 15,
    peakTime: 60,
    duration: 240,
    magnitude: 40,
    curve: ResponseCurve.Sigmoid
  },

  // Ghrelin (hunger hormone)
  {
    hormone: 'ghrelin',
    stimulus: 'mixedMeal',
    onsetDelay: 5,
    peakTime: 0,        // Immediate suppression
    duration: 180,
    magnitude: -60,
    curve: ResponseCurve.ExponentialRiseDecay
  },
];

// ----------------------------------------------------------------------------
// Baseline Hormone Values
// ----------------------------------------------------------------------------

export const BASELINE_HORMONES = {
  insulin: 5,           // microU/mL (fasting)
  glucagon: 50,         // pg/mL
  cortisol: 10,         // mcg/dL (morning baseline)
  testosterone: 20,     // nmol/L (male average)
  growthHormone: 1,     // ng/mL
  igf1: 150,            // ng/mL
  epinephrine: 30,      // pg/mL
  leptin: 10,           // ng/mL
  ghrelin: 150,         // pg/mL
};

// ----------------------------------------------------------------------------
// Metabolic Constants
// ----------------------------------------------------------------------------

// Calorie values per gram
export const CALORIES_PER_GRAM = {
  carbohydrate: 4,
  protein: 4,
  fat: 9,
  alcohol: 7
};

// Glycogen storage (approximate per kg lean mass)
export const GLYCOGEN_CAPACITY_PER_KG = {
  muscle: 15,           // grams per kg muscle
  liver: 50             // grams total (varies with body size)
};

// BMR calculation constants
export const BMR_CONSTANTS = {
  mifflinStJeor: {
    male: { weight: 10, height: 6.25, age: -5, constant: 5 },
    female: { weight: 10, height: 6.25, age: -5, constant: -161 }
  },
  katchMcArdle: {
    leanMassConstant: 370,
    leanMassMultiplier: 21.6
  }
};

// Substrate utilization at rest (grams per minute)
export const RESTING_SUBSTRATE_UTILIZATION = {
  fatOxidation: 0.10,     // ~10g/hour
  glucoseOxidation: 0.08, // ~5g/hour
  proteinOxidation: 0.001 // Minimal at rest
};

// ----------------------------------------------------------------------------
// Muscle Protein Synthesis Constants
// ----------------------------------------------------------------------------

export const MPS_CONSTANTS = {
  leucineThreshold: 2.5,     // grams per meal to trigger MPS
  insulinThreshold: 5,       // microU/mL minimum for MPS
  maxSynthesisRate: 0.05,    // 5% daily max
  breakdownBaseRate: 0.01,   // 1% daily base
  anabolicWindowDuration: 48 * 60, // 48 hours in minutes
  mechanicalActivationHalfLife: 120, // minutes
};

// ----------------------------------------------------------------------------
// Exercise Constants
// ----------------------------------------------------------------------------

export const EXERCISE_EFFECTS = {
  resistance: {
    mtorActivation: 0.9,
    muscleDamageMultiplier: 0.01,
    epocMultiplier: 0.05
  },
  cardio: {
    mtorActivation: 0.1,
    muscleDamageMultiplier: 0.001,
    epocMultiplier: 0.07
  },
  hiit: {
    mtorActivation: 0.3,
    muscleDamageMultiplier: 0.005,
    epocMultiplier: 0.15
  }
};

// ----------------------------------------------------------------------------
// Food Constants
// ----------------------------------------------------------------------------

// Average digestive times (minutes)
export const DIGESTION_TIMES = {
  simpleCarbs: 30,
  complexCarbs: 90,
  proteins: 120,
  fats: 180,
  mixedMeal: 150
};

// ----------------------------------------------------------------------------
// Simulation Constants
// ----------------------------------------------------------------------------

export const SIMULATION_CONFIG = {
  defaultTickRate: 60,        // ticks per second
  defaultTimeScale: 1,        // 1 = real-time
  minTimeScale: 0.1,
  maxTimeScale: 1000,
  stateSaveInterval: 60000,   // milliseconds
};

// ----------------------------------------------------------------------------
// Complexity Level Features
// ----------------------------------------------------------------------------

export const COMPLEXITY_FEATURES = {
  1: {
    name: 'Simplified',
    hormones: [],
    features: ['energyBalance', 'weightChange']
  },
  2: {
    name: 'Moderate',
    hormones: ['insulin', 'glucagon', 'cortisol', 'testosterone', 'growthHormone'],
    features: ['energyBalance', 'hormones', 'substrateUtilization', 'glycogen', 'mps', 'recovery']
  },
  3: {
    name: 'Detailed',
    hormones: ['insulin', 'glucagon', 'cortisol', 'testosterone', 'growthHormone', 'igf1', 'epinephrine', 'leptin', 'ghrelin'],
    features: ['energyBalance', 'hormones', 'substrateUtilization', 'glycogen', 'mps', 'satelliteCells', 'micronutrients', 'sleepQuality']
  }
};

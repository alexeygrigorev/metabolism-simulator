// ============================================================================
// METABOLIC SIMULATOR - DEMO SIMULATION
// ============================================================================

// Blood glucose baseline
export const BLOOD_GLUCOSE_BASELINE = 85; // mg/dL

// Active blood glucose effect
let activeGlucoseEffect: {
  targetValue: number;
  startTime: number;
  duration: number;
  mealGlycemicLoad: number;
} | null = null;

// Calculate blood glucose effect from meal
export function calculateBloodGlucoseResponse(glycemicLoad: number): {
  peak: number;
  timeToPeak: number;
  duration: number;
} {
  // Peak glucose rise (mg/dL) based on glycemic load
  const peak = Math.round(20 + (glycemicLoad * 2.5));

  // Time to peak (minutes)
  const timeToPeak = 30;

  // Duration (minutes)
  const duration = 120;

  return { peak, timeToPeak, duration };
}

// Add blood glucose effect from meal
export function addBloodGlucoseEffect(glycemicLoad: number) {
  const response = calculateBloodGlucoseResponse(glycemicLoad);

  activeGlucoseEffect = {
    targetValue: BLOOD_GLUCOSE_BASELINE + response.peak,
    startTime: Date.now(),
    duration: response.timeToPeak * 60 * 1000, // Time to peak in ms
    mealGlycemicLoad: glycemicLoad,
  };
}

// Get current blood glucose value
export function getCurrentBloodGlucose(): number {
  if (!activeGlucoseEffect) {
    return BLOOD_GLUCOSE_BASELINE;
  }

  const now = Date.now();
  const elapsed = now - activeGlucoseEffect.startTime;

  // If effect has expired, return to baseline
  if (elapsed > activeGlucoseEffect.duration * 2) {
    activeGlucoseEffect = null;
    return BLOOD_GLUCOSE_BASELINE;
  }

  // Calculate glucose curve (rise then fall)
  const timeToPeak = activeGlucoseEffect.duration;
  const peakValue = activeGlucoseEffect.targetValue;

  if (elapsed < timeToPeak) {
    // Rising phase
    const progress = elapsed / timeToPeak;
    return BLOOD_GLUCOSE_BASELINE + (peakValue - BLOOD_GLUCOSE_BASELINE) * progress;
  } else {
    // Falling phase (decay back to baseline)
    const timeSincePeak = elapsed - timeToPeak;
    const decayDuration = activeGlucoseEffect.duration;
    const progress = Math.min(1, timeSincePeak / decayDuration);
    return BLOOD_GLUCOSE_BASELINE + (peakValue - BLOOD_GLUCOSE_BASELINE) * (1 - progress);
  }
}

// Get blood glucose trend
export function getBloodGlucoseTrend(): -1 | 0 | 1 {
  if (!activeGlucoseEffect) return 0;

  const now = Date.now();
  const elapsed = now - activeGlucoseEffect.startTime;
  const timeToPeak = activeGlucoseEffect.duration;

  if (elapsed < timeToPeak) return 1; // Rising
  if (elapsed < timeToPeak * 1.5) return -1; // Falling
  return 0; // Stable
}

// Realistic hormone response curves for demo mode
export const HORMONE_BASELINES = {
  insulin: { baseline: 5, peak: 25, trough: 3 },
  glucagon: { baseline: 50, peak: 80, trough: 30 },
  cortisol: { baseline: 10, peak: 25, trough: 5 },
  testosterone: { baseline: 20, peak: 35, trough: 15 },
  growthHormone: { baseline: 1, peak: 15, trough: 0.5 },
  igf1: { baseline: 150, peak: 180, trough: 120 },
  epinephrine: { baseline: 30, peak: 100, trough: 20 },
  leptin: { baseline: 10, peak: 15, trough: 5 },
  ghrelin: { baseline: 150, peak: 250, trough: 80 },
};

// Calculate hormone value based on time since stimulus
export function calculateHormoneResponse(
  hormone: keyof typeof HORMONE_BASELINES,
  minutesSinceStimulus: number,
  responsePeak: number,
  responseDuration: number = 120
): number {
  const { baseline, peak, trough } = HORMONE_BASELINES[hormone];

  // Gaussian-like curve for hormone response
  const timeToPeak = responseDuration * 0.25; // Peak at 25% of duration
  const sigma = responseDuration * 0.2; // Width of the curve

  const gaussian = Math.exp(-Math.pow(minutesSinceStimulus - timeToPeak, 2) / (2 * sigma * sigma));

  const value = baseline + (responsePeak - baseline) * gaussian;
  return Math.max(trough, Math.min(peak, value));
}

// Simulate meal effect on hormones
export function simulateMealEffect(meal: { glycemicLoad: number; macros: { proteins: number } }) {
  const responses: Record<string, { peak: number; duration: number }> = {};

  // Trigger blood glucose response
  addBloodGlucoseEffect(meal.glycemicLoad);

  // Insulin response based on glycemic load
  const insulinPeak = HORMONE_BASELINES.insulin.baseline + meal.glycemicLoad * 0.3;
  responses.insulin = { peak: insulinPeak, duration: 120 };

  // Glucagon decreases after meal (especially high carb)
  responses.glucagon = { peak: HORMONE_BASELINES.glucagon.baseline * 0.7, duration: 90 };

  // Cortisol slightly decreases after eating
  responses.cortisol = { peak: HORMONE_BASELINES.cortisol.baseline * 0.8, duration: 60 };

  // Testosterone increases slightly with protein intake
  if (meal.macros.proteins > 20) {
    responses.testosterone = { peak: HORMONE_BASELINES.testosterone.baseline * 1.2, duration: 180 };
  }

  // Ghrelin drops after meal (satiety)
  responses.ghrelin = { peak: HORMONE_BASELINES.ghrelin.trough, duration: 180 };

  return responses;
}

// Simulate exercise effect on hormones
export function simulateExerciseEffect(exercise: { category: string; duration: number; rpe: number }) {
  const responses: Record<string, { peak: number; duration: number }> = {};

  const intensity = exercise.rpe / 10; // 0-1 scale
  const duration = exercise.duration / 60; // in minutes

  // Cortisol increases with exercise intensity
  responses.cortisol = {
    peak: HORMONE_BASELINES.cortisol.baseline + 15 * intensity,
    duration: 60 + duration * 2
  };

  // Epinephrine (adrenaline) spikes during exercise
  responses.epinephrine = {
    peak: HORMONE_BASELINES.epinephrine.baseline + 70 * intensity,
    duration: 30 + duration
  };

  // Growth hormone release depends on intensity
  if (intensity > 0.6) {
    responses.growthHormone = {
      peak: HORMONE_BASELINES.growthHormone.baseline + 10 * intensity,
      duration: 120
    };
  }

  // Testosterone increases with resistance exercise
  if (exercise.category === 'resistance') {
    responses.testosterone = {
      peak: HORMONE_BASELINES.testosterone.baseline + 10 * intensity,
      duration: 90
    };
  }

  // Glucagon increases during exercise (glucose mobilization)
  responses.glucagon = {
    peak: HORMONE_BASELINES.glucagon.baseline + 20 * intensity,
    duration: 60 + duration
  };

  // Insulin decreases during exercise (glucose uptake without insulin)
  responses.insulin = {
    peak: HORMONE_BASELINES.insulin.baseline * 0.5,
    duration: 60 + duration
  };

  // Ghrelin increases after intense exercise (hunger)
  if (intensity > 0.7) {
    responses.ghrelin = {
      peak: HORMONE_BASELINES.ghrelin.baseline + 50 * intensity,
      duration: 120
    };
  }

  return responses;
}

// Simulate stress effect on hormones
export function simulateStressEffect(intensity: number) {
  const responses: Record<string, { peak: number; duration: number }> = {};

  // Cortisol strongly affected by stress
  responses.cortisol = {
    peak: HORMONE_BASELINES.cortisol.baseline + 15 * intensity,
    duration: 180
  };

  // Epinephrine increases with stress
  responses.epinephrine = {
    peak: HORMONE_BASELINES.epinephrine.baseline + 50 * intensity,
    duration: 60
  };

  // Insulin resistance with stress (higher baseline)
  responses.insulin = {
    peak: HORMONE_BASELINES.insulin.baseline * (1 + 0.3 * intensity),
    duration: 120
  };

  // Testosterone decreases with chronic stress
  responses.testosterone = {
    peak: HORMONE_BASELINES.testosterone.baseline * (1 - 0.2 * intensity),
    duration: 240
  };

  // Ghrelin increases with stress (stress eating)
  responses.ghrelin = {
    peak: HORMONE_BASELINES.ghrelin.baseline + 40 * intensity,
    duration: 120
  };

  return responses;
}

// Simulate sleep effect on hormones
export function simulateSleepEffect(hours: number, quality: number) {
  const responses: Record<string, { peak: number; duration: number }> = {};

  // Cortisol drops after good sleep
  const cortisolReduction = 0.3 * quality;
  responses.cortisol = {
    peak: HORMONE_BASELINES.cortisol.baseline * (1 - cortisolReduction),
    duration: 240
  };

  // Growth hormone peaks during sleep
  responses.growthHormone = {
    peak: HORMONE_BASELINES.growthHormone.baseline + 5 * hours * quality,
    duration: 180
  };

  // Testosterone increases after good sleep
  responses.testosterone = {
    peak: HORMONE_BASELINES.testosterone.baseline * (1 + 0.3 * hours * quality),
    duration: 360
  };

  // Insulin sensitivity improves after sleep
  responses.insulin = {
    peak: HORMONE_BASELINES.insulin.baseline * 0.8,
    duration: 180
  };

  // Ghrelin balances out after sleep
  responses.ghrelin = {
    peak: HORMONE_BASELINES.ghrelin.baseline,
    duration: 120
  };

  // Leptin increases after sleep
  responses.leptin = {
    peak: HORMONE_BASELINES.leptin.baseline * (1 + 0.2 * hours * quality),
    duration: 240
  };

  return responses;
}

// Active hormone effects
interface ActiveEffect {
  hormone: string;
  targetValue: number;
  startTime: number;
  duration: number;
}

let activeEffects: ActiveEffect[] = [];

export function addHormoneEffect(
  hormone: string,
  targetValue: number,
  duration: number
) {
  activeEffects.push({
    hormone,
    targetValue,
    startTime: Date.now(),
    duration: duration * 60 * 1000, // Convert minutes to milliseconds
  });

  // Clean up old effects
  activeEffects = activeEffects.filter(e => Date.now() - e.startTime < e.duration);
}

export function getActiveEffect(hormone: string): number | null {
  const now = Date.now();
  activeEffects = activeEffects.filter(e => now - e.startTime < e.duration);

  const effect = activeEffects.find(e => e.hormone === hormone);
  if (!effect) return null;

  const elapsed = now - effect.startTime;
  const progress = elapsed / effect.duration;

  // Ease-out cubic for smoother transitions
  const easeOut = 1 - Math.pow(1 - progress, 3);

  return effect.targetValue * (1 - easeOut);
}

export function clearAllEffects() {
  activeEffects = [];
}

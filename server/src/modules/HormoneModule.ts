// ============================================================================
// METABOLIC SIMULATOR - HORMONE MODULE
// ============================================================================

import {
  SimulationState,
  HormonalState,
  HormoneName,
  StimulusType,
  ResponseCurve,
  Trend,
  HORMONE_RESPONSES,
} from '@metabol-sim/shared';

// ----------------------------------------------------------------------------
// Active Hormone Response
// ----------------------------------------------------------------------------

interface ActiveHormoneResponse {
  hormone: HormoneName;
  stimulus: StimulusType;
  elapsedTime: number;
  onsetDelay: number;
  peakTime: number;
  totalDuration: number;
  baseline: number;
  peakValue: number;
  curve: ResponseCurve;
  sensitivity: number;
}

// ----------------------------------------------------------------------------
// Hormone Module
// ----------------------------------------------------------------------------

export class HormoneModule {
  private activeResponses: ActiveHormoneResponse[] = [];
  private responseMap: Map<string, typeof HORMONE_RESPONSES[0]>;

  constructor() {
    // Build a map for quick lookup
    this.responseMap = new Map();
    for (const response of HORMONE_RESPONSES) {
      const key = `${response.hormone}-${response.stimulus}`;
      this.responseMap.set(key, response);
    }
  }

  /**
   * Main update function called by simulation loop
   */
  public update(state: SimulationState, dtMinutes: number): void {
    const hormones = state.hormones;

    // Update active hormone responses
    this.activeResponses = this.activeResponses.filter((response) => {
      response.elapsedTime += dtMinutes;

      if (response.elapsedTime >= response.totalDuration) {
        // Response complete, return to baseline
        this.applyBaselineReturn(hormones, response.hormone);
        return false;
      }

      // Calculate current hormone level based on response curve
      const value = this.calculateResponseValue(response);
      hormones[response.hormone].currentValue = value;

      // Update peak/trough tracking
      this.updatePeakTrough(hormones[response.hormone]);

      return true;
    });

    // Natural decay toward baseline for hormones without active responses
    this.decayToBaseline(hormones, dtMinutes);

    // Update trends
    this.updateTrends(hormones);
  }

  /**
   * Trigger a hormonal response to a stimulus
   */
  public triggerResponse(
    state: HormonalState,
    hormone: HormoneName,
    stimulus: StimulusType,
    intensity: number = 1
  ): void {
    const key = `${hormone}-${stimulus}`;
    const response = this.responseMap.get(key);

    if (!response) {
      // No specific response curve defined - use default
      return;
    }

    const adjustedMagnitude = response.magnitude * intensity;
    const baseline = state[hormone].baseline;

    // Calculate peak value (could be increase or decrease)
    const peakValue = baseline * (1 + adjustedMagnitude / 100);

    // Add new active response
    this.activeResponses.push({
      hormone,
      stimulus,
      elapsedTime: 0,
      onsetDelay: response.onsetDelay,
      peakTime: response.peakTime,
      totalDuration: response.duration,
      baseline,
      peakValue,
      curve: response.curve,
      sensitivity: state[hormone].sensitivity,
    });

    // If there's an existing response for this hormone, blend them
    this.mergeHormoneResponses(state, hormone);
  }

  /**
   * Merge multiple active responses for the same hormone
   */
  private mergeHormoneResponses(state: HormonalState, hormone: HormoneName): void {
    const responses = this.activeResponses.filter((r) => r.hormone === hormone);
    if (responses.length <= 1) return;

    // Get the total effect from all active responses
    let totalEffect = 0;
    for (const r of responses) {
      totalEffect += (r.peakValue - r.baseline) * r.sensitivity;
    }

    // Apply blended effect
    state[hormone].currentValue = state[hormone].baseline + totalEffect;
  }

  /**
   * Calculate hormone value based on response curve and elapsed time
   */
  private calculateResponseValue(response: ActiveHormoneResponse): number {
    const t = response.elapsedTime;
    const delay = response.onsetDelay;

    // Before onset delay, hormone is at baseline
    if (t < delay) {
      return response.baseline;
    }

    const effectiveTime = t - delay;
    const peakTime = response.peakTime - delay;

    switch (response.curve) {
      case ResponseCurve.ExponentialRiseDecay:
        return this.exponentialRiseDecay(effectiveTime, peakTime, response);

      case ResponseCurve.Gaussian:
        return this.gaussian(effectiveTime, peakTime, response);

      case ResponseCurve.Sigmoid:
        return this.sigmoid(effectiveTime, peakTime, response);

      case ResponseCurve.LinearPulse:
        return this.linearPulse(effectiveTime, peakTime, response);

      default:
        return response.baseline;
    }
  }

  /**
   * Exponential rise and decay curve
   * Models many hormonal responses including insulin
   */
  private exponentialRiseDecay(
    t: number,
    peak: number,
    response: ActiveHormoneResponse
  ): number {
    const riseRate = 3 / peak; // Rise to ~95% by peak
    const decayDuration = response.totalDuration - response.onsetDelay - peak;
    const decayRate = 2 / Math.max(1, decayDuration);

    let value: number;
    if (t <= peak) {
      // Rising phase
      const amplitude = (response.peakValue - response.baseline) * response.sensitivity;
      value = response.baseline + amplitude * (1 - Math.exp(-riseRate * t));
    } else {
      // Decay phase
      const amplitude = (response.peakValue - response.baseline) * response.sensitivity;
      value =
        response.baseline + amplitude * Math.exp(-decayRate * (t - peak));
    }

    return this.clampToPositive(value);
  }

  /**
   * Gaussian curve for symmetric responses
   */
  private gaussian(
    t: number,
    peak: number,
    response: ActiveHormoneResponse
  ): number {
    const duration = response.totalDuration - response.onsetDelay;
    const sigma = duration / 6; // 99.7% within 3 sigma
    const amplitude = (response.peakValue - response.baseline) * response.sensitivity;

    const value =
      response.baseline + amplitude * Math.exp(-Math.pow(t - peak, 2) / (2 * sigma * sigma));

    return this.clampToPositive(value);
  }

  /**
   * Sigmoid curve
   */
  private sigmoid(
    t: number,
    peak: number,
    response: ActiveHormoneResponse
  ): number {
    const duration = response.totalDuration - response.onsetDelay;
    const k = 10 / duration; // Steepness

    // Sigmoid centered at peak
    const sigmoid = 1 / (1 + Math.exp(-k * (t - peak)));

    const amplitude = (response.peakValue - response.baseline) * response.sensitivity;
    const value = response.baseline + amplitude * sigmoid;

    return this.clampToPositive(value);
  }

  /**
   * Linear pulse with exponential decay
   */
  private linearPulse(
    t: number,
    peak: number,
    response: ActiveHormoneResponse
  ): number {
    const amplitude = (response.peakValue - response.baseline) * response.sensitivity;
    const decayDuration = response.totalDuration - response.onsetDelay - peak;

    let value: number;
    if (t < peak) {
      // Linear rise
      value = response.baseline + amplitude * (t / peak);
    } else {
      // Exponential decay
      value =
        response.baseline +
        amplitude * Math.exp(-3 * (t - peak) / Math.max(1, decayDuration));
    }

    return this.clampToPositive(value);
  }

  /**
   * Ensure hormone values stay positive
   */
  private clampToPositive(value: number): number {
    return Math.max(0.01, value);
  }

  /**
   * Apply baseline return when response completes
   */
  private applyBaselineReturn(hormones: HormonalState, hormone: HormoneName): void {
    hormones[hormone].currentValue = hormones[hormone].baseline;
  }

  /**
   * Natural decay toward baseline for hormones without active responses
   */
  private decayToBaseline(hormones: HormonalState, dtMinutes: number): void {
    const decayRate = 0.05; // 5% per minute toward baseline

    for (const hormoneName in hormones) {
      const hormone = hormones[hormoneName as HormoneName];

      // Check if this hormone has active responses
      const hasActiveResponse = this.activeResponses.some(
        (r) => r.hormone === hormoneName as HormoneName
      );

      if (!hasActiveResponse) {
        // Decay toward baseline (bounded to prevent overshoot)
        const diff = hormone.baseline - hormone.currentValue;
        const change = diff * decayRate * dtMinutes;

        // Don't overshoot baseline
        if (Math.abs(change) >= Math.abs(diff)) {
          hormone.currentValue = hormone.baseline;
        } else {
          hormone.currentValue += change;
        }

        // Ensure positive values
        hormone.currentValue = Math.max(0.01, hormone.currentValue);
      }
    }
  }

  /**
   * Update peak and trough values
   */
  private updatePeakTrough(hormone: { currentValue: number; peak: number; trough: number }): void {
    if (hormone.currentValue > hormone.peak) {
      hormone.peak = hormone.currentValue;
    }
    if (hormone.currentValue < hormone.trough || hormone.trough === 0) {
      hormone.trough = hormone.currentValue;
    }
  }

  /**
   * Update trends for all hormones
   */
  private updateTrends(hormones: HormonalState): void {
    const windowSize = 5; // Minutes to consider for trend

    for (const hormoneName in hormones) {
      const hormone = hormones[hormoneName as HormoneName];

      // Simple trend calculation based on current vs baseline
      const diff = hormone.currentValue - hormone.baseline;
      const threshold = hormone.baseline * 0.05; // 5% threshold

      if (Math.abs(diff) < threshold) {
        hormone.trend = Trend.Stable;
      } else if (diff > 0) {
        hormone.trend = Trend.Rising;
      } else {
        hormone.trend = Trend.Falling;
      }
    }
  }

  /**
   * Apply stress response
   */
  public applyStress(state: SimulationState, intensity: number): void {
    // Cortisol spikes with stress
    this.triggerResponse(state.hormones, 'cortisol', 'stress', intensity);

    // Testosterone suppressed by stress
    const testosteroneBaseline = state.hormones.testosterone.baseline;
    state.hormones.testosterone.currentValue =
      testosteroneBaseline * (1 - intensity * 0.3);

    // Epinephrine (adrenaline) response
    this.triggerResponse(state.hormones, 'epinephrine', 'stress', intensity);
  }

  /**
   * Apply exercise hormonal effects
   */
  public applyExerciseEffects(
    state: SimulationState,
    category: 'cardio' | 'resistance' | 'hiit',
    intensity: number
  ): void {
    const stimulusMap = {
      cardio: 'cardioExercise' as StimulusType,
      resistance: 'resistanceExercise' as StimulusType,
      hiit: 'hiitExercise' as StimulusType,
    };

    const stimulus = stimulusMap[category];

    // Category-specific hormonal responses
    switch (category) {
      case 'resistance':
        this.triggerResponse(state.hormones, 'testosterone', stimulus, intensity);
        this.triggerResponse(state.hormones, 'growthHormone', stimulus, intensity * 0.8);
        this.triggerResponse(state.hormones, 'cortisol', stimulus, intensity * 0.6);
        this.triggerResponse(state.hormones, 'igf1', stimulus, intensity * 0.5);
        break;

      case 'hiit':
        this.triggerResponse(state.hormones, 'growthHormone', stimulus, intensity);
        this.triggerResponse(state.hormones, 'epinephrine', stimulus, intensity * 0.8);
        this.triggerResponse(state.hormones, 'cortisol', stimulus, intensity * 0.7);
        break;

      case 'cardio':
        this.triggerResponse(state.hormones, 'epinephrine', stimulus, intensity * 0.4);
        this.triggerResponse(state.hormones, 'cortisol', stimulus, intensity * 0.3);
        break;
    }
  }

  /**
   * Clear all active responses (for testing/debugging)
   */
  public clearResponses(): void {
    this.activeResponses = [];
  }

  /**
   * Get count of active responses
   */
  public getActiveResponseCount(): number {
    return this.activeResponses.length;
  }
}

// ============================================================================
// METABOLIC SIMULATOR - SIMULATION LOOP
// ============================================================================

import { v4 as uuidv4 } from 'uuid';
import {
  SimulationState,
  SimulationEvent,
  SimulationSettings,
  SimulationEventType,
  UserProfile,
  EnergyState,
  HormonalState,
  MuscleState,
  MetabolicState,
  BASELINE_HORMONES,
  Trend,
  SIMULATION_CONFIG,
} from '@metabol-sim/shared';

// ----------------------------------------------------------------------------
// Time Controller
// ----------------------------------------------------------------------------

export class TimeController {
  private _gameTime: Date;
  private _realTimeStart: number;
  private _timeScale: number;
  private _paused: boolean;

  constructor(initialTime: Date = new Date()) {
    this._gameTime = new Date(initialTime);
    this._realTimeStart = performance.now();
    this._timeScale = SIMULATION_CONFIG.defaultTimeScale;
    this._paused = false;
  }

  public update(realTimeMs: number): void {
    if (this._paused) return;

    const realElapsed = realTimeMs - this._realTimeStart;
    const gameElapsedMs = realElapsed * this._timeScale;

    this._gameTime = new Date(this._gameTime.getTime() + gameElapsedMs);
    this._realTimeStart = realTimeMs;
  }

  get gameTime(): Date {
    return this._gameTime;
  }

  set gameTime(value: Date) {
    this._gameTime = new Date(value);
  }

  get timeScale(): number {
    return this._timeScale;
  }

  set timeScale(value: number) {
    this._timeScale = Math.max(
      SIMULATION_CONFIG.minTimeScale,
      Math.min(SIMULATION_CONFIG.maxTimeScale, value)
    );
  }

  get paused(): boolean {
    return this._paused;
  }

  set paused(value: boolean) {
    this._paused = value;
    if (!value) {
      this._realTimeStart = performance.now();
    }
  }

  public getSpeedDescription(): string {
    if (this._timeScale === 1) return 'Real-time';
    if (this._timeScale < 1) return `${(1 / this._timeScale).toFixed(1)}x slower`;
    if (this._timeScale < 60) return `${this._timeScale.toFixed(1)}x faster`;
    return `${(this._timeScale / 60).toFixed(1)} min/sec`;
  }
}

// ----------------------------------------------------------------------------
// State Factory
// ----------------------------------------------------------------------------

export function createInitialState(userId: string, profile: UserProfile): SimulationState {
  const now = new Date();

  // Calculate initial glycogen capacity based on lean mass
  const leanMass = profile.weight * (1 - profile.bodyFatPercentage);
  const muscleMass = leanMass * 0.45; // Approximately 45% of lean mass is skeletal muscle

  return {
    id: uuidv4(),
    userId,
    timestamp: now,
    gameTime: now,

    user: profile,

    energy: createInitialEnergyState(profile, leanMass, muscleMass),
    hormones: createInitialHormonalState(),
    muscle: createInitialMuscleState(muscleMass),

    recentMeals: [],
    recentExercises: [],
    recentSleep: [],

    settings: createInitialSettings(),
  };
}

function createInitialEnergyState(
  profile: UserProfile,
  leanMass: number,
  muscleMass: number
): EnergyState {
  // Calculate BMR using Mifflin-St Jeor
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  bmr += profile.biologicalSex === 'male' ? 5 : -161;

  const tdee = bmr * profile.activityLevel;

  // Glycogen capacity
  const muscleGlycogenCapacity = muscleMass * 15; // 15g per kg muscle
  const liverGlycogenCapacity = 100; // ~100g average

  // Baseline blood glucose (mg/dL)
  const baselineGlucose = 85;

  return {
    bmr,
    tdee,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    netCalories: 0,

    bloodGlucose: {
      currentValue: baselineGlucose,
      baseline: baselineGlucose,
      peak: baselineGlucose,
      trend: 0, // Stable
      lastMealTime: undefined,
      lastMealGlycemicLoad: 0,
      units: 'mg/dL',
    },

    carbohydrates: { consumed: 0, burned: 0, target: (tdee * 0.5) / 4 },
    proteins: { consumed: 0, burned: 0, target: (profile.weight * 1.6) },
    fats: { consumed: 0, burned: 0, target: (tdee * 0.25) / 9 },

    glycogen: {
      muscle: 1, // 100% full
      liver: 1,
      capacity: {
        muscle: muscleGlycogenCapacity,
        liver: liverGlycogenCapacity,
      },
    },

    bodyFat: profile.weight * profile.bodyFatPercentage,
    leanMass,

    substrateUtilization: {
      fatOxidation: 0.1,
      glucoseOxidation: 0.08,
      proteinOxidation: 0.001,
      metabolicState: MetabolicState.Fasted,
    },
  };
}

function createInitialHormonalState(): HormonalState {
  return {
    insulin: { currentValue: BASELINE_HORMONES.insulin, baseline: BASELINE_HORMONES.insulin, peak: BASELINE_HORMONES.insulin, trough: BASELINE_HORMONES.insulin, trend: Trend.Stable, sensitivity: 1 },
    glucagon: { currentValue: BASELINE_HORMONES.glucagon, baseline: BASELINE_HORMONES.glucagon, peak: BASELINE_HORMONES.glucagon, trough: BASELINE_HORMONES.glucagon, trend: Trend.Stable, sensitivity: 1 },
    cortisol: { currentValue: BASELINE_HORMONES.cortisol, baseline: BASELINE_HORMONES.cortisol, peak: BASELINE_HORMONES.cortisol, trough: BASELINE_HORMONES.cortisol, trend: Trend.Stable, sensitivity: 1 },
    testosterone: { currentValue: BASELINE_HORMONES.testosterone, baseline: BASELINE_HORMONES.testosterone, peak: BASELINE_HORMONES.testosterone, trough: BASELINE_HORMONES.testosterone, trend: Trend.Stable, sensitivity: 1 },
    growthHormone: { currentValue: BASELINE_HORMONES.growthHormone, baseline: BASELINE_HORMONES.growthHormone, peak: BASELINE_HORMONES.growthHormone, trough: BASELINE_HORMONES.growthHormone, trend: Trend.Stable, sensitivity: 1 },
    igf1: { currentValue: BASELINE_HORMONES.igf1, baseline: BASELINE_HORMONES.igf1, peak: BASELINE_HORMONES.igf1, trough: BASELINE_HORMONES.igf1, trend: Trend.Stable, sensitivity: 1 },
    epinephrine: { currentValue: BASELINE_HORMONES.epinephrine, baseline: BASELINE_HORMONES.epinephrine, peak: BASELINE_HORMONES.epinephrine, trough: BASELINE_HORMONES.epinephrine, trend: Trend.Stable, sensitivity: 1 },
    leptin: { currentValue: BASELINE_HORMONES.leptin, baseline: BASELINE_HORMONES.leptin, peak: BASELINE_HORMONES.leptin, trough: BASELINE_HORMONES.leptin, trend: Trend.Stable, sensitivity: 1 },
    ghrelin: { currentValue: BASELINE_HORMONES.ghrelin, baseline: BASELINE_HORMONES.ghrelin, peak: BASELINE_HORMONES.ghrelin, trough: BASELINE_HORMONES.ghrelin, trend: Trend.Stable, sensitivity: 1 },
  };
}

function createInitialMuscleState(muscleMass: number): MuscleState {
  return {
    totalMass: muscleMass,
    skeletalMuscleMass: muscleMass,
    fiberTypeDistribution: {
      type1: 0.5,   // 50% slow-twitch (average)
      type2a: 0.3,  // 30% intermediate
      type2x: 0.2,  // 20% fast-twitch
    },

    proteinBalance: {
      synthesisRate: 0.01,
      breakdownRate: 0.01,
      netBalance: 0,
      anabolicWindowRemaining: 0,
    },

    satelliteCells: {
      active: 0,
      proliferating: 0,
      differentiating: 0,
      fusing: 0,
      nucleiPerFiber: 1,
    },

    mtorSignaling: {
      activity: 0,
      leucineThresholdMet: false,
      insulinSufficient: false,
      mechanicalStimulus: 0,
      energyStatus: 1,
    },

    recoveryStatus: {
      muscleDamage: 0,
      glycogenRepletion: 1,
      inflammation: 0,
      centralFatigue: 0,
      sleepDebt: 0,
    },

    trainingAdaptations: {
      strength: 1,
      endurance: 1,
      power: 1,
      workCapacity: 0,
      lastWorkout: null,
      consecutiveDays: 0,
    },
  };
}

function createInitialSettings(): SimulationSettings {
  return {
    timeScale: SIMULATION_CONFIG.defaultTimeScale,
    paused: false,
    autoSave: true,
  };
}

// ----------------------------------------------------------------------------
// Simulation Loop
// ----------------------------------------------------------------------------

export interface SimulationModules {
  energy: any;
  hormone: any;
  muscle: any;
  exercise: any;
  food: any;
}

export class SimulationLoop {
  private _state: SimulationState;
  private _timeController: TimeController;
  private _modules: SimulationModules;
  private _eventQueue: SimulationEvent[] = [];
  private _executedEventIds: Set<string> = new Set();
  private _tickRate: number;
  private _accumulator: number = 0;
  private _lastTick: number;
  private _listeners: Map<string, Set<(state: SimulationState) => void>> = new Map();

  constructor(state: SimulationState, modules: SimulationModules, config?: { tickRate?: number }) {
    this._state = state;
    this._modules = modules;
    this._tickRate = config?.tickRate || SIMULATION_CONFIG.defaultTickRate;
    this._lastTick = performance.now();
    this._timeController = new TimeController(state.gameTime);
  }

  public get state(): SimulationState {
    return this._state;
  }

  public get timeController(): TimeController {
    return this._timeController;
  }

  public scheduleEvent(event: SimulationEvent): void {
    this._eventQueue.push(event);
  }

  public on(event: string, callback: (state: SimulationState) => void): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: (state: SimulationState) => void): void {
    this._listeners.get(event)?.delete(callback);
  }

  private emit(event: string): void {
    this._listeners.get(event)?.forEach((callback) => callback(this._state));
  }

  public tick(currentTime: number = performance.now()): void {
    const deltaTime = currentTime - this._lastTick;
    this._lastTick = currentTime;

    // Update time controller
    this._timeController.update(currentTime);

    // Update game time in state
    this._state.gameTime = this._timeController.gameTime;
    this._state.settings.timeScale = this._timeController.timeScale;
    this._state.settings.paused = this._timeController.paused;

    // Apply time scaling to simulation
    const scaledDelta = deltaTime * this._timeController.timeScale;
    this._accumulator += scaledDelta;

    // Fixed time step updates
    const fixedTick = 1000 / this._tickRate;

    while (this._accumulator >= fixedTick) {
      this.update(fixedTick);
      this._accumulator -= fixedTick;
    }

    // Emit state update for UI
    this.emit('stateUpdate');
  }

  private update(dt: number): void {
    // Convert milliseconds to simulation minutes
    const simMinutes = (dt / 1000) * this._timeController.timeScale / 60;

    // Process pending events
    this.processEvents(simMinutes);

    // Update modules (order matters!)
    this._modules.food?.update(this._state, simMinutes);
    this._modules.hormone?.update(this._state, simMinutes);
    this._modules.energy?.update(this._state, simMinutes);
    this._modules.muscle?.update(this._state, simMinutes);
    this._modules.exercise?.update(this._state, simMinutes);

    // Update timestamp
    this._state.timestamp = new Date();
  }

  private processEvents(dtMinutes: number): void {
    const now = this._state.gameTime;

    // Find events that should trigger
    for (const event of this._eventQueue) {
      if (!this._executedEventIds.has(event.id) && event.scheduledTime <= now) {
        this.executeEvent(event);
        this._executedEventIds.add(event.id);
      }
    }

    // Remove executed events
    this._eventQueue = this._eventQueue.filter((e) => !this._executedEventIds.has(e.id));
  }

  private executeEvent(event: SimulationEvent): void {
    switch (event.type) {
      case SimulationEventType.Meal:
        this._modules.food?.consumeMeal(this._state, event.data);
        break;
      case SimulationEventType.Exercise:
        this._modules.exercise?.performExercise(this._state, event.data);
        break;
      case SimulationEventType.Sleep:
        this._modules.muscle?.applySleep(this._state, event.data);
        break;
      case SimulationEventType.Stress:
        this._modules.hormone?.applyStress(this._state, event.data);
        break;
    }
  }

  public setTimeScale(scale: number): void {
    this._timeController.timeScale = scale;
  }

  public setPaused(paused: boolean): void {
    this._timeController.paused = paused;
  }

  public togglePause(): void {
    this._timeController.paused = !this._timeController.paused;
  }
}

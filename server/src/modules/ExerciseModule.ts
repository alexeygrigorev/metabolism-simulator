// ============================================================================
// METABOLIC SIMULATOR - EXERCISE MODULE
// ============================================================================

import { v4 as uuidv4 } from 'uuid';
import {
  SimulationState,
  ExerciseSession,
  CompletedExercise,
  ExerciseCategory,
  ExerciseEffects,
  EXERCISE_EFFECTS,
  MetabolicState,
} from '@metabol-sim/shared';

// ----------------------------------------------------------------------------
// Exercise Database (simplified - would be loaded from JSON in production)
// ----------------------------------------------------------------------------

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  met: number;
  load?: number;
  primaryMuscles: string[];
  mechanicalActivation: number;
}

const EXERCISE_DB: Record<string, Exercise> = {
  // Compound lifts
  squat: {
    id: 'squat',
    name: 'Barbell Squat',
    category: ExerciseCategory.Resistance,
    met: 5.0,
    load: 20,
    primaryMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    mechanicalActivation: 0.9,
  },
  deadlift: {
    id: 'deadlift',
    name: 'Deadlift',
    category: ExerciseCategory.Resistance,
    met: 6.0,
    load: 100,
    primaryMuscles: ['quadriceps', 'glutes', 'hamstrings', 'lowerBack', 'traps'],
    mechanicalActivation: 0.95,
  },
  benchPress: {
    id: 'benchPress',
    name: 'Bench Press',
    category: ExerciseCategory.Resistance,
    met: 4.0,
    load: 60,
    primaryMuscles: ['chest', 'triceps', 'shoulders'],
    mechanicalActivation: 0.85,
  },
  overheadPress: {
    id: 'overheadPress',
    name: 'Overhead Press',
    category: ExerciseCategory.Resistance,
    met: 4.5,
    load: 40,
    primaryMuscles: ['shoulders', 'triceps'],
    mechanicalActivation: 0.8,
  },
  barbellRow: {
    id: 'barbellRow',
    name: 'Barbell Row',
    category: ExerciseCategory.Resistance,
    met: 5.0,
    load: 50,
    primaryMuscles: ['back', 'biceps', 'lats'],
    mechanicalActivation: 0.85,
  },
  pullup: {
    id: 'pullup',
    name: 'Pull-up',
    category: ExerciseCategory.Resistance,
    met: 4.0,
    load: 0,
    primaryMuscles: ['lats', 'biceps', 'forearms'],
    mechanicalActivation: 0.8,
  },

  // Isolation exercises
  bicepCurl: {
    id: 'bicepCurl',
    name: 'Bicep Curl',
    category: ExerciseCategory.Resistance,
    met: 2.5,
    load: 20,
    primaryMuscles: ['biceps'],
    mechanicalActivation: 0.5,
  },
  tricepExtension: {
    id: 'tricepExtension',
    name: 'Tricep Extension',
    category: ExerciseCategory.Resistance,
    met: 2.5,
    load: 20,
    primaryMuscles: ['triceps'],
    mechanicalActivation: 0.5,
  },
  legPress: {
    id: 'legPress',
    name: 'Leg Press',
    category: ExerciseCategory.Resistance,
    met: 4.0,
    load: 100,
    primaryMuscles: ['quadriceps', 'glutes'],
    mechanicalActivation: 0.7,
  },

  // Bodyweight
  pushup: {
    id: 'pushup',
    name: 'Push-up',
    category: ExerciseCategory.Resistance,
    met: 3.5,
    load: 0,
    primaryMuscles: ['chest', 'triceps', 'shoulders'],
    mechanicalActivation: 0.6,
  },
  lunge: {
    id: 'lunge',
    name: 'Lunge',
    category: ExerciseCategory.Resistance,
    met: 3.5,
    load: 0,
    primaryMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    mechanicalActivation: 0.7,
  },
  plank: {
    id: 'plank',
    name: 'Plank',
    category: ExerciseCategory.Resistance,
    met: 2.5,
    load: 0,
    primaryMuscles: ['abs', 'lowerBack'],
    mechanicalActivation: 0.3,
  },

  // Cardio
  running: {
    id: 'running',
    name: 'Running (8 km/h)',
    category: ExerciseCategory.Cardio,
    met: 8.0,
    primaryMuscles: [],
    mechanicalActivation: 0.1,
  },
  cycling: {
    id: 'cycling',
    name: 'Cycling (moderate)',
    category: ExerciseCategory.Cardio,
    met: 7.0,
    primaryMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    mechanicalActivation: 0.15,
  },
  swimming: {
    id: 'swimming',
    name: 'Swimming (moderate)',
    category: ExerciseCategory.Cardio,
    met: 7.5,
    primaryMuscles: [],
    mechanicalActivation: 0.1,
  },
  walking: {
    id: 'walking',
    name: 'Brisk Walking',
    category: ExerciseCategory.Cardio,
    met: 4.0,
    primaryMuscles: [],
    mechanicalActivation: 0.05,
  },

  // HIIT
  hiitSprinting: {
    id: 'hiitSprinting',
    name: 'HIIT Sprinting',
    category: ExerciseCategory.HIIT,
    met: 12.0,
    primaryMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    mechanicalActivation: 0.2,
  },
  hiitBurpees: {
    id: 'hiitBurpees',
    name: 'HIIT Burpees',
    category: ExerciseCategory.HIIT,
    met: 10.0,
    primaryMuscles: ['chest', 'quadriceps', 'glutes', 'abs'],
    mechanicalActivation: 0.3,
  },
};

// ----------------------------------------------------------------------------
// Exercise Module
// ----------------------------------------------------------------------------

export class ExerciseModule {
  private activeSessions: Map<string, ExerciseSession> = new Map();
  private exerciseModules: { muscle: any; hormone: any; energy: any };

  constructor(modules: { muscle: any; hormone: any; energy: any }) {
    this.exerciseModules = modules;
  }

  /**
   * Main update function called by simulation loop
   */
  public update(state: SimulationState, dtMinutes: number): void {
    // Update active exercise sessions
    const now = state.gameTime;

    for (const [id, session] of this.activeSessions) {
      const endTime = session.endTime ? new Date(session.endTime).getTime() : null;

      // Check if exercise just ended
      if (endTime && now.getTime() >= endTime) {
        this.finalizeExercise(state, session);
        this.activeSessions.delete(id);
      }
    }
  }

  /**
   * Start a new exercise session
   */
  public startExercise(
    state: SimulationState,
    exercises: CompletedExercise[],
    estimatedDurationMinutes: number
  ): ExerciseSession {
    const session: ExerciseSession = {
      id: uuidv4(),
      startTime: state.gameTime,
      endTime: new Date(state.gameTime.getTime() + estimatedDurationMinutes * 60000),
      exercises,
      totalVolume: this.calculateVolume(exercises),
      totalWork: this.calculateWork(exercises),
      perceivedExertion: this.calculateAverageRPE(exercises),
    };

    this.activeSessions.set(session.id, session);
    state.recentExercises.push(session);

    // Apply immediate effects
    this.applyExerciseEffects(state, session);

    return session;
  }

  /**
   * Perform exercise (one-shot for completed sessions)
   */
  public performExercise(state: SimulationState, data: any): void {
    const session = data as ExerciseSession;
    state.recentExercises.push(session);
    this.applyExerciseEffects(state, session);
  }

  /**
   * Calculate exercise volume (load × reps × sets)
   */
  private calculateVolume(exercises: CompletedExercise[]): number {
    let volume = 0;
    for (const ex of exercises) {
      for (const set of ex.sets) {
        volume += set.load * set.reps;
      }
    }
    return volume;
  }

  /**
   * Calculate work (joules)
   */
  private calculateWork(exercises: CompletedExercise[]): number {
    // Simplified work calculation
    // In reality would depend on distance moved, gravity, etc.
    let work = 0;
    for (const ex of exercises) {
      const exerciseDef = EXERCISE_DB[ex.exerciseId];
      if (exerciseDef) {
        for (const set of ex.sets) {
          // Approximate: force × distance
          const force = set.load * 9.81; // Newtons
          const distance = exerciseDef.load ? 0.5 : 1; // meters (ROM approximation)
          work += force * distance * set.reps;
        }
      }
    }
    return work;
  }

  /**
   * Calculate average RPE
   */
  private calculateAverageRPE(exercises: CompletedExercise[]): number {
    let totalRPE = 0;
    let setCount = 0;

    for (const ex of exercises) {
      for (const set of ex.sets) {
        totalRPE += set.rpe;
        setCount++;
      }
    }

    return setCount > 0 ? totalRPE / setCount : 5;
  }

  /**
   * Apply exercise effects to the simulation state
   */
  private applyExerciseEffects(state: SimulationState, session: ExerciseSession): void {
    const category = this.getExerciseCategory(session);
    const intensity = session.perceivedExertion / 10;

    // Calculate calories burned
    const caloriesBurned = this.calculateCaloriesBurned(state, session);
    state.energy.caloriesBurned += caloriesBurned;

    // Apply hormonal effects via hormone module
    this.exerciseModules.hormone?.applyExerciseEffects(
      state,
      category as 'cardio' | 'resistance' | 'hiit',
      intensity
    );

    // Apply mechanical mTOR activation for resistance training
    if (category === ExerciseCategory.Resistance) {
      const mtorActivation = this.calculateMtorActivation(session);
      this.exerciseModules.muscle?.activateMtorMechanically(
        state.muscle,
        mtorActivation
      );

      // Apply muscle damage
      const volume = session.totalVolume;
      this.exerciseModules.muscle?.applyExerciseDamage(
        state.muscle,
        volume,
        intensity
      );
    }

    // Set metabolic state
    state.energy.substrateUtilization.metabolicState = MetabolicState.Exercise;

    // Deplete glycogen based on intensity
    this.depleteGlycogen(state, session, intensity);

    // Update training adaptations
    this.updateTrainingAdaptations(state, session);
  }

  /**
   * Get the primary category of an exercise session
   */
  private getExerciseCategory(session: ExerciseSession): ExerciseCategory {
    for (const ex of session.exercises) {
      const def = EXERCISE_DB[ex.exerciseId];
      if (def) return def.category;
    }
    return ExerciseCategory.Resistance;
  }

  /**
   * Calculate calories burned during exercise
   */
  private calculateCaloriesBurned(state: SimulationState, session: ExerciseSession): number {
    const weight = state.user.weight; // kg
    let totalMET = 0;

    for (const ex of session.exercises) {
      const def = EXERCISE_DB[ex.exerciseId];
      if (def) {
        // 1 MET = 1 kcal/kg/hour
        for (const set of ex.sets) {
          const hours = set.duration / 3600;
          totalMET += def.met * hours;
        }
      }
    }

    return totalMET * weight;
  }

  /**
   * Calculate mTOR activation potential
   */
  private calculateMtorActivation(session: ExerciseSession): number {
    let maxActivation = 0;

    for (const ex of session.exercises) {
      const def = EXERCISE_DB[ex.exerciseId];
      if (def) {
        maxActivation = Math.max(maxActivation, def.mechanicalActivation);
      }
    }

    // Scale by intensity (RPE)
    return maxActivation * (session.perceivedExertion / 10);
  }

  /**
   * Deplete glycogen based on exercise intensity
   */
  private depleteGlycogen(state: SimulationState, session: ExerciseSession, intensity: number): void {
    const glycogen = state.energy.glycogen;

    // Depletion rate depends on intensity
    const depletionPercent = intensity * 0.3; // Up to 30% depletion

    glycogen.muscle = Math.max(0, glycogen.muscle - depletionPercent);

    // Update recovery status
    state.muscle.recoveryStatus.glycogenRepletion = glycogen.muscle;
  }

  /**
   * Update training adaptations
   */
  private updateTrainingAdaptations(state: SimulationState, session: ExerciseSession): void {
    const adaptations = state.muscle.trainingAdaptations;
    const category = this.getExerciseCategory(session);

    const now = new Date();
    const lastWorkout = adaptations.lastWorkout ? new Date(adaptations.lastWorkout) : null;

    // Check consecutive days
    if (lastWorkout) {
      const daysDiff = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 1.5) {
        adaptations.consecutiveDays++;
      } else {
        adaptations.consecutiveDays = 1;
      }
    } else {
      adaptations.consecutiveDays = 1;
    }

    adaptations.lastWorkout = now;

    // Increase work capacity
    adaptations.workCapacity += session.totalVolume;

    // Increase specific attributes based on exercise type
    switch (category) {
      case ExerciseCategory.Resistance:
        adaptations.strength += session.perceivedExertion * 0.01;
        adaptations.power += session.perceivedExertion * 0.005;
        break;
      case ExerciseCategory.Cardio:
        adaptations.endurance += session.perceivedExertion * 0.02;
        break;
      case ExerciseCategory.HIIT:
        adaptations.endurance += session.perceivedExertion * 0.015;
        adaptations.power += session.perceivedExertion * 0.01;
        break;
    }

    // Cap adaptations at reasonable limits
    adaptations.strength = Math.min(adaptations.strength, 10);
    adaptations.endurance = Math.min(adaptations.endurance, 10);
    adaptations.power = Math.min(adaptations.power, 10);
  }

  /**
   * Finalize exercise (called when exercise ends)
   */
  private finalizeExercise(state: SimulationState, session: ExerciseSession): void {
    // Add EPOC (Excess Post-exercise Oxygen Consumption)
    const epoc = this.calculateEPOC(session);
    state.energy.caloriesBurned += epoc;

    // Return to recovery metabolic state
    state.energy.substrateUtilization.metabolicState = MetabolicState.Recovery;
  }

  /**
   * Calculate EPOC (afterburn effect)
   */
  private calculateEPOC(session: ExerciseSession): number {
    const intensity = session.perceivedExertion / 10;
    const duration = session.exercises.reduce((acc, ex) =>
      acc + ex.sets.reduce((s, set) => s + set.duration, 0), 0
    ) / 60; // minutes

    // EPOC formula: approximately 10-50 kcal depending on intensity and duration
    const baseEPOC = 10;
    return baseEPOC * intensity * (1 + duration / 30);
  }

  /**
   * Get exercise by ID
   */
  public getExercise(id: string): Exercise | undefined {
    return EXERCISE_DB[id];
  }

  /**
   * Get all exercises
   */
  public getAllExercises(): Exercise[] {
    return Object.values(EXERCISE_DB);
  }

  /**
   * Get exercises by category
   */
  public getExercisesByCategory(category: ExerciseCategory): Exercise[] {
    return Object.values(EXERCISE_DB).filter((ex) => ex.category === category);
  }

  /**
   * Get exercises by muscle group
   */
  public getExercisesByMuscle(muscle: string): Exercise[] {
    return Object.values(EXERCISE_DB).filter((ex) =>
      ex.primaryMuscles.includes(muscle)
    );
  }
}

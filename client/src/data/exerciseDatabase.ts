// ============================================================================
// METABOLIC SIMULATOR - EXERCISE DATABASE
// ============================================================================
//
// Comprehensive database of exercises with metabolic impact data.
// Each exercise includes MET values, muscle activation, and hormonal effects.
//
// ============================================================================

import type { Exercise } from '@metabol-sim/shared';
import { ExerciseCategory, MuscleGroup } from '@metabol-sim/shared';

// Re-export types for convenience
export type { Exercise };
export { ExerciseCategory };

export const EXERCISE_DATABASE: Exercise[] = [
  // ==========================================================================
  // RESISTANCE EXERCISES - COMPOUND MOVEMENTS
  // ==========================================================================

  {
    id: 'squat-barbell',
    name: 'Barbell Squat',
    category: ExerciseCategory.Resistance,
    met: 5.0,
    load: 60,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Glutes],
    secondaryMuscles: [MuscleGroup.Hamstrings, MuscleGroup.Abs],
    mechanicalActivation: 0.95,
  },
  {
    id: 'deadlift-barbell',
    name: 'Deadlift',
    category: ExerciseCategory.Resistance,
    met: 6.0,
    load: 100,
    primaryMuscles: [MuscleGroup.LowerBack, MuscleGroup.Glutes],
    secondaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Traps],
    mechanicalActivation: 0.98,
  },
  {
    id: 'bench-press-barbell',
    name: 'Barbell Bench Press',
    category: ExerciseCategory.Resistance,
    met: 4.0,
    load: 60,
    primaryMuscles: [MuscleGroup.Chest],
    secondaryMuscles: [MuscleGroup.Triceps, MuscleGroup.Shoulders],
    mechanicalActivation: 0.90,
  },
  {
    id: 'overhead-press-barbell',
    name: 'Overhead Press',
    category: ExerciseCategory.Resistance,
    met: 4.5,
    load: 40,
    primaryMuscles: [MuscleGroup.Shoulders],
    secondaryMuscles: [MuscleGroup.Triceps, MuscleGroup.Traps],
    mechanicalActivation: 0.85,
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    category: ExerciseCategory.Resistance,
    met: 5.0,
    load: 50,
    primaryMuscles: [MuscleGroup.Back],
    secondaryMuscles: [MuscleGroup.Biceps, MuscleGroup.Lats],
    mechanicalActivation: 0.88,
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    category: ExerciseCategory.Resistance,
    met: 8.0,
    load: 0,
    primaryMuscles: [MuscleGroup.Lats],
    secondaryMuscles: [MuscleGroup.Biceps, MuscleGroup.Shoulders],
    mechanicalActivation: 0.92,
  },
  {
    id: 'dip',
    name: 'Dip',
    category: ExerciseCategory.Resistance,
    met: 7.0,
    load: 0,
    primaryMuscles: [MuscleGroup.Chest, MuscleGroup.Triceps],
    secondaryMuscles: [MuscleGroup.Shoulders],
    mechanicalActivation: 0.85,
  },
  {
    id: 'lunges',
    name: 'Dumbbell Lunges',
    category: ExerciseCategory.Resistance,
    met: 5.5,
    load: 20,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Glutes],
    secondaryMuscles: [MuscleGroup.Hamstrings],
    mechanicalActivation: 0.75,
  },

  // ==========================================================================
  // RESISTANCE EXERCISES - ISOLATION MOVEMENTS
  // ==========================================================================

  {
    id: 'bicep-curl-dumbbell',
    name: 'Dumbbell Bicep Curl',
    category: ExerciseCategory.Resistance,
    met: 3.0,
    load: 10,
    primaryMuscles: [MuscleGroup.Biceps],
    secondaryMuscles: [MuscleGroup.Forearms],
    mechanicalActivation: 0.60,
  },
  {
    id: 'tricep-extension',
    name: 'Tricep Extension',
    category: ExerciseCategory.Resistance,
    met: 3.0,
    load: 10,
    primaryMuscles: [MuscleGroup.Triceps],
    secondaryMuscles: [],
    mechanicalActivation: 0.55,
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    category: ExerciseCategory.Resistance,
    met: 3.5,
    load: 5,
    primaryMuscles: [MuscleGroup.Shoulders],
    secondaryMuscles: [MuscleGroup.Traps],
    mechanicalActivation: 0.50,
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    category: ExerciseCategory.Resistance,
    met: 3.0,
    load: 30,
    primaryMuscles: [MuscleGroup.Quadriceps],
    secondaryMuscles: [],
    mechanicalActivation: 0.65,
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    category: ExerciseCategory.Resistance,
    met: 3.0,
    load: 25,
    primaryMuscles: [MuscleGroup.Hamstrings],
    secondaryMuscles: [MuscleGroup.Glutes],
    mechanicalActivation: 0.60,
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    category: ExerciseCategory.Resistance,
    met: 2.5,
    load: 50,
    primaryMuscles: [MuscleGroup.Calves],
    secondaryMuscles: [],
    mechanicalActivation: 0.45,
  },
  {
    id: 'chest-fly',
    name: 'Chest Fly',
    category: ExerciseCategory.Resistance,
    met: 3.5,
    load: 10,
    primaryMuscles: [MuscleGroup.Chest],
    secondaryMuscles: [],
    mechanicalActivation: 0.55,
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    category: ExerciseCategory.Resistance,
    met: 4.0,
    load: 15,
    primaryMuscles: [MuscleGroup.Shoulders],
    secondaryMuscles: [MuscleGroup.Traps, MuscleGroup.Biceps],
    mechanicalActivation: 0.50,
  },

  // ==========================================================================
  // CARDIO EXERCISES
  // ==========================================================================

  {
    id: 'running-treadmill',
    name: 'Running (Treadmill)',
    category: ExerciseCategory.Cardio,
    met: 9.8,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Calves],
    secondaryMuscles: [MuscleGroup.Glutes],
    mechanicalActivation: 0.30,
  },
  {
    id: 'running-outdoor',
    name: 'Running (Outdoor)',
    category: ExerciseCategory.Cardio,
    met: 10.0,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Calves],
    secondaryMuscles: [MuscleGroup.Glutes],
    mechanicalActivation: 0.35,
  },
  {
    id: 'cycling-stationary',
    name: 'Cycling (Stationary)',
    category: ExerciseCategory.Cardio,
    met: 7.5,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Glutes],
    secondaryMuscles: [MuscleGroup.Hamstrings, MuscleGroup.Calves],
    mechanicalActivation: 0.40,
  },
  {
    id: 'cycling-outdoor',
    name: 'Cycling (Outdoor)',
    category: ExerciseCategory.Cardio,
    met: 8.0,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Glutes],
    secondaryMuscles: [MuscleGroup.Hamstrings, MuscleGroup.Calves],
    mechanicalActivation: 0.45,
  },
  {
    id: 'rowing-machine',
    name: 'Rowing Machine',
    category: ExerciseCategory.Cardio,
    met: 8.5,
    primaryMuscles: [MuscleGroup.Back, MuscleGroup.Lats],
    secondaryMuscles: [MuscleGroup.Biceps, MuscleGroup.Shoulders],
    mechanicalActivation: 0.55,
  },
  {
    id: 'elliptical',
    name: 'Elliptical',
    category: ExerciseCategory.Cardio,
    met: 5.5,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Glutes],
    secondaryMuscles: [MuscleGroup.Calves],
    mechanicalActivation: 0.35,
  },
  {
    id: 'swimming',
    name: 'Swimming',
    category: ExerciseCategory.Cardio,
    met: 9.0,
    primaryMuscles: [MuscleGroup.Back, MuscleGroup.Shoulders],
    secondaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings],
    mechanicalActivation: 0.50,
  },
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    category: ExerciseCategory.Cardio,
    met: 12.3,
    primaryMuscles: [MuscleGroup.Calves, MuscleGroup.Quadriceps],
    secondaryMuscles: [MuscleGroup.Abs],
    mechanicalActivation: 0.30,
  },
  {
    id: 'walking-brisk',
    name: 'Brisk Walking',
    category: ExerciseCategory.Cardio,
    met: 4.0,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Calves],
    secondaryMuscles: [MuscleGroup.Glutes],
    mechanicalActivation: 0.15,
  },
  {
    id: 'stair-climber',
    name: 'Stair Climber',
    category: ExerciseCategory.Cardio,
    met: 8.0,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Glutes, MuscleGroup.Calves],
    secondaryMuscles: [MuscleGroup.Hamstrings],
    mechanicalActivation: 0.50,
  },

  // ==========================================================================
  // HIIT EXERCISES
  // ==========================================================================

  {
    id: 'burpees',
    name: 'Burpees',
    category: ExerciseCategory.HIIT,
    met: 10.0,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Chest, MuscleGroup.Shoulders],
    secondaryMuscles: [MuscleGroup.Abs, MuscleGroup.Calves],
    mechanicalActivation: 0.70,
  },
  {
    id: 'sprinting',
    name: 'Sprinting Intervals',
    category: ExerciseCategory.HIIT,
    met: 13.0,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Glutes],
    secondaryMuscles: [MuscleGroup.Calves],
    mechanicalActivation: 0.80,
  },
  {
    id: 'kettlebell-swings',
    name: 'Kettlebell Swings',
    category: ExerciseCategory.HIIT,
    met: 9.8,
    primaryMuscles: [MuscleGroup.LowerBack, MuscleGroup.Glutes, MuscleGroup.Hamstrings],
    secondaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Shoulders],
    mechanicalActivation: 0.75,
  },
  {
    id: 'box-jumps',
    name: 'Box Jumps',
    category: ExerciseCategory.HIIT,
    met: 10.5,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Glutes, MuscleGroup.Calves],
    secondaryMuscles: [MuscleGroup.Abs],
    mechanicalActivation: 0.65,
  },
  {
    id: 'battle-ropes',
    name: 'Battle Ropes',
    category: ExerciseCategory.HIIT,
    met: 10.0,
    primaryMuscles: [MuscleGroup.Shoulders, MuscleGroup.Forearms, MuscleGroup.Abs],
    secondaryMuscles: [MuscleGroup.Back],
    mechanicalActivation: 0.55,
  },
  {
    id: 'tabata-sprint',
    name: 'Tabata Sprints',
    category: ExerciseCategory.HIIT,
    met: 14.0,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Glutes],
    secondaryMuscles: [MuscleGroup.Calves],
    mechanicalActivation: 0.85,
  },

  // ==========================================================================
  // FLEXIBILITY & MOBILITY
  // ==========================================================================

  {
    id: 'yoga-flow',
    name: 'Yoga Flow',
    category: ExerciseCategory.Flexibility,
    met: 3.0,
    primaryMuscles: [MuscleGroup.Abs],
    secondaryMuscles: [MuscleGroup.Back, MuscleGroup.Shoulders],
    mechanicalActivation: 0.15,
  },
  {
    id: 'stretching-static',
    name: 'Static Stretching',
    category: ExerciseCategory.Flexibility,
    met: 2.5,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings],
    secondaryMuscles: [MuscleGroup.Glutes, MuscleGroup.Calves],
    mechanicalActivation: 0.10,
  },
  {
    id: 'pilates',
    name: 'Pilates',
    category: ExerciseCategory.Flexibility,
    met: 3.5,
    primaryMuscles: [MuscleGroup.Abs, MuscleGroup.Obliques],
    secondaryMuscles: [MuscleGroup.Back, MuscleGroup.Glutes],
    mechanicalActivation: 0.30,
  },
  {
    id: 'foam-rolling',
    name: 'Foam Rolling',
    category: ExerciseCategory.Flexibility,
    met: 2.0,
    primaryMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Back],
    secondaryMuscles: [MuscleGroup.Glutes, MuscleGroup.Calves],
    mechanicalActivation: 0.05,
  },
];

// ============================================================================
// EXERCISE HELPERS
// ============================================================================

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISE_DATABASE.filter(e => e.category === category);
}

export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return EXERCISE_DATABASE.filter(e =>
    e.primaryMuscles.includes(muscle) || e.secondaryMuscles.includes(muscle)
  );
}

export function getCompoundMovements(): Exercise[] {
  return EXERCISE_DATABASE.filter(e =>
    e.primaryMuscles.length > 1 || e.category === ExerciseCategory.HIIT
  );
}

export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase();
  return EXERCISE_DATABASE.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    e.primaryMuscles.some(m => m.toLowerCase().includes(q))
  );
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_DATABASE.find(e => e.id === id);
}

// Exercise metadata for UI
export const CATEGORY_INFO = {
  [ExerciseCategory.Cardio]: {
    name: 'Cardio',
    icon: '🏃',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    description: 'Improves cardiovascular health and endurance',
  },
  [ExerciseCategory.Resistance]: {
    name: 'Resistance',
    icon: '🏋️',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Builds strength and muscle mass',
  },
  [ExerciseCategory.HIIT]: {
    name: 'HIIT',
    icon: '⚡',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    description: 'High-intensity intervals for maximum calorie burn',
  },
  [ExerciseCategory.Flexibility]: {
    name: 'Flexibility',
    icon: '🧘',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Improves mobility and recovery',
  },
} as const;

export const MUSCLE_INFO = {
  [MuscleGroup.Chest]: { name: 'Chest', icon: '🫁' },
  [MuscleGroup.Back]: { name: 'Back', icon: '🔙' },
  [MuscleGroup.Shoulders]: { name: 'Shoulders', icon: '🤷' },
  [MuscleGroup.Biceps]: { name: 'Biceps', icon: '💪' },
  [MuscleGroup.Triceps]: { name: 'Triceps', icon: '💪' },
  [MuscleGroup.Quadriceps]: { name: 'Quadriceps', icon: '🦵' },
  [MuscleGroup.Hamstrings]: { name: 'Hamstrings', icon: '🦵' },
  [MuscleGroup.Glutes]: { name: 'Glutes', icon: '🍑' },
  [MuscleGroup.Calves]: { name: 'Calves', icon: '👟' },
  [MuscleGroup.Abs]: { name: 'Core', icon: '🎯' },
  [MuscleGroup.Obliques]: { name: 'Obliques', icon: '🎯' },
  [MuscleGroup.Forearms]: { name: 'Forearms', icon: '🤚' },
  [MuscleGroup.Traps]: { name: 'Traps', icon: '🔺' },
  [MuscleGroup.Lats]: { name: 'Lats', icon: '🔙' },
  [MuscleGroup.LowerBack]: { name: 'Lower Back', icon: '⬆️' },
} as const;

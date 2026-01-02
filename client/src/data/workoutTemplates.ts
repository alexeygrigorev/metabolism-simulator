// ============================================================================
// METABOLIC SIMULATOR - WORKOUT TEMPLATES
// ============================================================================

import { ExerciseCategory } from '@metabol-sim/shared';

export interface WorkoutTemplateExercise {
  exerciseId: string;
  duration: number; // in minutes
  sets?: number;
  reps?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkoutTemplateCategory;
  exercises: WorkoutTemplateExercise[];
  totalDuration: number; // in minutes
  primaryMuscles: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  caloriesBurned: number; // estimated for 70kg person
  tags: string[];
  emoji: string;
}

export type WorkoutTemplateCategory =
  | 'full-body'
  | 'upper-body'
  | 'lower-body'
  | 'cardio'
  | 'hiit'
  | 'strength'
  | 'flexibility'
  | 'quick';

// Helper to calculate total duration
function calculateDuration(exercises: WorkoutTemplateExercise[]): number {
  return exercises.reduce((total, ex) => total + ex.duration, 0);
}

// Helper to estimate calories burned
function calculateCalories(exercises: WorkoutTemplateExercise[], intensity: number): number {
  // Rough estimate: MET * weight(kg) * duration(hours) = calories
  // For 70kg person, using average MET based on exercise types
  const avgMET = intensity;
  const totalHours = exercises.reduce((total, ex) => total + ex.duration / 60, 0);
  return Math.round(avgMET * 70 * totalHours);
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'full-body-beginner',
    name: 'Full Body Beginner',
    description: 'Complete full-body workout for beginners',
    category: 'full-body',
    exercises: [
      { exerciseId: 'lunges', duration: 5 },
      { exerciseId: 'dip', duration: 5 },
      { exerciseId: 'seated-row', duration: 5 },
      { exerciseId: 'plank', duration: 4 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 24,
    primaryMuscles: ['Full Body'],
    difficulty: 'Beginner',
    caloriesBurned: 180,
    tags: ['beginner', 'full-body', 'strength'],
    emoji: '💪',
  },
  {
    id: 'upper-body-strength',
    name: 'Upper Body Strength',
    description: 'Build upper body muscle and strength',
    category: 'upper-body',
    exercises: [
      { exerciseId: 'bench-press-barbell', duration: 8 },
      { exerciseId: 'barbell-row', duration: 8 },
      { exerciseId: 'overhead-press-barbell', duration: 6 },
      { exerciseId: 'pull-up', duration: 5 },
      { exerciseId: 'bicep-curl-dumbbell', duration: 5 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 37,
    primaryMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
    difficulty: 'Intermediate',
    caloriesBurned: 280,
    tags: ['strength', 'upper-body', 'muscle-growth'],
    emoji: '🏋️',
  },
  {
    id: 'lower-body-power',
    name: 'Lower Body Power',
    description: 'Build powerful legs and glutes',
    category: 'lower-body',
    exercises: [
      { exerciseId: 'squat-barbell', duration: 10 },
      { exerciseId: 'deadlift-barbell', duration: 10 },
      { exerciseId: 'lunges', duration: 6 },
      { exerciseId: 'calf-raise', duration: 5 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 36,
    primaryMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
    difficulty: 'Advanced',
    caloriesBurned: 350,
    tags: ['strength', 'lower-body', 'power'],
    emoji: '🦵',
  },
  {
    id: 'hiit-cardio-blast',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for fat loss',
    category: 'hiit',
    exercises: [
      { exerciseId: 'jump-rope', duration: 5 },
      { exerciseId: 'running-treadmill', duration: 5 },
      { exerciseId: 'burpees', duration: 4 },
      { exerciseId: 'jump-rope', duration: 5 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 24,
    primaryMuscles: ['Full Body', 'Cardio'],
    difficulty: 'Intermediate',
    caloriesBurned: 300,
    tags: ['hiit', 'cardio', 'fat-loss'],
    emoji: '🔥',
  },
  {
    id: 'quick-morning',
    name: 'Quick Morning Wake-Up',
    description: 'Energizing 15-minute routine to start your day',
    category: 'quick',
    exercises: [
      { exerciseId: 'jump-rope', duration: 3 },
      { exerciseId: 'dip', duration: 3 },
      { exerciseId: 'lunges', duration: 3 },
      { exerciseId: 'plank', duration: 3 },
      { exerciseId: 'walking-brisk', duration: 3 },
    ],
    totalDuration: 15,
    primaryMuscles: ['Full Body'],
    difficulty: 'Beginner',
    caloriesBurned: 120,
    tags: ['quick', 'morning', 'beginner'],
    emoji: '☀️',
  },
  {
    id: 'push-day',
    name: 'Push Day (Chest/Triceps)',
    description: 'Focus on pushing movements for upper body',
    category: 'upper-body',
    exercises: [
      { exerciseId: 'bench-press-barbell', duration: 10 },
      { exerciseId: 'incline-press', duration: 8 },
      { exerciseId: 'dip', duration: 6 },
      { exerciseId: 'shoulder-press-dumbbell', duration: 6 },
      { exerciseId: 'tricep-extension', duration: 5 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 40,
    primaryMuscles: ['Chest', 'Shoulders', 'Triceps'],
    difficulty: 'Intermediate',
    caloriesBurned: 320,
    tags: ['push-pull-legs', 'upper-body', 'strength'],
    emoji: '🚀',
  },
  {
    id: 'pull-day',
    name: 'Pull Day (Back/Biceps)',
    description: 'Focus on pulling movements for upper body',
    category: 'upper-body',
    exercises: [
      { exerciseId: 'deadlift-barbell', duration: 10 },
      { exerciseId: 'pull-up', duration: 8 },
      { exerciseId: 'barbell-row', duration: 8 },
      { exerciseId: 'face-pull', duration: 5 },
      { exerciseId: 'bicep-curl-dumbbell', duration: 6 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 42,
    primaryMuscles: ['Back', 'Biceps', 'Rear Delts'],
    difficulty: 'Intermediate',
    caloriesBurned: 340,
    tags: ['push-pull-legs', 'upper-body', 'strength'],
    emoji: '⛓️',
  },
  {
    id: 'core-crusher',
    name: 'Core Crusher',
    description: 'Intense abdominal and core workout',
    category: 'strength',
    exercises: [
      { exerciseId: 'plank', duration: 6 },
      { exerciseId: 'hanging-raise', duration: 6 },
      { exerciseId: 'plank', duration: 6 },
      { exerciseId: 'plank', duration: 6 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 29,
    primaryMuscles: ['Abs', 'Core'],
    difficulty: 'Intermediate',
    caloriesBurned: 180,
    tags: ['core', 'abs', 'strength'],
    emoji: '🎯',
  },
  {
    id: 'cardio-endurance',
    name: 'Steady Cardio Run',
    description: 'Build endurance with steady-state cardio',
    category: 'cardio',
    exercises: [
      { exerciseId: 'jogging-light', duration: 30 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 35,
    primaryMuscles: ['Cardio', 'Legs'],
    difficulty: 'Beginner',
    caloriesBurned: 350,
    tags: ['cardio', 'endurance', 'beginner'],
    emoji: '🏃',
  },
  {
    id: 'flexibility-flow',
    name: 'Flexibility Flow',
    description: 'Improve mobility and flexibility',
    category: 'flexibility',
    exercises: [
      { exerciseId: 'walking-brisk', duration: 10 },
      { exerciseId: 'walking-brisk', duration: 5 },
      { exerciseId: 'plank', duration: 3 },
      { exerciseId: 'plank', duration: 3 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 26,
    primaryMuscles: ['Full Body', 'Flexibility'],
    difficulty: 'Beginner',
    caloriesBurned: 100,
    tags: ['flexibility', 'recovery', 'beginner'],
    emoji: '🧘',
  },
  {
    id: 'legs-day',
    name: 'Legs Hypertrophy',
    description: 'Muscle-building leg workout',
    category: 'lower-body',
    exercises: [
      { exerciseId: 'squat-barbell', duration: 10 },
      { exerciseId: 'leg-extension', duration: 8 },
      { exerciseId: 'leg-curl', duration: 6 },
      { exerciseId: 'leg-extension', duration: 6 },
      { exerciseId: 'calf-raise', duration: 5 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 40,
    primaryMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
    difficulty: 'Advanced',
    caloriesBurned: 380,
    tags: ['legs', 'hypertrophy', 'strength'],
    emoji: '🦵',
  },
  {
    id: 'bodyweight-only',
    name: 'Bodyweight Blitz',
    description: 'No equipment needed full-body workout',
    category: 'full-body',
    exercises: [
      { exerciseId: 'dip', duration: 5 },
      { exerciseId: 'lunges', duration: 5 },
      { exerciseId: 'pull-up', duration: 5 },
      { exerciseId: 'plank', duration: 4 },
      { exerciseId: 'jump-rope', duration: 3 },
      { exerciseId: 'walking-brisk', duration: 5 },
    ],
    totalDuration: 27,
    primaryMuscles: ['Full Body'],
    difficulty: 'Intermediate',
    caloriesBurned: 250,
    tags: ['bodyweight', 'no-equipment', 'full-body'],
    emoji: '🤸',
  },
];

// Category info for display
export const WORKOUT_TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Workouts', icon: '🏋️' },
  { id: 'full-body', name: 'Full Body', icon: '💪' },
  { id: 'upper-body', name: 'Upper Body', icon: '🦍' },
  { id: 'lower-body', name: 'Lower Body', icon: '🦵' },
  { id: 'cardio', name: 'Cardio', icon: '🏃' },
  { id: 'hiit', name: 'HIIT', icon: '⚡' },
  { id: 'strength', name: 'Strength', icon: '🏋️' },
  { id: 'flexibility', name: 'Flexibility', icon: '🧘' },
  { id: 'quick', name: 'Quick (<20min)', icon: '⏱️' },
];

// Filter functions
export function getWorkoutTemplatesByCategory(category: WorkoutTemplateCategory | 'all'): WorkoutTemplate[] {
  if (category === 'all') return WORKOUT_TEMPLATES;
  return WORKOUT_TEMPLATES.filter(template => template.category === category);
}

export function searchWorkoutTemplates(query: string): WorkoutTemplate[] {
  const q = query.toLowerCase();
  return WORKOUT_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(q) ||
    template.description.toLowerCase().includes(q) ||
    template.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function getWorkoutTemplateById(id: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find(template => template.id === id);
}

export function getWorkoutsByDifficulty(difficulty: 'Beginner' | 'Intermediate' | 'Advanced'): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter(template => template.difficulty === difficulty);
}

export function getQuickWorkouts(): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter(template => template.totalDuration <= 20);
}

export function getHighIntensityWorkouts(): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter(template =>
    template.category === 'hiit' || template.tags.includes('fat-loss')
  );
}

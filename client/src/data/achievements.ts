// ============================================================================
// METABOLIC SIMULATOR - ACHIEVEMENTS DATA
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'metabolism' | 'hormones' | 'muscle' | 'lifestyle' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (state: AchievementState) => boolean;
  hint?: string;
}

export interface AchievementState {
  mealsLogged: number;
  exercisesLogged: number;
  sleepSessions: number;
  peakInsulin: number;
  peakCortisol: number;
  peakTestosterone: number;
  muscleMassGained: number;
  daysActive: number;
  scenariosCompleted: number;
  perfectDay: boolean;
  fastingStreak: number;
  proteinStreak: number;
}

const RARITY_COLORS = {
  common: 'from-slate-500 to-slate-400',
  rare: 'from-blue-500 to-cyan-400',
  epic: 'from-purple-500 to-pink-400',
  legendary: 'from-amber-500 to-orange-400',
};

const RARITY_BORDER = {
  common: 'border-slate-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-amber-500',
};

export const ACHIEVEMENTS: Achievement[] = [
  // Metabolism Category
  {
    id: 'first-meal',
    name: 'Breakfast Club',
    description: 'Log your first meal',
    icon: '🍳',
    category: 'metabolism',
    rarity: 'common',
    condition: (s) => s.mealsLogged >= 1,
    hint: 'Log a meal to unlock this achievement',
  },
  {
    id: 'meal-master',
    name: 'Meal Master',
    description: 'Log 25 meals',
    icon: '🍽️',
    category: 'metabolism',
    rarity: 'rare',
    condition: (s) => s.mealsLogged >= 25,
  },
  {
    id: 'insulin-spike',
    name: 'Sugar Rush',
    description: 'Reach insulin level of 30 µU/mL',
    icon: '📈',
    category: 'metabolism',
    rarity: 'common',
    condition: (s) => s.peakInsulin >= 30,
    hint: 'Eat a high-glycemic meal to spike your insulin',
  },
  {
    id: 'insulin-master',
    name: 'Insulin Whisperer',
    description: 'Keep insulin under 10 µU/mL for a full day',
    icon: '🤫',
    category: 'metabolism',
    rarity: 'rare',
    condition: (s) => s.perfectDay,
  },

  // Hormones Category
  {
    id: 'cortisol-spike',
    name: 'Stress Test',
    description: 'Reach cortisol level of 25 mcg/dL',
    icon: '😰',
    category: 'hormones',
    rarity: 'common',
    condition: (s) => s.peakCortisol >= 25,
    hint: 'Set stress to high to see cortisol effects',
  },
  {
    id: 'testosterone-peak',
    name: 'Anabolic Activated',
    description: 'Reach testosterone level of 30 nmol/L',
    icon: '💪',
    category: 'hormones',
    rarity: 'rare',
    condition: (s) => s.peakTestosterone >= 30,
    hint: 'Log resistance exercise and get good sleep',
  },
  {
    id: 'hormone-harmony',
    name: 'Hormonal Harmony',
    description: 'Have all hormones at optimal levels simultaneously',
    icon: '⚖️',
    category: 'hormones',
    rarity: 'epic',
    condition: (s) => s.peakInsulin > 20 && s.peakTestosterone >= 25 && s.peakCortisol < 20,
  },

  // Muscle Category
  {
    id: 'first-workout',
    name: 'Gym Rat',
    description: 'Log your first exercise',
    icon: '🏋️',
    category: 'muscle',
    rarity: 'common',
    condition: (s) => s.exercisesLogged >= 1,
    hint: 'Log an exercise to unlock this achievement',
  },
  {
    id: 'workout-warrior',
    name: 'Workout Warrior',
    description: 'Log 15 exercises',
    icon: '⚔️',
    category: 'muscle',
    rarity: 'rare',
    condition: (s) => s.exercisesLogged >= 15,
  },
  {
    id: 'muscle-gain',
    name: 'Hypertrophy Hero',
    description: 'Gain 1 kg of muscle mass',
    icon: '🦵',
    category: 'muscle',
    rarity: 'epic',
    condition: (s) => s.muscleMassGained >= 1,
  },

  // Lifestyle Category
  {
    id: 'first-sleep',
    name: 'Well Rested',
    description: 'Log your first sleep session',
    icon: '😴',
    category: 'lifestyle',
    rarity: 'common',
    condition: (s) => s.sleepSessions >= 1,
    hint: 'Log sleep to unlock this achievement',
  },
  {
    id: 'sleep-master',
    name: 'Dream Master',
    description: 'Log 10 sleep sessions',
    icon: '🌙',
    category: 'lifestyle',
    rarity: 'rare',
    condition: (s) => s.sleepSessions >= 10,
  },
  {
    id: 'fasting-starter',
    name: 'Intermittent Faster',
    description: 'Maintain fasting state for 3 simulated hours',
    icon: '⏳',
    category: 'lifestyle',
    rarity: 'common',
    condition: (s) => s.fastingStreak >= 3,
  },
  {
    id: 'protein-seeker',
    name: 'Protein Pioneer',
    description: 'Hit protein target 5 times',
    icon: '🥩',
    category: 'lifestyle',
    rarity: 'rare',
    condition: (s) => s.proteinStreak >= 5,
  },

  // Milestone Category
  {
    id: 'first-scenario',
    name: 'Student',
    description: 'Complete your first scenario',
    icon: '📚',
    category: 'milestone',
    rarity: 'common',
    condition: (s) => s.scenariosCompleted >= 1,
    hint: 'Complete an educational scenario',
  },
  {
    id: 'scenario-master',
    name: 'Scholar',
    description: 'Complete all beginner scenarios',
    icon: '🎓',
    category: 'milestone',
    rarity: 'rare',
    condition: (s) => s.scenariosCompleted >= 3,
  },
  {
    id: 'seven-days',
    name: 'Week Warrior',
    description: 'Use the simulator for 7 different days',
    icon: '📅',
    category: 'milestone',
    rarity: 'rare',
    condition: (s) => s.daysActive >= 7,
  },
  {
    id: 'metabolism-master',
    name: 'Metabolism Master',
    description: 'Unlock all rare achievements',
    icon: '👑',
    category: 'milestone',
    rarity: 'legendary',
    condition: (s) => {
      // This would be checked against unlocked achievements
      return false; // Handled in the store
    },
  },
];

export { RARITY_COLORS, RARITY_BORDER };

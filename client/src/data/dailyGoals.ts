// ============================================================================
// METABOLIC SIMULATOR - DAILY GOALS DATA
// ============================================================================

export interface DailyGoal {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'nutrition' | 'exercise' | 'recovery' | 'hormones' | 'lifestyle';
  target: number;
  unit: string;
  getCurrentValue: (state: any) => number;
  advice: string;
  educationalInfo: string;
}

export const DAILY_GOALS: DailyGoal[] = [
  // Nutrition Goals
  {
    id: 'protein-target',
    name: 'Protein Target',
    description: 'Hit your daily protein goal for muscle maintenance',
    icon: '🥩',
    category: 'nutrition',
    target: 100,
    unit: 'g',
    getCurrentValue: (state) => state?.energy?.proteins?.consumed || 0,
    advice: 'Aim for 1.6-2.2g per kg bodyweight',
    educationalInfo: 'Protein provides amino acids essential for muscle protein synthesis (MPS). Leucine threshold (~2-3g per meal) triggers mTOR pathway for muscle building.',
  },
  {
    id: 'calorie-balance',
    name: 'Calorie Awareness',
    description: 'Stay within 500 calories of maintenance',
    icon: '⚖️',
    category: 'nutrition',
    target: 0,
    unit: 'kcal',
    getCurrentValue: (state) => state?.energy?.netCalories || 0,
    advice: 'Track your energy balance',
    educationalInfo: 'Caloric surplus leads to weight gain, deficit leads to weight loss. For muscle gain, aim for +200-500 kcal. For fat loss, aim for -500 kcal.',
  },
  {
    id: 'glycogen-stores',
    name: 'Glycogen Repletion',
    description: 'Keep muscle and liver glycogen topped up',
    icon: '🔋',
    category: 'nutrition',
    target: 90,
    unit: '%',
    getCurrentValue: (state) => {
      if (!state?.energy?.glycogen) return 0;
      const muscle = state.energy.glycogen.muscle || 0;
      const liver = state.energy.glycogen.liver || 0;
      return Math.round((muscle + liver) / 2 * 100);
    },
    advice: 'Carb intake post-workout helps glycogen resynthesis',
    educationalInfo: 'Glycogen is stored glucose in muscles and liver. Low glycogen leads to fatigue and increased cortisol. Exercise depletes glycogen; carbs restore it.',
  },

  // Exercise Goals
  {
    id: 'resistance-training',
    name: 'Resistance Training',
    description: 'Complete at least one resistance workout',
    icon: '🏋️',
    category: 'exercise',
    target: 1,
    unit: 'workout',
    getCurrentValue: (state) => {
      const today = new Date().toDateString();
      return state?.recentExercises?.filter((e: any) =>
        e.category === 'resistance' && new Date(e.timestamp || Date.now()).toDateString() === today
      ).length || 0;
    },
    advice: '3-5 sessions per week optimal for muscle growth',
    educationalInfo: 'Resistance training stimulates mTOR signaling, increases testosterone acutely, and improves insulin sensitivity for 24-48 hours post-workout.',
  },
  {
    id: 'activity-level',
    name: 'Daily Movement',
    description: 'Log some form of physical activity',
    icon: '🚶',
    category: 'exercise',
    target: 1,
    unit: 'activity',
    getCurrentValue: (state) => {
      const today = new Date().toDateString();
      const exerciseCount = state?.recentExercises?.filter((e: any) =>
        new Date(e.timestamp || Date.now()).toDateString() === today
      ).length || 0;
      return Math.min(1, exerciseCount);
    },
    advice: 'Aim for at least 30 minutes of movement daily',
    educationalInfo: 'Regular physical activity improves mitochondrial function, insulin sensitivity, and metabolic flexibility.',
  },

  // Recovery Goals
  {
    id: 'sleep-duration',
    name: 'Sleep Duration',
    description: 'Get 7-9 hours of quality sleep',
    icon: '😴',
    category: 'recovery',
    target: 8,
    unit: 'hours',
    getCurrentValue: (state) => {
      const today = new Date().toDateString();
      const todaySleep = state?.recentSleep?.find((s: any) =>
        new Date(s.endTime || Date.now()).toDateString() === today
      );
      return todaySleep?.duration || 0;
    },
    advice: '7-9 hours is optimal for hormone balance',
    educationalInfo: 'Deep sleep releases growth hormone (GH). Sleep deprivation increases cortisol, reduces testosterone, and impairs glucose metabolism.',
  },
  {
    id: 'sleep-quality',
    name: 'Sleep Quality',
    description: 'Maintain good sleep quality (80%+)',
    icon: '🌙',
    category: 'recovery',
    target: 80,
    unit: '%',
    getCurrentValue: (state) => {
      const today = new Date().toDateString();
      const todaySleep = state?.recentSleep?.find((s: any) =>
        new Date(s.endTime || Date.now()).toDateString() === today
      );
      return todaySleep ? Math.round(todaySleep.quality * 100) : 0;
    },
    advice: 'Cool room, dark environment, consistent schedule',
    educationalInfo: 'Sleep quality impacts GH release, cortisol regulation, and muscle recovery. REM sleep consolidates memory; deep sleep repairs tissue.',
  },
  {
    id: 'stress-management',
    name: 'Keep Stress Low',
    description: 'Maintain low to moderate stress levels',
    icon: '🧘',
    category: 'recovery',
    target: 50,
    unit: '% controlled',
    getCurrentValue: (state) => {
      const cortisol = state?.hormones?.cortisol?.currentValue || 10;
      const baseline = state?.hormones?.cortisol?.baseline || 10;
      // If cortisol is at baseline, stress is well controlled (100%)
      // If cortisol is 3x baseline, stress is poorly controlled (0%)
      const ratio = cortisol / baseline;
      return Math.max(0, Math.min(100, 100 - (ratio - 1) * 50));
    },
    advice: 'Meditation, nature walks, deep breathing help',
    educationalInfo: 'Chronic stress elevates cortisol, which breaks down muscle, suppresses testosterone, and impairs immune function.',
  },

  // Hormone Goals
  {
    id: 'insulin-sensitivity',
    name: 'Insulin Sensitivity',
    description: 'Keep insulin levels healthy (under 15 µU/mL fasting)',
    icon: '📉',
    category: 'hormones',
    target: 15,
    unit: 'µU/mL',
    getCurrentValue: (state) => {
      const insulin = state?.hormones?.insulin?.currentValue || 5;
      // Lower is better for fasting insulin - return 15 if at baseline 5
      // This is inverse - we want to SHOW the current value, not progress
      return Math.round(insulin);
    },
    advice: 'Exercise, low sugar intake improve sensitivity',
    educationalInfo: 'High fasting insulin indicates insulin resistance. Muscle is the primary site of glucose disposal. Resistance training improves insulin sensitivity.',
  },
  {
    id: 'testosterone-boost',
    name: 'Testosterone Support',
    description: 'Engage in behaviors that support healthy testosterone',
    icon: '💪',
    category: 'hormones',
    target: 1,
    unit: 'behaviors',
    getCurrentValue: (state) => {
      let score = 0;
      const today = new Date().toDateString();

      // Resistance training today?
      const resistanceWorkout = state?.recentExercises?.some((e: any) =>
        e.category === 'resistance' && new Date(e.timestamp || Date.now()).toDateString() === today
      );
      if (resistanceWorkout) score += 0.3;

      // Good sleep last night?
      const yesterdaySleep = state?.recentSleep?.find((s: any) => {
        const sleepDate = new Date(s.endTime || Date.now());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return sleepDate.toDateString() === yesterday.toDateString();
      });
      if (yesterdaySleep && yesterdaySleep.duration >= 7 && yesterdaySleep.quality >= 0.7) {
        score += 0.4;
      }

      // Stress not high?
      const cortisol = state?.hormones?.cortisol?.currentValue || 10;
      const baseline = state?.hormones?.cortisol?.baseline || 10;
      if (cortisol < baseline * 1.5) score += 0.3;

      return score;
    },
    advice: 'Lift heavy, sleep 8h, manage stress',
    educationalInfo: 'Testosterone peaks in morning after REM sleep. Resistance training acutely boosts T. Chronic stress and poor sleep suppress T production.',
  },

  // Lifestyle Goals
  {
    id: 'hydration',
    name: 'Stay Hydrated',
    description: 'Drink adequate water throughout the day',
    icon: '💧',
    category: 'lifestyle',
    target: 8,
    unit: 'glasses',
    getCurrentValue: () => {
      // This would be tracked separately - for now return a placeholder
      return 0;
    },
    advice: '8 glasses (2L) daily baseline, more when active',
    educationalInfo: 'Dehydration increases cortisol, impairs cognitive function, and reduces exercise performance. Even 2% dehydration affects performance.',
  },
  {
    id: 'consistency',
    name: 'Weekly Consistency',
    description: 'Use the simulator regularly to track progress',
    icon: '📅',
    category: 'lifestyle',
    target: 7,
    unit: 'days',
    getCurrentValue: () => {
      // This tracks days active - would be in achievements store
      return 1; // Placeholder
    },
    advice: 'Consistency is key for metabolic health',
    educationalInfo: 'Metabolic adaptations occur over weeks and months. Consistent habits lead to lasting changes in hormone profiles and body composition.',
  },
];

export function getGoalProgress(goal: DailyGoal, state: any): { current: number; percent: number; complete: boolean } {
  const current = goal.getCurrentValue(state);
  let percent = 0;

  if (goal.id === 'insulin-sensitivity') {
    // For insulin, lower is better - percent is based on being under target
    percent = current <= goal.target ? 100 : Math.round(100 - ((current - goal.target) / goal.target) * 50);
  } else if (goal.id === 'stress-management') {
    percent = current; // Already a percentage
  } else if (goal.id === 'testosterone-boost' || goal.id === 'glycogen-stores' || goal.id === 'sleep-quality') {
    percent = Math.min(100, Math.round((current / goal.target) * 100));
  } else {
    percent = Math.min(100, Math.round((current / goal.target) * 100));
  }

  return {
    current,
    percent: Math.max(0, Math.min(100, percent)),
    complete: percent >= 100,
  };
}

export const GOAL_CATEGORIES = [
  { id: 'all', name: 'All Goals', icon: '🎯' },
  { id: 'nutrition', name: 'Nutrition', icon: '🍽️' },
  { id: 'exercise', name: 'Exercise', icon: '🏃' },
  { id: 'recovery', name: 'Recovery', icon: '😴' },
  { id: 'hormones', name: 'Hormones', icon: '🧪' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
];

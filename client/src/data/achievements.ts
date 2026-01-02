// ============================================================================
// METABOLIC SIMULATOR - ACHIEVEMENTS DATA
// ============================================================================

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 'metabolism' | 'hormones' | 'muscle' | 'lifestyle' | 'milestone' | 'supplements';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  tier?: AchievementTier;
  tierLevel?: number;
  parentAchievement?: string; // For tiered achievements
  xpReward: number;
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
  supplementsLogged: number;
  supplementsStreak: number; // Consecutive days with supplements
  waterGlasses: number;
  waterGoalDays: number; // Days where water goal was met
}

const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: 'from-slate-500 to-slate-400',
  rare: 'from-blue-500 to-cyan-400',
  epic: 'from-purple-500 to-pink-400',
  legendary: 'from-amber-500 to-orange-400',
};

const RARITY_BORDER: Record<AchievementRarity, string> = {
  common: 'border-slate-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-amber-500',
};

const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: 'from-amber-700 to-amber-600',
  silver: 'from-slate-300 to-slate-200',
  gold: 'from-yellow-500 to-amber-400',
  diamond: 'from-cyan-400 to-blue-300',
};

const TIER_BORDER: Record<AchievementTier, string> = {
  bronze: 'border-amber-700',
  silver: 'border-slate-300',
  gold: 'border-yellow-500',
  diamond: 'border-cyan-400',
};

// XP rewards based on rarity and tier
const XP_BY_RARITY: Record<AchievementRarity, number> = {
  common: 10,
  rare: 50,
  epic: 150,
  legendary: 500,
};

const XP_MULTIPLIER_BY_TIER: Record<AchievementTier, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  diamond: 5,
};

// Helper to create tiered achievements
function createTieredAchievement(
  baseId: string,
  baseName: string,
  baseIcon: string,
  category: AchievementCategory,
  rarity: AchievementRarity,
  tier: AchievementTier,
  tierLevel: number,
  target: number,
  unit: string,
  condition: (s: AchievementState, target: number) => boolean,
  hint?: string
): Achievement {
  const tierNames: Record<AchievementTier, string> = {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    diamond: 'Diamond',
  };

  const xp = XP_BY_RARITY[rarity] * XP_MULTIPLIER_BY_TIER[tier];

  return {
    id: `${baseId}-${tier}`,
    name: `${tierNames[tier]} ${baseName}`,
    description: `${baseName} (${target} ${unit})`,
    icon: baseIcon,
    category,
    rarity,
    tier,
    tierLevel,
    parentAchievement: baseId,
    xpReward: xp,
    condition: (s) => condition(s, target),
    hint,
  };
}

// Meal logging tiers
const mealTiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'diamond'];
const mealTargets = [10, 50, 150, 500];

// Exercise logging tiers
const exerciseTiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'diamond'];
const exerciseTargets = [5, 25, 100, 300];

// Sleep logging tiers
const sleepTiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'diamond'];
const sleepTargets = [5, 20, 75, 200];

// Days active tiers
const daysTiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'diamond'];
const daysTargets = [7, 30, 100, 365];

export const ACHIEVEMENTS: Achievement[] = [
  // ===== METABOLISM CATEGORY =====
  {
    id: 'first-meal',
    name: 'Breakfast Club',
    description: 'Log your first meal',
    icon: '🍳',
    category: 'metabolism',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
    condition: (s) => s.mealsLogged >= 1,
    hint: 'Log a meal to unlock this achievement',
  },
  {
    id: 'insulin-spike',
    name: 'Sugar Rush',
    description: 'Reach insulin level of 30 µU/mL',
    icon: '📈',
    category: 'metabolism',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
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
    xpReward: XP_BY_RARITY.rare,
    condition: (s) => s.perfectDay,
  },
  // Tiered Meal Achievements
  ...mealTiers.map((tier, i) =>
    createTieredAchievement(
      'meal-tracker',
      'Meal Tracker',
      '🍽️',
      'metabolism',
      i === 3 ? 'epic' : 'rare',
      tier,
      i + 1,
      mealTargets[i],
      'meals',
      (s, target) => s.mealsLogged >= target,
      'Log meals consistently'
    )
  ),

  // ===== HORMONES CATEGORY =====
  {
    id: 'cortisol-spike',
    name: 'Stress Test',
    description: 'Reach cortisol level of 25 mcg/dL',
    icon: '😰',
    category: 'hormones',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
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
    xpReward: XP_BY_RARITY.rare,
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
    xpReward: XP_BY_RARITY.epic,
    condition: (s) => s.peakInsulin > 20 && s.peakTestosterone >= 25 && s.peakCortisol < 20,
  },

  // ===== MUSCLE CATEGORY =====
  {
    id: 'first-workout',
    name: 'Gym Rat',
    description: 'Log your first exercise',
    icon: '🏋️',
    category: 'muscle',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
    condition: (s) => s.exercisesLogged >= 1,
    hint: 'Log an exercise to unlock this achievement',
  },
  {
    id: 'muscle-gain',
    name: 'Hypertrophy Hero',
    description: 'Gain 1 kg of muscle mass',
    icon: '🦵',
    category: 'muscle',
    rarity: 'epic',
    xpReward: XP_BY_RARITY.epic,
    condition: (s) => s.muscleMassGained >= 1,
  },
  {
    id: 'muscle-master',
    name: 'Muscle Master',
    description: 'Gain 2 kg of muscle mass',
    icon: '🏆',
    category: 'muscle',
    rarity: 'epic',
    tier: 'gold',
    tierLevel: 2,
    xpReward: XP_BY_RARITY.epic * 2,
    condition: (s) => s.muscleMassGained >= 2,
  },
  // Tiered Exercise Achievements
  ...exerciseTiers.map((tier, i) =>
    createTieredAchievement(
      'exercise-tracker',
      'Exercise Tracker',
      '⚔️',
      'muscle',
      i === 3 ? 'epic' : 'rare',
      tier,
      i + 1,
      exerciseTargets[i],
      'workouts',
      (s, target) => s.exercisesLogged >= target,
      'Log exercises consistently'
    )
  ),

  // ===== LIFESTYLE CATEGORY =====
  {
    id: 'first-sleep',
    name: 'Well Rested',
    description: 'Log your first sleep session',
    icon: '😴',
    category: 'lifestyle',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
    condition: (s) => s.sleepSessions >= 1,
    hint: 'Log sleep to unlock this achievement',
  },
  {
    id: 'fasting-starter',
    name: 'Intermittent Faster',
    description: 'Maintain fasting state for 3 simulated hours',
    icon: '⏳',
    category: 'lifestyle',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
    condition: (s) => s.fastingStreak >= 3,
  },
  {
    id: 'protein-seeker',
    name: 'Protein Pioneer',
    description: 'Hit protein target 5 times',
    icon: '🥩',
    category: 'lifestyle',
    rarity: 'rare',
    xpReward: XP_BY_RARITY.rare,
    condition: (s) => s.proteinStreak >= 5,
  },
  {
    id: 'protein-master',
    name: 'Protein Master',
    description: 'Hit protein target 25 times',
    icon: '🥩',
    category: 'lifestyle',
    rarity: 'epic',
    tier: 'gold',
    tierLevel: 2,
    xpReward: XP_BY_RARITY.epic,
    condition: (s) => s.proteinStreak >= 25,
  },
  // Tiered Sleep Achievements
  ...sleepTiers.map((tier, i) =>
    createTieredAchievement(
      'sleep-tracker',
      'Sleep Tracker',
      '🌙',
      'lifestyle',
      i === 3 ? 'epic' : 'rare',
      tier,
      i + 1,
      sleepTargets[i],
      'sessions',
      (s, target) => s.sleepSessions >= target,
      'Log sleep consistently'
    )
  ),

  // ===== MILESTONE CATEGORY =====
  {
    id: 'first-scenario',
    name: 'Student',
    description: 'Complete your first scenario',
    icon: '📚',
    category: 'milestone',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
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
    xpReward: XP_BY_RARITY.rare,
    condition: (s) => s.scenariosCompleted >= 3,
  },
  // Tiered Days Active Achievements
  ...daysTiers.map((tier, i) =>
    createTieredAchievement(
      'days-active',
      'Dedicated User',
      '📅',
      'milestone',
      i === 3 ? 'epic' : 'rare',
      tier,
      i + 1,
      daysTargets[i],
      'days',
      (s, target) => s.daysActive >= target,
      'Use the simulator consistently'
    )
  ),

  // ===== SUPPLEMENTS CATEGORY =====
  {
    id: 'first-supplement',
    name: 'Supplement Starter',
    description: 'Log your first supplement',
    icon: '💊',
    category: 'supplements',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
    condition: (s) => s.supplementsLogged >= 1,
    hint: 'Log a supplement to unlock this achievement',
  },
  // Supplement tiers
  ...((): Achievement[] => {
    const tiers: AchievementTier[] = ['bronze', 'silver', 'gold'];
    const targets = [10, 50, 150];
    return tiers.map((tier, i) =>
      createTieredAchievement(
        'supplement-tracker',
        'Supplement Tracker',
        '🧪',
        'supplements',
        i === 2 ? 'epic' : 'rare',
        tier,
        i + 1,
        targets[i],
        'logged',
        (s, target) => s.supplementsLogged >= target,
        'Log supplements consistently'
      )
    );
  })(),
  {
    id: 'supplement-streak-7',
    name: 'Consistent Consumer',
    description: 'Take supplements for 7 consecutive days',
    icon: '📆',
    category: 'supplements',
    rarity: 'rare',
    xpReward: XP_BY_RARITY.rare,
    condition: (s) => s.supplementsStreak >= 7,
  },
  {
    id: 'supplement-streak-30',
    name: 'Supplement Devotee',
    description: 'Take supplements for 30 consecutive days',
    icon: '🏅',
    category: 'supplements',
    rarity: 'epic',
    tier: 'gold',
    tierLevel: 2,
    xpReward: XP_BY_RARITY.epic,
    condition: (s) => s.supplementsStreak >= 30,
  },

  // ===== WATER INTAKE ACHIEVEMENTS =====
  {
    id: 'first-glass',
    name: 'Hydration Hero',
    description: 'Log your first glass of water',
    icon: '💧',
    category: 'lifestyle',
    rarity: 'common',
    xpReward: XP_BY_RARITY.common,
    condition: (s) => s.waterGlasses >= 1,
    hint: 'Log water intake to unlock this achievement',
  },
  // Water glasses tiers
  ...((): Achievement[] => {
    const tiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'diamond'];
    const targets = [50, 200, 500, 1000];
    return tiers.map((tier, i) =>
      createTieredAchievement(
        'water-tracker',
        'Water Tracker',
        '🌊',
        'lifestyle',
        i === 3 ? 'epic' : 'rare',
        tier,
        i + 1,
        targets[i],
        'glasses',
        (s, target) => s.waterGlasses >= target,
        'Log water intake consistently'
      )
    );
  })(),
  {
    id: 'water-goal-7',
    name: 'Wellness Week',
    description: 'Hit your daily water goal for 7 days',
    icon: '💎',
    category: 'lifestyle',
    rarity: 'rare',
    xpReward: XP_BY_RARITY.rare,
    condition: (s) => s.waterGoalDays >= 7,
  },
  {
    id: 'water-goal-30',
    name: 'Hydration Master',
    description: 'Hit your daily water goal for 30 days',
    icon: '🏆',
    category: 'lifestyle',
    rarity: 'epic',
    tier: 'gold',
    tierLevel: 2,
    xpReward: XP_BY_RARITY.epic,
    condition: (s) => s.waterGoalDays >= 30,
  },

  {
    id: 'metabolism-master',
    name: 'Metabolism Master',
    description: 'Unlock all rare achievements',
    icon: '👑',
    category: 'milestone',
    rarity: 'legendary',
    xpReward: XP_BY_RARITY.legendary,
    condition: (s) => {
      // This would be checked against unlocked achievements
      return false; // Handled in the store
    },
  },
];

export { RARITY_COLORS, RARITY_BORDER, TIER_COLORS, TIER_BORDER };

// Helper functions for achievement display
export function getAchievementXP(achievement: Achievement): number {
  return achievement.xpReward;
}

export function getTotalXPAchieved(): number {
  try {
    const saved = localStorage.getItem('metabol-sim-achievements');
    if (saved) {
      const unlocked: Array<{ id: string }> = JSON.parse(saved);
      return unlocked.reduce((total, { id }) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        return total + (achievement?.xpReward || 0);
      }, 0);
    }
  } catch {
    // Return 0 on error
  }
  return 0;
}

export function getTieredAchievements(parentId: string): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.parentAchievement === parentId);
}

export function getNextTierAchievement(currentAchievementId: string): Achievement | null {
  const current = ACHIEVEMENTS.find(a => a.id === currentAchievementId);
  if (!current?.parentAchievement || current.tierLevel === undefined) return null;

  return ACHIEVEMENTS.find(a =>
    a.parentAchievement === current.parentAchievement &&
    a.tierLevel === current.tierLevel + 1
  ) || null;
}

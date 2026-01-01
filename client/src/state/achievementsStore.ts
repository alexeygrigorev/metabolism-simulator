// ============================================================================
// METABOLIC SIMULATOR - ACHIEVEMENTS STATE MANAGEMENT
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACHIEVEMENTS, Achievement, AchievementState } from '../data/achievements';

const ACHIEVEMENTS_KEY = 'metabol-sim-achievements';
const STATS_KEY = 'metabol-sim-achievement-stats';

interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

interface AchievementStats {
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
  lastActiveDate: string;
  initialMuscleMass: number;
}

interface AchievementsStore {
  unlockedAchievements: UnlockedAchievement[];
  stats: AchievementStats;
  showNotification: Achievement | null;

  // Actions
  initTracking: (initialMuscleMass: number) => void;
  trackMeal: () => void;
  trackExercise: () => void;
  trackSleep: () => void;
  trackScenarioCompletion: () => void;
  trackHormonePeak: (hormone: string, value: number) => void;
  trackMuscleGain: (currentMass: number) => void;
  trackPerfectDay: () => void;
  trackFastingStreak: (hours: number) => void;
  trackProteinStreak: () => void;
  checkAchievements: () => Achievement[];
  dismissNotification: () => void;
  reset: () => void;
}

const DEFAULT_STATS: AchievementStats = {
  mealsLogged: 0,
  exercisesLogged: 0,
  sleepSessions: 0,
  peakInsulin: 0,
  peakCortisol: 0,
  peakTestosterone: 0,
  muscleMassGained: 0,
  daysActive: 0,
  scenariosCompleted: 0,
  perfectDay: false,
  fastingStreak: 0,
  proteinStreak: 0,
  lastActiveDate: '',
  initialMuscleMass: 0,
};

function loadAchievements(): UnlockedAchievement[] {
  try {
    const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load achievements:', error);
  }
  return [];
}

function saveAchievements(unlocked: UnlockedAchievement[]) {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

function loadStats(): AchievementStats {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      return { ...DEFAULT_STATS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load achievement stats:', error);
  }
  return DEFAULT_STATS;
}

function saveStats(stats: AchievementStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save achievement stats:', error);
  }
}

export const useAchievementsStore = create<AchievementsStore>((set, get) => ({
  unlockedAchievements: loadAchievements(),
  stats: loadStats(),
  showNotification: null,

  initTracking: (initialMuscleMass: number) => {
    const { stats } = get();
    const today = new Date().toDateString();

    // Check if this is a new day
    if (stats.lastActiveDate !== today) {
      const updatedStats = {
        ...stats,
        daysActive: stats.daysActive + 1,
        lastActiveDate: today,
        initialMuscleMass: stats.initialMuscleMass || initialMuscleMass,
      };
      set({ stats: updatedStats });
      saveStats(updatedStats);
    } else if (!stats.initialMuscleMass) {
      const updatedStats = { ...stats, initialMuscleMass };
      set({ stats: updatedStats });
      saveStats(updatedStats);
    }
  },

  trackMeal: () => {
    const { stats } = get();
    const updatedStats = { ...stats, mealsLogged: stats.mealsLogged + 1 };
    set({ stats: updatedStats });
    saveStats(updatedStats);
    get().checkAchievements();
  },

  trackExercise: () => {
    const { stats } = get();
    const updatedStats = { ...stats, exercisesLogged: stats.exercisesLogged + 1 };
    set({ stats: updatedStats });
    saveStats(updatedStats);
    get().checkAchievements();
  },

  trackSleep: () => {
    const { stats } = get();
    const updatedStats = { ...stats, sleepSessions: stats.sleepSessions + 1 };
    set({ stats: updatedStats });
    saveStats(updatedStats);
    get().checkAchievements();
  },

  trackScenarioCompletion: () => {
    const { stats } = get();
    const updatedStats = { ...stats, scenariosCompleted: stats.scenariosCompleted + 1 };
    set({ stats: updatedStats });
    saveStats(updatedStats);
    get().checkAchievements();
  },

  trackHormonePeak: (hormone: string, value: number) => {
    const { stats } = get();
    const updatedStats = { ...stats };

    switch (hormone) {
      case 'insulin':
        updatedStats.peakInsulin = Math.max(updatedStats.peakInsulin, value);
        break;
      case 'cortisol':
        updatedStats.peakCortisol = Math.max(updatedStats.peakCortisol, value);
        break;
      case 'testosterone':
        updatedStats.peakTestosterone = Math.max(updatedStats.peakTestosterone, value);
        break;
    }

    set({ stats: updatedStats });
    saveStats(updatedStats);
    get().checkAchievements();
  },

  trackMuscleGain: (currentMass: number) => {
    const { stats } = get();
    if (stats.initialMuscleMass > 0) {
      const gained = currentMass - stats.initialMuscleMass;
      const updatedStats = { ...stats, muscleMassGained: Math.max(stats.muscleMassGained, gained) };
      set({ stats: updatedStats });
      saveStats(updatedStats);
      get().checkAchievements();
    }
  },

  trackPerfectDay: () => {
    const { stats } = get();
    const updatedStats = { ...stats, perfectDay: true };
    set({ stats: updatedStats });
    saveStats(updatedStats);
    get().checkAchievements();
  },

  trackFastingStreak: (hours: number) => {
    const { stats } = get();
    const updatedStats = { ...stats, fastingStreak: Math.max(stats.fastingStreak, hours) };
    set({ stats: updatedStats });
    saveStats(updatedStats);
    get().checkAchievements();
  },

  trackProteinStreak: () => {
    const { stats } = get();
    const updatedStats = { ...stats, proteinStreak: stats.proteinStreak + 1 };
    set({ stats: updatedStats });
    saveStats(updatedStats);
    get().checkAchievements();
  },

  checkAchievements: () => {
    const { unlockedAchievements, stats } = get();
    const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));
    const newlyUnlocked: Achievement[] = [];

    const achievementState: AchievementState = {
      mealsLogged: stats.mealsLogged,
      exercisesLogged: stats.exercisesLogged,
      sleepSessions: stats.sleepSessions,
      peakInsulin: stats.peakInsulin,
      peakCortisol: stats.peakCortisol,
      peakTestosterone: stats.peakTestosterone,
      muscleMassGained: stats.muscleMassGained,
      daysActive: stats.daysActive,
      scenariosCompleted: stats.scenariosCompleted,
      perfectDay: stats.perfectDay,
      fastingStreak: stats.fastingStreak,
      proteinStreak: stats.proteinStreak,
    };

    // Check legendary achievement (all rares unlocked)
    const rareAchievements = ACHIEVEMENTS.filter((a) => a.rarity === 'rare');
    const rareCount = rareAchievements.filter((a) => unlockedIds.has(a.id)).length;

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;

      let conditionMet = achievement.condition(achievementState);

      // Special handling for legendary achievement
      if (achievement.id === 'metabolism-master') {
        conditionMet = rareCount === rareAchievements.length;
      }

      if (conditionMet) {
        const newUnlock: UnlockedAchievement = {
          id: achievement.id,
          unlockedAt: Date.now(),
        };
        const updated = [...unlockedAchievements, newUnlock];
        set({ unlockedAchievements: updated, showNotification: achievement });
        saveAchievements(updated);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  },

  dismissNotification: () => {
    set({ showNotification: null });
  },

  reset: () => {
    set({
      unlockedAchievements: [],
      stats: DEFAULT_STATS,
      showNotification: null,
    });
    saveAchievements([]);
    saveStats(DEFAULT_STATS);
  },
}));

// Helper to get achievement progress
export function getAchievementProgress(achievementId: string): { current: number; target: number; label: string } {
  const { stats } = useAchievementsStore.getState();
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return { current: 0, target: 1, label: '' };

  switch (achievementId) {
    case 'meal-master':
      return { current: stats.mealsLogged, target: 25, label: 'meals' };
    case 'workout-warrior':
      return { current: stats.exercisesLogged, target: 15, label: 'exercises' };
    case 'sleep-master':
      return { current: stats.sleepSessions, target: 10, label: 'sessions' };
    case 'muscle-gain':
      return { current: Math.max(0, stats.muscleMassGained), target: 1, label: 'kg' };
    case 'seven-days':
      return { current: stats.daysActive, target: 7, label: 'days' };
    case 'scenario-master':
      return { current: stats.scenariosCompleted, target: 3, label: 'scenarios' };
    case 'insulin-spike':
      return { current: stats.peakInsulin, target: 30, label: 'µU/mL' };
    case 'cortisol-spike':
      return { current: stats.peakCortisol, target: 25, label: 'mcg/dL' };
    case 'testosterone-peak':
      return { current: stats.peakTestosterone, target: 30, label: 'nmol/L' };
    default:
      return { current: 0, target: 1, label: '' };
  }
}

// ============================================================================
// METABOLIC SIMULATOR - RECOVERY STORE
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSimulationStore } from './store';

// Recovery score categories
export type RecoveryLevel = 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';

// Recovery factors
export interface RecoveryFactors {
  sleep: number; // 0-100
  stress: number; // 0-100 (inverted - lower stress is better)
  muscleRecovery: number; // 0-100
  glycogen: number; // 0-100
  hormoneBalance: number; // 0-100
  hydration: number; // 0-100
}

// Recovery recommendation
export interface RecoveryRecommendation {
  id: string;
  type: 'training' | 'nutrition' | 'lifestyle' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action?: string;
}

// Daily recovery record
export interface RecoveryRecord {
  date: string; // YYYY-MM-DD
  overallScore: number; // 0-100
  level: RecoveryLevel;
  factors: RecoveryFactors;
  recommendations: RecoveryRecommendation[];
  trainingReadiness: 'go-hard' | 'moderate' | 'easy' | 'rest';
  notes?: string;
}

// Recovery state
interface RecoveryStore {
  records: RecoveryRecord[];
  todayRecord: RecoveryRecord | null;

  // Actions
  calculateTodayRecovery: () => RecoveryRecord;
  addRecord: (record: RecoveryRecord) => void;
  updateRecord: (date: string, updates: Partial<RecoveryRecord>) => void;
  getRecordByDate: (date: string) => RecoveryRecord | undefined;
  getRecentRecords: (days: number) => RecoveryRecord[];
  getTrends: () => {
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
    bestDay: RecoveryRecord | null;
    worstDay: RecoveryRecord | null;
  };
  getRecommendations: () => RecoveryRecommendation[];
  clearHistory: () => void;
}

// Helper to calculate recovery level from score
function getRecoveryLevel(score: number): RecoveryLevel {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'moderate';
  if (score >= 40) return 'poor';
  return 'critical';
}

// Helper to determine training readiness
function getTrainingReadiness(record: RecoveryRecord): 'go-hard' | 'moderate' | 'easy' | 'rest' {
  if (record.overallScore >= 85) return 'go-hard';
  if (record.overallScore >= 70) return 'moderate';
  if (record.overallScore >= 50) return 'easy';
  return 'rest';
}

// Calculate recovery factors from simulation state
function calculateFactors(state: any): RecoveryFactors {
  // Sleep score (0-100)
  let sleepScore = 50;
  if (state.lastSleepHours !== undefined) {
    const idealSleep = 8;
    const hoursDiff = Math.abs(state.lastSleepHours - idealSleep);
    sleepScore = Math.max(0, Math.min(100, 100 - (hoursDiff * 15)));
  }

  // Stress score (0-100) - inverted so lower stress = higher score
  let stressScore = 50;
  if (state.stressLevel !== undefined) {
    const stressMap = { low: 100, med: 65, high: 30 };
    stressScore = stressMap[state.stressLevel as keyof typeof stressMap] || 50;
  }

  // Muscle recovery score based on glycogen and MPS/MPB ratio
  let muscleScore = 70;
  if (state.glycogen !== undefined) {
    muscleScore = Math.min(100, state.glycogen);
  }
  if (state.mps && state.mpb) {
    const mpsMpbRatio = state.mps / (state.mpb || 1);
    muscleScore = Math.min(100, (muscleScore + (mpsMpbRatio > 1 ? 10 : 0)));
  }

  // Glycogen score
  const glycogenScore = state.glycogen || 50;

  // Hormone balance score based on key hormones
  let hormoneScore = 70;
  if (state.hormones) {
    const { cortisol, testosterone, growthHormone } = state.hormones;

    // Low cortisol is good for recovery
    if (cortisol !== undefined) {
      const cortisolScore = Math.max(0, 100 - (cortisol * 5));
      hormoneScore = (hormoneScore + cortisolScore) / 2;
    }

    // Higher testosterone is good
    if (testosterone !== undefined) {
      const testScore = Math.min(100, testosterone * 4);
      hormoneScore = (hormoneScore + testScore) / 2;
    }

    // Growth hormone indicates recovery
    if (growthHormone !== undefined) {
      const ghScore = Math.min(100, growthHormone * 30);
      hormoneScore = (hormoneScore + ghScore) / 2;
    }
  }

  // Hydration score
  const hydrationScore = state.glycogen || 50; // Using glycogen as proxy

  return {
    sleep: sleepScore,
    stress: stressScore,
    muscleRecovery: muscleScore,
    glycogen: glycogenScore,
    hormoneBalance: hormoneScore,
    hydration: hydrationScore,
  };
}

// Generate recommendations based on factors
function generateRecommendations(factors: RecoveryFactors, overallScore: number): RecoveryRecommendation[] {
  const recommendations: RecoveryRecommendation[] = [];

  // Sleep recommendations
  if (factors.sleep < 60) {
    recommendations.push({
      id: 'sleep-more',
      type: 'lifestyle',
      priority: factors.sleep < 40 ? 'high' : 'medium',
      title: 'Improve Sleep Quality',
      description: `Your sleep score is ${factors.sleep.toFixed(0)}%. Aim for 7-9 hours of quality sleep for optimal recovery.`,
      action: 'Prioritize a consistent bedtime and create a dark, cool sleeping environment.',
    });
  }

  // Stress recommendations
  if (factors.stress < 60) {
    recommendations.push({
      id: 'reduce-stress',
      type: 'lifestyle',
      priority: factors.stress < 40 ? 'high' : 'medium',
      title: 'Manage Stress Levels',
      description: `High stress is impairing your recovery. Current stress score: ${factors.stress.toFixed(0)}%.`,
      action: 'Try meditation, deep breathing exercises, or a nature walk.',
    });
  }

  // Muscle recovery recommendations
  if (factors.muscleRecovery < 60) {
    recommendations.push({
      id: 'muscle-recovery',
      type: 'nutrition',
      priority: 'medium',
      title: 'Support Muscle Recovery',
      description: `Your muscle recovery score is ${factors.muscleRecovery.toFixed(0)}%.`,
      action: 'Ensure adequate protein intake and consider active recovery activities.',
    });
  }

  // Glycogen recommendations
  if (factors.glycogen < 50) {
    recommendations.push({
      id: 'refuel',
      type: 'nutrition',
      priority: 'high',
      title: 'Replenish Glycogen Stores',
      description: `Glycogen levels are low (${factors.glycogen.toFixed(0)}%). This impacts performance.`,
      action: 'Consume complex carbs within 2 hours post-workout.',
    });
  }

  // Hormone balance recommendations
  if (factors.hormoneBalance < 60) {
    recommendations.push({
      id: 'hormone-balance',
      type: 'lifestyle',
      priority: 'medium',
      title: 'Optimize Hormonal Environment',
      description: `Your hormone balance score is ${factors.hormoneBalance.toFixed(0)}%.`,
      action: 'Focus on sleep hygiene, stress management, and nutrition timing.',
    });
  }

  // Training recommendations based on overall score
  if (overallScore < 50) {
    recommendations.push({
      id: 'take-rest',
      type: 'warning',
      priority: 'critical',
      title: 'Consider Rest Day',
      description: `Your recovery score is critically low (${overallScore.toFixed(0)}%). Training now may be counterproductive.`,
      action: 'Take a rest day or focus only on light mobility work.',
    });
  } else if (overallScore >= 85) {
    recommendations.push({
      id: 'go-hard',
      type: 'training',
      priority: 'low',
      title: 'Great Recovery - Push Hard!',
      description: `Your recovery score is excellent (${overallScore.toFixed(0)}%). You\'re ready for intense training.`,
      action: 'This is a great time for PR attempts or high-intensity sessions.',
    });
  }

  return recommendations;
}

// Create the store
export const useRecoveryStore = create<RecoveryStore>()(
  persist(
    (set, get) => ({
      records: [],
      todayRecord: null,

      calculateTodayRecovery: () => {
        const state = useSimulationStore.getState();

        const factors = calculateFactors(state);

        // Calculate overall score (weighted average)
        const overallScore =
          factors.sleep * 0.25 +
          factors.stress * 0.2 +
          factors.muscleRecovery * 0.2 +
          factors.glycogen * 0.15 +
          factors.hormoneBalance * 0.15 +
          factors.hydration * 0.05;

        const today = new Date().toISOString().split('T')[0];
        const level = getRecoveryLevel(overallScore);
        const recommendations = generateRecommendations(factors, overallScore);
        const trainingReadiness = getTrainingReadiness({ overallScore, level, factors, recommendations, trainingReadiness: 'moderate' } as RecoveryRecord);

        const record: RecoveryRecord = {
          date: today,
          overallScore: Math.round(overallScore),
          level,
          factors,
          recommendations,
          trainingReadiness,
        };

        set({ todayRecord: record });

        // Auto-save if it doesn't exist for today
        const existing = get().records.find(r => r.date === today);
        if (!existing) {
          set((state) => ({ records: [...state.records, record] }));
        }

        return record;
      },

      addRecord: (record) => {
        set((state) => ({ records: [...state.records, record] }));
      },

      updateRecord: (date, updates) => {
        set((state) => ({
          records: state.records.map(r =>
            r.date === date ? { ...r, ...updates } : r
          ),
        }));
      },

      getRecordByDate: (date) => {
        return get().records.find(r => r.date === date);
      },

      getRecentRecords: (days) => {
        const sorted = [...get().records].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return sorted.slice(0, days);
      },

      getTrends: () => {
        const records = get().records;
        if (records.length === 0) {
          return {
            averageScore: 0,
            trend: 'stable',
            bestDay: null,
            worstDay: null,
          };
        }

        const totalScore = records.reduce((sum, r) => sum + r.overallScore, 0);
        const averageScore = totalScore / records.length;

        // Calculate trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (records.length >= 3) {
          const recent = records.slice(0, Math.min(7, records.length));
          const recentAvg = recent.reduce((sum, r) => sum + r.overallScore, 0) / recent.length;
          const older = records.slice(Math.min(7, records.length));
          const olderAvg = older.reduce((sum, r) => sum + r.overallScore, 0) / older.length;

          if (recentAvg > olderAvg + 5) trend = 'up';
          else if (recentAvg < olderAvg - 5) trend = 'down';
        }

        const bestDay = records.reduce((best, current) =>
          current.overallScore > (best?.overallScore || 0) ? current : best, null as RecoveryRecord | null
        );

        const worstDay = records.reduce((worst, current) =>
          current.overallScore < (worst?.overallScore || 100) ? current : worst, null as RecoveryRecord | null
        );

        return { averageScore, trend, bestDay, worstDay };
      },

      getRecommendations: () => {
        const today = get().calculateTodayRecovery();
        return today.recommendations;
      },

      clearHistory: () => {
        set({ records: [], todayRecord: null });
      },
    }),
    {
      name: 'metabol-sim-recovery',
    }
  )
);

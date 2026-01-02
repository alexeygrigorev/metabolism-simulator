// ============================================================================
// METABOLIC SIMULATOR - RECOVERY STORE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRecoveryStore, RecoveryLevel } from '../../src/state/recoveryStore';
import { useSimulationStore } from '../../src/state/store';

// Mock the simulation store
vi.mock('../../src/state/store');

describe('recoveryStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useRecoveryStore.getState().clearHistory();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty records array', () => {
      const { records } = useRecoveryStore.getState();
      expect(records).toEqual([]);
    });

    it('should have null todayRecord initially', () => {
      const { todayRecord } = useRecoveryStore.getState();
      expect(todayRecord).toBeNull();
    });
  });

  describe('calculateTodayRecovery', () => {
    it('should calculate recovery factors from simulation state', () => {
      const mockState = {
        stressLevel: 'low',
        glycogen: 80,
        hormones: {
          cortisol: 5,
          testosterone: 20,
          growthHormone: 2,
        },
        mps: 0.2,
        mpb: 0.1,
        lastSleepHours: 8,
      };

      vi.mocked(useSimulationStore).getState.mockReturnValue(mockState);

      const { calculateTodayRecovery } = useRecoveryStore.getState();
      const record = calculateTodayRecovery();

      expect(record).toBeDefined();
      expect(record.overallScore).toBeGreaterThan(0);
      expect(record.overallScore).toBeLessThanOrEqual(100);
      expect(record.date).toBeDefined();
    });

    it('should return excellent recovery level for high scores', () => {
      const mockState = {
        stressLevel: 'low',
        glycogen: 100,
        hormones: {
          cortisol: 2,
          testosterone: 25,
          growthHormone: 3,
        },
        mps: 0.3,
        mpb: 0.05,
        lastSleepHours: 9,
      };

      vi.mocked(useSimulationStore).getState.mockReturnValue(mockState);

      const { calculateTodayRecovery } = useRecoveryStore.getState();
      const record = calculateTodayRecovery();

      expect(record.level).toBe('excellent');
      expect(record.trainingReadiness).toBe('go-hard');
    });

    it('should return poor recovery level for low scores', () => {
      const mockState = {
        stressLevel: 'med',
        glycogen: 55,
        hormones: {
          cortisol: 12,
          testosterone: 12,
          growthHormone: 1.2,
        },
        mps: 0.1,
        mpb: 0.12,
        lastSleepHours: 6,
      };

      vi.mocked(useSimulationStore).getState.mockReturnValue(mockState);

      const { calculateTodayRecovery } = useRecoveryStore.getState();
      const record = calculateTodayRecovery();

      // Score should be in poor range (40-59) and above easy threshold (50)
      expect(record.level).toBe('poor');
      expect(record.trainingReadiness).toBe('easy');
    });

    it('should return critical recovery for very low scores', () => {
      const mockState = {
        stressLevel: 'high',
        glycogen: 20,
        hormones: {
          cortisol: 25,
          testosterone: 2,
          growthHormone: 0.1,
        },
        mps: 0.02,
        mpb: 0.3,
        lastSleepHours: 2,
      };

      vi.mocked(useSimulationStore).getState.mockReturnValue(mockState);

      const { calculateTodayRecovery } = useRecoveryStore.getState();
      const record = calculateTodayRecovery();

      expect(record.level).toBe('critical');
      expect(record.trainingReadiness).toBe('rest');
    });

    it('should include all recovery factors', () => {
      const mockState = {
        stressLevel: 'med',
        glycogen: 70,
        hormones: {
          cortisol: 10,
          testosterone: 15,
          growthHormone: 1,
        },
        mps: 0.15,
        mpb: 0.1,
        lastSleepHours: 7,
      };

      vi.mocked(useSimulationStore).getState.mockReturnValue(mockState);

      const { calculateTodayRecovery } = useRecoveryStore.getState();
      const record = calculateTodayRecovery();

      expect(record.factors).toHaveProperty('sleep');
      expect(record.factors).toHaveProperty('stress');
      expect(record.factors).toHaveProperty('muscleRecovery');
      expect(record.factors).toHaveProperty('glycogen');
      expect(record.factors).toHaveProperty('hormoneBalance');
      expect(record.factors).toHaveProperty('hydration');
    });
  });

  describe('addRecord', () => {
    it('should add a recovery record', () => {
      const { addRecord, records } = useRecoveryStore.getState();

      const record = {
        date: '2024-01-01',
        overallScore: 75,
        level: 'good' as RecoveryLevel,
        factors: {
          sleep: 80,
          stress: 70,
          muscleRecovery: 75,
          glycogen: 70,
          hormoneBalance: 80,
          hydration: 70,
        },
        recommendations: [],
        trainingReadiness: 'moderate' as const,
      };

      addRecord(record);

      const updatedState = useRecoveryStore.getState();
      expect(updatedState.records).toHaveLength(1);
      expect(updatedState.records[0].date).toBe('2024-01-01');
    });

    it('should add multiple records', () => {
      const { addRecord, records } = useRecoveryStore.getState();

      const record1 = {
        date: '2024-01-01',
        overallScore: 80,
        level: 'good' as RecoveryLevel,
        factors: {
          sleep: 80,
          stress: 80,
          muscleRecovery: 80,
          glycogen: 80,
          hormoneBalance: 80,
          hydration: 80,
        },
        recommendations: [],
        trainingReadiness: 'go-hard' as const,
      };

      const record2 = {
        date: '2024-01-02',
        overallScore: 65,
        level: 'moderate' as RecoveryLevel,
        factors: {
          sleep: 60,
          stress: 70,
          muscleRecovery: 65,
          glycogen: 65,
          hormoneBalance: 65,
          hydration: 65,
        },
        recommendations: [],
        trainingReadiness: 'moderate' as const,
      };

      addRecord(record1);
      addRecord(record2);

      const updatedState = useRecoveryStore.getState();
      expect(updatedState.records).toHaveLength(2);
    });
  });

  describe('updateRecord', () => {
    it('should update an existing record by date', () => {
      const { addRecord, updateRecord, getRecordByDate } = useRecoveryStore.getState();

      const record = {
        date: '2024-01-01',
        overallScore: 70,
        level: 'moderate' as RecoveryLevel,
        factors: {
          sleep: 70,
          stress: 70,
          muscleRecovery: 70,
          glycogen: 70,
          hormoneBalance: 70,
          hydration: 70,
        },
        recommendations: [],
        trainingReadiness: 'moderate' as const,
      };

      addRecord(record);

      updateRecord('2024-01-01', { overallScore: 85, level: 'good' });

      const updated = getRecordByDate('2024-01-01');
      expect(updated?.overallScore).toBe(85);
      expect(updated?.level).toBe('good');
    });
  });

  describe('getRecordByDate', () => {
    it('should return record for the given date', () => {
      const { addRecord, getRecordByDate } = useRecoveryStore.getState();

      const record = {
        date: '2024-01-01',
        overallScore: 75,
        level: 'good' as RecoveryLevel,
        factors: {
          sleep: 75,
          stress: 75,
          muscleRecovery: 75,
          glycogen: 75,
          hormoneBalance: 75,
          hydration: 75,
        },
        recommendations: [],
        trainingReadiness: 'moderate' as const,
      };

      addRecord(record);

      const found = getRecordByDate('2024-01-01');
      expect(found).toBeDefined();
      expect(found?.overallScore).toBe(75);
    });

    it('should return undefined for non-existent date', () => {
      const { getRecordByDate } = useRecoveryStore.getState();

      const found = getRecordByDate('2024-12-31');
      expect(found).toBeUndefined();
    });
  });

  describe('getRecentRecords', () => {
    it('should return requested number of recent records', () => {
      const { addRecord, getRecentRecords } = useRecoveryStore.getState();

      // Add 5 records
      for (let i = 1; i <= 5; i++) {
        addRecord({
          date: `2024-01-0${i}`,
          overallScore: 70 + i,
          level: 'good' as RecoveryLevel,
          factors: {
            sleep: 70 + i,
            stress: 70 + i,
            muscleRecovery: 70 + i,
            glycogen: 70 + i,
            hormoneBalance: 70 + i,
            hydration: 70 + i,
          },
          recommendations: [],
          trainingReadiness: 'moderate' as const,
        });
      }

      const recent = getRecentRecords(3);
      expect(recent).toHaveLength(3);
    });

    it('should return records sorted by date (newest first)', () => {
      const { addRecord, getRecentRecords } = useRecoveryStore.getState();

      addRecord({
        date: '2024-01-03',
        overallScore: 80,
        level: 'good' as RecoveryLevel,
        factors: {
          sleep: 80,
          stress: 80,
          muscleRecovery: 80,
          glycogen: 80,
          hormoneBalance: 80,
          hydration: 80,
        },
        recommendations: [],
        trainingReadiness: 'go-hard' as const,
      });

      addRecord({
        date: '2024-01-01',
        overallScore: 60,
        level: 'moderate' as RecoveryLevel,
        factors: {
          sleep: 60,
          stress: 60,
          muscleRecovery: 60,
          glycogen: 60,
          hormoneBalance: 60,
          hydration: 60,
        },
        recommendations: [],
        trainingReadiness: 'easy' as const,
      });

      addRecord({
        date: '2024-01-02',
        overallScore: 70,
        level: 'good' as RecoveryLevel,
        factors: {
          sleep: 70,
          stress: 70,
          muscleRecovery: 70,
          glycogen: 70,
          hormoneBalance: 70,
          hydration: 70,
        },
        recommendations: [],
        trainingReadiness: 'moderate' as const,
      });

      const recent = getRecentRecords(10);
      expect(recent[0].date).toBe('2024-01-03');
      expect(recent[1].date).toBe('2024-01-02');
      expect(recent[2].date).toBe('2024-01-01');
    });
  });

  describe('getTrends', () => {
    it('should return zero stats when no records', () => {
      const { getTrends } = useRecoveryStore.getState();
      const trends = getTrends();

      expect(trends.averageScore).toBe(0);
      expect(trends.trend).toBe('stable');
      expect(trends.bestDay).toBeNull();
      expect(trends.worstDay).toBeNull();
    });

    it('should calculate average score', () => {
      const { addRecord, getTrends } = useRecoveryStore.getState();

      addRecord({
        date: '2024-01-01',
        overallScore: 80,
        level: 'good' as RecoveryLevel,
        factors: {
          sleep: 80,
          stress: 80,
          muscleRecovery: 80,
          glycogen: 80,
          hormoneBalance: 80,
          hydration: 80,
        },
        recommendations: [],
        trainingReadiness: 'moderate' as const,
      });

      addRecord({
        date: '2024-01-02',
        overallScore: 60,
        level: 'moderate' as RecoveryLevel,
        factors: {
          sleep: 60,
          stress: 60,
          muscleRecovery: 60,
          glycogen: 60,
          hormoneBalance: 60,
          hydration: 60,
        },
        recommendations: [],
        trainingReadiness: 'easy' as const,
      });

      const trends = getTrends();
      expect(trends.averageScore).toBe(70);
    });

    it('should identify best and worst days', () => {
      const { addRecord, getTrends } = useRecoveryStore.getState();

      addRecord({
        date: '2024-01-01',
        overallScore: 90,
        level: 'excellent' as RecoveryLevel,
        factors: {
          sleep: 90,
          stress: 90,
          muscleRecovery: 90,
          glycogen: 90,
          hormoneBalance: 90,
          hydration: 90,
        },
        recommendations: [],
        trainingReadiness: 'go-hard' as const,
      });

      addRecord({
        date: '2024-01-02',
        overallScore: 50,
        level: 'poor' as RecoveryLevel,
        factors: {
          sleep: 50,
          stress: 50,
          muscleRecovery: 50,
          glycogen: 50,
          hormoneBalance: 50,
          hydration: 50,
        },
        recommendations: [],
        trainingReadiness: 'easy' as const,
      });

      const trends = getTrends();
      expect(trends.bestDay?.overallScore).toBe(90);
      expect(trends.worstDay?.overallScore).toBe(50);
    });

    it('should detect upward trend', () => {
      const { addRecord, getTrends } = useRecoveryStore.getState();

      // Add older lower scores (will be sorted to end after date sort)
      // Then add recent higher scores
      // Records are sorted by date descending, so recent records are first
      // Need at least 3 records for trend calculation
      // Recent (first 7) vs Older (remaining)
      // For upward: recent_avg > older_avg + 5

      // Add 10 records - first 7 will be "recent", last 3 will be "older"
      // Recent records should have higher scores
      for (let i = 1; i <= 10; i++) {
        addRecord({
          date: `2024-01-${i.toString().padStart(2, '0')}`,
          overallScore: i <= 7 ? 85 : 60, // First 7 days have 85, last 3 days have 60
          level: i <= 7 ? ('good' as RecoveryLevel) : ('moderate' as RecoveryLevel),
          factors: {
            sleep: i <= 7 ? 85 : 60,
            stress: i <= 7 ? 85 : 60,
            muscleRecovery: i <= 7 ? 85 : 60,
            glycogen: i <= 7 ? 85 : 60,
            hormoneBalance: i <= 7 ? 85 : 60,
            hydration: i <= 7 ? 85 : 60,
          },
          recommendations: [],
          trainingReadiness: 'moderate' as const,
        });
      }

      const trends = getTrends();
      expect(trends.trend).toBe('up');
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations when recovery is poor', () => {
      const mockState = {
        stressLevel: 'high',
        glycogen: 30,
        hormones: {
          cortisol: 20,
          testosterone: 5,
          growthHormone: 0.5,
        },
        mps: 0.05,
        mpb: 0.2,
        lastSleepHours: 4,
      };

      vi.mocked(useSimulationStore).getState.mockReturnValue(mockState);

      const { getRecommendations } = useRecoveryStore.getState();
      const recommendations = getRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.priority === 'critical' || r.priority === 'high')).toBe(true);
    });

    it('should include rest recommendation for critical recovery', () => {
      const mockState = {
        stressLevel: 'high',
        glycogen: 20,
        hormones: {
          cortisol: 25,
          testosterone: 2,
          growthHormone: 0.1,
        },
        mps: 0.02,
        mpb: 0.3,
        lastSleepHours: 2,
      };

      vi.mocked(useSimulationStore).getState.mockReturnValue(mockState);

      const { getRecommendations } = useRecoveryStore.getState();
      const recommendations = getRecommendations();

      const restRec = recommendations.find(r => r.id === 'take-rest');
      expect(restRec).toBeDefined();
      expect(restRec?.priority).toBe('critical');
    });
  });

  describe('clearHistory', () => {
    it('should clear all records', () => {
      const { addRecord, clearHistory } = useRecoveryStore.getState();

      addRecord({
        date: '2024-01-01',
        overallScore: 75,
        level: 'good' as RecoveryLevel,
        factors: {
          sleep: 75,
          stress: 75,
          muscleRecovery: 75,
          glycogen: 75,
          hormoneBalance: 75,
          hydration: 75,
        },
        recommendations: [],
        trainingReadiness: 'moderate' as const,
      });

      expect(useRecoveryStore.getState().records).toHaveLength(1);

      clearHistory();

      const clearedState = useRecoveryStore.getState();
      expect(clearedState.records).toEqual([]);
      expect(clearedState.todayRecord).toBeNull();
    });
  });
});

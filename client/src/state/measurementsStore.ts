// ============================================================================
// METABOLIC SIMULATOR - BODY MEASUREMENTS STORE
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MeasurementType =
  | 'weight'
  | 'bodyFat'
  | 'chest'
  | 'waist'
  | 'hips'
  | 'leftArm'
  | 'rightArm'
  | 'leftThigh'
  | 'rightThigh'
  | 'leftCalf'
  | 'rightCalf'
  | 'neck'
  | 'shoulders';

export interface MeasurementEntry {
  id: string;
  date: Date;
  measurements: Record<MeasurementType, number | null>;
  notes?: string;
}

export interface MeasurementConfig {
  id: MeasurementType;
  name: string;
  icon: string;
  unit: string;
  category: 'primary' | 'upper' | 'lower' | 'other';
  description: string;
}

export const MEASUREMENT_CONFIGS: Record<MeasurementType, MeasurementConfig> = {
  weight: {
    id: 'weight',
    name: 'Weight',
    icon: '⚖️',
    unit: 'kg',
    category: 'primary',
    description: 'Overall body weight',
  },
  bodyFat: {
    id: 'bodyFat',
    name: 'Body Fat %',
    icon: '📊',
    unit: '%',
    category: 'primary',
    description: 'Body fat percentage',
  },
  chest: {
    id: 'chest',
    name: 'Chest',
    icon: '🦍',
    unit: 'cm',
    category: 'upper',
    description: 'Chest circumference at nipple line',
  },
  waist: {
    id: 'waist',
    name: 'Waist',
    icon: '📏',
    unit: 'cm',
    category: 'upper',
    description: 'Waist circumference at navel',
  },
  hips: {
    id: 'hips',
    name: 'Hips',
    icon: '👖',
    unit: 'cm',
    category: 'lower',
    description: 'Hip circumference at widest point',
  },
  leftArm: {
    id: 'leftArm',
    name: 'Left Arm',
    icon: '💪',
    unit: 'cm',
    category: 'upper',
    description: 'Left bicep circumference, flexed',
  },
  rightArm: {
    id: 'rightArm',
    name: 'Right Arm',
    icon: '💪',
    unit: 'cm',
    category: 'upper',
    description: 'Right bicep circumference, flexed',
  },
  leftThigh: {
    id: 'leftThigh',
    name: 'Left Thigh',
    icon: '🦵',
    unit: 'cm',
    category: 'lower',
    description: 'Left thigh circumference at widest point',
  },
  rightThigh: {
    id: 'rightThigh',
    name: 'Right Thigh',
    icon: '🦵',
    unit: 'cm',
    category: 'lower',
    description: 'Right thigh circumference at widest point',
  },
  leftCalf: {
    id: 'leftCalf',
    name: 'Left Calf',
    icon: '🦶',
    unit: 'cm',
    category: 'lower',
    description: 'Left calf circumference at widest point',
  },
  rightCalf: {
    id: 'rightCalf',
    name: 'Right Calf',
    icon: '🦶',
    unit: 'cm',
    category: 'lower',
    description: 'Right calf circumference at widest point',
  },
  neck: {
    id: 'neck',
    name: 'Neck',
    icon: '🔗',
    unit: 'cm',
    category: 'upper',
    description: 'Neck circumference below Adam\'s apple',
  },
  shoulders: {
    id: 'shoulders',
    name: 'Shoulders',
    icon: '🏋️',
    unit: 'cm',
    category: 'upper',
    description: 'Shoulder circumference at widest point',
  },
};

export interface MeasurementsStats {
  totalEntries: number;
  firstEntryDate: Date | null;
  lastEntryDate: Date | null;
  streak: number;
  trends: Record<MeasurementType, 'up' | 'down' | 'stable' | null>;
}

interface MeasurementsStore {
  entries: MeasurementEntry[];
  activeCategory: 'all' | 'primary' | 'upper' | 'lower' | 'other';

  // Actions
  addEntry: (measurements: Record<MeasurementType, number | null>, notes?: string) => void;
  updateEntry: (id: string, measurements: Record<MeasurementType, number | null>, notes?: string) => void;
  deleteEntry: (id: string) => void;
  getEntryByDate: (date: Date) => MeasurementEntry | undefined;
  getHistoryForMeasurement: (type: MeasurementType, limit?: number) => Array<{ date: Date; value: number }>;
  getStats: () => MeasurementsStats;
  setActiveCategory: (category: 'all' | 'primary' | 'upper' | 'lower' | 'other') => void;
  reset: () => void;
}

const MAX_ENTRIES = 100; // Keep last 100 entries

export const useMeasurementsStore = create<MeasurementsStore>()(
  persist(
    (set, get) => ({
      entries: [],
      activeCategory: 'all',

      addEntry: (measurements, notes) => {
        const entry: MeasurementEntry = {
          id: `measurement-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          date: new Date(),
          measurements,
          notes,
        };

        set((state) => ({
          entries: [...state.entries, entry].slice(-MAX_ENTRIES),
        }));
      },

      updateEntry: (id, measurements, notes) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, measurements, notes }
              : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      getEntryByDate: (date) => {
        const { entries } = get();
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        return entries.find((entry) => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === targetDate.getTime();
        });
      },

      getHistoryForMeasurement: (type, limit = 20) => {
        const { entries } = get();
        const history: Array<{ date: Date; value: number }> = [];

        for (const entry of entries) {
          const value = entry.measurements[type];
          if (value !== null && value !== undefined) {
            history.push({ date: new Date(entry.date), value });
          }
        }

        return history
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(-limit);
      },

      getStats: () => {
        const { entries } = get();
        if (entries.length === 0) {
          return {
            totalEntries: 0,
            firstEntryDate: null,
            lastEntryDate: null,
            streak: 0,
            trends: Object.fromEntries(
              Object.keys(MEASUREMENT_CONFIGS).map((key) => [key, null])
            ) as Record<MeasurementType, 'up' | 'down' | 'stable' | null>,
          };
        }

        const sortedEntries = [...entries].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const firstEntryDate = new Date(sortedEntries[0].date);
        const lastEntryDate = new Date(sortedEntries[sortedEntries.length - 1].date);

        // Calculate streak (consecutive days with at least one entry)
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkDate = new Date(today);
        while (true) {
          const entryForDate = get().getEntryByDate(checkDate);
          if (entryForDate) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (checkDate.getTime() === today.getTime()) {
            // No entry today, check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        // Calculate trends for each measurement type
        const trends: Record<MeasurementType, 'up' | 'down' | 'stable' | null> =
          Object.fromEntries(
            Object.keys(MEASUREMENT_CONFIGS).map((key) => {
              const type = key as MeasurementType;
              const history = get().getHistoryForMeasurement(type, 2);

              if (history.length < 2) {
                return [type, null];
              }

              const [oldValue, newValue] = [history[0].value, history[1].value];
              const percentChange = ((newValue - oldValue) / oldValue) * 100;

              if (percentChange > 1) return [type, 'up'];
              if (percentChange < -1) return [type, 'down'];
              return [type, 'stable'];
            })
          ) as Record<MeasurementType, 'up' | 'down' | 'stable' | null>;

        return {
          totalEntries: entries.length,
          firstEntryDate,
          lastEntryDate,
          streak,
          trends,
        };
      },

      setActiveCategory: (category) => {
        set({ activeCategory: category });
      },

      reset: () => {
        set({ entries: [], activeCategory: 'all' });
      },
    }),
    {
      name: 'metabol-sim-measurements',
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
);

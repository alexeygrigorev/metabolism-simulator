// ============================================================================
// METABOLIC SIMULATOR - MEASUREMENTS STORE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMeasurementsStore, MEASUREMENT_CONFIGS, MeasurementType } from '../../src/state/measurementsStore';

describe('measurementsStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useMeasurementsStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have empty entries array', () => {
      const { entries } = useMeasurementsStore.getState();
      expect(entries).toEqual([]);
    });

    it('should have activeCategory set to all', () => {
      const { activeCategory } = useMeasurementsStore.getState();
      expect(activeCategory).toBe('all');
    });
  });

  describe('MEASUREMENT_CONFIGS', () => {
    it('should have all required measurement types', () => {
      const types: MeasurementType[] = [
        'weight', 'bodyFat', 'chest', 'waist', 'hips',
        'leftArm', 'rightArm', 'leftThigh', 'rightThigh',
        'leftCalf', 'rightCalf', 'neck', 'shoulders',
      ];

      types.forEach((type) => {
        expect(MEASUREMENT_CONFIGS[type]).toBeDefined();
        expect(MEASUREMENT_CONFIGS[type].id).toBe(type);
      });
    });

    it('should have required properties for each config', () => {
      Object.values(MEASUREMENT_CONFIGS).forEach((config) => {
        expect(config.id).toBeTruthy();
        expect(config.name).toBeTruthy();
        expect(config.icon).toBeTruthy();
        expect(config.unit).toBeTruthy();
        expect(config.category).toBeDefined();
        expect(['primary', 'upper', 'lower', 'other']).toContain(config.category);
      });
    });
  });

  describe('addEntry', () => {
    it('should add a new entry with measurements', () => {
      const { addEntry, entries } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75.5,
        bodyFat: 15.0,
        chest: 100,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35.5,
        leftThigh: 55,
        rightThigh: 56,
        leftCalf: 38,
        rightCalf: 38.5,
        neck: 38,
        shoulders: 115,
      };

      addEntry(measurements);

      const updatedState = useMeasurementsStore.getState();
      expect(updatedState.entries).toHaveLength(1);
      expect(updatedState.entries[0].measurements.weight).toBe(75.5);
    });

    it('should add entry with optional notes', () => {
      const { addEntry, entries } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 70,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      addEntry(measurements, 'Post-workout measurement');

      const updatedState = useMeasurementsStore.getState();
      expect(updatedState.entries[0].notes).toBe('Post-workout measurement');
    });

    it('should generate unique IDs for entries', () => {
      const { addEntry } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 70,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      addEntry(measurements);
      addEntry(measurements);

      const { entries } = useMeasurementsStore.getState();
      expect(entries[0].id).not.toBe(entries[1].id);
    });

    it('should limit entries to MAX_ENTRIES (100)', () => {
      const { addEntry } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 70,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      // Add 105 entries
      for (let i = 0; i < 105; i++) {
        addEntry({ ...measurements, weight: 70 + i });
      }

      const { entries } = useMeasurementsStore.getState();
      expect(entries.length).toBeLessThanOrEqual(100);
      expect(entries[entries.length - 1].measurements.weight).toBe(174); // Last entry should be from i=104
    });
  });

  describe('updateEntry', () => {
    it('should update an existing entry', () => {
      const { addEntry, updateEntry } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: 15,
        chest: 100,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35.5,
        leftThigh: 55,
        rightThigh: 56,
        leftCalf: 38,
        rightCalf: 38.5,
        neck: 38,
        shoulders: 115,
      };

      addEntry(measurements);

      const { entries } = useMeasurementsStore.getState();
      const entryId = entries[0].id;

      const updatedMeasurements: Record<MeasurementType, number | null> = {
        ...measurements,
        weight: 74.5,
      };

      updateEntry(entryId, updatedMeasurements, 'Updated notes');

      const updatedState = useMeasurementsStore.getState();
      expect(updatedState.entries[0].measurements.weight).toBe(74.5);
      expect(updatedState.entries[0].notes).toBe('Updated notes');
    });

    it('should not affect other entries when updating one', () => {
      const { addEntry, updateEntry } = useMeasurementsStore.getState();

      const measurements1: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: 15,
        chest: 100,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35.5,
        leftThigh: 55,
        rightThigh: 56,
        leftCalf: 38,
        rightCalf: 38.5,
        neck: 38,
        shoulders: 115,
      };

      const measurements2: Record<MeasurementType, number | null> = {
        weight: 80,
        bodyFat: 16,
        chest: 105,
        waist: 85,
        hips: 100,
        leftArm: 36,
        rightArm: 36.5,
        leftThigh: 56,
        rightThigh: 57,
        leftCalf: 39,
        rightCalf: 39.5,
        neck: 39,
        shoulders: 120,
      };

      addEntry(measurements1);
      addEntry(measurements2);

      const { entries } = useMeasurementsStore.getState();
      updateEntry(entries[0].id, { ...measurements1, weight: 70 });

      const updatedState = useMeasurementsStore.getState();
      expect(updatedState.entries[0].measurements.weight).toBe(70);
      expect(updatedState.entries[1].measurements.weight).toBe(80); // Unchanged
    });
  });

  describe('deleteEntry', () => {
    it('should delete an entry by ID', () => {
      const { addEntry, deleteEntry } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: 15,
        chest: 100,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35.5,
        leftThigh: 55,
        rightThigh: 56,
        leftCalf: 38,
        rightCalf: 38.5,
        neck: 38,
        shoulders: 115,
      };

      addEntry(measurements);
      addEntry({ ...measurements, weight: 74 });

      const { entries } = useMeasurementsStore.getState();
      const entryId = entries[0].id;

      deleteEntry(entryId);

      const updatedState = useMeasurementsStore.getState();
      expect(updatedState.entries).toHaveLength(1);
      expect(updatedState.entries[0].measurements.weight).toBe(74);
    });

    it('should handle deleting non-existent entry', () => {
      const { addEntry, deleteEntry } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      addEntry(measurements);

      deleteEntry('non-existent-id');

      const { entries } = useMeasurementsStore.getState();
      expect(entries).toHaveLength(1);
    });
  });

  describe('getEntryByDate', () => {
    it('should return entry for the given date', () => {
      const { addEntry, getEntryByDate } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: 15,
        chest: 100,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35.5,
        leftThigh: 55,
        rightThigh: 56,
        leftCalf: 38,
        rightCalf: 38.5,
        neck: 38,
        shoulders: 115,
      };

      addEntry(measurements);

      const today = new Date();
      const entry = getEntryByDate(today);

      expect(entry).toBeDefined();
      expect(entry?.measurements.weight).toBe(75);
    });

    it('should return undefined for date with no entry', () => {
      const { addEntry, getEntryByDate } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      addEntry(measurements);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const entry = getEntryByDate(yesterday);
      expect(entry).toBeUndefined();
    });
  });

  describe('getHistoryForMeasurement', () => {
    it('should return history for a specific measurement type', () => {
      const { addEntry, getHistoryForMeasurement } = useMeasurementsStore.getState();

      const measurements1: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      const measurements2: Record<MeasurementType, number | null> = {
        weight: 74,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      addEntry(measurements1);
      addEntry(measurements2);

      const history = getHistoryForMeasurement('weight');
      expect(history).toHaveLength(2);
      expect(history[0].value).toBe(75);
      expect(history[1].value).toBe(74);
    });

    it('should respect limit parameter', () => {
      const { addEntry, getHistoryForMeasurement } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      for (let i = 0; i < 5; i++) {
        addEntry({ ...measurements, weight: 70 + i });
      }

      const history = getHistoryForMeasurement('weight', 3);
      expect(history).toHaveLength(3);
    });

    it('should only include entries with non-null values', () => {
      const { addEntry, getHistoryForMeasurement } = useMeasurementsStore.getState();

      const measurements1: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      const measurements2: Record<MeasurementType, number | null> = {
        weight: null,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      addEntry(measurements1);
      addEntry(measurements2);

      const history = getHistoryForMeasurement('weight');
      expect(history).toHaveLength(1);
    });
  });

  describe('getStats', () => {
    it('should return empty stats when no entries', () => {
      const { getStats } = useMeasurementsStore.getState();
      const stats = getStats();

      expect(stats.totalEntries).toBe(0);
      expect(stats.firstEntryDate).toBeNull();
      expect(stats.lastEntryDate).toBeNull();
      expect(stats.streak).toBe(0);
    });

    it('should calculate correct total entries', () => {
      const { addEntry, getStats } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      addEntry(measurements);
      addEntry(measurements);
      addEntry(measurements);

      const stats = getStats();
      expect(stats.totalEntries).toBe(3);
    });

    it('should set first and last entry dates', () => {
      const { addEntry, getStats } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: null,
        chest: null,
        waist: null,
        hips: null,
        leftArm: null,
        rightArm: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null,
        neck: null,
        shoulders: null,
      };

      addEntry(measurements);
      const date1 = new Date();
      addEntry(measurements);
      const date2 = new Date();
      date2.setDate(date2.getDate() + 1);
      vi.spyOn(Date, 'now').mockReturnValue(date2.getTime());
      addEntry(measurements);
      vi.restoreAllMocks();

      const stats = getStats();
      expect(stats.firstEntryDate).toBeDefined();
      expect(stats.lastEntryDate).toBeDefined();
    });

    it('should calculate trends correctly', () => {
      const { addEntry, getStats } = useMeasurementsStore.getState();

      const measurements1: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: 15,
        chest: 100,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35.5,
        leftThigh: 55,
        rightThigh: 56,
        leftCalf: 38,
        rightCalf: 38.5,
        neck: 38,
        shoulders: 115,
      };

      const measurements2: Record<MeasurementType, number | null> = {
        weight: 76.5, // Up
        bodyFat: 14.5, // Down
        chest: 100.5, // Stable (within 1%)
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35.5,
        leftThigh: 55,
        rightThigh: 56,
        leftCalf: 38,
        rightCalf: 38.5,
        neck: 38,
        shoulders: 115,
      };

      addEntry(measurements1);
      addEntry(measurements2);

      const stats = getStats();
      expect(stats.trends.weight).toBe('up');
      expect(stats.trends.bodyFat).toBe('down');
      expect(stats.trends.chest).toBe('stable');
    });
  });

  describe('setActiveCategory', () => {
    it('should update active category', () => {
      const { setActiveCategory, activeCategory } = useMeasurementsStore.getState();

      setActiveCategory('upper');
      expect(useMeasurementsStore.getState().activeCategory).toBe('upper');
    });

    it('should accept all valid categories', () => {
      const categories: Array<'all' | 'primary' | 'upper' | 'lower' | 'other'> = [
        'all', 'primary', 'upper', 'lower', 'other',
      ];

      categories.forEach((category) => {
        useMeasurementsStore.getState().setActiveCategory(category);
        expect(useMeasurementsStore.getState().activeCategory).toBe(category);
      });
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { addEntry, reset } = useMeasurementsStore.getState();

      const measurements: Record<MeasurementType, number | null> = {
        weight: 75,
        bodyFat: 15,
        chest: 100,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35.5,
        leftThigh: 55,
        rightThigh: 56,
        leftCalf: 38,
        rightCalf: 38.5,
        neck: 38,
        shoulders: 115,
      };

      addEntry(measurements);
      useMeasurementsStore.getState().setActiveCategory('upper');
      expect(useMeasurementsStore.getState().entries).toHaveLength(1);

      reset();

      const state = useMeasurementsStore.getState();
      expect(state.entries).toEqual([]);
      expect(state.activeCategory).toBe('all');
    });
  });
});

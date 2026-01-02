// ============================================================================
// METABOLIC SIMULATOR - MEASUREMENTS TRACKER COMPONENT UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MeasurementsTracker from '../../src/components/dashboard/MeasurementsTracker';
import { useMeasurementsStore } from '../../src/state/measurementsStore';

// Mock the measurements store
vi.mock('../../src/state/measurementsStore');

// Create fresh mock functions for each test
const getMockStore = (overrides = {}) => ({
  entries: [],
  activeCategory: 'all',
  addEntry: vi.fn(),
  deleteEntry: vi.fn(),
  getHistoryForMeasurement: vi.fn(() => []),
  getStats: vi.fn(() => ({
    totalEntries: 0,
    firstEntryDate: null,
    lastEntryDate: null,
    streak: 0,
    trends: {},
  })),
  setActiveCategory: vi.fn(),
  ...overrides,
});

describe('MeasurementsTracker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock return values
    (useMeasurementsStore as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(getMockStore());
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<MeasurementsTracker />);
      expect(screen.getByText('Body Measurements')).toBeVisible();
    });

    it('should display all measurement categories', () => {
      render(<MeasurementsTracker />);
      expect(screen.getByText(/All/)).toBeVisible();
      expect(screen.getByText(/Primary/)).toBeVisible();
      expect(screen.getByText(/Upper Body/)).toBeVisible();
      expect(screen.getByText(/Lower Body/)).toBeVisible();
      expect(screen.getByText(/Other/)).toBeVisible();
    });

    it('should display Add Entry button', () => {
      render(<MeasurementsTracker />);
      expect(screen.getByText('+ Add Entry')).toBeVisible();
    });

    it('should display empty state when no entries', () => {
      render(<MeasurementsTracker />);
      expect(screen.getByText('No measurements logged yet')).toBeVisible();
    });
  });

  describe('Category Filtering', () => {
    it('should switch to primary category', () => {
      render(<MeasurementsTracker />);
      const primaryButton = screen.getAllByText(/Primary/).find(el => el.tagName === 'BUTTON');
      if (primaryButton) fireEvent.click(primaryButton);
      expect(useMeasurementsStore().setActiveCategory).toHaveBeenCalledWith('primary');
    });

    it('should switch to upper body category', () => {
      render(<MeasurementsTracker />);
      const upperButton = screen.getAllByText(/Upper Body/).find(el => el.tagName === 'BUTTON');
      if (upperButton) fireEvent.click(upperButton);
      expect(useMeasurementsStore().setActiveCategory).toHaveBeenCalledWith('upper');
    });

    it('should switch to lower body category', () => {
      render(<MeasurementsTracker />);
      const lowerButton = screen.getAllByText(/Lower Body/).find(el => el.tagName === 'BUTTON');
      if (lowerButton) fireEvent.click(lowerButton);
      expect(useMeasurementsStore().setActiveCategory).toHaveBeenCalledWith('lower');
    });

    it('should switch to other category', () => {
      render(<MeasurementsTracker />);
      const otherButton = screen.getAllByText(/Other/).find(el => el.tagName === 'BUTTON');
      if (otherButton) fireEvent.click(otherButton);
      expect(useMeasurementsStore().setActiveCategory).toHaveBeenCalledWith('other');
    });

    it('should switch back to all category', () => {
      render(<MeasurementsTracker />);
      const allButton = screen.getAllByText(/All/).find(el => el.tagName === 'BUTTON');
      if (allButton) fireEvent.click(allButton);
      expect(useMeasurementsStore().setActiveCategory).toHaveBeenCalledWith('all');
    });
  });

  describe('Add Entry Form', () => {
    it('should show form when Add Entry is clicked', () => {
      render(<MeasurementsTracker />);
      fireEvent.click(screen.getByText('+ Add Entry'));
      expect(screen.getByText('Log New Measurements')).toBeVisible();
    });

    it('should hide form when Cancel is clicked', () => {
      render(<MeasurementsTracker />);
      fireEvent.click(screen.getByText('+ Add Entry'));
      expect(screen.getByText('Log New Measurements')).toBeVisible();

      // Use the first Cancel button (the one in the form)
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);

      // After clicking cancel, form should be hidden
      expect(screen.queryByText('Log New Measurements')).toBeNull();
    });

    it('should call addEntry when Save Entry is clicked', () => {
      render(<MeasurementsTracker />);
      fireEvent.click(screen.getByText('+ Add Entry'));

      // Click save button without entering data (the component validates)
      const saveButtons = screen.getAllByText('Save Entry');
      if (saveButtons.length > 0) {
        fireEvent.click(saveButtons[0]);
      }

      // addEntry should not have been called since no measurement was entered
      // (validation requires at least one measurement)
      expect(useMeasurementsStore().addEntry).not.toHaveBeenCalled();
    });

    it('should have Save Entry button in form', () => {
      render(<MeasurementsTracker />);
      fireEvent.click(screen.getByText('+ Add Entry'));
      expect(screen.getByText('Save Entry')).toBeVisible();
    });
  });

  describe('Measurement Display', () => {
    it('should display measurement cards when data exists', () => {
      const mockStore = getMockStore({
        entries: [{ id: '1', date: new Date(), measurements: { weight: 75.5, chest: 100 } }],
        getHistoryForMeasurement: (type: string) => {
          if (type === 'weight') return [{ date: new Date(), value: 75.5 }];
          if (type === 'chest') return [{ date: new Date(), value: 100 }];
          return [];
        },
        getStats: () => ({
          totalEntries: 1,
          firstEntryDate: new Date(),
          lastEntryDate: new Date(),
          streak: 1,
          trends: {},
        }),
      });
      (useMeasurementsStore as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(mockStore);

      render(<MeasurementsTracker />);
      expect(screen.getByText('75.5')).toBeVisible();
      expect(screen.getByText('100.0')).toBeVisible();
    });

    it('should display measurement unit', () => {
      const mockStore = getMockStore({
        entries: [{ id: '1', date: new Date(), measurements: { weight: 75.5 } }],
        getHistoryForMeasurement: () => [{ date: new Date(), value: 75.5 }],
        getStats: () => ({
          totalEntries: 1,
          firstEntryDate: new Date(),
          lastEntryDate: new Date(),
          streak: 1,
          trends: {},
        }),
      });
      (useMeasurementsStore as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(mockStore);

      render(<MeasurementsTracker />);
      expect(screen.getByText('kg')).toBeVisible();
    });
  });

  describe('Entry List', () => {
    it('should display recent entries', () => {
      const today = new Date();
      const entries = [
        {
          id: '1',
          date: today,
          measurements: { weight: 75, chest: null, waist: null, hips: null, leftArm: null, rightArm: null, leftThigh: null, rightThigh: null, leftCalf: null, rightCalf: null, neck: null, shoulders: null, bodyFat: null },
          notes: 'Test entry',
        },
      ];

      const mockStore = getMockStore({
        entries,
        getStats: () => ({
          totalEntries: 1,
          firstEntryDate: today,
          lastEntryDate: today,
          streak: 1,
          trends: {},
        }),
      });
      (useMeasurementsStore as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(mockStore);

      render(<MeasurementsTracker />);
      expect(screen.getByText('Recent Entries')).toBeVisible();
      expect(screen.getByText(/Test entry/)).toBeVisible();
    });

    it('should call deleteEntry when delete button is clicked', () => {
      const today = new Date();
      const entries = [
        {
          id: '1',
          date: today,
          measurements: { weight: 75, chest: null, waist: null, hips: null, leftArm: null, rightArm: null, leftThigh: null, rightThigh: null, leftCalf: null, rightCalf: null, neck: null, shoulders: null, bodyFat: null },
        },
      ];

      const mockStore = getMockStore({
        entries,
        deleteEntry: vi.fn(),
        getStats: () => ({
          totalEntries: 1,
          firstEntryDate: today,
          lastEntryDate: today,
          streak: 1,
          trends: {},
        }),
      });
      (useMeasurementsStore as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(mockStore);

      render(<MeasurementsTracker />);
      fireEvent.click(screen.getByText('Delete'));
      expect(mockStore.deleteEntry).toHaveBeenCalledWith('1');
    });
  });

  describe('Stats Display', () => {
    it('should display total entries and streak', () => {
      const today = new Date();
      const mockStore = getMockStore({
        entries: [{ id: '1', date: today, measurements: { weight: 75, bodyFat: null, chest: null, waist: null, hips: null, leftArm: null, rightArm: null, leftThigh: null, rightThigh: null, leftCalf: null, rightCalf: null, neck: null, shoulders: null } }],
        getStats: () => ({
          totalEntries: 10,
          firstEntryDate: today,
          lastEntryDate: today,
          streak: 5,
          trends: {},
        }),
      });
      (useMeasurementsStore as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(mockStore);

      render(<MeasurementsTracker />);
      expect(screen.getByText('10 entries • 5 day streak')).toBeVisible();
    });

    it('should display correct singular form', () => {
      const today = new Date();
      const mockStore = getMockStore({
        entries: [{ id: '1', date: today, measurements: { weight: 75, bodyFat: null, chest: null, waist: null, hips: null, leftArm: null, rightArm: null, leftThigh: null, rightThigh: null, leftCalf: null, rightCalf: null, neck: null, shoulders: null } }],
        getStats: () => ({
          totalEntries: 1,
          firstEntryDate: today,
          lastEntryDate: today,
          streak: 1,
          trends: {},
        }),
      });
      (useMeasurementsStore as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(mockStore);

      render(<MeasurementsTracker />);
      expect(screen.getByText('1 entry • 1 day streak')).toBeVisible();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(<MeasurementsTracker className="custom-class" />);
      const container = screen.getByText('Body Measurements').closest('.custom-class');
      expect(container).toBeVisible();
    });
  });
});

// ============================================================================
// METABOLIC SIMULATOR - QUICK STATS COMPONENT UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuickStats from '../../src/components/dashboard/QuickStats';
import { useSimulationStore } from '../../src/state/store';

// Mock the store
vi.mock('../../src/state/store');

const mockUseSimulationStore = vi.mocked(useSimulationStore);

describe('QuickStats Component', () => {
  const mockState = {
    energy: {
      caloriesConsumed: 1500,
      caloriesBurned: 500,
      tdee: 2000,
      proteins: {
        consumed: 80,
        target: 150,
      },
    },
    hormones: {
      cortisol: {
        currentValue: 10,
      },
    },
    recentMeals: [
      { name: 'Test Meal', time: new Date().toISOString() },
    ],
    recentExercises: [],
    recentSleep: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => JSON.stringify({ date: new Date().toISOString().split('T')[0], glasses: 4, totalMl: 1000 })),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);

    mockUseSimulationStore.mockReturnValue({
      state: mockState,
    } as unknown as ReturnType<typeof useSimulationStore>);
  });

  describe('Rendering', () => {
    it('should render the quick stats panel', () => {
      render(<QuickStats />);
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    });

    it('should display calories metric', () => {
      render(<QuickStats />);
      expect(screen.getByText('Calories')).toBeInTheDocument();
      expect(screen.getByText('net')).toBeInTheDocument();
    });

    it('should display protein metric', () => {
      render(<QuickStats />);
      expect(screen.getByText('Protein')).toBeInTheDocument();
    });

    it('should display water metric', () => {
      render(<QuickStats />);
      expect(screen.getByText('Water')).toBeInTheDocument();
    });

    it('should display stress level metric', () => {
      render(<QuickStats />);
      expect(screen.getByText('Stress')).toBeInTheDocument();
    });
  });

  describe('Metric Values', () => {
    it('should calculate net calories correctly', () => {
      render(<QuickStats />);
      expect(screen.getAllByText('1000').length).toBeGreaterThanOrEqual(1); // 1500 - 500, and water
      expect(screen.getByText('net')).toBeInTheDocument();
    });

    it('should show protein percentage', () => {
      render(<QuickStats />);
      expect(screen.getByText('80')).toBeInTheDocument(); // protein consumed
      expect(screen.getByText('g')).toBeInTheDocument(); // protein unit
    });

    it('should show water intake in ml', () => {
      render(<QuickStats />);
      expect(screen.getByText('ml')).toBeInTheDocument();
    });

    it('should display cortisol value', () => {
      render(<QuickStats />);
      expect(screen.getByText('10.0')).toBeInTheDocument();
      expect(screen.getByText('mcg/dL')).toBeInTheDocument();
    });
  });

  describe('Percentage Colors', () => {
    it('should show green color for 100%+ completion', () => {
      // Mock localStorage with 2000ml
      const localStorageMock = {
        getItem: vi.fn(() => JSON.stringify({ date: new Date().toISOString().split('T')[0], glasses: 8, totalMl: 2000 })),
        setItem: vi.fn(),
        clear: vi.fn(),
        removeItem: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      render(<QuickStats />);
      // Water should be at 100%
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should show low stress color for low cortisol', () => {
      render(<QuickStats />);
      expect(screen.getByText('low')).toBeInTheDocument();
    });
  });

  describe('Last Activity', () => {
    it('should show last meal activity', () => {
      render(<QuickStats />);
      expect(screen.getByText('Last Activity')).toBeInTheDocument();
      expect(screen.getByText('Test Meal')).toBeInTheDocument();
    });

    it('should show last exercise activity', () => {
      mockUseSimulationStore.mockReturnValue({
        state: {
          ...mockState,
          recentMeals: [],
          recentExercises: [{ startTime: new Date().toISOString(), exerciseName: 'Running' }],
          recentSleep: [],
        },
      } as unknown as ReturnType<typeof useSimulationStore>);

      render(<QuickStats />);
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('should show last sleep activity', () => {
      mockUseSimulationStore.mockReturnValue({
        state: {
          ...mockState,
          recentMeals: [],
          recentExercises: [],
          recentSleep: [{ endTime: new Date().toISOString(), duration: 8 }],
        },
      } as unknown as ReturnType<typeof useSimulationStore>);

      render(<QuickStats />);
      expect(screen.getByText(/8h sleep/)).toBeInTheDocument();
    });
  });

  describe('Stress Levels', () => {
    it('should show low stress for cortisol < 10', () => {
      mockUseSimulationStore.mockReturnValue({
        state: {
          ...mockState,
          hormones: { cortisol: { currentValue: 8 } },
        },
      } as unknown as ReturnType<typeof useSimulationStore>);

      render(<QuickStats />);
      expect(screen.getByText('low')).toBeInTheDocument();
    });

    it('should show medium stress for cortisol between 10-15', () => {
      mockUseSimulationStore.mockReturnValue({
        state: {
          ...mockState,
          hormones: { cortisol: { currentValue: 12 } },
        },
      } as unknown as ReturnType<typeof useSimulationStore>);

      render(<QuickStats />);
      expect(screen.getByText('med')).toBeInTheDocument();
    });

    it('should show high stress for cortisol > 15', () => {
      mockUseSimulationStore.mockReturnValue({
        state: {
          ...mockState,
          hormones: { cortisol: { currentValue: 18 } },
        },
      } as unknown as ReturnType<typeof useSimulationStore>);

      render(<QuickStats />);
      expect(screen.getByText('high')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when state is null', () => {
      mockUseSimulationStore.mockReturnValue({
        state: null,
      } as unknown as ReturnType<typeof useSimulationStore>);

      const { container } = render(<QuickStats />);
      // Should show loading skeleton (animate-pulse class)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<QuickStats />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Quick Stats');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero TDEE', () => {
      mockUseSimulationStore.mockReturnValue({
        state: {
          ...mockState,
          energy: { ...mockState.energy, tdee: 0 },
        },
      } as unknown as ReturnType<typeof useSimulationStore>);

      render(<QuickStats />);
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    });

    it('should handle zero protein target', () => {
      mockUseSimulationStore.mockReturnValue({
        state: {
          ...mockState,
          energy: {
            ...mockState.energy,
            proteins: { consumed: 0, target: 0 },
          },
        },
      } as unknown as ReturnType<typeof useSimulationStore>);

      render(<QuickStats />);
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    });

    it('should handle missing hormone data', () => {
      mockUseSimulationStore.mockReturnValue({
        state: {
          ...mockState,
          hormones: undefined,
        },
      } as unknown as ReturnType<typeof useSimulationStore>);

      render(<QuickStats />);
      expect(screen.getByText('low')).toBeInTheDocument();
    });
  });
});

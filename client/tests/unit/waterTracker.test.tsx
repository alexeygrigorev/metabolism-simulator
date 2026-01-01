// ============================================================================
// METABOLIC SIMULATOR - WATER TRACKER TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import WaterTracker from '../../src/components/dashboard/WaterTracker';
import { useSimulationStore } from '../../src/state/store';

// Mock the simulation store
vi.mock('../../src/state/store', () => ({
  useSimulationStore: vi.fn(),
}));

const mockLogMeal = vi.fn();
const mockUseSimulationStore = useSimulationStore as unknown as {
  mockReturnValue: (obj: unknown) => void;
};

describe('WaterTracker Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();

    // Setup default store mock
    mockUseSimulationStore.mockReturnValue({
      logMeal: mockLogMeal,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should render with empty state on first load', () => {
      render(<WaterTracker />);

      expect(screen.getByText('Water Intake')).toBeInTheDocument();
      expect(screen.getByText('0ml / 2000ml daily goal')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('Start Hydrating')).toBeInTheDocument();
    });

    it('should display 8 empty glass indicators', () => {
      render(<WaterTracker />);

      // Use getAllByRole for individual glass buttons with numbered aria-labels
      const glassButtons = screen.getAllByRole('button', { name: /Add glass \d+/i });
      expect(glassButtons).toHaveLength(8);
    });

    it('should show hydration tip for starting', () => {
      render(<WaterTracker />);

      expect(screen.getByText(/Start your day with water/i)).toBeInTheDocument();
    });
  });

  describe('Adding Water', () => {
    it('should increment water count when adding a glass', async () => {
      render(<WaterTracker />);

      // Use the main Add Glass button in the action buttons section
      const addButton = screen.getByRole('button', { name: /\+ Add Glass/ });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText('250ml / 2000ml daily goal')).toBeInTheDocument();
        expect(screen.getByText('13%')).toBeInTheDocument(); // 250/2000 = 12.5% -> 13%
      });
    });

    it('should call logMeal when adding a glass', async () => {
      render(<WaterTracker />);

      const addButton = screen.getByRole('button', { name: /\+ Add Glass/ });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(mockLogMeal).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Water (250ml)',
            totalMacros: expect.objectContaining({ water: 250 }),
          })
        );
      });
    });

    it('should update glass indicators when adding water', async () => {
      render(<WaterTracker />);

      const addButton = screen.getByRole('button', { name: /\+ Add Glass/ });

      // Add first glass
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const filledGlasses = screen.getAllByTitle('Remove glass');
        expect(filledGlasses.length).toBe(1);
      });

      // Add second glass
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const filledGlasses = screen.getAllByTitle('Remove glass');
        expect(filledGlasses.length).toBe(2);
      });
    });

    it('should disable add button when goal is reached', async () => {
      // Set completed state in localStorage
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 8,
        totalMl: 2000,
      }));

      render(<WaterTracker />);

      const addButton = screen.getByRole('button', { name: /\+ Add Glass/ });
      expect(addButton).toBeDisabled();
    });

    it('should show celebration when goal is reached', async () => {
      // Set nearly completed state
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 7,
        totalMl: 1750,
      }));

      render(<WaterTracker />);

      expect(screen.getByText('88%')).toBeInTheDocument();

      // Add final glass
      const addButton = screen.getByRole('button', { name: /\+ Add Glass/ });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
        expect(screen.getByText('Daily goal reached! 🎉')).toBeInTheDocument();
        // Check for the tip text with exact content
        expect(screen.getByText('Excellent hydration! Your body will thank you.')).toBeInTheDocument();
      });
    });
  });

  describe('Removing Water', () => {
    it('should decrement water count when removing a glass', async () => {
      // Set initial state with 2 glasses
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 2,
        totalMl: 500,
      }));

      render(<WaterTracker />);

      expect(screen.getByText('500ml / 2000ml daily goal')).toBeInTheDocument();

      // Use title attribute to find remove button
      const removeButton = screen.getByTitle('Remove last glass');
      await act(async () => {
        fireEvent.click(removeButton);
      });

      await waitFor(() => {
        expect(screen.getByText('250ml / 2000ml daily goal')).toBeInTheDocument();
      });
    });

    it('should disable remove button when no glasses consumed', () => {
      render(<WaterTracker />);

      // Find the button with the minus sign that's disabled
      const removeButtons = screen.getAllByTitle('Remove last glass');
      const disabledButton = removeButtons.find(b => b === document.querySelector('button[disabled]')) || removeButtons[0];
      expect(disabledButton).toBeDisabled();
    });

    it('should update filled glass indicator when removing', async () => {
      // Set initial state
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 3,
        totalMl: 750,
      }));

      render(<WaterTracker />);

      let filledGlasses = screen.getAllByTitle('Remove glass');
      expect(filledGlasses.length).toBe(3);

      const removeButton = screen.getByTitle('Remove last glass');
      await act(async () => {
        fireEvent.click(removeButton);
      });

      await waitFor(() => {
        filledGlasses = screen.getAllByTitle('Remove glass');
        expect(filledGlasses.length).toBe(2);
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset water intake when clicking reset', async () => {
      // Set initial state
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 5,
        totalMl: 1250,
      }));

      render(<WaterTracker />);

      expect(screen.getByText('1250ml / 2000ml daily goal')).toBeInTheDocument();

      const resetButton = screen.getByTitle("Reset today's intake");
      await act(async () => {
        fireEvent.click(resetButton);
      });

      await waitFor(() => {
        expect(screen.getByText('0ml / 2000ml daily goal')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });
  });

  describe('Clicking Glass Indicators', () => {
    it('should add glass when clicking empty glass', async () => {
      render(<WaterTracker />);

      const emptyGlasses = screen.getAllByRole('button', { name: /Add glass \d+/i });
      await act(async () => {
        fireEvent.click(emptyGlasses[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('250ml / 2000ml daily goal')).toBeInTheDocument();
      });
    });

    it('should remove glass when clicking filled glass', async () => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 4,
        totalMl: 1000,
      }));

      render(<WaterTracker />);

      const filledGlasses = screen.getAllByTitle('Remove glass');
      await act(async () => {
        fireEvent.click(filledGlasses[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('750ml / 2000ml daily goal')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Status Messages', () => {
    it('should show correct status at 0%', () => {
      render(<WaterTracker />);
      expect(screen.getByText('Start Hydrating')).toBeInTheDocument();
    });

    it('should show correct status at 25%', () => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 2,
        totalMl: 500,
      }));

      render(<WaterTracker />);
      expect(screen.getByText('Keep Drinking')).toBeInTheDocument();
    });

    it('should show correct status at 50%', () => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 4,
        totalMl: 1000,
      }));

      render(<WaterTracker />);
      expect(screen.getByText('Good Progress')).toBeInTheDocument();
    });

    it('should show correct status at 75%', () => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 6,
        totalMl: 1500,
      }));

      render(<WaterTracker />);
      expect(screen.getByText('Almost There')).toBeInTheDocument();
    });

    it('should show correct status at 100%', () => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 8,
        totalMl: 2000,
      }));

      render(<WaterTracker />);
      expect(screen.getByText('Hydrated')).toBeInTheDocument();
    });
  });

  describe('Persistence', () => {
    it('should save state to localStorage when adding glass', async () => {
      render(<WaterTracker />);

      const addButton = screen.getByRole('button', { name: /\+ Add Glass/ });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const stored = localStorage.getItem('metabol-sim-water-intake');
        expect(stored).toBeDefined();
        const data = JSON.parse(stored!);
        expect(data.glasses).toBe(1);
        expect(data.totalMl).toBe(250);
      });
    });

    it('should load state from localStorage on mount', () => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 5,
        totalMl: 1250,
      }));

      render(<WaterTracker />);

      expect(screen.getByText('1250ml / 2000ml daily goal')).toBeInTheDocument();
      expect(screen.getByText('63%')).toBeInTheDocument(); // 1250/2000 = 62.5% -> 63%
    });

    it('should reset on new day', () => {
      // Set old date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: yesterdayStr,
        glasses: 8,
        totalMl: 2000,
      }));

      render(<WaterTracker />);

      // Should start fresh for new day
      expect(screen.getByText('0ml / 2000ml daily goal')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<WaterTracker />);

      // Check for button labels with specific patterns
      expect(screen.getByRole('button', { name: /\+ Add Glass/ })).toBeInTheDocument();
      expect(screen.getByTitle('Remove last glass')).toBeInTheDocument();
      expect(screen.getByTitle("Reset today's intake")).toBeInTheDocument();
    });

    it('should have proper glass button labels', () => {
      render(<WaterTracker />);

      // Empty glasses should have numbered "Add glass" labels
      expect(screen.getByRole('button', { name: /Add glass 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add glass 8/i })).toBeInTheDocument();
    });
  });

  describe('Remaining Glasses Display', () => {
    it('should show correct remaining glasses count', () => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 3,
        totalMl: 750,
      }));

      render(<WaterTracker />);

      expect(screen.getByText('5 more glasses to reach goal')).toBeInTheDocument();
    });

    it('should show goal reached message when complete', () => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('metabol-sim-water-intake', JSON.stringify({
        date: today,
        glasses: 8,
        totalMl: 2000,
      }));

      render(<WaterTracker />);

      expect(screen.getByText('Daily goal reached! 🎉')).toBeInTheDocument();
    });
  });
});

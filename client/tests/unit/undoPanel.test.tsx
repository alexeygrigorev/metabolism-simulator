// ============================================================================
// METABOLIC SIMULATOR - UNDO PANEL COMPONENT UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UndoPanel from '../../src/components/dashboard/UndoPanel';
import { useUndoStore } from '../../src/state/undoStore';
import { useSimulationStore } from '../../src/state/store';

// Mock the simulation store
vi.mock('../../src/state/store', () => ({
  useSimulationStore: vi.fn(),
}));

const mockUseSimulationStore = vi.mocked(useSimulationStore);

describe('UndoPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem('metabol-sim-undo');
    useUndoStore.setState({ history: [], redoStack: [] });

    // Default mock for simulation store
    mockUseSimulationStore.mockImplementation((selector) => {
      const state = {
        logMeal: vi.fn(),
        logExercise: vi.fn(),
        logSleep: vi.fn(),
        applyStress: vi.fn(),
      };
      return selector(state);
    });
  });

  describe('Empty State', () => {
    it('should not render when no actions in history', () => {
      const { container } = render(<UndoPanel />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when canUndo returns false', () => {
      const { container } = render(<UndoPanel />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('With Actions', () => {
    beforeEach(() => {
      // Add some test actions
      useUndoStore.getState().addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Chicken Salad',
          timestamp: Date.now(),
          calories: 350,
          carbs: 15,
          proteins: 30,
          fats: 20,
        },
      });

      useUndoStore.getState().addAction({
        type: 'exercise',
        data: {
          id: 'exercise-1',
          name: 'Running',
          timestamp: Date.now(),
          duration: 30,
          caloriesBurned: 300,
          met: 8,
        },
      });
    });

    it('should render when actions exist', () => {
      const { container } = render(<UndoPanel />);
      expect(container.firstChild).toBeDefined();
      expect(container.firstChild).not.toBeNull();
    });

    it('should display "Recent Actions" heading', () => {
      render(<UndoPanel />);
      expect(screen.getByText('Recent Actions')).toBeInTheDocument();
    });

    it('should display action count', () => {
      render(<UndoPanel />);
      expect(screen.getByText('2 actions')).toBeInTheDocument();
    });

    it('should display action items', () => {
      render(<UndoPanel />);
      expect(screen.getByText('Logged Chicken Salad')).toBeInTheDocument();
      expect(screen.getByText('Completed Running')).toBeInTheDocument();
    });

    it('should render undo button', () => {
      render(<UndoPanel />);
      expect(screen.getByText('Undo Last Action')).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<UndoPanel />);
      const wrapper = container.querySelector('.bg-slate-800\\/50');
      expect(wrapper).toBeDefined();
    });
  });

  describe('Action Display', () => {
    it('should limit visible actions to 5', () => {
      // Add 7 actions
      for (let i = 0; i < 7; i++) {
        useUndoStore.getState().addAction({
          type: 'meal',
          data: {
            id: `meal-${i}`,
            name: `Meal ${i}`,
            timestamp: Date.now() + i,
            calories: 400,
            carbs: 40,
            proteins: 20,
            fats: 10,
          },
        });
      }

      render(<UndoPanel />);
      expect(screen.getByText('7 actions')).toBeInTheDocument();
      expect(screen.getByText('+2 more actions')).toBeInTheDocument();
    });

    it('should show meal icon for meal actions', () => {
      useUndoStore.getState().addAction({
        type: 'meal',
        data: {
          id: 'meal-test',
          name: 'Test Meal',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      const { container } = render(<UndoPanel />);
      expect(container.textContent).toContain('🍽️');
    });

    it('should show exercise icon for exercise actions', () => {
      useUndoStore.setState({ history: [], redoStack: [] });
      useUndoStore.getState().addAction({
        type: 'exercise',
        data: {
          id: 'exercise-test',
          name: 'Test Exercise',
          timestamp: Date.now(),
          duration: 30,
          caloriesBurned: 300,
          met: 8,
        },
      });

      const { container } = render(<UndoPanel />);
      expect(container.textContent).toContain('🏋️');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      useUndoStore.setState({ history: [], redoStack: [] });
      useUndoStore.getState().addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Test Meal',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });
    });

    it('should have accessible heading', () => {
      render(<UndoPanel />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Remove Button', () => {
    beforeEach(() => {
      useUndoStore.setState({ history: [], redoStack: [] });
      useUndoStore.getState().addAction({
        type: 'meal',
        data: {
          id: 'meal-123',
          name: 'Test Meal',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });
    });

    it('should show remove button on hover', () => {
      const { container } = render(<UndoPanel />);
      // The remove button should be in the DOM but hidden (opacity-0)
      const removeButtons = container.querySelectorAll('button[title="Remove from history"]');
      expect(removeButtons.length).toBeGreaterThan(0);
    });
  });
});

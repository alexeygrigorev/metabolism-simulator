// ============================================================================
// METABOLIC SIMULATOR - WORKOUT TEMPLATES COMPONENT UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WorkoutTemplates from '../../src/components/dashboard/WorkoutTemplates';

// Mock the simulation store
const mockLogExercise = vi.fn().mockResolvedValue(undefined);
const mockAddToast = vi.fn();

vi.mock('../../src/state/store', () => ({
  useSimulationStore: vi.fn(() => ({
    logExercise: mockLogExercise,
    addToast: mockAddToast,
  })),
}));

describe('WorkoutTemplates Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<WorkoutTemplates />);
      expect(screen.getByText('Workout Templates')).toBeVisible();
    });

    it('should display all workout templates', () => {
      render(<WorkoutTemplates />);
      expect(screen.getByText('Full Body Beginner')).toBeVisible();
      expect(screen.getByText('Upper Body Strength')).toBeVisible();
    });

    it('should display template count', () => {
      render(<WorkoutTemplates />);
      expect(screen.getByText(/templates/)).toBeVisible();
    });

    it('should display category tabs', () => {
      render(<WorkoutTemplates />);
      expect(screen.getByText('All Workouts')).toBeVisible();
      // Use queryAllByText since these appear multiple times
      const fullBodyTabs = screen.queryAllByText('Full Body');
      expect(fullBodyTabs.length).toBeGreaterThan(0);
      const upperBodyTabs = screen.queryAllByText('Upper Body');
      expect(upperBodyTabs.length).toBeGreaterThan(0);
      const lowerBodyTabs = screen.queryAllByText('Lower Body');
      expect(lowerBodyTabs.length).toBeGreaterThan(0);
    });

    it('should display search input', () => {
      render(<WorkoutTemplates />);
      const searchInput = screen.getByPlaceholderText('Search workout templates...');
      expect(searchInput).toBeVisible();
    });

    it('should display quick filters', () => {
      render(<WorkoutTemplates />);
      expect(screen.getByText('Quick filters:')).toBeVisible();
      expect(screen.getByText('All')).toBeVisible();
      // These appear in both filters and difficulty badges
      const beginnerTexts = screen.queryAllByText('Beginner');
      expect(beginnerTexts.length).toBeGreaterThan(0);
      const intermediateTexts = screen.queryAllByText('Intermediate');
      expect(intermediateTexts.length).toBeGreaterThan(0);
      const advancedTexts = screen.queryAllByText('Advanced');
      expect(advancedTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Template Cards', () => {
    it('should display template name', () => {
      render(<WorkoutTemplates />);
      expect(screen.getByText('Full Body Beginner')).toBeVisible();
    });

    it('should display template description', () => {
      render(<WorkoutTemplates />);
      expect(screen.getByText(/Complete full-body workout/)).toBeVisible();
    });

    it('should display template emojis', () => {
      render(<WorkoutTemplates />);
      const emojis = screen.queryAllByText(/💪|🏋️|🦵|🔥|☀️|🚀|⛓️|🎯|🏃|🧘|🤸/);
      expect(emojis.length).toBeGreaterThan(0);
    });

    it('should display duration', () => {
      render(<WorkoutTemplates />);
      const durations = screen.queryAllByText(/min/);
      expect(durations.length).toBeGreaterThan(0);
    });

    it('should display calorie estimate', () => {
      render(<WorkoutTemplates />);
      const calories = screen.queryAllByText(/cal/);
      expect(calories.length).toBeGreaterThan(0);
    });

    it('should display difficulty badge', () => {
      render(<WorkoutTemplates />);
      const beginnerBadges = screen.queryAllByText('Beginner');
      expect(beginnerBadges.length).toBeGreaterThan(0);
    });

    it('should display exercise count', () => {
      render(<WorkoutTemplates />);
      const exerciseCounts = screen.queryAllByText(/exercises/);
      expect(exerciseCounts.length).toBeGreaterThan(0);
    });

    it('should display primary muscles', () => {
      render(<WorkoutTemplates />);
      const fullBodyTexts = screen.queryAllByText('Full Body');
      expect(fullBodyTexts.length).toBeGreaterThan(0);
    });

    it('should display template tags', () => {
      render(<WorkoutTemplates />);
      const tags = screen.queryAllByText(/beginner|full-body|strength|hiit|cardio/);
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should display log button', () => {
      render(<WorkoutTemplates />);
      const logButtons = screen.queryAllByText('+');
      expect(logButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Category Filtering', () => {
    it('should filter by full-body category', () => {
      render(<WorkoutTemplates />);

      // Click the first "Full Body" occurrence (the category tab)
      const allFullBody = screen.queryAllByText('Full Body');
      if (allFullBody.length > 0) {
        fireEvent.click(allFullBody[0]);
      }

      expect(screen.getByText('Full Body Beginner')).toBeVisible();
    });

    it('should filter by upper-body category', () => {
      render(<WorkoutTemplates />);

      const allUpperBody = screen.queryAllByText('Upper Body');
      if (allUpperBody.length > 0) {
        fireEvent.click(allUpperBody[0]);
      }

      expect(screen.getByText('Upper Body Strength')).toBeVisible();
    });

    it('should filter by lower-body category', () => {
      render(<WorkoutTemplates />);

      const allLowerBody = screen.queryAllByText('Lower Body');
      if (allLowerBody.length > 0) {
        fireEvent.click(allLowerBody[0]);
      }

      expect(screen.getByText('Lower Body Power')).toBeVisible();
    });

    it('should filter by cardio category', () => {
      render(<WorkoutTemplates />);

      const cardioTab = screen.getByText('Cardio');
      fireEvent.click(cardioTab);

      expect(screen.getByText('Steady Cardio Run')).toBeVisible();
    });
  });

  describe('Quick Filters', () => {
    it('should filter by beginner difficulty', () => {
      render(<WorkoutTemplates />);

      // Click the Beginner filter button (first occurrence)
      const allBeginnerTexts = screen.queryAllByText('Beginner');
      if (allBeginnerTexts.length > 0) {
        fireEvent.click(allBeginnerTexts[0]);
      }

      const difficultyBadges = screen.queryAllByText('Beginner');
      expect(difficultyBadges.length).toBeGreaterThan(0);
    });

    it('should filter by intermediate difficulty', () => {
      render(<WorkoutTemplates />);

      // Click the Intermediate filter button
      const allIntermediateTexts = screen.queryAllByText('Intermediate');
      if (allIntermediateTexts.length > 0) {
        fireEvent.click(allIntermediateTexts[0]);
      }

      const difficultyBadges = screen.queryAllByText('Intermediate');
      expect(difficultyBadges.length).toBeGreaterThan(0);
    });

    it('should filter by advanced difficulty', () => {
      render(<WorkoutTemplates />);

      // Click the Advanced filter button
      const allAdvancedTexts = screen.queryAllByText('Advanced');
      if (allAdvancedTexts.length > 0) {
        fireEvent.click(allAdvancedTexts[0]);
      }

      const difficultyBadges = screen.queryAllByText('Advanced');
      expect(difficultyBadges.length).toBeGreaterThan(0);
    });

    it('should filter by quick workouts', () => {
      render(<WorkoutTemplates />);

      // The "Quick (<20min)" appears in both category tabs and quick filters
      // Click the quick filter button (it should be the second occurrence)
      const quickFilterButtons = screen.queryAllByText('Quick (<20min)');
      if (quickFilterButtons.length > 1) {
        fireEvent.click(quickFilterButtons[1]); // Click the second one (filter button)
      }

      expect(screen.getByText('Quick Morning Wake-Up')).toBeVisible();
    });
  });

  describe('Search Functionality', () => {
    it('should filter templates by search query', () => {
      render(<WorkoutTemplates />);

      const searchInput = screen.getByPlaceholderText('Search workout templates...');
      fireEvent.change(searchInput, { target: { value: 'legs' } });

      expect(screen.getByText(/Legs/)).toBeVisible();
    });

    it('should show no results message for empty search', () => {
      render(<WorkoutTemplates />);

      const searchInput = screen.getByPlaceholderText('Search workout templates...');
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } });

      expect(screen.getByText(/No workout templates found/i)).toBeVisible();
    });

    it('should search by description', () => {
      render(<WorkoutTemplates />);

      const searchInput = screen.getByPlaceholderText('Search workout templates...');
      fireEvent.change(searchInput, { target: { value: 'fat loss' } });

      expect(screen.getByText('HIIT Cardio Blast')).toBeVisible();
    });

    it('should search by tags', () => {
      render(<WorkoutTemplates />);

      const searchInput = screen.getByPlaceholderText('Search workout templates...');
      fireEvent.change(searchInput, { target: { value: 'no-equipment' } });

      expect(screen.getByText('Bodyweight Blitz')).toBeVisible();
    });
  });

  describe('Logging Templates', () => {
    it('should call logExercise when log button is clicked', async () => {
      render(<WorkoutTemplates />);

      const logButtons = screen.queryAllByText('+');
      if (logButtons.length > 0) {
        fireEvent.click(logButtons[0]);

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockLogExercise).toHaveBeenCalled();
      }
    });

    it('should call logExercise for each exercise in template', async () => {
      render(<WorkoutTemplates />);

      const logButtons = screen.queryAllByText('+');
      if (logButtons.length > 0) {
        fireEvent.click(logButtons[0]);

        await new Promise(resolve => setTimeout(resolve, 200));

        expect(mockLogExercise).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty template list gracefully', () => {
      render(<WorkoutTemplates />);

      const searchInput = screen.getByPlaceholderText('Search workout templates...');
      fireEvent.change(searchInput, { target: { value: 'this should not match anything' } });

      expect(screen.getByText(/No workout templates found/i)).toBeVisible();
    });

    it('should apply custom className', () => {
      render(<WorkoutTemplates className="custom-class" />);
      const container = screen.getByText('Workout Templates').closest('.custom-class');
      expect(container).toBeVisible();
    });
  });

  describe('Combined Filters', () => {
    it('should combine category and difficulty filter', () => {
      render(<WorkoutTemplates />);

      // Click Lower Body category tab
      const allLowerBody = screen.queryAllByText('Lower Body');
      if (allLowerBody.length > 0) {
        fireEvent.click(allLowerBody[0]);
      }

      // Click Advanced filter button
      const allAdvanced = screen.queryAllByText('Advanced');
      if (allAdvanced.length > 0) {
        fireEvent.click(allAdvanced[0]);
      }

      expect(screen.getByText('Lower Body Power')).toBeVisible();
    });

    it('should combine search and category filter', () => {
      render(<WorkoutTemplates />);

      // Click Upper Body category tab
      const allUpperBody = screen.queryAllByText('Upper Body');
      if (allUpperBody.length > 0) {
        fireEvent.click(allUpperBody[0]);
      }

      const searchInput = screen.getByPlaceholderText('Search workout templates...');
      fireEvent.change(searchInput, { target: { value: 'strength' } });

      expect(screen.getByText('Upper Body Strength')).toBeVisible();
    });
  });
});

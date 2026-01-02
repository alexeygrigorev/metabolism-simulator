// ============================================================================
// METABOLIC SIMULATOR - QUICK ACTIONS TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import QuickActions from '../../src/components/dashboard/QuickActions';
import { useFavoritesStore } from '../../src/state/favoritesStore';

// Mock the simulation store
vi.mock('../../src/state/store', () => ({
  useSimulationStore: () => ({
    logExercise: vi.fn(),
    logMeal: vi.fn(),
  }),
}));

describe('QuickActions', () => {
  beforeEach(() => {
    // Reset stores before each test
    useFavoritesStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render the quick actions panel', () => {
      render(<QuickActions />);
      expect(screen.getByTestId('quick-actions-panel')).toBeVisible();
    });

    it('should display the panel header with lightning icon', () => {
      render(<QuickActions />);
      expect(screen.getByText('Quick Actions')).toBeVisible();
    });

    it('should show empty state when no favorites', () => {
      render(<QuickActions />);
      expect(screen.getByText(/No quick actions yet/i)).toBeVisible();
    });

    it('should display favorite exercises', () => {
      const { addFavoriteExercise } = useFavoritesStore.getState();
      addFavoriteExercise({
        exerciseId: 'squat-barbell',
        exerciseName: 'Barbell Squat',
        category: 'Resistance',
        defaultDuration: 30,
      });

      render(<QuickActions />);
      expect(screen.getByText('Barbell Squat')).toBeVisible();
      expect(screen.getByText('Exercises')).toBeVisible();
    });

    it('should display favorite meals', () => {
      const { addFavoriteMeal } = useFavoritesStore.getState();
      addFavoriteMeal({
        name: 'Chicken Breast',
        macros: { carbohydrates: 0, proteins: 31, fats: 3.6, fiber: 0 },
        glycemicLoad: 0,
      });

      render(<QuickActions />);
      expect(screen.getByText('Chicken Breast')).toBeVisible();
      expect(screen.getByText('Meals')).toBeVisible();
    });

    it('should show correct count of saved items', () => {
      const { addFavoriteExercise, addFavoriteMeal } = useFavoritesStore.getState();
      addFavoriteExercise({
        exerciseId: 'squat-barbell',
        exerciseName: 'Barbell Squat',
        category: 'Resistance',
        defaultDuration: 30,
      });
      addFavoriteMeal({
        name: 'Chicken Breast',
        macros: { carbohydrates: 0, proteins: 31, fats: 3.6, fiber: 0 },
        glycemicLoad: 0,
      });

      render(<QuickActions />);
      expect(screen.getByText('2 saved')).toBeVisible();
    });
  });

  describe('Exercise Actions', () => {
    it('should remove exercise from favorites when clicking X', () => {
      const { addFavoriteExercise, removeFavoriteExercise, isExerciseFavorite } = useFavoritesStore.getState();
      addFavoriteExercise({
        exerciseId: 'squat-barbell',
        exerciseName: 'Barbell Squat',
        category: 'Resistance',
        defaultDuration: 30,
      });

      expect(isExerciseFavorite('squat-barbell')).toBe(true);

      render(<QuickActions />);

      // Find and click the remove button (it appears on hover)
      const removeButton = screen.getByText('✕');
      fireEvent.click(removeButton);

      expect(isExerciseFavorite('squat-barbell')).toBe(false);
    });

    it('should show exercise duration', () => {
      const { addFavoriteExercise } = useFavoritesStore.getState();
      addFavoriteExercise({
        exerciseId: 'yoga-flow',
        exerciseName: 'Yoga Flow',
        category: 'Flexibility',
        defaultDuration: 45,
      });

      render(<QuickActions />);
      expect(screen.getByText('45 min')).toBeVisible();
    });
  });

  describe('Meal Actions', () => {
    it('should remove meal from favorites when clicking X', () => {
      const { addFavoriteMeal, removeFavoriteMeal, isMealFavorite } = useFavoritesStore.getState();
      addFavoriteMeal({
        name: 'Oatmeal',
        macros: { carbohydrates: 50, proteins: 10, fats: 5, fiber: 8 },
        glycemicLoad: 40,
      });

      expect(isMealFavorite('Oatmeal')).toBe(true);

      render(<QuickActions />);

      // Find and click the remove button
      const removeButton = screen.getAllByText('✕')[0];
      fireEvent.click(removeButton);

      expect(isMealFavorite('Oatmeal')).toBe(false);
    });

    it('should show meal macros', () => {
      const { addFavoriteMeal } = useFavoritesStore.getState();
      addFavoriteMeal({
        name: 'Chicken Breast',
        macros: { carbohydrates: 0, proteins: 31, fats: 3.6, fiber: 0 },
        glycemicLoad: 0,
      });

      render(<QuickActions />);
      expect(screen.getByText(/31g P/)).toBeVisible();
      expect(screen.getByText(/0g C/)).toBeVisible();
    });
  });

  describe('Duplicate Prevention', () => {
    it('should not add duplicate favorite exercises', () => {
      const { addFavoriteExercise } = useFavoritesStore.getState();

      addFavoriteExercise({
        exerciseId: 'squat-barbell',
        exerciseName: 'Barbell Squat',
        category: 'Resistance',
        defaultDuration: 30,
      });

      addFavoriteExercise({
        exerciseId: 'squat-barbell',
        exerciseName: 'Barbell Squat',
        category: 'Resistance',
        defaultDuration: 30,
      });

      const { favoriteExercises } = useFavoritesStore.getState();
      expect(favoriteExercises.length).toBe(1);
    });

    it('should not add duplicate favorite meals', () => {
      const { addFavoriteMeal } = useFavoritesStore.getState();

      addFavoriteMeal({
        name: 'Chicken Breast',
        macros: { carbohydrates: 0, proteins: 31, fats: 3.6, fiber: 0 },
        glycemicLoad: 0,
      });

      addFavoriteMeal({
        name: 'Chicken Breast',
        macros: { carbohydrates: 0, proteins: 31, fats: 3.6, fiber: 0 },
        glycemicLoad: 0,
      });

      const { favoriteMeals } = useFavoritesStore.getState();
      expect(favoriteMeals.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty favorite lists gracefully', () => {
      render(<QuickActions />);
      expect(screen.getByText(/No quick actions yet/i)).toBeVisible();
      expect(screen.queryByText('Exercises')).not.toBeInTheDocument();
      expect(screen.queryByText('Meals')).not.toBeInTheDocument();
    });

    it('should handle only exercises (no meals)', () => {
      const { addFavoriteExercise } = useFavoritesStore.getState();
      addFavoriteExercise({
        exerciseId: 'squat-barbell',
        exerciseName: 'Barbell Squat',
        category: 'Resistance',
        defaultDuration: 30,
      });

      render(<QuickActions />);
      expect(screen.getByText('Exercises')).toBeVisible();
      expect(screen.queryByText('Meals')).not.toBeInTheDocument();
    });

    it('should handle only meals (no exercises)', () => {
      const { addFavoriteMeal } = useFavoritesStore.getState();
      addFavoriteMeal({
        name: 'Chicken Breast',
        macros: { carbohydrates: 0, proteins: 31, fats: 3.6, fiber: 0 },
        glycemicLoad: 0,
      });

      render(<QuickActions />);
      expect(screen.getByText('Meals')).toBeVisible();
      expect(screen.queryByText('Exercises')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<QuickActions className="custom-class" />);
      expect(screen.getByTestId('quick-actions-panel')).toHaveClass('custom-class');
    });
  });
});

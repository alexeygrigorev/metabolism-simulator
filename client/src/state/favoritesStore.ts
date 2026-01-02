// ============================================================================
// METABOLIC SIMULATOR - FAVORITES STORE
// ============================================================================
//
// Manages user's favorite exercises and meals for quick access.
// Persists to localStorage.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteExercise {
  exerciseId: string;
  exerciseName: string;
  category: string;
  defaultDuration: number; // minutes
}

export interface FavoriteMeal {
  name: string;
  macros: {
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
  };
  glycemicLoad: number;
}

interface FavoritesState {
  favoriteExercises: FavoriteExercise[];
  favoriteMeals: FavoriteMeal[];

  // Actions
  addFavoriteExercise: (exercise: FavoriteExercise) => void;
  removeFavoriteExercise: (exerciseId: string) => void;
  isExerciseFavorite: (exerciseId: string) => boolean;
  addFavoriteMeal: (meal: FavoriteMeal) => void;
  removeFavoriteMeal: (mealName: string) => void;
  isMealFavorite: (mealName: string) => boolean;
  reset: () => void;
}

const DEFAULT_STATE: FavoritesState = {
  favoriteExercises: [],
  favoriteMeals: [],
  addFavoriteExercise: () => {},
  removeFavoriteExercise: () => {},
  isExerciseFavorite: () => false,
  addFavoriteMeal: () => {},
  removeFavoriteMeal: () => {},
  isMealFavorite: () => false,
  reset: () => {},
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      addFavoriteExercise: (exercise: FavoriteExercise) => {
        const { favoriteExercises } = get();
        if (!favoriteExercises.some(e => e.exerciseId === exercise.exerciseId)) {
          set({ favoriteExercises: [...favoriteExercises, exercise] });
        }
      },

      removeFavoriteExercise: (exerciseId: string) => {
        const { favoriteExercises } = get();
        set({ favoriteExercises: favoriteExercises.filter(e => e.exerciseId !== exerciseId) });
      },

      isExerciseFavorite: (exerciseId: string) => {
        const { favoriteExercises } = get();
        return favoriteExercises.some(e => e.exerciseId === exerciseId);
      },

      addFavoriteMeal: (meal: FavoriteMeal) => {
        const { favoriteMeals } = get();
        if (!favoriteMeals.some(m => m.name === meal.name)) {
          set({ favoriteMeals: [...favoriteMeals, meal] });
        }
      },

      removeFavoriteMeal: (mealName: string) => {
        const { favoriteMeals } = get();
        set({ favoriteMeals: favoriteMeals.filter(m => m.name !== mealName) });
      },

      isMealFavorite: (mealName: string) => {
        const { favoriteMeals } = get();
        return favoriteMeals.some(m => m.name === mealName);
      },

      reset: () => {
        set({ favoriteExercises: [], favoriteMeals: [] });
      },
    }),
    {
      name: 'metabol-sim-favorites',
      version: 1,
    }
  )
);

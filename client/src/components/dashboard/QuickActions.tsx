// ============================================================================
// METABOLIC SIMULATOR - QUICK ACTIONS COMPONENT
// ============================================================================
//
// Displays user's favorite exercises and meals for quick logging.
// Provides one-click access to frequently logged items.
// ============================================================================

import { memo, useCallback } from 'react';
import { useFavoritesStore } from '../../state/favoritesStore';
import { useSimulationStore } from '../../state/store';
import type { FavoriteExercise, FavoriteMeal } from '../../state/favoritesStore';

interface QuickActionsProps {
  className?: string;
}

const QuickActions = memo(function QuickActions({ className = '' }: QuickActionsProps) {
  const { favoriteExercises, favoriteMeals, removeFavoriteExercise, removeFavoriteMeal } = useFavoritesStore();
  const { logExercise, logMeal } = useSimulationStore();

  // Stable handler functions with useCallback
  const handleLogFavoriteExercise = useCallback((exercise: FavoriteExercise) => {
    logExercise({
      id: `exercise-${Date.now()}`,
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      duration: exercise.defaultDuration,
      timestamp: new Date().toISOString(),
    });
  }, [logExercise]);

  const handleLogFavoriteMeal = useCallback((meal: FavoriteMeal) => {
    logMeal({
      id: `meal-${Date.now()}`,
      name: meal.name,
      time: new Date().toISOString(),
      items: [],
      totalMacros: meal.macros,
      glycemicLoad: meal.glycemicLoad,
      insulinResponse: { peak: 0, magnitude: 0, duration: 0, areaUnderCurve: 0 },
    });
  }, [logMeal]);

  const handleRemoveFavoriteExercise = useCallback((exerciseId: string) => {
    removeFavoriteExercise(exerciseId);
  }, [removeFavoriteExercise]);

  const handleRemoveFavoriteMeal = useCallback((mealName: string) => {
    removeFavoriteMeal(mealName);
  }, [removeFavoriteMeal]);

  const hasFavorites = favoriteExercises.length > 0 || favoriteMeals.length > 0;

  return (
    <div className={`bg-slate-800/50 rounded-lg border border-slate-700 ${className}`} data-testid="quick-actions-panel">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
          {hasFavorites && (
            <span className="text-xs text-slate-400">
              {favoriteExercises.length + favoriteMeals.length} saved
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {!hasFavorites ? (
          <div className="text-center py-6">
            <span className="text-3xl mb-2 block">📌</span>
            <p className="text-sm text-slate-400">No quick actions yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Add your favorite exercises and meals for quick access
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Favorite Exercises */}
            {favoriteExercises.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
                  <span>🏋️</span> Exercises
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {favoriteExercises.map((exercise) => (
                    <div
                      key={exercise.exerciseId}
                      className="group relative bg-slate-900/50 rounded-lg p-2 hover:bg-slate-900/70 transition-colors"
                    >
                      <button
                        onClick={() => handleLogFavoriteExercise(exercise)}
                        className="w-full text-left"
                      >
                        <div className="font-medium text-white text-sm">{exercise.exerciseName}</div>
                        <div className="text-xs text-slate-500">
                          {exercise.defaultDuration} min
                        </div>
                      </button>
                      <button
                        onClick={() => handleRemoveFavoriteExercise(exercise.exerciseId)}
                        className="absolute top-1 right-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from favorites"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Meals */}
            {favoriteMeals.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
                  <span>🍽️</span> Meals
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {favoriteMeals.map((meal) => (
                    <div
                      key={meal.name}
                      className="group relative bg-slate-900/50 rounded-lg p-2 hover:bg-slate-900/70 transition-colors"
                    >
                      <button
                        onClick={() => handleLogFavoriteMeal(meal)}
                        className="w-full text-left"
                      >
                        <div className="font-medium text-white text-sm truncate">{meal.name}</div>
                        <div className="text-xs text-slate-500">
                          {Math.round(meal.macros.proteins)}g P · {Math.round(meal.macros.carbohydrates)}g C
                        </div>
                      </button>
                      <button
                        onClick={() => handleRemoveFavoriteMeal(meal.name)}
                        className="absolute top-1 right-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from favorites"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default QuickActions;

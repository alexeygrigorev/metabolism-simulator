// ============================================================================
// METABOLIC SIMULATOR - EXERCISE BUILDER COMPONENT
// ============================================================================
//
// Allows users to log detailed workouts with sets, reps, weight, and rest periods.
// Similar to MealBuilder but designed for exercise logging.
// ============================================================================

import { useState, useMemo, memo, useRef, useEffect, type ReactNode } from 'react';
import { useSimulationStore } from '../../state/store';
import { useFavoritesStore } from '../../state/favoritesStore';
import {
  Exercise,
  ExerciseCategory,
  searchExercises,
  getExercisesByCategory,
  getCompoundMovements,
  EXERCISE_DATABASE,
  CATEGORY_INFO,
  MUSCLE_INFO,
} from '../../data/exerciseDatabase';
import type { ExerciseSet, CompletedExercise } from '@metabol-sim/shared';

interface ExerciseSetInput {
  reps: number;
  load: number;
  duration?: number; // for cardio
  rpe: number;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: ExerciseSetInput[];
  note?: string;
}

interface SetEditorProps {
  exercise: Exercise;
  sets: ExerciseSetInput[];
  onSetsChange: (sets: ExerciseSetInput[]) => void;
  onRemove: () => void;
}

interface ExerciseBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ExerciseCard = memo(function ExerciseCard({
  exercise,
  isSelected,
  onSelect,
  setCount
}: {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: () => void;
  setCount: number;
}) {
  const categoryInfo = CATEGORY_INFO[exercise.category];
  const { isExerciseFavorite, addFavoriteExercise, removeFavoriteExercise } = useFavoritesStore();
  const isFavorite = isExerciseFavorite(exercise.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavoriteExercise(exercise.id);
    } else {
      addFavoriteExercise({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        category: exercise.category,
        defaultDuration: exercise.category === ExerciseCategory.Cardio ? 30 : 45,
      });
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-500/20 border-blue-500/50'
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-lg">{categoryInfo.icon}</span>
            <h4 className="font-medium text-white text-sm truncate">{exercise.name}</h4>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded border ${categoryInfo.color}`}>
              {categoryInfo.name}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              MET: {exercise.met}
            </span>
            {(exercise.load ?? 0) > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-600/30 text-slate-300">
                Load: {exercise.load}kg
              </span>
            )}
          </div>

          {/* Primary muscles */}
          <div className="flex items-center gap-1 mt-2 flex-wrap text-xs text-slate-400">
            {exercise.primaryMuscles.map(m => (
              <span key={m} className="flex items-center gap-0.5">
                {MUSCLE_INFO[m]?.icon || '💪'} {MUSCLE_INFO[m]?.name || m}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className={`${isFavorite ? 'text-yellow-400' : 'text-slate-600'} transition-colors`}>
              {isFavorite ? '⭐' : '☆'}
            </span>
          </button>

          {isSelected && setCount > 0 && (
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {setCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const SetEditor = memo((props: SetEditorProps) => {
  const { exercise, sets, onSetsChange, onRemove } = props;
  const isCardio = exercise.category === ExerciseCategory.Cardio ||
                   exercise.category === ExerciseCategory.Flexibility;

  const updateSet = (index: number, field: keyof ExerciseSetInput, value: number) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    onSetsChange(newSets);
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    onSetsChange([...sets, {
      reps: lastSet?.reps || (isCardio ? 0 : 10),
      load: lastSet?.load ?? (exercise.load ?? 0),
      duration: lastSet?.duration || 30,
      rpe: lastSet?.rpe || 7,
    }]);
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    const newSets = sets.filter((_, i) => i !== index);
    onSetsChange(newSets);
  };

  return (
    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white flex items-center gap-2">
          {CATEGORY_INFO[exercise.category].icon} {exercise.name}
        </h4>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-sm"
          title="Remove exercise"
        >
          Remove
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {sets.map((set, index) => (
          <div key={index} className="flex items-center gap-2 bg-slate-800/50 rounded p-2">
            <span className="text-xs text-slate-500 w-8">Set {index + 1}</span>

            {isCardio ? (
              <>
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Duration (min)</label>
                  <input
                    type="number"
                    value={(set.duration || 0) / 60}
                    onChange={(e) => updateSet(index, 'duration', parseFloat(e.target.value) * 60)}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    min="1"
                    max="180"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Reps</label>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSet(index, 'reps', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    min="1"
                    max="100"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Load (kg)</label>
                  <input
                    type="number"
                    value={set.load}
                    onChange={(e) => updateSet(index, 'load', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    min="0"
                    max="500"
                  />
                </div>
              </>
            )}

            <div className="w-24">
              <label className="text-xs text-slate-500">RPE</label>
              <input
                type="number"
                value={set.rpe}
                onChange={(e) => updateSet(index, 'rpe', Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                min="1"
                max="10"
              />
            </div>

            {sets.length > 1 && (
              <button
                onClick={() => removeSet(index)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Remove set"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addSet}
        className="w-full py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 rounded text-sm transition-colors"
      >
        + Add Set
      </button>
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ExerciseBuilder = memo(function ExerciseBuilder({ isOpen, onClose }: ExerciseBuilderProps) {
  const { logExercise, addToast } = useSimulationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedExercises, setSelectedExercises] = useState<Map<string, ExerciseEntry>>(new Map());
  const [isLogging, setIsLogging] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Filter exercises based on search and category
  const filteredExercises = useMemo(() => {
    let exercises = searchQuery ? searchExercises(searchQuery) : EXERCISE_DATABASE;

    if (activeCategory !== 'all') {
      exercises = exercises.filter(e => e.category === activeCategory);
    }

    return exercises;
  }, [searchQuery, activeCategory]);

  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    cats.set('all', EXERCISE_DATABASE.length);
    EXERCISE_DATABASE.forEach(exercise => {
      cats.set(exercise.category, (cats.get(exercise.category) || 0) + 1);
    });
    return Array.from(cats.entries()).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count
    }));
  }, []);

  const toggleExercise = (exercise: Exercise) => {
    const newSelection = new Map(selectedExercises);
    const existing = newSelection.get(exercise.id);

    if (existing) {
      // Remove exercise
      newSelection.delete(exercise.id);
    } else {
      // Add exercise with default set
      const isCardio = exercise.category === ExerciseCategory.Cardio ||
                       exercise.category === ExerciseCategory.Flexibility;
      newSelection.set(exercise.id, {
        exercise,
        sets: [{
          reps: isCardio ? 0 : 10,
          load: exercise.load || 0,
          duration: isCardio ? 1800 : undefined, // 30 min for cardio
          rpe: 7,
        }],
      });
    }
    setSelectedExercises(newSelection);
  };

  const updateExerciseSets = (exerciseId: string, sets: ExerciseSetInput[]) => {
    const newSelection = new Map(selectedExercises);
    const existing = newSelection.get(exerciseId);
    if (existing) {
      newSelection.set(exerciseId, { ...existing, sets });
    }
    setSelectedExercises(newSelection);
  };

  // Calculate session totals
  const sessionTotals = useMemo(() => {
    let totalVolume = 0; // kg * reps
    let totalSets = 0;
    let totalDuration = 0; // seconds
    let avgRPE = 0;
    let rpeCount = 0;

    selectedExercises.forEach(({ exercise, sets }) => {
      sets.forEach(set => {
        if (exercise.category === ExerciseCategory.Cardio ||
            exercise.category === ExerciseCategory.Flexibility) {
          totalDuration += set.duration || 0;
        } else {
          totalVolume += set.reps * set.load;
          totalSets += 1;
        }
        avgRPE += set.rpe;
        rpeCount += 1;
      });
    });

    return {
      totalVolume,
      totalSets,
      totalDuration,
      avgRPE: rpeCount > 0 ? avgRPE / rpeCount : 0,
      exerciseCount: selectedExercises.size,
    };
  }, [selectedExercises]);

  const handleLogExercise = async () => {
    if (selectedExercises.size === 0) {
      addToast('Please select at least one exercise', 'warning');
      return;
    }

    setIsLogging(true);

    // Convert to CompletedExercise format
    const completedExercises: CompletedExercise[] = Array.from(selectedExercises.values()).map(entry => {
      const { exercise, sets } = entry;
      return {
        exerciseId: exercise.id,
        sets: sets.map(s => ({
          reps: s.reps,
          load: s.load,
          duration: s.duration || 0,
          rpe: s.rpe,
        })),
        restPeriods: new Array(sets.length - 1).fill(90), // Default 90s rest
      };
    });

    await logExercise({
      id: Date.now().toString(),
      startTime: new Date(),
      exercises: completedExercises,
      totalVolume: sessionTotals.totalVolume,
      totalWork: sessionTotals.totalVolume * 4 * 9.81, // Rough Joule calculation
      perceivedExertion: Math.round(sessionTotals.avgRPE),
    });

    setSelectedExercises(new Map());
    setSearchQuery('');
    setIsLogging(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Log Workout</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-700">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search exercises by name or muscle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All ({EXERCISE_DATABASE.length})
            </button>
            {categories
              .filter(c => c.value !== 'all')
              .map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                    activeCategory === cat.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{CATEGORY_INFO[cat.value as ExerciseCategory]?.icon}</span>
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-70">({cat.count})</span>
                </button>
              ))}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-slate-500">Quick filters:</span>
            <button
              onClick={() => setActiveCategory(activeCategory === ExerciseCategory.Resistance ? 'all' : ExerciseCategory.Resistance)}
              className={`px-2 py-1 rounded text-xs transition-all ${
                activeCategory === ExerciseCategory.Resistance
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {CATEGORY_INFO[ExerciseCategory.Resistance].icon} Strength
            </button>
            <button
              onClick={() => setActiveCategory(activeCategory === ExerciseCategory.Cardio ? 'all' : ExerciseCategory.Cardio)}
              className={`px-2 py-1 rounded text-xs transition-all ${
                activeCategory === ExerciseCategory.Cardio
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {CATEGORY_INFO[ExerciseCategory.Cardio].icon} Cardio
            </button>
            <button
              onClick={() => setActiveCategory(activeCategory === ExerciseCategory.HIIT ? 'all' : ExerciseCategory.HIIT)}
              className={`px-2 py-1 rounded text-xs transition-all ${
                activeCategory === ExerciseCategory.HIIT
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {CATEGORY_INFO[ExerciseCategory.HIIT].icon} HIIT
            </button>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Exercise List */}
          <div className="overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-3">Select Exercises</h3>
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No exercises found matching "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isSelected={selectedExercises.has(exercise.id)}
                    onSelect={() => toggleExercise(exercise)}
                    setCount={selectedExercises.get(exercise.id)?.sets.length || 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected Exercises with Set Editor */}
          <div className="overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-3">
              Workout Log ({selectedExercises.size} exercises)
            </h3>
            {selectedExercises.size === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-900/30 rounded-lg border border-dashed border-slate-700">
                <div className="text-3xl mb-2">💪</div>
                <p>Select exercises from the left to begin logging your workout</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(selectedExercises.values()).map((entry) => (
                  <SetEditor
                    key={entry.exercise.id}
                    exercise={entry.exercise}
                    sets={entry.sets}
                    onSetsChange={(sets) => updateExerciseSets(entry.exercise.id, sets)}
                    onRemove={() => toggleExercise(entry.exercise)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {selectedExercises.size > 0 && (
          <div className="bg-slate-900/50 rounded-lg p-4 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Session Summary</h4>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{sessionTotals.exerciseCount}</div>
                <div className="text-xs text-slate-500">Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{sessionTotals.totalSets}</div>
                <div className="text-xs text-slate-500">Sets</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{sessionTotals.totalVolume.toLocaleString()}</div>
                <div className="text-xs text-slate-500">Volume (kg)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-400">{sessionTotals.avgRPE.toFixed(1)}</div>
                <div className="text-xs text-slate-500">Avg RPE</div>
              </div>
            </div>

            <button
              onClick={handleLogExercise}
              disabled={isLogging}
              className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded font-medium transition-colors"
            >
              {isLogging ? 'Logging...' : 'Log Workout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default ExerciseBuilder;

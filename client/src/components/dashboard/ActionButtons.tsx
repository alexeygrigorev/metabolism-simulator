// ============================================================================
// METABOLIC SIMULATOR - ACTION BUTTONS COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { useState, useRef, useEffect, memo } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from '../ui/KeyboardShortcutsModal';

interface QuickMeal {
  name: string;
  items: { foodId: string; servings: number }[];
  macros: { carbohydrates: number; proteins: number; fats: number; fiber: number };
  glycemicLoad: number;
}

interface QuickExercise {
  name: string;
  exercises: { exerciseId: string; sets: Array<{ reps: number; load: number; duration: number; rpe: number }> }[];
  category: 'resistance' | 'cardio' | 'hiit';
}

// Expanded meal presets with nutritional data
const QUICK_MEALS: QuickMeal[] = [
  {
    name: '🍳 Breakfast',
    items: [{ foodId: 'eggs', servings: 2 }, { foodId: 'oats', servings: 1 }],
    macros: { carbohydrates: 40, proteins: 25, fats: 20, fiber: 6 },
    glycemicLoad: 25,
  },
  {
    name: '🥤 Protein Shake',
    items: [{ foodId: 'wheyProtein', servings: 1 }, { foodId: 'banana', servings: 1 }],
    macros: { carbohydrates: 35, proteins: 30, fats: 3, fiber: 4 },
    glycemicLoad: 30,
  },
  {
    name: '🍗 Chicken & Rice',
    items: [{ foodId: 'chickenBreast', servings: 1.5 }, { foodId: 'riceWhite', servings: 2 }],
    macros: { carbohydrates: 80, proteins: 50, fats: 8, fiber: 3 },
    glycemicLoad: 65,
  },
  {
    name: '🥗 Salad Bowl',
    items: [{ foodId: 'chickenBreast', servings: 1 }, { foodId: 'broccoli', servings: 2 }],
    macros: { carbohydrates: 15, proteins: 40, fats: 5, fiber: 12 },
    glycemicLoad: 8,
  },
  {
    name: '🐟 Salmon & Veggies',
    items: [{ foodId: 'salmon', servings: 1 }, { foodId: 'asparagus', servings: 2 }],
    macros: { carbohydrates: 10, proteins: 35, fats: 25, fiber: 6 },
    glycemicLoad: 5,
  },
  {
    name: '🍝 Pasta Post-Workout',
    items: [{ foodId: 'pasta', servings: 2 }, { foodId: 'leanBeef', servings: 1 }],
    macros: { carbohydrates: 90, proteins: 45, fats: 15, fiber: 8 },
    glycemicLoad: 70,
  },
  {
    name: '🥜 PB & Toast',
    items: [{ foodId: 'breadWhole', servings: 2 }, { foodId: 'peanutButter', servings: 1 }],
    macros: { carbohydrates: 45, proteins: 15, fats: 20, fiber: 8 },
    glycemicLoad: 35,
  },
  {
    name: '🥑 Avocado Toast',
    items: [{ foodId: 'breadWhole', servings: 2 }, { foodId: 'avocado', servings: 1 }],
    macros: { carbohydrates: 40, proteins: 10, fats: 22, fiber: 12 },
    glycemicLoad: 28,
  },
];

// Expanded exercise presets
const QUICK_EXERCISES: QuickExercise[] = [
  {
    name: '💪 Push Workout',
    exercises: [{ exerciseId: 'benchPress', sets: [
      { reps: 10, load: 60, duration: 180, rpe: 7 },
      { reps: 8, load: 65, duration: 180, rpe: 8 },
      { reps: 6, load: 70, duration: 180, rpe: 9 },
    ]}],
    category: 'resistance',
  },
  {
    name: '🦵 Leg Day',
    exercises: [{ exerciseId: 'squat', sets: [
      { reps: 8, load: 80, duration: 200, rpe: 8 },
      { reps: 6, load: 85, duration: 200, rpe: 9 },
    ]}],
    category: 'resistance',
  },
  {
    name: '🏃 Running (5k)',
    exercises: [{ exerciseId: 'running', sets: [{ reps: 1, load: 0, duration: 1800, rpe: 6 }] }],
    category: 'cardio',
  },
  {
    name: '🚴 Cycling (30min)',
    exercises: [{ exerciseId: 'cycling', sets: [{ reps: 1, load: 0, duration: 1800, rpe: 5 }] }],
    category: 'cardio',
  },
  {
    name: '⚡ HIIT Session',
    exercises: [{ exerciseId: 'hiit', sets: [{ reps: 1, load: 0, duration: 900, rpe: 9 }] }],
    category: 'hiit',
  },
  {
    name: '🏊 Swimming (30min)',
    exercises: [{ exerciseId: 'swimming', sets: [{ reps: 1, load: 0, duration: 1800, rpe: 6 }] }],
    category: 'cardio',
  },
  {
    name: '🧘 Yoga (45min)',
    exercises: [{ exerciseId: 'yoga', sets: [{ reps: 1, load: 0, duration: 2700, rpe: 3 }] }],
    category: 'cardio',
  },
  {
    name: '🎾 Pull Workout',
    exercises: [{ exerciseId: 'pullups', sets: [
      { reps: 10, load: 0, duration: 120, rpe: 7 },
      { reps: 8, load: 0, duration: 120, rpe: 8 },
    ]}],
    category: 'resistance',
  },
];

const ActionButtons = memo(function ActionButtons() {
  const { logMeal, logExercise, logSleep, applyStress } = useSimulationStore();
  const [showMealOptions, setShowMealOptions] = useState(false);
  const [showExerciseOptions, setShowExerciseOptions] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const mealRef = useRef<HTMLDivElement>(null);
  const exerciseRef = useRef<HTMLDivElement>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    isMealOpen: showMealOptions,
    setIsMealOpen: setShowMealOptions,
    isExerciseOpen: showExerciseOptions,
    setIsExerciseOpen: setShowExerciseOptions,
    showHelpModal,
    setShowHelpModal,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mealRef.current && !mealRef.current.contains(event.target as Node)) {
        setShowMealOptions(false);
      }
      if (exerciseRef.current && !exerciseRef.current.contains(event.target as Node)) {
        setShowExerciseOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickMeal = async (meal: QuickMeal) => {
    await logMeal({
      id: Date.now().toString(),
      name: meal.name,
      time: new Date().toISOString(),
      items: meal.items,
      totalMacros: {
        carbohydrates: meal.macros.carbohydrates,
        proteins: meal.macros.proteins,
        fats: meal.macros.fats,
        fiber: meal.macros.fiber,
        water: 0,
      },
      glycemicLoad: meal.glycemicLoad,
      insulinResponse: { peak: 30, magnitude: meal.glycemicLoad, duration: 120, areaUnderCurve: 0 },
    });
    setShowMealOptions(false);
  };

  const handleQuickExercise = async (exercise: QuickExercise) => {
    // Calculate total volume and average RPE
    let totalVolume = 0;
    let totalRpe = 0;
    let setCount = 0;

    exercise.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        totalVolume += set.load * set.reps;
        totalRpe += set.rpe;
        setCount++;
      });
    });

    const avgRpe = setCount > 0 ? totalRpe / setCount : 5;
    const totalDuration = exercise.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + set.duration, 0), 0);

    await logExercise({
      id: Date.now().toString(),
      name: exercise.name,
      category: exercise.category,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + totalDuration * 1000).toISOString(),
      exercises: exercise.exercises,
      totalVolume,
      totalWork: totalVolume * 4, // Approximate joules
      perceivedExertion: avgRpe,
    });
    setShowExerciseOptions(false);
  };

  const handleSleep = async () => {
    await logSleep(8, 0.85);
  };

  const handleStress = async (intensity: number) => {
    await applyStress(intensity);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        {/* Meal buttons */}
        <div className="relative" ref={mealRef}>
          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            onClick={() => setShowMealOptions(!showMealOptions)}
          >
            🍽️ Log Meal
          </button>
          {showMealOptions && (
            <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 z-10 min-w-[150px]">
              {QUICK_MEALS.map((meal) => (
                <button
                  key={meal.name}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 rounded transition-colors"
                  onClick={() => handleQuickMeal(meal)}
                >
                  {meal.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exercise buttons */}
        <div className="relative" ref={exerciseRef}>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            onClick={() => setShowExerciseOptions(!showExerciseOptions)}
          >
            💪 Log Exercise
          </button>
          {showExerciseOptions && (
            <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 z-10 min-w-[150px]">
              {QUICK_EXERCISES.map((exercise) => (
                <button
                  key={exercise.name}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 rounded transition-colors"
                  onClick={() => handleQuickExercise(exercise)}
                >
                  {exercise.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sleep button */}
        <button
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
          onClick={handleSleep}
          title="Log 8 hours of quality sleep"
        >
          😴 Sleep (8h)
        </button>

        {/* Stress buttons */}
        <div className="flex gap-1 items-center">
          <span className="text-sm text-slate-400">Stress:</span>
          <button
            className="px-2 py-1 text-xs rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
            onClick={() => handleStress(0.3)}
            title="Low stress"
          >
            Low
          </button>
          <button
            className="px-2 py-1 text-xs rounded bg-red-900/50 text-red-400 hover:bg-red-900/70 transition-colors"
            onClick={() => handleStress(0.6)}
            title="Moderate stress"
          >
            Med
          </button>
          <button
            className="px-2 py-1 text-xs rounded bg-red-900/70 text-red-400 hover:bg-red-900 transition-colors"
            onClick={() => handleStress(1.0)}
            title="High stress"
          >
            High
          </button>
        </div>

        {/* Help button */}
        <button
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors text-sm"
          onClick={() => setShowHelpModal(true)}
          title="Keyboard shortcuts"
        >
          ⌨️ ?
        </button>
      </div>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
});

export default ActionButtons;

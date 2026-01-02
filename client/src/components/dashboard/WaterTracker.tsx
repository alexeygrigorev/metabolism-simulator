// ============================================================================
// METABOLIC SIMULATOR - WATER INTAKE TRACKER COMPONENT
// ============================================================================
//
// Tracks and visualizes daily water intake with progress toward hydration goals.
// Displays visual indicators for glasses consumed and remaining.
// ============================================================================

import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { useSimulationStore } from '../../state/store';
import { useAchievementsStore } from '../../state/achievementsStore';

const STORAGE_KEY = 'metabol-sim-water-intake';
const GLASS_ML = 250; // Standard glass size in ml
const DAILY_GOAL_ML = 2000; // WHO recommendation: 2L/day
const MAX_GLASSES = Math.ceil(DAILY_GOAL_ML / GLASS_ML); // 8 glasses

interface WaterData {
  date: string; // YYYY-MM-DD format
  glasses: number;
  totalMl: number;
}

/**
 * Load water data from localStorage
 */
function loadWaterData(): WaterData {
  const today = new Date().toISOString().split('T')[0];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as WaterData;
      // Reset if it's a new day
      if (data.date === today) {
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to load water data:', e);
  }

  // Default: new day, start fresh
  return { date: today, glasses: 0, totalMl: 0 };
}

/**
 * Save water data to localStorage
 */
function saveWaterData(data: WaterData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save water data:', e);
  }
}

/**
 * Get hydration status based on intake percentage
 */
function getHydrationStatus(percent: number): {
  label: string;
  color: string;
  bgClass: string;
  emoji: string;
} {
  if (percent >= 100) {
    return { label: 'Hydrated', color: '#06b6d4', bgClass: 'bg-cyan-500/20', emoji: '💧' };
  } else if (percent >= 75) {
    return { label: 'Almost There', color: '#22d3ee', bgClass: 'bg-cyan-400/20', emoji: '💧' };
  } else if (percent >= 50) {
    return { label: 'Good Progress', color: '#67e8f9', bgClass: 'bg-cyan-300/20', emoji: '💧' };
  } else if (percent >= 25) {
    return { label: 'Keep Drinking', color: '#a5f3fc', bgClass: 'bg-cyan-200/20', emoji: '🥤' };
  }
  return { label: 'Start Hydrating', color: '#cbd5e1', bgClass: 'bg-slate-500/20', emoji: '🏜️' };
}

const WaterTracker = memo(function WaterTracker() {
  const { logMeal } = useSimulationStore();
  const [waterData, setWaterData] = useState<WaterData>(loadWaterData);

  // Memoize calculations to avoid unnecessary recalculations
  const percentComplete = useMemo(() =>
    Math.min(100, Math.round((waterData.totalMl / DAILY_GOAL_ML) * 100)),
    [waterData.totalMl]
  );

  const glassesRemaining = useMemo(() =>
    Math.max(0, MAX_GLASSES - waterData.glasses),
    [waterData.glasses]
  );

  const status = useMemo(() =>
    getHydrationStatus(percentComplete),
    [percentComplete]
  );

  /**
   * Add a glass of water
   */
  const addGlass = useCallback(async () => {
    const newGlasses = waterData.glasses + 1;
    const newMl = waterData.totalMl + GLASS_ML;
    const newData: WaterData = {
      date: waterData.date,
      glasses: newGlasses,
      totalMl: newMl,
    };

    setWaterData(newData);
    saveWaterData(newData);

    // Track water achievement (track each glass as 1 unit)
    useAchievementsStore.getState().trackWater(1);

    // Track water goal achievement when reaching 100%
    const newPercent = Math.min(100, Math.round((newMl / DAILY_GOAL_ML) * 100));
    if (newPercent >= 100 && percentComplete < 100) {
      useAchievementsStore.getState().trackWaterGoal();
    }

    // Also log to the simulation for consistency
    await logMeal({
      id: Date.now().toString(),
      name: `Water (${GLASS_ML}ml)`,
      time: new Date().toISOString(),
      items: [{ foodId: 'water', servings: 1 }],
      totalMacros: { carbohydrates: 0, proteins: 0, fats: 0, fiber: 0, water: GLASS_ML },
      glycemicLoad: 0,
      insulinResponse: { peak: 0, magnitude: 0, duration: 0, areaUnderCurve: 0 },
    });
  }, [waterData, logMeal, percentComplete]);

  /**
   * Remove a glass of water (undo)
   */
  const removeGlass = useCallback(() => {
    if (waterData.glasses <= 0) return;

    const newGlasses = waterData.glasses - 1;
    const newMl = Math.max(0, waterData.totalMl - GLASS_ML);
    const newData: WaterData = {
      date: waterData.date,
      glasses: newGlasses,
      totalMl: newMl,
    };

    setWaterData(newData);
    saveWaterData(newData);
  }, [waterData]);

  /**
   * Reset daily water intake
   */
  const resetDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const newData: WaterData = { date: today, glasses: 0, totalMl: 0 };
    setWaterData(newData);
    saveWaterData(newData);
  }, []);

  // Generate glass indicators
  const glasses = useMemo(() => {
    return Array.from({ length: MAX_GLASSES }, (_, i) => i < waterData.glasses);
  }, [waterData.glasses]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{status.emoji}</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Water Intake</h2>
            <p className="text-sm text-slate-400">
              {waterData.totalMl}ml / {DAILY_GOAL_ML}ml daily goal
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: status.color }}>
            {percentComplete}%
          </div>
          <div className="text-xs text-slate-400">{status.label}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-4 relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ${status.bgClass}`}
          style={{
            width: `${percentComplete}%`,
            backgroundColor: percentComplete >= 100 ? status.color : undefined,
          }}
        />
        {/* Shine effect */}
        <div
          className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{
            transform: 'skewX(-20deg) translateX(-100%)',
            animation: percentComplete >= 100 ? 'shine 1s ease-out' : 'none',
          }}
        />
      </div>

      {/* Glass Indicators */}
      <div className="mb-4">
        <div className="grid grid-cols-8 gap-1 sm:gap-2">
          {glasses.map((filled, index) => (
            <button
              key={index}
              onClick={filled ? removeGlass : addGlass}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-lg transition-all duration-200
                ${filled
                  ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-500/40'
                  : 'bg-slate-700/50 border-2 border-slate-600 text-slate-600 hover:bg-slate-700 hover:border-slate-500'
                }
              `}
              title={filled ? 'Remove glass' : 'Add glass'}
              aria-label={filled ? `Remove glass ${index + 1}` : `Add glass ${index + 1}`}
            >
              {filled ? '💧' : '○'}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          {glassesRemaining > 0
            ? `${glassesRemaining} more glass${glassesRemaining > 1 ? 'es' : ''} to reach goal`
            : 'Daily goal reached! 🎉'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={addGlass}
          disabled={percentComplete >= 100}
          className={`
            flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all
            ${percentComplete >= 100
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            }
          `}
        >
          + Add Glass ({GLASS_ML}ml)
        </button>
        <button
          onClick={removeGlass}
          disabled={waterData.glasses <= 0}
          className={`
            py-2 px-3 rounded-lg font-medium text-sm transition-all
            ${waterData.glasses <= 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-slate-600 hover:bg-slate-500 text-white'
            }
          `}
          title="Remove last glass"
        >
          −
        </button>
        <button
          onClick={resetDay}
          className="py-2 px-3 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm transition-all"
          title="Reset today's intake"
        >
          ↺
        </button>
      </div>

      {/* Hydration Tip */}
      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
        <p className="text-xs text-slate-400 flex items-start gap-2">
          <span>💡</span>
          <span>
            {percentComplete < 25
              ? 'Start your day with water to kickstart metabolism!'
              : percentComplete < 50
                ? 'Try drinking a glass of water with each meal.'
                : percentComplete < 75
                  ? 'Great progress! Keep water nearby throughout the day.'
                  : percentComplete < 100
                    ? 'Almost there! A few more sips to reach your goal.'
                    : 'Excellent hydration! Your body will thank you.'}
          </span>
        </p>
      </div>

      <style>{`
        @keyframes shine {
          from { transform: skewX(-20deg) translateX(-100%); }
          to { transform: skewX(-20deg) translateX(200%); }
        }
      `}</style>
    </div>
  );
});

export default WaterTracker;

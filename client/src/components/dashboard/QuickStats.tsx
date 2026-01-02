// ============================================================================
// METABOLIC SIMULATOR - QUICK STATS COMPONENT
// ============================================================================
//
// Displays a summary of key metrics at a glance:
// - Current calories (consumed/burned)
// - Protein intake progress
// - Water intake progress
// - Current stress level
// - Last logged activity
// ============================================================================

import { memo, useMemo, useState, useEffect } from 'react';
import { useSimulationStore } from '../../state/store';

// Water data interface (matches WaterTracker storage)
interface WaterData {
  date: string;
  glasses: number;
  totalMl: number;
}

const WATER_STORAGE_KEY = 'metabol-sim-water-intake';
const DAILY_GOAL_ML = 2000;

interface QuickStatsProps {
  className?: string;
}

// Helper to get color based on percentage
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 100) return 'text-green-400';
  if (percentage >= 75) return 'text-blue-400';
  if (percentage >= 50) return 'text-yellow-400';
  return 'text-orange-400';
};

// Helper to get stress level color
const getStressColor = (stress: string): string => {
  if (stress === 'low') return 'text-green-400';
  if (stress === 'med') return 'text-yellow-400';
  return 'text-red-400';
};

const QuickStats = memo(function QuickStats({ className = '' }: QuickStatsProps) {
  const { state } = useSimulationStore();
  const [waterData, setWaterData] = useState<WaterData>({ date: '', glasses: 0, totalMl: 0 });

  // Load water data from localStorage (matches WaterTracker component)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const stored = localStorage.getItem(WATER_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as WaterData;
        // Only use if it's from today
        if (data.date === today) {
          setWaterData(data);
        } else {
          setWaterData({ date: today, glasses: 0, totalMl: 0 });
        }
      } else {
        setWaterData({ date: today, glasses: 0, totalMl: 0 });
      }
    } catch (e) {
      setWaterData({ date: today, glasses: 0, totalMl: 0 });
    }
  }, []);

  // Calculate metrics using useMemo to avoid recalculating on every render
  const metrics = useMemo(() => {
    if (!state) {
      return {
        calorieBalance: 0,
        caloriePercent: 0,
        proteinPercent: 0,
        waterPercent: 0,
        hasCalories: false,
        hasProtein: false,
        hasWater: false,
        lastActivity: null,
        stressLevel: 'low',
      };
    }

    const { energy } = state;
    const netCalories = energy.caloriesConsumed - energy.caloriesBurned;
    const tdee = energy.tdee || 2000;
    const caloriePercent = Math.min(100, (energy.caloriesConsumed / tdee) * 100);

    const proteinTarget = energy.proteins.target || 150;
    const proteinConsumed = energy.proteins.consumed || 0;
    const proteinPercent = Math.min(100, (proteinConsumed / proteinTarget) * 100);

    const waterPercent = Math.min(100, (waterData.totalMl / DAILY_GOAL_ML) * 100);

    // Get last activity
    const allActivities = [
      ...(state.recentMeals || []).map(m => ({ type: 'meal', time: m.time || new Date(), name: m.name })),
      ...(state.recentExercises || []).map(e => ({ type: 'exercise', time: e.startTime || new Date(), name: e.exerciseName || 'Exercise' })),
      ...(state.recentSleep || []).map(s => ({ type: 'sleep', time: s.endTime || new Date(), name: `${Math.round(s.duration)}h sleep` })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const lastActivity = allActivities[0] || null;

    // Get stress level from hormones (cortisol)
    const stressLevel = state.hormones?.cortisol
      ? (state.hormones.cortisol.currentValue > 15 ? 'high' : state.hormones.cortisol.currentValue > 10 ? 'med' : 'low')
      : 'low';

    return {
      calorieBalance: netCalories,
      caloriePercent,
      proteinPercent,
      waterPercent,
      hasCalories: energy.caloriesConsumed > 0,
      hasProtein: proteinConsumed > 0,
      hasWater: waterData.totalMl > 0,
      lastActivity,
      stressLevel,
    };
  }, [state, waterData]);

  if (!state) {
    return (
      <div className={`bg-slate-800/50 rounded-lg border border-slate-700 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-slate-700 rounded"></div>
            <div className="h-16 bg-slate-700 rounded"></div>
            <div className="h-16 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 rounded-lg border border-slate-700 ${className}`} data-testid="quick-stats-panel">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Calories */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Calories</span>
            <span className={`text-sm font-medium ${getPercentageColor(metrics.caloriePercent)}`}>
              {metrics.caloriePercent.toFixed(0)}%
            </span>
          </div>
          <div className="text-lg font-bold text-white">
            {Math.round(metrics.calorieBalance)}
            <span className="text-xs text-slate-500 font-normal ml-1">net</span>
          </div>
        </div>

        {/* Protein */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Protein</span>
            <span className={`text-sm font-medium ${getPercentageColor(metrics.proteinPercent)}`}>
              {metrics.proteinPercent.toFixed(0)}%
            </span>
          </div>
          <div className="text-lg font-bold text-white">
            {Math.round(state.energy.proteins.consumed || 0)}
            <span className="text-xs text-slate-500 font-normal ml-1">g</span>
          </div>
        </div>

        {/* Water */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Water</span>
            <span className={`text-sm font-medium ${getPercentageColor(metrics.waterPercent)}`}>
              {metrics.waterPercent.toFixed(0)}%
            </span>
          </div>
          <div className="text-lg font-bold text-white">
            {Math.round(waterData.totalMl)}
            <span className="text-xs text-slate-500 font-normal ml-1">ml</span>
          </div>
        </div>

        {/* Stress Level */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Stress</span>
            <span className={`text-sm font-medium capitalize ${getStressColor(metrics.stressLevel)}`}>
              {metrics.stressLevel}
            </span>
          </div>
          <div className="text-lg font-bold text-white">
            {state.hormones?.cortisol?.currentValue.toFixed(1) || '10'}
            <span className="text-xs text-slate-500 font-normal ml-1">mcg/dL</span>
          </div>
        </div>
      </div>

      {/* Last Activity */}
      {metrics.lastActivity && (
        <div className="px-4 pb-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Last Activity</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {metrics.lastActivity.type === 'meal' ? '🍽️' : metrics.lastActivity.type === 'exercise' ? '🏋️' : '😴'}
              </span>
              <span className="text-sm text-white truncate">{metrics.lastActivity.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default QuickStats;

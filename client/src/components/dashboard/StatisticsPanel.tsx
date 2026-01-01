// ============================================================================
// METABOLIC SIMULATOR - STATISTICS PANEL COMPONENT
// ============================================================================

import { memo, useEffect, useState, useMemo } from 'react';
import { useSimulationStore } from '../../state/store';

const STATS_KEY = 'metabol-sim-statistics';

interface SessionStats {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  proteinConsumed: number;
  exercisesLogged: number;
  sleepHours: number;
  avgInsulin: number;
  avgCortisol: number;
  avgTestosterone: number;
}

interface StatisticsData {
  totalSessions: number;
  totalMeals: number;
  totalExercises: number;
  totalSleep: number;
  bestDay: {
    date: string;
    protein: number;
  } | null;
  averages: {
    dailyCalories: number;
    dailyProtein: number;
    sleepQuality: number;
  };
  weekly: SessionStats[];
}

function loadStatistics(): StatisticsData {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
  return {
    totalSessions: 0,
    totalMeals: 0,
    totalExercises: 0,
    totalSleep: 0,
    bestDay: null,
    averages: {
      dailyCalories: 0,
      dailyProtein: 0,
      sleepQuality: 0,
    },
    weekly: [],
  };
}

function saveStatistics(data: StatisticsData) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save statistics:', error);
  }
}

const StatisticsPanel = memo(function StatisticsPanel() {
  const { state } = useSimulationStore();
  const [stats, setStats] = useState<StatisticsData>(loadStatistics);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'records'>('overview');

  // Update stats when state changes
  useEffect(() => {
    if (!state) return;

    const today = new Date().toDateString();
    const updated = { ...stats };

    // Update totals from current session
    updated.totalMeals = state.recentMeals?.length || 0;
    updated.totalExercises = state.recentExercises?.length || 0;
    updated.totalSleep = state.recentSleep?.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) || 0;

    // Check if today is a new best for protein
    const todayProtein = state.energy.proteins.consumed || 0;
    if (!updated.bestDay || todayProtein > updated.bestDay.protein) {
      updated.bestDay = { date: today, protein: todayProtein };
    }

    // Update averages
    updated.averages.dailyCalories = state.energy.caloriesConsumed || 0;
    updated.averages.dailyProtein = todayProtein;

    setStats(updated);
    saveStatistics(updated);
  }, [state]);

  // Calculate completion percentages for visual display
  const statsCards = useMemo(() => [
    {
      label: 'Total Meals Logged',
      value: stats.totalMeals,
      icon: '🍽️',
      color: 'from-orange-500 to-amber-500',
    },
    {
      label: 'Total Exercises',
      value: stats.totalExercises,
      icon: '🏋️',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Hours of Sleep Tracked',
      value: stats.totalSleep.toFixed(1),
      icon: '😴',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Best Protein Day',
      value: `${stats.bestDay?.protein.toFixed(0) || 0}g`,
      icon: '🥩',
      color: 'from-green-500 to-emerald-500',
    },
  ], [stats]);

  const StatBar = memo(function StatBar({
    label,
    value,
    max,
    color,
  }: {
    label: string;
    value: number;
    max: number;
    color: string;
  }) {
    const percent = Math.min(100, (value / max) * 100);

    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">{label}</span>
          <span className="text-white font-medium">{value.toFixed(1)}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  });

  if (!state) return null;

  const currentHormones = state.hormones || {};

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Statistics & Trends</h2>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'trends', name: 'Trends' },
            { id: 'records', name: 'Records' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {statsCards.map((card, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-10 border border-white/10`}
              >
                <div className="text-2xl mb-1">{card.icon}</div>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <div className="text-xs text-white/70">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Today's Hormone Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <StatBar
                label="Insulin"
                value={currentHormones.insulin?.currentValue || 0}
                max={50}
                color="bg-amber-500"
              />
              <StatBar
                label="Cortisol"
                value={currentHormones.cortisol?.currentValue || 0}
                max={40}
                color="bg-purple-500"
              />
              <StatBar
                label="Testosterone"
                value={currentHormones.testosterone?.currentValue || 0}
                max={40}
                color="bg-blue-500"
              />
              <StatBar
                label="Growth Hormone"
                value={currentHormones.growthHormone?.currentValue || 0}
                max={5}
                color="bg-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {selectedTab === 'trends' && (
        <div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Current Session Averages</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-400">Daily Calories</span>
                <span className="text-white font-medium">{stats.averages.dailyCalories.toFixed(0)} kcal</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-400">Daily Protein</span>
                <span className="text-white font-medium">{stats.averages.dailyProtein.toFixed(1)} g</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Sleep Quality</span>
                <span className="text-white font-medium">{(stats.averages.sleepQuality * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 mt-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Tips for Improvement</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Log 3+ meals with 30g protein each for optimal MPS</li>
              <li>• Resistance training boosts testosterone for 24-48h</li>
              <li>• 7-9 hours sleep maximizes growth hormone release</li>
              <li>• Keep stress low to maintain anabolic environment</li>
            </ul>
          </div>
        </div>
      )}

      {/* Records Tab */}
      {selectedTab === 'records' && (
        <div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Personal Records</h3>
            <div className="space-y-2">
              {[
                { label: 'Most Protein in a Day', value: `${stats.bestDay?.protein.toFixed(0) || 0}g`, icon: '🏆' },
                { label: 'Total Exercises Logged', value: stats.totalExercises.toString(), icon: '💪' },
                { label: 'Total Sleep Tracked', value: `${stats.totalSleep.toFixed(1)}h`, icon: '🌙' },
                { label: 'Meals This Session', value: stats.totalMeals.toString(), icon: '🍽️' },
              ].map((record, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{record.icon}</span>
                    <span className="text-slate-400">{record.label}</span>
                  </div>
                  <span className="text-white font-bold">{record.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default StatisticsPanel;

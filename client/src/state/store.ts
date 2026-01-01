// ============================================================================
// METABOLIC SIMULATOR - STATE MANAGEMENT (Zustand)
// ============================================================================

import { create } from 'zustand';
import { SimulationState, UserProfile, BiologicalSex, HormoneName, Trend } from '@metabol-sim/shared';
import type { Toast } from '../components/ui/Toast';
import {
  simulateMealEffect,
  simulateExerciseEffect,
  simulateStressEffect,
  simulateSleepEffect,
  addHormoneEffect,
  getActiveEffect,
  HORMONE_BASELINES,
} from '../utils/demoSimulation';
import { useAchievementsStore } from './achievementsStore';

// History for sparkline visualization (limited to 20 points for performance)
interface HormoneHistory {
  insulin: number[];
  glucagon: number[];
  cortisol: number[];
  testosterone: number[];
  growthHormone: number[];
  igf1: number[];
  epinephrine: number[];
  leptin: number[];
  ghrelin: number[];
}

const MAX_HISTORY_POINTS = 20;
const HISTORY_THROTTLE_MS = 500; // Update history every 500ms max

interface SimulationStore {
  // State
  state: SimulationState | null;
  connected: boolean;
  loading: boolean;
  error: string | null;

  // Settings
  timeScale: number;
  paused: boolean;

  // Hormone history for sparklines
  hormoneHistory: HormoneHistory;

  // Toast notifications
  toasts: Toast[];

  // Internal state (not exposed to components)
  _lastHistoryUpdate?: number;

  // Actions
  setState: (state: SimulationState) => void;
  initialize: (userId: string) => Promise<void>;
  setTimeScale: (scale: number) => void;
  setPaused: (paused: boolean) => void;
  togglePause: () => void;
  logMeal: (meal: any) => Promise<void>;
  logExercise: (exercise: any) => Promise<void>;
  applyStress: (intensity: number) => Promise<void>;
  logSleep: (hours: number, quality: number) => Promise<void>;
  addToast: (message: string, type: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

const API_BASE = '/api';

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  state: null,
  connected: false,
  loading: true,
  error: null,
  timeScale: 1,
  paused: false,
  hormoneHistory: {
    insulin: [],
    glucagon: [],
    cortisol: [],
    testosterone: [],
    growthHormone: [],
    igf1: [],
    epinephrine: [],
    leptin: [],
    ghrelin: [],
  },
  toasts: [],

  setState: (newState) => {
    const { hormoneHistory, _lastHistoryUpdate } = get();
    const now = Date.now();

    // Throttled history update
    if (!_lastHistoryUpdate || now - _lastHistoryUpdate > HISTORY_THROTTLE_MS) {
      const updatedHistory: HormoneHistory = { ...hormoneHistory };

      // Update each hormone's history
      (Object.keys(newState.hormones) as HormoneName[]).forEach((hormone) => {
        const value = newState.hormones[hormone].currentValue;
        updatedHistory[hormone] = [
          ...hormoneHistory[hormone],
          value,
        ].slice(-MAX_HISTORY_POINTS);
      });

      set({
        state: newState,
        hormoneHistory: updatedHistory,
        _lastHistoryUpdate: now,
      });
    } else {
      set({ state: newState });
    }
  },

  initialize: async (userId: string) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/simulation/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to initialize simulation');
      }

      const state: SimulationState = await response.json();

      set({
        state,
        connected: true,
        loading: false,
        timeScale: state.settings.timeScale,
        paused: state.settings.paused,
      });

      // Connect WebSocket for real-time updates (only when server is available)
      connectWebSocket(userId);
    } catch (error) {
      console.error('Initialization error:', error);

      // Create a default simulation state for demo purposes
      // Note: We do NOT call connectWebSocket in demo mode
      const defaultState: SimulationState = {
        id: 'demo',
        userId,
        timestamp: new Date(),
        gameTime: new Date(),
        user: {
          id: userId,
          age: 30,
          biologicalSex: BiologicalSex.Male,
          weight: 75,
          height: 180,
          bodyFatPercentage: 0.18,
          activityLevel: 1.55,
        },
        energy: {
          bmr: 1750,
          tdee: 2700,
          caloriesConsumed: 0,
          caloriesBurned: 0,
          netCalories: 0,
          bloodGlucose: {
            currentValue: 85,
            baseline: 85,
            peak: 85,
            trend: 0,
            lastMealTime: undefined,
            lastMealGlycemicLoad: 0,
            units: 'mg/dL',
          },
          carbohydrates: { consumed: 0, burned: 0, target: 300 },
          proteins: { consumed: 0, burned: 0, target: 120 },
          fats: { consumed: 0, burned: 0, target: 75 },
          glycogen: { muscle: 1, liver: 1, capacity: { muscle: 400, liver: 100 } },
          bodyFat: 13.5,
          leanMass: 61.5,
          substrateUtilization: {
            fatOxidation: 0.1,
            glucoseOxidation: 0.08,
            proteinOxidation: 0.001,
            metabolicState: 'fasted' as any,
          },
        },
        hormones: {
          insulin: { currentValue: 5, baseline: 5, peak: 5, trough: 5, trend: 0, sensitivity: 1 },
          glucagon: { currentValue: 50, baseline: 50, peak: 50, trough: 50, trend: 0, sensitivity: 1 },
          cortisol: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          testosterone: { currentValue: 20, baseline: 20, peak: 20, trough: 20, trend: 0, sensitivity: 1 },
          growthHormone: { currentValue: 1, baseline: 1, peak: 1, trough: 1, trend: 0, sensitivity: 1 },
          igf1: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
          epinephrine: { currentValue: 30, baseline: 30, peak: 30, trough: 30, trend: 0, sensitivity: 1 },
          leptin: { currentValue: 10, baseline: 10, peak: 10, trough: 10, trend: 0, sensitivity: 1 },
          ghrelin: { currentValue: 150, baseline: 150, peak: 150, trough: 150, trend: 0, sensitivity: 1 },
        },
        muscle: {
          totalMass: 61.5,
          skeletalMuscleMass: 58.5,
          fiberTypeDistribution: { type1: 0.5, type2a: 0.3, type2x: 0.2 },
          proteinBalance: { synthesisRate: 0.01, breakdownRate: 0.01, netBalance: 0, anabolicWindowRemaining: 0 },
          satelliteCells: { active: 0, proliferating: 0, differentiating: 0, fusing: 0, nucleiPerFiber: 1 },
          mtorSignaling: { activity: 0, leucineThresholdMet: false, insulinSufficient: false, mechanicalStimulus: 0, energyStatus: 1 },
          recoveryStatus: { muscleDamage: 0, glycogenRepletion: 1, inflammation: 0, centralFatigue: 0, sleepDebt: 0 },
          trainingAdaptations: { strength: 1, endurance: 1, power: 1, workCapacity: 0, lastWorkout: null, consecutiveDays: 0 },
        },
        recentMeals: [],
        recentExercises: [],
        recentSleep: [],
        settings: { timeScale: 1, paused: false, autoSave: true },
      };

      set({
        state: defaultState,
        connected: false, // Not connected to real server
        loading: false,
      });
    }
  },

  setTimeScale: async (scale: number) => {
    // Always update local state
    set({ timeScale: scale });

    // Try to sync with server if we have a state
    const { state } = get();
    if (!state) return;

    try {
      await fetch(`${API_BASE}/simulation/${state.userId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeScale: scale }),
      });
    } catch (error) {
      console.error('Failed to set time scale:', error);
    }
  },

  setPaused: async (paused: boolean) => {
    // Always update local state
    set({ paused });

    // Try to sync with server if we have a state
    const { state } = get();
    if (!state) return;

    try {
      await fetch(`${API_BASE}/simulation/${state.userId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused }),
      });
    } catch (error) {
      console.error('Failed to set paused:', error);
    }
  },

  togglePause: () => {
    const { paused } = get();
    const newPaused = !paused;
    // Update local state immediately
    set({ paused: newPaused });

    // Try to sync with server if we have a state
    const { state } = get();
    if (!state) return;

    fetch(`${API_BASE}/simulation/${state.userId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paused: newPaused }),
    }).catch((error) => {
      console.error('Failed to toggle pause:', error);
    });
  },

  logMeal: async (meal: any) => {
    const { state, addToast, connected } = get();
    if (!state) return;

    const success = () => addToast(`Meal logged: ${meal.name || 'Custom meal'}`, 'success');

    try {
      const response = await fetch(`${API_BASE}/simulation/${state.userId}/meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
      });
      if (response.ok) success();
    } catch (error) {
      // Demo mode: apply hormone effects locally
      if (!connected) {
        const effects = simulateMealEffect(meal);
        Object.entries(effects).forEach(([hormone, data]) => {
          addHormoneEffect(hormone, data.peak, data.duration);
        });

        // Update energy state with meal macros
        const updatedState = { ...state };
        updatedState.energy.caloriesConsumed +=
          (meal.totalMacros?.carbohydrates || 0) * 4 +
          (meal.totalMacros?.proteins || 0) * 4 +
          (meal.totalMacros?.fats || 0) * 9;
        updatedState.energy.carbohydrates.consumed += meal.totalMacros?.carbohydrates || 0;
        updatedState.energy.proteins.consumed += meal.totalMacros?.proteins || 0;
        updatedState.energy.fats.consumed += meal.totalMacros?.fats || 0;
        updatedState.recentMeals = [...updatedState.recentMeals, meal as any];

        // Update metabolic state
        if (meal.glycemicLoad > 30) {
          updatedState.energy.substrateUtilization.metabolicState = 'postprandial' as any;
        }

        set({ state: updatedState });
        success();

        // Track achievement
        useAchievementsStore.getState().trackMeal();

        // Track hormone peaks for achievements
        if (updatedState.hormones.insulin.currentValue > 20) {
          useAchievementsStore.getState().trackHormonePeak('insulin', updatedState.hormones.insulin.currentValue);
        }

        // Track protein target hit
        if (updatedState.energy.proteins.consumed >= updatedState.energy.proteins.target) {
          useAchievementsStore.getState().trackProteinStreak();
        }
      } else {
        addToast('Failed to log meal', 'warning');
      }
    }
  },

  logExercise: async (exercise: any) => {
    const { state, addToast, connected } = get();
    if (!state) return;

    const success = () => addToast(`Exercise logged: ${exercise.name || 'Custom exercise'}`, 'success');

    try {
      const response = await fetch(`${API_BASE}/simulation/${state.userId}/exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exercise),
      });
      if (response.ok) success();
    } catch (error) {
      // Demo mode: apply hormone effects locally
      if (!connected) {
        const effects = simulateExerciseEffect(exercise);
        Object.entries(effects).forEach(([hormone, data]) => {
          addHormoneEffect(hormone, data.peak, data.duration);
        });

        // Update energy state with exercise burn
        const duration = exercise.exercises?.[0]?.sets?.reduce((sum: number, s: any) => sum + s.duration, 0) || 0;
        const caloriesBurned = Math.round(duration * 0.15 * (exercise.perceivedExertion || 5) / 5);

        const updatedState = { ...state };
        updatedState.energy.caloriesBurned += caloriesBurned;
        updatedState.recentExercises = [...updatedState.recentExercises, exercise as any];

        // Update metabolic state
        updatedState.energy.substrateUtilization.metabolicState = 'exercise' as any;
        if (exercise.category === 'cardio') {
          updatedState.energy.substrateUtilization.fatOxidation = Math.min(0.3, 0.1 + duration / 3600);
        }

        // Update muscle damage and mTOR
        if (exercise.category === 'resistance') {
          updatedState.muscle.recoveryStatus.muscleDamage = Math.min(0.5, 0.1 + (exercise.perceivedExertion || 7) / 20);
          updatedState.muscle.mtorSignaling.activity = Math.min(0.8, 0.5 + (exercise.perceivedExertion || 7) / 20);
          updatedState.muscle.mtorSignaling.mechanicalStimulus = (exercise.perceivedExertion || 7) / 10;
        }

        set({ state: updatedState });
        success();

        // Track achievement
        useAchievementsStore.getState().trackExercise();

        // Track hormone peaks for achievements
        if (updatedState.hormones.testosterone.currentValue > 20) {
          useAchievementsStore.getState().trackHormonePeak('testosterone', updatedState.hormones.testosterone.currentValue);
        }

        // Track muscle gain
        useAchievementsStore.getState().trackMuscleGain(updatedState.muscle.totalMass);
      } else {
        addToast('Failed to log exercise', 'warning');
      }
    }
  },

  applyStress: async (intensity: number) => {
    const { state, addToast, connected } = get();
    if (!state) return;

    const success = (label: string) => addToast(`Stress level set to ${label}`, 'info');

    try {
      const response = await fetch(`${API_BASE}/simulation/${state.userId}/stress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity }),
      });
      if (response.ok) {
        if (intensity <= 0.4) success('Low');
        else if (intensity <= 0.7) success('Medium');
        else success('High');
      }
    } catch (error) {
      // Demo mode: apply hormone effects locally
      if (!connected) {
        const effects = simulateStressEffect(intensity);
        Object.entries(effects).forEach(([hormone, data]) => {
          addHormoneEffect(hormone, data.peak, data.duration);
        });

        if (intensity <= 0.4) success('Low');
        else if (intensity <= 0.7) success('Medium');
        else success('High');

        // Track cortisol peak for achievements if stress is high
        if (intensity > 0.7) {
          useAchievementsStore.getState().trackHormonePeak('cortisol', 30);
        }
      } else {
        addToast('Failed to set stress level', 'warning');
      }
    }
  },

  logSleep: async (hours: number, quality: number) => {
    const { state, addToast, connected } = get();
    if (!state) return;

    const success = () => addToast(`Logged ${hours}h of sleep`, 'success');

    try {
      const response = await fetch(`${API_BASE}/simulation/${state.userId}/sleep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, quality }),
      });
      if (response.ok) success();
    } catch (error) {
      // Demo mode: apply hormone effects locally
      if (!connected) {
        const effects = simulateSleepEffect(hours, quality);
        Object.entries(effects).forEach(([hormone, data]) => {
          addHormoneEffect(hormone, data.peak, data.duration);
        });

        const updatedState = { ...state };
        updatedState.muscle.recoveryStatus.sleepDebt = Math.max(0, updatedState.muscle.recoveryStatus.sleepDebt - hours);
        updatedState.muscle.recoveryStatus.centralFatigue = Math.max(0, updatedState.muscle.recoveryStatus.centralFatigue - 0.3 * quality);
        updatedState.muscle.recoveryStatus.muscleDamage = Math.max(0, updatedState.muscle.recoveryStatus.muscleDamage - 0.2 * quality);
        updatedState.energy.substrateUtilization.metabolicState = 'fasted' as any;

        const sleepEntry = {
          id: Date.now().toString(),
          startTime: new Date(Date.now() - hours * 3600000),
          endTime: new Date(),
          duration: hours,
          quality,
          cycles: Math.floor(hours * 1.5),
          deepSleep: hours * 0.2,
          remSleep: hours * 0.25,
        };
        updatedState.recentSleep = [...updatedState.recentSleep, sleepEntry];

        set({ state: updatedState });
        success();

        // Track achievement
        useAchievementsStore.getState().trackSleep();

        // Track testosterone boost from sleep for achievements
        if (quality > 0.7 && hours >= 7) {
          useAchievementsStore.getState().trackHormonePeak('testosterone', 28);
        }

        // Track fasting state
        useAchievementsStore.getState().trackFastingStreak(8); // Assume 8h fast during sleep
      } else {
        addToast('Failed to log sleep', 'warning');
      }
    }
  },

  addToast: (message: string, type: 'success' | 'info' | 'warning') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  reset: () => {
    set({
      state: null,
      connected: false,
      loading: true,
      error: null,
      timeScale: 1,
      paused: false,
      hormoneHistory: {
        insulin: [],
        glucagon: [],
        cortisol: [],
        testosterone: [],
        growthHormone: [],
        igf1: [],
        epinephrine: [],
        leptin: [],
        ghrelin: [],
      },
      toasts: [],
      _lastHistoryUpdate: undefined,
    });
  },
}));

// WebSocket connection
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let maxReconnectAttempts = 5; // Increased from 3 for better reliability
let shouldReconnect = true;
let reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

// Clear reconnect timeout to prevent memory leaks
function clearReconnectTimeout() {
  if (reconnectTimeoutId) {
    clearTimeout(reconnectTimeoutId);
    reconnectTimeoutId = null;
  }
}

// Calculate exponential backoff delay (max 30 seconds)
function getReconnectDelay(): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), maxDelay);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

// Clean up WebSocket event handlers to prevent memory leaks
function cleanupWebSocket() {
  if (ws) {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
  }
}

export function connectWebSocket(userId: string) {
  // Clear any pending reconnection timeout
  clearReconnectTimeout();

  // Don't reconnect if we've exceeded max attempts
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.log('WebSocket reconnection limit reached, staying in demo mode');
    return;
  }

  // Close existing connection if any
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    cleanupWebSocket();
    ws.close();
  }

  try {
    // Construct WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsUrl: string;

    if (import.meta.env.DEV) {
      // In development, connect to Vite's proxy
      wsUrl = `ws://localhost:5173/ws/${userId}`;
    } else {
      // In production, use the current host
      wsUrl = `${protocol}//${window.location.host}/ws/${userId}`;
    }

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected to', wsUrl);
      reconnectAttempts = 0; // Reset on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'stateUpdate' || data.type === 'state') {
          useSimulationStore.getState().setState(data.data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Don't increment here - let onclose handle reconnection
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      cleanupWebSocket();

      // Only reconnect if we haven't exceeded max attempts and shouldReconnect is true
      if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = getReconnectDelay();
        console.log(`Reconnecting in ${Math.round(delay / 1000)} seconds... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
        reconnectTimeoutId = setTimeout(() => connectWebSocket(userId), delay);
      } else {
        console.log('WebSocket staying in demo mode');
      }
    };
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
    reconnectAttempts++;
  }
}

export function disconnectWebSocket() {
  shouldReconnect = false;
  clearReconnectTimeout();

  if (ws) {
    cleanupWebSocket();
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    ws = null;
  }
}

export function resetWebSocketState() {
  shouldReconnect = true;
  reconnectAttempts = 0;
  clearReconnectTimeout();
}

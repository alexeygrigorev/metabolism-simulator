// ============================================================================
// METABOLIC SIMULATOR - DEMO SIMULATION HOOK
// ============================================================================

import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '../state/store';
import { getActiveEffect, HORMONE_BASELINES, getCurrentBloodGlucose, getBloodGlucoseTrend } from '../utils/demoSimulation';

// Configuration for performance optimization
const UPDATE_INTERVAL = 200; // ms - reduced from 100ms for better CPU usage
const MIN_CHANGE_THRESHOLD = 0.1; // Minimum value change to trigger update

let updateInterval: NodeJS.Timeout | null = null;

export function useDemoSimulation() {
  const { state, connected, setState } = useSimulationStore();
  const previousHormones = useRef<Record<string, number>>({});
  const isUpdating = useRef(false);
  const pendingStateUpdate = useRef<ReturnType<typeof useSimulationStore>['state'] | null>(null);
  const stateUpdateScheduled = useRef(false);

  // Throttled state update using requestAnimationFrame for smoother renders
  const scheduleStateUpdate = useCallback((newState: typeof state) => {
    if (stateUpdateScheduled.current) {
      // Keep the most recent pending state
      pendingStateUpdate.current = newState;
      return;
    }

    pendingStateUpdate.current = newState;
    stateUpdateScheduled.current = true;

    requestAnimationFrame(() => {
      if (pendingStateUpdate.current) {
        setState(pendingStateUpdate.current);
        pendingStateUpdate.current = null;
      }
      stateUpdateScheduled.current = false;
    });
  }, [setState]);

  useEffect(() => {
    // Don't run demo simulation when connected to real server
    if (connected) {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
      return;
    }

    // Update hormone values based on active effects
    const updateSimulation = () => {
      if (isUpdating.current || !state) return;
      isUpdating.current = true;

      try {
        const hormones = { ...state.hormones };
        let hasChanges = false;

        // Update hormones
        (Object.keys(hormones) as Array<keyof typeof hormones>).forEach((hormoneName) => {
          const hormone = hormones[hormoneName];
          const baseline = HORMONE_BASELINES[hormoneName]?.baseline || hormone.baseline;

          // Check for active effect
          const effectValue = getActiveEffect(hormoneName);
          const newValue = effectValue ?? baseline;

          // Check if value changed significantly
          if (Math.abs(newValue - hormone.currentValue) > MIN_CHANGE_THRESHOLD) {
            hasChanges = true;

            // Calculate trend
            const previousValue = previousHormones.current[hormoneName] ?? baseline;
            let trend: -1 | 0 | 1 = 0;
            if (newValue > previousValue + 0.5) trend = 1;
            else if (newValue < previousValue - 0.5) trend = -1;

            hormones[hormoneName] = {
              ...hormone,
              currentValue: newValue,
              trend,
              peak: Math.max(hormone.peak, newValue),
              trough: Math.min(hormone.trough, newValue),
            };

            previousHormones.current[hormoneName] = newValue;
          }
        });

        // Update blood glucose
        const currentGlucose = getCurrentBloodGlucose();
        const glucoseTrend = getBloodGlucoseTrend();

        if (state.energy.bloodGlucose && Math.abs(currentGlucose - state.energy.bloodGlucose.currentValue) > 0.5) {
          hasChanges = true;
          state.energy.bloodGlucose = {
            ...state.energy.bloodGlucose,
            currentValue: currentGlucose,
            trend: glucoseTrend,
            peak: Math.max(state.energy.bloodGlucose.peak, currentGlucose),
          };
        }

        // Only schedule state update if there are meaningful changes
        if (hasChanges) {
          scheduleStateUpdate({ ...state, hormones, energy: state.energy });
        }
      } finally {
        isUpdating.current = false;
      }
    };

    // Optimized update interval for better performance
    updateInterval = setInterval(updateSimulation, UPDATE_INTERVAL);

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    };
  }, [state, connected, scheduleStateUpdate]);
}

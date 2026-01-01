// ============================================================================
// METABOLIC SIMULATOR - DEMO SIMULATION HOOK
// ============================================================================

import { useEffect, useRef } from 'react';
import { useSimulationStore } from '../state/store';
import { getActiveEffect, HORMONE_BASELINES } from '../utils/demoSimulation';

let updateInterval: NodeJS.Timeout | null = null;

export function useDemoSimulation() {
  const { state, connected, setState } = useSimulationStore();
  const previousHormones = useRef<Record<string, number>>({});
  const isUpdating = useRef(false);

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
    const updateHormones = () => {
      if (isUpdating.current || !state) return;
      isUpdating.current = true;

      try {
        const hormones = { ...state.hormones };
        let hasChanges = false;

        (Object.keys(hormones) as Array<keyof typeof hormones>).forEach((hormoneName) => {
          const hormone = hormones[hormoneName];
          const baseline = HORMONE_BASELINES[hormoneName]?.baseline || hormone.baseline;

          // Check for active effect
          const effectValue = getActiveEffect(hormoneName);
          const newValue = effectValue ?? baseline;

          // Check if value changed
          if (Math.abs(newValue - hormone.currentValue) > 0.01) {
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

        if (hasChanges) {
          setState({ ...state, hormones });
        }
      } finally {
        isUpdating.current = false;
      }
    };

    // Update every 100ms for smooth hormone transitions
    updateInterval = setInterval(updateHormones, 100);

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    };
  }, [state, connected, setState]);
}

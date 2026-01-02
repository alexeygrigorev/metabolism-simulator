// ============================================================================
// METABOLIC SIMULATOR - DEBOUNCED CALLBACK HOOK
// ============================================================================

import { useRef, useCallback, useEffect } from 'react';

/**
 * Creates a debounced version of a callback function.
 * Delays the execution of the function until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @param deps - Dependencies array for the callback
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fnRef = useRef(fn);

  // Keep the function reference updated
  useEffect(() => {
    fnRef.current = fn;
  }, [fn, ...deps]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Creates a throttled version of a callback function.
 * Ensures the function is called at most once per wait milliseconds.
 *
 * @param fn - The function to throttle
 * @param delay - The delay in milliseconds (default: 100ms)
 * @returns A throttled version of the callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 100
): T {
  const lastRunRef = useRef<number>(0); // Initialize to 0 to always call first time
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fnRef = useRef(fn);
  const argsRef = useRef<Parameters<T>>();

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      argsRef.current = args;
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now;
        fnRef.current(...args);
      } else {
        // Schedule a call for the end of the throttle window
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const remainingTime = delay - timeSinceLastRun;
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          if (argsRef.current) {
            fnRef.current(...argsRef.current);
          }
        }, remainingTime);
      }
    }) as T,
    [delay]
  );
}

/**
 * Cleanup effect for debounced/throttled callbacks
 * Call this in components to clear pending timeouts on unmount
 */
export function useCleanupTimeout() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const registerTimeout = useCallback((timeout: NodeJS.Timeout) => {
    timeoutsRef.current.add(timeout);
    return timeout;
  }, []);

  return { registerTimeout };
}

/**
 * Hook for requestAnimationFrame-based updates
 * Useful for smooth animations and UI updates
 */
export function useRafCallback<T extends (...args: any[]) => any>(
  fn: T
): T {
  const rafRef = useRef<number>();
  const fnRef = useRef(fn);
  const argsRef = useRef<Parameters<T>>();
  const isRafSupported = typeof requestAnimationFrame !== 'undefined';

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (rafRef.current && isRafSupported) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isRafSupported]);

  return useCallback(
    ((...args: Parameters<T>) => {
      argsRef.current = args;

      if (rafRef.current && isRafSupported) {
        cancelAnimationFrame(rafRef.current);
      }

      if (isRafSupported) {
        rafRef.current = requestAnimationFrame(() => {
          if (argsRef.current !== undefined) {
            fnRef.current(...argsRef.current);
          }
        });
      } else {
        // Fallback for environments without RAF (e.g., some test environments)
        setTimeout(() => {
          if (argsRef.current !== undefined) {
            fnRef.current(...argsRef.current);
          }
        }, 0);
      }
    }) as T,
    [isRafSupported]
  );
}

/**
 * Hook to batch multiple state updates into a single render
 * Uses React's automatic batching (React 18+) but provides
 * explicit control for complex scenarios
 */
export function useBatchedUpdates() {
  const updatesRef = useRef<Set<() => void>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const scheduleUpdate = useCallback((update: () => void) => {
    updatesRef.current.add(update);

    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        // Execute all updates in the same event loop tick
        updatesRef.current.forEach(fn => fn());
        updatesRef.current.clear();
        timeoutRef.current = undefined;
      }, 0);
    }
  }, []);

  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    updatesRef.current.forEach(fn => fn());
    updatesRef.current.clear();
    timeoutRef.current = undefined;
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { scheduleUpdate, flushUpdates };
}

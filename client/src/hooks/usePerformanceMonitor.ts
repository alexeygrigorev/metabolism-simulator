// ============================================================================
// METABOLIC SIMULATOR - PERFORMANCE MONITORING HOOK
// ============================================================================

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

const isDevelopment = import.meta.env.DEV;

/**
 * Hook to monitor component render performance in development.
 * Tracks render count and render times to identify performance bottlenecks.
 */
export function usePerformanceMonitor(componentName: string, enabled = isDevelopment) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const renderStartTime = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    renderTime: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      renderCount.current++;
      renderTimes.current.push(renderTime);

      // Keep only last 100 renders
      if (renderTimes.current.length > 100) {
        renderTimes.current.shift();
      }

      const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;

      setMetrics({
        renderCount: renderCount.current,
        renderTime,
        averageRenderTime,
        lastRenderTime: renderTime,
      });

      // Warn about slow renders
      if (renderTime > 16) {
        console.warn(
          `[Performance Monitor] ${componentName} took ${renderTime.toFixed(2)}ms to render (target: <16ms)`
        );
      }
    };
  });

  return {
    metrics,
    // Log performance summary
    logSummary: () => {
      if (!enabled) return;
      console.group(`[Performance Monitor] ${componentName}`);
      console.log(`Total renders: ${metrics.renderCount}`);
      console.log(`Last render: ${metrics.lastRenderTime.toFixed(2)}ms`);
      console.log(`Average render: ${metrics.averageRenderTime.toFixed(2)}ms`);
      console.groupEnd();
    },
  };
}

/**
 * Hook to measure async operation performance
 */
export function useAsyncPerfMonitor(enabled = isDevelopment) {
  const measure = useCallback((name: string, fn: () => Promise<void> | void) => {
    if (!enabled) return fn();

    return async () => {
      const start = performance.now();
      try {
        await fn();
        const duration = performance.now() - start;
        if (duration > 100) {
          console.warn(`[Performance Monitor] ${name} took ${duration.toFixed(2)}ms`);
        }
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`[Performance Monitor] ${name} failed after ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
  }, [enabled]);

  return { measure };
}

import { useCallback } from 'react';

/**
 * Hook to debounce a value with performance tracking
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to throttle a function with performance tracking
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastRun = useRef<number>(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Hook to track idle time for background tasks
 */
export function useIdleCallback(callback: () => void, delay: number = 50) {
  const timeoutRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);
}

// Window idle detection for heavy computations
export function useWindowIdle() {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let idleTimeout: number;

    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimeout);
      idleTimeout = window.setTimeout(() => {
        setIsIdle(true);
      }, 2000); // Consider idle after 2 seconds of no activity
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetIdleTimer, { passive: true }));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
    };
  }, []);

  return isIdle;
}

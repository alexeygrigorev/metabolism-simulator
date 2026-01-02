// ============================================================================
// METABOLIC SIMULATOR - OFFLINE MODE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOffline } from '../../src/hooks/useOffline';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.onLine
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useOffline Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset online status
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('should initialize with online status', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should detect offline status', async () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });
  });

  it('should detect coming back online', async () => {
    const { result } = renderHook(() => useOffline());

    // Go offline
    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true);
    });

    // Come back online
    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });
  });

  it('should queue actions when offline', () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      const actionId = result.current.queueAction('meal', { name: 'Test Meal', calories: 500 });
      expect(actionId).toBeTruthy();
      expect(typeof actionId).toBe('string');
    });

    expect(result.current.queueSize).toBe(1);
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].type).toBe('meal');
  });

  it('should persist queued actions to localStorage', () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      result.current.queueAction('exercise', { name: 'Squat', sets: 5 });
    });

    const stored = localStorage.getItem('metabol-sim-offline-queue');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].type).toBe('exercise');
  });

  it('should load queued actions from localStorage on mount', () => {
    const existingQueue = [
      { id: '1', type: 'meal' as const, timestamp: Date.now(), payload: { calories: 500 } },
      { id: '2', type: 'sleep' as const, timestamp: Date.now(), payload: { duration: 8 } },
    ];
    localStorage.setItem('metabol-sim-offline-queue', JSON.stringify(existingQueue));

    const { result } = renderHook(() => useOffline());

    expect(result.current.queueSize).toBe(2);
    expect(result.current.queue[0].type).toBe('meal');
    expect(result.current.queue[1].type).toBe('sleep');
  });

  it('should dequeue action by id', () => {
    const { result } = renderHook(() => useOffline());

    let actionId: string;
    act(() => {
      actionId = result.current.queueAction('stress', { level: 5 });
    });

    expect(result.current.queueSize).toBe(1);

    act(() => {
      result.current.dequeueAction(actionId!);
    });

    expect(result.current.queueSize).toBe(0);
  });

  it('should clear all queued actions', () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      result.current.queueAction('meal', { calories: 300 });
      result.current.queueAction('exercise', { duration: 30 });
    });

    expect(result.current.queueSize).toBe(2);

    act(() => {
      result.current.clearQueue();
    });

    expect(result.current.queueSize).toBe(0);
    expect(localStorage.getItem('metabol-sim-offline-queue')).toBeNull();
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useOffline());
    const testState = { user: { age: 30, weight: 75 } };

    act(() => {
      result.current.persistState(testState);
    });

    const stored = localStorage.getItem('metabol-sim-state-cache');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state).toEqual(testState);
    expect(parsed.timestamp).toBeTruthy();
  });

  it('should load persisted state from localStorage', () => {
    const testState = { energy: { calories: 2000, bmr: 1800 } };
    const cached = {
      timestamp: Date.now(),
      state: testState,
    };
    localStorage.setItem('metabol-sim-state-cache', JSON.stringify(cached));

    const { result } = renderHook(() => useOffline());
    const loaded = result.current.loadPersistedState<typeof testState>();

    expect(loaded).toEqual(testState);
  });

  it('should not load state older than 24 hours', () => {
    const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    const testState = { user: { age: 25 } };
    const cached = {
      timestamp: oldTimestamp,
      state: testState,
    };
    localStorage.setItem('metabol-sim-state-cache', JSON.stringify(cached));

    const { result } = renderHook(() => useOffline());
    const loaded = result.current.loadPersistedState();

    expect(loaded).toBeNull();
    expect(localStorage.getItem('metabol-sim-state-cache')).toBeNull();
  });

  it('should update last online time when coming online', async () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.lastOnlineTime).toBeTruthy();
    });

    const stored = localStorage.getItem('metabol-sim-last-online');
    expect(stored).toBeTruthy();
    const timestamp = parseInt(stored!);
    expect(timestamp).toBeGreaterThan(Date.now() - 1000);
  });
});

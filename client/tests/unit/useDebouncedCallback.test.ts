// ============================================================================
// METABOLIC SIMULATOR - DEBOUNCED CALLBACK HOOK UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebouncedCallback, useThrottledCallback, useRafCallback, useBatchedUpdates } from '../../src/hooks/useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delay function execution', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn, 300));

    act(() => {
      result.current('test');
    });

    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should reset delay on subsequent calls', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn, 300));

    act(() => {
      result.current('first');
      vi.advanceTimersByTime(200);
      result.current('second');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should use default delay of 300ms', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn));

    act(() => {
      result.current('test');
      vi.advanceTimersByTime(299);
    });

    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should pass multiple arguments', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn, 100));

    act(() => {
      result.current('arg1', 'arg2', 42);
      vi.advanceTimersByTime(100);
    });

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 42);
  });
});

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call function immediately on first invocation', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(mockFn, 100));

    act(() => {
      result.current('test');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should throttle subsequent calls within delay period', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(mockFn, 100));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Last call should be executed after throttle window
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith('third');
  });

  it('should allow calls after delay period', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(mockFn, 100));

    act(() => {
      result.current('first');
      vi.advanceTimersByTime(100);
      result.current('second');
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should use default delay of 100ms', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(mockFn));

    act(() => {
      result.current('first');
      result.current('second');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(99);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe('useRafCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should execute function on next animation frame', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useRafCallback(mockFn));

    act(() => {
      result.current('test');
    });

    // RAF falls back to setTimeout in test environment
    act(() => {
      vi.runAllTimers();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should cancel pending RAF on new call', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useRafCallback(mockFn));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  it('should pass latest arguments to callback', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useRafCallback(mockFn));

    act(() => {
      result.current(1);
      result.current(2);
      result.current(3);
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(mockFn).toHaveBeenCalledWith(3);
  });
});

describe('useBatchedUpdates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should batch multiple updates into single execution', () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();
    const mockFn3 = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates());

    act(() => {
      result.current.scheduleUpdate(mockFn1);
      result.current.scheduleUpdate(mockFn2);
      result.current.scheduleUpdate(mockFn3);
    });

    expect(mockFn1).not.toHaveBeenCalled();
    expect(mockFn2).not.toHaveBeenCalled();
    expect(mockFn3).not.toHaveBeenCalled();

    act(() => {
      vi.runAllTimers();
    });

    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).toHaveBeenCalledTimes(1);
    expect(mockFn3).toHaveBeenCalledTimes(1);
  });

  it('should flush updates immediately when requested', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates());

    act(() => {
      result.current.scheduleUpdate(mockFn);
    });

    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      result.current.flushUpdates();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle empty batch', () => {
    const { result } = renderHook(() => useBatchedUpdates());

    expect(() => {
      act(() => {
        result.current.flushUpdates();
      });
    }).not.toThrow();
  });

  it('should clear pending updates on unmount', () => {
    const mockFn = vi.fn();
    const { result, unmount } = renderHook(() => useBatchedUpdates());

    act(() => {
      result.current.scheduleUpdate(mockFn);
    });

    unmount();

    act(() => {
      vi.runAllTimers();
    });

    // Should not execute after unmount
    expect(mockFn).not.toHaveBeenCalled();
  });
});

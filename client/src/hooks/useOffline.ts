// ============================================================================
// METABOLIC SIMULATOR - OFFLINE MODE HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasRecentlyOnline: boolean;
  lastOnlineTime: Date | null;
}

const STORAGE_KEY = 'metabol-sim-offline-queue';
const LAST_ONLINE_KEY = 'metabol-sim-last-online';

interface QueuedAction {
  id: string;
  type: 'meal' | 'exercise' | 'sleep' | 'stress' | 'settings';
  timestamp: number;
  payload: unknown;
}

/**
 * Hook for managing offline mode and data persistence
 * Provides online/offline status detection and action queuing
 */
export function useOffline() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    wasRecentlyOnline: true,
    lastOnlineTime: getLastOnlineTime(),
  });

  const [queue, setQueue] = useState<QueuedAction[]>(getQueuedActions);

  // Get last online time from localStorage
  function getLastOnlineTime(): Date | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(LAST_ONLINE_KEY);
    return stored ? new Date(parseInt(stored)) : null;
  }

  // Get queued actions from localStorage
  function getQueuedActions(): QueuedAction[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Save last online time
  const updateLastOnlineTime = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_ONLINE_KEY, Date.now().toString());
    }
  }, []);

  // Save queue to localStorage
  const saveQueue = useCallback((actions: QueuedAction[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
    }
  }, []);

  // Handle online status change
  useEffect(() => {
    const handleOnline = () => {
      const now = Date.now();
      updateLastOnlineTime();
      setStatus({
        isOnline: true,
        isOffline: false,
        wasRecentlyOnline: true,
        lastOnlineTime: new Date(now),
      });
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isOffline: true,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync
    if (navigator.onLine) {
      updateLastOnlineTime();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateLastOnlineTime]);

  // Queue an action for when we go back online
  const queueAction = useCallback((type: QueuedAction['type'], payload: unknown) => {
    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      timestamp: Date.now(),
      payload,
    };

    setQueue(prev => {
      const updated = [...prev, action];
      saveQueue(updated);
      return updated;
    });

    return action.id;
  }, [saveQueue]);

  // Remove an action from the queue (after successful sync)
  const dequeueAction = useCallback((actionId: string) => {
    setQueue(prev => {
      const updated = prev.filter(a => a.id !== actionId);
      saveQueue(updated);
      return updated;
    });
  }, [saveQueue]);

  // Clear all queued actions
  const clearQueue = useCallback(() => {
    setQueue([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Retry all queued actions
  const retryQueue = useCallback(async () => {
    if (!status.isOnline) return 0;

    let synced = 0;
    const toRemove: string[] = [];

    // Dispatch custom event for components to handle
    queue.forEach(action => {
      const event = new CustomEvent('offline-sync', {
        detail: action,
      });
      window.dispatchEvent(event);
      toRemove.push(action.id);
      synced++;
    });

    // Remove synced actions
    if (toRemove.length > 0) {
      setQueue(prev => {
        const updated = prev.filter(a => !toRemove.includes(a.id));
        saveQueue(updated);
        return updated;
      });
    }

    return synced;
  }, [status.isOnline, queue, saveQueue]);

  // Persist simulation state to localStorage
  const persistState = useCallback((state: unknown) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('metabol-sim-state-cache', JSON.stringify({
        timestamp: Date.now(),
        state,
      }));
    } catch (e) {
      console.warn('Failed to persist state to localStorage:', e);
    }
  }, []);

  // Load persisted state from localStorage
  const loadPersistedState = useCallback(<T, >(): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('metabol-sim-state-cache');
      if (!stored) return null;

      const cached = JSON.parse(stored) as { timestamp: number; state: T };
      // Only return state if less than 24 hours old
      const age = Date.now() - cached.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('metabol-sim-state-cache');
        return null;
      }

      return cached.state;
    } catch {
      return null;
    }
  }, []);

  return {
    ...status,
    queue,
    queueSize: queue.length,
    queueAction,
    dequeueAction,
    clearQueue,
    retryQueue,
    persistState,
    loadPersistedState,
  };
}

export default useOffline;

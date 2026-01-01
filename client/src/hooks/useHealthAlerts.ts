// ============================================================================
// METABOLIC SIMULATOR - HEALTH ALERTS HOOK
// ============================================================================
//
// Monitors metabolic state in real-time and generates alerts when
// values reach concerning thresholds.
//
// Usage:
//   const { activeAlerts, alertCounts, dismissAlert, hasCriticalAlerts } = useHealthAlerts();
// ============================================================================

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useSimulationStore } from '../state/store';
import {
  getActiveAlerts,
  type AlertThreshold,
  type AlertLevel,
} from '../data/alertThresholds';

export type { AlertLevel };

export interface HealthAlert extends AlertThreshold {
  timestamp: number;
  isNew: boolean;
}

export interface AlertCounts {
  critical: number;
  warning: number;
  advisory: number;
  total: number;
}

const STORAGE_KEY = 'metabol-sim-dismissed-alerts';

/**
 * Load dismissed alerts from localStorage
 */
function loadDismissedAlerts(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Failed to load dismissed alerts:', e);
  }
  return new Set();
}

/**
 * Save dismissed alerts to localStorage
 */
function saveDismissedAlerts(dismissed: Set<string>) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed]));
  } catch (e) {
    console.error('Failed to save dismissed alerts:', e);
  }
}

/**
 * Hook for managing health alerts
 */
export function useHealthAlerts() {
  const { state } = useSimulationStore();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [previousAlertIds, setPreviousAlertIds] = useState<Set<string>>(new Set());

  // Load dismissed alerts on mount
  useEffect(() => {
    setDismissedAlerts(loadDismissedAlerts());
  }, []);

  // Calculate active alerts
  const activeAlerts = useMemo((): HealthAlert[] => {
    if (!state) return [];

    const alerts = getActiveAlerts(state, dismissedAlerts);

    // Determine which alerts are new (not in previous batch)
    const newAlertIds = new Set(alerts.map(a => a.id));
    const newAlerts = alerts.filter(alert => !previousAlertIds.has(alert.id));

    return alerts.map(alert => ({
      ...alert,
      timestamp: Date.now(),
      isNew: newAlerts.some(a => a.id === alert.id),
    }));
  }, [state, dismissedAlerts, previousAlertIds]);

  // Update previous alert IDs after active alerts calculation
  useEffect(() => {
    if (state) {
      const currentAlertIds = new Set(getActiveAlerts(state, dismissedAlerts).map(a => a.id));
      setPreviousAlertIds(currentAlertIds);
    }
  }, [state, dismissedAlerts]);

  // Calculate alert counts based on active (non-dismissed) alerts
  const alertCounts = useMemo((): AlertCounts => {
    const critical = activeAlerts.filter(a => a.level === 'critical').length;
    const warning = activeAlerts.filter(a => a.level === 'warning').length;
    const advisory = activeAlerts.filter(a => a.level === 'advisory').length;
    return {
      critical,
      warning,
      advisory,
      total: critical + warning + advisory,
    };
  }, [activeAlerts]);

  // Check if any critical alerts exist
  const hasCriticalAlerts = alertCounts.critical > 0;
  const hasWarningAlerts = alertCounts.warning > 0;
  const hasAnyAlerts = alertCounts.total > 0;

  /**
   * Dismiss a specific alert
   */
  const dismissAlert = useCallback((alertId: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(alertId);
    setDismissedAlerts(newDismissed);
    saveDismissedAlerts(newDismissed);
  }, [dismissedAlerts]);

  /**
   * Dismiss all alerts of a specific level
   */
  const dismissAlertsByLevel = useCallback((level: AlertLevel) => {
    const newDismissed = new Set(dismissedAlerts);
    activeAlerts
      .filter(alert => alert.level === level)
      .forEach(alert => newDismissed.add(alert.id));
    setDismissedAlerts(newDismissed);
    saveDismissedAlerts(newDismissed);
  }, [dismissedAlerts, activeAlerts]);

  /**
   * Dismiss all alerts
   */
  const dismissAll = useCallback(() => {
    const newDismissed = new Set(dismissedAlerts);
    activeAlerts.forEach(alert => newDismissed.add(alert.id));
    setDismissedAlerts(newDismissed);
    saveDismissedAlerts(newDismissed);
  }, [dismissedAlerts, activeAlerts]);

  /**
   * Clear all dismissed alerts (reset)
   */
  const clearDismissed = useCallback(() => {
    const empty = new Set<string>();
    setDismissedAlerts(empty);
    saveDismissedAlerts(empty);
  }, []);

  /**
   * Get alerts grouped by level
   */
  const alertsByLevel = useMemo(() => {
    return {
      critical: activeAlerts.filter(a => a.level === 'critical'),
      warning: activeAlerts.filter(a => a.level === 'warning'),
      advisory: activeAlerts.filter(a => a.level === 'advisory'),
    };
  }, [activeAlerts]);

  /**
   * Get new alerts (recently triggered)
   */
  const newAlerts = useMemo(() => {
    return activeAlerts.filter(a => a.isNew);
  }, [activeAlerts]);

  return {
    // Active alerts
    activeAlerts,
    alertsByLevel,
    newAlerts,

    // Alert counts
    alertCounts,
    hasCriticalAlerts,
    hasWarningAlerts,
    hasAnyAlerts,

    // Actions
    dismissAlert,
    dismissAlertsByLevel,
    dismissAll,
    clearDismissed,
  };
}

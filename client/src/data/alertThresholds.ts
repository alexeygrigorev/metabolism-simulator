// ============================================================================
// METABOLIC SIMULATOR - HEALTH ALERT THRESHOLDS
// ============================================================================
//
// Defines the threshold values at which health alerts are triggered.
// These alerts provide real-time feedback when metabolic values reach
// concerning levels.
//
// Alert Levels:
// - critical: Immediate attention required (red)
// - warning: Should be addressed soon (orange)
// - advisory: Informational (yellow)
// ============================================================================

import type { HormoneName } from '@metabol-sim/shared';

export type AlertLevel = 'critical' | 'warning' | 'advisory';
export type AlertCategory = 'hormone' | 'metabolic' | 'recovery' | 'lifestyle';

export interface AlertThreshold {
  id: string;
  category: AlertCategory;
  level: AlertLevel;
  // Threshold conditions
  hormone?: HormoneName;
  condition: (value: number, baseline: number, state: any) => boolean;
  // Alert display
  title: string;
  message: string;
  recommendation: string;
  // Icon and color for UI
  icon: string;
  color: string;
}

// ============================================================================
// HORMONE ALERT THRESHOLDS
// ============================================================================

/** Insulin-related alerts */
const INSULIN_ALERTS: AlertThreshold[] = [
  {
    id: 'insulin-critical',
    category: 'hormone',
    level: 'critical',
    hormone: 'insulin',
    condition: (val) => val > 35,
    title: 'Critical Insulin Elevation',
    message: 'Insulin levels are dangerously high. This indicates severe insulin resistance.',
    recommendation: 'Immediately reduce carbohydrate intake and engage in physical activity.',
    icon: '🚨',
    color: '#ef4444',
  },
  {
    id: 'insulin-warning',
    category: 'hormone',
    level: 'warning',
    hormone: 'insulin',
    condition: (val) => val > 25,
    title: 'Elevated Insulin',
    message: 'Insulin is elevated, suggesting developing insulin resistance.',
    recommendation: 'Reduce refined carbohydrates and increase activity to improve sensitivity.',
    icon: '⚠️',
    color: '#f97316',
  },
  {
    id: 'insulin-advisory',
    category: 'hormone',
    level: 'advisory',
    hormone: 'insulin',
    condition: (val) => val > 15,
    title: 'Rising Insulin',
    message: 'Insulin is above baseline. Consider the impact of recent meals.',
    recommendation: 'Opt for lower glycemic index foods to maintain stable insulin.',
    icon: 'ℹ️',
    color: '#eab308',
  },
];

/** Cortisol-related alerts */
const CORTISOL_ALERTS: AlertThreshold[] = [
  {
    id: 'cortisol-critical',
    category: 'hormone',
    level: 'critical',
    hormone: 'cortisol',
    condition: (val) => val > 30,
    title: 'Chronic Stress Detected',
    message: 'Cortisol is critically high. This impairs muscle growth and promotes fat storage.',
    recommendation: 'Prioritize stress reduction: meditation, sleep, and remove stressors.',
    icon: '🚨',
    color: '#ef4444',
  },
  {
    id: 'cortisol-warning',
    category: 'hormone',
    level: 'warning',
    hormone: 'cortisol',
    condition: (val) => val > 20,
    title: 'High Stress Hormone',
    message: 'Cortisol is elevated, which can interfere with recovery and hormone balance.',
    recommendation: 'Consider stress management techniques and ensure adequate rest.',
    icon: '⚠️',
    color: '#f97316',
  },
];

/** Testosterone-related alerts */
const TESTOSTERONE_ALERTS: AlertThreshold[] = [
  {
    id: 'testosterone-critical',
    category: 'hormone',
    level: 'critical',
    hormone: 'testosterone',
    condition: (val, base) => val < base * 0.4,
    title: 'Critically Low Testosterone',
    message: 'Testosterone has dropped to critically low levels.',
    recommendation: 'Focus on sleep, stress reduction, and resistance training.',
    icon: '🚨',
    color: '#ef4444',
  },
  {
    id: 'testosterone-warning',
    category: 'hormone',
    level: 'warning',
    hormone: 'testosterone',
    condition: (val, base) => val < base * 0.6,
    title: 'Low Testosterone',
    message: 'Testosterone is below optimal range for muscle building.',
    recommendation: 'Prioritize recovery, quality sleep, and resistance exercise.',
    icon: '⚠️',
    color: '#f97316',
  },
];

/** Blood glucose alerts */
const BLOOD_GLUCOSE_ALERTS: AlertThreshold[] = [
  {
    id: 'bg-critical-high',
    category: 'metabolic',
    level: 'critical',
    hormone: undefined,
    condition: (_val, _base, state) => state?.energy?.bloodGlucose?.currentValue > 180,
    title: 'Dangerously High Blood Sugar',
    message: 'Blood glucose is in the diabetic range.',
    recommendation: 'Immediate physical activity recommended. Avoid carbohydrates.',
    icon: '🚨',
    color: '#ef4444',
  },
  {
    id: 'bg-critical-low',
    category: 'metabolic',
    level: 'critical',
    hormone: undefined,
    condition: (_val, _base, state) => state?.energy?.bloodGlucose?.currentValue < 55,
    title: 'Hypoglycemia Warning',
    message: 'Blood sugar is dangerously low.',
    recommendation: 'Consume fast-acting carbohydrates immediately.',
    icon: '🚨',
    color: '#ef4444',
  },
  {
    id: 'bg-warning-high',
    category: 'metabolic',
    level: 'warning',
    hormone: undefined,
    condition: (_val, _base, state) => state?.energy?.bloodGlucose?.currentValue > 140,
    title: 'Elevated Blood Glucose',
    message: 'Blood sugar is above healthy range.',
    recommendation: 'Consider a walk to help lower glucose naturally.',
    icon: '⚠️',
    color: '#f97316',
  },
];

// ============================================================================
// RECOVERY ALERTS
// ============================================================================

const RECOVERY_ALERTS: AlertThreshold[] = [
  {
    id: 'muscle-damage-critical',
    category: 'recovery',
    level: 'critical',
    hormone: undefined,
    condition: (_val, _base, state) => state?.muscle?.recoveryStatus?.muscleDamage > 0.4,
    title: 'Significant Muscle Damage',
    message: 'Muscle damage is high. Additional training could be counterproductive.',
    recommendation: 'Take rest days, focus on nutrition and sleep for recovery.',
    icon: '🚨',
    color: '#ef4444',
  },
  {
    id: 'sleep-debt-critical',
    category: 'lifestyle',
    level: 'critical',
    hormone: undefined,
    condition: (_val, _base, state) => state?.muscle?.recoveryStatus?.sleepDebt > 4,
    title: 'Critical Sleep Debt',
    message: 'Severe sleep deprivation detected. This severely impacts hormones.',
    recommendation: 'Prioritize sleep immediately. Aim for 8+ hours tonight.',
    icon: '🚨',
    color: '#ef4444',
  },
  {
    id: 'glycogen-depleted',
    category: 'metabolic',
    level: 'warning',
    hormone: undefined,
    condition: (_val, _base, state) => {
      const muscleGlycogen = state?.energy?.glycogen?.muscle || 1;
      const liverGlycogen = state?.energy?.glycogen?.liver || 1;
      return (muscleGlycogen + liverGlycogen) / 2 < 0.3;
    },
    title: 'Low Glycogen Stores',
    message: 'Glycogen is depleted. Performance will be compromised.',
    recommendation: 'Consume complex carbohydrates to restore energy stores.',
    icon: '⚠️',
    color: '#f97316',
  },
  {
    id: 'central-fatigue',
    category: 'recovery',
    level: 'warning',
    hormone: undefined,
    condition: (_val, _base, state) => state?.muscle?.recoveryStatus?.centralFatigue > 0.5,
    title: 'High Central Fatigue',
    message: 'Central nervous system fatigue is elevated.',
    recommendation: 'Reduce training intensity and prioritize rest.',
    icon: '⚠️',
    color: '#f97316',
  },
];

// ============================================================================
// LIFESTYLE ALERTS
// ============================================================================

const LIFESTYLE_ALERTS: AlertThreshold[] = [
  {
    id: 'fasting-extended',
    category: 'lifestyle',
    level: 'advisory',
    hormone: undefined,
    condition: (_val, _base, state) => {
      const lastMeal = state?.recentMeals?.[0];
      if (!lastMeal) return false;
      const hoursSinceMeal = (Date.now() - new Date(lastMeal.time).getTime()) / (1000 * 60 * 60);
      return hoursSinceMeal > 16;
    },
    title: 'Extended Fast',
    message: 'You have been fasting for over 16 hours.',
    recommendation: 'Consider breaking the fast if you feel unwell. Stay hydrated.',
    icon: 'ℹ️',
    color: '#eab308',
  },
];

// ============================================================================
// COMBINED ALERT THRESHOLDS
// ============================================================================

export const ALERT_THRESHOLDS: AlertThreshold[] = [
  ...INSULIN_ALERTS,
  ...CORTISOL_ALERTS,
  ...TESTOSTERONE_ALERTS,
  ...BLOOD_GLUCOSE_ALERTS,
  ...RECOVERY_ALERTS,
  ...LIFESTYLE_ALERTS,
];

// ============================================================================
// ALERT HELPERS
// ============================================================================

/**
 * Get alert level configuration for UI rendering
 */
export function getAlertConfig(level: AlertLevel) {
  switch (level) {
    case 'critical':
      return {
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500',
        textColor: 'text-red-400',
        iconBg: 'bg-red-500/20',
      };
    case 'warning':
      return {
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-400',
        iconBg: 'bg-orange-500/20',
      };
    case 'advisory':
      return {
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-400',
        iconBg: 'bg-yellow-500/20',
      };
    default:
      return {
        bgColor: 'bg-slate-500/20',
        borderColor: 'border-slate-500',
        textColor: 'text-slate-400',
        iconBg: 'bg-slate-500/20',
      };
  }
}

/**
 * Check if an alert should be triggered based on current state
 */
export function evaluateAlertThreshold(threshold: AlertThreshold, state: any): boolean {
  try {
    // Get the relevant value
    let value = 0;
    let baseline = 0;

    if (threshold.hormone) {
      const hormoneData = state?.hormones?.[threshold.hormone];
      if (!hormoneData) return false;
      value = hormoneData.currentValue;
      baseline = hormoneData.baseline;
    }

    return threshold.condition(value, baseline, state);
  } catch {
    return false;
  }
}

/**
 * Get all active alerts for the current state
 */
export function getActiveAlerts(state: any, dismissedAlerts: Set<string> = new Set()) {
  if (!state) return [];

  return ALERT_THRESHOLDS
    .filter(threshold => !dismissedAlerts.has(threshold.id))
    .filter(threshold => evaluateAlertThreshold(threshold, state))
    .sort((a, b) => {
      // Sort by level (critical first), then category
      const levelOrder = { critical: 0, warning: 1, advisory: 2 };
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      return a.id.localeCompare(b.id);
    });
}

/**
 * Get alert count by level
 */
export function getAlertCountByLevel(state: any) {
  const alerts = getActiveAlerts(state);
  return {
    critical: alerts.filter(a => a.level === 'critical').length,
    warning: alerts.filter(a => a.level === 'warning').length,
    advisory: alerts.filter(a => a.level === 'advisory').length,
    total: alerts.length,
  };
}

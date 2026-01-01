// ============================================================================
// METABOLIC SIMULATOR - HEALTH ALERTS PANEL COMPONENT
// ============================================================================
//
// Displays real-time health alerts based on metabolic thresholds.
// Shows critical, warning, and advisory alerts with dismiss functionality.
// ============================================================================

import { memo, useState, useMemo } from 'react';
import { useHealthAlerts } from '../../hooks/useHealthAlerts';
import { getAlertConfig } from '../../data/alertThresholds';
import type { AlertLevel, HealthAlert } from '../../hooks/useHealthAlerts';

// Individual alert card component
const AlertCard = memo(function AlertCard({
  alert,
  onDismiss,
}: {
  alert: HealthAlert;
  onDismiss: (id: string) => void;
}) {
  const config = getAlertConfig(alert.level);

  return (
    <div
      className={`relative ${config.bgColor} border ${config.borderColor} rounded-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center text-xl`}>
          {alert.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-semibold ${config.textColor}`}>{alert.title}</h4>

            {/* Dismiss button */}
            <button
              onClick={() => onDismiss(alert.id)}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-0.5 rounded hover:bg-slate-700/50"
              aria-label="Dismiss alert"
              title="Dismiss this alert"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-slate-300 mb-2">{alert.message}</p>

          {/* Recommendation */}
          <div className="flex items-start gap-2 text-xs">
            <span className={`flex-shrink-0 ${config.textColor}`}>💡</span>
            <p className="text-slate-400">{alert.recommendation}</p>
          </div>

          {/* Category badge */}
          <div className="mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 capitalize">
              {alert.category}
            </span>
          </div>
        </div>
      </div>

      {/* New indicator */}
      {alert.isNew && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      )}
    </div>
  );
});

// Alert section component (groups alerts by level)
const AlertSection = memo(function AlertSection({
  title,
  alerts,
  level,
  onDismiss,
  onDismissAll,
}: {
  title: string;
  alerts: HealthAlert[];
  level: AlertLevel;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}) {
  if (alerts.length === 0) return null;

  const config = getAlertConfig(level);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${config.textColor} flex items-center gap-2`}>
          {title}
          <span className={`px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor} text-xs`}>
            {alerts.length}
          </span>
        </h3>
        <button
          onClick={onDismissAll}
          className="text-xs text-slate-400 hover:text-white transition-colors underline"
        >
          Dismiss all
        </button>
      </div>
      {alerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  );
});

// Empty state component
const EmptyState = memo(function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">✅</div>
      <h3 className="text-white font-semibold mb-1">All Systems Normal</h3>
      <p className="text-sm text-slate-400">
        Your metabolic markers are within healthy ranges.
      </p>
      <p className="text-xs text-slate-500 mt-2">
        Alerts will appear here when values need attention.
      </p>
    </div>
  );
});

// Main HealthAlertsPanel component
const HealthAlertsPanel = memo(function HealthAlertsPanel({
  showEmpty = true,
  maxAlerts = 10,
}: {
  showEmpty?: boolean;
  maxAlerts?: number;
}) {
  const {
    alertsByLevel,
    alertCounts,
    dismissAlert,
    dismissAlertsByLevel,
    hasAnyAlerts,
  } = useHealthAlerts();

  // Limit number of alerts shown per level
  const limitedAlerts = useMemo(() => ({
    critical: alertsByLevel.critical.slice(0, maxAlerts),
    warning: alertsByLevel.warning.slice(0, maxAlerts),
    advisory: alertsByLevel.advisory.slice(0, maxAlerts),
  }), [alertsByLevel, maxAlerts]);

  if (!hasAnyAlerts && !showEmpty) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <h2 className="text-lg font-semibold text-white">Health Alerts</h2>
        </div>

        {alertCounts.total > 0 && (
          <div className="flex items-center gap-1.5">
            {alertCounts.critical > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                {alertCounts.critical} Critical
              </span>
            )}
            {alertCounts.warning > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                {alertCounts.warning} Warning
              </span>
            )}
            {alertCounts.advisory > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                {alertCounts.advisory}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Alert sections */}
      <div className="space-y-4">
        {!hasAnyAlerts ? (
          <EmptyState />
        ) : (
          <>
            <AlertSection
              title="Critical"
              alerts={limitedAlerts.critical}
              level="critical"
              onDismiss={dismissAlert}
              onDismissAll={() => dismissAlertsByLevel('critical')}
            />

            <AlertSection
              title="Warnings"
              alerts={limitedAlerts.warning}
              level="warning"
              onDismiss={dismissAlert}
              onDismissAll={() => dismissAlertsByLevel('warning')}
            />

            <AlertSection
              title="Advisories"
              alerts={limitedAlerts.advisory}
              level="advisory"
              onDismiss={dismissAlert}
              onDismissAll={() => dismissAlertsByLevel('advisory')}
            />
          </>
        )}
      </div>

      {/* Educational footer */}
      {hasAnyAlerts && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            Alerts are based on real-time metabolic monitoring. Address critical alerts first
            to maintain optimal health and performance.
          </p>
        </div>
      )}
    </div>
  );
});

export default HealthAlertsPanel;

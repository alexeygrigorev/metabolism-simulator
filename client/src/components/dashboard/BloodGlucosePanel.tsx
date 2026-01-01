// ============================================================================
// METABOLIC SIMULATOR - BLOOD GLUCOSE PANEL COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { selectBloodGlucose } from '../../state/selectors';
import { memo, useMemo } from 'react';

// Glucose zone definitions (mg/dL)
const GLUCOSE_ZONES = {
  hypoglycemia: { max: 70, label: 'Hypoglycemia', color: 'bg-red-500', description: 'Low blood sugar' },
  normal: { min: 70, max: 100, label: 'Normal', color: 'bg-green-500', description: 'Optimal range' },
  elevated: { min: 100, max: 140, label: 'Elevated', color: 'bg-yellow-500', description: 'Above optimal' },
  high: { min: 140, max: 200, label: 'High', color: 'bg-orange-500', description: 'Impaired fasting glucose' },
  veryHigh: { min: 200, max: 400, label: 'Very High', color: 'bg-red-600', description: 'Diabetic range' },
} as const;

const BloodGlucosePanel = memo(function BloodGlucosePanel() {
  // Use stable selector - only re-renders when blood glucose changes
  const bloodGlucose = useSimulationStore(selectBloodGlucose);

  if (!bloodGlucose) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Blood Glucose</h3>
        <div className="text-center py-4 text-slate-500">
          <p>No glucose data available</p>
        </div>
      </div>
    );
  }

  const { currentValue, baseline, trend, lastMealTime, lastMealGlycemicLoad, units } = bloodGlucose;

  // Determine current zone and visual state
  const glucoseState = useMemo(() => {
    const value = currentValue;
    if (value < 70) return { zone: 'hypoglycemia', ...GLUCOSE_ZONES.hypoglycemia };
    if (value < 100) return { zone: 'normal', ...GLUCOSE_ZONES.normal };
    if (value < 140) return { zone: 'elevated', ...GLUCOSE_ZONES.elevated };
    if (value < 200) return { zone: 'high', ...GLUCOSE_ZONES.high };
    return { zone: 'veryHigh', ...GLUCOSE_ZONES.veryHigh };
  }, [currentValue]);

  // Calculate position in the range (0-100%) for visualization
  const zonePosition = useMemo(() => {
    const min = 40; // Below hypoglycemia (for visualization)
    const max = 250; // Above very high (for visualization)
    return Math.min(100, Math.max(0, ((currentValue - min) / (max - min)) * 100));
  }, [currentValue]);

  // Format time since last meal
  const timeSinceMeal = useMemo(() => {
    if (!lastMealTime) return null;
    const minutes = Math.floor((Date.now() - new Date(lastMealTime).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }, [lastMealTime]);

  // Trend icon
  const getTrendIcon = () => {
    if (trend === 1) return { icon: '↗', label: 'Rising', color: 'text-red-400' };
    if (trend === -1) return { icon: '↘', label: 'Falling', color: 'text-green-400' };
    return { icon: '→', label: 'Stable', color: 'text-slate-400' };
  };

  const trendInfo = getTrendIcon();

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Blood Glucose</h3>
          <p className="text-xs text-slate-400">{units}</p>
        </div>
        <div className="text-right">
          <div className={`text-sm ${trendInfo.color} flex items-center gap-1 justify-end`}>
            <span>{trendInfo.icon}</span>
            <span>{trendInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Main value display */}
      <div className="text-center py-4">
        <div
          className={`text-4xl font-bold transition-colors ${
            glucoseState.zone === 'normal' ? 'text-green-400' :
            glucoseState.zone === 'elevated' ? 'text-yellow-400' :
            glucoseState.zone === 'high' ? 'text-orange-400' :
            'text-red-500'
          }`}
        >
          {currentValue.toFixed(0)}
        </div>
        <div className="text-sm text-slate-400 mt-1">
          Baseline: {baseline.toFixed(0)}
        </div>
      </div>

      {/* Glucose zones visualization */}
      <div className="mb-4">
        <div className="h-3 bg-slate-900 rounded-full overflow-hidden flex">
          {/* Zone segments */}
          <div className="bg-red-600 h-full" style={{ width: '12%' }} title="Hypoglycemia (&lt;70)" />
          <div className="bg-green-500 h-full" style={{ width: '12%' }} title="Normal (70-100)" />
          <div className="bg-yellow-500 h-full" style={{ width: '16%' }} title="Elevated (100-140)" />
          <div className="bg-orange-500 h-full" style={{ width: '24%' }} title="High (140-200)" />
          <div className="bg-red-600 h-full" style={{ width: '36%' }} title="Very High (&gt;200)" />
        </div>
        {/* Current value indicator */}
        <div
          className="relative h-0"
          style={{ top: '-3px' }}
        >
          <div
            className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 transition-all ${
              glucoseState.zone === 'normal' ? 'bg-green-500' :
              glucoseState.zone === 'elevated' ? 'bg-yellow-500' :
              glucoseState.zone === 'high' ? 'bg-orange-500' :
              'bg-red-600'
            }`}
            style={{ left: `${zonePosition}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>40</span>
          <span>100</span>
          <span>200</span>
          <span>250+</span>
        </div>
      </div>

      {/* Current status */}
      <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded mb-3">
        <span className="text-sm text-slate-400">Status</span>
        <span
          className={`text-sm font-medium ${
            glucoseState.zone === 'normal' ? 'text-green-400' :
            glucoseState.zone === 'elevated' ? 'text-yellow-400' :
            'text-red-400'
          }`}
        >
          {glucoseState.label}
        </span>
      </div>

      {/* Last meal info */}
      {lastMealTime && (
        <div className="p-3 bg-slate-900/30 rounded border border-slate-700/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-400">Last Meal</span>
            <span className="text-xs text-slate-300">{timeSinceMeal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Glycemic Load</span>
            <span
              className={`text-xs font-medium ${
                lastMealGlycemicLoad > 30 ? 'text-orange-400' :
                lastMealGlycemicLoad > 15 ? 'text-yellow-400' :
                'text-green-400'
              }`}
            >
              {lastMealGlycemicLoad}
            </span>
          </div>
        </div>
      )}

      {/* Educational info */}
      <div className="mt-3 pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-500 leading-relaxed">
          {glucoseState.description}. {glucoseState.zone === 'normal' &&
            'Maintaining stable blood sugar improves energy and metabolic health.'}
          {glucoseState.zone === 'elevated' &&
            'Consider lower glycemic index foods to maintain stable energy.'}
          {(glucoseState.zone === 'high' || glucoseState.zone === 'veryHigh') &&
            'Blood sugar is elevated. Consider activity to help normalize levels.'}
          {glucoseState.zone === 'hypoglycemia' &&
            'Blood sugar is low. Consider a balanced snack to restore energy.'}
        </p>
      </div>
    </div>
  );
});

export default BloodGlucosePanel;

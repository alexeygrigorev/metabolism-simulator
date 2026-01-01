// ============================================================================
// METABOLIC SIMULATOR - HORMONE PANEL COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import Sparkline from '../charts/Sparkline';
import { memo, useMemo, useEffect, useState } from 'react';

interface HormonePanelProps {
  hormone: keyof import('@metabol-sim/shared').HormonalState;
  label: string;
  color: string;
  unit: string;
}

// Select only the data we need for this specific hormone
function useHormoneData(hormone: keyof import('@metabol-sim/shared').HormonalState) {
  return useSimulationStore((state) => ({
    data: state?.state?.hormones[hormone],
    history: state?.hormoneHistory[hormone],
  }));
}

const HormonePanel = memo(function HormonePanel({ hormone, label, color, unit }: HormonePanelProps) {
  const { data: hormoneData, history } = useHormoneData(hormone);
  const [pulseActive, setPulseActive] = useState(false);
  const [previousValue, setPreviousValue] = useState<number | null>(null);

  if (!hormoneData) return null;

  const { currentValue, baseline, trend } = hormoneData;

  // Trigger pulse animation on significant value changes
  useEffect(() => {
    if (previousValue !== null && Math.abs(currentValue - previousValue) > baseline * 0.1) {
      setPulseActive(true);
      const timeout = setTimeout(() => setPulseActive(false), 600);
      return () => clearTimeout(timeout);
    }
    setPreviousValue(currentValue);
  }, [currentValue, previousValue, baseline]);

  // Determine visual state
  const visualState = useMemo(() => {
    const deviation = ((currentValue - baseline) / baseline) * 100;
    if (deviation > 50) return { level: 'spike', intensity: Math.min(1, (deviation - 50) / 100) };
    if (deviation > 20) return { level: 'elevated', intensity: Math.min(1, (deviation - 20) / 30) };
    if (deviation < -30) return { level: 'suppressed', intensity: Math.min(1, Math.abs(deviation + 30) / 50) };
    return { level: 'normal', intensity: 0 };
  }, [currentValue, baseline]);

  const getTrendIcon = () => {
    if (trend === 1) return '↗';
    if (trend === -1) return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 1) return 'text-green-400';
    if (trend === -1) return 'text-red-400';
    return 'text-slate-400';
  };

  const deviation = ((currentValue - baseline) / baseline) * 100;

  // Calculate bar width (logarithmic scale for better visualization)
  const ratio = currentValue / baseline;
  const barWidth = Math.min(100, Math.max(5, ratio <= 1 ? ratio * 50 : 50 + (ratio - 1) * 20));

  // Dynamic styling based on visual state
  const containerClass = useMemo(() => {
    const base = 'bg-slate-800 rounded-lg p-4 border transition-all duration-300 ';
    if (visualState.level === 'spike') {
      return base + 'border-yellow-400 shadow-lg shadow-yellow-400/20';
    }
    if (visualState.level === 'elevated') {
      return base + 'border-green-400/50';
    }
    if (visualState.level === 'suppressed') {
      return base + 'border-slate-600 opacity-70';
    }
    return base + 'border-slate-700';
  }, [visualState.level]);

  const valueClass = useMemo(() => {
    if (visualState.level === 'spike' || (visualState.level === 'elevated' && pulseActive)) {
      return 'text-2xl font-bold animate-pulse';
    }
    return 'text-2xl font-bold';
  }, [visualState.level, pulseActive]);

  const glowEffect = useMemo(() => {
    if (visualState.level === 'spike') {
      return `0 0 ${20 + visualState.intensity * 30}px ${color}40`;
    }
    return 'none';
  }, [visualState.level, visualState.intensity, color]);

  return (
    <div className={containerClass} style={{ boxShadow: glowEffect }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold" style={{ color }}>{label}</h3>
        <div className="flex items-center gap-2">
          {history && history.length >= 2 && (
            <Sparkline data={history} color={color} width={40} height={16} />
          )}
          <span className={`text-sm ${getTrendColor()}`}>{getTrendIcon()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className={valueClass}>{currentValue.toFixed(1)}</span>
          <span className="text-sm text-slate-400">{unit}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Baseline: {baseline.toFixed(1)}</span>
          <span className={deviation > 10 ? 'text-yellow-400' : deviation < -10 ? 'text-green-400' : 'text-slate-400'}>
            {deviation > 0 ? '+' : ''}{deviation.toFixed(0)}%
          </span>
        </div>

        {/* Level bar visualization */}
        <div className="mt-3 h-2 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${barWidth}%`,
              backgroundColor: color,
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Low</span>
          <span>Baseline</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
});

export default HormonePanel;

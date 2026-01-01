// ============================================================================
// METABOLIC SIMULATOR - HORMONE TIME SERIES CHART
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { memo, useMemo, useState } from 'react';
import { HormoneName } from '@metabol-sim/shared';

interface HormoneConfig {
  key: HormoneName;
  label: string;
  color: string;
  enabled: boolean;
}

const HORMONE_CONFIGS: HormoneConfig[] = [
  { key: 'insulin', label: 'Insulin', color: '#f59e0b', enabled: true },
  { key: 'glucagon', label: 'Glucagon', color: '#22c55e', enabled: true },
  { key: 'cortisol', label: 'Cortisol', color: '#a855f7', enabled: true },
  { key: 'testosterone', label: 'Testosterone', color: '#3b82f6', enabled: false },
  { key: 'growthHormone', label: 'GH', color: '#14b8a6', enabled: false },
  { key: 'igf1', label: 'IGF-1', color: '#06b6d4', enabled: false },
  { key: 'epinephrine', label: 'Epinephrine', color: '#ef4444', enabled: false },
  { key: 'leptin', label: 'Leptin', color: '#f97316', enabled: false },
  { key: 'ghrelin', label: 'Ghrelin', color: '#eab308', enabled: false },
];

const HormoneTimeSeries = memo(function HormoneTimeSeries() {
  const { hormoneHistory, state } = useSimulationStore();
  const [enabledHormones, setEnabledHormones] = useState<Set<HormoneName>>(
    new Set(['insulin', 'glucagon', 'cortisol'] as HormoneName[])
  );

  // Calculate chart dimensions and data
  const chartData = useMemo(() => {
    if (!state) return null;

    const maxLength = Math.max(
      ...Object.values(hormoneHistory).map(h => h.length),
      1
    );

    const allValues: number[] = [];
    Object.entries(hormoneHistory).forEach(([key, history]) => {
      if (enabledHormones.has(key as HormoneName)) {
        allValues.push(...history);
      }
    });

    const minValue = Math.min(...allValues, 0);
    const maxValue = Math.max(...allValues, 100);
    const range = maxValue - minValue || 1;

    // Generate SVG path data for each enabled hormone
    const paths: Array<{ config: HormoneConfig; d: string; points: string }> = [];

    enabledHormones.forEach((hormoneKey) => {
      const history = hormoneHistory[hormoneKey];
      const config = HORMONE_CONFIGS.find(c => c.key === hormoneKey);
      if (!config || history.length === 0) return;

      const width = 100; // percentage
      const height = 100;
      const stepX = width / (maxLength - 1 || 1);

      let pathD = '';
      let pointsD = '';

      history.forEach((value, index) => {
        const x = index * stepX;
        const normalizedY = ((value - minValue) / range) * height;
        const y = height - normalizedY;

        if (index === 0) {
          pathD += `M ${x} ${y}`;
        } else {
          pathD += ` L ${x} ${y}`;
        }

        // Point markers
        pointsD += `${x},${y} `;
      });

      paths.push({ config, d: pathD, points: pointsD });
    });

    return { paths, maxLength, minValue, maxValue, range };
  }, [hormoneHistory, enabledHormones, state]);

  const toggleHormone = (hormoneKey: HormoneName) => {
    setEnabledHormones(prev => {
      const next = new Set(prev);
      if (next.has(hormoneKey)) {
        // Don't allow disabling all hormones
        if (next.size > 1) {
          next.delete(hormoneKey);
        }
      } else {
        // Don't allow more than 4 hormones at once for readability
        if (next.size < 4) {
          next.add(hormoneKey);
        }
      }
      return next;
    });
  };

  if (!chartData || chartData.maxLength < 2) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
        <p className="text-slate-400 text-sm">Waiting for hormone data...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <h3 className="font-semibold text-white">Hormone Time Series</h3>
        <span className="text-xs text-slate-400">
          {enabledHormones.size}/4 hormones shown
        </span>
      </div>

      <div className="p-4">
        {/* Chart */}
        <div className="relative h-48 bg-slate-900 rounded-lg overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeWidth="0.2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.2" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#334155" strokeWidth="0.2" />

            {/* Hormone paths */}
            {chartData.paths.map(({ config, d, points }) => (
              <g key={config.key}>
                <polyline
                  fill="none"
                  stroke={config.color}
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                  d={d}
                />
                {/* Points */}
                <polyline
                  fill={config.color}
                  stroke="none"
                  points={points}
                  transform="scale(1, 1)"
                />
              </g>
            ))}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-1 top-2 text-xs text-slate-500">
            {chartData.maxValue.toFixed(0)}
          </div>
          <div className="absolute left-1 bottom-2 text-xs text-slate-500">
            {chartData.minValue.toFixed(0)}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          {HORMONE_CONFIGS.map(config => (
            <button
              key={config.key}
              onClick={() => toggleHormone(config.key)}
              disabled={!enabledHormones.has(config.key) && enabledHormones.size >= 4}
              className={`
                px-2 py-1 text-xs rounded-full border transition-all
                ${enabledHormones.has(config.key)
                  ? 'border-opacity-100 bg-opacity-20'
                  : 'border-opacity-30 bg-opacity-5 opacity-50'}
              `}
              style={{
                borderColor: config.color,
                backgroundColor: enabledHormones.has(config.key) ? `${config.color}33` : `${config.color}11`,
                color: config.color,
              }}
            >
              {config.label}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xs text-slate-500 text-center">
          Click to toggle hormones (max 4 at a time)
        </p>
      </div>
    </div>
  );
});

export default HormoneTimeSeries;

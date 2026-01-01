// ============================================================================
// METABOLIC SIMULATOR - ENERGY PANEL COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { memo } from 'react';

// Select only the data we need to prevent unnecessary re-renders
function useEnergyData() {
  return useSimulationStore((state) => state?.state?.energy);
}

const EnergyPanel = memo(function EnergyPanel() {
  const energy = useEnergyData();

  if (!energy) return null;

  const netCalories = energy.netCalories;

  const getNetColor = () => {
    if (netCalories > 500) return 'text-green-400';
    if (netCalories < -500) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  const getNetLabel = () => {
    if (netCalories > 500) return 'Surplus';
    if (netCalories < -500) return 'Deficit';
    return 'Balanced';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-semibold mb-4">Energy Balance</h3>
      <div className="space-y-3">
        <div className="text-center py-2">
          <div className={`text-3xl font-bold ${getNetColor()}`}>
            {netCalories > 0 ? '+' : ''}{netCalories.toFixed(0)}
          </div>
          <div className="text-sm text-slate-400">kcal {getNetLabel().toLowerCase()}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
          <div className="text-center p-2 bg-slate-900/50 rounded">
            <div className="text-lg font-semibold">{energy.caloriesConsumed.toFixed(0)}</div>
            <div className="text-xs text-slate-400">Consumed</div>
          </div>
          <div className="text-center p-2 bg-slate-900/50 rounded">
            <div className="text-lg font-semibold">{energy.caloriesBurned.toFixed(0)}</div>
            <div className="text-xs text-slate-400">Burned</div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Glycogen</span>
            <span className="text-slate-400">
              {((energy.glycogen.muscle + energy.glycogen.liver) / 2 * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
              style={{
                width: `${(energy.glycogen.muscle + energy.glycogen.liver) / 2 * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default EnergyPanel;

// ============================================================================
// METABOLIC SIMULATOR - MACRO TRACKER COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { memo } from 'react';

// Select only the data we need to prevent unnecessary re-renders
function useEnergyData() {
  return useSimulationStore((state) => state?.state?.energy);
}

const MacroTracker = memo(function MacroTracker() {
  const energy = useEnergyData();

  if (!energy) return null;

  const macros = [
    { name: 'Carbs', key: 'carbohydrates' as const, color: 'bg-blue-500', target: energy.carbohydrates.target },
    { name: 'Protein', key: 'proteins' as const, color: 'bg-green-500', target: energy.proteins.target },
    { name: 'Fat', key: 'fats' as const, color: 'bg-yellow-500', target: energy.fats.target },
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-semibold mb-4">Macronutrients</h3>
      <div className="space-y-3">
        {macros.map((macro) => {
          const consumed = energy[macro.key].consumed;
          const target = macro.target;
          const percentage = Math.min(100, (consumed / target) * 100);
          const remaining = Math.max(0, target - consumed);

          return (
            <div key={macro.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">{macro.name}</span>
                <span className={remaining === 0 ? 'text-green-400' : ''}>
                  {consumed.toFixed(0)} / {target.toFixed(0)}g
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${macro.color} rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {remaining > 0 && (
                <div className="text-xs text-slate-400 mt-1">{remaining.toFixed(0)}g remaining</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MacroTracker;

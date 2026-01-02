// ============================================================================
// METABOLIC SIMULATOR - MACRO TRACKER COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { selectEnergy } from '../../state/selectors';
import { memo, useMemo } from 'react';

// Static macro definitions - moved outside component to avoid recreation
type MacroKey = 'carbohydrates' | 'proteins' | 'fats';
const MACRO_DEFINITIONS = [
  { name: 'Carbs', key: 'carbohydrates' as MacroKey, color: 'bg-blue-500' },
  { name: 'Protein', key: 'proteins' as MacroKey, color: 'bg-green-500' },
  { name: 'Fat', key: 'fats' as MacroKey, color: 'bg-yellow-500' },
] as const;

const MacroTracker = memo(function MacroTracker() {
  // Use stable selector - only re-renders when energy data changes
  const energy = useSimulationStore(selectEnergy);

  if (!energy) return null;

  // Memoize macros with their targets to avoid array recreation
  const macros = useMemo(() =>
    MACRO_DEFINITIONS.map(def => ({
      ...def,
      target: energy[def.key].target,
    })),
    [energy.carbohydrates.target, energy.proteins.target, energy.fats.target]
  );

  return (
    <div id="macro-tracker" className="bg-slate-800 rounded-lg p-4 border border-slate-700">
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

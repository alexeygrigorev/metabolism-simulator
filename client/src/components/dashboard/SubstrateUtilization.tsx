// ============================================================================
// METABOLIC SIMULATOR - SUBSTRATE UTILIZATION COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { memo } from 'react';

// Select only the data we need to prevent unnecessary re-renders
function useSubstrateData() {
  return useSimulationStore((state) => state?.state?.energy?.substrateUtilization);
}

// Get metabolic state description and color
function getStateInfo(state: string) {
  const states: Record<string, { label: string; description: string; color: string }> = {
    fasted: {
      label: 'Fasted',
      description: 'Primary fat oxidation, ketone production may increase',
      color: 'bg-yellow-500',
    },
    postprandial: {
      label: 'Postprandial',
      description: 'Glucose primary fuel, fat oxidation suppressed',
      color: 'bg-cyan-500',
    },
    exercise: {
      label: 'Exercise',
      description: 'Mixed fuel use based on intensity',
      color: 'bg-orange-500',
    },
    recovery: {
      label: 'Recovery',
      description: 'Glycogen repletion, elevated glucose uptake',
      color: 'bg-green-500',
    },
    sleep: {
      label: 'Sleep',
      description: 'Primary fat oxidation, repair processes active',
      color: 'bg-indigo-500',
    },
  };
  return states[state] || { label: state, description: '', color: 'bg-slate-500' };
}

const SubstrateUtilization = memo(function SubstrateUtilization() {
  const substrateUtilization = useSubstrateData();

  if (!substrateUtilization) return null;

  const { fatOxidation, glucoseOxidation, metabolicState } = substrateUtilization;

  const stateInfo = getStateInfo(metabolicState);

  // Calculate total oxidation and percentages
  const totalOxidation = fatOxidation + glucoseOxidation;
  const fatPercent = totalOxidation > 0 ? (fatOxidation / totalOxidation) * 100 : 50;
  const glucosePercent = totalOxidation > 0 ? (glucoseOxidation / totalOxidation) * 100 : 50;

  // Energy contribution in kcal/min (9 cal/g for fat, 4 cal/g for glucose)
  const fatKcal = fatOxidation * 9;
  const glucoseKcal = glucoseOxidation * 4;
  const totalKcal = fatKcal + glucoseKcal;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Substrate Utilization</h3>
        <div className={`px-2 py-1 ${stateInfo.color}/20 text-white rounded text-xs font-medium capitalize`}>
          {stateInfo.label}
        </div>
      </div>

      {/* Visual ratio bar */}
      <div className="mb-4">
        <div className="flex h-6 rounded-full overflow-hidden">
          <div
            className="bg-yellow-500 transition-all duration-500 flex items-center justify-center text-xs font-medium"
            style={{ width: `${fatPercent}%` }}
          >
            {fatPercent > 15 && `${fatPercent.toFixed(0)}%`}
          </div>
          <div
            className="bg-cyan-500 transition-all duration-500 flex items-center justify-center text-xs font-medium"
            style={{ width: `${glucosePercent}%` }}
          >
            {glucosePercent > 15 && `${glucosePercent.toFixed(0)}%`}
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-400">
          <span>Fat</span>
          <span>Glucose</span>
        </div>
      </div>

      {/* Detailed values */}
      <div className="space-y-3">
        {/* Fat Oxidation */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-slate-300">Fat Oxidation</span>
            </div>
            <span className="text-sm font-medium text-yellow-400">
              {fatOxidation.toFixed(3)} g/min
            </span>
          </div>
          <div className="ml-4 text-xs text-slate-500">
            {fatKcal.toFixed(1)} kcal/min ({(fatKcal * 60).toFixed(0)} kcal/h)
          </div>
        </div>

        {/* Glucose Oxidation */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-sm text-slate-300">Glucose Oxidation</span>
            </div>
            <span className="text-sm font-medium text-cyan-400">
              {glucoseOxidation.toFixed(3)} g/min
            </span>
          </div>
          <div className="ml-4 text-xs text-slate-500">
            {glucoseKcal.toFixed(1)} kcal/min ({(glucoseKcal * 60).toFixed(0)} kcal/h)
          </div>
        </div>

        {/* State description */}
        {stateInfo.description && (
          <div className="pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-400">{stateInfo.description}</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default SubstrateUtilization;

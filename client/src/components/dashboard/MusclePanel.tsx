// ============================================================================
// METABOLIC SIMULATOR - MUSCLE PANEL COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { memo } from 'react';

// Select only the data we need to prevent unnecessary re-renders
function useMuscleData() {
  return useSimulationStore((state) => state?.state?.muscle);
}

const MusclePanel = memo(function MusclePanel() {
  const muscle = useMuscleData();

  if (!muscle) return null;

  const { proteinBalance, mtorSignaling, recoveryStatus } = muscle;

  const getMtorStatus = () => {
    if (mtorSignaling.activity > 0.7) return { label: 'High', color: 'text-green-400' };
    if (mtorSignaling.activity > 0.3) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'Low', color: 'text-slate-400' };
  };

  const getRecoveryStatus = () => {
    const recovery = (1 - recoveryStatus.muscleDamage - recoveryStatus.centralFatigue - recoveryStatus.inflammation * 0.3) * 100;
    if (recovery > 80) return { label: 'Excellent', color: 'text-green-400' };
    if (recovery > 50) return { label: 'Good', color: 'text-yellow-400' };
    return { label: 'Recovering', color: 'text-red-400' };
  };

  const mtorStatus = getMtorStatus();
  const recoveryStatusObj = getRecoveryStatus();

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-semibold mb-4">Muscle Status</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Mass</span>
          <span className="font-semibold">{muscle.skeletalMuscleMass.toFixed(1)} kg</span>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">MPS / MPB</span>
            <span
              className={`text-sm font-semibold ${
                proteinBalance.netBalance >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {proteinBalance.netBalance > 0 ? '+' : ''}{(proteinBalance.netBalance * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-1 text-xs">
            <div className="flex-1 text-center p-1 bg-green-900/30 rounded">
              <div className="text-green-400">MPS</div>
              <div>{(proteinBalance.synthesisRate * 100).toFixed(1)}%</div>
            </div>
            <div className="flex-1 text-center p-1 bg-red-900/30 rounded">
              <div className="text-red-400">MPB</div>
              <div>{(proteinBalance.breakdownRate * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-700">
          <span className="text-sm text-slate-400">mTOR</span>
          <span className={`text-sm font-semibold ${mtorStatus.color}`}>
            {mtorStatus.label} ({(mtorSignaling.activity * 100).toFixed(0)}%)
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Anabolic Window</span>
          <span className="text-sm font-semibold">
            {proteinBalance.anabolicWindowRemaining > 0
              ? `${(proteinBalance.anabolicWindowRemaining / 60).toFixed(1)}h left`
              : 'Inactive'}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-700">
          <span className="text-sm text-slate-400">Recovery</span>
          <span className={`text-sm font-semibold ${recoveryStatusObj.color}`}>
            {recoveryStatusObj.label}
          </span>
        </div>
      </div>
    </div>
  );
});

export default MusclePanel;

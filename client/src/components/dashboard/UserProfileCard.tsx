// ============================================================================
// METABOLIC SIMULATOR - USER PROFILE CARD COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { memo } from 'react';

const UserProfileCard = memo(function UserProfileCard() {
  const { state } = useSimulationStore();

  if (!state) return null;

  const { user, energy, muscle } = state;
  const totalWeight = energy.bodyFat + muscle.skeletalMuscleMass;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-semibold mb-4">Profile</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Age</span>
          <span className="font-semibold">{user.age}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Weight</span>
          <span className="font-semibold">{totalWeight.toFixed(1)} kg</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Height</span>
          <span className="font-semibold">{user.height} cm</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Body Fat</span>
          <span className="font-semibold">{(energy.bodyFat / totalWeight * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Muscle Mass</span>
          <span className="font-semibold text-green-400">{muscle.skeletalMuscleMass.toFixed(1)} kg</span>
        </div>
        <div className="pt-2 border-t border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">BMR</span>
            <span className="font-semibold">{energy.bmr.toFixed(0)} kcal/day</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-slate-400">TDEE</span>
            <span className="font-semibold">{energy.tdee.toFixed(0)} kcal/day</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UserProfileCard;

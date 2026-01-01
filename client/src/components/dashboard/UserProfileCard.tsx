// ============================================================================
// METABOLIC SIMULATOR - USER PROFILE CARD COMPONENT
// ============================================================================

import { useSimulationStore } from '../../state/store';
import { selectUser, selectEnergy, selectMuscle } from '../../state/selectors';
import { memo, useMemo, useState } from 'react';
import ProfileEditor from './ProfileEditor';

const UserProfileCard = memo(function UserProfileCard() {
  // Use stable selectors - each selector only triggers re-render for its specific data
  const user = useSimulationStore(selectUser);
  const energy = useSimulationStore(selectEnergy);
  const muscle = useSimulationStore(selectMuscle);
  const [showEditor, setShowEditor] = useState(false);

  const profileData = useMemo(() => {
    if (!user || !energy || !muscle) return null;
    const totalWeight = energy.bodyFat + muscle.skeletalMuscleMass;
    return {
      age: user.age,
      height: user.height,
      totalWeight,
      bodyFatPercentage: (energy.bodyFat / totalWeight * 100),
      skeletalMuscleMass: muscle.skeletalMuscleMass,
      bmr: energy.bmr,
      tdee: energy.tdee,
    };
  }, [user, energy, muscle]);

  if (!profileData) return null;

  return (
    <>
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          <button
            onClick={() => setShowEditor(true)}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            title="Edit profile"
          >
            Edit
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Age</span>
            <span className="font-semibold">{profileData.age}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Weight</span>
            <span className="font-semibold">{profileData.totalWeight.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Height</span>
            <span className="font-semibold">{profileData.height} cm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Body Fat</span>
            <span className="font-semibold">{profileData.bodyFatPercentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Muscle Mass</span>
            <span className="font-semibold text-green-400">{profileData.skeletalMuscleMass.toFixed(1)} kg</span>
          </div>
          <div className="pt-2 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">BMR</span>
              <span className="font-semibold">{profileData.bmr.toFixed(0)} kcal/day</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-slate-400">TDEE</span>
              <span className="font-semibold">{profileData.tdee.toFixed(0)} kcal/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Editor Modal */}
      <ProfileEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </>
  );
});

export default UserProfileCard;

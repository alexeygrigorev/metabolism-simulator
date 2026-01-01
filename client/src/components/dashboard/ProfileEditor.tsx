// ============================================================================
// METABOLIC SIMULATOR - PROFILE EDITOR MODAL COMPONENT
// ============================================================================

import { useState, useEffect, memo } from 'react';
import { useSimulationStore } from '../../state/store';
import { BiologicalSex } from '@metabol-sim/shared';

// Activity level options with descriptions
const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', description: 'Little or no exercise' },
  { value: 1.375, label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 1.55, label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 1.725, label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 1.9, label: 'Extra Active', description: 'Very hard exercise, physical job' },
] as const;

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form state interface
interface ProfileForm {
  age: string;
  weight: string;
  height: string;
  bodyFatPercentage: string;
  biologicalSex: BiologicalSex;
  activityLevel: number;
}

const ProfileEditor = memo(function ProfileEditor({ isOpen, onClose }: ProfileEditorProps) {
  const { state, updateUserProfile } = useSimulationStore();
  const [formData, setFormData] = useState<ProfileForm>({
    age: '',
    weight: '',
    height: '',
    bodyFatPercentage: '',
    biologicalSex: BiologicalSex.Male,
    activityLevel: 1.55,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  // Initialize form with current user data when modal opens
  useEffect(() => {
    if (state?.user && isOpen) {
      setFormData({
        age: state.user.age.toString(),
        weight: state.user.weight.toString(),
        height: state.user.height.toString(),
        bodyFatPercentage: (state.user.bodyFatPercentage * 100).toString(),
        biologicalSex: state.user.biologicalSex,
        activityLevel: state.user.activityLevel,
      });
    }
  }, [state, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileForm, string>> = {};

    // Age validation
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 16 || age > 100) {
      newErrors.age = 'Age must be between 16 and 100';
    }

    // Weight validation (kg)
    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 30 || weight > 300) {
      newErrors.weight = 'Weight must be between 30 and 300 kg';
    }

    // Height validation (cm)
    const height = parseFloat(formData.height);
    if (isNaN(height) || height < 100 || height > 250) {
      newErrors.height = 'Height must be between 100 and 250 cm';
    }

    // Body fat percentage validation
    const bodyFat = parseFloat(formData.bodyFatPercentage);
    if (isNaN(bodyFat) || bodyFat < 3 || bodyFat > 50) {
      newErrors.bodyFatPercentage = 'Body fat must be between 3% and 50%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    updateUserProfile({
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      bodyFatPercentage: parseFloat(formData.bodyFatPercentage) / 100,
      biologicalSex: formData.biologicalSex,
      activityLevel: formData.activityLevel,
    });

    onClose();
  };

  const handleInputChange = (field: keyof ProfileForm, value: string | number | BiologicalSex) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Calculate preview BMR/TDEE
  const calculatePreview = () => {
    const age = parseInt(formData.age) || 0;
    const weight = parseFloat(formData.weight) || 0;
    const height = parseFloat(formData.height) || 0;

    if (formData.biologicalSex === BiologicalSex.Male) {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const previewBmr = calculatePreview();
  const previewTdee = previewBmr * formData.activityLevel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <p className="text-sm text-slate-400 mt-1">Update your personal information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Biological Sex */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Biological Sex
            </label>
            <div className="flex gap-3">
              {([BiologicalSex.Male, BiologicalSex.Female] as const).map((sex) => (
                <label
                  key={sex}
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.biologicalSex === sex
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="biologicalSex"
                    value={sex}
                    checked={formData.biologicalSex === sex}
                    onChange={() => handleInputChange('biologicalSex', sex)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{sex === BiologicalSex.Male ? '👨' : '👩'}</span>
                    <span className="font-medium text-white capitalize">{sex}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Age, Weight, Height - Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg bg-slate-900 border ${
                  errors.age ? 'border-red-500' : 'border-slate-600'
                } text-white focus:outline-none focus:border-blue-500 transition-colors`}
                placeholder="years"
              />
              {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-slate-300 mb-2">
                Weight
              </label>
              <input
                type="number"
                step="0.1"
                id="weight"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg bg-slate-900 border ${
                  errors.weight ? 'border-red-500' : 'border-slate-600'
                } text-white focus:outline-none focus:border-blue-500 transition-colors`}
                placeholder="kg"
              />
              {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight}</p>}
            </div>

            {/* Height */}
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-2">
                Height
              </label>
              <input
                type="number"
                id="height"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg bg-slate-900 border ${
                  errors.height ? 'border-red-500' : 'border-slate-600'
                } text-white focus:outline-none focus:border-blue-500 transition-colors`}
                placeholder="cm"
              />
              {errors.height && <p className="text-red-400 text-xs mt-1">{errors.height}</p>}
            </div>
          </div>

          {/* Body Fat Percentage */}
          <div>
            <label htmlFor="bodyFat" className="block text-sm font-medium text-slate-300 mb-2">
              Body Fat Percentage
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="0.1"
                id="bodyFat"
                value={formData.bodyFatPercentage}
                onChange={(e) => handleInputChange('bodyFatPercentage', e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg bg-slate-900 border ${
                  errors.bodyFatPercentage ? 'border-red-500' : 'border-slate-600'
                } text-white focus:outline-none focus:border-blue-500 transition-colors`}
                placeholder="%"
              />
              <span className="text-slate-400 text-sm">%</span>
            </div>
            {errors.bodyFatPercentage && <p className="text-red-400 text-xs mt-1">{errors.bodyFatPercentage}</p>}
            <p className="text-slate-500 text-xs mt-1">
              Estimate: ~15% for athletic men, ~25% for athletic women
            </p>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Activity Level
            </label>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.activityLevel === level.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level.value}
                    checked={formData.activityLevel === level.value}
                    onChange={() => handleInputChange('activityLevel', level.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-white">{level.label}</div>
                    <div className="text-xs text-slate-400">{level.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Estimated Metabolic Rate</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">Basal Metabolic Rate</div>
                <div className="text-lg font-bold text-white">{previewBmr.toFixed(0)} <span className="text-sm font-normal text-slate-400">kcal/day</span></div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Daily Energy</div>
                <div className="text-lg font-bold text-blue-400">{previewTdee.toFixed(0)} <span className="text-sm font-normal text-slate-400">kcal/day</span></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              * Calculated using Mifflin-St Jeor equation
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ProfileEditor;

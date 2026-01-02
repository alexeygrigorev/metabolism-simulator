// ============================================================================
// METABOLIC SIMULATOR - PERSISTED SETTINGS STORE
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BiologicalSex } from '@metabol-sim/shared';

export interface UserSettings {
  // Simulation preferences
  timeScale: number;
  paused: boolean;

  // User profile (persisted for convenience)
  userProfile: {
    age: number;
    biologicalSex: BiologicalSex;
    weight: number;
    height: number;
    bodyFatPercentage: number;
    activityLevel: number;
    fitnessLevel?: number;
  } | null;

  // UI preferences
  theme: 'light' | 'dark' | 'system';
  showTooltips: boolean;
  compactMode: boolean;

  // Macro targets (customizable by user)
  macroTargets: {
    carbohydrates: number;
    proteins: number;
    fats: number;
  };
}

interface SettingsStore extends UserSettings {
  // Actions
  setTimeScale: (scale: number) => void;
  setPaused: (paused: boolean) => void;
  setUserProfile: (profile: Partial<UserSettings['userProfile']>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setShowTooltips: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setMacroTarget: (macro: keyof UserSettings['macroTargets'], value: number) => void;
  resetSettings: () => void;
}

const DEFAULT_USER_PROFILE = {
  age: 30,
  biologicalSex: BiologicalSex.Male,
  weight: 75,
  height: 180,
  bodyFatPercentage: 0.18,
  activityLevel: 1.55,
  fitnessLevel: 3,
};

const DEFAULT_MACRO_TARGETS = {
  carbohydrates: 300,
  proteins: 120,
  fats: 75,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Default values
      timeScale: 1,
      paused: false,
      userProfile: DEFAULT_USER_PROFILE,
      theme: 'dark',
      showTooltips: true,
      compactMode: false,
      macroTargets: DEFAULT_MACRO_TARGETS,

      // Actions
      setTimeScale: (scale) => set({ timeScale: scale }),
      setPaused: (paused) => set({ paused }),
      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            ...profile,
          } as UserSettings['userProfile'],
        })),
      setTheme: (theme) => set({ theme }),
      setShowTooltips: (show) => set({ showTooltips: show }),
      setCompactMode: (compact) => set({ compactMode: compact }),
      setMacroTarget: (macro, value) =>
        set((state) => ({
          macroTargets: {
            ...state.macroTargets,
            [macro]: value,
          },
        })),
      resetSettings: () =>
        set({
          timeScale: 1,
          paused: false,
          userProfile: DEFAULT_USER_PROFILE,
          theme: 'dark',
          showTooltips: true,
          compactMode: false,
          macroTargets: DEFAULT_MACRO_TARGETS,
        }),
    }),
    {
      name: 'metabol-sim-settings',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields
      partialize: (state) => ({
        timeScale: state.timeScale,
        paused: state.paused,
        userProfile: state.userProfile,
        theme: state.theme,
        showTooltips: state.showTooltips,
        compactMode: state.compactMode,
        macroTargets: state.macroTargets,
      }),
    }
  )
);

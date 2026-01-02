// ============================================================================
// METABOLIC SIMULATOR - KEYBOARD SHORTCUTS HOOK
// ============================================================================

import { useEffect, useCallback } from 'react';
import { useSimulationStore } from '../state/store';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  { key: ' ', description: 'Toggle pause/resume' },
  { key: '1', description: 'Set time scale to 1x' },
  { key: '2', description: 'Set time scale to 10x' },
  { key: '3', description: 'Set time scale to 1m' },
  { key: '4', description: 'Set time scale to 10m' },
  { key: 'm', description: 'Open meal logging' },
  { key: 'e', description: 'Open exercise logging' },
  { key: 's', description: 'Log sleep (8h)' },
  { key: 'w', description: 'Log water (250ml)' },
  { key: 'd', description: 'Toggle diet panel' },
  { key: 'h', description: 'Toggle health insights' },
  { key: '?', description: 'Show/hide shortcuts help' },
  { key: 'Escape', description: 'Close modals/dropdowns' },
  { ctrl: true, key: 'k', description: 'Open settings' },
  { ctrl: true, key: 'e', description: 'Export data' },
  { ctrl: true, key: 'r', description: 'Reset simulation' },
];

interface UseKeyboardShortcutsProps {
  isMealOpen: boolean;
  setIsMealOpen: (v: boolean) => void;
  isExerciseOpen: boolean;
  setIsExerciseOpen: (v: boolean) => void;
  showHelpModal: boolean;
  setShowHelpModal: (v: boolean) => void;
  onOpenSettings?: () => void;
  onExportData?: () => void;
}

export function useKeyboardShortcuts({
  isMealOpen,
  setIsMealOpen,
  isExerciseOpen,
  setIsExerciseOpen,
  showHelpModal,
  setShowHelpModal,
  onOpenSettings,
  onExportData,
}: UseKeyboardShortcutsProps) {
  const { togglePause, setTimeScale, logSleep, logMeal, addToast, reset } = useSimulationStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable) {
      return;
    }

    const ctrlOrMeta = event.ctrlKey || event.metaKey;

    // Space - Toggle pause/resume
    if (event.key === ' ' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      togglePause();
      return;
    }

    // Number keys - Time scale
    if (event.key === '1' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      setTimeScale(1);
      addToast('Time scale: 1x', 'info');
      return;
    }
    if (event.key === '2' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      setTimeScale(10);
      addToast('Time scale: 10x', 'info');
      return;
    }
    if (event.key === '3' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      setTimeScale(60);
      addToast('Time scale: 1m', 'info');
      return;
    }
    if (event.key === '4' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      setTimeScale(600);
      addToast('Time scale: 10m', 'info');
      return;
    }

    // M - Toggle meal dropdown
    if (event.key === 'm' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      if (!isExerciseOpen) {
        setIsMealOpen(!isMealOpen);
      }
      return;
    }

    // E - Toggle exercise dropdown (when not using Ctrl)
    if (event.key === 'e' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      if (!isMealOpen) {
        setIsExerciseOpen(!isExerciseOpen);
      }
      return;
    }

    // S - Log sleep
    if (event.key === 's' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      logSleep(8, 0.85);
      return;
    }

    // W - Log water
    if (event.key === 'w' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      logMeal({
        id: Date.now().toString(),
        name: 'Water (250ml)',
        time: new Date().toISOString(),
        items: [{ foodId: 'water', servings: 1 }],
        totalMacros: { carbohydrates: 0, proteins: 0, fats: 0, fiber: 0, water: 250 },
        glycemicLoad: 0,
        insulinResponse: { peak: 0, magnitude: 0, duration: 0, areaUnderCurve: 0 },
      }).then(() => {
        addToast('Logged 250ml water', 'success');
      });
      return;
    }

    // D - Toggle diet/nutrition focus
    if (event.key === 'd' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      // Scroll to MacroTracker section
      const macroSection = document.getElementById('macro-tracker');
      if (macroSection) {
        macroSection.scrollIntoView({ behavior: 'smooth' });
        addToast('Navigated to nutrition panel', 'info');
      }
      return;
    }

    // H - Toggle health insights
    if (event.key === 'h' && !ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      const insightsSection = document.getElementById('hormone-insights');
      if (insightsSection) {
        insightsSection.scrollIntoView({ behavior: 'smooth' });
        addToast('Navigated to hormone insights', 'info');
      }
      return;
    }

    // ? or / - Toggle help modal
    if ((event.key === '?' || event.key === '/') && !ctrlOrMeta) {
      event.preventDefault();
      setShowHelpModal(!showHelpModal);
      return;
    }

    // Ctrl/Cmd + K - Open settings
    if ((event.key === 'k' || event.key === 'K') && ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      if (onOpenSettings) {
        onOpenSettings();
      }
      return;
    }

    // Ctrl/Cmd + E - Export data
    if ((event.key === 'e' || event.key === 'E') && ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      if (onExportData) {
        onExportData();
      }
      return;
    }

    // Ctrl/Cmd + R - Reset simulation
    if ((event.key === 'r' || event.key === 'R') && ctrlOrMeta && !event.altKey) {
      event.preventDefault();
      if (confirm('Are you sure you want to reset the simulation?')) {
        reset();
        addToast('Simulation reset', 'info');
      }
      return;
    }

    // Escape - Close dropdowns and modals
    if (event.key === 'Escape') {
      if (showHelpModal) {
        setShowHelpModal(false);
      } else {
        if (isMealOpen) setIsMealOpen(false);
        if (isExerciseOpen) setIsExerciseOpen(false);
      }
      return;
    }
  }, [
    togglePause,
    setTimeScale,
    logSleep,
    logMeal,
    addToast,
    reset,
    isMealOpen,
    isExerciseOpen,
    setIsMealOpen,
    setIsExerciseOpen,
    showHelpModal,
    setShowHelpModal,
    onOpenSettings,
    onExportData,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export { DEFAULT_SHORTCUTS };

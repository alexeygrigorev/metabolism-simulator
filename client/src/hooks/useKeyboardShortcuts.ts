// ============================================================================
// METABOLIC SIMULATOR - KEYBOARD SHORTCUTS HOOK
// ============================================================================

import { useEffect } from 'react';
import { useSimulationStore } from '../state/store';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
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
  { key: '?', description: 'Show/hide shortcuts help' },
];

interface UseKeyboardShortcutsProps {
  isMealOpen: boolean;
  setIsMealOpen: (v: boolean) => void;
  isExerciseOpen: boolean;
  setIsExerciseOpen: (v: boolean) => void;
  showHelpModal: boolean;
  setShowHelpModal: (v: boolean) => void;
}

export function useKeyboardShortcuts({
  isMealOpen,
  setIsMealOpen,
  isExerciseOpen,
  setIsExerciseOpen,
  showHelpModal,
  setShowHelpModal,
}: UseKeyboardShortcutsProps) {
  const { togglePause, setTimeScale, logSleep, addToast } = useSimulationStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input
      if (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          (event.target as HTMLElement).isContentEditable) {
        return;
      }

      // Don't trigger if modifier keys are pressed (except for specific shortcuts)
      const hasModifier = event.ctrlKey || event.altKey || event.metaKey;

      // Space - Toggle pause/resume
      if (event.key === ' ' && !hasModifier) {
        event.preventDefault();
        togglePause();
        return;
      }

      // Number keys - Time scale
      if (event.key === '1' && !hasModifier) {
        event.preventDefault();
        setTimeScale(1);
        addToast('Time scale: 1x', 'info');
        return;
      }
      if (event.key === '2' && !hasModifier) {
        event.preventDefault();
        setTimeScale(10);
        addToast('Time scale: 10x', 'info');
        return;
      }
      if (event.key === '3' && !hasModifier) {
        event.preventDefault();
        setTimeScale(60);
        addToast('Time scale: 1m', 'info');
        return;
      }
      if (event.key === '4' && !hasModifier) {
        event.preventDefault();
        setTimeScale(600);
        addToast('Time scale: 10m', 'info');
        return;
      }

      // M - Toggle meal dropdown
      if (event.key === 'm' && !hasModifier) {
        event.preventDefault();
        if (!isExerciseOpen) {
          setIsMealOpen(!isMealOpen);
        }
        return;
      }

      // E - Toggle exercise dropdown
      if (event.key === 'e' && !hasModifier) {
        event.preventDefault();
        if (!isMealOpen) {
          setIsExerciseOpen(!isExerciseOpen);
        }
        return;
      }

      // S - Log sleep
      if (event.key === 's' && !hasModifier) {
        event.preventDefault();
        logSleep(8, 0.85);
        return;
      }

      // ? or / - Toggle help modal
      if ((event.key === '?' || event.key === '/') && !hasModifier) {
        event.preventDefault();
        setShowHelpModal(!showHelpModal);
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePause,
    setTimeScale,
    logSleep,
    addToast,
    isMealOpen,
    isExerciseOpen,
    setIsMealOpen,
    setIsExerciseOpen,
    showHelpModal,
    setShowHelpModal,
  ]);
}

export { DEFAULT_SHORTCUTS };

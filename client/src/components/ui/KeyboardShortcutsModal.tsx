// ============================================================================
// METABOLIC SIMULATOR - KEYBOARD SHORTCUTS MODAL
// ============================================================================

import { memo } from 'react';
import { DEFAULT_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', description: 'Toggle pause/resume simulation' },
  { key: '1', description: 'Set time scale to 1x (real-time)' },
  { key: '2', description: 'Set time scale to 10x' },
  { key: '3', description: 'Set time scale to 1 minute/sec' },
  { key: '4', description: 'Set time scale to 10 minutes/sec' },
  { key: 'M', description: 'Open meal logging menu' },
  { key: 'E', description: 'Open exercise logging menu' },
  { key: 'S', description: 'Log 8 hours of sleep' },
  { key: 'Esc', description: 'Close any open menu' },
  { key: '?', description: 'Show this help' },
];

const KeyboardShortcutsModal = memo(function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/50"
            >
              <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm font-mono text-cyan-400 min-w-[2rem] text-center">
                {shortcut.key}
              </kbd>
              <span className="text-sm text-slate-300">{shortcut.description}</span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
});

export default KeyboardShortcutsModal;

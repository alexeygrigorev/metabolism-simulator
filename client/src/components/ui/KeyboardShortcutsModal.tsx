// ============================================================================
// METABOLIC SIMULATOR - KEYBOARD SHORTCUTS MODAL
// ============================================================================

import { memo } from 'react';
import { DEFAULT_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to format keyboard shortcut display
function formatShortcutKey(shortcut: Omit<ReturnType<typeof DEFAULT_SHORTCUTS>[number], 'action'>): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('Cmd');
  parts.push(shortcut.key);
  return parts.join('+');
}

// Group shortcuts by category
function getShortcutsByCategory() {
  const simulation = DEFAULT_SHORTCUTS.filter(s =>
    [' ', '1', '2', '3', '4'].includes(s.key)
  );
  const logging = DEFAULT_SHORTCUTS.filter(s =>
    ['m', 'e', 's', 'w'].includes(s.key)
  );
  const navigation = DEFAULT_SHORTCUTS.filter(s =>
    ['d', 'h'].includes(s.key)
  );
  const system = DEFAULT_SHORTCUTS.filter(s =>
    ['?', 'Escape'].includes(s.key) || s.ctrl
  );

  return { simulation, logging, navigation, system };
}

const KeyboardShortcutsModal = memo(function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const categories = getShortcutsByCategory();

  const ShortcutSection = memo(function ShortcutSection({
    title,
    shortcuts,
  }: {
    title: string;
    shortcuts: typeof DEFAULT_SHORTCUTS;
  }) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</h3>
        <div className="space-y-1.5">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-900/50"
            >
              <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm font-mono text-cyan-400 min-w-[3rem] text-center">
                {formatShortcutKey(s)}
              </kbd>
              <span className="text-sm text-slate-300">{s.description}</span>
            </div>
          ))}
        </div>
      </div>
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
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

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <ShortcutSection title="Simulation Controls" shortcuts={categories.simulation} />
          <ShortcutSection title="Logging Actions" shortcuts={categories.logging} />
          <ShortcutSection title="Navigation" shortcuts={categories.navigation} />
          <ShortcutSection title="System" shortcuts={categories.system} />
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

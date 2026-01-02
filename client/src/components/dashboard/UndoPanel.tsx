// ============================================================================
// METABOLIC SIMULATOR - UNDO PANEL COMPONENT
// ============================================================================

import { memo } from 'react';
import { useUndoStore, getActionDisplayName, getActionIcon } from '../../state/undoStore';
import { useSimulationStore } from '../../state/store';
import { LazyLoad } from '../ui/LazyLoad';

const UndoPanel = memo(function UndoPanel() {
  const { history, canUndo, undo, removeAction } = useUndoStore();
  const logMeal = useSimulationStore((s) => s.logMeal);
  const logExercise = useSimulationStore((s) => s.logExercise);
  const logSleep = useSimulationStore((s) => s.logSleep);
  const applyStress = useSimulationStore((s) => s.applyStress);

  const visibleHistory = history.slice(0, 5); // Show last 5 actions

  const handleUndo = async () => {
    const action = undo();
    if (!action) return;

    // Revert the action by applying the opposite effect
    switch (action.type) {
      case 'meal':
        // Subtract the meal's nutritional values
        // Note: This is a simplified undo - in a real system, we'd need to track
        // the exact state before the action
        break;
      case 'exercise':
        // Similar logic for exercise
        break;
      // Sleep and stress are harder to undo as they're transient states
    }
  };

  const handleRemoveAction = (id: string) => {
    removeAction(id);
  };

  if (!canUndo()) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">↩️</span>
          <h3 className="text-sm font-medium text-slate-300">Recent Actions</h3>
        </div>
        <span className="text-xs text-slate-500">{history.length} actions</span>
      </div>

      <div className="space-y-2">
        {visibleHistory.map((action, index) => (
          <div
            key={`${action.type}-${action.data.id || index}`}
            className="flex items-center justify-between group bg-slate-700/30 rounded-lg px-3 py-2 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">{getActionIcon(action)}</span>
              <span className="text-sm text-slate-300 truncate">
                {getActionDisplayName(action)}
              </span>
            </div>
            <button
              onClick={() => handleRemoveAction(action.data.id || '')}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1"
              title="Remove from history"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {history.length > visibleHistory.length && `+${history.length - visibleHistory.length} more actions`}
          </span>
          <button
            onClick={handleUndo}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-1.5"
          >
            <span>↩️</span>
            <span>Undo Last Action</span>
          </button>
        </div>
      )}
    </div>
  );
});

export default UndoPanel;

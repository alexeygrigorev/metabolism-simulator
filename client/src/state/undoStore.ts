// ============================================================================
// METABOLIC SIMULATOR - UNDO/REDO STORE
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Action types that can be undone
export type UndoableAction =
  | { type: 'meal'; data: LoggedMeal }
  | { type: 'exercise'; data: LoggedExercise }
  | { type: 'sleep'; data: LoggedSleep }
  | { type: 'stress'; data: LoggedStress }
  | { type: 'supplement'; data: LoggedSupplement };

export interface LoggedMeal {
  id: string;
  name: string;
  timestamp: number;
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
}

export interface LoggedExercise {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  caloriesBurned: number;
  met: number;
}

export interface LoggedSleep {
  id: string;
  timestamp: number;
  hours: number;
  quality: number;
}

export interface LoggedStress {
  id: string;
  timestamp: number;
  level: 'low' | 'med' | 'high';
}

export interface LoggedSupplement {
  id: string;
  name: string;
  timestamp: number;
  dosage: string;
}

interface UndoState {
  // History of actions (newest first)
  history: UndoableAction[];
  // Redo stack (for actions that were undone)
  redoStack: UndoableAction[];
  // Maximum history size
  maxSize: number;

  // Actions
  addAction: (action: UndoableAction) => void;
  undo: () => UndoableAction | null;
  redo: () => UndoableAction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
  removeAction: (id: string) => void;
}

export const useUndoStore = create<UndoState>()(
  persist(
    (set, get) => ({
      history: [],
      redoStack: [],
      maxSize: 50, // Keep last 50 actions

      addAction: (action) => {
        const { history, maxSize } = get();
        const newHistory = [action, ...history].slice(0, maxSize);
        set({ history: newHistory, redoStack: [] }); // Clear redo stack on new action
      },

      undo: () => {
        const { history, redoStack } = get();
        if (history.length === 0) return null;

        const [action, ...remaining] = history;
        set({ history: remaining, redoStack: [action, ...redoStack] });
        return action;
      },

      redo: () => {
        const { history, redoStack } = get();
        if (redoStack.length === 0) return null;

        const [action, ...remaining] = redoStack;
        set({ history: [action, ...history], redoStack: remaining });
        return action;
      },

      canUndo: () => {
        return get().history.length > 0;
      },

      canRedo: () => {
        return get().redoStack.length > 0;
      },

      clear: () => {
        set({ history: [], redoStack: [] });
      },

      removeAction: (id) => {
        const { history } = get();
        set({ history: history.filter(a => {
          if ('id' in a.data) return a.data.id !== id;
          return true;
        }) });
      },
    }),
    {
      name: 'metabol-sim-undo',
      partialize: (state) => ({
        history: state.history.slice(0, 20), // Only persist first 20
        redoStack: [], // Don't persist redo stack
      }),
    }
  )
);

// Helper to get display name for action types
export function getActionDisplayName(action: UndoableAction): string {
  switch (action.type) {
    case 'meal':
      return `Logged ${action.data.name}`;
    case 'exercise':
      return `Completed ${action.data.name}`;
    case 'sleep':
      return `Logged ${action.data.hours}h sleep`;
    case 'stress':
      return `Set stress to ${action.data.level}`;
    case 'supplement':
      return `Took ${action.data.name}`;
  }
}

// Helper to get action icon
export function getActionIcon(action: UndoableAction): string {
  switch (action.type) {
    case 'meal':
      return '🍽️';
    case 'exercise':
      return '🏋️';
    case 'sleep':
      return '😴';
    case 'stress':
      return '😰';
    case 'supplement':
      return '💊';
  }
}

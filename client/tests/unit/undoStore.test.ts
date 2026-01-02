// ============================================================================
// METABOLIC SIMULATOR - UNDO STORE UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUndoStore } from '../../src/state/undoStore';

describe('undoStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.removeItem('metabol-sim-undo');
    // Reset the store before each test - use setState to force reset
    useUndoStore.setState({ history: [], redoStack: [] });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty history initially', () => {
      const { history } = useUndoStore.getState();
      expect(history).toEqual([]);
    });

    it('should have empty redo stack initially', () => {
      const { redoStack } = useUndoStore.getState();
      expect(redoStack).toEqual([]);
    });

    it('should not be able to undo when empty', () => {
      const { canUndo } = useUndoStore.getState();
      expect(canUndo()).toBe(false);
    });

    it('should not be able to redo when empty', () => {
      const { canRedo } = useUndoStore.getState();
      expect(canRedo()).toBe(false);
    });
  });

  describe('addAction', () => {
    it('should add a meal action to history', () => {
      const { addAction } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Test Meal',
          timestamp: Date.now(),
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      const { history } = useUndoStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('meal');
      expect(history[0].data.name).toBe('Test Meal');
    });

    it('should add an exercise action to history', () => {
      const { addAction } = useUndoStore.getState();

      addAction({
        type: 'exercise',
        data: {
          id: 'exercise-1',
          name: 'Running',
          timestamp: Date.now(),
          duration: 30,
          caloriesBurned: 300,
          met: 8,
        },
      });

      const { history } = useUndoStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('exercise');
    });

    it('should add a sleep action to history', () => {
      const { addAction } = useUndoStore.getState();

      addAction({
        type: 'sleep',
        data: {
          id: 'sleep-1',
          timestamp: Date.now(),
          hours: 8,
          quality: 0.8,
        },
      });

      const { history } = useUndoStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('sleep');
    });

    it('should add a stress action to history', () => {
      const { addAction } = useUndoStore.getState();

      addAction({
        type: 'stress',
        data: {
          id: 'stress-1',
          timestamp: Date.now(),
          level: 'high',
        },
      });

      const { history } = useUndoStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('stress');
    });

    it('should add actions to the front of history (newest first)', () => {
      const { addAction } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'First Meal',
          timestamp: 1000,
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      addAction({
        type: 'meal',
        data: {
          id: 'meal-2',
          name: 'Second Meal',
          timestamp: 2000,
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      const { history } = useUndoStore.getState();
      expect(history).toHaveLength(2);
      expect(history[0].data.name).toBe('Second Meal');
      expect(history[1].data.name).toBe('First Meal');
    });

    it('should clear redo stack when adding new action', () => {
      const { addAction, undo } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Meal',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      undo(); // Move to redo stack

      expect(useUndoStore.getState().canRedo()).toBe(true);
      expect(useUndoStore.getState().redoStack).toHaveLength(1);

      // Add new action should clear redo stack
      addAction({
        type: 'meal',
        data: {
          id: 'meal-2',
          name: 'New Meal',
          timestamp: Date.now(),
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      expect(useUndoStore.getState().canRedo()).toBe(false);
      expect(useUndoStore.getState().redoStack).toHaveLength(0);
    });

    it('should limit history to maxSize', () => {
      const { addAction, maxSize } = useUndoStore.getState();

      // Add more actions than maxSize
      for (let i = 0; i < maxSize + 10; i++) {
        addAction({
          type: 'meal',
          data: {
            id: `meal-${i}`,
            name: `Meal ${i}`,
            timestamp: Date.now() + i,
            calories: 400,
            carbs: 40,
            proteins: 20,
            fats: 10,
          },
        });
      }

      const { history } = useUndoStore.getState();
      expect(history.length).toBeLessThanOrEqual(maxSize);
      expect(history.length).toBe(maxSize);
    });
  });

  describe('undo', () => {
    it('should remove and return the first action from history', () => {
      const { addAction, undo } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Test Meal',
          timestamp: Date.now(),
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      const action = undo();

      expect(action).toBeDefined();
      expect(action?.type).toBe('meal');
      expect(useUndoStore.getState().history).toHaveLength(0);
    });

    it('should move undone action to redo stack', () => {
      const { addAction, undo } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Test Meal',
          timestamp: Date.now(),
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      undo();

      const { redoStack } = useUndoStore.getState();
      expect(redoStack).toHaveLength(1);
      expect(redoStack[0].type).toBe('meal');
    });

    it('should return null when history is empty', () => {
      const { undo } = useUndoStore.getState();

      const action = undo();

      expect(action).toBeNull();
    });

    it('should update canUndo after undo', () => {
      const { addAction, undo, canUndo } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Meal',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      expect(canUndo()).toBe(true);

      undo();

      expect(useUndoStore.getState().canUndo()).toBe(false);
    });

    it('should update canRedo after undo', () => {
      const { addAction, undo } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Meal',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      expect(useUndoStore.getState().canRedo()).toBe(false);

      undo();

      expect(useUndoStore.getState().canRedo()).toBe(true);
    });
  });

  describe('redo', () => {
    it('should remove and return the first action from redo stack', () => {
      const { addAction, undo, redo } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Test Meal',
          timestamp: Date.now(),
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      undo();
      const action = redo();

      expect(action).toBeDefined();
      expect(action?.type).toBe('meal');
      expect(useUndoStore.getState().redoStack).toHaveLength(0);
    });

    it('should move redone action back to history', () => {
      const { addAction, undo, redo } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Test Meal',
          timestamp: Date.now(),
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      undo();
      redo();

      const { history } = useUndoStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('meal');
    });

    it('should return null when redo stack is empty', () => {
      const { redo } = useUndoStore.getState();

      const action = redo();

      expect(action).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear both history and redo stack', () => {
      const { addAction, undo, clear } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Meal',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      undo(); // Move to redo stack

      expect(useUndoStore.getState().canUndo()).toBe(false);
      expect(useUndoStore.getState().canRedo()).toBe(true);

      clear();

      const { history, redoStack, canUndo, canRedo } = useUndoStore.getState();
      expect(history).toHaveLength(0);
      expect(redoStack).toHaveLength(0);
      expect(canUndo()).toBe(false);
      expect(canRedo()).toBe(false);
    });
  });

  describe('removeAction', () => {
    it('should remove action by id', () => {
      const { addAction, removeAction } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-123',
          name: 'Meal to Remove',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      addAction({
        type: 'meal',
        data: {
          id: 'meal-456',
          name: 'Meal to Keep',
          timestamp: Date.now(),
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      expect(useUndoStore.getState().history).toHaveLength(2);

      removeAction('meal-123');

      const { history } = useUndoStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0].data.id).toBe('meal-456');
    });

    it('should not affect history if id not found', () => {
      const { addAction, removeAction } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Meal',
          timestamp: Date.now(),
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      const originalLength = useUndoStore.getState().history.length;

      removeAction('non-existent-id');

      expect(useUndoStore.getState().history.length).toBe(originalLength);
    });
  });

  describe('Undo/Redo Cycle', () => {
    it('should maintain order through multiple undo/redo cycles', () => {
      const { addAction, undo, redo } = useUndoStore.getState();

      addAction({
        type: 'meal',
        data: {
          id: 'meal-1',
          name: 'Meal 1',
          timestamp: 1000,
          calories: 400,
          carbs: 40,
          proteins: 20,
          fats: 10,
        },
      });

      addAction({
        type: 'meal',
        data: {
          id: 'meal-2',
          name: 'Meal 2',
          timestamp: 2000,
          calories: 500,
          carbs: 50,
          proteins: 25,
          fats: 15,
        },
      });

      addAction({
        type: 'meal',
        data: {
          id: 'meal-3',
          name: 'Meal 3',
          timestamp: 3000,
          calories: 600,
          carbs: 60,
          proteins: 30,
          fats: 20,
        },
      });

      expect(useUndoStore.getState().history).toHaveLength(3);

      // Undo twice
      undo();
      undo();
      expect(useUndoStore.getState().history).toHaveLength(1);

      // Redo once
      redo();
      expect(useUndoStore.getState().history).toHaveLength(2);
      expect(useUndoStore.getState().history[0].data.name).toBe('Meal 2');
    });
  });
});

// ============================================================================
// METABOLIC SIMULATOR - DATA EXPORT HOOK
// ============================================================================

import { useCallback } from 'react';
import { useSimulationStore } from '../state/store';

export type ExportFormat = 'json' | 'csv';
export type ExportScope = 'all' | 'meals' | 'exercises' | 'sleep' | 'hormones' | 'energy';

interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  startDate?: Date;
  endDate?: Date;
}

interface ExportData {
  exportDate: string;
  dateRange: { start: string; end: string } | null;
  user: {
    age: number;
    weight: number;
    height: number;
    bodyFatPercentage: number;
    activityLevel: number;
  };
  data: {
    meals: unknown[];
    exercises: unknown[];
    sleep: unknown[];
    hormones: unknown[];
    energy: unknown[];
  };
}

/**
 * Hook for exporting simulation data in various formats
 */
export function useDataExport() {
  const { state } = useSimulationStore();

  /**
   * Convert data to CSV format
   */
  const toCSV = useCallback((data: unknown[], headers: string[]): string => {
    if (data.length === 0) return '';

    // Extract headers from first object if not provided
    if (headers.length === 0 && data.length > 0) {
      headers = Object.keys(data[0] as Record<string, unknown>);
    }

    // Create CSV rows
    const rows = data.map(row => {
      const values = headers.map(header => {
        const value = (row as Record<string, unknown>)[header];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Handle objects/arrays
        if (typeof value === 'object') return JSON.stringify(value);
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value);
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      });
      return values.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }, []);

  /**
   * Filter data by date range
   */
  const filterByDate = useCallback(<T extends { time?: Date | string; startTime?: Date | string; endTime?: Date | string }>(
    data: T[],
    startDate?: Date,
    endDate?: Date
  ): T[] => {
    if (!startDate && !endDate) return data;

    return data.filter(item => {
      const itemTime = item.time || item.startTime || item.endTime;
      if (!itemTime) return true;

      const date = typeof itemTime === 'string' ? new Date(itemTime) : itemTime;

      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;

      return true;
    });
  }, []);

  /**
   * Prepare export data based on scope and date range
   */
  const prepareExportData = useCallback((options: ExportOptions): ExportData => {
    if (!state) {
      throw new Error('No simulation state available');
    }

    const { scope, startDate, endDate } = options;

    // Filter meals by date range
    const meals = filterByDate(state.recentMeals || [], startDate, endDate).map(meal => ({
      time: meal.time,
      name: meal.name || 'Meal',
      calories: meal.totalMacros?.carbohydrities ?? 0 +
               (meal.totalMacros?.proteins ?? 0) * 4 +
               (meal.totalMacros?.fats ?? 0) * 9,
      carbohydrates: meal.totalMacros?.carbohydrates ?? 0,
      proteins: meal.totalMacros?.proteins ?? 0,
      fats: meal.totalMacros?.fats ?? 0,
      fiber: meal.totalMacros?.fiber ?? 0,
    }));

    // Filter exercises by date range
    const exercises = filterByDate(state.recentExercises || [], startDate, endDate).map(exercise => ({
      startTime: exercise.startTime,
      totalVolume: exercise.totalVolume,
      totalWork: exercise.totalWork,
      perceivedExertion: exercise.perceivedExertion,
      exerciseCount: exercise.exercises?.length ?? 0,
    }));

    // Filter sleep by date range
    const sleep = filterByDate(state.recentSleep || [], startDate, endDate).map(sleep => ({
      endTime: sleep.endTime,
      duration: sleep.duration,
      quality: sleep.quality,
      cycles: sleep.cycles,
    }));

    // Current hormone values
    const hormones = state.hormones ? Object.entries(state.hormones).map(([name, data]) => ({
      name,
      currentValue: data.currentValue,
      baseline: data.baseline,
      unit: name === 'insulin' ? 'µU/mL' :
            name === 'glucagon' ? 'pg/mL' :
            name === 'cortisol' ? 'mcg/dL' :
            name === 'testosterone' ? 'nmol/L' :
            name === 'growthHormone' ? 'ng/mL' :
            name === 'igf1' ? 'ng/mL' :
            name === 'epinephrine' ? 'pg/mL' :
            name === 'leptin' ? 'ng/mL' :
            name === 'ghrelin' ? 'pg/mL' : '',
    })) : [];

    // Current energy status
    const energy = state.energy ? [{
      bmr: state.energy.bmr,
      tdee: state.energy.tdee,
      caloriesConsumed: state.energy.caloriesConsumed,
      caloriesBurned: state.energy.caloriesBurned,
      netCalories: state.energy.netCalories,
      bloodGlucose: state.energy.bloodGlucose.currentValue,
    }] : [];

    return {
      exportDate: new Date().toISOString(),
      dateRange: (startDate || endDate) ? {
        start: startDate?.toISOString() || '',
        end: endDate?.toISOString() || '',
      } : null,
      user: {
        age: state.user.age,
        weight: state.user.weight,
        height: state.user.height,
        bodyFatPercentage: state.user.bodyFatPercentage,
        activityLevel: state.user.activityLevel,
      },
      data: {
        meals: scope === 'all' || scope === 'meals' ? meals : [],
        exercises: scope === 'all' || scope === 'exercises' ? exercises : [],
        sleep: scope === 'all' || scope === 'sleep' ? sleep : [],
        hormones: scope === 'all' || scope === 'hormones' ? hormones : [],
        energy: scope === 'all' || scope === 'energy' ? energy : [],
      },
    };
  }, [state, filterByDate]);

  /**
   * Export data as JSON file
   */
  const exportAsJSON = useCallback((data: ExportData, filename?: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `metabol-sim-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Export data as CSV file
   */
  const exportAsCSV = useCallback((data: ExportData, filename?: string): void => {
    const parts: string[] = [];

    // User info
    parts.push('# User Information');
    parts.push(toCSV([data.user], Object.keys(data.user)));

    // Each data section
    if (data.data.meals.length > 0) {
      parts.push('\n# Meals');
      parts.push(toCSV(data.data.meals, []));
    }

    if (data.data.exercises.length > 0) {
      parts.push('\n# Exercises');
      parts.push(toCSV(data.data.exercises, []));
    }

    if (data.data.sleep.length > 0) {
      parts.push('\n# Sleep');
      parts.push(toCSV(data.data.sleep, []));
    }

    if (data.data.hormones.length > 0) {
      parts.push('\n# Hormones');
      parts.push(toCSV(data.data.hormones, []));
    }

    if (data.data.energy.length > 0) {
      parts.push('\n# Energy Status');
      parts.push(toCSV(data.data.energy, []));
    }

    const csvContent = parts.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `metabol-sim-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [toCSV]);

  /**
   * Main export function
   */
  const exportData = useCallback((options: ExportOptions): void => {
    const data = prepareExportData(options);

    const { format } = options;
    const filename = `metabol-sim-${options.scope}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      exportAsJSON(data, `${filename}.json`);
    } else {
      exportAsCSV(data, `${filename}.csv`);
    }
  }, [prepareExportData, exportAsJSON, exportAsCSV]);

  /**
   * Export to clipboard (for pasting into spreadsheets)
   */
  const exportToClipboard = useCallback(async (options: ExportOptions): Promise<void> => {
    const data = prepareExportData(options);

    if (options.format === 'json') {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    } else {
      // Simple CSV format for clipboard
      let text = '';

      if (data.data.meals.length > 0) {
        text += `Meals:\n${toCSV(data.data.meals, [])}\n\n`;
      }
      if (data.data.exercises.length > 0) {
        text += `Exercises:\n${toCSV(data.data.exercises, [])}\n\n`;
      }
      if (data.data.sleep.length > 0) {
        text += `Sleep:\n${toCSV(data.data.sleep, [])}\n\n`;
      }

      await navigator.clipboard.writeText(text);
    }
  }, [prepareExportData, toCSV]);

  return {
    exportData,
    exportToClipboard,
    hasData: state !== null,
  };
}

export default useDataExport;

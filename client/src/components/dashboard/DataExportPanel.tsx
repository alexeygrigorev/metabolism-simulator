// ============================================================================
// METABOLIC SIMULATOR - DATA EXPORT PANEL COMPONENT
// ============================================================================
//
// Provides UI for exporting user data in various formats (JSON, CSV)
// Supports filtering by date range and data type.
// ============================================================================

import { useState, useCallback, memo } from 'react';
import { useDataExport, ExportFormat, ExportScope } from '../../hooks/useDataExport';
import { useSimulationStore } from '../../state/store';

interface DataExportPanelProps {
  className?: string;
}

// Export scope options with descriptions
const SCOPE_OPTIONS: { value: ExportScope; label: string; description: string }[] = [
  { value: 'all', label: 'All Data', description: 'Export meals, exercises, sleep, hormones, and energy data' },
  { value: 'meals', label: 'Meals', description: 'Export meal history with macros' },
  { value: 'exercises', label: 'Exercises', description: 'Export workout history' },
  { value: 'sleep', label: 'Sleep', description: 'Export sleep data' },
  { value: 'hormones', label: 'Hormones', description: 'Export current hormone levels' },
  { value: 'energy', label: 'Energy', description: 'Export energy and calorie data' },
];

// Format options
const FORMAT_OPTIONS: { value: ExportFormat; label: string; extension: string }[] = [
  { value: 'json', label: 'JSON', extension: '.json' },
  { value: 'csv', label: 'CSV', extension: '.csv' },
];

// Date range presets
const DATE_PRESETS = [
  { label: 'All Time', days: null },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

const DataExportPanel = memo(function DataExportPanel({ className = '' }: DataExportPanelProps) {
  const { exportData, exportToClipboard, hasData } = useDataExport();
  const { state } = useSimulationStore();

  const [selectedScope, setSelectedScope] = useState<ExportScope>('all');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const startDate = selectedPreset !== null
        ? new Date(Date.now() - selectedPreset * 24 * 60 * 60 * 1000)
        : undefined;

      await exportData({
        format: selectedFormat,
        scope: selectedScope,
        startDate,
        endDate: new Date(),
      });

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [exportData, selectedFormat, selectedScope, selectedPreset]);

  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const startDate = selectedPreset !== null
        ? new Date(Date.now() - selectedPreset * 24 * 60 * 60 * 1000)
        : undefined;

      await exportToClipboard({
        format: selectedFormat,
        scope: selectedScope,
        startDate,
        endDate: new Date(),
      });

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [exportToClipboard, selectedFormat, selectedScope, selectedPreset]);

  if (!state) {
    return null;
  }

  // Get data counts for display
  const dataCounts = {
    meals: state.recentMeals?.length ?? 0,
    exercises: state.recentExercises?.length ?? 0,
    sleep: state.recentSleep?.length ?? 0,
  };

  return (
    <div className={`bg-slate-800/50 rounded-lg border border-slate-700 ${className}`} data-testid="data-export-panel">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="text-lg font-semibold text-white">Data Export</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Export your data for analysis or backup
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Data Summary */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-2">Available Data</div>
          <div className="flex gap-4 text-sm">
            <span>🍽️ {dataCounts.meals} meals</span>
            <span>🏋️ {dataCounts.exercises} exercises</span>
            <span>😴 {dataCounts.sleep} sleep logs</span>
          </div>
        </div>

        {/* Export Scope Selection */}
        <div>
          <label id="export-scope-label" className="text-sm text-slate-300 block mb-2">What to Export</label>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="export-scope-label">
            {SCOPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedScope(option.value)}
                className={`text-left p-2 rounded-lg border transition-all ${
                  selectedScope === option.value
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label id="export-format-label" className="text-sm text-slate-300 block mb-2">Format</label>
          <div className="flex gap-2" role="radiogroup" aria-labelledby="export-format-label">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`flex-1 p-2 rounded-lg border transition-all ${
                  selectedFormat === format.value
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-medium text-sm">{format.label}</div>
                <div className="text-xs text-slate-400">{format.extension}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <label id="export-date-label" className="text-sm text-slate-300 block mb-2">Date Range</label>
          <div className="flex gap-2" role="radiogroup" aria-labelledby="export-date-label">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setSelectedPreset(preset.days)}
                className={`flex-1 p-2 rounded-lg border text-sm transition-all ${
                  selectedPreset === preset.days
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleExport}
            disabled={isExporting || !hasData}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>Download {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
          <button
            onClick={handleCopyToClipboard}
            disabled={isExporting || !hasData}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            title="Copy to clipboard"
          >
            {exportSuccess ? (
              <span className="text-green-400">✓</span>
            ) : (
              <span>📋</span>
            )}
          </button>
        </div>

        {/* Success Message */}
        {exportSuccess && (
          <div className="text-center text-sm text-green-400 animate-pulse">
            Export successful!
          </div>
        )}
      </div>
    </div>
  );
});

export default DataExportPanel;

// ============================================================================
// METABOLIC SIMULATOR - SETTINGS PANEL COMPONENT
// ============================================================================

import { memo, useState, useEffect, useRef } from 'react';
import { useSimulationStore } from '../../state/store';
import type { SimulationState } from '@metabol-sim/shared';
import DataExportButton from './DataExportButton';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimeUnit = 'metric' | 'imperial';
type TemperatureUnit = 'celsius' | 'fahrenheit';
type Theme = 'dark' | 'light';

const SETTINGS_KEY = 'metabol-sim-settings';
const DATA_VERSION = 2;

interface UserSettings {
  timeUnit: TimeUnit;
  temperatureUnit: TemperatureUnit;
  theme: Theme;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoSaveInterval: number;
  defaultTimeScale: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  timeUnit: 'metric',
  temperatureUnit: 'celsius',
  theme: 'dark',
  notificationsEnabled: true,
  soundEnabled: false,
  autoSaveInterval: 30,
  defaultTimeScale: 1,
};

interface ExportData {
  version: number;
  exportDate: string;
  settings: UserSettings;
  simulation: SimulationState;
}

function loadSettings(): UserSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Validate that the imported data has the required structure
function isValidSimulationState(data: any): data is SimulationState {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.userId === 'string' &&
    data.user &&
    typeof data.user.age === 'number' &&
    data.energy &&
    typeof data.energy.bmr === 'number' &&
    data.hormones &&
    data.muscle
  );
}

const SettingsPanel = memo(function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { state, connected, setTimeScale, setPaused, reset, setState, addToast } = useSimulationStore();
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [importError, setImportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [settings.theme]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all simulation data? This cannot be undone.')) {
      reset();
      addToast('Simulation reset successfully', 'success');
      onClose();
    }
  };

  const handleExportData = () => {
    if (!state) {
      addToast('No simulation data to export', 'warning');
      return;
    }

    setIsExporting(true);

    try {
      const exportData: ExportData = {
        version: DATA_VERSION,
        exportDate: new Date().toISOString(),
        settings: loadSettings(),
        simulation: state,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `metabol-sim-export-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);

      addToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      addToast('Failed to export data', 'warning');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Validate version
        if (!data.version) {
          throw new Error('Invalid file format: missing version');
        }

        // Validate version compatibility
        if (data.version > DATA_VERSION) {
          throw new Error(`File version ${data.version} is not supported. Please update the simulator.`);
        }

        // Restore settings if present
        if (data.settings) {
          const mergedSettings = { ...DEFAULT_SETTINGS, ...data.settings };
          setSettings(mergedSettings);
          saveSettings(mergedSettings);
        }

        // Import simulation state
        if (data.simulation && isValidSimulationState(data.simulation)) {
          // Preserve current timestamp and settings
          const importedState: SimulationState = {
            ...data.simulation,
            timestamp: new Date(),
            gameTime: data.simulation.gameTime || new Date(),
          };

          setState(importedState);
          addToast('Data imported successfully', 'success');
          onClose();
        } else {
          throw new Error('Invalid simulation data in file');
        }

        setImportError(null);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to import data';
        setImportError(errorMsg);
        addToast(`Import failed: ${errorMsg}`, 'warning');
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read file');
      addToast('Failed to read file', 'warning');
      setIsImporting(false);
    };

    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Units */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
              Units
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Measurement System</span>
                <select
                  value={settings.timeUnit}
                  onChange={(e) => updateSetting('timeUnit', e.target.value as TimeUnit)}
                  className="bg-slate-700 text-white px-3 py-1.5 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="metric">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lb, in)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Temperature</span>
                <select
                  value={settings.temperatureUnit}
                  onChange={(e) => updateSetting('temperatureUnit', e.target.value as TemperatureUnit)}
                  className="bg-slate-700 text-white px-3 py-1.5 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Simulation */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
              Simulation
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Default Time Scale</span>
                <select
                  value={settings.defaultTimeScale}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    updateSetting('defaultTimeScale', value);
                    setTimeScale(value);
                  }}
                  className="bg-slate-700 text-white px-3 py-1.5 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value={1}>1x (Real-time)</option>
                  <option value={10}>10x</option>
                  <option value={60}>1 minute/sec</option>
                  <option value={600}>10 minutes/sec</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Auto-Save Interval</span>
                <select
                  value={settings.autoSaveInterval}
                  onChange={(e) => updateSetting('autoSaveInterval', Number(e.target.value))}
                  className="bg-slate-700 text-white px-3 py-1.5 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value={0}>Disabled</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-300">Toast Notifications</span>
                  <p className="text-xs text-slate-500">Show feedback for actions</p>
                </div>
                <button
                  onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-300">Sound Effects</span>
                  <p className="text-xs text-slate-500">Audio feedback</p>
                </div>
                <button
                  onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
              Data Management
            </h3>
            <div className="space-y-2">
              {/* Quick export options */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportData}
                  disabled={isExporting || isImporting || !state}
                  className={`flex-1 px-4 py-2 rounded transition-colors text-sm flex items-center justify-center gap-2 ${
                    isExporting || isImporting || !state
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                  title="Export full simulation state as JSON"
                >
                  {isExporting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Export JSON</span>
                    </>
                  )}
                </button>
                <DataExportButton
                  className="flex-1"
                />
              </div>
              <button
                onClick={handleImportClick}
                disabled={isExporting || isImporting}
                className={`w-full px-4 py-2 rounded transition-colors text-sm flex items-center justify-center gap-2 ${
                  isExporting || isImporting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {isImporting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>Import Data</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
                disabled={isImporting}
              />
              {importError && (
                <div className="px-3 py-2 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
                  ⚠️ {importError}
                </div>
              )}
              <div className="p-2 bg-slate-900/50 rounded text-xs text-slate-400">
                Export saves your full simulation state including hormones, energy, muscle status, and health markers to a JSON file.
              </div>
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors text-sm"
              >
                🗑️ Reset Simulation
              </button>
            </div>
          </section>

          {/* Connection Status */}
          <section className="p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                connected
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {connected ? '🟢 Live Mode' : '🟡 Demo Mode'}
              </span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});

export default SettingsPanel;
export { loadSettings, saveSettings, DEFAULT_SETTINGS };
export type { UserSettings };

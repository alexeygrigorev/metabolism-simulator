// ============================================================================
// METABOLIC SIMULATOR - DATA EXPORT BUTTON COMPONENT
// ============================================================================

import { useState, memo } from 'react';
import { useDataExport, ExportFormat, ExportScope } from '../../hooks/useDataExport';

interface DataExportButtonProps {
  className?: string;
}

const SCOPE_LABELS: Record<ExportScope, string> = {
  all: 'All Data',
  meals: 'Meals Only',
  exercises: 'Exercises Only',
  sleep: 'Sleep Only',
  hormones: 'Hormones Only',
  energy: 'Energy Status',
};

const DataExportButton = memo(function DataExportButton({ className = '' }: DataExportButtonProps) {
  const { exportData, exportToClipboard, hasData } = useDataExport();
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<ExportScope>('all');
  const [format, setFormat] = useState<ExportFormat>('json');
  const [showToast, setShowToast] = useState(false);

  if (!hasData) return null;

  const handleExport = () => {
    exportData({ format, scope });
    setIsOpen(false);
  };

  const handleCopyToClipboard = async () => {
    await exportToClipboard({ format, scope });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors flex items-center gap-2 ${className}`}
      >
        <span>📊</span>
        <span>Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 min-w-[280px]">
            <h3 className="text-white font-medium mb-3">Export Data</h3>

            {/* Scope Selection */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Data Scope</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as ExportScope)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(SCOPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Format Selection */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-1">File Format</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat('json')}
                  className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                    format === 'json'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setFormat('csv')}
                  className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                    format === 'csv'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
              >
                Download
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors"
              >
                Copy
              </button>
            </div>

            {showToast && (
              <div className="mt-2 text-center text-xs text-green-400">
                Copied to clipboard!
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
              Export your data for external analysis or backup.
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default DataExportButton;

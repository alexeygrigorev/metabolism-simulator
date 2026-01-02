// ============================================================================
// METABOLIC SIMULATOR - BODY MEASUREMENTS TRACKER COMPONENT
// ============================================================================

import { useState, useMemo, memo } from 'react';
import { useMeasurementsStore, MEASUREMENT_CONFIGS, MeasurementType } from '../../state/measurementsStore';
import { formatDistanceToNow } from 'date-fns';

interface MeasurementsTrackerProps {
  className?: string;
}

const MeasurementsTracker = memo(function MeasurementsTracker({
  className = '',
}: MeasurementsTrackerProps) {
  const {
    entries,
    activeCategory,
    addEntry,
    deleteEntry,
    getHistoryForMeasurement,
    getStats,
    setActiveCategory,
  } = useMeasurementsStore();

  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newMeasurements, setNewMeasurements] = useState<Record<MeasurementType, string>>(
    Object.fromEntries(
      Object.keys(MEASUREMENT_CONFIGS).map((key) => [key, ''])
    ) as Record<MeasurementType, string>
  );
  const [notes, setNotes] = useState('');

  const stats = getStats();

  // Filter measurements by active category
  const filteredMeasurements = useMemo(() => {
    return Object.values(MEASUREMENT_CONFIGS).filter((config) => {
      if (activeCategory === 'all') return true;
      return config.category === activeCategory;
    });
  }, [activeCategory]);

  // Get recent history for each measurement type
  const recentValues = useMemo(() => {
    const values: Record<MeasurementType, { value: number; date: Date } | null> =
      Object.fromEntries(
        Object.keys(MEASUREMENT_CONFIGS).map((key) => [key, null])
      ) as Record<MeasurementType, { value: number; date: Date } | null>;

    for (const type of Object.keys(MEASUREMENT_CONFIGS) as MeasurementType[]) {
      const history = getHistoryForMeasurement(type, 1);
      if (history.length > 0) {
        values[type] = { value: history[0].value, date: history[0].date };
      }
    }

    return values;
  }, [entries, getHistoryForMeasurement]);

  // Get trend indicator for a measurement type
  const getTrendIndicator = (type: MeasurementType) => {
    const trend = stats.trends[type];
    if (!trend) return null;

    if (trend === 'up') return <span className="text-green-400">↑</span>;
    if (trend === 'down') return <span className="text-red-400">↓</span>;
    return <span className="text-gray-400">→</span>;
  };

  // Handle adding a new entry
  const handleAddEntry = () => {
    const measurements: Record<MeasurementType, number | null> =
      Object.fromEntries(
        Object.entries(newMeasurements).map(([key, value]) => [
          key as MeasurementType,
          value && value.trim() !== '' ? parseFloat(value) : null,
        ])
      ) as Record<MeasurementType, number | null>;

    // Validate at least one measurement is provided
    const hasMeasurement = Object.values(measurements).some((v) => v !== null);
    if (!hasMeasurement) return;

    addEntry(measurements, notes.trim() || undefined);

    // Reset form
    setNewMeasurements(
      Object.fromEntries(
        Object.keys(MEASUREMENT_CONFIGS).map((key) => [key, ''])
      ) as Record<MeasurementType, string>
    );
    setNotes('');
    setIsAddingEntry(false);
  };

  // Handle input change
  const handleInputChange = (type: MeasurementType, value: string) => {
    setNewMeasurements((prev) => ({ ...prev, [type]: value }));
  };

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All', icon: '📊' },
    { id: 'primary', name: 'Primary', icon: '⭐' },
    { id: 'upper', name: 'Upper Body', icon: '💪' },
    { id: 'lower', name: 'Lower Body', icon: '🦵' },
    { id: 'other', name: 'Other', icon: '📏' },
  ] as const;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Body Measurements</h2>
          <p className="text-sm text-slate-400">
            {stats.totalEntries > 0
              ? `${stats.totalEntries} entr${stats.totalEntries === 1 ? 'y' : 'ies'} • ${stats.streak} day streak`
              : 'Track your body measurements over time'}
          </p>
        </div>
        <button
          onClick={() => setIsAddingEntry(!isAddingEntry)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isAddingEntry ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Add Entry Form */}
      {isAddingEntry && (
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
          <h3 className="text-sm font-medium text-white mb-3">Log New Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
            {filteredMeasurements.map((config) => (
              <div key={config.id}>
                <label className="block text-xs text-slate-400 mb-1">
                  {config.icon} {config.name} ({config.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={recentValues[config.id]?.value.toFixed(1) || '-'}
                  value={newMeasurements[config.id]}
                  onChange={(e) => handleInputChange(config.id, e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="mb-3">
            <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
            <input
              type="text"
              placeholder="Any notes for this entry..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddEntry}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save Entry
            </button>
            <button
              onClick={() => setIsAddingEntry(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Measurements Display */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredMeasurements.map((config) => {
          const recent = recentValues[config.id];
          const trend = getTrendIndicator(config.id);

          return (
            <div
              key={config.id}
              className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{config.icon}</span>
                {trend && <span className="text-lg">{trend}</span>}
              </div>
              <h4 className="text-sm font-medium text-white">{config.name}</h4>
              {recent ? (
                <>
                  <p className="text-xl font-bold text-white">
                    {recent.value.toFixed(1)}{' '}
                    <span className="text-sm font-normal text-slate-400">{config.unit}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(recent.date, { addSuffix: true })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">No data yet</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{config.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
          <h3 className="text-sm font-medium text-white mb-3">Recent Entries</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...entries]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((entry) => {
                const measurementCount = Object.values(entry.measurements).filter(
                  (v) => v !== null
                ).length;

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {measurementCount} measurement{measurementCount !== 1 ? 's' : ''}
                        {entry.notes && ` • ${entry.notes}`}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && !isAddingEntry && (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">No measurements logged yet</p>
          <p className="text-sm text-slate-500">
            Start tracking your progress by adding your first entry
          </p>
        </div>
      )}
    </div>
  );
});

export default MeasurementsTracker;

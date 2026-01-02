// ============================================================================
// METABOLIC SIMULATOR - SUPPLEMENT TRACKER COMPONENT
// ============================================================================

import { memo, useState, useMemo, useEffect } from 'react';
import { SUPPLEMENTS, SUPPLEMENT_CATEGORIES, getSupplementById, getSupplementInteractions, Supplement } from '../../data/supplements';
import { useAchievementsStore } from '../../state/achievementsStore';

interface LoggedSupplement {
  id: string;
  supplementId: string;
  timestamp: number;
  timing: string;
  notes?: string;
}

interface SupplementTrackerProps {
  onSupplementLogged?: (supplement: Supplement, timing: string) => void;
}

const SupplementTracker = memo(function SupplementTracker({ onSupplementLogged }: SupplementTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);
  const [selectedTiming, setSelectedTiming] = useState('morning');
  const [loggedSupplements, setLoggedSupplements] = useState<LoggedSupplement[]>([]);
  const [showInteractions, setShowInteractions] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('metabol-sim-supplements');
      if (saved) {
        setLoggedSupplements(JSON.parse(saved));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const filteredSupplements = useMemo(() => {
    let filtered = SUPPLEMENTS;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.commonNames.some(n => n.toLowerCase().includes(query)) ||
        s.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Get today's logged supplements
  const todaysSupplements = useMemo(() => {
    const today = new Date().toDateString();
    return loggedSupplements.filter(s =>
      new Date(s.timestamp).toDateString() === today
    );
  }, [loggedSupplements]);

  const handleLogSupplement = () => {
    if (!selectedSupplement) return;

    const logged: LoggedSupplement = {
      id: `${selectedSupplement.id}-${Date.now()}`,
      supplementId: selectedSupplement.id,
      timestamp: Date.now(),
      timing: selectedTiming,
    };

    const updated = [...loggedSupplements, logged];
    setLoggedSupplements(updated);

    // Save to localStorage
    try {
      localStorage.setItem('metabol-sim-supplements', JSON.stringify(updated));
    } catch {
      // Ignore errors
    }

    // Track achievement
    useAchievementsStore.getState().trackSupplement();

    // Notify parent
    onSupplementLogged?.(selectedSupplement, selectedTiming);

    // Reset selection
    setSelectedSupplement(null);
  };

  const handleRemoveSupplement = (id: string) => {
    const updated = loggedSupplements.filter(s => s.id !== id);
    setLoggedSupplements(updated);

    try {
      localStorage.setItem('metabol-sim-supplements', JSON.stringify(updated));
    } catch {
      // Ignore errors
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💊</span>
            <h3 className="text-lg font-semibold text-white">Supplement Tracker</h3>
          </div>
          <span className="text-xs text-slate-400">
            {todaysSupplements.length} logged today
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {SUPPLEMENT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search supplements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="p-4">
        {/* Supplement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {filteredSupplements.slice(0, 6).map(supplement => (
            <div
              key={supplement.id}
              onClick={() => setSelectedSupplement(supplement)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSupplement?.id === supplement.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{supplement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white text-sm">{supplement.name}</h4>
                    {supplement.dailyLimit && (
                      <span className="text-xs text-slate-500">Max: {supplement.dailyLimit}mg</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{supplement.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {supplement.effects.slice(0, 2).map((effect, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded ${
                          effect.direction === 'increase'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {effect.hormone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Supplement Detail */}
        {selectedSupplement && (
          <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedSupplement.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{selectedSupplement.name}</h4>
                  <p className="text-sm text-slate-400">{selectedSupplement.servingSize}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSupplement(null)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Benefits */}
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Benefits</h5>
              <ul className="text-sm text-slate-400 space-y-1">
                {selectedSupplement.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hormone Effects */}
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Hormone Effects</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedSupplement.effects.map((effect, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      effect.direction === 'increase' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-slate-300">{effect.hormone}</span>
                    <span className="text-xs text-slate-500">
                      {effect.direction === 'increase' ? '↑' : '↓'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactions Warning */}
            {selectedSupplement.interactions.length > 0 && (
              <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded">
                <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                  ⚠️ Interactions
                </h5>
                {selectedSupplement.interactions.map((interaction, i) => {
                  const relatedSupplement = getSupplementById(interaction.supplementId);
                  return (
                    <div key={i} className="text-sm text-amber-200">
                      <span className="font-medium">{relatedSupplement?.name}</span>: {interaction.description}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contraindications */}
            {selectedSupplement.contraindications.length > 0 && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">
                  ⛔ Contraindications
                </h5>
                <p className="text-sm text-red-200">
                  {selectedSupplement.contraindications.join(', ')}
                </p>
              </div>
            )}

            {/* Timing Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">When to take:</label>
              <select
                value={selectedTiming}
                onChange={(e) => setSelectedTiming(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedSupplement.recommendedTiming.map(timing => (
                  <option key={timing} value={timing}>
                    {timing.charAt(0).toUpperCase() + timing.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Log Button */}
            <button
              onClick={handleLogSupplement}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Log Supplement
            </button>
          </div>
        )}

        {/* Today's Log */}
        {todaysSupplements.length > 0 && (
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-3">Today's Log</h4>
            <div className="space-y-2">
              {todaysSupplements.map(logged => {
                const supplement = getSupplementById(logged.supplementId);
                if (!supplement) return null;

                const time = new Date(logged.timestamp);
                const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={logged.id}
                    className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{supplement.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{supplement.name}</div>
                        <div className="text-xs text-slate-500">{timeStr} • {logged.timing}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSupplement(logged.id)}
                      className="text-slate-400 hover:text-red-400 p-1"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default SupplementTracker;

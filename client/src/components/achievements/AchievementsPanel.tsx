// ============================================================================
// METABOLIC SIMULATOR - ACHIEVEMENTS PANEL COMPONENT
// ============================================================================

import { memo, useState, useMemo } from 'react';
import { useAchievementsStore, getAchievementProgress } from '../../state/achievementsStore';
import { ACHIEVEMENTS, Achievement, RARITY_COLORS, RARITY_BORDER } from '../../data/achievements';

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Categories defined outside component to avoid recreation
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🏆' },
  { id: 'metabolism', name: 'Metabolism', icon: '🔥' },
  { id: 'hormones', name: 'Hormones', icon: '🧪' },
  { id: 'muscle', name: 'Muscle', icon: '💪' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
  { id: 'milestone', name: 'Milestones', icon: '🎯' },
] as const;

const TOTAL_ACHIEVEMENT_COUNT = ACHIEVEMENTS.length;

const AchievementsPanel = memo(function AchievementsPanel({ isOpen, onClose }: AchievementsPanelProps) {
  const { unlockedAchievements } = useAchievementsStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLocked, setShowLocked] = useState(true);

  // Memoize unlocked IDs to avoid recreating Set on every render
  const unlockedIds = useMemo(() => new Set(unlockedAchievements.map((a) => a.id)), [unlockedAchievements]);
  const unlockedCount = unlockedIds.size;
  const completionPercent = useMemo(
    () => Math.round((unlockedCount / TOTAL_ACHIEVEMENT_COUNT) * 100),
    [unlockedCount]
  );

  // Memoize filtered achievements to avoid refiltering on unrelated renders
  const filteredAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => {
      const categoryMatch = selectedCategory === 'all' || a.category === selectedCategory;
      const lockedMatch = showLocked || unlockedIds.has(a.id);
      return categoryMatch && lockedMatch;
    }),
    [selectedCategory, showLocked, unlockedIds]
  );

  const AchievementCard = memo(function AchievementCard({ achievement }: { achievement: Achievement }) {
    const isUnlocked = unlockedIds.has(achievement.id);
    const progress = getAchievementProgress(achievement.id);
    const hasProgress = progress.target > 1;

    return (
      <div
        className={`p-4 rounded-lg border transition-all ${
          isUnlocked
            ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} bg-opacity-10 ${RARITY_BORDER[achievement.rarity]} border`
            : 'bg-slate-800/50 border-slate-700 opacity-60'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`text-3xl ${!isUnlocked ? 'grayscale' : ''}`}>
            {achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                {achievement.name}
              </h4>
              {!isUnlocked && achievement.hint && (
                <span className="text-xs text-slate-500">💡 {achievement.hint}</span>
              )}
            </div>
            <p className={`text-sm mt-1 ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
              {achievement.description}
            </p>
            {hasProgress && !isUnlocked && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{progress.current} / {progress.target} {progress.label}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {isUnlocked && (
              <div className="mt-1 text-xs text-slate-400">
                ✓ Unlocked
              </div>
            )}
          </div>
          <div className={`px-2 py-0.5 rounded text-xs font-medium ${
            achievement.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
            achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
            achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {achievement.rarity}
          </div>
        </div>
      </div>
    );
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Achievements</h2>
            <p className="text-sm text-slate-400">{unlockedCount} of {TOTAL_ACHIEVEMENT_COUNT} unlocked ({completionPercent}%)</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 p-2 bg-slate-900/50 overflow-x-auto">
          {CATEGORIES.map((cat) => (
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

        {/* Filters */}
        <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showLocked}
              onChange={(e) => setShowLocked(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
            />
            Show locked achievements
          </label>
          <span className="text-sm text-slate-400">
            {filteredAchievements.length} displayed
          </span>
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg">No achievements to display</p>
              <p className="text-sm mt-1">Try changing your filters</p>
            </div>
          ) : (
            filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

export default AchievementsPanel;

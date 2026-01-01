// ============================================================================
// METABOLIC SIMULATOR - ACHIEVEMENT NOTIFICATION COMPONENT
// ============================================================================

import { memo, useEffect } from 'react';
import { useAchievementsStore } from '../../state/achievementsStore';
import { RARITY_COLORS, RARITY_BORDER } from '../../data/achievements';

interface AchievementNotificationProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  onDismiss: () => void;
}

const AchievementNotification = memo(function AchievementNotification({
  achievement,
  onDismiss,
}: AchievementNotificationProps) {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} bg-opacity-95 rounded-lg border-2 ${RARITY_BORDER[achievement.rarity]} p-4 shadow-2xl max-w-sm`}
      >
        <div className="flex items-start gap-3">
          <div className="text-4xl animate-pulse">{achievement.icon}</div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">
              Achievement Unlocked!
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">{achievement.name}</h3>
            <p className="text-sm text-white/90 mt-1">{achievement.description}</p>
            <div className="mt-2 text-xs text-white/70 capitalize">
              {achievement.rarity}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
});

export default AchievementNotification;

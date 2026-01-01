// ============================================================================
// METABOLIC SIMULATOR - ACHIEVEMENTS BUTTON COMPONENT
// ============================================================================

import { memo, useState, useEffect, lazy, Suspense } from 'react';
import { useAchievementsStore } from '../../state/achievementsStore';
import AchievementNotification from './AchievementNotification';

// Lazy load the heavy AchievementsPanel
const AchievementsPanel = lazy(() => import('./AchievementsPanel'));

// Loading fallback component
function AchievementsLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400">Loading achievements...</p>
      </div>
    </div>
  );
}

const AchievementsButton = memo(function AchievementsButton() {
  const { unlockedAchievements, showNotification, dismissNotification, stats, initTracking } = useAchievementsStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize achievement tracking
    initTracking(61.5); // Default muscle mass, will be updated by actual state
  }, [initTracking]);

  const unlockedCount = unlockedAchievements.length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors relative"
        aria-label="View achievements"
        title="Achievements"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.181a1 1 0 011.827.954L17.5 8.017l1.679 3.134a1 1 0 01-.95 1.454l-3.329.466 1.581 3.954a1 1 0 01-1.637 1.136L10 14.677l-3.844 2.484a1 1 0 01-1.637-1.136l1.581-3.954-3.329-.466a1 1 0 01-.95-1.454L2.5 8.017 1.52 3.682a1 1 0 011.827-.954L5.046 6.01 9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552 2.552-.818-1.734-1.734zm7.636 0l-1.734 1.734 2.552.818-.818-2.552z" clipRule="evenodd" />
        </svg>
        {unlockedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unlockedCount}
          </span>
        )}
      </button>

      <Suspense fallback={<AchievementsLoading />}>
        <AchievementsPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </Suspense>

      {showNotification && (
        <AchievementNotification
          achievement={showNotification}
          onDismiss={dismissNotification}
        />
      )}
    </>
  );
});

export default AchievementsButton;

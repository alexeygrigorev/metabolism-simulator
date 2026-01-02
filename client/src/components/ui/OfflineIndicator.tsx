// ============================================================================
// METABOLIC SIMULATOR - OFFLINE INDICATOR COMPONENT
// ============================================================================

import { memo } from 'react';
import { useOffline } from '../../hooks/useOffline';

const OfflineIndicator = memo(function OfflineIndicator() {
  const { isOnline, isOffline, queueSize, retryQueue } = useOffline();

  if (isOnline && queueSize === 0) {
    return null;
  }

  const handleRetry = async () => {
    await retryQueue();
  };

  return (
    <div
      className={`fixed top-20 right-4 z-40 rounded-lg shadow-lg border px-4 py-2 flex items-center gap-2 transition-all ${
        isOffline
          ? 'bg-amber-500/20 border-amber-500/50'
          : queueSize > 0
            ? 'bg-blue-500/20 border-blue-500/50'
            : 'bg-green-500/20 border-green-500/50'
      }`}
    >
      <span className="text-lg">
        {isOffline ? '📴' : queueSize > 0 ? '🔄' : '📶'}
      </span>
      <div className="text-sm">
        {isOffline ? (
          <span className="text-amber-400 font-medium">You are offline</span>
        ) : queueSize > 0 ? (
          <span className="text-blue-400">
            <span className="font-medium">{queueSize}</span> actions pending sync
            <button
              onClick={handleRetry}
              className="ml-2 underline hover:text-blue-300"
            >
              Retry now
            </button>
          </span>
        ) : (
          <span className="text-green-400">Back online</span>
        )}
      </div>
    </div>
  );
});

export default OfflineIndicator;

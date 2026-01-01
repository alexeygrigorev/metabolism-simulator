// ============================================================================
// METABOLIC SIMULATOR - HEADER COMPONENT
// ============================================================================

import { useSimulationStore } from '../state/store';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import SettingsPanel from './ui/SettingsPanel';
import AchievementsButton from './achievements/AchievementsButton';

// Speed buttons configuration - defined outside component to avoid recreation
const SPEED_BUTTONS = [1, 10, 60, 600] as const;
const SPEED_LABELS: Record<number, string> = {
  1: '1x',
  10: '10x',
  60: '1m',
  600: '10m',
};

function Header() {
  const { state, paused, timeScale, togglePause, setTimeScale, connected } = useSimulationStore();
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Update WebSocket status based on store state
    if (connected && state) {
      setWsStatus('connected');
    } else if (state) {
      setWsStatus('disconnected');
    } else {
      setWsStatus('connecting');
    }
  }, [connected, state]);

  // Memoize formatted game time to avoid recalculation on every render
  const formattedTime = useMemo(() => {
    if (!state) return '--:--';
    const d = typeof state.gameTime === 'string' ? new Date(state.gameTime) : state.gameTime;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [state?.gameTime]);

  // Memoize speed label
  const speedLabel = useMemo(() => {
    if (timeScale === 1) return 'Real-time';
    if (timeScale < 60) return `${timeScale}x`;
    return `${(timeScale / 60).toFixed(1)} min/sec`;
  }, [timeScale]);

  // Memoize status display
  const statusDisplay = useMemo(() => {
    const statusColor = wsStatus === 'connected' ? 'text-green-400' :
                       wsStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400';
    const dotColor = wsStatus === 'connected' ? 'bg-green-400' :
                    wsStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400';
    const statusText = wsStatus === 'connected' ? 'Live' :
                      wsStatus === 'connecting' ? 'Connecting...' : 'Demo Mode';

    return { statusColor, dotColor, statusText };
  }, [wsStatus]);

  // Use callback for event handlers to prevent recreation
  const handleTogglePause = useCallback(() => {
    togglePause();
  }, [togglePause]);

  const handleSetTimeScale = useCallback((speed: number) => {
    setTimeScale(speed);
  }, [setTimeScale]);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Metabolism Simulator
            </h1>
            {/* Connection status indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/50 rounded-full text-xs">
              <span className={`w-2 h-2 rounded-full animate-pulse ${statusDisplay.dotColor}`} />
              <span className={statusDisplay.statusColor}>
                {statusDisplay.statusText}
              </span>
            </div>
          </div>
          {state && (
            <div className="flex items-center gap-2 text-sm text-slate-400" role="status" aria-live="polite">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded" aria-label="Game time">
                {formattedTime}
              </span>
              <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded" aria-label="Simulation speed">
                {speedLabel}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Simulation controls">
          {/* Achievements button */}
          <AchievementsButton />

          {/* Settings button */}
          <button
            onClick={handleOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Open settings"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Speed controls */}
          <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1" role="group" aria-label="Time scale controls">
            {SPEED_BUTTONS.map((speed) => (
              <button
                key={speed}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeScale === speed
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-slate-700 text-slate-300'
                }`}
                onClick={() => handleSetTimeScale(speed)}
                title={`Set speed to ${speed}x`}
                aria-label={`Set speed to ${SPEED_LABELS[speed]}`}
                aria-pressed={timeScale === speed}
              >
                {SPEED_LABELS[speed]}
              </button>
            ))}
          </div>

          {/* Pause/Play button */}
          <button
            className={`px-3 py-1 rounded flex items-center gap-1 ${
              paused
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
            onClick={handleTogglePause}
            aria-label={paused ? 'Resume simulation' : 'Pause simulation'}
            aria-pressed={paused}
          >
            {paused ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Resume
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
                Pause
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={handleCloseSettings} />
    </header>
  );
}

export default memo(Header);

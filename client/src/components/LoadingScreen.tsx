// ============================================================================
// METABOLIC SIMULATOR - LOADING SCREEN COMPONENT
// ============================================================================

import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Initializing simulation...',
  'Loading hormone profiles...',
  'Calibrating metabolic models...',
  'Preparing dashboard...',
  'Almost ready...',
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center max-w-md px-4">
        {/* Animated DNA helix inspired spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{
                  left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                  top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 animate-spin">
            <div className="w-full h-2 border-4 border-transparent border-t-blue-400 rounded-full" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">Loading Metabolism Simulator</h2>
        <p className="text-slate-400 animate-pulse">{LOADING_MESSAGES[messageIndex]}</p>

        {/* Progress bar */}
        <div className="mt-6 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-[shimmer_2s_infinite] w-2/3 mx-auto rounded-full" />
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Demo Mode - No server connection required
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(100%) scaleX(0.5); }
        }
      `}</style>
    </div>
  );
}

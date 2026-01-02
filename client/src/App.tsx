// ============================================================================
// METABOLIC SIMULATOR - APP COMPONENT
// ============================================================================

import { useEffect, useState, Suspense, memo, useCallback, useMemo } from 'react';
import { useSimulationStore, disconnectWebSocket } from './state/store';
import { selectLoading, selectToasts } from './state/selectors';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import ToastContainer from './components/ui/Toast';
import OfflineIndicator from './components/ui/OfflineIndicator';
import { useDemoSimulation } from './hooks/useDemoSimulation';
import { useOffline } from './hooks/useOffline';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const DEFAULT_USER_ID = 'demo-user';

// Memoized header to prevent unnecessary re-renders
const MemoizedHeader = memo(Header);

// Memoized main content with stable selectors
const AppContent = memo(function AppContent() {
  // Use stable selectors to prevent re-renders
  const loading = useSimulationStore(selectLoading);
  const toasts = useSimulationStore(selectToasts);
  const initialize = useSimulationStore((s) => s.initialize);
  const setState = useSimulationStore((s) => s.setState);
  const state = useSimulationStore((s) => s.state);
  const removeToast = useSimulationStore((s) => s.removeToast);

  const [initialized, setInitialized] = useState(false);
  const { persistState, isOnline } = useOffline();

  // Enable demo simulation with realistic hormone responses
  useDemoSimulation();

  // Memoize persist callback
  const persistStateCallback = useCallback(() => {
    if (state) {
      persistState(state);
    }
  }, [state, persistState]);

  // Persist state when it changes (for offline recovery)
  useEffect(() => {
    persistStateCallback();
  }, [persistStateCallback]);

  // Memoize sync handler
  const handleSync = useCallback(() => {
    // Custom event handler for offline sync
  }, []);

  // Sync state when coming back online
  useEffect(() => {
    window.addEventListener('offline-sync', handleSync);
    return () => window.removeEventListener('offline-sync', handleSync);
  }, [handleSync]);

  // Memoize initialization
  const initializeApp = useCallback(async () => {
    if (!initialized) {
      await initialize(DEFAULT_USER_ID);
      setInitialized(true);
    }
  }, [initialize, initialized]);

  useEffect(() => {
    initializeApp();

    // Cleanup: disconnect WebSocket when component unmounts
    return () => {
      disconnectWebSocket();
    };
  }, [initializeApp]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <MemoizedHeader />
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<LoadingScreen />}>
          <Dashboard />
        </Suspense>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <OfflineIndicator />
    </div>
  );
});

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;

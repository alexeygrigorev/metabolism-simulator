// ============================================================================
// METABOLIC SIMULATOR - APP COMPONENT
// ============================================================================

import { useEffect, useState, Suspense } from 'react';
import { useSimulationStore, disconnectWebSocket } from './state/store';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import ToastContainer from './components/ui/Toast';
import { useDemoSimulation } from './hooks/useDemoSimulation';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const DEFAULT_USER_ID = 'demo-user';

function AppContent() {
  const { setState, connected, loading, initialize, toasts, removeToast } = useSimulationStore();
  const [initialized, setInitialized] = useState(false);

  // Enable demo simulation with realistic hormone responses
  useDemoSimulation();

  useEffect(() => {
    if (!initialized) {
      initialize(DEFAULT_USER_ID);
      setInitialized(true);
    }

    // Cleanup: disconnect WebSocket when component unmounts
    return () => {
      disconnectWebSocket();
    };
  }, [initialize, initialized]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<LoadingScreen />}>
          <Dashboard />
        </Suspense>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;

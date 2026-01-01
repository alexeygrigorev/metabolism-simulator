// ============================================================================
// METABOLIC SIMULATOR - DASHBOARD COMPONENT
// ============================================================================

import { useState } from 'react';
import { useSimulationStore } from '../../state/store';
import useScenarioStore from '../../state/scenarioStore';
import UserProfileCard from './UserProfileCard';
import HormonePanel from './HormonePanel';
import EnergyPanel from './EnergyPanel';
import MusclePanel from './MusclePanel';
import MacroTracker from './MacroTracker';
import SubstrateUtilization from './SubstrateUtilization';
import ActivityLog from './ActivityLog';
import HormoneTimeSeries from '../charts/HormoneTimeSeries';
import ActiveScenarioPanel from '../scenarios/ActiveScenarioPanel';
import ScenarioSelector from '../scenarios/ScenarioSelector';
import ActionButtons from './ActionButtons';

type ViewMode = 'dashboard' | 'scenarios';

export default function Dashboard() {
  const { state } = useSimulationStore();
  const { activeScenario } = useScenarioStore();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  if (!state) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No simulation state</p>
      </div>
    );
  }

  // Show scenario selector in scenarios mode
  if (viewMode === 'scenarios') {
    return (
      <div className="space-y-6">
        {/* View toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Educational Scenarios</h1>
          <button
            onClick={() => setViewMode('dashboard')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <ScenarioSelector />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active scenario panel (if scenario is active) */}
      {activeScenario && <ActiveScenarioPanel />}

      {/* Action buttons with scenario toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <ActionButtons />
        {!activeScenario && (
          <button
            onClick={() => setViewMode('scenarios')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center gap-2"
          >
            <span>📚</span>
            <span>Scenarios</span>
          </button>
        )}
      </div>

      {/* Top row - Profile + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UserProfileCard />
        <EnergyPanel />
        <MusclePanel />
        <MacroTracker />
      </div>

      {/* Hormone charts */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Hormonal Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <HormonePanel hormone="insulin" label="Insulin" color="#f59e0b" unit="µU/mL" />
          <HormonePanel hormone="glucagon" label="Glucagon" color="#22c55e" unit="pg/mL" />
          <HormonePanel hormone="cortisol" label="Cortisol" color="#a855f7" unit="mcg/dL" />
          <HormonePanel hormone="testosterone" label="Testosterone" color="#3b82f6" unit="nmol/L" />
          <HormonePanel hormone="growthHormone" label="Growth Hormone" color="#14b8a6" unit="ng/mL" />
          <HormonePanel hormone="igf1" label="IGF-1" color="#06b6d4" unit="ng/mL" />
          <HormonePanel hormone="epinephrine" label="Epinephrine" color="#ef4444" unit="pg/mL" />
          <HormonePanel hormone="leptin" label="Leptin" color="#f97316" unit="ng/mL" />
          <HormonePanel hormone="ghrelin" label="Ghrelin" color="#eab308" unit="pg/mL" />
        </div>
      </div>

      {/* Time Series Chart */}
      <HormoneTimeSeries />

      {/* Bottom row - Activity Log + Substrate Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActivityLog />
        <SubstrateUtilization />
      </div>
    </div>
  );
}

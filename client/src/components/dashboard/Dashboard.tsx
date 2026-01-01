// ============================================================================
// METABOLIC SIMULATOR - DASHBOARD COMPONENT
// ============================================================================

import { useState, memo } from 'react';
import { useSimulationStore } from '../../state/store';
import useScenarioStore from '../../state/scenarioStore';
import { Scenario } from '../../data/scenarios';
import UserProfileCard from './UserProfileCard';
import HormonePanel from './HormonePanel';
import EnergyPanel from './EnergyPanel';
import MusclePanel from './MusclePanel';
import MacroTracker from './MacroTracker';
import SubstrateUtilization from './SubstrateUtilization';
import ActivityLog from './ActivityLog';
import HormoneTimeSeries from '../charts/HormoneTimeSeries';
import HormoneInsights from './HormoneInsights';
import HormoneCorrelationMatrix from '../charts/HormoneCorrelationMatrix';
import DailyGoals from './DailyGoals';
import StatisticsPanel from './StatisticsPanel';
import ActiveScenarioPanel from '../scenarios/ActiveScenarioPanel';
import ScenarioSelector from '../scenarios/ScenarioSelector';
import ActionButtons from './ActionButtons';
import BloodGlucosePanel from './BloodGlucosePanel';
import WaterTracker from './WaterTracker';
import HealthMarkersPanel from './HealthMarkersPanel';
import RecommendationsPanel from './RecommendationsPanel';
import HormoneEducationHub from '../education/HormoneEducationHub';
import MetabolicInsightsDashboard from '../insights/MetabolicInsightsDashboard';
import HealthAlertsPanel from './HealthAlertsPanel';
import { ChartErrorBoundary } from '../charts/ChartErrorBoundary';
import { useHealthAlerts } from '../../hooks/useHealthAlerts';

type ViewMode = 'dashboard' | 'scenarios';

// Memoized header section with action buttons and alert badge
const DashboardHeader = memo(function DashboardHeader({
  activeScenario,
  onScenarioToggle,
  onEducationOpen,
  onInsightsOpen,
}: {
  activeScenario: Scenario | null;
  onScenarioToggle: () => void;
  onEducationOpen: () => void;
  onInsightsOpen: () => void;
}) {
  const { hasCriticalAlerts, hasWarningAlerts, alertCounts } = useHealthAlerts();

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <ActionButtons />
        {/* Alert indicator */}
        {alertCounts.total > 0 && (
          <button
            onClick={() => document.getElementById('health-alerts-panel')?.scrollIntoView({ behavior: 'smooth' })}
            className={`px-3 py-1.5 rounded-lg border transition-all hover:scale-105 ${
              hasCriticalAlerts
                ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                : hasWarningAlerts
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
            }`}
            title="View health alerts"
          >
            <span className="text-sm">🔔</span>
            <span className="font-semibold">{alertCounts.total}</span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onInsightsOpen}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors flex items-center gap-2"
          title="View personalized metabolic health insights"
        >
          <span>📊</span>
          <span className="hidden sm:inline">Insights</span>
        </button>
        <button
          onClick={onEducationOpen}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors flex items-center gap-2"
          title="Learn about hormones and how they affect your metabolism"
        >
          <span>🧬</span>
          <span className="hidden sm:inline">Education Hub</span>
        </button>
        {!activeScenario && (
          <button
            onClick={onScenarioToggle}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center gap-2"
          >
            <span>📚</span>
            <span>Scenarios</span>
          </button>
        )}
      </div>
    </div>
  );
});

// Memoized hormone panels grid
const HormoneGrid = memo(function HormoneGrid() {
  return (
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
  );
});

// Memoized profile and quick stats row
const ProfileStatsRow = memo(function ProfileStatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UserProfileCard />
      <EnergyPanel />
      <MusclePanel />
      <BloodGlucosePanel />
    </div>
  );
});

// Memoized activity section
const ActivitySection = memo(function ActivitySection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ActivityLog />
      <SubstrateUtilization />
    </div>
  );
});

// Memoized nutrition stats row
const NutritionStatsRow = memo(function NutritionStatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
      <MacroTracker />
    </div>
  );
});

// Memoized charts section with error boundaries
const ChartsSection = memo(function ChartsSection() {
  return (
    <>
      <ChartErrorBoundary chartName="Hormone Time Series">
        <HormoneTimeSeries />
      </ChartErrorBoundary>

      <ChartErrorBoundary chartName="Hormone Correlation Matrix">
        <HormoneCorrelationMatrix />
      </ChartErrorBoundary>
    </>
  );
});

function Dashboard() {
  const { state } = useSimulationStore();
  const { activeScenario } = useScenarioStore();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showEducationHub, setShowEducationHub] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

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
    <>
    <div className="space-y-6">
      {/* Active scenario panel (if scenario is active) */}
      {activeScenario && <ActiveScenarioPanel />}

      {/* Action buttons with scenario toggle */}
      <DashboardHeader
        activeScenario={activeScenario}
        onScenarioToggle={() => setViewMode('scenarios')}
        onEducationOpen={() => setShowEducationHub(true)}
        onInsightsOpen={() => setShowInsights(true)}
      />

      {/* Top row - Profile + Quick Stats */}
      <ProfileStatsRow />

      {/* Water Intake Tracker */}
      <WaterTracker />

      {/* Health Alerts - Real-time monitoring */}
      <div id="health-alerts-panel">
        <HealthAlertsPanel showEmpty={false} />
      </div>

      {/* Personalized Recommendations */}
      <RecommendationsPanel />

      {/* Nutrition stats - MacroTracker */}
      <NutritionStatsRow />

      {/* Health Markers - Comprehensive blood work and vitals */}
      <HealthMarkersPanel />

      {/* Hormone charts */}
      <HormoneGrid />

      {/* Time Series and Correlation Matrix charts with error boundaries */}
      <ChartsSection />

      {/* Bottom row - Activity Log + Substrate Utilization */}
      <ActivitySection />

      {/* Daily Goals */}
      <DailyGoals />

      {/* Statistics */}
      <StatisticsPanel />

      {/* Hormone Insights */}
      <HormoneInsights />
    </div>

    {/* Education Hub Modal */}
    {showEducationHub && (
      <HormoneEducationHub onClose={() => setShowEducationHub(false)} />
    )}

    {/* Metabolic Insights Modal */}
    {showInsights && (
      <MetabolicInsightsDashboard onClose={() => setShowInsights(false)} />
    )}
  </>
  );
}

export default memo(Dashboard);

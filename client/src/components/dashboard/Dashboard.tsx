// ============================================================================
// METABOLIC SIMULATOR - DASHBOARD COMPONENT
// ============================================================================

import { useState, memo, lazy, Suspense } from 'react';
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
import SupplementTracker from './SupplementTracker';
import StreaksPanel from './StreaksPanel';
import QuickActions from './QuickActions';
import ExerciseHistoryPanel from './ExerciseHistoryPanel';
import HealthMarkersPanel from './HealthMarkersPanel';
import MealTemplates from './MealTemplates';
import WorkoutTemplates from './WorkoutTemplates';
import MeasurementsTracker from './MeasurementsTracker';
import RecoveryDashboard from './RecoveryDashboard';
import UndoPanel from './UndoPanel';
import RecommendationsPanel from './RecommendationsPanel';
import HealthAlertsPanel from './HealthAlertsPanel';
import { ChartErrorBoundary } from '../charts/ChartErrorBoundary';
import { useHealthAlerts } from '../../hooks/useHealthAlerts';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Skeleton, ProfileCardSkeleton, HormonePanelSkeleton, ChartSkeleton, CardSkeleton } from '../ui/Skeleton';
import LazyLoad from '../ui/LazyLoad';

// Code splitting for heavy modal components - loaded only when needed
const ExerciseBuilder = lazy(() => import('./ExerciseBuilder'));
const HormoneEducationHub = lazy(() => import('../education/HormoneEducationHub'));
const MetabolicInsightsDashboard = lazy(() => import('../insights/MetabolicInsightsDashboard'));

// Loading fallback component
const ModalLoadingFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-white">Loading...</span>
    </div>
  </div>
);

// Error fallback for dashboard sections
const SectionErrorFallback = ({ sectionName, onReset }: { sectionName: string; onReset?: () => void }) => (
  <div className="bg-slate-800/50 rounded-lg border border-red-500/50 p-6">
    <div className="flex items-center gap-3 text-red-400 mb-2">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span className="font-medium">Unable to load {sectionName}</span>
    </div>
    <p className="text-sm text-slate-400 mb-3">This section encountered an error and could not be displayed.</p>
    {onReset && (
      <button
        onClick={onReset}
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);

// Error boundary wrapper for dashboard sections
const SectionBoundary = ({ children, sectionName }: { children: React.ReactNode; sectionName: string }) => (
  <ErrorBoundary
    fallback={<SectionErrorFallback sectionName={sectionName} />}
    onError={(error) => console.error(`Error in ${sectionName}:`, error)}
  >
    {children}
  </ErrorBoundary>
);

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
            aria-label={`View ${alertCounts.total} health alert${alertCounts.total !== 1 ? 's' : ''}`}
            className={`px-3 py-1.5 rounded-lg border transition-all hover:scale-105 ${
              hasCriticalAlerts
                ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                : hasWarningAlerts
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
            }`}
            title="View health alerts"
          >
            <span className="text-sm" aria-hidden="true">🔔</span>
            <span className="font-semibold">{alertCounts.total}</span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onInsightsOpen}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors flex items-center gap-2"
          title="View personalized metabolic health insights"
          aria-label="Open metabolic insights dashboard"
        >
          <span aria-hidden="true">📊</span>
          <span className="hidden sm:inline">Insights</span>
        </button>
        <button
          onClick={onEducationOpen}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors flex items-center gap-2"
          title="Learn about hormones and how they affect your metabolism"
          aria-label="Open hormone education hub"
        >
          <span aria-hidden="true">🧬</span>
          <span className="hidden sm:inline">Education Hub</span>
        </button>
        {!activeScenario && (
          <button
            onClick={onScenarioToggle}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center gap-2"
            aria-label="Browse scenarios"
          >
            <span aria-hidden="true">📚</span>
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

// Memoized exercise section with history and log button
const ExerciseSection = memo(function ExerciseSection({ onOpenExerciseBuilder }: { onOpenExerciseBuilder: () => void }) {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💪</span>
          <h2 className="text-lg font-semibold text-white">Workouts</h2>
        </div>
        <button
          onClick={onOpenExerciseBuilder}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Log Workout</span>
        </button>
      </div>
      <ExerciseHistoryPanel showEmpty={false} maxSessions={3} />
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
  const { state, loading } = useSimulationStore();
  const { activeScenario } = useScenarioStore();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showEducationHub, setShowEducationHub] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showExerciseBuilder, setShowExerciseBuilder] = useState(false);

  // Loading skeleton
  if (loading || !state) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Profile and quick stats skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
        </div>

        {/* Hormone panels skeletons */}
        <div>
          <Skeleton width={200} height={28} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <HormonePanelSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Chart skeletons */}
        <ChartSkeleton height={200} />
        <ChartSkeleton height={200} />

        {/* Activity section skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
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

      {/* Quick Actions - Favorite exercises and meals */}
      <SectionBoundary sectionName="Quick Actions">
        <QuickActions />
      </SectionBoundary>

      {/* Undo Panel - Recent actions with undo capability */}
      <SectionBoundary sectionName="Undo Panel">
        <LazyLoad rootMargin="1000px" threshold={0.01}>
          <UndoPanel />
        </LazyLoad>
      </SectionBoundary>

      {/* Supplement Tracker */}
      <SectionBoundary sectionName="Supplement Tracker">
        <SupplementTracker />
      </SectionBoundary>

      {/* Streaks Panel */}
      <SectionBoundary sectionName="Streaks">
        <StreaksPanel />
      </SectionBoundary>

      {/* Health Alerts - Real-time monitoring */}
      <div id="health-alerts-panel">
        <HealthAlertsPanel showEmpty={false} />
      </div>

      {/* Personalized Recommendations */}
      <RecommendationsPanel />

      {/* Nutrition stats - MacroTracker */}
      <NutritionStatsRow />

      {/* Meal Templates - Quick meal logging */}
      <SectionBoundary sectionName="Meal Templates">
        <MealTemplates />
      </SectionBoundary>

      {/* Health Markers - Comprehensive blood work and vitals */}
      <SectionBoundary sectionName="Health Markers">
        <HealthMarkersPanel />
      </SectionBoundary>

      {/* Hormone charts */}
      <HormoneGrid />

      {/* Time Series and Correlation Matrix charts with error boundaries - lazy load */}
      <LazyLoad rootMargin="2000px" threshold={0.01}>
        <ChartsSection />
      </LazyLoad>

      {/* Bottom row - Activity Log + Substrate Utilization - lazy load */}
      <LazyLoad rootMargin="2000px" threshold={0.01}>
        <ActivitySection />
      </LazyLoad>

      {/* Exercise section with workout history and log button - lazy load */}
      <LazyLoad rootMargin="2000px" threshold={0.01}>
        <ExerciseSection onOpenExerciseBuilder={() => setShowExerciseBuilder(true)} />
      </LazyLoad>

      {/* Workout Templates - Quick workout logging */}
      <SectionBoundary sectionName="Workout Templates">
        <WorkoutTemplates />
      </SectionBoundary>

      {/* Body Measurements Tracker */}
      <SectionBoundary sectionName="Body Measurements">
        <MeasurementsTracker />
      </SectionBoundary>

      {/* Recovery & Readiness Dashboard - lazy load */}
      <SectionBoundary sectionName="Recovery & Readiness">
        <LazyLoad rootMargin="2000px" threshold={0.01}>
          <RecoveryDashboard />
        </LazyLoad>
      </SectionBoundary>

      {/* Daily Goals - lazy load */}
      <LazyLoad rootMargin="2000px" threshold={0.01}>
        <DailyGoals />
      </LazyLoad>

      {/* Statistics - lazy load */}
      <SectionBoundary sectionName="Statistics & Trends">
        <LazyLoad rootMargin="2000px" threshold={0.01}>
          <StatisticsPanel />
        </LazyLoad>
      </SectionBoundary>

      {/* Hormone Insights - lazy load */}
      <LazyLoad rootMargin="2000px" threshold={0.01}>
        <HormoneInsights />
      </LazyLoad>
    </div>

    {/* Education Hub Modal - lazy loaded */}
    {showEducationHub && (
      <Suspense fallback={<ModalLoadingFallback />}>
        <HormoneEducationHub onClose={() => setShowEducationHub(false)} />
      </Suspense>
    )}

    {/* Metabolic Insights Modal - lazy loaded */}
    {showInsights && (
      <Suspense fallback={<ModalLoadingFallback />}>
        <MetabolicInsightsDashboard onClose={() => setShowInsights(false)} />
      </Suspense>
    )}

    {/* Exercise Builder Modal - lazy loaded */}
    {showExerciseBuilder && (
      <Suspense fallback={<ModalLoadingFallback />}>
        <ExerciseBuilder isOpen={showExerciseBuilder} onClose={() => setShowExerciseBuilder(false)} />
      </Suspense>
    )}
  </>
  );
}

export default memo(Dashboard);

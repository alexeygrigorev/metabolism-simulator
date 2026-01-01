// ============================================================================
// METABOLIC SIMULATOR - HORMONE EDUCATION HUB COMPONENT
// ============================================================================

import { useState, memo } from 'react';
import { HORMONE_EDUCATION, getHormoneStatus, type HormoneEducation } from '../../data/hormoneEducation';
import { useSimulationStore } from '../../state/store';
import type { SimulationState } from '@metabol-sim/shared';
import HormoneExplorer from './HormoneExplorer';
import HormoneSymptomChecker from './HormoneSymptomChecker';
import HormoneRelationshipMap from './HormoneRelationshipMap';

interface HormoneEducationHubProps {
  onClose: () => void;
}

type Tab = 'overview' | 'explorer' | 'symptoms' | 'relationships';

// Category icons and colors
const CATEGORY_CONFIG: Record<HormoneEducation['category'], { icon: string; color: string; bgClass: string }> = {
  storage: { icon: '📦', color: '#f59e0b', bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  mobilization: { icon: '⚡', color: '#22c55e', bgClass: 'bg-green-500/20 text-green-400 border-green-500/30' },
  anabolic: { icon: '💪', color: '#3b82f6', bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  catabolic: { icon: '🔥', color: '#ef4444', bgClass: 'bg-red-500/20 text-red-400 border-red-500/30' },
  appetite: { icon: '🍽️', color: '#f97316', bgClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  stress: { icon: '😰', color: '#a855f7', bgClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

// Quick stats card
const QuickStatCard = memo(function QuickStatCard({
  icon,
  label,
  value,
  subtext
}: {
  icon: string;
  label: string;
  value: string | number;
  subtext: string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-lg font-semibold text-white">{value}</div>
          <div className="text-xs text-slate-400">{subtext}</div>
        </div>
      </div>
    </div>
  );
});

// Overview tab content
const OverviewTab = memo(function OverviewTab() {
  const hormones = Object.values(HORMONE_EDUCATION);
  const categories = Array.from(new Set(hormones.map(h => h.category)));

  const categoryCount = categories.map(cat => ({
    category: cat as HormoneEducation['category'],
    count: hormones.filter(h => h.category === cat).length,
    config: CATEGORY_CONFIG[cat as HormoneEducation['category']]
  }));

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-500/30">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Hormone Education Hub</h2>
        <p className="text-slate-300">
          Explore how your hormones work together to regulate your metabolism. Learn about each hormone,
          understand the relationships between them, and discover how your lifestyle choices affect your hormonal balance.
        </p>
      </div>

      {/* Quick stats */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Your Current Hormonal Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickStatCard
            icon="📊"
            label="Total Hormones"
            value={hormones.length}
            subtext="tracked in simulation"
          />
          <QuickStatCard
            icon="✅"
            label="In Range"
            value={getCurrentOptimalCount()}
            subtext="within normal range"
          />
          <QuickStatCard
            icon="⬆️"
            label="Elevated"
            value={getCurrentHighCount()}
            subtext="above normal range"
          />
          <QuickStatCard
            icon="⬇️"
            label="Low"
            value={getCurrentLowCount()}
            subtext="below normal range"
          />
        </div>
      </div>

      {/* Category overview */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Hormone Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categoryCount.map(({ category, count, config }) => (
            <div
              key={category}
              className={`bg-slate-800/50 rounded-lg p-4 border ${config.bgClass} transition-all hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <div className="text-xs uppercase text-slate-500">{category}</div>
                  <div className="text-lg font-semibold text-white capitalize">{count} Hormones</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning tips */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <h3 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Did You Know?</span>
        </h3>
        <ul className="text-sm text-slate-300 space-y-2">
          <li>• Insulin and glucagon work together like a seesaw to regulate blood sugar</li>
          <li>• Growth hormone is primarily released during deep sleep, making quality rest essential</li>
          <li>• Cortisol and testosterone have an inverse relationship - more stress means less muscle growth</li>
          <li>• Leptin and ghrelin act as your body's appetite thermostat - signaling fullness vs hunger</li>
        </ul>
      </div>
    </div>
  );
});

// Helper functions to get current hormonal status counts
function getCurrentOptimalCount(): number {
  const store = useSimulationStore.getState();
  const state = store.state;
  if (!state) return 0;
  let count = 0;
  Object.entries(HORMONE_EDUCATION).forEach(([id, edu]) => {
    const hormoneKey = id as keyof SimulationState['hormones'];
    if (state.hormones[hormoneKey]) {
      const value = state.hormones[hormoneKey].currentValue;
      if (value >= edu.normalRange.min && value <= edu.normalRange.max) {
        count++;
      }
    }
  });
  return count;
}

function getCurrentHighCount(): number {
  const store = useSimulationStore.getState();
  const state = store.state;
  if (!state) return 0;
  let count = 0;
  Object.entries(HORMONE_EDUCATION).forEach(([id, edu]) => {
    const hormoneKey = id as keyof SimulationState['hormones'];
    if (state.hormones[hormoneKey]) {
      const value = state.hormones[hormoneKey].currentValue;
      if (value > edu.normalRange.max) {
        count++;
      }
    }
  });
  return count;
}

function getCurrentLowCount(): number {
  const store = useSimulationStore.getState();
  const state = store.state;
  if (!state) return 0;
  let count = 0;
  Object.entries(HORMONE_EDUCATION).forEach(([id, edu]) => {
    const hormoneKey = id as keyof SimulationState['hormones'];
    if (state.hormones[hormoneKey]) {
      const value = state.hormones[hormoneKey].currentValue;
      if (value < edu.normalRange.min) {
        count++;
      }
    }
  });
  return count;
}

// Tab button component
const TabButton = memo(function TabButton({
  isActive,
  onClick,
  icon,
  label
}: {
  isActive: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
});

// Main component
const HormoneEducationHub = memo(function HormoneEducationHub({ onClose }: HormoneEducationHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <h2 className="text-xl font-semibold text-white">Hormone Education Hub</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-700 overflow-x-auto">
          <TabButton
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon="📖"
            label="Overview"
          />
          <TabButton
            isActive={activeTab === 'explorer'}
            onClick={() => setActiveTab('explorer')}
            icon="🔍"
            label="Explorer"
          />
          <TabButton
            isActive={activeTab === 'symptoms'}
            onClick={() => setActiveTab('symptoms')}
            icon="🩺"
            label="Symptom Checker"
          />
          <TabButton
            isActive={activeTab === 'relationships'}
            onClick={() => setActiveTab('relationships')}
            icon="🔗"
            label="Relationships"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'explorer' && <HormoneExplorer />}
          {activeTab === 'symptoms' && <HormoneSymptomChecker />}
          {activeTab === 'relationships' && <HormoneRelationshipMap />}
        </div>
      </div>
    </div>
  );
});

export default HormoneEducationHub;

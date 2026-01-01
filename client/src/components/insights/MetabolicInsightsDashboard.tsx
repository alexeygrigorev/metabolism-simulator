// ============================================================================
// METABOLIC SIMULATOR - METABOLIC INSIGHTS DASHBOARD
// ============================================================================
// Comprehensive health insights integrating all simulation data

import { useState, memo } from 'react';
import { useMetabolicInsights } from '../../hooks/useMetabolicInsights';
import InsightCard from './InsightCard';
import MetabolicScoreCard from './MetabolicScoreCard';
import BiomarkerTrendsPanel from './BiomarkerTrendsPanel';
import LifestyleImpactPanel from './LifestyleImpactPanel';

type Tab = 'overview' | 'biomarkers' | 'lifestyle' | 'insights';

// Tab button component
const TabButton = memo(function TabButton({
  isActive,
  onClick,
  icon,
  label,
  count
}: {
  isActive: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          isActive ? 'bg-blue-500' : 'bg-slate-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
});

// Overview tab content
const OverviewTab = memo(function OverviewTab() {
  const { metabolicScore, insights } = useMetabolicInsights();

  const alertCount = insights.filter(i => i.type === 'alert' || i.type === 'warning').length;
  const successCount = insights.filter(i => i.type === 'success').length;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-6 border border-indigo-500/30">
        <h2 className="text-2xl font-bold text-white mb-2">Your Metabolic Health Insights</h2>
        <p className="text-slate-300">
          Personalized analysis of your hormonal balance, metabolic health, and lifestyle patterns.
          Understand how your daily choices affect your body.
        </p>
      </div>

      {/* Score cards row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <MetabolicScoreCard />
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-xs text-slate-500 mb-1">Hormonal</div>
          <div className="text-2xl font-bold text-white">{metabolicScore.categories.hormonal}</div>
          <div className="text-xs text-slate-400">/ 100</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-xs text-slate-500 mb-1">Metabolic</div>
          <div className="text-2xl font-bold text-white">{metabolicScore.categories.metabolic}</div>
          <div className="text-xs text-slate-400">/ 100</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-xs text-slate-500 mb-1">Recovery</div>
          <div className="text-2xl font-bold text-white">{metabolicScore.categories.recovery}</div>
          <div className="text-xs text-slate-400">/ 100</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alertCount > 0 && (
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="text-sm text-red-400 font-medium">Needs Attention</div>
                <div className="text-2xl font-bold text-white">{alertCount}</div>
                <div className="text-xs text-slate-400">item(s) require action</div>
              </div>
            </div>
          </div>
        )}

        {successCount > 0 && (
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <div className="text-sm text-green-400 font-medium">Going Well</div>
                <div className="text-2xl font-bold text-white">{successCount}</div>
                <div className="text-xs text-slate-400">positive indicator(s)</div>
              </div>
            </div>
          </div>
        )}

        <div className={`rounded-lg p-4 border ${
          metabolicScore.trend === 'improving'
            ? 'bg-green-900/20 border-green-500/30'
            : metabolicScore.trend === 'declining'
            ? 'bg-red-900/20 border-red-500/30'
            : 'bg-slate-800/50 border-slate-700'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {metabolicScore.trend === 'improving' ? '📈' : metabolicScore.trend === 'declining' ? '📉' : '➡️'}
            </span>
            <div>
              <div className="text-sm text-slate-400 font-medium">Overall Trend</div>
              <div className="text-lg font-bold text-white capitalize">{metabolicScore.trend}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top insights */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Key Insights</h3>
        <div className="grid grid-cols-1 gap-3">
          {insights.slice(0, 3).map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* Educational tip */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Understanding Your Score</span>
        </h4>
        <p className="text-sm text-slate-300">
          Your metabolic score reflects how well your body is functioning across key areas.
          Hormonal balance indicates proper endocrine function. Metabolic health shows
          how well your body processes energy. Recovery indicates your body's ability to
          repair and adapt.
        </p>
      </div>
    </div>
  );
});

// Main component
const MetabolicInsightsDashboard = memo(function MetabolicInsightsDashboard({
  onClose
}: {
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { insights } = useMetabolicInsights();

  const alertCount = insights.filter(i => i.type === 'alert' || i.type === 'warning').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h2 className="text-xl font-semibold text-white">Metabolic Insights</h2>
              <p className="text-xs text-slate-400">Personalized health analysis</p>
            </div>
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
            isActive={activeTab === 'biomarkers'}
            onClick={() => setActiveTab('biomarkers')}
            icon="🧬"
            label="Biomarkers"
          />
          <TabButton
            isActive={activeTab === 'lifestyle'}
            onClick={() => setActiveTab('lifestyle')}
            icon="🏃"
            label="Lifestyle"
          />
          <TabButton
            isActive={activeTab === 'insights'}
            onClick={() => setActiveTab('insights')}
            icon="💡"
            label="All Insights"
            count={insights.length}
          />
          {alertCount > 0 && (
            <button
              onClick={() => setActiveTab('insights')}
              className="ml-auto px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
            >
              {alertCount} Alert{alertCount > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'biomarkers' && <BiomarkerTrendsPanel />}
          {activeTab === 'lifestyle' && <LifestyleImpactPanel />}
          {activeTab === 'insights' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-3">All Insights</h3>
              {insights.length > 0 ? (
                insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No insights available at this time.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MetabolicInsightsDashboard;

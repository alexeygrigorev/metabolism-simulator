// ============================================================================
// METABOLIC SIMULATOR - HORMONE CORRELATION INSIGHTS PANEL
// ============================================================================

import { memo } from 'react';
import { useSimulationStore } from '../../state/store';

interface Correlation {
  from: string;
  to: string;
  relationship: 'positive' | 'negative' | 'complex';
  description: string;
  mechanism: string;
}

const HORMONE_CORRELATIONS: Correlation[] = [
  {
    from: 'Insulin',
    to: 'Glucagon',
    relationship: 'negative',
    description: 'Insulin and glucagon work in opposition',
    mechanism: 'When blood glucose rises, insulin is secreted and glucagon is suppressed. After meals, high insulin inhibits glucagon release.',
  },
  {
    from: 'Insulin',
    to: 'Testosterone',
    relationship: 'positive',
    description: 'Insulin supports testosterone production',
    mechanism: 'Insulin stimulates LH (luteinizing hormone) receptors in testes, enhancing testosterone synthesis. Very low insulin can reduce testosterone.',
  },
  {
    from: 'Cortisol',
    to: 'Testosterone',
    relationship: 'negative',
    description: 'Cortisol suppresses testosterone',
    mechanism: 'Chronic stress elevates cortisol, which inhibits the hypothalamic-pituitary-gonadal axis, reducing testosterone production.',
  },
  {
    from: 'Cortisol',
    to: 'Growth Hormone',
    relationship: 'negative',
    description: 'Cortisol inhibits growth hormone secretion',
    mechanism: 'High cortisol levels, especially during sleep deprivation, suppress GH release. This is why recovery is crucial.',
  },
  {
    from: 'Growth Hormone',
    to: 'IGF-1',
    relationship: 'positive',
    description: 'GH stimulates IGF-1 production',
    mechanism: 'Growth hormone signals the liver to produce IGF-1, which mediates most anabolic effects including muscle growth.',
  },
  {
    from: 'Insulin',
    to: 'IGF-1',
    relationship: 'positive',
    description: 'Insulin enhances IGF-1 activity',
    mechanism: 'Insulin and IGF-1 receptors share signaling pathways. Adequate insulin sensitivity improves IGF-1 effectiveness for muscle growth.',
  },
  {
    from: 'Leptin',
    to: 'Ghrelin',
    relationship: 'negative',
    description: 'Leptin suppresses ghrelin (hunger)',
    mechanism: 'Leptin signals energy sufficiency to the brain, reducing ghrelin production. Low body fat can mean low leptin and high hunger.',
  },
  {
    from: 'Epinephrine',
    to: 'Insulin',
    relationship: 'negative',
    description: 'Epinephrine inhibits insulin release',
    mechanism: 'During exercise or stress, epinephrine suppresses insulin to maintain blood glucose for immediate energy needs.',
  },
];

interface InsightCard {
  hormone: string;
  icon: string;
  color: string;
  description: string;
  influences: string[];
  affectedBy: string[];
}

const HORMONE_INSIGHTS: InsightCard[] = [
  {
    hormone: 'Insulin',
    icon: '🍬',
    color: '#f59e0b',
    description: 'The storage hormone that regulates blood glucose and nutrient uptake.',
    influences: ['Glucagon (suppresses)', 'Testosterone (supports)', 'IGF-1 (synergizes)'],
    affectedBy: ['Carbohydrate intake', 'Exercise intensity', 'Sleep quality'],
  },
  {
    hormone: 'Cortisol',
    icon: '😰',
    color: '#a855f7',
    description: 'The stress hormone that mobilizes energy but breaks down muscle.',
    influences: ['Testosterone (suppresses)', 'Growth Hormone (inhibits)', 'Immune function'],
    affectedBy: ['Stress levels', 'Sleep deprivation', 'Overtraining'],
  },
  {
    hormone: 'Testosterone',
    icon: '💪',
    color: '#3b82f6',
    description: 'The primary anabolic hormone for muscle growth and strength.',
    influences: ['Muscle protein synthesis', 'Bone density', 'Red blood cell production'],
    affectedBy: ['Sleep (7-9h optimal)', 'Resistance training', 'Body fat levels', 'Stress'],
  },
  {
    hormone: 'Growth Hormone',
    icon: '📈',
    color: '#14b8a6',
    description: 'Released during deep sleep, crucial for recovery and tissue repair.',
    influences: ['IGF-1 production', 'Fat metabolism', 'Collagen synthesis'],
    affectedBy: ['Deep sleep duration', 'High-intensity exercise', 'Fasting'],
  },
  {
    hormone: 'IGF-1',
    icon: '🔬',
    color: '#06b6d4',
    description: 'Mediates growth hormone effects, directly stimulates muscle growth.',
    influences: ['Muscle hypertrophy', 'Protein synthesis', 'Satellite cell activity'],
    affectedBy: ['GH levels', 'Protein intake', 'Insulin sensitivity'],
  },
  {
    hormone: 'Leptin',
    icon: '🛡️',
    color: '#f97316',
    description: 'Signals satiety and energy sufficiency to the brain.',
    influences: ['Appetite (suppresses)', 'Metabolic rate', 'Reproductive function'],
    affectedBy: ['Body fat levels', 'Sleep', 'Meal timing'],
  },
];

const HormoneInsights = memo(function HormoneInsights() {
  const { state } = useSimulationStore();

  if (!state) return null;

  // Get dominant hormones for highlighting
  const getDominantHormones = () => {
    const hormones = state.hormones;
    const entries = Object.entries(hormones).map(([name, data]) => ({
      name,
      value: data.currentValue,
      baseline: data.baseline,
      ratio: data.currentValue / data.baseline,
    }));
    return entries.sort((a, b) => b.ratio - a.ratio).slice(0, 3);
  };

  const dominantHormones = getDominantHormones();

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Hormone Correlations</h2>

      {/* Dominant Hormones */}
      <div className="mb-6 p-3 bg-slate-900/50 rounded-lg">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Currently Elevated</h3>
        <div className="flex flex-wrap gap-2">
          {dominantHormones.map((h) => (
            <span key={h.name} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
              {h.name} ({h.value.toFixed(1)})
            </span>
          ))}
        </div>
      </div>

      {/* Hormone Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {HORMONE_INSIGHTS.map((insight) => {
          const hormoneKey = insight.hormone.toLowerCase() as keyof typeof state.hormones;
          const currentValue = state.hormones[hormoneKey]?.currentValue || 0;
          const baseline = state.hormones[hormoneKey]?.baseline || 1;
          const percentOfBaseline = (currentValue / baseline) * 100;

          return (
            <div
              key={insight.hormone}
              className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/50"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{insight.hormone}</h4>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${insight.color}20`,
                        color: insight.color,
                      }}
                    >
                      {currentValue.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{insight.description}</p>
                  <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(200, percentOfBaseline / 2)}%`,
                        backgroundColor: insight.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Correlations */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Key Relationships</h3>
        <div className="space-y-2">
          {HORMONE_CORRELATIONS.map((corr, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-900/30 rounded-lg border-l-2"
              style={{
                borderColor: corr.relationship === 'positive' ? '#22c55e' : corr.relationship === 'negative' ? '#ef4444' : '#f59e0b',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-medium">{corr.from}</span>
                <span className={
                  corr.relationship === 'positive' ? 'text-green-400' :
                  corr.relationship === 'negative' ? 'text-red-400' :
                  'text-amber-400'
                }>
                  {corr.relationship === 'positive' ? '→' : corr.relationship === 'negative' ? '↔' : '⇄'}
                </span>
                <span className="text-white font-medium">{corr.to}</span>
              </div>
              <p className="text-xs text-slate-400">{corr.description}</p>
              <p className="text-xs text-slate-500 mt-1">💡 {corr.mechanism}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default HormoneInsights;

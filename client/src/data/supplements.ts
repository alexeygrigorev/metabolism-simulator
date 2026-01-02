// ============================================================================
// METABOLIC SIMULATOR - SUPPLEMENTS DATA
// ============================================================================

export type SupplementCategory =
  | 'vitamins'
  | 'minerals'
  | 'amino-acids'
  | 'herbs'
  | 'hormones'
  | 'performance'
  | 'general';

export type SupplementTiming = 'morning' | 'pre-workout' | 'intra-workout' | 'post-workout' | 'evening' | 'bedtime' | 'with-meal' | 'between-meals' | 'empty-stomach' | 'anytime';

export interface SupplementEffect {
  hormone: string;
  direction: 'increase' | 'decrease';
  magnitude: number; // 0-1 scale of effect strength
  delay: number; // hours before effect kicks in
  duration: number; // hours effect lasts
}

export interface SupplementInteraction {
  supplementId: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

export interface Supplement {
  id: string;
  name: string;
  commonNames: string[];
  category: SupplementCategory;
  icon: string;
  description: string;
  servingSize: string;
  recommendedTiming: SupplementTiming[];
  effects: SupplementEffect[];
  interactions: SupplementInteraction[];
  contraindications: string[];
  benefits: string[];
  dailyLimit?: number; // mg or other unit
  color: string; // For UI display
}

export const SUPPLEMENTS: Supplement[] = [
  // VITAMINS
  {
    id: 'vitamin-d3',
    name: 'Vitamin D3',
    commonNames: ['Cholecalciferol', 'Vitamin D'],
    category: 'vitamins',
    icon: '☀️',
    description: 'Fat-soluble vitamin crucial for hormone synthesis, bone health, and immune function.',
    servingSize: '1000-5000 IU',
    recommendedTiming: ['morning', 'with-meal'],
    effects: [
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.2, delay: 8, duration: 24 },
      { hormone: 'igf1', direction: 'increase', magnitude: 0.15, delay: 8, duration: 24 },
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.1, delay: 12, duration: 24 },
    ],
    interactions: [],
    contraindications: ['Hypercalcemia', 'Kidney disease', 'Sarcoidosis'],
    benefits: [
      'Supports testosterone production',
      'Improves insulin sensitivity',
      'Enhances mood and cognition',
      'Supports bone health',
    ],
    color: 'from-amber-500 to-orange-400',
  },
  {
    id: 'vitamin-k2',
    name: 'Vitamin K2 (MK-7)',
    commonNames: ['Menatetrenone', 'Menaquinone'],
    category: 'vitamins',
    icon: '🦴',
    description: 'Essential for calcium metabolism and cardiovascular health.',
    servingSize: '100-200 mcg',
    recommendedTiming: ['with-meal', 'evening'],
    effects: [
      { hormone: 'insulin', direction: 'decrease', magnitude: 0.1, delay: 4, duration: 12 },
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.05, delay: 6, duration: 12 },
    ],
    interactions: [
      {
        supplementId: 'warfarin',
        severity: 'severe',
        description: 'Vitamin K can reduce effectiveness of blood thinners.',
        recommendation: 'Consult doctor before combining with anticoagulants.',
      },
    ],
    contraindications: ['Blood clotting disorders', 'Warfarin use'],
    benefits: ['Supports bone density', 'Promotes cardiovascular health', 'Prevents arterial calcification'],
    color: 'from-green-500 to-emerald-400',
  },
  {
    id: 'b-complex',
    name: 'B-Complex',
    commonNames: ['B-Vitamins', 'Vitamin B Complex'],
    category: 'vitamins',
    icon: '🅱️',
    description: 'Water-soluble vitamins essential for energy metabolism and nervous system function.',
    servingSize: '1 capsule',
    recommendedTiming: ['morning', 'with-meal'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.15, delay: 2, duration: 8 },
      { hormone: 'epinephrine', direction: 'decrease', magnitude: 0.1, delay: 2, duration: 6 },
    ],
    interactions: [],
    contraindications: [],
    benefits: ['Reduces stress', 'Supports energy production', 'Improves mood'],
    color: 'from-yellow-500 to-amber-400',
  },

  // MINERALS
  {
    id: 'zinc',
    name: 'Zinc',
    commonNames: ['Zinc Picolinate', 'Zinc Citrate'],
    category: 'minerals',
    icon: '⚡',
    description: 'Essential mineral for testosterone production, immune function, and protein synthesis.',
    servingSize: '15-30 mg',
    recommendedTiming: ['evening', 'with-meal'],
    effects: [
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.25, delay: 4, duration: 24 },
      { hormone: 'igf1', direction: 'increase', magnitude: 0.15, delay: 6, duration: 24 },
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.1, delay: 4, duration: 12 },
    ],
    interactions: [
      {
        supplementId: 'copper',
        severity: 'moderate',
        description: 'Zinc can interfere with copper absorption.',
        recommendation: 'Maintain 10:1 zinc-to-copper ratio or take separately.',
      },
    ],
    contraindications: ['Copper deficiency'],
    benefits: [
      'Supports testosterone levels',
      'Improves recovery',
      'Boosts immune function',
      'Enhances protein synthesis',
    ],
    color: 'from-gray-400 to-slate-300',
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    commonNames: ['Magtein', 'Magnesium Glycinate', 'Mg'],
    category: 'minerals',
    icon: '🔷',
    description: 'Essential mineral for muscle relaxation, sleep quality, and stress management.',
    servingSize: '200-400 mg',
    recommendedTiming: ['evening', 'post-workout'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.2, delay: 1, duration: 8 },
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.1, delay: 8, duration: 24 },
      { hormone: 'igf1', direction: 'increase', magnitude: 0.1, delay: 6, duration: 12 },
    ],
    interactions: [],
    contraindications: ['Kidney disease', 'Severe hypotension'],
    benefits: [
      'Improves sleep quality',
      'Reduces muscle cramps',
      'Lowers stress',
      'Supports recovery',
    ],
    color: 'from-purple-400 to-violet-300',
  },
  {
    id: 'iron',
    name: 'Iron',
    commonNames: ['Ferrous Sulfate', 'Fe'],
    category: 'minerals',
    icon: '🔴',
    description: 'Essential for oxygen transport and energy metabolism.',
    servingSize: '18 mg',
    recommendedTiming: ['with-meal'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.1, delay: 12, duration: 48 },
      { hormone: 'growthHormone', direction: 'increase', magnitude: 0.05, delay: 24, duration: 48 },
    ],
    interactions: [
      {
        supplementId: 'calcium',
        severity: 'mild',
        description: 'Calcium can reduce iron absorption.',
        recommendation: 'Take at different times of day.',
      },
      {
        supplementId: 'vitamin-c',
        severity: 'mild',
        description: 'Vitamin C enhances iron absorption.',
        recommendation: 'Consider taking together for better absorption.',
      },
    ],
    contraindications: ['Hemochromatosis', 'Anemia of chronic disease'],
    benefits: ['Supports energy levels', 'Improves cognitive function', 'Supports immune system'],
    color: 'from-red-500 to-rose-400',
    dailyLimit: 45,
  },

  // AMINO ACIDS
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    commonNames: ['Creatine', 'CrM'],
    category: 'amino-acids',
    icon: '💪',
    description: 'Most researched ergogenic aid for strength and power output.',
    servingSize: '5 g',
    recommendedTiming: ['post-workout', 'anytime'],
    effects: [
      { hormone: 'igf1', direction: 'increase', magnitude: 0.2, delay: 2, duration: 12 },
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.05, delay: 24, duration: 48 },
    ],
    interactions: [],
    contraindications: ['Kidney disease'],
    benefits: [
      'Increases strength and power',
      'Enhances muscle fullness',
      'Improves cognitive function',
      'Supports cellular energy',
    ],
    color: 'from-blue-500 to-indigo-400',
  },
  {
    id: 'beta-alanine',
    name: 'Beta-Alanine',
    commonNames: ['β-Alanine', 'BA'],
    category: 'amino-acids',
    icon: '🏃',
    description: 'Increases muscle carnosine levels, delaying fatigue during high-intensity exercise.',
    servingSize: '2-5 g',
    recommendedTiming: ['pre-workout', 'anytime'],
    effects: [
      { hormone: 'growthHormone', direction: 'increase', magnitude: 0.1, delay: 0.5, duration: 3 },
    ],
    interactions: [],
    contraindications: [],
    benefits: [
      'Delays muscle fatigue',
      'Improves exercise capacity',
      'Increases training volume',
    ],
    color: 'from-pink-500 to-rose-400',
  },
  {
    id: 'eaas',
    name: 'EAAs (Essential Amino Acids)',
    commonNames: ['Amino Acids', 'EAA Blend'],
    category: 'amino-acids',
    icon: '🧬',
    description: 'Complete amino acid profile for muscle protein synthesis.',
    servingSize: '1 serving',
    recommendedTiming: ['post-workout', 'between-meals'],
    effects: [
      { hormone: 'igf1', direction: 'increase', magnitude: 0.15, delay: 1, duration: 4 },
      { hormone: 'insulin', direction: 'increase', magnitude: 0.2, delay: 0.5, duration: 2 },
    ],
    interactions: [],
    contraindications: ['Kidney disease'],
    benefits: [
      'Stimulates muscle protein synthesis',
      'Prevents muscle breakdown',
      'Supports recovery',
    ],
    color: 'from-cyan-500 to-blue-400',
  },
  {
    id: 'bcaa',
    name: 'BCAAs (Branched-Chain Amino Acids)',
    commonNames: ['Leucine, Isoleucine, Valine', 'Branched Chain'],
    category: 'amino-acids',
    icon: '🌿',
    description: 'Three essential amino acids that make up ~35% of muscle protein.',
    servingSize: '5-10 g',
    recommendedTiming: ['intra-workout', 'post-workout'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.15, delay: 0.5, duration: 3 },
      { hormone: 'insulin', direction: 'increase', magnitude: 0.15, delay: 0.5, duration: 2 },
    ],
    interactions: [],
    contraindications: ['ALS', 'Maple syrup urine disease'],
    benefits: [
      'Reduces exercise-induced cortisol',
      'Decreases muscle soreness',
      'Preserves muscle mass',
    ],
    color: 'from-green-400 to-teal-300',
  },

  // HERBS & ADAPTOGENS
  {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    commonNames: ['Withania somnifera', 'Indian Ginseng', 'Winter Cherry'],
    category: 'herbs',
    icon: '🌿',
    description: 'Adaptogenic herb used for stress reduction and vitality.',
    servingSize: '300-600 mg',
    recommendedTiming: ['evening', 'morning'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.3, delay: 2, duration: 12 },
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.2, delay: 24, duration: 72 },
    ],
    interactions: [],
    contraindications: ['Pregnancy', 'Breastfeeding', 'Thyroid disorders'],
    benefits: [
      'Significantly reduces cortisol',
      'Improves sleep quality',
      'May increase testosterone',
      'Reduces anxiety and stress',
    ],
    color: 'from-green-600 to-lime-500',
  },
  {
    id: 'rhodiola',
    name: 'Rhodiola Rosea',
    commonNames: ['Golden Root', 'Arctic Root', 'Roseroot'],
    category: 'herbs',
    icon: '🌸',
    description: 'Adaptogenic herb for mental performance and fatigue resistance.',
    servingSize: '200-400 mg',
    recommendedTiming: ['morning', 'pre-workout'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.15, delay: 0.5, duration: 6 },
      { hormone: 'epinephrine', direction: 'decrease', magnitude: 0.1, delay: 0.5, duration: 4 },
    ],
    interactions: [],
    contraindications: ['Bipolar disorder'],
    benefits: [
      'Reduces mental fatigue',
      'Improves exercise performance',
      'Enhances mood',
      'Increases energy',
    ],
    color: 'from-yellow-400 to-amber-300',
  },
  {
    id: 'maca',
    name: 'Maca Root',
    commonNames: ['Peruvian Ginseng', 'Lepidium meyenii'],
    category: 'herbs',
    icon: '🫛',
    description: 'Peruvian plant traditionally used for libido and energy.',
    servingSize: '1.5-3 g',
    recommendedTiming: ['morning', 'anytime'],
    effects: [
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.1, delay: 24, duration: 48 },
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.1, delay: 12, duration: 24 },
    ],
    interactions: [],
    contraindications: ['Hormone-sensitive conditions'],
    benefits: [
      'Supports healthy libido',
      'Improves energy levels',
      'May enhance fertility',
      'Balances mood',
    ],
    color: 'from-orange-400 to-red-300',
  },

  // PERFORMANCE
  {
    id: 'caffeine',
    name: 'Caffeine',
    commonNames: ['Coffee', 'Coffee Bean Extract'],
    category: 'performance',
    icon: '☕',
    description: 'Central nervous system stimulant for alertness and performance.',
    servingSize: '100-200 mg',
    recommendedTiming: ['pre-workout', 'morning'],
    effects: [
      { hormone: 'epinephrine', direction: 'increase', magnitude: 0.3, delay: 0.25, duration: 4 },
      { hormone: 'cortisol', direction: 'increase', magnitude: 0.15, delay: 0.5, duration: 4 },
      { hormone: 'insulin', direction: 'decrease', magnitude: 0.1, delay: 1, duration: 4 },
    ],
    interactions: [
      {
        supplementId: 'ashwagandha',
        severity: 'mild',
        description: 'Ashwagandha may counteract stimulant effects.',
        recommendation: 'Take at different times if using both.',
      },
    ],
    contraindications: ['Anxiety disorders', 'Heart conditions', 'Pregnancy'],
    benefits: [
      'Increases alertness',
      'Boosts exercise performance',
      'Enhances focus',
      'May increase metabolic rate',
    ],
    color: 'from-amber-700 to-yellow-600',
    dailyLimit: 400,
  },
  {
    id: 'l-carnitine',
    name: 'L-Carnitine',
    commonNames: ['Carnitine', 'ALCAR'],
    category: 'performance',
    icon: '🔋',
    description: 'Amino acid derivative that transports fatty acids for energy.',
    servingSize: '500-2000 mg',
    recommendedTiming: ['morning', 'pre-workout'],
    effects: [
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.1, delay: 8, duration: 24 },
      { hormone: 'growthHormone', direction: 'increase', magnitude: 0.05, delay: 2, duration: 4 },
    ],
    interactions: [],
    contraindications: ['Hypothyroidism'],
    benefits: [
      'Supports fat metabolism',
      'Improves recovery',
      'Enhances blood flow',
      'May increase testosterone',
    ],
    color: 'from-red-400 to-pink-300',
  },

  // HORMONE MODULATORS
  {
    id: 'd-aspartic-acid',
    name: 'D-Aspartic Acid',
    commonNames: ['DAA', 'D-Aspartate'],
    category: 'hormones',
    icon: '⚗️',
    description: 'Amino acid regulator of testosterone synthesis.',
    servingSize: '3 g',
    recommendedTiming: ['morning'],
    effects: [
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.15, delay: 6, duration: 24 },
      { hormone: 'lh', direction: 'increase', magnitude: 0.2, delay: 6, duration: 24 },
      { hormone: 'gh', direction: 'increase', magnitude: 0.1, delay: 6, duration: 12 },
    ],
    interactions: [],
    contraindications: ['Young adults (<18)', 'Existing hormonal conditions'],
    benefits: [
      'May increase testosterone',
      'Supports fertility',
      'Enhances libido',
    ],
    color: 'from-blue-600 to-indigo-500',
    dailyLimit: 3,
  },
  {
    id: 'fenugreek',
    name: 'Fenugreek',
    commonNames: ['Methi', 'Trigonella foenum-graecum'],
    category: 'hormones',
    icon: '🌱',
    description: 'Herb traditionally used to support male vitality.',
    servingSize: '300-600 mg',
    recommendedTiming: ['with-meal', 'anytime'],
    effects: [
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.1, delay: 12, duration: 24 },
      { hormone: 'insulin', direction: 'decrease', magnitude: 0.2, delay: 4, duration: 12 },
    ],
    interactions: [],
    contraindications: ['Pregnancy', 'Diabetes medication'],
    benefits: [
      'Supports healthy testosterone',
      'Improves insulin sensitivity',
      'Enhances libido',
      'May increase strength',
    ],
    color: 'from-yellow-600 to-amber-500',
  },

  // GENERAL HEALTH
  {
    id: 'omega-3',
    name: 'Omega-3 Fish Oil',
    commonNames: ['Fish Oil', 'EPA/DHA'],
    category: 'general',
    icon: '🐟',
    description: 'Essential fatty acids for inflammation and cognitive health.',
    servingSize: '1-3 g',
    recommendedTiming: ['with-meal', 'anytime'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.1, delay: 4, duration: 12 },
      { hormone: 'insulin', direction: 'decrease', magnitude: 0.15, delay: 8, duration: 24 },
      { hormone: 'testosterone', direction: 'increase', magnitude: 0.05, delay: 24, duration: 48 },
    ],
    interactions: [],
    contraindications: ['Blood thinning medication', 'Upcoming surgery'],
    benefits: [
      'Reduces inflammation',
      'Supports heart health',
      'Improves brain function',
      'May improve insulin sensitivity',
    ],
    color: 'from-sky-400 to-blue-300',
  },
  {
    id: 'probiotic',
    name: 'Probiotic',
    commonNames: ['Gut bacteria', 'Fermented foods'],
    category: 'general',
    icon: '🦠',
    description: 'Beneficial bacteria for gut health and immune function.',
    servingSize: '1-10 billion CFU',
    recommendedTiming: ['morning', 'empty-stomach'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.1, delay: 48, duration: 168 },
      { hormone: 'ghrelin', direction: 'decrease', magnitude: 0.1, delay: 48, duration: 168 },
    ],
    interactions: [],
    contraindications: ['Severely immunocompromised'],
    benefits: [
      'Supports gut health',
      'Improves digestion',
      'Enhances immune function',
      'May improve mood',
    ],
    color: 'from-emerald-400 to-green-300',
  },
  {
    id: 'curcumin',
    name: 'Curcumin (Turmeric)',
    commonNames: ['Turmeric', 'Curcuma longa'],
    category: 'general',
    icon: '🟡',
    description: 'Powerful anti-inflammatory compound from turmeric.',
    servingSize: '500-1000 mg',
    recommendedTiming: ['with-meal', 'post-workout'],
    effects: [
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.15, delay: 2, duration: 8 },
      { hormone: 'insulin', direction: 'decrease', magnitude: 0.1, delay: 4, duration: 12 },
    ],
    interactions: [
      {
        supplementId: 'iron',
        severity: 'mild',
        description: 'Curcumin may reduce iron absorption.',
        recommendation: 'Take at different times if iron deficient.',
      },
    ],
    contraindications: ['Gallstones', 'Bile duct obstruction'],
    benefits: [
      'Powerful anti-inflammatory',
      'Reduces joint pain',
      'May improve insulin sensitivity',
      'Supports recovery',
    ],
    color: 'from-yellow-500 to-orange-400',
  },
  {
    id: 'melatonin',
    name: 'Melatonin',
    commonNames: ['Sleep hormone', 'N-acetyl-5-methoxytryptamine'],
    category: 'general',
    icon: '🌙',
    description: 'Hormone that regulates sleep-wake cycles.',
    servingSize: '0.5-5 mg',
    recommendedTiming: ['evening', 'bedtime'],
    effects: [
      { hormone: 'growthHormone', direction: 'increase', magnitude: 0.15, delay: 1, duration: 8 },
      { hormone: 'cortisol', direction: 'decrease', magnitude: 0.1, delay: 2, duration: 8 },
      { hormone: 'leptin', direction: 'increase', magnitude: 0.05, delay: 4, duration: 12 },
    ],
    interactions: [],
    contraindications: ['Autoimmune conditions', 'Depression', 'Pregnancy'],
    benefits: [
      'Improves sleep quality',
      'Powerful antioxidant',
      'Supports GH production',
      'May help with fat loss',
    ],
    color: 'from-indigo-500 to-violet-400',
  },
];

export const SUPPLEMENT_CATEGORIES = [
  { id: 'all', name: 'All Supplements', icon: '💊' },
  { id: 'vitamins', name: 'Vitamins', icon: '☀️' },
  { id: 'minerals', name: 'Minerals', icon: '💎' },
  { id: 'amino-acids', name: 'Amino Acids', icon: '🧬' },
  { id: 'herbs', name: 'Herbs & Adaptogens', icon: '🌿' },
  { id: 'hormones', name: 'Hormone Support', icon: '⚖️' },
  { id: 'performance', name: 'Performance', icon: '⚡' },
  { id: 'general', name: 'General Health', icon: '🌟' },
];

export const TIMING_OPTIONS = [
  { id: 'morning', name: 'Morning', icon: '🌅', time: '7:00 AM' },
  { id: 'pre-workout', name: 'Pre-Workout', icon: '🏋️', time: '30 min before' },
  { id: 'post-workout', name: 'Post-Workout', icon: '💪', time: 'After exercise' },
  { id: 'evening', name: 'Evening', icon: '🌆', time: '7:00 PM' },
  { id: 'with-meal', name: 'With Meal', icon: '🍽️', time: 'With food' },
  { id: 'anytime', name: 'Anytime', icon: '⏰', time: 'No specific timing' },
];

export function getSupplementById(id: string): Supplement | undefined {
  return SUPPLEMENTS.find(s => s.id === id);
}

export function getSupplementsByCategory(category: SupplementCategory): Supplement[] {
  if (category === 'all') return SUPPLEMENTS;
  return SUPPLEMENTS.filter(s => s.category === category);
}

export function getSupplementInteractions(supplementId: string): Supplement[] {
  const supplement = getSupplementById(supplementId);
  if (!supplement) return [];

  return supplement.interactions
    .map(interaction => getSupplementById(interaction.supplementId))
    .filter((s): s is Supplement => s !== undefined);
}

export function getSupplementsByEffect(hormone: string, direction: 'increase' | 'decrease'): Supplement[] {
  return SUPPLEMENTS.filter(supplement =>
    supplement.effects.some(effect => effect.hormone === hormone && effect.direction === direction)
  );
}

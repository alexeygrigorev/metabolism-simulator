// ============================================================================
// METABOLIC SIMULATOR - HORMONE EDUCATIONAL DATA
// ============================================================================

export interface HormoneEducation {
  id: string;
  name: string;
  abbreviation: string;
  category: 'storage' | 'mobilization' | 'anabolic' | 'catabolic' | 'appetite' | 'stress';
  unit: string;
  normalRange: { min: number; max: number };
  description: string;
  function: string;
  factorsThatIncrease: string[];
  factorsThatDecrease: string[];
  symptomsOfHigh: string[];
  symptomsOfLow: string[];
  optimalFor: string[];
  timeToPeak: string;
  halfLife: string;
  relatedHormones: { hormone: string; relationship: 'synergistic' | 'antagonistic' | 'permissive'; description: string }[];
}

export const HORMONE_EDUCATION: Record<string, HormoneEducation> = {
  insulin: {
    id: 'insulin',
    name: 'Insulin',
    abbreviation: 'INS',
    category: 'storage',
    unit: 'µU/mL',
    normalRange: { min: 2, max: 20 },
    description: 'The primary storage hormone that regulates blood glucose and nutrient uptake into cells.',
    function: 'Promotes glucose uptake in muscle and fat cells, stimulates protein synthesis, inhibits protein breakdown, and promotes fat storage.',
    factorsThatIncrease: [
      'Carbohydrate intake (especially high-glycemic)',
      'Protein intake (leucine stimulates insulin)',
      'Post-exercise window',
      'Stress (cortisol-mediated)',
      'Certain medications'
    ],
    factorsThatDecrease: [
      'Fasting',
      'Low-carbohydrate diet',
      'Exercise (during activity)',
      'Intermittent fasting',
      'Insulin sensitivity improvements'
    ],
    symptomsOfHigh: [
      'Fat storage (especially visceral)',
      'Inhibited fat burning',
      'Low blood sugar (hypoglycemia)',
      'Insulin resistance over time',
      'Increased inflammation'
    ],
    symptomsOfLow: [
      'High blood sugar (hyperglycemia)',
      'Muscle breakdown (catabolism)',
      'Poor nutrient partitioning',
      'Difficulty building muscle',
      'Increased ketone production'
    ],
    optimalFor: [
      'Post-workout recovery',
      'Muscle protein synthesis',
      'Glycogen replenishment',
      'Anabolic environment'
    ],
    timeToPeak: '30-60 minutes post-meal',
    halfLife: '4-6 minutes',
    relatedHormones: [
      { hormone: 'glucagon', relationship: 'antagonistic', description: 'Insulin lowers blood glucose while glucagon raises it' },
      { hormone: 'testosterone', relationship: 'synergistic', description: 'Insulin enhances testosterone production at the testes' },
      { hormone: 'cortisol', relationship: 'antagonistic', description: 'Cortisol can induce insulin resistance' },
      { hormone: 'IGF-1', relationship: 'synergistic', description: 'Both support anabolic processes' }
    ]
  },

  glucagon: {
    id: 'glucagon',
    name: 'Glucagon',
    abbreviation: 'GGN',
    category: 'mobilization',
    unit: 'pg/mL',
    normalRange: { min: 20, max: 100 },
    description: 'The primary mobilization hormone that raises blood glucose levels.',
    function: 'Stimulates the liver to convert stored glycogen into glucose, promotes gluconeogenesis (creating glucose from amino acids), and stimulates fat burning.',
    factorsThatIncrease: [
      'Fasting',
      'Low blood sugar',
      'High-protein/low-carb meals',
      'Exercise',
      'Stress'
    ],
    factorsThatDecrease: [
      'Carbohydrate intake',
      'High insulin levels',
      'Post-meal state',
      'Sedentary behavior'
    ],
    symptomsOfHigh: [
      'Elevated blood sugar (if diabetic)',
      'Increased fat burning',
      'Ketone production',
      'Potential muscle breakdown'
    ],
    symptomsOfLow: [
      'Difficulty maintaining blood sugar during fasting',
      'Reduced fat mobilization',
      'Hypoglycemia risk',
      'Low energy during fasting'
    ],
    optimalFor: [
      'Fat adaptation',
      'Fasted exercise',
      'Ketogenesis',
      'Maintaining energy during fasting'
    ],
    timeToPeak: '15-30 minutes',
    halfLife: '6-8 minutes',
    relatedHormones: [
      { hormone: 'insulin', relationship: 'antagonistic', description: 'Opposing actions on blood glucose' },
      { hormone: 'epinephrine', relationship: 'synergistic', description: 'Both raise blood glucose' },
      { hormone: 'cortisol', relationship: 'synergistic', description: 'Both mobilize energy' }
    ]
  },

  cortisol: {
    id: 'cortisol',
    name: 'Cortisol',
    abbreviation: 'CORT',
    category: 'catabolic',
    unit: 'mcg/dL',
    normalRange: { min: 5, max: 25 },
    description: 'The primary stress hormone that mobilizes energy but breaks down muscle tissue.',
    function: 'Promotes gluconeogenesis, breaks down protein into amino acids, mobilizes fat stores, and suppresses immune response.',
    factorsThatIncrease: [
      'Physical or psychological stress',
      'Intense/long exercise',
      'Sleep deprivation',
      'Caloric deficit',
      'Caffeine excess'
    ],
    factorsThatDecrease: [
      'Adequate sleep (7-9 hours)',
      'Stress management (meditation)',
      'Moderate exercise',
      'Adequate calorie intake',
      'Social connection'
    ],
    symptomsOfHigh: [
      'Muscle breakdown',
      'Fat gain (especially abdominal)',
      'Insulin resistance',
      'Suppressed immune function',
      'Sleep disruption'
    ],
    symptomsOfLow: [
      'Fatigue',
      'Low blood pressure',
      'Poor stress response',
      'Inflammation',
      'Electrolyte imbalances'
    ],
    optimalFor: [
      'Morning awakening (cortisol awakening response)',
      'Acute stress adaptation',
      'Mobilizing energy during exercise'
    ],
    timeToPeak: '20-30 minutes after stressor',
    halfLife: '60-90 minutes',
    relatedHormones: [
      { hormone: 'testosterone', relationship: 'antagonistic', description: 'Cortisol suppresses testosterone' },
      { hormone: 'growthHormone', relationship: 'antagonistic', description: 'Cortisol inhibits GH release' },
      { hormone: 'insulin', relationship: 'antagonistic', description: 'Cortisol causes insulin resistance' }
    ]
  },

  testosterone: {
    id: 'testosterone',
    name: 'Testosterone',
    abbreviation: 'T',
    category: 'anabolic',
    unit: 'nmol/L',
    normalRange: { min: 10, max: 35 },
    description: 'The primary anabolic hormone for muscle growth, strength, and male characteristics.',
    function: 'Stimulates muscle protein synthesis, inhibits protein breakdown, promotes bone density, supports red blood cell production, and enhances libido.',
    factorsThatIncrease: [
      'Resistance training',
      'Adequate sleep (7-9 hours)',
      'Healthy fat intake',
      'Zinc and vitamin D',
      'Moderate carbohydrate intake'
    ],
    factorsThatDecrease: [
      'Chronic stress (high cortisol)',
      'Sleep deprivation',
      'Alcohol consumption',
      'Obesity',
      'Certain medications'
    ],
    symptomsOfHigh: [
      'Increased muscle mass',
      'Improved strength',
      'Higher libido',
      'Better mood',
      'Increased confidence'
    ],
    symptomsOfLow: [
      'Difficulty building muscle',
      'Increased body fat',
      'Low libido',
      'Fatigue',
      'Depressed mood'
    ],
    optimalFor: [
      'Muscle hypertrophy',
      'Strength gains',
      'Recovery from training',
      'Body composition improvement'
    ],
    timeToPeak: '24-48 hours post-exercise',
    halfLife: 'Variable (minutes to hours)',
    relatedHormones: [
      { hormone: 'cortisol', relationship: 'antagonistic', description: 'Stress suppresses testosterone' },
      { hormone: 'growthHormone', relationship: 'synergistic', description: 'Both support anabolism' },
      { hormone: 'IGF-1', relationship: 'synergistic', description: 'Mediated by testosterone' }
    ]
  },

  growthHormone: {
    id: 'growthHormone',
    name: 'Growth Hormone',
    abbreviation: 'GH',
    category: 'anabolic',
    unit: 'ng/mL',
    normalRange: { min: 0.5, max: 5 },
    description: 'Released during deep sleep, crucial for recovery, tissue repair, and fat metabolism.',
    function: 'Stimulates protein synthesis, promotes lipolysis (fat burning), supports collagen synthesis, enhances immune function, and aids tissue repair.',
    factorsThatIncrease: [
      'Deep sleep (especially REM)',
      'High-intensity exercise',
      'Fasting',
      'Protein intake',
      'Certain amino acids (arginine)'
    ],
    factorsThatDecrease: [
      'Sleep deprivation',
      'High blood sugar',
      'Obesity',
      'Aging',
      'High somatostatin levels'
    ],
    symptomsOfHigh: [
      'Improved recovery',
      'Reduced body fat',
      'Better skin tone',
      'Improved sleep quality'
    ],
    symptomsOfLow: [
      'Poor recovery',
      'Difficulty losing fat',
      'Reduced muscle mass',
      'Poor sleep quality',
      'Accelerated aging'
    ],
    optimalFor: [
      'Overnight recovery',
      'Fat burning during sleep',
      'Tissue repair',
      'Anti-aging effects'
    ],
    timeToPeak: '90 minutes after sleep onset',
    halfLife: '15-30 minutes (pulsatile release)',
    relatedHormones: [
      { hormone: 'IGF-1', relationship: 'synergistic', description: 'GH stimulates IGF-1 production' },
      { hormone: 'cortisol', relationship: 'antagonistic', description: 'Stress inhibits GH release' },
      { hormone: 'insulin', relationship: 'synergistic', description: 'Both support anabolism post-meal' }
    ]
  },

  igf1: {
    id: 'igf1',
    name: 'IGF-1',
    abbreviation: 'IGF-1',
    category: 'anabolic',
    unit: 'ng/mL',
    normalRange: { min: 100, max: 300 },
    description: 'Mediates most of the anabolic effects of growth hormone, directly stimulates muscle growth.',
    function: 'Directly stimulates muscle protein synthesis, promotes cell growth and division, supports bone growth, and enhances recovery.',
    factorsThatIncrease: [
      'Growth hormone levels',
      'Adequate protein intake',
      'Resistance training',
      'Good sleep',
      'Healthy body fat levels'
    ],
    factorsThatDecrease: [
      'GH deficiency',
      'Malnutrition',
      'Chronic disease',
      'Liver dysfunction',
      'Advanced age'
    ],
    symptomsOfHigh: [
      'Muscle growth',
      'Organ enlargement (if excessive)',
      'Hypoglycemia risk'
    ],
    symptomsOfLow: [
      'Reduced muscle mass',
      'Poor growth',
      'Weak bones',
      'Delayed recovery'
    ],
    optimalFor: [
      'Muscle hypertrophy',
      'Recovery from injury',
      'Bone density maintenance',
      'Long-term adaptation'
    ],
    timeToPeak: '20-30 minutes after GH pulse',
    halfLife: '12-15 hours',
    relatedHormones: [
      { hormone: 'growthHormone', relationship: 'synergistic', description: 'GH stimulates IGF-1 production' },
      { hormone: 'insulin', relationship: 'synergistic', description: 'Shared signaling pathways' },
      { hormone: 'testosterone', relationship: 'synergistic', description: 'Both support muscle growth' }
    ]
  },

  epinephrine: {
    id: 'epinephrine',
    name: 'Epinephrine (Adrenaline)',
    abbreviation: 'EPI',
    category: 'mobilization',
    unit: 'pg/mL',
    normalRange: { min: 10, max: 100 },
    description: 'The fight-or-flight hormone that provides quick energy for immediate action.',
    function: 'Increases heart rate, dilates airways, mobilizes glucose from glycogen, inhibits insulin, and increases blood flow to muscles.',
    factorsThatIncrease: [
      'Acute stress',
      'Exercise intensity',
      'Caffeine',
      'Hypoglycemia',
      'Cold exposure'
    ],
    factorsThatDecrease: [
      'Rest',
      'Meditation',
      'Deep breathing',
      'Post-exercise recovery',
      'Adaptation to stressors'
    ],
    symptomsOfHigh: [
      'Rapid heartbeat',
      'Anxiety/jitters',
      'Increased alertness',
      'Sweating',
      'Increased blood pressure'
    ],
    symptomsOfLow: [
      'Fatigue',
      'Poor stress response',
      'Difficulty mobilizing energy'
    ],
    optimalFor: [
      'Exercise performance',
      'Quick reaction times',
      'Emergency responses',
      'HIIT workouts'
    ],
    timeToPeak: 'Immediate (seconds)',
    halfLife: '2-3 minutes',
    relatedHormones: [
      { hormone: 'insulin', relationship: 'antagonistic', description: 'Suppresses insulin during stress' },
      { hormone: 'glucagon', relationship: 'synergistic', description: 'Both raise blood glucose' },
      { hormone: 'cortisol', relationship: 'synergistic', description: 'Both respond to stress' }
    ]
  },

  leptin: {
    id: 'leptin',
    name: 'Leptin',
    abbreviation: 'LEP',
    category: 'appetite',
    unit: 'ng/mL',
    normalRange: { min: 5, max: 25 },
    description: 'The satiety hormone that signals energy sufficiency to the brain.',
    function: 'Suppresses appetite, increases energy expenditure, regulates reproductive function, and modulates immune response.',
    factorsThatIncrease: [
      'High body fat stores',
      'Post-meal state',
      'Insulin elevation',
      'Estrogen',
      'Good sleep'
    ],
    factorsThatDecrease: [
      'Weight loss',
      'Sleep deprivation',
      'High fructose intake',
      'Chronic inflammation',
      'Low body fat'
    ],
    symptomsOfHigh: [
      'Reduced appetite',
      'Increased metabolism',
      'Reproductive function'
    ],
    symptomsOfLow: [
      'Increased hunger',
      'Reduced metabolism',
      'Weight gain tendency',
      'Reproductive issues'
    ],
    optimalFor: [
      'Appetite regulation',
      'Weight maintenance',
      'Metabolic health',
      'Reproductive health'
    ],
    timeToPeak: 'Hours after meal',
    halfLife: '30-60 minutes',
    relatedHormones: [
      { hormone: 'ghrelin', relationship: 'antagonistic', description: 'Leptin suppresses ghrelin' },
      { hormone: 'insulin', relationship: 'synergistic', description: 'Both signal satiety' }
    ]
  },

  ghrelin: {
    id: 'ghrelin',
    name: 'Ghrelin',
    abbreviation: 'GHR',
    category: 'appetite',
    unit: 'pg/mL',
    normalRange: { min: 50, max: 200 },
    description: 'The hunger hormone that stimulates appetite and fat storage.',
    function: 'Stimulates appetite, promotes fat storage, increases gastric motility, and modulates reward pathways for food.',
    factorsThatIncrease: [
      'Fasting',
      'Low blood sugar',
      'Sleep deprivation',
      'Weight loss',
      'High protein meals'
    ],
    factorsThatDecrease: [
      'Food intake (especially carbs)',
      'Leptin',
      'Insulin',
      'Good sleep',
      'High body fat'
    ],
    symptomsOfHigh: [
      'Increased hunger',
      'Fat storage tendency',
      'Gastric emptying',
      'Food cravings'
    ],
    symptomsOfLow: [
      'Reduced appetite',
      'Potential weight loss',
      'Reduced gastric motility'
    ],
    optimalFor: [
      'Meal timing signals',
      'Preparation for food intake',
      'Energy seeking behavior'
    ],
    timeToPeak: 'Just before meals',
    halfLife: '30-60 minutes',
    relatedHormones: [
      { hormone: 'leptin', relationship: 'antagonistic', description: 'Opposite effects on appetite' },
      { hormone: 'insulin', relationship: 'antagonistic', description: 'Insulin suppresses ghrelin' },
      { hormone: 'growthHormone', relationship: 'synergistic', description: 'Ghrelin stimulates GH' }
    ]
  }
};

export function getHormoneEducation(hormoneId: string): HormoneEducation | undefined {
  return HORMONE_EDUCATION[hormoneId];
}

export function getHormoneStatus(value: number, hormoneId: string): 'low' | 'optimal' | 'high' {
  const edu = HORMONE_EDUCATION[hormoneId];
  if (!edu) return 'optimal';

  if (value < edu.normalRange.min) return 'low';
  if (value > edu.normalRange.max) return 'high';
  return 'optimal';
}

export function getHormoneRelationships(hormoneId: string): typeof HORMONE_EDUCATION[keyof typeof HORMONE_EDUCATION]['relatedHormones'] {
  const edu = HORMONE_EDUCATION[hormoneId];
  return edu?.relatedHormones || [];
}

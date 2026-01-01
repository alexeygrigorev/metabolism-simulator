// ============================================================================
// METABOLIC SIMULATOR - EDUCATIONAL SCENARIOS
// ============================================================================

export interface ScenarioObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export interface ScenarioPhase {
  id: string;
  name: string;
  description: string;
  objectives: ScenarioObjective[];
  duration?: number; // in game hours
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: string;
  phases: ScenarioPhase[];
  educationalContent: {
    title: string;
    body: string;
    keyPoints: string[];
  };
  initialConditions?: {
    stress?: number;
    sleepDebt?: number;
    muscleDamage?: number;
  };
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'newbie-gains',
    name: "The Newbie Gains",
    description: "Experience the rapid muscle growth that occurs during the first 3 months of resistance training. Learn about mTOR activation, protein synthesis, and hormonal responses.",
    category: 'beginner',
    difficulty: 1,
    estimatedTime: '10 min',
    phases: [
      {
        id: 'phase-1',
        name: 'First Workout',
        description: 'Complete your first resistance training session and observe the hormonal response.',
        objectives: [
          { id: 'obj-1', description: 'Log a resistance exercise', target: 1, current: 0, unit: 'exercise', completed: false },
          { id: 'obj-2', description: 'Observe testosterone increase', target: 15, current: 0, unit: '%', completed: false },
        ],
      },
      {
        id: 'phase-2',
        name: 'Post-Workout Nutrition',
        description: 'Consume protein after training to maximize muscle protein synthesis.',
        objectives: [
          { id: 'obj-3', description: 'Log a high-protein meal', target: 30, current: 0, unit: 'g protein', completed: false },
          { id: 'obj-4', description: 'Keep insulin elevated', target: 10, current: 0, unit: 'above baseline', completed: false },
        ],
      },
      {
        id: 'phase-3',
        name: 'Recovery',
        description: 'Allow adequate recovery for muscle growth.',
        objectives: [
          { id: 'obj-5', description: 'Log 8 hours of sleep', target: 1, current: 0, unit: 'night', completed: false },
          { id: 'obj-6', description: 'Reduce cortisol to baseline', target: 10, current: 0, unit: 'level', completed: false },
        ],
      },
    ],
    educationalContent: {
      title: 'Understanding Newbie Gains',
      body: 'Newbie gains refer to the rapid muscle and strength increase that beginners experience. This occurs due to improved neural recruitment, increased anabolic hormone sensitivity, and enhanced protein synthesis rates.',
      keyPoints: [
        'mTOR activation is the key regulator of muscle protein synthesis',
        'Testosterone levels can increase 20-30% after resistance exercise',
        'The "anabolic window" lasts 2-4 hours post-workout',
        'Sleep is when most muscle repair and growth occurs',
      ],
    },
  },
  {
    id: 'insulin-spike',
    name: "The Insulin Spike",
    description: "Explore how different meals affect insulin levels and learn about glycemic load, insulin sensitivity, and metabolic health.",
    category: 'beginner',
    difficulty: 2,
    estimatedTime: '8 min',
    phases: [
      {
        id: 'phase-1',
        name: 'High GI Meal',
        description: 'Log a high-glycemic meal and observe the insulin response.',
        objectives: [
          { id: 'obj-1', description: 'Log a high-carb meal', target: 50, current: 0, unit: 'g carbs', completed: false },
          { id: 'obj-2', description: 'Observe insulin spike', target: 200, current: 0, unit: '% increase', completed: false },
        ],
      },
      {
        id: 'phase-2',
        name: 'Protein + Fat',
        description: 'Compare with a meal containing protein and healthy fats.',
        objectives: [
          { id: 'obj-3', description: 'Log a balanced meal', target: 25, current: 0, unit: 'g protein', completed: false },
          { id: 'obj-4', description: 'Observe blunted response', target: 100, current: 0, unit: '% increase', completed: false },
        ],
      },
    ],
    educationalContent: {
      title: 'Insulin and Blood Sugar',
      body: 'Insulin is the master regulator of metabolism. It signals cells to take up glucose from the blood, promotes protein synthesis, and inhibits fat breakdown. The magnitude of insulin response depends on meal composition and individual insulin sensitivity.',
      keyPoints: [
        'High-glycemic carbs cause rapid insulin spikes',
        'Protein stimulates insulin but also glucagon',
        'Fat slows gastric emptying and blunts insulin response',
        'Chronic high insulin can lead to insulin resistance',
      ],
    },
  },
  {
    id: 'cortisol-stress',
    name: "The Stress Response",
    description: "Learn how stress affects cortisol levels, muscle breakdown, and metabolic health. Manage stress through sleep and relaxation.",
    category: 'intermediate',
    difficulty: 2,
    estimatedTime: '10 min',
    phases: [
      {
        id: 'phase-1',
        name: 'Acute Stress',
        description: 'Apply high stress and observe cortisol response.',
        objectives: [
          { id: 'obj-1', description: 'Apply high stress', target: 1, current: 0, unit: 'time', completed: false },
          { id: 'obj-2', description: 'Observe cortisol spike', target: 150, current: 0, unit: '% increase', completed: false },
        ],
      },
      {
        id: 'phase-2',
        name: 'Recovery',
        description: 'Use sleep and relaxation to lower cortisol.',
        objectives: [
          { id: 'obj-3', description: 'Log quality sleep', target: 8, current: 0, unit: 'hours', completed: false },
          { id: 'obj-4', description: 'Reduce cortisol below baseline', target: 10, current: 0, unit: 'level', completed: false },
        ],
      },
    ],
    educationalContent: {
      title: 'Cortisol: The Double-Edged Sword',
      body: 'Cortisol is essential for survival, but chronic elevation is detrimental. Acute cortisol spikes mobilize energy for fight-or-flight, but chronic elevation causes muscle breakdown, fat storage, and insulin resistance.',
      keyPoints: [
        'Cortisol peaks in the morning (cortisol awakening response)',
        'Exercise transiently increases cortisol',
        'Sleep deprivation elevates cortisol',
        'Chronic stress promotes abdominal fat storage',
      ],
    },
  },
  {
    id: 'fasting-ketosis',
    name: "The Fasted State",
    description: "Experience the metabolic shift from glucose to fat oxidation during fasting. Learn about glucagon, growth hormone, and ketosis.",
    category: 'intermediate',
    difficulty: 3,
    estimatedTime: '12 min',
    phases: [
      {
        id: 'phase-1',
        name: 'Post-Absorptive Phase',
        description: 'Wait 4 hours after your last meal as glucose levels decline.',
        objectives: [
          { id: 'obj-1', description: 'Wait for insulin to drop', target: 5, current: 0, unit: 'level', completed: false },
        ],
      },
      {
        id: 'phase-2',
        name: 'Gluconeogenesis',
        description: 'The liver produces glucose from amino acids and glycerol.',
        objectives: [
          { id: 'obj-2', description: 'Observe glucagon increase', target: 20, current: 0, unit: '%', completed: false },
          { id: 'obj-3', description: 'Increase fat oxidation', target: 50, current: 0, unit: '% of total', completed: false },
        ],
      },
    ],
    educationalContent: {
      title: 'Metabolic Flexibility',
      body: 'The body can switch between burning glucose and fat for fuel. This metabolic flexibility is impaired in metabolic disease. Fasting improves this flexibility and increases growth hormone levels.',
      keyPoints: [
        'Insulin decreases, glucagon increases during fasting',
        'Growth hormone can increase 5x during fasting',
        'Fat oxidation increases after ~12 hours of fasting',
        'Muscle protein breakdown increases after ~24 hours',
      ],
    },
  },
  {
    id: 'optimal-protein',
    name: "Protein Timing & Leucine",
    description: "Learn about leucine threshold, muscle protein synthesis, and optimal protein intake timing for maximum muscle growth.",
    category: 'advanced',
    difficulty: 3,
    estimatedTime: '15 min',
    phases: [
      {
        id: 'phase-1',
        name: 'Suboptimal Intake',
        description: 'Consume a meal with insufficient protein.',
        objectives: [
          { id: 'obj-1', description: 'Log low-protein meal', target: 10, current: 0, unit: 'g protein', completed: false },
          { id: 'obj-2', description: 'Observe minimal mTOR activation', target: 20, current: 0, unit: '%', completed: false },
        ],
      },
      {
        id: 'phase-2',
        name: 'Leucine Threshold',
        description: 'Hit the leucine threshold (2-3g) to maximally stimulate MPS.',
        objectives: [
          { id: 'obj-3', description: 'Log high-leucine meal', target: 30, current: 0, unit: 'g protein', completed: false },
          { id: 'obj-4', description: 'Achieve mTOR activation', target: 80, current: 0, unit: '%', completed: false },
        ],
      },
      {
        id: 'phase-3',
        name: 'Protein Distribution',
        description: 'Distribute protein evenly across meals for sustained MPS.',
        objectives: [
          { id: 'obj-5', description: 'Log 3 protein-containing meals', target: 3, current: 0, unit: 'meals', completed: false },
        ],
      },
    ],
    educationalContent: {
      title: 'The Leucine Trigger',
      body: 'Leucine is the key amino acid that triggers muscle protein synthesis via mTOR activation. You need 2-3g of leucine per meal to maximally stimulate MPS. This typically requires 25-40g of high-quality protein.',
      keyPoints: [
        'Leucine threshold is ~2-3g per meal',
        'Whey protein is high in leucine',
        'MPS stays elevated for 2-3 hours after eating',
        'Total daily protein matters more than timing',
      ],
    },
  },
  {
    id: 'sleep-opt',
    name: "Sleep Optimization",
    description: "Discover how sleep quality affects hormones, muscle recovery, and metabolic health. Learn to optimize your sleep for better results.",
    category: 'intermediate',
    difficulty: 2,
    estimatedTime: '12 min',
    phases: [
      {
        id: 'phase-1',
        name: 'Sleep Deprivation',
        description: 'Experience the effects of poor sleep on hormones.',
        objectives: [
          { id: 'obj-1', description: 'Skip sleep or log poor sleep', target: 1, current: 0, unit: 'night', completed: false },
          { id: 'obj-2', description: 'Observe elevated cortisol', target: 120, current: 0, unit: '% of baseline', completed: false },
        ],
      },
      {
        id: 'phase-2',
        name: 'Quality Recovery',
        description: 'Get quality sleep and observe recovery benefits.',
        objectives: [
          { id: 'obj-3', description: 'Log 8+ hours of quality sleep', target: 85, current: 0, unit: '% quality', completed: false },
          { id: 'obj-4', description: 'Reduce sleep debt', target: 0, current: 0, unit: 'hours', completed: false },
        ],
      },
    ],
    educationalContent: {
      title: 'Sleep: The Ultimate Performance Enhancer',
      body: 'Sleep is when most muscle repair, hormone production, and recovery occur. Poor sleep increases cortisol, decreases testosterone, reduces insulin sensitivity, and impairs muscle protein synthesis.',
      keyPoints: [
        'Growth hormone is released in pulses during deep sleep',
        'Testosterone peaks during REM sleep',
        '5 hours of sleep reduces testosterone by 10-15%',
        'Muscle protein synthesis is highest during sleep',
      ],
    },
  },
];

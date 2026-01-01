// ============================================================================
// METABOLIC SIMULATOR - PERSONALIZED RECOMMENDATIONS ENGINE
// ============================================================================
// Analyzes metabolic state and provides actionable, personalized recommendations

import type { SimulationState, HormonalState, EnergyState } from '@metabol-sim/shared';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationCategory = 'nutrition' | 'exercise' | 'sleep' | 'stress' | 'hormones' | 'lifestyle';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  actionable: boolean;
  impact: string;
  icon: string;
}

// Helper to check if hormone is out of range
function getHormoneStatus(value: number, min: number, max: number): 'low' | 'optimal' | 'high' {
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'optimal';
}

// Analyze insulin and glucose patterns
function analyzeInsulin(hormones: HormonalState, energy: EnergyState): Recommendation[] {
  const recs: Recommendation[] = [];
  const insulin = hormones.insulin.currentValue;
  const insulinStatus = getHormoneStatus(insulin, 2, 20);

  if (insulinStatus === 'high') {
    recs.push({
      id: 'insulin-high-reduce-carbs',
      title: 'Reduce Carbohydrate Intake',
      description: 'Your insulin is elevated. Consider reducing carbs, especially high-glycemic foods. Focus on fiber-rich vegetables and proteins.',
      category: 'nutrition',
      priority: insulin > 30 ? 'critical' : 'high',
      actionable: true,
      impact: 'Lower insulin within 2-4 hours',
      icon: '🍽️'
    });

    recs.push({
      id: 'insulin-high-walk',
      title: 'Post-Meal Walking',
      description: 'A 10-15 minute walk after meals can significantly reduce insulin spikes and improve glucose disposal.',
      category: 'lifestyle',
      priority: 'medium',
      actionable: true,
      impact: 'Improves insulin sensitivity long-term',
      icon: '🚶'
    });
  } else if (insulinStatus === 'low') {
    recs.push({
      id: 'insulin-low-protein',
      title: 'Increase Protein Intake',
      description: 'Your insulin is low. Include some lean protein with meals to support anabolic processes and muscle maintenance.',
      category: 'nutrition',
      priority: 'medium',
      actionable: true,
      impact: 'Supports muscle protein synthesis',
      icon: '🥩'
    });
  }

  // Check glycogen levels
  if (energy.glycogen.muscle < 0.3 && energy.glycogen.liver < 0.3) {
    recs.push({
      id: 'glycogen-depleted',
      title: 'Replenish Glycogen Stores',
      description: 'Your glycogen is critically low. Consider complex carbohydrates within 2 hours to support recovery and performance.',
      category: 'nutrition',
      priority: 'high',
      actionable: true,
      impact: 'Restores energy for next workout',
      icon: '🔋'
    });
  }

  return recs;
}

// Analyze cortisol and stress patterns
function analyzeCortisol(hormones: HormonalState, muscle: SimulationState['muscle']): Recommendation[] {
  const recs: Recommendation[] = [];
  const cortisol = hormones.cortisol.currentValue;
  const cortisolStatus = getHormoneStatus(cortisol, 5, 25);

  if (cortisolStatus === 'high') {
    recs.push({
      id: 'cortisol-high-stress',
      title: 'Prioritize Stress Recovery',
      description: 'Elevated cortisol is catabolic. Try meditation, deep breathing, or gentle yoga to lower stress hormones.',
      category: 'stress',
      priority: cortisol > 35 ? 'critical' : 'high',
      actionable: true,
      impact: 'Reduces muscle breakdown, improves recovery',
      icon: '🧘'
    });

    recs.push({
      id: 'cortisol-high-sleep',
      title: 'Optimize Sleep Tonight',
      description: 'High cortisol disrupts sleep. Aim for 8-9 hours, keep room cool, and avoid screens 1 hour before bed.',
      category: 'sleep',
      priority: 'high',
      actionable: true,
      impact: 'Lowers cortisol by morning',
      icon: '😴'
    });

    if (muscle.recoveryStatus.sleepDebt > 2) {
      recs.push({
        id: 'cortisol-sleep-debt',
        title: 'Critical: Address Sleep Debt',
        description: `You have ${muscle.recoveryStatus.sleepDebt.toFixed(1)} hours of sleep debt. This is severely impacting your metabolism and recovery.`,
        category: 'sleep',
        priority: 'critical',
        actionable: true,
        impact: 'Normalizes cortisol within 2-3 nights',
        icon: '⚠️'
      });
    }
  }

  return recs;
}

// Analyze testosterone and anabolic potential
function analyzeTestosterone(hormones: HormonalState, muscle: SimulationState['muscle']): Recommendation[] {
  const recs: Recommendation[] = [];
  const testosterone = hormones.testosterone.currentValue;
  const testosteroneStatus = getHormoneStatus(testosterone, 10, 35);

  if (testosteroneStatus === 'low') {
    recs.push({
      id: 'testosterone-low-resistance-training',
      title: 'Resistance Training Boost',
      description: 'Low testosterone detected. Compound exercises (squats, deadlifts) can acutely increase testosterone.',
      category: 'exercise',
      priority: 'high',
      actionable: true,
      impact: 'Peak T 24-48 hours post-workout',
      icon: '💪'
    });

    recs.push({
      id: 'testosterone-low-sleep',
      title: 'Sleep for Testosterone',
      description: 'Testosterone is primarily produced during REM sleep. Less than 7 hours significantly reduces T levels.',
      category: 'sleep',
      priority: 'high',
      actionable: true,
      impact: '10-30% T increase with adequate sleep',
      icon: '🌙'
    });

    recs.push({
      id: 'testosterone-low-zinc',
      title: 'Check Zinc Intake',
      description: 'Zinc deficiency is linked to low testosterone. Oysters, beef, and pumpkin seeds are rich in zinc.',
      category: 'nutrition',
      priority: 'medium',
      actionable: true,
      impact: 'Supports T production over weeks',
      icon: '🦪'
    });
  } else if (testosteroneStatus === 'optimal' && testosterone > 25) {
    recs.push({
      id: 'testosterone-optimal-anabolic-window',
      title: 'Optimal Anabolic Window',
      description: 'Your testosterone is excellent! This is a great time for intense training or protein intake for maximum muscle building.',
      category: 'exercise',
      priority: 'low',
      actionable: true,
      impact: 'Maximize muscle protein synthesis',
      icon: '📈'
    });
  }

  // Check mTOR signaling
  if (muscle.mtorSignaling.activity < 0.5) {
    recs.push({
      id: 'mtor-low-leucine',
      title: 'Activate mTOR Pathway',
      description: 'Your mTOR signaling is low. Consume leucine-rich protein (3-4g leucine) to activate muscle building pathways.',
      category: 'nutrition',
      priority: 'medium',
      actionable: true,
      impact: 'Activates protein synthesis within 1 hour',
      icon: '🔬'
    });
  }

  return recs;
}

// Analyze growth hormone and recovery
function analyzeGrowthHormone(hormones: HormonalState, muscle: SimulationState['muscle']): Recommendation[] {
  const recs: Recommendation[] = [];
  const gh = hormones.growthHormone.currentValue;
  const ghStatus = getHormoneStatus(gh, 0.5, 5);

  if (ghStatus === 'low') {
    recs.push({
      id: 'gh-low-sleep',
      title: 'Deep Sleep for GH Release',
      description: 'Growth hormone peaks 90 minutes into deep sleep. Prioritize sleep quality for recovery and fat metabolism.',
      category: 'sleep',
      priority: 'high',
      actionable: true,
      impact: 'GH release increases 3-5x with deep sleep',
      icon: '🌙'
    });

    recs.push({
      id: 'gh-low-fasting',
      title: 'Consider Fasted Exercise',
      description: 'Exercise in a fasted state can boost GH release up to 10-fold. Keep intensity moderate.',
      category: 'exercise',
      priority: 'medium',
      actionable: true,
      impact: 'Enhanced fat burning during exercise',
      icon: '⏰'
    });
  } else if (ghStatus === 'optimal' || ghStatus === 'high') {
    recs.push({
      id: 'gh-optimal-recovery',
      title: 'Peak Recovery State',
      description: 'Your growth hormone is elevated! Great tissue repair and fat burning happening. Ideal time for rest.',
      category: 'lifestyle',
      priority: 'low',
      actionable: false,
      impact: 'Continue current recovery protocol',
      icon: '✨'
    });
  }

  return recs;
}

// Analyze leptin and ghrelin (appetite hormones)
function analyzeAppetiteHormones(hormones: HormonalState): Recommendation[] {
  const recs: Recommendation[] = [];
  const leptin = hormones.leptin.currentValue;
  const ghrelin = hormones.ghrelin.currentValue;

  if (leptin < 10 && ghrelin > 180) {
    recs.push({
      id: 'appetite-high-hunger',
      title: 'High Hunger Alert',
      description: 'Your hunger hormones are elevated. You may overeat. Prioritize protein and fiber to increase satiety.',
      category: 'nutrition',
      priority: 'high',
      actionable: true,
      impact: 'Reduces calorie intake naturally',
      icon: '🍽️'
    });
  } else if (leptin > 20 && ghrelin < 80) {
    recs.push({
      id: 'appetite-low-satiety',
      title: 'Good Satiety Levels',
      description: 'Your appetite hormones are well balanced. This is a good time for maintaining your current nutrition plan.',
      category: 'nutrition',
      priority: 'low',
      actionable: false,
      impact: 'Maintain current approach',
      icon: '✅'
    });
  }

  return recs;
}

// Analyze energy balance
function analyzeEnergyBalance(energy: EnergyState): Recommendation[] {
  const recs: Recommendation[] = [];
  const netCalories = energy.netCalories;
  const substrate = energy.substrateUtilization;

  if (netCalories < -500 && substrate.metabolicState === 'fasted') {
    recs.push({
      id: 'energy-large-deficit',
      title: 'Large Caloric Deficit',
      description: 'You\'re in a significant deficit. Consider a refeed meal with complex carbs to support metabolic function.',
      category: 'nutrition',
      priority: 'medium',
      actionable: true,
      impact: 'Supports metabolism and hormones',
      icon: '📉'
    });
  } else if (netCalories > 500 && substrate.fatOxidation < 0.05) {
    recs.push({
      id: 'energy-surplus-no-fat-burn',
      title: 'Caloric Surplus Detected',
      description: 'You\'re in surplus with minimal fat burning. Consider a light activity session to improve nutrient partitioning.',
      category: 'exercise',
      priority: 'medium',
      actionable: true,
      impact: 'Improves nutrient partitioning',
      icon: '🏃'
    });
  }

  // Check metabolic state
  if (substrate.metabolicState === 'fasted' && substrate.fatOxidation > 0.15) {
    recs.push({
      id: 'metabolism-fat-burning',
      title: 'Optimal Fat Burning',
      description: 'Your body is primarily using fat for fuel. Great state for low-intensity cardio or cognitive work.',
      category: 'exercise',
      priority: 'low',
      actionable: false,
      impact: 'Continue fasted state for benefits',
      icon: '🔥'
    });
  }

  return recs;
}

// Analyze muscle recovery
function analyzeMuscleRecovery(muscle: SimulationState['muscle']): Recommendation[] {
  const recs: Recommendation[] = [];

  if (muscle.recoveryStatus.muscleDamage > 0.5) {
    recs.push({
      id: 'recovery-muscle-damage',
      title: 'Active Recovery Needed',
      description: 'Significant muscle damage detected. Focus on light activity, stretching, and protein intake. Avoid heavy training.',
      category: 'exercise',
      priority: muscle.recoveryStatus.muscleDamage > 0.8 ? 'high' : 'medium',
      actionable: true,
      impact: 'Reduces DOMS, speeds recovery',
      icon: '🧘'
    });
  }

  if (muscle.recoveryStatus.inflammation > 0.6) {
    recs.push({
      id: 'recovery-inflammation',
      title: 'Reduce Inflammation',
      description: 'Elevated inflammation markers. Consider omega-3s, tart cherry juice, and adequate hydration.',
      category: 'nutrition',
      priority: 'medium',
      actionable: true,
      impact: 'Accelerates recovery timeline',
      icon: '🍒'
    });
  }

  if (muscle.recoveryStatus.glycogenRepletion < 0.5) {
    recs.push({
      id: 'recovery-glycogen-low',
      title: 'Restore Glycogen',
      description: 'Muscle glycogen is low. Carbohydrates with protein post-workout will optimize replenishment.',
      category: 'nutrition',
      priority: 'high',
      actionable: true,
      impact: 'Restores performance capacity',
      icon: '🍚'
    });
  }

  return recs;
}

// Main recommendation generator
export function generateRecommendations(state: SimulationState): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Run all analyzers
  recommendations.push(...analyzeInsulin(state.hormones, state.energy));
  recommendations.push(...analyzeCortisol(state.hormones, state.muscle));
  recommendations.push(...analyzeTestosterone(state.hormones, state.muscle));
  recommendations.push(...analyzeGrowthHormone(state.hormones, state.muscle));
  recommendations.push(...analyzeAppetiteHormones(state.hormones));
  recommendations.push(...analyzeEnergyBalance(state.energy));
  recommendations.push(...analyzeMuscleRecovery(state.muscle));

  // Sort by priority and remove duplicates
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const uniqueRecs = new Map<string, Recommendation>();

  for (const rec of recommendations) {
    if (!uniqueRecs.has(rec.id) || priorityOrder[rec.priority] < priorityOrder[uniqueRecs.get(rec.id)!.priority]) {
      uniqueRecs.set(rec.id, rec);
    }
  }

  return Array.from(uniqueRecs.values())
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 8); // Limit to top 8 recommendations
}

// Get summary statistics
export function getRecommendationSummary(state: SimulationState): {
  critical: number;
  high: number;
  medium: number;
  low: number;
  actionable: number;
} {
  const recs = generateRecommendations(state);
  return {
    critical: recs.filter(r => r.priority === 'critical').length,
    high: recs.filter(r => r.priority === 'high').length,
    medium: recs.filter(r => r.priority === 'medium').length,
    low: recs.filter(r => r.priority === 'low').length,
    actionable: recs.filter(r => r.actionable).length,
  };
}

// Get quick insights (1-2 sentence summary of current state)
export function getQuickInsight(state: SimulationState): string {
  const cortisol = state.hormones.cortisol.currentValue;
  const testosterone = state.hormones.testosterone.currentValue;
  const insulin = state.hormones.insulin.currentValue;
  const metabolicState = state.energy.substrateUtilization.metabolicState;

  if (cortisol > 30) {
    return '⚠️ High stress detected. Prioritize recovery and sleep to protect your metabolic health.';
  }

  if (insulin > 25) {
    return '📈 Elevated insulin. Focus on low-glycemic foods and light activity to improve sensitivity.';
  }

  if (testosterone > 25 && metabolicState === 'postprandial') {
    return '💪 Optimal anabolic state! Great time for intense training or muscle-building nutrition.';
  }

  if (metabolicState === 'fasted' && state.energy.substrateUtilization.fatOxidation > 0.12) {
    return '🔥 Fat burning optimized! Ideal time for cognitive work or low-intensity cardio.';
  }

  return '✨ Metabolic state is balanced. Continue with your current routine.';
}

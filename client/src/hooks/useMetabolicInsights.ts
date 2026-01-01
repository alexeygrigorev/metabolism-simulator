// ============================================================================
// METABOLIC SIMULATOR - METABOLIC INSIGHTS HOOK
// ============================================================================
// Analyzes simulation state to generate personalized health insights

import { useMemo } from 'react';
import { useSimulationStore } from '../state/store';
import { HORMONE_EDUCATION } from '../data/hormoneEducation';

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  description: string;
  actionable: boolean;
  relatedHormone?: string;
  timestamp?: number;
}

export interface BiomarkerTrend {
  hormone: string;
  current: number;
  baseline: number;
  status: 'optimal' | 'elevated' | 'depressed' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  percentChange: number;
}

export interface LifestyleImpact {
  category: 'exercise' | 'sleep' | 'nutrition' | 'stress';
  impact: number; // -100 to 100
  description: string;
  recommendations: string[];
}

export interface MetabolicScore {
  overall: number; // 0-100
  categories: {
    hormonal: number;
    metabolic: number;
    lifestyle: number;
    recovery: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

// Calculate metabolic score based on current state
function calculateMetabolicScoreResult(state: any): MetabolicScore {
  if (!state) {
    return {
      overall: 50,
      categories: { hormonal: 50, metabolic: 50, lifestyle: 50, recovery: 50 },
      trend: 'stable'
    };
  }

  const scores = {
    hormonal: calculateHormonalScore(state),
    metabolic: calculateMetabolicHealthScore(state),
    lifestyle: calculateLifestyleScore(state),
    recovery: calculateRecoveryScore(state)
  };

  const overall = Math.round(
    (scores.hormonal + scores.metabolic + scores.lifestyle + scores.recovery) / 4
  );

  return {
    overall,
    categories: scores,
    trend: determineTrend(state)
  };
}

// Calculate hormonal balance score
function calculateHormonalScore(state: any): number {
  let totalScore = 0;
  let count = 0;

  Object.entries(state.hormones || {}).forEach(([hormoneId, data]: [string, any]) => {
    const edu = HORMONE_EDUCATION[hormoneId];
    if (edu && data) {
      const value = data.currentValue;
      const { min, max } = edu.normalRange;

      if (value >= min && value <= max) {
        totalScore += 100;
      } else if (value < min) {
        const deviation = (min - value) / min;
        totalScore += Math.max(0, 100 - deviation * 100);
      } else {
        const deviation = (value - max) / max;
        totalScore += Math.max(0, 100 - deviation * 100);
      }
      count++;
    }
  });

  return count > 0 ? Math.round(totalScore / count) : 50;
}

// Calculate metabolic health score
function calculateMetabolicHealthScore(state: any): number {
  const energy = state.energy;
  if (!energy) return 50;

  let score = 50;

  // Blood glucose score
  if (energy.bloodGlucose) {
    const bg = energy.bloodGlucose.currentValue;
    if (bg >= 70 && bg <= 100) score += 15;
    else if (bg >= 60 && bg <= 140) score += 5;
    else score -= 10;
  }

  // Glycogen status
  if (energy.glycogen) {
    const muscleGlycogen = energy.glycogen.muscle || 0;
    const liverGlycogen = energy.glycogen.liver || 0;
    const avgGlycogen = (muscleGlycogen + liverGlycogen) / 2;
    score += avgGlycogen * 20;
  }

  // Substrate utilization
  if (energy.substrateUtilization) {
    const { fatOxidation, glucoseOxidation } = energy.substrateUtilization;
    // Good metabolic flexibility: balanced fat and glucose oxidation
    if (fatOxidation > 0.05 && glucoseOxidation > 0.05) {
      score += 10;
    }
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

// Calculate lifestyle score
function calculateLifestyleScore(state: any): number {
  let score = 50;

  // Exercise score
  const recentExercise = state.recentExercises || [];
  if (recentExercise.length > 0) {
    score += 10;
    if (recentExercise.length >= 3) score += 10;
  }

  // Nutrition score
  const recentMeals = state.recentMeals || [];
  if (recentMeals.length > 0) {
    score += 10;
    // Check for protein in recent meals
    const hasProtein = recentMeals.some((meal: any) =>
      meal.totalMacros?.proteins > 20
    );
    if (hasProtein) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

// Calculate recovery score
function calculateRecoveryScore(state: any): number {
  let score = 50;

  // Sleep score
  const recentSleep = state.recentSleep || [];
  if (recentSleep.length > 0) {
    const avgSleep = recentSleep.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / recentSleep.length;
    if (avgSleep >= 7 && avgSleep <= 9) score += 30;
    else if (avgSleep >= 6) score += 15;
    else score -= 10;
  }

  // Muscle recovery
  if (state.muscle) {
    const { proteinBalance, recoveryStatus } = state.muscle;
    if (proteinBalance?.netBalance > 0) score += 10;
    if (recoveryStatus?.muscleDamage < 0.3) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

// Determine overall trend
function determineTrend(state: any): 'improving' | 'stable' | 'declining' {
  const { hormones } = state;
  if (!hormones) return 'stable';

  let improving = 0;
  let declining = 0;

  Object.entries(hormones).forEach(([id, data]: [string, any]) => {
    const edu = HORMONE_EDUCATION[id];
    if (edu && data) {
      const currentValue = data.currentValue;
      const baseline = data.baseline;
      const { min, max } = edu.normalRange;

      // If current is closer to normal range than baseline
      const currentDist = Math.abs(currentValue - (min + max) / 2);
      const baselineDist = Math.abs(baseline - (min + max) / 2);

      if (currentDist < baselineDist * 0.9) improving++;
      else if (currentDist > baselineDist * 1.1) declining++;
    }
  });

  if (improving > declining) return 'improving';
  if (declining > improving) return 'declining';
  return 'stable';
}

// Generate biomarker trends
function generateBiomarkerTrends(state: any): BiomarkerTrend[] {
  if (!state?.hormones) return [];

  return Object.entries(state.hormones).map(([id, data]: [string, any]) => {
    const edu = HORMONE_EDUCATION[id];
    if (!edu || !data) return null;

    const current = data.currentValue;
    const baseline = data.baseline;
    const { min, max } = edu.normalRange;

    let status: BiomarkerTrend['status'];
    if (current < min * 0.8) status = 'critical';
    else if (current < min) status = 'depressed';
    else if (current > max * 1.2) status = 'critical';
    else if (current > max) status = 'elevated';
    else status = 'optimal';

    const percentChange = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0;

    let trend: BiomarkerTrend['trend'];
    if (Math.abs(percentChange) < 5) trend = 'stable';
    else if (percentChange > 0) {
      // Determine if increase is good or bad based on status
      trend = status === 'optimal' || status === 'elevated' ? 'declining' : 'improving';
    } else {
      trend = status === 'optimal' || status === 'depressed' ? 'declining' : 'improving';
    }

    return {
      hormone: edu.name,
      current,
      baseline,
      status,
      trend,
      percentChange
    };
  }).filter(Boolean) as BiomarkerTrend[];
}

// Generate personalized insights
function generateInsights(state: any, score: MetabolicScore): Insight[] {
  const insights: Insight[] = [];

  if (!state) return insights;

  // Hormonal balance insights
  const { hormones } = state;
  if (hormones) {
    // Insulin insight
    const insulin = hormones.insulin;
    if (insulin) {
      if (insulin.currentValue > 25) {
        insights.push({
          id: 'insulin-high',
          type: 'alert',
          title: 'Elevated Insulin Detected',
          description: 'Your insulin level is elevated. This can indicate insulin resistance. Consider reducing carbohydrate intake and increasing physical activity.',
          actionable: true,
          relatedHormone: 'insulin'
        });
      } else if (insulin.currentValue < 3) {
        insights.push({
          id: 'insulin-low',
          type: 'info',
          title: 'Low Insulin Level',
          description: 'Your insulin is on the lower end, which is typical during fasting. This promotes fat burning and ketone production.',
          actionable: false,
          relatedHormone: 'insulin'
        });
      }
    }

    // Cortisol insight
    const cortisol = hormones.cortisol;
    if (cortisol) {
      if (cortisol.currentValue > 20) {
        insights.push({
          id: 'cortisol-high',
          type: 'warning',
          title: 'Elevated Stress Hormone',
          description: 'Your cortisol is elevated. This can impair muscle growth, promote fat storage, and disrupt sleep. Consider stress management techniques.',
          actionable: true,
          relatedHormone: 'cortisol'
        });
      }
    }

    // Testosterone insight
    const testosterone = hormones.testosterone;
    if (testosterone) {
      if (testosterone.currentValue < 10) {
        insights.push({
          id: 'testosterone-low',
          type: 'warning',
          title: 'Low Testosterone',
          description: 'Your testosterone is below optimal range. This can affect muscle building, energy levels, and libido. Focus on sleep, stress reduction, and resistance training.',
          actionable: true,
          relatedHormone: 'testosterone'
        });
      } else if (testosterone.currentValue > 25) {
        insights.push({
          id: 'testosterone-optimal',
          type: 'success',
          title: 'Optimal Testosterone',
          description: 'Your testosterone level is in an excellent range for muscle growth and recovery. Great job!',
          actionable: false,
          relatedHormone: 'testosterone'
        });
      }
    }
  }

  // Metabolic insights
  if (state.energy?.bloodGlucose) {
    const bg = state.energy.bloodGlucose.currentValue;
    if (bg > 120) {
      insights.push({
        id: 'bg-high',
        type: 'warning',
        title: 'Elevated Blood Glucose',
        description: 'Your blood sugar is elevated. Choose low glycemic index foods and consider a walk to help lower it.',
        actionable: true
      });
    } else if (bg >= 70 && bg <= 100) {
      insights.push({
        id: 'bg-optimal',
        type: 'success',
        title: 'Healthy Blood Sugar',
        description: 'Your blood glucose is in the optimal range. Keep up the good work!',
        actionable: false
      });
    }
  }

  // Score-based insights
  if (score.overall >= 80) {
    insights.push({
      id: 'overall-excellent',
      type: 'success',
      title: 'Excellent Metabolic Health',
      description: `Your overall metabolic score is ${score.overall}/100. You're doing great!`,
      actionable: false
    });
  } else if (score.overall < 50) {
    insights.push({
      id: 'overall-needs-improvement',
      type: 'alert',
      title: 'Metabolic Health Needs Attention',
      description: `Your metabolic score is ${score.overall}/100. Focus on the lowest scoring categories for improvement.`,
      actionable: true
    });
  }

  return insights;
}

// Main hook
export function useMetabolicInsights() {
  const { state } = useSimulationStore();

  const metabolicScore = useMemo(() => calculateMetabolicScoreResult(state), [state]);
  const biomarkerTrends = useMemo(() => generateBiomarkerTrends(state), [state]);
  const insights = useMemo(() => generateInsights(state, metabolicScore), [state, metabolicScore]);

  // Calculate lifestyle impacts
  const lifestyleImpacts = useMemo((): LifestyleImpact[] => {
    if (!state) return [];

    const impacts: LifestyleImpact[] = [];

    // Exercise impact
    const recentExercise = state.recentExercises || [];
    if (recentExercise.length > 0) {
      impacts.push({
        category: 'exercise',
        impact: 60,
        description: 'Recent exercise has positively affected your metabolic state',
        recommendations: ['Continue exercising 3-5x per week', 'Mix resistance and cardio training']
      });
    }

    // Sleep impact
    const recentSleep = state.recentSleep || [];
    if (recentSleep.length > 0) {
      const avgSleep = recentSleep.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / recentSleep.length;
      if (avgSleep < 7) {
        impacts.push({
          category: 'sleep',
          impact: -40,
          description: 'Insufficient sleep is negatively impacting your recovery and hormones',
          recommendations: ['Aim for 7-9 hours of sleep', 'Maintain consistent sleep schedule', 'Limit screens before bed']
        });
      } else {
        impacts.push({
          category: 'sleep',
          impact: 50,
          description: 'Good sleep quality supports optimal hormone balance',
          recommendations: ['Keep maintaining this sleep schedule!']
        });
      }
    }

    return impacts;
  }, [state]);

  return {
    metabolicScore,
    biomarkerTrends,
    insights,
    lifestyleImpacts,
    isLoading: !state
  };
}

// ============================================================================
// METABOLIC SIMULATOR - RECOMMENDATIONS HOOK
// ============================================================================

import { useMemo } from 'react';
import { useSimulationStore } from '../state/store';
import {
  generateRecommendations,
  getRecommendationSummary,
  getQuickInsight,
  type Recommendation,
  type RecommendationPriority,
  type RecommendationCategory
} from '../data/recommendations';

export function useRecommendations() {
  const state = useSimulationStore((s) => s.state);

  const recommendations = useMemo<Recommendation[]>(() => {
    if (!state) return [];
    return generateRecommendations(state);
  }, [state]);

  const summary = useMemo(() => {
    if (!state) return { critical: 0, high: 0, medium: 0, low: 0, actionable: 0 };
    return getRecommendationSummary(state);
  }, [state]);

  const quickInsight = useMemo(() => {
    if (!state) return 'Loading insights...';
    return getQuickInsight(state);
  }, [state]);

  return {
    recommendations,
    summary,
    quickInsight,
    isLoading: !state
  };
}

export type { Recommendation, RecommendationPriority, RecommendationCategory };

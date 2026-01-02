// ============================================================================
// METABOLIC SIMULATOR - CORRELATION ANALYSIS UTILITIES
// ============================================================================

/**
 * Calculate Pearson correlation coefficient between two arrays of numbers
 * Returns a value between -1 (perfect negative correlation) and 1 (perfect positive correlation)
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  // Calculate means
  const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

  // Calculate standard deviations
  let stdDevX = 0;
  let stdDevY = 0;

  for (let i = 0; i < n; i++) {
    stdDevX += Math.pow(x[i] - meanX, 2);
    stdDevY += Math.pow(y[i] - meanY, 2);
  }

  stdDevX = Math.sqrt(stdDevX / n);
  stdDevY = Math.sqrt(stdDevY / n);

  // Avoid division by zero
  if (stdDevX === 0 || stdDevY === 0) return 0;

  // Calculate correlation
  let covariance = 0;
  for (let i = 0; i < n; i++) {
    covariance += ((x[i] - meanX) / stdDevX) * ((y[i] - meanY) / stdDevY);
  }

  return covariance / n;
}

/**
 * Calculate Spearman rank correlation (non-parametric)
 * Better for detecting monotonic relationships that aren't linear
 */
export function calculateSpearmanCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  // Create array of indices
  const indices = Array.from({ length: n }, (_, i) => i);

  // Sort by values to get ranks
  const sortedX = [...x.slice(0, n)].sort((a, b) => a - b);
  const sortedY = [...y.slice(0, n)].sort((a, b) => a - b);

  // Assign ranks (handle ties by averaging)
  const getRank = (value: number, sortedArray: number[]): number => {
    const firstIndex = sortedArray.indexOf(value);
    const lastIndex = sortedArray.lastIndexOf(value);
    return (firstIndex + lastIndex) / 2 + 1;
  };

  const rankX = x.slice(0, n).map(val => getRank(val, sortedX));
  const rankY = y.slice(0, n).map(val => getRank(val, sortedY));

  // Calculate Pearson on ranks
  return calculatePearsonCorrelation(rankX, rankY);
}

/**
 * Detect if there's a significant lag between two variables
 * Tests correlations at different lag periods
 */
export function findLagCorrelation(
  x: number[],
  y: number[],
  maxLag: number = 10
): { lag: number; correlation: number } {
  let bestLag = 0;
  let bestCorr = calculatePearsonCorrelation(x, y);

  for (let lag = 1; lag <= maxLag && lag < x.length - 1; lag++) {
    const corr = calculatePearsonCorrelation(
      x.slice(0, -lag),
      y.slice(lag)
    );
    if (Math.abs(corr) > Math.abs(bestCorr)) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  return { lag: bestLag, correlation: bestCorr };
}

/**
 * Classify correlation strength
 */
export function classifyCorrelation(correlation: number): {
  strength: 'none' | 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative' | 'neutral';
} {
  const abs = Math.abs(correlation);

  let strength: 'none' | 'weak' | 'moderate' | 'strong';
  if (abs < 0.1) strength = 'none';
  else if (abs < 0.3) strength = 'weak';
  else if (abs < 0.7) strength = 'moderate';
  else strength = 'strong';

  let direction: 'positive' | 'negative' | 'neutral';
  if (abs < 0.1) direction = 'neutral';
  else if (correlation > 0) direction = 'positive';
  else direction = 'negative';

  return { strength, direction };
}

/**
 * Generate correlation description for UI
 */
export function getCorrelationDescription(
  hormone1: string,
  hormone2: string,
  correlation: number,
  lag: number = 0
): string {
  const { strength, direction } = classifyCorrelation(correlation);

  if (strength === 'none') {
    return `No significant correlation found between ${hormone1} and ${hormone2}.`;
  }

  const directionText = direction === 'positive' ? 'rise together' : 'move in opposite directions';
  const strengthText = strength === 'weak' ? 'slightly' : strength === 'moderate' ? 'moderately' : 'strongly';

  let desc = `${hormone1} and ${hormone2} ${strengthText} ${directionText}`;

  if (lag > 0) {
    desc += ` (with ${hormone2} lagging ${lag} data points behind)`;
  }

  return desc + '.';
}

/**
 * Calculate correlation matrix for multiple hormones
 */
export function calculateCorrelationMatrix(
  data: Record<string, number[]>
): Record<string, Record<string, number>> {
  const hormones = Object.keys(data);
  const matrix: Record<string, Record<string, number>> = {};

  hormones.forEach(h1 => {
    matrix[h1] = {};
    hormones.forEach(h2 => {
      if (h1 === h2) {
        matrix[h1][h2] = 1;
      } else {
        matrix[h1][h2] = calculatePearsonCorrelation(data[h1] || [], data[h2] || []);
      }
    });
  });

  return matrix;
}

/**
 * Find interesting patterns in hormone correlations
 * Returns relationships that are stronger than expected
 */
export function findInterestingCorrelations(
  actualMatrix: Record<string, Record<string, number>>,
  theoreticalMatrix: Record<string, Record<string, number>>,
  threshold: number = 0.3
): Array<{
  hormone1: string;
  hormone2: string;
  actualCorrelation: number;
  theoreticalCorrelation: number;
  difference: number;
  type: 'stronger_than_expected' | 'weaker_than_expected' | 'reversed';
}> {
  const results: Array<{
    hormone1: string;
    hormone2: string;
    actualCorrelation: number;
    theoreticalCorrelation: number;
    difference: number;
    type: 'stronger_than_expected' | 'weaker_than_expected' | 'reversed';
  }> = [];

  Object.entries(actualMatrix).forEach(([h1, row]) => {
    Object.entries(row).forEach(([h2, actual]) => {
      if (h1 >= h2) return; // Only check upper triangle

      const theoretical = theoreticalMatrix[h1]?.[h2] || 0;
      const diff = actual - theoretical;

      // Determine if interesting
      let type: 'stronger_than_expected' | 'weaker_than_expected' | 'reversed' | null = null;

      if (Math.abs(diff) > threshold) {
        if (Math.sign(actual) !== Math.sign(theoretical) && Math.abs(actual) > 0.2) {
          type = 'reversed';
        } else if (diff > 0) {
          type = 'stronger_than_expected';
        } else {
          type = 'weaker_than_expected';
        }
      }

      if (type) {
        results.push({
          hormone1: h1,
          hormone2: h2,
          actualCorrelation: actual,
          theoreticalCorrelation: theoretical,
          difference: diff,
          type,
        });
      }
    });
  });

  // Sort by absolute difference
  return results.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

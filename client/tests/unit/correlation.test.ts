// ============================================================================
// METABOLIC SIMULATOR - CORRELATION UTILITIES UNIT TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  calculatePearsonCorrelation,
  calculateSpearmanCorrelation,
  findLagCorrelation,
  classifyCorrelation,
  getCorrelationDescription,
  calculateCorrelationMatrix,
  findInterestingCorrelations,
} from '../../src/utils/correlation';

describe('calculatePearsonCorrelation', () => {
  it('should return 1 for identical arrays', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [1, 2, 3, 4, 5];
    expect(calculatePearsonCorrelation(x, y)).toBeCloseTo(1);
  });

  it('should return -1 for perfectly opposite arrays', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 4, 3, 2, 1];
    expect(calculatePearsonCorrelation(x, y)).toBeCloseTo(-1);
  });

  it('should return 0 for uncorrelated arrays', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 2, 7, 1, 3];
    const corr = calculatePearsonCorrelation(x, y);
    expect(corr).toBeGreaterThan(-0.5);
    expect(corr).toBeLessThan(0.5);
  });

  it('should return 0 for arrays with less than 2 elements', () => {
    const x = [1];
    const y = [2];
    expect(calculatePearsonCorrelation(x, y)).toBe(0);
  });

  it('should handle arrays of different lengths', () => {
    const x = [1, 2, 3, 4, 5, 6];
    const y = [2, 4, 6, 8];
    expect(calculatePearsonCorrelation(x, y)).toBeCloseTo(1);
  });

  it('should handle arrays with zero variance', () => {
    const x = [5, 5, 5, 5];
    const y = [1, 2, 3, 4];
    expect(calculatePearsonCorrelation(x, y)).toBe(0);
  });

  it('should calculate positive correlation', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(calculatePearsonCorrelation(x, y)).toBeCloseTo(1);
  });
});

describe('calculateSpearmanCorrelation', () => {
  it('should return 1 for identical rankings', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [1, 2, 3, 4, 5];
    expect(calculateSpearmanCorrelation(x, y)).toBeCloseTo(1);
  });

  it('should return -1 for opposite rankings', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 4, 3, 2, 1];
    expect(calculateSpearmanCorrelation(x, y)).toBeCloseTo(-1);
  });

  it('should detect non-linear monotonic relationships', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [1, 4, 9, 16, 25]; // y = x^2
    const corr = calculateSpearmanCorrelation(x, y);
    expect(corr).toBeCloseTo(1);
  });
});

describe('findLagCorrelation', () => {
  it('should find best correlation including with lag', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    const result = findLagCorrelation(x, y, 3);
    // Perfect correlation at lag 0 is best
    expect(result.correlation).toBeCloseTo(1);
  });

  it('should detect lag in correlated data', () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8];
    const y = [0, 0, 1, 2, 3, 4, 5, 6]; // x lags y by 2
    const result = findLagCorrelation(x, y, 5);
    expect(result.lag).toBeGreaterThan(0);
  });

  it('should return some correlation result even for uncorrelated data', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 2, 7, 1, 3];
    const result = findLagCorrelation(x, y, 3);
    expect(result).toBeDefined();
    expect(result.correlation).toBeGreaterThanOrEqual(-1);
    expect(result.correlation).toBeLessThanOrEqual(1);
  });
});

describe('classifyCorrelation', () => {
  it('should classify strong positive correlation', () => {
    const result = classifyCorrelation(0.8);
    expect(result.strength).toBe('strong');
    expect(result.direction).toBe('positive');
  });

  it('should classify strong negative correlation', () => {
    const result = classifyCorrelation(-0.8);
    expect(result.strength).toBe('strong');
    expect(result.direction).toBe('negative');
  });

  it('should classify moderate correlation', () => {
    const result = classifyCorrelation(0.5);
    expect(result.strength).toBe('moderate');
    expect(result.direction).toBe('positive');
  });

  it('should classify weak correlation', () => {
    const result = classifyCorrelation(0.2);
    expect(result.strength).toBe('weak');
    expect(result.direction).toBe('positive');
  });

  it('should classify no correlation', () => {
    const result = classifyCorrelation(0.05);
    expect(result.strength).toBe('none');
    expect(result.direction).toBe('neutral');
  });
});

describe('getCorrelationDescription', () => {
  it('should generate description for positive correlation', () => {
    const desc = getCorrelationDescription('Insulin', 'Glucose', 0.7);
    expect(desc).toContain('Insulin');
    expect(desc).toContain('Glucose');
    expect(desc).toContain('strongly');
  });

  it('should generate description for negative correlation', () => {
    const desc = getCorrelationDescription('Insulin', 'Glucagon', -0.6);
    expect(desc).toContain('move in opposite directions');
  });

  it('should mention lag when present', () => {
    const desc = getCorrelationDescription('Cortisol', 'Insulin', 0.5, 3);
    expect(desc).toContain('lagging');
  });
});

describe('calculateCorrelationMatrix', () => {
  it('should calculate full correlation matrix', () => {
    const data = {
      a: [1, 2, 3, 4, 5],
      b: [2, 4, 6, 8, 10],
      c: [5, 4, 3, 2, 1],
    };
    const matrix = calculateCorrelationMatrix(data);

    expect(matrix.a.a).toBeCloseTo(1); // Self-correlation
    expect(matrix.a.b).toBeCloseTo(1); // Perfect positive
    expect(matrix.a.c).toBeCloseTo(-1); // Perfect negative
    expect(matrix.b.c).toBeCloseTo(-1); // Perfect negative
  });

  it('should handle empty data', () => {
    const matrix = calculateCorrelationMatrix({});
    expect(Object.keys(matrix)).toHaveLength(0);
  });
});

describe('findInterestingCorrelations', () => {
  it('should find stronger than expected correlations', () => {
    const actual = {
      insulin: { glucose: 0.8, glucagon: -0.3 },
      glucose: { insulin: 0.8, glucagon: -0.5 },
      glucagon: { insulin: -0.3, glucose: -0.5 },
    };
    const theoretical = {
      insulin: { glucose: 0.5, glucagon: -0.5 },
      glucose: { insulin: 0.5, glucagon: -0.5 },
      glucagon: { insulin: -0.5, glucose: -0.5 },
    };

    const results = findInterestingCorrelations(actual, theoretical, 0.2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe('stronger_than_expected');
  });

  it('should find reversed correlations', () => {
    const actual = {
      insulin: { glucose: -0.5 },
      glucose: { insulin: -0.5 },
    };
    const theoretical = {
      insulin: { glucose: 0.5 },
      glucose: { insulin: 0.5 },
    };

    const results = findInterestingCorrelations(actual, theoretical, 0.3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe('reversed');
  });

  it('should return empty array when no interesting correlations', () => {
    const actual = {
      insulin: { glucose: 0.5 },
      glucose: { insulin: 0.5 },
    };
    const theoretical = {
      insulin: { glucose: 0.5 },
      glucose: { insulin: 0.5 },
    };

    const results = findInterestingCorrelations(actual, theoretical, 0.3);
    expect(results.length).toBe(0);
  });
});

// ============================================================================
// METABOLIC SIMULATOR - API INTEGRATION TESTS
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../src/api/server';
import { WebSocket } from 'ws';
import { BiologicalSex } from '@metabol-sim/shared';

describe('API Integration Tests', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    // Use random port to avoid conflicts
    port = 3001;
    server = await createServer(port);
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  describe('REST API', () => {
    it('should create a new simulation', async () => {
      const response = await fetch(`http://localhost:${port}/api/simulation/test-user-1`);
      expect(response.ok).toBe(true);

      const state = await response.json();
      expect(state).toHaveProperty('id');
      expect(state).toHaveProperty('userId');
      expect(state.user).toHaveProperty('id', 'test-user-1');
      expect(state).toHaveProperty('user');
      expect(state).toHaveProperty('energy');
      expect(state).toHaveProperty('hormones');
      expect(state).toHaveProperty('muscle');
    });

    it('should update simulation settings', async () => {
      // First create a simulation
      await fetch(`http://localhost:${port}/api/simulation/test-user-2`);

      const response = await fetch(`http://localhost:${port}/api/simulation/test-user-2/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeScale: 10, paused: true }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result).toEqual({ success: true });
    });

    it('should log a meal', async () => {
      // First create a simulation
      await fetch(`http://localhost:${port}/api/simulation/test-user-3`);

      const response = await fetch(`http://localhost:${port}/api/simulation/test-user-3/meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'meal-1',
          time: new Date().toISOString(),
          items: [],
          totalMacros: { carbohydrates: 50, proteins: 30, fats: 10, fiber: 5, water: 200 },
          glycemicLoad: 20,
          insulinResponse: { peak: 30, magnitude: 100, duration: 120, areaUnderCurve: 5000 },
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result).toEqual({ success: true });
    });

    it('should log exercise', async () => {
      // First create a simulation
      await fetch(`http://localhost:${port}/api/simulation/test-user-4`);

      const response = await fetch(`http://localhost:${port}/api/simulation/test-user-4/exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'exercise-1',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 30 * 60000).toISOString(),
          exercises: [],
          totalVolume: 1000,
          totalWork: 5000,
          perceivedExertion: 7,
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result).toEqual({ success: true });
    });

    it('should apply stress', async () => {
      // First create a simulation
      await fetch(`http://localhost:${port}/api/simulation/test-user-5`);

      const response = await fetch(`http://localhost:${port}/api/simulation/test-user-5/stress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity: 0.5 }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result).toEqual({ success: true });
    });

    it('should log sleep', async () => {
      // First create a simulation
      await fetch(`http://localhost:${port}/api/simulation/test-user-6`);

      const response = await fetch(`http://localhost:${port}/api/simulation/test-user-6/sleep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: 8, quality: 0.85 }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result).toEqual({ success: true });
    });
  });

  // Note: Full WebSocket integration tests require a running WebSocket client
  // and are better tested in e2e tests with a real browser

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await fetch(`http://localhost:${port}/health`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
    });
  });
});

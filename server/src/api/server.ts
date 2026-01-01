// ============================================================================
// METABOLIC SIMULATOR - API SERVER
// ============================================================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { v4 as uuidv4 } from 'uuid';
import {
  SimulationState,
  UserProfile,
  BiologicalSex,
  Meal,
  ExerciseSession,
  SimulationEventType,
} from '@metabol-sim/shared';
import {
  createInitialState,
  SimulationLoop,
  TimeController,
  SimulationModules,
} from '../engine/SimulationLoop';
import { EnergyModule } from '../modules/EnergyModule';
import { HormoneModule } from '../modules/HormoneModule';
import { MuscleModule } from '../modules/MuscleModule';
import { ExerciseModule } from '../modules/ExerciseModule';
import { FoodModule } from '../modules/FoodModule';

// ----------------------------------------------------------------------------
// Simulation Manager
// ----------------------------------------------------------------------------

interface ActiveSimulation {
  id: string;
  userId: string;
  loop: SimulationLoop;
  modules: SimulationModules;
  clients: Set<any>;
  interval?: NodeJS.Timeout;
}

class SimulationManager {
  private simulations: Map<string, ActiveSimulation> = new Map();

  createSimulation(userId: string, profile: UserProfile): ActiveSimulation {
    const simId = uuidv4();
    const state = createInitialState(simId, profile);

    // Create modules with circular references handled
    const energyModule = new EnergyModule();
    const hormoneModule = new HormoneModule();
    const muscleModule = new MuscleModule();
    const exerciseModule = new ExerciseModule({
      muscle: muscleModule,
      hormone: hormoneModule,
      energy: energyModule,
    });
    const foodModule = new FoodModule({
      hormone: hormoneModule,
      energy: energyModule,
      muscle: muscleModule,
    });

    const modules: SimulationModules = {
      energy: energyModule,
      hormone: hormoneModule,
      muscle: muscleModule,
      exercise: exerciseModule,
      food: foodModule,
    };

    const loop = new SimulationLoop(state, modules);

    const simulation: ActiveSimulation = {
      id: simId,
      userId,
      loop,
      modules,
      clients: new Set(),
    };

    this.simulations.set(simId, simulation);
    this.startSimulation(simId);

    return simulation;
  }

  getSimulation(id: string): ActiveSimulation | undefined {
    return this.simulations.get(id);
  }

  getByUserId(userId: string): ActiveSimulation | undefined {
    for (const sim of this.simulations.values()) {
      if (sim.userId === userId) {
        return sim;
      }
    }
    return undefined;
  }

  addClient(userId: string, socket: any): void {
    const sim = this.getByUserId(userId);
    if (sim) {
      sim.clients.add(socket);

      // Send initial state
      socket.send(JSON.stringify({
        type: 'state',
        data: sim.loop.state,
      }));

      // Throttled state updates (max 2 per second for performance)
      let lastUpdate = 0;
      const throttleMs = 500;

      // Listen for state updates
      const handler = () => {
        if (socket.readyState === 1) { // OPEN
          const now = Date.now();
          if (now - lastUpdate >= throttleMs) {
            lastUpdate = now;
            socket.send(JSON.stringify({
              type: 'stateUpdate',
              data: sim.loop.state,
            }));
          }
        }
      };

      sim.loop.on('stateUpdate', handler);

      // Clean up on close
      socket.on('close', () => {
        sim.clients.delete(socket);
        sim.loop.off('stateUpdate', handler);
      });
    }
  }

  private startSimulation(simId: string): void {
    const sim = this.simulations.get(simId);
    if (!sim) return;

    // Start simulation loop
    sim.interval = setInterval(() => {
      sim.loop.tick();
    }, 1000 / 60); // 60 ticks per second
  }

  stopSimulation(simId: string): void {
    const sim = this.simulations.get(simId);
    if (sim) {
      clearInterval(sim.interval);
      this.simulations.delete(simId);
    }
  }
}

const simulationManager = new SimulationManager();

// ----------------------------------------------------------------------------
// Fastify Server
// ----------------------------------------------------------------------------

export async function createServer(port: number = 3000) {
  const fastify = Fastify({
    logger: true,
  });

  // Register plugins
  await fastify.register(cors);
  await fastify.register(websocket);

  // ----------------------------------------------------------------------------
  // REST API Routes
  // ----------------------------------------------------------------------------

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Get or create simulation for user
  fastify.get('/api/simulation/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };

    let sim = simulationManager.getByUserId(userId);
    if (!sim) {
      // Create default profile
      const defaultProfile: UserProfile = {
        id: userId,
        age: 30,
        biologicalSex: BiologicalSex.Male,
        weight: 75,
        height: 180,
        bodyFatPercentage: 0.18,
        activityLevel: 1.55,
      };

      sim = simulationManager.createSimulation(userId, defaultProfile);
    }

    return sim.loop.state;
  });

  // Create simulation with profile
  fastify.post('/api/simulation/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const profile = request.body as UserProfile;

    // Remove existing simulation if any
    const existing = simulationManager.getByUserId(userId);
    if (existing) {
      simulationManager.stopSimulation(existing.id);
    }

    const sim = simulationManager.createSimulation(userId, profile);
    return sim.loop.state;
  });

  // Update simulation settings (time scale, pause)
  fastify.put('/api/simulation/:userId/settings', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { timeScale, paused } = request.body as {
      timeScale?: number;
      paused?: boolean;
    };

    const sim = simulationManager.getByUserId(userId);
    if (!sim) {
      reply.code(404).send({ error: 'Simulation not found' });
      return;
    }

    if (timeScale !== undefined) {
      sim.loop.setTimeScale(timeScale);
    }
    if (paused !== undefined) {
      sim.loop.setPaused(paused);
    }

    return { success: true };
  });

  // Log a meal
  fastify.post('/api/simulation/:userId/meal', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const meal = request.body as Meal;

    const sim = simulationManager.getByUserId(userId);
    if (!sim) {
      reply.code(404).send({ error: 'Simulation not found' });
      return;
    }

    sim.loop.scheduleEvent({
      id: uuidv4(),
      type: SimulationEventType.Meal,
      scheduledTime: new Date(meal.time),
      data: meal,
    });

    return { success: true };
  });

  // Log an exercise session
  fastify.post('/api/simulation/:userId/exercise', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const session = request.body as ExerciseSession;

    const sim = simulationManager.getByUserId(userId);
    if (!sim) {
      reply.code(404).send({ error: 'Simulation not found' });
      return;
    }

    sim.loop.scheduleEvent({
      id: uuidv4(),
      type: SimulationEventType.Exercise,
      scheduledTime: new Date(session.startTime),
      data: session,
    });

    return { success: true };
  });

  // Log sleep
  fastify.post('/api/simulation/:userId/sleep', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { hours, quality } = request.body as { hours: number; quality: number };

    const sim = simulationManager.getByUserId(userId);
    if (!sim) {
      reply.code(404).send({ error: 'Simulation not found' });
      return;
    }

    sim.modules.muscle?.applySleep(sim.loop.state, hours, quality);

    return { success: true };
  });

  // Apply stress
  fastify.post('/api/simulation/:userId/stress', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { intensity } = request.body as { intensity: number };

    const sim = simulationManager.getByUserId(userId);
    if (!sim) {
      reply.code(404).send({ error: 'Simulation not found' });
      return;
    }

    sim.modules.hormone?.applyStress(sim.loop.state, intensity);

    return { success: true };
  });

  // Get food database
  fastify.get('/api/foods', async (request, reply) => {
    const sim = Array.from(simulationManager['simulations'].values())[0];
    if (sim?.modules.food) {
      return sim.modules.food.getAllFoods();
    }
    return [];
  });

  // Get exercise database
  fastify.get('/api/exercises', async (request, reply) => {
    const sim = Array.from(simulationManager['simulations'].values())[0];
    if (sim?.modules.exercise) {
      return sim.modules.exercise.getAllExercises();
    }
    return [];
  });

  // ----------------------------------------------------------------------------
  // WebSocket Route
  // ----------------------------------------------------------------------------

  fastify.register(async function (fastify) {
    fastify.get('/ws/:userId', { websocket: true }, (connection, req) => {
      const { userId } = req.params as { userId: string };

      // Auto-subscribe on connection
      simulationManager.addClient(userId, connection.socket);

      connection.socket.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());

          switch (data.type) {
            case 'subscribe':
              simulationManager.addClient(userId, connection.socket);
              break;
            case 'timeScale':
              const sim = simulationManager.getByUserId(userId);
              if (sim) {
                sim.loop.setTimeScale(data.timeScale);
              }
              break;
            case 'pause':
              const sim2 = simulationManager.getByUserId(userId);
              if (sim2) {
                sim2.loop.setPaused(data.paused ?? true);
              }
              break;
          }
        } catch (err) {
          console.error('WebSocket error:', err);
        }
      });
    });
  });

  // ----------------------------------------------------------------------------
  // Start Server
  // ----------------------------------------------------------------------------

  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  return fastify;
}

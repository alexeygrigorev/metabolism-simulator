# Metabolic Simulator - Implementation Plan

## Overview
A web-based educational game/simulator modeling human metabolism, muscle growth, hormones (insulin, glucagon, cortisol, testosterone, GH, IGF-1), exercise effects, and food timing.

**Tech Stack:**
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Fastify + TypeScript
- Charts: Recharts
- State: Zustand
- Real-time: Socket.io
- Database: SQLite + Better-SQLite3

---

## Project Structure

```
metabol-sim/
├── packages/
│   ├── core/              # Shared types, models, constants
│   ├── simulation/        # Simulation engine (backend)
│   ├── frontend/          # React dashboard
│   └── database/          # Persistence layer
├── data/
│   ├── foods.json
│   ├── exercises.json
│   └── educational-content.json
└── docs/
```

---

## Phase 1: Foundation (Core Package)

### 1.1 Core Data Models
- `UserProfile.ts` - User attributes (age, sex, weight, body fat, activity level)
- `EnergyBalance.ts` - BMR, TDEE, macros, glycogen, substrate utilization
- `Hormones.ts` - Hormonal state (insulin, glucagon, cortisol, testosterone, GH, IGF-1, etc.)
- `Muscle.ts` - Muscle mass, MPS/MPB, mTOR signaling, satellite cells, recovery status
- `Exercise.ts` - Exercise definitions, sessions, effects on hormones/metabolism
- `Food.ts` - Food profiles, macros, micros, glycemic index, insulin index
- `SimulationState.ts` - Central state interface

### 1.2 Constants & Data
- Hormonal response curves (onset, peak, duration for each stimulus)
- Food database (100+ foods with complete nutritional profiles)
- Exercise database (cardio, strength, movements with MET values)
- Formulas (Mifflin-St Jeor, Katch-McArdle, substrate utilization)

### 1.3 Type Definitions
- Enums (ActivityLevel, ComplexityLevel, MetabolicState, ExerciseCategory, etc.)
- Interfaces for all major systems
- Event types for simulation actions

---

## Phase 2: Simulation Engine

### 2.1 Core Loop (`SimulationLoop.ts`)
- Fixed timestep game loop
- Event scheduling (meals, exercises, sleep)
- Time acceleration (1x to 1000x speed)
- State updates at configurable tick rates

### 2.2 Simulation Modules

**EnergyModule**
- BMR/TDEE calculations
- Substrate utilization (fat vs glucose oxidation)
- Glycogen depletion/repletion
- Body composition changes

**HormoneModule**
- Response curve calculations (exponential, gaussian, sigmoid)
- Hormone triggering from stimuli (food, exercise, stress)
- Decay to baseline
- Trend tracking

**MuscleModule**
- MPS rate calculation (leucine threshold, mTOR, insulin)
- MPB rate calculation (cortisol, fasting, deficit)
- Satellite cell activation/differentiation
- Recovery status updates
- Muscle mass accumulation

**ExerciseModule**
- Exercise effects on hormones
- Mechanical mTOR activation
- Muscle damage calculation
- EPOC (post-exercise oxygen consumption)

**FoodModule**
- Meal digestion/absorption
- Insulin response calculation
- Glycemic load effects
- Leucine threshold tracking

**RecoveryModule**
- Sleep quality effects
- Stress management
- Fatigue clearance

### 2.3 Math Library
- Response curve functions (exponential-rise-decay, gaussian, sigmoid)
- Differential equation solver for complex pathways
- Statistics and curve fitting

### 2.4 API Layer
- REST API for state queries
- WebSocket for real-time updates
- Scenario execution endpoints

---

## Phase 3: Frontend Dashboard

### 3.1 Core Components

**Dashboard Layout**
- Avatar/status panel (weight, body fat, muscle mass)
- Hormone dashboard (mini charts for each hormone)
- Energy balance panel (BMR, TDEE, net calories)
- Macronutrient tracker with progress bars
- Muscle status panel (MPS/MPB, recovery, mTOR)

**Charts**
- TimeSeriesChart - Hormone levels over time
- GaugeChart - Single value displays
- ProgressBar - Goal tracking
- ComparisonChart - Before/after comparisons

**Controls**
- MealLogger - Food selection, portion sizing
- ExerciseLogger - Exercise selection, sets, reps, load
- ProfileEditor - User attributes
- TimeControls - Play/pause, speed slider

**Education**
- EducationalTooltip - Complexity-aware explanations
- ComplexitySelector - Switch between simplified/moderate/detailed
- InfoPanel - Detailed biological pathway diagrams
- PathwayDiagram - Visual signaling pathways

**Scenario Mode**
- ScenarioSelect - Choose scenario
- ScenarioPlayer - Phase-based gameplay
- ObjectiveTracker - Progress toward goals
- ChallengeIndicator - Active challenges

### 3.2 State Management (Zustand)
- `simulationSlice` - Simulation state, time controls
- `uiSlice` - UI state, modals, panels
- `userSlice` - User profile, preferences

### 3.3 Real-time Communication
- WebSocket connection to simulation engine
- State sync on each simulation tick
- Event acknowledgment

---

## Phase 4: Progressive Complexity

### Level 1: Simplified
- Energy balance only
- Basic BMR/TDEE
- Simple weight change
- No hormones

### Level 2: Moderate (Default)
- All hormones (insulin, glucagon, cortisol, testosterone, GH)
- Substrate utilization
- Glycogen system
- Basic MPS/MPB
- Recovery mechanics

### Level 3: Detailed
- Full hormonal panel (+ IGF-1, epinephrine, leptin, ghrelin)
- Satellite cell dynamics
- mTOR signaling pathway
- Micronutrient effects
- Sleep quality modeling
- Stress modulation

---

## Phase 5: Scenario/Campaign Mode

**Predefined Scenarios:**
1. "The Newbie Gains" - First 3 months of training
2. "The Bulk" - Strategic muscle gain
3. "The Cut" - Fat loss while preserving muscle
4. "Competition Prep" - Peaking for an event
5. "Hormone Detective" - Diagnostic scenarios

Each scenario has:
- Phases with objectives
- Challenges to overcome
- Educational content unlocks
- Success criteria

---

## Implementation Order

1. **Setup** - Monorepo, TypeScript configs, dependencies
2. **Core Models** - All data structures and types
3. **Simulation Loop** - Basic engine without modules
4. **Energy Module** - First working module
5. **Hormone Module** - Response curves and tracking
6. **Muscle Module** - MPS/MPB, recovery
7. **Exercise Module** - Exercise effects
8. **Food Module** - Digestion and absorption
9. **Frontend Shell** - Basic React app
10. **Dashboard** - Main UI components
11. **Charts** - Visualization
12. **WebSocket** - Real-time connection
13. **Scenario Mode** - Educational content
14. **Polish** - Animations, tutorials, UX refinement

---

## Key Algorithms

1. **Hormone Response Curves** - Exponential rise/decay for insulin, gaussian for GH
2. **Substrate Utilization** - Crossover concept (fat vs carb oxidation based on intensity)
3. **MPS Calculation** - Leucine threshold + mTOR activation + insulin sensitivity
4. **MPB Calculation** - Cortisol-driven with insulin suppression
5. **Time Acceleration** - Fixed timestep with configurable scaling

---

## Critical Files

- `packages/core/src/models/SimulationState.ts` - Central state
- `packages/simulation/src/engine/SimulationLoop.ts` - Core engine
- `packages/simulation/src/modules/HormoneModule.ts` - Hormonal dynamics
- `packages/simulation/src/modules/MuscleModule.ts` - Muscle physiology
- `packages/core/src/models/Hormones.ts` - Hormone models
- `packages/frontend/src/components/dashboard/Dashboard.tsx` - Main UI

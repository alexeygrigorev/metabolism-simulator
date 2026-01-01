// ============================================================================
// METABOLIC SIMULATOR - FOOD MODULE
// ============================================================================

import { v4 as uuidv4 } from 'uuid';
import {
  SimulationState,
  Meal,
  Food,
  FoodCategory,
  MealItem,
  Macros,
  StimulusType,
  MPS_CONSTANTS,
  DIGESTION_TIMES,
  CALORIES_PER_GRAM,
} from '@metabol-sim/shared';

// ----------------------------------------------------------------------------
// Food Database (simplified sample)
// ----------------------------------------------------------------------------

const FOOD_DB: Record<string, Food> = {
  // Carbohydrates
  riceWhite: {
    id: 'riceWhite',
    name: 'White Rice (cooked)',
    category: FoodCategory.Carbohydrates,
    servingSize: 100,
    macros: { carbohydrates: 28, proteins: 2.7, fats: 0.3, fiber: 0.4, water: 65 },
    glycemicIndex: 73,
    glycemicLoad: 20,
    leucineContent: 0.15,
    insulinIndex: 65,
  },
  riceBrown: {
    id: 'riceBrown',
    name: 'Brown Rice (cooked)',
    category: FoodCategory.Carbohydrates,
    servingSize: 100,
    macros: { carbohydrates: 23, proteins: 2.6, fats: 0.9, fiber: 1.8, water: 70 },
    glycemicIndex: 68,
    glycemicLoad: 16,
    leucineContent: 0.14,
    insulinIndex: 55,
  },
  oats: {
    id: 'oats',
    name: 'Oats (cooked)',
    category: FoodCategory.Carbohydrates,
    servingSize: 100,
    macros: { carbohydrates: 12, proteins: 2.5, fats: 1.5, fiber: 1.7, water: 80 },
    glycemicIndex: 55,
    glycemicLoad: 7,
    leucineContent: 0.13,
    insulinIndex: 45,
  },
  potato: {
    id: 'potato',
    name: 'Potato (baked)',
    category: FoodCategory.Carbohydrates,
    servingSize: 100,
    macros: { carbohydrates: 21, proteins: 2, fats: 0.1, fiber: 2.2, water: 75 },
    glycemicIndex: 85,
    glycemicLoad: 18,
    leucineContent: 0.1,
    insulinIndex: 75,
  },
  sweetPotato: {
    id: 'sweetPotato',
    name: 'Sweet Potato (baked)',
    category: FoodCategory.Carbohydrates,
    servingSize: 100,
    macros: { carbohydrates: 20, proteins: 1.6, fats: 0.1, fiber: 3, water: 75 },
    glycemicIndex: 61,
    glycemicLoad: 12,
    leucineContent: 0.08,
    insulinIndex: 55,
  },
  banana: {
    id: 'banana',
    name: 'Banana',
    category: FoodCategory.Fruits,
    servingSize: 100,
    macros: { carbohydrates: 23, proteins: 1.1, fats: 0.3, fiber: 2.6, water: 74 },
    glycemicIndex: 51,
    glycemicLoad: 12,
    leucineContent: 0.07,
    insulinIndex: 50,
  },
  breadWhite: {
    id: 'breadWhite',
    name: 'White Bread',
    category: FoodCategory.Carbohydrates,
    servingSize: 100,
    macros: { carbohydrates: 49, proteins: 9, fats: 3.2, fiber: 2.7, water: 35 },
    glycemicIndex: 75,
    glycemicLoad: 37,
    leucineContent: 0.5,
    insulinIndex: 70,
  },
  breadWhole: {
    id: 'breadWhole',
    name: 'Whole Wheat Bread',
    category: FoodCategory.Carbohydrates,
    servingSize: 100,
    macros: { carbohydrates: 41, proteins: 13, fats: 3.5, fiber: 7, water: 35 },
    glycemicIndex: 53,
    glycemicLoad: 22,
    leucineContent: 0.7,
    insulinIndex: 55,
  },
  pasta: {
    id: 'pasta',
    name: 'Pasta (cooked)',
    category: FoodCategory.Carbohydrates,
    servingSize: 100,
    macros: { carbohydrates: 25, proteins: 5, fats: 0.5, fiber: 1.5, water: 68 },
    glycemicIndex: 50,
    glycemicLoad: 13,
    leucineContent: 0.25,
    insulinIndex: 50,
  },

  // Proteins
  chickenBreast: {
    id: 'chickenBreast',
    name: 'Chicken Breast',
    category: FoodCategory.Proteins,
    servingSize: 100,
    macros: { carbohydrates: 0, proteins: 31, fats: 3.6, fiber: 0, water: 65 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    leucineContent: 2.4,
    insulinIndex: 30,
  },
  beef: {
    id: 'beef',
    name: 'Beef (lean)',
    category: FoodCategory.Proteins,
    servingSize: 100,
    macros: { carbohydrates: 0, proteins: 26, fats: 10, fiber: 0, water: 60 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    leucineContent: 2.0,
    insulinIndex: 25,
  },
  salmon: {
    id: 'salmon',
    name: 'Salmon',
    category: FoodCategory.Proteins,
    servingSize: 100,
    macros: { carbohydrates: 0, proteins: 25, fats: 13, fiber: 0, water: 60 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    leucineContent: 1.9,
    insulinIndex: 20,
  },
  eggs: {
    id: 'eggs',
    name: 'Eggs (2 large)',
    category: FoodCategory.Proteins,
    servingSize: 100,
    macros: { carbohydrates: 1.1, proteins: 13, fats: 10, fiber: 0, water: 75 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    leucineContent: 1.1,
    insulinIndex: 25,
  },
  wheyProtein: {
    id: 'wheyProtein',
    name: 'Whey Protein Powder',
    category: FoodCategory.Supplements,
    servingSize: 30,
    macros: { carbohydrates: 3, proteins: 24, fats: 1, fiber: 0, water: 0 },
    glycemicIndex: 30,
    glycemicLoad: 1,
    leucineContent: 2.6,
    insulinIndex: 70, // High insulin response despite low carbs
  },
  caseinProtein: {
    id: 'caseinProtein',
    name: 'Casein Protein Powder',
    category: FoodCategory.Supplements,
    servingSize: 30,
    macros: { carbohydrates: 3, proteins: 24, fats: 1, fiber: 0, water: 0 },
    glycemicIndex: 25,
    glycemicLoad: 1,
    leucineContent: 2.0,
    insulinIndex: 40,
  },
  tofu: {
    id: 'tofu',
    name: 'Tofu',
    category: FoodCategory.Proteins,
    servingSize: 100,
    macros: { carbohydrates: 1.9, proteins: 8, fats: 4.8, fiber: 0.9, water: 85 },
    glycemicIndex: 15,
    glycemicLoad: 0,
    leucineContent: 0.6,
    insulinIndex: 20,
  },
  greekYogurt: {
    id: 'greekYogurt',
    name: 'Greek Yogurt',
    category: FoodCategory.Dairy,
    servingSize: 100,
    macros: { carbohydrates: 4, proteins: 10, fats: 4, fiber: 0, water: 80 },
    glycemicIndex: 11,
    glycemicLoad: 0,
    leucineContent: 0.9,
    insulinIndex: 35,
  },

  // Fats
  avocado: {
    id: 'avocado',
    name: 'Avocado',
    category: FoodCategory.Fats,
    servingSize: 100,
    macros: { carbohydrates: 9, proteins: 2, fats: 15, fiber: 7, water: 73 },
    glycemicIndex: 15,
    glycemicLoad: 1,
    leucineContent: 0.1,
    insulinIndex: 10,
  },
  oliveOil: {
    id: 'oliveOil',
    name: 'Olive Oil',
    category: FoodCategory.Fats,
    servingSize: 15, // 1 tbsp
    macros: { carbohydrates: 0, proteins: 0, fats: 14, fiber: 0, water: 0 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    leucineContent: 0,
    insulinIndex: 5,
  },
  almonds: {
    id: 'almonds',
    name: 'Almonds',
    category: FoodCategory.NutsSeeds,
    servingSize: 30,
    macros: { carbohydrates: 6, proteins: 6, fats: 14, fiber: 3.5, water: 2 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    leucineContent: 0.4,
    insulinIndex: 15,
  },
  peanutButter: {
    id: 'peanutButter',
    name: 'Peanut Butter',
    category: FoodCategory.NutsSeeds,
    servingSize: 32,
    macros: { carbohydrates: 8, proteins: 8, fats: 16, fiber: 2, water: 1 },
    glycemicIndex: 15,
    glycemicLoad: 1,
    leucineContent: 0.5,
    insulinIndex: 15,
  },

  // Vegetables
  broccoli: {
    id: 'broccoli',
    name: 'Broccoli',
    category: FoodCategory.Vegetables,
    servingSize: 100,
    macros: { carbohydrates: 7, proteins: 3, fats: 0.4, fiber: 2.6, water: 89 },
    glycemicIndex: 10,
    glycemicLoad: 1,
    leucineContent: 0.15,
    insulinIndex: 5,
  },
  spinach: {
    id: 'spinach',
    name: 'Spinach',
    category: FoodCategory.Vegetables,
    servingSize: 100,
    macros: { carbohydrates: 4, proteins: 3, fats: 0.4, fiber: 2.2, water: 91 },
    glycemicIndex: 15,
    glycemicLoad: 0,
    leucineContent: 0.12,
    insulinIndex: 5,
  },

  // Beverages
  orangeJuice: {
    id: 'orangeJuice',
    name: 'Orange Juice',
    category: FoodCategory.Beverages,
    servingSize: 250,
    macros: { carbohydrates: 26, proteins: 2, fats: 0.5, fiber: 0.5, water: 88 },
    glycemicIndex: 50,
    glycemicLoad: 13,
    leucineContent: 0.08,
    insulinIndex: 55,
  },
  milk: {
    id: 'milk',
    name: 'Milk (whole)',
    category: FoodCategory.Dairy,
    servingSize: 250,
    macros: { carbohydrates: 12, proteins: 8, fats: 8, fiber: 0, water: 87 },
    glycemicIndex: 27,
    glycemicLoad: 3,
    leucineContent: 0.7,
    insulinIndex: 45,
  },
};

// ----------------------------------------------------------------------------
// Digesting Meal (for active digestion tracking)
// ----------------------------------------------------------------------------

interface DigestingMeal {
  meal: Meal;
  elapsedTime: number; // minutes
  totalDigestionTime: number;
  absorbedMacros: Macros;
  remainingGlucoseImpact?: number; // Remaining glucose to be absorbed (mg/dL)
  glucoseAbsorptionTime?: number; // Time to peak glucose absorption (minutes)
}

// ----------------------------------------------------------------------------
// Food Module
// ----------------------------------------------------------------------------

export class FoodModule {
  private digestingMeals: DigestingMeal[] = [];
  private modules: { hormone: any; energy: any; muscle: any };

  constructor(modules: { hormone: any; energy: any; muscle: any }) {
    this.modules = modules;
  }

  /**
   * Main update function called by simulation loop
   */
  public update(state: SimulationState, dtMinutes: number): void {
    // Update blood glucose (decay towards baseline)
    this.updateBloodGlucose(state, dtMinutes);

    // Update digesting meals
    this.digestingMeals = this.digestingMeals.filter((digesting) => {
      digesting.elapsedTime += dtMinutes;

      if (digesting.elapsedTime >= digesting.totalDigestionTime) {
        // Digestion complete - any remaining macros absorbed
        this.absorbMacros(state, digesting.absorbedMacros);
        return false;
      }

      // Gradual absorption - this updates blood glucose
      this.gradualAbsorption(state, digesting, dtMinutes);
      return true;
    });
  }

  /**
   * Initialize blood glucose state if not present
   */
  private initializeBloodGlucose(state: SimulationState): void {
    if (!state.energy.bloodGlucose) {
      state.energy.bloodGlucose = {
        currentValue: 85, // mg/dL - normal fasting baseline
        baseline: 85,
        peak: 85,
        trend: 0,
        lastMealTime: undefined,
        lastMealGlycemicLoad: 0,
        units: 'mg/dL',
      };
    }
  }

  /**
   * Update blood glucose level - decay towards baseline
   */
  private updateBloodGlucose(state: SimulationState, dtMinutes: number): void {
    this.initializeBloodGlucose(state);
    const bg = state.energy.bloodGlucose;

    // Natural decay towards baseline (insulin + glucose uptake)
    const decayRate = 0.5; // mg/dL per minute when above baseline
    if (bg.currentValue > bg.baseline) {
      bg.currentValue = Math.max(
        bg.baseline,
        bg.currentValue - (decayRate * dtMinutes)
      );
    } else if (bg.currentValue < bg.baseline) {
      // Gluconeogenesis raises low glucose
      bg.currentValue = Math.min(
        bg.baseline,
        bg.currentValue + (0.2 * dtMinutes)
      );
    }

    // Update trend
    if (Math.abs(bg.currentValue - bg.baseline) < 2) {
      bg.trend = 0; // Stable
    } else if (bg.currentValue > bg.baseline) {
      bg.trend = -1; // Falling (being corrected)
    } else {
      bg.trend = 1; // Rising (gluconeogenesis)
    }

    // Update peak if current is higher
    if (bg.currentValue > bg.peak) {
      bg.peak = bg.currentValue;
    }
  }

  /**
   * Calculate blood glucose response from a meal
   */
  private calculateBloodGlucoseResponse(meal: Meal): {
    peak: number;
    timeToPeak: number;
    duration: number;
  } {
    const glycemicLoad = meal.glycemicLoad;
    const carbs = meal.totalMacros.carbohydrates;
    const fiber = meal.totalMacros.fiber || 0;
    const fat = meal.totalMacros.fats;

    // Peak glucose rise (mg/dL) based on glycemic load
    // Rough approximation: GL * 2-3 mg/dL rise
    const peak = Math.round(20 + (glycemicLoad * 2.5));

    // Time to peak (minutes) - fat and fiber slow absorption
    let timeToPeak = 30; // baseline
    if (fat > 15) timeToPeak += 15;
    if (fiber > 5) timeToPeak += 10;

    // Duration (minutes) - how long glucose stays elevated
    const duration = 120 + (timeToPeak / 2);

    return { peak, timeToPeak, duration };
  }

  /**
   * Consume a meal
   */
  public consumeMeal(state: SimulationState, data: any): void {
    const mealData = data as Meal;
    const meal: Meal = {
      id: mealData.id || uuidv4(),
      time: state.gameTime,
      items: mealData.items,
      totalMacros: { carbohydrates: 0, proteins: 0, fats: 0, fiber: 0, water: 0 },
      glycemicLoad: 0,
      insulinResponse: mealData.insulinResponse || {
        peak: 30,
        magnitude: 100,
        duration: 120,
        areaUnderCurve: 0,
      },
    };

    // Calculate totals
    for (const item of meal.items) {
      const food = FOOD_DB[item.foodId];
      if (food) {
        const multiplier = item.servings;
        meal.totalMacros.carbohydrates += food.macros.carbohydrates * multiplier;
        meal.totalMacros.proteins += food.macros.proteins * multiplier;
        meal.totalMacros.fats += food.macros.fats * multiplier;
        meal.totalMacros.fiber += food.macros.fiber * multiplier;
        meal.totalMacros.water += food.macros.water * multiplier;
        meal.glycemicLoad += food.glycemicLoad * multiplier;
      }
    }

    // Calculate insulin response
    meal.insulinResponse = this.calculateInsulinResponse(meal);

    // Add to state
    state.recentMeals.push(meal);

    // Add calories immediately
    this.modules.energy?.addCalories(
      state.energy,
      meal.totalMacros.carbohydrates,
      meal.totalMacros.proteins,
      meal.totalMacros.fats
    );

    // Trigger hormonal response
    const stimulus = this.getMealStimulusType(meal);
    this.modules.hormone?.triggerResponse(
      state.hormones,
      'insulin',
      stimulus,
      meal.insulinResponse.magnitude / 100
    );

    // Check leucine threshold
    const totalLeucine = this.calculateTotalLeucine(meal);
    if (totalLeucine >= MPS_CONSTANTS.leucineThreshold) {
      this.modules.muscle?.setLeucineThreshold(state.muscle, true);
    }

    // Initialize blood glucose if needed
    this.initializeBloodGlucose(state);

    // Calculate and apply blood glucose response
    const bgResponse = this.calculateBloodGlucoseResponse(meal);
    // Immediate glucose spike (simplified - in reality would be delayed)
    state.energy.bloodGlucose.currentValue += bgResponse.peak * 0.3; // 30% immediate
    state.energy.bloodGlucose.lastMealTime = state.gameTime;
    state.energy.bloodGlucose.lastMealGlycemicLoad = meal.glycemicLoad;
    state.energy.bloodGlucose.trend = 1; // Rising

    // Start digestion
    const digestionTime = this.calculateDigestionTime(meal);
    this.digestingMeals.push({
      meal,
      elapsedTime: 0,
      totalDigestionTime: digestionTime,
      absorbedMacros: { ...meal.totalMacros },
      // Track remaining glucose to be absorbed
      remainingGlucoseImpact: bgResponse.peak * 0.7, // 70% gradual
      glucoseAbsorptionTime: bgResponse.timeToPeak,
    });
  }

  /**
   * Calculate insulin response for a meal
   */
  private calculateInsulinResponse(meal: Meal): {
    peak: number;
    magnitude: number;
    duration: number;
    areaUnderCurve: number;
  } {
    const carbs = meal.totalMacros.carbohydrates;
    const protein = meal.totalMacros.proteins;
    const fat = meal.totalMacros.fats;
    const fiber = meal.totalMacros.fiber || 0;
    const glycemicLoad = meal.glycemicLoad;

    // Peak time: fat delays peak
    let peak = 30; // minutes
    if (fat > 20) peak += 15;
    if (fiber > 10) peak += 10;

    // Magnitude: based on carbs and protein
    let magnitude = (carbs * 2) + (protein * 0.5);
    magnitude = Math.min(500, magnitude); // Cap at 500%

    // Fat reduces magnitude
    magnitude *= 1 - (fat / 100) * 0.3;

    // Duration
    let duration = 120; // minutes
    if (fat > 15) duration += 60;
    if (fiber > 10) duration += 30;

    // Area under curve (total insulin response)
    const areaUnderCurve = magnitude * duration / 60;

    return { peak, magnitude, duration, areaUnderCurve };
  }

  /**
   * Determine stimulus type for hormonal response
   */
  private getMealStimulusType(meal: Meal): StimulusType {
    const carbs = meal.totalMacros.carbohydrates;
    const protein = meal.totalMacros.proteins;

    if (carbs > 30 && protein < 20) {
      return 'carbohydrateMeal';
    } else if (protein > 25 && carbs < 10) {
      return 'proteinMeal';
    } else {
      return 'mixedMeal';
    }
  }

  /**
   * Calculate total leucine content
   */
  private calculateTotalLeucine(meal: Meal): number {
    let totalLeucine = 0;
    for (const item of meal.items) {
      const food = FOOD_DB[item.foodId];
      if (food) {
        totalLeucine += food.leucineContent * item.servings;
      }
    }
    return totalLeucine;
  }

  /**
   * Calculate digestion time based on meal composition
   */
  private calculateDigestionTime(meal: Meal): number {
    const carbs = meal.totalMacros.carbohydrates;
    const protein = meal.totalMacros.proteins;
    const fat = meal.totalMacros.fats;
    const fiber = meal.totalMacros.fiber;

    // Base time
    let time = 60; // minutes

    // Add time based on components
    if (carbs > 20) time += 30;
    if (protein > 20) time += 45;
    if (fat > 15) time += 60;
    if (fiber > 10) time += 30;

    return Math.min(240, time); // Max 4 hours
  }

  /**
   * Gradual absorption during digestion
   */
  private gradualAbsorption(state: SimulationState, digesting: DigestingMeal, dtMinutes: number): void {
    const progress = digesting.elapsedTime / digesting.totalDigestionTime;
    const absorptionRate = 0.1; // 10% per tick of remaining

    // Simple absorption curve
    const carbs = digesting.absorbedMacros.carbohydrates;
    const proteins = digesting.absorbedMacros.proteins;
    const fats = digesting.absorbedMacros.fats;

    // Different absorption rates for different macros
    const carbAbsorption = Math.min(carbs, carbs * absorptionRate * (dtMinutes / 10));
    const proteinAbsorption = Math.min(proteins, proteins * absorptionRate * (dtMinutes / 15));
    const fatAbsorption = Math.min(fats, fats * absorptionRate * (dtMinutes / 20));

    // Update blood glucose during carbohydrate absorption
    if (digesting.remainingGlucoseImpact && carbs > 0 && state.energy.bloodGlucose) {
      // Calculate glucose absorption based on carb absorption rate
      const glucoseAbsorption = (carbAbsorption / carbs) * digesting.remainingGlucoseImpact;
      state.energy.bloodGlucose.currentValue += glucoseAbsorption;
      digesting.remainingGlucoseImpact -= glucoseAbsorption;

      // Update trend
      if (digesting.elapsedTime < (digesting.glucoseAbsorptionTime || 30)) {
        state.energy.bloodGlucose.trend = 1; // Rising towards peak
      } else {
        state.energy.bloodGlucose.trend = -1; // Falling after peak
      }
    }

    // Reduce the remaining to be absorbed
    digesting.absorbedMacros.carbohydrates -= carbAbsorption;
    digesting.absorbedMacros.proteins -= proteinAbsorption;
    digesting.absorbedMacros.fats -= fatAbsorption;
  }

  /**
   * Final absorption when digestion completes
   */
  private absorbMacros(state: SimulationState, macros: Macros): void {
    // All macros already added at meal start
    // This would handle any remaining nutrients
  }

  /**
   * Get food by ID
   */
  public getFood(id: string): Food | undefined {
    return FOOD_DB[id];
  }

  /**
   * Get all foods
   */
  public getAllFoods(): Food[] {
    return Object.values(FOOD_DB);
  }

  /**
   * Get foods by category
   */
  public getFoodsByCategory(category: FoodCategory): Food[] {
    return Object.values(FOOD_DB).filter((f) => f.category === category);
  }

  /**
   * Create a meal from food items
   */
  public createMeal(items: MealItem[]): Meal {
    return {
      id: uuidv4(),
      time: new Date(),
      items,
      totalMacros: { carbohydrates: 0, proteins: 0, fats: 0, fiber: 0, water: 0 },
      glycemicLoad: 0,
      insulinResponse: { peak: 30, magnitude: 100, duration: 120, areaUnderCurve: 0 },
    };
  }
}

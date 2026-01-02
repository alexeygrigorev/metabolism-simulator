// ============================================================================
// METABOLIC SIMULATOR - MEAL TEMPLATES
// ============================================================================

import { Food } from './foodDatabase';

export interface MealTemplateItem {
  foodId: string;
  servings: number;
}

export interface MealTemplate {
  id: string;
  name: string;
  description: string;
  category: MealTemplateCategory;
  items: MealTemplateItem[];
  totalMacros: {
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
    sugar: number;
  };
  calories: number;
  glycemicLoad: number;
  prepTime: string;
  tags: string[];
  emoji: string;
}

export type MealTemplateCategory =
  | 'breakfast'
  | 'post-workout'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'high-protein'
  | 'low-carb'
  | 'vegetarian';

// Helper to calculate macros from food items
function calculateMacros(items: MealTemplateItem[], foodDatabase: Food[]) {
  let carbs = 0, proteins = 0, fats = 0, fiber = 0, sugar = 0, glycemicLoad = 0;

  items.forEach(item => {
    const food = foodDatabase.find(f => f.id === item.foodId);
    if (food) {
      carbs += food.macros.carbohydrates * item.servings;
      proteins += food.macros.proteins * item.servings;
      fats += food.macros.fats * item.servings;
      fiber += food.macros.fiber * item.servings;
      sugar += food.macros.sugar * item.servings;
      glycemicLoad += food.glycemicLoad * item.servings;
    }
  });

  return {
    carbohydrates: Math.round(carbs),
    proteins: Math.round(proteins),
    fats: Math.round(fats),
    fiber: Math.round(fiber),
    sugar: Math.round(sugar),
    calories: Math.round(carbs * 4 + proteins * 4 + fats * 9),
    glycemicLoad: Math.round(glycemicLoad * 10) / 10,
  };
}

// Note: These templates reference food IDs from foodDatabase.ts
// The getMealTemplatesWithFoods function will resolve the actual food objects
export const MEAL_TEMPLATES: MealTemplate[] = [
  {
    id: 'power-breakfast',
    name: 'Power Breakfast Bowl',
    description: 'High-protein breakfast to start your day right',
    category: 'breakfast',
    items: [
      { foodId: 'eggs', servings: 3 },
      { foodId: 'oatmeal', servings: 1 },
      { foodId: 'berries', servings: 1 },
      { foodId: 'wheyProtein', servings: 0.5 },
    ],
    totalMacros: {
      carbohydrates: 47,
      proteins: 38,
      fats: 14,
      fiber: 6,
      sugar: 8,
    },
    calories: 470,
    glycemicLoad: 23,
    prepTime: '10 min',
    tags: ['high-protein', 'balanced', 'energy'],
    emoji: '🍳',
  },
  {
    id: 'post-workout-shake',
    name: 'Post-Workout Recovery Shake',
    description: 'Optimal recovery nutrition after training',
    category: 'post-workout',
    items: [
      { foodId: 'wheyProtein', servings: 1 },
      { foodId: 'banana', servings: 1 },
      { foodId: 'peanutButter', servings: 1 },
    ],
    totalMacros: {
      carbohydrates: 48,
      proteins: 31,
      fats: 21,
      fiber: 5,
      sugar: 17,
    },
    calories: 495,
    glycemicLoad: 25,
    prepTime: '5 min',
    tags: ['post-workout', 'high-protein', 'quick'],
    emoji: '🥤',
  },
  {
    id: 'chicken-rice-bowl',
    name: 'Chicken & Rice Bowl',
    description: 'Classic bodybuilder meal for muscle growth',
    category: 'lunch',
    items: [
      { foodId: 'chickenBreast', servings: 1.5 },
      { foodId: 'riceBrown', servings: 1 },
      { foodId: 'broccoli', servings: 1 },
    ],
    totalMacros: {
      carbohydrates: 47,
      proteins: 53,
      fats: 6,
      fiber: 8,
      sugar: 3,
    },
    calories: 458,
    glycemicLoad: 26,
    prepTime: '20 min',
    tags: ['high-protein', 'muscle-growth', 'balanced'],
    emoji: '🍗',
  },
  {
    id: 'salmon-sweet-potato',
    name: 'Salmon & Sweet Potato',
    description: 'Omega-3 rich dinner with complex carbs',
    category: 'dinner',
    items: [
      { foodId: 'salmon', servings: 1.5 },
      { foodId: 'sweetPotato', servings: 1.5 },
      { foodId: 'asparagus', servings: 1 },
    ],
    totalMacros: {
      carbohydrates: 52,
      proteins: 38,
      fats: 20,
      fiber: 9,
      sugar: 9,
    },
    calories: 540,
    glycemicLoad: 32,
    prepTime: '25 min',
    tags: ['omega-3', 'balanced', 'heart-healthy'],
    emoji: '🐟',
  },
  {
    id: 'protein-smoothie',
    name: 'Berry Protein Smoothie',
    description: 'Quick and nutritious meal replacement',
    category: 'breakfast',
    items: [
      { foodId: 'wheyProtein', servings: 1 },
      { foodId: 'berries', servings: 2 },
      { foodId: 'greekYogurt', servings: 1 },
    ],
    totalMacros: {
      carbohydrates: 33,
      proteins: 47,
      fats: 2,
      fiber: 8,
      sugar: 23,
    },
    calories: 338,
    glycemicLoad: 15,
    prepTime: '5 min',
    tags: ['quick', 'high-protein', 'antioxidant'],
    emoji: '🫐',
  },
  {
    id: 'lean-beef-burrito',
    name: 'Lean Beef Burrito Bowl',
    description: 'Flavorful high-protein meal',
    category: 'lunch',
    items: [
      { foodId: 'leanBeef', servings: 1 },
      { foodId: 'riceBrown', servings: 1 },
      { foodId: 'avocado', servings: 0.5 },
    ],
    totalMacros: {
      carbohydrates: 52,
      proteins: 34,
      fats: 22,
      fiber: 13,
      sugar: 2,
    },
    calories: 544,
    glycemicLoad: 31,
    prepTime: '15 min',
    tags: ['high-protein', 'flavorful', 'balanced'],
    emoji: '🌯',
  },
  {
    id: 'greek-breakfast',
    name: 'Greek Yogurt Parfait',
    description: 'Light and protein-rich breakfast',
    category: 'breakfast',
    items: [
      { foodId: 'greekYogurt', servings: 2 },
      { foodId: 'berries', servings: 1 },
      { foodId: 'chiaSeeds', servings: 1 },
    ],
    totalMacros: {
      carbohydrates: 28,
      proteins: 38,
      fats: 9,
      fiber: 12,
      sugar: 23,
    },
    calories: 343,
    glycemicLoad: 11,
    prepTime: '5 min',
    tags: ['light', 'high-protein', 'probiotic'],
    emoji: '🥣',
  },
  {
    id: 'tuna-salad',
    name: 'Tuna Spinach Salad',
    description: 'Fresh and light low-carb meal',
    category: 'lunch',
    items: [
      { foodId: 'tuna', servings: 1.5 },
      { foodId: 'spinach', servings: 2 },
      { foodId: 'avocado', servings: 0.5 },
    ],
    totalMacros: {
      carbohydrates: 11,
      proteins: 44,
      fats: 12,
      fiber: 8,
      sugar: 1,
    },
    calories: 336,
    glycemicLoad: 2,
    prepTime: '10 min',
    tags: ['low-carb', 'high-protein', 'light'],
    emoji: '🥗',
  },
  {
    id: 'vegan-power-bowl',
    name: 'Vegan Power Bowl',
    description: 'Plant-based complete protein meal',
    category: 'vegetarian',
    items: [
      { foodId: 'quinoa', servings: 1.5 },
      { foodId: 'tofu', servings: 2 },
      { foodId: 'avocado', servings: 0.5 },
      { foodId: 'bellPeppers', servings: 1 },
    ],
    totalMacros: {
      carbohydrates: 63,
      proteins: 32,
      fats: 22,
      fiber: 14,
      sugar: 4,
    },
    calories: 578,
    glycemicLoad: 27,
    prepTime: '20 min',
    tags: ['vegan', 'high-protein', 'fiber-rich'],
    emoji: '🌱',
  },
  {
    id: 'trail-mix',
    name: 'Energy Trail Mix',
    description: 'Quick snack for sustained energy',
    category: 'snack',
    items: [
      { foodId: 'almonds', servings: 1 },
      { foodId: 'walnuts', servings: 1 },
      { foodId: 'berries', servings: 0.5 },
    ],
    totalMacros: {
      carbohydrates: 20,
      proteins: 10,
      fats: 32,
      fiber: 7,
      sugar: 9,
    },
    calories: 416,
    glycemicLoad: 6,
    prepTime: '2 min',
    tags: ['snack', 'healthy-fats', 'energy'],
    emoji: '🥜',
  },
  {
    id: 'recovery-overnight',
    name: 'Overnight Oats',
    description: 'Prepare ahead breakfast for busy mornings',
    category: 'breakfast',
    items: [
      { foodId: 'oats', servings: 1 },
      { foodId: 'chiaSeeds', servings: 1 },
      { foodId: 'wheyProtein', servings: 0.5 },
      { foodId: 'berries', servings: 0.5 },
    ],
    totalMacros: {
      carbohydrates: 37,
      proteins: 27,
      fats: 9,
      fiber: 8,
      sugar: 6,
    },
    calories: 337,
    glycemicLoad: 16,
    prepTime: '5 min + overnight',
    tags: ['meal-prep', 'balanced', 'convenient'],
    emoji: '🌙',
  },
  {
    id: 'steak-veggies',
    name: 'Steak & Veggies Dinner',
    description: 'Classic high-protein dinner',
    category: 'dinner',
    items: [
      { foodId: 'leanBeef', servings: 1.5 },
      { foodId: 'broccoli', servings: 2 },
      { foodId: 'sweetPotato', servings: 1 },
    ],
    totalMacros: {
      carbohydrates: 44,
      proteins: 47,
      fats: 15,
      fiber: 12,
      sugar: 8,
    },
    calories: 489,
    glycemicLoad: 24,
    prepTime: '20 min',
    tags: ['high-protein', 'balanced', 'filling'],
    emoji: '🥩',
  },
];

// Category info for display
export const MEAL_TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: '🍽️' },
  { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
  { id: 'post-workout', name: 'Post-Workout', icon: '💪' },
  { id: 'lunch', name: 'Lunch', icon: '☀️' },
  { id: 'dinner', name: 'Dinner', icon: '🌙' },
  { id: 'snack', name: 'Snacks', icon: '🍿' },
  { id: 'high-protein', name: 'High Protein', icon: '🥩' },
  { id: 'low-carb', name: 'Low Carb', icon: '🥬' },
  { id: 'vegetarian', name: 'Vegetarian', icon: '🌱' },
];

// Filter functions
export function getMealTemplatesByCategory(category: MealTemplateCategory | 'all'): MealTemplate[] {
  if (category === 'all') return MEAL_TEMPLATES;
  return MEAL_TEMPLATES.filter(template => template.category === category);
}

export function getMealTemplatesByTag(tag: string): MealTemplate[] {
  return MEAL_TEMPLATES.filter(template =>
    template.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function searchMealTemplates(query: string): MealTemplate[] {
  const q = query.toLowerCase();
  return MEAL_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(q) ||
    template.description.toLowerCase().includes(q) ||
    template.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function getMealTemplateById(id: string): MealTemplate | undefined {
  return MEAL_TEMPLATES.find(template => template.id === id);
}

// Get high protein templates (30g+ protein)
export function getHighProteinTemplates(): MealTemplate[] {
  return MEAL_TEMPLATES.filter(template => template.totalMacros.proteins >= 30);
}

// Get low carb templates (under 30g carbs)
export function getLowCarbTemplates(): MealTemplate[] {
  return MEAL_TEMPLATES.filter(template => template.totalMacros.carbohydrates <= 30);
}

// Get quick prep templates (under 10 minutes)
export function getQuickTemplates(): MealTemplate[] {
  return MEAL_TEMPLATES.filter(template => {
    const minutes = parseInt(template.prepTime);
    return !isNaN(minutes) && minutes <= 10;
  });
}

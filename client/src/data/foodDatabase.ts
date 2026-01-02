// ============================================================================
// METABOLIC SIMULATOR - COMPREHENSIVE FOOD DATABASE
// ============================================================================

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: string;
  servingUnit: string;
  macros: {
    carbohydrates: number; // g per serving
    proteins: number; // g per serving
    fats: number; // g per serving
    fiber: number; // g per serving
    sugar: number; // g per serving
  };
  micros?: {
    vitaminA?: number; // IU
    vitaminC?: number; // mg
    vitaminD?: number; // IU
    calcium?: number; // mg
    iron?: number; // mg
    potassium?: number; // mg
    magnesium?: number; // mg
    zinc?: number; // mg
  };
  glycemicIndex: number; // 0-100 scale
  glycemicLoad: number; // estimated per serving
  insulinIndex: number; // estimated insulin response
  tags: string[];
}

export type FoodCategory =
  | 'protein'
  | 'carbs'
  | 'fats'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'nuts'
  | 'beverages'
  | 'grains'
  | 'supplements';

export const FOOD_DATABASE: Food[] = [
  // === PROTEINS ===
  {
    id: 'chickenBreast',
    name: 'Chicken Breast (skinless)',
    category: 'protein',
    servingSize: '100',
    servingUnit: 'g',
    macros: { carbohydrates: 0, proteins: 31, fats: 3.6, fiber: 0, sugar: 0 },
    micros: { vitaminD: 11, iron: 1, potassium: 256, magnesium: 29, zinc: 1 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 5,
    tags: ['lean', 'high-protein', 'low-carb'],
  },
  {
    id: 'salmon',
    name: 'Salmon (Atlantic, farmed)',
    category: 'protein',
    servingSize: '100',
    servingUnit: 'g',
    macros: { carbohydrates: 0, proteins: 20, fats: 13, fiber: 0, sugar: 0 },
    micros: { vitaminD: 526, iron: 0.3, potassium: 363, magnesium: 27, zinc: 0.5 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 3,
    tags: ['fatty-fish', 'omega-3', 'high-protein'],
  },
  {
    id: 'eggs',
    name: 'Eggs (large, whole)',
    category: 'protein',
    servingSize: '1',
    servingUnit: 'egg',
    macros: { carbohydrates: 0.6, proteins: 6, fats: 5, fiber: 0, sugar: 0.6 },
    micros: { vitaminD: 41, iron: 1, potassium: 63, magnesium: 5, zinc: 0.5 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 5,
    tags: ['breakfast', 'complete-protein', 'versatile'],
  },
  {
    id: 'wheyProtein',
    name: 'Whey Protein Powder',
    category: 'protein',
    servingSize: '30',
    servingUnit: 'g',
    macros: { carbohydrates: 3, proteins: 25, fats: 1, fiber: 0, sugar: 2 },
    micros: { calcium: 200, potassium: 200, magnesium: 50, zinc: 2 },
    glycemicIndex: 30,
    glycemicLoad: 2,
    insulinIndex: 35,
    tags: ['supplement', 'post-workout', 'fast-digesting'],
  },
  {
    id: 'leanBeef',
    name: 'Lean Beef (93% lean)',
    category: 'protein',
    servingSize: '100',
    servingUnit: 'g',
    macros: { carbohydrates: 0, proteins: 26, fats: 6, fiber: 0, sugar: 0 },
    micros: { vitaminD: 7, iron: 2.6, potassium: 318, magnesium: 22, zinc: 5 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 5,
    tags: ['red-meat', 'iron-rich', 'high-protein'],
  },
  {
    id: 'tofu',
    name: 'Tofu (firm)',
    category: 'protein',
    servingSize: '100',
    servingUnit: 'g',
    macros: { carbohydrates: 2, proteins: 8, fats: 5, fiber: 1, sugar: 0.5 },
    micros: { calcium: 350, iron: 3, potassium: 121, magnesium: 30, zinc: 1 },
    glycemicIndex: 15,
    glycemicLoad: 0.3,
    insulinIndex: 10,
    tags: ['plant-based', 'soy', 'versatile'],
  },
  {
    id: 'greekYogurt',
    name: 'Greek Yogurt (non-fat)',
    category: 'dairy',
    servingSize: '170',
    servingUnit: 'g',
    macros: { carbohydrates: 6, proteins: 18, fats: 0.7, fiber: 0, sugar: 4 },
    micros: { calcium: 200, potassium: 240, magnesium: 20, zinc: 1.5 },
    glycemicIndex: 11,
    glycemicLoad: 1,
    insulinIndex: 20,
    tags: ['breakfast', 'probiotic', 'high-protein'],
  },

  // === CARBOHYDRATES ===
  {
    id: 'riceWhite',
    name: 'White Rice (cooked)',
    category: 'carbs',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 43, proteins: 4, fats: 0.4, fiber: 0.6, sugar: 0.1 },
    micros: { iron: 0.3, potassium: 35, magnesium: 10 },
    glycemicIndex: 73,
    glycemicLoad: 31,
    insulinIndex: 70,
    tags: ['staple', 'post-workout', 'gluten-free'],
  },
  {
    id: 'riceBrown',
    name: 'Brown Rice (cooked)',
    category: 'carbs',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 41, proteins: 4.5, fats: 1.5, fiber: 2, sugar: 0.5 },
    micros: { iron: 0.5, potassium: 84, magnesium: 42 },
    glycemicIndex: 68,
    glycemicLoad: 28,
    insulinIndex: 55,
    tags: ['whole-grain', 'fiber', 'sustained-energy'],
  },
  {
    id: 'oats',
    name: 'Oats (rolled, cooked)',
    category: 'grains',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 39, proteins: 6, fats: 3, fiber: 4, sugar: 1 },
    micros: { iron: 1.5, potassium: 148, magnesium: 42, zinc: 1.5 },
    glycemicIndex: 59,
    glycemicLoad: 23,
    insulinIndex: 40,
    tags: ['breakfast', 'fiber-rich', 'heart-healthy'],
  },
  {
    id: 'quinoa',
    name: 'Quinoa (cooked)',
    category: 'grains',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 34, proteins: 5.5, fats: 2.5, fiber: 3, sugar: 0.5 },
    micros: { iron: 1.5, potassium: 172, magnesium: 64, zinc: 1.5 },
    glycemicIndex: 53,
    glycemicLoad: 18,
    insulinIndex: 35,
    tags: ['complete-protein', 'gluten-free', 'superfood'],
  },
  {
    id: 'pasta',
    name: 'Pasta (whole wheat, cooked)',
    category: 'carbs',
    servingSize: '140',
    servingUnit: 'g',
    macros: { carbohydrates: 52, proteins: 9, fats: 1, fiber: 6, sugar: 2 },
    micros: { iron: 2, potassium: 124, magnesium: 48 },
    glycemicIndex: 50,
    glycemicLoad: 26,
    insulinIndex: 45,
    tags: ['complex-carb', 'post-workout', 'fiber'],
  },
  {
    id: 'sweetPotato',
    name: 'Sweet Potato (baked)',
    category: 'carbs',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 34, proteins: 3, fats: 0.2, fiber: 4, sugar: 6 },
    micros: { vitaminC: 22, vitaminA: 14000, potassium: 450, magnesium: 27 },
    glycemicIndex: 61,
    glycemicLoad: 21,
    insulinIndex: 50,
    tags: ['complex-carb', 'vitamin-a', 'fiber'],
  },
  {
    id: 'breadWhole',
    name: 'Whole Wheat Bread',
    category: 'grains',
    servingSize: '2',
    servingUnit: 'slices',
    macros: { carbohydrates: 30, proteins: 8, fats: 2, fiber: 4, sugar: 3 },
    micros: { iron: 1.5, potassium: 120, magnesium: 30 },
    glycemicIndex: 53,
    glycemicLoad: 16,
    insulinIndex: 45,
    tags: ['staple', 'fiber', 'breakfast'],
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruits',
    servingSize: '1',
    servingUnit: 'medium',
    macros: { carbohydrates: 27, proteins: 1.3, fats: 0.3, fiber: 3, sugar: 14 },
    micros: { vitaminC: 10, potassium: 450, magnesium: 32 },
    glycemicIndex: 51,
    glycemicLoad: 14,
    insulinIndex: 50,
    tags: ['pre-workout', 'potassium', 'portable'],
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'fruits',
    servingSize: '1',
    servingUnit: 'medium',
    macros: { carbohydrates: 25, proteins: 0.5, fats: 0.3, fiber: 4, sugar: 19 },
    micros: { vitaminC: 8, potassium: 195 },
    glycemicIndex: 39,
    glycemicLoad: 10,
    insulinIndex: 30,
    tags: ['snack', 'fiber', 'portable'],
  },
  {
    id: 'berries',
    name: 'Mixed Berries',
    category: 'fruits',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 21, proteins: 2, fats: 0.5, fiber: 5, sugar: 15 },
    micros: { vitaminC: 90, potassium: 230 },
    glycemicIndex: 40,
    glycemicLoad: 8,
    insulinIndex: 25,
    tags: ['antioxidant', 'low-gi', 'snack'],
  },

  // === VEGETABLES ===
  {
    id: 'broccoli',
    name: 'Broccoli (steamed)',
    category: 'vegetables',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 10, proteins: 5, fats: 0.5, fiber: 5, sugar: 2 },
    micros: { vitaminC: 102, calcium: 60, iron: 1, potassium: 460, magnesium: 30 },
    glycemicIndex: 10,
    glycemicLoad: 1,
    insulinIndex: 5,
    tags: ['superfood', 'cruciferous', 'fiber'],
  },
  {
    id: 'asparagus',
    name: 'Asparagus',
    category: 'vegetables',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 6, proteins: 4, fats: 1, fiber: 3, sugar: 2 },
    micros: { vitaminC: 27, iron: 2, potassium: 408, magnesium: 30 },
    glycemicIndex: 15,
    glycemicLoad: 1,
    insulinIndex: 5,
    tags: ['detox', 'diuretic', 'folate'],
  },
  {
    id: 'spinach',
    name: 'Spinach (raw)',
    category: 'vegetables',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 5, proteins: 3, fats: 0.5, fiber: 2, sugar: 0.5 },
    micros: { vitaminC: 28, iron: 3, potassium: 840, magnesium: 157 },
    glycemicIndex: 15,
    glycemicLoad: 1,
    insulinIndex: 3,
    tags: ['leafy-green', 'iron-rich', 'versatile'],
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'fats',
    servingSize: '1',
    servingUnit: 'medium',
    macros: { carbohydrates: 12, proteins: 2, fats: 22, fiber: 10, sugar: 0.5 },
    micros: { vitaminC: 10, potassium: 690, magnesium: 40 },
    glycemicIndex: 15,
    glycemicLoad: 2,
    insulinIndex: 10,
    tags: ['healthy-fats', 'fiber', 'satiating'],
  },

  // === NUTS & SEEDS ===
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'nuts',
    servingSize: '28',
    servingUnit: 'g',
    macros: { carbohydrates: 6, proteins: 6, fats: 14, fiber: 4, sugar: 1 },
    micros: { calcium: 76, iron: 1, magnesium: 76, zinc: 1 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 8,
    tags: ['snack', 'healthy-fats', 'vitamin-e'],
  },
  {
    id: 'peanutButter',
    name: 'Peanut Butter (natural)',
    category: 'nuts',
    servingSize: '32',
    servingUnit: 'g',
    macros: { carbohydrates: 6, proteins: 8, fats: 16, fiber: 2, sugar: 2 },
    micros: { magnesium: 50, potassium: 180, zinc: 1 },
    glycemicIndex: 13,
    glycemicLoad: 1,
    insulinIndex: 15,
    tags: ['spread', 'calorie-dense', 'snack'],
  },
  {
    id: 'chiaSeeds',
    name: 'Chia Seeds',
    category: 'nuts',
    servingSize: '15',
    servingUnit: 'g',
    macros: { carbohydrates: 8, proteins: 3, fats: 7, fiber: 6, sugar: 0 },
    micros: { calcium: 90, iron: 1, magnesium: 50, zinc: 1 },
    glycemicIndex: 1,
    glycemicLoad: 0,
    insulinIndex: 5,
    tags: ['omega-3', 'fiber', 'superfood'],
  },

  // === SUPPLEMENTS ===
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    category: 'supplements',
    servingSize: '5',
    servingUnit: 'g',
    macros: { carbohydrates: 0, proteins: 0, fats: 0, fiber: 0, sugar: 0 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 0,
    tags: ['performance', 'strength', 'recovery'],
  },
  {
    id: 'omega3',
    name: 'Fish Oil (Omega-3)',
    category: 'supplements',
    servingSize: '3',
    servingUnit: 'capsules',
    macros: { carbohydrates: 0, proteins: 0, fats: 3, fiber: 0, sugar: 0 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 0,
    tags: ['inflammation', 'heart-health', 'brain'],
  },
  {
    id: 'multivitamin',
    name: 'Multivitamin',
    category: 'supplements',
    servingSize: '1',
    servingUnit: 'tablet',
    macros: { carbohydrates: 0, proteins: 0, fats: 0, fiber: 0, sugar: 0 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 0,
    tags: ['daily', 'micronutrients', 'maintenance'],
  },

  // === BEVERAGES ===
  {
    id: 'water',
    name: 'Water',
    category: 'beverages',
    servingSize: '250',
    servingUnit: 'ml',
    macros: { carbohydrates: 0, proteins: 0, fats: 0, fiber: 0, sugar: 0 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 0,
    tags: ['hydration', 'essential', 'zero-calorie'],
  },
  {
    id: 'coffee',
    name: 'Black Coffee',
    category: 'beverages',
    servingSize: '240',
    servingUnit: 'ml',
    macros: { carbohydrates: 0, proteins: 0.3, fats: 0, fiber: 0, sugar: 0 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 5,
    tags: ['caffeine', 'focus', 'metabolism'],
  },
  {
    id: 'greenTea',
    name: 'Green Tea',
    category: 'beverages',
    servingSize: '240',
    servingUnit: 'ml',
    macros: { carbohydrates: 0, proteins: 0, fats: 0, fiber: 0, sugar: 0 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 0,
    tags: ['antioxidant', 'metabolism', 'calm'],
  },

  // === ADDITIONAL PROTEINS ===
  {
    id: 'turkeyBreast',
    name: 'Turkey Breast (skinless)',
    category: 'protein',
    servingSize: '100',
    servingUnit: 'g',
    macros: { carbohydrates: 0, proteins: 29, fats: 1.5, fiber: 0, sugar: 0 },
    micros: { vitaminD: 11, iron: 1.2, potassium: 280, magnesium: 30, zinc: 2 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 5,
    tags: ['lean', 'high-protein', 'low-carb'],
  },
  {
    id: 'tuna',
    name: 'Tuna (canned in water)',
    category: 'protein',
    servingSize: '100',
    servingUnit: 'g',
    macros: { carbohydrates: 0, proteins: 28, fats: 1, fiber: 0, sugar: 0 },
    micros: { vitaminD: 80, iron: 1.3, potassium: 300, magnesium: 35, zinc: 0.9 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 3,
    tags: ['lean', 'high-protein', 'omega-3'],
  },
  {
    id: 'shrimp',
    name: 'Shrimp',
    category: 'protein',
    servingSize: '100',
    servingUnit: 'g',
    macros: { carbohydrates: 0, proteins: 24, fats: 0.3, fiber: 0, sugar: 0 },
    micros: { vitaminD: 15, iron: 0.5, potassium: 250, magnesium: 35, zinc: 1.5 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 2,
    tags: ['lean', 'high-protein', 'low-carb'],
  },

  // === ADDITIONAL CARBOHYDRATES ===
  {
    id: 'oatmeal',
    name: 'Oatmeal (rolled oats, cooked)',
    category: 'grains',
    servingSize: '234',
    servingUnit: 'g',
    macros: { carbohydrates: 32, proteins: 6, fats: 3, fiber: 4, sugar: 1 },
    micros: { magnesium: 63, potassium: 280, iron: 1.1, zinc: 2.3 },
    glycemicIndex: 55,
    glycemicLoad: 13,
    insulinIndex: 45,
    tags: ['complex-carb', 'fiber', 'heart-healthy'],
  },
  {
    id: 'brownRice',
    name: 'Brown Rice (cooked)',
    category: 'grains',
    servingSize: '195',
    servingUnit: 'g',
    macros: { carbohydrates: 45, proteins: 5, fats: 1.8, fiber: 3.5, sugar: 1 },
    micros: { magnesium: 80, potassium: 150, iron: 0.8, zinc: 1.2 },
    glycemicIndex: 68,
    glycemicLoad: 20,
    insulinIndex: 65,
    tags: ['complex-carb', 'fiber', 'gluten-free'],
  },

  // === ADDITIONAL VEGETABLES ===
  {
    id: 'bellPeppers',
    name: 'Bell Peppers (mixed colors)',
    category: 'vegetables',
    servingSize: '120',
    servingUnit: 'g',
    macros: { carbohydrates: 6, proteins: 1, fats: 0.2, fiber: 2, sugar: 4 },
    micros: { vitaminA: 3100, vitaminC: 120, potassium: 210 },
    glycemicIndex: 40,
    glycemicLoad: 2,
    insulinIndex: 8,
    tags: ['vitamin-c', 'vitamin-a', 'antioxidant'],
  },

  // === ADDITIONAL FRUITS ===
  {
    id: 'blueberries',
    name: 'Blueberries',
    category: 'fruits',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 21, proteins: 1, fats: 0.3, fiber: 3.5, sugar: 15 },
    micros: { vitaminC: 14, vitaminK: 28, potassium: 110 },
    glycemicIndex: 53,
    glycemicLoad: 6,
    insulinIndex: 30,
    tags: ['antioxidant', 'berry', 'brain-health'],
  },
  {
    id: 'strawberries',
    name: 'Strawberries',
    category: 'fruits',
    servingSize: '150',
    servingUnit: 'g',
    macros: { carbohydrates: 11, proteins: 1, fats: 0.3, fiber: 3, sugar: 7 },
    micros: { vitaminC: 90, potassium: 220 },
    glycemicIndex: 40,
    glycemicLoad: 3,
    insulinIndex: 20,
    tags: ['antioxidant', 'berry', 'vitamin-c'],
  },

  // === ADDITIONAL NUTS ===
  {
    id: 'walnuts',
    name: 'Walnuts',
    category: 'nuts',
    servingSize: '28',
    servingUnit: 'g',
    macros: { carbohydrates: 4, proteins: 4, fats: 18, fiber: 2, sugar: 1 },
    micros: { magnesium: 45, potassium: 125, zinc: 1.5 },
    glycemicIndex: 0,
    glycemicLoad: 0,
    insulinIndex: 3,
    tags: ['healthy-fat', 'omega-3', 'brain-health'],
  },
];

// Search and filter functions
export function searchFoods(query: string): Food[] {
  const q = query.toLowerCase();
  return FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(q) ||
    food.tags.some(tag => tag.toLowerCase().includes(q)) ||
    food.category.toLowerCase().includes(q)
  );
}

export function getFoodsByCategory(category: FoodCategory): Food[] {
  return FOOD_DATABASE.filter(food => food.category === category);
}

export function getFoodsByTag(tag: string): Food[] {
  return FOOD_DATABASE.filter(food =>
    food.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function getLowGIFoods(): Food[] {
  return FOOD_DATABASE.filter(food => food.glycemicIndex < 55 && food.glycemicIndex > 0);
}

export function getHighProteinFoods(): Food[] {
  return FOOD_DATABASE.filter(food =>
    (food.macros.proteins / (food.macros.carbohydrates + food.macros.fats + 1)) > 0.3
  );
}

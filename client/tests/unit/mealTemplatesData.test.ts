// ============================================================================
// METABOLIC SIMULATOR - MEAL TEMPLATES DATA UNIT TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  MEAL_TEMPLATES,
  MEAL_TEMPLATE_CATEGORIES,
  getMealTemplatesByCategory,
  searchMealTemplates,
  getHighProteinTemplates,
  getLowCarbTemplates,
  getQuickTemplates,
  getMealTemplateById,
  type MealTemplate,
  type MealTemplateCategory,
} from '../../src/data/mealTemplates';

describe('MEAL_TEMPLATE_CATEGORIES', () => {
  it('should have all required categories', () => {
    const categoryIds = MEAL_TEMPLATE_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('all');
    expect(categoryIds).toContain('breakfast');
    expect(categoryIds).toContain('post-workout');
    expect(categoryIds).toContain('lunch');
    expect(categoryIds).toContain('dinner');
    expect(categoryIds).toContain('snack');
    expect(categoryIds).toContain('high-protein');
    expect(categoryIds).toContain('low-carb');
    expect(categoryIds).toContain('vegetarian');
  });

  it('should have unique category IDs', () => {
    const ids = MEAL_TEMPLATE_CATEGORIES.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have icons for all categories', () => {
    MEAL_TEMPLATE_CATEGORIES.forEach(category => {
      expect(category.icon).toBeTruthy();
      expect(category.icon.length).toBeGreaterThan(0);
    });
  });
});

describe('MEAL_TEMPLATES', () => {
  it('should have at least 10 templates', () => {
    expect(MEAL_TEMPLATES.length).toBeGreaterThanOrEqual(10);
  });

  it('should have unique template IDs', () => {
    const ids = MEAL_TEMPLATES.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique template names', () => {
    const names = MEAL_TEMPLATES.map(t => t.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should have valid categories for all templates', () => {
    const validCategoryIds = MEAL_TEMPLATE_CATEGORIES.map(c => c.id);
    MEAL_TEMPLATES.forEach(template => {
      expect(validCategoryIds).toContain(template.category);
    });
  });

  it('should have emojis for all templates', () => {
    MEAL_TEMPLATES.forEach(template => {
      expect(template.emoji).toBeTruthy();
      expect(template.emoji.length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty descriptions', () => {
    MEAL_TEMPLATES.forEach(template => {
      expect(template.description.trim().length).toBeGreaterThan(0);
    });
  });

  it('should have prep times', () => {
    MEAL_TEMPLATES.forEach(template => {
      expect(template.prepTime).toBeTruthy();
      expect(template.prepTime.length).toBeGreaterThan(0);
    });
  });

  it('should have at least one item', () => {
    MEAL_TEMPLATES.forEach(template => {
      expect(template.items.length).toBeGreaterThan(0);
    });
  });

  it('should have at least one tag', () => {
    MEAL_TEMPLATES.forEach(template => {
      expect(template.tags.length).toBeGreaterThan(0);
    });
  });

  it('should have valid total macros', () => {
    MEAL_TEMPLATES.forEach(template => {
      expect(template.totalMacros.carbohydrates).toBeGreaterThanOrEqual(0);
      expect(template.totalMacros.proteins).toBeGreaterThanOrEqual(0);
      expect(template.totalMacros.fats).toBeGreaterThanOrEqual(0);
      expect(template.totalMacros.fiber).toBeGreaterThanOrEqual(0);
      expect(template.totalMacros.sugar).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have calorie count', () => {
    MEAL_TEMPLATES.forEach(template => {
      expect(template.calories).toBeGreaterThan(0);
      // Calories should roughly equal 4*C + 4*P + 9*F
      const calculatedCalories =
        template.totalMacros.carbohydrates * 4 +
        template.totalMacros.proteins * 4 +
        template.totalMacros.fats * 9;
      // Allow for some rounding differences (within 10 calories)
      expect(Math.abs(template.calories - calculatedCalories)).toBeLessThanOrEqual(10);
    });
  });

  it('should have glycemic load', () => {
    MEAL_TEMPLATES.forEach(template => {
      expect(template.glycemicLoad).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('getMealTemplatesByCategory', () => {
  it('should return all templates when category is all', () => {
    const templates = getMealTemplatesByCategory('all');
    expect(templates.length).toBe(MEAL_TEMPLATES.length);
  });

  it('should return breakfast templates', () => {
    const templates = getMealTemplatesByCategory('breakfast');
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.category).toBe('breakfast');
    });
  });

  it('should return post-workout templates', () => {
    const templates = getMealTemplatesByCategory('post-workout');
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.category).toBe('post-workout');
    });
  });

  it('should return lunch templates', () => {
    const templates = getMealTemplatesByCategory('lunch');
    templates.forEach(t => {
      expect(t.category).toBe('lunch');
    });
  });

  it('should return dinner templates', () => {
    const templates = getMealTemplatesByCategory('dinner');
    templates.forEach(t => {
      expect(t.category).toBe('dinner');
    });
  });

  it('should return snack templates', () => {
    const templates = getMealTemplatesByCategory('snack');
    templates.forEach(t => {
      expect(t.category).toBe('snack');
    });
  });

  it('should return high-protein templates', () => {
    const templates = getMealTemplatesByCategory('high-protein');
    templates.forEach(t => {
      expect(t.category).toBe('high-protein');
    });
  });

  it('should return low-carb templates', () => {
    const templates = getMealTemplatesByCategory('low-carb');
    templates.forEach(t => {
      expect(t.category).toBe('low-carb');
    });
  });

  it('should return vegetarian templates', () => {
    const templates = getMealTemplatesByCategory('vegetarian');
    templates.forEach(t => {
      expect(t.category).toBe('vegetarian');
    });
  });

  it('should return empty array for unknown category', () => {
    const templates = getMealTemplatesByCategory('unknown' as MealTemplateCategory);
    expect(templates).toEqual([]);
  });
});

describe('searchMealTemplates', () => {
  it('should find templates by name', () => {
    const results = searchMealTemplates('chicken');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(t => {
      expect(t.name.toLowerCase()).toContain('chicken');
    });
  });

  it('should find templates by description', () => {
    const results = searchMealTemplates('omega-3');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find templates by tags', () => {
    const results = searchMealTemplates('high-protein');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should be case insensitive', () => {
    const lowerResults = searchMealTemplates('chicken');
    const upperResults = searchMealTemplates('CHICKEN');
    expect(lowerResults.length).toBe(upperResults.length);
  });

  it('should return empty array for no matches', () => {
    const results = searchMealTemplates('xyznonexistent123');
    expect(results).toEqual([]);
  });

  it('should return all templates for empty query', () => {
    const results = searchMealTemplates('');
    expect(results.length).toBe(MEAL_TEMPLATES.length);
  });
});

describe('getHighProteinTemplates', () => {
  it('should return templates with 30g+ protein', () => {
    const templates = getHighProteinTemplates();
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.totalMacros.proteins).toBeGreaterThanOrEqual(30);
    });
  });

  it('should return fewer templates than total', () => {
    const highProtein = getHighProteinTemplates();
    expect(highProtein.length).toBeLessThanOrEqual(MEAL_TEMPLATES.length);
  });
});

describe('getLowCarbTemplates', () => {
  it('should return templates with 30g or less carbs', () => {
    const templates = getLowCarbTemplates();
    templates.forEach(t => {
      expect(t.totalMacros.carbohydrates).toBeLessThanOrEqual(30);
    });
  });

  it('should return fewer templates than total', () => {
    const lowCarb = getLowCarbTemplates();
    expect(lowCarb.length).toBeLessThanOrEqual(MEAL_TEMPLATES.length);
  });
});

describe('getQuickTemplates', () => {
  it('should return templates with 10 min or less prep time', () => {
    const templates = getQuickTemplates();
    templates.forEach(t => {
      const minutesMatch = t.prepTime.match(/(\d+)\s*min/);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        expect(minutes).toBeLessThanOrEqual(10);
      }
    });
  });

  it('should return fewer templates than total', () => {
    const quick = getQuickTemplates();
    expect(quick.length).toBeLessThanOrEqual(MEAL_TEMPLATES.length);
  });
});

describe('getMealTemplateById', () => {
  it('should return template by ID', () => {
    const template = getMealTemplateById('power-breakfast');
    expect(template).toBeDefined();
    expect(template?.id).toBe('power-breakfast');
  });

  it('should return undefined for non-existent ID', () => {
    const template = getMealTemplateById('non-existent');
    expect(template).toBeUndefined();
  });

  it('should return correct template for each ID', () => {
    MEAL_TEMPLATES.forEach(template => {
      const found = getMealTemplateById(template.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(template.id);
      expect(found?.name).toBe(template.name);
    });
  });
});

describe('Specific template validations', () => {
  it('should have valid Power Breakfast Bowl data', () => {
    const template = getMealTemplateById('power-breakfast');
    expect(template?.name).toBe('Power Breakfast Bowl');
    expect(template?.category).toBe('breakfast');
    expect(template?.totalMacros.proteins).toBeGreaterThanOrEqual(30);
  });

  it('should have valid Post-Workout Recovery Shake data', () => {
    const template = getMealTemplateById('post-workout-shake');
    expect(template?.name).toBe('Post-Workout Recovery Shake');
    expect(template?.category).toBe('post-workout');
    expect(template?.tags).toContain('post-workout');
  });

  it('should have valid Chicken & Rice Bowl data', () => {
    const template = getMealTemplateById('chicken-rice-bowl');
    expect(template?.name).toBe('Chicken & Rice Bowl');
    expect(template?.category).toBe('lunch');
  });

  it('should have valid Salmon & Sweet Potato data', () => {
    const template = getMealTemplateById('salmon-sweet-potato');
    expect(template?.name).toBe('Salmon & Sweet Potato');
    expect(template?.category).toBe('dinner');
  });

  it('should have valid Vegan Power Bowl data', () => {
    const template = getMealTemplateById('vegan-power-bowl');
    expect(template?.name).toBe('Vegan Power Bowl');
    expect(template?.category).toBe('vegetarian');
    expect(template?.tags).toContain('vegan');
  });
});

describe('Template items', () => {
  it('should have valid food IDs in items', () => {
    // Valid food IDs from the food database
    const validFoodIds = [
      'eggs', 'oatmeal', 'oats', 'berries', 'wheyProtein', 'banana', 'peanutButter',
      'chickenBreast', 'riceBrown', 'broccoli', 'salmon', 'sweetPotato',
      'asparagus', 'greekYogurt', 'leanBeef', 'avocado', 'tuna', 'spinach',
      'quinoa', 'tofu', 'bellPeppers', 'almonds', 'walnuts', 'chiaSeeds',
      'strawberries', 'blueberries',
    ];

    MEAL_TEMPLATES.forEach(template => {
      template.items.forEach(item => {
        expect(validFoodIds).toContain(item.foodId);
        expect(item.servings).toBeGreaterThan(0);
      });
    });
  });

  it('should have valid serving sizes', () => {
    MEAL_TEMPLATES.forEach(template => {
      template.items.forEach(item => {
        expect(item.servings).toBeGreaterThan(0);
        // Servings can be fractional (0.5, 1.5, etc.)
        expect(typeof item.servings).toBe('number');
      });
    });
  });
});

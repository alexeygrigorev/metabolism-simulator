// ============================================================================
// METABOLIC SIMULATOR - WORKOUT TEMPLATES DATA UNIT TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  WORKOUT_TEMPLATES,
  WORKOUT_TEMPLATE_CATEGORIES,
  getWorkoutTemplatesByCategory,
  searchWorkoutTemplates,
  getWorkoutsByDifficulty,
  getQuickWorkouts,
  getWorkoutTemplateById,
  type WorkoutTemplate,
  type WorkoutTemplateCategory,
} from '../../src/data/workoutTemplates';

describe('WORKOUT_TEMPLATE_CATEGORIES', () => {
  it('should have all required categories', () => {
    const categoryIds = WORKOUT_TEMPLATE_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('all');
    expect(categoryIds).toContain('full-body');
    expect(categoryIds).toContain('upper-body');
    expect(categoryIds).toContain('lower-body');
    expect(categoryIds).toContain('cardio');
    expect(categoryIds).toContain('hiit');
    expect(categoryIds).toContain('strength');
    expect(categoryIds).toContain('flexibility');
    expect(categoryIds).toContain('quick');
  });

  it('should have unique category IDs', () => {
    const ids = WORKOUT_TEMPLATE_CATEGORIES.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have icons for all categories', () => {
    WORKOUT_TEMPLATE_CATEGORIES.forEach(category => {
      expect(category.icon).toBeTruthy();
      expect(category.icon.length).toBeGreaterThan(0);
    });
  });
});

describe('WORKOUT_TEMPLATES', () => {
  it('should have at least 10 templates', () => {
    expect(WORKOUT_TEMPLATES.length).toBeGreaterThanOrEqual(10);
  });

  it('should have unique template IDs', () => {
    const ids = WORKOUT_TEMPLATES.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique template names', () => {
    const names = WORKOUT_TEMPLATES.map(t => t.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should have valid categories for all templates', () => {
    const validCategoryIds = WORKOUT_TEMPLATE_CATEGORIES.map(c => c.id);
    WORKOUT_TEMPLATES.forEach(template => {
      expect(validCategoryIds).toContain(template.category);
    });
  });

  it('should have emojis for all templates', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      expect(template.emoji).toBeTruthy();
      expect(template.emoji.length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty descriptions', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      expect(template.description.trim().length).toBeGreaterThan(0);
    });
  });

  it('should have at least one exercise', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      expect(template.exercises.length).toBeGreaterThan(0);
    });
  });

  it('should have at least one primary muscle', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      expect(template.primaryMuscles.length).toBeGreaterThan(0);
    });
  });

  it('should have at least one tag', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      expect(template.tags.length).toBeGreaterThan(0);
    });
  });

  it('should have valid difficulty levels', () => {
    const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
    WORKOUT_TEMPLATES.forEach(template => {
      expect(validDifficulties).toContain(template.difficulty);
    });
  });

  it('should have positive calorie burn estimates', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      expect(template.caloriesBurned).toBeGreaterThan(0);
    });
  });

  it('should have positive duration', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      expect(template.totalDuration).toBeGreaterThan(0);
    });
  });

  it('should have valid exercise durations', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      template.exercises.forEach(exercise => {
        expect(exercise.duration).toBeGreaterThan(0);
      });
    });
  });

  it('should have exercise IDs as strings', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      template.exercises.forEach(exercise => {
        expect(typeof exercise.exerciseId).toBe('string');
        expect(exercise.exerciseId.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('getWorkoutTemplatesByCategory', () => {
  it('should return all templates when category is all', () => {
    const templates = getWorkoutTemplatesByCategory('all');
    expect(templates.length).toBe(WORKOUT_TEMPLATES.length);
  });

  it('should return full-body templates', () => {
    const templates = getWorkoutTemplatesByCategory('full-body');
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.category).toBe('full-body');
    });
  });

  it('should return upper-body templates', () => {
    const templates = getWorkoutTemplatesByCategory('upper-body');
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.category).toBe('upper-body');
    });
  });

  it('should return lower-body templates', () => {
    const templates = getWorkoutTemplatesByCategory('lower-body');
    templates.forEach(t => {
      expect(t.category).toBe('lower-body');
    });
  });

  it('should return cardio templates', () => {
    const templates = getWorkoutTemplatesByCategory('cardio');
    templates.forEach(t => {
      expect(t.category).toBe('cardio');
    });
  });

  it('should return hiit templates', () => {
    const templates = getWorkoutTemplatesByCategory('hiit');
    templates.forEach(t => {
      expect(t.category).toBe('hiit');
    });
  });

  it('should return strength templates', () => {
    const templates = getWorkoutTemplatesByCategory('strength');
    templates.forEach(t => {
      expect(t.category).toBe('strength');
    });
  });

  it('should return flexibility templates', () => {
    const templates = getWorkoutTemplatesByCategory('flexibility');
    templates.forEach(t => {
      expect(t.category).toBe('flexibility');
    });
  });

  it('should return quick templates', () => {
    const templates = getWorkoutTemplatesByCategory('quick');
    templates.forEach(t => {
      expect(t.category).toBe('quick');
    });
  });

  it('should return empty array for unknown category', () => {
    const templates = getWorkoutTemplatesByCategory('unknown' as WorkoutTemplateCategory);
    expect(templates).toEqual([]);
  });
});

describe('searchWorkoutTemplates', () => {
  it('should find templates by name', () => {
    const results = searchWorkoutTemplates('full body');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(t => {
      expect(t.name.toLowerCase()).toContain('full body');
    });
  });

  it('should find templates by description', () => {
    const results = searchWorkoutTemplates('fat loss');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find templates by tags', () => {
    const results = searchWorkoutTemplates('beginner');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should be case insensitive', () => {
    const lowerResults = searchWorkoutTemplates('legs');
    const upperResults = searchWorkoutTemplates('LEGS');
    expect(lowerResults.length).toBe(upperResults.length);
  });

  it('should return empty array for no matches', () => {
    const results = searchWorkoutTemplates('xyznonexistent123');
    expect(results).toEqual([]);
  });

  it('should return all templates for empty query', () => {
    const results = searchWorkoutTemplates('');
    expect(results.length).toBe(WORKOUT_TEMPLATES.length);
  });
});

describe('getWorkoutsByDifficulty', () => {
  it('should return beginner workouts', () => {
    const templates = getWorkoutsByDifficulty('Beginner');
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.difficulty).toBe('Beginner');
    });
  });

  it('should return intermediate workouts', () => {
    const templates = getWorkoutsByDifficulty('Intermediate');
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.difficulty).toBe('Intermediate');
    });
  });

  it('should return advanced workouts', () => {
    const templates = getWorkoutsByDifficulty('Advanced');
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.difficulty).toBe('Advanced');
    });
  });
});

describe('getQuickWorkouts', () => {
  it('should return workouts 20 minutes or less', () => {
    const templates = getQuickWorkouts();
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => {
      expect(t.totalDuration).toBeLessThanOrEqual(20);
    });
  });

  it('should return fewer templates than total', () => {
    const quick = getQuickWorkouts();
    expect(quick.length).toBeLessThanOrEqual(WORKOUT_TEMPLATES.length);
  });
});

describe('getWorkoutTemplateById', () => {
  it('should return template by ID', () => {
    const template = getWorkoutTemplateById('full-body-beginner');
    expect(template).toBeDefined();
    expect(template?.id).toBe('full-body-beginner');
  });

  it('should return undefined for non-existent ID', () => {
    const template = getWorkoutTemplateById('non-existent');
    expect(template).toBeUndefined();
  });

  it('should return correct template for each ID', () => {
    WORKOUT_TEMPLATES.forEach(template => {
      const found = getWorkoutTemplateById(template.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(template.id);
      expect(found?.name).toBe(template.name);
    });
  });
});

describe('Specific template validations', () => {
  it('should have valid Full Body Beginner data', () => {
    const template = getWorkoutTemplateById('full-body-beginner');
    expect(template?.name).toBe('Full Body Beginner');
    expect(template?.category).toBe('full-body');
    expect(template?.difficulty).toBe('Beginner');
  });

  it('should have valid Upper Body Strength data', () => {
    const template = getWorkoutTemplateById('upper-body-strength');
    expect(template?.name).toBe('Upper Body Strength');
    expect(template?.category).toBe('upper-body');
    expect(template?.difficulty).toBe('Intermediate');
  });

  it('should have valid Lower Body Power data', () => {
    const template = getWorkoutTemplateById('lower-body-power');
    expect(template?.name).toBe('Lower Body Power');
    expect(template?.category).toBe('lower-body');
    expect(template?.difficulty).toBe('Advanced');
  });

  it('should have valid HIIT Cardio Blast data', () => {
    const template = getWorkoutTemplateById('hiit-cardio-blast');
    expect(template?.name).toBe('HIIT Cardio Blast');
    expect(template?.category).toBe('hiit');
    expect(template?.tags).toContain('fat-loss');
  });

  it('should have valid Quick Morning Wake-Up data', () => {
    const template = getWorkoutTemplateById('quick-morning');
    expect(template?.name).toBe('Quick Morning Wake-Up');
    expect(template?.category).toBe('quick');
    expect(template?.totalDuration).toBeLessThanOrEqual(20);
  });
});

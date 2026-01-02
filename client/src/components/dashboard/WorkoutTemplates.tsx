// ============================================================================
// METABOLIC SIMULATOR - WORKOUT TEMPLATES COMPONENT
// ============================================================================

import { useState, useMemo, memo } from 'react';
import { useSimulationStore } from '../../state/store';
import {
  WORKOUT_TEMPLATES,
  WORKOUT_TEMPLATE_CATEGORIES,
  getWorkoutTemplatesByCategory,
  searchWorkoutTemplates,
  getWorkoutsByDifficulty,
  getQuickWorkouts,
  type WorkoutTemplate,
  type WorkoutTemplateCategory,
} from '../../data/workoutTemplates';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';

interface WorkoutTemplatesProps {
  className?: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'from-green-500 to-emerald-400',
  Intermediate: 'from-yellow-500 to-amber-400',
  Advanced: 'from-red-500 to-orange-400',
};

const CATEGORY_COLORS: Record<string, string> = {
  'full-body': 'from-blue-500 to-indigo-400',
  'upper-body': 'from-purple-500 to-violet-400',
  'lower-body': 'from-cyan-500 to-teal-400',
  'cardio': 'from-rose-500 to-pink-400',
  'hiit': 'from-orange-500 to-red-400',
  'strength': 'from-slate-500 to-zinc-400',
  'flexibility': 'from-lime-500 to-green-400',
  'quick': 'from-sky-500 to-blue-400',
};

const TemplateCard = memo(function TemplateCard({
  template,
  onLog,
  isLogging,
}: {
  template: WorkoutTemplate;
  onLog: (template: WorkoutTemplate) => void;
  isLogging: boolean;
}) {
  const categoryGradient = CATEGORY_COLORS[template.category] || 'from-slate-500 to-slate-400';
  const difficultyGradient = DIFFICULTY_COLORS[template.difficulty];

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-slate-600 transition-all group">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${categoryGradient} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{template.emoji}</span>
            <div>
              <h3 className="font-semibold text-white">{template.name}</h3>
              <p className="text-xs text-white/80">{template.description}</p>
            </div>
          </div>
          <button
            onClick={() => onLog(template)}
            disabled={isLogging}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-white/50 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
            title={`Log ${template.name}`}
          >
            {isLogging ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Logging...</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>Log</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <span>⏱️</span>
            <span>{template.totalDuration} min</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>🔥</span>
            <span>{template.caloriesBurned} cal</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${difficultyGradient} text-white`}
            >
              {template.difficulty}
            </span>
          </div>
        </div>

        {/* Exercise count */}
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
          <span>🏋️</span>
          <span>{template.exercises.length} exercises</span>
          <span>•</span>
          <span>{template.primaryMuscles.join(', ')}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

const WorkoutTemplates = memo(function WorkoutTemplates({ className = '' }: WorkoutTemplatesProps) {
  const { logExercise, addToast } = useSimulationStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLogging, setIsLogging] = useState(false);

  // Filter templates based on search, category, and filters
  const filteredTemplates = useMemo(() => {
    let templates = searchQuery ? searchWorkoutTemplates(searchQuery) : WORKOUT_TEMPLATES;

    if (activeCategory !== 'all') {
      templates = getWorkoutTemplatesByCategory(activeCategory as WorkoutTemplateCategory);
    }

    if (activeFilter === 'beginner') {
      templates = getWorkoutsByDifficulty('Beginner').filter(t =>
        activeCategory === 'all' || t.category === activeCategory
      );
    } else if (activeFilter === 'intermediate') {
      templates = getWorkoutsByDifficulty('Intermediate').filter(t =>
        activeCategory === 'all' || t.category === activeCategory
      );
    } else if (activeFilter === 'advanced') {
      templates = getWorkoutsByDifficulty('Advanced').filter(t =>
        activeCategory === 'all' || t.category === activeCategory
      );
    } else if (activeFilter === 'quick') {
      templates = getQuickWorkouts().filter(t =>
        activeCategory === 'all' || t.category === activeCategory
      );
    }

    return templates;
  }, [searchQuery, activeCategory, activeFilter]);

  const handleLogTemplate = async (template: WorkoutTemplate) => {
    setIsLogging(true);

    // Log each exercise in the template
    for (const exercise of template.exercises) {
      const exerciseData = EXERCISE_DATABASE.find(e => e.id === exercise.exerciseId);
      if (exerciseData) {
        await logExercise({
          id: `template-${template.id}-${exercise.exerciseId}-${Date.now()}`,
          exerciseId: exercise.exerciseId,
          exerciseName: exerciseData.name,
          category: exerciseData.category,
          duration: exercise.duration,
          timestamp: new Date().toISOString(),
          intensity: template.difficulty === 'Beginner' ? 'low' : template.difficulty === 'Advanced' ? 'high' : 'moderate',
        });
      }
    }

    addToast(`Logged ${template.name}`, 'success');
    setIsLogging(false);
  };

  return (
    <div className={`bg-slate-800/50 rounded-lg border border-slate-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏋️</span>
          <h2 className="text-lg font-semibold text-white">Workout Templates</h2>
        </div>
        <span className="text-xs text-slate-500">{filteredTemplates.length} templates</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search workout templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
        {WORKOUT_TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500">Quick filters:</span>
        <button
          onClick={() => setActiveFilter(activeFilter === 'all' ? '' : 'all')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            activeFilter === 'all'
              ? 'bg-green-600/30 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'beginner' ? '' : 'beginner')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            activeFilter === 'beginner'
              ? 'bg-green-600/30 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          Beginner
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'intermediate' ? '' : 'intermediate')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            activeFilter === 'intermediate'
              ? 'bg-green-600/30 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          Intermediate
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'advanced' ? '' : 'advanced')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            activeFilter === 'advanced'
              ? 'bg-green-600/30 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          Advanced
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'quick' ? '' : 'quick')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            activeFilter === 'quick'
              ? 'bg-green-600/30 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          Quick (&lt;20min)
        </button>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No workout templates found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onLog={handleLogTemplate}
              isLogging={isLogging}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default WorkoutTemplates;

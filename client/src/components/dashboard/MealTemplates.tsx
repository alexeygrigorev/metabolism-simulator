// ============================================================================
// METABOLIC SIMULATOR - MEAL TEMPLATES COMPONENT
// ============================================================================

import { useState, useMemo, memo } from 'react';
import { useSimulationStore } from '../../state/store';
import {
  MEAL_TEMPLATES,
  MEAL_TEMPLATE_CATEGORIES,
  getMealTemplatesByCategory,
  searchMealTemplates,
  getHighProteinTemplates,
  getLowCarbTemplates,
  getQuickTemplates,
  type MealTemplate,
  type MealTemplateCategory,
} from '../../data/mealTemplates';
import { FOOD_DATABASE } from '../../data/foodDatabase';

interface MealTemplatesProps {
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  breakfast: 'from-amber-500 to-orange-400',
  'post-workout': 'from-green-500 to-emerald-400',
  lunch: 'from-yellow-500 to-amber-400',
  dinner: 'from-indigo-500 to-purple-400',
  snack: 'from-pink-500 to-rose-400',
  'high-protein': 'from-red-500 to-orange-400',
  'low-carb': 'from-teal-500 to-cyan-400',
  vegetarian: 'from-green-500 to-lime-400',
};

const MacroBar = memo(function MacroBar({
  carbs,
  proteins,
  fats,
}: {
  carbs: number;
  proteins: number;
  fats: number;
}) {
  const total = carbs + proteins + fats;
  const carbsPercent = total > 0 ? (carbs / total) * 100 : 0;
  const proteinsPercent = total > 0 ? (proteins / total) * 100 : 0;
  const fatsPercent = total > 0 ? (fats / total) * 100 : 0;

  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-slate-700">
      <div
        className="bg-amber-500 transition-all duration-300"
        style={{ width: `${carbsPercent}%` }}
        title={`Carbs: ${carbs}g`}
      />
      <div
        className="bg-red-500 transition-all duration-300"
        style={{ width: `${proteinsPercent}%` }}
        title={`Protein: ${proteins}g`}
      />
      <div
        className="bg-yellow-500 transition-all duration-300"
        style={{ width: `${fatsPercent}%` }}
        title={`Fat: ${fats}g`}
      />
    </div>
  );
});

const TemplateCard = memo(function TemplateCard({
  template,
  onLog,
  isLogging,
}: {
  template: MealTemplate;
  onLog: (template: MealTemplate) => void;
  isLogging: boolean;
}) {
  const gradient = CATEGORY_COLORS[template.category] || 'from-slate-500 to-slate-400';

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-slate-600 transition-all group">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
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
        {/* Macros */}
        <div className="mb-3">
          <MacroBar
            carbs={template.totalMacros.carbohydrates}
            proteins={template.totalMacros.proteins}
            fats={template.totalMacros.fats}
          />
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-amber-400">C: {template.totalMacros.carbohydrates}g</span>
            <span className="text-red-400">P: {template.totalMacros.proteins}g</span>
            <span className="text-yellow-400">F: {template.totalMacros.fats}g</span>
            <span className="text-blue-400 font-medium">{template.calories} cal</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{template.prepTime}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>📊</span>
            <span>GL: {template.glycemicLoad}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🌾</span>
            <span>Fiber: {template.totalMacros.fiber}g</span>
          </span>
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

const MealTemplates = memo(function MealTemplates({ className = '' }: MealTemplatesProps) {
  const { logMeal, addToast } = useSimulationStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLogging, setIsLogging] = useState(false);

  // Filter templates based on search, category, and filters
  const filteredTemplates = useMemo(() => {
    let templates = searchQuery ? searchMealTemplates(searchQuery) : MEAL_TEMPLATES;

    if (activeCategory !== 'all') {
      templates = getMealTemplatesByCategory(activeCategory as MealTemplateCategory);
    }

    if (activeFilter === 'high-protein') {
      templates = getHighProteinTemplates().filter(t =>
        activeCategory === 'all' || t.category === activeCategory
      );
    } else if (activeFilter === 'low-carb') {
      templates = getLowCarbTemplates().filter(t =>
        activeCategory === 'all' || t.category === activeCategory
      );
    } else if (activeFilter === 'quick') {
      templates = getQuickTemplates().filter(t =>
        activeCategory === 'all' || t.category === activeCategory
      );
    }

    return templates;
  }, [searchQuery, activeCategory, activeFilter]);

  const handleLogTemplate = async (template: MealTemplate) => {
    setIsLogging(true);

    // Resolve food items
    const items = template.items.map(item => {
      const food = FOOD_DATABASE.find(f => f.id === item.foodId);
      return {
        foodId: item.foodId,
        servings: item.servings,
        ...(food && { foodName: food.name }),
      };
    }).filter((item): item is { foodId: string; servings: number; foodName: string } => !!item.foodName);

    await logMeal({
      id: `template-${template.id}-${Date.now()}`,
      name: template.name,
      time: new Date().toISOString(),
      items: template.items.map(item => ({
        foodId: item.foodId,
        servings: item.servings,
      })),
      totalMacros: {
        carbohydrates: template.totalMacros.carbohydrates,
        proteins: template.totalMacros.proteins,
        fats: template.totalMacros.fats,
        fiber: template.totalMacros.fiber,
        water: 0,
      },
      glycemicLoad: template.glycemicLoad,
      insulinResponse: {
        peak: 30,
        magnitude: template.totalMacros.carbohydrates,
        duration: 120,
        areaUnderCurve: 0,
      },
    });

    addToast(`Logged ${template.name}`, 'success');
    setIsLogging(false);
  };

  return (
    <div className={`bg-slate-800/50 rounded-lg border border-slate-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍽️</span>
          <h2 className="text-lg font-semibold text-white">Meal Templates</h2>
        </div>
        <span className="text-xs text-slate-500">{filteredTemplates.length} templates</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search meal templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
        {MEAL_TEMPLATE_CATEGORIES.map(cat => (
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
          onClick={() => setActiveFilter(activeFilter === 'high-protein' ? '' : 'high-protein')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            activeFilter === 'high-protein'
              ? 'bg-green-600/30 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          High Protein (30g+)
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'low-carb' ? '' : 'low-carb')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            activeFilter === 'low-carb'
              ? 'bg-green-600/30 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          Low Carb (&lt;30g)
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'quick' ? '' : 'quick')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            activeFilter === 'quick'
              ? 'bg-green-600/30 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          Quick (&lt;10min)
        </button>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No meal templates found matching "{searchQuery}"
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

export default MealTemplates;

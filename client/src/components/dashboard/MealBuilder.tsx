// ============================================================================
// METABOLIC SIMULATOR - ENHANCED MEAL BUILDER COMPONENT
// ============================================================================

import { useState, useMemo, memo, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../state/store';
import {
  Food,
  FoodCategory,
  searchFoods,
  getFoodsByCategory,
  getLowGIFoods,
  getHighProteinFoods,
  FOOD_DATABASE
} from '../../data/foodDatabase';

interface MealItem {
  food: Food;
  servings: number;
}

interface MealBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

// Category icons
const CATEGORY_ICONS: Record<FoodCategory, string> = {
  protein: '🥩',
  carbs: '🍚',
  fats: '🥑',
  vegetables: '🥦',
  fruits: '🍎',
  dairy: '🥛',
  nuts: '🥜',
  beverages: '💧',
  grains: '🌾',
  supplements: '💊',
};

const CATEGORY_COLORS: Record<FoodCategory, string> = {
  protein: 'bg-red-500/20 text-red-400 border-red-500/30',
  carbs: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  fats: 'bg-green-500/20 text-green-400 border-green-500/30',
  vegetables: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  fruits: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  dairy: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  nuts: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  beverages: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  grains: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  supplements: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const FoodCard = memo(function FoodCard({
  food,
  isSelected,
  onSelect,
  servings
}: {
  food: Food;
  isSelected: boolean;
  onSelect: () => void;
  servings: number;
}) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-500/20 border-blue-500/50'
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-lg">{CATEGORY_ICONS[food.category]}</span>
            <h4 className="font-medium text-white text-sm truncate">{food.name}</h4>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[food.category]}`}>
              {food.category}
            </span>
            {food.glycemicIndex > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                food.glycemicIndex < 55
                  ? 'bg-green-500/20 text-green-400'
                  : food.glycemicIndex < 70
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                GI: {food.glycemicIndex}
              </span>
            )}
          </div>

          {/* Quick macro info */}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>C: {food.macros.carbohydrates}g</span>
            <span>P: {food.macros.proteins}g</span>
            <span>F: {food.macros.fats}g</span>
          </div>
        </div>

        {isSelected && (
          <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            ✓
          </div>
        )}
      </div>

      {isSelected && servings > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Servings:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(); // Will decrement via parent
                }}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm"
              >
                -
              </button>
              <span className="text-sm font-medium text-white w-6 text-center">{servings}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(); // Will increment via parent
                }}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const MealSummary = memo(function MealSummary({
  items,
  onLogMeal,
  isLogging
}: {
  items: Map<string, { food: Food; servings: number }>;
  onLogMeal: () => void;
  isLogging: boolean;
}) {
  const totals = useMemo(() => {
    let carbs = 0, proteins = 0, fats = 0, fiber = 0, glycemicLoad = 0;

    items.forEach(({ food, servings }) => {
      carbs += food.macros.carbohydrates * servings;
      proteins += food.macros.proteins * servings;
      fats += food.macros.fats * servings;
      fiber += food.macros.fiber * servings;
      glycemicLoad += food.glycemicLoad * servings;
    });

    return { carbs, proteins, fats, fiber, glycemicLoad, calories: carbs * 4 + proteins * 4 + fats * 9 };
  }, [items]);

  if (items.size === 0) return null;

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border-t border-slate-700">
      <h4 className="text-sm font-semibold text-white mb-3">Meal Summary</h4>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-amber-400">{totals.carbs.toFixed(0)}</div>
          <div className="text-xs text-slate-500">Carbs (g)</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{totals.proteins.toFixed(0)}</div>
          <div className="text-xs text-slate-500">Protein (g)</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-400">{totals.fats.toFixed(0)}</div>
          <div className="text-xs text-slate-500">Fat (g)</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">{totals.calories.toFixed(0)}</div>
          <div className="text-xs text-slate-500">Calories</div>
        </div>
      </div>

      <button
        onClick={onLogMeal}
        disabled={isLogging}
        className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded font-medium transition-colors"
      >
        {isLogging ? 'Logging...' : 'Log Meal'}
      </button>
    </div>
  );
});

const MealBuilder = memo(function MealBuilder({ isOpen, onClose }: MealBuilderProps) {
  const { logMeal, addToast } = useSimulationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Map<string, { food: Food; servings: number }>>(new Map());
  const [isLogging, setIsLogging] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Filter foods based on search and category
  const filteredFoods = useMemo(() => {
    let foods = searchQuery ? searchFoods(searchQuery) : FOOD_DATABASE;

    if (activeCategory !== 'all') {
      foods = foods.filter(f => f.category === activeCategory);
    }

    if (activeFilter === 'low-gi') {
      foods = getLowGIFoods().filter(f => activeCategory === 'all' || f.category === activeCategory);
    } else if (activeFilter === 'high-protein') {
      foods = getHighProteinFoods().filter(f => activeCategory === 'all' || f.category === activeCategory);
    }

    return foods;
  }, [searchQuery, activeCategory, activeFilter]);

  const categories: Array<{ value: string; label: string; count: number }> = useMemo(() => {
    const cats = new Map<string, number>();
    cats.set('all', FOOD_DATABASE.length);
    FOOD_DATABASE.forEach(food => {
      cats.set(food.category, (cats.get(food.category) || 0) + 1);
    });
    return Array.from(cats.entries()).map(([value, count]) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1), count }));
  }, []);

  const toggleFood = (food: Food) => {
    const newSelection = new Map(selectedItems);
    if (newSelection.has(food.id)) {
      const existing = newSelection.get(food.id)!;
      if (existing.servings > 1) {
        newSelection.set(food.id, { food, servings: existing.servings - 1 });
      } else {
        newSelection.delete(food.id);
      }
    } else {
      newSelection.set(food.id, { food, servings: 1 });
    }
    setSelectedItems(newSelection);
  };

  const handleLogMeal = async () => {
    if (selectedItems.size === 0) {
      addToast('Please select at least one food item', 'warning');
      return;
    }

    setIsLogging(true);

    const foodsArray = Array.from(selectedItems.values());
    const totalMacros = {
      carbohydrates: foodsArray.reduce((sum, { food, servings }) => sum + food.macros.carbohydrates * servings, 0),
      proteins: foodsArray.reduce((sum, { food, servings }) => sum + food.macros.proteins * servings, 0),
      fats: foodsArray.reduce((sum, { food, servings }) => sum + food.macros.fats * servings, 0),
      fiber: foodsArray.reduce((sum, { food, servings }) => sum + food.macros.fiber * servings, 0),
      water: 0,
    };

    await logMeal({
      id: Date.now().toString(),
      name: `Custom Meal (${selectedItems.size} items)`,
      time: new Date().toISOString(),
      items: foodsArray.map(({ food, servings }) => ({ foodId: food.id, servings })),
      totalMacros,
      glycemicLoad: foodsArray.reduce((sum, { food, servings }) => sum + food.glycemicLoad * servings, 0),
      insulinResponse: { peak: 30, magnitude: totalMacros.carbohydrates, duration: 120, areaUnderCurve: 0 },
    });

    setSelectedItems(new Map());
    setSearchQuery('');
    setIsLogging(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Build Your Meal</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search foods by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All ({FOOD_DATABASE.length})
            </button>
            {categories
              .filter(c => c.value !== 'all')
              .map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                    activeCategory === cat.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat.value as FoodCategory]}</span>
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-70">({cat.count})</span>
                </button>
              ))}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-slate-500">Quick filters:</span>
            <button
              onClick={() => {
                setActiveFilter(activeFilter === 'all' ? '' : 'all');
                if (activeFilter !== 'all') setActiveFilter('all');
              }}
              className={`px-2 py-1 rounded text-xs transition-all ${
                activeFilter === 'all'
                  ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              All Foods
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'low-gi' ? '' : 'low-gi')}
              className={`px-2 py-1 rounded text-xs transition-all ${
                activeFilter === 'low-gi'
                  ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              Low GI
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'high-protein' ? '' : 'high-protein')}
              className={`px-2 py-1 rounded text-xs transition-all ${
                activeFilter === 'high-protein'
                  ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              High Protein
            </button>
          </div>
        </div>

        {/* Food List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredFoods.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No foods found matching "{searchQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  isSelected={selectedItems.has(food.id)}
                  servings={selectedItems.get(food.id)?.servings || 0}
                  onSelect={() => toggleFood(food)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <MealSummary
          items={selectedItems}
          onLogMeal={handleLogMeal}
          isLogging={isLogging}
        />
      </div>
    </div>
  );
});

export default MealBuilder;

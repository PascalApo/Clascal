import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Dices, Search, ChevronRight, Clock, Coffee, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { WeeklyMealOverview } from '@/components/essen/WeeklyMealOverview';
import { useAppData } from '@/context/AppDataContext';
import { useRecipes } from '@/context/RecipesContext';
import { generateBreakfast, generateDinner, filterBreakfastRecipes, filterDinnerRecipes } from '@/lib/recipes';
import { WEEKDAY_FULL, type MealSlot } from '@/types/meal-plan';
import { dateToWeekday } from '@/lib/calendar-utils';
import type { RecipeCategory } from '@/types/recipe';

const CUISINE_LABELS: Record<RecipeCategory, string> = {
  klassiker: 'Klassiker',
  pasta: 'Pasta',
  auflauf: 'Aufläufe',
  pfanne: 'Pfanne',
  wrap: 'Wraps',
  ofen: 'Ofen',
  salat: 'Salate',
  suppe: 'Suppen',
  fruehstueck: 'Frühstück',
};

export function Essen() {
  const { mealPlan, setMealForDay } = useAppData();
  const { recipes, loading, getRecipeById } = useRecipes();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<RecipeCategory | 'all'>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('dinner');

  const todayWeekday = dateToWeekday(new Date());
  const plannedCount = mealPlan.reduce((sum, e) => {
    return sum + (e.breakfastRecipeId ? 1 : 0) + (e.dinnerRecipeId ? 1 : 0);
  }, 0);

  const handleSelectSlot = (day: number, slot: MealSlot) => {
    if (selectedDay === day && selectedSlot === slot) {
      setSelectedDay(null);
      return;
    }
    setSelectedDay(day);
    setSelectedSlot(slot);
    setSearch('');
    setFilterCat('all');
  };

  const handleClearSlot = (day: number, slot: MealSlot) => {
    setMealForDay(day, slot, null);
    if (selectedDay === day && selectedSlot === slot) {
      setSelectedDay(null);
    }
  };

  const assignRecipe = (recipeId: string) => {
    if (selectedDay === null) return;
    setMealForDay(selectedDay, selectedSlot, recipeId);
    setSelectedDay(null);
  };

  const getExcludeIdsForRoll = (): string[] => {
    if (selectedDay === null) return [];
    const entry = mealPlan.find((m) => m.weekday === selectedDay);
    const currentId =
      selectedSlot === 'breakfast' ? entry?.breakfastRecipeId : entry?.dinnerRecipeId;

    const otherDays = mealPlan
      .filter((m) => m.weekday !== selectedDay)
      .map((m) => (selectedSlot === 'breakfast' ? m.breakfastRecipeId : m.dinnerRecipeId))
      .filter((id): id is string => Boolean(id));

    return currentId ? [...otherDays, currentId] : otherDays;
  };

  const handleDice = () => {
    if (selectedDay === null) return;
    const recipe =
      selectedSlot === 'breakfast'
        ? generateBreakfast(recipes, getExcludeIdsForRoll())
        : generateDinner(recipes, getExcludeIdsForRoll());
    if (!recipe) return;
    setMealForDay(selectedDay, selectedSlot, recipe.id);
    setSelectedDay(null);
  };

  const slotRecipes = useMemo(() => {
    const base =
      selectedSlot === 'breakfast'
        ? filterBreakfastRecipes(recipes)
        : filterDinnerRecipes(recipes);
    return base.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || r.cuisineCategory === filterCat;
      return matchSearch && matchCat;
    });
  }, [recipes, selectedSlot, search, filterCat]);

  const allFiltered = useMemo(() => {
    return recipes.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || r.cuisineCategory === filterCat;
      return matchSearch && matchCat;
    });
  }, [recipes, search, filterCat]);

  const displayRecipes = selectedDay !== null ? slotRecipes : allFiltered;

  return (
    <div className="space-y-5 pb-4">
      <PageHeader
        title="Essensplaner"
        subtitle={
          loading
            ? 'Rezepte werden geladen…'
            : `${plannedCount}/14 Mahlzeiten geplant · ${recipes.length} Rezepte`
        }
      />

      <WeeklyMealOverview
        mealPlan={mealPlan}
        getRecipeById={getRecipeById}
        selectedDay={selectedDay}
        selectedSlot={selectedSlot}
        onSelectSlot={handleSelectSlot}
        onClearSlot={handleClearSlot}
        todayWeekday={todayWeekday}
      />

      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-card border accent-border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/65">Rezept auswählen für</p>
                <p className="font-display text-sm font-bold accent-gradient-text">
                  {WEEKDAY_FULL[selectedDay]} · {selectedSlot === 'breakfast' ? 'Frühstück' : 'Abendessen'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="rounded-lg p-1.5 text-white/55 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleDice}
              disabled={loading || recipes.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium accent-bg text-black disabled:opacity-40"
            >
              {selectedSlot === 'breakfast' ? <Coffee size={18} /> : <Dices size={18} />}
              {selectedSlot === 'breakfast' ? 'Frühstück würfeln' : 'Abendessen würfeln'}
            </motion.button>

            <p className="text-center text-[11px] text-white/55">
              Oder ein Rezept aus der Liste unten antippen
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDay === null && (
        <p className="text-center text-xs text-white/55">
          Tippe auf Frühstück oder Abendessen, um das Gericht für den Tag zu wählen
        </p>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/55" />
        <input
          type="text"
          placeholder={
            selectedDay !== null
              ? `${selectedSlot === 'breakfast' ? 'Frühstück' : 'Abendessen'} suchen…`
              : 'Rezept suchen…'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-dark-200 py-2.5 pl-9 pr-3 text-sm outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterCat('all')}
          className={`shrink-0 rounded-full px-3 py-1 text-xs ${
            filterCat === 'all' ? 'accent-bg-muted accent-text' : 'text-white/65'
          }`}
        >
          Alle
        </button>
        {(Object.keys(CUISINE_LABELS) as RecipeCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCat(cat)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${
              filterCat === cat ? 'accent-bg-muted accent-text' : 'text-white/65'
            }`}
          >
            {CUISINE_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-white/65">
          {selectedDay !== null
            ? `${selectedSlot === 'breakfast' ? 'Frühstücks' : 'Abendessen'}-Rezepte (${displayRecipes.length})`
            : `Alle Rezepte (${displayRecipes.length})`}
        </h3>

        {displayRecipes.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/55">Keine Rezepte gefunden</p>
        ) : (
          displayRecipes.slice(0, 40).map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
            >
              {selectedDay !== null ? (
                <button
                  type="button"
                  onClick={() => assignRecipe(recipe.id)}
                  className="glass-card flex w-full items-center gap-3 p-3 text-left transition-colors hover-accent-bg-muted"
                >
                  <RecipeListItemContent recipe={recipe} />
                </button>
              ) : (
                <Link
                  to={`/essen/${recipe.id}`}
                  className="glass-card flex items-center gap-3 p-3 transition-colors hover:bg-white/5"
                >
                  <RecipeListItemContent recipe={recipe} />
                  <ChevronRight size={16} className="shrink-0 text-white/50" />
                </Link>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function RecipeListItemContent({ recipe }: { recipe: { id: string; name: string; mealCategory: string; prepTime: number; cookTime: number; nutrition: { calories: number }; isHealthy: boolean } }) {
  return (
    <>
      <div className="rounded-lg px-2 py-1 text-[10px] accent-bg-muted accent-text">
        {recipe.mealCategory}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{recipe.name}</p>
        <div className="flex items-center gap-2 text-xs text-white/55">
          <Clock size={10} />
          {recipe.prepTime + recipe.cookTime} Min.
          <span>·</span>
          {recipe.nutrition.calories} kcal
          {recipe.isHealthy && (
            <>
              <span>·</span>
              <span className="text-green-400/80">gesund</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Dices, Search, ChevronRight, Clock, Flame, Coffee, Moon, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppData } from '@/context/AppDataContext';
import { useRecipes } from '@/context/RecipesContext';
import { generateBreakfast, generateDinner } from '@/lib/recipes';
import { WEEKDAY_LABELS, WEEKDAY_FULL, type MealSlot } from '@/types/meal-plan';
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
  const [assignDay, setAssignDay] = useState<number | null>(null);
  const [assignSlot, setAssignSlot] = useState<MealSlot>('dinner');
  const [lastPicked, setLastPicked] = useState<{ slot: MealSlot; id: string } | null>(null);

  const healthyCount = recipes.filter((r) => r.isHealthy).length;

  const filtered = recipes.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || r.cuisineCategory === filterCat;
    return matchSearch && matchCat;
  });

  const getExcludeIdsForRoll = (slot: MealSlot): string[] => {
    if (assignDay === null) return [];
    const entry = mealPlan.find((m) => m.weekday === assignDay);
    const currentId =
      slot === 'breakfast' ? entry?.breakfastRecipeId : entry?.dinnerRecipeId;

    const otherDays = mealPlan
      .filter((m) => m.weekday !== assignDay)
      .map((m) => (slot === 'breakfast' ? m.breakfastRecipeId : m.dinnerRecipeId))
      .filter((id): id is string => Boolean(id));

    return currentId ? [...otherDays, currentId] : otherDays;
  };

  const assignRecipe = (recipeId: string, slot: MealSlot) => {
    if (assignDay !== null) {
      setMealForDay(assignDay, slot, recipeId);
      setAssignDay(null);
    }
    setLastPicked({ slot, id: recipeId });
  };

  const handleGenerateBreakfast = () => {
    if (assignDay === null) return;
    const recipe = generateBreakfast(recipes, getExcludeIdsForRoll('breakfast'));
    if (!recipe) return;
    assignRecipe(recipe.id, 'breakfast');
  };

  const handleGenerateDinner = () => {
    if (assignDay === null) return;
    const recipe = generateDinner(recipes, getExcludeIdsForRoll('dinner'));
    if (!recipe) return;
    assignRecipe(recipe.id, 'dinner');
  };

  const lastRecipe = lastPicked ? getRecipeById(lastPicked.id) : null;

  const selectDaySlot = (day: number, slot: MealSlot) => {
    if (assignDay === day && assignSlot === slot) {
      setAssignDay(null);
      return;
    }
    setAssignDay(day);
    setAssignSlot(slot);
  };

  const clearSelectedMeal = () => {
    if (assignDay === null) return;
    setMealForDay(assignDay, assignSlot, null);
    setAssignDay(null);
    setLastPicked(null);
  };

  const removeMeal = (day: number, slot: MealSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    setMealForDay(day, slot, null);
    if (assignDay === day && assignSlot === slot) {
      setAssignDay(null);
      setLastPicked(null);
    }
  };

  const selectedEntry = assignDay !== null ? mealPlan.find((m) => m.weekday === assignDay) : null;
  const selectedRecipeId =
    selectedEntry && assignDay !== null
      ? assignSlot === 'breakfast'
        ? selectedEntry.breakfastRecipeId
        : selectedEntry.dinnerRecipeId
      : null;
  const selectedRecipe = selectedRecipeId ? getRecipeById(selectedRecipeId) : null;

  return (
    <div className="space-y-5 pb-4">
      <PageHeader
        title="Essensplaner"
        subtitle={
          loading
            ? 'Rezepte werden geladen…'
            : `${recipes.length} Rezepte · ${healthyCount} gesund`
        }
      />

      <div className="glass-card p-4">
        <h3 className="mb-3 text-sm font-medium text-white/60">Wochenplan</h3>
        <div className="space-y-3">
          {(['breakfast', 'dinner'] as MealSlot[]).map((slot) => (
            <div key={slot}>
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-white/35">
                {slot === 'breakfast' ? <Coffee size={12} /> : <Moon size={12} />}
                {slot === 'breakfast' ? 'Frühstück' : 'Abendessen'}
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAY_LABELS.map((label, i) => {
                  const entry = mealPlan.find((m) => m.weekday === i);
                  const recipeId = slot === 'breakfast' ? entry?.breakfastRecipeId : entry?.dinnerRecipeId;
                  const recipe = recipeId ? getRecipeById(recipeId) : null;
                  const isSelected = assignDay === i && assignSlot === slot;
                  return (
                    <button
                      key={`${slot}-${label}`}
                      onClick={() => selectDaySlot(i, slot)}
                      className={`relative rounded-xl p-2 text-center transition-colors ${
                        isSelected ? 'accent-bg-muted ring-1 accent-border' : 'bg-dark-200/50'
                      }`}
                    >
                      {recipe && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => removeMeal(i, slot, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              removeMeal(i, slot, e as unknown as React.MouseEvent);
                            }
                          }}
                          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-dark-200 text-white/50 hover:bg-red-500/30 hover:text-red-300"
                          aria-label={`${recipe.name} entfernen`}
                        >
                          <X size={10} />
                        </span>
                      )}
                      <p className="text-[10px] text-white/40">{label}</p>
                      <p className="mt-1 text-[10px] leading-tight text-white/70 line-clamp-2">
                        {recipe ? recipe.name.split(' ').slice(0, 2).join(' ') : '—'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {assignDay !== null ? (
          <div className="mt-2 space-y-2 text-center">
            <p className="text-xs text-white/40">
              {WEEKDAY_FULL[assignDay]} · {assignSlot === 'breakfast' ? 'Frühstück' : 'Abendessen'} – Würfeln oder Rezept wählen
            </p>
            {selectedRecipe && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={clearSelectedMeal}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[11px] text-red-300/90"
              >
                <X size={12} />
                {selectedRecipe.name} entfernen
              </motion.button>
            )}
          </div>
        ) : (
          <p className="mt-2 text-center text-xs text-white/30">
            Tag im Wochenplan antippen, dann würfeln
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerateBreakfast}
          disabled={loading || recipes.length === 0 || assignDay === null}
          className="glass-card flex flex-col items-center gap-2 border py-4 accent-border disabled:opacity-40"
        >
          <Coffee size={22} className="accent-text" />
          <span className="text-center font-display text-xs font-bold accent-gradient-text">
            Frühstück würfeln
          </span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerateDinner}
          disabled={loading || recipes.length === 0 || assignDay === null}
          className="glass-card flex flex-col items-center gap-2 border py-4 accent-border disabled:opacity-40"
        >
          <Dices size={22} className="accent-text" />
          <span className="text-center font-display text-xs font-bold accent-gradient-text">
            Abendessen würfeln
          </span>
        </motion.button>
      </div>

      {lastRecipe && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border p-4 accent-border"
        >
          <Link to={`/essen/${lastRecipe.id}`} className="flex items-center gap-3">
            <div className="rounded-xl p-3 accent-bg-muted">
              <Flame size={20} className="accent-text" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase text-white/35">
                {lastPicked?.slot === 'breakfast' ? 'Frühstück' : 'Abendessen'}
                {lastRecipe.isHealthy && ' · Gesund'}
              </p>
              <p className="font-medium accent-gradient-text">{lastRecipe.name}</p>
              <p className="text-xs text-white/40">
                {lastRecipe.nutrition.calories} kcal · {lastRecipe.prepTime + lastRecipe.cookTime} Min.
              </p>
            </div>
            <ChevronRight size={18} className="text-white/30" />
          </Link>
        </motion.div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Rezept suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-dark-200 py-2.5 pl-9 pr-3 text-sm outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCat('all')}
          className={`shrink-0 rounded-full px-3 py-1 text-xs ${
            filterCat === 'all' ? 'accent-bg-muted accent-text' : 'text-white/40'
          }`}
        >
          Alle
        </button>
        {(Object.keys(CUISINE_LABELS) as RecipeCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${
              filterCat === cat ? 'accent-bg-muted accent-text' : 'text-white/40'
            }`}
          >
            {CUISINE_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.slice(0, 30).map((recipe, i) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <Link
              to={`/essen/${recipe.id}`}
              onClick={() => {
                if (assignDay !== null) {
                  setMealForDay(assignDay, assignSlot, recipe.id);
                  setAssignDay(null);
                }
              }}
              className="glass-card flex items-center gap-3 p-3 transition-colors hover:bg-white/5"
            >
              <div className="rounded-lg px-2 py-1 text-[10px] accent-bg-muted accent-text">
                {recipe.mealCategory}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{recipe.name}</p>
                <div className="flex items-center gap-2 text-xs text-white/30">
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
              <ChevronRight size={16} className="text-white/20" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Dices, Search, ChevronRight, Clock, Flame } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppData } from '@/context/AppDataContext';
import { getAllRecipes, getRandomRecipe, getRecipeById } from '@/lib/recipes';
import { WEEKDAY_LABELS, WEEKDAY_FULL } from '@/types/meal-plan';
import type { RecipeCategory } from '@/types/recipe';

const CATEGORY_LABELS: Record<RecipeCategory, string> = {
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
  const recipes = getAllRecipes();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<RecipeCategory | 'all'>('all');
  const [diceRecipe, setDiceRecipe] = useState<string | null>(null);
  const [assignDay, setAssignDay] = useState<number | null>(null);

  const filtered = recipes.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || r.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleDice = () => {
    const recipe = getRandomRecipe();
    setDiceRecipe(recipe.id);
    if (assignDay !== null) {
      setMealForDay(assignDay, recipe.id);
      setAssignDay(null);
    }
  };

  const diceResult = diceRecipe ? getRecipeById(diceRecipe) : null;

  return (
    <div className="space-y-5 pb-4">
      <PageHeader title="Essensplaner" subtitle={`${recipes.length} gesunde Rezepte`} />

      <div className="glass-card p-4">
        <h3 className="mb-3 text-sm font-medium text-white/60">Wochenplan</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label, i) => {
            const entry = mealPlan.find((m) => m.weekday === i);
            const recipe = entry?.recipeId ? getRecipeById(entry.recipeId) : null;
            return (
              <button
                key={label}
                onClick={() => setAssignDay(assignDay === i ? null : i)}
                className={`rounded-xl p-2 text-center transition-colors ${
                  assignDay === i ? 'accent-bg-muted ring-1 accent-border' : 'bg-dark-200/50'
                }`}
              >
                <p className="text-[10px] text-white/40">{label}</p>
                <p className="mt-1 text-[10px] leading-tight text-white/70 line-clamp-2">
                  {recipe ? recipe.name.split(' ').slice(0, 2).join(' ') : '—'}
                </p>
              </button>
            );
          })}
        </div>
        {assignDay !== null && (
          <p className="mt-2 text-center text-xs text-white/40">
            Tag ausgewählt: {WEEKDAY_FULL[assignDay]} – Würfeln oder Rezept antippen
          </p>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleDice}
        className="glass-card flex w-full items-center justify-center gap-3 border py-4 accent-border"
      >
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 0.6 }} key={diceRecipe}>
          <Dices size={28} className="accent-text" />
        </motion.div>
        <span className="font-display text-sm font-bold accent-gradient-text">
          {assignDay !== null ? `Zufallsgericht für ${WEEKDAY_FULL[assignDay]}` : 'Zufalls-Würfel'}
        </span>
      </motion.button>

      {diceResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border p-4 accent-border"
        >
          <Link to={`/essen/${diceResult.id}`} className="flex items-center gap-3">
            <div className="rounded-xl p-3 accent-bg-muted">
              <Flame size={20} className="accent-text" />
            </div>
            <div className="flex-1">
              <p className="font-medium accent-gradient-text">{diceResult.name}</p>
              <p className="text-xs text-white/40">
                {diceResult.nutrition.calories} kcal · {diceResult.prepTime + diceResult.cookTime} Min.
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
        {(Object.keys(CATEGORY_LABELS) as RecipeCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${
              filterCat === cat ? 'accent-bg-muted accent-text' : 'text-white/40'
            }`}
          >
            {CATEGORY_LABELS[cat]}
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
                  setMealForDay(assignDay, recipe.id);
                  setAssignDay(null);
                }
              }}
              className="glass-card flex items-center gap-3 p-3 transition-colors hover:bg-white/5"
            >
              <div className="rounded-lg px-2 py-1 text-[10px] accent-bg-muted accent-text">
                {CATEGORY_LABELS[recipe.category]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{recipe.name}</p>
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Clock size={10} />
                  {recipe.prepTime + recipe.cookTime} Min.
                  <span>·</span>
                  {recipe.nutrition.calories} kcal
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20" />
            </Link>
          </motion.div>
        ))}
        {filtered.length > 30 && (
          <p className="text-center text-xs text-white/30">
            +{filtered.length - 30} weitere Rezepte (Suche eingrenzen)
          </p>
        )}
      </div>
    </div>
  );
}

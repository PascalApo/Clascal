import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChefHat } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useRecipes } from '@/context/RecipesContext';
import { collectMealPlanIngredients } from '@/lib/meal-plan-ingredients';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

const CHECKED_KEY = 'haushalt-mealplan-ingredients-checked';

export function MealPlanShoppingChecklist() {
  const { mealPlan } = useAppData();
  const { getRecipeById } = useRecipes();
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(
    () => new Set(loadFromStorage<string[]>(CHECKED_KEY, [])),
  );

  const lines = useMemo(
    () => collectMealPlanIngredients(mealPlan, getRecipeById),
    [mealPlan, getRecipeById],
  );

  useEffect(() => {
    saveToStorage(CHECKED_KEY, Array.from(checkedKeys));
  }, [checkedKeys]);

  const toggle = (key: string) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (lines.length === 0) {
    return (
      <div className="glass-card p-4 text-center text-xs text-white/35">
        <ChefHat size={20} className="mx-auto mb-2 opacity-40" />
        Keine Rezepte im Essensplan – Zutaten erscheinen hier automatisch.
      </div>
    );
  }

  const doneCount = lines.filter((l) => checkedKeys.has(l.key)).length;

  return (
    <div className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white/60">
          <ChefHat size={14} />
          Zutaten aus Essensplan
        </h3>
        <span className="text-xs text-white/35">
          {doneCount}/{lines.length}
        </span>
      </div>
      <ul className="space-y-2">
        {lines.map((line) => {
          const checked = checkedKeys.has(line.key);
          return (
            <motion.li
              key={line.key}
              layout
              className={`flex items-start gap-3 rounded-xl px-3 py-2 transition-colors ${
                checked ? 'bg-green-500/10 opacity-60' : 'bg-dark-200/40'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(line.key)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  checked ? 'border-green-500/50 bg-green-500/20' : 'border-white/20'
                }`}
              >
                {checked && <Check size={12} className="text-green-400" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${checked ? 'line-through text-white/50' : 'text-white/85'}`}>
                  {line.name}
                </p>
                <p className="text-xs text-white/35">{line.amount}</p>
                <p className="text-[10px] text-white/25">{line.recipeNames.join(', ')}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

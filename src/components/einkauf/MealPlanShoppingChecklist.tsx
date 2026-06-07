import { useMemo, useState, useEffect } from 'react';
import { Check, ChefHat } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useRecipes } from '@/context/RecipesContext';
import {
  collectMealPlanIngredients,
  groupMealPlanIngredientsByDay,
} from '@/lib/meal-plan-ingredients';
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

  const dayGroups = useMemo(() => groupMealPlanIngredientsByDay(lines), [lines]);

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
      <div className="rounded-xl border border-white/5 bg-dark-200/20 px-4 py-3 text-center text-[11px] text-white/30">
        <ChefHat size={14} className="mx-auto mb-1.5 opacity-40" />
        Keine Rezepte im Essensplan – Zutaten erscheinen hier automatisch.
      </div>
    );
  }

  const doneCount = lines.filter((l) => checkedKeys.has(l.key)).length;

  return (
    <div className="rounded-xl border border-white/5 bg-dark-200/20 px-3 py-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/35">
          <ChefHat size={12} />
          Essensplan
        </h3>
        <span className="text-[10px] text-white/25">
          {doneCount}/{lines.length}
        </span>
      </div>
      <div className="space-y-3">
        {dayGroups.map((group) => (
          <div key={group.weekday}>
            <p className="mb-1 px-1 text-[10px] text-white/25">{group.label}</p>
            <ul className="space-y-0.5">
              {group.lines.map((line) => {
                const checked = checkedKeys.has(line.key);
                return (
                  <li
                    key={line.key}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                      checked ? 'opacity-45' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(line.key)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked
                          ? 'border-green-500/40 bg-green-500/15'
                          : 'border-white/15'
                      }`}
                    >
                      {checked && <Check size={10} className="text-green-400/80" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs leading-tight ${
                          checked ? 'line-through text-white/35' : 'text-white/65'
                        }`}
                      >
                        {line.name}
                        <span className="ml-1.5 text-white/30">{line.amount}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

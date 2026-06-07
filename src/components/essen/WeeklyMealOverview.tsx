import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Coffee, Moon, X, ChevronRight, Plus } from 'lucide-react';
import { WEEKDAY_FULL, type MealSlot } from '@/types/meal-plan';
import type { Recipe } from '@/types/recipe';

interface WeeklyMealOverviewProps {
  mealPlan: { weekday: number; breakfastRecipeId: string | null; dinnerRecipeId: string | null }[];
  getRecipeById: (id: string) => Recipe | undefined;
  selectedDay: number | null;
  selectedSlot: MealSlot;
  onSelectSlot: (day: number, slot: MealSlot) => void;
  onClearSlot: (day: number, slot: MealSlot) => void;
  todayWeekday: number;
}

function MealSlotRow({
  label,
  icon: Icon,
  recipe,
  isActive,
  onSelect,
  onClear,
}: {
  label: string;
  icon: typeof Coffee;
  recipe: Recipe | undefined;
  isActive: boolean;
  onSelect: () => void;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
        isActive
          ? 'accent-bg-muted ring-1 accent-border'
          : 'bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isActive ? 'accent-bg' : 'bg-white/5'
        }`}
      >
        <Icon size={16} className={isActive ? 'text-black' : 'text-white/50'} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-white/60">{label}</p>
        {recipe ? (
          <p className="truncate text-sm font-medium text-white">{recipe.name}</p>
        ) : (
          <p className="text-sm text-white/55">Noch nicht geplant</p>
        )}
        {recipe && (
          <p className="text-[10px] text-white/55">
            {recipe.nutrition.calories} kcal · {recipe.prepTime + recipe.cookTime} Min.
          </p>
        )}
      </div>

      {recipe ? (
        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={`/essen/${recipe.id}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg p-1.5 text-white/55 hover:bg-white/10 hover:text-white"
            aria-label="Rezept ansehen"
          >
            <ChevronRight size={16} />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="rounded-lg p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-300"
            aria-label={`${label} entfernen`}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 text-white/55 group-hover:border-white/30 group-hover:text-white/50">
          <Plus size={14} />
        </div>
      )}
    </button>
  );
}

export function WeeklyMealOverview({
  mealPlan,
  getRecipeById,
  selectedDay,
  selectedSlot,
  onSelectSlot,
  onClearSlot,
  todayWeekday,
}: WeeklyMealOverviewProps) {
  const sorted = [...mealPlan].sort((a, b) => a.weekday - b.weekday);

  return (
    <div className="space-y-3">
      {sorted.map((entry, i) => {
        const isToday = entry.weekday === todayWeekday;
        const breakfast = entry.breakfastRecipeId
          ? getRecipeById(entry.breakfastRecipeId)
          : undefined;
        const dinner = entry.dinnerRecipeId
          ? getRecipeById(entry.dinnerRecipeId)
          : undefined;

        return (
          <motion.div
            key={entry.weekday}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`glass-card overflow-hidden ${
              isToday ? 'border accent-border' : ''
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <h4 className="font-display text-sm font-semibold text-white">
                  {WEEKDAY_FULL[entry.weekday]}
                </h4>
                {isToday && (
                  <span className="rounded-full accent-bg-muted px-2 py-0.5 text-[10px] font-medium accent-text">
                    Heute
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/55">
                {[breakfast, dinner].filter(Boolean).length}/2 geplant
              </span>
            </div>

            <div className="space-y-1.5 p-3">
              <MealSlotRow
                label="Frühstück"
                icon={Coffee}
                recipe={breakfast}
                isActive={selectedDay === entry.weekday && selectedSlot === 'breakfast'}
                onSelect={() => onSelectSlot(entry.weekday, 'breakfast')}
                onClear={() => onClearSlot(entry.weekday, 'breakfast')}
              />
              <MealSlotRow
                label="Abendessen"
                icon={Moon}
                recipe={dinner}
                isActive={selectedDay === entry.weekday && selectedSlot === 'dinner'}
                onSelect={() => onSelectSlot(entry.weekday, 'dinner')}
                onClear={() => onClearSlot(entry.weekday, 'dinner')}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

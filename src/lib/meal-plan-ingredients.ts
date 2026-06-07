import type { MealPlanEntry, MealSlot } from '@/types/meal-plan';
import { WEEKDAY_FULL } from '@/types/meal-plan';
import type { Recipe } from '@/types/recipe';
import { scaleIngredients } from '@/lib/recipes';

export interface MealPlanIngredientLine {
  key: string;
  name: string;
  amount: string;
  recipeNames: string[];
  weekday: number;
  slot: MealSlot;
  sortOrder: number;
}

const SLOT_ORDER: MealSlot[] = ['breakfast', 'dinner'];

export function collectMealPlanIngredients(
  mealPlan: MealPlanEntry[],
  getRecipe: (id: string) => Recipe | undefined,
): MealPlanIngredientLine[] {
  const map = new Map<string, MealPlanIngredientLine>();
  const sortedDays = [...mealPlan].sort((a, b) => a.weekday - b.weekday);

  for (const day of sortedDays) {
    for (const slot of SLOT_ORDER) {
      const recipeId = slot === 'breakfast' ? day.breakfastRecipeId : day.dinnerRecipeId;
      if (!recipeId) continue;

      const recipe = getRecipe(recipeId);
      if (!recipe) continue;

      const sortOrder = day.weekday * 10 + (slot === 'breakfast' ? 0 : 1);
      const ingredients = scaleIngredients(recipe, recipe.servings);

      for (const ing of ingredients) {
        const key = ing.name.toLowerCase().trim();
        const amount = `${ing.amount} ${ing.unit}`;
        const existing = map.get(key);

        if (existing) {
          if (!existing.recipeNames.includes(recipe.name)) {
            existing.recipeNames.push(recipe.name);
          }
          if (sortOrder < existing.sortOrder) {
            existing.sortOrder = sortOrder;
            existing.weekday = day.weekday;
            existing.slot = slot;
          }
        } else {
          map.set(key, {
            key,
            name: ing.name,
            amount,
            recipeNames: [recipe.name],
            weekday: day.weekday,
            slot,
            sortOrder,
          });
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function groupMealPlanIngredientsByDay(
  lines: MealPlanIngredientLine[],
): { weekday: number; label: string; lines: MealPlanIngredientLine[] }[] {
  const groups: { weekday: number; label: string; lines: MealPlanIngredientLine[] }[] = [];

  for (const line of lines) {
    const last = groups[groups.length - 1];
    if (last?.weekday === line.weekday) {
      last.lines.push(line);
    } else {
      groups.push({
        weekday: line.weekday,
        label: WEEKDAY_FULL[line.weekday],
        lines: [line],
      });
    }
  }

  return groups;
}

import type { MealPlanEntry } from '@/types/meal-plan';
import type { Recipe } from '@/types/recipe';
import { scaleIngredients } from '@/lib/recipes';

export interface MealPlanIngredientLine {
  key: string;
  name: string;
  amount: string;
  recipeNames: string[];
}

export function collectMealPlanIngredients(
  mealPlan: MealPlanEntry[],
  getRecipe: (id: string) => Recipe | undefined,
): MealPlanIngredientLine[] {
  const map = new Map<string, MealPlanIngredientLine>();

  for (const day of mealPlan) {
    const recipeIds = [day.breakfastRecipeId, day.dinnerRecipeId].filter(Boolean) as string[];

    for (const recipeId of recipeIds) {
      const recipe = getRecipe(recipeId);
      if (!recipe) continue;

      const ingredients = scaleIngredients(recipe, recipe.servings);
      for (const ing of ingredients) {
        const key = ing.name.toLowerCase().trim();
        const amount = `${ing.amount} ${ing.unit}`;
        const existing = map.get(key);

        if (existing) {
          if (!existing.recipeNames.includes(recipe.name)) {
            existing.recipeNames.push(recipe.name);
          }
        } else {
          map.set(key, {
            key,
            name: ing.name,
            amount,
            recipeNames: [recipe.name],
          });
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

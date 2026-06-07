export type MealSlot = 'breakfast' | 'dinner';

export interface MealPlanEntry {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  breakfastRecipeId: string | null;
  dinnerRecipeId: string | null;
}

export const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
export const WEEKDAY_FULL = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
] as const;

/** Migriert alte Einträge mit recipeId */
export function normalizeMealPlanEntry(raw: Record<string, unknown>): MealPlanEntry {
  const weekday = raw.weekday as MealPlanEntry['weekday'];
  return {
    weekday,
    breakfastRecipeId: (raw.breakfastRecipeId as string) ?? (raw.breakfast_recipe_id as string) ?? null,
    dinnerRecipeId:
      (raw.dinnerRecipeId as string)
      ?? (raw.dinner_recipe_id as string)
      ?? (raw.recipeId as string)
      ?? (raw.recipe_id as string)
      ?? null,
  };
}

export function createDefaultMealPlan(): MealPlanEntry[] {
  return Array.from({ length: 7 }, (_, i) => ({
    weekday: i as MealPlanEntry['weekday'],
    breakfastRecipeId: null,
    dinnerRecipeId: null,
  }));
}

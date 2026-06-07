import type { Ingredient, MealCategory, Recipe, RecipeCategory } from '@/types/recipe';

const DEFAULT_NUTRITION = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

/** instructions/instructions-Spalte → string[] für Schritt-für-Schritt-UI */
export function parseInstructions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((step) => String(step).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const parsed = parseJsonField<unknown>(value, null);
    if (Array.isArray(parsed)) {
      return parsed.map((step) => String(step).trim()).filter(Boolean);
    }
    return value
      .split(/\n+/)
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
}

function parseMealCategory(value: unknown): MealCategory {
  const raw = String(value ?? '').trim();
  if (raw === 'Frühstück') return 'Frühstück';
  return 'Abendessen';
}

function parseIngredients(value: unknown): Ingredient[] {
  const arr = parseJsonField<Ingredient[]>(value, []);
  if (!Array.isArray(arr)) return [];
  return arr.filter((ing) => ing?.name);
}

export function recipeFromRow(row: Record<string, unknown>): Recipe {
  const cuisine = row.cuisine_category as RecipeCategory | undefined;
  return {
    id: row.id as string,
    name: row.name as string,
    mealCategory: parseMealCategory(row.category),
    isHealthy: Boolean(row.is_healthy),
    cuisineCategory: cuisine,
    description: (row.description as string) ?? '',
    prepTime: Number(row.prep_time) || 0,
    cookTime: Number(row.cook_time) || 0,
    servings: Number(row.servings) || 2,
    difficulty: (row.difficulty as Recipe['difficulty']) ?? 'einfach',
    meatType: (row.meat_type as Recipe['meatType']) ?? 'keins',
    ingredients: parseIngredients(row.ingredients),
    steps: parseInstructions(row.instructions),
    nutrition: parseJsonField(row.nutrition, DEFAULT_NUTRITION),
    tags: parseJsonField<string[]>(row.tags, []),
  };
}

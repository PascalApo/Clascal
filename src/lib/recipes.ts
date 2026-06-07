import recipesData from '@/data/recipes.json';
import type { Recipe, MealCategory, RecipeCategory } from '@/types/recipe';
import { fetchRecipesFromSupabase } from '@/lib/supabase/recipes';

interface JsonRecipeLegacy {
  id: string;
  name: string;
  category: RecipeCategory;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Recipe['difficulty'];
  meatType: Recipe['meatType'];
  ingredients: Recipe['ingredients'];
  steps: string[];
  nutrition: Recipe['nutrition'];
  tags: string[];
}

const data = recipesData as { recipes: JsonRecipeLegacy[] };

function recipeFromJson(raw: JsonRecipeLegacy): Recipe {
  const mealCategory: MealCategory = raw.category === 'fruehstueck' ? 'Frühstück' : 'Abendessen';
  return {
    id: raw.id,
    name: raw.name,
    mealCategory,
    isHealthy: raw.tags?.includes('gesund') ?? raw.nutrition.calories < 450,
    cuisineCategory: raw.category,
    description: raw.description,
    prepTime: raw.prepTime,
    cookTime: raw.cookTime,
    servings: raw.servings,
    difficulty: raw.difficulty,
    meatType: raw.meatType,
    ingredients: raw.ingredients,
    steps: Array.isArray(raw.steps) ? raw.steps : [],
    nutrition: raw.nutrition,
    tags: raw.tags ?? [],
  };
}

export function getRecipesFromJson(): Recipe[] {
  return data.recipes.map(recipeFromJson);
}

export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const fromCloud = await fetchRecipesFromSupabase();
    if (fromCloud.length > 0) return fromCloud;
  } catch (err) {
    console.warn('[Recipes] Supabase-Fallback auf lokale JSON:', err);
  }
  return getRecipesFromJson();
}

export function getRecipeById(recipes: Recipe[], id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function filterBreakfastRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.filter((r) => r.mealCategory === 'Frühstück');
}

export function filterDinnerRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.filter((r) => r.mealCategory !== 'Frühstück');
}

function pickRandomRecipe(pool: Recipe[], excludeIds: string[] = []): Recipe | null {
  if (pool.length === 0) return null;
  const exclude = new Set(excludeIds);
  const candidates = pool.filter((r) => !exclude.has(r.id));
  const pickFrom = candidates.length > 0 ? candidates : pool;
  return pickFrom[Math.floor(Math.random() * pickFrom.length)];
}

export function generateBreakfast(recipes: Recipe[], excludeIds: string[] = []): Recipe | null {
  return pickRandomRecipe(filterBreakfastRecipes(recipes), excludeIds);
}

export function generateDinner(recipes: Recipe[], excludeIds: string[] = []): Recipe | null {
  return pickRandomRecipe(filterDinnerRecipes(recipes), excludeIds);
}

/** @deprecated Nutze generateBreakfast / generateDinner */
export function getRandomRecipe(recipes: Recipe[]): Recipe | null {
  if (recipes.length === 0) return null;
  return recipes[Math.floor(Math.random() * recipes.length)];
}

export function scaleIngredients(
  recipe: Recipe,
  targetServings: number,
): Recipe['ingredients'] {
  const factor = targetServings / recipe.servings;
  return recipe.ingredients.map((ing) => ({
    ...ing,
    amount: Math.round(ing.amount * factor * 10) / 10,
  }));
}

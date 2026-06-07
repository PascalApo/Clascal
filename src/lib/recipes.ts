import recipesData from '@/data/recipes.json';
import type { Recipe, RecipesData } from '@/types';

const data = recipesData as RecipesData;

export function getAllRecipes(): Recipe[] {
  return data.recipes;
}

export function getRecipeById(id: string): Recipe | undefined {
  return data.recipes.find((r) => r.id === id);
}

export function getRecipesByCategory(category: Recipe['category']): Recipe[] {
  return data.recipes.filter((r) => r.category === category);
}

export function getRandomRecipe(): Recipe {
  const recipes = data.recipes;
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

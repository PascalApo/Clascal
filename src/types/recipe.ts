export type RecipeCategory =
  | 'auflauf'
  | 'pfanne'
  | 'wrap'
  | 'ofen'
  | 'salat'
  | 'pasta'
  | 'klassiker'
  | 'suppe'
  | 'fruehstueck';

/** Supabase-Spalte category: Frühstück oder Abendessen */
export type MealCategory = 'Frühstück' | 'Abendessen';

export type MeatType = 'rind' | 'schwein' | 'haehnchen' | 'keins';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: 'gemuese' | 'fleisch' | 'milchprodukte' | 'getreide' | 'gewuerze' | 'obst' | 'sonstiges';
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  name: string;
  /** Supabase: category ('Frühstück' | 'Abendessen') */
  mealCategory: MealCategory;
  isHealthy: boolean;
  /** Lokale Küchen-Kategorie (JSON) oder cuisine_category aus Supabase */
  cuisineCategory?: RecipeCategory;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'einfach' | 'mittel' | 'anspruchsvoll';
  meatType: MeatType;
  ingredients: Ingredient[];
  /** Schritt-für-Schritt-Anleitung als Array */
  steps: string[];
  nutrition: Nutrition;
  tags: string[];
}

export interface RecipesData {
  version: string;
  lastUpdated: string;
  recipes: Recipe[];
}

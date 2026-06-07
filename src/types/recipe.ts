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
  category: RecipeCategory;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'einfach' | 'mittel' | 'anspruchsvoll';
  meatType: MeatType;
  ingredients: Ingredient[];
  steps: string[];
  nutrition: Nutrition;
  tags: string[];
}

export interface RecipesData {
  version: string;
  lastUpdated: string;
  recipes: Recipe[];
}

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Recipe } from '@/types/recipe';
import { loadRecipes, getRecipeById as findRecipe } from '@/lib/recipes';

interface RecipesContextValue {
  recipes: Recipe[];
  loading: boolean;
  getRecipeById: (id: string) => Recipe | undefined;
  refreshRecipes: () => Promise<void>;
}

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadRecipes();
      setRecipes(loaded);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshRecipes();
  }, [refreshRecipes]);

  const getRecipeById = useCallback(
    (id: string) => findRecipe(recipes, id),
    [recipes],
  );

  return (
    <RecipesContext.Provider value={{ recipes, loading, getRecipeById, refreshRecipes }}>
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error('useRecipes must be used within RecipesProvider');
  return ctx;
}

import { getSupabaseClient, HOUSEHOLD_ID, isSupabaseConfigured } from './client';
import { recipeFromRow } from './recipe-mappers';
import type { Recipe } from '@/types/recipe';

export async function fetchRecipesFromSupabase(): Promise<Recipe[]> {
  if (!isSupabaseConfigured) return [];

  const sb = getSupabaseClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('recipes')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => recipeFromRow(row));
}

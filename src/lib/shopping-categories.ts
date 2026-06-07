import {
  Carrot,
  Beef,
  Milk,
  Wheat,
  SprayCan,
  Wine,
  Snowflake,
  Package,
  type LucideIcon,
} from 'lucide-react';
import type { ShoppingListItem } from '@/lib/sync/types';

export type ShoppingCategory = ShoppingListItem['category'];

export const SHOPPING_CATEGORIES: {
  id: ShoppingCategory;
  label: string;
  icon: LucideIcon;
  color: string;
}[] = [
  { id: 'gemuese', label: 'Gemüse & Obst', icon: Carrot, color: '#10b981' },
  { id: 'fleisch', label: 'Fleisch & Fisch', icon: Beef, color: '#ef4444' },
  { id: 'milchprodukte', label: 'Milchprodukte', icon: Milk, color: '#f59e0b' },
  { id: 'getreide', label: 'Brot & Getreide', icon: Wheat, color: '#d97706' },
  { id: 'getraenke', label: 'Getränke', icon: Wine, color: '#8b5cf6' },
  { id: 'tiefkuehl', label: 'Tiefkühl', icon: Snowflake, color: '#00d4ff' },
  { id: 'drogerie', label: 'Drogerie', icon: SprayCan, color: '#ec4899' },
  { id: 'sonstiges', label: 'Sonstiges', icon: Package, color: '#6b7280' },
];

export { SHOPPING_CATALOG, searchCatalog, findCatalogProduct, QUICK_ITEMS } from '@/lib/shopping-catalog';

export function ingredientCategoryToShopping(
  cat: string,
): ShoppingCategory {
  const map: Record<string, ShoppingCategory> = {
    gemuese: 'gemuese',
    fleisch: 'fleisch',
    milchprodukte: 'milchprodukte',
    getreide: 'getreide',
    obst: 'gemuese',
    gewuerze: 'sonstiges',
    sonstiges: 'sonstiges',
  };
  return map[cat] ?? 'sonstiges';
}

export function getCategoryMeta(category: ShoppingCategory) {
  return SHOPPING_CATEGORIES.find((c) => c.id === category);
}

import type { ShoppingUsage } from '@/lib/sync/types';
import type { CatalogProduct } from '@/lib/shopping-catalog';
import { findCatalogProduct, SHOPPING_CATALOG, type ShoppingCategory } from '@/lib/shopping-categories';
import { DEFAULT_QUANTITY_BY_UNIT } from '@/lib/quantity-presets';

export interface FavoriteProduct extends CatalogProduct {
  usageCount: number;
}

export function buildFavoriteProducts(
  usage: ShoppingUsage[],
  categoryFilter: ShoppingCategory | 'all' = 'all',
  limit = 20,
): FavoriteProduct[] {
  const sorted = [...usage].sort((a, b) => b.usageCount - a.usageCount);

  const favorites: FavoriteProduct[] = [];
  const seen = new Set<string>();

  for (const entry of sorted) {
    const key = entry.name.toLowerCase();
    if (seen.has(key)) continue;
    if (categoryFilter !== 'all' && entry.category !== categoryFilter) continue;

    const catalog = findCatalogProduct(entry.name);
    favorites.push({
      name: catalog?.name ?? entry.name,
      category: entry.category,
      emoji: catalog?.emoji ?? '📦',
      keywords: catalog?.keywords ?? [key],
      unitType: catalog?.unitType ?? 'stueck',
      defaultQuantity: catalog?.defaultQuantity ?? DEFAULT_QUANTITY_BY_UNIT.stueck,
      usageCount: entry.usageCount,
    });
    seen.add(key);
    if (favorites.length >= limit) break;
  }

  if (favorites.length < limit) {
    for (const product of SHOPPING_CATALOG) {
      const key = product.name.toLowerCase();
      if (seen.has(key)) continue;
      if (categoryFilter !== 'all' && product.category !== categoryFilter) continue;
      favorites.push({ ...product, usageCount: 0 });
      seen.add(key);
      if (favorites.length >= limit) break;
    }
  }

  return favorites;
}

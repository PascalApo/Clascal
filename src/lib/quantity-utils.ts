import { findCatalogProduct } from '@/lib/shopping-categories';

export function incrementQuantity(quantity: string): string {
  const trimmed = quantity.trim();
  if (!trimmed) return '1 Stück';

  const match = trimmed.match(/^([\d]+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return trimmed;

  const num = parseFloat(match[1].replace(',', '.')) + 1;
  const unit = match[2].trim();
  const amountStr = Number.isInteger(num)
    ? String(num)
    : String(num).replace('.', ',');

  return unit ? `${amountStr} ${unit}` : amountStr;
}

export function defaultQuantityForName(name: string, explicit?: string): string {
  if (explicit?.trim()) return explicit.trim();
  const catalog = findCatalogProduct(name);
  return catalog?.defaultQuantity ?? '1 Stück';
}

export function initialOrIncrementQuantity(
  existingQuantity: string | undefined,
  fallbackQuantity: string,
): string {
  if (existingQuantity?.trim()) {
    return incrementQuantity(existingQuantity);
  }
  return fallbackQuantity;
}

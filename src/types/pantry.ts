export interface PantryItem {
  id: string;
  name: string;
  quantity?: string;
  /** YYYY-MM-DD */
  expiresOn: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function daysUntilExpiry(expiresOn: string, today = new Date()): number {
  const [y, m, d] = expiresOn.split('-').map(Number);
  const expiry = new Date(y, m - 1, d);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((expiry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(item: PantryItem, withinDays = 7, today = new Date()): boolean {
  const days = daysUntilExpiry(item.expiresOn, today);
  return days >= 0 && days <= withinDays;
}

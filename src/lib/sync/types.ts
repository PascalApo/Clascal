/**
 * Gemeinsame Sync-Typen für Einkaufsliste, Aufgaben & Termine.
 * Unabhängig von Supabase oder Firebase implementierbar.
 */

export interface SyncItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type ShoppingCategoryId =
  | 'gemuese'
  | 'fleisch'
  | 'milchprodukte'
  | 'getreide'
  | 'drogerie'
  | 'getraenke'
  | 'tiefkuehl'
  | 'sonstiges';

export interface ShoppingListItem extends SyncItem {
  name: string;
  category: ShoppingCategoryId;
  checked: boolean;
  quantity?: string;
}

export interface ShoppingUsage {
  name: string;
  category: ShoppingCategoryId;
  usageCount: number;
  updatedAt: string;
}

export interface Task extends SyncItem {
  title: string;
  assignedTo: 'user1' | 'user2' | 'both';
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** YYYY-MM-DD – nur bei einmaligen Aufgaben (recurring: false) */
  date?: string;
  completed: boolean;
  recurring: boolean;
}

export interface CalendarEvent extends SyncItem {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
}

export interface SyncProvider {
  subscribeShoppingList(callback: (items: ShoppingListItem[]) => void): () => void;
  addShoppingItem(item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
  toggleShoppingItem(id: string, checked: boolean): Promise<void>;
  removeShoppingItem(id: string): Promise<void>;
}

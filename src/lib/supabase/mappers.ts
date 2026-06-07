import type {
  ShoppingListItem,
  ShoppingUsage,
  Task,
  CalendarEvent,
} from '@/lib/sync/types';
import type { MealPlanEntry } from '@/types/meal-plan';
import type { Expense } from '@/types/expense';
import type { PantryItem } from '@/types/pantry';
import type { BureaucracyDeadline } from '@/types/bureaucracy-deadline';
import type { MentalLoadEvent } from '@/types/mental-load';
import { HOUSEHOLD_ID } from './client';

/** Spalten der Tabelle shopping_items – keine Archiv- oder Zusatzfelder */
export interface ShoppingItemRow {
  id: string;
  household_id: string;
  name: string;
  category: string;
  checked: boolean;
  quantity: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function assertShoppingListItem(
  item: ShoppingListItem | null | undefined,
  context = 'shoppingToRow',
): ShoppingListItem {
  if (!item) {
    throw new Error(`${context}: item ist undefined`);
  }
  if (!item.id?.trim()) {
    throw new Error(`${context}: item "${item.name ?? '?'}" hat keine gültige id`);
  }
  if (!item.name?.trim()) {
    throw new Error(`${context}: name ist erforderlich`);
  }
  if (!item.category) {
    throw new Error(`${context}: category ist erforderlich`);
  }
  if (!item.createdBy) {
    throw new Error(`${context}: createdBy ist erforderlich`);
  }
  if (!item.createdAt || !item.updatedAt) {
    throw new Error(`${context}: createdAt/updatedAt sind erforderlich`);
  }
  return item;
}

export function shoppingToRow(item: ShoppingListItem): ShoppingItemRow {
  const valid = assertShoppingListItem(item);
  return {
    id: valid.id.trim(),
    household_id: HOUSEHOLD_ID,
    name: valid.name.trim(),
    category: valid.category,
    checked: Boolean(valid.checked),
    quantity: valid.quantity?.trim() || null,
    created_by: valid.createdBy,
    created_at: valid.createdAt,
    updated_at: valid.updatedAt,
  };
}

export function shoppingUsageFromRow(row: Record<string, unknown>): ShoppingUsage {
  return {
    name: row.name as string,
    category: row.category as ShoppingUsage['category'],
    usageCount: Number(row.usage_count),
    updatedAt: row.updated_at as string,
  };
}

export function shoppingUsageToRow(usage: ShoppingUsage) {
  return {
    household_id: HOUSEHOLD_ID,
    name: usage.name,
    category: usage.category,
    usage_count: usage.usageCount,
    updated_at: usage.updatedAt,
  };
}

export function shoppingFromRow(row: Record<string, unknown>): ShoppingListItem {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as ShoppingListItem['category'],
    checked: row.checked as boolean,
    quantity: (row.quantity as string) ?? undefined,
    createdBy: row.created_by as ShoppingListItem['createdBy'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function taskToRow(task: Task) {
  return {
    id: task.id,
    household_id: HOUSEHOLD_ID,
    title: task.title,
    assigned_to: task.assignedTo,
    weekday: task.weekday,
    task_date: task.date ?? null,
    completed: task.completed,
    recurring: task.recurring,
    created_by: task.createdBy,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function taskFromRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    assignedTo: row.assigned_to as Task['assignedTo'],
    weekday: row.weekday as Task['weekday'],
    date: (row.task_date as string) ?? undefined,
    completed: row.completed as boolean,
    recurring: row.recurring as boolean,
    createdBy: row.created_by as Task['createdBy'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function eventToRow(event: CalendarEvent) {
  return {
    id: event.id,
    household_id: HOUSEHOLD_ID,
    title: event.title,
    description: event.description ?? null,
    start_date: event.startDate,
    end_date: event.endDate,
    all_day: event.allDay,
    created_by: event.createdBy,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
  };
}

export function eventFromRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    allDay: row.all_day as boolean,
    createdBy: row.created_by as CalendarEvent['createdBy'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mealPlanToRows(plan: MealPlanEntry[]) {
  const now = new Date().toISOString();
  return plan.map((entry) => ({
    household_id: HOUSEHOLD_ID,
    weekday: entry.weekday,
    breakfast_recipe_id: entry.breakfastRecipeId,
    dinner_recipe_id: entry.dinnerRecipeId,
    recipe_id: entry.dinnerRecipeId,
    updated_at: now,
  }));
}

export function mealPlanFromRows(rows: Record<string, unknown>[]): MealPlanEntry[] {
  const base: MealPlanEntry[] = Array.from({ length: 7 }, (_, i) => ({
    weekday: i as MealPlanEntry['weekday'],
    breakfastRecipeId: null,
    dinnerRecipeId: null,
  }));
  for (const row of rows) {
    const wd = row.weekday as number;
    if (wd >= 0 && wd <= 6) {
      base[wd] = {
        weekday: wd as MealPlanEntry['weekday'],
        breakfastRecipeId: (row.breakfast_recipe_id as string) ?? null,
        dinnerRecipeId:
          (row.dinner_recipe_id as string) ?? (row.recipe_id as string) ?? null,
      };
    }
  }
  return base;
}

export function expenseToRow(expense: Expense) {
  return {
    id: expense.id,
    household_id: HOUSEHOLD_ID,
    expense_date: expense.date,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    source: expense.source,
    created_by: expense.createdBy,
    created_at: expense.createdAt,
  };
}

export function expenseFromRow(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    date: row.expense_date as string,
    description: row.description as string,
    amount: Number(row.amount),
    category: row.category as Expense['category'],
    source: row.source as Expense['source'],
    createdBy: row.created_by as Expense['createdBy'],
    createdAt: row.created_at as string,
  };
}

export function pantryToRow(item: PantryItem) {
  return {
    id: item.id,
    household_id: HOUSEHOLD_ID,
    name: item.name,
    quantity: item.quantity ?? null,
    expires_on: item.expiresOn,
    created_by: item.createdBy,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export function pantryFromRow(row: Record<string, unknown>): PantryItem {
  return {
    id: row.id as string,
    name: row.name as string,
    quantity: (row.quantity as string) ?? undefined,
    expiresOn: row.expires_on as string,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function bureaucracyToRow(deadline: BureaucracyDeadline) {
  return {
    id: deadline.id,
    household_id: HOUSEHOLD_ID,
    template_id: deadline.templateId,
    title: deadline.title,
    category: deadline.category,
    due_date: deadline.dueDate,
    completed: deadline.completed,
    assigned_to: deadline.assignedTo,
    notes: deadline.notes ?? null,
    estimated_cost: deadline.estimatedCost ?? null,
    created_by: deadline.createdBy,
    created_at: deadline.createdAt,
    updated_at: deadline.updatedAt,
  };
}

export function bureaucracyFromRow(row: Record<string, unknown>): BureaucracyDeadline {
  return {
    id: row.id as string,
    templateId: row.template_id as string,
    title: row.title as string,
    category: row.category as BureaucracyDeadline['category'],
    dueDate: row.due_date as string,
    completed: row.completed as boolean,
    assignedTo: row.assigned_to as BureaucracyDeadline['assignedTo'],
    notes: (row.notes as string) ?? undefined,
    estimatedCost: row.estimated_cost != null ? Number(row.estimated_cost) : undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mentalLoadToRow(event: MentalLoadEvent) {
  return {
    id: event.id,
    household_id: HOUSEHOLD_ID,
    user_id: event.userId,
    event_type: event.type,
    weight: event.weight,
    description: event.description,
    event_date: event.date,
    created_at: event.createdAt,
  };
}

export function mentalLoadFromRow(row: Record<string, unknown>): MentalLoadEvent {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.event_type as MentalLoadEvent['type'],
    weight: Number(row.weight),
    description: row.description as string,
    date: row.event_date as string,
    createdAt: row.created_at as string,
  };
}

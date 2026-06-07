import type { RealtimeChannel } from '@supabase/supabase-js';

import type {

  ShoppingListItem,

  ShoppingUsage,

  Task,

  CalendarEvent,

} from '@/lib/sync/types';

import type { MealPlanEntry } from '@/types/meal-plan';

import type { Expense } from '@/types/expense';

import { getSupabaseClient, HOUSEHOLD_ID } from './client';

import {

  shoppingToRow,
  assertShoppingListItem,

  shoppingFromRow,

  shoppingUsageFromRow,

  shoppingUsageToRow,

  taskToRow,

  taskFromRow,

  eventToRow,

  eventFromRow,

  mealPlanToRows,

  mealPlanFromRows,

  expenseToRow,

  expenseFromRow,

} from './mappers';



export type SyncTable =

  | 'shopping_items'

  | 'shopping_usage'

  | 'tasks'

  | 'calendar_events'

  | 'meal_plan'

  | 'expenses';



export interface HouseholdData {

  shopping: ShoppingListItem[];

  shoppingUsage: ShoppingUsage[];

  tasks: Task[];

  events: CalendarEvent[];

  mealPlan: MealPlanEntry[];

  expenses: Expense[];

}



export async function fetchAllData(): Promise<HouseholdData | null> {

  const sb = getSupabaseClient();

  if (!sb) return null;



  const [shoppingRes, usageRes, tasksRes, eventsRes, mealRes, expensesRes] = await Promise.all([

    sb.from('shopping_items').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at', { ascending: false }),

    sb.from('shopping_usage').select('*').eq('household_id', HOUSEHOLD_ID).order('usage_count', { ascending: false }),

    sb.from('tasks').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at', { ascending: true }),

    sb.from('calendar_events').select('*').eq('household_id', HOUSEHOLD_ID).order('start_date', { ascending: true }),

    sb.from('meal_plan').select('*').eq('household_id', HOUSEHOLD_ID),

    sb.from('expenses').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at', { ascending: false }),

  ]);



  if (shoppingRes.error) throw shoppingRes.error;

  if (usageRes.error) throw usageRes.error;

  if (tasksRes.error) throw tasksRes.error;

  if (eventsRes.error) throw eventsRes.error;

  if (mealRes.error) throw mealRes.error;

  if (expensesRes.error) throw expensesRes.error;



  return {

    shopping: (shoppingRes.data ?? []).map((r) => shoppingFromRow(r)),

    shoppingUsage: (usageRes.data ?? []).map((r) => shoppingUsageFromRow(r)),

    tasks: (tasksRes.data ?? []).map((r) => taskFromRow(r)),

    events: (eventsRes.data ?? []).map((r) => eventFromRow(r)),

    mealPlan: mealPlanFromRows(mealRes.data ?? []),

    expenses: (expensesRes.data ?? []).map((r) => expenseFromRow(r)),

  };

}



export async function migrateLocalToCloud(local: HouseholdData): Promise<void> {

  const sb = getSupabaseClient();

  if (!sb) return;



  if (local.shopping.length > 0) {

    await sb.from('shopping_items').upsert(local.shopping.map(shoppingToRow));

  }

  if (local.tasks.length > 0) {

    await sb.from('tasks').upsert(local.tasks.map(taskToRow));

  }

  if (local.events.length > 0) {

    await sb.from('calendar_events').upsert(local.events.map(eventToRow));

  }

  if (local.expenses.length > 0) {

    await sb.from('expenses').upsert(local.expenses.map(expenseToRow));

  }

  await sb.from('meal_plan').upsert(mealPlanToRows(local.mealPlan));

}



// ── Shopping ──

export async function upsertShoppingItem(item: ShoppingListItem) {
  const sb = getSupabaseClient();
  if (!sb) return;

  const validItem = assertShoppingListItem(item, 'upsertShoppingItem');
  const { error } = await sb.from('shopping_items').upsert(shoppingToRow(validItem));
  if (error) throw error;
}



export async function deleteShoppingItem(id: string) {

  const sb = getSupabaseClient();

  if (!sb) return;



  const trimmedId = id?.trim();

  if (!trimmedId) {

    throw new Error('deleteShoppingItem: id is required');

  }



  const { error } = await sb

    .from('shopping_items')

    .delete()

    .eq('id', trimmedId)

    .eq('household_id', HOUSEHOLD_ID);



  if (error) throw error;

}



export async function incrementShoppingUsage(

  name: string,

  category: ShoppingListItem['category'],

): Promise<ShoppingUsage> {

  const sb = getSupabaseClient();

  const now = new Date().toISOString();

  if (!sb) {

    return { name, category, usageCount: 1, updatedAt: now };

  }



  const { data: rows, error: fetchError } = await sb

    .from('shopping_usage')

    .select('*')

    .eq('household_id', HOUSEHOLD_ID)

    .ilike('name', name);



  if (fetchError) throw fetchError;



  const existing = (rows ?? []).find(

    (row) => (row.name as string).toLowerCase() === name.toLowerCase(),

  );



  if (existing) {

    const updated = shoppingUsageFromRow({

      ...existing,

      usage_count: Number(existing.usage_count) + 1,

      updated_at: now,

      category,

    });

    const { error } = await sb.from('shopping_usage').upsert(shoppingUsageToRow(updated));

    if (error) throw error;

    return updated;

  }



  const created: ShoppingUsage = { name, category, usageCount: 1, updatedAt: now };

  const { error } = await sb.from('shopping_usage').insert(shoppingUsageToRow(created));

  if (error) throw error;

  return created;

}



// ── Tasks ──

export async function upsertTask(task: Task) {

  const sb = getSupabaseClient();

  if (!sb) return;

  const { error } = await sb.from('tasks').upsert(taskToRow(task));

  if (error) throw error;

}



export async function deleteTask(id: string) {

  const sb = getSupabaseClient();

  if (!sb) return;

  const { error } = await sb.from('tasks').delete().eq('id', id);

  if (error) throw error;

}



// ── Events ──

export async function upsertEvent(event: CalendarEvent) {

  const sb = getSupabaseClient();

  if (!sb) return;

  const { error } = await sb.from('calendar_events').upsert(eventToRow(event));

  if (error) throw error;

}



export async function deleteEvent(id: string) {

  const sb = getSupabaseClient();

  if (!sb) return;

  const { error } = await sb.from('calendar_events').delete().eq('id', id);

  if (error) throw error;

}



// ── Meal Plan ──

export async function upsertMealPlanEntry(entry: MealPlanEntry) {

  const sb = getSupabaseClient();

  if (!sb) return;

  const { error } = await sb.from('meal_plan').upsert(mealPlanToRows([entry]));

  if (error) throw error;

}



// ── Expenses ──

export async function upsertExpense(expense: Expense) {

  const sb = getSupabaseClient();

  if (!sb) return;

  const { error } = await sb.from('expenses').upsert(expenseToRow(expense));

  if (error) throw error;

}



export async function upsertExpensesBulk(expenses: Expense[]) {

  const sb = getSupabaseClient();

  if (!sb) return;

  const { error } = await sb.from('expenses').upsert(expenses.map(expenseToRow));

  if (error) throw error;

}



export async function deleteExpense(id: string) {

  const sb = getSupabaseClient();

  if (!sb) return;

  const { error } = await sb.from('expenses').delete().eq('id', id);

  if (error) throw error;

}



// ── Realtime ──

export type RealtimeChange =

  | { table: 'shopping_items'; eventType: 'DELETE'; id: string }

  | { table: 'shopping_items'; eventType: 'INSERT' | 'UPDATE'; item: ShoppingListItem }

  | { table: 'shopping_usage'; eventType: 'DELETE'; id: string }

  | { table: 'shopping_usage'; eventType: 'INSERT' | 'UPDATE'; usage: ShoppingUsage }

  | { table: 'tasks'; eventType: 'DELETE'; id: string }

  | { table: 'tasks'; eventType: 'INSERT' | 'UPDATE'; item: Task }

  | { table: 'calendar_events'; eventType: 'DELETE'; id: string }

  | { table: 'calendar_events'; eventType: 'INSERT' | 'UPDATE'; item: CalendarEvent }

  | { table: 'expenses'; eventType: 'DELETE'; id: string }

  | { table: 'expenses'; eventType: 'INSERT' | 'UPDATE'; item: Expense }

  | { table: 'meal_plan'; eventType: 'DELETE'; weekday: number }

  | { table: 'meal_plan'; eventType: 'INSERT' | 'UPDATE'; entry: MealPlanEntry };



interface PostgresChangePayload {

  eventType: 'INSERT' | 'UPDATE' | 'DELETE';

  old: Record<string, unknown>;

  new: Record<string, unknown>;

}



function belongsToHousehold(row: Record<string, unknown> | null | undefined): boolean {

  if (!row) return true;

  const householdId = row.household_id as string | undefined;

  return !householdId || householdId === HOUSEHOLD_ID;

}



export function parseRealtimeChange(table: SyncTable, payload: PostgresChangePayload): RealtimeChange | null {

  const { eventType, old, new: newRow } = payload;



  if (eventType === 'DELETE') {

    if (!belongsToHousehold(old)) return null;



    if (table === 'meal_plan') {

      const weekday = old.weekday as number | undefined;

      if (weekday === undefined || weekday < 0 || weekday > 6) return null;

      return { table, eventType: 'DELETE', weekday };

    }



    if (table === 'shopping_usage') {

      const name = old.name as string | undefined;

      if (!name) return null;

      return { table, eventType: 'DELETE', id: name };

    }



    const id = old.id as string | undefined;

    if (!id) return null;

    return { table, eventType: 'DELETE', id };

  }



  if (eventType === 'INSERT' || eventType === 'UPDATE') {

    if (!newRow || !belongsToHousehold(newRow)) return null;



    switch (table) {

      case 'shopping_items':

        return { table, eventType, item: shoppingFromRow(newRow) };

      case 'shopping_usage':

        return { table, eventType, usage: shoppingUsageFromRow(newRow) };

      case 'tasks':

        return { table, eventType, item: taskFromRow(newRow) };

      case 'calendar_events':

        return { table, eventType, item: eventFromRow(newRow) };

      case 'expenses':

        return { table, eventType, item: expenseFromRow(newRow) };

      case 'meal_plan': {

        const weekday = newRow.weekday as number | undefined;

        if (weekday === undefined || weekday < 0 || weekday > 6) return null;

        return {

          table,

          eventType,

          entry: {

            weekday: weekday as MealPlanEntry['weekday'],

            breakfastRecipeId: (newRow.breakfast_recipe_id as string) ?? null,

            dinnerRecipeId:

              (newRow.dinner_recipe_id as string) ?? (newRow.recipe_id as string) ?? null,

          },

        };

      }

    }

  }



  return null;

}



const REALTIME_SCHEMA = 'public';
const REALTIME_PUBLICATION = 'supabase_realtime';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

function assertValidHouseholdId(): string {
  const id = HOUSEHOLD_ID?.trim();
  if (!id) {
    throw new Error(
      '[Realtime] VITE_HOUSEHOLD_ID ist undefined oder leer – Subscription abgebrochen.',
    );
  }
  return id;
}

/** Client-Channel-Name: schema:table:household_id (Publication: supabase_realtime) */
function realtimeChannelName(table: SyncTable, householdId: string): string {
  return `${REALTIME_SCHEMA}:${table}:${householdId}`;
}

function householdChannelTopic(table: SyncTable, householdId: string): string {
  return `realtime:${realtimeChannelName(table, householdId)}`;
}

function householdFilter(householdId: string): string {
  return `household_id=eq.${householdId}`;
}

function logRealtimeEvent(table: SyncTable, payload: PostgresChangePayload, householdId: string) {
  console.log('[Realtime Event]', {
    table,
    schema: REALTIME_SCHEMA,
    publication: REALTIME_PUBLICATION,
    channel: realtimeChannelName(table, householdId),
    eventType: payload.eventType,
    householdId,
    filter: householdFilter(householdId),
    old: payload.old,
    new: payload.new,
  });
}

async function removeHouseholdChannel(
  sb: NonNullable<ReturnType<typeof getSupabaseClient>>,
  table: SyncTable,
  householdId: string,
) {
  const topic = householdChannelTopic(table, householdId);
  const existing = sb.getChannels().find((c) => c.topic === topic);
  if (existing) {
    await sb.removeChannel(existing);
  }
}

interface TableSubscription {
  channel: RealtimeChannel | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  reconnectAttempts: number;
  disposed: boolean;
}

async function subscribeTable(
  sb: NonNullable<ReturnType<typeof getSupabaseClient>>,
  table: SyncTable,
  householdId: string,
  onChange: (change: RealtimeChange) => void,
  sub: TableSubscription,
): Promise<void> {
  if (sub.disposed) return;

  await removeHouseholdChannel(sb, table, householdId);

  const channelName = realtimeChannelName(table, householdId);
  const filter = householdFilter(householdId);

  console.log('[Realtime] Verbinde Kanal', {
    channel: channelName,
    table,
    schema: REALTIME_SCHEMA,
    publication: REALTIME_PUBLICATION,
    filter,
    householdId,
  });

  const channel = sb
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: REALTIME_SCHEMA,
        table,
        filter,
      },
      (payload) => {
        const pgPayload = payload as PostgresChangePayload;
        logRealtimeEvent(table, pgPayload, householdId);

        const change = parseRealtimeChange(table, pgPayload);
        if (change) {
          console.log('[Realtime] Weiterleitung an AppDataContext:', change);
          onChange(change);
        } else {
          console.log('[Realtime] Event ignoriert (kein gültiger Change)', { table });
        }
      },
    )
    .subscribe((status, err) => {
      console.log('Realtime-Kanal-Status:', status, {
        table,
        channel: channelName,
        publication: REALTIME_PUBLICATION,
        householdId,
        filter,
        error: err?.message ?? err ?? null,
      });

      if (status === 'SUBSCRIBED') {
        sub.reconnectAttempts = 0;
        return;
      }

      if (sub.disposed) return;

      const errorMessage = `[Realtime] Kanal ${channelName} nicht SUBSCRIBED (Status: ${status})`;
      console.error(errorMessage, err ?? '');

      if (sub.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error(
          `${errorMessage} – Reconnect-Limit (${MAX_RECONNECT_ATTEMPTS}) erreicht. Sync für ${table} pausiert.`,
        );
        return;
      }

      sub.reconnectAttempts += 1;
      if (sub.reconnectTimer) clearTimeout(sub.reconnectTimer);

      sub.reconnectTimer = setTimeout(() => {
        sub.reconnectTimer = null;
        console.log('[Realtime] Reconnect-Versuch', {
          table,
          attempt: sub.reconnectAttempts,
          maxAttempts: MAX_RECONNECT_ATTEMPTS,
        });
        void subscribeTable(sb, table, householdId, onChange, sub);
      }, RECONNECT_DELAY_MS);
    });

  sub.channel = channel;
}

export async function subscribeToHousehold(
  onChange: (change: RealtimeChange) => void,
): Promise<() => void> {
  const sb = getSupabaseClient();
  if (!sb) return () => {};

  const householdId = assertValidHouseholdId();

  const tables: SyncTable[] = [
    'shopping_items',
    'shopping_usage',
    'tasks',
    'calendar_events',
    'meal_plan',
    'expenses',
  ];

  const subscriptions: TableSubscription[] = tables.map(() => ({
    channel: null,
    reconnectTimer: null,
    reconnectAttempts: 0,
    disposed: false,
  }));

  console.log('[Realtime] Starte Household-Subscriptions', {
    householdId,
    publication: REALTIME_PUBLICATION,
    tables,
  });

  await Promise.all(
    tables.map((table, index) =>
      subscribeTable(sb, table, householdId, onChange, subscriptions[index]),
    ),
  );

  return () => {
    for (const sub of subscriptions) {
      sub.disposed = true;
      if (sub.reconnectTimer) {
        clearTimeout(sub.reconnectTimer);
        sub.reconnectTimer = null;
      }
      if (sub.channel) {
        void sb.removeChannel(sub.channel);
        sub.channel = null;
      }
    }
  };
}



import {

  createContext,

  useContext,

  useState,

  useCallback,

  useEffect,

  useRef,

  type ReactNode,

} from 'react';

import type { Expense, ExpenseCategory } from '@/types/expense';
import type { PantryItem } from '@/types/pantry';
import type { BureaucracyDeadline } from '@/types/bureaucracy-deadline';
import type { MentalLoadEvent, MentalLoadType } from '@/types/mental-load';
import { MENTAL_LOAD_WEIGHTS } from '@/types/mental-load';
import { toDateKey } from '@/lib/calendar-utils';

import {
  createDefaultMealPlan,
  normalizeMealPlanEntry,
  type MealPlanEntry,
  type MealSlot,
} from '@/types/meal-plan';

import type {

  ShoppingListItem,

  ShoppingUsage,

  Task,

  CalendarEvent,

} from '@/lib/sync/types';

import { defaultQuantityForName, initialOrIncrementQuantity } from '@/lib/quantity-utils';

import type { Ingredient } from '@/types/recipe';

import { loadFromStorage, saveToStorage, createId, subscribeToStorage } from '@/lib/storage';

import { ingredientCategoryToShopping } from '@/lib/shopping-categories';

import { isSupabaseConfigured } from '@/lib/supabase/client';

import { useUser } from '@/context/UserContext';

import {
  formatPartnerActivity,
  getActorFromChange,
  getHighlightIdFromChange,
  type LiveActivity,
} from '@/lib/live-activity';

import {

  fetchAllData,

  migrateLocalToCloud,

  upsertShoppingItem,

  deleteShoppingItem,

  upsertTask,

  deleteTask,

  upsertEvent,

  deleteEvent,

  upsertMealPlanEntry,

  upsertExpense,

  upsertExpensesBulk,

  deleteExpense,

  incrementShoppingUsage,

  subscribeToHousehold,

  upsertPantryItem,

  deletePantryItem,

  upsertBureaucracyDeadline,

  deleteBureaucracyDeadline,

  upsertMentalLoadEvent,

  type RealtimeChange,

} from '@/lib/supabase/sync';



const KEYS = {

  expenses: 'haushalt-expenses',

  shopping: 'haushalt-shopping',

  shoppingUsage: 'haushalt-shopping-usage',

  tasks: 'haushalt-tasks',

  events: 'haushalt-events',

  mealPlan: 'haushalt-mealplan',

  pantry: 'haushalt-pantry',

  bureaucracy: 'haushalt-bureaucracy',

  mentalLoad: 'haushalt-mental-load',

} as const;



const PREFAB_TASK_IDS = new Set(['t1', 't2', 't3', 't4', 't5']);



function loadTasksWithoutPrefab(): Task[] {

  const stored = loadFromStorage<Task[]>(KEYS.tasks, []);

  const cleaned = stored.filter((t) => !PREFAB_TASK_IDS.has(t.id));

  if (cleaned.length !== stored.length) {

    saveToStorage(KEYS.tasks, cleaned);

  }

  return cleaned;

}



const DEFAULT_MEAL_PLAN = createDefaultMealPlan();

function loadMealPlan(): MealPlanEntry[] {
  const stored = loadFromStorage<Record<string, unknown>[]>(KEYS.mealPlan, []);
  if (!stored.length) return DEFAULT_MEAL_PLAN;
  return stored.map((entry) => normalizeMealPlanEntry(entry));
}



const EMPTY_EXPENSES: Expense[] = [];

const EMPTY_SHOPPING: ShoppingListItem[] = [];

const EMPTY_EVENTS: CalendarEvent[] = [];



export type SyncStatus = 'local' | 'connecting' | 'live' | 'error';

export interface AppToast {
  id: string;
  message: string;
  type: 'info' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

interface AppDataContextValue {

  syncStatus: SyncStatus;

  isLiveSync: boolean;

  activityFeed: LiveActivity[];

  toasts: AppToast[];

  showToast: (message: string, type?: AppToast['type']) => void;

  dismissToast: (id: string) => void;

  reconnectSync: () => Promise<void>;

  highlightedIds: Set<string>;



  expenses: Expense[];

  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void;

  addExpensesBulk: (items: Omit<Expense, 'id' | 'createdAt'>[]) => void;

  removeExpense: (id: string) => void;



  isShoppingBusy: boolean;

  shoppingItems: ShoppingListItem[];

  addShoppingItem: (name: string, category: ShoppingListItem['category'], quantity?: string, createdBy?: string) => Promise<void>;

  addIngredientsToShopping: (ingredients: Ingredient[], createdBy: string) => Promise<void>;

  toggleShoppingItem: (id: string) => Promise<void>;

  updateShoppingItem: (id: string, updates: { quantity?: string; name?: string }) => Promise<void>;

  removeShoppingItem: (id: string) => Promise<void>;

  clearCheckedShopping: () => Promise<void>;

  shoppingUsage: ShoppingUsage[];



  tasks: Task[];

  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;

  toggleTask: (id: string) => void;

  assignTask: (id: string, assignedTo: Task['assignedTo']) => void;

  removeTask: (id: string) => void;



  events: CalendarEvent[];

  addEvent: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;

  removeEvent: (id: string) => void;



  mealPlan: MealPlanEntry[];

  setMealForDay: (weekday: number, slot: MealSlot, recipeId: string | null) => void;



  pantryItems: PantryItem[];

  addPantryItem: (data: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;

  removePantryItem: (id: string) => void;



  bureaucracyDeadlines: BureaucracyDeadline[];

  addBureaucracyDeadline: (data: Omit<BureaucracyDeadline, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;

  toggleBureaucracyDeadline: (id: string) => void;

  removeBureaucracyDeadline: (id: string) => void;



  mentalLoadEvents: MentalLoadEvent[];

  recordMentalLoad: (userId: string, type: MentalLoadType, description: string) => void;

}



const AppDataContext = createContext<AppDataContextValue | null>(null);



function loadLocalData() {

  return {

    expenses: loadFromStorage<Expense[]>(KEYS.expenses, EMPTY_EXPENSES),

    shopping: loadFromStorage<ShoppingListItem[]>(KEYS.shopping, EMPTY_SHOPPING),

    shoppingUsage: loadFromStorage<ShoppingUsage[]>(KEYS.shoppingUsage, []),

    tasks: loadTasksWithoutPrefab(),

    events: loadFromStorage<CalendarEvent[]>(KEYS.events, EMPTY_EVENTS),

    mealPlan: loadMealPlan(),

    pantry: loadFromStorage<PantryItem[]>(KEYS.pantry, []),

    bureaucracyDeadlines: loadFromStorage<BureaucracyDeadline[]>(KEYS.bureaucracy, []),

    mentalLoad: loadFromStorage<MentalLoadEvent[]>(KEYS.mentalLoad, []),

  };

}



function cacheLocally(data: ReturnType<typeof loadLocalData>) {

  saveToStorage(KEYS.expenses, data.expenses);

  saveToStorage(KEYS.shopping, data.shopping);

  saveToStorage(KEYS.shoppingUsage, data.shoppingUsage);

  saveToStorage(KEYS.tasks, data.tasks);

  saveToStorage(KEYS.events, data.events);

  saveToStorage(KEYS.mealPlan, data.mealPlan);

  saveToStorage(KEYS.pantry, data.pantry);

  saveToStorage(KEYS.bureaucracy, data.bureaucracyDeadlines);

  saveToStorage(KEYS.mentalLoad, data.mentalLoad);

}



function mergeShoppingUsage(prev: ShoppingUsage[], usage: ShoppingUsage): ShoppingUsage[] {

  const key = usage.name.toLowerCase();

  const without = prev.filter((u) => u.name.toLowerCase() !== key);

  return [usage, ...without];

}



function incrementShoppingUsageLocal(

  prev: ShoppingUsage[],

  name: string,

  category: ShoppingListItem['category'],

): ShoppingUsage[] {

  const now = new Date().toISOString();

  const key = name.toLowerCase();

  const existing = prev.find((u) => u.name.toLowerCase() === key);

  if (existing) {

    return prev.map((u) =>

      u.name.toLowerCase() === key

        ? { ...u, usageCount: u.usageCount + 1, category, updatedAt: now }

        : u,

    );

  }

  return [{ name, category, usageCount: 1, updatedAt: now }, ...prev];

}



function upsertShoppingItemInList(

  prev: ShoppingListItem[],

  name: string,

  category: ShoppingListItem['category'],

  quantity: string | undefined,

  createdBy: string,

): { next: ShoppingListItem[]; item: ShoppingListItem } {

  const now = new Date().toISOString();

  const fallbackQty = defaultQuantityForName(name, quantity);

  const existing = prev.find(

    (i) => i.name.toLowerCase() === name.toLowerCase() && !i.checked,

  );



  if (existing?.id?.trim()) {

    const item: ShoppingListItem = {

      id: existing.id,

      name: existing.name,

      category,

      checked: existing.checked,

      quantity: initialOrIncrementQuantity(existing.quantity, fallbackQty),

      createdBy: existing.createdBy,

      createdAt: existing.createdAt,

      updatedAt: now,

    };

    return {

      next: prev.map((i) => (i.id === existing.id ? item : i)),

      item,

    };

  }



  const item: ShoppingListItem = {

    id: createId(),

    name,

    category,

    quantity: fallbackQty,

    checked: false,

    createdBy,

    createdAt: now,

    updatedAt: now,

  };

  return { next: [item, ...prev], item };

}



function mergeShoppingItemIntoList(prev: ShoppingListItem[], item: ShoppingListItem): ShoppingListItem[] {

  if (prev.some((i) => i.id === item.id)) {

    return prev.map((i) => (i.id === item.id ? item : i));

  }



  const nameKey = item.name.toLowerCase();

  const withoutUncheckedDuplicates = prev.filter(

    (i) => i.checked || i.name.toLowerCase() !== nameKey,

  );



  return [item, ...withoutUncheckedDuplicates];

}



export function AppDataProvider({ children }: { children: ReactNode }) {

  const { userId } = useUser();

  const local = loadLocalData();

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(

    isSupabaseConfigured ? 'connecting' : 'local',

  );

  const [syncGeneration, setSyncGeneration] = useState(0);

  const [activityFeed, setActivityFeed] = useState<LiveActivity[]>([]);

  const [toasts, setToasts] = useState<AppToast[]>([]);

  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const [expenses, setExpenses] = useState<Expense[]>(local.expenses);

  const [shoppingItems, setShoppingItems] = useState<ShoppingListItem[]>(local.shopping);

  const [shoppingUsage, setShoppingUsage] = useState<ShoppingUsage[]>(local.shoppingUsage);

  const [tasks, setTasks] = useState<Task[]>(local.tasks);

  const [events, setEvents] = useState<CalendarEvent[]>(local.events);

  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(local.mealPlan);

  const [pantryItems, setPantryItems] = useState<PantryItem[]>(local.pantry);

  const [bureaucracyDeadlines, setBureaucracyDeadlines] = useState<BureaucracyDeadline[]>(local.bureaucracyDeadlines);

  const [mentalLoadEvents, setMentalLoadEvents] = useState<MentalLoadEvent[]>(local.mentalLoad);

  const [isShoppingBusy, setIsShoppingBusy] = useState(false);



  const syncWriteRef = useRef(false);
  const shoppingItemsRef = useRef(shoppingItems);

  const useCloud = isSupabaseConfigured && syncStatus === 'live';

  useEffect(() => {
    shoppingItemsRef.current = shoppingItems;
  }, [shoppingItems]);



  const applyCloudData = useCallback((data: NonNullable<Awaited<ReturnType<typeof fetchAllData>>>) => {

    setExpenses(data.expenses);

    setShoppingItems(data.shopping);

    shoppingItemsRef.current = data.shopping;

    setShoppingUsage(data.shoppingUsage);

    setTasks(data.tasks);

    setEvents(data.events);

    setMealPlan(data.mealPlan);

    setPantryItems(data.pantry);

    setBureaucracyDeadlines(data.bureaucracyDeadlines);

    setMentalLoadEvents(data.mentalLoad);

    cacheLocally(data);

  }, []);



  const bumpShoppingUsage = useCallback(async (name: string, category: ShoppingListItem['category']) => {

    if (useCloud) {

      try {

        const updated = await incrementShoppingUsage(name, category);

        setShoppingUsage((prev) => {

          const next = mergeShoppingUsage(prev, updated);

          saveToStorage(KEYS.shoppingUsage, next);

          return next;

        });

      } catch (err) {

        console.error('[Supabase Usage]', err);

      }

      return;

    }



    setShoppingUsage((prev) => {

      const next = incrementShoppingUsageLocal(prev, name, category);

      saveToStorage(KEYS.shoppingUsage, next);

      return next;

    });

  }, [useCloud]);



  const showToast = useCallback((message: string, type: AppToast['type'] = 'info') => {

    const id = createId();

    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {

      setToasts((prev) => prev.filter((t) => t.id !== id));

    }, 4000);

  }, []);



  const dismissToast = useCallback((id: string) => {

    setToasts((prev) => prev.filter((t) => t.id !== id));

  }, []);



  const pushActivity = useCallback((activity: LiveActivity) => {

    setActivityFeed((prev) => [activity, ...prev].slice(0, 20));

  }, []);



  const flashHighlight = useCallback((id: string) => {

    setHighlightedIds((prev) => new Set(prev).add(id));

    window.setTimeout(() => {

      setHighlightedIds((prev) => {

        const next = new Set(prev);

        next.delete(id);

        return next;

      });

    }, 1200);

  }, []);



  const reconnectSync = useCallback(async () => {

    setSyncGeneration((g) => g + 1);

  }, []);



  const applyRealtimeChange = useCallback((change: RealtimeChange) => {

    switch (change.table) {

      case 'shopping_items':

        if (change.eventType === 'DELETE') {

          setShoppingItems((prev) => {

            const next = prev.filter((i) => i.id !== change.id);

            saveToStorage(KEYS.shopping, next);

            return next;

          });

        } else {

          setShoppingItems((prev) => {

            const next = mergeShoppingItemIntoList(prev, change.item);

            saveToStorage(KEYS.shopping, next);

            return next;

          });

        }

        break;

      case 'shopping_usage':

        if (change.eventType === 'DELETE') {

          setShoppingUsage((prev) => {

            const next = prev.filter((u) => u.name.toLowerCase() !== change.id.toLowerCase());

            saveToStorage(KEYS.shoppingUsage, next);

            return next;

          });

        } else {

          setShoppingUsage((prev) => {

            const next = mergeShoppingUsage(prev, change.usage);

            saveToStorage(KEYS.shoppingUsage, next);

            return next;

          });

        }

        break;

      case 'tasks':

        if (change.eventType === 'DELETE') {

          setTasks((prev) => {

            const next = prev.filter((t) => t.id !== change.id);

            saveToStorage(KEYS.tasks, next);

            return next;

          });

        } else {

          setTasks((prev) => {

            const next = prev.some((t) => t.id === change.item.id)

              ? prev.map((t) => (t.id === change.item.id ? change.item : t))

              : [...prev, change.item];

            saveToStorage(KEYS.tasks, next);

            return next;

          });

        }

        break;

      case 'calendar_events':

        if (change.eventType === 'DELETE') {

          setEvents((prev) => {

            const next = prev.filter((e) => e.id !== change.id);

            saveToStorage(KEYS.events, next);

            return next;

          });

        } else {

          setEvents((prev) => {

            const next = prev.some((e) => e.id === change.item.id)

              ? prev.map((e) => (e.id === change.item.id ? change.item : e))

              : [...prev, change.item];

            saveToStorage(KEYS.events, next);

            return next;

          });

        }

        break;

      case 'expenses':

        if (change.eventType === 'DELETE') {

          setExpenses((prev) => {

            const next = prev.filter((e) => e.id !== change.id);

            saveToStorage(KEYS.expenses, next);

            return next;

          });

        } else {

          setExpenses((prev) => {

            const next = prev.some((e) => e.id === change.item.id)

              ? prev.map((e) => (e.id === change.item.id ? change.item : e))

              : [change.item, ...prev];

            saveToStorage(KEYS.expenses, next);

            return next;

          });

        }

        break;

      case 'meal_plan':

        setMealPlan((prev) => {

          const entry =

            change.eventType === 'DELETE'

              ? {
                  weekday: change.weekday as MealPlanEntry['weekday'],
                  breakfastRecipeId: null,
                  dinnerRecipeId: null,
                }

              : change.entry;

          const next = prev.map((e) => (e.weekday === entry.weekday ? entry : e));

          saveToStorage(KEYS.mealPlan, next);

          return next;

        });

        break;

      case 'pantry_items':

        if (change.eventType === 'DELETE') {

          setPantryItems((prev) => {

            const next = prev.filter((p) => p.id !== change.id);

            saveToStorage(KEYS.pantry, next);

            return next;

          });

        } else {

          setPantryItems((prev) => {

            const next = prev.some((p) => p.id === change.item.id)

              ? prev.map((p) => (p.id === change.item.id ? change.item : p))

              : [...prev, change.item];

            saveToStorage(KEYS.pantry, next);

            return next;

          });

        }

        break;

      case 'bureaucracy_deadlines':

        if (change.eventType === 'DELETE') {

          setBureaucracyDeadlines((prev) => {

            const next = prev.filter((d) => d.id !== change.id);

            saveToStorage(KEYS.bureaucracy, next);

            return next;

          });

        } else {

          setBureaucracyDeadlines((prev) => {

            const next = prev.some((d) => d.id === change.item.id)

              ? prev.map((d) => (d.id === change.item.id ? change.item : d))

              : [...prev, change.item];

            saveToStorage(KEYS.bureaucracy, next);

            return next;

          });

        }

        break;

      case 'mental_load_events':

        if (change.eventType === 'DELETE') {

          setMentalLoadEvents((prev) => {

            const next = prev.filter((e) => e.id !== change.id);

            saveToStorage(KEYS.mentalLoad, next);

            return next;

          });

        } else {

          setMentalLoadEvents((prev) => {

            const next = prev.some((e) => e.id === change.item.id)

              ? prev.map((e) => (e.id === change.item.id ? change.item : e))

              : [change.item, ...prev];

            saveToStorage(KEYS.mentalLoad, next);

            return next;

          });

        }

        break;

    }

  }, []);



  useEffect(() => {

    if (!isSupabaseConfigured) return;



    let cancelled = false;

    let unsubscribe = () => {};



    (async () => {

      try {

        setSyncStatus('connecting');

        const cloud = await fetchAllData();

        if (cancelled) return;



        const localData = loadLocalData();



        if (!cloud) {

          setSyncStatus('error');

          return;

        }



        const cloudEmpty =

          cloud.shopping.length === 0 &&

          cloud.tasks.length === 0 &&

          cloud.events.length === 0 &&

          cloud.expenses.length === 0;



        const localHasData =

          localData.shopping.length > 0 ||

          localData.tasks.length > 0 ||

          localData.events.length > 0 ||

          localData.expenses.length > 0;



        if (cloudEmpty && localHasData) {

          await migrateLocalToCloud(localData);

          if (cancelled) return;

          applyCloudData(localData);

        } else {

          applyCloudData(cloud);

        }



        if (cancelled) return;



        setSyncStatus('live');



        unsubscribe();

        unsubscribe = await subscribeToHousehold((change) => {

          if (cancelled) return;



          const actor = getActorFromChange(change);

          const currentUserId = userIdRef.current;

          if (actor && currentUserId && actor !== currentUserId) {

            const msg = formatPartnerActivity(change);

            if (msg) {

              pushActivity({

                id: createId(),

                message: msg,

                createdBy: actor,

                at: new Date().toISOString(),

              });

              showToast(msg, 'info');

            }

            const highlightId = getHighlightIdFromChange(change);

            if (highlightId) flashHighlight(highlightId);

          }



          if (change.table === 'shopping_items') {

            applyRealtimeChange(change);

            return;

          }

          if (change.eventType !== 'DELETE' && syncWriteRef.current) return;

          applyRealtimeChange(change);

        });

      } catch (err) {

        if (!cancelled) {

          console.error('[Supabase Sync]', err);

          setSyncStatus('error');

        }

      }

    })();



    return () => {

      cancelled = true;

      unsubscribe();

    };

  }, [applyCloudData, applyRealtimeChange, syncGeneration, pushActivity, showToast, flashHighlight]);



  const prevSyncStatusRef = useRef<SyncStatus>(syncStatus);

  useEffect(() => {

    if (prevSyncStatusRef.current !== 'error' && syncStatus === 'error') {

      showToast('Sync-Verbindung fehlgeschlagen — nach unten ziehen zum Neuverbinden', 'error');

    }

    prevSyncStatusRef.current = syncStatus;

  }, [syncStatus, showToast]);



  useEffect(() => {

    if (useCloud) return;

    saveToStorage(KEYS.expenses, expenses);

  }, [expenses, useCloud]);



  useEffect(() => {

    if (useCloud) return;

    saveToStorage(KEYS.shopping, shoppingItems);

  }, [shoppingItems, useCloud]);



  useEffect(() => {

    if (useCloud) return;

    saveToStorage(KEYS.tasks, tasks);

  }, [tasks, useCloud]);



  useEffect(() => {

    if (useCloud) return;

    saveToStorage(KEYS.events, events);

  }, [events, useCloud]);



  useEffect(() => {

    if (useCloud) return;

    saveToStorage(KEYS.mealPlan, mealPlan);

  }, [mealPlan, useCloud]);



  useEffect(() => {

    if (useCloud) return;

    saveToStorage(KEYS.pantry, pantryItems);

  }, [pantryItems, useCloud]);



  useEffect(() => {

    if (useCloud) return;

    saveToStorage(KEYS.bureaucracy, bureaucracyDeadlines);

  }, [bureaucracyDeadlines, useCloud]);



  useEffect(() => {

    if (useCloud) return;

    saveToStorage(KEYS.mentalLoad, mentalLoadEvents);

  }, [mentalLoadEvents, useCloud]);



  useEffect(() => {

    if (useCloud) return;

    return subscribeToStorage(KEYS.tasks, () => setTasks(loadTasksWithoutPrefab()));

  }, [useCloud]);



  const cloudWrite = useCallback(async (fn: () => Promise<void>, options?: { skipEchoGuard?: boolean }) => {

    if (!options?.skipEchoGuard) syncWriteRef.current = true;

    try {

      if (useCloud) {

        await fn();

      }

    } catch (err) {

      console.error('[Supabase Write]', err);

      throw err;

    } finally {

      if (!options?.skipEchoGuard) {

        setTimeout(() => { syncWriteRef.current = false; }, 400);

      }

    }

  }, [useCloud]);



  const addExpense = useCallback((data: Omit<Expense, 'id' | 'createdAt'>) => {

    const expense: Expense = { ...data, id: createId(), createdAt: new Date().toISOString() };

    setExpenses((prev) => [expense, ...prev]);

    void cloudWrite(() => upsertExpense(expense));

  }, [cloudWrite]);



  const addExpensesBulk = useCallback((items: Omit<Expense, 'id' | 'createdAt'>[]) => {

    const now = new Date().toISOString();

    const newExpenses = items.map((item) => ({ ...item, id: createId(), createdAt: now }));

    setExpenses((prev) => [...newExpenses, ...prev]);

    void cloudWrite(() => upsertExpensesBulk(newExpenses));

  }, [cloudWrite]);



  const removeExpense = useCallback((id: string) => {

    setExpenses((prev) => prev.filter((e) => e.id !== id));

    void cloudWrite(() => deleteExpense(id), { skipEchoGuard: true });

  }, [cloudWrite]);



  const addShoppingItem = useCallback(async (

    name: string,

    category: ShoppingListItem['category'],

    quantity?: string,

    createdBy: string = 'user1',

  ) => {

    setIsShoppingBusy(true);

    try {

      const result = upsertShoppingItemInList(

        shoppingItemsRef.current,

        name,

        category,

        quantity,

        createdBy,

      );

      if (!result.item?.id?.trim()) {

        throw new Error('addShoppingItem: Item ohne gültige id erstellt');

      }

      shoppingItemsRef.current = result.next;

      setShoppingItems(result.next);

      saveToStorage(KEYS.shopping, result.next);

      const itemToSync = result.item;

      await cloudWrite(() => upsertShoppingItem(itemToSync));

      await bumpShoppingUsage(name, category);

    } finally {

      setIsShoppingBusy(false);

    }

  }, [bumpShoppingUsage, cloudWrite]);



  const addIngredientsToShopping = useCallback(async (ingredients: Ingredient[], createdBy: string) => {

    for (const ing of ingredients) {

      const category = ingredientCategoryToShopping(ing.category);

      const qty = `${ing.amount} ${ing.unit}`;

      await addShoppingItem(ing.name, category, qty, createdBy);

    }

  }, [addShoppingItem]);



  const toggleShoppingItem = useCallback(async (id: string) => {

    const trimmedId = id?.trim();

    if (!trimmedId) return;

    setIsShoppingBusy(true);

    try {

      const now = new Date().toISOString();

      const updated = shoppingItemsRef.current.map((i) =>

        i.id === trimmedId ? { ...i, checked: !i.checked, updatedAt: now } : i,

      );

      const itemToSync = updated.find((i) => i.id === trimmedId);

      if (!itemToSync?.id?.trim()) return;

      shoppingItemsRef.current = updated;

      setShoppingItems(updated);

      saveToStorage(KEYS.shopping, updated);

      await cloudWrite(() => upsertShoppingItem(itemToSync));

    } finally {

      setIsShoppingBusy(false);

    }

  }, [cloudWrite]);



  const updateShoppingItem = useCallback(async (id: string, updates: { quantity?: string; name?: string }) => {

    const trimmedId = id?.trim();

    if (!trimmedId) return;

    setIsShoppingBusy(true);

    try {

      const now = new Date().toISOString();

      const updated = shoppingItemsRef.current.map((i) =>

        i.id === trimmedId

          ? {

              ...i,

              ...updates,

              quantity: updates.quantity?.trim() || undefined,

              updatedAt: now,

            }

          : i,

      );

      const itemToSync = updated.find((i) => i.id === trimmedId);

      if (!itemToSync?.id?.trim()) return;

      shoppingItemsRef.current = updated;

      setShoppingItems(updated);

      saveToStorage(KEYS.shopping, updated);

      await cloudWrite(() => upsertShoppingItem(itemToSync));

    } finally {

      setIsShoppingBusy(false);

    }

  }, [cloudWrite]);



  const removeShoppingItem = useCallback(async (id: string) => {

    const trimmedId = id?.trim();

    if (!trimmedId) return;



    setIsShoppingBusy(true);

    try {

      setShoppingItems((prev) => {

        const next = prev.filter((i) => i.id !== trimmedId);

        saveToStorage(KEYS.shopping, next);

        return next;

      });

      await cloudWrite(() => deleteShoppingItem(trimmedId), { skipEchoGuard: true });

    } finally {

      setIsShoppingBusy(false);

    }

  }, [cloudWrite]);



  const clearCheckedShopping = useCallback(async () => {

    setIsShoppingBusy(true);

    try {

      let toDelete: ShoppingListItem[] = [];

      setShoppingItems((prev) => {

        toDelete = prev.filter((i) => i.checked);

        const next = prev.filter((i) => !i.checked);

        saveToStorage(KEYS.shopping, next);

        return next;

      });

      for (const item of toDelete) {

        await cloudWrite(() => deleteShoppingItem(item.id), { skipEchoGuard: true });

      }

    } finally {

      setIsShoppingBusy(false);

    }

  }, [cloudWrite]);



  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {

    const now = new Date().toISOString();

    const task: Task = { ...data, id: createId(), completed: false, createdAt: now, updatedAt: now };

    setTasks((prev) => [...prev, task]);

    void cloudWrite(() => upsertTask(task));

  }, [cloudWrite]);



  const toggleTask = useCallback((id: string) => {

    setTasks((prev) => {

      const updated = prev.map((t) =>

        t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t,

      );

      const task = updated.find((t) => t.id === id);

      if (task) void cloudWrite(() => upsertTask(task));

      return updated;

    });

  }, [cloudWrite]);



  const assignTask = useCallback((id: string, assignedTo: Task['assignedTo']) => {

    setTasks((prev) => {

      const updated = prev.map((t) =>

        t.id === id ? { ...t, assignedTo, updatedAt: new Date().toISOString() } : t,

      );

      const task = updated.find((t) => t.id === id);

      if (task) void cloudWrite(() => upsertTask(task));

      return updated;

    });

  }, [cloudWrite]);



  const removeTask = useCallback((id: string) => {

    setTasks((prev) => prev.filter((t) => t.id !== id));

    void cloudWrite(() => deleteTask(id), { skipEchoGuard: true });

  }, [cloudWrite]);



  const addEvent = useCallback((data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {

    const now = new Date().toISOString();

    const event: CalendarEvent = { ...data, id: createId(), createdAt: now, updatedAt: now };

    setEvents((prev) => [...prev, event]);

    void cloudWrite(() => upsertEvent(event));

  }, [cloudWrite]);



  const removeEvent = useCallback((id: string) => {

    setEvents((prev) => prev.filter((e) => e.id !== id));

    void cloudWrite(() => deleteEvent(id), { skipEchoGuard: true });

  }, [cloudWrite]);



  const setMealForDay = useCallback((weekday: number, slot: MealSlot, recipeId: string | null) => {
    setMealPlan((prev) => {
      const next = prev.map((e) => {
        if (e.weekday !== weekday) return e;
        return slot === 'breakfast'
          ? { ...e, breakfastRecipeId: recipeId }
          : { ...e, dinnerRecipeId: recipeId };
      });
      const entry = next.find((e) => e.weekday === weekday)!;
      saveToStorage(KEYS.mealPlan, next);
      void cloudWrite(() => upsertMealPlanEntry(entry));
      return next;
    });
  }, [cloudWrite]);



  const addPantryItem = useCallback((data: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const item: PantryItem = { ...data, id: createId(), createdAt: now, updatedAt: now };
    setPantryItems((prev) => {
      const next = [...prev, item];
      saveToStorage(KEYS.pantry, next);
      return next;
    });
    void cloudWrite(() => upsertPantryItem(item));
  }, [cloudWrite]);



  const removePantryItem = useCallback((id: string) => {
    setPantryItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToStorage(KEYS.pantry, next);
      return next;
    });
    void cloudWrite(() => deletePantryItem(id), { skipEchoGuard: true });
  }, [cloudWrite]);



  const addBureaucracyDeadline = useCallback((
    data: Omit<BureaucracyDeadline, 'id' | 'createdAt' | 'updatedAt' | 'completed'>,
  ) => {
    const now = new Date().toISOString();
    const deadline: BureaucracyDeadline = { ...data, id: createId(), completed: false, createdAt: now, updatedAt: now };
    setBureaucracyDeadlines((prev) => {
      const next = [...prev, deadline];
      saveToStorage(KEYS.bureaucracy, next);
      return next;
    });
    void cloudWrite(() => upsertBureaucracyDeadline(deadline));
  }, [cloudWrite]);



  const toggleBureaucracyDeadline = useCallback((id: string) => {
    setBureaucracyDeadlines((prev) => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, completed: !d.completed, updatedAt: new Date().toISOString() } : d,
      );
      const item = updated.find((d) => d.id === id);
      if (item) void cloudWrite(() => upsertBureaucracyDeadline(item));
      saveToStorage(KEYS.bureaucracy, updated);
      return updated;
    });
  }, [cloudWrite]);



  const removeBureaucracyDeadline = useCallback((id: string) => {
    setBureaucracyDeadlines((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveToStorage(KEYS.bureaucracy, next);
      return next;
    });
    void cloudWrite(() => deleteBureaucracyDeadline(id), { skipEchoGuard: true });
  }, [cloudWrite]);



  const recordMentalLoad = useCallback((userId: string, type: MentalLoadType, description: string) => {
    const now = new Date().toISOString();
    const event: MentalLoadEvent = {
      id: createId(),
      userId,
      type,
      weight: MENTAL_LOAD_WEIGHTS[type],
      description,
      date: toDateKey(new Date()),
      createdAt: now,
    };
    setMentalLoadEvents((prev) => {
      const next = [event, ...prev];
      saveToStorage(KEYS.mentalLoad, next);
      return next;
    });
    void cloudWrite(() => upsertMentalLoadEvent(event));
  }, [cloudWrite]);



  return (

    <AppDataContext.Provider

      value={{

        syncStatus,

        isLiveSync: syncStatus === 'live',

        activityFeed,

        toasts,

        showToast,

        dismissToast,

        reconnectSync,

        highlightedIds,

        expenses,

        addExpense,

        addExpensesBulk,

        removeExpense,

        isShoppingBusy,

        shoppingItems,

        addShoppingItem,

        addIngredientsToShopping,

        toggleShoppingItem,

        updateShoppingItem,

        removeShoppingItem,

        clearCheckedShopping,

        shoppingUsage,

        tasks,

        addTask,

        toggleTask,

        assignTask,

        removeTask,

        events,

        addEvent,

        removeEvent,

        mealPlan,

        setMealForDay,

        pantryItems,

        addPantryItem,

        removePantryItem,

        bureaucracyDeadlines,

        addBureaucracyDeadline,

        toggleBureaucracyDeadline,

        removeBureaucracyDeadline,

        mentalLoadEvents,

        recordMentalLoad,

      }}

    >

      {children}

    </AppDataContext.Provider>

  );

}



export function useAppData() {

  const ctx = useContext(AppDataContext);

  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');

  return ctx;

}



export type { ExpenseCategory };



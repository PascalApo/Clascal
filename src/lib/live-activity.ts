import type { RealtimeChange } from '@/lib/supabase/sync';
import { USER_BASE, type UserId } from '@/types/user';

export interface LiveActivity {
  id: string;
  message: string;
  createdBy: string;
  at: string;
}

function userLabel(id: string): string {
  if (id === 'user1' || id === 'user2') return USER_BASE[id as UserId].name;
  return 'Partner';
}

export function getActorFromChange(change: RealtimeChange): string | null {
  if (change.eventType === 'DELETE') return null;

  switch (change.table) {
    case 'shopping_items':
      return change.item.createdBy;
    case 'tasks':
      return change.item.createdBy;
    case 'calendar_events':
      return change.item.createdBy;
    case 'expenses':
      return change.item.createdBy;
    case 'pantry_items':
      return change.item.createdBy;
    case 'bureaucracy_deadlines':
      return change.item.createdBy;
    case 'mental_load_events':
      return change.item.userId;
    case 'meal_plan':
    case 'shopping_usage':
      return null;
    default:
      return null;
  }
}

export function formatPartnerActivity(change: RealtimeChange): string | null {
  const actor = getActorFromChange(change);
  const name = actor ? userLabel(actor) : 'Partner';

  if (change.eventType === 'DELETE') {
    const labels: Partial<Record<RealtimeChange['table'], string>> = {
      shopping_items: `${name}: Artikel von Einkaufsliste entfernt`,
      tasks: `${name}: Aufgabe gelöscht`,
      calendar_events: `${name}: Termin gelöscht`,
      expenses: `${name}: Ausgabe gelöscht`,
      pantry_items: `${name}: Vorratsartikel entfernt`,
      bureaucracy_deadlines: `${name}: Frist entfernt`,
    };
    return labels[change.table] ?? null;
  }

  switch (change.table) {
    case 'shopping_items': {
      const item = change.item;
      if (item.checked) return `${name}: „${item.name}" abgehakt`;
      return `${name}: „${item.name}" auf Einkaufsliste`;
    }
    case 'tasks': {
      const task = change.item;
      if (task.completed) return `${name}: „${task.title}" erledigt`;
      return `${name}: Aufgabe „${task.title}" hinzugefügt`;
    }
    case 'calendar_events':
      return `${name}: Termin „${change.item.title}"`;
    case 'expenses':
      return `${name}: Ausgabe „${change.item.description}"`;
    case 'meal_plan':
      return `${name}: Essensplan aktualisiert`;
    case 'pantry_items':
      return `${name}: Vorratsartikel „${change.item.name}"`;
    case 'bureaucracy_deadlines':
      return `${name}: Frist „${change.item.title}"`;
    default:
      return null;
  }
}

export function getHighlightIdFromChange(change: RealtimeChange): string | null {
  if (change.eventType === 'DELETE') {
    if ('id' in change && typeof change.id === 'string') return change.id;
    return null;
  }
  switch (change.table) {
    case 'shopping_items':
    case 'tasks':
    case 'calendar_events':
    case 'expenses':
    case 'pantry_items':
    case 'bureaucracy_deadlines':
    case 'mental_load_events':
      return change.item.id;
    default:
      return null;
  }
}

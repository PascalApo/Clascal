import type { Task, CalendarEvent } from '@/lib/sync/types';
import type { MealPlanEntry } from '@/types/meal-plan';
import type { PantryItem } from '@/types/pantry';
import type { BureaucracyDeadline } from '@/types/bureaucracy-deadline';
import type { ShoppingListItem } from '@/lib/sync/types';
import type { RadarCollision } from '@/types/radar';
import { dateToWeekday, eventOccursOnDate, taskOccursOnDate, toDateKey } from '@/lib/calendar-utils';
import { isExpiringSoon } from '@/types/pantry';
import { daysUntilDue } from '@/types/bureaucracy-deadline';

const GUEST_KEYWORDS = ['gäst', 'gaest', 'besuch', 'einlad', 'party', 'feier', 'geburtstag'];

function isGuestEvent(event: CalendarEvent): boolean {
  const text = `${event.title} ${event.description ?? ''}`.toLowerCase();
  return GUEST_KEYWORDS.some((kw) => text.includes(kw));
}

function getWeekDates(today: Date): Date[] {
  const dates: Date[] = [];
  const start = new Date(today);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function detectCollisions(input: {
  tasks: Task[];
  events: CalendarEvent[];
  mealPlan: MealPlanEntry[];
  pantry: PantryItem[];
  deadlines: BureaucracyDeadline[];
  shoppingItems: ShoppingListItem[];
  today?: Date;
}): RadarCollision[] {
  const today = input.today ?? new Date();
  const weekDates = getWeekDates(today);
  const collisions: RadarCollision[] = [];

  const expiring = input.pantry.filter((p) => isExpiringSoon(p, 7, today));
  if (expiring.length > 0) {
    collisions.push({
      id: 'expiry-pantry',
      severity: expiring.some((p) => isExpiringSoon(p, 2, today)) ? 'urgent' : 'warning',
      title: `${expiring.length} Vorrat${expiring.length > 1 ? 's' : ''}-Artikel laufen bald ab`,
      description: expiring.map((p) => p.name).join(', '),
      relatedModule: 'essen',
    });
  }

  const upcomingDeadlines = input.deadlines
    .filter((d) => !d.completed && daysUntilDue(d.dueDate, today) <= 14 && daysUntilDue(d.dueDate, today) >= 0);
  for (const deadline of upcomingDeadlines) {
    const days = daysUntilDue(deadline.dueDate, today);
    collisions.push({
      id: `deadline-${deadline.id}`,
      severity: days <= 3 ? 'urgent' : days <= 7 ? 'warning' : 'info',
      title: deadline.title,
      description: `Frist in ${days} Tag${days !== 1 ? 'en' : ''} (${deadline.dueDate})`,
      date: deadline.dueDate,
      relatedModule: 'buerokratie',
    });
  }

  const guestEvents = input.events.filter((e) =>
    weekDates.some((d) => eventOccursOnDate(e, d)) && isGuestEvent(e),
  );

  for (const guest of guestEvents) {
    const guestDate = new Date(guest.startDate);
    const weekday = dateToWeekday(guestDate);
    const meal = input.mealPlan.find((m) => m.weekday === weekday);
    const hasDinner = Boolean(meal?.dinnerRecipeId);

    collisions.push({
      id: `guest-${guest.id}`,
      severity: hasDinner ? 'info' : 'warning',
      title: `Gäste: ${guest.title}`,
      description: hasDinner
        ? 'Essensplan für diesen Tag ist gesetzt — Portionen ggf. anpassen'
        : 'Noch kein Abendessen geplant — Menü und Einkauf vorbereiten',
      date: toDateKey(guestDate),
      weekday,
      relatedModule: 'essen',
    });
  }

  for (const date of weekDates) {
    const dayTasks = input.tasks.filter((t) => !t.completed && taskOccursOnDate(t, date));
    const dayEvents = input.events.filter((e) => eventOccursOnDate(e, date));
    const load = dayTasks.length + dayEvents.length;

    if (load >= 4) {
      collisions.push({
        id: `busy-${toDateKey(date)}`,
        severity: load >= 6 ? 'urgent' : 'warning',
        title: 'Voller Tag',
        description: `${dayTasks.length} Aufgabe${dayTasks.length !== 1 ? 'n' : ''}, ${dayEvents.length} Termin${dayEvents.length !== 1 ? 'e' : ''}`,
        date: toDateKey(date),
        weekday: dateToWeekday(date),
        relatedModule: 'kalender',
      });
    }
  }

  const openTasks = input.tasks.filter((t) => !t.completed);
  const unassigned = openTasks.filter((t) => t.assignedTo === 'both');
  if (unassigned.length >= 2) {
    collisions.push({
      id: 'unassigned-tasks',
      severity: 'info',
      title: `${unassigned.length} Aufgaben ohne klare Zuweisung`,
      description: 'Radar schlägt eine faire Verteilung vor',
      relatedModule: 'fairness',
    });
  }

  const emptyDinners = input.mealPlan.filter((m) => !m.dinnerRecipeId).length;
  if (emptyDinners >= 4) {
    collisions.push({
      id: 'empty-meals',
      severity: 'info',
      title: `${emptyDinners} Abendessen noch nicht geplant`,
      description: 'Essensplan vervollständigen oder Würfel nutzen',
      relatedModule: 'essen',
    });
  }

  const unchecked = input.shoppingItems.filter((i) => !i.checked).length;
  if (guestEvents.length > 0 && unchecked > 5) {
    collisions.push({
      id: 'shopping-guest',
      severity: 'warning',
      title: 'Einkauf vor Gäste-Besuch',
      description: `${unchecked} Artikel auf der Liste — rechtzeitig einkaufen`,
      relatedModule: 'einkauf',
    });
  }

  const deadlineDates = upcomingDeadlines.map((d) => d.dueDate);
  for (const dateKey of deadlineDates) {
    const date = new Date(dateKey);
    const sameDayEvents = input.events.filter((e) => eventOccursOnDate(e, date));
    const sameDayTasks = input.tasks.filter((t) => !t.completed && taskOccursOnDate(t, date));
    if (sameDayEvents.length + sameDayTasks.length >= 2) {
      collisions.push({
        id: `deadline-busy-${dateKey}`,
        severity: 'warning',
        title: 'Frist trifft auf vollen Tag',
        description: 'Bürokratie-Aufgabe und Kalender kollidieren — Zeit blocken',
        date: dateKey,
        weekday: dateToWeekday(date),
        relatedModule: 'buerokratie',
      });
    }
  }

  return collisions;
}

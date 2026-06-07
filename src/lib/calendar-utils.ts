import type { Task, CalendarEvent } from '@/lib/sync/types';

export const CALENDAR_WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

export const EVENT_COLOR = '#f59e0b';

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateToWeekday(date: Date): Task['weekday'] {
  const jsDay = date.getDay();
  return (jsDay === 0 ? 6 : jsDay - 1) as Task['weekday'];
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = dateToWeekday(firstDay);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function taskOccursOnDate(task: Task, date: Date): boolean {
  if (task.recurring) {
    return task.weekday === dateToWeekday(date);
  }
  if (task.date) {
    return task.date === toDateKey(date);
  }
  return false;
}

export function eventOccursOnDate(event: CalendarEvent, date: Date): boolean {
  const key = toDateKey(date);
  const start = toDateKey(new Date(event.startDate));
  const end = toDateKey(new Date(event.endDate));
  return key >= start && key <= end;
}

export function getItemsForDate(
  date: Date,
  tasks: Task[],
  events: CalendarEvent[],
): { tasks: Task[]; events: CalendarEvent[] } {
  return {
    tasks: tasks.filter((t) => taskOccursOnDate(t, date)),
    events: events.filter((e) => eventOccursOnDate(e, date)),
  };
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });
}

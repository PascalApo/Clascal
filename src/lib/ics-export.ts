import type { CalendarEvent } from '@/lib/sync/types';
import type { Task } from '@/lib/sync/types';

function formatIcsDate(iso: string, allDay: boolean): string {
  const d = new Date(iso);
  if (allDay) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function eventToIcs(event: CalendarEvent): string {
  const uid = `${event.id}@haushalts-app`;
  const dtStart = formatIcsDate(event.startDate, event.allDay);
  const dtEnd = formatIcsDate(event.endDate, event.allDay);
  const startKey = event.allDay ? 'DTSTART;VALUE=DATE' : 'DTSTART';
  const endKey = event.allDay ? 'DTEND;VALUE=DATE' : 'DTEND';

  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : '',
    `${startKey}:${dtStart}`,
    `${endKey}:${dtEnd}`,
    'END:VEVENT',
  ]
    .filter(Boolean)
    .join('\r\n');
}

function taskToIcs(task: Task, weekOffset = 0): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);

  const taskDate = new Date(monday);
  taskDate.setDate(monday.getDate() + task.weekday);

  const y = taskDate.getFullYear();
  const m = String(taskDate.getMonth() + 1).padStart(2, '0');
  const d = String(taskDate.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;

  return [
    'BEGIN:VEVENT',
    `UID:task-${task.id}@haushalts-app`,
    `SUMMARY:${escapeIcs(`🧹 ${task.title}`)}`,
    `DESCRIPTION:Aufgabe – zugewiesen: ${task.assignedTo === 'both' ? 'Beide' : task.assignedTo === 'user1' ? 'Clara' : 'Pascal'}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    'RRULE:FREQ=WEEKLY',
    'END:VEVENT',
  ].join('\r\n');
}

export function generateIcs(events: CalendarEvent[], tasks: Task[]): string {
  const body = [
    ...events.map(eventToIcs),
    ...tasks.filter((t) => t.recurring).map((t) => taskToIcs(t)),
  ].join('\r\n');

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Haushalts-App//DE', 'CALSCALE:GREGORIAN', body, 'END:VCALENDAR'].join('\r\n');
}

export function downloadIcs(content: string, filename = 'haushalt-kalender.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

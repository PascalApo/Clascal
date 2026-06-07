import type { Task, CalendarEvent } from '@/lib/sync/types';
import type { MentalLoadEvent } from '@/types/mental-load';
import type { UserId } from '@/types/user';
import type { RadarAssignment, FairnessReport } from '@/types/radar';
import { dateToWeekday, eventOccursOnDate, taskOccursOnDate, toDateKey } from '@/lib/calendar-utils';

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

export function calculateFairnessReport(
  tasks: Task[],
  events: CalendarEvent[],
  mentalLoad: MentalLoadEvent[],
  today = new Date(),
): FairnessReport {
  const weekStart = toDateKey(getWeekDates(today)[0]);
  const weekEvents = mentalLoad.filter((e) => e.date >= weekStart);

  let user1Score = 0;
  let user2Score = 0;
  let user1Planning = 0;
  let user2Planning = 0;
  let user1Execution = 0;
  let user2Execution = 0;

  for (const event of weekEvents) {
    const isUser1 = event.userId === 'user1';
    const score = event.weight;
    if (isUser1) {
      user1Score += score;
      if (event.type === 'planning' || event.type === 'coordination') user1Planning += score;
      else user1Execution += score;
    } else {
      user2Score += score;
      if (event.type === 'planning' || event.type === 'coordination') user2Planning += score;
      else user2Execution += score;
    }
  }

  const weekDates = getWeekDates(today);
  for (const date of weekDates) {
    const dayTasks = tasks.filter((t) => taskOccursOnDate(t, date));
    const dayEvents = events.filter((e) => eventOccursOnDate(e, date));

    for (const task of dayTasks) {
      const weight = task.completed ? 1 : 1.5;
      if (task.assignedTo === 'user1') user1Execution += weight;
      else if (task.assignedTo === 'user2') user2Execution += weight;
      else {
        user1Execution += weight / 2;
        user2Execution += weight / 2;
      }
    }

    for (const _event of dayEvents) {
      user1Planning += 0.5;
      user2Planning += 0.5;
    }
  }

  user1Score = user1Planning + user1Execution;
  user2Score = user2Planning + user2Execution;
  const total = user1Score + user2Score || 1;
  const user1Pct = Math.round((user1Score / total) * 100);
  const user2Pct = 100 - user1Pct;

  let balanceHint: string;
  if (Math.abs(user1Pct - user2Pct) <= 10) {
    balanceHint = 'Gute Balance diese Woche — Last ist fair verteilt.';
  } else if (user1Pct > user2Pct) {
    balanceHint = `Clara trägt mehr (${user1Pct}% vs. ${user2Pct}%) — nächste Aufgaben an Pascal vergeben.`;
  } else {
    balanceHint = `Pascal trägt mehr (${user2Pct}% vs. ${user1Pct}%) — nächste Aufgaben an Clara vergeben.`;
  }

  return {
    user1Score: Math.round(user1Score * 10) / 10,
    user2Score: Math.round(user2Score * 10) / 10,
    user1Planning: Math.round(user1Planning * 10) / 10,
    user2Planning: Math.round(user2Planning * 10) / 10,
    user1Execution: Math.round(user1Execution * 10) / 10,
    user2Execution: Math.round(user2Execution * 10) / 10,
    balanceHint,
  };
}

export function distributeFairly(
  tasks: Task[],
  events: CalendarEvent[],
  _mentalLoad: MentalLoadEvent[],
  fairness: FairnessReport,
  today = new Date(),
): RadarAssignment[] {
  const assignments: RadarAssignment[] = [];
  const weekDates = getWeekDates(today);
  const lighterUser: UserId = fairness.user1Score <= fairness.user2Score ? 'user1' : 'user2';
  const lighterName = lighterUser === 'user1' ? 'Clara' : 'Pascal';

  const unassigned = tasks.filter((t) => !t.completed && t.assignedTo === 'both');
  for (const task of unassigned.slice(0, 3)) {
    assignments.push({
      title: task.title,
      description: `Aufgabe „${task.title}" fair zuweisen`,
      suggestedAssignee: lighterUser,
      reason: `${lighterName} hat diese Woche etwas weniger auf dem Radar`,
      taskTitle: task.title,
      weekday: task.weekday,
    });
  }

  for (const date of weekDates) {
    const dayTasks = tasks.filter((t) => !t.completed && taskOccursOnDate(t, date));
    const dayEvents = events.filter((e) => eventOccursOnDate(e, date));
    const load = dayTasks.length + dayEvents.length;

    if (load >= 5) {
      const weekday = dateToWeekday(date);
      const dayLabel = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][weekday];
      assignments.push({
        title: `${dayLabel}: Koordination`,
        description: `${load} Punkte an diesem Tag — ${lighterName} übernimmt Planung`,
        suggestedAssignee: lighterUser,
        reason: 'Voller Tag — mentale Last ausgleichen',
        weekday,
      });
    }
  }

  const openCount = tasks.filter((t) => !t.completed).length;
  if (openCount > 0 && assignments.length === 0) {
    assignments.push({
      title: 'Wochen-Check',
      description: `${openCount} offene Aufgaben — gemeinsam 10 Min durchgehen`,
      suggestedAssignee: 'both',
      reason: 'Kurze Abstimmung verhindert Überraschungen',
    });
  }

  return assignments.slice(0, 5);
}

export function suggestConflictResolutions(
  tasks: Task[],
  events: CalendarEvent[],
  today = new Date(),
): RadarAssignment[] {
  const suggestions: RadarAssignment[] = [];
  const weekDates = getWeekDates(today);

  for (const date of weekDates) {
    const dayTasks = tasks.filter((t) => !t.completed && taskOccursOnDate(t, date));
    const dayEvents = events.filter((e) => eventOccursOnDate(e, date));

    if (dayTasks.length >= 3 && dayEvents.length >= 2) {
      const weekday = dateToWeekday(date);
      suggestions.push({
        title: 'Konflikt: Zu viel an einem Tag',
        description: 'Zeit verschieben, Aufgabe tauschen oder outsourcen (z.B. Lieferdienst)',
        suggestedAssignee: 'both',
        reason: `${dayTasks.length} Aufgaben + ${dayEvents.length} Termine — Kompromiss nötig`,
        weekday,
      });
    }
  }

  return suggestions.slice(0, 3);
}

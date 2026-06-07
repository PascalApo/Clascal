import type { Task, CalendarEvent, ShoppingListItem } from '@/lib/sync/types';
import type { MealPlanEntry } from '@/types/meal-plan';
import type { Recipe } from '@/types/recipe';
import type { PantryItem } from '@/types/pantry';
import type { BureaucracyDeadline } from '@/types/bureaucracy-deadline';
import type { MentalLoadEvent } from '@/types/mental-load';
import type { RadarBriefing } from '@/types/radar';
import { daysUntilDue } from '@/types/bureaucracy-deadline';
import { detectCollisions } from './collisions';
import {
  suggestExpiryMeals,
  suggestGuestMeals,
  suggestMissingMeals,
  buildShoppingSuggestions,
} from './pantry-suggestions';
import {
  calculateFairnessReport,
  distributeFairly,
  suggestConflictResolutions,
} from './fairness';

export interface RadarInput {
  tasks: Task[];
  events: CalendarEvent[];
  mealPlan: MealPlanEntry[];
  shoppingItems: ShoppingListItem[];
  pantry: PantryItem[];
  deadlines: BureaucracyDeadline[];
  mentalLoad: MentalLoadEvent[];
  recipes: Recipe[];
  today?: Date;
}

function getWeekLabel(today: Date): string {
  const start = new Date(today);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function buildWeeklyBriefing(input: RadarInput): RadarBriefing {
  const today = input.today ?? new Date();

  const collisions = detectCollisions({
    tasks: input.tasks,
    events: input.events,
    mealPlan: input.mealPlan,
    pantry: input.pantry,
    deadlines: input.deadlines,
    shoppingItems: input.shoppingItems,
    today,
  });

  const foodActions = [
    ...suggestExpiryMeals(input.pantry, input.recipes, today),
    ...suggestGuestMeals(input.events, input.mealPlan, input.recipes, today),
    ...suggestMissingMeals(input.mealPlan),
  ];

  const fairness = calculateFairnessReport(
    input.tasks,
    input.events,
    input.mentalLoad,
    today,
  );

  const assignments = [
    ...distributeFairly(input.tasks, input.events, input.mentalLoad, fairness, today),
    ...suggestConflictResolutions(input.tasks, input.events, today),
  ];

  const shoppingSuggestions = buildShoppingSuggestions(foodActions, input.pantry);

  const upcomingDeadlines = input.deadlines
    .filter((d) => !d.completed && daysUntilDue(d.dueDate, today) <= 30 && daysUntilDue(d.dueDate, today) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const urgentCount = collisions.filter((c) => c.severity === 'urgent').length;
  const warningCount = collisions.filter((c) => c.severity === 'warning').length;

  let summary: string;
  if (collisions.length === 0) {
    summary = 'Ruhige Woche — alles im grünen Bereich.';
  } else if (urgentCount > 0) {
    summary = `${urgentCount} dringende${urgentCount > 1 ? '' : 's'} Thema${urgentCount > 1 ? '' : ''} — ${warningCount > 0 ? `plus ${warningCount} Hinweise` : 'sofort ansehen'}.`;
  } else {
    summary = `${collisions.length} Hinweis${collisions.length > 1 ? 'e' : ''} für diese Woche — Plan steht bereit.`;
  }

  return {
    weekLabel: getWeekLabel(today),
    generatedAt: today.toISOString(),
    summary,
    collisionCount: collisions.length,
    collisions,
    foodActions,
    assignments: assignments.slice(0, 6),
    shoppingSuggestions,
    upcomingDeadlines,
    fairness,
  };
}

export function formatBriefingForPush(briefing: RadarBriefing): { title: string; body: string } {
  const lines: string[] = [briefing.summary];
  if (briefing.collisions.length > 0) {
    lines.push(briefing.collisions[0].title);
  }
  if (briefing.foodActions.length > 0) {
    lines.push(briefing.foodActions[0].title);
  }
  return {
    title: `Radar: ${briefing.weekLabel}`,
    body: lines.join(' · '),
  };
}

export interface MealPlanEntry {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  recipeId: string | null;
}

export const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
export const WEEKDAY_FULL = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
] as const;

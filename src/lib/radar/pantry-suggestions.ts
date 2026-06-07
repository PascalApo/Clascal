import type { Recipe } from '@/types/recipe';
import type { PantryItem } from '@/types/pantry';
import type { MealPlanEntry } from '@/types/meal-plan';
import type { CalendarEvent } from '@/lib/sync/types';
import type { RadarFoodAction, RadarShoppingSuggestion } from '@/types/radar';
import { isExpiringSoon } from '@/types/pantry';
import { dateToWeekday } from '@/lib/calendar-utils';

const GUEST_KEYWORDS = ['gäst', 'gaest', 'besuch', 'einlad', 'party', 'feier', 'geburtstag'];

function ingredientMatchesPantry(ingredientName: string, pantryName: string): boolean {
  const ing = ingredientName.toLowerCase().trim();
  const pan = pantryName.toLowerCase().trim();
  return ing.includes(pan) || pan.includes(ing);
}

export function suggestExpiryMeals(
  pantry: PantryItem[],
  recipes: Recipe[],
  today = new Date(),
): RadarFoodAction[] {
  const expiring = pantry.filter((p) => isExpiringSoon(p, 7, today));
  if (expiring.length === 0) return [];

  const actions: RadarFoodAction[] = [];
  const usedRecipeIds = new Set<string>();

  for (const item of expiring.sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))) {
    const match = recipes.find(
      (r) =>
        !usedRecipeIds.has(r.id) &&
        r.ingredients.some((ing) => ingredientMatchesPantry(ing.name, item.name)),
    );
    if (match) {
      usedRecipeIds.add(match.id);
      const days = Math.ceil(
        (new Date(item.expiresOn).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      actions.push({
        type: 'expiry',
        title: `${item.name} zuerst verbrauchen`,
        description: `Läuft in ${days} Tag${days !== 1 ? 'en' : ''} ab — Rezept: ${match.name}`,
        recipe: match,
        pantryItems: [item],
      });
    }
  }

  if (actions.length === 0 && expiring.length > 0) {
    actions.push({
      type: 'expiry',
      title: 'Bald ablaufende Vorräte',
      description: `${expiring.map((p) => p.name).join(', ')} — passendes Rezept suchen`,
      pantryItems: expiring,
    });
  }

  return actions;
}

export function suggestGuestMeals(
  events: CalendarEvent[],
  mealPlan: MealPlanEntry[],
  recipes: Recipe[],
  today = new Date(),
): RadarFoodAction[] {
  const actions: RadarFoodAction[] = [];

  for (const event of events) {
    const text = `${event.title} ${event.description ?? ''}`.toLowerCase();
    if (!GUEST_KEYWORDS.some((kw) => text.includes(kw))) continue;

    const eventDate = new Date(event.startDate);
    if (eventDate < today) continue;

    const weekday = dateToWeekday(eventDate);
    const meal = mealPlan.find((m) => m.weekday === weekday);
    const recipeId = meal?.dinnerRecipeId;
    const recipe = recipeId ? recipes.find((r) => r.id === recipeId) : undefined;

    actions.push({
      type: 'guest',
      title: `Gäste-Menü: ${event.title}`,
      description: recipe
        ? `${recipe.name} — Portionen von ${recipe.servings} auf 6 erhöhen`
        : 'Noch kein Abendessen geplant — jetzt Rezept wählen',
      recipe,
      weekday,
    });
  }

  return actions;
}

export function suggestMissingMeals(mealPlan: MealPlanEntry[]): RadarFoodAction[] {
  const empty = mealPlan.filter((m) => !m.dinnerRecipeId);
  if (empty.length === 0) return [];

  return [
    {
      type: 'missing_meal',
      title: `${empty.length} Abendessen offen`,
      description: `Noch ohne Plan: ${empty.map((m) => ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][m.weekday]).join(', ')}`,
    },
  ];
}

export function buildShoppingSuggestions(
  foodActions: RadarFoodAction[],
  pantry: PantryItem[],
): RadarShoppingSuggestion[] {
  const suggestions: RadarShoppingSuggestion[] = [];

  for (const action of foodActions) {
    if (action.type === 'guest' && action.recipe) {
      suggestions.push({
        name: 'Extra-Portionen Zutaten',
        reason: `Für Gäste: ${action.recipe.name}`,
      });
    }
  }

  const lowPantry = pantry.filter((p) => isExpiringSoon(p, 1));
  for (const item of lowPantry) {
    suggestions.push({
      name: item.name,
      reason: 'Ersatz einkaufen — aktueller Vorrat läuft ab',
    });
  }

  return suggestions;
}

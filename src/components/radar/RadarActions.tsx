import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { useUser } from '@/context/UserContext';
import { hapticTap } from '@/lib/haptics';
import type { RadarFoodAction, RadarAssignment, RadarShoppingSuggestion } from '@/types/radar';
import { USER_BASE, type UserId } from '@/types/user';

export function RadarFoodActionButton({ action }: { action: RadarFoodAction }) {
  const { setMealForDay, showToast } = useAppData();
  const navigate = useNavigate();

  if (action.type === 'missing_meal' && action.weekday !== undefined) {
    return (
      <button
        type="button"
        onClick={() => {
          hapticTap();
          navigate('/essen');
          showToast('Essensplan öffnen — Rezept wählen', 'info');
        }}
        className="mt-2 rounded-lg px-3 py-1.5 text-xs font-medium accent-bg-muted accent-text"
      >
        Essensplan öffnen
      </button>
    );
  }

  if (action.recipe && action.weekday !== undefined) {
    return (
      <button
        type="button"
        onClick={() => {
          hapticTap();
          setMealForDay(action.weekday!, 'dinner', action.recipe!.id);
          showToast(`„${action.recipe!.name}" für ${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][action.weekday!]} geplant`, 'info');
        }}
        className="mt-2 rounded-lg px-3 py-1.5 text-xs font-medium accent-bg-muted accent-text"
      >
        Als Abendessen planen
      </button>
    );
  }

  if (action.recipe) {
    const today = new Date().getDay();
    const weekday = today === 0 ? 6 : today - 1;
    return (
      <button
        type="button"
        onClick={() => {
          hapticTap();
          setMealForDay(weekday, 'dinner', action.recipe!.id);
          showToast(`„${action.recipe!.name}" für heute geplant`, 'info');
        }}
        className="mt-2 rounded-lg px-3 py-1.5 text-xs font-medium accent-bg-muted accent-text"
      >
        Heute kochen
      </button>
    );
  }

  return null;
}

export function RadarAssignmentButton({ assignment }: { assignment: RadarAssignment }) {
  const { tasks, assignTask, addTask, showToast } = useAppData();
  const { userId } = useUser();

  if (!assignment.taskTitle || assignment.suggestedAssignee === 'both') return null;

  const existing = tasks.find(
    (t) => t.title === assignment.taskTitle && !t.completed && t.assignedTo === 'both',
  );

  const label = USER_BASE[assignment.suggestedAssignee as UserId].name;

  return (
    <button
      type="button"
      onClick={() => {
        hapticTap();
        if (existing) {
          assignTask(existing.id, assignment.suggestedAssignee as UserId);
          showToast(`„${existing.title}" an ${label} zugewiesen`, 'info');
        } else if (assignment.taskTitle && assignment.weekday !== undefined && userId) {
          addTask({
            title: assignment.taskTitle,
            assignedTo: assignment.suggestedAssignee as UserId,
            weekday: assignment.weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6,
            recurring: true,
            createdBy: userId,
          });
          showToast(`Aufgabe an ${label} vergeben`, 'info');
        }
      }}
      className="mt-2 rounded-lg px-3 py-1.5 text-xs font-medium accent-bg-muted accent-text"
    >
      An {label} zuweisen
    </button>
  );
}

export function RadarShoppingButton({ suggestions }: { suggestions: RadarShoppingSuggestion[] }) {
  const { addShoppingItem, showToast } = useAppData();
  const { userId } = useUser();

  if (suggestions.length === 0) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        hapticTap();
        for (const s of suggestions.slice(0, 5)) {
          await addShoppingItem(s.name, 'sonstiges', undefined, userId ?? 'user1');
        }
        showToast(`${Math.min(suggestions.length, 5)} Artikel auf Einkaufsliste`, 'info');
      }}
      className="mt-2 w-full rounded-lg py-2 text-xs font-medium accent-bg-muted accent-text"
    >
      {suggestions.length} Vorschläge auf Liste
    </button>
  );
}


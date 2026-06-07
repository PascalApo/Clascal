import { Search } from 'lucide-react';
import type { ExpenseCategory } from '@/types/expense';
import { EXPENSE_CATEGORIES } from '@/types/expense';
import type { ExpenseGroupBy, ExpenseSortBy } from '@/lib/expense-utils';
import { USER_BASE } from '@/types';

interface ExpenseFiltersProps {
  category: ExpenseCategory | 'all';
  person: string | 'all';
  search: string;
  sortBy: ExpenseSortBy;
  groupBy: ExpenseGroupBy;
  categoryCounts: Record<ExpenseCategory | 'all', number>;
  onCategoryChange: (c: ExpenseCategory | 'all') => void;
  onPersonChange: (p: string | 'all') => void;
  onSearchChange: (s: string) => void;
  onSortChange: (s: ExpenseSortBy) => void;
  onGroupChange: (g: ExpenseGroupBy) => void;
}

const SORT_OPTIONS: { id: ExpenseSortBy; label: string }[] = [
  { id: 'date-desc', label: 'Datum ↓' },
  { id: 'date-asc', label: 'Datum ↑' },
  { id: 'amount-desc', label: 'Betrag ↓' },
  { id: 'amount-asc', label: 'Betrag ↑' },
  { id: 'category', label: 'Kategorie' },
];

const GROUP_OPTIONS: { id: ExpenseGroupBy; label: string }[] = [
  { id: 'none', label: 'Keine' },
  { id: 'category', label: 'Kategorie' },
  { id: 'date', label: 'Tag' },
];

export function ExpenseFilters({
  category,
  person,
  search,
  sortBy,
  groupBy,
  categoryCounts,
  onCategoryChange,
  onPersonChange,
  onSearchChange,
  onSortChange,
  onGroupChange,
}: ExpenseFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
        <input
          type="search"
          placeholder="Beschreibung suchen…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="field-input pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={category === 'all'}
          onClick={() => onCategoryChange('all')}
          label={`Alle (${categoryCounts.all})`}
        />
        {EXPENSE_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat.id}
            active={category === cat.id}
            onClick={() => onCategoryChange(cat.id)}
            label={`${cat.label} (${categoryCounts[cat.id] ?? 0})`}
            color={cat.color}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={person === 'all'} onClick={() => onPersonChange('all')} label="Beide" />
        <FilterChip
          active={person === 'user1'}
          onClick={() => onPersonChange('user1')}
          label={USER_BASE.user1.name}
        />
        <FilterChip
          active={person === 'user2'}
          onClick={() => onPersonChange('user2')}
          label={USER_BASE.user2.name}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as ExpenseSortBy)}
          className="field-input text-xs"
          aria-label="Sortierung"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={groupBy}
          onChange={(e) => onGroupChange(e.target.value as ExpenseGroupBy)}
          className="field-input text-xs"
          aria-label="Gruppierung"
        >
          {GROUP_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              Gruppe: {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'ring-1' : 'bg-white/5 text-white/65 hover:bg-white/10'
      }`}
      style={
        active && color
          ? { backgroundColor: `${color}22`, color, borderColor: `${color}66` }
          : active
            ? undefined
            : undefined
      }
    >
      <span className={active && !color ? 'accent-text' : ''}>{label}</span>
    </button>
  );
}

import type { Expense, ExpenseCategory } from '@/types/expense';
import { EXPENSE_CATEGORIES } from '@/types/expense';
import type { UserId } from '@/types/user';

export type ExpenseSortBy = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category';
export type ExpenseGroupBy = 'none' | 'category' | 'date';

export interface ExpenseGroup {
  key: string;
  label: string;
  total: number;
  items: Expense[];
}

export interface MonthSummary {
  total: number;
  prevMonthTotal: number;
  changePercent: number | null;
  transactionCount: number;
  byCategory: { id: ExpenseCategory; label: string; total: number; color: string }[];
  byPerson: { userId: string; name: string; total: number }[];
}

export function filterExpensesByMonth(expenses: Expense[], year: number, month: number): Expense[] {
  return expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function sortExpenses(expenses: Expense[], sortBy: ExpenseSortBy): Expense[] {
  const sorted = [...expenses];
  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    case 'date-asc':
      return sorted.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
    case 'amount-desc':
      return sorted.sort((a, b) => b.amount - a.amount || b.date.localeCompare(a.date));
    case 'amount-asc':
      return sorted.sort((a, b) => a.amount - b.amount || a.date.localeCompare(b.date));
    case 'category': {
      const order = EXPENSE_CATEGORIES.map((c) => c.id);
      return sorted.sort(
        (a, b) =>
          order.indexOf(a.category) - order.indexOf(b.category) || b.date.localeCompare(a.date),
      );
    }
    default:
      return sorted;
  }
}

export function groupExpenses(expenses: Expense[], groupBy: ExpenseGroupBy): ExpenseGroup[] {
  if (groupBy === 'none') {
    return [{ key: 'all', label: '', total: sum(expenses), items: expenses }];
  }

  if (groupBy === 'category') {
    const map = new Map<ExpenseCategory, Expense[]>();
    for (const e of expenses) {
      const list = map.get(e.category) ?? [];
      list.push(e);
      map.set(e.category, list);
    }
    return EXPENSE_CATEGORIES.filter((c) => map.has(c.id)).map((cat) => {
      const items = map.get(cat.id)!;
      return {
        key: cat.id,
        label: cat.label,
        total: sum(items),
        items,
      };
    });
  }

  const map = new Map<string, Expense[]>();
  for (const e of expenses) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      key: date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('de-DE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      total: sum(items),
      items,
    }));
}

function sum(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

export function getMonthSummary(
  expenses: Expense[],
  year: number,
  month: number,
  personNames: Record<UserId, string>,
): MonthSummary {
  const monthExpenses = filterExpensesByMonth(expenses, year, month);
  const total = sum(monthExpenses);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthTotal = sum(filterExpensesByMonth(expenses, prevYear, prevMonth));

  let changePercent: number | null = null;
  if (prevMonthTotal > 0) {
    changePercent = Math.round(((total - prevMonthTotal) / prevMonthTotal) * 100);
  } else if (total > 0) {
    changePercent = 100;
  }

  const byCategory = EXPENSE_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    color: cat.color,
    total: monthExpenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  const personTotals = new Map<string, number>();
  for (const e of monthExpenses) {
    personTotals.set(e.createdBy, (personTotals.get(e.createdBy) ?? 0) + e.amount);
  }
  const byPerson = [...personTotals.entries()].map(([userId, personTotal]) => ({
    userId,
    name: personNames[userId as UserId] ?? 'Partner',
    total: personTotal,
  }));

  return {
    total,
    prevMonthTotal,
    changePercent,
    transactionCount: monthExpenses.length,
    byCategory,
    byPerson,
  };
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

export function filterExpenses(
  expenses: Expense[],
  opts: {
    category?: ExpenseCategory | 'all';
    person?: string | 'all';
    search?: string;
  },
): Expense[] {
  let result = expenses;
  if (opts.category && opts.category !== 'all') {
    result = result.filter((e) => e.category === opts.category);
  }
  if (opts.person && opts.person !== 'all') {
    result = result.filter((e) => e.createdBy === opts.person);
  }
  if (opts.search?.trim()) {
    const q = opts.search.trim().toLowerCase();
    result = result.filter((e) => e.description.toLowerCase().includes(q));
  }
  return result;
}

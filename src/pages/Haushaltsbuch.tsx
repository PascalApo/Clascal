import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ExpenseChart } from '@/components/haushaltsbuch/ExpenseChart';
import { ExpenseSummary } from '@/components/haushaltsbuch/ExpenseSummary';
import { ExpenseFilters } from '@/components/haushaltsbuch/ExpenseFilters';
import { ExpenseList } from '@/components/haushaltsbuch/ExpenseList';
import { useAppData } from '@/context/AppDataContext';
import { useUser } from '@/context/UserContext';
import { parseBankStatementPdf, guessCategory } from '@/lib/pdf-parser';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/expense';
import { USER_BASE } from '@/types';
import {
  filterExpensesByMonth,
  filterExpenses,
  sortExpenses,
  groupExpenses,
  getMonthSummary,
  type ExpenseSortBy,
  type ExpenseGroupBy,
} from '@/lib/expense-utils';

export function Haushaltsbuch() {
  const { theme, userId } = useUser();
  const { expenses, addExpense, addExpensesBulk, removeExpense, isLiveSync, showToast } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState<ExpenseCategory | 'all'>('all');
  const [person, setPerson] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ExpenseSortBy>('date-desc');
  const [groupBy, setGroupBy] = useState<ExpenseGroupBy>('none');

  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'sonstiges' as ExpenseCategory,
  });

  const accentColor = theme?.accent ?? '#00d4ff';

  const monthExpenses = useMemo(
    () => filterExpensesByMonth(expenses, viewYear, viewMonth),
    [expenses, viewYear, viewMonth],
  );

  const summary = useMemo(
    () =>
      getMonthSummary(expenses, viewYear, viewMonth, {
        user1: USER_BASE.user1.name,
        user2: USER_BASE.user2.name,
      }),
    [expenses, viewYear, viewMonth],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<ExpenseCategory | 'all', number> = { all: monthExpenses.length } as Record<
      ExpenseCategory | 'all',
      number
    >;
    for (const cat of EXPENSE_CATEGORIES) {
      counts[cat.id] = monthExpenses.filter((e) => e.category === cat.id).length;
    }
    return counts;
  }, [monthExpenses]);

  const displayGroups = useMemo(() => {
    const filtered = filterExpenses(monthExpenses, { category, person, search });
    const sorted = sortExpenses(filtered, sortBy);
    return groupExpenses(sorted, groupBy);
  }, [monthExpenses, category, person, search, sortBy, groupBy]);

  const goToMonth = (offset: number) => {
    const d = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setParsing(true);
    setParseResult(null);
    try {
      const transactions = await parseBankStatementPdf(file);
      if (transactions.length === 0) {
        setParseResult(0);
      } else {
        addExpensesBulk(
          transactions.map((t) => ({
            date: t.date,
            description: t.description,
            amount: t.amount,
            category: guessCategory(t.description),
            source: 'pdf' as const,
            createdBy: userId,
          })),
        );
        setParseResult(transactions.length);
        if (isLiveSync) {
          showToast(`${transactions.length} Ausgaben — für Clara & Pascal sichtbar`, 'info');
        }
      }
    } catch {
      setParseResult(-1);
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !userId) return;
    addExpense({
      date: form.date,
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      source: 'manual',
      createdBy: userId,
    });
    setForm({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'sonstiges',
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4 pb-4">
      <PageHeader title="Haushaltsbuch" subtitle="Monatsübersicht & Buchungen" />

      <ExpenseSummary
        year={viewYear}
        month={viewMonth}
        summary={summary}
        onPrevMonth={() => goToMonth(-1)}
        onNextMonth={() => goToMonth(1)}
        onToday={goToToday}
      />

      <ExpenseChart
        expenses={monthExpenses}
        accentColor={accentColor}
        year={viewYear}
        month={viewMonth}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={parsing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs text-white/75 transition-colors hover-accent-bg-muted disabled:opacity-50"
        >
          {parsing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          PDF importieren
        </button>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs text-white/75 transition-colors hover-accent-bg-muted"
        >
          <Plus size={14} />
          Hinzufügen
        </button>
      </div>

      <AnimatePresence>
        {parseResult !== null && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-xs ${parseResult > 0 ? 'text-green-400' : 'text-amber-400'}`}
          >
            {parseResult > 0
              ? `${parseResult} Ausgaben importiert`
              : parseResult === 0
                ? 'Keine Ausgaben erkannt — ING-PDF mit Text?'
                : 'PDF konnte nicht gelesen werden'}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleManualSubmit}
            className="glass-card space-y-3 overflow-hidden p-4"
          >
            <input
              type="text"
              placeholder="Beschreibung"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field-input"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.01"
                placeholder="Betrag €"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="field-input"
                required
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="field-input"
              />
            </div>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
              className="field-input"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full rounded-xl py-2.5 text-sm font-medium accent-bg-muted accent-text"
            >
              Speichern
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <ExpenseFilters
        category={category}
        person={person}
        search={search}
        sortBy={sortBy}
        groupBy={groupBy}
        categoryCounts={categoryCounts}
        onCategoryChange={setCategory}
        onPersonChange={setPerson}
        onSearchChange={setSearch}
        onSortChange={setSortBy}
        onGroupChange={setGroupBy}
      />

      <div>
        <h3 className="mb-2 text-sm font-medium text-white/70">
          Buchungen ({displayGroups.reduce((s, g) => s + g.items.length, 0)})
        </h3>
        <ExpenseList groups={displayGroups} groupBy={groupBy} onRemove={removeExpense} />
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ExpenseChart } from '@/components/haushaltsbuch/ExpenseChart';
import { useAppData } from '@/context/AppDataContext';
import { useUser } from '@/context/UserContext';
import { parseBankStatementPdf, guessCategory } from '@/lib/pdf-parser';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/expense';

export function Haushaltsbuch() {
  const { theme, userId } = useUser();
  const { expenses, addExpense, addExpensesBulk, removeExpense } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'sonstiges' as ExpenseCategory,
  });

  const accentColor = theme?.accent ?? '#00d4ff';

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
    setForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'sonstiges' });
    setShowForm(false);
  };

  return (
    <div className="space-y-5 pb-4">
      <PageHeader title="Haushaltsbuch" subtitle="PDF-Import & Ausgaben-Tracking" />

      <ExpenseChart expenses={expenses} accentColor={accentColor} />

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => fileRef.current?.click()}
          disabled={parsing}
          className="glass-card flex flex-col items-center gap-2 border p-4 accent-border"
        >
          {parsing ? (
            <Loader2 size={24} className="animate-spin accent-text" />
          ) : (
            <Upload size={24} className="accent-text" />
          )}
          <span className="text-xs text-white/75">Kontoauszug PDF</span>
        </motion.button>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="glass-card flex flex-col items-center gap-2 border p-4 accent-border"
        >
          <Plus size={24} className="accent-text" />
          <span className="text-xs text-white/75">Manuell hinzufügen</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {parseResult !== null && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm ${parseResult > 0 ? 'text-green-400' : 'text-amber-400'}`}
          >
            {parseResult > 0
              ? `${parseResult} Ausgaben aus PDF importiert`
              : parseResult === 0
                ? 'Keine Ausgaben erkannt – ING-PDF mit Text (kein Scan)? Sonst manuell erfassen.'
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
                <option key={c.id} value={c.id}>{c.label}</option>
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

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white/70">Letzte Ausgaben</h3>
        {expenses.length === 0 ? (
          <p className="text-center text-xs text-white/55 py-8">Noch leer – PDF hochladen oder manuell erfassen</p>
        ) : (
          expenses.slice(0, 20).map((exp) => {
            const cat = EXPENSE_CATEGORIES.find((c) => c.id === exp.category);
            return (
              <motion.div
                key={exp.id}
                layout
                className="glass-card flex items-center gap-3 p-3"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${cat?.color}20` }}
                >
                  {exp.source === 'pdf' ? (
                    <FileText size={16} style={{ color: cat?.color }} />
                  ) : (
                    <span className="text-xs font-bold" style={{ color: cat?.color }}>€</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{exp.description}</p>
                  <p className="text-xs text-white/55">
                    {new Date(exp.date).toLocaleDateString('de-DE')} · {cat?.label}
                  </p>
                </div>
                <span className="text-sm font-medium text-white/90">-{exp.amount.toFixed(2)} €</span>
                <button onClick={() => removeExpense(exp.id)} className="text-white/50 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Expense } from '@/types/expense';
import { EXPENSE_CATEGORIES } from '@/types/expense';
import { formatMonthYear } from '@/lib/expense-utils';

interface ExpenseChartProps {
  expenses: Expense[];
  accentColor: string;
  year: number;
  month: number;
}

export function ExpenseChart({ expenses, accentColor, year, month }: ExpenseChartProps) {
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat.label,
    value: expenses
      .filter((e) => e.category === cat.id)
      .reduce((sum, e) => sum + e.amount, 0),
    color: cat.color,
  })).filter((d) => d.value > 0);

  const total = categoryTotals.reduce((s, d) => s + d.value, 0);
  const monthLabel = formatMonthYear(year, month).split(' ')[0];

  if (total === 0) {
    return (
      <div className="glass-card flex h-48 items-center justify-center">
        <p className="text-sm text-white/60">Keine Ausgaben in diesem Monat</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4"
    >
      <div className="relative mx-auto h-44 w-full max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryTotals}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {categoryTotals.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1a1a24',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: number) => [`${value.toFixed(2)} €`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs capitalize text-white/65">{monthLabel}</span>
          <span className="font-display text-xl font-bold" style={{ color: accentColor }}>
            {total.toFixed(0)} €
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {categoryTotals.map((cat) => {
          const pct = Math.round((cat.value / total) * 100);
          return (
            <div key={cat.name} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="truncate text-white/60">{cat.name}</span>
              <span className="ml-auto shrink-0 text-white/80">
                {pct}% · {cat.value.toFixed(0)} €
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Expense } from '@/types/expense';
import { EXPENSE_CATEGORIES } from '@/types/expense';

interface ExpenseChartProps {
  expenses: Expense[];
  accentColor: string;
}

export function ExpenseChart({ expenses, accentColor }: ExpenseChartProps) {
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat.label,
    value: expenses
      .filter((e) => e.category === cat.id)
      .reduce((sum, e) => sum + e.amount, 0),
    color: cat.color,
  })).filter((d) => d.value > 0);

  const total = categoryTotals.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="glass-card flex h-64 items-center justify-center">
        <p className="text-sm text-white/60">Noch keine Ausgaben erfasst</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4"
    >
      <div className="relative mx-auto h-56 w-full max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryTotals}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1200}
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
          <span className="text-xs text-white/65">Gesamt</span>
          <span className="font-display text-2xl font-bold" style={{ color: accentColor }}>
            {total.toFixed(0)} €
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {categoryTotals.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-white/60">{cat.name}</span>
            <span className="ml-auto text-white/80">{cat.value.toFixed(0)} €</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { FileText, Trash2 } from 'lucide-react';
import { PartnerDot } from '@/components/ui/PartnerDot';
import { EXPENSE_CATEGORIES } from '@/types/expense';
import type { ExpenseGroup } from '@/lib/expense-utils';

interface ExpenseListProps {
  groups: ExpenseGroup[];
  groupBy: 'none' | 'category' | 'date';
  onRemove: (id: string) => void;
}

export function ExpenseList({ groups, groupBy, onRemove }: ExpenseListProps) {
  const totalItems = groups.reduce((s, g) => s + g.items.length, 0);

  if (totalItems === 0) {
    return (
      <p className="py-8 text-center text-xs text-white/55">
        Keine Buchungen für diesen Filter
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.key}>
          {groupBy !== 'none' && (
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-medium text-white/70">{group.label}</span>
              <span className="text-xs text-white/55">{group.total.toFixed(2)} €</span>
            </div>
          )}
          <div className="space-y-2">
            {group.items.map((exp) => {
              const cat = EXPENSE_CATEGORIES.find((c) => c.id === exp.category);
              return (
                <motion.div
                  key={exp.id}
                  layout
                  className="glass-card flex items-center gap-3 p-3"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${cat?.color}20` }}
                  >
                    {exp.source === 'pdf' ? (
                      <FileText size={16} style={{ color: cat?.color }} />
                    ) : (
                      <span className="text-xs font-bold" style={{ color: cat?.color }}>
                        €
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm">
                      {exp.description}
                      <PartnerDot userId={exp.createdBy} />
                    </p>
                    <p className="text-xs text-white/55">
                      {new Date(exp.date).toLocaleDateString('de-DE')} · {cat?.label}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-white/90">
                    -{exp.amount.toFixed(2)} €
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(exp.id)}
                    className="shrink-0 text-white/50 hover:text-red-400"
                    aria-label="Löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

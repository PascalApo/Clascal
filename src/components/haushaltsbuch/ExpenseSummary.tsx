import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MonthSummary } from '@/lib/expense-utils';
import { formatMonthYear } from '@/lib/expense-utils';
import { useUser } from '@/context/UserContext';

interface ExpenseSummaryProps {
  year: number;
  month: number;
  summary: MonthSummary;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function ExpenseSummary({
  year,
  month,
  summary,
  onPrevMonth,
  onNextMonth,
  onToday,
}: ExpenseSummaryProps) {
  const { userColors } = useUser();
  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  return (
    <div className="glass-card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h3 className="font-display text-base font-bold capitalize accent-gradient-text">
            {formatMonthYear(year, month)}
          </h3>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={onToday}
              className="mt-0.5 text-[10px] text-white/55 hover:text-white/75"
            >
              Heute
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white"
          aria-label="Nächster Monat"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-white/55">{summary.transactionCount} Buchungen</p>
        <p className="font-display text-3xl font-bold text-white">
          {summary.total.toFixed(2)} €
        </p>
        {summary.changePercent !== null && (
          <p
            className={`text-xs ${summary.changePercent > 0 ? 'text-amber-400' : summary.changePercent < 0 ? 'text-green-400' : 'text-white/55'}`}
          >
            {summary.changePercent > 0 ? '+' : ''}
            {summary.changePercent}% vs. Vormonat ({summary.prevMonthTotal.toFixed(0)} €)
          </p>
        )}
      </div>

      {summary.byPerson.length > 0 && (
        <div className="flex justify-center gap-4 text-xs text-white/65">
          {summary.byPerson.map((p) => (
            <span key={p.userId} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    p.userId === 'user1' || p.userId === 'user2'
                      ? userColors[p.userId as 'user1' | 'user2']
                      : '#888',
                }}
              />
              {p.name}: {p.total.toFixed(0)} €
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

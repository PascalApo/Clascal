import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  ShoppingCart,
  ChefHat,
  Wallet,
  ListTodo,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useRecipes } from '@/context/RecipesContext';
import { useUser } from '@/context/UserContext';
import { LiveActivityFeed } from '@/components/live/LiveActivityFeed';
import { getMonthSummary } from '@/lib/expense-utils';
import { USER_BASE } from '@/types';
import { toDateKey, dateToWeekday, taskOccursOnDate, eventOccursOnDate } from '@/lib/calendar-utils';
import { PartnerDot } from '@/components/ui/PartnerDot';

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export function DashboardWidgets() {
  const {
    tasks,
    events,
    shoppingItems,
    mealPlan,
    expenses,
    isLiveSync,
  } = useAppData();
  const { getRecipeById } = useRecipes();
  const { userId, getOtherMemberNames } = useUser();

  const today = new Date();
  const todayKey = toDateKey(today);
  const weekday = dateToWeekday(today);

  const openShopping = shoppingItems.filter((i) => !i.checked);
  const partnerShopping = openShopping.filter((i) => i.createdBy && i.createdBy !== userId);
  const todayTasks = tasks.filter((t) => !t.completed && taskOccursOnDate(t, today));
  const todayEvents = events.filter((e) => eventOccursOnDate(e, today));

  const dinnerRecipeId = mealPlan.find((m) => m.weekday === weekday)?.dinnerRecipeId;
  const dinnerRecipe = dinnerRecipeId ? getRecipeById(dinnerRecipeId) : null;

  const moneySummary = useMemo(
    () =>
      getMonthSummary(expenses, today.getFullYear(), today.getMonth(), {
        user1: USER_BASE.user1.name,
        user2: USER_BASE.user2.name,
      }),
    [expenses, today],
  );

  const topCategory = moneySummary.byCategory[0];

  const quickLinks = [
    { to: '/einkauf', label: '+ Einkauf', icon: ShoppingCart },
    { to: `/kalender?date=${todayKey}`, label: '+ Aufgabe', icon: ListTodo },
    { to: '/haushaltsbuch', label: 'PDF', icon: Wallet },
    { to: '/essen', label: 'Essen', icon: ChefHat },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-white/65">
          {WEEKDAYS[today.getDay()]}, {today.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
        </p>
        <h2 className="font-display text-xl font-bold accent-gradient-text">Alles im Blick</h2>
      </div>

      {!isLiveSync && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Nur auf diesem Gerät — Änderungen werden nicht mit {getOtherMemberNames()} geteilt.
        </p>
      )}

      <LiveActivityFeed compact />

      <div className="grid grid-cols-2 gap-3">
        <WidgetCard to="/kalender" icon={CalendarDays} title="Heute" accent>
          <p className="text-lg font-bold text-white">{todayTasks.length + todayEvents.length}</p>
          <p className="text-[10px] text-white/55">
            {todayTasks.length} Aufg. · {todayEvents.length} Term.
          </p>
        </WidgetCard>

        <WidgetCard to="/einkauf" icon={ShoppingCart} title="Einkauf">
          <p className="text-lg font-bold text-white">{openShopping.length}</p>
          <p className="text-[10px] text-white/55 flex items-center gap-1">
            offen
            {partnerShopping.length > 0 && (
              <>
                · <PartnerDot userId={partnerShopping[0].createdBy} />
                {getOtherMemberNames()}
              </>
            )}
          </p>
        </WidgetCard>

        <WidgetCard to={dinnerRecipe ? `/essen/${dinnerRecipe.id}` : '/essen'} icon={ChefHat} title="Abendessen">
          <p className="truncate text-sm font-medium text-white">
            {dinnerRecipe?.name ?? 'Noch offen'}
          </p>
          <p className="text-[10px] text-white/55">heute</p>
        </WidgetCard>

        <WidgetCard to="/haushaltsbuch" icon={Wallet} title="Geld">
          <p className="text-lg font-bold text-white">{moneySummary.total.toFixed(0)} €</p>
          <p className="text-[10px] text-white/55 truncate">
            {topCategory
              ? `${topCategory.label} · ${moneySummary.transactionCount} Buch.`
              : 'diesen Monat'}
          </p>
        </WidgetCard>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/75 transition-colors hover-accent-bg-muted"
          >
            <Icon size={14} className="accent-text" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function WidgetCard({
  to,
  icon: Icon,
  title,
  children,
  accent,
}: {
  to: string;
  icon: typeof CalendarDays;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className={`glass-card block p-3 transition-colors hover-accent-bg-muted ${accent ? 'border accent-border' : ''}`}
      >
        <div className="mb-2 flex items-center gap-1.5">
          <Icon size={14} className="accent-text" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/55">{title}</span>
        </div>
        {children}
      </Link>
    </motion.div>
  );
}

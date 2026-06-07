import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppData } from '@/context/AppDataContext';
import { useRecipes } from '@/context/RecipesContext';
import { useUser } from '@/context/UserContext';
import { buildWeeklyBriefing } from '@/lib/radar/engine';
import { RadarBriefingCards } from '@/components/radar/RadarBriefingCards';
import { PantrySection } from '@/components/radar/PantrySection';
import { BureaucracySection } from '@/components/radar/BureaucracySection';
import { FairnessSection } from '@/components/radar/FairnessSection';
import { DecisionDice } from '@/components/radar/DecisionDice';
import {
  notifyPartnerRadarBriefing,
  shouldAutoSendBriefing,
} from '@/lib/push/radar-notify';

export function Radar() {
  const {
    tasks,
    events,
    mealPlan,
    shoppingItems,
    pantryItems,
    bureaucracyDeadlines,
    mentalLoadEvents,
    recordMentalLoad,
  } = useAppData();
  const { recipes } = useRecipes();
  const { user, userId } = useUser();
  const [notifyStatus, setNotifyStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const viewedRef = useRef(false);
  const autoSentRef = useRef<string | null>(null);

  const briefing = useMemo(
    () =>
      buildWeeklyBriefing({
        tasks,
        events,
        mealPlan,
        shoppingItems,
        pantry: pantryItems,
        deadlines: bureaucracyDeadlines,
        mentalLoad: mentalLoadEvents,
        recipes,
      }),
    [tasks, events, mealPlan, shoppingItems, pantryItems, bureaucracyDeadlines, mentalLoadEvents, recipes],
  );

  useEffect(() => {
    if (userId && !viewedRef.current) {
      viewedRef.current = true;
      recordMentalLoad(userId, 'planning', 'Wochen-Briefing angesehen');
    }
  }, [userId, recordMentalLoad]);

  useEffect(() => {
    if (!userId || !user?.name) return;
    if (!shouldAutoSendBriefing(briefing.weekLabel)) return;
    if (autoSentRef.current === briefing.weekLabel) return;
    autoSentRef.current = briefing.weekLabel;

    let cancelled = false;
    (async () => {
      const result = await notifyPartnerRadarBriefing(userId, user.name, briefing);
      if (cancelled) return;
      if (result.ok && (result.sent ?? 0) > 0) {
        setNotifyStatus(`Briefing an Partner gesendet (${result.sent})`);
      }
    })();

    return () => { cancelled = true; };
  }, [briefing.weekLabel, userId, user?.name, briefing]);

  const handleShareBriefing = async () => {
    if (!userId || !user?.name) return;
    setSending(true);
    setNotifyStatus(null);
    const result = await notifyPartnerRadarBriefing(userId, user.name, briefing);
    setSending(false);
    if (result.ok) {
      setNotifyStatus(result.sent ? `An ${result.sent} Partner gesendet` : 'Kein Partner registriert');
    } else {
      setNotifyStatus(result.error ?? 'Fehler beim Senden');
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Haushalts-Radar"
        subtitle="Dein proaktives Wochen-Briefing"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2"
      >
        <button
          type="button"
          onClick={handleShareBriefing}
          disabled={sending}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium glass-card border accent-border transition-colors hover-accent-bg-muted disabled:opacity-50"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
          Briefing teilen
        </button>
      </motion.div>

      {notifyStatus && (
        <p className="text-center text-xs text-white/65">{notifyStatus}</p>
      )}

      <RadarBriefingCards briefing={briefing} />

      <FairnessSection fairness={briefing.fairness} />

      <DecisionDice />

      <PantrySection />

      <BureaucracySection />
    </div>
  );
}

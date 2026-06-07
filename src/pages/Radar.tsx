import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Loader2 } from 'lucide-react';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { useAppData } from '@/context/AppDataContext';
import { useRecipes } from '@/context/RecipesContext';
import { useUser } from '@/context/UserContext';
import { buildWeeklyBriefing } from '@/lib/radar/engine';
import { RadarBriefingCards } from '@/components/radar/RadarBriefingCards';
import { RadarCollapsedPreview } from '@/components/radar/RadarCollapsedPreview';
import { PantrySection } from '@/components/radar/PantrySection';
import { BureaucracySection } from '@/components/radar/BureaucracySection';
import { FairnessSection } from '@/components/radar/FairnessSection';
import { DecisionDice } from '@/components/radar/DecisionDice';
import {
  notifyPartnerRadarBriefing,
  shouldAutoSendBriefing,
} from '@/lib/push/radar-notify';

const RADAR_EXPANDED_KEY = 'radar-expanded';

function readExpanded(): boolean {
  try {
    return localStorage.getItem(RADAR_EXPANDED_KEY) === 'true';
  } catch {
    return false;
  }
}

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
    showToast,
  } = useAppData();
  const { recipes } = useRecipes();
  const { user, userId } = useUser();
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(readExpanded);
  const viewedRef = useRef(false);
  const autoSentRef = useRef<string | null>(null);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(RADAR_EXPANDED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

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
        showToast(`Briefing an Partner gesendet (${result.sent})`, 'info');
      }
    })();

    return () => { cancelled = true; };
  }, [briefing.weekLabel, userId, user?.name, briefing, showToast]);

  const handleShareBriefing = async () => {
    if (!userId || !user?.name) return;
    setSending(true);
    const result = await notifyPartnerRadarBriefing(userId, user.name, briefing);
    setSending(false);
    if (result.ok) {
      showToast(
        result.sent ? `An ${result.sent} Partner gesendet` : 'Kein Partner registriert',
        'info',
      );
    } else {
      showToast(result.error ?? 'Fehler beim Senden', 'error');
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <DashboardWidgets />

      <RadarCollapsedPreview
        briefing={briefing}
        expanded={expanded}
        onToggle={toggleExpanded}
      />

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            <h3 className="font-display text-lg font-bold accent-gradient-text">Wochen-Radar</h3>

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

            <RadarBriefingCards briefing={briefing} />
            <FairnessSection fairness={briefing.fairness} />
            <DecisionDice />
            <PantrySection />
            <BureaucracySection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Info,
  AlertCircle,
  ChefHat,
  CalendarDays,
  ShoppingCart,
  FileText,
  Scale,
  ArrowRight,
} from 'lucide-react';
import type { RadarBriefing } from '@/types/radar';

const MODULE_LINKS = {
  kalender: '/kalender',
  essen: '/essen',
  einkauf: '/einkauf',
  buerokratie: '/radar',
  fairness: '/radar',
} as const;

const MODULE_ICONS = {
  kalender: CalendarDays,
  essen: ChefHat,
  einkauf: ShoppingCart,
  buerokratie: FileText,
  fairness: Scale,
} as const;

function SeverityIcon({ severity }: { severity: 'info' | 'warning' | 'urgent' }) {
  if (severity === 'urgent') return <AlertCircle size={16} className="text-red-400" />;
  if (severity === 'warning') return <AlertTriangle size={16} className="text-amber-400" />;
  return <Info size={16} className="text-sky-400" />;
}

interface RadarBriefingCardsProps {
  briefing: RadarBriefing;
}

export function RadarBriefingCards({ briefing }: RadarBriefingCardsProps) {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border accent-border p-4"
      >
        <p className="text-xs text-white/40">{briefing.weekLabel}</p>
        <h3 className="mt-1 font-display text-lg font-bold text-white">{briefing.summary}</h3>
        {briefing.collisionCount > 0 && (
          <p className="mt-1 text-xs text-white/50">
            {briefing.collisionCount} Hinweis{briefing.collisionCount !== 1 ? 'e' : ''} erkannt
          </p>
        )}
      </motion.div>

      {briefing.collisions.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-white/40">Kollisionen</h4>
          {briefing.collisions.map((collision, i) => {
            const Icon = MODULE_ICONS[collision.relatedModule];
            return (
              <motion.div
                key={collision.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={MODULE_LINKS[collision.relatedModule]}
                  className="glass-card flex items-start gap-3 p-3 transition-colors hover-accent-bg-muted"
                >
                  <SeverityIcon severity={collision.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{collision.title}</p>
                    <p className="text-xs text-white/40">{collision.description}</p>
                  </div>
                  <Icon size={16} className="shrink-0 text-white/20" />
                </Link>
              </motion.div>
            );
          })}
        </section>
      )}

      {briefing.foodActions.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-white/40">Essen</h4>
          {briefing.foodActions.map((action, i) => (
            <motion.div
              key={`${action.type}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={action.recipe ? `/essen/${action.recipe.id}` : '/essen'}
                className="glass-card flex items-start gap-3 p-3 transition-colors hover-accent-bg-muted"
              >
                <ChefHat size={16} className="shrink-0 accent-text" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{action.title}</p>
                  <p className="text-xs text-white/40">{action.description}</p>
                </div>
                <ArrowRight size={14} className="shrink-0 text-white/20" />
              </Link>
            </motion.div>
          ))}
        </section>
      )}

      {briefing.assignments.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-white/40">Vorschläge</h4>
          {briefing.assignments.map((assignment, i) => (
            <motion.div
              key={`${assignment.title}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-3"
            >
              <p className="text-sm font-medium text-white">{assignment.title}</p>
              <p className="text-xs text-white/40">{assignment.description}</p>
              <p className="mt-1 text-xs accent-text">
                → {assignment.suggestedAssignee === 'both' ? 'Beide' : assignment.suggestedAssignee === 'user1' ? 'Clara' : 'Pascal'}
                {' · '}{assignment.reason}
              </p>
            </motion.div>
          ))}
        </section>
      )}

      {briefing.shoppingSuggestions.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-white/40">Einkauf</h4>
          <Link
            to="/einkauf"
            className="glass-card block p-3 transition-colors hover-accent-bg-muted"
          >
            {briefing.shoppingSuggestions.map((s, i) => (
              <p key={i} className="text-xs text-white/60">
                <span className="text-white">{s.name}</span> — {s.reason}
              </p>
            ))}
          </Link>
        </section>
      )}
    </div>
  );
}

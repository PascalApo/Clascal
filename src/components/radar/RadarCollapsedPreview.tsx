import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { RadarBriefing, RadarCollisionSeverity } from '@/types/radar';

const MODULE_LINKS: Record<string, string> = {
  kalender: '/kalender',
  essen: '/essen',
  einkauf: '/einkauf',
  buerokratie: '/radar',
  fairness: '/radar',
};

export interface RadarPreviewHint {
  id: string;
  severity: RadarCollisionSeverity;
  title: string;
  description?: string;
  link?: string;
}

const SEVERITY_ORDER: Record<RadarCollisionSeverity, number> = {
  urgent: 0,
  warning: 1,
  info: 2,
};

export function getRadarPreviewHints(briefing: RadarBriefing): RadarPreviewHint[] {
  const hints: RadarPreviewHint[] = [];

  for (const c of [...briefing.collisions].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  )) {
    hints.push({
      id: c.id,
      severity: c.severity,
      title: c.title,
      description: c.description,
      link: MODULE_LINKS[c.relatedModule],
    });
  }

  for (const d of briefing.upcomingDeadlines) {
    hints.push({
      id: `deadline-${d.id}`,
      severity: 'urgent',
      title: d.title,
      description: `Fällig ${new Date(d.dueDate + 'T12:00:00').toLocaleDateString('de-DE')}`,
      link: '/radar',
    });
  }

  for (const action of briefing.foodActions) {
    hints.push({
      id: `food-${action.type}-${action.title}`,
      severity: 'warning',
      title: action.title,
      description: action.description,
      link: action.recipe ? `/essen/${action.recipe.id}` : '/essen',
    });
  }

  for (const assignment of briefing.assignments) {
    hints.push({
      id: `assign-${assignment.title}`,
      severity: 'info',
      title: assignment.title,
      description: assignment.description,
    });
  }

  if (briefing.shoppingSuggestions.length > 0) {
    hints.push({
      id: 'shopping-suggestions',
      severity: 'info',
      title: 'Einkauf-Empfehlungen',
      description: `${briefing.shoppingSuggestions.length} Artikel vorgeschlagen`,
      link: '/einkauf',
    });
  }

  return hints;
}

export function getRadarHintCount(briefing: RadarBriefing): number {
  return getRadarPreviewHints(briefing).length;
}

function SeverityIcon({ severity }: { severity: RadarCollisionSeverity }) {
  if (severity === 'urgent') return <AlertCircle size={14} className="shrink-0 text-red-400" />;
  if (severity === 'warning') return <AlertTriangle size={14} className="shrink-0 text-amber-400" />;
  return <Info size={14} className="shrink-0 text-sky-400" />;
}

interface RadarCollapsedPreviewProps {
  briefing: RadarBriefing;
  expanded: boolean;
  onToggle: () => void;
}

export function RadarCollapsedPreview({ briefing, expanded, onToggle }: RadarCollapsedPreviewProps) {
  const hints = getRadarPreviewHints(briefing);
  const topHints = hints.slice(0, 3);
  const hintCount = hints.length;

  return (
    <div className="space-y-3">
      {topHints.length > 0 ? (
        <div className="space-y-2">
          {topHints.map((hint, i) => {
            const content = (
              <>
                <SeverityIcon severity={hint.severity} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{hint.title}</p>
                  {hint.description && (
                    <p className="truncate text-xs text-white/55">{hint.description}</p>
                  )}
                </div>
              </>
            );

            return (
              <motion.div
                key={hint.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {hint.link ? (
                  <Link
                    to={hint.link}
                    className="glass-card flex items-center gap-3 p-3 transition-colors hover-accent-bg-muted"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="glass-card flex items-center gap-3 p-3">{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="glass-card px-4 py-3 text-center text-xs text-white/55">
          Keine offenen Hinweise — alles im grünen Bereich
        </p>
      )}

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-white/80 transition-colors hover-accent-bg-muted"
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expanded ? 'Wochen-Radar schließen' : 'Wochen-Radar öffnen'}
        {!expanded && hintCount > 0 && (
          <span className="rounded-full accent-bg-muted px-2 py-0.5 text-xs accent-text">
            {hintCount}
          </span>
        )}
      </button>
    </div>
  );
}

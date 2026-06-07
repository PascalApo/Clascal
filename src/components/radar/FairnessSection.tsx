import type { FairnessReport } from '@/types/radar';
import { useUser } from '@/context/UserContext';
import { Scale } from 'lucide-react';

interface FairnessSectionProps {
  fairness: FairnessReport;
}

export function FairnessSection({ fairness }: FairnessSectionProps) {
  const { userColors } = useUser();
  const total = fairness.user1Score + fairness.user2Score || 1;
  const user1Pct = Math.round((fairness.user1Score / total) * 100);
  const user2Pct = 100 - user1Pct;

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-white">
        <Scale size={16} className="accent-text" />
        Fairness diese Woche
      </h3>

      <div className="glass-card p-4 space-y-3">
        <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
          <div
            className="transition-all duration-500"
            style={{ width: `${user1Pct}%`, backgroundColor: userColors.user1 }}
          />
          <div
            className="transition-all duration-500"
            style={{ width: `${user2Pct}%`, backgroundColor: userColors.user2 }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-lg font-bold" style={{ color: userColors.user1 }}>{user1Pct}%</p>
            <p className="text-xs text-white/40">Clara</p>
            <p className="text-[10px] text-white/25">
              Planung {fairness.user1Planning} · Ausführung {fairness.user1Execution}
            </p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: userColors.user2 }}>{user2Pct}%</p>
            <p className="text-xs text-white/40">Pascal</p>
            <p className="text-[10px] text-white/25">
              Planung {fairness.user2Planning} · Ausführung {fairness.user2Execution}
            </p>
          </div>
        </div>

        <p className="text-xs text-white/50 text-center">{fairness.balanceHint}</p>
      </div>
    </section>
  );
}

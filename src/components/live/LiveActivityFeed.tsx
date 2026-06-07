import { useUser } from '@/context/UserContext';
import { useAppData } from '@/context/AppDataContext';
import { PartnerDot } from '@/components/ui/PartnerDot';

export function LiveActivityFeed({ compact = false }: { compact?: boolean }) {
  const { activityFeed, isLiveSync } = useAppData();
  const { userId } = useUser();

  const partnerActivities = activityFeed.filter((a) => a.createdBy !== userId).slice(0, compact ? 2 : 3);

  if (!isLiveSync || partnerActivities.length === 0) return null;

  return (
    <div className={`glass-card border border-white/10 ${compact ? 'px-3 py-2' : 'p-3'}`}>
      {!compact && (
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/55">
          Partner live
        </p>
      )}
      <ul className="space-y-1">
        {partnerActivities.map((a) => (
          <li key={a.id} className="flex items-center gap-2 text-xs text-white/75">
            <PartnerDot userId={a.createdBy} />
            <span className="truncate">{a.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

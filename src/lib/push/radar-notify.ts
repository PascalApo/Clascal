import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { HOUSEHOLD_ID } from '@/lib/supabase/client';
import type { RadarBriefing } from '@/types/radar';
import { formatBriefingForPush } from '@/lib/radar/engine';

const LAST_BRIEFING_KEY = 'haushalt-radar-last-briefing';

export function getLastBriefingWeek(): string | null {
  return localStorage.getItem(LAST_BRIEFING_KEY);
}

export function markBriefingSent(weekLabel: string): void {
  localStorage.setItem(LAST_BRIEFING_KEY, weekLabel);
}

export function shouldAutoSendBriefing(weekLabel: string): boolean {
  return getLastBriefingWeek() !== weekLabel;
}

export async function notifyPartnerRadarBriefing(
  senderUserId: string,
  senderName: string,
  briefing: RadarBriefing,
): Promise<{ ok: boolean; error?: string; sent?: number }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase nicht konfiguriert' };
  }

  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: 'Supabase nicht erreichbar' };

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const { title, body } = formatBriefingForPush(briefing);

  const { data, error } = await sb.functions.invoke('send-partner-notification', {
    body: {
      senderUserId,
      senderName,
      householdId: HOUSEHOLD_ID,
      title,
      body,
      url: `${base}/radar`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const result = data as { sent?: number; error?: string } | null;
  if (result?.error && (result.sent ?? 0) === 0) {
    return { ok: false, error: result.error };
  }

  markBriefingSent(briefing.weekLabel);
  return { ok: true, sent: result?.sent ?? 0 };
}

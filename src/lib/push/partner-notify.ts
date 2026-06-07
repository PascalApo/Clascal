import { getSupabaseClient, HOUSEHOLD_ID, isSupabaseConfigured } from '@/lib/supabase/client';
import { USER_BASE, type UserId } from '@/types/user';

export async function notifyPartnerShoppingUpdate(
  senderUserId: UserId,
): Promise<{ ok: boolean; error?: string; sent?: number }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase nicht konfiguriert' };
  }

  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: 'Supabase nicht erreichbar' };

  const senderName = USER_BASE[senderUserId].name;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  const { data, error } = await sb.functions.invoke('send-partner-notification', {
    body: {
      senderUserId,
      householdId: HOUSEHOLD_ID,
      title: 'Einkaufsliste aktualisiert',
      body: `${senderName} hat die Einkaufsliste aktualisiert.`,
      url: `${base}/einkauf`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const result = data as { sent?: number; error?: string } | null;
  if (result?.error && (result.sent ?? 0) === 0) {
    return { ok: false, error: result.error };
  }

  return { ok: true, sent: result?.sent ?? 0 };
}

import { getSupabaseClient, HOUSEHOLD_ID, isSupabaseConfigured } from '@/lib/supabase/client';
import type { UserId } from '@/types/user';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
  );
}

export function getVapidPublicKey(): string | null {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

async function savePushSubscription(userId: UserId, subscription: PushSubscription): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) throw new Error('Supabase nicht konfiguriert');

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('Ungültige Push-Subscription');
  }

  const { error } = await sb.from('push_subscriptions').upsert(
    {
      household_id: HOUSEHOLD_ID,
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'household_id,user_id' },
  );

  if (error) throw new Error(error.message);
}

export async function ensurePushSubscription(
  userId: UserId,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase nicht konfiguriert' };
  }

  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) {
    return { ok: false, error: 'VAPID-Schlüssel fehlt (VITE_VAPID_PUBLIC_KEY)' };
  }

  if (!isPushSupported()) {
    return {
      ok: false,
      error: 'Push wird hier nicht unterstützt. Auf dem iPhone: App zum Home-Bildschirm hinzufügen.',
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, error: 'Benachrichtigungen wurden nicht erlaubt' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
    }

    await savePushSubscription(userId, subscription);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Push-Aktivierung fehlgeschlagen',
    };
  }
}

export async function getPushPermissionState(): Promise<NotificationPermission | 'unsupported'> {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

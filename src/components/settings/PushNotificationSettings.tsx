import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Loader2, Smartphone } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import {
  ensurePushSubscription,
  getPushPermissionState,
  getVapidPublicKey,
  isPushSupported,
} from '@/lib/push/subscriptions';

export function PushNotificationSettings() {
  const { userId, user } = useUser();
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const pushSupported = isPushSupported();
  const vapidConfigured = Boolean(getVapidPublicKey());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    void getPushPermissionState().then(setPermission);
  }, [status]);

  const handleEnable = async () => {
    if (!userId) return;
    setStatus('loading');
    setMessage(null);

    const result = await ensurePushSubscription(userId);
    if (result.ok) {
      setStatus('active');
      setMessage(`Benachrichtigungen für ${user?.name ?? 'Profil'} sind aktiv.`);
    } else {
      setStatus('error');
      setMessage(result.error);
    }
  };

  return (
    <div className="glass-card space-y-3 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/5 p-3">
          <Bell size={20} className="accent-text" />
        </div>
        <div>
          <p className="font-medium">Push-Benachrichtigungen</p>
          <p className="text-xs text-white/65">
            Nur der Partner wird informiert – nicht du selbst
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-dark-200/40 px-3 py-2 text-[11px] text-white/60">
        <p className="flex items-center gap-1.5">
          <Smartphone size={12} />
          iPhone: App zum Home-Bildschirm hinzufügen, dann hier aktivieren
        </p>
      </div>

      {!vapidConfigured && (
        <p className="text-xs text-amber-400/80">
          VITE_VAPID_PUBLIC_KEY fehlt – siehe .env.example und GitHub Actions Variables.
        </p>
      )}

      {!pushSupported && (
        <p className="text-xs text-white/60">Push wird auf diesem Browser/Gerät nicht unterstützt.</p>
      )}

      {message && (
        <p className={`text-xs ${status === 'error' ? 'text-red-400/80' : 'text-green-400/80'}`}>
          {message}
        </p>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => void handleEnable()}
        disabled={!pushSupported || !vapidConfigured || status === 'loading'}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm accent-bg-muted accent-text disabled:opacity-40"
      >
        {status === 'loading' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : permission === 'granted' ? (
          <Bell size={16} />
        ) : (
          <BellOff size={16} />
        )}
        {permission === 'granted' ? 'Benachrichtigungen erneuern' : 'Benachrichtigungen aktivieren'}
      </motion.button>
    </div>
  );
}

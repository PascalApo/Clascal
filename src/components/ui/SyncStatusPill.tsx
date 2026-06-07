import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';

export function SyncStatusPill({ className = '' }: { className?: string }) {
  const { syncStatus, isLiveSync } = useAppData();

  const config = {
    live: {
      icon: Wifi,
      label: 'Live',
      className: 'border-green-500/40 bg-green-500/10 text-green-400',
      pulse: true,
    },
    connecting: {
      icon: Loader2,
      label: 'Verbinde…',
      className: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
      pulse: false,
    },
    local: {
      icon: WifiOff,
      label: 'Lokal',
      className: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
      pulse: false,
    },
    error: {
      icon: AlertCircle,
      label: 'Sync-Fehler',
      className: 'border-red-500/40 bg-red-500/10 text-red-400',
      pulse: false,
    },
  }[syncStatus];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${config.className} ${className} ${config.pulse && isLiveSync ? 'animate-pulse' : ''}`}
    >
      <Icon size={12} className={syncStatus === 'connecting' ? 'animate-spin' : ''} />
      {config.label}
    </span>
  );
}

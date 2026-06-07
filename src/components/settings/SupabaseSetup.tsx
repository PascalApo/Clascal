import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2, AlertCircle, CheckCircle2, Cloud } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { isSupabaseConfigured, supabaseConfigError, HOUSEHOLD_ID } from '@/lib/supabase/client';

const STEPS = [
  'Kostenloses Projekt auf supabase.com erstellen',
  'SQL Editor → Inhalt von supabase/schema.sql einfügen → Run',
  'Unter Project Settings → API: URL und anon key kopieren',
  'Im Projektordner .env.local anlegen (siehe .env.example)',
  'App neu starten: npm run dev',
];

export function SupabaseSetup() {
  const { syncStatus } = useAppData();
  const configured = isSupabaseConfigured;

  const statusConfig = {
    local: {
      icon: WifiOff,
      color: 'text-white/40',
      bg: 'bg-white/5',
      label: 'Lokal',
      desc: configured
        ? 'Verbinde…'
        : 'Supabase nicht konfiguriert – Daten nur auf diesem Gerät',
    },
    connecting: {
      icon: Loader2,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      label: 'Verbinde…',
      desc: 'Synchronisiere mit der Cloud',
    },
    live: {
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      label: 'Live-Sync aktiv',
      desc: 'Clara & Pascal sehen dieselben Daten in Echtzeit',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      label: 'Sync-Fehler',
      desc: 'Prüfe .env.local und ob schema.sql ausgeführt wurde',
    },
  }[syncStatus];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      <div className={`glass-card flex items-center gap-4 p-4 ${statusConfig.bg}`}>
        <div className={`rounded-xl p-3 ${statusConfig.bg}`}>
          <StatusIcon
            size={24}
            className={`${statusConfig.color} ${syncStatus === 'connecting' ? 'animate-spin' : ''}`}
          />
        </div>
        <div>
          <p className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</p>
          <p className="text-xs text-white/40">{statusConfig.desc}</p>
          {configured && (
            <p className="mt-1 text-[10px] text-white/25">
              Haushalt-ID: {HOUSEHOLD_ID}
            </p>
          )}
        </div>
        {syncStatus === 'live' && <Wifi size={18} className="ml-auto text-green-400" />}
      </div>

      {supabaseConfigError && (
        <div className="glass-card border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          <p className="font-medium">Ungültige Supabase-URL</p>
          <p className="mt-1 text-red-200/80">{supabaseConfigError}</p>
        </div>
      )}

      {!configured && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Cloud size={16} className="accent-text" />
            <h3 className="text-sm font-medium">Supabase einrichten (5 Min.)</h3>
          </div>
          <ol className="space-y-2">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/50">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl bg-dark-200/50 p-3 font-mono text-[10px] text-white/40">
            <p>VITE_SUPABASE_URL=https://xxx.supabase.co</p>
            <p className="mt-1 text-amber-400/80">
              Nicht api.supabase.com/platform – nur die Project URL aus dem API-Tab!
            </p>
            <p className="mt-2">VITE_SUPABASE_ANON_KEY=eyJ...</p>
            <p>VITE_HOUSEHOLD_ID=clara-pascal</p>
          </div>
        </motion.div>
      )}

      {syncStatus === 'live' && (
        <p className="text-xs text-white/35">
          Synchronisiert: Einkaufsliste, Aufgaben, Termine, Essensplan & Ausgaben
        </p>
      )}
    </div>
  );
}

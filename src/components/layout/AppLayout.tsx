import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Palette } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { SyncStatusPill } from '@/components/ui/SyncStatusPill';
import { useUser } from '@/context/UserContext';
import { useAppData } from '@/context/AppDataContext';

export function AppLayout() {
  const { user, logout } = useUser();
  const { isLiveSync } = useAppData();

  return (
    <ThemeScope>
      <div className="safe-x relative min-h-dvh pb-24">
        <div
          className="pointer-events-none fixed inset-0 bg-grid-pattern bg-grid opacity-30"
          aria-hidden
        />

        <header className="safe-top sticky top-0 z-40 px-4 py-4">
          <div
            className={`glass-card px-4 py-3 ${isLiveSync ? 'ring-1 ring-green-500/30' : ''}`}
          >
            <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/65">Willkommen zurück</p>
              <h1 className="font-display text-lg font-bold accent-gradient-text">
                {user?.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <SyncStatusPill />
              <Link to="/einstellungen">
                <motion.span
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors accent-bg-muted hover:bg-white/10"
                  aria-label="Einstellungen"
                >
                  <Palette size={16} className="accent-text" />
                </motion.span>
              </Link>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => void logout()}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors accent-bg-muted hover:bg-white/10"
                aria-label="Abmelden"
              >
                <LogOut size={16} className="accent-text" />
                <span className="text-white/75">Logout</span>
              </motion.button>
            </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 px-4">
          <PullToRefresh>
            <Outlet />
          </PullToRefresh>
        </main>

        <BottomNav />
      </div>
    </ThemeScope>
  );
}

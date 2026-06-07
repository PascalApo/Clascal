import { useState, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';

interface PullToRefreshProps {
  children: ReactNode;
}

const PULL_THRESHOLD = 64;

export function PullToRefresh({ children }: PullToRefreshProps) {
  const { syncStatus, reconnectSync, isLiveSync } = useAppData();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  if (isLiveSync) {
    return <>{children}</>;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY <= 0) {
      setPull(Math.min(delta * 0.5, 100));
    }
  };

  const handleTouchEnd = async () => {
    pulling.current = false;
    if (pull >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      await reconnectSync();
      setRefreshing(false);
    }
    setPull(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => void handleTouchEnd()}
    >
      <motion.div
        animate={{ height: pull > 0 ? pull : refreshing ? 48 : 0 }}
        className="flex items-center justify-center overflow-hidden text-xs text-white/55"
      >
        {refreshing ? (
          <Loader2 size={16} className="animate-spin accent-text" />
        ) : pull >= PULL_THRESHOLD ? (
          <span>Loslassen zum Aktualisieren</span>
        ) : syncStatus === 'error' ? (
          <span className="flex items-center gap-1 text-amber-400">
            <ArrowDown size={14} /> Ziehen zum Neuverbinden
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <ArrowDown size={14} /> Ziehen zum Sync
          </span>
        )}
      </motion.div>
      {children}
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';

export function ToastHost() {
  const { toasts, dismissToast } = useAppData();

  return (
    <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 safe-bottom">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl border px-4 py-2.5 text-sm shadow-glass backdrop-blur-xl ${
              toast.type === 'error'
                ? 'border-red-500/40 bg-red-950/90 text-red-100'
                : 'border-white/15 bg-dark-100/95 text-white'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={toast.onAction}
                className="shrink-0 text-xs font-medium accent-text"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-white/50 hover:text-white"
              aria-label="Schließen"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

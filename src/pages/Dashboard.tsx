import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wallet,
  CalendarDays,
  ShoppingCart,
  ChefHat,
  ArrowRight,
} from 'lucide-react';

const modules = [
  {
    to: '/haushaltsbuch',
    icon: Wallet,
    title: 'Haushaltsbuch',
    desc: 'PDF-Import & Ausgaben-Statistik',
  },
  {
    to: '/kalender',
    icon: CalendarDays,
    title: 'Aufgaben & Kalender',
    desc: 'Wochenplan & iOS-Export',
  },
  {
    to: '/einkauf',
    icon: ShoppingCart,
    title: 'Einkaufsliste',
    desc: 'Echtzeit-Sync nach Kategorien',
  },
  {
    to: '/essen',
    icon: ChefHat,
    title: 'Essensplaner',
    desc: '100+ Rezepte & Wochenplan',
  },
];

export function Dashboard() {
  return (
    <div className="space-y-6 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border accent-border p-5"
      >
        <p className="text-sm text-white/50">Dein Dashboard</p>
        <h2 className="mt-1 font-display text-2xl font-bold accent-gradient-text">
          Alles im Blick
        </h2>
        <p className="mt-2 text-sm text-white/40">
          Finanzen, Planung, Einkauf und Essen — alles an einem Ort.
        </p>
      </motion.div>

      <div className="grid gap-3">
        {modules.map(({ to, icon: Icon, title, desc }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={to}
              className="glass-card group flex items-center gap-4 p-4 transition-all hover-accent-bg-muted"
            >
              <div className="rounded-xl p-3 accent-bg-muted">
                <Icon size={22} className="accent-text" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{title}</h3>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
              <ArrowRight
                size={18}
                className="text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-white/50"
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

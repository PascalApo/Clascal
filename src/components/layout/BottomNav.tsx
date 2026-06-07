import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  CalendarDays,
  ShoppingCart,
  ChefHat,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/haushaltsbuch', icon: Wallet, label: 'Geld' },
  { to: '/kalender', icon: CalendarDays, label: 'Plan' },
  { to: '/einkauf', icon: ShoppingCart, label: 'Einkauf' },
  { to: '/essen', icon: ChefHat, label: 'Essen' },
];

export function BottomNav() {
  const { theme } = useUser();
  const accentColor = theme?.accent ?? '#00d4ff';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-3 mb-3">
        <div className="glass-card flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className="relative flex-1">
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-0.5 py-1">
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-1 h-1 w-8 rounded-full"
                      style={{ backgroundColor: accentColor }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className={`transition-colors duration-200 ${
                      isActive ? '' : 'text-white/60'
                    }`}
                    style={isActive ? { color: accentColor } : undefined}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors duration-200 ${
                      isActive ? '' : 'text-white/60'
                    }`}
                    style={isActive ? { color: accentColor } : undefined}
                  >
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

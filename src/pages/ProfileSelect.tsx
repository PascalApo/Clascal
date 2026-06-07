import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { USER_BASE, type UserId } from '@/types';
import { buildTheme } from '@/lib/user-colors';

const profileCards: { id: UserId; emoji: string }[] = [
  { id: 'user1', emoji: '✨' },
  { id: 'user2', emoji: '🚀' },
];

export function ProfileSelect() {
  const { login, userColors } = useUser();
  const navigate = useNavigate();

  const handleSelect = (id: UserId) => {
    login(id);
    navigate('/dashboard');
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-20"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-100/80 shadow-glass"
        >
          <Heart size={32} style={{ color: userColors.user1 }} />
        </motion.div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white md:text-3xl">
          Clara & Pascal
        </h1>
        <p className="mt-2 text-sm text-white/50">Haushalts- & Beziehungs-Hub</p>
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-white/55">
          <Sparkles size={12} />
          <span>Wähle dein Profil</span>
          <Sparkles size={12} />
        </div>
      </motion.div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        {profileCards.map(({ id, emoji }, index) => {
          const profile = USER_BASE[id];
          const theme = buildTheme(userColors[id]);

          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: index === 0 ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(id)}
              className="group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300"
              style={{
                borderColor: theme.accentBorder,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: theme.accentMuted }}
              />
              <div className="relative flex items-center gap-4">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p
                    className="font-display text-xl font-bold"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${theme.accent}, ${theme.accentLight})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {profile.name}
                  </p>
                  <p className="text-sm text-white/65">Persönliche Farbzone</p>
                </div>
                <span
                  className="ml-auto h-6 w-6 rounded-full ring-2 ring-white/20"
                  style={{ backgroundColor: theme.accent }}
                />
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-0.5"
                style={{ backgroundColor: theme.accent }}
                initial={{ width: '0%' }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center text-xs text-white/55"
      >
        Privat · Synchronisiert · Für uns zwei
      </motion.p>
    </div>
  );
}

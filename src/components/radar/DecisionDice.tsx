import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices } from 'lucide-react';
import {
  rollDecision,
  DECISION_CATEGORY_LABELS,
  type DecisionCategory,
} from '@/lib/radar/decision-dice';
import { useAppData } from '@/context/AppDataContext';
import { useUser } from '@/context/UserContext';

const CATEGORIES: DecisionCategory[] = ['weekend', 'restaurant', 'movie', 'cook_today', 'activity'];

export function DecisionDice() {
  const [category, setCategory] = useState<DecisionCategory>('weekend');
  const [result, setResult] = useState<{ label: string; emoji: string } | null>(null);
  const [rolling, setRolling] = useState(false);
  const { recordMentalLoad } = useAppData();
  const { userId } = useUser();

  const handleRoll = () => {
    setRolling(true);
    setTimeout(() => {
      const picked = rollDecision(category, result ? [result.label] : []);
      setResult(picked);
      setRolling(false);
      if (userId) {
        recordMentalLoad(userId, 'coordination', `Entscheidung: ${DECISION_CATEGORY_LABELS[category]} → ${picked.label}`);
      }
    }, 600);
  };

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-white">
        <Dices size={16} className="accent-text" />
        Entscheidungs-Würfel
      </h3>

      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategory(cat); setResult(null); }}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                category === cat
                  ? 'accent-bg text-black font-medium'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {DECISION_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {result && !rolling && (
            <motion.div
              key={result.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-4"
            >
              <span className="text-4xl">{result.emoji}</span>
              <p className="mt-2 font-display text-lg font-bold text-white">{result.label}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleRoll}
          disabled={rolling}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium accent-bg text-black disabled:opacity-60"
        >
          <motion.span
            animate={rolling ? { rotate: 360 } : { rotate: 0 }}
            transition={rolling ? { repeat: Infinity, duration: 0.4 } : {}}
          >
            <Dices size={18} />
          </motion.span>
          {rolling ? 'Würfelt…' : result ? 'Nochmal würfeln' : 'Würfeln'}
        </button>
      </div>
    </section>
  );
}

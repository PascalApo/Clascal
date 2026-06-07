import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <div className="mb-4 rounded-2xl p-4 accent-bg-muted">
        <Construction size={40} className="accent-text" />
      </div>
      <h2 className="font-display text-xl font-bold accent-gradient-text">{title}</h2>
      <p className="mt-2 max-w-xs text-sm text-white/40">{description}</p>
      <p className="mt-4 text-xs text-white/25">Kommt in Schritt 2+</p>
    </motion.div>
  );
}

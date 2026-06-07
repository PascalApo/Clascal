import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useUser } from '@/context/UserContext';
import { daysUntilExpiry } from '@/types/pantry';

export function PantrySection() {
  const { pantryItems, addPantryItem, removePantryItem } = useAppData();
  const { userId } = useUser();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [showForm, setShowForm] = useState(false);

  const sorted = [...pantryItems].sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));

  const handleAdd = () => {
    if (!name.trim() || !expiresOn) return;
    addPantryItem({
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      expiresOn,
      createdBy: userId ?? 'user1',
    });
    setName('');
    setQuantity('');
    setExpiresOn('');
    setShowForm(false);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white">
          <Package size={16} className="accent-text" />
          Vorrats-Tracker
        </h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg p-1.5 accent-bg-muted transition-colors hover-accent-bg"
        >
          <Plus size={16} className="accent-text" />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card space-y-2 overflow-hidden p-3"
          >
            <input
              type="text"
              placeholder="Artikel (z.B. Milch)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/55 outline-none focus:ring-1 accent-ring"
            />
            <input
              type="text"
              placeholder="Menge (optional)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/55 outline-none focus:ring-1 accent-ring"
            />
            <input
              type="date"
              value={expiresOn}
              onChange={(e) => setExpiresOn(e.target.value)}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 accent-ring"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="w-full rounded-lg py-2 text-sm font-medium accent-bg text-black"
            >
              Hinzufügen
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.length === 0 ? (
        <p className="text-xs text-white/55">Noch keine Vorräte erfasst — Ablaufdaten helfen beim Zero-Waste-Plan.</p>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((item) => {
            const days = daysUntilExpiry(item.expiresOn);
            const urgent = days <= 2;
            const warning = days <= 7;
            return (
              <div
                key={item.id}
                className="glass-card flex items-center gap-3 p-3"
              >
                {(urgent || warning) && (
                  <AlertTriangle
                    size={14}
                    className={urgent ? 'text-red-400' : 'text-amber-400'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{item.name}</p>
                  <p className="text-xs text-white/65">
                    {item.quantity && `${item.quantity} · `}
                    {days < 0
                      ? 'Abgelaufen'
                      : days === 0
                        ? 'Heute'
                        : `Noch ${days} Tag${days !== 1 ? 'e' : ''}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePantryItem(item.id)}
                  className="rounded p-1 text-white/50 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

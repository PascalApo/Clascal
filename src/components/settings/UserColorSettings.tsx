import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { USER_BASE, type UserId } from '@/types';
import { COLOR_PRESETS, isValidHex } from '@/lib/user-colors';

interface UserColorRowProps {
  id: UserId;
  isCurrentUser: boolean;
}

function UserColorRow({ id, isCurrentUser }: UserColorRowProps) {
  const { userColors, setUserColor, resetUserColor, getThemeForUser } = useUser();
  const color = userColors[id];
  const theme = getThemeForUser(id);
  const name = USER_BASE[id].name;

  return (
    <div
      className="glass-card p-4"
      style={{
        borderColor: isCurrentUser ? theme.accentBorder : undefined,
        boxShadow: isCurrentUser ? theme.accentGlow : undefined,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-8 w-8 rounded-full ring-2 ring-white/20"
            style={{ backgroundColor: color }}
          />
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-xs text-white/40">
              {isCurrentUser ? 'Dein Profil' : 'Partner-Profil'} · {color.toUpperCase()}
            </p>
          </div>
        </div>
        <button
          onClick={() => resetUserColor(id)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-white/30 hover:bg-white/5 hover:text-white/60"
          title="Standardfarbe"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {COLOR_PRESETS.map((preset) => (
          <motion.button
            key={preset}
            whileTap={{ scale: 0.9 }}
            onClick={() => setUserColor(id, preset)}
            className="h-8 w-8 rounded-full ring-1 ring-white/20 transition-transform hover:scale-110"
            style={{
              backgroundColor: preset,
              outline: color === preset ? `2px solid ${preset}` : undefined,
              outlineOffset: '2px',
            }}
            aria-label={`Farbe ${preset}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={color}
          onChange={(e) => setUserColor(id, e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => {
            const v = e.target.value;
            if (isValidHex(v)) setUserColor(id, v);
          }}
          className="flex-1 rounded-xl bg-dark-200 px-3 py-2 font-mono text-sm uppercase outline-none"
          maxLength={7}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <span className="accent-preview rounded-lg px-3 py-1 text-xs" style={{ color, backgroundColor: theme.accentMuted, border: `1px solid ${theme.accentBorder}` }}>
          Vorschau
        </span>
        <span className="rounded-lg px-3 py-1 text-xs font-display font-bold" style={{ color, background: `linear-gradient(135deg, ${theme.accentMuted}, transparent)` }}>
          {name}
        </span>
      </div>
    </div>
  );
}

export function UserColorSettings() {
  const { userId } = useUser();

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/40">
        Wähle deine Lieblingsfarbe — sie wird in der gesamten App als Akzentfarbe verwendet.
      </p>
      <UserColorRow id="user1" isCurrentUser={userId === 'user1'} />
      <UserColorRow id="user2" isCurrentUser={userId === 'user2'} />
    </div>
  );
}

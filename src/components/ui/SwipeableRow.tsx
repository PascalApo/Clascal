import { useState, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';
import { hapticTap } from '@/lib/haptics';

interface SwipeableRowProps {
  children: ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightLabel?: string;
  leftLabel?: string;
  className?: string;
}

const THRESHOLD = 72;

export function SwipeableRow({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = 'Erledigt',
  leftLabel = 'Löschen',
  className = '',
}: SwipeableRowProps) {
  const x = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const rightOpacity = useTransform(x, [0, THRESHOLD], [0, 1]);
  const leftOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    if (info.offset.x > THRESHOLD && onSwipeRight) {
      hapticTap();
      onSwipeRight();
    } else if (info.offset.x < -THRESHOLD && onSwipeLeft) {
      hapticTap();
      onSwipeLeft();
    }
  };

  if (!onSwipeRight && !onSwipeLeft) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {onSwipeRight && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute inset-y-0 left-0 flex w-20 items-center justify-center bg-green-500/20 text-green-400"
        >
          <Check size={18} />
          <span className="ml-1 text-[10px]">{rightLabel}</span>
        </motion.div>
      )}
      {onSwipeLeft && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500/20 text-red-400"
        >
          <Trash2 size={18} />
          <span className="ml-1 text-[10px]">{leftLabel}</span>
        </motion.div>
      )}
      <motion.div
        drag="x"
        dragConstraints={{ left: onSwipeLeft ? -THRESHOLD * 1.5 : 0, right: onSwipeRight ? THRESHOLD * 1.5 : 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`relative z-10 ${dragging ? 'cursor-grabbing' : ''}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

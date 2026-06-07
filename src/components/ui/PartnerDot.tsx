import { useUser } from '@/context/UserContext';
import { USER_BASE, type UserId } from '@/types/user';

interface PartnerDotProps {
  userId: string;
  className?: string;
}

export function PartnerDot({ userId, className = '' }: PartnerDotProps) {
  const { userColors } = useUser();
  const color =
    userId === 'user1' || userId === 'user2'
      ? userColors[userId as UserId]
      : '#888';

  const label =
    userId === 'user1' || userId === 'user2' ? USER_BASE[userId as UserId].name : '?';

  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ring-1 ring-white/20 ${className}`}
      style={{ backgroundColor: color }}
      title={label}
      aria-label={label}
    />
  );
}

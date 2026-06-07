import type { ReactNode } from 'react';
import { useUser } from '@/context/UserContext';

export function ThemeScope({ children }: { children: ReactNode }) {
  const { themeStyle } = useUser();

  return (
    <div className="theme-scope min-h-dvh" style={themeStyle}>
      {children}
    </div>
  );
}

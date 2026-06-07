import type { UserId } from '@/types';

export const COLOR_STORAGE_KEY = 'haushalt-user-colors';

export const DEFAULT_USER_COLORS: Record<UserId, string> = {
  user1: '#ff00aa',
  user2: '#00d4ff',
};

export const COLOR_PRESETS = [
  '#ff00aa',
  '#00d4ff',
  '#a855f7',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#ec4899',
  '#14b8a6',
  '#eab308',
] as const;

export function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function loadUserColors(): Record<UserId, string> {
  try {
    const raw = localStorage.getItem(COLOR_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_COLORS };
    const parsed = JSON.parse(raw) as Partial<Record<UserId, string>>;
    return {
      user1: isValidHex(parsed.user1 ?? '') ? parsed.user1! : DEFAULT_USER_COLORS.user1,
      user2: isValidHex(parsed.user2 ?? '') ? parsed.user2! : DEFAULT_USER_COLORS.user2,
    };
  } catch {
    return { ...DEFAULT_USER_COLORS };
  }
}

export function saveUserColors(colors: Record<UserId, string>): void {
  localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(colors));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lightenHex(hex: string, amount = 30): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.min(255, c + amount);
  const toHex = (c: number) => mix(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export interface UserTheme {
  accent: string;
  accentLight: string;
  accentMuted: string;
  accentBorder: string;
  accentGlow: string;
}

export function buildTheme(hex: string): UserTheme {
  return {
    accent: hex,
    accentLight: lightenHex(hex),
    accentMuted: withAlpha(hex, 0.1),
    accentBorder: withAlpha(hex, 0.4),
    accentGlow: `0 0 20px ${withAlpha(hex, 0.25)}, 0 0 40px ${withAlpha(hex, 0.12)}`,
  };
}

export function getAssigneeColor(
  colors: Record<UserId, string>,
  assignedTo: UserId | 'both',
): string {
  if (assignedTo === 'both') {
    return `linear-gradient(90deg, ${colors.user1}, ${colors.user2})`;
  }
  return colors[assignedTo];
}

export function themeToCssVars(theme: UserTheme): Record<string, string> {
  return {
    '--accent': theme.accent,
    '--accent-light': theme.accentLight,
    '--accent-10': theme.accentMuted,
    '--accent-40': theme.accentBorder,
    '--accent-glow': theme.accentGlow,
  };
}

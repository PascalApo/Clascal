import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { type UserId, type UserProfile, USER_BASE } from '@/types';
import {
  loadUserColors,
  saveUserColors,
  buildTheme,
  getAssigneeColor,
  themeToCssVars,
  isValidHex,
  type UserTheme,
  DEFAULT_USER_COLORS,
} from '@/lib/user-colors';

interface UserContextValue {
  authLoading: boolean;
  user: UserProfile | null;
  userId: string | null;
  theme: UserTheme | null;
  userColors: Record<UserId, string>;
  login: (id: UserId) => void;
  logout: () => void;
  isAuthenticated: boolean;
  setUserColor: (id: UserId, color: string) => void;
  resetUserColor: (id: UserId) => void;
  getThemeForUser: (id: UserId) => UserTheme;
  getAssigneeColor: (assignedTo: UserId | 'both') => string;
  themeStyle: CSSProperties;
  getOtherMemberNames: () => string;
}

const UserContext = createContext<UserContextValue | null>(null);

const LEGACY_STORAGE_KEY = 'haushalt-active-user';

function getStoredLegacyUser(): UserId | null {
  const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (stored === 'user1' || stored === 'user2') return stored;
  return null;
}

function buildLegacyProfile(id: UserId, colors: Record<UserId, string>): UserProfile {
  return { ...USER_BASE[id], accentColor: colors[id] };
}

function getPartnerName(userId: UserId): string {
  return USER_BASE[userId === 'user1' ? 'user2' : 'user1'].name;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const authLoading = false;

  const [legacyUserId, setLegacyUserId] = useState<UserId | null>(getStoredLegacyUser());
  const [userColors, setUserColorsState] = useState(loadUserColors);

  const setUserColor = useCallback((id: UserId, color: string) => {
    if (!isValidHex(color)) return;
    setUserColorsState((prev) => {
      const next = { ...prev, [id]: color };
      saveUserColors(next);
      return next;
    });
  }, []);

  const resetUserColor = useCallback(
    (id: UserId) => {
      setUserColor(id, DEFAULT_USER_COLORS[id]);
    },
    [setUserColor],
  );

  const getThemeForUser = useCallback(
    (id: UserId) => buildTheme(userColors[id]),
    [userColors],
  );

  const getAssigneeColorFn = useCallback(
    (assignedTo: UserId | 'both') => getAssigneeColor(userColors, assignedTo),
    [userColors],
  );

  const isAuthenticated = legacyUserId !== null;
  const userId = legacyUserId;

  const user: UserProfile | null = useMemo(() => {
    if (legacyUserId) return buildLegacyProfile(legacyUserId, userColors);
    return null;
  }, [legacyUserId, userColors]);

  const theme = useMemo(() => {
    if (legacyUserId) return buildTheme(userColors[legacyUserId]);
    return null;
  }, [legacyUserId, userColors]);

  const themeStyle = useMemo((): CSSProperties => {
    if (!theme) return {};
    const vars = themeToCssVars(theme);
    return {
      ...vars,
      '--user1-color': userColors.user1,
      '--user2-color': userColors.user2,
    } as CSSProperties;
  }, [theme, userColors]);

  useEffect(() => {
    const { user1, user2 } = userColors;
    const c1 = user1.replace('#', '');
    const c2 = user2.replace('#', '');
    document.body.style.backgroundImage = `
      radial-gradient(ellipse at 20% 0%, #${c1}14 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, #${c2}14 0%, transparent 50%)
    `;
  }, [userColors]);

  const login = useCallback((id: UserId) => {
    localStorage.setItem(LEGACY_STORAGE_KEY, id);
    setLegacyUserId(id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setLegacyUserId(null);
  }, []);

  const getOtherMemberNames = useCallback(() => {
    if (!legacyUserId) return 'Partner';
    return getPartnerName(legacyUserId);
  }, [legacyUserId]);

  return (
    <UserContext.Provider
      value={{
        authLoading,
        user,
        userId,
        theme,
        userColors,
        login,
        logout,
        isAuthenticated,
        setUserColor,
        resetUserColor,
        getThemeForUser,
        getAssigneeColor: getAssigneeColorFn,
        themeStyle,
        getOtherMemberNames,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

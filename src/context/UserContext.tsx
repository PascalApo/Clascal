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
  user: UserProfile | null;
  userId: UserId | null;
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
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = 'haushalt-active-user';

function getStoredUser(): UserId | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'user1' || stored === 'user2') return stored;
  return null;
}

function buildProfile(id: UserId, colors: Record<UserId, string>): UserProfile {
  return { ...USER_BASE[id], accentColor: colors[id] };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<UserId | null>(getStoredUser);
  const [userColors, setUserColorsState] = useState(loadUserColors);

  const setUserColor = useCallback((id: UserId, color: string) => {
    if (!isValidHex(color)) return;
    setUserColorsState((prev) => {
      const next = { ...prev, [id]: color };
      saveUserColors(next);
      return next;
    });
  }, []);

  const resetUserColor = useCallback((id: UserId) => {
    setUserColor(id, DEFAULT_USER_COLORS[id]);
  }, [setUserColor]);

  const getThemeForUser = useCallback(
    (id: UserId) => buildTheme(userColors[id]),
    [userColors],
  );

  const getAssigneeColorFn = useCallback(
    (assignedTo: UserId | 'both') => getAssigneeColor(userColors, assignedTo),
    [userColors],
  );

  const user = userId ? buildProfile(userId, userColors) : null;
  const theme = userId ? buildTheme(userColors[userId]) : null;

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
    localStorage.setItem(STORAGE_KEY, id);
    setUserId(id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        userId,
        theme,
        userColors,
        login,
        logout,
        isAuthenticated: userId !== null,
        setUserColor,
        resetUserColor,
        getThemeForUser,
        getAssigneeColor: getAssigneeColorFn,
        themeStyle,
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

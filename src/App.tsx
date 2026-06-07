import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from '@/context/UserContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { RecipesProvider } from '@/context/RecipesContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileSelect } from '@/pages/ProfileSelect';
import { Dashboard } from '@/pages/Dashboard';
import { Haushaltsbuch } from '@/pages/Haushaltsbuch';
import { Kalender } from '@/pages/Kalender';
import { Einkauf } from '@/pages/Einkauf';
import { Essen } from '@/pages/Essen';
import { RecipeDetail } from '@/pages/RecipeDetail';
import { Settings } from '@/pages/Settings';
import { Radar } from '@/pages/Radar';

function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-white/65">
      Wird geladen…
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useUser();

  if (authLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeRoute() {
  const { isAuthenticated, authLoading } = useUser();

  if (authLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <ProfileSelect />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/haushaltsbuch" element={<Haushaltsbuch />} />
        <Route path="/kalender" element={<Kalender />} />
        <Route path="/einkauf" element={<Einkauf />} />
        <Route path="/essen" element={<Essen />} />
        <Route path="/essen/:id" element={<RecipeDetail />} />
        <Route path="/einstellungen" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppDataProvider>
        <RecipesProvider>
          <BrowserRouter basename="/Clascal">
            <AppRoutes />
          </BrowserRouter>
        </RecipesProvider>
      </AppDataProvider>
    </UserProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from '@/context/UserContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileSelect } from '@/pages/ProfileSelect';
import { Dashboard } from '@/pages/Dashboard';
import { Haushaltsbuch } from '@/pages/Haushaltsbuch';
import { Kalender } from '@/pages/Kalender';
import { Einkauf } from '@/pages/Einkauf';
import { Essen } from '@/pages/Essen';
import { RecipeDetail } from '@/pages/RecipeDetail';
import { Settings } from '@/pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useUser();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ProfileSelect />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
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
        <BrowserRouter basename="/Clascal">
          <AppRoutes />
        </BrowserRouter>
      </AppDataProvider>
    </UserProvider>
  );
}

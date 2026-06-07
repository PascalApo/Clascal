import { Navigate } from 'react-router-dom';

/** Dashboard-Inhalt lebt jetzt oben auf der Radar-Seite (Live Command Center). */
export function Dashboard() {
  return <Navigate to="/radar" replace />;
}

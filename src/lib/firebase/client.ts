/**
 * Firebase Client – Alternative zu Supabase.
 *
 * Setup:
 * 1. Projekt auf console.firebase.google.com erstellen (kostenlos)
 * 2. .env.local anlegen:
 *    VITE_FIREBASE_API_KEY=...
 *    VITE_FIREBASE_AUTH_DOMAIN=...
 *    VITE_FIREBASE_PROJECT_ID=...
 *    VITE_FIREBASE_DATABASE_URL=...
 * 3. npm install firebase
 * 4. initializeApp() unten aktivieren
 */

// import { initializeApp } from 'firebase/app';
// import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

// const app = initializeApp(firebaseConfig);
// export const db = getDatabase(app);

export function getFirebaseDb() {
  if (!isFirebaseConfigured) {
    console.warn('[Firebase] Nicht konfiguriert – Offline-Modus aktiv.');
    return null;
  }
  // return db;
  return null;
}

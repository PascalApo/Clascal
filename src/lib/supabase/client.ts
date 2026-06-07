import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** URLs der Management-API – gehören NICHT in VITE_SUPABASE_URL */
const FORBIDDEN_URL_FRAGMENTS = [
  'api.supabase.com',
  '/platform',
  'pg-meta',
  'supabase.com/dashboard',
] as const;

const PROJECT_API_URL_PATTERN = /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/i;

function readEnvUrl(): string {
  return (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
}

function readEnvKey(): string {
  return (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
}

function validateSupabaseEnv(): { ok: true; url: string; anonKey: string } | { ok: false; error: string } {
  const url = readEnvUrl();
  const anonKey = readEnvKey();

  if (!url || !anonKey) {
    return {
      ok: false,
      error: 'VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY fehlen (.env.local anlegen, siehe .env.example).',
    };
  }

  const forbidden = FORBIDDEN_URL_FRAGMENTS.find((fragment) => url.includes(fragment));
  if (forbidden) {
    return {
      ok: false,
      error:
        `VITE_SUPABASE_URL enthält "${forbidden}" – das ist die Supabase-Management-API, nicht dein Projekt. ` +
        'Nutze die Project URL aus Supabase → Project Settings → API (https://<ref>.supabase.co).',
    };
  }

  if (!PROJECT_API_URL_PATTERN.test(url)) {
    return {
      ok: false,
      error:
        'VITE_SUPABASE_URL muss exakt https://<projekt-ref>.supabase.co sein (Project Settings → API → Project URL).',
    };
  }

  return { ok: true, url: url.replace(/\/$/, ''), anonKey };
}

const envCheck = validateSupabaseEnv();

export const supabaseConfigError = envCheck.ok ? null : envCheck.error;

export const isSupabaseConfigured = envCheck.ok;

export const HOUSEHOLD_ID = import.meta.env.VITE_HOUSEHOLD_ID ?? 'clara-pascal';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!envCheck.ok) {
    if (import.meta.env.DEV) {
      console.warn('[Supabase]', envCheck.error);
    }
    return null;
  }

  if (!client) {
    client = createClient(envCheck.url, envCheck.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return client;
}

if (supabaseConfigError && import.meta.env.DEV) {
  console.warn('[Supabase] Client deaktiviert:', supabaseConfigError);
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Verbotene URL-Bestandteile – Management-API, REST-Pfad, keine Projekt-Basis-URL */
const FORBIDDEN_URL_FRAGMENTS = [
  'api.supabase.com',
  'platform',
  '/rest/v1/',
  'pg-meta',
  'supabase.com/dashboard',
] as const;

/** Nur https://<projekt-id>.supabase.co (ohne Pfade) */
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
    const hint = import.meta.env.PROD
      ? 'Für GitHub Pages: Repository → Settings → Secrets and variables → Actions → VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY als Secrets anlegen, dann neu deployen.'
      : 'Lokal: .env.local anlegen (siehe .env.example), dann npm run dev neu starten.';
    return {
      ok: false,
      error: `VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY fehlen. ${hint}`,
    };
  }

  const lowerUrl = url.toLowerCase();
  const forbidden = FORBIDDEN_URL_FRAGMENTS.find((fragment) => lowerUrl.includes(fragment));
  if (forbidden) {
    return {
      ok: false,
      error:
        `VITE_SUPABASE_URL enthält "${forbidden}" – ungültige URL. ` +
        'Nutze nur die Project URL: https://<projekt-id>.supabase.co (Supabase → Project Settings → API).',
    };
  }

  if (!PROJECT_API_URL_PATTERN.test(url)) {
    return {
      ok: false,
      error:
        'VITE_SUPABASE_URL muss exakt https://<projekt-id>.supabase.co sein – ohne /rest/v1/ oder andere Pfade.',
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
    throw new Error(`[Supabase] ${envCheck.error}`);
  }

  const { url, anonKey } = envCheck;

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}

if (supabaseConfigError && import.meta.env.DEV) {
  console.error('[Supabase] Client deaktiviert:', supabaseConfigError);
}

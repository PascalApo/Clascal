-- Haushalts-Radar: Vorrats-Tracker, Bürokratie-Fristen, Mentale Last
-- Im Supabase Dashboard: SQL Editor → New query → einfügen → Run

-- ═══════════════════════════════════════════
-- Vorrats-Tracker
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pantry_items (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  name TEXT NOT NULL,
  quantity TEXT,
  expires_on DATE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════
-- Bürokratie-Fristen
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bureaucracy_deadlines (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  template_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  assigned_to TEXT NOT NULL DEFAULT 'both',
  notes TEXT,
  estimated_cost NUMERIC(10, 2),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════
-- Mentale Last (Fairness-Tracking)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mental_load_events (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  weight NUMERIC(4, 2) NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════
-- Realtime
-- ═══════════════════════════════════════════
ALTER TABLE pantry_items REPLICA IDENTITY FULL;
ALTER TABLE bureaucracy_deadlines REPLICA IDENTITY FULL;
ALTER TABLE mental_load_events REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE pantry_items;
ALTER PUBLICATION supabase_realtime ADD TABLE bureaucracy_deadlines;
ALTER PUBLICATION supabase_realtime ADD TABLE mental_load_events;

-- Indizes
CREATE INDEX IF NOT EXISTS idx_pantry_household ON pantry_items(household_id);
CREATE INDEX IF NOT EXISTS idx_pantry_expires ON pantry_items(expires_on);
CREATE INDEX IF NOT EXISTS idx_bureaucracy_household ON bureaucracy_deadlines(household_id);
CREATE INDEX IF NOT EXISTS idx_bureaucracy_due ON bureaucracy_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_mental_load_household ON mental_load_events(household_id);
CREATE INDEX IF NOT EXISTS idx_mental_load_date ON mental_load_events(event_date);

-- Haushalts-App Clara & Pascal – Supabase Schema
-- Im Supabase Dashboard: SQL Editor → New query → einfügen → Run

-- Haushalts-ID (muss mit VITE_HOUSEHOLD_ID in .env.local übereinstimmen)
-- Standard: 'clara-pascal'

-- ═══════════════════════════════════════════
-- Einkaufsliste
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS shopping_items (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  quantity TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nutzungshäufigkeit für dynamische „Beliebte Artikel“
CREATE TABLE IF NOT EXISTS shopping_usage (
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, name)
);

-- Abgeschlossene Einkäufe (Archiv)
CREATE TABLE IF NOT EXISTS shopping_archive (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shopping_archive_items (
  id TEXT PRIMARY KEY,
  archive_id TEXT NOT NULL REFERENCES shopping_archive(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT,
  checked BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL
);

-- ═══════════════════════════════════════════
-- Aufgaben
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  title TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  weekday SMALLINT NOT NULL,
  task_date TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  recurring BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════
-- Kalender-Termine
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════
-- Essensplan (1 Zeile pro Wochentag)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS meal_plan (
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  weekday SMALLINT NOT NULL,
  recipe_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, weekday)
);

-- ═══════════════════════════════════════════
-- Ausgaben
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════
-- Realtime aktivieren
-- REPLICA IDENTITY FULL: liefert bei DELETE/UPDATE die vollständige alte Zeile
-- (ohne diesen Schritt enthält payload.old bei DELETE nur die Primärschlüssel-Spalte)
-- ═══════════════════════════════════════════
ALTER TABLE shopping_items REPLICA IDENTITY FULL;
ALTER TABLE shopping_usage REPLICA IDENTITY FULL;
ALTER TABLE shopping_archive REPLICA IDENTITY FULL;
ALTER TABLE shopping_archive_items REPLICA IDENTITY FULL;
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE calendar_events REPLICA IDENTITY FULL;
ALTER TABLE meal_plan REPLICA IDENTITY FULL;
ALTER TABLE expenses REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_archive;
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_archive_items;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE meal_plan;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- ═══════════════════════════════════════════
-- Row Level Security (privates Paar-Haushalt)
-- Zugriff nur mit korrekter household_id
-- ═══════════════════════════════════════════
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_archive_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "household_shopping" ON shopping_items FOR ALL
  USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');

CREATE POLICY "household_tasks" ON tasks FOR ALL
  USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');

CREATE POLICY "household_events" ON calendar_events FOR ALL
  USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');

CREATE POLICY "household_meal_plan" ON meal_plan FOR ALL
  USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');

CREATE POLICY "household_expenses" ON expenses FOR ALL
  USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');

CREATE POLICY "household_shopping_usage" ON shopping_usage FOR ALL
  USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');

CREATE POLICY "household_shopping_archive" ON shopping_archive FOR ALL
  USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');

CREATE POLICY "household_shopping_archive_items" ON shopping_archive_items FOR ALL
  USING (
    archive_id IN (SELECT id FROM shopping_archive WHERE household_id = 'clara-pascal')
  ) WITH CHECK (
    archive_id IN (SELECT id FROM shopping_archive WHERE household_id = 'clara-pascal')
  );

-- ═══════════════════════════════════════════
-- Atomare RPCs: supabase/rpc_shopping.sql separat ausführen
-- (archive_shopping_list, increment_shopping_usage)
-- ═══════════════════════════════════════════

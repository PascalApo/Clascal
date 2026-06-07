-- Migration: Mengen-Upsert, dynamische Favoriten & Einkaufs-Archiv
-- Im Supabase SQL Editor ausführen, wenn die Tabellen noch fehlen.

CREATE TABLE IF NOT EXISTS shopping_usage (
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, name)
);

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

ALTER TABLE shopping_usage REPLICA IDENTITY FULL;
ALTER TABLE shopping_archive REPLICA IDENTITY FULL;
ALTER TABLE shopping_archive_items REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE shopping_usage;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE shopping_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_archive_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "household_shopping_usage" ON shopping_usage FOR ALL
    USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "household_shopping_archive" ON shopping_archive FOR ALL
    USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "household_shopping_archive_items" ON shopping_archive_items FOR ALL
    USING (
      archive_id IN (SELECT id FROM shopping_archive WHERE household_id = 'clara-pascal')
    ) WITH CHECK (
      archive_id IN (SELECT id FROM shopping_archive WHERE household_id = 'clara-pascal')
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE shopping_archive;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE shopping_archive_items;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Anschließend: supabase/rpc_shopping.sql ausführen

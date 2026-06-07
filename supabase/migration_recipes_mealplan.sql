-- Migration: Rezepte-Tabelle + Essensplan Frühstück/Abendessen
-- Im Supabase SQL Editor ausführen (einmalig)

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Abendessen',
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 2,
  difficulty TEXT DEFAULT 'einfach',
  meat_type TEXT DEFAULT 'keins',
  cuisine_category TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions JSONB NOT NULL DEFAULT '[]',
  nutrition JSONB,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Falls die Tabelle schon existierte, fehlende Spalten nachziehen
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Abendessen';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_healthy BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine_category TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredients JSONB NOT NULL DEFAULT '[]';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions JSONB NOT NULL DEFAULT '[]';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS nutrition JSONB;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

ALTER TABLE meal_plan ADD COLUMN IF NOT EXISTS breakfast_recipe_id TEXT;
ALTER TABLE meal_plan ADD COLUMN IF NOT EXISTS dinner_recipe_id TEXT;

-- Bestehende recipe_id als Abendessen übernehmen
UPDATE meal_plan
SET dinner_recipe_id = recipe_id
WHERE dinner_recipe_id IS NULL AND recipe_id IS NOT NULL;

ALTER TABLE recipes REPLICA IDENTITY FULL;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- PostgreSQL unterstützt kein "CREATE POLICY IF NOT EXISTS" → DO-Block
DO $$
BEGIN
  CREATE POLICY "household_recipes" ON recipes FOR ALL
    USING (household_id = 'clara-pascal') WITH CHECK (household_id = 'clara-pascal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

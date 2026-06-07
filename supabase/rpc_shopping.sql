-- Atomare Einkaufs-RPCs (Supabase SQL Editor → Run)
-- Erfordert: shopping_items, shopping_usage, shopping_archive, shopping_archive_items
-- Realtime (für andere Clients): beide Archiv-Tabellen in Publication aufnehmen:
--   ALTER PUBLICATION supabase_realtime ADD TABLE shopping_archive;
--   ALTER PUBLICATION supabase_realtime ADD TABLE shopping_archive_items;

-- Hilfs-ID im App-Format: {timestamp}-{random7}
CREATE OR REPLACE FUNCTION app_generate_id()
RETURNS TEXT
LANGUAGE sql
VOLATILE
AS $$
  SELECT floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint::text
    || '-'
    || substr(md5(random()::text), 1, 7);
$$;

-- a) Aktive Items archivieren + b) Hauptliste leeren — ein Transaktionsschritt
CREATE OR REPLACE FUNCTION archive_shopping_list(
  p_household_id TEXT,
  p_created_by TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_archive_id TEXT;
  v_item_count INTEGER;
  v_now TIMESTAMPTZ := now();
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_item_count
  FROM shopping_items
  WHERE household_id = p_household_id;

  IF v_item_count = 0 THEN
    RETURN jsonb_build_object(
      'archive_id', NULL,
      'archived_at', v_now,
      'item_count', 0
    );
  END IF;

  v_archive_id := app_generate_id();

  INSERT INTO shopping_archive (id, household_id, archived_at, created_by, item_count)
  VALUES (v_archive_id, p_household_id, v_now, p_created_by, v_item_count);

  INSERT INTO shopping_archive_items (id, archive_id, name, category, quantity, checked, created_by)
  SELECT
    app_generate_id(),
    v_archive_id,
    name,
    category,
    quantity,
    checked,
    created_by
  FROM shopping_items
  WHERE household_id = p_household_id;

  DELETE FROM shopping_items
  WHERE household_id = p_household_id;

  RETURN jsonb_build_object(
    'archive_id', v_archive_id,
    'archived_at', v_now,
    'item_count', v_item_count
  );
END;
$$;

-- usage_count atomar erhöhen (Upsert)
CREATE OR REPLACE FUNCTION increment_shopping_usage(
  p_household_id TEXT,
  p_name TEXT,
  p_category TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_name TEXT;
  v_row shopping_usage%ROWTYPE;
BEGIN
  SELECT name INTO v_existing_name
  FROM shopping_usage
  WHERE household_id = p_household_id
    AND lower(name) = lower(p_name)
  LIMIT 1;

  IF v_existing_name IS NOT NULL THEN
    UPDATE shopping_usage
    SET
      usage_count = usage_count + 1,
      category = p_category,
      updated_at = now()
    WHERE household_id = p_household_id
      AND name = v_existing_name
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO shopping_usage (household_id, name, category, usage_count, updated_at)
    VALUES (p_household_id, p_name, p_category, 1, now())
    RETURNING * INTO v_row;
  END IF;

  RETURN jsonb_build_object(
    'name', v_row.name,
    'category', v_row.category,
    'usage_count', v_row.usage_count,
    'updated_at', v_row.updated_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION archive_shopping_list(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_shopping_usage(TEXT, TEXT, TEXT) TO anon, authenticated;

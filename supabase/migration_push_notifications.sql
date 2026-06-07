-- Push-Benachrichtigungen für Partner (Web Push / iOS PWA)
-- Nach dem Ausführen: Edge Function send-partner-notification deployen (siehe supabase/functions/)

CREATE TABLE IF NOT EXISTS push_subscriptions (
  household_id TEXT NOT NULL DEFAULT 'clara-pascal',
  user_id TEXT NOT NULL CHECK (user_id IN ('user1', 'user2')),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, user_id)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "household_push_subscriptions" ON push_subscriptions FOR ALL
    USING (household_id = 'clara-pascal')
    WITH CHECK (household_id = 'clara-pascal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

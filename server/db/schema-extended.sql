-- =============================================
-- OWIVARA - EXTENDED SCHEMA
-- Dual AI Provider Support + Usage Tracking
-- Add these AFTER the base schema.sql
-- =============================================

-- ─── AI Provider Configuration Table ───────

CREATE TABLE IF NOT EXISTS ai_provider_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'gemini'
    CHECK (provider IN ('gemini', 'openai')),
  encrypted_key_ref TEXT,
  model_name TEXT DEFAULT 'gemini-2.0-flash',
  max_tokens INTEGER DEFAULT 1024,
  temperature NUMERIC DEFAULT 0.7,
  last_validated_at TIMESTAMPTZ,
  key_valid BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_read_own_ai_config ON ai_provider_configs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY users_insert_own_ai_config ON ai_provider_configs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY users_update_own_ai_config ON ai_provider_configs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_ai_config_user_id ON ai_provider_configs(user_id);

CREATE TRIGGER ai_config_updated_at
  BEFORE UPDATE ON ai_provider_configs
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- ─── AI Usage Tracking Table ───────────────

CREATE TABLE IF NOT EXISTS ai_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('gemini', 'openai')),
  model_name TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_read_own_ai_usage ON ai_usage_records
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX idx_ai_usage_user_id ON ai_usage_records(user_id);
CREATE INDEX idx_ai_usage_instance_id ON ai_usage_records(instance_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage_records(created_at);

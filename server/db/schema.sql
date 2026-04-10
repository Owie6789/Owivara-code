-- =============================================
-- PROFILES TABLE: RLS Policies + Trigger
-- =============================================

CREATE POLICY users_read_own_profile ON profiles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY users_insert_own_profile ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY users_update_own_profile ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY users_delete_own_profile ON profiles
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX idx_profiles_user_id ON profiles(user_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- =============================================
-- WHATSAPP INSTANCES TABLE
-- =============================================

CREATE TABLE whatsapp_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT DEFAULT 'My Bot',
  phone_number TEXT,
  status TEXT DEFAULT 'disconnected'
    CHECK (status IN ('disconnected', 'connecting', 'qr_pending', 'connected', 'logged_out')),
  sudo_numbers TEXT[] DEFAULT '{}',
  notify_on_restart BOOLEAN DEFAULT true,
  notify_on_update BOOLEAN DEFAULT true,
  bot_prefix TEXT DEFAULT '.',
  bot_mode TEXT DEFAULT 'private'
    CHECK (bot_mode IN ('public', 'private')),
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_read_own_instances ON whatsapp_instances
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY users_insert_own_instances ON whatsapp_instances
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY users_update_own_instances ON whatsapp_instances
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY users_delete_own_instances ON whatsapp_instances
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX idx_instances_user_id ON whatsapp_instances(user_id);
CREATE INDEX idx_instances_status ON whatsapp_instances(status);

CREATE TRIGGER instances_updated_at
  BEFORE UPDATE ON whatsapp_instances
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- =============================================
-- WHATSAPP SESSIONS TABLE (Sensitive)
-- =============================================

CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID UNIQUE REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creds JSONB,
  keys JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_read_own_sessions ON whatsapp_sessions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY users_insert_own_sessions ON whatsapp_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY users_update_own_sessions ON whatsapp_sessions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_sessions_instance_id ON whatsapp_sessions(instance_id);
CREATE INDEX idx_sessions_user_id ON whatsapp_sessions(user_id);

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- =============================================
-- PLUGINS REGISTRY TABLE
-- =============================================

CREATE TABLE plugins_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general'
    CHECK (category IN ('general', 'moderation', 'media', 'automation', 'ai', 'utility')),
  icon_name TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  default_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plugins_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY authenticated_read_plugins ON plugins_registry
  FOR SELECT TO authenticated
  USING (true);

-- =============================================
-- USER PLUGINS TABLE
-- =============================================

CREATE TABLE user_plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  plugin_id UUID REFERENCES plugins_registry(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instance_id, plugin_id)
);

ALTER TABLE user_plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_read_own_plugins ON user_plugins
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY users_insert_own_plugins ON user_plugins
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY users_update_own_plugins ON user_plugins
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY users_delete_own_plugins ON user_plugins
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX idx_user_plugins_user_id ON user_plugins(user_id);
CREATE INDEX idx_user_plugins_instance_id ON user_plugins(instance_id);

CREATE TRIGGER user_plugins_updated_at
  BEFORE UPDATE ON user_plugins
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- =============================================
-- BOT LOGS TABLE
-- =============================================

CREATE TABLE bot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  level TEXT DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  source TEXT,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bot_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_read_own_logs ON bot_logs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX idx_logs_user_id ON bot_logs(user_id);
CREATE INDEX idx_logs_instance_id ON bot_logs(instance_id);
CREATE INDEX idx_logs_created_at ON bot_logs(created_at);

-- =============================================
-- MESSAGE STATS TABLE
-- =============================================

CREATE TABLE message_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  commands_executed INTEGER DEFAULT 0,
  media_processed INTEGER DEFAULT 0,
  groups_active INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instance_id, date)
);

ALTER TABLE message_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_read_own_stats ON message_stats
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX idx_stats_user_id ON message_stats(user_id);
CREATE INDEX idx_stats_instance_date ON message_stats(instance_id, date);

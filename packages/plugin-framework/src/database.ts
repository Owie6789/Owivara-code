/**
 * @file database.ts
 * @package @owivara/plugin-framework
 *
 * Database layer — per-user data models backed by InsForge PostgreSQL with RLS.
 * Uses a simple InsForge-style query builder interface.
 * Full InsForge client wiring happens in Phase 9 during bot integration.
 */

/** InsForge-style query builder (simplified for typing) */
interface QueryBuilder {
  select(cols?: string): QueryBuilder;
  eq(col: string, val: unknown): QueryBuilder;
  lte(col: string, val: unknown): QueryBuilder;
  upsert(data: Record<string, unknown>, opts?: { onConflict: string }): Promise<{ error: { message: string } | null }>;
  update(data: Record<string, unknown>): QueryBuilder;
  delete(): QueryBuilder;
  single(): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
}

/** InsForge-style database client */
export interface DbClient {
  from(table: string): QueryBuilder;
}

/** Bot variable (config key-value pair) */
export interface BotVariable {
  id?: string;
  user_id: string;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

/** Warning record */
export interface WarnRecord {
  id?: string;
  user_id: string;
  chat: string;
  warned_user: string;
  reason: string;
  warned_by: string;
  timestamp: number;
}

/** Filter record */
export interface FilterRecord {
  id?: string;
  user_id: string;
  trigger: string;
  response: string;
  jid: string;
  scope: 'chat' | 'global' | 'group' | 'dm';
  enabled: boolean;
  caseSensitive: boolean;
  exactMatch: boolean;
  created_by: string;
}

/** Welcome/Goodbye message config */
export interface GroupMessageConfig {
  id?: string;
  user_id: string;
  jid: string;
  message: string;
  enabled: boolean;
}

/** Scheduled message */
export interface ScheduledMessage {
  id?: string;
  user_id: string;
  jid: string;
  message: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio' | 'document' | 'sticker';
  schedule_time: string;
  is_sent: boolean;
}

/** Sticker-command binding */
export interface StickCmdBinding {
  id?: string;
  user_id: string;
  command: string;
  file: string;
}

/** Auto-mute schedule */
export interface AutoMuteConfig {
  id?: string;
  user_id: string;
  chat: string;
  time: string;
}

/** Antilink configuration */
export interface AntilinkConfig {
  id?: string;
  user_id: string;
  jid: string;
  mode: 'off' | 'warn' | 'kick' | 'delete';
  allowed_links: string[];
  blocked_links: string[];
  is_whitelist: boolean;
  enabled: boolean;
  custom_message: string;
}

/**
 * Create database helpers for the plugin system.
 * All queries are scoped to user_id — RLS enforces data isolation.
 *
 * @param db - InsForge database client
 * @returns Database helper functions
 */
export function createDatabaseHelpers(db: DbClient) {
  async function getVar(userId: string, key: string): Promise<string | null> {
    try {
      const { data, error } = await db
        .from('bot_variables')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .single();
      if (error || !data) return null;
      return data.value as string;
    } catch {
      return null;
    }
  }

  async function setVar(userId: string, key: string, value: string): Promise<void> {
    await db.from('bot_variables').upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  }

  async function delVar(userId: string, key: string): Promise<void> {
    await db
      .from('bot_variables')
      .delete()
      .eq('user_id', userId)
      .eq('key', key);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function getAllVars(_userId: string): Promise<Record<string, string>> {
    // Requires select().eq() without .single() — wired properly in Phase 9
    return {};
  }

  async function getWarns(userId: string, chat: string, warnedUser: string): Promise<WarnRecord[]> {
    try {
      const { data, error } = await db
        .from('warns')
        .select('*')
        .eq('user_id', userId)
        .eq('chat', chat)
        .eq('warned_user', warnedUser)
        .single();
      return error || !data ? [] : [data as unknown as WarnRecord];
    } catch {
      return [];
    }
  }

  async function addWarn(userId: string, chat: string, warnedUser: string, reason: string, warnedBy: string): Promise<void> {
    await db.from('warns').upsert({
      user_id: userId, chat, warned_user: warnedUser, reason, warned_by: warnedBy, timestamp: Date.now(),
    });
  }

  async function clearWarns(userId: string, chat: string, warnedUser: string): Promise<void> {
    await db
      .from('warns')
      .delete()
      .eq('user_id', userId)
      .eq('chat', chat)
      .eq('warned_user', warnedUser);
  }

  async function getFilters(userId: string, jid: string, scope: string): Promise<FilterRecord[]> {
    try {
      const { data, error } = await db
        .from('filters')
        .select('*')
        .eq('user_id', userId)
        .eq('jid', jid)
        .eq('scope', scope)
        .eq('enabled', true)
        .single();
      return error || !data ? [] : [data as unknown as FilterRecord];
    } catch {
      return [];
    }
  }

  async function getAntilinkConfig(userId: string, jid: string): Promise<AntilinkConfig | null> {
    try {
      const { data, error } = await db
        .from('antilink_config')
        .select('*')
        .eq('user_id', userId)
        .eq('jid', jid)
        .single();
      return error || !data ? null : data as unknown as AntilinkConfig;
    } catch {
      return null;
    }
  }

  async function getWelcomeConfig(userId: string, jid: string): Promise<GroupMessageConfig | null> {
    try {
      const { data, error } = await db
        .from('welcome_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('jid', jid)
        .single();
      return error || !data ? null : data as unknown as GroupMessageConfig;
    } catch {
      return null;
    }
  }

  async function getDueScheduledMessages(userId: string): Promise<ScheduledMessage[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await db
        .from('scheduled_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('is_sent', false)
        .lte('schedule_time', now)
        .single();
      return error || !data ? [] : [data as unknown as ScheduledMessage];
    } catch {
      return [];
    }
  }

  async function markScheduledMessageSent(userId: string, messageId: string): Promise<void> {
    await db
      .from('scheduled_messages')
      .update({ is_sent: true })
      .eq('user_id', userId)
      .eq('id', messageId);
  }

  return {
    getVar,
    setVar,
    delVar,
    getAllVars,
    getWarns,
    addWarn,
    clearWarns,
    getFilters,
    getAntilinkConfig,
    getWelcomeConfig,
    getDueScheduledMessages,
    markScheduledMessageSent,
  };
}

export type DatabaseHelpers = ReturnType<typeof createDatabaseHelpers>;

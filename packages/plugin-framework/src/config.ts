/**
 * @file config.ts
 * @package @owivara/plugin-framework
 *
 * Per-user configuration system.
 * Replaces Raganork's Proxy-based dynamic config with an InsForge-backed
 * per-user config store that loads defaults and supports runtime overrides.
 */

import type { DatabaseHelpers } from './database.js';

/** Default configuration values */
export const DEFAULT_CONFIG: Readonly<Record<string, string>> = Object.freeze({
  // Bot identity
  BOT_NAME: 'Owivara Bot',
  BOT_OWNER: 'Owner',
  BOT_IMAGE: '',

  // Command system
  HANDLERS: '.,!',
  MULTI_HANDLERS: 'false',
  MODE: 'private', // 'private' or 'public'

  // Features
  ALIVE: '_I am alive!_',
  WARN_LIMIT: '4',
  LANGUAGE: 'english',

  // Security
  ALLOWED_COUNTRY_CODES: '234,233,254,255,256,257,250,251,252,253',
  NOT_ALLOWED_COUNTRY_CODES: '',

  // Anti-features (per-group toggles stored separately in DB)
  ANTISPAM_THRESHOLD: '6/10',

  // AI / Chatbot
  CHATBOT: 'off',
  CHATBOT_ALL_GROUPS: 'false',
  CHATBOT_ALL_DMS: 'false',
  GEMINI_API_KEY: '',

  // Auto-download
  AUTODL: '',
  AUTODL_ALL_GROUPS: 'false',
  AUTODL_ALL_DMS: 'false',

  // Auto-read
  AUTO_READ_STATUS: 'false',
  READ_MESSAGES: 'false',
  READ_COMMAND: 'true',

  // Behavior
  ALWAYS_ONLINE: 'false',
  REJECT_CALLS: 'false',
  ANTI_DELETE: 'off',

  // API Keys (user-provided, stored encrypted in InsForge)
  IMGBB_KEY: '',
  ACR_CLOUD_KEY: '',
  ACR_CLOUD_SECRET: '',
  RENDER_API_KEY: '',
  RENDER_SERVICE_ID: '',

  // Mention reply
  MENTION_REPLY: '',

  // AFK
  AFK_DATA: '{}',
});

/**
 * Per-user configuration manager.
 * Loads defaults, overrides with user-specific values from InsForge DB.
 */
export class UserConfig {
  private userId: string;
  private db: DatabaseHelpers;
  private cache: Map<string, string> = new Map();
  private loaded = false;

  constructor(userId: string, db: DatabaseHelpers) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Load configuration from the database.
   * Call this once during bot initialization for a user.
   */
  async load(): Promise<void> {
    if (this.loaded) return;

    // Start with defaults
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      this.cache.set(key, value);
    }

    // Override with user-specific values
    const userVars = await this.db.getAllVars(this.userId);
    for (const [key, value] of Object.entries(userVars)) {
      this.cache.set(key, value);
    }

    this.loaded = true;
  }

  /**
   * Get a configuration value.
   * Returns the user-specific value if set, otherwise the default.
   */
  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  /**
   * Get a configuration value as a boolean.
   */
  getBool(key: string): boolean {
    const val = this.cache.get(key)?.toLowerCase();
    return val === 'true' || val === '1' || val === 'yes';
  }

  /**
   * Get a configuration value as a number.
   */
  getNumber(key: string): number {
    const val = this.cache.get(key);
    const num = val ? parseInt(val, 10) : NaN;
    return isNaN(num) ? 0 : num;
  }

  /**
   * Get a configuration value as a JSON-parsed object.
   */
  getJSON<T>(key: string): T | null {
    const val = this.cache.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  /**
   * Set a configuration value (persists to InsForge DB).
   */
  async set(key: string, value: string): Promise<void> {
    this.cache.set(key, value);
    await this.db.setVar(this.userId, key, value);
  }

  /**
   * Delete a configuration value (reverts to default).
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    await this.db.delVar(this.userId, key);
  }

  /**
   * Get all configuration values as a plain object.
   */
  getAll(): Record<string, string> {
    return Object.fromEntries(this.cache);
  }

  /**
   * Check if a command is disabled.
   */
  isCommandDisabled(command: string): boolean {
    const disabled = this.get('DISABLED_COMMANDS') || '';
    return disabled.split(',').map((c) => c.trim()).includes(command);
  }

  /**
   * Check if a user is sudo.
   */
  isSudo(userJid: string): boolean {
    const sudoMap = this.getJSON<string[]>('SUDO_MAP') || [];
    return sudoMap.includes(userJid);
  }

  /**
   * Get command handler prefixes.
   */
  getHandlerPrefixes(): string[] {
    const handlers = this.get('HANDLERS') || '.';
    return handlers.split('').filter(Boolean);
  }
}

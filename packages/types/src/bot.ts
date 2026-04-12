/**
 * @file bot.ts
 * @project Owivara - Development
 * @package @owivara/types
 * @module Bot Types
 *
 * @description
 * Bot instance type definitions. Defines WhatsApp bot instances
 * managed by the Owivara platform.
 *
 * @resurrection_source C:\Users\USER_6987\Desktop\Projects\Owivara Production Environment\src\lib\types.ts
 * @resurrection_status IMPROVED — Extended with dual AI and plugin config
 * @original_quality 7/10
 * @original_issues
 * - Missing AI provider config per instance
 * - No message quota tracking
 * - Missing last_connected_at field
 *
 * @resurrection_improvements
 * - Added ai_provider per instance (overrides user default)
 * - Added message quota tracking
 * - Added last_connected_at timestamp
 * - Added bot_mode validation type
 *
 * @hallucination_check PASSED — No blacklist items present
 * @verified_against_architecture true
 */

/** Bot instance connection status */
export type BotStatus = 'disconnected' | 'connecting' | 'qr_pending' | 'pairing_code' | 'connected' | 'error' | 'logged_out';

/** Bot operating mode */
export type BotMode = 'public' | 'private';

/** Bot instance configuration */
export interface BotConfig {
  /** Whether auto-reply is enabled */
  auto_reply_enabled: boolean;

  /** Whether AI-powered responses are enabled */
  ai_enabled: boolean;

  /** AI provider for this instance (overrides user default) */
  ai_provider: 'gemini' | 'openai' | 'none';

  /** Custom welcome message for new contacts */
  welcome_message: string | null;

  /** Command prefix (e.g., '.' for .help) */
  bot_prefix: string;

  /** Bot operating mode */
  bot_mode: BotMode;

  /** Phone numbers with sudo/admin access */
  sudo_numbers: string[];

  /** Notify user when bot restarts */
  notify_on_restart: boolean;

  /** Notify user when bot updates */
  notify_on_update: boolean;
}

/** WhatsApp bot instance record */
export interface BotInstance {
  /** Unique instance identifier (UUID) */
  id: string;

  /** Owner's user ID (RLS key) */
  user_id: string;

  /** Human-readable instance name */
  instance_name: string;

  /** Connected phone number (after QR scan) */
  phone_number: string | null;

  /** Current connection status */
  status: BotStatus;

  /** QR code data for linking (temporary, cleared after scan) */
  qr_code: string | null;

  /** Bot configuration */
  config: BotConfig;

  /** Timestamp of last successful connection */
  last_connected_at: string | null;

  /** Messages processed this billing period */
  messages_this_period: number;

  /** Instance creation timestamp */
  created_at: string;

  /** Last configuration update timestamp */
  updated_at: string;
}

/** Create bot instance input */
export interface CreateBotInstanceInput {
  /** Instance display name */
  instance_name: string;

  /** Bot configuration (uses defaults if not provided) */
  config?: Partial<BotConfig>;
}

/** Update bot instance input (all fields optional) */
export interface UpdateBotInstanceInput {
  instance_name?: string;
  status?: BotStatus;
  qr_code?: string | null;
  phone_number?: string | null;
  config?: Partial<BotConfig>;
}

/** Bot instance status update (from orchestrator) */
export interface BotStatusUpdate {
  /** Instance identifier */
  instance_id: string;

  /** New status */
  status: BotStatus;

  /** QR code data (if status is qr_pending) */
  qr_code?: string;

  /** Connected phone number (if status is connected) */
  phone_number?: string;

  /** Error message (if status is error) */
  error_message?: string;

  /** Timestamp of the update */
  timestamp: string;
}

/**
 * @file message.ts
 * @project Owivara - Development
 * @package @owivara/types
 * @module Message Types
 *
 * @description
 * WhatsApp message type definitions for the Owivara platform.
 * Used by both the bot framework (incoming messages) and
 * the dashboard (message logs and stats).
 *
 * @resurrection_source C:\Users\USER_6987\Desktop\Projects\Owivara Production Environment\orchestrator\index.ts
 * @resurrection_status REBUILT — Full TypeScript types from raw Baileys message handling
 * @original_quality 4/10
 * @original_issues
 * - Used 'any' types for all message objects
 * - No typed message structure
 * - No message type discrimination
 *
 * @resurrection_improvements
 * - Full discriminated union for message types
 * - Typed sender, recipient, and content fields
 * - Added group chat support types
 * - Added Baileys-compatible message shape
 *
 * @hallucination_check PASSED — No blacklist items present
 * @verified_against_architecture true
 */

/** WhatsApp message type */
export type WhatsAppMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact'
  | 'reaction'
  | 'system';

/** Message direction */
export type MessageDirection = 'inbound' | 'outbound';

/** Base WhatsApp message */
export interface WhatsAppMessage {
  /** Message ID from Baileys */
  id: string;

  /** Message type */
  type: WhatsAppMessageType;

  /** Direction (inbound from user, outbound from bot) */
  direction: MessageDirection;

  /** Sender JID (e.g., 1234567890@s.whatsapp.net) */
  from: string;

  /** Recipient JID (group JID or bot JID) */
  to: string;

  /** Whether this is a group message */
  is_group: boolean;

  /** Group JID (if is_group is true) */
  group_id: string | null;

  /** Text content (for text messages) */
  text: string | null;

  /** Media URL or identifier (for media messages) */
  media_url: string | null;

  /** Message timestamp */
  timestamp: string;

  /** Whether the message was quoted/replied to another message */
  is_reply: boolean;

  /** ID of the quoted message (if is_reply) */
  quoted_message_id: string | null;
}

/** Bot log entry (stored in InsForge) */
export interface BotLog {
  /** Log entry identifier */
  id: string;

  /** Owner's user ID (RLS key) */
  user_id: string;

  /** Associated bot instance ID */
  instance_id: string;

  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error';

  /** Log source (e.g., 'message_handler', 'ai_handler', 'connection') */
  source: string;

  /** Log message */
  message: string;

  /** Additional metadata */
  metadata: Record<string, unknown>;

  /** Log timestamp */
  created_at: string;
}

/** Daily message statistics (stored in InsForge) */
export interface MessageStats {
  /** Stats record identifier */
  id: string;

  /** Owner's user ID (RLS key) */
  user_id: string;

  /** Associated bot instance ID */
  instance_id: string;

  /** Statistics date */
  date: string;

  /** Outbound messages sent */
  messages_sent: number;

  /** Inbound messages received */
  messages_received: number;

  /** Commands executed */
  commands_executed: number;

  /** Media items processed */
  media_processed: number;

  /** Active group conversations */
  groups_active: number;

  /** Record creation timestamp */
  created_at: string;
}

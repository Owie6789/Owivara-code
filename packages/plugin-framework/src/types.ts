/**
 * @file types.ts
 * @package @owivara/plugin-framework
 *
 * Core type definitions for the plugin system.
 * Ported from Raganork-MD's Module() registration pattern with TypeScript improvements.
 */

import type { WASocket, BaileysEventMap } from 'baileys';
import type { Logger } from 'pino';

/** Plugin command definition */
export interface Command {
  /** Command pattern (without prefix) — e.g., "kick", "sticker" */
  pattern: string;

  /** Command description for help/menu output */
  desc?: string;

  /** Command category for menu grouping */
  use?: string;

  /** Whether command is restricted to sudo/owner only */
  fromMe?: boolean;

  /** Whether to hide from command list */
  excludeFromMenu?: boolean;

  /** Aliases for the command */
  alias?: string[];
}

/** Message context passed to plugin handlers */
export interface MessageContext {
  /** The Baileys WhatsApp socket */
  client: WASocket;

  /** The raw Baileys message object */
  raw: BaileysEventMap['messages.upsert'];

  /** Sender JID (e.g., "1234567890@s.whatsapp.net") */
  sender: string;

  /** Group JID or undefined for DMs */
  chat: string | undefined;

  /** Whether this is a group chat */
  isGroup: boolean;

  /** Whether sender is a sudo/admin user */
  isSudo: boolean;

  /** Whether sender is the bot itself */
  isFromMe: boolean;

  /** The text content of the message (if any) */
  text?: string;

  /** Matched command arguments (everything after the command name) */
  match?: string;

  /** The quoted/replied-to message (if any) */
  replyMessage?: MessageContext;

  /** Logger instance */
  logger: Logger;

  /** Whether the command prefix was required and matched */
  hasHandler: boolean;
}

/** Plugin handler function signature */
export type CommandHandler = (
  message: MessageContext,
  match: string
) => Promise<void> | void;

/** Event handler types supported by the plugin system */
export type PluginEvent =
  | 'message'         // Every message
  | 'text'            // Text messages only
  | 'image'           // Image messages
  | 'video'           // Video messages
  | 'audio'           // Audio/voice messages
  | 'document'        // Document messages
  | 'sticker'         // Sticker messages
  | 'group-update'    // Group metadata changes
  | 'start';          // Bot startup

/** Plugin module registration info */
export interface PluginModule {
  /** Command config (for pattern-based commands) */
  command?: Command;

  /** Event name (for event-based handlers) */
  event?: PluginEvent;

  /** Whether the command requires handler prefix */
  handler?: boolean;

  /** The handler function */
  handlerFn: CommandHandler;
}

/** Compiled command with resolved pattern regex */
export interface RegisteredCommand {
  info: Command;
  event?: PluginEvent;
  handler: boolean;
  fn: CommandHandler;
  /** Compiled regex for pattern matching */
  pattern?: RegExp;
}

/** Command registry — the central store of all registered commands */
export interface CommandRegistry {
  commands: RegisteredCommand[];

  /** Register a new plugin module */
  register: (info: Partial<Command> & { pattern?: string; fromMe?: boolean; on?: PluginEvent; handler?: boolean; excludeFromMenu?: boolean; use?: string; desc?: string; alias?: string; }, fn: CommandHandler) => void;

  /** Find matching command for a message */
  findMatch: (text: string, prefixes: string[]) => RegisteredCommand | null;

  /** Get all event handlers for a given event type */
  getEventHandlers: (event: PluginEvent) => RegisteredCommand[];

  /** Get all commands (for help/menu) */
  getAll: () => RegisteredCommand[];

  /** Get commands by category */
  getByCategory: (category: string) => RegisteredCommand[];
}

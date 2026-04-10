/**
 * @file types.ts
 * @project Owivara - Development
 * @package @owivara/baileys-core
 * @module Baileys Types
 *
 * @description
 * Baileys-specific type definitions and wrappers.
 * Provides typed interfaces for WhatsApp message handling.
 *
 * @hallucination_check PASSED
 */

import type {
  WASocket,
  BaileysEventMap,
  WAMessage,
  WAMessageKey,
  Contact,
  GroupMetadata,
} from 'baileys';

// Re-export Baileys types for convenience
export type {
  WASocket,
  BaileysEventMap,
  WAMessage,
  WAMessageKey,
  Contact,
  GroupMetadata,
};

/** Extracted message text content */
export interface ExtractedMessage {
  /** Message ID */
  id: string;

  /** Sender JID */
  from: string;

  /** Chat JID (group or individual) */
  chat: string;

  /** Whether this is a group message */
  isGroup: boolean;

  /** Text content (if any) */
  text: string | null;

  /** Message type */
  messageType: string;

  /** Whether the message has media */
  hasMedia: boolean;

  /** Quoted message (if replying) */
  quotedMessage: WAMessage | null;

  /** Sender's pushname (display name) */
  pushName: string | null;

  /** Timestamp */
  timestamp: number;
}

/** Command parsed from message text */
export interface ParsedCommand {
  /** Command prefix (e.g., '.') */
  prefix: string;

  /** Command name (e.g., 'help') */
  name: string;

  /** Arguments after command name */
  args: string[];

  /** Full original text */
  raw: string;

  /** Whether this is a valid command */
  isValid: boolean;
}

/** Bot handler result */
export interface HandlerResult {
  /** Whether the handler processed the message */
  handled: boolean;

  /** Optional reply text */
  reply?: string;

  /** Optional error message */
  error?: string;
}

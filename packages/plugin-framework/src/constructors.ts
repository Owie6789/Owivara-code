/**
 * @file constructors.ts
 * @package @owivara/plugin-framework
 *
 * Message constructors — wrap raw Baileys messages with convenience methods.
 * Ported from Raganork's core/constructors/ with TypeScript type safety.
 *
 * Provides:
 * - ParsedMessage: Full message wrapper with send/reply/edit/react/forward/delete
 * - ReplyMessage: Quoted message parser with media detection and download helpers
 */

import type {
  WASocket,
  WAMessage,
  AnyMessageContent,
  BaileysEventMap,
  WAMessageContent,
} from 'baileys';
import type { Logger } from 'pino';

/** Extract text content from a Baileys message */
function extractText(msg: WAMessage): string | undefined {
  const content = msg.message as Record<string, unknown> | undefined;
  if (!content) return undefined;

  if (typeof content.conversation === 'string') return content.conversation;
  if (content.extendedTextMessage) {
    return (content.extendedTextMessage as Record<string, string>)?.text;
  }
  if (content.protocolMessage) {
    const protocolMsg = content.protocolMessage as Record<string, unknown>;
    if (protocolMsg.editedMessage) {
      const edited = protocolMsg.editedMessage as Record<string, unknown>;
      return (edited.conversation || (edited.extendedTextMessage as Record<string, string>)?.text) as string | undefined;
    }
  }
  return undefined;
}

/**
 * Parsed message — wraps a raw Baileys message with convenience methods.
 * This is the `message` object passed to all plugin handlers.
 */
export class ParsedMessage {
  /** The Baileys socket */
  public readonly client: WASocket;

  /** The raw Baileys message */
  public readonly raw: WAMessage;

  /** Sender JID */
  public readonly sender: string;

  /** Chat/group JID */
  public readonly chat: string;

  /** Whether this is a group message */
  public readonly isGroup: boolean;

  /** Whether the sender is a sudo user */
  public readonly isSudo: boolean;

  /** Whether the message is from the bot itself */
  public readonly isFromMe: boolean;

  /** Extracted text content */
  public readonly text?: string;

  /** Matched command arguments */
  public match?: string;

  /** The quoted/replied message (if any) */
  public readonly quoted?: ReplyMessage;

  /** Message ID string */
  public readonly id: string;

  /** Whether the message has a handler prefix */
  public readonly hasHandler: boolean;

  /** Logger */
  public readonly logger: Logger;

  constructor(opts: {
    client: WASocket;
    raw: WAMessage;
    sender: string;
    chat: string;
    isGroup: boolean;
    isSudo: boolean;
    isFromMe: boolean;
    text?: string;
    reply?: ReplyMessage;
    hasHandler: boolean;
    logger: Logger;
  }) {
    this.client = opts.client;
    this.raw = opts.raw;
    this.sender = opts.sender;
    this.chat = opts.chat;
    this.isGroup = opts.isGroup;
    this.isSudo = opts.isSudo;
    this.isFromMe = opts.isFromMe;
    this.text = opts.text;
    this.quoted = opts.reply;
    this.hasHandler = opts.hasHandler;
    this.logger = opts.logger;
    this.id = opts.raw.key.id || '';
    this.match = undefined;
  }

  // ─── Send Methods ───────────────────────────────────────────

  /**
   * Send a message to the current chat.
   */
  async send(content: string | AnyMessageContent): Promise<WAMessage | undefined> {
    try {
      if (typeof content === 'string') {
        return await this.client.sendMessage(this.chat, { text: content });
      }
      return await this.client.sendMessage(this.chat, content);
    } catch (err) {
      this.logger.error({ err }, 'Failed to send message');
      return undefined;
    }
  }

  /**
   * Reply to the sender (quotes their message).
   */
  async sendReply(content: string | AnyMessageContent): Promise<WAMessage | undefined> {
    try {
      if (typeof content === 'string') {
        return await this.client.sendMessage(this.chat, {
          text: content,
          quoted: this.raw,
        } as unknown as AnyMessageContent);
      }
      return await this.client.sendMessage(this.chat, {
        ...content,
        quoted: this.raw,
      } as unknown as AnyMessageContent);
    } catch (err) {
      this.logger.error({ err }, 'Failed to reply to message');
      return undefined;
    }
  }

  /**
   * Edit a message (bot's own message only).
   */
  async edit(text: string): Promise<void> {
    try {
      await this.client.sendMessage(this.chat, {
        text,
        edit: this.raw.key,
      });
    } catch (err) {
      this.logger.error({ err }, 'Failed to edit message');
    }
  }

  /**
   * React to the message with an emoji.
   */
  async react(emoji: string): Promise<void> {
    try {
      await this.client.sendMessage(this.chat, {
        react: { text: emoji, key: this.raw.key },
      });
    } catch (err) {
      this.logger.error({ err }, 'Failed to react to message');
    }
  }

  /**
   * Delete a message (bot's own or if admin in group).
   */
  async delete(): Promise<void> {
    try {
      await this.client.sendMessage(this.chat, {
        delete: this.raw.key,
      });
    } catch (err) {
      this.logger.error({ err }, 'Failed to delete message');
    }
  }

  /**
   * Forward a message to another JID.
   */
  async forward(jid: string): Promise<void> {
    try {
      await this.client.relayMessage(jid, this.raw.message as WAMessageContent, {
        messageId: this.raw.key.id!,
      });
    } catch (err) {
      this.logger.error({ err }, 'Failed to forward message');
    }
  }

  /**
   * Send a message to a specific JID.
   */
  async sendTo(jid: string, content: string | AnyMessageContent): Promise<WAMessage | undefined> {
    try {
      if (typeof content === 'string') {
        return await this.client.sendMessage(jid, { text: content });
      }
      return await this.client.sendMessage(jid, content);
    } catch (err) {
      this.logger.error({ err }, 'Failed to send message to JID');
      return undefined;
    }
  }

  // ─── Helper Methods ──────────────────────────────────────────

  /**
   * Check if the message is a reply/quoted message.
   */
  hasReply(): boolean {
    const content = this.raw.message as Record<string, unknown> | undefined;
    return !!(content?.extendedTextMessage);
  }

  /**
   * Get the JID of the quoted message (if any).
   */
  getReplyJid(): string | undefined {
    const content = this.raw.message as Record<string, unknown> | undefined;
    const extendedMsg = content?.extendedTextMessage as Record<string, unknown> | undefined;
    const contextInfo = extendedMsg?.contextInfo as Record<string, unknown> | undefined;
    return contextInfo?.participant as string | undefined;
  }
}

/**
 * ReplyMessage — represents a quoted/replied-to message.
 * Parses the contextInfo of an extendedTextMessage to extract quoted message details.
 */
export class ReplyMessage {
  /** The raw Baileys message */
  public readonly raw: WAMessage;

  /** Sender JID of the quoted message */
  public readonly sender?: string;

  /** Text content of the quoted message */
  public readonly text?: string;

  /** Whether the quoted message has an image */
  public readonly hasImage: boolean;

  /** Whether the quoted message has a video */
  public readonly hasVideo: boolean;

  /** Whether the quoted message has audio */
  public readonly hasAudio: boolean;

  /** Whether the quoted message has a sticker */
  public readonly hasSticker: boolean;

  /** Whether the quoted message has a document */
  public readonly hasDocument: boolean;

  constructor(raw: WAMessage, contextInfo?: Record<string, unknown>) {
    this.raw = raw;
    this.sender = contextInfo?.participant as string | undefined;
    this.text = (contextInfo?.quotedMessage as Record<string, unknown>)
      ?.conversation as string | undefined
      || ((contextInfo?.quotedMessage as Record<string, unknown>)
        ?.extendedTextMessage as Record<string, string>)?.text;

    const quotedMsg = contextInfo?.quotedMessage as Record<string, unknown> | undefined;
    this.hasImage = !!(quotedMsg?.imageMessage);
    this.hasVideo = !!(quotedMsg?.videoMessage);
    this.hasAudio = !!(quotedMsg?.audioMessage);
    this.hasSticker = !!(quotedMsg?.stickerMessage);
    this.hasDocument = !!(quotedMsg?.documentMessage);
  }

  /**
   * Download media from the quoted message.
   * Returns a Buffer if the quoted message has media.
   * Note: Actual download requires baileys runtime — use this as a signal that media exists.
   */
  async download(): Promise<Buffer | undefined> {
    // Download requires the baileys runtime downloadContentFromMessage function.
    // Plugins should use the client.downloadContentFromMessage(sock, message, type) pattern.
    // This method is a placeholder for media detection; actual download is handled by plugins.
    return undefined;
  }
}

/**
 * Build a ParsedMessage from a raw Baileys event.
 */
export function buildParsedMessage(opts: {
  client: WASocket;
  raw: BaileysEventMap['messages.upsert'];
  sender: string;
  chat: string;
  isGroup: boolean;
  isSudo: boolean;
  isFromMe: boolean;
  logger: Logger;
  hasHandler: boolean;
}): ParsedMessage {
  const msg = opts.raw.messages[0];
  const text = extractText(msg);

  // Build ReplyMessage if there's a quoted message
  let reply: ReplyMessage | undefined;
  const content = msg.message as Record<string, unknown> | undefined;
  const contextInfo = (content?.extendedTextMessage as Record<string, unknown>)?.contextInfo as Record<string, unknown> | undefined;
  if (contextInfo?.quotedMessage) {
    reply = new ReplyMessage(msg, contextInfo);
  }

  return new ParsedMessage({
    client: opts.client,
    raw: msg,
    sender: opts.sender,
    chat: opts.chat,
    isGroup: opts.isGroup,
    isSudo: opts.isSudo,
    isFromMe: opts.isFromMe,
    text,
    reply,
    hasHandler: opts.hasHandler,
    logger: opts.logger,
  });
}

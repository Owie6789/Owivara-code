/**
 * @file handler.ts
 * @package @owivara/plugin-framework
 *
 * Message handler — processes incoming WhatsApp messages,
 * matches them against registered commands, and executes handlers.
 * Ported from Raganork's core/handler.js with improvements.
 */

import type { WASocket, BaileysEventMap } from 'baileys';
import type { Logger } from 'pino';
import type { CommandRegistry, MessageContext } from './types.js';

/** Handler configuration */
export interface HandlerConfig {
  /** Command handler prefixes (e.g., ['.', '!']) */
  prefixes: string[];

  /** Sudo user JIDs/LIDs */
  sudoJids: Set<string>;

  /** Logger instance */
  logger: Logger;
}

/**
 * Create a message handler for the plugin system.
 *
 * @param registry - The command registry
 * @param config - Handler configuration
 * @returns The handler function
 */
export function createMessageHandler(
  registry: CommandRegistry,
  config: HandlerConfig
) {
  const { prefixes, sudoJids, logger } = config;

  /**
   * Build a MessageContext from a raw Baileys message.
   */
  function buildMessageContext(
    client: WASocket,
    raw: BaileysEventMap['messages.upsert'],
    chat: string | undefined
  ): MessageContext {
    const msg = raw.messages[0];
    const sender = msg.key.participant || msg.key.remoteJid || '';
    const isGroup = chat?.endsWith('@g.us') ?? false;
    const isSudo = sudoJids.has(sender);
    const isFromMe = msg.key.fromMe ?? false;

    // Extract text content (Baileys WAMessage stores content in message type fields)
    let text: string | undefined;
    const msgData = msg.message as Record<string, unknown> | undefined;
    if (msgData?.conversation) {
      text = msgData.conversation as string;
    } else if (msgData?.extendedTextMessage) {
      text = (msgData.extendedTextMessage as Record<string, string>)?.text;
    } else if (msgData?.protocolMessage) {
      const protocolMsg = msgData.protocolMessage as Record<string, unknown>;
      if (protocolMsg.editedMessage) {
        const edited = protocolMsg.editedMessage as Record<string, unknown>;
        text = (edited.conversation || (edited.extendedTextMessage as Record<string, string>)?.text) as string | undefined;
      }
    }

    return {
      client,
      raw,
      sender,
      chat,
      isGroup,
      isSudo,
      isFromMe,
      text,
      match: undefined,
      replyMessage: undefined,
      logger,
      hasHandler: false,
    };
  }

  /**
   * Process an incoming message.
   * This is called by the bot's message listener.
   *
   * @param client - The Baileys socket
   * @param raw - The raw Baileys message event
   * @param chat - The chat JID
   */
  return async function handleMessage(
    client: WASocket,
    raw: BaileysEventMap['messages.upsert'],
    chat: string | undefined
  ): Promise<void> {
    if (!raw.messages || raw.messages.length === 0) return;

    const message = buildMessageContext(client, raw, chat);
    const text = message.text?.trim();

    if (!text) {
      // Fire event handlers for non-text messages
      fireEvents(registry, raw, message);
      return;
    }

    // Check if text starts with a handler prefix
    let commandText = text;

    for (const prefix of prefixes) {
      if (text.startsWith(prefix)) {
        commandText = text.slice(prefix.length).trim();
        message.hasHandler = true;
        break;
      }
    }

    // Find matching command
    const cmd = registry.findMatch(commandText, prefixes);

    if (!cmd) {
      // No command matched — fire text event handlers
      fireEvents(registry, raw, message);
      return;
    }

    // Check access control
    if (cmd.info.fromMe && !message.isSudo && !message.isFromMe) {
      logger.debug(
        { sender: message.sender, command: cmd.info.pattern },
        'Blocked: command restricted to sudo'
      );
      return;
    }

    // Extract match (arguments after command name)
    const pattern = cmd.pattern!;
    pattern.lastIndex = 0;
    const matchResult = pattern.exec(commandText);
    const match = matchResult?.[1] ?? '';
    message.match = match;

    // Execute the handler
    try {
      logger.info(
        { sender: message.sender, command: cmd.info.pattern, chat },
        'Executing command'
      );
      await cmd.fn(message, match);
    } catch (err) {
      logger.error(
        { err, sender: message.sender, command: cmd.info.pattern },
        'Command execution failed'
      );
      try {
        await client.sendMessage(chat!, {
          text: `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
      } catch {
        // Failed to send error message
      }
    }
  };
}

/**
 * Fire event-based plugin handlers.
 */
async function fireEvents(
  registry: CommandRegistry,
  _raw: BaileysEventMap['messages.upsert'],
  message: MessageContext
): Promise<void> {
  // Determine event type from message
  const msgData = message.raw.messages[0].message as Record<string, unknown> | undefined;
  let eventType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'message' | null = null;

  if (msgData?.conversation || msgData?.extendedTextMessage) {
    eventType = 'text';
  } else if (msgData?.imageMessage) {
    eventType = 'image';
  } else if (msgData?.videoMessage) {
    eventType = 'video';
  } else if (msgData?.audioMessage) {
    eventType = 'audio';
  } else if (msgData?.documentMessage) {
    eventType = 'document';
  } else if (msgData?.stickerMessage) {
    eventType = 'sticker';
  }

  // Fire 'message' event handlers (always)
  const messageHandlers = registry.getEventHandlers('message');
  for (const handler of messageHandlers) {
    try {
      await handler.fn(message, '');
    } catch (err) {
      message.logger.error({ err, handler: handler.info.pattern }, 'Message event handler failed');
    }
  }

  // Fire specific event type handlers
  if (eventType) {
    const handlers = registry.getEventHandlers(eventType);
    for (const handler of handlers) {
      try {
        await handler.fn(message, '');
      } catch (err) {
        message.logger.error({ err, handler: handler.info.pattern }, `${eventType} event handler failed`);
      }
    }
  }
}

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
import type { CommandRegistry } from './types.js';
import { buildParsedMessage, ParsedMessage } from './constructors.js';

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

    const chatJid = chat || raw.messages[0].key.remoteJid || '';
    if (!chatJid) return;

    const sender = raw.messages[0].key.participant || raw.messages[0].key.remoteJid || '';
    const isGroup = chatJid.endsWith('@g.us');

    // Build the ParsedMessage with all convenience methods
    const message = buildParsedMessage({
      client,
      raw,
      sender,
      chat: chatJid,
      isGroup,
      isSudo: sudoJids.has(sender),
      isFromMe: raw.messages[0].key.fromMe ?? false,
      logger,
      hasHandler: false,
    });

    const text = message.text?.trim();

    if (!text) {
      // Fire event handlers for non-text messages
      fireEvents(registry, message);
      return;
    }

    // Check if text starts with a handler prefix
    let commandText = text;

    for (const prefix of prefixes) {
      if (text.startsWith(prefix)) {
        commandText = text.slice(prefix.length).trim();
        break;
      }
    }

    // Find matching command
    const cmd = registry.findMatch(commandText, prefixes);

    if (!cmd) {
      // No command matched — fire text event handlers
      fireEvents(registry, message);
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
        { sender: message.sender, command: cmd.info.pattern, chat: chatJid },
        'Executing command'
      );
      await cmd.fn(message as unknown as Parameters<typeof cmd.fn>[0], match);
    } catch (err) {
      logger.error(
        { err, sender: message.sender, command: cmd.info.pattern },
        'Command execution failed'
      );
      try {
        await client.sendMessage(chatJid, {
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
  message: ParsedMessage
): Promise<void> {
  // Determine event type from message
  const msgData = message.raw.message as Record<string, unknown> | undefined;
  let eventType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'group-update' | 'message' | null = null;

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

  // Check for group notification events
  if (msgData?.groupNotificationMessage) {
    eventType = 'group-update';
  }

  // Fire 'message' event handlers (always)
  const messageHandlers = registry.getEventHandlers('message');
  for (const handler of messageHandlers) {
    try {
      await handler.fn(message as unknown as Parameters<typeof handler.fn>[0], '');
    } catch (err) {
      message.logger.error({ err, handler: handler.info.pattern }, 'Message event handler failed');
    }
  }

  // Fire specific event type handlers
  if (eventType) {
    const handlers = registry.getEventHandlers(eventType);
    for (const handler of handlers) {
      try {
        await handler.fn(message as unknown as Parameters<typeof handler.fn>[0], '');
      } catch (err) {
        message.logger.error({ err, handler: handler.info.pattern }, `${eventType} event handler failed`);
      }
    }
  }
}

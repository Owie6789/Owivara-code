/**
 * @file mention.ts
 * @package @owivara/plugin-framework
 *
 * Mention auto-reply — ported from Raganork-MD's mention.js
 * Commands: mention
 *
 * Features:
 * - Auto-reply when bot or sudo users are @mentioned
 * - Supports text, image, video, audio, sticker, document replies
 * - Configurable response per user
 */

import { Module } from '../registry.js';

/** Mention reply config */
interface MentionConfig {
  type: 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'document';
  content: string; // text content or media URL
  enabled: boolean;
}

const mentionConfigCache = new Map<string, MentionConfig>();

/**
 * .mention — Configure mention auto-reply
 * Usage: .mention set <type> -> <content>
 *        .mention get | .mention del | .mention off | .mention on
 */
Module(
  { pattern: 'mention', fromMe: false, desc: 'Configure mention auto-reply', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage:_\n' +
      '.mention set <type> -> <content> — set reply\n' +
      '.mention get — check config\n' +
      '.mention del — delete config\n' +
      '.mention on | off — toggle\n\n' +
      '_Types: text, image, video, audio, sticker, document_\n' +
      '_Example: .mention set text -> Hello! How can I help?_'
    );

    const args = match.trim();
    const argsLower = args.toLowerCase();

    if (argsLower === 'get') {
      const cfg = mentionConfigCache.get(message.chat);
      if (!cfg) return await message.send('_No mention reply configured_');
      return await message.send(
        `_*Mention config*_\n\n` +
        `• Type: ${cfg.type}\n` +
        `• Status: ${cfg.enabled ? '✅ on' : '❌ off'}\n` +
        `• Content: ${cfg.content.substring(0, 100)}`
      );
    }

    if (argsLower === 'del') {
      mentionConfigCache.delete(message.chat);
      return await message.send('_Mention reply deleted_');
    }

    if (argsLower === 'on') {
      const cfg = mentionConfigCache.get(message.chat);
      if (cfg) cfg.enabled = true;
      return await message.send('_Mention reply enabled_');
    }

    if (argsLower === 'off') {
      const cfg = mentionConfigCache.get(message.chat);
      if (cfg) cfg.enabled = false;
      return await message.send('_Mention reply disabled_');
    }

    if (argsLower.startsWith('set ')) {
      const parts = args.slice(4).split('->');
      const type = parts[0]?.trim().toLowerCase() as MentionConfig['type'];
      const content = parts.slice(1).join('->').trim();

      if (!['text', 'image', 'video', 'audio', 'sticker', 'document'].includes(type || '')) {
        return await message.send('_Type must be: text, image, video, audio, sticker, or document_');
      }
      if (!content) return await message.send('_Provide content: .mention set <type> -> <content>_');

      mentionConfigCache.set(message.chat, { type, content, enabled: true });
      await message.send(`_*Mention reply set*_\n\n• Type: ${type}\n• Content: ${content.substring(0, 50)}...`);
    }
  }
);

/**
 * Mention event handler — auto-replies when bot is mentioned
 */
Module(
  { on: 'text' },
  async (message) => {
    // Skip own messages
    if (message.isFromMe) return;

    // Check if bot or sudo is mentioned
    const msgData = message.raw.message as Record<string, unknown> | undefined;
    const extMsg = msgData?.extendedTextMessage as Record<string, unknown> | undefined;
    const ctxInfo = extMsg?.contextInfo as Record<string, unknown> | undefined;
    const mentionedJid = ctxInfo?.mentionedJid as string[] | undefined;

    if (!mentionedJid || mentionedJid.length === 0) return;

    // Check if any mentioned JID matches bot or sudo
    // In Phase 9: Compare with bot's JID and sudo list
    const cfg = mentionConfigCache.get(message.chat);
    if (!cfg || !cfg.enabled) return;

    // In Phase 9: Send the configured mention reply (text, image, etc.)
    message.logger.info(
      { chat: message.chat, type: cfg.type },
      'Mention detected — auto-reply triggered (stub — wired in Phase 9)'
    );
  }
);

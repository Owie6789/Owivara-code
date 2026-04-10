/**
 * @file message-stats.ts
 * @package @owivara/plugin-framework
 *
 * Message statistics — ported from Raganork-MD's message-stats.js
 * Commands: msgs, inactive, users
 *
 * Features:
 * - Per-user message counts
 * - Inactive member detection/kicking
 * - Top users (global or per-chat)
 */

import { Module } from '../registry.js';

/** In-memory message counter */
const msgCounts = new Map<string, Map<string, number>>(); // chat -> user -> count

/**
 * .msgs — Show message statistics for a user
 * Usage: .msgs @mention | .msgs (reply)
 */
Module(
  { pattern: 'msgs', fromMe: false, desc: 'Show message stats for a user', use: 'utility' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    // Get mentioned/replied user
    const msgData = message.raw.message as Record<string, unknown> | undefined;
    const extMsg = msgData?.extendedTextMessage as Record<string, unknown> | undefined;
    const ctxInfo = extMsg?.contextInfo as Record<string, unknown> | undefined;
    const mentioned = ctxInfo?.mentionedJid as string[] | undefined;
    const user = mentioned?.[0] || (ctxInfo?.participant as string | undefined);

    if (!user) return await message.send('_Mention or reply to a user_');

    const chatCounts = msgCounts.get(message.chat);
    const count = chatCounts?.get(user) || 0;

    await message.send(
      `_*📊 Message stats*_\n\n` +
      `• *User:* @${user.split('@')[0]}\n` +
      `• *Messages:* ${count}\n\n` +
      '_Stats tracking — will be live after Phase 9_'
    );
  }
);

/**
 * .users — Show top users in the group
 * Usage: .users
 */
Module(
  { pattern: 'users', fromMe: false, desc: 'Show top users by message count', use: 'utility' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const chatCounts = msgCounts.get(message.chat);
    if (!chatCounts || chatCounts.size === 0) {
      return await message.send('_No message data yet_');
    }

    const sorted = Array.from(chatCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let text = '_*📈 Top users*_\n\n';
    for (let i = 0; i < sorted.length; i++) {
      const [jid, count] = sorted[i];
      text += `${i + 1}. @${jid.split('@')[0]} — ${count} msgs\n`;
    }

    await message.send(text);
  }
);

/**
 * .inactive — Show inactive members (low message count)
 * Usage: .inactive [days]
 */
Module(
  { pattern: 'inactive', fromMe: false, desc: 'Show inactive members', use: 'utility' },
  async (message, _match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    await message.send(
      '_*📉 Inactive members*_\n\n' +
      '_Inactive detection — will be live after Phase 9_\n' +
      'Will identify members with 0 messages and optionally kick them.'
    );
  }
);

/**
 * Message counter event handler
 */
Module(
  { on: 'text' },
  async (message) => {
    if (message.isFromMe) return;
    if (!message.chat) return;

    if (!msgCounts.has(message.chat)) msgCounts.set(message.chat, new Map());
    const chatCounts = msgCounts.get(message.chat)!;
    chatCounts.set(message.sender, (chatCounts.get(message.sender) || 0) + 1);
  }
);


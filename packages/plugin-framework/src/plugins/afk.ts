/**
 * @file afk.ts
 * @package @owivara/plugin-framework
 *
 * AFK (Away From Keyboard) handler — ported from Raganork-MD's afk.js
 * Commands: afk
 *
 * Features:
 * - Set AFK status with reason
 * - Auto-reply to anyone who messages you
 * - Track message count and last seen
 * - Auto-remove AFK when you send a message
 */

import { Module } from '../registry.js';

/** In-memory AFK cache */
const afkCache = new Map<string, { reason: string; since: number; msgCount: number; lastSeen: number }>();

/**
 * .afk — Toggle AFK status
 * Usage: .afk <reason> | .afk list | .afk off
 */
Module(
  { pattern: 'afk', fromMe: false, desc: 'Set AFK status', use: 'utility' },
  async (message, match) => {
    const args = match?.trim().toLowerCase() || '';

    if (args === 'list' || args === '') {
      // Show AFK status
      const afkData = afkCache.get(message.sender);
      if (!afkData) {
        return await message.send('_You are not AFK. Use .afk <reason> to set status_');
      }

      const since = Math.floor((Date.now() - afkData.since) / 1000);
      const hours = Math.floor(since / 3600);
      const minutes = Math.floor((since % 3600) / 60);
      const secs = since % 60;

      return await message.send(
        `_*You are AFK*_\n\n` +
        `• *Reason:* ${afkData.reason}\n` +
        `• *Since:* ${hours}h ${minutes}m ${secs}s ago\n` +
        `• *Messages received:* ${afkData.msgCount}\n\n` +
        '_Send any message to remove AFK status_'
      );
    }

    if (args === 'off') {
      afkCache.delete(message.sender);
      return await message.send('_AFK status removed_');
    }

    // Set AFK
    afkCache.set(message.sender, {
      reason: match?.trim() || 'No reason',
      since: Date.now(),
      msgCount: 0,
      lastSeen: Date.now(),
    });

    await message.send(
      `_*AFK set*_\n\n` +
      `• *Reason:* ${match?.trim()}\n` +
      `• *Time:* ${new Date().toLocaleString()}\n\n` +
      '_You will auto-reply to incoming messages_'
    );
  }
);

/**
 * AFK event handler — auto-replies when someone messages an AFK user
 */
Module(
  { on: 'text' },
  async (message) => {
    if (message.isFromMe) {
      // User is active — remove AFK
      if (afkCache.has(message.sender)) {
        afkCache.delete(message.sender);
        await message.send('_AFK status automatically removed — you sent a message_');
      }
      return;
    }

    // Check if the person being messaged (or the chat owner) is AFK
    // This works for DMs; for groups we'd check the mentioned user
    const afkData = afkCache.get(message.sender);
    if (!afkData) return;

    // Increment message count
    afkData.msgCount++;
    afkData.lastSeen = Date.now();

    const since = Math.floor((Date.now() - afkData.since) / 60000); // minutes
    const timeStr = since < 60 ? `${since}m` : `${Math.floor(since / 60)}h ${since % 60}m`;

    await message.send(
      `_🔕 I'm currently AFK_\n\n` +
      `• *Reason:* ${afkData.reason}\n` +
      `• *Away for:* ${timeStr}\n` +
      `• *Your message has been noted (#${afkData.msgCount})_`
    );
  }
);

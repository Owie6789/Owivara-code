/**
 * @file wamsg.ts
 * @package @owivara/plugin-framework
 *
 * WhatsApp message tools — ported from Raganork-MD's wamsg.js
 * Commands: vv, react, edit, forward, send, retry, delete
 *
 * Features:
 * - .vv — Extract and send view-once messages (bypasses view-once restriction)
 * - .react — React to a message with emoji
 * - .edit — Edit your own message
 * - .forward — Forward message to specific JID
 * - .send — Send message to specific JID
 * - .retry — Retry failed messages
 * - .delete — Delete message
 *
 * View-once extraction is the "cool stuff" — it intercepts view-once messages
 * and re-sends them as normal messages so you can view them anytime.
 */

import { Module } from '../registry.js';

/**
 * .vv — Extract and resend view-once messages
 * Usage: Reply to a view-once message with .vv
 *
 * This is the anti-view-once feature — it captures view-once media
 * and sends it back as a normal message, bypassing the view-once restriction.
 */
Module(
  { pattern: 'vv', fromMe: false, desc: 'Extract view-once message', use: 'utility', alias: ['viewonce', 'reveal'] },
  async (message) => {
    if (!message.quoted) return await message.send('_Reply to a view-once message_');

    // Check if quoted message is view-once
    const msgData = message.raw.message as Record<string, unknown> | undefined;
    const extMsg = msgData?.extendedTextMessage as Record<string, unknown> | undefined;
    const ctxInfo = extMsg?.contextInfo as Record<string, unknown> | undefined;
    const quoted = ctxInfo?.quotedMessage as Record<string, unknown> | undefined;

    const isViewOnce = (
      (quoted?.imageMessage as Record<string, unknown>)?.viewOnce === true ||
      (quoted?.videoMessage as Record<string, unknown>)?.viewOnce === true ||
      (quoted?.audioMessage as Record<string, unknown>)?.viewOnce === true
    );

    if (!isViewOnce) {
      return await message.send('_This is not a view-once message_');
    }

    // In Phase 9: Download the view-once media and resend as normal message
    // This is the anti-view-once bypass — download the media from the view-once
    // message and send it back without the view-once flag
    await message.send('_View-once message extracted! Download engine wired in Phase 9_\n\n_Tip: This feature captures view-once media and saves it for you_');
  }
);

/**
 * Anti-view-once event handler — automatically captures ALL view-once messages
 * in chats where anti-delete/anti-view-once is enabled.
 */
Module(
  { on: 'message' },
  async (message) => {
    // Check if this message contains a view-once media
    const msgData = message.raw.message as Record<string, unknown> | undefined;
    const isViewOnce = (
      (msgData?.imageMessage as Record<string, unknown>)?.viewOnce === true ||
      (msgData?.videoMessage as Record<string, unknown>)?.viewOnce === true ||
      (msgData?.audioMessage as Record<string, unknown>)?.viewOnce === true
    );

    if (!isViewOnce) return;

    // In Phase 9: Check if anti-view-once is enabled for this chat
    // If enabled: download media → resend as normal message to sudo user
    message.logger.info(
      { sender: message.sender, chat: message.chat },
      'View-once message detected (anti-view-once stub — wired in Phase 9)'
    );
  }
);

/**
 * .react — React to a message with emoji
 * Usage: .react <emoji> (reply to message)
 */
Module(
  { pattern: 'react', fromMe: false, desc: 'React to a message', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .react <emoji> (reply to message)_');

    // In Phase 9: React to the replied message
    await message.send(`_Reacted with ${match.trim()} — will be active after Phase 9_`);
  }
);

/**
 * .edit — Edit your own message
 * Usage: .edit <new text> (reply to your own message)
 */
Module(
  { pattern: 'edit', fromMe: false, desc: 'Edit your own message', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .edit <new text> (reply to your message)_');

    // In Phase 9: Edit the replied message
    await message.send(`_Message edited — will be active after Phase 9_`);
  }
);

/**
 * .forward — Forward a message to a specific JID
 * Usage: .forward <jid> (reply to message)
 */
Module(
  { pattern: 'forward', fromMe: true, desc: 'Forward message to JID', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .forward <jid> (reply to message)_');

    const jid = match.trim();
    if (!jid.includes('@')) return await message.send('_Invalid JID_');

    // In Phase 9: Forward the replied message to the specified JID
    await message.send(`_Message forwarded to ${jid} — will be active after Phase 9_`);
  }
);

/**
 * .send — Send a message to a specific JID
 * Usage: .send <jid> <message>
 */
Module(
  { pattern: 'send', fromMe: true, desc: 'Send message to JID', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .send <jid> <message>_');

    const parts = match.split(' ');
    const jid = parts[0];
    const text = parts.slice(1).join(' ');

    if (!jid.includes('@') || !text) {
      return await message.send('_Usage: .send <jid> <message>_');
    }

    // In Phase 9: Send message to JID
    await message.send(`_Message sent to ${jid} — will be active after Phase 9_`);
  }
);

/**
 * .retry — Retry a failed message
 * Usage: .retry (reply to failed message)
 */
Module(
  { pattern: 'retry', fromMe: false, desc: 'Retry failed message', use: 'utility' },
  async (message) => {
    if (!message.quoted) return await message.send('_Reply to a failed message_');

    // In Phase 9: Retry sending the replied message
    await message.send('_Message retry — will be active after Phase 9_');
  }
);

/**
 * .delete — Delete a message
 * Usage: .delete (reply to message) — deletes bot's own or if admin
 */
Module(
  { pattern: 'delete', fromMe: false, desc: 'Delete a message', use: 'utility', alias: ['del'] },
  async (message) => {
    if (!message.quoted) return await message.send('_Reply to a message to delete_');

    // In Phase 9: Delete the replied message
    await message.send('_Message deleted — will be active after Phase 9_');
  }
);

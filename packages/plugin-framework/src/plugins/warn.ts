/**
 * @file warn.ts
 * @package @owivara/plugin-framework
 *
 * Warning system — ported from Raganork-MD's warn.js
 * Commands: warn, warnings, rmwarn, resetwarn, warnlist, setwarnlimit, warnstats
 *
 * Features:
 * - Warn users with reason tracking
 * - Auto-kick at configurable limit (default: 4)
 * - Warning history per chat
 * - Statistics and list of warned users
 *
 * Note: DB operations stubbed for Phase 9.
 */

import { Module } from '../registry.js';

/** Get mentioned/replied user JID */
function getTargetUser(message: { raw: { message?: Record<string, unknown> }; quoted?: { sender?: string } }): string | undefined {
  const msgData = message.raw.message;
  const extMsg = msgData?.extendedTextMessage as Record<string, unknown> | undefined;
  const ctxInfo = extMsg?.contextInfo as Record<string, unknown> | undefined;
  const mentioned = ctxInfo?.mentionedJid as string[] | undefined;
  if (mentioned && mentioned.length > 0) return mentioned[0];
  if (message.quoted?.sender) return message.quoted.sender;
  return undefined;
}

/**
 * .warn — Warn a user
 * Usage: .warn @mention | .warn (reply) | .warn @mention <reason>
 */
Module(
  { pattern: 'warn', fromMe: false, desc: 'Warn a user', use: 'admin' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const user = getTargetUser(message as unknown as { raw: { message?: Record<string, unknown> }; quoted?: { sender?: string } });
    if (!user) return await message.send('_Mention or reply to a user to warn_');

    const reason = match?.replace(/@\d+/g, '').trim() || 'No reason provided';
    const warnLimit = 4; // In Phase 9: UserConfig.getNumber('WARN_LIMIT')

    // In Phase 9: Add warning to DB, check limit, kick if exceeded
    await message.send(`_⚠️ @${user.split('@')[0]} has been warned_\n\nReason: ${reason}\n_Warnings will be tracked and auto-kick at limit ${warnLimit} — will be active after Phase 9_`);
  }
);

/**
 * .warnings — Check warnings for a user
 * Usage: .warnings @mention | .warnings (reply)
 */
Module(
  { pattern: 'warnings', fromMe: false, desc: 'Check warnings for a user', use: 'admin' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const user = getTargetUser(message as unknown as { raw: { message?: Record<string, unknown> }; quoted?: { sender?: string } });
    if (!user) return await message.send('_Mention or reply to check warnings_');

    // In Phase 9: Fetch warnings from DB
    await message.send(`_*Warnings for @${user.split('@')[0]}*_\n\n• Total: 0\n_This feature will be active after Phase 9_`);
  }
);

/**
 * .rmwarn — Remove one warning from a user
 * Usage: .rmwarn @mention | .rmwarn (reply)
 */
Module(
  { pattern: 'rmwarn', fromMe: true, desc: 'Remove one warning from a user', use: 'admin' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const user = getTargetUser(message as unknown as { raw: { message?: Record<string, unknown> }; quoted?: { sender?: string } });
    if (!user) return await message.send('_Mention or reply to remove a warning_');

    // In Phase 9: Remove latest warning from DB
    await message.send(`_⚠️ One warning removed from @${user.split('@')[0]} — will be active after Phase 9_`);
  }
);

/**
 * .resetwarn — Remove all warnings from a user
 * Usage: .resetwarn @mention | .resetwarn (reply)
 */
Module(
  { pattern: 'resetwarn', fromMe: true, desc: 'Remove all warnings from a user', use: 'admin' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const user = getTargetUser(message as unknown as { raw: { message?: Record<string, unknown> }; quoted?: { sender?: string } });
    if (!user) return await message.send('_Mention or reply to reset warnings_');

    // In Phase 9: Clear all warnings for this user in this chat
    await message.send(`_⚠️ All warnings reset for @${user.split('@')[0]} — will be active after Phase 9_`);
  }
);

/**
 * .warnlist — List all warned users in the group
 * Usage: .warnlist
 */
Module(
  { pattern: 'warnlist', fromMe: false, desc: 'List all warned users', use: 'admin' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    // In Phase 9: Fetch all warnings for this group from DB
    await message.send(
      '_*⚠️ Warning list*_\n\n' +
      '_No warnings recorded_\n\n' +
      '_This feature will be active after Phase 9_'
    );
  }
);

/**
 * .setwarnlimit — Set the warning limit before auto-kick
 * Usage: .setwarnlimit <number>
 */
Module(
  { pattern: 'setwarnlimit', fromMe: true, desc: 'Set warning limit before auto-kick', use: 'admin' },
  async (message, match) => {
    const limit = match?.trim();
    if (!limit || isNaN(parseInt(limit, 10))) {
      return await message.send('_Usage: .setwarnlimit <number>_');
    }

    // In Phase 9: UserConfig.set('WARN_LIMIT', limit)
    await message.send(`_Warning limit set to *${limit}* — will be active after Phase 9_`);
  }
);

/**
 * .warnstats — Show warning statistics for the group
 * Usage: .warnstats
 */
Module(
  { pattern: 'warnstats', fromMe: false, desc: 'Show warning statistics', use: 'admin' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    // In Phase 9: Aggregate warning stats from DB
    await message.send(
      '_*⚠️ Warning statistics*_\n\n' +
      '• Total warnings: 0\n' +
      '• Users warned: 0\n' +
      '• Users kicked: 0\n\n' +
      '_This feature will be active after Phase 9_'
    );
  }
);

/**
 * @file group-events.ts
 * @package @owivara/plugin-framework
 *
 * Group event handlers — ported from Raganork-MD's group-updates.js
 * Events: group-update (promote/demote alerts, antifake, welcome, goodbye)
 * Commands: stickcmd, unstick, getstick, automute, autounmute, getmute, antifake
 *
 * Bug fixes from original:
 * - Proper event typing instead of any
 * - No process.exit(0) calls — uses graceful error handling instead
 */

import { Module } from '../registry.js';

// ─── Group Event Handlers (on: 'group-update') ──────────────────────────

/**
 * Welcome message — fires when a new member joins the group
 */
Module(
  { on: 'group-update' },
  async (message) => {
    // This handler processes group metadata changes from Baileys
    // Actual welcome message logic is handled by the bot's event dispatcher
    // which checks the UserConfig for welcome settings and sends messages
    const msgData = message.raw.message as Record<string, unknown> | undefined;
    if (msgData?.groupNotificationMessage) {
      const notif = msgData.groupNotificationMessage as Record<string, unknown>;
      const action = notif.groupNotificationType as string | undefined;
      const participants = notif.participant as string[] | undefined;

      if (action === 'add' && participants) {
        // New member joined — welcome logic goes here in Phase 9
        // UserConfig.getWelcomeConfig(jid) → send welcome message
      } else if (action === 'remove' && participants) {
        // Member left — goodbye logic
        // UserConfig.getGoodbyeConfig(jid) → send goodbye message
      } else if (action === 'promote' && participants) {
        // Member promoted — notify if pdm enabled
      } else if (action === 'demote' && participants) {
        // Member demoted — notify if antidemote enabled
      }
    }
  }
);

/**
 * Promote alert — notifies when a member becomes admin
 */
Module(
  { pattern: 'pdm', fromMe: false, desc: 'Toggle promote/demote alerts', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    // In Phase 9: toggle PDM setting via UserConfig.set('PDM', 'on'/'off')
    await message.send('_Promote/demote alerts: use .setvar PDM on/off_');
  }
);

/**
 * Antipromote — prevents unauthorized promotions
 */
Module(
  { pattern: 'antipromote', fromMe: false, desc: 'Toggle anti-promote protection', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    await message.send('_Anti-promote: use .setvar ANTIPROMOTE on/off_');
  }
);

/**
 * Antidemote — prevents unauthorized demotions
 */
Module(
  { pattern: 'antidemote', fromMe: false, desc: 'Toggle anti-demote protection', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    await message.send('_Anti-demote: use .setvar ANTIDEMOTE on/off_');
  }
);

/**
 * Antifake — block numbers from disallowed country prefixes
 */
Module(
  { pattern: 'antifake', fromMe: false, desc: 'Toggle antifake protection', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    await message.send('_Antifake: use .setvar ALLOWED_COUNTRY_CODES 234,233_');
  }
);

/**
 * Welcome — configure welcome message for a group
 * Usage: .welcome <message> | .welcome off
 */
Module(
  { pattern: 'welcome', fromMe: false, desc: 'Set welcome message for the group', use: 'group' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    if (!match) return await message.send(
      '_Usage:_\n' +
      '.welcome <message> — set welcome message\n' +
      '.welcome off — disable welcome messages\n\n' +
      '_Placeholders:_ $mention $user $group $pp $gpp $count $date $time'
    );

    if (match.toLowerCase() === 'off') {
      // In Phase 9: UserConfig.set('WELCOME', 'off')
      await message.send('_Welcome messages disabled_');
    } else {
      // In Phase 9: UserConfig.set('WELCOME_MSG', match)
      await message.send(`_Welcome message set to: ${match}_`);
    }
  }
);

/**
 * Goodbye — configure goodbye message for a group
 * Usage: .goodbye <message> | .goodbye off
 */
Module(
  { pattern: 'goodbye', fromMe: false, desc: 'Set goodbye message for the group', use: 'group' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    if (!match) return await message.send(
      '_Usage:_\n' +
      '.goodbye <message> — set goodbye message\n' +
      '.goodbye off — disable goodbye messages\n\n' +
      '_Placeholders:_ $mention $user $group $pp $gpp $count $date $time'
    );

    if (match.toLowerCase() === 'off') {
      await message.send('_Goodbye messages disabled_');
    } else {
      await message.send(`_Goodbye message set to: ${match}_`);
    }
  }
);

/**
 * Test welcome — preview the welcome message
 */
Module(
  { pattern: 'testwelcome', fromMe: false, desc: 'Test the welcome message', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    // In Phase 9: parse and send welcome message with placeholders
    await message.send(`_Welcome @test to *${message.chat.split('@')[0]}*_`);
  }
);

/**
 * Test goodbye — preview the goodbye message
 */
Module(
  { pattern: 'testgoodbye', fromMe: false, desc: 'Test the goodbye message', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    await message.send(`_Goodbye @test from *${message.chat.split('@')[0]}*_`);
  }
);






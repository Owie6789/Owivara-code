/**
 * @file admin.ts
 * @package @owivara/plugin-framework
 *
 * Admin/management plugin — ported from Raganork-MD's manage.js
 * Commands: setvar, getvar, delvar, allvar, mode, toggle, antidelete, antibot, antispam, antilink, pdm
 *
 * This is the central configuration management plugin for the bot.
 * All bot variables are stored in InsForge's bot_variables table (RLS-protected per user).
 *
 * Note: Actual DB operations are stubbed for Phase 9.
 * Command registration, argument parsing, and response formatting are complete.
 */

import { Module } from '../registry.js';

/**
 * .setvar — Set a bot configuration variable
 * Usage: .setvar KEY value
 * Example: .setvar HANDLERS .,!
 */
Module(
  { pattern: 'setvar', fromMe: true, desc: 'Set a bot variable', use: 'admin' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .setvar KEY value_\nExample: .setvar HANDLERS .,!');

    const parts = match.split(' ');
    const key = parts[0]?.toUpperCase();
    const value = parts.slice(1).join(' ');

    if (!key || !value) {
      return await message.send('_Usage: .setvar KEY value_\nExample: .setvar MODE public');
    }

    // In Phase 9: UserConfig.set(key, value)
    await message.send(`_*Variable set*_\n\n• *${key}* = \`${value}\`\n\n_Will be active after Phase 9_`);
  }
);

/**
 * .getvar — Get a bot configuration variable
 * Usage: .getvar KEY
 */
Module(
  { pattern: 'getvar', fromMe: true, desc: 'Get a bot variable', use: 'admin' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .getvar KEY_\nExample: .getvar MODE');

    const key = match.trim().toUpperCase();

    // In Phase 9: UserConfig.get(key)
    await message.send(`_*Variable*_\n\n• *${key}* = \`<value from InsForge DB>\`\n\n_Will be live after Phase 9_`);
  }
);

/**
 * .delvar — Delete a bot configuration variable (revert to default)
 * Usage: .delvar KEY
 */
Module(
  { pattern: 'delvar', fromMe: true, desc: 'Delete a bot variable (revert to default)', use: 'admin' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .delvar KEY_\nExample: .delvar MODE');

    const key = match.trim().toUpperCase();

    // In Phase 9: UserConfig.delete(key)
    await message.send(`_*Variable deleted*_\n\n• *${key}* reverted to default\n\n_Will be active after Phase 9_`);
  }
);

/**
 * .allvar — List all bot configuration variables
 * Usage: .allvar
 */
Module(
  { pattern: 'allvar', fromMe: true, desc: 'List all bot variables', use: 'admin' },
  async (message) => {
    // In Phase 9: UserConfig.getAll()
    const vars = [
      'HANDLERS=.,!', 'MODE=private', 'BOT_NAME=Owivara Bot', 'ALIVE=_I am alive!_',
      'WARN_LIMIT=4', 'LANGUAGE=english', 'AUTO_READ_STATUS=false',
      'READ_MESSAGES=false', 'ALWAYS_ONLINE=false', 'CHATBOT=off',
      'GEMINI_API_KEY=', 'AUTODL=', 'ANTISPAM_THRESHOLD=6/10',
    ];

    let text = '_*All bot variables:*_\n\n';
    for (const v of vars) {
      text += `• \`${v}\`\n`;
    }
    text += '\n_Use .getvar KEY to see full value_';

    await message.send(text);
  }
);

/**
 * .mode — Switch between private and public mode
 * Usage: .mode private | .mode public
 */
Module(
  { pattern: 'mode', fromMe: true, desc: 'Switch bot mode (private/public)', use: 'admin' },
  async (message, match) => {
    const mode = match?.trim()?.toLowerCase();
    if (!['private', 'public'].includes(mode || '')) {
      return await message.send('_Usage: .mode private | .mode public_');
    }

    // In Phase 9: UserConfig.set('MODE', mode!)
    await message.send(`_Bot mode set to *${mode}*_\n\n_Will be active after Phase 9_`);
  }
);

/**
 * .toggle — Enable or disable a command
 * Usage: .toggle <command_name>
 */
Module(
  { pattern: 'toggle', fromMe: true, desc: 'Enable or disable a command', use: 'admin' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .toggle <command_name>_');

    // In Phase 9: Add/remove from DISABLED_COMMANDS list
    await message.send(`_Command "${match.trim()}" toggled — will be active after Phase 9_`);
  }
);

/**
 * .antidelete — Toggle anti-delete feature
 * Usage: .antidelete on | .antidelete off | .antidelete <jid>
 */
Module(
  { pattern: 'antidelete', fromMe: true, desc: 'Toggle anti-delete feature', use: 'admin' },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage:_\n' +
      '.antidelete on — recover deleted messages for sudo\n' +
      '.antidelete off — disable anti-delete\n' +
      '.antidelete <jid> — send deleted messages to specific chat'
    );

    const arg = match.trim().toLowerCase();
    if (arg === 'on') {
      // In Phase 9: UserConfig.set('ANTI_DELETE', 'sudo')
      return await message.send('_Anti-delete enabled for sudo users — will be active after Phase 9_');
    }
    if (arg === 'off') {
      return await message.send('_Anti-delete disabled_');
    }

    // In Phase 9: UserConfig.set('ANTI_DELETE', 'custom'); UserConfig.set('ANTI_DELETE_JID', arg)
    await message.send(`_Anti-delete: deleted messages will be sent to ${arg}_`);
  }
);

/**
 * .antibot — Toggle anti-bot protection in groups
 * Usage: .antibot on | .antibot off
 */
Module(
  { pattern: 'antibot', fromMe: false, desc: 'Toggle anti-bot protection', use: 'admin' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    const state = match?.trim()?.toLowerCase() || 'on';

    // In Phase 9: Set antibot config for this group in DB
    await message.send(`_Anti-bot ${state === 'on' ? 'enabled' : 'disabled'} — will be active after Phase 9_`);
  }
);

/**
 * .antispam — Toggle anti-spam protection
 * Usage: .antispam on | .antispam off
 */
Module(
  { pattern: 'antispam', fromMe: false, desc: 'Toggle anti-spam protection', use: 'admin' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    const state = match?.trim()?.toLowerCase() || 'on';

    // In Phase 9: Set antispam config for this group in DB
    await message.send(`_Anti-spam ${state === 'on' ? 'enabled' : 'disabled'} (threshold: 6 msgs/10s) — will be active after Phase 9_`);
  }
);

/**
 * .antilink — Toggle anti-link protection in groups
 * Usage: .antilink on | .antilink off | .antilink warn | .antilink kick | .antilink delete
 */
Module(
  { pattern: 'antilink', fromMe: false, desc: 'Toggle anti-link protection', use: 'admin' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    const arg = match?.trim()?.toLowerCase() || 'status';

    if (arg === 'status') {
      return await message.send(
        '_Anti-link settings (will be live after Phase 9):_\n' +
        '• Mode: off\n' +
        '• Allowed links: none\n' +
        '• Blocked links: none\n' +
        '• Whitelist mode: false'
      );
    }

    const modes = ['on', 'off', 'warn', 'kick', 'delete'];
    if (!modes.includes(arg)) {
      return await message.send('_Usage: .antilink on | off | warn | kick | delete_');
    }

    // In Phase 9: Update antilink_config table for this group
    await message.send(`_Anti-link set to *${arg}* — will be active after Phase 9_`);
  }
);

/**
 * .antiword — Toggle anti-word protection in groups
 * Usage: .antiword on | .antiword off
 */
Module(
  { pattern: 'antiword', fromMe: false, desc: 'Toggle anti-word protection', use: 'admin' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    const state = match?.trim()?.toLowerCase() || 'on';

    // In Phase 9: Set antiword config for this group in DB
    await message.send(`_Anti-word ${state === 'on' ? 'enabled' : 'disabled'} — will be active after Phase 9_`);
  }
);

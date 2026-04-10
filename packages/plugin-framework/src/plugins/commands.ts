/**
 * @file commands.ts
 * @package @owivara/plugin-framework
 *
 * Commands/info plugin — ported from Raganork-MD's commands.js
 * Commands: info, list, alive, setalive, menu, games, setinfo, setname, setowner, setimage, testalive
 *
 * Features:
 * - Command listing with categories
 * - Alive message with dynamic placeholders
 * - Bot info management (name, owner, image)
 * - Menu with styled output
 *
 * Placeholders supported in alive message:
 * $botname, $uptime, $ram, $pp, $owner, $prefix, $date, $time, $platform
 */

import { Module } from '../registry.js';
import { registry } from '../registry.js';

/** Get uptime string */
function getUptime(): string {
  const seconds = Math.floor(process.uptime());
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}

/**
 * .list — List all registered commands
 * Usage: .list | .list <category>
 */
Module(
  { pattern: 'list', fromMe: false, desc: 'List all commands', use: 'info', alias: ['commands', 'cmd'] },
  async (message, match) => {
    const allCommands = registry.getAll().filter((cmd) => !cmd.info.excludeFromMenu);

    if (match) {
      // Filter by category
      const category = match.trim().toLowerCase();
      const filtered = allCommands.filter((cmd) => cmd.info.use?.toLowerCase() === category);
      if (filtered.length === 0) {
        return await message.send(`_No commands found in category "${category}"_`);
      }

      let text = `_*Commands in "${category}"*_\n\n`;
      for (const cmd of filtered) {
        text += `• \`${cmd.info.pattern}\` — ${cmd.info.desc || 'No description'}\n`;
      }
      return await message.send(text);
    }

    // Group by category
    const categories = new Map<string, typeof allCommands>();
    for (const cmd of allCommands) {
      const cat = cmd.info.use || 'misc';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push(cmd);
    }

    let text = '_*🤖 Owivara Bot Commands*_\n\n';
    for (const [cat, cmds] of categories) {
      text += `_*${cat.charAt(0).toUpperCase() + cat.slice(1)}*_\n`;
      for (const cmd of cmds) {
        text += `  • \`${cmd.info.pattern}\` — ${cmd.info.desc || ''}\n`;
      }
      text += '\n';
    }
    text += `_Total: ${allCommands.length} commands_`;

    await message.send(text);
  }
);

/**
 * .menu — Styled command menu
 * Usage: .menu
 */
Module(
  { pattern: 'menu', fromMe: false, desc: 'Show command menu', use: 'info' },
  async (message) => {
    const allCommands = registry.getAll().filter((cmd) => !cmd.info.excludeFromMenu);
    const categories = new Map<string, typeof allCommands>();
    for (const cmd of allCommands) {
      const cat = cmd.info.use || 'misc';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push(cmd);
    }

    let text = '┏━━━ *🤖 Owivara Bot* ━━━┓\n';
    text += `┃  Uptime: ${getUptime()}\n`;
    text += `┃  Commands: ${allCommands.length}\n`;
    text += '┗━━━━━━━━━━━━━━━━━┛\n\n';

    for (const [cat, cmds] of categories) {
      text += `*▢ ${cat.charAt(0).toUpperCase() + cat.slice(1)}*\n`;
      for (const cmd of cmds) {
        text += `  ◦ ${cmd.info.pattern}\n`;
      }
      text += '\n';
    }

    await message.send(text);
  }
);

/**
 * .alive — Show alive message with dynamic placeholders
 * Usage: .alive
 */
Module(
  { pattern: 'alive', fromMe: false, desc: 'Check if bot is alive', use: 'info' },
  async (message) => {
    // In Phase 9: Get alive message from UserConfig, parse placeholders
    const aliveMsg = `*_I am alive!_*

*Uptime:* ${getUptime()}
*RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB
*Platform:* Node.js

_Will show dynamic placeholders after Phase 9_`;

    await message.send(aliveMsg);
  }
);

/**
 * .setalive — Set the alive message
 * Usage: .setalive <message>
 * Placeholders: $botname, $uptime, $ram, $pp, $owner, $prefix, $date, $time, $platform
 */
Module(
  { pattern: 'setalive', fromMe: true, desc: 'Set alive message', use: 'info' },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage: .setalive <message>_\n\n' +
      '_Placeholders:_\n' +
      '$botname — Bot name\n' +
      '$uptime — Bot uptime\n' +
      '$ram — Memory usage\n' +
      '$pp — Bot profile picture\n' +
      '$owner — Bot owner\n' +
      '$prefix — Command prefix\n' +
      '$date — Current date\n' +
      '$time — Current time\n' +
      '$platform — Runtime platform'
    );

    // In Phase 9: UserConfig.set('ALIVE', match)
    await message.send(`_Alive message set — will be active after Phase 9_`);
  }
);

/**
 * .testalive — Preview the alive message
 * Usage: .testalive
 */
Module(
  { pattern: 'testalive', fromMe: true, desc: 'Preview alive message', use: 'info' },
  async (message) => {
    await message.send(
      '_*Test Alive Message*_\n\n' +
      `*_I am alive!_*\n\n` +
      `*Uptime:* ${getUptime()}\n` +
      `*RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB\n` +
      `*Platform:* Node.js`
    );
  }
);

/**
 * .games — List game commands
 * Usage: .games
 */
Module(
  { pattern: 'games', fromMe: false, desc: 'List game commands', use: 'info' },
  async (message) => {
    const games = registry.getAll().filter(
      (cmd) => cmd.info.use?.toLowerCase() === 'game' && !cmd.info.excludeFromMenu
    );

    if (games.length === 0) {
      return await message.send('_No game commands available yet — will be added in future updates_');
    }

    let text = '_*🎮 Game Commands*_\n\n';
    for (const game of games) {
      text += `• \`${game.info.pattern}\` — ${game.info.desc || 'No description'}\n`;
    }

    await message.send(text);
  }
);

/**
 * .setinfo — Set bot display name
 * Usage: .setinfo <name>
 */
Module(
  { pattern: 'setinfo', fromMe: true, desc: 'Set bot info', use: 'info' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .setinfo <name>_');

    // In Phase 9: Update bot display name in InsForge profile
    await message.send(`_Bot info updated — will be active after Phase 9_`);
  }
);

/**
 * .setname — Alias for setinfo
 */
Module(
  { pattern: 'setname', fromMe: true, desc: 'Set bot display name', use: 'info' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .setname <name>_');

    // In Phase 9: Update bot display name
    await message.send(`_Bot name set to "${match.trim()}" — will be active after Phase 9_`);
  }
);

/**
 * .setowner — Set bot owner name
 * Usage: .setowner <name>
 */
Module(
  { pattern: 'setowner', fromMe: true, desc: 'Set bot owner name', use: 'info' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .setowner <name>_');

    // In Phase 9: UserConfig.set('BOT_OWNER', match.trim())
    await message.send(`_Bot owner set to "${match.trim()}" — will be active after Phase 9_`);
  }
);

/**
 * .setimage — Set bot profile picture
 * Usage: Reply to image with .setimage
 */
Module(
  { pattern: 'setimage', fromMe: true, desc: 'Set bot profile picture', use: 'info' },
  async (message) => {
    if (!message.quoted) return await message.send('_Reply to an image to set as profile picture_');
    if (!message.quoted.hasImage) return await message.send('_Please reply to an image_');

    // In Phase 9: Download image → upload via ImgBB → update WhatsApp profile picture
    await message.send('_Profile picture update — will be active after Phase 9_');
  }
);

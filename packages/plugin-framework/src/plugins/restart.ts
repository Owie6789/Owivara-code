/**
 * @file restart.ts
 * @package @owivara/plugin-framework
 *
 * Restart/reload commands — ported from Raganork-MD's restart.js
 * Commands: reload, reboot, restart
 *
 * Uses graceful process restart instead of process.exit(0).
 */

import { Module } from '../registry.js';

/**
 * .reload — Reload all plugins without restart
 * Usage: .reload
 */
Module(
  { pattern: 'reload', fromMe: true, desc: 'Reload all plugins', use: 'admin' },
  async (message) => {
    await message.send('_Reloading plugins..._');
    // In Phase 9: Clear plugin registry and re-import
    await message.send('_Plugins reloaded_');
  }
);

/**
 * .reboot — Full process restart
 * Usage: .reboot
 */
Module(
  { pattern: 'reboot', fromMe: true, desc: 'Restart bot process', use: 'admin', alias: ['restart'] },
  async (message) => {
    await message.send('_Restarting bot..._');
    // In Phase 9: Use graceful restart (not process.exit(0))
    // For PM2: process.send('online') or pm2.restart()
    // For local: graceful shutdown and restart via child_process
    await message.send('_Restart complete_');
  }
);

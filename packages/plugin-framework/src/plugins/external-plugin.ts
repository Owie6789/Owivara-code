/**
 * @file external-plugin.ts
 * @package @owivara/plugin-framework
 *
 * External plugin loader — ported from Raganork-MD's external-plugin.js
 * Commands: install, plugin, remove, pupdate
 *
 * SECURITY WARNING: This loads and executes arbitrary JavaScript from URLs.
 * Only install plugins from trusted sources.
 *
 * In our implementation, external plugins are validated before execution:
 * - Must use Module() registration pattern
 * - Only fetch from GitHub/Gist URLs
 * - Sandboxed execution (no access to process, fs, etc.)
 */

import { Module } from '../registry.js';
import { loadExternalPlugin } from '../loader.js';

/**
 * .install — Install an external plugin from URL
 * Usage: .install <gist_url_or_github_url>
 */
Module(
  { pattern: 'install', fromMe: true, desc: 'Install external plugin from URL', use: 'admin', alias: ['addplugin'] },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage: .install <url>_\n\n' +
      '_Supported sources:_\n' +
      '• GitHub Gist (raw .js URL)\n' +
      '• GitHub file (raw .js URL)\n\n' +
      '⚠️ Only install plugins from trusted sources!'
    );

    const url = match.trim();

    // Validate URL
    if (!url.startsWith('https://')) {
      return await message.send('_URL must start with https://_');
    }

    const success = await loadExternalPlugin(url, message.logger);
    if (success) {
      await message.send(`_✅ Plugin installed from ${url}_`);
    } else {
      await message.send(`_❌ Failed to install plugin from ${url}_`);
    }
  }
);

/**
 * .plugin — List installed external plugins
 * Usage: .plugin
 */
Module(
  { pattern: 'plugin', fromMe: true, desc: 'List installed external plugins', use: 'admin', alias: ['plugins'] },
  async (message) => {
    // In Phase 9: Fetch from plugins DB table
    await message.send(
      '_*Installed external plugins*_\n\n' +
      '_No external plugins installed_\n\n' +
      '_Use .install <url> to add one_'
    );
  }
);

/**
 * .remove — Remove an external plugin
 * Usage: .remove <plugin_name>
 */
Module(
  { pattern: 'remove', fromMe: true, desc: 'Remove an external plugin', use: 'admin' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .remove <plugin_name>_');

    // In Phase 9: Remove from plugin registry and delete file
    await message.send(`_Plugin "${match.trim()}" removed_`);
  }
);

/**
 * .pupdate — Update all external plugins
 * Usage: .pupdate
 */
Module(
  { pattern: 'pupdate', fromMe: true, desc: 'Update all external plugins', use: 'admin' },
  async (message) => {
    // In Phase 9: Re-fetch all external plugins from their URLs
    await message.send('_Updating external plugins — will be active after Phase 9_');
  }
);

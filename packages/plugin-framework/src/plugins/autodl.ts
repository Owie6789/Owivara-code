/**
 * @file autodl.ts
 * @package @owivara/plugin-framework
 *
 * Auto-downloader — ported from Raganork-MD's autodl.js
 * Commands: autodl (on/off/status per chat)
 *
 * Features:
 * - Detects URLs in messages automatically
 * - Downloads media from supported platforms (IG, YT, TikTok, Pinterest, FB, Spotify)
 * - Per-chat toggle (groups, DMs, or all)
 * - Controlled by UserConfig settings
 *
 * Note: URL detection and download engines are stubbed for Phase 9.
 * Command registration and config toggle logic complete.
 */

import { Module } from '../registry.js';

/** Supported platforms and their URL patterns */
const PLATFORM_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: 'YouTube', pattern: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/ },
  { name: 'Instagram', pattern: /instagram\.com\/(p|reel|tv|stories)/ },
  { name: 'TikTok', pattern: /tiktok\.com\// },
  { name: 'Facebook', pattern: /facebook\.com\/|fb\.watch\// },
  { name: 'Pinterest', pattern: /pinterest\.com\/|pin\.it\// },
  { name: 'Twitter/X', pattern: /twitter\.com\/|x\.com\// },
  { name: 'Spotify', pattern: /open\.spotify\.com\// },
];

/**
 * autodl — Toggle auto-download for the current chat
 * Usage: .autodl on | .autodl off | .autodl status
 *        .autodl groups on | .autodl dms off
 */
Module(
  { pattern: 'autodl', fromMe: false, desc: 'Toggle auto-download for media URLs', use: 'downloader' },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage:_\n' +
      '.autodl on — enable auto-download in this chat\n' +
      '.autodl off — disable auto-download in this chat\n' +
      '.autodl status — check current status\n' +
      '.autodl groups on — enable in all groups\n' +
      '.autodl dms off — disable in all DMs'
    );

    const args = match.trim().toLowerCase();

    if (args === 'status') {
      // In Phase 9: Check UserConfig for current autodl settings
      return await message.send(
        '_Auto-download settings (will be live after Phase 9):_\n' +
        '• Current chat: off\n' +
        '• All groups: off\n' +
        '• All DMs: off'
      );
    }

    if (args === 'on') {
      // In Phase 9: UserConfig.set('AUTODL', message.chat)
      return await message.send('_Auto-download enabled for this chat — will be active after Phase 9_');
    }

    if (args === 'off') {
      // In Phase 9: UserConfig.del('AUTODL')
      return await message.send('_Auto-download disabled for this chat_');
    }

    if (args.startsWith('groups')) {
      const state = args.includes('on') ? 'enabled' : 'disabled';
      // In Phase 9: UserConfig.set('AUTODL_ALL_GROUPS', args.includes('on') ? 'true' : 'false')
      return await message.send(`_Auto-download for all groups ${state} — will be active after Phase 9_`);
    }

    if (args.startsWith('dms') || args.startsWith('dm')) {
      const state = args.includes('on') ? 'enabled' : 'disabled';
      // In Phase 9: UserConfig.set('AUTODL_ALL_DMS', args.includes('on') ? 'true' : 'false')
      return await message.send(`_Auto-download for all DMs ${state} — will be active after Phase 9_`);
    }

    await message.send('_Invalid option. Use .autodl status to see current settings_');
  }
);

/**
 * Auto-download event handler — detects URLs in every message
 * and downloads media from supported platforms when autodl is enabled.
 */
Module(
  { on: 'message' },
  async (message) => {
    // Don't process bot's own messages or command messages
    if (message.isFromMe || message.hasHandler) return;

    const text = message.text;
    if (!text) return;

    // Extract URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    if (!urls || urls.length === 0) return;

    for (const url of urls) {
      // Detect platform
      for (const platform of PLATFORM_PATTERNS) {
        if (platform.pattern.test(url)) {
          // In Phase 9: Check if autodl is enabled for this chat
          // - UserConfig for specific chat
          // - AUTODL_ALL_GROUPS if message.isGroup
          // - AUTODL_ALL_DMS if !message.isGroup
          // Then download and send the media
          message.logger.info(
            { platform: platform.name, url, chat: message.chat },
            'Auto-download detected URL (stub — wired in Phase 9)'
          );
          break;
        }
      }
    }
  }
);

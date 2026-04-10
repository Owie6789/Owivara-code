/**
 * @file social.ts
 * @package @owivara/plugin-framework
 *
 * Social media downloaders — ported from Raganork-MD's social.js
 * Commands: insta, fb, ig, story, pinterest, tiktok
 *
 * Supported platforms:
 * - Instagram: posts, reels, stories, IGTV
 * - Facebook: videos, reels
 * - TikTok: videos (with watermark removal)
 * - Pinterest: images, videos
 *
 * Note: Actual downloading uses platform-specific APIs/scrapers.
 * Command registration and URL detection complete. Engines wired in Phase 9.
 */

import { Module } from '../registry.js';

/** Extract URL from message text */
function extractUrl(text: string): string | undefined {
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
  return urlMatch ? urlMatch[1] : undefined;
}

/**
 * .insta — Download Instagram post/reel/IGTV
 * Usage: .insta <post_url> or reply to message with URL
 */
Module(
  { pattern: 'insta', fromMe: false, desc: 'Download Instagram post/reel', use: 'downloader', alias: ['ig'] },
  async (message, match) => {
    const url = match || extractUrl(message.text || '');
    if (!url) return await message.send('_Usage: .insta <instagram_url> or reply to a message with URL_');

    if (!url.includes('instagram.com')) {
      return await message.send('_Please provide a valid Instagram URL_');
    }

    // In Phase 9: Use downloadGram or similar API to fetch media
    await message.send(`_Downloading from Instagram — will be available after Phase 9_`);
  }
);

/**
 * .fb — Download Facebook video
 * Usage: .fb <video_url> or reply to message with URL
 */
Module(
  { pattern: 'fb', fromMe: false, desc: 'Download Facebook video', use: 'downloader', alias: ['facebook'] },
  async (message, match) => {
    const url = match || extractUrl(message.text || '');
    if (!url) return await message.send('_Usage: .fb <facebook_video_url>_');

    if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
      return await message.send('_Please provide a valid Facebook URL_');
    }

    // In Phase 9: Use fb() API to download video
    await message.send(`_Downloading Facebook video — will be available after Phase 9_`);
  }
);

/**
 * .tiktok — Download TikTok video (no watermark)
 * Usage: .tiktok <video_url>
 */
Module(
  { pattern: 'tiktok', fromMe: false, desc: 'Download TikTok video (no watermark)', use: 'downloader', alias: ['tk'] },
  async (message, match) => {
    const url = match || extractUrl(message.text || '');
    if (!url) return await message.send('_Usage: .tiktok <tiktok_video_url>_');

    if (!url.includes('tiktok.com')) {
      return await message.send('_Please provide a valid TikTok URL_');
    }

    // In Phase 9: Use tiktok() API to download without watermark
    await message.send(`_Downloading TikTok video (no watermark) — will be available after Phase 9_`);
  }
);

/**
 * .pinterest — Search and download from Pinterest
 * Usage: .pinterest <search_query>
 */
Module(
  { pattern: 'pinterest', fromMe: false, desc: 'Search Pinterest images', use: 'downloader', alias: ['pin'] },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .pinterest <search query>_');

    // In Phase 9: Use pinterestSearch() to find and download images
    await message.send(`_Pinterest search for "${match}" — will be available after Phase 9_`);
  }
);

/**
 * .story — Download Instagram story
 * Usage: .story <username> or .story <story_url>
 */
Module(
  { pattern: 'story', fromMe: false, desc: 'Download Instagram story', use: 'downloader' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .story <username> or .story <story_url>_');

    // In Phase 9: Use story() API to download user's stories
    await message.send(`_Instagram story download for "${match}" — will be available after Phase 9_`);
  }
);

/**
 * .igstalk — Stalk an Instagram profile
 * Usage: .igstalk <username>
 */
Module(
  { pattern: 'igstalk', fromMe: false, desc: 'View Instagram profile info', use: 'downloader' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .igstalk <username>_');

    // In Phase 9: Use igStalk() to fetch profile info
    await message.send(`_Instagram stalk for "${match}" — will be available after Phase 9_`);
  }
);

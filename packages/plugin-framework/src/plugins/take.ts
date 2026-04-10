/**
 * @file take.ts
 * @package @owivara/plugin-framework
 *
 * Sticker pack editor — ported from Raganork-MD's take.js
 * Commands: take, mp4, url
 *
 * - take: Change sticker pack name and author
 * - mp4: Convert animated sticker to video
 * - url: Upload media to ImgBB/Catbox for shareable URL
 */

import { Module } from '../registry.js';

/**
 * .take — Change sticker pack metadata
 * Usage: .take <packname>|<authorname>
 */
Module(
  { pattern: 'take', fromMe: false, desc: 'Change sticker pack name and author', use: 'sticker' },
  async (message, match) => {
    if (!message.quoted) return await message.send('_Reply to a sticker_');
    if (!message.quoted.hasSticker) return await message.send('_Please reply to a sticker_');
    if (!match) return await message.send('_Usage: .take <packname>|<authorname>_');

    const parts = match.split('|');
    const packname = parts[0]?.trim() || 'Owivara';
    const author = parts[1]?.trim() || 'Owivara Bot';

    // In Phase 9: Download sticker → modify EXIF metadata → re-upload
    await message.send(`_Take: pack="${packname}", author="${author}" — requires FFmpeg in Phase 9_`);
  }
);

/**
 * .mp4 — Convert animated sticker to video
 * Usage: Reply to animated sticker
 */
Module(
  { pattern: 'mp4', fromMe: false, desc: 'Convert animated sticker to video', use: 'sticker' },
  async (message) => {
    if (!message.quoted) return await message.send('_Reply to an animated sticker_');
    if (!message.quoted.hasSticker) return await message.send('_Please reply to a sticker_');

    // In Phase 9: WebP animated → MP4 via FFmpeg
    await message.send('_Sticker to MP4 requires FFmpeg — will be available after Phase 9_');
  }
);

/**
 * .url — Upload media to cloud and get shareable URL
 * Usage: Reply to image/video/audio
 */
Module(
  { pattern: 'url', fromMe: false, desc: 'Upload media and get URL', use: 'sticker' },
  async (message) => {
    if (!message.quoted) return await message.send('_Reply to media_');
    if (!message.quoted.hasImage && !message.quoted.hasVideo && !message.quoted.hasAudio && !message.quoted.hasDocument) {
      return await message.send('_Please reply to an image, video, audio, or document_');
    }

    // In Phase 9: Upload to ImgBB (images) or Catbox (video/audio/docs)
    await message.send('_Media upload requires ImgBB or Catbox API key — set in Phase 9_');
  }
);

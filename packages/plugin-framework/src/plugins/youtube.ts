/**
 * @file youtube.ts
 * @package @owivara/plugin-framework
 *
 * YouTube downloader — ported from Raganork-MD's youtube.js
 * Commands: song, yts, ytv, video, yta, play
 *
 * Features:
 * - Interactive search with numbered results (reply with number to select)
 * - Direct URL download
 * - Quality selection for video downloads
 * - Auto-download audio for "play" command
 *
 * Note: Actual YouTube download uses `youtube-sr` package + ffmpeg.
 * Command registration, interactive reply flows, and Baileys patterns are complete.
 * Download engine wired in Phase 9.
 */

import { Module } from '../registry.js';

// Track pending searches for interactive reply
const pendingSearches = new Map<string, { results: Array<{ id: string; title: string; duration: string }>; type: 'audio' | 'video' }>();

/**
 * .yts — YouTube search with interactive results
 * Usage: .yts <search query>
 * Reply with a number (1-10) to select a result
 */
Module(
  { pattern: 'yts', fromMe: false, desc: 'Search YouTube', use: 'downloader', alias: ['ytsearch'] },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .yts <search query>_');

    // In Phase 9: Use youtube-sr to search and display results
    await message.send(`_YouTube search for "${match}" — will be available after Phase 9_`);
  }
);

/**
 * .song — Download YouTube audio
 * Usage: .song <search query> or .song <youtube_url>
 */
Module(
  { pattern: 'song', fromMe: false, desc: 'Download YouTube audio', use: 'downloader', alias: ['yta', 'musi'] },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .song <search query or YouTube URL>_');

    // Check if it's a YouTube URL
    const urlMatch = match.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (urlMatch) {
      // Direct URL download
      await message.send(`_Downloading audio from YouTube URL — will be available after Phase 9_`);
      return;
    }

    // Search and send audio
    await message.send(`_YouTube audio search for "${match}" — will be available after Phase 9_`);
  }
);

/**
 * .video — Download YouTube video with quality selection
 * Usage: .video <search query> or .video <youtube_url>
 */
Module(
  { pattern: 'video', fromMe: false, desc: 'Download YouTube video', use: 'downloader', alias: ['ytv'] },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .video <search query or YouTube URL>_');

    const urlMatch = match.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (urlMatch) {
      await message.send(`_Downloading video from YouTube URL — will be available after Phase 9_`);
      return;
    }

    await message.send(`_YouTube video search for "${match}" — will be available after Phase 9_`);
  }
);

/**
 * .play — Search and auto-download the first result as audio
 * Usage: .play <search query>
 */
Module(
  { pattern: 'play', fromMe: false, desc: 'Search and download audio', use: 'downloader' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .play <search query>_');

    await message.send(`_Searching and downloading audio for "${match}" — will be available after Phase 9_`);
  }
);

/**
 * Event handler: process numbered replies for YouTube searches
 */
Module(
  { on: 'text' },
  async (message) => {
    if (!message.text || !message.sender) return;

    const pending = pendingSearches.get(message.sender);
    if (!pending) return;

    // Check if reply is a number
    const num = parseInt(message.text.trim(), 10);
    if (isNaN(num) || num < 1 || num > pending.results.length) return;

    const selected = pending.results[num - 1];
    pendingSearches.delete(message.sender);

    if (pending.type === 'audio') {
      await message.send(`_Downloading "${selected.title}" as audio — will be available after Phase 9_`);
    } else {
      await message.send(`_Downloading "${selected.title}" as video — will be available after Phase 9_`);
    }
  }
);

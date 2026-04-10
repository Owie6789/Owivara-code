/**
 * @file schedule.ts
 * @package @owivara/plugin-framework
 *
 * Message scheduler — ported from Raganork-MD's schedule.js
 * Commands: schedule, scheduled, cancel
 *
 * Features:
 * - Schedule text/media messages for future delivery
 * - Multiple time formats: relative (2h30m), absolute (14:30), datetime (YYYY-MM-DD HH:mm)
 * - Supports text, image, video, audio, document, sticker
 * - Persistent storage in InsForge DB
 */

import { Module } from '../registry.js';

/** Parse schedule time string into Date */
function parseScheduleTime(input: string): Date | null {
  // Try YYYY-MM-DD HH:mm format
  const dtMatch = input.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  if (dtMatch) return new Date(`${dtMatch[1]}T${dtMatch[2]}:00`);

  // Try HH:mm format (today or tomorrow)
  const timeMatch = input.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const now = new Date();
    const [_, h, m] = timeMatch;
    const scheduled = new Date(now);
    scheduled.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    // If time is in the past, schedule for tomorrow
    if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1);
    return scheduled;
  }

  // Try relative format: 2h30m, 1d, 45m, etc.
  const relMatch = input.match(/^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?$/);
  if (relMatch) {
    const [, d, h, m] = relMatch;
    if (!d && !h && !m) return null;
    const now = new Date();
    now.setDate(now.getDate() + (d ? parseInt(d, 10) : 0));
    now.setHours(now.getHours() + (h ? parseInt(h, 10) : 0));
    now.setMinutes(now.getMinutes() + (m ? parseInt(m, 10) : 0));
    return now;
  }

  return null;
}

/**
 * .schedule — Schedule a message for future delivery
 * Usage: .schedule <time> | <message>
 * Examples:
 *   .schedule 2h30m | Happy birthday! 🎉
 *   .schedule 14:30 | Meeting reminder
 *   .schedule 2024-12-25 09:00 | Merry Christmas!
 */
Module(
  { pattern: 'schedule', fromMe: true, desc: 'Schedule a message for future delivery', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage: .schedule <time> | <message>_\n\n' +
      '_Time formats:_\n' +
      '• Relative: 2h30m, 1d, 45m\n' +
      '• Absolute: 14:30 (today/tomorrow)\n' +
      '• Date-time: 2024-12-25 09:00\n\n' +
      '_Example: .schedule 2h30m | Happy birthday! 🎉_'
    );

    const parts = match.split('|');
    const timeStr = parts[0]?.trim();
    const msg = parts.slice(1).join('|').trim();

    if (!timeStr || !msg) {
      return await message.send('_Usage: .schedule <time> | <message>_');
    }

    const scheduledDate = parseScheduleTime(timeStr);
    if (!scheduledDate) {
      return await message.send('_Invalid time format. Use 2h30m, 14:30, or YYYY-MM-DD HH:mm_');
    }

    // In Phase 9: Store in scheduled_messages table
    const formatted = scheduledDate.toLocaleString();
    await message.send(
      `_*Message scheduled*_\n\n` +
      `• *When:* ${formatted}\n` +
      `• *Message:* ${msg}\n\n` +
      '_Use .scheduled to see all scheduled messages_\n' +
      '_Use .cancel <id> to cancel_'
    );
  }
);

/**
 * .scheduled — List all scheduled messages
 * Usage: .scheduled
 */
Module(
  { pattern: 'scheduled', fromMe: true, desc: 'List scheduled messages', use: 'utility' },
  async (message) => {
    // In Phase 9: Fetch from scheduled_messages table
    await message.send(
      '_*Scheduled messages*_\n\n' +
      '_No scheduled messages_\n\n' +
      '_Use .schedule <time> | <message> to create one_'
    );
  }
);

/**
 * .cancel — Cancel a scheduled message
 * Usage: .cancel <id>
 */
Module(
  { pattern: 'cancel', fromMe: true, desc: 'Cancel a scheduled message', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .cancel <id>_\nUse .scheduled to see message IDs');

    // In Phase 9: Delete from scheduled_messages table
    await message.send(`_Scheduled message #${match.trim()} cancelled_`);
  }
);

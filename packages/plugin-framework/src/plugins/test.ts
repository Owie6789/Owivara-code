/**
 * @file test.ts
 * @package @owivara/plugin-framework
 *
 * Test/debug commands — ported from Raganork-MD's test.js
 * Commands: ping, age, cntd
 *
 * - ping: Check bot latency
 * - age: Calculate age from date of birth
 * - cntd: Countdown to a future date
 */

import { Module } from '../registry.js';

/**
 * .ping — Check bot latency
 * Usage: .ping
 */
Module(
  { pattern: 'ping', fromMe: false, desc: 'Check bot latency', use: 'utility', alias: ['speed', 'pong'] },
  async (message) => {
    const start = Date.now();
    await message.send('_Pinging..._');
    const end = Date.now();
    const latency = end - start;

    await message.send(
      `_*🏓 Pong!*_\n\n` +
      `• Latency: ${latency}ms\n` +
      `• Uptime: ${getUptime()}\n` +
      `• RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`
    );
  }
);

/**
 * .age — Calculate age from date of birth
 * Usage: .age YYYY-MM-DD
 */
Module(
  { pattern: 'age', fromMe: false, desc: 'Calculate age from DOB', use: 'utility' },
  async (message, match) => {
    if (!match) return message.send('_Usage: .age YYYY-MM-DD_');

    const dob = new Date(match.trim());
    if (isNaN(dob.getTime())) return message.send('_Invalid date. Use YYYY-MM-DD_');

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;

    const days = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = age * 12 + monthDiff;

    message.send(
      `_*🎂 Age Calculator*_\n\n` +
      `• *DOB:* ${dob.toLocaleDateString()}\n` +
      `• *Age:* ${age} years\n` +
      `• *Months:* ~${months}\n` +
      `• *Weeks:* ~${weeks.toLocaleString()}\n` +
      `• *Days:* ~${days.toLocaleString()}`
    );
  }
);

/**
 * .cntd — Countdown to a future date
 * Usage: .cntd YYYY-MM-DD | event name
 */
Module(
  { pattern: 'cntd', fromMe: false, desc: 'Countdown to a date', use: 'utility' },
  async (message, match) => {
    if (!match) return message.send('_Usage: .cntd YYYY-MM-DD | event name_');

    const parts = match.split('|');
    const dateStr = parts[0]?.trim();
    const eventName = parts[1]?.trim() || 'Event';

    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return message.send('_Invalid date. Use YYYY-MM-DD_');

    const now = new Date();
    if (target <= now) return message.send('_That date is in the past!_');

    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    message.send(
      `_*⏳ Countdown*_\n\n` +
      `• *Event:* ${eventName}\n` +
      `• *Date:* ${target.toLocaleDateString()}\n` +
      `• *Remaining:* ${days}d ${hours}h ${minutes}m ${seconds}s`
    );
  }
);

function getUptime(): string {
  const s = Math.floor(process.uptime());
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}



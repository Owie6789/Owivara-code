/**
 * @file filter.ts
 * @package @owivara/plugin-framework
 *
 * Keyword filter/auto-reply — ported from Raganork-MD's filter.js
 * Commands: filter, filters, delfilter, togglefilter, testfilter, filterhelp
 *
 * Features:
 * - Auto-reply when specific keywords are detected
 * - Scopes: chat (current chat), global (all), group, dm
 * - Case-sensitive and exact-match options
 * - Enable/disable individual filters
 */

import { Module } from '../registry.js';

/** In-memory filter cache */
const filterCache = new Map<string, { response: string; enabled: boolean; caseSensitive: boolean; exactMatch: boolean }>();

/**
 * .filter — Add or check a filter
 * Usage: .filter <keyword> -> <response>
 * Example: .filter hello -> Hey there! 👋
 */
Module(
  { pattern: 'filter', fromMe: false, desc: 'Add or check keyword filter', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage:_\n' +
      '.filter <keyword> -> <response> — add a filter\n' +
      '.filter <keyword> — check a filter\n' +
      '.filter list — list all filters\n\n' +
      '_Example: .filter hello -> Hey there! 👋_'
    );

    if (match.toLowerCase() === 'list') {
      if (filterCache.size === 0) {
        return await message.send('_No filters set. Use .filter <keyword> -> <response> to add one_');
      }

      let text = '_*Active filters*_\n\n';
      for (const [trigger, data] of filterCache) {
        const status = data.enabled ? '✅' : '❌';
        text += `${status} \`${trigger}\` → ${data.response}\n`;
      }
      return await message.send(text);
    }

    const parts = match.split('->');
    const keyword = parts[0]?.trim();

    if (parts.length === 1) {
      // Check filter
      const data = filterCache.get(keyword);
      if (!data) return await message.send(`_No filter for "${keyword}"_`);
      return await message.send(`_Filter:_ \`${keyword}\` → ${data.response}`);
    }

    // Add filter
    const response = parts.slice(1).join('->').trim();
    if (!response) return await message.send('_Provide a response: .filter <keyword> -> <response>_');

    filterCache.set(keyword, { response, enabled: true, caseSensitive: false, exactMatch: false });
    await message.send(`_*Filter added*_\n\n• \`${keyword}\` → ${response}`);
  }
);

/**
 * .filters — List all filters
 */
Module(
  { pattern: 'filters', fromMe: false, desc: 'List all filters', use: 'utility' },
  async (message) => {
    if (filterCache.size === 0) {
      return await message.send('_No filters set_');
    }

    let text = '_*All filters*_\n\n';
    for (const [trigger, data] of filterCache) {
      const status = data.enabled ? '✅' : '❌';
      const cs = data.caseSensitive ? ' (case-sensitive)' : '';
      const em = data.exactMatch ? ' (exact match)' : '';
      text += `${status} \`${trigger}\`${cs}${em} → ${data.response.substring(0, 50)}\n`;
    }
    await message.send(text);
  }
);

/**
 * .delfilter — Delete a filter
 * Usage: .delfilter <keyword>
 */
Module(
  { pattern: 'delfilter', fromMe: false, desc: 'Delete a filter', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .delfilter <keyword>_');
    const keyword = match.trim();

    if (!filterCache.has(keyword)) {
      return await message.send(`_No filter for "${keyword}"_`);
    }

    filterCache.delete(keyword);
    await message.send(`_Filter "${keyword}" deleted_`);
  }
);

/**
 * .togglefilter — Enable/disable a filter
 * Usage: .togglefilter <keyword>
 */
Module(
  { pattern: 'togglefilter', fromMe: false, desc: 'Toggle filter on/off', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .togglefilter <keyword>_');
    const keyword = match.trim();
    const data = filterCache.get(keyword);
    if (!data) return await message.send(`_No filter for "${keyword}"_`);

    data.enabled = !data.enabled;
    await message.send(`_Filter "${keyword}" ${data.enabled ? 'enabled' : 'disabled'}_`);
  }
);

/**
 * .testfilter — Test if a keyword triggers a filter
 * Usage: .testfilter <text>
 */
Module(
  { pattern: 'testfilter', fromMe: false, desc: 'Test a filter match', use: 'utility' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .testfilter <text>_');
    const text = match.trim();

    for (const [keyword, data] of filterCache) {
      if (!data.enabled) continue;
      const searchText = data.caseSensitive ? text : text.toLowerCase();
      const searchKey = data.caseSensitive ? keyword : keyword.toLowerCase();

      if (data.exactMatch) {
        if (searchText === searchKey) {
          return await message.send(`_✅ Match: \`${keyword}\` → ${data.response}_`);
        }
      } else {
        if (searchText.includes(searchKey)) {
          return await message.send(`_✅ Match: \`${keyword}\` → ${data.response}_`);
        }
      }
    }

    await message.send(`_❌ No filter matches "${text}"_`);
  }
);

/**
 * .filterhelp — Show filter help
 */
Module(
  { pattern: 'filterhelp', fromMe: false, desc: 'Show filter help', use: 'utility' },
  async (message) => {
    await message.send(
      '_*Filter Help*_\n\n' +
      '• `.filter <keyword> -> <response>` — Add a filter\n' +
      '• `.filter <keyword>` — Check a filter\n' +
      '• `.filter list` — List all filters\n' +
      '• `.filters` — List with details\n' +
      '• `.delfilter <keyword>` — Delete a filter\n' +
      '• `.togglefilter <keyword>` — Enable/disable\n' +
      '• `.testfilter <text>` — Test a match\n\n' +
      '_Options (when adding):\n' +
      '• Case-sensitive: use exact casing\n' +
      '• Exact match: use full word match_'
    );
  }
);

/**
 * Filter event handler — auto-replies when keywords are detected
 */
Module(
  { on: 'text' },
  async (message) => {
    if (message.isFromMe || !message.text) return;

    const text = message.text;
    for (const [keyword, data] of filterCache) {
      if (!data.enabled) continue;
      const searchText = data.caseSensitive ? text : text.toLowerCase();
      const searchKey = data.caseSensitive ? keyword : keyword.toLowerCase();

      if (data.exactMatch) {
        if (searchText === searchKey) {
          await message.send(data.response);
          return;
        }
      } else {
        if (searchText.includes(searchKey)) {
          await message.send(data.response);
          return;
        }
      }
    }
  }
);

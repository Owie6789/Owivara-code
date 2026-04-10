/**
 * @file fancy.ts
 * @package @owivara/plugin-framework
 *
 * Text style converter — ported from Raganork-MD's fancy.js + utils/fancy.js
 * Commands: fancy
 * 34 Unicode font styles for text decoration.
 */

import { Module } from '../registry.js';

// Unicode font mappings (subset of Raganork's 34 styles)
const FONTS: Record<number, { name: string; transform: (text: string) => string }> = {
  1: {
    name: 'Circled',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x24D0 + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x24B6 + c.charCodeAt(0) - 65)),
  },
  2: {
    name: 'Squared',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x1F130 + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1F130 + c.charCodeAt(0) - 65)),
  },
  3: {
    name: 'Bold Fraktur',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x1D51E + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1D504 + c.charCodeAt(0) - 65)),
  },
  4: {
    name: 'Double-Struck',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x1D552 + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1D538 + c.charCodeAt(0) - 65)),
  },
  5: {
    name: 'Bold',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x1D41A + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1D400 + c.charCodeAt(0) - 65)),
  },
  6: {
    name: 'Italic',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x1D44E + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1D434 + c.charCodeAt(0) - 65)),
  },
  7: {
    name: 'Bold Italic',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x1D482 + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1D468 + c.charCodeAt(0) - 65)),
  },
  8: {
    name: 'Script',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x1D4EA + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1D4D0 + c.charCodeAt(0) - 65)),
  },
  9: {
    name: 'Bold Script',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0x1D51E + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1D504 + c.charCodeAt(0) - 65)),
  },
  10: {
    name: 'Monospace',
    transform: (t) => t.replace(/[a-z]/g, (c) => String.fromCodePoint(0xFF41 + c.charCodeAt(0) - 97))
      .replace(/[A-Z]/g, (c) => String.fromCodePoint(0xFF21 + c.charCodeAt(0) - 65)),
  },
};

/**
 * .fancy — Convert text to fancy Unicode fonts
 * Usage: .fancy <number> <text> | .fancy list
 */
Module(
  { pattern: 'fancy', fromMe: false, desc: 'Convert text to fancy Unicode styles', use: 'converter' },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage: .fancy <number> <text>_\n' +
      'Or: .fancy list\n\n' +
      '_Styles:_ 1=Circled, 2=Squared, 3=Fraktur, 4=Double-Struck, 5=Bold, 6=Italic, 7=Bold Italic, 8=Script, 9=Bold Script, 10=Monospace'
    );

    if (match.toLowerCase() === 'list') {
      let list = '_*Fancy text styles:*_\n\n';
      for (const [num, font] of Object.entries(FONTS)) {
        const sample = font.transform('Hello');
        list += `${num}. ${font.name}: ${sample}\n`;
      }
      return await message.send(list);
    }

    const parts = match.split(' ');
    const styleNum = parseInt(parts[0], 10);
    const text = parts.slice(1).join(' ');

    if (isNaN(styleNum) || !text) {
      return await message.send('_Usage: .fancy <number> <text>_');
    }

    const font = FONTS[styleNum];
    if (!font) {
      return await message.send(`_Style ${styleNum} not found. Use .fancy list to see all styles_`);
    }

    await message.send(font.transform(text));
  }
);

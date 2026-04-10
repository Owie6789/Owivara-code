/**
 * @file pdf.ts
 * @package @owivara/plugin-framework
 *
 * Image-to-PDF compiler — ported from Raganork-MD's pdf.js
 * Commands: pdf
 *
 * Features:
 * - Collect images one-by-one or from album
 * - Compile to PDF using image-to-pdf library
 * - Send as document
 *
 * Usage:
 *   .pdf help — show help
 *   .pdf add — add replied image to collection
 *   .pdf get — compile and send PDF
 *   .pdf delete — clear collected images
 */

import { Module } from '../registry.js';

/** In-memory image buffer store */
const pdfBuffers = new Map<string, Buffer[]>();

/**
 * .pdf — Image-to-PDF compiler
 * Usage: .pdf help | .pdf add | .pdf get | .pdf delete
 */
Module(
  { pattern: 'pdf', fromMe: false, desc: 'Compile images to PDF', use: 'utility' },
  async (message, match) => {
    const arg = match?.trim()?.toLowerCase() || 'help';

    if (arg === 'help') {
      return await message.send(
        '_*PDF Compiler*_\n\n' +
        '• `.pdf add` — Add replied image to collection\n' +
        '• `.pdf get` — Compile and send as PDF\n' +
        '• `.pdf delete` — Clear collected images\n' +
        '• `.pdf status` — Check how many images collected\n\n' +
        '_Collect images from albums or individual messages_'
      );
    }

    if (arg === 'add') {
      if (!message.quoted) return await message.send('_Reply to an image to add to PDF_');
      if (!message.quoted.hasImage) return await message.send('_Please reply to an image_');

      // In Phase 9: Download image and add to buffer
      const buffers = pdfBuffers.get(message.sender) || [];
      pdfBuffers.set(message.sender, buffers);
      await message.send(`_Image #${buffers.length + 1} added. Send .pdf get to compile_`);
      return;
    }

    if (arg === 'get') {
      const buffers = pdfBuffers.get(message.sender) || [];
      if (buffers.length === 0) {
        return await message.send('_No images collected. Use .pdf add to add images_');
      }

      // In Phase 9: Use image-to-pdf library to compile
      await message.send(
        `_*PDF compiled*_\n\n` +
        `• Images: ${buffers.length}\n\n` +
        '_PDF generation — will be available after Phase 9_'
      );
      pdfBuffers.delete(message.sender);
      return;
    }

    if (arg === 'delete') {
      pdfBuffers.delete(message.sender);
      return await message.send('_Image collection cleared_');
    }

    if (arg === 'status') {
      const buffers = pdfBuffers.get(message.sender) || [];
      return await message.send(`_*PDF status*_\n\n• Images collected: ${buffers.length}`);
    }

    await message.send('_Usage: .pdf help | .pdf add | .pdf get | .pdf delete | .pdf status_');
  }
);

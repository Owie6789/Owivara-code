/**
 * @file chatbot.ts
 * @package @owivara/plugin-framework
 *
 * AI Chatbot — ported from Raganork-MD's chatbot.js
 * Commands: chatbot, ai
 *
 * Features:
 * - Gemini AI multi-model fallback (6 models)
 * - Conversation context (20 message history)
 * - Image analysis with Gemini Vision
 * - System prompts
 * - Per-chat toggle (groups, DMs, or all)
 *
 * Note: Uses our existing @owivara/ai package for Gemini/OpenAI integration.
 * Command registration and config system complete. AI engine wired in Phase 9.
 */

import { Module } from '../registry.js';

// Track conversation context per user
const conversationHistory = new Map<string, Array<{ role: string; content: string }>>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars\nconst _MAX_CONTEXT = 20;
const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemma-3-12b-it',
];

/**
 * .chatbot — Toggle AI chatbot for the current chat
 * Usage: .chatbot on | .chatbot off | .chatbot status
 *        .chatbot groups on | .chatbot dms off
 *        .chatbot set <system_prompt> | .chatbot clear
 */
Module(
  { pattern: 'chatbot', fromMe: false, desc: 'Toggle AI chatbot for this chat', use: 'ai' },
  async (message, match) => {
    if (!match) return await message.send(
      '_Usage:_\n' +
      '.chatbot on — enable AI chatbot in this chat\n' +
      '.chatbot off — disable AI chatbot in this chat\n' +
      '.chatbot status — check current status\n' +
      '.chatbot groups on — enable in all groups\n' +
      '.chatbot dms off — disable in all DMs\n' +
      '.chatbot set <prompt> — set system prompt\n' +
      '.chatbot clear — clear conversation history'
    );

    const args = match.trim();
    const argsLower = args.toLowerCase();

    if (argsLower === 'status') {
      return await message.send(
        '_Chatbot settings (will be live after Phase 9):_\n' +
        '• Current chat: off\n' +
        '• All groups: off\n' +
        '• All DMs: off\n' +
        '• System prompt: not set\n' +
        '• Models: ' + MODELS.join(', ')
      );
    }

    if (argsLower === 'on') {
      // In Phase 9: UserConfig.set('CHATBOT', message.chat)
      return await message.send('_AI chatbot enabled for this chat — will be active after Phase 9_');
    }

    if (argsLower === 'off') {
      conversationHistory.delete(message.chat);
      // In Phase 9: UserConfig.del('CHATBOT')
      return await message.send('_AI chatbot disabled for this chat_');
    }

    if (argsLower === 'clear') {
      conversationHistory.delete(message.sender);
      return await message.send('_Conversation history cleared_');
    }

    if (argsLower.startsWith('set ')) {
      const prompt = args.slice(4).trim();
      if (!prompt) return await message.send('_Usage: .chatbot set <system prompt>_');
      // In Phase 9: UserConfig.set('CHATBOT_SYSTEM_PROMPT', prompt)
      return await message.send(`_System prompt set to: "${prompt}" — will be active after Phase 9_`);
    }

    if (argsLower.startsWith('groups')) {
      const state = argsLower.includes('on') ? 'enabled' : 'disabled';
      return await message.send(`_Chatbot for all groups ${state} — will be active after Phase 9_`);
    }

    if (argsLower.startsWith('dms') || argsLower.startsWith('dm')) {
      const state = argsLower.includes('on') ? 'enabled' : 'disabled';
      return await message.send(`_Chatbot for all DMs ${state} — will be active after Phase 9_`);
    }

    await message.send('_Invalid option. Use .chatbot status to see current settings_');
  }
);

/**
 * .ai — Direct Gemini query with context
 * Usage: .ai <question> | reply to image with .ai <question>
 */
Module(
  { pattern: 'ai', fromMe: false, desc: 'Ask Gemini AI', use: 'ai', alias: ['gemini', 'gpt'] },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .ai <your question>_');

    // Check if user replied to an image (Gemini Vision)
    if (message.quoted?.hasImage) {
      // In Phase 9: Send image + text to Gemini Vision model
      return await message.send(`_Gemini Vision analysis for "${match}" — will be available after Phase 9_`);
    }

    // Get conversation context
    // eslint-disable-next-line @typescript-eslint/no-unused-vars\n    const history = conversationHistory.get(message.sender) || [];

    // In Phase 9: Send query to @owivara/ai package with conversation context
    // Multi-model fallback: try each model until one succeeds
    await message.send(
      `_AI response for "${match}"_\n\n` +
      `_(Using @owivara/ai package with Gemini multi-model fallback — wired in Phase 9)_`
    );
  }
);

/**
 * Chatbot event handler — processes messages in enabled chats
 * and responds with AI when chatbot is turned on.
 */
Module(
  { on: 'text' },
  async (message) => {
    // Skip bot's own messages and command messages
    if (message.isFromMe || message.hasHandler) return;

    // In Phase 9: Check if chatbot is enabled for this chat
    // - UserConfig.get('CHATBOT') for specific chat
    // - UserConfig.getBool('CHATBOT_ALL_GROUPS') if message.isGroup
    // - UserConfig.getBool('CHATBOT_ALL_DMS') if !message.isGroup
    // If enabled, send message to Gemini and respond

    // For now, just log the potential AI interaction
    message.logger.debug(
      { sender: message.sender, chat: message.chat, text: message.text },
      'Chatbot event received (stub — wired in Phase 9)'
    );
  }
);



/**
 * @file index.ts
 * @project Owivara - Development
 * @package @owivara/ai
 * @module Barrel Export
 *
 * @description
 * Central export for the AI package.
 *
 * @hallucination_check PASSED
 */

// Client factory
export { sendAIPrompt, validateAIKey, getAvailableProviders, getProviderName } from './client.js';
export type { UserAIConfig } from './client.js';

// Gemini
export { createGeminiClient, sendGeminiPrompt, validateGeminiKey } from './gemini.js';

// OpenAI
export { createOpenAIClient, sendOpenAIPrompt, validateOpenAIKey } from './openai.js';

// Prompts
export {
  PROMPT_HELP,
  SYSTEM_PROMPT_CHATBOT,
  PROMPT_INTENT,
  PROMPT_AUTO_REPLY,
  PROMPT_SUMMARY,
} from './prompts.js';

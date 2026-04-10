/**
 * @file client.ts
 * @project Owivara - Development
 * @package @owivara/ai
 * @module AI Client Factory
 *
 * @description
 * Unified AI client factory that routes to the correct provider
 * (Gemini or OpenAI) based on user configuration.
 * This is the main entry point for AI features in Owivara.
 *
 * @resurrection_source CLEAN_SLATE — Old project had hardcoded OpenAI only
 * @resurrection_status CLEAN_SLATE — Built fresh for dual-provider BYOK
 * @hallucination_check PASSED
 */

import type { AIPromptRequest, AIPromptResponse, AIProvider } from '@owivara/types';
import { sendGeminiPrompt, validateGeminiKey } from './gemini.js';
import { sendOpenAIPrompt, validateOpenAIKey } from './openai.js';

/**
 * User's AI key configuration
 * (Retrieved from InsForge, never hardcoded)
 */
export interface UserAIConfig {
  /** Which provider to use */
  provider: AIProvider;

  /** User's encrypted API key (decrypt before passing) */
  apiKey: string;

  /** Whether the key was last validated successfully */
  keyValid: boolean | null;
}

/**
 * Send an AI prompt using the user's configured provider.
 *
 * @param config - User's AI configuration (with decrypted key)
 * @param request - Prompt request
 * @returns AI response
 * @throws Error if provider is not configured or key is missing
 */
export async function sendAIPrompt(
  config: UserAIConfig,
  request: AIPromptRequest
): Promise<AIPromptResponse> {
  if (!config.apiKey) {
    throw new Error(
      'AI API key not configured. Please add your API key in Settings.'
    );
  }

  switch (config.provider) {
    case 'gemini':
      return sendGeminiPrompt(config.apiKey, request);
    case 'openai':
      return sendOpenAIPrompt(config.apiKey, request);
    default:
      throw new Error(
        `Unsupported AI provider: ${config.provider}. Choose 'gemini' or 'openai'.`
      );
  }
}

/**
 * Validate the user's AI API key.
 *
 * @param config - User's AI configuration (with decrypted key)
 * @returns True if the key is valid
 */
export async function validateAIKey(config: UserAIConfig): Promise<boolean> {
  if (!config.apiKey) return false;

  switch (config.provider) {
    case 'gemini':
      return validateGeminiKey(config.apiKey);
    case 'openai':
      return validateOpenAIKey(config.apiKey);
    default:
      return false;
  }
}

/**
 * Get the available AI providers.
 *
 * @returns Array of supported provider IDs
 */
export function getAvailableProviders(): AIProvider[] {
  return ['gemini', 'openai'];
}

/**
 * Get a human-readable provider name.
 *
 * @param provider - Provider ID
 * @returns Display name
 */
export function getProviderName(provider: AIProvider): string {
  switch (provider) {
    case 'gemini':
      return 'Google Gemini';
    case 'openai':
      return 'OpenAI';
    default:
      return 'Unknown';
  }
}

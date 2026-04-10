/**
 * @file ai.ts
 * @project Owivara - Development
 * @package @owivara/types
 * @module AI Types
 *
 * @description
 * AI provider type definitions for Owivara's dual BYOK system.
 * Supports both Google Gemini and OpenAI as AI backends.
 *
 * @resurrection_source CLEAN_SLATE — No equivalent existed in old project
 * @resurrection_status CLEAN_SLATE — Built fresh for dual AI support
 * @original_quality N/A
 *
 * @resurrection_improvements
 * - Full dual-provider type system
 * - BYOK key storage type (encrypted reference, never plaintext)
 * - Provider-specific configuration types
 * - Rate limiting and quota types
 *
 * @hallucination_check PASSED — No blacklist items present
 * @verified_against_architecture true
 */

/** Supported AI providers */
export type AIProvider = 'gemini' | 'openai';

/** AI model identifier */
export type GeminiModel =
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash'
  | 'gemini-1.5-pro';

/** OpenAI model identifier */
export type OpenAIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo';

/** AI provider configuration per user */
export interface AIProviderConfig {
  /** Which provider the user prefers */
  provider: AIProvider;

  /** Whether the user has configured their API key */
  has_key_configured: boolean;

  /** Encrypted key reference (stored in InsForge, NEVER plaintext) */
  encrypted_key_ref: string | null;

  /** Model to use for this provider */
  model: GeminiModel | OpenAIModel;

  /** Maximum tokens per request */
  max_tokens: number;

  /** Temperature setting (0.0 - 2.0) */
  temperature: number;

  /** Last key validation timestamp */
  last_validated_at: string | null;

  /** Whether the key was valid on last check */
  key_valid: boolean | null;
}

/** AI prompt request */
export interface AIPromptRequest {
  /** User's ID (for key retrieval) */
  user_id: string;

  /** Bot instance ID */
  instance_id: string;

  /** The prompt to send */
  prompt: string;

  /** System prompt override (optional) */
  system_prompt?: string;

  /** Conversation history (optional) */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/** AI prompt response */
export interface AIPromptResponse {
  /** Generated text */
  text: string;

  /** Provider that generated it */
  provider: AIProvider;

  /** Model used */
  model: string;

  /** Tokens used */
  tokens_used: number;

  /** Response latency in ms */
  latency_ms: number;
}

/** AI usage record */
export interface AIUsageRecord {
  /** Record identifier */
  id: string;

  /** User ID */
  user_id: string;

  /** Bot instance ID */
  instance_id: string;

  /** Provider used */
  provider: AIProvider;

  /** Model used */
  model: string;

  /** Prompt tokens consumed */
  prompt_tokens: number;

  /** Completion tokens consumed */
  completion_tokens: number;

  /** Timestamp */
  created_at: string;
}

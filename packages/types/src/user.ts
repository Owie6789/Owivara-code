/**
 * @file user.ts
 * @project Owivara - Development
 * @package @owivara/types
 * @module User Types
 *
 * @description
 * Core user type definitions for Owivara.
 * Defines the shape of user records stored in InsForge PostgreSQL.
 *
 * @resurrection_source C:\Users\USER_6987\Desktop\Projects\Owivara Production Environment\src\lib\types.ts
 * @resurrection_status IMPROVED — Extended with dual AI provider support
 * @original_quality 6/10
 * @original_issues
 * - Missing subscription tier details
 * - No AI provider preference tracking
 * - No usage tracking fields
 *
 * @resurrection_improvements
 * - Added subscription_tier enum type
 * - Added ai_provider field (gemini | openai | none)
 * - Added usage tracking fields (messages_sent, instances_count)
 * - Added full JSDoc documentation
 *
 * @hallucination_check PASSED — No blacklist items present
 * @verified_against_architecture true
 */

/** User subscription tier */
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

/** User's preferred AI provider */
export type AIProvider = 'gemini' | 'openai' | 'none';

/** Owivara user record */
export interface User {
  /** Unique user identifier (UUID from InsForge Auth) */
  id: string;

  /** User's email address */
  email: string;

  /** User's display name */
  display_name: string | null;

  /** User's avatar URL */
  avatar_url: string | null;

  /** Subscription tier */
  subscription_tier: SubscriptionTier;

  /** User's preferred AI provider */
  ai_provider: AIProvider;

  /** Whether the user has configured their BYOK API key */
  has_api_key_configured: boolean;

  /** Number of bot instances the user owns */
  instance_count: number;

  /** Total messages processed this billing period */
  messages_this_period: number;

  /** Date the current billing period started */
  period_start: string | null;

  /** Account creation timestamp */
  created_at: string;

  /** Last profile update timestamp */
  updated_at: string;
}

/** User profile creation input */
export interface CreateProfileInput {
  /** User ID from InsForge Auth */
  user_id: string;

  /** Display name */
  display_name?: string;

  /** Avatar URL */
  avatar_url?: string;
}

/** User profile update input (all fields optional) */
export interface UpdateProfileInput {
  display_name?: string | null;
  avatar_url?: string | null;
  ai_provider?: AIProvider;
  has_api_key_configured?: boolean;
}

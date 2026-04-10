/**
 * @file client.ts
 * @project Owivara - Development
 * @package @owivara/insforge
 * @module InsForge Client
 *
 * @description
 * Creates and exports the InsForge client. This is the ONLY place
 * InsForge is initialized. Import from this package — never re-initialize.
 *
 * InsForge SDK v1.2.2 API:
 * - auth.signUp({ email, password, name }) → { data, error }
 * - auth.signInWithPassword({ email, password }) → { data, error }
 * - auth.signOut() → { error }
 * - auth.getCurrentUser() → { data: { user }, error }
 * - auth.getProfile(userId) → { data, error }
 * - auth.setProfile(profile) → { data, error }
 */

import { createClient, InsForgeClient } from '@insforge/sdk';

/** InsForge client configuration */
interface InsForgeConfig {
  /** InsForge project URL */
  baseUrl: string;

  /** InsForge anonymous key (for client-side operations) */
  anonKey: string;
}

/**
 * Validates InsForge environment variables.
 * @returns The validated configuration
 * @throws Error if required environment variables are missing
 */
function validateConfig(): InsForgeConfig {
  const baseUrl = import.meta.env.VITE_INSFORGE_URL;
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error(
      'Missing InsForge configuration. Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY in your .env file.'
    );
  }

  // Validate URL format
  try {
    new URL(baseUrl);
  } catch {
    throw new Error(`Invalid InsForge URL: ${baseUrl}. Must be a valid URL.`);
  }

  return { baseUrl, anonKey };
}

/** Create the main InsForge client with validated config */
const config = validateConfig();

/** Export the base URL for direct API calls (used by auth wrappers) */
export const baseUrl = config.baseUrl;

export const insforge: InsForgeClient = createClient({
  baseUrl: config.baseUrl,
  anonKey: config.anonKey,
});

/** Typed auth service */
export const auth = insforge.auth;

/** Typed database service */
export const db = insforge.database;

/** Typed realtime service */
export const realtime = insforge.realtime;

/** Typed storage service */
export const storage = insforge.storage;

/** Typed functions (edge functions) service */
export const functions = insforge.functions;

/**
 * @file edge.ts
 * @project Owivara - Development
 * @package @owivara/insforge
 * @module Edge Function Callers
 *
 * @description
 * Type-safe wrappers for calling InsForge Edge Functions.
 * Each function handles auth token injection and response parsing.
 */

import { functions } from './client.js';

/** Generic error shape */
interface EdgeError {
  message: string;
  code: string;
}

/** Edge function call result */
type EdgeResult<T> =
  | { data: T; error: null }
  | { data: null; error: EdgeError };

/** Normalize error */
function normalizeEdgeError(err: unknown, fallback: string): EdgeError {
  if (err && typeof err === 'object' && 'message' in err) {
    const e = err as Record<string, unknown>;
    return { message: String(e.message), code: String(e.code ?? 'EDGE_FUNCTION_FAILED') };
  }
  return { message: err instanceof Error ? err.message : fallback, code: 'EDGE_FUNCTION_FAILED' };
}

/**
 * Call the create-instance edge function.
 * Creates a new bot instance record and signals the orchestrator.
 *
 * @param instanceName - Name for the new bot instance
 * @returns Created instance ID or error
 */
export async function callCreateInstance(
  instanceName: string
): Promise<EdgeResult<{ success: true; instance_id: string }>> {
  try {
    const { data, error } = await functions.invoke<{ success: true; instance_id: string }>('create-instance', {
      body: { name: instanceName },
    });

    if (error) return { data: null, error: normalizeEdgeError(error, 'Failed to create instance') };
    return { data: data as { success: true; instance_id: string }, error: null };
  } catch (err) {
    return { data: null, error: normalizeEdgeError(err, 'Failed to create instance') };
  }
}

/**
 * Call the bot-webhook edge function.
 * Used by the orchestrator to report status updates.
 *
 * @param payload - Webhook payload from orchestrator
 * @returns Success or error
 */
export async function callBotWebhook(
  payload: Record<string, unknown>
): Promise<EdgeResult<{ success: true }>> {
  try {
    const { data, error } = await functions.invoke<{ success: true }>('bot-webhook', {
      body: payload,
    });

    if (error) return { data: null, error: normalizeEdgeError(error, 'Failed to invoke bot webhook') };
    return { data: data as { success: true }, error: null };
  } catch (err) {
    return { data: null, error: normalizeEdgeError(err, 'Failed to invoke bot webhook') };
  }
}

/**
 * Call the init-profile edge function.
 * Creates initial profile record on user signup.
 *
 * @param userId - User ID from auth signup
 * @param options - Profile options
 * @returns Success or error
 */
export async function callInitProfile(
  userId: string,
  options?: {
    display_name?: string;
    avatar_url?: string;
  }
): Promise<EdgeResult<{ success: true }>> {
  try {
    const { data, error } = await functions.invoke<{ success: true }>('init-profile', {
      body: {
        user_id: userId,
        display_name: options?.display_name,
        avatar_url: options?.avatar_url,
      },
    });

    if (error) return { data: null, error: normalizeEdgeError(error, 'Failed to initialize profile') };
    return { data: data as { success: true }, error: null };
  } catch (err) {
    return { data: null, error: normalizeEdgeError(err, 'Failed to initialize profile') };
  }
}

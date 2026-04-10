/**
 * @file errors.ts
 * @project Owivara - Development
 * @package @owivara/insforge
 * @module Error Types
 *
 * @description
 * Custom error classes for InsForge operations.
 * Provides typed error handling across the platform.
 *
 * @resurrection_source CLEAN_SLATE — No error types existed in old project
 * @resurrection_status CLEAN_SLATE
 * @hallucination_check PASSED
 */

import type { InsForgeError } from '@owivara/types';

/** Base InsForge error */
export class InsForgeErrorBase extends Error {
  /** Error code from InsForge */
  public readonly code: string;

  /** Original error details */
  public readonly details?: Record<string, unknown>;

  constructor(error: InsForgeError) {
    super(error.message);
    this.name = 'InsForgeError';
    this.code = error.code;
    this.details = error.details;
  }
}

/** Database query error */
export class DatabaseError extends InsForgeErrorBase {
  constructor(error: InsForgeError) {
    super(error);
    this.name = 'DatabaseError';
  }
}

/** Authentication error */
export class AuthError extends InsForgeErrorBase {
  constructor(error: InsForgeError) {
    super(error);
    this.name = 'AuthError';
  }
}

/** Realtime subscription error */
export class RealtimeError extends InsForgeErrorBase {
  constructor(error: InsForgeError) {
    super(error);
    this.name = 'RealtimeError';
  }
}

/** Edge function error */
export class EdgeFunctionError extends InsForgeErrorBase {
  constructor(error: InsForgeError) {
    super(error);
    this.name = 'EdgeFunctionError';
  }
}

/**
 * Type guard: check if an error is an InsForge error.
 */
export function isInsForgeError(err: unknown): err is InsForgeErrorBase {
  return err instanceof InsForgeErrorBase;
}

/**
 * Handle InsForge errors with proper type narrowing.
 *
 * @param error - Error from InsForge SDK
 * @param context - Additional context for the error
 * @throws InsForgeErrorBase with typed error code
 */
export function handleInsForgeError(
  error: InsForgeError | null | undefined,
  context?: string
): never {
  if (!error) {
    throw new Error(`Unknown InsForge error${context ? ` in ${context}` : ''}`);
  }

  const baseError = new InsForgeErrorBase(error);

  // Add context if provided
  if (context) {
    baseError.message = `${context}: ${baseError.message}`;
  }

  throw baseError;
}

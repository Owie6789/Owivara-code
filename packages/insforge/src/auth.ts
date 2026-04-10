/**
 * @file auth.ts
 * @project Owivara - Development
 * @package @owivara/insforge
 * @module Auth Helpers
 *
 * @description
 * Authentication helpers for InsForge Auth.
 * Wraps the SDK's auth methods with proper error handling
 * and TypeScript types.
 *
 * API reference (InsForge SDK v1.2.2):
 * - auth.signUp({ email, password, name }) → { data, error }
 * - auth.signInWithPassword({ email, password }) → { data, error }
 * - auth.signOut() → { error }
 * - auth.getCurrentUser() → { data: { user }, error }
 * - auth.getProfile(userId) → { data, error }
 * - auth.setProfile(profile) → { data, error }
 */

import { auth } from './client.js';
import type { AuthUser } from '@owivara/types';

/** Auth error result */
interface AuthError {
  error: { message: string; code: string };
  data: null;
}

/** Auth success result */
interface AuthSuccess<T> {
  error: null;
  data: T;
}

/** Auth result type */
type AuthResult<T> = AuthSuccess<T> | AuthError;

/**
 * Sign up a new user with email and password.
 *
 * @param email - User's email address
 * @param password - User's password (min 8 characters)
 * @param options - Optional signup options
 * @returns Auth result with user data or error
 */
export async function signUp(
  email: string,
  password: string,
  options?: {
    metadata?: Record<string, string>;
  }
): Promise<AuthResult<AuthUser>> {
  try {
    if (!email || !password) {
      return {
        error: { message: 'Email and password are required', code: 'MISSING_INPUT' },
        data: null,
      };
    }

    if (password.length < 8) {
      return {
        error: { message: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD' },
        data: null,
      };
    }

    const { data, error } = await auth.signUp({
      email,
      password,
      name: options?.metadata?.display_name,
    });

    if (error) {
      return { error: { message: error.message, code: 'SIGNUP_FAILED' }, data: null };
    }

    return { error: null, data: data as unknown as AuthUser };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : 'Unknown signup error',
        code: 'SIGNUP_FAILED',
      },
      data: null,
    };
  }
}

/**
 * Sign in with email and password.
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Auth result with user data or error
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<AuthUser>> {
  try {
    if (!email || !password) {
      return {
        error: { message: 'Email and password are required', code: 'MISSING_INPUT' },
        data: null,
      };
    }

    const { data, error } = await auth.signInWithPassword({ email, password });

    if (error) {
      return { error: { message: error.message, code: 'SIGNIN_FAILED' }, data: null };
    }

    // signInWithPassword returns session data with user object
    return { error: null, data: data as unknown as AuthUser };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : 'Unknown signin error',
        code: 'SIGNIN_FAILED',
      },
      data: null,
    };
  }
}

/**
 * Sign out the current user.
 *
 * @returns Auth result or error
 */
export async function signOut(): Promise<AuthResult<void>> {
  try {
    const { error } = await auth.signOut();

    if (error) {
      return { error: { message: error.message, code: 'SIGNOUT_FAILED' }, data: null };
    }

    return { error: null, data: undefined };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : 'Unknown signout error',
        code: 'SIGNOUT_FAILED',
      },
      data: null,
    };
  }
}

/**
 * Check if the user is currently authenticated.
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data, error } = await auth.getCurrentUser();
    return !error && data?.user !== null;
  } catch {
    return false;
  }
}

/**
 * Get the current authenticated user.
 *
 * @returns The current user or null if not authenticated
 */
export async function getUser(): Promise<AuthUser | null> {
  try {
    const { data, error } = await auth.getCurrentUser();
    if (error || !data?.user) return null;
    return data.user as unknown as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Call the init-profile edge function after signup.
 *
 * @param userId - The user's ID
 * @param profile - Profile data to initialize
 */
export async function callInitProfile(
  userId: string,
  profile: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { functions } = await import('./client.js');
    const { error } = await functions.invoke('init-profile', {
      body: { userId, profile },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to call init-profile function' };
  }
}

/** Convenience alias for getUser */
export const getCurrentUser = getUser;

/**
 * Check if the current user's email is verified.
 *
 * @returns true if email is verified, false otherwise
 */
export async function isEmailVerified(): Promise<boolean> {
  try {
    const { data, error } = await auth.getCurrentUser();
    if (error || !data?.user) return false;
    return Boolean(((data.user as unknown) as Record<string, unknown>).email_verified);
  } catch {
    return false;
  }
}

/**
 * Sign in with OAuth provider (Google, etc.)
 * This triggers a redirect to the OAuth provider's login page.
 * After successful login, InsForge redirects back and auto-exchanges the code.
 *
 * @param provider - OAuth provider name (e.g., 'google')
 * @param redirectTo - URL to redirect after OAuth completes
 * @returns The OAuth redirect URL or error
 */
export async function signInWithOAuth(
  provider: string,
  redirectTo?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await auth.signInWithOAuth({
      provider,
      redirectTo: redirectTo || window.location.origin + '/dashboard',
    });

    if (error) return { url: null, error: error.message };
    return { url: data?.url || null, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err.message : 'OAuth sign in failed',
    };
  }
}

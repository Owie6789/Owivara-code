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

import { auth, baseUrl } from './client.js';
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
 * Sends the user object in the shape the edge function expects: { user: { id } }.
 *
 * @param userId - The user's ID
 * @param _profile - Unused (edge function derives display_name from email)
 */
export async function callInitProfile(
  userId: string,
  _profile?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { functions } = await import('./client.js');
    const { error } = await functions.invoke('init-profile', {
      body: { user: { id: userId } },
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
 * Force a session refresh to get the latest user data from InsForge.
 * Only call this after email verification (when user has a valid session).
 * Silently handles 401 if no session exists.
 */
export async function refreshSession(): Promise<void> {
  try {
    // Only attempt refresh if user is authenticated
    const { data, error } = await auth.getCurrentUser()
    if (error || !data?.user) return // No session, nothing to refresh
    
    await auth.refreshSession()
  } catch {
    // Session refresh may fail — silently ignore
    // This happens when: user not logged in, token expired, or endpoint unavailable
  }
}

/**
 * Get the current user's email address.
 *
 * @returns The user's email or null if not authenticated
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { data, error } = await auth.getCurrentUser();
    if (error || !data?.user) return null;
    return (data.user as Record<string, unknown>).email as string | null;
  } catch {
    return null;
  }
}

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
 * Verify email with OTP code.
 * Wraps the InsForge email verification endpoint.
 *
 * @param email - User's email address
 * @param otp - 6-digit verification code
 * @returns true if verification succeeded
 */
export async function verifyEmail(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${baseUrl}/api/auth/email/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error?.message || data.message || 'Invalid or expired verification code.' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error during verification.' };
  }
}

/**
 * Resend email verification code.
 * Rate limited by InsForge server-side.
 *
 * @param email - User's email address
 * @returns Result with success status or error message
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${baseUrl}/api/auth/email/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error?.message || data.message || 'Failed to resend verification code.' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error while resending verification code.' };
  }
}

/**
 * Send password reset email.
 * InsForge will send a reset link to the user's email.
 *
 * @param email - User's email address
 * @param redirectTo - URL to redirect after password reset click
 * @returns Result with success status or error message
 */
export async function sendPasswordReset(email: string, redirectTo?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await auth.sendResetPasswordEmail({
      email,
      redirectTo: redirectTo || `${window.location.origin}/reset-password`,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send password reset email.' };
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

/**
 * Sync auth state across browser tabs by listening to storage events.
 * When another tab clears the auth token (logout), this tab will also log out.
 *
 * @param onLogout - Callback to run when session is cleared from another tab
 * @returns Cleanup function to remove the event listener
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   return syncAuthAcrossTabs(() => {
 *     navigate('/login')
 *     queryClient.invalidateQueries()
 *   })
 * }, [])
 * ```
 */
export function syncAuthAcrossTabs(onLogout: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    // InsForge SDK stores tokens in localStorage with keys containing 'auth' or 'token'
    // When logout runs in another tab, it clears these keys
    if (e.key?.includes('auth') || e.key?.includes('token')) {
      if (!e.newValue) {
        // Key was removed — another tab logged out
        onLogout()
      }
    }
  }
  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}

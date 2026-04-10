/**
 * @file rate-limiter.ts
 * @project Owivara - Development
 * @package @owivara/insforge
 * @module Rate Limiter
 *
 * @description
 * Client-side rate limiter to prevent abuse and provide better UX
 * before hitting server-side rate limits. Tracks attempts per key
 * within a sliding time window.
 *
 * @example
 * ```tsx
 * const limiter = new RateLimiter()
 *
 * const handleLogin = async () => {
 *   if (!limiter.canAttempt('login', 5, 60_000)) {
 *     setError('Too many attempts. Wait 1 minute.')
 *     return
 *   }
 *   // ... proceed with login
 * }
 * ```
 */

/**
 * Client-side rate limiter.
 * Tracks attempts per key within a sliding time window.
 */
export class RateLimiter {
  private attempts = new Map<string, number[]>()

  /**
   * Check if an action can be attempted.
   *
   * @param key - Unique identifier for the action (e.g., 'login', 'signup')
   * @param maxAttempts - Maximum number of attempts allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns true if the action can be attempted, false if rate limited
   */
  canAttempt(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now()
    const previous = this.attempts.get(key) ?? []
    const valid = previous.filter((t) => now - t < windowMs)

    if (valid.length >= maxAttempts) return false

    this.attempts.set(key, [...valid, now])
    return true
  }

  /**
   * Get remaining attempts for a key.
   *
   * @param key - Unique identifier for the action
   * @param maxAttempts - Maximum number of attempts allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns Number of remaining attempts
   */
  remainingAttempts(key: string, maxAttempts: number, windowMs: number): number {
    const now = Date.now()
    const previous = this.attempts.get(key) ?? []
    const valid = previous.filter((t) => now - t < windowMs)
    return Math.max(0, maxAttempts - valid.length)
  }

  /**
   * Get the time until the next attempt is allowed (in ms).
   * Returns 0 if an attempt can be made now.
   *
   * @param key - Unique identifier for the action
   * @param windowMs - Time window in milliseconds
   * @returns Milliseconds until next attempt is allowed
   */
  timeUntilNextAttempt(key: string, windowMs: number): number {
    const now = Date.now()
    const previous = this.attempts.get(key) ?? []
    const valid = previous.filter((t) => now - t < windowMs)

    if (valid.length === 0) return 0

    const oldest = valid[0]
    return Math.max(0, oldest + windowMs - now)
  }

  /**
   * Reset the rate limit for a specific key.
   *
   * @param key - Unique identifier for the action
   */
  reset(key: string): void {
    this.attempts.delete(key)
  }

  /**
   * Reset all rate limits.
   */
  resetAll(): void {
    this.attempts.clear()
  }
}

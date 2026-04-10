/**
 * @file security.ts
 * @package @owivara/bot
 * @module Security & Anti-Ban Utilities
 *
 * Best practices sourced from:
 * - Reddit r/node: "Build an anti-ban toolkit for WhatsApp automation (Baileys)"
 * - GitHub Omni project: WhatsApp sync architecture analysis
 * - Mintlify WAPI: Bot architecture best practices
 *
 * Implements:
 * - Outbound message rate limiting (3 msg/sec, 20 msg/min, daily caps)
 * - Jittered delays for human-like behavior
 * - JID sanitization and LID validation
 * - Message idempotency tracking
 * - Soft-ban detection
 * - Presence simulation helpers
 */

import type { WASocket } from 'baileys'

/** Rate limiter for outbound messages */
export class MessageRateLimiter {
  private readonly messagesPerChat = new Map<string, number[]>()
  private readonly messagesGlobal: number[] = []
  private readonly dailySent = new Map<string, number>() // date -> count
  private readonly processedIds = new Set<string>()

  /**
   * Check if a message can be sent right now.
   * Enforces: 3 msg/sec per chat, 20 msg/min global, ~1500 msg/day per instance
   *
   * @param chatJid - Target chat JID
   * @param maxPerChat - Max messages per chat per second (default: 3)
   * @param maxGlobal - Max messages globally per minute (default: 20)
   * @param maxDaily - Max messages per day (default: 1500)
   * @returns true if message can be sent, false if rate limited
   */
  canSend(
    chatJid: string,
    maxPerChat = 3,
    maxGlobal = 20,
    maxDaily = 1500,
  ): boolean {
    const now = Date.now()
    const today = new Date().toISOString().slice(0, 10)

    // Clean old entries (older than 1 sec for per-chat, 1 min for global)
    const chatMsgs = this.messagesPerChat.get(chatJid) || []
    const recentChat = chatMsgs.filter((t) => now - t < 1000)

    const recentGlobal = this.messagesGlobal.filter((t) => now - t < 60000)
    const dailyCount = this.dailySent.get(today) || 0

    if (recentChat.length >= maxPerChat) return false
    if (recentGlobal.length >= maxGlobal) return false
    if (dailyCount >= maxDaily) return false

    // Record this message
    this.messagesPerChat.set(chatJid, [...recentChat, now])
    this.messagesGlobal.push(now)
    this.dailySent.set(today, dailyCount + 1)

    return true
  }

  /**
   * Check if a message ID has already been processed (idempotency).
   *
   * @param msgId - WhatsApp message ID
   * @returns true if already processed, false if new
   */
  isDuplicate(msgId: string): boolean {
    if (this.processedIds.has(msgId)) return true
    this.processedIds.add(msgId)
    // Cap the set at 10000 to prevent memory leaks
    if (this.processedIds.size > 10000) {
      const arr = Array.from(this.processedIds)
      this.processedIds.clear()
      arr.slice(-5000).forEach((id) => this.processedIds.add(id))
    }
    return false
  }

  /**
   * Calculate jittered delay for human-like behavior.
   * Uses log-normal distribution: 500ms to 3s base delay.
   *
   * @param minMs - Minimum delay in ms (default: 500)
   * @param maxMs - Maximum delay in ms (default: 3000)
   * @returns Delay in milliseconds
   */
  getJitteredDelay(minMs = 500, maxMs = 3000): number {
    // Log-normal approximation for human-like timing
    const logMean = Math.log(minMs + (maxMs - minMs) * 0.3)
    const logStd = 0.5
    const logNormal = Math.exp(logMean + logStd * randn())
    return Math.min(maxMs, Math.max(minMs, Math.round(logNormal)))
  }

  /**
   * Get wait time until next allowed message (in ms).
   *
   * @param chatJid - Target chat JID
   * @returns Milliseconds to wait, or 0 if can send now
   */
  timeUntilNextSend(chatJid: string): number {
    const now = Date.now()
    const chatMsgs = this.messagesPerChat.get(chatJid) || []
    const recentChat = chatMsgs.filter((t) => now - t < 1000)

    if (recentChat.length >= 3) {
      return 1000 - (now - recentChat[0])
    }

    const recentGlobal = this.messagesGlobal.filter((t) => now - t < 60000)
    if (recentGlobal.length >= 20) {
      return 60000 - (now - recentGlobal[0])
    }

    return 0
  }

  /** Clear all rate limit data (e.g., on daily reset) */
  reset(): void {
    this.messagesPerChat.clear()
    this.messagesGlobal.length = 0
    this.processedIds.clear()
    this.dailySent.clear()
  }
}

/** Box-Muller transform for normal distribution */
function randn(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

/**
 * Sanitize a JID to handle LID migration and prevent DB errors.
 * WhatsApp is migrating to Linked Device IDs (e.g., 69209740566608@lid).
 *
 * @param jid - Raw JID from WhatsApp
 * @returns Sanitized JID safe for DB storage
 */
export function sanitizeJid(jid: string): string {
  if (!jid) return ''
  // Remove any whitespace
  let cleaned = jid.trim()
  // Ensure it has a domain
  if (!cleaned.includes('@')) {
    cleaned += '@s.whatsapp.net'
  }
  // Strip gateway numbers (system messages)
  if (cleaned.startsWith('0@')) {
    return ''
  }
  return cleaned
}

/**
 * Simulate typing presence before sending a message.
 * Makes the bot appear human-like.
 *
 * @param sock - Baileys socket
 * @param jid - Target JID
 * @param durationMs - How long to show "typing..." (default: 1500ms)
 */
export async function simulateTyping(
  sock: WASocket,
  jid: string,
  durationMs = 1500,
): Promise<void> {
  try {
    await sock.sendPresenceUpdate('composing', jid)
    await new Promise((r) => setTimeout(r, durationMs))
    await sock.sendPresenceUpdate('paused', jid)
  } catch {
    // Presence update may fail for non-DM chats — ignore
  }
}

/**
 * Detect soft-ban indicators from connection state.
 *
 * @param statusCode - WhatsApp connection status code
 * @returns true if soft-ban likely detected
 */
export function isSoftBanDetected(statusCode: number | undefined): boolean {
  // 403 = restricted (temp ban), 401 = forced logout
  return statusCode === 403 || statusCode === 401
}

/**
 * Calculate exponential backoff delay for reconnection.
 *
 * @param attempt - Current reconnection attempt (0-based)
 * @param maxDelay - Maximum delay in ms (default: 30000)
 * @returns Delay in milliseconds
 */
export function getBackoffDelay(attempt: number, maxDelay = 30000): number {
  return Math.min(maxDelay, 1000 * 2 ** attempt + Math.random() * 500)
}

/** Global rate limiter instance — shared across all bot instances */
export const rateLimiter = new MessageRateLimiter()

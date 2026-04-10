import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge clsx classes with Tailwind conflict resolution.
 * Used throughout the app for consistent class composition.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to readable string.
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return 'Never'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str: string, max: number): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '...' : str
}

/**
 * Format a phone number for display.
 */
export function formatPhone(phone: string | null): string {
  if (!phone) return 'Not linked'
  return phone
}

/**
 * Get status badge color.
 */
export function getStatusColor(
  status: 'disconnected' | 'connecting' | 'qr_pending' | 'connected' | 'error' | 'logged_out'
): string {
  switch (status) {
    case 'connected':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'connecting':
    case 'qr_pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'error':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'logged_out':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

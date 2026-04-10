/**
 * @file insforge.ts
 * @project Owivara - Development
 * @package @owivara/types
 * @module InsForge Types
 *
 * @description
 * InsForge SDK response and error type definitions.
 * Wraps the SDK's response shapes for type-safe usage.
 *
 * @resurrection_source C:\Users\USER_6987\Desktop\Projects\Owivara Production Environment\src\lib\insforge.ts
 * @resurrection_status IMPROVED — Full error types and response wrappers
 * @original_quality 5/10
 * @original_issues
 * - No error type definitions
 * - No generic response wrapper
 * - Missing pagination types
 *
 * @resurrection_improvements
 * - Generic response type wrapper
 * - Full error type with codes
 * - Pagination metadata types
 * - Real-time subscription event types
 *
 * @hallucination_check PASSED — No blacklist items present
 * @verified_against_architecture true
 */

/** Generic InsForge API response */
export interface InsForgeResponse<T> {
  /** Response data */
  data: T | null;

  /** Error object (present if request failed) */
  error: InsForgeError | null;

  /** HTTP status code */
  status?: number;
}

/** InsForge error object */
export interface InsForgeError {
  /** Error message */
  message: string;

  /** Error code */
  code: string;

  /** Error details */
  details?: Record<string, unknown>;
}

/** Pagination metadata */
export interface PaginationMeta {
  /** Total count of items */
  count: number;

  /** Current page offset */
  offset: number;

  /** Maximum items per page */
  limit: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];

  /** Pagination metadata */
  pagination: PaginationMeta;
}

/** Real-time subscription event */
export interface RealtimeEvent<T = unknown> {
  /** Event type */
  event_type: 'INSERT' | 'UPDATE' | 'DELETE';

  /** Table name */
  table: string;

  /** New record data (for INSERT/UPDATE) */
  record: T | null;

  /** Old record data (for UPDATE/DELETE) */
  old_record: T | null;

  /** Event timestamp */
  timestamp: string;
}

/** Auth session */
export interface AuthSession {
  /** Access token */
  access_token: string;

  /** Refresh token */
  refresh_token: string;

  /** Token expiry timestamp */
  expires_at: string;

  /** User ID */
  user_id: string;
}

/** Auth user */
export interface AuthUser {
  /** User ID */
  id: string;

  /** User email */
  email: string;

  /** Email verified (InsForge returns camelCase) */
  emailVerified: boolean;

  /** User metadata */
  user_metadata: Record<string, unknown>;

  /** Creation timestamp */
  created_at: string;
}

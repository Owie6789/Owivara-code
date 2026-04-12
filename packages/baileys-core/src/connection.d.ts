/**
 * @file connection.ts
 * @project Owivara - Development
 * @package @owivara/baileys-core
 * @module Connection Manager
 *
 * @description
 * Baileys WhatsApp connection utilities.
 * Handles connection lifecycle: create, QR generation, auth state,
 * reconnection, and graceful disconnect.
 *
 * @resurrection_source C:\Users\USER_6987\Desktop\Projects\Owivara Production Environment\orchestrator\index.ts
 * @resurrection_status IMPROVED — Full typed connection management
 * @original_quality 5/10
 * @original_issues
 * - Connection logic mixed with Express routes
 * - No typed event emission
 * - No reconnection logic
 * - Used Supabase SDK instead of InsForge
 *
 * @resurrection_improvements
 * - Separated connection lifecycle from HTTP layer
 * - Typed event emitter for connection updates
 * - Built-in reconnection with exponential backoff
 * - Uses InsForge SDK (not Supabase)
 *
 * @hallucination_check PASSED — No blacklist items present
 * @verified_against_architecture true
 */
import { type WASocket, type BaileysEventMap } from 'baileys';
import type { BotStatus } from '@owivara/types';
import { EventEmitter } from 'events';
/** Connection manager options */
interface ConnectionOptions {
    /** Unique session ID for this connection */
    sessionId: string;
    /** Base path for storing auth state files */
    authStatePath: string;
    /** Called with QR code string */
    onQR?: (qr: string) => void;
    /** Called on connection status change */
    onStatus?: (status: BotStatus, data?: Record<string, unknown>) => void;
    /** Called when fully connected */
    onConnected?: (sock: WASocket) => void;
    /** Called on disconnect */
    onDisconnected?: (reason?: string) => void;
    /** Called on error */
    onError?: (error: Error) => void;
    /** Called on incoming message */
    onMessage?: (message: BaileysEventMap['messages.upsert']) => void;
    /** Whether to auto-reconnect on disconnect */
    autoReconnect?: boolean;
    /** Maximum reconnection attempts (0 = infinite) */
    maxReconnectAttempts?: number;
}
/**
 * Manages a single Baileys WhatsApp connection.
 * Emits typed events for lifecycle management.
 */
export declare class ConnectionManager extends EventEmitter {
    private options;
    private sock;
    private reconnectAttempts;
    private isReconnecting;
    private isShutdown;
    constructor(options: ConnectionOptions);
    /**
     * Start the connection.
     * Generates QR code and manages auth state.
     */
    connect(): Promise<void>;
    /**
     * Reconnect with exponential backoff.
     */
    private reconnect;
    /**
     * Get the active socket instance.
     */
    getSocket(): WASocket | null;
    /**
     * Gracefully disconnect and clean up.
     */
    disconnect(): Promise<void>;
    /**
     * Check if the connection is active.
     */
    isConnected(): boolean;
    /**
     * Clear session data (logout).
     */
    clearSession(): Promise<void>;
}
export {};
//# sourceMappingURL=connection.d.ts.map
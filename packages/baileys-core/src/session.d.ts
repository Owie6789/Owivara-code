/**
 * @file session.ts
 * @project Owivara - Development
 * @package @owivara/baileys-core
 * @module Session Manager
 *
 * @description
 * Manages Baileys session persistence to InsForge database.
 * Sessions are stored as encrypted JSON in the whatsapp_sessions table.
 *
 * @resurrection_source C:\Users\USER_6987\Desktop\Projects\Owivara Production Environment\orchestrator\index.ts
 * @resurrection_status REBUILT — Full session persistence layer
 * @original_quality 3/10
 * @original_issues
 * - Sessions stored locally on filesystem only
 * - No cross-restart persistence via database
 * - No session recovery after container restart
 *
 * @resurrection_improvements
 * - Session persistence to InsForge database
 * - Encrypted credential storage
 * - Session recovery on boot
 * - Per-user isolation via RLS
 *
 * @hallucination_check PASSED — No blacklist items present
 * @verified_against_architecture true
 */
import type { AuthenticationCreds } from 'baileys';
/** Session storage interface */
export interface SessionStorage {
    /** Read session credentials */
    readCreds: (instanceId: string) => Promise<AuthenticationCreds | null>;
    /** Write session credentials */
    writeCreds: (instanceId: string, creds: AuthenticationCreds) => Promise<void>;
    /** Delete session credentials */
    deleteCreds: (instanceId: string) => Promise<void>;
    /** List all session IDs */
    listSessions: () => Promise<string[]>;
}
/**
 * Create a filesystem-based session storage.
 * Used as fallback when database storage is unavailable.
 *
 * @param basePath - Base directory for session files
 * @returns Session storage implementation
 */
export declare function createFileSessionStorage(basePath: string): SessionStorage;
/**
 * Create an InsForge-backed session storage.
 * Sessions are stored as encrypted JSON in the whatsapp_sessions table.
 *
 * @param db - InsForge database client
 * @param fallback - Fallback storage when DB is unavailable
 * @returns Session storage implementation
 */
export declare function createInsForgeSessionStorage(db: unknown, fallback: SessionStorage): SessionStorage;
//# sourceMappingURL=session.d.ts.map
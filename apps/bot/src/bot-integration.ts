/**
 * @file bot-integration.ts
 * @package @owivara/bot
 * @module Bot-Plugin Framework Integration
 *
 * Bridges the Owivara bot's Baileys ConnectionManager with the plugin framework.
 * Creates per-user config instances, wires message routing through the plugin handler,
 * and manages the command registry for all 123+ registered commands.
 */

import type { WASocket, BaileysEventMap } from 'baileys'
import type { Logger } from 'pino'
import {
  registry,
  createMessageHandler,
  createDatabaseHelpers,
  UserConfig,
  type DatabaseHelpers,
} from '@owivara/plugin-framework'

/** Bot plugin integration context per user session */
export interface UserBotContext {
  userId: string
  config: UserConfig
  db: DatabaseHelpers
}

/** Global bot plugin manager */
export class BotPluginManager {
  private readonly logger: Logger
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly dbClient: any
  private readonly userContexts = new Map<string, UserBotContext>()
  // Cache handlers per user to avoid recreating on every message
  private readonly handlerCache = new Map<string, ReturnType<typeof createMessageHandler>>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(logger: Logger, dbClient: any) {
    this.logger = logger
    this.dbClient = dbClient
  }

  /**
   * Get or create a user's bot context (lazy-loaded config).
   */
  async getUserContext(userId: string): Promise<UserBotContext> {
    let ctx = this.userContexts.get(userId)
    if (!ctx) {
      const db = createDatabaseHelpers(this.dbClient)
      ctx = {
        userId,
        config: new UserConfig(userId, db),
        db,
      }
      // Load config from DB (defaults + user overrides)
      await ctx.config.load()
      this.userContexts.set(userId, ctx)
      this.logger.debug({ userId }, 'User bot context initialized')
    }
    return ctx
  }

  /**
   * Get the global command registry (all plugins are auto-registered).
   */
  getRegistry() {
    return registry
  }

  /**
   * Create or retrieve a message handler bound to a specific user's context.
   */
  async getOrCreateHandler(userId: string) {
    let handler = this.handlerCache.get(userId)
    if (!handler) {
      const ctx = await this.getUserContext(userId)
      const prefixes = ctx.config.getHandlerPrefixes()
      handler = createMessageHandler(registry, {
        prefixes,
        sudoJids: new Set(ctx.config.getJSON<string[]>('SUDO_MAP') || []),
        logger: this.logger.child({ userId }),
      })
      this.handlerCache.set(userId, handler)
    }
    return handler
  }

  /**
   * Clear a user's cached context and handler (e.g., after config change).
   */
  clearUserContext(userId: string): void {
    this.userContexts.delete(userId)
    this.handlerCache.delete(userId)
  }

  /**
   * Get stats about loaded plugins and contexts.
   */
  getStats() {
    const allCommands = registry.getAll()
    const commandCount = allCommands.filter((c) => c.info.pattern).length
    const eventCount = allCommands.filter((c) => c.event).length

    return {
      totalPlugins: allCommands.length,
      commands: commandCount,
      eventHandlers: eventCount,
      activeUserContexts: this.userContexts.size,
    }
  }
}

/**
 * Process an incoming message from a specific Baileys connection
 * through the plugin framework's handler.
 *
 * @param socket - The Baileys WhatsApp socket (WASocket)
 * @param raw - The raw Baileys message event (messages.upsert)
 * @param chatJid - The chat JID (group or DM)
 * @param pluginManager - The bot plugin manager
 * @param instanceId - The bot instance ID
 * @param userId - The user ID who owns this instance
 */
export async function processBotMessage(
  socket: WASocket,
  raw: BaileysEventMap['messages.upsert'],
  chatJid: string,
  pluginManager: BotPluginManager,
  instanceId: string,
  userId: string,
): Promise<void> {
  try {
    const handler = await pluginManager.getOrCreateHandler(userId)
    await handler(socket, raw, chatJid)
  } catch (err) {
    pluginManager['logger'].error(
      { err, instanceId, userId },
      'Plugin message processing failed'
    )
  }
}

/**
 * @file registry.ts
 * @package @owivara/plugin-framework
 *
 * Command registry — the central store for all plugin commands and event handlers.
 * Implements Raganork's Module() registration pattern with TypeScript type safety.
 */

import type {
  RegisteredCommand,
  CommandRegistry,
} from './types.js';

/** Escape special regex characters in a string */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create a command registry.
 *
 * @returns The command registry instance
 */
export function createRegistry(): CommandRegistry {
  const commands: RegisteredCommand[] = [];

  const registry: CommandRegistry = {
    commands,

    /**
     * Register a plugin module.
     * This is the `Module()` function that all plugins call.
     *
     * @example
     * // Command-based plugin
     * register({ pattern: 'kick', fromMe: true, desc: 'Kick a member' }, handler)
     *
     * // Event-based plugin
     * register({ on: 'group-update' }, handler)
     */
    register(info, fn) {
      const registered: RegisteredCommand = {
        info: {
          pattern: info.pattern ?? '',
          desc: info.desc,
          use: info.use,
          fromMe: info.fromMe ?? false,
          excludeFromMenu: info.excludeFromMenu ?? false,
          alias: info.alias ? [info.alias] : undefined,
        },
        event: info.on,
        handler: info.handler !== false,
        fn,
        pattern: undefined,
      };

      // Compile pattern into regex for command-based plugins
      if (info.pattern) {
        // Escape the pattern for regex, then wrap in word boundaries
        const escaped = escapeRegex(info.pattern);
        registered.pattern = new RegExp(`^${escaped}(?:\\s+(.+))?`, 'i');
      }

      commands.push(registered);
    },

    /**
     * Find a matching command for the given text and handler prefixes.
     *
     * @param text - The message text (after prefix removal if applicable)
     * @param prefixes - Array of handler prefixes (e.g., ['.', '!'])
     * @returns The matched command or null
     */
    findMatch(text, _prefixes) {
      // Try each registered command
      for (const cmd of commands) {
        if (!cmd.pattern) continue; // Skip event-only handlers

        // Reset lastIndex for global regexes
        cmd.pattern.lastIndex = 0;
        const match = cmd.pattern.exec(text);
        if (match) {
          return cmd;
        }

        // Also check aliases
        if (cmd.info.alias) {
          for (const alias of cmd.info.alias) {
            const escaped = escapeRegex(alias);
            const aliasRegex = new RegExp(`^${escaped}(?:\\s+(.+))?`, 'i');
            aliasRegex.lastIndex = 0;
            if (aliasRegex.exec(text)) {
              return cmd;
            }
          }
        }
      }

      return null;
    },

    /**
     * Get all event handlers for a specific event type.
     *
     * @param event - The event name
     * @returns Array of registered handlers for that event
     */
    getEventHandlers(event) {
      return commands.filter((cmd) => cmd.event === event);
    },

    /**
     * Get all registered commands (for help/menu).
     *
     * @returns Array of all commands
     */
    getAll() {
      return commands;
    },

    /**
     * Get commands filtered by category.
     *
     * @param category - The use/category field
     * @returns Array of commands in that category
     */
    getByCategory(category) {
      return commands.filter(
        (cmd) => cmd.info.use?.toLowerCase() === category.toLowerCase()
      );
    },
  };

  return registry;
}

/**
 * The global command registry.
 * Exported as `Module` for compatibility with Raganork's plugin API.
 *
 * @example
 * import { Module } from '@owivara/plugin-framework';
 *
 * Module({ pattern: 'ping', desc: 'Check latency' }, async (message, match) => {
 *   await message.client.sendMessage(message.chat, { text: 'Pong!' });
 * });
 */
export const registry = createRegistry();
export const Module = registry.register;

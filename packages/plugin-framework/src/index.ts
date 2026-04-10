/**
 * @file index.ts
 * @package @owivara/plugin-framework
 *
 * Barrel export for the plugin framework.
 */

// Types
export type {
  Command,
  MessageContext,
  CommandHandler,
  PluginEvent,
  PluginModule,
  RegisteredCommand,
  CommandRegistry,
} from './types.js';

// Registry (Module() system)
export {
  createRegistry,
  registry,
  Module,
} from './registry.js';

// Message handler
export {
  createMessageHandler,
  type HandlerConfig,
} from './handler.js';

// Plugin loader
export {
  loadPlugins,
  loadExternalPlugin,
  type PluginLoaderOptions,
} from './loader.js';

// Database helpers (InsForge-backed, per-user)
export {
  createDatabaseHelpers,
  type DatabaseHelpers,
  type BotVariable,
  type WarnRecord,
  type FilterRecord,
  type GroupMessageConfig,
  type ScheduledMessage,
  type StickCmdBinding,
  type AutoMuteConfig,
  type AntilinkConfig,
} from './database.js';

// Per-user config system
export {
  UserConfig,
  DEFAULT_CONFIG,
} from './config.js';

// Message constructors
export {
  ParsedMessage,
  ReplyMessage,
  buildParsedMessage,
} from './constructors.js';

// Plugins (auto-loaded when framework is imported)
import './plugins/group.js';
import './plugins/group-events.js';
import './plugins/converters.js';
import './plugins/media.js';
import './plugins/take.js';
import './plugins/fancy.js';
import './plugins/youtube.js';
import './plugins/social.js';
import './plugins/autodl.js';
import './plugins/chatbot.js';

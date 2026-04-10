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

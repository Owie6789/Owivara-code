/**
 * @file loader.ts
 * @package @owivara/plugin-framework
 *
 * Plugin loader — dynamically loads all plugin modules from a directory.
 * Ported from Raganork's plugin auto-loading system.
 */

import { createRequire } from 'module';
import { readdir } from 'fs/promises';
import { join, extname } from 'path';
import type { Logger } from 'pino';

/** Plugin loader options */
export interface PluginLoaderOptions {
  /** Directory containing plugin files */
  pluginDir: string;

  /** Logger instance */
  logger: Logger;
}

/**
 * Load all plugins from a directory.
 * This function recursively imports all .js and .ts files from the plugin directory.
 *
 * @param options - Loader options
 * @returns Number of plugins loaded
 */
export async function loadPlugins(options: PluginLoaderOptions): Promise<number> {
  const { pluginDir, logger } = options;
  let count = 0;

  try {
    const files = await readdir(pluginDir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = join(pluginDir, file.name);

      if (file.isDirectory()) {
        // Recurse into subdirectories
        const subCount = await loadPlugins({ pluginDir: fullPath, logger });
        count += subCount;
      } else if (
        file.isFile() &&
        (extname(file.name) === '.js' || extname(file.name) === '.ts') &&
        !file.name.endsWith('.d.ts')
      ) {
        // Import the plugin file
        try {
          // Use dynamic import for ESM compatibility
          await import(`file://${fullPath}`);
          count++;
          logger.debug({ file: file.name }, 'Plugin loaded');
        } catch (err) {
          logger.error(
            { err, file: file.name },
            'Failed to load plugin'
          );
        }
      }
    }
  } catch (err) {
    logger.error({ err, pluginDir }, 'Failed to read plugin directory');
  }

  logger.info({ count }, 'Plugins loaded successfully');
  return count;
}

/**
 * Load a single external plugin from a URL (GitHub Gist, etc.).
 * Downloads the plugin file and imports it dynamically.
 *
 * NOTE: This has security implications — only load plugins from trusted sources.
 *
 * @param url - URL to the plugin file
 * @param logger - Logger instance
 * @returns Whether the plugin was loaded successfully
 */
export async function loadExternalPlugin(
  url: string,
  logger: Logger
): Promise<boolean> {
  try {
    logger.info({ url }, 'Loading external plugin from URL');

    const response = await fetch(url);
    if (!response.ok) {
      logger.error({ url, status: response.status }, 'Failed to fetch external plugin');
      return false;
    }

    const code = await response.text();

    // Validate: must export or call Module() function
    if (!code.includes('Module(') && !code.includes('module(')) {
      logger.warn({ url }, 'External plugin does not appear to use Module() registration');
      return false;
    }

    // Execute the plugin code
    // SECURITY: This executes arbitrary code — only use with trusted sources
    const fn = new Function('Module', 'require', 'exports', code);

    // Import Module from registry
    const { Module } = await import('./registry.js');
    fn(Module, createRequire(import.meta.url), {});

    logger.info({ url }, 'External plugin loaded');
    return true;
  } catch (err) {
    logger.error({ err, url }, 'Failed to load external plugin');
    return false;
  }
}

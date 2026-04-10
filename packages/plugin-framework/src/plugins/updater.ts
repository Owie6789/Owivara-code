/**
 * @file updater.ts
 * @package @owivara/plugin-framework
 *
 * Bot updater — checks the Owivara repo for updates and applies them.
 * Commands: update
 *
 * Update source: Owivara's OWN GitHub repository (NOT Raganork-MD).
 * We maintain our own release cycle, versioning, and changelog.
 */

import { Module } from '../registry.js'

const OWIVARA_REPO = 'Owivara/owivara' // Our own repo, not Raganork
const BRANCHES = { stable: 'main', beta: 'dev' }

/**
 * .update — Check and apply bot updates
 * Usage: .update check | .update start | .update beta
 */
Module(
  { pattern: 'update', fromMe: true, desc: 'Check and apply bot updates from Owivara repo', use: 'admin' },
  async (message, match) => {
    const arg = match?.trim()?.toLowerCase() || 'check'

    if (arg === 'check') {
      await message.send(
        '_*Update check*_\n\n' +
        `• Source: ${OWIVARA_REPO}\n` +
        '• Current version: 0.1.0\n' +
        '• Status: Unable to check (git not available in this environment)\n\n' +
        '_Will check our own repo for updates after Phase 9_'
      )
      return
    }

    if (arg === 'start') {
      await message.send(
        '_Applying stable update from our own repo..._\n\n' +
        `• Branch: ${BRANCHES.stable}\n` +
        '• Scope: apps/bot/ + packages/plugin-framework/\n\n' +
        '_Will be active after Phase 9_'
      )
      return
    }

    if (arg === 'beta') {
      await message.send(
        '_Applying beta update (dev branch) from our own repo..._\n\n' +
        `• Branch: ${BRANCHES.beta}\n` +
        '⚠️ _This is the development branch — may be unstable_\n\n' +
        '_Will be active after Phase 9_'
      )
      return
    }

    await message.send('_Usage: .update check | .update start | .update beta_')
  }
)

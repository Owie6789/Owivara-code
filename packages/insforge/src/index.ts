/**
 * @file index.ts
 * @project Owivara - Development
 * @package @owivara/insforge
 * @module Barrel Export
 *
 * @description
 * Central export for the InsForge package.
 * Import everything from here.
 */

// Client
export {
  insforge,
  auth,
  db,
  realtime,
  storage,
  functions,
} from './client.js';

// Auth
export {
  signUp,
  signIn,
  signInWithOAuth,
  signOut,
  getUser,
  getCurrentUser,
  getCurrentUserEmail,
  refreshSession,
  isAuthenticated,
  isEmailVerified,
  callInitProfile,
  verifyEmail,
  resendVerificationEmail,
  sendPasswordReset,
  syncAuthAcrossTabs,
  debugAuthStorage,
} from './auth.js';

// Database
export {
  getBotInstances,
  getBotInstance,
  createBotInstance,
  updateBotInstance,
  updateBotStatus,
  deleteBotInstance,
  getBotLogs,
  insertBotLog,
  getMessageStats,
  getPluginRegistry,
  getUserPlugins,
  saveAIProviderConfig,
  getAIProviderConfig,
} from './database.js';

// Realtime
export {
  onBotStatusChange,
  onBotLogChange,
  onMessageStatsChange,
} from './realtime.js';

// Edge Functions
export {
  callCreateInstance,
  callBotWebhook,
} from './edge.js';

// Utils
export { RateLimiter } from './utils/rate-limiter.js';

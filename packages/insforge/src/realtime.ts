/**
 * @file realtime.ts
 * @project Owivara - Development
 * @package @owivara/insforge
 * @module Realtime Helpers
 *
 * @description
 * Real-time subscription helpers for InsForge.
 * InsForge realtime uses socket-based pub/sub (not Postgres changes).
 * Channels are named by convention: e.g., 'bot_status:{userId}'
 *
 * InsForge SDK Realtime API:
 * - realtime.connect() → Promise<void>
 * - realtime.subscribe(channel) → Promise<{ ok: boolean, error? }>
 * - realtime.unsubscribe(channel) → void
 * - realtime.publish(channel, event, payload) → Promise<void>
 * - realtime.on(event, callback) → void
 * - realtime.isConnected → boolean
 */

import { realtime } from './client.js';

/** Unsubscribe function */
export type Unsubscribe = () => void;

/**
 * Ensure realtime is connected, then subscribe to a channel.
 * Returns an unsubscribe function.
 */
async function subscribeToChannel(
  channel: string,
  callback: (payload: unknown) => void
): Promise<Unsubscribe> {
  // Connect if not already connected
  if (!realtime.isConnected) {
    await realtime.connect();
  }

  // Subscribe to channel
  const response = await realtime.subscribe(channel);
  if (!response.ok) {
    console.warn(`Failed to subscribe to channel: ${channel}`, response.error);
    return () => {};
  }

  // Listen for events on this channel
  realtime.on(channel, callback);

  return () => {
    realtime.off(channel, callback);
    realtime.unsubscribe(channel);
  };
}

/**
 * Subscribe to bot status changes for a user.
 * Channel convention: 'bot_status:{userId}'
 *
 * @param userId - The authenticated user's ID
 * @param callback - Called when bot status changes
 * @returns Unsubscribe function
 */
export function onBotStatusChange(
  userId: string,
  callback: (status: { instance_id: string; status: string }) => void
): Unsubscribe {
  const channel = `bot_status:${userId}`;

  // We need to connect and subscribe asynchronously
  // Return a cleanup function that works once connected
  let cleanup: Unsubscribe = () => {};

  subscribeToChannel(channel, (payload) => {
    callback(payload as { instance_id: string; status: string });
  }).then((unsub) => {
    cleanup = unsub;
  }).catch((err) => {
    console.error(`Failed to subscribe to ${channel}:`, err);
  });

  return () => cleanup();
}

/**
 * Subscribe to new bot logs for a specific instance.
 * Channel convention: 'bot_logs:{instanceId}'
 *
 * @param instanceId - Bot instance UUID
 * @param callback - Called when new logs arrive
 * @returns Unsubscribe function
 */
export function onBotLogChange(
  instanceId: string,
  callback: (log: unknown) => void
): Unsubscribe {
  const channel = `bot_logs:${instanceId}`;
  let cleanup: Unsubscribe = () => {};

  subscribeToChannel(channel, callback).then((unsub) => {
    cleanup = unsub;
  }).catch((err) => {
    console.error(`Failed to subscribe to ${channel}:`, err);
  });

  return () => cleanup();
}

/**
 * Subscribe to message stats changes for an instance.
 * Channel convention: 'message_stats:{instanceId}'
 *
 * @param instanceId - Bot instance UUID
 * @param callback - Called when stats change
 * @returns Unsubscribe function
 */
export function onMessageStatsChange(
  instanceId: string,
  callback: (stats: unknown) => void
): Unsubscribe {
  const channel = `message_stats:${instanceId}`;
  let cleanup: Unsubscribe = () => {};

  subscribeToChannel(channel, callback).then((unsub) => {
    cleanup = unsub;
  }).catch((err) => {
    console.error(`Failed to subscribe to ${channel}:`, err);
  });

  return () => cleanup();
}

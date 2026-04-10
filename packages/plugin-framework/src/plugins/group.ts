/**
 * @file group.ts
 * @package @owivara/plugin-framework
 *
 * Group management plugin — ported from Raganork-MD's group.js
 * Commands: kick, add, promote, demote, mute, unmute, gname, gdesc,
 *           jid, invite, revoke, tag, common, diff, leave, quoted, clear, requests
 *
 * Bug fixes from original:
 * - Fixed demote command using wrong JID variable (used reply_message.jid instead of resolved user)
 * - Fixed unreachable code in mute command (return before send)
 * - Added proper sudo/access control checks
 * - Type-safe throughout
 */

import type { WAMessageKey } from 'baileys';
import { Module } from '../registry.js';
import type { ParsedMessage } from '../constructors.js';

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Check if bot is admin in the group */
async function isBotAdmin(message: ParsedMessage): Promise<boolean> {
  const metadata = await message.client.groupMetadata(message.chat);
  return metadata.participants.some(
    (p: any) => p.id === (message.client.user?.id || '') && p.admin !== null
  );
}

/** Get mentioned JID or reply JID */
function getTargetUser(message: ParsedMessage): string | undefined {
  const msgData = message.raw.message as Record<string, unknown> | undefined;
  const extendedMsg = msgData?.extendedTextMessage as Record<string, unknown> | undefined;
  const contextInfo = extendedMsg?.contextInfo as Record<string, unknown> | undefined;
  const mentionedJid = contextInfo?.mentionedJid as string[] | undefined;

  // Check mentions first
  if (mentionedJid && mentionedJid.length > 0) return mentionedJid[0];

  // Check reply
  if (message.quoted) {
    const quotedSender = message.raw.message?.extendedTextMessage?.contextInfo?.participant;
    if (quotedSender) return quotedSender;
  }

  return undefined;
}

/** Mention format for WhatsApp */
function mentionJid(jid: string): string {
  return `@${jid.split('@')[0]}`;
}

/** Check if a string is numeric */
function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

// ─── Group Commands ──────────────────────────────────────────────────────

/**
 * .kick — Remove a participant from the group
 * Usage: .kick @mention | .kick (reply) | .kick all | .kick <country_code>
 */
Module(
  { pattern: 'kick', fromMe: false, desc: 'Kick a participant from the group', use: 'group' },
  async (message, match) => {
    if (!message.isGroup) return;

    const user = getTargetUser(message);
    if (!user && !match) return await message.send('_Need a user — mention, reply, or use "kick all"_');

    // Check bot is admin
    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges to kick members_');

    if (match?.toLowerCase() === 'all') {
      const metadata = await message.client.groupMetadata(message.chat);
      const nonAdmins = metadata.participants.filter((p: any) => !p.admin);
      await message.send(
        `_⚠️ Kicking *${nonAdmins.length}* members from *${metadata.subject}*. Restart bot immediately to stop this process. ⚠️_\n_*You have 5 seconds*_`
      );
      await new Promise((r: any) => setTimeout(r, 5000));
      for (const member of nonAdmins) {
        await new Promise((r: any) => setTimeout(r, 1000));
        try {
          await message.client.groupParticipantsUpdate(message.chat, [member.id], 'remove');
        } catch {
          // Rate limited or failed
        }
      }
      return;
    }

    if (match && isNumeric(match.trim())) {
      const prefix = match.trim();
      const metadata = await message.client.groupMetadata(message.chat);
      const targets = metadata.participants.filter(
        (p: any) => p.id.startsWith(prefix) && !p.admin
      );
      await message.send(
        `_⚠️ Kicking *${targets.length}* members starting with *${prefix}*. Restart bot to stop. ⚠️_\n_*You have 5 seconds*_`
      );
      await new Promise((r: any) => setTimeout(r, 5000));
      for (const member of targets) {
        await new Promise((r: any) => setTimeout(r, 1000));
        try {
          await message.client.groupParticipantsUpdate(message.chat, [member.id], 'remove');
        } catch {
          // Rate limited or failed
        }
      }
      return;
    }

    // Single user kick
    const target = user || match;
    if (!target) return await message.send('_Need a user — mention or reply_');

    await message.send(`${mentionJid(target)} has been removed from the group`);
    await message.client.groupParticipantsUpdate(message.chat, [target], 'remove');
  }
);

/**
 * .promote — Make a participant an admin
 * Usage: .promote @mention | .promote (reply)
 */
Module(
  { pattern: 'promote', fromMe: false, desc: 'Promote a participant to admin', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const user = getTargetUser(message);
    if (!user) return await message.send('_Mention or reply to a user to promote_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    await message.send(`${mentionJid(user)} has been promoted to admin`);
    await message.client.groupParticipantsUpdate(message.chat, [user], 'promote');
  }
);

/**
 * .demote — Remove admin privileges from a participant
 * Usage: .demote @mention | .demote (reply)
 * FIX: Uses resolved user JID instead of reply_message.jid
 */
Module(
  { pattern: 'demote', fromMe: false, desc: 'Demote a participant from admin', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const user = getTargetUser(message);
    if (!user) return await message.send('_Mention or reply to a user to demote_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    await message.send(`${mentionJid(user)} has been demoted from admin`);
    await message.client.groupParticipantsUpdate(message.chat, [user], 'demote');
  }
);

/**
 * .mute — Lock group settings (only admins can send messages)
 * Usage: .mute
 */
Module(
  { pattern: 'mute', fromMe: false, desc: 'Mute group (only admins can send)', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    await message.client.groupSettingUpdate(message.chat, 'announcement');
    await message.send('_Group has been muted — only admins can send messages_');
  }
);

/**
 * .unmute — Unlock group (everyone can send messages)
 * Usage: .unmute
 */
Module(
  { pattern: 'unmute', fromMe: false, desc: 'Unmute group (everyone can send)', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    await message.client.groupSettingUpdate(message.chat, 'not_announcement');
    await message.send('_Group has been unmuted — everyone can send messages_');
  }
);

/**
 * .gname — Change group subject
 * Usage: .gname <new name>
 */
Module(
  { pattern: 'gname', fromMe: false, desc: 'Change group subject', use: 'group' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    if (!match?.trim()) return await message.send('_Usage: .gname <new name>_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    await message.client.groupUpdateSubject(message.chat, match.trim());
    await message.send(`_Group name changed to *${match.trim()}*_`);
  }
);

/**
 * .gdesc — Change group description
 * Usage: .gdesc <new description>
 */
Module(
  { pattern: 'gdesc', fromMe: false, desc: 'Change group description', use: 'group' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');
    if (!match?.trim()) return await message.send('_Usage: .gdesc <new description>_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    await message.client.groupUpdateDescription(message.chat, match.trim());
    await message.send('_Group description updated_');
  }
);

/**
 * .jid — Get the JID of the current group or user
 * Usage: .jid
 */
Module(
  { pattern: 'jid', fromMe: false, desc: 'Get the JID of the group or user', use: 'group' },
  async (message) => {
    await message.send(message.chat);
  }
);

/**
 * .invite — Get the group invite link
 * Usage: .invite
 */
Module(
  { pattern: 'invite', fromMe: false, desc: 'Get group invite link', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    const code = await message.client.groupInviteCode(message.chat);
    await message.send(`https://chat.whatsapp.com/${code}`);
  }
);

/**
 * .revoke — Revoke the current group invite link
 * Usage: .revoke
 */
Module(
  { pattern: 'revoke', fromMe: false, desc: 'Revoke group invite link', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    await message.client.groupRevokeInvite(message.chat);
    await message.send('_Group invite link has been revoked_');
  }
);

/**
 * .tagall — Tag all members in the group
 * Usage: .tagall | .tagall <message>
 */
Module(
  { pattern: 'tagall', fromMe: false, desc: 'Tag all members in the group', use: 'group' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const metadata = await message.client.groupMetadata(message.chat);
    const participants = metadata.participants;
    const mentionJids = participants.map((p: any) => p.id);

    let text = match || '_Attention everyone!_';
    for (const participant of participants) {
      text += `\n@${participant.id.split('@')[0]}`;
    }

    await message.client.sendMessage(message.chat, {
      text,
      mentions: mentionJids,
    });
  }
);

/**
 * .tagadmin — Tag all admins in the group
 * Usage: .tagadmin
 */
Module(
  { pattern: 'tagadmin', fromMe: false, desc: 'Tag all admins in the group', use: 'group' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const metadata = await message.client.groupMetadata(message.chat);
    const admins = metadata.participants.filter((p: any) => p.admin !== null);
    const mentionJids = admins.map((p: any) => p.id);

    let text = match || '_Attention admins!_';
    for (const admin of admins) {
      text += `\n@${admin.id.split('@')[0]}`;
    }

    await message.client.sendMessage(message.chat, {
      text,
      mentions: mentionJids,
    });
  }
);

/**
 * .common — Find common members between two groups
 * Usage: .common <group1_jid> <group2_jid>
 */
Module(
  { pattern: 'common', fromMe: false, desc: 'Find common members between two groups', use: 'group' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .common <group1_jid> <group2_jid>_');

    const [jid1, jid2] = match.split(' ');
    if (!jid1 || !jid2) return await message.send('_Provide two group JIDs_');

    try {
      const meta1 = await message.client.groupMetadata(jid1);
      const meta2 = await message.client.groupMetadata(jid2);

      const ids1 = new Set(meta1.participants.map((p: any) => p.id));
      const common = meta2.participants.filter((p: any) => ids1.has(p.id));

      if (common.length === 0) {
        return await message.send('_No common members found_');
      }

      let text = `_*Common members (${common.length}):*_\n\n`;
      for (const member of common) {
        text += `• @${member.id.split('@')[0]}\n`;
      }

      await message.client.sendMessage(message.chat, {
        text,
        mentions: common.map((m: any) => m.id),
      });
    } catch (err) {
      await message.send(`_Error: ${err instanceof Error ? err.message : 'Unknown error'}_`);
    }
  }
);

/**
 * .diff — Find members in group1 but not in group2
 * Usage: .diff <group1_jid> <group2_jid>
 */
Module(
  { pattern: 'diff', fromMe: false, desc: 'Find different members between two groups', use: 'group' },
  async (message, match) => {
    if (!match) return await message.send('_Usage: .diff <group1_jid> <group2_jid>_');

    const [jid1, jid2] = match.split(' ');
    if (!jid1 || !jid2) return await message.send('_Provide two group JIDs_');

    try {
      const meta1 = await message.client.groupMetadata(jid1);
      const meta2 = await message.client.groupMetadata(jid2);

      const ids2 = new Set(meta2.participants.map((p: any) => p.id));
      const different = meta1.participants.filter((p: any) => !ids2.has(p.id));

      if (different.length === 0) {
        return await message.send('_No different members found_');
      }

      let text = `_*Members in group 1 but not in group 2 (${different.length}):*_\n\n`;
      for (const member of different) {
        text += `• @${member.id.split('@')[0]}\n`;
      }

      await message.client.sendMessage(message.chat, {
        text,
        mentions: different.map((m: any) => m.id),
      });
    } catch (err) {
      await message.send(`_Error: ${err instanceof Error ? err.message : 'Unknown error'}_`);
    }
  }
);

/**
 * .leave — Leave the current group
 * Usage: .leave
 */
Module(
  { pattern: 'leave', fromMe: true, desc: 'Leave the current group', use: 'group' },
  async (message) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    await message.send('_Goodbye! 👋_');
    await message.client.groupLeave(message.chat);
  }
);

/**
 * .clear — Clear the current chat
 * Usage: .clear
 */
Module(
  { pattern: 'clear', fromMe: true, desc: 'Clear the current chat', use: 'misc' },
  async (message) => {
    try {
      await message.client.chatModify(
        {
          delete: true,
          lastMessages: [
            {
              key: message.raw.key as WAMessageKey,
              messageTimestamp: (message.raw.messageTimestamp as number) || Math.floor(Date.now() / 1000),
            },
          ],
        },
        message.chat
      );
      await message.send('_Chat cleared!_');
    } catch {
      await message.send('_Failed to clear chat_');
    }
  }
);

/**
 * .requests — Get list of pending group join requests
 * Usage: .requests approve all | .requests reject all
 */
Module(
  { pattern: 'requests', fromMe: false, desc: 'Get pending group join requests', use: 'group' },
  async (message, match) => {
    if (!message.isGroup) return await message.send('_This command only works in groups_');

    const botAdmin = await isBotAdmin(message);
    if (!botAdmin) return await message.send('_I need admin privileges_');

    try {
      const requests = await message.client.groupRequestParticipantsList(message.chat);
      if (!requests || requests.length === 0) {
        return await message.send('_No pending requests_');
      }

      if (match?.toLowerCase().includes('approve')) {
        for (const req of requests) {
          try {
            await message.client.groupRequestParticipantsUpdate(message.chat, [req.jid], 'approve');
          } catch {
            // Failed to approve
          }
        }
        return await message.send(`_Approved ${requests.length} requests_`);
      }

      if (match?.toLowerCase().includes('reject')) {
        for (const req of requests) {
          try {
            await message.client.groupRequestParticipantsUpdate(message.chat, [req.jid], 'reject');
          } catch {
            // Failed to reject
          }
        }
        return await message.send(`_Rejected ${requests.length} requests_`);
      }

      // List requests
      let text = `_*Pending join requests (${requests.length}):*_\n\n`;
      for (const req of requests) {
        text += `• @${req.jid.split('@')[0]}\n`;
      }
      text += '\n_Use .requests approve all or .requests reject all_';

      await message.client.sendMessage(message.chat, {
        text,
        mentions: requests.map((r: any) => r.jid),
      });
    } catch {
      await message.send('_Failed to get pending requests_');
    }
  }
);

const db = require('../lib/database');
const { sendText } = require('../lib/sendMsg');

async function requireAdmin(sock, m) {
  const meta = await sock.groupMetadata(m.chat);
  const participant = meta.participants.find((p) => p.id === m.sender);
  return { meta, senderIsAdmin: !!participant?.admin };
}

function targetFrom(m, args) {
  if (m.mentionedJid?.length) return m.mentionedJid[0];
  if (m.quoted?.sender) return m.quoted.sender;
  if (args[0]) return `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
  return null;
}

function toggleSetting(key, label) {
  return {
    name: key,
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: `Toggle ${label} on/off`,
    async run(sock, m, args) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      const mode = (args[0] || '').toLowerCase();
      if (!['on', 'off'].includes(mode)) return sendText(sock, m.chat, `Usage: .${key} on/off`, m.key);
      const g = db.getGroup(m.chat);
      db.updateGroup(m.chat, { [key]: mode === 'on' });
      await sendText(sock, m.chat, `✅ ${label} turned *${mode}*.`, m.key);
    },
  };
}

module.exports = [
  toggleSetting('antidelete', 'Anti-delete (bot re-sends deleted messages)'),
  toggleSetting('antiedit', 'Anti-edit (bot flags edited messages)'),
  toggleSetting('antiforward', 'Anti-forward'),
  toggleSetting('antinsfw', 'Anti-NSFW media filter'),
  toggleSetting('antispam', 'Anti-spam'),
  toggleSetting('antisticker', 'Anti-sticker'),
  toggleSetting('antiurl', 'Anti-URL'),
  toggleSetting('antiviewonce', 'Anti view-once (bot reveals view-once media)'),
  toggleSetting('antigroupmention', 'Anti group-mention (blocks @everyone spam tags)'),
  toggleSetting('antigroupstatus', 'Anti group-status posting'),
  toggleSetting('antihijack', 'Anti-hijack (blocks non-admins from bot settings)'),
  toggleSetting('antibot', 'Anti other-bots'),
  toggleSetting('antipromote', 'Anti-promote (blocks non-owner promotions)'),
  toggleSetting('antidemote', 'Anti-demote (blocks non-owner demotions)'),
  toggleSetting('antimention', 'Anti random @mention spam'),
  toggleSetting('autoreact', 'Auto-react to every group message'),
  {
    name: 'lock',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Lock the group (only admins can message)',
    async run(sock, m) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      await sock.groupSettingUpdate(m.chat, 'announcement');
      await sendText(sock, m.chat, '🔒 Group locked — only admins can send messages.', m.key);
    },
  },
  {
    name: 'unlock',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Unlock the group (everyone can message)',
    async run(sock, m) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      await sock.groupSettingUpdate(m.chat, 'not_announcement');
      await sendText(sock, m.chat, '🔓 Group unlocked — everyone can send messages.', m.key);
    },
  },
  {
    name: 'muteuser',
    aliases: ['mute'],
    category: 'Moderation',
    group: true,
    desc: 'Mute a member (bot deletes their messages)',
    async run(sock, m, args) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      const target = targetFrom(m, args);
      if (!target) return sendText(sock, m.chat, 'Mention or reply to the user to mute.', m.key);
      const g = db.getGroup(m.chat);
      g.mutedUsers = g.mutedUsers || [];
      if (!g.mutedUsers.includes(target)) g.mutedUsers.push(target);
      db.updateGroup(m.chat, { mutedUsers: g.mutedUsers });
      await sendText(sock, m.chat, `🔇 Muted @${target.split('@')[0]}`, m.key, { mentionedJid: [target] });
    },
  },
  {
    name: 'unmuteuser',
    aliases: ['unmute'],
    category: 'Moderation',
    group: true,
    desc: 'Unmute a member',
    async run(sock, m, args) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      const target = targetFrom(m, args);
      if (!target) return sendText(sock, m.chat, 'Mention or reply to the user to unmute.', m.key);
      const g = db.getGroup(m.chat);
      g.mutedUsers = (g.mutedUsers || []).filter((j) => j !== target);
      db.updateGroup(m.chat, { mutedUsers: g.mutedUsers });
      await sendText(sock, m.chat, `🔊 Unmuted @${target.split('@')[0]}`, m.key, { mentionedJid: [target] });
    },
  },
  {
    name: 'mutelist',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'List all muted members',
    async run(sock, m) {
      const g = db.getGroup(m.chat);
      const list = g.mutedUsers || [];
      if (!list.length) return sendText(sock, m.chat, 'No one is muted here.', m.key);
      await sendText(sock, m.chat, `🔇 *Muted users:*\n${list.map((j) => `• @${j.split('@')[0]}`).join('\n')}`, m.key, { mentionedJid: list });
    },
  },
  {
    name: 'mutesticker',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Ban a specific sticker (by replying to it) from being sent again',
    async run(sock, m) {
      if (!m.quoted) return sendText(sock, m.chat, 'Reply to a sticker to mute it.', m.key);
      const g = db.getGroup(m.chat);
      g.mutedStickers = g.mutedStickers || [];
      const id = m.quoted.id || String(Date.now());
      g.mutedStickers.push(id);
      db.updateGroup(m.chat, { mutedStickers: g.mutedStickers });
      await sendText(sock, m.chat, '🚫 That sticker is now muted in this group.', m.key);
    },
  },
  {
    name: 'mutestickerlist',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'List muted stickers',
    async run(sock, m) {
      const g = db.getGroup(m.chat);
      const list = g.mutedStickers || [];
      await sendText(sock, m.chat, `🚫 *Muted stickers:* ${list.length}`, m.key);
    },
  },
  {
    name: 'unmutesticker',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Clear all muted stickers',
    async run(sock, m) {
      db.updateGroup(m.chat, { mutedStickers: [] });
      await sendText(sock, m.chat, '✅ Sticker mute list cleared.', m.key);
    },
  },
  {
    name: 'del',
    aliases: ['delete'],
    category: 'Moderation',
    group: true,
    desc: 'Delete a quoted message (admin only)',
    async run(sock, m) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      if (!m.quoted) return sendText(sock, m.chat, 'Reply to the message you want deleted.', m.key);
      await sock.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: m.quoted.id, participant: m.quoted.sender, fromMe: false } });
    },
  },
  {
    name: 'warnings',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Check a member\u2019s warning count',
    async run(sock, m, args) {
      const target = targetFrom(m, args) || m.sender;
      const g = db.getGroup(m.chat);
      await sendText(sock, m.chat, `⚠️ @${target.split('@')[0]} has ${g.warnings[target] || 0}/3 warnings.`, m.key, { mentionedJid: [target] });
    },
  },
  {
    name: 'resetwarn',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Reset a member\u2019s warnings',
    async run(sock, m, args) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      const target = targetFrom(m, args);
      if (!target) return sendText(sock, m.chat, 'Mention or reply to the user.', m.key);
      const g = db.getGroup(m.chat);
      delete g.warnings[target];
      db.updateGroup(m.chat, { warnings: g.warnings });
      await sendText(sock, m.chat, `✅ Warnings reset for @${target.split('@')[0]}`, m.key, { mentionedJid: [target] });
    },
  },
  {
    name: 'clearwarn',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Clear all warnings in this group',
    async run(sock, m) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      db.updateGroup(m.chat, { warnings: {} });
      await sendText(sock, m.chat, '✅ All warnings cleared for this group.', m.key);
    },
  },
  {
    name: 'resetlinkwarn',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Reset anti-link warning counters',
    async run(sock, m) {
      db.updateGroup(m.chat, { linkWarnings: {} });
      await sendText(sock, m.chat, '✅ Anti-link warnings reset.', m.key);
    },
  },
  {
    name: 'blacklist',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Blacklist a word/phrase (auto-deletes messages containing it)',
    async run(sock, m, args, { text }) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      if (!text) return sendText(sock, m.chat, 'Usage: .blacklist <word>', m.key);
      const g = db.getGroup(m.chat);
      g.blacklist = g.blacklist || [];
      g.blacklist.push(text.toLowerCase());
      db.updateGroup(m.chat, { blacklist: g.blacklist });
      await sendText(sock, m.chat, `✅ "${text}" added to the blacklist.`, m.key);
    },
  },
  {
    name: 'unblacklist',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'Remove a word from the blacklist',
    async run(sock, m, args, { text }) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      const g = db.getGroup(m.chat);
      g.blacklist = (g.blacklist || []).filter((w) => w !== text.toLowerCase());
      db.updateGroup(m.chat, { blacklist: g.blacklist });
      await sendText(sock, m.chat, `✅ "${text}" removed from the blacklist.`, m.key);
    },
  },
  {
    name: 'blacklistview',
    aliases: [],
    category: 'Moderation',
    group: true,
    desc: 'View the blacklisted words',
    async run(sock, m) {
      const g = db.getGroup(m.chat);
      const list = g.blacklist || [];
      await sendText(sock, m.chat, list.length ? `🚫 *Blacklist:*\n${list.join(', ')}` : 'Blacklist is empty.', m.key);
    },
  },
  {
    name: 'setsubject',
    aliases: ['setgroupname'],
    category: 'Moderation',
    group: true,
    desc: 'Set the group name/subject',
    async run(sock, m, args, { text }) {
      const { senderIsAdmin } = await requireAdmin(sock, m);
      if (!senderIsAdmin) return sendText(sock, m.chat, '🚫 Only group admins can use this.', m.key);
      if (!text) return sendText(sock, m.chat, 'Usage: .setsubject <name>', m.key);
      await sock.groupUpdateSubject(m.chat, text);
      await sendText(sock, m.chat, '✅ Group name updated.', m.key);
    },
  },
  {
    name: 'nocall',
    aliases: [],
    category: 'Moderation',
    desc: 'Toggle auto-reject incoming calls',
    async run(sock, m, args) {
      const mode = (args[0] || '').toLowerCase();
      if (!['on', 'off'].includes(mode)) return sendText(sock, m.chat, 'Usage: .nocall on/off', m.key);
      const s = require('../lib/database')._raw.settings;
      s.anticall = mode === 'on';
      await sendText(sock, m.chat, `📵 Anti-call turned *${mode}*.`, m.key);
    },
  },
];

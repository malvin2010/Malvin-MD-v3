const fs = require('fs');
const path = require('path');
const config = require('../config');
const db = require('../lib/database');
const { sendText } = require('../lib/sendMsg');

const settings = db._raw.settings;
settings.bot = settings.bot || { mode: 'public', font: 'default', lang: 'en', sudo: [], mods: [], blocked: [] };

function targetNum(args) {
  return args[0] ? args[0].replace(/[^0-9]/g, '') : null;
}

module.exports = [
  {
    name: 'mode',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Show or set the bot mode',
    async run(sock, m, args) {
      if (!args[0]) return sendText(sock, m.chat, `Current mode: *${settings.bot.mode}*\nUsage: .mode public/private`, m.key);
      const mode = args[0].toLowerCase();
      if (!['public', 'private'].includes(mode)) return sendText(sock, m.chat, 'Usage: .mode public/private', m.key);
      settings.bot.mode = mode;
      await sendText(sock, m.chat, `✅ Bot mode set to *${mode}*.`, m.key);
    },
  },
  {
    name: 'public',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Switch the bot to public mode (anyone can use it)',
    async run(sock, m) {
      settings.bot.mode = 'public';
      await sendText(sock, m.chat, '✅ Bot is now *public*.', m.key);
    },
  },
  {
    name: 'private',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Switch the bot to private mode (owner/sudo only)',
    async run(sock, m) {
      settings.bot.mode = 'private';
      await sendText(sock, m.chat, '✅ Bot is now *private*.', m.key);
    },
  },
  {
    name: 'anticall',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Toggle auto-rejecting calls to the bot number',
    async run(sock, m, args) {
      const mode = (args[0] || '').toLowerCase();
      settings.bot.anticall = mode === 'on';
      await sendText(sock, m.chat, `📵 Anti-call is now *${settings.bot.anticall ? 'on' : 'off'}*.`, m.key);
    },
  },
  {
    name: 'autorecording',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Toggle the bot showing "recording audio..." presence',
    async run(sock, m, args) {
      const mode = (args[0] || '').toLowerCase();
      settings.bot.autorecording = mode === 'on';
      await sendText(sock, m.chat, `🎙️ Auto-recording presence is now *${settings.bot.autorecording ? 'on' : 'off'}*.`, m.key);
    },
  },
  {
    name: 'autotyping',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Toggle the bot showing "typing..." presence',
    async run(sock, m, args) {
      const mode = (args[0] || '').toLowerCase();
      settings.bot.autotyping = mode === 'on';
      await sendText(sock, m.chat, `⌨️ Auto-typing presence is now *${settings.bot.autotyping ? 'on' : 'off'}*.`, m.key);
    },
  },
  {
    name: 'autoviewstatus',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Toggle auto-viewing contacts\u2019 WhatsApp statuses',
    async run(sock, m, args) {
      const mode = (args[0] || '').toLowerCase();
      settings.bot.autoviewstatus = mode === 'on';
      await sendText(sock, m.chat, `👀 Auto view-status is now *${settings.bot.autoviewstatus ? 'on' : 'off'}*.`, m.key);
    },
  },
  {
    name: 'autoread',
    aliases: [],
    category: 'General',
    owner: true,
    desc: 'Toggle auto blue-tick reading of messages',
    async run(sock, m, args) {
      const mode = (args[0] || '').toLowerCase();
      config.AUTO_READ = mode === 'on';
      await sendText(sock, m.chat, `✅ Auto-read is now *${config.AUTO_READ ? 'on' : 'off'}*.`, m.key);
    },
  },
  {
    name: 'blocklist',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'List blocked contacts',
    async run(sock, m) {
      const list = await sock.fetchBlocklist();
      await sendText(sock, m.chat, `🚫 *Blocked (${list.length}):*\n${list.map((j) => j.split('@')[0]).join('\n') || 'None'}`, m.key);
    },
  },
  {
    name: 'setbotname',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Set the bot account\u2019s display name',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .setbotname <name>', m.key);
      await sock.updateProfileName(text);
      await sendText(sock, m.chat, `✅ Bot name set to "${text}".`, m.key);
    },
  },
  {
    name: 'setownerpp',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Set the bot\u2019s profile picture from a replied image',
    async run(sock, m) {
      if (!m.quoted || m.quoted.type !== 'imageMessage') return sendText(sock, m.chat, 'Reply to an image.', m.key);
      const buffer = await m.quoted.download();
      await sock.updateProfilePicture(sock.user.id, buffer);
      await sendText(sock, m.chat, '✅ Profile picture updated.', m.key);
    },
  },
  {
    name: 'setprefix',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Change the command prefix',
    async run(sock, m, args) {
      if (!args[0]) return sendText(sock, m.chat, `Current prefixes: ${config.PREFIXES.join(' ')}`, m.key);
      config.PREFIXES = [args[0]];
      await sendText(sock, m.chat, `✅ Prefix set to "${args[0]}"`, m.key);
    },
  },
  {
    name: 'setsudo',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Grant a number sudo (owner-level) access',
    async run(sock, m, args) {
      const num = targetNum(args);
      if (!num) return sendText(sock, m.chat, 'Usage: .setsudo 2637xxxxxxx', m.key);
      if (!settings.bot.sudo.includes(num)) settings.bot.sudo.push(num);
      if (!config.OWNER_NUMBERS.includes(num)) config.OWNER_NUMBERS.push(num);
      await sendText(sock, m.chat, `✅ ${num} is now sudo.`, m.key);
    },
  },
  {
    name: 'unsetsudo',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Revoke sudo access from a number',
    async run(sock, m, args) {
      const num = targetNum(args);
      settings.bot.sudo = settings.bot.sudo.filter((n) => n !== num);
      config.OWNER_NUMBERS = config.OWNER_NUMBERS.filter((n) => n !== num);
      await sendText(sock, m.chat, `✅ ${num} removed from sudo.`, m.key);
    },
  },
  {
    name: 'setmod',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Grant a number moderator status',
    async run(sock, m, args) {
      const num = targetNum(args);
      if (!num) return sendText(sock, m.chat, 'Usage: .setmod 2637xxxxxxx', m.key);
      if (!settings.bot.mods.includes(num)) settings.bot.mods.push(num);
      await sendText(sock, m.chat, `✅ ${num} is now a moderator.`, m.key);
    },
  },
  {
    name: 'unsetmod',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Revoke moderator status',
    async run(sock, m, args) {
      const num = targetNum(args);
      settings.bot.mods = settings.bot.mods.filter((n) => n !== num);
      await sendText(sock, m.chat, `✅ ${num} removed as moderator.`, m.key);
    },
  },
  {
    name: 'setfont',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Set the default font style used by .say-style commands',
    async run(sock, m, args) {
      const font = args[0];
      if (!font) return sendText(sock, m.chat, 'Usage: .setfont <name> — see .fontlist', m.key);
      settings.bot.font = font;
      await sendText(sock, m.chat, `✅ Default font set to "${font}".`, m.key);
    },
  },
  {
    name: 'fontlist',
    aliases: [],
    category: 'Bot User',
    desc: 'List available font styles',
    async run(sock, m) {
      await sendText(sock, m.chat, '🔤 *Fonts:* glitch, wave, neon, square, bold, bubble, script, smallcaps, underwater, cloud\nUse .writetext <text> to preview all of them.', m.key);
    },
  },
  {
    name: 'currentfont',
    aliases: [],
    category: 'Bot User',
    desc: 'Show the currently set default font',
    async run(sock, m) {
      await sendText(sock, m.chat, `🔤 Current font: *${settings.bot.font}*`, m.key);
    },
  },
  {
    name: 'getbotlang',
    aliases: [],
    category: 'Bot User',
    desc: 'Show the bot\u2019s response language',
    async run(sock, m) {
      await sendText(sock, m.chat, `🌐 Bot language: *${settings.bot.lang}*`, m.key);
    },
  },
  {
    name: 'setbotlang',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Set the bot\u2019s response language code',
    async run(sock, m, args) {
      if (!args[0]) return sendText(sock, m.chat, 'Usage: .setbotlang en', m.key);
      settings.bot.lang = args[0];
      await sendText(sock, m.chat, `✅ Bot language set to "${args[0]}".`, m.key);
    },
  },
  {
    name: 'clearcache',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Clear the bot\u2019s in-memory cache',
    async run(sock, m) {
      if (global.gc) global.gc();
      await sendText(sock, m.chat, '🧹 Cache cleared.', m.key);
    },
  },
  {
    name: 'clearchat',
    aliases: [],
    category: 'Bot User',
    desc: 'Clear the current chat on the bot\u2019s device',
    async run(sock, m) {
      await sock.chatModify({ delete: true, lastMessages: [] }, m.chat);
      await sendText(sock, m.chat, '🧹 Chat cleared.', m.key);
    },
  },
  {
    name: 'joingc',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Join a group via invite link',
    async run(sock, m, args) {
      const link = args[0];
      if (!link) return sendText(sock, m.chat, 'Usage: .joingc <invite link>', m.key);
      const code = link.split('/').pop();
      await sock.groupAcceptInvite(code);
      await sendText(sock, m.chat, '✅ Joined the group.', m.key);
    },
  },
  {
    name: 'leavegc',
    aliases: [],
    category: 'Bot User',
    owner: true,
    group: true,
    desc: 'Make the bot leave the current group',
    async run(sock, m) {
      await sendText(sock, m.chat, '👋 Leaving this group...', m.key);
      await sock.groupLeave(m.chat);
    },
  },
  {
    name: 'grouplist',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'List every group the bot is in',
    async run(sock, m) {
      const groups = await sock.groupFetchAllParticipating();
      const list = Object.values(groups);
      await sendText(sock, m.chat, `👥 *Groups (${list.length}):*\n${list.map((g) => `• ${g.subject}`).join('\n')}`, m.key);
    },
  },
  {
    name: 'ownerbroadcast',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Broadcast a message to every group the bot is in',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .ownerbroadcast <message>', m.key);
      const groups = await sock.groupFetchAllParticipating();
      let sent = 0;
      for (const jid of Object.keys(groups)) {
        try { await sendText(sock, jid, `📢 *Announcement*\n\n${text}`, null); sent++; } catch (e) {}
      }
      await sendText(sock, m.chat, `✅ Sent to ${sent} groups.`, m.key);
    },
  },
  {
    name: 'mentionmessage',
    aliases: [],
    category: 'Bot User',
    desc: 'Set the auto-reply sent when someone @mentions the bot',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, `Current message: "${settings.bot.mentionMsg || 'not set'}"\nUsage: .mentionmessage <text>`, m.key);
      settings.bot.mentionMsg = text;
      await sendText(sock, m.chat, '✅ Mention auto-reply updated.', m.key);
    },
  },
  {
    name: 'mentionreact',
    aliases: [],
    category: 'Bot User',
    desc: 'Set the emoji the bot reacts with when mentioned',
    async run(sock, m, args) {
      const emoji = args[0];
      if (!emoji) return sendText(sock, m.chat, 'Usage: .mentionreact 👋', m.key);
      settings.bot.mentionReact = emoji;
      await sendText(sock, m.chat, `✅ Mention reaction set to ${emoji}`, m.key);
    },
  },
  {
    name: 'retrieve',
    aliases: [],
    category: 'Bot User',
    desc: 'Retrieve and resend a quoted message\u2019s raw text',
    async run(sock, m) {
      if (!m.quoted) return sendText(sock, m.chat, 'Reply to a message to retrieve it.', m.key);
      await sendText(sock, m.chat, `📄 *Retrieved:*\n${m.quoted.text || '(no text content)'}`, m.key);
    },
  },
  {
    name: 'avatar',
    aliases: ['pfp'],
    category: 'Bot User',
    desc: 'Get a user\u2019s WhatsApp profile picture',
    async run(sock, m, args) {
      const target = m.mentionedJid?.[0] || m.quoted?.sender || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : m.sender);
      try {
        const url = await sock.profilePictureUrl(target, 'image');
        await require('../lib/sendMsg').sendImage(sock, m.chat, { url }, '🖼️ Profile picture', m.key);
      } catch (e) {
        await sendText(sock, m.chat, 'That user has no visible profile picture.', m.key);
      }
    },
  },
  {
    name: 'chatbotapi',
    aliases: [],
    category: 'Bot User',
    owner: true,
    desc: 'Set the API base/key used by AI-powered commands',
    async run(sock, m, args) {
      if (args.length < 2) return sendText(sock, m.chat, 'Usage: .chatbotapi <base_url> <key>', m.key);
      config.API.BASE = args[0];
      config.API.KEY = args[1];
      await sendText(sock, m.chat, '✅ Chat API updated for this session.', m.key);
    },
  },
];

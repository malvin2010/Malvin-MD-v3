const config = require('../config');
const { forwardedContext } = require('./channelForward');

function footer() {
  return `\n\n> ${config.BOT_NAME} • ${config.CHANNEL_NAME}\n> ${config.CHANNEL_LINK}`;
}

// Every command calls sendText(..., m.key) etc. — m.key is the flat
// {remoteJid, fromMe, id, participant} shape from serialize.js. Baileys'
// `quoted` option actually expects a full message object with a *nested*
// .key (plus .message), so passing the bare key straight through crashes
// inside generateWAMessageFromContent reading `quoted.key.fromMe`. Wrap it
// here once so every command that passes m.key keeps working unchanged.
function normalizeQuoted(quoted) {
  if (!quoted) return undefined;
  if (quoted.key) return quoted; // already a full message object — leave as-is
  return { key: quoted, message: { conversation: '' } };
}

async function sendText(sock, jid, text, quoted, extraCtx = {}) {
  return sock.sendMessage(
    jid,
    {
      text: text + footer(),
      contextInfo: forwardedContext(extraCtx),
    },
    { quoted: normalizeQuoted(quoted) }
  );
}

async function sendImage(sock, jid, buffer, caption = '', quoted, extraCtx = {}) {
  return sock.sendMessage(
    jid,
    {
      image: buffer,
      caption: caption + footer(),
      contextInfo: forwardedContext(extraCtx),
    },
    { quoted: normalizeQuoted(quoted) }
  );
}

async function sendVideo(sock, jid, buffer, caption = '', quoted, extraCtx = {}, opts = {}) {
  return sock.sendMessage(
    jid,
    {
      video: buffer,
      caption: caption + footer(),
      contextInfo: forwardedContext(extraCtx),
      ...opts,
    },
    { quoted: normalizeQuoted(quoted) }
  );
}

async function sendAudio(sock, jid, buffer, quoted, ptt = false, extraCtx = {}) {
  return sock.sendMessage(
    jid,
    {
      audio: buffer,
      mimetype: 'audio/mp4',
      ptt,
      contextInfo: forwardedContext(extraCtx),
    },
    { quoted: normalizeQuoted(quoted) }
  );
}

async function sendDocument(sock, jid, buffer, fileName, mimetype, quoted, extraCtx = {}) {
  return sock.sendMessage(
    jid,
    {
      document: buffer,
      fileName,
      mimetype,
      caption: footer(),
      contextInfo: forwardedContext(extraCtx),
    },
    { quoted: normalizeQuoted(quoted) }
  );
}

async function sendSticker(sock, jid, buffer, quoted, extraCtx = {}) {
  return sock.sendMessage(
    jid,
    {
      sticker: buffer,
      contextInfo: forwardedContext(extraCtx),
    },
    { quoted: normalizeQuoted(quoted) }
  );
}

async function sendButtons(sock, jid, text, buttons, quoted, image, extraCtx = {}) {
  const payload = {
    text: text + footer(),
    footer: config.BOT_NAME,
    buttons,
    headerType: image ? 4 : 1,
    contextInfo: forwardedContext(extraCtx),
  };
  if (image) payload.image = image;
  return sock.sendMessage(jid, payload, { quoted: normalizeQuoted(quoted) });
}

// Interactive WhatsApp list message — tapping a row sends its rowId back as
// a normal text message, which lib/serialize.js already unpacks into m.body,
// so a rowId like ".menu economy" is handled exactly like the user typed it.
async function sendList(sock, jid, { title, text, buttonText, sections }, quoted, extraCtx = {}) {
  const payload = {
    text: text + footer(),
    footer: config.BOT_NAME,
    title,
    buttonText: buttonText || 'Open Menu',
    sections,
    contextInfo: forwardedContext(extraCtx),
  };
  return sock.sendMessage(jid, payload, { quoted: normalizeQuoted(quoted) });
}

module.exports = {
  sendText,
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  sendSticker,
  sendButtons,
  sendList,
  footer,
};

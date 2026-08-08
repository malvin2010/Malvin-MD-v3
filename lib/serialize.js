const config = require('../config');

function getContentType(message) {
  if (!message) return null;
  const keys = Object.keys(message);
  return keys.find((k) =>
    [
      'conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage',
      'audioMessage', 'stickerMessage', 'documentMessage', 'contactMessage',
      'locationMessage', 'buttonsResponseMessage', 'listResponseMessage',
      'templateButtonReplyMessage',
    ].includes(k)
  );
}

function extractText(message) {
  if (!message) return '';
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  );
}

function serialize(msg, sock) {
  const m = {};
  m.key = msg.key;
  m.id = msg.key.id;
  m.chat = msg.key.remoteJid;
  m.isGroup = m.chat.endsWith('@g.us');
  m.fromMe = msg.key.fromMe;
  // For a DM you sent yourself, key.remoteJid is who you sent it TO, not you —
  // the real sender is your own paired account. Group messages already carry
  // the correct sender in key.participant either way.
  m.sender = m.isGroup ? msg.key.participant : (m.fromMe ? sock.user.id : msg.key.remoteJid);
  m.pushName = msg.pushName || 'Unknown';
  m.type = getContentType(msg.message);
  m.body = extractText(msg.message);
  m.message = msg.message;

  const ctx =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    null;

  m.quoted = ctx?.quotedMessage
    ? {
        message: ctx.quotedMessage,
        id: ctx.stanzaId,
        sender: ctx.participant,
        type: getContentType(ctx.quotedMessage),
        body: extractText(ctx.quotedMessage),
      }
    : null;

  m.mentionedJid = ctx?.mentionedJid || [];

  m.reply = async (text, opts = {}) => {
    return sock.sendMessage(m.chat, { text, ...opts }, { quoted: msg });
  };

  return m;
}

module.exports = { serialize, getContentType, extractText };

const { sendText } = require('../lib/sendMsg');

// Unicode character map styling. Each style maps a-z/A-Z/0-9 to a unicode block.
const MAPS = {
  glitch: (s) => s.split('').map((c) => c + [..."\u0300\u0301\u0336\u0334\u0338"].sort(() => Math.random() - 0.5).slice(0, 2).join('')).join(''),
  neon: (s) => `『${s.split('').join('͟')}』`,
  circled: (() => {
    const lower = 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ';
    const upper = 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ';
    return (s) => s.split('').map((c) => {
      if (/[a-z]/.test(c)) return lower[c.charCodeAt(0) - 97];
      if (/[A-Z]/.test(c)) return upper[c.charCodeAt(0) - 65];
      return c;
    }).join('');
  })(),
  bold: (() => {
    const lower = '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇';
    const upper = '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭';
    return (s) => s.split('').map((c) => {
      if (/[a-z]/.test(c)) return lower[c.charCodeAt(0) - 97];
      if (/[A-Z]/.test(c)) return upper[c.charCodeAt(0) - 65];
      return c;
    }).join('');
  })(),
  script: (() => {
    const lower = '𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃';
    const upper = '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩';
    return (s) => s.split('').map((c) => {
      if (/[a-z]/.test(c)) return lower[c.charCodeAt(0) - 97];
      if (/[A-Z]/.test(c)) return upper[c.charCodeAt(0) - 65];
      return c;
    }).join('');
  })(),
  bubble: (() => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return (s) => s.split('').map((c) => {
      if (lower.includes(c)) return String.fromCodePoint(0x24d0 + lower.indexOf(c));
      if (upper.includes(c)) return String.fromCodePoint(0x24b6 + upper.indexOf(c));
      return c;
    }).join('');
  })(),
  smallcaps: (() => {
    const map = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' };
    return (s) => s.toLowerCase().split('').map((c) => map[c] || c).join('');
  })(),
  wave: (s) => s.split('').map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase())).join(''),
  strike: (s) => s.split('').map((c) => c + '\u0336').join(''),
  underline: (s) => s.split('').map((c) => c + '\u0332').join(''),
  square: (() => {
    const upper = '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉';
    return (s) => s.toUpperCase().split('').map((c) => /[A-Z]/.test(c) ? upper[c.charCodeAt(0) - 65] : c).join('');
  })(),
};

function frame(styled, deco) {
  return `${deco[0]} ${styled} ${deco[1]}`;
}

function makeStyleCommand(name, aliases, mapKey, decoBefore, decoAfter, prettyName) {
  return {
    name,
    aliases,
    category: 'Textmaker',
    desc: `Style text as ${prettyName}`,
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, `Usage: .${name} <text>`, m.key);
      const styled = MAPS[mapKey](text);
      await sendText(sock, m.chat, decoBefore ? frame(styled, [decoBefore, decoAfter]) : styled, m.key);
    },
  };
}

module.exports = [
  makeStyleCommand('glitchtext', ['glitch'], 'glitch', '҉', '҉', 'glitch'),
  makeStyleCommand('gradienttext', ['gradient'], 'wave', '', '', 'wave/gradient case'),
  makeStyleCommand('neonglitch', [], 'neon', '', '', 'neon'),
  makeStyleCommand('pixelglitch', [], 'square', '▓', '▓', 'pixel square'),
  makeStyleCommand('makingneon', ['neontext'], 'neon', '✦', '✦', 'neon sign'),
  makeStyleCommand('advancedglow', ['glow'], 'bold', '✧', '✧', 'bold glow'),
  makeStyleCommand('effectclouds', ['clouds'], 'bubble', '☁️', '☁️', 'bubble cloud'),
  makeStyleCommand('sandsummer', ['summer'], 'script', '🏖️', '🏖️', 'script summer'),
  makeStyleCommand('style1917', [], 'smallcaps', '', '', 'vintage smallcaps'),
  makeStyleCommand('underwatertext', ['underwater'], 'circled', '🌊', '🌊', 'circled underwater'),
  makeStyleCommand('freecreate', ['fancytext'], 'bold', '', '', 'bold fancy'),
  {
    name: 'writetext',
    aliases: ['fonts'],
    category: 'Textmaker',
    desc: 'Show text rendered in every available font style',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .writetext <text>', m.key);
      let out = `✒️ *Font styles for:* ${text}\n\n`;
      for (const [key, fn] of Object.entries(MAPS)) out += `${key}: ${fn(text)}\n`;
      await sendText(sock, m.chat, out, m.key);
    },
  },
  {
    name: 'flip',
    aliases: ['upsidedown'],
    category: 'Unicode',
    desc: 'Flip text upside down',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .flip <text>', m.key);
      const map = { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z' };
      const flipped = text.toLowerCase().split('').reverse().map((c) => map[c] || c).join('');
      await sendText(sock, m.chat, flipped, m.key);
    },
  },
];

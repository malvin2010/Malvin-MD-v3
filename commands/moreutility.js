const crypto = require('crypto');
const { sendText } = require('../lib/sendMsg');

function need(m, usage) {
  return sendText(m.sockRef, m.chat, usage, m.key);
}

module.exports = [
  {
    name: 'uuid',
    aliases: [],
    category: 'Utility',
    desc: 'Generate a random UUID v4',
    async run(sock, m) { await sendText(sock, m.chat, `🆔 ${crypto.randomUUID()}`, m.key); },
  },
  {
    name: 'password',
    aliases: ['genpass'],
    category: 'Utility',
    desc: 'Generate a secure random password',
    async run(sock, m, args) {
      const len = Math.min(Math.max(parseInt(args[0]) || 16, 6), 64);
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let pass = '';
      for (let i = 0; i < len; i++) pass += chars[crypto.randomInt(chars.length)];
      await sendText(sock, m.chat, `🔑 *Generated password:*\n\`${pass}\``, m.key);
    },
  },
  {
    name: 'md5',
    aliases: [],
    category: 'Utility',
    desc: 'Hash text using MD5',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .md5 <text>', m.key);
      await sendText(sock, m.chat, `🔐 ${crypto.createHash('md5').update(text).digest('hex')}`, m.key);
    },
  },
  {
    name: 'sha1',
    aliases: [],
    category: 'Utility',
    desc: 'Hash text using SHA-1',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .sha1 <text>', m.key);
      await sendText(sock, m.chat, `🔐 ${crypto.createHash('sha1').update(text).digest('hex')}`, m.key);
    },
  },
  {
    name: 'sha256',
    aliases: [],
    category: 'Utility',
    desc: 'Hash text using SHA-256',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .sha256 <text>', m.key);
      await sendText(sock, m.chat, `🔐 ${crypto.createHash('sha256').update(text).digest('hex')}`, m.key);
    },
  },
  {
    name: 'caesar',
    aliases: [],
    category: 'Utility',
    desc: 'Encode text with a Caesar cipher shift',
    async run(sock, m, args) {
      const shift = parseInt(args[0]) || 3;
      const text = args.slice(1).join(' ');
      if (!text) return sendText(sock, m.chat, 'Usage: .caesar <shift> <text>', m.key);
      const out = text.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
      });
      await sendText(sock, m.chat, `🔐 ${out}`, m.key);
    },
  },
  {
    name: 'rot13',
    aliases: [],
    category: 'Utility',
    desc: 'Encode/decode text with ROT13',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .rot13 <text>', m.key);
      const out = text.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
      });
      await sendText(sock, m.chat, `🔐 ${out}`, m.key);
    },
  },
  {
    name: 'leet',
    aliases: ['1337'],
    category: 'Utility',
    desc: 'Convert text to leetspeak',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .leet <text>', m.key);
      const map = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', b: '8', g: '9' };
      const out = text.toLowerCase().split('').map((c) => map[c] || c).join('');
      await sendText(sock, m.chat, out, m.key);
    },
  },
  {
    name: 'mock',
    aliases: ['spongebob'],
    category: 'Utility',
    desc: 'sPoNgEbOb-case a sentence',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .mock <text>', m.key);
      const out = text.split('').map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join('');
      await sendText(sock, m.chat, out, m.key);
    },
  },
  {
    name: 'slugify',
    aliases: [],
    category: 'Utility',
    desc: 'Convert text into a url-slug',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .slugify <text>', m.key);
      const slug = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await sendText(sock, m.chat, slug, m.key);
    },
  },
  {
    name: 'capitalize',
    aliases: [],
    category: 'Utility',
    desc: 'Capitalize the first letter of each word',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .capitalize <text>', m.key);
      await sendText(sock, m.chat, text.replace(/\b\w/g, (c) => c.toUpperCase()), m.key);
    },
  },
  {
    name: 'upper',
    aliases: [],
    category: 'Utility',
    desc: 'Convert text to UPPERCASE',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .upper <text>', m.key);
      await sendText(sock, m.chat, text.toUpperCase(), m.key);
    },
  },
  {
    name: 'lower',
    aliases: [],
    category: 'Utility',
    desc: 'Convert text to lowercase',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .lower <text>', m.key);
      await sendText(sock, m.chat, text.toLowerCase(), m.key);
    },
  },
  {
    name: 'title',
    aliases: [],
    category: 'Utility',
    desc: 'Convert text to Title Case',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .title <text>', m.key);
      await sendText(sock, m.chat, text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()), m.key);
    },
  },
  {
    name: 'mirror',
    aliases: [],
    category: 'Utility',
    desc: 'Reverse each word\u2019s letters but keep word order',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .mirror <text>', m.key);
      await sendText(sock, m.chat, text.split(' ').map((w) => w.split('').reverse().join('')).join(' '), m.key);
    },
  },
  {
    name: 'charcount',
    aliases: [],
    category: 'Utility',
    desc: 'Count characters in text',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .charcount <text>', m.key);
      await sendText(sock, m.chat, `🔢 ${text.length} characters`, m.key);
    },
  },
  {
    name: 'vowelcount',
    aliases: [],
    category: 'Utility',
    desc: 'Count vowels in text',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .vowelcount <text>', m.key);
      const count = (text.match(/[aeiouAEIOU]/g) || []).length;
      await sendText(sock, m.chat, `🔢 ${count} vowels`, m.key);
    },
  },
  {
    name: 'wcount',
    aliases: [],
    category: 'Utility',
    desc: 'Count words in text',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .wcount <text>', m.key);
      await sendText(sock, m.chat, `🔢 ${text.trim().split(/\s+/).filter(Boolean).length} words`, m.key);
    },
  },
  {
    name: 'len',
    aliases: [],
    category: 'Utility',
    desc: 'Alias for .charcount',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .len <text>', m.key);
      await sendText(sock, m.chat, `🔢 ${text.length}`, m.key);
    },
  },
  {
    name: 'dedupe',
    aliases: [],
    category: 'Utility',
    desc: 'Remove duplicate words from text',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .dedupe <text>', m.key);
      await sendText(sock, m.chat, [...new Set(text.split(/\s+/))].join(' '), m.key);
    },
  },
  {
    name: 'factorial',
    aliases: [],
    category: 'Utility',
    desc: 'Calculate n!',
    async run(sock, m, args) {
      const n = parseInt(args[0]);
      if (isNaN(n) || n < 0 || n > 170) return sendText(sock, m.chat, 'Usage: .factorial <0-170>', m.key);
      let r = 1n;
      for (let i = 2; i <= n; i++) r *= BigInt(i);
      await sendText(sock, m.chat, `🔢 ${n}! = ${r}`, m.key);
    },
  },
  {
    name: 'fibonacci',
    aliases: ['fib'],
    category: 'Utility',
    desc: 'Show the first n Fibonacci numbers',
    async run(sock, m, args) {
      const n = Math.min(parseInt(args[0]) || 10, 50);
      const seq = [0, 1];
      while (seq.length < n) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      await sendText(sock, m.chat, `🔢 ${seq.slice(0, n).join(', ')}`, m.key);
    },
  },
  {
    name: 'prime',
    aliases: ['isprime'],
    category: 'Utility',
    desc: 'Check if a number is prime',
    async run(sock, m, args) {
      const n = parseInt(args[0]);
      if (isNaN(n)) return sendText(sock, m.chat, 'Usage: .prime <number>', m.key);
      let isPrime = n > 1;
      for (let i = 2; i * i <= n; i++) if (n % i === 0) { isPrime = false; break; }
      await sendText(sock, m.chat, `${n} is ${isPrime ? '' : 'not '}a prime number.`, m.key);
    },
  },
  {
    name: 'gcd',
    aliases: [],
    category: 'Utility',
    desc: 'Greatest common divisor of two numbers',
    async run(sock, m, args) {
      let [a, b] = args.map(Number);
      if (isNaN(a) || isNaN(b)) return sendText(sock, m.chat, 'Usage: .gcd <a> <b>', m.key);
      while (b) { [a, b] = [b, a % b]; }
      await sendText(sock, m.chat, `🔢 GCD = ${Math.abs(a)}`, m.key);
    },
  },
  {
    name: 'lcm',
    aliases: [],
    category: 'Utility',
    desc: 'Least common multiple of two numbers',
    async run(sock, m, args) {
      let [a, b] = args.map(Number);
      if (isNaN(a) || isNaN(b)) return sendText(sock, m.chat, 'Usage: .lcm <a> <b>', m.key);
      const gcd = (x, y) => (y ? gcd(y, x % y) : x);
      await sendText(sock, m.chat, `🔢 LCM = ${Math.abs(a * b) / gcd(a, b)}`, m.key);
    },
  },
  {
    name: 'roman',
    aliases: [],
    category: 'Utility',
    desc: 'Convert a number to Roman numerals',
    async run(sock, m, args) {
      let n = parseInt(args[0]);
      if (isNaN(n) || n <= 0 || n > 3999) return sendText(sock, m.chat, 'Usage: .roman <1-3999>', m.key);
      const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let out = '';
      for (const [val, sym] of table) while (n >= val) { out += sym; n -= val; }
      await sendText(sock, m.chat, `🏛️ ${out}`, m.key);
    },
  },
  {
    name: 'bin',
    aliases: [],
    category: 'Utility',
    desc: 'Convert a decimal number to binary',
    async run(sock, m, args) {
      const n = parseInt(args[0]);
      if (isNaN(n)) return sendText(sock, m.chat, 'Usage: .bin <number>', m.key);
      await sendText(sock, m.chat, `🔢 ${n.toString(2)}`, m.key);
    },
  },
  {
    name: 'unbin',
    aliases: [],
    category: 'Utility',
    desc: 'Convert binary back to a decimal number',
    async run(sock, m, args) {
      if (!args[0]) return sendText(sock, m.chat, 'Usage: .unbin <binary>', m.key);
      await sendText(sock, m.chat, `🔢 ${parseInt(args[0], 2)}`, m.key);
    },
  },
  {
    name: 'hexencode',
    aliases: [],
    category: 'Utility',
    desc: 'Encode text to hex',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .hexencode <text>', m.key);
      await sendText(sock, m.chat, Buffer.from(text).toString('hex'), m.key);
    },
  },
  {
    name: 'hexdecode',
    aliases: [],
    category: 'Utility',
    desc: 'Decode hex back to text',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .hexdecode <hex>', m.key);
      try { await sendText(sock, m.chat, Buffer.from(text, 'hex').toString('utf-8'), m.key); }
      catch (e) { await sendText(sock, m.chat, 'Invalid hex string.', m.key); }
    },
  },
  {
    name: 'asciicode',
    aliases: [],
    category: 'Utility',
    desc: 'Show ASCII codes of each character',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .asciicode <text>', m.key);
      await sendText(sock, m.chat, text.split('').map((c) => c.charCodeAt(0)).join(' '), m.key);
    },
  },
  {
    name: 'unascii',
    aliases: [],
    category: 'Utility',
    desc: 'Convert ASCII codes back to text',
    async run(sock, m, args) {
      if (!args.length) return sendText(sock, m.chat, 'Usage: .unascii 72 105', m.key);
      await sendText(sock, m.chat, args.map((n) => String.fromCharCode(parseInt(n))).join(''), m.key);
    },
  },
  {
    name: 'bmi',
    aliases: [],
    category: 'Utility',
    desc: 'Calculate Body Mass Index',
    async run(sock, m, args) {
      const [kg, cm] = args.map(Number);
      if (!kg || !cm) return sendText(sock, m.chat, 'Usage: .bmi <kg> <cm>', m.key);
      const bmi = kg / ((cm / 100) ** 2);
      let cat = 'Normal';
      if (bmi < 18.5) cat = 'Underweight';
      else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
      else if (bmi >= 30) cat = 'Obese';
      await sendText(sock, m.chat, `⚖️ BMI: ${bmi.toFixed(1)} (${cat})`, m.key);
    },
  },
  {
    name: 'age',
    aliases: [],
    category: 'Utility',
    desc: 'Calculate age from a birth year',
    async run(sock, m, args) {
      const year = parseInt(args[0]);
      if (!year) return sendText(sock, m.chat, 'Usage: .age <birth year>', m.key);
      await sendText(sock, m.chat, `🎂 You are approximately ${new Date().getFullYear() - year} years old.`, m.key);
    },
  },
  {
    name: 'percent',
    aliases: ['pct'],
    category: 'Utility',
    desc: 'Calculate what % one number is of another',
    async run(sock, m, args) {
      const [part, whole] = args.map(Number);
      if (!part || !whole) return sendText(sock, m.chat, 'Usage: .percent <part> <whole>', m.key);
      await sendText(sock, m.chat, `📊 ${((part / whole) * 100).toFixed(2)}%`, m.key);
    },
  },
  {
    name: 'hexcolor',
    aliases: ['color'],
    category: 'Utility',
    desc: 'Get RGB values for a hex color code',
    async run(sock, m, args) {
      const hex = (args[0] || '').replace('#', '');
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) return sendText(sock, m.chat, 'Usage: .hexcolor #RRGGBB', m.key);
      const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
      await sendText(sock, m.chat, `🎨 #${hex}\nRGB: (${r}, ${g}, ${b})`, m.key);
    },
  },
  {
    name: 'timezone',
    aliases: [],
    category: 'Utility',
    desc: 'Show the current time in a given timezone',
    async run(sock, m, args) {
      const moment = require('moment-timezone');
      const tz = args[0] || 'UTC';
      if (!moment.tz.zone(tz)) return sendText(sock, m.chat, 'Usage: .timezone Africa/Harare', m.key);
      await sendText(sock, m.chat, `🕐 ${tz}: ${moment().tz(tz).format('YYYY-MM-DD HH:mm:ss')}`, m.key);
    },
  },
  {
    name: 'time2',
    aliases: [],
    category: 'General',
    desc: 'Show the current UTC time',
    async run(sock, m) {
      await sendText(sock, m.chat, `🕐 UTC: ${new Date().toUTCString()}`, m.key);
    },
  },
  {
    name: 'datefmt',
    aliases: [],
    category: 'Utility',
    desc: 'Format today\u2019s date in different styles',
    async run(sock, m) {
      const moment = require('moment-timezone');
      const now = moment();
      await sendText(sock, m.chat, `📅 ISO: ${now.format('YYYY-MM-DD')}\nLong: ${now.format('dddd, MMMM Do YYYY')}\nShort: ${now.format('DD/MM/YY')}`, m.key);
    },
  },
  {
    name: 'calendar',
    aliases: [],
    category: 'Utility',
    desc: 'Show the current month\u2019s calendar',
    async run(sock, m) {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      let out = `📅 *${first.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}*\nSu Mo Tu We Th Fr Sa\n`;
      out += '   '.repeat(first.getDay());
      for (let d = 1; d <= days; d++) {
        out += String(d).padStart(2, ' ') + ' ';
        if ((d + first.getDay()) % 7 === 0) out += '\n';
      }
      await sendText(sock, m.chat, out, m.key);
    },
  },
  {
    name: 'zodiac',
    aliases: [],
    category: 'General',
    desc: 'Get your zodiac sign from your birthday (DD MM)',
    async run(sock, m, args) {
      const [d, mo] = args.map(Number);
      if (!d || !mo) return sendText(sock, m.chat, 'Usage: .zodiac <day> <month>', m.key);
      const signs = [[20, 'Capricorn'], [19, 'Aquarius'], [21, 'Pisces'], [20, 'Aries'], [21, 'Taurus'], [21, 'Gemini'], [22, 'Cancer'], [23, 'Leo'], [23, 'Virgo'], [23, 'Libra'], [22, 'Scorpio'], [22, 'Sagittarius'], [31, 'Capricorn']];
      const sign = d < signs[mo - 1][0] ? signs[mo - 1][1] : signs[mo][1];
      await sendText(sock, m.chat, `♈ Your zodiac sign: *${sign}*`, m.key);
    },
  },
  {
    name: 'chinese',
    aliases: [],
    category: 'General',
    desc: 'Get your Chinese zodiac animal from a birth year',
    async run(sock, m, args) {
      const year = parseInt(args[0]);
      if (!year) return sendText(sock, m.chat, 'Usage: .chinese <birth year>', m.key);
      const animals = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
      await sendText(sock, m.chat, `🐉 ${year} is the year of the *${animals[year % 12]}*`, m.key);
    },
  },
  {
    name: 'device',
    aliases: [],
    category: 'General',
    desc: 'Show which WhatsApp client a user is on (best-effort)',
    async run(sock, m) {
      await sendText(sock, m.chat, 'ℹ️ WhatsApp doesn\u2019t expose device info via the bot API for privacy reasons.', m.key);
    },
  },
  {
    name: 'coinflip',
    aliases: ['coin'],
    category: 'Fun',
    desc: 'Flip a coin',
    async run(sock, m) {
      await sendText(sock, m.chat, `🪙 ${Math.random() < 0.5 ? 'Heads' : 'Tails'}`, m.key);
    },
  },
  {
    name: 'dice',
    aliases: [],
    category: 'Fun',
    desc: 'Roll a six-sided die',
    async run(sock, m) {
      await sendText(sock, m.chat, `🎲 You rolled a ${1 + Math.floor(Math.random() * 6)}`, m.key);
    },
  },
  {
    name: 'edice',
    aliases: [],
    category: 'Fun',
    desc: 'Roll a die with emoji output',
    async run(sock, m) {
      const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      await sendText(sock, m.chat, faces[Math.floor(Math.random() * 6)], m.key);
    },
  },
];

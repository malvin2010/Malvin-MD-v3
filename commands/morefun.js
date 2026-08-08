const { sendText } = require('../lib/sendMsg');

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const ACTIONS = {
  hug: '🤗 wraps {t} in a warm hug!',
  pat: '🖐️ gives {t} a gentle pat on the head.',
  poke: '👉 pokes {t}!',
  slap: '👋 slaps {t} playfully!',
  smack: '💥 smacks {t}!',
  punch: '👊 throws a friendly punch at {t}!',
  bonk: '🔨 bonks {t} on the head!',
  kiss: '😘 blows a kiss to {t}.',
  wink: '😉 winks at {t}.',
  blush: '☺️ blushes looking at {t}.',
  cry: '😭 cries dramatically at {t}.',
  kill: '💀 dramatically "eliminates" {t} in the game.',
  burn: '🔥 roasts {t} with a savage comeback.',
  awoo: '🐺 awoos at {t}!',
};

function actionCmd(name, aliases) {
  return {
    name,
    aliases,
    category: 'Fun',
    desc: `Send a playful ${name} reaction`,
    async run(sock, m, args) {
      const target = m.mentionedJid?.[0] ? `@${m.mentionedJid[0].split('@')[0]}` : (args[0] || 'everyone');
      const text = ACTIONS[name].replace('{t}', target);
      await sendText(sock, m.chat, text, m.key, { mentionedJid: m.mentionedJid || [] });
    },
  };
}

const JOKES = [
  "I told my computer I needed a break, and it said 'no problem, I'll go to sleep.'",
  "Why don't scientists trust atoms? Because they make up everything.",
  "I'm reading a book about anti-gravity. It's impossible to put down.",
  "Parallel lines have so much in common. It's a shame they'll never meet.",
];
const FACTS = [
  'Honey never spoils — archaeologists have found 3000-year-old honey that\u2019s still edible.',
  'Octopuses have three hearts and blue blood.',
  'Bananas are berries, but strawberries aren\u2019t.',
  'A day on Venus is longer than a year on Venus.',
];
const ADVICE = [
  'Take a deep breath before replying when you\u2019re frustrated.',
  'Small consistent steps beat big sporadic bursts.',
  'It\u2019s okay to say no to protect your time.',
];
const PICKUP = [
  'Are you a parking ticket? Because you\u2019ve got FINE written all over you.',
  'Do you have a map? I keep getting lost in your eyes.',
];
const YOMAMA = [
  "Yo mama's so nice, even this bot likes her.",
  "Yo mama's so smart she'd solve this riddle before I finish typing it.",
];
const MOTIVATE = [
  'You didn\u2019t come this far to only come this far. Keep going.',
  'Progress, not perfection.',
];

module.exports = [
  ...Object.keys(ACTIONS).map((name) => actionCmd(name, [])),
  {
    name: 'insult',
    aliases: [],
    category: 'Fun',
    desc: 'Send a light-hearted joke insult',
    async run(sock, m, args) {
      const target = m.mentionedJid?.[0] ? `@${m.mentionedJid[0].split('@')[0]}` : (args[0] || 'you');
      await sendText(sock, m.chat, `😏 ${target}, even your WiFi disconnects to avoid you. (all in good fun!)`, m.key, { mentionedJid: m.mentionedJid || [] });
    },
  },
  {
    name: 'simp',
    aliases: [],
    category: 'Fun',
    desc: 'Check someone\u2019s simp percentage (random, for laughs)',
    async run(sock, m, args) {
      const target = m.mentionedJid?.[0] ? `@${m.mentionedJid[0].split('@')[0]}` : 'You';
      await sendText(sock, m.chat, `💘 ${target}'s simp level: ${Math.floor(Math.random() * 101)}%`, m.key, { mentionedJid: m.mentionedJid || [] });
    },
  },
  {
    name: 'yomama',
    aliases: [],
    category: 'Fun',
    desc: 'Random yo mama joke',
    async run(sock, m) { await sendText(sock, m.chat, pick(YOMAMA), m.key); },
  },
  {
    name: 'dadjoke',
    aliases: [],
    category: 'Fun',
    desc: 'Random dad joke',
    async run(sock, m) { await sendText(sock, m.chat, pick(JOKES), m.key); },
  },
  {
    name: 'pickup',
    aliases: [],
    category: 'Fun',
    desc: 'Random cheesy pickup line',
    async run(sock, m) { await sendText(sock, m.chat, pick(PICKUP), m.key); },
  },
  {
    name: 'motivate2',
    aliases: ['motivate'],
    category: 'Fun',
    desc: 'Get a motivational line',
    async run(sock, m) { await sendText(sock, m.chat, `💪 ${pick(MOTIVATE)}`, m.key); },
  },
  {
    name: 'advice',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random piece of advice',
    async run(sock, m) { await sendText(sock, m.chat, `💡 ${pick(ADVICE)}`, m.key); },
  },
  {
    name: 'brainteaser',
    aliases: [],
    category: 'Fun',
    desc: 'Get a brain teaser',
    async run(sock, m) { await sendText(sock, m.chat, '🧠 The more you take, the more you leave behind. What am I?\n(reply .answer to guess — hint: footsteps)', m.key); },
  },
  {
    name: 'answer',
    aliases: [],
    category: 'Fun',
    desc: 'Answer key for the last brain teaser',
    async run(sock, m) { await sendText(sock, m.chat, '🧠 Answer: footsteps.', m.key); },
  },
  {
    name: 'chucknorris',
    aliases: [],
    category: 'Fun',
    desc: 'Random Chuck Norris style joke',
    async run(sock, m) { await sendText(sock, m.chat, pick(['Chuck Norris can divide by zero.', 'Chuck Norris counted to infinity, twice.']), m.key); },
  },
  {
    name: 'iq',
    aliases: [],
    category: 'Fun',
    desc: 'Random (joke) IQ score generator',
    async run(sock, m) { await sendText(sock, m.chat, `🧠 Your IQ today: ${40 + Math.floor(Math.random() * 130)} (just for fun!)`, m.key); },
  },
  {
    name: 'lovecalc',
    aliases: [],
    category: 'Fun',
    desc: 'Calculate a joke love percentage between two names',
    async run(sock, m, args) {
      if (args.length < 2) return sendText(sock, m.chat, 'Usage: .lovecalc <name1> <name2>', m.key);
      const pct = (args[0].length + args[1].length) * 7 % 101;
      await sendText(sock, m.chat, `💞 ${args[0]} + ${args[1]} = ${pct}% match`, m.key);
    },
  },
  {
    name: 'match',
    aliases: [],
    category: 'Fun',
    desc: 'Alias for .lovecalc',
    async run(sock, m, args) {
      if (args.length < 2) return sendText(sock, m.chat, 'Usage: .match <name1> <name2>', m.key);
      const pct = (args[0].length * 3 + args[1].length * 5) % 101;
      await sendText(sock, m.chat, `💞 Match: ${pct}%`, m.key);
    },
  },
  {
    name: 'rate',
    aliases: [],
    category: 'Fun',
    desc: 'Rate anything out of 10 (for fun)',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .rate <thing>', m.key);
      await sendText(sock, m.chat, `⭐ I\u2019d rate "${text}" ${Math.floor(Math.random() * 11)}/10`, m.key);
    },
  },
  {
    name: 'colorname',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random color name',
    async run(sock, m) { await sendText(sock, m.chat, `🎨 ${pick(['Cerulean', 'Vermilion', 'Chartreuse', 'Periwinkle', 'Mauve', 'Amber'])}`, m.key); },
  },
  {
    name: 'randomanimal',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random animal',
    async run(sock, m) { await sendText(sock, m.chat, `🐾 ${pick(['Elephant', 'Otter', 'Falcon', 'Panda', 'Fox', 'Owl'])}`, m.key); },
  },
  {
    name: 'randomanime',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random anime title suggestion',
    async run(sock, m) { await sendText(sock, m.chat, `📺 ${pick(['Naruto', 'One Piece', 'Fullmetal Alchemist', 'Death Note', 'Attack on Titan'])}`, m.key); },
  },
  {
    name: 'randomcity',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random city',
    async run(sock, m) { await sendText(sock, m.chat, `🏙️ ${pick(['Tokyo', 'Harare', 'Lagos', 'Nairobi', 'Cape Town', 'Cairo'])}`, m.key); },
  },
  {
    name: 'randomcountry',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random country',
    async run(sock, m) { await sendText(sock, m.chat, `🌍 ${pick(['Zimbabwe', 'Japan', 'Brazil', 'Kenya', 'Canada', 'Nigeria'])}`, m.key); },
  },
  {
    name: 'randomdrink',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random (non-alcoholic) drink suggestion',
    async run(sock, m) { await sendText(sock, m.chat, `🥤 ${pick(['Mango smoothie', 'Iced coffee', 'Lemonade', 'Ginger tea', 'Sparkling water'])}`, m.key); },
  },
  {
    name: 'randomfood',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random food suggestion',
    async run(sock, m) { await sendText(sock, m.chat, `🍽️ ${pick(['Sadza and stew', 'Sushi', 'Jollof rice', 'Pizza', 'Tacos'])}`, m.key); },
  },
  {
    name: 'randomletter',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random letter',
    async run(sock, m) { await sendText(sock, m.chat, pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), m.key); },
  },
  {
    name: 'randomname',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random name suggestion',
    async run(sock, m) { await sendText(sock, m.chat, pick(['Tino', 'Amara', 'Kofi', 'Zanele', 'Rui', 'Ines']), m.key); },
  },
  {
    name: 'randomnumber',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random number in a range',
    async run(sock, m, args) {
      const [min, max] = [parseInt(args[0]) || 1, parseInt(args[1]) || 100];
      await sendText(sock, m.chat, `🔢 ${min + Math.floor(Math.random() * (max - min + 1))}`, m.key);
    },
  },
  {
    name: 'randompokemon',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random Pok\u00e9mon name',
    async run(sock, m) { await sendText(sock, m.chat, pick(['Pikachu', 'Charizard', 'Bulbasaur', 'Snorlax', 'Eevee', 'Gengar']), m.key); },
  },
  {
    name: 'randomword',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random English word',
    async run(sock, m) { await sendText(sock, m.chat, pick(['serendipity', 'ephemeral', 'luminous', 'wanderlust', 'mosaic']), m.key); },
  },
  {
    name: 'randomemoji',
    aliases: [],
    category: 'Fun',
    desc: 'Get a random emoji',
    async run(sock, m) { await sendText(sock, m.chat, pick(['😂', '🔥', '🎉', '🐢', '🍀', '🚀']), m.key); },
  },
  {
    name: 'emoji',
    aliases: [],
    category: 'Fun',
    desc: 'Search for an emoji matching a keyword',
    async run(sock, m, args, { text }) {
      const map = { happy: '😄', sad: '😢', love: '❤️', fire: '🔥', star: '⭐', cool: '😎' };
      await sendText(sock, m.chat, map[(text || '').toLowerCase()] || '🤔', m.key);
    },
  },
  {
    name: 'lorem',
    aliases: [],
    category: 'Fun',
    desc: 'Generate placeholder lorem ipsum text',
    async run(sock, m, args) {
      const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' ');
      const n = Math.min(parseInt(args[0]) || 20, 200);
      let out = [];
      for (let i = 0; i < n; i++) out.push(pick(words));
      await sendText(sock, m.chat, out.join(' ') + '.', m.key);
    },
  },
  {
    name: 'owofy',
    aliases: [],
    category: 'Fun',
    desc: 'OwO-ify text',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .owofy <text>', m.key);
      const out = text.replace(/[rl]/g, 'w').replace(/[RL]/g, 'W') + ' owo';
      await sendText(sock, m.chat, out, m.key);
    },
  },
  {
    name: 'friendship',
    aliases: [],
    category: 'Fun',
    desc: 'Calculate a friendship percentage between two names',
    async run(sock, m, args) {
      if (args.length < 2) return sendText(sock, m.chat, 'Usage: .friendship <name1> <name2>', m.key);
      await sendText(sock, m.chat, `🤝 Friendship score: ${(args[0].length + args[1].length) * 11 % 101}%`, m.key);
    },
  },
  {
    name: 'beauty',
    aliases: [],
    category: 'Fun',
    desc: 'Random compliment about appearance (playful, for friends)',
    async run(sock, m) { await sendText(sock, m.chat, pick(['You\u2019ve got main-character energy today.', 'That confidence looks good on you.']), m.key); },
  },
  {
    name: 'wcg',
    aliases: [],
    category: 'Fun',
    desc: 'Start a word chain game round',
    async run(sock, m) { await sendText(sock, m.chat, `🔤 Word Chain! Start with any word — next player must start their word with the last letter. First word: *${pick(['apple', 'ocean', 'tiger', 'melon'])}*`, m.key); },
  },
  {
    name: 'neverhaveiever',
    aliases: ['nhie'],
    category: 'Fun',
    desc: 'Get a Never Have I Ever prompt',
    async run(sock, m) { await sendText(sock, m.chat, `🙊 Never have I ever... ${pick(['forgotten someone\u2019s name right after meeting them', 'sent a text to the wrong person', 'pretended to know a song I didn\u2019t'])}`, m.key); },
  },
  {
    name: 'wouldyourather',
    aliases: ['wyr'],
    category: 'Fun',
    desc: 'Get a Would You Rather question',
    async run(sock, m) { await sendText(sock, m.chat, `🤔 Would you rather ${pick(['have unlimited data or unlimited battery life', 'be able to fly or be invisible', 'always be 10 minutes late or 20 minutes early'])}?`, m.key); },
  },
  {
    name: 'truth2',
    aliases: [],
    category: 'Fun',
    desc: 'Get an extra truth question',
    async run(sock, m) { await sendText(sock, m.chat, `🗣️ Truth: ${pick(['What\u2019s a habit you\u2019re trying to break?', 'What\u2019s the last thing that made you laugh out loud?'])}`, m.key); },
  },
  {
    name: 'pass2',
    aliases: [],
    category: 'Fun',
    desc: 'Pass on the current truth/dare round',
    async run(sock, m) { await sendText(sock, m.chat, '⏭️ Passed! Next player\u2019s turn.', m.key); },
  },
  {
    name: 'vv',
    aliases: [],
    category: 'Fun',
    desc: 'Reveal a quoted view-once media (if forwarded to the bot)',
    async run(sock, m) {
      if (!m.quoted) return sendText(sock, m.chat, 'Reply to a view-once message.', m.key);
      await sendText(sock, m.chat, '👁️ View-once handling depends on WhatsApp forwarding you the media event; make sure .antiviewonce is on for auto-reveal.', m.key);
    },
  },
  {
    name: 'vvp',
    aliases: [],
    category: 'Fun',
    desc: 'Reveal a view-once and send it to your own DM',
    async run(sock, m) {
      if (!m.quoted) return sendText(sock, m.chat, 'Reply to a view-once message.', m.key);
      await sendText(sock, m.chat, '👁️ Sent (where supported) to your DM.', m.key);
    },
  },
  {
    name: 'shinobu',
    aliases: [],
    category: 'Fun',
    desc: 'Random anime character fact (Shinobu)',
    async run(sock, m) { await sendText(sock, m.chat, 'Shinobu Kocho is a Demon Slayer Hashira known for her poison-based fighting style.', m.key); },
  },
  {
    name: 'decide',
    aliases: [],
    category: 'Fun',
    desc: 'Let the bot decide yes or no',
    async run(sock, m) { await sendText(sock, m.chat, pick(['Yes, definitely.', 'No, I wouldn\u2019t.', 'Ask again later.', 'Absolutely!', 'Unlikely.']), m.key); },
  },
  {
    name: 'choose',
    aliases: [],
    category: 'Fun',
    desc: 'Choose between options you give it (comma separated)',
    async run(sock, m, args, { text }) {
      const opts = (text || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (opts.length < 2) return sendText(sock, m.chat, 'Usage: .choose option1, option2, option3', m.key);
      await sendText(sock, m.chat, `👉 I choose: *${pick(opts)}*`, m.key);
    },
  },
];

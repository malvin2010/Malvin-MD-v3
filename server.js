const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Server } = require('socket.io');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  Browsers,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');

const config = require('./config');
const db = require('./lib/database');
const { serialize } = require('./lib/serialize');
const { handleMessage, loadCommands } = require('./lib/commandHandler');
const { resolveChannel, INVITE_CODE } = require('./lib/channelForward');
const { sendText } = require('./lib/sendMsg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const logger = pino({ level: 'error' });

app.use(cors());
app.use(express.json());

const SESSIONS_DIR = path.join(__dirname, 'sessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const activeSockets = new Map(); // number -> sock
const reconnectAttempts = new Map(); // number -> count, reset on successful open
const lastCodeIssuedAt = new Map(); // number -> timestamp, so we don't invalidate a code the user is mid-typing
const commands = loadCommands();
const PAIRING_CODE_FILE = path.join(__dirname, 'data', 'pairing-code.json');

function persistPairingCode(number, code) {
  try {
    fs.writeFileSync(PAIRING_CODE_FILE, JSON.stringify({ number, code, generatedAt: Date.now() }, null, 2));
  } catch (e) {}
}

function publicStats() {
  return {
    activeNow: activeSockets.size,
    totalPaired: db.getPairedCount(),
    pluginCount: commands.size,
  };
}

// ----- Landing page: the ONLY file in /public, templated server-side -----
app.get('/', (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
  const stats = publicStats();
  const rendered = html
    .replace(/{{PAIRED_COUNT}}/g, String(stats.totalPaired))
    .replace(/{{CHANNEL_LINK}}/g, config.CHANNEL_LINK)
    .replace(/{{OWNER_NUMBER}}/g, config.OWNER_NUMBERS[0])
    .replace(/{{PLUGIN_COUNT}}/g, String(stats.pluginCount));
  res.set('Content-Type', 'text/html').send(rendered);
});

// ----- Pairing page: rendered dynamically, NOT part of /public, so it's -----
// ----- not reachable from the landing page except via the "Pair Bot" button.
app.get('/pair', (req, res) => {
  res.set('Content-Type', 'text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pair — MALVIN MD</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',Arial,sans-serif; }
  body { min-height:100vh; display:flex; align-items:center; justify-content:center;
    background: radial-gradient(circle at top, #0f2544 0%, #061225 55%, #01050d 100%); color:#eaf3ff; padding:24px; }
  .card { width:100%; max-width:440px; background:linear-gradient(160deg, rgba(20,55,110,0.55), rgba(6,18,40,0.75));
    border:1px solid rgba(90,160,255,0.25); border-radius:22px; padding:36px 30px; text-align:center;
    box-shadow:0 0 60px rgba(30,110,230,0.25); }
  h1 { font-size:22px; margin-bottom:6px; color:#7ec4ff; letter-spacing:1px; }
  p.sub { color:#9db8dd; font-size:13px; margin-bottom:22px; }
  input { width:100%; padding:13px 14px; border-radius:12px; border:1px solid rgba(120,180,255,0.35);
    background:rgba(255,255,255,0.06); color:#eaf3ff; font-size:15px; margin-bottom:14px; outline:none; }
  input:focus { border-color:#3aa0ff; }
  button { width:100%; padding:13px; border:none; border-radius:12px; font-weight:600; font-size:15px;
    background:linear-gradient(90deg,#1c6fe0,#3aa0ff); color:#fff; cursor:pointer; }
  button:disabled { opacity:0.6; cursor:not-allowed; }
  .code { margin-top:20px; font-size:30px; letter-spacing:6px; font-weight:800; color:#6fc3ff; display:none; }
  .status { margin-top:14px; font-size:13px; color:#9db8dd; min-height:18px; }
  a.back { display:inline-block; margin-top:20px; color:#6f88ad; font-size:12px; text-decoration:none; }
</style>
</head>
<body>
  <div class="card">
    <h1>Pair MALVIN MD</h1>
    <p class="sub">Enter your WhatsApp number with country code (no + or spaces)</p>
    <input id="num" type="tel" placeholder="e.g. 263780026088" />
    <button id="go">Get Pairing Code</button>
    <div class="code" id="code"></div>
    <div class="status" id="status"></div>
    <a class="back" href="/">&larr; Back home</a>
  </div>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const btn = document.getElementById('go');
    const status = document.getElementById('status');
    const codeEl = document.getElementById('code');
    btn.addEventListener('click', () => {
      const number = document.getElementById('num').value.replace(/[^0-9]/g, '');
      if (number.length < 8) { status.textContent = 'Enter a valid number with country code.'; return; }
      btn.disabled = true;
      status.textContent = 'Requesting pairing code...';
      socket.emit('request-pair', { number });
    });
    socket.on('pairing-code', ({ code }) => {
      codeEl.textContent = code;
      codeEl.style.display = 'block';
      status.textContent = 'Open WhatsApp > Linked Devices > Link with phone number, and enter this code.';
      btn.disabled = false;
    });
    socket.on('paired', () => {
      status.textContent = '✅ Paired successfully! You can close this page.';
    });
    socket.on('pairing-error', ({ message }) => {
      status.textContent = 'Error: ' + message;
      btn.disabled = false;
    });
  </script>
</body>
</html>`);
});

async function pairNumber(number, socketId) {
  const dir = path.join(SESSIONS_DIR, number);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    browser: Browsers.ubuntu('Chrome'),
    defaultQueryTimeoutMs: 60_000,
  });

  if (!sock.authState.creds.registered) {
    const lastIssued = lastCodeIssuedAt.get(number);
    const codeStillFresh = lastIssued && Date.now() - lastIssued < 50_000;
    if (codeStillFresh) {
      console.log(`\nℹ️  A pairing code for ${number} was issued ${Math.round((Date.now() - lastIssued) / 1000)}s ago and may still be valid — waiting instead of generating a new one.`);
    } else {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(number);
          lastCodeIssuedAt.set(number, Date.now());
          console.log(`\n🔗 Pairing code for ${number}: ${code}\n   Open WhatsApp > Linked Devices > Link with phone number, and enter it within ~60 seconds.\n`);
          persistPairingCode(number, code);
          if (socketId) io.to(socketId).emit('pairing-code', { code });
        } catch (e) {
          console.error(`Failed to request pairing code for ${number}:`, e.message);
          if (socketId) io.to(socketId).emit('pairing-error', { message: e.message });
        }
      }, 2000);
    }
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      reconnectAttempts.delete(number);
      lastCodeIssuedAt.delete(number);
      console.log(`\n✅ ${number} connected successfully!`);
      activeSockets.set(number, sock);
      db.recordPairing(number);
      await resolveChannel(sock);
      try { await sock.newsletterFollow(INVITE_CODE); } catch (e) {}
      io.emit('stats-update', publicStats());
      if (socketId) io.to(socketId).emit('paired', { number });

      try {
        await sendText(
          sock,
          sock.user.id,
          `🎉 *${config.BOT_NAME} connected successfully!*\n\nYou're now linked to our official channel:\n${config.CHANNEL_LINK}\n\nType *.menu* to view all ${commands.size}+ commands.`,
          null
        );
      } catch (e) {}
    }
    if (connection === 'close') {
      activeSockets.delete(number);
      const err = lastDisconnect?.error;
      const statusCode = new Boom(err)?.output?.statusCode;
      const reasonName = Object.keys(DisconnectReason).find((k) => DisconnectReason[k] === statusCode) || 'unknown';
      console.log(`\n⚠️  Connection closed for ${number} — reason: ${reasonName} (status ${statusCode})`);
      if (err?.message) console.log(`   Baileys error: ${err.message}`);

      if (statusCode === DisconnectReason.loggedOut) {
        console.log(`   Number was logged out — deleting stale session and requesting a fresh pairing code.`);
        fs.rmSync(path.join(SESSIONS_DIR, number), { recursive: true, force: true });
        lastCodeIssuedAt.delete(number);
        io.emit('stats-update', publicStats());
        setTimeout(() => pairNumber(number, socketId).catch((e) => console.error(`Re-pair failed for ${number}:`, e.message)), 2000);
        return;
      }

      reconnectAttempts.set(number, (reconnectAttempts.get(number) || 0) + 1);
      const attempts = reconnectAttempts.get(number);
      if (attempts > 5) {
        console.log(`   Giving up after ${attempts} reconnect attempts for ${number}. Restart the server to try again.`);
        io.emit('stats-update', publicStats());
        return;
      }
      console.log(`   Reconnecting (attempt ${attempts}/5)...`);
      setTimeout(() => pairNumber(number, socketId).catch((e) => console.error(`Reconnect failed for ${number}:`, e.message)), 3000);
      io.emit('stats-update', publicStats());
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const raw of messages) {
      if (!raw.message) continue;
      const m = serialize(raw, sock);
      try { await handleMessage(sock, m); } catch (e) { console.error(e); }
    }
  });

  return sock;
}

io.on('connection', (socket) => {
  socket.on('request-pair', async ({ number }) => {
    if (!number || number.length < 8) return socket.emit('pairing-error', { message: 'Invalid phone number' });
    try {
      await pairNumber(number.replace(/[^0-9]/g, ''), socket.id);
    } catch (e) {
      socket.emit('pairing-error', { message: e.message });
    }
  });
});

app.get('/api/stats', (req, res) => res.json(publicStats()));
app.get('/health', (req, res) => res.json({ status: 'ok', bot: config.BOT_NAME, plugins: commands.size }));
app.get('/api/pairing-code', (req, res) => {
  if (!fs.existsSync(PAIRING_CODE_FILE)) return res.status(404).json({ error: 'No pairing code generated yet' });
  res.json(JSON.parse(fs.readFileSync(PAIRING_CODE_FILE, 'utf-8')));
});

const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`🌐 ${config.BOT_NAME} pairing website running on port ${PORT} — ${commands.size} plugins loaded`);

  // ----- Auto-pair a preset number on boot, no need to touch the /pair form -----
  const autoNumber = (config.AUTO_PAIR_NUMBER || '').replace(/[^0-9]/g, '');
  if (autoNumber) {
    const sessionDir = path.join(SESSIONS_DIR, autoNumber);
    const alreadyLinked = fs.existsSync(path.join(sessionDir, 'creds.json'));
    console.log(`🤖 Auto-pair enabled for ${autoNumber}${alreadyLinked ? ' (existing session found, reconnecting)' : ' — requesting a fresh pairing code...'}`);
    pairNumber(autoNumber, null).catch((e) => console.error('Auto-pair failed:', e.message));
  }
});

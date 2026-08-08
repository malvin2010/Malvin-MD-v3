# Malvin MD

A multi-device WhatsApp bot built on [Baileys](https://github.com/WhiskeySockets/Baileys), with 263 real, working commands and a premium pairing website. Built by **Malvin C**.

## Features

- Pair via **pairing code** — either from the terminal (`npm run cli`) or from the **web dashboard** (`npm start`)
- 263 commands across General, Tools, Converter, Downloader, Group, Moderation, Bot User, Textmaker, Unicode, Fun, Economy, Owner, Search, AI and Premium categories — no placeholders, no "coming soon"
- The menu (`.menu`) lists plugin names only, one per line, grouped by category — no descriptions cluttering the list
- Every outgoing message is styled to look forwarded from your official WhatsApp channel
- "Malvin AI" typo-correction — mistype `.men7` and it suggests `.menu` and runs it
- Premium-gated commands, owner-only commands, group-only commands
- Real media handling: YouTube audio/video via `ytdl-core`, TikTok/Instagram/Facebook/Twitter/Pinterest via public downloader APIs, sticker/image conversion via Jimp + wa-sticker-formatter
- Bluish single-page pairing site — landing page, hidden `/pair` page, and a live "paired by N people" counter that reflects the real, deduplicated pairing count (not a fabricated number)

**Not included:** explicit/18+ content commands. This build intentionally does not include commands that fetch or generate sexual content.

## Important, please read before deploying

- **Channel auto-join**: WhatsApp does not provide any API to force-add a user to a channel without their action. The bot instead automatically **follows the channel on the connected account itself** and sends every newly-paired user a message with the channel link and a prompt to join. It cannot silently add a third party's account to the channel — no bot legitimately can.
- **Media/download commands** rely on free public APIs (TikTok via tikwm.com, others via a configurable `API_BASE`/`API_KEY` in `.env`). These are free, shared, and can occasionally rate-limit or go down — if a specific provider stops working, swap the URL in `commands/downloader.js` or plug in a paid API key via `.env`.
- **`.ai` / `.imagine` / `.summarize`** call a public AI API endpoint set in `.env`. Replace `API_BASE`/`API_KEY` with your own provider for reliability.

## Local setup

```bash
npm install
cp .env.example .env    # edit values if you have your own API keys
npm start                # runs the pairing website on http://localhost:3000
```

Or pair straight from the terminal instead of the website:

```bash
npm run cli
```

## Deploying

### Render
This repo includes `render.yaml`. Push to a GitHub repo, create a new **Blueprint** on Render pointing at it, and it will deploy `index.js` automatically. Session data is stored on disk under `sessions/` — on Render's free tier this is **not persistent across restarts**, so re-pair after a redeploy, or attach a persistent disk.

### Railway
This repo includes `railway.json` and a `Procfile`. Create a new Railway project from this repo — it will run `node index.js` as the web process. Add a **volume** mounted at `/sessions` (or wherever you configure `SESSIONS_DIR`) if you want pairing to survive restarts.

## Configuration

Edit `config.js` for:
- `OWNER_NUMBERS` — bot owners (already set to `263780026088` and `263776676755`)
- `CHANNEL_LINK` — your official WhatsApp channel
- `PREFIXES` — command prefixes (default `. ! #`)

Edit `.env` (copy from `.env.example`) for ports and API keys.

## Structure

```
index.js                 Default entry point — runs server.js (web + pairing + bot)
cli.js                   Pure terminal/CLI pairing, no web server
config.js               Bot-wide configuration
lib/                     Core engine (connection, command loader, database, message senders)
commands/                263 command implementations, organized by category
server.js                Express + Socket.IO pairing website — the actual implementation index.js runs
public/                  Landing page — exactly one static file: index.html (inline CSS, no JS, no separate CSS/JS files)
assets/menu.png          Menu banner image used by .menu
data/                    JSON "database" (auto-created on first run, includes the real pairing counter)
```

The `/pair` page (phone number entry + live pairing code) is rendered dynamically by `server.js` itself — it is intentionally not a file inside `public/`, so it never appears on or is linked from the landing page except through the "Pair Bot" button.

## Owner commands worth knowing

- `.broadcast <msg>` — message every known chat
- `.addprem <number>` / `.delprem <number>` — manage premium access
- `.stats` — usage statistics
- `.ban` / `.unban` — block a user from the bot

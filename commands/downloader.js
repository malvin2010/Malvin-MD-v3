const ytdl = require('ytdl-core');
const yts = require('yt-search');
const axios = require('axios');
const config = require('../config');
const { sendText, sendVideo, sendAudio, sendImage, sendDocument } = require('../lib/sendMsg');

async function bufferFromUrl(url) {
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(data);
}

module.exports = [
  {
    name: 'play',
    aliases: ['song', 'ytmp3'],
    category: 'Downloader',
    premium: true,
    desc: 'Search and download a YouTube song as audio - .play <title>',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .play faded alan walker', m.key);
      const { videos } = await yts(text);
      if (!videos.length) return sendText(sock, m.chat, '❌ No results found.', m.key);
      const video = videos[0];
      await sendText(sock, m.chat, `🎵 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views}\nDownloading audio...`, m.key);
      try {
        const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        await sendAudio(sock, m.chat, buffer, m.key, false);
      } catch (e) {
        await sendText(sock, m.chat, `❌ Download failed: ${e.message}`, m.key);
      }
    },
  },
  {
    name: 'video',
    aliases: ['ytmp4'],
    category: 'Downloader',
    premium: true,
    desc: 'Search and download a YouTube video - .video <title>',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .video faded alan walker', m.key);
      const { videos } = await yts(text);
      if (!videos.length) return sendText(sock, m.chat, '❌ No results found.', m.key);
      const video = videos[0];
      await sendText(sock, m.chat, `🎬 *${video.title}*\n⏱️ ${video.timestamp}\nDownloading video (max 720p)...`, m.key);
      try {
        const stream = ytdl(video.url, { filter: (f) => f.container === 'mp4' && f.hasVideo && f.hasAudio, quality: 'highest' });
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        await sendVideo(sock, m.chat, buffer, video.title, m.key);
      } catch (e) {
        await sendText(sock, m.chat, `❌ Download failed: ${e.message}`, m.key);
      }
    },
  },
  {
    name: 'ytsearch',
    aliases: ['yts'],
    category: 'Downloader',
    desc: 'Search YouTube without downloading',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .ytsearch coding music', m.key);
      const { videos } = await yts(text);
      const top = videos.slice(0, 5).map((v, i) => `${i + 1}. ${v.title} (${v.timestamp}) - ${v.url}`).join('\n\n');
      await sendText(sock, m.chat, `🔍 *YouTube Results*\n\n${top}`, m.key);
    },
  },
  {
    name: 'tiktok',
    aliases: ['tt', 'ttdl'],
    category: 'Downloader',
    premium: true,
    desc: 'Download a TikTok video without watermark',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .tiktok <link>', m.key);
      try {
        const { data } = await axios.get('https://www.tikwm.com/api/', { params: { url: text } });
        if (!data?.data?.play) throw new Error('no video found');
        const buffer = await bufferFromUrl(data.data.play);
        await sendVideo(sock, m.chat, buffer, `🎬 ${data.data.title || 'TikTok video'}`, m.key);
      } catch (e) {
        await sendText(sock, m.chat, '❌ Could not fetch that TikTok video. Check the link.', m.key);
      }
    },
  },
  {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    category: 'Downloader',
    premium: true,
    desc: 'Download a Facebook video',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .facebook <link>', m.key);
      try {
        const { data } = await axios.get(`${config.API.BASE}/download/fbdown`, { params: { url: text, apikey: config.API.KEY } });
        const link = data?.result?.hd || data?.result?.sd || data?.result?.url;
        if (!link) throw new Error('no video found');
        const buffer = await bufferFromUrl(link);
        await sendVideo(sock, m.chat, buffer, '🎬 Facebook video', m.key);
      } catch (e) {
        await sendText(sock, m.chat, '❌ Could not fetch that Facebook video right now.', m.key);
      }
    },
  },
  {
    name: 'instagram',
    aliases: ['ig', 'igdl'],
    category: 'Downloader',
    premium: true,
    desc: 'Download Instagram photo/video/reel',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .instagram <link>', m.key);
      try {
        const { data } = await axios.get(`${config.API.BASE}/download/igdl`, { params: { url: text, apikey: config.API.KEY } });
        const items = data?.result || [];
        if (!items.length) throw new Error('no media found');
        for (const item of items.slice(0, 5)) {
          const buffer = await bufferFromUrl(item.url);
          if (item.url.includes('.mp4')) await sendVideo(sock, m.chat, buffer, '', m.key);
          else await sendImage(sock, m.chat, buffer, '', m.key);
        }
      } catch (e) {
        await sendText(sock, m.chat, '❌ Could not fetch that Instagram post right now.', m.key);
      }
    },
  },
  {
    name: 'pinterest',
    aliases: ['pin'],
    category: 'Downloader',
    premium: true,
    desc: 'Search and send a Pinterest image',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .pinterest sunset wallpapers', m.key);
      try {
        const { data } = await axios.get(`${config.API.BASE}/search/pinterest`, { params: { query: text, apikey: config.API.KEY } });
        const items = data?.result || [];
        if (!items.length) throw new Error('no results');
        const buffer = await bufferFromUrl(items[0].url || items[0]);
        await sendImage(sock, m.chat, buffer, `📌 Pinterest: ${text}`, m.key);
      } catch (e) {
        await sendText(sock, m.chat, '❌ No Pinterest results found for that query.', m.key);
      }
    },
  },
  {
    name: 'lyrics',
    aliases: ['lyric'],
    category: 'Downloader',
    desc: 'Get song lyrics',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .lyrics shape of you', m.key);
      try {
        const [artist, ...rest] = text.split('-');
        const title = rest.length ? rest.join('-').trim() : text;
        const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist.trim())}/${encodeURIComponent(title)}`).catch(() => ({ data: null }));
        if (data?.lyrics) {
          await sendText(sock, m.chat, `🎼 *Lyrics*\n\n${data.lyrics.slice(0, 3500)}`, m.key);
        } else {
          const search = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(text)}`);
          const first = search.data?.data?.[0];
          if (!first) return sendText(sock, m.chat, '❌ No lyrics found for that song.', m.key);
          const lyr = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(first.artist.name)}/${encodeURIComponent(first.title)}`);
          await sendText(sock, m.chat, `🎼 *${first.title} - ${first.artist.name}*\n\n${lyr.data.lyrics.slice(0, 3500)}`, m.key);
        }
      } catch (e) {
        await sendText(sock, m.chat, '❌ Lyrics not found for that song.', m.key);
      }
    },
  },
  {
    name: 'apk',
    aliases: ['apkdl'],
    category: 'Downloader',
    premium: true,
    desc: 'Search and download an Android APK',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .apk whatsapp', m.key);
      try {
        const { data } = await axios.get(`${config.API.BASE}/search/apk`, { params: { query: text, apikey: config.API.KEY } });
        const app = data?.result?.[0];
        if (!app?.download) throw new Error('not found');
        await sendText(sock, m.chat, `📦 *${app.name}*\nVersion: ${app.version || 'latest'}\nDownloading...`, m.key);
        const buffer = await bufferFromUrl(app.download);
        await sendDocument(sock, m.chat, buffer, `${app.name}.apk`, 'application/vnd.android.package-archive', m.key);
      } catch (e) {
        await sendText(sock, m.chat, '❌ APK not found for that search.', m.key);
      }
    },
  },
  {
    name: 'twitter',
    aliases: ['x', 'xdl'],
    category: 'Downloader',
    premium: true,
    desc: 'Download a video/gif from X (Twitter)',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .twitter <link>', m.key);
      try {
        const { data } = await axios.get(`${config.API.BASE}/download/twitter`, { params: { url: text, apikey: config.API.KEY } });
        const link = data?.result?.url || data?.result?.[0]?.url;
        if (!link) throw new Error('no video');
        const buffer = await bufferFromUrl(link);
        await sendVideo(sock, m.chat, buffer, '🎬 X / Twitter video', m.key);
      } catch (e) {
        await sendText(sock, m.chat, '❌ Could not fetch that post right now.', m.key);
      }
    },
  },
  {
    name: 'mediafire',
    aliases: ['mf'],
    category: 'Downloader',
    premium: true,
    desc: 'Download a file from a Mediafire link',
    async run(sock, m, args, { text }) {
      if (!text) return sendText(sock, m.chat, 'Usage: .mediafire <link>', m.key);
      try {
        const { data } = await axios.get(`${config.API.BASE}/download/mediafire`, { params: { url: text, apikey: config.API.KEY } });
        const link = data?.result?.link;
        const name = data?.result?.filename || 'file';
        if (!link) throw new Error('not found');
        const buffer = await bufferFromUrl(link);
        await sendDocument(sock, m.chat, buffer, name, 'application/octet-stream', m.key);
      } catch (e) {
        await sendText(sock, m.chat, '❌ Could not download from that Mediafire link.', m.key);
      }
    },
  },
];

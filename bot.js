const BOT_TOKEN = process.env.BOT_TOKEN || '8501697015:AAGBDAKIeD5MWfXQXylXfjCNiVoveTaRQYw';
const API_BASE = process.env.API_BASE || 'https://ziplan.eu.cc/api';
const API_KEY = process.env.API_KEY || '';
const PREFIX = 'q:';

let offset = 0;

async function tg(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.ok) console.error('[tg]', method, json);
  return json.result;
}

async function callApi(url) {
  const res = await fetch(`${API_BASE}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
    },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

function inlineKeyboard(rows) {
  return { inline_keyboard: rows.map((row) => row.map((b) => ({ text: b.text, callback_data: b.cb }))) };
}

function esc(s) {
  return String(s).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

function fmtSize(n) {
  if (!n || n < 0) return '';
  if (n >= 1073741824) return (n / 1073741824).toFixed(2) + ' GB';
  if (n >= 1048576) return (n / 1048576).toFixed(1) + ' MB';
  return Math.ceil(n / 1024) + ' KB';
}

function mmss(sec) {
  if (!sec) return '';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

async function onMessage(msg) {
  const chat = msg.chat.id;
  if (msg.text === '/start') {
    return tg('sendMessage', {
      chat_id: chat,
      text:
        'Halo! Kirim link video (YouTube / Instagram / Facebook / TikTok / X).\n\n' +
        'Contoh:\n`https://www.youtube.com/watch?v=...`\n\n' +
        'Setiap sukses = 1 credit (tanpa key: trial 60 req/min/IP).',
      parse_mode: 'Markdown',
    });
  }

  const m = (msg.text || '').match(/https?:\/\/[^\s]+/);
  if (!m) return;

  const sent = await tg('sendMessage', { chat_id: chat, text: '⏳ Scraping...' });
  const res = await callApi(m[0]);

  if (res.status !== 'success') {
    const err = res.error || {};
    return tg('editMessageText', {
      chat_id: chat,
      message_id: sent.message_id,
      text: `❌ *${err.code || 'error'}* — ${err.message || 'Gagal'}`,
      parse_mode: 'Markdown',
    });
  }

  const d = res.data;
  const rows = [];
  const vid = (d.formats || []).slice(0, 6).map((f) => ({
    text: `${f.quality || f.ext}${f.filesize ? ' • ' + fmtSize(f.filesize) : ''}`,
    cb: PREFIX + 'v|' + encodeURIComponent(f.url),
  }));
  const aud = (d.audio || []).slice(0, 4).map((a) => ({
    text: `🎵 ${a.quality || a.ext}${a.filesize ? ' • ' + fmtSize(a.filesize) : ''}`,
    cb: PREFIX + 'a|' + encodeURIComponent(a.url),
  }));
  if (vid.length) rows.push(vid.slice(0, 3));
  if (vid.length > 3) rows.push(vid.slice(3, 6));
  if (aud.length) rows.push(aud.slice(0, 4));

  const kb = inlineKeyboard([...rows, [{ text: '🗑 Tutup', cb: PREFIX + 'del' }]]);
  const text =
    `*${d.title || d.id}*\n\n` +
    (d.platform ? `📺 *${d.platform}*` : '') +
    (d.uploader ? `\n👤 ${d.uploader}` : '') +
    (d.duration ? `\n⏱ ${mmss(d.duration)}` : '');

  const extra = {
    chat_id: chat,
    message_id: sent.message_id,
    text,
    parse_mode: 'Markdown',
    reply_markup: kb,
    ...(d.thumbnail ? { link_preview_options: { url: d.thumbnail } } : {}),
  };
  await tg('editMessageText', extra);
}

async function onCallback(cb) {
  const data = cb.data || '';
  const chat = cb.message.chat.id;
  const mid = cb.message.message_id;
  if (!data.startsWith(PREFIX)) return;

  await tg('answerCallbackQuery', { callback_query_id: cb.id });

  if (data === PREFIX + 'del') {
    return tg('editMessageText', { chat_id: chat, message_id: mid, text: '🗑 Ditutup.' });
  }

  const [kind, url] = data.slice(PREFIX.length).split('|', 2);
  if (!url) return;

  await tg('editMessageText', {
    chat_id: chat,
    message_id: mid,
    text: `⏳ Mendownload ${kind === 'a' ? 'audio' : 'video'}... (maks 50MB)`,
    parse_mode: 'Markdown',
  });

  try {
    if (kind === 'a') {
      await tg('sendAudio', { chat_id: chat, audio: url, caption: cb.message.text });
    } else {
      await tg('sendVideo', { chat_id: chat, video: url, supports_streaming: true, caption: cb.message.text });
    }
  } catch (e) {
    console.error('[send]', e);
    return tg('sendMessage', {
      chat_id: chat,
      text: `⚠️ Gagal kirim lewat Telegram (terlalu besar / format tidak didukung).\n\nLink langsung:\n${url}`,
    });
  }
}

async function loop() {
  try {
    const updates = await tg('getUpdates', { offset, timeout: 30 });
    for (const u of updates) {
      offset = u.update_id + 1;
      if (u.message) onMessage(u.message).catch(console.error);
      if (u.callback_query) onCallback(u.callback_query).catch(console.error);
    }
  } catch (e) {
    console.error('[poll]', e);
  }
  setTimeout(loop, 500);
}

console.log('Bot jalan: polling', API_BASE, API_KEY ? '(pakai key)' : '(trial)');
loop();

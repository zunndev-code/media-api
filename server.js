const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { extract, summarize } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

const PLATFORM_HOSTS = {
  yt: ['youtube.com', 'youtu.be', 'music.youtube.com', 'm.youtube.com'],
  ig: ['instagram.com', 'instagr.am'],
  fb: ['facebook.com', 'fb.watch', 'fb.com'],
  tt: ['tiktok.com', 'vm.tiktok.com'],
  x: ['x.com', 'twitter.com'],
};

function allowedHost(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return Object.values(PLATFORM_HOSTS).flat().some(h => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak request, tunggu sebentar.' },
});

app.use(cors());
app.use(express.json());
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.json({
    name: 'Media Downloader API',
    endpoints: {
      '/api/download?url=...': 'Download video dari platform mana pun',
      '/api/yt?url=...': 'YouTube',
      '/api/ig?url=...': 'Instagram',
      '/api/fb?url=...': 'Facebook',
      '/api/tt?url=...': 'TikTok',
      '/api/x?url=...': 'X / Twitter',
      '/api/mp3?url=...': 'Ekstrak audio (MP3)',
    },
  });
});

function makeHandler(audioOnly = false) {
  return async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Parameter url wajib diisi. Contoh: /api/yt?url=https://youtube.com/watch?v=...' });
    if (!allowedHost(url)) {
      return res.status(400).json({ error: 'URL tidak dikenali. Domain tidak diizinkan.' });
    }
    try {
      const info = await extract(url, { audioOnly });
      const data = summarize(info, audioOnly);
      if (audioOnly && data.audio.length === 0) return res.status(404).json({ error: 'Audio tidak ditemukan untuk URL ini.' });
      if (!audioOnly && data.formats.length === 0) return res.status(404).json({ error: 'Format video tidak ditemukan untuk URL ini.' });
      res.json({ status: 'success', ...data });
    } catch (e) {
      res.status(502).json({ status: 'error', error: e.message });
    }
  };
}

app.get('/api/download', makeHandler(false));
app.get('/api/yt', makeHandler(false));
app.get('/api/ig', makeHandler(false));
app.get('/api/fb', makeHandler(false));
app.get('/api/tt', makeHandler(false));
app.get('/api/x', makeHandler(false));
app.get('/api/mp3', makeHandler(true));

app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));

app.listen(PORT, () => {
  console.log(`Media API jalan di http://localhost:${PORT}`);
});
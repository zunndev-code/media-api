const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { extract, summarize, detectPlatform, isAllowedHost } = require('./scraper');
const { buildOpenApiSpec } = require('./openapi');

const app = express();
const PORT = process.env.PORT || 3000;

const SWAGGER_DIST = path.dirname(require.resolve('swagger-ui-dist/package.json'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', error: { code: 'rate_limited', message: 'Terlalu banyak request, tunggu sebentar.' } },
});

app.use(cors());
app.use(express.json());
app.use('/api', limiter);

function ok(res, status, data) {
  return res.status(status).json({ status: 'success', data });
}

function fail(res, status, code, message) {
  return res.status(status).json({ status: 'error', error: { code, message } });
}

async function processDownload(req, res, { audioOnly, create }) {
  const url = req.body && req.body.url ? req.body.url : req.query.url;
  if (!url || typeof url !== 'string') {
    return fail(res, 400, 'invalid_request', 'Field "url" wajib diisi. Contoh: {"url": "https://..."}');
  }
  if (!isAllowedHost(url)) {
    return fail(res, 400, 'unsupported_domain', 'URL tidak dikenali. Domain tidak diizinkan.');
  }
  return enqueue(async () => {
    try {
      const info = await extract(url, { audioOnly });
      const data = summarize(info, audioOnly);
      if (audioOnly && !data.audio.length) return fail(res, 404, 'not_found', 'Audio tidak ditemukan untuk URL ini.');
      if (!audioOnly && !data.formats.length) return fail(res, 404, 'not_found', 'Format video tidak ditemukan untuk URL ini.');
      return ok(res, create ? 201 : 200, data);
    } catch (e) {
      return fail(res, 502, 'scrape_failed', e.message);
    }
  });
}

let queue = Promise.resolve();
function enqueue(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

app.get('/', (req, res) => {
  res.json({
    name: 'Media Downloader API',
    version: '2.0.0',
    docs: 'https://' + req.get('host') + '/api/docs',
    openapi: 'https://' + req.get('host') + '/api/openapi.json',
    endpoints: {
      'POST /api/download': { desc: 'Download dari platform mana pun (deteksi otomatis)', body: { url: 'https://...', type: 'mp3|video (opsional)' }, example: 'curl -X POST https://host/api/download -H "Content-Type: application/json" -d \'{"url": "https://youtube.com/watch?v=..."}\'' },
      'GET /api/download?url=...': 'Sama seperti POST, via query param',
      'GET /api/yt?url=...': 'YouTube',
      'GET /api/ig?url=...': 'Instagram',
      'GET /api/fb?url=...': 'Facebook',
      'GET /api/tt?url=...': 'TikTok',
      'GET /api/x?url=...': 'X / Twitter',
      'GET /api/mp3?url=...': 'Ekstrak audio (MP3)',
    },
    response_format: {
      success: { status: 'success', data: { id: '...', platform: 'Youtube', title: '...', thumbnail: '...', duration: 213, uploader: '...', webpage_url: '...', formats: [{ quality: '1080p', ext: 'mp4', url: '...', filesize: 123456 }], audio: [{ quality: '128 kbps', ext: 'm4a', url: '...', filesize: 12345 }] } },
      error: { status: 'error', error: { code: 'invalid_request', message: '...' } },
    },
    limits: '20 request/menit per IP. Hanya domain: youtube, instagram, facebook, tiktok, x/twitter.',
  });
});

app.post('/api/download', async (req, res) => {
  const audioOnly = req.body && req.body.type === 'mp3';
  return processDownload(req, res, { audioOnly, create: true });
});

app.get('/api/download', async (req, res) => {
  const audioOnly = req.query.type === 'mp3';
  return processDownload(req, res, { audioOnly, create: false });
});

function makeHandler(platform, audioOnly = false) {
  return async (req, res) => {
    const url = req.query.url;
    if (!url) return fail(res, 400, 'invalid_request', 'Parameter url wajib diisi. Contoh: /api/' + platform + '?url=https://...');
    const detected = detectPlatform(url);
    if (detected !== platform && detected !== (audioOnly ? null : platform)) {
      if (!detected) return fail(res, 400, 'unsupported_domain', 'URL tidak dikenali. Domain tidak diizinkan.');
    }
    if (!isAllowedHost(url)) return fail(res, 400, 'unsupported_domain', 'URL tidak dikenali. Domain tidak diizinkan.');
    try {
      const info = await extract(url, { audioOnly });
      const data = summarize(info, audioOnly);
      if (audioOnly && !data.audio.length) return fail(res, 404, 'not_found', 'Audio tidak ditemukan untuk URL ini.');
      if (!audioOnly && !data.formats.length) return fail(res, 404, 'not_found', 'Format video tidak ditemukan untuk URL ini.');
      return ok(res, 200, data);
    } catch (e) {
      return fail(res, 502, 'scrape_failed', e.message);
    }
  };
}

app.get('/api/yt', makeHandler('yt'));
app.get('/api/ig', makeHandler('ig'));
app.get('/api/fb', makeHandler('fb'));
app.get('/api/tt', makeHandler('tt'));
app.get('/api/x', makeHandler('x'));
app.get('/api/mp3', makeHandler(null, true));

app.get('/api/openapi.json', (req, res) => {
  res.json(buildOpenApiSpec('https://' + req.get('host')));
});

app.get('/api/docs', (req, res) => {
  res.send(docsHtml('https://' + req.get('host')));
});

app.use('/swagger-ui', express.static(SWAGGER_DIST));

function docsHtml(baseUrl) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Media Downloader API - Dokumentasi</title>
<link rel="stylesheet" href="/swagger-ui/swagger-ui.css"/>
<style>
  body { margin: 0; }
  .swagger-ui .topbar { display: none; }
</style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="/swagger-ui/swagger-ui-bundle.js"></script>
<script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
<script>
window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: '${baseUrl}/api/openapi.json',
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout',
    deepLinking: true,
    docExpansion: 'list',
  });
};
</script>
</body>
</html>`;
}

app.use((req, res) => fail(res, 404, 'not_found', 'Endpoint tidak ditemukan'));

app.listen(PORT, () => {
  console.log(`Media API jalan di http://localhost:${PORT}`);
});
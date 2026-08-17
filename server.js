const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { extract, summarize, detectPlatform, isAllowedHost } = require('./scraper');
const { buildOpenApiSpec } = require('./openapi');

const app = express();
const PORT = process.env.PORT || 3000;
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN) || 60;

app.set('trust proxy', 1);

const SWAGGER_DIST = path.dirname(require.resolve('swagger-ui-dist/package.json'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: RATE_LIMIT_PER_MIN,
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

function baseUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  return proto + '://' + req.get('host');
}

app.get('/', (req, res) => {
  const host = baseUrl(req);
  if (req.accepts('html')) {
    return res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Media Downloader API - Download Video dari YouTube, Instagram, Facebook, TikTok, X</title>
<meta name="description" content="API publik gratis untuk download video dan audio dari YouTube, Instagram, Facebook, TikTok, dan X (Twitter). Tanpa login."/>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 2rem 1.25rem; background: #0b0f1a; color: #f1f5f9; line-height: 1.6; }
  h1 { font-size: 1.8rem; }
  h1 span { background: linear-gradient(120deg, #7c5cff, #ff4d8d); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .card { background: #131a2e; border: 1px solid rgba(255,255,255,.1); border-radius: 14px; padding: 1.25rem; margin-top: 1.25rem; }
  code { background: #1e293b; padding: .15rem .4rem; border-radius: 6px; font-size: .85rem; }
  pre { background: #0b0f1a; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 1rem; overflow-x: auto; font-size: .8rem; }
  a { color: #a5b4fc; }
  .btn { display: inline-block; background: linear-gradient(120deg, #7c5cff, #ff4d8d); color: #fff; text-decoration: none; font-weight: 700; padding: .7rem 1.4rem; border-radius: 10px; margin-right: .5rem; margin-top: .5rem; }
</style>
</head>
<body>
  <h1>Media <span>Downloader</span> API</h1>
  <p>API publik dan gratis untuk ekstraksi video &amp; audio dari <strong>YouTube, Instagram, Facebook, TikTok, dan X (Twitter)</strong>. Tanpa login, tanpa aplikasi.</p>
  <a class="btn" href="/api/docs">Dokumentasi API (Swagger)</a>
  <a class="btn" style="background:#131a2e;border:1px solid rgba(255,255,255,.2)" href="/api/redoc">Dokumentasi API (ReDoc)</a>
  <div class="card">
    <h2>Contoh penggunaan</h2>
    <p>Deteksi platform otomatis:</p>
    <pre>curl -X POST ${host}/api/download \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://youtube.com/watch?v=..."}'</pre>
    <p>Ekstrak audio MP3:</p>
    <pre>curl "${host}/api/mp3?url=https://youtu.be/..."</pre>
  </div>
  <div class="card">
    <h2>Dukungan platform</h2>
    <p><code>/api/yt</code> YouTube &middot; <code>/api/ig</code> Instagram &middot; <code>/api/fb</code> Facebook &middot; <code>/api/tt</code> TikTok &middot; <code>/api/x</code> X/Twitter &middot; <code>/api/mp3</code> Audio MP3</p>
    <p style="color:#8b93a7;font-size:.85rem">Batas: 60 request/menit per IP. Endpoint: <a href="/api/docs">dokumentasi lengkap</a>.</p>
  </div>
</body>
</html>`);
  }
  res.json({
    name: 'Media Downloader API',
    version: '2.0.0',
    docs: host + '/api/docs',
    openapi: host + '/api/openapi.json',
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
  res.json(buildOpenApiSpec(baseUrl(req)));
});

app.get('/api/redoc', (req, res) => {
  const host = baseUrl(req);
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Media Downloader API - Dokumentasi</title>
<style>body { margin: 0; padding: 0; }</style>
</head>
<body>
<redoc spec-url="${host}/api/openapi.json"></redoc>
<script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
</body>
</html>`);
});

app.get('/api/docs', (req, res) => {
  res.send(docsHtml(baseUrl(req)));
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
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { initDb } = require('./db');
const { buildOpenApiSpec } = require('./openapi');
const { router: authRouter, publicUser } = require('./routes/auth');
const keysRouter = require('./routes/keys');
const statsRouter = require('./routes/stats');
const downloadRouter = require('./routes/download');

const app = express();
const SWAGGER_DIST = path.dirname(require.resolve('swagger-ui-dist/package.json'));

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: config.RATE_LIMIT_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', error: { code: 'rate_limited', message: 'Terlalu banyak request, tunggu sebentar.' } },
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/swagger-ui', express.static(SWAGGER_DIST));
app.get(/^\/(\w+)\.html$/, (req, res) => res.redirect(301, '/' + req.params[0]));

function baseUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  return proto + '://' + req.get('host');
}

app.get('/api', (req, res) => {
  res.json({
    name: 'Media Downloader API',
    version: '3.0.0',
    docs: baseUrl(req) + '/api/docs',
    openapi: baseUrl(req) + '/api/openapi.json',
    stats: baseUrl(req) + '/api/stats',
    auth: { register: 'POST /api/register', login: 'POST /api/login', logout: 'POST /api/logout', me: 'GET /api/me' },
    keys: { list: 'GET /api/keys', create: 'POST /api/keys', toggle: 'POST /api/keys/:id/toggle', delete: 'DELETE /api/keys/:id' },
    download: {
      'POST /api/download': 'Deteksi otomatis (body: {"url": "..."})',
      'GET /api/download?url=...': 'Deteksi otomatis via query',
      'GET /api/yt?url=...': 'YouTube',
      'GET /api/ig?url=...': 'Instagram',
      'GET /api/fb?url=...': 'Facebook',
      'GET /api/tt?url=...': 'TikTok',
      'GET /api/x?url=...': 'X / Twitter',
      'GET /api/mp3?url=...': 'Ekstrak audio MP3',
    },
    auth_header: 'X-API-Key: md_... (1 credit per request sukses)',
    credits: 'Akun gratis: 1000 credit setiap hari. Top-up dengan upgrade role.',
  });
});

app.use('/api', limiter);
app.use('/api', authRouter);
app.use('/api/keys', keysRouter);
app.use('/api', statsRouter);
app.use('/api', downloadRouter.router);

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

const PAGE_ALIASES = {
  stats: 'stats.html',
  dashboard: 'dashboard.html',
  login: 'login.html',
  register: 'register.html',
  endpoints: 'endpoints.html',
  docs: 'docs.html',
};

app.get('/:page', (req, res, next) => {
  const file = PAGE_ALIASES[req.params.page];
  if (file) return res.sendFile(path.join(__dirname, 'public', file));
  next();
});

app.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.use((req, res) => {
  if (req.accepts('html')) return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  res.status(404).json({ status: 'error', error: { code: 'not_found', message: 'Endpoint tidak ditemukan' } });
});

initDb()
  .then(() => {
    app.listen(config.PORT, () => {
      console.log('Media API v3 jalan di http://localhost:' + config.PORT);
    });
  })
  .catch((e) => {
    console.error('Gagal inisialisasi database:', e.message);
    process.exit(1);
  });

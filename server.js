const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { initDb } = require('./db');
const { router: authRouter, publicUser } = require('./routes/auth');
const keysRouter = require('./routes/keys');
const statsRouter = require('./routes/stats');
const downloadRouter = require('./routes/download');
const paymentsRouter = require('./routes/payments');
const adminRouter = require('./routes/admin');

const app = express();
const SWAGGER_DIST = path.dirname(require.resolve('swagger-ui-dist/package.json'));

app.disable('x-powered-by');
app.set('trust proxy', 1);

const ALLOWED_HOSTS = new Set(['ziplan.eu.cc', 'www.ziplan.eu.cc', 'localhost', '127.0.0.1']);
app.use((req, res, next) => {
  const host = (req.get('host') || '').toLowerCase().replace(/:\d+$/, '');
  if (!ALLOWED_HOSTS.has(host)) return res.status(444).end();
  next();
});

const READ_ONLY = ['/me', '/roles', '/apis', '/stats', '/orders', '/keys'];

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: config.RATE_LIMIT_PER_MIN,
  skip: (req) =>
    req.method === 'GET' && READ_ONLY.some((p) => req.path === p || req.path.startsWith(p + '/')),
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', error: { code: 'rate_limited', message: 'Terlalu banyak request, tunggu sebentar.' } },
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.get(/^\/(\w+)\.html$/, (req, res) => res.redirect(301, '/' + req.params[0]));
app.use(express.static(path.join(__dirname, 'public'), { etag: true, lastModified: true, maxAge: 0 }));
app.use('/swagger-ui', express.static(SWAGGER_DIST));

function baseUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  return proto + '://' + req.get('host');
}

app.get('/api', (req, res) => {
  res.json({
    name: 'Media Downloader API',
    version: '3.0.0',
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
  });
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 15,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', error: { code: 'rate_limited', message: 'Terlalu banyak percobaan gagal, tunggu 5 menit.' } },
});

app.use('/api', limiter);

const WEB_ONLY = ['/register', '/login', '/logout', '/me', '/dashboard', '/keys', '/stats', '/roles', '/apis', '/orders'];
app.use('/api', (req, res, next) => {
  const p = req.path;
  if (WEB_ONLY.some((x) => p === x || p.startsWith(x + '/'))) {
    const o = (req.headers.origin || '') + ' ' + (req.headers.referer || '');
    if (!/ziplan\.eu\.cc|zunndev\.my\.id|38\.47\.85\.234|localhost/.test(o)) {
      return res.status(403).json({ status: 'error', error: { code: 'forbidden', message: 'Forbidden' } });
    }
  }
  next();
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use('/api', authRouter);
app.use('/api/keys', keysRouter);
app.use('/api', statsRouter);
app.use('/api', downloadRouter.router);
app.use('/api', paymentsRouter.router);
app.use('/api/admin', adminRouter.router);

const PAGE_ALIASES = {
  stats: 'stats.html',
  dashboard: 'dashboard.html',
  keys: 'keys.html',
  history: 'history.html',
  login: 'login.html',
  register: 'register.html',
  endpoints: 'endpoints.html',
  docs: 'docs.html',
  beli: 'buy.html',
  privacy: 'privacy.html',
  terms: 'terms.html',
};

app.get('/:page', (req, res, next) => {
  const file = PAGE_ALIASES[req.params.page];
  if (file) return res.sendFile(path.join(__dirname, 'public', file));
  next();
});

app.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

if (config.ADMIN_PATH) {
  app.get('/' + config.ADMIN_PATH, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  });
  app.get('/' + config.ADMIN_PATH + '/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  });
}

app.use((req, res) => {
  if (req.accepts('html')) return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  res.status(404).json({ status: 'error', error: { code: 'not_found', message: 'Endpoint tidak ditemukan' } });
});

initDb()
  .then(async () => {
    if (config.ADMIN_EMAILS.length) {
      const { pool } = require('./db');
      const { rows: booted } = await pool.query('SELECT email FROM admin_boot');
      const already = new Set(booted.map((r) => r.email));
      const pending = config.ADMIN_EMAILS.filter((e) => !already.has(e));
      if (pending.length) {
        await pool.query(
          'INSERT INTO admin_boot (email) VALUES (' + pending.map((_, i) => '$' + (i + 1)).join(',') + ') ON CONFLICT DO NOTHING',
          pending
        );
        const { rowCount } = await pool.query(
          'UPDATE users SET is_admin = true WHERE email = ANY($1)',
          [pending]
        );
        if (rowCount) console.log('Admin sync:', rowCount, 'akun dijadikan admin.');
      }
    }
    app.listen(config.PORT, () => {
      console.log('Media API v3 jalan di http://localhost:' + config.PORT);
    });
  })
  .catch((e) => {
    console.error('Gagal inisialisasi database:', e.message);
    process.exit(1);
  });

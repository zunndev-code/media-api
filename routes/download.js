const { pool } = require('../db');
const { extract, summarize, detectPlatform, isAllowedHost } = require('../scraper');
const { ensureDailyCredits } = require('../lib/credits');

function fail(res, status, code, message) {
  return res.status(status).json({ status: 'error', error: { code, message } });
}

function ok(res, status, data) {
  return res.status(status).json({ status: 'success', data });
}

const { ROLES } = require('../config');

let waitQueue = [];
let queueBusy = false;
function enqueue(task, priority = 0) {
  return new Promise((resolve, reject) => {
    waitQueue.push({ priority, task, resolve, reject });
    waitQueue.sort((a, b) => b.priority - a.priority);
    pumpQueue();
  });
}
async function pumpQueue() {
  if (queueBusy) return;
  queueBusy = true;
  while (waitQueue.length) {
    const item = waitQueue.shift();
    try { item.resolve(await item.task()); } catch (e) { item.reject(e); }
  }
  queueBusy = false;
}

const keyWindow = new Map();
function keyRateOk(keyId, max) {
  if (max <= 0) return true;
  const now = Date.now();
  const arr = (keyWindow.get(keyId) || []).filter((t) => now - t < 60000);
  if (arr.length >= max) {
    keyWindow.set(keyId, arr);
    return false;
  }
  arr.push(now);
  keyWindow.set(keyId, arr);
  return true;
}

function enqueue(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

async function resolveKey(req) {
  const value = req.headers['x-api-key'] || req.query.key || req.query.api_key;
  if (!value) return null;
  const { rows } = await pool.query(
    `SELECT k.id AS key_id, k.user_id, k.active, k.allowed_ips, u.role
     FROM api_keys k JOIN users u ON u.id = k.user_id
     WHERE k.key = $1`,
    [value]
  );
  if (!rows.length) return { error: { status: 401, code: 'invalid_key', message: 'API key tidak valid.' } };
  const key = rows[0];
  if (!key.active) return { error: { status: 403, code: 'key_disabled', message: 'API key dinonaktifkan.' } };
  return { key };
}

async function recordHit(ip, userId, keyId, endpoint, success) {
  try {
    await pool.query(
      'INSERT INTO hits (user_id, key_id, endpoint, success, ip) VALUES ($1, $2, $3, $4, $5)',
      [userId, keyId, endpoint, success, ip]
    );
  } catch {}
}

async function chargeSuccess(key) {
  try {
    await pool.query('UPDATE users SET credits = credits - 1 WHERE id = $1', [key.user_id]);
    await pool.query('UPDATE api_keys SET hits = hits + 1, last_used = now() WHERE id = $1', [key.key_id]);
  } catch {}
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket && req.socket.remoteAddress;
}

async function processDownload(req, res, { audioOnly, create, endpoint }) {
  const url = req.body && req.body.url ? req.body.url : req.query.url;
  if (!url || typeof url !== 'string') {
    return fail(res, 400, 'invalid_request', 'Field "url" wajib diisi. Contoh: {"url": "https://..."}');
  }
  if (!isAllowedHost(url)) {
    return fail(res, 400, 'unsupported_domain', 'URL tidak dikenali. Domain tidak diizinkan.');
  }

  const resolved = await resolveKey(req);
  if (resolved && resolved.error) return fail(res, resolved.error.status, resolved.error.code, resolved.error.message);
  const key = resolved && resolved.key ? resolved.key : null;
  const ip = clientIp(req);

  if (key) {
    const role = ROLES[key.role] || ROLES.free;
    if (role.whitelist && Array.isArray(key.allowed_ips) && key.allowed_ips.length &&
        !key.allowed_ips.includes(ip)) {
      await recordHit(ip, key.user_id, key.key_id, endpoint, false);
      return fail(res, 403, 'ip_not_allowed', 'IP ini tidak ada di whitelist key. Tambahkan IP ' + ip + ' lewat dashboard.');
    }
    if (!keyRateOk(key.key_id, role.rate)) {
      await recordHit(ip, key.user_id, key.key_id, endpoint, false);
      return fail(res, 429, 'rate_limited', 'Terlalu banyak request. Batas role ' + role.label + ': ' + role.rate + ' request per menit.');
    }
    const credits = await ensureDailyCredits(key.user_id, key.role);
    if (credits <= 0) {
      await recordHit(ip, key.user_id, key.key_id, endpoint, false);
      return fail(res, 402, 'insufficient_credits', 'Credit habis. Top-up atau tunggu jatah harian berikutnya.');
    }
  }

  const platform = detectPlatform(url) || 'unknown';
  const priority = key ? ((ROLES[key.role] || ROLES.free).priority || 0) : 0;
  return enqueue(async () => {
    try {
      const info = await extract(url, { audioOnly });
      const data = summarize(info, audioOnly);
      if (audioOnly && !data.audio.length) {
        await recordHit(clientIp(req), key && key.user_id, key && key.key_id, endpoint, false);
        return fail(res, 404, 'not_found', 'Audio tidak ditemukan untuk URL ini.');
      }
      if (!audioOnly && !data.formats.length) {
        await recordHit(clientIp(req), key && key.user_id, key && key.key_id, endpoint, false);
        return fail(res, 404, 'not_found', 'Format video tidak ditemukan untuk URL ini.');
      }
      if (key) await chargeSuccess(key);
      await recordHit(clientIp(req), key && key.user_id, key && key.key_id, endpoint, true);
      return ok(res, create ? 201 : 200, data);
    } catch (e) {
      await recordHit(clientIp(req), key && key.user_id, key && key.key_id, endpoint, false);
      return fail(res, 502, 'scrape_failed', e.message);
    }
  });
}

function makeHandler(platform, audioOnly = false) {
  return async (req, res) => {
    const url = req.query.url;
    if (!url) return fail(res, 400, 'invalid_request', 'Parameter url wajib diisi.');
    const detected = detectPlatform(url);
    if (!detected) return fail(res, 400, 'unsupported_domain', 'URL tidak dikenali. Domain tidak diizinkan.');
    if (!isAllowedHost(url)) return fail(res, 400, 'unsupported_domain', 'URL tidak dikenali. Domain tidak diizinkan.');
    return processDownload(req, res, { audioOnly, create: false, endpoint: '/api/' + platform });
  };
}

module.exports = {
  router: (() => {
    const router = require('express').Router();
    router.post('/download', (req, res) => processDownload(req, res, {
      audioOnly: !!(req.body && req.body.type === 'mp3'),
      create: true,
      endpoint: '/api/download',
    }));
    router.get('/download', (req, res) => processDownload(req, res, {
      audioOnly: req.query.type === 'mp3',
      create: false,
      endpoint: '/api/download',
    }));
    router.get('/yt', makeHandler('yt'));
    router.get('/ig', makeHandler('ig'));
    router.get('/fb', makeHandler('fb'));
    router.get('/tt', makeHandler('tt'));
    router.get('/x', makeHandler('x'));
    router.get('/mp3', makeHandler(null, true));
    return router;
  })(),
};

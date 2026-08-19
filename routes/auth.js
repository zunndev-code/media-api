const { pool } = require('../db');
const { signToken, setAuthCookie, clearAuthCookie, auth } = require('../middleware');
const { grantDaily } = require('../lib/credits');
const { hashPassword, verifyPassword, isScrypt } = require('../lib/password');
const config = require('../config');

function fail(res, status, code, message) {
  return res.status(status).json({ status: 'error', error: { code, message } });
}

function ok(res, status, data) {
  return res.status(status).json({ status: 'success', data });
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, roleInfo: config.ROLES[u.role], credits: u.credits, createdAt: u.created_at };
}

const router = require('express').Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !String(name).trim()) return fail(res, 400, 'invalid_request', 'Nama wajib diisi.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return fail(res, 400, 'invalid_request', 'Email tidak valid.');
  if (!password || String(password).length < 6) return fail(res, 400, 'invalid_request', 'Password minimal 6 karakter.');
  const clean = String(email).toLowerCase().trim();
  const ip = req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : (req.socket && req.socket.remoteAddress) || '';
  if (ip) {
    await pool.query(
      `INSERT INTO reg_track (ip, day, n) VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (ip, day) DO UPDATE SET n = reg_track.n + 1`,
      [ip]
    );
    const { rows: cnt } = await pool.query('SELECT n FROM reg_track WHERE ip = $1 AND day = CURRENT_DATE', [ip]);
    if (Number(cnt[0].n) > 3) {
      return fail(res, 429, 'rate_limited', 'Terlalu banyak pendaftaran dari IP ini. Coba lagi besok.');
    }
  }
  const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [clean]);
  if (exists.rows.length) return fail(res, 409, 'email_taken', 'Registrasi gagal. Coba email lain.');
  const hash = hashPassword(String(password));
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role, credits, created_at',
    [clean, hash, String(name).trim()]
  );
  const user = rows[0];
  await grantDaily(user.id, user.role);
  const fresh = await pool.query('SELECT credits FROM users WHERE id = $1', [user.id]);
  user.credits = fresh.rows[0].credits;
  setAuthCookie(req, res, signToken(user.id));
  return ok(res, 201, publicUser(user));
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 400, 'invalid_request', 'Email dan password wajib diisi.');
  const { rows } = await pool.query(
    'SELECT id, email, name, password_hash, role, credits, created_at FROM users WHERE email = $1',
    [String(email).toLowerCase().trim()]
  );
  const user = rows[0];
  if (!user || !user.password_hash || !verifyPassword(String(password), user.password_hash)) {
    return fail(res, 401, 'invalid_credentials', 'Email atau password salah.');
  }
  if (!isScrypt(user.password_hash)) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashPassword(String(password)), user.id]);
  }
  setAuthCookie(req, res, signToken(user.id));
  return ok(res, 200, publicUser(user));
});

router.post('/logout', (req, res) => {
  clearAuthCookie(req, res);
  return ok(res, 200, { loggedOut: true });
});

router.get('/me', auth(true), async (req, res) => {
  const { rows: keys } = await pool.query('SELECT id, name, key, active, hits, last_used FROM api_keys WHERE user_id = $1 ORDER BY id', [req.user.id]);
  const { rows: usage } = await pool.query(
    'SELECT count(*) FILTER (WHERE success) AS success, count(*) FILTER (WHERE NOT success) AS failed FROM hits WHERE user_id = $1 AND created_at >= CURRENT_DATE',
    [req.user.id]
  );
  return ok(res, 200, {
    user: publicUser(req.user),
    keys,
    usageToday: { success: Number(usage[0].success), failed: Number(usage[0].failed) },
  });
});

module.exports = { router, publicUser };

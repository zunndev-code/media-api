const jwt = require('jsonwebtoken');
const config = require('./config');
const { pool } = require('./db');

function signToken(userId) {
  return jwt.sign({ uid: userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
}

function isSecure(req) {
  return req.secure || req.get('x-forwarded-proto') === 'https' || config.FORCE_SECURE;
}

function setAuthCookie(req, res, token) {
  res.cookie(config.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure(req),
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

function clearAuthCookie(req, res) {
  res.clearCookie(config.COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: isSecure(req) });
}

async function loadUser(req) {
  const token = req.cookies && req.cookies[config.COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, email, name, role, credits, created_at FROM users WHERE id = $1',
      [payload.uid]
    );
    return rows.length ? rows[0] : null;
  } catch {
    return null;
  }
}

function auth(required) {
  return async (req, res, next) => {
    req.user = await loadUser(req);
    if (required && !req.user) {
      return res.status(401).json({ status: 'error', error: { code: 'unauthorized', message: 'Login dulu.' } });
    }
    next();
  };
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, auth };

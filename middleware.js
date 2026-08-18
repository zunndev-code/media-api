const jwt = require('jsonwebtoken');
const config = require('./config');
const { pool } = require('./db');

function signToken(userId) {
  return jwt.sign({ uid: userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
}

function isSecure(req) {
  return req.secure || req.get('x-forwarded-proto') === 'https' || config.FORCE_SECURE;
}

const TOKEN_MAXAGE = 1000 * 60 * 60 * 24 * 90;

function setAuthCookie(req, res, token) {
  res.cookie(config.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure(req),
    maxAge: TOKEN_MAXAGE,
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
      'SELECT id, email, name, role, credits, is_admin, created_at FROM users WHERE id = $1',
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
    if (req.user) setAuthCookie(req, res, signToken(req.user.id));
    if (required && !req.user) {
      return res.status(401).json({ status: 'error', error: { code: 'unauthorized', message: 'Login dulu.' } });
    }
    next();
  };
}

function adminAuth(required) {
  return async (req, res, next) => {
    req.user = await loadUser(req);
    if (req.user) setAuthCookie(req, res, signToken(req.user.id));
    if (required && (!req.user || !req.user.is_admin)) {
      return res.status(403).json({ status: 'error', error: { code: 'forbidden', message: 'Bukan admin.' } });
    }
    next();
  };
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, auth, adminAuth };

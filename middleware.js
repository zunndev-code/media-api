const jwt = require('jsonwebtoken');
const config = require('./config');
const { pool } = require('./db');

function signToken(userId) {
  return jwt.sign({ uid: userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
}

function setAuthCookie(res, token) {
  const secure = config.FORCE_SECURE;
  res.cookie(config.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(config.COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: config.FORCE_SECURE });
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

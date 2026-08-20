const jwt = require('jsonwebtoken');
const config = require('./config');
const { pool } = require('./db');

const SESSION_MAXAGE = 12 * 60 * 60 * 1000;      // 12 jam tanpa remember me
const TOKEN_MAXAGE = 90 * 24 * 60 * 60 * 1000;   // 90 hari dengan remember me

function signToken(userId, remember, version) {
  return jwt.sign(
    { uid: userId, rm: remember ? 1 : 0, v: version || 0 },
    config.JWT_SECRET,
    { expiresIn: remember ? config.JWT_EXPIRES : '12h' }
  );
}

function isSecure(req) {
  return req.secure || req.get('x-forwarded-proto') === 'https' || config.FORCE_SECURE;
}

function setAuthCookie(req, res, token, remember) {
  res.cookie(config.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure(req),
    maxAge: remember ? TOKEN_MAXAGE : SESSION_MAXAGE,
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
      'SELECT id, email, name, role, credits, is_admin, created_at, token_version FROM users WHERE id = $1',
      [payload.uid]
    );
    if (!rows.length) return null;
    const u = rows[0];
    if ((payload.v || 0) !== (u.token_version || 0)) return null;
    u._rm = payload.rm === 1;
    return u;
  } catch {
    return null;
  }
}

function auth(required) {
  return async (req, res, next) => {
    req.user = await loadUser(req);
    if (req.user) setAuthCookie(req, res, signToken(req.user.id, req.user._rm, req.user.token_version), req.user._rm);
    if (required && !req.user) {
      return res.status(401).json({ status: 'error', error: { code: 'unauthorized', message: 'Login dulu.' } });
    }
    next();
  };
}

function adminAuth(required) {
  return async (req, res, next) => {
    req.user = await loadUser(req);
    if (req.user) setAuthCookie(req, res, signToken(req.user.id, req.user._rm, req.user.token_version), req.user._rm);
    if (required && (!req.user || !req.user.is_admin)) {
      return res.status(403).json({ status: 'error', error: { code: 'forbidden', message: 'Bukan admin.' } });
    }
    next();
  };
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, auth, adminAuth };
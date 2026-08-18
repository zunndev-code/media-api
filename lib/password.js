const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const N = 131072;
const R = 8;
const P = 1;
const KEYLEN = 64;

const MAXMEM = 256 * 1024 * 1024;

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const key = crypto.scryptSync(String(password), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return ['scrypt', N, R, P, salt, key.toString('hex')].join('$');
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$');
    if (parts.length !== 6) return false;
    const [, n, r, p, salt, keyHex] = parts;
    try {
      const key = crypto.scryptSync(String(password), salt, Buffer.from(keyHex, 'hex').length, {
        N: Number(n),
        r: Number(r),
        p: Number(p),
        maxmem: MAXMEM,
      });
      const expected = Buffer.from(keyHex, 'hex');
      return key.length === expected.length && crypto.timingSafeEqual(key, expected);
    } catch {
      return false;
    }
  }
  try {
    return bcrypt.compareSync(String(password), stored);
  } catch {
    return false;
  }
}

function isScrypt(stored) {
  return typeof stored === 'string' && stored.startsWith('scrypt$');
}

module.exports = { hashPassword, verifyPassword, isScrypt };
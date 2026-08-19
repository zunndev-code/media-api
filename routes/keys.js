const crypto = require('crypto');
const { pool } = require('../db');
const { auth } = require('../middleware');
const { ROLES } = require('../config');

function fail(res, status, code, message) {
  return res.status(status).json({ status: 'error', error: { code, message } });
}

function ok(res, status, data) {
  return res.status(status).json({ status: 'success', data });
}

const router = require('express').Router();

router.get('/', auth(true), async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, key, active, hits, last_used, created_at, allowed_ips FROM api_keys WHERE user_id = $1 ORDER BY id',
    [req.user.id]
  );
  return ok(res, 200, rows);
});

router.post('/', auth(true), async (req, res) => {
  const name = (req.body && req.body.name ? String(req.body.name).trim() : 'default').slice(0, 40);
  const role = ROLES[req.user.role] || ROLES.free;
  const { rows: cnt } = await pool.query('SELECT COUNT(*)::int AS c FROM api_keys WHERE user_id = $1', [req.user.id]);
  if (!req.user.is_admin && cnt[0].c >= role.keys) {
    return fail(res, 400, 'key_limit', 'Batas maksimal API key untuk role ' + role.label + ' adalah ' + role.keys + '. Hapus key lama atau upgrade role.');
  }
  const key = 'md_' + crypto.randomBytes(24).toString('hex');
  const { rows } = await pool.query(
    'INSERT INTO api_keys (user_id, name, key) VALUES ($1, $2, $3) RETURNING id, name, key, active, hits, created_at',
    [req.user.id, name, key]
  );
  return ok(res, 201, rows[0]);
});

router.post('/:id/toggle', auth(true), async (req, res) => {
  const { rows } = await pool.query(
    'UPDATE api_keys SET active = NOT active WHERE id = $1 AND user_id = $2 RETURNING id, active',
    [req.params.id, req.user.id]
  );
  if (!rows.length) return fail(res, 404, 'not_found', 'Key tidak ditemukan.');
  return ok(res, 200, rows[0]);
});

router.put('/:id/ips', auth(true), async (req, res) => {
  const role = ROLES[req.user.role] || ROLES.free;
  if (!role.whitelist) {
    return fail(res, 403, 'whitelist_unsupported', 'Role ' + role.label + ' tidak punya fitur IP whitelist.');
  }
  const raw = Array.isArray(req.body && req.body.ips) ? req.body.ips : [];
  const ips = raw
    .map((x) => String(x).trim())
    .filter((x) => /^[0-9a-fA-F:.]+$/.test(x) && x.length <= 45)
    .slice(0, 20);
  const { rows } = await pool.query(
    'UPDATE api_keys SET allowed_ips = $1 WHERE id = $2 AND user_id = $3 RETURNING id, allowed_ips',
    [ips, Number(req.params.id), req.user.id]
  );
  if (!rows.length) return fail(res, 404, 'not_found', 'Key tidak ditemukan.');
  return ok(res, 200, rows[0]);
});

router.delete('/:id', auth(true), async (req, res) => {
  const { rows } = await pool.query(
    'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  );
  if (!rows.length) return fail(res, 404, 'not_found', 'Key tidak ditemukan.');
  return ok(res, 200, { deleted: rows[0].id });
});

module.exports = router;

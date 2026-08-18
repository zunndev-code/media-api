const { pool } = require('../db');
const config = require('../config');
const { adminAuth } = require('../middleware');
const { activateOrder, setUserRole } = require('../lib/orders');

const router = require('express').Router();

function fail(res, status, code, message) {
  return res.status(status).json({ status: 'error', error: { code, message } });
}

function ok(res, status, data) {
  return res.status(status).json({ status: 'success', data });
}

router.get('/overview', adminAuth(true), async (req, res) => {
  const [users, orders, revenue, hitsToday, hitsTotal] = await Promise.all([
    pool.query('SELECT count(*)::int AS n FROM users'),
    pool.query("SELECT count(*)::int AS n FROM orders WHERE status = 'pending'"),
    pool.query("SELECT COALESCE(sum(amount), 0)::int AS n FROM orders WHERE status = 'paid'"),
    pool.query("SELECT count(*)::int AS n FROM hits WHERE created_at >= CURRENT_DATE"),
    pool.query('SELECT count(*)::int AS n FROM hits'),
  ]);
  return ok(res, 200, {
    users: users.rows[0].n,
    ordersPending: orders.rows[0].n,
    revenue: revenue.rows[0].n,
    hitsToday: hitsToday.rows[0].n,
    hitsTotal: hitsTotal.rows[0].n,
  });
});

router.get('/orders', adminAuth(true), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.role, o.amount, o.status, o.created_at, o.paid_at, o.expires_at, u.email, u.name
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC LIMIT 50`
  );
  return ok(res, 200, rows.map((o) => ({
    id: o.id,
    role: o.role,
    roleInfo: config.ROLES[o.role],
    amount: o.amount,
    status: o.status,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    expiresAt: o.expires_at,
    email: o.email,
    name: o.name,
  })));
});

router.post('/orders/:id/mark-paid', adminAuth(true), async (req, res) => {
  const id = Number(req.params.id);
  const activated = await activateOrder(id);
  if (!activated) return fail(res, 409, 'cannot_mark', 'Pesanan sudah tidak pending.');
  return ok(res, 200, { activated: true });
});

router.post('/orders/:id/cancel', adminAuth(true), async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query(
    "UPDATE orders SET status = 'cancelled' WHERE id = $1 AND status = 'pending' RETURNING id",
    [id]
  );
  if (!rows.length) return fail(res, 409, 'cannot_cancel', 'Pesanan sudah tidak pending.');
  return ok(res, 200, { cancelled: true });
});

router.get('/users', adminAuth(true), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.credits, u.is_admin, u.created_at,
            (SELECT count(*)::int FROM api_keys k WHERE k.user_id = u.id) AS keys,
            (SELECT count(*)::int FROM hits h WHERE h.user_id = u.id) AS hits
     FROM users u ORDER BY u.id LIMIT 100`
  );
  return ok(res, 200, rows);
});

router.post('/users/:id/role', adminAuth(true), async (req, res) => {
  const id = Number(req.params.id);
  const role = req.body && req.body.role;
  if (!role || !config.ROLES[role]) return fail(res, 400, 'invalid_request', 'Role tidak valid.');
  await setUserRole(id, role);
  return ok(res, 200, { role });
});

module.exports = { router };
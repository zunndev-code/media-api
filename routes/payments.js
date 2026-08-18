const { pool } = require('../db');
const config = require('../config');
const qris = require('../lib/qris');
const { auth } = require('../middleware');
const { activateOrder } = require('../lib/orders');

const router = require('express').Router();

function fail(res, status, code, message) {
  return res.status(status).json({ status: 'error', error: { code, message } });
}

function ok(res, status, data) {
  return res.status(status).json({ status: 'success', data });
}

function publicOrder(o) {
  return {
    id: o.id,
    role: o.role,
    roleInfo: config.ROLES[o.role],
    amount: o.amount,
    status: o.status,
    qrisUrl: o.qris_url,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    expiresAt: o.expires_at,
  };
}

router.post('/orders', auth(true), async (req, res) => {
  const role = req.body && req.body.role;
  if (!role || !config.ROLES[role] || config.ROLES[role].price <= 0) {
    return fail(res, 400, 'invalid_request', 'Role tidak valid.');
  }
  if (!config.QRIS.enabled) {
    return fail(res, 503, 'payment_disabled', 'Pembayaran QRIS belum diaktifkan.');
  }
  if (req.user.role === role) {
    return fail(res, 409, 'already_owned', 'Kamu sudah punya role ini.');
  }
  const user = req.user;
  await pool.query(
    "UPDATE orders SET status = 'cancelled' WHERE user_id = $1 AND role = $2 AND status IN ('pending', 'expired')",
    [user.id, role]
  );
  const { rows } = await pool.query(
    'INSERT INTO orders (user_id, role, amount) VALUES ($1, $2, $3) RETURNING id, user_id, role, amount, status, created_at',
    [user.id, role, config.ROLES[role].price]
  );
  const order = rows[0];
  try {
    const pay = await qris.createPayment({
      amount: order.amount,
      orderId: 'ZD-' + order.id + '-' + Date.now(),
      customerName: user.name,
    });
    const updated = await pool.query(
      "UPDATE orders SET trx_id = $1, qris_url = $2, expires_at = now() + interval '10 minutes' WHERE id = $3 RETURNING *",
      [pay.transaction_id, pay.qris_url, order.id]
    );
    return ok(res, 201, publicOrder(updated.rows[0]));
  } catch (e) {
    await pool.query("UPDATE orders SET status = 'failed' WHERE id = $1", [order.id]);
    return fail(res, e.status && e.status < 500 ? e.status : 502, 'qris_error', e.message || 'Gagal hubungi QRIS.PW.');
  }
});

router.get('/orders', auth(true), async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [req.user.id]);
  return ok(res, 200, rows.map(publicOrder));
});

router.get('/orders/:id', auth(true), async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  const order = rows[0];
  if (!order) return fail(res, 404, 'not_found', 'Pesanan tidak ditemukan.');
  if (order.status === 'pending' && order.trx_id) {
    try {
      const status = await qris.checkPayment(order.trx_id);
      if (status.status === 'paid') {
        await activateOrder(order.id);
      } else if (['expired', 'failed', 'cancelled'].includes(status.status)) {
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status.status, order.id]);
      }
    } catch (e) {
      // biarkan status lama, polling berikutnya coba lagi
    }
  }
  const fresh = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  return ok(res, 200, publicOrder(fresh.rows[0]));
});

router.post('/orders/:id/cancel', auth(true), async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query(
    "UPDATE orders SET status = 'cancelled' WHERE id = $1 AND user_id = $2 AND status = 'pending' RETURNING *",
    [id, req.user.id]
  );
  if (!rows.length) return fail(res, 409, 'cannot_cancel', 'Pesanan tidak bisa dibatalkan.');
  return ok(res, 200, publicOrder(rows[0]));
});

router.post('/webhook/qris', async (req, res) => {
  const payload = req.body || {};
  if (!qris.verifyWebhook(payload)) {
    return res.status(401).json({ success: false, error: 'Signature tidak valid' });
  }
  if (payload.status === 'paid' && payload.transaction_id) {
    const { rows } = await pool.query('SELECT id FROM orders WHERE trx_id = $1', [payload.transaction_id]);
    if (rows.length) await activateOrder(rows[0].id);
  }
  return res.json({ success: true });
});

module.exports = { router };
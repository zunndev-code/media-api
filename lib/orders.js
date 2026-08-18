const { pool } = require('../db');
const { grantDaily } = require('./credits');

async function activateOrder(orderId) {
  const { rows } = await pool.query(
    "UPDATE orders SET status = 'paid', paid_at = now() WHERE id = $1 AND status = 'pending' RETURNING user_id, role",
    [orderId]
  );
  if (!rows.length) return false;
  const order = rows[0];
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [order.role, order.user_id]);
  await grantDaily(order.user_id, order.role);
  return true;
}

async function setUserRole(userId, role) {
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
  await grantDaily(userId, role);
}

module.exports = { activateOrder, setUserRole };
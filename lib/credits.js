const config = require('../config');
const { pool } = require('../db');

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function grantDaily(userId, role) {
  const daily = config.ROLES[role] && config.ROLES[role].daily;
  if (!daily) return;
  const { rows } = await pool.query('SELECT granted FROM daily_free WHERE user_id = $1 AND day = $2', [userId, today()]);
  if (rows.length) return;
  await pool.query('INSERT INTO daily_free (user_id, day, granted) VALUES ($1, $2, $3)', [userId, today(), daily]);
  await pool.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [daily, userId]);
}

async function ensureDailyCredits(userId, role) {
  await grantDaily(userId, role);
  const { rows } = await pool.query('SELECT credits FROM users WHERE id = $1', [userId]);
  return rows.length ? rows[0].credits : 0;
}

module.exports = { grantDaily, ensureDailyCredits };

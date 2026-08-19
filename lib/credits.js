const config = require('../config');
const { pool } = require('../db');

const WEEK = "date_trunc('week', CURRENT_DATE)::date";

async function grantDaily(userId, role) {
  const daily = config.ROLES[role] && config.ROLES[role].daily;
  if (!daily) return;
  const amount = daily * 7;
  const { rows } = await pool.query(
    `SELECT 1 FROM daily_free WHERE user_id = $1 AND day = ${WEEK}`,
    [userId]
  );
  if (rows.length) return;
  await pool.query(
    `INSERT INTO daily_free (user_id, day, granted) VALUES ($1, ${WEEK}, $2)`,
    [userId, amount]
  );
  await pool.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [amount, userId]);
}

async function ensureDailyCredits(userId, role) {
  await grantDaily(userId, role);
  const { rows } = await pool.query('SELECT credits FROM users WHERE id = $1', [userId]);
  return rows.length ? rows[0].credits : 0;
}

module.exports = { grantDaily, ensureDailyCredits };

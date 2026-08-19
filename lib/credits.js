const config = require('../config');
const { pool } = require('../db');

const WEEK = "date_trunc('week', CURRENT_DATE)::date";

async function grantDaily(userId, role) {
  const daily = config.ROLES[role] && config.ROLES[role].daily;
  const { rows: v } = await pool.query('SELECT is_verified FROM users WHERE id = $1', [userId]);
  if (!v.length || !v[0].is_verified) return;
  if (!daily) return;
  const amount = daily * 7;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO daily_free (user_id, day, granted) VALUES ($1, ${WEEK}, 0)
       ON CONFLICT (user_id, day) DO NOTHING`,
      [userId]
    );
    await client.query(
      `SELECT 1 FROM daily_free WHERE user_id = $1 AND day = ${WEEK} FOR UPDATE`,
      [userId]
    );
    const { rows } = await client.query(
      `SELECT COALESCE(SUM(granted), 0) AS g FROM daily_free WHERE user_id = $1 AND day >= ${WEEK}`,
      [userId]
    );
    const missing = amount - Number(rows[0].g);
    if (missing > 0) {
      await client.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [missing, userId]);
      await client.query(
        `UPDATE daily_free SET granted = granted + $1 WHERE user_id = $2 AND day = ${WEEK}`,
        [missing, userId]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function ensureDailyCredits(userId, role) {
  await grantDaily(userId, role);
  const { rows } = await pool.query('SELECT credits FROM users WHERE id = $1', [userId]);
  return rows.length ? rows[0].credits : 0;
}

module.exports = { grantDaily, ensureDailyCredits };
const { pool } = require('../db');
const { auth } = require('../middleware');
const { grantDaily } = require('../lib/credits');
const config = require('../config');

function ok(res, status, data) {
  return res.status(status).json({ status: 'success', data });
}

const router = require('express').Router();

router.get('/stats', async (req, res) => {
  const [{ rows: hitsToday }, { rows: hitsTotal }, { rows: users }] = await Promise.all([
    pool.query('SELECT count(*) FROM hits WHERE created_at >= CURRENT_DATE'),
    pool.query('SELECT count(*) FROM hits'),
    pool.query('SELECT count(*) FROM users'),
  ]);
  return ok(res, 200, {
    hitsToday: Number(hitsToday[0].count),
    hitsTotal: Number(hitsTotal[0].count),
    users: Number(users[0].count),
  });
});

router.get('/stats/daily', auth(false), async (req, res) => {
  const { rows: days } = await pool.query(
    `SELECT to_char(day, 'YYYY-MM-DD') AS day, hits
     FROM generate_series(CURRENT_DATE - 13, CURRENT_DATE, interval '1 day') AS day
     LEFT JOIN (
       SELECT date_trunc('day', created_at) AS d, count(*) AS hits
       FROM hits WHERE created_at >= CURRENT_DATE - 13
       GROUP BY d
     ) h ON h.d = day
     ORDER BY day`
  );
  const data = {
    days: days.map(r => ({ date: r.day, hits: Number(r.hits || 0) })),
  };
  if (req.user) {
    const { rows: mine } = await pool.query(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, hits
       FROM generate_series(CURRENT_DATE - 13, CURRENT_DATE, interval '1 day') AS day
       LEFT JOIN (
         SELECT date_trunc('day', created_at) AS d, count(*) AS hits
         FROM hits WHERE user_id = $1 AND created_at >= CURRENT_DATE - 13
         GROUP BY d
       ) h ON h.d = day
       ORDER BY day`,
      [req.user.id]
    );
    const { rows: today } = await pool.query(
      'SELECT count(*) AS hits FROM hits WHERE user_id = $1 AND created_at >= CURRENT_DATE',
      [req.user.id]
    );
    const { rows: total } = await pool.query(
      'SELECT count(*) AS hits FROM hits WHERE user_id = $1',
      [req.user.id]
    );
    const { rows: credits } = await pool.query(
      'SELECT credits FROM users WHERE id = $1',
      [req.user.id]
    );
    data.me = {
      days: mine.map(r => ({ date: r.day, hits: Number(r.hits || 0) })),
      today: Number(today[0].hits),
      total: Number(total[0].hits),
      credits: Number(credits[0].credits),
    };
  }
  return ok(res, 200, data);
});

router.get('/roles', (req, res) => {
  return ok(res, 200, config.ROLES);
});

router.get('/apis', (req, res) => {
  return ok(res, 200, config.APIS);
});

router.get('/dashboard', auth(true), async (req, res) => {
  const u = req.user;
  await grantDaily(u.id, u.role);
  const [{ rows: user }, { rows: keys }, { rows: usage }, { rows: daily }] = await Promise.all([
    pool.query('SELECT id, email, name, role, credits, created_at FROM users WHERE id = $1', [u.id]),
    pool.query('SELECT id, name, key, active, hits, last_used FROM api_keys WHERE user_id = $1 ORDER BY id', [u.id]),
    pool.query(
      `SELECT
         count(*) FILTER (WHERE success) AS success,
         count(*) FILTER (WHERE NOT success) AS failed
       FROM hits WHERE user_id = $1`,
      [u.id]
    ),
    pool.query(
      `SELECT
         count(*) FILTER (WHERE created_at >= CURRENT_DATE) AS today,
         count(*) FILTER (WHERE created_at >= CURRENT_DATE AND success) AS today_success
       FROM hits WHERE user_id = $1`,
      [u.id]
    ),
  ]);
  const { rows: history } = await pool.query(
    `SELECT h.id, h.endpoint, h.success, h.created_at, k.name AS key_name
     FROM hits h LEFT JOIN api_keys k ON k.id = h.key_id
     WHERE h.user_id = $1 ORDER BY h.created_at DESC LIMIT 25`,
    [u.id]
  );
  const { rows: dailyToday } = await pool.query(
    'SELECT granted FROM daily_free WHERE user_id = $1 AND day = CURRENT_DATE',
    [u.id]
  );
  return ok(res, 200, {
    user: user[0],
    roleInfo: config.ROLES[user[0].role],
    keys,
    stats: {
      total: Number(usage[0].success) + Number(usage[0].failed),
      success: Number(usage[0].success),
      failed: Number(usage[0].failed),
      today: Number(daily[0].today),
      todaySuccess: Number(daily[0].today_success),
    },
    dailyGranted: dailyToday.length ? Number(dailyToday[0].granted) : null,
    history,
  });
});

module.exports = router;

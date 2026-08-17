require('dotenv').config();

const ROLES = {
  free: { label: 'Free', daily: 1000, price: 0, color: '#9092a4' },
  vip: { label: 'VIP', daily: 5000, price: 10000, color: '#1bd96a' },
  gars: { label: 'GARS', daily: 15000, price: 20000, color: '#ffd166' },
  vilions: { label: 'VILIONS', daily: 40000, price: 30000, color: '#ff6b9d' },
  verus: { label: 'VERUS', daily: 100000, price: 40000, color: '#b98cff' },
};

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  RATE_LIMIT_PER_MIN: Number(process.env.RATE_LIMIT_PER_MIN) || 60,
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://zunndev:zunndev_dev_pass@localhost:5432/media_api',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '30d',
  COOKIE_NAME: 'md_token',
  FORCE_SECURE: process.env.FORCE_SECURE === 'true',
  ROLES,
};

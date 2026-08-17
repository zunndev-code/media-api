const crypto = require('crypto');
const config = require('../config');

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': config.QRIS.key,
    'X-API-Secret': config.QRIS.secret,
  };
}

async function createPayment({ amount, orderId, customerName, customerPhone }) {
  const body = {
    amount,
    order_id: orderId,
    customer_name: customerName,
    customer_phone: customerPhone || undefined,
    callback_url: config.QRIS.callbackUrl,
  };
  const res = await fetch(config.QRIS.base + '/create-payment.php', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const err = new Error(data.error || 'Gagal buat pembayaran QRIS');
    err.status = res.status;
    throw err;
  }
  return data;
}

async function checkPayment(trxId) {
  const res = await fetch(config.QRIS.base + '/check-payment.php?transaction_id=' + encodeURIComponent(trxId), {
    headers: headers(),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const err = new Error(data.error || 'Gagal cek status pembayaran');
    err.status = res.status;
    throw err;
  }
  return data;
}

function verifyWebhook(payload) {
  if (!config.QRIS.webhookSecret) return false;
  const signature = payload && payload.signature;
  if (!signature) return false;
  const candidates = [];
  const { signature: _drop, ...rest } = payload;
  candidates.push(JSON.stringify(rest));
  candidates.push(JSON.stringify(payload));
  const docOrder = {
    transaction_id: payload.transaction_id,
    order_id: payload.order_id,
    amount: payload.amount,
    status: payload.status,
    paid_at: payload.paid_at,
    timestamp: payload.timestamp,
    signature: signature,
  };
  candidates.push(JSON.stringify(docOrder));
  return candidates.some((c) => crypto.createHmac('sha256', config.QRIS.webhookSecret).update(c).digest('hex') === signature);
}

module.exports = { createPayment, checkPayment, verifyWebhook };

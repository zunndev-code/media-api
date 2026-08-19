const config = require('../config');

async function sendVerification(to, code) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: 'Ziplan <noreply@ziplan.eu.cc>',
      to,
      subject: 'Kode verifikasi Ziplan',
      html:
        '<div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;border-radius:14px;border:1px solid #e5e7eb">' +
        '<div style="font-size:20px;font-weight:800;color:#13151d">Ziplan</div>' +
        '<p style="color:#374151;margin:16px 0 4px">Kode verifikasi kamu:</p>' +
        '<div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#635bff;margin:8px 0">' + code + '</div>' +
        '<p style="color:#6b7280;font-size:13px;margin:12px 0 0">Kode berlaku 10 menit. Kalau kamu tidak mendaftar di ziplan.eu.cc, abaikan email ini.</p>' +
        '</div>',
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error('resend failed ' + res.status + ' ' + body.slice(0, 120));
  }
}

module.exports = { sendVerification };
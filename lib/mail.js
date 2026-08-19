const config = require('../config');

async function sendVerification(to, code) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: 'Ziplan <auth@ziplan.eu.cc>',
      to,
      subject: 'Kode verifikasi Ziplan',
      html:
        '<div style="font-family:Arial,Helvetica,sans-serif;max-width:420px;margin:0 auto;padding:24px;border-radius:14px;border:1px solid #e5e7eb;background:#ffffff">' +
        '<div style="font-size:18px;font-weight:700;color:#13151d">Ziplan</div>' +
        '<p style="color:#374151;font-size:14px;margin:16px 0 4px">Halo,</p>' +
        '<p style="color:#374151;font-size:14px;margin:0 0 12px">Gunakan kode berikut untuk menyelesaikan pendaftaran akun Ziplan:</p>' +
        '<div style="font-size:30px;font-weight:700;letter-spacing:6px;color:#13151d;margin:8px 0">' + code + '</div>' +
        '<p style="color:#6b7280;font-size:12px;margin:12px 0 0">Kode berlaku selama 10 menit.</p>' +
        '<p style="color:#9ca3af;font-size:11px;margin:8px 0 0">Jika Anda tidak merasa mendaftar di Ziplan, abaikan email ini.</p>' +
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
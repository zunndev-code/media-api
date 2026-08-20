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
        '<p style="color:#374151;font-size:14px;margin:16px 0 4px">Halo! Terima kasih sudah mencoba Ziplan.</p>' +
        '<p style="color:#374151;font-size:14px;margin:0 0 4px">Ini adalah nomor PIN rahasia untuk mengaktifkan akunmu:</p>' +
        '<div style="font-size:30px;font-weight:700;letter-spacing:6px;color:#13151d;margin:8px 0">' + code + '</div>' +
        '<p style="color:#374151;font-size:13px;margin:0 0 8px">Jangan bagikan PIN ini kepada siapa pun ya.</p>' +
        '<p style="color:#9ca3af;font-size:11px;margin:8px 0 0">Kode berlaku 10 menit. Jika kamu tidak mendaftar di Ziplan, abaikan email ini.</p>' +
        '</div>',
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error('resend failed ' + res.status + ' ' + body.slice(0, 120));
  }
}

async function sendReset(to, url) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: 'Ziplan <auth@ziplan.eu.cc>',
      to,
      subject: 'Reset password Ziplan',
      html:
        '<div style="font-family:Arial,Helvetica,sans-serif;max-width:420px;margin:0 auto;padding:24px;border-radius:14px;border:1px solid #e5e7eb;background:#ffffff">' +
        '<div style="font-size:18px;font-weight:700;color:#13151d">Ziplan</div>' +
        '<p style="color:#374151;font-size:14px;margin:16px 0 4px">Halo!</p>' +
        '<p style="color:#374151;font-size:14px;margin:0 0 16px">Kami menerima permintaan untuk mengatur ulang password akunmu. Klik tombol di bawah untuk membuat password baru:</p>' +
        '<a href="' + url + '" style="display:inline-block;background:#635bff;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 22px;border-radius:10px">Reset password</a>' +
        '<p style="color:#9ca3af;font-size:11px;margin:16px 0 0">Tautan berlaku 1 jam. Jika kamu tidak meminta reset password, abaikan email ini.</p>' +
        '</div>',
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error('resend failed ' + res.status + ' ' + body.slice(0, 120));
  }
}

module.exports = { sendVerification, sendReset };
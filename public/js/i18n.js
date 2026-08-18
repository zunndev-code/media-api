/* ===== Zunndev i18n — EN default, ID alternatif ===== */
(function () {
  'use strict';
  const LANG = {
    en: {
      'nav.home': 'Home', 'nav.endpoint': 'Endpoints', 'nav.stats': 'Stats', 'nav.docs': 'Docs',
      'nav.keys': 'API Keys', 'nav.hist': 'History', 'nav.lblMain': 'Menu', 'nav.lblMore': 'More',
      'dash.title': 'Dashboard', 'dash.sub': 'Your API usage at a glance',
      'buy.title': 'Credits & Roles', 'buy.sub': 'Pick a role — the higher the role, the more requests per day',
      'buy.left': 'credits left', 'buy.free': 'Free forever', 'buy.login': 'Log in first', 'buy.yours': 'Your plan',
      'buy.now': 'Buy now', 'buy.freePrice': 'Free', 'buy.perMonth': '/month',
      'buy.featDaily': '{n} credits every day', 'buy.featApis': 'All APIs', 'buy.featKeys': 'Unlimited keys',
      'buy.qr': 'View QR', 'buy.cancel': 'Cancel',
      'buy.orders.pending': 'Waiting for payment', 'buy.orders.paid': 'Paid', 'buy.orders.expired': 'Expired',
      'buy.orders.failed': 'Failed', 'buy.orders.cancelled': 'Cancelled',
      'nav.buy': 'Buy Role', 'nav.dash': 'Dashboard', 'nav.login': 'Log in', 'nav.register': 'Register',
      'common.logout': 'Log out', 'common.cancel': 'Cancel',
      'dash.overview': 'Overview', 'dash.keys': 'API Keys', 'dash.history': 'History', 'dash.buy': 'Buy',
      'greet.morning': 'Good morning', 'greet.afternoon': 'Good afternoon', 'greet.evening': 'Good evening', 'greet.night': 'Good night',
      'ov.quota': 'Today\u2019s quota: {n} credits',
      'ov.addCredit': 'Add credits',
      'ov.credits': 'Credit balance', 'ov.today': 'Hits today', 'ov.total': 'Total hits', 'ov.failed': 'Failed requests',
      'ov.usage': 'Usage — last 7 days',
      'keys.title': 'API Keys', 'keys.sub': '1 successful request = 1 credit. Never share your key.',
      'keys.create': 'Create key', 'keys.name': 'key name (optional)',
      'keys.copy': 'Copy', 'keys.copied': 'Copied!', 'keys.disable': 'Disable', 'keys.enable': 'Enable',
      'keys.delete': 'Delete', 'keys.on': 'active', 'keys.off': 'off',
      'keys.empty': 'No keys yet. Create your first key — free.',
      'keys.delTitle': 'Delete API key?', 'keys.delText': 'This key will be permanently deleted and can no longer be used.',
      'hist.title': 'Usage History', 'hist.sub': 'Last 25 requests across all your keys.',
      'hist.empty': 'No usage yet. Try calling the API with your key.',
      'hist.ok': 'success', 'hist.fail': 'failed',
      'buy.plan': 'Your plan', 'buy.orders': 'Role Orders', 'buy.note': 'After you click Buy now, a QR code appears — scan it with any e-wallet (GoPay, OVO, DANA, ShopeePay) or mobile banking. Your role activates automatically once payment is detected. QR is valid for 10 minutes.',
      'login.title': 'Log in', 'login.sub': 'Back to your dashboard', 'login.email': 'Email', 'login.password': 'Password',
      'login.submit': 'Log in', 'login.foot': 'No account?', 'login.register': 'Register free', 'login.divider': 'or use email',
      'register.title': 'Create account', 'register.sub': 'Name, email, password — that\u2019s it.', 'register.name': 'Name',
      'register.submit': 'Create account', 'register.foot': 'Already have an account?', 'register.login': 'Log in',
      'land.kicker': 'API Platform · Free 1000 credits every day',
      'land.h1': 'Fast API for your <span class="dim">bots &amp;</span> <span class="hl">tools.</span>',
      'land.sub': 'Media downloader now — music and image tools next. One account, one key, every API.',
      'land.cta': 'Start free', 'land.cta2': 'How to use',
      'land.cara': 'How it works', 'land.carasub': 'From signup to your first request — under a minute.',
      'land.s1': 'STEP 1', 'land.s1t': 'Sign up free', 'land.s1d': 'Instantly get 1000 credits. Another 1000 tomorrow. Every single day.',
      'land.s2': 'STEP 2', 'land.s2t': 'Create an API key', 'land.s2d': 'One click from your dashboard. Keys look like md_... — keep them safe.',
      'land.s3': 'STEP 3', 'land.s3t': 'Send a request', 'land.s3d': 'Pass your key in the X-API-Key header. 1 successful request = 1 credit.',
      'stats.title': 'Statistics', 'stats.sub': 'How many times bots & apps hit the API every day.',
      'endpoints.title': 'All endpoints.', 'endpoints.sub': 'Click a row to copy its path.',
      'docs.title': 'API Guide.', 'docs.sub': 'From signup to your first request — under a minute.',
    },
    id: {
      'nav.home': 'Beranda', 'nav.endpoint': 'Endpoint', 'nav.stats': 'Stats', 'nav.docs': 'Docs',
      'nav.keys': 'API Key', 'nav.hist': 'Riwayat', 'nav.lblMain': 'Menu', 'nav.lblMore': 'Lainnya',
      'dash.title': 'Dashboard', 'dash.sub': 'Ringkasan pemakaian API kamu',
      'buy.title': 'Credit & Role', 'buy.sub': 'Pilih role — makin tinggi role, makin banyak request per hari',
      'buy.left': 'credit tersisa', 'buy.free': 'Gratis selamanya', 'buy.login': 'Masuk dulu', 'buy.yours': 'Plan kamu',
      'buy.now': 'Beli sekarang', 'buy.freePrice': 'Gratis', 'buy.perMonth': '/bulan',
      'buy.featDaily': '{n} credit setiap hari', 'buy.featApis': 'Semua API', 'buy.featKeys': 'Tanpa batas key',
      'buy.qr': 'Lihat QR', 'buy.cancel': 'Batal',
      'buy.orders.pending': 'Menunggu pembayaran', 'buy.orders.paid': 'Berhasil', 'buy.orders.expired': 'Kadaluarsa',
      'buy.orders.failed': 'Gagal', 'buy.orders.cancelled': 'Dibatalkan',
      'nav.buy': 'Beli Role', 'nav.dash': 'Dashboard', 'nav.login': 'Masuk', 'nav.register': 'Daftar',
      'common.logout': 'Keluar', 'common.cancel': 'Batal',
      'dash.overview': 'Ringkasan', 'dash.keys': 'API Key', 'dash.history': 'Riwayat', 'dash.buy': 'Beli',
      'greet.morning': 'Pagi', 'greet.afternoon': 'Siang', 'greet.evening': 'Sore', 'greet.night': 'Malam',
      'ov.quota': 'Jatah hari ini {n} credit',
      'ov.addCredit': '+ Credit',
      'ov.credits': 'Sisa credit', 'ov.today': 'Hits hari ini', 'ov.total': 'Total hits', 'ov.failed': 'Request gagal',
      'ov.usage': 'Pemakaian 7 hari terakhir',
      'keys.title': 'API Key', 'keys.sub': '1 request sukses = 1 credit. Jangan share key ke siapa pun.',
      'keys.create': 'Buat key', 'keys.name': 'nama key (opsional)',
      'keys.copy': 'Salin', 'keys.copied': 'Tersalin!', 'keys.disable': 'Nonaktifkan', 'keys.enable': 'Aktifkan',
      'keys.delete': 'Hapus', 'keys.on': 'aktif', 'keys.off': 'mati',
      'keys.empty': 'Belum ada key. Buat key pertama kamu — gratis.',
      'keys.delTitle': 'Hapus API key?', 'keys.delText': 'Key ini akan dihapus permanen dan tidak bisa dipakai lagi.',
      'hist.title': 'Riwayat Pemakaian', 'hist.sub': '25 request terakhir dari semua key kamu.',
      'hist.empty': 'Belum ada pemakaian. Coba panggil API pakai key kamu.',
      'hist.ok': 'sukses', 'hist.fail': 'gagal',
      'buy.plan': 'Plan kamu', 'buy.orders': 'Pesanan Role', 'buy.note': 'Setelah kamu klik Beli sekarang, muncul QR untuk scan — bayar pakai e-wallet (GoPay, OVO, DANA, ShopeePay) atau m-banking mana aja. Role langsung aktif otomatis begitu pembayaran ke-detect. QR valid 10 menit.',
      'login.title': 'Masuk', 'login.sub': 'Lanjutkan ke dashboard kamu', 'login.email': 'Email', 'login.password': 'Password',
      'login.submit': 'Masuk', 'login.foot': 'Belum punya akun?', 'login.register': 'Daftar gratis', 'login.divider': 'atau pakai email',
      'register.title': 'Buat akun', 'register.sub': 'Nama, email, password — cukup.', 'register.name': 'Nama',
      'register.submit': 'Buat akun', 'register.foot': 'Udah punya akun?', 'register.login': 'Masuk',
      'land.kicker': 'Platform API · Gratis 1000 credit setiap hari',
      'land.h1': 'API kencang buat <span class="dim">bot &amp;</span> <span class="hl">tools kamu.</span>',
      'land.sub': 'Media downloader dulu, nanti musik sama tools gambar. Satu akun, satu key, semua API.',
      'land.cta': 'Daftar gratis', 'land.cta2': 'Cara pakai',
      'land.cara': 'Cara Pakai', 'land.carasub': 'Dari daftar sampai request pertama, gak sampai 1 menit.',
      'land.s1': 'LANGKAH 1', 'land.s1t': 'Daftar gratis', 'land.s1d': 'Langsung dapat 1000 credit. Besoknya dapat lagi 1000. Tiap hari, gak putus.',
      'land.s2': 'LANGKAH 2', 'land.s2t': 'Buat API key', 'land.s2d': 'Dari Dashboard, buat key satu klik. Bentuknya md_..., simpen baik-baik.',
      'land.s3': 'LANGKAH 3', 'land.s3t': 'Kirim request', 'land.s3d': 'Tempel key di header X-API-Key. 1 request sukses = 1 credit.',
      'stats.title': 'Statistik', 'stats.sub': 'Berapa kali bot & aplikasi nembak API tiap hari.',
      'endpoints.title': 'Semua endpoint.', 'endpoints.sub': 'Klik baris untuk menyalin path-nya.',
      'docs.title': 'Cara pakai API.', 'docs.sub': 'Dari daftar sampai request pertama, kurang dari 1 menit.',
    }
  };

  window.I18N = LANG;
  window.currentLang = function () { return localStorage.getItem('znd-lang') || 'en'; };
  window.tr = function (key) {
    const l = currentLang();
    return (LANG[l] && LANG[l][key]) || LANG.en[key] || key;
  };
  window.applyLang = function () {
    const l = currentLang();
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.innerHTML = tr(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', tr(el.dataset.i18nPh));
    });
    document.querySelectorAll('[data-i18n-lang]').forEach((el) => {
      el.textContent = l === 'en' ? 'ID' : 'EN';
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  };
  window.toggleLang = function () {
    localStorage.setItem('znd-lang', currentLang() === 'en' ? 'id' : 'en');
    applyLang();
  };
})();
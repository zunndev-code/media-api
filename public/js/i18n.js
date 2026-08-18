/* ===== Zunndev i18n — EN default, ID alternatif ===== */
(function () {
  'use strict';
  const LANG = {
    en: {
      'nav.home': 'Home',  'nav.stats': 'Stats', 'nav.endpoint': 'Endpoints', 'nav.docs': 'Docs',
      'nav.keys': 'API Keys', 'nav.hist': 'History', 'nav.lblMain': 'Menu', 'nav.lblMore': 'More',
      'dash.title': 'Dashboard', 'dash.sub': 'Your API usage at a glance',
      'buy.title': 'Credits & Roles', 'buy.sub': 'Pick a role — the higher the role, the more requests per day',
      'buy.left': 'credits left', 'buy.free': 'Free forever', 'buy.login': 'Log in first', 'buy.yours': 'Your plan',
      'buy.now': 'Buy now', 'buy.freePrice': 'Free', 'buy.perMonth': '/month',
      'buy.featDaily': '{n} credits every day', 'buy.featApis': 'All APIs', 'buy.featKeys': '{n} API keys', 'buy.pros': 'Advantages', 'buy.cons': 'Drawbacks',
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
      'faq.title': 'FAQ.', 'faq.sub': 'Frequently asked questions.', 'faq.badge': 'Support', 'faq.more': 'Still stuck? <a href="/api/docs">Read the API Guide</a> or ask via the dashboard.',
      'faq.q1': 'What is Zunndev API?', 'faq.a1': 'A media downloader API: grab video/audio from YouTube, Instagram, Facebook, TikTok and X with a single key. Each successful request costs 1 credit.',
      'faq.q2': 'How do I get an API key?', 'faq.a2': 'Create a free account, open your Dashboard, press "Create key". Keys look like md_... and are only shown once — keep them safe.',
      'faq.q3': 'How do credits work?', 'faq.a3': '1 successful request = 1 credit. Free accounts get 1000 credits daily, stacking up to 3000. Paid roles raise your daily allowance.',
      'faq.q4': 'Can I use it without a key?', 'faq.a4': 'Yes, for testing — limited to 60 requests per minute per IP and usage is not tracked. For real use, sign up and use your key.',
      'faq.q5': 'Why are the account, key & stats endpoints not published?', 'faq.a5': 'For security — account data is only accessible through the dashboard, so it cannot be reached from outside.',
      'faq.q6': 'Common errors?', 'faq.a6': '401 invalid_key wrong key · 402 insufficient_credits out of credits · 429 rate_limited too many requests · 502 scrape_failed failed to fetch from the platform.',
      'faq.q7': 'When can I pay for a role?', 'faq.a7': 'Manual payment (transfer, DANA, QRIS) is coming soon. Roles can be granted via the admin meanwhile.',
      'land.cara': 'How it works', 'land.carasub': 'From signup to your first request — under a minute.',
      'land.s1': 'STEP 1', 'land.s1t': 'Sign up free', 'land.s1d': 'Instantly get 1000 credits. Another 1000 tomorrow. Every single day.',
      'land.s2': 'STEP 2', 'land.s2t': 'Create an API key', 'land.s2d': 'One click from your dashboard. Keys look like md_... — keep them safe.',
      'land.s3': 'STEP 3', 'land.s3t': 'Send a request', 'land.s3d': 'Pass your key in the X-API-Key header. 1 successful request = 1 credit.',
      'stats.title': 'Statistics', 'stats.sub': 'How many times bots & apps hit the API every day.',
      
      'endpoints.title': 'Endpoints.', 'endpoints.sub': 'Click a row to copy its path.', 'endpoints.tip': 'All media endpoints: optional X-API-Key header. 1 successful request = 1 credit. Account, key & stats endpoints are not published here — use the dashboard.',
      'docs.title': 'API Guide.', 'docs.sub': 'From signup to your first request — under a minute.',
    },
    id: {
      'nav.home': 'Beranda',  'nav.stats': 'Stats', 'nav.endpoint': 'Endpoint', 'nav.docs': 'Docs',
      'nav.keys': 'API Key', 'nav.hist': 'Riwayat', 'nav.lblMain': 'Menu', 'nav.lblMore': 'Lainnya',
      'dash.title': 'Dashboard', 'dash.sub': 'Ringkasan pemakaian API kamu',
      'buy.title': 'Credit & Role', 'buy.sub': 'Pilih role — makin tinggi role, makin banyak request per hari',
      'buy.left': 'credit tersisa', 'buy.free': 'Gratis selamanya', 'buy.login': 'Masuk dulu', 'buy.yours': 'Plan kamu',
      'buy.now': 'Beli sekarang', 'buy.freePrice': 'Gratis', 'buy.perMonth': '/bulan',
      'buy.featDaily': '{n} credit setiap hari', 'buy.featApis': 'Semua API', 'buy.featKeys': '{n} API key', 'buy.pros': 'Kelebihan', 'buy.cons': 'Kekurangan',
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
      'faq.title': 'FAQ.', 'faq.sub': 'Pertanyaan yang paling sering ditanya.', 'faq.badge': 'Dukungan', 'faq.more': 'Masih bingung? <a href="/api/docs">Baca API Guide</a> atau tanya lewat dashboard.',
      'faq.q1': 'Apa itu Zunndev API?', 'faq.a1': 'Platform API media downloader: ambil video/audio dari YouTube, Instagram, Facebook, TikTok, dan X lewat satu key. Setiap request sukses memotong 1 credit.',
      'faq.q2': 'Gimana cara dapat API key?', 'faq.a2': 'Daftar akun gratis, masuk ke Dashboard, tekan "Buat key". Key berbentuk md_... dan hanya ditampilkan sekali — simpan baik-baik.',
      'faq.q3': 'Credit cara kerjanya?', 'faq.a3': '1 request sukses = 1 credit. Akun gratis dapat 1000 credit setiap hari, menumpuk sampai maksimal 3000. Role berbayar menaikkan jatah harian.',
      'faq.q4': 'Bisa dipakai tanpa key?', 'faq.a4': 'Bisa, buat coba-coba — dibatasi 60 request per menit per IP dan credit tidak tercatat. Untuk pemakaian serius, daftar dan pakai key kamu.',
      'faq.q5': 'Kenapa endpoint akun, key & statistik tidak dipublikasikan?', 'faq.a5': 'Demi keamanan — akses ke data akun dibatasi lewat dashboard, supaya tidak bisa diakses orang lain dari luar.',
      'faq.q6': 'Error yang sering muncul?', 'faq.a6': '401 invalid_key key salah · 402 insufficient_credits credit habis · 429 rate_limited kebanyakan request · 502 scrape_failed gagal ambil data dari platform.',
      'faq.q7': 'Bayar role kapan bisa?', 'faq.a7': 'Pembayaran manual (transfer, DANA, QRIS) segera hadir. Sementara itu role bisa didapat lewat jalur admin.',
      'land.cara': 'Cara Pakai', 'land.carasub': 'Dari daftar sampai request pertama, gak sampai 1 menit.',
      'land.s1': 'LANGKAH 1', 'land.s1t': 'Daftar gratis', 'land.s1d': 'Langsung dapat 1000 credit. Besoknya dapat lagi 1000. Tiap hari, gak putus.',
      'land.s2': 'LANGKAH 2', 'land.s2t': 'Buat API key', 'land.s2d': 'Dari Dashboard, buat key satu klik. Bentuknya md_..., simpen baik-baik.',
      'land.s3': 'LANGKAH 3', 'land.s3t': 'Kirim request', 'land.s3d': 'Tempel key di header X-API-Key. 1 request sukses = 1 credit.',
      'stats.title': 'Statistik', 'stats.sub': 'Berapa kali bot & aplikasi nembak API tiap hari.',
      
      'endpoints.title': 'Endpoint.', 'endpoints.sub': 'Klik baris untuk menyalin path-nya.', 'endpoints.tip': 'Semua endpoint media: opsional kirim header X-API-Key. 1 request sukses = 1 credit. Endpoint akun, key & statistik tidak dipublikasikan di sini — masuk lewat dashboard.',
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
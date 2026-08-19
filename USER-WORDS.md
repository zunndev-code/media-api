# Kata-kata User (catatan verbatim)

Kumpulan permintaan/ucapan user apa adanya, biar tidak hilang. Ditambah satu baris status.

## ATURAN (dari user)
- **Kalau user minta edit sesuatu, WAJIB cek SEMUA halaman** — pernah ada logo yang belum diubah di halaman lain (dashboard console & admin panel pakai ✧ lama). Selalu audit menyeluruh + deploy + verifikasi Playwright semua halaman.

1. **"eh taro data mereka itu pake di Informasi yang Kami Kumpulkan"**
   > Ketika kamu mendaftar dan menggunakan Zunndev API, kami mengumpulkan informasi berikut: Informasi Akun (Nama, email, password hash terenkripsi) · Data OAuth (ID GitHub, username, avatar, email publik terverifikasi) · Data Penggunaan (log request API: endpoint, status code, latensi, IP) · Data Pembayaran (info transaksi top-up, tidak simpan kartu)
   → Status: **DONE** (privacy policy section 1, pakai "Ziplan" bukan "Zunndev API")

2. **"endpoin nya ada ketogry ya ada dowloder dan nanti kita buat lagi oke ini sekraang kalo klik kategory dowloder bakal muncul ke bawqh list nya oke"**
   → Status: **DONE** (halaman Endpoints: kategori accordion — Downloader LIVE, Music & Lyrics / Image Tools / Text Tools SOON)

3. **"default nya jangan ke buka ding tutup aja semua"**
   → Status: **DONE** (semua kategori tertutup default)

4. **"ini base url nya ko url web ya"** — kenapa base URL pakai domain web
   → Status: **DONE** (dijawab: API & web satu server, base URL = ziplan.eu.cc)

5. **"butuh su domain api.doman ga supaya ke situ nembak nya"** — perlu subdomain api?
   → Status: **DONE** (dijawab: tidak perlu, satu domain lebih aman dari CF challenge)

6. **"gue mau ganti domain btw dan ganti nama web ini bakal vr si sorry nih lu harus edit edit lagi"**
   → Status: **DONE** (domain → ziplan.eu.cc, nama → Ziplan, semua string diganti)

7. **"ini dns apa aja tadi lupa"**
   → Status: **DONE** (dijawab: A record @ → 38.47.85.234 + Origin Rule port → 3000)

8. **"zunndev dah ga ada lagi"**
   → Status: **DONE** (domain lama mati, pindah ke ziplan.eu.cc)

9. **"Add record ziplan.eu.cc points to [IPv4 address] and has its traffic proxied through Cloudflare. A @ Proxied"**
   → Status: **DONE** (A record dibuat; IP harus 38.47.85.234)

10. **"port bukan 3000 itu ketbrak sama yang udah make"**
    → Status: **PENDING** (usulan: pindah media-api ke port 3001; belum dikerjakan)

11. **"Rules nya aoa aja yang di iss"**
    → Status: **DONE** (dijawab: cukup 1 Origin Rule rewrite port 3000)

12. **"oke itu udah ridect lu cek"**
    → Status: **DONE** (ziplan.eu.cc live, HTTP 200, origin gate diperbarui)

13. **"lajut"**
    → Status: **DONE** (domain switch + rebrand selesai, v51)

14. **"itu web di dashbord VERUS atau nama role nya sama in kotak in doang taro dan fot nya mirip kaya yang lain kotak halus nanti yang beli ga tau role merek apa"**
    → Status: **DONE** (badge role dashboard jadi pill kotak berwarna role, v52)

15. **"btw nama web ganti ke seperti nama domain ya itu ziplan doang"**
    → Status: **DONE** (rebrand semua: title, nav, footer, FAQ, privacy/terms, v53)

16. **"itu login nya logo nya ga sama"**
    → Status: **DONE** (logo login/register ikon panah lama → ganti brand mark, v54)

17. **"warna bakraunds nya apa kasi code warna nya itu di logo backraunds nya sini kasi gue"**
    → Status: **DONE** (dijawab: linear-gradient(135deg, #8b82ff → #635bff), glyph #0a0a16)

18. **"logo web ganti ke logo ini. https://postimg.cc/n9V9GWYN"**
    → Status: **DONE** (logo baru di-self-host /img/logo.png, v55; ukuran diperkecil v56: nav 24px, auth 48px)

19. **"janga asal pasang itu jadi ke gede an"**
    → Status: **DONE** (semua ukuran logo diperkecil)

20. **"halam an utama besar bet"**
    → Status: **DONE** (navbar desktop 2 baris kotak-kotak gede → 1 baris ramping 67px, v58)

21. **"di login cuma ada logo doang jangan ada nama"**
    → Status: **DONE** (login/register: hanya gambar logo, tanpa teks Ziplan, v59)

22. **"aduh lu gimana si taro kata kata gue di md ya"**
    → Status: **DONE** (file ini dibuat)

23. **"kalo gue suruh edit cek semua halam an soalnya tadi ada logo belum di ubah ke logo"**
    → Status: **DONE** (aturan permanen ditambahkan di atas; sisa logo ✧ di sidebar console & admin panel diganti gambar logo, v60)

24. **"sekarang pymen urus"** → "Paymen" = urus payment
    → Status: **DONE** (payment QRIS.PW aktif: API key+secret dipasang di .env VPS, create-order end-to-end terverifikasi — QR real, polling status jalan, admin cancel jalan; butuh webhook_secret dari dashboard qris.pw kalau mau aktivasi instan via webhook)

25. **"ini kata temen gue masi bisa pake api nya tanpa keys"** — temen user nemu API bisa dipake tanpa API key
    → Status: **DONE + ATURAN** (lubang: resolveKey() balik null kalau key kosong → semua cek rate/credit di-skip → API gratis tanpa batas. Fix: key WAJIB di semua endpoint download, error `401 missing_key`. **Aturan baru: kalau nambah endpoint API apapun, WAJIB cek dulu: tanpa key/auth masih bisa dipake nggak? Semua route download/paid WAJIB key valid + charge credit.**)

26. **Laporan temen user (jago cyber security)** — 3 temuan:
    - 🔴 "Admin bisa dicuri via register" — **sebagian valid**: ADMIN_EMAILS cuma admin@zunndev.my.id, jadi admin@email.com yang didaftarin temen (id 12) TIDAK jadi admin. TAPI pola kerentanannya bener: kalau ADMIN_EMAILS berisi email yang belum terdaftar, siapa pun bisa daftar duluan → jadi admin pas restart.
    - 🟠 Account farming: register langsung kasih 7.000 credit tanpa verifikasi email.
    - 🟠 Email oracle: 409 email_taken bikin bisa nge-enum email terdaftar.
    → Status: **DONE**: (1) sync admin jadi bootstrap-once (tabel admin_boot, intent dicatat duluan — email yang di-record nggak akan pernah di-promote lagi walau didaftar belakangan; terbukti: admin@email.com id 15 tetap is_admin=false setelah restart), (2) register dibatasi 3 akun/hari/IP (tabel reg_track; terbukti 201 201 429), (3) pesan email_taken digenerik. Akun tes temen (id 12) dihapus.
    → **ATURAN: jangan pernah taruh email yang belum terdaftar di ADMIN_EMAILS. Register tetep butuh verifikasi email beneran (butuh SMTP/API email) + Cloudflare Turnstile kalau mau — TUNDA sampai user siapin akun.**

## Catatan masih menggantung
- Port API 3000 → 3001 (klaim "ketbrak sama yang udah make") — belum dipindah
- Bullet "Data OAuth" di privacy policy: GitHub login masih "segera" (belum live)
- Klaim "All endpoints" di kartu VERUS masih belum akurat (semua role akses endpoint sama)
- Tombol "Continue with Google/GitHub" di login masih label "segera"
- QRIS_WEBHOOK_SECRET belum di-set (aktivasi instan via webhook belum bisa; polling tetap jalan)
## 27 — 19 Agu 2026 — Email verification LIVE
- Resend domain ziplan.eu.cc verified (DKIM/SPF/MX/DMARC via dns.google)
- RESEND_API_KEY set in VPS .env; lib/mail.js sendVerification (from noreply@ziplan.eu.cc, 15s timeout, errors swallowed)
- register with key present → is_verified=false, 6-digit code (crypto.randomInt), 10-min expiry, 60s resend cooldown (verification_sent_at)
- /api/verify: code match + not expired → verified=true + grantDaily on the spot
- /api/resend-code: 60s cooldown, 404 if already verified
- grantDaily skips unverified → credits 0 until verified (no farm value)
- No key in env → old behavior (auto-verified, grants immediately) — safe rollback path
- verify UI: register page swaps form → code box (#vcode/#vbtn/#vresend, #vemail-line); i18n reg.* EN+ID; {e} placeholder AVOIDED (applyLang wipes innerHTML)
- E2E verified: register → box shown, wrong code 400, right code → verified + 7000 credits granted
- Test accounts cleaned (pwverify* id 18/19)
- TODO: Cloudflare Turnstile masih pending

## 28 — 19 Agu 2026 — Demo gratis tanpa key (keputusan boss)
- missing_key sekarang = mode anonim di semua endpoint download (yt/ig/fb/tt/x/mp3/download)
- anonLimiter: 5 request/menit per IP (config.ANON_RATE_PER_MIN, .env bisa override), skip kalau ada key
- anon: tanpa charge credit, tanpa whitelist, priority 0; hits dicatat user_id NULL
- invalid_key/key_disabled TETAP error 401/403 — cuma missing_key yang jadi anon
- frontend: land.demosub/keyPh/faq.a4/docs.h7p update EN+ID; buy.featDaily pakai r.daily*7
- SEMUA teks per-hari/1000 → per-minggu/7.000 (i18n + fallback HTML + terms + register + meta)

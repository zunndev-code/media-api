# Cara Deploy API

## Opsi 1: Render (paling mudah, gratis, tanpa kartu kredit)

1. Push folder `media-api/` ke GitHub (`git init`, `git push`).
2. Daftar di https://render.com → **New → Web Service** → hubungkan repo.
3. Setting:
   - **Environment**: `Docker`
   - **Region**: pilih yang dekat
   - **Plan**: Free (spin down setelah 15 menit idle, request pertama agak lambat)
4. Klik **Create Web Service**. Selesai, dapat URL seperti `https://media-api-xxxx.onrender.com`.

## Opsi 2: Koyeb (alternatif, juga gratis)

1. Daftar di https://koyeb.com (tanpa kartu kredit).
2. **Create Service** → pilih GitHub repo → **Dockerfile** terdeteksi otomatis.
3. Deploy. Dapat URL `.koyeb.app`.

## Opsi 3: VPS sendiri (paling stabil)

```bash
docker pull <image>   # atau docker build -t media-api .
docker run -d --name media-api -p 3000:3000 --restart always media-api
```

Arahkan reverse proxy (nginx/caddy) ke port 3000 + pasang HTTPS.

## Setelah API online

1. Catat URL API, contoh: `https://media-api-xxxx.onrender.com`
2. Edit `site/app.js` di file:

```js
const API_BASE = 'https://media-api-xxxx.onrender.com';
```

3. Upload ulang `site/` ke FTP InfinityFree (`/htdocs`).

## Catatan

- Render gratis spin down 15 menit idle → user pertama yang akses nunggu ~30-60 detik.
- Kalau mau selalu aktif tanpa bayar, pakai VPS murah (2-3 USD/bulan) atau upgrade.
- API butuh yt-dlp; sudah termasuk di dalam image Docker.

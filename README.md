# Media Downloader API

API publik untuk download video/audio dari **YouTube, Instagram, Facebook, TikTok, X (Twitter)**. Dibangun dengan Node.js + Express + yt-dlp.

## Cara menjalankan

```bash
npm install
npm start
```

Butuh `yt-dlp` terinstall (`pip install yt-dlp` atau `brew install yt-dlp`).

## Endpoint

| Endpoint | Fungsi |
|---|---|
| `GET /api/download?url=...` | Download dari platform mana pun |
| `GET /api/yt?url=...` | YouTube |
| `GET /api/ig?url=...` | Instagram |
| `GET /api/fb?url=...` | Facebook |
| `GET /api/tt?url=...` | TikTok |
| `GET /api/x?url=...` | X / Twitter |
| `GET /api/mp3?url=...` | Ekstrak audio jadi MP3 |

## Contoh response

```json
{
  "status": "success",
  "title": "Rick Astley - Never Gonna Give You Up",
  "id": "dQw4w9WgXcQ",
  "platform": "Youtube",
  "thumbnail": "https://...",
  "duration": 213,
  "uploader": "Rick Astley",
  "webpage_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "formats": [
    { "height": 1080, "ext": "mp4", "url": "https://...", "filesize": 12345678 }
  ],
  "audio": [
    { "abr": 129.5, "ext": "m4a", "url": "https://..." }
  ]
}
```

Bot/web tinggal ambil `formats[0].url` (kualitas terbaik) atau `audio[0].url` untuk lagu.

## Batasan

- 20 request/menit per IP
- Hanya domain yang diizinkan (youtube, instagram, facebook, tiktok, x/twitter)
- Beberapa konten bisa gagal karena platform mewajibkan login

## Konfigurasi

| Env | Default | Fungsi |
|---|---|---|
| `PORT` | `3000` | Port server |
| `YTDLP_PATH` | `yt-dlp` | Path binary yt-dlp |
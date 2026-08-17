const { execFile } = require('child_process');

const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';

const PLATFORM_HOSTS = {
  yt: ['youtube.com', 'youtu.be', 'music.youtube.com', 'm.youtube.com'],
  ig: ['instagram.com', 'instagr.am'],
  fb: ['facebook.com', 'fb.watch', 'fb.com'],
  tt: ['tiktok.com', 'vm.tiktok.com'],
  x: ['x.com', 'twitter.com'],
};

function detectPlatform(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    for (const [key, hosts] of Object.entries(PLATFORM_HOSTS)) {
      if (hosts.some(h => host === h || host.endsWith('.' + h))) return key;
    }
  } catch {}
  return null;
}

function isAllowedHost(url) {
  return detectPlatform(url) !== null;
}

function extract(url, options = {}) {
  return new Promise((resolve, reject) => {
    const args = [
      '--dump-single-json',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '--socket-timeout', '20',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
    ];
    if (options.audioOnly) args.push('-x', '--audio-format', 'mp3');
    args.push(url);

    execFile(YTDLP, args, { maxBuffer: 32 * 1024 * 1024, timeout: 60000 }, (err, stdout, stderr) => {
      if (err) {
        const msg = String(stderr || err.message).split('\n').filter(Boolean).slice(-3).join(' ');
        return reject(new Error(msg));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (parseErr) {
        reject(new Error('Gagal memparse hasil: ' + String(stderr || parseErr.message).slice(0, 300)));
      }
    });
  });
}

function formatVideo(f) {
  return {
    quality: f.height ? f.height + 'p' : 'auto',
    ext: f.ext || null,
    url: f.url || null,
    filesize: f.filesize || f.filesize_approx || null,
    container: f.container || null,
  };
}

function pickBestVideo(info) {
  const formats = (info.formats || [])
    .filter(f => f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none' && f.url)
    .sort((a, b) => (b.height || 0) - (a.height || 0) || (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0));
  return formats.slice(0, 3).map(formatVideo);
}

function pickAudio(info) {
  const audios = (info.formats || [])
    .filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none') && f.url)
    .sort((a, b) => (b.abr || 0) - (a.abr || 0));
  return audios.slice(0, 3).map(f => ({ quality: f.abr ? f.abr.toFixed(0) + ' kbps' : 'auto', ext: f.ext || null, url: f.url || null, filesize: f.filesize || f.filesize_approx || null }));
}

function summarize(info, audioOnly = false) {
  const base = {
    id: info.id || null,
    platform: info.extractor_key || null,
    title: info.title || null,
    thumbnail: info.thumbnail || null,
    duration: info.duration || null,
    uploader: info.uploader || info.channel || null,
    webpage_url: info.webpage_url || null,
  };
  if (audioOnly) {
    base.audio = pickAudio(info);
  } else {
    base.formats = pickBestVideo(info);
    if ((info.formats || []).some(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))) {
      base.audio = pickAudio(info);
    }
  }
  return base;
}

module.exports = { extract, summarize, detectPlatform, isAllowedHost };
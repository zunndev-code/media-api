const { execFile } = require('child_process');

const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';

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

function pickBestVideo(info) {
  const formats = (info.formats || []).filter(f => f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none' && f.url);
  formats.sort((a, b) => (b.height || 0) - (a.height || 0) || (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0));
  return formats.slice(0, 3);
}

function pickAudio(info) {
  const audios = (info.formats || []).filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none') && f.url);
  audios.sort((a, b) => (b.abr || 0) - (a.abr || 0));
  return audios.slice(0, 3);
}

function summarize(info, audioOnly = false) {
  const base = {
    title: info.title,
    id: info.id,
    platform: info.extractor_key,
    thumbnail: info.thumbnail,
    duration: info.duration,
    uploader: info.uploader || info.channel || null,
    webpage_url: info.webpage_url
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

module.exports = { extract, summarize, pickBestVideo, pickAudio };
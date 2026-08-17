async function api(path, opts) {
  const res = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
  let body = null;
  try { body = await res.json(); } catch {}
  return { res, body };
}

function $(id) { return document.getElementById(id); }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtBytes(n) {
  if (!n) return '';
  const mb = n / 1024 / 1024;
  return mb > 1024 ? (mb / 1024).toFixed(1) + ' GB' : (mb >= 1 ? mb.toFixed(1) : Math.round(mb * 1024)) + (mb >= 1 ? ' MB' : ' KB');
}

function fmtTime(s) {
  if (!s) return '';
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return m + ':' + String(r).padStart(2, '0');
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function setNavAuth() {
  const wrap = $('nav-auth');
  if (!wrap) return;
  api('/api/me').then(({ res }) => {
    if (res.ok) {
      wrap.innerHTML =
        '<a href="/dashboard.html">Dashboard</a>' +
        '<a href="#" id="nav-logout" class="primary">Keluar</a>';
      $('nav-logout').addEventListener('click', async (e) => {
        e.preventDefault();
        await api('/api/logout', { method: 'POST' });
        location.reload();
      });
    } else {
      wrap.innerHTML =
        '<a href="/login.html">Masuk</a>' +
        '<a href="/register.html" class="primary">Daftar</a>';
    }
  });
}

function detectPlatform(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (/youtube\.com|youtu\.be/.test(host)) return 'yt';
    if (/instagram\.com|instagr\.am/.test(host)) return 'ig';
    if (/facebook\.com|fb\.watch/.test(host)) return 'fb';
    if (/tiktok\.com/.test(host)) return 'tt';
    if (/x\.com|twitter\.com/.test(host)) return 'x';
  } catch {}
  return 'download';
}

function initDownloader() {
  const form = $('dl-form');
  if (!form) return;
  const urlInput = $('url');
  const btnSubmit = $('btn-submit');
  const btnMp3 = $('btn-mp3');
  const btnPaste = $('btn-paste');
  const btnLabel = $('btn-label');
  const resultBox = $('result');
  const errorBox = $('error');

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) urlInput.value = text.trim();
      } catch {
        btnPaste.textContent = 'ERR';
        setTimeout(() => (btnPaste.textContent = '⧉'), 1500);
      }
    });
  }

  function render(data, audioOnly) {
    resultBox.classList.remove('hidden');
    errorBox.classList.add('hidden');
    $('thumb').src = data.thumbnail || '';
    $('title').textContent = data.title || 'Tanpa judul';
    $('meta').textContent = [data.uploader, fmtTime(data.duration), data.platform].filter(Boolean).join(' • ');
    const links = $('links');
    links.innerHTML = '';
    const items = audioOnly ? data.audio : data.formats;
    if (!items || !items.length) {
      links.innerHTML = '<p style="color:var(--muted-2);font-size:0.85rem">Tidak ada format tersedia.</p>';
      return;
    }
    items.forEach(f => {
      const a = document.createElement('a');
      a.className = 'qbtn';
      a.href = f.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML =
        '<div><div class="q">' + (audioOnly ? 'MP3' : (f.quality || 'Video')) + '</div>' +
        '<div class="s">' + [f.ext ? f.ext.toUpperCase() : '', fmtBytes(f.filesize)].filter(Boolean).join(' • ') + '</div></div>' +
        '<span class="ic">' + (audioOnly ? '♪' : '↓') + '</span>';
      links.appendChild(a);
    });
  }

  function showError(msg, neutral) {
    errorBox.classList.remove('hidden');
    resultBox.classList.add('hidden');
    errorBox.style.borderColor = neutral ? 'var(--border)' : 'rgba(255,107,107,0.4)';
    errorBox.style.color = neutral ? 'var(--muted)' : 'var(--error)';
    $('error-text').textContent = msg;
  }

  function showLoading() {
    btnSubmit.disabled = true;
    btnLabel.innerHTML = '<span class="spinner"></span>';
    showError('Memproses link, mohon tunggu beberapa detik...', true);
  }

  async function fetchAndRender(endpoint, url, audioOnly) {
    showLoading();
    try {
      const { res, body } = await api('/api/' + endpoint + '?url=' + encodeURIComponent(url));
      if (!res.ok || !body || body.status !== 'success') {
        const e = (body && body.error) || {};
        throw new Error(e.message || 'Gagal memproses link.');
      }
      render(body.data, audioOnly);
    } catch (err) {
      showError(err.message);
    } finally {
      btnSubmit.disabled = false;
      btnLabel.textContent = 'Download';
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;
    fetchAndRender(detectPlatform(url), url, false);
  });

  btnMp3.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) return;
    fetchAndRender('mp3', url, true);
  });
}

function initGlobalStats() {
  const box = $('global-stats');
  if (!box) return;
  api('/api/stats').then(({ res, body }) => {
    if (!res.ok || !body) return;
    box.innerHTML =
      '<div class="stat"><div class="num">' + fmtNum(body.data.hitsToday) + '</div><div class="lbl">Hits hari ini</div></div>' +
      '<div class="stat"><div class="num">' + fmtNum(body.data.hitsTotal) + '</div><div class="lbl">Total hits</div></div>' +
      '<div class="stat"><div class="num">' + fmtNum(body.data.users) + '</div><div class="lbl">Pengguna terdaftar</div></div>';
  });
}

function initPricing() {
  const box = $('pricing');
  if (!box) return;
  api('/api/roles').then(({ res, body }) => {
    if (!res.ok || !body) return;
    const roles = body.data;
    const order = ['free', 'vip', 'gars', 'vilions', 'verus'];
    box.innerHTML = order.map((k, i) => {
      const r = roles[k];
      if (!r) return '';
      const featured = k === 'vip' ? ' featured' : '';
      const btn = k === 'free'
        ? '<div class="buy">Gratis selamanya</div>'
        : '<div class="buy soon">Segera hadir</div>';
      return '<div class="price-card' + featured + '">' +
        '<div class="rp" style="color:' + r.color + '">' + r.label + '</div>' +
        '<div class="pr">' + (r.price ? 'Rp ' + fmtNum(r.price) : 'Gratis') + (r.price ? '<small>/bulan</small>' : '') + '</div>' +
        '<ul><li>' + fmtNum(r.daily) + ' credit setiap hari</li><li>Semua platform</li><li>Tanpa batas key</li></ul>' +
        btn + '</div>';
    }).join('');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setNavAuth();
  initDownloader();
  initGlobalStats();
  initPricing();
});

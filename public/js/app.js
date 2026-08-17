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

const NAV_LINKS = [
  { href: '/', label: 'Blog' },
  { href: '/stats.html', label: 'Stats' },
  { href: '/api/docs', label: 'API Docs' },
];

function buildNav() {
  const nav = $('nav');
  if (!nav) return;
  const linksHtml = NAV_LINKS.map(l => '<a class="drawer-link" href="' + l.href + '">' + l.label + '</a>').join('');
  nav.innerHTML =
    '<a class="logo" href="/">' +
    '<span class="mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>' +
    'Zunndev API</a>' +
    '<div class="nav-links desktop">' + linksHtml + '<span class="nav-auth" id="nav-auth"></span></div>' +
    '<button class="burger" id="burger" aria-label="Menu">☰</button>' +
    '<div class="drawer-bg" id="drawer-bg"></div>' +
    '<aside class="drawer" id="drawer">' +
    '<div class="drawer-head">' +
    '<span class="drawer-logo">' +
    '<span class="mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>' +
    'Zunndev API</span>' +
    '<button class="burger" id="drawer-close" aria-label="Tutup">✕</button>' +
    '</div>' +
    '<div class="drawer-body">' +
    '<p class="drawer-label">Menu</p>' +
    '<div class="drawer-links">' + linksHtml + '</div>' +
    '<p class="drawer-label">Akun</p>' +
    '<div class="drawer-auth" id="nav-auth-m"></div>' +
    '</div>' +
    '<div class="drawer-foot">Zunndev API v3.0</div>' +
    '</aside>';

  const burger = $('burger');
  const close = $('drawer-close');
  const drawer = $('drawer');
  const bg = $('drawer-bg');
  const open = () => { drawer.classList.add('open'); bg.classList.add('show'); document.body.style.overflow = 'hidden'; };
  const shut = () => { drawer.classList.remove('open'); bg.classList.remove('show'); document.body.style.overflow = ''; };
  burger.addEventListener('click', open);
  close.addEventListener('click', shut);
  bg.addEventListener('click', shut);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
}

function setNavAuth() {
  api('/api/me').then(({ res }) => {
    const fill = (uid) => {
      const elm = $(uid);
      if (!elm) return;
      if (res.ok) {
        elm.innerHTML =
          '<a href="/dashboard.html" class="primary">Dashboard</a>' +
          '<a href="#" data-logout="1">Keluar</a>';
        elm.querySelector('[data-logout]').addEventListener('click', async (e) => {
          e.preventDefault();
          await api('/api/logout', { method: 'POST' });
          location.reload();
        });
      } else {
        elm.innerHTML =
          '<a href="/login.html">Masuk</a>' +
          '<a href="/register.html" class="primary">Daftar</a>';
      }
    };
    fill('nav-auth');
    fill('nav-auth-m');
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
      const btn = k === 'free'
        ? '<div class="buy">Gratis selamanya</div>'
        : '<div class="buy soon">Segera hadir</div>';
      return '<div class="price-card">' +
        '<div class="rp" style="color:' + r.color + '">' + r.label + '</div>' +
        '<div class="pr">' + (r.price ? 'Rp ' + fmtNum(r.price) : 'Gratis') + (r.price ? '<small>/bulan</small>' : '') + '</div>' +
        '<ul><li>' + fmtNum(r.daily) + ' credit setiap hari</li><li>Semua API</li><li>Tanpa batas key</li></ul>' +
        btn + '</div>';
    }).join('');
  });
}

function initApiList() {
  const box = $('api-list');
  if (!box) return;
  api('/api/apis').then(({ res, body }) => {
    if (!res.ok || !body) return;
    box.innerHTML = body.data.map(a =>
      '<div class="api-card' + (a.status === 'soon' ? ' soon' : '') + '">' +
      '<div class="api-head"><span class="api-name">' + esc(a.name) + '</span>' +
      '<span class="api-status ' + (a.status === 'live' ? 'live' : 'soon') + '">' + (a.status === 'live' ? 'LIVE' : 'SEGERA') + '</span></div>' +
      '<p class="api-desc">' + esc(a.desc) + '</p>' +
      '</div>'
    ).join('');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  setNavAuth();
  initDownloader();
  initGlobalStats();
  initPricing();
  initApiList();
});

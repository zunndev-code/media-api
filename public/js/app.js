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
  { href: '/', label: 'nav.home', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
  { href: '/beli', label: 'nav.buy', icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/>' },
  { href: '/stats', label: 'nav.stats', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { href: '/endpoints', label: 'nav.endpoint', icon: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>' },
  { href: '/api/docs', label: 'nav.docs', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
];

function navLink(l, cls) {
  const active = l.href === '/' ? location.pathname === '/' : location.pathname.startsWith(l.href);
  return '<a class="' + (cls || 'drawer-link') + (active ? ' active' : '') + '" href="' + l.href + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + l.icon + '</svg>' +
    '<span data-i18n="' + l.label + '">' + tr(l.label) + '</span></a>';
}

const LOGO_MARK = '<img class="logo-img" src="/img/logo.png?v=83" alt="Ziplan">';

function buildNav() {
  const nav = $('nav');
  if (!nav) return;
  const linksHtml = NAV_LINKS.map((l) => navLink(l, 'nav-item')).join('');
  const onLanding = location.pathname === '/';
  const drawerHtml = onLanding ? '' :
    '<button class="burger" id="burger" aria-label="Menu">☰</button>' +
    '<div class="drawer-bg" id="drawer-bg"></div>' +
    '<aside class="drawer" id="drawer">' +
    '<div class="drawer-head">' +
    '<span class="drawer-logo">' +
    LOGO_MARK +
    'Ziplan</span>' +
    '<button class="burger" id="drawer-close" aria-label="Close">✕</button>' +
    '</div>' +
    '<div class="drawer-body">' +
    '<p class="drawer-label">Menu</p>' +
    '<div class="drawer-links">' + linksHtml + '</div>' +
    '<p class="drawer-label">Akun</p>' +
    '<div class="drawer-auth" id="nav-auth-m"></div>' +
    '</div>' +
    '<div class="drawer-foot">Ziplan v39</div>' +
    '</aside>';
  nav.innerHTML =
    '<a class="logo" href="/">' +
    LOGO_MARK +
    'Ziplan</a>' +
    '<div class="nav-links desktop">' + linksHtml + '<span class="nav-auth" id="nav-auth"></span></div>' +
    '<div class="nav-legals"><a href="/privacy" data-i18n="nav.privacy">' + tr('nav.privacy') + '</a>' +
    '<a href="/terms" data-i18n="nav.terms">' + tr('nav.terms') + '</a></div>' +
    drawerHtml;

  const langBtn = document.createElement('button');
  langBtn.className = 'langbtn nav-lang';
  langBtn.dataset.i18nLang = '1';
  langBtn.textContent = currentLang() === 'en' ? 'ID' : 'EN';
  langBtn.addEventListener('click', () => { toggleLang(); });
  nav.appendChild(langBtn);

  if (onLanding) return;

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

function buildFooter() {
  const f = document.querySelector('footer');
  if (!f) return;
  f.innerHTML =
    '<div class="foot-grid">' +
    '<div class="foot-brand">' +
    '<a class="logo" href="/">' +
    LOGO_MARK +
    'Ziplan</a>' +
    '<p>' + tr('foot.brand') + '</p>' +
    '</div>' +
    '<div><h4>' + tr('foot.menu') + '</h4><a href="/">' + tr('foot.blog') + '</a><a href="/endpoints">' + tr('foot.ep') + '</a><a href="/#faq">' + tr('foot.faq') + '</a><a href="/stats">' + tr('foot.stats') + '</a><a href="/api/docs">' + tr('foot.docs') + '</a></div>' +
    '<div><h4>' + tr('foot.acc') + '</h4><a href="/login">' + tr('foot.login') + '</a><a href="/register">' + tr('foot.register') + '</a><a href="/dashboard">' + tr('foot.dash') + '</a><a href="/beli">' + tr('foot.buy') + '</a></div>' +
    '<div><h4>' + tr('foot.svc') + '</h4><a href="/#demo">' + tr('foot.media') + '</a><a href="/#harga">' + tr('foot.price') + '</a><a href="/beli">' + tr('foot.upgrade') + '</a><a href="/api/docs">' + tr('foot.howto') + '</a></div>' +
    '</div>' +
    '<div class="foot-bottom">' +
    '<span>&copy; ' + new Date().getFullYear() + ' Ziplan</span>' +
    '<span class="foot-legals"><a href="/privacy" data-i18n="nav.privacy">' + tr('nav.privacy') + '</a>' +
    '<a href="/terms" data-i18n="nav.terms">' + tr('nav.terms') + '</a></span>' +
    '</div>';
}

const APP_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>' },
  { href: '/beli', label: 'Beli Role', icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/>' },
  { href: '/stats', label: 'nav.stats', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { href: '/endpoints', label: 'nav.endpoint', icon: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>' },
  { href: '/api/docs', label: 'nav.docs', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
];

function buildAppShell() {
  const shell = document.querySelector('.app');
  if (!shell || shell.dataset.built) return;
  shell.dataset.built = '1';
  const title = shell.dataset.title || 'Dashboard';
  const page = location.pathname;
  const content = shell.querySelector('.app-content');
  shell.innerHTML =
    '<header class="app-top">' +
    '<button class="app-burger" id="app-burger" aria-label="Menu">☰</button>' +
    '<a class="logo" href="/dashboard">' + LOGO_MARK + 'Ziplan</a>' +
    '<span class="app-top-title">' + esc(title) + '</span>' +
    '<div class="app-top-right">' +
    '<a class="cred-chip" id="cred-chip" href="/beli"><span class="zglyph">✧</span> <span>—</span></a>' +
    '<button class="theme-btn" id="theme-btn" aria-label="Ganti tema"></button>' +
    '<div class="user-chip" id="user-chip"><span class="ava">—</span><span class="nm">—</span><span class="caret">▾</span>' +
    '<div class="user-menu" id="user-menu">' +
    '<a href="/dashboard">Dashboard</a>' +
    '<a href="/beli">Beli Role</a>' +
    '<div class="sep"></div>' +
    '<button class="danger" data-logout="1">Keluar</button>' +
    '<p style="font-size:0.62rem;color:var(--muted-2);margin:0.4rem 0.7rem 0.2rem">Ziplan · v30</p>' +
    '</div></div>' +
    '</div></header>' +
    '<div class="app-body">' +
    '<aside class="app-side" id="app-side">' +
    '<p class="side-label">Menu</p>' +
    APP_LINKS.map((l) =>
      '<a class="side-link' + (page.startsWith(l.href) ? ' active' : '') + '" href="' + l.href + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + l.icon + '</svg>' +
      l.label + '</a>'
    ).join('') +
    '<div class="side-foot">© ' + new Date().getFullYear() + ' Ziplan<br>v28</div>' +
    '</aside>' +
    '<main class="app-main"></main>' +
    '</div>' +
    '<nav class="app-nav-bottom" id="app-nav-bottom">' +
    APP_LINKS.map((l) =>
      '<a class="navb' + (page.startsWith(l.href) ? ' active' : '') + '" href="' + l.href + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + l.icon + '</svg>' +
      l.label + '</a>'
    ).join('') +
    '</nav>';

  const savedTheme = localStorage.getItem('znd-theme');
  if (savedTheme === 'lite') document.body.classList.add('lite');
  const themeBtn = $('theme-btn');
  themeBtn.innerHTML = savedTheme === 'lite'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  themeBtn.addEventListener('click', () => {
    const lite = document.body.classList.toggle('lite');
    localStorage.setItem('znd-theme', lite ? 'lite' : 'dark');
    themeBtn.innerHTML = lite ? themeBtn.innerHTML.replace('circle', 'path') : themeBtn.innerHTML;
    themeBtn.innerHTML = lite
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  });

  const burger = $('app-burger');
  const side = $('app-side');
  burger.addEventListener('click', () => side.classList.toggle('open'));
  document.querySelectorAll('.app-main a').forEach(() => {});
  side.addEventListener('click', (e) => {
    if (e.target.closest('a')) side.classList.remove('open');
  });

  const chipEl = $('user-chip');
  chipEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-logout]')) return;
    e.stopPropagation();
    $('user-menu').classList.toggle('open');
  });
  document.addEventListener('click', () => $('user-menu').classList.remove('open'));

  $('user-menu').querySelector('[data-logout]').addEventListener('click', async () => {
    await api('/api/logout', { method: 'POST' });
    location.href = '/';
  });

  api('/api/me').then(({ res, body }) => {
    if (!res.ok || !body || body.status !== 'success') return;
    const u = body.data.user;
    const ava = $('user-chip').querySelector('.ava');
    const nm = $('user-chip').querySelector('.nm');
    ava.textContent = (u.name || '?').charAt(0).toUpperCase();
    nm.textContent = u.name;
    $('cred-chip').innerHTML = '<span class="zglyph">✧</span> <span>' + fmtNum(u.credits) + '</span>';
    $('cred-chip').title = 'Sisa credit — klik buat top-up';
  });

  const main = shell.querySelector('.app-main');
  if (content) main.appendChild(content);
}

function setNavAuth() {
  api('/api/me').then(({ res, body }) => {
    const fill = (uid) => {
      const elm = $(uid);
      if (!elm) return;
      if (res.ok) {
        elm.innerHTML =
          '<a href="/dashboard" class="primary">Dashboard</a>' +
          '<a href="#" data-logout="1">' + tr('nav.logout') + '</a>';
        elm.querySelector('[data-logout]').addEventListener('click', async (e) => {
          e.preventDefault();
          await api('/api/logout', { method: 'POST' });
          location.reload();
        });
      } else {
        elm.innerHTML =
          '<a href="/login">' + tr('nav.login') + '</a>' +
          '<a href="/register" class="primary">' + tr('nav.reg') + '</a>';
      }
    };
    fill('nav-auth');
    fill('nav-auth-m');
    if (res.ok && body.data && body.data.name) welcomeToast(body.data.name);
  });
}

function welcomeToast(name) {
  if (sessionStorage.getItem('zd_welcomed')) return;
  sessionStorage.setItem('zd_welcomed', '1');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML =
    '<span class="toast-ava">' + esc(name.charAt(0).toUpperCase()) + '</span>' +
    '<span class="toast-txt"><b>Masuk sebagai ' + esc(name) + '</b><br>Akun kamu tetap aktif, nggak perlu login ulang.</span>' +
    '<button class="toast-x" aria-label="Close">✕</button>';
  document.body.appendChild(t);
  const hide = () => { t.classList.add('out'); setTimeout(() => t.remove(), 350); };
  t.querySelector('.toast-x').addEventListener('click', hide);
  setTimeout(hide, 4500);
}

function toastMsg(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<span class="toast-txt"><b>' + esc(msg) + '</b></span>';
  document.body.appendChild(t);
  const hide = () => { t.classList.add('out'); setTimeout(() => t.remove(), 350); };
  setTimeout(hide, 3200);
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
    showError(tr('land.proc'), true);
  }

  async function fetchAndRender(endpoint, url, audioOnly) {
    showLoading();
    try {
      const headers = {};
      const keyEl = $('key');
      if (keyEl && keyEl.value.trim()) headers['X-API-Key'] = keyEl.value.trim();
      const { res, body } = await api('/api/' + endpoint + '?url=' + encodeURIComponent(url), { headers });
      if (!res.ok || !body || body.status !== 'success') {
        const e = (body && body.error) || {};
        throw new Error(e.message || tr('land.err'));
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

function initCTA() {
  const cta = $('cta-main');
  if (!cta) return;
  api('/api/me').then(({ res }) => {
    if (res.ok) {
      cta.href = '/dashboard';
      cta.textContent = 'Ke Dashboard';
    }
  });
}

function initGlobalStats() {
  const box = $('global-stats');
  if (!box) return;
  api('/api/stats').then(({ res, body }) => {
    if (!res.ok || !body) return;
    box.innerHTML =
      '<div class="stat"><div class="num">' + fmtNum(body.data.hitsToday) + '</div><div class="lbl">' + tr('land.sh1') + '</div></div>' +
      '<div class="stat"><div class="num">' + fmtNum(body.data.hitsTotal) + '</div><div class="lbl">' + tr('land.sh2') + '</div></div>' +
      '<div class="stat"><div class="num">' + fmtNum(body.data.users) + '</div><div class="lbl">' + tr('land.sh3') + '</div></div>';
  });
}

const PAY_STATUS = {
  pending: () => tr('buy.orders.pending'),
  paid: () => tr('buy.orders.paid'),
  expired: () => tr('buy.orders.expired'),
  failed: () => tr('buy.orders.failed'),
  cancelled: () => tr('buy.orders.cancelled'),
};

function payStatusClass(s) {
  return { pending: 'pend', paid: 'ok', expired: 'bad', failed: 'bad', cancelled: 'mute' }[s] || 'mute';
}

function payStatusBadge(s) {
  return '<span class="pay-badge ' + payStatusClass(s) + '">' + (PAY_STATUS[s] ? PAY_STATUS[s]() : s) + '</span>';
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function openPayModal(order, opts) {
  opts = opts || {};
  const bg = document.createElement('div');
  bg.className = 'modal-bg show';
  bg.innerHTML = '<div class="modal pay-modal"><div id="pay-body"></div></div>';
  document.body.appendChild(bg);
  let stopped = false;
  let timer = null;
  const close = () => {
    stopped = true;
    clearInterval(timer);
    bg.remove();
  };
  bg.addEventListener('click', (e) => { if (e.target === bg && !bg.querySelector('.pay-hold')) close(); });

  function render(state) {
    const body = bg.querySelector('#pay-body');
    if (state === 'create') {
      body.innerHTML =
        '<h3>' + tr('buy.modal.create') + '</h3>' +
        '<p>' + tr('buy.modal.creating').replace('{role}', esc((order.roleInfo && order.roleInfo.label) || order.role)) + '</p>' +
        '<div class="modal-actions"><button class="modal-btn" id="pay-close">' + tr('buy.modal.close') + '</button></div>';
    } else if (state === 'qr') {
      body.innerHTML =
        '<h3>' + tr('buy.modal.scan') + '</h3>' +
        '<div class="pay-amount"><b>Rp ' + fmtNum(order.amount) + '</b>' +
        '<span>' + esc((order.roleInfo && order.roleInfo.label) || order.role) + '</span></div>' +
        '<img class="pay-qr" src="' + esc(order.qrisUrl) + '" alt="QRIS">' +
        '<p class="pay-hint">' + tr('buy.modal.hint') + '</p>' +
        '<p class="pay-cd">' + tr('buy.modal.valid') + ' <b id="pay-count">--:--</b> · ' + tr('buy.modal.status') + ' <b>' + tr('buy.modal.wait') + '</b></p>' +
        '<div class="modal-actions"><button class="modal-btn danger" id="pay-cancel">' + tr('buy.modal.cancel') + '</button>' +
        '<button class="modal-btn" id="pay-close">' + tr('buy.modal.close') + '</button></div>';
      bg.querySelector('#pay-close').addEventListener('click', close);
      bg.querySelector('#pay-cancel').addEventListener('click', async () => {
        const { res, body: b } = await api('/api/orders/' + order.id + '/cancel', { method: 'POST' });
        if (res.ok) { close(); opts.onChange && opts.onChange(); }
        else if (b && b.error) toastMsg(b.error.message);
      });
    } else if (state === 'paid') {
      body.innerHTML =
        '<h3>' + tr('buy.modal.paid') + '</h3>' +
        '<p>' + tr('buy.modal.paidsub').replace('{role}', esc((order.roleInfo && order.roleInfo.label) || order.role)) + '</p>' +
        '<div class="modal-actions"><button class="modal-btn primary" id="pay-close">' + tr('buy.modal.nice') + '</button></div>';
      bg.querySelector('#pay-close').addEventListener('click', close);
    } else if (state === 'expired') {
      body.innerHTML =
        '<h3>' + tr('buy.modal.expired') + '</h3>' +
        '<p>' + tr('buy.modal.expiredsub').replace('{role}', esc((order.roleInfo && order.roleInfo.label) || order.role)) + '</p>' +
        '<div class="modal-actions"><button class="modal-btn" id="pay-close">' + tr('buy.modal.later') + '</button>' +
        '<button class="modal-btn primary" id="pay-retry">' + tr('buy.modal.retry') + '</button></div>';
      bg.querySelector('#pay-close').addEventListener('click', close);
      bg.querySelector('#pay-retry').addEventListener('click', () => createOrder(order.role));
    } else if (state === 'disabled') {
      body.innerHTML =
        '<h3>' + tr('buy.modal.disabled') + '</h3>' +
        '<p>' + esc(order.errMsg || tr('buy.modal.disabledsub')) + '</p>' +
        '<div class="modal-actions"><button class="modal-btn" id="pay-close">' + tr('buy.modal.close') + '</button></div>';
      bg.querySelector('#pay-close').addEventListener('click', close);
    } else if (state === 'fail') {
      body.innerHTML =
        '<h3>' + tr('buy.modal.fail') + '</h3>' +
        '<p>' + esc(order.errMsg || tr('buy.modal.failsub')) + '</p>' +
        '<div class="modal-actions"><button class="modal-btn" id="pay-close">' + tr('buy.modal.close') + '</button></div>';
      bg.querySelector('#pay-close').addEventListener('click', close);
    }
  }

  function tick(orderData) {
    const elm = bg.querySelector('#pay-count');
    if (!elm || !orderData.expiresAt) return;
    const left = new Date(orderData.expiresAt).getTime() - Date.now();
    elm.textContent = formatCountdown(left);
    if (left <= 0 && !stopped) {
      clearInterval(timer);
      render('expired');
    }
  }

  function poll() {
    api('/api/orders/' + order.id).then(({ res, body }) => {
      if (stopped) return;
      if (!res.ok || !body || body.status !== 'success') return;
      const o = body.data;
      order.status = o.status;
      order.expiresAt = o.expiresAt;
      if (o.status === 'paid') {
        clearInterval(timer);
        render('paid');
        opts.onPaid && opts.onPaid(o);
        opts.onChange && opts.onChange();
      } else if (['expired', 'failed', 'cancelled'].includes(o.status)) {
        clearInterval(timer);
        render('expired');
        opts.onChange && opts.onChange();
      } else {
        tick(o);
      }
    });
  }

  function createOrder(role) {
    render('create');
    api('/api/orders', { method: 'POST', body: JSON.stringify({ role: role }) }).then(({ res, body }) => {
      if (stopped) return;
      if (!res.ok || !body || body.status !== 'success') {
        const e = (body && body.error) || {};
        order.errMsg = e.message || 'Coba lagi ya.';
        render(e.code === 'payment_disabled' ? 'disabled' : 'fail');
        return;
      }
      order.id = body.data.id;
      order.qrisUrl = body.data.qrisUrl;
      order.expiresAt = body.data.expiresAt;
      render('qr');
      tick(order);
      clearInterval(timer);
      timer = setInterval(poll, 5000);
    });
  }

  if (order.id && order.qrisUrl && order.status === 'pending') {
    render('qr');
    tick(order);
    clearInterval(timer);
    timer = setInterval(poll, 5000);
  } else {
    createOrder(order.role);
  }
}

function roleSpecs(r) {
  if (!r || !r.pros) return '';
  const l = currentLang();
  const pros = (r.pros && r.pros[l]) ? r.pros[l] : [];
  const cons = (r.cons && r.cons[l]) ? r.cons[l] : [];
  return '<div class="specs">' +
    '<p class="spec-h">' + tr('buy.pros') + '</p>' +
    '<ul class="pros">' + pros.map((p) => '<li>' + esc(p) + '</li>').join('') + '</ul>' +
    (cons.length ? '<p class="spec-h">' + tr('buy.cons') + '</p><ul class="cons">' + cons.map((c) => '<li>' + esc(c) + '</li>').join('') + '</ul>' : '') +
    '</div>';
}

function initBuy() {
  const box = $('pricing');
  if (!box) return;
  const order = ['free', 'vip', 'gars', 'vilions', 'verus'];
  api('/api/roles').then(async ({ res, body }) => {
    if (!res.ok || !body) return;
    const roles = body.data;
    const meReq = await api('/api/me');
    const me = meReq.res.ok ? meReq.body.data : null;
    const cur = $('cur-plan');
    if (cur && me) {
      cur.style.display = 'flex';
      $('cur-name').textContent = roles[me.role] ? roles[me.role].label : me.role;
      $('cur-cred').textContent = fmtNum(me.credits) + ' ' + tr('buy.left');
    }
    box.innerHTML = order.map((k) => {
      const r = roles[k];
      if (!r) return '';
      const isCurrent = me && me.role === k;
      let btn;
      if (k === 'free') btn = '<div class="buy">' + tr('buy.free') + '</div>';
      else if (!me) btn = '<a class="buy soon" href="/login">' + tr('buy.login') + '</a>';
      else if (isCurrent) btn = '<div class="buy">' + tr('buy.yours') + '</div>';
      else btn = '<button class="buy" data-buy="' + k + '">' + tr('buy.now') + '</button>';
      return '<div class="price-card' + (isCurrent ? ' current' : '') + '" style="--role-color:' + r.color + '">' +
        '<div class="rp" style="color:' + r.color + '">' + r.label + '</div>' +
        '<div class="pr">' + (r.price ? 'Rp ' + fmtNum(r.price) : tr('buy.freePrice')) + (r.price ? '<small>' + tr('buy.perMonth') + '</small>' : '') + '</div>' +
        '<ul><li>' + tr('buy.featDaily').replace('{n}', fmtNum(r.daily)) + '</li><li>' + tr('buy.featApis') + '</li><li>' + tr('buy.featKeys').replace('{n}', r.keys) + '</li></ul>' +
        roleSpecs(r) +
        (isCurrent ? '<div class="now-badge">' + tr('buy.yours') + '</div>' : '') +
        btn + '</div>';
    }).join('');
    box.querySelectorAll('[data-buy]').forEach((b) => {
      b.addEventListener('click', () => {
        const role = b.dataset.buy;
        openPayModal({ role: role, roleInfo: roles[role], amount: roles[role].price }, {
          onPaid: () => { location.reload(); },
        });
      });
    });
  });
}

function initOrders() {
  const box = $('orders-list');
  if (!box) return;
  api('/api/orders').then(async ({ res, body }) => {
    const wrap = $('orders-wrap');
    if (!res.ok || !body || body.status !== 'success') {
      if (wrap) wrap.style.display = 'none';
      return;
    }
    const list = body.data;
    const rolesReq = await api('/api/roles');
    const roles = rolesReq.res.ok ? rolesReq.body.data : {};
    if (!list.length) {
      if (wrap) wrap.style.display = 'none';
      return;
    }
    box.innerHTML = list.map((o) =>
      '<div class="order-row">' +
      '<div class="order-main"><span class="order-role" style="color:' + ((roles[o.role] && roles[o.role].color) || 'var(--text)') + '">' + esc((roles[o.role] && roles[o.role].label) || o.role) + '</span>' +
      '<span class="order-meta">Rp ' + fmtNum(o.amount) + ' · ' + fmtDate(o.createdAt) + '</span></div>' +
      payStatusBadge(o.status) +
      (o.status === 'pending'
        ? '<button class="order-btn" data-view="' + o.id + '">' + tr('buy.qr') + '</button><button class="order-btn ghost" data-cancel="' + o.id + '">' + tr('buy.cancel') + '</button>'
        : '') +
      '</div>'
    ).join('');
    box.querySelectorAll('[data-view]').forEach((b) => {
      b.addEventListener('click', () => {
        const o = list.find((x) => x.id === Number(b.dataset.view));
        if (!o) return;
        openPayModal(Object.assign({}, o, { roleInfo: roles[o.role] }), { onChange: initOrders });
      });
    });
    box.querySelectorAll('[data-cancel]').forEach((b) => {
      b.addEventListener('click', async () => {
        await api('/api/orders/' + b.dataset.cancel + '/cancel', { method: 'POST' });
        initOrders();
      });
    });
  });
}

function initApiList() {
  const box = $('api-list');
  if (!box) return;
  api('/api/apis').then(({ res, body }) => {
    if (!res.ok || !body) return;
    box.innerHTML = body.data.map(a => {
      const l = currentLang();
      const name = (a.name && a.name[l]) ? a.name[l] : a.name;
      const desc = (a.desc && a.desc[l]) ? a.desc[l] : a.desc;
      return '<div class="api-card' + (a.status === 'soon' ? ' soon' : '') + '">' +
      '<div class="api-head"><span class="api-name">' + esc(name) + '</span>' +
      '<span class="api-status ' + (a.status === 'live' ? 'live' : 'soon') + '">' + tr(a.status === 'live' ? 'api.live' : 'api.soon') + '</span></div>' +
      '<p class="api-desc">' + esc(desc) + '</p>' +
      '</div>';
    }).join('');
  });
}


function applyTheme() {
  const lite = localStorage.getItem('znd-theme') === 'lite';
  document.body.classList.toggle('lite', lite);
}
function toggleTheme() {
  localStorage.setItem('znd-theme', document.body.classList.contains('lite') ? 'dark' : 'lite');
  applyTheme();
}
function initFAQ() {
  const faq = document.querySelector('#faq');
  if (!faq) return;
  const items = faq.querySelectorAll('.faq-item');
  items.forEach((it, i) => {
    it.style.transitionDelay = (0.06 * i) + 's';
    it.classList.add('pre');
  });
  if (!('IntersectionObserver' in window)) {
    items.forEach((it) => it.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((it) => io.observe(it));
}
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.app')) {
    buildAppShell();
  } else {
    buildNav();
    buildFooter();
    initFAQ();
  }
  setNavAuth();
  initDownloader();
  initGlobalStats();
  initBuy();
  initOrders();
  initApiList();
  initCTA();

  document.addEventListener('langchange', () => {
    initBuy();
    initApiList();
    initGlobalStats();
    buildFooter();
  });
});

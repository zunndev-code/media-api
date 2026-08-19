/* Ziplan Console v36 — sidebar kiri, halaman terpisah, i18n */
(() => {
  'use strict';
  if (!document.body.classList.contains('console')) return;

  const PAGE = location.pathname.replace(/\/$/, '') || '/';

  const TITLES = {
    '/dashboard': ['dash.title', 'dash.sub'],
    '/keys': ['keys.title', 'keys.sub'],
    '/history': ['hist.title', 'hist.sub'],
    '/beli': ['buy.title', 'buy.sub'],
    '/stats': ['stats.title', 'stats.sub'],
    '/endpoints': ['endpoints.title', 'endpoints.sub'],
    '/api/docs': ['docs.title', 'docs.sub'],
  };
  const PRIVATE = ['/dashboard', '/keys', '/history', '/beli'];

  const NAV_PRIMARY = [
    { href: '/dashboard', key: 'nav.dash', icon: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>' },
    { href: '/keys', key: 'nav.keys', icon: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>' },
    { href: '/history', key: 'nav.hist', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
    { href: '/beli', key: 'nav.buy', icon: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' },
  ];

  const NAV_SECONDARY = [
    { href: '/stats', key: 'nav.stats', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { href: '/endpoints', key: 'nav.endpoint', icon: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>' },
    { href: '/api/docs', key: 'nav.docs', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
  ];

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }
  function navItem(l) {
    const active = l.href === '/' ? PAGE === '/' : (PAGE === l.href);
    return '<a class="side-link' + (active ? ' active' : '') + '" href="' + l.href + '">' + svg(l.icon) +
      '<span data-i18n="' + l.key + '">' + tr(l.key) + '</span></a>';
  }

  function buildShell() {
    const pageEl = document.getElementById('page');
    if (!pageEl) return;

    const title = TITLES[PAGE] || ['nav.dash', ''];
    const t = TITLES[PAGE] ? tr(title[0]) : 'Ziplan';

    const shell = document.createElement('div');
    shell.innerHTML =
      '<aside class="side">' +
      '<div class="side-top"><a class="logo" href="/dashboard">' +
      '<img class="logo-img" src="/img/logo.png?v=60" alt="Ziplan">' +
      '<span>Ziplan</span></a><span class="ver-chip">v36</span></div>' +
      '<nav class="side-nav">' +
      '<p class="nav-lbl" data-i18n="nav.lblMain">Menu</p>' +
      NAV_PRIMARY.map(navItem).join('') +
      '<p class="nav-lbl" data-i18n="nav.lblMore">Lainnya</p>' +
      NAV_SECONDARY.map(navItem).join('') +
      '</nav>' +
      '<div class="side-foot">' +
      '<div class="user-card">' +
      '<span class="avatar" id="avatar">-</span>' +
      '<div class="uinfo"><div class="unm" id="u-name">-</div><div class="uem" id="u-email">-</div></div>' +
      '<button id="logout" aria-label="Logout">' + svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>') + '</button>' +
      '</div>' +
      '<div class="side-tools">' +
      '<button class="tbtn" id="tbtn" aria-label="Theme">' + svg('<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>') + '</button>' +
      '<button class="langbtn" id="langbtn" data-i18n-lang="1">' + (currentLang() === 'en' ? 'ID' : 'EN') + '</button>' +
      '</div></div></aside>' +
      '<div id="ovl"></div>' +
      '<div class="main">' +
      '<header class="topbar">' +
      '<button class="burger" id="burger" aria-label="Menu">' + svg('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>') + '</button>' +
      '<div><h1 id="p-title">' + t + '</h1><p class="tsub" id="p-sub">' + (TITLES[PAGE] ? tr(title[1]) : '') + '</p></div>' +
      '<div class="tr">' +
      '<a class="cred" href="/beli"><span class="zglyph">✧</span><span id="cred-n">-</span></a>' +
      '</div>' +
      '</header>' +
      '</div>';

    document.body.insertBefore(shell, pageEl);
    document.querySelector('.main').appendChild(pageEl);

    const burger = document.getElementById('burger');
    const side = document.querySelector('.side');
    const ovl = document.getElementById('ovl');
    const open = () => { side.classList.add('open'); ovl.classList.add('show'); };
    const shut = () => { side.classList.remove('open'); ovl.classList.remove('show'); };
    burger.addEventListener('click', open);
    ovl.addEventListener('click', shut);
    document.querySelectorAll('.side-link').forEach((l) => l.addEventListener('click', shut));

    document.getElementById('tbtn').addEventListener('click', toggleTheme);
    document.getElementById('langbtn').addEventListener('click', toggleLang);
    document.getElementById('logout').addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST' });
      location.href = '/login';
    });
  }

  function setUser(u) {
    if (!u) {
      document.getElementById('u-name').textContent = tr('nav.login');
      document.getElementById('u-email').textContent = tr('nav.register');
      document.getElementById('avatar').textContent = '✧';
      const cred = document.getElementById('cred-n');
      if (cred) cred.textContent = tr('nav.register');
      return;
    }
    document.getElementById('u-name').textContent = u.name;
    document.getElementById('u-email').textContent = u.email;
    document.getElementById('avatar').textContent = (u.name || 'U').slice(0, 1).toUpperCase();
    const cred = document.getElementById('cred-n');
    if (cred) {
      cred.textContent = fmtNum(u.credits) + ' · ' + (tr('ov.credits').split(' ')[0] || 'credits');
    }
  }

  /* ===== API helper ===== */
  async function loadMe() {
    const { res, body } = await api('/api/dashboard');
    if (!res.ok) {
      if (PRIVATE.includes(PAGE)) { location.href = '/login'; return null; }
      setUser(null);
      return null;
    }
    setUser(body.data.user);
    return body.data.user;
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return iso || ''; }
  }

  /* ===== Overview ===== */
  async function loadOverview() {
    const { res, body } = await api('/api/dashboard');
    if (!res.ok) return;
    const d = body.data;
    const r = d.roleInfo || {};
    const un = document.getElementById('un'); if (un) un.textContent = d.user.name;
    const gw = document.getElementById('greet-w'); if (gw) gw.textContent = greetWord();
    const em = document.getElementById('email'); if (em) em.textContent = d.user.email;
    const ur = document.getElementById('urole');
    if (ur) ur.innerHTML = '<span style="color:' + (r.color || '#6d5dfc') + '">' + esc(r.label || d.user.role) + '</span>';
    const q = document.getElementById('quota');
    if (q) q.textContent = tr('ov.quota').replace('{n}', fmtNum(r.daily || 0));
    const sr = document.getElementById('s-role');
    if (sr) {
      sr.textContent = r.label || d.user.role;
      sr.style.color = r.color || '';
    }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('s-credit', fmtNum(d.user.credits));
    set('s-today', fmtNum(d.stats.today));
    set('s-total', fmtNum(d.stats.total));
    set('s-fail', fmtNum(d.stats.failed));

    const chart = document.getElementById('mchart');
    if (!chart) return;
    const sRes = await api('/api/stats/daily');
    const days = sRes.res.ok && sRes.body && sRes.body.data ? sRes.body.data.days : [];
    const last = days.slice(-7).map((x) => ({ hits: x.hits || 0, label: new Date(x.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }) }));
    const labelsEl = document.getElementById('mchart-labels');
    if (!last.length) { chart.innerHTML = '<div class="empty" style="width:100%">' + tr('hist.empty') + '</div>'; if (labelsEl) labelsEl.innerHTML = ''; return; }
    const max = Math.max.apply(null, last.map((x) => x.hits)) || 1;
    chart.innerHTML = last.map((x) => '<div class="mb' + (x.hits > 0 ? ' hi' : '') + '" style="height:' + Math.max(3, Math.round((x.hits / max) * 100)) + '%"></div>').join('');
    if (labelsEl) labelsEl.innerHTML = last.map((x) => '<span>' + x.label + '</span>').join('');
  }

  function greetWord() {
    const h = new Date().getHours();
    if (h < 11) return tr('greet.morning');
    if (h < 15) return tr('greet.afternoon');
    if (h < 19) return tr('greet.evening');
    return tr('greet.night');
  }

  /* ===== Keys ===== */
  let rolesConfig = null;
  async function getRolesConfig() {
    if (rolesConfig) return rolesConfig;
    const { res, body } = await api('/api/roles');
    if (res.ok && body && body.data) rolesConfig = body.data;
    return rolesConfig || {};
  }

  function renderKeys() {
    const box = document.getElementById('keys');
    if (!box) return;
    api('/api/dashboard').then(async ({ res, body }) => {
      if (!res.ok) return;
      const keys = body.data.keys || [];
      const me = body.data.me || {};
      const roleCfg = (await getRolesConfig())[me.role] || {};
      const canIps = !!roleCfg.whitelist;
      box.innerHTML = keys.length
        ? keys.map((k) =>
            '<div class="krow">' +
            '<div><div class="kname">' + esc(k.name) + '</div><div class="kkey">' + esc(k.key) + '</div></div>' +
            '<div class="kmeta"><span class="km">' + fmtNum(k.hits) + ' hit</span>' +
            '<span class="pill ' + (k.active ? 'ok' : 'off') + '">' + tr(k.active ? 'keys.on' : 'keys.off') + '</span></div>' +
            '<div class="kact">' +
            '<button class="btn sm" data-act="copy" data-key="' + esc(k.key) + '" data-i18n="keys.copy">' + tr('keys.copy') + '</button>' +
            '<button class="btn sm" data-act="toggle" data-id="' + k.id + '" data-i18n="keys.' + (k.active ? 'disable' : 'enable') + '">' + tr(k.active ? 'keys.disable' : 'keys.enable') + '</button>' +
            '<button class="btn sm danger" data-act="del" data-id="' + k.id + '" data-name="' + esc(k.name) + '" data-i18n="keys.delete">' + tr('keys.delete') + '</button>' +
            '</div>' +
            (canIps ? '<div class="kips"><span class="kipl">' + tr('keys.ips') + '</span>' +
              '<input class="inp" data-ips="' + k.id + '" value="' + esc((k.allowed_ips || []).join(', ')) + '" placeholder="' + tr('keys.ipsPh') + '" autocomplete="off">' +
              '<button class="btn sm" data-act="ips" data-id="' + k.id + '" data-i18n="keys.ipsSave">' + tr('keys.ipsSave') + '</button></div>' : '') +
            '</div>'
          ).join('')
        : '<div class="empty">' + tr('keys.empty') + '</div>';
      bindRows();
    });
  }

  function bindRows() {
    document.querySelectorAll('[data-act=copy]').forEach((b) => b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.key);
        const old = b.textContent;
        b.textContent = tr('keys.copied');
        setTimeout(() => { b.textContent = old; }, 1200);
      } catch {}
    }));
    document.querySelectorAll('[data-act=toggle]').forEach((b) => b.addEventListener('click', async () => {
      const btn = b;
      btn.disabled = true;
      const { res } = await api('/api/keys/' + b.dataset.id + '/toggle', { method: 'POST' });
      if (res.ok) renderKeys();
      else btn.disabled = false;
    }));
    document.querySelectorAll('[data-act=del]').forEach((b) => b.addEventListener('click', () => {
      askDelete(b.dataset.id, b.dataset.name).then((ok) => { if (ok) renderKeys(); });
    }));
    document.querySelectorAll('[data-act=ips]').forEach((b) => b.addEventListener('click', async () => {
      const inp = document.querySelector('[data-ips="' + b.dataset.id + '"]');
      b.disabled = true;
      const ips = (inp.value || '').split(',').map((x) => x.trim()).filter(Boolean);
      const { res } = await api('/api/keys/' + b.dataset.id + '/ips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ips }),
      });
      b.disabled = false;
      if (res.ok) renderKeys();
    }));
  }

  let modalResolve = null;
  function askDelete(id, name) {
    const bg = document.getElementById('mbg');
    if (!bg) return Promise.resolve(false);
    document.getElementById('mtext').innerHTML = 'Key <code>' + esc(name || 'default') + '</code> — ' + tr('keys.delText');
    bg.classList.add('show');
    return new Promise((resolve) => {
      modalResolve = resolve;
      const mc = document.getElementById('mc');
      const mk = document.getElementById('mk');
      mc.onclick = () => { bg.classList.remove('show'); modalResolve(false); };
      mk.onclick = async () => {
        mk.disabled = true;
        const { res } = await api('/api/keys/' + id, { method: 'DELETE' });
        mk.disabled = false;
        bg.classList.remove('show');
        modalResolve(res.ok);
      };
    });
  }

  /* ===== History ===== */
  function renderHistory() {
    const box = document.getElementById('hist');
    if (!box) return;
    api('/api/dashboard').then(({ res, body }) => {
      if (!res.ok || !body.data) return;
      const list = body.data.history || [];
      box.innerHTML = list.length
        ? list.map((h) =>
            '<div class="hrow">' +
            '<div><div class="hpath">' + esc(h.endpoint || '/') + '</div>' +
            '<div class="hkey">' + esc(h.key_name || '') + '</div></div>' +
            '<div class="hmeta">' +
            '<span class="pill ' + (h.success ? 'ok' : 'bad') + '">' + tr(h.success ? 'hist.ok' : 'hist.fail') + '</span>' +
            '<span class="hdate">' + fmtDate(h.created_at) + '</span>' +
            '</div></div>'
          ).join('')
        : '<div class="empty">' + tr('hist.empty') + '</div>';
    });
  }

  /* ===== Boot ===== */
  document.addEventListener('DOMContentLoaded', () => {
    buildShell();
    applyLang();
    loadMe().then((u) => {
      if (!u) return;
      const g = document.getElementById('greet-w');
      if (g) g.textContent = greetWord();
    });
    if (PAGE === '/dashboard') loadOverview();
    if (PAGE === '/keys') { renderKeys(); const nk = document.getElementById('newkey'); if (nk) nk.addEventListener('click', createKey); }
    if (PAGE === '/history') renderHistory();
    if (PAGE === '/beli') { initBuy(); initOrders(); }
  });

  async function createKey() {
    const btn = document.getElementById('newkey');
    btn.disabled = true;
    const name = (document.getElementById('kname') || {}).value || '';
    const { res } = await api('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    btn.disabled = false;
    if (res.ok) {
      if (document.getElementById('kname')) document.getElementById('kname').value = '';
      renderKeys();
    }
  }

  document.addEventListener('langchange', () => {
    const tt = TITLES[PAGE];
    if (tt) {
      const t1 = document.getElementById('p-title');
      const t2 = document.getElementById('p-sub');
      if (t1) t1.textContent = tr(tt[0]);
      if (t2) t2.textContent = tr(tt[1]);
    }
    if (PAGE === '/dashboard') loadOverview();
    if (PAGE === '/keys') renderKeys();
    if (PAGE === '/history') renderHistory();
  });
})();

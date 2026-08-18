/* ===== Zunndev Console v3 — tabs + i18n ===== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtNum = (n) => Number(n || 0).toLocaleString('id-ID');
  const fmtDate = (s) => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d) ? '—' : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  const api = async (path, opts = {}) => {
    try {
      const res = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
      let body = null;
      try { body = await res.json(); } catch (e) { /* noop */ }
      return { res, body };
    } catch (err) {
      return { res: { ok: false }, body: { error: { message: err.message } } };
    }
  };
  const copyText = async (t) => {
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove();
      return ok;
    }
  };

  const TABS = [
    { id: 'overview', key: 'dash.overview' },
    { id: 'keys', key: 'dash.keys' },
    { id: 'history', key: 'dash.history' },
    { id: 'buy', key: 'dash.buy' },
  ];

  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function greetWord() {
    const h = new Date().getHours();
    if (h < 11) return tr('greet.morning');
    if (h < 15) return tr('greet.afternoon');
    if (h < 19) return tr('greet.evening');
    return tr('greet.night');
  }

  function buildShell() {
    document.body.classList.add('console');

    const top = document.createElement('header');
    top.className = 'topbar';
    top.innerHTML =
      '<a class="logo" href="/dashboard"><span class="mark">✧</span>Zunndev API</a>' +
      '<div class="tr">' +
      '<button class="langbtn" id="langbtn" data-i18n-lang="1">EN</button>' +
      '<button class="tbtn" id="tbtn" aria-label="Theme"></button>' +
      '<a class="cred" href="/beli"><span class="zglyph">✧</span> <span id="cred-n">—</span></a>' +
      '<div class="usr" id="usr">' +
      '<span class="ava" id="ava">?</span><span class="unm" id="unm">—</span><span class="uarr">▾</span>' +
      '<div class="umenu" id="umenu">' +
      '<a href="/dashboard" data-i18n="dash.overview">Overview</a>' +
      '<a href="/beli" data-i18n="nav.buy">Buy Role</a>' +
      '<div class="usep"></div>' +
      '<button class="danger" id="logout" data-i18n="common.logout">Log out</button>' +
      '<p class="uver">Zunndev API · v35</p>' +
      '</div></div></div>';
    document.body.prepend(top);

    const tabs = document.createElement('nav');
    tabs.className = 'tabs';
    tabs.innerHTML = TABS.map((t) =>
      '<button class="tabbtn' + (t.id === 'overview' ? ' on' : '') + '" data-tab="' + t.id + '" data-i18n="' + t.key + '">' + tr(t.key) + '</button>'
    ).join('');
    document.body.appendChild(tabs);
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('.tabbtn');
      if (b) showTab(b.dataset.tab);
    });

    const saved = localStorage.getItem('znd-theme');
    const tbtn = $('tbtn');
    const paint = (lite) => {
      document.body.classList.toggle('lite', lite);
      tbtn.innerHTML = lite ? MOON : SUN;
    };
    paint(saved === 'lite');
    tbtn.addEventListener('click', () => {
      const lite = !document.body.classList.contains('lite');
      localStorage.setItem('znd-theme', lite ? 'lite' : 'dark');
      paint(lite);
    });

    $('langbtn').addEventListener('click', () => { toggleLang(); });

    const usr = $('usr'), umenu = $('umenu');
    usr.addEventListener('click', (e) => { e.stopPropagation(); umenu.classList.toggle('open'); });
    document.addEventListener('click', () => umenu.classList.remove('open'));
    $('logout').addEventListener('click', async () => {
      await api('/api/logout', { method: 'POST' });
      location.href = '/';
    });

    api('/api/me').then(({ res, body }) => {
      if (!res.ok || !body || body.status !== 'success') return;
      const u = body.data.user;
      $('ava').textContent = (u.name || '?').charAt(0).toUpperCase();
      $('unm').textContent = u.name;
      $('cred-n').textContent = fmtNum(u.credits);
    });
  }

  function showTab(id) {
    document.querySelectorAll('.tabpanel').forEach((p) => p.classList.toggle('on', p.dataset.panel === id));
    document.querySelectorAll('.tabbtn').forEach((b) => b.classList.toggle('on', b.dataset.tab === id));
    if (id === 'overview') loadOverview();
    if (id === 'keys') renderKeys();
    if (id === 'history') renderHistory();
    if (id === 'buy') { const w = $('orders-wrap'); if (w && $('orders-list') && $('orders-list').children.length) w.style.display = 'block'; }
  }

  /* ===== Overview ===== */
  async function loadOverview() {
    const { res, body } = await api('/api/dashboard');
    if (!res.ok) { location.href = '/login'; return; }
    const d = body.data;
    const r = d.roleInfo || {};
    $('un').textContent = d.user.name;
    $('greet-w').textContent = greetWord();
    $('email').textContent = d.user.email;
    $('urole').innerHTML = '<span class="pill" style="color:' + r.color + ';border-color:' + r.color + '">' + esc(r.label || d.user.role) + '</span>';
    $('quota').textContent = tr('ov.quota').replace('{n}', fmtNum(r.daily || 0));
    $('s-credit').textContent = fmtNum(d.user.credits);
    $('s-today').textContent = fmtNum(d.stats.today);
    $('s-total').textContent = fmtNum(d.stats.total);
    $('s-fail').textContent = fmtNum(d.stats.failed);

    const sRes = await api('/api/stats/daily');
    const days = sRes.res.ok && sRes.body && sRes.body.data ? sRes.body.data.days : [];
    const last = days.slice(-7).map((d) => ({ hits: d.hits || 0, label: new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }) }));
    const chart = $('mchart');
    const labels = $('mchart-labels');
    if (!last.length) { chart.innerHTML = '<div class="empty" style="width:100%">' + tr('hist.empty') + '</div>'; labels.innerHTML = ''; return; }
    const max = Math.max.apply(null, last.map((d) => d.hits || 0)) || 1;
    chart.innerHTML = last.map((d) => '<div class="mb' + (d.hits > 0 ? ' hi' : '') + '" style="height:' + Math.max(3, Math.round((d.hits / max) * 100)) + '%"></div>').join('');
    labels.innerHTML = last.map((d) => '<span>' + (d.label || '') + '</span>').join('');
  }

  /* ===== Keys ===== */
  function renderKeys() {
    api('/api/dashboard').then(({ res, body }) => {
      if (!res.ok) return;
      const keys = body.data.keys || [];
      const box = $('keys');
      box.innerHTML = keys.length
        ? keys.map((k) =>
            '<div class="krow">' +
            '<div><div class="kname">' + esc(k.name) + '</div><div class="kkey">' + esc(k.key) + '</div></div>' +
            '<div class="kmeta"><span class="km">' + fmtNum(k.hits) + ' hit</span>' +
            '<span class="pill ' + (k.active ? 'ok' : 'off') + '">' + tr(k.active ? 'keys.on' : 'keys.off') + '</span></div>' +
            '<div class="kact">' +
            '<button class="btn sm" data-act="copy" data-key="' + esc(k.key) + '" data-i18n="keys.copy">Copy</button>' +
            '<button class="btn sm" data-act="toggle" data-id="' + k.id + '" data-i18n="keys.' + (k.active ? 'disable' : 'enable') + '">' + (k.active ? 'Disable' : 'Enable') + '</button>' +
            '<button class="btn sm danger" data-act="del" data-id="' + k.id + '" data-name="' + esc(k.name) + '" data-i18n="keys.delete">Delete</button>' +
            '</div></div>'
          ).join('')
        : '<div class="empty">' + tr('keys.empty') + '</div>';
      bindRows();
    });
  }

  function bindRows() {
    document.querySelectorAll('#keys .krow button[data-act]').forEach((b) => {
      b.addEventListener('click', async () => {
        const act = b.dataset.act;
        b.disabled = true;
        if (act === 'copy') {
          const ok = await copyText(b.dataset.key);
          b.textContent = ok ? tr('keys.copied') : '—';
          setTimeout(() => { b.textContent = tr('keys.copy'); b.disabled = false; }, 1200);
          return;
        }
        if (act === 'toggle') await api('/api/keys/' + b.dataset.id + '/toggle', { method: 'POST' });
        if (act === 'del') {
          if (!(await askDelete(b.dataset.id, b.dataset.name))) { b.disabled = false; return; }
          await api('/api/keys/' + b.dataset.id, { method: 'DELETE' });
        }
        renderKeys();
      });
    });
  }

  let modalResolve = null;
  function askDelete(id, name) {
    $('mtext').innerHTML = 'Key <code>' + esc(name || 'default') + '</code> — ' + tr('keys.delText');
    $('mbg').classList.add('show');
    return new Promise((resolve) => {
      modalResolve = resolve;
      $('mk').onclick = () => { closeModal(); resolve(true); };
      $('mc').onclick = () => { closeModal(); resolve(false); };
      $('mbg').onclick = (e) => { if (e.target === $('mbg')) { closeModal(); resolve(false); } };
    });
  }
  function closeModal() {
    $('mbg').classList.remove('show');
    $('mk').onclick = null;
    $('mc').onclick = null;
    $('mbg').onclick = null;
  }

  /* ===== History ===== */
  function renderHistory() {
    api('/api/dashboard').then(({ res, body }) => {
      if (!res.ok) return;
      const rows = body.data.history || [];
      const box = $('hist');
      box.innerHTML = rows.length
        ? rows.map((h) =>
            '<div class="hrow">' +
            '<span class="hp"><code>' + esc(h.endpoint) + '</code> <span class="ht">· ' + esc(h.key_name || '-') + '</span></span>' +
            '<span class="km">' + (h.success ? '<span class="pill ok">' + tr('hist.ok') + '</span>' : '<span class="pill err">' + tr('hist.fail') + '</span>') + ' · ' + fmtDate(h.created_at) + '</span>' +
            '</div>'
          ).join('')
        : '<div class="empty">' + tr('hist.empty') + '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildShell();
    applyLang();
    if ($('dash')) {
      showTab('overview');
      const goBuy = $('go-buy');
      if (goBuy) goBuy.addEventListener('click', (e) => { e.preventDefault(); showTab('buy'); });
      $('newkey').addEventListener('click', async () => {
        const name = $('kname').value.trim();
        $('newkey').disabled = true;
        await api('/api/keys', { method: 'POST', body: JSON.stringify({ name }) });
        $('newkey').disabled = false;
        $('kname').value = '';
        renderKeys();
      });
      document.addEventListener('langchange', () => {
        loadOverview();
        renderKeys();
        renderHistory();
      });
    }
  });
})();
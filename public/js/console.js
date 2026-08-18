/* ===== Zunndev Console v2 — ditulis ulang dari nol ===== */
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

  const NAV = [
    { href: '/dashboard', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>' },
    { href: '/beli', label: 'Beli Role', icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/>' },
    { href: '/stats', label: 'Stats', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { href: '/endpoints', label: 'Endpoint', icon: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>' },
    { href: '/api/docs', label: 'Docs', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
  ];

  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function buildShell() {
    const page = location.pathname;
    const title = document.body.dataset.title || 'Dashboard';
    document.body.classList.add('console');

    const top = document.createElement('header');
    top.className = 'topbar';
    top.innerHTML =
      '<a class="logo" href="/dashboard"><span class="mark">✧</span>Zunndev API</a>' +
      '<span class="tpage">' + esc(title) + '</span>' +
      '<div class="tr">' +
      '<a class="cred" href="/beli" title="Sisa credit">⚡ <span id="cred-n">—</span></a>' +
      '<button class="tbtn" id="tbtn" aria-label="Ganti tema"></button>' +
      '<div class="usr" id="usr">' +
      '<span class="ava" id="ava">?</span><span class="unm" id="unm">—</span><span class="uarr">▾</span>' +
      '<div class="umenu" id="umenu">' +
      '<a href="/dashboard">Dashboard</a>' +
      '<a href="/beli">Beli Role</a>' +
      '<div class="usep"></div>' +
      '<button class="danger" id="logout">Keluar</button>' +
      '<p class="uver">Zunndev API · v31</p>' +
      '</div></div></div>';
    document.body.prepend(top);

    const side = document.createElement('aside');
    side.className = 'side';
    side.innerHTML =
      '<div class="slabel">Menu</div>' +
      NAV.map((n) =>
        '<a href="' + n.href + '"' + (page.startsWith(n.href) ? ' class="on"' : '') + '>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + n.icon + '</svg>' +
        n.label + '</a>'
      ).join('');
    document.body.appendChild(side);

    const navb = document.createElement('nav');
    navb.className = 'navb';
    navb.innerHTML = NAV.map((n) =>
      '<a href="' + n.href + '"' + (page.startsWith(n.href) ? ' class="on"' : '') + '>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + n.icon + '</svg>' +
      n.label + '</a>'
    ).join('');
    document.body.appendChild(navb);

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

  /* ================= Dashboard ================= */
  function greetWord() {
    const h = new Date().getHours();
    if (h < 11) return 'Pagi';
    if (h < 15) return 'Siang';
    if (h < 19) return 'Sore';
    return 'Malam';
  }

  function rowKey(k) {
    const status = k.active ? 'on' : 'off';
    return (
      '<div class="krow">' +
      '<div><div class="kname">' + esc(k.name) + '</div><div class="kkey">' + esc(k.key) + '</div></div>' +
      '<div class="kmeta">' +
      '<span class="km">' + fmtNum(k.hits) + ' hit</span>' +
      '<span class="dot ' + status + '" title="' + (k.active ? 'aktif' : 'mati') + '"></span>' +
      '</div>' +
      '<div class="kact">' +
      '<button class="btn sm" data-act="copy" data-key="' + esc(k.key) + '">Salin</button>' +
      '<button class="btn sm" data-act="toggle" data-id="' + k.id + '">' + (k.active ? 'Nonaktifkan' : 'Aktifkan') + '</button>' +
      '<button class="btn sm danger" data-act="del" data-id="' + k.id + '" data-name="' + esc(k.name) + '">Hapus</button>' +
      '</div></div>'
    );
  }

  function rowHist(h) {
    return (
      '<div class="hrow">' +
      '<span class="hp"><code>' + esc(h.endpoint) + '</code> <span class="ht">· ' + esc(h.key_name || '-') + '</span></span>' +
      '<span class="km">' + (h.success ? '<span class="pill ok">sukses</span>' : '<span class="pill err">gagal</span>') + ' · ' + fmtDate(h.created_at) + '</span>' +
      '</div>'
    );
  }

  function bindRows() {
    document.querySelectorAll('#keys .krow button[data-act]').forEach((b) => {
      b.addEventListener('click', async () => {
        const act = b.dataset.act;
        b.disabled = true;
        if (act === 'copy') {
          const ok = await copyText(b.dataset.key);
          b.textContent = ok ? 'Tersalin!' : 'Gagal';
          setTimeout(() => { b.textContent = 'Salin'; b.disabled = false; }, 1200);
          return;
        }
        if (act === 'toggle') await api('/api/keys/' + b.dataset.id + '/toggle', { method: 'POST' });
        if (act === 'del') {
          if (!(await askDelete(b.dataset.id, b.dataset.name))) { b.disabled = false; return; }
          await api('/api/keys/' + b.dataset.id, { method: 'DELETE' });
        }
        loadDash();
      });
    });
  }

  let modalResolve = null;
  function askDelete(id, name) {
    $('mtext').innerHTML = 'Key <code>' + esc(name || 'default') + '</code> akan dihapus permanen dan tidak bisa dipakai lagi.';
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

  async function loadDash() {
    const { res, body } = await api('/api/dashboard');
    if (!res.ok) { location.href = '/login'; return; }
    const d = body.data;
    const r = d.roleInfo || {};
    $('un').textContent = ' ' + d.user.name;
    $('greet-w').textContent = greetWord() + ',';
    $('email').textContent = d.user.email;
    $('urole').innerHTML = '<span class="pill" style="color:' + r.color + ';border-color:' + r.color + '">' + esc(r.label || d.user.role) + '</span>';
    $('quota').textContent = 'Jatah hari ini ' + fmtNum(r.daily || 0) + ' credit';
    $('s-credit').textContent = fmtNum(d.user.credits);
    $('s-today').textContent = fmtNum(d.stats.today);
    $('s-total').textContent = fmtNum(d.stats.total);
    $('s-fail').textContent = fmtNum(d.stats.failed);

    const keys = $('keys');
    keys.innerHTML = d.keys.length
      ? d.keys.map(rowKey).join('')
      : '<div class="empty">Belum ada key. Buat key pertama kamu — gratis.</div>';
    bindRows();

    const hist = $('hist');
    hist.innerHTML = d.history.length
      ? d.history.map(rowHist).join('')
      : '<div class="empty">Belum ada pemakaian. Coba panggil API pakai key kamu.</div>';
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildShell();
    if ($('dash')) {
      loadDash();
      $('newkey').addEventListener('click', async () => {
        const name = $('kname').value.trim();
        $('newkey').disabled = true;
        await api('/api/keys', { method: 'POST', body: JSON.stringify({ name }) });
        $('newkey').disabled = false;
        $('kname').value = '';
        loadDash();
      });
    }
  });
})();
(function () {
  var app = document.getElementById('app');
  var view = 'overview';
  var orderFilter = 'all';
  var userName = '';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtNum(n) { return Number(n || 0).toLocaleString('id-ID'); }

  function fmtDate(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    return isNaN(d) ? String(iso) : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function api(path, opts) {
    opts = opts || {};
    return fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts)).then(function (r) {
      return r.json().then(function (b) { return { res: r, body: b }; });
    });
  }

  function toast(msg, ok) {
    var t = document.createElement('div');
    t.className = 'a-toast' + (ok ? ' ok' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }, 2200);
  }

  var BADGE = { pending: 'pend', paid: 'ok', expired: 'bad', failed: 'bad', cancelled: 'mute' };
  var BADGE_TXT = { pending: 'Menunggu', paid: 'Lunas', expired: 'Kadaluarsa', failed: 'Gagal', cancelled: 'Dibatalkan' };

  var ICONS = {
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    pending: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    coins: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    bar: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  };

  function mkIcon(name, color, bg) {
    return '<span class="ic" style="background:' + bg + ';color:' + color + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      ICONS[name] + '</svg></span>';
  }

  function renderLogin(err) {
    document.body.className = 'a-body';
    app.innerHTML =
      '<div class="a-login">' +
      '<div class="a-login-card">' +
      '<img class="a-logo" src="/img/logo.png?v=89" alt="Ziplan">' +
      '<h1>Admin <b>Ziplan</b></h1>' +
      '<p>Panel rahasia — masuk pakai akun admin.</p>' +
      '<div class="err" id="err"></div>' +
      '<input type="email" id="email" placeholder="email admin" autocomplete="username">' +
      '<input type="password" id="pass" placeholder="password" autocomplete="current-password">' +
      '<button class="go" id="go">Masuk</button>' +
      '</div></div>';
    if (err) document.getElementById('err').textContent = err;
    var input = document.getElementById('email');
    input.focus();
    var go = function () {
      var email = input.value.trim();
      var pass = document.getElementById('pass').value;
      var btn = document.getElementById('go');
      btn.disabled = true;
      btn.textContent = 'Memeriksa...';
      api('/api/login', { method: 'POST', body: JSON.stringify({ email: email, password: pass }) }).then(function (r) {
        if (!r.res.ok) {
          btn.disabled = false;
          btn.textContent = 'Masuk';
          renderLogin('Email atau password salah.');
          return;
        }
        userName = r.body.data.name;
        check();
      });
    };
    document.getElementById('go').addEventListener('click', go);
    document.getElementById('pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  }

  function renderShell() {
    app.innerHTML =
      '<header class="a-head">' +
      '<a class="a-brand" href="#"><img class="a-logo" src="/img/logo.png?v=89" alt="Ziplan">' +
      '<span><span class="nm">Admin <b>Ziplan</b></span><br><span class="sub">Control Panel</span></span></a>' +
      '<div class="a-head-right">' +
      '<span class="a-user">Halo, <b>' + esc(userName) + '</b></span>' +
      '<button class="a-btn" id="logout">Keluar</button>' +
      '</div></header>' +
      '<main class="a-wrap">' +
      '<div class="a-tabs">' +
      '<button class="a-tab" data-tab="overview">Ringkasan</button>' +
      '<button class="a-tab" data-tab="orders">Pesanan</button>' +
      '<button class="a-tab" data-tab="users">Pengguna</button>' +
      '</div>' +
      '<div id="view"></div></main>';
    document.getElementById('logout').addEventListener('click', function () {
      api('/api/logout', { method: 'POST' }).then(function () { location.reload(); });
    });
    document.querySelectorAll('.a-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === view);
      b.addEventListener('click', function () { view = b.dataset.tab; renderShell(); load(); });
    });
  }

  function renderOverview(d) {
    var cards = [
      ['users', 'Pengguna', d.users, '#35d0a8', 'rgba(53,208,168,0.1)'],
      ['pending', 'Pesanan pending', d.ordersPending, '#635bff', 'rgba(99,91,255,0.12)'],
      ['coins', 'Pendapatan', 'Rp ' + fmtNum(d.revenue), '#8b82ff', 'rgba(255,210,122,0.12)'],
      ['activity', 'Hits hari ini', fmtNum(d.hitsToday), '#b98cff', 'rgba(185,140,255,0.12)'],
      ['bar', 'Hits total', fmtNum(d.hitsTotal), '#ff6b9d', 'rgba(255,107,157,0.12)'],
    ];
    document.getElementById('view').innerHTML =
      '<div class="a-ov">' + cards.map(function (c) {
        return '<div class="a-card">' + mkIcon(c[0], c[3], c[4]) +
          '<div class="n">' + esc(c[2]) + '</div><div class="l">' + esc(c[1]) + '</div></div>';
      }).join('') + '</div>';
  }

  function renderOrders(list) {
    var v = document.getElementById('view');
    var filtered = orderFilter === 'all' ? list : list.filter(function (o) { return o.status === orderFilter; });
    v.innerHTML =
      '<div class="a-panel">' +
      '<div class="a-panel-hd"><h2>Semua pesanan</h2>' +
      '<div class="a-chips">' +
      ['all', 'pending', 'paid'].map(function (f) {
        var label = { all: 'Semua', pending: 'Menunggu', paid: 'Lunas' }[f];
        return '<button class="a-chip' + (orderFilter === f ? ' active' : '') + '" data-f="' + f + '">' + label + '</button>';
      }).join('') +
      '</div></div>' +
      '<div class="a-tbl-wrap"><table class="a-tbl">' +
      '<tr><th>Order</th><th>User</th><th>Role</th><th>Nominal</th><th>Status</th><th>Dibuat</th><th></th></tr>' +
      (filtered.length ? filtered.map(function (o) {
        return '<tr>' +
          '<td><span class="a-oid">#' + o.id + '</span></td>' +
          '<td>' + esc(o.name) + '<span class="a-sub">' + esc(o.email) + '</span></td>' +
          '<td style="color:' + esc(o.roleInfo.color) + ';font-weight:800">' + esc(o.roleInfo.label) + '</td>' +
          '<td>Rp ' + fmtNum(o.amount) + '</td>' +
          '<td><span class="pay-badge ' + BADGE[o.status] + '">' + BADGE_TXT[o.status] + '</span></td>' +
          '<td>' + fmtDate(o.createdAt) + '</td>' +
          '<td><div class="a-act">' + (o.status === 'pending'
            ? '<button class="a-mini gold" data-paid="' + o.id + '">Tandai lunas</button>' +
              '<button class="a-mini red" data-cancel="' + o.id + '">Batal</button>'
            : '<span class="a-sub">—</span>') + '</div></td></tr>';
      }).join('') : '<tr><td colspan="7"><div class="a-empty">Belum ada pesanan di filter ini.</div></td></tr>') +
      '</table></div></div>';
    v.querySelectorAll('.a-chip').forEach(function (c) {
      c.addEventListener('click', function () { orderFilter = c.dataset.f; renderOrders(list); });
    });
    v.querySelectorAll('[data-paid]').forEach(function (b) {
      b.addEventListener('click', function () {
        api('/api/admin/orders/' + b.dataset.paid + '/mark-paid', { method: 'POST' }).then(function (r) {
          toast(r.res.ok ? 'Pesanan ditandai lunas.' : 'Gagal.', r.res.ok);
          if (r.res.ok) load();
        });
      });
    });
    v.querySelectorAll('[data-cancel]').forEach(function (b) {
      b.addEventListener('click', function () {
        api('/api/admin/orders/' + b.dataset.cancel + '/cancel', { method: 'POST' }).then(function (r) {
          toast(r.res.ok ? 'Pesanan dibatalkan.' : 'Gagal.', r.res.ok);
          if (r.res.ok) load();
        });
      });
    });
  }

  function renderUsers(list) {
    var v = document.getElementById('view');
    v.innerHTML =
      '<div class="a-panel">' +
      '<div class="a-panel-hd"><h2>Semua pengguna</h2><span class="a-sub">' + list.length + ' akun</span></div>' +
      '<div class="a-tbl-wrap"><table class="a-tbl">' +
      '<tr><th>Pengguna</th><th>Role</th><th>Credits</th><th>Key</th><th>Hits</th><th>Gabung</th><th></th></tr>' +
      list.map(function (u) {
        return '<tr>' +
          '<td><div style="display:flex;align-items:center;gap:0.6rem">' +
          '<span class="a-ava">' + esc((u.name || '?').charAt(0).toUpperCase()) + '</span>' +
          '<div>' + esc(u.name) + (u.is_admin ? ' <span class="pay-badge ok">ADMIN</span>' : '') +
          '<span class="a-sub">' + esc(u.email) + '</span></div></div></td>' +
          '<td><select class="a-sel" data-uid="' + u.id + '">' +
          ['free', 'vip', 'gars', 'vilions', 'verus'].map(function (r) {
            return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r.toUpperCase() + '</option>';
          }).join('') + '</select></td>' +
          '<td>' + fmtNum(u.credits) + '</td>' +
          '<td>' + u.keys + '</td>' +
          '<td>' + fmtNum(u.hits) + '</td>' +
          '<td>' + fmtDate(u.created_at) + '</td>' +
          '<td><button class="a-mini gold" data-save="' + u.id + '" data-role="' + u.role + '">Simpan</button></td></tr>';
      }).join('') +
      '</table></div></div>';
    v.querySelectorAll('.a-sel').forEach(function (s) {
      s.addEventListener('change', function () {
        var btn = v.querySelector('[data-save="' + s.dataset.uid + '"]');
        if (btn) btn.dataset.role = s.value;
      });
    });
    v.querySelectorAll('[data-save]').forEach(function (b) {
      b.addEventListener('click', function () {
        api('/api/admin/users/' + b.dataset.save + '/role', {
          method: 'POST',
          body: JSON.stringify({ role: b.dataset.role }),
        }).then(function (r) {
          toast(r.res.ok ? 'Role diperbarui.' : 'Gagal.', r.res.ok);
          if (r.res.ok) load();
        });
      });
    });
  }

  function check() {
    api('/api/admin/overview').then(function (r) {
      if (!r.res.ok) {
        if (r.res.status === 403) return renderLogin('Akun ini bukan admin.');
        return renderLogin();
      }
      renderShell();
      load();
    });
  }

  function load() {
    if (view === 'overview') {
      api('/api/admin/overview').then(function (r) { if (r.res.ok) renderOverview(r.body.data); });
    } else if (view === 'orders') {
      api('/api/admin/orders').then(function (r) { if (r.res.ok) renderOrders(r.body.data); });
    } else if (view === 'users') {
      api('/api/admin/users').then(function (r) { if (r.res.ok) renderUsers(r.body.data); });
    }
  }

  check();
})();
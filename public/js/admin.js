(function () {
  var app = document.getElementById('app');
  var view = 'overview';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtNum(n) { return Number(n || 0).toLocaleString('id-ID'); }

  function fmtDate(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    return isNaN(d) ? String(iso) : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  var BADGE = { pending: 'pend', paid: 'ok', expired: 'bad', failed: 'bad', cancelled: 'mute' };
  var BADGE_TXT = { pending: 'Menunggu', paid: 'Lunas', expired: 'Kadaluarsa', failed: 'Gagal', cancelled: 'Dibatalkan' };

  function api(path, opts) {
    opts = opts || {};
    return fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts)).then(function (r) {
      return r.json().then(function (b) { return { res: r, body: b }; });
    });
  }

  function renderLogin(err) {
    app.innerHTML =
      '<div class="login-box">' +
      '<h1>Admin <b>Zunndev API</b></h1>' +
      '<div class="err" id="err"></div>' +
      '<input type="email" id="email" placeholder="email admin" autocomplete="username">' +
      '<input type="password" id="pass" placeholder="password" autocomplete="current-password">' +
      '<button class="modal-btn primary" style="width:100%;padding:0.8rem" id="go">Masuk</button>' +
      '</div>';
    if (err) document.getElementById('err').textContent = err;
    var go = function () {
      var email = document.getElementById('email').value.trim();
      var pass = document.getElementById('pass').value;
      document.getElementById('go').disabled = true;
      api('/api/login', { method: 'POST', body: JSON.stringify({ email: email, password: pass }) }).then(function (r) {
        if (!r.res.ok) {
          document.getElementById('go').disabled = false;
          renderLogin('Email atau password salah.');
          return;
        }
        check();
      });
    };
    document.getElementById('go').addEventListener('click', go);
    document.getElementById('pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  }

  function renderTop() {
    return '<div class="admin-top"><div class="brand">Admin <b>Zunndev API</b></div>' +
      '<button id="logout">Keluar</button></div>';
  }

  function renderTabs() {
    var tabs = [
      ['overview', 'Ringkasan'],
      ['orders', 'Pesanan'],
      ['users', 'Pengguna'],
    ];
    app.innerHTML = renderTop() +
      '<div class="admin-wrap">' +
      '<div class="tabs">' + tabs.map(function (t) {
        return '<button data-tab="' + t[0] + '" class="' + (view === t[0] ? 'active' : '') + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      '<div id="view"></div></div>';
    document.getElementById('logout').addEventListener('click', function () {
      api('/api/logout', { method: 'POST' }).then(function () { location.reload(); });
    });
    document.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { view = b.dataset.tab; load(); });
    });
  }

  function renderOverview(d) {
    var cards = [
      ['Pengguna', d.users],
      ['Pesanan pending', d.ordersPending],
      ['Pendapatan', 'Rp ' + fmtNum(d.revenue)],
      ['Hits hari ini', d.hitsToday],
      ['Hits total', d.hitsTotal],
    ];
    document.getElementById('view').innerHTML =
      '<div class="ov-grid">' + cards.map(function (c) {
        return '<div class="ov"><div class="n">' + esc(c[1]) + '</div><div class="l">' + esc(c[0]) + '</div></div>';
      }).join('') + '</div>';
  }

  function renderOrders(list) {
    var v = document.getElementById('view');
    v.innerHTML = '<div class="panel"><h2>Semua pesanan</h2><div class="tbl-wrap"><table class="tbl">' +
      '<tr><th>ID</th><th>User</th><th>Role</th><th>Nominal</th><th>Status</th><th>Dibuat</th><th></th></tr>' +
      list.map(function (o) {
        return '<tr><td>' + o.id + '</td>' +
          '<td>' + esc(o.name) + ' <span style="color:var(--muted-2)">' + esc(o.email) + '</span></td>' +
          '<td style="color:' + esc(o.roleInfo.color) + ';font-weight:800">' + esc(o.roleInfo.label) + '</td>' +
          '<td>Rp ' + fmtNum(o.amount) + '</td>' +
          '<td><span class="pay-badge ' + BADGE[o.status] + '">' + BADGE_TXT[o.status] + '</span></td>' +
          '<td>' + fmtDate(o.createdAt) + '</td>' +
          '<td class="act">' + (o.status === 'pending'
            ? '<button class="order-btn" data-paid="' + o.id + '">Tandai lunas</button>' +
              '<button class="order-btn ghost" data-cancel="' + o.id + '">Batal</button>'
            : '') + '</td></tr>';
      }).join('') + '</table></div></div>';
    v.querySelectorAll('[data-paid]').forEach(function (b) {
      b.addEventListener('click', function () {
        api('/api/admin/orders/' + b.dataset.paid + '/mark-paid', { method: 'POST' }).then(load);
      });
    });
    v.querySelectorAll('[data-cancel]').forEach(function (b) {
      b.addEventListener('click', function () {
        api('/api/admin/orders/' + b.dataset.cancel + '/cancel', { method: 'POST' }).then(load);
      });
    });
  }

  function renderUsers(list) {
    var v = document.getElementById('view');
    v.innerHTML = '<div class="panel"><h2>Semua pengguna</h2><div class="tbl-wrap"><table class="tbl">' +
      '<tr><th>ID</th><th>Nama</th><th>Email</th><th>Role</th><th>Credits</th><th>Key</th><th>Hits</th><th>Gabung</th><th></th></tr>' +
      list.map(function (u) {
        return '<tr><td>' + u.id + '</td>' +
          '<td>' + esc(u.name) + (u.is_admin ? ' <span class="pay-badge ok">ADMIN</span>' : '') + '</td>' +
          '<td>' + esc(u.email) + '</td>' +
          '<td><select class="role-sel" data-uid="' + u.id + '">' +
          ['free', 'vip', 'gars', 'vilions', 'verus'].map(function (r) {
            return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r.toUpperCase() + '</option>';
          }).join('') + '</select></td>' +
          '<td>' + fmtNum(u.credits) + '</td>' +
          '<td>' + u.keys + '</td>' +
          '<td>' + fmtNum(u.hits) + '</td>' +
          '<td>' + fmtDate(u.created_at) + '</td>' +
          '<td><button class="order-btn" data-save="' + u.id + '" data-role="' + u.role + '">Simpan</button></td></tr>';
      }).join('') + '</table></div></div>';
    v.querySelectorAll('.role-sel').forEach(function (s) {
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
        }).then(function (r) { if (r.res.ok) load(); });
      });
    });
  }

  function check() {
    api('/api/admin/overview').then(function (r) {
      if (!r.res.ok) {
        if (r.res.status === 403) return renderLogin('Akun ini bukan admin.');
        return renderLogin();
      }
      renderTabs();
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
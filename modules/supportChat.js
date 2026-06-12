// ============================================================================
//  Chat de soporte flotante — conectado al PANEL MAESTRO (Alcanzia)
//  Lee la licencia local (dropi_license_info.key) y usa los endpoints de
//  mensajes del panel. Aislado por la clave de licencia.
// ============================================================================
(function () {
  var API = 'https://api.alcanzia.co/api';
  var POLL_MS = 4000;
  var state = { key: '', open: false, messages: [], unread: 0 };
  var els = {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getLicenseKey() {
    return new Promise(function (res) {
      try {
        chrome.storage.local.get(['dropi_license_info'], function (d) {
          var info = d && d.dropi_license_info;
          res(info && info.key ? info.key : '');
        });
      } catch (e) { res(''); }
    });
  }

  function injectStyles() {
    var css = ''
      + '#alc-chat-btn{position:fixed;bottom:20px;right:20px;z-index:2147483647;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:Inter,system-ui,sans-serif;}'
      + '#alc-chat-btn .alc-badge{position:absolute;top:-2px;right:-2px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:#ef4444;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #0b3d28;}'
      + '#alc-chat-win{position:fixed;bottom:20px;right:20px;z-index:2147483647;width:340px;height:460px;max-height:calc(100vh - 40px);background:#15251a;border:1px solid #2a4636;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);font-family:Inter,system-ui,sans-serif;}'
      + '#alc-chat-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#0e3b28;border-bottom:1px solid #2a4636;}'
      + '#alc-chat-head .t{color:#fff;font-size:13px;font-weight:800;}'
      + '#alc-chat-head .s{color:#34d399;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;}'
      + '#alc-chat-head button{background:transparent;border:none;color:#9fb8ab;cursor:pointer;font-size:20px;line-height:1;}'
      + '#alc-chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;}'
      + '#alc-chat-msgs .empty{margin:auto;text-align:center;color:#9fb8ab;font-size:12px;padding:20px;}'
      + '.alc-row{display:flex;}.alc-row.me{justify-content:flex-end;}.alc-row.admin{justify-content:flex-start;}'
      + '.alc-bub{max-width:78%;padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.4;word-break:break-word;}'
      + '.alc-row.me .alc-bub{background:#16a34a;color:#fff;border-top-right-radius:4px;}'
      + '.alc-row.admin .alc-bub{background:#0e3b28;color:#fff;border-top-left-radius:4px;}'
      + '.alc-time{font-size:9px;margin-top:4px;text-align:right;opacity:.55;}'
      + '#alc-chat-form{display:flex;gap:8px;padding:10px;border-top:1px solid #2a4636;background:#15251a;}'
      + '#alc-chat-form input{flex:1;background:#0e3b28;border:1px solid #2a4636;border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;}'
      + '#alc-chat-form button{background:#16a34a;color:#fff;border:none;border-radius:10px;width:42px;cursor:pointer;font-size:18px;}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  function renderButton() {
    var b = document.createElement('button');
    b.id = 'alc-chat-btn';
    b.title = 'Chat de soporte';
    b.innerHTML = '💬' + (state.unread > 0 ? '<span class="alc-badge">' + state.unread + '</span>' : '');
    b.onclick = openChat;
    els.btn = b;
    document.body.appendChild(b);
  }
  function updateBadge() {
    if (els.btn) els.btn.innerHTML = '💬' + (state.unread > 0 ? '<span class="alc-badge">' + state.unread + '</span>' : '');
  }

  function openChat() {
    if (els.win) return;
    state.open = true;
    if (els.btn) { els.btn.remove(); els.btn = null; }
    var w = document.createElement('div');
    w.id = 'alc-chat-win';
    w.innerHTML = ''
      + '<div id="alc-chat-head"><div><div class="t">Soporte</div><div class="s">En línea</div></div><button title="Cerrar">&times;</button></div>'
      + '<div id="alc-chat-msgs"></div>'
      + '<form id="alc-chat-form"><input type="text" placeholder="Escribe un mensaje…" autocomplete="off"/><button type="submit">➤</button></form>';
    document.body.appendChild(w);
    els.win = w;
    els.msgs = w.querySelector('#alc-chat-msgs');
    w.querySelector('#alc-chat-head button').onclick = closeChat;
    w.querySelector('#alc-chat-form').onsubmit = onSend;
    renderMessages();
    if (state.unread > 0) markRead();
  }
  function closeChat() {
    if (els.win) { els.win.remove(); els.win = null; els.msgs = null; }
    state.open = false;
    renderButton();
  }

  function renderMessages() {
    if (!els.msgs) return;
    if (!state.messages.length) { els.msgs.innerHTML = '<div class="empty">Escríbenos, te ayudamos por aquí mismo.</div>'; return; }
    els.msgs.innerHTML = state.messages.map(function (m) {
      var mine = m.sender !== 'admin';
      var t = '';
      try { t = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (e) {}
      return '<div class="alc-row ' + (mine ? 'me' : 'admin') + '"><div class="alc-bub">' + esc(m.text) + '<div class="alc-time">' + t + '</div></div></div>';
    }).join('');
    els.msgs.scrollTop = els.msgs.scrollHeight;
  }

  function fetchMessages() {
    if (!state.key) return;
    fetch(API + '/messages/' + encodeURIComponent(state.key))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data)) return;
        state.messages = data;
        state.unread = data.filter(function (m) { return m.sender === 'admin' && !m.read; }).length;
        if (state.open) { renderMessages(); if (state.unread > 0) markRead(); }
        else { updateBadge(); if (state.unread > 0) openChat(); }
      }).catch(function () {});
  }
  function markRead() {
    fetch(API + '/messages/mark-read', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: state.key, senderToMark: 'admin' })
    }).then(function () { state.unread = 0; }).catch(function () {});
  }
  function onSend(e) {
    e.preventDefault();
    var input = els.win.querySelector('#alc-chat-form input');
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    state.messages.push({ key: state.key, text: text, sender: 'me', timestamp: new Date().toISOString(), read: false });
    renderMessages();
    fetch(API + '/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: state.key, text: text, sender: 'me' })
    }).then(fetchMessages).catch(function () {});
  }

  function start(key) {
    if (els.started) return;
    els.started = true;
    state.key = key;
    injectStyles();
    renderButton();
    fetchMessages();
    setInterval(fetchMessages, POLL_MS);
  }

  function boot() {
    if (!document.body) { setTimeout(boot, 500); return; }
    getLicenseKey().then(function (key) {
      if (key) { start(key); return; }
      try {
        chrome.storage.onChanged.addListener(function (changes, area) {
          if (area === 'local' && changes.dropi_license_info) {
            var info = changes.dropi_license_info.newValue;
            if (info && info.key) start(info.key);
          }
        });
      } catch (e) {}
    });
  }

  boot();
})();

// Tahta fotoğrafları herkese bulanık görünür. Asılları boards/*.enc dosyalarında şifreli durur;
// doğru şifre girilince bu tarayıcı anahtarı hatırlar ve fotoğrafları çözüp yerine koyar.
// Şifreleme aracı: tools/tahta.py
(function () {
  var S = document.currentScript;
  var BASE = S ? S.src : location.href;
  var STORE = 'kbm-tahta-anahtar';
  var imgs = Array.prototype.slice.call(document.querySelectorAll('img[src*="boards/"]'));
  if (!imgs.length || !window.crypto || !crypto.subtle || !window.fetch) return;

  var en = /^en/i.test(document.documentElement.lang || '');
  var T = en
    ? { open: 'Unlock boards', lock: 'Lock boards', note: 'Board photos are blurred', pw: 'Password', go: 'Open', wrong: 'Wrong password', busy: 'Opening…', fail: 'Could not open' }
    : { open: 'Tahtaları aç', lock: 'Tahtaları kilitle', note: 'Tahta fotoğrafları bulanık', pw: 'Şifre', go: 'Aç', wrong: 'Şifre yanlış', busy: 'Açılıyor…', fail: 'Açılamadı' };

  function bytes(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function str(u) { var s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  function aes(raw) { return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']); }

  function unwrap(pw) {
    return fetch(new URL('tahta-kilit.json', BASE)).then(function (r) { return r.json(); }).then(function (j) {
      return crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (pk) {
        return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: bytes(j.salt), iterations: j.iter },
          pk, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      }).then(function (wk) {
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(j.iv) }, wk, bytes(j.ct));
      }).then(function (raw) { return new Uint8Array(raw); });
    });
  }

  // Aynı dosya sayfada birkaç kez geçebilir; her biri bir kez indirilip çözülür.
  function reveal(raw) {
    return aes(raw).then(function (key) {
      var cache = {};
      function open(path) {
        if (!cache[path]) {
          cache[path] = fetch(path + '.enc').then(function (r) {
            if (!r.ok) throw new Error(r.status);
            return r.arrayBuffer();
          }).then(function (buf) {
            return crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(buf, 0, 12) }, key, new Uint8Array(buf, 12));
          }).then(function (plain) {
            return URL.createObjectURL(new Blob([plain], { type: 'image/jpeg' }));
          });
        }
        return cache[path];
      }
      return Promise.all(imgs.map(function (img) {
        var full = img.getAttribute('data-full');   // büyütünce açılan daha geniş fotoğraf (602 Hafta 8)
        return Promise.all([
          open(img.getAttribute('src')).then(function (u) { img.src = u; img.setAttribute('data-tahta', 'acik'); }),
          full && /boards\//.test(full) ? open(full).then(function (u) { img.setAttribute('data-full', u); }) : null
        ]);
      }));
    });
  }

  var css = document.createElement('style');
  css.textContent =
    '.kbm-tahta{position:fixed;z-index:60;left:max(12px,env(safe-area-inset-left,0px));bottom:max(12px,env(safe-area-inset-bottom,0px));' +
    'font:500 13px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1d2530;background:rgba(255,255,255,.94);' +
    'border:1px solid rgba(29,37,48,.18);border-radius:999px;box-shadow:0 2px 10px rgba(0,0,0,.12);display:flex;align-items:center;gap:6px;padding:4px}' +
    '.kbm-tahta button{font:inherit;color:inherit;background:transparent;border:0;border-radius:999px;padding:6px 10px;min-height:32px;cursor:pointer}' +
    '.kbm-tahta button.go{background:#1f46a3;color:#fff}' +
    '.kbm-tahta input{font:inherit;width:9.5em;min-height:30px;padding:4px 10px;border:1px solid rgba(29,37,48,.25);border-radius:999px;background:#fff;color:#1d2530}' +
    '.kbm-tahta .msg{padding:0 6px;color:#b3322a}' +
    '@media print{.kbm-tahta{display:none}}';
  document.head.appendChild(css);

  var box = document.createElement('form');
  box.className = 'kbm-tahta';
  box.setAttribute('aria-label', T.note);
  document.body.appendChild(box);

  function closed() {
    box.innerHTML = '';
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = '🔒 ' + T.open;
    b.title = T.note;
    b.onclick = asking;
    box.appendChild(b);
  }
  function asking() {
    box.innerHTML = '<input type="password" autocomplete="current-password" required>' +
      '<button class="go" type="submit"></button><span class="msg" role="status"></span>';
    var i = box.querySelector('input');
    i.setAttribute('aria-label', T.pw);
    i.placeholder = T.pw;
    box.querySelector('.go').textContent = T.go;
    i.focus();
  }
  function opened() {
    box.innerHTML = '';
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = '🔓';
    b.title = T.lock;
    b.setAttribute('aria-label', T.lock);
    b.onclick = function () { try { localStorage.removeItem(STORE); } catch (e) {} location.reload(); };
    box.appendChild(b);
  }

  box.addEventListener('submit', function (e) {
    e.preventDefault();
    var i = box.querySelector('input'), m = box.querySelector('.msg'), go = box.querySelector('.go');
    if (!i) return;
    go.disabled = true;
    m.textContent = T.busy;
    unwrap(i.value).then(function (raw) {
      return reveal(raw).then(function () {
        try { localStorage.setItem(STORE, str(raw)); } catch (e2) {}
        opened();
      });
    }).catch(function (err) {
      go.disabled = false;
      m.textContent = err && err.name === 'OperationError' ? T.wrong : T.fail;
      i.select();
    });
  });

  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (e) {}
  if (saved) {
    opened();
    reveal(bytes(saved)).catch(function () {
      try { localStorage.removeItem(STORE); } catch (e) {}
      closed();
    });
  } else {
    closed();
  }
})();

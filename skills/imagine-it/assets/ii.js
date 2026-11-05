/* imagine-it: mockup toolbar, states, notes overlay. Vanilla, file:// safe. Copy verbatim. */
(function () {
  var d = document, h = d.documentElement;
  function meta(n) { var m = d.querySelector('meta[name="' + n + '"]'); return m ? m.content : ''; }
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function link(href, txt) { var a = el('a', '', txt); a.href = href; return a; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  var bar = el('nav', 'ii-bar'); bar.setAttribute('aria-label', 'Mockup navigation');
  var idx = meta('ii-index') || 'index.html', prev = meta('ii-prev'), next = meta('ii-next');
  bar.appendChild(link(idx, 'All screens'));
  if (prev) bar.appendChild(link(prev, '← Prev'));
  bar.appendChild(el('span', 'ii-title', d.title));
  if (next) bar.appendChild(link(next, 'Next →'));

  // Notes: pins are numbered per active state (see renumber)
  var pins = [];
  [].slice.call(d.querySelectorAll('[data-note]')).forEach(function (n) {
    var p = el('button', 'ii-pin'); p.type = 'button'; p.setAttribute('data-tip', n.getAttribute('data-note'));
    if (getComputedStyle(n).position === 'static') n.style.position = 'relative';
    n.appendChild(p); pins.push({ n: n, p: p });
  });
  function renumber() {
    var i = 0;
    pins.forEach(function (o) {
      var s = o.n.closest('section[data-state]');
      if (s && !s.classList.contains('ii-active')) return;
      i++; o.p.textContent = String(i);
      o.p.setAttribute('aria-label', 'Note ' + i + ': ' + o.p.getAttribute('data-tip'));
    });
  }

  // States: only section[data-state]; first one is the initial state
  var secs = [].slice.call(d.querySelectorAll('section[data-state]')), names = [], sel = null;
  secs.forEach(function (s) { if (names.indexOf(s.dataset.state) < 0) names.push(s.dataset.state); });
  function setState(v) {
    h.dataset.activeState = v;
    secs.forEach(function (s) { s.classList.toggle('ii-active', s.dataset.state === v); });
    if (sel) sel.value = v;
    renumber();
  }
  function fromHash() {
    var m = /state=([^&]+)/.exec(location.hash), w = m ? decodeURIComponent(m[1]) : '';
    setState(names.indexOf(w) >= 0 ? w : names[0]);
  }
  if (names.length) {
    sel = el('select'); sel.setAttribute('aria-label', 'Screen state');
    names.forEach(function (n) { var o = el('option', '', n); o.value = n; sel.appendChild(o); });
    sel.onchange = function () {
      setState(sel.value);
      try { history.replaceState(null, '', '#state=' + sel.value); } catch (e) {}
    };
    bar.appendChild(sel);
    fromHash();
    addEventListener('hashchange', fromHash);
    d.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-ii-state]');
      if (t && names.indexOf(t.getAttribute('data-ii-state')) >= 0) setState(t.getAttribute('data-ii-state'));
    });
  } else renumber();

  var nb = el('button', '', 'Notes'); nb.type = 'button';
  function setNotes(on) {
    h.classList.toggle('ii-notes-on', on); nb.setAttribute('aria-pressed', String(on)); store('ii-notes', on ? '1' : '0');
  }
  nb.onclick = function () { setNotes(!h.classList.contains('ii-notes-on')); };
  bar.appendChild(nb);
  setNotes(store('ii-notes') === '1');
  d.addEventListener('keydown', function (e) {
    var t = e.target.tagName;
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test(t) && !e.target.isContentEditable) nb.click();
  });

  // Theme (persisted)
  if (h.hasAttribute('data-has-dark')) {
    var saved = store('ii-theme'); if (saved) h.setAttribute('data-theme', saved);
    var tb = el('button', '', 'Theme'); tb.type = 'button';
    tb.onclick = function () {
      var t = h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      h.setAttribute('data-theme', t); store('ii-theme', t);
    };
    bar.appendChild(tb);
  }
  d.body.appendChild(bar); d.body.classList.add('ii-has-bar');
})();

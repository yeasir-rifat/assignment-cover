// Mobile settings panel: Sub Heading, Heading and Student & Teachers Info become dropdowns
(function () {
  function init() {
    var titles = ['Sub Heading', 'Heading', 'Student & Teachers Info'];
    document.querySelectorAll('#settingsPanel .style-group').forEach(function (g) {
      var t = g.querySelector(':scope > .style-group-title');
      if (!t || titles.indexOf(t.textContent.trim()) === -1) return;
      var body = document.createElement('div');
      body.className = 'style-group-body';
      var inner = document.createElement('div');
      inner.className = 'style-group-inner';
      var content = document.createElement('div');
      content.className = 'style-group-content';
      while (t.nextSibling) content.appendChild(t.nextSibling);
      inner.appendChild(content);
      body.appendChild(inner);
      g.appendChild(body);
      body.addEventListener('transitionend', function (e) {
        if (e.target === body && e.propertyName === 'grid-template-rows' && g.classList.contains('open')) body.classList.add('settled');
      });
      g.classList.add('collapsible');
      t.setAttribute('role', 'button');
      t.setAttribute('tabindex', '0');
      t.setAttribute('aria-expanded', 'false');
      function toggle() {
        var open = g.classList.toggle('open');
        if (!open) body.classList.remove('settled');
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      t.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 960px)').matches) toggle();
      });
      t.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && window.matchMedia('(max-width: 960px)').matches) { e.preventDefault(); toggle(); }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Custom dropdown: replaces every native <select> (the select stays in the DOM, hidden, as the source of truth)
(function () {
  var openInst = null;
  var valDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  var idxDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
  var CHECK = '<svg aria-hidden="true" focusable="false" class="cdd-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function enhance(sel) {
    if (sel.dataset.cdd) return;
    sel.dataset.cdd = '1';
    var host = sel.closest('.form-group, .style-field');
    var lab = host && host.querySelector('.form-label, .style-label');
    var labelText = lab ? lab.textContent.replace(/\(optional\)/i, '').trim() : 'Select';

    var wrap = document.createElement('div');
    wrap.className = 'cdd' + (sel.classList.contains('style-select') ? ' cdd-sm' : '');
    var trig = document.createElement('button');
    trig.type = 'button';
    trig.className = 'cdd-trigger';
    trig.setAttribute('aria-haspopup', 'listbox');
    trig.setAttribute('aria-expanded', 'false');
    trig.setAttribute('aria-label', labelText);
    trig.innerHTML = '<span class="cdd-value"></span><span class="cdd-chevron"></span>';
    var valEl = trig.firstChild;
    wrap.appendChild(trig);
    sel.classList.add('cdd-native');
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    var menu = document.createElement('div');
    menu.className = 'cdd-menu';
    menu.setAttribute('role', 'listbox');
    document.body.appendChild(menu);

    var inst = { sel: sel, wrap: wrap, trig: trig, menu: menu, items: [], active: -1 };

    function build() {
      menu.innerHTML = '';
      inst.items = [];
      var isFont = sel.dataset.prop === 'family';
      Array.prototype.forEach.call(sel.options, function (o, i) {
        var d = document.createElement('div');
        d.className = 'cdd-opt' + (o.value === '' ? ' is-placeholder' : '');
        d.setAttribute('role', 'option');
        d.dataset.i = i;
        if (isFont && o.value) d.style.fontFamily = o.value;
        d.innerHTML = '<span></span>' + CHECK;
        d.firstChild.textContent = o.textContent;
        d.addEventListener('mousemove', function () { setActive(i, false); });
        d.addEventListener('click', function (e) { e.stopPropagation(); choose(i); });
        menu.appendChild(d);
        inst.items.push(d);
      });
      sync();
    }
    var pending = '';
    function firstFam(v) { return String(v || '').split(',')[0].trim().toLowerCase(); }
    function sync() {
      var i = idxDesc.get.call(sel);
      // A value set from code that matches no option exactly (e.g. a font stack): fall back to the same first font name
      if (i < 0 && !pending && sel.dataset.target && sel.dataset.prop) {
        try { pending = coverStyle[sel.dataset.target][sel.dataset.prop] || ''; } catch (e) {}
      }
      if (i < 0 && pending) {
        for (var q = 0; q < sel.options.length; q++) { if (firstFam(sel.options[q].value) === firstFam(pending)) { i = q; break; } }
      }
      var o = sel.options[i];
      valEl.textContent = o ? o.textContent : '';
      valEl.classList.toggle('placeholder', !o || o.value === '');
      if (sel.dataset.prop === 'family' && o && o.value) valEl.style.fontFamily = o.value; else valEl.style.fontFamily = '';
      inst.items.forEach(function (d, k) {
        var on = k === i;
        d.classList.toggle('selected', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    function setActive(i, scroll) {
      if (i < 0 || i >= inst.items.length) return;
      if (inst.active >= 0 && inst.items[inst.active]) inst.items[inst.active].classList.remove('active');
      inst.active = i;
      var d = inst.items[i];
      d.classList.add('active');
      if (scroll) { var top = d.offsetTop, bot = top + d.offsetHeight; if (top < menu.scrollTop) menu.scrollTop = top - 4; else if (bot > menu.scrollTop + menu.clientHeight) menu.scrollTop = bot - menu.clientHeight + 4; }
    }
    function choose(i) {
      var changed = idxDesc.get.call(sel) !== i;
      pending = '';
      idxDesc.set.call(sel, i);
      sync();
      close();
      trig.focus({ preventScroll: true });
      if (changed) {
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    function place() {
      var r = trig.getBoundingClientRect();
      var vh = window.innerHeight;
      var below = vh - r.bottom - 10, above = r.top - 10;
      menu.style.maxHeight = 'none';
      var natural = Math.min(menu.scrollHeight + 2, 280);
      var up = below < natural && above > below;
      var avail = Math.max(120, Math.min(280, up ? above : below));
      menu.style.maxHeight = avail + 'px';
      menu.style.width = r.width + 'px';
      menu.style.left = Math.max(6, Math.min(r.left, window.innerWidth - r.width - 6)) + 'px';
      if (up) { menu.style.top = 'auto'; menu.style.bottom = (vh - r.top + 4) + 'px'; }
      else { menu.style.bottom = 'auto'; menu.style.top = (r.bottom + 4) + 'px'; }
      menu.classList.toggle('up', up);
    }
    function open() {
      if (openInst && openInst !== inst) openInst.close();
      openInst = inst;
      place();
      wrap.classList.add('open');
      trig.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      var si = inst.items.findIndex(function (d) { return d.classList.contains('selected'); });
      setActive(si >= 0 ? si : 0, true);
    }
    function close() {
      if (openInst === inst) openInst = null;
      wrap.classList.remove('open');
      trig.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }
    inst.open = open; inst.close = close; inst.place = place;

    trig.addEventListener('click', function (e) { e.stopPropagation(); wrap.classList.contains('open') ? close() : open(); });
    trig.addEventListener('keydown', function (e) {
      var isOpen = wrap.classList.contains('open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) { open(); return; }
        setActive(Math.max(0, Math.min(inst.items.length - 1, inst.active + (e.key === 'ArrowDown' ? 1 : -1))), true);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) open(); else if (inst.active >= 0) choose(inst.active);
      } else if (e.key === 'Escape') {
        if (isOpen) { e.preventDefault(); e.stopPropagation(); close(); }
      } else if (e.key === 'Tab') {
        close();
      } else if (e.key === 'Home' && isOpen) { e.preventDefault(); setActive(0, true); }
      else if (e.key === 'End' && isOpen) { e.preventDefault(); setActive(inst.items.length - 1, true); }
      else if (e.key.length === 1 && /\S/.test(e.key)) {
        var ch = e.key.toLowerCase();
        for (var k = 1; k <= inst.items.length; k++) {
          var j = ((inst.active < 0 ? -1 : inst.active) + k) % inst.items.length;
          if (sel.options[j].textContent.trim().toLowerCase().indexOf(ch) === 0) { if (!isOpen) open(); setActive(j, true); break; }
        }
      }
    });

    // Keep the custom UI in sync when code sets the value directly
    Object.defineProperty(sel, 'value', { configurable: true, get: function () { return valDesc.get.call(sel); }, set: function (v) { pending = v; valDesc.set.call(sel, v); sync(); } });
    Object.defineProperty(sel, 'selectedIndex', { configurable: true, get: function () { return idxDesc.get.call(sel); }, set: function (v) { idxDesc.set.call(sel, v); sync(); } });
    new MutationObserver(build).observe(sel, { childList: true });
    sel.addEventListener('change', sync);
    build();
  }

  document.addEventListener('click', function (e) {
    if (openInst && !openInst.menu.contains(e.target) && !openInst.wrap.contains(e.target)) openInst.close();
  });
  window.addEventListener('resize', function () { if (openInst) openInst.close(); });
  window.addEventListener('scroll', function (e) {
    if (!openInst || openInst.menu.contains(e.target)) return;
    var r = openInst.trig.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) openInst.close(); else openInst.place();
  }, true);

  function init() { document.querySelectorAll('select').forEach(enhance); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Keep the sticky tabs exactly below the (variable height) top bar
(function () {
  function setH() {
    var t = document.querySelector('.topbar');
    if (t) document.documentElement.style.setProperty('--topbar-h', t.getBoundingClientRect().height + 'px');
  }
  setH();
  window.addEventListener('resize', setH);
  window.addEventListener('load', setH);
  if (window.ResizeObserver) { var t = document.querySelector('.topbar'); if (t) new ResizeObserver(setH).observe(t); }
})();

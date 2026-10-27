// ── Constants ──
const UNIV_NAME = 'Gazipur Agricultural University';
const UNIV_ADDR = 'Salna, Gazipur-1706';

// ── Lazy loading: PDF libraries and the optional fonts load only when needed ──
const H2C_URL = ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'];
const JSPDF_URL = ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'];
const EXTRA_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Lexend:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&family=PT+Serif:wght@400;700&display=swap';

function loadScript(src) {
  // Accepts one URL or a list of mirrors; tries each in order until one loads
  const urls = Array.isArray(src) ? src : [src];
  return urls.reduce((chain, url) => chain.catch(() => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = url; el.async = true;
    el.onload = resolve;
    el.onerror = () => { el.remove(); reject(new Error('Failed to load ' + url)); };
    document.head.appendChild(el);
  })), Promise.reject(new Error('start')));
}

let _pdfLibsPromise = null;
function ensurePdfLibs() {
  if (window.html2canvas && window.jspdf) return Promise.resolve();
  if (!_pdfLibsPromise) {
    _pdfLibsPromise = Promise.all([
      window.html2canvas ? null : loadScript(H2C_URL),
      window.jspdf ? null : loadScript(JSPDF_URL)
    ]).catch(() => {
      _pdfLibsPromise = null;
      throw new Error('Couldn\'t load PDF tools. Check connection.');
    });
  }
  return _pdfLibsPromise;
}
// Warm up quietly after the page is idle so the first download is instant
window.addEventListener('load', () => setTimeout(() => { ensurePdfLibs().catch(() => {}); }, 1500));

let _extraFontsPromise = null;
function loadExtraFonts() {
  if (!_extraFontsPromise) {
    _extraFontsPromise = new Promise(resolve => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = EXTRA_FONTS_URL;
      l.onload = () => resolve(); l.onerror = () => resolve();
      document.head.appendChild(l);
    });
  }
  return _extraFontsPromise;
}
// Classic / Futuristic use DM Sans + PT Serif; any non-default font or weight needs the full set
function needsExtraFonts() {
  if (coverLayout !== 'modern') return true;
  return ['pretitle', 'heading', 'info'].some(k =>
    coverStyle[k].family !== DEFAULT_COVER_STYLE[k].family || String(coverStyle[k].weight) !== String(DEFAULT_COVER_STYLE[k].weight));
}
const LOGO_PATH = 'data:image/png;base64,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';

// ── Cover style customization (Settings panel) ──
const FONT_OPTIONS = [
  { label: 'Calibri',    value: "'Calibri', 'Carlito', sans-serif" },
  { label: 'Inter',      value: "'Inter', sans-serif" },
  { label: 'Lato',       value: "'Lato', sans-serif" },
  { label: 'Lexend',     value: "'Lexend', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'DM Sans',    value: "'DM Sans', sans-serif" },
  { label: 'PT Serif',   value: "'PT Serif', serif" }
];

const WEIGHT_OPTIONS = [
  { label: 'Light',    value: '300' },
  { label: 'Regular',  value: '400' },
  { label: 'Medium',   value: '500' },
  { label: 'Semi Bold',value: '600' },
  { label: 'Bold',     value: '700' },
  { label: 'Extra Bold', value: '800' }
];

// Font-size dropdown options, tuned per group (sub heading / heading / info box).
const SIZE_OPTIONS = {
  pretitle: [12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36],
  heading:  [20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 72],
  info:     [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24]
};

// Sample color swatches shown in every color picker popover.
// First entry mirrors the site's teal theme accent; rest cover common cover-page colors.
const SAMPLE_COLORS = [
  { label: 'Theme Accent', value: '#166b5e' },
  { label: 'White',        value: '#ffffff' },
  { label: 'Black',        value: '#000000' },
  { label: 'Dark Green',   value: '#116734' },
  { label: 'Green',        value: '#2c7a6e' },
  { label: 'Brown',        value: '#7a4a2c' },
  { label: 'Navy',         value: '#0d2b59' },
  { label: 'Maroon',       value: '#6e1f2b' },
  { label: 'Charcoal',     value: '#2b2b2b' },
  { label: 'Slate Grey',   value: '#4d5b5a' },
  { label: 'Gold',         value: '#c88f2f' },
  { label: 'Deep Purple',  value: '#4a2c6e' }
];

const DEFAULT_COVER_STYLE = {
  pretitle: { family: "'Calibri', 'Carlito', sans-serif",         size: 24, weight: '600', color: '#2c7a6e' },
  heading:  { family: "'Calibri', 'Carlito', 'Inter', sans-serif", size: 36, weight: '800', color: '#0d3b3a' },
  info:     { family: "'Inter', sans-serif",            size: 16, weight: '500', color: '#2c7a6e' }
};

// Working copy of the current style (mutated by the settings panel).
let coverStyle = JSON.parse(JSON.stringify(DEFAULT_COVER_STYLE));

// Currently selected cover PDF layout: 'modern' | 'classic' | 'futuristic'
let coverLayout = 'modern';

function populateStyleSelects() {
  document.querySelectorAll('.style-select[data-prop="family"]').forEach(sel => {
    sel.innerHTML = FONT_OPTIONS.map(f => `<option value="${f.value}">${f.label}</option>`).join('');
  });
  document.querySelectorAll('.style-select[data-prop="weight"]').forEach(sel => {
    sel.innerHTML = WEIGHT_OPTIONS.map(w => `<option value="${w.value}">${w.label}</option>`).join('');
  });
  document.querySelectorAll('.style-select[data-prop="size"]').forEach(sel => {
    const target = sel.dataset.target;
    const sizes = SIZE_OPTIONS[target] || SIZE_OPTIONS.info;
    sel.innerHTML = sizes.map(s => `<option value="${s}">${s}px</option>`).join('');
  });
  buildColorPickers();
}

function buildColorPickers() {
  document.querySelectorAll('.color-picker').forEach(picker => {
    const popover = picker.querySelector('[data-color-popover]');
    popover.innerHTML = `
      <button type="button" class="color-auto-btn" data-auto-color>Auto (Match BG)</button>
      <div class="color-popover-label">Sample Colors</div>
      <div class="color-swatch-grid">
        ${SAMPLE_COLORS.map(c => `
          <button type="button" class="color-swatch-btn${c.value === '#ffffff' ? ' swatch-white' : ''}"
            style="background:${c.value};" data-swatch-value="${c.value}" title="${c.label}" aria-label="${c.label}"></button>
        `).join('')}
      </div>
      <div class="color-popover-label">Custom</div>
      <div class="color-popover-custom">
        <input type="color" data-custom-color>
        <input type="text" data-custom-hex maxlength="7" placeholder="#000000">
      </div>
    `;

    // Sample swatch click
    popover.querySelectorAll('[data-swatch-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = picker.dataset.target, prop = picker.dataset.prop;
        coverStyle[target][prop] = btn.dataset.swatchValue;
        autoColor[target] = false;
        syncStyleControlsFromState();
        schedulePreview();
        closeAllColorPickers();
      });
    });

    popover.querySelector('[data-auto-color]').addEventListener('click', () => {
      autoColor[picker.dataset.target] = true;
      syncStyleControlsFromState();
      schedulePreview();
      closeAllColorPickers();
    });

    // Custom color input (native picker) and hex text field, kept in sync
    const customColor = popover.querySelector('[data-custom-color]');
    const customHex = popover.querySelector('[data-custom-hex]');
    customColor.addEventListener('input', () => {
      const target = picker.dataset.target, prop = picker.dataset.prop;
      coverStyle[target][prop] = customColor.value;
      autoColor[target] = false;
      customHex.value = customColor.value;
      updateColorTrigger(picker);
      schedulePreview();
    });
    customHex.addEventListener('input', () => {
      const val = customHex.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        const target = picker.dataset.target, prop = picker.dataset.prop;
        coverStyle[target][prop] = val;
        autoColor[target] = false;
        customColor.value = val;
        updateColorTrigger(picker);
        schedulePreview();
      }
    });

    // Toggle popover open/close
    const trigger = picker.querySelector('[data-color-trigger]');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = picker.classList.contains('open');
      closeAllColorPickers();
      if (!isOpen) picker.classList.add('open');
    });
    popover.addEventListener('click', (e) => e.stopPropagation());
  });

  document.addEventListener('click', closeAllColorPickers);
}

function closeAllColorPickers() {
  document.querySelectorAll('.color-picker.open').forEach(p => p.classList.remove('open'));
}

function updateColorTrigger(picker) {
  const target = picker.dataset.target, prop = picker.dataset.prop;
  const isAuto = !!currentPalette() && autoColor[target];
  const val = isAuto ? effectiveColor(target) : coverStyle[target][prop];
  picker.querySelector('.color-swatch-dot').style.background = val;
  picker.querySelector('.color-picker-value').textContent = isAuto ? val + ' · Auto' : val;
  const autoBtn = picker.querySelector('[data-auto-color]');
  if (autoBtn) autoBtn.classList.toggle('selected', autoColor[target]);
  picker.querySelectorAll('[data-swatch-value]').forEach(btn => {
    btn.classList.toggle('selected', !isAuto && btn.dataset.swatchValue.toLowerCase() === val.toLowerCase());
  });
  const customColor = picker.querySelector('[data-custom-color]');
  const customHex = picker.querySelector('[data-custom-hex]');
  if (customColor) customColor.value = val;
  if (customHex && document.activeElement !== customHex) customHex.value = val;
}

function syncStyleControlsFromState() {
  document.querySelectorAll('select[data-target][data-prop]').forEach(el => {
    const target = el.dataset.target;
    const prop = el.dataset.prop;
    el.value = coverStyle[target][prop];
  });
  document.querySelectorAll('.color-picker').forEach(picker => updateColorTrigger(picker));
}

function bindStyleControls() {
  document.querySelectorAll('select[data-target][data-prop]').forEach(el => {
    el.addEventListener('change', () => {
      const target = el.dataset.target;
      const prop = el.dataset.prop;
      let val = el.value;
      if (prop === 'size') val = parseInt(val, 10) || DEFAULT_COVER_STYLE[target].size;
      coverStyle[target][prop] = val;
      schedulePreview();
    });
  });
}

function applyCoverStyleVars(rootEl) {
  const s = coverStyle;
  rootEl.style.setProperty('--pretitle-family', s.pretitle.family);
  rootEl.style.setProperty('--pretitle-size', s.pretitle.size + 'px');
  rootEl.style.setProperty('--pretitle-weight', s.pretitle.weight);
  rootEl.style.setProperty('--pretitle-color', effectiveColor('pretitle'));
  rootEl.style.setProperty('--heading-family', s.heading.family);
  rootEl.style.setProperty('--heading-size', s.heading.size + 'px');
  rootEl.style.setProperty('--heading-weight', s.heading.weight);
  rootEl.style.setProperty('--heading-color', effectiveColor('heading'));
  rootEl.style.setProperty('--info-family', s.info.family);
  rootEl.style.setProperty('--info-size', s.info.size + 'px');
  rootEl.style.setProperty('--info-weight', s.info.weight);
  rootEl.style.setProperty('--info-color', effectiveColor('info'));
  const pal = currentPalette();
  ['--badge-bg', '--badge-fg'].forEach(v => rootEl.style.removeProperty(v));
  if (pal) {
    rootEl.style.setProperty('--badge-bg', pal.badgeBg);
    rootEl.style.setProperty('--badge-fg', pal.badgeFg);
  }
}


// ── Auto-fit: if the content is taller than the A4 page, scale type and gaps down until it fits ──
function _contentEl(root) { return root.querySelector('.cover-content, .c-content, .f-content'); }
function _setFit(root, f) {
  root.style.setProperty('--fit', f);
  root.style.setProperty('--pretitle-size', (coverStyle.pretitle.size * f) + 'px');
  root.style.setProperty('--heading-size', (coverStyle.heading.size * f) + 'px');
  root.style.setProperty('--info-size', (coverStyle.info.size * f) + 'px');
}
function _coverOverflows(root) {
  const content = _contentEl(root);
  if (!content || !content.clientHeight) return false; // hidden → nothing to measure yet
  if (content.scrollHeight > content.clientHeight + 1) return true;
  const footer = content.lastElementChild, prev = footer && footer.previousElementSibling;
  if (footer && prev) {
    const k = root.getBoundingClientRect().width / root.offsetWidth || 1;
    if ((footer.getBoundingClientRect().top - prev.getBoundingClientRect().bottom) / k < 24) return true;
  }
  return false;
}
function fitCover(root) {
  if (!root) return;
  let f = 1;
  _setFit(root, f);
  while (_coverOverflows(root) && f > 0.55) { f = Math.round((f - 0.04) * 100) / 100; _setFit(root, f); }
}

function openSettingsPanel() {
  loadExtraFonts(); // the font dropdown previews each font in its own face
  const panel = document.getElementById('settingsPanel');
  panel.inert = false;
  panel.classList.add('open');
  document.getElementById('settingsOverlay').classList.add('open');
  const c = document.getElementById('settingsCloseBtn');
  if (c) setTimeout(() => c.focus({ preventScroll: true }), 50);
}
// On desktop (>=1280px) the settings panel is always visible, so it must never be inert
const _deskMQ = window.matchMedia('(min-width: 1280px)');
function syncSettingsInert() {
  const p = document.getElementById('settingsPanel');
  if (!p) return;
  if (_deskMQ.matches) p.inert = false;
  else if (!p.classList.contains('open')) p.inert = true;
}
if (_deskMQ.addEventListener) _deskMQ.addEventListener('change', syncSettingsInert);
else if (_deskMQ.addListener) _deskMQ.addListener(syncSettingsInert);
syncSettingsInert();

function closeSettingsPanel() {
  const panel = document.getElementById('settingsPanel');
  const wasOpen = panel.classList.contains('open');
  panel.classList.remove('open');
  panel.inert = !_deskMQ.matches;
  document.getElementById('settingsOverlay').classList.remove('open');
  if (wasOpen) { const b = document.getElementById('settingsBtn'); if (b) b.focus({ preventScroll: true }); }
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('settingsPanel').classList.contains('open')) closeSettingsPanel();
});

const BG_LIST = [
  'images/bg-image-12.png',
  'images/bg-image-13.png',
  'images/bg-image-14.png',
  'images/bg-image-15.png',
  'images/bg-image-16.png',
  'images/bg-image-17.png',
  'images/bg-image-18.png',
  'images/bg-image-19.png',
  'images/bg-image-20.png',
  'images/bg-image-21.png',
  'images/bg-image-22.png',
  'images/bg-image-23.png',
  'images/bg-image-24.png',
  'images/bg-image-26.png',
  'images/bg-image-27.png',
  'images/bg-image-28.png',
  'images/bg-image-30.png',
  'images/bg-image-31.png',
  'images/bg-image-33.png',
  'images/bg-image-34.png',
  'images/bg-image-35.png',
  'images/bg-image-36.png',
  'images/bg-image-37.png',
  'images/bg-image-38.png',
  'images/bg-image-39.png',
  'images/bg-image-40.png',
  'images/bg-image-41.png',
  'images/bg-image-43.png',
  'images/bg-image-44.png',
  'images/bg-image-45.png',
  'images/bg-image-46.png',
  'images/bg-image-47.png'
];


// ── Auto accent colour (Modern layout) ──
// Samples the current background image and derives text / badge colours from its dominant hue.
// A colour the person picks by hand in Settings always wins over the automatic one.
const accentCache = {};
let autoColor = { pretitle: true, heading: true, info: true };

function _hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}

function _paletteFromHue(h, sat, lum) {
  const s0 = Math.max(0.38, Math.min(0.8, sat * 1.15));
  if (lum >= 0.45) {
    return {
      pretitle: _hslToHex(h, s0, 0.33),
      heading:  _hslToHex(h, s0 * 0.85, 0.17),
      info:     _hslToHex(h, s0 * 0.85, 0.25),
      badgeBg:  _hslToHex(h, s0, 0.30),
      badgeFg:  '#ffffff',
      uni:      _hslToHex(h, s0 * 0.9, 0.22)
    };
  }
  // dark background: light text, light badge with dark label
  return {
    pretitle: _hslToHex(h, s0, 0.82),
    heading:  _hslToHex(h, s0 * 0.6, 0.96),
    info:     _hslToHex(h, s0 * 0.6, 0.90),
    badgeBg:  _hslToHex(h, s0, 0.88),
    badgeFg:  _hslToHex(h, s0, 0.15),
    uni:      _hslToHex(h, s0 * 0.6, 0.92)
  };
}

function extractAccent(src) {
  return new Promise(resolve => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onerror = () => resolve(null);
    im.onload = () => {
      try {
        const N = 64;
        const cv = document.createElement('canvas');
        cv.width = cv.height = N;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(im, 0, 0, N, N);
        const d = ctx.getImageData(0, 0, N, N).data;
        const B = 24, sx = new Array(B).fill(0), sy = new Array(B).fill(0), ws = new Array(B).fill(0), ss = new Array(B).fill(0);
        let lumSum = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) {
          // the cover shows the image at 75% opacity over white
          const a = (d[i + 3] / 255) * 0.75;
          const r = (d[i] * a + 255 * (1 - a)) / 255, g = (d[i + 1] * a + 255 * (1 - a)) / 255, b = (d[i + 2] * a + 255 * (1 - a)) / 255;
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dl = mx - mn;
          lumSum += l; n++;
          if (dl < 0.04) continue;
          const sat = dl / (1 - Math.abs(2 * l - 1) || 1);
          if (sat < 0.12) continue;
          let h = mx === r ? ((g - b) / dl) % 6 : mx === g ? (b - r) / dl + 2 : (r - g) / dl + 4;
          h = ((h * 60) + 360) % 360;
          const w = sat * dl;
          const k = Math.floor(h / (360 / B)) % B, rad = h * Math.PI / 180;
          sx[k] += Math.cos(rad) * w; sy[k] += Math.sin(rad) * w; ws[k] += w; ss[k] += sat * w;
        }
        const lum = lumSum / n;
        let best = 0;
        for (let k = 1; k < B; k++) if (ws[k] > ws[best]) best = k;
        if (ws[best] < 1) { resolve(_paletteFromHue(210, 0.12, lum)); return; } // greyscale background
        const hue = (Math.atan2(sy[best], sx[best]) * 180 / Math.PI + 360) % 360;
        resolve(_paletteFromHue(hue, ss[best] / ws[best], lum));
      } catch (e) { resolve(null); } // canvas tainted (e.g. opened from file://) → keep default colours
    };
    im.src = src;
  });
}

function currentBgSrc() { return BG_LIST.length ? BG_LIST[bgImageIndex] : ''; }
function ensureAccent(src) {
  if (!src) return Promise.resolve(null);
  if (src in accentCache) return Promise.resolve(accentCache[src]);
  return extractAccent(src).then(p => { accentCache[src] = p; return p; });
}
function currentPalette() { return coverLayout === 'modern' ? (accentCache[currentBgSrc()] || null) : null; }
function effectiveColor(target) {
  const pal = currentPalette();
  return (pal && autoColor[target]) ? pal[target] : coverStyle[target].color;
}

const BG_STYLES = [
  "url('https://www.transparenttextures.com/patterns/rice-paper.png')",
  "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
  "radial-gradient(circle at 10% 30%, rgba(44,122,110,0.1) 0%, rgba(15,43,59,0.05) 80%)",
  "linear-gradient(125deg, rgba(210,180,100,0.08) 0%, rgba(44,122,110,0.05) 100%)"
];

// Index pointers for the "Change Background" button — cycles deterministically
// through each background image + texture pairing every click.
let bgImageIndex = 0;
let bgStyleIndex = 0;

// ── Teacher management ──
let tcCount = 0;

// Inline SVG icons used by script-built UI (replaces text glyphs such as ✕ and ✓)
const ICON_X = '<svg aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
const ICON_OK = '<svg aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8.3 12.4 2.6 2.6 4.8-5.2"/></svg>';
const ICON_ERR = '<svg aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.8v5"/><path d="M12 16.3v.01"/></svg>';

function createTeacherCard(id, num) {
  const div = document.createElement('div');
  div.className = 'teacher-card';
  div.dataset.tid = id;
  div.innerHTML = `
    <div class="teacher-card-header">
      ${num > 1 ? `<button type="button" class="btn-remove" title="Remove teacher" aria-label="Remove teacher">${ICON_X}</button>` : ''}
    </div>
    <div class="form-group">
      <label class="form-label" for="tcName${id}">Full Name</label>
      <input type="text" id="tcName${id}" class="tc-name" placeholder="e.g. Dr. Md. Anisur Rahman">
    </div>
    <div class="row-2">
      <div class="form-group">
        <label class="form-label" for="tcDesig${id}">Designation</label>
        <input type="text" id="tcDesig${id}" class="tc-desig" placeholder="e.g. Professor">
      </div>
      <div class="form-group">
        <label class="form-label" for="tcDept${id}">Department</label>
        <input type="text" id="tcDept${id}" class="tc-dept" placeholder="e.g. Agronomy">
      </div>
    </div>`;
  const rm = div.querySelector('.btn-remove');
  if (rm) rm.addEventListener('click', () => { div.remove(); renumber(); schedulePreview(); });
  div.querySelectorAll('input').forEach(el => el.addEventListener('input', schedulePreview));
  return div;
}

function addTeacher() {
  tcCount++;
  document.getElementById('teachersContainer').appendChild(createTeacherCard(tcCount, tcCount));
}

function renumber() {
  document.querySelectorAll('.teacher-card').forEach((card, i) => {
    let rm = card.querySelector('.btn-remove');
    if (i === 0 && rm) rm.remove();
    if (i > 0 && !rm) {
      rm = document.createElement('button');
      rm.className = 'btn-remove';
      rm.title = 'Remove teacher';
      rm.type = 'button';
      rm.setAttribute('aria-label', 'Remove teacher');
      rm.innerHTML = ICON_X;
      rm.addEventListener('click', () => { card.remove(); renumber(); schedulePreview(); });
      card.querySelector('.teacher-card-header').appendChild(rm);
    }
  });
}

function cleanDept(d) {
  return (d || '').replace(/^\s*(department|dept\.?)\s+of\s+/i, '').trim();
}

function getTeachers() {
  const out = [];
  document.querySelectorAll('.teacher-card').forEach(c => {
    const name = c.querySelector('.tc-name')?.value.trim();
    if (name) {
      out.push({
        name,
        desig: c.querySelector('.tc-desig')?.value.trim(),
        dept: cleanDept(c.querySelector('.tc-dept')?.value)
      });
    }
  });
  return out.length ? out : [{ name: 'Dr. Academic Supervisor', desig: 'Professor', dept: 'Academic Affairs' }];
}

// ── Live preview ──
let previewTimer = null;
function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(refreshPreview, 300);
}

// ── Helpers ──
function esc(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function getFormData() {
  return {
    coverType: document.getElementById('coverType').value.trim() || 'An Assignment on',
    assignTitle: document.getElementById('assignTitle').value.trim() || 'Assignment Title',
    courseCode: document.getElementById('courseCode').value.trim(),
    courseTitle: document.getElementById('courseTitle').value.trim(),
    stuName: document.getElementById('stuName').value.trim() || 'Student Name',
    stuReg: document.getElementById('stuReg').value.trim(),
    stuGroup: document.getElementById('stuGroup').value.trim(),
    stuSection: document.getElementById('stuSection').value.trim(),
    stuTerm: document.getElementById('stuTerm').value.trim(),
    stuFaculty: document.getElementById('stuFaculty').value.trim(),
    teachers: getTeachers()
  };
}

function buildCoverHTML_Modern(data, bgStyle, bgImg) {
  // Student details rows
  let stuRows = '';
  if (data.stuReg) stuRows += `<div class="detail-line"><span class="detail-label">Reg. No.</span><span class="detail-colon">:</span><span class="detail-value">${esc(data.stuReg)}</span></div>`;
  if (data.stuSection) stuRows += `<div class="detail-line"><span class="detail-label">Section</span><span class="detail-colon">:</span><span class="detail-value">${esc(data.stuSection)}</span></div>`;
  if (data.stuGroup) stuRows += `<div class="detail-line"><span class="detail-label">Group</span><span class="detail-colon">:</span><span class="detail-value">${esc(data.stuGroup)}</span></div>`;
  if (data.stuTerm) stuRows += `<div class="detail-line"><span class="detail-label">Term</span><span class="detail-colon">:</span><span class="detail-value">${esc(data.stuTerm)}</span></div>`;
  if (data.stuFaculty) stuRows += `<div class="detail-line"><span class="detail-label">Faculty</span><span class="detail-colon">:</span><span class="detail-value">${esc(data.stuFaculty)}</span></div>`;

  // Teacher rows
  const tcRows = data.teachers.map(t => {
    const sub = t.desig && t.dept
      ? `${t.desig}, Department of ${t.dept}`
      : (t.desig || (t.dept ? `Department of ${t.dept}` : ''));
    return `<div class="teacher-entry"><div class="teacher-name-cv">${esc(t.name)}</div>${sub ? `<div class="teacher-detail-cv">${esc(sub)}</div>` : ''}</div>`;
  }).join('');

  // Course block
  let courseHtml = '';
  if (data.courseCode || data.courseTitle) {
    courseHtml = `<div class="course-block">
      ${data.courseCode ? `<div class="course-line"><b>Course Code :</b> <span>${esc(data.courseCode)}</span></div>` : ''}
      ${data.courseTitle ? `<div class="course-line"><b>Course Title :</b> <span>${esc(data.courseTitle)}</span></div>` : ''}
    </div>`;
  }

  return `<div class="gau-cover layout-modern">
    ${bgImg ? `<img class="cover-bg" src="${bgImg}" alt="" onerror="this.style.display='none'">` : ''}
    <div class="bg-art" style="background-image:${bgStyle};"></div>
    <div class="cover-content">
      <div class="pretitle">${esc(data.coverType)}</div>
      <div class="main-title">${esc(data.assignTitle)}</div>
      ${courseHtml}
      <div class="split-info">
        <div class="info-box">
          <div class="badge-sub">Submitted by</div>
          <div class="student-name">${esc(data.stuName)}</div>
          ${stuRows}
        </div>
        <div class="info-box">
          <div class="badge-sub">Submitted to</div>
          ${tcRows || '<div class="teacher-detail-cv">Faculty Advisor</div>'}
        </div>
      </div>
      <div class="footer-seal">
        <div class="logo-place"><img src="${LOGO_PATH}" alt="University Logo"></div>
        <div class="uni-name">${UNIV_NAME}</div>
        <div class="uni-addr">${UNIV_ADDR}</div>
      </div>
    </div>
  </div>`;
}

function buildCoverHTML_Classic(data) {
  let stuRows = '';
  if (data.stuReg) stuRows += `<div class="c-detail-line"><span class="c-detail-label">Reg. No.</span><span class="c-detail-value">${esc(data.stuReg)}</span></div>`;
  if (data.stuSection) stuRows += `<div class="c-detail-line"><span class="c-detail-label">Section</span><span class="c-detail-value">${esc(data.stuSection)}</span></div>`;
  if (data.stuGroup) stuRows += `<div class="c-detail-line"><span class="c-detail-label">Group</span><span class="c-detail-value">${esc(data.stuGroup)}</span></div>`;
  if (data.stuTerm) stuRows += `<div class="c-detail-line"><span class="c-detail-label">Term</span><span class="c-detail-value">${esc(data.stuTerm)}</span></div>`;
  if (data.stuFaculty) stuRows += `<div class="c-detail-line"><span class="c-detail-label">Faculty</span><span class="c-detail-value">${esc(data.stuFaculty)}</span></div>`;

  const tcRows = data.teachers.map(t => {
    const sub = t.desig && t.dept
      ? `${t.desig}, Department of ${t.dept}`
      : (t.desig || (t.dept ? `Department of ${t.dept}` : ''));
    return `<div class="c-teacher-entry"><div class="c-teacher-name">${esc(t.name)}</div>${sub ? `<div class="c-teacher-detail">${esc(sub)}</div>` : ''}</div>`;
  }).join('');

  let courseHtml = '';
  if (data.courseCode || data.courseTitle) {
    courseHtml = `<div class="c-course-block">
      ${data.courseCode ? `<div class="c-course-line"><b>Course Code:</b> ${esc(data.courseCode)}</div>` : ''}
      ${data.courseTitle ? `<div class="c-course-line"><b>Course Title:</b> ${esc(data.courseTitle)}</div>` : ''}
    </div>`;
  }

  return `<div class="gau-cover layout-classic">
    <div class="c-border-outer">
      <div class="c-border-inner">
        <div class="c-content">
          <div class="c-pretitle">${esc(data.coverType)}</div>
          <div class="c-title">${esc(data.assignTitle)}</div>
          ${courseHtml}

          <div class="c-split">
            <div class="c-box">
              <div class="c-badge">Submitted By</div>
              <div class="c-student-name">${esc(data.stuName)}</div>
              ${stuRows}
            </div>
            <div class="c-divider"></div>
            <div class="c-box">
              <div class="c-badge">Submitted To</div>
              ${tcRows || '<div class="c-teacher-detail">Faculty Advisor</div>'}
            </div>
          </div>

          <div class="c-footer">
            <div class="c-crest"><img src="${LOGO_PATH}" alt="University Logo"></div>
            <div class="c-uni-name">${UNIV_NAME}</div>
            <div class="c-uni-addr">${UNIV_ADDR}</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function buildCoverHTML_Futuristic(data, bgStyle, bgImg) {
  let stuRows = '';
  if (data.stuReg) stuRows += `<div class="f-detail-line"><span class="f-detail-label">REG.NO</span><span class="f-detail-value">${esc(data.stuReg)}</span></div>`;
  if (data.stuSection) stuRows += `<div class="f-detail-line"><span class="f-detail-label">SECTION</span><span class="f-detail-value">${esc(data.stuSection)}</span></div>`;
  if (data.stuGroup) stuRows += `<div class="f-detail-line"><span class="f-detail-label">GROUP</span><span class="f-detail-value">${esc(data.stuGroup)}</span></div>`;
  if (data.stuTerm) stuRows += `<div class="f-detail-line"><span class="f-detail-label">TERM</span><span class="f-detail-value">${esc(data.stuTerm)}</span></div>`;
  if (data.stuFaculty) stuRows += `<div class="f-detail-line"><span class="f-detail-label">FACULTY</span><span class="f-detail-value">${esc(data.stuFaculty)}</span></div>`;

  const tcRows = data.teachers.map(t => {
    const sub = t.desig && t.dept
      ? `${t.desig} · Dept. of ${t.dept}`
      : (t.desig || (t.dept ? `Dept. of ${t.dept}` : ''));
    return `<div class="f-teacher-entry"><div class="f-teacher-name">${esc(t.name)}</div>${sub ? `<div class="f-teacher-detail">${esc(sub)}</div>` : ''}</div>`;
  }).join('');

  let courseHtml = '';
  if (data.courseCode || data.courseTitle) {
    courseHtml = `<div class="f-course-block">
      ${data.courseCode ? `<div class="f-course-line"><span class="f-course-key">COURSE CODE</span>${esc(data.courseCode)}</div>` : ''}
      ${data.courseTitle ? `<div class="f-course-line"><span class="f-course-key">COURSE TITLE</span>${esc(data.courseTitle)}</div>` : ''}
    </div>`;
  }

  return `<div class="gau-cover layout-futuristic">
    ${bgImg ? `<img class="cover-bg f-bg-img" src="${bgImg}" alt="" onerror="this.style.display='none'">` : ''}
    <div class="f-bg-tint"></div>
    <div class="f-glow-a"></div>
    <div class="f-glow-b"></div>
    <div class="f-frame-corner f-frame-tl"></div>
    <div class="f-frame-corner f-frame-br"></div>
    <div class="f-content">
      <div class="f-pretitle">${esc(data.coverType)}</div>
      <div class="f-title">${esc(data.assignTitle)}</div>
      ${courseHtml}

      <div class="f-split">
        <div class="f-box">
          <div class="f-badge">Submitted&nbsp;By</div>
          <div class="f-student-name">${esc(data.stuName)}</div>
          ${stuRows}
        </div>
        <div class="f-box">
          <div class="f-badge">Submitted&nbsp;To</div>
          ${tcRows || '<div class="f-teacher-detail">Faculty Advisor</div>'}
        </div>
      </div>

      <div class="f-footer">
        <div class="f-footer-line"></div>
        <div class="f-footer-row">
          <div class="f-logo-place"><img src="${LOGO_PATH}" alt="University Logo"></div>
          <div class="f-footer-text">
            <div class="f-uni-name">${UNIV_NAME}</div>
            <div class="f-uni-addr">${UNIV_ADDR}</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function buildCoverHTML(data, bgStyle, bgImg) {
  if (coverLayout === 'classic') return buildCoverHTML_Classic(data);
  if (coverLayout === 'futuristic') return buildCoverHTML_Futuristic(data, bgStyle, bgImg);
  return buildCoverHTML_Modern(data, bgStyle, bgImg);
}

// ── Preview ──
function refreshPreview() {
  if (needsExtraFonts()) loadExtraFonts();
  document.documentElement.dataset.layout = coverLayout; // lets CSS hide the background button on layouts that ignore it
  const data = getFormData();
  const bgStyle = BG_STYLES[bgStyleIndex];
  const bgImg = BG_LIST.length ? BG_LIST[bgImageIndex] : '';
  const html = buildCoverHTML(data, bgStyle, bgImg);

  const frame = document.getElementById('previewFrame');
  const wrap = document.getElementById('previewFrameWrap');
  const empty = document.getElementById('previewEmpty');

  frame.innerHTML = html;
  applyCoverStyleVars(frame.querySelector('.gau-cover'));
  document.querySelectorAll('.color-picker').forEach(updateColorTrigger);

  const _src = currentBgSrc();
  if (coverLayout === 'modern' && _src && !(_src in accentCache)) {
    ensureAccent(_src).then(() => { if (currentBgSrc() === _src) refreshPreview(); });
  }

  // Show the wrapper first so its real width can be measured, then fit the A4 page into it
  wrap.style.display = 'block';
  empty.style.display = 'none';
  document.getElementById('rightPanel').classList.add('has-preview');
  updateBgThumbs();
  fitPreview();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitCover(document.querySelector('#previewFrame .gau-cover')));
}

// Zoom state (1 = fit to the available width)
let previewZoom = 1;
const ZOOM_MIN = 0.5, ZOOM_MAX = 3;

// Scale the 794px wide A4 page to the preview box's width × the zoom level
function fitPreview() {
  const wrap = document.getElementById('previewFrameWrap');
  const frame = document.getElementById('previewFrame');
  const vp = document.getElementById('previewViewport');
  if (!wrap || !frame || !vp || wrap.style.display === 'none') return;
  const desktop = window.matchMedia('(min-width: 961px)').matches;
  const cs = getComputedStyle(vp);
  const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  let baseW = vp.clientWidth - padX;
  if (baseW <= 0) return; // hidden (e.g. the other mobile tab); the observer below refits when it becomes visible
  if (desktop) {
    // the canvas fills the column; "100%" = the whole A4 page fitted inside it
    vp.style.height = '';
    const baseH = vp.clientHeight - padY;
    if (baseH <= 0) return;
    baseW = Math.min(baseW, baseH * 794 / 1123);
  } else {
    // phones / tablets: the box is one A4 page tall at 100%; only the page inside it zooms
    vp.style.height = (baseW * 1123 / 794 + padY) + 'px';
  }
  wrap.style.width = (baseW * previewZoom) + 'px';
  const ww = wrap.clientWidth;
  if (!ww) return;
  const scale = ww / 794;
  fitCover(frame.querySelector('.gau-cover'));
  frame.style.transform = `scale(${scale})`;
  wrap.style.height = (1123 * scale + (wrap.offsetHeight - wrap.clientHeight)) + 'px';
  vp.classList.toggle('zoomed', previewZoom > 1.001);
}

function updateZoomUI() {
  const r = document.getElementById('zoomResetBtn');
  if (r) r.textContent = Math.round(previewZoom * 100) + '%';
  const o = document.getElementById('zoomOutBtn'), i = document.getElementById('zoomInBtn');
  if (o) o.disabled = previewZoom <= ZOOM_MIN + 0.001;
  if (i) i.disabled = previewZoom >= ZOOM_MAX - 0.001;
}
function setZoom(z) {
  z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
  const vp = document.getElementById('previewViewport');
  const wrap = document.getElementById('previewFrameWrap');
  const oldW = wrap.clientWidth || 1, oldH = wrap.clientHeight || 1;
  const rx = (vp.scrollLeft + vp.clientWidth / 2) / oldW; // keep the same point centred
  const ry = (vp.scrollTop + vp.clientHeight / 2) / oldH;
  previewZoom = z;
  updateZoomUI();
  fitPreview();
  vp.scrollLeft = rx * wrap.clientWidth - vp.clientWidth / 2;
  vp.scrollTop = ry * wrap.clientHeight - vp.clientHeight / 2;
}

window.addEventListener('resize', fitPreview);
document.addEventListener('DOMContentLoaded', () => {
  const vp = document.getElementById('previewViewport');
  if (!vp) return;
  if (window.ResizeObserver) {
    let lastW = 0, lastH = 0;
    new ResizeObserver(() => {
      if (vp.clientWidth !== lastW || vp.clientHeight !== lastH) { lastW = vp.clientWidth; lastH = vp.clientHeight; fitPreview(); }
    }).observe(vp);
  }
  document.getElementById('zoomInBtn').addEventListener('click', () => setZoom(previewZoom + 0.25));
  document.getElementById('zoomOutBtn').addEventListener('click', () => setZoom(previewZoom - 0.25));
  document.getElementById('zoomResetBtn').addEventListener('click', () => setZoom(1));
  updateZoomUI();

  // Ctrl / ⌘ + wheel (also trackpad pinch) zooms the page
  vp.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(previewZoom * Math.exp(-e.deltaY * 0.01));
  }, { passive: false });

  // Two-finger pinch on touch screens
  let pinchD = 0, pinchZ = 1;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  vp.addEventListener('touchstart', e => { if (e.touches.length === 2) { pinchD = dist(e.touches); pinchZ = previewZoom; } }, { passive: true });
  vp.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || !pinchD) return;
    e.preventDefault();
    setZoom(pinchZ * dist(e.touches) / pinchD);
  }, { passive: false });
  vp.addEventListener('touchend', e => { if (e.touches.length < 2) pinchD = 0; });

  // Mouse drag to pan when zoomed in
  let drag = null;
  vp.addEventListener('mousedown', e => {
    if (e.button !== 0 || previewZoom <= 1.001) return;
    drag = { x: e.clientX, y: e.clientY, sl: vp.scrollLeft, st: vp.scrollTop };
    vp.classList.add('panning');
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    vp.scrollLeft = drag.sl - (e.clientX - drag.x);
    vp.scrollTop = drag.st - (e.clientY - drag.y);
  });
  window.addEventListener('mouseup', () => { drag = null; vp.classList.remove('panning'); });
});

// If the background image folder is missing, drop the list so the cover falls back to texture-only (no broken image)
function probeBackgrounds() {
  if (!BG_LIST.length) return;
  const im = new Image();
  im.onerror = () => { BG_LIST.length = 0; bgImageIndex = 0; buildBgThumbs(); refreshPreview(); };
  im.src = BG_LIST[bgImageIndex] || BG_LIST[0];
}

// ── Change Background button ──
// Cycles to the next background image + texture pairing each click, looping back
// to the start once the end of the list is reached. Purely visual — does not
// change any form data or PDF-generation logic.
function cycleBackground() {
  if (BG_LIST.length) bgImageIndex = (bgImageIndex + 1) % BG_LIST.length;
  bgStyleIndex = (bgStyleIndex + 1) % BG_STYLES.length;

  ['bgCycleBtn', 'bgCycleBtnMobile'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.remove('spin');
    void btn.offsetWidth; // restart animation
    btn.classList.add('spin');
  });

  refreshPreview();
}

// ── Background navigation: prev / next arrows + thumbnail strip (desktop) ──
function setBackground(i) {
  if (!BG_LIST.length) return;
  const n = BG_LIST.length;
  bgImageIndex = ((i % n) + n) % n;
  bgStyleIndex = bgImageIndex % BG_STYLES.length;
  refreshPreview();
}
function prevBackground() { setBackground(bgImageIndex - 1); }
function nextBackground() { setBackground(bgImageIndex + 1); }
function buildBgThumbs() {
  const box = document.getElementById('bgThumbs');
  if (!box) return;
  box.innerHTML = '';
  BG_LIST.forEach((src, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'bg-thumb'; b.dataset.idx = i;
    b.title = 'Background ' + (i + 1); b.setAttribute('aria-label', 'Background ' + (i + 1));
    const im = document.createElement('img');
    im.loading = 'lazy'; im.alt = ''; im.src = src;
    im.onerror = () => { b.style.visibility = 'hidden'; };
    b.appendChild(im);
    b.addEventListener('click', () => setBackground(i));
    box.appendChild(b);
  });
  updateBgThumbs();
}
function updateBgThumbs() {
  const box = document.getElementById('bgThumbs');
  if (!box) return;
  box.querySelectorAll('.bg-thumb').forEach(b => {
    const on = Number(b.dataset.idx) === bgImageIndex;
    b.classList.toggle('active', on);
    if (on && box.offsetParent) {
      const target = b.offsetLeft - (box.clientWidth - b.offsetWidth) / 2;
      box.scrollTo({ left: target, behavior: 'smooth' });
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  buildBgThumbs();
  document.querySelectorAll('.js-bg-prev').forEach(b => b.addEventListener('click', prevBackground));
  document.querySelectorAll('.js-bg-next').forEach(b => b.addEventListener('click', nextBackground));
});
document.addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
  const t = e.target, tag = t && t.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
  if (document.getElementById('settingsPanel').classList.contains('open')) return;
  e.preventDefault();
  if (e.key === 'ArrowLeft') prevBackground(); else nextBackground();
});

// ── Block browser-level zoom on touch screens (iOS gestures, two-finger pinch; double-tap is blocked by touch-action in CSS) ──
['gesturestart', 'gesturechange', 'gestureend'].forEach(ev =>
  document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', e => {
  if (e.touches.length > 1 && !(e.target.closest && e.target.closest('#previewViewport'))) e.preventDefault();
}, { passive: false });

// ── Mobile tabs ──
function switchMobileTab(tab) {
  const lp = document.getElementById('leftPanel');
  const rp = document.getElementById('rightPanel');
  const tf = document.getElementById('tabForm');
  const tp = document.getElementById('tabPreview');
  if (tab === 'form') {
    lp.classList.remove('mobile-hidden');
    rp.classList.remove('mobile-visible');
    tf.classList.add('active');
    tp.classList.remove('active');
    tf.setAttribute('aria-selected', 'true'); tp.setAttribute('aria-selected', 'false');
  } else {
    lp.classList.add('mobile-hidden');
    rp.classList.add('mobile-visible');
    tf.classList.remove('active');
    tp.classList.add('active');
    tf.setAttribute('aria-selected', 'false'); tp.setAttribute('aria-selected', 'true');
    refreshPreview();
  }
}

// ── Toast ──
let _toastTimer = null;
function showToast(type, msg) {
  const t = document.getElementById('toastMsg');
  t.className = 'toast ' + type;
  t.innerHTML = (type === 'success' ? ICON_OK : ICON_ERR) + '<span></span>';
  t.lastChild.textContent = msg;
  t.style.display = 'flex';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.style.display = 'none'; }, type === 'error' ? 5000 : 3500);
}

// ── Generate PDF ── (original logic preserved — uses whichever background
// is currently selected via the Change Background button)
function validateBeforeDownload() {
  const missing = [];
  const need = (el, label) => { if (el && !el.value.trim()) missing.push({ el, label }); };
  need(document.getElementById('assignTitle'), 'Title');
  need(document.getElementById('stuName'), 'Name');
  need(document.getElementById('stuReg'), 'Reg. No.');
  const names = Array.from(document.querySelectorAll('.tc-name'));
  if (names.length && !names.some(n => n.value.trim())) missing.push({ el: names[0], label: 'Teacher' });

  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  if (!missing.length) return true;

  // On mobile the form may be hidden behind the Preview tab
  if (document.getElementById('leftPanel').classList.contains('mobile-hidden')) switchMobileTab('form');
  missing.forEach(m => m.el.classList.add('field-error'));
  setTimeout(() => {
    missing[0].el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    missing[0].el.focus({ preventScroll: true });
  }, 80);
  showToast('error', 'Required: ' + missing.map(m => m.label).join(', '));
  return false;
}
document.addEventListener('input', e => { if (e.target.classList) e.target.classList.remove('field-error'); }, true);

// Saves the PDF in a way that works on iPhone/iPad (share sheet to Files), Android and desktop
async function savePdfFile(pdf, fileName) {
  const blob = pdf.output('blob');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS && window.File && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName });
        return 'shared';
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
      // share blocked (user gesture expired) or unsupported: fall through to normal download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  if (isIOS) setTimeout(() => { try { window.open(url, '_blank'); } catch (e) {} }, 400);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return 'saved';
}

async function generateAndDownload() {
  if (!validateBeforeDownload()) return;
  const btns = [document.getElementById('downloadBtn'), document.getElementById('downloadBtnMobile')].filter(Boolean);
  const origs = btns.map(b => b.innerHTML);
  const spinnerSvg = `<svg aria-hidden="true" focusable="false" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9" opacity="0.9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>`;
  btns.forEach(b => { b.innerHTML = b.id === 'downloadBtnMobile' ? spinnerSvg.replace('width="21" height="21"', 'width="18" height="18"') + '<span>Wait...</span>' : spinnerSvg; b.disabled = true; });

  try {
    await ensurePdfLibs();
    if (needsExtraFonts()) await loadExtraFonts();
    await ensureAccent(currentBgSrc());
    const data = getFormData();
    const bgStyle = BG_STYLES[bgStyleIndex];
    const bgImg = BG_LIST.length ? BG_LIST[bgImageIndex] : '';
    const html = buildCoverHTML(data, bgStyle, bgImg);

    const tmp = document.createElement('div');
    tmp.style.cssText = 'width:794px;height:1123px;position:absolute;top:-9999px;left:-9999px;';
    tmp.innerHTML = html;
    document.body.appendChild(tmp);
    applyCoverStyleVars(tmp.querySelector('.gau-cover'));

    await Promise.all(Array.from(tmp.querySelectorAll('img')).map(img =>
      img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
    ));
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
    await new Promise(r => setTimeout(r, 200));
    fitCover(tmp.querySelector('.gau-cover'));

    // Highest quality first; fall back to lower scales if the device runs out of canvas memory
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    // 3x on A4 ≈ 288 DPI: sharp print. iOS has a small canvas memory limit, so it starts lower and every device can fall back further
    const scaleList = isIOS ? [2, 1.5, 1] : [3, 2.5, 2, 1.5, 1];
    let canvas = null;
    for (const sc of scaleList) {
      try {
        const c = await html2canvas(tmp, { scale: sc, backgroundColor: '#ffffff', useCORS: true, allowTaint: false, logging: false, width: 794, height: 1123, windowWidth: 794, windowHeight: 1123 });
        if (c && c.width > 0 && c.height > 0 && c.toDataURL('image/jpeg', 0.5).length > 2000) { canvas = c; break; }
      } catch (e) { console.warn('html2canvas failed at scale ' + sc, e); }
    }
    document.body.removeChild(tmp);
    if (!canvas) throw new Error('Render failed. Try again.');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
    // File name: CourseCode_CourseTitle_Layout.pdf  (e.g. PLP340_Diseases of Field Crops_Classic.pdf)
    const _clean = t => (t || '').replace(/[\\/:*?"<>|\x00-\x1f]/g, '').replace(/\s+/g, ' ').trim();
    const _layoutName = coverLayout.charAt(0).toUpperCase() + coverLayout.slice(1);
    const _parts = [_clean(data.courseCode), _clean(data.courseTitle)].filter(Boolean);
    if (!_parts.length) _parts.push(_clean(data.assignTitle).substring(0, 40) || 'Cover');
    const saveRes = await savePdfFile(pdf, `${_parts.join('_')}_${_layoutName}.pdf`);

    canvas.width = canvas.height = 0; // release canvas memory
    if (saveRes !== 'cancelled') showToast('success', 'PDF downloaded');
  } catch (err) {
    console.error(err);
    showToast('error', 'PDF failed: ' + err.message);
  } finally {
    btns.forEach((b, i) => { b.innerHTML = origs[i]; b.disabled = false; });
  }
}

// ── Init ──
function bindLayoutSelector() {
  const grid = document.getElementById('layoutOptionGrid');
  if (!grid) return;
  grid.querySelectorAll('.layout-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const layout = btn.dataset.layout;
      if (layout === coverLayout) return;
      coverLayout = layout;
      grid.querySelectorAll('.layout-option').forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
      schedulePreview();
    });
  });
}

// ── Auto-save / restore (browser localStorage) ──
const STORAGE_KEY = 'coverx_autosave_v1';
const FIELD_IDS = ['coverType', 'assignTitle', 'courseCode', 'courseTitle', 'stuName', 'stuReg', 'stuGroup', 'stuSection', 'stuTerm', 'stuFaculty'];

function collectState() {
  const fields = {};
  FIELD_IDS.forEach(id => { const el = document.getElementById(id); if (el) fields[id] = el.value; });
  const teachers = Array.from(document.querySelectorAll('.teacher-card')).map(c => ({
    name: c.querySelector('.tc-name')?.value || '',
    desig: c.querySelector('.tc-desig')?.value || '',
    dept: c.querySelector('.tc-dept')?.value || ''
  }));
  return { v: 1, savedAt: Date.now(), fields, teachers, coverStyle, autoColor, coverLayout, bgStyleIndex, bgImageIndex };
}

let _lastSaved = '';
function saveState() {
  try {
    const json = JSON.stringify(collectState());
    _lastSaved = json;
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) { /* storage blocked or full — app keeps working without auto-save */ }
}

let _saveTimer = null;
function scheduleSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveState, 300);
}

function setLayoutUI(layout) {
  const grid = document.getElementById('layoutOptionGrid');
  if (!grid) return;
  grid.querySelectorAll('.layout-option').forEach(b => {
    const isActive = b.dataset.layout === layout;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function applyState(st) {
  if (!st || typeof st !== 'object') return;

  if (st.fields) FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el || typeof st.fields[id] !== 'string') return;
    if (el.tagName === 'SELECT' && !Array.from(el.options).some(o => o.value === st.fields[id])) return;
    el.value = st.fields[id];
  });

  if (Array.isArray(st.teachers) && st.teachers.length) {
    document.getElementById('teachersContainer').innerHTML = '';
    tcCount = 0;
    st.teachers.forEach(t => {
      addTeacher();
      const cards = document.querySelectorAll('.teacher-card');
      const c = cards[cards.length - 1];
      c.querySelector('.tc-name').value = t.name || '';
      c.querySelector('.tc-desig').value = t.desig || '';
      c.querySelector('.tc-dept').value = t.dept || '';
    });
    renumber();
  }

  if (st.coverStyle) {
    ['pretitle', 'heading', 'info'].forEach(k => {
      if (st.coverStyle[k]) coverStyle[k] = Object.assign({}, DEFAULT_COVER_STYLE[k], st.coverStyle[k]);
    });
  }
  ['pretitle', 'heading', 'info'].forEach(k => {
    const f = coverStyle[k].family;
    if (/^'Calibri'/.test(f) && !/Carlito/.test(f)) coverStyle[k].family = f.replace("'Calibri'", "'Calibri', 'Carlito'");
  });
  if (st.autoColor) ['pretitle', 'heading', 'info'].forEach(k => { if (typeof st.autoColor[k] === 'boolean') autoColor[k] = st.autoColor[k]; });
  else ['pretitle', 'heading', 'info'].forEach(k => { autoColor[k] = true; });
  if (['modern', 'classic', 'futuristic'].includes(st.coverLayout)) coverLayout = st.coverLayout;
  if (Number.isInteger(st.bgStyleIndex) && st.bgStyleIndex >= 0 && st.bgStyleIndex < BG_STYLES.length) bgStyleIndex = st.bgStyleIndex;
  if (Number.isInteger(st.bgImageIndex) && st.bgImageIndex >= 0 && (!BG_LIST.length || st.bgImageIndex < BG_LIST.length)) bgImageIndex = st.bgImageIndex;

  setLayoutUI(coverLayout);
}

// Sync: when another tab/window saves newer data, pick it up here
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue || e.newValue === _lastSaved) return;
  try {
    applyState(JSON.parse(e.newValue));
    _lastSaved = e.newValue;
    syncStyleControlsFromState();
    syncCoverTypeUI();
    refreshPreview();
  } catch (err) { /* ignore */ }
});

// Any edit, selection or tap anywhere in the app triggers a (debounced) save
['input', 'change', 'click'].forEach(ev => document.addEventListener(ev, scheduleSave, true));
// Click handlers run before this fires only in the bubble phase, so also save once more after they finish
document.addEventListener('click', () => setTimeout(scheduleSave, 50));
document.addEventListener('visibilitychange', () => { if (document.hidden) saveState(); });
window.addEventListener('pagehide', saveState);

document.addEventListener('DOMContentLoaded', () => {
  addTeacher();
  document.getElementById('addTeacherBtn').addEventListener('click', () => { addTeacher(); schedulePreview(); });

  // Restore the last saved session (if any) before the style controls are built
  applyState(loadSavedState());

  const watchIds = ['coverType', 'assignTitle', 'courseCode', 'courseTitle', 'stuName', 'stuReg', 'stuGroup', 'stuSection', 'stuTerm', 'stuFaculty'];
  watchIds.forEach(id => document.getElementById(id)?.addEventListener('input', schedulePreview));


  // Settings panel: fonts/weights populate + current state sync + live binding
  populateStyleSelects();
  syncStyleControlsFromState();
  bindStyleControls();
  bindLayoutSelector();

  document.getElementById('settingsBtn').addEventListener('click', openSettingsPanel);
  document.getElementById('settingsCloseBtn').addEventListener('click', closeSettingsPanel);
  document.getElementById('settingsOverlay').addEventListener('click', closeSettingsPanel);
  document.getElementById('resetStyleBtn').addEventListener('click', () => {
    coverStyle = JSON.parse(JSON.stringify(DEFAULT_COVER_STYLE));
    autoColor = { pretitle: true, heading: true, info: true };
    coverLayout = 'modern';
    syncStyleControlsFromState();
    const grid = document.getElementById('layoutOptionGrid');
    if (grid) {
      grid.querySelectorAll('.layout-option').forEach(b => {
        const isActive = b.dataset.layout === 'modern';
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }
    schedulePreview();
  });

  probeBackgrounds();
  setTimeout(refreshPreview, 120);
});

// ── Cover Type dropdown, "New Assignment" and "Clear All" ──
const COVER_PRESETS = ['An Assignment On', 'A Lab Report On', 'A Practical Notebook On', 'A Term Paper On', 'A Project Report On'];

// Keeps the Cover Type dropdown and the (hidden unless "Custom Cover") text input in step
function syncCoverTypeUI() {
  const inp = document.getElementById('coverType');
  const sel = document.getElementById('coverTypeSelect');
  if (!inp || !sel) return;
  const v = inp.value.trim();
  let key = '';
  if (!v) key = sel.dataset.custom === '1' ? 'custom' : '';
  else key = COVER_PRESETS.find(p => p.toLowerCase() === v.toLowerCase()) || 'custom';
  if (key === 'custom') sel.dataset.custom = '1'; else delete sel.dataset.custom;
  sel.value = key;
  inp.style.display = key === 'custom' ? '' : 'none';
}

function onCoverTypeChange() {
  const inp = document.getElementById('coverType');
  const sel = document.getElementById('coverTypeSelect');
  const val = sel.value;
  if (val === 'custom') {
    sel.dataset.custom = '1';
    if (COVER_PRESETS.includes(inp.value.trim())) inp.value = '';
    inp.style.display = '';
    inp.focus({ preventScroll: true });
  } else {
    delete sel.dataset.custom;
    inp.value = val;
    inp.style.display = 'none';
  }
  inp.dispatchEvent(new Event('input', { bubbles: true }));
}

function resetTeachers() {
  document.getElementById('teachersContainer').innerHTML = '';
  tcCount = 0;
  addTeacher();
}

function afterFormReset() {
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  const cts = document.getElementById('coverTypeSelect');
  if (cts) delete cts.dataset.custom;
  syncCoverTypeUI();
  refreshPreview();
  scheduleSave();
  const fb = document.querySelector('.form-body');
  if (fb && fb.scrollTo) fb.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startNewAssignment() {
  ['coverType', 'assignTitle', 'courseCode', 'courseTitle'].forEach(id => { document.getElementById(id).value = ''; });
  resetTeachers();
  afterFormReset();
  showToast('success', 'New assignment ready');
}

function clearAllFields() {
  FIELD_IDS.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  resetTeachers();
  afterFormReset();
  showToast('success', 'Form cleared');
}

// Two-step confirm without a native dialog: first tap arms the button, second tap (within 3.5s) runs it
function disarmBtn(btn) {
  clearTimeout(btn._t);
  delete btn.dataset.armed;
  const l = btn.querySelector('.btn-label');
  if (l && btn.dataset.orig) l.textContent = btn.dataset.orig;
  btn.classList.remove('confirm');
}
function armConfirm(btn, action) {
  if (btn.dataset.armed) { disarmBtn(btn); action(); return; }
  const l = btn.querySelector('.btn-label');
  btn.dataset.armed = '1';
  btn.dataset.orig = l.textContent;
  l.textContent = 'Tap again to confirm';
  btn.classList.add('confirm');
  btn._t = setTimeout(() => disarmBtn(btn), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('coverTypeSelect').addEventListener('change', onCoverTypeChange);
  syncCoverTypeUI();

  document.getElementById('newAssignmentBtn').addEventListener('click', e => armConfirm(e.currentTarget, startNewAssignment));
  document.getElementById('clearAllBtn').addEventListener('click', e => armConfirm(e.currentTarget, clearAllFields));

});

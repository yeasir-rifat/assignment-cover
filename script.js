// ── Constants ──
const UNIV_NAME = 'Gazipur Agricultural University';
const UNIV_ADDR = 'Salna, Gazipur-1706';
const LOGO_PATH = 'images/gau-logo.png';

const BG_LIST = [
  'images/bg-image-1.jpg',
  'images/bg-image-2.jpg',
  'images/bg-image-3.jpg',
  'images/bg-image-4.jpg',
  'images/bg-image-5.jpg',
  'images/bg-image-6.jpg',
  'images/bg-image-7.jpg',
  'images/bg-image-8.jpg',
  'images/bg-image-9.jpg',
  'images/bg-image-10.jpg',
  'images/bg-image-11.jpg',
  'images/bg-image-11.jpg',
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
  'images/bg-image-25.png',
  'images/bg-image-26.png',
  'images/bg-image-27.png',
  'images/bg-image-28.png',
  'images/bg-image-29.png',
  'images/bg-image-30.png',
  'images/bg-image-31.png',
  'images/bg-image-32.png',
  'images/bg-image-33.png',
  'images/bg-image-34.png',
  'images/bg-image-35.png',
  'images/bg-image-36.png',
  'images/bg-image-37.png',
  'images/bg-image-38.png',
  'images/bg-image-39.png',
  'images/bg-image-40.png',
  'images/bg-image-41.png',
  'images/bg-image-42.png',
  'images/bg-image-43.png',
  'images/bg-image-44.png',
  'images/bg-image-45.png',
  'images/bg-image-46.png',
  'images/bg-image-47.png'
];

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

function createTeacherCard(id, num) {
  const div = document.createElement('div');
  div.className = 'teacher-card';
  div.dataset.tid = id;
  div.innerHTML = `
    <div class="teacher-card-header">
      <span class="teacher-num">Teacher ${num}</span>
      ${num > 1 ? `<button class="btn-remove" title="Remove teacher">✕</button>` : ''}
    </div>
    <div class="form-group">
      <label class="form-label">Full Name</label>
      <input type="text" class="tc-name" placeholder="e.g. Dr. Md. Anisur Rahman">
    </div>
    <div class="row-2">
      <div class="form-group">
        <label class="form-label">Designation</label>
        <input type="text" class="tc-desig" placeholder="e.g. Associate Professor">
      </div>
      <div class="form-group">
        <label class="form-label">Department</label>
        <input type="text" class="tc-dept" placeholder="e.g. Agronomy">
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
    card.querySelector('.teacher-num').textContent = `Teacher ${i + 1}`;
    let rm = card.querySelector('.btn-remove');
    if (i === 0 && rm) rm.remove();
    if (i > 0 && !rm) {
      rm = document.createElement('button');
      rm.className = 'btn-remove';
      rm.title = 'Remove teacher';
      rm.textContent = '✕';
      rm.addEventListener('click', () => { card.remove(); renumber(); schedulePreview(); });
      card.querySelector('.teacher-card-header').appendChild(rm);
    }
  });
}

function getTeachers() {
  const out = [];
  document.querySelectorAll('.teacher-card').forEach(c => {
    const name = c.querySelector('.tc-name')?.value.trim();
    if (name) {
      out.push({
        name,
        desig: c.querySelector('.tc-desig')?.value.trim(),
        dept: c.querySelector('.tc-dept')?.value.trim()
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

function buildCoverHTML(data, bgStyle, bgImg) {
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
      ? `${t.desig} | Department of ${t.dept}`
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

  return `<div class="gau-cover">
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

// ── Preview ──
function refreshPreview() {
  const data = getFormData();
  const bgStyle = BG_STYLES[bgStyleIndex];
  const bgImg = BG_LIST.length ? BG_LIST[bgImageIndex] : '';
  const html = buildCoverHTML(data, bgStyle, bgImg);

  const frame = document.getElementById('previewFrame');
  const wrap = document.getElementById('previewFrameWrap');
  const empty = document.getElementById('previewEmpty');

  frame.innerHTML = html;

  const ww = wrap.offsetWidth || wrap.parentElement?.offsetWidth || 520;
  const scale = ww / 794;
  frame.style.transform = `scale(${scale})`;
  wrap.style.height = (1123 * scale) + 'px';
  wrap.style.display = 'block';
  empty.style.display = 'none';
}

window.addEventListener('resize', () => {
  const wrap = document.getElementById('previewFrameWrap');
  if (wrap.style.display === 'none') return;
  const frame = document.getElementById('previewFrame');
  const ww = wrap.offsetWidth || 520;
  const scale = ww / 794;
  frame.style.transform = `scale(${scale})`;
  wrap.style.height = (1123 * scale) + 'px';
});

// ── Change Background button ──
// Cycles to the next background image + texture pairing each click, looping back
// to the start once the end of the list is reached. Purely visual — does not
// change any form data or PDF-generation logic.
function cycleBackground() {
  if (BG_LIST.length) bgImageIndex = (bgImageIndex + 1) % BG_LIST.length;
  bgStyleIndex = (bgStyleIndex + 1) % BG_STYLES.length;

  const btn = document.getElementById('bgCycleBtn');
  btn.classList.remove('spin');
  void btn.offsetWidth; // restart animation
  btn.classList.add('spin');

  refreshPreview();
}

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
  } else {
    lp.classList.add('mobile-hidden');
    rp.classList.add('mobile-visible');
    tf.classList.remove('active');
    tp.classList.add('active');
    refreshPreview();
  }
}

// ── Toast ──
function showToast(type, msg) {
  const t = document.getElementById('toastMsg');
  t.className = 'toast ' + type;
  t.innerHTML = (type === 'success' ? '✓ ' : '✕ ') + msg;
  t.style.display = 'flex';
  setTimeout(() => { t.style.display = 'none'; }, 3500);
}

// ── Generate PDF ── (original logic preserved — uses whichever background
// is currently selected via the Change Background button)
async function generateAndDownload() {
  const btn = document.getElementById('generateBtn');
  const orig = btn.innerHTML;
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Generating…`;
  btn.disabled = true;

  try {
    const data = getFormData();
    const bgStyle = BG_STYLES[bgStyleIndex];
    const bgImg = BG_LIST.length ? BG_LIST[bgImageIndex] : '';
    const html = buildCoverHTML(data, bgStyle, bgImg);

    const tmp = document.createElement('div');
    tmp.style.cssText = 'width:794px;height:1123px;position:absolute;top:-9999px;left:-9999px;';
    tmp.innerHTML = html;
    document.body.appendChild(tmp);

    await Promise.all(Array.from(tmp.querySelectorAll('img')).map(img =>
      img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
    ));
    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(tmp, { scale: 3, backgroundColor: '#ffffff', useCORS: true, allowTaint: false, logging: false });
    document.body.removeChild(tmp);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 210, 297);
    pdf.save(`GAU_Cover_${(data.assignTitle.substring(0, 40).replace(/[^a-z0-9]/gi, '_')) || 'Cover'}.pdf`);

    showToast('success', 'PDF downloaded successfully!');
  } catch (err) {
    console.error(err);
    showToast('error', 'PDF generation failed: ' + err.message);
  } finally {
    btn.innerHTML = orig;
    btn.disabled = false;
  }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  addTeacher();
  document.getElementById('addTeacherBtn').addEventListener('click', () => { addTeacher(); schedulePreview(); });

  const watchIds = ['coverType', 'assignTitle', 'courseCode', 'courseTitle', 'stuName', 'stuReg', 'stuGroup', 'stuSection', 'stuTerm', 'stuFaculty'];
  watchIds.forEach(id => document.getElementById(id)?.addEventListener('input', schedulePreview));

  document.getElementById('bgCycleBtn').addEventListener('click', cycleBackground);

  setTimeout(refreshPreview, 120);
});

/* ==================================================
   EASTCSO (EASTC Students Organization) — SHARED JS
   Theme, navigation, events calendar (from the EASTC
   Academic Almanac 2025/2026), announcements, members,
   contact validation. One file for every page.
   ================================================== */

'use strict';

/* ============ THEME (light / dark) ============
   Follows the system preference until the user explicitly
   chooses via the toggle; the choice is then persisted.
   A small bootstrap script in each page <head> applies the
   class before first paint to avoid a flash. */
const THEME_KEY = 'eastso_theme';

function storedTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'dark' || t === 'light' ? t : null;
  } catch (e) { return null; }
}

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const rootEl = document.documentElement;
  rootEl.classList.toggle('theme-dark', theme === 'dark');
  rootEl.classList.toggle('theme-light', theme === 'light');

  const btn = document.getElementById('darkBtn');
  if (btn) {
    btn.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = 'bi ' + (theme === 'dark' ? 'bi-sun' : 'bi-moon-stars');
    icon.setAttribute('aria-hidden', 'true');
    btn.appendChild(icon);
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

function initTheme() {
  applyTheme(storedTheme() || systemTheme());

  document.getElementById('darkBtn')?.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* private mode */ }
    applyTheme(next);
  });

  // Track OS-level changes while the user has not made an explicit choice
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light');
  });
}

/* ============ MOBILE MENU ============ */
function initMenu() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

/* ============ TOAST ============ */
function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = '';
  const icon = document.createElement('i');
  icon.className = 'bi ' + (type === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle');
  icon.setAttribute('aria-hidden', 'true');
  const span = document.createElement('span');
  span.textContent = msg;
  t.append(icon, span);
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ============ BACK TO TOP (injected once) ============ */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }));
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.pageYOffset > 300);
  }, { passive: true });
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ============ UTILITIES ============ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso) {
  if (!iso) return '';
  const p = iso.split('-');
  return parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
}

/* ==================================================
   EVENTS — sourced from the EASTC Academic Almanac
   2025/2026 (almanac.pdf) plus EASTCSO activities.
   Past events disappear automatically.
   ================================================== */
const EVENT_CATS = {
  academic: { label: 'Academic', icon: 'bi-mortarboard', cls: 'tag-academic' },
  career:   { label: 'Career', icon: 'bi-briefcase', cls: 'tag-career' },
  culture:  { label: 'Culture', icon: 'bi-palette', cls: 'tag-culture' },
  holiday:  { label: 'Public Holiday', icon: 'bi-sun', cls: 'tag-holiday' },
  ceremony: { label: 'Ceremony', icon: 'bi-award', cls: 'tag-ceremony' },
  org:      { label: 'Meetings', icon: 'bi-people', cls: 'tag-org' }
};

const EVENTS = [
  { date: '2026-07-17', title: 'Academic Board Meeting', cat: 'org', place: 'EASTC, Dar es Salaam', desc: 'The EASTC Academic Board convenes to review academic matters, including Trimester Two results.' },
  { date: '2026-07-20', title: 'Trimester Two Provisional Results (NTA 9 / MSc)', cat: 'academic', place: 'EASTC / SIS', desc: 'Provisional examination results are released for NTA 9 / MSc. Agric. Stats and the appeals window opens.' },
  { date: '2026-07-24', title: 'End of Teaching — Semester Two (NTA 4–8)', cat: 'academic', place: 'EASTC', desc: 'Teaching ends for NTA 4–8 Semester Two and submission of signed coursework closes.' },
  { date: '2026-07-25', title: 'Career Fair & Alumni Networking Day', cat: 'career', place: 'Conference Centre, 9:00 AM – 4:00 PM', desc: 'Meet employers, connect with EASTC alumni, and explore internship and job opportunities.', tentative: true },
  { date: '2026-07-27', endDate: '2026-07-31', title: 'Reading Week (NTA 4–8)', cat: 'academic', place: 'EASTC', desc: 'Reading week ahead of the final examinations — library hours are extended.' },
  { date: '2026-08-03', endDate: '2026-08-17', title: 'Second Semester Final Examinations (NTA 4–8)', cat: 'academic', place: 'EASTC Examination Rooms', desc: 'Final examinations for all NTA 4–8 programmes. Check the official timetable and carry your examination card.' },
  { date: '2026-08-08', title: 'Nane Nane Day', cat: 'holiday', place: 'Public Holiday', desc: 'Farmers\' Day — public holiday across Tanzania.' },
  { date: '2026-08-18', title: 'Long Vacation Begins · Practical Training Starts', cat: 'academic', place: 'EASTC', desc: 'Long vacation for NTA 4–8 begins; Practical Training (NTA 5–6) and Field Attachment (NTA 7) start.' },
  { date: '2026-08-25', title: 'Maulid Day', cat: 'holiday', place: 'Public Holiday', desc: 'Public holiday, subject to confirmation.', tentative: true },
  { date: '2026-08-30', title: 'EASTC 61st Anniversary', cat: 'ceremony', place: 'EASTC Campus', desc: 'Celebrating 61 years of the Eastern Africa Statistical Training Centre.' },
  { date: '2026-09-08', title: 'Semester Two Provisional Results (NTA 4–8)', cat: 'academic', place: 'EASTC / SIS', desc: 'Release of provisional results; appeals open and preparations for the 12th Graduation Ceremony begin.' },
  { date: '2026-09-30', title: 'Academic Year 2025/2026 Ends', cat: 'academic', place: 'EASTC', desc: 'Official close of the 2025/2026 academic year.' },
  { date: '2026-10-01', title: 'Academic Year 2026/2027 Begins', cat: 'academic', place: 'EASTC', desc: 'The new academic year officially opens (administrative).' },
  { date: '2026-10-12', title: 'Supplementary / First Sitting Examinations Begin', cat: 'academic', place: 'EASTC', desc: 'Supplementary and first-sitting examinations for all programmes; NTA 9 / MSc Third Trimester finals begin.' },
  { date: '2026-10-14', title: 'Mwalimu Nyerere Day', cat: 'holiday', place: 'Public Holiday', desc: 'Public holiday in honour of Mwalimu Julius Nyerere.' },
  { date: '2026-11-02', title: 'Orientation & Registration — 2026/2027', cat: 'academic', place: 'EASTC', desc: 'Opening date for NTA 4–9 / MSc programmes: orientation and registration for the new academic year.', tentative: true },
  { date: '2026-11-18', title: 'African Statistics Day', cat: 'ceremony', place: 'EASTC Campus', desc: 'Celebrating the role of statistics in Africa\'s development — a signature day for the EASTC community.' },
  { date: '2026-11-19', title: 'Student Council', cat: 'org', place: 'EASTC', desc: 'Student representatives meet to discuss welfare and academic matters.' },
  { date: '2026-11-26', title: '10th EASTC Convocation & AGM', cat: 'ceremony', place: 'EASTC', desc: 'The Centre\'s 10th convocation and annual general meeting.', tentative: true },
  { date: '2026-11-27', title: '12th EASTC Graduation Ceremony', cat: 'ceremony', place: 'EASTC Campus', desc: 'The 12th graduation ceremony of the Eastern Africa Statistical Training Centre.', tentative: true }
];

function upcomingEvents() {
  const today = todayISO();
  return EVENTS
    .filter(e => (e.endDate || e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function isOngoing(e) {
  const t = todayISO();
  return e.date <= t && t <= (e.endDate || e.date);
}

function eventCardHTML(e) {
  const p = e.date.split('-');
  const cat = EVENT_CATS[e.cat] || EVENT_CATS.academic;
  const range = e.endDate ? fmtDate(e.date) + ' – ' + fmtDate(e.endDate) : fmtDate(e.date);
  return `
    <div class="event-card${isOngoing(e) ? ' is-ongoing' : ''}" data-cat="${e.cat}">
      <div class="event-date" aria-hidden="true">
        <div class="day">${parseInt(p[2], 10)}</div>
        <div class="month">${MONTHS[parseInt(p[1], 10) - 1]}</div>
      </div>
      <div class="event-info">
        <h3>${esc(e.title)}</h3>
        <div class="meta">
          <span><i class="bi bi-calendar3" aria-hidden="true"></i> ${range}</span>
          <span><i class="bi bi-geo-alt" aria-hidden="true"></i> ${esc(e.place)}</span>
        </div>
        <p>${esc(e.desc)}</p>
        <span class="event-tag ${cat.cls}"><i class="bi ${cat.icon}" aria-hidden="true"></i> ${cat.label}</span>
        ${e.tentative ? '<span class="event-tag tag-tentative">Tentative</span>' : ''}
        ${isOngoing(e) ? '<span class="event-tag tag-ongoing">Happening now</span>' : ''}
      </div>
    </div>`;
}

/* --- Home: floating "next up" card in the hero --- */
function renderHeroNext() {
  const el = document.getElementById('heroNext');
  if (!el) return;
  const next = upcomingEvents()[0];
  if (!next) { el.hidden = true; return; }
  el.innerHTML = `
    <div class="label"><i class="bi bi-calendar-event" aria-hidden="true"></i> Next at EASTC</div>
    <div class="title">${esc(next.title)}</div>
    <div class="when">${fmtDate(next.date)}${next.endDate ? ' – ' + fmtDate(next.endDate) : ''}</div>`;
}

/* --- Home: top three upcoming events --- */
function renderHomeEvents() {
  const el = document.getElementById('homeEvents');
  if (!el) return;
  el.innerHTML = upcomingEvents().slice(0, 3).map(eventCardHTML).join('');
}

/* --- Events page: filterable, searchable, grouped by month --- */
let eventsFilter = 'all';

function renderEventsPage() {
  const el = document.getElementById('eventsList');
  if (!el) return;

  const q = (document.getElementById('eventSearch')?.value || '').toLowerCase().trim();
  let list = upcomingEvents();
  if (eventsFilter !== 'all') list = list.filter(e => e.cat === eventsFilter);
  if (q) list = list.filter(e => (e.title + ' ' + e.desc + ' ' + e.place).toLowerCase().includes(q));

  const countEl = document.getElementById('searchCount');
  if (countEl) countEl.textContent = q ? list.length + ' result' + (list.length === 1 ? '' : 's') : '';

  if (!list.length) {
    el.innerHTML = '<div class="events-empty"><i class="bi bi-calendar-x" aria-hidden="true"></i> No events match — try a different filter or search term.</div>';
    return;
  }

  let html = '';
  let lastMonth = '';
  list.forEach(e => {
    const key = e.date.slice(0, 7);
    if (key !== lastMonth) {
      lastMonth = key;
      const label = new Date(key + '-01T00:00:00')
        .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      html += `<h3 class="events-month">${label}</h3>`;
    }
    html += eventCardHTML(e);
  });
  el.innerHTML = html;
}

function initEventsPage() {
  const list = document.getElementById('eventsList');
  if (!list) return;

  document.querySelector('.filter-bar')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    eventsFilter = btn.dataset.filter || 'all';
    renderEventsPage();
  });

  document.getElementById('eventSearch')?.addEventListener('input', renderEventsPage);
  renderEventsPage();
  renderCountdown();
  renderMiniCal();
}

/* --- Countdown to the next upcoming event --- */
function renderCountdown() {
  const wrap = document.getElementById('countdownCard');
  if (!wrap) return;
  const next = upcomingEvents()[0];
  const labelEl = document.getElementById('cdLabel');
  if (!next) { wrap.hidden = true; return; }
  if (labelEl) labelEl.textContent = next.title + ' — ' + fmtDate(next.date);

  const target = new Date(next.date + 'T08:00:00');

  function tick() {
    const diff = target - new Date();
    const clamp = v => String(Math.max(0, v));
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = clamp(v); };
    set('cdDays', days); set('cdHours', hours); set('cdMins', mins); set('cdSecs', secs);
  }
  tick();
  setInterval(tick, 1000);
}

/* --- Mini calendar for the current month, event days marked --- */
function renderMiniCal() {
  const wrap = document.getElementById('miniCal');
  if (!wrap) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const eventDays = new Set();
  EVENTS.forEach(e => {
    const start = new Date(e.date + 'T00:00:00');
    const end = new Date((e.endDate || e.date) + 'T00:00:00');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year && d.getMonth() === month) eventDays.add(d.getDate());
    }
  });

  const title = document.getElementById('miniCalTitle');
  if (title) title.textContent = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const firstDow = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '<thead><tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr></thead><tbody><tr>';
  for (let i = 0; i < firstDow; i++) html += '<td></td>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = (firstDow + day - 1) % 7;
    const cls = day === todayDate ? 'cal-today' : (eventDays.has(day) ? 'cal-event' : '');
    html += `<td${cls ? ' class="' + cls + '"' : ''}>${day}</td>`;
    if (dow === 6 && day !== daysInMonth) html += '</tr><tr>';
  }
  html += '</tr></tbody>';
  wrap.innerHTML = html;
}

/* ==================================================
   ANNOUNCEMENTS (localStorage-backed)
   ================================================== */
const ANN_KEY = 'eastso.announcements.v1';

const ANN_SEED = [
  { title: 'Final Examinations Begin 3 August', cat: 'urgent', date: '2026-07-15', message: 'Second Semester Final Examinations for NTA 4–8 run from 3 to 17 August 2026. Check the official timetable on the notice boards and SIS, and carry your examination card.' },
  { title: 'Reading Week: 27–31 July', cat: 'info', date: '2026-07-14', message: 'Reading week for NTA 4–8 runs from 27 to 31 July 2026. Plan your revision schedule and make use of study groups.' },
  { title: 'Library Extended Hours During Exams', cat: 'info', date: '2026-07-10', message: 'The EASTC library will remain open until 10:00 PM every weekday during the reading and examination period.' },
  { title: 'Career Fair & Alumni Day — 25 July', cat: 'event', date: '2026-07-07', message: 'Registration for the EASTC Career Fair and Alumni Networking Day (25 July) is open. Prepare an updated CV and register at the EASTCSO office.' },
  { title: 'Health Screening at the Student Clinic', cat: 'welfare', date: '2026-07-06', message: 'Free health screening — blood pressure, BMI and general consultations — is available at the student clinic every Tuesday and Thursday, 9 AM to 1 PM.' },
  { title: 'Bursary Applications Close 20 July', cat: 'welfare', date: '2026-07-03', message: 'Students facing financial difficulties may apply for bursary support through the EASTCSO Welfare Committee. Forms are available at the welfare office until 20 July 2026.' },
  { title: 'EASTCSO Membership Fee 2025/2026', cat: 'general', date: '2026-07-01', message: 'The annual EASTCSO membership fee of TZS 5,000 is payable at the EASTCSO office. Bring your student ID and keep your receipt for access to services.' }
];

const ANN_META = {
  urgent:  { label: 'Urgent', icon: 'bi-exclamation-triangle' },
  event:   { label: 'Event', icon: 'bi-calendar-event' },
  info:    { label: 'Information', icon: 'bi-info-circle' },
  welfare: { label: 'Welfare', icon: 'bi-heart-pulse' },
  general: { label: 'General', icon: 'bi-megaphone' }
};

let annItems = [];
let annFilter = 'all';

function loadStore(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1 && Array.isArray(parsed.items)) return parsed.items;
    }
  } catch (e) { /* corrupt — reseed */ }
  persist(key, seed);
  return seed.slice();
}

function persist(key, items) {
  try { localStorage.setItem(key, JSON.stringify({ v: 1, items })); }
  catch (e) { /* storage unavailable — keep in memory */ }
}

function annStats() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('cntAll', annItems.length);
  set('cntUrgent', annItems.filter(a => a.cat === 'urgent').length);
  set('cntEvent', annItems.filter(a => a.cat === 'event').length);
  set('cntInfo', annItems.filter(a => a.cat === 'info').length);
}

function renderAnn() {
  const list = document.getElementById('annList');
  if (!list) return;
  const empty = document.getElementById('annEmpty');
  const filtered = annFilter === 'all' ? annItems : annItems.filter(a => a.cat === annFilter);

  if (!filtered.length) {
    list.innerHTML = '';
    if (empty) empty.hidden = false;
    annStats();
    return;
  }
  if (empty) empty.hidden = true;

  const sorted = filtered.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  list.innerHTML = sorted.map(a => {
    const idx = annItems.indexOf(a);
    const meta = ANN_META[a.cat] || ANN_META.general;
    return `
      <div class="ann-card ${a.cat}">
        <div class="ann-icon"><i class="bi ${meta.icon}" aria-hidden="true"></i></div>
        <div class="ann-body">
          <div class="ann-meta">
            <span class="ann-tag tag-${a.cat}">${meta.label}</span>
            <span class="ann-date"><i class="bi bi-calendar3" aria-hidden="true"></i> ${fmtDate(a.date)}</span>
          </div>
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.message)}</p>
          <div class="ann-actions">
            <button type="button" class="btn btn-blue btn-sm" data-action="edit" data-idx="${idx}"><i class="bi bi-pencil-square" aria-hidden="true"></i> Edit</button>
            <button type="button" class="btn btn-red btn-sm" data-action="delete" data-idx="${idx}"><i class="bi bi-trash3" aria-hidden="true"></i> Delete</button>
          </div>
        </div>
      </div>`;
  }).join('');
  annStats();
}

function initAnnouncementsPage() {
  const list = document.getElementById('annList');
  if (!list) return;

  document.querySelector('.filter-bar')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    annFilter = btn.dataset.filter || 'all';
    renderAnn();
  });

  list.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    if (btn.dataset.action === 'edit') editAnn(idx);
    if (btn.dataset.action === 'delete') deleteAnn(idx);
  });

  document.getElementById('annSaveBtn')?.addEventListener('click', saveAnn);
  document.getElementById('annClearBtn')?.addEventListener('click', clearAnnForm);

  const dateEl = document.getElementById('annDate');
  if (dateEl) dateEl.value = todayISO();

  renderAnn();
}

function saveAnn() {
  const title = document.getElementById('annTitle')?.value.trim();
  const cat = document.getElementById('annCat')?.value;
  const date = document.getElementById('annDate')?.value;
  const message = document.getElementById('annMessage')?.value.trim();
  const idx = parseInt(document.getElementById('editIdx')?.value ?? '-1', 10);

  if (!title || !cat || !date || !message) { showToast('Please fill in all fields.', 'error'); return; }

  const entry = { title, cat, date, message };
  if (idx >= 0 && annItems[idx]) { annItems[idx] = entry; showToast('Announcement updated.'); }
  else { annItems.push(entry); showToast('Announcement posted.'); }

  persist(ANN_KEY, annItems);
  clearAnnForm();
  renderAnn();
}

function editAnn(i) {
  const a = annItems[i];
  if (!a) return;
  document.getElementById('annTitle').value = a.title;
  document.getElementById('annCat').value = a.cat;
  document.getElementById('annDate').value = a.date;
  document.getElementById('annMessage').value = a.message;
  document.getElementById('editIdx').value = i;
  const ft = document.getElementById('formTitle');
  if (ft) ft.textContent = 'Edit Announcement';
  document.querySelector('.staff-form')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

function deleteAnn(i) {
  const a = annItems[i];
  if (!a) return;
  if (!window.confirm('Delete this announcement:\n"' + a.title + '"?')) return;
  annItems.splice(i, 1);
  persist(ANN_KEY, annItems);
  renderAnn();
  showToast('Announcement deleted.', 'error');
}

function clearAnnForm() {
  ['annTitle', 'annMessage'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const cat = document.getElementById('annCat'); if (cat) cat.value = '';
  const date = document.getElementById('annDate'); if (date) date.value = todayISO();
  const idx = document.getElementById('editIdx'); if (idx) idx.value = '-1';
  const ft = document.getElementById('formTitle'); if (ft) ft.textContent = 'Post New Announcement';
}

/* --- Home band: latest three announcements --- */
function renderHomeNotices() {
  const el = document.getElementById('homeNotices');
  if (!el) return;
  const latest = annItems.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3);
  el.innerHTML = latest.map(a => `
    <li>
      <strong>${fmtDate(a.date)} — ${(ANN_META[a.cat] || ANN_META.general).label}</strong>
      ${esc(a.title)}. ${esc(a.message.length > 110 ? a.message.slice(0, 110) + '…' : a.message)}
    </li>`).join('');
}

/* ==================================================
   MEMBERS (localStorage-backed CRUD)
   ================================================== */
const MEMBERS_KEY = 'eastso.members.v1';
let members = [];

function memberStats() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('countTotal', members.length);
  set('countY1', members.filter(m => m.year === '1st Year').length);
  set('countY2', members.filter(m => m.year === '2nd Year').length);
  set('countY3', members.filter(m => m.year === '3rd Year').length);
}

function renderMembers() {
  const tbody = document.getElementById('membersBody');
  if (!tbody) return;
  const empty = document.getElementById('membersEmpty');
  const q = (document.getElementById('memberSearch')?.value || '').toLowerCase();
  const filtered = members.filter(m => !q || (m.name + m.reg + m.year + m.prog + m.role).toLowerCase().includes(q));

  tbody.innerHTML = '';
  if (!filtered.length) { if (empty) empty.hidden = false; memberStats(); return; }
  if (empty) empty.hidden = true;

  filtered.forEach((m, i) => {
    const realIdx = members.indexOf(m);
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + (i + 1) + '</td>' +
      '<td><strong>' + esc(m.name) + '</strong></td>' +
      '<td>' + esc(m.reg) + '</td>' +
      '<td>' + esc(m.year) + '</td>' +
      '<td>' + esc(m.prog) + '</td>' +
      '<td>' + esc(m.role) + '</td>' +
      '<td><div class="crud-actions">' +
      '<button type="button" class="btn btn-blue btn-sm" data-action="edit" data-idx="' + realIdx + '"><i class="bi bi-pencil-square" aria-hidden="true"></i> Edit</button>' +
      '<button type="button" class="btn btn-red btn-sm" data-action="delete" data-idx="' + realIdx + '"><i class="bi bi-trash3" aria-hidden="true"></i> Delete</button>' +
      '</div></td>';
    tbody.appendChild(tr);
  });
  memberStats();
}

function initMembersPage() {
  const tbody = document.getElementById('membersBody');
  if (!tbody) return;

  document.getElementById('memberSearch')?.addEventListener('input', renderMembers);
  document.getElementById('memberSaveBtn')?.addEventListener('click', saveMember);
  document.getElementById('memberClearBtn')?.addEventListener('click', clearMemberForm);

  tbody.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    if (btn.dataset.action === 'edit') editMember(idx);
    if (btn.dataset.action === 'delete') deleteMember(idx);
  });

  renderMembers();
}

function saveMember() {
  const val = id => document.getElementById(id)?.value.trim() || '';
  const n = val('mName'), r = val('mReg'), p = val('mProg'), ro = val('mRole');
  const y = document.getElementById('mYear')?.value || '';
  const idx = parseInt(document.getElementById('editIdx')?.value ?? '-1', 10);

  if (!n || !r || !y || !p || !ro) { showToast('Please fill in all fields.', 'error'); return; }

  const entry = { name: n, reg: r, year: y, prog: p, role: ro };
  if (idx >= 0 && members[idx]) { members[idx] = entry; showToast('Member updated.'); }
  else { members.push(entry); showToast('Member added.'); }

  persist(MEMBERS_KEY, members);
  clearMemberForm();
  renderMembers();
}

function editMember(i) {
  const m = members[i];
  if (!m) return;
  document.getElementById('mName').value = m.name;
  document.getElementById('mReg').value = m.reg;
  document.getElementById('mYear').value = m.year;
  document.getElementById('mProg').value = m.prog;
  document.getElementById('mRole').value = m.role;
  document.getElementById('editIdx').value = i;
  const ft = document.getElementById('formTitle');
  if (ft) ft.textContent = 'Edit Member';
  window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

function deleteMember(i) {
  const m = members[i];
  if (!m) return;
  if (!window.confirm('Remove ' + m.name + ' from the member records?')) return;
  members.splice(i, 1);
  persist(MEMBERS_KEY, members);
  renderMembers();
  showToast('Member removed.', 'error');
}

function clearMemberForm() {
  ['mName', 'mReg', 'mProg', 'mRole'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const y = document.getElementById('mYear'); if (y) y.value = '';
  const idx = document.getElementById('editIdx'); if (idx) idx.value = '-1';
  const ft = document.getElementById('formTitle'); if (ft) ft.textContent = 'Add New Member';
}

/* ==================================================
   CONTACT FORM (progressive validation + mailto)
   ================================================== */
const CONTACT_EMAIL = 'students@eastc.ac.tz';
const fieldStatus = { First: false, Last: false, Email: false, Subject: false, Message: false };

function setField(key, valid, msg) {
  const wrap = document.getElementById('w' + key);
  const icon = document.getElementById('i' + key);
  const msgEl = document.getElementById('msg' + key);
  if (!wrap) return;
  const empty = msg === '';
  wrap.classList.toggle('valid', valid && !empty);
  wrap.classList.toggle('invalid', !valid && !empty);
  if (icon) {
    icon.innerHTML = empty ? '' : '<i class="bi ' + (valid ? 'bi-check-circle' : 'bi-exclamation-circle') + '" aria-hidden="true"></i>';
    icon.className = 'field-icon ' + (valid ? 'ok' : 'err');
  }
  if (msgEl) {
    msgEl.textContent = msg || '';
    msgEl.className = 'field-msg ' + (valid ? 'ok' : 'err');
  }
  updateProgress();
  updateSubmitBtn();
}

function validateName(key, inputId) {
  const val = document.getElementById(inputId)?.value.trim() || '';
  const valid = /^[A-Za-z'-]{2,}$/.test(val);
  fieldStatus[key] = valid;
  setField(key, valid, val.length === 0 ? '' : (valid ? 'Looks good.' : 'Use at least 2 letters.'));
}

function validateEmail() {
  const val = document.getElementById('cfEmail')?.value.trim() || '';
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  fieldStatus.Email = valid;
  setField('Email', valid, val.length === 0 ? '' : (valid ? 'Email looks valid.' : 'Enter a valid email, e.g. name@eastc.ac.tz'));
}

function validateReg() {
  const val = document.getElementById('cfReg')?.value.trim() || '';
  if (!val) { setField('Reg', true, ''); return; }
  const valid = /EASTC\/\d{4}\/\d{3}/i.test(val);
  setField('Reg', valid, valid ? 'Registration number recognised.' : 'Format: EASTC/2023/001');
}

function validateSubject() {
  const val = document.getElementById('cfSubject')?.value || '';
  const valid = val.length > 0;
  fieldStatus.Subject = valid;
  setField('Subject', valid, valid ? 'Subject selected.' : '');
}

function validateMessage() {
  const val = document.getElementById('cfMessage')?.value || '';
  const len = val.trim().length;
  const valid = len >= 20;
  fieldStatus.Message = valid;
  const count = document.getElementById('charCount');
  if (count) count.textContent = len;
  setField('Message', valid, len === 0 ? '' : (valid ? 'Message looks good.' : (20 - len) + ' more characters needed.'));
}

function updateProgress() {
  const bar = document.getElementById('formProgress');
  if (!bar) return;
  const done = Object.values(fieldStatus).filter(Boolean).length;
  bar.style.width = Math.round((done / Object.keys(fieldStatus).length) * 100) + '%';
}

function updateSubmitBtn() {
  const btn = document.getElementById('submitBtn');
  if (!btn) return;
  btn.disabled = !Object.values(fieldStatus).every(Boolean);
}

function sendContact() {
  const val = id => document.getElementById(id)?.value.trim() || '';
  const first = val('cfFirst'), last = val('cfLast'), email = val('cfEmail');
  const reg = val('cfReg'), subject = val('cfSubject'), message = val('cfMessage');

  const body = 'Name: ' + first + ' ' + last +
    '\nEmail: ' + email +
    (reg ? '\nRegistration No: ' + reg : '') +
    '\n\n' + message;
  window.location.href = 'mailto:' + CONTACT_EMAIL +
    '?subject=' + encodeURIComponent('[EASTCSO] ' + subject) +
    '&body=' + encodeURIComponent(body);

  document.getElementById('successBox')?.classList.add('show');
  showToast('Opening your email app…');

  ['cfFirst', 'cfLast', 'cfEmail', 'cfReg', 'cfSubject', 'cfMessage'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  Object.keys(fieldStatus).forEach(k => { fieldStatus[k] = false; });
  document.querySelectorAll('.field-wrap').forEach(w => { w.classList.remove('valid', 'invalid'); });
  document.querySelectorAll('.field-icon').forEach(i => { i.innerHTML = ''; });
  document.querySelectorAll('.field-msg').forEach(m => { m.textContent = ''; });
  const count = document.getElementById('charCount'); if (count) count.textContent = '0';
  updateProgress();
  updateSubmitBtn();
}

function initContactPage() {
  if (!document.getElementById('cfFirst')) return;
  document.getElementById('cfFirst').addEventListener('input', () => validateName('First', 'cfFirst'));
  document.getElementById('cfLast')?.addEventListener('input', () => validateName('Last', 'cfLast'));
  document.getElementById('cfEmail')?.addEventListener('input', validateEmail);
  document.getElementById('cfReg')?.addEventListener('input', validateReg);
  document.getElementById('cfSubject')?.addEventListener('change', validateSubject);
  document.getElementById('cfMessage')?.addEventListener('input', validateMessage);
  document.getElementById('submitBtn')?.addEventListener('click', sendContact);
}

/* ==================================================
   INIT
   ================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMenu();
  initBackToTop();

  annItems = loadStore(ANN_KEY, ANN_SEED);
  members = loadStore(MEMBERS_KEY, []);

  // Page-specific renderers no-op when their elements are absent
  renderHeroNext();
  renderHomeEvents();
  renderHomeNotices();
  initEventsPage();
  initAnnouncementsPage();
  initMembersPage();
  initContactPage();
});

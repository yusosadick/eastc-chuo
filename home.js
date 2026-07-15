/* =============================================
   EASTCSO WEBSITE – MAIN JAVASCRIPT
   Hash router, slideshow, stats, events calendar,
   announcements (localStorage), contact form, toasts
   ============================================= */

'use strict';

/* ============================================================
   1. ROUTER (hash-based: #/home, #/about, ...)
   ============================================================ */
const ROUTES = {
  home: 'Home',
  about: 'About',
  leaders: 'Our Leaders',
  events: 'Events & Calendar',
  services: 'Student Services',
  gallery: 'Photo Gallery',
  announcements: 'Announcements & Notices',
  contact: 'Contact Us',
  admin: 'Announcements Manager'
};
const BASE_TITLE = 'EASTCSO – Eastern Africa Statistical Training Centre Students Organisation';

// Routes without their own nav link highlight a related one
const NAV_ALIAS = { leaders: 'about', admin: 'announcements' };

const PAGE_INIT = {
  home() { initStats(); renderHomeNotices(); renderHomeEvents(); },
  events() { renderEventsPage(); },
  announcements() { renderPublicNotices(); },
  admin() { renderTable(); renderMessages(); }
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  return Object.prototype.hasOwnProperty.call(ROUTES, hash) ? hash : 'home';
}

function render() {
  const route = currentRoute();

  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('page-' + route);
  if (target) target.classList.add('active');

  const navPage = NAV_ALIAS[route] || route;
  document.querySelectorAll('.nav-link').forEach(link => {
    const active = link.dataset.page === navPage;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  closeMenu();
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  document.title = route === 'home' ? BASE_TITLE : ROUTES[route] + ' – EASTCSO';

  if (PAGE_INIT[route]) PAGE_INIT[route]();
}

window.addEventListener('hashchange', render);

/* ============================================================
   1b. THEME (light / dark)
   Follows the system preference until the user explicitly
   chooses via the toggle; the choice is then persisted.
   A small bootstrap script in <head> applies the class before
   first paint to avoid a flash.
   ============================================================ */
const THEME_KEY = 'eastcso_theme';

function storedTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'dark' || t === 'light' ? t : null;
  } catch (err) { return null; }
}

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const rootEl = document.documentElement;
  rootEl.classList.toggle('theme-dark', theme === 'dark');
  rootEl.classList.toggle('theme-light', theme === 'light');

  const btn = document.getElementById('themeToggle');
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

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* private mode */ }
    applyTheme(next);
  });

  // Track OS-level changes while the user has not made an explicit choice
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light');
  });
}

/* ============================================================
   2. MOBILE MENU
   ============================================================ */
function closeMenu() {
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('menuToggle');
  if (nav) nav.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function initMenu() {
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('menuToggle');
  if (!nav || !btn) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

/* ============================================================
   3. HERO SLIDESHOW
   ============================================================ */
let currentSlide = 0;
let slideTimer = null;
const SLIDE_INTERVAL = 7000; // auto-advance every 7 seconds

function initSlideshow() {
  const shell = document.querySelector('.hero-slideshow');
  const slides = document.querySelectorAll('.slide');
  const indicatorsEl = document.getElementById('slideIndicators');
  if (!shell || !slides.length || !indicatorsEl) return;

  indicatorsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'indicator' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => { goToSlide(i); restartSlideTimer(); });
    indicatorsEl.appendChild(dot);
  });

  shell.querySelector('.slide-prev')?.addEventListener('click', () => changeSlide(-1));
  shell.querySelector('.slide-next')?.addEventListener('click', () => changeSlide(1));

  // Pause while the user is reading or interacting
  shell.addEventListener('mouseenter', stopSlideshow);
  shell.addEventListener('mouseleave', startSlideshow);
  shell.addEventListener('focusin', stopSlideshow);
  shell.addEventListener('focusout', startSlideshow);

  startSlideshow();
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('.indicator');
  if (!slides.length) return;

  slides[currentSlide]?.classList.remove('active');
  indicators[currentSlide]?.classList.remove('active');

  currentSlide = ((index % slides.length) + slides.length) % slides.length;

  slides[currentSlide]?.classList.add('active');
  indicators[currentSlide]?.classList.add('active');
}

function changeSlide(direction) {
  goToSlide(currentSlide + direction);
  restartSlideTimer();
}

function startSlideshow() {
  stopSlideshow();
  if (prefersReducedMotion()) return;
  slideTimer = setInterval(() => goToSlide(currentSlide + 1), SLIDE_INTERVAL);
}

function stopSlideshow() {
  if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
}

function restartSlideTimer() {
  stopSlideshow();
  startSlideshow();
}

/* ============================================================
   4. STATS COUNTER ANIMATION
   ============================================================ */
let statsAnimated = false;

function initStats() {
  if (statsAnimated) return;
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (!statNums.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
  statsAnimated = true;
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = target >= 100 ? '+' : '';

  if (prefersReducedMotion()) {
    el.textContent = target + suffix;
    return;
  }

  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const update = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + suffix;
    if (current < target) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ============================================================
   5. GALLERY LIGHTBOX (event delegation)
   ============================================================ */
let lightboxReturnFocus = null;

function initGallery() {
  const grid = document.querySelector('.gallery-grid');
  grid?.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const img = item.querySelector('img');
    const src = item.dataset.full || img?.src || '';
    const caption = item.dataset.caption || img?.alt || '';
    openLightbox(src, caption, item);
  });

  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeLightbox();
  });
}

function openLightbox(src, caption, origin) {
  const overlay = document.getElementById('lightboxOverlay');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if (!overlay || !img || !src) return;

  img.src = src;
  img.alt = caption;
  if (cap) cap.textContent = caption;
  lightboxReturnFocus = origin || null;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('lightboxClose')?.focus();
}

function closeLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (lightboxReturnFocus) { lightboxReturnFocus.focus(); lightboxReturnFocus = null; }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

/* ============================================================
   6. EVENTS CALENDAR
   Source: EASTC Academic Almanac 2025/2026 (almanac.pdf).
   Past events disappear automatically; edit here to update.
   ============================================================ */
const EVENT_CATEGORIES = {
  academic: { label: 'Academic', icon: 'bi-book' },
  holiday: { label: 'Public Holiday', icon: 'bi-sun' },
  ceremony: { label: 'Ceremony', icon: 'bi-award' },
  org: { label: 'Meetings & Governance', icon: 'bi-people' }
};

const EVENTS = [
  { date: '2026-07-17', title: 'Academic Board Meeting', description: 'The EASTC Academic Board convenes to review academic matters, including Trimester Two results.', category: 'org', location: 'EASTC, Dar es Salaam' },
  { date: '2026-07-20', title: 'Trimester Two Provisional Results (NTA 9 / MSc)', description: 'Release of Trimester Two provisional examination results for NTA 9 / MSc. Agric. Stats — appeals window opens.', category: 'academic', location: 'EASTC / SIS' },
  { date: '2026-07-24', title: 'End of Teaching – Semester Two (NTA 4–8)', description: 'Teaching ends for NTA 4–8 Semester Two. Submission of signed coursework to sections/units closes and first-sitting tests end.', category: 'academic', location: 'EASTC' },
  { date: '2026-07-27', endDate: '2026-07-31', title: 'Reading Week (NTA 4–8)', description: 'Reading week ahead of the final examinations. NTA 8 research project reports are due this week.', category: 'academic', location: 'EASTC' },
  { date: '2026-07-29', endDate: '2026-07-30', title: 'Pre-Moderation of Final Examinations (NTA 4–8)', description: 'Pre-moderation of Second Semester final examinations and submission of practical examination requirements to ICT/Examinations officers.', category: 'academic', location: 'EASTC' },
  { date: '2026-08-03', endDate: '2026-08-17', title: 'Second Semester Final Examinations (NTA 4–8)', description: 'Final examinations for all NTA 4–8 programmes. Check the official timetable and arrive early with your examination card.', category: 'academic', location: 'EASTC Examination Rooms' },
  { date: '2026-08-08', title: 'Nane Nane Day', description: 'Farmers\' Day — public holiday across Tanzania.', category: 'holiday', location: 'Public Holiday' },
  { date: '2026-08-18', title: 'Long Vacation Begins · Practical Training Starts', description: 'Long vacation for NTA 4–8 begins. Practical Training (NTA 5–6) and Field Attachment (NTA 7) start, and marking of Semester Two results begins.', category: 'academic', location: 'EASTC' },
  { date: '2026-08-25', title: 'Maulid Day', description: 'Public holiday, subject to confirmation.', category: 'holiday', location: 'Public Holiday', tentative: true },
  { date: '2026-08-28', title: 'Practical Training Ends (NTA 5–6)', description: 'Practical Training for NTA 5–6 ends; submission and marking of Practical Training reports begins.', category: 'academic', location: 'EASTC' },
  { date: '2026-08-30', title: 'EASTC 61st Anniversary', description: 'Celebrating 61 years of the Eastern Africa Statistical Training Centre.', category: 'ceremony', location: 'EASTC Campus' },
  { date: '2026-09-04', title: 'Marking of Semester Two Results Ends (NTA 4–8)', description: 'Marking and processing of NTA 4–8 Second Semester results concludes, ahead of the internal examiners\' meeting.', category: 'academic', location: 'EASTC' },
  { date: '2026-09-08', title: 'Semester Two Provisional Results (NTA 4–8)', description: 'Release of Semester Two provisional examination results — the appeals window opens and preparations for the 12th Graduation Ceremony begin.', category: 'academic', location: 'EASTC / SIS' },
  { date: '2026-09-30', title: 'Academic Year 2025/2026 Ends', description: 'Official close of the 2025/2026 academic year.', category: 'academic', location: 'EASTC' },
  { date: '2026-10-01', title: 'Academic Year 2026/2027 Begins', description: 'The new academic year officially opens (administrative).', category: 'academic', location: 'EASTC' },
  { date: '2026-10-12', title: 'Supplementary / First Sitting Examinations Begin', description: 'Supplementary and first-sitting examinations for all programmes begin, together with NTA 9 / MSc Third Trimester finals.', category: 'academic', location: 'EASTC' },
  { date: '2026-10-14', title: 'Mwalimu Nyerere Day', description: 'Public holiday in honour of Mwalimu Julius Nyerere.', category: 'holiday', location: 'Public Holiday' },
  { date: '2026-11-02', title: 'Orientation & Registration – 2026/2027', description: 'Opening date for NTA 4–9 / MSc programmes: orientation, registration and management meetings for the new academic year.', category: 'academic', location: 'EASTC', tentative: true },
  { date: '2026-11-18', title: 'African Statistics Day', description: 'Celebrating the role of statistics in Africa\'s development — a signature day for the EASTC community.', category: 'ceremony', location: 'EASTC Campus' },
  { date: '2026-11-19', title: 'Student Council', description: 'Student representatives meet to discuss welfare and academic matters.', category: 'org', location: 'EASTC' },
  { date: '2026-11-20', title: '22nd Regional Senate Meeting', description: 'The EASTC Regional Senate holds its 22nd meeting.', category: 'org', location: 'EASTC' },
  { date: '2026-11-26', title: '10th EASTC Convocation & AGM', description: 'The Centre\'s 10th convocation and annual general meeting.', category: 'ceremony', location: 'EASTC', tentative: true },
  { date: '2026-11-27', title: '12th EASTC Graduation Ceremony', description: 'The 12th graduation ceremony of the Eastern Africa Statistical Training Centre — congratulations, graduands!', category: 'ceremony', location: 'EASTC Campus', tentative: true }
];

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function upcomingEvents() {
  const today = todayISO();
  return EVENTS
    .filter(e => (e.endDate || e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function isOngoing(e) {
  const today = todayISO();
  return e.date <= today && today <= (e.endDate || e.date);
}

function dateBadge(iso) {
  const d = new Date(iso + 'T00:00:00');
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('en-GB', { month: 'short' })
  };
}

function renderTopBarTicker() {
  const el = document.getElementById('topBarNext');
  if (!el) return;
  const next = upcomingEvents()[0];
  if (!next) { el.textContent = ''; return; }
  el.innerHTML = '<i class="bi bi-calendar-event" aria-hidden="true"></i> Next: ' +
    escHtml(next.title) + ' — ' + formatDate(next.date);
}

function renderHomeEvents() {
  const wrap = document.getElementById('homeEvents');
  if (!wrap) return;
  const list = upcomingEvents().slice(0, 4);

  wrap.innerHTML = list.map(e => {
    const b = dateBadge(e.date);
    return `
      <div class="event-item">
        <div class="event-date-box" aria-hidden="true">
          <div class="event-day">${b.day}</div>
          <div class="event-month">${b.month}</div>
        </div>
        <div>
          <div class="event-info-title">${escHtml(e.title)}${e.tentative ? ' <span class="tag-tentative">Tentative</span>' : ''}</div>
          <div class="event-info-loc"><i class="bi bi-geo-alt" aria-hidden="true"></i> ${escHtml(e.location)}${isOngoing(e) ? ' · <span class="tag-ongoing">Happening now</span>' : ''}</div>
        </div>
      </div>`;
  }).join('');
}

function renderEventsPage() {
  const wrap = document.getElementById('eventsTimeline');
  if (!wrap) return;
  const list = upcomingEvents();

  if (!list.length) {
    wrap.innerHTML = '<p class="events-empty">No upcoming events at the moment — check back soon or download the almanac below.</p>';
    return;
  }

  const groups = new Map();
  list.forEach(e => {
    const key = e.date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  });

  let html = '';
  groups.forEach((events, key) => {
    const label = new Date(key + '-01T00:00:00')
      .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    html += `<h3 class="events-month">${label}</h3>`;
    html += events.map(eventRow).join('');
  });
  wrap.innerHTML = html;
}

function eventRow(e) {
  const b = dateBadge(e.date);
  const cat = EVENT_CATEGORIES[e.category] || EVENT_CATEGORIES.academic;
  const range = e.endDate ? formatDate(e.date) + ' – ' + formatDate(e.endDate) : formatDate(e.date);

  return `
    <article class="event-row${isOngoing(e) ? ' is-ongoing' : ''}">
      <div class="event-date-box" aria-hidden="true">
        <div class="event-day">${b.day}</div>
        <div class="event-month">${b.month}</div>
      </div>
      <div class="event-row-body">
        <div class="event-row-top">
          <span class="event-chip event-chip--${e.category}"><i class="bi ${cat.icon}" aria-hidden="true"></i> ${cat.label}</span>
          ${e.tentative ? '<span class="event-chip event-chip--tentative">Tentative</span>' : ''}
          ${isOngoing(e) ? '<span class="event-chip event-chip--ongoing">Happening now</span>' : ''}
        </div>
        <h4 class="event-row-title">${escHtml(e.title)}</h4>
        <p class="event-row-desc">${escHtml(e.description)}</p>
        <div class="event-row-meta">
          <span><i class="bi bi-calendar3" aria-hidden="true"></i> ${range}</span>
          <span><i class="bi bi-geo-alt" aria-hidden="true"></i> ${escHtml(e.location)}</span>
        </div>
      </div>
    </article>`;
}

/* ============================================================
   7. DATA STORE (localStorage with seed fallback)
   ============================================================ */
const LS_ANNOUNCEMENTS = 'eastcso.announcements.v1';
const LS_MESSAGES = 'eastcso.messages.v1';

const SEED_ANNOUNCEMENTS = [
  {
    id: 'seed-1',
    title: 'Final Examinations – Semester Two Timetable',
    category: 'Academic',
    description: 'Second Semester Final Examinations for NTA 4–8 run from 3 to 17 August 2026. Check the official timetable on the notice boards and SIS, and carry your examination card.',
    date: '2026-08-03',
    status: 'Active',
    createdAt: '15/07/2026'
  },
  {
    id: 'seed-2',
    title: 'Reading Week Starts 27 July',
    category: 'Notice',
    description: 'Reading week for NTA 4–8 runs from 27 to 31 July 2026. NTA 8 research project reports are due the same week — plan your revision early.',
    date: '2026-07-27',
    status: 'Active',
    createdAt: '15/07/2026'
  },
  {
    id: 'seed-3',
    title: 'EASTC 61st Anniversary Celebrations',
    category: 'General',
    description: 'EASTC marks its 61st anniversary on 30 August 2026. Details of student activities and celebrations will be announced by the executive.',
    date: '2026-08-30',
    status: 'Active',
    createdAt: '15/07/2026'
  },
  {
    id: 'seed-4',
    title: 'Night of Awards – Wasomi League 2025/26',
    category: 'Sports',
    description: 'The Wasomi League awards ceremony was held on 1 May 2026 at 6:00 PM in the Temp Class, with President Mario Macha as guest of honour. Thank you to everyone who attended!',
    date: '2026-05-01',
    status: 'Archived',
    createdAt: '01/05/2026'
  }
];

let announcements = [];
let messages = [];

function loadStore(key, seeds) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1 && Array.isArray(parsed.items)) return parsed.items;
    }
  } catch (err) {
    // Corrupt or unavailable storage — fall through to seeds
  }
  persist(key, seeds);
  return seeds.slice();
}

function persist(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify({ v: 1, items }));
  } catch (err) {
    // Storage unavailable (e.g. private mode) — data stays in memory
  }
}

/* ============================================================
   8. ANNOUNCEMENTS – ADMIN CRUD (#/admin)
   ============================================================ */
let editingId = null;

function refreshAnnouncementViews() {
  renderTable();
  renderPublicNotices();
  renderHomeNotices();
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const recordCount = document.getElementById('recordCount');
  if (!tbody) return;

  const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const filtered = announcements.filter(a =>
    a.title.toLowerCase().includes(searchVal) ||
    a.category.toLowerCase().includes(searchVal) ||
    a.description.toLowerCase().includes(searchVal) ||
    a.status.toLowerCase().includes(searchVal)
  );

  tbody.innerHTML = '';

  if (!filtered.length) {
    if (emptyState) emptyState.hidden = false;
    if (recordCount) recordCount.textContent = 'No records found.';
    return;
  }

  if (emptyState) emptyState.hidden = true;
  if (recordCount) recordCount.textContent = `Showing ${filtered.length} of ${announcements.length} record(s)`;

  filtered.forEach((ann, i) => {
    const catBadgeClass = ann.category === 'Sports' ? 'badge-event'
      : ann.category === 'Notice' ? 'badge-notice' : 'badge-active';

    const statusBadge = ann.status === 'Active'
      ? '<span class="badge badge-active"><i class="bi bi-check-circle" aria-hidden="true"></i> Active</span>'
      : '<span class="badge badge-archived"><i class="bi bi-archive" aria-hidden="true"></i> Archived</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${escHtml(ann.title)}</strong><br/><small>${escHtml(ann.description.substring(0, 50))}${ann.description.length > 50 ? '...' : ''}</small></td>
      <td><span class="badge ${catBadgeClass}">${escHtml(ann.category)}</span></td>
      <td class="nowrap">${formatDate(ann.date)}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="table-actions">
          <button type="button" class="btn-edit" data-action="edit" data-id="${escHtml(ann.id)}"><i class="bi bi-pencil-square" aria-hidden="true"></i> Edit</button>
          <button type="button" class="btn-delete" data-action="delete" data-id="${escHtml(ann.id)}"><i class="bi bi-trash3" aria-hidden="true"></i> Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function saveAnnouncement() {
  const title = document.getElementById('annTitle')?.value.trim();
  const category = document.getElementById('annCategory')?.value;
  const desc = document.getElementById('annDesc')?.value.trim();
  const date = document.getElementById('annDate')?.value;
  const status = document.getElementById('annStatus')?.value;

  clearFormAlert();

  if (!title) { showFormAlert('Please enter a title for the announcement.', 'error'); return; }
  if (!desc) { showFormAlert('Please enter a description.', 'error'); return; }

  if (editingId !== null) {
    const idx = announcements.findIndex(a => a.id === editingId);
    if (idx !== -1) {
      announcements[idx] = { ...announcements[idx], title, category, description: desc, date, status };
      showToast('Announcement updated.', 'success');
    }
    editingId = null;
    setFormTitle('Add New Announcement');
    const editEl = document.getElementById('editId');
    if (editEl) editEl.value = '';
  } else {
    announcements.unshift({
      id: 'a-' + Date.now(),
      title, category, description: desc, date, status,
      createdAt: new Date().toLocaleDateString('en-GB')
    });
    showToast('New announcement added.', 'success');
  }

  persist(LS_ANNOUNCEMENTS, announcements);
  clearForm();
  refreshAnnouncementViews();
}

function editAnnouncement(id) {
  const ann = announcements.find(a => a.id === id);
  if (!ann) return;

  editingId = id;
  setFormTitle('Edit Announcement');
  setValue('annTitle', ann.title);
  setValue('annCategory', ann.category);
  setValue('annDesc', ann.description);
  setValue('annDate', ann.date);
  setValue('annStatus', ann.status);

  document.querySelector('.crud-form-card')?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start'
  });
  clearFormAlert();
}

function confirmDelete(id) {
  const ann = announcements.find(a => a.id === id);
  if (!ann) return;

  const confirmed = window.confirm(`Are you sure you want to delete:\n"${ann.title}"?\n\nThis cannot be undone.`);
  if (!confirmed) return;

  announcements = announcements.filter(a => a.id !== id);
  persist(LS_ANNOUNCEMENTS, announcements);
  if (editingId === id) cancelEdit();
  refreshAnnouncementViews();
  showToast('Announcement deleted.', 'error');
}

function cancelEdit() {
  editingId = null;
  setFormTitle('Add New Announcement');
  const editEl = document.getElementById('editId');
  if (editEl) editEl.value = '';
  clearForm();
  clearFormAlert();
}

function clearForm() {
  ['annTitle', 'annDesc'].forEach(id => setValue(id, ''));
  setValue('annCategory', 'Notice');
  setValue('annStatus', 'Active');
  setDefaultDate();
}

function setFormTitle(text) {
  const el = document.getElementById('formTitle');
  if (el) el.textContent = text;
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function showFormAlert(msg, type) {
  const el = document.getElementById('formAlert');
  if (!el) return;
  el.className = 'alert ' + type;
  el.textContent = msg;
}

function clearFormAlert() {
  const el = document.getElementById('formAlert');
  if (el) { el.className = 'alert'; el.textContent = ''; }
}

function exportCSV() {
  if (!announcements.length) { showToast('There is no data to export.', 'error'); return; }

  const headers = ['#', 'Title', 'Category', 'Description', 'Date', 'Status', 'Created'];
  const rows = announcements.map((a, i) => [
    i + 1,
    `"${a.title.replace(/"/g, '""')}"`,
    a.category,
    `"${a.description.replace(/"/g, '""')}"`,
    a.date,
    a.status,
    a.createdAt
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'EASTCSO_Announcements.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported successfully.', 'success');
}

function initAdminUI() {
  document.getElementById('saveAnnBtn')?.addEventListener('click', saveAnnouncement);
  document.getElementById('cancelAnnBtn')?.addEventListener('click', cancelEdit);
  document.getElementById('exportCsvBtn')?.addEventListener('click', exportCSV);
  document.getElementById('searchInput')?.addEventListener('input', renderTable);
  document.getElementById('searchBtn')?.addEventListener('click', renderTable);

  document.getElementById('tableBody')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'edit') editAnnouncement(btn.dataset.id);
    if (btn.dataset.action === 'delete') confirmDelete(btn.dataset.id);
  });
}

/* ============================================================
   9. ANNOUNCEMENTS – PUBLIC VIEWS
   ============================================================ */
function activeNotices() {
  return announcements
    .filter(a => a.status === 'Active')
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function renderPublicNotices() {
  const wrap = document.getElementById('publicNotices');
  if (!wrap) return;
  const active = activeNotices();

  if (!active.length) {
    wrap.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox empty-icon" aria-hidden="true"></i>
        <p>No notices published at the moment — check back soon.</p>
      </div>`;
    return;
  }

  wrap.innerHTML = active.map(a => `
    <article class="notice-card">
      <div class="notice-head">
        <span class="badge badge-cat">${escHtml(a.category)}</span>
        <span class="notice-date"><i class="bi bi-calendar3" aria-hidden="true"></i> ${formatDate(a.date)}</span>
      </div>
      <h3 class="notice-title">${escHtml(a.title)}</h3>
      <p class="notice-text">${escHtml(a.description)}</p>
    </article>`).join('');
}

function renderHomeNotices() {
  const wrap = document.getElementById('homeNotices');
  if (!wrap) return;
  const latest = activeNotices().slice(0, 3);

  if (!latest.length) {
    wrap.innerHTML = '<p class="announcement-text">No notices published at the moment.</p>';
    return;
  }

  wrap.innerHTML = latest.map(a => `
    <div class="announcement-item">
      <div class="announcement-date"><i class="bi bi-calendar3" aria-hidden="true"></i> ${formatDate(a.date)}</div>
      <p class="announcement-text">${escHtml(a.title)} — ${escHtml(a.description.substring(0, 90))}${a.description.length > 90 ? '...' : ''}</p>
    </div>`).join('');
}

/* ============================================================
   10. CONTACT FORM (saves locally + opens WhatsApp)
   ============================================================ */
const WHATSAPP_NUMBER = '255693827599';

function submitContact() {
  const name = document.getElementById('contactName')?.value.trim();
  const email = document.getElementById('contactEmail')?.value.trim();
  const subject = document.getElementById('contactSubject')?.value;
  const message = document.getElementById('contactMessage')?.value.trim();

  const alertEl = document.getElementById('contactAlert');
  if (alertEl) { alertEl.className = 'alert'; alertEl.textContent = ''; }

  if (!name) { showAlert('contactAlert', 'Please enter your name.', 'error'); return; }
  if (!email) { showAlert('contactAlert', 'Please enter your phone number or email.', 'error'); return; }
  if (!message) { showAlert('contactAlert', 'Please write a message.', 'error'); return; }

  messages.push({
    id: 'm-' + Date.now(),
    name, email, subject, message,
    time: new Date().toLocaleString('en-GB')
  });
  persist(LS_MESSAGES, messages);

  const text = `Hello EASTCSO!\nName: ${name}\nSubject: ${subject}\nContact: ${email}\n\n${message}`;
  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');

  ['contactName', 'contactEmail', 'contactMessage'].forEach(id => setValue(id, ''));

  showAlert('contactAlert', `Thank you, ${name}! WhatsApp is opening with your message prefilled — press send there to deliver it.`, 'success');
  showToast('Opening WhatsApp...', 'success');
  renderMessages();
}

function renderMessages() {
  const list = document.getElementById('messagesList');
  const container = document.getElementById('messagesContainer');
  const count = document.getElementById('msgCount');
  if (!list || !container) return;

  if (!messages.length) { list.hidden = true; return; }

  list.hidden = false;
  if (count) count.textContent = messages.length;

  container.innerHTML = messages.slice().reverse().map(m => `
    <div class="message-card">
      <div class="message-head">
        <strong class="message-name"><i class="bi bi-person-circle" aria-hidden="true"></i> ${escHtml(m.name)}</strong>
        <span class="message-time">${escHtml(m.time)}</span>
      </div>
      <div class="message-meta">${escHtml(m.subject)} · ${escHtml(m.email)}</div>
      <p class="message-body">${escHtml(m.message)}</p>
    </div>
  `).join('');
}

/* ============================================================
   11. TOAST NOTIFICATIONS (XSS-safe)
   ============================================================ */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;

  const icon = document.createElement('i');
  icon.className = 'bi ' + (type === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle');
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.textContent = msg;

  toast.append(icon, text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============================================================
   12. UTILITIES
   ============================================================ */
function showAlert(targetId, msg, type) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.className = 'alert ' + type;
  el.textContent = msg;
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function setDefaultDate() {
  setValue('annDate', todayISO());
}

/* ============================================================
   13. SCROLL EFFECT – header shadow
   ============================================================ */
window.addEventListener('scroll', () => {
  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ============================================================
   14. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  announcements = loadStore(LS_ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  messages = loadStore(LS_MESSAGES, []);

  initTheme();
  initMenu();
  initSlideshow();
  initGallery();
  initAdminUI();
  document.getElementById('contactSendBtn')?.addEventListener('click', submitContact);

  setDefaultDate();
  renderTopBarTicker();

  render(); // initial route from location.hash (defaults to home)

  console.log('%cEASTCSO Website Loaded', 'color:#C8922A;font-weight:bold;font-size:14px;');
  console.log('%cServing Students Through Students – 2025/2026', 'color:#0A1628;font-size:12px;');
});

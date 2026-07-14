/* =============================================
   EASTCSO WEBSITE – MAIN JAVASCRIPT
   Full functionality: Navigation, Slideshow,
   Stats Counter, CRUD, Contact Form, Toast
   ============================================= */

'use strict';

/* ============================================================
   1. PAGE NAVIGATION
   ============================================================ */
const PAGES = ['home', 'about', 'leaders', 'events', 'services', 'gallery', 'announcements', 'contact'];

function navigateTo(pageId) {
  if (!PAGES.includes(pageId)) return;

  // Hide all sections
  PAGES.forEach(id => {
    const el = document.getElementById('page-' + id);
    if (el) el.classList.remove('active');
  });

  // Show target
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) link.classList.add('active');
  });

  // Close mobile menu
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.remove('open');

  // Run page-specific init
  if (pageId === 'home') initStats();
  if (pageId === 'announcements') renderTable();
}

/* ============================================================
   2. MOBILE MENU TOGGLE
   ============================================================ */
function toggleMenu() {
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('open');
}

/* ============================================================
   3. HERO SLIDESHOW
   ============================================================ */
let currentSlide = 0;
let slideTimer = null;
const SLIDE_INTERVAL = 7000; // 2 seconds as requested

function initSlideshow() {
  const slides = document.querySelectorAll('.slide');
  const indicatorsEl = document.getElementById('slideIndicators');

  if (!slides.length || !indicatorsEl) return;

  // Build indicators
  indicatorsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'indicator' + (i === 0 ? ' active' : '');
    dot.onclick = () => goToSlide(i);
    indicatorsEl.appendChild(dot);
  });

  startSlideshow();
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('.indicator');

  slides[currentSlide].classList.remove('active');
  if (indicators[currentSlide]) indicators[currentSlide].classList.remove('active');

  currentSlide = (index + slides.length) % slides.length;

  slides[currentSlide].classList.add('active');
  if (indicators[currentSlide]) indicators[currentSlide].classList.add('active');
}

function changeSlide(direction) {
  const slides = document.querySelectorAll('.slide');
  goToSlide(currentSlide + direction);
  restartSlideTimer();
}

function startSlideshow() {
  if (slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    const slides = document.querySelectorAll('.slide');
    goToSlide((currentSlide + 1) % slides.length);
  }, SLIDE_INTERVAL);
}

function restartSlideTimer() {
  clearInterval(slideTimer);
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
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const update = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + (target >= 100 ? '+' : '');
    if (current < target) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ============================================================
   5. GALLERY LIGHTBOX
   ============================================================ */
function openLightbox(src, caption) {
  const overlay = document.getElementById('lightboxOverlay');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if (!overlay || !img) return;

  img.src = src;
  img.alt = caption;
  if (cap) cap.textContent = caption;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightboxOverlay') && !e.target.closest('button')) return;
  const overlay = document.getElementById('lightboxOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Also close on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox({ target: document.getElementById('lightboxOverlay') });
    closeModal('deleteModal');
  }
});

/* ============================================================
   6. CRUD – ANNOUNCEMENTS MANAGER
   ============================================================ */
// In-memory data store (persists during session)
let announcements = [
  {
    id: 1,
    title: 'Mwisho wa Mradi wa Web Design',
    category: 'Academic',
    description: 'Tarehe ya mwisho ya kuwasilisha mradi wa Web Design and Development ni 30 Juni 2026 kupitia Moodle. Hakikisha kazi iko tayari.',
    date: '2026-06-30',
    status: 'Active',
    createdAt: new Date().toLocaleDateString()
  },
  {
    id: 2,
    title: 'Uwasilishaji wa Vikundi – Julai 2026',
    category: 'Academic',
    description: 'Group Presentations zitafanyika wiki ya kwanza ya Julai 2026. Tathmini itajumuisha alama za kikundi na za mtu binafsi.',
    date: '2026-07-07',
    status: 'Active',
    createdAt: new Date().toLocaleDateString()
  },
  {
    id: 3,
    title: 'Night of Awards – Wasomi League 2025/26',
    category: 'Sports',
    description: 'Sherehe ya utoaji tuzo za Ligi ya Wasomi ilifanyika tarehe 01 May 2026 saa 12 jioni katika Temp Class. Mgeni Rasmi: Rais Macha Mario.',
    date: '2026-05-01',
    status: 'Archived',
    createdAt: '01/05/2026'
  },
  {
    id: 4,
    title: 'EASTCSO Kikao cha Uongozi',
    category: 'Notice',
    description: 'Kikao cha dharura cha uongozi wa EASTCSO kitafanyika ili kujadili masuala ya wanafunzi na ustawi wa jumla.',
    date: '2026-07-15',
    status: 'Active',
    createdAt: new Date().toLocaleDateString()
  }
];

let nextId = 5;
let editingId = null;
let deleteTargetId = null;

// ---- Render table ----
function renderTable() {
  const tbody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const recordCount = document.getElementById('recordCount');
  const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();

  const filtered = announcements.filter(a =>
    a.title.toLowerCase().includes(searchVal) ||
    a.category.toLowerCase().includes(searchVal) ||
    a.description.toLowerCase().includes(searchVal) ||
    a.status.toLowerCase().includes(searchVal)
  );

  if (!tbody) return;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (recordCount) recordCount.textContent = 'No records found.';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (recordCount) recordCount.textContent = `Showing ${filtered.length} of ${announcements.length} record(s)`;

  filtered.forEach((ann, i) => {
    const catBadgeClass = ann.category === 'Sports' ? 'badge-event'
      : ann.category === 'Notice' ? 'badge-notice' : 'badge-active';

    const statusBadge = ann.status === 'Active'
      ? '<span class="badge badge-active">✅ Active</span>'
      : '<span class="badge" style="background:#e9ecef;color:#6c757d;">📦 Archived</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${escHtml(ann.title)}</strong><br/><small style="color:var(--gray-500);font-size:0.75rem;">${escHtml(ann.description.substring(0, 50))}${ann.description.length > 50 ? '...' : ''}</small></td>
      <td><span class="badge ${catBadgeClass}">${escHtml(ann.category)}</span></td>
      <td style="white-space:nowrap;">${formatDate(ann.date)}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="table-actions">
          <button class="btn-edit" onclick="editAnnouncement(${ann.id})">✏️ Edit</button>
          <button class="btn-delete" onclick="confirmDelete(${ann.id})">🗑️ Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ---- Save (Create / Update) ----
function saveAnnouncement() {
  const title = document.getElementById('annTitle')?.value.trim();
  const category = document.getElementById('annCategory')?.value;
  const desc = document.getElementById('annDesc')?.value.trim();
  const date = document.getElementById('annDate')?.value;
  const status = document.getElementById('annStatus')?.value;

  clearFormAlert();

  if (!title) { showFormAlert('⚠️ Tafadhali weka kichwa cha tangazo.', 'error'); return; }
  if (!desc) { showFormAlert('⚠️ Tafadhali weka maelezo.', 'error'); return; }

  if (editingId !== null) {
    // UPDATE
    const idx = announcements.findIndex(a => a.id === editingId);
    if (idx !== -1) {
      announcements[idx] = { ...announcements[idx], title, category, description: desc, date, status };
      showToast('✅ Tangazo limesasishwa!', 'success');
    }
    editingId = null;
    document.getElementById('formTitle').textContent = '➕ Add New Announcement';
    document.getElementById('editId').value = '';
  } else {
    // CREATE
    announcements.unshift({ id: nextId++, title, category, description: desc, date, status, createdAt: new Date().toLocaleDateString() });
    showToast('✅ Tangazo jipya limeongezwa!', 'success');
  }

  clearForm();
  renderTable();
}

// ---- Edit ----
function editAnnouncement(id) {
  const ann = announcements.find(a => a.id === id);
  if (!ann) return;

  editingId = id;
  document.getElementById('formTitle').textContent = '✏️ Edit Announcement';
  document.getElementById('annTitle').value = ann.title;
  document.getElementById('annCategory').value = ann.category;
  document.getElementById('annDesc').value = ann.description;
  document.getElementById('annDate').value = ann.date;
  document.getElementById('annStatus').value = ann.status;

  // Scroll to form
  document.querySelector('.crud-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  clearFormAlert();
}

// ---- Delete (with confirmation) ----
function confirmDelete(id) {
  const ann = announcements.find(a => a.id === id);
  if (!ann) return;
  deleteTargetId = id;

  const confirmed = window.confirm(`Je, una uhakika unataka kufuta tangazo:\n"${ann.title}"?\n\nHii haiwezi kurudishwa.`);
  if (confirmed) deleteAnnouncement();
}

function deleteAnnouncement() {
  if (deleteTargetId === null) return;
  announcements = announcements.filter(a => a.id !== deleteTargetId);
  deleteTargetId = null;
  if (editingId !== null) cancelEdit();
  renderTable();
  showToast('🗑️ Tangazo limefutwa.', 'error');
}

// ---- Cancel edit ----
function cancelEdit() {
  editingId = null;
  document.getElementById('formTitle').textContent = '➕ Add New Announcement';
  document.getElementById('editId').value = '';
  clearForm();
  clearFormAlert();
}

// ---- Clear form ----
function clearForm() {
  ['annTitle', 'annDesc', 'annDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const cat = document.getElementById('annCategory');
  const stat = document.getElementById('annStatus');
  if (cat) cat.value = 'Notice';
  if (stat) stat.value = 'Active';
}

// ---- Form alerts ----
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

// ---- Export CSV ----
function exportCSV() {
  if (!announcements.length) { showToast('Hakuna data ya ku-export.', 'error'); return; }

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
  showToast('📤 CSV exported successfully!', 'success');
}

/* ============================================================
   7. CONTACT FORM
   ============================================================ */
let messages = [];

function submitContact() {
  const name = document.getElementById('contactName')?.value.trim();
  const email = document.getElementById('contactEmail')?.value.trim();
  const subject = document.getElementById('contactSubject')?.value;
  const message = document.getElementById('contactMessage')?.value.trim();

  const alertEl = document.getElementById('contactAlert');
  if (alertEl) { alertEl.className = 'alert'; alertEl.textContent = ''; }

  if (!name) { showAlert('contactAlert', '⚠️ Tafadhali weka jina lako.', 'error'); return; }
  if (!email) { showAlert('contactAlert', '⚠️ Tafadhali weka nambari au barua pepe.', 'error'); return; }
  if (!message) { showAlert('contactAlert', '⚠️ Tafadhali andika ujumbe.', 'error'); return; }

  messages.push({
    id: Date.now(),
    name, email, subject, message,
    time: new Date().toLocaleString()
  });

  // Clear form
  ['contactName', 'contactEmail', 'contactMessage'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });

  showAlert('contactAlert', `✅ Asante ${name}! Ujumbe wako umepokewa. Tutawasiliana nawe hivi karibuni.`, 'success');
  showToast('📨 Ujumbe umetumwa!', 'success');

  renderMessages();
}

function renderMessages() {
  const list = document.getElementById('messagesList');
  const container = document.getElementById('messagesContainer');
  const count = document.getElementById('msgCount');

  if (!list || !container) return;

  if (messages.length === 0) { list.style.display = 'none'; return; }

  list.style.display = 'block';
  if (count) count.textContent = messages.length;

  container.innerHTML = messages.slice().reverse().map(m => `
    <div style="background:var(--off-white);border-radius:8px;padding:14px;margin-bottom:10px;border-left:3px solid var(--gold);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px;">
        <strong style="color:var(--navy);font-size:0.9rem;">👤 ${escHtml(m.name)}</strong>
        <span style="font-size:0.72rem;color:var(--gray-500);">🕐 ${m.time}</span>
      </div>
      <div style="font-size:0.78rem;color:var(--gold);margin-bottom:6px;">📌 ${escHtml(m.subject)} | 📞 ${escHtml(m.email)}</div>
      <p style="font-size:0.86rem;color:var(--gray-700);line-height:1.6;">${escHtml(m.message)}</p>
    </div>
  `).join('');
}

/* ============================================================
   8. MODAL HELPERS
   ============================================================ */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   9. TOAST NOTIFICATIONS
   ============================================================ */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============================================================
   10. UTILITY FUNCTIONS
   ============================================================ */
function showAlert(targetId, msg, type) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.className = 'alert ' + type;
  el.textContent = msg;
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

/* ============================================================
   11. SCROLL EFFECTS – Header shadow
   ============================================================ */
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  if (window.scrollY > 20) {
    header.style.boxShadow = '0 4px 32px rgba(10,22,40,0.28)';
  } else {
    header.style.boxShadow = '';
  }
});

/* ============================================================
   12. FOOTER LINKS – navigate from footer
   ============================================================ */
function initFooterLinks() {
  document.querySelectorAll('.footer-link[onclick]').forEach(el => {
    // already wired via onclick attr
  });
}

/* ============================================================
   13. SET TODAY'S DATE DEFAULT ON CRUD FORM
   ============================================================ */
function setDefaultDate() {
  const dateInput = document.getElementById('annDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

/* ============================================================
   14. INIT ON DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Start with home page active
  navigateTo('home');

  // Init slideshow
  initSlideshow();

  // Set default date for CRUD form
  setDefaultDate();

  // Stats animation on initial view
  setTimeout(initStats, 400);

  // Init footer links
  initFooterLinks();

  // Render initial CRUD table (in background)
  renderTable();

  console.log('%cEASTCSO Website Loaded ✓', 'color:#C8922A;font-weight:bold;font-size:14px;');
  console.log('%cServing Students Through Students – 2025/2026', 'color:#0A1628;font-size:12px;');
});
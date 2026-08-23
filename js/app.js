// ======================================================
// app.js - منطق التطبيق الرئيسي
// ======================================================

// ---- حالة التطبيق ----
let currentPage = 'dashboard';
let currentCycle = null;
let historyFilter = 'all';
let formsFilter = 'all';
let selectedFormsForDist = [];
let selectedFormsForRep = [];

// ---- التهيئة ----
function init() {
  currentCycle = CycleService.getActive();
  updateCycleUI();
  populateCycleSelects();
  populateParticipantSelects();
  populateRepSelects();
  setupEventListeners();
  navigateTo('dashboard');
}

// ---- تحديث معلومات الدورة ----
function updateCycleUI() {
  currentCycle = CycleService.getActive();
  const badge = document.getElementById('cycleInfo');
  const navBadge = document.getElementById('availableBadge');

  if (currentCycle) {
    badge.innerHTML = `<span class="cycle-badge">📅 ${currentCycle.name}</span>`;
    const stats = CycleService.getStats(currentCycle.id);
    if (navBadge) navBadge.textContent = stats.available;
  } else {
    badge.innerHTML = `<span class="cycle-badge">لا توجد دورة نشطة</span>`;
    if (navBadge) navBadge.textContent = '0';
  }
}

// ---- التنقل بين الصفحات ----
function navigateTo(page) {
  // إخفاء جميع الصفحات
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  // إظهار الصفحة المطلوبة
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.remove('hidden');

  // تحديث التنقل
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  currentPage = page;

  // تحديث العنوان
  const titles = {
    dashboard: 'لوحة التحكم',
    forms: 'الاستمارات',
    participants: 'المشتركون',
    representatives: 'المندوبون',
    distribution: 'التوزيع والحجز',
    reports: 'التقارير',
    cycles: 'الدورات',
    settings: 'الإعدادات'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  // تحديث محتوى الصفحة
  renderPage(page);
}

// ---- عرض الصفحات ----
function renderPage(page) {
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'forms': renderForms(); break;
    case 'participants': renderParticipants(); break;
    case 'representatives': renderRepresentatives(); break;
    case 'distribution': renderDistribution(); break;
    case 'reports': renderReports(); break;
    case 'cycles': renderCycles(); break;
    case 'settings': renderSettings(); break;
  }
}

// =====================
// لوحة التحكم
// =====================
function renderDashboard() {
  if (!currentCycle) {
    document.getElementById('stat-available').textContent = TOTAL_FORMS;
    document.getElementById('stat-distributed').textContent = 0;
    document.getElementById('stat-reserved').textContent = 0;
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('progressDistributed').style.width = '0%';
    document.getElementById('progressReserved').style.width = '0%';
    renderActivity();
    return;
  }

  const stats = CycleService.getStats(currentCycle.id);

  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-available').textContent = stats.available;
  document.getElementById('stat-distributed').textContent = stats.distributed;
  document.getElementById('stat-reserved').textContent = stats.reserved;

  const distPct = Math.round((stats.distributed / stats.total) * 100);
  const resPct = Math.round((stats.reserved / stats.total) * 100);
  const totalPct = distPct + resPct;

  document.getElementById('progressPercent').textContent = `${totalPct}%`;
  document.getElementById('progressDistributed').style.width = `${distPct}%`;
  document.getElementById('progressReserved').style.width = `${resPct}%`;

  // إحصاءات المشتركين
  const participants = ParticipantService.getAll();
  const withForms = participants.filter(p => {
    const f = ParticipantService.getForms(p.id, currentCycle.id);
    return f.length > 0;
  });

  document.getElementById('ds-participants').textContent = participants.length;
  document.getElementById('ds-participants-with-forms').textContent = withForms.length;
  document.getElementById('ds-participants-without-forms').textContent = participants.length - withForms.length;

  // إحصاءات المندوبين
  const reps = RepresentativeService.getAll();
  const repsWithForms = reps.filter(r => {
    const rf = RepresentativeService.getReservedForms(r.id, currentCycle.id);
    const df = RepresentativeService.getDistributedForms(r.id, currentCycle.id);
    return rf.length + df.length > 0;
  });

  document.getElementById('ds-representatives').textContent = reps.length;
  document.getElementById('ds-reps-with-forms').textContent = repsWithForms.length;

  const totalRepForms = repsWithForms.reduce((sum, r) => {
    return sum + RepresentativeService.getReservedForms(r.id, currentCycle.id).length
                + RepresentativeService.getDistributedForms(r.id, currentCycle.id).length;
  }, 0);
  document.getElementById('ds-avg-forms').textContent =
    repsWithForms.length > 0 ? Math.round(totalRepForms / repsWithForms.length) : 0;

  // معلومات الدورة
  document.getElementById('ds-cycle-name').textContent = currentCycle.name;
  document.getElementById('ds-cycle-start').textContent = currentCycle.startDate ? formatDate(currentCycle.startDate) : '-';
  document.getElementById('ds-cycle-end').textContent = currentCycle.endDate ? formatDate(currentCycle.endDate) : '-';

  renderActivity();
}

function renderActivity() {
  const container = document.getElementById('recentActivity');
  const activities = ActivityService.getRecent();

  if (activities.length === 0) {
    container.innerHTML = `<div class="empty-state"><span>📭</span><p>لا توجد عمليات حديثة</p></div>`;
    return;
  }

  const icons = {
    distributed: '📤', reserved: '🔒', cancelled: '❌', transferred: '🔄',
    cycle_created: '🔄', cycle_deleted: '🗑️', participant_added: '👤',
    participant_updated: '✏️', participant_deleted: '🗑️', rep_added: '👔',
    rep_updated: '✏️', rep_deleted: '🗑️'
  };

  container.innerHTML = activities.slice(0, 10).map(a => `
    <div class="activity-item">
      <span class="activity-icon">${icons[a.type] || '📌'}</span>
      <span class="activity-text">${a.message}</span>
      <span class="activity-time">${timeAgo(a.createdAt)}</span>
    </div>
  `).join('');
}

// =====================
// الاستمارات
// =====================
function renderForms() {
  const cycleId = currentCycle?.id;
  const search = document.getElementById('formsSearch')?.value?.toLowerCase() || '';

  // حساب الأعداد
  let counts = { all: TOTAL_FORMS, available: 0, distributed: 0, reserved: 0 };

  const formStatuses = {};
  if (cycleId) {
    const db = loadDB();
    db.distributions.filter(d => d.cycleId === cycleId && d.status !== 'cancelled').forEach(d => {
      formStatuses[d.formId] = d;
    });
    counts.distributed = Object.values(formStatuses).filter(d => d.status === 'distributed').length;
    counts.reserved = Object.values(formStatuses).filter(d => d.status === 'reserved').length;
    counts.available = TOTAL_FORMS - counts.distributed - counts.reserved;
  } else {
    counts.available = TOTAL_FORMS;
  }

  // تحديث عدادات الفلتر
  document.getElementById('fc-all').textContent = counts.all;
  document.getElementById('fc-available').textContent = counts.available;
  document.getElementById('fc-distributed').textContent = counts.distributed;
  document.getElementById('fc-reserved').textContent = counts.reserved;

  // الشارة في التنقل
  document.getElementById('availableBadge').textContent = counts.available;

  // بناء الشبكة
  const grid = document.getElementById('formsGrid');

  let formsToShow = FORMS_DATA.filter(f => {
    if (search && !String(f.id).includes(search) && !f.startVerse?.includes(search) && !f.endVerse?.includes(search)) {
      return false;
    }
    if (formsFilter === 'all') return true;
    const dist = formStatuses[f.id];
    const status = dist ? dist.status : 'available';
    return status === formsFilter;
  });

  if (formsToShow.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span>🔍</span><p>لا توجد نتائج</p></div>`;
    return;
  }

  grid.innerHTML = formsToShow.map(f => {
    const dist = formStatuses[f.id];
    const status = dist ? dist.status : 'available';
    const statusLabels = { available: 'متاحة', distributed: 'موزعة', reserved: 'محجوزة' };
    let assigneeHtml = '';

    if (dist) {
      if (dist.status === 'distributed' && dist.participantId) {
        const p = ParticipantService.getById(dist.participantId);
        assigneeHtml = `<span class="form-assignee">👤 ${p?.name || '؟'}</span>`;
      } else if (dist.status === 'reserved' && dist.representativeId) {
        const r = RepresentativeService.getById(dist.representativeId);
        assigneeHtml = `<span class="form-assignee">🧑‍💼 ${r?.name || '؟'}</span>`;
      }
    }

    return `
      <div class="form-card ${status}" onclick="showFormDetails(${f.id})" title="${f.description || ''}">
        <span class="form-status-badge status-${status}">${statusLabels[status] || status}</span>
        <span class="form-num">${f.id}</span>
        <span class="form-pages">ص ${f.startPage}${f.endPage !== f.startPage ? ` - ${f.endPage}` : ''}</span>
        <span class="form-verse">${f.startVerse || ''}</span>
        ${assigneeHtml}
      </div>
    `;
  }).join('');
}

function showFormDetails(formId) {
  const form = getFormById(formId);
  if (!form) return;

  const cycleId = currentCycle?.id;
  let statusHtml = '<span class="form-status-badge status-available">متاحة</span>';
  let actionHtml = '';
  
  const editSection = document.getElementById('formEditSection');
  const editParticipantSelect = document.getElementById('editParticipantSelect');
  const editPaidAmount = document.getElementById('editPaidAmount');
  const editDistId = document.getElementById('editDistId');
  const saveFormEditBtn = document.getElementById('saveFormEditBtn');
  
  // Hide edit section by default
  editSection.classList.add('hidden');
  
  // Populate participants for edit dropdown
  editParticipantSelect.innerHTML = '<option value="">-- اختر المشترك --</option>';
  ParticipantService.getAll().forEach(p => {
    editParticipantSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });

  if (cycleId) {
    const dist = DistributionService.getFormStatus(formId, cycleId);
    if (dist.status === 'distributed') {
      const p = dist.participantId ? ParticipantService.getById(dist.participantId) : null;
      statusHtml = `<span class="form-status-badge status-distributed">موزعة للمشترك: ${p?.name || '؟'}</span>`;
      actionHtml = `<button class="btn-danger" onclick="cancelDist('${dist.id}')">إلغاء التوزيع</button>`;
      
      // Setup Edit Section
      editSection.classList.remove('hidden');
      editDistId.value = dist.id;
      editParticipantSelect.value = dist.participantId || '';
      editPaidAmount.value = dist.paidAmount || '';
      
    } else if (dist.status === 'reserved') {
      const r = dist.representativeId ? RepresentativeService.getById(dist.representativeId) : null;
      statusHtml = `<span class="form-status-badge status-reserved">محجوزة عند المندوب: ${r?.name || '؟'}</span>`;
      actionHtml = `<button class="btn-danger" onclick="cancelDist('${dist.id}')">إلغاء الحجز</button>`;
      
      // Setup Edit Section (to assign to participant)
      editSection.classList.remove('hidden');
      document.getElementById('formEditSectionTitle').textContent = 'نقل العهدة למشترك';
      editDistId.value = dist.id;
      editParticipantSelect.value = '';
      editPaidAmount.value = '';
    } else {
      actionHtml = `<button class="btn-primary" onclick="quickDistribute(${formId})">توزيع سريع</button>`;
    }
  }

  document.getElementById('formDetailsTitle').textContent = `استمارة رقم ${formId}`;
  document.getElementById('formDetailsContent').innerHTML = `
    <div style="padding:8px">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px">
        <span style="font-size:40px; font-weight:900; color:var(--primary)">${formId}</span>
        ${statusHtml}
      </div>
      <div class="receipt-info" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:var(--bg-input); padding:12px; border-radius:8px; margin-bottom:16px">
        <div class="receipt-info-item">
          <label style="font-size:11px; color:var(--text-secondary)">من صفحة</label>
          <span style="font-size:16px; font-weight:bold">${form.startPage}</span>
        </div>
        <div class="receipt-info-item">
          <label style="font-size:11px; color:var(--text-secondary)">إلى صفحة</label>
          <span style="font-size:16px; font-weight:bold">${form.endPage}</span>
        </div>
      </div>
      <div style="background:var(--bg-card-hover); border:1px solid var(--border); border-radius:8px; padding:14px; margin-bottom:16px">
        <p style="font-family:'Noto Naskh Arabic',serif; font-size:14px; color:var(--text-primary); line-height:2; direction:rtl">${form.description || ''}</p>
      </div>
      <div style="display:flex; gap:8px; justify-content:flex-end">
        ${actionHtml}
      </div>
    </div>
  `;
  
  saveFormEditBtn.onclick = () => {
    const distId = editDistId.value;
    const newParticipantId = editParticipantSelect.value;
    const paidAmount = parseFloat(editPaidAmount.value) || 0;
    
    if (!newParticipantId) {
      Toast.error('الرجاء اختيار المشترك');
      return;
    }
    
    const dist = DistributionService.getFormStatus(formId, cycleId);
    let updates = { participantId: newParticipantId, paidAmount: paidAmount };
    
    if (dist.status === 'reserved') {
      updates.status = 'distributed';
      updates.distributedAt = new Date().toISOString();
    }
    
    const res = DistributionService.updateDistribution(distId, updates);
    if (res.success) {
      Toast.success('تم حفظ التعديلات بنجاح');
      Modal.close('formDetailsModal');
      updateCycleUI();
      renderPage(currentPage);
    }
  };
  
  document.getElementById('btnPrintSingleForm').onclick = () => printSingleFormA4(formId);
  Modal.open('formDetailsModal');
}

function cancelDist(distId) {
  Modal.close('formDetailsModal');
  showConfirm('إلغاء التوزيع', 'هل تريد إلغاء هذا التوزيع/الحجز؟', () => {
    const result = DistributionService.cancel(distId);
    if (result.success) {
      Toast.success('تم الإلغاء بنجاح');
      updateCycleUI();
      renderPage(currentPage);
    }
  });
}

function quickDistribute(formId) {
  Modal.close('printModal');
  // الانتقال لصفحة التوزيع
  navigateTo('distribution');
  // تحديد الاستمارة
  setTimeout(() => {
    document.querySelector('[data-dist="manual"]')?.click();
    const chip = document.querySelector(`.form-chip[data-form="${formId}"]`);
    if (chip) chip.click();
  }, 100);
}

// =====================
// المشتركون
// =====================
function renderParticipants() {
  const search = document.getElementById('participantsSearch')?.value?.toLowerCase() || '';
  const participants = ParticipantService.getAll().filter(p =>
    !search || p.name.toLowerCase().includes(search) || (p.phone && p.phone.includes(search))
  );

  const tbody = document.getElementById('participantsBody');
  const cycleId = currentCycle?.id;

  if (participants.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">لا يوجد مشتركون بعد</td></tr>`;
    return;
  }

  tbody.innerHTML = participants.map((p, i) => {
    const rep = p.representativeId ? RepresentativeService.getById(p.representativeId) : null;
    const forms = cycleId ? ParticipantService.getForms(p.id, cycleId) : [];
    const formTags = forms.length > 0
      ? `<div class="forms-tags">${forms.map(d => `<span class="form-tag" title="ص${getFormById(d.formId)?.startPage||''}">${d.formId}</span>`).join('')}</div>`
      : '<span style="color:var(--text-muted);font-size:12px">-</span>';

    return `
      <tr>
        <td style="color:var(--text-muted)">${i + 1}</td>
        <td><strong>${p.name}</strong></td>
        <td>${rep ? rep.name : '<span style="color:var(--text-muted)">مستقل</span>'}</td>
        <td>${p.phone || '-'}</td>
        <td><span style="font-weight:700;color:${forms.length > 0 ? 'var(--success)' : 'var(--text-muted)'}">${forms.length}</span></td>
        <td>${formTags}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn-icon success" onclick="printParticipantReceipt('${p.id}','${cycleId||''}')" title="طباعة الإيصال">🖨️</button>
            <button class="btn-icon" onclick="editParticipant('${p.id}')" title="تعديل">✏️</button>
            <button class="btn-icon danger" onclick="deleteParticipant('${p.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// =====================
// المندوبون
// =====================
function renderRepresentatives() {
  const search = document.getElementById('repsSearch')?.value?.toLowerCase() || '';
  const reps = RepresentativeService.getAll().filter(r =>
    !search || r.name.toLowerCase().includes(search) || (r.area && r.area.toLowerCase().includes(search))
  );

  const tbody = document.getElementById('repsBody');
  const cycleId = currentCycle?.id;

  if (reps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">لا يوجد مندوبون بعد</td></tr>`;
    return;
  }

  tbody.innerHTML = reps.map((r, i) => {
    const reserved = cycleId ? RepresentativeService.getReservedForms(r.id, cycleId) : [];
    const distributed = cycleId ? RepresentativeService.getDistributedForms(r.id, cycleId) : [];

    return `
      <tr>
        <td style="color:var(--text-muted)">${i + 1}</td>
        <td><strong>${r.name}</strong></td>
        <td>${r.area || '-'}</td>
        <td>${r.phone || '-'}</td>
        <td><span style="font-weight:700;color:var(--warning)">${reserved.length}</span></td>
        <td><span style="font-weight:700;color:var(--success)">${distributed.length}</span></td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn-icon success" onclick="printRepresentativeReceipt('${r.id}','${cycleId||''}')" title="طباعة التقرير">🖨️</button>
            <button class="btn-icon" onclick="editRepresentative('${r.id}')" title="تعديل">✏️</button>
            <button class="btn-icon danger" onclick="deleteRepresentative('${r.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// =====================
// التوزيع
// =====================
function renderDistribution() {
  populateParticipantSelects();
  populateRepSelects();
  renderDistHistory();
  refreshAvailableChips();
}

function refreshAvailableChips() {
  const cycleId = currentCycle?.id;
  if (!cycleId) return;

  const available = DistributionService.getAvailableForms(cycleId);

  // تحديث شرائح المشترك
  const sel1 = document.getElementById('formsSelector');
  if (sel1) {
    sel1.innerHTML = available.length > 0
      ? available.map(f => `<span class="form-chip ${selectedFormsForDist.includes(f.id) ? 'selected' : ''}" data-form="${f.id}" onclick="toggleChip(this,'dist')">${f.id}</span>`).join('')
      : '<span style="color:var(--text-muted);font-size:12px">لا توجد استمارات متاحة</span>';
  }

  // تحديث شرائح المندوب
  const sel2 = document.getElementById('formsSelectorRep');
  if (sel2) {
    sel2.innerHTML = available.length > 0
      ? available.map(f => `<span class="form-chip ${selectedFormsForRep.includes(f.id) ? 'selected' : ''}" data-form="${f.id}" onclick="toggleChip(this,'rep')">${f.id}</span>`).join('')
      : '<span style="color:var(--text-muted);font-size:12px">لا توجد استمارات متاحة</span>';
  }
}

function toggleChip(el, type) {
  const formId = parseInt(el.dataset.form);
  if (type === 'dist') {
    const idx = selectedFormsForDist.indexOf(formId);
    if (idx === -1) selectedFormsForDist.push(formId);
    else selectedFormsForDist.splice(idx, 1);
    el.classList.toggle('selected', selectedFormsForDist.includes(formId));
  } else {
    const idx = selectedFormsForRep.indexOf(formId);
    if (idx === -1) selectedFormsForRep.push(formId);
    else selectedFormsForRep.splice(idx, 1);
    el.classList.toggle('selected', selectedFormsForRep.includes(formId));
  }
}

function renderDistHistory() {
  const cycleId = currentCycle?.id;
  const tbody = document.getElementById('historyBody');
  const search = document.getElementById('histSearch')?.value?.toLowerCase() || '';

  if (!cycleId) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">اختر دورة نشطة</td></tr>`;
    return;
  }

  let dists = DistributionService.getAll(cycleId);

  if (historyFilter !== 'all') {
    dists = dists.filter(d => d.status === historyFilter);
  }

  if (search) {
    dists = dists.filter(d => {
      const p = d.participantId ? ParticipantService.getById(d.participantId) : null;
      const r = d.representativeId ? RepresentativeService.getById(d.representativeId) : null;
      return String(d.formId).includes(search) || p?.name?.includes(search) || r?.name?.includes(search);
    });
  }

  if (dists.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">لا توجد بيانات</td></tr>`;
    return;
  }

  const statusLabels = { distributed: '✅ موزعة', reserved: '🔒 محجوزة', cancelled: '❌ ملغاة' };
  const statusColors = { distributed: 'var(--success)', reserved: 'var(--warning)', cancelled: 'var(--text-muted)' };

  tbody.innerHTML = dists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(d => {
    const form = getFormById(d.formId);
    const recipient = d.status === 'distributed' && d.participantId
      ? `👤 ${ParticipantService.getById(d.participantId)?.name || '؟'}`
      : d.representativeId
        ? `🧑‍💼 ${RepresentativeService.getById(d.representativeId)?.name || '؟'}`
        : '-';

    let actions = '';
    if (d.status !== 'cancelled') {
      actions = `<button class="btn-icon danger" onclick="cancelDist('${d.id}')" title="إلغاء">❌</button>`;
    }

    return `
      <tr>
        <td><strong style="color:var(--primary)">${d.formId}</strong></td>
        <td style="font-size:11px">${form ? `${form.startPage} - ${form.endPage}` : '-'}</td>
        <td style="font-size:11px">${d.type === 'participant' ? 'مباشر' : 'عبر مندوب'}</td>
        <td>${recipient}</td>
        <td style="font-size:11px;color:var(--text-muted)">${formatDate(d.createdAt)}</td>
        <td><span style="color:${statusColors[d.status]};font-weight:700;font-size:12px">${statusLabels[d.status]}</span></td>
        <td>${actions}</td>
      </tr>
    `;
  }).join('');
}

// =====================
// التقارير
// =====================
function renderReports() {
  if (!currentCycle) {
    ['reportCycleSummary', 'reportRepresentatives'].forEach(id => {
      document.getElementById(id).innerHTML = `<div class="empty-state"><span>📊</span><p>اختر دورة لعرض التقرير</p></div>`;
    });
    return;
  }

  const stats = CycleService.getStats(currentCycle.id);

  // ملخص الدورة
  document.getElementById('reportCycleSummary').innerHTML = `
    <div class="dash-stats">
      <div class="dash-stat-row"><span>إجمالي الاستمارات</span><span class="dash-stat-val">${stats.total}</span></div>
      <div class="dash-stat-row"><span>متاحة / جاهزة</span><span class="dash-stat-val" style="color:var(--success)">${stats.available}</span></div>
      <div class="dash-stat-row"><span>موزعة للمشتركين</span><span class="dash-stat-val" style="color:var(--secondary)">${stats.distributed}</span></div>
      <div class="dash-stat-row"><span>محجوزة عند مندوبين</span><span class="dash-stat-val" style="color:var(--warning)">${stats.reserved}</span></div>
      <div class="dash-stat-row" style="padding-top:8px;border-top:1px solid var(--border)">
        <span>نسبة الاكتمال</span>
        <span class="dash-stat-val" style="color:var(--primary)">${Math.round(((stats.distributed+stats.reserved)/stats.total)*100)}%</span>
      </div>
    </div>
  `;

  // تقرير المندوبين
  const reps = RepresentativeService.getAll();
  if (reps.length === 0) {
    document.getElementById('reportRepresentatives').innerHTML = `<div class="empty-state"><span>🧑‍💼</span><p>لا يوجد مندوبون</p></div>`;
  } else {
    document.getElementById('reportRepresentatives').innerHTML = `
      <table class="report-table">
        <thead><tr><th>المندوب</th><th>المنطقة</th><th>محجوزة</th><th>موزعة</th><th>الإجمالي</th></tr></thead>
        <tbody>
          ${reps.map(r => {
            const res = RepresentativeService.getReservedForms(r.id, currentCycle.id);
            const dist = RepresentativeService.getDistributedForms(r.id, currentCycle.id);
            return `<tr>
              <td>${r.name}</td>
              <td>${r.area || '-'}</td>
              <td style="color:var(--warning);font-weight:700">${res.length}</td>
              <td style="color:var(--success);font-weight:700">${dist.length}</td>
              <td style="color:var(--primary);font-weight:700">${res.length + dist.length}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // مقارنة الدورات
  const cycles = CycleService.getAll();
  if (cycles.length <= 1) {
    document.getElementById('reportCyclesComparison').innerHTML =
      `<div class="empty-state"><span>📈</span><p>تحتاج أكثر من دورة للمقارنة</p></div>`;
  } else {
    document.getElementById('reportCyclesComparison').innerHTML = `
      <table class="report-table">
        <thead><tr><th>الدورة</th><th>إجمالي</th><th>موزعة</th><th>محجوزة</th><th>متاحة</th><th>الاكتمال</th></tr></thead>
        <tbody>
          ${cycles.map(c => {
            const s = CycleService.getStats(c.id);
            const pct = Math.round(((s.distributed+s.reserved)/s.total)*100);
            return `<tr>
              <td>${c.name}</td>
              <td>${s.total}</td>
              <td style="color:var(--secondary)">${s.distributed}</td>
              <td style="color:var(--warning)">${s.reserved}</td>
              <td style="color:var(--success)">${s.available}</td>
              <td><span style="color:var(--primary);font-weight:700">${pct}%</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  }
}

// =====================
// الدورات
// =====================
function renderCycles() {
  const cycles = CycleService.getAll();
  const container = document.getElementById('cyclesList');
  const active = CycleService.getActive();

  if (cycles.length === 0) {
    container.innerHTML = `
      <div class="no-cycle-msg">
        <span class="big-icon">🔄</span>
        <h3>لا توجد دورات بعد</h3>
        <p>اضغط على "دورة جديدة" لإنشاء أولى دوراتك</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cycles.map(c => {
    const stats = CycleService.getStats(c.id);
    const isActive = active?.id === c.id;
    return `
      <div class="cycle-card ${isActive ? 'active-cycle' : ''}">
        <div class="cycle-header">
          <span class="cycle-name">${c.name}</span>
          <span class="cycle-status status-${isActive ? 'active' : c.status}">${isActive ? '🟢 نشطة' : c.status === 'completed' ? '✅ مكتملة' : '⏳ قادمة'}</span>
        </div>
        <div class="cycle-dates">
          📅 ${c.startDate ? formatDate(c.startDate) : 'غير محدد'} — ${c.endDate ? formatDate(c.endDate) : 'غير محدد'}
        </div>
        <div class="cycle-stats">
          <span class="cycle-stat">موزعة: <span>${stats.distributed}</span></span>
          <span class="cycle-stat">محجوزة: <span>${stats.reserved}</span></span>
          <span class="cycle-stat">متاحة: <span>${stats.available}</span></span>
        </div>
        <div class="cycle-actions">
          ${!isActive ? `<button class="btn-set-active" onclick="setActiveCycle('${c.id}')">تعيين نشطة</button>` : `<button class="btn-set-active is-active" disabled>✅ الدورة النشطة</button>`}
          <button class="btn-icon" onclick="editCycle('${c.id}')" title="تعديل">✏️</button>
          <button class="btn-icon danger" onclick="deleteCycle('${c.id}')" title="حذف">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// =====================
// الإعدادات
// =====================
function renderSettings() {
  const db = loadDB();
  document.getElementById('info-cycles').textContent = db.cycles.length;
  document.getElementById('info-participants').textContent = db.participants.length;
  document.getElementById('info-representatives').textContent = db.representatives.length;
  document.getElementById('info-distributions').textContent = db.distributions.length;
}

// =====================
// أحداث الأزرار
// =====================

// -- المشتركون --
function editParticipant(id) {
  const p = ParticipantService.getById(id);
  if (!p) return;
  document.getElementById('participantId').value = p.id;
  document.getElementById('participantName').value = p.name;
  document.getElementById('participantPhone').value = p.phone || '';
  document.getElementById('participantNotes').value = p.notes || '';
  populateRepSelects();
  document.getElementById('participantRep').value = p.representativeId || '';
  document.getElementById('participantModalTitle').textContent = 'تعديل بيانات المشترك';
  Modal.open('participantModal');
}

function deleteParticipant(id) {
  const p = ParticipantService.getById(id);
  showConfirm('حذف مشترك', `هل تريد حذف المشترك "${p?.name}"؟`, () => {
    ParticipantService.delete(id);
    Toast.success('تم حذف المشترك');
    renderParticipants();
  });
}

// -- المندوبون --
function editRepresentative(id) {
  const r = RepresentativeService.getById(id);
  if (!r) return;
  document.getElementById('repId').value = r.id;
  document.getElementById('repName').value = r.name;
  document.getElementById('repPhone').value = r.phone || '';
  document.getElementById('repArea').value = r.area || '';
  document.getElementById('repNotes').value = r.notes || '';
  document.getElementById('repModalTitle').textContent = 'تعديل بيانات المندوب';
  Modal.open('representativeModal');
}

function deleteRepresentative(id) {
  const r = RepresentativeService.getById(id);
  showConfirm('حذف مندوب', `هل تريد حذف المندوب "${r?.name}"؟`, () => {
    RepresentativeService.delete(id);
    Toast.success('تم حذف المندوب');
    renderRepresentatives();
  });
}

// -- الدورات --
function setActiveCycle(id) {
  CycleService.setActive(id);
  currentCycle = CycleService.getActive();
  updateCycleUI();
  populateCycleSelects();
  renderCycles();
  Toast.success('تم تعيين الدورة النشطة');
}

function editCycle(id) {
  const c = CycleService.getById(id);
  if (!c) return;
  document.getElementById('cycleId').value = c.id;
  document.getElementById('cycleName').value = c.name;
  document.getElementById('cycleNumber').value = c.cycleNumber || '1';
  document.getElementById('cycleStart').value = c.startDate || '';
  document.getElementById('cycleEnd').value = c.endDate || '';
  document.getElementById('cycleNotes').value = c.notes || '';
  document.getElementById('cycleModalTitle').textContent = 'تعديل الدورة';
  document.getElementById('saveCycleBtn').textContent = 'حفظ التعديلات';
  Modal.open('cycleModal');
}

function deleteCycle(id) {
  const c = CycleService.getById(id);
  showConfirm('حذف دورة', `هل تريد حذف الدورة "${c?.name}"؟ سيتم حذف جميع التوزيعات المرتبطة بها!`, () => {
    CycleService.delete(id);
    currentCycle = CycleService.getActive();
    updateCycleUI();
    populateCycleSelects();
    renderCycles();
    Toast.success('تم حذف الدورة');
  });
}

// =====================
// ربط الأحداث
// =====================
function setupEventListeners() {

  // التنقل
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // تبديل الشريط الجانبي
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('mainContent');
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
  });

  document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainContent').classList.toggle('expanded');
  });

  // اختيار الدورة
  document.getElementById('activeCycleSelect').addEventListener('change', e => {
    CycleService.setActive(e.target.value || null);
    currentCycle = CycleService.getActive();
    updateCycleUI();
    renderPage(currentPage);
  });

  // -- إضافة مشترك --
  document.getElementById('addParticipantBtn').addEventListener('click', () => {
    document.getElementById('participantId').value = '';
    document.getElementById('participantName').value = '';
    document.getElementById('participantPhone').value = '';
    document.getElementById('participantNotes').value = '';
    document.getElementById('participantRep').value = '';
    document.getElementById('participantModalTitle').textContent = 'إضافة مشترك جديد';
    populateRepSelects();
    Modal.open('participantModal');
  });

  document.getElementById('saveParticipantBtn').addEventListener('click', () => {
    const name = document.getElementById('participantName').value.trim();
    if (!name) { Toast.error('الرجاء إدخال اسم المشترك'); return; }
    const data = {
      name,
      phone: document.getElementById('participantPhone').value,
      representativeId: document.getElementById('participantRep').value || null,
      notes: document.getElementById('participantNotes').value
    };
    const id = document.getElementById('participantId').value;
    if (id) {
      ParticipantService.update(id, data);
      Toast.success('تم تحديث بيانات المشترك');
    } else {
      ParticipantService.create(data);
      Toast.success('تم إضافة المشترك بنجاح');
    }
    Modal.close('participantModal');
    renderParticipants();
  });

  // -- إضافة مندوب --
  document.getElementById('addRepresentativeBtn').addEventListener('click', () => {
    document.getElementById('repId').value = '';
    document.getElementById('repName').value = '';
    document.getElementById('repPhone').value = '';
    document.getElementById('repArea').value = '';
    document.getElementById('repNotes').value = '';
    document.getElementById('repModalTitle').textContent = 'إضافة مندوب جديد';
    Modal.open('representativeModal');
  });

  document.getElementById('saveRepBtn').addEventListener('click', () => {
    const name = document.getElementById('repName').value.trim();
    if (!name) { Toast.error('الرجاء إدخال اسم المندوب'); return; }
    const data = {
      name,
      phone: document.getElementById('repPhone').value,
      area: document.getElementById('repArea').value,
      notes: document.getElementById('repNotes').value
    };
    const id = document.getElementById('repId').value;
    if (id) {
      RepresentativeService.update(id, data);
      Toast.success('تم تحديث بيانات المندوب');
    } else {
      RepresentativeService.create(data);
      Toast.success('تم إضافة المندوب بنجاح');
    }
    Modal.close('representativeModal');
    renderRepresentatives();
    populateRepSelects();
  });

  // -- الدورات --
  document.getElementById('addCycleBtn').addEventListener('click', () => {
    document.getElementById('cycleId').value = '';
    document.getElementById('cycleName').value = '';
    document.getElementById('cycleNotes').value = '';
    document.getElementById('cycleStart').value = '';
    document.getElementById('cycleEnd').value = '';
    document.getElementById('cycleModalTitle').textContent = 'إنشاء دورة جديدة';
    document.getElementById('saveCycleBtn').textContent = 'إنشاء الدورة';
    Modal.open('cycleModal');
  });

  document.getElementById('saveCycleBtn').addEventListener('click', () => {
    const name = document.getElementById('cycleName').value.trim();
    if (!name) { Toast.error('الرجاء إدخال اسم الدورة'); return; }
    const data = {
      name,
      cycleNumber: document.getElementById('cycleNumber').value,
      startDate: document.getElementById('cycleStart').value,
      endDate: document.getElementById('cycleEnd').value,
      notes: document.getElementById('cycleNotes').value
    };
    const id = document.getElementById('cycleId').value;
    if (id) {
      CycleService.update(id, data);
      Toast.success('تم تحديث الدورة');
    } else {
      const cycle = CycleService.create(data);
      if (!currentCycle) {
        currentCycle = cycle;
        updateCycleUI();
        populateCycleSelects();
      }
      Toast.success('تم إنشاء الدورة بنجاح');
    }
    Modal.close('cycleModal');
    renderCycles();
    populateCycleSelects();
  });

  // -- التوزيع المباشر --
  document.getElementById('searchDistParticipant')?.addEventListener('input', e => {
    const val = e.target.value.toLowerCase();
    const options = document.getElementById('distParticipantSelect').options;
    for (let i = 1; i < options.length; i++) {
      options[i].style.display = options[i].text.toLowerCase().includes(val) ? '' : 'none';
    }
  });

  document.getElementById('searchDistRep')?.addEventListener('input', e => {
    const val = e.target.value.toLowerCase();
    const options = document.getElementById('distRepSelect').options;
    for (let i = 1; i < options.length; i++) {
      options[i].style.display = options[i].text.toLowerCase().includes(val) ? '' : 'none';
    }
  });

  document.querySelectorAll('.dist-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dist-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.dist-panel').forEach(p => p.classList.add('hidden'));
      document.getElementById(`dist-${tab.dataset.dist}`).classList.remove('hidden');
    });
  });

  document.querySelectorAll('input[name="distMethod"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const isManual = e.target.value === 'manual';
      document.getElementById('autoCountGroup').classList.toggle('hidden', isManual);
      document.getElementById('manualSelectGroup').classList.toggle('hidden', !isManual);
      if (isManual) {
        selectedFormsForDist = [];
        refreshAvailableChips();
      }
    });
  });

  document.querySelectorAll('input[name="distRepMethod"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const isManual = e.target.value === 'manual';
      document.getElementById('autoCountGroupRep').classList.toggle('hidden', isManual);
      document.getElementById('manualSelectGroupRep').classList.toggle('hidden', !isManual);
      if (isManual) {
        selectedFormsForRep = [];
        refreshAvailableChips();
      }
    });
  });

  document.getElementById('distributeBtn').addEventListener('click', () => {
    if (!currentCycle) { Toast.error('الرجاء اختيار دورة نشطة أولاً'); return; }
    const participantId = document.getElementById('distParticipantSelect').value;
    if (!participantId) { Toast.error('الرجاء اختيار المشترك'); return; }

    const method = document.querySelector('input[name="distMethod"]:checked').value;
    let formIds = [];

    if (method === 'auto') {
      const count = parseInt(document.getElementById('distCount').value) || 1;
      const available = DistributionService.getAvailableForms(currentCycle.id);
      if (available.length < count) {
        Toast.error(`لا توجد استمارات كافية. المتاح: ${available.length}`);
        return;
      }
      formIds = available.slice(0, count).map(f => f.id);
    } else {
      formIds = [...selectedFormsForDist];
      if (formIds.length === 0) { Toast.error('الرجاء اختيار الاستمارات'); return; }
    }

    const notes = document.getElementById('distNotes').value; const amount = document.getElementById('distAmount').value; const result = DistributionService.distributeToParticipant(currentCycle.id, participantId, formIds, notes, amount);

    if (result.success) {
      Toast.success(`تم توزيع ${result.count} استمارة بنجاح`);
      selectedFormsForDist = [];
      document.getElementById('distCount').value = 1;
      document.getElementById('distNotes').value = ''; document.getElementById('distAmount').value = '';
      updateCycleUI();
      refreshAvailableChips();
      renderDistHistory();
    } else {
      Toast.error(result.msg);
    }
  });

  document.getElementById('reserveBtn').addEventListener('click', () => {
    if (!currentCycle) { Toast.error('الرجاء اختيار دورة نشطة أولاً'); return; }
    const repId = document.getElementById('distRepSelect').value;
    if (!repId) { Toast.error('الرجاء اختيار المندوب'); return; }

    const method = document.querySelector('input[name="distRepMethod"]:checked').value;
    let formIds = [];

    if (method === 'auto') {
      const count = parseInt(document.getElementById('distRepCount').value) || 1;
      const available = DistributionService.getAvailableForms(currentCycle.id);
      if (available.length < count) {
        Toast.error(`لا توجد استمارات كافية. المتاح: ${available.length}`);
        return;
      }
      formIds = available.slice(0, count).map(f => f.id);
    } else {
      formIds = [...selectedFormsForRep];
      if (formIds.length === 0) { Toast.error('الرجاء اختيار الاستمارات'); return; }
    }

    const notes = document.getElementById('distRepNotes').value; const amount = document.getElementById('distRepAmount').value; const result = DistributionService.reserveForRepresentative(currentCycle.id, repId, formIds, notes, amount);

    if (result.success) {
      Toast.success(`تم حجز ${result.count} استمارة للمندوب بنجاح`);
      selectedFormsForRep = [];
      document.getElementById('distRepCount').value = 1;
      document.getElementById('distRepNotes').value = ''; document.getElementById('distRepAmount').value = '';
      updateCycleUI();
      refreshAvailableChips();
      renderDistHistory();
    } else {
      Toast.error(result.msg);
    }
  });

  // -- فلاتر التاريخ --
  document.querySelectorAll('[data-hist]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-hist]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      historyFilter = btn.dataset.hist;
      renderDistHistory();
    });
  });

  document.getElementById('histSearch')?.addEventListener('input', () => renderDistHistory());

  // -- فلاتر الاستمارات --
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      formsFilter = btn.dataset.filter;
      renderForms();
    });
  });

  document.getElementById('formsSearch')?.addEventListener('input', () => renderForms());
  document.getElementById('participantsSearch')?.addEventListener('input', () => renderParticipants());
  document.getElementById('repsSearch')?.addEventListener('input', () => renderRepresentatives());

  // -- التصدير والاستيراد --
  document.getElementById('exportBtn').addEventListener('click', () => BackupService.export());
  document.getElementById('exportBtnSettings')?.addEventListener('click', () => BackupService.export());

  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importBtnSettings')?.addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  // Load Print Settings
  const printSettings = SettingsService.getSettings();
  if (printSettings) {
    document.getElementById('settingPrintTitle').value = printSettings.printTitle || '';
    document.getElementById('settingPrintSubtitle').value = printSettings.printSubtitle || '';
    document.getElementById('settingPrintHadith').value = printSettings.printHadith || '';
    document.getElementById('settingPrintDuties').value = printSettings.printDuties || '';
    document.getElementById('settingPrintNiya').value = printSettings.printNiya || '';
    document.getElementById('settingPrintNote').value = printSettings.printNote || '';
    document.getElementById('settingPrintRewards').value = printSettings.printRewards || '';
    document.getElementById('settingPrintFooter').value = printSettings.printFooter || '';
  }

  // Save Print Settings
  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const newSettings = {
      printTitle: document.getElementById('settingPrintTitle').value,
      printSubtitle: document.getElementById('settingPrintSubtitle').value,
      printHadith: document.getElementById('settingPrintHadith').value,
      printDuties: document.getElementById('settingPrintDuties').value,
      printNiya: document.getElementById('settingPrintNiya').value,
      printNote: document.getElementById('settingPrintNote').value,
      printRewards: document.getElementById('settingPrintRewards').value,
      printFooter: document.getElementById('settingPrintFooter').value
    };
    SettingsService.updatePrintSettings(newSettings);
    Toast.success('تم حفظ إعدادات الطباعة بنجاح');
  });

  document.getElementById('importFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await BackupService.import(file);
      Toast.success('تم استيراد البيانات بنجاح');
      currentCycle = CycleService.getActive();
      updateCycleUI();
      populateCycleSelects();
      populateParticipantSelects();
      populateRepSelects();
      renderPage(currentPage);
    } catch (err) {
      Toast.error('فشل الاستيراد: ' + err.message);
    }
    e.target.value = '';
  });

  document.getElementById('clearDataBtn')?.addEventListener('click', () => {
    showConfirm('مسح جميع البيانات', 'هل تريد مسح جميع البيانات نهائياً؟ لا يمكن التراجع عن هذا!', () => {
      BackupService.clearAll();
      location.reload();
    });
  });
}

// ---- البدء ----
document.addEventListener('DOMContentLoaded', init);

function renderDistHistory() {
  const cycleId = currentCycle?.id;
  const tbody = document.getElementById('historyBody');
  const search = document.getElementById('histSearch')?.value?.toLowerCase() || '';

  if (!cycleId) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px">الرجاء اختيار دورة نشطة</td></tr>`;
    return;
  }

  let dists = DistributionService.getAll(cycleId);

  if (historyFilter !== 'all') {
    dists = dists.filter(d => d.status === historyFilter);
  }

  if (search) {
    dists = dists.filter(d => {
      const p = d.participantId ? ParticipantService.getById(d.participantId) : null;
      const r = d.representativeId ? RepresentativeService.getById(d.representativeId) : null;
      return String(d.formId).includes(search) || p?.name?.includes(search) || r?.name?.includes(search);
    });
  }

  if (dists.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px">لا توجد بيانات</td></tr>`;
    return;
  }

  const statusLabels = { distributed: 'موزعة', reserved: 'محجوزة', cancelled: 'ملغاة' };
  const statusColors = { distributed: 'var(--success)', reserved: 'var(--warning)', cancelled: 'var(--text-muted)' };

  tbody.innerHTML = dists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(d => {
    const form = getFormById(d.formId);
    const recipient = d.status === 'distributed' && d.participantId
      ? `لمشترك: ${ParticipantService.getById(d.participantId)?.name || 'غير معروف'}`
      : d.representativeId
        ? `عند مندوب: ${RepresentativeService.getById(d.representativeId)?.name || 'غير معروف'}`
        : '-';

    let actions = '';
    if (d.status !== 'cancelled') {
      actions = `<button class="btn-icon danger" onclick="cancelDist('${d.id}')" title="إلغاء التوزيع">✕</button>`;
    }

    return `
      <tr>
        <td><strong style="color:var(--primary)">${d.formId}</strong></td>
        <td style="font-size:11px">${form ? `${form.startPage} - ${form.endPage}` : '-'}</td>
        <td style="font-size:11px">${d.type === 'participant' ? 'مباشر' : 'حجز مندوب'}</td>
        <td>${recipient}</td>
        <td><strong style="color:var(--success)">${d.paidAmount || 0} ر.ع</strong></td>
        <td style="font-size:11px;color:var(--text-muted)">${formatDate(d.createdAt)}</td>
        <td><span style="color:${statusColors[d.status]};font-weight:700;font-size:12px">${statusLabels[d.status]}</span></td>
        <td>${actions}</td>
      </tr>
    `;
  }).join('');
}

// Hook into updateDashboardStats to show total amount
setInterval(() => {
  const amountEl = document.getElementById('ds-cycle-amount');
  if (amountEl && currentCycle) {
    const dists = DistributionService.getAll(currentCycle.id);
    const totalAmount = dists.filter(d => d.status !== 'cancelled').reduce((sum, d) => sum + (parseFloat(d.paidAmount) || 0), 0);
    amountEl.textContent = totalAmount;
  }
}, 1000);


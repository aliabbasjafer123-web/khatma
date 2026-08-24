// ======================================================
// app.js - منطق التطبيق الرئيسي والأحداث
// ======================================================

var currentPage = 'dashboard';
var currentCycle = null;
var historyFilter = 'all';
var formsFilter = 'all';
var selectedFormsForDist = [];
var selectedFormsForRep = [];

// ---- بدء التطبيق ----
function init() {
  currentCycle = CycleService.getActive();
  updateCycleUI();
  populateCycleSelects();
  populateParticipantSelects();
  populateRepSelects();
  setupEventListeners();
  navigateTo('dashboard');
}

// ---- تحديث شريط الدورة العلوي ----
function updateCycleUI() {
  currentCycle = CycleService.getActive();
  const badge = document.getElementById('cycleInfo');
  const navBadge = document.getElementById('availableBadge');

  if (currentCycle) {
    badge.innerHTML = '<span class="cycle-badge">📅 ' + currentCycle.name + '</span>';
    const stats = CycleService.getStats(currentCycle.id);
    if (navBadge) navBadge.textContent = stats.available;
  } else {
    badge.innerHTML = '<span class="cycle-badge warn">⚠️ لا توجد دورة نشطة</span>';
    if (navBadge) navBadge.textContent = '0';
  }
}

// ---- التنقل بين الصفحات ----
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  currentPage = page;

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
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[page] || page;
  renderPage(page);
}

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
// لوحة التحكم (Dashboard)
// =====================
function renderDashboard() {
  currentCycle = CycleService.getActive();
  const amountEl = document.getElementById('ds-cycle-amount');

  if (!currentCycle) {
    document.getElementById('stat-total').textContent = TOTAL_FORMS;
    document.getElementById('stat-available').textContent = TOTAL_FORMS;
    document.getElementById('stat-distributed').textContent = 0;
    document.getElementById('stat-reserved').textContent = 0;
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('progressDistributed').style.width = '0%';
    document.getElementById('progressReserved').style.width = '0%';
    document.getElementById('ds-cycle-name').textContent = '-';
    document.getElementById('ds-cycle-start').textContent = '-';
    document.getElementById('ds-cycle-end').textContent = '-';
    if (amountEl) amountEl.textContent = '0 ر.ع';
    renderActivity();
    return;
  }

  const stats = CycleService.getStats(currentCycle.id);
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-available').textContent = stats.available;
  document.getElementById('stat-distributed').textContent = stats.distributed;
  document.getElementById('stat-reserved').textContent = stats.reserved;

  const distPct = Math.round((stats.distributed / stats.total) * 100) || 0;
  const resPct = Math.round((stats.reserved / stats.total) * 100) || 0;
  const totalPct = Math.min(100, distPct + resPct);

  document.getElementById('progressPercent').textContent = totalPct + '%';
  document.getElementById('progressDistributed').style.width = distPct + '%';
  document.getElementById('progressReserved').style.width = resPct + '%';

  const participants = ParticipantService.getAll();
  const withForms = participants.filter(p => ParticipantService.getForms(p.id, currentCycle.id).length > 0);
  document.getElementById('ds-participants').textContent = participants.length;
  document.getElementById('ds-participants-with-forms').textContent = withForms.length;
  document.getElementById('ds-participants-without-forms').textContent = Math.max(0, participants.length - withForms.length);

  const reps = RepresentativeService.getAll();
  const repsWithForms = reps.filter(r => RepresentativeService.getReservedForms(r.id, currentCycle.id).length > 0);
  document.getElementById('ds-representatives').textContent = reps.length;
  document.getElementById('ds-reps-with-forms').textContent = repsWithForms.length;
  document.getElementById('ds-avg-forms').textContent = reps.length > 0 ? Math.round(stats.reserved / reps.length) : 0;

  document.getElementById('ds-cycle-name').textContent = currentCycle.name;
  document.getElementById('ds-cycle-start').textContent = formatDate(currentCycle.startDate);
  document.getElementById('ds-cycle-end').textContent = formatDate(currentCycle.endDate);
  if (amountEl) amountEl.textContent = Number(stats.totalAmount || 0).toLocaleString() + ' ر.ع';

  renderActivity();
}

function renderActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;
  const activities = ActivityService.getAll(8);
  if (activities.length === 0) {
    container.innerHTML = '<div class="empty-state"><span>📭</span><p>لا توجد عمليات حديثة</p></div>';
    return;
  }
  const icons = {
    cycle_created: '🔄',
    cycle_deleted: '🗑️',
    participant_added: '👤',
    participant_deleted: '🗑️',
    rep_added: '🧑‍💼',
    rep_deleted: '🗑️',
    distributed: '📤',
    reserved: '🔒',
    dist_updated: '✏️',
    dist_cancelled: '↩️',
    settings_updated: '⚙️'
  };
  container.innerHTML = activities.map(a => `
    <div class="activity-item">
      <span class="activity-icon">${icons[a.type] || '📌'}</span>
      <div class="activity-body">
        <p class="activity-text">${a.text}</p>
        <span class="activity-time">${timeAgo(a.timestamp)}</span>
      </div>
    </div>
  `).join('');
}

// =====================
// إدارة الاستمارات (Forms)
// =====================
function renderForms() {
  currentCycle = CycleService.getActive();
  const cycleId = currentCycle?.id;
  const searchInput = document.getElementById('formsSearch');
  const search = (searchInput ? searchInput.value : '').toLowerCase().trim();

  let counts = { all: TOTAL_FORMS, available: 0, distributed: 0, reserved: 0 };
  const formStatuses = {};

  if (cycleId) {
    const db = loadDB();
    db.distributions.filter(d => d.cycleId === cycleId && d.status !== 'cancelled').forEach(d => {
      formStatuses[d.formId] = d;
    });
    counts.distributed = Object.values(formStatuses).filter(d => d.status === 'distributed').length;
    counts.reserved = Object.values(formStatuses).filter(d => d.status === 'reserved').length;
    counts.available = Math.max(0, TOTAL_FORMS - counts.distributed - counts.reserved);
  } else {
    counts.available = TOTAL_FORMS;
  }

  const elAll = document.getElementById('fc-all'); if (elAll) elAll.textContent = counts.all;
  const elAvail = document.getElementById('fc-available'); if (elAvail) elAvail.textContent = counts.available;
  const elDist = document.getElementById('fc-distributed'); if (elDist) elDist.textContent = counts.distributed;
  const elRes = document.getElementById('fc-reserved'); if (elRes) elRes.textContent = counts.reserved;

  const grid = document.getElementById('formsGrid');
  if (!grid) return;

  let formsToShow = FORMS_DATA.filter(f => {
    const dist = formStatuses[f.id];
    const status = dist ? dist.status : 'available';

    if (formsFilter !== 'all' && status !== formsFilter) return false;

    if (search) {
      const matchId = String(f.id).includes(search);
      const matchStartVerse = f.startVerse && f.startVerse.toLowerCase().includes(search);
      const matchEndVerse = f.endVerse && f.endVerse.toLowerCase().includes(search);
      const matchDesc = f.description && f.description.toLowerCase().includes(search);
      const matchPage = String(f.startPage).includes(search) || String(f.endPage).includes(search);

      let matchPerson = false;
      if (dist) {
        if (dist.participantId) {
          const p = ParticipantService.getById(dist.participantId);
          if (p && p.name.toLowerCase().includes(search)) matchPerson = true;
        }
        if (dist.representativeId) {
          const r = RepresentativeService.getById(dist.representativeId);
          if (r && r.name.toLowerCase().includes(search)) matchPerson = true;
        }
      }
      return matchId || matchStartVerse || matchEndVerse || matchDesc || matchPage || matchPerson;
    }
    return true;
  });

  if (formsToShow.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><span>🔍</span><p>لا توجد استمارات مطابقة للبحث أو الفلتر المحدد</p></div>';
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
        assigneeHtml = '<span class="form-assignee">👤 ' + (p ? p.name : 'مشترك') + '</span>';
      } else if (dist.status === 'reserved' && dist.representativeId) {
        const r = RepresentativeService.getById(dist.representativeId);
        assigneeHtml = '<span class="form-assignee">🧑‍💼 ' + (r ? r.name : 'مندوب') + '</span>';
      }
    }

    return `
      <div class="form-card status-${status}" onclick="showFormDetails(${f.id})" title="${f.description || ''}">
        <div class="form-card-header">
          <span class="form-num">#${f.id}</span>
          <span class="form-status-badge status-${status}">${statusLabels[status] || status}</span>
        </div>
        <div class="form-pages">📖 ص ${f.startPage}${f.endPage !== f.startPage ? ' - ' + f.endPage : ''}</div>
        <div class="form-verse">${f.startVerse || 'آيات الصفحة'}</div>
        ${assigneeHtml}
      </div>
    `;
  }).join('');
}

// ---- تفاصيل الاستمارة وتعديلها وطباعتها وتوزيعها المباشر ----
function showFormDetails(formId) {
  const form = getFormById(formId);
  if (!form) return;

  currentCycle = CycleService.getActive();
  const cycleId = currentCycle?.id;
  let statusHtml = '<span class="form-status-badge status-available">متاحة للتوزيع</span>';
  let actionHtml = '';

  const editSection = document.getElementById('formEditSection');
  const editParticipantSelect = document.getElementById('editParticipantSelect');
  const editPhone = document.getElementById('editPhone');
  const editPaidAmount = document.getElementById('editPaidAmount');
  const editDistId = document.getElementById('editDistId');
  const saveFormEditBtn = document.getElementById('saveFormEditBtn');

  populateParticipantSelects();

  if (cycleId) {
    const dist = DistributionService.getFormStatus(formId, cycleId);
    if (dist && dist.status === 'distributed') {
      const p = dist.participantId ? ParticipantService.getById(dist.participantId) : null;
      statusHtml = '<span class="form-status-badge status-distributed">موزعة للمشترك: ' + (p ? p.name : '؟') + '</span>';
      actionHtml = '<button class="btn-danger" onclick="cancelDist(\'' + dist.id + '\')">إلغاء التوزيع</button>';

      editSection.classList.remove('hidden');
      document.getElementById('formEditSectionTitle').textContent = 'تعديل التوزيع والمبلغ';
      editDistId.value = dist.id;
      editParticipantSelect.value = dist.participantId || '';
      editPhone.value = p ? (p.phone || '') : '';
      editPaidAmount.value = dist.paidAmount || '';

    } else if (dist && dist.status === 'reserved') {
      const r = dist.representativeId ? RepresentativeService.getById(dist.representativeId) : null;
      statusHtml = '<span class="form-status-badge status-reserved">محجوزة عند المندوب: ' + (r ? r.name : '؟') + '</span>';
      actionHtml = '<button class="btn-danger" onclick="cancelDist(\'' + dist.id + '\')">إلغاء الحجز</button>';

      editSection.classList.remove('hidden');
      document.getElementById('formEditSectionTitle').textContent = 'تسليم الاستمارة لمشترك';
      editDistId.value = dist.id;
      editParticipantSelect.value = '';
      editPhone.value = '';
      editPaidAmount.value = dist.paidAmount || '';

    } else {
      // الاستمارة متاحة - إظهار قسم التوزيع المباشر السريع
      editSection.classList.remove('hidden');
      document.getElementById('formEditSectionTitle').textContent = 'توزيع فوري للاستمارة';
      editDistId.value = 'NEW_' + formId;
      editParticipantSelect.value = '';
      editPhone.value = '';
      editPaidAmount.value = '';
      actionHtml = '<span class="success-text">✅ جاهزة للتوزيع الفوري أدناه</span>';
    }
  } else {
    editSection.classList.add('hidden');
    actionHtml = '<span class="warn-text">⚠️ يرجى تحديد دورة نشطة من الأعلى لتوزيع الاستمارة</span>';
  }

  editParticipantSelect.onchange = () => {
    const selectedP = ParticipantService.getById(editParticipantSelect.value);
    if (selectedP) editPhone.value = selectedP.phone || '';
  };

  document.getElementById('formDetailsTitle').textContent = 'استمارة رقم ' + formId;
  document.getElementById('formDetailsContent').innerHTML = `
    <div class="form-details-box">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px">
        <div style="font-size:28px; font-weight:900; color:var(--primary)">استمارة #${formId}</div>
        <div>${statusHtml}</div>
      </div>
      <div class="receipt-info-grid">
        <div class="receipt-info-item">
          <label>من صفحة</label>
          <span>${form.startPage}</span>
        </div>
        <div class="receipt-info-item">
          <label>إلى صفحة</label>
          <span>${form.endPage}</span>
        </div>
      </div>
      <div class="verse-box">
        <p>${form.description || ''}</p>
      </div>
      <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px">
        ${actionHtml}
      </div>
    </div>
  `;

  saveFormEditBtn.onclick = () => {
    const distId = editDistId.value;
    const newParticipantId = editParticipantSelect.value;
    const newPhone = editPhone.value.trim();
    const paidAmount = parseFloat(editPaidAmount.value) || 0;

    if (!newParticipantId) {
      Toast.error('الرجاء اختيار المشترك لحفظ التوزيع');
      return;
    }

    if (newPhone) {
      const p = ParticipantService.getById(newParticipantId);
      if (p) ParticipantService.update(newParticipantId, { phone: newPhone });
    }

    // إذا كانت استمارة جديدة غير موزعة نقوم بتوزيعها فوراً
    if (distId.startsWith('NEW_')) {
      const res = DistributionService.distributeToParticipant(cycleId, newParticipantId, [formId], '', paidAmount);
      if (res.success) {
        Toast.success('تم توزيع الاستمارة بنجاح!');
        Modal.close('formDetailsModal');
        updateCycleUI();
        renderPage(currentPage);
      } else {
        Toast.error(res.msg || 'فشل التوزيع');
      }
      return;
    }

    const dist = DistributionService.getFormStatus(formId, cycleId);
    let updates = { participantId: newParticipantId, paidAmount: paidAmount };

    if (dist && dist.status === 'reserved') {
      updates.status = 'distributed';
      updates.distributedAt = new Date().toISOString();
    }

    const res = DistributionService.updateDistribution(distId, updates);
    if (res.success) {
      Toast.success('تم حفظ التعديلات بنجاح');
      Modal.close('formDetailsModal');
      updateCycleUI();
      renderPage(currentPage);
    } else {
      Toast.error(res.msg || 'فشل في حفظ التعديلات');
    }
  };

  document.getElementById('btnPrintSingleForm').onclick = () => {
    Modal.close('formDetailsModal');
    printSingleFormA4(formId);
  };

  Modal.open('formDetailsModal');
}

function cancelDist(distId) {
  Modal.close('formDetailsModal');
  showConfirm('إلغاء التوزيع', 'هل أنت متأكد من إلغاء هذا التوزيع/الحجز؟ ستعود الاستمارة متاحة مجدداً.', () => {
    const result = DistributionService.cancel(distId);
    if (result.success) {
      Toast.success('تم إلغاء التوزيع بنجاح');
      updateCycleUI();
      renderPage(currentPage);
    }
  });
}

// =====================
// المشتركون (Participants)
// =====================
function renderParticipants() {
  const searchInput = document.getElementById('participantsSearch');
  const search = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const participants = ParticipantService.getAll().filter(p =>
    !search || p.name.toLowerCase().includes(search) || (p.phone && p.phone.includes(search))
  );

  const tbody = document.getElementById('participantsBody');
  if (!tbody) return;
  currentCycle = CycleService.getActive();
  const cycleId = currentCycle?.id;

  if (participants.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">لا يوجد مشتركون بعد. اضغط على "+ إضافة مشترك" لإضافة مشترك جديد</td></tr>';
    return;
  }

  tbody.innerHTML = participants.map((p, i) => {
    const rep = p.representativeId ? RepresentativeService.getById(p.representativeId) : null;
    const forms = cycleId ? ParticipantService.getForms(p.id, cycleId) : [];
    const formTags = forms.length > 0
      ? '<div class="forms-tags">' + forms.map(d => '<span class="form-tag" onclick="showFormDetails(' + d.formId + ')" title="استمارة ' + d.formId + '">#' + d.formId + '</span>').join('') + '</div>'
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
          <div style="display:flex;gap:6px">
            <button class="btn-icon success" onclick="printParticipantReceipt('${p.id}','${cycleId || ''}')" title="طباعة الإيصال">🖨️</button>
            <button class="btn-icon" onclick="editParticipant('${p.id}')" title="تعديل">✏️</button>
            <button class="btn-icon danger" onclick="deleteParticipant('${p.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

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
  showConfirm('حذف مشترك', 'هل أنت متأكد من حذف المشترك "' + (p ? p.name : '') + '"؟', () => {
    ParticipantService.delete(id);
    renderParticipants();
    populateParticipantSelects();
    Toast.success('تم حذف المشترك');
  });
}

// =====================
// المندوبون (Representatives)
// =====================
function renderRepresentatives() {
  const searchInput = document.getElementById('repsSearch');
  const search = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const reps = RepresentativeService.getAll().filter(r =>
    !search || r.name.toLowerCase().includes(search) || (r.area && r.area.toLowerCase().includes(search)) || (r.phone && r.phone.includes(search))
  );

  const tbody = document.getElementById('repsBody');
  if (!tbody) return;
  currentCycle = CycleService.getActive();
  const cycleId = currentCycle?.id;

  if (reps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">لا يوجد مندوبون بعد. اضغط على "+ إضافة مندوب" لإضافة مندوب جديد</td></tr>';
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
          <div style="display:flex;gap:6px">
            <button class="btn-icon success" onclick="printRepresentativeReceipt('${r.id}','${cycleId || ''}')" title="طباعة عهدة المندوب">🖨️</button>
            <button class="btn-icon" onclick="editRepresentative('${r.id}')" title="تعديل">✏️</button>
            <button class="btn-icon danger" onclick="deleteRepresentative('${r.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

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
  showConfirm('حذف مندوب', 'هل أنت متأكد من حذف المندوب "' + (r ? r.name : '') + '"؟', () => {
    RepresentativeService.delete(id);
    renderRepresentatives();
    populateRepSelects();
    Toast.success('تم حذف المندوب');
  });
}

// =====================
// التوزيع والحجز (Distribution)
// =====================
function renderDistribution() {
  populateParticipantSelects();
  populateRepSelects();
  refreshAvailableChips();
  renderDistHistory();
}

function refreshAvailableChips() {
  currentCycle = CycleService.getActive();
  const cycleId = currentCycle?.id;
  const containerDist = document.getElementById('formsSelector');
  const containerRep = document.getElementById('formsSelectorRep');

  if (!cycleId) {
    if (containerDist) containerDist.innerHTML = '<p style="color:var(--text-muted);font-size:13px">الرجاء تحديد دورة نشطة أولاً</p>';
    if (containerRep) containerRep.innerHTML = '<p style="color:var(--text-muted);font-size:13px">الرجاء تحديد دورة نشطة أولاً</p>';
    return;
  }

  const available = DistributionService.getAvailableForms(cycleId);

  if (containerDist) {
    containerDist.innerHTML = available.length === 0
      ? '<p style="color:var(--text-muted);font-size:13px">لا توجد استمارات متاحة في هذه الدورة</p>'
      : available.map(f => `
          <span class="form-chip ${selectedFormsForDist.includes(f.id) ? 'selected' : ''}" data-form="${f.id}" onclick="toggleChip(this,'dist')">${f.id}</span>
        `).join('');
  }

  if (containerRep) {
    containerRep.innerHTML = available.length === 0
      ? '<p style="color:var(--text-muted);font-size:13px">لا توجد استمارات متاحة في هذه الدورة</p>'
      : available.map(f => `
          <span class="form-chip ${selectedFormsForRep.includes(f.id) ? 'selected' : ''}" data-form="${f.id}" onclick="toggleChip(this,'rep')">${f.id}</span>
        `).join('');
  }
}

function toggleChip(el, type) {
  const formId = parseInt(el.dataset.form);
  if (type === 'dist') {
    if (selectedFormsForDist.includes(formId)) {
      selectedFormsForDist = selectedFormsForDist.filter(id => id !== formId);
      el.classList.remove('selected');
    } else {
      selectedFormsForDist.push(formId);
      el.classList.add('selected');
    }
  } else {
    if (selectedFormsForRep.includes(formId)) {
      selectedFormsForRep = selectedFormsForRep.filter(id => id !== formId);
      el.classList.remove('selected');
    } else {
      selectedFormsForRep.push(formId);
      el.classList.add('selected');
    }
  }
}

function renderDistHistory() {
  currentCycle = CycleService.getActive();
  const cycleId = currentCycle?.id;
  const tbody = document.getElementById('historyBody');
  if (!tbody) return;
  const searchInput = document.getElementById('histSearch');
  const search = (searchInput ? searchInput.value : '').toLowerCase().trim();

  if (!cycleId) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">⚠️ الرجاء اختيار دورة نشطة من القائمة العلوية</td></tr>';
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
      return String(d.formId).includes(search) || (p && p.name.toLowerCase().includes(search)) || (r && r.name.toLowerCase().includes(search));
    });
  }

  if (dists.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">لا توجد بيانات توزيع تطابق البحث</td></tr>';
    return;
  }

  const statusLabels = { distributed: 'موزعة', reserved: 'محجوزة', cancelled: 'ملغاة' };
  const statusColors = { distributed: 'var(--success)', reserved: 'var(--warning)', cancelled: 'var(--text-muted)' };

  tbody.innerHTML = dists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(d => {
    const form = getFormById(d.formId);
    const recipient = d.status === 'distributed' && d.participantId
      ? '👤 ' + (ParticipantService.getById(d.participantId)?.name || 'غير معروف')
      : d.representativeId
        ? '🧑‍💼 ' + (RepresentativeService.getById(d.representativeId)?.name || 'غير معروف')
        : '-';

    let actions = '';
    if (d.status !== 'cancelled') {
      actions = '<button class="btn-icon danger" onclick="cancelDist(\'' + d.id + '\')" title="إلغاء التوزيع">✕</button>';
    }

    return `
      <tr>
        <td><strong style="color:var(--primary)">#${d.formId}</strong></td>
        <td style="font-size:12px">${form ? form.startPage + ' - ' + form.endPage : '-'}</td>
        <td style="font-size:12px">${d.type === 'participant' ? 'مباشر لمشترك' : 'حجز عند مندوب'}</td>
        <td>${recipient}</td>
        <td><strong style="color:var(--success)">${d.paidAmount ? Number(d.paidAmount).toLocaleString() + ' ر.ع' : '0 ر.ع'}</strong></td>
        <td style="font-size:12px;color:var(--text-muted)">${formatDate(d.createdAt)}</td>
        <td><span style="color:${statusColors[d.status]};font-weight:700;font-size:12px">${statusLabels[d.status]}</span></td>
        <td>${actions}</td>
      </tr>
    `;
  }).join('');
}

// =====================
// التقارير (Reports)
// =====================
function renderReports() {
  currentCycle = CycleService.getActive();
  const cycleSummary = document.getElementById('reportCycleSummary');
  const repSummary = document.getElementById('reportRepresentatives');
  const comparison = document.getElementById('reportCyclesComparison');

  if (!currentCycle) {
    if (cycleSummary) cycleSummary.innerHTML = '<div class="empty-state"><span>📊</span><p>اختر دورة نشطة لعرض التقرير</p></div>';
    if (repSummary) repSummary.innerHTML = '<div class="empty-state"><span>🧑‍💼</span><p>اختر دورة نشطة لعرض تقرير المندوبين</p></div>';
    return;
  }

  const stats = CycleService.getStats(currentCycle.id);

  if (cycleSummary) {
    cycleSummary.innerHTML = `
      <div class="report-stat-grid">
        <div class="report-box">
          <label>إجمالي الاستمارات</label>
          <strong>${stats.total}</strong>
        </div>
        <div class="report-box success">
          <label>الموزعة للمشتركين</label>
          <strong>${stats.distributed}</strong>
        </div>
        <div class="report-box warning">
          <label>المحجوزة عند المندوبين</label>
          <strong>${stats.reserved}</strong>
        </div>
        <div class="report-box">
          <label>المتاحة المتبقية</label>
          <strong>${stats.available}</strong>
        </div>
        <div class="report-box full">
          <label>إجمالي المبالغ المحصلة</label>
          <strong style="color:var(--success)">${Number(stats.totalAmount || 0).toLocaleString()} ر.ع</strong>
        </div>
      </div>
    `;
  }

  const reps = RepresentativeService.getAll();
  if (repSummary) {
    if (reps.length === 0) {
      repSummary.innerHTML = '<div class="empty-state"><span>🧑‍💼</span><p>لا يوجد مندوبون مسجلون</p></div>';
    } else {
      repSummary.innerHTML = `
        <table class="data-table">
          <thead>
            <tr><th>المندوب</th><th>المحجوز</th><th>الموزع</th><th>النسبة</th></tr>
          </thead>
          <tbody>
            ${reps.map(r => {
              const res = RepresentativeService.getReservedForms(r.id, currentCycle.id).length;
              const dist = RepresentativeService.getDistributedForms(r.id, currentCycle.id).length;
              const total = res + dist;
              const pct = total > 0 ? Math.round((dist / total) * 100) : 0;
              return `
                <tr>
                  <td><strong>${r.name}</strong></td>
                  <td><span style="color:var(--warning);font-weight:700">${res}</span></td>
                  <td><span style="color:var(--success);font-weight:700">${dist}</span></td>
                  <td>${pct}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }

  const allCycles = CycleService.getAll();
  if (comparison) {
    if (allCycles.length <= 1) {
      comparison.innerHTML = '<div class="empty-state"><span>📈</span><p>ستظهر المقارنة عندما تنشئ أكثر من دورة</p></div>';
    } else {
      comparison.innerHTML = `
        <table class="data-table">
          <thead>
            <tr><th>الدورة</th><th>الموزع</th><th>المحجوز</th><th>المبالغ</th></tr>
          </thead>
          <tbody>
            ${allCycles.map(c => {
              const s = CycleService.getStats(c.id);
              return `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td><span style="color:var(--success);font-weight:700">${s.distributed}</span></td>
                  <td><span style="color:var(--warning);font-weight:700">${s.reserved}</span></td>
                  <td>${Number(s.totalAmount || 0).toLocaleString()} ر.ع</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }
}

// =====================
// الدورات (Cycles)
// =====================
function renderCycles() {
  const container = document.getElementById('cyclesList');
  if (!container) return;
  const cycles = CycleService.getAll();
  const active = CycleService.getActive();

  if (cycles.length === 0) {
    container.innerHTML = '<div class="empty-state"><span>🔄</span><p>لم يتم إنشاء أي دورة بعد. اضغط على "دورة جديدة" للبدء</p></div>';
    return;
  }

  container.innerHTML = cycles.map(c => {
    const isActive = active?.id === c.id;
    const stats = CycleService.getStats(c.id);

    return `
      <div class="cycle-card ${isActive ? 'active-cycle' : ''}">
        <div class="cycle-card-header">
          <div>
            <h3 class="cycle-name">${c.name}</h3>
            <span class="cycle-dates">📅 ${formatDate(c.startDate)} إلى ${formatDate(c.endDate)}</span>
          </div>
          <span class="cycle-status-pill ${isActive ? 'active' : ''}">${isActive ? 'الدورة النشطة' : 'غير نشطة'}</span>
        </div>
        <div class="cycle-card-stats">
          <div><span>موزعة:</span> <strong>${stats.distributed}</strong></div>
          <div><span>محجوزة:</span> <strong>${stats.reserved}</strong></div>
          <div><span>المبالغ:</span> <strong style="color:var(--success)">${Number(stats.totalAmount || 0).toLocaleString()} ر.ع</strong></div>
        </div>
        <div class="cycle-card-actions">
          ${!isActive ? '<button class="btn-primary btn-sm" onclick="setActiveCycle(\'' + c.id + '\')">تعيين كدورة نشطة</button>' : '<button class="btn-secondary btn-sm" disabled>✓ الدورة النشطة حالياً</button>'}
          <button class="btn-icon" onclick="editCycle('${c.id}')" title="تعديل">✏️</button>
          <button class="btn-icon danger" onclick="deleteCycle('${c.id}')" title="حذف">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function setActiveCycle(id) {
  CycleService.setActive(id);
  currentCycle = CycleService.getActive();
  updateCycleUI();
  populateCycleSelects();
  renderCycles();
  Toast.success('تم تغيير الدورة النشطة');
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
  showConfirm('حذف دورة', 'هل أنت متأكد من حذف الدورة "' + (c ? c.name : '') + '"؟ سيتم حذف جميع التوزيعات المرتبطة بها!', () => {
    CycleService.delete(id);
    currentCycle = CycleService.getActive();
    updateCycleUI();
    populateCycleSelects();
    renderCycles();
    Toast.success('تم حذف الدورة');
  });
}

// =====================
// الإعدادات (Settings)
// =====================
function renderSettings() {
  const s = SettingsService.getSettings();
  const db = loadDB();

  const elC = document.getElementById('info-cycles'); if (elC) elC.textContent = db.cycles.length;
  const elP = document.getElementById('info-participants'); if (elP) elP.textContent = db.participants.length;
  const elR = document.getElementById('info-representatives'); if (elR) elR.textContent = db.representatives.length;
  const elD = document.getElementById('info-distributions'); if (elD) elD.textContent = db.distributions.length;

  const tTitle = document.getElementById('settingPrintTitle'); if (tTitle) tTitle.value = s.printTitle || '';
  const tSub = document.getElementById('settingPrintSubtitle'); if (tSub) tSub.value = s.printSubtitle || '';
  const tHadith = document.getElementById('settingPrintHadith'); if (tHadith) tHadith.value = s.printHadith || '';
  const tDuties = document.getElementById('settingPrintDuties'); if (tDuties) tDuties.value = s.printDuties || '';
  const tNiya = document.getElementById('settingPrintNiya'); if (tNiya) tNiya.value = s.printNiya || '';
  const tNote = document.getElementById('settingPrintNote'); if (tNote) tNote.value = s.printNote || '';
  const tRewards = document.getElementById('settingPrintRewards'); if (tRewards) tRewards.value = s.printRewards || '';
  const tFooter = document.getElementById('settingPrintFooter'); if (tFooter) tFooter.value = s.printFooter || '';
}

// =====================
// ربط الأحداث (Event Listeners)
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
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
    document.getElementById('mainContent')?.classList.toggle('expanded');
  });

  document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
    document.getElementById('mainContent')?.classList.toggle('expanded');
  });

  // اختيار الدورة من الأعلى
  document.getElementById('activeCycleSelect')?.addEventListener('change', e => {
    CycleService.setActive(e.target.value || null);
    currentCycle = CycleService.getActive();
    updateCycleUI();
    renderPage(currentPage);
  });

  // -- إضافة مشترك --
  document.getElementById('addParticipantBtn')?.addEventListener('click', () => {
    document.getElementById('participantId').value = '';
    document.getElementById('participantName').value = '';
    document.getElementById('participantPhone').value = '';
    document.getElementById('participantNotes').value = '';
    populateRepSelects();
    document.getElementById('participantRep').value = '';
    document.getElementById('participantModalTitle').textContent = 'إضافة مشترك جديد';
    Modal.open('participantModal');
  });

  document.getElementById('saveParticipantBtn')?.addEventListener('click', () => {
    const name = document.getElementById('participantName').value.trim();
    if (!name) { Toast.error('الرجاء إدخال اسم المشترك'); return; }
    const data = {
      name,
      phone: document.getElementById('participantPhone').value.trim(),
      representativeId: document.getElementById('participantRep').value || null,
      notes: document.getElementById('participantNotes').value.trim()
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
    populateParticipantSelects();
  });

  // -- إضافة مندوب --
  document.getElementById('addRepresentativeBtn')?.addEventListener('click', () => {
    document.getElementById('repId').value = '';
    document.getElementById('repName').value = '';
    document.getElementById('repPhone').value = '';
    document.getElementById('repArea').value = '';
    document.getElementById('repNotes').value = '';
    document.getElementById('repModalTitle').textContent = 'إضافة مندوب جديد';
    Modal.open('representativeModal');
  });

  document.getElementById('saveRepBtn')?.addEventListener('click', () => {
    const name = document.getElementById('repName').value.trim();
    if (!name) { Toast.error('الرجاء إدخال اسم المندوب'); return; }
    const data = {
      name,
      phone: document.getElementById('repPhone').value.trim(),
      area: document.getElementById('repArea').value.trim(),
      notes: document.getElementById('repNotes').value.trim()
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
  document.getElementById('addCycleBtn')?.addEventListener('click', () => {
    document.getElementById('cycleId').value = '';
    document.getElementById('cycleName').value = '';
    document.getElementById('cycleNotes').value = '';
    document.getElementById('cycleStart').value = '';
    document.getElementById('cycleEnd').value = '';
    document.getElementById('cycleModalTitle').textContent = 'إنشاء دورة جديدة';
    document.getElementById('saveCycleBtn').textContent = 'إنشاء الدورة';
    Modal.open('cycleModal');
  });

  document.getElementById('saveCycleBtn')?.addEventListener('click', () => {
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
      currentCycle = cycle;
      updateCycleUI();
      populateCycleSelects();
      Toast.success('تم إنشاء الدورة بنجاح');
    }
    Modal.close('cycleModal');
    renderCycles();
    populateCycleSelects();
  });

  // -- البحث المباشر في قوائم التوزيع --
  document.getElementById('searchDistParticipant')?.addEventListener('input', e => {
    populateParticipantSelects(e.target.value);
  });

  document.getElementById('searchDistRep')?.addEventListener('input', e => {
    populateRepSelects(e.target.value);
  });

  // تبويبات التوزيع
  document.querySelectorAll('.dist-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dist-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.dist-panel').forEach(p => p.classList.add('hidden'));
      document.getElementById('dist-' + tab.dataset.dist)?.classList.remove('hidden');
    });
  });

  // طريقة التوزيع (تلقائي / يدوي)
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

  // زر توزيع لمشترك
  document.getElementById('distributeBtn')?.addEventListener('click', () => {
    currentCycle = CycleService.getActive();
    if (!currentCycle) { Toast.error('الرجاء اختيار دورة نشطة أولاً'); return; }

    const participantId = document.getElementById('distParticipantSelect').value;
    if (!participantId) { Toast.error('الرجاء اختيار المشترك'); return; }

    const method = document.querySelector('input[name="distMethod"]:checked').value;
    let formIds = [];

    if (method === 'auto') {
      const count = parseInt(document.getElementById('distCount').value) || 1;
      const available = DistributionService.getAvailableForms(currentCycle.id);
      if (available.length < count) {
        Toast.error('لا توجد استمارات كافية. المتاح حالياً: ' + available.length);
        return;
      }
      formIds = available.slice(0, count).map(f => f.id);
    } else {
      formIds = [...selectedFormsForDist];
      if (formIds.length === 0) { Toast.error('الرجاء اختيار استمارة واحدة على الأقل'); return; }
    }

    const notes = document.getElementById('distNotes').value.trim();
    const amount = document.getElementById('distAmount').value.trim();
    const result = DistributionService.distributeToParticipant(currentCycle.id, participantId, formIds, notes, amount);

    if (result.success) {
      Toast.success('تم توزيع ' + result.count + ' استمارة بنجاح');
      selectedFormsForDist = [];
      document.getElementById('distCount').value = 1;
      document.getElementById('distNotes').value = '';
      document.getElementById('distAmount').value = '';

      const printBtn = document.getElementById('distPrintParticipantBtn');
      if (printBtn) {
        printBtn.classList.remove('hidden');
        printBtn.onclick = () => printParticipantReceipt(participantId, currentCycle.id);
      }

      updateCycleUI();
      refreshAvailableChips();
      renderDistHistory();
    } else {
      Toast.error(result.msg || 'فشلت عملية التوزيع');
    }
  });

  // زر حجز لمندوب
  document.getElementById('reserveBtn')?.addEventListener('click', () => {
    currentCycle = CycleService.getActive();
    if (!currentCycle) { Toast.error('الرجاء اختيار دورة نشطة أولاً'); return; }

    const repId = document.getElementById('distRepSelect').value;
    if (!repId) { Toast.error('الرجاء اختيار المندوب'); return; }

    const method = document.querySelector('input[name="distRepMethod"]:checked').value;
    let formIds = [];

    if (method === 'auto') {
      const count = parseInt(document.getElementById('distRepCount').value) || 1;
      const available = DistributionService.getAvailableForms(currentCycle.id);
      if (available.length < count) {
        Toast.error('لا توجد استمارات كافية. المتاح حالياً: ' + available.length);
        return;
      }
      formIds = available.slice(0, count).map(f => f.id);
    } else {
      formIds = [...selectedFormsForRep];
      if (formIds.length === 0) { Toast.error('الرجاء اختيار استمارة واحدة على الأقل'); return; }
    }

    const notes = document.getElementById('distRepNotes').value.trim();
    const amount = document.getElementById('distRepAmount').value.trim();
    const result = DistributionService.reserveForRepresentative(currentCycle.id, repId, formIds, notes, amount);

    if (result.success) {
      Toast.success('تم حجز ' + result.count + ' استمارة للمندوب بنجاح');
      selectedFormsForRep = [];
      document.getElementById('distRepCount').value = 1;
      document.getElementById('distRepNotes').value = '';
      document.getElementById('distRepAmount').value = '';

      const printBtn = document.getElementById('distPrintRepBtn');
      if (printBtn) {
        printBtn.classList.remove('hidden');
        printBtn.onclick = () => printRepresentativeReceipt(repId, currentCycle.id);
      }

      updateCycleUI();
      refreshAvailableChips();
      renderDistHistory();
    } else {
      Toast.error(result.msg || 'فشلت عملية الحجز');
    }
  });

  // فلاتر سجل التوزيع
  document.querySelectorAll('[data-hist]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-hist]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      historyFilter = btn.dataset.hist;
      renderDistHistory();
    });
  });

  document.getElementById('histSearch')?.addEventListener('input', () => renderDistHistory());

  // فلاتر الاستمارات
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      formsFilter = btn.dataset.filter;
      renderForms();
    });
  });

  // البحث المباشر
  document.getElementById('formsSearch')?.addEventListener('input', () => renderForms());
  document.getElementById('participantsSearch')?.addEventListener('input', () => renderParticipants());
  document.getElementById('repsSearch')?.addEventListener('input', () => renderRepresentatives());

  // إعدادات النسخ الاحتياطي
  document.getElementById('exportBtn')?.addEventListener('click', () => BackupService.export());
  document.getElementById('exportBtnSettings')?.addEventListener('click', () => BackupService.export());

  document.getElementById('importBtn')?.addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importBtnSettings')?.addEventListener('click', () => document.getElementById('importFile').click());

  document.getElementById('importFile')?.addEventListener('change', e => {
    if (e.target.files[0]) {
      BackupService.import(e.target.files[0], () => {
        init();
      });
    }
  });

  // حفظ إعدادات الطباعة
  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const newSettings = {
      printTitle: document.getElementById('settingPrintTitle').value.trim(),
      printSubtitle: document.getElementById('settingPrintSubtitle').value.trim(),
      printHadith: document.getElementById('settingPrintHadith').value.trim(),
      printDuties: document.getElementById('settingPrintDuties').value.trim(),
      printNiya: document.getElementById('settingPrintNiya').value.trim(),
      printNote: document.getElementById('settingPrintNote').value.trim(),
      printRewards: document.getElementById('settingPrintRewards').value.trim(),
      printFooter: document.getElementById('settingPrintFooter').value.trim()
    };
    SettingsService.saveSettings(newSettings);
    Toast.success('تم حفظ إعدادات نموذج الطباعة بنجاح!');
  });

  // مسح البيانات
  document.getElementById('clearDataBtn')?.addEventListener('click', () => {
    showConfirm('مسح جميع البيانات', '⚠️ تحذير: سيتم حذف جميع الدورات والمشتركين والتوزيعات المسجلة بشكل نهائي! هل أنت متأكد؟', () => {
      localStorage.removeItem('khatma_db');
      Toast.success('تم مسح جميع البيانات وإعادة تعيين النظام');
      setTimeout(() => window.location.reload(), 600);
    });
  });
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);

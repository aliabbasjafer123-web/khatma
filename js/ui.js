// ======================================================
// ui.js - مساعدات واجهة المستخدم
// ======================================================

// ---- التوست ----
const Toast = {
  show(msg, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

// ---- المودالات ----
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      if (document.querySelectorAll('.modal-overlay:not(.hidden)').length === 0) {
        document.body.classList.remove('modal-open');
      }
    }
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    document.body.classList.remove('modal-open');
  }
};

// إغلاق المودالات عند الضغط على Escape أو الخلفية
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') Modal.closeAll();
});

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) Modal.closeAll();
  if (e.target.classList.contains('modal-close') || e.target.dataset.modal) {
    const id = e.target.dataset.modal || e.target.closest('[data-modal]')?.dataset.modal;
    if (id) Modal.close(id);
  }
});

// ---- التأكيد ----
let _confirmCallback = null;

function showConfirm(title, message, onConfirm, danger = true) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  _confirmCallback = onConfirm;
  const btn = document.getElementById('confirmOkBtn');
  btn.className = danger ? 'btn-danger' : 'btn-primary';
  btn.textContent = 'تأكيد';
  Modal.open('confirmModal');
}

document.getElementById('confirmOkBtn').addEventListener('click', () => {
  if (_confirmCallback) { _confirmCallback(); _confirmCallback = null; }
  Modal.close('confirmModal');
});

// ---- التاريخ والوقت ----
function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function updateClock() {
  const el = document.getElementById('datetime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString('ar-SA', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

updateClock();
setInterval(updateClock, 30000);

// ---- الطباعة ----
window.printReport = function(type) {
  window.print();
};

// ---- إيصال المشترك ----
function printParticipantReceipt(participantId, cycleId) {
  const participant = ParticipantService.getById(participantId);
  const cycle = CycleService.getById(cycleId);
  if (!participant || !cycle) return;

  const forms = ParticipantService.getForms(participantId, cycleId);
  if (forms.length === 0) {
    Toast.warning('لا توجد استمارات لهذا المشترك في هذه الدورة');
    return;
  }

  const s = SettingsService.getSettings();
  const dutiesHtml = s.printDuties ? s.printDuties.split('\n').map(l => `<li>${l}</li>`).join('') : '';
  const rewardsHtml = s.printRewards ? s.printRewards.split('\n').map(l => `<li>${l}</li>`).join('') : '';

  const pagesHtml = forms.map(d => {
    const form = getFormById(d.formId);
    if (!form) return '';
    return `
      <div class="a4-page">
        <div class="print-border">
          <div class="print-header">
            <h3>${s.printTitle || ''}</h3>
            <p>${s.printSubtitle || ''}</p>
          </div>
          <div class="print-info-row">
            <span>اسم المشترك: <strong>${participant.name}</strong></span>
            <span>رقم الصفحة في التطبيق / <strong>${form.id}</strong></span>
          </div>
          <div class="print-hadith">
            ${s.printHadith ? s.printHadith.replace(/\n/g, '<br>') : ''}
          </div>
          <div class="print-aya-box">
            تقرأ من صفحة ( <strong>${form.startPage}</strong> ) قال تعالى : (( <strong>${form.startVerse}</strong> )) والصفحة ( <strong>${form.endPage}</strong> ) التي تنتهي بقوله تعالى (( <strong>${form.endVerse}</strong> ))
          </div>
          <div class="print-duties">
            <div class="print-duties-title">واجبات المشترك (خلال شهر رجب وشعبان):</div>
            <ol>${dutiesHtml}</ol>
            <div class="print-duties-note">
              ${s.printNiya ? `<span class="red-text">نية القراءة :-</span> ${s.printNiya.replace('نية القراءة :-', '').trim()}<br>` : ''}
              ${s.printNote ? `<span class="red-text">ملاحظة :-</span> ${s.printNote.replace('ملاحظة :-', '').trim()}` : ''}
            </div>
          </div>
          <div class="print-reward-box">
            <div class="print-duties-title red-text" style="text-decoration:none">الثواب الذي يحصل عليه المشترك (خلال شهر رجب وشعبان):</div>
            <div class="qr-placeholder">
              QR Code
              <span>نزل التطبيق من هنا</span>
            </div>
            <ul>${rewardsHtml}</ul>
            <div style="clear:both"></div>
          </div>
          <div class="print-stats-box">
            <div class="print-stats-title">${s.printFooter ? s.printFooter.split('\n').pop() : ''}</div>
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700">
              <div>المبلغ المصروف الكلي: (127,500,92) ر.ع</div>
              <div>عدد المستفيدين الكلي: (1,234) مستفيد</div>
            </div>
            <hr style="border:1px solid #8b0000; margin:5px 0">
            <ul style="font-size:11px">
              <li>صرف كفالة: (24,340,000 ر.ع) | عدد المستفيدين: (343)</li>
              <li>صرف تعذية: (43,000,000 ر.ع) | عدد المستفيدين: (455)</li>
              <li>صرف لحوم: (12,500,000 ر.ع) | عدد المستفيدين: (120)</li>
              <li>صرف ايتام: (34,000,000 ر.ع) | عدد المستفيدين: (150)</li>
              <li>صرف زواج: (5,000,000 ر.ع) | عدد المستفيدين: (10)</li>
              <li>صرف اعمار: (8,660,000 ر.ع) | عدد المستفيدين: (20)</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const content = `<div class="print-content" style="padding:0; background:none">${pagesHtml}</div>`;

  document.getElementById('printModalTitle').textContent = `إيصال: ${participant.name}`;
  document.getElementById('printContent').innerHTML = content;
  Modal.open('printModal');
}

// ---- طباعة استمارة واحدة A4 ----
function printSingleFormA4(formId) {
  const form = getFormById(formId);
  if (!form) return;

  const cycleId = currentCycle?.id;
  let participantName = '.....................';
  
  if (cycleId) {
    const dist = DistributionService.getFormStatus(formId, cycleId);
    if (dist.status === 'distributed' && dist.participantId) {
      const p = ParticipantService.getById(dist.participantId);
      if (p) participantName = p.name;
    }
  }

  const s = SettingsService.getSettings();
  const dutiesHtml = s.printDuties ? s.printDuties.split('\n').map(l => `<li>${l}</li>`).join('') : '';
  const rewardsHtml = s.printRewards ? s.printRewards.split('\n').map(l => `<li>${l}</li>`).join('') : '';

  const contentHtml = `
    <div class="a4-page">
      <div class="print-border">
        <div class="print-header">
          <h3>${s.printTitle || ''}</h3>
          <p>${s.printSubtitle || ''}</p>
        </div>
        <div class="print-info-row">
          <span>اسم المشترك: <strong>${participantName}</strong></span>
          <span>رقم الصفحة في التطبيق / <strong>${form.id}</strong></span>
        </div>
        <div class="print-hadith">
          ${s.printHadith ? s.printHadith.replace(/\n/g, '<br>') : ''}
        </div>
        <div class="print-aya-box">
          تقرأ من صفحة ( <strong>${form.startPage}</strong> ) قال تعالى : (( <strong>${form.startVerse}</strong> )) والصفحة ( <strong>${form.endPage}</strong> ) التي تنتهي بقوله تعالى (( <strong>${form.endVerse}</strong> ))
        </div>
        <div class="print-duties">
          <div class="print-duties-title">واجبات المشترك (خلال شهر رجب وشعبان):</div>
          <ol>${dutiesHtml}</ol>
          <div class="print-duties-note">
            ${s.printNiya ? `<span class="red-text">نية القراءة :-</span> ${s.printNiya.replace('نية القراءة :-', '').trim()}<br>` : ''}
            ${s.printNote ? `<span class="red-text">ملاحظة :-</span> ${s.printNote.replace('ملاحظة :-', '').trim()}` : ''}
          </div>
        </div>
        <div class="print-reward-box">
          <div class="print-duties-title red-text" style="text-decoration:none">الثواب الذي يحصل عليه المشترك (خلال شهر رجب وشعبان):</div>
          <div class="qr-placeholder">
            QR Code
            <span>نزل التطبيق من هنا</span>
          </div>
          <ul>${rewardsHtml}</ul>
          <div style="clear:both"></div>
        </div>
        <div class="print-stats-box">
          <div class="print-stats-title">${s.printFooter ? s.printFooter.split('\n').pop() : ''}</div>
          <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700">
            <div>المبلغ المصروف الكلي: (127,500,92) ر.ع</div>
            <div>عدد المستفيدين الكلي: (1,234) مستفيد</div>
          </div>
          <hr style="border:1px solid #8b0000; margin:5px 0">
          <ul style="font-size:11px">
            <li>صرف كفالة: (24,340,000 ر.ع) | عدد المستفيدين: (343)</li>
            <li>صرف تعذية: (43,000,000 ر.ع) | عدد المستفيدين: (455)</li>
            <li>صرف لحوم: (12,500,000 ر.ع) | عدد المستفيدين: (120)</li>
            <li>صرف ايتام: (34,000,000 ر.ع) | عدد المستفيدين: (150)</li>
            <li>صرف زواج: (5,000,000 ر.ع) | عدد المستفيدين: (10)</li>
            <li>صرف اعمار: (8,660,000 ر.ع) | عدد المستفيدين: (20)</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  document.getElementById('printModalTitle').textContent = `طباعة استمارة رقم ${formId}`;
  document.getElementById('printContent').innerHTML = `<div class="print-content" style="padding:0; background:none">${contentHtml}</div>`;
  Modal.open('printModal');
  
  // نعطي المتصفح مهلة قصيرة لعرض المودال ثم نستدعي الطباعة
  setTimeout(() => {
    window.print();
  }, 300);
}

// ---- إيصال المندوب ----
function printRepresentativeReceipt(repId, cycleId) {
  const rep = RepresentativeService.getById(repId);
  const cycle = CycleService.getById(cycleId);
  if (!rep || !cycle) return;

  const reserved = RepresentativeService.getReservedForms(repId, cycleId);
  const distributed = RepresentativeService.getDistributedForms(repId, cycleId);
  const allForms = [...reserved, ...distributed];

  if (allForms.length === 0) {
    Toast.warning('لا توجد استمارات لهذا المندوب في هذه الدورة');
    return;
  }

  const db = loadDB();

  let rows = allForms.map(d => {
    const form = getFormById(d.formId);
    const participant = d.participantId ? ParticipantService.getById(d.participantId) : null;
    const statusLabel = d.status === 'reserved' ? '🔒 محجوزة' : '✅ موزعة';
    return `
      <tr>
        <td class="form-id">${d.formId}</td>
        <td>${form ? `${form.startPage} - ${form.endPage}` : '-'}</td>
        <td>${participant ? participant.name : '-'}</td>
        <td>${statusLabel}</td>
      </tr>
    `;
  }).join('');

  const content = `
    <div class="bismillah">﷽</div>
    <div class="receipt-header">
      <h2>🧑‍💼 تقرير المندوب</h2>
      <p class="sub">ختمة القرآن الكريم - ${cycle.name}</p>
    </div>
    <div class="receipt-info">
      <div class="receipt-info-item">
        <label>اسم المندوب</label>
        <span>${rep.name}</span>
      </div>
      <div class="receipt-info-item">
        <label>المنطقة</label>
        <span>${rep.area || '-'}</span>
      </div>
      <div class="receipt-info-item">
        <label>الدورة</label>
        <span>${cycle.name}</span>
      </div>
      <div class="receipt-info-item">
        <label>تاريخ الطباعة</label>
        <span>${new Date().toLocaleDateString('ar-SA')}</span>
      </div>
    </div>
    <div class="receipt-total">
      <span class="total-label">إجمالي الاستمارات | محجوزة: ${reserved.length} | موزعة: ${distributed.length}</span>
      <span class="total-val">${allForms.length}</span>
    </div>
    <table class="receipt-table">
      <thead>
        <tr>
          <th>رقم الاستمارة</th>
          <th>الصفحات</th>
          <th>المشترك</th>
          <th>الحالة</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="receipt-footer">
      <p>جزاكم الله خيراً على جهودكم في خدمة القرآن الكريم</p>
    </div>
  `;

  document.getElementById('printModalTitle').textContent = `تقرير المندوب: ${rep.name}`;
  document.getElementById('printContent').innerHTML = content;
  Modal.open('printModal');
}

// ---- تعبئة قوائم الاختيار ----
function populateParticipantSelects() {
  const participants = ParticipantService.getAll();
  ['distParticipantSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value;
    el.innerHTML = '<option value="">-- اختر المشترك --</option>';
    participants.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      el.appendChild(opt);
    });
    if (val) el.value = val;
  });
}

function populateRepSelects() {
  const reps = RepresentativeService.getAll();
  ['distRepSelect', 'participantRep'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value;
    el.innerHTML = id === 'participantRep'
      ? '<option value="">-- مشترك مستقل --</option>'
      : '<option value="">-- اختر المندوب --</option>';
    reps.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name + (r.area ? ` (${r.area})` : '');
      el.appendChild(opt);
    });
    if (val) el.value = val;
  });
}

function populateCycleSelects() {
  const cycles = CycleService.getAll();
  const active = CycleService.getActive();
  const sel = document.getElementById('activeCycleSelect');
  if (sel) {
    sel.innerHTML = '<option value="">-- اختر دورة --</option>';
    cycles.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (active && c.id === active.id) opt.selected = true;
      sel.appendChild(opt);
    });
  }
}


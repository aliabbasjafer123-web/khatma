// ======================================================
// ui.js - واجهات المستخدم والطباعة والمودالات
// ======================================================

// ---- نظام الإشعارات (Toast) ----
const Toast = {
  show(msg, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ️') + '</span><span class="toast-msg">' + msg + '</span>';
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

// ---- المودالات (Modals) ----
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

function showConfirm(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  const okBtn = document.getElementById('confirmOkBtn');
  okBtn.onclick = () => {
    Modal.close('confirmModal');
    onConfirm();
  };
  Modal.open('confirmModal');
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  if (!iso) return '';
  const now = new Date();
  const d = new Date(iso);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return 'منذ ' + Math.floor(diff / 60) + ' دقيقة';
  if (diff < 86400) return 'منذ ' + Math.floor(diff / 3600) + ' ساعة';
  return 'منذ ' + Math.floor(diff / 86400) + ' يوم';
}

function updateClock() {
  const el = document.getElementById('datetime');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' | ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }
}
setInterval(updateClock, 1000);
updateClock();

// ---- إنشاء كود صفحة الطباعة A4 المعتمد ----
function generateFormPrintHtml(form, participantName = '.....................') {
  const s = SettingsService.getSettings();
  const dutiesHtml = s.printDuties ? s.printDuties.split('\n').filter(Boolean).map(l => '<li>' + l + '</li>').join('') : '';
  const rewardsHtml = s.printRewards ? s.printRewards.split('\n').filter(Boolean).map(l => '<li>' + l + '</li>').join('') : '';

  return `
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
          تقرأ من صفحة ( <strong>${form.startPage}</strong> ) قال تعالى : (( <strong>${form.startVerse || ''}</strong> )) والصفحة ( <strong>${form.endPage}</strong> ) التي تنتهي بقوله تعالى (( <strong>${form.endVerse || ''}</strong> ))
        </div>
        <div class="print-duties">
          <div class="print-duties-title">واجبات المشترك (خلال شهر رجب وشعبان):</div>
          <ol>${dutiesHtml}</ol>
          <div class="print-duties-note">
            ${s.printNiya ? '<span class="red-text">نية القراءة :-</span> ' + s.printNiya.replace('نية القراءة :-', '').trim() + '<br>' : ''}
            ${s.printNote ? '<span class="red-text">ملاحظة :-</span> ' + s.printNote.replace('ملاحظة :-', '').trim() : ''}
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
            <li>صرف تغذية: (43,000,000 ر.ع) | عدد المستفيدين: (455)</li>
            <li>صرف لحوم: (12,500,000 ر.ع) | عدد المستفيدين: (120)</li>
            <li>صرف أيتام: (34,000,000 ر.ع) | عدد المستفيدين: (150)</li>
            <li>صرف زواج: (5,000,000 ر.ع) | عدد المستفيدين: (10)</li>
            <li>صرف إعمار: (8,660,000 ر.ع) | عدد المستفيدين: (20)</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

// دالة تنفيذ الطباعة المباشرة
function triggerPrint(htmlContent, title = 'طباعة') {
  // تحديث الحاوية المخصصة للطباعة المباشرة
  let printArea = document.getElementById('directPrintArea');
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'directPrintArea';
    document.body.appendChild(printArea);
  }
  printArea.innerHTML = htmlContent;

  // إعداد وعرض نافذة المعاينة
  const printModalTitle = document.getElementById('printModalTitle');
  const printContent = document.getElementById('printContent');
  if (printModalTitle) printModalTitle.textContent = title;
  if (printContent) printContent.innerHTML = htmlContent;
  
  Modal.open('printModal');
}

function doPrintNow() {
  window.print();
}

// ---- طباعة استمارة واحدة ----
function printSingleFormA4(formId) {
  const form = getFormById(formId);
  if (!form) return;

  const cycle = CycleService.getActive();
  let participantName = '.....................';
  if (cycle) {
    const dist = DistributionService.getFormStatus(formId, cycle.id);
    if (dist && dist.status === 'distributed' && dist.participantId) {
      const p = ParticipantService.getById(dist.participantId);
      if (p) participantName = p.name;
    }
  }

  const contentHtml = generateFormPrintHtml(form, participantName);
  triggerPrint(contentHtml, 'طباعة استمارة رقم ' + formId);
}

// ---- طباعة إيصالات المشترك ----
function printParticipantReceipt(participantId, cycleId) {
  const participant = ParticipantService.getById(participantId);
  const cycle = cycleId ? CycleService.getById(cycleId) : CycleService.getActive();
  if (!participant) {
    Toast.error('المشترك غير موجود');
    return;
  }
  if (!cycle) {
    Toast.error('الرجاء اختيار دورة نشطة أولاً');
    return;
  }

  const forms = ParticipantService.getForms(participantId, cycle.id);
  if (forms.length === 0) {
    Toast.warning('لا توجد استمارات موزعة لهذا المشترك في هذه الدورة');
    return;
  }

  const pagesHtml = forms.map(d => {
    const form = getFormById(d.formId);
    return form ? generateFormPrintHtml(form, participant.name) : '';
  }).join('');

  triggerPrint(pagesHtml, 'إيصال المشترك: ' + participant.name + ' (' + forms.length + ' استمارة)');
}

// ---- طباعة استمارات المندوب ----
function printRepresentativeReceipt(repId, cycleId) {
  const rep = RepresentativeService.getById(repId);
  const cycle = cycleId ? CycleService.getById(cycleId) : CycleService.getActive();
  if (!rep) {
    Toast.error('المندوب غير موجود');
    return;
  }
  if (!cycle) {
    Toast.error('الرجاء اختيار دورة نشطة أولاً');
    return;
  }

  const reserved = RepresentativeService.getReservedForms(repId, cycle.id);
  if (reserved.length === 0) {
    Toast.warning('لا توجد استمارات محجوزة لهذا المندوب في هذه الدورة');
    return;
  }

  const pagesHtml = reserved.map(d => {
    const form = getFormById(d.formId);
    return form ? generateFormPrintHtml(form, 'مندوب: ' + rep.name) : '';
  }).join('');

  triggerPrint(pagesHtml, 'إيصال عهدة المندوب: ' + rep.name + ' (' + reserved.length + ' استمارة)');
}

// ---- تعبئة القوائم المنسدلة ----
function populateParticipantSelects(searchQuery = '') {
  const participants = ParticipantService.getAll();
  const q = (searchQuery || '').toLowerCase().trim();
  const filtered = q ? participants.filter(p => p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q))) : participants;

  const select = document.getElementById('distParticipantSelect');
  if (select) {
    const curVal = select.value;
    select.innerHTML = '<option value="">-- اختر المشترك (' + filtered.length + ') --</option>';
    filtered.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name + (p.phone ? ' (' + p.phone + ')' : '');
      select.appendChild(opt);
    });
    if (curVal && filtered.some(p => p.id === curVal)) select.value = curVal;
  }

  const editSelect = document.getElementById('editParticipantSelect');
  if (editSelect) {
    const curVal = editSelect.value;
    editSelect.innerHTML = '<option value="">-- اختر المشترك --</option>';
    participants.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name + (p.phone ? ' (' + p.phone + ')' : '');
      editSelect.appendChild(opt);
    });
    if (curVal) editSelect.value = curVal;
  }
}

function populateRepSelects(searchQuery = '') {
  const reps = RepresentativeService.getAll();
  const q = (searchQuery || '').toLowerCase().trim();
  const filtered = q ? reps.filter(r => r.name.toLowerCase().includes(q) || (r.area && r.area.toLowerCase().includes(q))) : reps;

  const repSelect = document.getElementById('distRepSelect');
  if (repSelect) {
    const curVal = repSelect.value;
    repSelect.innerHTML = '<option value="">-- اختر المندوب (' + filtered.length + ') --</option>';
    filtered.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name + (r.area ? ' [' + r.area + ']' : '');
      repSelect.appendChild(opt);
    });
    if (curVal && filtered.some(r => r.id === curVal)) repSelect.value = curVal;
  }

  const partRepSelect = document.getElementById('participantRep');
  if (partRepSelect) {
    const curVal = partRepSelect.value;
    partRepSelect.innerHTML = '<option value="">-- مشترك مستقل --</option>';
    reps.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name + (r.area ? ' [' + r.area + ']' : '');
      partRepSelect.appendChild(opt);
    });
    if (curVal) partRepSelect.value = curVal;
  }
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

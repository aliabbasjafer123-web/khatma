// ======================================================
// ui.js - واجهات المستخدم والطباعة والمودالات
// ======================================================

var Toast = {
  show(msg, type = 'info', duration = 3500) {
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    var toast = document.createElement('div');
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

var Modal = {
  open(id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }
  },
  close(id) {
    var el = document.getElementById(id);
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
    var id = e.target.dataset.modal || e.target.closest('[data-modal]')?.dataset.modal;
    if (id) Modal.close(id);
  }
});

function showConfirm(title, message, onConfirm) {
  var modal = document.getElementById('confirmModal');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  var okBtn = document.getElementById('confirmOkBtn');
  okBtn.onclick = () => {
    Modal.close('confirmModal');
    onConfirm();
  };
  Modal.open('confirmModal');
}

function formatDate(iso) {
  if (!iso) return '-';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '-';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  if (!iso) return '';
  var now = new Date();
  var d = new Date(iso);
  var diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return 'منذ ' + Math.floor(diff / 60) + ' دقيقة';
  if (diff < 86400) return 'منذ ' + Math.floor(diff / 3600) + ' ساعة';
  return 'منذ ' + Math.floor(diff / 86400) + ' يوم';
}

function updateClock() {
  var el = document.getElementById('datetime');
  if (el) {
    var now = new Date();
    el.textContent = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' | ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }
}
setInterval(updateClock, 1000);
updateClock();

function generateFormPrintHtml(form, participantName = '.....................') {
  var s = SettingsService.getSettings();
  var cycle = CycleService.getActive();
  var cycleName = cycle ? cycle.name : '';
  
  var dutiesHtml = s.printDuties ? s.printDuties.split(/\n|\\n/).filter(Boolean).map(l => '<div style="margin-bottom:4px;">' + l + '</div>').join('') : '';
  var rewardsHtml = s.printRewards ? s.printRewards.split(/\n|\\n/).filter(Boolean).map(l => '<div style="margin-bottom:4px;">' + l + '</div>').join('') : '';

  return `
    <div class="a4-page">
      <div class="print-border">
        <div class="print-header">
          ${s.orgLogo ? `<img src="${s.orgLogo}" style="max-height:60px; margin-bottom:5px;">` : ''}
          <h3>${s.printTitle || ''}</h3>
          <p>${s.printSubtitle || ''}</p>
          <div style="font-weight:bold; color:#8b0000; font-size: 15px; margin-top: 4px;">الدورة: ${cycleName}</div>
        </div>
        <div class="print-info-row">
          <span>اسم المشترك: <strong>${participantName}</strong></span>
          <span>رقم الصفحة في التطبيق / <strong>${form.id}</strong></span>
        </div>
        <div class="print-hadith">
          ${s.printHadith ? s.printHadith.split(/\n|\\n/).filter(Boolean).map(h => '<div style="margin-bottom:4px;">' + h + '</div>').join('') : ''}
        </div>
        <div class="print-aya-box">
          تقرأ من صفحة ( <strong>${form.startPage}</strong> ) قال تعالى : (( <strong>${form.startVerse || ''}</strong> )) والصفحة ( <strong>${form.endPage}</strong> ) التي تنتهي بقوله تعالى (( <strong>${form.endVerse || ''}</strong> ))
        </div>
        <div class="print-duties">
          <div class="print-duties-title">واجبات المشترك (خلال شهر رجب وشعبان):</div>
          <div style="font-size: 13px; font-weight: 600; line-height: 1.6; padding-right: 10px;">${dutiesHtml}</div>
          <div class="print-duties-note">
            ${s.printNiya ? '<div style="margin-bottom:6px;"><span class="red-text">نية القراءة :-</span> ' + s.printNiya.replace('نية القراءة :-', '').trim() + '</div>' : ''}
            ${s.printNote ? '<div><span class="red-text">ملاحظة :-</span> ' + s.printNote.replace('ملاحظة :-', '').trim() + '</div>' : ''}
          </div>
        </div>
        <div class="print-reward-box">
          <div class="print-duties-title red-text" style="text-decoration:none">الثواب الذي يحصل عليه المشترك (خلال شهر رجب وشعبان):</div>
          <div style="font-size: 13px; font-weight: 600; line-height: 1.6; padding-right: 10px;">${rewardsHtml}</div>
        </div>
        <div class="print-stats-box" style="display:flex; align-items:center; justify-content:center; text-align:center; min-height: 40px;">
          <div style="font-size: 14px; font-weight: 800; color: #8b0000;">
            ${s.printFooter ? s.printFooter.replace(/\n/g, '<br>') : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function triggerPrint(htmlContent, title = 'طباعة') {
  var printModalTitle = document.getElementById('printModalTitle');
  var printContent = document.getElementById('printContent');
  if (printModalTitle) printModalTitle.textContent = title;
  if (printContent) printContent.innerHTML = htmlContent;
  
  Modal.open('printModal');
}

function doPrintNow() {
  window.print();
}

function printSingleFormA4(formId) {
  var form = getFormById(formId);
  if (!form) return;

  var cycle = CycleService.getActive();
  var participantName = '.....................';
  if (cycle) {
    var dist = DistributionService.getFormStatus(formId, cycle.id);
    if (dist && dist.status === 'distributed' && dist.participantId) {
      var p = ParticipantService.getById(dist.participantId);
      if (p) participantName = p.name;
    }
  }

  var contentHtml = generateFormPrintHtml(form, participantName);
  triggerPrint(contentHtml, 'طباعة استمارة رقم ' + formId);
}

function printParticipantReceipt(participantId, cycleId) {
  var participant = ParticipantService.getById(participantId);
  var cycle = cycleId ? CycleService.getById(cycleId) : CycleService.getActive();
  if (!participant) {
    Toast.error('المشترك غير موجود');
    return;
  }
  if (!cycle) {
    Toast.error('الرجاء اختيار دورة نشطة أولاً');
    return;
  }

  var forms = ParticipantService.getForms(participantId, cycle.id);
  if (forms.length === 0) {
    Toast.warning('لا توجد استمارات موزعة لهذا المشترك في هذه الدورة');
    return;
  }

  var pagesHtml = forms.map(d => {
    var form = getFormById(d.formId);
    return form ? generateFormPrintHtml(form, participant.name) : '';
  }).join('');

  triggerPrint(pagesHtml, 'إيصال المشترك: ' + participant.name + ' (' + forms.length + ' استمارة)');
}

function printRepresentativeReceipt(repId, cycleId) {
  var rep = RepresentativeService.getById(repId);
  var cycle = cycleId ? CycleService.getById(cycleId) : CycleService.getActive();
  if (!rep) return Toast.error('المندوب غير موجود');
  if (!cycle) return Toast.error('الرجاء اختيار دورة نشطة أولاً');

  var reserved = RepresentativeService.getReservedForms(repId, cycle.id);
  var distributed = RepresentativeService.getDistributedForms(repId, cycle.id);
  
  if (reserved.length === 0 && distributed.length === 0) {
    return Toast.warning('لا توجد استمارات لهذا المندوب في هذه الدورة');
  }

  var s = SettingsService.getSettings();
  
  var allForms = [...reserved, ...distributed].sort((a,b) => parseInt(a.formId) - parseInt(b.formId));
  var totalAmount = allForms.reduce((sum, d) => sum + (parseFloat(d.paidAmount) || 0), 0);
  
  var formsListHtml = allForms.map(d => {
    return `<div style="padding:4px; border:1px solid #ddd; text-align:center; border-radius:4px; background: ${d.status === 'distributed' ? '#f0fdf4' : '#fff'}">
      استمارة <strong>${d.formId}</strong><br>
      <small style="color:#666">${d.status === 'distributed' ? 'موزعة' : 'محجوزة'}</small>
    </div>`;
  }).join('');

  var html = `
    <div class="a4-page" style="padding: 15mm;">
      <div style="border: 2px solid #8b0000; padding: 20px; border-radius: 8px; min-height: 250mm;">
        <div style="text-align:center; border-bottom: 2px solid #8b0000; padding-bottom:15px; margin-bottom: 20px;">
          ${s.orgLogo ? `<img src="${s.orgLogo}" style="max-height:80px; margin-bottom:10px;">` : ''}
          <h2 style="color:#8b0000; margin:0;">إيصال استلام عهدة مندوب</h2>
          <h4 style="margin:5px 0 0 0; color:#555;">دورة: ${cycle.name}</h4>
        </div>
        
        <table style="width:100%; font-size:16px; margin-bottom:20px;">
          <tr>
            <td style="padding:8px;"><strong>اسم المندوب:</strong> ${rep.name}</td>
            <td style="padding:8px;"><strong>المنطقة:</strong> ${rep.area || '-'}</td>
          </tr>
          <tr>
            <td style="padding:8px;"><strong>رقم الهاتف:</strong> ${rep.phone || '-'}</td>
            <td style="padding:8px;"><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-EG')}</td>
          </tr>
        </table>
        
        <div style="background:#fdf2f2; padding:15px; border-radius:6px; margin-bottom:20px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
          <div><strong>إجمالي الاستمارات المستلمة:</strong> <span style="font-size:20px; color:#8b0000;">${allForms.length}</span></div>
          <div><strong>إجمالي المبالغ المتوقعة:</strong> <span style="font-size:20px; color:green;">${totalAmount.toLocaleString()} د.ع</span></div>
        </div>

        <h4 style="color:#8b0000; margin-bottom: 10px;">أرقام الاستمارات التي بذمة المندوب:</h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap:10px; font-size:13px; max-height: 600px; overflow: hidden;">
          ${formsListHtml}
        </div>
        
        <div style="margin-top: 50px; display:flex; justify-content:space-between; text-align:center;">
          <div style="width: 45%;">
            <strong>توقيع المستلم (المندوب)</strong><br><br><br>
            ....................................
          </div>
          <div style="width: 45%;">
            <strong>توقيع إدارة المؤسسة</strong><br><br><br>
            ....................................
          </div>
        </div>
      </div>
    </div>
  `;

  triggerPrint(html, 'إيصال المندوب: ' + rep.name);
}

function populateParticipantSelects(searchQuery = '') {
  var participants = ParticipantService.getAll();
  var q = (searchQuery || '').toLowerCase().trim();
  var filtered = q ? participants.filter(p => p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q))) : participants;

  var select = document.getElementById('distParticipantSelect');
  if (select) {
    var curVal = select.value;
    select.innerHTML = '<option value="">-- اختر المشترك (' + filtered.length + ') --</option>';
    filtered.forEach(p => {
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name + (p.phone ? ' (' + p.phone + ')' : '');
      select.appendChild(opt);
    });
    if (curVal && filtered.some(p => p.id === curVal)) select.value = curVal;
  }

  var editSelect = document.getElementById('editParticipantSelect');
  if (editSelect) {
    var curVal = editSelect.value;
    editSelect.innerHTML = '<option value="">-- اختر المشترك (' + filtered.length + ') --</option>';
    filtered.forEach(p => {
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name + (p.phone ? ' (' + p.phone + ')' : '');
      editSelect.appendChild(opt);
    });
    if (curVal && filtered.some(p => p.id === curVal)) editSelect.value = curVal;
  }
}

function populateRepSelects(searchQuery = '') {
  var reps = RepresentativeService.getAll();
  var q = (searchQuery || '').toLowerCase().trim();
  var filtered = q ? reps.filter(r => r.name.toLowerCase().includes(q) || (r.area && r.area.toLowerCase().includes(q))) : reps;

  var repSelect = document.getElementById('distRepSelect');
  if (repSelect) {
    var curVal = repSelect.value;
    repSelect.innerHTML = '<option value="">-- اختر المندوب (' + filtered.length + ') --</option>';
    filtered.forEach(r => {
      var opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name + (r.area ? ' [' + r.area + ']' : '');
      repSelect.appendChild(opt);
    });
    if (curVal && filtered.some(r => r.id === curVal)) repSelect.value = curVal;
  }

  var partRepSelect = document.getElementById('participantRep');
  if (partRepSelect) {
    var curVal = partRepSelect.value;
    partRepSelect.innerHTML = '<option value="">-- مشترك مستقل --</option>';
    reps.forEach(r => {
      var opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name + (r.area ? ' [' + r.area + ']' : '');
      partRepSelect.appendChild(opt);
    });
    if (curVal) partRepSelect.value = curVal;
  }
}

function populateCycleSelects() {
  var cycles = CycleService.getAll();
  var active = CycleService.getActive();
  var sel = document.getElementById('activeCycleSelect');
  if (sel) {
    sel.innerHTML = '<option value="">-- اختر دورة --</option>';
    cycles.forEach(c => {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (active && c.id === active.id) opt.selected = true;
      sel.appendChild(opt);
    });
  }
}

function copyCycleReport() {
  var cycle = CycleService.getActive();
  if (!cycle) { Toast.error('الرجاء اختيار دورة نشطة'); return; }
  
  var stats = CycleService.getStats(cycle.id);
  var dists = DistributionService.getAll(cycle.id).filter(d => d.status === 'distributed');
  var participants = ParticipantService.getAll();
  
  var pMap = {};
  participants.forEach(p => pMap[p.id] = p.name);
  
  var text = '📊 ملخص دورة: ' + cycle.name + '\n';
  text += '✅ إجمالي الاستمارات: ' + stats.total + '\n';
  text += '✅ الموزعة للمشتركين: ' + stats.distributed + '\n';
  text += '💰 إجمالي المبالغ: ' + Number(stats.totalAmount || 0).toLocaleString() + ' د.ع\n\n';
  
  if (dists.length === 0) {
    text += 'لم يتم توزيع أي استمارة للمشتركين حتى الآن.';
  } else {
    text += '📋 تفاصيل التوزيع:\n';
    dists.sort((a, b) => parseInt(a.formId) - parseInt(b.formId));
    
    dists.forEach(d => {
      var name = pMap[d.participantId] || 'غير معروف';
      var amt = d.paidAmount ? ' - ' + Number(d.paidAmount).toLocaleString() + ' د.ع' : '';
      text += 'الاستمارة (' + d.formId + ') - ' + name + amt + '\n';
    });
  }
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      Toast.success('تم نسخ التقرير بنجاح!');
    }).catch(() => fallbackCopyTextToClipboard(text));
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    Toast.success('تم نسخ التقرير بنجاح!');
  } catch (err) {
    Toast.error('حدث خطأ أثناء النسخ');
  }
  document.body.removeChild(textArea);
}

function exportCycleReportExcel() {
  var cycle = CycleService.getActive();
  if (!cycle) { Toast.error('الرجاء اختيار دورة نشطة'); return; }
  
  var stats = CycleService.getStats(cycle.id);
  var dists = DistributionService.getAll(cycle.id).filter(d => d.status === 'distributed');
  var participants = ParticipantService.getAll();
  
  var pMap = {};
  participants.forEach(p => pMap[p.id] = p.name);
  
  var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="utf-8"></head><body dir="rtl" style="font-family: Arial, sans-serif;">';
  
  html += '<h2 style="color: #8b0000; text-align: center;">تقرير التوزيع - دورة: ' + cycle.name + '</h2>';
  html += '<table style="margin-bottom: 20px; font-size: 16px;">';
  html += '<tr><td><strong>إجمالي الاستمارات:</strong></td><td>' + stats.total + '</td></tr>';
  html += '<tr><td><strong>الموزعة للمشتركين:</strong></td><td>' + stats.distributed + '</td></tr>';
  html += '<tr><td><strong>إجمالي المبالغ المحصلة:</strong></td><td style="color: green;">' + stats.totalAmount.toLocaleString() + ' د.ع</td></tr>';
  html += '</table>';
  
  if (dists.length > 0) {
    html += '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;">';
    html += '<tr style="background-color: #fdf2f2; color: #8b0000;">';
    html += '<th>رقم الاستمارة</th><th>اسم المشترك المستلم</th><th>المبلغ المدفوع (د.ع)</th><th>المندوب (إن وجد)</th><th>تاريخ الاستلام</th>';
    html += '</tr>';
    
    dists.sort((a, b) => parseInt(a.formId) - parseInt(b.formId));
    
    dists.forEach(d => {
      var pName = pMap[d.participantId] || 'غير معروف';
      var rName = d.representativeId ? (RepresentativeService.getById(d.representativeId)?.name || '') : '';
      var amt = d.paidAmount || 0;
      var date = new Date(d.distributedAt || d.createdAt).toLocaleDateString('ar-EG');
      
      html += '<tr>';
      html += '<td>' + d.formId + '</td>';
      html += '<td>' + pName + '</td>';
      html += '<td>' + amt + '</td>';
      html += '<td>' + rName + '</td>';
      html += '<td>' + date + '</td>';
      html += '</tr>';
    });
    html += '</table>';
  } else {
    html += '<p>لم يتم توزيع أي استمارة حتى الآن.</p>';
  }
  
  html += '</body></html>';
  
  var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'تقرير_التوزيع_' + cycle.name.replace(/ /g, '_') + '.xls';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  Toast.success('تم تصدير ملف الإكسل بنجاح!');
}

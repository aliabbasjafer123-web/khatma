// ======================================================
// data.js - إدارة البيانات (LocalStorage)
// نظام إدارة الختمات القرآنية
// ======================================================

const DB_KEY = 'khatma_db';

const DEFAULT_DB = {
  cycles: [],
  participants: [],
  representatives: [],
  distributions: [],
  activity: [],
  settings: { 
    activeCycleId: null,
    printTitle: 'برنامج لا تهجروا القرآن والصدقة',
    printSubtitle: 'ختمات شهر رجب وشعبان',
    printHadith: 'قال رسول الله (ص): (إن القلوب تصدأ كما يصدأ الحديد قيل يا رسول الله وما جلاؤها قال قراءة القرآن وذكر الموت)',
    printDuties: 'قراءة الورقة القرآنية ستون مرة خلال الشهرين.\nقراءة زيارة عاشوراء ثمان مرات خلال الشهرين.\nقراءة دعاء الفرج (120) مرة خلال الشهرين.\nالصلاة على محمد وآل محمد (400) مرة خلال الشهرين.\nقراءة دعاء الندبة مرتين خلال الشهرين.\nدفع (2,000) ر.ع بنية الصدقة المطلقة (هذا المبلغ يساعد في أعمال المؤسسة للأيتام والمتعففين).',
    printNiya: 'نية القراءة :- اصالة عن نفسي ونيابة عن امواتي وعن المشتركين وامواتهم ومشتركي مؤسسة شباب الحسين (ع) الاحياء والاموات ونخص بالذكر الامام الحجة (عج) وشهدائنا الابرار.',
    printNote: 'ملاحظة :- على المشترك ان يتعهد امام الله ورسوله بالالتزام بالقراءة وإلا ان لم يستطع فليكلف من ينوب مقامه بالقراءة.',
    printRewards: 'أكثر من (120) ختمة قرآنية.\nأكثر من (600,0) زيارة عاشوراء.\nأكثر من (144,000) دعاء الفرج.\nأكثر من (480,000) صلاة على محمد وآل محمد.\nأكثر من (2,400) دعاء الندبة.\nثواب الصدقة الشهرية.',
    printFooter: 'يمكن الحصول على نفس هذا الثواب للميت والمتوفى من خلال دفع مبلغ (4,000 ر.ع) شهرياً أي (48,000 ر.ع) سنوياً.\nمبيعات عام 2024 التي تم انجازها بفضل الله وبفضل اشتراكاتكم'
  }
};

// ---- قاعدة البيانات ----
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DB));
    const db = JSON.parse(raw);
    // ضمان الحقول الأساسية
    return {
      cycles: db.cycles || [],
      participants: db.participants || [],
      representatives: db.representatives || [],
      distributions: db.distributions || [],
      activity: db.activity || [],
      settings: db.settings || { activeCycleId: null }
    };
  } catch (e) {
    console.error('Error loading DB:', e);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    console.error('Error saving DB:', e);
    return false;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---- الدورات ----
const CycleService = {
  getAll() { return loadDB().cycles; },

  getById(id) { return loadDB().cycles.find(c => c.id === id); },

  getActive() {
    const db = loadDB();
    return db.cycles.find(c => c.id === db.settings.activeCycleId) || null;
  },

  create(data) {
    const db = loadDB();
    const cycle = {
      id: generateId(),
      name: data.name,
      cycleNumber: data.cycleNumber,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.cycles.push(cycle);
    // تعيين كدورة نشطة إذا لم تكن هناك واحدة
    if (!db.settings.activeCycleId) db.settings.activeCycleId = cycle.id;
    saveDB(db);
    ActivityService.log('cycle_created', `تم إنشاء الدورة: ${cycle.name}`);
    return cycle;
  },

  update(id, data) {
    const db = loadDB();
    const idx = db.cycles.findIndex(c => c.id === id);
    if (idx === -1) return null;
    db.cycles[idx] = { ...db.cycles[idx], ...data, id };
    saveDB(db);
    return db.cycles[idx];
  },

  delete(id) {
    const db = loadDB();
    db.cycles = db.cycles.filter(c => c.id !== id);
    db.distributions = db.distributions.filter(d => d.cycleId !== id);
    if (db.settings.activeCycleId === id) db.settings.activeCycleId = null;
    saveDB(db);
    ActivityService.log('cycle_deleted', `تم حذف دورة`);
  },

  setActive(id) {
    const db = loadDB();
    db.settings.activeCycleId = id;
    saveDB(db);
  },

  getStats(cycleId) {
    const db = loadDB();
    const dists = db.distributions.filter(d => d.cycleId === cycleId && d.status !== 'cancelled');
    const distributed = dists.filter(d => d.status === 'distributed').length;
    const reserved = dists.filter(d => d.status === 'reserved').length;
    const total = TOTAL_FORMS;
    return { total, distributed, reserved, available: total - distributed - reserved };
  }
};

// ---- المشتركون ----
const ParticipantService = {
  getAll() { return loadDB().participants; },

  getById(id) { return loadDB().participants.find(p => p.id === id); },

  create(data) {
    const db = loadDB();
    const p = {
      id: generateId(),
      name: data.name.trim(),
      phone: data.phone || '',
      representativeId: data.representativeId || null,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    db.participants.push(p);
    saveDB(db);
    ActivityService.log('participant_added', `تم إضافة المشترك: ${p.name}`);
    return p;
  },

  update(id, data) {
    const db = loadDB();
    const idx = db.participants.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.participants[idx] = { ...db.participants[idx], ...data, id };
    saveDB(db);
    ActivityService.log('participant_updated', `تم تعديل بيانات: ${db.participants[idx].name}`);
    return db.participants[idx];
  },

  delete(id) {
    const db = loadDB();
    const p = db.participants.find(x => x.id === id);
    db.participants = db.participants.filter(x => x.id !== id);
    // إلغاء توزيعاته
    db.distributions.forEach(d => {
      if (d.participantId === id) d.status = 'cancelled';
    });
    saveDB(db);
    if (p) ActivityService.log('participant_deleted', `تم حذف المشترك: ${p.name}`);
  },

  getForms(participantId, cycleId) {
    const db = loadDB();
    return db.distributions.filter(d =>
      d.participantId === participantId &&
      d.cycleId === cycleId &&
      d.status === 'distributed'
    );
  }
};

// ---- المندوبون ----
const RepresentativeService = {
  getAll() { return loadDB().representatives; },

  getById(id) { return loadDB().representatives.find(r => r.id === id); },

  create(data) {
    const db = loadDB();
    const r = {
      id: generateId(),
      name: data.name.trim(),
      phone: data.phone || '',
      area: data.area || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    db.representatives.push(r);
    saveDB(db);
    ActivityService.log('rep_added', `تم إضافة المندوب: ${r.name}`);
    return r;
  },

  update(id, data) {
    const db = loadDB();
    const idx = db.representatives.findIndex(r => r.id === id);
    if (idx === -1) return null;
    db.representatives[idx] = { ...db.representatives[idx], ...data, id };
    saveDB(db);
    ActivityService.log('rep_updated', `تم تعديل بيانات المندوب: ${db.representatives[idx].name}`);
    return db.representatives[idx];
  },

  delete(id) {
    const db = loadDB();
    const r = db.representatives.find(x => x.id === id);
    db.representatives = db.representatives.filter(x => x.id !== id);
    // الغاء حجوزاته
    db.distributions.forEach(d => {
      if (d.representativeId === id && d.status === 'reserved') d.status = 'cancelled';
    });
    saveDB(db);
    if (r) ActivityService.log('rep_deleted', `تم حذف المندوب: ${r.name}`);
  },

  getReservedForms(repId, cycleId) {
    const db = loadDB();
    return db.distributions.filter(d =>
      d.representativeId === repId &&
      d.cycleId === cycleId &&
      d.status === 'reserved'
    );
  },

  getDistributedForms(repId, cycleId) {
    const db = loadDB();
    return db.distributions.filter(d =>
      d.representativeId === repId &&
      d.cycleId === cycleId &&
      d.status === 'distributed'
    );
  }
};

// ---- التوزيعات ----
const DistributionService = {
  getAll(cycleId) {
    const db = loadDB();
    return cycleId ? db.distributions.filter(d => d.cycleId === cycleId) : db.distributions;
  },

  getFormStatus(formId, cycleId) {
    const db = loadDB();
    const dist = db.distributions.find(d =>
      d.formId === formId && d.cycleId === cycleId && d.status !== 'cancelled'
    );
    if (!dist) return { status: 'available' };
    return dist;
  },

  getAvailableForms(cycleId) {
    const db = loadDB();
    const usedFormIds = new Set(
      db.distributions
        .filter(d => d.cycleId === cycleId && d.status !== 'cancelled')
        .map(d => d.formId)
    );
    return FORMS_DATA.filter(f => !usedFormIds.has(f.id));
  },

  // توزيع لمشترك مباشرة
  distributeToParticipant(cycleId, participantId, formIds, notes = '', amount = 0) {
    const db = loadDB();
    const participant = db.participants.find(p => p.id === participantId);
    if (!participant) return { success: false, msg: 'المشترك غير موجود' };

    // تحقق أن الاستمارات متاحة
    const usedFormIds = new Set(
      db.distributions
        .filter(d => d.cycleId === cycleId && d.status !== 'cancelled')
        .map(d => d.formId)
    );

    const unavailable = formIds.filter(id => usedFormIds.has(id));
    if (unavailable.length > 0) {
      return { success: false, msg: `الاستمارات التالية غير متاحة: ${unavailable.join(', ')}` };
    }

    const now = new Date().toISOString();
    const amt = parseFloat(amount) || 0;
    // تقسيم المبلغ على عدد الاستمارات إذا لزم الأمر، أو تخزين المبلغ في الاستمارة الأولى فقط؟ 
    // من الأفضل توزيع المبلغ كمتوسط أو إضافته لكل استمارة حسب رغبة العميل، لكن الأسهل هو تخزينه مقسماً 
    const perFormAmount = amt > 0 ? (amt / formIds.length) : 0;
    
    formIds.forEach(formId => {
      db.distributions.push({
        id: generateId(),
        cycleId,
        formId,
        type: 'participant',
        participantId,
        representativeId: participant.representativeId || null,
        status: 'distributed',
        paidAmount: perFormAmount,
        notes,
        createdAt: now,
        distributedAt: now
      });
    });

    saveDB(db);
    ActivityService.log('distributed', `تم توزيع ${formIds.length} استمارة للمشترك ${participant.name}`);
    return { success: true, count: formIds.length };
  },

  // حجز لمندوب
  reserveForRepresentative(cycleId, repId, formIds, notes = '', amount = 0) {
    const db = loadDB();
    const rep = db.representatives.find(r => r.id === repId);
    if (!rep) return { success: false, msg: 'المندوب غير موجود' };

    const usedFormIds = new Set(
      db.distributions
        .filter(d => d.cycleId === cycleId && d.status !== 'cancelled')
        .map(d => d.formId)
    );

    const unavailable = formIds.filter(id => usedFormIds.has(id));
    if (unavailable.length > 0) {
      return { success: false, msg: `الاستمارات التالية غير متاحة: ${unavailable.join(', ')}` };
    }

    const now = new Date().toISOString();
    const amt = parseFloat(amount) || 0;
    const perFormAmount = amt > 0 ? (amt / formIds.length) : 0;

    formIds.forEach(formId => {
      db.distributions.push({
        id: generateId(),
        cycleId,
        formId,
        type: 'representative',
        participantId: null,
        representativeId: repId,
        status: 'reserved',
        paidAmount: perFormAmount,
        notes,
        createdAt: now,
        distributedAt: null
      });
    });

    saveDB(db);
    ActivityService.log('reserved', `تم حجز ${formIds.length} استمارة للمندوب ${rep.name}`);
    return { success: true, count: formIds.length };
  },

  // نقل من مندوب لمشترك
  assignFromRepToParticipant(distributionId, participantId) {
    const db = loadDB();
    const dist = db.distributions.find(d => d.id === distributionId);
    if (!dist) return { success: false, msg: 'التوزيع غير موجود' };
    if (dist.status !== 'reserved') return { success: false, msg: 'الاستمارة ليست محجوزة' };

    const participant = db.participants.find(p => p.id === participantId);
    if (!participant) return { success: false, msg: 'المشترك غير موجود' };

    dist.participantId = participantId;
    dist.status = 'distributed';
    dist.type = 'participant';
    dist.distributedAt = new Date().toISOString();

    saveDB(db);
    ActivityService.log('transferred', `نقل استمارة ${dist.formId} للمشترك ${participant.name}`);
    return { success: true };
  },

  updateDistribution(distId, updates) {
    const db = loadDB();
    const idx = db.distributions.findIndex(d => d.id === distId);
    if (idx !== -1) {
      db.distributions[idx] = { ...db.distributions[idx], ...updates };
      saveDB(db);
      ActivityService.log('dist_updated', `تم تحديث بيانات توزيع استمارة ${db.distributions[idx].formId}`);
      return { success: true, dist: db.distributions[idx] };
    }
    return { success: false, msg: 'لم يتم العثور على التوزيع' };
  },

  // إلغاء توزيع/حجز
  cancel(distributionId) {
    const db = loadDB();
    const dist = db.distributions.find(d => d.id === distributionId);
    if (!dist) return { success: false };
    dist.status = 'cancelled';
    dist.cancelledAt = new Date().toISOString();
    saveDB(db);
    ActivityService.log('cancelled', `تم إلغاء توزيع استمارة ${dist.formId}`);
    return { success: true };
  },

  // إلغاء جميع توزيعات مشترك في دورة
  cancelParticipantForms(participantId, cycleId) {
    const db = loadDB();
    let count = 0;
    db.distributions.forEach(d => {
      if (d.participantId === participantId && d.cycleId === cycleId && d.status !== 'cancelled') {
        d.status = 'cancelled';
        d.cancelledAt = new Date().toISOString();
        count++;
      }
    });
    saveDB(db);
    return count;
  }
};

// ---- سجل النشاط ----
const ActivityService = {
  log(type, message) {
    const db = loadDB();
    db.activity.unshift({
      id: generateId(),
      type,
      message,
      createdAt: new Date().toISOString()
    });
    // احتفظ بآخر 100 نشاط فقط
    if (db.activity.length > 100) db.activity = db.activity.slice(0, 100);
    saveDB(db);
  },

  getRecent(limit = 15) {
    return loadDB().activity.slice(0, limit);
  }
};

// ---- التصدير/الاستيراد ----
const BackupService = {
  export() {
    const db = loadDB();
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
    a.href = url;
    a.download = `ختمات_نسخة_احتياطية_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const db = JSON.parse(e.target.result);
          saveDB(db);
          resolve(true);
        } catch (err) {
          reject(new Error('ملف غير صالح'));
        }
      };
      reader.readAsText(file);
    });
  },

  clearAll() {
    localStorage.removeItem(DB_KEY);
  }
};

// ---- الإعدادات العامة ونصوص الطباعة ----
const SettingsService = {
  getSettings() {
    const defaultSettings = {
      printTitle: 'برنامج لا تهجروا القرآن والصدقة',
      printSubtitle: 'ختمات شهر رجب وشعبان',
      printHadith: 'قال رسول الله (ص): (إن القلوب تصدأ كما يصدأ الحديد قيل يا رسول الله وما جلاؤها قال قراءة القرآن وذكر الموت)',
      printDutiesTitle: 'واجبات المشترك (خلال شهر رجب وشعبان):',
      printDuties: [
        'قراءة الورقة القرآنية ستون مرة خلال الشهرين.',
        'قراءة زيارة عاشوراء ثمان مرات خلال الشهرين.',
        'قراءة دعاء الفرج (120) مرة خلال الشهرين.',
        'الصلاة على محمد وآل محمد (400) مرة خلال الشهرين.',
        'قراءة دعاء الندبة مرتين خلال الشهرين.',
        'دفع (2,000) ر.ع بنية الصدقة المطلقة (هذا المبلغ يساعد في أعمال المؤسسة للأيتام والمتعففين).'
      ],
      printNiya: 'اصالة عن نفسي ونيابة عن امواتي وعن المشتركين وامواتهم ومشتركي مؤسسة شباب الحسين (ع) الاحياء والاموات ونخص بالذكر الامام الحجة (عج) وشهدائنا الابرار.',
      printNote: 'على المشترك ان يتعهد امام الله ورسوله بالالتزام بالقراءة وإلا ان لم يستطع فليكلف من ينوب مقامه بالقراءة.',
      printRewardTitle: 'الثواب الذي يحصل عليه المشترك (خلال شهر رجب وشعبان):',
      printRewards: [
        'أكثر من (120) ختمة قرآنية.',
        'أكثر من (600,0) زيارة عاشوراء.',
        'أكثر من (144,000) دعاء الفرج.',
        'أكثر من (480,000) صلاة على محمد وآل محمد.',
        'أكثر من (2,400) دعاء الندبة.',
        'ثواب الصدقة الشهرية.',
        'يمكن الحصول على نفس هذا الثواب للميت والمتوفى من خلال دفع مبلغ (4,000 ر.ع) شهرياً أي (48,000 ر.ع) سنوياً.'
      ],
      printStatsTitle: 'مبيعات عام 2024 التي تم انجازها بفضل الله وبفضل اشتراكاتكم',
      printStatsTotalSpent: '(127,500,92) ر.ع',
      printStatsTotalBeneficiaries: '(1,234) مستفيد',
      printStatsDetails: [
        'صرف كفالة: (24,340,000 ر.ع) | عدد المستفيدين: (343)',
        'صرف تعذية: (43,000,000 ر.ع) | عدد المستفيدين: (455)',
        'صرف لحوم: (12,500,000 ر.ع) | عدد المستفيدين: (120)',
        'صرف ايتام: (34,000,000 ر.ع) | عدد المستفيدين: (150)',
        'صرف زواج: (5,000,000 ر.ع) | عدد المستفيدين: (10)',
        'صرف اعمار: (8,660,000 ر.ع) | عدد المستفيدين: (20)'
      ]
    };
    const saved = localStorage.getItem('khatma_settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
    return defaultSettings;
  },
  
  saveSettings(newSettings) {
    localStorage.setItem('khatma_settings', JSON.stringify(newSettings));
    ActivityService.log('settings_updated', 'تم تحديث إعدادات النظام للطباعة');
  }
};

// ---- ????????? ----
const SettingsService = {
  getSettings() { return loadDB().settings; },
  updatePrintSettings(data) {
    const db = loadDB();
    db.settings = { ...db.settings, ...data };
    saveDB(db);
    ActivityService.log('settings_updated', '?? ????? ??????? ???????');
  }
};

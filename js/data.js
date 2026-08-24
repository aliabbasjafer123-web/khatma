// ======================================================
// data.js - إدارة البيانات وقاعدة البيانات المحلية (LocalStorage)
// نظام إدارة الختمات القرآنية المتكامل
// ======================================================

var DB_KEY = 'khatma_db';
var INITIAL_CYCLE_ID = 'cycle_rajab_shaban_1447';

var DEFAULT_DB = {
  cycles: [
    {
      id: INITIAL_CYCLE_ID,
      name: 'ختمات شهر رجب وشعبان 1447هـ',
      cycleNumber: '1',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      notes: 'الدورة الافتراضية للختمات القرآنية',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  participants: [
    { id: 'p_demo_1', name: 'علي عباس جعفر', phone: '07700000000', representativeId: null, notes: '', createdAt: new Date().toISOString() }
  ],
  representatives: [
    { id: 'r_demo_1', name: 'مندوب المنطقة المركزية', phone: '07800000000', area: 'المنطقة المركزية', notes: '', createdAt: new Date().toISOString() }
  ],
  distributions: [],
  activity: [
    { id: 'act_init', type: 'cycle_created', text: 'تم بدء نظام إدارة الختمات القرآنية بنجاح', timestamp: new Date().toISOString() }
  ],
  settings: {
    activeCycleId: INITIAL_CYCLE_ID,
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

function loadDB() {
  try {
    var raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      var initial = JSON.parse(JSON.stringify(DEFAULT_DB));
      saveDB(initial);
      return initial;
    }
    var db = JSON.parse(raw);
    
    if (!db.cycles || db.cycles.length === 0) {
      db.cycles = JSON.parse(JSON.stringify(DEFAULT_DB.cycles));
      db.settings = { ...DEFAULT_DB.settings, ...(db.settings || {}), activeCycleId: INITIAL_CYCLE_ID };
      saveDB(db);
    }
    
    return {
      cycles: db.cycles || [],
      participants: db.participants || [],
      representatives: db.representatives || [],
      distributions: db.distributions || [],
      activity: db.activity || [],
      settings: { ...DEFAULT_DB.settings, ...(db.settings || {}) }
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

// ---- خدمة الدورات ----
var CycleService = {
  getAll() { return loadDB().cycles; },
  getById(id) { return loadDB().cycles.find(c => c.id === id); },
  getActive() {
    var db = loadDB();
    if (db.cycles.length === 0) return null;
    var active = db.cycles.find(c => c.id === db.settings.activeCycleId);
    if (!active) {
      active = db.cycles[0];
      db.settings.activeCycleId = active.id;
      saveDB(db);
    }
    return active;
  },
  create(data) {
    var db = loadDB();
    var cycle = {
      id: generateId(),
      name: (data.name || '').trim(),
      cycleNumber: data.cycleNumber || '1',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      notes: data.notes || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.cycles.push(cycle);
    db.settings.activeCycleId = cycle.id;
    saveDB(db);
    ActivityService.log('cycle_created', 'تم إنشاء وتفعيل الدورة: ' + cycle.name);
    return cycle;
  },
  update(id, data) {
    var db = loadDB();
    var idx = db.cycles.findIndex(c => c.id === id);
    if (idx === -1) return null;
    db.cycles[idx] = { ...db.cycles[idx], ...data, id };
    saveDB(db);
    return db.cycles[idx];
  },
  delete(id) {
    var db = loadDB();
    db.cycles = db.cycles.filter(c => c.id !== id);
    db.distributions = db.distributions.filter(d => d.cycleId !== id);
    if (db.settings.activeCycleId === id) {
      db.settings.activeCycleId = db.cycles.length > 0 ? db.cycles[0].id : null;
    }
    saveDB(db);
    ActivityService.log('cycle_deleted', 'تم حذف الدورة');
  },
  setActive(id) {
    var db = loadDB();
    db.settings.activeCycleId = id;
    saveDB(db);
  },
  getStats(cycleId) {
    var db = loadDB();
    var dists = db.distributions.filter(d => d.cycleId === cycleId && d.status !== 'cancelled');
    var distributed = dists.filter(d => d.status === 'distributed').length;
    var reserved = dists.filter(d => d.status === 'reserved').length;
    var totalAmount = dists.reduce((sum, d) => sum + (parseFloat(d.paidAmount) || 0), 0);
    var total = TOTAL_FORMS;
    return {
      total,
      distributed,
      reserved,
      available: Math.max(0, total - distributed - reserved),
      totalAmount
    };
  }
};

// ---- خدمة المشتركين ----
var ParticipantService = {
  getAll() { return loadDB().participants; },
  getById(id) { return loadDB().participants.find(p => p.id === id); },
  create(data) {
    var db = loadDB();
    var p = {
      id: generateId(),
      name: (data.name || '').trim(),
      phone: data.phone || '',
      representativeId: data.representativeId || null,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    db.participants.push(p);
    saveDB(db);
    ActivityService.log('participant_added', 'تمت إضافة المشترك: ' + p.name);
    return p;
  },
  update(id, data) {
    var db = loadDB();
    var idx = db.participants.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.participants[idx] = { ...db.participants[idx], ...data, id };
    saveDB(db);
    return db.participants[idx];
  },
  delete(id) {
    var db = loadDB();
    var p = db.participants.find(x => x.id === id);
    db.participants = db.participants.filter(x => x.id !== id);
    db.distributions.forEach(d => {
      if (d.participantId === id && d.status === 'distributed') {
        d.status = 'cancelled';
      }
    });
    saveDB(db);
    ActivityService.log('participant_deleted', 'تم حذف المشترك: ' + (p ? p.name : ''));
  },
  getForms(participantId, cycleId) {
    var db = loadDB();
    return db.distributions.filter(d =>
      d.participantId === participantId &&
      d.cycleId === cycleId &&
      d.status === 'distributed'
    );
  }
};

// ---- خدمة المندوبين ----
var RepresentativeService = {
  getAll() { return loadDB().representatives; },
  getById(id) { return loadDB().representatives.find(r => r.id === id); },
  create(data) {
    var db = loadDB();
    var r = {
      id: generateId(),
      name: (data.name || '').trim(),
      phone: data.phone || '',
      area: data.area || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    db.representatives.push(r);
    saveDB(db);
    ActivityService.log('rep_added', 'تمت إضافة المندوب: ' + r.name);
    return r;
  },
  update(id, data) {
    var db = loadDB();
    var idx = db.representatives.findIndex(r => r.id === id);
    if (idx === -1) return null;
    db.representatives[idx] = { ...db.representatives[idx], ...data, id };
    saveDB(db);
    return db.representatives[idx];
  },
  delete(id) {
    var db = loadDB();
    var r = db.representatives.find(x => x.id === id);
    db.representatives = db.representatives.filter(x => x.id !== id);
    db.participants.forEach(p => {
      if (p.representativeId === id) p.representativeId = null;
    });
    db.distributions.forEach(d => {
      if (d.representativeId === id && d.status === 'reserved') {
        d.status = 'cancelled';
      }
    });
    saveDB(db);
    ActivityService.log('rep_deleted', 'تم حذف المندوب: ' + (r ? r.name : ''));
  },
  getReservedForms(repId, cycleId) {
    var db = loadDB();
    return db.distributions.filter(d =>
      d.representativeId === repId &&
      d.cycleId === cycleId &&
      d.status === 'reserved'
    );
  },
  getDistributedForms(repId, cycleId) {
    var db = loadDB();
    return db.distributions.filter(d =>
      d.representativeId === repId &&
      d.cycleId === cycleId &&
      d.status === 'distributed'
    );
  }
};

// ---- خدمة التوزيع ----
var DistributionService = {
  getAll(cycleId) {
    var db = loadDB();
    return db.distributions.filter(d => d.cycleId === cycleId);
  },
  getFormStatus(formId, cycleId) {
    var db = loadDB();
    var dist = db.distributions.find(d =>
      d.formId === formId &&
      d.cycleId === cycleId &&
      d.status !== 'cancelled'
    );
    return dist || { status: 'available' };
  },
  getAvailableForms(cycleId) {
    var db = loadDB();
    var used = new Set(
      db.distributions
        .filter(d => d.cycleId === cycleId && d.status !== 'cancelled')
        .map(d => d.formId)
    );
    return FORMS_DATA.filter(f => !used.has(f.id));
  },
  distributeToParticipant(cycleId, participantId, formIds, notes = '', amount = 0) {
    var db = loadDB();
    var participant = db.participants.find(p => p.id === participantId);
    if (!participant) return { success: false, msg: 'المشترك غير موجود' };

    var used = new Set(
      db.distributions
        .filter(d => d.cycleId === cycleId && d.status !== 'cancelled')
        .map(d => d.formId)
    );
    var unavail = formIds.filter(id => used.has(id));
    if (unavail.length > 0) {
      return { success: false, msg: 'الاستمارات التالية غير متاحة: ' + unavail.join(', ') };
    }

    var totalAmt = parseFloat(amount) || 0;
    var perForm = formIds.length > 0 ? (totalAmt / formIds.length) : 0;
    var now = new Date().toISOString();

    formIds.forEach(formId => {
      db.distributions.push({
        id: generateId(),
        cycleId,
        formId,
        type: 'participant',
        participantId,
        representativeId: participant.representativeId || null,
        status: 'distributed',
        paidAmount: perForm,
        notes,
        createdAt: now,
        distributedAt: now
      });
    });

    saveDB(db);
    ActivityService.log('distributed', 'تم توزيع ' + formIds.length + ' استمارة للمشترك ' + participant.name);
    return { success: true, count: formIds.length };
  },
  reserveForRepresentative(cycleId, repId, formIds, notes = '', amount = 0) {
    var db = loadDB();
    var rep = db.representatives.find(r => r.id === repId);
    if (!rep) return { success: false, msg: 'المندوب غير موجود' };

    var used = new Set(
      db.distributions
        .filter(d => d.cycleId === cycleId && d.status !== 'cancelled')
        .map(d => d.formId)
    );
    var unavail = formIds.filter(id => used.has(id));
    if (unavail.length > 0) {
      return { success: false, msg: 'الاستمارات التالية غير متاحة: ' + unavail.join(', ') };
    }

    var totalAmt = parseFloat(amount) || 0;
    var perForm = formIds.length > 0 ? (totalAmt / formIds.length) : 0;
    var now = new Date().toISOString();

    formIds.forEach(formId => {
      db.distributions.push({
        id: generateId(),
        cycleId,
        formId,
        type: 'representative',
        participantId: null,
        representativeId: repId,
        status: 'reserved',
        paidAmount: perForm,
        notes,
        createdAt: now,
        distributedAt: null
      });
    });

    saveDB(db);
    ActivityService.log('reserved', 'تم حجز ' + formIds.length + ' استمارة للمندوب ' + rep.name);
    return { success: true, count: formIds.length };
  },
  updateDistribution(distId, updates) {
    var db = loadDB();
    var idx = db.distributions.findIndex(d => d.id === distId);
    if (idx !== -1) {
      db.distributions[idx] = { ...db.distributions[idx], ...updates };
      saveDB(db);
      ActivityService.log('dist_updated', 'تم تحديث بيانات الاستمارة ' + db.distributions[idx].formId);
      return { success: true, dist: db.distributions[idx] };
    }
    return { success: false, msg: 'لم يتم العثور على التوزيع' };
  },
  cancel(distId) {
    var db = loadDB();
    var dist = db.distributions.find(d => d.id === distId);
    if (!dist) return { success: false, msg: 'التوزيع غير موجود' };
    dist.status = 'cancelled';
    dist.cancelledAt = new Date().toISOString();
    saveDB(db);
    ActivityService.log('dist_cancelled', 'تم إلغاء توزيع/حجز الاستمارة ' + dist.formId);
    return { success: true };
  }
};

// ---- خدمة النشاطات ----
var ActivityService = {
  getAll(limit = 20) {
    var db = loadDB();
    return (db.activity || []).slice(-limit).reverse();
  },
  log(type, text) {
    var db = loadDB();
    db.activity.push({
      id: generateId(),
      type,
      text,
      timestamp: new Date().toISOString()
    });
    if (db.activity.length > 100) db.activity = db.activity.slice(-100);
    saveDB(db);
  }
};

// ---- خدمة الإعدادات ----
var SettingsService = {
  getSettings() { return loadDB().settings; },
  saveSettings(newSettings) {
    var db = loadDB();
    db.settings = { ...db.settings, ...newSettings };
    saveDB(db);
    ActivityService.log('settings_updated', 'تم تحديث إعدادات نموذج الطباعة');
  }
};

// ---- خدمة النسخ الاحتياطي ----
var BackupService = {
  export() {
    var db = loadDB();
    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    var a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'khatma_backup_' + new Date().toISOString().slice(0, 10) + '.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
    Toast.success('تم تصدير نسخة البيانات الاحتياطية بنجاح');
  },
  import(file, callback) {
    var reader = new FileReader();
    reader.onload = e => {
      try {
        var db = JSON.parse(e.target.result);
        if (db && typeof db === 'object') {
          saveDB(db);
          Toast.success('تم استيراد البيانات بنجاح!');
          if (callback) callback();
        } else {
          Toast.error('ملف بيانات غير صالح');
        }
      } catch (err) {
        Toast.error('خطأ في قراءة ملف النسخة الاحتياطية');
      }
    };
    reader.readAsText(file);
  }
};

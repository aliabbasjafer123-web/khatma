// ======================================================
// data.js - Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª (LocalStorage)
// Ù†Ø¸Ø§Ù… Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø®ØªÙ…Ø§Øª Ø§Ù„Ù‚Ø±Ø¢Ù†ÙŠØ©
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
    printTitle: 'Ø¨Ø±Ù†Ø§Ù…Ø¬ Ù„Ø§ ØªÙ‡Ø¬Ø±ÙˆØ§ Ø§Ù„Ù‚Ø±Ø¢Ù† ÙˆØ§Ù„ØµØ¯Ù‚Ø©',
    printSubtitle: 'Ø®ØªÙ…Ø§Øª Ø´Ù‡Ø± Ø±Ø¬Ø¨ ÙˆØ´Ø¹Ø¨Ø§Ù†',
    printHadith: 'Ù‚Ø§Ù„ Ø±Ø³ÙˆÙ„ Ø§Ù„Ù„Ù‡ (Øµ): (Ø¥Ù† Ø§Ù„Ù‚Ù„ÙˆØ¨ ØªØµØ¯Ø£ ÙƒÙ…Ø§ ÙŠØµØ¯Ø£ Ø§Ù„Ø­Ø¯ÙŠØ¯ Ù‚ÙŠÙ„ ÙŠØ§ Ø±Ø³ÙˆÙ„ Ø§Ù„Ù„Ù‡ ÙˆÙ…Ø§ Ø¬Ù„Ø§Ø¤Ù‡Ø§ Ù‚Ø§Ù„ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù‚Ø±Ø¢Ù† ÙˆØ°ÙƒØ± Ø§Ù„Ù…ÙˆØª)',
    printDuties: 'Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙˆØ±Ù‚Ø© Ø§Ù„Ù‚Ø±Ø¢Ù†ÙŠØ© Ø³ØªÙˆÙ† Ù…Ø±Ø© Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.\nÙ‚Ø±Ø§Ø¡Ø© Ø²ÙŠØ§Ø±Ø© Ø¹Ø§Ø´ÙˆØ±Ø§Ø¡ Ø«Ù…Ø§Ù† Ù…Ø±Ø§Øª Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.\nÙ‚Ø±Ø§Ø¡Ø© Ø¯Ø¹Ø§Ø¡ Ø§Ù„ÙØ±Ø¬ (120) Ù…Ø±Ø© Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.\nØ§Ù„ØµÙ„Ø§Ø© Ø¹Ù„Ù‰ Ù…Ø­Ù…Ø¯ ÙˆØ¢Ù„ Ù…Ø­Ù…Ø¯ (400) Ù…Ø±Ø© Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.\nÙ‚Ø±Ø§Ø¡Ø© Ø¯Ø¹Ø§Ø¡ Ø§Ù„Ù†Ø¯Ø¨Ø© Ù…Ø±ØªÙŠÙ† Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.\nØ¯ÙØ¹ (2,000) Ø±.Ø¹ Ø¨Ù†ÙŠØ© Ø§Ù„ØµØ¯Ù‚Ø© Ø§Ù„Ù…Ø·Ù„Ù‚Ø© (Ù‡Ø°Ø§ Ø§Ù„Ù…Ø¨Ù„Øº ÙŠØ³Ø§Ø¹Ø¯ ÙÙŠ Ø£Ø¹Ù…Ø§Ù„ Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ù„Ù„Ø£ÙŠØªØ§Ù… ÙˆØ§Ù„Ù…ØªØ¹ÙÙÙŠÙ†).',
    printNiya: 'Ù†ÙŠØ© Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© :- Ø§ØµØ§Ù„Ø© Ø¹Ù† Ù†ÙØ³ÙŠ ÙˆÙ†ÙŠØ§Ø¨Ø© Ø¹Ù† Ø§Ù…ÙˆØ§ØªÙŠ ÙˆØ¹Ù† Ø§Ù„Ù…Ø´ØªØ±ÙƒÙŠÙ† ÙˆØ§Ù…ÙˆØ§ØªÙ‡Ù… ÙˆÙ…Ø´ØªØ±ÙƒÙŠ Ù…Ø¤Ø³Ø³Ø© Ø´Ø¨Ø§Ø¨ Ø§Ù„Ø­Ø³ÙŠÙ† (Ø¹) Ø§Ù„Ø§Ø­ÙŠØ§Ø¡ ÙˆØ§Ù„Ø§Ù…ÙˆØ§Øª ÙˆÙ†Ø®Øµ Ø¨Ø§Ù„Ø°ÙƒØ± Ø§Ù„Ø§Ù…Ø§Ù… Ø§Ù„Ø­Ø¬Ø© (Ø¹Ø¬) ÙˆØ´Ù‡Ø¯Ø§Ø¦Ù†Ø§ Ø§Ù„Ø§Ø¨Ø±Ø§Ø±.',
    printNote: 'Ù…Ù„Ø§Ø­Ø¸Ø© :- Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´ØªØ±Ùƒ Ø§Ù† ÙŠØªØ¹Ù‡Ø¯ Ø§Ù…Ø§Ù… Ø§Ù„Ù„Ù‡ ÙˆØ±Ø³ÙˆÙ„Ù‡ Ø¨Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø¨Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© ÙˆØ¥Ù„Ø§ Ø§Ù† Ù„Ù… ÙŠØ³ØªØ·Ø¹ ÙÙ„ÙŠÙƒÙ„Ù Ù…Ù† ÙŠÙ†ÙˆØ¨ Ù…Ù‚Ø§Ù…Ù‡ Ø¨Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©.',
    printRewards: 'Ø£ÙƒØ«Ø± Ù…Ù† (120) Ø®ØªÙ…Ø© Ù‚Ø±Ø¢Ù†ÙŠØ©.\nØ£ÙƒØ«Ø± Ù…Ù† (600,0) Ø²ÙŠØ§Ø±Ø© Ø¹Ø§Ø´ÙˆØ±Ø§Ø¡.\nØ£ÙƒØ«Ø± Ù…Ù† (144,000) Ø¯Ø¹Ø§Ø¡ Ø§Ù„ÙØ±Ø¬.\nØ£ÙƒØ«Ø± Ù…Ù† (480,000) ØµÙ„Ø§Ø© Ø¹Ù„Ù‰ Ù…Ø­Ù…Ø¯ ÙˆØ¢Ù„ Ù…Ø­Ù…Ø¯.\nØ£ÙƒØ«Ø± Ù…Ù† (2,400) Ø¯Ø¹Ø§Ø¡ Ø§Ù„Ù†Ø¯Ø¨Ø©.\nØ«ÙˆØ§Ø¨ Ø§Ù„ØµØ¯Ù‚Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ©.',
    printFooter: 'ÙŠÙ…ÙƒÙ† Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù†ÙØ³ Ù‡Ø°Ø§ Ø§Ù„Ø«ÙˆØ§Ø¨ Ù„Ù„Ù…ÙŠØª ÙˆØ§Ù„Ù…ØªÙˆÙÙ‰ Ù…Ù† Ø®Ù„Ø§Ù„ Ø¯ÙØ¹ Ù…Ø¨Ù„Øº (4,000 Ø±.Ø¹) Ø´Ù‡Ø±ÙŠØ§Ù‹ Ø£ÙŠ (48,000 Ø±.Ø¹) Ø³Ù†ÙˆÙŠØ§Ù‹.\nÙ…Ø¨ÙŠØ¹Ø§Øª Ø¹Ø§Ù… 2024 Ø§Ù„ØªÙŠ ØªÙ… Ø§Ù†Ø¬Ø§Ø²Ù‡Ø§ Ø¨ÙØ¶Ù„ Ø§Ù„Ù„Ù‡ ÙˆØ¨ÙØ¶Ù„ Ø§Ø´ØªØ±Ø§ÙƒØ§ØªÙƒÙ…'
  }
};

// ---- Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ----
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DB));
    const db = JSON.parse(raw);
    // Ø¶Ù…Ø§Ù† Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©
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

// ---- Ø§Ù„Ø¯ÙˆØ±Ø§Øª ----
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
    // ØªØ¹ÙŠÙŠÙ† ÙƒØ¯ÙˆØ±Ø© Ù†Ø´Ø·Ø© Ø¥Ø°Ø§ Ù„Ù… ØªÙƒÙ† Ù‡Ù†Ø§Ùƒ ÙˆØ§Ø­Ø¯Ø©
    if (!db.settings.activeCycleId) db.settings.activeCycleId = cycle.id;
    saveDB(db);
    ActivityService.log('cycle_created', `ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¯ÙˆØ±Ø©: ${cycle.name}`);
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
    ActivityService.log('cycle_deleted', `ØªÙ… Ø­Ø°Ù Ø¯ÙˆØ±Ø©`);
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

// ---- Ø§Ù„Ù…Ø´ØªØ±ÙƒÙˆÙ† ----
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
    ActivityService.log('participant_added', `ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø´ØªØ±Ùƒ: ${p.name}`);
    return p;
  },

  update(id, data) {
    const db = loadDB();
    const idx = db.participants.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.participants[idx] = { ...db.participants[idx], ...data, id };
    saveDB(db);
    ActivityService.log('participant_updated', `ØªÙ… ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª: ${db.participants[idx].name}`);
    return db.participants[idx];
  },

  delete(id) {
    const db = loadDB();
    const p = db.participants.find(x => x.id === id);
    db.participants = db.participants.filter(x => x.id !== id);
    // Ø¥Ù„ØºØ§Ø¡ ØªÙˆØ²ÙŠØ¹Ø§ØªÙ‡
    db.distributions.forEach(d => {
      if (d.participantId === id) d.status = 'cancelled';
    });
    saveDB(db);
    if (p) ActivityService.log('participant_deleted', `ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø´ØªØ±Ùƒ: ${p.name}`);
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

// ---- Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨ÙˆÙ† ----
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
    ActivityService.log('rep_added', `ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨: ${r.name}`);
    return r;
  },

  update(id, data) {
    const db = loadDB();
    const idx = db.representatives.findIndex(r => r.id === id);
    if (idx === -1) return null;
    db.representatives[idx] = { ...db.representatives[idx], ...data, id };
    saveDB(db);
    ActivityService.log('rep_updated', `ØªÙ… ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨: ${db.representatives[idx].name}`);
    return db.representatives[idx];
  },

  delete(id) {
    const db = loadDB();
    const r = db.representatives.find(x => x.id === id);
    db.representatives = db.representatives.filter(x => x.id !== id);
    // Ø§Ù„ØºØ§Ø¡ Ø­Ø¬ÙˆØ²Ø§ØªÙ‡
    db.distributions.forEach(d => {
      if (d.representativeId === id && d.status === 'reserved') d.status = 'cancelled';
    });
    saveDB(db);
    if (r) ActivityService.log('rep_deleted', `ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨: ${r.name}`);
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

// ---- Ø§Ù„ØªÙˆØ²ÙŠØ¹Ø§Øª ----
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

  // ØªÙˆØ²ÙŠØ¹ Ù„Ù…Ø´ØªØ±Ùƒ Ù…Ø¨Ø§Ø´Ø±Ø©
  distributeToParticipant(cycleId, participantId, formIds, notes = '', amount = 0) {
    const db = loadDB();
    const participant = db.participants.find(p => p.id === participantId);
    if (!participant) return { success: false, msg: 'Ø§Ù„Ù…Ø´ØªØ±Ùƒ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' };

    // ØªØ­Ù‚Ù‚ Ø£Ù† Ø§Ù„Ø§Ø³ØªÙ…Ø§Ø±Ø§Øª Ù…ØªØ§Ø­Ø©
    const usedFormIds = new Set(
      db.distributions
        .filter(d => d.cycleId === cycleId && d.status !== 'cancelled')
        .map(d => d.formId)
    );

    const unavailable = formIds.filter(id => usedFormIds.has(id));
    if (unavailable.length > 0) {
      return { success: false, msg: `Ø§Ù„Ø§Ø³ØªÙ…Ø§Ø±Ø§Øª Ø§Ù„ØªØ§Ù„ÙŠØ© ØºÙŠØ± Ù…ØªØ§Ø­Ø©: ${unavailable.join(', ')}` };
    }

    const now = new Date().toISOString();
    const amt = parseFloat(amount) || 0;
    // ØªÙ‚Ø³ÙŠÙ… Ø§Ù„Ù…Ø¨Ù„Øº Ø¹Ù„Ù‰ Ø¹Ø¯Ø¯ Ø§Ù„Ø§Ø³ØªÙ…Ø§Ø±Ø§Øª Ø¥Ø°Ø§ Ù„Ø²Ù… Ø§Ù„Ø£Ù…Ø±ØŒ Ø£Ùˆ ØªØ®Ø²ÙŠÙ† Ø§Ù„Ù…Ø¨Ù„Øº ÙÙŠ Ø§Ù„Ø§Ø³ØªÙ…Ø§Ø±Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙÙ‚Ø·ØŸ 
    // Ù…Ù† Ø§Ù„Ø£ÙØ¶Ù„ ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ù…Ø¨Ù„Øº ÙƒÙ…ØªÙˆØ³Ø· Ø£Ùˆ Ø¥Ø¶Ø§ÙØªÙ‡ Ù„ÙƒÙ„ Ø§Ø³ØªÙ…Ø§Ø±Ø© Ø­Ø³Ø¨ Ø±ØºØ¨Ø© Ø§Ù„Ø¹Ù…ÙŠÙ„ØŒ Ù„ÙƒÙ† Ø§Ù„Ø£Ø³Ù‡Ù„ Ù‡Ùˆ ØªØ®Ø²ÙŠÙ†Ù‡ Ù…Ù‚Ø³Ù…Ø§Ù‹ 
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
    ActivityService.log('distributed', `ØªÙ… ØªÙˆØ²ÙŠØ¹ ${formIds.length} Ø§Ø³ØªÙ…Ø§Ø±Ø© Ù„Ù„Ù…Ø´ØªØ±Ùƒ ${participant.name}`);
    return { success: true, count: formIds.length };
  },

  // Ø­Ø¬Ø² Ù„Ù…Ù†Ø¯ÙˆØ¨
  reserveForRepresentative(cycleId, repId, formIds, notes = '', amount = 0) {
    const db = loadDB();
    const rep = db.representatives.find(r => r.id === repId);
    if (!rep) return { success: false, msg: 'Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' };

    const usedFormIds = new Set(
      db.distributions
        .filter(d => d.cycleId === cycleId && d.status !== 'cancelled')
        .map(d => d.formId)
    );

    const unavailable = formIds.filter(id => usedFormIds.has(id));
    if (unavailable.length > 0) {
      return { success: false, msg: `Ø§Ù„Ø§Ø³ØªÙ…Ø§Ø±Ø§Øª Ø§Ù„ØªØ§Ù„ÙŠØ© ØºÙŠØ± Ù…ØªØ§Ø­Ø©: ${unavailable.join(', ')}` };
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
    ActivityService.log('reserved', `ØªÙ… Ø­Ø¬Ø² ${formIds.length} Ø§Ø³ØªÙ…Ø§Ø±Ø© Ù„Ù„Ù…Ù†Ø¯ÙˆØ¨ ${rep.name}`);
    return { success: true, count: formIds.length };
  },

  // Ù†Ù‚Ù„ Ù…Ù† Ù…Ù†Ø¯ÙˆØ¨ Ù„Ù…Ø´ØªØ±Ùƒ
  assignFromRepToParticipant(distributionId, participantId) {
    const db = loadDB();
    const dist = db.distributions.find(d => d.id === distributionId);
    if (!dist) return { success: false, msg: 'Ø§Ù„ØªÙˆØ²ÙŠØ¹ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' };
    if (dist.status !== 'reserved') return { success: false, msg: 'Ø§Ù„Ø§Ø³ØªÙ…Ø§Ø±Ø© Ù„ÙŠØ³Øª Ù…Ø­Ø¬ÙˆØ²Ø©' };

    const participant = db.participants.find(p => p.id === participantId);
    if (!participant) return { success: false, msg: 'Ø§Ù„Ù…Ø´ØªØ±Ùƒ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' };

    dist.participantId = participantId;
    dist.status = 'distributed';
    dist.type = 'participant';
    dist.distributedAt = new Date().toISOString();

    saveDB(db);
    ActivityService.log('transferred', `Ù†Ù‚Ù„ Ø§Ø³ØªÙ…Ø§Ø±Ø© ${dist.formId} Ù„Ù„Ù…Ø´ØªØ±Ùƒ ${participant.name}`);
    return { success: true };
  },

  updateDistribution(distId, updates) {
    const db = loadDB();
    const idx = db.distributions.findIndex(d => d.id === distId);
    if (idx !== -1) {
      db.distributions[idx] = { ...db.distributions[idx], ...updates };
      saveDB(db);
      ActivityService.log('dist_updated', `ØªÙ… ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª ØªÙˆØ²ÙŠØ¹ Ø§Ø³ØªÙ…Ø§Ø±Ø© ${db.distributions[idx].formId}`);
      return { success: true, dist: db.distributions[idx] };
    }
    return { success: false, msg: 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„ØªÙˆØ²ÙŠØ¹' };
  },

  // Ø¥Ù„ØºØ§Ø¡ ØªÙˆØ²ÙŠØ¹/Ø­Ø¬Ø²
  cancel(distributionId) {
    const db = loadDB();
    const dist = db.distributions.find(d => d.id === distributionId);
    if (!dist) return { success: false };
    dist.status = 'cancelled';
    dist.cancelledAt = new Date().toISOString();
    saveDB(db);
    ActivityService.log('cancelled', `ØªÙ… Ø¥Ù„ØºØ§Ø¡ ØªÙˆØ²ÙŠØ¹ Ø§Ø³ØªÙ…Ø§Ø±Ø© ${dist.formId}`);
    return { success: true };
  },

  // Ø¥Ù„ØºØ§Ø¡ Ø¬Ù…ÙŠØ¹ ØªÙˆØ²ÙŠØ¹Ø§Øª Ù…Ø´ØªØ±Ùƒ ÙÙŠ Ø¯ÙˆØ±Ø©
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

// ---- Ø³Ø¬Ù„ Ø§Ù„Ù†Ø´Ø§Ø· ----
const ActivityService = {
  log(type, message) {
    const db = loadDB();
    db.activity.unshift({
      id: generateId(),
      type,
      message,
      createdAt: new Date().toISOString()
    });
    // Ø§Ø­ØªÙØ¸ Ø¨Ø¢Ø®Ø± 100 Ù†Ø´Ø§Ø· ÙÙ‚Ø·
    if (db.activity.length > 100) db.activity = db.activity.slice(0, 100);
    saveDB(db);
  },

  getRecent(limit = 15) {
    return loadDB().activity.slice(0, limit);
  }
};

// ---- Ø§Ù„ØªØµØ¯ÙŠØ±/Ø§Ù„Ø§Ø³ØªÙŠØ±Ø§Ø¯ ----
const BackupService = {
  export() {
    const db = loadDB();
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
    a.href = url;
    a.download = `Ø®ØªÙ…Ø§Øª_Ù†Ø³Ø®Ø©_Ø§Ø­ØªÙŠØ§Ø·ÙŠØ©_${date}.json`;
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
          reject(new Error('Ù…Ù„Ù ØºÙŠØ± ØµØ§Ù„Ø­'));
        }
      };
      reader.readAsText(file);
    });
  },

  clearAll() {
    localStorage.removeItem(DB_KEY);
  }
};

// ---- Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¹Ø§Ù…Ø© ÙˆÙ†ØµÙˆØµ Ø§Ù„Ø·Ø¨Ø§Ø¹Ø© ----
const SettingsService = {
  getSettings() {
    const defaultSettings = {
      printTitle: 'Ø¨Ø±Ù†Ø§Ù…Ø¬ Ù„Ø§ ØªÙ‡Ø¬Ø±ÙˆØ§ Ø§Ù„Ù‚Ø±Ø¢Ù† ÙˆØ§Ù„ØµØ¯Ù‚Ø©',
      printSubtitle: 'Ø®ØªÙ…Ø§Øª Ø´Ù‡Ø± Ø±Ø¬Ø¨ ÙˆØ´Ø¹Ø¨Ø§Ù†',
      printHadith: 'Ù‚Ø§Ù„ Ø±Ø³ÙˆÙ„ Ø§Ù„Ù„Ù‡ (Øµ): (Ø¥Ù† Ø§Ù„Ù‚Ù„ÙˆØ¨ ØªØµØ¯Ø£ ÙƒÙ…Ø§ ÙŠØµØ¯Ø£ Ø§Ù„Ø­Ø¯ÙŠØ¯ Ù‚ÙŠÙ„ ÙŠØ§ Ø±Ø³ÙˆÙ„ Ø§Ù„Ù„Ù‡ ÙˆÙ…Ø§ Ø¬Ù„Ø§Ø¤Ù‡Ø§ Ù‚Ø§Ù„ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù‚Ø±Ø¢Ù† ÙˆØ°ÙƒØ± Ø§Ù„Ù…ÙˆØª)',
      printDutiesTitle: 'ÙˆØ§Ø¬Ø¨Ø§Øª Ø§Ù„Ù…Ø´ØªØ±Ùƒ (Ø®Ù„Ø§Ù„ Ø´Ù‡Ø± Ø±Ø¬Ø¨ ÙˆØ´Ø¹Ø¨Ø§Ù†):',
      printDuties: [
        'Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙˆØ±Ù‚Ø© Ø§Ù„Ù‚Ø±Ø¢Ù†ÙŠØ© Ø³ØªÙˆÙ† Ù…Ø±Ø© Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.',
        'Ù‚Ø±Ø§Ø¡Ø© Ø²ÙŠØ§Ø±Ø© Ø¹Ø§Ø´ÙˆØ±Ø§Ø¡ Ø«Ù…Ø§Ù† Ù…Ø±Ø§Øª Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.',
        'Ù‚Ø±Ø§Ø¡Ø© Ø¯Ø¹Ø§Ø¡ Ø§Ù„ÙØ±Ø¬ (120) Ù…Ø±Ø© Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.',
        'Ø§Ù„ØµÙ„Ø§Ø© Ø¹Ù„Ù‰ Ù…Ø­Ù…Ø¯ ÙˆØ¢Ù„ Ù…Ø­Ù…Ø¯ (400) Ù…Ø±Ø© Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.',
        'Ù‚Ø±Ø§Ø¡Ø© Ø¯Ø¹Ø§Ø¡ Ø§Ù„Ù†Ø¯Ø¨Ø© Ù…Ø±ØªÙŠÙ† Ø®Ù„Ø§Ù„ Ø§Ù„Ø´Ù‡Ø±ÙŠÙ†.',
        'Ø¯ÙØ¹ (2,000) Ø±.Ø¹ Ø¨Ù†ÙŠØ© Ø§Ù„ØµØ¯Ù‚Ø© Ø§Ù„Ù…Ø·Ù„Ù‚Ø© (Ù‡Ø°Ø§ Ø§Ù„Ù…Ø¨Ù„Øº ÙŠØ³Ø§Ø¹Ø¯ ÙÙŠ Ø£Ø¹Ù…Ø§Ù„ Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ù„Ù„Ø£ÙŠØªØ§Ù… ÙˆØ§Ù„Ù…ØªØ¹ÙÙÙŠÙ†).'
      ],
      printNiya: 'Ø§ØµØ§Ù„Ø© Ø¹Ù† Ù†ÙØ³ÙŠ ÙˆÙ†ÙŠØ§Ø¨Ø© Ø¹Ù† Ø§Ù…ÙˆØ§ØªÙŠ ÙˆØ¹Ù† Ø§Ù„Ù…Ø´ØªØ±ÙƒÙŠÙ† ÙˆØ§Ù…ÙˆØ§ØªÙ‡Ù… ÙˆÙ…Ø´ØªØ±ÙƒÙŠ Ù…Ø¤Ø³Ø³Ø© Ø´Ø¨Ø§Ø¨ Ø§Ù„Ø­Ø³ÙŠÙ† (Ø¹) Ø§Ù„Ø§Ø­ÙŠØ§Ø¡ ÙˆØ§Ù„Ø§Ù…ÙˆØ§Øª ÙˆÙ†Ø®Øµ Ø¨Ø§Ù„Ø°ÙƒØ± Ø§Ù„Ø§Ù…Ø§Ù… Ø§Ù„Ø­Ø¬Ø© (Ø¹Ø¬) ÙˆØ´Ù‡Ø¯Ø§Ø¦Ù†Ø§ Ø§Ù„Ø§Ø¨Ø±Ø§Ø±.',
      printNote: 'Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´ØªØ±Ùƒ Ø§Ù† ÙŠØªØ¹Ù‡Ø¯ Ø§Ù…Ø§Ù… Ø§Ù„Ù„Ù‡ ÙˆØ±Ø³ÙˆÙ„Ù‡ Ø¨Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø¨Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© ÙˆØ¥Ù„Ø§ Ø§Ù† Ù„Ù… ÙŠØ³ØªØ·Ø¹ ÙÙ„ÙŠÙƒÙ„Ù Ù…Ù† ÙŠÙ†ÙˆØ¨ Ù…Ù‚Ø§Ù…Ù‡ Ø¨Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©.',
      printRewardTitle: 'Ø§Ù„Ø«ÙˆØ§Ø¨ Ø§Ù„Ø°ÙŠ ÙŠØ­ØµÙ„ Ø¹Ù„ÙŠÙ‡ Ø§Ù„Ù…Ø´ØªØ±Ùƒ (Ø®Ù„Ø§Ù„ Ø´Ù‡Ø± Ø±Ø¬Ø¨ ÙˆØ´Ø¹Ø¨Ø§Ù†):',
      printRewards: [
        'Ø£ÙƒØ«Ø± Ù…Ù† (120) Ø®ØªÙ…Ø© Ù‚Ø±Ø¢Ù†ÙŠØ©.',
        'Ø£ÙƒØ«Ø± Ù…Ù† (600,0) Ø²ÙŠØ§Ø±Ø© Ø¹Ø§Ø´ÙˆØ±Ø§Ø¡.',
        'Ø£ÙƒØ«Ø± Ù…Ù† (144,000) Ø¯Ø¹Ø§Ø¡ Ø§Ù„ÙØ±Ø¬.',
        'Ø£ÙƒØ«Ø± Ù…Ù† (480,000) ØµÙ„Ø§Ø© Ø¹Ù„Ù‰ Ù…Ø­Ù…Ø¯ ÙˆØ¢Ù„ Ù…Ø­Ù…Ø¯.',
        'Ø£ÙƒØ«Ø± Ù…Ù† (2,400) Ø¯Ø¹Ø§Ø¡ Ø§Ù„Ù†Ø¯Ø¨Ø©.',
        'Ø«ÙˆØ§Ø¨ Ø§Ù„ØµØ¯Ù‚Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ©.',
        'ÙŠÙ…ÙƒÙ† Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù†ÙØ³ Ù‡Ø°Ø§ Ø§Ù„Ø«ÙˆØ§Ø¨ Ù„Ù„Ù…ÙŠØª ÙˆØ§Ù„Ù…ØªÙˆÙÙ‰ Ù…Ù† Ø®Ù„Ø§Ù„ Ø¯ÙØ¹ Ù…Ø¨Ù„Øº (4,000 Ø±.Ø¹) Ø´Ù‡Ø±ÙŠØ§Ù‹ Ø£ÙŠ (48,000 Ø±.Ø¹) Ø³Ù†ÙˆÙŠØ§Ù‹.'
      ],
      printStatsTitle: 'Ù…Ø¨ÙŠØ¹Ø§Øª Ø¹Ø§Ù… 2024 Ø§Ù„ØªÙŠ ØªÙ… Ø§Ù†Ø¬Ø§Ø²Ù‡Ø§ Ø¨ÙØ¶Ù„ Ø§Ù„Ù„Ù‡ ÙˆØ¨ÙØ¶Ù„ Ø§Ø´ØªØ±Ø§ÙƒØ§ØªÙƒÙ…',
      printStatsTotalSpent: '(127,500,92) Ø±.Ø¹',
      printStatsTotalBeneficiaries: '(1,234) Ù…Ø³ØªÙÙŠØ¯',
      printStatsDetails: [
        'ØµØ±Ù ÙƒÙØ§Ù„Ø©: (24,340,000 Ø±.Ø¹) | Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†: (343)',
        'ØµØ±Ù ØªØ¹Ø°ÙŠØ©: (43,000,000 Ø±.Ø¹) | Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†: (455)',
        'ØµØ±Ù Ù„Ø­ÙˆÙ…: (12,500,000 Ø±.Ø¹) | Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†: (120)',
        'ØµØ±Ù Ø§ÙŠØªØ§Ù…: (34,000,000 Ø±.Ø¹) | Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†: (150)',
        'ØµØ±Ù Ø²ÙˆØ§Ø¬: (5,000,000 Ø±.Ø¹) | Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†: (10)',
        'ØµØ±Ù Ø§Ø¹Ù…Ø§Ø±: (8,660,000 Ø±.Ø¹) | Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†: (20)'
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
    ActivityService.log('settings_updated', 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ù„Ù„Ø·Ø¨Ø§Ø¹Ø©');
  }
};



/* Routines: one simple file any agent or scheduler can write (snapshots/routines.json),
   plus your agent's own scheduler when a reader for it exists (refresh/sources/).
   Turns schedules into this week's fire times for the Routines tab and today's rows
   for the homepage ROUTINES widget. Zero dependencies, CommonJS so both the server
   (require) and the refresh scripts (import) can use it. */
'use strict';
const fs = require('fs');
const path = require('path');

const KIT = path.resolve(__dirname, '..', '..');
const ROUTINES_FILE = path.join(KIT, 'snapshots', 'routines.json');
const DAY_NAMES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const MAX_PER_DAY = 288; // one fire every 5 minutes is the most a routine shows per day

const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'routine';
const clean = (s, n = 300) => String(s || '').replace(/ - /g, ' - ').replace(/\s+/g, ' ').trim().slice(0, n);
const toMinutes = t => { const m = /^(\d{1,2}):(\d{2})/.exec(String(t || '').trim()); return m && +m[1] < 24 && +m[2] < 60 ? +m[1] * 60 + +m[2] : null; };
const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

function systemTimezone() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } }
function validTimezone(tz) { try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch { return false; } }

/* ---------- cron ---------- */
function field(expr, value, min, max) {
  const names = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  expr = String(expr).toLowerCase().replace(/[a-z]{3}/g, x => names[x] ?? x);
  return expr.split(',').some(part => {
    let [base, step] = part.split('/');
    step = step ? +step : 1;
    if (!Number.isInteger(step) || step <= 0) return false;
    let lo, hi;
    if (base === '*' || base === '?') { lo = min; hi = max; }
    else if (base.includes('-')) [lo, hi] = base.split('-').map(Number);
    else { lo = +base; hi = step > 1 ? max : lo; }
    if (max === 6) { if (lo === 7) lo = 0; if (hi === 7) hi = 6; }
    return Number.isFinite(lo) && Number.isFinite(hi) && value >= lo && value <= hi && (value - lo) % step === 0;
  });
}
function cronParts(expr) {
  const f = String(expr || '').trim().split(/\s+/);
  return f.length === 5 ? f : null;
}
function cronDayMatches(f, p) {
  const anyDom = /^[*?]$/.test(f[2]), anyDow = /^[*?]$/.test(f[4]);
  const dom = field(f[2], p.dom, 1, 31), dow = field(f[4], p.dow, 0, 6);
  return field(f[3], p.month, 1, 12) && (anyDom && anyDow ? true : anyDom ? dow : anyDow ? dom : dom || dow);
}
function cronTimes(f) {
  const out = [];
  for (let h = 0; h < 24; h++) if (field(f[1], h, 0, 23)) for (let m = 0; m < 60; m++) if (field(f[0], m, 0, 59)) out.push(h * 60 + m);
  return out;
}

/* ---------- reading the file ---------- */
/* Two row shapes are accepted, so a v1 snapshots/routines.json keeps working:
   v2: { "id", "name", "source", "cron" | "days"+"times", "status", "desc" }
   v1: { "t": "07:00", "d": "daily" | "mon,wed" | "dom:1", "src", "n", "desc" } */
function normalize(r, i, sourceLabels, fileTime) {
  const v1 = r.n !== undefined || r.t !== undefined;
  const name = clean(v1 ? r.n : (r.name || r.title || r.label || r.id), 100);
  const source = String((v1 ? r.src : r.source) || 'agent');
  const out = {
    id: 'rt:' + slug(r.id || (source + '-' + name)), name, source, sourceLabel: sourceLabels[source] || source.toUpperCase(),
    desc: clean(r.desc || r.description || '', 300), cron: null, days: null, times: [], dom: null,
    status: 'active', path: r.path || null, sourceAsOf: fileTime, origin: 'routines file',
  };
  if (v1) {
    const t = toMinutes(r.t); if (t !== null) out.times = [t];
    const d = String(r.d || 'daily').toLowerCase();
    if (/^dom:\d+$/.test(d)) out.dom = +d.slice(4);
    else if (d !== 'daily') out.days = d.split(/[ ,]+/).map(x => DAY_NAMES.indexOf(x.slice(0, 3))).filter(x => x >= 0);
    if (r.est) out.estTime = true;
  } else {
    if (r.cron && cronParts(r.cron)) out.cron = String(r.cron).trim();
    const times = [].concat(r.times || [], r.time || []).map(toMinutes).filter(x => x !== null);
    if (times.length) out.times = [...new Set(times)].sort((a, b) => a - b);
    if (Array.isArray(r.days) && r.days.length) out.days = r.days.map(x => typeof x === 'number' ? x : DAY_NAMES.indexOf(String(x).toLowerCase().slice(0, 3))).filter(x => x >= 0 && x < 7);
    const st = String(r.status || (r.enabled === false ? 'paused' : '')).toLowerCase();
    if (st === 'paused' || st === 'off' || st === 'disabled') out.status = 'paused';
    else if (st === 'ondemand' || st === 'on demand' || st === 'manual') out.status = 'ondemand';
    else if (!out.cron && !out.times.length) out.status = 'ondemand';
  }
  if (!out.cron && !out.times.length && out.status === 'active') out.status = 'ondemand';
  out.scheduleText = out.cron ? 'cron ' + out.cron : out.times.length ? (out.dom ? 'day ' + out.dom + ' of the month' : out.days ? out.days.map(d => DAY_NAMES[d]).join(', ') : 'daily') + ' at ' + out.times.map(hhmm).join(', ') : 'On demand';
  return out;
}
function readRoutinesFile(file = ROUTINES_FILE) {
  let raw = null, fileTime = null;
  try { raw = JSON.parse(fs.readFileSync(file, 'utf8')); fileTime = fs.statSync(file).mtime.toISOString(); } catch { }
  if (!raw) return { found: false, timezone: '', sources: [], routines: [] };
  const sources = Array.isArray(raw.sources) ? raw.sources.filter(s => s && s.key).map(s => ({ key: String(s.key), label: clean(s.label || s.key, 40) })) : [];
  const labels = Object.fromEntries(sources.map(s => [s.key, s.label]));
  const list = Array.isArray(raw.routines) ? raw.routines : [];
  const routines = list.filter(r => r && typeof r === 'object').map((r, i) => normalize(r, i, labels, fileTime));
  const seen = new Set();
  for (const r of routines) { let id = r.id, k = 2; while (seen.has(id)) id = r.id + '-' + k++; r.id = id; seen.add(id); }
  return { found: true, timezone: String(raw.timezone || ''), sources, routines };
}

/* Every routine source together: the file first, then any agent scheduler readers. */
function loadAll(extra = []) {
  const file = readRoutinesFile();
  const routines = [...file.routines];
  const sources = [...file.sources];
  for (const group of extra) {
    if (!group || !group.routines || !group.routines.length) continue;
    if (!sources.some(s => s.key === group.key)) sources.push({ key: group.key, label: group.label });
    for (const r of group.routines) if (!routines.some(x => x.id === r.id)) routines.push({ ...r, source: group.key, sourceLabel: group.label });
  }
  for (const r of routines) if (!sources.some(s => s.key === r.source)) sources.push({ key: r.source, label: r.sourceLabel || r.source.toUpperCase() });
  const timezone = validTimezone(file.timezone) ? file.timezone : systemTimezone();
  return { found: file.found || routines.length > 0, timezone, sources, routines };
}

/* ---------- this week ---------- */
function partsIn(tz, ms) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return { date: p.year + '-' + p.month + '-' + p.day, minutes: +p.hour * 60 + +p.minute, dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) };
}
function addDays(date, n) { return new Date(Date.parse(date + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10); }
function weekOf(tz, now = Date.now()) {
  const p = partsIn(tz, now), monIndex = (p.dow + 6) % 7;
  const weekStart = addDays(p.date, -monIndex);
  return { weekStart, today: monIndex, todayDate: p.date, nowMinutes: p.minutes, dates: Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) };
}
function firesOn(r, date, tz) {
  if (r.status !== 'active') return [];
  if (r.once) { const p = partsIn(tz || systemTimezone(), r.once); return p.date === date ? [p.minutes] : []; }
  const d = new Date(date + 'T12:00:00Z'), dow = d.getUTCDay(), dom = d.getUTCDate(), month = d.getUTCMonth() + 1, monIndex = (dow + 6) % 7;
  let times = [];
  if (r.cron) { const f = cronParts(r.cron); if (f && cronDayMatches(f, { dow, dom, month })) times = cronTimes(f); }
  else if (r.dom) { if (dom === r.dom) times = r.times; }
  else if (!r.days || r.days.includes(monIndex)) times = r.times;
  return times.length > MAX_PER_DAY ? times.filter((_, i) => i % Math.ceil(times.length / MAX_PER_DAY) === 0) : times;
}

/* ---------- icons: one small line drawing per routine, picked from its words ---------- */
const SHELLS = {
  bell: '<path d="M12 32h24l-4-6V18a8 8 0 0 0-16 0v8zM20 38h8"/>', mail: '<rect x="6" y="12" width="36" height="26" rx="3"/><path d="m7 14 17 13 17-13"/>',
  clipboard: '<rect x="9" y="9" width="30" height="34" rx="3"/><rect x="17" y="5" width="14" height="7" rx="2"/><path d="m16 25 5 5 11-13"/>',
  bulb: '<path d="M18 33c0-8-7-7-7-17a13 13 0 0 1 26 0c0 10-7 9-7 17zM18 38h12M21 43h6"/>', chat: '<path d="M5 8h29v23H20L9 40v-9H5zM37 17h6v24l-8-7"/>',
  calendar: '<rect x="6" y="9" width="36" height="33" rx="3"/><path d="M6 18h36M15 5v9M33 5v9M14 26h5M27 26h6M14 34h5"/>', gauge: '<path d="M7 36a20 20 0 1 1 34 0M24 25l11-10"/><circle cx="24" cy="25" r="4"/>',
  lock: '<rect x="9" y="20" width="30" height="23" rx="3"/><path d="M16 20V12a8 8 0 0 1 16 0v8M24 28v8"/>', book: '<path d="M24 11Q15 3 5 9v31q10-6 19 1 9-7 19-1V9q-10-6-19 2zM24 11v30"/>',
  trend: '<path d="M6 39h36M8 31l11-11 7 6 14-16M30 10h10v10"/>', news: '<rect x="6" y="7" width="30" height="34" rx="2"/><path d="M36 16h7v21q0 4-4 4H10M12 14h18M12 21h7v9h-7zM24 22h6M24 28h6M12 35h18"/>',
  video: '<rect x="5" y="10" width="38" height="29" rx="4"/><path d="m20 18 12 7-12 7z"/>', sun: '<circle cx="24" cy="24" r="9"/><path d="M24 2v8M24 38v8M2 24h8M38 24h8M8 8l6 6M34 34l6 6M8 40l6-6M34 14l6-6"/>',
  moon: '<path d="M33 30A14 14 0 0 1 20 8a16 16 0 1 0 19 19 14 14 0 0 1-6 3z"/>', sync: '<path d="M8 20a17 17 0 0 1 29-9l4 4M41 5v10H31M40 28a17 17 0 0 1-29 9l-4-4M7 43V33h10"/>',
  money: '<circle cx="24" cy="24" r="19"/><path d="M24 10v28M31 15H21a6 6 0 0 0 0 12h6a6 6 0 0 1 0 12H16"/>', heart: '<path d="M24 40 8 24C-2 8 17 1 24 14c7-13 26-6 16 10z"/>',
  broom: '<path d="M30 6 20 26M12 26h16l4 16H8zM16 34v8M22 34v8"/>', network: '<circle cx="24" cy="24" r="6"/><circle cx="9" cy="9" r="4"/><circle cx="39" cy="9" r="4"/><circle cx="9" cy="39" r="4"/><circle cx="39" cy="39" r="4"/><path d="m12 12 8 8m8 8 8 8m-24 0 8-8m8-8 8-8"/>',
};
const PATTERNS = [[/inbox|mail|digest|email/, 'mail'], [/check|audit|review|checklist|submission/, 'clipboard'], [/idea|learn|research|brainstorm/, 'bulb'],
  [/reply|chat|message|dm\b|comment/, 'chat'], [/calendar|schedule|remind|meeting/, 'calendar'], [/usage|quota|limit|health/, 'gauge'], [/security|backup|password|secret/, 'lock'],
  [/journal|diary|log|note|book|read/, 'book'], [/trend|report|analytics|metric|stats/, 'trend'], [/news|article|blog|newsletter/, 'news'], [/video|youtube|podcast|watch/, 'video'],
  [/morning|sunrise|daily start/, 'sun'], [/evening|night|wind down/, 'moon'], [/sync|export|import|copy/, 'sync'], [/money|finance|invoice|tax|revenue|budget/, 'money'],
  [/workout|fitness|health|habit/, 'heart'], [/clean|tidy|sweep|archive/, 'broom'], [/urgent|alert|notify|ping/, 'bell']];
function routineIcon(id, name) {
  const key = PATTERNS.find(([re]) => re.test(String(name || '').toLowerCase()))?.[1] || 'network';
  const hash = [...String(id)].reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0, 7);
  const marks = Array.from({ length: 6 }, (_, i) => hash & (1 << i) ? '<path d="M' + (12 + i * 5) + ' 46v-2"/>' : '').join('');
  return '<svg viewBox="0 0 48 48" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + SHELLS[key] + marks + '</svg>';
}

/* ---------- what the pages read ---------- */
/* The Routines tab: every routine, this week's fire times, and how each one is measured. */
function calendarData(all, usageRoutines = {}) {
  const wk = weekOf(all.timezone);
  const routines = all.routines.map(r => ({
    id: r.id, title: r.name, label: r.name, summary: r.desc, platform: r.source, sourceLabel: r.sourceLabel,
    enabled: r.status === 'active' ? true : r.status === 'paused' ? false : null, paused: r.status === 'paused',
    days: [], svg: routineIcon(r.id, r.name), source: (r.sourceLabel || r.source) + (r.origin ? ' (' + r.origin + ')' : ''),
    sourceAsOf: r.sourceAsOf || null, scheduleText: r.scheduleText, cron: r.cron, path: r.path || null, estimate: null,
  }));
  const byId = new Map(routines.map(r => [r.id, r])), occurrences = [];
  for (const r of all.routines) {
    const row = byId.get(r.id), days = new Set();
    wk.dates.forEach((date, day) => { for (const m of firesOn(r, date, all.timezone)) { occurrences.push({ id: r.id + '@' + date + 'T' + hhmm(m), routineId: r.id, day, startMinutes: m, enabled: true, date }); days.add(day); } });
    row.days = [...days].sort();
  }
  occurrences.sort((a, b) => a.day - b.day || a.startMinutes - b.startMinutes);
  return {
    departments: [],
    calendar: { timezone: all.timezone, weekStart: wk.weekStart, routines, occurrences, meta: { builtAt: new Date().toISOString(), found: all.found, note: 'Fire times for this week, Monday to Sunday, in ' + all.timezone + '. A fire is a start time, not a duration. Paused and on-demand routines are listed but not placed.' } },
    routines,
  };
}
/* The homepage ROUTINES widget: today's fires in the v1 widget shape. */
function todayRows(all) {
  const wk = weekOf(all.timezone), rows = [], counts = {};
  for (const r of all.routines) {
    counts[r.source] = (counts[r.source] || 0) + 1;
    const times = firesOn(r, wk.todayDate, all.timezone);
    if (!times.length) continue;
    if (times.length > 6) {
      const next = times.find(m => m >= wk.nowMinutes) ?? times[times.length - 1];
      rows.push({ t: hhmm(next), d: 'daily', src: r.source, n: r.name + ' (' + times.length + ' runs today)', desc: r.desc });
    } else for (const m of times) rows.push({ t: hhmm(m), d: 'daily', src: r.source, n: r.name, desc: r.desc });
  }
  rows.sort((a, b) => a.t.localeCompare(b.t));
  return { generated: new Date().toISOString(), timezone: all.timezone, needsSetup: !all.found, sources: all.sources, counts, routines: rows };
}

module.exports = { ROUTINES_FILE, readRoutinesFile, loadAll, calendarData, todayRows, routineIcon, weekOf, firesOn, cronParts, slug, clean, systemTimezone };

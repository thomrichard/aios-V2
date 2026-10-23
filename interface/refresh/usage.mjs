// Usage for the Skills, Applications and Routines tabs. Reads files on this machine only and
// calls no model, so a refresh costs no tokens. Three sources, all optional:
//  1. snapshots/usage-log.jsonl - one line per skill run, routine run or app call, written by any
//     agent (shape in USAGE.md)
//  2. data/app-opens.jsonl - written by the OS each time you open a Micro Apps tile
//  3. your agent's own session logs, when a reader for them exists (refresh/sources/)
// Anything no source measures shows as "not measured". Nothing is estimated or made up.
// Writes data/arms-usage.js (for the pages) and data/arms-usage.json.
// Run: node refresh/usage.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url)), KIT = path.resolve(HERE, '..');
const claudeCode = require('./sources/claude-code.cjs');
const { allRoutines, readerOn } = require('./lib/sources.cjs');
const apps = require('./lib/apps.cjs');
const DAY = 864e5, now = Date.now(), SHORT = 7, LONG = 30, cutoff = now - LONG * DAY, t0 = Date.now();
const readJSON = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const readLines = p => { try { return fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
const dayOf = ms => new Date(ms).toISOString().slice(0, 10);
const dayCut = d => dayOf(now - (d - 1) * DAY);
const inWin = (t, d) => t >= now - d * DAY;
const sumDays = (days, d) => Object.entries(days).filter(([k]) => k >= dayCut(d)).reduce((a, [, n]) => a + n, 0);
const lastDay = days => Object.keys(days).filter(k => days[k] > 0).sort().pop() || null;
const norm = s => String(s || '').toLowerCase().replace(/^\/+/, '').replace(/[^a-z0-9]/g, '');

// ---------- the sources ----------
const log = readLines(path.join(KIT, 'snapshots', 'usage-log.jsonl')).map(e => ({ ...e, t: Date.parse(e.at || e.time || e.t) })).filter(e => e.t >= cutoff && e.t <= now + DAY);
const opens = readLines(path.join(KIT, 'data', 'app-opens.jsonl')).map(e => ({ ...e, t: Date.parse(e.at) })).filter(e => e.t >= cutoff);
let sessions = null;
// os-config.json "readers": { "claudeCode": false } turns this reader off (no folder of that agent is read)
if (readerOn('claudeCode')) { try { sessions = claudeCode.sessionUsage(LONG); } catch (e) { console.error('journaux de session :', e.message); } }
const sources = [];
if (log.length) sources.push('journal d’usage (' + log.length + ' entrées)');
if (sessions) sources.push('journaux de session de l’agent (' + sessions.files + ' fichiers)');
sources.push('ouvertures depuis les tuiles de l’OS (' + opens.length + ')');

// ---------- skills ----------
const skillList = readJSON(path.join(KIT, 'data', 'skills.json'), []);
const skillRows = new Map(), skillByNorm = new Map();
const rowFor = (name, kind, desc) => {
  if (!skillRows.has(name)) { skillRows.set(name, { name: '/' + name, id: name, kind: kind || 'skill', desc: desc || '', runs7: 0, tok7: 0, cost7: 0, runs30: 0, tok30: 0, cost30: 0, last: 0, subagents30: 0 }); skillByNorm.set(norm(name), name); }
  return skillRows.get(name);
};
for (const s of skillList) rowFor(s.name, s.kind, s.desc);
// AIOS: the skills of your agent's own folder (~/.claude/skills, account skills included) show too, used or not (see MODIFS.md)
const describe = f => { try { const m = /^description:\s*(.+)$/m.exec(fs.readFileSync(f, 'utf8')); return m ? m[1].replace(/^["'>|]\s*|["']$/g, '').trim() : ''; } catch { return ''; } };
const globalSkills = (dir, depth) => {
  let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of list) {
    const full = path.join(dir, e.name);
    if (!e.isDirectory() && !e.isSymbolicLink()) continue;
    if (fs.existsSync(path.join(full, 'SKILL.md'))) { if (!skillByNorm.has(norm(e.name))) rowFor(e.name, 'skill', describe(path.join(full, 'SKILL.md'))); }
    else if (depth < 3) globalSkills(full, depth + 1);
  }
};
if (readerOn('claudeCode')) globalSkills(path.join(os.homedir(), '.claude', 'skills'), 0);
const addRun = (row, t, tok, cost, sub) => {
  row.runs30++; row.tok30 += tok || 0; row.cost30 += cost || 0; row.subagents30 += sub || 0;
  if (inWin(t, SHORT)) { row.runs7++; row.tok7 += tok || 0; row.cost7 += cost || 0; }
  if (t > row.last) row.last = t;
};
let skillsMeasured = false;
const BUILTIN = new Set(['addDir', 'agents', 'clear', 'compact', 'config', 'context', 'cost', 'doctor', 'effort', 'exit', 'export', 'fast', 'help', 'hooks', 'init', 'login', 'logout', 'mcp', 'memory', 'model', 'permissions', 'resume', 'review', 'status', 'usage'].map(norm));
const loaded = new Set(sessions ? sessions.skillRuns.filter(r => !r.cmd).map(r => norm(r.name)) : []);
if (sessions) {
  skillsMeasured = true;
  for (const r of sessions.skillRuns) {
    let name = skillByNorm.get(norm(r.name));
    // AIOS: a skill outside your skill folders (Claude account, ~/.claude/skills, plugins) counts too;
    // only Claude Code's built-in commands are left out (see MODIFS.md)
    if (!name) { if (r.cmd && BUILTIN.has(norm(r.name))) continue; name = String(r.name).replace(/^\/+/, ''); }
    if (r.cmd && (skillList.find(s => s.name === name && s.kind === 'skill') || loaded.has(norm(name)))) continue;   // a typed skill also logs its load line
    addRun(rowFor(name), r.t, r.tok, r.cost, r.sub);
  }
}
for (const e of log.filter(e => e.kind === 'skill')) {
  skillsMeasured = true;
  const name = skillByNorm.get(norm(e.name)) || String(e.name || '').replace(/^\/+/, '');
  if (name) addRun(rowFor(name, 'skill'), e.t, +e.tokens || 0, +e.cost || 0, 0);
}
const skills = [...skillRows.values()].map(r => ({ ...r, tok7: Math.round(r.tok7), tok30: Math.round(r.tok30), cost7: +r.cost7.toFixed(4), cost30: +r.cost30.toFixed(4), last: r.last ? new Date(r.last).toISOString() : null }));

// ---------- routines ----------
const all = allRoutines();
const byNorm = new Map(); for (const r of all.routines) { byNorm.set(norm(r.id), r.id); byNorm.set(norm(r.name), r.id); }
const runsBy = new Map();
const addRoutineRun = (id, t, tok, cost) => { const l = runsBy.get(id) || []; l.push({ t, tok: tok || 0, cost: cost || 0 }); runsBy.set(id, l); };
let routinesMeasured = false;
if (sessions && sessions.routineRuns.length) { routinesMeasured = true; for (const x of sessions.routineRuns) addRoutineRun(x.routine, x.t, x.tok, x.cost); }
for (const e of log.filter(e => e.kind === 'routine')) { routinesMeasured = true; const id = byNorm.get(norm(e.name)) || byNorm.get(norm(e.id)); if (id) addRoutineRun(id, e.t, +e.tokens || 0, +e.cost || 0); }
const routines = {};
for (const [id, list] of runsBy) {
  const w7 = list.filter(r => inWin(r.t, SHORT)), sum = (a, k) => a.reduce((s, r) => s + r[k], 0);
  routines[id] = { runs7: w7.length, tok7: Math.round(sum(w7, 'tok')), cost7: +sum(w7, 'cost').toFixed(4), runs30: list.length, tok30: Math.round(sum(list, 'tok')), cost30: +sum(list, 'cost').toFixed(4), perRunTok: Math.round(sum(list, 'tok') / list.length), perRunCost: +(sum(list, 'cost') / list.length).toFixed(4), last: new Date(Math.max(...list.map(r => r.t))).toISOString() };
}

// ---------- applications (your connections) and local apps (the Micro Apps tiles) ----------
const appCfg = readJSON(path.join(KIT, 'config', 'apps.json'), { apps: [] }).apps || [];
const appRows = appCfg.map(a => ({ id: a.id, label: a.label || a.id, kind: a.kind || 'mcp', group: ['cli', 'api', 'app'].includes(a.kind) ? 'tool' : 'connector', desc: a.desc || '', status: a.status || '', iconSlug: a.iconSlug || '', days: {}, match: a }));
let appsMeasured = false;
const bump = (row, days) => { for (const [d, n] of Object.entries(days)) row.days[d] = (row.days[d] || 0) + n; };
if (sessions) {
  appsMeasured = true;
  for (const [k, days] of Object.entries(sessions.toolDays)) {
    // AIOS: "mcp" may list several server names, for one service plugged in twice (see MODIFS.md)
    if (k.startsWith('m:')) { const server = k.slice(2); for (const row of appRows) { const m = row.match; if ((m.mcp && [].concat(m.mcp).some(x => norm(x) === norm(server))) || (!m.mcp && norm(row.id.replace(/^app:/, '')) === norm(server))) bump(row, days); } }
    if (k.startsWith('w:')) { const word = k.slice(2); for (const row of appRows) if (row.match.command && String(row.match.command).toLowerCase() === word) bump(row, days); }
  }
}
for (const e of log.filter(e => e.kind === 'app')) { appsMeasured = true; const row = appRows.find(r => norm(r.id) === norm(e.name) || norm(r.id.replace(/^app:/, '')) === norm(e.name) || norm(r.label) === norm(e.name)); if (row) { const d = dayOf(e.t); row.days[d] = (row.days[d] || 0) + (+e.calls || 1); } }
const appsOut = appRows.map(a => ({ id: a.id, label: a.label, kind: a.kind, group: a.group, desc: a.desc, status: a.status, iconSlug: a.iconSlug, calls7: sumDays(a.days, SHORT), calls30: sumDays(a.days, LONG), last: lastDay(a.days) }));
const local = apps.list().map(a => {
  const days = {}, agentDays = {};
  for (const o of opens) if (o.app === a.id) { const d = dayOf(o.t); days[d] = (days[d] || 0) + 1; }
  if (sessions && a.port) { const dd = sessions.toolDays['p:' + a.port] || {}; for (const [d, n] of Object.entries(dd)) agentDays[d] = (agentDays[d] || 0) + n; }
  return { id: 'local:' + a.id, label: a.name, kind: 'local', group: 'sm4rt', desc: a.desc || '', port: a.port || null, status: '', visits7: sumDays(days, SHORT), visits30: sumDays(days, LONG), agentCalls30: sessions ? sumDays(agentDays, LONG) : null, last: lastDay(days) };
});

// ---------- totals ----------
const totals = {};
for (const d of [SHORT, LONG]) {
  let tok = 0, cost = 0;
  if (sessions) for (const [k, v] of Object.entries(sessions.dayTotals)) if (k >= dayCut(d)) { tok += v.tok; cost += v.cost; }
  for (const e of log) if (inWin(e.t, d) && e.kind !== 'app') { tok += +e.tokens || 0; cost += +e.cost || 0; }
  totals[d] = { tok: Math.round(tok), cost: +cost.toFixed(2) };
}
const out = {
  generatedAt: new Date().toISOString(), windows: { short: SHORT, long: LONG }, sources,
  measured: { skills: skillsMeasured, routines: routinesMeasured, apps: appsMeasured, localApps: true, tokens: !!sessions || log.some(e => e.tokens) },
  scan: { sessionFiles: sessions ? sessions.files : 0, logEntries: log.length, opens: opens.length, ms: Date.now() - t0 },
  rates: { note: '$ API : ce que coûteraient les tokens mesurés au tarif standard de l’API. Ce n’est pas ta facture d’abonnement.' },
  method: {
    skill: 'Les exécutions de skills viennent de ton journal d’usage et, si ton agent garde des journaux de session que l’OS sait lire, de ces journaux. Tout ce qui n’est pas mesuré est signalé.',
    routine: 'Une exécution de routine vient des mêmes sources. Une routine sans exécution mesurée affiche « non mesuré ».',
    tokens: 'Les tokens sont comptés tels que ton agent les a notés. Chaque appel au modèle compte une fois.',
    apps: 'Tes connexions : les appels notés dans ton journal d’usage ou tes journaux de session. Apps locales : les ouvertures depuis les tuiles de l’OS.',
  },
  totals, skills, routines, apps: appsOut, sm4rt: local,
};
fs.writeFileSync(path.join(KIT, 'data', 'arms-usage.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(KIT, 'data', 'arms-usage.js'), 'window.ARMS_USAGE=' + JSON.stringify(out) + ';\n');
console.log(JSON.stringify({ sources, skills: skills.length, measured: out.measured, ms: Date.now() - t0 }));

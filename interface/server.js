/* ============================================================================
   SM4RT Agentic OS v2 - the local server
   One command starts everything:  node server.js
   It serves the homepage and the Second Brain, gives every widget its data, and starts the
   Second Brain engine (engine/server.js) beside it. Zero dependencies: node only.
   Settings live in os-config.json. Guides: README.md and the other .md files in this folder.

   Pages
     /                       the homepage plus the Second Brain (index.html, os.html, brain/, views/)
     /widgets                the widget library
     /artifacts/<file>       the ring's balls (the artifacts folder)
   Homepage feeds (GET)
     /api/calendar /api/email /api/stats /api/routines /api/artifacts /api/skills /api/apps
     /local/boot             all five homepage feeds in one answer, from memory
   Second Brain (GET, read only, through the engine)
     /local/search /local/meta /local/file   and /data/snapshot.js (this week's routines)
   Actions (POST, local pages only)
     /api/run                runs a skills deck card through your agent's command (os-config.json "runner")
     /api/apply-comments     the "Apply all comments" runner that review pages call
     /api/open               opens a link, or a file inside your workspace, on this computer
     /api/app-open           a Micro Apps tile click: logs the open, says where to go
     /api/artifact-remove    right-click REMOVE on a ball (moves it to artifacts/_trash)
     /local/refresh          rebuilds the Second Brain's data (no model calls)
   ========================================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { execFile, spawn } = require('child_process');

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) { console.error('\n  SM4RT Agentic OS a besoin de Node.js 18 ou plus récent. Tu as la version ' + process.version + '\n'); process.exit(1); }

const KIT = __dirname;
let CFG = {};
try { CFG = JSON.parse(fs.readFileSync(path.join(KIT, 'os-config.json'), 'utf8')); }
catch (e) { console.error('os-config.json manque ou n’est pas un JSON valide : réglages par défaut utilisés (' + e.message + ')'); }
const PORT = Number(process.env.PORT) || Number(CFG.port) || 50000;
const BRAIN_PORT = Number(CFG.brainPort) || 50201;
const ARTIFACTS = path.resolve(KIT, CFG.artifactsDir || 'artifacts');
const SNAP = path.join(KIT, 'snapshots'), DATA = path.join(KIT, 'data'), RUNDIR = path.join(KIT, 'os-runs');
for (const d of [ARTIFACTS, SNAP, DATA, RUNDIR]) fs.mkdirSync(d, { recursive: true });
const TOKEN = String(process.env.SM4RT_TOKEN || '').trim();
const BODY_MAX = 1024 * 1024;

const routinesLib = require('./refresh/lib/routines.cjs');
const routineSources = require('./refresh/lib/sources.cjs');
const microApps = require('./refresh/lib/apps.cjs');
const scan = require('./engine/scan.js');

/* ---------------------------- security helpers ----------------------------
   Every request must name this computer in its Host header, which stops DNS-rebinding pages.
   Every POST must come from a page on this computer (Origin localhost or 127.0.0.1, any port,
   or no Origin at all, which means it did not come from a web page). JSON actions also need a
   JSON content type, which a web page on another site cannot send without asking first. */
const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d+)?$/i;
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
/* "null" is what a page opened as a file sends, and so does a sandboxed frame on any website, so it is
   refused unless you turn on "allowNullOrigin" in os-config.json */
const allowNull = CFG.allowNullOrigin === true;
function originOk(req) {
  const o = req.headers.origin;
  if (o === undefined) return true;
  if (o === 'null') return allowNull;
  return LOCAL_ORIGIN.test(String(o));
}
/* Only /api/apply-comments and /api/run-status answer other local ports (review pages
   on this computer), and only by echoing a local Origin back. No other route
   and no other origin ever gets a CORS header. */
function localCors(req) {
  const o = req.headers.origin;
  if (o && (LOCAL_ORIGIN.test(o) || (o === 'null' && allowNull))) return { 'Access-Control-Allow-Origin': o, Vary: 'Origin' };
  return {};
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > BODY_MAX) { reject(Object.assign(new Error('La requête dépasse 1 Mo'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
const isJson = req => /^application\/json\b/i.test(String(req.headers['content-type'] || ''));
const tokenOk = req => !TOKEN || req.headers['x-sm4rt-token'] === TOKEN;
function sendJson(res, obj, code = 200, extra = {}) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(JSON.stringify(obj));
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function inside(root, p) {
  if (!root || !p || String(p).includes('\0')) return null;
  const abs = path.resolve(root, String(p));
  return abs === root || abs.startsWith(root + path.sep) ? abs : null;
}

/* ---------------------------- the Second Brain engine ----------------------------
   Started as a child process on brainPort, restarted if it stops. If something already
   answers on that port (you started the engine yourself), it is used as is. */
let engine = null, engineRestarts = 0, stopping = false;
const portOpen = port => new Promise(ok => { const s = net.connect({ port, host: '127.0.0.1' }); s.setTimeout(700); s.on('connect', () => { s.destroy(); ok(true); }); s.on('error', () => ok(false)); s.on('timeout', () => { s.destroy(); ok(false); }); });
async function startEngine() {
  if (stopping) return;
  if (await portOpen(BRAIN_PORT)) { console.log('  Le moteur du second cerveau tourne déjà sur le port ' + BRAIN_PORT); return; }
  engine = spawn(process.execPath, [path.join(KIT, 'engine', 'server.js')], { env: { ...process.env, PORT: String(BRAIN_PORT) }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  const say = d => String(d).split(/\r?\n/).filter(Boolean).forEach(l => console.log('  [cerveau] ' + l));
  engine.stdout.on('data', say); engine.stderr.on('data', say);
  engine.on('exit', code => {
    engine = null;
    if (stopping || code === 2) return;
    if (++engineRestarts <= 5) setTimeout(startEngine, 2000 * engineRestarts);
    else console.log('  [cerveau] arrêté 5 fois : la recherche et la visionneuse de fichiers sont coupées jusqu’au redémarrage de l’OS');
  });
}
function stopAll() { stopping = true; if (engine) { try { engine.kill(); } catch (_) { } } }
process.on('exit', stopAll);
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { stopAll(); process.exit(0); });
async function brainGet(p, ms = 15000) {
  try { const r = await fetch('http://127.0.0.1:' + BRAIN_PORT + p, { signal: AbortSignal.timeout(ms) }); return await r.json(); } catch (_) { return null; }
}

/* ---------- tiny cache so widgets can poll without hammering their sources ---------- */
const cache = new Map();
function cached(key, ttlMs, producer) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return Promise.resolve(hit.val);
  return Promise.resolve().then(producer)
    .then(val => { cache.set(key, { at: Date.now(), val }); return val; })
    .catch(err => hit ? { ...hit.val, stale: true, error: String(err.message || err) } : { error: String(err.message || err) });
}
const run = (cmd, args, ms = 60000) => new Promise((res, rej) => {
  execFile(cmd, args, { maxBuffer: 12e6, timeout: ms, windowsHide: true, shell: process.platform === 'win32' }, (err, stdout, stderr) => {
    if (err && !stdout) return rej(new Error(String(stderr || err.message).slice(0, 300)));
    res(stdout);
  });
});

/* ---------------------------- CALENDAR (OAUTH.md) ---------------------------- */
const CAL_TOOL = path.join(KIT, 'tools', 'google-calendar.js');
async function getCalendar() {
  const snapFile = path.join(SNAP, 'calendar.json');
  const fromSnapshot = note => {
    if (!fs.existsSync(snapFile)) return { needsSetup: true, note, events: [] };
    const snap = JSON.parse(fs.readFileSync(snapFile, 'utf8'));
    const cutoff = Date.now() - 60 * 60 * 1000;
    snap.events = (snap.events || []).filter(ev => new Date(ev.start).getTime() > cutoff);
    return { ...snap, source: (snap.source || 'agenda') + ' (copie)', note };
  };
  if (!fs.existsSync(path.join(KIT, '.google-creds.json'))) return fromSnapshot('Connexion Google pas encore réglée (OAUTH.md)');
  try {
    const out = await run('node', [CAL_TOOL, 'next']);
    const payload = JSON.parse(out.slice(out.indexOf('{')));
    if (!payload.events) throw new Error('aucun événement renvoyé par google-calendar.js');
    fs.writeFileSync(snapFile, JSON.stringify(payload, null, 2));
    return payload;
  } catch (e) { return fromSnapshot(String(e.message).slice(0, 200)); }
}

/* ---------------------------- EMAIL (WIRING.md) ----------------------------
   Off until you turn it on in os-config.json ("email": { "enabled": true }), so the OS never
   runs a command you have not set up. */
const EMAIL = CFG.email || {};
const PARTNER_HINTS = new RegExp(CFG.partnerHints || 'sponsor|collab|partner|brand|affiliate|deal|invoice|pitch|opportunit', 'i');
const LEAD_HINTS = new RegExp(CFG.leadHints || 'join|member|sign\\s?up|subscri|pricing|enroll|course|coaching|access|billing|refund', 'i');
const PERSONAL_FROM = new RegExp(CFG.personalFrom || '@(gmail|googlemail|yahoo|outlook|hotmail|icloud|proton)\\.', 'i');
const jsonFrom = out => { const i = out.indexOf('{'); if (i < 0) throw new Error('pas de JSON renvoyé par la commande e-mail'); return JSON.parse(out.slice(i)); };
async function getEmail() {
  if (!EMAIL.enabled) return { needsSetup: true };
  const cli = /^[A-Za-z0-9._-]+$/.test(EMAIL.command || 'gws') ? (EMAIL.command || 'gws') : 'gws';
  const list = jsonFrom(await run(cli, ['gmail', 'users', 'messages', 'list', '--params', '"{\\"userId\\":\\"me\\",\\"q\\":\\"newer_than:1d -category:promotions\\",\\"maxResults\\":40}"']));
  const ids = (list.messages || []).slice(0, 18).map(m => m.id).filter(id => /^[A-Za-z0-9]+$/.test(id));
  const rows = [];
  for (const id of ids) {
    try {
      const m = jsonFrom(await run(cli, ['gmail', 'users', 'messages', 'get', '--params', `"{\\"userId\\":\\"me\\",\\"id\\":\\"${id}\\",\\"format\\":\\"metadata\\"}"`], 25000));
      const h = {}; (m.payload?.headers || []).forEach(x => h[x.name.toLowerCase()] = x.value);
      const subject = h.subject || '(sans objet)', rawFrom = h.from || '';
      const kind = PARTNER_HINTS.test(subject) ? 'partnerships' : LEAD_HINTS.test(subject) ? 'leads' : PERSONAL_FROM.test(rawFrom) ? 'personal' : 'other';
      rows.push({ id, subject, from: rawFrom.replace(/<.*/, '').replace(/"/g, '').trim(), unread: (m.labelIds || []).includes('UNREAD'), kind, ts: +(m.internalDate || 0), snippet: (m.snippet || '').slice(0, 90) });
    } catch (_) { }
  }
  const count = k => rows.filter(r => r.kind === k).length;
  return { fetched: new Date().toISOString(), total: list.resultSizeEstimate || rows.length, unread: rows.filter(r => r.unread).length,
    flagged: rows.filter(r => r.kind === 'partnerships' || r.kind === 'leads').slice(0, 6), mix: { partnerships: count('partnerships'), leads: count('leads'), personal: count('personal'), other: count('other') } };
}

/* ---------------------------- STATS (WIRING.md) ---------------------------- */
function getStats() {
  const f = path.join(SNAP, 'stats.json');
  if (!fs.existsSync(f)) return { needsSetup: true };
  try {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    /* the caption may carry <br> line breaks and nothing else */
    if (d.cap !== undefined) d.cap = esc(d.cap).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
    if (d.link && !/^https?:\/\//i.test(d.link)) delete d.link;
    return d;
  } catch (e) { return { error: 'stats.json : ' + String(e.message) }; }
}

/* ---------------------------- ROUTINES (ROUTINES.md) ---------------------------- */
const getRoutines = () => routinesLib.todayRows(routineSources.allRoutines());

/* ---------------------------- ARTIFACTS: the ring (RING.md) ---------------------------- */
const ICON_RULES = [[/deck|slide|present/i, 'deck'], [/report|audit|analysis/i, 'report'], [/dash|board|monitor/i, 'dash'], [/brief|inbox|email|digest/i, 'mail'],
  [/lesson|script|video|thumb/i, 'video'], [/chart|graph|metric/i, 'chart'], [/wheel|orb|visual|design/i, 'visual'], [/prompt|skill|agent|run/i, 'bolt']];
const CAT_RULES = [[/post|newsletter|writ|script|hook|draft|announce|description|blurb|copy/i, 'writing'], [/landing|site|page|dashboard|app|web|frontend|ui|widget|lab|library|game/i, 'frontend'],
  [/infographic|explain|report|guide|map|slide|deck|digest|progress|workshop|snapshot|concept/i, 'infographic']];
const ICON_KEYS = new Set(['dash', 'deck', 'report', 'mail', 'video', 'chart', 'visual', 'bolt', 'doc']);
const pick = (rules, name, d) => { for (const [re, v] of rules) if (re.test(name)) return v; return d; };
/* A ball's glyph is drawn from its sidecar's svg. Only plain shapes with plain geometry pass;
   anything else (scripts, links, styles, event handlers) drops the whole glyph. */
const SVG_TAG = /^(path|circle|rect|line|polyline|polygon|ellipse|g)$/i, SVG_ATTR = /^(d|cx|cy|r|rx|ry|x|y|width|height|x1|y1|x2|y2|points|transform|opacity)$/i;
function cleanSvg(svg) {
  const s = String(svg || '').slice(0, 4000);
  if (!s.trim()) return '';
  const out = [];
  for (const m of s.matchAll(/<\s*(\/?)\s*([a-zA-Z]+)([^>]*)>|([^<]+)/g)) {
    if (m[4] !== undefined) { if (m[4].trim()) return ''; continue; }
    const [, close, tag, rest] = m;
    if (!SVG_TAG.test(tag)) return '';
    if (close) { out.push('</' + tag.toLowerCase() + '>'); continue; }
    const attrs = [];
    for (const a of rest.replace(/\/\s*$/, '').matchAll(/([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      const v = a[3] ?? a[4];
      if (!SVG_ATTR.test(a[1]) || /[<>]|url\(|javascript:/i.test(v)) return '';
      attrs.push(a[1].toLowerCase() + '="' + v.replace(/"/g, '') + '"');
    }
    out.push('<' + tag.toLowerCase() + (attrs.length ? ' ' + attrs.join(' ') : '') + (/\/\s*$/.test(rest) ? '/>' : '>'));
  }
  return out.join('');
}
function getArtifacts() {
  if (!fs.existsSync(ARTIFACTS)) return { artifacts: [] };
  const files = fs.readdirSync(ARTIFACTS).filter(f => /\.html?$/i.test(f));
  const artifacts = files.map(f => {
    const full = path.join(ARTIFACTS, f);
    let st; try { st = fs.statSync(full); } catch (_) { return null; }
    if (!st.isFile()) return null;
    let meta = {};
    const side = full.replace(/\.html?$/i, '.json');
    if (fs.existsSync(side)) { try { meta = JSON.parse(fs.readFileSync(side, 'utf8')); } catch (_) { } }
    let title = typeof meta.title === 'string' ? meta.title : '';
    if (!title) { const head = fs.readFileSync(full, 'utf8').slice(0, 2000); title = (head.match(/<title>([^<]+)<\/title>/i)?.[1] || f.replace(/\.html?$/i, '')).trim(); }
    const name = f + ' ' + title + ' ' + (meta.kind || '');
    return {
      file: f, title: title.slice(0, 140), icon: ICON_KEYS.has(meta.icon) ? meta.icon : pick(ICON_RULES, f + ' ' + title, 'doc'),
      kind: String(meta.kind || 'artifact').slice(0, 30), note: String(meta.note || '').slice(0, 300), svg: cleanSvg(meta.svg),
      category: ['writing', 'frontend', 'infographic', 'other'].includes(meta.category) ? meta.category : pick(CAT_RULES, name, 'other'),
      created: meta.created && !isNaN(Date.parse(meta.created)) ? new Date(meta.created).toISOString() : st.birthtime.toISOString(),
      modified: st.mtime.toISOString(), url: '/artifacts/' + encodeURIComponent(f)
    };
  }).filter(Boolean).sort((a, b) => new Date(b.modified) - new Date(a.modified));
  return { fetched: new Date().toISOString(), count: artifacts.length, artifacts };
}

/* ---------------------------- SKILLS DECK + the runner (WIRING.md) ----------------------------
   A card runs your agent headlessly. The runner is one command template in os-config.json
   ("runner.command"); the prompt arrives on standard input, so quotes and new lines never touch
   the command line. {model} and {effort} come from the card's dials. */
const okId = s => /^[a-z0-9][a-z0-9-]{0,60}$/.test(String(s || ''));
const SKILLS = (Array.isArray(CFG.skills) ? CFG.skills : []).filter(s => s && okId(s.id))
  .map(s => ({ ...s, icon: /^[a-z0-9-]{1,20}$/.test(String(s.icon || '')) ? s.icon : 'bolt', model: Number.isInteger(s.model) ? s.model : 1, effort: Number.isInteger(s.effort) ? s.effort : 1 }));
const MODELS = (CFG.models || ['HAIKU', 'SONNET', 'OPUS', 'FABLE']).map(String);
const EFFORTS = (CFG.efforts || ['LOW', 'MEDIUM', 'HIGH', 'XHIGH', 'MAX']).map(String);
const MODEL_OK = new Set(['haiku', 'sonnet', 'opus', 'fable', ...MODELS.map(m => m.toLowerCase())]);
const EFFORT_OK = new Set(['low', 'medium', 'high', 'xhigh', 'max', ...EFFORTS.map(m => m.toLowerCase())]);
/* the value the command gets: a matching "modelValues"/"effortValues" entry when you set one, else the name in lower case */
function dial(kind, name) {
  const list = kind === 'model' ? MODELS : EFFORTS, values = (CFG.runner || {})[kind === 'model' ? 'modelValues' : 'effortValues'];
  const n = String(name || '').toLowerCase(), i = list.findIndex(x => x.toLowerCase() === n);
  const v = Array.isArray(values) && i >= 0 && values[i] ? String(values[i]) : n;
  return /^[A-Za-z0-9._:-]{1,60}$/.test(v) ? v : null;
}
/* the Calendar widget's three world clocks: os-config.json "clocks", each { "label", "tz" } with an IANA time zone */
const DEFAULT_CLOCKS = [{ label: 'USA PT', tz: 'America/Los_Angeles' }, { label: 'USA ET', tz: 'America/New_York' }, { label: 'LONDON', tz: 'Europe/London' }];
const okTz = tz => { try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch (_) { return false; } };
const CLOCKS = (() => {
  const list = (Array.isArray(CFG.clocks) ? CFG.clocks : []).filter(c => c && okTz(String(c.tz || '')) && String(c.label || '').trim())
    .slice(0, 3).map(c => ({ label: String(c.label).trim().slice(0, 12).toUpperCase(), tz: String(c.tz) }));
  return list.length ? list : DEFAULT_CLOCKS;
})();
const RUNLOG = path.join(DATA, 'runs.json');
const readRuns = () => { try { return JSON.parse(fs.readFileSync(RUNLOG, 'utf8')); } catch (_) { return []; } };
function recordRun(id, meta) { const runs = readRuns(); runs.unshift({ id, at: new Date().toISOString(), ...meta }); fs.writeFileSync(RUNLOG, JSON.stringify(runs.slice(0, 200), null, 2)); }
const JOBS = new Map();
/* Three template shapes (WIRING.md):
   - no placeholder for the prompt: the prompt goes in on standard input (the default)
   - {prompt}: the prompt goes on the command line (Apply all comments sends a short line that
     points at its prompt file, so long text never touches the shell)
   - {skill}: deck cards only, the card's id (the v1 shape, "/{skill}") */
const argMode = tpl => /\{prompt\}|\{skill\}/.test(tpl);
const ARG_SAFE = /^[A-Za-z0-9 _.\/\\:,()-]{1,600}$/;
function runnerProblem(kind) {
  const tpl = String((CFG.runner || {}).command || '').trim();
  if (!tpl) return 'Pas encore de lanceur. Mets la commande qui lance ton agent en autonomie dans os-config.json, champ "runner.command" (WIRING.md).';
  if (KIT.includes('"')) return 'Le chemin du dossier de l’OS contient un guillemet. Déplace le dossier vers un chemin sans guillemets.';
  if (kind === 'apply' && /\{skill\}/.test(tpl) && !/\{prompt\}/.test(tpl)) return '« Apply all comments » a besoin d’un lanceur qui lit le prompt sur l’entrée standard ou qui prend {prompt} (WIRING.md).';
  return null;
}
function startJob({ id, model, effort, prompt, quiet, skillId }) {
  const jobId = id + '-' + Date.now();
  const logFile = path.join(RUNDIR, jobId + '.log'), promptFile = path.join(RUNDIR, jobId + '.prompt.md');
  fs.writeFileSync(promptFile, prompt);
  const tpl = String(CFG.runner.command);
  let cmd = tpl.split('{model}').join(dial('model', model) || '').split('{effort}').join(dial('effort', effort) || '');
  if (argMode(tpl)) {
    const line = quiet ? 'Read the file ' + promptFile + ' and do exactly what it says.' : prompt;
    if (!ARG_SAFE.test(line) || (skillId && !okId(skillId))) {
      const job = { jobId, id, model, effort, logFile, status: 'failed', quiet: !!quiet, started: Date.now(), ended: Date.now(), code: -1, report: null, result: '' };
      fs.writeFileSync(logFile, 'Le prompt contient des caractères qui ne passent pas en ligne de commande. Utilise un modèle de lanceur qui lit l’entrée standard (WIRING.md).\n');
      JOBS.set(jobId, job); return job;
    }
    cmd = cmd.split('{prompt}').join(line).split('{skill}').join(skillId || '');
  } else cmd += ' < "' + promptFile + '"';
  const cwd = CFG.runner.cwd ? path.resolve(KIT, CFG.runner.cwd) : KIT;
  const log = fs.createWriteStream(logFile);
  log.write('$ ' + cmd + '\n\n');
  let child;
  try { child = spawn(cmd, { cwd: fs.existsSync(cwd) ? cwd : KIT, shell: true, windowsHide: true }); }
  catch (e) { log.end('ERREUR DE LANCEMENT : ' + e.message + '\n'); child = null; }
  const job = { jobId, id, model, effort, logFile, status: 'running', quiet: !!quiet, started: Date.now(), ended: null, code: null, report: null, result: '' };
  JOBS.set(jobId, job);
  if (!child) { job.status = 'failed'; job.ended = Date.now(); job.code = -1; return job; }
  child.stdout.on('data', d => { if (job.result.length < 300000) job.result += d; log.write(d); });
  child.stderr.pipe(log, { end: false });
  child.on('error', err => { log.end('\nERREUR DE LANCEMENT : ' + err.message + '\n'); job.status = 'failed'; job.ended = Date.now(); job.code = -1; });
  child.on('close', code => {
    log.end();
    job.status = code === 0 ? 'done' : 'failed'; job.ended = Date.now(); job.code = code; job.result = job.result.trim();
    const seconds = Math.round((job.ended - job.started) / 1000);
    if (quiet) return;            /* the page that asked shows the result itself: no ball */
    try { const report = writeRunReport(job, seconds); job.report = report.file; recordRun(id, { model, effort, seconds, exit: code, report: report.file }); }
    catch (e) { console.error('échec du rapport d’exécution :', e.message); }
  });
  return job;
}
function logTail(file, bytes = 4000) {
  try { const { size } = fs.statSync(file), fd = fs.openSync(file, 'r'), buf = Buffer.alloc(Math.min(bytes, size)); fs.readSync(fd, buf, 0, buf.length, Math.max(0, size - buf.length)); fs.closeSync(fd); return buf.toString('utf8'); }
  catch (_) { return ''; }
}
/* the run's result, formatted for reading (headings, bold, code, lists, tables), never a raw log dump */
function mdToHtml(src) {
  const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>');
  const out = [], lines = src.split(/\r?\n/);
  let list = null, fence = null;
  const closeList = () => { if (list) { out.push('</' + list + '>'); list = null; } };
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (fence !== null) { if (/^```/.test(ln)) { out.push('<pre class="code">' + esc(fence.join('\n')) + '</pre>'); fence = null; } else fence.push(ln); continue; }
    if (/^```/.test(ln)) { closeList(); fence = []; continue; }
    if (/^\|.*\|\s*$/.test(ln)) {
      closeList(); const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) { if (!/^\|[\s:|-]+\|\s*$/.test(lines[i])) rows.push(lines[i].replace(/^\||\|\s*$/g, '').split('|').map(c => inline(c.trim()))); i++; }
      i--; out.push('<table>' + rows.map((r, ri) => '<tr>' + r.map(c => ri === 0 ? '<th>' + c + '</th>' : '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table>'); continue;
    }
    const h = ln.match(/^(#{1,4})\s+(.*)/);
    if (h) { closeList(); out.push(`<h${h[1].length + 1}>` + inline(h[2]) + `</h${h[1].length + 1}>`); continue; }
    const b = ln.match(/^\s*[-*]\s+(.*)/);
    if (b) { if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inline(b[1]) + '</li>'); continue; }
    const n = ln.match(/^\s*\d+[.)]\s+(.*)/);
    if (n) { if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inline(n[1]) + '</li>'); continue; }
    closeList(); if (ln.trim()) out.push('<p>' + inline(ln) + '</p>');
  }
  if (fence) out.push('<pre class="code">' + esc(fence.join('\n')) + '</pre>');
  closeList();
  return out.join('\n');
}
function writeRunReport(job, seconds) {
  const now = new Date(), stamp = now.toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/(\d{8})(\d{4})/, '$1-$2');
  const slug = `${job.id}-${stamp}`, ok = job.status === 'done', when = now.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  const body = job.result ? mdToHtml(job.result) : '<pre class="code">' + (esc(logTail(job.logFile, 6000)) || '(aucune sortie captée)') + '</pre>';
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>/${esc(job.id)} · exécution</title>
<style>
  :root { --paper:#f2efe8; --ink:#1c1a16; --accent:#ff6b1a; --line:#d6d0c2; --mute:#8d8775; }
  * { box-sizing:border-box; } body { margin:0; background:var(--paper); color:var(--ink); font:400 15px/1.55 Outfit,system-ui,sans-serif; padding:56px 20px; }
  .wrap { max-width:760px; margin:0 auto; } .rule { border-top:2px solid var(--ink); padding-top:10px; margin-bottom:26px; }
  .kick { font-size:10px; letter-spacing:3.4px; text-transform:uppercase; color:var(--mute); }
  h1 { font-size:30px; font-weight:700; letter-spacing:-.6px; margin:6px 0; } h1 span { color:var(--accent); } .lede { color:#55504a; margin:0 0 22px; }
  .meta { display:flex; gap:26px; flex-wrap:wrap; margin-bottom:30px; } .meta div { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--mute); }
  .meta b { display:block; font-size:19px; letter-spacing:0; text-transform:none; color:var(--ink); font-variant-numeric:tabular-nums; }
  .result { border-top:1px solid var(--line); padding-top:22px; } .result h2 { font-size:21px; margin:26px 0 8px; } .result h3 { font-size:17px; margin:22px 0 6px; }
  .result p { margin:0 0 12px; } .result ul, .result ol { margin:0 0 14px; padding-left:22px; } .result code { background:#e6e1d3; border-radius:4px; padding:1px 6px; font:400 12.5px/1 Consolas,monospace; }
  .result a { color:var(--accent); } .result table { width:100%; border-collapse:collapse; margin:0 0 16px; }
  .result th { text-align:left; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--mute); font-weight:500; padding:0 10px 8px 0; border-bottom:1px solid var(--line); }
  .result td { padding:9px 10px 9px 0; border-bottom:1px solid var(--line); vertical-align:top; }
  pre.code { background:#1c1a16; color:#e8e2d2; border-radius:8px; padding:18px 20px; font:400 12.5px/1.6 Consolas,monospace; overflow-x:auto; white-space:pre-wrap; }
  footer { margin-top:34px; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--mute); }
</style>
<div class="wrap"><div class="rule"><div class="kick">SM4RT Agentic OS · Exécution de skill en autonomie</div><h1>/<span>${esc(job.id)}</span></h1>
<p class="lede">${ok ? 'Ce que l’exécution a rendu :' : 'Exécution en ÉCHEC (code ' + esc(String(job.code)) + '). Dernière sortie ci-dessous.'}</p></div>
<div class="meta"><div>Modèle<b>${esc(job.model || '-')}</b></div><div>Effort<b>${esc(job.effort || '-')}</b></div><div>Durée<b>${esc(String(seconds))} s</b></div><div>Code de sortie<b>${esc(String(job.code))}</b></div><div>Terminée<b>${esc(when)}</b></div></div>
<div class="result">${body}</div>
<div style="margin-top:34px"><div class="kick" style="margin-bottom:8px">Sortie complète du terminal</div><pre class="code">${esc(logTail(job.logFile, 200000)) || '(journal vide)'}</pre></div>
<footer>Lancée en autonomie depuis le deck de skills · journal complet : os-runs/${esc(path.basename(job.logFile))}</footer></div>`;
  fs.writeFileSync(path.join(ARTIFACTS, slug + '.html'), html);
  fs.writeFileSync(path.join(ARTIFACTS, slug + '.json'), JSON.stringify({
    title: `/${job.id} · ${now.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`, icon: 'bolt', kind: 'run',
    svg: ok ? '<path d="M26 8L14 27h8l-2 13 12-19h-8l2-13z"/>' : '<circle cx="24" cy="24" r="15"/><path d="M18 18l12 12M30 18L18 30"/>',
    created: now.toISOString(), note: `en autonomie · ${job.model || '?'} · ${job.effort || '?'} · ${seconds} s · code ${job.code}`
  }, null, 2));
  return { file: slug + '.html', url: '/artifacts/' + slug + '.html' };
}

/* ---------------------------- APPLY ALL COMMENTS ----------------------------
   A review page (any page with the apply-comments button) sends
   its open comments, the file to edit and a model and effort. A quiet headless run edits the
   file; the page polls /api/run-status, shows the result and reloads itself. */
function applyTarget(file, page) {
  let f = String(file || '').trim();
  if (!f && /^file:\/\//i.test(String(page || ''))) { try { f = decodeURIComponent(new URL(page).pathname).replace(/^\/([A-Za-z]:)/, '$1'); } catch (_) { f = ''; } }
  if (!f) return null;                                   /* a page served by an app: the run finds its file */
  f = path.resolve(f);
  let st; try { st = fs.statSync(f); } catch (_) { throw new Error('fichier introuvable : ' + f); }
  if (!st.isFile()) throw new Error('ce n’est pas un fichier : ' + f);
  if (scan.isSecret(f.replace(/\\/g, '/'))) throw new Error('ce fichier ressemble à un secret : il n’est pas modifié');
  return f;
}
function applyPrompt({ page, file, notes, title, comments }) {
  return [
    'Apply the review comments the user left on a page. This is a headless run: nobody can answer a question, so decide and finish.',
    '',
    'Page: ' + (title ? String(title).slice(0, 200) + ' - ' : '') + String(page || 'unknown').slice(0, 500),
    file ? 'File to edit: ' + file : 'File to edit: find the file that builds this page (a local app serves the URL above).',
    notes ? 'How this page is built: ' + String(notes).slice(0, 2000) : null,
    '',
    'Comments (each names the part of the page, the exact text the user highlighted or the pin spot, then the comment):',
    comments,
    '',
    'Rules:',
    '1. Make the change each comment asks for. A highlight with no comment means fix or tighten that text.',
    '2. Edit the source of truth. If a script builds the page from a source or data file, edit those and run the build again, so the page on disk changes.',
    '3. Change nothing the comments do not touch. Keep every script, feature and style on the page working.',
    '4. Follow the writing rules in your instructions file.',
    '5. Never open a browser tab. The page reloads itself when you finish.',
    '6. Your final message is shown on the page, so keep it to one line per comment: done or skipped, and what changed. Nothing else. If you cannot do a comment, skip it and say why.'
  ].filter(l => l !== null).join('\n') + '\n';
}

/* ---------------------------- OPEN ON THIS COMPUTER ----------------------------
   Links (http/https) and files inside your workspace, this OS folder or the artifacts folder.
   Program files (.exe, .bat, scripts and the like) are never opened. No shell is involved. */
const EXEC_EXT = /\.(exe|bat|cmd|com|ps1|psm1|vbs|vbe|js|jse|wsf|wsh|msi|msp|scr|pif|lnk|reg|hta|cpl|jar|sh|bash|zsh|command|app|py|pyw|rb|pl|appref-ms)$/i;
function workspaceRoot() { try { return scan.resolveRoot(scan.workspaceConfig()); } catch (_) { return null; } }
function openTarget(target) {
  let t = String(target || '').trim();
  if (!t) throw new Error('aucune cible');
  if (/^https?:\/\//i.test(t)) { new URL(t); return launch(t); }
  if (/^file:\/\//i.test(t)) t = decodeURIComponent(new URL(t).pathname).replace(/^\/([A-Za-z]:)/, '$1');
  const root = workspaceRoot();
  const abs = path.isAbsolute(t) ? path.resolve(t) : root ? path.resolve(root, t) : null;
  if (!abs) throw new Error('hors de ton workspace');
  const allowed = [root, KIT, ARTIFACTS].filter(Boolean).some(r => abs === r || abs.startsWith(r + path.sep));
  if (!allowed) throw new Error('seuls les fichiers de ton workspace, du dossier de l’OS ou du dossier des livrables s’ouvrent d’ici');
  if (!fs.existsSync(abs)) throw new Error('introuvable');
  if (EXEC_EXT.test(abs)) throw new Error('les programmes ne s’ouvrent pas depuis l’OS');
  return launch(abs);
}
function launch(t) {
  const [cmd, args] = process.platform === 'win32' ? ['explorer.exe', [t.replace(/\//g, /^https?:/i.test(t) ? '/' : '\\')]] : process.platform === 'darwin' ? ['open', [t]] : ['xdg-open', [t]];
  spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: false }).on('error', () => { }).unref();
  return t;
}

/* ---------------------------- MICRO APPS ---------------------------- */
async function appsWithStatus() {
  return Promise.all(microApps.list().map(async a => ({ id: a.id, name: a.name, desc: a.desc, icon: a.icon, builtIn: a.builtIn, live: a.port ? await portOpen(a.port) : true })));
}

/* ---------------------------- THE SECOND BRAIN'S DATA ---------------------------- */
const FEEDS = { '/api/calendar': () => cached('cal', 120000, getCalendar), '/api/artifacts': async () => getArtifacts(), '/api/routines': () => cached('rt', 60000, getRoutines), '/api/stats': () => cached('stats', 60000, getStats), '/api/email': () => cached('mail', 180000, getEmail) };
async function boot() {
  const out = {};
  await Promise.all(Object.entries(FEEDS).map(async ([p, f]) => { try { out[p] = { age: 0, data: await f() }; } catch (e) { out[p] = { age: 0, data: { error: e.message } }; } }));
  return { feeds: out };
}
const REFRESH_STEPS = ['refresh/brain.mjs', 'refresh/usage.mjs'];
let refreshing = null;
function refreshBrain() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const started = Date.now(), steps = [];
    for (const step of REFRESH_STEPS) {
      const t = Date.now();
      const code = await new Promise(ok => { const c = spawn(process.execPath, ['--no-warnings', path.join(KIT, step)], { cwd: KIT, stdio: 'ignore', windowsHide: true }); c.on('exit', ok); c.on('error', () => ok(-1)); });
      steps.push({ step, ok: code === 0, ms: Date.now() - t });
      if (code !== 0) break;
    }
    try { await fetch('http://127.0.0.1:' + BRAIN_PORT + '/api/rescan', { method: 'POST', signal: AbortSignal.timeout(120000) }); } catch (_) { }
    return { ok: steps.length === REFRESH_STEPS.length && steps.every(s => s.ok), steps, ms: Date.now() - started, at: new Date().toISOString() };
  })().finally(() => setTimeout(() => { refreshing = null; }, 0));
  return refreshing;
}
/* the first start after you set your workspace (or change its config) builds the map by itself */
function needsFirstRefresh() {
  const root = workspaceRoot(); if (!root) return false;
  let meta = null; try { meta = JSON.parse(fs.readFileSync(path.join(DATA, 'brain-meta.json'), 'utf8')); } catch (_) { }
  if (!meta || !meta.workspaceSet) return true;
  const built = Date.parse(meta.builtAt) || 0;
  return ['workspace.json', 'departments.json', 'apps.json'].some(f => { try { return fs.statSync(path.join(KIT, 'config', f)).mtimeMs > built; } catch (_) { return false; } });
}

/* ---------------------------- static files ----------------------------
   Only the page files are served: the shell, the homepage, assets/, brain/, views/ and the two
   page data files. Config, snapshots, logs, engine and refresh code are never served. */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.gif': 'image/gif', '.mp4': 'video/mp4', '.txt': 'text/plain' };
const PUBLIC_FILES = new Set(['index.html', 'os.html', 'copy.css', 'copy.js', 'shell-extras.js', 'view-transitions.js', 'widgets.html']);
const PUBLIC_DIRS = ['assets', 'brain', 'views'];
function publicFile(p2) {
  let rel; try { rel = decodeURIComponent(p2).replace(/^\/+/, ''); } catch (_) { return null; }
  if (!rel || rel.includes('\0') || rel.includes('\\')) return null;
  const top = rel.split('/')[0];
  if (!PUBLIC_FILES.has(rel) && !(PUBLIC_DIRS.includes(top) && rel.includes('/'))) return null;
  const abs = inside(KIT, rel);
  try { return abs && fs.statSync(abs).isFile() ? abs : null; } catch (_) { return null; }
}
function serveFile(req, res, file, extraHead = {}) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('introuvable'); }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const head = { 'Content-Type': /^text\/|json$|javascript$/.test(type) ? type + '; charset=utf-8' : type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', ...extraHead };
    const inject = TOKEN && /\.html$/i.test(file) && /(^|[\\/])(index|os)\.html$/i.test(file);
    if (inject) {
      const html = fs.readFileSync(file, 'utf8').replace('<head>', '<head><meta name="sm4rt-token" content="' + esc(TOKEN) + '">');
      res.writeHead(200, { ...head, 'Cache-Control': 'no-store' }); return res.end(html);
    }
    const etag = `W/"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ...head, ETag: etag }); return res.end(); }
    res.writeHead(200, { ...head, ETag: etag, 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}
function sendScript(res, text) { res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(text); }

/* ---------------------------- HTTP ---------------------------- */
const server = http.createServer(async (req, res) => {
  let u; try { u = new URL(req.url, 'http://localhost'); } catch (_) { res.writeHead(400); return res.end(); }
  const p2 = u.pathname, post = req.method === 'POST';
  try {
    if (!LOCAL_HOST.test(String(req.headers.host || ''))) return sendJson(res, { error: 'local requests only' }, 403);
    if (req.method === 'OPTIONS') { res.writeHead(405); return res.end(); }   /* no preflight is ever granted */
    if ((p2.startsWith('/api/') || p2.startsWith('/local/')) && !tokenOk(req)) return sendJson(res, { error: 'missing or wrong x-sm4rt-token' }, 401, p2 === '/api/apply-comments' || p2 === '/api/run-status' ? localCors(req) : {});
    if (post && !originOk(req)) return sendJson(res, { error: 'only pages on this computer can do that' }, 403);

    /* ---- the Second Brain ---- */
    if (p2 === '/local/boot') return sendJson(res, await boot());
    if (p2 === '/local/search') {
      const r = await brainGet('/api/search?q=' + encodeURIComponent(String(u.searchParams.get('q') || '').slice(0, 200)));
      return r ? sendJson(res, r) : sendJson(res, { error: 'Le moteur du second cerveau ne répond pas encore.' }, 502);
    }
    if (p2 === '/local/file') {
      const r = await brainGet('/api/file?path=' + encodeURIComponent(String(u.searchParams.get('path') || '').slice(0, 1000)));
      return r ? sendJson(res, r) : sendJson(res, { error: 'Le moteur du second cerveau ne répond pas encore.' }, 502);
    }
    if (p2 === '/local/meta') {
      const m = await brainGet('/api/meta', 60000);
      return m && m.totalFiles !== undefined ? sendJson(res, { totalFiles: m.totalFiles, totalDirs: m.totalDirs, scannedAt: m.scannedAt, workspaceSet: m.workspaceSet }) : sendJson(res, { error: 'Pas encore de nombre de fichiers.' }, 502);
    }
    if (p2 === '/local/refresh' && post) return sendJson(res, await refreshBrain());
    if (p2 === '/data/snapshot.js') return sendScript(res, 'window.COPY_DATA=' + JSON.stringify(routinesLib.calendarData(routineSources.allRoutines())) + ';');
    if (p2 === '/data/arms-usage.js') { const f = path.join(DATA, 'arms-usage.js'); return fs.existsSync(f) ? serveFile(req, res, f) : sendScript(res, 'window.ARMS_USAGE=null;'); }

    /* ---- feeds ---- */
    if (FEEDS[p2] && !post) return sendJson(res, await FEEDS[p2]());
    if (p2 === '/api/skills') return sendJson(res, { skills: SKILLS, models: MODELS, modelColors: CFG.modelColors, efforts: EFFORTS, runs: readRuns().slice(0, 20), runner: runnerProblem() ? 'not set up' : 'ready', clocks: CLOCKS });
    if (p2 === '/api/apps') return sendJson(res, { apps: await appsWithStatus() });
    if (p2 === '/api/health') return sendJson(res, { ok: true, port: PORT, brainPort: BRAIN_PORT, engine: await portOpen(BRAIN_PORT), workspaceSet: !!workspaceRoot(), runner: runnerProblem() || 'ready', time: new Date().toISOString() });
    if (p2 === '/api/run-status') {
      const cors = localCors(req), job = JOBS.get(String(u.searchParams.get('job') || ''));
      if (!job) return sendJson(res, { error: 'tâche inconnue' }, 404, cors);
      return sendJson(res, { status: job.status, code: job.code, report: job.report, result: job.quiet && job.result ? job.result.slice(-3000) : undefined,
        elapsed: Math.round(((job.ended || Date.now()) - job.started) / 1000), tail: logTail(job.logFile, 700).split('\n').slice(-6).join('\n') }, 200, cors);
    }

    /* ---- actions ---- */
    if (post && p2 === '/api/apply-comments') {
      const cors = localCors(req);
      let q; try { q = JSON.parse(await readBody(req) || '{}'); } catch (e) { return sendJson(res, { error: e.status ? e.message : 'le corps de la requête n’est pas du JSON' }, e.status || 400, cors); }
      const model = String(q.model || '').toLowerCase(), effort = String(q.effort || '').toLowerCase();
      if (!MODEL_OK.has(model) || !EFFORT_OK.has(effort) || !dial('model', model) || !dial('effort', effort)) return sendJson(res, { error: 'modèle ou effort inconnu' }, 400, cors);
      const comments = String(q.comments || '').trim();
      if (!comments) return sendJson(res, { error: 'aucun commentaire à appliquer' }, 400, cors);
      const problem = runnerProblem('apply'); if (problem) return sendJson(res, { error: problem }, 400, cors);
      let file; try { file = applyTarget(q.file, q.page); } catch (e) { return sendJson(res, { error: e.message }, 400, cors); }
      const job = startJob({ id: 'apply-comments', model, effort, prompt: applyPrompt({ page: q.page, file, notes: q.notes, title: q.title, comments }), quiet: true });
      return sendJson(res, { job: job.jobId, file }, 200, cors);
    }
    if (post && !isJson(req)) return sendJson(res, { error: 'send JSON (Content-Type: application/json)' }, 415);
    if (post && p2 === '/api/run') {
      const { id, model, effort } = JSON.parse(await readBody(req) || '{}');
      const skill = SKILLS.find(s => s.id === id);
      if (!skill) return sendJson(res, { error: 'skill inconnue' }, 400);
      if (!MODEL_OK.has(String(model || '').toLowerCase()) || !EFFORT_OK.has(String(effort || '').toLowerCase()) || !dial('model', model) || !dial('effort', effort)) return sendJson(res, { error: 'modèle ou effort inconnu' }, 400);
      const problem = runnerProblem(); if (problem) return sendJson(res, { error: problem }, 400);
      const prompt = typeof skill.prompt === 'string' && skill.prompt.trim() ? skill.prompt.trim() : '/' + skill.id;
      return sendJson(res, { job: startJob({ id: skill.id, model, effort, prompt, skillId: skill.id }).jobId });
    }
    if (post && p2 === '/api/open') {
      const { target, path: rel } = JSON.parse(await readBody(req) || '{}');
      try { return sendJson(res, { opened: openTarget(target || rel) }); } catch (e) { return sendJson(res, { error: e.message }, 400); }
    }
    if (post && p2 === '/api/app-open') {
      const { id } = JSON.parse(await readBody(req) || '{}');
      const app = microApps.list().find(a => a.id === id);
      if (!app) return sendJson(res, { error: 'app inconnue' }, 400);
      const live = app.port ? await portOpen(app.port) : true;
      fs.appendFileSync(path.join(DATA, 'app-opens.jsonl'), JSON.stringify({ at: new Date().toISOString(), app: app.id, live }) + '\n');
      return sendJson(res, { url: live || !app.fallbackUrl ? app.url : app.fallbackUrl, live });
    }
    if (post && p2 === '/api/artifact-remove') {
      const { file } = JSON.parse(await readBody(req) || '{}');
      const name = path.basename(String(file || ''));
      if (!/^[^\\/]+\.(html?|json)$/i.test(name)) return sendJson(res, { error: 'fichier non valide' }, 400);
      const full = path.join(ARTIFACTS, name);
      if (!fs.existsSync(full)) return sendJson(res, { error: 'introuvable' }, 404);
      const trash = path.join(ARTIFACTS, '_trash'); fs.mkdirSync(trash, { recursive: true });
      fs.renameSync(full, path.join(trash, name));
      const side = full.replace(/\.html?$/i, '.json');
      if (side !== full && fs.existsSync(side)) fs.renameSync(side, path.join(trash, path.basename(side)));
      return sendJson(res, { ok: true });
    }
    if (post) return sendJson(res, { error: 'introuvable' }, 404);

    /* ---- pages ---- */
    if (p2 === '/' || p2 === '/index.html') return serveFile(req, res, path.join(KIT, 'index.html'));
    if (p2 === '/widgets' || p2 === '/widgets/') return serveFile(req, res, path.join(KIT, 'widgets.html'));
    if (p2.startsWith('/artifacts/')) {
      let rel; try { rel = decodeURIComponent(p2.slice('/artifacts/'.length)); } catch (_) { rel = null; }
      const f = rel && !rel.startsWith('_trash') ? inside(ARTIFACTS, rel) : null;
      return f ? serveFile(req, res, f) : sendJson(res, { error: 'introuvable' }, 404);
    }
    const f = publicFile(p2);
    if (f) return serveFile(req, res, f);
    sendJson(res, { error: 'introuvable' }, 404);
  } catch (e) {
    if (!res.headersSent) sendJson(res, { error: String(e.message || e) }, e.status || 500);
  }
});
server.on('error', e => {
  if (e.code === 'EADDRINUSE') { console.error('Le port ' + PORT + ' est déjà pris (souvent par une autre copie de l’OS) : change "port" dans os-config.json (par exemple 50200), puis relance.'); process.exit(1); }
  throw e;
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`SM4RT Agentic OS v2  ->  http://localhost:${PORT}`);
  console.log(`livrables (l’anneau)  ->  ${ARTIFACTS}`);
  if (!workspaceRoot()) console.log('  Aucun workspace défini. Mets son chemin dans config/workspace.json ("root"), puis clique sur l’icône actualiser du second cerveau.');
  startEngine();
  if (needsFirstRefresh()) { console.log('  Première construction de ton second cerveau…'); refreshBrain().then(r => console.log('  Second cerveau ' + (r.ok ? 'prêt' : 'échec de l’actualisation à l’étape ' + (r.steps.find(s => !s.ok) || {}).step) + ' (' + Math.round(r.ms / 1000) + ' s)')); }
  cached('cal', 120000, getCalendar);
  if (EMAIL.enabled) { cached('mail', 180000, getEmail); setInterval(() => cached('mail', 1, getEmail), 170000); }
  setInterval(() => cached('cal', 1, getCalendar), 110000);
});

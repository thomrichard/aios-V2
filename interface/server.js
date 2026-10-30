/* ============================================================================
   SM4RT Agentic OS v2 - the local server
   One command starts everything:  node server.js
   It serves the homepage and the Second Brain, gives every widget its data, and starts the
   Second Brain engine (engine/server.js) beside it. Zero dependencies: node only.
   Settings live in os-config.json. Guides: README.md and the other .md files in this folder.

   Pages
     /                       the homepage plus the Second Brain (index.html, os.html, brain/, views/)
     /fichiers/              the file editor alone (also the Second Brain's Fichiers tab)
     /bibliotheque/          the asset library alone (also the Second Brain's Bibliothèque tab)
     /projets/               the project page alone (also the Second Brain's Projets tab)
     /competences/           the skills page alone (also the Second Brain's Skills tab)
     /connecteurs/           the connectors page alone (also the Second Brain's Connecteurs tab)
     /outbox/                the outbox page alone (also the Second Brain's Outbox tab)
     /orbite/                the 3D home alone (also the Second Brain's Orbes 3D tab, and the home page)
     /disque/                the rosace alone (also the Second Brain's Disque tab)
     /widgets                the widget library
     /artifacts/<file>       the ring's balls (the artifacts folder)
   Homepage feeds (GET)
     /api/calendar /api/email /api/stats /api/routines /api/artifacts /api/skills /api/apps
     /local/boot             all five homepage feeds in one answer, from memory
   Second Brain (GET, read only, through the engine)
     /local/search /local/meta /local/file   and /data/snapshot.js (this week's routines)
   File editor (the Fichiers tab, read here, no engine)
     /local/files            every file of the workspace with its header (GET)
     /local/files/read /local/files/raw /local/files/search   one file's text, an image, a search in the text (GET)
     /local/files/save       saves one file, then runs systeme/scripts/index.py (POST, local pages only)
     /local/assets           every image, font and PDF, with its line from _images.md (GET, the Bibliothèque tab)
   Project page (the Projets tab, GET; edits go through /local/files/save)
     /local/projets          every project with its header and progress
     /local/projets/lire     one project: its text, its parts, its links, its history (Git, journal/log.md)
     /local/projets/changements   the lines of a project changed since a date (git diff)
   Skills page (the Skills tab)
     /local/competences      every skill: its header, family, steps, journal, notes, uses, origin and usage (GET)
     /local/competences/retour    adds a note to a skill's feedback.md, the line /note writes (POST, local pages only)
   Connectors page (the Connecteurs tab, GET, read only)
     /local/connecteurs      every line of systeme/connexions.md with its usage and where it serves, the MCP servers called but not listed, and the Git history of the table
   Outbox page (the Outbox tab)
     /local/outbox           the files the agent wrote or changed in the last 7 days, by day, with their sessions, projects and validations (GET)
     /local/outbox/ranger    validates files (a line each in outbox/ranges.md) or puts them back (POST, local pages only)
   3D home (the Orbes 3D tab, GET, read only)
     /local/orbite           one level: the map (domains, top folders, skills, connectors) or a folder (its sub-folders, or its files)
     /local/orbite/fichier   one file for the side panel: header, start, links out and in
   Rosace (the Disque tab, GET, read only)
     /local/disque           one level: the map (domains, their indexes, the week's activity, the strongest links), a folder (its indexes and their freshness), or an index cut into groups by a header field (par=mois|statut|projet|type|liens|theme|echeance)
     /data/accueil.js        which home the shell opens: "orbite" (the 3D view) or "kit" (the kit's homepage), os-config.json "accueil"
   Actions (POST, local pages only)
     /api/run                runs a skills deck card through your agent's command (os-config.json "runner")
     /api/apply-comments     the "Apply all comments" runner that review pages call
     /api/open               opens a link, or a file inside your workspace, on this computer (reveal: shows it in the file manager)
     /api/app-open           a Micro Apps tile click: logs the open, says where to go
     /api/artifact-remove    right-click REMOVE on a ball (moves it to artifacts/_trash)
     /local/refresh          rebuilds the Second Brain's data (no model calls)
   ========================================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const crypto = require('crypto');
const { execFile, spawn } = require('child_process');

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) { console.error('\n  SM4RT Agentic OS a besoin de Node.js 18 ou plus récent. Tu as la version ' + process.version + '\n'); process.exit(1); }

const KIT = __dirname;
let CFG = {};
try { CFG = JSON.parse(fs.readFileSync(path.join(KIT, 'os-config.json'), 'utf8')); }
catch (e) { console.error('os-config.json manque ou n’est pas un JSON valide : réglages par défaut utilisés (' + e.message + ')'); }
const PORT = Number(process.env.PORT) || Number(CFG.port) || 50000;
/* AIOS: the home page: "orbite" (the 3D view of the indexes, the default) or "kit" (the kit's homepage, os.html) */
const ACCUEIL = CFG.accueil === 'kit' ? 'kit' : 'orbite';
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
const gwsParams = o => process.platform === 'win32' ? '"' + JSON.stringify(o).replace(/"/g, '\\"') + '"' : JSON.stringify(o);
const MAIL_CATS = { partenariat: 'partnerships', coaching: 'leads', perso: 'personal', autre: 'other' };
const AUTO_FROM = /no-?reply|notification|newsletter|mailer-daemon|do-?not-?reply/i;
function mailRules() {
  const root = workspaceRoot(); if (!root) return [];
  try {
    return fs.readFileSync(path.join(root, 'domaines', 'operations', 'mail-apprentissage.md'), 'utf8').split('\n')
      .map(l => l.match(/^\|\s*(expediteur|domaine|mot)\s*\|\s*(.+?)\s*\|\s*(partenariat|coaching|perso|autre)\s*\|/i))
      .filter(Boolean).map(m => ({ type: m[1].toLowerCase(), value: m[2].toLowerCase(), kind: MAIL_CATS[m[3].toLowerCase()] }));
  } catch (_) { return []; }
}
const learnedKind = (rules, addr, subject) => {
  const dom = addr.split('@')[1] || '', subj = subject.toLowerCase();
  const r = rules.find(x => (x.type === 'expediteur' && x.value === addr) || (x.type === 'domaine' && x.value === dom) || (x.type === 'mot' && subj.includes(x.value)));
  return r && r.kind;
};
function learnMail(q) {
  const scope = String(q.scope || ''), cat = String(q.cat || ''), value = String(q.value || '').trim().toLowerCase();
  if (!['expediteur', 'domaine', 'mot'].includes(scope) || !MAIL_CATS[cat]) throw new Error('règle inconnue');
  if (!value || value.length > 80 || /[|\n\r]/.test(value)) throw new Error('valeur refusée');
  const root = workspaceRoot(); if (!root) throw new Error('aucun workspace défini');
  const f = path.join(root, 'domaines', 'operations', 'mail-apprentissage.md');
  let txt = fs.readFileSync(f, 'utf8');
  const line = `| ${scope} | ${value} | ${cat} |`;
  if (!txt.split('\n').some(l => l.trim().toLowerCase() === line)) {
    txt = txt.replace(/\n*$/, '\n') + line + '\n';
    txt = txt.replace(/^maj: .*$/m, 'maj: ' + new Date().toISOString().slice(0, 10));
    fs.writeFileSync(f, txt);
  }
  cache.delete('mail');
  return { ok: true, rule: line };
}
async function getEmail() {
  if (!EMAIL.enabled) return { needsSetup: true };
  const cli = /^[A-Za-z0-9._-]+$/.test(EMAIL.command || 'gws') ? (EMAIL.command || 'gws') : 'gws';
  const list = jsonFrom(await run(cli, ['gmail', 'users', 'messages', 'list', '--params', gwsParams({ userId: 'me', q: 'newer_than:1d -category:promotions', maxResults: 40 })]));
  const ids = (list.messages || []).slice(0, 18).map(m => m.id).filter(id => /^[A-Za-z0-9]+$/.test(id));
  const rows = [], rules = mailRules(), doubts = [];
  for (const id of ids) {
    try {
      const m = jsonFrom(await run(cli, ['gmail', 'users', 'messages', 'get', '--params', gwsParams({ userId: 'me', id, format: 'metadata' })], 25000));
      const h = {}; (m.payload?.headers || []).forEach(x => h[x.name.toLowerCase()] = x.value);
      const subject = h.subject || '(sans objet)', rawFrom = h.from || '';
      const addr = ((rawFrom.match(/<([^>]+)>/) || [])[1] || rawFrom).trim().toLowerCase();
      let kind = learnedKind(rules, addr, subject);
      if (!kind) kind = PARTNER_HINTS.test(subject) ? 'partnerships' : LEAD_HINTS.test(subject) ? 'leads' : PERSONAL_FROM.test(rawFrom) ? 'personal' : 'other';
      if (!kind || (kind === 'other' && !learnedKind(rules, addr, subject) && !h['list-unsubscribe'] && !AUTO_FROM.test(addr))) doubts.push({ id, subject, from: rawFrom.replace(/"/g, '').trim(), addr });
      rows.push({ id, subject, from: rawFrom.replace(/<.*/, '').replace(/"/g, '').trim(), unread: (m.labelIds || []).includes('UNREAD'), kind, ts: +(m.internalDate || 0), snippet: (m.snippet || '').slice(0, 90) });
    } catch (_) { }
  }
  try { fs.writeFileSync(path.join(SNAP, 'mail-doutes.json'), JSON.stringify({ fetched: new Date().toISOString(), doubts }, null, 2)); } catch (_) { }
  const count = k => rows.filter(r => r.kind === k).length;
  return { fetched: new Date().toISOString(), total: list.resultSizeEstimate || rows.length, unread: rows.filter(r => r.unread).length,
    flagged: rows.filter(r => r.kind === 'partnerships' || r.kind === 'leads').slice(0, 6), doubts: doubts.length, doubtList: doubts.slice(0, 5).map(d => ({ id: d.id, subject: d.subject, from: d.from.replace(/<.*/, '').trim(), addr: d.addr })), mix: { partnerships: count('partnerships'), leads: count('leads'), personal: count('personal'), other: count('other') } };
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
function openTarget(target, reveal = false) {
  let t = String(target || '').trim();
  if (!t) throw new Error('aucune cible');
  if (/^https?:\/\//i.test(t)) { if (reveal) throw new Error('un lien ne se montre pas dans le Finder'); new URL(t); return launch(t); }
  if (/^file:\/\//i.test(t)) t = decodeURIComponent(new URL(t).pathname).replace(/^\/([A-Za-z]:)/, '$1');
  const root = workspaceRoot();
  const abs = path.isAbsolute(t) ? path.resolve(t) : root ? path.resolve(root, t) : null;
  if (!abs) throw new Error('hors de ton workspace');
  const allowed = [root, KIT, ARTIFACTS].filter(Boolean).some(r => abs === r || abs.startsWith(r + path.sep));
  if (!allowed) throw new Error('seuls les fichiers de ton workspace, du dossier de l’OS ou du dossier des livrables s’ouvrent d’ici');
  if (!fs.existsSync(abs)) throw new Error('introuvable');
  /* showing a program in its folder runs nothing, so only opening it is refused */
  if (!reveal && EXEC_EXT.test(abs)) throw new Error('les programmes ne s’ouvrent pas depuis l’OS');
  return launch(abs, reveal);
}
function launch(t, reveal = false) {
  /* reveal: the file selected in its folder (Finder, Explorer); on Linux there is no standard way to select, so the folder opens */
  const [cmd, args] = reveal ? (process.platform === 'win32' ? ['explorer.exe', ['/select,' + t.replace(/\//g, '\\')]] : process.platform === 'darwin' ? ['open', ['-R', t]] : ['xdg-open', [path.dirname(t)]])
    : process.platform === 'win32' ? ['explorer.exe', [t.replace(/\//g, /^https?:/i.test(t) ? '/' : '\\')]] : process.platform === 'darwin' ? ['open', [t]] : ['xdg-open', [t]];
  spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: false }).on('error', () => { }).unref();
  return t;
}

/* ---------------------------- MICRO APPS ---------------------------- */
async function appsWithStatus() {
  return Promise.all(microApps.list().map(async a => ({ id: a.id, name: a.name, desc: a.desc, icon: a.icon, builtIn: a.builtIn, live: a.port ? await portOpen(a.port) : true })));
}

/* ---------------------------- FILES: the editor (fichiers/) ----------------------------
   AIOS: the Fichiers tab lists every file of the workspace with its header, opens one, searches the text
   and saves an edit. It never touches a file outside the workspace, in a hidden folder, in this OS folder,
   or that looks like a secret. A save refuses a file that index.py generates and a file that changed on disk
   since it was opened, then runs systeme/scripts/index.py so the indexes and views follow. */
const FILES_SKIP = new Set(['node_modules', '__pycache__', 'venv', 'os-runs']);
const FILES_MAX = 20000, READ_MAX = 900 * 1024, RAW_MAX = 25 * 1024 * 1024;
const TEXT_EXT = new Set(['.md', '.markdown', '.txt', '.json', '.jsonl', '.js', '.mjs', '.cjs', '.ts', '.html', '.htm', '.css', '.py', '.yaml', '.yml', '.toml', '.csv', '.tsv', '.xml',
  '.sh', '.bat', '.ps1', '.log', '.vtt', '.srt', '.ini', '.cfg', '.sql', '']);
const IMAGE_TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.bmp': 'image/bmp', '.ico': 'image/x-icon' };
const kindOf = rel => { const ext = path.extname(rel).toLowerCase(); return ext === '.md' || ext === '.markdown' ? 'md' : TEXT_EXT.has(ext) ? 'text' : IMAGE_TYPES[ext] ? 'image' : 'other'; };
/* the files systeme/scripts/index.py writes: an edit there would be overwritten at its next run */
const generatedFile = rel => /(^|\/)_index\.md$/.test(rel) || rel.startsWith('vues/') || rel === 'outbox/index.html';
const sha1 = buf => crypto.createHash('sha1').update(buf).digest('hex');
const httpError = (status, message) => Object.assign(new Error(message), { status });
/* the same reading as lire_entete in index.py: the lines between two ---, "key: value", [a, b] lists */
function readHeader(text) {
  const lines = text.split(/\r?\n/), out = {};
  if (!lines.length || lines[0].trim() !== '---') return out;
  for (const line of lines.slice(1)) {
    if (line.trim() === '---') break;
    if (!line.includes(':') || /^[ \t-]/.test(line)) continue;
    const i = line.indexOf(':');
    let v = line.slice(i + 1).split(' #')[0].trim().replace(/^["']|["']$/g, '');
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean).join(', ');
    out[line.slice(0, i).trim()] = v;
  }
  return out;
}
function editorTarget(rel, mustExist = true) {
  const root = workspaceRoot();
  if (!root) throw httpError(400, 'Aucun workspace défini (config/workspace.json)');
  const clean = String(rel || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const abs = inside(root, clean);
  if (!abs || abs === root) throw httpError(404, 'Introuvable');
  const r = path.relative(root, abs).split(path.sep).join('/');
  if (abs === KIT || abs.startsWith(KIT + path.sep) || r.split('/').some(s => s.startsWith('.') || FILES_SKIP.has(s))) throw httpError(403, 'Ce fichier n’est pas dans ceux de l’éditeur');
  if (scan.isSecret(r)) throw httpError(403, 'Ce fichier ressemble à un secret : l’éditeur ne l’ouvre pas');
  if (!mustExist) return { abs, rel: r, root };
  /* the same checks on the real path: a link, or other capitals on a Mac, never reach past them */
  let real; try { real = fs.realpathSync.native(abs); } catch (_) { throw httpError(404, 'Introuvable'); }
  const realRoot = fs.realpathSync.native(root), realKit = fs.realpathSync.native(KIT);
  if (!real.startsWith(realRoot + path.sep)) throw httpError(403, 'Ce fichier mène hors du workspace');
  const rr = path.relative(realRoot, real).split(path.sep).join('/');
  if (real === realKit || real.startsWith(realKit + path.sep) || rr.split('/').some(s => s.startsWith('.') || FILES_SKIP.has(s))) throw httpError(403, 'Ce fichier n’est pas dans ceux de l’éditeur');
  if (scan.isSecret(rr)) throw httpError(403, 'Ce fichier ressemble à un secret : l’éditeur ne l’ouvre pas');
  const st = fs.statSync(real);
  if (!st.isFile()) throw httpError(400, 'Ce n’est pas un fichier');
  return { abs: real, rel: r, root, st };
}
/* headers are read again only when a file's date or size changes */
const headerCache = new Map();
function listFiles() {
  const root = workspaceRoot();
  if (!root) return { error: 'Aucun workspace défini (config/workspace.json)', files: [], dirs: [] };
  const files = [], dirs = [], seen = new Set();
  const walk = (dir, rel) => {
    let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const e of entries) {
      if (files.length >= FILES_MAX) return;
      if (e.name.startsWith('.') || FILES_SKIP.has(e.name) || e.isSymbolicLink()) continue;
      const abs = path.join(dir, e.name), r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) { if (abs === KIT) continue; dirs.push(r); walk(abs, r); continue; }
      if (!e.isFile() || scan.isSecret(r)) continue;
      let st; try { st = fs.statSync(abs); } catch (_) { continue; }
      const k = kindOf(r), f = { p: r, s: st.size, m: Math.round(st.mtimeMs), k };
      if (generatedFile(r)) f.g = 1;
      if (k === 'md' && st.size <= READ_MAX) {
        let hit = headerCache.get(r);
        if (!hit || hit.m !== f.m || hit.s !== f.s) {
          let text = ''; try { text = fs.readFileSync(abs, 'utf8'); } catch (_) { }
          const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '');
          hit = { m: f.m, s: f.s, h: readHeader(text), t: ((body.match(/^#\s+(.+)$/m) || [])[1] || '').trim().slice(0, 160) };
          headerCache.set(r, hit);
        }
        if (Object.keys(hit.h).length) f.h = hit.h;
        if (hit.t) f.t = hit.t;
      }
      seen.add(r); files.push(f);
    }
  };
  walk(root, '');
  for (const k of headerCache.keys()) if (!seen.has(k)) headerCache.delete(k);
  return { root, files, dirs, truncated: files.length >= FILES_MAX };
}
function readForEditor(rel) {
  const t = editorTarget(rel), kind = kindOf(t.rel);
  const base = { path: t.rel, kind, size: t.st.size, mtime: Math.round(t.st.mtimeMs), generated: generatedFile(t.rel) };
  if (kind !== 'md' && kind !== 'text') return base;
  if (t.st.size > READ_MAX) return { ...base, tooBig: true };
  const buf = fs.readFileSync(t.abs), content = buf.toString('utf8');
  /* a file that is not UTF-8 would come back damaged: it opens read only */
  const utf8 = Buffer.from(content, 'utf8').equals(buf);
  return { ...base, content, hash: sha1(buf), editable: !base.generated && utf8, notUtf8: !utf8 || undefined };
}
/* a search in the text of every Markdown and text file: accents and case do not count */
const fold = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function searchFiles(q) {
  const needle = fold(String(q || '').trim()).slice(0, 200);
  if (needle.length < 2) return { q, results: [] };
  const { root, files } = listFiles(), results = [];
  for (const f of files) {
    if ((f.k !== 'md' && f.k !== 'text') || f.s > READ_MAX) continue;
    let text; try { text = fs.readFileSync(path.join(root, f.p), 'utf8'); } catch (_) { continue; }
    const folded = fold(text);
    let at = folded.indexOf(needle);
    if (at < 0) continue;
    let n = 0; for (let i = at; i >= 0 && n < 99; i = folded.indexOf(needle, i + needle.length)) n++;
    /* the line of the first hit; folding keeps one character per character for the letters used here */
    const line = folded.slice(0, at).split('\n').length, raw = text.split(/\r?\n/)[line - 1] || '', col = fold(raw).indexOf(needle);
    const from = Math.max(0, col - 50), snippet = (from ? '…' : '') + raw.slice(from, from + 150).trim() + (raw.length > from + 150 ? '…' : '');
    results.push({ p: f.p, line, n, text: snippet });
    if (results.length >= 80) break;
  }
  return { q, results };
}
/* index.py after each save of a Markdown file, one run at a time */
let indexChain = Promise.resolve();
function runIndex(root) {
  const script = path.join(root, 'systeme', 'scripts', 'index.py');
  if (!fs.existsSync(script)) return Promise.resolve({ ran: false });
  const pythons = process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python'];
  const attempt = i => new Promise(ok => execFile(pythons[i], [script], { cwd: root, timeout: 30000, windowsHide: true }, (err, stdout, stderr) => {
    if (err && err.code === 'ENOENT' && i + 1 < pythons.length) return ok(attempt(i + 1));
    ok(err ? { ran: true, ok: false, message: String(err.code === 'ENOENT' ? 'Python introuvable' : (stderr || err.message)).trim().slice(0, 300) } : { ran: true, ok: true, message: String(stdout).trim().slice(0, 300) });
  }));
  const job = indexChain.then(() => attempt(0));
  indexChain = job.catch(() => { });
  return job;
}
async function saveFile({ path: rel, content, base, force }) {
  if (typeof content !== 'string') throw httpError(400, 'Rien à enregistrer');
  const t = editorTarget(rel), kind = kindOf(t.rel);
  if (kind !== 'md' && kind !== 'text') throw httpError(400, 'Ce fichier ne se modifie pas dans l’éditeur');
  if (generatedFile(t.rel)) throw httpError(403, 'Ce fichier est généré par systeme/scripts/index.py : modifie plutôt les fichiers dont il vient');
  const current = fs.readFileSync(t.abs), currentHash = sha1(current);
  if (!Buffer.from(current.toString('utf8'), 'utf8').equals(current)) throw httpError(400, 'Ce fichier n’est pas en UTF-8 : l’éditeur ne l’enregistre pas, pour ne pas l’abîmer');
  if (!force && base !== currentHash) return { conflict: true, hash: currentHash, mtime: Math.round(t.st.mtimeMs) };
  const buf = Buffer.from(content, 'utf8');
  if (sha1(buf) !== currentHash) {
    /* written beside it, then put in its place: a cut-off write never leaves half a file */
    const tmp = path.join(path.dirname(t.abs), '.' + path.basename(t.abs) + '.' + process.pid + '.tmp');
    fs.writeFileSync(tmp, buf, { mode: t.st.mode & 0o777 });
    try { fs.renameSync(tmp, t.abs); } catch (e) { try { fs.unlinkSync(tmp); } catch (_) { } throw e; }
  }
  const index = kind === 'md' ? await runIndex(t.root) : { ran: false };
  const after = fs.readFileSync(t.abs), st = fs.statSync(t.abs), hash = sha1(after);
  /* index.py may rewrite this very file (the generated blocks of AGENTS.md): send the new text back */
  return { ok: true, path: t.rel, hash, mtime: Math.round(st.mtimeMs), index, content: hash !== sha1(buf) ? after.toString('utf8') : undefined };
}
function serveRaw(req, res, rel) {
  const t = editorTarget(rel), type = RAW_TYPES[path.extname(t.rel).toLowerCase()];
  if (!type) throw httpError(400, 'Seuls les images, les polices et les PDF s’affichent ici');
  if (t.st.size > RAW_MAX) throw httpError(413, 'Fichier trop lourd pour l’aperçu');
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': t.st.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" });
  fs.createReadStream(t.abs).pipe(res);
}

/* ---------------------------- ASSETS: the library (bibliotheque/) ----------------------------
   AIOS: the Bibliothèque tab shows every image, font and PDF of the workspace (archives aside), read only.
   Each one gets its line from the _images.md of its folder (what it shows, where it comes from, what it is for):
   a table whose first cell names the file between backticks. */
const ASSET_TYPES = { '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.pdf': 'application/pdf' };
const RAW_TYPES = { ...IMAGE_TYPES, ...ASSET_TYPES };
const assetKind = rel => { const ext = path.extname(rel).toLowerCase(); return ext === '.svg' ? 'svg' : IMAGE_TYPES[ext] ? 'image' : ext === '.pdf' ? 'pdf' : ASSET_TYPES[ext] ? 'font' : ''; };
const imageLines = new Map();
function readImageIndex(root, rel, f) {
  let hit = imageLines.get(rel);
  if (hit && hit.m === f.m && hit.s === f.s) return hit.rows;
  const rows = {}, dir = rel.split('/').slice(0, -1).join('/');
  let text = ''; try { text = fs.readFileSync(path.join(root, rel), 'utf8'); } catch (_) { }
  for (const line of text.split(/\r?\n/)) {
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    const name = ((cells[0] || '').match(/^`([^`]+)`$/) || [])[1];
    if (!name || cells.length < 2) continue;
    rows[(dir ? dir + '/' : '') + name.replace(/^\.\//, '')] = { d: cells[1] || '', o: cells[2] || '', u: cells[3] || '' };
  }
  imageLines.set(rel, { m: f.m, s: f.s, rows });
  return rows;
}
function listAssets() {
  const { root, files, error } = listFiles();
  if (error) return { error, assets: [] };
  const lines = {}, assets = [], indexes = [];
  for (const f of files) if (/(^|\/)_images\.md$/.test(f.p)) { indexes.push(f.p); Object.assign(lines, readImageIndex(root, f.p, f)); }
  for (const f of files) {
    const k = assetKind(f.p);
    if (!k || f.p.startsWith('archives/')) continue;
    const a = { p: f.p, s: f.s, m: f.m, k }, l = lines[f.p];
    if (l) Object.assign(a, l);
    assets.push(a);
  }
  return { root, assets, indexes };
}

/* ---------------------------- PROJETS: the project page (projets/) ----------------------------
   AIOS: the Projets tab reads each project file (header type: projet): its header and its parts, ## Jalons,
   ## Tâches, ## Décisions, ## Livrables and ## Sources (## Fichiers, the part of older files, reads as sources).
   Every item keeps its line number: the page edits the Markdown there and saves it through /local/files/save,
   so the same checks apply. The history comes from Git and journal/log.md, the lines changed since a reading
   from git diff. Without Git, the page simply has no history. */
const PART_KEYS = [['jalon', 'jalons'], ['tache', 'taches'], ['decision', 'decisions'], ['livrable', 'livrables'], ['source', 'sources'], ['fichier', 'sources']];
const LIVRABLE_ETATS = { 'a venir': 'a-venir', 'en cours': 'en-cours', 'a valider': 'a-valider', 'livre': 'livre' };
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
/* a line of the template still waiting for its text: <un jalon>, [<nom>](<chemin>) */
const placeholder = s => /^<[^>]*>$/.test(s.trim()) || /\]\(<[^>]*>\)/.test(s) || /^\[<[^>]*>\]/.test(s.trim());
function splitLink(text) {
  const m = /^\[([^\]]+)\]\(([^)\s]+)\)\s*(.*)$/.exec(text.trim());
  if (m) return { nom: m[1].trim(), cible: m[2].trim(), reste: m[3].replace(/^·\s*/, '').trim() };
  const parts = text.split(/\s+·\s+/), first = parts[0].trim();
  const looksLike = /^https?:\/\//i.test(first) || /[\\/]|\.[a-z0-9]{1,5}$/i.test(first);
  return { nom: looksLike ? first.split('/').pop() : first, cible: looksLike ? first : '', reste: parts.slice(1).join(' · ').trim() };
}
function parseProject(text) {
  const lines = text.split('\n').map(l => l.replace(/\r$/, ''));
  let i = 0, bodyStart = 0;
  if ((lines[0] || '').trim() === '---') { for (i = 1; i < lines.length && lines[i].trim() !== '---'; i++); bodyStart = Math.min(i + 1, lines.length); }
  const out = { header: readHeader(text), titre: '', titreLigne: -1, intro: '', parties: [], jalons: [], taches: [], decisions: [], livrables: [], sources: [] };
  const intro = [];
  let part = null;
  for (let n = bodyStart; n < lines.length; n++) {
    const line = lines[n];
    const h1 = /^#\s+(.+?)\s*#*\s*$/.exec(line), h2 = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (h1 && !out.titre) { out.titre = h1[1]; out.titreLigne = n; continue; }
    if (h2) {
      const name = fold(h2[1]), hit = PART_KEYS.find(([k]) => name.startsWith(k));
      part = { nom: h2[1], cle: hit ? hit[1] : '', ligne: n, fin: lines.length };
      if (out.parties.length) out.parties[out.parties.length - 1].fin = n;
      out.parties.push(part);
      continue;
    }
    if (/^#{3,}\s/.test(line) && part) continue;
    if (!part) { if (out.titre && line.trim()) intro.push(line.trim()); continue; }
    /* a task written indented under a milestone belongs to it: the milestone's progress is then counted */
    const sous = /^(?:\t| {2,})[-*+]\s+\[([ xX])\]\s+(.*)$/.exec(line);
    if (sous && part.cle === 'jalons' && out.jalons.length && sous[2].trim() && !placeholder(sous[2])) {
      out.jalons[out.jalons.length - 1].taches.push({ ligne: n, fait: sous[1] !== ' ', texte: sous[2].trim() });
      part.dernier = n;
      continue;
    }
    const item = /^( ?)[-*+]\s+(?:\[([ xX])\]\s+)?(.*)$/.exec(line);
    if (!item || !part.cle) continue;
    const box = item[2], body = item[3].trim();
    if (!body || placeholder(body)) continue;
    part.dernier = n;
    if (part.cle === 'jalons') {
      const bits = body.split(/\s+·\s+/), j = { ligne: n, nom: bits[0].trim(), fait: box === 'x' || box === 'X', pct: null, date: '', taches: [] };
      for (const b of bits.slice(1)) { const t = b.trim(), p = /^(\d{1,3})\s*%$/.exec(t); if (p) j.pct = Math.min(100, Number(p[1])); else if (DATE_RE.test(t)) j.date = t; }
      if (j.fait) j.pct = 100;
      out.jalons.push(j);
    } else if (part.cle === 'taches') {
      if (box === undefined) continue;
      out.taches.push({ ligne: n, fait: box === 'x' || box === 'X', texte: body });
    } else if (part.cle === 'decisions') {
      const bits = body.split(/\s+·\s+/), d = { ligne: n, date: '', texte: '', pourquoi: '', ecarte: '' }, rest = [];
      if (DATE_RE.test(bits[0].trim())) d.date = bits.shift().trim();
      for (const b of bits) {
        const t = b.trim(), w = /^pourquoi\s*:\s*(.*)$/i.exec(t), e = /^(?:écarté|ecarte|écarte)\s*:\s*(.*)$/i.exec(t);
        if (w) d.pourquoi = w[1]; else if (e) d.ecarte = e[1]; else rest.push(t);
      }
      d.texte = rest.join(' · ');
      out.decisions.push(d);
    } else {
      const l = splitLink(body), bits = l.reste ? l.reste.split(/\s+·\s+/) : [], x = { ligne: n, nom: l.nom, cible: l.cible, etat: '', note: '' }, notes = [];
      for (const b of bits) { const k = LIVRABLE_ETATS[fold(b.trim())]; if (k && part.cle === 'livrables') x.etat = k; else if (b.trim()) notes.push(b.trim()); }
      x.note = notes.join(' · ');
      out[part.cle].push(x);
    }
  }
  out.intro = intro.join(' ');
  for (const j of out.jalons) if (j.taches.length) { j.auto = true; j.pct = j.fait ? 100 : Math.round(100 * j.taches.filter(t => t.fait).length / j.taches.length); }
  const marks = out.jalons.length ? out.jalons.map(j => j.pct || 0) : null;
  out.avancement = marks ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : out.taches.length ? Math.round(100 * out.taches.filter(t => t.fait).length / out.taches.length) : null;
  return out;
}
/* the statuses of a project, and the ones that end it, as systeme/metadonnees.md says */
function projectStatuses(root) {
  let text = ''; try { text = fs.readFileSync(path.join(root, 'systeme', 'metadonnees.md'), 'utf8'); } catch (_) { }
  let cols = null;   /* the table of types: the one whose head has Statuts and Fin */
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) { cols = null; continue; }
    const c = line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
    if (c.includes('Statuts') && c.includes('Fin')) { cols = { s: c.indexOf('Statuts'), f: c.indexOf('Fin') }; continue; }
    if (cols && c[0] === 'projet') return { statuts: c[cols.s].split(',').map(s => s.trim()).filter(Boolean), fin: c[cols.f].split(',').map(s => s.trim()).filter(Boolean) };
  }
  return { statuts: ['actif', 'bloque', 'clos', 'abandonne'], fin: ['clos', 'abandonne'] };
}
const projectCache = new Map();
function projectOf(root, f) {
  let hit = projectCache.get(f.p);
  if (!hit || hit.m !== f.m || hit.s !== f.s) {
    let text = ''; try { text = fs.readFileSync(path.join(root, f.p), 'utf8'); } catch (_) { }
    hit = { m: f.m, s: f.s, d: parseProject(text) };
    projectCache.set(f.p, hit);
  }
  return hit.d;
}
/* projects live in projets/, as index.py reads them (the template in systeme/gabarits/ is not one) */
const isProject = f => f.k === 'md' && f.p.startsWith('projets/') && f.h && f.h.type === 'projet' && !/(^|\/)_index\.md$/.test(f.p);
const slugOf = rel => rel.split('/').pop().replace(/\.md$/i, '');
function listProjects() {
  const { root, files, error } = listFiles();
  if (error) return { error, projets: [] };
  const projets = files.filter(isProject).map(f => {
    const d = projectOf(root, f);
    return {
      path: f.p, slug: slugOf(f.p), titre: d.titre || f.t || slugOf(f.p), statut: d.header.statut || '', domaine: d.header.domaine || '',
      echeance: d.header.echeance || '', resume: d.header.resume || '', prochaine: d.header.prochaine_etape || '', maj: d.header.maj || '', m: f.m,
      avancement: d.avancement, ...(all => ({ taches: all.length, faites: all.filter(t => t.fait).length }))([...d.taches, ...d.jalons.flatMap(j => j.taches)]), jalons: d.jalons.length,
      aValider: d.livrables.filter(l => l.etat === 'a-valider').length
    };
  });
  return { root, projets, ...projectStatuses(root) };
}
/* a link of the project to a file of the workspace or to the web: what the page shows for it */
const VIDEO_HOSTS = /(^|\.)(youtube\.com|youtu\.be|vimeo\.com|loom\.com|tiktok\.com|instagram\.com)$/i;
function plainExcerpt(text, max = 280) {
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '').replace(/^#\s+.*$/m, '');
  return body.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#>*_`|]/g, ' ').replace(/^\s*[-+]\s+(\[[ xX]\]\s+)?/gm, '').replace(/\s+/g, ' ').trim().slice(0, max);
}
function resolveLink(projectRel, cible) {
  if (!cible) return { genre: 'texte' };
  if (/^https?:\/\//i.test(cible)) {
    let host = ''; try { host = new URL(cible).hostname.replace(/^www\./, ''); } catch (_) { }
    return { genre: VIDEO_HOSTS.test(host) ? 'video' : 'lien', url: cible, hote: host };
  }
  const clean = cible.split('#')[0].replace(/^<|>$/g, '');
  let decoded = clean; try { decoded = decodeURIComponent(clean); } catch (_) { }
  const tries = [path.posix.normalize(path.posix.join(path.posix.dirname(projectRel), decoded)), path.posix.normalize(decoded.replace(/^\/+/, ''))];
  for (const rel of tries) {
    if (rel.startsWith('..')) continue;
    let t; try { t = editorTarget(rel); } catch (_) { continue; }
    const kind = kindOf(t.rel), out = { genre: kind === 'image' ? 'image' : kind === 'md' ? 'md' : 'fichier', chemin: t.rel, mtime: Math.round(t.st.mtimeMs) };
    if (kind === 'md' && t.st.size <= READ_MAX) {
      const text = fs.readFileSync(t.abs, 'utf8'), h = readHeader(text);
      out.titre = ((text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '').match(/^#\s+(.+)$/m) || [])[1] || '').trim();
      out.resume = h.resume || ''; out.extrait = plainExcerpt(text);
    }
    return out;
  }
  return { genre: 'absent', chemin: decoded };
}
function gitRun(root, args, ms = 8000) {
  return new Promise(ok => execFile('git', ['-C', root, ...args], { timeout: ms, maxBuffer: 8 * 1024 * 1024, windowsHide: true }, (err, stdout) => ok(err ? null : String(stdout))));
}
/* the project's history: its commits (the project file and the files it links), what is not committed yet,
   and the lines of journal/log.md that name it */
async function projectHistory(root, rel, slug, linked) {
  const files = [rel, ...linked], fil = [];
  const inRepo = (await gitRun(root, ['rev-parse', '--is-inside-work-tree'])) !== null;
  if (inRepo) {
    const log = await gitRun(root, ['log', '-n', '40', '--date=iso-strict', '--format=%x1e%H%x1f%aI%x1f%an%x1f%s', '--name-only', '--', ...files]);
    for (const rec of (log || '').split('\x1e').slice(1)) {
      const [head, ...rest] = rec.split('\n'), [hash, date, auteur, message] = head.split('\x1f');
      fil.push({ source: 'git', hash: (hash || '').slice(0, 9), date, auteur, message, fichiers: rest.map(s => s.trim()).filter(Boolean) });
    }
    const status = await gitRun(root, ['status', '--porcelain', '--', ...files]);
    const changed = (status || '').split('\n').map(s => s.slice(3).trim()).filter(Boolean);
    if (changed.length) {
      let last = 0; for (const c of changed) { try { last = Math.max(last, fs.statSync(path.join(root, c)).mtimeMs); } catch (_) { } }
      fil.push({ source: 'local', date: new Date(last || Date.now()).toISOString(), auteur: '', message: 'Modifications pas encore enregistrées dans Git', fichiers: changed });
    }
  }
  let journal = ''; try { journal = fs.readFileSync(path.join(root, 'journal', 'log.md'), 'utf8'); } catch (_) { }
  const word = new RegExp('(^|[^a-z0-9-])' + slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9-]|$)', 'i');
  for (const line of journal.split(/\r?\n/)) {
    const m = /^-\s+(\d{4}-\d{2}-\d{2})\s*·\s*(.+)$/.exec(line.trim());
    if (m && word.test(m[2])) fil.push({ source: 'journal', date: m[1], auteur: '', message: m[2] });
  }
  fil.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return { git: inRepo, fil: fil.slice(0, 40) };
}
async function readProject(rel) {
  const t = editorTarget(rel);
  if (kindOf(t.rel) !== 'md') throw httpError(400, 'Ce n’est pas une fiche Markdown');
  const doc = readForEditor(t.rel), d = parseProject(doc.content || '');
  if (d.header.type !== 'projet') throw httpError(400, 'Ce fichier n’est pas un projet (type: projet)');
  const slug = slugOf(t.rel);
  for (const x of [...d.livrables, ...d.sources]) Object.assign(x, resolveLink(t.rel, x.cible));
  const listed = new Set([...d.livrables, ...d.sources].map(x => x.chemin).filter(Boolean));
  const { files } = listFiles(), lies = [];
  for (const f of files) {
    if (f.p === t.rel || listed.has(f.p) || !f.h || f.p.startsWith('archives/')) continue;
    if (!String(f.h.projet || '').split(',').map(s => s.trim()).includes(slug)) continue;
    lies.push({ chemin: f.p, titre: f.t || baseNameOf(f.p), type: f.h.type || '', statut: f.h.statut || '', resume: f.h.resume || '', inbox: f.p.startsWith('inbox/'), m: f.m });
  }
  const linked = [...listed].filter(p => !generatedFile(p));
  const history = await projectHistory(t.root, t.rel, slug, linked);
  return { ...doc, slug, projet: d, lies, ...history, ...projectStatuses(t.root) };
}
const baseNameOf = p => p.split('/').pop();
/* the lines of the project file that changed since a date: git diff against the last commit before it,
   working copy included. A file born after that date is new from top to bottom. */
async function projectChanges(rel, since) {
  const t = editorTarget(rel), when = new Date(String(since || ''));
  if (isNaN(when)) throw httpError(400, 'Date de lecture illisible');
  if ((await gitRun(t.root, ['rev-parse', '--is-inside-work-tree'])) === null) return { git: false, lignes: [] };
  const rev = ((await gitRun(t.root, ['rev-list', '-1', '--before=' + when.toISOString(), 'HEAD', '--', t.rel])) || '').trim();
  if (!rev) {
    const born = ((await gitRun(t.root, ['log', '--format=%aI', '--diff-filter=A', '--', t.rel])) || '').trim().split('\n').pop();
    return born && new Date(born) > when ? { git: true, tout: true, lignes: [] } : { git: true, lignes: [] };
  }
  const diff = (await gitRun(t.root, ['diff', '-U0', '--no-color', rev, '--', t.rel])) || '', lignes = [];
  for (const m of diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(m[1]), count = m[2] === undefined ? 1 : Number(m[2]);
    for (let k = 0; k < count; k++) lignes.push(start - 1 + k);
  }
  return { git: true, depuis: rev.slice(0, 9), lignes };
}

/* ---------------------------- SKILLS: the skills page (competences/) ----------------------------
   AIOS: the Skills tab reads every skills/<nom>/SKILL.md: its header (name, description with its « Déclencheurs »,
   and the famille under metadata:), its steps and its ## Journal des changements; then its feedback.md (the notes
   put aside by /note), the families of systeme/metadonnees.md, where it serves (the steps of processus/*.md, the
   Skill column of systeme/routines.md), whether it comes from the socle (git ls-tree socle/main, when that remote
   exists) and its usage (data/arms-usage.json, written by refresh/usage.mjs). Read only, but for one action: a note
   added to feedback.md, the line /note writes. */
const SKILL_MAX_LINES = 60;
const cellsOf = line => line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
const isRule = c => /^[-: ]*$/.test(c[0] || '-');
const unquote = s => s.replace(/`/g, '').trim();
/* every Markdown table of a file whose first column has this title, end to end: a list of {column: text} */
function tablesOf(text, first) {
  const rows = []; let cols = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) { cols = null; continue; }
    const c = cellsOf(line);
    if (!cols) { cols = c[0] === first ? c : []; continue; }
    if (cols.length && !isRule(c)) rows.push(Object.fromEntries(cols.map((k, i) => [k, c[i] || ''])));
  }
  return rows;
}
const readText = f => { try { return fs.readFileSync(f, 'utf8'); } catch (_) { return ''; } };
function skillFamilies(root) {
  const seen = new Map();
  for (const r of tablesOf(readText(path.join(root, 'systeme', 'metadonnees.md')), 'Famille')) {
    const id = unquote(r.Famille || '');
    if (id && !/^</.test(id) && !seen.has(id)) seen.set(id, { id, nom: r.Nom || id, couvre: r['Ce qu’elle regroupe'] || r["Ce qu'elle regroupe"] || '' });
  }
  return [...seen.values()];
}
/* the header of a SKILL.md: name, description, and famille wherever it sits (under metadata: or not) */
function skillHeader(text) {
  const lines = text.split(/\r?\n/), h = {};
  if ((lines[0] || '').trim() !== '---') return h;
  for (const line of lines.slice(1)) {
    if (line.trim() === '---') break;
    const m = /^(\s*)([A-Za-z_-]+):\s*(.*)$/.exec(line);
    if (!m) continue;
    const v = m[3].split(' #')[0].trim().replace(/^["']|["']$/g, '');
    if (!m[1] && (m[2] === 'name' || m[2] === 'description')) h[m[2]] = v;
    if (m[2] === 'famille') h.famille = v;
  }
  return h;
}
/* « … Déclencheurs : « a », « b ». » → the text before, and each quoted trigger */
function splitDescription(desc) {
  const i = desc.search(/D[ée]clencheurs?\s*:/i);
  if (i < 0) return { resume: desc, declencheurs: [] };
  const declencheurs = [...desc.slice(i).matchAll(/«\s*([^»]+?)\s*»/g)].map(m => m[1]);
  return { resume: desc.slice(0, i).trim(), declencheurs };
}
/* the lines of a part (## Titre) of a Markdown text, or null */
function partOf(body, re) {
  const lines = body.split(/\r?\n/), out = []; let on = false;
  for (const line of lines) {
    if (/^##\s/.test(line)) { if (on) break; on = re.test(line.replace(/^##\s+/, '').trim()); continue; }
    if (on) out.push(line);
  }
  return on || out.length ? out : null;
}
/* the steps: the numbered list of ## Étapes; else the parts of the skill (## 1. L'inventaire, ## Noter…), the
   guard rails, references and journal aside; else its first numbered list */
const META_PART = /^(garde-fous|r[ée]f[ée]rences?|journal des changements|retours|exemples?|sources?)\b/i;
function skillSteps(body) {
  const pick = lines => { const out = []; for (const l of lines) { const m = /^\d+\.\s+(.*)$/.exec(l); if (m) out.push(m[1].trim()); else if (out.length && !/^\s/.test(l) && l.trim()) break; } return out; };
  const part = partOf(body, /^[ée]tapes\b/i);
  if (part) return pick(part);
  const parts = body.split(/\r?\n/).filter(l => /^##\s/.test(l)).map(l => l.replace(/^##\s+(\d+\.\s+)?/, '').trim()).filter(t => !META_PART.test(t));
  return parts.length >= 2 ? parts : pick(body.split(/\r?\n/));
}
const JOURNAL_RE = /^-\s+(\d{4}-\d{2}-\d{2})\s*·\s*(.+)$/;
function skillJournal(body) {
  return (partOf(body, /^journal des changements/i) || []).map(l => JOURNAL_RE.exec(l.trim())).filter(Boolean).map(m => {
    const [quoi, ...pourquoi] = m[2].split(' · ');
    return { date: m[1], quoi: quoi.trim(), pourquoi: pourquoi.join(' · ').trim() };
  });
}
/* feedback.md: - [ ] AAAA-MM-JJ · <retour> · contexte : <…>   (and - [x] … · appliqué le …, or · écarté : …) */
function skillNotes(text) {
  const attente = [], faits = [];
  text.split(/\r?\n/).forEach((l, ligne) => {
    const m = /^-\s+\[([ xX])\]\s+(.*)$/.exec(l.trim());
    if (!m) return;
    const parts = m[2].split(' · ').map(s => s.trim()), date = DATE_RE.test(parts[0]) ? parts.shift() : '';
    const contexte = (parts.find(s => /^contexte\s*:/i.test(s)) || '').replace(/^contexte\s*:\s*/i, '');
    const fin = parts.find(s => /^(appliqué le|écarté)/i.test(s)) || '';
    const texte = parts.filter(s => !/^contexte\s*:/i.test(s) && s !== fin && s !== 'pour le socle').join(' · ');
    (m[1] === ' ' ? attente : faits).push({ date, texte, contexte, fin, socle: parts.includes('pour le socle'), ligne });
  });
  return { attente, faits };
}
/* where each skill serves: the steps of the processes, the routines that launch it */
function skillUses(root) {
  const uses = new Map(), add = (id, u) => { if (!uses.has(id)) uses.set(id, []); if (!uses.get(id).some(x => x.chemin === u.chemin && x.nom === u.nom)) uses.get(id).push(u); };
  let names = []; try { names = fs.readdirSync(path.join(root, 'processus')).filter(n => n.endsWith('.md') && n !== '_index.md'); } catch (_) { }
  for (const n of names) {
    const rel = 'processus/' + n, text = readText(path.join(root, rel)), h = readHeader(text);
    const titre = ((text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '').match(/^#\s+(.+)$/m) || [])[1] || n.slice(0, -3)).trim();
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim().startsWith('|')) continue;
      const c = cellsOf(line);
      if (c.length < 4 || c[0] === 'Étape' || isRule(c)) continue;
      for (const s of c[1].split(',').map(unquote)) if (s && s !== '—' && s !== '-') add(s, { genre: 'processus', nom: titre, chemin: rel, statut: h.statut || '' });
    }
  }
  for (const r of tablesOf(readText(path.join(root, 'systeme', 'routines.md')), 'Routine')) {
    const s = unquote(r.Skill || '');
    if (s && s !== '—' && s !== '-') add(s, { genre: 'routine', nom: r.Routine, chemin: 'systeme/routines.md', quand: r.Quand || '', etat: r['État'] || '' });
  }
  return uses;
}
/* the skills of the socle, when the socle remote exists (an installed AIOS): the others are yours */
async function socleSkills(root) {
  const out = await gitRun(root, ['ls-tree', '--name-only', 'socle/main', 'skills/']);
  return out === null ? null : new Set(out.split('\n').map(s => s.trim().replace(/^skills\//, '')).filter(Boolean));
}
function skillUsage() {
  let u = null; try { u = JSON.parse(fs.readFileSync(path.join(DATA, 'arms-usage.json'), 'utf8')); } catch (_) { }
  const rows = new Map(); if (u && Array.isArray(u.skills)) for (const s of u.skills) rows.set(String(s.id || '').replace(/^\/+/, ''), s);
  return { mesure: !!(u && u.measured && u.measured.skills), genere: u ? u.generatedAt || null : null, rows };
}
async function listSkills() {
  const root = workspaceRoot();
  if (!root) return { error: 'Aucun workspace défini (config/workspace.json)', skills: [], familles: [] };
  let names = []; try { names = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name).sort(); } catch (_) { }
  const familles = skillFamilies(root), uses = skillUses(root), socle = await socleSkills(root), usage = skillUsage();
  const skills = [];
  for (const id of names) {
    const rel = 'skills/' + id + '/SKILL.md', abs = path.join(root, rel);
    let st; try { st = fs.statSync(abs); } catch (_) { continue; }
    const text = readText(abs), h = skillHeader(text), body = text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '');
    const notes = skillNotes(readText(path.join(root, 'skills', id, 'feedback.md'))), u = usage.rows.get(id);
    skills.push({
      id, nom: h.name || id, chemin: rel, ...splitDescription(h.description || ''), famille: h.famille || '',
      origine: socle ? (socle.has(id) ? 'socle' : 'perso') : '', etapes: skillSteps(body), journal: skillJournal(body),
      retours: notes.attente, faits: notes.faits.length, feedback: fs.existsSync(path.join(root, 'skills', id, 'feedback.md')) ? 'skills/' + id + '/feedback.md' : '',
      sert: uses.get(id) || [], lignes: text.replace(/\n$/, '').split(/\r?\n/).length, plafond: SKILL_MAX_LINES, m: Math.round(st.mtimeMs),
      usage: u ? { r7: u.runs7 || 0, r30: u.runs30 || 0, tok30: u.tok30 || 0, cout30: u.cost30 || 0, der: u.last || null, jours: u.days || null } : null
    });
  }
  return { root, familles, socle: !!socle, mesure: usage.mesure, genere: usage.genere, skills };
}
/* a note on a skill, from the page: the line /note writes, at the end of skills/<nom>/feedback.md */
function addSkillNote({ id, texte }) {
  const root = workspaceRoot();
  if (!root) throw httpError(400, 'Aucun workspace défini (config/workspace.json)');
  if (!okId(id) || !fs.existsSync(path.join(root, 'skills', id, 'SKILL.md'))) throw httpError(404, 'Skill introuvable');
  const clean = String(texte || '').replace(/\s+/g, ' ').replace(/ · /g, ', ').trim().slice(0, 500);
  if (!clean) throw httpError(400, 'Le retour est vide');
  const rel = 'skills/' + id + '/feedback.md', d = new Date();
  /* a feedback.md already there gets the editor's checks on its real path (a link never leads outside) */
  const t = fs.existsSync(path.join(root, rel)) ? editorTarget(rel) : editorTarget(rel, false);
  const jour = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const before = readText(t.abs), head = before ? (before.endsWith('\n') ? '' : '\n') : '# Retours · ' + id + '\n\n';
  fs.appendFileSync(t.abs, head + '- [ ] ' + jour + ' · ' + clean + ' · contexte : noté depuis l’onglet Skills\n');
  return { ok: true, path: rel };
}

/* ---------------------------- CONNECTEURS: the connectors page (connecteurs/) ----------------------------
   AIOS: the Connecteurs tab reads the table of systeme/connexions.md (Outil | Méthode | Pourquoi | Agents | Testé le |
   Commande) with the line number of each tool, their usage (data/arms-usage.json, written by refresh/usage.mjs: the
   « apps » rows with their days, and « horsListe », the MCP servers called but listed nowhere), where each tool serves
   (the SKILL.md of each skill, systeme/routines.md, the files of processus/) and the Git history of the table. Read only: nothing is
   written, a gesture the page cannot do is copied as a request for the agent. The .env is never read. */
const CX_METHODES = { 'outil officiel': ['officiel', 1], officiel: ['officiel', 1], cli: ['cli', 2], api: ['api', 3], mcp: ['mcp', 4] };
const CX_FILE = 'systeme/connexions.md';
const foldTxt = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const noneCell = s => !s || s === '—' || s === '-';
/* the same id as systeme/scripts/index.py gives a tool in config/apps.json */
const appIdOf = outil => 'app:' + String(outil).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const normName = s => String(s || '').toLowerCase().replace(/^\/+/, '').replace(/[^a-z0-9]/g, '');
function cxDate(s) {
  const t = String(s || '').trim(); let iso = '';
  if (DATE_RE.test(t)) iso = t;
  else { const m = /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/.exec(t); if (m) iso = m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); }
  return iso && !isNaN(Date.parse(iso)) ? iso : '';
}
/* the first table whose first column is « Outil », like index.py reads it, each row with its line in the file */
function connexionsRows(text) {
  const lines = text.split(/\r?\n/), rows = []; let cols = null;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('|')) { if (cols) break; continue; }
    const c = cellsOf(lines[i]);
    if (!cols) { if (c[0] === 'Outil') cols = c; continue; }
    if (isRule(c)) continue;
    const r = Object.fromEntries(cols.map((k, j) => [k, c[j] || '']));
    if (unquote(r.Outil || '')) rows.push({ ligne: i + 1, r });
  }
  return { cols: cols || ['Outil', 'Méthode', 'Pourquoi', 'Agents', 'Testé le', 'Commande'], rows };
}
function connectorUsage() {
  let u = null; try { u = JSON.parse(fs.readFileSync(path.join(DATA, 'arms-usage.json'), 'utf8')); } catch (_) { }
  const rows = new Map(); if (u && Array.isArray(u.apps)) for (const a of u.apps) rows.set(String(a.id || ''), a);
  return { mesure: !!(u && u.measured && u.measured.apps), genere: u ? u.generatedAt || null : null, rows, horsListe: u && Array.isArray(u.horsListe) ? u.horsListe : [] };
}
/* where each tool serves: its name or one of its command names, as a whole word, in the skills, the routines and the processes */
function connectorCorpus(root) {
  const out = [];
  let skills = []; try { skills = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name).sort(); } catch (_) { }
  for (const id of skills) { const rel = 'skills/' + id + '/SKILL.md', text = readText(path.join(root, rel)); if (text) out.push({ genre: 'skill', nom: id, chemin: rel, text }); }
  const routines = readText(path.join(root, 'systeme', 'routines.md')); let prose = [];
  if (routines) {
    let inTable = false;
    for (const line of routines.split(/\r?\n/)) {
      if (line.startsWith('|')) {
        const c = cellsOf(line); if (c[0] === 'Routine') { inTable = true; continue; }
        if (inTable && !isRule(c)) out.push({ genre: 'routine', nom: c[0], chemin: 'systeme/routines.md', text: line });
      } else { inTable = false; prose.push(line); }
    }
    out.push({ genre: 'routine', nom: 'systeme/routines.md', chemin: 'systeme/routines.md', text: prose.join('\n'), note: true });
  }
  let names = []; try { names = fs.readdirSync(path.join(root, 'processus')).filter(n => n.endsWith('.md') && n !== '_index.md').sort(); } catch (_) { }
  for (const n of names) {
    const rel = 'processus/' + n, text = readText(path.join(root, rel));
    const titre = ((text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '').match(/^#\s+(.+)$/m) || [])[1] || n.slice(0, -3)).trim();
    out.push({ genre: 'processus', nom: titre, chemin: rel, text });
  }
  return out;
}
const wordRe = name => new RegExp('(?<![\\p{L}\\p{N}_]|[\\p{L}\\p{N}_]-)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}_]|-[\\p{L}\\p{N}_])', 'iu');
function connectorServes(corpus, names) {
  const res = [...new Set(names.map(n => n.trim()).filter(n => n.length >= 2))].map(wordRe), out = [];
  for (const item of corpus) if (res.some(re => re.test(item.text))) out.push({ genre: item.genre, nom: item.nom, chemin: item.chemin });
  return out;
}
/* the history of the table: for each commit, the tools whose line was added, changed or removed */
async function connectorChanges(root, cols) {
  const out = await gitRun(root, ['log', '-n', '40', '-p', '-U0', '--no-color', '--no-ext-diff', '--date=short', '--format=%x1e%h%x1f%ad%x1f%s', '--', CX_FILE], 12000);
  if (out === null) return { git: false, commits: [] };
  const commits = [], cut = s => s.length > 90 ? s.slice(0, 89) + '…' : s;
  for (const rec of out.split('\x1e').slice(1)) {
    const [head, ...body] = rec.split('\n'), [hash, date, sujet] = head.split('\x1f'), tools = new Map();
    for (const line of body) {
      const m = /^([+-])\|/.exec(line); if (!m) continue;
      const c = cellsOf(line.slice(1)); if (c[0] === 'Outil' || isRule(c)) continue;
      const nom = unquote(c[0]); if (!nom) continue;
      const t = tools.get(nom) || tools.set(nom, {}).get(nom);
      t[m[1] === '+' ? 'apres' : 'avant'] = Object.fromEntries(cols.map((k, j) => [k, unquote(c[j] || '')]));
    }
    const items = [];
    for (const [outil, t] of tools) {
      if (t.apres && !t.avant) items.push({ outil, quoi: 'ajouté', methode: t.apres['Méthode'] || '' });
      else if (t.avant && !t.apres) items.push({ outil, quoi: 'retiré' });
      else {
        const diff = cols.filter(k => k !== 'Outil' && (t.avant[k] || '') !== (t.apres[k] || '')).map(k => ({ col: k, avant: cut(t.avant[k] || ''), apres: cut(t.apres[k] || '') }));
        if (diff.length) items.push({ outil, quoi: 'modifié', cols: diff });
      }
    }
    if (items.length) commits.push({ hash, date, sujet, items });
  }
  return { git: true, commits };
}
async function listConnecteurs() {
  const root = workspaceRoot();
  if (!root) return { error: 'Aucun workspace défini (config/workspace.json)', connecteurs: [], horsListe: [] };
  const { cols, rows } = connexionsRows(readText(path.join(root, CX_FILE))), usage = connectorUsage(), corpus = connectorCorpus(root);
  const connecteurs = rows.map(({ ligne, r }) => {
    const nom = unquote(r.Outil), brut = unquote(r['Méthode'] || ''), m = CX_METHODES[foldTxt(brut)] || ['autre', 0];
    const commandes = (r.Commande || '').split(',').map(unquote).filter(n => !noneCell(n));
    const agents = [...new Set((r.Agents || '').split(/[,;/·]|\s+et\s+/i).map(s => foldTxt(unquote(s)).split(/\s+/)[0]).filter(s => s && !noneCell(s)))];
    const u = usage.rows.get(appIdOf(nom));
    return {
      id: appIdOf(nom).slice(4), ligne, nom, methode: m[0], methodeBrut: brut, poids: m[1], pourquoi: r.Pourquoi || '', agents, teste: cxDate(r['Testé le']), testeBrut: r['Testé le'] || '', commandes,
      /* a tool with no command is not counted, whatever the log holds */
      usage: commandes.length && usage.mesure && u ? { a7: u.calls7 || 0, a30: u.calls30 || 0, der: u.last || null, jours: u.days || {} } : null,
      sert: connectorServes(corpus, [nom, ...commandes])
    };
  });
  /* the file may have changed since the last refresh: a server is « off the list » only if no line covers it now */
  const couvert = s => connecteurs.some(c => c.commandes.some(n => normName(n) === normName(s)) || c.id.replace(/-/g, '') === normName(s));
  const horsListe = usage.mesure ? usage.horsListe.filter(h => h && h.serveur && !couvert(h.serveur)).map(h => ({ serveur: String(h.serveur), a7: h.calls7 || 0, a30: h.calls30 || 0, der: h.last || null, jours: h.days || {} })) : [];
  const tests = connecteurs.map(c => c.teste).filter(Boolean).sort();
  return {
    root, chemin: CX_FILE, existe: fs.existsSync(path.join(root, CX_FILE)), mesure: usage.mesure, genere: usage.genere, connecteurs, horsListe,
    dernierTest: tests.length ? tests[tests.length - 1] : null, changements: await connectorChanges(root, cols)
  };
}

/* ---------------------------- OUTBOX: the outbox page (outbox/) ----------------------------
   AIOS: the Outbox tab shows, day by day (the last 7), the files the agent wrote or changed, where they are filed.
   Nothing moves. Two sources: the session logs of Claude Code (refresh/sources/claude-code.cjs: Write, Edit, MultiEdit,
   NotebookEdit, with the title and the skills of each session) and Git (commits and git status), whose files no session
   covers go to « Hors discussion ». Of the talk, only paths, times and titles leave the logs; nothing leaves this computer.
   « Valider » writes one line per file in outbox/ranges.md (POST /local/outbox/ranger); « Remettre » takes it away.
   A file touched again after its validation is back in « À ranger »: the line is older than its last change. */
const claudeCode = require('./refresh/sources/claude-code.cjs');
const OUTBOX_DAYS = 7, RANGES_REL = 'outbox/ranges.md', GIT_COMMIT_MAX = 200, GIT_STATUS_MAX = 5000;
const pad2 = n => String(n).padStart(2, '0');
const dayKey = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const startOfDay = key => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
/* the files refresh/brain.mjs rewrites at each refresh: not the agent's work */
const KIT_GENERATED = new Set(['interface/brain/snapshot.js', 'interface/brain/snapshot-expansions.js', 'interface/brain/_icons.js', 'interface/brain/map-layouts.js', 'interface/assets/home-orb-mini.js']);
/* what the page never lists: hidden folders, caches, the OS's own data, generated files, secrets, and the outbox itself */
const outboxSkip = rel => rel.split('/').some(s => s.startsWith('.') || FILES_SKIP.has(s)) || rel.startsWith('interface/data/') || rel.startsWith('outbox/')
  || rel.startsWith('vues/') || generatedFile(rel) || KIT_GENERATED.has(rel) || scan.isSecret(rel);
function relInRoot(roots, abs) {
  const a = String(abs).replace(/\\/g, '/'), folded = process.platform === 'win32' || process.platform === 'darwin';
  for (const r of roots) {
    const base = r.replace(/\\/g, '/').replace(/\/+$/, '');
    if ((folded ? a.toLowerCase() : a).startsWith((folded ? base.toLowerCase() : base) + '/')) {
      const rel = path.posix.normalize(a.slice(base.length + 1));
      return rel === '.' || rel.startsWith('../') || rel === '..' ? null : rel;
    }
  }
  return null;
}
const OUTBOX_GENRES = [['page', /\.(html?|xhtml)$/i], ['visuel', /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico|pdf)$/i], ['donnees', /\.(jsonl?|csv|tsv|ya?ml|toml|xml|xlsx?|sql|ics)$/i]];
const genreOf = rel => (OUTBOX_GENRES.find(([, re]) => re.test(rel)) || ['texte'])[0];

/* what Git saw of the window: commits (with the files they touch), what is tracked, when each file was added, and the working tree */
async function outboxGit(root, since) {
  const inside_ = ((await gitRun(root, ['rev-parse', '--is-inside-work-tree'])) || '').trim() === 'true';
  if (!inside_) return { git: false };
  const prefix = ((await gitRun(root, ['rev-parse', '--show-prefix'])) || '').trim();
  const rel = p => prefix ? (p.startsWith(prefix) ? p.slice(prefix.length) : null) : p;
  const flags = ['-c', 'core.quotepath=false'];
  const [log, ls, status] = await Promise.all([
    gitRun(root, [...flags, 'log', '--since=' + new Date(since).toISOString(), '--no-renames', '--name-status', '--format=%x1e%aI', '--', '.'], 20000),
    gitRun(root, [...flags, 'ls-files', '-z', '--', '.'], 20000),
    gitRun(root, [...flags, 'status', '--porcelain', '-z', '--untracked-files=all', '--', '.'], 20000)
  ]);
  const commits = [], tracked = new Set(), adds = new Map(), dirty = [];
  for (const rec of (log || '').split('\x1e').slice(1)) {
    const lines = rec.split('\n').map(l => l.replace(/\r$/, '')), t = Date.parse(lines[0]);
    if (!(t > 0)) continue;
    const files = [];
    for (const l of lines.slice(1)) {
      const m = /^([AMDTUXB])\t(.+)$/.exec(l); if (!m) continue;
      const p = rel(m[2]); if (p) files.push({ p, st: m[1] });
    }
    /* a commit that touches hundreds of files is an import or a merge, not work done by hand */
    if (files.length && files.length <= GIT_COMMIT_MAX) commits.push({ t, files });
    for (const f of files) if (f.st === 'A' && (!adds.has(f.p) || adds.get(f.p) > t)) adds.set(f.p, t);
  }
  for (const p of (ls || '').split('\0')) { const r = p && rel(p); if (r) tracked.add(r); }
  const toks = (status || '').split('\0');
  for (let i = 0; i < toks.length && dirty.length < GIT_STATUS_MAX; i++) {
    const m = /^(.)(.) (.+)$/.exec(toks[i]); if (!m) continue;
    if (m[1] === 'R' || m[1] === 'C') i++;
    if (m[1] === 'D' || m[2] === 'D') continue;
    const p = rel(m[3]); if (p) dirty.push({ p, st: m[1] === '?' ? '?' : 'M' });
  }
  return { git: true, commits, tracked, adds, dirty };
}

/* projects: the slug and title of each project of projets/, the files each cites in Livrables or Sources, and the folders it cites */
let projectIndexCache = null;
function projectWalk(root, dir, out) {
  let entries; try { entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true }); } catch (_) { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.isSymbolicLink()) continue;
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) projectWalk(root, rel, out);
    else if (e.isFile() && /\.md$/i.test(e.name) && e.name !== '_index.md') { try { const st = fs.statSync(path.join(root, rel)); out.push({ p: rel, m: Math.round(st.mtimeMs), s: st.size }); } catch (_) { } }
  }
  return out;
}
function dirLink(root, projectRel, cible) {
  if (!cible || /^https?:\/\//i.test(cible)) return null;
  let c = cible.split('#')[0].replace(/^<|>$/g, ''); try { c = decodeURIComponent(c); } catch (_) { }
  for (const rel of [path.posix.normalize(path.posix.join(path.posix.dirname(projectRel), c)), path.posix.normalize(c.replace(/^\/+/, ''))]) {
    if (rel.startsWith('..') || rel === '.') continue;
    const abs = inside(root, rel); try { if (abs && fs.statSync(abs).isDirectory()) return rel.replace(/\/+$/, '') + '/'; } catch (_) { }
  }
  return null;
}
function outboxProjects(root) {
  const files = projectWalk(root, 'projets', []).sort((a, b) => a.p.localeCompare(b.p)), sig = files.map(f => f.p + f.m + f.s).join('|');
  if (projectIndexCache && projectIndexCache.sig === sig && Date.now() - projectIndexCache.at < 30000) return projectIndexCache.idx;
  const idx = { bySlug: new Map(), byPath: new Map(), cites: new Map(), dirs: [] };
  for (const f of files) {
    const d = projectOf(root, f); if (d.header.type !== 'projet') continue;
    const slug = slugOf(f.p);
    idx.bySlug.set(slug, { slug, titre: d.titre || slug, path: f.p }); idx.byPath.set(f.p, slug);
    for (const x of [...d.livrables, ...d.sources]) {
      if (!x.cible) continue;
      const r = resolveLink(f.p, x.cible);
      if (r.chemin && r.genre !== 'absent') { if (!idx.cites.has(r.chemin)) idx.cites.set(r.chemin, slug); continue; }
      const dir = dirLink(root, f.p, x.cible); if (dir) idx.dirs.push({ prefix: dir, slug });
    }
  }
  idx.dirs.sort((a, b) => b.prefix.length - a.prefix.length);
  projectIndexCache = { sig, at: Date.now(), idx };
  return idx;
}
/* the project of a file: the projet: field of its header, else a project that cites it, else none */
function projectOfFile(idx, rel, header) {
  const named = String(header.projet || '').split(',').map(s => s.trim()).filter(Boolean);
  if (named.length) return named.find(n => idx.bySlug.has(n)) || named[0];
  return idx.byPath.get(rel) || idx.cites.get(rel) || (idx.dirs.find(d => rel.startsWith(d.prefix)) || {}).slug || '';
}

/* what the right side shows of a file: its title and first lines (text), its <title> (page); a picture is fetched by the page */
const previewCache = new Map();
function outboxPreview(abs, rel, genre, st) {
  const key = rel, hit = previewCache.get(key);
  if (hit && hit.m === st.mtimeMs && hit.s === st.size) return hit.v;
  const v = { titre: '', apercu: [] };
  const kind = kindOf(rel);
  if ((kind === 'md' || kind === 'text') && st.size > 0) {
    let text = ''; try { const fd = fs.openSync(abs, 'r'); try { const buf = Buffer.alloc(Math.min(st.size, 24 * 1024)); text = buf.toString('utf8', 0, fs.readSync(fd, buf, 0, buf.length, 0)); } finally { fs.closeSync(fd); } } catch (_) { }
    if (genre === 'page') {
      const t = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(text);
      v.titre = t ? t[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim().slice(0, 160) : '';
    } else {
      if (kind === 'md') v.header = readHeader(text);
      const body = kind === 'md' ? text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '') : text;
      const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const h1 = kind === 'md' ? lines.findIndex(l => /^#\s+\S/.test(l)) : -1;
      if (h1 >= 0) { v.titre = lines[h1].replace(/^#\s+/, '').replace(/\s*#+$/, '').slice(0, 160); lines.splice(h1, 1); }
      v.apercu = lines.slice(0, 8).map(l => l.replace(/^#{1,6}\s+/, '').slice(0, 180));
    }
  }
  previewCache.set(key, { m: st.mtimeMs, s: st.size, v });
  if (previewCache.size > 2000) previewCache.delete(previewCache.keys().next().value);
  return v;
}

function readRanges(root) {
  const out = new Map(), text = readText(path.join(root, RANGES_REL));
  for (const line of text.split(/\r?\n/)) {
    const m = /^-\s+(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})\s+·\s+(.+?)\s*$/.exec(line);
    if (m) out.set(m[6], new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime());
  }
  return out;
}
function countQuestions(root) {
  return readText(path.join(root, 'outbox', 'questions.md')).split(/\r?\n/).filter(l => /^\s*[-*]\s+\S/.test(l)).length;
}

async function listOutbox() {
  const root = workspaceRoot();
  if (!root) return { error: 'Aucun workspace défini (config/workspace.json)', entrees: [], jours: [] };
  let realRoot = root; try { realRoot = fs.realpathSync.native(root); } catch (_) { }
  const roots = [...new Set([root, realRoot])], now = new Date(), today = dayKey(now);
  const jours = Array.from({ length: OUTBOX_DAYS }, (_, i) => dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)));
  const winStart = startOfDay(jours[jours.length - 1]), nextDay = key => { const [y, m, d] = key.split('-').map(Number); return startOfDay(dayKey(new Date(y, m - 1, d + 1))); };
  const dayOf = t => dayKey(new Date(t));

  /* 1. the session logs */
  const journaux = { etat: 'ok', sessions: 0 };
  let sessions = [];
  if (!routineSources.readerOn('claudeCode')) journaux.etat = 'eteint';
  else {
    let r = null; try { r = claudeCode.sessionWrites(OUTBOX_DAYS + 1); } catch (e) { console.error('journaux de session :', e.message); }
    if (r === null) journaux.etat = 'absent'; else sessions = r;
  }
  const exists = new Map();   /* rel -> stat of the file as it is now, or null */
  const statOf = rel => {
    if (exists.has(rel)) return exists.get(rel);
    let st = null;
    try {
      const abs = path.join(root, rel), real = fs.realpathSync.native(abs);
      if (real.startsWith(realRoot + path.sep)) { const s = fs.statSync(real); if (s.isFile()) st = s; }
    } catch (_) { }
    exists.set(rel, st); return st;
  };
  const traces = new Map(), sessionInfo = {};
  for (const g of sessions) {
    let used = false;
    for (const w of g.writes) {
      if (w.t < winStart) continue;
      const rel = relInRoot(roots, w.p); if (!rel || outboxSkip(rel) || !statOf(rel)) continue;
      if (!traces.has(rel)) traces.set(rel, []);
      traces.get(rel).push({ t: w.t, tool: w.tool, sid: g.id }); used = true;
    }
    if (used) { sessionInfo[g.id] = { titre: g.titre || 'Discussion sans titre', debut: g.debut, fin: g.fin, skills: g.skills }; journaux.sessions++; }
  }
  for (const list of traces.values()) list.sort((a, b) => a.t - b.t);

  /* 2. Git */
  const g = await outboxGit(root, winStart);
  const adds = g.adds || new Map(), tracked = g.tracked || new Set();
  const covered = (rel, t) => (traces.get(rel) || []).some(x => x.t >= t - 864e5 && x.t <= t + 60000);
  const found = new Map();   /* rel|day -> entry */
  const keep = (rel, t, sid) => {
    const key = rel + '|' + dayOf(t), e = found.get(key);
    if (!e) found.set(key, { p: rel, jour: dayOf(t), t, s: sid });
    else if (t > e.t) { e.t = t; e.s = sid; }
  };
  for (const [rel, list] of traces) for (const x of list) keep(rel, x.t, x.sid);
  if (g.git) {
    for (const c of g.commits) {
      if (c.t < winStart) continue;
      for (const f of c.files) {
        if (f.st === 'D' || outboxSkip(f.p) || !statOf(f.p) || covered(f.p, c.t)) continue;
        keep(f.p, c.t, '');
      }
    }
    for (const f of g.dirty) {
      if (outboxSkip(f.p)) continue;
      const st = statOf(f.p); if (!st || st.mtimeMs < winStart || covered(f.p, st.mtimeMs)) continue;
      keep(f.p, st.mtimeMs, '');
    }
  }

  /* 3. new or changed that day */
  const etatDe = (rel, jour) => {
    const d0 = startOfDay(jour), d1 = nextDay(jour), add = adds.get(rel), list = traces.get(rel) || [];
    if (add !== undefined ? add < d0 : tracked.has(rel)) return 'modifie';   /* Git knew it before that day */
    if (list.some(x => x.t < d0)) return 'modifie';                             /* an earlier session wrote it already */
    if (add !== undefined && add < d1) return 'nouveau';                        /* added to Git that very day */
    if (list.length) return list[0].tool === 'Write' ? 'nouveau' : 'modifie';   /* its first trace made it, or only changed it */
    return 'nouveau';                                                           /* only Git's working tree knows it: new to Git */
  };

  /* 4. the file cards, the projects, what is already validated */
  const idx = outboxProjects(root), ranges = readRanges(root), fichiers = {}, projets = {};
  const entrees = [...found.values()].filter(e => jours.includes(e.jour)).sort((a, b) => b.t - a.t).map(e => {
    const st = statOf(e.p);
    if (!fichiers[e.p]) {
      const genre = genreOf(e.p), pv = outboxPreview(path.join(root, e.p), e.p, genre, st);
      const slug = projectOfFile(idx, e.p, pv.header || {}), pr = idx.bySlug.get(slug);
      if (slug) projets[slug] = pr ? { titre: pr.titre, path: pr.path } : { titre: slug, path: '' };
      const abs = path.join(root, e.p);
      fichiers[e.p] = { genre, taille: st.size, m: Math.round(st.mtimeMs), titre: pv.titre || path.posix.basename(e.p), apercu: pv.apercu, projet: slug, dossier: path.posix.dirname(e.p) === '.' ? '' : path.posix.dirname(e.p) + '/', abs, ouvrable: !(abs === KIT || abs.startsWith(KIT + path.sep)) };
    }
    const at = ranges.get(e.p);
    return { p: e.p, jour: e.jour, t: e.t, etat: etatDe(e.p, e.jour), s: e.s, range: at !== undefined && Math.floor(e.t / 60000) * 60000 <= at };
  });
  return { root, aujourdhui: today, jours, journaux, git: !!g.git, entrees, fichiers, sessions: sessionInfo, projets, questions: countQuestions(root) };
}

/* « Valider » adds a line to outbox/ranges.md for each file, « Remettre » takes it away. The file is written beside, then put in place. */
let rangesChain = Promise.resolve();
function setRanges({ chemins, range }) {
  const root = workspaceRoot();
  if (!root) throw httpError(400, 'Aucun workspace défini (config/workspace.json)');
  if (!Array.isArray(chemins) || !chemins.length || chemins.length > 500) throw httpError(400, 'Aucun fichier à ranger');
  if (typeof range !== 'boolean') throw httpError(400, 'Dis si tu ranges ou si tu remets');
  const rels = [...new Set(chemins.map(c => {
    const raw = typeof c === 'string' ? c.replace(/\\/g, '/') : '', norm = path.posix.normalize(raw);
    const abs = inside(root, norm);
    /* the page sends paths relative to the workspace: an absolute one is refused, never trimmed into another path */
    if (!raw || raw.startsWith('/') || /^[A-Za-z]:\//.test(raw) || !abs || abs === root || norm === '.' || norm.startsWith('..') || /[\r\n\0]/.test(norm) || norm.split('/').some(s => s.startsWith('.')) || scan.isSecret(norm) || norm.startsWith('outbox/'))
      throw httpError(400, 'Ce chemin n’est pas un fichier du workspace');
    return norm;
  }))];
  const file = path.join(root, RANGES_REL), dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  let realRoot = root; try { realRoot = fs.realpathSync.native(root); } catch (_) { }
  if (!fs.realpathSync.native(dir).startsWith(realRoot + path.sep)) throw httpError(403, 'Le dossier outbox/ mène hors du workspace');
  let st = null; try { st = fs.lstatSync(file); } catch (_) { }
  if (st && !st.isFile()) throw httpError(403, 'outbox/ranges.md n’est pas un fichier ordinaire');
  const job = rangesChain.then(() => {
    const before = st ? readText(file) : '';
    const head = '# Fichiers rangés\n\nCe que tu as validé dans l’onglet Outbox : chaque fichier reste où il est, cette liste n’en garde que la trace. Une ligne par fichier : `- AAAA-MM-JJ HH:MM · <chemin>`. « Remettre dans l’outbox » retire la ligne.\n\n';
    const gone = new Set(rels), kept = [];
    for (const line of (before || head).split(/\r?\n/)) {
      const m = /^-\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+·\s+(.+?)\s*$/.exec(line);
      if (!(m && gone.has(m[1]))) kept.push(line);
    }
    while (kept.length && kept[kept.length - 1] === '') kept.pop();
    const n = new Date(), stamp = dayKey(n) + ' ' + pad2(n.getHours()) + ':' + pad2(n.getMinutes());
    const isEntry = l => /^-\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+·\s+/.test(l);
    if (range && kept.length && !isEntry(kept[kept.length - 1])) kept.push('');
    const lines = kept.concat(range ? rels.map(p => '- ' + stamp + ' · ' + p) : []);
    const tmp = path.join(dir, '.ranges.md.' + process.pid + '.tmp');
    fs.writeFileSync(tmp, lines.join('\n') + '\n', { mode: st ? st.mode & 0o777 : 0o644 });
    try { fs.renameSync(tmp, file); } catch (e) { try { fs.unlinkSync(tmp); } catch (_) { } throw e; }
    return { ok: true, chemins: rels, range };
  });
  rangesChain = job.catch(() => { });
  return job;
}

/* ---------------------------- ORBITE: the 3D home (orbite/) ----------------------------
   AIOS: the home page shows the workspace by its indexes, one level at a time. The map: AGENTS.md, the domains of
   systeme/metadonnees.md and the top folders that keep an _index.md, with the skills and the connectors further out.
   A folder: its sub-folders, or its files (the 12 most recent named, the others as dust). The server counts, the page
   draws: no level ever sends the 2,000 files. */
const ORBITE_HORS = new Set(['archives', 'vues', 'systeme', 'interface', 'outbox', 'skills', 'routers', 'domaines']);
const ORBITE_COULEURS = ['#2EE6C9', '#B69CFF', '#FBBF24', '#F472B6', '#4DA8FF', '#4ADE80', '#FF7A45', '#67E8F9'];
const ORBITE_NEUTRE = '#9DB0AC', ORBITE_NOMMES = 12, ORBITE_LISTE = 2000;
/* the files a level counts: everything but the generated indexes and the image lists */
const orbiteCompte = f => !/(^|\/)_(index|images)\.md$/.test(f.p);
function orbiteDomaines(root) {
  const seen = new Map();
  for (const r of tablesOf(readText(path.join(root, 'systeme', 'metadonnees.md')), 'Domaine')) {
    const id = unquote(r.Domaine || '');
    if (id && !/^</.test(id) && !seen.has(id)) seen.set(id, { id, couvre: r['Ce qu’il couvre'] || r["Ce qu'il couvre"] || '' });
  }
  return [...seen.values()];
}
function orbiteCouleur(domaines, rel) {
  const m = /^domaines\/([^/]+)/.exec(rel || ''), i = m ? domaines.findIndex(d => d.id === m[1]) : -1;
  return i < 0 ? ORBITE_NEUTRE : ORBITE_COULEURS[i % ORBITE_COULEURS.length];
}
const orbiteDans = (rel, dir) => rel === dir || rel.startsWith(dir + '/');
const orbiteParent = rel => rel.split('/').slice(0, -1).join('/');
/* the breadcrumb: AGENTS.md, then each folder of the path; domaines/ itself is not a level, its domains are */
function orbiteFil(chemin, fichiers) {
  const fil = [{ nom: 'AGENTS.md', chemin: '' }], parts = chemin ? chemin.split('/') : [];
  parts.forEach((p, i) => { const c = parts.slice(0, i + 1).join('/'); if (c !== 'domaines') fil.push({ nom: p, chemin: c }); });
  if (fichiers) fil.push({ nom: 'fichiers', chemin, fichiers: true });
  return fil;
}
function orbiteNiveau(chemin, seulFichiers) {
  const { root, files, dirs, error } = listFiles();
  if (error) return { error, enfants: [] };
  const domaines = orbiteDomaines(root), compte = files.filter(orbiteCompte);
  const nb = dir => compte.reduce((a, f) => a + (orbiteDans(f.p, dir) ? 1 : 0), 0);
  const sousDossiers = dir => dirs.filter(d => orbiteParent(d) === dir && !d.split('/').pop().startsWith('.'));
  if (!chemin) {
    const enfants = domaines.map((d, i) => ({ nom: d.id, chemin: 'domaines/' + d.id, couleur: ORBITE_COULEURS[i % ORBITE_COULEURS.length], n: nb('domaines/' + d.id), index: sousDossiers('domaines/' + d.id).length, resume: d.couvre, domaine: true }))
      .concat(dirs.filter(d => !d.includes('/') && !ORBITE_HORS.has(d) && files.some(f => f.p === d + '/_index.md'))
        .map(d => ({ nom: d, chemin: d, couleur: ORBITE_NEUTRE, n: nb(d), index: sousDossiers(d).length, resume: '' })).filter(x => x.n > 0));
    let skills = []; try { skills = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter(e => e.isDirectory() && fs.existsSync(path.join(root, 'skills', e.name, 'SKILL.md'))).map(e => e.name).sort(); } catch (_) { }
    const connecteurs = tablesOf(readText(path.join(root, 'systeme', 'connexions.md')), 'Outil').map(r => unquote(r.Outil || '')).filter(Boolean);
    return { chemin: '', fil: orbiteFil('', false), mode: 'carte', centre: { nom: 'AGENTS.md', chemin: 'AGENTS.md', n: compte.length, couleur: '#F2FBF9' }, enfants, skills, connecteurs, total: compte.length };
  }
  /* a folder of the workspace, under the editor's rules (never the OS folder, never a hidden one) */
  const clean = String(chemin).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!dirs.includes(clean)) throw httpError(404, 'Dossier introuvable');
  const couleur = orbiteCouleur(domaines, clean), dom = /^domaines\/([^/]+)$/.exec(clean), d = dom ? domaines.find(x => x.id === dom[1]) : null;
  const directs = compte.filter(f => orbiteParent(f.p) === clean).sort((a, b) => b.m - a.m);
  const sous = sousDossiers(clean);
  const centre = { nom: clean.split('/').pop(), chemin: clean, n: nb(clean), couleur, index: files.some(f => f.p === clean + '/_index.md') ? clean + '/_index.md' : '', routeur: d ? 'routers/' + d.id + '.md' : '', resume: d ? d.couvre : '' };
  const fiche = f => ({ nom: f.p.split('/').pop(), chemin: f.p, titre: (f.t || f.p.split('/').pop()).slice(0, 90), resume: f.h && f.h.resume || '', type: f.h && f.h.type || '', taille: f.s, m: f.m, k: f.k });
  if (seulFichiers || !sous.length) {
    return { chemin: clean, fichiers: !!seulFichiers, fil: orbiteFil(clean, !!seulFichiers && sous.length > 0), mode: 'fichiers', centre, couleur,
      nommes: directs.slice(0, ORBITE_NOMMES).map(fiche), reste: Math.max(0, directs.length - ORBITE_NOMMES), liste: directs.slice(0, ORBITE_LISTE).map(fiche), total: directs.length };
  }
  const enfants = sous.map(s => ({ nom: s.split('/').pop(), chemin: s, couleur, n: nb(s), index: sousDossiers(s).length, resume: '' })).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  if (directs.length) enfants.push({ nom: centre.nom + ' (racine)', chemin: clean, fichiers: true, couleur, n: directs.length, index: 0, resume: 'Les fichiers posés à la racine du dossier' });
  return { chemin: clean, fil: orbiteFil(clean, false), mode: 'dossiers', centre, couleur, enfants, total: centre.n };
}
/* one file, for the panel: its header, its start, its links out (resolved) and in (a text search of its name) */
function orbiteFichier(rel) {
  const doc = readForEditor(rel), t = editorTarget(doc.path), h = doc.content ? readHeader(doc.content) : {};
  const corps = (doc.content || '').replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '');
  const titre = ((corps.match(/^#\s+(.+)$/m) || [])[1] || doc.path.split('/').pop()).trim();
  const dir = orbiteParent(doc.path), sortants = [], vus = new Set();
  const ajoute = (texte, cible) => {
    if (!cible || /^[a-z]+:/i.test(cible) || cible.startsWith('#')) return;
    const parts = (dir + '/' + cible.split('#')[0]).split('/'), out = [];
    for (const x of parts) { if (!x || x === '.') continue; if (x === '..') out.pop(); else out.push(x); }
    const c = out.join('/'); if (!c || vus.has(c)) return; vus.add(c);
    sortants.push({ texte: texte || c.split('/').pop(), chemin: c, existe: fs.existsSync(path.join(t.root, c)) });
  };
  for (const m of corps.matchAll(/\[([^\]]*)\]\(([^)\s]+)\)/g)) ajoute(m[1], m[2]);
  String(h.liens || '').split(',').map(s => s.trim()).filter(Boolean).forEach(c => ajoute(c.split('/').pop(), c.startsWith('/') ? c : path.posix.relative(dir || '.', c)));
  const nom = doc.path.split('/').pop(), entrants = nom.length > 3 ? searchFiles(nom).results.filter(r => r.p !== doc.path && !generatedFile(r.p)).slice(0, 20).map(r => ({ chemin: r.p, texte: r.text })) : [];
  return { chemin: doc.path, titre, entete: h, kind: doc.kind, taille: doc.size, m: doc.mtime, extrait: corps.slice(0, 6000), coupe: corps.length > 6000, sortants: sortants.slice(0, 30), entrants };
}

/* ---------------------------- DISQUE: the rosace (disque/) ----------------------------
   AIOS: the same indexes as ORBITE, flat: parts that weigh their files. A level is the map (the domains and their
   indexes, this week's activity, the strongest links), a folder (its indexes and how fresh they are) or an index, cut
   into groups by one header field, with every file as a thin slice. The server counts and groups; the page draws. */
const DISQUE_JOUR = 864e5, DISQUE_NOMS_MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DISQUE_CRITERES = [['mois', 'Mois'], ['statut', 'Statut'], ['projet', 'Projet'], ['type', 'Type'], ['liens', 'Liens'], ['theme', 'Thème'], ['echeance', 'Échéance']];
const DISQUE_STATUTS = { 'a-valider': 'À valider', 'a-lire': 'À lire', 'a-construire': 'À construire', bloque: 'Bloqué', abandonne: 'Abandonné' };
const disqueStatut = s => DISQUE_STATUTS[s] || (s.charAt(0).toUpperCase() + s.slice(1)).replace(/-/g, ' ');
/* a file's date: its header's maj when it is a real date, else the disk's */
function disqueDate(f) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((f.h && f.h.maj) || '');
  return m ? new Date(+m[1], m[2] - 1, +m[3], 12).getTime() : f.m;
}
const disquePremier = v => String(v || '').split(',').map(s => s.trim()).filter(Boolean)[0] || '';
/* where a file's links go (header liens, Markdown links), as folders: read again only when the file changes */
const disqueLiensCache = new Map();
function disqueCibles(root, f) {
  if (f.k !== 'md' || f.s > READ_MAX) return [];
  let hit = disqueLiensCache.get(f.p);
  if (!hit || hit.m !== f.m || hit.s !== f.s) {
    let text = ''; try { text = fs.readFileSync(path.join(root, f.p), 'utf8'); } catch (_) { }
    const h = readHeader(text), corps = text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, ''), dir = orbiteParent(f.p), out = new Set();
    const resout = (base, cible) => {
      if (!cible || /^[a-z]+:/i.test(cible) || cible.startsWith('#')) return;
      const parts = ((cible.startsWith('/') ? '' : base + '/') + decodeURI(cible.split('#')[0])).split('/'), o = [];
      for (const x of parts) { if (!x || x === '.') continue; if (x === '..') o.pop(); else o.push(x); }
      if (o.length) out.add(o.join('/'));
    };
    for (const m of corps.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) { try { resout(dir, m[1]); } catch (_) { } }
    String(h.liens || '').split(',').map(s => s.trim()).filter(Boolean).forEach(c => { try { resout('', c); } catch (_) { } });
    hit = { m: f.m, s: f.s, l: [...out] }; disqueLiensCache.set(f.p, hit);
  }
  return hit.l;
}
function disqueNiveau(chemin, seulFichiers, par) {
  const { root, files, dirs, error } = listFiles();
  if (error) return { error };
  const domaines = orbiteDomaines(root), compte = files.filter(orbiteCompte), dirSet = new Set(dirs), now = Date.now();
  const debutMois = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
  const sousDossiers = dir => dirs.filter(d => orbiteParent(d) === dir);
  const dans = dir => compte.filter(f => orbiteDans(f.p, dir));
  const fraicheur = fs_ => { let semaine = 0, mois = 0; for (const f of fs_) { const d = disqueDate(f); if (now - d < 7 * DISQUE_JOUR) semaine++; else if (d >= debutMois) mois++; } return { semaine, mois, ancien: fs_.length - semaine - mois }; };
  /* the folder a link points to: the folder itself, or the one that holds the file; only folders the disc shows */
  const montre = dir => !!dir && (dir.startsWith('domaines/') || !ORBITE_HORS.has(dir.split('/')[0]));
  const dossierDe = c => { const v = dirSet.has(c) ? c : orbiteParent(c); return montre(v) ? v : ''; };
  const resumeIndex = d => { const x = files.find(f => f.p === d + '/_index.md'); return x && x.h && x.h.resume || ''; };
  /* a folder's parts: its sub-folders that hold files, and its own files as one more part */
  const partsDe = (dir, couleur) => {
    const directs = compte.filter(f => orbiteParent(f.p) === dir);
    const out = sousDossiers(dir).map(s => { const fs_ = dans(s); return { nom: s.split('/').pop(), chemin: s, couleur, n: fs_.length, index: sousDossiers(s).length, resume: resumeIndex(s), ...fraicheur(fs_) }; }).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
    if (directs.length) out.push({ nom: dir.split('/').pop() + ' (racine)', chemin: dir, fichiers: true, couleur, n: directs.length, index: 0, resume: 'Les fichiers posés à la racine du dossier', ...fraicheur(directs) });
    return out;
  };
  /* links between folders, counted once per file and target folder */
  const liensEntre = (sources, garde) => {
    const n = new Map();
    for (const f of sources) {
      if (f.g) continue;
      const de = orbiteParent(f.p);
      for (const vers of new Set(disqueCibles(root, f).map(dossierDe))) { if (!vers || vers === de || !dirSet.has(vers)) continue; const k = garde(de, vers); if (k) n.set(k, (n.get(k) || 0) + 1); }
    }
    return n;
  };
  if (!chemin) {
    const hauts = domaines.map((d, i) => ({ nom: d.id, chemin: 'domaines/' + d.id, couleur: ORBITE_COULEURS[i % ORBITE_COULEURS.length], resume: d.couvre, domaine: true }))
      .concat(dirs.filter(d => !d.includes('/') && !ORBITE_HORS.has(d) && files.some(f => f.p === d + '/_index.md')).map(d => ({ nom: d, chemin: d, couleur: ORBITE_NEUTRE, resume: '' })));
    const enfants = hauts.map(x => { const fs_ = dans(x.chemin); return { ...x, n: fs_.length, semaine: fraicheur(fs_).semaine, parts: partsDe(x.chemin, x.couleur) }; }).filter(x => x.n > 0);
    const paires = liensEntre(compte, (a, b) => a < b ? a + '|' + b : b + '|' + a);
    const liens = [...paires].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => { const [a, b] = k.split('|'); return { a: { nom: a.split('/').pop(), chemin: a, couleur: orbiteCouleur(domaines, a) }, b: { nom: b.split('/').pop(), chemin: b, couleur: orbiteCouleur(domaines, b) }, n }; });
    return { chemin: '', fil: orbiteFil('', false), mode: 'carte', centre: { nom: 'AGENTS.md', chemin: 'AGENTS.md' }, enfants, liens, total: compte.length };
  }
  const clean = String(chemin).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!dirSet.has(clean)) throw httpError(404, 'Dossier introuvable');
  const couleur = orbiteCouleur(domaines, clean), dom = /^domaines\/([^/]+)$/.exec(clean), d = dom ? domaines.find(x => x.id === dom[1]) : null;
  const centre = { nom: clean.split('/').pop(), chemin: clean, couleur, index: files.some(f => f.p === clean + '/_index.md') ? clean + '/_index.md' : '', routeur: d ? 'routers/' + d.id + '.md' : '', resume: d ? d.couvre : resumeIndex(clean) };
  if (!seulFichiers && sousDossiers(clean).length) {
    /* a folder of indexes: its parts, and its links to the rest of the workspace, added up by top folder */
    const haut = c => c.startsWith('domaines/') ? c.split('/').slice(0, 2).join('/') : c.split('/')[0];
    const sortants = liensEntre(dans(clean), (de, vers) => orbiteDans(vers, clean) ? '' : haut(vers));
    const liens = [...sortants].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, n]) => ({ nom: c.split('/').pop(), chemin: c, couleur: orbiteCouleur(domaines, c), n }));
    return { chemin: clean, fil: orbiteFil(clean, false), mode: 'dossiers', centre, couleur, enfants: partsDe(clean, couleur), liens, total: dans(clean).length };
  }
  /* an index: its files, each in one group of the chosen cut; only the cuts that make two groups are offered */
  const directs = compte.filter(f => orbiteParent(f.p) === clean).map(f => ({ f, d: disqueDate(f) })).sort((a, b) => b.d - a.d);
  /* a status ranks by its place in its type's life; the ones that end it come after all the living ones */
  const rangStatut = new Map();
  for (const r of tablesOf(readText(path.join(root, 'systeme', 'metadonnees.md')), 'Type')) {
    const fin = String(r.Fin || '').split(',').map(s => s.trim());
    String(r.Statuts || '').split(',').map(s => s.trim()).forEach((s, i) => { if (!s || s === '—') return; const k = (fin.includes(s) ? 100 : 0) + i; if (!rangStatut.has(s) || k < rangStatut.get(s)) rangStatut.set(s, k); });
  }
  const annee = new Date(now).getFullYear();
  const groupe = {
    mois: ({ d }) => {
      if (now - d < 7 * DISQUE_JOUR) return ['semaine', 'Cette semaine', 0];
      if (d >= debutMois) return ['ce-mois', 'Ce mois-ci', 1];
      const x = new Date(d), age = (annee - x.getFullYear()) * 12 + new Date(now).getMonth() - x.getMonth();
      if (age > 12) return ['ancien', 'Plus ancien', 99];
      return [x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0'), DISQUE_NOMS_MOIS[x.getMonth()] + (x.getFullYear() === annee ? '' : ' ' + x.getFullYear()), 1 + age];
    },
    statut: ({ f }) => { const s = f.h && f.h.statut; return s ? [s, disqueStatut(s), rangStatut.has(s) ? rangStatut.get(s) : 150] : ['_', 'Sans statut', 999]; },
    projet: ({ f }) => { const s = disquePremier(f.h && f.h.projet); return s ? [s, s, null] : ['_', 'Hors projet', 99]; },
    type: ({ f }) => { const s = f.h && f.h.type; return s ? [s, s, null] : ['_', 'Sans type', 99]; },
    liens: ({ f }) => {
      const n = new Map(); for (const c of disqueCibles(root, f)) { const v = dossierDe(c); if (v && v !== clean && dirSet.has(v)) n.set(v, (n.get(v) || 0) + 1); }
      const top = [...n].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
      return top ? [top[0], top[0].split('/').pop(), null, orbiteCouleur(domaines, top[0])] : ['_', 'Sans lien', 99];
    },
    theme: ({ f }) => { const s = disquePremier(f.h && f.h.themes); return s ? [s.toLowerCase(), s, null] : ['_', 'Sans thème', 99]; },
    echeance: ({ f }) => {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((f.h && f.h.echeance) || ''); if (!m) return ['_', 'Sans échéance', 99];
      const e = new Date(+m[1], m[2] - 1, +m[3], 23, 59).getTime(), x = new Date(e);
      return e < now ? ['retard', 'En retard', 0] : e - now < 7 * DISQUE_JOUR ? ['semaine', 'Cette semaine', 1] : x.getMonth() === new Date(now).getMonth() && x.getFullYear() === annee ? ['mois', 'Ce mois-ci', 2] : ['plus-tard', 'Plus tard', 3];
    }
  };
  const cuts = DISQUE_CRITERES.map(([id, nom]) => {
    const g = new Map();
    directs.forEach(x => { const [k, n, rang, c] = groupe[id](x); if (!g.has(k)) g.set(k, { id: k, nom: n, rang, couleur: c || '', n: 0 }); g.get(k).n++; });
    /* fixed orders where there is one (time, life of a status); else the biggest group first, the "without" last */
    const groupes = [...g.values()].sort((a, b) => (a.rang ?? (a.id === '_' ? 99 : 50)) - (b.rang ?? (b.id === '_' ? 99 : 50)) || b.n - a.n);
    return { id, nom, groupes };
  });
  const utiles = cuts.filter(c => c.id === 'mois' || c.groupes.length >= 2), choix = utiles.find(c => c.id === par) || utiles[0];
  const ordre = new Map(choix.groupes.map((g, i) => [g.id, i]));
  const fichiers = directs.map(x => ({ x, g: groupe[choix.id](x)[0] })).sort((a, b) => ordre.get(a.g) - ordre.get(b.g) || b.x.d - a.x.d).slice(0, ORBITE_LISTE)
    .map(({ x, g }) => ({ chemin: x.f.p, titre: (x.f.t || x.f.p.split('/').pop()).slice(0, 90), resume: x.f.h && x.f.h.resume || '', taille: x.f.s, d: x.d, g }));
  const racine = !!seulFichiers && sousDossiers(clean).length > 0;
  return { chemin: clean, fichiers: racine, fil: orbiteFil(clean, racine), mode: 'index', centre, couleur, total: directs.length,
    par: choix.id, criteres: utiles.map(c => ({ id: c.id, nom: c.nom, n: c.groupes.length })), inutiles: cuts.filter(c => !utiles.includes(c)).map(c => c.nom), groupes: choix.groupes.map(({ rang, ...g }) => g), liste: fichiers };
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
/* AIOS : opening the Second Brain rebuilds its map when it is older than 30 s, so it always shows the workspace as it is now */
async function freshBrain() {
  let built = 0; try { built = Date.parse(JSON.parse(fs.readFileSync(path.join(DATA, 'brain-meta.json'), 'utf8')).builtAt) || 0; } catch (_) { }
  if (Date.now() - built > 30000) await refreshBrain();
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
   Only the page files are served: the shell, the homepage, assets/, brain/, views/, fichiers/, bibliotheque/ and the two
   page data files. Config, snapshots, logs, engine and refresh code are never served. */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.gif': 'image/gif', '.mp4': 'video/mp4', '.txt': 'text/plain' };
const PUBLIC_FILES = new Set(['index.html', 'os.html', 'copy.css', 'copy.js', 'shell-extras.js', 'view-transitions.js', 'widgets.html']);
const PUBLIC_DIRS = ['assets', 'brain', 'views', 'fichiers', 'bibliotheque', 'projets', 'competences', 'connecteurs', 'outbox', 'orbite', 'disque'];
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
    /* ---- the file editor ---- */
    if (p2.startsWith('/local/files') && !post) {
      try {
        if (p2 === '/local/files') return sendJson(res, listFiles());
        if (p2 === '/local/files/read') { const r = readForEditor(u.searchParams.get('path')); if (u.searchParams.get('stat')) delete r.content; return sendJson(res, r); }
        if (p2 === '/local/files/search') return sendJson(res, searchFiles(u.searchParams.get('q')));
        if (p2 === '/local/files/raw') return serveRaw(req, res, u.searchParams.get('path'));
      } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); }
    }
    if (p2 === '/local/assets' && !post) return sendJson(res, listAssets());
    /* ---- the project page ---- */
    if (p2.startsWith('/local/projets') && !post) {
      try {
        if (p2 === '/local/projets') return sendJson(res, listProjects());
        if (p2 === '/local/projets/lire') return sendJson(res, await readProject(u.searchParams.get('path')));
        if (p2 === '/local/projets/changements') return sendJson(res, await projectChanges(u.searchParams.get('path'), u.searchParams.get('depuis')));
      } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); }
    }
    /* ---- the skills page ---- */
    if (p2 === '/local/competences' && !post) { try { return sendJson(res, await listSkills()); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); } }
    /* ---- the connectors page ---- */
    if (p2 === '/local/connecteurs' && !post) { try { return sendJson(res, await listConnecteurs()); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); } }
    /* ---- the outbox page ---- */
    if (p2 === '/local/outbox' && !post) { try { return sendJson(res, await listOutbox()); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); } }
    /* ---- the 3D home ---- */
    if (p2 === '/local/orbite' && !post) { try { return sendJson(res, orbiteNiveau(u.searchParams.get('chemin') || '', u.searchParams.get('fichiers') === '1')); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); } }
    if (p2 === '/local/orbite/fichier' && !post) { try { return sendJson(res, orbiteFichier(u.searchParams.get('chemin'))); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); } }
    if (p2 === '/local/disque' && !post) { try { return sendJson(res, disqueNiveau(u.searchParams.get('chemin') || '', u.searchParams.get('fichiers') === '1', u.searchParams.get('par') || '')); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); } }
    if (p2 === '/data/accueil.js') return sendScript(res, 'window.SM4RT_ACCUEIL=' + JSON.stringify(ACCUEIL) + ';');
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
    if (post && p2 === '/api/email-learn') {
      let q; try { q = JSON.parse(await readBody(req) || '{}'); } catch (e) { return sendJson(res, { error: 'le corps de la requête n’est pas du JSON' }, 400); }
      try { return sendJson(res, learnMail(q)); } catch (e) { return sendJson(res, { error: e.message }, e.status || 400); }
    }
    if (post && p2 === '/local/files/save') {
      let q; try { q = JSON.parse(await readBody(req) || '{}'); } catch (e) { return sendJson(res, { error: e.status ? e.message : 'le corps de la requête n’est pas du JSON' }, e.status || 400); }
      try { const r = await saveFile(q); return sendJson(res, r, r.conflict ? 409 : 200); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); }
    }
    if (post && p2 === '/local/outbox/ranger') {
      let q; try { q = JSON.parse(await readBody(req) || '{}'); } catch (e) { return sendJson(res, { error: e.status ? e.message : 'le corps de la requête n’est pas du JSON' }, e.status || 400); }
      try { return sendJson(res, await setRanges(q)); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); }
    }
    if (post && p2 === '/local/competences/retour') {
      let q; try { q = JSON.parse(await readBody(req) || '{}'); } catch (e) { return sendJson(res, { error: e.status ? e.message : 'le corps de la requête n’est pas du JSON' }, e.status || 400); }
      try { return sendJson(res, addSkillNote(q)); } catch (e) { return sendJson(res, { error: e.message }, e.status || 500); }
    }
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
      const { target, path: rel, reveal } = JSON.parse(await readBody(req) || '{}');
      try { return sendJson(res, { opened: openTarget(target || rel, reveal === true) }); } catch (e) { return sendJson(res, { error: e.message }, 400); }
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
    if (p2 === '/fichiers') { res.writeHead(302, { Location: '/fichiers/' }); return res.end(); }
    if (p2 === '/fichiers/') return serveFile(req, res, path.join(KIT, 'fichiers', 'index.html'));
    if (p2 === '/bibliotheque') { res.writeHead(302, { Location: '/bibliotheque/' }); return res.end(); }
    if (p2 === '/projets') { res.writeHead(302, { Location: '/projets/' }); return res.end(); }
    if (p2 === '/projets/') return serveFile(req, res, path.join(KIT, 'projets', 'index.html'));
    if (p2 === '/competences') { res.writeHead(302, { Location: '/competences/' }); return res.end(); }
    if (p2 === '/competences/') return serveFile(req, res, path.join(KIT, 'competences', 'index.html'));
    if (p2 === '/connecteurs') { res.writeHead(302, { Location: '/connecteurs/' }); return res.end(); }
    if (p2 === '/connecteurs/') return serveFile(req, res, path.join(KIT, 'connecteurs', 'index.html'));
    if (p2 === '/outbox') { res.writeHead(302, { Location: '/outbox/' }); return res.end(); }
    if (p2 === '/orbite') { res.writeHead(302, { Location: '/orbite/' }); return res.end(); }
    if (p2 === '/orbite/') return serveFile(req, res, path.join(KIT, 'orbite', 'index.html'));
    if (p2 === '/disque') { res.writeHead(302, { Location: '/disque/' }); return res.end(); }
    if (p2 === '/disque/') return serveFile(req, res, path.join(KIT, 'disque', 'index.html'));
    if (p2 === '/outbox/') return serveFile(req, res, path.join(KIT, 'outbox', 'index.html'));
    if (p2 === '/bibliotheque/') return serveFile(req, res, path.join(KIT, 'bibliotheque', 'index.html'));
    if (p2.startsWith('/artifacts/')) {
      let rel; try { rel = decodeURIComponent(p2.slice('/artifacts/'.length)); } catch (_) { rel = null; }
      const f = rel && !rel.startsWith('_trash') ? inside(ARTIFACTS, rel) : null;
      return f ? serveFile(req, res, f) : sendJson(res, { error: 'introuvable' }, 404);
    }
    if (p2 === '/brain/snapshot.js') await freshBrain();
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

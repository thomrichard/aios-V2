/* Reader for one agent: used ONLY if your agent is Claude Code. On any other setup the
   folders below do not exist, every function here returns nothing, and the OS falls back to
   snapshots/routines.json and snapshots/usage-log.jsonl (see ROUTINES.md and USAGE.md).
   Reads files on this machine only, calls no model, and never writes outside data/.

   - Scheduled tasks: one folder per task under ~/.claude/scheduled-tasks (its SKILL.md holds
     the description). The schedule itself is kept by the desktop app in scheduled-tasks.json
     files under its app-data folder (Windows %APPDATA%\Claude, macOS ~/Library/Application
     Support/Claude, Linux ~/.config/Claude).
   - Session logs: ~/.claude/projects/<project>/<session>.jsonl and their subagents. A skill run
     starts at the "Base directory for this skill" line the log writes when a skill loads and lasts
     until the next skill load or prompt. A routine run is a session that starts with a
     <scheduled-task> prompt. Every model call counts once by its message id. */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const HOME = os.homedir();
const TASKS = path.join(HOME, '.claude', 'scheduled-tasks');
const PROJECTS = path.join(HOME, '.claude', 'projects');
const KIT = path.resolve(__dirname, '..', '..');
const CACHE = path.join(KIT, 'data', 'usage-cache.json');
const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const taskRoutineId = name => 'rt:task-' + slug(name);

function appDataDirs() {
  const out = [];
  if (process.env.APPDATA) out.push(path.join(process.env.APPDATA, 'Claude', 'claude-code-sessions'));
  out.push(path.join(HOME, 'Library', 'Application Support', 'Claude', 'claude-code-sessions'));
  out.push(path.join(HOME, '.config', 'Claude', 'claude-code-sessions'));
  return out.filter(d => { try { return fs.statSync(d).isDirectory(); } catch { return false; } });
}
function scheduleFiles() {
  const files = [];
  for (const base of appDataDirs()) {
    const visit = (dir, depth) => {
      let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of list) {
        const p = path.join(dir, e.name);
        if (e.isFile() && e.name === 'scheduled-tasks.json') files.push(p);
        else if (e.isDirectory() && depth < 3) visit(p, depth + 1);
      }
    };
    visit(base, 0);
  }
  return files;
}
const describe = file => { try { const t = fs.readFileSync(file, 'utf8'), m = /^description:\s*(.+)$/m.exec(t); return m ? m[1].replace(/^["']|["']$/g, '').trim() : ''; } catch { return ''; } };

/* The desktop scheduler's tasks, as routines. Null when there is no such scheduler here. */
function scheduledTasks() {
  let folders = [];
  try { folders = fs.readdirSync(TASKS, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { }
  const byId = new Map();
  for (const f of scheduleFiles().map(p => ({ p, t: fs.statSync(p).mtimeMs })).sort((a, b) => a.t - b.t)) {
    let d; try { d = JSON.parse(fs.readFileSync(f.p, 'utf8')); } catch { continue; }
    for (const task of (d && d.scheduledTasks) || []) if (task && task.id) byId.set(task.id, { ...task, _asOf: new Date(f.t).toISOString() });
  }
  if (!folders.length && !byId.size) return null;
  const ids = new Set([...folders, ...byId.keys()]);
  const routines = [...ids].sort().map(id => {
    const t = byId.get(id) || {}, file = path.join(TASKS, id, 'SKILL.md');
    const cron = typeof t.cronExpression === 'string' && t.cronExpression.trim().split(/\s+/).length === 5 ? t.cronExpression.trim() : null;
    const once = !cron && Number.isFinite(+t.fireAt) && +t.fireAt > 0 ? +t.fireAt : null;
    const status = !byId.has(id) ? 'ondemand' : t.enabled === false ? 'paused' : (cron || once) ? 'active' : 'ondemand';
    return {
      id: taskRoutineId(id), name: String(t.displayName || id).replace(/[-_]+/g, ' ').slice(0, 100), desc: describe(file).slice(0, 300),
      cron, once, times: [], days: null, dom: null, status, path: fs.existsSync(file) ? file : null,
      sourceAsOf: t._asOf || null, origin: 'desktop scheduler', scheduleText: cron ? 'cron ' + cron : once ? 'once' : 'On demand',
    };
  });
  return { key: 'agent-tasks', label: 'SCHEDULED TASKS', routines };
}

/* ---------- session logs ---------- */
const VERSION = 1;
const tsOf = line => { const m = /"timestamp":"([^"]+)"/.exec(line); return m ? Date.parse(m[1]) : NaN; };
const SKILL_LOAD = /^Base directory for this skill: (.+)/;
function summarize(file, kind) {
  const text = fs.readFileSync(file, 'utf8');
  const s = { v: VERSION, kind, first: 0, last: 0, task: null, runs: [], msgs: [] };
  const byId = new Map(); let run = -1, started = false;
  const boundary = ms => { if (run >= 0) s.runs[run].end = ms; run = -1; };
  const startRun = (name, ms, cmd) => { if (run >= 0) s.runs[run].end = ms; s.runs.push({ s: name, t: ms, end: ms, cmd: cmd ? 1 : 0 }); run = s.runs.length - 1; };
  let i = 0;
  while (i < text.length) {
    let j = text.indexOf('\n', i); if (j < 0) j = text.length;
    const line = text.slice(i, j); i = j + 1;
    if (line.length < 20) continue;
    const isA = line.includes('"type":"assistant"'), isU = !isA && line.includes('"type":"user"');
    if (!isA && !isU) continue;
    const ms = tsOf(line); if (!(ms > 0)) continue;
    if (!s.first || ms < s.first) s.first = ms; if (ms > s.last) s.last = ms;
    if (isU) {
      const interesting = line.includes('Base directory for this skill') || line.includes('<command-name>') || line.includes('<scheduled-task');
      if (!interesting) { if (!line.includes('"isMeta":true') && !line.includes('"tool_result"')) { started = true; if (kind === 'main') boundary(ms); } continue; }
      let u; try { u = JSON.parse(line); } catch { continue; }
      const c = u.message && u.message.content, texts = typeof c === 'string' ? [c] : Array.isArray(c) ? c.filter(x => x && x.type === 'text').map(x => x.text) : [];
      if (Array.isArray(c) && c.some(x => x && x.type === 'tool_result')) continue;
      for (const t of texts) {
        const load = SKILL_LOAD.exec(t);
        if (load) { startRun(path.basename(load[1].trim().replace(/[\\/]+$/, '')), ms, false); continue; }
        const task = /<scheduled-task name="([^"]+)"/.exec(t);
        if (task && !started && kind === 'main') s.task = task[1];
        const cmd = /<command-name>\/?([^<\s]+)<\/command-name>/.exec(t);
        if (!u.isMeta && kind === 'main') boundary(ms);
        if (cmd) startRun(cmd[1], ms, true);
      }
      started = true;
      continue;
    }
    let a; try { a = JSON.parse(line); } catch { continue; }
    const m = a.message || {}; if (!m.id) continue;
    let e = byId.get(m.id);
    if (!e) {
      const u = m.usage, ok = u && m.model && m.model !== '<synthetic>';
      const tok = ok ? (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0) : 0;
      e = [m.id, ms, tok, ok ? cost(m.model, u) : 0, run, []]; byId.set(m.id, e); s.msgs.push(e);
      if (run >= 0) s.runs[run].end = ms;
    }
    for (const b of Array.isArray(m.content) ? m.content : []) {
      if (!b || b.type !== 'tool_use') continue;
      const name = b.name || '';
      if (name.startsWith('mcp__')) { const parts = name.split('__'); e[5].push('m:' + parts[1]); }
      else if ((name === 'Bash' || name === 'PowerShell') && b.input && b.input.command) {
        // only the command names and local ports are kept, never the full command (it can hold values you typed)
        const cmd = String(b.input.command);
        for (const m of cmd.matchAll(/(?:^|[;&|(\n]|&&|\|\|)\s*(?:sudo\s+|npx\s+)?([A-Za-z][A-Za-z0-9._-]{0,30})(?=\s|$)/g)) e[5].push('w:' + m[1].toLowerCase());
        for (const m of cmd.matchAll(/(?:localhost|127\.0\.0\.1):(\d{2,5})/g)) e[5].push('p:' + m[1]);
      }
    }
  }
  if (run >= 0 && kind === 'main') s.runs[run].end = Math.max(s.runs[run].end, s.last);
  for (const e of s.msgs) if (!e[5].length) e.length = 5;
  return s;
}
/* Standard API rates (USD per million tokens), for an API-equivalent estimate checked in
   October 2026. Not a subscription bill. A model that matches no line gets no dollar figure.
   First match wins, so exact models sit above their family. Update as prices change. */
const RATES = [
  [/opus-5-5/, { input: 4, output: 20, cacheRead: .2, cacheWrite: 5 }],
  [/sonnet-5-5/, { input: 2, output: 10, cacheRead: .1, cacheWrite: 2.5 }],
  [/haiku-5-5/, { input: .1, output: .5, cacheRead: .01, cacheWrite: .125 }],
  [/opus-5/, { input: 5, output: 25, cacheRead: .5, cacheWrite: 6.25 }],
  [/haiku-4-5/, { input: 1, output: 5, cacheRead: .1, cacheWrite: 1.25 }],
  [/opus/, { input: 5, output: 25, cacheRead: .5, cacheWrite: 6.25 }],
  [/sonnet/, { input: 3, output: 15, cacheRead: .3, cacheWrite: 3.75 }],
  [/haiku/, { input: 1, output: 5, cacheRead: .1, cacheWrite: 1.25 }],
];
function cost(model, u) {
  const r = (RATES.find(([re]) => re.test(String(model))) || [])[1];
  if (!r) return 0;
  return +(((u.input_tokens || 0) * r.input + (u.output_tokens || 0) * r.output + (u.cache_read_input_tokens || 0) * r.cacheRead + (u.cache_creation_input_tokens || 0) * r.cacheWrite) / 1e6).toFixed(6);
}

/* Reads the last `days` days of session logs. Null when there are no such logs here. */
function sessionUsage(days = 30) {
  let projects; try { projects = fs.readdirSync(PROJECTS); } catch { return null; }
  const cutoff = Date.now() - days * 864e5, files = [];
  for (const proj of projects) {
    const dir = path.join(PROJECTS, proj); let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of list) {
      if (e.isFile() && e.name.endsWith('.jsonl')) files.push({ file: path.join(dir, e.name), kind: 'main', session: e.name.slice(0, -6), proj });
      if (e.isDirectory()) { const sub = path.join(dir, e.name, 'subagents'); try { for (const f of fs.readdirSync(sub)) if (f.endsWith('.jsonl')) files.push({ file: path.join(sub, f), kind: 'sub', session: e.name, proj }); } catch { } }
    }
  }
  let cache = { v: VERSION, files: {} };
  try { const c = JSON.parse(fs.readFileSync(CACHE, 'utf8')); if (c.v === VERSION) cache = c; } catch { }
  const next = { v: VERSION, files: {} }, summaries = [];
  for (const f of files) {
    let st; try { st = fs.statSync(f.file); } catch { continue; }
    if (st.mtimeMs < cutoff) continue;
    const hit = cache.files[f.file];
    let s;
    if (hit && hit.size === st.size && hit.mtime === st.mtimeMs) s = hit.s;
    else { try { s = summarize(f.file, f.kind); } catch { continue; } }
    next.files[f.file] = { size: st.size, mtime: st.mtimeMs, s };
    summaries.push({ ...f, s });
  }
  try { fs.mkdirSync(path.dirname(CACHE), { recursive: true }); fs.writeFileSync(CACHE, JSON.stringify(next)); } catch { }
  // one pass over every model call, each counted once
  summaries.sort((a, b) => (a.s.first || 0) - (b.s.first || 0));
  const seen = new Set(), dayTotals = {}, runs = new Map(), toolDays = {}, mainBySession = new Map();
  const dayOf = ms => new Date(ms).toISOString().slice(0, 10);
  for (const x of summaries) if (x.kind === 'main') mainBySession.set(x.proj + '/' + x.session, x);
  for (const x of summaries) {
    const local = x.s.runs.map(r => { const key = r.s + '|' + r.t; if (!runs.has(key)) runs.set(key, { ...r, tok: 0, cost: 0, sub: 0, kind: x.kind, proj: x.proj, session: x.session }); else runs.get(key).end = Math.max(runs.get(key).end, r.end); return runs.get(key); });
    x.tok = 0; x.cost = 0; x.headTok = 0; x.headCost = 0;
    for (const [id, ms, tok, c, ri, tools] of x.s.msgs) {
      if (seen.has(id)) continue; seen.add(id);
      if (ms < cutoff) continue;
      const d = dayOf(ms), t = dayTotals[d] || (dayTotals[d] = { tok: 0, cost: 0 }); t.tok += tok; t.cost += c;
      x.tok += tok; x.cost += c;
      if (ri >= 0 && local[ri]) { local[ri].tok += tok; local[ri].cost += c; } else { x.headTok += tok; x.headCost += c; }
      for (const k of tools || []) { const e = toolDays[k] || (toolDays[k] = {}); e[d] = (e[d] || 0) + 1; }
    }
  }
  const runList = [...runs.values()];
  for (const x of summaries.filter(x => x.kind === 'sub')) {
    const parent = mainBySession.get(x.proj + '/' + x.session); if (!parent) continue;
    const at = x.s.first, owner = runList.filter(r => r.kind === 'main' && r.proj === x.proj && r.session === x.session && r.t <= at + 1000 && at <= r.end + 5000).sort((a, b) => a.t - b.t).pop();
    if (owner) { owner.tok += x.headTok; owner.cost += x.headCost; owner.sub++; }
    if (parent.s.task) { parent.subTok = (parent.subTok || 0) + x.tok; parent.subCost = (parent.subCost || 0) + x.cost; }
  }
  const taskRuns = summaries.filter(x => x.kind === 'main' && x.s.task && x.s.first >= cutoff)
    .map(x => ({ routine: taskRoutineId(x.s.task), t: x.s.first, tok: x.tok + (x.subTok || 0), cost: x.cost + (x.subCost || 0) }));
  return {
    source: 'session logs', files: summaries.length, dayTotals,
    skillRuns: runList.filter(r => r.t >= cutoff).map(r => ({ name: r.s, t: r.t, tok: r.tok, cost: r.cost, sub: r.sub, cmd: !!r.cmd })),
    routineRuns: taskRuns, toolDays,
  };
}

module.exports = { scheduledTasks, sessionUsage, taskRoutineId };

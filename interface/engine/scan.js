/* Second Brain engine: workspace scanner.
   Walks the workspace named in config/workspace.json, sorts every entry into the
   ARMS model (Applications / Routines / Memory / Skills), gives each file a
   department and an access level, reads markdown links, and builds the graph the
   Second Brain draws. Zero dependencies. Used by engine/server.js and by
   refresh/brain.mjs. Run it alone to see the counts:  node engine/scan.js */
'use strict';
const fs = require('fs');
const path = require('path');

const KIT = path.resolve(__dirname, '..');
const CONFIG_DIR = path.join(KIT, 'config');
const CACHE_FILE = path.join(KIT, 'data', 'links-cache.json');

function loadJSON(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}
function workspaceConfig() {
  return loadJSON(path.join(CONFIG_DIR, 'workspace.json'), {});
}
/* The workspace root: an absolute path, or a path relative to this kit folder.
   Blank means "not set up yet", and the scan returns an empty map. */
function resolveRoot(ws) {
  const raw = String(ws.root || '').trim();
  if (!raw) return null;
  const abs = path.resolve(KIT, raw);
  try { return fs.statSync(abs).isDirectory() ? abs : null; } catch { return null; }
}

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.venv', 'venv', '__pycache__', '.next', '.cache',
  '.stversions', '.stfolder', 'dist', 'coverage', '.turbo', '.parcel-cache',
  '.pytest_cache', '.idea', '.vscode-server', '.Trash', '$RECYCLE.BIN',
]);
const EXCLUDE_FILES = /^(thumbs\.db|desktop\.ini|\.ds_store|~\$|\.syncthing\.)/i;
const MD_MAX_READ = 1024 * 1024; // markdown files above 1 MB are not read for links

// Secret-looking files: always local only, never shown in the file viewer.
const SECRET_RE = /(^|\/)\.env(\.|$)|\.pem$|\.key$|\.p12$|\.pfx$|(^|[-_./])secrets?([-_.]|$)|credential|token\.json$|apikey|api[-_]?keys?\b|id_rsa|id_ed25519|\.kdbx$/i;
function isSecret(rel) { return SECRET_RE.test(rel); }

function loadConfig() {
  const ws = workspaceConfig();
  const dep = loadJSON(path.join(CONFIG_DIR, 'departments.json'), { departments: [], layers: [], projectPrefixes: {}, pathRules: [], memoryKeywords: [], default: 'general' });
  dep.departments = dep.departments || [];
  dep.layers = dep.layers || [];
  if (!dep.departments.length) dep.departments = [{ key: 'general', label: 'Général', color: '#9a66e0', icon: 'data' }];
  const badDefault = dep.default && !dep.departments.some(d => d.key === dep.default) ? dep.default : null;
  if (!dep.default || badDefault) dep.default = dep.departments[0].key;
  const apps = loadJSON(path.join(CONFIG_DIR, 'apps.json'), { apps: [] }).apps || [];
  const agentRoster = loadJSON(path.join(CONFIG_DIR, 'agents.json'), { agents: [] }).agents || [];
  const overrides = loadJSON(path.join(CONFIG_DIR, 'access-overrides.json'), { overrides: [] }).overrides || [];
  /* department rules with the wrong shape are skipped with a warning, never silently */
  const warnings = [], keys = new Set(dep.departments.map(d => d.key)), F = 'config/departments.json';
  const okDept = k => typeof k === 'string' && keys.has(k);
  const pp = dep.projectPrefixes && typeof dep.projectPrefixes === 'object' && !Array.isArray(dep.projectPrefixes) ? dep.projectPrefixes : {};
  if (dep.projectPrefixes !== undefined && pp !== dep.projectPrefixes) warnings.push(F + ' : projectPrefixes doit être un objet comme { "client-": "clients" } (ignoré)');
  dep._prefixes = Object.entries(pp).filter(([pre, d]) => { const ok = pre && okDept(d); if (!ok) warnings.push(F + ' : projectPrefixes "' + pre + '" pointe vers "' + d + '", qui n’est pas une clé de domaine (ignoré)'); return ok; }).sort((a, b) => b[0].length - a[0].length);
  dep.memoryKeywords = (Array.isArray(dep.memoryKeywords) ? dep.memoryKeywords : []).filter((r, i) => {
    const ok = r && Array.isArray(r.match) && r.match.every(w => typeof w === 'string') && okDept(r.dept);
    if (!ok) warnings.push(F + ' : memoryKeywords[' + i + '] doit suivre { "match": ["mot"], "dept": "<clé du domaine>" } (ignoré)');
    else r.match = r.match.map(w => w.toLowerCase());
    return ok;
  });
  dep.pathRules = (Array.isArray(dep.pathRules) ? dep.pathRules : []).filter((r, i) => {
    const ok = r && typeof r.prefix === 'string' && r.prefix && okDept(r.dept);
    if (!ok) warnings.push(F + ' : pathRules[' + i + '] doit suivre { "prefix": "dossier/", "dept": "<clé du domaine>" } (ignoré)');
    return ok;
  });
  if (badDefault) warnings.push(F + ' : default "' + badDefault + '" n’est pas une clé de domaine, on prend "' + dep.default + '"');
  overrides.sort((a, b) => (b.prefix || '').length - (a.prefix || '').length);
  const skillDirs = (ws.skillDirs || []).map(d => String(d).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')).filter(Boolean);
  const routerDoc = String(ws.routerDoc || 'AGENTS.md').replace(/\\/g, '/');
  const spine = new Set(['', ...(ws.visibleRoots || [])].map(d => String(d).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')));
  return { ws, dep, apps, agentRoster, overrides, skillDirs, routerDoc, spine, warnings };
}

// ---------- classification ----------
function accessOf(rel, cfg) {
  if (isSecret(rel)) return 'local';
  for (const o of cfg.overrides) if (rel.startsWith(o.prefix)) return o.access;
  for (const p of (cfg.ws.sharedPrefixes || [])) if (p && rel.startsWith(p)) return 'both';
  return 'local';
}
function layerOf(rel, cfg) {
  for (const d of cfg.skillDirs) if (rel === d || rel.startsWith(d + '/')) return 'S';
  return 'M';
}
function deptOf(rel, name, cfg) {
  const d = cfg.dep, ws = cfg.ws;
  if (ws.projectsDir && rel.startsWith(ws.projectsDir.replace(/\/+$/, '') + '/')) {
    const seg = rel.slice(ws.projectsDir.replace(/\/+$/, '').length + 1).split('/')[0] || '';
    for (const [pre, dept] of d._prefixes) if (seg.startsWith(pre)) return dept;
  }
  if (ws.memoryDir && rel.startsWith(ws.memoryDir.replace(/\/+$/, '') + '/')) {
    const lower = name.toLowerCase();
    for (const rule of d.memoryKeywords || []) if ((rule.match || []).some(k => lower.includes(k))) return rule.dept;
  }
  for (const r of d.pathRules || []) if (r.prefix && rel.startsWith(r.prefix)) return r.dept;
  return d.default;
}

// ---------- filesystem walk ----------
// Follows folder links (symlinks and junctions) once each, and never walks this kit's own folder.
function walk(rootAbs, maxFiles) {
  const files = [];
  const dirs = new Map();
  dirs.set('', { rel: '', name: path.basename(rootAbs) || 'workspace', parent: null, files: 0, mdFiles: 0, bytes: 0, childDirs: [], childFiles: [] });
  const seen = new Set();
  let kitReal = null; try { kitReal = fs.realpathSync(KIT); } catch { }
  let truncated = false;
  function rec(abs, rel) {
    let real; try { real = fs.realpathSync(abs); } catch { return; }
    if (seen.has(real) || (kitReal && real === kitReal)) return;
    seen.add(real);
    let entries;
    try { entries = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
    const dnode = dirs.get(rel);
    for (const e of entries) {
      if (files.length >= maxFiles) { truncated = true; return; }
      const name = e.name, full = path.join(abs, name);
      let isDir = e.isDirectory(), isFile = e.isFile();
      if (e.isSymbolicLink()) { try { const st = fs.statSync(full); isDir = st.isDirectory(); isFile = st.isFile(); } catch { continue; } }
      if (isDir) {
        if (EXCLUDE_DIRS.has(name) || name.startsWith('.stversions')) continue;
        const crel = rel ? rel + '/' + name : name;
        dirs.set(crel, { rel: crel, name, parent: rel, files: 0, mdFiles: 0, bytes: 0, childDirs: [], childFiles: [] });
        dnode.childDirs.push(crel);
        rec(full, crel);
      } else if (isFile) {
        if (EXCLUDE_FILES.test(name)) continue;
        const crel = rel ? rel + '/' + name : name;
        let st;
        try { st = fs.statSync(full); } catch { continue; }
        files.push({ rel: crel, name, ext: path.extname(name).toLowerCase(), size: st.size, mtime: st.mtimeMs, parent: rel });
        dnode.childFiles.push(files.length - 1);
      }
    }
  }
  rec(rootAbs, '');
  const byDepth = [...dirs.values()].sort((a, b) => b.rel.split('/').length - a.rel.split('/').length);
  for (const d of byDepth) {
    for (const fi of d.childFiles) { const f = files[fi]; d.files++; d.bytes += f.size; if (f.ext === '.md') d.mdFiles++; }
    if (d.parent !== null && dirs.has(d.parent)) { const p = dirs.get(d.parent); p.files += d.files; p.bytes += d.bytes; p.mdFiles += d.mdFiles; }
  }
  return { files, dirs, truncated };
}

// ---------- markdown links (cached by edit time) ----------
function extractLinks(root, files, cache) {
  const mdFiles = files.filter(f => f.ext === '.md' && f.size <= MD_MAX_READ);
  const base = new Map();
  for (const f of mdFiles) { const key = f.name.slice(0, -3).toLowerCase(); if (!base.has(key)) base.set(key, []); base.get(key).push(f.rel); }
  const relSet = new Set(files.map(f => f.rel));
  const out = [], newCache = {};
  let read = 0, cached = 0;
  for (const f of mdFiles) {
    const c = cache[f.rel];
    if (c && c.m === f.mtime) { cached++; newCache[f.rel] = c; }
    else {
      let txt = '';
      try { txt = fs.readFileSync(path.join(root, f.rel), 'utf8'); read++; } catch { continue; }
      const targets = new Set();
      for (const m of txt.matchAll(/\[\[([^\]|#\n]+)/g)) {
        const hits = base.get(m[1].trim().replace(/\.md$/i, '').toLowerCase());
        if (hits && hits.length) targets.add(pickClosest(f.rel, hits));
      }
      for (const m of txt.matchAll(/\]\(([^)#?\s]+\.(?:md|pdf|html?))(?:[#?][^)]*)?\)/gi)) {
        let t = m[1];
        if (/^[a-z]+:\/\//i.test(t) || t.startsWith('mailto:')) continue;
        t = t.replace(/\\/g, '/');
        let resolved = t.startsWith('/') ? t.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(f.rel), t));
        if (resolved.startsWith('..')) continue;
        try { resolved = decodeURIComponent(resolved); } catch { }
        if (relSet.has(resolved)) targets.add(resolved);
      }
      targets.delete(f.rel);
      newCache[f.rel] = { m: f.mtime, t: [...targets] };
    }
    for (const t of (newCache[f.rel].t || [])) out.push([f.rel, t]);
  }
  return { links: out, newCache, stats: { mdParsed: mdFiles.length, read, cached } };
}
function pickClosest(fromRel, candidates) {
  if (candidates.length === 1) return candidates[0];
  const a = fromRel.split('/').slice(0, -1);
  let best = candidates[0], bestScore = -1;
  for (const c of candidates) {
    const b = c.split('/').slice(0, -1);
    let score = 0;
    while (score < a.length && score < b.length && a[score] === b[score]) score++;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}

// ---------- the graph ----------
function topOf(rel) { return rel.includes('/') ? rel.split('/')[0] : '(root)'; }
function fileNode(f, cfg) {
  const n = { id: f.rel, type: 'file', layer: layerOf(f.rel, cfg), label: f.name, dept: deptOf(f.rel, f.name, cfg), access: accessOf(f.rel, cfg), size: f.size, mtime: f.mtime, ext: f.ext, path: f.rel, top: topOf(f.rel) };
  if (isSecret(f.rel)) n.secret = true;
  return n;
}
function dirNode(rel, d, cfg) {
  return { id: rel, type: 'dir', layer: layerOf(rel, cfg), label: d.name, folded: true, dept: deptOf(rel + '/', d.name, cfg), access: accessOf(rel + '/', cfg), size: d.bytes, files: d.files, mdFiles: d.mdFiles, path: rel, top: topOf(rel) };
}
function buildGraph(model, cfg) {
  const { files, dirs } = model;
  const nodes = [], push = n => { nodes.push(n); return n; };
  const routerFile = files.find(f => f.rel === cfg.routerDoc);
  const ROUTER = cfg.routerDoc;
  push({ id: ROUTER, type: 'router', layer: 'M', label: 'AGENTS md', dept: cfg.dep.default, access: 'both', size: routerFile ? routerFile.size : 0, mtime: routerFile ? routerFile.mtime : 0, path: ROUTER });
  for (const d of cfg.dep.departments) push({ id: 'hub:' + d.key, type: 'hub', hubKind: 'dept', layer: 'M', label: d.label, dept: d.key, access: 'both' });
  for (const l of cfg.dep.layers) if (l.key !== 'M') push({ id: 'lhub:' + l.key, type: 'hub', hubKind: 'layer', layer: l.key, label: l.label, dept: null, access: 'both' });
  for (const spineRel of cfg.spine) {
    const d = dirs.get(spineRel);
    if (!d) continue;
    for (const fi of d.childFiles) { const f = files[fi]; if (f.rel !== ROUTER) push(fileNode(f, cfg)); }
    for (const cd of d.childDirs) if (!cfg.spine.has(cd)) push(dirNode(cd, dirs.get(cd), cfg));
  }
  for (const a of cfg.apps) push({ id: a.id, type: 'app', layer: 'A', label: a.label, dept: null, access: a.access || 'local', status: a.status, kind: a.kind, desc: a.desc, links: a.links || [], iconSlug: a.iconSlug });
  for (const a of cfg.agentRoster) {
    const node = { id: a.id, type: 'agent', layer: 'A', label: a.name, dept: null, access: a.kind === 'vps' ? 'remote' : 'local', color: a.color, sprite: a.sprite, kind: a.kind, desc: a.desc, enabledDefault: a.enabled !== false };
    if (a.access === 'synced') {
      const reach = {}; for (const d of cfg.dep.departments) reach[d.key] = 0;
      let total = 0, secretCount = 0;
      for (const f of files) { if (isSecret(f.rel)) secretCount++; if (accessOf(f.rel, cfg) !== 'local') { total++; const dk = deptOf(f.rel, f.name, cfg); if (reach[dk] !== undefined) reach[dk]++; } }
      node.reach = reach; node.reachTotal = total; node.secretsExcluded = secretCount;
    } else node.links = [...(a.skills || []), ...(a.memory || [])];
    push(node);
  }
  const links = [];
  for (const d of cfg.dep.departments) links.push({ s: ROUTER, t: 'hub:' + d.key, k: 'route' });
  for (const l of cfg.dep.layers) if (l.key !== 'M') links.push({ s: ROUTER, t: 'lhub:' + l.key, k: 'route' });
  for (const n of nodes) {
    if (n.type === 'file' || n.type === 'dir') links.push({ s: n.id, t: n.layer === 'S' ? 'lhub:S' : 'hub:' + n.dept, k: 'spoke' });
    if (n.type === 'app') links.push({ s: n.id, t: 'lhub:A', k: 'spoke' });
  }
  const ids = new Set(nodes.map(n => n.id));
  for (const n of nodes) if (n.type === 'app' && Array.isArray(n.links)) for (const t of n.links) if (ids.has(t)) links.push({ s: n.id, t, k: 'wire' });
  for (const ag of nodes.filter(n => n.type === 'agent')) {
    if (ag.reach) {
      for (const d of cfg.dep.departments) if (ag.reach[d.key] > 0) links.push({ s: ag.id, t: 'hub:' + d.key, k: 'sync', w: ag.reach[d.key] });
      for (const n of nodes) if (n.type === 'app' && n.access !== 'local') links.push({ s: ag.id, t: n.id, k: 'sync', w: 1 });
    } else if (Array.isArray(ag.links)) for (const t of ag.links) if (ids.has(t)) links.push({ s: ag.id, t, k: 'sync', w: 2 });
  }
  return { nodes, links };
}

// ---------- public API ----------
function emptyModel() { return { files: [], dirs: new Map([['', { rel: '', name: 'workspace', parent: null, files: 0, mdFiles: 0, bytes: 0, childDirs: [], childFiles: [] }]]), truncated: false }; }
function runScan() {
  const t0 = Date.now();
  const cfg = loadConfig();
  for (const w of cfg.warnings) console.warn('Attention : ' + w);
  const root = resolveRoot(cfg.ws);
  const model = root ? walk(root, Number(cfg.ws.maxFiles) || 500000) : emptyModel();
  const cache = loadJSON(CACHE_FILE, {});
  const { links: mdLinks, newCache, stats } = root ? extractLinks(root, model.files, cache) : { links: [], newCache: {}, stats: { mdParsed: 0, read: 0, cached: 0 } };
  if (root) { try { fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true }); fs.writeFileSync(CACHE_FILE, JSON.stringify(newCache)); } catch { } }
  const graph = buildGraph(model, cfg);
  return {
    cfg, model, graph, mdLinks, root,
    meta: {
      scannedAt: new Date().toISOString(), scanMs: Date.now() - t0, workspaceSet: !!root, truncated: !!model.truncated,
      totalFiles: model.files.length, totalDirs: model.dirs.size, mdParsed: stats.mdParsed, mdRead: stats.read, mdCached: stats.cached,
      visibleNodes: graph.nodes.length, mdLinks: mdLinks.length, warnings: cfg.warnings,
    },
  };
}
function expandDir(model, cfg, rel) {
  const d = model.dirs.get(rel);
  if (!d) return null;
  const out = [];
  for (const fi of d.childFiles) out.push(fileNode(model.files[fi], cfg));
  for (const cd of d.childDirs) out.push(dirNode(cd, model.dirs.get(cd), cfg));
  return out;
}
function search(model, cfg, q, limit) {
  const s = String(q || '').trim().toLowerCase();
  if (!s) return [];
  const scored = [];
  for (const f of model.files) {
    const name = f.name.toLowerCase();
    let score = -1;
    if (name === s) score = 100; else if (name.startsWith(s)) score = 80; else if (name.includes(s)) score = 60; else if (f.rel.toLowerCase().includes(s)) score = 30;
    if (score >= 0) scored.push({ score: score - Math.min(20, f.rel.split('/').length), f });
  }
  for (const [rel, d] of model.dirs) {
    if (!rel) continue;
    const name = d.name.toLowerCase();
    let score = -1;
    if (name === s) score = 95; else if (name.startsWith(s)) score = 75; else if (name.includes(s)) score = 55;
    if (score >= 0) scored.push({ score, dir: d });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit || 40).map(x => x.f
    ? { path: x.f.rel, name: x.f.name, type: 'file', ext: x.f.ext, size: x.f.size, dept: deptOf(x.f.rel, x.f.name, cfg), layer: layerOf(x.f.rel, cfg), access: accessOf(x.f.rel, cfg) }
    : { path: x.dir.rel, name: x.dir.name, type: 'dir', files: x.dir.files, dept: deptOf(x.dir.rel + '/', x.dir.name, cfg), layer: layerOf(x.dir.rel + '/', cfg), access: accessOf(x.dir.rel + '/', cfg) });
}

module.exports = { KIT, CONFIG_DIR, runScan, expandDir, search, isSecret, resolveRoot, workspaceConfig, loadConfig, deptOf };

if (require.main === module) {
  const r = runScan();
  console.log(JSON.stringify({ root: r.root, ...r.meta }, null, 2));
}

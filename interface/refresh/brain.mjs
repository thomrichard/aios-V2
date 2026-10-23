// Builds the Second Brain's data from your workspace: the map (files, folders, departments,
// markdown links), one /name node per skill, your routines and applications, honest edit dates,
// one icon per routine, and the homepage orb's colours. Reads your workspace; writes only inside
// this kit (brain/, data/, assets/home-orb-mini.js). No model calls, no network.
// Run: node refresh/brain.mjs      (the refresh icon and refresh/run.mjs run it for you)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url)), KIT = path.resolve(HERE, '..');
const scan = require(path.join(KIT, 'engine', 'scan.js'));
const routinesLib = require('./lib/routines.cjs');
const { allRoutines } = require('./lib/sources.cjs');
const t0 = Date.now();
const write = (rel, text) => { const p = path.join(KIT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); };
const mtimeOf = p => { try { return fs.statSync(p).mtimeMs; } catch { return 0; } };

// 1. the scan
const r = scan.runScan();
const cfg = r.cfg, root = r.root;
const graph = { meta: { ...r.meta }, departments: cfg.dep.departments, layers: cfg.dep.layers, nodes: r.graph.nodes, links: r.graph.links, mdLinks: r.mdLinks };
const hubS = graph.nodes.find(n => n.type === 'hub' && n.layer === 'S'), hubR = graph.nodes.find(n => n.type === 'hub' && n.layer === 'R');

// 2. skills: one node per skill, named the way you type it (/name), dated by the latest edit inside it
function latestEdit(dir, depth = 0, acc = { mtime: 0, size: 0, files: 0 }) {
  let list = []; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of list) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (depth < 6 && !['node_modules', '.git', '__pycache__', '.venv', 'venv'].includes(e.name)) latestEdit(p, depth + 1, acc); continue; }
    try { const st = fs.statSync(p); acc.files++; acc.size += st.size; if (st.mtimeMs > acc.mtime) acc.mtime = st.mtimeMs; } catch { }
  }
  return acc;
}
const describe = file => { try { const t = fs.readFileSync(file, 'utf8'), m = /^description:\s*(.+)$/m.exec(t); return m ? m[1].replace(/^["']|["']$/g, '').trim().slice(0, 300) : ''; } catch { return ''; } };
const skills = new Map();
if (root) for (const dir of cfg.skillDirs) {
  const abs = path.join(root, dir);
  let list = []; try { list = fs.readdirSync(abs, { withFileTypes: true }); } catch { continue; }
  for (const e of list) {
    if (/sync-conflict/i.test(e.name) || e.name.startsWith('.')) continue;
    const full = path.join(abs, e.name);
    let isDir = e.isDirectory(); if (e.isSymbolicLink()) { try { isDir = fs.statSync(full).isDirectory(); } catch { continue; } }
    if (isDir) {
      const skillFile = ['SKILL.md', 'skill.md', 'README.md'].map(f => path.join(full, f)).find(f => fs.existsSync(f));
      if (!skillFile) continue;
      const w = latestEdit(full), name = e.name, prior = skills.get(name);
      const rel = dir + '/' + name;
      skills.set(name, { name, id: rel, path: rel + '/' + path.basename(skillFile), kind: 'skill', mtime: Math.max(w.mtime, prior?.mtime || 0), size: w.size, files: w.files, desc: describe(skillFile) || prior?.desc || '', basis: 'Dernière modification dans le dossier de la skill', alias: prior?.id });
    } else if (e.name.toLowerCase().endsWith('.md') && !/^(_|readme\.md$)/i.test(e.name)) {
      const name = e.name.slice(0, -3), rel = dir + '/' + e.name, st = fs.statSync(full), prior = skills.get(name);
      if (prior) { prior.alias = rel; if (st.mtimeMs > prior.mtime) { prior.mtime = st.mtimeMs; prior.basis = 'Dernière modification de la skill ou de son fichier de commande'; } continue; }
      skills.set(name, { name, id: rel, path: rel, kind: 'command', mtime: st.mtimeMs, size: st.size, files: 1, desc: describe(full), basis: 'Dernière modification du fichier de commande' });
    }
  }
}
graph.nodes = graph.nodes.filter(n => !(n.layer === 'S' && n.type !== 'hub'));
const skillNodes = [...skills.values()].sort((a, b) => a.name.localeCompare(b.name)).map(s => ({
  // a skill's department: the first pathRules prefix that matches its folder, else the default
  id: s.id, type: 'file', layer: 'S', label: '/' + s.name, dept: scan.deptOf(s.id + '/', s.name, cfg), access: 'local', size: s.size, files: s.files, path: s.path,
  top: s.id.split('/')[0], mtime: s.mtime || 0, dateBasis: s.basis, skill: s.name, ext: '.md',
}));
graph.nodes.push(...skillNodes);

// 3. routines: the routines file plus your agent's own scheduler
const all = allRoutines();
const routinesFileTime = mtimeOf(routinesLib.ROUTINES_FILE);
graph.nodes = graph.nodes.filter(n => n.type !== 'routine');
const routineNodes = all.routines.map(x => {
  const own = x.path && mtimeOf(x.path);
  return { id: x.id, type: 'routine', layer: 'R', label: x.name, dept: null, access: 'local', schedule: x.scheduleText, runner: x.sourceLabel, desc: x.desc,
    paused: x.status === 'paused', mtime: own || routinesFileTime || 0, dateBasis: own ? 'Dernière modification du fichier de la tâche' : routinesFileTime ? 'Dernière modification du fichier des routines' : 'Aucune date de modification connue' };
});
graph.nodes.push(...routineNodes);

// 4. applications: dated by the app list's own edit time
const appsTime = mtimeOf(path.join(KIT, 'config', 'apps.json'));
for (const n of graph.nodes) if (n.type === 'app') { n.mtime = appsTime; n.dateBasis = 'Dernière modification de la liste des apps'; }

// 5. the router (AGENTS md): your instruction files and their latest edit
const docs = [...new Set([cfg.routerDoc, ...(cfg.ws.instructionDocs || [])].map(d => String(d).replace(/\\/g, '/')).filter(Boolean))];
const aliases = root ? docs.map(name => ({ name, path: name, mtime: mtimeOf(path.join(root, name)) })).filter(a => a.mtime) : [];
const router = graph.nodes.find(n => n.type === 'router');
if (router) {
  router.label = 'AGENTS md';
  router.editAliases = aliases;
  router.mtime = aliases.length ? Math.max(...aliases.map(a => a.mtime)) : router.mtime || 0;
  router.lastEditedFile = aliases.slice().sort((a, b) => b.mtime - a.mtime)[0]?.name || cfg.routerDoc;
}

// 6. links: drop any whose ends are gone, then a spoke for every skill and routine
const ids = new Set(graph.nodes.map(n => n.id));
graph.links = graph.links.filter(l => ids.has(l.s ?? l.source) && ids.has(l.t ?? l.target));
const linked = new Set(graph.links.map(l => (l.s ?? l.source) + '|' + (l.t ?? l.target)));
for (const n of skillNodes) if (hubS && !linked.has(n.id + '|' + hubS.id)) graph.links.push({ s: n.id, t: hubS.id, k: 'spoke', w: 1 });
for (const n of routineNodes) if (hubR && !linked.has(n.id + '|' + hubR.id)) graph.links.push({ s: n.id, t: hubR.id, k: 'spoke', w: 1 });
graph.mdLinks = (graph.mdLinks || []).filter(([a, b]) => typeof a === 'string' && typeof b === 'string');
graph.meta.visibleNodes = graph.nodes.length; graph.meta.skills = skillNodes.length; graph.meta.routines = routineNodes.length;
graph.meta.applications = graph.nodes.filter(n => n.type === 'app').length; graph.meta.refreshedAt = new Date().toISOString();

// 7. folder contents, loaded only when a folder is opened or searched
// AIOS: every level, so a folder inside an opened folder opens too (see MODIFS.md)
const expansions = {};
const toOpen = graph.nodes.filter(n => n.type === 'dir').map(n => n.id);
while (toOpen.length) {
  const id = toOpen.shift();
  if (expansions[id]) continue;
  const kids = scan.expandDir(r.model, cfg, id);
  if (kids) { expansions[id] = kids; for (const k of kids) if (k.type === 'dir') toOpen.push(k.id); }
}

// 8. bodies for the offline copy (opened as a file): your instruction files only
const bodies = {};
if (root) for (const a of aliases) { try { const t = fs.readFileSync(path.join(root, a.name), 'utf8'); if (t.length < 300000) bodies[a.name] = t; } catch { } }

// 9. icons: the shipped base pack plus one drawn icon per routine and per app without a brand mark
const base = JSON.parse(fs.readFileSync(path.join(HERE, 'lib', 'icons-base.json'), 'utf8'));
const icons = { ...base.icons }, brands = { ...base.paths };
const appCfg = (() => { try { return JSON.parse(fs.readFileSync(path.join(KIT, 'config', 'apps.json'), 'utf8')).apps || []; } catch { return []; } })();
for (const a of appCfg) {
  if (a.path && /^[MmLlHhVvCcSsQqTtAaZz0-9 .,-]+$/.test(a.path)) brands[a.id] = a.path;            // a 24x24 brand path the agent added
  else if (a.svg && /^<svg[\s>]/.test(a.svg) && !/script|on\w+=|href/i.test(a.svg)) icons[a.id] = a.svg;   // a 48x48 stroke drawing
}
for (const n of routineNodes) icons[n.id] = routinesLib.routineIcon(n.id, n.label);
for (const n of graph.nodes) if (n.type === 'app' && !icons[n.id] && !brands[n.id]) icons[n.id] = routinesLib.routineIcon(n.id, n.label + ' ' + (n.desc || ''));

// 10. write the brain's files
const snapshot = { graph, expansions: {}, bodies, root: root ? root.replace(/\\/g, '/') : '' };
write('brain/snapshot.js', 'window.QUIET_SNAPSHOT=' + JSON.stringify(snapshot) + ';');
write('brain/snapshot-expansions.js', 'window.QUIET_EXPANSIONS=' + JSON.stringify(expansions) + ';');
write('brain/_icons.js', 'window.BRAIN_ICONS=' + JSON.stringify(icons) + ';\nwindow.BRAIN_ICON_PATHS=' + JSON.stringify(brands) + ';');
write('brain/map-layouts.js', 'window.BRAIN_MAP_LAYOUTS={};');

// 11. the homepage orb's centre: a small copy of the 3D view in your departments' colours
const skin = (() => { try { return fs.readFileSync(path.join(KIT, 'brain', 'index.html'), 'utf8'); } catch { return ''; } })();
const skinColours = key => { const m = skin.match(new RegExp('\\n\\s*' + key + ':\\s*\\{([^}]*)\\}')); return m ? Object.fromEntries([...m[1].matchAll(/(\w+):\s*'(#[0-9a-fA-F]{6})'/g)].map(x => [x[1], x[2]])) : {}; };
const skinLayers = skinColours('layerColors'), skinDepts = skinColours('deptColors');
const layerColour = k => skinLayers[k] || cfg.dep.layers.find(l => l.key === k)?.color || '#888888';
const mini = {
  U: 7.5,
  depts: cfg.dep.departments.map(d => [d.key, skinDepts[d.key] || d.color || '#9a66e0', 0]),
  S: [layerColour('S'), Math.max(8, Math.min(240, skillNodes.length * 4))],
  R: [layerColour('R'), Math.max(6, Math.min(90, routineNodes.length * 3))],
  A: [layerColour('A'), Math.max(6, Math.min(40, graph.meta.applications * 3))],
};
const deptTotals = {};
for (const n of graph.nodes) if ((n.type === 'file' || n.type === 'dir') && n.layer === 'M') deptTotals[n.dept] = (deptTotals[n.dept] || 0) + (n.type === 'dir' ? Math.max(1, n.files || 1) : 1);
const totalMem = Object.values(deptTotals).reduce((a, b) => a + b, 0);
for (const d of mini.depts) d[2] = totalMem ? Math.max(12, Math.round(1400 * (deptTotals[d[0]] || 0) / totalMem)) : 120;
write('assets/home-orb-mini.js', '/* The homepage orb\'s coloured centre: your departments and layers, written by refresh/brain.mjs. */\nwindow.HOME_ORB_MINI=' + JSON.stringify(mini) + ';');

// 12. the Routines tab's saved copy (the server builds a fresh one on every load)
write('data/snapshot.js', 'window.COPY_DATA=' + JSON.stringify(routinesLib.calendarData(all)) + ';');
write('data/skills.json', JSON.stringify([...skills.values()].map(s => ({ name: s.name, kind: s.kind, desc: s.desc, path: s.path, mtime: s.mtime })), null, 1));
write('data/brain-meta.json', JSON.stringify({ builtAt: new Date().toISOString(), workspaceSet: !!root, totalFiles: r.meta.totalFiles, nodes: graph.nodes.length, skills: skillNodes.length, routines: routineNodes.length, applications: graph.meta.applications, truncated: r.meta.truncated }, null, 1));
console.log(JSON.stringify({ workspace: root ? 'défini' : 'non défini', files: r.meta.totalFiles, nodes: graph.nodes.length, skills: skillNodes.length, routines: routineNodes.length, applications: graph.meta.applications, folders: Object.keys(expansions).length, ms: Date.now() - t0 }));

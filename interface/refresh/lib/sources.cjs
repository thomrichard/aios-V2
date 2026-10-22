/* Where routines come from. The routines file (snapshots/routines.json) is always read.
   Each reader below adds the routines of one agent's own scheduler, when that scheduler
   exists on this machine. To teach the OS another scheduler, write a reader in
   refresh/sources/ that returns { key, label, routines: [...] } and add it to READERS.
   Every reader has a switch in os-config.json "readers": "auto" (the default) reads when the
   agent's folders are found, false never reads them. refresh/usage.mjs follows the same switch. */
'use strict';
const fs = require('fs');
const path = require('path');
const routines = require('./routines.cjs');
const claudeCode = require('../sources/claude-code.cjs');

const KIT = path.resolve(__dirname, '..', '..');
function readerOn(name) {
  let cfg = {};
  try { cfg = JSON.parse(fs.readFileSync(path.join(KIT, 'os-config.json'), 'utf8')); } catch { }
  const v = (cfg.readers || {})[name];
  return !(v === false || v === 'false' || v === 'off');
}
const READERS = [
  { name: 'claudeCode', read: () => claudeCode.scheduledTasks() },   // only finds something if your agent is Claude Code
];

let cached = null, cachedAt = 0;
function agentGroups() {
  if (cached && Date.now() - cachedAt < 60000) return cached;
  const out = [];
  for (const r of READERS) { if (!readerOn(r.name)) continue; try { const g = r.read(); if (g && g.routines && g.routines.length) out.push(g); } catch { } }
  cached = out; cachedAt = Date.now();
  return out;
}
function allRoutines() { return routines.loadAll(agentGroups()); }

module.exports = { allRoutines, agentGroups, readerOn };

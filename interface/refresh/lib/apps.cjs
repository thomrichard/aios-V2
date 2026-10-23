/* The Micro Apps tiles on the homepage: the apps you add in
   os-config.json ("microApps"). A tile opens the app when it answers on its port, and its
   fallback page when it does not. Every open is logged to data/app-opens.jsonl, which is how
   the Applications tab counts local app use. */
'use strict';
const fs = require('fs');
const path = require('path');

const KIT = path.resolve(__dirname, '..', '..');
const BUILT_IN = [];
const okUrl = u => /^https?:\/\/[^\s"'<>]+$/i.test(String(u || ''));
const okId = s => /^[a-z0-9][a-z0-9-]{0,40}$/.test(String(s || ''));

function list() {
  let cfg = {};
  try { cfg = JSON.parse(fs.readFileSync(path.join(KIT, 'os-config.json'), 'utf8')); } catch { }
  const extra = (Array.isArray(cfg.microApps) ? cfg.microApps : []).filter(a => a && okId(a.id) && okUrl(a.url) && !BUILT_IN.some(b => b.id === a.id)).map(a => {
    let port = null; try { const u = new URL(a.url); if (/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) port = +(u.port || (u.protocol === 'https:' ? 443 : 80)); } catch { }
    return { id: a.id, name: String(a.name || a.id).slice(0, 40), desc: String(a.desc || '').slice(0, 80), url: a.url, port, fallbackUrl: okUrl(a.fallbackUrl) ? a.fallbackUrl : null, icon: String(a.icon || 'gen').replace(/[^a-z0-9-]/gi, '').slice(0, 20), builtIn: false };
  });
  return [...BUILT_IN, ...extra];
}

module.exports = { list };

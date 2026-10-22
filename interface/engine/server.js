/* Second Brain engine: the read-only file service behind the Second Brain.
   The OS server (../server.js) starts this for you. Zero dependencies.
   Run alone:  node engine/server.js   (port from os-config.json "brainPort", or PORT)

   GET  /api/graph[?fresh=1]  the scanned map (meta, departments, layers, nodes, links, mdLinks)
   GET  /api/expand?path=rel  the children of one folder
   GET  /api/search?q=...     whole-workspace search by file and folder name
   GET  /api/file?path=rel    a text file's content for the in-app viewer (read only)
   GET  /api/meta             file and folder counts
   POST /api/rescan           scan the workspace again

   Security: binds 127.0.0.1 only, sends no CORS headers, answers only when the Host
   header is localhost or 127.0.0.1, never serves a file outside the workspace root,
   never serves a secret-looking file (.env, keys, tokens), and writes nothing but its own
   markdown link cache (data/links-cache.json). */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const scan = require('./scan');

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) { console.error('Requires Node.js 18 or newer. You are running ' + process.version); process.exit(1); }

let CFG = {};
try { CFG = JSON.parse(fs.readFileSync(path.join(scan.KIT, 'os-config.json'), 'utf8')); } catch { }
const PORT = Number(process.env.PORT) || Number(CFG.brainPort) || 50201;
const TEXT_EXT = new Set(['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.htm', '.css', '.py', '.yaml', '.yml', '.toml', '.csv', '.xml', '.bat', '.sh', '.ps1', '.svg', '.log', '.mjs', '.cjs', '.vtt', '.srt', '.ini', '.cfg', '.sql', '.rb', '.go', '.rs', '.java', '.c', '.h', '.cpp', '.swift', '.kt']);
const FILE_MAX = 500 * 1024;

let scanResult = null, scanPromise = null, scanStartedAt = 0;
function startScan() {
  scanStartedAt = Date.now();
  scanPromise = new Promise(resolve => setImmediate(() => {
    try { scanResult = scan.runScan(); } catch (e) { scanResult = { error: e.message, meta: { error: e.message } }; }
    resolve(scanResult);
  }));
  return scanPromise;
}
const current = () => scanPromise || startScan();

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}
const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d+)?$/i;
function inside(root, rel) {
  if (!root || typeof rel !== 'string' || !rel || rel.includes('\0')) return null;
  const abs = path.resolve(root, rel.replace(/\\/g, '/').replace(/^\/+/, ''));
  return abs === root || abs.startsWith(root + path.sep) ? abs : null;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!LOCAL_HOST.test(String(req.headers.host || ''))) return sendJSON(res, { error: 'local requests only' }, 403);
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    if (p === '/' && req.method === 'GET') return sendJSON(res, { engine: 'RUBRIC Second Brain engine', endpoints: ['/api/graph', '/api/expand', '/api/search', '/api/file', '/api/meta'] });
    if (p === '/api/graph' && req.method === 'GET') {
      if (url.searchParams.get('fresh') === '1' && Date.now() - scanStartedAt > 30000) startScan();
      const r = await current();
      if (r.error) return sendJSON(res, { error: r.error }, 500);
      return sendJSON(res, { meta: { ...r.meta, port: PORT }, departments: r.cfg.dep.departments, layers: r.cfg.dep.layers, nodes: r.graph.nodes, links: r.graph.links, mdLinks: r.mdLinks });
    }
    if (p === '/api/expand' && req.method === 'GET') {
      const r = await current();
      if (r.error) return sendJSON(res, { error: r.error }, 500);
      const rel = (url.searchParams.get('path') || '').replace(/\\/g, '/');
      const children = scan.expandDir(r.model, r.cfg, rel);
      return children ? sendJSON(res, { path: rel, nodes: children }) : sendJSON(res, { error: 'Unknown folder' }, 404);
    }
    if (p === '/api/search' && req.method === 'GET') {
      const r = await current();
      if (r.error) return sendJSON(res, { error: r.error }, 500);
      const q = String(url.searchParams.get('q') || '').slice(0, 200);
      return sendJSON(res, { q, results: scan.search(r.model, r.cfg, q, 40) });
    }
    if (p === '/api/file' && req.method === 'GET') {
      const r = await current();
      const rel = String(url.searchParams.get('path') || '');
      const abs = inside(r.root, rel);
      if (!abs) return sendJSON(res, { error: 'Not found' }, 404);
      if (scan.isSecret(path.relative(r.root, abs).replace(/\\/g, '/'))) return sendJSON(res, { error: 'This file looks like a secret, so the viewer does not show it.' }, 403);
      let st; try { st = fs.statSync(abs); } catch { return sendJSON(res, { error: 'Not found' }, 404); }
      if (!st.isFile()) return sendJSON(res, { error: 'Not a file' }, 400);
      const ext = path.extname(abs).toLowerCase();
      if (!TEXT_EXT.has(ext) && ext !== '') return sendJSON(res, { error: 'binary', ext, size: st.size }, 400);
      if (st.size > FILE_MAX) return sendJSON(res, { error: 'File too large for the viewer (' + Math.round(st.size / 1024) + ' KB)' }, 400);
      return sendJSON(res, { content: fs.readFileSync(abs, 'utf8'), ext, size: st.size });
    }
    if (p === '/api/meta' && req.method === 'GET') {
      const r = await current();
      return sendJSON(res, r.meta || {});
    }
    if (p === '/api/rescan' && req.method === 'POST') {
      const r = await startScan();
      return sendJSON(res, r.error ? { error: r.error } : { ok: true, meta: r.meta });
    }
    sendJSON(res, { error: 'Unknown endpoint' }, 404);
  } catch (e) {
    try { sendJSON(res, { error: e.message }, 500); } catch { }
  }
});
server.on('error', e => {
  if (e.code === 'EADDRINUSE') { console.error('Second Brain engine: port ' + PORT + ' is in use. Change "brainPort" in os-config.json.'); process.exit(2); }
  throw e;
});
server.listen(PORT, '127.0.0.1', () => {
  console.log('Second Brain engine -> http://127.0.0.1:' + PORT);
  startScan().then(r => {
    if (r.error) console.log('Scan failed:', r.error);
    else if (!r.meta.workspaceSet) console.log('No workspace set yet: put your workspace path in config/workspace.json ("root").');
    else console.log(`Scan: ${r.meta.totalFiles} files, ${r.meta.mdLinks} markdown links, ${r.meta.visibleNodes} map nodes in ${r.meta.scanMs} ms`);
  });
});

/* Data layer for the homepage (os.html). Runs before the homepage's own scripts.
   - Served by node server.js: the first pull of each widget comes from one /local/boot call;
     later pulls and every action go straight to the server.
   - Opened as a file: the saved snapshot answers every pull, and nothing leaves the page.
   - copyStorage keeps this page's settings in their own space in the browser.
   - While the Second Brain covers the page, every animation frame waits in a queue. */
(() => {
  const live = location.protocol === 'http:';
  const prefix = 'sm4rt-os-v2:';
  const safe = fn => { try { return fn(); } catch (_) { return null; } };
  window.copyStorage = {
    getItem: k => safe(() => localStorage.getItem(prefix + k)),
    setItem: (k, v) => safe(() => localStorage.setItem(prefix + k, v)),
    removeItem: k => safe(() => localStorage.removeItem(prefix + k)),
    clear: () => safe(() => Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k)))
  };

  const raf = window.requestAnimationFrame.bind(window);
  let queue = [];
  window.requestAnimationFrame = cb => window.__copyPaused ? (queue.push(cb), 0) : raf(cb);
  window.__copyResume = () => { const q = queue; queue = []; q.forEach(cb => raf(cb)); };

  const realFetch = window.fetch.bind(window);
  /* One call for the five homepage feeds, started as the page's first script runs. Each answer is
     offered once to the widget that asks for it within 10 seconds; every later pull goes live. */
  const PULL = { '/api/calendar': 1, '/api/artifacts': 1, '/api/routines': 1, '/api/stats': 1, '/api/email': 1 };
  const offered = new Map();
  const take = p => { const o = offered.get(p); offered.delete(p); return o && Date.now() - o.at < 10e3 ? o : null; };
  let booted = !live;
  const boot = live ? realFetch('/local/boot', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)
    .then(b => { Object.entries((b && b.feeds) || {}).forEach(([p, f]) => offered.set(p, { text: JSON.stringify(f.data), at: Date.now() })); booted = true; }) : null;

  window.fetch = async (input, options = {}) => {
    const raw = String((input && input.url) || input), method = String(options.method || 'GET').toUpperCase();
    const path = raw.replace(/^copy:/, '').replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/, '').split('?')[0];
    if (live && method === 'GET' && PULL[path] && !raw.includes('?')) {
      if (!booted) await boot;
      const o = take(path);
      if (o) return new Response(o.text, { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (!live && method !== 'GET' && method !== 'HEAD') {
      parent.postMessage({ type: 'os-copy-preview-action' }, '*');
      return new Response(JSON.stringify({ ok: false, error: 'Les actions marchent quand l’OS tourne (node server.js).' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    if (live) return realFetch(input, options);
    const data = window.OS_COPY_SNAPSHOT && window.OS_COPY_SNAPSHOT[path];
    return new Response(JSON.stringify(data || { needsSetup: true }), { status: data ? 200 : 404, headers: { 'Content-Type': 'application/json' } });
  };
  if (!live) window.open = () => { parent.postMessage({ type: 'os-copy-preview-action' }, '*'); return null; };
})();

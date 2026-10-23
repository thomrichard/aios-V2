// Second Brain shell extras: the always-on file search under the view tabs and the refresh icon.
// Kept out of copy.js so the shell's view and zoom code stays as it was.
// - Search: served by node server.js it asks the Second Brain engine (/local/search), a whole-workspace
//   search by file and folder name. Opened as a file it uses the brain's
//   saved snapshot. Picking a result flies to it in the 3D orbs, 2D map or Timeline; a file that is not
//   on the map gets Open on device and Copy path instead. "/" focuses the box from anywhere.
// - Refresh: POST /local/refresh re-runs the data scripts (map, skills, routines, apps, usage), then
//   reloads the two Second Brain frames in place, so the view you are on stays put.
(() => {
  'use strict';
  const $ = id => document.getElementById(id), brain = $('brain'), views = $('views');
  const input = $('file-search-input'), box = $('file-search-results'), refreshBtn = $('refresh-data');
  const live = location.protocol === 'http:';
  const graphViews = ['orbs', 'map', 'timeline'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const notice = text => { const n = $('notice'); if (!n) return; n.textContent = text; n.classList.add('show'); clearTimeout(notice.t); notice.t = setTimeout(() => n.classList.remove('show'), 3200); };
  const core = () => { try { return brain.contentWindow.BrainCore || null; } catch { return null; } };

  // ---------- file count in the placeholder ----------
  let total = 0;
  // A plain comma format: toLocaleString's first call spent ~15 ms of the first load setting up number formats.
  const setCount = n => { if (!(n > 0)) return; total = n; input.placeholder = `Rechercher parmi ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')} fichiers… ( / )`; };
  async function loadCount() {
    if (live) { try { const r = await fetch('/local/meta', {cache: 'no-store'}); if (r.ok) { setCount((await r.json()).totalFiles); return; } } catch {} }
    const tick = () => { const n = core()?.S?.meta?.totalFiles; if (n) setCount(n); else setTimeout(tick, 1500); };
    tick();
  }
  loadCount();

  // ---------- search ----------
  let timer = null, ctrl = null, rows = [], at = -1;
  const colourOf = x => {
    const S = core()?.S;
    if (x.layer === 'S') return S?.layerColor?.S || '#ff6b1a';
    if (x.layer === 'A') return S?.layerColor?.A || '#3f8fd4';
    if (x.layer === 'R') return S?.layerColor?.R || '#e2a63b';
    return S?.deptColor?.[x.dept] || '#8fa3ad';
  };
  async function search(q) {
    ctrl?.abort(); ctrl = new AbortController();
    if (live) { const r = await fetch('/local/search?q=' + encodeURIComponent(q), {signal: ctrl.signal, cache: 'no-store'}); if (!r.ok) throw new Error('search ' + r.status); return (await r.json()).results || []; }
    if (!brain.getAttribute('src')) window.UnifiedCopy?.preload();
    for (let i = 0; i < 40 && !core(); i++) await new Promise(ok => setTimeout(ok, 250));
    const r = await brain.contentWindow.fetch('/api/search?q=' + encodeURIComponent(q)); return (await r.json()).results || [];
  }
  // Skills are searched the way you type them, "/name" or "name": the map's own /name skill nodes lead,
  // because the engine answers with the skill's file, which is not a map node.
  function skillHits(q) {
    const S = core()?.S, key = q.replace(/^\/+/, '').toLowerCase();
    if (!key || !S?.nodes) return [];
    const hits = S.nodes.filter(n => n.layer === 'S' && n.type !== 'hub' && String(n.label || '').toLowerCase().replace(/^\//, '').includes(key));
    const rank = n => { const l = n.label.toLowerCase().replace(/^\//, ''); return l === key ? 0 : l.startsWith(key) ? 1 : 2; };
    return hits.sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label)).slice(0, 6)
      .map(n => ({path: n.id, name: n.label, type: 'skill', layer: 'S', dept: n.dept}));
  }
  function paint(list, q) {
    // files that are on the map come first, so Enter on the top result flies somewhere
    const S = core()?.S, onMap = x => !!S?.byId?.has(x.path);
    const skills = skillHits(q), names = new Set(skills.map(s => s.name.replace(/^\//, '')));
    const sameSkill = x => { const m = String(x.path).match(/^(?:.*\/)?(?:skills\/([^/]+)(?:\/SKILL\.md)?|commands\/([^/]+)\.md)$/); return !!m && names.has(m[1] || m[2]); };
    list = [...skills, ...list.filter(x => !sameSkill(x))];
    list = list.map((x, i) => ({x, i, on: onMap(x)})).sort((a, b) => (b.on - a.on) || a.i - b.i).map(e => ({...e.x, onMap: e.on}));
    rows = list.slice(0, 14); at = rows.length ? 0 : -1;
    box.innerHTML = rows.map((x, i) => `<div class="res${i === at ? ' on' : ''}" role="option" data-i="${i}" title="${esc(x.path)}"><span class="dot" style="background:${colourOf(x)}"></span><span class="r-name">${esc(x.name)}${x.type === 'dir' ? '/' : ''}</span><span class="r-path">${esc(x.path)}</span></div>`).join('')
      || `<div class="res-none">Aucun fichier ne correspond à « ${esc(q)} »</div>`;
    box.hidden = false;
    box.querySelectorAll('.res').forEach(el => el.onpointerdown = e => { e.preventDefault(); pick(rows[+el.dataset.i]); });
  }
  const close = () => { box.hidden = true; rows = []; at = -1; };
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) { ctrl?.abort(); close(); return; }
    timer = setTimeout(() => search(q).then(list => { if (input.value.trim() === q) paint(list, q); }).catch(e => { if (e.name !== 'AbortError') { box.innerHTML = '<div class="res-none">La recherche ne répond pas encore. L’OS tourne-t-il (node server.js) ?</div>'; box.hidden = false; } }), 120);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!rows.length) return; e.preventDefault(); at = (at + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length; box.querySelectorAll('.res').forEach((el, i) => el.classList.toggle('on', i === at)); box.querySelector('.res.on')?.scrollIntoView({block: 'nearest'}); }
    if (e.key === 'Enter' && at >= 0) { e.preventDefault(); pick(rows[at]); }
    if (e.key === 'Escape') { e.stopPropagation(); if (!box.hidden) close(); else { input.value = ''; input.blur(); } }
  });
  input.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== input) box.hidden = true; }, 180));
  input.addEventListener('focus', () => { if (rows.length) box.hidden = false; });
  // "/" from anywhere in the Second Brain, including inside its frames
  const slash = e => { if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t?.matches?.('input,textarea,select,[contenteditable]')) return; if ($('controls').hidden) return; e.preventDefault(); input.focus(); input.select(); };
  addEventListener('keydown', slash, true);
  const hook = f => { try { f.contentWindow.addEventListener('keydown', slash, true); } catch {} };
  brain.addEventListener('load', () => hook(brain)); views.addEventListener('load', () => hook(views));

  async function pick(x) {
    if (!x) return;
    const path = x.path, state = window.UnifiedCopy?.state() || {};
    if (!graphViews.includes(state.view)) { window.UnifiedCopy?.select('orbs'); await new Promise(ok => setTimeout(ok, 900)); }
    const C = core();
    let found = false;
    if (C) { try { await C.jumpTo(path); const sel = C.S.sel; found = !!sel && (sel.id === path || sel.path === path || String(sel.id).endsWith(path)); } catch {} }
    if (found) { close(); input.value = ''; input.blur(); return; }
    // not on the map: offer the file itself
    box.innerHTML = `<div class="res-note">${esc(x.name)} n’est pas encore sur la carte.<br><span class="r-path">${esc(path)}</span></div><div class="res-actions"><button data-act="open">Ouvrir sur l’appareil</button><button data-act="copy">Copier le chemin</button></div>`;
    box.hidden = false;
    const root = (() => { try { return brain.contentWindow.QUIET_SNAPSHOT?.root || ''; } catch { return ''; } })();
    const abs = /^([A-Za-z]:)?[\\/]/.test(path) || !root ? path : root.replace(/\/+$/, '') + '/' + path;
    box.querySelector('[data-act="open"]').onpointerdown = async e => { e.preventDefault(); if (!live) { notice('Ouvrir un fichier marche quand l’OS tourne (node server.js).'); return; } try { const r = await fetch('/api/open', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({path: abs})}); notice(r.ok ? 'Ouvert : ' + x.name : 'Impossible de l’ouvrir'); } catch { notice('Impossible de l’ouvrir'); } };
    box.querySelector('[data-act="copy"]').onpointerdown = e => { e.preventDefault(); navigator.clipboard?.writeText(abs).then(() => notice('Copié : ' + abs), () => notice(abs)); };
  }

  // ---------- refresh ----------
  let busy = false;
  refreshBtn.onclick = async () => {
    if (busy) return;
    if (!live) { notice('L’actualisation marche quand l’OS tourne (node server.js). Cette copie utilise les données enregistrées.'); return; }
    busy = true; refreshBtn.classList.remove('ok', 'fail'); refreshBtn.classList.add('busy'); refreshBtn.title = 'Actualisation… (environ 20 secondes)';
    notice('Actualisation des routines, skills, applications et usage…');
    let result = null;
    try { const r = await fetch('/local/refresh', {method: 'POST'}); result = await r.json(); } catch (e) { result = {ok: false, error: e.message}; }
    refreshBtn.classList.remove('busy');
    if (!result?.ok) {
      busy = false; refreshBtn.classList.add('fail'); refreshBtn.title = 'Échec de l’actualisation. Clique pour réessayer.';
      const bad = result?.steps?.find(s => !s.ok); notice('Échec de l’actualisation' + (bad ? ' à l’étape ' + bad.step : '') + '. Les anciennes données restent affichées.'); return;
    }
    reloadFrames();
    busy = false; refreshBtn.classList.add('ok'); refreshBtn.title = 'Actualisé à ' + new Date(result.at).toLocaleTimeString('fr-FR') + '. Clique pour actualiser à nouveau.';
    notice('Données actualisées en ' + Math.round(result.ms / 1000) + ' s.');
    total = 0; loadCount(); setTimeout(() => refreshBtn.classList.remove('ok'), 4000);
  };
  // Reload both frames in place; once the brain is back, put it on the same view, layout and state.
  function reloadFrames() {
    const state = window.UnifiedCopy?.state() || {}, view = state.view || 'orbs', layout = document.querySelector('[data-layout][aria-pressed="true"]')?.dataset.layout;
    if (views.getAttribute('src')) try { views.contentWindow.location.reload(); } catch {}
    if (!brain.getAttribute('src')) return;
    // A hidden frame has a 0 px canvas, which the brain cannot draw into while it loads, so on the
    // Routines, Skills and Applications tabs it reloads laid out but invisible, then hides again.
    const wasHidden = !graphViews.includes(view);
    if (wasHidden) { brain.style.visibility = 'hidden'; brain.style.display = 'block'; }
    const onReady = e => {
      if (e.source !== brain.contentWindow || e.data?.type !== 'brain-copy-ready') return;
      removeEventListener('message', onReady);
      if (wasHidden) setTimeout(() => { const now = window.UnifiedCopy?.state().view; if (!graphViews.includes(now)) brain.style.display = 'none'; brain.style.visibility = ''; }, 400);
      const send = m => brain.contentWindow.postMessage({type: 'brain-copy', ...m}, '*');
      if (layout) send({action: 'layout', layout});
      send({action: 'view', view: graphViews.includes(view) ? view : 'orbs', animate: false});
      send({action: 'active', value: graphViews.includes(view)});
    };
    addEventListener('message', onReady);
    try { brain.contentWindow.location.reload(); } catch {}
  }
})();

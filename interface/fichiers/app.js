/* SM4RT file editor: the Fichiers tab, or /fichiers/ on its own.
   Left: every file of the workspace, folder by folder with the domains first, each with its title and one line of
   summary (a SKILL.md says which skill it is), a search box (name, title, summary, then the text itself) and chips
   on the type and the status. Right: the open file, read styled; « Modifier la fiche » writes in it, styled, as
   Markdown, or both side by side, the formatting bar staying at the top of the screen. A save goes to /local/files/save, which refuses a file that changed on
   disk since it was opened, then runs systeme/scripts/index.py so the indexes and views follow. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const MD = window.FilesMD;
  const embedded = window !== parent;
  document.body.classList.toggle('embedded', embedded);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fold = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const baseName = p => p.split('/').pop();
  const dirOf = p => p.split('/').slice(0, -1).join('/');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-fichiers:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-fichiers:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  /* the top folders: the domains first, then the two doors, then the rest */
  const ORDER = ['domaines', 'projets', 'processus', 'inbox', 'outbox', 'journal', 'savoir', 'bibliotheques', 'memory', 'skills', 'routers', 'vues', 'systeme', 'docs', 'archives'];
  const FIELDS = { type: 'Tous', statut: 'Tous' };
  const BIG = 250 * 1024;   /* above this, no colours under the text box: typing stays instant */
  const ICONS = {
    dir: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3l1.5 1.6h4.5A1.5 1.5 0 0 1 14 6.1v5.4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5z"/></svg>',
    md: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M4 2h5.5L12 4.5V14H4z"/><path d="M6 7.5h4M6 10h4" stroke-linecap="round"/></svg>',
    text: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"><path d="M4 2h5.5L12 4.5V14H4z"/><path d="m7 8-1.5 1.5L7 11M9 8l1.5 1.5L9 11"/></svg>',
    image: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><rect x="2.5" y="3" width="11" height="10" rx="1.2"/><circle cx="6" cy="6.5" r="1.2"/><path d="m3 12 3.5-3.5 2.5 2.5 1.5-1.5L13 12"/></svg>',
    other: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M4 2h5.5L12 4.5V14H4z"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 4 4 4-4 4"/></svg>'
  };

  const S = {
    files: [], byPath: new Map(), dirs: new Set(), root: '', sig: '', loaded: false,
    open: new Set(store.get('open', null) || ['domaines']), firstVisit: store.get('open', null) === null,
    q: '', filters: { type: '', statut: '', domaine: '', projet: '' }, hits: null, hitsFor: '',
    results: [], sel: -1, doc: null, mode: store.get('mode', 'preview'), edition: false, saving: false, blobs: new Map()
  };
  const src = $('src'), hl = $('hl'), pv = $('preview'), pvPane = $('preview-pane');

  /* ---------------------------- server ---------------------------- */
  async function api(url, opts) {
    try {
      const r = await fetch(url, { cache: 'no-store', ...opts });
      let d = {}; try { d = await r.json(); } catch (_) { d = { error: 'Réponse illisible du serveur (' + r.status + ')' }; }
      return { status: r.status, ...d };
    } catch (e) { return { status: 0, error: 'L’OS ne répond pas. Tourne-t-il (node server.js) ?' }; }
  }
  const post = (url, body) => api(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  /* ---------------------------- small pieces ---------------------------- */
  function toast(text, kind = '') {
    const t = $('toast'); t.textContent = text; t.className = 'on ' + kind;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.className = kind, kind === 'bad' ? 6000 : 2800);
  }
  function ask(title, text, buttons) {
    return new Promise(done => {
      const m = $('modal'), prev = document.activeElement;
      $('modal-title').textContent = title; $('modal-text').textContent = text;
      $('modal-actions').innerHTML = buttons.map(([k, label, cls]) => `<button type="button" data-k="${k}" class="${cls || ''}">${esc(label)}</button>`).join('');
      m.hidden = false;
      const finish = k => { m.hidden = true; m.onkeydown = null; prev?.focus?.({ preventScroll: true }); done(k); };
      $('modal-actions').querySelectorAll('button').forEach(b => b.onclick = () => finish(b.dataset.k));
      m.onkeydown = e => { if (e.key === 'Escape') { e.stopPropagation(); finish('cancel'); } };
      ($('modal-actions').querySelector('.primary') || $('modal-actions').querySelector('button')).focus();
    });
  }
  function askText(title, text, value) {
    return new Promise(done => {
      const m = $('modal'), input = $('modal-input');
      $('modal-title').textContent = title; $('modal-text').textContent = text;
      input.hidden = false; input.value = value || '';
      $('modal-actions').innerHTML = '<button type="button" data-k="cancel">Annuler</button><button type="button" data-k="ok" class="primary">OK</button>';
      m.hidden = false;
      const finish = v => { m.hidden = true; input.hidden = true; m.onkeydown = null; done(v); };
      $('modal-actions').querySelectorAll('button').forEach(b => b.onclick = () => finish(b.dataset.k === 'ok' ? input.value.trim() : null));
      m.onkeydown = e => { if (e.key === 'Escape') { e.stopPropagation(); finish(null); } if (e.key === 'Enter') { e.preventDefault(); finish(input.value.trim()); } };
      input.focus(); input.select();
    });
  }
  function ago(ms) {
    const s = (Date.now() - ms) / 1000;
    if (s < 60) return 'à l’instant';
    if (s < 3600) return 'il y a ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'il y a ' + Math.floor(s / 3600) + ' h';
    if (s < 172800) return 'hier';
    return 'le ' + new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: new Date(ms).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
  }
  /* wraps the searched words in <mark>, when folding keeps the text the same length (it does for French) */
  function mark(text, terms) {
    const t = String(text ?? ''), f = fold(t);
    if (!terms.length || f.length !== t.length) return esc(t);
    const ranges = [];
    for (const term of terms) { let i = f.indexOf(term); while (i >= 0 && ranges.length < 40) { ranges.push([i, i + term.length]); i = f.indexOf(term, i + term.length); } }
    if (!ranges.length) return esc(t);
    ranges.sort((a, b) => a[0] - b[0]);
    let out = '', at = 0;
    for (const [a, b] of ranges) { if (a < at) continue; out += esc(t.slice(at, a)) + '<mark>' + esc(t.slice(a, b)) + '</mark>'; at = b; }
    return out + esc(t.slice(at));
  }

  /* ---------------------------- the file list ---------------------------- */
  const metaOf = f => {
    const h = f.h || {};
    return { ...h, domaine: h.domaine || (f.p.startsWith('domaines/') && f.p.split('/').length > 2 ? f.p.split('/')[1] : '') };
  };
  const projetsOf = f => {
    const list = String(metaOf(f).projet || '').split(',').map(x => x.trim()).filter(Boolean);
    const own = /^projets\/([^/]+)\.md$/.exec(f.p);
    if (own && !list.includes(own[1])) list.push(own[1]);
    return list;
  };
  /* what a file says: its title (its first # heading, else a skill's name) and its summary (resume, else description) */
  const titreDe = f => String(f.t || metaOf(f).name || '').trim() || baseName(f.p);
  const resumeDe = f => { const m = metaOf(f); return String(m.resume || m.description || '').trim(); };
  const autreNom = (titre, nom) => fold(titre) !== fold(nom) && fold(titre) !== fold(nom.replace(/\.[^.]+$/, ''));
  const filtering = () => Object.values(S.filters).some(Boolean);
  function passes(f, skip) {
    const m = metaOf(f);
    for (const [k, v] of Object.entries(S.filters)) {
      if (!v || k === skip) continue;
      if (k === 'projet' ? !projetsOf(f).includes(v) : m[k] !== v) return false;
    }
    return true;
  }
  async function load() {
    const d = await api('/local/files');
    if (d.error && !d.files?.length) { $('tree').innerHTML = `<p class="side-note">${esc(d.error)}</p>`; return; }
    /* nothing moved since the last look: leave the list alone (an open filter menu stays open) */
    const sig = (d.files || []).map(f => f.p + ':' + f.m + ':' + f.s).join('\n') + '\n' + (d.dirs || []).join('\n');
    if (sig === S.sig) { if (!S.doc) paintRecent(); return; }
    S.sig = sig;
    S.files = d.files || []; S.byPath = new Map(S.files.map(f => [f.p, f])); S.dirs = new Set(d.dirs || []); S.root = d.root || S.root; S.loaded = true;
    if (S.firstVisit) { for (const p of S.dirs) if (/^domaines\/[^/]+$/.test(p)) S.open.add(p); S.firstVisit = false; }
    paintFilters(); paintSide(); if (!S.doc) paintRecent();
    if (S.doc && !S.byPath.has(S.doc.path)) checkDisk();
  }
  function paintFilters() {
    for (const [field, tous] of Object.entries(FIELDS)) {
      const box = $('f-' + field), counts = new Map(); let total = 0;
      for (const f of S.files) {
        if (!passes(f, field)) continue;
        total++;
        const v = metaOf(f)[field]; if (v && !v.startsWith('<')) counts.set(v, (counts.get(v) || 0) + 1);   /* not a template's placeholder */
      }
      const now = S.filters[field];
      if (now && !counts.has(now)) counts.set(now, 0);
      const opts = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'));
      box.innerHTML = [['', tous, total], ...opts.map(([v, n]) => [v, v, n])].map(([v, lib, n]) => `<button type="button" data-value="${esc(v)}" aria-pressed="${now === v}">${esc(lib)}<span>${n}</span></button>`).join('');
    }
  }
  function sortDirs(a, b, depth) {
    if (depth === 0) { const ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name); if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); }
    return a.name.localeCompare(b.name, 'fr', { numeric: true });
  }
  const sortFiles = (a, b) => (b.p.split('/').pop().startsWith('_') - a.p.split('/').pop().startsWith('_')) || baseName(a.p).localeCompare(baseName(b.p), 'fr', { numeric: true });
  function buildTree(files, withEmptyDirs) {
    const root = { name: '', path: '', dirs: new Map(), files: [], count: 0 };
    const dirNode = p => {
      let node = root;
      if (!p) return node;
      let acc = '';
      for (const part of p.split('/')) {
        acc = acc ? acc + '/' + part : part;
        if (!node.dirs.has(part)) node.dirs.set(part, { name: part, path: acc, dirs: new Map(), files: [], count: 0 });
        node = node.dirs.get(part);
      }
      return node;
    };
    if (withEmptyDirs) for (const d of S.dirs) dirNode(d);
    for (const f of files) {
      dirNode(dirOf(f.p)).files.push(f);
      let acc = ''; root.count++;
      for (const part of dirOf(f.p).split('/').filter(Boolean)) { acc = acc ? acc + '/' + part : part; dirNode(acc).count++; }
    }
    return root;
  }
  function fileRow(f, depth, extra = '') {
    const m = metaOf(f), nom = baseName(f.p), titre = titreDe(f), resume = resumeDe(f);
    const tip = [titre, resume, f.p].filter(Boolean).join('\n');
    const on = S.doc?.path === f.p;
    return `<div class="row file k-${f.k}${f.g ? ' gen' : ''}${on ? ' on' : ''}" role="treeitem" tabindex="${on ? 0 : -1}" aria-selected="${on}" data-file="${esc(f.p)}" style="--d:${depth}" title="${esc(tip)}">`
      + `<span class="ic">${ICONS[f.k] || ICONS.other}</span><span class="txt"><span class="l1"><span class="tt">${esc(titre)}${extra}</span>${autreNom(titre, nom) ? `<span class="fn">${esc(nom)}</span>` : ''}</span>`
      + (resume ? `<span class="rs">${esc(resume)}</span>` : '') + '</span>'
      + (m.statut ? `<span class="st st-${esc(m.statut)}">${esc(m.statut)}</span>` : '') + (on && dirty() ? '<span class="dot" title="Non enregistré">●</span>' : '') + '</div>';
  }
  function paintTree() {
    const filtered = filtering(), files = filtered ? S.files.filter(f => passes(f)) : S.files;
    const tree = buildTree(files, !filtered), rows = [];
    const walk = (node, depth) => {
      for (const d of [...node.dirs.values()].sort((a, b) => sortDirs(a, b, depth))) {
        const open = filtered || S.open.has(d.path);
        rows.push(`<div class="row dir${open ? ' open' : ''}" role="treeitem" tabindex="-1" aria-expanded="${open}" data-dir="${esc(d.path)}" style="--d:${depth}">${ICONS.chev}<span class="ic">${ICONS.dir}</span><span class="nm">${esc(d.name)}</span><span class="ct">${d.count || ''}</span></div>`);
        if (open) walk(d, depth + 1);
      }
      for (const f of node.files.sort(sortFiles)) rows.push(fileRow(f, depth));
    };
    walk(tree, 0);
    $('tree').innerHTML = rows.join('') || '<p class="side-note">Aucun fichier ne passe ces filtres.</p>';
    $('count').textContent = filtered ? `${files.length} fichier${files.length > 1 ? 's' : ''} sur ${S.files.length}` : 'Par dossier';
    $('total').textContent = S.files.length + ' fichiers';
    $('clear').hidden = !filtered;
    if (!$('tree').querySelector('[tabindex="0"]')) $('tree').querySelector('.row')?.setAttribute('tabindex', '0');
  }

  /* ---------------------------- search ---------------------------- */
  function searchLocal(terms) {
    const out = [];
    for (const f of S.files) {
      if (!passes(f)) continue;
      const m = metaOf(f), name = fold(baseName(f.p)), title = fold((f.t || '') + ' ' + (m.resume || '')), where = fold(f.p + ' ' + Object.values(m).join(' '));
      let score = 0, ok = true;
      for (const t of terms) {
        if (name.startsWith(t)) score += 0; else if (name.includes(t)) score += 1; else if (title.includes(t)) score += 2; else if (where.includes(t)) score += 3;
        else { ok = false; break; }
      }
      if (ok) out.push({ f, score: score + (f.g ? 5 : 0) });
    }
    return out.sort((a, b) => a.score - b.score || b.f.m - a.f.m).map(x => ({ f: x.f }));
  }
  let searchTimer = 0, searchSeq = 0;
  function onQuery() {
    S.q = $('q').value.trim(); S.sel = S.q ? 0 : -1;
    paintSide();
    clearTimeout(searchTimer);
    if (S.q.length < 2) { S.hits = null; return; }
    const q = S.q, seq = ++searchSeq;
    searchTimer = setTimeout(async () => {
      const d = await api('/local/files/search?q=' + encodeURIComponent(q));
      if (seq !== searchSeq) return;
      S.hits = d.results || []; S.hitsFor = q; paintSide();
    }, 220);
  }
  function paintResults() {
    const terms = fold(S.q).split(/\s+/).filter(Boolean);
    const list = searchLocal(terms), seen = new Set(list.map(r => r.f.p));
    if (S.hits && S.hitsFor === S.q) {
      const more = S.hits.filter(h => !seen.has(h.p) && S.byPath.has(h.p) && passes(S.byPath.get(h.p)))
        .sort((a, b) => (S.byPath.get(a.p).g || 0) - (S.byPath.get(b.p).g || 0) || (S.byPath.get(a.p).k !== 'md') - (S.byPath.get(b.p).k !== 'md') || b.n - a.n);
      for (const h of more) list.push({ f: S.byPath.get(h.p), hit: h });
      for (const r of list) if (!r.hit) { const h = S.hits.find(x => x.p === r.f.p); if (h) r.line = h.line; }
    }
    S.results = list.slice(0, 200);
    S.sel = Math.min(Math.max(S.sel, 0), S.results.length - 1);
    const rows = S.results.map((r, i) => {
      const f = r.f, m = metaOf(f), dir = dirOf(f.p);
      const resume = resumeDe(f), sub = r.hit && !resume ? `<span class="snip">${mark(r.hit.text, terms)}</span>` : resume ? `<span class="snip">${mark(resume, terms)}</span>` + (r.hit ? `<span class="snip">« ${mark(r.hit.text, terms)} »</span>` : '') : '';
      const nom = baseName(f.p), titre = titreDe(f);
      return `<div class="res k-${f.k}${f.g ? ' gen' : ''}${i === S.sel ? ' sel' : ''}${S.doc?.path === f.p ? ' on' : ''}" role="option" aria-selected="${i === S.sel}" data-i="${i}" title="${esc(f.p)}">`
        + `<span class="ic">${ICONS[f.k] || ICONS.other}</span><span class="txt"><span class="r1"><span class="nm">${mark(titre, terms)}</span>${autreNom(titre, nom) ? `<span class="fn">${mark(nom, terms)}</span>` : ''}<span style="flex:1"></span>${m.statut ? `<span class="st st-${esc(m.statut)}">${esc(m.statut)}</span>` : ''}</span>`
        + `${sub}<span class="r2">${esc(dir || 'racine')} · ${ago(f.m)}${r.hit ? ` · ligne ${r.hit.line}${r.hit.n > 1 ? ` · ${r.hit.n} fois` : ''}` : ''}</span></span></div>`;
    });
    const waiting = S.q.length >= 2 && S.hitsFor !== S.q;
    $('tree').innerHTML = rows.join('') + (waiting ? '<p class="side-note">Recherche dans le texte…</p>' : rows.length ? '' : `<p class="side-note">Rien ne correspond à « ${esc(S.q)} »${filtering() ? ' avec ces filtres' : ''}.</p>`);
    $('count').textContent = S.results.length + ' résultat' + (S.results.length > 1 ? 's' : '');
    $('clear').hidden = false;
    $('tree').querySelector('.res.sel')?.scrollIntoView({ block: 'nearest' });
  }
  function paintSide() { if (!S.loaded) return; $('side').classList.toggle('searching', !!S.q); S.q ? paintResults() : paintTree(); }
  function clearSearch() {
    $('q').value = ''; S.q = ''; S.hits = null; S.sel = -1;
    for (const k of Object.keys(S.filters)) S.filters[k] = '';
    paintFilters(); paintSide();
  }
  function revealInTree(p) {
    let acc = '';
    for (const part of dirOf(p).split('/').filter(Boolean)) { acc = acc ? acc + '/' + part : part; S.open.add(acc); }
    store.set('open', [...S.open]);
    paintSide();
    const row = [...$('tree').querySelectorAll('.row.file')].find(r => r.dataset.file === p);
    row?.scrollIntoView({ block: 'nearest' });
  }
  function paintRecent() {
    const recent = S.files.filter(f => !f.g && (f.k === 'md' || f.k === 'text')).sort((a, b) => b.m - a.m).slice(0, 8);
    $('recent-title').hidden = !recent.length;
    $('recent').innerHTML = recent.map(f => `<button type="button" class="recent" data-file="${esc(f.p)}"><span class="ic">${ICONS[f.k]}</span><span class="txt"><span class="nm">${esc(titreDe(f))}</span>${resumeDe(f) ? `<span class="rs">${esc(resumeDe(f))}</span>` : ''}<span class="r2">${esc(f.p)}</span></span><span class="when">${ago(f.m)}</span></button>`).join('');
  }

  /* ---------------------------- the open file ---------------------------- */
  /* the text box always gives \n; a file written with \r\n gets them back when saved */
  function lineEnds(doc, text) { if (text === undefined) return; doc.eol = /\r\n/.test(text) ? '\r\n' : '\n'; doc.content = doc.saved = text.replace(/\r\n?/g, '\n'); }
  const textDoc = () => S.doc && (S.doc.kind === 'md' || S.doc.kind === 'text') && !S.doc.tooBig && S.doc.content !== undefined;
  const dirty = () => textDoc() && (S.pvPending || src.value !== S.doc.saved);
  const modeNow = () => !S.doc ? '' : S.doc.kind === 'md' && !S.doc.tooBig ? (S.edition ? S.mode : 'preview') : S.doc.kind === 'text' && !S.doc.tooBig ? 'source' : 'other';
  async function leaveDoc() {
    pullNow();
    if (!dirty()) return true;
    const k = await ask('Modifications non enregistrées', `${baseName(S.doc.path)} a des modifications que tu n’as pas enregistrées.`, [['cancel', 'Annuler'], ['drop', 'Ne pas enregistrer'], ['save', 'Enregistrer', 'primary']]);
    if (k === 'save') return await save();
    return k === 'drop';
  }
  async function openFile(p, opts = {}) {
    if (S.doc?.path === p && !opts.reload) { if (opts.line) gotoLine(opts.line - 1, true); closeSideOnPhone(); return; }
    if (!opts.reload && !(await leaveDoc())) return;
    S.pvPending = false; clearTimeout(pullTimer);
    const d = await api('/local/files/read?path=' + encodeURIComponent(p));
    if (d.error) { toast(d.error, 'bad'); return; }
    S.doc = { ...d, gone: false, changed: false }; S.edition = !!opts.edit;
    lineEnds(S.doc, d.content);
    store.set('last', p);
    showDoc();
    revealInTree(p);
    if (opts.line) gotoLine(opts.line - 1, true);
    closeSideOnPhone();
  }
  function crumbs(p) {
    const parts = p.split('/'); parts.pop();
    return parts.length ? parts.map((x, i) => `<button type="button" data-dir="${esc(parts.slice(0, i + 1).join('/'))}">${esc(x)}</button>`).join('<span>/</span>') : '<span>racine du workspace</span>';
  }
  function showDoc() {
    const d = S.doc;
    $('empty').hidden = true; $('doc').hidden = false; document.body.classList.add('has-doc');
    $('doc-name').textContent = baseName(d.path);
    $('crumbs').innerHTML = crumbs(d.path);
    resetPanes();
    if (textDoc()) {
      src.readOnly = !d.editable || !S.edition;
      setText(d.content);
      src.scrollTop = 0; pvPane.scrollTop = 0;
    } else { src.value = ''; paintOther(); }
    paintMode(); paintState(); paintBanner(); syncEditable(); paintEdition();
  }
  /* reading, or writing: the buttons of the head follow */
  function paintEdition() {
    const d = S.doc, ecrit = !!d && textDoc() && d.editable;
    $('edit').hidden = !ecrit || S.edition;
    $('modes').hidden = !S.edition || d.kind !== 'md' || !!d.tooBig;
    $('save').hidden = $('cancel').hidden = $('done').hidden = !ecrit || !S.edition;
    /* while writing, the head keeps to what writing needs */
    $('copy-path').hidden = $('open-device').hidden = S.edition;
  }
  function ecrire(on) {
    S.edition = on;
    if (textDoc()) src.readOnly = !S.doc.editable || !on;
    paintMode(); paintEdition(); paintState();
    if (on) { if (modeNow() === 'source') src.focus({ preventScroll: true }); else pv.focus({ preventScroll: true }); }
  }
  function paintOther() {
    const d = S.doc;
    if (d.kind === 'image') {
      pv.className = 'md media';
      pv.innerHTML = `<figure class="img-view"><img alt="${esc(baseName(d.path))}"><figcaption>${esc(baseName(d.path))} · ${Math.max(1, Math.round(d.size / 1024))} Ko</figcaption></figure>`;
      blobUrl(d.path).then(u => { const img = pv.querySelector('.img-view img'); if (u && img) img.src = u; });
    } else {
      pv.className = 'md media';
      pv.innerHTML = `<div class="other"><p>${d.tooBig ? 'Ce fichier est trop lourd pour l’éditeur (' + Math.round(d.size / 1024) + ' Ko).' : 'Ce fichier ne s’ouvre pas dans l’éditeur.'}</p><button type="button" class="primary" data-act="device">Ouvrir avec l’application de l’ordinateur</button></div>`;
    }
  }
  function paintMode() {
    const m = modeNow();
    $('panes').dataset.mode = m;
    $('modes').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
    if ((m === 'preview' || m === 'split') && textDoc()) renderPreview(true);
    if (m === 'split') requestAnimationFrame(syncFromEditor);
    syncEditable();
  }
  function setMode(m) {
    if (!['preview', 'source', 'split'].includes(m)) return;
    pullNow();
    S.mode = m; store.set('mode', m); paintMode();
    if (m === 'source' && textDoc() && S.doc.editable) src.focus({ preventScroll: true });
  }
  function paintState() {
    const d = S.doc; if (!d) return;
    const isDirty = dirty();
    $('dirty').hidden = !isDirty;
    $('save').disabled = !isDirty || S.saving;
    $('save').classList.toggle('primary', isDirty);
    $('save').textContent = S.saving ? 'Enregistrement…' : 'Enregistrer';
    $('doc-state').textContent = d.generated || d.notUtf8 ? 'lecture seule' : isDirty ? 'non enregistré' : d.mtime ? 'modifié ' + ago(d.mtime) : '';
    const row = [...$('tree').querySelectorAll('.row.file.on')][0];
    if (row && !!row.querySelector('.dot') !== isDirty) paintSide();
    document.title = (isDirty ? '● ' : '') + baseName(d.path) + ' · SM4RT Fichiers';
  }
  function paintBanner() {
    const d = S.doc, b = $('banner');
    let html = '';
    if (d.generated) html = '<b>Fichier généré.</b> <code>systeme/scripts/index.py</code> le réécrit à partir des en-têtes des fichiers : modifie plutôt ces fichiers-là. Il s’affiche ici en lecture seule.';
    else if (d.notUtf8) html = '<b>Ce fichier n’est pas en UTF-8.</b> Il s’affiche en lecture seule, pour ne pas l’abîmer en l’enregistrant.';
    else if (d.gone) html = '<b>Ce fichier n’est plus à cet endroit.</b> Il a sans doute été rangé ou archivé. Ton texte reste ici : copie-le si tu en as besoin.';
    else if (d.changed) html = '<b>Ce fichier a changé sur le disque</b> depuis que tu l’as ouvert (un agent ou une routine, sans doute). <button type="button" data-act="take-disk">Prendre la version du disque</button>';
    b.innerHTML = html; b.hidden = !html; b.className = d.generated || d.notUtf8 ? 'info' : 'warn';
  }

  /* ---------------------------- the text box and its coloured copy ---------------------------- */
  let hlFrame = 0, pvTimer = 0, hlKeys = [], pvKeys = [];
  const plain = () => !textDoc() || src.value.length > BIG;
  /* puts the new list in place of the old one, replacing only the run that changed (same start, same end);
     a long file keeps every untouched line and block, so the page does not lay them out again */
  function patch(parent, oldKeys, newKeys, build) {
    let a = 0, b0 = oldKeys.length, b1 = newKeys.length;
    while (a < b0 && a < b1 && oldKeys[a] === newKeys[a]) a++;
    while (b0 > a && b1 > a && oldKeys[b0 - 1] === newKeys[b1 - 1]) { b0--; b1--; }
    const kids = parent.children, before = kids[b0] || null;
    for (let i = b0 - 1; i >= a; i--) kids[i].remove();
    if (b1 > a) parent.insertBefore(build(a, b1), before);
  }
  function resetPanes() { hl.replaceChildren(); pv.replaceChildren(); hlKeys = []; pvKeys = []; pv.className = 'md'; S.pvTouched = false; mo.takeRecords(); dirtyBlocks.clear(); }
  function paintHl() {
    hlFrame = 0;
    const isPlain = plain();
    $('ed').classList.toggle('plain', isPlain);
    if (isPlain) { if (hlKeys.length) { hl.replaceChildren(); hlKeys = []; } }
    else {
      const lines = MD.lines(src.value, S.doc.kind === 'md');
      patch(hl, hlKeys, lines, (a, b) => { const tpl = document.createElement('template'); tpl.innerHTML = lines.slice(a, b).join(''); return tpl.content; });
      hlKeys = lines;
    }
    hl.scrollTop = src.scrollTop; hl.scrollLeft = src.scrollLeft;
  }
  function setText(text) { src.value = text; paintHl(); if (S.doc.kind === 'md') renderPreview(true); }
  function onInput() {
    if (!hlFrame) hlFrame = requestAnimationFrame(paintHl);
    if (S.quiet) refreshHeader();
    else { clearTimeout(pvTimer); pvTimer = setTimeout(() => renderPreview(), 90); }
    paintState();
  }
  /* edits go through insertText, so ⌘ Z / Ctrl Z still undoes them */
  function replaceRange(start, end, text, keepSelection = true) {
    const busy = document.activeElement;
    if (busy !== src && busy && (busy.isContentEditable || busy.matches?.('input,select'))) { src.setRangeText(text, start, end, 'preserve'); onInput(); return; }
    const s0 = src.selectionStart, s1 = src.selectionEnd, wasActive = document.activeElement === src;
    src.focus({ preventScroll: true });
    src.setSelectionRange(start, end);
    let ok = false;
    if (document.activeElement === src) try { ok = document.execCommand('insertText', false, text); } catch (_) { ok = false; }
    if (!ok) { src.setRangeText(text, start, end, 'end'); onInput(); }
    if (keepSelection) { const shift = text.length - (end - start), adj = x => x >= end ? x + shift : x > start ? start + text.length : x; src.setSelectionRange(adj(s0), adj(s1)); }
    if (!wasActive) src.blur();
  }
  src.addEventListener('input', onInput);
  src.addEventListener('scroll', () => { hl.scrollTop = src.scrollTop; hl.scrollLeft = src.scrollLeft; if (modeNow() === 'split' && syncing !== 'preview') syncFromEditor(); });
  src.addEventListener('keydown', e => {
    if (e.key === 'Escape') { src.blur(); return; }
    if (src.readOnly) return;
    const v = src.value, a = src.selectionStart, b = src.selectionEnd;
    const lineStart = v.lastIndexOf('\n', a - 1) + 1, lineEnd = v.indexOf('\n', a) < 0 ? v.length : v.indexOf('\n', a), line = v.slice(lineStart, lineEnd);
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const multi = v.slice(a, b).includes('\n'), isList = /^\s*([-*+]|\d+[.)])\s/.test(line);
      if (!multi && !isList && !e.shiftKey) { e.preventDefault(); replaceRange(a, b, '  ', false); return; }
      e.preventDefault();
      const end = v.indexOf('\n', Math.max(a, b - 1)) < 0 ? v.length : v.indexOf('\n', Math.max(a, b - 1));
      const block = v.slice(lineStart, end), lines = block.split('\n');
      const next = lines.map(l => e.shiftKey ? l.replace(/^( {1,2}|\t)/, '') : '  ' + l).join('\n');
      if (next === block) return;
      replaceRange(lineStart, end, next, false);
      const first = next.split('\n')[0].length - lines[0].length;
      src.setSelectionRange(Math.max(lineStart, a + first), b + next.length - block.length);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && a === b && a === lineEnd) {
      const m = /^(\s*)([-*+]|(\d+)([.)]))(\s+)(\[[ xX]\]\s+)?(.*)$/.exec(line);
      if (!m) return;
      e.preventDefault();
      if (!m[7].trim()) { replaceRange(lineStart, lineEnd, m[1].length >= 2 ? m[1].slice(2) : '', false); return; }
      const marker = m[3] ? (+m[3] + 1) + m[4] : m[2];
      replaceRange(a, a, '\n' + m[1] + marker + m[5] + (m[6] ? '[ ] ' : ''), false);
    }
  });

  /* ---------------------------- the styled view ---------------------------- */
  let pvFresh = '';
  function renderPreview(force) {
    if (!textDoc() || S.doc.kind !== 'md') return;
    const m = modeNow();
    if (!force && m !== 'preview' && m !== 'split') return;
    const text = src.value;
    if (text === pvFresh && pvKeys.length) return;
    pvFresh = text;
    if (S.pvTouched) { pv.replaceChildren(); pvKeys = []; S.pvTouched = false; }
    const top = pvPane.scrollTop, list = MD.blocks(text), keys = list.map(b => b.key);
    patch(pv, pvKeys, keys, (a, b) => MD.fragment(list.slice(a, b).map(x => x.html).join('')));
    pvKeys = keys;
    [...pv.children].forEach((el, i) => { const line = String(list[i]?.line ?? 0); if (el.dataset.line !== line) el.dataset.line = line; if (list[i] && !list[i].fm) blockSrc.set(el, list[i].src); });
    mo.takeRecords(); dirtyBlocks.clear();
    MD.number(pv);
    const boxes = MD.tasks(text), inputs = pv.querySelectorAll('input[data-task]');
    const canTick = S.doc.editable && S.edition && (boxes.length === inputs.length || pvEditable());
    inputs.forEach(box => { box.disabled = !canTick; box.title = canTick ? 'Cocher dans le fichier' : ''; });
    pv.querySelectorAll('img[data-src]:not([data-done])').forEach(img => {
      img.dataset.done = 1;
      const s = img.dataset.src;
      if (/^(data:image\/)/i.test(s)) { img.src = s; return; }
      if (/^[a-z]+:/i.test(s) || s.startsWith('//')) { img.classList.add('far'); img.title = 'Image en ligne : pas affichée ici'; return; }
      const p = resolve(s);
      if (S.byPath.get(p)?.k === 'image') blobUrl(p).then(u => { if (u) img.src = u; });
      else { img.classList.add('far'); img.title = 'Image introuvable : ' + p; }
    });
    pvPane.scrollTop = top;
  }
  function resolve(href) {
    let h = String(href).split('#')[0].split('?')[0];
    try { h = decodeURIComponent(h); } catch (_) { }
    const parts = (h.startsWith('/') ? [] : dirOf(S.doc.path).split('/').filter(Boolean));
    for (const seg of h.replace(/^\/+/, '').split('/')) { if (seg === '..') parts.pop(); else if (seg && seg !== '.') parts.push(seg); }
    return parts.join('/');
  }
  async function blobUrl(p) {
    const f = S.byPath.get(p), hit = S.blobs.get(p);
    if (hit && (!f || hit.m === f.m)) return hit.url;
    try {
      const r = await fetch('/local/files/raw?path=' + encodeURIComponent(p), { cache: 'no-store' });
      if (!r.ok) return null;
      const url = URL.createObjectURL(await r.blob());
      if (hit) URL.revokeObjectURL(hit.url);
      S.blobs.set(p, { url, m: f?.m });
      return url;
    } catch (_) { return null; }
  }
  pv.addEventListener('click', e => {
    const box = e.target.closest('input[type=checkbox]');
    if (box) {
      if (box.disabled) { e.preventDefault(); return; }
      /* a page not yet edited here: change the one character in the file; otherwise the block is written again */
      const marks = MD.tasks(src.value), t = !S.pvTouched && box.dataset.task !== undefined ? marks[+box.dataset.task] : null;
      if (t && marks.length === pv.querySelectorAll('input[data-task]').length) { replaceRange(t.at, t.at + 1, t.checked ? ' ' : 'x'); renderPreview(true); }
      else if (pvEditable()) { markDirty(box); onPreviewInput(); }
      return;
    }
    const a = e.target.closest('a');
    if (!a) return;
    /* in the editable view a click puts the caret in the link; ⌘ or Ctrl click opens it */
    if (pvEditable() && !e.metaKey && !e.ctrlKey) { e.preventDefault(); return; }
    e.preventDefault();
    if (a.dataset.wiki) {
      const key = fold(a.dataset.wiki.replace(/\.md$/i, '')), hit = S.files.find(f => fold(baseName(f.p).replace(/\.md$/i, '')) === key) || S.files.find(f => fold(f.p.replace(/\.md$/i, '')).endsWith(key));
      hit ? openFile(hit.p) : toast('Introuvable : ' + a.dataset.wiki, 'bad');
      return;
    }
    const href = a.getAttribute('href') || '';
    if (/^(https?:|mailto:)/i.test(href)) { window.open(href, '_blank', 'noopener'); return; }
    if (href.startsWith('#')) { pv.querySelector('#' + CSS.escape(decodeURIComponent(href.slice(1))))?.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    const p = resolve(href);
    if (S.byPath.has(p)) openFile(p);
    else if (S.dirs.has(p.replace(/\/$/, ''))) { revealDir(p.replace(/\/$/, '')); }
    else toast('Introuvable : ' + p, 'bad');
  });
  /* a double click in the styled view puts the caret on that block's line */
  pv.addEventListener('dblclick', e => {
    if (!textDoc() || S.doc.kind !== 'md' || pvEditable() || e.target.closest('a,input')) return;
    const blk = e.target.closest('[data-line]'); if (!blk) return;
    if (modeNow() === 'preview') setMode('split');
    gotoLine(+blk.dataset.line, true);
  });

  /* ---------------------------- writing in the styled view ----------------------------
     The Aperçu is an editable page. Each block remembers its own text in the file; a block the user
     changes (a MutationObserver sees it) is written back to Markdown, the others go back exactly as they
     were. The Markdown follows 300 ms after the last key, and before any save, mode change or file change. */
  const blockSrc = new WeakMap(), dirtyBlocks = new Set();
  const topBlock = n => { while (n && n.parentNode !== pv) n = n.parentNode; return n; };
  const mo = new MutationObserver(recs => noteMutations(recs));
  function noteMutations(recs) {
    for (const r of recs) {
      if (r.target === pv) { r.addedNodes.forEach(a => dirtyBlocks.add(a)); continue; }
      const b = topBlock(r.target); if (b) dirtyBlocks.add(b);
    }
  }
  mo.observe(pv, { childList: true, characterData: true, subtree: true });
  let pullTimer = 0;
  const pvEditable = () => textDoc() && S.doc.kind === 'md' && S.doc.editable && S.edition && (modeNow() === 'preview' || modeNow() === 'split');
  function syncEditable() {
    const on = !!pvEditable();
    pv.contentEditable = on ? 'true' : 'false';
    pv.spellcheck = on;
    $('fmt').hidden = !on;
  }
  const markDirty = n => { const b = topBlock(n); if (b) dirtyBlocks.add(b); };
  function onPreviewInput() {
    if (!pvEditable()) return;
    S.pvTouched = true; S.pvPending = true; paintState();
    clearTimeout(pullTimer); pullTimer = setTimeout(pullFromPreview, 300);
  }
  const pullNow = () => { if (S.pvPending) pullFromPreview(); };
  function pullFromPreview() {
    clearTimeout(pullTimer);
    noteMutations(mo.takeRecords());
    S.pvPending = false;
    if (!textDoc() || S.doc.kind !== 'md' || !S.doc.editable) return;
    const text = src.value, fm = MD.frontMatter(text), body = fm ? text.slice(fm.raw.length) : text;
    const lead = /^\s*/.exec(body)[0], base = (fm ? fm.raw : '') + lead;
    let out = base, lines = (out.match(/\n/g) || []).length;
    const add = s => { out += s; lines += (s.match(/\n/g) || []).length; };
    const kids = [...pv.children].filter(el => !el.matches('header.fm'));
    kids.forEach((el, i) => {
      const raw = blockSrc.get(el), last = i === kids.length - 1;
      if (raw !== undefined && !dirtyBlocks.has(el)) { el.dataset.line = lines; add(raw); return; }
      const md = MD.toMarkdown(el).replace(/\s+$/, '');
      if (!md) return;
      if (out.length > base.length && !/\n\s*\n$/.test(out)) add(out.endsWith('\n') ? '\n' : '\n\n');
      el.dataset.line = lines;
      const trail = raw !== undefined ? /\s*$/.exec(raw)[0] : '';
      add(md + (last ? '\n' : /\n\s*\n/.test(trail) ? trail : '\n\n'));
    });
    if (out === text) { paintState(); return; }
    src.value = out;
    pvFresh = out;
    paintHl(); paintState();
  }
  /* the header card is not edited here; when maj changes on saving, only the card is drawn again */
  function refreshHeader() {
    const first = MD.blocks(src.value)[0], old = pv.querySelector(':scope > header.fm');
    if (first?.fm && old) { const el = MD.fragment(first.html).firstElementChild; el.dataset.line = '0'; old.replaceWith(el); pvKeys[0] = first.key; mo.takeRecords(); }
    pvFresh = src.value;
  }
  pv.addEventListener('input', e => {
    onPreviewInput();
    if (e.inputType === 'insertText' && e.data === ' ') autoFormat();
    if (e.inputType === 'insertParagraph') carryTask();
  });
  /* pasting brings plain text only: no styles from elsewhere */
  pv.addEventListener('paste', e => {
    if (!pvEditable()) return;
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
  });
  pv.addEventListener('keydown', e => {
    if (!pvEditable()) return;
    const k = e.key.toLowerCase();
    if (e.key === 'Escape') { pv.blur(); return; }
    if ((e.metaKey || e.ctrlKey) && !e.altKey && k === 'k') { e.preventDefault(); fmt('link'); return; }
    if (e.key === 'Tab' && closestIn('LI')) { e.preventDefault(); document.execCommand(e.shiftKey ? 'outdent' : 'indent'); }
  });
  function closestIn(tag) {
    const sel = getSelection(); if (!sel.rangeCount) return null;
    let n = sel.anchorNode; if (n?.nodeType === 3) n = n.parentNode;
    const el = n?.closest?.(tag);
    return el && pv.contains(el) && el !== pv ? el : null;
  }
  /* Markdown habits work while typing: "# " a title, "- " a list, "1. " a numbered list, "> " a quote, "[] " a task */
  function autoFormat() {
    const sel = getSelection(); if (!sel.isCollapsed || !sel.rangeCount) return;
    const block = closestIn('p,div,h1,h2,h3,h4,h5,h6,li');
    if (!block || block.matches('header.fm, header.fm *')) return;
    const r = document.createRange(); r.setStart(block, 0); r.setEnd(sel.anchorNode, sel.anchorOffset);
    const m = /^(#{1,3}|[-*]|1[.)]|>|\[ ?\]) $/.exec(r.toString().replace(/ /g, ' '));
    if (!m || (block.tagName === 'LI' && m[1][0] !== '[')) return;
    sel.removeAllRanges(); sel.addRange(r); document.execCommand('delete');
    const k = m[1];
    if (k[0] === '#') document.execCommand('formatBlock', false, 'h' + k.length);
    else if (k === '-' || k === '*') document.execCommand('insertUnorderedList');
    else if (k[0] === '1') document.execCommand('insertOrderedList');
    else if (k === '>') document.execCommand('formatBlock', false, 'blockquote');
    else toggleTask();
  }
  /* Enter at the end of a task gives a new task */
  function carryTask() {
    const li = closestIn('LI'), prev = li?.previousElementSibling;
    if (li && prev?.querySelector(':scope > input[type=checkbox]') && !li.querySelector(':scope > input[type=checkbox]')) { const b = document.createElement('input'); b.type = 'checkbox'; li.prepend(b); }
  }
  function toggleTask() {
    let li = closestIn('LI');
    if (!li) { document.execCommand('insertUnorderedList'); li = closestIn('LI'); }
    if (!li) return;
    const box = li.querySelector(':scope > input[type=checkbox]');
    if (box) box.remove(); else { const b = document.createElement('input'); b.type = 'checkbox'; li.prepend(b); }
    markDirty(li); onPreviewInput();
  }
  async function fmt(cmd) {
    if (!pvEditable()) return;
    const sel = getSelection();
    if (cmd !== 'source' && (!sel.rangeCount || !pv.contains(sel.anchorNode))) { toast('Clique d’abord dans le texte.'); return; }
    if (/^(p|h1|h2|h3)$/.test(cmd)) document.execCommand('formatBlock', false, cmd);
    else if (cmd === 'quote') { if (closestIn('BLOCKQUOTE')) document.execCommand('outdent'); else document.execCommand('formatBlock', false, 'blockquote'); }
    else if (cmd === 'bold' || cmd === 'italic') document.execCommand(cmd);
    else if (cmd === 'ul') document.execCommand('insertUnorderedList');
    else if (cmd === 'ol') document.execCommand('insertOrderedList');
    else if (cmd === 'task') toggleTask();
    else if (cmd === 'link') {
      const range = sel.getRangeAt(0).cloneRange(), a = closestIn('A');
      const url = await askText('Lien', 'Une adresse (https://…) ou le chemin d’un fichier du workspace, relatif à celui-ci.', a?.getAttribute('href') || '');
      pv.focus({ preventScroll: true }); sel.removeAllRanges(); sel.addRange(range);
      if (url === null) return;
      if (a && !url) { sel.selectAllChildren(a); document.execCommand('unlink'); }
      else if (url && range.collapsed && !a) document.execCommand('insertHTML', false, `<a href="${esc(url)}">${esc(url)}</a>`);
      else if (url) { if (a) sel.selectAllChildren(a); document.execCommand('createLink', false, url); }
    }
    else if (cmd === 'source') {
      pullNow();
      const b = topBlock(sel.rangeCount && pv.contains(sel.anchorNode) ? sel.anchorNode : null);
      if (modeNow() === 'preview') setMode('split');
      gotoLine(b ? +b.dataset.line || 0 : 0, true);
    }
    paintFmt();
  }
  /* the bar shows what the caret is in */
  function paintFmt() {
    if ($('fmt').hidden) return;
    const block = closestIn('h1,h2,h3,p,li,blockquote');
    const tag = block ? (block.closest('h1,h2,h3')?.tagName.toLowerCase() || 'p') : '';
    $('fmt').querySelectorAll('[data-cmd]').forEach(b => {
      const c = b.dataset.cmd;
      let on = false;
      try { on = /^(p|h1|h2|h3)$/.test(c) ? tag === c : c === 'bold' || c === 'italic' ? document.queryCommandState(c) : c === 'ul' ? !!closestIn('UL') : c === 'ol' ? !!closestIn('OL') : c === 'quote' ? !!closestIn('BLOCKQUOTE') : c === 'link' ? !!closestIn('A') : false; } catch (_) { }
      b.setAttribute('aria-pressed', on);
    });
  }
  document.addEventListener('selectionchange', () => { if (pvEditable() && pv.contains(getSelection().anchorNode)) paintFmt(); });
  /* buttons keep the caret where it is in the text */
  $('fmt').addEventListener('pointerdown', e => { if (e.target.closest('[data-cmd]')) e.preventDefault(); });
  $('fmt').addEventListener('click', e => { const b = e.target.closest('[data-cmd]'); if (b) fmt(b.dataset.cmd); });
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (_) { }

  /* ---------------------------- the two panes scroll together ---------------------------- */
  let syncing = '', syncTimer = 0;
  const hold = who => { syncing = who; clearTimeout(syncTimer); syncTimer = setTimeout(() => syncing = '', 120); };
  const padTop = () => parseFloat(getComputedStyle(src).paddingTop) || 0;
  function lineTop(n) {
    const lines = hl.children;
    if (!plain() && lines.length) { const el = lines[Math.max(0, Math.min(lines.length - 1, Math.floor(n)))]; const next = lines[Math.floor(n) + 1]; const t = el.offsetTop; return next ? t + (next.offsetTop - t) * (n - Math.floor(n)) : t; }
    const total = src.value.split('\n').length || 1;
    return padTop() + (src.scrollHeight - padTop()) * n / total;
  }
  function topLine() {
    const y = src.scrollTop + padTop(), lines = hl.children;
    if (plain() || !lines.length) return (src.value.split('\n').length) * src.scrollTop / Math.max(1, src.scrollHeight);
    let lo = 0, hi = lines.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lines[mid].offsetTop <= y) lo = mid; else hi = mid - 1; }
    const t = lines[lo].offsetTop, n = lines[lo + 1] ? lines[lo + 1].offsetTop : t + 20;
    return lo + Math.min(1, Math.max(0, (y - t) / Math.max(1, n - t)));
  }
  const blocks = () => [...pv.querySelectorAll('[data-line]')].map(el => ({ line: +el.dataset.line, top: el.offsetTop }));
  function syncFromEditor() {
    if (modeNow() !== 'split' || syncing === 'preview') return;
    const bl = blocks(); if (!bl.length) return;
    if (src.scrollTop + src.clientHeight >= src.scrollHeight - 4) { hold('editor'); pvPane.scrollTop = pvPane.scrollHeight; return; }
    const L = topLine();
    let i = 0; while (i + 1 < bl.length && bl[i + 1].line <= L) i++;
    const a = bl[i], b = bl[i + 1], frac = b && b.line > a.line ? Math.min(1, Math.max(0, (L - a.line) / (b.line - a.line))) : 0;
    hold('editor');
    pvPane.scrollTop = Math.max(0, a.top + (b ? (b.top - a.top) * frac : 0) - 24);
  }
  function syncFromPreview() {
    if (modeNow() !== 'split' || syncing === 'editor') return;
    const bl = blocks(); if (!bl.length) return;
    const y = pvPane.scrollTop + 24;
    let i = 0; while (i + 1 < bl.length && bl[i + 1].top <= y) i++;
    const a = bl[i], b = bl[i + 1], frac = b && b.top > a.top ? Math.min(1, Math.max(0, (y - a.top) / (b.top - a.top))) : 0;
    hold('preview');
    src.scrollTop = Math.max(0, lineTop(a.line + (b ? (b.line - a.line) * frac : 0)) - padTop());
  }
  pvPane.addEventListener('scroll', () => { if (syncing !== 'editor') syncFromPreview(); });
  function gotoLine(n, focus) {
    if (!textDoc()) return;
    const v = src.value; let at = 0;
    for (let i = 0; i < n && at >= 0; i++) at = v.indexOf('\n', at) + 1 || v.length;
    if (focus) { src.focus({ preventScroll: true }); src.setSelectionRange(at, at); }
    if (modeNow() !== 'preview') { hold('preview'); src.scrollTop = Math.max(0, lineTop(n) - src.clientHeight / 3); hl.scrollTop = src.scrollTop; setTimeout(() => { syncing = ''; syncFromEditor(); }, 0); }
    const el = hl.children[n];
    if (el) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600); }
  }

  /* ---------------------------- saving ---------------------------- */
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  /* the header's maj field takes today's date when the text changed */
  function bumpMaj() {
    if (S.doc.kind !== 'md') return;
    const v = src.value, fm = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(\n|$)/.exec(v);
    if (!fm) return;
    const m = /^maj:[ \t]*(.*)$/m.exec(fm[1]);
    if (!m || m[1].trim() === today()) return;
    const start = 4 + fm[0].slice(4).indexOf(m[0]) + m[0].length - m[1].length;
    S.quiet = true;
    try { replaceRange(start, start + m[1].length, today()); } finally { S.quiet = false; }
  }
  async function save(force = false) {
    if (!textDoc() || !S.doc.editable || S.saving) return false;
    pullNow();
    if (!dirty() && !force) return true;
    bumpMaj();
    const d0 = S.doc, text = src.value;
    S.saving = true; paintState();
    const r = await post('/local/files/save', { path: d0.path, content: d0.eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text, base: d0.hash, force });
    S.saving = false;
    if (S.doc !== d0) return false;
    if (r.conflict) {
      paintState();
      const k = await ask('Ce fichier a changé sur le disque', 'Quelqu’un l’a modifié depuis que tu l’as ouvert (un agent ou une routine, sans doute). Quelle version garder ?', [['cancel', 'Annuler'], ['disk', 'Prendre la version du disque'], ['mine', 'Garder ma version', 'primary']]);
      if (k === 'mine') return save(true);
      if (k === 'disk') { await openFile(d0.path, { reload: true }); toast('Version du disque affichée.'); }
      return false;
    }
    if (r.error) { paintState(); toast('Pas enregistré : ' + r.error, 'bad'); return false; }
    d0.saved = text; d0.hash = r.hash; d0.mtime = r.mtime; d0.changed = false;
    if (r.content !== undefined && src.value === text) { lineEnds(d0, r.content); const sel = [src.selectionStart, src.selectionEnd], top = src.scrollTop; setText(d0.saved); src.setSelectionRange(...sel); src.scrollTop = top; }
    paintState(); paintBanner();
    if (r.index?.ran && !r.index.ok) toast('Enregistré. Les index ne sont pas à jour : ' + r.index.message, 'warn');
    else toast(r.index?.ran ? 'Enregistré · index à jour' : 'Enregistré', 'ok');
    load();
    return true;
  }

  /* ---------------------------- changes made elsewhere ---------------------------- */
  async function checkDisk() {
    const d0 = S.doc;
    if (!textDoc() || S.saving || document.hidden) return;
    const r = await api('/local/files/read?stat=1&path=' + encodeURIComponent(d0.path));
    if (S.doc !== d0 || S.saving) return;
    if (r.status === 404) { if (!d0.gone) { d0.gone = true; paintBanner(); } return; }
    if (r.error || !r.hash) return;
    if (d0.gone) { d0.gone = false; paintBanner(); }
    if (r.hash === d0.hash) return;
    if (!dirty()) {
      const fresh = await api('/local/files/read?path=' + encodeURIComponent(d0.path));
      if (S.doc !== d0 || dirty() || fresh.error) return;
      const sel = [src.selectionStart, src.selectionEnd], top = src.scrollTop;
      Object.assign(d0, { hash: fresh.hash, mtime: fresh.mtime, changed: false }); lineEnds(d0, fresh.content);
      setText(d0.saved); src.setSelectionRange(...sel); src.scrollTop = top;
      paintState(); toast('Mis à jour : le fichier a changé sur le disque.');
    } else if (!d0.changed) { d0.changed = true; paintBanner(); }
  }
  setInterval(checkDisk, 5000);
  setInterval(() => { if (!document.hidden) load(); }, 30000);
  addEventListener('focus', () => { checkDisk(); load(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkDisk(); load(); } });
  addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------------------------- clicks and keys ---------------------------- */
  function revealDir(p) { $('q').value = ''; S.q = ''; let acc = ''; for (const part of p.split('/')) { acc = acc ? acc + '/' + part : part; S.open.add(acc); } store.set('open', [...S.open]); paintSide(); [...$('tree').querySelectorAll('.row.dir')].find(r => r.dataset.dir === p)?.scrollIntoView({ block: 'nearest' }); openSide(); }
  function toggleDir(p, open) {
    const now = S.open.has(p), next = open === undefined ? !now : open;
    if (next === now) return;
    next ? S.open.add(p) : S.open.delete(p);
    store.set('open', [...S.open]); paintSide();
    [...$('tree').querySelectorAll('.row.dir')].find(r => r.dataset.dir === p)?.focus({ preventScroll: true });
  }
  $('tree').addEventListener('click', e => {
    const row = e.target.closest('.row,.res');
    if (!row) return;
    if (row.dataset.dir) { if (filtering()) return; toggleDir(row.dataset.dir); return; }
    if (row.dataset.file) { openFile(row.dataset.file); return; }
    const r = S.results[+row.dataset.i];
    if (r) { S.sel = +row.dataset.i; openFile(r.f.p, { line: r.hit?.line || r.line }); }
  });
  $('tree').addEventListener('keydown', e => {
    const rows = [...$('tree').querySelectorAll('.row,.res')], i = rows.indexOf(document.activeElement);
    if (i < 0) return;
    const row = rows[i], go = j => { const r = rows[Math.max(0, Math.min(rows.length - 1, j))]; rows.forEach(x => x.tabIndex = -1); r.tabIndex = 0; r.focus(); };
    if (e.key === 'ArrowDown') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (i === 0) $('q').focus(); else go(i - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
    else if (e.key === 'ArrowRight' && row.dataset.dir) { e.preventDefault(); toggleDir(row.dataset.dir, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (row.dataset.dir && S.open.has(row.dataset.dir)) toggleDir(row.dataset.dir, false); else { const up = dirOf(row.dataset.dir || row.dataset.file || ''); if (up) { const r = rows.find(x => x.dataset.dir === up); if (r) go(rows.indexOf(r)); } } }
  });
  $('q').addEventListener('input', onQuery);
  $('q').addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); if ($('q').value) { $('q').value = ''; onQuery(); } else $('q').blur(); return; }
    if (!S.q) { if (e.key === 'ArrowDown') { e.preventDefault(); const r = $('tree').querySelector('.row[tabindex="0"]') || $('tree').querySelector('.row'); r?.focus(); } return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!S.results.length) return; S.sel = (S.sel + (e.key === 'ArrowDown' ? 1 : -1) + S.results.length) % S.results.length; paintResults(); }
    if (e.key === 'Enter' && S.results[S.sel]) { e.preventDefault(); const r = S.results[S.sel]; openFile(r.f.p, { line: r.hit?.line || r.line }); }
  });
  $('filters').addEventListener('click', e => {
    const b = e.target.closest('button[data-value]'), field = b && b.parentElement.dataset.field; if (!field) return;
    S.filters[field] = b.getAttribute('aria-pressed') === 'true' ? '' : b.dataset.value;
    if (field === 'type') S.filters.statut = '';
    paintFilters(); paintSide();
  });
  $('edit').onclick = () => ecrire(true);
  /* Terminé saves, then goes back to reading; Annuler drops what was written since the last save */
  $('done').onclick = async () => { pullNow(); if (dirty() && !(await save())) return; ecrire(false); };
  $('cancel').onclick = async () => {
    pullNow();
    if (dirty()) {
      const k = await ask('Annuler les modifications ?', 'Ce que tu as écrit depuis le dernier enregistrement sera perdu.', [['keep', 'Continuer à écrire'], ['drop', 'Annuler les modifications', 'primary']]);
      if (k !== 'drop') return;
      S.pvPending = false; S.pvTouched = true; setText(S.doc.saved);
    }
    ecrire(false);
  };
  $('clear').onclick = clearSearch;
  $('modes').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) setMode(b.dataset.mode); });
  $('save').onclick = () => save();
  $('crumbs').addEventListener('click', e => { const b = e.target.closest('[data-dir]'); if (b) revealDir(b.dataset.dir); });
  $('recent').addEventListener('click', e => { const b = e.target.closest('[data-file]'); if (b) openFile(b.dataset.file); });
  $('banner').addEventListener('click', async e => {
    if (e.target.closest('[data-act="take-disk"]')) {
      const k = await ask('Prendre la version du disque ?', 'Tes modifications non enregistrées seront perdues.', [['cancel', 'Annuler'], ['disk', 'Prendre la version du disque', 'primary']]);
      if (k === 'disk') openFile(S.doc.path, { reload: true });
    }
  });
  const fullPath = () => { const root = S.root || ''; return root ? root.replace(/[\\/]+$/, '') + '/' + S.doc.path : S.doc.path; };
  $('copy-path').onclick = () => { if (!S.doc) return; const p = fullPath(); navigator.clipboard?.writeText(p).then(() => toast('Chemin copié : ' + S.doc.path), () => toast(p)); };
  async function openOnDevice() {
    if (!S.doc) return;
    const r = await post('/api/open', { path: S.doc.path });
    toast(r.error ? 'Impossible de l’ouvrir : ' + r.error : 'Ouvert sur l’ordinateur', r.error ? 'bad' : '');
  }
  $('open-device').onclick = async () => {
    if (!S.doc) return;
    const r = await post('/api/open', { path: S.doc.path, reveal: true });
    toast(r.error ? 'Impossible de le montrer : ' + r.error : 'Montré dans le Finder', r.error ? 'bad' : '');
  };
  pv.addEventListener('click', e => { if (e.target.closest('[data-act="device"]')) openOnDevice(); });
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && !e.altKey && k === 's') { e.preventDefault(); save(); return; }
    if (!$('modal').hidden) return;
    const typing = e.target.matches?.('input,textarea,select,[contenteditable]');
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); openSide(); $('q').focus(); $('q').select(); return; }
    if (e.key === 'Escape' && !typing) { if (document.body.classList.contains('side-open')) { closeSide(); return; } if (embedded) parent.postMessage({ type: 'files-copy-back' }, '*'); }
  });

  /* ---------------------------- the list's width, and the list on a phone ---------------------------- */
  const side = $('side');
  const setWidth = w => { w = Math.max(220, Math.min(560, Math.round(w))); document.documentElement.style.setProperty('--side', w + 'px'); return w; };
  setWidth(store.get('width', 300));
  $('resizer').addEventListener('pointerdown', e => {
    e.preventDefault(); const start = e.clientX, w0 = side.getBoundingClientRect().width; $('resizer').setPointerCapture(e.pointerId); document.body.classList.add('resizing');
    const move = ev => setWidth(w0 + ev.clientX - start);
    const up = ev => { $('resizer').removeEventListener('pointermove', move); $('resizer').removeEventListener('pointerup', up); document.body.classList.remove('resizing'); store.set('width', setWidth(w0 + ev.clientX - start)); };
    $('resizer').addEventListener('pointermove', move); $('resizer').addEventListener('pointerup', up);
  });
  $('resizer').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); store.set('width', setWidth(side.getBoundingClientRect().width + (e.key === 'ArrowLeft' ? -20 : 20))); } });
  const phone = () => matchMedia('(max-width: 820px)').matches;
  const openSide = () => { if (phone()) document.body.classList.add('side-open'); };
  const closeSide = () => document.body.classList.remove('side-open');
  const closeSideOnPhone = () => { if (phone()) closeSide(); };
  $('side-toggle').onclick = () => document.body.classList.toggle('side-open');
  $('main').addEventListener('pointerdown', e => { if (phone() && document.body.classList.contains('side-open') && !e.target.closest('#side-toggle')) closeSide(); });

  /* ---------------------------- the Second Brain shell ---------------------------- */
  addEventListener('message', e => {
    if (e.source !== parent || e.data?.type !== 'files-copy') return;
    const d = e.data;
    if (d.action === 'open' && d.path) openFile(String(d.path), { line: d.line });
    if (d.action === 'shown') { load(); checkDisk(); }
  });

  (async () => {
    await load();
    const want = new URLSearchParams(location.search).get('f') || (location.hash.length > 1 ? decodeURIComponent(location.hash.slice(1)) : '') || store.get('last', '');
    if (want && S.byPath.has(want) && !S.doc) openFile(want);
    if (embedded) parent.postMessage({ type: 'files-copy-ready' }, '*');
  })();
})();

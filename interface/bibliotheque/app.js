/* SM4RT asset library: the Second Brain's Bibliothèque tab, or /bibliotheque/ on its own.
   Every image, SVG, font and PDF of the workspace (archives aside), folder by folder with the domains first,
   each with its line from the _images.md of its folder. Read only: look, copy the path, download, open on the
   computer; the _images.md opens in the Fichiers tab. The list comes from /local/assets, a file from /local/files/raw. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  document.body.classList.toggle('embedded', embedded);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fold = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const baseName = p => p.split('/').pop();
  const dirOf = p => p.split('/').slice(0, -1).join('/');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-bibliotheque:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-bibliotheque:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  /* the top folders: the domains first, then the libraries, then the rest (the same order as the Fichiers tab) */
  const ORDER = ['domaines', 'bibliotheques', 'projets', 'processus', 'inbox', 'outbox', 'journal', 'savoir', 'memory', 'skills', 'routers', 'vues', 'systeme', 'docs'];
  const KINDS = [['', 'Tout'], ['image', 'Images'], ['svg', 'SVG'], ['font', 'Polices'], ['pdf', 'PDF']];
  const KIND_LABEL = { image: 'Image', svg: 'SVG', font: 'Police', pdf: 'PDF' };
  const PDF_ICON = '<svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14.5 2.5V7H19"/></svg>';

  const S = {
    assets: [], root: '', indexes: new Set(), sig: '', shown: [],
    q: '', kind: store.get('kind', ''), folder: store.get('folder', ''), undescribed: false,
    blobs: new Map(), fonts: new Map(), at: -1
  };

  /* ---------------------------- server ---------------------------- */
  async function api(url) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      let d = {}; try { d = await r.json(); } catch (_) { d = { error: 'Réponse illisible du serveur (' + r.status + ')' }; }
      return { status: r.status, ...d };
    } catch (e) { return { status: 0, error: 'L’OS ne répond pas. Tourne-t-il (node server.js) ?' }; }
  }
  const rawUrl = p => '/local/files/raw?path=' + encodeURIComponent(p);
  /* a file comes as a blob: the page can then send the token, and the same file is fetched only once */
  async function blobOf(a) {
    const hit = S.blobs.get(a.p);
    if (hit && hit.m === a.m) return hit.blob;
    const r = await fetch(rawUrl(a.p), { cache: 'no-store' });
    if (!r.ok) { let m = ''; try { m = (await r.json()).error; } catch (_) { } throw new Error(m || 'Erreur ' + r.status); }
    const blob = await r.blob();
    if (hit) URL.revokeObjectURL(hit.url);
    S.blobs.set(a.p, { m: a.m, blob, url: URL.createObjectURL(blob) });
    return blob;
  }
  const urlOf = async a => { await blobOf(a); return S.blobs.get(a.p).url; };
  async function fontOf(a) {
    const hit = S.fonts.get(a.p);
    if (hit && hit.m === a.m) return hit.family;
    const family = 'asset-' + (S.fonts.size + 1) + '-' + a.m;
    const face = new FontFace(family, await (await blobOf(a)).arrayBuffer());
    await face.load(); document.fonts.add(face);
    S.fonts.set(a.p, { m: a.m, family });
    return family;
  }

  /* ---------------------------- small pieces ---------------------------- */
  function toast(text, kind = '') {
    const t = $('toast'); t.textContent = text; t.className = 'on ' + kind;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.className = kind, kind === 'bad' ? 6000 : 2800);
  }
  /* a line of _images.md may hold `code`: shown as code, the rest stays plain text */
  const rich = t => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>');
  const weight = n => n < 1024 ? n + ' o' : n < 1048576 ? Math.round(n / 1024) + ' Ko' : (n / 1048576).toFixed(1).replace('.', ',') + ' Mo';
  const day = ms => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  /* a folder's place in the select: domaines/<domain>, or its top folder */
  const folderOf = p => { const parts = p.split('/'); return parts[0] === 'domaines' && parts.length > 2 ? parts.slice(0, 2).join('/') : parts.length > 1 ? parts[0] : '(racine)'; };
  const rank = p => { const top = p.split('/')[0], i = ORDER.indexOf(top); return i < 0 ? ORDER.length : i; };
  const byFolder = (a, b) => rank(a) - rank(b) || a.localeCompare(b, 'fr');
  function mark(text, words) {
    let html = esc(text);
    if (!words.length) return html;
    const plain = fold(text);
    const spans = [];
    for (const w of words) for (let i = plain.indexOf(w); i >= 0; i = plain.indexOf(w, i + w.length)) spans.push([i, i + w.length]);
    if (!spans.length) return html;
    spans.sort((x, y) => x[0] - y[0]);
    let out = '', at = 0;
    for (const [s, e] of spans) { if (s < at) continue; out += esc(text.slice(at, s)) + '<mark>' + esc(text.slice(s, e)) + '</mark>'; at = e; }
    return out + esc(text.slice(at));
  }

  /* ---------------------------- the list ---------------------------- */
  async function load() {
    const r = await api('/local/assets');
    if (r.error) { $('grid').innerHTML = `<div class="empty"><div><h1>La bibliothèque ne se charge pas</h1><p>${esc(r.error)}</p></div></div>`; return; }
    const sig = r.assets.map(a => a.p + a.m + (a.d || '') + (a.o || '') + (a.u || '')).join('|');
    S.root = r.root || ''; S.indexes = new Set(r.indexes || []);
    if (sig === S.sig) return;
    S.sig = sig;
    S.assets = r.assets.sort((a, b) => byFolder(dirOf(a.p), dirOf(b.p)) || a.p.localeCompare(b.p, 'fr'));
    controls(); render();
  }
  function controls() {
    const count = k => S.assets.filter(a => !k || a.k === k).length;
    $('kinds').innerHTML = KINDS.map(([k, label]) => `<button type="button" data-kind="${k}" aria-pressed="${S.kind === k}"${k && !count(k) && S.kind !== k ? ' disabled' : ''}>${label}<span class="n">${count(k)}</span></button>`).join('');
    const folders = [...new Set(S.assets.map(a => folderOf(a.p)))].sort(byFolder);
    if (S.folder && !folders.includes(S.folder)) S.folder = '';
    $('folder').innerHTML = '<option value="">Tous les dossiers</option>' + folders.map(f => `<option value="${esc(f)}"${f === S.folder ? ' selected' : ''}>${esc(f.replace(/^domaines\//, 'Domaine · '))}</option>`).join('');
    $('folder').classList.toggle('on', !!S.folder);
    const none = S.assets.filter(a => !a.d).length;
    $('undescribed').hidden = !none && !S.undescribed;
    $('undescribed').innerHTML = `Sans description<span class="n" style="margin-left:6px;color:var(--faint)">${none}</span>`;
    $('undescribed').setAttribute('aria-pressed', S.undescribed);
  }
  function filtered() {
    const words = fold(S.q).split(/\s+/).filter(Boolean);
    return S.assets.filter(a => {
      if (S.kind && a.k !== S.kind) return false;
      if (S.folder && folderOf(a.p) !== S.folder) return false;
      if (S.undescribed && a.d) return false;
      if (!words.length) return true;
      const hay = fold([a.p, a.d, a.o, a.u].join(' '));
      return words.every(w => hay.includes(w));
    });
  }
  function render() {
    const words = fold(S.q).split(/\s+/).filter(Boolean), list = filtered();
    S.shown = list;
    $('count').textContent = list.length === S.assets.length ? list.length + ' assets' : list.length + ' sur ' + S.assets.length;
    if (!S.assets.length) { $('grid').innerHTML = '<div class="empty"><div><h1>Aucun asset pour l’instant</h1><p>Les images, les polices et les PDF du workspace s’afficheront ici.</p></div></div>'; return; }
    if (!list.length) { $('grid').innerHTML = '<div class="empty"><div><h1>Rien ne correspond</h1><p>Change la recherche ou les filtres.</p></div></div>'; return; }
    const groups = new Map();
    list.forEach((a, i) => { const d = dirOf(a.p); if (!groups.has(d)) groups.set(d, []); groups.get(d).push([a, i]); });
    let html = '';
    for (const [dir, items] of groups) {
      const parts = dir ? dir.split('/') : ['(racine)'], dom = parts[0] === 'domaines' && parts[1] ? parts[1] : parts[0];
      const rest = (parts[0] === 'domaines' ? parts.slice(2) : parts.slice(1)).join(' / ');
      html += `<section class="group"><h3><span class="dom">${esc(dom)}</span><span>${esc(rest)}</span><span class="ct">${items.length}</span></h3><div class="tiles">`;
      for (const [a, i] of items) {
        const desc = a.d ? `<span class="ds">${mark(a.d, words)}</span>` : '<span class="ds none">Pas encore décrit dans _images.md</span>';
        html += `<button type="button" class="card" data-i="${i}" title="${esc(a.p)}"><div class="thumb ${a.k} wait" data-i="${i}"><span class="tag">${esc(a.p.split('.').pop())}</span>${a.d ? '' : '<span class="nodesc" title="Pas encore décrit"></span>'}</div><div class="cap"><span class="nm">${mark(baseName(a.p), words)}</span>${desc}</div></button>`;
      }
      html += '</div></section>';
    }
    $('grid').innerHTML = html;
    $('grid').scrollTop = 0;
    $('grid').querySelectorAll('.thumb').forEach(t => seen.observe(t));
  }

  /* ---------------------------- thumbnails, a few at a time, as they scroll into view ---------------------------- */
  const queue = []; let running = 0;
  const seen = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { seen.unobserve(e.target); queue.push(e.target); }
    pump();
  }, { root: $('grid'), rootMargin: '300px' });
  function pump() {
    while (running < 6 && queue.length) {
      const el = queue.shift(), a = S.shown[+el.dataset.i];
      if (!a || !el.isConnected) continue;
      running++;
      fill(el, a).finally(() => { running--; pump(); });
    }
  }
  async function fill(el, a) {
    try {
      if (a.k === 'image' || a.k === 'svg') {
        const img = new Image(); img.alt = ''; img.decoding = 'async'; img.src = await urlOf(a);
        await img.decode().catch(() => { });
        el.prepend(img);
      } else if (a.k === 'font') {
        const fam = await fontOf(a);
        el.insertAdjacentHTML('afterbegin', `<span class="aa" style="font-family:'${fam}'">Aa</span>`);
      } else el.insertAdjacentHTML('afterbegin', `<span class="doc">${PDF_ICON}PDF</span>`);
    } catch (e) { el.insertAdjacentHTML('afterbegin', `<span class="bad">${esc(e.message)}</span>`); }
    el.classList.remove('wait');
  }

  /* ---------------------------- the viewer ---------------------------- */
  async function show(i) {
    const a = S.shown[i]; if (!a) return;
    S.at = i;
    const v = $('viewer'), wasHidden = v.hidden;
    v.hidden = false;
    $('v-dir').textContent = dirOf(a.p) || '(racine)';
    $('v-name').textContent = baseName(a.p);
    $('v-pos').textContent = (i + 1) + ' / ' + S.shown.length;
    $('v-prev').disabled = i === 0; $('v-next').disabled = i === S.shown.length - 1;
    const idx = (dirOf(a.p) ? dirOf(a.p) + '/' : '') + '_images.md';
    $('v-index').textContent = S.indexes.has(idx) ? 'Voir _images.md dans Fichiers' : 'Pas de _images.md dans ce dossier';
    $('v-index').disabled = !S.indexes.has(idx); $('v-index').dataset.path = idx;
    const row = (dt, dd, cls = '') => `<div><dt>${dt}</dt><dd class="${cls}">${dd}</dd></div>`;
    const meta = () => {
      let html = a.d ? row(a.k === 'font' ? 'Ce que c’est' : 'Ce qu’elle montre', rich(a.d)) : row('Description', 'Pas encore de ligne dans le _images.md de ce dossier.', 'none');
      if (a.o) html += row('Origine', rich(a.o));
      if (a.u) html += row('Sert à', rich(a.u));
      html += row('Fichier', `${KIND_LABEL[a.k]} · ${weight(a.s)}<span id="v-dim"></span> · modifié le ${day(a.m)}`);
      html += row('Chemin', `<code>${esc(a.p)}</code>`);
      return html;
    };
    $('v-meta').innerHTML = meta();
    const stage = $('v-stage');
    stage.className = a.k; stage.innerHTML = '';
    if (wasHidden) $('v-close').focus();
    try {
      if (a.k === 'image' || a.k === 'svg') {
        const img = new Image(); img.alt = a.d || baseName(a.p); img.src = await urlOf(a);
        await img.decode().catch(() => { });
        if (S.at !== i) return;
        stage.append(img);
        if (img.naturalWidth && $('v-dim')) $('v-dim').textContent = ` · ${img.naturalWidth} × ${img.naturalHeight} px`;
      } else if (a.k === 'font') {
        const fam = await fontOf(a);
        if (S.at !== i) return;
        stage.innerHTML = `<div class="specimen" style="font-family:'${fam}'"><div class="l1">Aa Bb Cc 0123</div><div class="l2">Le Club SMART t’aide à gagner du temps avec l’IA.</div><div class="l3">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>àâçéèêëîïôûùü 0123456789 ?!.,;:«»€$%&amp;@</div><div class="l4">Portez ce vieux whisky au juge blond qui fume, sur son île intérieure, à côté de l’alcôve ovoïde.</div></div>`;
      } else stage.innerHTML = `<div class="pdf-box">${PDF_ICON}<p>L’aperçu des PDF n’est pas encore là.<br>Ouvre-le sur l’ordinateur ou télécharge-le.</p></div>`;
    } catch (e) { if (S.at === i) stage.innerHTML = `<div class="pdf-box"><p>${esc(e.message)}</p></div>`; }
  }
  function hide() {
    $('viewer').hidden = true;
    const card = $('grid').querySelector(`.card[data-i="${S.at}"]`); card?.focus({ preventScroll: true });
    S.at = -1;
  }
  const current = () => S.shown[S.at];
  const fullPath = p => S.root ? S.root.replace(/[\\/]+$/, '') + '/' + p : p;
  $('v-copy').onclick = () => { const a = current(); if (!a) return; const p = fullPath(a.p); navigator.clipboard?.writeText(p).then(() => toast('Chemin copié : ' + a.p), () => toast(p)); };
  $('v-download').onclick = async () => {
    const a = current(); if (!a) return;
    try { await blobOf(a); const l = document.createElement('a'); l.href = S.blobs.get(a.p).url; l.download = baseName(a.p); document.body.append(l); l.click(); l.remove(); }
    catch (e) { toast('Téléchargement impossible : ' + e.message, 'bad'); }
  };
  $('v-open').onclick = async () => {
    const a = current(); if (!a) return;
    let r; try { r = await (await fetch('/api/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: a.p }) })).json(); } catch (e) { r = { error: 'L’OS ne répond pas' }; }
    toast(r.error ? 'Impossible de l’ouvrir : ' + r.error : 'Ouvert sur l’ordinateur', r.error ? 'bad' : '');
  };
  $('v-index').onclick = () => {
    const p = $('v-index').dataset.path;
    if (embedded) { hide(); parent.postMessage({ type: 'assets-copy-edit', path: p }, '*'); }
    else location.href = '/fichiers/?f=' + encodeURIComponent(p);
  };
  $('v-close').onclick = hide;
  $('v-prev').onclick = () => show(S.at - 1);
  $('v-next').onclick = () => show(S.at + 1);
  $('viewer').addEventListener('pointerdown', e => { if (e.target === $('viewer')) hide(); });

  /* ---------------------------- the bar ---------------------------- */
  $('grid').addEventListener('click', e => { const c = e.target.closest('.card'); if (c) show(+c.dataset.i); });
  $('kinds').addEventListener('click', e => { const b = e.target.closest('[data-kind]'); if (!b) return; S.kind = b.dataset.kind; store.set('kind', S.kind); controls(); render(); });
  $('folder').onchange = e => { S.folder = e.target.value; store.set('folder', S.folder); controls(); render(); };
  $('undescribed').onclick = () => { S.undescribed = !S.undescribed; controls(); render(); };
  let typing; $('q').oninput = e => { clearTimeout(typing); typing = setTimeout(() => { S.q = e.target.value.trim(); render(); }, 120); };
  const setSize = px => { document.documentElement.style.setProperty('--tile', px + 'px'); $('size').value = px; };
  setSize(store.get('size', 180));
  $('size').oninput = e => { setSize(+e.target.value); store.set('size', +e.target.value); };
  addEventListener('keydown', e => {
    const inField = e.target.matches?.('input,textarea,select');
    if (!$('viewer').hidden) {
      if (e.key === 'Escape') { e.preventDefault(); hide(); }
      if (e.key === 'ArrowLeft' && S.at > 0) show(S.at - 1);
      if (e.key === 'ArrowRight' && S.at < S.shown.length - 1) show(S.at + 1);
      return;
    }
    if (e.key === '/' && !inField && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); $('q').focus(); $('q').select(); return; }
    if (e.key === 'Escape' && !inField && embedded) parent.postMessage({ type: 'assets-copy-back' }, '*');
  });

  /* ---------------------------- the Second Brain shell ---------------------------- */
  addEventListener('message', e => {
    if (e.source !== parent || e.data?.type !== 'assets-copy') return;
    if (e.data.action === 'shown') load();
  });

  (async () => {
    await load();
    if (embedded) parent.postMessage({ type: 'assets-copy-ready' }, '*');
  })();
})();

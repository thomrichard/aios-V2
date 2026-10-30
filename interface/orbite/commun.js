/* SM4RT: what the Orbes 3D and the Disque share. Small helpers, the server call, the toast, and the side panel's
   pieces: a list row, a header with its chips, and a file read from /local/orbite/fichier (its start rendered, its
   links, its buttons). Each page calls SM4RTCommun with the prefix of its messages to the shell ("orbite", "disque"). */
window.SM4RTCommun = (prefixe) => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-' + prefixe + ':' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-' + prefixe + ':' + k, JSON.stringify(v)); } catch (_) { } }
  };
  async function api(url, opts) {
    try {
      const r = await fetch(url, { cache: 'no-store', ...opts });
      let d = {}; try { d = await r.json(); } catch (_) { d = { error: 'Réponse illisible du serveur (' + r.status + ')' }; }
      return { status: r.status, ...d };
    } catch (e) { return { status: 0, error: 'L’OS ne répond pas. Tourne-t-il (node server.js) ?' }; }
  }
  function toast(text, kind = '') {
    const t = $('toast'); t.textContent = text; t.className = 'on ' + kind;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.className = kind, kind === 'mal' ? 6000 : 2800);
  }
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const rgb = hex => { const h = String(hex).replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','); };
  const rgba = (hex, a) => 'rgba(' + rgb(hex) + ',' + a + ')';
  const fmtN = n => n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + ' k' : String(n);
  const pluriel = (n, un, plusieurs) => n + ' ' + (n > 1 ? plusieurs : un);
  const nbFichiers = n => fmtN(n) + (n > 1 ? ' fichiers' : ' fichier');
  const taille = o => o < 1024 ? o + ' o' : o < 1048576 ? Math.round(o / 1024) + ' ko' : (o / 1048576).toFixed(1).replace('.', ',') + ' Mo';
  function depuis(ms) {
    const j = Math.floor((Date.now() - ms) / 864e5);
    return j <= 0 ? 'aujourd’hui' : j === 1 ? 'hier' : 'il y a ' + j + ' j';
  }
  const dirOf = p => p.split('/').slice(0, -1).join('/');
  const borne = (v, a, b) => Math.max(a, Math.min(b, v));
  function ouvrirFichier(chemin) {
    if (!chemin) return;
    if (embedded) parent.postMessage({ type: prefixe + '-copy-edit', path: chemin }, '*');
    else window.open('/fichiers/?f=' + enc(chemin), '_blank', 'noopener');
  }
  async function finder(chemin) {
    const r = await api('/api/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: chemin, reveal: true }) });
    toast(r.error ? r.error : 'Montré dans le Finder : ' + chemin, r.error ? 'mal' : '');
  }

  /* the panel's pieces */
  const ligne = (o) => `<button type="button" class="p-ligne" ${o.attr || ''}${o.ici ? ' aria-current="true"' : ''}><i style="background:${o.couleur};box-shadow:0 0 8px ${o.couleur}"></i><span><b>${esc(o.nom)}</b>${o.sous ? `<small>${esc(o.sous)}</small>` : ''}</span>${o.n ? `<em>${esc(o.n)}</em>` : ''}<span class="fl" aria-hidden="true" style="flex:0 0 auto">›</span></button>`;
  const tete = (chemin, titre, puces) => `<div class="p-tete"><div><span class="p-chemin">${esc(chemin)}</span><h2 class="p-titre">${esc(titre)}</h2></div><button type="button" class="btn petit" data-grand>${document.body.classList.contains('grand') ? '⤡ Réduire' : '⤢ Agrandir'}</button></div><div class="p-puces">${puces.map(p => `<span class="pastille">${p.c ? `<i style="background:${p.c}"></i>` : ''}${esc(p.t)}</span>`).join('')}</div>`;
  const fiche = chemin => api('/local/orbite/fichier?chemin=' + enc(chemin));
  const blobs = new Map();
  async function image(chemin) {
    if (blobs.has(chemin)) return blobs.get(chemin);
    try { const r = await fetch('/local/files/raw?path=' + enc(chemin), { cache: 'no-store' }); if (!r.ok) return ''; const u = URL.createObjectURL(await r.blob()); blobs.set(chemin, u); return u; } catch (_) { return ''; }
  }
  /* a file in the panel: its path, title, chips, summary, start rendered, links, and what to do with it */
  async function dessineFiche(p, f, couleur, retour) {
    const h = f.entete || {};
    const puces = [h.type ? { t: h.type, c: couleur } : { t: f.kind === 'image' ? 'image' : 'fichier', c: couleur }].concat(h.statut ? [{ t: h.statut }] : []).concat([{ t: taille(f.taille) + ' · ' + depuis(f.m) }]);
    /* raw HTML in a file is shown as text, never run */
    const md = String(f.extrait || '').replace(/</g, '&lt;');
    const lecture = f.kind === 'image' ? `<img class="p-image" alt="${esc(f.titre)}" data-image="${esc(f.chemin)}">` : f.kind === 'md' || f.kind === 'text' ? `<div class="p-lecture">${window.marked ? marked.parse(md) : '<pre>' + esc(f.extrait) + '</pre>'}${f.coupe ? '<p><em>… la suite dans Fichiers</em></p>' : ''}</div>` : '<p class="p-resume">Pas d’aperçu pour ce type de fichier.</p>';
    const liens = (f.sortants.length || f.entrants.length) ? `<div class="p-liens"><span class="etiquette">Liens · ${f.sortants.length + f.entrants.length}</span>${f.sortants.length ? `<div>${f.sortants.map(x => `<button type="button" class="p-lien${x.existe ? '' : ' absent'}" ${x.existe ? `data-lien="${esc(x.chemin)}"` : 'disabled'} title="${esc(x.chemin)}">→ ${esc(x.texte)}</button>`).join('')}</div>` : ''}${f.entrants.length ? `<div>${f.entrants.map(x => `<button type="button" class="p-lien" data-lien="${esc(x.chemin)}" title="${esc(x.texte)}">← ${esc(x.chemin.split('/').pop())}</button>`).join('')}</div>` : ''}</div>` : '';
    p.innerHTML = tete(f.chemin, f.titre, puces)
      + (h.resume ? `<p class="p-resume">${esc(h.resume)}</p>` : '') + lecture + liens
      + `<div class="p-actions"><button type="button" class="btn primaire" data-edit="${esc(f.chemin)}">Ouvrir dans Fichiers</button><button type="button" class="btn" data-finder="${esc(f.chemin)}">Ouvrir dans le Finder</button><button type="button" class="btn discret" data-liste>${esc(retour || '← La liste du dossier')}</button></div>`;
    const img = p.querySelector('[data-image]'); if (img) img.src = await image(f.chemin);
  }
  /* the page's Apparence panel (night, day, colour), opened by the menu's Réglages */
  function apparence() {
    const r = $('reglages'), b = $('btn-reglages'); if (!r || !b) return;
    const marque = () => {
      const a = window.Apparence ? Apparence.get() : { mode: 'nuit', couleur: 'turquoise' };
      r.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x.dataset.mode === a.mode));
      r.querySelectorAll('[data-couleur]').forEach(x => x.setAttribute('aria-pressed', x.dataset.couleur === a.couleur));
    };
    const ferme = () => { r.hidden = true; b.setAttribute('aria-expanded', false); };
    b.onclick = () => { r.hidden = !r.hidden; b.setAttribute('aria-expanded', !r.hidden); marque(); };
    r.addEventListener('click', e => {
      const x = e.target.closest('button'); if (!x || !window.Apparence) return;
      if (x.dataset.mode) Apparence.set({ mode: x.dataset.mode }); if (x.dataset.couleur) Apparence.set({ couleur: x.dataset.couleur });
      marque();
    });
    addEventListener('storage', e => { if (e.key === 'sm4rt-apparence') marque(); });
    addEventListener('pointerdown', e => { if (!r.hidden && !e.target.closest('#reglages,#btn-reglages,#menu-reglages')) ferme(); });
    /* Escape closes the panel first, before the page goes up a level */
    addEventListener('keydown', e => { if (e.key === 'Escape' && !r.hidden) { ferme(); e.stopImmediatePropagation(); } }, true);
  }
  /* the switch between the brain's two views; the folder you are on goes along */
  function bascule(ici, place) {
    const g = $('bascule'); if (!g) return;
    g.querySelectorAll('[data-vue]').forEach(x => x.setAttribute('aria-pressed', x.dataset.vue === ici));
    g.addEventListener('click', e => {
      const x = e.target.closest('[data-vue]'); if (!x || x.dataset.vue === ici) return;
      const p = place(), v = x.dataset.vue;
      if (embedded) parent.postMessage({ type: 'sm4rt-menu', vue: v, chemin: p.chemin || '', fichiers: !!p.fichiers }, '*');
      else location.href = '/' + v + '/' + (p.chemin ? '#' + v + '/' + p.chemin.split('/').map(enc).join('/') + (p.fichiers ? '?fichiers' : '') : '');
    });
  }
  return { $, embedded, esc, enc, store, api, toast, el, rgb, rgba, fmtN, pluriel, nbFichiers, taille, depuis, dirOf, borne, ouvrirFichier, finder, ligne, tete, fiche, dessineFiche, apparence, bascule };
};

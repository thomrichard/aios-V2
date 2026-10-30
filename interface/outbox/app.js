/* SM4RT Outbox: the Second Brain's Outbox tab, or /outbox/ on its own.
   What waits for your validation, at this very moment: every file whose header says statut: a-valider (the report of
   a /bilan, a deliverable, a meeting report), newest first. No content: its title, what it is, since when, and how to
   reach it. « Montrer dans le Finder » selects the file itself (the PDF, the picture, the video a fiche describes);
   « Valider » gives it its type's end status through /local/outbox/valider: nothing moves. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const GLYPHES = { pdf: 'PDF', image: 'IMG', video: 'VID', son: 'SON', page: '</>', tableur: 'TAB', document: 'DOC', texte: 'MD' };
  const S = { d: null };

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
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.className = kind, kind === 'mal' ? 6000 : 2800);
  }
  const pluriel = (n, un, plusieurs) => n + ' ' + (n > 1 ? plusieurs : un);
  const fmtTaille = n => n < 1024 ? n + ' o' : n < 1048576 ? Math.round(n / 1024) + ' ko' : (n / 1048576).toFixed(1).replace('.', ',') + ' Mo';
  const dateDe = key => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
  const jours = e => Math.max(0, Math.round((dateDe(S.d.aujourdhui) - dateDe(e.depuis)) / 864e5));
  const depuis = e => { const j = jours(e); return j === 0 ? 'aujourd’hui' : j === 1 ? 'depuis hier' : 'depuis ' + j + ' jours'; };
  function ouvrirFichier(chemin) {
    if (!chemin) return;
    if (embedded) parent.postMessage({ type: 'outbox-copy-edit', path: chemin }, '*');
    else window.open('/fichiers/?f=' + enc(chemin), '_blank', 'noopener');
  }
  function ouvrirProjet(chemin) {
    if (!chemin) return;
    if (embedded) parent.postMessage({ type: 'outbox-copy-project', path: chemin }, '*');
    else location.href = '/projets/#' + enc(chemin);
  }

  /* ---------------------------- the data ---------------------------- */
  async function charge() {
    const r = await api('/local/outbox');
    if (r.error) { montreVide('L’outbox ne se charge pas', esc(r.error)); return false; }
    S.d = r;
    return true;
  }
  function montreVide(titre, html) {
    $('liste').hidden = true; $('vide').hidden = false; $('tout').hidden = true;
    $('vide-titre').textContent = titre; $('vide-texte').innerHTML = html;
  }

  /* ---------------------------- the page ---------------------------- */
  function dessine() {
    const d = S.d, n = d.entrees.length, q = d.questions || 0;
    dispatchEvent(new CustomEvent('sm4rt:outbox', { detail: n }));
    $('sous').textContent = n ? pluriel(n, 'fichier attend', 'fichiers attendent') + ' ta validation. Valider le passe à « clos » : il reste où il est.' : 'Rien n’attend ta validation.';
    $('questions').hidden = !q;
    if (q) $('questions').innerHTML = `<b>${q}</b>${q > 1 ? 'questions du rangement t’attendent' : 'question du rangement t’attend'}<span class="fleche" aria-hidden="true">→</span>`;
    if (!n) {
      montreVide('Rien à valider', 'Un fichier arrive ici quand son en-tête dit <code>statut: a-valider</code> : le bilan d’un <code>/bilan</code>, un livrable, un compte-rendu.');
      return;
    }
    $('vide').hidden = true; $('liste').hidden = false; $('tout').hidden = n < 2;
    $('liste').innerHTML = d.entrees.map(ligne).join('');
  }
  function ligne(e) {
    const c = e.cible, projet = e.projet ? S.d.projets[e.projet] : null;
    const dossier = e.p.includes('/') ? e.p.slice(0, e.p.lastIndexOf('/') + 1) : '';
    const quoi = c ? (c.lourd ? (c.sansDossier ? c.nom + ' · dossier des fichiers lourds non réglé' : c.absent ? c.nom + ' · introuvable dans les fichiers lourds' : c.nom + ' · ' + fmtTaille(c.taille) + ' · fichiers lourds') : c.nom + ' · ' + fmtTaille(c.taille))
      : e.p.split('/').pop();
    const finder = !(c && c.lourd && !c.abs);
    return `<li class="item" data-p="${esc(e.p)}">
      <span class="ico ${esc(e.sorte)}" aria-hidden="true">${esc(GLYPHES[e.sorte] || 'MD')}</span>
      <span class="textes">
        <span class="l1"><b class="titre">${esc(e.titre)}</b>${e.type ? `<span class="type">${esc(e.type)}</span>` : ''}${projet ? `<button type="button" class="projet" data-projet="${esc(projet.path)}" title="Ouvrir le projet">${esc(projet.titre)}</button>` : ''}</span>
        ${e.resume ? `<span class="resume">${esc(e.resume)}</span>` : ''}
        <span class="ou"><span>${esc(dossier)}</span>${esc(quoi)}</span>
      </span>
      <span class="quand${jours(e) >= 3 ? ' vieux' : ''}">${esc(depuis(e))}</span>
      <span class="gestes">
        <button type="button" class="btn petit" data-act="finder"${finder ? '' : ' disabled'} title="${esc(c ? 'Montre ' + c.nom + ' dans le Finder' : 'Montre la fiche dans le Finder')}">Montrer dans le Finder</button>
        <button type="button" class="btn petit discret" data-act="ouvrir" title="Lire la fiche dans Fichiers">Ouvrir</button>
        <button type="button" class="valider" data-act="valider" title="La passer à « clos » : elle sort de l’outbox et reste où elle est">✓ Valider</button>
      </span>
    </li>`;
  }

  /* ---------------------------- the gestures ---------------------------- */
  let occupe = false;
  async function valide(chemins) {
    if (occupe || !chemins.length) return;
    occupe = true;
    const r = await post('/local/outbox/valider', { chemins });
    occupe = false;
    if (r.error) { toast(r.error, 'mal'); return; }
    const faits = new Set(r.chemins || []);
    S.d.entrees = S.d.entrees.filter(e => !faits.has(e.p));
    dessine();
    toast(faits.size > 1 ? faits.size + ' fichiers validés' : faits.size ? 'Validé : ' + [...faits][0].split('/').pop() : 'Déjà validé ailleurs');
    frais = 0; rafraichit();
  }
  $('liste').addEventListener('click', async ev => {
    const pj = ev.target.closest('[data-projet]'); if (pj) { ouvrirProjet(pj.dataset.projet); return; }
    const b = ev.target.closest('[data-act]'), li = ev.target.closest('[data-p]'); if (!b || !li) return;
    const e = S.d.entrees.find(x => x.p === li.dataset.p); if (!e) return;
    if (b.dataset.act === 'valider') valide([e.p]);
    else if (b.dataset.act === 'ouvrir') ouvrirFichier(e.p);
    else if (b.dataset.act === 'finder') {
      const c = e.cible, r = await post('/api/open', c && c.abs ? { target: c.abs, reveal: true } : { path: c && c.chemin ? c.chemin : e.p, reveal: true });
      if (r.error) toast(r.error, 'mal');
    }
  });
  $('tout').onclick = () => valide(S.d.entrees.map(e => e.p));
  $('questions').onclick = () => ouvrirFichier('outbox/questions.md');

  /* ---------------------------- appearance, keys, refresh ---------------------------- */
  function marqueApparence() {
    const a = window.Apparence ? Apparence.get() : { mode: 'nuit', couleur: 'turquoise' };
    document.querySelectorAll('#reglages [data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === a.mode));
    document.querySelectorAll('#reglages [data-couleur]').forEach(b => b.setAttribute('aria-pressed', b.dataset.couleur === a.couleur));
  }
  const fermeReglages = () => { $('reglages').hidden = true; $('btn-reglages').setAttribute('aria-expanded', false); };
  $('btn-reglages').onclick = () => { const r = $('reglages'); r.hidden = !r.hidden; $('btn-reglages').setAttribute('aria-expanded', !r.hidden); marqueApparence(); };
  $('reglages').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !window.Apparence) return;
    if (b.dataset.mode) Apparence.set({ mode: b.dataset.mode }); if (b.dataset.couleur) Apparence.set({ couleur: b.dataset.couleur });
    marqueApparence();
  });
  addEventListener('storage', e => { if (e.key === 'sm4rt-apparence') marqueApparence(); });
  addEventListener('pointerdown', e => { if (!$('reglages').hidden && !e.target.closest('#reglages,#btn-reglages,#menu-reglages')) fermeReglages(); });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('reglages').hidden) return fermeReglages();
    if (embedded) parent.postMessage({ type: 'outbox-copy-back' }, '*');
  });
  if (embedded) $('retour').hidden = true;

  /* back on the tab, or on the window: the agent may have written meanwhile */
  let frais = 0;
  async function rafraichit() {
    if (Date.now() - frais < 4000 || !S.d) return;
    frais = Date.now();
    if (await charge()) dessine();
  }
  addEventListener('focus', rafraichit);
  addEventListener('message', e => { if (e.source === parent && e.data && e.data.type === 'outbox-copy' && e.data.action === 'shown') rafraichit(); });

  (async () => {
    frais = Date.now();
    if (await charge()) dessine();
    if (embedded) parent.postMessage({ type: 'outbox-copy-ready' }, '*');
  })();
})();

/* SM4RT Outbox: the Second Brain's Outbox tab, or /outbox/ on its own.
   What the agent wrote or changed, day by day (the last 7), where it is filed: nothing moves. Grouped by project or by
   discussion; each file has a ✓ that files it away (a line in outbox/ranges.md, through /local/outbox/ranger) and a ↺ that
   puts it back. On the right, the chosen file: its preview, where it comes from, and how to reach it. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-outbox:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-outbox:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  const GLYPHES = { texte: 'T', visuel: '◩', page: '</>', donnees: '#' };
  const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)$/i;
  const S = { d: null, jour: '', grp: store.get('grouper', 'projet') === 'discussion' ? 'discussion' : 'projet', vue: 'ranger', sel: '' };

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
  const pad = n => String(n).padStart(2, '0');
  const heure = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const dateDe = key => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const pluriel = (n, un, plusieurs) => n + ' ' + (n > 1 ? plusieurs : un);
  const fmtTaille = n => n < 1024 ? n + ' o' : n < 1048576 ? (n / 1024).toFixed(n < 10240 ? 1 : 0).replace('.', ',') + ' ko' : (n / 1048576).toFixed(1).replace('.', ',') + ' Mo';
  const nomDe = p => p.split('/').pop();
  const cleJour = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  function nomJour(key) {
    const t = dateDe(S.d.aujourdhui);
    if (key === S.d.aujourdhui) return 'Aujourd’hui';
    if (key === cleJour(new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1))) return 'Hier';
    return cap(dateDe(key).toLocaleDateString('fr-FR', { weekday: 'long' }));
  }
  const dateCourte = key => dateDe(key).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  const dateLongue = key => dateDe(key).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const cle = e => e.p + '|' + e.jour;
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
  const duJour = () => S.d.entrees.filter(e => e.jour === S.jour);
  const joursAvecFichiers = () => S.d.jours.filter(j => S.d.entrees.some(e => e.jour === j));
  async function charge() {
    const r = await api('/local/outbox');
    if (r.error) { montreVide('L’outbox ne se charge pas', esc(r.error)); return false; }
    S.d = r;
    const jours = joursAvecFichiers();
    if (!jours.includes(S.jour)) S.jour = jours[0] || '';
    return true;
  }
  function montreVide(titre, html) {
    $('page').hidden = true; $('vide').hidden = false; $('avis').hidden = true;
    $('vide-titre').textContent = titre; $('vide-texte').innerHTML = html;
    $('sous').textContent = '';
  }

  /* ---------------------------- the page ---------------------------- */
  function dessine() {
    const d = S.d;
    $('ici').textContent = S.grp === 'projet' ? 'par projet' : 'par discussion';
    dessineAvis();
    if (!d.entrees.length) {
      const ok = d.journaux.etat === 'ok';
      const why = ok && d.git ? 'Aucun fichier écrit ou modifié ces 7 derniers jours, ni dans les journaux de session ni dans Git.'
        : ok ? 'Aucun fichier écrit ou modifié ces 7 derniers jours dans les journaux de session. Ce workspace n’est pas un dépôt Git : je ne peux rien y lire de plus.'
        : d.git ? 'Git ne voit aucun changement ces 7 derniers jours.' : 'Il n’y a rien à lire : pas de journaux de session, et ce workspace n’est pas un dépôt Git.';
      montreVide('Rien à ranger', esc(why));
      return;
    }
    $('vide').hidden = true; $('page').hidden = false;
    const du = duJour(), projets = new Set(du.map(e => d.fichiers[e.p].projet).filter(Boolean)), sess = new Set(du.map(e => e.s).filter(Boolean));
    $('sous').textContent = (S.jour === S.d.aujourdhui || nomJour(S.jour) === 'Hier' ? nomJour(S.jour) + ', ' + dateLongue(S.jour) : cap(dateLongue(S.jour))) + ' : ' + pluriel(du.length, 'fichier', 'fichiers') + ', ' + pluriel(projets.size, 'projet', 'projets') + ', ' + pluriel(sess.size, 'discussion', 'discussions') + '. Valide ce qui est fini : il sort d’ici et reste à sa place.';
    $('jours').innerHTML = joursAvecFichiers().map(j => {
      const n = d.entrees.filter(e => e.jour === j && !e.range).length;
      return `<button type="button" class="puce" data-jour="${j}" aria-pressed="${j === S.jour}">${esc(nomJour(j))}<span class="n">${esc(dateCourte(j))} · ${n} à ranger</span></button>`;
    }).join('');
    const nA = du.filter(e => !e.range).length;
    dispatchEvent(new CustomEvent('sm4rt:outbox', { detail: d.entrees.filter(e => !e.range).length }));
    document.querySelectorAll('#grouper button').forEach(b => b.setAttribute('aria-pressed', b.dataset.grp === S.grp));
    document.querySelectorAll('#vues button').forEach(b => { b.setAttribute('aria-pressed', b.dataset.vue === S.vue); b.textContent = (b.dataset.vue === 'ranger' ? 'À ranger · ' + nA : 'Rangés · ' + (du.length - nA)); });
    const x = choisi(); S.sel = x ? cle(x) : '';
    dessineGroupes(du);
    dessineDetail();
  }
  function dessineAvis() {
    const j = S.d.journaux, a = $('avis');
    let t = '';
    if (j.etat === 'eteint') t = 'Les journaux de session de Claude Code sont éteints (<code>readers.claudeCode</code> dans <code>os-config.json</code>) : je ne vois que ce que Git voit, sans titre de discussion.';
    else if (j.etat === 'absent') t = 'Je ne trouve pas de journaux de session de Claude Code sur cet ordinateur : je ne vois que ce que Git voit, sans titre de discussion.';
    a.hidden = !t; a.innerHTML = t;
  }
  function groupesDe(liste) {
    const d = S.d, par = new Map();
    for (const e of liste) {
      const k = S.grp === 'projet' ? d.fichiers[e.p].projet : e.s;
      if (!par.has(k)) par.set(k, []);
      par.get(k).push(e);
    }
    return [...par.entries()].map(([k, l]) => ({ k, l: l.sort((a, b) => b.t - a.t) })).sort((a, b) => b.l[0].t - a.l[0].t);
  }
  function dessineGroupes(du) {
    const d = S.d, liste = du.filter(e => S.vue === 'ranger' ? !e.range : e.range);
    if (!liste.length) {
      $('groupes').innerHTML = `<div class="rien">${S.vue === 'ranger' ? 'Tout est rangé pour ce jour. Rien ne traîne.' : 'Rien de rangé ce jour-là pour l’instant.'}</div>`;
      return;
    }
    $('groupes').innerHTML = groupesDe(liste).map((g, gi) => {
      const n = g.l.length, nb = pluriel(n, 'fichier', 'fichiers');
      const tout = S.vue === 'ranger' && n > 1 ? `<button type="button" class="g-tout" data-tout="${gi}" title="Range tous les fichiers de ce groupe">Tout valider</button>` : '';
      let tete;
      if (S.grp === 'projet') {
        const pr = g.k ? d.projets[g.k] : null;
        tete = `<span class="g-type${g.k ? '' : ' sans'}">${g.k ? 'projet' : 'sans projet'}</span><span class="g-titre">${esc(g.k ? pr.titre : 'Hors projet')}</span><span class="g-info">${nb}</span>`
          + (pr && pr.path ? `<button type="button" class="g-lien" data-projet="${esc(pr.path)}">Ouvrir le projet →</button>` : '') + tout;
      } else {
        const s = g.k ? d.sessions[g.k] : null;
        const projets = s ? g.l.map(e => d.fichiers[e.p].projet).filter(Boolean) : [], top = projets.sort((a, b) => projets.filter(x => x === b).length - projets.filter(x => x === a).length)[0];
        const quand = s ? heure(s.debut) + ' → ' + heure(s.fin) : '';
        tete = `<span class="g-type${s ? ' agent' : ' sans'}">${s ? 'discussion' : 'hors discussion'}</span><span class="g-titre">${esc(s ? s.titre : 'Hors discussion')}</span>`
          + (s ? s.skills.map(k => `<span class="g-puce">/${esc(k)}</span>`).join('') : '')
          + `<span class="g-info">${esc([quand, top ? d.projets[top].titre : '', nb].filter(Boolean).join(' · '))}</span>` + tout;
      }
      return `<section class="groupe" aria-label="${esc(S.grp === 'projet' ? (g.k ? d.projets[g.k].titre : 'Hors projet') : (g.k ? d.sessions[g.k].titre : 'Hors discussion'))}"><div class="g-tete">${tete}</div><div class="g-corps">${g.l.map(ligne).join('')}</div></section>`;
    }).join('');
    $('groupes')._groupes = groupesDe(liste);
  }
  function ligne(e) {
    const f = S.d.fichiers[e.p], s = e.s ? S.d.sessions[e.s] : null, actif = S.sel === cle(e);
    const sous = S.grp === 'projet' ? (s ? 'discussion « ' + s.titre + ' »' : 'hors discussion') : (f.dossier || 'racine du workspace');
    return `<div class="fichier" aria-current="${actif}">
      <button type="button" class="f-choix" data-choix="${esc(cle(e))}" aria-pressed="${actif}">
        <span class="f-icone ${f.genre}" aria-hidden="true">${esc(GLYPHES[f.genre])}</span>
        <span class="f-textes"><span class="f-nom">${esc(nomDe(e.p))}</span><span class="f-sous">${esc(sous)}</span></span>
        <span class="f-etat"><span class="etat ${e.etat}">${e.etat === 'nouveau' ? 'NOUVEAU' : 'MODIFIÉ'}</span><span class="f-heure">${heure(e.t)}</span></span>
      </button>
      <button type="button" class="f-range${e.range ? ' remet' : ''}" data-range="${esc(cle(e))}" title="${e.range ? 'Remettre dans l’outbox' : 'Valider : ranger ce fichier'}" aria-label="${e.range ? 'Remettre dans l’outbox' : 'Valider : ranger ce fichier'} : ${esc(nomDe(e.p))}">${e.range ? '↺' : '✓'}</button>
    </div>`;
  }

  /* ---------------------------- the chosen file ---------------------------- */
  const trouve = k => S.d.entrees.find(e => cle(e) === k);
  let blobs = new Map();
  function choisi() {
    return trouve(S.sel) || duJour().find(e => S.vue === 'ranger' ? !e.range : e.range) || duJour()[0] || null;
  }
  function dessineDetail() {
    const e = choisi(), box = $('detail');
    if (!e) { box.innerHTML = ''; return; }
    const f = S.d.fichiers[e.p], s = e.s ? S.d.sessions[e.s] : null, pr = f.projet ? S.d.projets[f.projet] : null;
    const dossier = f.dossier || 'la racine du workspace';
    let apercu;
    if (f.genre === 'visuel') apercu = `<div class="ap-visuel" id="ap-visuel">${IMAGE_EXT.test(e.p) ? 'Chargement de la vignette…' : esc((e.p.split('.').pop() || '').toUpperCase())}</div>`;
    else if (f.genre === 'page') apercu = `<div class="ap-page"><div class="ap-barre"><i></i><i></i><i></i><span class="ap-url">${esc('localhost/' + e.p)}</span></div><div class="ap-ecran"><b>${esc(f.titre)}</b><span class="blocs"><i></i><i></i><i></i><i></i></span><span class="ligne"></span></div></div>`;
    else apercu = f.apercu.length ? `<div class="ap-texte">${f.apercu.map(l => `<span>${esc(l)}</span>`).join('')}</div>` : `<div class="ap-texte vide"><span>${f.taille ? 'Pas de texte à montrer.' : 'Fichier vide.'}</span></div>`;
    const quand = (e.jour === S.d.aujourdhui ? 'aujourd’hui' : nomJour(e.jour).toLowerCase()) + ', ' + heure(e.t) + (e.etat === 'nouveau' ? ' · créé' : ' · modifié');
    const q = S.d.questions;
    box.innerHTML = `
      <div class="d-tete"><span class="d-chemin">${esc(e.p)}</span><span class="d-titre">${esc(f.titre)}</span></div>
      ${apercu}
      <dl class="d-infos">
        <dt>Projet</dt><dd class="${pr ? 'accent' : ''}">${esc(pr ? pr.titre : 'aucun : rangé dans son domaine')}</dd>
        <dt>Discussion</dt><dd>${esc(s ? s.titre + (s.skills.length ? ' · /' + s.skills.join(', /') : '') : 'hors discussion : fait à la main, ou par un autre agent')}</dd>
        <dt>Quand</dt><dd>${esc(quand)}</dd>
        <dt>Taille</dt><dd>${esc(fmtTaille(f.taille))}</dd>
      </dl>
      <div class="d-actions">
        <button type="button" class="btn primaire" data-act="reveal">Ouvrir dans le Finder</button>
        ${f.ouvrable ? '<button type="button" class="btn" data-act="os">Ouvrir dans l’OS</button>' : ''}
        <button type="button" class="btn" data-act="copie">Copier le chemin</button>
      </div>
      <div class="d-valide${e.range ? ' fait' : ''}">
        <button type="button" class="btn-valider${e.range ? ' remet' : ''}" data-act="range">${e.range ? '↺ Remettre dans l’outbox' : '✓ Valider'}</button>
        <p>${e.range ? 'Rangé : il n’est plus dans l’outbox, et toujours dans ' + esc(dossier) + '.' : 'Valider range ce fichier : il sort de l’outbox et reste où il est, dans ' + esc(dossier) + '. Rien n’est déplacé ni supprimé.'}</p>
      </div>
      ${q > 0 ? `<button type="button" class="d-questions" data-act="questions"><b>${q}</b>${q > 1 ? 'questions de l’agent t’attendent' : 'question de l’agent t’attend'}<span class="fleche">→</span></button>` : ''}`;
    if (f.genre === 'visuel' && IMAGE_EXT.test(e.p)) vignette(e.p);
  }
  /* pictures come through fetch, which carries the OS token, then stay in memory */
  async function vignette(p) {
    let url = blobs.get(p);
    if (!url) {
      try {
        const r = await fetch('/local/files/raw?path=' + enc(p), { cache: 'no-cache' });
        if (!r.ok) throw new Error(String(r.status));
        url = URL.createObjectURL(await r.blob()); blobs.set(p, url);
      } catch (_) { const b = $('ap-visuel'); if (b && choisi() && choisi().p === p) b.textContent = 'Pas de vignette pour ce fichier'; return; }
    }
    const b = $('ap-visuel'); if (!b || !choisi() || choisi().p !== p) return;
    b.textContent = ''; const img = document.createElement('img'); img.src = url; img.alt = ''; b.appendChild(img);
  }
  async function copier(texte) {
    try { await navigator.clipboard.writeText(texte); return true; } catch (_) { }
    const t = document.createElement('textarea'); t.value = texte; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) { } t.remove(); return ok;
  }

  /* ---------------------------- the gestures ---------------------------- */
  let occupe = false;
  async function range(chemins, valeur) {
    if (occupe || !chemins.length) return;
    occupe = true;
    const r = await post('/local/outbox/ranger', { chemins, range: valeur });
    occupe = false;
    if (r.error) { toast(r.error, 'mal'); return; }
    for (const e of S.d.entrees) if (chemins.includes(e.p)) e.range = valeur;
    dessine();
    toast(valeur ? (chemins.length > 1 ? chemins.length + ' fichiers rangés' : 'Rangé : ' + nomDe(chemins[0])) : 'Remis dans l’outbox : ' + nomDe(chemins[0]));
    frais = 0; rafraichit();
  }
  $('jours').addEventListener('click', e => { const b = e.target.closest('[data-jour]'); if (!b) return; S.jour = b.dataset.jour; S.sel = ''; dessine(); });
  document.querySelectorAll('#grouper button').forEach(b => b.onclick = () => { S.grp = b.dataset.grp; store.set('grouper', S.grp); dessine(); });
  document.querySelectorAll('#vues button').forEach(b => b.onclick = () => { S.vue = b.dataset.vue; S.sel = ''; dessine(); });
  $('groupes').addEventListener('click', e => {
    const choix = e.target.closest('[data-choix]'), rg = e.target.closest('[data-range]'), tout = e.target.closest('[data-tout]'), pj = e.target.closest('[data-projet]');
    if (choix) { S.sel = choix.dataset.choix; dessine(); const b = [...document.querySelectorAll('[data-choix]')].find(x => x.dataset.choix === S.sel); if (b) b.focus(); return; }
    if (rg) { const x = trouve(rg.dataset.range); if (x) { S.sel = cle(x); range([x.p], !x.range); } return; }
    if (tout) { const g = $('groupes')._groupes[+tout.dataset.tout]; if (g) range([...new Set(g.l.map(x => x.p))], true); return; }
    if (pj) ouvrirProjet(pj.dataset.projet);
  });
  $('detail').addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const x = choisi(); if (!x) return;
    const f = S.d.fichiers[x.p];
    if (b.dataset.act === 'range') range([x.p], !x.range);
    else if (b.dataset.act === 'os') ouvrirFichier(x.p);
    else if (b.dataset.act === 'questions') ouvrirFichier('outbox/questions.md');
    else if (b.dataset.act === 'copie') toast(await copier(f.abs) ? 'Chemin copié' : 'Je n’ai pas pu copier le chemin', 'ok');
    else if (b.dataset.act === 'reveal') {
      const r = await post('/api/open', { path: x.p, reveal: true });
      if (r.error) toast(r.error, 'mal');
    }
  });

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
  addEventListener('pointerdown', e => { if (!$('reglages').hidden && !e.target.closest('#reglages,#btn-reglages')) fermeReglages(); });
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

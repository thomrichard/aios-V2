/* SM4RT Réglages: the settings tab, or /reglages/ on its own.
   What systeme/metadonnees.md says, in tabs: Affichage (night, day, colour: this browser, at once), Domaines, Types et
   statuts, Champs, Familles de skills. The socle's rows are read only; this workspace's are created, renamed, moved
   (a status, earlier or later in its life), made an end, or deleted, after a confirmation that says where the files
   that use them go. Each gesture waits on the right with what it will write; « Enregistrer » sends them all to
   /local/reglages/appliquer, which rewrites the tables, the headers, the skills and the domain folders. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-reglages:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-reglages:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  const ONGLETS = [['affichage', 'Affichage'], ['domaines', 'Domaines'], ['types', 'Types et statuts'], ['champs', 'Champs'], ['familles', 'Familles de skills']];
  const S = { d: null, ops: [], onglet: store.get('onglet', 'types'), sel: {}, form: false, br: {}, fait: null, occupe: false };
  if (!ONGLETS.some(o => o[0] === S.onglet)) S.onglet = 'types';

  /* ---------------------------- server ---------------------------- */
  async function api(url, opts) {
    try {
      const r = await fetch(url, { cache: 'no-store', ...opts });
      let d = {}; try { d = await r.json(); } catch (_) { d = { error: 'Réponse illisible du serveur (' + r.status + ')' }; }
      return { status: r.status, ...d };
    } catch (e) { return { status: 0, error: 'L’OS ne répond pas. Tourne-t-il (node server.js) ?' }; }
  }
  const post = (url, body) => api(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  function toast(text, kind = '') {
    const t = $('toast'); t.textContent = text; t.className = 'on ' + kind;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.className = kind, kind === 'mal' ? 6000 : 2800);
  }
  const slug = (t, sep = '-') => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, sep).replace(new RegExp('^' + sep + '+|' + sep + '+$', 'g'), '');
  const nomDe = (liste, t) => liste === 'champs' ? slug(t, '_') : slug(t);
  const fichiers = n => n + (n > 1 ? ' fichiers' : ' fichier');
  const ses = (n, un, plusieurs) => n > 1 ? 'ses ' + n + ' fichiers ' + plusieurs : 'son fichier ' + un;
  const cleDe = (liste, x) => liste === 'familles' ? x.id : x.nom;
  const br = (k, d = '') => S.br[k] !== undefined ? S.br[k] : d;

  /* ---------------------------- the model: the server's tables, then the gestures waiting ---------------------------- */
  function modele(ops) {
    const d = S.d, U = d.usage;
    const types = d.tes.types.map(t => ({ ...t, statuts: [...t.statuts], fin: [...t.fin], par: Object.fromEntries(t.statuts.map(s => [s, U.statuts[t.nom + '|' + s] || 0])), n: U.types[t.nom] || 0, neuf: false, touche: [] }));
    const avec = (liste, x, socle) => ({ ...x, socle, neuf: false, modifie: false, n: liste === 'domaines' ? U.domaines[x.nom] || 0 : liste === 'champs' ? U.champs[x.nom] || 0 : (U.familles[x.id] || []).length, skills: liste === 'familles' ? U.familles[x.id] || [] : [] });
    const L = {
      domaines: [...d.tes.domaines.map(x => avec('domaines', x, false)), ...d.socle.domaines.map(x => avec('domaines', x, true))],
      champs: [...d.socle.champs.map(x => avec('champs', x, true)), ...d.tes.champs.map(x => avec('champs', x, false))],
      familles: [...d.socle.familles.map(x => avec('familles', x, true)), ...d.tes.familles.map(x => avec('familles', x, false))]
    };
    const socleTypes = d.socle.types.map(t => ({ ...t, n: U.types[t.nom] || 0 }));
    ops.forEach(o => {
      const t = types.find(x => x.nom === (o.type || o.de || o.nom));
      if (o.k === 'st+' && t) { const at = t.statuts.findIndex(s => t.fin.includes(s)); t.statuts.splice(at < 0 ? t.statuts.length : at, 0, o.nom); t.par[o.nom] = 0; t.touche.push(o.nom); }
      if (o.k === 'st~' && t) { t.statuts = t.statuts.map(s => s === o.de ? o.vers : s); t.fin = t.fin.map(s => s === o.de ? o.vers : s); t.par[o.vers] = t.par[o.de] || 0; delete t.par[o.de]; t.touche.push(o.vers); }
      if (o.k === 'st<>' && t) { const i = t.statuts.indexOf(o.nom), j = i + o.sens; if (i >= 0 && j >= 0 && j < t.statuts.length) { t.statuts[i] = t.statuts[j]; t.statuts[j] = o.nom; t.touche.push(o.nom); } }
      if (o.k === 'stF' && t) { t.fin = t.fin.includes(o.nom) ? t.fin.filter(s => s !== o.nom) : [...t.fin, o.nom]; t.touche.push(o.nom); }
      if (o.k === 'st-' && t) { t.statuts = t.statuts.filter(s => s !== o.nom); t.fin = t.fin.filter(s => s !== o.nom); if (o.vers) t.par[o.vers] = (t.par[o.vers] || 0) + (t.par[o.nom] || 0); delete t.par[o.nom]; }
      if (o.k === 'ty+') types.push({ nom: o.nom, desc: o.desc, statuts: [...o.statuts], fin: [...o.fin], chemin: o.chemin, par: Object.fromEntries(o.statuts.map(s => [s, 0])), n: 0, neuf: true, touche: [] });
      if (o.k === 'ty~' && t) { t.nom = o.vers; t.desc = o.desc; t.chemin = o.chemin; t.neuf = true; }
      if (o.k === 'ty-' && t) { types.splice(types.indexOf(t), 1); const v = types.find(x => x.nom === o.vers); if (v) { v.n += t.n; v.par[v.statuts[0]] = (v.par[v.statuts[0]] || 0) + t.n; } }
      const l = o.liste && L[o.liste];
      if (o.k === 'li+' && l) l.splice(o.liste === 'domaines' ? l.filter(x => !x.socle).length : l.length, 0, { nom: o.nom, id: o.liste === 'familles' ? o.id : undefined, desc: o.desc, format: o.format, oblig: 'aucun', skills: [], n: 0, socle: false, neuf: true });
      if (o.k === 'li~' && l) { const x = l.find(y => cleDe(o.liste, y) === o.de); if (x) { Object.assign(x, { desc: o.desc, modifie: true }); if (o.liste === 'familles') x.nom = o.vers; else x.nom = o.vers; if (o.format) x.format = o.format; if (o.oblig) x.oblig = o.oblig; } }
      if (o.k === 'li-' && l) { const x = l.find(y => cleDe(o.liste, y) === o.nom); if (x) { l.splice(l.indexOf(x), 1); const v = l.find(y => cleDe(o.liste, y) === o.vers); if (v) { v.n += x.n; v.skills = [...v.skills, ...x.skills]; } } }
    });
    return { types, socleTypes, L };
  }

  /* what each gesture will write, in words, and in which files */
  function dit(o, m) {
    const t = m.types.find(x => x.nom === (o.type || o.de || o.nom)) || { par: {}, n: 0 }, ns = s => t.par[s] || 0;
    const x = o.liste ? m.L[o.liste].find(y => cleDe(o.liste, y) === (o.de || o.nom)) || { n: 0 } : { n: 0 }, MOT = { domaines: 'domaine', champs: 'champ', familles: 'famille' }[o.liste], E = o.liste === 'familles' ? 'e' : '';
    const meta = ['metadonnees.md', 1];
    switch (o.k) {
      case 'st+': return { signe: '+', texte: o.type + ' : nouveau statut « ' + o.nom + ' »', effet: 'Il se place avant la fin.', f: [meta] };
      case 'st~': return { signe: '~', texte: o.type + ' : « ' + o.de + ' » devient « ' + o.vers + ' »', effet: ns(o.de) ? 'Réécrit le statut de ' + fichiers(ns(o.de)) + '.' : 'Aucun fichier ne l’a encore.', f: [meta, ['en-têtes', ns(o.de)]] };
      case 'st<>': return { signe: '~', texte: o.type + ' : « ' + o.nom + ' » ' + (o.sens < 0 ? 'plus tôt' : 'plus tard') + ' dans sa vie', effet: 'Seul l’ordre change ; aucun fichier ne bouge.', f: [meta] };
      case 'stF': return { signe: '~', texte: o.type + ' : « ' + o.nom + ' » ' + (o.etait ? 'n’est plus une fin' : 'devient une fin'), effet: o.etait ? 'Ses fichiers redeviennent vivants.' : 'Ses fichiers ne comptent plus comme vivants.', f: [meta] };
      case 'st-': return { signe: '−', texte: o.type + ' : statut « ' + o.nom + ' » supprimé', effet: ns(o.nom) ? (ns(o.nom) > 1 ? 'Ses ' + ns(o.nom) + ' fichiers passent' : 'Son fichier passe') + ' à « ' + o.vers + ' ».' : 'Aucun fichier ne l’avait.', f: [meta, ['en-têtes', ns(o.nom)]] };
      case 'ty+': return { signe: '+', texte: 'Nouveau type « ' + o.nom + ' » (' + o.statuts.join(' → ') + ')', effet: 'Sa vue vues/' + o.nom + '.md apparaîtra.', f: [meta] };
      case 'ty~': return { signe: '~', texte: o.de === o.vers ? 'Type « ' + o.de + ' » modifié' : 'Le type « ' + o.de + ' » devient « ' + o.vers + ' »', effet: o.de !== o.vers && t.n ? 'Réécrit le type de ' + fichiers(t.n) + '.' : 'Seule sa ligne change.', f: [meta, ['en-têtes', o.de !== o.vers ? t.n : 0]] };
      case 'ty-': return { signe: '−', texte: 'Type « ' + o.nom + ' » supprimé', effet: t.n ? (t.n > 1 ? 'Ses ' + t.n + ' fichiers deviennent des' : 'Son fichier devient un') + ' « ' + o.vers + ' ».' : 'Aucun fichier ne l’avait.', f: [meta, ['en-têtes', t.n]] };
      case 'li+': return { signe: '+', texte: 'Nouve' + (E ? 'lle ' : 'au ') + MOT + ' « ' + o.nom + ' »', effet: o.liste === 'domaines' ? 'Crée routers/' + o.nom + '.md et domaines/' + o.nom + '/.' : o.liste === 'champs' ? 'verifier.py l’accepte dans un en-tête.' : 'L’onglet Skills la propose.', f: [meta, ['routeur et dossier créés', o.liste === 'domaines' ? 1 : 0]] };
      case 'li~': { const ren = o.liste !== 'familles' && o.de !== o.vers; return { signe: '~', texte: ren ? MOT + ' « ' + o.de + ' » devient « ' + o.vers + ' »' : MOT + ' « ' + o.de + ' » modifié' + E, effet: ren && x.n ? (o.liste === 'domaines' ? 'Réécrit le domaine de ' + fichiers(x.n) + ', renomme son dossier et son routeur.' : 'Réécrit ce champ dans ' + fichiers(x.n) + '.') : 'Seule sa ligne change.', f: [meta, ['en-têtes', ren ? x.n : 0], ['dossier et routeur renommés', ren && o.liste === 'domaines' ? 1 : 0]] }; }
      case 'li-': return { signe: '−', texte: MOT + ' « ' + o.nom + ' » supprimé' + E, effet: !x.n ? (o.liste === 'domaines' ? 'Son routeur et son dossier vont dans archives/.' : 'Personne ne s’en servait.') : o.liste === 'domaines' ? 'Ses fichiers vont dans « ' + o.vers + ' » ; son routeur va dans archives/.' : o.liste === 'champs' ? 'Retiré de ' + fichiers(x.n) + '.' : (x.n > 1 ? 'Ses ' + x.n + ' skills passent' : 'Sa skill passe') + ' à « ' + (o.vers || 'sans famille') + ' ».',
        f: [meta, [o.liste === 'familles' ? 'skills' : 'en-têtes', x.n], ['routeur dans archives/', o.liste === 'domaines' ? 1 : 0]] };
    }
    return { signe: '?', texte: o.k, effet: '', f: [] };
  }

  /* ---------------------------- the confirmation ---------------------------- */
  function confirme({ titre, texte, choix, bouton }) {
    return new Promise(ok => {
      const v = $('voile'); let pris = choix && choix.length === 1 ? choix[0].v : null;
      $('c-titre').textContent = titre; $('c-texte').textContent = texte;
      $('c-choix').innerHTML = (choix || []).map(c => `<button type="button" role="radio" aria-checked="${c.v === pris}" data-v="${esc(c.v)}">${esc(c.nom)}</button>`).join('');
      $('c-choix').hidden = !choix; $('c-oui').textContent = bouton || 'Supprimer'; $('c-oui').disabled = !!choix && pris === null;
      v.hidden = false; (choix ? $('c-choix').querySelector('button') : $('c-non')).focus();
      const fin = r => { v.hidden = true; $('c-choix').onclick = $('c-oui').onclick = $('c-non').onclick = null; removeEventListener('keydown', touche, true); ok(r); };
      const touche = e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); fin(null); } };
      addEventListener('keydown', touche, true);
      $('c-choix').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; pris = b.dataset.v; $('c-choix').querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', x === b)); $('c-oui').disabled = false; };
      $('c-oui').onclick = () => fin(choix ? pris : '');
      $('c-non').onclick = () => fin(null);
      v.onclick = e => { if (e.target === v) fin(null); };
    });
  }

  /* ---------------------------- drawing ---------------------------- */
  const champ = (cle, libelle, valeur, opts = {}) => `<label class="ch${opts.large ? ' large' : ''}"><span class="etiquette">${esc(libelle)}</span><input class="champ${opts.mono ? ' mono' : ''}" data-br="${esc(cle)}" value="${esc(br(cle, valeur))}" placeholder="${esc(opts.exemple || '')}"${opts.entree ? ` data-entree="${esc(opts.entree)}"` : ''} autocomplete="off" spellcheck="false"></label>`;
  function dessine() {
    const m = modele(S.ops), pend = S.ops.map(o => ({ o, d: dit(o, modele(S.ops.slice(0, S.ops.indexOf(o)))) }));
    const badge = id => S.ops.filter(o => (o.liste || 'types') === id).length;
    $('onglets').innerHTML = ONGLETS.map(([id, nom]) => `<button type="button" role="tab" data-onglet="${id}" aria-selected="${S.onglet === id}">${esc(nom)}${badge(id) ? `<span class="pastille-n">${badge(id)}</span>` : ''}</button>`).join('');
    $('ici').textContent = ONGLETS.find(o => o[0] === S.onglet)[1];
    $('contenu').innerHTML = S.onglet === 'affichage' ? affichage() : S.onglet === 'types' ? types(m) : liste(m, S.onglet);
    attente(pend);
  }
  function affichage() {
    const a = window.Apparence ? Apparence.get() : { mode: 'nuit', couleur: 'turquoise' };
    const teintes = [['turquoise', '#2EE6C9'], ['braise', '#FF7A45'], ['glacier', '#4DA8FF'], ['violet', '#A594FF']];
    return `<div class="titre-section"><h2>Affichage</h2><span class="etiquette">ce navigateur · tout de suite</span></div>
      <p class="aide">Il change tout de suite, sur toutes les pages de l’interface, dans ce navigateur. Rien ne s’écrit dans le workspace.</p>
      <div class="bloc">
        <div class="ligne-r"><span>Mode</span><div class="seg" role="group" aria-label="Mode">${['nuit', 'jour', 'auto'].map(x => `<button type="button" data-mode="${x}" aria-pressed="${a.mode === x}">${x}</button>`).join('')}</div></div>
        <div class="ligne-r"><span>Couleur</span><div class="teintes" role="group" aria-label="Couleur">${teintes.map(([n, hex]) => `<button type="button" class="teinte" data-couleur="${n}" style="background:${hex}" aria-pressed="${a.couleur === n}" aria-label="${n}" title="${n}"></button>`).join('')}</div></div>
      </div>
      <p class="aide pale">Bientôt ici : la couleur de chaque domaine, et d’autres réglages d’affichage.</p>`;
  }
  function types(m) {
    const carte = t => {
      const st = S.sel.type === t.nom ? S.sel.statut : '', edit = S.sel.typeEdit === t.nom, k = c => 'ty-' + t.nom + '-' + c;
      const puces = t.statuts.map((s, i) => { const fin = t.fin.includes(s), neuf = t.touche.includes(s);
        return `<button type="button" class="statut${fin ? ' fin' : ''}${neuf ? ' neuf' : ''}" data-act="statut" data-type="${esc(t.nom)}" data-statut="${esc(s)}" aria-pressed="${st === s}" title="Modifier « ${esc(s)} »">${esc(s)}<small>${t.par[s] || 0}</small>${fin ? '<em>✓ fin</em>' : ''}</button>${i < t.statuts.length - 1 ? '<span class="fleche" aria-hidden="true">→</span>' : ''}`; }).join('');
      const n = st ? t.par[st] || 0 : 0, kr = 'ren-' + t.nom + '-' + st;
      const editeur = st ? `<div class="editeur"><div class="e-tete"><b>Statut « ${esc(st)} »</b><span class="etiquette">${fichiers(n)}</span></div>
        <div class="e-ligne"><input class="champ mono" data-br="${esc(kr)}" value="${esc(br(kr, st))}" aria-label="Nouveau nom du statut" data-entree="st-renommer" spellcheck="false"><button type="button" class="btn petit primaire" data-act="st-renommer">Renommer</button>
        <span class="sep"></span><button type="button" class="btn petit" data-act="st-avant">← Plus tôt</button><button type="button" class="btn petit" data-act="st-apres">Plus tard →</button>
        <button type="button" class="btn petit fin-btn" data-act="st-fin">${t.fin.includes(st) ? '✓ C’est une fin : l’enlever' : 'En faire une fin'}</button>
        <span class="sep"></span><button type="button" class="btn petit danger" data-act="st-suppr">Supprimer…</button></div>
        <p class="aide pale">${n ? 'Renommer réécrit le statut de ' + (n > 1 ? 'ses ' + n + ' fichiers' : 'son fichier') + '.' : 'Aucun fichier ne l’a : le renommer ne touche que sa ligne.'}</p></div>` : '';
      const editeurType = edit ? `<div class="editeur"><div class="e-ligne">${champ(k('nom'), 'Nom', t.nom, { mono: true })}${champ(k('desc'), 'Ce que c’est', t.desc, { large: true })}${champ(k('chemin'), 'Où il se range', t.chemin, { mono: true, large: true })}</div>
        <div class="e-ligne"><button type="button" class="btn petit primaire" data-act="ty-appliquer" data-type="${esc(t.nom)}">Appliquer</button><span class="sep"></span><button type="button" class="btn petit danger" data-act="ty-suppr" data-type="${esc(t.nom)}">Supprimer le type…</button></div>
        <p class="aide pale">${t.n ? 'Renommer réécrit le type de ' + (t.n > 1 ? 'ses ' + t.n + ' fichiers' : 'son fichier') + '.' : 'Aucun fichier n’est de ce type.'}</p></div>` : '';
      return `<article class="carte${t.neuf ? ' neuf' : ''}"><div class="c-tete"><b class="mono">${esc(t.nom)}</b><span class="desc">${esc(t.desc)}</span><span class="etiquette">${t.neuf && !t.n ? 'à enregistrer' : fichiers(t.n)}</span><button type="button" class="btn petit" data-act="type-edit" data-type="${esc(t.nom)}" aria-expanded="${edit}">${edit ? 'Fermer' : 'Modifier le type'}</button></div>${editeurType}
        <div class="statuts">${puces}<span class="ajout petit-ajout"><span aria-hidden="true">+</span><input data-br="st+${esc(t.nom)}" value="${esc(br('st+' + t.nom))}" placeholder="un statut" aria-label="Ajouter un statut à ${esc(t.nom)}" data-entree="st-ajouter" data-type="${esc(t.nom)}" spellcheck="false"><button type="button" class="btn petit" data-act="st-ajouter" data-type="${esc(t.nom)}">Ajouter</button></span></div>
        ${editeur}<div class="chemin">se range dans ${esc(t.chemin || '—')}</div></article>`;
    };
    const form = S.form ? `<div class="editeur nouveau"><b>Nouveau type</b><div class="e-ligne">${champ('nt-nom', 'Nom', '', { mono: true, exemple: 'podcast' })}${champ('nt-desc', 'Ce que c’est', '', { large: true, exemple: 'Un épisode du podcast' })}</div>
      <div class="e-ligne">${champ('nt-statuts', 'Statuts, dans l’ordre de leur vie', '', { large: true, mono: true, exemple: 'a-enregistrer, monte, publie' })}${champ('nt-fin', 'Ceux qui le terminent', '', { mono: true, exemple: 'publie' })}</div>
      <div class="e-ligne">${champ('nt-chemin', 'Où il se range', 'domaines/<domaine>/<slug>.md', { mono: true, large: true })}<span class="ressort"></span><button type="button" class="btn petit" data-act="ty-annuler">Annuler</button><button type="button" class="btn petit primaire" data-act="ty-creer">Ajouter le type</button></div></div>`
      : `<button type="button" class="btn ajouter" data-act="ty-nouveau"><span aria-hidden="true">+</span> Nouveau type</button>`;
    const socle = m.socleTypes.map(t => `<div class="s-ligne"><b class="mono">${esc(t.nom)}</b><span class="desc">${esc(t.desc)}</span><span class="s-puces">${(t.statuts.length ? t.statuts : ['—']).map(s => `<span class="${t.fin.includes(s) ? 'fin' : ''}">${esc(s)}</span>`).join('')}</span><span class="etiquette">${fichiers(t.n)}</span></div>`).join('');
    return `<div class="titre-section"><h2>Tes types</h2><span class="etiquette">un clic sur un statut pour le renommer, le déplacer, en faire une fin ou le supprimer</span></div>
      ${m.types.map(carte).join('') || '<p class="aide">Pas encore de type à toi.</p>'}${form}
      <div class="titre-section"><h2>Le socle</h2><span class="etiquette">${m.socleTypes.length} types · en lecture seule</span></div>
      <p class="aide">Ils viennent du socle et restent les mêmes pour tout le monde. Pour un besoin à toi, ajoute un type à toi.</p><div class="socle">${socle}</div>`;
  }
  function liste(m, id) {
    const L = m.L[id], MOT = { domaines: 'domaine', champs: 'champ', familles: 'famille' }[id];
    const choisi = L.find(x => !x.socle && cleDe(id, x) === S.sel.item), k = c => 'li-' + id + '-' + (choisi ? cleDe(id, choisi) : '') + '-' + c;
    const meta = x => id === 'domaines' ? fichiers(x.n) + ' · routers/' + x.nom + '.md' : id === 'champs' ? x.format + ' · obligatoire : ' + x.oblig + (x.n ? ' · ' + fichiers(x.n) : '') : x.skills.map(s => '/' + s).join(' ') || 'aucune skill';
    const cartes = L.map((x, i) => `<button type="button" class="item${x.socle ? ' socle' : ''}${x === choisi ? ' choisi' : ''}${x.neuf || x.modifie ? ' neuf' : ''}" ${x.socle ? 'disabled' : `data-act="item" data-cle="${esc(cleDe(id, x))}"`}>
      <span class="i-tete">${id === 'domaines' ? `<i class="point" style="--c:${['#2EE6C9', '#B69CFF', '#FBBF24', '#F472B6', '#4DA8FF', '#4ADE80', '#FF7A45', '#67E8F9'][i % 8]}"></i>` : ''}<b class="mono">${esc(id === 'familles' ? x.nom : x.nom)}</b><span class="origine">${x.socle ? 'socle' : x.neuf ? 'à enregistrer' : x.modifie ? 'modifié' : 'à toi'}</span></span>
      <span class="desc">${esc(x.desc)}</span><span class="meta">${esc(meta(x))}</span></button>`).join('');
    const ed = choisi ? `<div class="editeur"><div class="e-tete"><b>${MOT.charAt(0).toUpperCase() + MOT.slice(1)} « ${esc(choisi.nom)} »</b><span class="etiquette">${id === 'familles' ? choisi.n + (choisi.n > 1 ? ' skills' : ' skill') : fichiers(choisi.n)}</span><button type="button" class="btn petit discret" data-act="li-fermer" aria-label="Fermer">×</button></div>
      <div class="e-ligne">${champ(k('nom'), 'Nom', choisi.nom, { mono: id !== 'familles' })}${champ(k('desc'), id === 'champs' ? 'Ce qu’il dit' : id === 'familles' ? 'Ce qu’elle regroupe' : 'Ce qu’il couvre', choisi.desc, { large: true })}
      ${id === 'champs' ? `<label class="ch"><span class="etiquette">Format</span><select class="champ" data-br="${esc(k('format'))}">${S.d.formats.map(f => `<option${br(k('format'), choisi.format) === f ? ' selected' : ''}>${f}</option>`).join('')}</select></label>${champ(k('oblig'), 'Obligatoire pour', choisi.oblig, { mono: true })}` : ''}</div>
      <div class="e-ligne"><button type="button" class="btn petit primaire" data-act="li-appliquer">Appliquer</button><span class="sep"></span><button type="button" class="btn petit danger" data-act="li-suppr">Supprimer…</button></div>
      <p class="aide pale">${id === 'familles' ? 'Le nom affiché change ; les skills gardent leur famille.' : choisi.n ? (id === 'domaines' ? 'Renommer réécrit le domaine de ' + fichiers(choisi.n) + ', renomme son dossier et son routeur.' : 'Renommer réécrit ce champ dans ' + fichiers(choisi.n) + '.') : 'Personne ne s’en sert encore : seule sa ligne change.'}</p></div>` : '';
    const nouveau = `<div class="editeur nouveau"><div class="e-ligne">${champ('n-' + id + '-nom', 'Nouveau ' + MOT, '', { mono: id !== 'familles', exemple: { domaines: 'podcast', champs: 'budget', familles: 'Vendre' }[id], entree: 'li-ajouter' })}${champ('n-' + id + '-desc', id === 'champs' ? 'Ce qu’il dit' : id === 'familles' ? 'Ce qu’elle regroupe' : 'Ce qu’il couvre', '', { large: true, entree: 'li-ajouter', exemple: { domaines: 'Le podcast : épisodes, invités', champs: 'Le budget prévu, en euros', familles: 'Prospecter, proposer, relancer' }[id] })}
      ${id === 'champs' ? `<label class="ch"><span class="etiquette">Format</span><select class="champ" data-br="n-champs-format">${S.d.formats.map(f => `<option${br('n-champs-format', 'texte') === f ? ' selected' : ''}>${f}</option>`).join('')}</select></label>` : ''}<button type="button" class="btn petit primaire" data-act="li-ajouter">Ajouter</button></div>
      <p class="aide pale">${esc({ domaines: 'Un domaine a son routeur (routers/<nom>.md) et son dossier (domaines/<nom>/) : les deux se créent en enregistrant.', champs: 'Un champ à toi n’est obligatoire pour aucun type, sauf si tu le dis.', familles: 'Une skill choisit sa famille dans son en-tête : metadata: famille.' }[id])}</p></div>`;
    const AIDE = { domaines: 'Les grandes parties de ton activité. Chacune a son routeur, son dossier et sa planète dans Orbes 3D. Un clic sur un des tiens pour le modifier.', champs: 'Ce qu’un fichier peut dire de lui, entre ses deux ---. Ceux du socle se lisent ; un clic sur un des tiens pour le modifier.', familles: 'Les filtres de l’onglet Skills. Ceux du socle se lisent ; un clic sur une des tiennes pour la modifier.' };
    return `<div class="titre-section"><h2>${{ domaines: 'Domaines', champs: 'Champs d’un en-tête', familles: 'Familles de skills' }[id]}</h2></div><p class="aide">${AIDE[id]}</p><div class="items">${cartes}</div>${ed}${nouveau}`;
  }
  function attente(pend) {
    const a = $('attente'), tot = {};
    pend.forEach(p => (p.d.f || []).forEach(([nom, n]) => { if (n) tot[nom] = (tot[nom] || 0) + n; }));
    const res = S.fait;
    a.innerHTML = `<div class="a-tete"><h2>À enregistrer</h2><span class="etiquette accent">${pend.length ? pend.length + (pend.length > 1 ? ' changements' : ' changement') : ''}</span></div>
      ${!pend.length && !res ? '<p class="aide">Rien pour l’instant. Chaque changement attend ici, avec ce qu’il va écrire, avant d’être enregistré.</p>' : ''}
      ${!pend.length && res ? `<div class="ok"><b>✓ Enregistré</b><span>${esc(res)}</span></div>` : ''}
      ${pend.length ? `<ol class="a-liste">${pend.map((p, i) => `<li><span class="signe ${p.d.signe === '−' ? 'moins' : ''}">${p.d.signe}</span><span class="a-txt"><b>${esc(p.d.texte)}</b><small>${esc(p.d.effet)}</small></span><button type="button" class="btn petit discret" data-defaire="${i}" aria-label="Défaire" title="Défaire">×</button></li>`).join('')}</ol>
      <div class="a-fichiers"><span class="etiquette">Fichiers touchés</span>${Object.entries(tot).map(([nom, n]) => `<div><span>${esc(nom === 'metadonnees.md' ? 'systeme/metadonnees.md' : nom)}</span><span class="${nom === 'en-têtes' || nom === 'skills' ? 'attention' : ''}">${nom === 'metadonnees.md' ? n + (n > 1 ? ' lignes' : ' ligne') : /créés|renommés|archives/.test(nom) ? '' : n + ' réécrit' + (n > 1 ? 's' : '')}</span></div>`).join('')}</div>
      <p class="aide pale">Dans un dépôt Git : un commit avant, un après, sur ces seuls fichiers. Puis index.py et verifier.py.</p>
      <div class="a-btns"><button type="button" class="btn" data-act="tout-defaire">Tout défaire</button><button type="button" class="btn primaire" data-act="enregistrer"${S.occupe ? ' disabled' : ''}>${S.occupe ? 'Enregistrement…' : 'Enregistrer'}</button></div>` : ''}`;
  }

  /* ---------------------------- the gestures ---------------------------- */
  const pose = (op, sel) => { S.ops.push(op); S.fait = null; if (sel !== undefined) S.sel = sel; dessine(); };
  async function geste(act, el) {
    const m = modele(S.ops), t = m.types.find(x => x.nom === (el.dataset.type || S.sel.type));
    if (act === 'statut') { const s = el.dataset.statut, meme = S.sel.type === t.nom && S.sel.statut === s; S.sel = meme ? {} : { type: t.nom, statut: s }; return dessine(); }
    if (act === 'type-edit') { S.sel = S.sel.typeEdit === t.nom ? {} : { typeEdit: t.nom }; return dessine(); }
    if (act === 'st-ajouter') { const v = slug(br('st+' + t.nom)); if (!v) return; if (t.statuts.includes(v)) return toast(t.nom + ' a déjà « ' + v + ' »', 'mal'); S.br['st+' + t.nom] = ''; return pose({ k: 'st+', type: t.nom, nom: v }); }
    const st = S.sel.statut;
    if (act === 'st-renommer') { const v = slug(br('ren-' + t.nom + '-' + st, st)); if (!v || v === st) return; if (t.statuts.includes(v)) return toast(t.nom + ' a déjà « ' + v + ' »', 'mal'); return pose({ k: 'st~', type: t.nom, de: st, vers: v }, { type: t.nom, statut: v }); }
    if (act === 'st-avant' || act === 'st-apres') return pose({ k: 'st<>', type: t.nom, nom: st, sens: act === 'st-avant' ? -1 : 1 });
    if (act === 'st-fin') return pose({ k: 'stF', type: t.nom, nom: st, etait: t.fin.includes(st) });
    if (act === 'st-suppr') {
      const n = t.par[st] || 0, autres = t.statuts.filter(s => s !== st);
      if (n && !autres.length) return toast('C’est le seul statut de ' + t.nom + ' : ajoute-en un autre d’abord.', 'mal');
      const v = await confirme({ titre: 'Supprimer le statut « ' + st + ' » de ' + t.nom + ' ?', texte: n ? (n > 1 ? 'Ses ' + n + ' fichiers ont' : 'Son fichier a') + ' ce statut. Choisis ce qu’' + (n > 1 ? 'ils deviennent' : 'il devient') + ' :' : 'Aucun fichier ne l’a. Il disparaît de ' + t.nom + '.', choix: n ? autres.map(s => ({ v: s, nom: s })) : null });
      if (v === null) return;
      return pose({ k: 'st-', type: t.nom, nom: st, vers: v }, {});
    }
    if (act === 'ty-appliquer') { const k = c => 'ty-' + t.nom + '-' + c, vers = slug(br(k('nom'), t.nom)), desc = br(k('desc'), t.desc), chemin = br(k('chemin'), t.chemin);
      if (!vers || (vers === t.nom && desc === t.desc && chemin === t.chemin)) return;
      if (vers !== t.nom && [...m.types, ...m.socleTypes].some(x => x.nom === vers)) return toast('« ' + vers + ' » est déjà un type', 'mal');
      return pose({ k: 'ty~', type: t.nom, de: t.nom, vers, desc, chemin }, {}); }
    if (act === 'ty-suppr') {
      const autres = [...m.types.filter(x => x !== t), ...m.socleTypes].map(x => x.nom);
      const v = await confirme({ titre: 'Supprimer le type « ' + t.nom + ' » ?', texte: t.n ? (t.n > 1 ? 'Ses ' + t.n + ' fichiers sont' : 'Son fichier est') + ' de ce type. Choisis ce qu’' + (t.n > 1 ? 'ils deviennent ; ils prennent' : 'il devient ; il prend') + ' le premier statut du nouveau type s’il le faut :' : 'Aucun fichier n’est de ce type. Il disparaît de la liste.', choix: t.n ? autres.map(s => ({ v: s, nom: s })) : null });
      if (v === null) return;
      return pose({ k: 'ty-', type: t.nom, nom: t.nom, vers: v }, {});
    }
    if (act === 'ty-nouveau') { S.form = true; return dessine(); }
    if (act === 'ty-annuler') { S.form = false; return dessine(); }
    if (act === 'ty-creer') {
      const nom = slug(br('nt-nom')), statuts = br('nt-statuts').split(',').map(x => slug(x)).filter(Boolean);
      if (!nom || !statuts.length) return toast('Il faut un nom et au moins un statut', 'mal');
      if ([...m.types, ...m.socleTypes].some(x => x.nom === nom)) return toast('« ' + nom + ' » est déjà un type', 'mal');
      const fin = br('nt-fin').split(',').map(x => slug(x)).filter(x => statuts.includes(x));
      S.form = false; ['nt-nom', 'nt-desc', 'nt-statuts', 'nt-fin', 'nt-chemin'].forEach(c => delete S.br[c]);
      return pose({ k: 'ty+', nom, desc: br('nt-desc'), statuts, fin: fin.length ? fin : [statuts[statuts.length - 1]], chemin: br('nt-chemin', 'domaines/<domaine>/<slug>.md') });
    }
    const id = S.onglet, L = m.L[id] || [], choisi = L.find(x => !x.socle && cleDe(id, x) === S.sel.item), k = c => 'li-' + id + '-' + (choisi ? cleDe(id, choisi) : '') + '-' + c;
    if (act === 'item') { const c = el.dataset.cle; S.sel = S.sel.item === c ? {} : { item: c }; return dessine(); }
    if (act === 'li-fermer') { S.sel = {}; return dessine(); }
    if (act === 'li-appliquer' && choisi) {
      const de = cleDe(id, choisi), vers = id === 'familles' ? String(br(k('nom'), choisi.nom)).trim() : nomDe(id, br(k('nom'), choisi.nom)), desc = br(k('desc'), choisi.desc);
      const o = { k: 'li~', liste: id, de, vers, desc }; if (id === 'champs') { o.format = br(k('format'), choisi.format); o.oblig = br(k('oblig'), choisi.oblig); }
      if (!vers || (vers === choisi.nom && desc === choisi.desc && (id !== 'champs' || (o.format === choisi.format && o.oblig === choisi.oblig)))) return;
      if (id !== 'familles' && vers !== choisi.nom && L.some(x => x.nom === vers)) return toast('« ' + vers + ' » existe déjà', 'mal');
      return pose(o, { item: id === 'familles' ? de : vers });
    }
    if (act === 'li-suppr' && choisi) {
      const n = choisi.n, autres = L.filter(x => x !== choisi), cle = cleDe(id, choisi);
      const choix = !n ? null : id === 'domaines' ? autres.map(x => ({ v: x.nom, nom: x.nom })) : id === 'familles' ? autres.map(x => ({ v: x.id, nom: x.nom })).concat([{ v: '', nom: 'sans famille' }]) : null;
      const texte = !n ? (id === 'domaines' ? 'Aucun fichier n’y est. Son routeur et son dossier vont dans archives/.' : 'Personne ne s’en sert. Il disparaît de la liste.')
        : id === 'domaines' ? (n > 1 ? 'Ses ' + n + ' fichiers sont' : 'Son fichier est') + ' dans ce domaine. Choisis où ' + (n > 1 ? 'ils vont' : 'il va') + ' ; son routeur ira dans archives/ :'
        : id === 'champs' ? 'Il est dans ' + fichiers(n) + ' : il sera retiré de leur en-tête. Leur valeur sera perdue, sauf dans l’historique Git.'
        : (n > 1 ? 'Ses ' + n + ' skills sont' : 'Sa skill est') + ' de cette famille. Choisis où ' + (n > 1 ? 'elles vont' : 'elle va') + ' :';
      const v = await confirme({ titre: 'Supprimer ' + ({ domaines: 'le domaine', champs: 'le champ', familles: 'la famille' }[id]) + ' « ' + choisi.nom + ' » ?', texte, choix, bouton: id === 'champs' && n ? 'Supprimer et retirer' : 'Supprimer' });
      if (v === null) return;
      return pose({ k: 'li-', liste: id, nom: cle, vers: v, retirer: id === 'champs' && n > 0 }, {});
    }
    if (act === 'li-ajouter') {
      const brut = br('n-' + id + '-nom'), nom = id === 'familles' ? String(brut).trim() : nomDe(id, brut), cle = id === 'familles' ? slug(brut) : nom;
      if (!nom) return;
      if (L.some(x => cleDe(id, x) === cle)) return toast('« ' + cle + ' » existe déjà', 'mal');
      const o = { k: 'li+', liste: id, nom, desc: br('n-' + id + '-desc') }; if (id === 'champs') o.format = br('n-champs-format', 'texte'); if (id === 'familles') o.id = cle;
      S.br['n-' + id + '-nom'] = ''; S.br['n-' + id + '-desc'] = '';
      return pose(o);
    }
  }
  async function enregistre() {
    if (S.occupe || !S.ops.length) return;
    S.occupe = true; dessine();
    const r = await post('/local/reglages/appliquer', { ops: S.ops });
    S.occupe = false;
    if (r.error) { toast(r.error, 'mal'); return dessine(); }
    const alertes = (r.verifier || []).filter(l => /^ALERTE|^ERREUR/.test(l)).length;
    S.fait = [r.fichiers ? fichiers(r.fichiers) + ' réécrit' + (r.fichiers > 1 ? 's' : '') : 'metadonnees.md réécrit', ...(r.deplacements || []), ...(r.crees || []).map(c => c + ' créé'), r.commits && r.commits.length ? 'commit ' + r.commits.join(', ') : '', alertes ? 'verifier.py : ' + alertes + ' alerte' + (alertes > 1 ? 's' : '') + ', à voir avec l’agent' : 'verifier.py : tout est en ordre'].filter(Boolean).join(' · ');
    S.ops = []; S.sel = {}; S.br = {};
    toast('Enregistré');
    await charge(); dessine();
  }

  /* ---------------------------- events ---------------------------- */
  $('onglets').addEventListener('click', e => { const b = e.target.closest('[data-onglet]'); if (!b) return; S.onglet = b.dataset.onglet; S.sel = {}; store.set('onglet', S.onglet); dessine(); });
  $('contenu').addEventListener('click', e => {
    const mo = e.target.closest('button[data-mode]'), co = e.target.closest('button[data-couleur]');
    if (mo && window.Apparence) { Apparence.set({ mode: mo.dataset.mode }); return dessine(); }
    if (co && window.Apparence) { Apparence.set({ couleur: co.dataset.couleur }); return dessine(); }
    const b = e.target.closest('[data-act]'); if (b) geste(b.dataset.act, b);
  });
  $('contenu').addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.br; if (k) S.br[k] = e.target.value; });
  /* a list: its choice is read on change (a text field is read as it is typed) */
  $('contenu').addEventListener('change', e => { const k = e.target.tagName === 'SELECT' && e.target.dataset.br; if (k) S.br[k] = e.target.value; });
  $('contenu').addEventListener('keydown', e => { const a = e.target.dataset && e.target.dataset.entree; if (e.key !== 'Enter' || !a) return; e.preventDefault(); geste(a, e.target); });
  $('attente').addEventListener('click', e => {
    const d = e.target.closest('[data-defaire]'); if (d) { S.ops.splice(+d.dataset.defaire, 1); S.sel = {}; return dessine(); }
    const b = e.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 'tout-defaire') { S.ops = []; S.sel = {}; return dessine(); }
    if (b.dataset.act === 'enregistrer') enregistre();
  });
  addEventListener('storage', e => { if (e.key === 'sm4rt-apparence' && S.d && S.onglet === 'affichage') dessine(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && $('voile').hidden && embedded) parent.postMessage({ type: 'reglages-copy-back' }, '*'); });
  addEventListener('beforeunload', e => { if (S.ops.length) { e.preventDefault(); e.returnValue = ''; } });

  async function charge() {
    const r = await api('/local/reglages');
    if (r.error) { $('avis').hidden = false; $('avis').textContent = r.error; return false; }
    S.d = r;
    $('avis').hidden = r.workspace; if (!r.workspace) $('avis').textContent = 'La section « Ce workspace » manque dans systeme/metadonnees.md : la page se lit, mais rien ne s’enregistre.';
    return true;
  }
  addEventListener('message', e => { if (e.source === parent && e.data && e.data.type === 'reglages-copy' && e.data.action === 'shown' && !S.ops.length) charge().then(ok => ok && dessine()); });
  (async () => {
    if (await charge()) dessine();
    if (embedded) parent.postMessage({ type: 'reglages-copy-ready' }, '*');
  })();
})();

/* SM4RT Disque: the rosace, or /disque/ on its own.
   The workspace flat, by its indexes: parts that weigh their files. The map: AGENTS.md at the centre, a ring of
   domains, a ring of their indexes, this week's activity on the edge. A folder: its indexes and how fresh they are.
   An index: its groups inside (by month, status, project, type, link, theme or due date: "Découper par"), and every
   file as a thin slice outside. A group: all its files, named. A click zooms, four ways back up, and what you look at
   reads on the right. The server counts and groups; this page draws: conic gradients cut into crowns, and one circle
   on top that finds the part under the pointer from its distance and angle to the centre. */
(() => {
  'use strict';
  const C = window.SM4RTCommun('disque');
  const { $, embedded, esc, enc, store, api, toast, el, rgb, rgba, fmtN, pluriel, nbFichiers, taille, depuis, dirOf, finder, ligne, tete } = C;
  const S = { data: null, chemin: '', fichiers: false, par: store.get('par', 'mois'), groupe: '', sel: '', fiche: null, survol: '', charge: 0, cibles: [], k: 1, place: 300 };
  const scene = $('scene');
  const NOMMES = 60, RMAX = 300;
  const CRIT = {
    mois: { bas: 'mois', les: 'les mois', liste: 'Ses mois' }, statut: { bas: 'statut', les: 'les statuts', liste: 'Ses statuts' }, projet: { bas: 'projet', les: 'les projets', liste: 'Ses projets' },
    type: { bas: 'type', les: 'les types', liste: 'Ses types' }, liens: { bas: 'lien', les: 'les index cités', liste: 'Ses liens' }, theme: { bas: 'thème', les: 'les thèmes', liste: 'Ses thèmes' },
    echeance: { bas: 'échéance', les: 'les échéances', liste: 'Ses échéances' }
  };

  /* ---------------------------- geometry: degrees from the top, clockwise; radii in units ---------------------------- */
  const rad = a => (a - 90) * Math.PI / 180;
  const pt = (r, a) => [r * S.k * Math.cos(rad(a)), r * S.k * Math.sin(rad(a))];
  const mod = a => ((a % 360) + 360) % 360;
  /* split [debut, fin] by weight, each part at least `min` degrees, a gap between them */
  function parts(poids, debut, fin, ecart, min) {
    const libre = fin - debut - ecart * poids.length, tot = poids.reduce((a, p) => a + p, 0) || 1;
    let w = poids.map(p => Math.max(min, libre * p / tot)); const s = w.reduce((a, x) => a + x, 0) || 1; w = w.map(x => x * libre / s);
    let a = debut + ecart / 2;
    return w.map(x => { const o = { a0: a, a1: a + x, am: a + x / 2, span: x }; a += x + ecart; return o; });
  }

  /* ---------------------------- going places ---------------------------- */
  async function va(chemin, fichiers, dir, o = {}) {
    const par = o.par || S.par;
    const d = await api('/local/disque?chemin=' + enc(chemin || '') + (fichiers ? '&fichiers=1' : '') + '&par=' + enc(par));
    if (d.error) {
      if (!S.data) return vide('Le disque ne se lit pas', esc(d.error));
      return toast(d.error, 'mal');
    }
    $('vide').hidden = true;
    S.data = d; S.chemin = d.chemin; S.fichiers = !!d.fichiers; S.sel = ''; S.fiche = null; S.survol = ''; S.charge = Date.now();
    S.groupe = o.groupe && d.groupes && d.groupes.some(g => g.id === o.groupe) ? o.groupe : '';
    if (d.mode === 'carte' && !d.enfants.length) vide('Aucun domaine pour l’instant', 'Les domaines se règlent dans <code>systeme/metadonnees.md</code>. La skill <code>installation</code> les crée avec toi.');
    tout(dir);
    if (o.sel) choisir(o.sel);
  }
  function tout(dir) { dessineDisque(dir); dessineGuide(); dessineCote(); dessinePanneau(); annonce(); }
  const vue = () => !S.data ? '' : S.data.mode === 'index' ? (S.groupe ? 'groupe' : 'index') : S.data.mode;
  const groupe = () => S.data && S.data.groupes ? S.data.groupes.find(g => g.id === S.groupe) : null;
  const dans = id => S.data.liste.filter(f => f.g === id);
  function ouvreGroupe(id) { S.groupe = id; S.sel = ''; S.fiche = null; S.survol = ''; tout('bas'); }
  function monter() {
    if (!S.data) return;
    if (S.groupe) { S.groupe = ''; S.sel = ''; S.fiche = null; S.survol = ''; return tout('haut'); }
    const fil = S.data.fil; if (fil.length < 2) return;
    const p = fil[fil.length - 2]; va(p.chemin, !!p.fichiers, 'haut');
  }
  function changePar(id) { S.par = id; store.set('par', id); va(S.chemin, S.fichiers, '', { par: id }); }
  /* the address keeps the level, its cut and its group: the shell writes it in its own address, the page alone in its own */
  function annonce() {
    const q = [];
    if (S.fichiers) q.push('fichiers');
    if (S.data && S.data.mode === 'index' && S.data.par !== 'mois') q.push('par=' + enc(S.data.par));
    if (S.groupe) q.push('groupe=' + enc(S.groupe));
    const h = S.chemin || q.length ? 'disque/' + S.chemin.split('/').map(enc).join('/') + (q.length ? '?' + q.join('&') : '') : '';
    if (embedded) parent.postMessage({ type: 'disque-copy-chemin', hash: h }, '*');
    else history.replaceState(null, '', h ? '#' + h : location.pathname);
  }
  function lisAdresse(h) {
    const m = /^disque\/([^?]*)(?:\?(.*))?$/.exec(String(h || '').replace(/^#/, '')), o = { chemin: '', fichiers: false, par: '', groupe: '' };
    if (!m) return o;
    try { o.chemin = decodeURIComponent(m[1]).replace(/\/+$/, ''); } catch (_) { }
    (m[2] || '').split('&').forEach(x => { const [k, v = ''] = x.split('='); let val = ''; try { val = decodeURIComponent(v); } catch (_) { } if (k === 'fichiers') o.fichiers = true; if (k === 'par') o.par = val; if (k === 'groupe') o.groupe = val; });
    return o;
  }
  /* a file of the workspace, from a search or a link: its index, its slice chosen */
  function ouvreFichier(chemin) { va(dirOf(chemin), true, 'bas', { sel: chemin }); }
  function vide(titre, texte) { $('vide').hidden = false; $('vide-titre').textContent = titre; $('vide-texte').innerHTML = texte || ''; }

  /* ---------------------------- the disc ---------------------------- */
  /* the whole disc is rebuilt on a level change (with its entrance); hovering only redraws the layers */
  function dessineDisque(dir) {
    const d = S.data; if (!d) return;
    const r = scene.getBoundingClientRect(), v = vue();
    /* the disc sits a little right of and below the middle, clear of the guide (top left) and the corner boxes (top right) */
    const decale = Math.min(50, r.width * 0.05), cx = r.width / 2 + decale, cy = r.height / 2 + 16;
    S.place = Math.max(120, Math.min(r.width / 2 - decale - 16, r.height / 2 - 24));
    S.k = Math.max(0.42, Math.min(1.2, S.place / (v === 'groupe' ? 400 : 340)));
    scene.style.setProperty('--halo', rgb(d.mode === 'carte' ? '#2EE6C9' : couleurIci()));
    const monde = el('div', 'disque-monde ' + (dir || '')); monde.style.left = cx + 'px'; monde.style.top = cy + 'px';
    const cible = el('div', 'disque-cible'), R = RMAX * S.k;
    cible.style.width = cible.style.height = 2 * R + 'px'; cible.style.left = cible.style.top = -R + 'px';
    cible.addEventListener('pointermove', e => survole(vise(e, cible)));
    cible.addEventListener('pointerleave', () => survole(null));
    cible.addEventListener('click', e => { const t = vise(e, cible); if (t) t.aller(); });
    const calques = el('div', 'calques');
    monde.append(cible, calques);
    $('disque-hote').replaceChildren(monde);
    dessineCalques();
  }
  function vise(e, cible) {
    const b = cible.getBoundingClientRect(), x = e.clientX - b.left - b.width / 2, y = e.clientY - b.top - b.height / 2;
    const d = Math.hypot(x, y) * RMAX * 2 / b.width, a = mod(Math.atan2(x, -y) * 180 / Math.PI);
    return S.cibles.find(t => d >= t.r0 && d <= t.r1 && a >= t.a0 && a <= t.a1) || null;
  }
  function survole(t) {
    const k = t ? t.cle : '';
    const c = document.querySelector('.disque-cible'); if (c) c.classList.toggle('vise', !!t);
    $('survol').hidden = !t; if (t) $('survol').textContent = t.info;
    if (k === S.survol) return;
    S.survol = k; dessineCalques();
  }
  const couleurIci = () => { const g = groupe(); return (g && g.couleur) || S.data.couleur || '#9DB0AC'; };
  function dessineCalques() {
    const d = S.data, L = document.querySelector('.calques'); if (!d || !L) return;
    L.replaceChildren(); S.cibles = [];
    const k = S.k, sv = S.survol;
    const cible = (r0, r1, g, cle, aller, info) => S.cibles.push({ r0, r1, a0: g.a0, a1: g.a1, cle, aller, info });
    /* a ring of coloured parts: a conic gradient, cut into a crown by a mask; a part that crosses the top is cut in two */
    const anneau = (segs, r0, r1) => {
      const s = segs.reduce((o, g) => { const a0 = mod(g.a0), a1 = a0 + (g.a1 - g.a0); return o.concat(a1 > 360.001 ? [{ a0, a1: 360, c: g.c }, { a0: 0, a1: a1 - 360, c: g.c }] : [{ a0, a1: Math.min(a1, 360), c: g.c }]); }, []).sort((x, y) => x.a0 - y.a0);
      const e = el('div', 'couronne'), R = r1 * k;
      e.style.width = e.style.height = 2 * R + 'px'; e.style.left = e.style.top = -R + 'px';
      e.style.background = 'conic-gradient(' + ['transparent 0deg'].concat(s.map(g => `transparent ${g.a0.toFixed(2)}deg, ${g.c} ${g.a0.toFixed(2)}deg ${g.a1.toFixed(2)}deg, transparent ${g.a1.toFixed(2)}deg`)).concat(['transparent 360deg']).join(', ') + ')';
      const m = `radial-gradient(circle, transparent ${(r0 * k).toFixed(1)}px, #000 ${(r0 * k + 0.6).toFixed(1)}px)`;
      e.style.webkitMask = m; e.style.mask = m; L.append(e);
    };
    const action = f => e => { e.stopPropagation(); f(); };
    /* a name shows on its part only when it fits there; the others show when hovered */
    const tient = (texte, r, span) => span * Math.PI / 180 * r * k >= texte.length * 6.8 + 12;
    /* a label on its part, centred, or anchored beside the disc on the side it points to */
    const etiquette = (texte, r, a, cls, f, titre, cote) => {
      const b = el('button', 'etq ' + (cls || '')), [x, y] = pt(r, a); b.type = 'button'; b.textContent = texte; b.title = titre || texte;
      b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.transform = cote ? (mod(a) <= 180 ? 'translate(0,-50%)' : 'translate(-100%,-50%)') : 'translate(-50%,-50%)';
      if (f) b.addEventListener('click', action(f)); else b.style.cursor = 'default';
      L.append(b);
    };
    /* a label that radiates from the centre; on the left it turns round to stay readable */
    const rayon = (texte, r, a, w, cls, f, titre) => {
      a = mod(a); const droite = a <= 180, [x, y] = pt(r, a), e = el('div', 'rayon ' + (cls || '')), s = el('span');
      e.style.width = w + 'px'; e.style.left = (droite ? x : x - w) + 'px'; e.style.top = (y - 8) + 'px';
      e.style.transformOrigin = droite ? '0 8px' : w + 'px 8px'; e.style.transform = `rotate(${(droite ? a - 90 : a + 90).toFixed(1)}deg)`; e.style.textAlign = droite ? 'left' : 'right';
      s.textContent = texte; s.title = titre || texte; if (f) s.addEventListener('click', action(f));
      e.append(s); L.append(e);
    };
    const point = (r, a, t, c) => { const [x, y] = pt(r, a), e = el('span', 'point'); e.style.width = e.style.height = t + 'px'; e.style.left = (x - t / 2) + 'px'; e.style.top = (y - t / 2) + 'px'; e.style.background = c; e.style.boxShadow = '0 0 8px ' + c; L.append(e); };
    const centre = (nom, sous, couleur, f, titre) => {
      const b = el('button', 'disque-centre' + (f ? '' : ' carte')), R = 70 * k, c = rgb(couleur);
      b.type = 'button'; b.title = titre; b.style.width = b.style.height = 2 * R + 'px'; b.style.left = b.style.top = -R + 'px';
      b.style.border = `1px solid rgba(${c},.6)`; b.style.background = `radial-gradient(circle at 35% 30%, rgba(255,255,255,.32), rgba(${c},.5) 45%, rgba(${c},.16))`; b.style.boxShadow = `0 0 40px rgba(${c},.45)`;
      b.innerHTML = `<b>${esc(nom)}</b><small>${esc(sous)}</small>`;
      if (f) b.addEventListener('click', action(f));
      L.append(b);
    };
    const v = vue();
    if (v === 'carte') {
      centre('AGENTS.md', nbFichiers(d.total), '#F2FBF9', null, 'La carte de ton AIOS');
      const E = d.enfants, pd = parts(E.map(e => e.n), 0, 360, E.length > 1 ? 1.6 : 0, Math.min(24, 300 / Math.max(1, E.length)));
      const maxSem = Math.max(5, ...E.map(e => Math.max(0, ...e.parts.map(x => x.semaine))));
      const sD = [], sI = [], sA = [];
      E.forEach((e, i) => {
        const g = pd[i], on = sv === e.chemin, entrer = () => va(e.chemin, false, 'bas');
        sD.push({ a0: g.a0, a1: g.a1, c: rgba(e.couleur, on ? 0.88 : 0.62) });
        cible(76, 150, g, e.chemin, entrer, e.nom + ' · ' + nbFichiers(e.n) + ' · ' + pluriel(e.parts.length, 'index', 'index'));
        etiquette(e.nom, 113, g.am, '', entrer, 'Entrer dans ' + e.nom);
        const pi = parts(e.parts.map(x => x.n), g.a0, g.a1, e.parts.length > 1 ? 0.8 : 0, Math.min(5, g.span / Math.max(1, e.parts.length) * 0.6));
        e.parts.forEach((x, j) => {
          const h = pi[j], cle = 'p:' + x.chemin + (x.fichiers ? '?' : ''), on2 = sv === cle || on, aller = () => va(x.chemin, !!x.fichiers, 'bas');
          sI.push({ a0: h.a0, a1: h.a1, c: rgba(e.couleur, on2 ? 0.55 : 0.28) });
          sA.push({ a0: h.a0, a1: h.a1, c: rgba(e.couleur, (0.1 + 0.85 * Math.min(1, x.semaine / maxSem)).toFixed(2)) });
          cible(156, 258, h, cle, aller, x.nom + ' · ' + nbFichiers(x.n) + ' · ' + x.semaine + ' cette semaine');
          cible(262, 292, h, cle, aller, x.nom + ' · ' + pluriel(x.semaine, 'fichier touché', 'fichiers touchés') + ' cette semaine');
          if (tient(x.nom, 207, h.span) || on2) etiquette(x.nom, 207, h.am, 'index' + (on2 ? ' on' : ''), aller, 'Entrer dans ' + x.nom);
        });
      });
      anneau(sD, 76, 150); anneau(sI, 156, 258); anneau(sA, 264, 290);
    } else if (v === 'dossiers') {
      centre(d.centre.nom, nbFichiers(d.total) + ' · ↑ remonter', d.couleur, monter, 'Remonter d’un niveau');
      const E = d.enfants, pi = parts(E.map(e => e.n), 0, 360, E.length > 1 ? 1.4 : 0, Math.min(20, 300 / Math.max(1, E.length))), s1 = [], s2 = [];
      E.forEach((e, i) => {
        const g = pi[i], cle = e.chemin + (e.fichiers ? '?' : ''), on = sv.split('#')[0] === cle, entrer = () => va(e.chemin, !!e.fichiers, 'bas');
        s1.push({ a0: g.a0, a1: g.a1, c: rgba(d.couleur, on ? 0.85 : 0.58) });
        cible(76, 165, g, cle, entrer, e.nom + ' · ' + nbFichiers(e.n) + (e.resume ? ' · ' + e.resume : ''));
        if (tient(e.nom, 121, g.span) || on) etiquette(e.nom, 121, g.am, 'mono', entrer, 'Entrer dans ' + e.nom);
        const q = [[e.semaine, 'touchés cette semaine', 0.95], [e.mois, 'touchés ce mois-ci', 0.5], [e.ancien, 'plus anciens', 0.15]], f = parts(q.map(x => x[0]), g.a0, g.a1, 0, 0);
        q.forEach((x, j) => { if (!x[0]) return; s2.push({ a0: f[j].a0, a1: f[j].a1, c: rgba(d.couleur, x[2]) }); cible(171, 268, f[j], cle + '#' + j, entrer, e.nom + ' · ' + nbFichiers(x[0]) + ' ' + x[1]); });
      });
      anneau(s1, 76, 165); anneau(s2, 171, 268);
    } else if (v === 'index') {
      centre(d.centre.nom, nbFichiers(d.total) + ' · ↑ remonter', d.couleur, monter, 'Remonter d’un niveau');
      const G = d.groupes, pp = parts(G.map(g => g.n), 0, 360, G.length > 1 ? 1.4 : 0, Math.min(12, 300 / Math.max(1, G.length))), s1 = [], s2 = [];
      G.forEach((g, i) => {
        const h = pp[i], vif = Math.max(0.25, 0.95 - i * 0.1), c = g.couleur || d.couleur, on = sv === 'g:' + g.id, entrer = () => ouvreGroupe(g.id);
        s1.push({ a0: h.a0, a1: h.a1, c: rgba(c, on ? 1 : g.couleur ? 0.75 : vif) });
        cible(76, 150, h, 'g:' + g.id, entrer, g.nom + ' · ' + nbFichiers(g.n) + ' : clique pour les voir nommés');
        if (tient(g.nom, 113, h.span) || on) etiquette(g.nom, 113, h.am, '', entrer, nbFichiers(g.n));
        const fs = dans(g.id), pas = h.span / Math.max(1, fs.length);
        fs.forEach((f, j) => {
          const a0 = h.a0 + j * pas, ici = f.chemin === S.sel;
          s2.push({ a0, a1: a0 + pas * (pas > 2.4 ? 0.85 : 1), c: ici ? 'rgba(255,255,255,.95)' : rgba(c, sv === f.chemin ? 1 : ((j % 2 ? 0.5 : 0.3) * (0.55 + (g.couleur ? 0.7 : vif) * 0.5)).toFixed(2)) });
          S.cibles.push({ r0: 156, r1: 268, a0, a1: a0 + pas, cle: f.chemin, aller: () => choisir(f.chemin), info: f.titre + ' · ' + g.nom });
          if (ici) etiquette(f.titre, 282, a0 + pas / 2, 'fichier', null, f.chemin, true);
        });
      });
      anneau(s1, 76, 150); anneau(s2, 156, 268);
    } else if (v === 'groupe') {
      const g = groupe(), c = g.couleur || d.couleur, fs = dans(g.id), nommes = fs.slice(0, NOMMES), reste = fs.length - nommes.length;
      centre(g.nom, nbFichiers(g.n) + ' · ↑ remonter', c, monter, 'Remonter à ' + d.centre.nom);
      const fin = 270, finNommes = reste ? 250 : fin, w = Math.round(Math.max(90, Math.min(170, S.place - 240 * k - 8)));
      const pf = parts(nommes.map(() => 1), 0, finNommes, nommes.length > 1 ? 0.5 : 0, 0.5), s = [];
      nommes.forEach((f, j) => {
        const h = pf[j], ici = f.chemin === S.sel, on = sv === f.chemin, prendre = () => choisir(f.chemin);
        s.push({ a0: h.a0, a1: h.a1, c: rgba(c, ici ? 0.98 : on ? 0.8 : j % 2 ? 0.5 : 0.36) });
        cible(76, 226, h, f.chemin, prendre, f.titre + ' · ' + taille(f.taille) + ' · ' + depuis(f.d));
        rayon(f.titre, 240, h.am, w, ici || on ? 'on' : '', prendre, f.chemin);
        point(232, h.am, ici ? 6 : 3, rgba(c, 0.9));
      });
      if (reste) {
        const h = { a0: finNommes + 1, a1: fin, am: (finNommes + 1 + fin) / 2 }, voir = () => { document.body.classList.add('grand'); dessinePanneau(); };
        s.push({ a0: h.a0, a1: h.a1, c: rgba(c, 0.1) });
        cible(76, 226, h, 'reste', voir, '… et ' + reste + ' autres : toute la liste dans le panneau');
        etiquette('+ ' + reste, 150, h.am, 'pale', voir, 'Toute la liste dans le panneau');
      }
      const autres = d.groupes.filter(x => x.id !== g.id), pa = parts(autres.map(() => 1), fin + 6, 356, autres.length > 1 ? 0.8 : 0, 1);
      autres.forEach((x, j) => {
        const h = pa[j], on = sv === 'g:' + x.id, aller = () => ouvreGroupe(x.id);
        s.push({ a0: h.a0, a1: h.a1, c: rgba(x.couleur || d.couleur, on ? 0.45 : 0.13) });
        cible(76, 226, h, 'g:' + x.id, aller, x.nom + ' · ' + nbFichiers(x.n));
        if (h.a1 - h.a0 >= 5 || on) rayon(x.nom, 160, h.am, 66, 'groupe' + (on ? ' on' : ''), aller, nbFichiers(x.n));
      });
      anneau(s, 76, 226);
    }
  }

  /* ---------------------------- the guide, the corner, the legend ---------------------------- */
  function dessineGuide() {
    const d = S.data, v = vue(), g = groupe(), fil = d.fil.concat(g ? [{ nom: g.nom, groupe: true }] : []), n = fil.length;
    const parent = n > 1 ? fil[n - 2] : null;
    $('monter').hidden = !parent;
    if (parent) $('monter-texte').textContent = 'Revenir à ' + (g ? d.centre.nom : parent.chemin ? parent.nom : 'la carte');
    const cr = CRIT[d.par] || CRIT.mois;
    $('niveau-nom').textContent = 'Niveau ' + n + ' · ' + { carte: 'la carte', dossiers: 'un dossier', index: 'un index', groupe: 'un groupe' }[v];
    $('niveau-titre').textContent = v === 'carte' ? 'Ton AIOS, en parts' : v === 'dossiers' ? d.centre.nom + ' : ses index' : v === 'index' ? d.centre.nom + ' : ses fichiers, par ' + cr.bas : d.centre.nom + ' · ' + g.nom;
    $('niveau-aide').textContent = v === 'carte' ? 'Autour d’AGENTS.md : tes domaines, leurs index et, au bord, l’activité de la semaine. Chaque part pèse son nombre de fichiers : clique-la pour zoomer.'
      : v === 'dossiers' ? 'Dedans, ses index. Dehors, leur fraîcheur : cette semaine, ce mois-ci, plus ancien. Clique un index pour y entrer.'
      : v === 'index' ? 'Dedans, ' + cr.les + '. Dehors, une tranche par fichier : survole pour lire son nom, clique pour le lire. Clique un groupe pour les voir tous, nommés.'
      : 'Tous ses fichiers, nommés' + (g.n > NOMMES ? ' (les ' + NOMMES + ' plus récents)' : '') + '. En haut à gauche, les autres groupes.';
    const teinte = couleurIci();
    $('echelle').innerHTML = fil.map((f, i) => {
      const ici = i === n - 1;
      return `<button type="button" data-niveau="${i}"${ici ? ' aria-current="step"' : ''} style="color:${ici ? '#E6F1EF' : '#9DB0AC'}"><span class="pt" aria-hidden="true"><i style="color:${i === 0 ? '#F2FBF9' : teinte}"></i></span><span class="num">${i + 1}</span>${esc(i === 0 ? 'La carte' : f.nom)}</button>`;
    }).join('');
    $('legende').innerHTML = v === 'carte' ? d.enfants.filter(e => e.domaine).map(e => `<span><i style="background:${e.couleur};box-shadow:0 0 6px ${e.couleur}"></i>${esc(e.nom)}</span>`).join('') + '<span class="aide">· centre = AGENTS.md · 1er anneau = domaines · 2e = index · bord = activité de la semaine</span>'
      : v === 'dossiers' ? '<span class="aide">dedans = index · dehors = fraîcheur (vif = cette semaine)</span>'
      : v === 'index' ? `<span class="aide">dedans = ${esc(cr.les)} · dehors = une tranche par fichier</span>` : '<span class="aide">une part = un fichier · coin pâle = les autres groupes</span>';
  }
  function dessineCote() {
    const d = S.data, v = vue();
    $('decoupe').hidden = v !== 'index';
    if (v === 'index') {
      $('decoupes').innerHTML = d.criteres.map(c => `<button type="button" data-par="${esc(c.id)}" aria-pressed="${c.id === d.par}" title="Découper par ${esc((CRIT[c.id] || {}).bas || c.nom)} : ${pluriel(c.n, 'groupe', 'groupes')}">${esc(c.nom)}</button>`).join('');
      $('decoupe-note').hidden = !d.inutiles.length;
      $('decoupe-note').textContent = d.inutiles.length ? 'Pas utile ici : ' + d.inutiles.join(', ') + ' (un seul groupe).' : '';
    }
  }
  $('decoupes').addEventListener('click', e => { const b = e.target.closest('button[data-par]'); if (b && b.getAttribute('aria-pressed') !== 'true') changePar(b.dataset.par); });

  /* ---------------------------- the panel ---------------------------- */
  function dessinePanneau() {
    const d = S.data, p = $('panneau'), v = vue(); if (!d) return;
    if (S.fiche) return C.dessineFiche(p, S.fiche, couleurIci(), S.groupe ? '← Le groupe' : '← Les groupes');
    const grand = document.body.classList.contains('grand'), c = d.centre;
    const finderBtn = chemin => `<button type="button" class="btn" data-finder="${esc(chemin)}">Ouvrir dans le Finder</button>`;
    if (v === 'carte') {
      p.innerHTML = tete('AGENTS.md', 'Ton AIOS', [{ t: 'la carte', c: '#2EE6C9' }, { t: nbFichiers(d.total) }])
        + `<p class="p-resume">${pluriel(d.enfants.length, 'domaine ou dossier', 'domaines et dossiers')}, ${fmtN(d.total)} fichiers. Clique une part pour zoomer dessus : un fichier n’a son nom que dans son index.</p>`
        + `<div class="p-liste"><span class="etiquette">Les domaines et les dossiers</span>${d.enfants.map((e, i) => ligne({ nom: e.nom, sous: e.resume || pluriel(e.parts.length, 'index', 'index'), n: fmtN(e.n), couleur: e.couleur, attr: `data-enfant="${i}"` })).join('')}</div>`
        + (d.liens.length ? `<div class="p-liste"><span class="etiquette">Les liens les plus forts</span>${d.liens.map((l, i) => ligne({ nom: l.a.nom + ' ↔ ' + l.b.nom, sous: 'Les fichiers de l’un citent ceux de l’autre', n: pluriel(l.n, 'lien', 'liens'), couleur: l.a.couleur, attr: `data-lien-i="${i}"` })).join('')}</div>` : '')
        + `<div class="p-actions"><button type="button" class="btn primaire" data-edit="AGENTS.md">Ouvrir AGENTS.md</button>${finderBtn('AGENTS.md')}</div>`;
      return;
    }
    const actions = `<div class="p-actions">${c.routeur ? `<button type="button" class="btn primaire" data-edit="${esc(c.routeur)}">Ouvrir le routeur</button>` : c.index ? `<button type="button" class="btn primaire" data-edit="${esc(c.index)}">Lire l’index</button>` : ''}${finderBtn(d.chemin)}</div>`;
    if (v === 'dossiers') {
      p.innerHTML = tete(c.routeur || c.index || d.chemin + '/', c.nom, [{ t: c.routeur ? 'domaine' : 'dossier', c: d.couleur }, { t: nbFichiers(d.total) }, { t: pluriel(d.enfants.length, 'index', 'index') }])
        + `<p class="p-resume">${esc(c.resume || 'Ses fichiers sont rangés dans ' + pluriel(d.enfants.length, 'index', 'index') + '. Clique un index pour y entrer.')}</p>`
        + `<div class="p-liste"><span class="etiquette">Ses index</span>${d.enfants.map((e, i) => ligne({ nom: e.nom, sous: e.resume || (e.semaine ? e.semaine + ' touchés cette semaine' : 'Rien de neuf cette semaine'), n: fmtN(e.n), couleur: d.couleur, attr: `data-enfant="${i}"` })).join('')}</div>`
        + (d.liens.length ? `<div class="p-liste"><span class="etiquette">Ses liens vers le reste</span>${d.liens.map((l, i) => ligne({ nom: l.nom, sous: l.chemin, n: pluriel(l.n, 'lien', 'liens'), couleur: l.couleur, attr: `data-lien-i="${i}"` })).join('')}</div>` : '') + actions;
      return;
    }
    const cr = CRIT[d.par] || CRIT.mois, crNom = (d.criteres.find(x => x.id === d.par) || {}).nom || 'Mois';
    if (v === 'index') {
      p.innerHTML = tete(c.index || d.chemin + '/', c.nom, [{ t: 'index', c: d.couleur }, { t: nbFichiers(d.total) }, { t: 'par ' + cr.bas }])
        + `<p class="p-resume">${esc((c.resume ? c.resume + '. ' : '') + 'Découpé par ' + cr.bas + ' : clique un groupe pour voir tous ses fichiers, nommés.')}</p>`
        + `<div class="p-liste"><span class="etiquette">${esc(cr.liste)}</span>${d.groupes.map(g => ligne({ nom: g.nom, sous: dans(g.id).slice(0, 2).map(f => f.titre).join(' · '), n: fmtN(g.n), couleur: g.couleur || d.couleur, attr: `data-groupe="${esc(g.id)}"` })).join('')}</div>` + actions;
      return;
    }
    const g = groupe(), fs = dans(g.id), vus = fs.slice(0, grand ? fs.length : 8), reste = fs.length - vus.length;
    p.innerHTML = tete(d.chemin + '/', c.nom + ' · ' + g.nom, [{ t: crNom.toLowerCase(), c: g.couleur || d.couleur }, { t: nbFichiers(g.n) }])
      + `<p class="p-resume">${esc(nbFichiers(g.n) + ' de ' + c.nom + ', ' + cr.bas + ' : ' + g.nom + '. Les plus récents d’abord.')}</p>`
      + `<div class="p-liste"><span class="etiquette">Ses fichiers</span>${vus.map(f => ligne({ nom: f.titre, sous: f.resume || f.chemin.split('/').pop(), n: taille(f.taille), couleur: g.couleur || d.couleur, ici: f.chemin === S.sel, attr: `data-fichier="${esc(f.chemin)}"` })).join('')}${reste > 0 ? `<span class="p-reste">… et ${reste} autres${grand ? '' : ' (Agrandir pour les voir)'}</span>` : ''}</div>`
      + `<div class="p-actions">${finderBtn(d.chemin)}<button type="button" class="btn discret" data-remonte>← Les groupes</button></div>`;
  }
  async function choisir(chemin) {
    S.sel = chemin; dessineCalques();
    const f = await C.fiche(chemin);
    if (S.sel !== chemin) return;
    if (f.error) { S.fiche = null; toast(f.error, 'mal'); return dessinePanneau(); }
    S.fiche = f; dessinePanneau();
  }
  $('panneau').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const ds = b.dataset, d = S.data;
    if ('grand' in ds) { document.body.classList.toggle('grand'); setTimeout(() => dessineDisque(''), 260); return dessinePanneau(); }
    if (ds.enfant !== undefined) { const x = d.enfants[Number(ds.enfant)]; return va(x.chemin, !!x.fichiers, 'bas'); }
    if (ds.groupe !== undefined) return ouvreGroupe(ds.groupe);
    if (ds.lienI !== undefined) { const l = d.liens[Number(ds.lienI)]; return va(l.a ? l.a.chemin : l.chemin, false, 'bas'); }
    if (ds.fichier) return choisir(ds.fichier);
    if (ds.edit) return C.ouvrirFichier(ds.edit);
    if (ds.finder) return finder(ds.finder);
    if ('liste' in ds) { S.fiche = null; S.sel = ''; dessineCalques(); return dessinePanneau(); }
    if ('remonte' in ds) return monter();
    if (ds.lien) return /\.[a-z0-9]+$/i.test(ds.lien) ? ouvreFichier(ds.lien) : va(ds.lien, false, 'bas');
  });

  /* ---------------------------- gestures ---------------------------- */
  $('echelle').addEventListener('click', e => {
    const b = e.target.closest('button[data-niveau]'); if (!b || b.getAttribute('aria-current')) return;
    const i = Number(b.dataset.niveau), fil = S.data.fil;
    if (S.groupe && i === fil.length - 1) return monter();
    const f = fil[i]; va(f.chemin, !!f.fichiers, 'haut');
  });
  $('monter').onclick = monter;
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('grand')) { document.body.classList.remove('grand'); dessinePanneau(); setTimeout(() => dessineDisque(''), 260); return; }
    monter();
  });
  let attente = 0;
  addEventListener('resize', () => { clearTimeout(attente); attente = setTimeout(() => dessineDisque(''), 200); });
  addEventListener('message', e => {
    if (e.source !== parent || !e.data || e.data.type !== 'disque-copy') return;
    const m = e.data;
    if (m.action === 'monter') monter();
    if (m.action === 'ouvrir') { if (m.fichier) ouvreFichier(m.fichier); else va(m.chemin || '', !!m.fichiers, 'bas'); }
    /* back on the tab: the workspace may have changed meanwhile */
    if (m.action === 'shown' && S.data && Date.now() - S.charge > 30000) va(S.chemin, S.fichiers, '', { groupe: S.groupe, sel: S.sel });
    if (m.action === 'recharge' && S.data) va(S.chemin, S.fichiers, '', { groupe: S.groupe, sel: S.sel });
  });

  (async () => {
    const a = lisAdresse(location.hash);
    await va(a.chemin, a.fichiers, 'bas', { par: a.par || S.par, groupe: a.groupe });
    if (embedded) parent.postMessage({ type: 'disque-copy-ready' }, '*');
  })();
})();

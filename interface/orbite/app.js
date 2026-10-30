/* SM4RT Orbes 3D: the home page, or /orbite/ on its own.
   The workspace by its indexes, one level at a time, in CSS 3D. The map: AGENTS.md at the centre, the domains and the
   top folders as planets, the skills and the connectors on two outer rings. A click dives into a folder; a folder shows
   its sub-folders, or its files (the 12 most recent named, the others as dust). Four ways back up, all in sight: the
   big button, the ladder of levels, Escape, and the centre. Drag turns the scene; what you look at reads on the right.
   The server counts and sends one level; this page only draws. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-orbite:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-orbite:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  const PITCH = -24;
  const S = { data: null, chemin: '', fichiers: false, sel: '', fiche: null, yaw: 0, pitch: PITCH, bouge: store.get('bouge', true), glisse: null, aGlisse: false, charge: 0 };
  const scene = $('scene');

  /* ---------------------------- server ---------------------------- */
  async function api(url, opts) {
    try {
      const r = await fetch(url, { cache: 'no-store', ...opts });
      let d = {}; try { d = await r.json(); } catch (_) { d = { error: 'Réponse illisible du serveur (' + r.status + ')' }; }
      return { status: r.status, ...d };
    } catch (e) { return { status: 0, error: 'L’OS ne répond pas. Tourne-t-il (node server.js) ?' }; }
  }

  /* ---------------------------- small pieces ---------------------------- */
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
    if (embedded) parent.postMessage({ type: 'orbite-copy-edit', path: chemin }, '*');
    else window.open('/fichiers/?f=' + enc(chemin), '_blank', 'noopener');
  }
  async function finder(chemin) {
    const r = await api('/api/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: chemin, reveal: true }) });
    toast(r.error ? r.error : 'Montré dans le Finder : ' + chemin, r.error ? 'mal' : '');
  }

  /* ---------------------------- going places ---------------------------- */
  async function va(chemin, fichiers, dir, sel) {
    const d = await api('/local/orbite?chemin=' + enc(chemin || '') + (fichiers ? '&fichiers=1' : ''));
    if (d.error) {
      if (!S.data) return vide('La carte ne se lit pas', esc(d.error));
      return toast(d.error, 'mal');
    }
    $('vide').hidden = true;
    S.data = d; S.chemin = d.chemin; S.fichiers = !!d.fichiers; S.sel = ''; S.fiche = null; S.charge = Date.now();
    if (d.mode === 'carte' && !d.enfants.length) vide('Aucun domaine pour l’instant', 'Les domaines se règlent dans <code>systeme/metadonnees.md</code>. La skill <code>installation</code> les crée avec toi.');
    dessineScene(dir); dessineGuide(); dessinePanneau();
    annonce();
    if (sel) choisir(sel);
  }
  function monter() {
    const fil = S.data ? S.data.fil : [];
    if (fil.length < 2) return;
    const p = fil[fil.length - 2];
    va(p.chemin, !!p.fichiers, 'haut');
  }
  /* the address keeps the level: the shell writes it in its own address, the page alone in its own */
  function annonce() {
    const h = S.chemin || S.fichiers ? 'orbite/' + S.chemin + (S.fichiers ? '?fichiers' : '') : '';
    if (embedded) parent.postMessage({ type: 'orbite-copy-chemin', hash: h }, '*');
    else history.replaceState(null, '', h ? '#' + h : location.pathname);
  }
  function lisAdresse(h) {
    const m = /^orbite\/(.*?)(\?fichiers)?$/.exec(decodeURIComponent(String(h || '').replace(/^#/, '')));
    return m ? { chemin: m[1], fichiers: !!m[2] } : { chemin: '', fichiers: false };
  }
  /* a file of the workspace, from a search or a link: its folder, files shown, the file read */
  function ouvreFichier(chemin) { va(dirOf(chemin), true, 'bas', chemin); }
  function vide(titre, texte) { $('vide').hidden = false; $('vide-titre').textContent = titre; $('vide-texte').innerHTML = texte || ''; }

  /* ---------------------------- the 3D scene ---------------------------- */
  function rayon() { const r = scene.getBoundingClientRect(); return Math.max(150, Math.min(r.width * 0.34, r.height * 0.42)); }
  /* a body of the scene: placed on its orbit, then turned back (animation, then drag) so it always faces the screen */
  function astre(o) {
    const n = el('div', 'noeud');
    n.style.transform = `rotateY(${o.a}deg) translateZ(${o.r}px) translateY(${o.y || 0}px) rotateY(${-o.a}deg)`;
    const contre = el('div', 'contre'), face = el('div', 'face'); n.append(contre); contre.append(face);
    const lueur = o.lueur ?? 14, marge = lueur * 2;
    const b = el(o.action ? 'button' : 'span', 'astre ' + (o.classe || ''));
    if (o.action) { b.type = 'button'; b.addEventListener('click', () => { if (!S.aGlisse) o.action(); }); }
    if (o.titre) b.title = o.titre;
    if (o.chemin) b.dataset.chemin = o.chemin;
    b.style.padding = marge + 'px'; b.style.transform = `translate(-50%, -${Math.round(o.t / 2 + marge)}px)`;
    const boule = el('span', 'boule');
    boule.style.width = boule.style.height = o.t + 'px'; boule.style.borderRadius = o.forme || '50%';
    boule.style.background = `radial-gradient(circle at 32% 30%, rgba(255,255,255,.75), ${o.couleur} 38%, ${rgba(o.couleur, 0.35)} 72%, ${rgba(o.couleur, 0.08)})`;
    boule.style.boxShadow = `0 0 ${lueur}px ${rgba(o.couleur, 0.6)}` + (o.choisi ? ', 0 0 0 3px rgba(255,255,255,.85)' : '');
    if (o.opacite) b.style.opacity = o.opacite;
    for (let k = 0; k < (o.lunes || 0); k++) {
      const l = el('span', 'lune'); l.style.left = (50 + 78 * Math.cos(k * 2.1)) + '%'; l.style.top = (50 + 78 * Math.sin(k * 2.1)) + '%';
      l.style.background = o.couleur; l.style.boxShadow = '0 0 6px ' + o.couleur; boule.append(l);
    }
    b.append(boule);
    if (o.nom) { const nm = el('span', 'nom'); nm.innerHTML = '<b>' + esc(o.nom) + '</b>' + (o.sous ? '<small>' + esc(o.sous) + '</small>' : ''); b.append(nm); }
    face.append(b);
    return n;
  }
  function anneau(r, couleur, alpha, style) {
    const a = el('div', 'anneau'); a.style.width = a.style.height = 2 * r + 'px'; a.style.left = a.style.top = -r + 'px';
    a.style.borderColor = rgba(couleur, alpha); a.style.borderStyle = style || 'solid'; return a;
  }
  const poussiere = (nb, couleur, r0, r1, h) => Array.from({ length: Math.min(nb, 80) }, (_, i) => astre({ a: (i * 137.508) % 360, r: r0 + ((i * 37) % 100) / 100 * (r1 - r0), y: (((i * 53) % 100) / 100 - 0.5) * h, t: 4, lueur: 4, couleur, opacite: '0.55' }));
  function dessineScene(dir) {
    const d = S.data; if (!d) return;
    const R = rayon(), hote = $('monde-hote');
    const monde = el('div', 'monde ' + (dir || '')), manuel = el('div', 'manuel'), auto = el('div', 'auto');
    monde.append(manuel); manuel.append(auto);
    const couleur = d.mode === 'carte' ? '#2EE6C9' : d.couleur || '#9DB0AC';
    scene.style.setProperty('--halo', rgb(couleur));
    const corps = [];
    if (d.mode === 'carte') {
      const max = Math.max(1, ...d.enfants.map(e => e.n));
      corps.push(astre({ a: 0, r: 0, t: Math.round(Math.min(110, R * 0.36)), couleur: '#F2FBF9', lueur: 46, nom: 'AGENTS.md', sous: nbFichiers(d.total), classe: 'centre', titre: 'La carte de ton AIOS', action: () => dessinePanneau() }));
      d.enfants.forEach((e, i) => corps.push(astre({ a: i * (360 / d.enfants.length) + 10, r: R, y: (i % 2 ? -1 : 1) * R * 0.06, t: Math.round(30 + 40 * Math.sqrt(e.n / max)), couleur: e.couleur, lueur: 24,
        nom: e.nom, sous: e.index ? fmtN(e.n) + ' · ' + pluriel(e.index, 'dossier', 'dossiers') : nbFichiers(e.n), lunes: Math.min(e.index, 6), titre: 'Entrer dans ' + e.nom, action: () => va(e.chemin, false, 'bas') })));
      d.skills.forEach((k, i) => corps.push(astre({ a: i * (360 / d.skills.length), r: R * 1.33, y: -R * 0.16, t: 10, forme: '3px', lueur: 6, couleur: '#C8D7D4', titre: '/' + k, opacite: '0.8' })));
      d.connecteurs.forEach((k, i) => corps.push(astre({ a: i * (360 / d.connecteurs.length) + 20, r: R * 1.52, y: R * 0.14, t: 14, forme: '4px', lueur: 8, couleur: '#67E8F9', titre: k, opacite: '0.75' })));
      auto.append(anneau(R, '#2EE6C9', 0.22), anneau(R * 1.33, '#C8D7D4', 0.12, 'dashed'), anneau(R * 1.52, '#67E8F9', 0.12, 'dashed'));
    } else {
      const c = d.centre, retour = () => monter();
      corps.push(astre({ a: 0, r: 0, t: d.mode === 'fichiers' ? 76 : 96, forme: d.mode === 'fichiers' ? '18px' : '50%', couleur, lueur: 50, nom: c.nom, sous: fmtN(d.total) + ' fichiers · ↑ clique pour remonter', classe: 'centre', titre: 'Remonter d’un niveau', action: retour }));
      if (d.mode === 'dossiers') {
        const max = Math.max(1, ...d.enfants.map(e => e.n)), deux = d.enfants.length > 10;
        d.enfants.forEach((e, i) => corps.push(astre({ a: i * (360 / d.enfants.length) + 15, r: deux && i % 2 ? R * 1.22 : R, y: (i % 2 ? -1 : 1) * R * 0.07, t: Math.round(22 + 34 * Math.sqrt(e.n / max)), couleur, lueur: 20,
          nom: e.nom, sous: nbFichiers(e.n), lunes: Math.min(e.index, 5), titre: 'Entrer dans ' + e.nom, action: () => va(e.chemin, !!e.fichiers, 'bas') })));
        corps.push(...poussiere(d.total, couleur, R * 1.32, R * 1.55, R * 0.35));
        auto.append(anneau(R, couleur, 0.25), anneau(R * 1.42, couleur, 0.08, 'dashed'));
      } else {
        d.nommes.forEach((f, i) => corps.push(astre({ a: i * (360 / Math.max(d.nommes.length, 1)), r: R, y: ((i % 3) - 1) * R * 0.09, t: 14, forme: '4px', couleur, lueur: 10,
          nom: f.titre, classe: 'fichier', chemin: f.chemin, titre: f.chemin, action: () => choisir(f.chemin) })));
        corps.push(...poussiere(d.reste, couleur, R * 1.3, R * 1.5, R * 0.25));
        auto.append(anneau(R, couleur, 0.25), anneau(R * 1.4, couleur, 0.08, 'dashed'));
      }
    }
    auto.append(...corps);
    hote.replaceChildren(monde);
    marqueChoix();
  }
  /* the chosen file lights up in place: redrawing the scene would replay the entrance */
  function marqueChoix() {
    scene.querySelectorAll('.astre.fichier').forEach(b => {
      const on = b.dataset.chemin === S.sel, boule = b.querySelector('.boule');
      b.classList.toggle('choisi', on);
      boule.style.width = boule.style.height = (on ? 22 : 14) + 'px';
      boule.style.boxShadow = boule.style.boxShadow.replace(/, 0 0 0 3px rgba\(255, ?255, ?255, ?0?\.85\)/, '') + (on ? ', 0 0 0 3px rgba(255,255,255,.85)' : '');
    });
  }
  function applique() {
    scene.style.setProperty('--yaw', S.yaw + 'deg'); scene.style.setProperty('--pitch', S.pitch + 'deg');
    $('recentrer').hidden = Math.round(S.yaw) === 0 && Math.round(S.pitch) === PITCH;
  }

  /* ---------------------------- the guide: back up, the levels, the legend ---------------------------- */
  function dessineGuide() {
    const d = S.data, fil = d.fil, n = fil.length;
    const parent = n > 1 ? fil[n - 2] : null;
    $('monter').hidden = !parent;
    if (parent) $('monter-texte').textContent = 'Revenir à ' + (parent.chemin ? parent.nom : 'la carte');
    $('niveau-nom').textContent = 'Niveau ' + n + ' · ' + (d.mode === 'carte' ? 'la carte' : d.mode === 'dossiers' ? 'un dossier' : 'ses fichiers');
    $('niveau-titre').textContent = d.mode === 'carte' ? 'Ton AIOS, par ses index' : d.centre.nom + (d.mode === 'dossiers' ? ' : ses dossiers' : ' : ses fichiers');
    $('niveau-aide').textContent = d.mode === 'carte' ? 'Glisse pour tourner. Clique une planète pour y entrer.'
      : d.mode === 'dossiers' ? 'Clique un dossier pour y entrer, ou le centre pour remonter.'
      : (d.reste ? 'Les ' + d.nommes.length + ' plus récents, nommés ; la poussière : les ' + d.reste + ' autres. ' : '') + 'Clique un fichier pour le lire à droite.';
    $('echelle').innerHTML = fil.map((f, i) => {
      const ici = i === n - 1;
      return `<button type="button" data-niveau="${i}"${ici ? ' aria-current="step"' : ''} style="color:${ici ? '#E6F1EF' : '#9DB0AC'}"><span class="pt" aria-hidden="true"><i style="color:${i === 0 ? '#F2FBF9' : d.couleur || '#9DB0AC'}"></i></span><span class="num">${i + 1}</span>${esc(i === 0 ? 'La carte' : f.nom)}</button>`;
    }).join('');
    const leg = d.mode === 'carte' ? d.enfants.filter(e => e.domaine).map(e => `<span><i style="background:${e.couleur};box-shadow:0 0 6px ${e.couleur}"></i>${esc(e.nom)}</span>`).join('') + '<span class="aide">· planète = domaine ou dossier · trait = skill · carré bleu = connecteur</span>'
      : d.mode === 'dossiers' ? '<span class="aide">boule = dossier · poussière = ses fichiers</span>' : '<span class="aide">carré = fichier · poussière = les autres</span>';
    $('legende').innerHTML = leg;
  }

  /* ---------------------------- the panel ---------------------------- */
  const ligne = (o) => `<button type="button" class="p-ligne" ${o.attr || ''}${o.ici ? ' aria-current="true"' : ''}><i style="background:${o.couleur};box-shadow:0 0 8px ${o.couleur}"></i><span><b>${esc(o.nom)}</b>${o.sous ? `<small>${esc(o.sous)}</small>` : ''}</span>${o.n ? `<em>${esc(o.n)}</em>` : ''}<span class="fl" aria-hidden="true" style="flex:0 0 auto">›</span></button>`;
  const tete = (chemin, titre, puces) => `<div class="p-tete"><div><span class="p-chemin">${esc(chemin)}</span><h2 class="p-titre">${esc(titre)}</h2></div><button type="button" class="btn petit" data-grand>${document.body.classList.contains('grand') ? '⤡ Réduire' : '⤢ Agrandir'}</button></div><div class="p-puces">${puces.map(p => `<span class="pastille">${p.c ? `<i style="background:${p.c}"></i>` : ''}${esc(p.t)}</span>`).join('')}</div>`;
  function dessinePanneau() {
    const d = S.data, p = $('panneau'); if (!d) return;
    if (S.fiche) return dessineFiche();
    const grand = document.body.classList.contains('grand');
    if (d.mode === 'carte') {
      p.innerHTML = tete('AGENTS.md', 'Ton AIOS', [{ t: 'la carte', c: '#2EE6C9' }, { t: nbFichiers(d.total) }])
        + `<p class="p-resume">${pluriel(d.enfants.length, 'domaine ou dossier', 'domaines et dossiers')}, ${fmtN(d.total)} fichiers. Clique une planète pour y entrer : un fichier n’a son nom que dans son dossier.</p>`
        + `<div class="p-liste"><span class="etiquette">Les domaines et les dossiers</span>${d.enfants.map((e, i) => ligne({ nom: e.nom, sous: e.resume || (e.index ? pluriel(e.index, 'dossier', 'dossiers') : 'Pas de sous-dossier'), n: fmtN(e.n), couleur: e.couleur, attr: `data-enfant="${i}"` })).join('')}</div>`
        + `<div class="p-actions"><button type="button" class="btn primaire" data-edit="AGENTS.md">Ouvrir AGENTS.md</button><button type="button" class="btn" data-finder="AGENTS.md">Ouvrir dans le Finder</button></div>`;
      return;
    }
    const c = d.centre, pucesDossier = [{ t: c.routeur ? 'domaine' : 'dossier', c: d.couleur }, { t: nbFichiers(d.total) }];
    const actions = `<div class="p-actions">${c.routeur ? `<button type="button" class="btn primaire" data-edit="${esc(c.routeur)}">Ouvrir le routeur</button>` : c.index ? `<button type="button" class="btn primaire" data-edit="${esc(c.index)}">Lire l’index</button>` : ''}<button type="button" class="btn" data-finder="${esc(d.chemin)}">Ouvrir dans le Finder</button></div>`;
    if (d.mode === 'dossiers') {
      p.innerHTML = tete(c.index || d.chemin + '/', c.nom, pucesDossier.concat([{ t: pluriel(d.enfants.length, 'dossier', 'dossiers') }]))
        + `<p class="p-resume">${esc(c.resume || 'Ses fichiers sont rangés dans ' + pluriel(d.enfants.length, 'dossier', 'dossiers') + '. Clique un dossier pour y entrer.')}</p>`
        + `<div class="p-liste"><span class="etiquette">Ses dossiers</span>${d.enfants.map((e, i) => ligne({ nom: e.nom, sous: e.resume || (e.index ? pluriel(e.index, 'sous-dossier', 'sous-dossiers') : 'Pas de sous-dossier'), n: fmtN(e.n), couleur: d.couleur, attr: `data-enfant="${i}"` })).join('')}</div>` + actions;
      return;
    }
    const vus = d.liste.slice(0, grand ? d.liste.length : 8), reste = d.total - vus.length;
    p.innerHTML = tete(c.index || d.chemin + '/', c.nom, pucesDossier)
      + `<p class="p-resume">${esc(c.resume || pluriel(d.total, 'fichier', 'fichiers') + ', les plus récents d’abord. Clique un fichier pour le lire.')}</p>`
      + `<div class="p-liste"><span class="etiquette">Dans ce dossier</span>${vus.map(f => ligne({ nom: f.nom, sous: f.resume || f.titre, n: taille(f.taille), couleur: d.couleur, ici: f.chemin === S.sel, attr: `data-fichier="${esc(f.chemin)}"` })).join('')}${reste > 0 ? `<span class="p-reste">… et ${reste} autres${grand ? '' : ' (Agrandir pour les voir)'}</span>` : ''}</div>` + actions;
  }
  async function choisir(chemin) {
    S.sel = chemin; marqueChoix();
    const f = await api('/local/orbite/fichier?chemin=' + enc(chemin));
    if (S.sel !== chemin) return;
    if (f.error) { S.fiche = null; toast(f.error, 'mal'); return dessinePanneau(); }
    S.fiche = f; dessineFiche();
  }
  let blobs = new Map();
  async function image(chemin) {
    if (blobs.has(chemin)) return blobs.get(chemin);
    try { const r = await fetch('/local/files/raw?path=' + enc(chemin), { cache: 'no-store' }); if (!r.ok) return ''; const u = URL.createObjectURL(await r.blob()); blobs.set(chemin, u); return u; } catch (_) { return ''; }
  }
  async function dessineFiche() {
    const f = S.fiche, d = S.data, p = $('panneau'), h = f.entete || {};
    const puces = [h.type ? { t: h.type, c: d.couleur } : { t: f.kind === 'image' ? 'image' : 'fichier', c: d.couleur }].concat(h.statut ? [{ t: h.statut }] : []).concat([{ t: taille(f.taille) + ' · ' + depuis(f.m) }]);
    /* raw HTML in a file is shown as text, never run */
    const md = String(f.extrait || '').replace(/</g, '&lt;');
    const lecture = f.kind === 'image' ? `<img class="p-image" alt="${esc(f.titre)}" data-image="${esc(f.chemin)}">` : f.kind === 'md' || f.kind === 'text' ? `<div class="p-lecture">${window.marked ? marked.parse(md) : '<pre>' + esc(f.extrait) + '</pre>'}${f.coupe ? '<p><em>… la suite dans Fichiers</em></p>' : ''}</div>` : '<p class="p-resume">Pas d’aperçu pour ce type de fichier.</p>';
    const liens = (f.sortants.length || f.entrants.length) ? `<div class="p-liens"><span class="etiquette">Liens · ${f.sortants.length + f.entrants.length}</span>${f.sortants.length ? `<div>${f.sortants.map(x => `<button type="button" class="p-lien${x.existe ? '' : ' absent'}" ${x.existe ? `data-lien="${esc(x.chemin)}"` : 'disabled'} title="${esc(x.chemin)}">→ ${esc(x.texte)}</button>`).join('')}</div>` : ''}${f.entrants.length ? `<div>${f.entrants.map(x => `<button type="button" class="p-lien" data-lien="${esc(x.chemin)}" title="${esc(x.texte)}">← ${esc(x.chemin.split('/').pop())}</button>`).join('')}</div>` : ''}</div>` : '';
    p.innerHTML = tete(f.chemin, f.titre, puces)
      + (h.resume ? `<p class="p-resume">${esc(h.resume)}</p>` : '') + lecture + liens
      + `<div class="p-actions"><button type="button" class="btn primaire" data-edit="${esc(f.chemin)}">Ouvrir dans Fichiers</button><button type="button" class="btn" data-finder="${esc(f.chemin)}">Ouvrir dans le Finder</button><button type="button" class="btn discret" data-liste>← La liste du dossier</button></div>`;
    const img = p.querySelector('[data-image]'); if (img) img.src = await image(f.chemin);
  }
  $('panneau').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const ds = b.dataset, d = S.data;
    if ('grand' in ds) { document.body.classList.toggle('grand'); setTimeout(() => { dessineScene(''); }, 260); return dessinePanneau(); }
    if (ds.enfant !== undefined) { const x = d.enfants[Number(ds.enfant)]; return va(x.chemin, !!x.fichiers, 'bas'); }
    if (ds.fichier) return choisir(ds.fichier);
    if (ds.edit) return ouvrirFichier(ds.edit);
    if (ds.finder) return finder(ds.finder);
    if ('liste' in ds) { S.fiche = null; S.sel = ''; marqueChoix(); return dessinePanneau(); }
    if (ds.lien) return /\.[a-z0-9]+$/i.test(ds.lien) ? ouvreFichier(ds.lien) : va(ds.lien, false, 'bas');
  });

  /* ---------------------------- gestures ---------------------------- */
  $('echelle').addEventListener('click', e => {
    const b = e.target.closest('button[data-niveau]'); if (!b || b.getAttribute('aria-current')) return;
    const f = S.data.fil[Number(b.dataset.niveau)]; va(f.chemin, !!f.fichiers, 'haut');
  });
  $('monter').onclick = monter;
  $('recentrer').onclick = () => { S.yaw = 0; S.pitch = PITCH; applique(); };
  function marqueMouvement() { scene.classList.toggle('fixe', !S.bouge); $('mouvement').setAttribute('aria-pressed', S.bouge); $('mouvement').textContent = 'Mouvement · ' + (S.bouge ? 'oui' : 'non'); }
  $('mouvement').onclick = () => { S.bouge = !S.bouge; store.set('bouge', S.bouge); marqueMouvement(); };
  /* drag turns the scene; a click that ends a drag opens nothing */
  scene.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('#guide,#outils,#legende,#vide')) return;
    S.glisse = { x: e.clientX, y: e.clientY, yaw: S.yaw, pitch: S.pitch }; S.aGlisse = false;
  });
  addEventListener('pointermove', e => {
    const g = S.glisse; if (!g) return;
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!S.aGlisse && Math.abs(dx) + Math.abs(dy) > 9) { S.aGlisse = true; scene.classList.add('glisse'); }
    if (S.aGlisse) { S.yaw = g.yaw + dx * 0.35; S.pitch = borne(g.pitch - dy * 0.3, -72, -8); applique(); }
  });
  const lache = () => { if (!S.glisse) return; S.glisse = null; scene.classList.remove('glisse'); setTimeout(() => { S.aGlisse = false; }, 0); };
  addEventListener('pointerup', lache); addEventListener('pointercancel', lache);
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('grand')) { document.body.classList.remove('grand'); dessinePanneau(); setTimeout(() => dessineScene(''), 260); return; }
    monter();
  });
  let attente = 0;
  addEventListener('resize', () => { clearTimeout(attente); attente = setTimeout(() => dessineScene(''), 200); });
  addEventListener('message', e => {
    if (e.source !== parent || !e.data || e.data.type !== 'orbite-copy') return;
    const m = e.data;
    if (m.action === 'monter') monter();
    if (m.action === 'ouvrir') { if (m.fichier) ouvreFichier(m.fichier); else va(m.chemin || '', !!m.fichiers, 'bas'); }
    /* back on the tab: the workspace may have changed meanwhile */
    if (m.action === 'shown' && S.data && Date.now() - S.charge > 30000) va(S.chemin, S.fichiers, '', S.sel);
    if (m.action === 'recharge' && S.data) va(S.chemin, S.fichiers, '', S.sel);
  });

  (async () => {
    marqueMouvement(); applique();
    const a = lisAdresse(location.hash);
    await va(a.chemin, a.fichiers, 'bas');
    if (embedded) parent.postMessage({ type: 'orbite-copy-ready' }, '*');
  })();
})();

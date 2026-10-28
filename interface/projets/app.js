/* SM4RT Projets: the Second Brain's Projets tab, or /projets/ on its own.
   Left: every project of projets/, the live ones first; the list folds to a narrow rail. Right: one project,
   in two views of the same file. Atelier: what comes in (sources, inbox), what is being done (next step,
   tasks, decisions), what goes out (deliverables), under a timeline of the milestones, dated or not.
   Fiche: the file itself, with what changed since your last reading lit up, beside the project's history.
   Every change here rewrites a line of the Markdown and saves it through /local/files/save, which refuses a
   file that changed on disk since it was read. The last reading of each project stays in this browser. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const fold = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-projets:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-projets:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  const ETATS = [['a-venir', 'à venir'], ['en-cours', 'en cours'], ['a-valider', 'à valider'], ['livre', 'livré']];
  const ETAT_TEXTE = Object.fromEntries(ETATS);
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const S = {
    liste: [], statuts: [], fin: [], filtre: store.get('filtre', 'vivants'), vue: store.get('vue', 'atelier'),
    cur: null, lu: null, vuA: null, changes: null, faites: false, toutes: false, form: '', occupe: false
  };

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
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const jour = s => DATE_RE.test(s || '') ? new Date(s + 'T12:00:00') : null;
  const ecart = (a, b) => Math.round((b - a) / 86400000);
  const court = s => { const d = jour(s); return d ? pad(d.getDate()) + '.' + pad(d.getMonth() + 1) : ''; };
  const long = s => { const d = jour(s); return d ? d.getDate() + ' ' + MOIS[d.getMonth()] : ''; };
  /* the history's own clock: 28.10 09:00, or 26.10 for a day */
  function horodate(iso) {
    if (DATE_RE.test(iso)) return court(iso);
    const d = new Date(iso); return isNaN(d) ? '' : pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  /* the inline Markdown of a task or a decision: code, bold, italics, links (escaped first) */
  function inline(md) {
    let s = esc(md);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>');
    return s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => /^https?:/i.test(u) ? `<a href="${u}" target="_blank" rel="noopener">${t}</a>` : `<a href="#" data-ouvrir="${u}">${t}</a>`);
  }
  const dirOf = p => p.split('/').slice(0, -1).join('/');
  function relatif(cible) {
    /* a path written in the project file, read from the project's folder */
    const parts = (dirOf(S.cur.path) + '/' + cible).split('/'), out = [];
    for (const x of parts) { if (!x || x === '.') continue; if (x === '..') out.pop(); else out.push(x); }
    return out.join('/');
  }
  function ouvrirFichier(chemin) {
    if (!chemin) return;
    if (embedded) parent.postMessage({ type: 'projets-copy-edit', path: chemin }, '*');
    else window.open('/fichiers/?f=' + enc(chemin), '_blank', 'noopener');
  }
  const ouvrirLien = url => window.open(url, '_blank', 'noopener');
  async function copier(texte) {
    try { await navigator.clipboard.writeText(texte); return true; } catch (_) { }
    const t = document.createElement('textarea'); t.value = texte; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.append(t); t.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) { } t.remove(); return ok;
  }
  const propre = s => String(s || '').replace(/[\r\n]+/g, ' ').replace(/\s+·\s+/g, ' - ').trim();

  /* ---------------------------- the last reading of each project ---------------------------- */
  const lectures = () => store.get('lectures', {});
  function noteLecture(path, iso) { const l = lectures(); l[path] = iso; store.set('lectures', l); }
  /* the reading counts when you leave the project: while you look, what changed stays lit */
  function finLecture() { if (S.cur && S.vuA) noteLecture(S.cur.path, S.vuA); }
  addEventListener('pagehide', finLecture);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') finLecture(); });

  /* ---------------------------- the list ---------------------------- */
  const vivant = p => !S.fin.includes(p.statut);
  function rang(p) { const i = S.statuts.indexOf(p.statut); return i < 0 ? 99 : i; }
  function echeanceTexte(p) {
    const d = jour(p.echeance); if (!d) return '';
    const n = ecart(new Date(new Date().setHours(12, 0, 0, 0)), d);
    return n === 0 ? 'aujourd’hui' : n > 0 ? 'J-' + n : 'J+' + (-n);
  }
  async function chargeListe() {
    const r = await api('/local/projets');
    if (r.error) { montreVide('Les projets ne se chargent pas', r.error); return false; }
    S.liste = r.projets || []; S.statuts = r.statuts || []; S.fin = r.fin || [];
    dessineListe();
    return true;
  }
  function dessineListe() {
    const tri = (a, b) => rang(a) - rang(b) || String(a.echeance || '9999').localeCompare(String(b.echeance || '9999')) || a.titre.localeCompare(b.titre, 'fr');
    const vivants = S.liste.filter(vivant).sort(tri), finis = S.liste.filter(p => !vivant(p)).sort((a, b) => String(b.maj).localeCompare(String(a.maj)));
    const item = p => {
      const point = !vivant(p) ? '' : p.statut === 'bloque' ? 'bloque' : 'vivant', av = p.avancement ?? null, ech = echeanceTexte(p);
      return `<button type="button" class="proj" data-path="${esc(p.path)}" aria-current="${S.cur && S.cur.path === p.path}" title="${esc(p.titre + (p.statut ? ' · ' + p.statut : ''))}">
        <span class="proj-haut"><i class="proj-point ${point}"></i><span class="proj-init" aria-hidden="true">${esc((p.titre || '?').trim()[0] || '?')}</span><span class="proj-nom">${esc(p.titre)}</span></span>
        <span class="proj-bas"><span class="proj-barre"><i style="width:${av ?? 0}%"></i></span><span>${av === null ? '—' : av + ' %'}</span>${ech ? `<span>${esc(ech)}</span>` : p.statut && p.statut !== S.statuts[0] ? `<span>${esc(p.statut)}</span>` : ''}</span>
      </button>`;
    };
    let html = '';
    if (!S.liste.length) html = '<p class="groupe etiquette">Aucun projet</p>';
    else if (S.filtre === 'tous') html = (vivants.length ? '<p class="groupe etiquette">En cours</p>' + vivants.map(item).join('') : '') + (finis.length ? '<p class="groupe etiquette">Terminés</p>' + finis.map(item).join('') : '');
    else html = vivants.length ? vivants.map(item).join('') : '<p class="groupe etiquette">Aucun projet en cours</p>';
    $('liste').innerHTML = html;
    document.querySelectorAll('#filtre button').forEach(b => b.setAttribute('aria-pressed', b.dataset.filtre === S.filtre));
  }
  $('liste').addEventListener('click', e => { const b = e.target.closest('.proj'); if (b) ouvre(b.dataset.path); });
  document.querySelectorAll('#filtre button').forEach(b => b.onclick = () => { S.filtre = b.dataset.filtre; store.set('filtre', S.filtre); dessineListe(); });

  function montreVide(titre, texte) {
    $('projet').hidden = true; $('vide').hidden = false;
    $('vide-titre').textContent = titre; $('vide-texte').innerHTML = texte;
  }

  /* ---------------------------- one project ---------------------------- */
  async function ouvre(path, garder = false) {
    if (!path) return;
    if (!garder && S.cur && S.cur.path !== path) finLecture();
    const r = await api('/local/projets/lire?path=' + enc(path));
    if (r.error) { toast(r.error, 'mal'); return; }
    const autre = !S.cur || S.cur.path !== r.path;
    S.cur = r; store.set('dernier', r.path);
    if (autre && !garder) {
      S.lu = lectures()[r.path] || null; S.vuA = new Date().toISOString(); S.faites = false; S.toutes = false; S.form = '';
      if (!S.lu) noteLecture(r.path, S.vuA);
    }
    S.changes = null;
    if (S.lu && r.git) { const c = await api('/local/projets/changements?path=' + enc(r.path) + '&depuis=' + enc(S.lu)); if (!c.error) S.changes = c; }
    if (!embedded) history.replaceState(null, '', '#' + enc(r.path));
    dessine();
    dessineListe();
  }
  function dessine() {
    if (!S.cur) return;
    $('vide').hidden = true; $('projet').hidden = false;
    dessineTete();
    $('atelier').hidden = S.vue !== 'atelier'; $('fiche').hidden = S.vue !== 'fiche';
    document.querySelectorAll('#vues button').forEach(b => b.setAttribute('aria-pressed', b.dataset.vue === S.vue));
    if (S.vue === 'atelier') dessineAtelier(); else dessineFiche();
  }
  function dessineTete() {
    const c = S.cur, p = c.projet, h = p.header;
    $('chemin').textContent = c.path;
    $('enregistre').textContent = h.maj ? '· modifié le ' + long(h.maj) : '';
    const statuts = S.statuts.includes(h.statut) || !h.statut ? S.statuts : [...S.statuts, h.statut];
    $('statut').innerHTML = statuts.map(s => `<option value="${esc(s)}"${s === h.statut ? ' selected' : ''}>${esc(s)}</option>`).join('');
    $('statut').className = 'pastille ' + (S.fin.includes(h.statut) ? '' : h.statut === 'bloque' ? 'attention' : 'ok');
    $('domaine').textContent = h.domaine || 'sans domaine';
    $('echeance').value = DATE_RE.test(h.echeance || '') ? h.echeance : '';
    $('titre').textContent = p.titre || c.slug;
    $('intro').textContent = p.intro || h.resume || '';
  }

  /* ---------------------------- A: the workshop ---------------------------- */
  function tuiles() {
    const p = S.cur.projet, h = p.header, av = p.avancement, faites = p.taches.filter(t => t.fait).length, total = p.taches.length;
    const aValider = p.livrables.filter(l => l.etat === 'a-valider');
    const ech = jour(h.echeance), n = ech ? ecart(new Date(new Date().setHours(12, 0, 0, 0)), ech) : null;
    const seg = Math.min(total, 12), on = total ? Math.round(seg * faites / total) : 0;
    return `<div class="tuiles">
      <div class="panneau trait tuile"><span class="etiquette">Avancement</span><span class="grand">${av === null ? '—' : av}<small>${av === null ? '' : '%'}</small></span><span class="hachures"><i style="width:${av || 0}%"></i></span><span class="sous">${p.jalons.length ? p.jalons.length + ' jalons' : total ? 'd’après les tâches' : 'ni jalon ni tâche'}</span></div>
      <div class="panneau tuile${n !== null && n < 0 ? ' alerte' : ''}"><span class="etiquette">Échéance</span><span class="grand">${n === null ? '—' : n === 0 ? 'J' : n > 0 ? 'J-' + n : 'J+' + (-n)}</span><span class="sous">${ech ? esc(long(h.echeance) + ' ' + ech.getFullYear()) : 'pas d’échéance'}</span></div>
      <div class="panneau tuile"><span class="etiquette">Tâches</span><span class="grand">${faites}<small>/${total}</small></span><span class="segments">${Array.from({ length: seg }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</span></div>
      <div class="panneau tuile${aValider.length ? ' alerte' : ''}"><span class="etiquette">À valider</span><span class="grand">${aValider.length}<small>livrable${aValider.length > 1 ? 's' : ''} sur ${p.livrables.length}</small></span><span class="sous">${esc(aValider.map(l => l.nom).join(', ') || 'rien n’attend')}</span></div>
    </div>`;
  }
  function frise() {
    const p = S.cur.projet, h = p.header, dates = p.jalons.filter(j => j.date && jour(j.date)), sans = p.jalons.filter(j => !jour(j.date));
    const ajout = `<label class="ajout"><span aria-hidden="true">+</span><input data-ajout="jalon" type="text" placeholder="Ajouter un jalon (Entrée)" aria-label="Ajouter un jalon"></label>`;
    if (!p.jalons.length && !jour(h.echeance)) return `<section id="temps" class="panneau trait" aria-label="Ligne du temps"><div class="temps-tete"><span class="etiquette">Ligne du temps</span></div><p class="temps-note">Pas encore de jalons. Ajoute les grandes étapes du projet ; une date est facultative.</p>${ajout}</section>`;
    const auj = new Date(new Date().setHours(12, 0, 0, 0));
    const pts = [...dates.map(j => jour(j.date)), jour(h.cree), jour(h.echeance), auj].filter(Boolean);
    let debut = new Date(Math.min(...pts)), fin = new Date(Math.max(...pts));
    if (fin - debut < 86400000 * 7) fin = new Date(+debut + 86400000 * 7);
    const pos = d => Math.max(0, Math.min(100, 100 * (d - debut) / (fin - debut)));
    const tries = [...dates].sort((a, b) => a.date.localeCompare(b.date));
    const marques = tries.map((j, i) => {
      const x = pos(jour(j.date)), etat = j.fait ? 'fait' : (j.pct || 0) > 0 ? 'encours' : i === tries.length - 1 ? 'fin' : '';
      const place = i % 2 ? 'bas' : 'haut', bord = x > 90 ? ' droite' : x < 8 ? ' gauche' : '';
      const info = j.fait ? 'fait' : j.pct !== null ? j.pct + ' %' : '';
      return `<span class="losange ${etat}" style="left:${x}%"></span><button type="button" class="jalon ${place} ${etat}${bord}" data-jalon="${j.ligne}" style="${bord ? '' : 'left:' + x + '%'}" title="Modifier ce jalon"><span class="mono">${esc(court(j.date))}${info ? ' · ' + esc(info.toUpperCase()) : ''}</span>${esc(j.nom)}</button>`;
    }).join('');
    const xj = pos(auj);
    const flottants = sans.length ? sans.map(j => `<button type="button" class="flottant" data-jalon="${j.ligne}" title="Donner une date, un avancement">${esc(j.nom)}${j.fait ? ' · fait' : j.pct !== null ? ' · ' + j.pct + ' %' : ''} · dater</button>`).join('') : '<span class="temps-note">Tous les jalons ont une date.</span>';
    return `<section id="temps" class="panneau trait" aria-label="Ligne du temps">
      <div class="temps-tete"><span class="etiquette">Ligne du temps</span><span class="etiquette">${esc(court(fmt(debut)))} → ${esc(court(fmt(fin)))}${sans.length ? ` · <span style="color:var(--attention)">${sans.length} jalon${sans.length > 1 ? 's' : ''} sans date</span>` : ''}</span></div>
      <div class="temps-defil"><div class="temps-grille">
        <span class="etiquette">Daté</span>
        <div class="piste"><span class="piste-ligne"></span><span class="piste-fait" style="width:${xj}%"></span><span class="piste-jour" style="left:${xj}%"></span><span class="piste-point" style="left:${xj}%"></span>${marques}${jour(h.echeance) && !tries.some(j => j.date === h.echeance) ? `<span class="losange fin" style="left:${pos(jour(h.echeance))}%" title="Échéance"></span>` : ''}</div>
        <span class="etiquette">Sans date</span>
        <div class="sans-date">${flottants}</div>
        <span></span>
        <div class="axe"><span style="left:0">${esc(court(fmt(debut)))}</span><span style="left:${xj}%;transform:translateX(-50%);color:var(--accent)">AUJOURD’HUI · ${esc(court(today()))}</span><span style="right:0">${esc(court(fmt(fin)))}</span></div>
      </div></div>
      ${ajout}
    </section>`;
  }
  const fmt = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  function genreTexte(x) { return { md: '[MD]', image: '[IMG]', fichier: '[FIC]', lien: '[LIEN]', video: '[VID]', absent: '[?]', texte: '[—]' }[x.genre] || '[—]'; }
  function lienPlat(x, attr) {
    return `<button type="button" class="lien-plat" ${attr} title="${esc(x.chemin || x.url || x.nom)}"><span class="genre ${esc(x.genre)}">${genreTexte(x)}</span><span>${esc(x.nom || x.titre)}</span></button>`;
  }
  function entree() {
    const c = S.cur, p = c.projet, inbox = c.lies.filter(l => l.inbox), autres = c.lies.filter(l => !l.inbox);
    return `<section class="panneau colonne" aria-label="Ce qui entre">
      <div class="col-tete"><span class="num">01</span><h2>Entrée</h2><span class="etiquette">sources · inbox →</span></div>
      ${inbox.length ? `<span class="etiquette">Inbox · ${inbox.length} pour ce projet</span>` + inbox.map(l => `<div class="ligne"><span class="txt"><b>${esc(l.titre)}</b><small>${esc(l.resume || l.chemin)}</small></span><button type="button" class="btn petit mono-btn" data-ouvrir-chemin="${esc(l.chemin)}">Ouvrir</button></div>`).join('') : ''}
      <span class="etiquette">Sources · ${p.sources.length}</span>
      ${p.sources.length ? p.sources.map(x => lienPlat(x, `data-source="${x.ligne}"`)).join('') : '<p class="vide-col">Rien encore. Colle un lien ou le chemin d’un fichier.</p>'}
      ${autres.length ? `<span class="etiquette">Fichiers du projet · ${autres.length}</span>` + autres.map(l => `<button type="button" class="lien-plat" data-ouvrir-chemin="${esc(l.chemin)}" title="${esc(l.chemin)}"><span class="genre">[${esc((l.type || 'md').slice(0, 4).toUpperCase())}]</span><span>${esc(l.titre)}</span></button>`).join('') : ''}
      <label class="ajout"><span aria-hidden="true">+</span><input data-ajout="source" type="text" placeholder="Colle un lien ou un chemin (Entrée)" aria-label="Ajouter une source"></label>
    </section>`;
  }
  function decisionsHtml(liste, max) {
    const tri = [...liste].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return (max ? tri.slice(0, max) : tri).map(d => `<div class="decision"><span class="date">${esc(court(d.date) || '—')}</span><span><b>${inline(d.texte)}</b>${d.pourquoi || d.ecarte ? `<small>${d.pourquoi ? 'pourquoi : ' + inline(d.pourquoi) : ''}${d.pourquoi && d.ecarte ? ' · ' : ''}${d.ecarte ? 'écarté : ' + inline(d.ecarte) : ''}</small>` : ''}</span></div>`).join('');
  }
  function formDecision() {
    return S.form === 'decision' ? `<form class="form" data-form="decision"><input class="champ" name="texte" placeholder="La décision" aria-label="La décision" required><input class="champ" name="pourquoi" placeholder="Pourquoi" aria-label="Pourquoi"><input class="champ" name="ecarte" placeholder="Ce qu’on écarte" aria-label="Ce qu’on écarte"><div class="form-btns"><button type="button" class="btn discret petit" data-annuler>Annuler</button><button class="btn primaire petit">Noter</button></div></form>`
      : `<button type="button" class="btn petit" data-ouvre-form="decision">Noter une décision</button>`;
  }
  function tachesHtml(liste) {
    return liste.map(t => `<label class="tache${t.fait ? ' faite' : ''}"><input type="checkbox" data-tache="${t.ligne}"${t.fait ? ' checked' : ''}><span>${inline(t.texte)}</span></label>`).join('');
  }
  function milieu() {
    const p = S.cur.projet, h = p.header, ouvertes = p.taches.filter(t => !t.fait), faites = p.taches.filter(t => t.fait);
    return `<section class="panneau colonne" aria-label="Ce qui se fait">
      <div class="col-tete"><span class="num">02</span><h2>Atelier</h2><span class="etiquette">la suite · le cadre →</span></div>
      <div class="etape"><span class="etiquette">Prochaine étape</span><p>${h.prochaine_etape ? inline(h.prochaine_etape) : '<span style="opacity:.6">Pas encore écrite</span>'}</p><div class="etape-btns"><button type="button" class="btn primaire petit" data-etape="suite">${h.prochaine_etape ? 'C’est fait, la suite' : 'L’écrire'}</button></div></div>
      <div class="sous-tete"><span class="etiquette">Tâches · ${ouvertes.length} ouverte${ouvertes.length > 1 ? 's' : ''}</span>${faites.length ? `<button type="button" class="btn discret petit mono-btn" data-voir-faites>${S.faites ? 'masquer les faites' : '+ ' + faites.length + ' faite' + (faites.length > 1 ? 's' : '')}</button>` : ''}</div>
      <div>${tachesHtml(ouvertes)}${S.faites ? tachesHtml(faites) : ''}${!p.taches.length ? '<p class="vide-col">Aucune tâche.</p>' : ''}</div>
      <label class="ajout"><span aria-hidden="true">+</span><input data-ajout="tache" type="text" placeholder="Ajouter une tâche (Entrée)" aria-label="Ajouter une tâche"></label>
      <div class="sous-tete"><span class="etiquette">Décisions · ${p.decisions.length}</span>${p.decisions.length > 3 ? `<button type="button" class="btn discret petit mono-btn" data-toutes>${S.toutes ? 'les 3 dernières' : 'toutes'}</button>` : ''}</div>
      <div>${decisionsHtml(p.decisions, S.toutes ? 0 : 3) || '<p class="vide-col">Aucune décision notée.</p>'}</div>
      ${formDecision()}
    </section>`;
  }
  function vignette(x) {
    if (x.genre === 'image') return `<div class="vignette" data-raw="${esc(x.chemin)}" data-m="${x.mtime || 0}" role="img" aria-label="${esc(x.nom)}"></div>`;
    if (x.genre === 'md') return `<p class="extrait"><b>#</b> ${esc(x.titre || x.nom)}<br>${esc(x.extrait || '')}</p>`;
    if (x.genre === 'video') return `<div class="vignette" role="img" aria-label="Vidéo"></div>`;
    return '';
  }
  function livrableHtml(x) {
    const ouvrable = x.genre === 'md' || x.genre === 'image' || x.genre === 'fichier' || x.genre === 'lien' || x.genre === 'video';
    const sous = x.genre === 'lien' || x.genre === 'video' ? x.hote : x.genre === 'absent' ? 'introuvable : ' + x.chemin : x.chemin || x.note || 'pas encore de lien';
    return `<article class="livrable ${esc(x.etat)}">${vignette(x)}
      <div class="livrable-bas"><span class="txt"><b>${esc(x.nom)}</b><small>${esc(sous || '')}</small></span>
      <select class="etat ${esc(x.etat)}" data-etat="${x.ligne}" aria-label="État de ${esc(x.nom)}">${x.etat ? '' : '<option value="" selected>état ?</option>'}${ETATS.map(([k, t]) => `<option value="${k}"${k === x.etat ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
      ${ouvrable || x.etat === 'a-valider' ? `<div class="livrable-btns">${ouvrable ? `<button type="button" class="btn petit" data-livrable="${x.ligne}">Ouvrir</button>` : ''}${x.etat === 'a-valider' ? `<button type="button" class="btn primaire petit" data-valider="${x.ligne}">Valider</button>` : ''}</div>` : ''}
    </article>`;
  }
  function sortie() {
    const p = S.cur.projet;
    return `<section class="panneau colonne" aria-label="Ce qui sort">
      <div class="col-tete"><span class="num">03</span><h2>Sortie</h2><span class="etiquette">livrables · ${p.livrables.length}</span></div>
      ${p.livrables.map(livrableHtml).join('') || '<p class="vide-col">Pas encore de livrable. Un fichier du workspace ou un lien : une vidéo, une page…</p>'}
      <label class="ajout"><span aria-hidden="true">+</span><input data-ajout="livrable" type="text" placeholder="Un fichier, un lien ou un nom (Entrée)" aria-label="Ajouter un livrable"></label>
    </section>`;
  }
  function dessineAtelier() {
    $('atelier').innerHTML = tuiles() + frise() + `<div class="colonnes">${entree()}${milieu()}${sortie()}</div>`;
    images($('atelier'));
  }
  /* the pictures of the workspace come through fetch, which carries the OS token, then stay in memory */
  const blobs = new Map();
  function images(racine) {
    racine.querySelectorAll('[data-raw]').forEach(async el => {
      const cle = el.dataset.raw + '|' + el.dataset.m;
      let url = blobs.get(cle);
      if (!url) {
        try { const r = await fetch('/local/files/raw?path=' + enc(el.dataset.raw), { cache: 'no-store' }); if (!r.ok) return; url = URL.createObjectURL(await r.blob()); blobs.set(cle, url); } catch (_) { return; }
      }
      el.style.backgroundImage = 'url("' + url + '")';
    });
  }

  /* ---------------------------- B: the file ---------------------------- */
  function neuf(ligne) { const c = S.changes; return !!c && (c.tout || (c.lignes || []).includes(ligne)); }
  const bloc = (ligne, html) => `<div class="bloc${neuf(ligne) ? ' neuf' : ''}">${html}${neuf(ligne) ? '<span class="neuf-tag">nouveau</span>' : ''}</div>`;
  function apresLecture(e) {
    if (!S.lu) return false;
    if (DATE_RE.test(e.date)) return e.date > S.lu.slice(0, 10);
    return new Date(e.date) > new Date(S.lu);
  }
  function filHtml() {
    const c = S.cur, nouveaux = c.fil.filter(apresLecture), anciens = c.fil.filter(e => !apresLecture(e));
    const evt = (e, neufs) => {
      const qui = e.source === 'git' ? e.auteur || 'Git' : e.source === 'local' ? 'local' : 'journal';
      const fic = e.fichiers && e.fichiers.length ? (e.fichiers.includes(c.path) ? 'fiche' : e.fichiers[0].split('/').pop()) + (e.fichiers.length > 1 ? ' +' + (e.fichiers.length - 1) : '') : e.source === 'journal' ? 'log' : '';
      return `<div class="evt ${neufs ? 'neuf' : 'vieux'}"><div class="evt-l1"><span class="chev">&gt;</span><span class="quand">[${esc(horodate(e.date))}]</span><span class="qui ${e.source}">${esc(qui.toUpperCase())}</span><span class="tag">[${esc(fic.toUpperCase())}]</span></div><div class="evt-l2">${esc(e.message)}</div></div>`;
    };
    const repere = !S.lu ? '<div class="repere"><i></i>PREMIÈRE VISITE · LE FIL MARQUE CE QUI CHANGE À PARTIR D’ICI<i></i></div>'
      : nouveaux.length ? `<div class="repere"><i></i>TU T’ES ARRÊTÉ ICI · ${esc(horodate(S.lu))}<i></i></div>` : '<div class="repere ok"><i></i>À JOUR<i></i></div>';
    return `<aside id="fil" class="panneau trait" aria-label="Fil du projet">
      <div class="fil-tete"><h2>Fil du projet</h2>${nouveaux.length ? `<span class="pastille accent">${nouveaux.length} nouveau${nouveaux.length > 1 ? 'x' : ''}</span><button type="button" class="btn petit mono-btn" id="tout-lu" style="margin-left:auto">Tout est lu</button>` : ''}</div>
      ${nouveaux.map(e => evt(e, true)).join('')}${repere}${anciens.map(e => evt(e, false)).join('')}
      ${!c.fil.length ? '<p class="vide-col">Rien encore.</p>' : ''}
      <p class="fil-note">${c.git ? 'Chaque changement vient de l’historique Git du dossier et de journal/log.md. Ce qui a changé dans la fiche depuis ta dernière lecture est surligné. Le trait avance quand tu quittes le projet, ou avec « Tout est lu ».' : 'Pas d’historique Git dans ce workspace : le fil ne montre que les lignes de journal/log.md qui nomment ce projet.'}</p>
    </aside>`;
  }
  function bande() {
    const js = S.cur.projet.jalons;
    if (!js.length) return '';
    return `<div class="bande"><div class="sous-tete"><span class="etiquette">Jalons</span><span class="etiquette" style="color:var(--accent)">${S.cur.projet.avancement ?? 0} %</span></div>
      <div class="bande-barres" aria-hidden="true">${js.map(j => `<i class="${j.fait ? 'fait' : ''}${neuf(j.ligne) ? ' neuf' : ''}"><b style="width:${j.fait ? 100 : j.pct || 0}%"></b></i>`).join('')}</div>
      <div class="bande-noms">${js.map(j => `<span class="${j.fait ? 'fait' : (j.pct || 0) > 0 ? 'encours' : ''}${neuf(j.ligne) ? ' neuf' : ''}">${esc(j.nom.toUpperCase())}${j.fait ? ' ✓' : ''}${j.date ? ' · ' + esc(court(j.date)) : ''}</span>`).join('')}</div></div>`;
  }
  function libres() {
    /* the parts this page does not know: shown as written */
    const c = S.cur, lines = c.content.split('\n');
    return c.projet.parties.filter(x => !x.cle).map(x => {
      const md = lines.slice(x.ligne + 1, x.fin).join('\n').trim(), touche = S.changes && (S.changes.tout || (S.changes.lignes || []).some(n => n >= x.ligne && n < x.fin));
      const html = window.marked ? marked.parse(md) : '<pre>' + esc(md) + '</pre>';
      return `<section><h2>${esc(x.nom)}</h2><div class="bloc md-libre${touche ? ' neuf' : ''}">${html}</div></section>`;
    }).join('');
  }
  function dessineFiche() {
    const p = S.cur.projet, h = p.header;
    const doc = `<article id="doc" class="panneau trait">
      ${bande()}
      <div class="etape"><span class="etiquette">Prochaine étape</span><p>${h.prochaine_etape ? inline(h.prochaine_etape) : '<span style="opacity:.6">Pas encore écrite</span>'}</p></div>
      <section><h2>Tâches</h2>${p.taches.map(t => bloc(t.ligne, tachesHtml([t]))).join('') || '<p class="vide-col">Aucune tâche.</p>'}</section>
      <section><h2>Décisions</h2>${p.decisions.map(d => bloc(d.ligne, `<div class="doc-decision"><span class="date">${esc(court(d.date) || '—')}</span><span><b>${inline(d.texte)}</b>${d.pourquoi ? `<small>Pourquoi : ${inline(d.pourquoi)}. </small>` : ''}${d.ecarte ? `<small>Écarté : ${inline(d.ecarte)}.</small>` : ''}</span></div>`)).join('') || '<p class="vide-col">Aucune décision notée.</p>'}</section>
      <section><h2>Livrables</h2><div class="doc-livrables">${p.livrables.map(x => `<div class="bloc${neuf(x.ligne) ? ' neuf' : ''}" style="flex:1 1 220px">${livrableHtml(x)}</div>`).join('') || '<p class="vide-col">Pas encore de livrable.</p>'}</div></section>
      <section><h2>Sources</h2>${p.sources.map(x => bloc(x.ligne, lienPlat(x, `data-source="${x.ligne}"`))).join('') || '<p class="vide-col">Pas encore de source.</p>'}</section>
      ${libres()}
      <form class="ajout-rapide" data-form="rapide"><select name="genre" aria-label="Quoi ajouter"><option value="tache">Tâche</option><option value="decision">Décision</option><option value="livrable">Livrable</option><option value="source">Source</option><option value="jalon">Jalon</option></select><input class="champ" name="texte" placeholder="Écris, puis Entrée" aria-label="Le texte à ajouter"><button class="btn primaire">Ajouter</button></form>
    </article>`;
    $('fiche').innerHTML = `<div class="fiche-grille">${doc}${filHtml()}</div>`;
    images($('fiche'));
  }

  /* ---------------------------- editing the Markdown ---------------------------- */
  const EOL_RE = /\r$/;
  const avecFin = (modele, texte) => texte + (EOL_RE.test(modele || '') ? '\r' : '');
  function enTete(L, champ, valeur) {
    if ((L[0] || '').trim() !== '---') return;
    let fin = 1; while (fin < L.length && L[fin].trim() !== '---') fin++;
    for (let i = 1; i < fin; i++) if (new RegExp('^' + champ + ':').test(L[i])) { if (valeur === null) L.splice(i, 1); else L[i] = avecFin(L[i], champ + ': ' + valeur); return; }
    if (valeur !== null) L.splice(fin, 0, avecFin(L[0], champ + ': ' + valeur));
  }
  const PLACEHOLDER = /^\s*[-*+]\s+(?:\[[ xX]\]\s+)?(?:<[^>]*>|\[<[^>]*>\]\(<[^>]*>\).*)\s*$/;
  function ajouteDans(L, cle, titre, ligne) {
    const part = S.cur.projet.parties.find(x => x.cle === cle);
    if (!part) {
      while (L.length && !L[L.length - 1].replace(EOL_RE, '').trim()) L.pop();
      L.push(avecFin(L[0], ''), avecFin(L[0], '## ' + titre), avecFin(L[0], ligne), avecFin(L[0], ''));
      return;
    }
    for (let i = part.ligne + 1; i < part.fin; i++) if (PLACEHOLDER.test(L[i].replace(EOL_RE, ''))) { L[i] = avecFin(L[i], ligne); return; }
    let at = part.fin - 1; while (at > part.ligne && !L[at].replace(EOL_RE, '').trim()) at--;
    L.splice(at + 1, 0, avecFin(L[part.ligne], ligne));
  }
  function morceaux(ligneTexte) {
    const m = /^(\s*[-*+]\s+)(?:\[([ xX])\]\s+)?(.*?)(\r?)$/.exec(ligneTexte);
    return m ? { avant: m[1], case: m[2], bits: m[3].split(/\s+·\s+/), fin: m[4] } : null;
  }
  async function modifie(change, message) {
    if (S.occupe || !S.cur) return;
    S.occupe = true; document.body.classList.add('charge');
    try {
      const L = S.cur.content.split('\n');
      change(L);
      if (L.some((l, i) => i > 0 && /^maj:/.test(l))) enTete(L, 'maj', today());
      const content = L.join('\n');
      if (content === S.cur.content) return;
      const r = await post('/local/files/save', { path: S.cur.path, content, base: S.cur.hash });
      if (r.conflict) { toast('La fiche a changé ailleurs entre-temps : je la recharge. Refais ton geste.', 'mal'); await ouvre(S.cur.path, true); return; }
      if (r.error) { toast(r.error, 'mal'); return; }
      /* you are on the page: what you see now counts as read */
      S.lu = S.vuA = new Date().toISOString(); noteLecture(S.cur.path, S.lu);
      await ouvre(S.cur.path, true);
      await chargeListe();
      if (message) toast(message);
    } finally { S.occupe = false; document.body.classList.remove('charge'); }
  }
  const ops = {
    tache: (ligne, fait) => modifie(L => { L[ligne] = L[ligne].replace(/\[[ xX]\]/, fait ? '[x]' : '[ ]'); }, fait ? 'Tâche cochée' : 'Tâche rouverte'),
    ajouteTache: t => modifie(L => ajouteDans(L, 'taches', 'Tâches', '- [ ] ' + propre(t)), 'Tâche ajoutée'),
    ajouteJalon: t => modifie(L => ajouteDans(L, 'jalons', 'Jalons', '- [ ] ' + propre(t)), 'Jalon ajouté'),
    jalon: (ligne, v) => modifie(L => {
      const m = morceaux(L[ligne]); if (!m) return;
      const autres = m.bits.slice(1).filter(b => !/^\d{1,3}\s*%$/.test(b.trim()) && !DATE_RE.test(b.trim()));
      const bits = [m.bits[0], ...(!v.fait && v.pct > 0 ? [Math.min(100, Math.round(v.pct)) + ' %'] : []), ...(v.date ? [v.date] : []), ...autres];
      L[ligne] = m.avant + '[' + (v.fait ? 'x' : ' ') + '] ' + bits.join(' · ') + m.fin;
    }, 'Jalon mis à jour'),
    decision: (texte, pourquoi, ecarte) => modifie(L => ajouteDans(L, 'decisions', 'Décisions', '- ' + today() + ' · ' + propre(texte) + (pourquoi ? ' · pourquoi : ' + propre(pourquoi) : '') + (ecarte ? ' · écarté : ' + propre(ecarte) : '')), 'Décision notée'),
    etat: (ligne, etat) => modifie(L => {
      const m = morceaux(L[ligne]); if (!m) return;
      const bits = m.bits.filter((b, i) => i === 0 || !ETATS.some(([, t]) => fold(t) === fold(b.trim())));
      L[ligne] = m.avant + [...bits, ETAT_TEXTE[etat]].join(' · ') + m.fin;
    }, etat === 'livre' ? 'Livrable validé' : 'État changé'),
    lien: (cle, saisie) => {
      const t = propre(saisie); if (!t) return;
      const url = /^https?:\/\//i.test(t), chemin = !url && /[\\/]|\.[a-z0-9]{1,5}$/i.test(t) && !/\s/.test(t);
      let ligne;
      if (url) { let nom = t; try { nom = new URL(t).hostname.replace(/^www\./, ''); } catch (_) { } ligne = `- [${nom}](${t})`; }
      else if (chemin) {
        const rel = t.replace(/^\/+/, ''), d = dirOf(S.cur.path), up = d ? d.split('/').map(() => '..').join('/') + '/' : '';
        ligne = `- [${rel.split('/').pop().replace(/\.md$/i, '')}](${up}${rel})`;
      } else ligne = '- ' + t;
      if (cle === 'livrables') ligne += ' · à venir';
      return modifie(L => ajouteDans(L, cle, cle === 'livrables' ? 'Livrables' : 'Sources', ligne), cle === 'livrables' ? 'Livrable ajouté' : 'Source ajoutée');
    },
    entete: (champ, valeur, message) => modifie(L => enTete(L, champ, valeur), message)
  };

  /* ---------------------------- the little window (milestone, next step) ---------------------------- */
  function bulle(cible, html, monte) {
    const b = $('bulle'); b.innerHTML = html; b.hidden = false;
    const r = cible.getBoundingClientRect(), w = b.offsetWidth, h = b.offsetHeight;
    b.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    b.style.top = (r.bottom + h + 12 < innerHeight ? r.bottom + 8 : Math.max(8, r.top - h - 8)) + 'px';
    monte(b);
    const premier = b.querySelector('input:not([type=checkbox]),select'); if (premier) premier.focus();
  }
  const fermeBulle = () => { $('bulle').hidden = true; };
  function editeJalon(el, ligne) {
    const j = S.cur.projet.jalons.find(x => x.ligne === ligne); if (!j) return;
    bulle(el, `<h3>${esc(j.nom)}</h3>
      <label>Atteint <input type="checkbox" id="b-fait"${j.fait ? ' checked' : ''}></label>
      <label>Avancement <input class="champ" id="b-pct" type="number" min="0" max="100" step="5" value="${j.fait ? 100 : j.pct ?? 0}"></label>
      <label>Date <input class="champ" id="b-date" type="date" value="${esc(j.date)}"></label>
      <div class="form-btns"><button type="button" class="btn discret petit" id="b-sans">Sans date</button><button type="button" class="btn primaire petit" id="b-ok">Enregistrer</button></div>`, b => {
      const go = date => { fermeBulle(); ops.jalon(ligne, { fait: $('b-fait').checked, pct: Number($('b-pct').value) || 0, date }); };
      $('b-ok').onclick = () => go($('b-date').value); $('b-sans').onclick = () => go('');
      b.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); go($('b-date').value); } };
    });
  }
  function editeEtape(el) {
    const h = S.cur.projet.header;
    bulle(el, `<h3>${h.prochaine_etape ? 'Bravo. Et la suite ?' : 'La prochaine étape'}</h3><input class="champ" id="b-etape" style="width:100%" placeholder="Ce qui fait avancer, ou ce qui débloque" value="">
      ${h.prochaine_etape ? `<label style="justify-content:flex-start;gap:8px"><input type="checkbox" id="b-tache" checked> Garder « ${esc(h.prochaine_etape)} » comme tâche faite</label>` : ''}
      <div class="form-btns"><button type="button" class="btn discret petit" id="b-annule">Annuler</button><button type="button" class="btn primaire petit" id="b-ok">Enregistrer</button></div>`, b => {
      const go = () => {
        const v = propre($('b-etape').value); if (!v) { $('b-etape').focus(); return; }
        const garde = h.prochaine_etape && $('b-tache') && $('b-tache').checked, avant = propre(h.prochaine_etape);
        fermeBulle();
        modifie(L => { enTete(L, 'prochaine_etape', v); if (garde) ajouteDans(L, 'taches', 'Tâches', '- [x] ' + avant); }, 'Prochaine étape à jour');
      };
      $('b-ok').onclick = go; $('b-annule').onclick = fermeBulle;
      b.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
    });
  }

  /* ---------------------------- events ---------------------------- */
  function clic(e) {
    const t = e.target;
    const lien = t.closest('[data-ouvrir]'); if (lien) { e.preventDefault(); ouvrirFichier(relatif(lien.dataset.ouvrir)); return; }
    const oc = t.closest('[data-ouvrir-chemin]'); if (oc) { ouvrirFichier(oc.dataset.ouvrirChemin); return; }
    const jal = t.closest('[data-jalon]'); if (jal) { editeJalon(jal, Number(jal.dataset.jalon)); return; }
    const src = t.closest('[data-source],[data-livrable]');
    if (src) {
      const n = Number(src.dataset.source ?? src.dataset.livrable), p = S.cur.projet, x = [...p.sources, ...p.livrables].find(y => y.ligne === n);
      if (!x) return;
      if (x.url) ouvrirLien(x.url); else if (x.chemin && x.genre !== 'absent') ouvrirFichier(x.chemin); else toast(x.genre === 'absent' ? 'Ce fichier est introuvable : ' + x.chemin : 'Pas de lien pour celui-ci', 'mal');
      return;
    }
    const val = t.closest('[data-valider]'); if (val) { ops.etat(Number(val.dataset.valider), 'livre'); return; }
    if (t.closest('[data-voir-faites]')) { S.faites = !S.faites; dessine(); return; }
    if (t.closest('[data-toutes]')) { S.toutes = !S.toutes; dessine(); return; }
    const of = t.closest('[data-ouvre-form]'); if (of) { S.form = of.dataset.ouvreForm; dessine(); const f = document.querySelector('[data-form] input'); if (f) f.focus(); return; }
    if (t.closest('[data-annuler]')) { S.form = ''; dessine(); return; }
    const et = t.closest('[data-etape]'); if (et) { editeEtape(et); return; }
    if (t.closest('#tout-lu')) { S.lu = S.vuA = new Date().toISOString(); noteLecture(S.cur.path, S.lu); S.changes = { lignes: [] }; dessine(); toast('Tout est lu'); }
  }
  $('atelier').addEventListener('click', clic); $('fiche').addEventListener('click', clic);
  function change(e) {
    const t = e.target;
    if (t.dataset.tache !== undefined) ops.tache(Number(t.dataset.tache), t.checked);
    else if (t.dataset.etat !== undefined && t.value) ops.etat(Number(t.dataset.etat), t.value);
  }
  $('atelier').addEventListener('change', change); $('fiche').addEventListener('change', change);
  function touche(e) {
    const t = e.target;
    if (e.key !== 'Enter' || !t.dataset || !t.dataset.ajout) return;
    e.preventDefault();
    const v = t.value.trim(); if (!v) return;
    ({ tache: ops.ajouteTache, jalon: ops.ajouteJalon, source: x => ops.lien('sources', x), livrable: x => ops.lien('livrables', x) })[t.dataset.ajout](v);
  }
  $('atelier').addEventListener('keydown', touche); $('fiche').addEventListener('keydown', touche);
  function envoi(e) {
    const f = e.target.closest('form[data-form]'); if (!f) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (f.dataset.form === 'decision') { if (!propre(d.texte)) return; S.form = ''; ops.decision(d.texte, d.pourquoi, d.ecarte); return; }
    const v = propre(d.texte); if (!v) return;
    if (d.genre === 'tache') ops.ajouteTache(v); else if (d.genre === 'jalon') ops.ajouteJalon(v); else if (d.genre === 'decision') ops.decision(v, '', '');
    else ops.lien(d.genre === 'livrable' ? 'livrables' : 'sources', v);
  }
  $('atelier').addEventListener('submit', envoi); $('fiche').addEventListener('submit', envoi);

  $('statut').onchange = e => ops.entete('statut', e.target.value, 'Statut : ' + e.target.value);
  $('echeance').onchange = e => ops.entete('echeance', e.target.value || null, e.target.value ? 'Échéance : ' + long(e.target.value) : 'Échéance retirée');
  document.querySelectorAll('#vues button').forEach(b => b.onclick = () => { S.vue = b.dataset.vue; store.set('vue', S.vue); dessine(); });
  $('chemin').onclick = e => { e.preventDefault(); if (S.cur) ouvrirFichier(S.cur.path); };
  $('ouvrir-fiche').onclick = () => { if (S.cur) ouvrirFichier(S.cur.path); };
  $('reprendre').onclick = async () => {
    if (!S.cur) return;
    const cmd = '/reprendre ' + S.cur.slug;
    toast(await copier(cmd) ? 'Copié : « ' + cmd + ' ». Colle-le dans ton agent.' : 'Copie impossible ici : tape « ' + cmd + ' » dans ton agent.');
  };

  /* the rail folds; the look (night, day, colour) is set here and kept in this browser */
  function plie(v) {
    document.body.classList.toggle('replie', v); store.set('replie', v);
    $('btn-replier').setAttribute('aria-expanded', !v); $('btn-replier').title = v ? 'Déplier la liste' : 'Replier la liste';
    $('ico-replier').setAttribute('d', v ? 'M5 5l5 5-5 5M9 5l5 5-5 5' : 'M11 5 6 10l5 5M15 5l-5 5 5 5');
  }
  $('btn-replier').onclick = () => plie(!document.body.classList.contains('replie'));
  function marqueApparence() {
    const a = window.Apparence ? Apparence.get() : { mode: 'nuit', couleur: 'turquoise' };
    document.querySelectorAll('#reglages [data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === a.mode));
    document.querySelectorAll('#reglages [data-couleur]').forEach(b => b.setAttribute('aria-pressed', b.dataset.couleur === a.couleur));
  }
  $('btn-reglages').onclick = () => { const r = $('reglages'); r.hidden = !r.hidden; $('btn-reglages').setAttribute('aria-expanded', !r.hidden); marqueApparence(); };
  $('reglages').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !window.Apparence) return;
    if (b.dataset.mode) Apparence.set({ mode: b.dataset.mode }); if (b.dataset.couleur) Apparence.set({ couleur: b.dataset.couleur });
    marqueApparence();
  });
  addEventListener('storage', e => { if (e.key === 'sm4rt-apparence') marqueApparence(); });
  addEventListener('pointerdown', e => {
    if (!$('bulle').hidden && !e.target.closest('#bulle')) fermeBulle();
    if (!$('reglages').hidden && !e.target.closest('#reglages,#btn-reglages')) { $('reglages').hidden = true; $('btn-reglages').setAttribute('aria-expanded', false); }
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('bulle').hidden) { fermeBulle(); return; }
    if (!$('reglages').hidden) { $('reglages').hidden = true; return; }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (!typing && embedded) parent.postMessage({ type: 'projets-copy-back' }, '*');
  });
  if (embedded) $('retour').hidden = true;

  /* back on the tab, or on the window: the files may have changed meanwhile */
  let frais = 0;
  async function rafraichit() {
    if (Date.now() - frais < 4000 || S.occupe) return;
    frais = Date.now();
    if (!(await chargeListe()) || !S.cur) return;
    /* drawn again only when the file changed: a click into the page must not wipe what you are typing */
    const st = await api('/local/files/read?stat=1&path=' + enc(S.cur.path));
    if (st.hash && st.hash !== S.cur.hash) await ouvre(S.cur.path, true);
  }
  addEventListener('focus', rafraichit);
  addEventListener('message', e => { if (e.source === parent && e.data && e.data.type === 'projets-copy' && e.data.action === 'shown') rafraichit(); });

  (async () => {
    plie(!!store.get('replie', false));
    frais = Date.now();
    if (!(await chargeListe())) return;
    const voulu = location.hash.length > 1 ? decodeURIComponent(location.hash.slice(1)) : store.get('dernier', '');
    const choix = S.liste.find(p => p.path === voulu) || S.liste.filter(vivant).sort((a, b) => rang(a) - rang(b))[0] || S.liste[0];
    if (choix) await ouvre(choix.path);
    else montreVide('Aucun projet pour l’instant', 'Un projet vit dans <code>projets/&lt;slug&gt;.md</code>, à partir du gabarit <code>systeme/gabarits/projet.md</code>. Demande à ton agent d’en créer un, ou lance une idée avec la skill <code>idees</code>.');
    if (embedded) parent.postMessage({ type: 'projets-copy-ready' }, '*');
  })();
})();

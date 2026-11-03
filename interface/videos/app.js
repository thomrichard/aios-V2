/* SM4RT Vidéos: the Second Brain's Vidéos tab, or /videos/ on its own.
   One file per video, from the first idea to the stats; only its status moves. Vivier: the ideas, best score first, to
   note, keep or set aside. Production: one column per status. Fiche: one video, its text and its header. The page keeps
   nothing of its own: it reads the headers (/local/videos) and each gesture writes one field back (/local/videos/regler).
   The text is edited in the Fichiers tab, the score is index.py's, and publie is written by youtube.py at the release. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const VIVIER = ['sujet', 'retenu'];
  const LIMITE = 3;
  const RAISONS = ['pas le bon moment', 'déjà fait ailleurs', 'plus envie', 'hors de mes cibles'];
  const NOMS = { sujet: 'Sujet', retenu: 'Retenu', titre: 'Titre', ecriture: 'Écriture', tournage: 'Tournage', montage: 'Montage', programme: 'Programmée', 'en-pause': 'En pause', publie: 'Publiée', abandonne: 'Écartée' };
  const nom = s => NOMS[s] || s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
  const CRITERES = ['potentiel', 'preuve', 'objectif', 'affinite', 'preparation', 'effort'];
  const S = { d: null, filtre: 'tous', sous: 'vivantes', fiche: null, sale: {}, archive: null };

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
  async function copier(texte) {
    try { await navigator.clipboard.writeText(texte); return true; } catch (_) { }
    const t = document.createElement('textarea'); t.value = texte; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.append(t); t.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) { }
    t.remove(); return ok;
  }
  function ouvrirFichier(chemin) {
    if (embedded) parent.postMessage({ type: 'videos-copy-edit', path: chemin }, '*');
    else window.open('/fichiers/?f=' + enc(chemin), '_blank', 'noopener');
  }

  /* ---------------------------- the gestures ---------------------------- */
  async function regler(chemin, champs, pourquoi, message) {
    const r = await post('/local/videos/regler', { chemin, champs, pourquoi });
    if (r.error) { toast(r.error, 'mal'); await route(); return false; }
    if (r.index && r.index.ran && !r.index.ok) toast('Écrit, mais les index ne suivent pas : ' + r.index.message, 'mal');
    else if (message) toast(message);
    S.sale = {};
    await route();
    return true;
  }
  function demandeEcart(v) {
    $('ecarter-nom').textContent = v.titre;
    const box = $('ecarter-raisons'); box.textContent = '';
    for (const raison of RAISONS) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn petit'; b.textContent = raison;
      b.onclick = () => { $('ecarter').close(); regler(v.chemin, { statut: finEcart() }, raison, 'Écartée : ' + v.titre + '.'); };
      box.append(b);
    }
    $('ecarter').showModal();
  }
  const finEcart = () => S.d.fins.find(f => f !== 'publie') || 'abandonne';
  const estEcartee = v => S.d.fins.includes(v.statut) && v.statut !== 'publie';

  /* ---------------------------- Vivier ---------------------------- */
  const puce = (t, cls = '') => '<span class="pastille ' + cls + '">' + esc(t) + '</span>';
  const note = (v, max) => v === '' ? '—' : esc(v) + ' /' + max;
  function vivier() {
    const d = S.d, vivantes = d.videos.filter(v => VIVIER.includes(v.statut)), ecartees = d.videos.filter(estEcartee);
    const liste = vivantes.filter(v => S.filtre === 'tous' || v.objectif === S.filtre)
      .sort((a, b) => (Number(b.score) || -1) - (Number(a.score) || -1) || String(b.maj).localeCompare(String(a.maj)));
    const notees = liste.filter(v => v.score !== '').length;
    const filtres = ['tous', ...d.objectifs].map(f => '<button type="button" data-filtre="' + esc(f) + '" aria-pressed="' + (S.filtre === f) + '">' + esc(f) + '</button>').join('');
    let corps;
    if (S.sous === 'vivantes') {
      const rangs = liste.map((v, i) => {
        const fort = i < 3 && v.score !== '' ? ' fort' : '', c = cls => 'class="' + cls + fort + '"';
        return '<span ' + c('rang') + '>' + String(i + 1).padStart(2, '0') + '</span>' +
          '<div ' + c('idee') + '><button type="button" class="lien-fiche" data-fiche="' + esc(v.chemin) + '">' + esc(v.titre) + '</button>' +
          '<div class="puces">' + puce(nom(v.statut), v.statut === 'retenu' ? 'accent' : '') + (v.objectif ? puce(v.objectif) : '') + '</div></div>' +
          '<span ' + c('chiffre') + '>' + note(v.potentiel, 100) + '</span><span ' + c('chiffre moi') + '>' + note(v.affinite, 5) + '</span><span ' + c('chiffre moi') + '>' + note(v.preparation, 5) + '</span>' +
          '<span ' + c('score' + (v.score === '' ? ' vide' : i < 3 ? ' fort-s' : '')) + ' title="' + (v.score === '' ? 'Pas de score : un critère manque' : 'Score sur 100') + '">' + (esc(v.score) || '—') + '</span>' +
          '<div ' + c('actions') + '><button type="button" class="btn petit" data-avance="' + esc(v.chemin) + '">' + (v.statut === 'sujet' ? 'Retenir' : 'Au titre') + '</button>' +
          '<button type="button" class="btn petit" data-fiche="' + esc(v.chemin) + '">Modifier</button><button type="button" class="btn petit danger" data-ecarte="' + esc(v.chemin) + '">Écarter</button></div>';
      }).join('');
      corps = liste.length
        ? '<div class="panneau boite"><div class="grille"><span class="etiquette haut">#</span><span class="etiquette haut">Idée</span><span class="etiquette haut">Potentiel</span><span class="etiquette haut">Affinité</span><span class="etiquette haut">Prépa</span><span class="etiquette haut" style="justify-content:flex-end">Score</span><span class="etiquette haut" style="justify-content:flex-end">Actions</span>' + rangs + '</div></div>'
        : '<div class="panneau"><p class="vide">' + (vivantes.length ? 'Aucune idée pour cet objectif.' : 'Aucune idée pour l’instant. Note la première ci-dessus.') + '</p></div>';
    } else {
      corps = '<div class="panneau">' + (ecartees.length ? ecartees.map(v =>
        '<div class="ecartee"><div><button type="button" class="lien-fiche" data-fiche="' + esc(v.chemin) + '">' + esc(v.titre) + '</button><small>' + esc(v.pourquoi || 'Sans raison notée') + '</small></div>' +
        '<button type="button" class="btn petit" data-remet="' + esc(v.chemin) + '">Remettre en sujet</button>' +
        '<button type="button" class="btn petit danger" data-archive="' + esc(v.chemin) + '">' + (S.archive === v.chemin ? 'Confirmer : vers archives/' : 'Archiver') + '</button></div>').join('') : '<p class="vide">Aucune idée écartée.</p>') +
        '</div><p class="aide">Une idée écartée garde sa fiche et son pourquoi. Archiver la déplace dans <code>archives/</code> : rien n’est supprimé.</p>';
    }
    $('vue').innerHTML = '<header class="tete"><div class="tete-g"><h1>Vivier d’idées</h1><p>' + vivantes.length + ' idée' + (vivantes.length > 1 ? 's' : '') + ' vivante' + (vivantes.length > 1 ? 's' : '') +
      ', classée' + (vivantes.length > 1 ? 's' : '') + ' par score' + (vivantes.length - notees > 0 && S.filtre === 'tous' ? ' ; ' + (vivantes.length - notees) + ' sans score, il leur manque un critère' : '') + '.</p></div>' +
      (d.objectifs.length ? '<div class="seg-f" role="group" aria-label="Filtrer par objectif">' + filtres + '</div>' : '') + '</header>' +
      '<form class="note-rapide" id="note"><span aria-hidden="true">+</span><label class="sr" for="idee">Nouvelle idée</label><input id="idee" type="text" maxlength="160" autocomplete="off" placeholder="Une idée de vidéo, en une phrase. Elle entre en sujet, sans note."><button type="submit" class="btn primaire petit">Noter</button></form>' +
      '<div class="sous-vues"><button type="button" data-sous="vivantes" aria-pressed="' + (S.sous === 'vivantes') + '">Vivantes · ' + vivantes.length + '</button><button type="button" data-sous="ecartees" aria-pressed="' + (S.sous === 'ecartees') + '">Écartées · ' + ecartees.length + '</button></div>' + corps;
    $('note').onsubmit = async e => {
      e.preventDefault();
      const titre = $('idee').value.trim(); if (!titre) return;
      const r = await post('/local/videos/creer', { titre });
      if (r.error) { toast(r.error, 'mal'); return; }
      S.sous = 'vivantes'; S.filtre = 'tous'; toast('Notée en sujet.');
      await route();
    };
  }

  /* ---------------------------- Production ---------------------------- */
  function production() {
    const d = S.d, ecart = finEcart();
    const colonnes = d.statuts.filter(s => !VIVIER.includes(s) && s !== ecart);
    const trente = new Date(d.aujourdhui + 'T12:00:00'); trente.setDate(trente.getDate() - 30); const depuis = trente.toISOString().slice(0, 10);
    const dans = s => d.videos.filter(v => v.statut === s && (s !== 'publie' || String(v.sortie || v.maj) >= depuis)).sort((a, b) => String(b.sortie || b.maj).localeCompare(String(a.sortie || a.maj)));
    const encours = d.videos.filter(v => colonnes.includes(v.statut) && v.statut !== colonnes[0] && v.statut !== 'programme' && !d.fins.includes(v.statut)).length;
    const options = cur => d.statuts.filter(s => s !== 'publie' || cur === 'publie').map(s => '<option value="' + esc(s) + '"' + (s === cur ? ' selected' : '') + '>' + esc(s === ecart ? 'Écarter…' : s === 'retenu' ? 'Retour au vivier' : s === 'sujet' ? 'Retour en sujet' : nom(s)) + '</option>').join('');
    const VIDES = { titre: 'Retiens une idée dans le Vivier.', ecriture: 'Aucun script en cours.', tournage: 'Rien à tourner.', montage: 'Rien au montage.', programme: 'Rien de programmé.', 'en-pause': 'Rien en pause.', publie: 'Rien de publié depuis 30 jours.' };
    const cols = colonnes.map(s => {
      const cartes = dans(s).map(v => '<article class="carte"><button type="button" class="lien-fiche" data-fiche="' + esc(v.chemin) + '">' + esc(v.titre) + '</button>' +
        '<div class="puces">' + (v.objectif ? puce(v.objectif) : '') + (v.score !== '' ? puce('score ' + v.score, 'accent') : '') + (v.projet ? puce('projet lié') : '') + '</div>' +
        (s === 'publie' ? '<small>Sortie le ' + esc(v.sortie || v.maj) + '</small>' : (v.echeance ? '<small>Échéance ' + esc(v.echeance) + '</small>' : '')) +
        (s === 'publie' ? '' : '<label class="champ-l">Statut<select class="champ" data-statut="' + esc(v.chemin) + '">' + options(v.statut) + '</select></label>') + '</article>').join('');
      return '<section class="panneau colonne ' + (s === 'en-pause' ? 'pause' : s === 'publie' ? 'finie' : '') + '" aria-label="' + esc(nom(s)) + '"><div class="colonne-haut"><span class="etiquette">' + esc(nom(s)) + (s === 'publie' ? ' · 30 j' : '') + '</span><span class="etiquette">' + dans(s).length + '</span></div>' +
        (cartes || '<p class="vide-col">' + esc(VIDES[s] || 'Rien ici.') + '</p>') + '</section>';
    }).join('');
    const sorties = d.videos.filter(v => v.echeance && !d.fins.includes(v.statut)).sort((a, b) => a.echeance.localeCompare(b.echeance));
    $('vue').innerHTML = '<header class="tete"><div class="tete-g"><h1>Production</h1><p>Une colonne par statut de la fiche. Changer le statut d’une carte la déplace.</p></div>' +
      '<div class="compteur' + (encours > LIMITE ? ' trop' : '') + '" title="Du script au montage, pauses comprises"><span class="etiquette">En cours</span><b>' + encours + ' <small>sur ' + LIMITE + '</small></b></div></header>' +
      '<div class="tableau">' + cols + '</div>' +
      '<section class="panneau sorties"><span class="etiquette">Prochaines sorties · champ echeance</span>' +
      (sorties.length ? sorties.map(v => '<div class="sortie"><span class="mono">' + esc(v.echeance) + '</span><button type="button" class="btn-l" data-fiche="' + esc(v.chemin) + '">' + esc(v.titre) + '</button>' + puce(nom(v.statut)) + '</div>').join('') : '<p class="aide">Aucune échéance. Elle se règle dans la fiche de la vidéo.</p>') + '</section>' +
      '<p class="aide">Une vidéo passe en Publiée toute seule : à sa sortie, <code>youtube.py</code> reconnaît sa fiche à son titre, ou à une ligne <code>- Vidéo : &lt;lien&gt;</code>.</p>';
  }

  /* ---------------------------- Fiche ---------------------------- */
  function decoupe(corps) {
    const parts = [], lignes = corps.split(/\r?\n/); let cur = { titre: '', l: [] }, code = false; parts.push(cur);
    for (const l of lignes) {
      if (l.startsWith('```')) code = !code;
      if (!code && l.startsWith('## ')) { cur = { titre: l.slice(3).trim(), l: [] }; parts.push(cur); }
      else if (!code && cur.titre === '' && /^# /.test(l)) continue;
      else cur.l.push(l);
    }
    return parts.filter(p => p.titre || p.l.some(x => x.trim()));
  }
  const md = t => '<div class="md">' + (window.marked ? marked.parse(t) : '<pre>' + esc(t) + '</pre>') + '</div>';
  function cibleLien(chemin, lien) {
    if (/^https?:/.test(lien)) return { url: lien };
    const pile = chemin.split('/').slice(0, -1);
    for (const m of lien.split('/')) { if (m === '..') pile.pop(); else if (m !== '.') pile.push(m); }
    return { fichier: pile.join('/') };
  }
  function fiche() {
    const f = S.fiche, h = f.entete, val = k => k in S.sale ? S.sale[k] : (h[k] || ''), ecart = finEcart();
    const pause = h.statut === 'en-pause', ecartee = estEcartee({ statut: h.statut }), publiee = h.statut === 'publie';
    const titre = (f.corps.match(/^# (.+)$/m) || [, f.chemin])[1];
    const etapes = f.statuts.filter(s => s !== ecart && s !== 'en-pause'), ici = etapes.indexOf(h.statut);
    const manque = CRITERES.filter(c => !h[c]);
    const parts = decoupe(f.corps);
    const LONGUES = ['Description', 'Transcription'];
    const blocs = parts.map(p => {
      const t = p.l.join('\n');
      if (LONGUES.includes(p.titre)) return '<details class="panneau bloc"><summary>' + esc(p.titre) + '</summary>' + md(t) + '</details>';
      return '<section class="panneau bloc' + (p.titre === 'Où elle en est' && pause ? ' pause' : '') + '">' + (p.titre ? '<h2>' + esc(p.titre) + '</h2>' : '') + md(t) + '</section>';
    }).join('') || '<section class="panneau bloc"><p class="aide">La fiche est vide pour l’instant. « Modifier le texte » l’ouvre dans l’éditeur.</p></section>';
    const opts = f.statuts.filter(s => s !== ecart && (s !== 'publie' || publiee)).map(s => '<option value="' + esc(s) + '"' + (s === val('statut') ? ' selected' : '') + '>' + esc(nom(s)) + '</option>').join('');
    const objs = ['', ...f.objectifs].map(o => '<option value="' + esc(o) + '"' + (o === val('objectif') ? ' selected' : '') + '>' + esc(o || 'à choisir') + '</option>').join('');
    const liens = String(h.liens || '').split(',').map(x => x.trim()).filter(Boolean).map(l => {
      const c = cibleLien(f.chemin, l), n = l.split('/').pop().replace(/\.md$/, '');
      return c.url ? '<a class="lien-l" href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer"><span class="etiquette">Lien</span>' + esc(c.url.replace(/^https?:\/\//, '').slice(0, 44)) + '</a>'
        : '<button type="button" class="lien-l" data-ouvre="' + esc(c.fichier) + '"><span class="etiquette">Fiche</span>' + esc(n) + '</button>';
    }).join('');
    $('vue').innerHTML = '<nav class="fil-ariane etiquette" aria-label="Où tu es"><a href="#production">Vidéos</a><span aria-hidden="true">/</span><span>' + esc(f.chemin.split('/').pop()) + '</span></nav>' +
      '<header class="tete"><div class="tete-g"><div class="puces">' + puce(ecartee ? 'écartée' : nom(h.statut), pause ? 'attention' : ecartee ? 'danger' : 'accent') + (h.score ? puce('score ' + h.score, 'accent') : '') + (h.projet ? puce('projet ' + h.projet) : '') + '</div><h1>' + esc(titre) + '</h1></div>' +
      '<div class="actions"><button type="button" class="btn" data-ouvre="' + esc(f.chemin) + '">Modifier le texte</button>' + (ecartee ? '<button type="button" class="btn" data-remet="' + esc(f.chemin) + '">Remettre en sujet</button>' : publiee ? '' : '<button type="button" class="btn danger" id="f-ecarte">Écarter</button>') + '</div></header>' +
      '<ol class="etapes" aria-label="Étapes de la vidéo">' + etapes.map((s, i) => '<li class="' + (i < ici ? 'fait' : i === ici ? 'ici' : '') + '"' + (i === ici ? ' aria-current="step"' : '') + '><i></i><span class="etiquette">' + esc(nom(s)) + '</span></li>').join('') + '</ol>' +
      '<div class="fiche"><div class="fiche-texte">' + blocs + '</div><aside class="fiche-cote">' +
      '<section class="panneau bloc"><span class="etiquette">En-tête</span>' +
      (ecartee || publiee ? '' : '<label class="champ-l">Statut<select class="champ" data-champ="statut">' + opts + '</select></label>') +
      '<label class="champ-l">Objectif<select class="champ" data-champ="objectif">' + objs + '</select></label><div class="deux">' +
      '<label class="champ-l">Affinité /5<input class="champ" type="number" min="1" max="5" data-champ="affinite" value="' + esc(val('affinite')) + '"></label>' +
      '<label class="champ-l">Préparation /5<input class="champ" type="number" min="1" max="5" data-champ="preparation" value="' + esc(val('preparation')) + '"></label>' +
      '<label class="champ-l">Effort (h)<input class="champ" type="number" min="0" step="0.5" data-champ="effort" value="' + esc(val('effort')) + '"></label>' +
      '<label class="champ-l">Échéance<input class="champ" type="date" data-champ="echeance" value="' + esc(val('echeance')) + '"></label></div>' +
      '<div class="mesures"><div>Potentiel<b>' + (esc(h.potentiel) || '—') + '</b></div><div>Preuve<b>' + (esc(h.preuve) || '—') + '</b></div><div class="s">Score<b>' + (esc(h.score) || '—') + '</b></div></div>' +
      (manque.length ? '<p class="aide">Pas de score : il manque ' + esc(manque.join(', ')) + '.</p>' : '') +
      (!h.potentiel || !h.preuve ? '<button type="button" class="btn petit" id="f-vidiq">Copier la demande de mesure pour l’agent</button>' : '') +
      '<button type="button" class="btn primaire" id="f-enregistre"' + (Object.keys(S.sale).length ? '' : ' hidden') + '>Enregistrer</button></section>' +
      (liens ? '<section class="panneau bloc"><span class="etiquette">Liens</span>' + liens + '</section>' : '') +
      (f.historique.length ? '<section class="panneau bloc"><span class="etiquette">Historique · Git</span><div class="histo">' + f.historique.map(g => '<span>' + esc(g.date) + '</span><span>' + esc(g.sujet) + '</span>').join('') + '</div></section>' : '') +
      '</aside></div>';
    const ec = $('f-ecarte'); if (ec) ec.onclick = () => demandeEcart({ chemin: f.chemin, titre });
    const vq = $('f-vidiq'); if (vq) vq.onclick = async () => {
      const texte = 'Mesure la fiche ' + f.chemin + ' avec ton outil de recherche YouTube, et remplis ses champs potentiel et preuve.';
      toast(await copier(texte) ? 'Copié. Colle-le dans ton agent.' : 'Copie impossible : « ' + texte + ' »', 'mal');
    };
    $('f-enregistre').onclick = () => regler(f.chemin, { ...S.sale }, '', 'Enregistré : le score suit.');
    $('vue').querySelectorAll('[data-champ]').forEach(c => {
      const change = () => { const k = c.dataset.champ; if (c.value === (h[k] || '')) delete S.sale[k]; else S.sale[k] = c.value; $('f-enregistre').hidden = !Object.keys(S.sale).length; };
      c.addEventListener('input', change); c.addEventListener('change', change);
    });
  }

  /* ---------------------------- the address ---------------------------- */
  async function route() {
    const h = decodeURIComponent(location.hash.slice(1)), estFiche = h.startsWith('fiche/'), prod = h === 'production';
    $('o-vivier').toggleAttribute('aria-current', false); $('o-production').toggleAttribute('aria-current', false);
    if (!estFiche) (prod ? $('o-production') : $('o-vivier')).setAttribute('aria-current', 'page');
    if (estFiche) {
      const r = await api('/local/videos/lire?chemin=' + enc(h.slice(6)));
      const l = await api('/local/videos');
      if (r.error || l.error) { $('vue').innerHTML = '<div class="panneau"><p class="vide">' + esc(r.error || l.error) + '</p></div>'; return; }
      S.d = l; S.fiche = r; fiche();
      return;
    }
    const r = await api('/local/videos');
    if (r.error) { $('vue').innerHTML = '<div class="panneau"><p class="vide">' + esc(r.error) + '</p></div>'; return; }
    S.d = r;
    if (!r.statuts.length) { $('vue').innerHTML = '<div class="panneau"><p class="vide">Le type <code>video</code> n’est pas dans <code>systeme/metadonnees.md</code>. Ajoute-le dans l’onglet Réglages, et cet onglet s’ouvrira.</p></div>'; return; }
    if (prod) production(); else vivier();
  }
  const versFiche = chemin => { S.sale = {}; location.hash = 'fiche/' + enc(chemin); };

  $('vue').addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset, cherche = c => S.d.videos.find(v => v.chemin === c);
    if (d.fiche) return versFiche(d.fiche);
    if (d.ouvre) return ouvrirFichier(d.ouvre);
    if (d.filtre) { S.filtre = d.filtre; return vivier(); }
    if (d.sous) { S.sous = d.sous; S.archive = null; return vivier(); }
    if (d.ecarte) return demandeEcart(cherche(d.ecarte));
    if (d.avance) { const v = cherche(d.avance), suite = v.statut === 'sujet' ? 'retenu' : S.d.statuts[S.d.statuts.indexOf('retenu') + 1]; return regler(v.chemin, { statut: suite }, '', v.statut === 'sujet' ? 'Retenue.' : 'Elle part en production.'); }
    if (d.remet) return regler(d.remet, { statut: S.d.statuts[0] }, '', 'Revenue en sujet.');
    if (d.archive) {
      if (S.archive !== d.archive) { S.archive = d.archive; return vivier(); }
      const r = await post('/local/videos/archiver', { chemin: d.archive });
      S.archive = null;
      if (r.error) toast(r.error, 'mal'); else toast('Archivée dans ' + r.chemin + '.');
      return route();
    }
  });
  $('vue').addEventListener('change', e => {
    const c = e.target.dataset && e.target.dataset.statut; if (!c) return;
    const v = S.d.videos.find(x => x.chemin === c), s = e.target.value;
    if (s === finEcart()) { e.target.value = v.statut; return demandeEcart(v); }
    regler(c, { statut: s }, '', VIVIER.includes(s) ? 'Elle repart dans le Vivier.' : '');
  });
  $('ecarter-annuler').onclick = () => $('ecarter').close();
  addEventListener('hashchange', route);
  addEventListener('message', e => {
    if (!embedded || e.source !== parent) return;
    const m = e.data || {};
    if (m.type === 'videos-copy' && m.action === 'shown') route();
  });
  route().then(() => { if (embedded) parent.postMessage({ type: 'videos-copy-ready' }, '*'); });
})();

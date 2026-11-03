/* SM4RT Skills: the Second Brain's Skills tab, or /competences/ on its own.
   Catalogue: every skill of skills/ as a card, by family, with its sheet beside it: what it does, when to launch it,
   its steps, where it serves, its journal, its notes and, when it is measured, its usage over 30 days.
   Entretien: what needs a hand (the notes put aside), what deserves an eye (usage, size, family), what sleeps, and
   the journal of every skill end to end. The page reads; it writes one thing only, a note in feedback.md, the line
   /note writes. What the page cannot do (apply notes, archive a skill) it copies as a line for your agent. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const fold = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-skills:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-skills:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  const COULEURS = ['var(--accent)', 'var(--ok)', 'var(--agent)', 'var(--attention)', 'var(--texte-pale)', 'var(--accent-2)', 'var(--danger)'];
  const S = {
    d: null, vue: location.hash === '#entretien' ? 'entretien' : 'catalogue', q: '',
    fam: store.get('famille', 'toutes'), orig: store.get('origine', 'toutes'), sel: store.get('choix', ''),
    vus: store.get('vus', {}), gardes: store.get('gardes', {})
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
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const court = s => DATE_RE.test(s || '') ? s.slice(8, 10) + '.' + s.slice(5, 7) : '';
  /* a day as usage.mjs writes it (UTC), i days ago */
  const jourIl = i => new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
  function depuis(iso) {
    const t = Date.parse(iso || ''); if (isNaN(t)) return 'jamais vue';
    const j = Math.floor((Date.now() - t) / 864e5);
    return j <= 0 ? 'aujourd’hui' : j === 1 ? 'hier' : 'il y a ' + j + ' j';
  }
  const fmtTok = n => n < 1000 ? String(Math.round(n)) : n < 1e6 ? Math.round(n / 1000) + ' k' : (n / 1e6).toFixed(1).replace('.', ',') + ' M';
  const pluriel = (n, un, plusieurs) => n + ' ' + (n > 1 ? plusieurs : un);
  /* the inline Markdown of a step or a note: code, bold, italics (escaped first) */
  function inline(md) {
    return esc(md).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>');
  }
  function ouvrirFichier(chemin) {
    if (!chemin) return;
    if (embedded) parent.postMessage({ type: 'competences-copy-edit', path: chemin }, '*');
    else window.open('/fichiers/?f=' + enc(chemin), '_blank', 'noopener');
  }
  async function copier(texte) {
    try { await navigator.clipboard.writeText(texte); return true; } catch (_) { }
    const t = document.createElement('textarea'); t.value = texte; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.append(t); t.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) { }
    t.remove(); return ok;
  }
  async function copieCommande(cmd) {
    toast(await copier(cmd) ? 'Copié : « ' + cmd + ' ». Colle-le dans ton agent.' : 'Copie impossible ici : tape « ' + cmd + ' » dans ton agent.');
  }
  function montreVide(titre, texte) {
    $('vide').hidden = false; $('catalogue').hidden = true; $('entretien').hidden = true;
    $('vide-titre').textContent = titre; $('vide-texte').innerHTML = texte || '';
  }

  /* ---------------------------- what the data says ---------------------------- */
  const familles = () => (S.d && S.d.familles) || [];
  function familleDe(s) {
    const i = familles().findIndex(f => f.id === s.famille);
    return i < 0 ? null : { ...familles()[i], couleur: COULEURS[i % COULEURS.length] };
  }
  const r30 = s => s.usage ? s.usage.r30 : 0;
  /* what deserves an eye: cost or use out of the ordinary, a SKILL.md near its ceiling, a family missing */
  function alertes() {
    const out = [], d = S.d, mesurees = d.mesure ? d.skills.filter(s => r30(s) > 0) : [];
    const parLancement = s => s.usage.tok30 / s.usage.r30;
    const tri = mesurees.map(parLancement).sort((a, b) => a - b), mediane = tri.length ? tri[Math.floor(tri.length / 2)] : 0;
    for (const s of d.skills) {
      if (d.mesure && tri.length >= 3 && r30(s) > 0 && mediane > 0 && parLancement(s) >= 5 * mediane)
        out.push({ s, cle: s.id + ':cout', texte: fmtTok(parLancement(s)) + ' tokens par lancement : ' + Math.round(parLancement(s) / mediane) + ' fois la médiane de tes skills.' });
      if (d.mesure && r30(s) >= 5 && s.usage.r7 === 0)
        out.push({ s, cle: s.id + ':arret', texte: 'Lancée ' + s.usage.r30 + ' fois ces 30 derniers jours, plus du tout cette semaine.' });
      if (s.lignes > s.plafondIndex)
        out.push({ s, cle: s.id + ':taille', texte: s.lignes + ' lignes : au-delà de ' + s.plafondIndex + ', le SKILL.md devient un index qui renvoie vers references/.' });
      else if (s.lignes > s.plafond)
        out.push({ s, cle: s.id + ':taille', texte: s.lignes + ' lignes : au-dessus de ' + s.plafond + '. Le détail peut aller dans references/.' });
      if (familles().length && !s.famille)
        out.push({ s, cle: s.id + ':famille', texte: 'Sans famille : ajoute-la dans l’en-tête de son SKILL.md (metadata:, puis famille:).' });
      else if (familles().length && !familleDe(s))
        out.push({ s, cle: s.id + ':famille', texte: 'Famille « ' + s.famille + ' » absente de systeme/metadonnees.md.' });
    }
    return out;
  }
  /* the alerts of one skill together: one card each */
  function surveillees() {
    const parSkill = new Map();
    for (const a of alertes()) { if (!parSkill.has(a.s.id)) parSkill.set(a.s.id, { s: a.s, al: [] }); parSkill.get(a.s.id).al.push(a); }
    return [...parSkill.values()].map(x => ({ ...x, vu: x.al.every(a => S.vus[a.cle]) }));
  }
  const aVoir = () => S.d.skills.filter(s => s.retours.length).length + surveillees().filter(x => !x.vu).length;
  const auRepos = () => S.d.mesure ? S.d.skills.filter(s => r30(s) === 0) : [];
  function semaine() {
    const limite = jourIl(7);
    return S.d.skills.filter(s => s.journal.some(j => j.date > limite));
  }

  /* ---------------------------- the catalogue ---------------------------- */
  function filtrees() {
    const q = fold(S.q).trim(), connues = new Set(familles().map(f => f.id));
    return S.d.skills.filter(s => {
      if (S.fam === 'sans' ? connues.has(s.famille) : S.fam !== 'toutes' && s.famille !== S.fam) return false;
      if (S.orig !== 'toutes' && s.origine !== S.orig) return false;
      return !q || fold([s.id, s.nom, s.resume, ...s.declencheurs].join(' ')).includes(q);
    }).sort((a, b) => r30(b) - r30(a) || rangFamille(a) - rangFamille(b) || a.id.localeCompare(b.id));
  }
  const rangFamille = s => { const i = familles().findIndex(f => f.id === s.famille); return i < 0 ? 99 : i; };

  function dessineCatalogue() {
    const d = S.d, fams = familles(), connues = new Set(fams.map(f => f.id));
    const sans = d.skills.filter(s => !connues.has(s.famille)).length;
    if (S.fam !== 'toutes' && !(S.fam === 'sans' ? sans : connues.has(S.fam))) S.fam = 'toutes';
    if (!d.socle) S.orig = 'toutes';
    $('compte').textContent = pluriel(d.skills.length, 'skill', 'skills') + (fams.length ? ', rangées par famille' : '') + '. Clique une carte pour lire sa fiche.';
    const n = aVoir(); $('badge').hidden = !n; $('badge').textContent = n; $('vers-entretien').title = n ? pluriel(n, 'chose', 'choses') + ' à voir' : 'Rien à voir pour l’instant';

    /* no family set: no filter at all */
    const puces = fams.length ? [{ id: 'toutes', nom: 'Toutes', n: d.skills.length, c: 'var(--texte)' }, ...fams.map((f, i) => ({ id: f.id, nom: f.nom, n: d.skills.filter(s => s.famille === f.id).length, c: COULEURS[i % COULEURS.length], titre: f.couvre })), ...(sans ? [{ id: 'sans', nom: 'Sans famille', n: sans, c: '' }] : [])] : [];
    $('familles').innerHTML = puces.map(p => `<button type="button" class="puce" data-famille="${esc(p.id)}" aria-pressed="${p.id === S.fam}"${p.titre ? ` title="${esc(p.titre)}"` : ''}><span class="pt${p.c ? '' : ' vide'}"${p.c ? ` style="background:${p.c}"` : ''}></span>${esc(p.nom)}<span class="n">${p.n}</span></button>`).join('');
    $('familles').hidden = !fams.length;
    $('origines').hidden = !d.socle;
    $('origines').innerHTML = [['toutes', 'Toutes'], ['socle', 'Socle'], ['perso', 'Les miennes']].map(o => `<button type="button" data-origine="${o[0]}" aria-pressed="${o[0] === S.orig}">${o[1]}</button>`).join('');

    const liste = filtrees(), max = Math.max(1, ...d.skills.map(r30));
    if (!liste.some(s => s.id === S.sel)) S.sel = (liste[0] || d.skills[0] || {}).id || '';
    $('cartes').innerHTML = liste.length ? liste.map(s => {
      const f = familleDe(s);
      const bas = d.mesure ? `<span class="jauge"><i style="width:${Math.round(100 * r30(s) / max)}%"></i></span>${r30(s)} × · 30 j` : '<span class="jauge"></span>usage non mesuré';
      return `<button type="button" class="carte" data-skill="${esc(s.id)}" aria-pressed="${s.id === S.sel}">
        <span class="carte-haut">${fams.length ? `<span class="pt${f ? '' : ' vide'}"${f ? ` style="background:${f.couleur}"` : ''}></span><span class="etiquette">${esc(f ? f.nom : s.famille || 'sans famille')}</span>` : ''}<span class="badges">${s.origine === 'perso' ? '<span class="badge agent">À toi</span>' : ''}${s.retours.length ? `<span class="badge attention">${pluriel(s.retours.length, 'retour', 'retours')}</span>` : ''}</span></span>
        <span class="carte-nom">/${esc(s.id)}</span>
        <span class="carte-texte">${esc(s.resume || 'Pas encore de description.')}</span>
        ${s.declencheurs.length ? `<span class="declencheurs">${s.declencheurs.slice(0, 2).map(t => `<span>« ${esc(t)} »</span>`).join('')}</span>` : ''}
        <span class="carte-bas">${bas}</span>
      </button>`;
    }).join('') : `<p class="rien">Aucune skill ne correspond${S.q ? ' à « ' + esc(S.q) + ' »' : ''}.</p>`;
    dessineDetail();
  }

  function barres(jours, mini) {
    if (!jours) return '';
    const v = []; for (let i = 29; i >= 0; i--) v.push([jourIl(i), jours[jourIl(i)] || 0, i < 7]);
    const h = Math.max(1, ...v.map(x => x[1]));
    return `<div class="barres${mini ? ' mini' : ''}" role="img" aria-label="${v.reduce((a, x) => a + x[1], 0)} lancements sur 30 jours">${v.map(x => `<i class="${x[2] ? 'semaine' : ''}" style="height:${Math.round(100 * x[1] / h)}%" title="${court(x[0])} · ${pluriel(x[1], 'lancement', 'lancements')}"></i>`).join('')}</div>`;
  }

  function dessineDetail() {
    const s = S.d.skills.find(x => x.id === S.sel), el = $('detail');
    if (!s) { el.innerHTML = '<p class="d-resume">Choisis une skill pour lire sa fiche.</p>'; return; }
    /* a note being typed is never wiped by a refresh */
    const brouillon = $('note-texte') && $('note-texte').dataset.skill === s.id ? $('note-texte').value : '';
    const f = familleDe(s), u = s.usage, d = S.d;
    let usage;
    if (!d.mesure) usage = '<p>L’usage n’est pas mesuré : il vient du journal d’usage ou des journaux de session de ton agent (voir <code>interface/USAGE.md</code>).</p>';
    else if (!u || !u.r30) usage = `${barres(u && u.jours || {}, false)}<p>Pas lancée ces 30 derniers jours${u && u.der ? ' (dernière fois : ' + depuis(u.der) + ')' : ''}.</p>`;
    else usage = `${barres(u.jours, false)}<div class="stats">
      <div class="stat"><span class="etiquette">7 j · 30 j</span><b>${u.r7} · ${u.r30}</b></div>
      <div class="stat"><span class="etiquette">Par lancement</span><b>${u.tok30 ? fmtTok(u.tok30 / u.r30) + ' tok' : '—'}</b></div>
      <div class="stat"><span class="etiquette">Tokens · 30 j</span><b>${u.tok30 ? fmtTok(u.tok30) : '—'}</b></div>
      <div class="stat"><span class="etiquette">Dernière fois</span><b>${depuis(u.der)}</b></div></div>`;
    const sert = s.sert.length ? `<ul>${s.sert.map(x => `<li><span class="chevron">&gt;</span><span>${x.genre === 'processus' ? 'Process' : 'Routine'} <a href="#" data-ouvrir="${esc(x.chemin)}">${esc(x.nom)}</a>${x.quand ? ' <span class="pale">· ' + esc(x.quand) + '</span>' : ''}${x.etat ? ' <span class="pale">· ' + esc(x.etat) + '</span>' : ''}</span></li>`).join('')}</ul>` : '<p>À la main : aucun process ni routine ne l’appelle.</p>';
    el.innerHTML = `
      <div class="d-tete"><span class="etiquette">${esc(s.chemin)}</span><span class="d-nom">/${esc(s.id)}</span><p class="d-resume">${esc(s.resume || 'Pas encore de description.')}</p>
        <span class="d-puces">${f ? `<span class="pastille"><span class="pt" style="background:${f.couleur}"></span>${esc(f.nom)}</span>` : familles().length ? `<span class="pastille attention">${s.famille ? 'famille inconnue : ' + esc(s.famille) : 'sans famille'}</span>` : ''}${s.origine ? `<span class="pastille${s.origine === 'perso' ? ' accent' : ''}">${s.origine === 'perso' ? 'à toi' : 'socle'}</span>` : ''}<span class="pastille" title="Une skill tient en ${s.plafond} lignes au plus">${s.lignes} / ${s.plafond} lignes</span></span></div>
      <div class="bloc usage"><div class="usage-tete"><h2>Usage</h2><span class="etiquette">30 derniers jours</span></div>${usage}</div>
      ${s.declencheurs.length ? `<div class="bloc"><h2>Quand la lancer</h2><ul>${s.declencheurs.map(t => `<li><span class="chevron">&gt;</span>« ${esc(t)} »</li>`).join('')}</ul></div>` : ''}
      ${s.etapes.length ? `<div class="bloc"><h2>Ce qu’elle fait</h2><ol>${s.etapes.map((t, i) => `<li><span class="num">${i + 1}.</span><span>${inline(t)}</span></li>`).join('')}</ol></div>` : ''}
      <div class="bloc"><h2>Où elle sert</h2>${sert}</div>
      ${s.journal.length ? `<div class="bloc"><h2>Journal des changements</h2><ul>${s.journal.slice(0, 6).map(j => `<li><span class="date">${court(j.date)}</span><span>${inline(j.quoi)}${j.pourquoi ? ' <span class="pale">· ' + inline(j.pourquoi) + '</span>' : ''}</span></li>`).join('')}</ul></div>` : ''}
      <div class="bloc retours"><span class="etiquette">Retours en attente · ${s.retours.length}${s.faits ? ' <span class="pale">(' + s.faits + ' déjà traités)</span>' : ''}</span>
        ${s.retours.length ? `<ul>${s.retours.map(r => `<li><span class="date">${court(r.date)}</span><span>« ${inline(r.texte)} »${r.contexte ? ' <span class="pale">· ' + esc(r.contexte) + '</span>' : ''}</span></li>`).join('')}</ul>` : '<p>Rien en attente.</p>'}
        <form class="ajout" id="note-form"><span aria-hidden="true">+</span><input id="note-texte" data-skill="${esc(s.id)}" maxlength="500" placeholder="Un retour sur /${esc(s.id)}, noté pour plus tard…" aria-label="Noter un retour sur /${esc(s.id)}"><button type="submit" class="btn petit">Noter</button></form></div>
      <div class="d-actions"><button type="button" class="btn" data-ouvrir="${esc(s.chemin)}">Ouvrir le fichier</button>${s.feedback ? `<button type="button" class="btn" data-ouvrir="${esc(s.feedback)}">feedback.md</button>` : ''}<button type="button" class="btn primaire" data-copier="/${esc(s.id)}">Copier /${esc(s.id)}</button></div>`;
    if (brouillon) $('note-texte').value = brouillon;
  }

  function choisis(id) {
    S.sel = id; store.set('choix', id);
    document.querySelectorAll('.carte').forEach(c => c.setAttribute('aria-pressed', c.dataset.skill === id));
    dessineDetail();
    if (matchMedia('(max-width:900px)').matches) $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------------------------- the upkeep ---------------------------- */
  function dessineEntretien() {
    const d = S.d, sv = surveillees(), repos = auRepos(), avecRet = d.skills.filter(s => s.retours.length);
    const cal = d.skills.find(s => s.id === 'calibrate');
    $('calibre').innerHTML = `${d.mesure && cal && cal.usage && cal.usage.der ? `<span class="etiquette">dernier calibrate · ${depuis(cal.usage.der)}</span>` : ''}${cal ? '<button type="button" class="btn primaire" data-copier="/calibrate" title="calibrate reprend aussi les retours mis de côté">Copier /calibrate</button>' : ''}`;
    const aSurveiller = sv.filter(x => !x.vu);
    $('tuiles').innerHTML = [
      ['À améliorer', avecRet.length, 'skills avec des retours', 'var(--attention)'],
      ['À surveiller', aSurveiller.length, 'taille, famille ou usage inhabituel', 'var(--accent)'],
      ['Au repos', d.mesure ? repos.length : '—', d.mesure ? 'rien depuis 30 jours' : 'usage non mesuré', 'var(--texte-doux)'],
      ['Modifiées', semaine().length, 'cette semaine, d’après leur journal', 'var(--ok)']
    ].map(t => `<div class="tuile"><span class="grand" style="color:${t[3]}">${t[1]}</span><span class="t-texte"><span class="etiquette" style="color:${t[3]}">${t[0]}</span><span>${t[2]}</span></span></div>`).join('');

    const tete = (num, titre, sous) => `<div class="col-tete"><span class="num">${num}</span><h2>${titre}</h2><span class="etiquette">${sous}</span></div>`;
    $('ameliorer').innerHTML = tete('01', 'À améliorer', 'retours mis de côté') + (avecRet.length ? avecRet.map(s => `<article class="fiche-e">
      <div class="fiche-e-tete"><button type="button" class="lien-skill" data-voir="${esc(s.id)}">/${esc(s.id)}</button><span class="droite"><span class="badge attention">${pluriel(s.retours.length, 'retour', 'retours')}</span></span></div>
      ${s.retours.map(r => `<div class="retour-e"><span class="date">${court(r.date)}</span><span>« ${inline(r.texte)} »${r.contexte ? `<small>${esc(r.contexte)}</small>` : ''}</span></div>`).join('')}
      ${s.origine === 'socle' ? '<p class="pale">Skill du socle : appliqués, ses retours passent par un souvenir et restent notés « pour le socle ».</p>' : ''}
      <div class="actions"><button type="button" class="btn primaire" data-copier="applique les retours de ${esc(s.id)}">Appliquer les retours</button><button type="button" class="btn" data-ouvrir="${esc(s.feedback)}">feedback.md</button></div>
    </article>`).join('') : '<p class="vide-col">Aucun retour en attente. Note-en un depuis la fiche d’une skill, ou avec <code>/note</code> pendant le travail.</p>');

    const tri = [...aSurveiller, ...sv.filter(x => x.vu)];
    $('surveiller').innerHTML = tete('02', 'À surveiller', d.mesure ? 'd’après l’usage et le fichier' : 'd’après le fichier') + (tri.length ? tri.map(x => `<article class="fiche-e${x.vu ? ' pale' : ''}">
      <div class="fiche-e-tete"><button type="button" class="lien-skill" data-voir="${esc(x.s.id)}">/${esc(x.s.id)}</button>${d.mesure ? `<span class="droite">${r30(x.s)} × · 30 j</span>` : ''}</div>
      ${x.al.map(a => `<p>${esc(a.texte)}</p>`).join('')}
      ${x.s.usage && x.s.usage.r30 && x.al.some(a => /:(cout|arret)$/.test(a.cle)) ? barres(x.s.usage.jours, true) : ''}
      <div class="actions"><button type="button" class="btn" data-ouvrir="${esc(x.s.chemin)}">Lire SKILL.md</button><button type="button" class="btn discret" data-vu="${esc(x.al.map(a => a.cle).join(' '))}">${x.vu ? 'Revoir' : 'Ça va'}</button></div>
    </article>`).join('') : '<p class="vide-col">Rien à signaler.</p>');

    $('repos').innerHTML = tete('03', 'Au repos', 'rien depuis 30 jours') + (!d.mesure ? '<p class="vide-col">L’usage n’est pas mesuré : impossible de dire ce qui dort. Voir <code>interface/USAGE.md</code>.</p>' : repos.length ? [...repos].sort((a, b) => !!S.gardes[a.id] - !!S.gardes[b.id] || a.id.localeCompare(b.id)).map(s => `<article class="fiche-e${S.gardes[s.id] ? ' pale' : ''}">
      <div class="fiche-e-tete"><button type="button" class="lien-skill" data-voir="${esc(s.id)}">/${esc(s.id)}</button><span class="droite">${s.usage && s.usage.der ? esc(depuis(s.usage.der)) : 'aucune trace'}</span></div>
      <p class="pale">${S.gardes[s.id] ? 'Gardée : elle sert peu, mais elle sert.' : s.sert.length ? 'Pas lancée depuis 30 jours, mais un process ou une routine l’appelle.' : 'Pas lancée depuis 30 jours, et rien ne l’appelle.'}</p>
      <div class="actions"><button type="button" class="btn" data-garde="${esc(s.id)}">${S.gardes[s.id] ? 'Revoir' : 'Garder'}</button>${s.origine === 'perso' ? `<button type="button" class="btn discret" data-copier="Archive la skill ${esc(s.id)} : déplace skills/${esc(s.id)}/ dans archives/skills/${esc(s.id)}/, puis relance index.py et verifier.py." title="Copie la demande à coller dans ton agent">Archiver</button>` : ''}</div>
    </article>`).join('') : '<p class="vide-col">Toutes tes skills ont servi ces 30 derniers jours.</p>');

    /* the journals end to end: one line per change, the skills that share it together */
    const groupes = new Map();
    for (const s of d.skills) for (const j of s.journal) {
      const cle = j.date + '|' + j.quoi;
      if (!groupes.has(cle)) groupes.set(cle, { date: j.date, quoi: j.quoi, ids: [] });
      groupes.get(cle).ids.push(s.id);
    }
    const lignes = [...groupes.values()].sort((a, b) => b.date.localeCompare(a.date) || a.quoi.localeCompare(b.quoi)).slice(0, 14);
    $('changements').innerHTML = `<div class="ch-tete"><h2>Ce qui a changé</h2><span>le journal des changements de chaque skill, mis bout à bout</span></div>` + (lignes.length ? lignes.map(l => `<div class="ch"><span class="chevron">&gt;</span><span class="date">[${court(l.date)}]</span><span class="quoi">${l.ids.map(id => `<button type="button" class="lien-skill" data-voir="${esc(id)}">${esc(id)}</button>`).join(' ')}<span>${inline(l.quoi)}</span></span></div>`).join('') : '<p class="vide-col">Aucun journal des changements pour l’instant.</p>');
  }

  /* ---------------------------- the two views ---------------------------- */
  function montre(vue) {
    S.vue = vue;
    $('vide').hidden = true;
    $('catalogue').hidden = vue !== 'catalogue'; $('entretien').hidden = vue !== 'entretien';
    $('ici').textContent = vue;
    history.replaceState(null, '', vue === 'entretien' ? '#entretien' : location.pathname + location.search);
    vue === 'entretien' ? dessineEntretien() : dessineCatalogue();
    scrollTo(0, 0);
  }
  const dessine = () => S.vue === 'entretien' ? dessineEntretien() : dessineCatalogue();

  async function charge() {
    const d = await api('/local/competences');
    if (d.error) { montreVide('Les skills ne se lisent pas', esc(d.error)); return false; }
    if (!d.skills.length) { montreVide('Aucune skill pour l’instant', 'Une skill vit dans <code>skills/&lt;nom&gt;/SKILL.md</code>, à partir du gabarit <code>systeme/gabarits/SKILL.md</code>.'); return false; }
    S.d = d; return true;
  }

  /* ---------------------------- gestures ---------------------------- */
  document.addEventListener('click', async e => {
    const b = e.target.closest('button,a'); if (!b) return;
    const ds = b.dataset;
    if (ds.skill) return choisis(ds.skill);
    if (ds.famille) { S.fam = ds.famille; store.set('famille', S.fam); return dessineCatalogue(); }
    if (ds.origine) { S.orig = ds.origine; store.set('origine', S.orig); return dessineCatalogue(); }
    if (ds.ouvrir) { e.preventDefault(); return ouvrirFichier(ds.ouvrir); }
    if (ds.copier) return copieCommande(ds.copier);
    if (ds.voir) { S.sel = ds.voir; store.set('choix', ds.voir); S.fam = 'toutes'; S.orig = 'toutes'; S.q = ''; $('cherche').value = ''; return montre('catalogue'); }
    if (ds.vu) { const cles = ds.vu.split(' '), vu = !cles.every(k => S.vus[k]); for (const k of cles) { if (vu) S.vus[k] = true; else delete S.vus[k]; } store.set('vus', S.vus); return dessineEntretien(); }
    if (ds.garde) { S.gardes[ds.garde] = !S.gardes[ds.garde]; if (!S.gardes[ds.garde]) delete S.gardes[ds.garde]; store.set('gardes', S.gardes); return dessineEntretien(); }
    if (b.id === 'vers-entretien') return montre('entretien');
    if (b.id === 'vers-catalogue') { e.preventDefault(); return montre('catalogue'); }
  });
  $('cherche').addEventListener('input', e => { S.q = e.target.value; dessineCatalogue(); });
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'note-form') return;
    e.preventDefault();
    const input = $('note-texte'), texte = input.value.trim(), id = input.dataset.skill;
    if (!texte) return input.focus();
    input.disabled = true;
    const r = await post('/local/competences/retour', { id, texte });
    if (r.error) { input.disabled = false; return toast(r.error, 'mal'); }
    input.value = '';
    toast('Retour noté dans ' + r.path + '. Il attend que tu demandes de l’appliquer.');
    if (await charge()) dessine();
  });

  /* the look (night, day, colour) is set here and kept in this browser */
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
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === '/' && !typing && S.vue === 'catalogue') { e.preventDefault(); $('cherche').focus(); return; }
    if (e.key !== 'Escape') return;
    if (!$('reglages').hidden) return fermeReglages();
    if (typing) { if (document.activeElement.id === 'cherche' && S.q) { S.q = ''; $('cherche').value = ''; dessineCatalogue(); } return; }
    if (S.vue === 'entretien') return montre('catalogue');
    if (embedded) parent.postMessage({ type: 'competences-copy-back' }, '*');
  });
  if (embedded) $('retour').hidden = true;

  /* back on the tab, or on the window: the skills may have changed meanwhile */
  let frais = 0;
  async function rafraichit() {
    if (Date.now() - frais < 4000 || !S.d) return;
    frais = Date.now();
    if (await charge()) dessine();
  }
  addEventListener('focus', rafraichit);
  addEventListener('hashchange', () => { if (S.d) montre(location.hash === '#entretien' ? 'entretien' : 'catalogue'); });
  addEventListener('message', e => { if (e.source === parent && e.data && e.data.type === 'competences-copy' && e.data.action === 'shown') rafraichit(); });

  (async () => {
    frais = Date.now();
    if (await charge()) montre(S.vue);
    if (embedded) parent.postMessage({ type: 'competences-copy-ready' }, '*');
  })();
})();

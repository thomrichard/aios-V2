/* SM4RT Connecteurs: the Second Brain's Connecteurs tab, or /connecteurs/ on its own.
   Catalogue: every tool of systeme/connexions.md as a card, from the lightest way of plugging it in to the heaviest, with its
   sheet beside it: how it is plugged in, where it serves, its calls over 30 days, its last test.
   Entretien: what to test again, what deserves an eye (off the list, heavy, not counted), what is no longer used, and the
   Git history of the table. The page writes nothing: every gesture it cannot do itself (test again, write a line, remove
   one) is copied as a request for your agent. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const fold = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-connecteurs:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-connecteurs:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  /* the order of systeme/connexions.md, from the lightest to the heaviest: its weight is the number of pips */
  const METHODES = {
    officiel: { nom: 'Outil officiel', c: 'var(--ok)', poids: 1, regle: 'L’outil de l’éditeur : le plus sûr' },
    cli: { nom: 'CLI', c: 'var(--accent)', poids: 2, regle: 'Une commande : peu de tokens, tous les agents' },
    api: { nom: 'API', c: 'var(--attention)', poids: 3, regle: 'L’API, avec une clé rangée dans .env' },
    mcp: { nom: 'MCP', c: 'var(--agent)', poids: 4, regle: 'Le plus lourd : une configuration par agent' },
    autre: { nom: 'Autre', c: 'var(--texte-pale)', poids: 0, regle: 'Une méthode absente de l’ordre de branchement' }
  };
  const AGENTS_CONNUS = ['claude', 'codex', 'gemini'];
  const nomAgent = id => ({ claude: 'Claude', codex: 'Codex', gemini: 'Gemini' }[id] || id.charAt(0).toUpperCase() + id.slice(1));
  const S = {
    d: null, vue: location.hash === '#entretien' ? 'entretien' : 'catalogue', q: '',
    meth: store.get('methode', 'toutes'), agent: store.get('agent', 'tous'), sel: store.get('choix', ''),
    vus: store.get('vus', {}), gardes: store.get('gardes', {}), copies: {}
  };

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
  const pad = n => String(n).padStart(2, '0');
  const court = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s.slice(8, 10) + '.' + s.slice(5, 7) : '';
  const pluriel = (n, un, plusieurs) => n + ' ' + (n > 1 ? plusieurs : un);
  /* a day as usage.mjs writes it (UTC), i days ago */
  const jourIl = i => new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
  /* the local day, for the date of a test (written by hand in the table) */
  const aujourdhui = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const ageTest = iso => Math.round((Date.parse(aujourdhui()) - Date.parse(iso)) / 864e5);
  const ageAppel = iso => Math.round((Date.parse(jourIl(0)) - Date.parse(iso)) / 864e5);
  const ilYa = n => n <= 0 ? 'aujourd’hui' : n === 1 ? 'hier' : 'il y a ' + n + ' j';
  function ouvrirFichier(chemin) {
    if (!chemin) return;
    if (embedded) parent.postMessage({ type: 'connecteurs-copy-edit', path: chemin }, '*');
    else window.open('/fichiers/?f=' + enc(chemin), '_blank', 'noopener');
  }
  async function copier(texte) {
    try { await navigator.clipboard.writeText(texte); return true; } catch (_) { }
    const t = document.createElement('textarea'); t.value = texte; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.append(t); t.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) { }
    t.remove(); return ok;
  }
  async function copieDemande(texte, simple) {
    const ok = await copier(texte);
    toast(ok ? 'Copié : « ' + texte + ' ».' + (simple ? '' : ' Colle-le dans ton agent.') : 'Copie impossible ici : tape « ' + texte + ' » dans ton agent.', ok ? '' : 'mal');
    return ok;
  }
  function montreVide(titre, texte) {
    $('vide').hidden = false; $('catalogue').hidden = true; $('entretien').hidden = true;
    $('vide-titre').textContent = titre; $('vide-texte').innerHTML = texte || '';
  }

  /* ---------------------------- what the data says ---------------------------- */
  const liste = () => (S.d && S.d.connecteurs) || [];
  const M = c => METHODES[c.methode] || METHODES.autre;
  const parId = id => liste().find(c => c.id === id);
  const retester = c => !c.teste || ageTest(c.teste) > 30;
  const a7 = c => c.usage ? c.usage.a7 : 0;
  const a30 = c => c.usage ? c.usage.a30 : -1;
  /* the name the OS counts: the server of an MCP or of an account connector, the script of an API, else the typed command */
  const genreCmd = c => !c.commandes.length ? '' : c.methode === 'api' ? 'script' : (c.methode === 'mcp' || /^[A-Z]/.test(c.commandes[0])) ? 'serveur' : 'commande';
  const demandeRetest = c => 'Reteste la connexion ' + c.nom + ' par une vraie lecture, puis mets à jour sa colonne « Testé le » dans systeme/connexions.md.';
  const demandeInscris = h => 'Inscris ' + h.serveur + ' dans systeme/connexions.md, après une vraie lecture : sa méthode, pourquoi on s’en sert, les agents, la date du test, et « ' + h.serveur + ' » dans la colonne Commande.';
  const demandeRetire = c => 'Je veux retirer la connexion ' + c.nom + ' de systeme/connexions.md : aucun appel depuis 7 jours. Montre-moi ce que ça enlève (sa ligne, sa configuration dans mes agents), puis attends mon accord avant de supprimer quoi que ce soit.';
  const agentsPresents = () => {
    const vus = new Set(liste().flatMap(c => c.agents));
    return [...AGENTS_CONNUS.filter(a => vus.has(a)), ...[...vus].filter(a => !AGENTS_CONNUS.includes(a)).sort()];
  };

  /* what deserves an eye: one card per tool, even with several reasons */
  function surveillees() {
    const d = S.d, cartes = [];
    for (const h of d.horsListe) cartes.push({ cle: 'hors:' + h.serveur, nom: h.serveur, m: METHODES.mcp, jours: h.jours, rang: 0,
      raisons: [{ type: 'hors', etiquette: 'HORS LISTE', attention: true, texte: 'Ton agent l’a appelé ' + pluriel(h.a30, 'fois', 'fois') + ' ces 30 jours, mais il n’est pas dans systeme/connexions.md : ni testé, ni compté dans tes connecteurs.', action: ['Copier « inscris ' + h.serveur + ' »', 'data-copier="' + esc(demandeInscris(h)) + '"'] }] });
    for (const c of liste()) {
      const raisons = [];
      if (d.mesure && c.methode === 'mcp' && c.usage && c.usage.a30 >= 10)
        raisons.push({ type: 'leger', etiquette: 'PLUS LÉGER ?', texte: 'Un MCP appelé ' + c.usage.a30 + ' fois en 30 jours, et le plus lourd de l’ordre de branchement. Une CLI, l’outil officiel ou l’API ferait peut-être l’affaire.', action: ['Copier /search-connectors ' + c.nom, 'data-copier="/search-connectors ' + esc(c.nom) + '"'], barres: true });
      if (!c.commandes.length)
        raisons.push({ type: 'noncompte', etiquette: 'NON COMPTÉ', texte: 'Sa colonne Commande est vide : l’OS ne peut pas compter ses appels, ni dire s’il sert encore.', action: ['Ouvrir sa ligne', 'data-ouvrir="' + esc(d.chemin) + '"'] });
      if (raisons.length) cartes.push({ cle: c.id, nom: c.nom, c, m: M(c), jours: c.usage && c.usage.jours, raisons, rang: raisons[0].type === 'leger' ? 1 : 2 });
    }
    for (const x of cartes) { x.cles = x.raisons.map(r => x.cle + ':' + r.type); x.vu = x.cles.every(k => S.vus[k]); }
    return cartes.sort((a, b) => a.vu - b.vu || a.rang - b.rang || a.nom.localeCompare(b.nom));
  }
  /* not called this week, when the usage is measured and the command is filled in */
  const aRetirer = () => S.d.mesure ? liste().filter(c => c.commandes.length && c.usage && c.usage.a7 === 0) : [];
  /* the tools that need a look, counted once each */
  function aVoir() {
    const ids = new Set();
    for (const c of liste()) if (retester(c)) ids.add(c.id);
    for (const x of surveillees()) if (!x.vu) ids.add(x.cle);
    for (const c of aRetirer()) if (!S.gardes[c.id]) ids.add(c.id);
    return ids.size;
  }

  /* ---------------------------- the catalogue ---------------------------- */
  function filtrees() {
    const q = fold(S.q).trim();
    return liste().filter(c => {
      if (S.meth !== 'toutes' && c.methode !== S.meth) return false;
      if (S.agent !== 'tous' && !c.agents.includes(S.agent)) return false;
      return !q || fold([c.nom, c.pourquoi, M(c).nom, ...c.commandes].join(' ')).includes(q);
    }).sort((a, b) => a30(b) - a30(a) || a.poids - b.poids || a.nom.localeCompare(b.nom));
  }
  const pips = c => `<span class="pips" aria-hidden="true">${[1, 2, 3, 4].map(i => `<i${i <= M(c).poids ? ' class="on"' : ''}></i>`).join('')}</span>`;

  function dessineCatalogue() {
    const d = S.d, tous = liste(), vide = !tous.length;
    $('compte').textContent = vide ? 'Aucun outil branché pour l’instant.' : pluriel(tous.length, 'outil branché', 'outils branchés') + ', du plus léger au plus lourd. Clique une carte pour lire sa fiche.';
    const n = aVoir(); $('badge').hidden = !n; $('badge').textContent = n; $('vers-entretien').title = n ? pluriel(n, 'chose', 'choses') + ' à voir' : 'Rien à voir pour l’instant';
    $('source').textContent = 'lu dans ' + d.chemin;
    $('cherche').closest('label').hidden = vide; $('filtres').hidden = vide; $('detail').hidden = vide;
    if (vide) {
      $('cartes').innerHTML = `<div class="rien"><h2>Aucun connecteur pour l’instant</h2><p>${d.existe ? 'Le tableau de' : 'Le fichier'} <code>${esc(d.chemin)}</code> ${d.existe ? 'est vide.' : 'n’existe pas.'} Un outil s’y inscrit après une vraie lecture, dans l’ordre : l’outil officiel, une CLI, l’API, puis un MCP.</p><button type="button" class="btn primaire" data-copier="/search-connectors">Copier /search-connectors</button></div>`;
      return;
    }
    if (S.meth !== 'toutes' && !METHODES[S.meth]) S.meth = 'toutes';
    const presents = agentsPresents();
    if (S.agent !== 'tous' && !presents.includes(S.agent)) S.agent = 'tous';
    const methodes = [['toutes', 'Toutes', 'var(--texte)', 'Tous les connecteurs', tous.length], ...['officiel', 'cli', 'api', 'mcp', 'autre'].filter(k => k !== 'autre' || tous.some(c => c.methode === 'autre')).map(k => [k, METHODES[k].nom, METHODES[k].c, METHODES[k].regle, tous.filter(c => c.methode === k).length])];
    $('methodes').innerHTML = methodes.map(m => `<button type="button" class="puce" data-methode="${m[0]}" aria-pressed="${m[0] === S.meth}" title="${esc(m[3])}" style="--m:${m[2]}"><span class="pt"></span>${esc(m[1])}<span class="n">${m[4]}</span></button>`).join('');
    $('agents').hidden = !presents.length;
    $('agents').innerHTML = [['tous', 'Tous'], ...presents.map(a => [a, nomAgent(a)])].map(o => `<button type="button" data-agent="${esc(o[0])}" aria-pressed="${o[0] === S.agent}">${esc(o[1])}</button>`).join('');

    const vues = filtrees(), max = Math.max(1, ...tous.map(a30));
    if (!vues.some(c => c.id === S.sel)) S.sel = (vues[0] || tous[0] || {}).id || '';
    $('detail').hidden = !vues.length;
    $('cartes').innerHTML = vues.length ? vues.map(c => {
      const u = c.usage, vieux = retester(c), semaine = !vieux && u && u.a7 === 0;
      const appels = u ? `<span class="jauge"><i style="width:${Math.round(100 * u.a30 / max)}%"></i></span>${u.a30} appels · 30 j` : `<span class="jauge"></span>${c.commandes.length ? 'non mesuré' : 'non compté'}`;
      return `<button type="button" class="carte" data-connecteur="${esc(c.id)}" aria-pressed="${c.id === S.sel}" style="--m:${M(c).c}">
        <span class="carte-haut"><span class="pt"></span><span class="etiquette">${esc(M(c).nom)}</span>${pips(c)}<span class="badges">${vieux ? '<span class="badge attention">À RETESTER</span>' : ''}${semaine ? '<span class="badge">PAS CETTE SEMAINE</span>' : ''}</span></span>
        <span class="carte-nom">${esc(c.nom)}</span>
        <span class="carte-texte">${esc(c.pourquoi || 'Pas de description.')}</span>
        <span class="commandes">${c.commandes.length ? c.commandes.map(n => `<span>${esc(n)}</span>`).join('') : '<span class="aucune">pas de commande</span>'}</span>
        <span class="carte-bas"><span class="carte-appels">${appels}</span><span class="carte-teste${vieux ? ' vieux' : ''}">${c.teste ? 'testé ' + ilYa(ageTest(c.teste)) : 'jamais testé'}</span></span>
      </button>`;
    }).join('') : `<p class="rien">Aucun connecteur ne correspond${S.q ? ' à « ' + esc(S.q) + ' »' : ''}.</p>`;
    dessineDetail();
  }

  function barres(jours, mini) {
    const v = []; for (let i = 29; i >= 0; i--) v.push([jourIl(i), (jours || {})[jourIl(i)] || 0, i < 7]);
    const h = Math.max(1, ...v.map(x => x[1]));
    return `<div class="barres${mini ? ' mini' : ''}" role="img" aria-label="${pluriel(v.reduce((a, x) => a + x[1], 0), 'appel', 'appels')} sur 30 jours">${v.map(x => `<i class="${x[2] ? 'semaine' : ''}" style="height:${Math.round(100 * x[1] / h)}%" title="${court(x[0])} · ${pluriel(x[1], 'appel', 'appels')}"></i>`).join('')}</div>`;
  }
  const code = n => `<code>${esc(n)}</code>`;
  /* how it is plugged in, from the method, the command and the agents */
  function branche(c) {
    const t = [], cmd = c.commandes.map(code).join(', ');
    if (c.methode === 'officiel') t.push('L’outil officiel de l’éditeur : le plus léger et le plus sûr de l’ordre de branchement.');
    else if (c.methode === 'cli') { t.push(c.commandes.length ? 'La commande ' + cmd + ', installée sur cet ordinateur.' : 'Une commande installée sur cet ordinateur.'); t.push('Réponse courte, peu de tokens : elle marche avec tous les agents.'); }
    else if (c.methode === 'api') { t.push(c.commandes.length ? 'Le script ' + cmd + ' appelle l’API de l’application.' : 'Un script appelle l’API de l’application.'); t.push('Clé dans .env (l’OS ne la lit jamais).'); }
    else if (c.methode === 'mcp') t.push('Un serveur MCP' + (c.commandes.length ? ' (' + cmd + ')' : '') + ' : le plus lourd de l’ordre de branchement, chaque agent a sa propre configuration.');
    else t.push('Méthode « ' + esc(c.methodeBrut || 'vide') + ' » : elle n’est pas dans l’ordre de branchement de systeme/connexions.md.');
    t.push(c.commandes.length ? 'L’OS compte les appels au ' + (genreCmd(c) || 'nom') + ' ' + cmd + '.' : 'Colonne Commande vide : l’OS ne peut pas compter ses appels.');
    if (!c.agents.length) t.push('Colonne Agents vide : on ne sait pas pour quels agents il est branché.');
    else {
      t.push('Branché pour ' + c.agents.map(nomAgent).join(', ') + '.');
      const manque = AGENTS_CONNUS.filter(a => !c.agents.includes(a));
      if ((c.methode === 'mcp' || c.methode === 'api') && manque.length) t.push('Pas encore branché pour ' + manque.map(nomAgent).join(' ni ') + '.');
    }
    return t;
  }

  function dessineDetail() {
    const c = parId(S.sel), el = $('detail'), d = S.d;
    if (!c) { el.innerHTML = '<p class="d-resume">Choisis un connecteur pour lire sa fiche.</p>'; return; }
    const u = c.usage, vieux = retester(c), age = c.teste ? ageTest(c.teste) : null;
    let usage;
    if (!c.commandes.length) usage = '<p>Non compté : la colonne Commande de sa ligne est vide. Écris-y le nom du serveur ou de la commande, et l’OS comptera ses appels.</p>';
    else if (!d.mesure) usage = '<p>L’usage n’est pas mesuré : il vient du journal d’usage ou des journaux de session de ton agent (voir <code>interface/USAGE.md</code>).</p>';
    else if (!u) usage = '<p>Pas encore de ligne d’usage pour lui : actualise les données (l’icône en haut à droite).</p>';
    else {
      const jours = Object.entries(u.jours || {}).filter(([k, n]) => n > 0 && k >= jourIl(29)).length;
      usage = `${barres(u.jours, false)}<div class="stats">
        <div class="stat"><span class="etiquette">7 j · 30 j</span><b>${u.a7} · ${u.a30}</b></div>
        <div class="stat"><span class="etiquette">Jours actifs</span><b>${jours} / 30</b></div>
        <div class="stat"><span class="etiquette">Dernier appel</span><b>${u.der ? ilYa(ageAppel(u.der)) : 'jamais'}</b></div>
        <div class="stat"><span class="etiquette">Chaque semaine</span><b class="${u.a7 > 0 ? 'ok' : 'attention'}">${u.a7 > 0 ? 'oui' : 'pas cette semaine'}</b></div></div>`;
    }
    const sert = c.sert.length ? `<ul>${c.sert.map(x => `<li><span class="genre">${x.genre === 'processus' ? 'Process' : x.genre === 'routine' ? 'Routine' : 'Skill'}</span><span><a href="#" data-ouvrir="${esc(x.chemin)}">${esc(x.nom)}</a></span></li>`).join('')}</ul>` : '<p>Aucune skill, routine ni process ne le cite : il sert à la main.</p>';
    const test = !c.teste
      ? `<div class="encart vieux"><span class="etiquette">Dernier test · jamais</span><p>${c.testeBrut ? 'La date « ' + esc(c.testeBrut) + ' » n’est pas lisible (AAAA-MM-JJ attendu).' : 'Aucune date dans « Testé le ».'} Une vraie lecture, puis la date dans la colonne.</p></div>`
      : `<div class="encart ${vieux ? 'vieux' : 'ok'}"><span class="etiquette">Dernier test · ${court(c.teste)} · ${ilYa(age)}</span><p>${vieux ? 'Plus d’un mois sans vraie lecture : une clé expire, un service change. Retester, c’est demander une lecture à l’agent, puis la date dans « Testé le ».' : 'Une vraie lecture, comme le veut systeme/connexions.md. Prochain test conseillé ' + (age >= 30 ? 'aujourd’hui' : 'dans ' + (30 - age) + ' j') + '.'}</p></div>`;
    const leger = c.methode === 'mcp' ? `<div class="encart leger"><span class="etiquette">Plus léger ?</span><p>Le MCP est le plus lourd de l’ordre de branchement. L’outil officiel, une CLI ou l’API ferait peut-être l’affaire.</p><button type="button" class="btn" data-copier="/search-connectors ${esc(c.nom)}">Copier /search-connectors ${esc(c.nom)}</button></div>` : '';
    el.innerHTML = `
      <div class="d-tete" style="--m:${M(c).c}"><span class="etiquette">${esc(d.chemin)} · ligne ${c.ligne}</span><span class="d-nom">${esc(c.nom)}</span>
        <span class="d-cmd">${c.commandes.length ? esc(genreCmd(c)) + ' <b>' + c.commandes.map(esc).join(', ') + '</b>' : 'pas de commande'}</span>
        <p class="d-resume">${esc(c.pourquoi || 'Pas de description.')}</p>
        <span class="d-puces"><span class="pastille"><span class="pt"></span>${esc(M(c).nom)}${M(c).poids ? ' · poids ' + M(c).poids + '/4' : ''}</span>${c.agents.length ? `<span class="pastille">${c.agents.map(nomAgent).join(' · ')}</span>` : '<span class="pastille attention">agents non précisés</span>'}</span></div>
      <div class="bloc usage"><div class="usage-tete"><h2>Appels</h2><span class="etiquette">30 derniers jours</span></div>${usage}</div>
      <div class="bloc"><h2>Comment il est branché</h2><ul>${branche(c).map(t => `<li><span class="chevron">&gt;</span><span>${t}</span></li>`).join('')}</ul></div>
      <div class="bloc"><h2>Où il sert</h2>${sert}</div>
      ${test}${leger}
      <div class="d-actions"><button type="button" class="btn" data-ouvrir="${esc(d.chemin)}">Ouvrir connexions.md</button>${c.commandes.length ? `<button type="button" class="btn" data-copie-simple="${esc(c.commandes[0])}">Copier la commande</button>` : ''}<button type="button" class="btn primaire" data-copier="${esc(demandeRetest(c))}" title="Copie la demande : une vraie lecture, puis la date dans « Testé le »">Retester avec l’agent</button></div>`;
  }

  function choisis(id) {
    S.sel = id; store.set('choix', id);
    document.querySelectorAll('.carte').forEach(c => c.setAttribute('aria-pressed', c.dataset.connecteur === id));
    dessineDetail();
    if (matchMedia('(max-width:900px)').matches) $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------------------------- the upkeep ---------------------------- */
  /* « testé » / « branché (MCP) » / « mis à jour : Agents »: what a commit did to one line, alone (s) or with others (p) */
  function phrase(it) {
    if (it.quoi === 'ajouté') { const m = it.methode ? ' (' + it.methode + ')' : ''; return { s: 'branché' + m, p: 'branchés' + m }; }
    if (it.quoi === 'retiré') return { s: 'retiré', p: 'retirés' };
    const autres = it.cols.filter(c => c.col !== 'Testé le').map(c => c.col), teste = it.cols.some(c => c.col === 'Testé le');
    if (!autres.length) return { s: 'testé', p: 'testés' };
    const reste = 'mis à jour : ' + autres.join(', ');
    return { s: (teste ? 'testé, ' : '') + reste, p: (teste ? 'testés, ' : '') + reste };
  }
  function dessineChangements() {
    const ch = S.d.changements, d = S.d, lignes = [];
    for (const k of ch.commits) {
      const groupes = new Map();
      for (const it of k.items) { const p = phrase(it); if (!groupes.has(p.s)) groupes.set(p.s, { p, noms: [] }); groupes.get(p.s).noms.push(it.outil); }
      for (const g of groupes.values()) lignes.push({ date: k.date, noms: g.noms, texte: g.noms.length > 1 ? g.p.p : g.p.s });
    }
    const presents = new Map(liste().map(c => [c.nom, c.id]));
    $('changements').innerHTML = `<div class="ch-tete"><h2>Ce qui a changé</h2><span>l’historique Git de ${esc(d.chemin)}</span></div>` + (lignes.length ? lignes.slice(0, 14).map(l => `<div class="ch"><span class="chevron">&gt;</span><span class="date">[${court(l.date)}]</span><span class="quoi">${l.noms.map(n => presents.has(n) ? `<button type="button" class="lien-cx" data-voir="${esc(presents.get(n))}">${esc(n)}</button>` : `<span class="lien-cx">${esc(n)}</span>`).join(' · ')}<span>${esc(l.texte)}</span></span></div>`).join('')
      : `<p class="vide-col">${ch.git ? 'Aucun changement dans l’historique de ce fichier pour l’instant.' : 'Pas d’historique Git ici : le dossier n’est pas un dépôt Git, ou le fichier n’a jamais été enregistré dedans.'}</p>`);
  }

  function dessineEntretien() {
    const d = S.d, tous = liste(), vieux = tous.filter(retester), sv = surveillees(), nonVus = sv.filter(x => !x.vu), repos = aRetirer();
    const derniers = tous.map(c => c.teste).filter(Boolean).sort(), dernier = d.dernierTest || derniers[derniers.length - 1];
    $('dernier').innerHTML = `${dernier ? `<span class="etiquette">dernier test · ${ilYa(ageTest(dernier))}</span>` : ''}<button type="button" class="btn primaire" data-copier="/search-connectors" title="Brancher un outil : la skill cherche le plus léger qui marche">Copier /search-connectors</button>`;
    $('sans-usage').hidden = !tous.length || d.mesure;
    $('sans-usage').innerHTML = 'L’usage n’est pas mesuré : rien n’est estimé. Il vient du journal d’usage ou des journaux de session de ton agent (voir <code>interface/USAGE.md</code>). Sans lui, la page ne dit ni ce qui sert, ni ce qui ne sert plus.';
    const semaine = d.mesure ? tous.reduce((a, c) => a + a7(c), 0) : '—';
    $('tuiles').innerHTML = [
      ['À retester', vieux.length, 'pas de lecture depuis un mois', 'var(--attention)', ' attention'],
      ['À surveiller', nonVus.length, 'hors liste, lourd ou non compté', 'var(--accent)', ''],
      ['À retirer ?', d.mesure ? repos.filter(c => !S.gardes[c.id]).length : '—', d.mesure ? 'pas servi cette semaine' : 'usage non mesuré', 'var(--texte-doux)', ''],
      ['Appels cette semaine', semaine, d.mesure ? 'sur ta liste de connecteurs' : 'usage non mesuré', 'var(--ok)', '']
    ].map(t => `<div class="tuile${t[4]}"><span class="grand" style="color:${t[3]}">${t[1]}</span><span class="t-texte"><span class="etiquette" style="color:${t[3]}">${t[0]}</span><span>${t[2]}</span></span></div>`).join('');

    const tete = (num, titre, sous) => `<div class="col-tete"><span class="num">${num}</span><h2>${titre}</h2><span class="etiquette">${sous}</span></div>`;
    $('retester').innerHTML = tete('01', 'À retester', 'plus d’un mois sans lecture') + (vieux.length ? vieux.map(c => {
      const pourquoi = c.methode === 'api' ? 'Une API avec une clé : la clé a peut-être expiré. Une vraie lecture le dira.'
        : !c.teste ? 'Jamais testé, ou sans date lisible dans « Testé le ». Une vraie lecture dira s’il marche.'
        : !c.commandes.length ? 'Pas testé depuis un mois, et ses appels ne sont pas comptés : on ne sait pas s’il marche encore.' : 'Pas de vraie lecture depuis plus d’un mois.';
      return `<article class="fiche-e"><div class="fiche-e-tete" style="--m:${M(c).c}"><span class="pt"></span><button type="button" class="lien-cx" data-voir="${esc(c.id)}">${esc(c.nom)}</button><span class="droite"><span class="badge attention">${c.teste ? 'testé ' + ilYa(ageTest(c.teste)) : 'jamais testé'}</span></span></div>
        <p>${pourquoi}</p>
        ${S.copies[c.id] ? `<div class="copie">✓ copié : « Reteste la connexion ${esc(c.nom)}… » · colle-le dans ton agent<button type="button" data-annuler="${esc(c.id)}">annuler</button></div>`
          : `<div class="actions"><button type="button" class="btn primaire" data-retester="${esc(c.id)}">Retester avec l’agent</button><button type="button" class="btn pas-flex" data-ouvrir="${esc(d.chemin)}">sa ligne</button></div>`}</article>`;
    }).join('') : '<p class="vide-col">' + (tous.length ? 'Tout a été testé il y a moins d’un mois.' : 'Aucun connecteur à tester.') + '</p>');

    $('surveiller').innerHTML = tete('02', 'À surveiller', 'la liste et le poids') + (sv.length ? sv.map(x => `<article class="fiche-e${x.vu ? ' pale' : ''}${x.raisons[0].attention && !x.vu ? ' attention' : ''}">
      <div class="fiche-e-tete" style="--m:${x.m.c}"><span class="pt"></span>${x.c ? `<button type="button" class="lien-cx" data-voir="${esc(x.c.id)}">${esc(x.nom)}</button>` : `<span class="lien-cx">${esc(x.nom)}</span>`}<span class="droite">${x.raisons.map(r => `<span class="badge${r.attention ? ' attention' : ''}">${r.etiquette}</span>`).join('')}</span></div>
      ${x.raisons.map(r => `<p>${esc(r.texte)}</p>`).join('')}
      ${x.jours && x.raisons.some(r => r.type !== 'noncompte') ? barres(x.jours, true) : ''}
      <div class="actions">${x.raisons.map(r => `<button type="button" class="btn" ${r.action[1]}>${esc(r.action[0])}</button>`).join('')}<button type="button" class="btn discret" data-vu="${esc(x.cles.join(' '))}">${x.vu ? 'Revoir' : 'Ça va'}</button></div>
    </article>`).join('') : '<p class="vide-col">Rien à signaler.</p>');

    let texteRetirer;
    if (!tous.length) texteRetirer = '<p class="vide-col">Aucun connecteur dans la liste.</p>';
    else if (!d.mesure) texteRetirer = '<p class="vide-col">L’usage n’est pas mesuré : impossible de dire ce qui ne sert plus, et la page n’estime rien. Voir <code>interface/USAGE.md</code>.</p>';
    else if (!repos.length) texteRetirer = '<p class="vide-col">Tout ce qui est compté a servi cette semaine.</p>';
    else texteRetirer = [...repos].sort((a, b) => !!S.gardes[a.id] - !!S.gardes[b.id] || a.nom.localeCompare(b.nom)).map(c => {
      const garde = !!S.gardes[c.id], u = c.usage;
      const note = garde ? 'Gardé : il sert peu, mais il sert.' : u.a30 ? pluriel(u.a30, 'appel', 'appels') + ' ces 30 jours, aucun depuis 7 jours.' : 'Aucun appel ces 30 jours.';
      return `<article class="fiche-e${garde ? ' pale' : ''}"><div class="fiche-e-tete" style="--m:${M(c).c}"><span class="pt"></span><button type="button" class="lien-cx" data-voir="${esc(c.id)}">${esc(c.nom)}</button><span class="droite">${u.der ? 'dernier appel ' + ilYa(ageAppel(u.der)) : 'jamais appelé'}</span></div>
        <p>${note}</p>
        <div class="actions"><button type="button" class="btn" data-garde="${esc(c.id)}">${garde ? 'Revoir' : 'Garder'}</button><button type="button" class="btn discret" data-copier="${esc(demandeRetire(c))}" title="Copie la demande à coller dans ton agent : la page ne retire rien">Retirer</button></div></article>`;
    }).join('');
    $('retirer').innerHTML = tete('03', 'À retirer ?', 'pas servi cette semaine') + '<p class="regle">La règle de systeme/connexions.md : un connecteur qui ne sert pas chaque semaine est retiré.</p>' + texteRetirer;
    dessineChangements();
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
    const d = await api('/local/connecteurs');
    if (d.error) { montreVide('Les connecteurs ne se lisent pas', esc(d.error)); return false; }
    S.d = d; return true;
  }

  /* ---------------------------- gestures ---------------------------- */
  document.addEventListener('click', async e => {
    const b = e.target.closest('button,a'); if (!b) return;
    const ds = b.dataset;
    if (ds.connecteur) return choisis(ds.connecteur);
    if (ds.methode) { S.meth = ds.methode; store.set('methode', S.meth); return dessineCatalogue(); }
    if (ds.agent) { S.agent = ds.agent; store.set('agent', S.agent); return dessineCatalogue(); }
    if (ds.ouvrir) { e.preventDefault(); return ouvrirFichier(ds.ouvrir); }
    if (ds.copier) return copieDemande(ds.copier);
    if (ds.copieSimple) return copieDemande(ds.copieSimple, true);
    if (ds.retester) {
      const c = parId(ds.retester); if (!c) return;
      if (await copier(demandeRetest(c))) { S.copies[c.id] = true; return dessineEntretien(); }
      return toast('Copie impossible ici : tape « ' + demandeRetest(c) + ' » dans ton agent.', 'mal');
    }
    if (ds.annuler) { delete S.copies[ds.annuler]; return dessineEntretien(); }
    if (ds.voir) { S.sel = ds.voir; store.set('choix', ds.voir); S.meth = 'toutes'; S.agent = 'tous'; S.q = ''; $('cherche').value = ''; return montre('catalogue'); }
    if (ds.vu) { const cles = ds.vu.split(' '), vu = !cles.every(k => S.vus[k]); for (const k of cles) { if (vu) S.vus[k] = true; else delete S.vus[k]; } store.set('vus', S.vus); return dessineEntretien(); }
    if (ds.garde) { S.gardes[ds.garde] = !S.gardes[ds.garde]; if (!S.gardes[ds.garde]) delete S.gardes[ds.garde]; store.set('gardes', S.gardes); return dessineEntretien(); }
    if (b.id === 'vers-entretien') return montre('entretien');
    if (b.id === 'vers-catalogue') { e.preventDefault(); return montre('catalogue'); }
  });
  $('cherche').addEventListener('input', e => { S.q = e.target.value; dessineCatalogue(); });

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
    if (e.key === '/' && !typing && S.vue === 'catalogue' && S.d && liste().length) { e.preventDefault(); $('cherche').focus(); return; }
    if (e.key !== 'Escape') return;
    if (!$('reglages').hidden) return fermeReglages();
    if (typing) { if (document.activeElement.id === 'cherche' && S.q) { S.q = ''; $('cherche').value = ''; dessineCatalogue(); } return; }
    if (S.vue === 'entretien') return montre('catalogue');
    if (embedded) parent.postMessage({ type: 'connecteurs-copy-back' }, '*');
  });
  if (embedded) $('retour').hidden = true;

  /* back on the tab, or on the window: the table may have changed meanwhile */
  let frais = 0;
  async function rafraichit() {
    if (Date.now() - frais < 4000 || !S.d) return;
    frais = Date.now();
    if (await charge()) dessine();
  }
  addEventListener('focus', rafraichit);
  addEventListener('hashchange', () => { if (S.d) montre(location.hash === '#entretien' ? 'entretien' : 'catalogue'); });
  addEventListener('message', e => { if (e.source === parent && e.data && e.data.type === 'connecteurs-copy' && e.data.action === 'shown') rafraichit(); });

  (async () => {
    frais = Date.now();
    if (await charge()) montre(S.vue);
    if (embedded) parent.postMessage({ type: 'connecteurs-copy-ready' }, '*');
  })();
})();

/* SM4RT Routines: the Routines tab, or /routines/ on its own.
   What runs by itself, read from systeme/routines.md, systeme/modeles.md and journal/routines.jsonl (GET /local/routines).
   Two views. « Santé et coût »: the passages and the cost of the last 7 days, what to look at (a passage that failed,
   a ceiling nearly reached, a routine in place that did not run when its cron expected it), and one line per routine;
   a click opens its card: history, settings (time, state, ceiling, the model's level) and what it calls.
   « Planning »: what is due, read here from the Cron column (minute, hour, day, month, weekday; a star, a range,
   a step and lists), by day (a 24-hour clock), by week (slots of 3 hours) or by month (a calendar). Routines « en pause » or
   « à la demande » are left out, those « à construire » are dashed. A change is written by POST /local/routines/regler. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-routines:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-routines:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  const S = { d: null, R: [], vue: store.get('vue', 'sante'), fiche: null, onglet: 'historique', ouvert: '', pvue: store.get('pvue', 'semaine'), focus: '', jour: null, br: {}, occupe: false };
  if (!['sante', 'planning'].includes(S.vue)) S.vue = 'sante';
  if (!['jour', 'semaine', 'mois'].includes(S.pvue)) S.pvue = 'semaine';
  const CHAPO = {
    sante: 'Comment elles vont, et ce qu’elles coûtent. Un clic sur une routine ouvre sa fiche.',
    planning: 'Ce qui va tourner, et quand. Les routines en pause ou à la demande n’y sont pas ; celles à construire sont en pointillés.'
  };
  const AIDE_ETAT = {
    'à construire': 'Écrite dans le tableau, pas encore installée dans le planificateur. Le planning la montre en pointillés.',
    'en place': 'Installée : le planificateur la lance à son heure.',
    'en pause': 'lancer.py ne lance rien, même si le planificateur l’appelle. Elle sort du planning.',
    'à la demande': 'Elle ne part que quand tu la lances. Elle sort du planning.'
  };
  /* one colour per routine, in the order of the table, readable at night and by day */
  const PALETTES = {
    nuit: ['#2EE6C9', '#B69CFF', '#FBBF24', '#4ADE80', '#4DA8FF', '#F472B6', '#FF7A45', '#67E8F9', '#A3E635', '#FDA4AF'],
    jour: ['#0B8F7C', '#7C3AED', '#B45309', '#15803D', '#1D6FD0', '#BE185D', '#D4521B', '#0E7490', '#4D7C0F', '#BE123C']
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
  function toast(text, kind = '') {
    const t = $('toast'); t.textContent = text; t.className = 'on ' + kind;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.className = kind, kind === 'mal' ? 6000 : 3200);
  }

  /* ---------------------------- words, numbers, days ---------------------------- */
  const pluriel = (n, un, plusieurs) => n + ' ' + (n > 1 ? plusieurs : un);
  const NJ = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const MC = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const deux = n => String(n).padStart(2, '0');
  const hm = min => deux(Math.floor(min / 60)) + ':' + deux(min % 60);
  const hCourt = min => Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + deux(min % 60) : '');
  const heureDe = d => deux(d.getHours()) + ':' + deux(d.getMinutes());
  const jourDe = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const plus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const meme = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const ecart = (a, b) => Math.round((jourDe(a) - jourDe(b)) / 864e5);
  const nomJour = d => NJ[d.getDay()] + ' ' + d.getDate() + ' ' + MC[d.getMonth()];
  const nomCourt = (d, auj) => meme(d, auj) ? 'aujourd’hui' : NJ[d.getDay()] + ' ' + d.getDate();
  function relatif(d, auj) { const e = ecart(d, auj); return (e === 0 ? 'aujourd’hui' : e === 1 ? 'demain' : e === -1 ? 'hier' : nomJour(d)) + ' à ' + heureDe(d); }
  const dollars = v => v === 0 ? '0 $' : v < 0.01 ? '< 0,01 $' : v.toFixed(2).replace('.', ',') + ' $';
  const budget = v => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',')) + ' $';
  const tokens = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(n);
  function duree(a, b) {
    const s = Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 1000));
    return s < 60 ? s + ' s' : s < 3600 ? Math.round(s / 60) + ' min' : (s / 3600).toFixed(1).replace('.', ',') + ' h';
  }
  /* the short name of a routine, for the week's slots: « Fiches YouTube » → YouTube, « Rangement de nuit » → Rangement */
  const VIDES = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'à', 'au', 'aux', 'et', 'en', 'par', 'pour', 'nuit', 'jour', 'semaine', 'mois', 'matin', 'soir']);
  function court(nom) {
    const mots = String(nom).replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean);
    const fort = mots.slice(1).find(m => /^[A-ZÀ-Ý]/.test(m) && !VIDES.has(m.toLowerCase()));
    return (fort || mots[0] || String(nom)).slice(0, 16);
  }
  const derniere = p => { const l = (p.sortie || []).filter(x => String(x).trim()); const t = l.length ? String(l[l.length - 1]).trim() : ''; return t.length > 110 ? t.slice(0, 109) + '…' : t; };

  /* ---------------------------- the cron, read here ---------------------------- */
  function champ(txt, min, max, semaine) {
    const set = new Set();
    for (const part of txt.split(',')) {
      const m = /^(\*|\d+)(?:-(\d+))?(?:\/(\d+))?$/.exec(part);
      if (!m) throw 0;
      const a = m[1] === '*' ? min : +m[1], b = m[1] === '*' ? max : m[2] !== undefined ? +m[2] : m[3] ? max : a, pas = m[3] ? +m[3] : 1;
      if (a < min || b > max || a > b || pas < 1) throw 0;
      for (let v = a; v <= b; v += pas) set.add(semaine && v === 7 ? 0 : v);
    }
    return set;
  }
  function lireCron(expr) {
    const f = String(expr || '').trim().split(/\s+/);
    if (f.length !== 5) return null;
    try {
      const c = { min: champ(f[0], 0, 59), h: champ(f[1], 0, 23), dom: champ(f[2], 1, 31), mois: champ(f[3], 1, 12), dow: champ(f[4], 0, 7, true), domFixe: !f[2].startsWith('*'), dowFixe: !f[4].startsWith('*') };
      const tri = s => [...s].sort((a, b) => a - b);
      c.minutes = tri(c.h).flatMap(h => tri(c.min).map(m => h * 60 + m));
      return c;
    } catch (_) { return null; }
  }
  /* when the day of the month and the weekday are both fixed, either one is enough, as cron does */
  const tourneLe = (c, d) => c.mois.has(d.getMonth() + 1) && (c.domFixe && c.dowFixe ? c.dom.has(d.getDate()) || c.dow.has(d.getDay()) : c.dom.has(d.getDate()) && c.dow.has(d.getDay()));
  const minutesDu = (r, d) => r.cronLu && tourneLe(r.cronLu, d) ? r.cronLu.minutes : [];
  const instant = (d, m) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, m);
  function prochains(r, depuis, n) {
    const out = [], t = depuis.getHours() * 60 + depuis.getMinutes();
    if (!r.cronLu) return out;
    for (let i = 0; i < 400 && out.length < n; i++) {
      const d = plus(depuis, i);
      for (const m of minutesDu(r, d)) { if (i === 0 && m <= t) continue; out.push(instant(d, m)); if (out.length >= n) break; }
    }
    return out;
  }
  /* the last time its cron expected it, before `avant`, in the last 7 days */
  function dernierAttendu(r, avant) {
    const t = avant.getHours() * 60 + avant.getMinutes();
    for (let i = 0; i < 7; i++) {
      const d = plus(avant, -i), ms = minutesDu(r, d).filter(m => i > 0 || m <= t);
      if (ms.length) return instant(d, ms[ms.length - 1]);
    }
    return null;
  }
  function prochainesTxt(cron, etat) {
    const c = lireCron(cron);
    if (!c) return { mal: true, txt: 'Ce cron ne se lit pas : il faut cinq champs (minute, heure, jour, mois, jour de la semaine).' };
    const ps = prochains({ cronLu: c }, new Date(), 3), auj = jourDe(new Date());
    if (!ps.length) return { mal: true, txt: 'Ce cron ne tombe jamais dans l’année qui vient.' };
    return { mal: false, txt: 'Prochaines : ' + ps.map(d => relatif(d, auj)).join(' · ') + (etat === 'en pause' ? ' (en pause : rien ne part)' : etat === 'à la demande' ? ' (à la demande : rien ne part seul)' : '') };
  }

  /* ---------------------------- the routines, ready to draw ---------------------------- */
  function prepare() {
    const pal = PALETTES[document.documentElement.dataset.mode === 'jour' ? 'jour' : 'nuit'], tous = S.d.passages || [];
    S.R = (S.d.routines || []).map((r, i) => {
      const cronLu = lireCron(r.cron);
      return {
        ...r, c: pal[i % pal.length], court: court(r.nom), cronLu,
        passages: tous.filter(p => p.cle === r.cle).sort((a, b) => Date.parse(a.debut) - Date.parse(b.debut)),
        programmee: !!cronLu && r.etat !== 'en pause' && r.etat !== 'à la demande', installee: r.etat === 'en place'
      };
    });
  }
  function mesure(liste) {
    const m = { n: liste.length, cout: 0, tok: 0, avec: 0, plantes: 0 };
    for (const p of liste) { if (typeof p.cout === 'number') { m.cout += p.cout; m.avec++; } if (p.tokens) m.tok += p.tokens; if (p.code !== 0) m.plantes++; }
    return m;
  }
  const etatBadge = r => `<span class="etat ${r.etat === 'en place' ? 'place' : r.etat === 'en pause' ? 'pause' : ''}">${esc(r.etat || 'sans état')}</span>`;
  const eteint = r => !!S.focus && S.focus !== r.cle;

  /* ---------------------------- Santé et coût ---------------------------- */
  function vueSante() {
    if (!S.R.length) return '<div class="vide">Aucune routine dans <code>systeme/routines.md</code>.</div>';
    const now = new Date(), auj = jourDe(now), depuis = now - 7 * 864e5, tnow = now.getHours() * 60 + now.getMinutes();
    const semaine = r => r.passages.filter(p => Date.parse(p.debut) >= depuis);
    const M = mesure(S.R.flatMap(semaine));
    const suiv = S.R.filter(r => r.programmee && r.installee).map(r => ({ r, t: prochains(r, now, 1)[0] })).filter(x => x.t).sort((a, b) => a.t - b.t)[0];
    const tuiles = [
      ['Passages · 7 jours', String(M.n), M.plantes ? 'mal' : M.n ? 'ok' : '', M.n ? (M.plantes ? 'dont ' + pluriel(M.plantes, 'planté', 'plantés') : 'aucun n’a planté') : 'rien n’a tourné cette semaine'],
      ['Coût · 7 jours', M.avec ? dollars(M.cout) : '—', 'accent', M.avec ? '≈ ' + dollars(M.cout * 30 / 7) + ' par mois à ce rythme' : 'non mesuré : sans IA, ou rien lancé'],
      ['Tokens · 7 jours', M.tok ? tokens(M.tok) : '—', '', M.avec ? 'sur ' + pluriel(M.avec, 'passage avec IA', 'passages avec IA') : 'aucun passage avec IA'],
      ['Prochaine', suiv ? heureDe(suiv.t) : '—', 'accent', suiv ? suiv.r.nom + ' · ' + relatif(suiv.t, auj).split(' à ')[0] : 'aucune routine en place']
    ];
    let h = `<div class="tuiles">${tuiles.map(([k, v, c, s]) => `<div class="tuile"><span class="etiq">${esc(k)}</span><b class="${c}">${esc(v)}</b><span>${esc(s)}</span></div>`).join('')}</div>`;

    /* what to look at */
    const alertes = [];
    for (const r of S.R) {
      const sem = semaine(r), rates = sem.filter(p => p.code !== 0);
      if (rates.length) {
        const p = rates[rates.length - 1];
        alertes.push({ k: 'mal', signe: '✕', texte: r.nom + (rates.length > 1 ? ' a planté ' + rates.length + ' fois' : ' a planté') + ' (code ' + p.code + ')', sous: relatif(new Date(p.debut), auj) + (derniere(p) ? ' · ' + derniere(p) : ''), cle: r.cle, onglet: 'historique', p: p.debut });
      }
      const c = mesure(sem).cout;
      if (r.budget && c >= 0.75 * r.budget) alertes.push({ k: 'attention', signe: '!', texte: r.nom + ' a dépensé ' + dollars(c) + ' sur ' + budget(r.budget) + ' cette semaine', sous: c > r.budget ? 'au-delà de son plafond' : 'plus des trois quarts de son plafond', cle: r.cle, onglet: 'reglages', btn: 'Régler' });
      if (r.installee && r.skill && r.existe === false) alertes.push({ k: 'mal', signe: '✕', texte: r.nom + ' lance une skill qui n’existe pas', sous: 'skills/' + r.skill + '/ est introuvable : elle plantera à chaque passage', cle: r.cle, onglet: 'appels' });
      if (r.programmee && r.installee) {
        const att = dernierAttendu(r, new Date(now - 15 * 6e4));
        if (att && !r.passages.some(p => Date.parse(p.debut) >= att - 10 * 6e4)) alertes.push({ k: 'attention', signe: '?', texte: r.nom + ' n’a pas tourné', sous: 'attendue ' + relatif(att, auj) + ', rien dans journal/routines.jsonl : le planificateur la lance-t-il ?', cle: r.cle, onglet: 'historique' });
      }
    }
    if (alertes.length) h += `<div class="alertes"><b>À regarder <small>${alertes.length}</small></b>${alertes.map(a => `<div class="alerte"><i class="${a.k}" aria-hidden="true">${a.signe}</i><span>${esc(a.texte)}<small>${esc(a.sous)}</small></span><button type="button" class="btn petit" data-a="voir" data-cle="${esc(a.cle)}" data-onglet="${a.onglet}"${a.p ? ` data-p="${esc(a.p)}"` : ''}>${a.btn || 'Voir'}</button></div>`).join('')}</div>`;
    else if (M.n) h += '<p class="aide">Rien à regarder : rien n’a planté, rien ne dépasse son plafond, rien n’a manqué son heure.</p>';

    /* one line per routine */
    h += `<div class="tableau"><div class="t-ligne t-tete" aria-hidden="true"><span class="c-nom">Routine</span><span class="c-modele">Modèle</span><span class="c-jours">7 jours passés · 7 à venir</span><span class="c-cout">Coût 7 j · plafond</span><span class="c-proch">Prochaine</span></div>`;
    for (const r of S.R) {
      const m7 = mesure(semaine(r)), carres = [];
      for (let i = -6; i <= 7; i++) {
        const d = plus(auj, i), ps = r.passages.filter(p => meme(new Date(p.debut), d)), ms = r.programmee ? minutesDu(r, d) : [];
        let k = '', t = nomJour(d) + ' : ';
        if (i <= 0 && ps.length) {
          const mal = ps.filter(p => p.code !== 0).length;
          k = mal ? 'mal' : 'ok';
          t += mal ? pluriel(ps.length, 'passage', 'passages') + ', ' + pluriel(mal, 'planté', 'plantés') : pluriel(ps.length, 'passage réussi', 'passages réussis');
        } else if (i < 0 || i === 0 && ms.every(m => m < tnow - 15)) {
          const manque = r.installee ? ms.filter(m => i < 0 || m < tnow - 15) : [];
          if (manque.length) { k = 'manque'; t += 'attendue à ' + hm(manque[0]) + ', rien dans le journal'; }
          else t += 'rien';
        } else {
          const futur = i === 0 ? ms.filter(m => m >= tnow - 15) : ms;
          if (futur.length) { k = r.installee ? 'prevu a' : 'prevu'; t += (r.installee ? 'prévue à ' : 'prévue, pas encore installée, à ') + futur.slice(0, 3).map(hm).join(', ') + (futur.length > 3 ? '…' : ''); }
          else { k = 'rien'; t += 'rien de prévu'; }
        }
        carres.push(`<i class="carre ${k}${i === 0 ? ' auj' : ''}" title="${esc(t)}"></i>`);
      }
      const proch = r.programmee ? prochains(r, now, 1)[0] : null, pct = r.budget ? Math.min(100, m7.cout / r.budget * 100) : 0;
      const cout = (r.directe ? 'sans IA' : m7.avec ? dollars(m7.cout) : '—') + (r.budget ? ' / ' + budget(r.budget) : '');
      h += `<button type="button" class="t-ligne" data-a="fiche" data-cle="${esc(r.cle)}" style="--c:${r.c}">
        <span class="c-nom"><i class="point-c"></i><span><b>${esc(r.nom)} ${etatBadge(r)}</b><small>${esc((r.directe ? 'commande' : r.skill ? '/' + r.skill : '—') + ' · ' + (r.quand || r.cron || 'sans horaire'))}</small></span></span>
        <span class="c-modele${r.directe ? ' sans' : ''}">${esc(r.directe ? 'sans IA' : r.modele || '—')}</span>
        <span class="c-jours">${carres.join('')}</span>
        <span class="c-cout"><span>${esc(cout)}</span>${r.budget ? `<span class="jauge"><i class="${pct >= 100 ? 'trop' : pct >= 75 ? 'chaud' : ''}" style="width:${pct.toFixed(0)}%"></i></span>` : ''}</span>
        <span class="c-proch">${esc(proch ? relatif(proch, auj) : r.etat === 'en pause' ? 'en pause' : r.etat === 'à la demande' ? 'à la demande' : r.cronLu ? '—' : 'sans cron')}</span></button>`;
    }
    h += '</div><p class="aide">Les carrés : les 7 derniers jours (vert réussi, rouge planté, pointillé orange attendue mais rien), puis les 7 prochains (prévue ; en pointillés, pas encore installée). Les passages viennent de <code>journal/routines.jsonl</code>, que <code>lancer.py</code> écrit à chaque lancement ; le coût, au tarif de l’API, de la sortie de claude.</p>';
    return h;
  }

  /* ---------------------------- the card of one routine ---------------------------- */
  function vueFiche(r) {
    const now = new Date(), auj = jourDe(now);
    const puces = [r.etat || 'sans état', r.directe ? 'directe · sans IA' : S.d.agent + (r.modele ? ' · ' + r.modele : ''), r.cron || 'sans cron'];
    const pause = r.etat === 'en place' ? ['en pause', 'Mettre en pause'] : r.etat === 'en pause' ? ['en place', 'Reprendre'] : null;
    let h = `<button type="button" class="retour" data-a="liste">← Toutes les routines</button>
      <div class="f-tete" style="--c:${r.c}"><i class="point-c"></i><h2>${esc(r.nom)}</h2>${puces.map(p => `<span class="puce">${esc(p)}</span>`).join('')}<span class="ressort"></span>
      <button type="button" class="btn petit" data-a="copier" data-cle="${esc(r.cle)}" title="python3 systeme/scripts/lancer.py ${esc(r.cle)}">Copier la commande</button>${pause ? `<button type="button" class="btn petit" data-a="etat" data-cle="${esc(r.cle)}" data-v="${pause[0]}">${pause[1]}</button>` : ''}</div>
      <p class="f-but">${esc(r.but || r.type || '')}</p>${r.but && r.type ? `<p class="aide">Type : ${esc(r.type)}</p>` : ''}
      ${r.skill && r.existe === false ? `<div class="avis">La skill <code>${esc(r.skill)}</code> n’existe pas encore dans <code>skills/</code> : la routine planterait.</div>` : ''}
      <div class="seg onglets" role="tablist" aria-label="La fiche">${[['historique', 'Historique'], ['reglages', 'Réglages'], ['appels', 'Ce qu’elle appelle']].map(([k, n]) => `<button type="button" role="tab" data-a="onglet" data-v="${k}" aria-selected="${S.onglet === k}">${n}</button>`).join('')}</div>`;

    if (S.onglet === 'historique') {
      const jours = [];
      for (let i = -13; i <= 0; i++) { const d = plus(auj, i), ps = r.passages.filter(p => meme(new Date(p.debut), d)); jours.push({ d, n: ps.length, mal: ps.some(p => p.code !== 0) }); }
      const max = Math.max(1, ...jours.map(j => j.n));
      h += `<div class="bloc" style="--c:${r.c}"><span class="etiq">Passages par jour · 14 derniers jours</span><div class="barres">${jours.map(j => `<div class="barre" title="${esc(nomJour(j.d) + ' : ' + pluriel(j.n, 'passage', 'passages') + (j.mal ? ', dont un planté au moins' : ''))}"><em>${j.n || ''}</em><i class="${j.n ? (j.mal ? 'mal' : '') : 'zero'}" style="height:${j.n ? Math.max(6, j.n / max * 76).toFixed(0) : 2}%"></i><small>${NJ[j.d.getDay()].slice(0, 3)} ${j.d.getDate()}</small></div>`).join('')}</div></div>`;
      const ps = [...r.passages].reverse().slice(0, 40);
      h += ps.length ? `<div class="tableau">${ps.map(p => {
        const ouvert = S.ouvert === p.debut, mes = [duree(p.debut, p.fin), p.tokens ? tokens(p.tokens) + ' tokens' : '', typeof p.cout === 'number' ? dollars(p.cout) : ''].filter(Boolean).join(' · ');
        const detail = (p.code !== 0 ? 'code de sortie ' + p.code + '\n' : '') + (p.modele ? (p.agent || '') + ' · ' + p.modele + '\n' : '') + ((p.sortie || []).join('\n') || '(aucune sortie)');
        return `<div class="passage"><button type="button" class="p-ligne" data-a="passage" data-v="${esc(p.debut)}" aria-expanded="${ouvert}"><b class="${p.code === 0 ? 'ok' : 'mal'}" aria-label="${p.code === 0 ? 'réussi' : 'planté'}">${p.code === 0 ? '✓' : '✕'}</b><span class="p-quand">${esc(relatif(new Date(p.debut), auj))}</span><span class="p-quoi">${esc(derniere(p) || (p.code === 0 ? 'fini' : 'planté, code ' + p.code))}</span><span class="p-mesure">${esc(mes)}</span></button>${ouvert ? `<pre class="sortie">${esc(detail)}</pre>` : ''}</div>`;
      }).join('')}</div>` : `<div class="vide">Aucun passage noté dans <code>journal/routines.jsonl</code> ces 35 derniers jours. Chaque lancement par <code>python3 systeme/scripts/lancer.py ${esc(r.cle)}</code> en laisse un.</div>`;
    }

    if (S.onglet === 'reglages') {
      const cron = S.br.cron ?? r.cron, pr = prochainesTxt(cron, r.etat);
      h += `<div class="reg-grille">
        <div class="bloc"><h2>Quand</h2><div class="rangee"><input class="champ mono" id="f-cron" value="${esc(cron)}" spellcheck="false" autocomplete="off" aria-label="Horaire cron : minute, heure, jour, mois, jour de la semaine"><button type="button" class="btn petit primaire" data-a="cron" data-cle="${esc(r.cle)}">Enregistrer</button></div><span id="f-proch" class="prochaines${pr.mal ? ' mal' : ''}">${esc(pr.txt)}</span><p class="aide">Cinq champs : minute, heure, jour du mois, mois, jour de la semaine (0 ou 7 = dimanche). La colonne Quand${r.quand ? ' (« ' + esc(r.quand) + ' »)' : ''} reste ton texte. Le planificateur ne relit pas ce tableau : après un changement, demande à l’agent de réinstaller la routine.</p></div>
        <div class="bloc"><h2>État</h2><div class="seg" role="group" aria-label="État">${(S.d.etats || []).map(e => `<button type="button" data-a="etat" data-cle="${esc(r.cle)}" data-v="${esc(e)}" aria-pressed="${r.etat === e}">${esc(e)}</button>`).join('')}</div><p class="aide">${esc(AIDE_ETAT[r.etat] || 'Choisis un état : il s’écrit tout de suite dans systeme/routines.md.')}</p></div>
        <div class="bloc"><h2>Plafond par semaine</h2><div class="rangee"><input class="champ" id="f-plafond" value="${esc(S.br.plafond ?? (/^[—-]$/.test(r.plafond) ? '' : r.plafond))}" placeholder="5 $, ou 20 éléments par nuit" autocomplete="off" aria-label="Plafond par semaine"><button type="button" class="btn petit primaire" data-a="plafond" data-cle="${esc(r.cle)}">Enregistrer</button></div><p class="aide">Un montant en dollars (« 5 $ ») sert de budget : la jauge le compare au coût des 7 derniers jours. Un autre texte reste une consigne pour la skill.</p></div>
      </div>`;
      if (r.skill) {
        const mes = r.passages.filter(p => typeof p.cout === 'number' && p.cout > 0), moy = mes.length ? mes.reduce((s, p) => s + p.cout, 0) / mes.length : 0;
        const prix = m => (S.d.prix || {})[m] || 0, mesureSur = mes.length ? mes[mes.length - 1].modele || r.modele : r.modele, base = prix(mesureSur);
        h += `<div class="bloc"><h2>Le modèle</h2><p class="aide">Le niveau vaut pour la skill <code>${esc(r.skill)}</code> partout, pas seulement pour cette routine (<code>systeme/modeles.md</code>). Agent : ${esc(S.d.agent)}.</p><div class="modeles">${['petit', 'moyen', 'grand'].map(n => {
          const m = ((S.d.parNiveau || {})[n] || {})[S.d.agent] || '';
          let est = 'pas encore mesuré';
          if (!m) est = 'modèle à remplir dans systeme/modeles.md';
          else if (moy && m === mesureSur) est = 'mesuré : ' + dollars(moy) + ' par passage';
          else if (moy && base && prix(m)) est = '≈ ' + dollars(moy * prix(m) / base) + ' par passage';
          return `<button type="button" class="modele" data-a="niveau" data-cle="${esc(r.cle)}" data-v="${n}" aria-pressed="${r.niveau === n}"><span><b>${esc(m || '—')}</b><small>${n}</small></span><em>${esc(est)}</em></button>`;
        }).join('')}</div><p class="aide">Au tarif de l’API, si les tokens restent les mêmes. Avec un abonnement, c’est ta limite d’usage qui compte : un modèle plus petit la ménage.</p></div>`;
      }
    }

    if (S.onglet === 'appels') {
      const maillons = [['Quand', [r.quand || '—', r.cron || 'sans cron']], ['Lance', ['python3 systeme/scripts/lancer.py ' + r.cle]]];
      if (r.directe) maillons.push(['Commande', r.commande.split(/\s*(?:&&|;)\s*/).filter(Boolean)]);
      else if (r.skill) maillons.push(['Agent', [S.d.agent + (r.modele ? ' · ' + r.modele : ''), 'niveau ' + (r.niveau || 'moyen')]], ['Skill', ['/' + r.skill]], ['Peut appeler', r.appelle && r.appelle.length ? r.appelle.map(s => '/' + s) : ['aucune autre skill']]);
      maillons.push(['Laisse', ['une ligne dans journal/routines.jsonl']]);
      const fort = r.directe ? 2 : 3;
      h += `<div class="chaine">${maillons.map(([k, v], i) => `<div class="maillon">${i ? '<i aria-hidden="true">→</i>' : ''}<div class="${i === fort ? 'accent' : ''}"><span class="etiq">${esc(k)}</span>${v.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>`).join('')}</div>`;
      h += r.skill ? `<p class="aide">« Peut appeler » vient du <code>SKILL.md</code> de ${esc(r.skill)} : les skills qu’il cite.${r.existe === false ? '' : ` <button type="button" class="btn petit discret" data-a="ouvrir" data-v="skills/${esc(r.skill)}/SKILL.md">Ouvrir le SKILL.md</button>`}</p>`
        : '<p class="aide">Une routine directe lance sa commande sans IA, depuis la racine du workspace.</p>';
    }
    return h;
  }

  /* ---------------------------- Planning ---------------------------- */
  function vuePlanning() {
    const now = new Date(), auj = jourDe(now), tnow = now.getHours() * 60 + now.getMinutes(), P = S.R.filter(r => r.programmee);
    if (!P.length) return '<div class="vide">Aucune routine programmée. Une routine entre ici quand elle a un cron et qu’elle n’est ni en pause, ni à la demande (<code>systeme/routines.md</code>, ou sa fiche dans Santé et coût).</div>';
    if (S.focus && !P.some(r => r.cle === S.focus)) S.focus = '';
    const passagesDu = d => P.flatMap(r => minutesDu(r, d).map(m => ({ r, m }))).sort((a, b) => a.m - b.m);
    const an = auj.getFullYear(), mo = auj.getMonth(), nbJours = new Date(an, mo + 1, 0).getDate();
    const parMois = r => { let n = 0; for (let j = 1; j <= nbJours; j++) n += minutesDu(r, new Date(an, mo, j)).length; return n; };
    let n7 = 0; for (let i = 0; i < 7; i++) n7 += passagesDu(plus(auj, i)).length;
    const nMois = P.reduce((s, r) => s + parMois(r), 0);
    const compteurs = [[passagesDu(auj).length, 'passages aujourd’hui'], [n7, 'les 7 prochains jours'], [nMois, 'en ' + MOIS[mo]], [P.length, P.length > 1 ? 'routines programmées' : 'routine programmée']];
    let h = `<div class="p-barre"><div class="compteurs">${compteurs.map(([v, l]) => `<div class="compteur"><b>${v}</b><span>${esc(l)}</span></div>`).join('')}</div><span class="ressort"></span><div class="seg" role="tablist" aria-label="La période">${[['jour', 'Jour'], ['semaine', 'Semaine'], ['mois', 'Mois']].map(([k, n]) => `<button type="button" role="tab" data-a="pvue" data-v="${k}" aria-selected="${S.pvue === k}">${n}</button>`).join('')}</div></div>`;
    h += `<div class="legende" role="group" aria-label="Un clic met une routine en avant">${P.map(r => `<button type="button" class="leg${eteint(r) ? ' eteinte' : ''}${r.installee ? '' : ' pointille'}" style="--c:${r.c}" data-a="focus" data-v="${esc(r.cle)}" aria-pressed="${S.focus === r.cle}" title="${esc(r.nom + ' · ' + (r.quand || r.cron) + (r.installee ? '' : ' · pas encore installée'))}"><i></i>${esc(r.nom)}<small>×${parMois(r)}</small></button>`).join('')}</div>`;

    if (S.pvue === 'jour') {
      const jour = S.jour && S.jour >= auj ? S.jour : auj, estAuj = meme(jour, auj), ps = passagesDu(jour);
      const debut = ecart(jour, auj) > 6 ? plus(jour, -3) : auj;
      h += `<div class="jours">${Array.from({ length: 7 }, (_, i) => plus(debut, i)).map(d => `<button type="button" class="jour-btn" data-a="jour" data-v="${d.getTime()}" aria-pressed="${meme(d, jour)}"><b>${esc(nomCourt(d, auj))}</b><small>${pluriel(passagesDu(d).length, 'passage', 'passages')}</small></button>`).join('')}</div>`;
      const pos = (min, rayon) => { const a = min / 1440 * 2 * Math.PI; return `left:${(50 + rayon * Math.sin(a)).toFixed(2)}%;top:${(50 - rayon * Math.cos(a)).toFixed(2)}%`; };
      const rang = {}, ia = ps.filter(p => !p.r.directe).length;
      h += `<div class="p-corps"><div class="horloge" role="img" aria-label="${esc('Horloge de 24 heures : ' + pluriel(ps.length, 'passage', 'passages') + ' ' + (estAuj ? 'aujourd’hui' : 'le ' + nomJour(jour)))}"><div class="anneau"></div>
        ${Array.from({ length: 24 }, (_, x) => `<span class="grad${x % 6 ? '' : ' fort'}" style="${pos(x * 60, 45.5)}">${x % 6 ? x : deux(x) + ' h'}</span>`).join('')}
        ${estAuj ? `<i class="aiguille" style="transform:rotate(${(tnow / 1440 * 360 + 180).toFixed(1)}deg)"></i>` : ''}
        ${ps.slice(0, 240).map(p => { const k = rang[p.m] = (rang[p.m] || 0) + 1; return `<button type="button" class="pt${p.r.installee ? '' : ' pointille'}" data-a="focus" data-v="${esc(p.r.cle)}" title="${esc(hm(p.m) + ' · ' + p.r.nom + (p.r.installee ? '' : ' · pas encore installée'))}" aria-label="${esc(hm(p.m) + ' · ' + p.r.nom)}" style="--c:${p.r.c};${pos(p.m, 36 - Math.min(k - 1, 4) * 7)};opacity:${eteint(p.r) ? 0.18 : 1}"></button>`; }).join('')}
        <div class="centre"><div><b>${ps.length}</b><span>${ps.length > 1 ? 'passages' : 'passage'} ${estAuj ? 'aujourd’hui' : 'ce jour-là'}</span><br><span class="etiq">${ia} avec IA · ${ps.length - ia} sans</span></div></div></div>
        <div class="p-cote"><span class="etiq">Dans l’ordre de la journée</span>${ps.length ? ps.map(p => `<div class="ordre${estAuj && p.m < tnow ? ' passe' : ''}${p.r.installee ? '' : ' pointille'}" style="--c:${p.r.c}${eteint(p.r) ? ';opacity:.25' : ''}"><b>${hm(p.m)}</b><span>${esc(p.r.nom)}</span><small>${esc((p.r.directe ? 'sans IA' : p.r.modele || p.r.skill) + (p.r.installee ? '' : ' · pas installée'))}</small></div>`).join('') : '<p class="aide">Rien ce jour-là.</p>'}
        <p class="aide">Le bleu de l’horloge, c’est la nuit (22 h à 7 h) : ce qui tourne là ne gêne personne.${estAuj ? ' L’aiguille montre l’heure qu’il est.' : ''}</p></div></div>`;
    }

    if (S.pvue === 'semaine') {
      const jours = Array.from({ length: 7 }, (_, i) => plus(auj, i));
      const cases = jours.map(d => { const ps = passagesDu(d); return Array.from({ length: 8 }, (_, s) => ps.filter(p => p.m >= s * 180 && p.m < s * 180 + 180)); });
      const max = Math.max(1, ...cases.flat().map(c => c.length));
      h += `<div class="p-corps"><div class="p-grand semaine" role="table" aria-label="Les 7 prochains jours, en créneaux de 3 heures"><div class="s-rang s-tete" role="row"><span></span>${jours.map((d, i) => `<span role="columnheader" class="${i ? '' : 'auj'}">${esc(nomCourt(d, auj))}</span>`).join('')}</div>`;
      for (let s = 0; s < 8; s++) {
        h += `<div class="s-rang" role="row"><span class="s-h${s < 2 || s === 7 ? ' nuit' : ''}" role="rowheader">${deux(s * 3)}–${deux(s * 3 + 3)} h</span>`;
        for (let j = 0; j < 7; j++) {
          const c = cases[j][s];
          if (!c.length) { h += '<span class="s-case libre" role="cell">libre</span>'; continue; }
          const groupes = [];
          for (const p of c) { let g = groupes.find(x => x.r === p.r); if (!g) groupes.push(g = { r: p.r, ms: [] }); g.ms.push(p.m); }
          h += `<span class="s-case${j ? '' : ' auj'}" role="cell" style="--a:${(0.05 + c.length / max * 0.25).toFixed(3)}" title="${esc(c.map(p => hm(p.m) + ' ' + p.r.nom).join('\n'))}">${groupes.map(g => `<span class="etq${eteint(g.r) ? ' eteinte' : ''}${g.r.installee ? '' : ' pointille'}" style="--c:${g.r.c}"><i></i><span>${esc(g.r.court)}</span><small>${g.ms.length > 2 ? '×' + g.ms.length : g.ms.map(hCourt).join(', ')}</small></span>`).join('')}</span>`;
        }
        h += '</div>';
      }
      const top = [];
      cases.forEach((col, j) => col.forEach((c, s) => { if (c.length) top.push({ j, s, c }); }));
      top.sort((a, b) => b.c.length - a.c.length || a.j - b.j || a.s - b.s);
      h += `</div><div class="p-cote"><span class="etiq">Les créneaux les plus chargés</span>${top.slice(0, 4).map(t => `<div class="top"><span><b>${esc(nomCourt(jours[t.j], auj) + ' · ' + deux(t.s * 3) + '–' + deux(t.s * 3 + 3) + ' h')}</b><em>${pluriel(t.c.length, 'passage', 'passages')}</em></span><span class="jauge"><i style="width:${(t.c.length / max * 100).toFixed(0)}%"></i></span><small>${esc([...new Set(t.c.map(p => p.r.court))].join(', '))}</small></div>`).join('')}
        <p class="aide">Une case couvre 3 heures. Plus elle est foncée, plus il y a de passages. Chaque point est une routine, à sa couleur.</p></div></div>`;
    }

    if (S.pvue === 'mois') {
      const decale = (new Date(an, mo, 1).getDay() + 6) % 7;
      const jours = Array.from({ length: nbJours }, (_, i) => { const d = new Date(an, mo, i + 1), ps = passagesDu(d); return { d, ps, rs: [...new Set(ps.map(p => p.r))] }; });
      const max = Math.max(1, ...jours.map(j => j.ps.length)), min = Math.min(...jours.map(j => j.ps.length));
      const rares = new Set(P.filter(r => { const n = parMois(r); return n > 0 && n <= 2; }));
      h += `<div class="p-corps"><div class="p-grand"><div class="m-tete">${['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'].map(j => `<span>${j}</span>`).join('')}</div><div class="m-grille">${'<span class="m-case hors" aria-hidden="true"></span>'.repeat(decale)}${jours.map(j => {
        const passe = j.d < auj, rare = j.rs.find(r => rares.has(r));
        return `<button type="button" class="m-case${passe ? ' passe' : ''}${meme(j.d, auj) ? ' auj' : ''}" style="--a:${(j.ps.length / max * 0.3).toFixed(3)}${rare ? ';--c:' + rare.c : ''}" data-a="ouvrejour" data-v="${j.d.getTime()}"${passe ? ' disabled' : ''} title="${esc(nomJour(j.d) + ' : ' + pluriel(j.ps.length, 'passage', 'passages'))}"><span><small>${j.d.getDate()}</small><em>${rare ? esc(rare.court) : ''}</em></span><b class="${j.ps.length ? '' : 'zero'}">${j.ps.length}</b><span class="m-points">${j.rs.map(r => `<i class="${eteint(r) ? 'eteinte' : ''}" style="--c:${r.c}"></i>`).join('')}</span></button>`;
      }).join('')}</div></div>`;
      const ia = jours.reduce((s, j) => s + j.ps.filter(p => !p.r.directe).length, 0);
      const charge = jours.reduce((a, b) => b.ps.length > a.ps.length ? b : a), freq = P.map(r => [r, parMois(r)]).sort((a, b) => b[1] - a[1])[0];
      const resume = [[String(nMois), 'passages en ' + MOIS[mo]], [String(ia), 'avec IA, ' + (nMois - ia) + ' sans'], [nomJour(charge.d), 'le jour le plus chargé : ' + pluriel(charge.ps.length, 'passage', 'passages')], [freq[0].nom, 'la plus fréquente : ' + freq[1] + ' fois']];
      h += `<div class="p-cote"><span class="etiq">Le mois en chiffres</span>${resume.map(([v, l]) => `<div class="resume"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}<div class="degrade"><span>${min}</span><i></i><span>${pluriel(max, 'passage', 'passages')}</span></div><p class="aide">Plus la case est foncée, plus le jour est chargé. Un clic sur un jour ouvre son horloge.</p></div></div>`;
    }
    return h;
  }

  /* ---------------------------- drawing ---------------------------- */
  function dessine() {
    if (!S.d) return;
    prepare();
    const r = S.fiche && S.R.find(x => x.cle === S.fiche);
    if (S.fiche && !r) S.fiche = null;
    document.querySelectorAll('#bascule button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.vue === S.vue)));
    $('chapo').textContent = CHAPO[S.vue];
    $('ici').textContent = S.vue === 'planning' ? 'Planning · ' + { jour: 'Jour', semaine: 'Semaine', mois: 'Mois' }[S.pvue] : r ? r.nom : 'Santé et coût';
    $('contenu').innerHTML = S.vue === 'planning' ? vuePlanning() : r ? vueFiche(r) : vueSante();
  }
  async function charge() {
    const d = await api('/local/routines');
    if (d.error) { $('avis').hidden = false; $('avis').textContent = d.error; $('contenu').innerHTML = ''; return; }
    $('avis').hidden = true; S.d = d; dessine();
  }
  async function regler(cle, champs, ok) {
    if (S.occupe) return;
    S.occupe = true;
    const d = await post('/local/routines/regler', { cle, ...champs });
    S.occupe = false;
    if (d.error || d.status !== 200) return toast(d.error || 'L’enregistrement a échoué', 'mal');
    S.d = d; S.br = {}; dessine(); toast(ok);
  }
  async function copier(t) {
    let fait = false;
    try { await navigator.clipboard.writeText(t); fait = true; } catch (_) { }
    if (!fait) {
      const x = document.createElement('textarea'); x.value = t; x.style.position = 'fixed'; x.style.opacity = '0';
      document.body.appendChild(x); x.select(); try { fait = document.execCommand('copy'); } catch (_) { } x.remove();
    }
    toast(fait ? 'Copié : ' + t : 'Copie impossible : ' + t, fait ? '' : 'mal');
  }
  function ouvrir(chemin) {
    if (embedded) parent.postMessage({ type: 'routines-copy-edit', path: chemin }, '*');
    else window.open('/fichiers/?f=' + encodeURIComponent(chemin), '_blank', 'noopener');
  }
  const ouvreFiche = (cle, onglet, p) => { S.fiche = cle; S.onglet = onglet || 'historique'; S.ouvert = p || ''; S.br = {}; dessine(); scrollTo(0, 0); };

  /* ---------------------------- gestures ---------------------------- */
  $('bascule').addEventListener('click', e => {
    const b = e.target.closest('button[data-vue]'); if (!b) return;
    S.vue = b.dataset.vue; S.fiche = null; store.set('vue', S.vue); dessine();
  });
  $('contenu').addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    const a = b.dataset.a, v = b.dataset.v, cle = b.dataset.cle, r = cle && S.R.find(x => x.cle === cle);
    if (a === 'fiche') ouvreFiche(cle);
    else if (a === 'voir') ouvreFiche(cle, b.dataset.onglet, b.dataset.p);
    else if (a === 'liste') { S.fiche = null; dessine(); }
    else if (a === 'onglet') { S.onglet = v; S.br = {}; dessine(); }
    else if (a === 'passage') { S.ouvert = S.ouvert === v ? '' : v; dessine(); }
    else if (a === 'copier') copier('python3 systeme/scripts/lancer.py ' + cle);
    else if (a === 'etat') { if (r && r.etat !== v) regler(cle, { etat: v }, v === 'en pause' ? 'En pause : lancer.py ne la lance plus' : 'État : ' + v); }
    else if (a === 'cron') {
      const x = $('f-cron').value.trim().replace(/\s+/g, ' ');
      if (!lireCron(x)) return toast('Ce cron ne se lit pas : il faut cinq champs valides', 'mal');
      if (r && x === r.cron) return toast('Rien n’a changé');
      regler(cle, { cron: x }, 'Horaire enregistré. Pense à réinstaller la routine dans le planificateur.');
    }
    else if (a === 'plafond') regler(cle, { plafond: $('f-plafond').value }, 'Plafond enregistré');
    else if (a === 'niveau') { if (r && r.niveau !== v) regler(cle, { niveau: v }, 'Niveau ' + v + ' pour la skill ' + r.skill); }
    else if (a === 'ouvrir') ouvrir(v);
    else if (a === 'pvue') { S.pvue = v; store.set('pvue', v); dessine(); }
    else if (a === 'focus') { S.focus = S.focus === v ? '' : v; dessine(); }
    else if (a === 'jour') { S.jour = new Date(+v); dessine(); }
    else if (a === 'ouvrejour') { S.jour = new Date(+v); S.pvue = 'jour'; store.set('pvue', 'jour'); dessine(); }
  });
  $('contenu').addEventListener('input', e => {
    if (e.target.id === 'f-cron') {
      S.br.cron = e.target.value;
      const r = S.R.find(x => x.cle === S.fiche), p = prochainesTxt(e.target.value, r && r.etat), el = $('f-proch');
      el.textContent = p.txt; el.classList.toggle('mal', p.mal);
    }
    if (e.target.id === 'f-plafond') S.br.plafond = e.target.value;
  });
  $('contenu').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.target.id === 'f-cron' || e.target.id === 'f-plafond')) { e.preventDefault(); e.target.nextElementSibling.click(); }
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape' || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (S.fiche) { S.fiche = null; dessine(); }
    else if (embedded) parent.postMessage({ type: 'routines-copy-back' }, '*');
  });
  /* night and day change the routines' colours */
  addEventListener('storage', e => { if (e.key === 'sm4rt-apparence') dessine(); });
  /* the time moves: the next passage, the clock's hand */
  setInterval(() => { if (!document.hidden && !(document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName))) dessine(); }, 60000);
  addEventListener('message', e => {
    if (e.source !== parent) return;
    const m = e.data || {};
    if (m.type === 'routines-copy' && m.action === 'shown') charge();
  });

  charge().then(() => { if (embedded) parent.postMessage({ type: 'routines-copy-ready' }, '*'); });
})();

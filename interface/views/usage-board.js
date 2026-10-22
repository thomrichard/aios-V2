// Skills and Applications tabs.
// Skills: every skill as an orange ring, sized by the measure you pick (most used, tokens per week,
// tokens per run, API $ per week or per run). Applications: every connection as a blue ring, plus your
// local apps, so you can see what you use and what you could disconnect.
// Data: window.ARMS_USAGE from ../data/arms-usage.js (node refresh/usage.mjs; the refresh icon re-runs it).
// Anything no source measures says "not measured". Nothing is estimated.
(() => {
  'use strict';
  const U = window.ARMS_USAGE;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const big = n => { n = n || 0; return n >= 1e9 ? (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n)); };
  const money = n => { n = n || 0; return n >= 1000 ? '$' + Math.round(n).toLocaleString('en-US') : n >= 10 ? '$' + n.toFixed(0) : n >= 0.995 ? '$' + n.toFixed(2) : n > 0 ? '$' + n.toFixed(n < 0.01 ? 3 : 2) : '$0'; };
  const DAY = 864e5;
  const plural = (n, word) => (n || 0) + ' ' + word + (n === 1 ? '' : 's');
  const ago = iso => { if (!iso) return 'jamais en 30 jours'; const d = Math.floor((Date.now() - Date.parse(iso.length === 10 ? iso + 'T12:00:00' : iso)) / DAY); return d <= 0 ? 'aujourd’hui' : d === 1 ? 'hier' : 'il y a ' + d + ' jours'; };
  const ORANGE = '#ff6b1a', BLUE = '#3f8fd4';
  const M = (U && U.measured) || {};
  const NM = 'non mesuré';
  const store = {get(k, d) { try { const v = JSON.parse(localStorage.getItem('sm4rt-os-v2-usage-' + k)); return v ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('sm4rt-os-v2-usage-' + k, JSON.stringify(v)); } catch {} }};
  const st = {
    skills: Object.assign({measure: 'runs', win: 7, show: 'used'}, store.get('skills', {})),
    apps: Object.assign({measure: 'uses', win: 30, group: 'all'}, store.get('apps', {}))
  };
  if (!M.skills) st.skills.show = 'all';
  let selected = {skills: null, apps: null}, current = null;

  // ---------- measures ----------
  const weeks = win => win === 7 ? 1 : 30 / 7;
  const SKILL_MEASURES = [
    {key: 'runs', label: 'Plus utilisées', value: (s, w) => s['runs' + w], fmt: n => n + ' exéc.'},
    {key: 'tokWeek', label: 'Tokens / sem.', value: (s, w) => s['tok' + w] / weeks(w), fmt: n => big(n) + ' tok/sem'},
    {key: 'tokRun', label: 'Tokens / exéc.', value: (s, w) => s['runs' + w] ? s['tok' + w] / s['runs' + w] : 0, fmt: n => big(n) + ' tok/exéc.'},
    {key: 'costWeek', label: '$ API / sem.', value: (s, w) => s['cost' + w] / weeks(w), fmt: n => money(n) + '/sem'},
    {key: 'costRun', label: '$ API / exéc.', value: (s, w) => s['runs' + w] ? s['cost' + w] / s['runs' + w] : 0, fmt: n => money(n) + '/exéc.'}
  ];
  const APP_GROUPS = [{key: 'all', label: 'Toutes'}, {key: 'connector', label: 'Connecteurs'}, {key: 'tool', label: 'Ligne de commande'}, {key: 'sm4rt', label: 'Apps locales'}];
  const local = a => a.group === 'sm4rt';
  const appMeasured = a => local(a) ? true : !!M.apps;
  const appUses = (a, w) => local(a) ? a['visits' + w] : a['calls' + w];
  const appUnit = (a, n) => local(a) ? (n === 1 ? ' ouverture' : ' ouvertures') : a.group === 'tool' ? (n === 1 ? ' commande' : ' commandes') : (n === 1 ? ' appel' : ' appels');
  const APP_MEASURES = [
    {key: 'uses', label: 'Plus utilisées', value: (a, w) => appUses(a, w), fmt: (n, a) => appMeasured(a) ? n + appUnit(a, n) : NM},
    {key: 'stale', label: 'Moins utilisées', value: (a, w) => appUses(a, w), fmt: (n, a) => appMeasured(a) ? n + appUnit(a, n) : NM}
  ];

  // ---------- data for one tab ----------
  function items(view) {
    if (!U) return [];
    if (view === 'skills') {
      const s = st.skills, m = SKILL_MEASURES.find(x => x.key === s.measure) || SKILL_MEASURES[0];
      return U.skills.map(x => ({id: 'skill:' + x.id, name: x.name, raw: x, v: m.value(x, s.win) || 0, used: x['runs' + s.win] > 0, label: M.skills ? m.fmt(m.value(x, s.win) || 0, x) : NM}))
        .filter(x => s.show === 'all' || x.used);
    }
    const s = st.apps, m = APP_MEASURES.find(x => x.key === s.measure) || APP_MEASURES[0];
    const all = [...U.apps, ...U.sm4rt].filter(a => s.group === 'all' || a.group === s.group);
    return all.map(a => ({id: a.id, name: a.label, raw: a, v: m.value(a, s.win) || 0, used: (m.value(a, s.win) || 0) > 0, label: m.fmt(m.value(a, s.win) || 0, a)}));
  }

  // ---------- render ----------
  function render(view, app) {
    current = view;
    let root = $('usage-board');
    if (!root) { root = document.createElement('section'); root.id = 'usage-board'; app.appendChild(root); }
    if (!U) { root.innerHTML = '<p class="ub-empty">Pas encore de données d’usage. Clique sur l’icône Actualiser en haut à droite.</p>'; return; }
    const isSkills = view === 'skills', s = st[view], measures = isSkills ? SKILL_MEASURES : APP_MEASURES;
    const list = items(view), sorted = [...list].sort((a, b) => (isSkills || s.measure === 'uses') ? b.v - a.v || a.name.localeCompare(b.name) : a.v - b.v || String(a.raw.last || '').localeCompare(String(b.raw.last || '')));
    const tot = U.totals[s.win] || {tok: 0, cost: 0};
    const runs = isSkills ? U.skills.reduce((n, x) => n + x['runs' + s.win], 0) : 0;
    const updated = new Date(U.generatedAt).toLocaleString('fr-FR', {weekday: 'short', hour: 'numeric', minute: '2-digit'});
    const summary = isSkills
      ? (M.skills ? `<b>${s.win} DERNIERS JOURS</b> ${M.tokens ? `<span class="ub-hot">${big(tot.tok)}</span> tokens <span class="ub-hot">${money(tot.cost)}</span> API · ` : ''}skills lancées ${runs.toLocaleString('fr-FR')} fois` : `<b>EXÉCUTIONS</b> non mesurées pour l’instant · ${U.skills.length} skills trouvées`)
      : `<b>${s.win} DERNIERS JOURS</b> ${list.filter(x => x.used).length} sur ${list.length} utilisées${M.apps ? '' : ' · appels des connexions non mesurés'}`;
    const unused = isSkills && M.skills ? U.skills.filter(x => !x.runs30) : [];
    root.innerHTML = `
      <div class="ub-top">
        <div class="seg" role="group" aria-label="Mesure">${measures.map(m => `<button data-measure="${m.key}" aria-pressed="${s.measure === m.key}">${m.label}</button>`).join('')}</div>
        <div class="ub-sum">${summary}<span class="ub-when" title="${esc((U.sources || []).join(', '))}">${esc((U.sources || []).length ? 'd’après tes journaux' : 'aucune source pour l’instant')} · ${esc(updated)}</span></div>
        ${isSkills ? '' : `<div class="seg" role="group" aria-label="Type">${APP_GROUPS.map(g => `<button data-group="${g.key}" aria-pressed="${s.group === g.key}">${g.label}</button>`).join('')}</div>`}
        <div class="seg" role="group" aria-label="Période"><button data-win="7" aria-pressed="${s.win === 7}">7 jours</button><button data-win="30" aria-pressed="${s.win === 30}">30 jours</button></div>
        ${isSkills ? `<div class="seg" role="group" aria-label="Afficher"><button data-show="used" aria-pressed="${s.show === 'used'}">Utilisées</button><button data-show="all" aria-pressed="${s.show === 'all'}">Toutes ${U.skills.length}</button></div>` : ''}
      </div>
      <div class="ub-body">
        <div class="ub-field" id="ub-field"><svg id="ub-svg" role="img" aria-label="${isSkills ? 'Skills, taille selon : ' + measures.find(m => m.key === s.measure)?.label : 'Applications, taille selon l’usage'}"></svg></div>
        <aside class="ub-list" id="ub-list">
          <div id="ub-detail"></div>
          <ol class="ub-rows">${sorted.map((x, i) => row(view, x, i, sorted[0]?.v || 1)).join('')}</ol>
          ${unused.length ? `<details class="ub-unused"><summary>Inutilisées depuis 30 jours · ${unused.length}</summary><p>${unused.map(x => `<span class="ub-name" data-id="skill:${esc(x.id)}">${esc(x.name)}</span>`).join(' ')}</p></details>` : ''}
          <p class="ub-method">${esc(isSkills ? U.method?.skill : U.method?.apps)} ${esc(U.rates?.note || '')}</p>
        </aside>
      </div>`;
    root.querySelectorAll('[data-measure]').forEach(b => b.onclick = () => { s.measure = b.dataset.measure; save(view); render(view, app); });
    root.querySelectorAll('[data-win]').forEach(b => b.onclick = () => { s.win = +b.dataset.win; save(view); render(view, app); });
    root.querySelectorAll('[data-show]').forEach(b => b.onclick = () => { s.show = b.dataset.show; save(view); render(view, app); });
    root.querySelectorAll('[data-group]').forEach(b => b.onclick = () => { s.group = b.dataset.group; save(view); render(view, app); });
    root.querySelectorAll('.ub-row').forEach(el => { el.onclick = () => choose(view, el.dataset.id, true); el.onpointerenter = () => hot(el.dataset.id, true); el.onpointerleave = () => hot(el.dataset.id, false); });
    requestAnimationFrame(() => field(view, list));
    if (selected[view]) detail(view, selected[view]);
  }
  const save = view => store.set(view, st[view]);
  function row(view, x, i, max) {
    const a = x.raw, isSkills = view === 'skills', pct = Math.max(2, Math.round(100 * (x.v / (max || 1))));
    const meta = isSkills ? (M.skills ? `${plural(a['runs' + st.skills.win], 'exécution')} · ${big(a['tok' + st.skills.win])} tok · ${money(a['cost' + st.skills.win])}` : (a.kind === 'command' ? 'commande' : 'skill') + ' · exécutions : ' + NM)
      : `${kindLabel(a)} · ${appMeasured(a) ? (local(a) ? 'dernière ouverture : ' : 'dernier usage : ') + ago(a.last) : NM}`;
    return `<li class="ub-row${x.used ? '' : ' idle'}" data-id="${esc(x.id)}" tabindex="0"><span class="ub-rank">${i + 1}</span><span class="ub-name" data-id="${esc(x.id)}">${esc(x.name)}</span><span class="ub-val">${esc(x.label)}</span><span class="ub-bar"><i style="width:${x.used ? pct : 0}%;background:${isSkills ? ORANGE : BLUE}"></i></span><span class="ub-meta">${esc(meta)}</span></li>`;
  }
  const kindLabel = a => local(a) ? 'App locale' + (a.port ? ' :' + a.port : '') : a.group === 'tool' ? (a.kind === 'api' ? 'API' : a.kind === 'app' ? 'App en arrière-plan' : 'Ligne de commande') : a.kind === 'cli+mcp' ? 'Ligne de commande + MCP' : 'Connecteur';

  // ---------- the node field ----------
  function field(view, list) {
    const host = $('ub-field'), svgEl = $('ub-svg'); if (!host || !svgEl) return;
    const W = host.clientWidth, H = host.clientHeight; if (W < 50 || H < 50) return;
    const isSkills = view === 'skills', colour = isSkills ? ORANGE : BLUE;
    host.dataset.view = view;
    const max = Math.max(1e-9, ...list.map(x => x.v));
    const data = list.map(x => ({...x, w: x.used ? Math.max(x.v, max * 0.0025) : max * 0.0012}));
    const svg = d3.select(svgEl).attr('viewBox', `0 0 ${W} ${H}`); svg.selectAll('*').remove();
    if (!data.length) { svg.append('text').attr('x', W / 2).attr('y', H / 2).attr('text-anchor', 'middle').attr('class', 'ub-none').text(isSkills ? 'Aucune skill trouvée pour l’instant. BRAIN.md explique comment montrer tes skills à l’OS.' : 'Aucune application listée pour l’instant. BRAIN.md explique comment les lister.'); return; }
    const root = d3.pack().size([W - 8, H - 8]).padding(7)(d3.hierarchy({children: data}).sum(d => d.w).sort((a, b) => b.value - a.value));
    const g = svg.append('g').attr('transform', 'translate(4,4)');
    const node = g.selectAll('g.ub-node').data(root.leaves()).join('g').attr('class', d => 'ub-node' + (d.data.used ? '' : ' idle')).attr('data-id', d => d.data.id).attr('transform', d => `translate(${d.x},${d.y})`).attr('tabindex', 0);
    const usedVals = data.filter(d => d.used).map(d => d.v).sort((a, b) => b - a), topCut = usedVals[Math.min(4, usedVals.length - 1)] ?? Infinity;
    node.each(function (d) {
      const x = d.data, shape = isSkills ? 'circle' : local(x.raw) ? 'hex' : x.raw.group === 'tool' ? 'square' : 'circle';
      ringNode(d3.select(this), x, Math.max(2.5, d.r), max, topCut, colour, shape);
    });
    node.on('pointerenter', function (e, d) { hot(d.data.id, true); tip(e, d.data, view); }).on('pointermove', e => moveTip(e)).on('pointerleave', function (e, d) { hot(d.data.id, false); hideTip(); })
      .on('click', (e, d) => choose(view, d.data.id, false))
      .on('keydown', (e, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(view, d.data.id, false); } });
  }
  // Thin rings: a hairline ring over a faint tint, both brighter with use, a full 1.5px ring for the
  // top 5. Orange for skills, blue for apps; apps keep their kind's shape (circle connectors, rounded
  // square command line, hexagon local apps). A name shows only when it fits inside the shape.
  const measure = document.createElement('canvas').getContext('2d');
  const textW = (s, size) => { measure.font = `500 ${size}px Outfit`; return measure.measureText(s).width; };
  const FIT = {circle: 1.7, square: 1.6, hex: 1.55};
  function ringNode(el, x, r, max, topCut, colour, shape) {
    const ri = Math.max(1, r - 0.75);
    const c = (shape === 'hex' ? el.append('path').attr('d', hexPath(ri)) : shape === 'square' ? el.append('rect').attr('x', -ri * .86).attr('y', -ri * .86).attr('width', ri * 1.72).attr('height', ri * 1.72).attr('rx', ri * .28) : el.append('circle').attr('r', ri))
      .attr('class', 'ub-shape').attr('stroke', colour);
    if (!x.used) { c.attr('fill', 'none').attr('stroke-opacity', .45).attr('stroke-width', 1).attr('stroke-dasharray', '2 3'); return; }
    const t = Math.sqrt(x.v / max), top = x.v >= topCut, room = r * FIT[shape] - 12;
    c.attr('fill', colour).attr('fill-opacity', .05 + .1 * t).attr('stroke-opacity', top ? 1 : .3 + .5 * t).attr('stroke-width', top ? 1.5 : 1);
    let size = Math.max(10, Math.min(15, r / 3.6));
    while (size > 10 && textW(x.name, size) > room) size -= .5;
    if (r < 18 || textW(x.name, size) > room) return;
    const withValue = r >= 34;
    el.append('text').attr('class', 'ub-label').attr('text-anchor', 'middle').attr('dy', withValue ? '-0.15em' : '0.35em').style('font-size', size + 'px').text(x.name);
    if (withValue) el.append('text').attr('class', 'ub-sub').attr('text-anchor', 'middle').attr('dy', '1.25em').style('font-size', Math.max(10, size * .74) + 'px').text(x.label);
  }
  const hexPath = r => { let p = ''; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 6; p += (i ? 'L' : 'M') + (r * Math.cos(a)).toFixed(2) + ',' + (r * Math.sin(a)).toFixed(2); } return p + 'Z'; };

  // ---------- hover, select, details ----------
  function hot(id, on) {
    document.querySelectorAll(`.ub-row[data-id="${CSS.escape(id)}"]`).forEach(el => el.classList.toggle('hot', on));
    document.querySelectorAll(`.ub-node[data-id="${CSS.escape(id)}"]`).forEach(el => el.classList.toggle('hot', on));
    $('ub-field')?.classList.toggle('has-hot', on);
  }
  function choose(view, id, fromList) {
    selected[view] = id; detail(view, id);
    document.querySelectorAll('.ub-row').forEach(el => el.classList.toggle('sel', el.dataset.id === id));
    document.querySelectorAll('.ub-node').forEach(el => el.classList.toggle('sel', el.dataset.id === id));
    if (!fromList) document.querySelector(`.ub-row[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }
  function detail(view, id) {
    const box = $('ub-detail'); if (!box) return;
    const x = view === 'skills' ? U.skills.find(s => 'skill:' + s.id === id) : [...U.apps, ...U.sm4rt].find(a => a.id === id);
    if (!x) { box.innerHTML = ''; return; }
    const name = `<span class="ub-name">${esc(view === 'skills' ? x.name : x.label)}</span>`;
    if (view === 'skills') {
      const per = (t, r) => r ? big(t / r) : '-';
      const body = M.skills ? `<table><tr><th></th><th>7 jours</th><th>30 jours</th></tr>
        <tr><td>Exécutions</td><td>${x.runs7}</td><td>${x.runs30}</td></tr>
        <tr><td>Tokens</td><td>${big(x.tok7)}</td><td>${big(x.tok30)}</td></tr>
        <tr><td>Tokens / exéc.</td><td>${per(x.tok7, x.runs7)}</td><td>${per(x.tok30, x.runs30)}</td></tr>
        <tr><td>$ API</td><td>${money(x.cost7)}</td><td>${money(x.cost30)}</td></tr>
        <tr><td>$ API / exéc.</td><td>${x.runs7 ? money(x.cost7 / x.runs7) : '-'}</td><td>${x.runs30 ? money(x.cost30 / x.runs30) : '-'}</td></tr></table>
        <p class="ub-foot">Dernière exécution : ${ago(x.last)}${x.subagents30 ? ` · ${x.subagents30} sous-agents en 30 jours` : ''}</p>` : `<p class="ub-foot">Exécutions, tokens et $ API : non mesurés. USAGE.md explique comment ton agent peut les noter.</p>`;
      box.innerHTML = `<div class="ub-card"><div class="ub-card-h">${name}<span class="ub-tag">${esc(x.kind === 'command' ? 'commande' : x.kind)}</span><button class="ub-x" aria-label="Fermer">×</button></div>
        ${x.desc ? `<p class="ub-desc">${esc(x.desc)}</p>` : ''}${body}</div>`;
    } else {
      const isLocal = local(x), measuredHere = appMeasured(x);
      box.innerHTML = `<div class="ub-card"><div class="ub-card-h">${name}<span class="ub-tag">${esc(kindLabel(x))}</span><button class="ub-x" aria-label="Fermer">×</button></div>
        ${x.desc ? `<p class="ub-desc">${esc(x.desc)}</p>` : ''}
        ${measuredHere ? `<table><tr><th></th><th>7 jours</th><th>30 jours</th></tr>
        ${isLocal ? `<tr><td>Ouvertures depuis l’OS</td><td>${x.visits7}</td><td>${x.visits30}</td></tr>${x.agentCalls30 != null ? `<tr><td>Appels de l’agent</td><td></td><td>${x.agentCalls30}</td></tr>` : ''}` : `<tr><td>${x.group === 'tool' ? 'Commandes' : 'Appels d’outils'}</td><td>${x.calls7}</td><td>${x.calls30}</td></tr>`}</table>` : ''}
        <p class="ub-foot">${measuredHere ? (isLocal ? 'Dernière ouverture : ' : 'Dernier usage : ') + ago(x.last) : 'Appels : non mesurés. USAGE.md explique comment ton agent peut les noter.'}${measuredHere && !isLocal && !x.calls30 ? ' · rien en 30 jours : tu peux la déconnecter sans risque si tu n’en as plus besoin' : ''}</p></div>`;
    }
    box.querySelector('.ub-x').onclick = () => { selected[view] = null; box.innerHTML = ''; document.querySelectorAll('.sel').forEach(el => el.classList.remove('sel')); };
  }
  function tip(e, x, view) {
    const h = $('hover'); if (!h) return;
    const a = x.raw;
    h.innerHTML = `<strong>${esc(x.name)}</strong><br>${esc(x.label)}${view === 'skills' ? (M.skills ? `<br><span class="muted">${plural(a['runs' + st.skills.win], 'exécution')} · ${big(a['tok' + st.skills.win])} tokens · ${money(a['cost' + st.skills.win])}</span>` : '') : `<br><span class="muted">${esc(kindLabel(a))}${appMeasured(a) ? ' · ' + (local(a) ? 'dernière ouverture : ' : 'dernier usage : ') + ago(a.last) : ''}</span>`}`;
    h.hidden = false; moveTip(e);
  }
  function moveTip(e) { const h = $('hover'); if (!h || h.hidden) return; const r = h.getBoundingClientRect(); h.style.left = Math.min(innerWidth - r.width - 8, e.clientX + 14) + 'px'; h.style.top = Math.min(innerHeight - r.height - 8, e.clientY + 14) + 'px'; }
  function hideTip() { const h = $('hover'); if (h) h.hidden = true; }

  let resizeT = 0;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (current && document.body.dataset.view === current) field(current, items(current)); }, 120); });
  window.UsageBoard = {
    render,
    state: () => ({view: current, skills: {...st.skills}, apps: {...st.apps}, selected: {...selected}, hasData: !!U, measured: M, generatedAt: U?.generatedAt})
  };
})();

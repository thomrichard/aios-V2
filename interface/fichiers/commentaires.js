/* SM4RT file editor: the comments on the open file (the Fichiers tab).
   AIOS: a layer over the styled view that never touches the file. Select a passage, « Commenter » appears; or comment
   the whole file. The comments live in outbox/commentaires.json (/local/commentaires), which keeps only the living
   ones: « Résoudre » takes one out, and the agent takes out those it dealt with. A comment keeps its passage as a quote
   with a little text before and after; at each drawing of the view the page looks for it again in the text (spaces and
   line breaks do not count) and paints it with the CSS Custom Highlight API, so the page's own text is never wrapped
   or changed. A passage no longer found is shown apart, never lost. « Envoyer à l’agent » builds the request to paste to
   the agent, with the comments marked « à calibrer » grouped apart for /calibrate. app.js creates it with its pieces. */
(() => {
  'use strict';
  window.FilesNotes = ctx => {
    const { $, S, pv, pvPane, api, post, toast, esc, store } = ctx;
    const HL = typeof CSS !== 'undefined' && !!CSS.highlights && typeof Highlight === 'function';
    const N = { all: [], sig: '', error: '', open: store.get('notes', false), scope: 'fiche', draft: null, editing: '', active: '', focusNext: '', ranges: new Map(), pos: new Map(), orphans: new Set(), undo: null, countSig: '' };
    const ICON = {
      bubble: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4.5h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"/></svg>',
      plus: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>',
      close: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>'
    };
    const strip = s => String(s || '').replace(/\s+/g, '');
    const collapse = s => String(s || '').replace(/\s+/g, ' ');
    const cut = (s, n = 600) => { s = collapse(s).trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
    const mine = () => S.doc ? N.all.filter(c => c.fiche === S.doc.path) : [];
    const countFor = p => N.all.reduce((n, c) => n + (c.fiche === p), 0);
    const commentable = () => !!S.doc && ctx.textDoc() && !S.doc.generated;
    const reading = () => !!S.doc && S.doc.kind === 'md' && (ctx.modeNow() === 'preview' || ctx.modeNow() === 'split');
    const when = s => { const d = new Date(String(s || '').replace(' ', 'T')); return isNaN(d) ? '' : ctx.ago(d.getTime()); };
    const panel = $('notes'), body = $('n-body');

    /* ---------------- the text of the view, and where each character comes from ----------------
       human: the text as read, a line break between blocks; key: the same without any space, each of its
       characters tied to its text node and offset. A passage is looked for in key, so spaces never count. */
    const BLOCK = 'p,li,h1,h2,h3,h4,h5,h6,td,th,pre,blockquote,dt,dd,figcaption,header,summary';
    function indexText() {
      const nodes = [], info = new Map(), keyNode = [], keyOff = [];
      let human = '', key = '', last;
      const w = document.createTreeWalker(pv, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) {
        const block = n.parentElement && n.parentElement.closest(BLOCK);
        if (block !== last) { human += '\n'; last = block; }
        info.set(n, { hs: human.length, ks: key.length });
        nodes.push(n);
        const t = n.data;
        human += t;
        for (let i = 0; i < t.length; i++) if (!/\s/.test(t[i])) { key += t[i]; keyNode.push(n); keyOff.push(i); }
      }
      return { nodes, info, keyNode, keyOff, human, key };
    }
    /* the file's line of the block a node is in (data-line counts from 0) */
    function lineOf(n) {
      let el = n && (n.nodeType === 1 ? n : n.parentElement);
      while (el && el.parentElement !== pv) el = el.parentElement;
      const l = el && el.dataset ? el.dataset.line : undefined;
      return l !== undefined && l !== '' ? +l + 1 : undefined;
    }
    /* a selection in the view → the passage, with the text just before and after */
    function fromRange(r) {
      if (!r || r.collapsed || !pv.contains(r.commonAncestorContainer)) return null;
      const ix = indexText();
      let first = null, last = null;
      for (const n of ix.nodes) if (r.intersectsNode(n)) { if (!first) first = n; last = n; }
      if (!first) return null;
      const so = first === r.startContainer ? r.startOffset : 0, eo = last === r.endContainer ? r.endOffset : last.length;
      const a = ix.info.get(first), b = ix.info.get(last);
      const hs = a.hs + so, he = b.hs + eo, ks = a.ks + strip(first.data.slice(0, so)).length, ke = b.ks + strip(last.data.slice(0, eo)).length;
      if (ke <= ks) return null;
      const citation = collapse(ix.human.slice(hs, he)).trim();
      if (!citation) return null;
      return {
        citation,
        avant: collapse(ix.human.slice(Math.max(0, hs - 90), hs)).trimStart().slice(-48),
        apres: collapse(ix.human.slice(he, he + 90)).trimEnd().slice(0, 48),
        pos: ix.key.length ? Math.round(ks / ix.key.length * 1000) / 1000 : 0,
        ligne: lineOf(first)
      };
    }
    /* finds a comment's passage: every place its text appears, the one whose text before and after match best,
       then the one nearest to where it was */
    function locate(c, ix) {
      const k = strip(c.citation); if (!k) return null;
      const a = strip(c.avant), b = strip(c.apres);
      let best = null, top = -1;
      for (let i = ix.key.indexOf(k); i >= 0; i = ix.key.indexOf(k, i + 1)) {
        let s = 0, t = 0; const j = i + k.length;
        while (s < a.length && i - 1 - s >= 0 && ix.key[i - 1 - s] === a[a.length - 1 - s]) s++;
        while (t < b.length && j + t < ix.key.length && ix.key[j + t] === b[t]) t++;
        const near = typeof c.pos === 'number' && ix.key.length ? 1 - Math.abs(i / ix.key.length - c.pos) : 0;
        if (s + t + near > top) { top = s + t + near; best = { i, full: s === a.length && t === b.length }; }
      }
      if (!best) return null;
      const e = best.i + k.length - 1, range = document.createRange();
      range.setStart(ix.keyNode[best.i], ix.keyOff[best.i]);
      range.setEnd(ix.keyNode[e], ix.keyOff[e] + 1);
      return { range, full: best.full, i: best.i };
    }
    function anchorAll() {
      if (!S.doc || S.doc.kind !== 'md' || !reading()) { paintHighlights(); return; }
      N.ranges.clear(); N.pos.clear(); N.orphans.clear();
      const list = mine().filter(c => c.citation), again = [];
      if (list.length) {
        const ix = indexText();
        for (const c of list) {
          const hit = locate(c, ix);
          if (!hit) { N.orphans.add(c.id); continue; }
          N.ranges.set(c.id, hit.range); N.pos.set(c.id, hit.i);
          /* the text around it changed: keep the new one, so the next changes still find it */
          if (!hit.full && !S.edition && !ctx.dirty()) again.push([c, hit.range]);
        }
      }
      paintHighlights();
      for (const [c, r] of again) { const a = fromRange(r); if (a && strip(a.citation) === strip(c.citation)) send({ action: 'ancrer', id: c.id, ancre: a }, true); }
      if (N.focusNext && mine().some(c => c.id === N.focusNext)) { const id = N.focusNext; N.focusNext = ''; activate(id); }
    }
    let anchorTimer = 0;
    const schedule = () => { clearTimeout(anchorTimer); anchorTimer = setTimeout(() => { anchorAll(); paint(); }, 160); };
    function paintHighlights() {
      if (!HL) return;
      const all = [], on = [];
      for (const [id, r] of N.ranges) (id === N.active ? on : all).push(r);
      CSS.highlights.set('notes', new Highlight(...all));
      CSS.highlights.set('notes-on', new Highlight(...on));
      CSS.highlights.set('notes-draft', new Highlight(...(N.draft && N.draft.range ? [N.draft.range] : [])));
    }

    /* ---------------- the server ---------------- */
    async function refresh() {
      const r = await api('/local/commentaires');
      if (r.error) { if (N.error !== r.error) { N.error = r.error; paint(); } return; }
      const sig = JSON.stringify(r.commentaires || []);
      N.error = '';
      if (sig === N.sig) return;
      N.sig = sig; N.all = r.commentaires || [];
      changed();
    }
    async function send(body, quiet = false) {
      const r = await post('/local/commentaires', body);
      if (r.error) { if (!quiet) toast('Pas enregistré : ' + r.error, 'bad'); return null; }
      N.all = r.commentaires || []; N.sig = JSON.stringify(N.all); N.error = '';
      if (!quiet) changed();
      return r;
    }
    function changed() {
      anchorAll(); paint(); paintCount();
      const sig = N.all.map(c => c.fiche).sort().join('\n');
      if (sig !== N.countSig) { N.countSig = sig; ctx.paintSide(); }
    }

    /* ---------------- the bubble on a selection ---------------- */
    const bubble = document.createElement('div');
    bubble.id = 'note-bubble'; bubble.hidden = true;
    bubble.innerHTML = `<button type="button" title="Commenter ce passage (⌘ ⌥ M ou Ctrl Alt M)">${ICON.bubble}Commenter</button>`;
    pvPane.appendChild(bubble);
    bubble.addEventListener('pointerdown', e => e.preventDefault());
    bubble.addEventListener('click', () => startDraft(false));
    function selRange() {
      const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return null;
      const r = s.getRangeAt(0);
      return pv.contains(r.commonAncestorContainer) && r.toString().trim() ? r : null;
    }
    function paintBubble() {
      const r = commentable() && reading() && !S.edition ? selRange() : null;
      if (!r) { bubble.hidden = true; return; }
      const rects = r.getClientRects(), last = rects[rects.length - 1] || r.getBoundingClientRect(), box = pvPane.getBoundingClientRect();
      bubble.hidden = false;
      const w = bubble.offsetWidth;
      bubble.style.top = Math.round(last.bottom - box.top + pvPane.scrollTop + 8) + 'px';
      bubble.style.left = Math.round(Math.max(8, Math.min(pvPane.clientWidth - w - 8, last.right - box.left - w / 2))) + 'px';
    }
    let selTimer = 0;
    document.addEventListener('selectionchange', () => { clearTimeout(selTimer); selTimer = setTimeout(paintBubble, 120); });
    addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.altKey && (e.code === 'KeyM' || e.key.toLowerCase() === 'm') && selRange()) { e.preventDefault(); startDraft(false); }
    });
    /* a click on a commented passage shows its comment */
    const caretAt = (x, y) => {
      if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); return p && { node: p.offsetNode, offset: p.offset }; }
      if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); return r && { node: r.startContainer, offset: r.startOffset }; }
      return null;
    };
    pv.addEventListener('click', e => {
      if (S.edition || !N.ranges.size || e.target.closest('a,input,button')) return;
      if (!getSelection().isCollapsed) return;
      const at = caretAt(e.clientX, e.clientY); if (!at) return;
      let hit = '', len = Infinity;
      for (const [id, r] of N.ranges) { try { if (r.isPointInRange(at.node, at.offset)) { const l = r.toString().length; if (l < len) { len = l; hit = id; } } } catch (_) { } }
      if (hit) { N.scope = 'fiche'; setOpen(true); activate(hit, false); }
    });

    /* ---------------- writing a comment ---------------- */
    function startDraft(whole) {
      if (!commentable()) { toast(S.doc && S.doc.generated ? 'Fichier généré : commente plutôt les fichiers dont il vient.' : 'Ce fichier ne se commente pas ici.'); return; }
      let ancre = null, range = null;
      if (!whole) {
        const r = selRange();
        ancre = r && fromRange(r);
        if (!ancre) { toast('Surligne d’abord un passage du texte.'); return; }
        range = r.cloneRange();
        getSelection().removeAllRanges();
      }
      N.draft = { ancre, range }; N.editing = ''; N.scope = 'fiche'; bubble.hidden = true;
      setOpen(true); paint(); paintHighlights();
      body.querySelector('.composer textarea')?.focus();
    }
    async function saveDraft(card) {
      const texte = card.querySelector('textarea').value.trim();
      if (!texte) { card.querySelector('textarea').focus(); toast('Écris d’abord ton commentaire.'); return; }
      const d = N.draft; if (!d || !S.doc) return;
      const r = await send({ action: 'ajouter', fiche: S.doc.path, texte, ancre: d.ancre, calibrer: card.querySelector('input[type=checkbox]').checked });
      if (!r) return;
      N.draft = null;
      const made = r.commentaires.filter(c => c.fiche === S.doc.path).pop();
      if (made) N.active = made.id;
      paintHighlights(); paint();
      toast('Commentaire enregistré', 'ok');
    }
    async function saveEdit(card, id) {
      const texte = card.querySelector('textarea').value.trim();
      if (!texte) { toast('Le commentaire est vide : « Résoudre » le retire.'); return; }
      if (!(await send({ action: 'modifier', id, texte }))) return;
      N.editing = ''; paint();
    }
    async function resolve(id) {
      const c = N.all.find(x => x.id === id); if (!c) return;
      if (!(await send({ action: 'retirer', ids: [id] }))) return;
      clearTimeout(N.undoTimer); N.undo = c; N.undoTimer = setTimeout(() => { N.undo = null; paint(); }, 9000);
      if (N.active === id) N.active = '';
      paint(); paintHighlights();
    }
    async function undo() {
      const c = N.undo; if (!c) return;
      N.undo = null; clearTimeout(N.undoTimer);
      const ancre = c.citation ? { citation: c.citation, avant: c.avant, apres: c.apres, pos: c.pos, ligne: c.ligne } : null;
      await send({ action: 'ajouter', id: c.id, cree: c.cree, envoye: c.envoye, fiche: c.fiche, texte: c.texte, calibrer: !!c.calibrer, ancre });
    }
    async function attach(id) {
      const r = selRange(), a = r && fromRange(r);
      if (!a) { toast('Surligne d’abord le nouveau passage dans le texte, puis « Rattacher ».'); return; }
      const c = N.all.find(x => x.id === id), req = { action: 'ancrer', id, ancre: a };
      if (c && c.fiche !== S.doc.path) req.fiche = S.doc.path;
      getSelection().removeAllRanges();
      if (await send(req)) { N.scope = 'fiche'; activate(id); toast('Commentaire rattaché', 'ok'); }
    }
    function activate(id, scrollText = true) {
      N.active = id; paintHighlights(); paint();
      body.querySelector(`[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const r = N.ranges.get(id);
      if (scrollText && r && ctx.modeNow() !== 'source') {
        const rect = r.getBoundingClientRect(), box = pvPane.getBoundingClientRect();
        if (rect.top < box.top + 40 || rect.bottom > box.bottom - 40) pvPane.scrollTo({ top: pvPane.scrollTop + rect.top - box.top - pvPane.clientHeight / 3, behavior: 'smooth' });
      }
    }
    async function goTo(id) {
      const c = N.all.find(x => x.id === id); if (!c) return;
      if (c.perdue) { toast('Fiche introuvable : déplacée ou archivée ? « Rattacher ici » la relie à la fiche ouverte.', 'warn'); return; }
      if (S.doc && c.fiche === S.doc.path) { N.scope = 'fiche'; activate(id); return; }
      N.focusNext = id; N.scope = 'fiche';
      await ctx.openFile(c.fiche);
    }

    /* ---------------- the panel ---------------- */
    function setOpen(on) {
      N.open = on; store.set('notes', on);
      panel.hidden = !on || !S.doc;
      document.body.classList.toggle('notes-open', !panel.hidden);
      paintCount();
      if (on) paint();
    }
    function paintCount() {
      const n = mine().length, btn = $('notes-btn');
      btn.hidden = !S.doc;
      btn.querySelector('.n-count').textContent = n || '';
      btn.setAttribute('aria-pressed', !panel.hidden);
      btn.title = n ? `${n} commentaire${n > 1 ? 's' : ''} sur cette fiche` : 'Commenter cette fiche';
    }
    const metaLine = c => [when(c.cree), c.maj ? 'modifié' : '', c.envoye ? 'envoyé ' + when(c.envoye) : ''].filter(Boolean).join(' · ');
    function card(c, opts = {}) {
      const on = c.id === N.active, ed = N.editing === c.id;
      const cite = c.citation ? `<div class="n-cite">« ${esc(cut(c.citation, 400))} »</div>` : '<div class="n-cite whole">Toute la fiche</div>';
      const text = ed
        ? `<textarea rows="3" data-key="edit-${esc(c.id)}" aria-label="Le commentaire">${esc(c.texte)}</textarea>`
        : `<div class="n-text">${esc(c.texte)}</div>`;
      const acts = ed
        ? '<button type="button" data-act="cancel-edit">Annuler</button><button type="button" class="primary" data-act="save-edit">Enregistrer</button>'
        : (opts.orphan ? `<button type="button" data-act="attach" title="Surligne le nouveau passage dans le texte, puis clique ici">${c.fiche === S.doc?.path ? 'Rattacher' : 'Rattacher ici'}</button>` : '')
          + '<button type="button" data-act="edit">Modifier</button><button type="button" data-act="resolve" title="Traité : le commentaire sort de la liste">Résoudre</button>';
      return `<div class="n-card${on ? ' on' : ''}${c.envoye ? ' sent' : ''}${opts.orphan ? ' orphan' : ''}" data-id="${esc(c.id)}">`
        + (opts.fiche ? `<div class="n-fiche">${esc(c.fiche)}</div>` : '')
        + cite + text
        + `<div class="n-meta"><label class="n-cal" title="Une correction qui vaut au-delà de cette fiche : elle nourrira /calibrate"><input type="checkbox" data-act="cal"${c.calibrer ? ' checked' : ''}> À calibrer</label><span>${esc(metaLine(c))}</span></div>`
        + `<div class="n-acts">${acts}</div></div>`;
    }
    function composer() {
      const d = N.draft;
      return `<div class="n-card composer">`
        + (d.ancre ? `<div class="n-cite">« ${esc(cut(d.ancre.citation, 400))} »</div>` : '<div class="n-cite whole">Toute la fiche</div>')
        + '<textarea rows="3" data-key="draft" placeholder="Ton commentaire…" aria-label="Ton commentaire"></textarea>'
        + '<div class="n-meta"><label class="n-cal" title="Une correction qui vaut au-delà de cette fiche : elle nourrira /calibrate"><input type="checkbox" data-key="draft-cal"> À calibrer</label><span>⌘ ↵ enregistre</span></div>'
        + '<div class="n-acts"><button type="button" data-act="cancel-draft">Annuler</button><button type="button" class="primary" data-act="save-draft">Commenter</button></div></div>';
    }
    function paint() {
      if (panel.hidden) return;
      /* what is being written survives a new drawing */
      const keep = {}, focused = document.activeElement && body.contains(document.activeElement) ? document.activeElement.dataset.key : '';
      body.querySelectorAll('[data-key]').forEach(el => keep[el.dataset.key] = el.type === 'checkbox' ? el.checked : el.value);
      $('n-scope').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.scope === N.scope));
      const out = [];
      if (N.error) out.push(`<p class="n-error">${esc(N.error)}</p>`);
      if (N.undo) out.push('<div class="n-undo">Commentaire résolu. <button type="button" data-act="undo">Annuler</button></div>');
      if (N.scope === 'fiche') {
        const list = mine();
        if (!ctx.textDoc()) out.push('<p class="n-empty">Seuls les fichiers texte se commentent.</p>');
        else if (S.doc.generated) out.push('<p class="n-empty">Fichier généré : commente plutôt les fichiers dont il vient.</p>');
        else if (!N.draft || N.draft.ancre) out.push(`<button type="button" class="n-whole" data-act="whole">${ICON.plus}Commenter toute la fiche</button>`);
        if (N.draft) out.push(composer());
        const live = reading(), orphans = list.filter(c => c.citation && live && N.orphans.has(c.id));
        const placed = list.filter(c => !orphans.includes(c))
          .sort((a, b) => (!!a.citation - !!b.citation) || ((N.pos.get(a.id) ?? 1e9) - (N.pos.get(b.id) ?? 1e9)) || String(a.cree).localeCompare(String(b.cree)));
        out.push(...placed.map(c => card(c)));
        if (orphans.length) {
          out.push(`<div class="n-sep"><b>Passages introuvables</b><span>Le texte a changé : ces passages ne se retrouvent plus. Le commentaire reste ; surligne le nouveau passage, puis « Rattacher ».</span></div>`);
          out.push(...orphans.map(c => card(c, { orphan: true })));
        }
        if (!list.length && !N.draft && ctx.textDoc() && !S.doc.generated) out.push(`<p class="n-empty">Aucun commentaire. ${S.doc.kind === 'md' ? 'Surligne un passage du texte, puis « Commenter ».' : ''}</p>`);
      } else {
        const byFile = new Map();
        for (const c of N.all) { if (!byFile.has(c.fiche)) byFile.set(c.fiche, []); byFile.get(c.fiche).push(c); }
        const files = [...byFile.keys()].sort((a, b) => (b === S.doc?.path) - (a === S.doc?.path) || a.localeCompare(b, 'fr'));
        for (const p of files) {
          const cs = byFile.get(p), lost = cs[0].perdue;
          out.push(`<button type="button" class="n-file${lost ? ' lost' : ''}" data-file="${esc(p)}" title="${esc(p)}"><span class="t">${esc(ctx.titre(p))}</span><span class="p">${esc(p)}${lost ? ' · introuvable' : ''}</span><span class="c">${cs.length}</span></button>`);
          out.push(...cs.map(c => card(c, { orphan: lost && !!S.doc && commentable() })));
        }
        if (!files.length) out.push('<p class="n-empty">Aucun commentaire dans le workspace.</p>');
      }
      /* nothing to show differently: the panel stays as it is. A field being written in stays the same field, so a
         dictation tool that aimed at it can still paste into it. */
      const html = out.join('');
      if (html !== N.drawn) {
        N.drawn = html;
        body.innerHTML = html;
        body.querySelectorAll('[data-key]').forEach(el => { const v = keep[el.dataset.key]; if (v !== undefined) { if (el.type === 'checkbox') el.checked = v; else el.value = v; } });
        if (focused) { const el = body.querySelector(`[data-key="${CSS.escape(focused)}"]`); if (el) { el.focus(); if (el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length); } }
      }
      $('n-send').disabled = !N.all.length;
      $('n-send').textContent = 'Envoyer à l’agent' + (N.all.length ? ` (${N.scope === 'fiche' && mine().length ? mine().length : N.all.length})` : '');
    }
    /* buttons that need the selection in the text keep it */
    body.addEventListener('pointerdown', e => { if (e.target.closest('[data-act="attach"]')) e.preventDefault(); });
    body.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'), cardEl = e.target.closest('.n-card'), id = cardEl?.dataset.id;
      if (b) {
        const act = b.dataset.act;
        if (act === 'whole') startDraft(true);
        else if (act === 'cancel-draft') { N.draft = null; paint(); paintHighlights(); }
        else if (act === 'save-draft') saveDraft(cardEl);
        else if (act === 'edit') { N.editing = id; paint(); body.querySelector(`[data-key="edit-${CSS.escape(id)}"]`)?.focus(); }
        else if (act === 'cancel-edit') { N.editing = ''; paint(); }
        else if (act === 'save-edit') saveEdit(cardEl, id);
        else if (act === 'resolve') resolve(id);
        else if (act === 'undo') undo();
        else if (act === 'attach') attach(id);
        else if (act === 'cal' && id) send({ action: 'modifier', id, calibrer: b.checked }).then(r => { if (!r) { N.drawn = ''; paint(); } });
        return;
      }
      const f = e.target.closest('.n-file');
      if (f) { const p = f.dataset.file; if (S.byPath.has(p)) ctx.openFile(p); else toast('Fiche introuvable : ' + p, 'warn'); return; }
      if (id && !e.target.closest('textarea,label') && !cardEl.classList.contains('composer')) goTo(id);
    });
    body.addEventListener('keydown', e => {
      if (e.target.tagName !== 'TEXTAREA') return;
      const cardEl = e.target.closest('.n-card');
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); cardEl.classList.contains('composer') ? saveDraft(cardEl) : saveEdit(cardEl, cardEl.dataset.id); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (cardEl.classList.contains('composer')) { N.draft = null; paintHighlights(); } else N.editing = ''; paint(); }
    });
    $('n-scope').addEventListener('click', e => { const b = e.target.closest('[data-scope]'); if (b) { N.scope = b.dataset.scope; paint(); } });
    $('n-close').onclick = () => setOpen(false);
    $('notes-btn').onclick = () => setOpen(panel.hidden);

    /* ---------------- « Envoyer à l’agent » ---------------- */
    const dlg = $('n-envoi');
    let envoiScope = 'fiche';
    function item(c, n, withFile) {
      const live = S.doc && c.fiche === S.doc.path && reading();
      const r = live && N.ranges.get(c.id), line = r ? lineOf(r.startContainer) : c.ligne;
      const where = !c.citation ? 'Sur toute la fiche'
        : live && N.orphans.has(c.id) ? `Sur un passage qui ne se retrouve plus dans la fiche (le texte a changé) : « ${cut(c.citation)} »`
        : `Sur « ${cut(c.citation)} »${line ? ` (vers la ligne ${line})` : ''}`;
      return [`${n}. [${c.id}] ${withFile ? c.fiche + ' · ' : ''}${where}`, '   ' + c.texte.trim().replace(/\n/g, '\n   '), ''];
    }
    function request(list) {
      const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      const groups = new Map(), cal = [];
      for (const c of list) { if (c.calibrer) { cal.push(c); continue; } if (!groups.has(c.fiche)) groups.set(c.fiche, []); groups.get(c.fiche).push(c); }
      const out = [
        `Mes commentaires sur ${new Set(list.map(c => c.fiche)).size > 1 ? 'des fiches' : 'une fiche'}, laissés dans l’onglet Fichiers (${date}). Ils attendent dans outbox/commentaires.json, chacun avec son id.`,
        '',
        'Pour chaque commentaire : fais le changement demandé dans la fiche, ou dis-moi pourquoi tu ne le fais pas. Ne touche à rien d’autre. Le passage cité vient du texte mis en forme : il peut différer un peu du Markdown.',
        'Quand un commentaire est traité, retire-le de outbox/commentaires.json.'
      ];
      for (const [p, cs] of groups) {
        out.push('', `## ${p}${cs[0].perdue ? ' (introuvable : déplacée ou archivée ?)' : ''}`, '');
        cs.forEach((c, i) => out.push(...item(c, i + 1, false)));
      }
      if (cal.length) {
        out.push('', '## À calibrer', '', 'Ces corrections valent au-delà de leur fiche. Fais-les dans la fiche comme les autres, puis propose au /calibrate de cette session où les inscrire (skill, règle d’AGENTS.md ou mémoire), sans rien écrire avant mon accord.', '');
        cal.forEach((c, i) => out.push(...item(c, i + 1, true)));
      }
      return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n');
    }
    const envoiList = () => envoiScope === 'fiche' ? mine() : N.all;
    function paintEnvoi() {
      const nf = mine().length, nt = N.all.length;
      $('n-envoi-scope').innerHTML = `<button type="button" data-scope="fiche" aria-pressed="${envoiScope === 'fiche'}"${nf ? '' : ' disabled'}>Cette fiche (${nf})</button><button type="button" data-scope="tout" aria-pressed="${envoiScope === 'tout'}">Toutes les fiches (${nt})</button>`;
      const list = envoiList();
      $('n-envoi-text').value = list.length ? request(list) : '';
      $('n-envoi-copy').disabled = !list.length;
    }
    function openEnvoi() {
      if (!N.all.length) return;
      envoiScope = mine().length && N.scope === 'fiche' ? 'fiche' : 'tout';
      paintEnvoi(); dlg.hidden = false; $('n-envoi-copy').focus();
    }
    const closeEnvoi = () => { dlg.hidden = true; $('n-send').focus({ preventScroll: true }); };
    async function copyEnvoi() {
      const ta = $('n-envoi-text'), text = ta.value, list = envoiList();
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (_) { ta.focus(); ta.select(); try { ok = document.execCommand('copy'); } catch (_) { ok = false; } }
      if (!ok) { toast('La copie n’a pas marché : sélectionne le texte et copie-le à la main.', 'bad'); return; }
      await send({ action: 'envoyer', ids: list.map(c => c.id) }, true);
      changed(); dlg.hidden = true;
      toast(`Demande copiée (${list.length} commentaire${list.length > 1 ? 's' : ''}) : colle-la dans la discussion avec ton agent.`, 'ok');
    }
    $('n-send').onclick = openEnvoi;
    $('n-envoi-scope').addEventListener('click', e => { const b = e.target.closest('[data-scope]'); if (b && !b.disabled) { envoiScope = b.dataset.scope; paintEnvoi(); } });
    $('n-envoi-copy').onclick = copyEnvoi;
    $('n-envoi-close').onclick = closeEnvoi;
    dlg.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closeEnvoi(); } });
    dlg.addEventListener('click', e => { if (e.target === dlg) closeEnvoi(); });

    setInterval(() => { if (!document.hidden) refresh(); }, 20000);
    return {
      /* a new file is open */
      doc() {
        /* on a phone the panel covers the text: it opens only when asked */
        if (matchMedia('(max-width: 820px)').matches) N.open = false;
        N.draft = null; N.editing = ''; N.active = ''; N.ranges.clear(); N.pos.clear(); N.orphans.clear(); bubble.hidden = true; panel.hidden = !N.open || !S.doc; document.body.classList.toggle('notes-open', !panel.hidden); paintCount(); paint(); paintHighlights(); schedule(); },
      /* the styled view was drawn again */
      rendered: schedule,
      /* reading or writing, preview or Markdown */
      mode() { if (S.edition) bubble.hidden = true; schedule(); },
      refresh, count: countFor
    };
  };
})();

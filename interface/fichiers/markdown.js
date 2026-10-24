/* SM4RT file editor: the Markdown side of the Fichiers tab.
   blocks()    the styled view, block by block: each block carries its first source line (data-line), so the
               two panes scroll together and a double click finds its line in the text. The page replaces only
               the blocks that changed, which keeps typing instant in a long file.
   lines()     the coloured copy that sits under the text box, one element per line, so here too only the lines
               that changed are replaced. It changes colours only, never widths or weights, so every letter
               stays exactly under the caret.
   tasks()     where each "- [ ]" box sits in the text, so a click on a box in the styled view ticks it. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FM = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/;
  const LABELS = { type: 'Type', statut: 'Statut', domaine: 'Domaine', projet: 'Projet', resume: 'Résumé', cree: 'Créé', maj: 'Mis à jour', liens: 'Liens', echeance: 'Échéance',
    prochaine_etape: 'Prochaine étape', declencheur: 'Déclencheur', source: 'Source', fichier: 'Fichier', ressortir: 'Ressortir' };
  const CHIPS = ['type', 'statut', 'domaine', 'projet'];

  /* [[note]] and [[note|label]], the Obsidian way */
  if (window.marked) marked.use({ extensions: [{
    name: 'wikilink', level: 'inline',
    start: src => { const i = src.indexOf('[['); return i < 0 ? undefined : i; },
    tokenizer(src) { const m = /^\[\[([^\]|\n]+)(?:\|([^\]\n]+))?\]\]/.exec(src); if (m) return { type: 'wikilink', raw: m[0], target: m[1].trim(), label: (m[2] || m[1]).trim() }; },
    renderer: t => `<a href="#" data-wiki="${esc(t.target)}">${esc(t.label)}</a>`
  }] });

  function frontMatter(text) {
    const m = FM.exec(text);
    if (!m) return null;
    const fields = [];
    for (const line of m[1].split('\n')) {
      const k = /^([A-Za-z0-9_-]+):[ \t]*(.*)$/.exec(line);
      if (k) fields.push([k[1], k[2]]);
      else if (fields.length && line.trim()) { const f = fields[fields.length - 1]; f[1] += (f[1] ? ', ' : '') + line.trim().replace(/^-\s*/, ''); }
    }
    return { raw: m[0], bodyLine: (m[0].match(/\n/g) || []).length, fields };
  }
  const clean = v => String(v).split(' #')[0].trim().replace(/^["'>|]\s*|["']$/g, '').replace(/^\[(.*)\]$/, '$1').split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean).join(', ');
  function headerCard(fm) {
    const get = k => clean((fm.fields.find(f => f[0] === k) || [, ''])[1]);
    const chips = CHIPS.flatMap(k => { const v = get(k); return v ? (k === 'projet' ? v.split(', ') : [v]).map(x => `<span class="chip chip-${k}" title="${esc(LABELS[k])}">${esc(x)}</span>`) : []; }).join('');
    const resume = get('resume');
    const rest = fm.fields.filter(([k]) => !CHIPS.includes(k) && k !== 'resume')
      .map(([k, v]) => `<dt>${esc(LABELS[k] || k.replace(/_/g, ' '))}</dt><dd>${clean(v) ? esc(clean(v)) : '<span class="none">—</span>'}</dd>`).join('');
    return `<header class="fm blk" contenteditable="false" title="L’en-tête se modifie dans le Markdown">${chips ? `<div class="chips">${chips}</div>` : ''}${resume ? `<p class="resume">${esc(resume)}</p>` : ''}${rest ? `<dl>${rest}</dl>` : ''}</header>`;
  }

  /* each block: { key, line, html, src }; the same key means the same html, so the page keeps that block as it is.
     src is the block's own text in the file, blank lines after it included: a block left untouched in the styled
     view goes back into the file exactly as it was */
  const cache = new Map();
  function blocks(text) {
    text = String(text).replace(/\r\n?/g, '\n');
    const fm = frontMatter(text), body = fm ? text.slice(fm.raw.length) : text, out = [];
    if (fm) out.push({ key: 'fm\n' + fm.raw, line: 0, html: headerCard(fm), src: '', fm: true });
    if (!window.marked) { out.push({ key: body, line: fm ? fm.bodyLine : 0, html: '<div class="blk"><pre>' + esc(body) + '</pre></div>', src: body }); return out; }
    const tokens = marked.lexer(body), refs = Object.keys(tokens.links || {}).length ? JSON.stringify(tokens.links) : '';
    if (cache.size > 4000) cache.clear();
    let cursor = 0, line = fm ? fm.bodyLine : 0;
    for (const tok of tokens) {
      const at = body.indexOf(tok.raw, cursor), start = at < 0 ? cursor : at;
      for (let i = cursor; i < start; i++) if (body.charCodeAt(i) === 10) line++;
      const first = line;
      for (let i = start, end = start + tok.raw.length; i < end && i < body.length; i++) if (body.charCodeAt(i) === 10) line++;
      cursor = Math.min(body.length, start + tok.raw.length);
      if (tok.type === 'space') continue;
      const key = tok.type + '\n' + refs + '\n' + tok.raw;
      let part = cache.get(key);
      if (part === undefined) {
        try { part = marked.parser(Object.assign([tok], { links: tokens.links })); } catch (_) { part = '<pre>' + esc(tok.raw) + '</pre>'; }
        cache.set(key, part);
      }
      out.push({ key, line: first, html: `<div class="blk">${part}</div>`, start });
    }
    const own = out.filter(b => !b.fm);
    own.forEach((b, i) => { b.src = body.slice(b.start, i + 1 < own.length ? own[i + 1].start : body.length); });
    return out;
  }
  /* a fragment safe to put in the page: no scripts, frames, forms or styles, no event handlers, no javascript: links;
     images wait in data-src until the page gives them a workspace address */
  function fragment(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('script,iframe,frame,frameset,object,embed,form,meta,link,base,style,noscript').forEach(n => n.remove());
    tpl.content.querySelectorAll('*').forEach(el => {
      for (const a of [...el.attributes]) {
        if (/^on/i.test(a.name) || (/^(href|src|xlink:href|action|formaction|srcset)$/i.test(a.name) && /^\s*(javascript|vbscript|data:text\/html)/i.test(a.value))) el.removeAttribute(a.name);
      }
    });
    tpl.content.querySelectorAll('img[src]').forEach(img => { img.dataset.src = img.getAttribute('src'); img.removeAttribute('src'); img.loading = 'lazy'; });
    tpl.content.querySelectorAll('input[type=checkbox]').forEach(box => box.removeAttribute('disabled'));
    return tpl.content;
  }
  /* after the blocks change: heading anchors (#titre) and the order of the task boxes, over the whole view */
  function number(root) {
    const seen = new Map();
    root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
      const slug = h.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'titre';
      const n = seen.get(slug) || 0; seen.set(slug, n + 1); h.id = n ? slug + '-' + n : slug;
    });
    let i = 0;
    root.querySelectorAll('input[type=checkbox]').forEach(box => { box.dataset.task = i++; });
  }

  /* ---------- the coloured copy under the text box ---------- */
  const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*|__[^_\n]+__)|(\[\[[^\]\n]+\]\])|(!?\[[^\]\n]*\]\([^)\n]*\))|(\*(?![\s*])[^*\n]+?\*)|(https?:\/\/[^\s)>\]]+)/g;
  const INLINE_CLASS = ['', 'c', 'b', 'a', 'a', 'i', 'u'];
  function inline(s) {
    let out = '', last = 0, m;
    INLINE.lastIndex = 0;
    while ((m = INLINE.exec(s))) {
      const g = INLINE_CLASS.findIndex((_, i) => i && m[i] !== undefined);
      out += esc(s.slice(last, m.index)) + `<span class="${INLINE_CLASS[g]}">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(s.slice(last));
  }
  function fmEnd(lines) {
    if (!lines.length || lines[0].trim() !== '---') return -1;
    for (let j = 1; j < lines.length; j++) if (lines[j].trim() === '---') return j;
    return -1;
  }
  /* one <div class="ln"> per line of the text */
  function lines(text, markdown = true) {
    const lines = String(text).split('\n');
    if (!markdown) return lines.map(l => '<div class="ln">' + esc(l) + '</div>');
    const end = fmEnd(lines), out = [];
    let fence = null;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      let cls = '', html;
      if (end > 0 && i <= end) {
        if (i === 0 || i === end) { cls = 'fm-d'; html = esc(l); }
        else { const m = /^([A-Za-z0-9_-]+)(:)(.*)$/.exec(l); cls = 'fm'; html = m ? `<span class="fm-k">${esc(m[1])}</span><span class="p">:</span><span class="fm-v">${esc(m[3])}</span>` : esc(l); }
      } else if (fence) {
        cls = 'code'; html = esc(l);
        if (l.trim().startsWith(fence)) fence = null;
      } else {
        const f = /^\s*(```+|~~~+)/.exec(l), h = /^(#{1,6})(\s.*|)$/.exec(l), q = /^(\s*(?:>\s?)+)(.*)$/.exec(l);
        const li = /^(\s*)([-*+]|\d+[.)])(\s+)(\[[ xX]\](?=\s|$))?(.*)$/.exec(l), tb = /^\s*\|/.test(l), hr = /^\s*([-*_])(\s*\1){2,}\s*$/.test(l);
        if (f) { fence = f[1]; cls = 'code'; html = esc(l); }
        else if (h) { cls = 'h h' + h[1].length; html = `<span class="mk">${h[1]}</span>${inline(h[2])}`; }
        else if (hr) { cls = 'hr'; html = esc(l); }
        else if (q) { cls = 'q'; html = `<span class="mk">${esc(q[1])}</span>${inline(q[2])}`; }
        else if (li) { cls = 'li'; html = esc(li[1]) + `<span class="mk">${esc(li[2])}</span>` + esc(li[3]) + (li[4] ? `<span class="task">${esc(li[4])}</span>` : '') + inline(li[5]); }
        else if (tb) { cls = 'tb'; html = inline(l).replace(/\|/g, '<span class="p">|</span>'); }
        else html = inline(l);
      }
      out.push(`<div class="ln${cls ? ' ' + cls : ''}">${html}</div>`);
    }
    return out;
  }

  /* where each task box sits: the offset of the space or x between the brackets */
  function tasks(text) {
    const lines = String(text).split('\n'), end = fmEnd(lines), out = [];
    let pos = 0, fence = null;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!(end > 0 && i <= end)) {
        const f = /^\s*(```+|~~~+)/.exec(l);
        if (fence) { if (l.trim().startsWith(fence)) fence = null; }
        else if (f) fence = f[1];
        else { const m = /^(\s*(?:>\s?)*(?:[-*+]|\d+[.)])\s+)\[([ xX])\](?= )/.exec(l); if (m) out.push({ at: pos + m[1].length + 1, checked: m[2] !== ' ', line: i }); }
      }
      pos += l.length + 1;
    }
    return out;
  }

  /* ---------- back from the styled view to Markdown ----------
     Only for the blocks the user changed in the styled view. Written the way this workspace writes:
     # titles, - lists, - [ ] tasks, **bold**, *italic*, [[links]], |---| tables. */
  const BLOCK = /^(P|DIV|H[1-6]|UL|OL|LI|BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TFOOT|TR|HR|HEADER|SECTION|ARTICLE|FIGURE|DL)$/;
  const escText = s => s.replace(/([\\`*\[\]<])/g, '\\$1').replace(/(^|[^\p{L}\p{N}])_|_(?=[^\p{L}\p{N}]|$)/gu, m => m.replace('_', '\\_'));
  const wrap = (mark, inner) => { const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner); return m[2] ? m[1] + mark + m[2] + mark + m[3] : inner; };
  function inl(n) {
    if (n.nodeType === 3) return escText(n.nodeValue.replace(/\u00a0/g, ' '));
    if (n.nodeType !== 1) return '';
    const t = n.tagName, kids = () => [...n.childNodes].map(inl).join('');
    if (t === 'BR') return '\\\n';
    if (t === 'INPUT') return '';
    if (t === 'STRONG' || t === 'B') return wrap('**', kids());
    if (t === 'EM' || t === 'I') return wrap('*', kids());
    if (t === 'DEL' || t === 'S' || t === 'STRIKE') return wrap('~~', kids());
    if (t === 'CODE') { const c = n.textContent.replace(/\u00a0/g, ' '); return c.includes('`') ? '`` ' + c + ' ``' : '`' + c + '`'; }
    if (t === 'IMG') { const s = n.dataset.src || (/^blob:/.test(n.getAttribute('src') || '') ? '' : n.getAttribute('src') || ''); return s ? `![${(n.getAttribute('alt') || '').replace(/[\[\]]/g, '')}](${s})` : ''; }
    if (t === 'A') {
      const label = kids();
      if (n.dataset.wiki) { const plainLabel = n.textContent.trim(); return plainLabel && plainLabel !== n.dataset.wiki ? `[[${n.dataset.wiki}|${plainLabel}]]` : `[[${n.dataset.wiki}]]`; }
      const href = n.getAttribute('href') || '';
      return href && href !== '#' ? `[${label}](${href.replace(/ /g, '%20')})` : label;
    }
    return kids();
  }
  const inlineMd = el => [...el.childNodes].map(inl).join('').replace(/(\\\n)+$/, '').replace(/^(\\\n)+/, '');
  /* a line that would turn into something else (a title, a quote, a list) keeps its first sign as plain text */
  const plainStart = s => s.replace(/^(#{1,6}\s|>|[-+]\s)/, '\\$1').replace(/^(\d+)([.)]\s)/, '$1\\$2');
  function list(el, indent) {
    const ordered = el.tagName === 'OL', lines = [];
    let n = +(el.getAttribute('start') || 1);
    for (const li of el.children) {
      if (li.tagName !== 'LI') continue;
      const marker = ordered ? (n++) + '.' : '-', pad = indent + ' '.repeat(marker.length + 1);
      const box = li.querySelector(':scope > input[type=checkbox], :scope > p:first-child > input[type=checkbox]');
      const own = [], nested = [];
      for (const c of li.childNodes) (c.nodeType === 1 && (c.tagName === 'UL' || c.tagName === 'OL') ? nested : own).push(c);
      const holder = document.createElement('div'); own.forEach(c => holder.append(c.cloneNode(true)));
      const body = mdBlocks(holder.childNodes).join('\n\n').replace(/\n/g, '\n' + pad);
      lines.push((indent + marker + ' ' + (box ? (box.checked ? '[x] ' : '[ ] ') : '') + body).replace(/\s+$/, ''));
      for (const sub of nested) lines.push(list(sub, pad));
    }
    return lines.join('\n');
  }
  function table(el) {
    const rows = [...el.querySelectorAll('tr')].map(tr => [...tr.children].map(td => inlineMd(td).replace(/\|/g, '\\|').replace(/\\\n/g, '<br>').replace(/\n/g, ' ').trim()));
    if (!rows.length) return '';
    const width = Math.max(...rows.map(r => r.length)), cells = r => '| ' + Array.from({ length: width }, (_, i) => r[i] || '').join(' | ') + ' |';
    const aligns = [...(el.querySelector('tr')?.children || [])].map(c => ({ left: ':---', center: ':---:', right: '---:' }[c.getAttribute('align') || c.style.textAlign] || '---'));
    return [cells(rows[0]), '|' + Array.from({ length: width }, (_, i) => aligns[i] || '---').join('|') + '|', ...rows.slice(1).map(cells)].join('\n');
  }
  function mdBlocks(nodes) {
    const out = [];
    let run = [];
    const flush = () => { const holder = document.createElement('p'); run.forEach(c => holder.append(c.cloneNode(true))); const s = inlineMd(holder).trim(); if (s) out.push(plainStart(s)); run = []; };
    for (const n of nodes) {
      if (n.nodeType === 8) { flush(); out.push('<!--' + n.data + '-->'); continue; }
      if (n.nodeType === 3 || (n.nodeType === 1 && !BLOCK.test(n.tagName))) { run.push(n); continue; }
      if (n.nodeType !== 1) continue;
      flush();
      const t = n.tagName;
      if (/^H[1-6]$/.test(t)) { const s = inlineMd(n).replace(/\\\n/g, ' ').trim(); if (s) out.push('#'.repeat(+t[1]) + ' ' + s); }
      /* the browser sometimes puts a list or a title inside a paragraph: then it is only a container */
      else if (t === 'P' && [...n.children].some(c => BLOCK.test(c.tagName))) out.push(...mdBlocks(n.childNodes));
      else if (t === 'P') { const s = inlineMd(n).trim(); if (s) out.push(plainStart(s)); }
      else if (t === 'UL' || t === 'OL') { const s = list(n, ''); if (s.trim()) out.push(s); }
      else if (t === 'LI') { const ul = document.createElement('ul'); ul.append(n.cloneNode(true)); out.push(list(ul, '')); }
      else if (t === 'BLOCKQUOTE') { const inner = mdBlocks(n.childNodes).join('\n\n'); if (inner.trim()) out.push(inner.split('\n').map(l => l ? '> ' + l : '>').join('\n')); }
      else if (t === 'PRE') { const code = n.querySelector('code'), lang = ((code?.className || '').match(/language-(\S+)/) || [])[1] || ''; out.push('```' + lang + '\n' + (n.innerText ?? n.textContent).replace(/\u00a0/g, ' ').replace(/\n$/, '') + '\n```'); }
      else if (t === 'TABLE') { const s = table(n); if (s) out.push(s); }
      else if (t === 'HR') out.push('---');
      else out.push(...mdBlocks(n.childNodes));
    }
    flush();
    return out;
  }
  const toMarkdown = el => mdBlocks(el.childNodes).join('\n\n');

  window.FilesMD = { blocks, fragment, number, lines, tasks, frontMatter, toMarkdown };
})();

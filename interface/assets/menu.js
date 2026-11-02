/* SM4RT menu: the left menu shared by every page of the socle (the home and its Orbes 3D and Disque, Projets, Vidéos, Skills,
   Connecteurs, Routines, Fichiers, Bibliothèque, Outbox, and Réglages at the bottom). A page asks for it with <body data-page="projets"> and this script,
   nothing else. It folds to a narrow rail (kept in this browser, the same for every page), marks the page you are on,
   shows how many files wait for your validation in the Outbox, and refreshes the data (routines, skills, connectors, usage). In the shell's
   frames, a click asks the shell to change tab (message sm4rt-menu); on its own, a page links to the others. */
(() => {
  'use strict';
  const page = document.body && document.body.dataset.page;
  if (!page) return;
  const embedded = window !== parent;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sm4rt-menu:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('sm4rt-menu:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  const svg = d => `<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  /* id, label, address on its own, icon */
  const ITEMS = [
    ['accueil', 'Accueil', '/', '<path d="M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z"/>'],
    ['projets', 'Projets', '/projets/', '<rect x="3" y="3" width="14" height="14" rx="3"/><path d="M7 7v6M10 7v3M13 7v5"/>'],
    ['videos', 'Vidéos', '/videos/', '<rect x="2.5" y="4.5" width="15" height="11" rx="2.5"/><path d="m8.5 8 3.5 2-3.5 2z"/>'],
    ['skills', 'Skills', '/competences/', '<path d="M11 2 4 11h5l-1 7 7-9h-5l1-7z"/>'],
    ['connecteurs', 'Connecteurs', '/connecteurs/', '<path d="M7.5 2.5v4M12.5 2.5v4M5 6.5h10v3a5 5 0 0 1-10 0z"/><path d="M10 14.5v3"/>'],
    ['routines', 'Routines', '/routines/', '<circle cx="10" cy="10.5" r="7"/><path d="M10 6.5v4l2.6 2.6M7.5 2.5h5"/>'],
    ['fichiers', 'Fichiers', '/fichiers/', '<path d="M5 2.5h6.5L15 6v11.5H5z"/><path d="M11 2.5V6h4M8 10h4M8 13h4"/>'],
    ['bibliotheque', 'Bibliothèque', '/bibliotheque/', '<rect x="3" y="4" width="14" height="12" rx="2"/><circle cx="7.5" cy="8.5" r="1.5"/><path d="m3.5 14.5 4.5-4 3 3 2-2 3.5 3"/>'],
    ['outbox', 'Outbox', '/outbox/', '<path d="M3 12v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/><path d="M10 13V3M6 7l4-4 4 4"/>']
  ];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const nav = document.createElement('nav');
  nav.id = 'menu'; nav.setAttribute('aria-label', 'Menu principal');
  nav.innerHTML = `<div class="marque"><span class="logo" aria-hidden="true">A</span><span class="marque-texte"><b>Mon AIOS</b><span class="menu-etat" id="menu-etat"><i></i><span>en ligne</span></span></span></div>
    <div class="menu-liste">${ITEMS.map(i => {
      const on = i[0] === page;
      return `<a class="rail-btn menu-lien" data-menu="${i[0]}" href="${i[2] || '/'}"${on ? ' aria-current="page"' : ''} title="${esc(i[1])}">${svg(i[3])}<span class="rail-libelle menu-libelle">${esc(i[1])}</span>${i[0] === 'outbox' ? '<span class="menu-badge" id="menu-badge" hidden></span>' : ''}</a>`;
    }).join('')}</div>
    <div class="rail-bas menu-bas">
      <a class="rail-btn menu-lien" data-menu="reglages" id="menu-reglages" href="/reglages/"${page === 'reglages' ? ' aria-current="page"' : ''} title="Réglages : affichage, domaines, types et statuts, champs, familles de skills">${svg('<circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/>')}<span class="rail-libelle menu-libelle">Réglages</span></a>
      <button type="button" class="rail-btn" id="menu-actualiser" title="Actualiser les données : routines, skills, connecteurs et usage (sans appel au modèle)">${svg('<path d="M16 10a6 6 0 1 1-1.8-4.3"/><path d="M16 3.5v3.2h-3.2"/>')}<span class="rail-libelle menu-libelle" id="menu-actualiser-texte">Actualiser</span></button>
      <button type="button" class="rail-btn" id="menu-replier" aria-expanded="true" title="Replier le menu">${svg('<path id="menu-ico" d="M11 5 6 10l5 5M15 5l-5 5 5 5"/>')}<span class="rail-libelle menu-libelle" id="menu-replier-texte">Replier</span></button>
    </div>`;
  document.body.classList.add('avec-menu');
  document.body.prepend(nav);

  /* the fold */
  function plie(v) {
    document.body.classList.toggle('menu-replie', v); store.set('replie', v);
    const b = document.getElementById('menu-replier');
    b.setAttribute('aria-expanded', !v); b.title = v ? 'Déplier le menu' : 'Replier le menu';
    document.getElementById('menu-replier-texte').textContent = v ? 'Déplier' : 'Replier';
    document.getElementById('menu-ico').setAttribute('d', v ? 'M5 5l5 5-5 5M9 5l5 5-5 5' : 'M11 5 6 10l5 5M15 5l-5 5 5 5');
  }
  plie(!!store.get('replie', false));
  document.getElementById('menu-replier').onclick = () => plie(!document.body.classList.contains('menu-replie'));
  /* the shell's other tabs, already open, follow a fold made here */
  addEventListener('storage', e => { if (e.key === 'sm4rt-menu:replie') plie(e.newValue === 'true'); });

  /* a click: the shell changes tab, or the page links to the other */
  nav.addEventListener('click', e => {
    const a = e.target.closest('a[data-menu]'); if (!a) return;
    if (a.getAttribute('aria-current') === 'page') { e.preventDefault(); return; }
    if (embedded) { e.preventDefault(); parent.postMessage({ type: 'sm4rt-menu', vue: a.dataset.menu }, '*'); }
  });

  /* Actualiser: in the shell, the shell rebuilds the data and reloads its frames; on its own, the page reloads */
  const actualiser = document.getElementById('menu-actualiser');
  actualiser.addEventListener('click', async () => {
    if (embedded) { parent.postMessage({ type: 'sm4rt-menu', vue: 'actualiser' }, '*'); return; }
    if (actualiser.getAttribute('aria-busy') === 'true') return;
    actualiser.setAttribute('aria-busy', 'true'); document.getElementById('menu-actualiser-texte').textContent = 'Actualisation…';
    try { const r = await fetch('/local/refresh', { method: 'POST' }), d = await r.json(); if (!d.ok) throw 0; location.reload(); }
    catch (_) { actualiser.removeAttribute('aria-busy'); document.getElementById('menu-actualiser-texte').textContent = 'Échec : réessayer'; }
  });

  /* the Outbox badge: the files that wait for your validation, kept 60 s so that moving between pages costs nothing */
  const badge = n => {
    const b = document.getElementById('menu-badge'); if (!b) return;
    b.hidden = !(n > 0); b.textContent = String(n).padStart(2, '0'); b.title = n + (n > 1 ? ' fichiers à valider' : ' fichier à valider');
  };
  async function compteOutbox() {
    let c = null; try { c = JSON.parse(sessionStorage.getItem('sm4rt-menu:outbox') || 'null'); } catch (_) { }
    if (c && Date.now() - c.t < 60000) return badge(c.n);
    try {
      const r = await fetch('/local/outbox', { cache: 'no-store' }), d = await r.json();
      if (!r.ok || !Array.isArray(d.entrees)) return;
      const n = d.entrees.length;
      try { sessionStorage.setItem('sm4rt-menu:outbox', JSON.stringify({ t: Date.now(), n })); } catch (_) { }
      badge(n);
    } catch (_) { }
  }
  /* the Outbox page tells its own count whenever it changes */
  addEventListener('sm4rt:outbox', e => { badge(e.detail); try { sessionStorage.setItem('sm4rt-menu:outbox', JSON.stringify({ t: Date.now(), n: e.detail })); } catch (_) { } });
  if (page !== 'outbox') { compteOutbox(); addEventListener('focus', compteOutbox); }

  /* « en ligne » is what the server says */
  fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).then(d => { if (!d.ok) throw 0; }).catch(() => {
    const s = document.getElementById('menu-etat'); s.classList.add('hors'); s.lastElementChild.textContent = 'hors ligne';
  });
})();

/* SM4RT Jarvis: the Second Brain's Jarvis tab, or /jarvis/ on its own. V0, in text.
   A sentence goes to /local/jarvis; the server asks the model which action to take, checks it and executes it. The page
   shows the answer and how long it took, follows the page asked for, and lists what a search found. It keeps nothing:
   each sentence stands alone. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = window !== parent;

  /* ---------------------------- the conversation ---------------------------- */
  const secondes = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';
  function ligne(qui, texte) {
    const li = document.createElement('li'); li.className = 'ligne ' + qui;
    const p = document.createElement('p'); p.textContent = texte; li.append(p);
    $('fil').append(li); li.scrollIntoView({ block: 'nearest' });
    return li;
  }
  function ouvreFichier(chemin) {
    if (embedded) parent.postMessage({ type: 'jarvis-copy-edit', path: chemin }, '*');
    else location.href = '/fichiers/?f=' + encodeURIComponent(chemin);
  }
  function ouvrePage(d) {
    if (embedded) parent.postMessage({ type: 'sm4rt-menu', vue: d.page }, '*');
    else location.href = d.adresse;
  }
  function resultats(li, liste) {
    const ul = document.createElement('ul'); ul.className = 'resultats';
    for (const r of liste) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'resultat';
      const t = document.createElement('b'); t.textContent = r.titre;
      const c = document.createElement('span'); c.textContent = r.resume || r.chemin;
      b.append(t, c); b.title = r.chemin; b.onclick = () => ouvreFichier(r.chemin);
      const i = document.createElement('li'); i.append(b); ul.append(i);
    }
    li.append(ul);
  }
  async function demande(texte) {
    ligne('moi', texte);
    const attente = ligne('lui attente', '…');
    $('envoyer').disabled = true;
    let d;
    try {
      const r = await fetch('/local/jarvis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texte }) });
      d = await r.json();
    } catch (_) { d = { error: 'L’OS ne répond pas.' }; }
    attente.remove();
    $('envoyer').disabled = false; $('texte').focus();
    if (d.error) return void ligne('lui erreur', d.error);
    const li = ligne('lui', d.reponse);
    if (d.resultats && d.resultats.length) resultats(li, d.resultats);
    const duree = document.createElement('small'); duree.textContent = 'en ' + secondes(d.total); li.append(duree);
    li.scrollIntoView({ block: 'nearest' });
    if (d.outil === 'ouvrir_page') setTimeout(() => ouvrePage(d), 700);
  }
  $('form').addEventListener('submit', e => {
    e.preventDefault();
    const texte = $('texte').value.trim();
    if (!texte || $('envoyer').disabled) return;
    $('texte').value = '';
    demande(texte);
  });

  /* ---------------------------- appearance ---------------------------- */
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
  addEventListener('pointerdown', e => { if (!$('reglages').hidden && !e.target.closest('#reglages,#btn-reglages,#menu-reglages')) fermeReglages(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('reglages').hidden) fermeReglages(); });
  addEventListener('message', e => { if (embedded && e.source === parent && e.data?.type === 'jarvis-copy' && e.data.action === 'shown') $('texte').focus(); });
  if (embedded) { $('retour').hidden = true; parent.postMessage({ type: 'jarvis-copy-ready' }, '*'); }
  $('texte').focus();
})();

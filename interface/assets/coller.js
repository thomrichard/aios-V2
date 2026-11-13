/* Coller dans un champ de texte : la page écrit elle-même le texte collé.
   Quand on colle, Chrome lit le presse-papiers deux fois : une fois pour l'événement « paste », une fois pour
   écrire dans le champ. La seconde lecture revient parfois vide : le texte est dans l'événement, mais rien
   n'arrive dans le champ (constaté le 2026-11-08 avec un outil de dictée, et à la main : le premier ⌘V ne fait rien, le
   second marche). On prend donc le texte de l'événement, toujours là, et on l'insère nous-mêmes, avec
   l'annulation (⌘Z) et l'événement « input » habituels. Une page qui gère déjà son collage garde la main.
   Chaque page qui a des champs le charge ; une page dans un cadre a le sien.
   Le journal des collages (localStorage « sm4rt-collages », les 100 derniers, sans le texte collé) dit pour
   chacun : la page, le champ, la longueur reçue et si le texte est entré. Pour le lire, dans la console :
   JSON.parse(localStorage['sm4rt-collages']) */
(() => {
  'use strict';
  if (window.__collerSur) return;
  window.__collerSur = 2;
  const UNE_LIGNE = /^(text|search|url|email|tel)$/;
  const JOURNAL = 'sm4rt-collages';
  const noter = (x) => {
    try {
      const a = JSON.parse(localStorage.getItem(JOURNAL) || '[]');
      a.push({ quand: new Date().toLocaleString('fr-CA', { hour12: false }), page: location.pathname + location.search.slice(0, 80), ...x });
      localStorage.setItem(JOURNAL, JSON.stringify(a.slice(-100)));
    } catch (_) { }
  };
  const nom = (t) => t.tagName.toLowerCase() + ' « ' + String(t.getAttribute('aria-label') || t.placeholder || t.id || t.className || '').slice(0, 50) + ' »';
  /* après coup : le texte est-il dans le champ ? */
  const verifier = (t, avant, n, comment) => setTimeout(() => {
    const entre = t.value.length - avant;
    noter({ champ: nom(t), recu: n, entre, resultat: n && entre >= n - 2 ? 'ok' : entre > 0 ? 'en partie' : 'rien', comment });
  }, 0);
  addEventListener('paste', (e) => {
    const t = e.target;
    if (!t || t.readOnly || t.disabled) return;
    const zone = t.tagName === 'TEXTAREA', ligne = t.tagName === 'INPUT' && UNE_LIGNE.test(t.type);
    if (!zone && !ligne) return;
    let texte = e.clipboardData && e.clipboardData.getData('text/plain');
    const avant = t.value.length - (t.selectionEnd - t.selectionStart);
    if (e.defaultPrevented) return verifier(t, avant, (texte || '').length, 'par la page');
    /* rien dans l'événement : Chrome n'a pas reçu de texte, on laisse faire le collage normal */
    if (!texte) return verifier(t, avant, 0, 'presse-papiers vide (types : ' + [...(e.clipboardData?.types || [])].join(', ') + ')');
    if (ligne) texte = texte.replace(/\r?\n/g, ' ');
    e.preventDefault();
    if (!document.execCommand('insertText', false, texte)) {
      t.setRangeText(texte, t.selectionStart, t.selectionEnd, 'end');
      t.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste', data: texte }));
    }
    verifier(t, avant, texte.length, 'coller.js');
  });
})();

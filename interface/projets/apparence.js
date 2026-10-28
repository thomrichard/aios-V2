/* SM4RT apparence: night or day, and the colour, read before the page paints so it never flashes.
   Kept in this browser (localStorage "sm4rt-apparence"); "auto" follows the computer's own setting. */
(() => {
  'use strict';
  const KEY = 'sm4rt-apparence', MODES = ['nuit', 'jour', 'auto'], COULEURS = ['turquoise', 'braise', 'glacier', 'violet'];
  const sombre = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function get() {
    let v = {}; try { v = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { }
    return { mode: MODES.includes(v.mode) ? v.mode : 'nuit', couleur: COULEURS.includes(v.couleur) ? v.couleur : 'turquoise' };
  }
  function applique() {
    const a = get(), html = document.documentElement;
    html.dataset.mode = a.mode === 'auto' ? (sombre && !sombre.matches ? 'jour' : 'nuit') : a.mode;
    html.dataset.couleur = a.couleur;
    return a;
  }
  function set(part) {
    const a = { ...get(), ...part };
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (_) { }
    return applique();
  }
  if (sombre && sombre.addEventListener) sombre.addEventListener('change', () => { if (get().mode === 'auto') applique(); });
  /* another tab or frame changed it: follow */
  addEventListener('storage', e => { if (e.key === KEY) applique(); });
  window.Apparence = { get, set, applique, MODES, COULEURS };
  applique();
})();

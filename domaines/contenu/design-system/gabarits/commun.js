// Remplit un gabarit depuis l'adresse : ?mode=papier&titre=Arrête de|gaspiller|*tes tokens*&photo=sourire
// ou ?donnees={…} (JSON) : les mêmes champs, plus des listes (les lignes d'un schéma).
// Dans un texte, *mot* passe en mot fort (dégradé) et | va à la ligne. Un champ vide ("") retire l'élément.
(function () {
  const D = "M648.45 257.13 579.17 377.13 500 240 207.85 746.03 366.19 746.03 296.91 866.03 0 866.03 500 0ZM500 280 757.51 726.03 620.61 726.03 500 517.13 379.39 726.03 242.49 726.03ZM740 378.56 660.83 515.69 591.55 395.69 740 138.56 1240 1004.59 943.09 1004.59 873.81 884.59 1032.15 884.59ZM740 418.56 997.51 864.59 482.49 864.59 550.94 746.03 792.15 746.03 671.55 537.13ZM500 557.13 568.45 675.69 447.85 884.59 689.06 884.59 757.51 1003.15 242.49 1003.15ZM207.85 1023.15 792.15 1023.15 712.98 886.03 851.55 886.03 1000 1143.15 0 1143.15 148.45 886.03 287.02 886.03Z";

  // Le Valknut plein et le Valknut éclairé, dont le dégradé suit les jetons du mode
  document.body.insertAdjacentHTML("afterbegin", `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs><linearGradient id="vk-lumiere" x1="0" y1="0" x2=".35" y2="1">
        <stop offset="0" style="stop-color:var(--vk-haut);stop-opacity:var(--vk-haut-o)"/>
        <stop offset=".45" style="stop-color:var(--vk-milieu);stop-opacity:var(--vk-milieu-o)"/>
        <stop offset="1" style="stop-color:var(--vk-bas);stop-opacity:var(--vk-bas-o)"/>
      </linearGradient></defs>
      <symbol id="valknut" viewBox="0 0 1240 1143.15"><path fill="currentColor" d="${D}"/></symbol>
      <symbol id="valknut-lumiere" viewBox="0 0 1240 1143.15"><path fill="url(#vk-lumiere)" d="${D}"/></symbol>
    </svg>`);

  const q = new URLSearchParams(location.search);
  const d = q.get("donnees") ? JSON.parse(q.get("donnees")) : {};
  for (const [k, v] of q) if (k !== "donnees") d[k] = v;

  if (d.mode) document.documentElement.dataset.mode = d.mode;

  const balise = s => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/\*(.+?)\*/g, '<span class="fort">$1</span>')
    .replace(/\|/g, "<br>");

  const remplir = (el, v) => {
    if (v === "") el.remove();
    else if (v != null) el.innerHTML = balise(v);
  };

  document.querySelectorAll("[data-champ]").forEach(el => remplir(el, d[el.dataset.champ]));

  // La photo : un nom court (« sourire » → ../thomas-sourire.webp) ou un chemin.
  // photo_x : où tombe le centre de la photo, en % de la largeur ; photo_taille : sa hauteur, en % du cadre.
  const ph = document.querySelector("[data-photo]");
  if (ph) {
    const p = d.photo ?? ph.dataset.photo;
    if (!p) ph.remove();
    else ph.src = /[./]/.test(p) ? p : `../thomas-${p}.webp`;
    if (d.photo_x) ph.style.left = `${d.photo_x}%`;
    if (d.photo_taille) ph.style.height = `${d.photo_taille}%`;
  }

  // Les listes : un <template data-liste="lignes"> sert de modèle à chaque élément
  document.querySelectorAll("template[data-liste]").forEach(t => {
    const liste = d[t.dataset.liste];
    if (!Array.isArray(liste)) return;
    const parent = t.parentElement;
    parent.querySelectorAll("[data-item]").forEach(e => e.remove());
    for (const item of liste) {
      const n = t.content.firstElementChild.cloneNode(true);
      if (item.ton) n.dataset.ton = item.ton;
      n.querySelectorAll("[data-cle]").forEach(e => {
        const v = item[e.dataset.cle];
        if (v == null || v === "") e.remove(); else e.innerHTML = balise(v);
      });
      parent.insertBefore(n, t);
    }
  });
})();

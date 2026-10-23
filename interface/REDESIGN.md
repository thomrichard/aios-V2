# REDESIGN.md - lui donner ton style

Cet OS a déjà été relooké de bout en bout plus d'une fois, sans toucher à une seule fonction. Même ossature, peau très différente. Voici comment.

## Où vit l'apparence

1. **Les tokens de la page d'accueil :** le bloc `:root` en haut de la balise `<style>` de `os.html` :
   ```css
   :root { --accent:#ff6b1a; --cream:#e8e2d2; --mute:#8d8775; --warm:#b9b19c; --bg:#050504; --panel:#0d0c09; }
   ```
   Accent, texte, texte atténué, fond, panneau. Change ces six-là, et l'essentiel de la page d'accueil suit.
2. **Le bloc THEME en JS de la page d'accueil,** juste au-dessus de `const ICS` dans `os.html`. Les dessins sur canvas (aiguilles de l'horloge, sprites en pixels, l'anneau) ne peuvent pas lire les variables CSS : ils prennent leurs couleurs ici :
   ```js
   const THEME = { accent:'#ff6b1a', cream:'#e8e2d2', mute:'#8d8775', warm:'#b9b19c' };
   ```
   Garde-le en phase avec les tokens CSS.
3. **Le skin du second cerveau :** l'objet `skin` dans `brain/index.html`. `layerColors` et `deptColors` remplacent les couleurs de `config/departments.json` ; `themes.dark.css` contient les couleurs des panneaux ; la coque autour, c'est `copy.css` ; les trois onglets, ce sont `views/views.css` et `views/usage-board.css`. Après avoir changé les couleurs des domaines ou des couches, appuie sur l'icône d'actualisation pour que le centre de l'orbe de la page d'accueil corresponde.
4. **Les retardataires :** quelques chaînes SVG intégrées gardent des couleurs fixes (le logo hexagonal, les icônes soleil et lune, quelques fondus). Cherche `#ff6b1a` dans les fichiers après un relooking.
5. **Polices :** Outfit et Doto sont livrées en fichiers locaux dans `assets/` (`@font-face` en haut de `os.html` et de `copy.css`). Change les fichiers et les noms pour changer la personnalité plus vite qu'avec n'importe quelle couleur.

## Le prompt de refonte (à coller à ton agent)

> Refais le design de mon Agentic OS dans une direction visuelle complètement nouvelle, sans changer AUCUNE fonctionnalité. La page d'accueil, c'est os.html ; l'apparence du second cerveau, c'est le skin dans brain/index.html, copy.css et les fichiers CSS de views/.
>
> D'abord, envisage en silence trois directions candidates qui n'ont rien en commun avec l'apparence actuelle, ni entre elles : une autre température de palette, une autre personnalité typographique, une autre texture (plate, verre, papier, terminal). Choisis la plus forte, puis engage-toi à fond.
>
> Règles : travaille d'abord sur les tokens de :root et le bloc THEME, puis sur le skin du second cerveau, puis sur les polices, puis sur les retardataires. Ne touche pas à la logique de mise en page, aux API, au comportement des widgets ni aux id. Chaque widget doit rester lisible à sa taille actuelle ; vérifie surtout le contraste du texte atténué. À la fin, ouvre l'OS dans un navigateur sans interface, regarde la console pour repérer les erreurs, fais une capture d'écran de la page d'accueil et de chaque onglet du second cerveau, et regarde les captures avant de dire que c'est fini. Puis dis-moi en une ligne la direction que tu as choisie.

Demande « trois options en captures d'écran d'abord » si tu veux choisir la direction toi-même.

## Les principes qui ont survécu à nos relookings

- **La direction compte plus que la décoration.** Une direction assumée (terminal, éditorial, botanique, brutaliste) se lit tout de suite ; un simple changement de palette se lit comme le même OS avec une autre chemise.
- **L'accent est un budget.** Une seule couleur d'accent, dépensée sur les quelques éléments qui comptent (la prochaine routine, la skill en cours, l'élément sélectionné). Mets-la partout, et le tableau de bord devient bruyant.
- **Le texte atténué porte le design.** L'OS, ce sont surtout des étiquettes. Si `--mute` manque de contraste sur `--bg`, tout a l'air cassé, aussi joli que soit l'accent.
- **La typo d'abord, la couleur ensuite.** La police d'affichage donne la personnalité ; les couleurs l'assaisonnent.
- **Garde l'ossature.** La grille de mise en page, l'habillage des widgets, l'anneau et le cerveau ont demandé de nombreux essais avant de sonner juste. Change le style, ne refais pas l'architecture, et tu continues de profiter des améliorations de la version d'origine.

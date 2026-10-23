---
name: surprise-me
description: Pour une création visuelle (page HTML, slide, composant, visuel) qui sort « propre mais banale » : change complètement d'approche, impose au moins trois techniques avancées, puis fait une boucle capture, critique, amélioration avant de montrer le résultat. Déclencheurs : « surprise-me », « surprends-moi », « ose quelque chose », « c'est trop banal », « sors des sentiers battus ».
---
# surprise-me

Le premier jet d'un modèle est le plus probable : propre, et déjà vu partout. Ici, tu sors de la réponse par défaut, et tu ne montres rien que tu n'aies d'abord regardé et critiqué toi-même.

## Étapes
1. **La cible et le cadre.** Ce qu'on crée, pour qui, sur quel support. Cherche la charte de l'utilisateur (un souvenir `reference_`, un guide de style dans son domaine) : ses couleurs et ses polices restent, c'est la forme qui ose.
2. **Change d'approche.** Écris en une ligne ce que tu aurais fait par défaut, puis choisis une tout autre direction : un concept, une composition, un mouvement. Annonce-la en une ligne.
3. **Au moins trois techniques avancées**, adaptées au support et nommées. Par exemple : une animation au défilement, une typographie travaillée (graisses variables, très grands contrastes de taille), une mise en page asymétrique ou en grille cassée, un SVG animé, une texture ou des dégradés, des micro-interactions.
4. **La boucle, deux tours au moins, quatre au plus :**
   - capture le rendu, sur ordinateur et sur mobile : l'outil navigateur de l'agent, ou `npx playwright screenshot --viewport-size=1280,800 file://<page.html> <capture.png>`, puis `--viewport-size=390,844` ;
   - critique ce que tu vois : la hiérarchie, la lisibilité et les contrastes, le respect de la charte, ce qui fait « encore IA », ce qui déborde ou casse ;
   - corrige, puis recommence.
   Les captures vont dans un dossier temporaire, jamais dans le workspace.
5. **Montre le résultat**, avec en 3 lignes au plus la direction prise, les techniques utilisées et ce que la boucle a corrigé. Propose : valider (`classer`), un tour de plus, ou `burst` pour comparer d'autres directions.

## Garde-fous
- Oser dans la forme, pas hors de la charte. Et lisible avant tout : contrastes suffisants ; les animations respectent `prefers-reduced-motion`.
- Pas de bibliothèque lourde sans raison ; une page reste autonome.
- Sans moyen de capture : critique à partir du code, et dis clairement que tu n'as pas vu le rendu. N'installe pas d'outil sans accord.
- Jamais dans une routine : le goût se valide avec l'utilisateur.

## Références
- D'après la skill `surprise-me` de Jay E | RoboNuggets (leçon j1, module F7) : son fichier n'est pas public, celle-ci est réécrite pour l'AIOS.

## Journal des changements
- 2026-10-23 · création · sortir du « propre mais banal », et ne montrer que ce qu'on a vu et critiqué

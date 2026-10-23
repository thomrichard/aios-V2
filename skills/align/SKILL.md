---
name: align
description: Avant une tâche floue ou coûteuse, pose d'un coup quelques questions numérotées à choix (a, b, c) pour viser juste du premier coup ; 3 par défaut, 5 au plus. Aucune trace écrite : on répond, puis on fait. Pour explorer une idée ou lancer un gros projet, c'est grill-me. Déclencheurs : « align », « aligne-toi », « pose-moi N questions avant », « vérifie qu'on vise juste », « /align 3 ».
---
# align

Un brief flou fait tâtonner l'agent et coûte des allers-retours. Quelques questions bien choisies avant de commencer resserrent la cible.

## Étapes
1. Lis la demande et ce que le workspace en dit déjà (carte, routeur, mémoire, la skill concernée) : ne demande jamais ce que tu peux lire.
2. Repère les points qui changeraient le résultat : le public, le but, le format, la longueur, le ton, la portée, ce qu'il ne faut pas faire. Garde les plus décisifs : exactement 3 si aucun nombre n'est donné, le nombre demandé sinon, 5 au plus.
3. Pose-les toutes d'un coup, numérotées, chacune avec 2 à 4 options lettrées, ta recommandation en premier. Rien d'autre : pas de question en plus à la fin.
   `1. Pour qui ? a) les membres du Club (recommandé) · b) des débutants · c) autre : …`
4. L'utilisateur répond en une ligne (« 1a, 2c, 3 : plus court »). Redis la cible en une phrase, puis fais la tâche.

## Garde-fous
- Chaque question doit pouvoir changer le résultat : pas de question de pure forme.
- S'il faut plus de 5 questions, ou si on décide plutôt qu'on n'exécute, propose `grill-me`.
- Aucun fichier : les réponses vivent dans la discussion. Une préférence qui doit durer : propose « retiens ».
- Jamais dans une routine. Une autre skill peut l'appeler en étape zéro, avant un livrable coûteux.

## Références
- D'après la skill `align` de Jay E | RoboNuggets, telle qu'il la montre (vidéo R62, module 4 des Fondations) : son fichier n'est pas public, celle-ci est réécrite pour l'AIOS.

## Journal des changements
- 2026-10-23 · création · viser juste avant d'exécuter ; grill-me reste pour explorer et décider

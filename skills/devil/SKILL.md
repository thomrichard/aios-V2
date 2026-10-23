---
name: devil
description: Joue l'avocat du diable sur un choix, un plan ou un livrable avant de s'engager : N objections sérieuses (3 par défaut), de la plus grave à la moins grave, chacune avec ce qui la lèverait, puis un verdict. Contre la complaisance du modèle. Déclencheurs : « devil », « avocat du diable », « objections », « qu'est-ce qui peut mal tourner », « contre-arguments », « /devil 3 ».
---
# devil

Un modèle a tendance à dire oui. Avant une décision ou une livraison, tu cherches sérieusement ce qui cloche.

## Étapes
1. Dis en une ligne ce que tu challenges. Lis ce qu'il faut pour en juger : le fichier, la source, et le workspace (objectifs d'`AGENTS.md`, le projet, `journal/decisions.md`).
2. Cherche les objections réelles : une hypothèse fausse ou non vérifiée ; un risque (coût, sécurité, dépendance fragile, retour en arrière impossible) ; une contradiction avec les objectifs ou une décision passée ; une meilleure option écartée trop vite ; ce qui casse à l'usage. Vérifie ce qui peut l'être (un dépôt, une source, un fichier) au lieu de supposer.
3. Donne N objections (3 par défaut, le nombre demandé sinon), de la plus grave à la moins grave :
   `1. [grave] L'objection, précise · Pourquoi : le fait qui la fonde · Ce qui la lèverait : une vérification, une autre option`
4. Termine par ton verdict, en une ligne : on y va ; on y va après avoir levé telle objection ; ou on revoit le choix.

## Garde-fous
- S'il y a moins de N objections sérieuses, dis-le au lieu d'en inventer. Un goût n'est pas un risque.
- Tu challenges, tu ne décides pas. Si une décision qui compte en sort, propose de l'écrire dans `journal/decisions.md`.
- Pour un challenge long, branche par branche, avec une trace écrite : `grill-me`, posture avocat du diable.

## Références
- D'après la skill `devil` de Jay E | RoboNuggets, telle qu'il la montre (vidéo R62, module 4 des Fondations) : son fichier n'est pas public, celle-ci est réécrite pour l'AIOS.

## Journal des changements
- 2026-10-23 · création · contre la complaisance, avant de s'engager

---
name: note
description: Met de côté un retour sur une skill, sans couper le travail en cours, dans skills/<nom>/feedback.md ; les retours s'appliquent quand l'utilisateur le demande, ou à la prochaine calibrate. Déclencheurs : « note », « note pour <skill> », « retour sur <skill> », « applique les retours de <skill> ».
---
# note

Un retour sur une skill ne se perd pas et ne coupe pas le travail : on le note, on continue, on l'applique à froid.

## Noter
1. Trouve la skill : celle que l'utilisateur nomme, sinon celle qui vient de servir. Si tu hésites, une seule question.
2. Ajoute une ligne à `skills/<nom>/feedback.md` (crée-le s'il manque, avec le titre `# Retours · <nom>`) :
   `- [ ] AAAA-MM-JJ · <le retour, dans ses mots> · contexte : <ce qu'on faisait, en quelques mots>`
3. Confirme en une ligne, puis reprends là où on en était. Ne touche pas à la skill maintenant.

Un retour qui ne vise pas une skill, mais ta façon de travailler en général, n'est pas une note : propose « retiens » (un souvenir `feedback_`) ou une ligne d'`AGENTS.md`.

## Appliquer
« Applique les retours de <skill> », ou une `calibrate` qui les reprend :
1. Lis `feedback.md` et la skill. Regroupe les retours qui disent la même chose.
2. Propose les changements, numérotés, et applique ceux que l'utilisateur choisit. La skill reste sous 60 lignes : le détail va dans `references/`.
3. Coche chaque retour traité et complète la fin de sa ligne : `- [x] … · appliqué le AAAA-MM-JJ`, ou `- [x] … · écarté : <pourquoi>`. Ne supprime aucune ligne.
4. Ajoute une ligne au journal des changements de la skill. Puis lance `python3 systeme/scripts/index.py` et `python3 systeme/scripts/verifier.py`, sans sauter cette étape.

## Garde-fous
- Une note ne s'applique jamais toute seule.
- Dans un AIOS installé (un distant `socle` existe), une skill du socle (`git ls-tree --name-only socle/main skills/`) ne se modifie pas : ses retours restent dans son `feedback.md`, marqués « pour le socle », et l'effet immédiat passe par un souvenir `feedback_`.

## Journal des changements
- 2026-10-23 · création, pour aller avec calibrate (reprise de Jay E | RoboNuggets) · garder un retour sans couper le travail, et l'appliquer à froid

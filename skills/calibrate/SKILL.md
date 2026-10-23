---
name: calibrate
description: En fin de session, relit la discussion, repère les corrections, les préférences et ce qui a manqué, puis propose au plus 7 changements précis (skills, règles d'AGENTS.md, mémoire, réglages) ; l'utilisateur choisit lesquels appliquer. Reprend aussi les retours mis de côté par note. Déclencheurs : « calibrate », « calibre », « calibre léger », « qu'est-ce qu'on a appris », « mets à jour tes skills », « fais le point de la session ».
---
# calibrate

Une correction ne doit pas revenir : chaque session rend l'agent un peu plus juste. Tu proposes, l'utilisateur choisit, tu appliques.

## Étapes
1. **Relis la session.** Cherche les corrections (« non », « pas ça », « je voulais dire »), les préférences révélées (format, ton, façon de faire), les étapes oubliées qu'une skill devrait porter, ce qui revient plus d'une fois (une correction répétée est un problème de fond), et ce qui a marché sans retouche. Lis aussi les retours en attente (`- [ ]`) des `skills/*/feedback.md`.
2. **Trouve où va chaque correction :**
   - la façon de faire une tâche → la skill (`skills/<nom>/SKILL.md`, ou ses `references/`) ;
   - le comportement général → une ligne d'`AGENTS.md` ;
   - une préférence ou un fait qui doit durer → `memory/` (`user_`, `feedback_`, `reference_`), et sa ligne dans `memory/MEMORY.md` ;
   - un domaine, un type, un statut, un chemin → `systeme/metadonnees.md`, section « Ce workspace » ; le modèle d'une skill → `systeme/modeles.md` ; une routine → `systeme/routines.md` ;
   - une suite de skills qui revient → un process (`processus/`) ; une route qui a manqué → le routeur du domaine.
3. **Propose une liste numérotée, 7 lignes au plus**, les corrections répétées d'abord :
   `1. [SKILL classer] ce qu'on change, précisément · Pourquoi : ce qui s'est passé dans la session, en une phrase`
   Rien de générique, rien que la session ne prouve. Une session sans correction : « Rien à calibrer. »
4. **Attends le choix** (« 1 et 3 », « tout », « tout sauf 2 »), puis applique :
   - une skill : relis-la après coup (60 lignes au plus) et ajoute une ligne à son journal des changements ; coche chaque retour de `feedback.md` traité et complète la fin de sa ligne : `- [x] … · appliqué le AAAA-MM-JJ` ;
   - `AGENTS.md` : une ligne, au bon endroit, et le pourquoi dans `journal/decisions.md` ;
   - la mémoire : un fichier, et sa ligne dans `MEMORY.md`.
5. Lance `python3 systeme/scripts/index.py`, puis `python3 systeme/scripts/verifier.py`. Donne chaque fichier modifié en une ligne, puis ajoute `- AAAA-MM-JJ · calibrate | <n> changements` à `journal/log.md`.

## Calibrage léger
« Calibre léger » : 3 propositions au plus, seulement les corrections répétées. Pour une session courte, ou quand le contexte est presque plein.

## Garde-fous
- Ne propose rien qui existe déjà : vérifie d'abord la skill, `AGENTS.md` et la mémoire.
- Pas de correctif pour un cas isolé, pas de « bonne pratique » sans preuve dans la session.
- Dans un AIOS installé (un distant `socle` existe), ne modifie ni une skill du socle (`git ls-tree --name-only socle/main skills/`) ni la base des réglages : le retour reste dans `skills/<nom>/feedback.md`, marqué « pour le socle », et l'effet immédiat passe par un souvenir `feedback_`.
- Jamais dans une routine : il faut l'utilisateur pour choisir.

## Références
- Reprise de la skill `calibrate` de Jay E | RoboNuggets (github.com/robonuggets/calibrate, licence MIT : `LICENSE`), traduite et adaptée à l'AIOS.

## Journal des changements
- 2026-10-23 · reprise de calibrate de Jay E | RoboNuggets : traduite, cibles de l'AIOS, retours de note, règle du socle, calibrage léger · qu'une correction ne revienne pas

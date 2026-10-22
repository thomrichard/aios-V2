---
name: installation
description: Installe et personnalise l'AIOS. Pose les questions imposées une à une, remplit AGENTS.md (identité, objectifs, domaines), crée les routeurs, puis vérifie le workspace. À lancer une fois après le clonage, ou pour refaire la personnalisation. Déclencheurs : « installe l'AIOS », « installation », « personnalise mon AIOS ».
---
# installation

## Avant les questions
1. Lis `README.md` et `AGENTS.md`.
2. Vérifie les liens `.claude/skills` et `.agents/skills` ; s'ils manquent, lance `systeme/scripts/liens.sh`.
3. Si `.env` manque, copie `.env.example` en `.env`.

## Les questions
- Elles sont dans `references/questions.md`. Pose-les une à la fois, dans l'ordre, sans en sauter.
- Reformule chaque réponse en une ligne et fais-la valider avant de l'écrire.
- Écris la réponse là où elle fait foi (colonne « Où l'écrire »), tout de suite : une interruption ne perd rien.
- Une réponse « je ne sais pas » s'écrit « À définir » ; elle reviendra dans le point du jour.
- Si une section est déjà remplie, montre-la et demande s'il faut la garder.

## Après les questions
1. Un routeur par domaine (gabarit `systeme/gabarits/routeur.md`) et un dossier `domaines/<domaine>/`.
2. Les domaines d'exemple non retenus partent dans `archives/` : on ne supprime rien.
3. Un fichier par projet en cours (gabarit `systeme/gabarits/projet.md`), et sa ligne dans les projets actifs de `AGENTS.md`.
4. Lance `systeme/scripts/index.py`, puis `systeme/scripts/verifier.py`, jusqu'à « Tout est en ordre ».
5. Active le contrôle avant chaque commit : `git config core.hooksPath systeme/hooks`.
6. Rappelle de laisser vide le `CLAUDE.md` global de la machine.
7. Termine par un résumé : ce qui est rempli, ce qui reste « À définir ».

## Garde-fous
- Ne demande jamais une clé d'API dans le chat : indique de la coller dans `.env`.
- N'écris rien de personnel hors de `AGENTS.md` (Qui, Objectifs, carte, projets actifs), `memory/`, `routers/`, `projets/` et `domaines/`.
- Ne branche aucun outil et ne crée aucune routine pendant l'installation : note-les seulement.

## Journal des changements
- 2026-10-22 · création · questions imposées pour remplir AGENTS.md

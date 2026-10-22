---
name: installation
description: Installe et personnalise l'AIOS. Reprend le profil déposé dans inbox/ s'il existe, pose avec grill-me les questions imposées qui restent, remplit AGENTS.md (identité, objectifs, domaines), crée les routeurs, puis vérifie le workspace. À lancer une fois après le clonage, ou pour refaire la personnalisation. Déclencheurs : « installe l'AIOS », « installation », « personnalise mon AIOS ».
---
# installation

## Avant tout
1. Lis `README.md` et `AGENTS.md`.
2. Vérifie les liens `.claude/skills` et `.agents/skills` ; s'ils manquent, lance `systeme/scripts/liens.sh`.
3. Si `.env` manque, copie `.env.example` en `.env`.
4. Si le distant `origin` est encore le socle (l'adresse du `README.md`), renomme-le `socle` : on ne pousse jamais dans le socle.
5. Le profil : celui que l'utilisateur t'a donné (un chemin, une pièce jointe), que tu copies dans `inbox/` ; sinon un fichier de `inbox/` dont l'en-tête dit `type: profil` (gabarit : `references/profil.md`).

## Avec un profil
- Reprends chaque réponse là où elle fait foi (`references/questions.md`, colonne « Où l'écrire »). Montre ce que tu vas écrire, bloc par bloc, et fais valider.
- Lance `grill-me` seulement sur les questions sans réponse ou « À définir », avec la liste imposée.
- La section facultative « Décisions déjà prises » va dans `journal/decisions.md`.

## Sans profil
- Lance `grill-me` avec la liste imposée `references/questions.md` : chaque bloc devient une branche.
- À la fin de chaque bloc, écris les réponses confirmées là où elles font foi.
- En fin de session, `grill-me` remplit aussi le gabarit du profil, gardé dans `journal/entretiens/` : il permet de réinstaller.

## Après les réponses
1. Pour chaque domaine : un routeur (gabarit `systeme/gabarits/routeur.md`), un dossier `domaines/<domaine>/` et sa ligne dans la carte de `AGENTS.md`. Le domaine `operations` existe déjà.
2. Un fichier par projet en cours (gabarit `systeme/gabarits/projet.md`), et sa ligne dans les projets actifs de `AGENTS.md`.
3. Le profil part dans `archives/inbox/AAAA-MM/`.
4. Lance `systeme/scripts/index.py`, puis `systeme/scripts/verifier.py`, jusqu'à « Tout est en ordre ».
5. Active le contrôle avant chaque commit : `git config core.hooksPath systeme/hooks`.
6. Rappelle de laisser vide le `CLAUDE.md` global de la machine.
7. L'interface : si `node --version` donne 18 ou plus, lance `node interface/refresh/run.mjs` et indique `node interface/server.js` ; sinon, dis comment installer Node.
8. Termine par un résumé : ce qui est rempli, ce qui reste « À définir ».

## Garde-fous
- Si une section est déjà remplie, montre-la et demande s'il faut la garder.
- Une réponse « je ne sais pas » s'écrit « À définir » ; elle reviendra dans le point du jour.
- Ne demande jamais une clé d'API dans le chat : indique de la coller dans `.env`.
- N'écris rien de personnel hors de `AGENTS.md` (Qui, Objectifs, carte, projets actifs), `memory/`, `routers/`, `projets/`, `domaines/` et `journal/`.
- Ne branche aucun outil et ne crée aucune routine pendant l'installation : note-les seulement.

## Journal des changements
- 2026-10-22 · création · questions imposées pour remplir AGENTS.md
- 2026-10-22 · l'entretien passe par grill-me · une seule façon de poser des questions
- 2026-10-22 · reprise d'un profil déposé dans inbox/ · préparer avant un atelier, installer ensuite
- 2026-10-22 · profil donné avec l'adresse du socle, distant renommé `socle` · installer en une phrase
- 2026-10-22 · étape interface · le kit de Jay est dans le socle, branché sur le workspace

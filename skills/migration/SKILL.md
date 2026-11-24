---
name: migration
description: Reprend un ancien AIOS dans celui-ci, installé à côté. Lit l'ancien dossier sans y écrire, rend un inventaire (une ligne par élément : reprendre, adapter ou laisser), puis applique après accord, une couche à la fois : règles, mémoire, projets et domaines, skills, fichiers. À lancer après l'installation. Déclencheurs : « reprends mon ancien AIOS », « migre mon AIOS », « migration », « reprends la skill X de mon ancien AIOS ».
metadata:
  famille: systeme
---
# migration

L'ancien AIOS reste où il est, intact. On reprend ce qui sert ; le reste viendra le jour où on en a besoin.

## Avant tout
1. Il te faut le chemin de l'ancien dossier : demande-le s'il manque. S'il est ce workspace, ou s'il le contient, arrête-toi : on ne migre jamais sur place.
2. Ce workspace doit être installé : la section Qui d'`AGENTS.md` est remplie, et `python3 systeme/scripts/verifier.py` dit « Tout est en ordre ». Sinon, lance d'abord `installation`, avec l'ancien `CLAUDE.md` comme profil.
3. Une migration déjà commencée : relis `journal/entretiens/migration-*.md` et reprends à la première couche qui n'est pas « fait ». Cherche aussi le nom de l'ancien dossier dans `journal/regles.md`, `journal/log.md` et `projets/` : ce qui a déjà été repris à la main ne se reprend pas deux fois.

## 1. La correspondance
1. Lis l'ancien `CLAUDE.md` (ou `AGENTS.md`) et suis ses imports (`@fichier`) et ses renvois jusqu'au fichier qui porte vraiment les consignes. Lis l'arbre des dossiers sur deux niveaux, dossiers cachés compris, et compte les fichiers de chaque dossier avant d'en ouvrir un.
2. Une structure IPCRA (des dossiers numérotés Inbox, Projets, Casquettes, Ressources, Archives, et `.claude/doctrine.md`) : suis `references/correspondance.md`.
3. Une autre structure : écris ta propre correspondance, dossier par dossier, sur le modèle de cette table, et fais-la valider avant l'inventaire.

## 2. L'inventaire
1. Écris `journal/entretiens/migration-AA-MM.md`, avec le gabarit `references/inventaire.md` : une ligne par élément, ta proposition (reprendre, adapter, laisser), son pourquoi en quelques mots, et où il irait.
2. Un dossier de plus de 20 fichiers : une ligne par sous-dossier, pas par fichier ; s'il est à plat, une ligne par groupe de son index, ou par type. Un groupe dont une partie se reprend et l'autre non : deux lignes.
3. Montre l'inventaire, une couche après l'autre. L'utilisateur corrige tes propositions ; tu mets le tableau à jour. Rien n'est encore repris.

## 3. La reprise, une couche à la fois
Dans l'ordre : règles, mémoire, projets et domaines, skills, fichiers. Pour chaque couche :
1. Demande l'accord sur ses lignes.
2. Enregistre l'état du workspace (un commit, « Avant la migration : <couche> »), sans rien envoyer : la couche pourra se défaire.
3. Applique ses lignes, comme le dit sa partie de `references/correspondance.md`. Tu copies depuis l'ancien dossier, tu ne déplaces pas.
4. Lance `python3 systeme/scripts/index.py`, puis `verifier.py`, jusqu'à « Tout est en ordre ».
5. Montre ce que tu as écrit, et note « fait » et la date sur chaque ligne de l'inventaire.

L'utilisateur peut s'arrêter après n'importe quelle couche : ce qui est fait reste fait.

## 4. Après
1. Donne la liste de ce qui reste à faire à la main (partie « À faire toi-même » de l'inventaire) : les clés à recopier dans `.env`, les connecteurs à rebrancher, les anciennes routines à éteindre.
2. Dis-le : l'ancien dossier sert maintenant d'archive. On n'y travaille plus, on y retrouve un fichier.
3. Quand chaque ligne est « fait » ou « laissé », passe l'inventaire en `clos`.
4. Ajoute une ligne à `journal/log.md` : `- AAAA-MM-JJ · migration | <ancien dossier> : <couches faites>`.

## Un seul élément, plus tard
« Reprends la skill X de mon ancien AIOS », ou un dossier, ou une note : pas de nouvel inventaire. Lis l'élément, applique la partie de sa couche dans `references/correspondance.md`, fais valider, vérifie, puis ajoute sa ligne à l'inventaire.

## Garde-fous
- L'ancien dossier est en lecture seule : n'y écris rien, n'y déplace rien, n'y supprime rien, n'y lance ni script ni commande Git.
- Rien sans accord : une couche ne s'applique qu'après le oui de l'utilisateur sur ses lignes.
- Jamais de clé : n'ouvre ni `.env`, ni un fichier de réglages (`settings.json`, `settings.local.json`, `.mcp.json`), ni une note dont le nom parle d'accès, de mot de passe, de code de secours, de banque ou de papiers d'identité. Elle va dans « À faire toi-même », sans être lue.
- Pas de doublon : une skill ou une règle que ce workspace a déjà est laissée, et l'inventaire dit ce qui la remplace. Compare ce qu'elles font, pas leur nom : deux skills du même nom qui font autre chose, propose un autre nom.
- N'invente rien : ce que l'ancien ne dit pas s'écrit « À définir », ou devient une question ouverte de l'inventaire, avec ta proposition.
- Ne modifie pas une skill du socle pour y faire entrer une ancienne : une skill reprise a son propre dossier.
- Ne branche aucun outil et n'allume aucune routine : note-le seulement.

## Références
- `references/correspondance.md` : la structure IPCRA, et ce que devient chaque élément, couche par couche
- `references/inventaire.md` : le gabarit de l'inventaire

## Journal des changements
- 2026-11-24 · création · beaucoup d'utilisateurs ont déjà un AIOS rangé autrement, et l'installation n'en reprenait que le profil
- 2026-11-24 · après le premier essai sur un vrai vault : suivre les imports du `CLAUDE.md`, les dossiers à plat, les notes sensibles jamais ouvertes, aucune commande Git dans l'ancien dossier, ce qui a déjà été repris à la main · 24 remarques de l'essai

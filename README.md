# AIOS v2

Un workspace agentique portable : les mêmes fichiers servent Claude Code, Codex et Gemini CLI.
Seule la commande qui lance l'agent change.

Pour comprendre ce qu'est AIOS, comment il marche et pourquoi il est fait ainsi : [AIOS v2, expliqué](docs/presentation.md).

## Installer en une phrase

Dans Claude Code (ou un autre agent qui a accès à tes fichiers), donne l'adresse du socle et ton profil :

> Installe-moi l'AIOS : https://github.com/thomrichard/aios-V2. Mon profil est ici : <chemin du fichier>. Installe-le dans <dossier>.

L'agent fait tout : il récupère le socle, dépose ton profil dans `inbox/` et lance l'installation. Sans profil, il te pose les questions.

### Pour l'agent qui installe

1. Clone le socle dans le dossier choisi par l'utilisateur (par défaut `~/aios`).
2. Renomme le distant `origin` en `socle` : on ne pousse jamais dans le socle, et `git pull socle main` récupérera plus tard ses mises à jour.
3. Copie le profil de l'utilisateur dans `inbox/`, s'il en a donné un.
4. Lis `skills/installation/SKILL.md` et suis-le.

## Ce que tu touches

- `inbox/` : tu y déposes tout (fichiers, liens, notes, dictées). Elle est vidée chaque nuit à 2 h : chaque élément reçoit ses métadonnées et se range tout seul.
- `outbox/` : tu y lis le point du jour (`outbox/points/`), les questions qui attendent ta réponse (`outbox/questions.md`) et la page `outbox/index.html`, qui montre tout ce qui est sorti, tes process et tes skills.

Le reste est rangé pour l'IA. Tu n'as jamais besoin de l'ouvrir.

## L'interface

`interface/` contient SM4RT, l'interface tirée de l'Agentic OS v2 de Jay E | RoboNuggets (licence MIT), déjà branchée sur le workspace : page d'accueil, second cerveau en 3D, vues Routines, Skills et Applications. Il faut Node.js 18 ou plus.

1. `node interface/refresh/run.mjs` construit la carte du workspace.
2. `python3 systeme/scripts/interface.py installer` la garde allumée en permanence : elle démarre avec ta session et redémarre seule. Ouvre `http://localhost:50000`. Pour la lancer une seule fois : `node interface/server.js`.

Le reste (skills deck, agenda, e-mails, stats) se branche avec les guides de `interface/`. Nos changements au kit sont dans `interface/MODIFS.md`.

## Comment l'IA s'y retrouve

1. `AGENTS.md` est la seule source : règles, carte des domaines, projets actifs. `CLAUDE.md` ne fait que l'importer ; `.gemini/settings.json` le désigne à Gemini CLI. La carte, elle, est recopiée depuis `systeme/metadonnees.md`, où se règlent les domaines : changer un domaine là-bas met à jour tous les agents. Les projets actifs sont recopiés depuis l'en-tête des fichiers de `projets/`.
2. Chaque domaine a un routeur court dans `routers/`.
3. Chaque dossier a un `_index.md`, généré depuis l'en-tête de chaque fichier ; chaque dossier d'images a son `_images.md`. Les champs, les types et les statuts permis dans un en-tête sont dans `systeme/metadonnees.md`, et nulle part ailleurs.
4. La mémoire vit dans `memory/`, une ligne par souvenir dans `memory/MEMORY.md`.
5. Les skills existent une seule fois, dans `skills/` ; `.claude/skills` et `.agents/skills` sont des liens.
6. Chaque process (une suite de skills, avec ce qu'on décide à chaque étape) a son fichier dans `processus/`.

## Le parcours

1. **Préparer son profil.** Avec la skill `grill-me` et la liste `skills/installation/references/questions.md`, on répond aux questions imposées. On obtient un profil, sur le gabarit `skills/installation/references/profil.md`. C'est l'étape à faire avant un atelier ; sans dépôt sous la main, on peut donner ces trois fichiers à n'importe quel Claude.
2. **Installer en une phrase.** On donne à son agent l'adresse du socle et son profil (voir plus haut). L'installation reprend le profil, ne pose que les questions restantes, et range chaque réponse à sa place.

## L'installation à la main

1. Clone le dépôt, renomme le distant `origin` en `socle`, et ouvre le dossier dans ton agent.
2. Vérifie les liens vers `skills/`. S'ils manquent :
   - Mac / Linux : `sh systeme/scripts/liens.sh`
   - Windows (jonction, sans droits admin) : `mklink /J .claude\skills skills` puis `mklink /J .agents\skills skills`
3. Copie `.env.example` en `.env` et choisis ton agent : `AGENT=claude`, `codex` ou `gemini`. Si tu gardes des vidéos ou des sons, règle `FICHIERS_LOURDS` sur un dossier hors du dépôt (un dossier Google Drive synchronisé, par exemple).
4. Active le contrôle avant chaque commit : `git config core.hooksPath systeme/hooks`
5. Dépose ton profil dans `inbox/` si tu en as un, puis lance la skill `installation` (« installe l'AIOS »). Sans profil, elle pose toutes les questions.
6. Laisse vide le `CLAUDE.md` global de ta machine : tout vit dans le workspace.
7. Branche le planificateur sur `systeme/scripts/lancer.py` (voir `systeme/routines.md`).

## Les scripts

| Script | Rôle |
|---|---|
| `systeme/scripts/index.py` | Génère les `_index.md` depuis les en-têtes, `outbox/index.html`, et dans `AGENTS.md` la carte des domaines (depuis `systeme/metadonnees.md`) et les projets actifs (depuis `projets/`) |
| `systeme/scripts/verifier.py` | Contrôle la source unique, les liens vers `skills/`, les index d'images, la mémoire, les en-têtes (d'après `systeme/metadonnees.md`) et les plafonds de taille |
| `systeme/scripts/ranger.py <fichier>` | Range un fichier à la place que lui donne son en-tête (colonne « Chemin » de `systeme/metadonnees.md`) ; envoie vidéos et sons dans le dossier des fichiers lourds |
| `systeme/scripts/lancer.py <skill>` | Lance une skill sans discussion, avec l'agent de `.env` et le modèle de `systeme/modeles.md` |
| `systeme/scripts/liens.sh` | Crée `.claude/skills` et `.agents/skills` |
| `systeme/scripts/interface.py installer` | Garde l'interface allumée en permanence (macOS, Linux) ; `etat`, `retirer` |

Les scripts n'utilisent que Python 3, sans dépendance.

## À vérifier selon les versions

- Claude Code lit-il `AGENTS.md` sans import ? L'import `@AGENTS.md` marche dans tous les cas.
- Le support des skills (`SKILL.md`) dans Gemini CLI.
- L'emplacement des skills pour Codex (`.agents/skills`).

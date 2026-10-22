# AIOS v2

Un workspace agentique portable : les mêmes fichiers servent Claude Code, Codex et Gemini CLI.
Seule la commande qui lance l'agent change.

## Ce que tu touches

- `inbox/` : tu y déposes tout (fichiers, liens, notes, dictées). Elle est vidée chaque nuit à 2 h.
- `outbox/` : tu y lis le point du jour (`outbox/points/`) et la page `outbox/index.html`, qui montre tout ce qui est sorti.

Le reste est rangé pour l'IA. Tu n'as jamais besoin de l'ouvrir.

## Comment l'IA s'y retrouve

1. `AGENTS.md` est la seule source : règles, carte des domaines, projets actifs. `CLAUDE.md` ne fait que l'importer ; `.gemini/settings.json` le désigne à Gemini CLI.
2. Chaque domaine a un routeur court dans `routers/`.
3. Chaque dossier a un `_index.md`, généré depuis l'en-tête de chaque fichier ; chaque dossier d'images a son `_images.md`.
4. La mémoire vit dans `memory/`, une ligne par souvenir dans `memory/MEMORY.md`.
5. Les skills existent une seule fois, dans `skills/` ; `.claude/skills` et `.agents/skills` sont des liens.

## Installation (à donner à ton agent)

1. Clone le dépôt et ouvre-le dans ton agent.
2. Vérifie les liens vers `skills/`. S'ils manquent :
   - Mac / Linux : `sh systeme/scripts/liens.sh`
   - Windows (jonction, sans droits admin) : `mklink /J .claude\skills skills` puis `mklink /J .agents\skills skills`
3. Copie `.env.example` en `.env` et choisis ton agent : `AGENT=claude`, `codex` ou `gemini`.
4. Active le contrôle avant chaque commit : `git config core.hooksPath systeme/hooks`
5. Remplis la section « Qui » et la carte des domaines de `AGENTS.md`, puis un routeur par domaine dans `routers/` (gabarit : `systeme/gabarits/routeur.md`).
6. Lance `python3 systeme/scripts/index.py`, puis `python3 systeme/scripts/verifier.py`.
7. Branche le planificateur sur `systeme/scripts/lancer.py` (voir `systeme/routines.md`).

## Les scripts

| Script | Rôle |
|---|---|
| `systeme/scripts/index.py` | Génère les `_index.md` depuis les en-têtes, et `outbox/index.html` |
| `systeme/scripts/verifier.py` | Contrôle la source unique, les liens vers `skills/`, les index d'images, la mémoire et les plafonds de taille |
| `systeme/scripts/lancer.py <skill>` | Lance une skill sans discussion, avec l'agent de `.env` et le modèle de `systeme/modeles.md` |
| `systeme/scripts/liens.sh` | Crée `.claude/skills` et `.agents/skills` |

Les scripts n'utilisent que Python 3, sans dépendance.

## À vérifier selon les versions

- Claude Code lit-il `AGENTS.md` sans import ? L'import `@AGENTS.md` marche dans tous les cas.
- Le support des skills (`SKILL.md`) dans Gemini CLI.
- L'emplacement des skills pour Codex (`.agents/skills`).

# Modifications pour l'AIOS

Le kit RUBRIC Agentic OS v2 de Jay E | RoboNuggets (licence MIT, voir `LICENSE`), repris tel quel, avec trois changements :

1. `config/workspace.json` : branché sur le workspace qui contient ce dossier (`root: ".."`), avec ses dossiers `skills/`, `memory/` et `projets/`.
2. `config/departments.json` et `snapshots/routines.json` : générés par `systeme/scripts/index.py`, depuis la carte des domaines d'`AGENTS.md` et le tableau de `systeme/routines.md`. On ne les écrit pas à la main.
3. `refresh/brain.mjs` : un `README.md` ou un fichier qui commence par `_` dans `skills/` n'est plus pris pour une skill.

Pour reprendre une nouvelle version du kit : remplacer le dossier, puis refaire ces trois changements.

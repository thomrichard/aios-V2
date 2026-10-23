# Modifications pour l'AIOS

SM4RT est tiré de l'Agentic OS v2 de Jay E | RoboNuggets (licence MIT : sa ligne de copyright reste dans `LICENSE`). Voici ce qui change par rapport à son kit :

1. `config/workspace.json` : branché sur le workspace qui contient ce dossier (`root: ".."`), avec ses dossiers `skills/`, `memory/` et `projets/`.
2. `config/departments.json`, `snapshots/routines.json` et `config/apps.json` : générés par `systeme/scripts/index.py`, depuis les domaines de `systeme/metadonnees.md`, le tableau de `systeme/routines.md` et celui de `systeme/connexions.md`. On ne les écrit pas à la main.
3. `refresh/brain.mjs` : un `README.md` ou un fichier qui commence par `_` dans `skills/` n'est plus pris pour une skill.
4. Tout est en français : l'écran, les messages du serveur, les pages d'exemple et les guides. Les valeurs lues par le code (statuts, clés, modèles, efforts) restent en anglais. Dates en `fr-FR` et heures sur 24 h, là où c'est seulement de l'affichage.
5. La marque devient SM4RT : textes, titres, bannière (`assets/banner.png`), logo (`assets/sm4rt-hex.svg`), et noms internes (`SM4RT_TOKEN`, en-tête `x-sm4rt-token`, clés du navigateur `sm4rt-os…`, classes `b-sm4rt` et `hud-sm4rt`, groupe d'usage `sm4rt`).
6. La tuile Recos et les mentions de Recos et Carousels (deux autres applis de RoboNuggets) sont retirées. « Appliquer tous les commentaires » marche toujours pour toute page de relecture locale.
7. `server.js` : ouvrir le second cerveau reconstruit sa carte si elle a plus de 30 secondes (`freshBrain`). Sans ça, la carte reste figée jusqu'au clic sur l'icône d'actualisation, et ne montre pas ce que l'agent ou une routine vient d'écrire.
8. `refresh/brain.mjs` : le contenu des dossiers est préparé à tous les niveaux, plus seulement au premier. Sans ça, un dossier rangé dans un dossier replié (comme `domaines/contenu/videos`) s'ouvre vide et ses fichiers échappent à la recherche.
9. `copy.js` : entrer dans le second cerveau depuis la page d'accueil le recharge si ses données ont plus d'une minute. Sans ça, la page d'accueil, qui reste ouverte, garde le graphe du moment où on l'a ouverte.
10. `config/workspace.json` : `systeme/scripts/index.py` ajoute à `visibleRoots` chaque dossier de `domaines/`, à tous les niveaux. Ce qui est rangé dans un domaine s'affiche sur la carte sans clic.
11. `refresh/usage.mjs` : l'onglet Skills compte aussi les skills qui vivent hors de `skills/` (compte Claude, `~/.claude/skills`, plugins), d'après les journaux de session. Seules les commandes intégrées de Claude Code (`/compact`, `/doctor`…) restent de côté. Il liste aussi les skills de `~/.claude/skills`, même jamais lancées. Sans ça, l'onglet n'affiche que les skills du workspace, et l'usage des autres disparaît.
12. `refresh/usage.mjs` : le champ `mcp` d'une app accepte une liste de noms, que `systeme/scripts/index.py` tire de la colonne Commande de `systeme/connexions.md` (noms séparés par des virgules). Un même service branché deux fois (un serveur MCP local et un connecteur du compte Claude) tient sur une seule ligne de l'onglet Applications.

Pour reprendre une nouvelle version du kit : remplacer le dossier, puis refaire ces changements.

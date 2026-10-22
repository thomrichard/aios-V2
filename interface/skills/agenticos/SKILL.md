---
name: agenticos
description: Modifier, actualiser, vérifier et réparer le SM4RT Agentic OS v2 de l'utilisateur (la page d'accueil locale et son second cerveau, lancés avec node server.js). À utiliser quand l'utilisateur dit /agenticos, « l'OS », « ma page d'accueil », « le second cerveau », nomme un widget (micro-apps, agenda, stats, e-mails, routines, deck de skills, l'anneau, l'orbe), demande d'ajouter une app, une carte de skill, une routine ou un domaine, veut actualiser la carte, ou signale que quelque chose cloche sur l'OS.
---

# /agenticos - prendre soin de l'Agentic OS de l'utilisateur

L'OS vit dans le dossier `interface/` du workspace. Ses guides README, BRAIN, ROUTINES, USAGE, WIRING, OAUTH, RING et REDESIGN sont à la racine de ce dossier ; lis celui qui couvre la partie que tu modifies.

## Les pièces mobiles

| Partie | Où elle se trouve | Après un changement |
|---|---|---|
| Serveur (page d'accueil, flux, actions) | `server.js` + `os-config.json` (port, deck, lanceur, micro-apps, e-mails) | relance `node server.js` |
| Moteur du second cerveau (recherche, visionneuse de fichiers) | `engine/server.js` + `engine/scan.js`, lancés par `server.js` sur `brainPort` | redémarre l'OS |
| Où est le workspace | `config/workspace.json` | actualise (ou redémarre : l'OS reconstruit quand ce fichier change) |
| Domaines, apps, agents distants | `config/departments.json`, `config/apps.json`, `config/agents.json` | actualise |
| Routines | `snapshots/routines.json` plus les lecteurs de planificateurs d'agent dans `refresh/sources/` | page d'accueil en moins d'une minute ; onglets et carte à l'actualisation |
| Usage | `snapshots/usage-log.jsonl`, `data/app-opens.jsonl`, les lecteurs dans `refresh/sources/` | actualise |
| Flux des stats et de l'agenda | `snapshots/stats.json`, `snapshots/calendar.json`, `tools/google-calendar.js` | récupération suivante (2 minutes) |
| L'anneau | `artifacts/` (un `.html` plus un fichier compagnon `.json` par boule) | récupération suivante |
| La page d'accueil | `os.html` : un seul fichier modifiable | recharge la page |
| L'apparence du second cerveau | le `skin` dans `brain/index.html`, `copy.css`, `views/*.css` | recharge |

Fichiers générés : ne les modifie jamais à la main, car la prochaine actualisation les écrase. Ce sont `brain/snapshot.js`, `brain/snapshot-expansions.js`, `brain/_icons.js`, `brain/map-layouts.js`, `assets/home-orb-mini.js`, `data/snapshot.js`, `data/arms-usage.js` et tout le reste de `data/`.

## Ordre d'actualisation

`node refresh/run.mjs` lance, dans l'ordre :

1. `refresh/brain.mjs` : scanne le workspace, un nœud `/nom` par skill, les routines, les apps, des dates de modification fidèles, les icônes, les couleurs de l'orbe de la page d'accueil.
2. `refresh/usage.mjs` : exécutions, tokens et appels, depuis le journal d'usage, les ouvertures d'apps locales et tout lecteur de journaux d'agent.

L'icône d'actualisation (en haut à droite dans le second cerveau) lance les deux mêmes étapes, puis relance le scan du moteur. Aucun appel au modèle, dans les deux cas.

## Tâches courantes

- **Ajouter une tuile aux micro-apps :** ajoute `{ id, name, desc, url, fallbackUrl, icon }` à `"microApps"` dans `os-config.json`, redémarre. (WIRING.md, Micro-apps.)
- **Ajouter une carte au deck de skills :** ajoute `{ id, icon, model, effort, prompt }` à `"skills"`, redémarre. Le lanceur doit être réglé (`"runner.command"`, prompt sur l'entrée standard). Préfère les skills qui vont au bout sans poser de questions.
- **Ajouter ou modifier une routine :** modifie `snapshots/routines.json` (cron, ou days plus times). ROUTINES.md donne la forme.
- **Changer les domaines :** modifie `config/departments.json` (3 à 6, chaque fichier atterrit dans un domaine), puis actualise. Sers-toi de ce que tu sais de l'utilisateur ; ne pose 2 ou 3 questions que si tu as un doute.
- **Afficher plus ou moins de dossiers sur la carte :** modifie `visibleRoots` dans `config/workspace.json`, puis actualise.
- **Commencer à mesurer :** ajoute à tes instructions la ligne du journal d'usage de USAGE.md, ou écris un lecteur pour les journaux de ton agent dans `refresh/sources/`.
- **Changer de ports :** `"port"` / `"brainPort"` dans `os-config.json`, redémarre. Le port 50000 est celui où les pages de relecture cherchent « Appliquer tous les commentaires ».
- **Changer le style :** suis REDESIGN.md.

## La boucle de vérification (à chaque fois, avant de dire que c'est fini)

1. Redémarre l'OS si tu as modifié `os-config.json`, `server.js` ou quoi que ce soit dans `engine/`. Surveille le terminal : il dit quand le second cerveau est prêt.
2. Ouvre la page sans interface si tu peux (avec n'importe quel navigateur headless). Récupère les erreurs de la console, et vérifie qu'il n'y en a aucune.
3. Vérifie dans la page elle-même la chose précise que tu as changée : la tuile est là, la carte s'affiche, la routine apparaît dans l'onglet Routines, la couleur du domaine est sur le globe.
4. Fais une capture d'écran de cette partie et regarde-la. Les widgets coupent leur contenu sans prévenir : vérifier que tout tient, ça compte.
5. `GET /api/health` doit montrer `engine: true`, `workspaceSet: true` et l'état du lanceur.

## Réparer

| Symptôme | Cause probable | Correction |
|---|---|---|
| Le second cerveau est vide | `root` vide ou faux dans `config/workspace.json` | remplis-le, actualise |
| Des fichiers atterrissent dans le mauvais domaine | une règle de `config/departments.json` est mal formée ou a une clé inconnue | lis les lignes `Attention :` que le scan affiche, corrige la règle (BRAIN.md, étape 2), actualise |
| La recherche « ne répond pas » | le moteur scanne encore un gros workspace, ou `brainPort` est pris | attends, ou change `brainPort` et redémarre |
| Un fichier ne s'ouvre pas dans la visionneuse | binaire, plus de 500 Ko, hors du workspace, ou nom qui ressemble à un secret | c'est normal |
| Une carte du deck ou « Appliquer tous les commentaires » dit qu'il n'y a pas de lanceur | `"runner.command"` vide, ou utilise encore `{skill}` | mets le gabarit de la v2 (WIRING.md) |
| Une exécution échoue | la commande n'est pas dans le PATH, ou l'agent a besoin d'une connexion | lis le journal dans `os-runs/`, lance la commande une fois à la main |
| Les skills ou les routines affichent « non mesuré » | pas de journal d'usage ni de lecteur de journaux | USAGE.md |
| Un widget affiche « pas encore branché » | son fichier de flux ou son réglage manque | son guide (WIRING.md, OAUTH.md) |
| La disposition de la page d'accueil est bizarre après une mise à jour | le navigateur a gardé une ancienne disposition | Menu > Réinitialiser la disposition dans le second cerveau, ou efface le stockage de ce site |
| Port déjà utilisé au démarrage | un autre programme, ou la v1 sur 50000 | change `"port"`, ou arrête l'autre programme |

## Règles

- Ne change que ce que l'utilisateur a demandé. Garde chaque fonction, chaque id et chaque clé de stockage en état de marche.
- Ne colle jamais de secrets dans un fichier de l'OS. Les clés restent là où les outils de l'utilisateur les rangent.
- Ne fais jamais pointer le lanceur vers une commande qui saute les demandes de permission, sauf si l'utilisateur l'a choisi.
- L'OS ne fait aucun appel extérieur de lui-même ; garde-le comme ça, sauf si l'utilisateur le demande.

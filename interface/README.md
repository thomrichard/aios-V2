![SM4RT Agentic OS v2](assets/banner.png)

# SM4RT Agentic OS v2

Ta page d'accueil et ton second cerveau dans une seule page locale : des widgets en direct, un anneau de tout ce que ton agent a construit, et une carte 3D de tout ton workspace, avec ses routines, ses skills et ses apps. Ton agent l'installe et le tient à jour.

Créé par Jay E chez RoboNuggets. Licence : MIT (voir LICENSE).

## Démarrage rapide

1. Installe [Node.js](https://nodejs.org) 18 ou plus récent. Rien d'autre n'est nécessaire : l'OS n'a aucune dépendance.
2. Décompresse ce dossier où tu veux.
3. Donne ce README à ton agent et laisse-le faire l'installation ci-dessous. Il fait pointer l'OS vers ton workspace et construit ton second cerveau.
4. Lance-le avec `node server.js` dans le dossier. Cette seule commande démarre tout, moteur du second cerveau compris.
5. Ouvre `http://localhost:50000` (le port est `"port"` dans `os-config.json` ; 50200 si tu fais tourner la v1 à côté). Une courte visite guidée (7 étapes) se lance à ta première visite, et l'icône info la rejoue.

Les widgets que tu n'as pas encore connectés affichent une petite note discrète « pas encore branché ». C'est voulu : rien n'est cassé.

## Laisse ton agent l'installer (recommandé)

Ce kit est fait pour être installé par ton agent, quel qu'il soit. Dis-lui :

> Lis le README de ce kit. Sers-toi de ce que tu sais déjà de moi et de mon workspace, puis demande-moi seulement ce qui te manque : quel agent et quels planificateurs j'utilise, et quels e-mails, quel agenda et quels chiffres comptent pour moi. Recommande les parties à brancher en premier, puis installe tout étape par étape en suivant les guides.

### Pour l'agent : les étapes d'installation

Tu installes ce kit pour ton utilisateur, dans son workspace. Respecte ce que tu trouves : cartographie-le, ne le réorganise jamais. Suis ces étapes dans l'ordre.

1. **Vérifie Node.** `node --version` doit donner 18 ou plus. Sinon, explique à ton utilisateur comment l'installer et arrête-toi.
2. **Vérifie les ports avant le premier démarrage.** La v2 utilise le port 50000 par défaut : c'est là que les pages de relecture cherchent le lanceur d'« Appliquer tous les commentaires ». Regarde si quelque chose répond déjà sur `http://localhost:50000`. Si oui (en général une autre copie de l'OS), n'y touche pas : mets `"port": 50200` dans `os-config.json` pour que la v2 tourne à côté et que rien de ce qui existe ne bouge. Puis pose une seule question à ton utilisateur : la v2 doit-elle reprendre le port 50000 et recopier ses réglages, ses boules de l'anneau et ses cartes de skills ? Si oui, suis « Passer de la v1 à la v2 » plus bas. Si rien ne répond sur 50000, garde la valeur par défaut. Vérifie aussi que `"brainPort"` (50201 par défaut, le moteur du second cerveau) est libre, et choisis un autre port libre sinon.
3. **Fais pointer l'OS vers le workspace.** Remplis `config/workspace.json` : `root` (le chemin absolu du workspace principal de ton utilisateur), `routerDoc` (le fichier d'instructions que tu lis en premier, par exemple `AGENTS.md`), `instructionDocs` (tous les fichiers d'instructions toujours chargés, à la racine), `skillDirs`, `memoryDir`, `projectsDir`, `visibleRoots` et `sharedPrefixes`. L'étape 1 de [BRAIN.md](BRAIN.md) explique chaque champ.
4. **Écris les domaines.** Ce sont les tranches colorées du globe 3D. Sers-toi de ce que tu sais déjà de ton utilisateur et de son workspace pour écrire 3 à 6 domaines dans `config/departments.json`. Pose 2 ou 3 questions rapides seulement si tu ne sais pas. [BRAIN.md](BRAIN.md), étape 2.
5. **Liste les applications.** Seulement de vraies connexions (serveurs MCP, outils en ligne de commande qui parlent à un service, API avec des clés enregistrées), dans `config/apps.json`. [BRAIN.md](BRAIN.md), étape 3.
6. **Lecteurs d'agent.** `"readers": { "claudeCode": "auto" }` dans `os-config.json` veut dire : si les dossiers de Claude Code sont présents sur cet ordinateur, ses tâches planifiées et ses journaux de session sont lus (ROUTINES.md et USAGE.md donnent les dossiers exacts). Si ton utilisateur n'est pas sur Claude Code, ou ne veut pas que ses tâches et ses journaux de session soient lus, mets `false`.
7. **Routines.** Si ton agent est Claude Code (et que le lecteur est actif), ses tâches planifiées sont lues pour toi. Tout le reste qui tourne à heure fixe (cron, Planificateur de tâches, launchd, le planificateur d'un autre agent, un serveur) va dans `snapshots/routines.json`. Sers-toi de ce que tu sais des planificateurs de ton utilisateur pour le remplir. [ROUTINES.md](ROUTINES.md).
8. **Usage.** Si ton agent est Claude Code (et que le lecteur est actif), ses journaux de session sont lus pour compter les exécutions de skills, les exécutions de routines et les appels d'outils. Sinon, ajoute à tes instructions l'habitude du journal d'usage en une ligne, décrite dans [USAGE.md](USAGE.md). Les extraits d'instructions de ROUTINES.md, USAGE.md, WIRING.md et RING.md ont un emplacement `<chemin-de-ton-os>` : mets-y le chemin absolu de ce dossier. Tout ce que rien ne mesure affiche « non mesuré ».
9. **Construis le second cerveau, puis démarre.** Lance `node refresh/run.mjs` pour que la première ouverture montre déjà le workspace de ton utilisateur. Puis `node server.js`, ouvre la page, et vérifie-la avec un navigateur sans interface si tu peux : zéro erreur dans la console, l'orbe ouvre le second cerveau, et les six onglets affichent leurs fichiers.
10. **Propose le reste, une chose à la fois :** le lanceur du deck de skills ([WIRING.md](WIRING.md)), l'agenda et ses horloges mondiales ([OAUTH.md](OAUTH.md)), les e-mails et les stats ([WIRING.md](WIRING.md)), l'habitude de l'anneau des livrables ([RING.md](RING.md)), et un démarrage automatique adapté à sa machine (Planificateur de tâches, launchd, systemd, ou pm2 s'il l'utilise déjà ; aucun n'est obligatoire).
11. **Propose la skill `/agenticos`.** Demande d'abord à ton utilisateur. S'il dit oui, copie `skills/agenticos/` dans ton dossier de skills. Elle t'apprend à modifier, actualiser, vérifier et réparer cet OS plus tard. `SKILL.md` est le format de skills partagé que beaucoup d'agents lisent ; si ton agent n'a pas de dossier de skills, garde le fichier où tu veux et fais-y référence depuis ton fichier d'instructions.

## Les guides

| Partie | Guide | Ce que fait ton agent |
|---|---|---|
| Second cerveau | [BRAIN.md](BRAIN.md) | Fait pointer la carte vers ton workspace : domaines, apps, skills, recherche, la visionneuse de fichiers |
| Routines | [ROUTINES.md](ROUTINES.md) | Liste tout ce qui tourne à heure fixe, pour le widget de la page d'accueil et l'onglet Routines |
| Usage | [USAGE.md](USAGE.md) | Mesure les exécutions de skills, les exécutions de routines et l'usage des apps (ou affiche « non mesuré ») |
| Deck de skills, e-mails, stats, micro-apps | [WIRING.md](WIRING.md) | Branche le lanceur, ta boîte mail, tous tes chiffres, tes propres apps locales |
| Agenda | [OAUTH.md](OAUTH.md) | Une connexion Google, une seule fois, puis les événements en direct |
| Anneau des livrables | [RING.md](RING.md) | Apprend à ton agent à mettre chacune de ses créations sur l'anneau |
| Apparence | [REDESIGN.md](REDESIGN.md) | Change le style de tout l'OS depuis un seul bloc de tokens |

## Au quotidien

- **Démarrer :** `node server.js`. Il lance le moteur du second cerveau à côté. Arrête les deux avec Ctrl+C.
- **L'orbe :** clique en son centre pour zoomer dans ton second cerveau. Là, appuie sur `/` pour rechercher n'importe quel fichier par son nom, et sur Retour (ou Échap) pour revenir à l'accueil.
- **Les six onglets :** Orbes 3D, Carte 2D, Frise, Routines, Skills et Applications.
- **L'icône d'actualisation** (en haut à droite dans le second cerveau) reconstruit la carte, les skills, les routines, les apps et l'usage. Aucun appel au modèle. `node refresh/run.mjs` fait la même chose depuis un terminal.
- **L'anneau :** chaque page HTML de `artifacts/` est une boule. Survole la boule orange pour voir tous les noms, appuie sur `/` pour rechercher, fais un clic droit sur une boule pour OUVRIR ou RETIRER (les boules retirées vont dans `artifacts/_trash`).
- **Micro-apps :** chaque tuile ouvre son app si elle tourne sur cet ordinateur, sinon sa page. « Ajouter » donne à ton agent un prompt prêt à l'emploi pour ajouter tes propres apps.
- **Ports :** `"port"` et `"brainPort"` dans `os-config.json` (50000 et 50201 par défaut). Si le port est pris, le serveur s'arrête avec un message d'une ligne au lieu de changer de port : modifie `"port"` et relance.

## Passer de la v1 à la v2

La v2 est un dossier à part. Ton dossier v1 continue de marcher sur le port 50000 tant que tu n'en décides pas autrement.

- **Faire tourner les deux :** mets `"port": 50200` dans le `os-config.json` de la v2 (les étapes d'installation le font quand quelque chose répond sur 50000).
- **Laisser la v2 reprendre le port 50000 :** arrête la v1, mets `"port": 50000` dans le `os-config.json` de la v2, puis recopie ce que tu veux garder :
  - tes cartes de skills, tes modèles, tes efforts et tes indices de tri des e-mails, depuis le `os-config.json` de la v1 ;
  - ton anneau : les fichiers du dossier `artifacts/` de la v1 (ou fais pointer `"artifactsDir"` vers l'ancien dossier) ;
  - tes flux : `snapshots/stats.json` et `snapshots/calendar.json`, plus `.google-creds.json` et `.google-calendar-token.json` si tu as installé l'agenda ;
  - tes routines : le `snapshots/routines.json` de la v1 marche tel quel (les deux formes de lignes sont lues).
- **Le lanceur.** Ton `runner.command` de la v1 (avec `"/{skill}"`) marche toujours pour les cartes du deck. « Appliquer tous les commentaires » a besoin d'un gabarit qui lit le prompt sur l'entrée standard ou qui prend `{prompt}` (WIRING.md montre les trois formes).
- **Les e-mails sont coupés par défaut dans la v2.** Mets `"email": { "enabled": true }` si tu les avais branchés.
- Ton navigateur garde la disposition de la v1 sous l'ancienne adresse. La v2 démarre avec sa propre disposition : remets les widgets où tu veux en les faisant glisser.

## Plan des dossiers

```
interface/
  server.js            le serveur de l'OS (node, zéro dépendance) ; lance aussi le moteur
  os-config.json       ports, deck de skills, lanceur, micro-apps, e-mails
  index.html           la coque : page d'accueil + second cerveau
  os.html              la page d'accueil (un seul fichier modifiable)
  copy.js, copy.css, shell-extras.js, view-transitions.js   le code de la coque
  widgets.html         la bibliothèque de widgets (/widgets)
  assets/              polices, l'orbe, scripts partagés
  brain/               les orbes 3D, la carte 2D et la frise du second cerveau (+ leurs données, construites par refresh)
  views/               les onglets Routines, Skills et Applications
  engine/              le moteur du second cerveau : scan.js (la carte), server.js (recherche, visionneuse de fichiers), brain.js (rappel et classement)
  refresh/             construit les données du second cerveau ; sources/ contient les lecteurs par agent
  config/              workspace.json, departments.json, apps.json, agents.json (à toi de les modifier)
  snapshots/           les flux que ton agent écrit : routines.json, usage-log.jsonl, stats.json, calendar.json
  data/                ce que l'OS écrit : données des pages, ouvertures d'apps, liste des exécutions, caches
  artifacts/           chaque HTML ici est une boule de l'anneau
  os-runs/             journaux des exécutions sans interface (créé à la première exécution)
  tools/               google-calendar.js (OAUTH.md)
  skills/agenticos/    la skill /agenticos pour ton agent
```

## Modèle de sécurité

Chaque phrase ici est vraie pour le code livré.

- Les deux serveurs (l'OS et le moteur du second cerveau) n'écoutent que sur 127.0.0.1 : rien sur ton réseau ne peut les joindre.
- Les deux refusent toute requête dont l'en-tête Host n'est pas `localhost` ou `127.0.0.1`, ce qui bloque les pages de DNS rebinding.
- Pas d'en-têtes CORS, avec une seule exception, très limitée. `/api/apply-comments` et `/api/run-status` renvoient l'Origin de la requête seulement quand c'est `http(s)://localhost` ou `http(s)://127.0.0.1` sur n'importe quel port (ou `null`, si tu as activé `"allowNullOrigin"`), pour que les pages de relecture de tes autres apps locales puissent lire la réponse. Aucune autre route et aucune autre origine ne reçoit jamais d'en-tête CORS, et aucun preflight n'est jamais accordé.
- Toute action (POST) doit venir d'une page de cet ordinateur : Origin `localhost` ou `127.0.0.1` sur n'importe quel port, ou pas d'Origin du tout (un outil hors navigateur). Tout le reste reçoit une erreur 403, y compris l'Origin `null`, car une page ouverte comme fichier l'envoie, tout comme un cadre isolé (sandbox) sur n'importe quel site. Seulement si tu as besoin d'« Appliquer tous les commentaires » depuis des pages ouvertes comme fichiers, mets `"allowNullOrigin": true` dans `os-config.json` ; les pages servies sur localhost n'en ont pas besoin.
- Les actions JSON (`/api/run`, `/api/open`, `/api/app-open`, `/api/artifact-remove`) exigent aussi `Content-Type: application/json`, qu'un autre site ne peut pas envoyer sans preflight.
- Les corps de requête de plus de 1 Mo sont refusés. Il n'y a pas de WebSockets.
- Secret partagé, en option : lance l'OS avec la variable d'environnement `SM4RT_TOKEN` définie, et chaque requête `/api/*` et `/local/*` exige alors un en-tête `x-sm4rt-token` qui correspond. Les pages de l'OS le reçoivent par une balise meta. Les pages de tes autres apps locales ne l'envoient pas : « Appliquer tous les commentaires » ne marche donc plus depuis elles tant que le token est actif.
- Seuls les fichiers des pages sont servis : `index.html`, `os.html`, les scripts de la coque, `assets/`, `brain/`, `views/`, `widgets.html` et deux fichiers de données des pages. `config/`, `snapshots/`, `engine/`, `refresh/`, `os-runs/`, `os-config.json` et le reste de `data/` ne sont jamais servis. Chaque chemin de fichier est résolu et doit rester dans son dossier.
- La visionneuse de fichiers ne lit que des fichiers texte situés dans la racine de ton workspace, de moins de 500 Ko, et jamais un fichier dont le nom ressemble à un secret (`.env`, clés, tokens, identifiants).
- Les noms, titres, notes et descriptions de tes flux sont échappés avant d'arriver sur la page. Le glyphe d'une boule, tiré de son fichier compagnon, est filtré pour ne garder que des formes simples.
- Exécutions : le deck de skills et « Appliquer tous les commentaires » lancent le gabarit de commande que tu mets dans `"runner.command"`. Il est vide à la livraison : rien ne s'exécute tant que tu ne l'as pas rempli. Le prompt est passé à la commande sur l'entrée standard, depuis un fichier de `os-runs/`, ou, si ton gabarit utilise `{prompt}` ou `{skill}`, sous forme d'une courte ligne sur la ligne de commande, qui ne peut contenir que des lettres, des chiffres, des espaces et `_ . / \ : , ( ) -` (« Appliquer tous les commentaires » ne passe alors qu'un pointeur vers son fichier de prompt). Le modèle et l'effort doivent figurer dans la liste autorisée et ne contenir que des lettres, des chiffres, des points, des tirets et des deux-points. Si ton gabarit saute les demandes de permission de ton agent, les exécutions se font sans demande : c'est ton choix.
- `/api/open` ouvre des liens web, ou des fichiers situés dans ton workspace, dans ce dossier de l'OS ou dans le dossier des livrables. Il n'ouvre jamais de fichiers de programme et n'utilise aucun shell.
- Les pages ne chargent rien depuis Internet. L'OS lui-même ne fait aucun appel extérieur. L'outil d'agenda n'appelle Google qu'une fois que tu l'as installé, la commande d'e-mails ne s'exécute qu'une fois que tu l'as activée, et l'agent que ton lanceur démarre fait ce que fait cet agent.
- Ce qu'il lit : ton workspace (noms, tailles, dates, et les fichiers markdown pour leurs liens), `config/`, `snapshots/`. Si ton agent est Claude Code et que `"readers.claudeCode"` n'est pas `false`, il lit aussi ses tâches planifiées et ses journaux de session (pour compter les exécutions, les tokens et les appels d'outils ; seuls les noms de commandes et les numéros de ports locaux sont gardés, jamais les commandes complètes ni le texte des messages).
- Ce qu'il écrit : `data/` (données des pages, ouvertures d'apps, liste des exécutions, caches), `os-runs/` (journaux d'exécution et fichiers de prompt), `artifacts/` (rapports d'exécution, et `_trash` quand tu retires une boule), `snapshots/calendar.json` (le cache de l'agenda). Il ne stocke aucun identifiant à lui ; le token de connexion de l'agenda n'est écrit par `tools/google-calendar.js` que quand tu le lances.

## Crédits

Fait par Jay E | RoboNuggets, la communauté où cet OS a été construit en direct. Licence MIT : utilise-le, modifie-le, publie ta propre version, et garde la ligne de copyright.

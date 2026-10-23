# BRAIN.md - installer le second cerveau

Le second cerveau est le monde à l'intérieur de l'orbe : tout ton workspace sur une seule carte, en quatre couches. ARMS, de l'extérieur vers l'intérieur :

- **Applications** (bleu) : ce que ton agent peut joindre en dehors de cet ordinateur.
- **Routines** (or) : ce qui tourne à heure fixe.
- **Mémoire** (couleur du domaine) : chaque fichier de contexte, regroupé par domaine.
- **Skills** (crème) : ce que ton agent peut lancer à la demande, un nœud par skill, nommé comme tu le tapes (`/nom`).

Au centre se trouve **AGENTS md** : le fichier d'instructions que ton agent lit en premier.

Il a six onglets : **Orbes 3D**, **Carte 2D** (dispositions Force, Cercle, Hex et Anneaux), **Frise** (chaque fichier et chaque routine selon sa dernière modification), **Routines**, **Skills** et **Applications**. Appuie sur `/` n'importe où à l'intérieur pour rechercher un fichier par son nom ; Entrée t'y emmène. Clique deux fois sur un fichier (ou sur « Voir ici ») pour le lire dans la visionneuse latérale.

Tout se règle dans `config/`. Pour une installation normale, tu ne devrais toucher à aucun code.

## Étape 1 - faire pointer vers le workspace (`config/workspace.json`)

| Champ | Ce qu'il faut y mettre |
|---|---|
| `root` | Le chemin absolu du workspace principal de ton utilisateur. Vide veut dire « pas encore installé », et la carte reste vide. |
| `routerDoc` | Le fichier d'instructions que tu lis en premier, relatif à `root` (par exemple `AGENTS.md`). Il devient le nœud AGENTS md au centre. |
| `instructionDocs` | Tous les fichiers d'instructions toujours chargés, à la racine. Le nœud central montre leur dernière modification, et la frise marque chaque modification d'un repère. |
| `skillDirs` | Les dossiers qui contiennent les skills : un dossier par skill (avec un `SKILL.md` dedans) ou un fichier `.md` par commande. Chacun devient un nœud `/nom`. |
| `memoryDir` + `memoryIndex` | Ton dossier de notes et son fichier d'index, si ton utilisateur en tient un. Sert aux domaines et à `engine/brain.js`. |
| `projectsDir` | Ton dossier de projets, s'il y en a un. Le début des noms de ses dossiers peut décider des domaines. |
| `visibleRoots` | Les dossiers dont les enfants directs s'affichent sur la carte dès le départ (choisis les 3 à 8 qui comptent). Les enfants de la racine s'affichent toujours. Tout le reste se replie en un nœud par dossier, qui s'ouvre d'un clic. |
| `sharedPrefixes` | Les dossiers qu'un agent distant voit aussi (par exemple un dossier synchronisé). Leurs fichiers s'affichent comme joignables par les deux. |
| `maxFiles` | Un plafond de sécurité pour les très gros workspaces (500 000 par défaut). |

Le scan ignore `node_modules`, `.git`, les caches et les dossiers de build, suit les liens de dossiers une seule fois, et ne cartographie jamais le dossier de l'OS lui-même.

## Étape 2 - les domaines (`config/departments.json`)

Les domaines sont les tranches colorées du globe 3D et les groupes de la carte 2D.

1. **Sers-toi de ce que tu sais déjà.** À partir de tes instructions, de tes notes sur ton utilisateur et de l'arborescence des dossiers, écris 3 à 6 domaines qui collent à la façon dont ton utilisateur voit son travail (par exemple Clients, Contenu, Produit, Perso, Opérations).
2. **Ne pose de questions que si tu ne sais pas.** Pose alors 2 ou 3 questions rapides, comme « quels sont les grands domaines de ton travail ? » et « quels dossiers vont avec quoi ? ».
3. **Fais atterrir chaque fichier quelque part.** Un fichier reçoit le premier domaine qui correspond, dans cet ordre (les chemins sont relatifs à `root`) :
   - `projectPrefixes` : pour les dossiers placés directement dans `projectsDir`, le début du nom du dossier. Un objet qui associe un préfixe à une clé de domaine :
     ```json
     "projectPrefixes": { "client-": "clients", "pod-": "content" }
     ```
   - `memoryKeywords` : pour les fichiers de `memoryDir`, des mots dans le nom du fichier (en minuscules). Une liste :
     ```json
     "memoryKeywords": [ { "match": ["pricing", "invoice"], "dept": "money" } ]
     ```
   - `pathRules` : pour n'importe quel fichier ou dossier, le début de son chemin. Une liste :
     ```json
     "pathRules": [ { "prefix": "notes/", "dept": "content" }, { "prefix": "skills/research", "dept": "clients" } ]
     ```
   - `default` : la clé de domaine pour tout le reste.

   Chaque `dept` doit être une des `key` de tes domaines. Une règle mal formée ou avec une clé inconnue est ignorée, et le scan affiche un avertissement qui la nomme dans le terminal où tourne `node server.js` (et dans `node refresh/run.mjs`) : regarde là après un changement.
   **Les skills** reçoivent leur domaine de la même façon : le premier préfixe de `pathRules` qui correspond au dossier de la skill (par exemple `skills/research`), sinon `default`.
4. **Couleurs :** saturées, bien distinctes entre elles et des quatre couleurs des couches (bleu, or, violet, orange).
5. **Icônes** (`icon`) : une parmi `build`, `pen`, `people`, `coin`, `data`, `pulse`, `book`, `clock`, `visual`, `api`.

Garde `layers` tel que livré, sauf si ton utilisateur veut d'autres couleurs de couches.

## Étape 3 - les applications (`config/apps.json`)

Seulement de vraies connexions : les serveurs MCP de la config de ton agent, les outils en ligne de commande connectés à un service (un hébergeur de code, un outil de déploiement, une CLI cloud), les API avec des clés enregistrées. Les environnements et outils locaux (node, python, ffmpeg, git lui-même) n'ont rien à faire ici. Pose-toi la question : est-ce que ça parle à quelque chose en dehors de cet ordinateur ?

```json
{ "id": "app:github", "label": "GitHub CLI", "kind": "cli", "command": "gh", "access": "local", "status": "live", "desc": "dépôts, pull requests, issues" }
```

- `kind` : `mcp`, `cli`, `api` ou `app`.
- `command` (outils en ligne de commande) : le mot que tu tapes, pour que l'usage puisse compter ses exécutions (USAGE.md).
- `mcp` (serveurs MCP) : le nom du serveur tel que ton agent l'inscrit dans ses journaux, s'il diffère de l'id.
- Icônes : les logos de nombreux services courants sont intégrés, repérés par leur id (`app:telegram`, `app:gmail-connector`, `app:gcal`, `app:gdrive`, `app:gh`, `app:vercel`, `app:slack`, `app:stripe`, `app:canva`, `app:hubspot` et d'autres dans `refresh/lib/icons-base.json`). Pour tout le reste, ajoute `"path"` (un tracé de logo en 24x24) ou `"svg"` (un dessin au trait en 48x48, de 2 à 5 formes). Sans l'un ni l'autre, une simple icône au trait est dessinée pour lui.

## Étape 4 - en option

- `config/agents.json` : un agent distant qui voit tes dossiers synchronisés (`kind: "vps"`, `access: "synced"`), ou un agent assistant avec des skills et des notes définies.
- `config/access-overrides.json` : marque un dossier comme réservé à cet ordinateur ou réservé à l'agent distant.

## Étape 5 - le construire

```
node refresh/run.mjs
```

Ça construit la carte, les skills, les routines et les apps, et les chiffres d'usage. L'OS le construit aussi tout seul au premier démarrage après que `root` est rempli, puis chaque fois que tu modifies `workspace.json`, `departments.json` ou `apps.json`. Ensuite, l'icône d'actualisation (en haut à droite dans le second cerveau) reconstruit tout sur place. Aucun appel au modèle.

## Comment c'est construit (pour les changements à venir)

| Partie | Fichier |
|---|---|
| Le scan (fichiers, domaines, accès, liens markdown) | `engine/scan.js` |
| La recherche et la visionneuse de fichiers (lecture seule) | `engine/server.js`, lancé par `server.js` sur `brainPort` |
| Les données que les pages affichent | `refresh/brain.mjs` écrit `brain/snapshot.js`, `brain/snapshot-expansions.js`, `brain/_icons.js`, `assets/home-orb-mini.js` |
| L'apparence : couleurs, physique, étiquettes | l'objet `skin` dans `brain/index.html` (`layerColors`, `deptColors` remplacent les couleurs de la config) |
| Le dessin de la 3D, de la 2D et de la frise | `brain/port.js`, `brain/port-gl.js`, `brain/_core.js`, `brain/timeline-layout.js` |
| Le centre coloré de l'orbe de la page d'accueil | `assets/home-orb-mini.js` (reconstruit par l'actualisation pour coller à tes domaines) |

## Le moteur de rappel (en option)

`engine/brain.js` est un outil de recherche et de classement qui ne consomme aucun token, pour un dossier de notes organisé autour d'un index (un fait par fichier, plus un fichier d'index) :

```
node engine/brain.js recall "qu'a-t-on décidé sur les prix"
node engine/brain.js store "fait" --type feedback --name short-slug
node engine/brain.js ask "question"      (copie un prompt d'un seul tour, avec les éléments trouvés)
```

Il lit `memoryDir` et `memoryIndex` dans `workspace.json` et n'appelle jamais de modèle. Ne le propose que si ton utilisateur tient (ou veut tenir) ce genre de dossier de notes.

## Dépannage

- **La carte est vide :** `root` est vide ou faux. Corrige-le, puis appuie sur l'icône d'actualisation.
- **La recherche dit qu'elle ne répond pas :** le moteur scanne encore un gros workspace, ou `brainPort` est pris. Surveille le terminal où tourne `node server.js`.
- **Un fichier ne s'ouvre pas dans la visionneuse :** il est binaire, fait plus de 500 Ko, est hors du workspace, ou son nom ressemble à un secret. Tout ça est voulu.
- **Trop de nœuds :** retire des dossiers de `visibleRoots` ; ils se replient chacun en un seul nœud.

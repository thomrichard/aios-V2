# WIRING.md - le deck de skills, « Appliquer tous les commentaires », les e-mails, les stats et les micro-apps

La plupart des widgets lisent de petits fichiers dans `snapshots/` que ton agent écrit. Si un fichier manque, le widget affiche une petite note discrète « pas encore branché », et rien ne casse.

## Le lanceur : les cartes du deck de skills et « Appliquer tous les commentaires »

Les deux lancent ton agent sans interface, via un seul gabarit de commande dans `os-config.json` :

```json
"runner": { "command": "", "cwd": "", "modelValues": [], "effortValues": [] }
```

- `command` est vide à la livraison : rien ne s'exécute tant que tu ne l'as pas rempli. Il prend une de ces trois formes :
  1. **Le prompt sur l'entrée standard (recommandé).** Le gabarit est simplement la commande sans interface de ton agent ; l'OS lui fournit le prompt. Marche pour les cartes du deck et pour « Appliquer tous les commentaires ».
  2. **`{prompt}` sur la ligne de commande.** Pour un agent qui ne prend le prompt qu'en argument : `my-agent run "{prompt}"`. Une carte du deck y met son prompt (`/weekly-review`) ; « Appliquer tous les commentaires » y met une courte ligne qui pointe vers son fichier de prompt.
  3. **`{skill}` (cartes du deck seulement, la forme de la v1).** Pour un agent qui n'a aucune option de modèle ni d'effort : `my-agent "/{skill}"`. `{skill}` est l'id de la carte. « Appliquer tous les commentaires » ne peut pas utiliser cette forme.
- Si ton agent est Claude Code, le gabarit est :
  `claude -p --model {model} --effort {effort}`
  Ajoute `--permission-mode bypassPermissions` seulement si tu veux que les exécutions aillent au bout sans s'arrêter sur les demandes de permission. C'est un vrai compromis : l'exécution peut alors faire tout ce que ton agent sait faire.
- `cwd` : le dossier où démarre l'exécution, en général ton workspace principal (là où ton agent trouve tes skills).
- Les sélecteurs de modèle et d'effort ne sont que des étiquettes. Ils n'arrivent à ton agent que si le gabarit contient `{model}` et `{effort}` : `{model}` reçoit le nom du modèle de la carte en minuscules (`haiku`, `sonnet`, `opus`, `fable`), et `{effort}` le nom de l'effort (de `low` à `max`). Renomme les étiquettes dans `"models"` et `"efforts"` comme tu veux. Si ta commande attend d'autres mots, liste-les dans `modelValues` / `effortValues`, dans le même ordre. Si ton agent n'a pas ces options, retire les deux du gabarit.

### Les cartes du deck de skills

Les cartes se trouvent dans `os-config.json`, sous `"skills"` :

```json
"skills": [ { "id": "weekly-review", "icon": "pen", "model": 1, "effort": 1, "prompt": "/weekly-review" } ]
```

- `id` : lettres minuscules, chiffres et tirets. Il s'affiche sous la forme `/id`.
- `icon` : une parmi `bolt`, `trophy`, `broom`, `doc`, `gem`, `pen`, `send`, `eye`, `star`, `mail`, `cal`, `chart`.
- `model` / `effort` : des positions dans les listes des sélecteurs (0 est la première).
- `prompt` (en option) : ce qu'on dit à l'exécution. Par défaut : `/id`. Un prompt doit commencer par la commande de la skill, sinon l'exécution risque d'ouvrir la mauvaise skill.
- Redémarre l'OS après une modification. Appuie sur ▶ sur une carte : ton agent s'exécute, et le résultat arrive sur l'anneau sous forme de rapport mis en forme.
- Les bonnes cartes sont des skills qui vont au bout sans rien te demander en cours de route. Demande à ton agent de t'en recommander 2 à 4. Le bouton + AJOUTER UNE SKILL lui donne un prompt prêt à l'emploi.
- Chaque exécution consomme ton forfait d'agent, avec le modèle réglé sur la carte.

### « Appliquer tous les commentaires »

Les pages de relecture (toute page qui a le bouton « Appliquer tous les commentaires ») envoient leurs commentaires ouverts à `POST /api/apply-comments` et interrogent `/api/run-status` à intervalles réguliers. Une exécution sans accroc modifie le fichier, puis la page affiche le résultat et se recharge. Ces pages cherchent l'OS sur le port 50000, celui par défaut. Si la v2 tourne sur un autre port (à côté de la v1), leur bouton ne peut pas la joindre tant que la v2 n'a pas repris le 50000 (README, « Passer de la v1 à la v2 »). Seules les pages de cet ordinateur peuvent la lancer (le modèle de sécurité du README donne les détails).

## E-mails

Le widget e-mails résume les dernières 24 heures de ta boîte : un total, les lignes signalées qui ont besoin de toi, et une barre de répartition (partenariats, prospects, perso, autre).

1. Il appelle un outil en ligne de commande capable de lire Gmail, nommé dans `"email"."command"`, avec `gmail users messages list` et `get` et des paramètres JSON. Si tu utilises la CLI Google Workspace (`gws`), garde le `"command": "gws"` livré ; demande à ton agent de l'installer et de s'y connecter, avec l'API Gmail activée dans un projet Google Cloud. Si tu utilises une autre CLI Gmail qui prend les mêmes commandes, mets son nom à la place.
2. Mets `"enabled": true` et redémarre l'OS. Le widget s'allume à sa prochaine récupération, et la barre RÉPARTITION DU JOUR apparaît avec tes vrais chiffres (elle reste cachée jusque-là).
3. Règle les quatre catégories (partenariats, prospects, perso, autre) dans `os-config.json` : `partnerHints` et `leadHints` sont des listes de mots cherchés dans les objets des e-mails, `personalFrom` correspond au domaine de l'expéditeur. Les lignes signalées sont les partenariats et les prospects.

Pas de CLI Gmail ? Demande à ton agent d'adapter `getEmail()` dans `server.js` à l'accès e-mail dont il dispose (la fonction renvoie juste des lignes), ou retire le widget en mode édition.

## Stats

Le widget stats affiche les chiffres qui comptent pour toi : abonnés, revenus, clients, séances de sport. Ton agent écrit `snapshots/stats.json` :

```json
{ "title": "YOUTUBE", "big": 12345, "cap": "ABONNÉS<br>1,2 M de vues au total", "gridLabel": "3 VIDÉOS CE MOIS-CI", "publishDays": [2, 9, 16], "link": "https://studio.youtube.com" }
```

- `title` renomme le widget. `big` est le chiffre principal. `cap` est l'étiquette sur deux lignes en dessous (`<br>` est le seul HTML autorisé).
- `publishDays` allume ces jours du mois dans la grille de points ; `gridLabel` en est la légende. La grille reste cachée tant que `stats.json` n'existe pas : un widget pas encore branché n'affiche pas de points inventés.
- `link` (en option, http ou https) rend la grille cliquable.

**Recette : YouTube.** Dis à ton agent : « Récupère le nombre d'abonnés de ma chaîne et les jours de mise en ligne de ce mois-ci depuis l'API YouTube Data (une clé gratuite depuis la console Google Cloud, YouTube Data API v3). Écris-les dans <chemin-de-ton-os>/snapshots/stats.json au format de WIRING.md, et actualise-le chaque jour. »

## Micro-apps

Les tuiles : tes propres apps, puis « Ajouter ».

- **Tes propres apps** vont dans `os-config.json`, sous `"microApps"` :

```json
"microApps": [ { "id": "notes-app", "name": "Mon app de notes", "desc": "Une ligne courte", "url": "http://localhost:3000/", "fallbackUrl": "", "icon": "gen" } ]
```

- `icon` : `gen`, `tele`, `brain`, `exca`, `recos` ou `plus` (ou dessine un nouveau sprite de 10x10 dans `ICS`, dans `os.html`).
- Redémarre l'OS après une modification. Chaque clic sur une tuile est inscrit dans `data/app-opens.jsonl`, que l'onglet Applications compte.
- La tuile « Ajouter » donne à ton agent ce même prompt, prêt à copier.

## Garder les flux à jour

Ajoute une ligne permanente à tes instructions, avec le chemin absolu du dossier de l'OS dans l'emplacement prévu : « Après toute tâche qui change mes chiffres ou mon planning, mets à jour le fichier correspondant dans <chemin-de-ton-os>/snapshots/ (stats.json, routines.json). » Cette seule habitude garde tout le tableau de bord honnête.

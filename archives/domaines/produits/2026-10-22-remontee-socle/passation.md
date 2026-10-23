---
type: livrable
resume: Passation pour le socle en ligne : routines directes, fiches YouTube et graphe toujours à jour, avec un patch prêt à appliquer
statut: clos
domaine: produits
projet: socle-aios-membres
cree: 2026-10-23
maj: 2026-10-23
liens: [changements.patch]
---
# Remontée au socle : routines directes, fiches YouTube, graphe à jour

Pour la discussion qui gère le socle sur GitHub (`thomrichard/aios-V2`).

## Appliquer

Depuis un clone du socle sur `874b314` (« Montre les connexions dans l'interface ») :

```bash
git apply chemin/vers/changements.patch
```

Vérifié le 2026-10-22 sur une copie neuve de `874b314` : le patch s'applique proprement, puis `index.py` et `verifier.py` passent (« Tout est en ordre »). Si le socle a bougé depuis, `git apply --3way`.

## Ce que contient le patch

1. **Routine directe : une commande lancée sans IA**, quand il n'y a rien à juger.
   - `AGENTS.md` : une ligne dans « Routines ».
   - `systeme/routines.md` : la définition, une colonne Commande (« — » pour les routines par skill), un exemple « Fiches YouTube » à construire, un exemple de ligne cron.
   - `systeme/scripts/lancer.py` : `lancer.py <routine>` exécute la colonne Commande.
   - `systeme/scripts/index.py` : l'interface affiche « sans IA » pour une routine directe (`interface/snapshots/routines.json` régénéré).
2. **`systeme/scripts/youtube.py`, nouveau et neutre.** API officielles YouTube en lecture seule.
   - `connecter --client <client_secret.json>` : autorisation avec le compte qui possède la chaîne ; le jeton va dans `.env`.
   - `tester` : vérifie Data v3, Analytics v2 et revenus.
   - `fiches [--maj]` : une fiche par vidéo longue publique (infos, stats à 7 et 30 jours et totales, revenus, liens entre vidéos, description, transcription par chapitre). Le domaine vient du dossier (`--dossier`, par défaut `domaines/contenu/videos`). En mise à jour, la fiche garde sa transcription et sa section `## Notes`.
   - Il faut : un projet Google Cloud avec YouTube Data API v3 et YouTube Analytics API activées, un client OAuth de type « bureau », et `yt-dlp` pour les transcriptions. Rien à installer en Python.
3. **Interface (kit de Jay), points 7 à 10 de `interface/MODIFS.md`.**
   - `systeme/scripts/index.py` ajoute à `visibleRoots` (`interface/config/workspace.json`) chaque dossier de `domaines/`, à tous les niveaux : ce qui est rangé dans un domaine s'affiche sur la carte sans clic.
   - `server.js` : ouvrir le second cerveau reconstruit sa carte si elle a plus de 30 secondes.
   - `refresh/brain.mjs` : le contenu des dossiers est préparé à tous les niveaux. Avant, un dossier dans un dossier replié s'ouvrait vide et échappait à la recherche.
   - `copy.js` : entrer dans le second cerveau depuis la page d'accueil le recharge si ses données ont plus d'une minute. Avant, la page d'accueil, qui reste ouverte, gardait le graphe de son ouverture.

## Testé chez Thomas, le 2026-10-22

- Connexion OAuth avec le compte propriétaire : Data, Analytics et revenus répondent.
- 63 fiches écrites ; une mise à jour garde une note ajoutée à la main et ne retélécharge aucune transcription.
- La routine directe lancée par launchd : code de sortie 0.
- Depuis la page d'accueil : le graphe se recharge à la seconde entrée, et les 63 fiches de `domaines/contenu/videos` s'affichent sans clic.

## Hors du patch, propre à Thomas

Les fiches de `domaines/contenu/videos/`, la ligne du routeur contenu, les décisions du journal, ses lignes de `systeme/connexions.md`, sa routine « Fiches YouTube » en place et son fichier launchd `com.sm4rt.fiches-youtube.plist`.

## À la prochaine récupération du socle chez Thomas

- `systeme/connexions.md` : le socle lit maintenant la Méthode (`cli`, `api`, `mcp`) et une colonne Commande. Réécrire ses deux lignes dans ce format : l'API YouTube en `api`, yt-dlp en `cli` avec la commande `yt-dlp`.
- `systeme/routines.md` : garder ses lignes « Stats YouTube » et « Fiches YouTube » (en place), à la place de l'exemple du socle.

## Idées pour la suite du socle

- Installer les routines en place depuis `systeme/routines.md` (launchd sur Mac, cron ailleurs), sur le modèle de `systeme/scripts/interface.py installer`, plutôt qu'un fichier launchd écrit à la main.
- Un guide pour les membres : créer le projet Google Cloud, activer les deux API, créer le client « bureau ».

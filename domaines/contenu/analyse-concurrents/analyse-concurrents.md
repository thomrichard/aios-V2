---
type: livrable
resume: La matière brute de 60 vidéos (5 chaînes IA anglophones et la chaîne de Thomas) : transcriptions, images, commentaires, performance et codage, pour croiser l'écriture et les résultats
statut: en-cours
domaine: contenu
projet: references-youtube
cree: 2026-10-25
maj: 2026-10-25
liens: [codage.md, ../grille-analyse-concurrents.md, ../matrice-methodes-youtube.md]
---
# Analyse des concurrents : la matière brute

60 vidéos, toutes rangées de la même façon, pour répondre à une question : **quelle façon d'écrire et d'habiller une vidéo va avec la performance ?** On croise trois choses :

1. ce que fait chaque vidéo : titre, miniature, intro, structure, habillage, appels à l'action ;
2. les techniques des quatre formateurs YouTube étudiés dans la [matrice](../matrice-methodes-youtube.md), notées vidéo par vidéo ;
3. la performance de chaque vidéo, comparée aux autres vidéos de sa propre chaîne.

La façon de coder est dans [codage.md](codage.md). La présentation visuelle viendra ensuite, à partir de ces données.

## Le périmètre

Les 10 dernières vidéos longues de chaque chaîne, publiées depuis au moins 7 jours au 2026-10-25, pour que toutes aient leurs vues à 7 jours. La liste exacte : `selection.json`.

| Chaîne | Dossier | Abonnés (2026-10-25) | Période couverte |
|---|---|---|---|
| Nate Herk | `nate-herk/` | 1,09 M | 2026-10-02 au 2026-10-16 |
| Jay E, RoboNuggets | `robonuggets/` | 205 000 | 2026-09-27 au 2026-10-17 |
| Simon Scrapes | `simon-scrapes/` | 106 000 | 2026-08-22 au 2026-10-17 |
| Tristen O'Brien | `tristen-obrien/` | 85 900 | 2026-08-25 au 2026-10-14 |
| Jad M.H | `jad-mh/` | 8 570 | 2026-10-07 au 2026-10-17 |
| Thomas Richard, le témoin | `thom-richard/` | 5 620 | 2026-07-07 au 2026-10-13 |

Les cinq chaînes parlent surtout de Claude et des outils IA : les écarts viennent du traitement plus que du sujet. La chaîne de Thomas sert de témoin : c'est la seule dont on a la rétention.

## Ce qu'il y a dans chaque dossier

`<chaine>/<titre-de-la-video>/` contient la vidéo décomposée : données, transcription mot à mot, commentaires, miniature, trois planches d'images, mesures, et le codage. Le détail fichier par fichier est dans [codage.md](codage.md), partie « Les fichiers d'une vidéo ». `<chaine>.md`, à côté du dossier de la chaîne, en fait la synthèse. `croisements.md` croise les 60 vidéos.

## Les fichiers d'ensemble

| Fichier | Ce qu'il contient |
|---|---|
| `selection.json` | Les 60 vidéos retenues, par chaîne |
| `videos.csv`, `videos.json` | Une ligne par vidéo : mesures, codes, performance (écrits par `consolider.py`) |
| `segments.csv` | Une ligne par partie de vidéo, avec la rétention pour la chaîne de Thomas |
| `croisements.json` | Pour chaque technique et chaque mesure, la performance des vidéos qui l'ont et de celles qui ne l'ont pas |
| `collecte.py` | Récupère la matière brute (yt-dlp, API YouTube, ffmpeg) |
| `consolider.py` | Assemble le tableau et calcule les croisements |

## Comment c'est fait

| Donnée | Outil | Coût |
|---|---|---|
| Liste des vidéos, transcriptions, commentaires, miniatures, images | yt-dlp et ffmpeg | Gratuit |
| Vues, likes, commentaires, durée, description | API YouTube v3 (`systeme/scripts/youtube.py`) | Gratuit |
| Vues jour par jour, score d'outlier, changements de miniature | VidIQ | 5 crédits par appel, environ 525 en tout |
| Rétention, durée moyenne vue, abonnés gagnés, vues jour par jour de la chaîne de Thomas | API YouTube Analytics | Gratuit |
| Codage des vidéos | Un agent par chaîne, sur la grille de `codage.md`, calé sur une vidéo étalon codée à la main | — |

Les vidéos sont téléchargées en 720p sans le son, hors du dépôt, le temps de tirer les images ; elles ne sont pas gardées.

Pour relancer ou étendre (une autre chaîne, d'autres vidéos) : ajouter la chaîne dans `CHAINES` en tête de `collecte.py`, puis

```bash
python3 -I domaines/contenu/analyse-concurrents/collecte.py --chaines <chaine> --travail <dossier-temporaire>
```

## Limites

- **La rétention des concurrents** n'est pas publique. Le seul indice, la courbe des moments les plus revus, n'existe que sur certaines grosses vidéos (champ `heatmap` de `metriques.json`).
- **Le CTR** des vidéos de Thomas n'est pas donné par l'API YouTube Analytics (requête refusée) : il se lit dans YouTube Studio.
- **La musique et les effets sonores** ne sont pas analysés : l'agent ne peut pas écouter.
- **Le comptage des changements de plan** est calibré sur une vidéo (seuil 0,06, détections fusionnées à moins d'une seconde). Il sert à comparer les vidéos entre elles, pas à donner un chiffre absolu.
- **Les transcriptions** sont les sous-titres automatiques de YouTube : quelques mots peuvent être mal reconnus.
- **50 vidéos de concurrents**, c'est assez pour des pistes, pas pour des preuves. Une piste se teste ensuite sur nos propres vidéos.

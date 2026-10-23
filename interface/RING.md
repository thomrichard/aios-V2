# RING.md - faire atterrir chaque création sur l'anneau

L'anneau autour de l'orbe est la mémoire de ton travail dans l'OS : chaque page HTML du dossier `artifacts/` devient une boule que tu peux rouvrir, rechercher (`/`) et parcourir. L'habitude qui fait marcher tout ça : ton agent inscrit lui-même tout ce qu'il construit.

## L'extrait (ajoute-le au fichier d'instructions de ton agent)

Ajoute ceci au fichier que ton agent lit au début de chaque session, en changeant juste le chemin :

```
### Mettre le HTML fini sur l'anneau de mon OS
Chaque fois que tu termines une page HTML pour moi (rapport, tableau de bord, page de synthèse, outil) :
1. Copie le fichier dans <chemin-de-ton-os>/artifacts/<slug-court>.html
2. Écris <slug-court>.json à côté :
   { "title": "Titre court et lisible", "icon": "doc", "kind": "report",
     "created": "<horodatage ISO>", "note": "une ligne sur ce que c'est",
     "svg": "<circle cx='24' cy='24' r='14'/>" }
3. Le svg compte 1 à 4 formes simples (path, circle, rect, line, polyline, polygon, ellipse)
   sur une grille de 48x48, sans attribut fill ni stroke, et il doit représenter CETTE page
   pour que je la retrouve d'un coup d'œil.
4. Dis-moi : « ajouté à l'anneau de l'OS sous le nom <titre> ».
Catégories d'icônes de secours : dash, deck, report, mail, video, chart, visual, bolt, doc.
```

Pendant l'installation, ton agent peut l'ajouter pour toi. Dis oui quand il te le propose.

## Notes

- L'anneau lit le dossier en direct. Un nouveau fichier devient une nouvelle boule à la récupération suivante (en moins de 2 minutes), sans redémarrage.
- **Fais un clic droit sur n'importe quelle boule** pour OUVRIR (dans un nouvel onglet) ou RETIRER. Le retrait se rattrape : la page et son fichier compagnon vont dans `artifacts/_trash`. Ressors-les de ce dossier pour restaurer la boule.
- Le cercle n'affiche que le nombre de boules qui y tiennent. Les plus anciennes se cachent d'elles-mêmes ; appuie sur `/`, et les boules cachées qui correspondent apparaissent sur un anneau intérieur pendant ta recherche.
- Chaque boule porte un arc gris de 30 jours qui se vide avec le temps, et une étiquette de jour (aucune le jour de sa création). La plus récente se trouve à côté de la boule orange d'index ; survole la boule orange pour voir tous les noms.
- Le dossier est `"artifactsDir"` dans `os-config.json`. Fais-le pointer où tu veux (un chemin absolu marche) pour que l'anneau surveille un dossier existant.
- Les exécutions du deck de skills inscrivent elles-mêmes leurs boules de rapport.
- Le `svg` d'un fichier compagnon ne garde que des formes simples, à la géométrie simple. Tout le reste (scripts, liens, styles) fait tomber le glyphe, et la boule reprend l'icône de sa catégorie.
- Trois boules d'exemple sont livrées avec le kit. Supprime leurs fichiers dans `artifacts/` quand tu veux.

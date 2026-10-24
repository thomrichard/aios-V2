---
type: livrable
resume: Méthode en 8 étapes pour analyser une vidéo concurrente, tirée de la façon dont les 4 chaînes de référence étudient les autres
statut: a-valider
domaine: contenu
projet: references-youtube
cree: 2026-10-23
maj: 2026-10-23
liens: [matrice-methodes-youtube.md, ../../savoir/methode-aprilynne-alter.md, ../../savoir/methode-ali-abdaal.md, ../../savoir/methode-alexander-the-create.md, ../../savoir/methode-ed-lawrence.md]
---
# Grille d'analyse des vidéos concurrentes

Elle sert à décortiquer une vidéo qui marche chez un concurrent, pour en tirer ce qu'on peut réutiliser sans copier. Elle suit les étapes de la [matrice](matrice-methodes-youtube.md), pour que ce qu'on observe se range au même endroit.

## D'où elle vient

Elle assemble ce que chacun des quatre fait quand il étudie les autres :

- **Aprilynne Alter** choisit les vidéos par les outliers de petites chaînes. Elle lit la miniature (type de curiosity gap, composition), l'intro (lien entre titre, miniature, première phrase et premier plan, fréquence des changements de visuel) et la structure (setup, progress, payoff).
- **Ali Abdaal** ne regarde que le titre des outliers, pour ne pas copier le fond par accident. Il repère aussi les schémas de titre usés à force d'être copiés.
- **Ed Lawrence** filtre d'abord avec l'œil de ses acheteurs : une vidéo très vue qui ne les intéresse pas est écartée. Il garde le schéma du titre, jamais le titre. Il cherche hors de sa niche plutôt que chez les leaders. Pour relire une vidéo : ce qu'on attend en cliquant, si l'intro le donne, la seconde où l'on décroche, et pourquoi.
- **Alexander** passe les titres à ses tests (timide ou audacieux, jargon ou douleur et rêve) et classe les vidéos par format.

Les quatre partagent une règle : **on reprend un schéma, jamais le fond**.

## Étape 1. Choisir les vidéos

1. **Trois cercles de chaînes à suivre.**
   - Les concurrents directs : chaînes françaises sur l'IA et l'automatisation.
   - La même niche en anglais.
   - Hors niche, pour le packaging et les formats (Ed, Ali).
2. **Repérer les outliers.** Rapporter les vues de chaque vidéo à la médiane de la chaîne. On garde à partir de 3 fois la médiane (seuil d'Aprilynne, à calibrer pour le marché français). Pour chaque vidéo retenue :
   - elle a plus de deux semaines ;
   - on préfère les petites chaînes, dont les vues doivent moins à la notoriété.
3. **Le filtre de l'acheteur** (Ed). Un membre du Club ou un client de consulting cliquerait-il ? Si non, on écarte la vidéo, même très vue.
4. **Noter l'objectif probable** de la vidéo : vues, communauté ou vente. On la compare à nos vidéos du même objectif.

Outils : yt-dlp donne les vues de toutes les vidéos d'une chaîne, gratuitement (utilisé pour ce projet le 2026-10-23). vidIQ a une recherche d'outliers, payée en crédits.

## Étape 2. Le packaging, sans regarder la vidéo

D'abord le titre et la miniature seuls (Ali, Ed).

- **Ce que j'attends en cliquant** : l'écrire en une phrase. On s'en sert à l'étape 3 (Ed).
- **Titre**
  - La promesse : quel résultat pour le spectateur ?
  - Le schéma réutilisable, par exemple « un résultat désiré sans une contrainte qu'on croit obligatoire » (Ed).
  - Timide ou audacieux ? Jargon, ou douleur et rêve ? Quelles briques parmi preuve, vitesse, audace, résultat ? (Alexander)
  - Le nombre de caractères.
- **Miniature**
  - Le type de curiosity gap : moment, histoire, résultat, transformation, nouveauté (Aprilynne).
  - Les scroll stoppers : visage, élément familier, chiffre, argent, danger, émotion, couleur.
  - Le texte : combien de mots, et s'il répète le titre.
  - Lisible en 2 secondes ?
- **Usure** : ce schéma est-il déjà repris partout dans la niche ? Plus il est copié, moins il rapporte (Ali).

## Étape 3. L'intro (les 60 premières secondes)

- La première phrase reprend-elle le titre ? Le premier plan reprend-il la miniature ? (Aprilynne)
- Le type d'ouverture :
  - un hook, de dissonance, de question ou de fait (Ed) ;
  - une boucle de curiosité (Aprilynne) ;
  - la douleur suivie d'une histoire perso (Ali) ;
  - un pont : contexte, preuve, annonce (Alexander).
- La preuve : comment le créateur montre qu'il a le droit de promettre ça ?
- La longueur : à quelle seconde commence le premier point ?
- L'attente notée à l'étape 2 est-elle tenue ? Est-elle dépassée ?

## Étape 4. La structure

Avec la transcription et les chapitres.

- Découper la vidéo en parties et noter le temps de chacune.
- Pour chaque point :
  - un problème posé, une preuve, des consignes ? (Ed)
  - une image ou une histoire ? un nom ? une phrase finale ? (Alexander)
- Où sont les payoffs, les moments qui livrent la promesse ? (Aprilynne)
- Où le créateur relance-t-il l'attention : une question, l'annonce de la suite ?
- Les histoires : la sienne (acte 1), celle d'un client (acte 2), une vision (acte 3) ? (Ed)
- Le niveau : à qui parle-t-il, débutant ou pro ? Combien de jargon ?
- Le test du tweet : la vidéo se résume-t-elle en quelques lignes sans rien perdre ? (Ed)

## Étape 5. L'habillage (phase 2 du projet)

C'est la partie visuelle, que la transcription ne montre pas.

- Le cadrage, le décor, la lumière.
- La part de face caméra, de B-roll et de partage d'écran. Pour un tuto : comment l'écran est montré (zooms, curseur, surlignage).
- Les textes à l'écran et les sous-titres : quand, quelle police, quelles couleurs.
- La fréquence des changements de visuel, mesurée sur la première minute puis sur une minute du milieu (Aprilynne).
- La musique, les effets sonores, le motion design.
- Le style d'ensemble : couleurs, polices, gabarit commun aux vidéos de la chaîne.

Outil prévu : télécharger la vidéo dans le dossier des fichiers lourds, tirer une image toutes les quelques secondes avec ffmpeg et repérer les changements de plan. Pas encore testé : ce sera le premier essai de la phase 2.

## Étape 6. La fin et la conversion

- L'appel à l'action : à quelle minute, vers quoi (lead magnet, produit, communauté, vidéo suivante, abonnement) ?
- Comment il est amené : juste après une tâche pénible (Aprilynne), avec une émotion vraie (Alexander), par une preuve (Ed) ?
- La description et le commentaire épinglé : quels liens, dans quel ordre ?
- La vidéo suivante proposée, et pour quelle raison.

## Étape 7. Les commentaires

Cette étape n'est pas tirée des quatre créateurs : c'est un ajout. Il prolonge une idée d'Ali (les commentaires mesurent la profondeur de l'impact) et une d'Alexander (les noms donnés aux idées reviennent dans les commentaires).

- Ce que les spectateurs reprennent : les noms, les phrases.
- Ce qu'ils demandent : de nouvelles idées de vidéos, de nouveaux problèmes.
- Ce qu'ils contestent ou ne comprennent pas : un trou à combler dans notre version.

## Étape 8. Ce qu'on en tire

Pour chaque vidéo, quatre lignes au plus :

1. Un schéma de titre ou de miniature à essayer.
2. Une technique d'intro ou de structure.
3. Un élément d'habillage (phase 2).
4. Une idée de vidéo pour nous, avec son objectif : vues, Club ou consulting.

Garde-fous :

- Ne jamais reprendre le fond ni le titre tels quels (Ali, Ed).
- Imiter, puis innover (Ali) : on reprend un schéma, on y met notre fond et notre angle.
- Ne pas copier les leaders de la niche française : le public les connaît et ira voir l'original (Ed).

## Ce que produit une analyse

Une fiche source dans `savoir/` par vidéo analysée (type `source`, projet `references-youtube`), avec ces sections :

```
# <titre de la vidéo>

<chaîne> · publiée le AAAA-MM-JJ · durée · vues · multiplicateur d'outlier · [voir la vidéo](url)

## Pourquoi cette vidéo
## Packaging
## Intro
## Structure
## Habillage
## Fin et conversion
## Commentaires
## Ce qu'on en tire
```

Quand plusieurs vidéos ont été analysées, ce qui revient remonte dans la matrice.

## Suite possible

Si la grille tient après deux ou trois analyses, en faire une skill qui enchaîne tout : choix des outliers avec yt-dlp, transcription, images avec ffmpeg, remplissage de la fiche. C'est une proposition, à décider après le premier test.

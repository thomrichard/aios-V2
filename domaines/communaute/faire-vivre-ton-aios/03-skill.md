---
type: support
resume: la skill : pièce jointe de la leçon « Carte de workflow : qui exécute quoi »
statut: publie
domaine: communaute
cree: 2026-08-16
maj: 2026-10-24
liens: [03-carte-de-workflow-qui-execute-quoi.md]
---
---
name: carte-workflow
description: Transforme un workflow (process, procédure, automatisation, routine de travail) en carte HTML interactive d'une seule page — un nœud par étape, un badge qui nomme QUI l'exécute, les points où un humain reprend la main matérialisés en arrêts durs, les chemins bout en bout cliquables. Déclencheurs — « mappe ce workflow », « carte du workflow », « schéma du process », « montre-moi qui fait quoi », « visualise ce pipeline », « où est-ce que j'interviens là-dedans ».
---

# Carte de workflow (HTML interactif)

Produis **un fichier HTML autonome** qui répond à trois questions d'un coup d'œil : qui
exécute chaque étape, où le travail s'arrête et attend un humain, et par quels chemins on
va de l'entrée à la sortie.

Un workflow qu'on ne voit pas est un workflow qu'on croit connaître. La carte sert à
découvrir ce qu'on n'avait pas vu : l'étape que personne n'exécute vraiment, la validation
qu'on croyait avoir, la boucle qui ne se referme jamais.

## Le patron

`patron.html`, à côté de ce fichier — **copie-le et remplace l'objet `MAP`**. Tout le reste
(placement automatique, connecteurs courbes, gates, boucles, sélection de chemin, thème
clair/sombre, compteurs, détection des nœuds orphelins) est déjà écrit.

Ne réécris jamais le moteur. Si un rendu ne va pas, c'est presque toujours la donnée : un
label trop long, une colonne surchargée, une connexion manquante.

Le fichier obéit à une règle unique : **toute la carte vit dans `MAP`, en tête de fichier.**
Corriger un label, ajouter une étape, changer un exécuteur = éditer des données, jamais du code.

## La méthode — dans cet ordre

**1. Partir de ce qui existe, pas de ce qu'on imagine.** Un workflow se mappe depuis sa
source : une procédure écrite, un scénario d'automatisation, le code d'un script, ou la
description de la personne qui l'exécute tous les jours. Si rien n'est écrit, fais-le
raconter à voix haute avant de dessiner quoi que ce soit — en désordre, avec les
digressions, c'est normal.

**2. Annoncer l'extraction AVANT de générer.** Liste en clair, dans la conversation : les
nœuds avec leur exécuteur, les connexions, les gates, les boucles — **et ce qui est
ambigu**. Une carte fausse coûte une reconstruction complète ; une correction à ce
moment-là coûte une ligne. Ne saute jamais cette étape, même quand le workflow paraît évident.

**3. Ne jamais combler un trou par une supposition.** Une étape dont tu ne sais pas qui
l'exécute se pose telle quelle : `note: "[à confirmer : qui exécute]"`. Un exécuteur inventé
est pire qu'un blanc — un blanc se voit, une invention plausible passe inaperçue et sera
prise pour vraie.

**4. Générer, puis regarder.** Ouvre le fichier dans un navigateur avant de le livrer. Le
placement étant automatique, c'est le seul moyen de voir une note qui déborde, une colonne
vide ou un nœud orphelin (le compteur en pied de page les signale).

## Les règles dures

1. **Chaque nœud nomme exactement qui l'exécute.** « Le système envoie » n'est pas un
   exécuteur : c'est un script nommé, un agent nommé, un outil nommé, ou une personne. Un
   nœud sans exécuteur identifiable est une étape mal comprise, pas une étape à dessiner.
2. **Un point de validation est un arrêt dur, jamais une étape polie.** Partout où quelqu'un
   vérifie, approuve ou tranche → un gate. Tout ce qui précède est produit, présenté, et
   ça attend. Si le workflow peut continuer sans la personne, ce n'est pas un gate.
3. **Aucun orphelin.** Tout nœud a un producteur ou un consommateur. Un nœud isolé signale
   presque toujours une étape fantôme (elle n'existe plus) ou une connexion oubliée.
4. **Une carte = un workflow.** Deux workflows dans une carte, et on ne sait plus où l'un
   finit et où l'autre commence. Deux fichiers.
5. **Ce qui repart en arrière se dessine.** Compteurs, retours clients, mesures qui
   nourrissent une étape amont : un arc sous le graphe, avec son libellé. Une boucle
   invisible est une boucle qu'on oublie de fermer.
6. **Cinq à sept colonnes.** Au-delà, la carte devient une frise qu'on lit de gauche à
   droite sans jamais la voir en entier — regroupe des étapes.

## Le contrat de données (`MAP`)

| Clé | Ce que c'est |
|---|---|
| `title` · `subtitle` | Le nom du workflow, et ce qui ne doit pas bouger dedans (l'intention, pas le résumé) |
| `source` | `{label, href}` — optionnel : d'où vient ce workflow (fiche, doc, wiki). Laisse vide si ça n'a pas de source écrite |
| `executors` | Type d'exécuteur → libellé + couleur. La légende n'affiche que les types réellement utilisés |
| `columns` | Les étages du flux, gauche → droite |
| `nodes` | `{id, col, x, label, note}` — `x` = type d'exécuteur, `note` ≤ 31 caractères (tronquée au-delà, texte complet au survol) |
| `edges` | `["A1","B1"]` — qui produit → qui consomme |
| `gates` | `{id, after, who, what}` — `after` = la colonne après laquelle ça s'arrête |
| `loops` | `{from, to, label}` — le retour en arrière |
| `flows` | `{id, name, desc, path:[ids], loops:[indices]}` — 3 à 5 chemins bout en bout. Le plus long s'ouvre tout seul |

Les étapes numérotées de la barre latérale sont **dérivées** des nœuds du chemin — ne les
écris pas à la main. Si elles se lisent mal, c'est le `label` ou la `note` du nœud qu'il
faut retravailler, ce qui améliore la carte au passage.

## Adapter le rendu

Le patron est volontairement neutre : polices système, aucun appel réseau, thème clair et
sombre. Il s'ouvre partout, hors ligne, et se partage par simple envoi du fichier.

Pour l'habiller à tes couleurs, tu n'as qu'un bloc à toucher — les variables `:root` et
`[data-theme="dark"]` en haut du `<style>`. Garde une règle : **les couleurs d'exécuteur ne
portent jamais le texte**, elles vivent dans les barres, les points et les connexions. C'est
ce qui permet d'en utiliser cinq sans jamais casser la lisibilité.

## Ce que cette skill ne fait pas

Elle ne rend pas un workflow exécutable — elle le rend **lisible**. Écrire la consigne qu'un
agent sans contexte pourrait exécuter, c'est le travail d'une procédure ou d'une autre skill.
La carte, elle, sert à décider quoi automatiser, et à voir ce que tu tiens encore à la main.

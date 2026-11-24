---
name: classer
description: Range un élément en lui donnant les bonnes métadonnées (type, domaine, statut, résumé, projet) ; sa place s'en déduit, et systeme/scripts/ranger.py l'y déplace. Sert pour un fichier de l'inbox, un fichier mal rangé, une fiche qu'on vient d'écrire, et les questions en attente du rangement. Déclencheurs : « classe ça », « range ce fichier », « où va ce fichier », « réponds aux questions du rangement ».
metadata:
  famille: ranger
---
# classer

Ranger, c'est mettre les bonnes métadonnées : la place s'en déduit. Tu ne touches jamais au contenu, seulement à l'en-tête et à l'emplacement.

## Étapes
1. Lis `systeme/metadonnees.md` : les domaines, les types et leur chemin, les statuts, les champs.
2. Regarde ce qu'est l'élément :
   - un document texte déjà écrit : il reçoit l'en-tête (étape 3) ;
   - du texte brut, un lien, un PDF, une vidéo, un son : il lui faut d'abord une fiche ; lance `fiche`, qui te rend la main ;
   - une image : choisis le dossier qui s'en sert, déplace-la, écris sa ligne dans le `_images.md` de ce dossier (gabarit `systeme/gabarits/images.md`). C'est fini.
   - un fichier déjà rangé que `verifier.py` dit « pas à sa place » : cherche d'abord une autre fiche du même objet (même lien, même titre). Un doublon se fusionne : la fiche la plus à jour reste, l'autre part dans `archives/`, et les liens suivent. Si son dossier a plusieurs fichiers mais pas de fiche à son nom, c'est sans doute un objet : propose de lui écrire sa fiche plutôt que de le vider.
3. Choisis chaque champ dans les réglages : le type, le domaine, le statut (celui de départ si rien ne dit mieux), un résumé d'une ligne, le projet s'il en sert un (`projets/`), `cree` (la date de l'élément, sinon aujourd'hui), `maj`, et `source` pour une capture. Rien hors des réglages : s'il manque un type ou un domaine, propose de l'ajouter dans « Ce workspace ».
4. Lance `python3 systeme/scripts/ranger.py <fichier> --essai`, regarde où il va, puis relance sans `--essai`. S'il refuse, lis sa raison : corrige l'en-tête, ou pose la question.
5. Si l'élément ouvre un nouveau dossier dans un domaine, ajoute-le au routeur du domaine. Une image qui a suivi sa fiche a besoin de sa ligne dans `_images.md`.

## Quand tu hésites
- En discussion : une seule question, avec ta proposition.
- Sans discussion (la routine de nuit) : ne devine jamais. Laisse l'élément où il est, et ajoute une question à `bureau/questions.md`, dans ce format (la première ligne reste une seule ligne de liste ; les trois suivantes sont des paragraphes indentés de deux espaces, séparés par une ligne vide) :

  ```
  - AAAA-MM-JJ · <chemin> · <la question> · proposition : <ta proposition>

    Contexte : <une ou deux phrases simples : ce qu'est l'élément, et pourquoi tu bloques>

    Choix : <choix 1> | <choix 2> | <choix 3>

    Réponse :
  ```

  - La question : une phrase courte, en mots simples, qui finit par « ? » et qu'on comprend sans ouvrir l'élément. Pas de jargon ni de chemin dans la question : le chemin est juste avant.
  - Les choix : deux à quatre réponses possibles, chacune en quelques mots, qui disent ce que tu feras (« Ranger dans savoir/ comme source », « Laisser dans l'inbox »).
  - La proposition : le choix que tu conseilles. Sans réponse après 14 jours, le rangement l'applique seul si elle se défait.
  - « Réponse : » reste vide : l'utilisateur y écrit sa réponse, dans le fichier.

## Les questions en attente
« Réponds aux questions du rangement » :
- Une question dont la « Réponse : » est remplie : applique la réponse sans la reposer (range l'élément, ou fais ce qui est écrit), puis retire la question entière (sa ligne et ses paragraphes).
- Une question sans réponse : pose-la avec ta proposition, range l'élément, puis retire la question. Une réponse « plus tard » la laisse en place.
- Une ancienne question sur une seule ligne, sans paragraphes : traite-la comme une question sans réponse.

## Garde-fous
- Ne modifie jamais le corps d'un fichier ; ne supprime rien.
- Une vidéo ou un son ne reste jamais dans le dépôt : sans dossier des fichiers lourds réglé (`FICHIERS_LOURDS` dans `.env`), c'est une question pour l'utilisateur. Ne lis pas `.env` : `ranger.py` le fait.
- Range un élément à la fois, et vérifie chaque fois le message de `ranger.py`.

## Journal des changements
- 2026-10-23 · création · ranger, c'est mettre les bonnes métadonnées ; la place s'en déduit
- 2026-11-14 · un fichier signalé « pas à sa place » : chercher d'abord un doublon (on fusionne) ou un dossier-objet sans fiche (on l'écrit) · les mêmes alertes revenaient chaque jour sans que personne ne tranche
- 2026-11-14 · des questions plus claires (une question simple, le contexte, les choix) et un champ « Réponse : » ; une réponse écrite s'applique sans être reposée · une question d'une ligne, avec un chemin et du jargon, ne se comprenait pas sans ouvrir l'élément

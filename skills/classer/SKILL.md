---
name: classer
description: Range un élément en lui donnant les bonnes métadonnées (type, domaine, statut, résumé, projet) ; sa place s'en déduit, et systeme/scripts/ranger.py l'y déplace. Sert pour un fichier de l'inbox, un fichier mal rangé, une fiche qu'on vient d'écrire, et les questions en attente du rangement. Déclencheurs : « classe ça », « range ce fichier », « où va ce fichier », « réponds aux questions du rangement ».
---
# classer

Ranger, c'est mettre les bonnes métadonnées : la place s'en déduit. Tu ne touches jamais au contenu, seulement à l'en-tête et à l'emplacement.

## Étapes
1. Lis `systeme/metadonnees.md` : les domaines, les types et leur chemin, les statuts, les champs.
2. Regarde ce qu'est l'élément :
   - un document texte déjà écrit : il reçoit l'en-tête (étape 3) ;
   - du texte brut, un lien, un PDF, une vidéo, un son : il lui faut d'abord une fiche ; lance `fiche`, qui te rend la main ;
   - une image : choisis le dossier qui s'en sert, déplace-la, écris sa ligne dans le `_images.md` de ce dossier (gabarit `systeme/gabarits/images.md`). C'est fini.
3. Choisis chaque champ dans les réglages : le type, le domaine, le statut (celui de départ si rien ne dit mieux), un résumé d'une ligne, le projet s'il en sert un (`projets/`), `cree` (la date de l'élément, sinon aujourd'hui), `maj`, et `source` pour une capture. Rien hors des réglages : s'il manque un type ou un domaine, propose de l'ajouter dans « Ce workspace ».
4. Lance `python3 systeme/scripts/ranger.py <fichier> --essai`, regarde où il va, puis relance sans `--essai`. S'il refuse, lis sa raison : corrige l'en-tête, ou pose la question.
5. Si l'élément ouvre un nouveau dossier dans un domaine, ajoute-le au routeur du domaine. Une image qui a suivi sa fiche a besoin de sa ligne dans `_images.md`.

## Quand tu hésites
- En discussion : une seule question, avec ta proposition.
- Sans discussion (la routine de nuit) : ne devine jamais. Laisse l'élément où il est, et ajoute une ligne à `outbox/questions.md` : `- AAAA-MM-JJ · <chemin> · <ta question> · proposition : <type, domaine, projet>`.

## Les questions en attente
« Réponds aux questions du rangement » : pour chaque ligne de `outbox/questions.md`, pose la question avec ta proposition, range l'élément, puis retire la ligne. Une réponse « plus tard » laisse la ligne.

## Garde-fous
- Ne modifie jamais le corps d'un fichier ; ne supprime rien.
- Une vidéo ou un son ne reste jamais dans le dépôt : sans dossier des fichiers lourds réglé (`FICHIERS_LOURDS` dans `.env`), c'est une question pour l'utilisateur. Ne lis pas `.env` : `ranger.py` le fait.
- Range un élément à la fois, et vérifie chaque fois le message de `ranger.py`.

## Journal des changements
- 2026-10-23 · création · ranger, c'est mettre les bonnes métadonnées ; la place s'en déduit

---
name: fiche
description: Écrit une fiche à partir de ce que l'utilisateur donne (texte brut, dictée, note, lien), ou pour décrire un fichier qui ne peut pas porter d'en-tête (PDF, vidéo, son), puis la passe à classer pour la ranger. Déclencheurs : « fais-en une fiche », « note ça », « garde ça », « crée une fiche », une ligne de inbox/capture.md.
---
# fiche

Créer, pas ranger : tu écris le contenu, puis `classer` s'occupe de l'en-tête et de la place.

## Étapes
1. Un sujet, une fiche. Si l'entrée en mélange plusieurs (une dictée qui part dans tous les sens), fais une fiche par sujet.
2. Choisis le type dans `systeme/metadonnees.md`. Si `systeme/gabarits/<type>.md` existe, suis-le ; sinon, `systeme/gabarits/fiche.md`.
3. Écris le corps :
   - un titre clair ;
   - le contenu, dans les mots de l'utilisateur : tu mets de l'ordre, tu ne réécris pas ;
   - « D'où ça vient » : la date et la source (dictée, e-mail, lien). Pour un lien : l'adresse, et ce que dit la page en trois lignes.
4. Un fichier qui ne peut pas porter d'en-tête (PDF, vidéo, son) : la fiche prend son nom (`contrat-x.md` pour `contrat-x.pdf`), à côté de lui, et lui sert d'index : ce que c'est, un résumé, ce qu'on en tire. Pour une vidéo ou un son, résume depuis la transcription si elle existe ; sinon, dis-le. Le fichier partira avec sa fiche.
5. Le texte brut d'origine (un `.txt`, une note sans en-tête, une dictée) part dans `archives/inbox/AAAA-MM/`. Une ligne de `inbox/capture.md` : ajoute-la à `archives/inbox/AAAA-MM/capture.md` et retire-la de la capture.
6. Lance `classer` sur la fiche.

## Garde-fous
- Une fiche courte et fidèle vaut mieux qu'une fiche longue : n'invente rien, ne remplis pas.
- Ne jette jamais l'original : il est archivé (texte brut) ou rangé avec sa fiche (fichier décrit).

## Journal des changements
- 2026-10-23 · création · séparer la création d'une fiche de son rangement

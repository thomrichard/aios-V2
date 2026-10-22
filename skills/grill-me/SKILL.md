---
name: grill-me
description: Entretien serré, une question à la fois, pour faire sortir ce que l'utilisateur sait et le ranger au bon endroit. Prend soit une liste de questions imposées (par exemple celle de la skill installation), soit un sujet à creuser. Déclencheurs : « grill me », « grille-moi », « pose-moi des questions », « éprouve ce plan ».
---
# grill-me

## Deux façons de l'appeler
- Avec une liste : une autre skill lui passe un fichier de questions (ex. `skills/installation/references/questions.md`). Pose-les toutes, dans l'ordre.
- Sur un sujet : pose tes propres questions, de la plus large à la plus précise, jusqu'à ce que l'utilisateur dise stop ou que tu n'apprennes plus rien.

## Pour chaque question
1. Une seule question à la fois : pas de liste, pas de question double.
2. Si la réponse est floue, relance une fois (« concrètement ? », « un exemple ? », « combien ? »).
3. Reformule la réponse en une ligne et fais-la valider.
4. Enregistre-la tout de suite dans la fiche de l'entretien, avant la question suivante.

## La fiche de l'entretien
- `journal/entretiens/AAAA-MM-JJ-<sujet>.md`, avec un en-tête (gabarit `systeme/gabarits/fiche.md`, type `entretien`).
- Une ligne par question : la question, la réponse validée, et son étiquette `confirmé` ou `provisoire`.
- Reprenable : après une interruption, reprends à la première question sans réponse.

## Ranger les réponses
- Seules les réponses `confirmé` quittent la fiche, là où elles font foi : la colonne « Où l'écrire » de la liste imposée, ou `systeme/doctrine.md` pour un sujet libre.
- Chaque réponse rangée garde un lien vers la fiche de l'entretien.
- Les réponses `provisoire` restent dans la fiche ; elles reviennent dans le point du jour.

## Garde-fous
- Ne suggère pas la réponse dans la question.
- Ne mélange jamais un fait confirmé et une suggestion de ta part.
- Ne demande jamais une clé ou un mot de passe.

## Journal des changements
- 2026-10-22 · création · entretien une question à la fois, avec liste imposée ou sujet libre

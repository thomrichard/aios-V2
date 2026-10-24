---
name: idees
description: Gère les idées « un jour, peut-être », ces envies à creuser un jour, sans engagement. Note une idée sans poser de question, la creuse à la demande, la fait ressortir quand un sujet proche démarre, trie les plus vieilles en un lot, et lance en projet celles qui mûrissent. Déclencheurs : « note cette idée », « j'ai une idée », « un jour j'aimerais », « creuse cette idée », « tri des idées », « lance cette idée ».
---
# idees

Une idée, c'est une envie à creuser un jour, sans engagement. Elle ne change jamais de place : seul son statut bouge (`notee`, `en-reflexion`, `lancee`, `abandonnee`). Toutes les idées, tous domaines confondus : `vues/idee.md`.

## Noter
1. **Le test**, dans l'ordre :
   - ça nourrit quelque chose qui existe ou qui revient (un contenu, un projet actif, une offre) → ce n'est pas une idée : un `sujet` ou une tâche, là-bas ;
   - l'utilisateur veut s'y mettre maintenant, avec une prochaine étape → c'est un projet ;
   - sinon, c'est une idée. Dans le doute, une seule question.
2. **La fiche**, avec `fiche` : type `idee`, statut `notee`, dans le domaine qui colle (`perso` pour ce qui n'est pas le travail). Le corps : l'idée dans ses mots, et d'où elle vient. Le champ `ressortir` : le contexte où la rappeler, pas une date, seulement s'il l'a dit. Puis `classer`.
3. Aucune autre question, et pas de filtre des objectifs : noter doit rester instantané.

## Creuser
« Creuse cette idée » : `grill-me` en court, 5 questions au plus. Les réponses vont dans la fiche de l'idée, sous « Ce qu'on en sait », pas dans `journal/entretiens/`. Finis par un « Point de reprise » et le champ `ressortir`. Statut `en-reflexion`.

## Faire ressortir
Quand un projet, un contenu ou une réflexion d'offre démarre, lis `vues/idee.md`. Si une idée vivante colle à sa colonne Ressortir, dis-le en une ligne. Pas plus.

## Trier
« Tri des idées » : dans `vues/idee.md`, les idées `notee` dont la date Maj a plus de 3 mois, en un seul lot. Pour chacune, l'utilisateur choisit : garder, abandonner (statut `abandonnee`, et le pourquoi en une ligne dans la fiche) ou lancer.

## Lancer
Statut `lancee`. Crée le projet (`projets/<slug>.md`, gabarit `systeme/gabarits/projet.md`), et ajoute `projet: <slug>` à l'en-tête de l'idée : la vue du projet la montre. La fiche reste à sa place.

## Garde-fous
- Le point du jour ne rappelle jamais les idées : elles ressortent quand un sujet proche démarre, pas chaque matin.
- Si le type `idee` manque dans `systeme/metadonnees.md`, dis-le et propose les lignes de `skills/installation/references/catalogue.md` (« Pour tout le monde : les idées »).
- Une idée ne se supprime pas : abandonnée, elle garde son pourquoi.
- Après chaque changement, relance `python3 systeme/scripts/index.py` : la vue suit.

## Journal des changements
- 2026-10-24 · création · garder les envies « un jour, peut-être » sans les perdre ni encombrer les projets

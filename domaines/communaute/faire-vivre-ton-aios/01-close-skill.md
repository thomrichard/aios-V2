---
type: support
resume: La skill CLOSE : pièce jointe de la leçon « /close : ne plus jamais perdre une session »
statut: publie
domaine: communaute
cree: 2026-07-21
maj: 2026-10-24
liens: [01-close-ne-plus-jamais-perdre-une-session.md]
---
---
name: close
description: Clôture la session en rangeant sur disque ce qui s'est dit, décidé et produit — journal, notes, mémoire — pour que le chat puisse disparaître sans rien perdre. Déclencheurs — "/close", "clôture la session", "on ferme", "range tout avant que je parte".
---

# Close — clôture de session

Objectif : après `/close`, le chat peut disparaître **sans aucune perte**.
Tout ce qui a de la valeur durable vit sur disque (tes notes, ta mémoire, git) ;
ce qui reste dans le chat est explicitement jetable.

## Étape 1 — Inventaire de session

Relire toute la session et dresser l'inventaire en 4 catégories :

1. **Décisions prises** — avec leur pourquoi (le pourquoi se perd plus vite que le quoi).
2. **Livrables produits** — fichiers créés/modifiés, textes, code, envois.
3. **Matière volatile** — tout ce qui n'existe QUE dans le chat : textes proposés,
   analyses, options écartées mais réfléchies. C'est ça qu'on perd d'habitude.
4. **Sujets ouverts** — ce qui reste à faire, et avec quoi reprendre.

Montrer l'inventaire en bref (5-8 lignes) avant d'écrire.

## Étape 2 — Écrire dans le système

1. **Matière volatile à valeur durable** → la ranger dans la note appropriée
   (en cas de doute : ta note de capture / inbox). Nom de fichier clair et parlant.
2. **Notes / projets touchés** → mettre à jour si l'état a changé (statut, décisions, suite).
3. **Journal de bord** → une ligne par chantier de la session, ajoutée à la fin,
   format `## [AAAA-MM-JJ] action | sujet` (date réelle via `date +%F`).

## Étape 3 — Mémoire persistante

Pour chaque fait durable **non déductible des notes ou du git** (une préférence, l'état
d'un projet, une décision de cap) → l'écrire dans ta mémoire.
Mettre à jour une entrée existante plutôt que dupliquer.
Ne PAS mémoriser ce que les notes ou l'historique git racontent déjà.

## Étape 4 — Checklist « rien n'est perdu »

- [ ] **Livrables promis en chat mais jamais écrits** → les écrire maintenant.
- [ ] **Process en arrière-plan** (serveurs, rendus, scripts lancés) → arrêter ou signaler.
- [ ] **Repos touchés** : `git status` → changements non commités → signaler,
      proposer un commit. Jamais de push sans accord explicite.
- [ ] **Sujets ouverts** → chacun a un point de reprise écrit quelque part, pas juste dans le chat.

## Étape 5 — Récap de clôture

5-10 lignes max :
- **Fait** : ce qui a été accompli.
- **Écrit où** : les chemins des fichiers touchés.
- **En attente** : ce qui tourne ou reste ouvert.
- **Point de reprise** : la phrase ou commande exacte pour reprendre chaque sujet ouvert.

## Garde-fous

- Le journal est **append-only** — jamais réécrire une entrée existante.
- Ne rien inventer : au moindre doute entre « décidé » et « exploré », marquer « exploré ».
- Session triviale (question/réponse sans production) → le dire en une ligne, ne rien créer.

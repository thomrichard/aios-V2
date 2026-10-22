# Décisions

Ajout seul. Pour chaque décision : la date, la décision, pourquoi.

## 2026-10-22 · Le socle d'AIOS v2

- **Airtable sort du système.** Tout vit dans le workspace.
- **Deux dossiers pour Thomas, `inbox/` et `outbox/`**, rangés chaque nuit à 2 h. Tout le reste est rangé pour l'IA.
- **Tout est rangé par domaine, livrables compris.** Un projet est un fichier d'index qui liste ses fichiers.
- **L'index porte l'information** (résumé, statut, projet, date), générée depuis l'en-tête de chaque fichier ; un dossier d'images a son `_images.md`.
- **`AGENTS.md` est la seule source** ; `CLAUDE.md` ne fait que l'importer ; les skills existent une fois, dans `skills/` ; la mémoire vit dans `memory/`. Pourquoi : passer d'un agent à l'autre sans rien réécrire.
- **Mémoire en souvenirs typés, références rangées dans les skills, bibliothèques partagées.**
- **Routines actives ou passives, chacune avec un plafond de coût**, lancées par un planificateur neutre et une commande unique.
- **`/note` et `/calibrate`**, avec un `feedback.md` par skill.
- **Le modèle d'une skill vit dans `systeme/modeles.md`**, pour en changer sans toucher à la skill.
- **Connexions dans l'ordre** : outil officiel, CLI, API, MCP.
- **Six domaines** : contenu, communaute, consulting, produits, operations, perso. Chaque revenu reste dans le domaine qui le produit ; la vue d'ensemble est dans `domaines/operations/revenus.md`.
- **On part de zéro**, et le socle reste neutre pour devenir le kit du Club SMART. Pourquoi : un seul système, d'abord éprouvé par Thomas, puis partagé.

## 2026-10-22 · AGENTS.md et l'installation

- **L'agent s'appelle R4.**
- **Une section Objectifs** : les trois cibles de l'année font foi dans `AGENTS.md`, avec un filtre (chaque proposition doit en rapprocher). Le détail du trimestre est dans `domaines/operations/okr.md`. Pourquoi : l'agent conseille en connaissant la finalité (Jay, CLAUDE.md, leçon C2).
- **Des règles de validation** : demander avant de supprimer, toucher un système externe, installer ou dépenser ; vérifier avant de dire « c'est fait » ; prévenir avant un gros travail.
- **Les quatre principes de Karpathy** : réfléchir avant d'agir, faire au plus simple, ne toucher que ce qui est demandé, viser un critère de réussite.
- **L'auto-amélioration** : l'agent propose d'ajouter une règle quand elle manque, et n'écrit qu'après accord.
- **Un ordre de recherche** : la carte, puis le routeur ou l'index, puis une recherche texte.
- **Le `CLAUDE.md` global de la machine reste vide.**
- **Une skill `installation`** pose des questions imposées qui remplissent `AGENTS.md` ; la doctrine dit qui met à jour chaque section, et quand.

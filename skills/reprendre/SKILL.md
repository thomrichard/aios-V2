---
name: reprendre
description: Remet une session à niveau sur un projet ou un sujet déjà commencé : retrouve sa fiche, ses décisions, son dernier point de reprise et ses tâches ouvertes, puis donne en quelques lignes où on en est et la prochaine action. L'autre moitié de close. Déclencheurs : « reprendre », « reprends <projet> », « on reprend <sujet> », « où on en était », « onboard ».
---
# reprendre

`close` écrit le point de reprise ; `reprendre` le relit. Une nouvelle session, ou une session lancée en parallèle, se met à niveau en une minute, sans tout réexpliquer.

## Étapes
1. **Trouve le sujet**, dans cet ordre, et arrête-toi dès qu'il est trouvé :
   - les projets actifs d'`AGENTS.md`, puis `projets/<slug>.md` ;
   - le routeur du domaine ;
   - les dernières lignes de `journal/log.md` ;
   - `journal/clotures/` et `journal/entretiens/` ;
   - les lignes « à reprendre » de `inbox/capture.md`, et `outbox/questions.md`.
   Plusieurs candidats : une seule question pour choisir. Rien : dis-le, et propose d'en faire un projet.
2. **Lis l'essentiel, pas tout :** la fiche du projet (statut, prochaine étape, tâches, fichiers) ; les décisions qui le concernent dans `journal/decisions.md` ; les dernières lignes du journal ; le dernier bilan de clôture, s'il existe. Les fichiers liés : leur en-tête d'abord, leur contenu seulement si la prochaine action en dépend.
3. **Donne le point, en 5 à 8 lignes :**
   - **Où on en est**, en une phrase ;
   - **Décidé** : les choix faits, et ce qu'on a écarté ;
   - **Ouvert** : les tâches et les questions qui restent ;
   - **Prochaine action** : une seule, concrète.
4. Propose de commencer par cette action. Si elle est floue, `align`.

## Garde-fous
- Ne refais pas une décision déjà prise : si quelque chose semble la contredire, signale-le, sans la changer.
- N'écris rien pendant la reprise : on lit. Ce qui change ensuite se range au fil du travail, puis avec `close`.
- Deux sauts au plus pour trouver le sujet. S'il a fallu chercher partout, propose d'ajouter la route qui manquait.

## Références
- D'après la skill `onboard` de Jay E | RoboNuggets (vidéo R62) : son fichier n'est pas public, celle-ci est réécrite pour l'AIOS, sur les projets et les points de reprise de `close`.

## Journal des changements
- 2026-10-23 · création · se remettre à niveau sans tout réexpliquer ; l'autre moitié de close

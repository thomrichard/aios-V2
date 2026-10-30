---
name: bilan
description: Clôt une session et écrit son bilan à valider : fait l'inventaire (décisions, livrables, ce qui n'existe que dans le chat, sujets ouverts), écrit tout à sa place (journal, fiches, projets, mémoire), fait de chaque sujet ouvert une tâche à reprendre, vérifie que rien ne traîne (Git, process lancés), puis écrit le bilan dans journal/clotures/ (statut a-valider), qui attend dans l'Outbox. Pour clore sans bilan : fermer. Déclencheurs : « bilan », « /bilan », « fais le bilan », « clôture la session », « close » (son ancien nom).
metadata:
  famille: sessions
---
# bilan

Après `bilan`, le chat peut disparaître sans aucune perte : ce qui a de la valeur vit sur le disque, le reste est jetable. On perd rarement la décision ; on perd le chemin : les options écartées, et pourquoi. Le bilan, lui, attend dans l'Outbox que l'utilisateur le relise et le valide.

`fermer` fait les parties 1 à 4, sans bilan : rien n'attend dans l'Outbox.

## 1. L'inventaire
Relis toute la session et trie en quatre, puis montre l'inventaire en 5 à 8 lignes avant d'écrire :
1. **Les décisions**, avec leur pourquoi et ce qu'on a écarté.
2. **Les livrables** : fichiers créés ou modifiés, textes, envois.
3. **Ce qui n'existe que dans le chat** : textes proposés, analyses, options réfléchies puis écartées.
4. **Les sujets ouverts** : ce qui reste à faire, et avec quoi reprendre.

## 2. Écrire à sa place
- Une décision d'un projet → la partie « Décisions » de sa fiche (ajout seul : date, décision, pourquoi, ce qu'on a écarté).
- Une règle, qui vaut pour tout le workspace → `journal/regles.md` (même forme).
- Ce qui n'existe que dans le chat et vaut d'être gardé → `fiche`, puis `classer`. Dans le doute, une ligne dans `inbox/capture.md`.
- Un livrable sans en-tête ou mal rangé → `classer`.
- Un projet touché → `projets/<slug>.md` : statut, prochaine étape, tâches, jalons, livrables.
- Le journal → une ligne par chantier dans `journal/log.md` : `- AAAA-MM-JJ · <action> | <sujet>` (date : `date +%F`).
- Un fait durable qu'on ne retrouverait ni dans les fichiers ni dans Git (une préférence, l'état d'un sujet) → `memory/`, et sa ligne dans `MEMORY.md`. Mets à jour un souvenir existant plutôt que d'en créer un double.

## 3. Chaque sujet ouvert devient une tâche à reprendre
- Il sert un projet → une tâche dans `## Tâches` de `projets/<slug>.md`, et sa prochaine étape à jour.
- Il mérite un projet (une fin, une prochaine étape) → propose de le créer.
- Sinon → une ligne dans `inbox/capture.md`, avec « consigne : à reprendre » et le point de reprise ; le rangement de nuit la range.

## 4. Rien ne traîne
- Un livrable promis dans le chat mais jamais écrit → écris-le maintenant.
- Un process lancé (serveur, rendu, script) → arrête-le, ou signale-le.
- `git status` : des changements non commités → signale-les et propose un commit. Jamais de push sans accord.

## 5. Le bilan, puis le récap
Écris le bilan dans `journal/clotures/<sujet>-AA-MM.md`, avec un en-tête de type `cloture` et `statut: a-valider` (gabarit : `systeme/gabarits/fiche.md`). Ses parties : **Périmètre** · **Réalisé** · **Décisions** · **Écrit où** (les chemins) · **Propositions non engagées** · **Limites** · **Point de reprise** (la phrase exacte pour reprendre chaque sujet ouvert, que `reprendre` relira). Il attend dans l'Outbox ; « Valider » le passe à `clos`.

Puis lance `python3 systeme/scripts/index.py`, puis `python3 systeme/scripts/verifier.py`, jusqu'à « Tout est en ordre ».

Le récap, dans le chat, en 5 à 10 lignes : **Fait** · **Écrit où** · **En attente** · **Point de reprise**, et le chemin du bilan. Si l'utilisateur t'a corrigé pendant la session, propose `calibrate`.

## Garde-fous
- Ne rien inventer : entre « décidé » et « exploré », dans le doute, écris « exploré ».
- Les journaux s'écrivent en ajout seul : ne réécris jamais une entrée.
- Ne touche pas aux règles d'`AGENTS.md` ni aux skills : c'est le travail de `calibrate`.
- Session sans production (une question, une réponse) : dis-le en une ligne, n'écris pas de bilan, et propose `fermer` la prochaine fois.
- Jamais dans une routine : il faut la session.

## Journal des changements
- 2026-10-23 · reprise de la skill close de Thomas Richard (classroom « Faire vivre ton AIOS »), adaptée à AIOS v2 : places du socle, sujets ouverts en tâches, bilan des sessions longues · que le chat puisse disparaître sans perte
- 2026-10-27 · règles et décisions · une décision vit dans la fiche de son projet, une règle dans journal/regles.md
- 2026-10-28 · jalons et livrables · la page Projets les lit dans la fiche du projet
- 2026-10-30 · close devient bilan ; le bilan s'écrit toujours, en a-valider, et attend dans l'Outbox ; fermer clôt sans bilan · l'Outbox ne montre plus que ce qui attend une validation

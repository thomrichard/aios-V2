---
name: bilan
description: Clôt une session et écrit son bilan à valider : fait l'inventaire (décisions, livrables, ce qui n'existe que dans le chat, sujets ouverts), écrit tout à sa place (journal, fiches, projets, mémoire), fait de chaque sujet ouvert une tâche à reprendre, vérifie que rien ne traîne (Git, process lancés), puis écrit le bilan dans la partie « Historique » de la fiche du projet, où seuls les 3 derniers restent. Pour clore sans bilan : fermer. Déclencheurs : « bilan », « /bilan », « fais le bilan », « clôture la session », « close » (son ancien nom).
metadata:
  famille: sessions
---
# bilan

Après `bilan`, le chat peut disparaître sans aucune perte : ce qui a de la valeur vit sur le disque, le reste est jetable. On perd rarement la décision ; on perd le chemin : les options écartées, et pourquoi. Le bilan ne fait pas un fichier de plus : il s'ajoute en tête de la partie « Historique » de la fiche du projet, et se valide dans le chat.

`fermer` fait les parties 1 à 4, sans bilan.

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
- Git : la sauvegarde de nuit enregistre le travail chaque jour, ne propose pas de commit en session. Si elle n'est pas en place (`systeme/routines.md`), dis-le en une ligne. Jamais de push sans accord.

## 5. Le bilan, puis le récap
Ajoute le bilan en tête de la partie `## Historique` de `projets/<slug>.md` (crée la partie en bas de la fiche si elle manque). Il tient en une entrée courte, sans recopier ce qui est déjà ailleurs dans la fiche (les décisions vont dans « Décisions », les tâches dans « Tâches ») :

```
### AAAA-MM-JJ · <sujet>
<ce qui est fait, en une ou deux phrases>
Écrit où : <les chemins>
Non engagé : <les propositions écartées ou en suspens, s'il y en a>
Point de reprise :
- « <la phrase exacte pour reprendre chaque sujet ouvert, que reprendre relira> »
```

- Seuls les 3 derniers bilans restent dans la fiche. Le plus ancien en trop part, tel quel, en tête de `archives/historique/<slug>.md` (en-tête de type `cloture`, `statut: clos`, à la création du fichier).
- Plusieurs projets touchés : une entrée dans chacun, chacune sur sa part.
- Aucun projet : pas d'historique ; la ligne de `journal/log.md` porte le sujet, et chaque point de reprise devient une ligne « à reprendre » de `inbox/capture.md` (partie 3).
- Montre l'entrée dans le chat : c'est là qu'elle se valide. Rien n'attend dans l'Outbox.

Puis lance `python3 systeme/scripts/index.py`, puis `python3 systeme/scripts/verifier.py`, jusqu'à « Tout est en ordre ».

Le récap, dans le chat, en 5 à 10 lignes : **Fait** · **Écrit où** · **En attente** · **Point de reprise**, et la fiche où le bilan s'est ajouté. Si l'utilisateur t'a corrigé pendant la session, propose `calibrate`.

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
- 2026-11-03 · plus de proposition de commit · les commits sont une sauvegarde quotidienne, pas un sujet de session
- 2026-11-07 · le bilan s'ajoute à la partie « Historique » de la fiche du projet, 3 au plus, les autres dans archives/historique/ ; plus de fichier dans journal/clotures/ · des bilans à part doublaient la fiche du projet dans la recherche

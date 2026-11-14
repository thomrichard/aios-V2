---
name: rangement
description: Le rangement de nuit (2 h du matin) : archive les vieux points du jour, vide l'inbox avec fiche et classer, met de côté ce qui demande une réponse dans outbox/questions.md, puis écrit le point du jour. Se lance sans discussion (systeme/scripts/lancer.py rangement) ou à la demande. Déclencheurs : « rangement », « range l'inbox », « vide l'inbox », « fais le point du jour ».
metadata:
  famille: ranger
---
# rangement

Tu tournes la nuit, seul : tu ne poses aucune question et tu ne devines rien. Ce qui demande une réponse attend dans `outbox/questions.md`, et l'utilisateur y répond dans la journée.

## Étapes
1. **L'outbox.** Déplace dans `archives/outbox/` les points du jour vieux de plus de 7 jours. Un fichier posé dans `outbox/` par erreur (hors `points/`, `index.html`, `questions.md`, `points-ouverts.md` et `ranges.md`) se traite comme un élément de l'inbox.
2. **Les questions.** Dans `outbox/questions.md` :
   - la « Réponse : » est remplie (l'utilisateur l'a écrite dans la journée) : applique la réponse avec `classer`, puis retire la question ;
   - sans réponse depuis plus de 14 jours (la date en tête de sa ligne) : applique sa proposition avec `classer`, si elle se défait (ranger, archiver, écrire une fiche, garder un texte tel quel), puis retire la question. Ne s'applique jamais seule une proposition qui supprime, installe, envoie, dépense, ou laisse l'élément dans l'inbox en attendant un geste de l'utilisateur : la question reste ;
   - les autres restent.
3. **L'inbox.** Pour chaque élément, sauf `capture.md` et ceux qui sont encore dans `outbox/questions.md` :
   - texte brut, lien, PDF, vidéo, son → `fiche`, puis `classer` ;
   - document texte déjà écrit, image → `classer`.
4. **La capture.** Chaque ligne de `inbox/capture.md` → `fiche` (suis la consigne écrite après « consigne : »), puis `classer`. Une ligne « à reprendre » reste en place : elle revient dans le point du jour quand son moment arrive.
5. Lance `python3 systeme/scripts/index.py`, puis `python3 systeme/scripts/verifier.py`.
6. **Le point du jour**, dans `outbox/points/AAAA-MM-JJ.md` (date : `date +%F`). Il se lit en une minute : on ne recopie pas le journal.
   - « Ce qui t'attend » : 5 lignes au plus, dans cet ordre. Ce qui est dû : les lignes « à reprendre » de `inbox/capture.md` dont la consigne donne un moment (une date, un mois) qui tombe aujourd'hui ou est passé, chacune avec son sujet en quelques mots et son point de reprise entre guillemets (une ligne sans date n'y va pas). Une routine en échec ou abandonnée. Une erreur du vérificateur : elle ne bloque plus la sauvegarde de nuit, elle doit donc se voir ici. Ce qu'une routine a produit seule pour l'utilisateur (un fichier en `a-valider` avec `source:`), avec son lien. Les questions en attente : leur nombre, le lien vers `outbox/questions.md`, et le jour où la plus vieille qui le peut s'appliquera seule. Au-delà de 5, la dernière ligne dit « et N autres ». Rien : « Rien ne t'attend. » ;
   - « Pour info » : une ligne par sujet, seulement s'il y a quelque chose. Rangé cette nuit : le nombre, et le lien de chaque élément. Les questions appliquées seules : laquelle, et ce qui a été fait. Les routines : le nombre de passages depuis le dernier point du jour (lignes `routine` de `journal/log.md`), et le nom de celles en échec. Validés par la nuit sans lecture : leur nombre. Les projets actifs : leur nombre (les fiches de `projets/` au statut `actif`), rien de plus : c'est l'utilisateur qui juge s'il y en a trop. Le vérificateur : le nombre d'alertes, sans le détail, et les « À définir » d'`AGENTS.md`.
   - Le détail reste dans `journal/log.md` et dans `python3 systeme/scripts/verifier.py`.
7. Ajoute une ligne à `journal/log.md` : `- AAAA-MM-JJ · processus rangement | <n> rangés, <n> réponses appliquées, <n> appliquées seules, <n> questions`.

## Garde-fous
- Aucune question, aucune supposition : dans le doute, une question dans `outbox/questions.md`, au format de la skill `classer` (question simple, contexte, choix, réponse vide), et tu passes au suivant.
- Ne supprime rien, ne réécris aucun contenu.
- Respecte le plafond de `systeme/routines.md` : s'il y a trop à faire, range les plus anciens d'abord et laisse le reste à la nuit suivante.

## Journal des changements
- 2026-10-23 · création · vider l'inbox sans deviner, et mettre les questions de côté pour la journée
- 2026-10-23 · rubrique « Routines » dans le point du jour · les routines directes laissent une ligne dans `journal/log.md`, le point du jour la reprend
- 2026-10-30 · `outbox/ranges.md` compte parmi les fichiers qui ont leur place dans `outbox/` · l'onglet Outbox y garde la trace des fichiers validés dans la journée ; la nuit ne le touche pas
- 2026-11-08 · rubrique « À reprendre aujourd'hui » dans le point du jour, et les lignes « à reprendre » de la capture restent en place · un rappel daté ne revenait nulle part le jour venu
- 2026-11-14 · le point du jour donne le nombre de projets actifs, et les erreurs du vérificateur avec ses alertes · treize projets ouverts sans que rien ne le montre ; une erreur ne bloque plus la sauvegarde, elle doit donc se voir ici
- 2026-11-14 · le point du jour tient en deux parties, « Ce qui t'attend » (5 lignes, triées) et « Pour info » ; plus de case « Lu » ni de journal recopié · la case n'était jamais cochée, et le journal brut noyait ce qui attendait
- 2026-11-14 · les questions répondues s'appliquent la nuit, avant l'inbox ; une question sans réponse depuis plus de 14 jours s'applique seule, si sa proposition se défait · des questions attendaient sans fin, et l'inbox avec elles

---
name: rangement
description: Le rangement de nuit (2 h du matin) : archive les vieux points du jour, vide l'inbox avec fiche et classer, met de côté ce qui demande une réponse dans outbox/questions.md, puis écrit le point du jour. Se lance sans discussion (systeme/scripts/lancer.py rangement) ou à la demande. Déclencheurs : « rangement », « range l'inbox », « vide l'inbox », « fais le point du jour ».
---
# rangement

Tu tournes la nuit, seul : tu ne poses aucune question et tu ne devines rien. Ce qui demande une réponse attend dans `outbox/questions.md`, et l'utilisateur y répond dans la journée.

## Étapes
1. **L'outbox.** Déplace dans `archives/outbox/` les points du jour cochés (`- [x] Lu` en tête) ou vieux de plus de 7 jours. Un fichier posé dans `outbox/` par erreur (hors `points/`, `index.html` et `questions.md`) se traite comme un élément de l'inbox.
2. **L'inbox.** Pour chaque élément, sauf `capture.md` et ceux qui sont déjà dans `outbox/questions.md` :
   - texte brut, lien, PDF, vidéo, son → `fiche`, puis `classer` ;
   - document texte déjà écrit, image → `classer`.
3. **La capture.** Chaque ligne de `inbox/capture.md` → `fiche` (suis la consigne écrite après « consigne : »), puis `classer`.
4. Lance `python3 systeme/scripts/index.py`, puis `python3 systeme/scripts/verifier.py`.
5. **Le point du jour**, dans `outbox/points/AAAA-MM-JJ.md` (date : `date +%F`) :
   - en tête, `- [ ] Lu` ;
   - « Rangé cette nuit » : une ligne par élément, avec son lien ;
   - « Questions en attente » : leur nombre, et le lien vers `outbox/questions.md` ;
   - « À regarder » : les alertes du vérificateur, et les « À définir » d'`AGENTS.md` ;
   - s'il n'y a rien, une seule ligne : « Rien à signaler. »
6. Ajoute une ligne à `journal/log.md` : `- AAAA-MM-JJ · processus rangement | <n> rangés, <n> questions`.

## Garde-fous
- Aucune question, aucune supposition : dans le doute, une ligne dans `outbox/questions.md`, et tu passes au suivant.
- Ne supprime rien, ne réécris aucun contenu.
- Respecte le plafond de `systeme/routines.md` : s'il y a trop à faire, range les plus anciens d'abord et laisse le reste à la nuit suivante.

## Journal des changements
- 2026-10-23 · création · vider l'inbox sans deviner, et mettre les questions de côté pour la journée

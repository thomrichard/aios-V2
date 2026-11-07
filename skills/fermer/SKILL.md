---
name: fermer
description: Clôt une session sans bilan : fait l'inventaire, écrit tout à sa place, fait de chaque sujet ouvert une tâche à reprendre et vérifie que rien ne traîne, comme bilan, mais n'écrit aucun bilan : rien ne s'ajoute à l'historique du projet. Pour une session qui mérite un bilan à relire : bilan. Déclencheurs : « fermer », « /fermer », « on ferme », « ferme sans bilan ».
metadata:
  famille: sessions
---
# fermer

La fin d'une discussion ordinaire : tout ce qui compte est écrit à sa place, mais il n'y a rien à relire ni à valider.

1. Suis les parties 1 à 4 de `skills/bilan/SKILL.md` (l'inventaire, écrire à sa place, les sujets ouverts en tâches, rien ne traîne), avec ses garde-fous.
2. N'ajoute pas de bilan à la partie « Historique » de la fiche du projet : c'est ce qui sépare `fermer` de `bilan`.
3. Lance `python3 systeme/scripts/index.py`, puis `python3 systeme/scripts/verifier.py`, jusqu'à « Tout est en ordre ».
4. Le récap, dans le chat, en 3 à 6 lignes : **Fait** · **Écrit où** · **Point de reprise**.

Session sans production (une question, une réponse) : dis-le en une ligne, n'écris rien.

## Journal des changements
- 2026-10-30 · création · clore une session ordinaire sans bilan à valider ; bilan garde le bilan pour les sessions qui en valent la peine
- 2026-11-07 · le bilan vit dans la fiche du projet · journal/clotures/ n'existe plus

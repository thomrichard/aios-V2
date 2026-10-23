# Modèles

Le modèle ne vit pas dans la skill. Changer de modèle, c'est changer une ligne ici.
`systeme/scripts/lancer.py` lit les deux tableaux. On peut forcer un modèle : `lancer.py <skill> --modele <nom>`.

## Niveau de chaque skill

Une skill absente de ce tableau prend le niveau `moyen`.

| Skill | Niveau | Effort |
|---|---|---|
| rangement | moyen | moyen |
| classer | moyen | moyen |
| fiche | moyen | moyen |
| note | petit | bas |
| calibrate | moyen | moyen |
| audit | grand | haut |
| installation | moyen | moyen |
| grill-me | moyen | moyen |

L'effort est indicatif : `lancer.py` ne le transmet pas encore à l'agent.

## Modèle de chaque niveau, par agent

| Niveau | claude | codex | gemini |
|---|---|---|---|
| petit | haiku | à remplir | à remplir |
| moyen | sonnet | à remplir | à remplir |
| grand | opus | à remplir | à remplir |

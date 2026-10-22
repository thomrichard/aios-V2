# Routines

Une routine = un prompt qui appelle une skill, lancé par `systeme/scripts/lancer.py <skill>` depuis un planificateur neutre.
Une routine active te remet quelque chose à lire ; une routine passive ne remonte dans le point du jour que ce qui mérite ton attention.

Planificateur : à choisir (serveur avec cron, Hermes, GitHub Actions).

| Routine | Skill | Quand | Cron | Type | Plafond par semaine | État |
|---|---|---|---|---|---|---|
| Rangement de nuit | `rangement` | chaque nuit, 2 h | `0 2 * * *` | active : le point du jour | à fixer | à construire |
| Veille (exemple) | `veille` | lundi, 1 h | `0 1 * * 1` | passive | à fixer | à construire |
| Audit | `audit` | le 1er du mois, 1 h | `0 1 1 * *` | passive | à fixer | à construire |

État : `à construire`, `en place` ou `à la demande`. La colonne Cron sert au planificateur et à l'interface (`interface/snapshots/routines.json`, générée).

Les routines passives tournent à 1 h, pour que le point du jour de 2 h reprenne leurs résultats.
Une routine de capture (la veille) dépose ce qu'elle trouve dans `inbox/`, avec `source:` dans l'en-tête ; le rangement de 2 h le classe ou l'archive, et le point du jour ne garde que ce qui compte.
Au-delà de son plafond, une routine est allégée.

## Exemple de ligne cron

```
0 2 * * * cd /chemin/vers/aios-v2 && python3 systeme/scripts/lancer.py rangement
```

# Routines

Une routine = un prompt qui appelle une skill, lancé par `systeme/scripts/lancer.py <skill>` depuis un planificateur neutre.
Une routine directe lance sa commande sans IA : `systeme/scripts/lancer.py <routine>` (son nom en minuscules, avec des tirets) exécute la colonne Commande. À préférer quand il n'y a rien à juger.
Une routine active te remet quelque chose à lire ; une routine passive ne remonte dans le point du jour que ce qui mérite ton attention.

Planificateur : à choisir (serveur avec cron, launchd sur Mac, Hermes, GitHub Actions). Sur Mac, une routine en place a son fichier `~/Library/LaunchAgents/com.sm4rt.<routine>.plist`.

| Routine | Skill | Commande | Quand | Cron | Type | Plafond par semaine | État |
|---|---|---|---|---|---|---|---|
| Rangement de nuit | `rangement` | — | chaque nuit, 2 h | `0 2 * * *` | active : le point du jour | 20 éléments par nuit | à construire |
| Veille (exemple) | `veille` | — | lundi, 1 h | `0 1 * * 1` | passive | à fixer | à construire |
| Fiches YouTube | — | `python3 systeme/scripts/youtube.py fiches --maj && python3 systeme/scripts/index.py` | dimanche et jeudi, 1 h | `0 1 * * 0,4` | exemple · directe, passive : met à jour les fiches vidéo de `domaines/contenu/` | sans IA | à construire |
| Sauvegarde de nuit | — | `git add -A; git commit -q -m "Sauvegarde de nuit"; git push -q prive main` | chaque nuit, 3 h | `0 3 * * *` | directe, passive : envoie le travail du jour vers prive | sans IA | à construire |
| Audit | `audit` | — | le 1er du mois, 1 h | `0 1 1 * *` | passive | à fixer | à construire |

État : `à construire`, `en place` ou `à la demande`. La colonne Cron sert au planificateur et à l'interface (`interface/snapshots/routines.json`, générée).

Les routines passives tournent à 1 h, pour que le point du jour de 2 h reprenne leurs résultats.
Une routine de capture (la veille) dépose ce qu'elle trouve dans `inbox/`, avec `source:` dans l'en-tête ; le rangement de 2 h le classe ou l'archive, et le point du jour ne garde que ce qui compte.
Au-delà de son plafond, une routine est allégée : le rangement range les plus anciens d'abord et laisse le reste à la nuit suivante.
La sauvegarde de nuit, après le rangement, committe le travail du jour et le pousse vers `prive`, ton dépôt privé (jamais vers `socle`). La mettre en place vaut accord pour ce push ; si le vérificateur bloque le commit, seuls les commits déjà faits partent. Pas de `|` dans une commande : il casserait le tableau.

## Exemple de ligne cron

```
0 2 * * * cd /chemin/vers/aios-v2 && python3 systeme/scripts/lancer.py rangement
0 1 * * 0,4 cd /chemin/vers/aios-v2 && python3 systeme/scripts/lancer.py fiches-youtube
```

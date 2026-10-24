# Routines

Une routine = un prompt qui appelle une skill, lancé par `systeme/scripts/lancer.py <skill>` depuis un planificateur neutre.
Une routine directe lance sa commande sans IA : `systeme/scripts/lancer.py <routine>` (son nom en minuscules, avec des tirets) exécute la colonne Commande. À préférer quand il n'y a rien à juger.
Une routine active te remet quelque chose à lire ; une routine passive ne remonte dans le point du jour que ce qui mérite ton attention.

Planificateur : à choisir (serveur avec cron, launchd sur Mac, Hermes, GitHub Actions). Sur Mac, une routine en place a son fichier `~/Library/LaunchAgents/com.sm4rt.<routine>.plist`.

| Routine | Skill | Commande | Quand | Cron | Type | Plafond par semaine | État |
|---|---|---|---|---|---|---|---|
| Rangement de nuit | `rangement` | — | chaque nuit, 2 h | `0 2 * * *` | active : le point du jour | à fixer | en place |
| Veille | `veille` | — | lundi, 1 h | `0 1 * * 1` | passive : dépose ses captures dans `inbox/` | à fixer | à construire |
| Stats YouTube | `stats-youtube` | — | lundi, 1 h | `0 1 * * 1` | passive : signale une vidéo qui décroche ou surperforme | à fixer | à construire |
| Fiches YouTube | — | `python3 systeme/scripts/youtube.py fiches --maj && python3 systeme/scripts/index.py` | dimanche et jeudi, 1 h | `0 1 * * 0,4` | directe, passive : met à jour les fiches vidéo de `domaines/contenu/` | sans IA | en place |
| Audit | `audit` | — | le 1er du mois, 1 h | `0 1 1 * *` | passive | à fixer | à construire |
| Jeton Skool | — | `bash ~/Dev/skool-toolkit/routines/skool.sh jeton` | chaque jour, 8 h 37 | `37 8 * * *` | directe, passive : renouvelle le jeton WAF de Skool s'il a expiré, prévient à J-7 de la fin de session | sans IA | en place |
| Revenus Skool | — | `bash ~/Dev/skool-toolkit/routines/skool.sh revenus` | le 2 du mois, 1 h | `0 1 2 * *` | directe, passive : refait `domaines/communaute/revenus-club-smart.md` et la ligne Club SMART de `domaines/operations/revenus.md` | sans IA | en place |

État : `à construire`, `en place` ou `à la demande`. La colonne Cron sert au planificateur et à l'interface (`interface/snapshots/routines.json`, générée).

Les routines passives tournent à 1 h, pour que le point du jour de 2 h reprenne leurs résultats. Exception : Jeton Skool, à 8 h 37 comme avant la migration ; le point du jour du lendemain la reprend.
Une routine directe peut laisser une ligne dans `journal/log.md` : `- AAAA-MM-JJ · routine <routine> | <résumé>`. Le point du jour la reprend.
Une routine de capture (la veille) dépose ce qu'elle trouve dans `inbox/`, avec `source:` dans l'en-tête ; le rangement de 2 h le classe ou l'archive, et le point du jour ne garde que ce qui compte.
Au-delà de son plafond, une routine est allégée : le rangement range les plus anciens d'abord et laisse le reste à la nuit suivante.
La sauvegarde de nuit, après le rangement, committe le travail du jour et le pousse vers `prive`, ton dépôt privé (jamais vers `socle`). La mettre en place vaut accord pour ce push ; si le vérificateur bloque le commit, seuls les commits déjà faits partent. Pas de `|` dans une commande : il casserait le tableau.

## Exemple de ligne cron

```
0 2 * * * cd /chemin/vers/aios-v2 && python3 systeme/scripts/lancer.py rangement
0 1 * * 0,4 cd /chemin/vers/aios-v2 && python3 systeme/scripts/lancer.py fiches-youtube
```

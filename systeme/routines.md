# Routines

Une routine = un prompt qui appelle une skill, lancé par `systeme/scripts/lancer.py <skill>` depuis un planificateur neutre.
Une routine directe lance sa commande sans IA : `systeme/scripts/lancer.py <routine>` (son nom en minuscules, avec des tirets) exécute la colonne Commande. À préférer quand il n'y a rien à juger.
Une routine active te remet quelque chose à lire ; une routine passive ne remonte dans le point du jour que ce qui mérite ton attention.

Mettre en place : `python3 systeme/scripts/routines.py installer <routine>` (ou `--toutes`) ; `etat` dit ce qui est en place, `retirer` l'enlève. Sur Mac, une routine en place a son fichier `~/Library/LaunchAgents/com.sm4rt.<routine>.plist` ; sous Linux, une ligne dans ta crontab. L'outil passe son état à « en place » ou « à construire » dans le tableau. Un autre planificateur (un serveur, Hermes, GitHub Actions) lance la même commande : `python3 systeme/scripts/lancer.py <routine>`.
Un Mac qui dort ne lance rien : la routine part au réveil. `systeme/scripts/interface.py installer` garde le Mac éveillé tant qu'il est sur secteur (`caffeinate -s`) ; sur batterie, il peut dormir.

| Routine | Skill | Commande | Quand | Cron | Type | Plafond par semaine | État |
|---|---|---|---|---|---|---|---|
| Rangement de nuit | `rangement` | — | chaque nuit, 2 h | `0 2 * * *` | active : le point du jour | 20 éléments par nuit | à construire |
| Validation de nuit | — | `python3 systeme/scripts/valider.py --jours 3 && python3 systeme/scripts/index.py` | chaque nuit, 1 h | `0 1 * * *` | directe, passive : valide seul ce qui attend dans l'Outbox depuis plus de 3 jours (statut de fin, le fichier ne bouge pas) | sans IA | à construire |
| Sauvegarde de nuit | — | `git add -A; git commit -q -m "Sauvegarde de nuit"; git push -q prive main` | chaque nuit, 3 h | `0 3 * * *` | directe, passive : envoie le travail du jour vers prive | sans IA | à construire |

État : `à construire`, `en place`, `en pause` (lancer.py ne lance rien) ou `à la demande`. Chaque passage laisse une ligne dans `journal/routines.jsonl` (début, fin, code, agent, modèle, fin de la sortie ; pour claude, tokens et coût au tarif de l'API) : l'onglet Routines de l'interface la lit. La colonne Cron sert au planificateur et à l'interface (`interface/snapshots/routines.json`, générée).

Les routines passives tournent à 1 h, pour que le point du jour de 2 h reprenne leurs résultats.
Une routine directe peut laisser une ligne dans `journal/log.md` : `- AAAA-MM-JJ · routine <routine> | <résumé>`. Le point du jour la reprend.
Une routine de capture (la veille) dépose ce qu'elle trouve dans `inbox/`, avec `source:` dans l'en-tête ; le rangement de 2 h le classe ou l'archive, et le point du jour ne garde que ce qui compte.
Au-delà de son plafond, une routine est allégée : le rangement range les plus anciens d'abord et laisse le reste à la nuit suivante.
La sauvegarde de nuit, après le rangement, committe le travail du jour et le pousse vers `prive`, ton dépôt privé (jamais vers `socle`). La mettre en place vaut accord pour ce push ; si le vérificateur bloque le commit, seuls les commits déjà faits partent. Pas de `|` dans une commande : il casserait le tableau.

## Exemple de ligne cron, pour un autre planificateur

```
0 2 * * * cd /chemin/vers/aios-v2 && python3 systeme/scripts/lancer.py rangement
```

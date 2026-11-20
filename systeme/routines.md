# Routines

Une routine = un prompt qui appelle une skill, lancé par `systeme/scripts/lancer.py <skill>` depuis un planificateur neutre.
Une routine directe lance sa commande sans IA : `systeme/scripts/lancer.py <routine>` (son nom en minuscules, avec des tirets) exécute la colonne Commande. À préférer quand il n'y a rien à juger.
Une routine active te remet quelque chose à lire ; une routine passive ne remonte dans le point du jour que ce qui mérite ton attention.

Mettre en place : `python3 systeme/scripts/routines.py installer <routine>` (ou `--toutes`) ; `etat` dit ce qui est en place, `retirer` l'enlève. Sur Mac, une routine en place a son fichier `~/Library/LaunchAgents/com.sm4rt.<routine>.plist` ; sous Linux, une ligne dans ta crontab. L'outil passe son état à « en place » ou « à construire » dans le tableau. Un autre planificateur (un serveur, Hermes, GitHub Actions) lance la même commande : `python3 systeme/scripts/lancer.py <routine>`.
Un Mac qui dort ne lance rien : la routine part au réveil. `systeme/scripts/interface.py installer` garde le Mac éveillé tant qu'il est sur secteur (`caffeinate -s`) ; sur batterie, il peut dormir.

| Routine | Skill | Commande | Quand | Cron | Type | Plafond par semaine | État |
|---|---|---|---|---|---|---|---|
| Rangement de nuit | `rangement` | — | chaque nuit, 2 h | `0 2 * * *` | active : le point du jour | 20 éléments par nuit | à construire |
| Validation de nuit | — | `python3 systeme/scripts/valider.py --jours 3 && python3 systeme/scripts/index.py` | chaque nuit, 1 h | `0 1 * * *` | directe, passive : valide seul ce qui attend dans l'Outbox depuis plus de 3 jours (statut de fin, le fichier ne bouge pas), marqué « nuit, non lu » dans `outbox/ranges.md` et dans le journal | sans IA | à construire |
| Points ouverts | — | `python3 systeme/scripts/points_ouverts.py` | chaque nuit, 1 h 30 | `30 1 * * *` | directe, passive : regroupe dans `outbox/points-ouverts.md` la prochaine étape de chaque projet, les points de reprise des derniers bilans et les alertes du vérificateur présentes depuis 3 jours ; l'agent les passe en revue en session | sans IA | à construire |
| Sauvegarde de nuit | — | `python3 systeme/scripts/verifier.py --sauvegarde && git add -A && if ! git diff --cached --quiet; then git commit -q --no-verify -m "Sauvegarde de nuit"; fi && if ! git pull -q --no-rebase --ff --no-edit prive main; then git merge --abort 2>/dev/null; false; fi && git push -q prive main` | chaque nuit, 3 h | `0 3 * * *` | directe, passive : récupère ce que tes autres machines ont envoyé, puis envoie le travail du jour vers prive | sans IA | à construire |
| Alerte des routines | — | `python3 systeme/scripts/alerte.py` | chaque jour, 8 h 15 | `15 8 * * *` | directe, passive : signale une routine « en place » dont le dernier passage a échoué (code différent de 0) ou qui n'a pas tourné alors que son cron le prévoyait (`journal/routines.jsonl`) ; notification sur Mac et ligne dans `journal/log.md`, que le point du jour reprend ; rien quand tout va bien. Un même problème n'est signalé qu'une fois, puis de nouveau après 3 jours | sans IA | à construire |

État : `à construire`, `en place`, `en pause` (lancer.py ne lance rien) ou `à la demande`. Chaque passage laisse une ligne dans `journal/routines.jsonl` (début, fin, code, agent, modèle, fin de la sortie ; pour claude, tokens et coût au tarif de l'API) : l'onglet Routines de l'interface la lit. La colonne Cron sert au planificateur et à l'interface (`interface/snapshots/routines.json`, générée).

Les routines passives tournent à 1 h, pour que le point du jour de 2 h reprenne leurs résultats.
Une routine directe peut laisser une ligne dans `journal/log.md` : `- AAAA-MM-JJ · routine <routine> | <résumé>`. Le point du jour la reprend.
Une routine de capture (la veille) dépose ce qu'elle trouve dans `inbox/`, avec `source:` dans l'en-tête ; le rangement de 2 h le classe ou l'archive, et le point du jour ne garde que ce qui compte.
Au-delà de son plafond, une routine est allégée : le rangement range les plus anciens d'abord et laisse le reste à la nuit suivante.
La sauvegarde de nuit, après le rangement, committe le travail du jour et le pousse vers `prive`, ton dépôt privé (jamais vers `socle`). La mettre en place vaut accord pour ce push ; elle passe même quand le vérificateur a une erreur de rangement (le commit se fait sans le contrôle d'avant commit, et l'erreur remonte dans le point du jour) : un travail mal rangé vaut mieux qu'un travail pas sauvegardé. Seul un fichier de plus de 50 Mo l'arrête (`verifier.py --sauvegarde`), parce que GitHub refuserait l'envoi : la routine sort en échec (code 1), rien ne part, et l'alerte des routines le signale le matin. Avant d'envoyer, elle récupère ce que tes autres machines (un serveur, un second ordinateur) ont envoyé sur `prive`, par une fusion qui ne réécrit rien : sans ça, GitHub refuserait l'envoi dès qu'une autre machine a envoyé. Si la fusion bute sur un conflit (la même ligne changée des deux côtés), elle l'annule, garde l'enregistrement de la nuit sur la machine, n'envoie rien et sort en échec : l'alerte des routines le signale le matin, et ton agent règle le conflit en session. Le `;` de `git merge --abort 2>/dev/null; false` est voulu : l'annulation faite, `false` fait sortir la routine en échec. Pas de `|` dans une commande : il casserait le tableau.
Une commande directe s'enchaîne avec `&&`, jamais avec `;` : avec `;`, seul le code de la dernière commande compte, et un échec passe pour un succès dans le journal.

## Services toujours allumés

Pas des routines : aucun horaire, le planificateur les garde allumés et les relance s'ils tombent (sur Mac, launchd avec `KeepAlive`, un fichier `~/Library/LaunchAgents/<étiquette>.plist` chacun). Ils n'apparaissent pas dans l'onglet Routines. Inscris ici tout serveur que tu laisses tourner : un service écrit nulle part est un service qu'on oublie.

| Service | Étiquette | Ce qu'il fait | Adresse |
|---|---|---|---|
| Interface | `com.sm4rt.interface` | sert l'interface (`interface/server.js`) et garde le Mac éveillé sur secteur (`caffeinate -s`) ; mise en place par `systeme/scripts/interface.py installer` | `http://localhost:50000` |

## Exemple de ligne cron, pour un autre planificateur

```
0 2 * * * cd /chemin/vers/aios-v2 && python3 systeme/scripts/lancer.py rangement
```

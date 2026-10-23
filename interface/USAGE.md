# USAGE.md - mesurer ce que tu utilises

Les onglets Skills, Applications et Routines dimensionnent chaque élément selon l'usage réel : exécutions de skills, tokens et $ API, exécutions de routines, appels d'apps et ouvertures d'apps locales, sur les 7 et les 30 derniers jours. La règle est simple : ce qui est mesuré affiche son chiffre, ce qui ne l'est pas affiche « non mesuré ». Rien n'est estimé ni inventé.

`node refresh/usage.mjs` calcule les chiffres (l'icône d'actualisation le lance aussi). Il ne lit que des fichiers de cet ordinateur et n'appelle aucun modèle. Trois sources, toutes en option :

## 1. Les journaux de session de ton agent (lus pour toi quand un lecteur existe)

- **Si ton agent est Claude Code :** ses journaux de session dans `~/.claude/projects/` sont lus pour toi, sous-agents compris. Une exécution de skill commence là où le journal montre le chargement de la skill, et dure jusqu'à la skill suivante ou jusqu'à ton prompt suivant. Une exécution de routine est une session lancée par une tâche planifiée. Chaque appel au modèle compte une seule fois, même quand une session reprise le recopie. Les appels d'outils aux serveurs MCP et les noms des commandes lancées par ton agent comptent pour tes apps. Des commandes, seuls les noms et les numéros de ports locaux sont gardés, jamais la commande complète ni le texte d'un message. La première lecture d'un gros dossier de journaux peut prendre une minute ; les suivantes utilisent un cache dans `data/usage-cache.json`. Le même lecteur lit aussi les tâches planifiées (`~/.claude/scheduled-tasks/` et les fichiers `scheduled-tasks.json` de l'app de bureau sous `%APPDATA%\Claude\claude-code-sessions` sous Windows, `~/Library/Application Support/Claude/claude-code-sessions` sous macOS, `~/.config/Claude/claude-code-sessions` sous Linux ; voir ROUTINES.md).
- **Pour couper ce lecteur** (tu n'es pas sur Claude Code, ou tu ne veux pas que ses tâches et ses journaux de session soient lus) : mets `"readers": { "claudeCode": false }` dans `os-config.json`. La valeur par défaut, `"auto"`, ne lit ces dossiers que s'ils existent.
- **Tout autre agent :** utilise le journal d'usage ci-dessous. Pour apprendre à l'OS à lire les journaux d'un autre agent, ajoute un lecteur dans `refresh/sources/` de la même façon.

## 2. Le journal d'usage : `snapshots/usage-log.jsonl`

Une ligne de JSON par événement, ajoutée par n'importe quel agent ou script. Ajoute ceci à tes instructions pour en faire une habitude, avec le chemin absolu du dossier de l'OS dans l'emplacement prévu :

> Quand tu termines une skill, une routine planifiée ou un appel à une de mes apps connectées, ajoute une ligne à <chemin-de-ton-os>/snapshots/usage-log.jsonl : {"at": "<heure ISO>", "kind": "skill" | "routine" | "app", "name": "<nom de la skill, id de la routine ou id de l'app>", "tokens": <si connu>, "cost": <en USD, si connu>}.

```
{"at":"2026-01-05T07:00:12Z","kind":"routine","name":"morning-digest","tokens":18400,"cost":0.05}
{"at":"2026-01-05T10:21:40Z","kind":"skill","name":"weekly-review","tokens":42100,"cost":0.12}
{"at":"2026-01-05T10:24:03Z","kind":"app","name":"app:github","calls":3}
```

- `name`, pour une skill, est son nom sans la barre oblique. Pour une routine, son `id` ou son `name` de ROUTINES.md. Pour une app, son `id` ou son `label` de `config/apps.json`.
- `tokens` et `cost` sont en option. Laisse-les de côté si ton agent ne peut pas les voir ; les exécutions comptent quand même.
- `calls` (apps) vaut 1 par défaut.
- Un exemple est livré : `snapshots/usage-log.example.jsonl`.

## 3. Les ouvertures d'apps locales (toujours actif)

Chaque clic sur une tuile des micro-apps passe par l'OS, qui écrit une ligne dans `data/app-opens.jsonl`. C'est comme ça que l'onglet Applications compte tes apps locales (celles que tu ajoutes), sans lire ton navigateur.

## Ce que montre chaque onglet

| Onglet | Mesuré | Non mesuré |
|---|---|---|
| Skills | exécutions, tokens, $ API par skill, sur 7 et 30 jours | chaque skill trouvée, avec l'étiquette « non mesuré » |
| Applications | appels par connexion, ouvertures par app locale | connexions avec l'étiquette « non mesuré » |
| Routines | exécutions, tokens, $ API par routine, sur les 7 derniers jours | « non mesuré » dans la ligne et dans le détail |

Les $ API, c'est ce que coûteraient les tokens mesurés au tarif standard de l'API (`refresh/sources/claude-code.cjs` contient les tarifs pour ce lecteur). Ce n'est pas ta facture d'abonnement.

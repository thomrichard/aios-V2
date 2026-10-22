# ROUTINES.md - lister tout ce qui tourne à heure fixe

Les routines s'affichent à trois endroits : le widget ROUTINES de la page d'accueil (les déclenchements du jour, avec un compte à rebours jusqu'au prochain), l'onglet Routines du second cerveau (une semaine du lundi au dimanche, avec chaque déclenchement), et le cercle doré des cartes 3D et 2D.

Elles viennent de deux types de sources.

## 1. Le planificateur de ton agent (lu pour toi quand un lecteur existe)

- **Si ton agent est Claude Code :** ses tâches planifiées sont lues pour toi. La liste des tâches vient de `~/.claude/scheduled-tasks/` (le `SKILL.md` de chaque tâche donne sa description). Les horaires viennent des fichiers `scheduled-tasks.json` de l'app de bureau, cherchés jusqu'à trois niveaux de dossiers sous `claude-code-sessions` : `%APPDATA%\Claude\claude-code-sessions` sous Windows, `~/Library/Application Support/Claude/claude-code-sessions` sous macOS, `~/.config/Claude/claude-code-sessions` sous Linux. Rien à installer.
- **Pour couper ce lecteur** (tu n'es pas sur Claude Code, ou tu ne veux pas que ces dossiers soient lus) : mets `"readers": { "claudeCode": false }` dans `os-config.json`. La valeur par défaut, `"auto"`, ne les lit que s'ils existent.
- **Tout autre agent :** écris ses routines dans le fichier de routines ci-dessous. Pour apprendre à l'OS à lire seul un autre planificateur, ajoute un lecteur dans `refresh/sources/` qui renvoie `{ key, label, routines: [...] }` et inscris-le dans `READERS`, dans `refresh/lib/sources.cjs`, avec son propre interrupteur sous `"readers"`.

## 2. Le fichier de routines : `snapshots/routines.json`

Un seul fichier simple, que n'importe quel agent ou planificateur peut écrire. Sers-toi de ce que tu sais des planificateurs de ton utilisateur (cron, Planificateur de tâches Windows, launchd, minuteurs systemd, un serveur, des tâches cloud, d'autres agents) pour le remplir, et mets-le à jour chaque fois qu'un horaire change. Un exemple de départ est livré : `snapshots/routines.example.json`.

```json
{
  "timezone": "",
  "sources": [
    { "key": "agent",  "label": "MON AGENT" },
    { "key": "server", "label": "SERVEUR MAISON" }
  ],
  "routines": [
    { "id": "morning-digest", "name": "Résumé du matin", "source": "agent",  "cron": "0 7 * * *", "desc": "Résumer mes e-mails et mon agenda" },
    { "id": "backup-sweep",   "name": "Sauvegarde",      "source": "server", "days": ["mon", "wed", "fri"], "times": ["18:30"], "desc": "Copier le workspace en sauvegarde" },
    { "id": "inbox-check",    "name": "Point e-mails",   "source": "agent",  "cron": "0 9-17 * * 1-5", "desc": "Toutes les heures pendant la journée de travail" },
    { "id": "weekly-review",  "name": "Revue hebdo",     "source": "agent",  "status": "ondemand", "desc": "Se lance quand je le demande" }
  ]
}
```

- `timezone` : un nom IANA, comme `Europe/London`. Vide veut dire le fuseau horaire de cet ordinateur.
- `sources` : n'importe quels noms, en n'importe quel nombre. L'étiquette s'affiche à côté de chaque routine et dans la légende du widget.
- Chaque routine a besoin d'un `name` et soit d'un `cron` (5 champs : minute, heure, jour du mois, mois, jour de la semaine), soit de `days` plus `times` (sur 24 heures). Une routine sans l'un ni l'autre est « à la demande ».
- `status` : `active` (par défaut quand elle a un horaire), `paused` ou `ondemand`. Les routines en pause et à la demande sont listées, mais pas placées sur la semaine.
- `id` garde la même routine reliée à ses chiffres d'usage (USAGE.md). Utilise des mots courts en minuscules, avec des tirets.

Les lignes de la v1 marchent toujours : un `snapshots/routines.json` de la v1 peut être recopié tel quel.

```json
{ "t": "07:00", "d": "daily", "src": "agent", "n": "résumé du matin", "desc": "..." }
```

(`d` vaut `daily`, des noms de jours comme `mon,thu`, ou `dom:1` pour un jour du mois.)

## Coûts et exécutions

L'onglet Routines affiche les exécutions, les tokens et les $ API de chaque routine sur les 7 derniers jours, seulement quand quelque chose les a mesurés (USAGE.md). Sinon, il affiche « non mesuré ». Rien n'est estimé.

## Le garder à jour

Ajoute une ligne à tes instructions, avec le chemin absolu du dossier de l'OS dans l'emplacement prévu : « Quand un horaire change, mets à jour <chemin-de-ton-os>/snapshots/routines.json. » Le widget de la page d'accueil le lit en moins d'une minute. L'onglet Routines le lit à chaque chargement de la page ou quand tu appuies sur l'icône d'actualisation, et la carte le prend en compte à cette actualisation.

## Pas encore de routines ?

Alors c'est le moment de t'y mettre. Un résumé du matin, un journal du soir, un rapport hebdo : chacun tient en une phrase à ton agent (« chaque jour à 7 h, fais X »). Commence par une seule. Une routine visible est une routine qui dure.

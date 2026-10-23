# API Skool : identifiants, commandes, opérations

## Club SMART

- Group ID : `bd1bdc9579a64181bbfe8bd266124c04`
- Slug : `club-smart`
- Classroom Boîte à outils : slug `ecf9b15e`, id interne `7360488dae72491a8ed48d9849138469`
- URL d'une leçon : `https://www.skool.com/club-smart/classroom/<slug de la classroom>?md=<id de la leçon>`

Libellés du fil. Un post sans libellé est refusé (HTTP 422).

| Libellé | Id |
|---|---|
| Discussion générale | `961bdcf22c35450fb48472237ad2d512` |
| Nouveautés | `db6f94842f90472990f95b0cb4f84ccc` |
| Ressources Youtubes | `acc852d28868431abdb6cf793841b2c5` |
| Weekly | `ed9da6e730e44795b3a3d0bb1d477d23` |
| Aide & Questions | `1d04213dac4b4ecda6147d96ec596636` |

## Deux surfaces

- `api2.skool.com` : le cookie suffit. Leçons, posts, commentaires, messages, stats.
- `www.skool.com/_next/data/{buildId}/...` : cookie et jeton WAF. La liste des membres, le fil, le calendrier, le classement. Le `buildId` change à chaque déploiement de Skool : relis-le toujours dans la page du groupe.

## Lecture avec la CLI

```bash
skool-pp-cli doctor                              # connexion
skool-pp-cli members list --agent                # membres actifs
skool-pp-cli classrooms list --agent             # classrooms
skool-pp-cli classrooms tree <slug> --agent      # arborescence d'une classroom
skool-pp-cli self list-groups --agent            # communautés du compte
skool-pp-cli groups admin-metrics --agent        # aussi : analytics, analytics-growth, analytics-overview, discovery
skool-pp-cli posts list-comments <post_id> --agent
skool-pp-cli which <besoin>                      # trouver la commande qui fait quelque chose
```

`--data-source live` force l'appel en direct ; par défaut, la CLI se rabat sur sa copie locale si Skool ne répond pas.

## Lecture avec les scripts

Dans `~/Dev/skool-toolkit/scripts/` (dépôt privé `thomrichard/skool-toolkit`), avec `python3` (3.11, qui a `tomllib` et `certifi`).

| Besoin | Commande |
|---|---|
| Tableau de bord (30 jours au plus) | `python3 skool_analytics.py --summary` |
| Un graphique précis | `python3 skool_analytics.py --type analytics-v2 --chart signups_by_day --summary` ; la liste : `--list-charts` |
| Progression d'un membre | `python3 skool_member_stats.py <member.id> --summary` (le `member.id`, pas le `user.id`) |
| Factures d'un membre | `python3 skool_member_stats.py <member.id> --invoices` |
| Taux de complétion par classroom | `python3 skool_member_stats.py --all --summary` (une centaine d'appels, environ 50 s) |
| Tout le fil et ses commentaires | `python3 skool_fetch_feed_comments.py --since AAAA-MM-JJ` (il trie aussi les commentaires qui ressemblent à un témoignage) |
| Chercher une leçon par son titre | `python3 skool_pin_post.py --search "Make"` |
| Départs : qui contacter, et avant quand | `python3 skool_churn_radar.py --jours 14` |
| Historique des messages avec un membre | `python3 skool_send_dm.py <user_id> --history` |
| Revenus du Club, mois par mois | `python3 skool_revenus.py --stdout` (sans écrire) ; `--mois AAAA-MM` pour le détail d'un mois |
| Jours restants avant la fin de la session Skool | `python3 skool_session.py` |

## Écriture : toujours après le oui de Thomas

| Opération | Comment |
|---|---|
| Créer un dossier dans une classroom | `POST /courses` avec `unit_type=set`, `parent_id=<classroom_id>`, `root_id=<classroom_id>`, puis `PUT /courses/{id}` avec le titre |
| Créer une leçon | `POST /courses` avec `unit_type=module`, `parent_id=<dossier ou classroom>` |
| Modifier une leçon | `PUT /courses/{id}` avec `{"title", "desc": "[v2]<prosemirror>", "video_link": "<url YouTube>"}` |
| Passer une leçon en brouillon, ou la republier | `PUT /courses/{id}/state?state=draft` (ou `published`), corps vide |
| Déplacer une leçon dans sa classroom | `POST /courses/{id}/update-parent?parent=<nouveau parent>`, corps vide |
| Marquer une leçon faite | `POST /courses/{id}/mark-done`, corps vide |
| Publier un post | `skool-pp-cli posts create`, ou `POST /posts?follow=true` (corps ci-dessous) |
| Modifier un post | `python3 skool_edit_post.py <post_id> --title "..." --content "..."` |
| Épingler un post sur une leçon | `python3 skool_pin_post.py <post_id> <lesson_id>` ; `--unpin` pour l'enlever |
| Envoyer un message privé | `python3 skool_send_dm.py <user_id> --message "..."` (le `user_id`, pas le `member.id`) |
| Messages en masse | `python3 skool_send_dm.py --bulk membres.json --message "..."` |

Corps d'un post :

```json
{"post_type": "generic", "group_id": "<group_id>",
 "metadata": {"title": "...", "content": "...", "attachments": "", "labels": "<id du libellé>",
              "action": 0, "video_ids": "", "video_links": "<url YouTube>"}}
```

`video_links` prend une URL YouTube ; `video_ids` sert aux vidéos téléversées sur Skool.

Conversion du texte : `md_to_prosemirror.py` (Markdown vers Skool) et `prosemirror_to_md.py` (Skool vers Markdown).

## Post tiré d'une leçon, épinglé sur une page de référence

1. Lis la leçon source : son `desc` (ProseMirror) et son `videoLink`.
2. Convertis le texte, puis écris le post avec `voix.md`.
3. Termine par le pied de post figé :
   ```
   —

   Retrouve toutes les infos et astuces sur <titre exact de la leçon> en allant sur ce lien : <URL de la leçon>
   ```
4. Après le oui : publie, puis épingle le post sur la leçon cible.

## Les scripts qui écrivent

| Script | Écrit | Quand |
|---|---|---|
| `skool_revenus.py` | `domaines/communaute/revenus-club-smart.md` et la ligne Club SMART de `domaines/operations/revenus.md` | le 2 du mois, routine « Revenus Skool » |
| `skool_churn_daily.py` | un brouillon par départ dans `~/Dev/skool-toolkit/relances/departs/`, poussé dans Gmail | à la main ; arrêté depuis le 2026-10-23, en attendant l'écran des abonnés |
| `skool_renouvellement_daily.py` | un brouillon par échéance dans `~/Dev/skool-toolkit/relances/echeances/` | à la main |

Les fiches de relance et l'état « déjà contacté » (`state/`) portent les e-mails des membres : ils restent dans le toolkit, hors de Git et hors du V2. Textes des relances : `relances.md`.

Les trois scripts de synchro avec l'ancien Vault sont dans `~/Dev/skool-toolkit/archives/` : ne les lance pas.

## Documentation complète

`~/Dev/skool-toolkit/docs/` : `API-REFERENCE.md`, `ARCHITECTURE.md`, `WORKFLOWS.md`, `AUTOMATION-MAKE-N8N.md`.

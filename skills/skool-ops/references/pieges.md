# Pièges connus de Skool

Chaque point a été vérifié par un test sur le Club SMART, à la date indiquée.

## Retirer une leçon : la passer en brouillon (2026-07-29)

`PUT /courses/{id}/state?state=draft`, avec un corps vide. La leçon disparaît pour les membres sans bouger de place. `?state=published` la remet en ligne.

- Rien n'est supprimé : l'id, les commentaires et la progression des membres restent.
- L'état vaut pour une seule leçon : une classroom publiée peut contenir des leçons en brouillon.
- Le corps doit être vide : `{}` donne HTTP 400. `POST` donne 405. Sans `?state=`, 400. Demander l'état déjà en place, 400.
- `PUT /courses/{id}` avec `{"state": 2}` répond 200 mais ne change rien.

Pour sortir un contenu de la vitrine : brouillon. Jamais de suppression, jamais de déplacement.

## Déplacer une leçon vers une autre classroom : impossible (2026-07-29)

`update-parent` vers une autre classroom répond 200, mais la leçon disparaît de la source sans apparaître dans la cible : elle devient orpheline.

- Pour la récupérer : `update-parent` vers son parent d'origine. Elle revient intacte.
- Copier puis supprimer crée une nouvelle leçon, avec un nouvel id : commentaires, complétions et historique sont perdus.
- Dans presque tous les cas, le brouillon répond mieux au besoin.

## Réordonner les leçons (2026-07-29)

Aucun endpoint ne réordonne. `update-parent` vers le même parent renvoie la leçon en fin de liste : on compose l'ordre voulu par une suite de renvois en fin.

## Lire sans le jeton WAF (2026-08-04)

Quand le jeton WAF est périmé, `classrooms list` et `classrooms tree` tombent en `buildId not found`. Sur `api2`, le cookie suffit :

- `GET /groups/{group_id}/courses` : toutes les classrooms, avec leur id, leur slug (`name`), leur titre et leur état ;
- `GET /courses/{classroom_id}?children=true` : l'arborescence complète, dans l'ordre d'affichage, avec l'état et le texte de chaque leçon.

`GET /courses/{lesson_id}` seul répond 400 : ça ne marche que sur la racine d'une classroom.

Le fil, la liste des membres, le calendrier et le classement n'ont pas d'équivalent sur `api2` : sans jeton WAF frais, ils sont inaccessibles.

## La connexion (2026-08-19)

- **Le cookie de session** (`auth_token`) dure environ un an.
- **Le jeton WAF** dure quelques jours (en octobre 2026 : renouvelé le 12, le 17 et le 23). `refresh_waf.mjs` le renouvelle : un Chrome piloté par Playwright, avec un profil persistant, charge la page du groupe et réécrit `config.toml`. Il met à jour le cookie et l'en-tête `x-aws-waf-token`, qui doivent rester identiques. Sans argument, il ne fait rien si le jeton est encore valide ; `--force` le renouvelle quand même. Code de sortie : 0 jeton bon, 1 session à refaire, 2 Skool injoignable.
- **Chaque matin à 8 h 37**, la routine « Jeton Skool » (`systeme/routines.md`) appelle ce script, puis `skool_session.py`, qui prévient à J-7 de la fin de la session.
- **Pour le lancer à la main** : `cd ~/Dev/skool-toolkit && node scripts/refresh_waf.mjs`.
- **Si le script échoue après la récolte** (HTTP 401), c'est la session qui a expiré, pas le jeton. Lance `node scripts/refresh_waf.mjs --login` : une fenêtre s'ouvre, Thomas se connecte, puis la ferme. Ça arrive quelques fois par an.
- **Le profil Chrome** vit dans `~/.config/skool-pp-cli/chrome-profile`.

Ne demande jamais le cookie ou le jeton à Thomas : le script s'en charge.

## Appels en série

Une pause d'au moins 0,5 s entre deux appels. Sans elle, le WAF déclenche un challenge.

## Commentaires d'un post

`GET /posts/{id}/comments?group-id=<group_id>` : aucun autre paramètre. `limit` ou `pinned` donnent HTTP 400.

## Images, titres et classrooms (2026-10-23)

- Une leçon n'a pas de champ de couverture : seule la classroom en a une (`cover_image`, `cover_image_file`). L'image d'une leçon est un bloc de son texte.
- Un titre de leçon tient en 50 caractères. Au-delà : HTTP 422 « Title is too long ». Le `POST` a déjà créé la leçon, qui reste vide : reprends-la par son id, n'en crée pas une autre. `skool_pousser_module.py` contrôle les titres avant d'envoyer et reprend une leçon restée vide.
- La réponse de `POST /files` est en snake_case (`write_url`, `content_type`, `wait_token`), pas en camelCase comme dans le code du site.
- Un fichier déclaré mais pas utilisé reste dans le stockage, invisible des membres. On ne le supprime pas.
- État d'une classroom : `1` brouillon, `2` publiée. Une leçon publiée dans une classroom en brouillon reste invisible.
- Le mode automatique de Claude Code a bloqué ces écritures, lancées depuis un script, jusqu'à l'accord écrit de Thomas dans la discussion. Si ça recommence, cite la règle d'`AGENTS.md` (la main sur Skool, sauf pour supprimer) ; si ça ne suffit pas, demande-lui de redire son accord.

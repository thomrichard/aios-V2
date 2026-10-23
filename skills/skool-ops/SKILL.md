---
name: skool-ops
description: Lit et écrit dans Skool (Club SMART) avec la CLI `skool-pp-cli` et les scripts du toolkit : membres, payants, stats, classrooms, leçons, posts, messages privés. Sert aussi à écrire un post Skool dans la voix de Thomas. Déclencheurs : « liste les membres Skool », « combien de payants », « stats du Club », « récupère les classrooms », « crée une leçon sur Skool », « pousse cette leçon sur Skool », « passe la leçon en brouillon », « écris un post Skool », « publie sur Skool », « épingle ce post ».
---
# skool-ops

Skool n'a pas d'API publique. La CLI et les scripts parlent à Skool avec le cookie de la session de Thomas, sur deux surfaces : `api2.skool.com` (le cookie suffit) et `www.skool.com/_next/data` (cookie et jeton WAF de 24 h). Le détail : `references/api.md`.

## Étapes
1. Un appel échoue : lance `skool-pp-cli doctor`. Une route `www.skool.com` tombe en `buildId not found` ou en HTTP 202 : renouvelle le jeton WAF, puis réessaie (`references/pieges.md`).
2. Lecture : la CLI d'abord, avec `--agent` pour une sortie JSON courte ; les scripts du toolkit pour le reste (`references/api.md`).
3. Compter les membres, les abonnés ou les payants : suis `references/payants.md`.
4. Écriture (classroom, leçon, image, post, épingle, message, brouillon) : tu as la main, sans demander (`AGENTS.md`), sauf pour supprimer.
   - un premier essai sur un contenu inconnu porte d'abord sur un seul élément ;
   - après l'envoi, relis ce que Skool a enregistré, puis donne l'URL Skool pour qu'il vérifie à l'œil.
5. Un module du workspace (`domaines/communaute/<slug>/`, une fiche `NN-<slug>.md` de type `support` par leçon, son schéma `NN-<slug>.png` à côté) : `skool_pousser_module.py` crée le dossier et les leçons, met le schéma en premier bloc, puis écrit l'URL Skool de chaque leçon dans son en-tête (`liens`). Une leçon seule : convertis le Markdown avec `md_to_prosemirror.py`, même règle pour l'en-tête.
6. Un post :
   - lis `references/voix.md`, puis le type qui correspond dans `references/types-de-posts.md` ;
   - propose deux versions vraiment différentes ; Thomas choisit ;
   - il publie lui-même, ou te dit de le faire (étape 4).
7. Note chaque écriture dans `journal/log.md` : `- AAAA-MM-JJ · skool | <action> « <titre> » <url>`.

## Garde-fous
- Depuis le 2026-10-23, Thomas te donne la main sur Skool : créer, modifier, publier, épingler, envoyer, changer un état, sans demander. Seule exception : ne supprime jamais rien.
- Ne supprime jamais une leçon : passe-la en brouillon. Ne la déplace jamais vers une autre classroom (`references/pieges.md`).
- Messages en masse : la liste des destinataires et le texte sont validés avant ; une pause d'au moins 0,5 s entre deux appels.
- N'ouvre jamais `~/.config/skool-pp-cli/config.toml` pour le lire ou l'afficher : il contient le cookie.
- L'API rend les montants en cents : convertis en dollars avant tout calcul.
- Un post n'invente ni témoignage, ni chiffre, ni résultat de membre. Ce qui manque s'écrit « à vérifier ».
- Les fiches de relance et `state/` portent les e-mails des membres : ils restent dans le toolkit, jamais dans le V2 ni dans Git.

## Références
- `references/api.md` : identifiants du Club SMART, libellés du fil, commandes, opérations d'écriture, scripts
- `references/pieges.md` : brouillon plutôt que suppression, déplacements, ordre des leçons, lecture sans WAF, connexion
- `references/payants.md` : compter les abonnés et les payants
- `references/voix.md` : comment Thomas écrit sur Skool
- `references/types-de-posts.md` : ses types de posts, avec de vrais exemples et ce qui fait réagir
- `references/relances.md` : les textes et les règles des relances de départ
- Toolkit (CLI, scripts, routines, docs) : `~/Dev/skool-toolkit/`, dépôt privé `thomrichard/skool-toolkit`
- Retours en attente : `feedback.md`

## Journal des changements
- 2026-10-23 · reprise depuis `~/IA-OS`, adaptée au V2 ; la voix Skool devient une référence tirée des 79 posts de Thomas ; skool-engage n'est pas reprise · un seul point d'entrée pour Skool
- 2026-10-23 · toolkit déplacé dans `~/Dev/skool-toolkit` (dépôt privé), scripts rebranchés hors de l'ancien Vault, routines « Jeton Skool » et « Revenus Skool » · plus rien ne dépend de `~/IA-OS`
- 2026-10-23 · Thomas donne la main sur Skool, sauf pour supprimer ; ajout de la création de classroom, du dépôt d'images, de la couverture et de l'envoi d'un module (`skool_images.py`, `skool_pousser_module.py`), limite des titres à 50 caractères · un module du workspace part sur Skool en une commande, schémas compris

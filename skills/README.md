# Skills

Chaque skill a son dossier : `skills/<nom>/`

- `SKILL.md` : court (60 lignes au plus), gabarit dans `systeme/gabarits/SKILL.md`
- `references/` : exemples et principes ; les images y sont listées dans `references/_images.md`
- `feedback.md` : les retours mis de côté par `/note`, appliqués quand Thomas le demande

Trois types : base de données (exemples, avec 2 jokers sur 10), livrable (HTML d'abord, puis export), déclenchée hors chat (lancée par `systeme/scripts/lancer.py`).
Le modèle d'une skill n'est pas ici : il est dans `systeme/modeles.md`.

Pour retrouver une skill par son nom : `skills/_index.md`, généré par `systeme/scripts/index.py`, ou la section Skills de `outbox/index.html`, avec sa recherche.

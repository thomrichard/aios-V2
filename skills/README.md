# Skills

Chaque skill a son dossier : `skills/<nom>/`

- `SKILL.md` : court, gabarit dans `systeme/gabarits/SKILL.md`. 80 lignes au plus, c'est l'idéal. De 81 à 120 : une alerte. Au-delà de 120 : il devient un index qui renvoie vers `references/`
- `references/` : exemples et principes ; les images y sont listées dans `references/_images.md`
- `feedback.md` : les retours mis de côté par `/note`, appliqués quand l'utilisateur le demande

Chaque skill a une famille, dans l'en-tête de son `SKILL.md` (`metadata:`, puis `  famille: <famille>`) ; les familles se règlent dans `systeme/metadonnees.md`, et l'onglet Skills de l'interface les filtre.

Trois types : base de données (exemples, avec 2 jokers sur 10), livrable (HTML d'abord, puis export), déclenchée hors chat (lancée par `systeme/scripts/lancer.py`).
Le modèle d'une skill n'est pas ici : il est dans `systeme/modeles.md`.

Pour retrouver une skill par son nom : `skills/_index.md`, généré par `systeme/scripts/index.py`, ou la section Skills de `outbox/index.html`, avec sa recherche.

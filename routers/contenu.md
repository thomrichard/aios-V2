# Routeur · contenu

La chaîne YouTube, la newsletter, les réseaux sociaux et les idées de vidéos. Aussi ce que l'audience rapporte : revenus YouTube, sponsoring, affiliation, avec la grille tarifaire et le kit média.

## Où vit quoi
- Inventaire : `domaines/contenu/_index.md`
- Vidéos : chaque vidéo de la semaine est un projet d'une semaine (`projets/<slug>.md`), clos quand la vidéo est publiée.
- Vidéos publiées : dans `domaines/contenu/`, une fiche `<titre>-AA-MM.md` de type `video` par vidéo longue (infos, stats à 7 et 30 jours, revenus, liens, transcription). Générées par `python3 systeme/scripts/youtube.py fiches` ; `--maj` rafraîchit les stats.
- Newsletter (Kit) : `python3 systeme/scripts/kit.py point` donne les abonnés, la croissance et les derniers envois avec leurs stats ; `kit.py lire <chemin>` lit le reste de l'API. Lecture seule.

## Fichiers clés
- Méthode de création d'une vidéo, par objectif (vues, Club, consulting), avec la checklist avant de tourner : `domaines/contenu/matrice-methodes-youtube.md`. Les méthodes des chaînes de référence et leurs vidéos sources sont dans `savoir/` (`methode-<chaine>.md`).
- Analyser une vidéo concurrente : `domaines/contenu/grille-analyse-concurrents.md`.

## Skills

## Projets actifs
- `projets/video-brevo.md` · prochaine étape : À définir
- `projets/references-youtube.md` · prochaine étape : Thomas relit la matrice et la grille d'analyse des concurrents

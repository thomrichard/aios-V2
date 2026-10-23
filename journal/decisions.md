# Décisions

Ajout seul. Pour chaque décision : la date, la décision, pourquoi.

- 2026-10-22 · Airtable sort du système. Pourquoi : tout vit dans le workspace.
- 2026-10-22 · Six domaines : contenu, communaute, consulting, produits, operations, perso. Pourquoi : un domaine par activité, plus le pilotage et le perso ; chaque revenu reste dans le domaine qui le produit.
- 2026-10-22 · L'agent s'appelle R4, bras droit de Thomas.
- 2026-10-22 · On part de zéro, et le socle reste neutre pour devenir le kit du Club SMART. Pourquoi : un seul système, d'abord éprouvé par Thomas, puis partagé.
- 2026-10-22 · Le parcours d'atelier : on prépare son profil avec `grill-me`, puis on installe le socle à partir de ce profil. Les ateliers sont en pause pour l'instant.
- 2026-10-22 · La cible YouTube porte sur les revenus publicitaires ; les abonnés passent dans les OKR. Pourquoi : une cible se mesure d'une seule façon.
- 2026-10-22 · Chaque vidéo de la semaine est un projet d'une semaine, clos quand elle est publiée. Pourquoi : un projet a une fin ; les projets clos restent dans l'historique.
- 2026-10-22 · Le résultat clé « 3 ateliers d'ici le 31 décembre » est retiré des OKR. Pourquoi : les ateliers sont en pause.
- 2026-10-22 · Une fiche par vidéo YouTube longue dans `domaines/contenu/videos/` ; les shorts restent sur YouTube. Pourquoi : garder le contenu publié, ses stats et sa transcription dans le workspace.
- 2026-10-22 · Les données YouTube passent par l'API officielle (Data v3 et Analytics v2) avec le compte qui possède la chaîne, et yt-dlp pour les transcriptions. Pourquoi : gratuit, et seule Analytics donne les stats à 7 et 30 jours et les revenus ; les crédits vidIQ restent pour la recherche.
- 2026-10-22 · Routines directes : une commande lancée sans IA quand il n'y a rien à juger. La première rafraîchit les fiches YouTube le dimanche et le jeudi à 1 h, par launchd. Pourquoi : moins chère et plus fiable qu'un passage par l'agent.
- 2026-10-23 · Skool passe par la CLI maison `skool-pp-cli`, inscrite dans les connexions. Pourquoi : déjà testée, et le jeton WAF se renouvelle seul chaque matin.
- 2026-10-23 · `skool-ops` est reprise dans le V2 ; `skool-engage` ne l'est pas ; `voix-skool` devient deux références de `skool-ops` (voix, types de posts), tirées des 79 posts du fil. Pourquoi : un seul point d'entrée pour Skool ; une voix n'a pas besoin d'être une skill.
- 2026-10-23 · Posts Skool : tutoiement pour tout le monde ; les liens externes sont permis ; R4 n'écrit aucun emoji, Thomas les ajoute lui-même. Pourquoi : les emojis restent le choix de Thomas, qui en met quand il en a envie.
- 2026-10-23 · Le toolkit Skool (code de la CLI, scripts, routines) vit dans `~/Dev/skool-toolkit`, avec un dépôt GitHub privé `thomrichard/skool-toolkit` ; il n'entre pas dans le V2. Pourquoi : il n'était dans aucun Git, il doit se réinstaller sur une autre machine, et un dépôt sans données pourra être ouvert ou vendu plus tard.
- 2026-10-23 · Les données des membres (fiches de relance, état « déjà contacté ») restent dans le toolkit, hors de Git et hors du V2. Pourquoi : noms et e-mails de tiers ; les branches du V2 partent vers le socle public.
- 2026-10-23 · La veille automatique des départs est arrêtée ; Thomas relancera à la main depuis un futur écran des abonnés. La veille des échéances reste à la main. La routine de 8 h 37 ne fait plus que renouveler le jeton Skool. Pourquoi : choix de Thomas, en attendant l'écran.
- 2026-10-23 · Les revenus du Club SMART sont refaits le 2 de chaque mois dans `domaines/communaute/revenus-club-smart.md`, et la ligne Club SMART de `domaines/operations/revenus.md` suit. Pourquoi : chaque source reste dans son domaine, la vue d'ensemble n'en garde qu'une ligne.
- 2026-10-23 · Une routine directe laisse une ligne `routine` dans `journal/log.md` ; le rangement la reprend dans une rubrique « Routines » du point du jour. Pourquoi : les alertes du hub de l'ancien workspace n'ont plus d'endroit où arriver.
- 2026-10-23 · Plus de dossier par type : le type est dans l'en-tête, seul le domaine est un dossier (plus un dossier pour un objet de plusieurs fichiers). Un fichier daté s'appelle `<titre>-AA-MM.md`. Les fiches vidéo passent de `domaines/contenu/videos/` à `domaines/contenu/`. Pourquoi : on classe par les métadonnées, AI first ; le nom commence par ce qu'on cherche. Socle : PR #6.

# Connexions

Pour brancher un outil, cherche dans cet ordre et garde le plus léger qui marche (la skill `search-connectors` fait cette recherche) :

1. L'outil officiel de l'éditeur.
2. Une CLI de la communauté : réponse courte, peu de tokens, et elle marche avec tous les agents.
3. L'API de l'application, avec une clé.
4. Un MCP de la communauté : le plus lourd, et chaque agent a sa propre configuration.

Chaque connexion est testée par une vraie lecture avant d'être inscrite ici. Les clés vont dans `.env`, jamais dans Git ni dans le chat. Un connecteur qui ne sert pas chaque semaine est retiré.

Méthode : `outil officiel`, `CLI`, `API` ou `MCP`. Commande : le mot tapé pour une CLI (`yt-dlp`), le nom du serveur pour un MCP, ou plusieurs noms séparés par des virgules quand le même service est branché deux fois ; l'interface s'en sert pour compter les appels. Ce tableau est recopié dans l'interface (`interface/config/apps.json`) par `systeme/scripts/index.py` : on ne l'écrit qu'ici.

| Outil | Méthode | Pourquoi | Agents | Testé le | Commande |
|---|---|---|---|---|---|
| YouTube (Data v3, Analytics v2) | API | Fiches vidéos, stats, revenus, par `systeme/scripts/youtube.py` (OAuth en lecture seule, avec le compte qui possède la chaîne) | Tous (script) | 2026-10-22 | — |
| yt-dlp | CLI | Sous-titres automatiques des vidéos | Tous (script) | 2026-10-22 | `yt-dlp` |
| Google Workspace CLI | CLI | Gmail, Agenda et Drive en ligne de commande | Tous | 2026-10-23 | `gws` |
| vidIQ | MCP | Recherche YouTube, stats de chaîne, titres et miniatures | Claude Code, Claude (compte) | 2026-10-23 | `vidiq`, `102e3d80-56f1-4fc2-9c0f-5bd03edaf6f4` |
| Gmail | MCP | Lire, trier et préparer des e-mails | Claude (compte) | 2026-10-23 | `332ce25a-1938-49e6-b6e1-27a367640409` |
| Wispr Flow | MCP | Réunions et notes dictées | Claude Code, Claude (compte) | 2026-10-23 | `wisprflow`, `af934a57-1574-4e32-a045-6bf30d43e1b8` |
| Claude Docs | MCP | Documents partagés sur claude.ai | Claude (compte) | 2026-10-23 | `1a59c906-04da-521d-bda7-7f71b9f9e01c` |
| Apify | MCP | Extraction de données sur le web | Claude Code | 2026-10-23 | `apify` |
| Kit | MCP | Newsletter : abonnés, séquences, envois | Claude Code | 2026-10-23 | `kit` |
| Google Drive | MCP | Fichiers du Drive | Claude (compte) | 2026-10-23 | `e0b911f2-25ad-40f5-8338-65388b05b66c` |
| GitHub CLI | outil officiel | Dépôts, pull requests, tickets | Tous | 2026-10-23 | `gh` |
| OpusClip | MCP | Clips courts tirés des vidéos | Claude (compte) | 2026-10-23 | `795efe4a-bf2c-4ca8-978d-f788eb5759b3` |
| Google Agenda | MCP | Événements et disponibilités | Claude (compte) | 2026-10-23 | `0168199f-d285-4b9b-8c92-6a93fb5ca090` |
| Skool | CLI | Club SMART : membres, classrooms, leçons et posts. CLI maison (code et scripts : `~/Dev/skool-toolkit`, dépôt privé), connectée par le cookie de session ; le jeton WAF (quelques jours) est renouvelé chaque matin à 8 h 37 par la routine Jeton Skool | Tous | 2026-10-23 | `skool-pp-cli` |

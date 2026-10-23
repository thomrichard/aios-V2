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

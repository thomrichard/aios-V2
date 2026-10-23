---
name: search-connectors
description: Cherche comment brancher une application à l'AIOS, dans l'ordre de systeme/connexions.md (outil officiel, CLI, API, MCP de la communauté), compare les options, recommande la plus légère qui couvre le besoin, puis propose de l'installer et de l'inscrire après une vraie lecture. Déclencheurs : « search-connectors », « cherche un connecteur pour <appli> », « comment brancher <appli> », « connecte <appli> ».
---
# search-connectors

Brancher un outil, c'est choisir la connexion la plus légère qui fait le travail, et la tenir à jour à un seul endroit : `systeme/connexions.md`.

## Étapes
1. **Le besoin, d'abord.** Quelle application, pour lire ou écrire quoi, et à quelle fréquence ? Un connecteur qui ne servirait pas chaque semaine ne vaut pas d'être branché : dis-le. Si le besoin est flou, `align`.
2. **Ce qui existe déjà.** Regarde `systeme/connexions.md` et les connecteurs déjà disponibles dans la session. Si l'outil est déjà branché, arrête-toi là.
3. **Cherche dans cet ordre**, en lisant les sources (site de l'éditeur, documentation, dépôt), jamais de mémoire :
   1. l'outil officiel de l'éditeur : connecteur officiel, CLI ou serveur MCP publié par l'éditeur ;
   2. une CLI de la communauté ;
   3. l'API, avec une clé ;
   4. un MCP de la communauté.
4. **Compare** dans un tableau : option, méthode, ce qu'elle couvre du besoin, agents (Claude Code, Codex, Gemini CLI), connexion (clé, OAuth), coût, entretien (éditeur, dernier commit, nombre de mainteneurs), risques.
5. **Recommande** la plus haute de l'ordre qui couvre le besoin, en une phrase de pourquoi. Pour une option de la communauté, ajoute ses risques : un seul mainteneur, des droits trop larges, un code non relu.
6. **Propose d'installer**, et attends le oui. Les clés vont dans `.env` : indique la ligne à y coller, ne la demande jamais dans le chat. Commence en lecture seule si l'outil le permet.
7. **Après l'installation :** teste par une vraie lecture, puis ajoute sa ligne à `systeme/connexions.md` (Outil, Méthode, Pourquoi, Agents, Testé le, Commande), et lance `python3 systeme/scripts/index.py` pour l'interface.

## Garde-fous
- Rien n'est installé ni branché sans accord : c'est toucher un système externe.
- Une option non vérifiée (lien mort, dépôt abandonné) ne se recommande pas.
- Pas de clé, pas de mot de passe dans le chat, jamais.

## Références
- D'après la skill `search-connectors` de Jay E | RoboNuggets (leçon j1) : son fichier n'est pas public, celle-ci est réécrite pour l'AIOS, sur l'ordre de `systeme/connexions.md`.

## Journal des changements
- 2026-10-23 · création · brancher un outil par la voie la plus légère, et l'inscrire à un seul endroit

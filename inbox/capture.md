# Capture

Une idée par ligne. Une consigne facultative après « consigne : ».

- Rapatrier dans l'AIOS les fichiers joints aux leçons Skool (PDF, skills en Markdown, transcriptions, un zip) : les fiches des classrooms n'en donnent que le titre et le nom. consigne : à reprendre, sur demande de Thomas
- Messages privés en masse : la skill `skool-ops` garde la validation de Thomas avant l'envoi, alors qu'il a donné la main entière sur Skool. Lui demander s'il veut l'enlever. consigne : à reprendre
- La palette de la skill `excalidraw-diagram` est obsolète (ancienne charte) ; proposition : en faire un « mode tableau » à partir du générateur `domaines/communaute/economiser-tes-tokens/generateur/`. consigne : à reprendre, à proposer dans calibrate
- Avant d'archiver `~/IA-OS` : aios-hub (`~/IA-OS/Dev/aios-hub`, lancé par launchd sous `caffeinate -s`) garde le Mac éveillé la nuit. Sans lui, les routines de nuit du V2 risquent de ne partir qu'au réveil : trouver un remplaçant avant d'archiver. consigne : à reprendre, avant l'archivage d'IA-OS
- Ancien log `~/IA-OS/.scripts/skool-churn-daily.log` : le cookie Skool y est masqué, pas vidé. Le vider en entier si Thomas le veut. consigne : à reprendre, sur demande de Thomas
- Connexion de la CLI `claude` : `claude auth status` dit `loggedIn: false`, donc le rangement de nuit plante (« OAuth session expired », log `~/Library/Logs/sm4rt-rangement.log`, 24/10 à 10 h 26) et `outbox/points/` reste vide. `claude auth login` a été lancé dans le terminal de l'app ; il reste à se connecter dans le navigateur et à coller le code. consigne : à reprendre, vérifier `claude auth status`, puis relancer `python3 systeme/scripts/lancer.py rangement` si Thomas le veut

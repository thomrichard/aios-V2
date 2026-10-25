# Capture archivée · 2026-10

Les lignes de `inbox/capture.md` une fois rangées.

- Routine directe qui rafraîchirait chaque semaine les classrooms Skool dans l'AIOS (`skool_tirer_classrooms.py --remplacer`) : explorée, pas décidée. consigne : à reprendre si Thomas la veut
- Relancer les ateliers : Thomas a dit « on verra » le 24/10 ; le type `atelier` est prêt. consigne : probablement une idée (type `idee`, domaine consulting, ressortir : quand on parle d'offres ou des revenus du consulting)
- Commiter les trois scripts Skool du toolkit (`skool_images.py`, `skool_pousser_module.py`, `skool_tirer_classrooms.py`), dans `~/Dev/skool-toolkit`. consigne : à reprendre, Thomas n'a pas encore répondu
- Classroom « Agentic AI » en brouillon : Thomas la relit, puis on la publie. Le schéma de la leçon 2 porte encore l'ancien titre long : le régénérer avec `generateur/` et remplacer l'image sur Skool si besoin. consigne : à reprendre
- Messages privés en masse : la skill `skool-ops` garde la validation de Thomas avant l'envoi, alors qu'il a donné la main entière sur Skool. Lui demander s'il veut l'enlever. consigne : à reprendre
- Ancien log `~/IA-OS/.scripts/skool-churn-daily.log` : le cookie Skool y est masqué, pas vidé. Le vider en entier si Thomas le veut. consigne : à reprendre, sur demande de Thomas
- Connexion de la CLI `claude` : `claude auth status` dit `loggedIn: false`, donc le rangement de nuit plante (« OAuth session expired », log `~/Library/Logs/sm4rt-rangement.log`, 24/10 à 10 h 26) et `outbox/points/` reste vide. `claude auth login` a été lancé dans le terminal de l'app ; il reste à se connecter dans le navigateur et à coller le code. consigne : à reprendre, vérifier `claude auth status`, puis relancer `python3 systeme/scripts/lancer.py rangement` si Thomas le veut
- Avant d'archiver `~/IA-OS` : aios-hub (`~/IA-OS/Dev/aios-hub`, lancé par launchd sous `caffeinate -s`) garde le Mac éveillé la nuit. Sans lui, les routines de nuit du V2 risquent de ne partir qu'au réveil : trouver un remplaçant avant d'archiver. consigne : à reprendre, avant l'archivage d'IA-OS
- Rapatrier dans l'AIOS les fichiers joints aux leçons Skool (PDF, skills en Markdown, transcriptions, un zip) : les fiches des classrooms n'en donnent que le titre et le nom. consigne : à reprendre, sur demande de Thomas

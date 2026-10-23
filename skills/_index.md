# skills · index

<!-- Généré par systeme/scripts/index.py : ne pas modifier à la main. -->

Chaque skill vit dans `skills/<nom>/SKILL.md` : le dossier porte son nom.

| Skill | Ce qu'elle fait | Fichier |
|---|---|---|
| calibrate | En fin de session, relit la discussion, repère les corrections, les préférences et ce qui a manqué, puis propose au plus 7 changements précis (skills, règles d'AGENTS.md, mémoire, réglages) ; l'utilisateur choisit lesquels appliquer. | [calibrate/SKILL.md](calibrate/SKILL.md) |
| classer | Range un élément en lui donnant les bonnes métadonnées (type, domaine, statut, résumé, projet) ; sa place s'en déduit, et systeme/scripts/ranger.py l'y déplace. | [classer/SKILL.md](classer/SKILL.md) |
| fiche | Écrit une fiche à partir de ce que l'utilisateur donne (texte brut, dictée, note, lien), ou pour décrire un fichier qui ne peut pas porter d'en-tête (PDF, vidéo, son), puis la passe à classer pour la ranger. | [fiche/SKILL.md](fiche/SKILL.md) |
| grill-me | Interviewe l'utilisateur en profondeur sur un plan, un design ou une idée, ou lui pose une liste de questions imposées (installation), en enregistrant chaque réponse dans une fiche de capture. | [grill-me/SKILL.md](grill-me/SKILL.md) |
| installation | Installe et personnalise l'AIOS. | [installation/SKILL.md](installation/SKILL.md) |
| note | Met de côté un retour sur une skill, sans couper le travail en cours, dans skills/<nom>/feedback.md ; les retours s'appliquent quand l'utilisateur le demande, ou à la prochaine calibrate. | [note/SKILL.md](note/SKILL.md) |
| rangement | Le rangement de nuit (2 h du matin) : archive les vieux points du jour, vide l'inbox avec fiche et classer, met de côté ce qui demande une réponse dans outbox/questions.md, puis écrit le point du jour. | [rangement/SKILL.md](rangement/SKILL.md) |

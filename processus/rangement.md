---
type: processus
resume: Vider l'inbox, ranger l'outbox et écrire le point du jour
domaine: operations
declencheur: routine, chaque nuit à 2 h ; ou à la demande
statut: actif
cree: 2026-10-22
maj: 2026-10-23
---
# Rangement de nuit

| Étape | Skill | Ce qu'on décide | Qui décide |
|---|---|---|---|
| Archiver les points du jour cochés ou vieux de plus de 7 jours | `rangement` | — | l'IA |
| Écrire une fiche pour le texte brut, les liens et les fichiers sans en-tête | `fiche` | ce que dit la fiche | l'IA |
| Donner ses métadonnées à chaque élément ; `ranger.py` le range | `classer` | le type, le domaine, le statut, le projet ; dans le doute, une question pour la journée | l'IA |
| Écrire le point du jour | `rangement` | ce qui mérite ton attention | l'IA |
| Répondre aux questions en attente | `classer` | chaque réponse, ou « plus tard » | toi |
| Lire le point du jour | — | valider, corriger ou cocher | toi |

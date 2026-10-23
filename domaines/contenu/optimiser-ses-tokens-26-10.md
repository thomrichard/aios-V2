---
type: video
resume: Idée de vidéo sur l'optimisation des tokens et les mods de Claude Code, tirée de la vidéo ARMS de Jay E
statut: sujet
domaine: contenu
cree: 2026-10-23
maj: 2026-10-23
source: https://www.youtube.com/watch?v=s_1GPN-NXA0
liens: [../communaute/economiser-tes-tokens/economiser-tes-tokens.md]
---
# Optimiser ses tokens (idée de vidéo)

L'idée de Thomas : une vidéo sur l'optimisation des tokens, tirée de la vidéo de Jay E, avec l'occasion de parler des mods.

## La matière
Les 22 leçons du module « Économiser tes tokens » en sont la liste complète, en 7 chapitres : comprendre, la discussion, la mémoire, les skills, les routines, les connexions, sortir du chat. Voir le sommaire lié.

## Les angles explorés
- « Les leviers pour arrêter de brûler tes tokens » : la liste, levier par levier.
- « Je te montre comment mon système les économise » : la démo sur l'AIOS de Thomas, qui applique déjà une bonne partie des leviers (routines actives ou passives, plafond de coût, ordre des connexions, `/note`, `/calibrate`, consigne de compactage, routeurs, MEMORY.md).
- « Trois réglages en cinq minutes, sans AIOS » : `model: haiku` sur les petites skills, `/usage`, `/skill-doctor`. Ouvert à toute l'audience.
- Exemple concret : les scripts Skool écrits avec Claude tournent ensuite sans IA, donc sans tokens.

## Ce qui marche sans AIOS (levier des skills)
Il faut Claude Code, pas un AIOS. Dans l'app Claude (le chat), une skill ne peut pas choisir son modèle, et la ligne `model:` bloque l'ajout de la skill.

## À challenger avant de reprendre Jay
- Garder le cache chaud : chaque relance coûte aussi, et le cache dure 1 heure avec un abonnement, 5 minutes avec une clé API.
- « Le MCP est le plus lourd » : en partie dépassé, Claude Code ne charge plus que le nom des outils au démarrage.
- Jev est le modèle de décision de TypeSafe AI, pas un modèle d'Anthropic. Les chiffres de Jay (437 $, 4 451 aiguillages pour 0,18 $) sont à vérifier.

## D'où ça vient
Session du 2026-10-23 : lecture de la transcription de la vidéo de Jay E, publiée le 21 octobre 2026, et vérification des faits dans la documentation officielle (sources dans la fiche du module).

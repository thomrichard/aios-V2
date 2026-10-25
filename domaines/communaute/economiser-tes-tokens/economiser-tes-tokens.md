---
type: support
resume: Module de 22 leçons pour le Club SMART, économiser ses tokens avec Claude, d'après la vidéo ARMS de Jay E
statut: a-valider
domaine: communaute
cree: 2026-10-23
maj: 2026-10-23
source: https://www.youtube.com/watch?v=s_1GPN-NXA0
liens: []
---
# Économiser tes tokens

Un module de 22 leçons pour le Club SMART, en 7 chapitres. Destination : la classroom « Agentic AI », en premier module. Envoyé sur Skool le 2026-10-23 : classroom https://www.skool.com/club-smart/classroom/17480787 (en brouillon, sans couverture), dossier « Économiser tes tokens », 22 leçons avec leur schéma en premier bloc. L'adresse de chaque leçon est dans l'en-tête de sa fiche.

Chaque leçon a sa fiche : un schéma (le PNG), une explication, trois étapes à mettre en place, une phrase à retenir. Le corps de la fiche est le texte de la leçon Skool. Le fichier `.excalidraw` du même nom est la source modifiable du schéma (excalidraw.com, menu Ouvrir). Les schémas sont en charte vert pin, rôle éditorial. Ils sortent du générateur `generateur/` : `lecons.py` (le contenu de chaque schéma) et `moteur.py` écrivent les `.excalidraw`, puis `exporter.py` fait les PNG avec le canevas Excalidraw local allumé (`.claude/launch.json`, entrée `excalidraw-canvas`). `couverture.py` fait la couverture de la classroom Agentic AI.


## Comprendre

1. [Pourquoi chaque message coûte plus cher ?](01-pourquoi-chaque-message-coute-plus-cher.md)
2. [Pourquoi Claude oublie quand la discussion dure ?](02-le-context-rot.md)
3. [C'est quoi, le cache ?](03-le-cache-de-prompt.md)

## La discussion

4. [Compacter, oui. Mais avec une intention.](04-compacter-avec-une-intention.md)
5. [Garder le cache chaud : utile ou pas ?](05-garder-le-cache-chaud.md)
6. [Vois ce que tu consommes, en direct](06-voir-sa-consommation.md)

## La mémoire

7. [Donne une carte à Claude](07-donner-une-carte-a-claude.md)
8. [Du texte simple bat une base vectorielle](08-du-texte-simple-plutot-qu-une-base-vectorielle.md)
9. [Une correction donnée deux fois, c'est un échec](09-une-memoire-qui-s-ameliore.md)

## Les skills

10. [Le bon modèle pour chaque skill](10-un-modele-par-skill.md)
11. [Laisser un petit modèle choisir le modèle](11-laisser-un-petit-modele-aiguiller.md)
12. [Trouve les skills qui coûtent cher](12-trouver-les-skills-qui-coutent.md)
13. [Lance une skill sans ouvrir de discussion](13-lancer-une-skill-sans-discussion.md)
14. [Une bibliothèque de composants](14-une-bibliotheque-de-composants.md)

## Les routines

15. [Routines actives ou passives](15-routines-actives-ou-passives.md)
16. [Mets un plafond à chaque routine](16-plafonner-ses-routines.md)
17. [Une routine qui te propose des routines](17-une-routine-qui-propose-des-routines.md)

## Les connexions

18. [Choisis la connexion la plus légère](18-choisir-la-connexion-la-plus-legere.md)

## Sortir du chat

19. [Les mods : changer Claude Code lui-même](19-les-mods-de-claude-code.md)
20. [Ton navigateur aussi a des mods](20-les-extensions-chrome.md)
21. [Retrouve tes documents sans demander à Claude](21-retrouver-ses-documents-sans-claude.md)
22. [Une micro-app pour les gros travaux](22-une-micro-app-pour-les-gros-travaux.md)

## Sources

- Jay E (RoboNuggets), « A NEW Agentic OS Standard for Claude 5.5 is here », publiée le 21 octobre 2026 : https://www.youtube.com/watch?v=s_1GPN-NXA0
- Faits techniques vérifiés le 23 octobre 2026 dans la documentation officielle :
  - cache et relecture : https://code.claude.com/docs/en/prompt-caching
  - context rot : https://platform.claude.com/docs/en/build-with-claude/context-windows
  - compaction et fichiers chargés : https://code.claude.com/docs/en/context-window et https://code.claude.com/docs/en/memory
  - recherche dans les fichiers : https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  - modèle par skill : https://code.claude.com/docs/en/skills.md
  - /usage et /skill-doctor : https://code.claude.com/docs/en/costs.md
  - claude -p : https://code.claude.com/docs/en/headless.md
  - barre d'état : https://code.claude.com/docs/en/statusline
  - outils MCP chargés à la demande : https://code.claude.com/docs/en/mcp
  - mods : https://code.claude.com/docs/en/plugins/mods/overview
  - tâches planifiées : https://code.claude.com/docs/en/routines
- Jev : modèle de décision de TypeSafe AI, routeur sur OpenRouter : https://openrouter.ai/docs/guides/routing/routers/jev-router

## À vérifier avant publication

- Les chiffres de Jay : 437 $ économisés en 30 jours, 4 451 aiguillages pour 0,18 $, 420 000 fichiers, la routine passée de 10 $ à 4 $.
- Les valeurs des barres et des pourcentages dans les leçons 6, 12 et 16 sont des exemples, signalés comme tels sur l'image.
- Les numéros de version de Claude Code cités dans les notes (2.1.251, 2.1.252, 2.1.286, 2.1.287).

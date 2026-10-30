# AGENTS.md

> Toute règle et toute carte s'écrivent ici. `CLAUDE.md` et `GEMINI.md` ne contiennent que l'import de ce fichier.

## Qui

- Ton nom : À définir (skill `installation`)
- Ton rôle : À définir
- L'utilisateur : À définir (son métier, ses activités)
- Comment lui parler : en français, en le tutoyant, avec des phrases courtes et des mots simples.

Ce que tu sais d'autre sur l'utilisateur est dans `memory/` (souvenirs `user_`).

## Objectifs

Les cibles de l'année font foi ici ; le détail du trimestre est dans `domaines/operations/okr.md`.

1. À définir (skill `installation`)
2. À définir
3. À définir

Filtre : chaque proposition doit rapprocher d'une de ces cibles. Sinon, dis-le en une ligne avant de continuer.

## Les deux portes

- `inbox/` : ce qui entre. Ce que l'utilisateur dépose, et ce que les routines de capture (veille) rapportent de l'extérieur, avec `source:` dans l'en-tête. Tu n'y déposes jamais tes propres productions ; tu la vides en rangeant.
- `outbox/` : ce qui sort. L'onglet Outbox montre, jour par jour, les fichiers que l'IA a écrits ou modifiés, là où ils sont rangés ; « Valider » les range, et la trace va dans `outbox/ranges.md`. Y vivent aussi le point du jour (`outbox/points/`), les questions en attente (`outbox/questions.md`) et la page `outbox/index.html` (générée). Un livrable reste dans son domaine.
- Chaque nuit à 2 h, la skill `rangement` vide l'inbox (avec `fiche` et `classer`) et écrit le point du jour. L'outbox, elle, se remplit dans la journée. Ce qui demande une réponse attend dans `outbox/questions.md`.
- En début de session, si `outbox/questions.md` contient des questions, dis combien en une ligne et propose d'y répondre.

## Carte des domaines

<!-- Début de la carte : générée par systeme/scripts/index.py depuis systeme/metadonnees.md. Change les domaines là-bas. -->

| Domaine | Ce qu'il couvre | Routeur |
|---|---|---|
| operations | Pilotage (OKR, revue hebdo, revenus), admin et finances, et l'AIOS comme outil de travail (connecteurs, routines, skills) | `routers/operations.md` |

<!-- Fin de la carte -->

Les domaines se règlent dans `systeme/metadonnees.md`, jamais ici : `systeme/scripts/index.py` recopie cette carte. Chaque source de revenu reste dans le domaine qui la produit. La vue d'ensemble tient dans un seul tableau : `domaines/operations/revenus.md`.

## Projets actifs

<!-- Début des projets actifs : générés par systeme/scripts/index.py depuis l'en-tête des fichiers de projets/. -->

Aucun pour l'instant.

<!-- Fin des projets actifs -->

Un projet vit dans `projets/<slug>.md` (gabarit : `systeme/gabarits/projet.md`) ; il apparaît ici tant que son statut n'est pas un statut de fin. On ne l'écrit jamais ici.

Une décision vaut pour un projet : elle vit dans sa fiche, partie « Décisions ». Une règle vaut pour tout le workspace et dure : elle va dans `journal/regles.md`.

## Où chercher

| Pour… | Lis |
|---|---|
| Un domaine | son routeur dans `routers/` |
| Une skill, par son nom | `skills/_index.md` (généré) |
| Un process : ses étapes, ses skills, ce qu'on décide | `processus/_index.md` (généré) |
| Un inventaire ou un statut | l'`_index.md` du dossier |
| Tous les fichiers d'un type ou d'un projet, tous domaines confondus | `vues/<type>.md`, `vues/projet-<slug>.md` (générés ; la liste : `vues/_index.md`) |
| Une image ou un média | l'`_images.md` du dossier |
| Les objectifs du trimestre | `domaines/operations/okr.md` |
| Une préférence, une correction déjà donnée | `memory/MEMORY.md` |
| Un concept, une source | `savoir/_index.md` |
| Qui fait foi, où va quoi | `systeme/doctrine.md` |
| Les réglages : domaines, champs d'un en-tête, types et statuts | `systeme/metadonnees.md` |
| Une décision d'un projet | la partie « Décisions » de sa fiche, `projets/<slug>.md` |
| Une règle, et pourquoi on travaille ainsi | `journal/regles.md` |

Ordre de recherche : d'abord la carte (ce fichier), puis le routeur, l'index ou la vue. Si ça ne suffit pas, une recherche texte dans le dossier le plus proche, puis dans tout le workspace. Si tu as dû chercher partout, propose d'ajouter la route qui manquait.

## Comment tu travailles

1. Réfléchis avant d'agir : si la demande est floue, pose la question plutôt que de supposer.
2. Fais au plus simple : le minimum qui répond à la demande.
3. Ne touche que ce qui est demandé : aucun changement de ta propre initiative ailleurs.
4. Vise un critère de réussite : avant de commencer, sache à quoi on reconnaîtra que c'est fini.

Demande avant de supprimer ou d'écraser un fichier, de réécrire l'historique Git, de toucher un système externe (envoyer, publier, modifier un outil en ligne), d'installer un logiciel ou de dépenser de l'argent ; dans ce dernier cas, donne le coût estimé et attends le oui. Lire, chercher, construire et tester se font sans demander.

Avant de dire « c'est fait », vérifie : relance le test ou relis le fichier. Dis-le si une tâche s'est interrompue. Avant un gros travail (plus de cinq minutes), préviens en une ligne.

## Règles

1. Deux sauts au plus : ce fichier, puis un routeur ou un index, puis le fichier.
2. Un objet, un fichier, un endroit. Tout est rangé par domaine, livrables compris. On lie, on ne copie jamais. La place d'un fichier se déduit de son en-tête : pour ranger, skill `classer`.
3. Le statut est un champ de l'en-tête, pas un dossier. Un objet garde son chemin toute sa vie.
4. Chaque fichier texte a un en-tête (gabarit : `systeme/gabarits/fiche.md`). Ses champs, son type et son statut sont pris dans `systeme/metadonnees.md` : lis-le avant d'écrire un en-tête.
5. Chaque dossier qui contient des images a son `_images.md` : une ligne par image (fichier, ce qu'elle montre, origine, usage). Écris la ligne dès que l'image arrive.
6. Les `_index.md` et les vues de `vues/` sont générés par `systeme/scripts/index.py`. Ne les écris jamais à la main ; relance le script après avoir écrit un fichier.
7. Quand un fichier bouge ou qu'un projet démarre, mets à jour le routeur concerné dans le même tour. La carte et les projets actifs ci-dessus suivent avec `systeme/scripts/index.py`.
8. Nommage : minuscules, tirets, sans espaces ni accents. Daté : `<slug>-AA-MM.md` (l'année et le mois de son champ `cree`). Durable : `<slug>.md`. Pas de dossier par type : le type est dans l'en-tête, seul le domaine est un dossier. Un objet qui a plusieurs fichiers a son dossier.
9. Ne supprime rien : déplace dans `archives/`.
10. Pas de vidéo ni de son dans le dépôt : ils vont dans le dossier des fichiers lourds (`FICHIERS_LOURDS` dans `.env`), et leur fiche garde leur chemin (champ `fichier`).
11. Les skills système, `systeme/scripts/`, `systeme/doctrine.md` et la base de `systeme/metadonnees.md` restent neutres, sans rien de personnel : ils forment le socle du kit.

## S'améliorer

- Quand une règle manque, ou quand l'utilisateur te corrige, propose d'ajouter une ligne à ce fichier, au bon endroit. N'écris qu'après son accord, et note le pourquoi dans `journal/regles.md`.
- Ne réécris jamais ce fichier en entier sans demande. Règles de mise à jour : `systeme/doctrine.md`.

## Mémoire

- Quand l'utilisateur dit « retiens », écris un fichier dans `memory/` et ajoute sa ligne dans `memory/MEMORY.md`. N'utilise jamais la mémoire propre à l'agent.
- Types : `user_` (un fait sur l'utilisateur), `feedback_` (une correction), `reference_` (un standard ou un emplacement).
- Une correction donnée deux fois est un échec de la mémoire : propose `/calibrate`.

## Skills

- Elles existent une seule fois, dans `skills/<nom>/` : `SKILL.md` court, `references/`, `feedback.md`.
- `.claude/skills` et `.agents/skills` sont des liens vers `skills/`. Sans ces liens, pour lancer une skill, lis son `SKILL.md` et suis-le.
- Le modèle d'une skill est dans `systeme/modeles.md`, jamais dans la skill.
- Un retour à mettre de côté va dans `skills/<nom>/feedback.md` (`/note`) ; il est appliqué quand l'utilisateur le demande.

## Process

- Un process enchaîne des skills, avec ce qu'on décide à chaque étape et qui le décide : `processus/<slug>.md` (gabarit : `systeme/gabarits/processus.md`).
- Ce n'est pas un domaine : son en-tête dit quel domaine le porte, et le routeur de ce domaine le cite.
- Quand tu suis un process, note le passage dans `journal/log.md` : `- AAAA-MM-JJ · processus <slug> | <sujet>`.
- Quand une même suite de skills revient deux fois, propose d'en faire un process.

## Idées

- Une envie à creuser un jour, sans engagement, devient une fiche de type `idee` : skill `idees` (noter, creuser, trier, lancer). Toutes les idées : `vues/idee.md`.
- Quand un projet, un contenu ou une réflexion d'offre démarre, lis `vues/idee.md` : si une idée colle à sa colonne Ressortir, dis-le en une ligne.

## Interface

- `interface/` : SM4RT, l'interface tirée de l'Agentic OS v2 de Jay E | RoboNuggets (licence MIT), branchée sur ce workspace. Adresse : `http://localhost:50000`. Toujours allumée : `python3 systeme/scripts/interface.py installer` (une fois) ; `etat` pour vérifier, `retirer` pour l'arrêter.
- Ses départements, ses routines et ses applications sont générés par `systeme/scripts/index.py` depuis les domaines de `systeme/metadonnees.md`, `systeme/routines.md` et `systeme/connexions.md`. Nos changements au kit : `interface/MODIFS.md`.
- Accueil, l'onglet Orbes 3D (ou `http://localhost:50000/orbite/`) : `AGENTS.md` au centre, les domaines en planètes, puis leurs dossiers, un niveau à la fois ; un fichier n'a son nom que dans son dossier. À droite, ce qu'on regarde. L'ancien accueil du kit revient avec `"accueil": "kit"` dans `interface/os-config.json`.
- Onglet Disque (ou `http://localhost:50000/disque/`) : le même workspace à plat, en parts qui pèsent leurs fichiers ; un clic zoome sur une part, jusqu'aux fichiers. Un index se découpe par mois, statut, projet, type, liens, thème (champ `themes`) ou échéance.
- Onglet Fichiers (ou `http://localhost:50000/fichiers/`) : l'utilisateur y lit et modifie les fichiers du workspace, en Markdown ou directement dans l'aperçu mis en forme. Chaque enregistrement met `maj` à la date du jour et relance `index.py` ; un fichier généré y est en lecture seule.
- Onglet Projets (ou `http://localhost:50000/projets/`) : chaque projet de `projets/` en deux vues. Atelier : la frise des jalons, puis ce qui entre, ce qui se fait, ce qui sort. Fiche : le fichier, avec ce qui a changé depuis la dernière lecture et l'historique Git. Chaque geste réécrit une ligne de la fiche. Nuit, jour et couleur se règlent dans l'onglet.
- Onglet Skills (ou `http://localhost:50000/competences/`) : le catalogue des skills, par famille (`metadata: famille:` dans l'en-tête de chaque `SKILL.md`, les familles dans `systeme/metadonnees.md`), avec la fiche de chacune : ce qu'elle fait, quand la lancer, où elle sert, son journal, ses retours et son usage sur 30 jours. De là, l'entretien : retours à appliquer, skills à surveiller, skills au repos. Un retour noté dans l'onglet s'écrit dans `feedback.md`, comme avec `/note`.
- Onglet Connecteurs (ou `http://localhost:50000/connecteurs/`) : le catalogue des outils de `systeme/connexions.md`, du plus léger au plus lourd, avec la fiche de chacun : comment il est branché, où il sert, ses appels sur 30 jours et son dernier test. De là, l'entretien : ce qu'il faut retester, ce qui mérite un œil (appelé mais pas inscrit, MCP lourd, commande vide), ce qui ne sert plus, et l'historique Git du tableau. La page n'écrit rien : chaque geste se copie comme une demande pour l'agent.
- Onglet Outbox (ou `http://localhost:50000/outbox/`) : ce que l'IA a écrit ou modifié ces 7 derniers jours, par jour, groupé par projet ou par discussion, lu dans les journaux de session de Claude Code et dans Git. Chaque fichier a son aperçu, et « Valider » le sort de l'outbox sans le déplacer (une ligne dans `outbox/ranges.md`).
- Menu à gauche des pages Projets, Skills, Connecteurs et Outbox : il passe de l'une à l'autre, et se replie.
- Pour la modifier ou la réparer : `interface/skills/agenticos/SKILL.md` et les guides de `interface/`.

## Routines

- Une routine = un prompt qui appelle une skill, lancé par `systeme/scripts/lancer.py` depuis un planificateur neutre (cron, launchd, Hermes).
- Une routine directe lance une commande, sans IA : à préférer quand il n'y a rien à juger.
- Liste, horaires, type (active ou passive) et plafond de coût : `systeme/routines.md`.

## Connexions

Dans l'ordre : l'outil officiel, une CLI de la communauté, l'API, puis un MCP de la communauté (pour chercher : skill `search-connectors`). Inscris chaque connexion dans `systeme/connexions.md` après une vraie lecture. Les clés vivent dans `.env` : ne les lis pas, ne les demande jamais dans le chat.

## En compactant une discussion

Garde les décisions, les règles, les gabarits et les chemins des fichiers créés ou modifiés.

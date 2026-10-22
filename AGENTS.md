# AGENTS.md

> Toute règle et toute carte s'écrivent ici. `CLAUDE.md` et `GEMINI.md` ne contiennent que l'import de ce fichier.

## Qui

Thomas Richard, formateur et consultant IA : le Club SMART, une chaîne YouTube et du consulting.
Réponds en français, avec des phrases courtes et des mots simples.
Ce que tu sais d'autre sur Thomas est dans `memory/` (souvenirs `user_`).

## Les deux portes

- `inbox/` : ce que Thomas dépose. Tu n'y écris jamais ; tu la vides en rangeant.
- `outbox/` : ce qui sort. Le point du jour dans `outbox/points/AAAA-MM-JJ.md`, la page `outbox/index.html` (générée).
- Chaque nuit à 2 h, la skill `rangement` vide l'inbox, range l'outbox et écrit le point du jour.

## Carte des domaines

| Domaine | Ce qu'il couvre | Routeur |
|---|---|---|
| contenu | YouTube, newsletter, réseaux sociaux, idées de vidéos ; revenus d'audience (YouTube, sponsoring, affiliation), grille tarifaire, kit média | `routers/contenu.md` |
| communaute | Club SMART, communauté Skool, abonnements | `routers/communaute.md` |
| consulting | Accompagnements individuels et de groupe : transcriptions de séance, rapports, supports | `routers/consulting.md` |
| produits | SM4RT dans sa version publiée, puis les produits suivants | `routers/produits.md` |
| operations | Pilotage (OKR, revue hebdo, revenus), admin et finances pro, SM4RT comme outil de travail | `routers/operations.md` |
| perso | À définir | `routers/perso.md` |

Chaque source de revenu reste dans le domaine qui la produit. La vue d'ensemble tient dans un seul tableau : `domaines/operations/revenus.md`.

## Projets actifs

Aucun pour l'instant. Format : `- [<slug>](projets/<slug>.md) · <domaine> · <prochaine étape>`

## Où chercher

| Pour… | Lis |
|---|---|
| Un domaine | son routeur dans `routers/` |
| Un inventaire ou un statut | l'`_index.md` du dossier |
| Une image ou un média | l'`_images.md` du dossier |
| Une préférence, une correction déjà donnée | `memory/MEMORY.md` |
| Un concept, une source | `savoir/_index.md` |
| Qui fait foi, où va quoi | `systeme/doctrine.md` |
| Une décision passée | `journal/decisions.md` |

## Règles

1. Deux sauts au plus : ce fichier, puis un routeur ou un index, puis le fichier.
2. Un objet, un fichier, un endroit. Tout est rangé par domaine, livrables compris. On lie, on ne copie jamais.
3. Le statut est un champ de l'en-tête, pas un dossier. Un objet garde son chemin toute sa vie.
4. Chaque fichier texte a un en-tête (gabarit : `systeme/gabarits/fiche.md`).
5. Chaque dossier qui contient des images a son `_images.md` : une ligne par image (fichier, ce qu'elle montre, origine, usage). Écris la ligne dès que l'image arrive.
6. Les `_index.md` sont générés par `systeme/scripts/index.py`. Ne les écris jamais à la main ; relance le script après avoir écrit un fichier.
7. Quand un fichier bouge ou qu'un projet démarre, mets à jour le routeur concerné, et la liste des projets actifs ci-dessus, dans le même tour.
8. Nommage : minuscules, tirets, sans espaces ni accents. Daté : `AAAA-MM-JJ-<slug>.md`. Durable : `<slug>.md`. Un objet qui a plusieurs fichiers a son dossier.
9. Ne supprime rien : déplace dans `archives/`.
10. Pas de vidéo ni de son dans le dépôt : l'index pointe vers les fichiers lourds.
11. Les skills système, `systeme/scripts/` et `systeme/doctrine.md` restent neutres, sans rien de personnel : ils forment le socle du kit.

## Mémoire

- Quand Thomas dit « retiens », écris un fichier dans `memory/` et ajoute sa ligne dans `memory/MEMORY.md`. N'utilise jamais la mémoire propre à l'agent.
- Types : `user_` (un fait sur Thomas), `feedback_` (une correction), `reference_` (un standard ou un emplacement).
- Une correction donnée deux fois est un échec de la mémoire : propose `/calibrate`.

## Skills

- Elles existent une seule fois, dans `skills/<nom>/` : `SKILL.md` court, `references/`, `feedback.md`.
- `.claude/skills` et `.agents/skills` sont des liens vers `skills/`.
- Le modèle d'une skill est dans `systeme/modeles.md`, jamais dans la skill.
- Un retour à mettre de côté va dans `skills/<nom>/feedback.md` (`/note`) ; il est appliqué quand Thomas le demande.

## Routines

- Une routine = un prompt qui appelle une skill, lancé par `systeme/scripts/lancer.py` depuis un planificateur neutre (cron, Hermes).
- Liste, horaires, type (active ou passive) et plafond de coût : `systeme/routines.md`.

## Connexions

Dans l'ordre : l'outil officiel, une CLI de la communauté, l'API, puis un MCP de la communauté. Inscris chaque connexion dans `systeme/connexions.md` après une vraie lecture. Les clés vivent dans `.env` : ne les lis pas, ne les demande jamais dans le chat.

## En compactant une discussion

Garde les décisions, les gabarits et les chemins des fichiers créés ou modifiés.

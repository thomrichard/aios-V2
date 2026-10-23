---
type: cloture
resume: Bilan de session, de la connexion Skool à la skill skool-ops (voix et types de posts de Thomas) et au dépôt privé du V2
cree: 2026-10-23
maj: 2026-10-23
liens: [../../skills/skool-ops/SKILL.md, ../../skills/skool-ops/references/voix.md, ../../skills/skool-ops/references/types-de-posts.md, ../../systeme/connexions.md]
---
# Skool, voix des posts et dépôt privé

## Périmètre
Vérifier la connexion à Skool par la CLI maison, la brancher dans le V2, reprendre les skills Skool de l'ancien workspace, puis sauvegarder le V2 dans un dépôt privé.

## Réalisé
- Connexion `skool-pp-cli` testée par une vraie lecture (188 membres renvoyés), inscrite dans `systeme/connexions.md` et `routers/communaute.md`.
- Skill `skool-ops` reprise dans `skills/skool-ops/`, avec `api.md`, `pieges.md` et `payants.md`.
- Lecture des 79 posts de Thomas dans le fil du Club SMART (du 17 février au 20 octobre 2026) : références `voix.md` et `types-de-posts.md`.
- Session parallèle « Rebrancher le toolkit Skool sur le V2 » : état des lieux, plan, puis migration du toolkit vers `~/Dev/skool-toolkit` (son travail est dans le commit `a0e721f`).
- Dépôt GitHub privé `thomrichard/aios-thomas` : `main` y est poussé (`branch.main.pushRemote prive`). Historique vérifié avant le premier envoi : aucun secret.
- PR n° 5 du socle récupérée (`youtube.py` écrit `cree`) et poussée.
- Commits : `f7db54f` (Skool), `c9bf8e4` (fusion du socle).

## Décisions
- Skool passe par la CLI maison `skool-pp-cli`.
- `skool-ops` est reprise ; `skool-engage` est écartée ; `voix-skool` devient deux références de `skool-ops`.
- Posts Skool : tutoiement pour tout le monde, liens permis, aucun emoji écrit par R4.
- Le toolkit a son propre dépôt privé : le code y va, les données des membres non.
- Le V2 a son dépôt privé `aios-thomas` ; le socle public ne reçoit jamais `main`.

Le détail et le pourquoi : `journal/decisions.md`.

## Propositions non engagées
- Un crochet Git qui bloquerait `git push socle main` : évoqué, pas mis en place.
- Ce qui fait réagir dans le fil (appel à volontaires, vie du Club, gros contenu utile) : constats dans `types-de-posts.md`, aucune action décidée.

## Limites
- Les chiffres d'engagement datent du 2026-10-23 et portent sur 79 posts ; les commentaires comptent aussi les réponses de Thomas.
- Les 79 posts bruts n'ont pas été gardés : ils se récupèrent avec `skool_fetch_feed_comments.py`.
- En cours de session, `index.py` a vidé quelques secondes la carte des domaines d'`AGENTS.md`, faute de domaines dans `systeme/metadonnees.md` ; une autre session les y a ajoutés, et la carte est revenue.
- `skool-ops` a été enrichie depuis par d'autres sessions (main sur Skool, envoi d'un module) : ce bilan décrit la reprise, pas l'état actuel de la skill.

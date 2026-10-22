# Doctrine : qui fait foi, où va quoi

## Qui fait foi

| Objet | Fait foi | Index |
|---|---|---|
| Règles, carte des domaines, projets actifs | `AGENTS.md` | — |
| Fichier texte | son en-tête | `_index.md` du dossier (généré) |
| Image | sa ligne dans `_images.md` du dossier | — |
| Projet | `projets/<slug>.md` | `projets/_index.md` (généré) |
| Souvenir | `memory/<type>_<sujet>.md` | `memory/MEMORY.md` |
| Skill | `skills/<nom>/SKILL.md` | le routeur du domaine qui l'utilise |
| Modèle d'une skill | `systeme/modeles.md` | — |
| Routine | `systeme/routines.md` | — |
| Connexion | `systeme/connexions.md` | — |
| Décision | `journal/decisions.md` | — |

## Où va quoi

| Ce que c'est | Où ça va |
|---|---|
| Un objet d'un domaine | `domaines/<domaine>/` ; un dossier à lui s'il a plusieurs fichiers |
| Une production datée (post, newsletter) | `domaines/<domaine>/<type>/AAAA-MM-JJ-<slug>.md` |
| Un livrable, texte ou visuel | dans son domaine, jamais dans `outbox/` |
| Un projet | `projets/<slug>.md` ; ses fichiers restent dans leur domaine |
| Une connaissance durable | `savoir/concepts/` ou `savoir/sources/` |
| Un média généré, un composant d'interface | `bibliotheques/medias/`, `bibliotheques/composants/` |
| Un élément de l'inbox déjà traité | `archives/inbox/AAAA-MM/` |
| Un point du jour coché ou vieux de plus de 7 jours | `archives/outbox/` |

## En-tête

Gabarit : `systeme/gabarits/fiche.md`. Champs : `type`, `resume` (une ligne, reprise dans l'index), `statut`, `domaine`, `projet` (facultatif), `maj`, `liens`.

Statuts communs : `idee`, `en-cours`, `a-valider`, `publie`, `clos`. Un domaine peut préciser les siens dans son routeur.

## Nommage

- Minuscules, tirets, sans espaces ni accents.
- Daté : `AAAA-MM-JJ-<slug>.md`. Durable : `<slug>.md`.
- Pas de dossier fourre-tout (`notes/`, `misc/`, `tmp/`). Un nouveau dossier se justifie par deux « oui » sur trois : concept nouveau, usage répété le mois suivant, place pour une future skill.

## Plafonds

| Fichier | Plafond |
|---|---|
| `AGENTS.md` | 150 lignes |
| `routers/<domaine>.md` | 50 lignes |
| `memory/MEMORY.md` | 100 lignes |
| `_index.md` | 100 lignes |
| `SKILL.md` | 60 lignes |
| `outbox/points/` | 7 jours |

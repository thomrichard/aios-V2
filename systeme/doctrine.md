# Doctrine : qui fait foi, où va quoi

## Qui fait foi

| Objet | Fait foi | Index |
|---|---|---|
| Règles | `AGENTS.md` | — |
| Domaines, champs d'un en-tête, types et statuts | `systeme/metadonnees.md` | la carte d'`AGENTS.md` (générée) |
| Fichier texte | son en-tête | `_index.md` du dossier (généré) |
| Image | sa ligne dans `_images.md` du dossier | — |
| Projet | `projets/<slug>.md` | `projets/_index.md`, et les projets actifs d'`AGENTS.md` (générés) |
| Souvenir | `memory/<type>_<sujet>.md` | `memory/MEMORY.md` |
| Skill | `skills/<nom>/SKILL.md` | `skills/_index.md` (généré), et le routeur du domaine qui l'utilise |
| Process | le tableau des étapes de `processus/<slug>.md` | `processus/_index.md` (généré), et le routeur du domaine qui le porte |
| Modèle d'une skill | `systeme/modeles.md` | — |
| Routine | `systeme/routines.md` | — |
| Connexion | `systeme/connexions.md` | — |
| Décision | `journal/decisions.md` | — |

## Où va quoi

La place exacte d'un fichier se déduit de son en-tête : colonne « Chemin » de son type dans `systeme/metadonnees.md`. La skill `classer` choisit l'en-tête, `systeme/scripts/ranger.py` range le fichier, et `verifier.py` signale un fichier qui n'est pas à sa place.

| Ce que c'est | Où ça va |
|---|---|
| Un objet d'un domaine | `domaines/<domaine>/` ; un dossier à lui s'il a plusieurs fichiers |
| Une production datée (post, newsletter) | `domaines/<domaine>/<slug>-AA-MM.md`, sans dossier par type |
| Un livrable, texte ou visuel | dans son domaine, jamais dans `outbox/` |
| Un projet | `projets/<slug>.md` ; ses fichiers restent dans leur domaine |
| Un process (une suite de skills qui revient) | `processus/<slug>.md` ; ses skills restent dans `skills/` |
| Une connaissance durable (concept, source) | `savoir/<slug>.md` |
| Un média généré, un composant d'interface | `bibliotheques/medias/`, `bibliotheques/composants/` |
| Une capture de l'extérieur (veille, e-mail) | `inbox/`, avec `source:` dans l'en-tête ; le rangement de 2 h la classe |
| Un PDF, un lien, un fichier qui ne peut pas porter d'en-tête | une fiche à son nom (skill `fiche`), qui le résume et lui sert d'index ; le fichier va à côté d'elle |
| Une vidéo, un son | le dossier des fichiers lourds (`FICHIERS_LOURDS` dans `.env`, un dossier Google Drive synchronisé par exemple), hors du dépôt ; sa fiche reste dans le workspace, champ `fichier` |
| Une image | le dossier qui s'en sert, avec sa ligne dans `_images.md` |
| Une question du rangement qui attend ta réponse | `outbox/questions.md` ; l'élément attend dans l'inbox |
| Un profil d'installation | `inbox/`, puis `archives/inbox/` une fois installé |
| Un entretien (`grill-me`) | `journal/entretiens/<sujet>-AA-MM.md` |
| Le bilan d'une session longue (`close`) | `journal/clotures/<sujet>-AA-MM.md` |
| Le code d'un tiers (l'interface de Jay) | `interface/`, avec sa licence ; il garde ses propres règles (pas d'en-tête, pas d'`_index.md`) |
| Un élément de l'inbox déjà traité | `archives/inbox/AAAA-MM/` |
| Un point du jour coché ou vieux de plus de 7 jours | `archives/outbox/` |

## En-tête

Gabarit : `systeme/gabarits/fiche.md`. Les domaines, les champs, les types et leurs statuts ne se règlent que dans `systeme/metadonnees.md`. `systeme/scripts/index.py` répercute les domaines dans la carte d'`AGENTS.md` et dans l'interface ; `systeme/scripts/verifier.py` signale un en-tête qui s'en écarte.

Le socle fournit une base qui marche sans rien changer. Les domaines et les types d'un workspace (contenu, vidéo, proposition…) vont dans la section « Ce workspace » de `systeme/metadonnees.md` : la skill `installation` les propose depuis son catalogue.

## Nommage

- Minuscules, tirets, sans espaces ni accents.
- Daté : `<slug>-AA-MM.md`, le titre d'abord, puis l'année et le mois de `cree`. Durable : `<slug>.md`. Le point du jour garde le nom de son jour (`outbox/points/AAAA-MM-JJ.md`).
- Pas de dossier par type : le type est dans l'en-tête. Seul le domaine est un dossier ; un objet de plusieurs fichiers a le sien.
- Pas de dossier fourre-tout (`notes/`, `misc/`, `tmp/`). Un nouveau dossier se justifie par deux « oui » sur trois : concept nouveau, usage répété le mois suivant, place pour une future skill.

## Mettre à jour AGENTS.md

| Section | Qui la remplit | Quand elle change |
|---|---|---|
| Qui (nom de l'agent, rôle, ton, qui est l'utilisateur) | la skill `installation`, depuis le profil ou l'entretien | seulement à la demande de l'utilisateur |
| Objectifs (les cibles de l'année) | la skill `installation` | à chaque revue trimestrielle : l'agent vérifie que les cibles sont toujours vraies face aux OKR, et propose la mise à jour |
| Carte des domaines | `systeme/scripts/index.py`, depuis `systeme/metadonnees.md` | à chaque lancement du script ; on ne l'écrit jamais à la main |
| Projets actifs | `systeme/scripts/index.py`, depuis l'en-tête des fichiers de `projets/` | à chaque lancement du script ; on ne l'écrit jamais à la main |
| Règles, comment tu travailles | l'agent, après accord | quand une règle manque ou qu'une correction revient ; une ligne, au bon endroit, et le pourquoi dans `journal/decisions.md` |

- Les cibles de l'année font foi dans `AGENTS.md` ; les OKR du trimestre dans `domaines/operations/okr.md`. On ne recopie pas l'un dans l'autre.
- Jamais de réécriture complète sans demande.
- Au-delà de 150 lignes, le détail part dans un routeur ou dans `systeme/`.
- Le `CLAUDE.md` global de la machine reste vide : tout vit dans le workspace, donc tout reste portable.

## Plafonds

| Fichier | Plafond |
|---|---|
| `AGENTS.md` | 150 lignes |
| `routers/<domaine>.md` | 50 lignes |
| `memory/MEMORY.md` | 100 lignes |
| `_index.md` | 100 lignes |
| `SKILL.md` | 60 lignes |
| `outbox/points/` | 7 jours |

---
type: support
resume: démo convention jour 1 : pièce jointe de la leçon « CLAUDE.md, doctrine et conventions »
statut: publie
domaine: communaute
cree: 2026-07-11
maj: 2026-10-24
liens: [07-claude-md-doctrine-et-conventions.md]
---
# Conventions du vault — Référence détaillée

> Conventions de nommage, routing et templates. `CLAUDE.md` y fait référence.

---

## Nommage des fichiers

- **kebab-case**, sans accents ni espaces : `idee-newsletter-aout.md`, pas `Idée Newsletter Août.md`.
- Un fichier = un objet (une idée, un projet, une référence). Pas de fichiers fourre-tout.
- Préfixes optionnels pour typer la capture dans `0 - Inbox/` :
  - `meeting-YYYY-MM-DD-<sujet>.md` — note de réunion
  - `idee-<sujet>.md` — idée en vrac
  - `veille-<source>-<sujet>.md` — veille brute

**Synthèse de vidéo YouTube** (note récurrente de Thomas) : préfixe `synthese-yt-<chaine>-<sujet>.md`,
rangée dans `3 - Ressources/Veille-YouTube/`. Structure → *Template de note vidéo* plus bas.
Toujours relier les concepts extraits aux fiches concept via `[[wikilinks]]`.

**Système note vidéo ↔ fiche concept** (workflow standard pour toute vidéo) :
- La **note vidéo** est une source figée : trace de la vidéo + liste des concepts abordés en `[[liens]]`.
- Chaque concept a une **fiche évergreen** dans `3 - Ressources/Concepts/`, enrichie à vie.
- Procédure à chaque nouvelle vidéo :
  1. Créer la note vidéo dans `Veille-YouTube/` + l'ajouter à l'index `veille-youtube.md`.
  2. Pour chaque concept : si la fiche existe → ajouter un bloc daté `### [YYYY-MM-DD] — [[note-video]]`
     sous `## Alimenté par` (ne jamais écraser les blocs précédents), et raffiner Définition/Points clés
     si besoin. Sinon → créer la fiche dans `Concepts/` + l'ajouter à l'index `concepts.md`.
  3. Logger dans `log.md`.
- Granularité des concepts : **larges et réutilisables** (`mega-prompt`), pas hyper-spécifiques.

---

## Routing des contenus

| Type de contenu | Dossier cible |
|---|---|
| Capture rapide non triée | `0 - Inbox/` |
| Avancement d'un objectif daté | `1 - Projets/<projet>/` |
| Suivi d'une responsabilité continue | `2 - Casquettes/<casquette>/` |
| Référence réutilisable, template, méthode | `3 - Ressources/` |
| Objet terminé ou en pause | `4 - Archives/` |

En cas de doute, déposer dans `0 - Inbox/` avec une note du contexte, et trancher plus tard.

---

## Index des dossiers

Chaque dossier possède un fichier index. **Lis l'index avant de descendre dans les fichiers.**

| Dossier | Index |
|---|---|
| `0 - Inbox/` | `inbox.md` |
| `1 - Projets/` | `projets.md` |
| `2 - Casquettes/` | `casquettes.md` |
| `3 - Ressources/` | `ressources.md` |
| `4 - Archives/` | `archives.md` |

Quand tu crées ou déplaces un fichier, mets à jour l'index du dossier concerné.

---

## Template de fiche projet

```markdown
# [Nom du projet]

**Statut :** actif | en pause | terminé
**Début :** YYYY-MM-DD
**Objectif :** [ce que « terminé » veut dire]

## Contexte
[Pourquoi ce projet, ce qu'il doit produire]

## Avancement
- [ ] Étape 1
- [ ] Étape 2

## Liens
[[pages liées]]
```

## Template de fiche casquette

```markdown
# [Nom de la casquette]

**Standard à maintenir :** [à quoi ressemble « bien tenu »]

## Quoi
[Ce que recouvre ce rôle / cette responsabilité]

## Routines
[Ce qui revient régulièrement]

## Liens
[[projets et ressources rattachés]]
```

## Template de note vidéo (source, dans `Veille-YouTube/`)

```markdown
# [Titre de la vidéo] — [Chaîne]

**Source :** [URL YouTube]
**Vu le :** YYYY-MM-DD
**Chaîne :** [nom]

## Synthèse
[Les 2-3 idées à retenir, pas un résumé exhaustif]

## Concepts abordés
- [[concept-1]] — l'angle spécifique de cette vidéo, en une ligne
- [[concept-2]] — en une ligne

## À creuser / actions
- [ ] [idée de contenu, test, projet déclenché par la vidéo]
```

## Template de fiche concept (évergreen, dans `Concepts/`)

```markdown
# [Nom du concept]

**Type :** concept
**Créée le :** YYYY-MM-DD

## Définition
[Ce que c'est. Se raffine avec le temps.]

## Points clés
- [Ce que je retiens, consolidé toutes sources confondues]

## Alimenté par
### [YYYY-MM-DD] — [[note-video]]
- Ce que CETTE source apporte de spécifique. Un nouveau bloc daté par vidéo.

## Concepts liés
[[autre-concept]]
```

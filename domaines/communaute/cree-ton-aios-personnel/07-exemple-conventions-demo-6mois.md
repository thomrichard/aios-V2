---
type: support
resume: démo convention 6 mois : pièce jointe de la leçon « CLAUDE.md, doctrine et conventions »
statut: publie
domaine: communaute
cree: 2026-07-21
maj: 2026-10-24
liens: [07-claude-md-doctrine-et-conventions.md]
---
# Conventions du Vault — Référence détaillée

> **Exemple « après plusieurs mois d'usage »** (pièce jointe de la leçon C9-L5).
> Compare-la à la version « jour 1 » : mêmes rubriques au départ, mais chaque règle s'est
> précisée au contact du réel (un kanban qui se stabilise, une doctrine de stockage média
> qui se durcit, un historique de migration qui s'accumule). Identifiants internes masqués.
> Ne la recopie pas : les tiens seront différents, et c'est le but.

Ce fichier contient les conventions de nommage, templates et
protocoles détaillés. CLAUDE.md y fait référence.

---

## Convention de nommage des fichiers

| Type | Convention | Exemple |
|---|---|---|
| Lecon classroom | `C[X]-L[Y]-slug.md` ou `C[X][lettre]-L[Y]-slug.md` si plusieurs classrooms partagent le même numéro de pilier | `C1-L2-les-5-niveaux-ia.md`, `C2D-L1-jour-1-pourquoi-un-audit.md` |
| Post Skool | `01-[slug].md` | `01-post-bienvenue.md` |
| Fichier meta | `00-[slug].md` | `00-identite-marque.md` |
| Script YouTube | `YT-[slug]-v[N].md` | `YT-claude-excel-v1.md` |
| Fiche pilote vidéo (folder note) | `[slug].md` dans `Mes-Vidéos/[slug]/` | `3min-agents-ia.md` |
| Email nurturing | `EMAIL-[N]-[slug].md` | `EMAIL-4-la-preuve.md` |
| Ressource generique | `[slug].md` | `regle-10-80-10.md` |
| Note de travail / brainstorm / version de stratégie | `[sujet]-[angle]-v[N].md` — kebab-case, 4-6 mots qui **résument le contenu** (sujet + angle + version). Jamais les premiers mots d'une phrase ni un nom auto-généré. Le nom doit suffire à deviner le contenu sans ouvrir le fichier. Routing : stratégie → `00 — Meta/` (préfixe `00-`), sinon `0 - Inbox/` | `00-monetisation-v1-payant-2-tiers.md` |
| Fiche N8N workflow | `N8N-[slug].md` | `N8N-veille-youtube.md` |

---

## Routing des contenus

| Type de contenu | Dossier cible |
|---|---|
| Vidéo YouTube — **tout stade** (idée → fermée) | `2 - Contenu/YouTube/Mes-Vidéos/[slug]/` — le stade vit dans `statut:`, pas dans l'emplacement |
| Posts Skool rediges | `2 - Contenu/Club Smart/01 — Feed & Catégories/` |
| Lecons des classrooms | `2 - Contenu/Club Smart/02 — Classrooms/C[X]-[nom]/` |
| Emails nurturing | `2 - Contenu/Club Smart/03 — Lead Magnet/` |
| Contenu identite / strategie | `2 - Contenu/Club Smart/00 — Meta/` |
| Fiches N8N workflows | `4 - Ressources/N8N-Workflows/` |
| Articles/tutos outils IA (evergreen) | `4 - Ressources/Outils/` |
| Inspirations / idees non triees | `0 - Inbox/` |

> Les vidéos YouTube ne sont **pas** archivées dans `5 - Archive/` : une vidéo terminée reste dans
> `Mes-Vidéos/[slug]/` avec `statut: fermée` (voir « Kanban vidéo YouTube » ci-dessous).

---

## Kanban vidéo YouTube — piloté par statut

**Toutes les vidéos vivent dans `Mes-Vidéos/[slug]/`, quel que soit le stade.** C'est le frontmatter `statut:` qui fait la colonne, pas l'emplacement. On déplace une vidéo en **changeant son `statut`** — au **Kanban AIOS** (drag = réécrit le frontmatter) ou à la main — jamais en déplaçant le dossier.

`statut` : `idée` → `script` → `en montage` → `programmé` → `déployé` → `fermée`.
(`déployé` = en ligne et active ; `fermée` = fin de vie, plus poussée — archivée sans quitter `Mes-Vidéos/`.)

- **Créer une idée** = une fiche `Mes-Vidéos/[slug]/[slug].md` avec `statut: idée` (le bouton « + » du Kanban AIOS le fait).
- **Deux points d'entrée**, mêmes fiches : le **Kanban AIOS** (interactif) et le tableau de bord markdown.
- La **fiche pilote** `[slug].md` est le registre **et** le tableau de bord de la vidéo : frontmatter (`statut`, `montage_hf`, `archive`, `date_publication`, tableau `formats`) + liens vers tout le reste du dossier. Gabarit : `Mes-Vidéos/_TEMPLATE/fiche-video.md`.
- Les **scripts gardent leur basename** `YT-[slug]-v[N].md` (backlinks préservés). **Source de vérité des scripts = le Vault markdown.**

### Le dossier `[slug]/` = le projet complet de la vidéo

Tout ce qui n'existe **que** grâce à cette vidéo vit dans son dossier ; ce qui a une vie propre (un post transversal sur plusieurs vidéos) vit dans sa zone (LinkedIn/Skool) et est seulement **lié** depuis la fiche.

```
Mes-Vidéos/[slug]/
├── [slug].md          fiche pilote (statut + liens vers tout le reste)
├── YT-[slug]-v1.md    script
├── description.md     description YouTube
├── packaging.md       titre + miniature
├── transcript.txt
├── vignettes/         miniatures
├── slides/            écrans titres (Excalidraw)
└── promo/             dérivés d'annonce de CETTE vidéo
    ├── linkedin.md    post LinkedIn d'annonce
    ├── skool.md       post Skool d'annonce
    └── shorts/        captions des déclinaisons 9:16 / TikTok
```

Règle : *dérivé d'une seule vidéo → dans `promo/` ; transversal → lié, pas déplacé.* (Pensé pour automatiser plus tard « vidéo publiée → générer ses posts d'annonce ».)

### Formats : 1 vidéo = 1 contenu = 1 projet, plusieurs formats

Un même contenu se décline en plusieurs formats (16:9 master + un ou plusieurs shorts 9:16). **Tous les formats vivent dans un seul projet Hyperframes** `~/hyperframes/[slug]/` :

- `index.html` = master 16:9 ; chaque autre format = une **composition** interne `compositions/9x16.html`, `compositions/9x16-[angle].html`, … (déclare sa propre résolution).
- Une composition en sous-dossier référence les polices en `../fonts/` ; les `assets/` se résolvent depuis la racine du projet. Rendu : `render -c compositions/9x16.html -o renders/[slug]-9x16.mp4`.
- **Jamais de projet HF frère par format** (`[slug]-9x16/` interdit) : ça duplique la source 4K et ment sur « une seule vidéo ».
- La fiche pilote porte un **tableau Formats** (`format ↔ composition ↔ render ↔ durée ↔ diffusion ↔ url ↔ statut`) : c'est l'index des déclinaisons et leur diffusion. Le `statut` peut différer par format (16:9 publié, short encore en montage).
- **Distinguer contenu concept vs présentation** : « Concepts clés » de la fiche = ce dont parle la vidéo (fiches `4 - Ressources/Concepts/`, vie propre). « Posts de présentation » = posts qui lancent la vidéo (liés depuis la fiche). Les deux ne se mélangent pas.

### Doctrine de stockage média (le Vault ne stocke jamais de vidéo/audio)

Le Vault ne contient que du texte + des pointeurs. La fiche pilote suit le master au fil de sa vie :

| Température | Où | Quoi | Durée de vie |
|---|---|---|---|
| 🔥 Chaud (prod) | `~/hyperframes/[slug]/` | source partagée (`assets/`) + `index.html` (16:9) + `compositions/*.html` (shorts) + tous les rendus dans `renders/` | transitoire |
| 🟡 Publié | YouTube (champ `url`) | version diffusée | permanent |
| 🧊 Froid (archive) | Disque externe `/[DD]/YT-Masters/[slug]/` | master 4K + rushes/sources | long terme |

- **Purge Hyperframes = manuelle, quand l'espace manque** ; vérifier d'abord que la vidéo est déployée sur YouTube (et, à terme, master + rushes sur le disque externe).
- Ne jamais laisser de `.mp4`/`.wav`/`.mp3` dans le Vault → les sortir vers `~/hyperframes/[slug]/assets/` ou le disque externe.

---

## Fiches N8N Workflows

> La **procédure** de création/validation d'un workflow n8n (recherche de nodes,
> `validate_node`, `validate_workflow`, test en dev, règles de sécurité) est une
> **capacité** → elle vit dans les skills `n8n-mcp-tools-expert` et
> `n8n-workflow-patterns`, pas ici (doctrine Règle 7 : une procédure ≠ une convention).

Ce qui reste une **convention** : la fiche-projection Vault d'un workflow vit dans
`4 - Ressources/N8N-Workflows/`, nommée `N8N-[slug].md`, au format ci-dessous.

### Template de fiche N8N Workflow

```markdown
# [Nom du workflow]

**Statut :** actif | en dev | archive
**Trigger :** [webhook / schedule / manuel / autre]
**Nodes utilises :** [Airtable, Gmail, Claude, ...]
**Credentials requis :** [liste des comptes/cles]
**Lien N8N :** [URL dans <ton-instance>.app.n8n.cloud]

## Cas d'usage
[A quoi ca sert, quel probleme ca resout]

## Quand l'utiliser
[Contexte d'usage, frequence, declencheur]

## Contexte et notes d'utilisation
[Details pratiques, limites, dependances]
```

---

## Index des dossiers du vault

Chaque dossier possede un fichier index. Lis l'index avant de descendre dans les fichiers.

| Dossier | Index |
|---|---|
| `0 - Inbox/` | `Inbox.md` |
| `1 - Projets/` | `projets.md` |
| `2 - Contenu/` | `contenu.md` |
| `2 - Contenu/Club Smart/` | `club-smart.md` |
| `2 - Contenu/Club Smart/00 — Meta/` | `meta.md` |
| `2 - Contenu/Club Smart/01 — Feed & Catégories/` | `feed.md` |
| `2 - Contenu/Club Smart/02 — Classrooms/` | `classrooms.md` |
| `2 - Contenu/Club Smart/03 — Lead Magnet/` | `lead-magnet.md` |
| `2 - Contenu/YouTube/` | `youtube.md` |
| `2 - Contenu/YouTube/Mes-Vidéos/` | `mes-videos.md` — **toutes les vidéos**, 1 dossier `[slug]/` par vidéo, stade = `statut` |
| `3 - Casquettes/` | `casquettes.md` |
| `4 - Ressources/` | `ressources.md` |
| `4 - Ressources/N8N-Workflows/` | `n8n-workflows.md` |
| `4 - Ressources/Concepts/` | `concepts.md` |
| `4 - Ressources/Profil-Pro/` | `profil-pro.md` |
| `5 - Archive/` | `archive.md` |

---

## log.md — rotation semestrielle

`log.md` reste append-only. À chaque changement de semestre (janvier, juillet), basculer
les entrées du semestre écoulé dans `log-YYYY-SN.md` à la racine (ex : `log-2026-S1.md`)
et repartir d'un `log.md` léger.

---

## Historique de migration (contexte, pas des règles)

Les conventions ci-dessus sont l'état **courant**. Ce qui suit explique d'où on vient —
utile pour comprendre un vieux fichier, jamais pour router un nouveau.

- **2026-06-12 — Kanban vidéo** : passage de « emplacement = statut » (tiroirs `Idées/`,
  `Scripts/`) au statut porté par le frontmatter dans `Mes-Vidéos/[slug]/`. Les anciens
  tiroirs sont conservés en l'état mais **plus jamais alimentés**.
- **2026-06-27 — Pipeline Airtable Concepts** abandonné au profit du réservoir unique
  `4 - Ressources/Concepts/` typé par frontmatter (doctrine Règle 1).

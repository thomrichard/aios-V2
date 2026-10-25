---
type: support
resume: démo doctrine 6 mois : pièce jointe de la leçon « CLAUDE.md, doctrine et conventions »
statut: publie
domaine: communaute
cree: 2026-07-11
maj: 2026-10-24
liens: [07-claude-md-doctrine-et-conventions.md]
---
> Copie de partage (Skool, leçon C9-L5) — identifiants internes masqués. Original : `.claude/` du Vault de Thomas. Générée le 2026-07-11.

# Doctrine — Architecture du second cerveau

Ce document est la référence d'architecture du système de Thomas. Toute question
"où ça vit ? qui lit quoi ? quel outil choisir ?" se résout ici. À mettre à jour
explicitement, pas à ignorer.

Posée le 2026-04-22. Dernière purge : 2026-07-09 (retrait des pipelines Airtable jamais
construits — Fathom→Airtable, Web Clipper→Airtable — et bascule Fathom → Otter pour les
meetings).

---

## Principe central

Le **Vault Obsidian (IPCCRA) est la source de vérité par défaut** : pensée, synthèse,
navigation par backlinks, drafts, travail — et de plus en plus le stockage de référence
lui-même (markdown, portable, versionné GitHub).

Autour, des **satellites** : soit une **origine** (captation), soit une **destination**
(diffusion), soit un **stockage externe**.

| Rôle | Outils | Statut |
|---|---|---|
| **Source de vérité + hub** | Vault Obsidian (IPCCRA) | pérenne |
| **Origines (captation)** | Otter (transcripts), Gmail / Calendar | externes par nature |
| **Destinations (diffusion)** | YouTube, LinkedIn, Skool, Kit | externes par nature |
| **Stockage fichiers lourds** | Google Drive, disque externe, `~/hyperframes` | hors Vault (le Vault ne stocke pas les médias) |
| **Base structurée (legacy)** | Airtable (`appXXXXXXXXXXXXXX`, `appYYYYYYYYYYYYYY`…) | **en sortie** — crédits jusqu'à ~juin 2027, à rapatrier vers le Vault |

**Règle maîtresse :** tout ce qui vit ailleurs que dans le Vault a une **projection**
dans le Vault (miroir ou micro-synthèse + lien retour). Le Vault est le hub de navigation.

**Airtable n'est plus un pilier.** On ne crée plus de dépendance durable dessus. Les
pipelines qui y vivent encore (Système-Contenu : Sources → Concepts → Contenu →
Publications ; Back-Office / RecessLab) migrent progressivement vers le Vault markdown —
chantier séparé (mémoire `project_airtable_exit_deadline`).

---

## Règle 1 — Source de vérité par type d'asset

Par défaut : **le Vault**. Les mentions « Airtable » ci-dessous sont l'**état hérité en
migration**, pas une cible.

| Asset | Source de vérité (cible) | Statut |
|---|---|---|
| **Source** (article, vidéo, livre) | Vault (`4 - Ressources/` si valeur durable) | Airtable Sources = legacy à rapatrier |
| **Concept** (savoir + éditorial confondus) | Vault (`4 - Ressources/Concepts/`), typé par `type:` | pipeline Airtable Concepts = **en sortie** (voir bloc ci-dessous) |
| **Note brute** | Vault (`0 - Inbox/`) | Airtable Notes brutes = legacy |
| **Vidéo YouTube** (script, fiche pilote) | Vault (`2 - Contenu/YouTube/Mes-Vidéos/[slug]/`) | déjà Vault (acté 2026-06-08) ; médias hors Vault |
| **Meeting** | Otter (transcript) + Vault (synthèse obligatoire) | tranché 2026-07-09, remplace Fathom |
| **Publication** | Plateforme (version publiée) + Vault (draft + fiche) | stats : à redéfinir hors Airtable |
| **Tâche** | **à trancher** hors Airtable (dashboard AIOS / kanban Vault) | cadrage grill-me décidé le 2026-07-09, session à tenir |
| **Projet / Casquette** | Vault (`1 - Projets/`, `3 - Casquettes/` + index) | déjà Vault |

**Médias lourds — jamais dans le Vault.** Pour les vidéos, le Vault ne porte que le texte
(script, fiche pilote `[slug].md` : statut, url, montage, archive, stats). La vidéo/audio
suit une doctrine de stockage par température (Hyperframes chaud → YouTube publié → disque
externe froid). Détails : `.claude/conventions.md` (« Kanban vidéo YouTube »).

### Concepts — un seul réservoir typé dans le Vault

Un **concept** = une fiche unique dans `4 - Ressources/Concepts/`. Plus de séparation
éditorial / savoir par outil (l'ancien pipeline Airtable Concepts est en sortie). Un seul
réservoir, **typé par frontmatter `type:`** (concept, technique, framework, principe,
méthode, personne…). L'index `concepts.md` est généré par Dataview à partir de ce champ.

- **Grands concepts, pas des atomes jetables.** Une fiche se conserve et s'**enrichit** :
  quand un nouveau sujet (vidéo, source, leçon) parle d'un concept existant, on enrichit
  sa fiche (`sources`, `utilise_dans`) — jamais de doublon.
- **Liaison.** Concepts reliés par `[[wikilinks]]` et `aliases` ; deux concepts qui se
  recroisent se lient.
- **La dimension éditoriale est un usage, pas un entrepôt.** Un concept savoir peut être
  mobilisé pour un post / une vidéo / une newsletter — ça se trace dans `utilise_dans`,
  ça ne le déplace pas dans une autre base.
- **Pour l'IA :** avant de créer une fiche, vérifier l'existant (alias inclus) et enrichir
  si ça recoupe. Signaler de temps en temps les concepts mûrs pour devenir du contenu.

---

## Règle 2 — Liaison bidirectionnelle systématique

Toute projection Vault porte **le lien vers sa source**. Toute source Airtable
portant une projection porte **le lien vers la fiche Vault**.

Formats :
- Lien vers Airtable : `**Source :** [Voir dans Airtable](https://airtable.com/appXXXXXXXXXXXXXX/TABLE_ID/RECORD_ID)`
- Lien vers Otter : `**Transcript :** [Voir dans Otter](<url>)`
- Lien vers Drive : `**Fichier :** [Voir dans Drive](<url>)` ou chemin local
- Lien retour Airtable → Vault : champ `vault_path` avec chemin relatif `1 - Projets/...`

Sans lien retour, la projection est invalide.

---

## Règle 3 — Rôle de `0 - Inbox` : file de tâches pour l'IA

**Statut : cible, non implémentée.** Aucun workflow automatique ne scanne l'Inbox
aujourd'hui — elle est traitée **en session, à la demande**, par Claude. Le runner
(« Agent Inbox », voir [[4 - Ressources/outils]]) reste à construire.

La cible : `0 - Inbox/` n'est pas un sas humain passif mais une **file de traitement
pour l'IA**. Chaque fichier déposé dans `0 - Inbox/` porte un frontmatter avec
`agent_task:` qui décrit la consigne. Exemples :

```yaml
---
agent_task: extraire_concepts
source_url: https://...
---
```

```yaml
---
agent_task: synthese_meeting
fathom_id: 12345
---
```

À terme, un runner automatique scanne `0 - Inbox/`, exécute la tâche, range le fichier
résultant à sa place IPCCRA, log dans `log.md`. **En attendant**, traiter l'Inbox en
session = lire `agent_task:` s'il existe, sinon classer selon l'arbre IPCCRA.

Consignes `agent_task:` standards à définir progressivement. Démarrer avec :
`extraire_concepts`, `synthese_meeting`, `rediger_post_linkedin`, `classifier_et_ranger`.

---

## Règle 4 — Ordre de lecture et d'écriture de l'IA

**Lecture :**
1. Vault d'abord (index + micro-synthèses) — rapide, linké, contextualisé
2. Airtable via MCP ensuite — seulement pour le **legacy non encore migré** (détail brut, stats, relationnel)
3. Otter / Drive seulement sur demande explicite ou besoin de transcript complet

**Écriture :** l'IA écrit dans la source de vérité de l'asset (voir Règle 1),
puis crée ou met à jour la projection Vault avec son lien retour (Règle 2).

---

## Règle 5 — Règle d'ajout d'un nouvel outil

**Aucun outil n'est ajouté au stack** si la capacité qu'il apporte est déjà
couverte par le stack existant (Vault, Otter, Drive, n8n, Kit,
Excalidraw, skills Claude).

Cas d'exception envisagé : **test comparatif 7 jours** avec métriques explicites
(friction de saisie, vitesse, rétention) avant d'intégrer le nouvel outil à la
doctrine.

Cas actuellement à l'étude : **ClickUp**. Écarté par défaut. Les tâches sont à reloger
**hors Airtable** (cible non figée — dashboard AIOS / kanban Vault, voir Règle 1).
Réouverture possible uniquement après test comparatif 7 jours.

---

## Règle 6 — Emplacement du Vault et du code (hors Google Drive)

Posée le 2026-06-10. Le second cerveau vit dans **`~/IA-OS`** (dossier local visible,
hors Google Drive). Plus de double-sync Drive.

| Quoi | Où | Sauvegarde / portabilité |
|---|---|---|
| **Vault** (notes, skills, mémoire) | `~/IA-OS` | repo GitHub **privé** `thomrichard/[repo-privé]` |
| **Code des projets/outils** | `~/IA-OS/Dev/<projet>` | chaque repo a **son propre remote** (push séparés) |

Règles :
- **Portabilité = GitHub, jamais Google Drive.** Drive faisait doublon avec GitHub pour des
  repos git (et cassait `node_modules` + l'accès hors-ligne). Sur une autre machine : `git clone`,
  pas de Drive.
- `~/IA-OS/Dev/` est **gitignored** côté Vault (`/Dev/`) et **exclu d'Obsidian**
  (`userIgnoreFilters`). Le git du Vault ne suit jamais le code.
- Chaque projet du Vault qui a du code porte une note-pont `_code.md` → `~/IA-OS/Dev/<projet>`.
- **Multi-machine — `.scripts/sync-all.sh`** : une commande qui fait `pull --rebase` + `push`
  sur le Vault puis chaque repo de `Dev/` (le confort « un seul push » sans fusion de repos).
  Ne commit jamais tout seul : les repos dirty sont signalés et sautés. Posé le 2026-06-10
  après confrontation avec l'approche « other worlds » de Nate Herk (fiche dans le Vault).

L'**inventaire** (quel repo a son remote, lesquels sont source-only, chemins, invocations)
vit dans [[4 - Ressources/outils]], pas ici : une doctrine pose le principe, un inventaire
périme.

---

## Règle 7 — Deux plans : l'arbre de contenu (IPCCRA) et la couche de pilotage

Posée le 2026-06-27. L'AIOS a deux plans qu'on ne mélange jamais :

- **Arbre de contenu — IPCCRA** (`0 - Inbox/` → `5 - Archive/`) : la connaissance.
  Ce que Thomas sait, produit, range, archive. Initiales : Inbox · Projets · Contenu ·
  Casquettes · Ressources · Archive (deux C : Contenu + Casquettes).
- **Couche de pilotage**, *à part*, hors numérotation : `.claude/` (CLAUDE.md, doctrine,
  conventions, skills, commands), `log.md`, `skills.md`, le dashboard `🧭 Mon OS`,
  `Dev/` (code, gitignored). Ce sont les capacités qui font tourner l'arbre, pas de la
  connaissance.

Conséquence de rangement :
- Un **skill** est une capacité de l'OS → couche pilotage (`skills.md` reste à la racine /
  `.claude/skills/`). **Jamais dans `4 - Ressources/`.**
- `outils.md` **est** dans `4 - Ressources/` à juste titre : c'est la *projection Vault*
  d'outils externes (« où vivent mes données »), donc une fiche de référence sur le monde
  (Règle 1), pas une capacité interne.
- Mnémo : *Ressources = connaissance sur le monde ; couche pilotage = l'OS qui se décrit
  lui-même.*

---

## Conséquences immédiates pour l'implémentation

Chantiers identifiés, **aucun n'est construit** sauf mention contraire — ne pas supposer
qu'un de ces workflows tourne déjà.

- **Meetings (Otter)** : chantier en cours de cadrage — transcript Otter → compte rendu
  auto rangé sous la casquette/projet concerné + lien retour Otter (Règle 2). Cadrage
  complet : `0 - Inbox/pipeline-reunions-otter-compte-rendu.md` (mémoire
  `project_pipeline_otter_reunions`). Premier cas réel possible de l'Agent Inbox
  (`agent_task: synthese_meeting`).
- **Newsletter auto** : l'IA lit le Vault (concepts récents dans `4 - Ressources/Concepts/`,
  drafts en cours), compose un draft newsletter (`1 - Projets/Newsletter/` ou casquette
  Newsletter), Thomas valide, diffusion Kit
- **ClickUp** : statu quo, pas d'ajout
- **Tâches** : cible encore non tranchée — dashboard AIOS / kanban Vault sont les pistes ;
  **jamais Airtable** (objectif de sortie, voir mémoire `project_airtable_exit_deadline`)
- **Agent Inbox** : workflow n8n à construire qui scanne `0 - Inbox/`, lit `agent_task:`, exécute via appel à Claude Code ou directement en prompts

Chacun de ces chantiers fera l'objet d'un plan séparé.

---
type: support
resume: démo doctrine jour 1 : pièce jointe de la leçon « CLAUDE.md, doctrine et conventions »
statut: publie
domaine: communaute
cree: 2026-07-11
maj: 2026-10-24
liens: [07-claude-md-doctrine-et-conventions.md]
---
# Doctrine — Architecture de mon second cerveau

> Référence d'architecture du système. Toute question « où ça vit ? qui lit quoi ?
> quel outil choisir ? » se résout ici. À mettre à jour explicitement, pas à ignorer.

Posée le 2026-07-09.

---

## Principe central

Mon second cerveau est le **hub** : c'est là que je pense, que je synthétise, que je
navigue par liens. Tout ce qui vit ailleurs (dans un autre outil) doit avoir une
**projection** ici — au minimum une micro-synthèse avec un lien retour vers la source.

Le vault n'a pas besoin de tout contenir. Il doit savoir **où est tout**.

---

## Couches de stockage

| Couche | Outil | Rôle |
|---|---|---|
| Cerveau-hub | Ce vault (IPCRA) | **Source de vérité.** Pensée, synthèse, navigation, drafts, projets, veille |
| Plateformes | Google Workspace (Drive, Gmail, Agenda) · Skool | Captation (mails, fichiers, communauté) et diffusion (contenus publiés) |

Choix de Thomas : **le vault lui-même est la source de vérité**, y compris pour les
données structurées. Il n'y a pas de base relationnelle externe qui fait foi pour
l'instant. Google Workspace et Skool sont des plateformes d'entrée/sortie, pas des
référentiels : ce qui a une valeur durable est synthétisé et rangé dans le vault, avec
un lien retour vers la source.

Autres connecteurs disponibles mais **non activés en V1** (documentés seulement) :
Airtable, n8n, Notion, Supabase, Google Calendar. Le jour où l'un devient une vraie
base de référence, mettre à jour cette table et la Règle 1.

---

## Règle 1 — Source de vérité par type d'objet

Chaque type d'objet a **un seul** endroit qui fait foi. Le reste n'en est qu'une projection.

| Objet | Source de vérité | Projection dans le vault |
|---|---|---|
| Idée / note brute | Vault (`0 - Inbox/` puis rangée) | — (le vault est la source) |
| Référence évergreen | Vault (`3 - Ressources/`) | — |
| Projet / Casquette | Vault (`1 - Projets/`, `2 - Casquettes/`) | — |
| Synthèse de veille vidéo | Vault (`3 - Ressources/` ou casquette Veille YouTube) | — (le vault est la source) |
| Mail / fichier / échange | Google Workspace (Gmail, Drive) | Synthèse sous le projet/casquette concerné + lien retour |
| Contenu publié / communauté | YouTube · Skool | Draft + synthèse dans le vault, lien vers la publication |

---

## Règle 2 — Liaison bidirectionnelle

Toute projection porte le **lien vers sa source**. Sans lien retour, la projection est invalide.
Lier généreusement les pages entre elles avec `[[wikilinks]]`.

---

## Règle 3 — Rôle de `0 - Inbox/`

`0 - Inbox/` est une **file de traitement**, pas un entrepôt. Tout ce qui y entre est
destiné à être lu, traité et rangé ailleurs. Rien n'y dort plus de ~7 jours.

---

## Règle 4 — Ordre de lecture de l'IA

1. Le vault d'abord (index + synthèses) — rapide, lié, contextualisé.
2. Les outils externes ensuite (Gmail, Drive, Skool) — pour le détail brut.
3. Les sources lourdes (transcripts, fichiers) seulement sur besoin explicite.

---

## Règle 5 — Ajout d'un nouvel outil

Aucun outil n'est ajouté si la capacité qu'il apporte est **déjà couverte** par le stack
existant. Avant d'intégrer un outil, vérifier qu'il comble un vrai manque — pas une envie
de nouveauté. Un second cerveau simple qui tourne bat un stack complexe qu'on n'entretient pas.

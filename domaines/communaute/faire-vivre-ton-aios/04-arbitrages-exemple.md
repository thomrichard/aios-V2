---
type: support
resume: Arbitrage exemple : pièce jointe de la leçon « Les arbitrages : trace tes décisions »
statut: publie
domaine: communaute
cree: 2026-08-28
maj: 2026-10-24
liens: [04-les-arbitrages-trace-tes-decisions.md]
---
---
id: sortir-de-mon-outil-no-code
titre: Sortir de mon outil no-code
statut: actif
date: 2026-06-27
portee: [donnees]
gouverne:
  - "CLAUDE.md"
  - "4 - Ressources/outils.md"
remplace:
remplace_par:
confiance: 5
revoir_si: "l'outil devient gratuit à mon volume, ou un de mes usages n'a pas d'équivalent local"
provenance: reconstruit
implemente: partiel
tache: "1 - Projets/Migration/migrer-la-base-clients.md"
a_rouvrir:
---

# Sortir de mon outil no-code

> **Fiche d'exemple.** Elle est fictive, mais elle est écrite exactement comme une vraie :
> même frontmatter, mêmes quatre sections. Lis-la comme un gabarit rempli, puis efface-la.

## La règle

Ne bâtis **aucune nouvelle dépendance durable** sur mon outil no-code. Un objet qui y vit encore
garde sa synthèse et son lien retour dans mes notes, jamais son contenu brut dupliqué. Si tu
proposes une solution qui écrit dedans, arrête-toi et propose l'équivalent local d'abord.

## Écarté

- **Rester et payer** — rejeté : le plan gratuit couvre le volume actuel, mais le prochain palier
  double la facture pour un usage mono-utilisateur qui ne le justifie pas.
- **Migrer tout d'un coup** — rejeté : les bases historiques n'ont pas la même urgence, et une
  migration en bloc bloquerait le travail en cours pendant des semaines.
- **Changer pour un autre SaaS équivalent** — rejeté : rejoue exactement le même piège — mes
  données dans un outil tiers, avec un export qui n'a jamais été testé.

## Ce que ça coûte

Le relationnel et les vues de l'outil sont perdus : je les réécris à la main. Deux automatisations
doivent être refaites avant l'échéance. Et pendant toute la transition, deux sources de vérité
coexistent — c'est la règle de mon `CLAUDE.md` qui tranche laquelle fait foi, objet par objet.

## Revoir si

Le plan gratuit couvre à nouveau mon volume, ou un usage se révèle sans équivalent local viable
(auquel cas c'est cet usage-là qui reste, pas la dépendance entière).

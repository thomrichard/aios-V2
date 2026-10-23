# Métadonnées

Le seul endroit où se règlent les domaines, les champs d'en-tête, les types et leurs statuts. On change une ligne ici, puis `systeme/scripts/index.py` répercute : la carte des domaines d'`AGENTS.md` (que lisent tous les agents), les départements de l'interface. On n'écrit jamais ces copies à la main.

Avant d'écrire un en-tête, lis ce fichier. `systeme/scripts/verifier.py` signale ce qui s'en écarte : un champ inconnu ou manquant, un type ou un statut hors liste, un domaine inconnu ou sans routeur, une date mal écrite, une carte pas à jour.

Pour changer une valeur déjà utilisée, change sa ligne ici, puis demande à l'agent de mettre à jour les fichiers qui l'utilisent : le vérificateur montre ceux qui restent.

## Domaines

Une grande partie de l'activité, qui dure. Chacun a son routeur `routers/<domaine>.md` et son dossier `domaines/<domaine>/`.

| Domaine | Ce qu'il couvre |
|---|---|
| operations | Pilotage (OKR, revue hebdo, revenus), admin et finances, et l'AIOS comme outil de travail (connecteurs, routines, skills) |

## Champs

Format : `texte` ; `date` (AAAA-MM-JJ) ; `liste` (`[a, b]`) ; `type` (une ligne de « Types ») ; `statut` (un statut de son type) ; `domaine` (une ligne de « Domaines ») ; `projet` (le nom d'un fichier de `projets/`, sans `.md`).
Obligatoire pour : `tous`, `tous sauf <types>`, une liste de types, ou `aucun`.

| Champ | Ce qu'il dit | Format | Obligatoire pour |
|---|---|---|---|
| type | Ce qu'est l'objet | type | tous |
| resume | L'objet en une ligne, reprise dans l'index | texte | tous |
| statut | Où il en est dans sa vie | statut | tous |
| domaine | Le domaine où il vit ; sous `domaines/`, le même que son dossier | domaine | tous sauf concept, source, profil |
| projet | Le ou les projets qu'il sert | projet | aucun |
| cree | Sa date de naissance | date | tous |
| maj | Sa dernière retouche | date | tous |
| liens | Les fichiers liés | liste | aucun |
| source | D'où vient une capture (veille, e-mail, lien) | texte | aucun |
| echeance | La date de fin visée | date | aucun |
| prochaine_etape | Ce qui fait avancer, ou ce qui débloque | texte | projet |
| declencheur | Ce qui lance le process | texte | processus |

## Types

Les statuts se lisent dans l'ordre de leur vie. Un type sans statut (« — ») n'a pas de champ `statut`.
Un mot est soit un type, soit un statut, jamais les deux.
Un fichier `a-valider`, ou de type `livrable`, s'affiche dans `outbox/index.html`.

| Type | Ce que c'est | Statuts |
|---|---|---|
| projet | Un chantier avec une fin : son pilotage (échéance, prochaine étape, tâches) | actif, bloque, clos, abandonne |
| processus | Une suite de skills qui revient | a-construire, actif, clos |
| okr | Les objectifs et résultats clés du trimestre | en-cours, clos |
| tableau | Une vue d'ensemble tenue à jour, comme les revenus | en-cours, clos |
| livrable | Ce qu'on remet à quelqu'un, texte ou visuel | en-cours, a-valider, clos |
| compte-rendu | Ce qui s'est dit et décidé dans une réunion | en-cours, a-valider, clos |
| concept | Une connaissance durable, dans `savoir/concepts/` | en-cours, clos |
| source | Une source à lire ou lue, dans `savoir/sources/` | a-lire, lue |
| entretien | La fiche d'un entretien `grill-me`, dans `journal/entretiens/` | en-cours, clos |
| profil | Le profil d'installation, dans `inbox/` | — |

## Ce workspace

Tes domaines, tes types et tes champs à toi. La skill `installation` les écrit ici, en partant de `skills/installation/references/catalogue.md` ; ensuite, tu les changes ici. Le socle n'écrit jamais dans cette section.

| Domaine | Ce qu'il couvre |
|---|---|

| Type | Ce que c'est | Statuts |
|---|---|---|

| Champ | Ce qu'il dit | Format | Obligatoire pour |
|---|---|---|---|

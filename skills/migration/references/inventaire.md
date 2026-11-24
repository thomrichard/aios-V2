# Le gabarit de l'inventaire

Un seul fichier par migration : `journal/entretiens/migration-AA-MM.md`. Il dit ce que devient chaque élément de l'ancien AIOS, et il permet de reprendre après une pause.

- **Proposition** : `reprendre` (tel quel, à sa nouvelle place), `adapter` (réécrit pour ce workspace), `laisser` (il reste dans l'ancien dossier), ou `carte` (il reste dans l'ancien dossier, et une fiche ici dit ce qu'il contient et où le retrouver).
- **État** : vide tant que rien n'est fait ; puis `fait AAAA-MM-JJ`, ou `laissé`.
- Une ligne par élément ; au-delà de 20 fichiers dans un dossier, une ligne par sous-dossier (ou par groupe, s'il est à plat), avec son nombre de fichiers. Un groupe au sort mixte : deux lignes.
- Pour les fichiers, « Où il va » dit aussi le nombre de lots : 45 fichiers, 3 lots.
- Le pourquoi tient en quelques mots : « doublon de `bilan` », « projet fini en mars », « sert chaque semaine ».

```markdown
---
type: entretien
resume: Inventaire de la migration de l'ancien AIOS (<ancien dossier>)
statut: en-cours
domaine: operations
cree: AAAA-MM-JJ
maj: AAAA-MM-JJ
---
# Migration de l'ancien AIOS : inventaire

Ancien dossier : `<chemin>` (lecture seule)
Structure : <IPCRA, ou la correspondance validée, en une ligne>

## Où on en est

| Couche | Lignes | À reprendre ou à adapter | État |
|---|---|---|---|
| 2. Règles | | | |
| 3. Mémoire | | | |
| 4. Projets et domaines | | | |
| 5. Skills | | | |
| 6. Fichiers | | | |

## 2. Règles

| Élément | Proposition | Pourquoi | Où il va | État |
|---|---|---|---|---|

## 3. Mémoire

| Élément | Proposition | Pourquoi | Où il va | État |
|---|---|---|---|---|

## 4. Projets et domaines

| Élément | Proposition | Pourquoi | Où il va | État |
|---|---|---|---|---|

## 5. Skills

| Élément | Proposition | Pourquoi | Où il va, ou ce qui le remplace | État |
|---|---|---|---|---|

## 6. Fichiers

| Dossier ou fichier | Nombre | Proposition | Pourquoi | Où il va | État |
|---|---|---|---|---|---|

## À faire toi-même

- [ ] Clés à recopier dans `.env` : <lesquelles, sans leur valeur>
- [ ] Connecteurs à rebrancher : <outil, à quoi il servait>
- [ ] Anciennes routines à éteindre : <lesquelles>
- [ ] Skills d'un auteur extérieur et agents : <lesquels>

## Questions ouvertes

- <ce que l'ancien AIOS ne dit pas, et qu'il faut demander> · proposition : <ta proposition>
```

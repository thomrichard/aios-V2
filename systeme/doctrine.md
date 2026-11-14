# Doctrine : qui fait foi, où va quoi

## Qui fait foi

| Objet | Fait foi | Index |
|---|---|---|
| Règles | `AGENTS.md` | — |
| Domaines, champs d'un en-tête, types et statuts | `systeme/metadonnees.md` | la carte d'`AGENTS.md` (générée) |
| Fichier texte | son en-tête | `_index.md` du dossier, et `vues/<type>.md`, tous domaines confondus (générés) |
| Image | sa ligne dans `_images.md` du dossier | — |
| Projet | `projets/<slug>.md` | `projets/_index.md`, les projets actifs d'`AGENTS.md`, et `vues/projet-<slug>.md` pour ses fichiers, où qu'ils soient (générés) |
| Souvenir | `memory/<type>_<sujet>.md` | `memory/MEMORY.md` |
| Skill | `skills/<nom>/SKILL.md` | `skills/_index.md` (généré), et le routeur du domaine qui l'utilise |
| Process | le tableau des étapes de `processus/<slug>.md` | `processus/_index.md` (généré), et le routeur du domaine qui le porte |
| Modèle d'une skill | `systeme/modeles.md` | — |
| Routine | `systeme/routines.md` | — |
| Connexion | `systeme/connexions.md` | — |
| Décision d'un projet | la partie « Décisions » de `projets/<slug>.md` | — |
| Un fichier validé dans l'onglet Outbox, ou par la validation de nuit après 3 jours | son statut de fin (`clos`) et `maj` dans son en-tête ; le fichier ne bouge pas. Validé par la nuit ne veut pas dire lu : sa ligne dans `outbox/ranges.md` porte « nuit, non lu » | — |
| Règle (vaut pour tout le workspace) | `journal/regles.md` | la ligne courte dans `AGENTS.md` |

## Où va quoi

La place exacte d'un fichier se déduit de son en-tête : colonne « Chemin » de son type dans `systeme/metadonnees.md`. La skill `classer` choisit l'en-tête, `systeme/scripts/ranger.py` range le fichier, et `verifier.py` signale un fichier qui n'est pas à sa place.

| Ce que c'est | Où ça va |
|---|---|
| Un objet d'un domaine | `domaines/<domaine>/` ; un dossier à lui s'il a plusieurs fichiers, qui peut contenir des sous-objets (un dossier à leur nom, avec leur fiche) ; seule la fiche de l'objet du haut a une place réglée |
| Une production datée (post, newsletter) | `domaines/<domaine>/<slug>-AA-MM.md`, sans dossier par type |
| Un livrable, texte ou visuel | dans son domaine, jamais dans `outbox/` |
| Ce qui sort (`outbox/`) | l'onglet Outbox ne montre que les livrables qui doivent sortir, là où ils sont rangés : les fichiers en `a-valider` sans champ `source:` (ce qu'une routine produit seule, le point du jour le cite) ; « Valider » leur donne leur statut de fin. Ce qu'on écrit en session naît dans son statut de fin : on l'a vu. Y vivent aussi le point du jour (`outbox/points/`), les questions en attente (`outbox/questions.md`) et la page `outbox/index.html` (générée). Un livrable reste dans son domaine |
| Un projet | `projets/<slug>.md` ; ses fichiers restent dans leur domaine |
| Une idée « un jour, peut-être » | dans son domaine, type `idee` (skill `idees`) ; toutes les idées : `vues/idee.md` |
| Un process (une suite de skills qui revient) | `processus/<slug>.md` ; ses skills restent dans `skills/` |
| Une connaissance durable (concept, source) | `savoir/<slug>.md` |
| Un média généré, un composant d'interface | `bibliotheques/medias/`, `bibliotheques/composants/` |
| Une capture de l'extérieur (veille, e-mail) | `inbox/`, avec `source:` dans l'en-tête ; le rangement de 2 h la classe |
| Un PDF, un lien, un fichier qui ne peut pas porter d'en-tête | une fiche à son nom (skill `fiche`), qui le résume et lui sert d'index ; le fichier va à côté d'elle |
| Une vidéo, un son | le dossier des fichiers lourds (`FICHIERS_LOURDS` dans `.env`, un dossier Google Drive synchronisé par exemple), hors du dépôt ; sa fiche reste dans le workspace, champ `fichier` |
| Des données de collecte (ce qu'un script rapporte en volume : captures, exports, planches, sous-titres) | hors du dépôt, dans le dossier de l'outil ou du plugin qui les produit, avec sa propre sauvegarde ; le workspace n'en garde que la fiche |
| Une image | le dossier qui s'en sert, avec sa ligne dans `_images.md` |
| Une question du rangement qui attend ta réponse | `outbox/questions.md` ; l'élément attend dans l'inbox. Sans réponse après 14 jours, le rangement applique la proposition si elle se défait (jamais supprimer, installer, envoyer ni dépenser) |
| Ce qui reste ouvert (prochaines étapes des projets, points de reprise des bilans, alertes qui durent) | `outbox/points-ouverts.md`, généré chaque nuit par `systeme/scripts/points_ouverts.py` ; l'agent le passe en revue en session |
| Un profil d'installation | `inbox/`, puis `archives/inbox/` une fois installé |
| Un entretien (`grill-me`) | `journal/entretiens/<sujet>-AA-MM.md` |
| Le bilan d'une session (`bilan`) | la partie « Historique » de `projets/<slug>.md` (les 3 derniers) ; les plus anciens : `archives/historique/<slug>.md` |
| Le code d'un tiers (l'interface de Jay) | `interface/`, avec sa licence ; il garde ses propres règles (pas d'en-tête, pas d'`_index.md`) |
| Un élément de l'inbox déjà traité | `archives/inbox/AAAA-MM/` |
| Un point du jour vieux de plus de 7 jours | `archives/outbox/` |

## Le cœur et les plugins

Le socle garde le cœur : les fiches et leurs en-têtes, les deux portes (inbox et outbox), les projets, la mémoire, les routines et leur alerte, les skills système, les connexions, les réglages, et l'interface qui les montre. Tout le reste est un plugin : une veille, un éditeur vidéo, un tableau de bord, le lien avec une plateforme.

- Un plugin apporte ce qu'il lui faut : son code, ses données, ses routines, ses skills. Rien de lui ne vit dans le cœur, et le cœur marche sans lui.
- L'interface les lance depuis une page à vignettes (à construire) : une vignette par plugin, avec un lien vers lui ; un plugin pas encore installé reste visible, grisé.
- Un plugin est personnel (il sert un seul workspace et y reste) ou partagé (il se publie, et d'autres le branchent).
- Une nouvelle fonction naît en plugin. Ce qui vit déjà dans un workspace migre quand on y touche.
- Le contrat d'un plugin (où il vit, comment il se déclare, comment on le branche) s'écrira avec le premier plugin partagé.

## En-tête

Gabarit : `systeme/gabarits/fiche.md`. Les domaines, les champs, les types et leurs statuts ne se règlent que dans `systeme/metadonnees.md`. `systeme/scripts/index.py` répercute les domaines dans la carte d'`AGENTS.md` et dans l'interface ; `systeme/scripts/verifier.py` signale un en-tête qui s'en écarte.

Le socle fournit une base qui marche sans rien changer. Les domaines et les types d'un workspace (contenu, vidéo, proposition…) vont dans la section « Ce workspace » de `systeme/metadonnees.md` : la skill `installation` les propose depuis son catalogue.

## Nommage

- Minuscules, tirets, sans espaces ni accents.
- Daté : `<slug>-AA-MM.md`, le titre d'abord, puis l'année et le mois de `cree`. Durable : `<slug>.md`. Le point du jour garde le nom de son jour (`outbox/points/AAAA-MM-JJ.md`).
- Pas de dossier par type : le type est dans l'en-tête. Seul le domaine est un dossier ; un objet de plusieurs fichiers a le sien, et ses sous-objets y vivent.
- Pas de dossier fourre-tout (`notes/`, `misc/`, `tmp/`). Un nouveau dossier se justifie par deux « oui » sur trois : concept nouveau, usage répété le mois suivant, place pour une future skill.

## Mettre à jour AGENTS.md

| Section | Qui la remplit | Quand elle change |
|---|---|---|
| Qui (nom de l'agent, rôle, ton, qui est l'utilisateur) | la skill `installation`, depuis le profil ou l'entretien | seulement à la demande de l'utilisateur |
| Objectifs (les cibles de l'année) | `systeme/scripts/index.py`, depuis la partie « Cibles de l'année » de `domaines/operations/okr.md` (la skill `installation` la remplit) | à chaque lancement du script ; on ne l'écrit jamais à la main. À chaque revue trimestrielle, l'agent vérifie dans `okr.md` que les cibles sont toujours vraies, et propose la mise à jour |
| Carte des domaines | `systeme/scripts/index.py`, depuis `systeme/metadonnees.md` | à chaque lancement du script ; on ne l'écrit jamais à la main |
| Projets actifs | `systeme/scripts/index.py`, depuis l'en-tête des fichiers de `projets/` | à chaque lancement du script ; on ne l'écrit jamais à la main |
| Règles, comment tu travailles | l'agent, après accord | quand une règle manque ou qu'une correction revient ; une ligne, au bon endroit, et le pourquoi dans `journal/regles.md` |

- Les cibles de l'année et les OKR du trimestre font foi dans `domaines/operations/okr.md`, un seul endroit à changer. `AGENTS.md` garde une copie générée des cibles, pour que l'agent les ait sous les yeux à chaque session.
- Jamais de réécriture complète sans demande.
- Au-delà de 150 lignes écrites à la main (les cibles, la carte et les projets actifs, générés, ne comptent pas), le détail part dans un routeur ou dans `systeme/`.
- Le `CLAUDE.md` global de la machine reste vide : tout vit dans le workspace, donc tout reste portable.

## Plafonds

| Fichier | Plafond |
|---|---|
| `AGENTS.md` | 150 lignes, sans la carte ni les projets actifs (générés) |
| `routers/<domaine>.md` | 50 lignes : les routes et les fichiers durables ; un fichier ponctuel (un post, un short) n'y entre pas, `_index.md` le liste |
| `memory/MEMORY.md` | 100 lignes |
| `_index.md` | 100 lignes |
| `SKILL.md` | 80 lignes. De 81 à 120 : une alerte. Au-delà de 120 : il devient un index qui renvoie vers `references/` |
| `outbox/points/` | 7 jours |
| Un fichier du dépôt | 50 Mo. Au-delà : une alerte, et la sauvegarde de nuit s'arrête (GitHub refuse un fichier de plus de 100 Mo) |

Une skill reprise telle quelle d'un auteur extérieur peut être dispensée du plafond et de la famille : une ligne dans le tableau « Skill dispensée » de la section « Ce workspace » de `systeme/metadonnees.md`.

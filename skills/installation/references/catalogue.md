# Catalogue : des domaines et des types à proposer

Des suggestions, pas une liste imposée : on choisit plus facilement qu'on ne part de zéro. Propose ce qui colle à ce que l'utilisateur a dit de son métier (Q3), puis laisse-le garder, renommer, retirer ou ajouter.

Ce qu'il retient s'écrit dans la section « Ce workspace » de `systeme/metadonnees.md` : les domaines, puis les types et leurs statuts. `index.py` recopie ensuite les domaines dans la carte d'`AGENTS.md`. Le domaine `operations` et les types de la base (projet, livrable, compte-rendu…) y sont déjà : ne les recopie pas.

## Les mots, avant la question

Explique chaque mot en une phrase, avec un exemple :

- **Domaine** : une grande partie de ton activité, qui dure dans le temps. Par exemple « contenu », pour tout ce que tu publies. Entre trois et sept, `operations` compris.
- **Type** : la sorte de fichier que tu y produis. Par exemple une vidéo, une newsletter, une proposition commerciale.
- **Statut** : où en est un fichier dans sa vie. Par exemple, une vidéo passe de `sujet` à `en-cours`, puis à `a-valider`, puis à `publie`.

## Domaines courants

| Domaine | Ce qu'il couvre | Types à proposer |
|---|---|---|
| operations | Le pilotage (objectifs, revue, revenus), l'admin, les finances, et l'AIOS lui-même. Toujours là. | ceux de la base |
| contenu | Ce que tu publies : vidéos, posts, newsletter | video, post, newsletter |
| clients | Les missions faites pour des clients : propositions, réunions, livrables | proposition, et compte-rendu et livrable de la base |
| produits | Ce que tu vends sans y passer ton temps : formations, kits, modèles | produit, support |
| communaute | Les membres, les animations, les échanges | evenement, annonce |
| perso | Ce qui n'est pas le travail : santé, maison, famille, projets perso | note |

## Types à proposer

| Type | Ce que c'est | Statuts | Fin | Chemin |
|---|---|---|---|---|
| video | Une vidéo, de l'idée aux stats à 30 jours : une seule fiche, seul son statut avance | sujet, retenu, titre, ecriture, tournage, montage, en-pause, publie, abandonne | publie, abandonne | `domaines/<domaine>/<slug>-<date>.md` |
| post | Un post sur un réseau social | sujet, en-cours, a-valider, publie | publie | `domaines/<domaine>/<slug>-<date>.md` |
| newsletter | Une édition de la newsletter | sujet, en-cours, a-valider, publie | publie | `domaines/<domaine>/<slug>-<date>.md` |
| proposition | Une proposition commerciale | en-cours, envoyee, signee, refusee | signee, refusee | `domaines/<domaine>/<slug>.md` |
| produit | Une offre en vente | en-preparation, en-vente, retire | retire | `domaines/<domaine>/<slug>.md` |
| support | Un support de formation ou d'atelier | en-cours, a-valider, publie | publie | `domaines/<domaine>/<slug>.md` |
| evenement | Un atelier, un live, une rencontre | prevu, passe | passe | `domaines/<domaine>/<slug>-<date>.md` |
| annonce | Un message à la communauté | sujet, en-cours, publie | publie | `domaines/<domaine>/<slug>-<date>.md` |
| note | Une note perso qui dure | en-cours, clos | clos | `domaines/<domaine>/<slug>.md` |

Avec le type `video`, propose aussi ces champs : ils notent une vidéo dans l'onglet Vidéos. Le score se calcule si le domaine a un fichier `score-videos.md` (les poids).

| Champ | Ce qu'il dit | Format | Obligatoire pour |
|---|---|---|---|
| objectif | Ce que sert une vidéo | texte | aucun |
| affinite | L'envie de faire cette vidéo, de 1 à 5 | texte | aucun |
| preparation | Ce qu'on maîtrise déjà du sujet et la matière prête, de 1 à 5 | texte | aucun |
| potentiel | La demande et la concurrence mesurées par un outil, de 0 à 100 | texte | aucun |
| preuve | Le sujet a marché ailleurs, de 0 à 100 | texte | aucun |
| effort | Les heures estimées, du script à l'export | texte | aucun |
| score | La note d'une vidéo, calculée par un script, jamais écrite à la main | texte | aucun |

## Pour tout le monde : les idées

Ajoute-les à chaque installation, dans « Ce workspace », avec ces mots : « Une idée, c'est une envie à creuser un jour, sans engagement. Tu la notes sans qu'on te pose de question, et elle ressort quand un sujet proche démarre (skill `idees`). » L'utilisateur peut les refuser.

| Type | Ce que c'est | Statuts | Fin | Chemin |
|---|---|---|---|---|
| idee | Une envie à creuser un jour, sans engagement | notee, en-reflexion, lancee, abandonnee | lancee, abandonnee | `domaines/<domaine>/<slug>.md` |

| Champ | Ce qu'il dit | Format | Obligatoire pour |
|---|---|---|---|
| ressortir | Le contexte où rappeler une idée, pas une date | texte | aucun |

Un contenu commence à `sujet` : ce qu'on compte faire, pas encore commencé. Garde cette règle en ajoutant un type : un mot est soit un type, soit un statut, jamais les deux.

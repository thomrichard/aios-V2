---
type: support
resume: Leçon Skool de « Crée ton AIOS Personnel » : Les liens [[]] : naviguer comme un cerveau
statut: publie
domaine: communaute
cree: 2026-05-27
maj: 2026-06-11
liens: [cree-ton-aios-personnel.md, https://www.skool.com/club-smart/classroom/f93a2706?md=52fac2d02ada446d86ced4b49e08767a]
---
# Les liens [[]] : naviguer comme un cerveau

> **Promesse de la leçon :** à la fin de cette leçon, ton Vault n'est plus une collection de fichiers — c'est un **graphe vivant**. Tu (et ton AIOS) pouvez le parcourir comme un cerveau, en suivant les connexions plutôt qu'en cherchant dans des dossiers.

---

## Avant de commencer — installe Obsidian (5 minutes)

Jusqu'ici, tout s'est fait dans Visual Studio Code. Pour cette leçon, on ajoute **Obsidian** : une application gratuite de prise de notes qui lit exactement le même dossier que VS Code — ton Vault — et qui sait afficher les liens, les backlinks et le graphe dont on parle plus bas.

1. Télécharge Obsidian sur https://obsidian.md (Mac, Windows, Linux)
2. Ouvre-le → **Open folder as vault** → sélectionne le dossier de ton Vault (celui créé en L3)
3. C'est tout. Tes fichiers apparaissent.

Rien ne change pour le reste : VS Code reste ton atelier avec l'IA, Obsidian devient ta fenêtre de visualisation et de navigation. Les deux pointent sur le même dossier — une porte d'entrée de plus sur le même Vault.

---

## Le besoin que ça couvre

Une note vit rarement seule : une fiche client renvoie à un projet, le projet à un template, le template à un principe de tarification. Ces connexions existent dans ta tête — mais dans un Vault organisé en dossiers, rien ne les matérialise.

Les liens `[[]]` les écrivent noir sur blanc. Ce que tu obtiens : une navigation par le sens plutôt que par l'emplacement, pour toi comme pour l'IA — qui trouve le contexte d'une question en suivant les liens, au lieu de scanner 200 fichiers.

---

## Qu'est-ce qu'un wikilink

Un wikilink, c'est une référence d'un fichier vers un autre, à l'aide de la syntaxe :

```
[[nom-du-fichier]]
```

Quand tu écris ça dans une note, Obsidian (et n'importe quel agent qui lit ton Vault) comprend que tu pointes vers le fichier `nom-du-fichier.md`.

C'est l'inverse d'un lien URL classique :

- Lien URL → tu donnes l'adresse complète, fragile (si tu déplaces, ça casse)
- Wikilink → tu donnes juste le nom, Obsidian retrouve l'emplacement (même si tu déplaces)

Avec wikilinks, tu peux réorganiser ton Vault sans casser tes liens. Critique pour la durabilité.

---

## Ce que tu gagnes

Trois bénéfices, dans l'ordre d'importance.

### 1. La navigation par contexte (pas par dossier)

Tu lis ta fiche projet "Refonte site Dupont". Tu vois `[[template-devis-forfait]]`. Tu cliques. Tu es dans le template. Tu vois `[[tarification-au-forfait]]`. Tu cliques. Tu es dans la fiche concept.

Tu viens de faire un parcours **logique** (projet → outil → principe), pas un parcours **physique** (dossier → dossier → dossier). C'est la même chose que ton cerveau fait quand tu réfléchis.

### 2. Les backlinks — la fonctionnalité cachée la plus puissante d'Obsidian

Quand tu ouvres un fichier dans Obsidian, tu vois en bas un panneau **"Linked mentions"** : tous les autres fichiers du Vault qui pointent vers celui que tu lis.

Concrètement : ouvre la fiche "template-devis-forfait". Tu vois automatiquement tous les projets qui s'en sont servis. Tu n'as rien eu à faire pour construire cette liste — elle se construit toute seule.

C'est ce qui transforme ton Vault d'un système de classement à un **graphe vivant**.

### 3. Le graph view — voir ton AIOS d'un coup d'œil

Obsidian a une vue "Graph" qui dessine ton Vault entier comme une carte : chaque fichier est un point, chaque wikilink est une ligne.

Au début, ton graph est vide. Au bout de 6 mois, il ressemble à un cerveau. Tu vois immédiatement :

- Les nœuds denses (les sujets qui te tirent souvent)
- Les fichiers isolés (les "orphelins" qui n'ont pas trouvé leur place)
- Les ponts entre disciplines (le moment où tes différentes casquettes se nourrissent)

Ce n'est pas juste joli. C'est un outil de réflexion sur ce que tu construis.

---

## Pour ton AIOS, c'est encore plus utile

Quand tu poses une question à ton AIOS, il a besoin de **contexte ciblé** — pas de tout ton Vault, mais des fichiers pertinents.

Sans liens, il doit scanner. Avec liens, il **suit le fil** :

- Question : "écris-moi un devis pour le projet Dupont"
- L'IA lit `[[dupont]]` → trouve la fiche projet
- La fiche projet pointe `[[template-devis-forfait]]` → l'IA lit le template
- Le template pointe `[[tarification-au-forfait]]` → l'IA récupère le principe

En trois sauts, l'IA a tout le contexte nécessaire. Sans lecture exhaustive du Vault. **Sans gaspillage de tokens**. C'est ce qui rend ton AIOS rapide et précis.

---

## Les 3 règles de bonne pratique

### Règle 1 — Crée un lien quand un concept apparaît

Tu écris une note. Tu utilises un terme important (un nom de client, un concept, un outil). Mets le entre `[[]]` même si le fichier cible n'existe pas encore.

Exemple : tu écris "j'utilise `[[claude-code]]` pour mon AIOS". Si la fiche `claude-code.md` n'existe pas, Obsidian la créera quand tu cliqueras dessus. Et le wikilink pointera dans le vide en attendant — c'est OK, c'est même un signal "à écrire un jour".

### Règle 2 — Privilégie les liens depuis les fichiers d'index

Tes fichiers d'index (`projets.md`, `casquettes.md`, etc.) sont les meilleurs candidats pour héberger des liens. Une ligne par entrée :

```
- [[Refonte-site-Dupont]] — en cours, deadline 15 juin
- [[Newsletter-S1]] — épisode 1 publié
- [[Conf-Devoxx-2026]] — préparation
```

Quand l'IA cherche "où sont mes projets actifs ?", elle lit l'index et a direct tous les pointeurs.

### Règle 3 — Pas de surcharge

Tout n'est pas à linker. Si tu ouvres un fichier qui contient 50 wikilinks, c'est illisible — pour toi comme pour l'IA. Garde les liens sur les **concepts importants** qui méritent qu'on les explore. Le reste reste du texte plat.

Bonne moyenne : 3 à 10 wikilinks par note, pas plus.

---

## Le piège classique (et comment l'éviter)

Beaucoup démarrent les wikilinks avec enthousiasme. Tout est linké. Tu te retrouves vite avec :

- Des centaines de fichiers orphelins (créés par auto-création de wikilinks)
- Un graph illisible
- Tu ne sais plus quoi écrire

**La règle de survie :** quand tu crées un wikilink, tu prends 30 secondes pour décider :

- Soit tu écris une note **minimale** dans le fichier cible (1 phrase suffit)
- Soit tu mets le wikilink mais tu sais que tu reviendras le remplir

Ne crée jamais un wikilink "au cas où". Toujours avec une intention.

---

## Comment commencer concrètement

1. Reprends ton **CLAUDE.md** (créé en L5)
2. Trouve les mentions importantes (tes projets, tes casquettes, tes outils principaux)
3. Mets-les entre `[[]]`
4. Pour chacune, crée un fichier minimal (juste un H1 + 2-3 lignes) dans le bon dossier IPCRA

Tu viens de poser tes premiers nœuds. À partir de là, chaque nouvelle note ajoute des connexions.

---

## À retenir

> Les **wikilinks** `[[fichier]]` transforment ton Vault en **graphe vivant**.
> Trois bénéfices : navigation par contexte, **backlinks** automatiques, **graph view** comme outil de réflexion.
> Pour l'IA : elle suit les liens et trouve le contexte pertinent **en quelques sauts**, sans scanner tout le Vault.
> Règles : linker les concepts importants depuis les index, 3-10 liens max par note, jamais "au cas où".
> Démarre par tes mentions dans CLAUDE.md, mets-les entre `[[]]`, crée les fiches minimales.

---

## Prochaine étape

→ **Leçon 7 — Skills : du prompt jetable au système qui apprend**

Tu as la mémoire (L5) et la navigation (L6). Le pilier **Contexte** est en place. La leçon 7 ouvre le pilier **Production** : comment transformer un prompt qui marche en une **skill** réutilisable que ton AIOS exécute à la demande.

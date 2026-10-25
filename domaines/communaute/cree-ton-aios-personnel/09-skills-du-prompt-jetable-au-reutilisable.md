---
type: support
resume: Leçon Skool de « Crée ton AIOS Personnel » : Skills : du prompt jetable au réutilisable
statut: publie
domaine: communaute
cree: 2026-05-27
maj: 2026-06-11
liens: [cree-ton-aios-personnel.md, https://www.skool.com/club-smart/classroom/f93a2706?md=32f4aee7a30440479a7ad176d040020c]
---
# Skills : du prompt jetable au réutilisable

> **Promesse de la leçon :** à la fin de cette leçon, tu sais transformer un prompt qui marche en une **skill** réutilisable. Tu ne réécris plus les mêmes consignes à chaque session — tu les capitalises. C'est le pilier **Production** de CAPE qui démarre.

---

## Le besoin que ça couvre

Un bon prompt est un savoir-faire. Tant qu'il vit dans ton historique de chat, ce savoir-faire est perdu : introuvable, retapé de mémoire en version approximative, jamais amélioré.

Une **skill** lui donne une maison : un fichier de ton Vault qui contient la recette complète — quand l'utiliser, les étapes, les règles. Ce que tu obtiens : le même résultat de qualité à chaque exécution, une recette qui s'améliore à chaque correction (tu modifies le fichier, pas ta mémoire), et un savoir-faire transmissible — à une équipe, ou au toi de dans six mois.

---

## Qu'est-ce qu'une skill

Une skill, c'est une **recette réutilisable** que ton AIOS exécute à la demande.

Concrètement, c'est un dossier dans ton Vault, à un endroit que ton agent IA reconnaît (par défaut : `.claude/skills/nom-de-la-skill/`). Dans ce dossier, un fichier `SKILL.md` qui contient :

- Un en-tête (le nom + une description)
- Les instructions étape par étape
- Optionnellement : des fichiers de référence (templates, exemples, données)

Quand tu déclenches la skill, l'agent lit le fichier et **exécute la recette**. La façon la plus robuste de la déclencher : formuler la demande en clair — « utilise la skill `rediger-post-linkedin` pour… ». Certains agents permettent aussi de taper `/nom-de-la-skill`, mais ça dépend de l'outil ; si le slash ne répond pas chez toi, la formulation en clair marche toujours.

Tu obtiens le même résultat de qualité, à chaque fois, sans avoir à réexpliquer.

---

## Pourquoi c'est puissant

Trois raisons.

### 1. Capitalisation

Un prompt jetable, c'est de la valeur qui s'évapore. Une skill, c'est de la valeur qui **reste**. Plus tu construis de skills, plus ton AIOS devient capable.

C'est de l'intérêt composé : tu paies l'effort une fois (5-15 minutes pour créer la skill), tu en bénéficies pendant des années.

### 2. Transmission

Si tu veux que ton AIOS soit utilisable par une équipe (ou par un futur toi qui aura oublié), les skills sont la couche transmissible. Le savoir-faire est **encodé dans le fichier**, pas dans ta tête.

Imagine former une nouvelle assistante : tu ne lui dirais pas "improvise". Tu lui donnerais une fiche de poste, des procédures, des exemples. C'est exactement ce qu'est une skill.

### 3. Composabilité

Une skill peut **appeler une autre skill**. Tu construis des skills atomiques (faire une chose, bien), puis tu les combines.

Exemple :

- `/rediger-post-linkedin` → utilise `/extraire-idee-de-veille` + `/ecrire-en-voix-thomas`

Ça scale beaucoup mieux qu'une "méga-skill" qui fait tout.

---

## Anatomie d'une SKILL.md

Voici le squelette type :

```
---
name: ma-skill
description: Ce que fait cette skill et quand l'utiliser
---

# Ma skill

## Quand l'utiliser
[Critères de déclenchement clairs.
Ex : "Quand Thomas demande de rédiger un post LinkedIn."]

## Inputs nécessaires
[Liste des infos que tu vas demander à l'utilisateur avant de commencer.
Ex : "Le sujet du post, la longueur cible, le ton."]

## Procédure étape par étape
1. [Étape 1 explicite]
2. [Étape 2 explicite]
3. [Étape 3 explicite]
...

## Règles non négociables
[Ce que tu ne dois JAMAIS faire dans cette skill.
Ex : "Pas d'emojis. Pas de bullshit. Pas de hook agressif."]

## Sources / références
[Liens vers les fichiers du Vault que la skill doit consulter.
Ex : "[[doctrine]], [[voix-thomas]], [[conventions]]"]
```

Pas de magie. Du markdown structuré. Lisible par toi, exécutable par ton AIOS.

---

## Ta première skill — guide pas-à-pas

On va construire une skill ensemble. Choisis une tâche que tu fais **au moins une fois par semaine** et qui suit toujours la même logique.

Exemples typiques :

- Rédiger un post LinkedIn
- Préparer un script vidéo court
- Faire le triage de tes mails du matin
- Rédiger un devis pour un nouveau prospect

### Étape 1 — Identifier les étapes

Refais la tâche mentalement. Liste ce que tu fais, dans l'ordre. Sois précis.

Pour "rédiger un post LinkedIn", ça pourrait être :

1. Lire une source d'inspiration (une note de veille, un article)
2. Trouver l'angle (en quoi c'est intéressant pour mon audience)
3. Écrire un hook (1-2 lignes pour capter)
4. Développer (5-10 lignes)
5. Conclure avec un appel à réaction

### Étape 2 — Identifier les règles non négociables

Liste ce que tu **ne fais jamais** dans cette tâche. Ce que tu corriges systématiquement quand l'IA le propose.

Pour LinkedIn :

- Pas d'emojis
- Pas de "thread" annoncé en début
- Pas de hook agressif ("STOP scrolling…")

### Étape 3 — Créer la skill

Dans ton Vault, crée le dossier `.claude/skills/rediger-post-linkedin/` (si tu utilises Claude Code) ou l'équivalent pour ton agent.

Crée le fichier `SKILL.md` avec le squelette ci-dessus, rempli avec ce que tu viens d'identifier.

Ou plus simple, demande à ton AIOS :

> Crée une skill `rediger-post-linkedin` dans `.claude/skills/`. Pose-moi les questions une par une pour la remplir : quand l'utiliser, inputs, procédure étape par étape, règles non négociables.

Il te guide. À la fin, tu as ta première skill.

### Étape 4 — Tester

Ferme la session. Ouvre-en une nouvelle. Demande :

> Utilise la skill `rediger-post-linkedin` pour un post sur le sujet X.

L'AIOS lit la skill, suit la procédure, applique les règles. Tu obtiens un résultat aligné avec ce que tu voulais.

### Étape 5 — Itérer

Le premier draft est rarement parfait. Tu vas corriger. Quand tu corriges, **demande-toi** :

- Est-ce que cette correction est ponctuelle ?
- Ou est-ce une règle qui devrait vivre **dans la skill** ?

Si c'est une règle → tu l'ajoutes dans le SKILL.md. La prochaine exécution sera meilleure.

C'est la boucle d'amélioration de la skill. Identique à celle qu'on a vue pour CLAUDE.md / doctrine en L5.

---

## Quelques skills à construire en priorité

Tu commences par celles qui ont le **meilleur ratio fréquence × douleur** :

- Une skill pour ton format de contenu le plus fréquent (post, vidéo, newsletter)
- Une skill pour ton format de communication client (devis, email type, suivi)
- Une skill pour ta routine quotidienne (revue de mails, planification de la journée)
- Une skill méta : `creer-une-skill` qui t'aide à construire les suivantes

Ne cherche pas à tout encoder d'un coup. Commence par 2-3 skills. Vis avec. Ajoute au fur et à mesure que tu identifies une douleur récurrente.

---

## Le piège classique

Beaucoup créent une skill, l'utilisent une fois, ne l'utilisent plus jamais. Pourquoi ?

Trois causes habituelles :

- **La skill est trop spécifique** (tu l'as faite pour UN cas, elle ne marche pas pour les variantes)
- **La skill est trop générique** (elle ne capture pas vraiment ta valeur ajoutée, le résultat reste plat)
- **Tu oublies qu'elle existe** (tu refais à la main au lieu de l'invoquer)

**Solutions :**

- Pour la spécificité : revoir périodiquement et généraliser ce qui peut l'être
- Pour la généricité : ajouter des règles non négociables précises (les "ce que je ne veux PAS")
- Pour l'oubli : un fichier d'index des skills (`skills.md` à la racine) où tu listes toutes les skills disponibles et quand les utiliser

---

## À retenir

> Une **skill**, c'est une recette réutilisable que ton AIOS exécute à la demande.
> C'est un fichier `SKILL.md` dans un dossier dédié, avec : description, procédure, règles non négociables, sources.
> Trois bénéfices : **capitalisation, transmission, composabilité**.
> Construis ta première skill sur une tâche que tu fais au moins une fois par semaine.
> Itère : chaque correction qui revient = une règle à ajouter dans le SKILL.md.

---

## Prochaine étape

→ **Leçon 8 — Crons, audit : l'AIOS qui tourne tout seul**

Tu as des skills. Maintenant on va les **déclencher sans toi**. Cron, audit hebdo, boucles d'amélioration — le pilier **Entretien** qui transforme ton AIOS d'un outil que tu actionnes en un système qui tourne en background.

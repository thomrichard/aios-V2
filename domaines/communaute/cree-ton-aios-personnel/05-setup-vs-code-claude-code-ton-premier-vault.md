---
type: support
resume: Leçon Skool de « Crée ton AIOS Personnel » : Setup : VS Code + Claude Code + ton premier Vault
statut: publie
domaine: communaute
cree: 2026-05-26
maj: 2026-07-07
liens: [cree-ton-aios-personnel.md, https://www.skool.com/club-smart/classroom/f93a2706?md=833c0c402ff443b690b0907872ce8673]
---
# Setup : VS Code + Claude Code + ton premier Vault

> **Promesse de la leçon :** à la fin de cette leçon, tu as la stack installée, ton premier Vault créé, et tu viens d'avoir ta première conversation avec ton AIOS.

---

## Avant de commencer

Cette leçon est volontairement la plus pratique du cours. Pas de théorie. Que des étapes concrètes.

Compte 20-30 minutes max. Si tu as déjà VS Code installé, encore moins. Si tu n'as jamais touché à un éditeur de code, ne sois pas impressionné — tu vas juste cliquer dans une fenêtre, ouvrir un dossier, et taper du texte. Tu ne vas pas "coder".

---

## La stack reco (et pourquoi)

Pour construire ton AIOS, on utilise :

- **Visual Studio Code (VS Code)** — éditeur de fichiers gratuit, multi-plateforme
- **Claude Code** — l'agent IA d'Anthropic, en extension VS Code
- **Un dossier sur ton disque** pour ton Vault

Trois éléments, 5-10 minutes d'install max.

Côté budget : un abonnement Claude à ~17 €/mois, et c'est tout. Et ce chiffre est un **argument**, pas une contrainte : aujourd'hui, ton AIOS entier tourne avec cet abonnement. Demain, il peut tourner avec n'importe quel autre LLM — il suffit de brancher le LLM sur le dossier. C'est la promesse anti-dépendance de la L1, en chiffres.

### Pourquoi VS Code (et pas Claude desktop / Claude Co-work)

Tu pourrais utiliser Claude desktop directement, ou Claude Co-work dans le navigateur. Je l'ai testé en profondeur — je suis même obligé sur certains contextes pro où je n'ai pas le choix d'installer VS Code. Et ça marche pour discuter avec l'IA.

Mais ça atteint vite ses limites.

**Le vrai problème : tu ne vois pas tes fichiers.**

Pour construire un AIOS, tu vas créer plein de fichiers texte qui contiennent ton contexte, tes skills, ta doctrine, tes décisions. Tu veux pouvoir :

- Les voir tous d'un coup d'œil dans une arborescence
- Les ouvrir, les modifier, les déplacer à la souris
- Voir ce que l'IA modifie en temps réel pendant qu'elle travaille
- Comprendre où vit quoi

VS Code te donne tout ça. Claude desktop ou Co-work ne te le donnent pas.

**Conclusion :** VS Code n'est pas un luxe, c'est le fondement du setup. Tu fais l'effort une fois, tu en bénéficies pendant toute la durée de vie de ton AIOS.

### Pourquoi Claude Code

D'abord, dédramatisons le nom. « Code », c'est parce que l'outil a été conçu à l'origine pour les développeurs. Mais derrière, c'est **exactement le même modèle** que celui que tu utilises dans Claude Chat ou Claude Cowork. La seule différence : c'est un agent qui sait lire et écrire des fichiers chez toi. Le nom ne veut pas dire que tu vas coder.

Ensuite, trois raisons :

1. Il sait écrire, lire, modifier des fichiers dans ton Vault — pas juste te parler
2. Il intègre nativement les **skills** (qu'on verra en L7) — un système de compétences réutilisables
3. Il gère bien le contexte long et la mémoire entre sessions

Mais — point important — **le mécanisme qu'on apprend dans ce cours marche aussi avec** :

- Codex (l'agent d'OpenAI)
- Cursor / Hermes / Anti-Gravity
- N'importe quel autre coding agent qui accède à tes fichiers locaux

C'est de la mécanique tool-agnostic. Si tu préfères un autre agent ou si Claude Code change demain, ton AIOS continue de fonctionner.

Dans la suite, je dis "Claude Code" parce que c'est ce que j'utilise. Tu remplaces par le tien si tu utilises autre chose. Les principes sont identiques.

---

## Étape 1 — Installer VS Code

1. Va sur https://code.visualstudio.com
2. Télécharge la version pour ton OS (Mac, Windows, Linux)
3. Installe — clic clic, rien de tordu
4. Ouvre VS Code une fois pour vérifier qu'il se lance

Si tu connais déjà VS Code, saute cette partie. Si tu n'es jamais entré dans un éditeur de code, prends 5 minutes pour regarder la fenêtre : la barre latérale à gauche (où on va naviguer dans les fichiers), la zone centrale (où on lit et écrit), et le panneau à droite qui va accueillir Claude.

---

## Étape 2 — Installer l'extension Claude Code

Dans VS Code :

1. Clique sur l'icône **Extensions** (sur la barre latérale gauche — 4 carrés)
2. Cherche **"Claude Code"**
3. Installe l'extension officielle Anthropic
4. Connecte-toi avec ton compte Claude (avec le plan payant vu plus haut)
5. Une fois connecté, tu vois un panneau Claude apparaître sur la droite

Tu peux maintenant discuter avec Claude directement dans VS Code.

Mais on n'est pas encore prêt — Claude ne sait encore rien de toi, et il n'a aucun dossier à regarder.

### Au passage : le pop-up Git (sur Mac)

À un moment de tes premières sessions, macOS va probablement t'afficher cette fenêtre : _« Des outils de ligne de commande sont nécessaires pour la commande "git". Voulez-vous les installer maintenant ? »_

Si ton réflexe est de te méfier d'un pop-up que tu ne connais pas : bravo, c'est exactement le bon réflexe de sécurité. Mais ici, tu peux y aller : c'est **Apple** (pas un site douteux) qui propose d'installer ses propres outils de développement officiels, dont Claude Code a besoin pour travailler. Clique **Installer**, une fois pour toutes, et le pop-up ne reviendra plus.

Pour ta culture : Git est un outil qui garde l'historique des versions de tes fichiers. Ton AIOS s'en servira plus tard, notamment pour le backup.

---

## Étape 3 — Créer ton premier Vault

Le Vault, c'est juste un dossier sur ton ordinateur. Rien de plus magique que ça pour l'instant.

1. Choisis un emplacement (Documents, par exemple — on parlera de l'arborescence en L4, et de la sauvegarde en L8)
2. Crée un nouveau dossier vide. Appelle-le `AIOS`, `Mon-AIOS`, `Vault-[TonPrénom]` — comme tu veux
3. Dans VS Code : **File → Open Folder** et sélectionne ce dossier

Tu as maintenant un Vault ouvert dans VS Code. Vide pour l'instant. C'est normal.

> **Note :** garde le dossier à un endroit que tu retrouves facilement. Pour la sauvegarde, la méthode que je recommande — et qu'on mettra en place en L8 — c'est **GitHub, en dépôt privé** : un backup en ligne, plus la portabilité (tu changes de machine, tu récupères tout ton second cerveau en une commande). Et tu n'as pas besoin de connaître Git : ton IA configure tout pour toi. Évite en revanche de poser le Vault dans un dossier iCloud / Drive / Dropbox : leur synchro et celle de GitHub se marchent dessus.

---

## Étape 4 — Premier dialogue avec ton AIOS

C'est là que ça devient intéressant.

Dans le panneau Claude Code, tape juste :

> Bonjour. Que vois-tu dans ce dossier ?

Claude Code va te répondre quelque chose comme "ce dossier est vide". C'est sa première interaction avec **ton** Vault.

Maintenant, pose :

> Je veux construire un AIOS personnel ici. On va commencer demain. Peux-tu créer un fichier `CLAUDE.md` à la racine qui dit "bonjour, je suis le futur AIOS de [TonPrénom]" ?

La première fois, Claude va d'abord te **demander la permission** d'écrire dans ton dossier (une fenêtre du type « Allow Claude to edit files? »). C'est normal, et c'est une protection : l'agent ne touche jamais à tes fichiers sans ton accord. Accepte pour ce dossier.

Puis il va le faire. Tu verras le fichier apparaître dans l'arborescence à gauche. Tu pourras l'ouvrir, le lire, le modifier toi-même si tu veux.

**Ce qui vient de se passer est important.** Tu n'as pas juste discuté avec une IA. Tu as donné une instruction à un agent qui a modifié ton système de fichiers. C'est petit, mais c'est le début de ton AIOS.

À partir de maintenant, chaque fichier que tu (ou Claude) crée dans ce dossier devient une brique de ton AIOS.

---

## Ce que tu viens de faire (vue d'ensemble)

En 30 minutes, tu as :

- Une stack installée (VS Code + Claude Code)
- Un Vault local (un dossier qui sera ton AIOS)
- Une première interaction qui a créé un fichier réel
- Un agent qui peut lire et écrire dans ton dossier sur instruction

C'est minimal. C'est volontaire. La leçon 4 attaque la structure : comment organiser ce Vault vide pour qu'il scale au lieu de devenir un dépotoir au bout de deux semaines.

---

## Et si je ne peux pas installer Claude Code ?

Cas possibles :

- Tu es sur un poste pro qui ne te laisse pas installer VS Code (banque, hôpital, grande entreprise…)
- Tu préfères un autre agent (Codex, Cursor, etc.)
- Tu veux tester d'abord en web avant de t'engager

Tu peux suivre toutes les leçons suivantes avec :

- **Une autre stack coding agent** : les concepts s'appliquent, change juste le nom de l'outil
- **Claude desktop ou Co-work en web** : tu auras des limitations sur la visibilité fichiers, mais ça démarre

Mais à un moment, le saut vers la stack locale + VS Code se paiera. Si tu peux le faire dès maintenant, fais-le. Si tu ne peux pas, continue avec ce que tu as et reviens quand la situation change.

---

## À retenir

> Stack reco : **Visual Studio Code + Claude Code + un dossier local** comme Vault. Budget total : l'abonnement Claude (~17 €/mois) — et demain, n'importe quel LLM branché sur le dossier fait l'affaire.
> Claude Code = le même modèle que Claude Chat et Cowork, avec en plus les mains pour écrire dans tes fichiers. Le nom ne veut pas dire que tu codes.
> Les pop-ups du setup (outils Git d'Apple, demandes de permission de Claude) sont normaux — ce sont des protections, pas des problèmes.
> VS Code n'est pas négociable pour la visibilité fichiers — Claude desktop ou Co-work atteignent vite leur limite.
> Claude Code est notre agent dans ce cours, mais le mécanisme est tool-agnostic — Codex, Cursor, Hermes, etc. fonctionnent aussi.
> Tu as déjà un Vault et un fichier `CLAUDE.md` minimal. La vraie structure arrive en L4.

---

## Prochaine étape

→ **Leçon 4 — IPCRA : la structure qui tient**

Maintenant que tu as un Vault vide, la question est : comment l'organiser ? La L4, c'est la structure qui m'a survécu à deux ans d'usage intensif et qui empêche ton AIOS de devenir un dépotoir. Si tu suis cette structure dès le départ, tu te fais gagner six mois.

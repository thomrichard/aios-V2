---
type: support
resume: Leçon Skool de « Crée ton AIOS Personnel » : Crons, audit : l'AIOS qui tourne tout seul
statut: publie
domaine: communaute
cree: 2026-05-27
maj: 2026-07-07
liens: [cree-ton-aios-personnel.md, https://www.skool.com/club-smart/classroom/f93a2706?md=18c50a67a14749428e11536ba278293f]
---
# Crons, audit : l'AIOS qui tourne tout seul

> **Promesse de la leçon :** à la fin de cette leçon, ton AIOS travaille **pour toi pendant que tu dors**. Tu sais déclencher des tâches automatiques, et tu as une routine hebdo d'audit qui fait évoluer le système dans le temps. C'est le pilier **Entretien** de CAPE — la dernière brique qui transforme un projet en système vivant.

---

## Le problème qu'on résout

À ce stade du cours, ton AIOS sait beaucoup de choses (L5), navigue dans son contexte (L6), et produit du travail à la demande (L7).

Mais il est **réactif**. Tu dois le déclencher à chaque fois. Tu ouvres VS Code, tu lances une session, tu invoques une skill, tu récupères le résultat.

Le problème : ça reste un outil que **tu utilises**, pas un système qui **travaille pour toi**.

Pour franchir cette dernière marche, il faut deux choses :

- Des **tâches automatiques** qui se déclenchent sans toi (crons)
- Une **routine d'audit** qui maintient le système vivant dans le temps

C'est l'objet de cette leçon.

---

## Partie 1 — Faire tourner ton AIOS sans toi

### Deux familles de mécanismes

Le critère qui départage tout : **est-ce que ton ordinateur doit être allumé ?**

**En local (ton ordi allumé) :**

- **Scheduled tasks de ton agent** — les tâches programmées de Claude Code : les plus simples à créer
- **Crons système classiques** — via `cron`/launchd (Mac/Linux) ou le Planificateur de tâches (Windows), qui lancent Claude Code à heure fixe (c'est le mécanisme du pas-à-pas plus bas)

**Dans le cloud (24/7, même ordi éteint) :**

- **Cloud routines de l'éditeur** — des tâches qui tournent sur l'infrastructure d'Anthropic (Claude Code)
- **Crons GitHub (GitHub Actions)** — c'est là que tournent mes tâches critiques : mes stats YouTube tous les jours, mon triage de mails deux fois par jour, 24 h/24

Pour démarrer, **le local suffit dans 80% des cas**. Tu passes au cloud le jour où une tâche doit tourner sans toi, tout le temps. On se concentre sur le local.

### Exemples concrets de tâches schedulées

Trois cas typiques pour démarrer :

- **Brief du matin (chaque jour 7h)** : "lis mes mails non lus, mon agenda d'aujourd'hui, mes priorités du mois. Sors-moi un résumé de 5 lignes."
- **Triage Gmail (toutes les 2h)** : "lis ma boîte de réception, classe chaque mail dans une catégorie, archive ce qui est traité."
- **Audit Vault (le dimanche soir)** : "scanne le Vault, sors-moi la liste des fichiers orphelins, des liens cassés, des contradictions entre fichiers."

Chacune de ces tâches est une skill (vue en L7) qu'on déclenche à intervalle régulier.

### Comment créer une scheduled task

Dans Claude Code (ou ton agent équivalent), il existe un mécanisme pour créer une tâche programmée. Concrètement :

1. Tu écris le prompt **complet et précis** que tu veux que l'AIOS exécute
2. Tu définis la fréquence (toutes les X heures, chaque jour à Y heure, etc.)
3. Tu définis la sortie (où vont les résultats — un fichier, un mail, un message Slack)
4. Tu actives la tâche

Le piège : **le prompt doit être complet**. Pas de session, pas de "tu m'as compris", pas de relance possible. L'AIOS doit pouvoir exécuter le prompt **sans intervention humaine**.

C'est un changement de mode de pensée : tu n'écris plus pour dialoguer, tu écris pour **déléguer**.

### Pas-à-pas : ta première tâche (l'audit du dimanche)

Concrètement, dans Claude Code :

1. **Écris ton prompt complet** dans un fichier de ton Vault, par exemple `3 - Ressources/prompts/audit-hebdo.md` :

> Scanne le Vault. Liste les fichiers orphelins (aucun lien entrant), les wikilinks cassés, et les fichiers non modifiés depuis 2 mois. Écris le rapport dans `0 - Inbox/audit-[date].md`. Ne supprime rien, ne modifie rien d'autre que ce rapport.

1. **Donne à Claude Code le prompt d'installation ci-dessous**, tel quel, depuis le dossier de ton Vault.

Le piège classique : si tu lui demandes juste « crée une tâche programmée », Claude choisit parfois le mécanisme à ta place — il peut même te répondre qu'il ne tourne pas en arrière-plan et t'embarquer vers une routine cloud ou une clé API. Ce prompt ferme ces portes : le mécanisme est imposé, il n'a plus qu'à l'installer.

> Je veux automatiser mon audit hebdo **en local, sur cette machine**. Ne me propose ni routine cloud, ni clé API : la solution est déjà choisie, tu n'as qu'à l'installer. > > Le mécanisme à utiliser : le planificateur de tâches de mon système d'exploitation (Planificateur de tâches sur Windows, launchd/cron sur Mac ou Linux) qui lance Claude Code en mode non-interactif à heure fixe, avec une commande de la forme : > > `claude -p "Lis le fichier prompts/audit-hebdo.md et exécute exactement ce qu'il demande" --permission-mode acceptEdits` > > Note : `claude -p` (mode print) est le mode non-interactif officiel de Claude Code — il fonctionne sans session ouverte et consomme mon abonnement, pas une clé API. Ne me dis pas que Claude Code ne peut pas tourner en arrière-plan : il n'a pas besoin de tourner en arrière-plan, c'est le planificateur qui le lance. > > Fais dans l'ordre : > 1. Détecte mon système d'exploitation et vérifie que la commande `claude` est accessible depuis le planificateur (sur Windows, vérifie si je suis en installation native ou WSL, et adapte la commande). > 2. Crée la tâche planifiée : chaque dimanche à 18h, depuis le dossier de mon Vault, avec la sortie redirigée vers un fichier `audit-cron.log` pour que je puisse vérifier que ça a tourné. > 3. Sur Windows, active l'option « exécuter la tâche dès que possible si un démarrage planifié a été manqué » (ma machine ne sera pas toujours allumée dimanche 18h). > 4. Lance immédiatement un test manuel de la commande complète et montre-moi le résultat avant de me confirmer que c'est en place.

1. **Vérifie le test manuel** qu'il te montre à la fin : tu dois voir le rapport se créer sous tes yeux avant de lui faire confiance en autonomie.

1. Le dimanche suivant, ouvre `0 - Inbox/` : ton rapport t'attend.

Deux points à savoir : le mode `--permission-mode acceptEdits` autorise Claude à écrire le rapport sans te demander la permission à chaque fois — c'est le bon niveau de risque ici, parce que ton prompt d'audit ne fait que lire et écrire un seul fichier. Et la seule vraie limite du local : ta machine doit être allumée à l'heure prévue (d'où l'option « rattrapage » de l'étape 3 du prompt sur Windows).

### Les deux questions que tu vas te poser

**« C'est sûr de laisser une IA tourner sans moi ? »** Oui, si tu démarres prudent : des tâches qui **lisent** ton Vault et **écrivent uniquement dedans** (un rapport, un brief). Pas de suppression, pas d'envoi d'email automatique au début. Tu élargis quand la confiance est établie — exactement comme avec un nouvel employé.

**« Ça me coûte quoi ? »** Chaque exécution consomme ton abonnement comme une session normale. Une tâche hebdo : négligeable. Une tâche toutes les 2 heures : ça se sent sur les limites du plan. Commence hebdo ou quotidien, et ajuste.

---

## Partie 2 — La routine d'audit hebdo (le truc qui change tout)

Les scheduled tasks font tourner ton AIOS. Mais qu'est-ce qui s'assure que ton AIOS **devienne meilleur dans le temps** ?

C'est là que la routine d'audit entre en jeu. C'est probablement la pratique la plus importante de toute cette série.

### Le principe

Une fois par semaine (idéalement le dimanche ou le lundi matin), tu passes 15-30 minutes à **auditer ton AIOS**. Tu te poses 5 questions :

1. **Qu'est-ce que j'ai utilisé cette semaine ?** Quelles skills j'ai déclenchées, quels fichiers j'ai consultés.
2. **Qu'est-ce qui a foiré ?** Où l'AIOS a-t-il proposé un truc qu'il a fallu corriger.
3. **Qu'est-ce qui manque ?** Les questions auxquelles l'AIOS n'a pas su répondre, les tâches que j'ai dû faire à la main.
4. **Qu'est-ce qui est devenu inutile ?** Des skills ou des fichiers qui ne servent plus → archive.
5. **Quelle est la prochaine amélioration la plus rentable ?** Une nouvelle skill, un fichier de contexte enrichi, une convention à ajouter.

À chaque question, tu **passes à l'action** sur le coup : tu mets à jour un fichier, tu archives, tu crées une nouvelle skill, tu ajoutes une règle dans la doctrine.

### Pourquoi c'est puissant

Sans audit, ton AIOS se dégrade dans le temps :

- Les fichiers s'accumulent (et deviennent du bruit)
- Les skills deviennent obsolètes (le contexte a changé)
- Les corrections manuelles deviennent des habitudes (au lieu d'enrichir le système)

Avec audit hebdo, ton AIOS **s'améliore en continu**. Au bout de 3 mois, il est radicalement meilleur qu'au démarrage. Au bout de 1 an, il devient irremplaçable.

C'est ce qui distingue un AIOS qui meurt d'une expérimentation, d'un AIOS qui devient un actif central de ton activité.

### Tu peux automatiser l'audit lui-même

Encore mieux : tu peux créer une **skill ****`/audit-hebdo`** qui te pose les 5 questions et qui pré-remplit les réponses en lisant ton Vault.

L'AIOS audite l'AIOS. Tu reviens dimanche soir avec une analyse déjà mâchée, et tu n'as plus qu'à valider les actions.

C'est probablement la skill la plus rentable que tu puisses construire après celles couvertes en L7.

---

## Bonus — sauvegarde ton système (GitHub)

Un dernier réflexe, et il compte : **sauvegarde ton système**. Ton AIOS, c'est des fichiers texte — donc tu les mets sur GitHub, en dépôt privé. Deux bénéfices d'un coup :

- **Une sauvegarde en ligne** — tu ne perds jamais rien
- **La portabilité** — tu changes de machine, et tu récupères tout ton second cerveau en une commande

Ton système survit à ton ordinateur.

Et tu n'as pas besoin de savoir ce qu'est Git. Tu crées ton compte GitHub (gratuit, deux minutes), puis tu demandes à ton IA :

> Configure la sauvegarde de mon dossier sur GitHub, en privé, et mets mes fichiers en ligne.

Elle fait tout. Ensuite, chaque fois que tu bosses, tu remets la sauvegarde à jour en une phrase. Et c'est ce même dépôt qui te permettra, plus tard, d'y faire tourner tes crons GitHub.

---

## La boucle complète (récap de tout le cours)

Pour bien voir où on en est, le système complet ressemble à ça :

- **Contexte** (L5 + L6) — l'AIOS sait qui tu es, navigue dans son savoir
- **Accès** — il atteint tes outils et tes données (pas couvert en détail dans ce cours, dépend de ta stack)
- **Production** (L7) — il produit du travail à la demande via skills
- **Entretien** (L8, cette leçon) — il tourne en autonomie + s'améliore via audit hebdo

Les 4 piliers **CAPE** sont là. C'est ton AIOS.

---

## Et maintenant ?

Tu as tout ce qu'il faut pour démarrer. Trois conseils pour la suite :

1. **Ne cherche pas à tout construire d'un coup.** Démarre avec une structure minimale (IPCRA + CLAUDE.md minimal). Vis avec 1 semaine. Ajoute une skill. Vis avec 1 semaine. Ajoute une scheduled task. Le système se construit en couches.

1. **Vis ton AIOS au moins 1 mois avant de juger.** Tu vas avoir une dip de productivité au début (-20% facile), puis une remontée. Le bénéfice se voit au bout de 30 jours, pas en 3 sessions.

1. **Documente en build-in-public.** Si tu partages tes apprentissages (sur LinkedIn, Skool, ailleurs), tu accélères deux choses : ta clarté sur ce que tu construis, et la communauté qui se forme autour.

---

## À retenir

> Le pilier **Entretien** est ce qui distingue un AIOS qui meurt d'un AIOS qui vit.
> Deux mécanismes : **scheduled tasks** (l'AIOS tourne sans toi) + **routine d'audit hebdo** (l'AIOS s'améliore).
> L'audit hebdo en 5 questions : utilisé / foiré / manqué / inutile / prochaine amélioration.
> Tu peux automatiser l'audit lui-même via une skill `/audit-hebdo`.
> Sauvegarde ton Vault sur **GitHub (dépôt privé)** : backup + portabilité — et ton IA configure tout.
> Les 4 piliers **CAPE** sont en place. Tu as un AIOS.

---

## Tu as fini la classroom

Si tu es arrivé jusqu'ici en ayant fait les exercices, tu as :

- Un Vault structuré (IPCRA)
- Un CLAUDE.md + doctrine + conventions qui te ressemblent
- Une navigation par wikilinks
- Au moins 2-3 skills
- Une scheduled task ou une routine d'audit

**Tu as un AIOS Personnel.** Pas un brouillon, pas un projet. Un système qui tourne.

La suite n'est plus du cours — c'est ta pratique. Vis avec un mois. Reviens partager ce que tu as construit dans la communauté Club SMART. Les meilleurs apprentissages viennent des cas réels que les membres partagent.

Et si tu veux passer à l'étape suivante (AIOS business, équipe, clients), c'est une autre saison. Mais d'abord, le perso. **Toujours d'abord, le perso.**

---

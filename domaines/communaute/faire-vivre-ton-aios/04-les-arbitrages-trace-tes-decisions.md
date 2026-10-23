---
type: support
resume: Leçon Skool de « Faire vivre ton AIOS » : Les arbitrages : trace tes décisions
statut: publie
domaine: communaute
cree: 2026-08-26
maj: 2026-08-29
liens: [faire-vivre-ton-aios.md, https://www.skool.com/club-smart/classroom/dd9dc077?md=3b551e0142164ec4a91b1f7c6fde058e]
---
# Les arbitrages : trace tes décisions

> **Promesse de la leçon :** à la fin, tu as posé dans ton AIOS un système qui fait trois choses. Il **enregistre tes décisions** au moment où tu les prends. Il **les fait appliquer** par ton IA à toutes les sessions suivantes. Et il **te prévient** quand tu es en train de re-poser une question que tu as déjà tranchée.

---

## Le besoin que ça couvre

Mardi, tu passes vingt minutes avec ton IA à peser trois options. Tu en retiens une. Tu es content, c'est réglé.

Jeudi, sur un autre sujet, elle te repropose l'option nº 2. Celle que tu as écartée mardi. Tu ne t'en rends même pas compte tout de suite — tu commences à réfléchir, et au bout de trois minutes tu te dis « attends, j'ai déjà fait ça ».

Et le mois suivant, tu recommences. Tu n'as pas seulement perdu du temps : tu as **repayé le même arbitrage** trois fois.

Voilà le vrai diagnostic, et il est plus fin qu'« elle a la mémoire courte ». Ce qui se perd, ce n'est pas ta décision — ta décision, elle finit par se voir dans tes fichiers. **Ce qui se perd, c'est ton refus.** Les options que tu as regardées et jetées, et pourquoi tu les as jetées. Un système qui ne garde que la destination ne peut pas défendre le chemin : à la première objection, il replie.

C'est exactement ce qu'un **arbitrage** répare. Ce n'est pas un compte-rendu de ce que tu as choisi : c'est ta décision **et** ce que tu as refusé, écrits pour que ton IA s'en serve la fois suivante.

Ce que tu installes dans cette leçon fait donc trois choses, et c'est utile de les garder en tête pendant tout le reste :

1. **Ça enregistre** ta décision au moment où tu la prends, avec les options que tu as jetées et pourquoi.
2. **Ça la fait appliquer** aux sessions suivantes : ton IA la lit à chaque démarrage, sans que tu aies rien à redire.
3. **Ça te prévient** quand tu repars sur une question déjà tranchée — au lieu de te laisser la re-débattre pour la troisième fois.

---

## À quoi ça ressemble, concrètement

Avant d'expliquer le mécanisme, regardons l'objet. Un arbitrage, c'est **un petit fichier texte, un par décision**. Rien d'autre. En voici un, raccourci :

```markdown
---
titre: Sortir de mon outil no-code
statut: actif
confiance: 5
gouverne: CLAUDE.md, mes notes sur mes outils
revoir_si: l'outil redevient gratuit à mon volume
---

## La règle
Ne bâtis aucune nouvelle dépendance sur mon outil no-code.
Si tu me proposes une solution qui écrit dedans, arrête-toi
et propose l'équivalent local d'abord.

## Écarté
- Rester et payer — rejeté : le prochain palier double la facture.
- Migrer tout d'un coup — rejeté : ça bloquerait mon travail en cours
  pendant des semaines.
- Changer pour un autre outil du même genre — rejeté : ça rejoue
  exactement le même piège dans six mois.

## Ce que ça coûte
Je perds les vues et le relationnel de l'outil, je les réécris à la main.
Deux automatisations sont à refaire.

## Revoir si
L'outil redevient gratuit à mon volume, ou un de mes usages n'a
vraiment pas d'équivalent local.
```

Quatre sections, et c'est tout. Retiens surtout la deuxième : **« Écarté »**. C'est elle qui fait toute la différence entre un arbitrage et un compte-rendu — et c'est elle qui, dans six mois, empêchera ton IA de te reproposer « et si on passait sur Notion ? ».

Note aussi les deux petites lignes en haut, elles font plus de travail qu'il n'y paraît :

- `**confiance: 5**` dit à ton IA **avec quelle force défendre**. À 5, elle bloque quand on la contredit. À 2, elle te dit « attention, ce choix était fragile » et te laisse passer. Sans ce champ, toutes tes décisions auraient le même poids, ce qui est faux.
- `**revoir_si**` est ta porte de sortie. C'est ce qui empêche la fiche de devenir une pierre tombale : le jour où la condition arrive, la décision se rouvre au lieu de te suivre à vie.

---

## Le mécanisme, en trois idées

### 1. Ton IA garde le « quoi » sous les yeux, elle va chercher le « pourquoi »

Ton IA ne peut pas tout avoir en tête à chaque session. Il faut donc trier — et l'erreur qu'on fait tous, c'est de trier entre _ce qui compte_ et _ce qui compte moins_.

Ce n'est pas la bonne coupe. La bonne coupe, c'est entre **ce qu'elle doit avoir sous les yeux en permanence** et **ce qu'elle doit simplement pouvoir aller chercher**. Les deux comptent autant. Ils ne se chargent juste pas au même moment.

- **L'index** — le _quoi_ — la règle, en une ligne, pour chaque décision active — **à chaque session**
- **La fiche** — le _pourquoi_ — le raisonnement, les options écartées, ce que ça coûte — **à la demande**

Le **quoi** est chargé tout le temps : une ligne par décision, c'est bon marché, et c'est ce qui l'empêche de te contredire sans le savoir.

Le **pourquoi** est récupérable — et c'est lui qui a le plus de valeur. Il sert dans trois moments, et ce sont les trois qui comptent vraiment : quand ton IA s'apprête à contredire ta décision, quand tu lui demandes « pourquoi on avait choisi ça, déjà ? », et quand il faut **justifier** un choix au lieu de refaire tout le raisonnement.

D'où la règle qu'on met dans ses instructions permanentes : **ne jamais énoncer une règle sans pouvoir ouvrir la fiche et redire ce qui a été écarté.** Une règle qu'on applique sans pouvoir la justifier, c'est un dogme. C'est précisément ce qu'un arbitrage doit empêcher.

### 2. Quatre objets, jamais mélangés

- **La règle** — l'impératif, au présent — ton `CLAUDE.md`
- **L'arbitrage** — le pourquoi et les options écartées — une fiche, une par décision
- **L'index** — la règle de chaque fiche active, en une ligne — généré, jamais écrit à la main
- **Le journal** — une mention et un pointeur, jamais le contenu — ton `log.md`

> **« Attends — mes décisions vont donc dans mon **`**CLAUDE.md**`** ? »**
> 
> **Non. Et c'est le point le plus important de la leçon**, alors prenons-le lentement.
> 
> Le `CLAUDE.md`, c'est le fichier que ton IA lit **automatiquement, à chaque nouvelle session**, sans que tu aies rien à faire. C'est là que vivent tes règles : comment tu bosses, ce que tu ne veux jamais, où ranger quoi.
> 
> **Aucune de tes décisions n'y est écrite.** Ton `CLAUDE.md` ne grossit pas d'une ligne à chaque arbitrage que tu traces. Tout ce qu'on lui ajoute, **une seule fois, à l'installation**, c'est une ligne qui va chercher l'index — le sommaire d'une ligne par décision. Ensuite tu peux écrire dix ou quarante fiches, ton `CLAUDE.md` ne bouge plus jamais.
> 
> Et les fiches elles-mêmes — le raisonnement, les options écartées, ce que ça t'a coûté — **ne sont jamais chargées**. Elles restent sur ton disque, et ton IA ne va en ouvrir une que le jour où elle en a besoin.
> 
> Petite précision au passage : quand ton `CLAUDE.md` grossit, tu le découpes en fichiers séparés (chez moi : un fichier « doctrine » pour l'architecture, un fichier « conventions » pour le nommage et le rangement), et le `CLAUDE.md` ne fait plus que pointer vers eux. Pour ton IA ça revient au même, tout est chargé. Donc quand je dis « ton `CLAUDE.md` » dans cette leçon, entends « ton `CLAUDE.md` **et les fichiers qu'il appelle** ».

**Le schéma — qui fait quoi, et qui est chargé.** Voilà les quatre objets posés dans un vrai AIOS, avec les deux fichiers du pack qui les font tourner :

```
ton-AIOS/
│
├── CLAUDE.md ─────────────── TES RÈGLES
│   │                         Lu automatiquement à chaque session.
│   │                         Zéro décision dedans. Une seule ligne ajoutée,
│   │                         une fois pour toutes, qui va chercher l'index ↓
│   │
│   └──► charge .ai/arbitrages/arbitrages.md
│
├── .ai/arbitrages/
│   │
│   ├── arbitrages.md ─────── L'INDEX (le sommaire)
│   │                         Une ligne par décision active : juste la règle.
│   │                         Fabriqué tout seul. CHARGÉ à chaque session.
│   │
│   ├── sortir-de-mon-outil-no-code.md ─┐
│   ├── pas-de-branches-git.md          ├─ LES FICHES (une par décision)
│   ├── interdire-le-rouge.md          ─┘  Le pourquoi, les options écartées,
│   │                                      ce que ça coûte, quand rouvrir.
│   │                                      JAMAIS chargées. Ouvertes à la demande.
│   │
│   └── _TEMPLATE.md ──────── Le gabarit d'une fiche vierge.
│
├── .scripts/
│   └── gen-arbitrages.mjs ── LE PROGRAMME
│                             Relit toutes les fiches, refabrique l'index,
│                             et refuse de tourner si une fiche est bâclée.
│
├── .claude/skills/arbitrage/
│   └── SKILL.md ──────────── LA SKILL
│                             Te pose les bonnes questions et écrit la fiche.
│
└── log.md ────────────────── TON JOURNAL
                              « 27/06 — décision tranchée → voir la fiche ».
                              Une mention et un lien. Jamais le contenu.
```

**Ce qui est chargé à chaque session : deux choses seulement.** Ton `CLAUDE.md`, et l'index. C'est-à-dire tes règles, plus une ligne par décision. Même avec quarante arbitrages tracés, ça reste quarante lignes.

Tout le reste — les fiches, le programme, la skill — vit sur ton disque et ne remonte que quand on en a besoin. C'est ça qui rend le système tenable dans la durée : si tu chargeais les fiches entières, tu paierais des milliers de lignes à chaque démarrage pour un contexte dont tu te sers trois fois par mois.

Pourquoi séparer ces quatre-là si soigneusement ? Parce que c'est la partie qu'on rate le plus souvent. Quand le pourquoi d'une décision est écrit à trois endroits — dans tes règles, dans une fiche, et dans ton journal — les trois versions divergent en un mois, et tu ne sais plus laquelle croire. Ton IA non plus.

Le principe qui règle ça tient en une phrase : **un fait vit à un seul endroit ; les autres pointent vers lui**. Concrètement : ta règle dit _quoi faire_ et cite sa fiche, elle arrête de porter le _pourquoi_. Ton journal dit _qu'une décision a été prise_ et donne le lien, il n'en recopie pas le contenu.

### 3. Deux blocages, et ils ne font pas la même chose

C'est le cœur du système, et le mot « bloquant » recouvre deux mécanismes très différents. Ne les confonds pas.

**Blocage nº 1 — à l'écriture : tu ne peux pas produire une fiche molle.**

L'installation pose chez toi un petit programme (`gen-arbitrages.mjs`). Son travail : relire toutes tes fiches et fabriquer automatiquement le sommaire — cette fameuse liste d'une ligne par décision, celle que ton IA charge à chaque session. Tu le lances en une commande quand tu as ajouté ou modifié une fiche, et il réécrit le sommaire tout seul.

Ce programme fait aussi office de **contrôle qualité**. S'il tombe sur une fiche dont la section « Écarté » est vide, **il refuse de fabriquer le sommaire** et t'affiche l'erreur :

```
❌ 1 erreur(s) bloquante(s) — index NON régénéré :
   • sortir-de-mon-outil-no-code.md — « ## Écarté » absent ou vide.
     Sans option écartée ce n'est pas un arbitrage, c'est un compte-rendu.
```

Rien n'est écrit tant que tu n'as pas complété. C'est volontairement pénible : sans option écartée, ta fiche n'a aucune valeur — c'est un compte-rendu de plus, et des compte-rendus, tu en as déjà quatre formats qui traînent dans ton système.

**Blocage nº 2 — à la lecture : ton IA t'oppose ton propre refus.**

Celui-là, c'est le bénéfice quotidien, et c'est probablement ce que tu attends de la leçon.

Une fois le sommaire branché sur ton `CLAUDE.md`, ton IA le lit à chaque session. Le jour où tu lui proposes — ou bien où _elle_ s'apprête à te proposer — quelque chose que tu as explicitement écarté, **elle s'arrête avant d'agir** et te le dit, en citant la fiche et son niveau de confiance :

> « Attends. Tu me demandes de bâtir sur ton outil no-code, et c'est exactement ce que tu as écarté le 27 juin dans `sortir-de-mon-outil-no-code` (confiance 5). La raison que tu avais donnée : le prochain palier double la facture. Tu veux qu'on rouvre cette décision, ou je pars sur l'équivalent local ? »

C'est ça, « ton IA te dit non ». Elle ne t'empêche pas de faire — tu restes le patron, tu peux très bien répondre « oui, je sais, on rouvre ». Ce qu'elle t'empêche, c'est de le faire **par oubli**.

**Et les deux garde-fous qui évitent la noyade.**

Le vrai risque de ce système, ce n'est pas de mal l'utiliser — c'est d'en abuser. Deux chiffres sont écrits dans la skill pour t'en empêcher :

- **Le seuil : 3 critères sur 4.** Une décision ne mérite une fiche que si elle en coche au moins trois — elle change la façon dont ton système est bâti · elle est difficilement réversible une fois que tu as construit dessus · elle affecte tes sessions suivantes · elle avait de **vraies** alternatives. Sinon, ton IA te le dit en une ligne et n'écrit rien. Le choix d'un nom de fichier, une correction, une préférence de style : sous le seuil.
- **Le plafond : 80 fiches actives.** Ce n'est pas une limite technique — ton disque en accepterait dix mille. C'est une fonctionnalité. Au-delà, tu tombes dans le mal classique de tous les systèmes de documentation : _« j'ai 200 décisions écrites et je n'en lis aucune »_. Quand tu approches du plafond, le programme te prévient, et le geste attendu n'est pas d'agrandir la limite : c'est d'aller **remplacer** les fiches périmées.

Ces deux chiffres sont exactement ce qui empêche ton week-end d'enthousiasme de produire trente fiches que tu n'ouvriras plus jamais.

---

## Installe-le : tu ne colles rien à la main

Quatre fichiers sont joints à cette leçon. **Tu n'as aucun d'entre eux à ouvrir, à renommer ou à recopier** — c'est ton IA qui fait l'installation, et l'un des quatre est justement son mode d'emploi à elle.

- `arbitrages-BRANCHEMENT.md` — **Le mode d'emploi, destiné à ton IA.** Les blocs à poser, où les poser, et le code complet du programme — **Lu par ton IA** pendant l'installation, puis plus rien
- `arbitrage-SKILL.md` — La skill qui écrit tes fiches et te pose les bonnes questions — **Installé**
- `arbitrages-TEMPLATE.md` — Le gabarit d'une fiche vierge, dont la skill se sert à chaque fois — **Installé**
- `arbitrages-EXEMPLE.md` — Une fiche remplie, pour voir à quoi ça ressemble en vrai — **À lire**, puis à effacer

Au bout du compte, **trois choses seront posées chez toi** : la skill, le gabarit, et le programme. Ce dernier n'est pas un fichier à télécharger — son code est écrit en entier dans le mode d'emploi, et ton IA le recopie sur ton disque pendant l'installation.

> **Ces trois-là ne se séparent pas.** On pourrait croire que seule la skill compte et que le reste est de la décoration — c'est faux, et c'est l'erreur qui fait échouer l'installation. La skill écrit les fiches en suivant le gabarit ; le programme transforme ces fiches en sommaire ; et c'est le sommaire — lui seul — que ton IA charge au démarrage. Enlève le programme, et tu écris des fiches que personne ne relira jamais. Enlève le gabarit, et chaque fiche a un format différent, donc le programme les refuse.

Télécharge les quatre, pose-les dans un dossier quelconque (ton dossier de téléchargements fait l'affaire), puis ouvre ton IA à la racine de ton système et donne-lui ceci :

> « J'ai téléchargé un pack de quatre fichiers dans `~/Downloads`. Lis d'abord `arbitrages-BRANCHEMENT.md` : c'est le mode d'emploi, il t'est destiné. Installe le système d'arbitrages chez moi en suivant sa procédure, en l'adaptant à ma structure réelle plutôt qu'aux chemins génériques du pack. Deux choses à caler sur moi : mes vrais chemins de fichiers, et la liste des portées — remplace la liste par défaut par mes vrais domaines de travail, et vérifie que la skill, le gabarit et le programme annoncent tous les trois exactement la même liste. Montre-moi les modifications que tu comptes faire dans mon `CLAUDE.md` avant de les appliquer. »

Ton IA connaît déjà ton arborescence. Elle va créer les dossiers, renommer les fichiers correctement, poser les blocs dans ton `CLAUDE.md` et te montrer le résultat.

Deux précisions sur ce prompt, parce qu'elles ne sont pas cosmétiques :

- **« les portées »**, ce sont les grandes familles dans lesquelles tu ranges tes décisions, pour t'y retrouver quand tu en auras quarante. Le pack en propose cinq par défaut (`systeme`, `donnees`, `contenu`, `design`, `business`). Si tes domaines s'appellent autrement, dis-le : le programme n'accepte **que** les valeurs de la liste, et il refuse de tourner sur une valeur qu'il ne connaît pas. C'est fait exprès — sans ça, tu te retrouves avec trois noms différents pour la même famille et le classement ne veut plus rien dire.
- **« montre-moi avant d'appliquer »** : ton `CLAUDE.md` est le fichier le plus sensible de ton système. Fais-toi montrer les ajouts avant qu'ils y entrent, toujours.

### Le test qui prouve que c'est branché

Ne saute pas cette étape : c'est le seul moyen de savoir que l'installation a réellement pris.

1. **Écris une première fiche** sur une décision que tu as déjà prise pour de vrai. Dis simplement à ton IA : « trace cette décision » — la skill prend la main et te pose les questions, dont la seule qui compte vraiment : _qu'est-ce que tu as écarté, et pourquoi ?_
2. **Ouvre une session neuve** — c'est important, il faut que ton IA reparte de zéro.
3. **Propose-lui exactement l'option que tu as écartée** dans ta fiche.

Elle doit s'arrêter, te dire non, et citer ta fiche. Si elle accepte gentiment, c'est que le sommaire n'est pas branché sur ton `CLAUDE.md` — redemande-lui de vérifier ce point précis.

---

## Fais-le à ton goût

- **Branche-le sur ton **`**/close**` (leçon C10-L1). Le bloc est fourni dans le mode d'emploi : à la clôture, ton IA vérifie que chaque décision de la session a bien sa fiche, et te signale ce qui manque. La skill reste le producteur — elle écrit au moment où tu tranches, quand le pourquoi est encore frais. `/close` n'est que le filet qui rattrape les oublis.
- **Ajoute **`**implemente:**` quand ta règle est tranchée mais que la réalité ne suit pas encore. C'est le champ qui évite de mentir : la décision est bien active — ton IA l'applique — et l'écart entre la règle et le terrain reste visible au lieu de disparaître.
- **Ajoute **`**a_rouvrir:**` le jour où une décision te dérange sans que tu saches encore par quoi la remplacer. Ton IA continue de l'appliquer (retirer la règle laisserait un trou, ce serait pire), mais elle te dit qu'elle s'appuie sur du fragile au lieu de te l'asséner.

Et le geste qui fait la différence sur la durée : **quand une décision change, tu n'effaces jamais l'ancienne fiche.** Tu en écris une nouvelle, et les deux se pointent l'une l'autre. Six mois plus tard, tu ne lis pas seulement ce que tu penses aujourd'hui — tu lis comment tu y es arrivé. Cette trajectoire, c'est la moitié de la valeur du système.

## Ressources

- Arbitrage - la skill : fichier `arbitrage-SKILL.md`, joint à la leçon sur Skool
- Arbitrage - le template : fichier `arbitrages-TEMPLATE.md`, joint à la leçon sur Skool
- Arbitrages branchements : fichier `arbitrages-BRANCHEMENT.md`, joint à la leçon sur Skool
- Arbitrage exemple : fichier `arbitrages-EXEMPLE.md`, joint à la leçon sur Skool

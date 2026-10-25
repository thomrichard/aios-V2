---
type: support
resume: Leçon Skool de « Crée ton AIOS Personnel » : CLAUDE.md, doctrine et conventions
statut: publie
domaine: communaute
cree: 2026-05-27
maj: 2026-10-24
liens: [cree-ton-aios-personnel.md, https://www.skool.com/club-smart/classroom/f93a2706?md=4b4ba73ce8b04aeca8760e9f448f5e98]
---
# CLAUDE.md, doctrine et conventions

# C9-L5 — CLAUDE.md, doctrine, conventions : la mémoire qui scale

> **Promesse de la leçon :** à la fin de cette leçon, ton AIOS sait qui tu es, ce que tu fais, et comment tu veux qu'on travaille avec toi. Tu n'auras plus à le réexpliquer à chaque session. C'est le pilier **Contexte** de CAPE qui démarre.

---

## Le besoin que ça couvre

Une IA sans contexte repart de zéro à chaque session. Or ce que tu corriges dans ses productions — ta voix, tes interdits, ton métier, tes priorités — ce sont des **constantes** : elles ne changent pas d'une session à l'autre.

Le principe de cette leçon : écrire ces constantes une fois, dans des fichiers que l'IA lit automatiquement au démarrage de chaque session. Ce que tu obtiens : des réponses calibrées dès la première version — ton ton, tes règles et tes priorités déjà en tête — au lieu d'une phase de recadrage à chaque fois.

---

## Les trois fichiers qui changent tout

On va créer trois fichiers. Le premier, **CLAUDE.md**, vit à la racine de ton Vault — c'est celui que l'IA lit toute seule, automatiquement. Les deux autres, **doctrine.md** et **conventions.md**, se rangent dans le dossier `.claude/` — juste à côté de la config de ton agent. Tu les écris une fois, et tu arrêtes de te répéter.

- **CLAUDE.md** (racine du Vault) — la mémoire principale, le fichier que l'IA lit en premier
- **doctrine.md** (dans `.claude/`) — tes principes et tes interdits non négociables
- **conventions.md** (dans `.claude/`) — tes règles de travail (nommage, formats, routing)

Le trio se charge à chaque session. Tu poses une question, l'IA arrive avec déjà ce contexte en tête. Tu gagnes 80% du temps de calibrage.

---

## 1) CLAUDE.md — le fichier que ton AIOS lit en premier

C'est **le** fichier le plus important de ton Vault. Si tu ne dois en écrire qu'un, c'est celui-là.

### Ce qu'il contient

Cinq blocs, dans cet ordre :

1. **Qui je suis** — ton métier, tes casquettes, ton contexte
2. **Sur quoi je travaille** — tes priorités du moment, tes 90 jours
3. **Comment je veux qu'on travaille ensemble** — ton ton, tes règles de fonctionnement
4. **Ce que je ne veux PAS** — tes interdits explicites
5. **Pointeurs** — où vit quoi dans le Vault (renvoi vers les index)

### Pourquoi ça scale

L'IA ne devine pas. Elle interprète. Plus tu lui donnes de contexte précis, moins elle invente.

Sans CLAUDE.md, à chaque nouvelle session :

- Elle te demande "qui est ton client cible ?"
- Elle te propose un ton qui n'est pas le tien
- Elle te suggère des outils que tu n'utilises pas

Avec CLAUDE.md, elle attaque directement le fond.

### Le format

Markdown classique. Pas de YAML complexe. Pas de structure rigide. Juste cinq titres et du texte clair.

Exemple minimal (à adapter) :

```
# CLAUDE.md — Mon AIOS

## Qui je suis
Je m'appelle [Prénom], [âge], [pays]. Je suis [métier principal].
J'ai aussi une activité de [side business / casquette 2].
Mes sujets de prédilection : [3-5 sujets].

## Sur quoi je travaille
Mes priorités sur les 90 prochains jours :
1. [Projet 1]
2. [Projet 2]
3. [Projet 3]

## Comment je veux qu'on travaille
Tutoiement. Langue : français.
Ton : direct, concret, sans bullshit.
Quand tu écris un post / une newsletter : style [court / long / informel].
Quand tu proposes un plan : commence toujours par valider l'intention.

## Ce que je ne veux PAS
- Pas de buzzwords vides ("game changer", "révolutionnaire", "incontournable")
- Pas de listes à puces génériques quand un paragraphe suffit
- Pas de propositions à 10 options — donne-moi 2-3 max avec ta recommandation

## Pointeurs
- Mes projets actifs : [[1 - Projets/projets]]
- Mes casquettes : [[2 - Casquettes/casquettes]]
- Mes ressources : [[3 - Ressources/ressources]]
```

C'est minimal. C'est volontaire. **Mieux vaut commencer petit et l'enrichir au fur et à mesure** que d'écrire un pavé qui ne reflète pas vraiment ta voix.

### Comment le créer

Demande à ton AIOS :

> Crée un fichier CLAUDE.md à la racine du Vault avec ces 5 sections : Qui je suis / Sur quoi je travaille / Comment je veux qu'on travaille / Ce que je ne veux PAS / Pointeurs. Pose-moi les questions une par une pour le remplir.

Il va te guider. Tu réponds à chaque question. À la fin, ton CLAUDE.md est calibré pour **toi**.

---

## 2) doctrine.md — tes principes non négociables

Le CLAUDE.md dit qui tu es. La doctrine dit **comment tu penses**.

C'est là que tu écris les principes profonds qui guident tes décisions. Pas des préférences du moment — des règles que tu défends même quand c'est tentant de faire l'inverse.

### Exemples concrets

- "Si une réponse peut être donnée en 3 phrases, ne pas écrire un paragraphe."
- "Pour une décision technique, toujours peser le coût de maintenance dans 6 mois, pas seulement le gain immédiat."
- "Si une tâche peut être faite par un script, je ne la fais pas à la main."
- "Si une ressource n'a aucun lien entrant après 1 mois, elle part en archive."

### Pourquoi c'est séparé du CLAUDE.md

Deux raisons :

- **Stabilité** : le CLAUDE.md change souvent (tes priorités évoluent). La doctrine est lente — tu y touches peut-être 2-3 fois par an.
- **Citabilité** : quand l'IA hésite, tu veux pouvoir lui dire "réfère-toi à la doctrine". Avoir un fichier dédié rend la chose lisible et auditable.

### Comment la construire

Pas en une session. La doctrine se construit **à mesure**. Chaque fois que tu te dis "j'aimerais que mon AIOS comprenne ce principe", tu l'ajoutes.

Tu peux aussi t'inspirer de ton fonctionnement quotidien — quelles règles appliques-tu sans même y penser ? Écris-les.

---

## 3) conventions.md — les règles opérationnelles

Le CLAUDE.md dit qui tu es. La doctrine dit comment tu penses. Les conventions disent **comment tu opères au quotidien**.

### Exemples

- **Nommage des fichiers** : kebab-case, préfixes courts, H1 lisible
- **Routing IPCRA** : où ranger quoi (cf. L4)
- **Templates** : si tu veux que l'IA suive un format précis pour les devis, les scripts vidéo, etc.
- **Limites** : "ne jamais écrire de fichier de plus de 500 lignes sans demander", "toujours valider avant de supprimer un fichier"
- **Workflow** : "quand on démarre un nouveau projet, créer le dossier dans 1 - Projets et ajouter la ligne dans projets.md"

### Pourquoi c'est utile

Sans conventions, l'IA propose des choses qui ne tiennent pas dans ton système. Avec conventions, elle propose des choses qui s'intègrent **dès la première version**.

---

## Comment les trois fichiers s'articulent

L'IA, à chaque session, lit dans l'ordre :

1. **CLAUDE.md** → elle sait qui tu es et ce qui compte
2. **doctrine.md** → elle sait comment tu penses
3. **conventions.md** → elle sait comment opérer concrètement

Si CLAUDE.md dit "écris-moi un post LinkedIn", la doctrine dira "concret avant abstrait", et les conventions diront "format court, paragraphes de 3 lignes max, pas d'emojis".

Le tout, sans que tu aies à le rappeler.

---

## La règle de la mise à jour vivante

Ces trois fichiers sont **vivants**. Ils évoluent.

**Bonne pratique :** chaque fois que tu corriges une production de ton AIOS, demande-toi :

- Est-ce une correction ponctuelle ?
- Ou est-ce une règle qui devrait vivre dans la doctrine / les conventions ?

Si c'est une règle → tu l'ajoutes. Ma règle perso, simple : **la troisième fois que je corrige la même chose, ça devient une règle**, et je l'écris — le plus souvent dans les conventions. Et le plus beau, c'est que tu peux demander à ton IA de le faire pour toi : « cette correction, ajoute-la à mes conventions ». Au bout d'un moment, le système apprend presque tout seul.

C'est ce qu'on appelle la **boucle d'amélioration du Contexte**. C'est exactement comme entraîner un nouvel employé : tu corriges une fois, tu écris la règle, et c'est réglé pour toujours.

---

## Quatre fichiers d'exemple pour te situer

En bas de cette leçon, tu trouveras quatre fichiers en pièces jointes :

- **doctrine.md et conventions.md « jour 1 »** — générés en une session de bootstrap, à partir de simples réponses à une interview ;
- **doctrine.md et conventions.md après plusieurs mois d'usage** — ceux de mon AIOS personnel (identifiants internes masqués).

Un point important : **ne les recopie pas tels quels.** Ces fichiers sont le produit de réponses et d'interprétations personnelles — les tiens seront différents, et c'est exactement ce qu'on cherche. Ils sont là pour te donner une idée de ce qui est nécessaire au départ, et de ce que ça devient quand le système vit.

Et j'insiste, parce que c'est LE piège de cette leçon : **ces fichiers ne s'écrivent pas, ils se déposent.** Le réflexe naturel, c'est de vouloir tout construire soi-même, en une soirée, pour que ce soit « complet ». C'est exactement l'inverse qui marche. Regarde la version « jour 1 » : elle est courte, presque maigre — et c'est suffisant. Tout le reste est arrivé plus tard, **au fil des conversations** : une correction par-ci (« retiens cette règle »), une décision par-là (« ajoute ça à mes conventions »), et le fichier s'épaissit tout seul, session après session.

Concrètement : tu ne mettras presque jamais les pieds dans ces fichiers toi-même. C'est ton IA qui les tient à jour, sur tes instructions du quotidien. Ta seule discipline : un petit audit tous les trois mois pour vérifier que tout est encore aligné avec ta réalité. Le reste, c'est de la conversation.

---

## À retenir

> Trois fichiers : **CLAUDE.md** à la racine de ton Vault, **doctrine.md** et **conventions.md** dans `.claude/`.
> CLAUDE.md = qui tu es + sur quoi tu travailles + comment tu veux qu'on bosse.
> doctrine.md = tes principes non négociables (lent à changer).
> conventions.md = tes règles opérationnelles (nommage, formats, routing).
> Ces fichiers sont vivants : la troisième fois que tu corriges la même chose, ça devient une règle — et ton IA peut l'écrire pour toi.
> Tes fichiers de contexte se construisent en conversation, pas en rédaction — la version jour 1 tient sur une page, et c'est suffisant.

---

## Prochaine étape

→ **Leçon 6 — Les liens **`**[[]]**`** : naviguer ton AIOS comme un cerveau**

Tu as la mémoire écrite. Maintenant on va l'**interconnecter**. Les wikilinks Obsidian (`[[fichier]]`) transforment ton Vault d'une collection de fichiers en un **graphe vivant** que l'IA et toi pouvez parcourir comme un cerveau. C'est le truc le plus sous-estimé d'Obsidian.

## Ressources

- démo convention jour 1 : [`07-exemple-conventions-demo-jour1.md`](07-exemple-conventions-demo-jour1.md), joint à la leçon sur Skool
- démo doctrine jour 1 : [`07-exemple-doctrine-demo-jour1.md`](07-exemple-doctrine-demo-jour1.md), joint à la leçon sur Skool
- démo doctrine 6 mois : [`07-exemple-doctrine-purgee.md`](07-exemple-doctrine-purgee.md), joint à la leçon sur Skool
- démo convention 6 mois : [`07-exemple-conventions-demo-6mois.md`](07-exemple-conventions-demo-6mois.md), joint à la leçon sur Skool

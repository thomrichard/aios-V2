---
type: support
resume: Leçon Skool de « Faire vivre ton AIOS » : Carte de workflow : qui exécute quoi
statut: publie
domaine: communaute
cree: 2026-08-13
maj: 2026-08-16
liens: [faire-vivre-ton-aios.md, https://www.skool.com/club-smart/classroom/dd9dc077?md=f03c14d049ed43df87d53d20b3a6fef4]
---
# Carte de workflow : qui exécute quoi

> **Promesse de la leçon :** à la fin, tu as une skill qui transforme n'importe lequel de tes
> process en carte lisible — où chaque étape porte le nom de qui l'exécute, et où les moments
> qui t'attendent sont visibles. Tu sauras enfin ce qui tourne sans toi, et ce que tu tiens
> encore à la main sans l'avoir décidé.

---

## Le besoin que ça couvre

Tu connais tes process. Tu les fais tous les jours. Demande-toi quand même ceci : sur ton workflow le plus répétitif, combien d'étapes exécutes-tu toi-même ?

Tu vas donner un chiffre. Il sera faux — dans un sens ou dans l'autre.

Ce n'est pas un problème de mémoire, c'est un problème de forme. Un process se vit séquentiellement, une étape après l'autre, jamais en entier. Tant qu'il reste dans ta tête, trois choses restent invisibles.

**Les étapes que plus personne n'exécute.** Elles ont survécu à un outil que tu as quitté, à un client parti, à une version d'avant. Tu continues de les compter dans le process alors qu'elles ne se produisent plus.

**Les validations que tu crois avoir.** Tu es persuadé de valider avant l'envoi. Sauf que rien ne s'arrête vraiment : tu reçois une notification, tu jettes un œil, et ça part de toute façon. Une validation qu'on peut ignorer sans conséquence n'est pas une validation.

**Les boucles qui ne se referment pas.** La mesure que tu collectes fidèlement depuis huit mois et que plus personne ne relit. Elle coûte à chaque tour, elle ne rentre nulle part.

Une liste d'étapes ne montre aucune de ces trois choses. Une carte, si — parce qu'elle force à répondre, pour chaque étape, à la seule question qui compte : **qui exécute ça ?**

C'est le rôle de `carte-workflow`. Là où `grill-me` fait sortir ce que tu as en tête et où `/close` range ce qui s'est passé, celle-ci s'attaque à ce que tu crois savoir.

![image.png](https://assets.skool.com/f/bd1bdc9579a64181bbfe8bd266124c04/fd87cb9050924592a242f956cd9d46bc7dbea67c0c874458bd2f31cd6936f163-md.png)

---

## Ce que fait Carte de workflow

Tu lui dis quel process tu veux voir. Elle déroule un protocole en quatre temps :

1. **Elle te fait raconter.** En désordre, avec les « ah oui, et avant ça… ». C'est prévu :

un process se raconte mal, et c'est normal. Tu n'as rien à structurer avant de parler.

1. **Elle te lit son extraction avant de dessiner.** Les étapes, l'exécuteur de chacune, les

points d'arrêt, les boucles — **et ce qu'elle n'a pas compris**. C'est le moment le plus important de la séance : une carte fausse se refait entièrement, une correction ici te coûte une phrase.

1. **Elle ne comble jamais un trou par une supposition.** Une étape dont personne ne sait qui

l'exécute reste marquée comme telle sur la carte. C'est exactement ce que tu veux voir : un blanc se remarque, une invention plausible passe pour vraie et se propage.

1. **Elle produit un fichier HTML autonome.** Tu l'ouvres dans ton navigateur. Chaque étape

porte un badge nommant son exécuteur, chaque validation devient une barre d'arrêt, chaque retour en arrière devient un arc sous le graphe. Tu cliques un chemin pour l'isoler et le suivre du début à la fin.

Deux règles gouvernent tout le reste, et ce sont elles qui rendent la carte utile plutôt que décorative.

**Un exécuteur est toujours nommé.** « Le système envoie » n'existe pas : c'est un script nommé, un outil nommé, un agent nommé, ou une personne. Une étape dont on ne peut pas nommer l'exécuteur n'est pas une étape floue à dessiner en gris — c'est une étape que tu n'as pas encore comprise.

**Une validation est un arrêt dur.** Tout ce qui précède est produit, présenté, et ça attend. Si le process peut continuer sans toi, ce n'est pas une validation : la carte le montrera, et c'est souvent la découverte de la séance.

---

## Installe la skill

**Ce qu'il te faut :** un agent qui écrit sur ton disque — Claude Code dans VSCode, ton setup de C9. La skill produit un fichier ; dans un chat web sans accès à tes fichiers, tu récupères du code à copier à la main.

Deux fichiers sont joints à cette leçon : `carte-workflow-SKILL.md` et `carte-workflow-patron.html`. Ils vont **ensemble** — le patron contient tout le moteur de la carte, la skill sait s'en servir. Trois gestes, dans l'ordre :

1. **Crée le dossier** `.claude/skills/carte-workflow/` dans ton Vault.
2. **Dépose les deux fichiers dedans**, en les renommant `SKILL.md` et `patron.html`. Les noms

comptent : ton agent cherche un `SKILL.md` dans un dossier qui porte le nom de la skill, et la skill cherche `patron.html` à côté d'elle. Un fichier mal nommé ne se déclenchera jamais, et rien ne te préviendra.

1. **Redémarre ton agent.** Pour vérifier, ouvre `patron.html` dans ton navigateur : il

contient déjà un exemple complet. Si la carte s'affiche et que les chemins de droite réagissent au clic, tout est en place.

Le patron est volontairement neutre — polices système, aucun appel réseau. Il s'ouvre partout, hors ligne, et se partage en l'envoyant par email.

Puis fais-le adapter à ta structure :

> « Voici ma skill `carte-workflow`, que je viens de déposer dans
> `.claude/skills/carte-workflow/`. Adapte-la à mon architecture en te basant sur mon
> CLAUDE.md : choisis où ranger les cartes produites **et crée le dossier s'il n'existe pas**,
> et dis-lui quels fichiers de mon Vault décrivent déjà mes process, pour qu'elle parte de
> ce qui est écrit plutôt que de me faire tout redire. »

---

## Fais-la à ton goût

- **Ta première carte.** Ne prends pas ton process le plus complexe, prends le plus

**répétitif** — ta publication, ta facturation, ton suivi client. Puis lis-la dans cet ordre : combien d'étapes portent ton nom (compare au chiffre que tu avais en tête en commençant cette leçon), tes arrêts sont-ils de vraies validations, et qu'est-ce qui ne mène nulle part. Le compteur en bas de page repère les nœuds orphelins pour toi.

- **Tes types d'exécuteur.** Cinq sont fournis (toi, agent IA, outil, signal externe,

destination). Remplace-les par les rôles de ton équipe si tu travailles à plusieurs : « mon associé », « mon assistante », « le comptable ». La carte devient alors une répartition des rôles autant qu'un process.

- **Tes couleurs.** Un seul bloc à toucher, en haut du patron. Garde la règle qui fait tenir

l'ensemble : les couleurs d'exécuteur ne portent jamais le texte, elles vivent dans les barres et les connexions.

- **L'enchaînement.** Cartographie, puis lance `grill-me` sur l'étape que tu veux automatiser.

La carte te dit _quoi_ attaquer ; l'interview te dit _comment_.

- **La revue.** Refais tourner la carte sur le même process dans trois mois. Ce qui a bougé

entre les deux versions, c'est exactement ce que ton système a appris.

C'est ça, faire vivre ton AIOS : `/close` couvre la fin, `grill-me` couvre le début, et `carte-workflow` couvre le moment où tu arrêtes de deviner comment tu travailles.

## Ressources

- la skill : fichier `SKILL.md`, joint à la leçon sur Skool
- le patron html : fichier `patron.html`, joint à la leçon sur Skool

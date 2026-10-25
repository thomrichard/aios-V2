---
type: livrable
resume: Ce qui sépare les tubes des flops sur 50 vidéos de 5 chaînes IA, technique par technique, et ce que ta chaîne peut en tirer
statut: a-valider
domaine: contenu
projet: references-youtube
cree: 2026-10-25
maj: 2026-10-25
liens: [analyse-concurrents.md, codage.md, ../matrice-methodes-youtube.md, nate-herk.md, robonuggets.md, simon-scrapes.md, tristen-obrien.md, jad-mh.md, thom-richard.md]
---
# Écriture et performance : ce que disent 60 vidéos

50 vidéos de 5 chaînes IA anglophones, plus tes 10 dernières vidéos en témoin. Chaque vidéo est comparée aux autres vidéos de sa propre chaîne : ses vues à 7 jours divisées par la médiane de la chaîne. « x2 » veut dire deux fois la médiane de sa chaîne, « x0,5 » la moitié. Une chaîne d'un million d'abonnés et une de 8 000 se comparent ainsi sans biais.

Les chiffres viennent de `croisements.json` et `videos.csv`. Le détail par chaîne est dans les synthèses : [Nate Herk](nate-herk.md), [RoboNuggets](robonuggets.md), [Simon Scrapes](simon-scrapes.md), [Tristen O'Brien](tristen-obrien.md), [Jad M.H](jad-mh.md), [ta chaîne](thom-richard.md).

## La réponse courte

1. **Le sujet et l'emballage font l'écart, pas les techniques d'écriture.** Dans les cinq chaînes, les tubes et les flops ont le même total de notes sur les 22 techniques des formateurs. Chez Nate Herk, RoboNuggets et Jad M.H, les flops ont même les meilleures notes.
2. **Une chose va avec la performance dans les cinq chaînes : la promesse tenue.** Quand l'intro donne ce que le titre et la miniature font attendre, la vidéo fait x1,08. Quand elle ne le donne qu'en partie, x0,81.
3. **Dans la niche IA, le nom de l'outil bat la douleur et le rêve dans le titre.** C'est l'inverse de la règle d'Alexander. Titres portés par l'outil : x1,24. Titres douleur ou rêve : x0,59.
4. **Deux techniques d'écriture tiennent dans 4 chaînes sur 5** : la boucle de curiosité dans l'intro (Aprilynne) et la tension relancée entre les points (Ed).
5. **Les techniques les plus enseignées ne départagent pas** : pull, paint, point ; le hook ; l'intro en trois lignes. Tout le monde les fait au moins à moitié. C'est le niveau de base du marché, pas un avantage.

## 1. Ce qui sépare les tubes des flops

### Le sujet d'abord

| Format | Vidéos | Performance médiane | Dans combien de chaînes |
|---|---|---|---|
| Actu : une nouveauté montrée | 16 | x1,31 | au-dessus de la médiane dans 4 chaînes sur 5 |
| Étude de cas, projet construit | 3 | x1,08 | trop peu de vidéos |
| Liste (astuces, outils, erreurs) | 19 | x0,92 | — |
| Tuto pas-à-pas | 10 | x0,60 | sous la médiane dans 4 chaînes sur 5 |

Les tubes sont des nouveautés de la semaine qu'on peut essayer tout de suite. Les mods de Claude Code font 686 000 vues à 7 jours chez RoboNuggets et 211 000 chez Tristen. Claude Motion fait 571 000 vues chez Tristen, les clones gratuits d'Adobe 608 000 chez RoboNuggets.

Les flops sont des conseils sans date, l'outil d'un sponsor devenu le sujet, un talk sans démo, ou une création maison que personne n'attendait.

Une nuance : la mesure à 7 jours favorise les actus. Chez Tristen, après 7 jours, les tutos continuent de monter (+56 % à +76 %), les actus beaucoup moins (+31 %). Sur 30 jours, l'écart serait plus faible (à vérifier).

**La courbe le confirme.** Chez Nate Herk, RoboNuggets et Jad M.H, les tubes font moins de la moitié de leur semaine dans les premières 24 à 48 heures : les vues continuent d'arriver, poussées au-delà des abonnés. Les flops font l'essentiel de leur semaine dès le départ, chez les abonnés, puis s'arrêtent.

### Le titre

| Ce que porte le titre | Vidéos | Performance | Dans combien de chaînes |
|---|---|---|---|
| Le nom de l'outil (registre « jargon ») | 19 | x1,24 | mieux dans 4 sur 5 |
| Une preuve : « I Tried 100+ », « I Tested », « (Tested) » | 10 | x1,93 | mieux dans 3 sur 4 |
| Un ton audacieux | 34 | x1,04 | contre x0,81 pour un ton timide |
| Une comparaison sociale : « Top 1% », « 95% of people » | 7 | x0,88 | — |
| La douleur ou le rêve, sans outil | 7 | x0,59 | moins bien dans 3 sur 4 |

Deux exemples parlent d'eux-mêmes, chez Simon Scrapes :

- « How the Top 1% Use Claude Code Differently » fait 231 000 vues à 7 jours ; « Give Me 20 Minutes, I Will Make You a Claude Pro » en fait 11 000. Ce sont deux listes de 18 minutes qui partagent la moitié de leurs idées.
- « 19 Claude Code Mistakes "Pro" Users Are Still Making » fait 74 000 vues ; « 37 Cheat Codes to Level Up In Claude Code » en fait 15 000. Deux listes de 20 minutes, publiées à six jours d'écart.

Ses tubes contredisent une croyance du public (« Everything You Know About Skills IS OUTDATED »). Ses flops promettent un niveau à atteindre (« deviens pro »).

Jay (RoboNuggets) change le titre de la moitié de ses vidéos dans les heures qui suivent la sortie. Il retire « Top 1% » et « 99% », et met l'autorité (« Anthropic just... ») et la vitesse (« Master it in 12 mins »).

### La miniature

- **Le visage n'aide pas** : x0,94 avec, x1,11 sans. Chez Simon, son visage n'est sur aucune vidéo au-dessus de la médiane.
- **La nouveauté accroche** : une miniature qui annonce une nouveauté fait x1,28 (23 vidéos), une miniature avant-après x0,71 (7 vidéos).
- **Une miniature que la vidéo dément se paie.** Chez Nate Herk, le sosie « HE'S NOT REAL » est démenti à 0:41 dans la vidéo. Chez RoboNuggets, un commentaire dit « I feel misled ».
- **La même miniature peut donner l'inverse.** Chez Jad M.H, sa meilleure et sa moins bonne vidéo partagent la même image : 32 000 contre 7 500 vues. Le titre et le sujet ont fait la différence.

### La promesse tenue

C'est le seul signal présent dans les cinq chaînes. Les agents ont noté pour chaque vidéo si l'intro donne ce que le titre et la miniature font attendre :

- tenue : x1,08 (30 vidéos) ;
- tenue en partie : x0,81 (20 vidéos).

Même un tube perd de la confiance quand il cache quelque chose. Chez Tristen, « Claude Just Dropped MOTION » annonce la limite d'accès (offres Team et Enterprise) à 8:50 seulement. Le commentaire le plus aimé (536 likes) le lui reproche. Chez Nate Herk, le coût en tokens d'un skill est le premier reproche (59 likes).

## 2. Les techniques des formateurs face aux chiffres

Chaque technique a été notée 0 (absente), 1 (partielle) ou 2 (nette) sur les 50 vidéos. Le tableau compare la performance des vidéos qui l'appliquent nettement à celle des autres. « Chaînes où elle aide » compte les chaînes où les vidéos qui l'appliquent font mieux que les autres.

| Technique | Formateur | Appliquée | Pas ou peu | Chaînes où elle aide | Verdict |
|---|---|---|---|---|---|
| Promesse du clic tenue dans l'intro | Ed, Aprilynne | x1,08 | x0,81 | 5 sur 5 | **Va avec la performance** |
| Boucle de curiosité dans l'intro | Aprilynne | x1,10 | x0,62 | 4 sur 5 | **Va avec la performance** |
| Tension relancée entre les points | Ed | x1,11 | x0,83 | 4 sur 5 | **Va avec la performance** |
| Effort montré tôt | Aprilynne | x1,00 à 1,10 | x0,88 | — | Piste faible |
| Histoire vécue | Ed | x1,74 | x0,99 | 2 sur 4 | Trop rare pour conclure (7 vidéos) |
| Intro en pont, sans hook | Alexander | x1,94 | x1,03 | — | Va avec, mais surtout parce que les actus s'y prêtent |
| Pull, paint, point | Alexander | x0,92 | x1,08 | 2 sur 5 | **Ne départage pas** |
| Les idées ont un nom | Alexander | x0,99 | x1,24 | — | Ne départage pas |
| Une phrase finale par idée | Alexander | x0,92 | x1,01 | — | Ne départage pas |
| Un hook dissonance, question ou fait | Ed | x0,99 | x1,01 | 3 sur 5 | Ne départage pas |
| Intro en trois lignes | Ed | x0,91 | x1,01 | 1 sur 4 | Ne départage pas |
| Problème, preuve, consignes | Ed | x0,94 | x1,07 | — | Ne départage pas |
| Setup, progress, payoff | Aprilynne | x0,95 | x1,06 | — | Ne départage pas |
| Offre annoncée avant 4 minutes | Alexander | x1,00 | x1,05 | — | **Ne coûte pas de vues** |
| Titre douleur ou rêve, sans jargon | Alexander | x0,59 | x1,24 | 1 sur 4 | **Va contre la performance** dans cette niche |
| Douleur dans l'intro | Ali | x0,56 | x1,01 | — | Va contre (6 vidéos) |
| Démo d'abord, avant d'expliquer | — | x0,83 | x1,11 | — | Plutôt contre |

**Ce que ça veut dire pour pull, paint, point.** Aucune des 50 vidéos ne s'en passe complètement : toutes sont à 1 ou à 2. Celles qui l'appliquent à fond ne font pas mieux que les autres. C'est la qualité de base d'une vidéo pédagogique : sans elle, on décroche ; avec elle, on ne gagne rien de plus face à des concurrents qui le font aussi.

**Ce que ça veut dire pour l'offre.** L'annoncer tôt ne coûte pas de vues. Chez RoboNuggets, la seule vidéo sans pitch de communauté est un tube, mais les vidéos avec pitch ne font pas moins bien. Pour le Club, c'est une bonne nouvelle : on peut parler de l'offre tôt.

## 3. Les mesures

| Mesure | Médiane des 50 vidéos | Lien avec la performance |
|---|---|---|
| Débit de parole | 233 mots par minute | Parler plus vite que d'habitude va avec moins de vues (3 chaînes sur 5). Hors actus, le lien est le plus net de toutes les mesures |
| Seconde du premier point | 35 secondes | Aucun lien d'ensemble. Chez RoboNuggets seulement, les flops entrent trop tard (51 à 126 secondes contre 16 à 50) |
| Changements de visuel, première minute | 16 | Aucun lien. Les vidéos les moins montées de Nate Herk (14 secondes par plan) et de RoboNuggets sont des tubes |
| Durée | 9 à 18 minutes selon la chaîne | Aucun lien d'ensemble. Chez RoboNuggets, les tubes font moins de 13 minutes |
| Mots sur la miniature | — | Lien faible : un peu plus de mots, un peu plus de vues, hors actus |

Le montage ne fait pas le tube. Tous montent vite (un visuel toutes les 3 à 4 secondes dans la première minute), mais ceux qui montent le plus vite ne font pas mieux.

## 4. Ce que tout le monde fait

C'est le niveau de base du marché : moyenne de 1,4 ou plus sur 2, sur les 50 vidéos.

- Un cœur de vidéo qu'on dit en une phrase (Ali) : 1,64.
- Des mots simples, le jargon expliqué (Ed) : 1,62.
- Une intro qu'on comprend sans le son (Aprilynne) : 1,58.
- La tension relancée entre les points (Ed) : 1,56.
- Pull, paint, point (Alexander) : 1,54.
- Un hook net (Ed) : 1,48.
- Des idées nommées (Alexander) et setup, progress, payoff (Aprilynne) : 1,46.

Côté habillage, presque tous ont : le plan affiché à l'écran, des chapitres, le face caméra en vignette sur la capture d'écran, le curseur ou la zone surlignés.

## 5. Les places libres

Ce que presque personne ne fait (moyenne de 0,8 ou moins) :

| Technique | Moyenne | Vidéos qui l'appliquent nettement |
|---|---|---|
| Proposer une vidéo suivante précise, avec une raison | 0,38 | 7 sur 50 |
| La douleur, puis une histoire perso dans l'intro (Ali) | 0,46 | 0 sur 50 |
| Montrer l'effort tôt : heures passées, outils testés (Aprilynne) | 0,64 | 6 sur 50 |
| Le titre douleur ou rêve (Alexander) | 0,76 | 7 sur 50, et ça ne marche pas ici |
| Première phrase = titre et premier plan = miniature (Aprilynne) | 0,88 | 1 sur 50 |

La vidéo suivante précise et l'effort montré sont les deux places libres qui ont un sens : peu de concurrents les prennent, et elles ne coûtent rien. Les vidéos avec une vidéo suivante précise font x1,29 (8 vidéos, à confirmer).

## 6. La conversion : comment ils mènent à leur communauté

Quatre chaînes sur cinq mènent à une communauté Skool. C'est le point de comparaison direct pour le Club SMART.

| Chaîne | La porte gratuite | L'offre payante | Comment la vidéo y mène |
|---|---|---|---|
| Nate Herk | Skool gratuit (AI Automation Society) | AIS Plus, vendue sur « from 0 to over $1 million per year » | Un aimant au milieu (« Real quick guys, I've got this completely free ») dans 7 vidéos, souvent sans lien avec le sujet. Fin sur le like |
| RoboNuggets | Un PDF par vidéo dans le Skool gratuit, rangé sous un code (n76 à n85) | Communauté payante, vendue sur le revenu (« start earning from AI ») | Le même pitch de 30 secondes, juste après le meilleur moment, dans 9 vidéos sur 10 |
| Simon Scrapes | Cadeaux dans un Skool gratuit, dans 5 vidéos | Agentic Academy, cours de 15 heures | Peu de vente dans la vidéo. Ses trois tubes vendent le moins ; sa vidéo la moins vue vend le plus |
| Jad M.H | Ses skills, dans un Skool gratuit | Rien pour l'instant | Skool annoncé avant 2:30 dans 7 vidéos, avec des appels d'installation chaque semaine |
| Tristen O'Brien | Prompts et newsletter sur son site | Rien de payant dit dans la vidéo | Des sponsors dans 6 vidéos sur 10 |

Ce qui en ressort :

- **La ressource liée à la vidéo marche, l'aimant sans rapport fait du bruit.** Les spectateurs de RoboNuggets disent « Subscribed, joined the club and got your comprehensive PDF ».
- **Les ressources introuvables reviennent dans les cinq chaînes** : lien cassé, adhésion en attente, lien vide dans la description, prompts promis absents du site. Tester le lien le jour de la sortie est un avantage facile.
- **Le sponsor dont l'outil devient le sujet fait un flop** : « Is this actually just an ad? » chez Tristen, 4 000 à 6 000 vues à 7 jours. Un sponsor glissé dans une démo Claude ne coûte rien.

## 7. Ta chaîne face aux autres

Tes 10 vidéos codées de la même façon, avec en plus ta rétention. Le détail est dans [thom-richard.md](thom-richard.md).

**La même loi que chez eux.** Tes trois tubes font de 17 000 à 23 000 vues à 7 jours, soit 34 à 44 fois ta médiane (515 vues) : les cours gratuits de Claude, l'app Claude, la méthode qui remplace le prompt. Ils parlent de Claude avec un usage immédiat. Ce sont tes seules miniatures avec le logo de Claude, et tu y montres que tu as testé toi-même. Tes flops parlent de l'AIOS, ton mot que personne ne cherche encore, ou sortent de ta niche (la monétisation YouTube). Ton total de notes sur les 22 techniques est le même dans les deux groupes.

### Ce que tu fais déjà mieux qu'eux

| | Toi | Les 50 vidéos des concurrents |
|---|---|---|
| Une vidéo suivante précise à la fin | 1,4 sur 2 | 0,38 : c'est leur plus grand manque |
| La promesse du clic tenue | 9 vidéos sur 10 | 30 sur 50 |
| Première offre ou ressource dite dans la vidéo | à 1:26 (médiane) | à 3:00 |
| Boucle de curiosité dans l'intro | 1,3 | 1,0 |
| Des idées nommées | 1,7 | 1,46 |

Tes images du quotidien (l'étiquette sur un tiroir, le GPS, le chef d'orchestre, le sécateur) sont une signature que personne d'autre n'a dans l'échantillon.

### Ce qui te sépare d'eux

| | Toi (médiane) | Eux (médiane) |
|---|---|---|
| Seconde du premier point | 67 s | 35 s |
| Intro en trois lignes (Ed) | 0,5 sur 2 | 0,96 |
| Part de face caméra | 44 % | 30 % |
| Part d'écran (démos, captures) | 12 % | 45 % |
| Durée d'un plan, en moyenne | 8 s | 5 s |
| Changements de visuel sur une minute au milieu | 6 | 10 |
| Durée de la vidéo | 18 min | 13 min |

**Ta rétention dit où ça coûte.** Dans tes 10 vidéos, la plus forte perte après 30 secondes tombe entre le hook et le premier point :

- l'annonce du plan : jusqu'à 10 points ;
- un rappel de définition : 5 à 8 points ;
- ta présentation : 31 points ;
- les consignes de visionnage (« mets-la dans tes favoris ») : 41 points.

Chez les concurrents, l'intro courte ne départage pas les vues. Mais ils entrent tous dans le contenu vers 35 secondes ; toi, vers 67. Le problème n'est pas d'être plus court qu'eux, c'est de rattraper le niveau de base.

**Tes tubes montrent plus l'écran.** De 8 % à 40 % de face caméra dans tes tubes, de 45 % à 75 % dans tes flops. Les concurrents passent près de la moitié du temps sur l'outil en action. Chez toi, les explications longues face caméra, sans image, coûtent des points ; les cartes qu'on peut capturer (CRAFT, les six axes) font remonter la courbe.

**La charte.** Chez toi, elle change à chaque vidéo, et les miniatures ont encore leur propre style. Tristen O'Brien garde le même gabarit sur ses 10 vidéos, et son public le remarque : dans 8 vidéos sur 10, des commentaires demandent comment il fait ses animations. Ce point n'est pas mesuré face aux vues ; c'est le sujet du [design system](../design-system/design-system.md).

### Les trois changements les plus sûrs pour ta chaîne

Ce sont ceux qui s'appuient à la fois sur les concurrents et sur ta propre rétention.

1. **Le sujet et l'emballage.** Claude ou l'outil que ton public utilise, un usage immédiat, le nom et le logo de l'outil sur la miniature, la preuve que tu l'as testé dans les 5 premières secondes. C'est ce qui fait tes tubes et les leurs.
2. **L'intro.** Après le hook, le premier point avant 35 secondes. Couper l'annonce du plan (les chapitres la font déjà), le « pour rappel », la présentation et les consignes de visionnage.
3. **Montrer l'outil.** Plus d'écran et de cartes à capturer, moins d'explication face caméra. Tes tubes le font déjà.

## 8. Ce qu'on en tire : à tester dans tes prochains scripts

Des pistes à tester sur tes propres vidéos, pas des règles. Chacune est reliée à un objectif.

1. **Vues** : à chaque sortie majeure de Claude ou d'un outil que ton public utilise, une vidéo rapide, avec le nom de l'outil dans le titre et une miniature qui annonce la nouveauté.
2. **Vues** : dans le titre, une preuve plutôt qu'un niveau à atteindre (« J'ai testé les 7 nouveautés de Claude » plutôt que « Deviens un pro de Claude »). Ou une thèse qui contredit une habitude (« Ton CLAUDE.md ne sert à rien »).
3. **Toutes les vidéos** : avant d'écrire l'intro, écrire en une phrase ce que le spectateur attend en cliquant. L'intro le donne dans les 30 secondes et dit tout de suite les limites (accès, prix, niveau requis).
4. **Toutes les vidéos** : une boucle de curiosité dans l'intro, et la question du spectateur posée à la fin de chaque point pour lancer le suivant. Ce sont les deux techniques d'écriture qui tiennent.
5. **Club** : une ressource liée à la vidéo (skill, prompt, gabarit), donnée dans le Club gratuit, annoncée avant 4 minutes, lien testé le jour de la sortie.
6. **Club et vues** : prendre les places libres. Une vidéo suivante précise à la fin, l'effort montré dans les 10 premières secondes, une vraie histoire vécue.
7. **À ne pas attendre** : pull, paint, point, le hook ou un montage plus rapide ne te feront pas gagner de vues face à des concurrents qui le font tous. Ils restent la qualité de base.

## 9. Les limites

- **10 vidéos par chaîne, 3 dans chaque groupe tubes ou flops** : ce sont des pistes. Un signal qui tient dans 4 ou 5 chaînes sur 5 est plus solide qu'un signal sur le total.
- **Le sujet pèse si lourd qu'il écrase le reste.** Les actus ont été mises à part quand c'était possible (`croisements.json`, groupe « hors_actu »).
- **La mesure à 7 jours favorise les actus.** Les tutos montent plus longtemps.
- **Le codage a été fait par cinq agents**, calés sur une vidéo étalon codée à la main. Quelques écarts d'un agent à l'autre sont possibles.
- **Chez Jad M.H**, ses deux vrais tubes (4 octobre) tombent juste avant la sélection : ses écarts restent faibles (x0,68 à x2,93).
- **Le son** (musique, effets) n'est pas analysé, et la rétention des concurrents n'est pas publique.

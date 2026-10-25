---
type: support
resume: Leçon Skool de « Sessions Q&A » : Q&A du 21/08 — emmener les autres sur son AIOS
statut: publie
domaine: communaute
cree: 2026-08-22
maj: 2026-10-24
liens: [sessions-q-a.md, https://www.skool.com/club-smart/classroom/02b85ba5?md=a680947394d64c618c762d0174bb36c2]
---
# Q&A du 21/08 — emmener les autres sur son AIOS

**Le fil de la session, posé par Robin dès le début :** ton AIOS marche, tu es le seul à le faire vivre, comment tu emmènes les autres dedans ? Tout le reste part de là.

---

## 1. Le point de départ, et là ils se rejoignent

**Robin** a un skill local qui fonctionne bien. Le problème n'est pas le skill : les dossiers qu'il crée ne se synchronisent pas avec le serveur de l'entreprise, alors il fait des copier-coller. Sa formule : « est-ce que j'y gagne à la fin, je ne suis pas sûr ». Il ajoute qu'il a déjà vécu ça avant l'IA — des process mis à jour sur des outils qu'il était seul à maîtriser, donc seul à faire vivre.

**Thomas** décrit la même chose à l'échelle de 150 personnes : des niveaux très disparates, des gens très forts et des gens qui n'ont quasiment jamais ouvert l'outil. Pour l'instant c'est lui qui met tout à jour, parce que les autres sont pris par leur métier. Il dit qu'il faudra embarquer les gens, sans dire encore comment.

C'est le seul endroit de la session où les deux décrivent exactement la même difficulté avec les mêmes mots.

## 2. Git — la piste que les deux ont déjà en tête

**Robin** y était avant la session : « pour moi, GitHub était quand même un peu une clé sur ce bazar ». Il avait regardé Docker aussi, sans le maîtriser. Son argument de sécurité : sur un poste local, un « supprime tout » n'a ni corbeille ni retour arrière — le versionnage, si.

**Thomas** décrit ce que ça implique : traiter l'IA comme un développeur. Elle récupère le `main`, elle crée une branche, elle travaille sur une portion, elle la réinjecte. Un réflexe de dev, mais porté par l'IA, pas par l'utilisateur.

**La question que Thomas se pose à voix haute et à laquelle personne ne répond :** est-ce qu'il faut un AIOS installé chez chaque personne, ou un agent en ligne unique avec qui les gens discutent par chat, et qui gère tout ça derrière ? Robin note seulement que ses collègues, que VS Code n'amuse pas, auraient besoin d'une interface — et qu'il faudrait alors « un truc ultra sécure ». La question reste ouverte à la fin de la session.

## 3. Le frein n'est pas le même pour les deux

C'est le point où ils divergent le plus nettement, et ça mérite d'être lu comme tel.

**Pour Thomas, le red flag est le prix.** Passer du forfait au prix à l'API, c'est perdre le contrôle du budget d'un coup. Et l'alternative n'est pas meilleure : poser des plafonds, c'est risquer de se retrouver bloqué en pleine journée. À dix utilisateurs, il dit que c'est « déjà vite complexe ».

**Pour Robin, ce n'est pas le sujet.** Sa réponse est directe : « ce n'est pas tant en termes de prix, moi, c'est vraiment comment j'emmène tout le monde avec moi ». Son problème est l'adoption, pas la facture. Il note quand même que chez lui l'argument « 20 € contre du temps gagné » ne passe pas, parce qu'à la fin du mois il paie toujours le salarié **et** l'abonnement.

**La réponse de Thomas à cet argument** — la seule chose qui ressemble à une conclusion dans ce passage : il faut transférer le temps gagné vers quelque chose qui génère davantage d'argent, sinon le calcul ne tient pas.

## 4. Make / n8n contre tout-IA — un désaccord de pratique, non résolu

**Thomas** n'ouvre presque plus Make, alors qu'avant il ne faisait que ça. Il s'est demandé quelques jours plus tôt s'il reprenait son abonnement, et se demande dans l'autre sens si arrêter n'est pas une bêtise. Son argument : l'IA peut faire tout ce que fait Make, puisque Make n'est au fond que des appels API.

**Robin** garde, et ne bouge pas. Ses raisons : ce sont des processus **déterministes** — pas de « à un moment j'ai mal prompté » — et sur du volume, création de prospects dans le CRM, envois de mails, la question ne se pose même pas. Il passe sur n8n pour le prix. Sa position en une phrase : ne pas tout basculer sur l'IA sous prétexte qu'on peut le faire.

**Thomas concède un point, et c'est celui-là qui reste :** sur Make, on sait exactement combien de crédits on consomme. Sur l'IA, c'est opaque — il ne sait pas ce que lui coûte sa propre veille.

**Ce sur quoi ils tombent d'accord au passage :** un skill ressemble beaucoup à un process Make. C'est la même formalisation de quelque chose qui se fera toujours de cette manière. Et si on donne au skill la référence d'un schéma, il fait exactement le même travail — à condition qu'il n'ait pas dix mille chemins possibles devant lui.

Aucun des deux n'a fait bouger l'autre. La session se termine avec Thomas toujours sans abonnement Make et Robin toujours sur ses scénarios.

## 5. Sortir le savoir de l'AIOS — une hypothèse lancée, pas une conclusion

C'est Robin qui amène le sujet, par le **wiki d'entreprise** : « comment je prends mes vacances », « à qui je m'adresse », « les process, ils sont où ? ». Sa remarque : c'est bien d'avoir des process, mais s'il faut un process pour trouver le process, on a raté quelque chose.

**Thomas formule alors une hypothèse**, et il la formule au conditionnel : on met peut-être trop de savoir dans les AIOS. L'AIOS serait plutôt sur tes actions et tes projets en cours ; la dimension connaissance, elle, est celle qui se partage, donc peut-être qu'elle a vocation à être déportée — un Drive partagé, un SharePoint, un dépôt Git, une base de données.

**Robin acquiesce, au conditionnel lui aussi** : « je suis d'accord, peut-être que c'est ça, la réflexion ». Il ajoute l'argument de confidentialité — tes projets et tes casquettes disent des choses qui n'ont pas à circuler, alors que la connaissance, si. Thomas confirme que chez lui la sécurité n'est pas négociable : hôpitaux, centrales nucléaires.

**Leur seul désaccord dans ce passage porte sur le format de sortie.** Thomas trouve que du markdown n'est pas très consultable pour quelqu'un qui n'est pas équipé ; Robin répond qu'Obsidian se prend en main assez vite. Thomas renvoie à la même objection qu'au début de la session : toi tu y es déjà, lui pas encore, et il faut l'accompagner sur le chemin.

**Là où Thomas est plus affirmatif : au-delà du RAG.** Le RAG rend des petits bouts un peu partout ; un graphe sémantique crée des **liens qui portent une valeur** — ce concept est lié à celui-là, et le lien lui-même dit quelque chose. Il cite Supabase pour le stockage et Graphify pour le graphe, et mentionne qu'il avait ça chez Leroy Merlin il y a une dizaine d'années.

**Et un point d'architecture qu'il avance sans le vérifier :** une recherche portée par une base de données coûterait peut-être moins cher qu'une recherche portée par l'IA, parce que pendant que la base cherche, l'IA n'a rien à faire, elle attend la réponse. Il le dit comme une intuition — « peut-être que c'est moins coûteux ».

## 6. Le journal de décision, et ce que Robin en fait

**Thomas décrit une pratique en place chez lui.** Quand il hésite sur un truc et qu'il tranche, il l'enregistre et il dit pourquoi. Deux fichiers : un qui liste les décisions, un qui explique la clé de chaque décision. Ce n'est pas le log — le log dit « j'ai bougé cette ligne, j'ai fait ce truc ».

**Robin lui donne son nom en une seconde :** l'arbitrage.

Le bénéfice que Thomas en tire : « j'ai une mémoire de poisson rouge », et trois semaines plus tard, quand il revient avec l'autre option, l'IA lui répond qu'il avait décidé l'inverse et pourquoi. Parfois il change d'avis quand même. Souvent il s'économise de refaire la réflexion.

**Robin le transpose immédiatement à son métier — les reviews de chantier.** « L'hôpital qu'on a fait il y a quatre ans, on avait fait une connerie sur ce truc-là, qui s'en souvient ? » Aujourd'hui la réponse repose sur lui seul, et il dit lui-même que ce n'est ni éternel ni idéal. Il ajoute l'obstacle réel : les gens ne font pas la review s'ils ne voient pas comment elle sera exploitée — si c'est juste pour se taper dans le dos, ça ne sert à rien.

**Thomas répond avec sa règle héritée de l'agile :** une review sans action ne sert à rien. Si personne n'est nommé sur une action, rien ne bouge et on redira la même chose dans deux semaines. C'est là qu'il voit l'IA aider — remettre de l'ordre dans du décousu, sortir les actions, et ne pas lâcher tant que personne n'est assigné.

**Et il ajoute une idée que Robin approuve sans la discuter :** ce n'est pas à toi d'aller chercher l'info. C'est l'IA qui, pendant que tu travailles sur un sujet, va vérifier d'elle-même les références internes et te les mettre en tête — sans attendre que tu sois bloqué, et sans que tu l'aies demandé.

## 7. Faire vivre un process — deux expériences comparées

**Robin part de son expérience de l'automatisation :** quand le process tourne dans Make, il n'y a plus besoin de l'écrire. Il est devant toi, il tourne, tu suis la ligne. Ce n'est plus un truc qu'on respecte ou pas.

**Pour les process qu'on n'automatise pas, il raconte Whimsical.** Il a écrit son process à la main sur un papier, mal, l'a scanné, et a demandé à Claude un prompt Whimsical. Le résultat l'a bluffé. Thomas raconte avoir fait exactement la même chose, avec une écriture qu'il n'oserait pas montrer à ses enfants.

**Les avantages que Robin retient :** ça se partage nativement, ça se prend en main vite, et personne ne peut tout casser. **Thomas ajoute une piste** — s'en servir aussi comme entrée : le collègue modifie le schéma, l'IA va lire les modifications. Ni l'un ni l'autre n'a vérifié s'il existe un MCP Whimsical ; Thomas dit qu'il serait étonné du contraire.

**Le point sur lequel Thomas insiste :** la logique vit dans le skill, pas dans le support. Le HTML brille, c'est tout. Le même skill peut sortir du PowerPoint quand c'est le seul outil disponible au bureau — il l'a fait, et le résultat était correct.

## 8. Trois pratiques racontées, transposables telles quelles

Ce ne sont pas des recommandations données au groupe : ce sont des choses que Robin et Thomas font déjà et qu'ils se sont racontées.

**Le quick win du matin — Robin.** Dans chacun de ses projets, une consigne : le matin, sors-moi une tâche qui me prendrait cinq ou six minutes. L'effet qu'il décrit — même une journée complètement chahutée finit avec quelque chose de fait. Thomas : « c'est pas mal ».

**Le journal vocal du soir — Robin.** Tous les soirs, un message vocal Telegram, poussé sur GitHub, récupéré le lendemain matin. Ça lui sert de suivi machines sans monter une GMAO que personne n'alimenterait. Ce qu'il en tire : « elle est tout le temps en panne, cette machine » devient vérifiable. C'est quoi, tout le temps ?

**L'astuce dictée.** La dictée vocale dans VS Code hésitait en permanence entre l'anglais et le français, avec des débuts de phrase faux. Le correctif : indiquer `français` dans le JSON de configuration de l'installation — pas dans le `CLAUDE.md` du vault. Beaucoup moins d'erreurs depuis. _(La diarisation attribue ce passage à Robin, mais c'est Thomas qui annonce l'astuce juste avant — attribution à vérifier au son.)_

> Ordre de grandeur donné au passage : Thomas a écrit l'équivalent de trois livres en parlant, en trois ou quatre mois, et se situe dans le top 1 % des utilisateurs de Wispr Flow.

## 9. Ce qui bouge côté outils

**La prise de notes de réunion de Wispr Flow.** Thomas vient de l'activer. Pas de vidéo, mais une diarisation qui tient : il identifie les voix et déduit les prénoms du contexte. Même en présentiel à cinq ou six autour d'une pieuvre, il s'en sort — pas à 100 %, mais bien. C'est ce qui a produit le transcript de cette session.

**Le harnais « SEDANCE ».** Sorti dans la semaine, présenté à Thomas par quelqu'un. À l'air très bien fichu pour organiser tout ça et pourrait être une réponse à la question de l'AIOS d'entreprise. **Il déconseille de l'installer maintenant** : les auteurs annoncent des breaking changes, la version installée aujourd'hui ne serait plus compatible demain. Il dit qu'il partagera un lien et qu'il doit le tester. Sa formule : « on n'est pas à l'abri à un moment que je vous dise : arrêtez tout, mettez ça à la place ».

**La réponse de Robin à ça, et c'est sur cette note que la session se termine :** ce n'est jamais perdu. À partir du moment où tu réfléchis à comment mettre l'IA dans tes process, l'outil tu t'en fous un peu — c'est le réflexe qui reste, et l'outil changera de toute façon.

## 10. Une idée pour la communauté, lancée sans être arrêtée

**Thomas évoque des groupes thématiques** — quelqu'un prend le lead sur un sujet, creuse les options, revient présenter aux autres. Il précise que l'idée vient d'Igor et qu'il veut en parler à Sylvain avant. Le premier candidat serait l'IA locale et le hardware : Sylvain est ancien DSI, très orienté machines, « tu sens que le sujet, lui, il est à fond ».

**Robin trouve l'idée bonne** et propose la contrepartie : que ceux qui ont une vision équipe et process apportent leurs besoins terrain à ceux qui creusent la technique. Sa justification — ce qu'on cherche n'existe pas encore, donc autant avancer ensemble.

Sylvain, lui, n'est resté que deux minutes (des amis arrivaient). Il a signalé une documentation web de 27 pages sur le montage d'un PC pour faire tourner de l'IA en local, et s'est engagé à la partager.

## Ressources

- transcript 21/08 : [`04-transcript-qa-aios-2026-08-21.md`](04-transcript-qa-aios-2026-08-21.md), joint à la leçon sur Skool

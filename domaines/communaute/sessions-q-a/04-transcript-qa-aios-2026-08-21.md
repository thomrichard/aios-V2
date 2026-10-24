---
type: support
resume: transcript 21/08 : pièce jointe de la leçon « Q&A du 21/08 — emmener les autres sur son AIOS »
statut: publie
domaine: communaute
cree: 2026-08-22
maj: 2026-10-24
liens: [04-q-a-du-21-08-emmener-les-autres-sur-son-aios.md]
---
---
type: transcript
source: Session Q&A Club SMART — visio, captée par Wispr Flow (Meeting Recorder)
date: 2026-08-21
heure: 08h30 → 09h34 (heure de Montréal) — 14h30 → 15h34 à Paris
duree: 1h04
wispr_meeting_id: 1bc3f9e5-7c27-42a8-b1bb-3664fe7ae973
statut: brouillon
---

# Transcript — Q&A AIOS du Club SMART (2026-08-21)

> Transcription automatique **Wispr Flow** de la session visio. Contrairement aux deux sessions précédentes, le transcript est **diarisé tour de parole par tour de parole** — c'est le premier Q&A capté par Wispr.
>
> **Attribution imparfaite.** La diarisation intervertit les locuteurs sur plusieurs passages, en particulier quand l'un enchaîne sur la phrase de l'autre. Le cas le plus net : l'astuce « mettre `français` dans le JSON de config » (fin de session) est **annoncée par Thomas** puis développée sous l'étiquette Robin. En cas de doute sur un propos technique, se fier au sens, pas à l'étiquette.
>
> **Aucun nettoyage de forme.** Le texte est rendu tel que Wispr l'a produit : hésitations, redites et coupures de tour conservées. Quelques déformations connues à lire au sens : « Whisper Flow » = **Wispr Flow** · « l'iOS / l'Exe » = **l'AIOS** · « Wisprical » = **Whimsical** · « le school » = **Skool** · « Laurent Merlin » = **Leroy Merlin** · « SEDANCE » = nom de harnais à vérifier · « Elliott Meunier » = **Eliott Meunier** · « Chambay » = **Chambéry** · « OBE » = **bureau d'études**.

## Les 3 personnes

**Thomas Richard — animateur (toi).** Anime le rendez-vous. Partage sa situation chez Groupe Axor (~150 personnes) : trois semaines après l'arrivée, en pleines vacances de la construction, il n'a rencontré que les services ressources. Expose sa feuille de route en trois niveaux (personnel → équipe → entreprise), son journal de décision, son système de veille à rattachement sémantique, et sa position sur Make/n8n vs tout-IA.

**Robin Trolez — membre.** Bureau d'études + atelier (~20 personnes, dont ~10 au bureau), background Product Owner / Agile-Scrum, déjà présent à la session du 22/07. C'est lui qui porte la session : il arrive avec un usage installé (routine du matin, « quick win » quotidien, journal vocal Telegram → GitHub) et une seule vraie question — **comment emmener les collègues sur un système qu'on est seul à faire vivre**. Bloqué sur ses mails (boîte en POP, rien ne reste en ligne).

**Sylvain Mercier — membre.** Passage de deux minutes, s'excuse (des amis arrivent). Ancien DSI, orienté hardware et IA isolée en local. Signale une documentation web de 27 pages sur le montage d'un PC pour faire tourner de l'IA en local, qu'il s'engage à partager dans la communauté.

---

## Le transcript

### Avant le démarrage — hors sujet

> Les 4 premières minutes sont de l'attente et du bavardage (décalage horaire, vacances, sécheresse en France). Rien à en tirer pour le Club SMART — conservé pour l'intégrité de l'archive, à sauter en lecture.

**?**
**Thomas** — Bon, écoute, on va démarrer.
**Robin** — Ouais.
**Thomas** — Sur un tête-à-tête. En tout cas, et déjà, merci pour la... pour la petite review, là, c'est sympa.
**Robin** — Ah ouais, bah écoute.
**Thomas** — Sur le... sur le...
**Robin** — Moi, c'est enfin... en fait, avant que je commence un peu là-dedans, je disais à ma copine que j'étais ultra frustré de mon utilisation de l'IA.
**Thomas** — Ouais.
**Robin** — Et je me dis, bah putain, enfin, avec ce système-là, là, tu vois, je viens de le faire là, bim, je rentre un truc dedans, il me crée une notice, il me crée mes... alors je m'en sers effectivement plus comme d'un assistant personnel pour l'instant.
**Thomas** — Ouais.
**Robin** — Mais qui a une mémoire de dingo.
**Thomas** — Ouais, mais en fait, j'ai tout le... ouais.
**Robin** — Et pour l'instant, c'est vrai que j'ai pas encore connecté les mails, etc., tout simplement pour des problèmes techniques de... bah, j'ai fait l'erreur de me mettre en pop, je crois, sur mon cloud, et du coup, il voit pas, donc c'est un peu le bordel. Mais les mails, c'est vrai que c'est un peu le gros, gros flux que j'ai, donc ça, c'est un peu mon prochain truc, mais je sais pas techniquement comment faire, en fait, pour les mails. Donc ça, c'est vrai que ça me ferait du bien,
**Robin** — et puis après, c'est vrai qu'il y a tout ce qui est autour de la gestion des projets, où c'est quand même vachement bien d'avoir ce...
**Thomas** — Ouais, je réfléchis aux mails. Tu dis que c'est parce que tu es en serveur pop, c'est ça ?
**Robin** — Bah, du coup, je suis tout... je télécharge tout, en fait, il n'y a rien qui reste en ligne. Donc ce qui fait que je peux pas me connecter.
**Thomas** — Ah. Ah, et le serveur n'avait pas la réplication de ta boîte mail ?
**Robin** — Non, je pique tout, parce que je suis en pop. J'ai fait cette erreur-là il y a quelques années, et du coup, c'est pour ça que je suis coincé sur cette partie-là.
**Thomas** — Ok. Bah, alors, théoriquement, l'intérêt de l'avoir en local, il y a des limites avec la portabilité, etc., mais l'intérêt de l'avoir en local, c'est qu'il doit pouvoir trouver tes... Ah, j'en ai un nouveau.
**Thomas** — Hello, Sylvain.
**Sylvain** — Salut.
**Thomas** — Bonjour.
**Sylvain** — Ah, on est trois.
**Thomas** — Ouais. Il n'y a pas... il n'y a pas... j'ai le mois d'août, c'est le début, mais bon, au fur et à mesure.
**Sylvain** — Alors, d'autant plus que je vous prie de m'excuser, mais j'ai des amis qui viennent juste d'arriver, c'est la loi des ennuis maximum. Je voulais absolument vous montrer que j'étais là si ça m'était possible, mais hélas, je ne...
**Thomas** — Je t'ai entendu, oui.
**Sylvain** — Je ne peux pas. Je lirai attentivement votre transcript. Juste une information qui peut éventuellement vous intéresser, parce que ça correspond bien à ma fibre, moi.
**Sylvain** — C'est un gars qui a fait un web très, très bien documenté, avec 27 pages, sur l'art et la manière de mettre un PC, non pas un serveur comme moi j'ai mis, etc., quelque chose de plus simple, mais qui a quasiment les mêmes fonctionnalités, et c'est vraiment très, très bien documenté.
**Thomas** — Ah, ouais, ça m'intéresse.
**Sylvain** — Sans la méthode IPRA, c'est quand même très... ça se sert de VS Code et toutes ces sortes de choses. Donc je vous mettrai ça dans une communication, mais pour ceux que ça intéresse de travailler plus sur de l'IA isolée, ça me paraît un très bon outil. Je vous enverrai ça.
**Sylvain** — Je suis désolé de ne pas être là plus longtemps, mais je suis avec vous par esprit.
**Thomas** — Ça marche. Allez, merci beaucoup. Et puis, bah, on verra, ouais.
**Thomas** — C'était rapide.
**Thomas** — Oui, donc, le fait qu'il soit... en fait, comme il est sur tes fichiers, il doit pouvoir être capable de retrouver tes fichiers de boîte mail. Alors, je...
**Robin** — Ouais, faut que je travaille ça avec lui, là.
**Thomas** — Faut que tu travailles avec lui, à mon avis, tu arriveras à faire un truc.
**Robin** — Faut que je travaille ça. Je n'ai pas testé encore ta skill, là, sur les processus.
**Thomas** — Ouais.
**Robin** — Et en fait, je me posais la question... moi, je ne suis pas solo, mais toi non plus, donc je pense qu'on se retrouve quand même un peu là-dessus, de comment, en fait, admettons que... enfin, moi, j'avais déjà fait un petit peu ça, j'avais mis à jour plein de process, de machins, mais sur des outils que je maîtrisais que moi, et du coup, j'étais seul à y faire vie. C'est toujours toute la question, mais toi, tu dois te poser la question, là, dans ton nouveau job, de,
**Robin** — en fait, bah, tu vas créer des jolis processus, tu vas créer tes éléments sur HTML, etc., et comment tu fais pour, bah, que tu ne sois pas tout seul à mettre à jour ce bazar, et pour que les autres aient accès, et, bah, c'est un petit peu, là, comme ce qu'on avait déjà un petit peu évoqué, mais l'aspect, eh bien, collaboratif de ce qu'on a sur notre... enfin, collaboratif, partage, de ce qu'on a sur notre vault, comment est-ce qu'on le donne accès, comment est-ce que
**Robin** — les gens mettent à jour. Tu vois, là, je suis embêté sur une mise à jour où j'ai un super skills en local qui fonctionne bien, et, en fait, le problème, c'est qu'il n'est pas capable de synchroniser les dossiers qu'il crée dans le serveur de l'entreprise, donc, en fait, je me retrouve à faire des copier-coller, donc est-ce que j'y gagne à la fin, je ne suis pas sûr.
**Thomas** — Ouais.
**Robin** — Donc, ouais, c'est un peu toutes ces questions-là de... alors, d'une part, sur les processus qui sont un point à part entière, où je sais qu'il y en a besoin, mais j'ai du mal, moi, à voir comment j'arrive à les faire vivre sans pour autant tout porter. Et après, bah, un peu cette espèce de comment est-ce qu'on sort du vault, et comment est-ce qu'on fait rentrer d'autres gens avec nous, et comment est-ce qu'on les emmène avec nous, et ça, c'est dur, je trouve.
**Thomas** — Oui.
**Robin** — Je ne sais pas trop comment tu traites ça, de ton côté, là, dans ton nouveau job.
**Thomas** — Ouais, moi, honnêtement, de l'autre côté, je commence tout juste. J'ai une réunion d'introduction, alors je leur ai montré... je leur ai montré l'un des process que j'avais faits, c'était du traitement de réunions, comment optimiser les réunions, enfin, tu sais, faire le compte rendu, etc., de façon automatique, mais également, pour les récurrentes, de préparer la suivante.
**Robin** — Ok.
**Thomas** — En mettant à jour les tâches et tout ça. Donc, un truc relativement basique. En fait, moi, mon souci, c'est que les niveaux sont vraiment très disparates, et j'ai des gens qui sont très forts, et j'ai des gens qui n'ont quasiment jamais ouvert.
**Robin** — Ouais, bah oui.
**Thomas** — Et enfin, je pense que ça va être...
**Robin** — Comme tout ça.
**Thomas** — Partout, ouais.
**Robin** — Ouais.
**Thomas** — Et moi, ce que je voyais, alors, honnêtement, pour l'instant, je voyais surtout moi le mettre à jour, parce que je ne pense pas... enfin, parce que pour l'instant, les gens sont très pris par leur métier, etc. Au fur et à mesure, il faut que j'embarque. Il faut que j'embarque les gens, et là, en fait, ce qui est dur, c'est que tu rentres un peu dans un process de dev, c'est-à-dire qu'il faut te brancher à... c'est du HTML, donc il faut te brancher à du GitHub,
**Thomas** — et il faut qu'eux, leur instance locale, soit également branchée sur le GitHub.
**Robin** — Ouais.
**Thomas** — Et ça veut dire qu'à chaque... mais ça, l'IA, je pense, le fera elle-même, mais le principe de GitHub, c'est que quand tu vas travailler sur un sujet.
**Robin** — Ouais, je suis déjà dessus.
**Thomas** — Tu débarques... ouais, mais quand tu es développeur, enfin, tu vois, dans une équipe de développement, tu récupères ce qu'ils appellent le main, tu crées une branche, et tu... ah bah oui, ta copine, elle est développeuse.
**Robin** — Ouais, ouais, ouais.
**Thomas** — Bon, du coup, elle a peut-être plus expliqué, mais globalement, tu travailles sur une portion, puis tu la réinjectes dedans.
**Robin** — Ouais.
**Thomas** — Et c'est ça qu'il faut mettre en place. En fait, il faut traiter l'IA comme un développeur, et donc avec une équipe de développeurs dans chaque AIOS. Mais est-ce que les autres vont avoir un... enfin, ça veut dire que tu dois mettre un AIOS partout, ou alors c'est un agent ?
**Thomas** — Un agent en ligne ?
**Thomas** — Ouais, c'est un agent en ligne, tu discutes avec lui via le chat, et c'est lui qui gère tout ça derrière.
**Robin** — Bah, c'était un peu ça, moi. Pour moi, GitHub était quand même un peu une clé sur ce bazar, avec peut-être... j'avais regardé avec peut-être du Docker, des choses comme ça, mais pour l'instant, je ne maîtrise pas du tout.
**Thomas** — Ouais, ouais.
**Robin** — Pour aller, justement, faire toute cette mise à jour. Et puis, effectivement, comme tu posais la question, là, dans une des questions, sur DevOps, de mettre une espèce d'interface. Je dis, moi, je n'en ai pas besoin, mais potentiellement, en fait, les collègues, que ça n'amuse pas du tout d'avoir le VS Code, vont en avoir besoin.
**Robin** — Donc, c'est vrai que... mais bon, de toute façon, les collègues, s'ils en ont besoin, il faut un truc ultra sécure, parce que tu vois quand même que là, est-ce qu'on a sur nos postes l'outil... alors, supprime tout, bah, il va le faire. Donc, et là, il n'y a pas de corbeille, il n'y a pas de machin, il n'y a pas de... donc, bah, si, il y a toujours le Git, qui est quand même une sécurité pour au cas où on fait des conneries, mais... donc, ouais,
**Robin** — c'est ça que je trouve, moi, un petit peu... alors, du coup, j'ai un peu plus cette frustration de mon côté, d'un côté perso, où, en fait, tous les matins, je lance, j'ai ma petite... je lui dis : « On commence », et puis, en fait, il va faire le tour un peu de tout. J'ai mis un petit truc aussi, là, genre, dans tous mes projets, je lui ai dit : « Bah, le matin, tu me sors un quick win. » Je lui ai dit : « Bah, tu regardes un peu une tâche qui me
**Robin** — prendrait 5-6 minutes à faire, et tu me la sors. » Et comme ça, je me dis, bah, dans ma journée, si j'ai un peu suivi et que j'ai été tout chahuté, je dis : « Allez, j'ai quand même fait ce petit truc-là. »
**Thomas** — Ouais, c'est pas mal.
**Robin** — C'est génial, ça. Donc, j'ai rajouté à ma petite routine du matin. Ça, j'ai trouvé ça cool.
**Robin** — Puis après, moi, j'implémente, j'implémente sur plein de trucs, mais vraiment sur du process interne, aller faire le tour des projets, voir ce qui s'est passé, etc. Donc, ça, ça marche, ça, ça marche vraiment bien.
**Robin** — Mais c'est vrai que, voilà, j'ai un petit peu cette envie d'aller emmener tout le monde avec moi, et puis que tout le monde un peu gagne du temps, et je me retrouve peut-être un petit peu coincé. Alors, d'une part, on suit par les abonnements Claude, hein, l'idée, c'est d'essayer de ne pas mettre du Claude partout, ça va vite coûter cher, en termes de budget, même si c'est du temps qui ne passe pas, mais bon, voilà.
**Thomas** — Et je te dis.
**Robin** — Toujours un peu compliqué chez nous.
**Thomas** — Ouais.
**Robin** — Ces arguments de se dire : « Oui, mais 20 €, si, il économise temps. » Ouais, mais globalement, à la fin du mois, je vais continuer à le payer lui, et je vais continuer à payer Claude, donc à la fin, je vais perdre.
**Thomas** — Si ça ne génère pas directement de l'argent, c'est plus... enfin, il faut... en fait, c'est ça qu'il faut réussir à faire, c'est qu'il faut réussir à transférer le temps sur quelque chose qui génère davantage d'argent, ouais.
**Robin** — Donc, mais ouais, sur les processus, voilà, moi, j'avais essayé, alors, j'avais fait un truc qui était pas mal, là, avec Whimsical, Whimsical, je ne sais pas si tu connais.
**Thomas** — C'est vrai.
**Robin** — Un outil de... où, en fait, ça fait des processus WHIM.
**Thomas** — Ah oui, oui, oui, Whimsical, ouais, ouais, ouais. Oui, c'est une sorte de miro.
**Robin** — Ouais.
**Thomas** — Ouais.
**Robin** — Et en gros, ils ont mis de l'IA dedans, donc en fait, je fais le feignant, et je pense que ça peut se caler avec ton élément, c'est-à-dire que je dis à l'IA : « Bah, en fait, l'autre fois, j'ai fait un truc, j'avais écrit sur un papier, mais dégueulasse, mon processus à la main, je l'avais scanné, je l'avais décrit, je l'avais lu à la main à Claude, et je lui ai dit : « Bah, tu me fais un prompt pour Whimsical ? » Wouah, ce qu'il m'avait fait, c'était fou.
**Thomas** — Oui, c'est.
**Robin** — Franchement, dans.
**Thomas** — C'est marrant, moi, je l'ai fait quasiment sur une serviette, enfin, pas sur une serviette, mais l'écriture, elle était, mais moche.
**Robin** — Ah non, mais.
**Thomas** — Je n'oserais jamais montrer ça à mes enfants, parce que je les fais chier tout le temps avec ça.
**Robin** — Moi, c'était pareil, c'était pareil.
**Thomas** — Ouais, il est fort. Enfin, lui-même, j'arrivais, tu sais, c'est à moitié abréviation, à moitié... mais U, mais M, c'est pareil, enfin, bref, le truc, et oui, il arrive à trouver.
**Robin** — Donc ça, ça marchait bien, et puis l'avantage, c'est qu'au moins, le Whimsical, tu peux partager tes accès.
**Thomas** — Oui.
**Robin** — Du coup, c'est un truc qui est en ligne, donc sur les processus, je trouve que c'est intéressant, et puis ça se prend vite en main, c'est quand même pas déconnant.
**Thomas** — Oui, c'est facile, ouais.
**Robin** — Donc, mais par contre, pour la création, plutôt que de t'emmerder à maîtriser l'outil, bon, bah, tu fais un premier jet à 80 % bon, et tu demandes à Claude de le faire, je pense, grâce à ton skill, et derrière, tu le génères comme ça, c'est vrai que c'est intéressant.
**Thomas** — En fait, c'est la même chose, hein. La grosse différence, c'est juste... la seule différence, c'est le support, finalement, toute la réflexion, elle est dans le skill, dans l'échange qu'il peut avoir avec toi. Après, lui, ce qu'il fait sur du HTML, le seul truc du HTML, c'est que ça brille un peu, il y a de la lumière, et du coup, tu peux le partager, enfin, tu as un effet un peu waouh plus sympa.
**Thomas** — Mais sinon, la logique, c'est exactement la même, et tu peux mettre n'importe quel outil en sortie, quoi, même un PowerPoint. Moi, je l'ai fait avec PowerPoint, à un moment, parce que je voulais pouvoir éditer, justement, je n'ai pas pensé à Whimsical.
**Thomas** — J'étais sur Excalidraw, tout ça, mais en fait, ce qui est embêtant, c'est que chez moi, j'ai plein d'accès, plein d'outils comme ça, et au boulot, je n'en ai pas. Et du coup, je me retrouve coincé, j'essaie de faire avec des trucs un peu plus basiques, genre PowerPoint, et il m'a fait un truc correct sur PowerPoint, quoi.
**Robin** — Ok. Mais clairement, je suis carrément d'accord, là, avec l'analyse que tu avais sur les processus, et je me dis, déjà, quand j'ai vu un petit peu, là, quand on a commencé à faire l'automatisation via Make, bah, je me suis dit, bah, en fait, là, pas besoin d'écrire le processus, pas besoin, en fait, globalement, il est là, il est physiquement devant ta tronche, et il tourne. Donc, en fait, ce n'est pas un truc que tu respectes, que tu ne respectes pas, c'est : « Bah, c'est comme ça que ça
**Robin** — marche, regarde, en fait, suis la ligne. » Je dis : « Wow, ça, c'est génial, sur cette partie N8N, Make. » Et là, avec ça, je me suis dit, bah, ouais, là, il y en a quand même moyen de faire vivre un peu des processus sans que ce soit le truc vraiment chiant que personne n'a envie de faire vivre sur des outils imbuvables, enfin.
**Thomas** — Oui, oui, oui.
**Robin** — Donc, voilà, et ça, c'est sûr que ça peut être intéressant sur cette.
**Thomas** — Whimsical, c'est intéressant, parce que, alors, en fait, c'est quand même... tu pourrais lui donner comme... enfin, finalement, te servir de Whimsical comme d'un input aussi, en disant que si tu as des modifications, tu les fais là-dessus, et tu lui dis d'aller voir les modifications. Mais tu ne retrouves pas de problème de « je peux tout péter », quoi.
**Robin** — Je ne sais pas s'il y a un MCP par rapport à... avec cet outil-là.
**Thomas** — Si, je pense. Enfin, il y en a pour Miro, moi, j'utilise Excalidraw, qui est un peu pareil, qui a un côté sympa, c'est parce que tu as l'impression que c'est écrit à la main, etc., mais il y a peut-être moins de fonctionnalités que Whimsical, donc il faut peut-être aller voir Whimsical quand même. Et donc, ouais, je serais vraiment étonné qu'il n'y en ait pas, ou que tu n'en trouves pas, en tout cas, de tout faire par quelqu'un d'autre, ou.
**Robin** — Et là, toi, tu es dans une boutique où vous êtes je ne sais pas combien, 200, un truc comme ça, tu m'avais dit ?
**Thomas** — On est, ouais, 150.
**Robin** — Et là, ton projet IA, c'est quoi, un petit peu, ta feuille de route ? Comment tu vois le boulot que tu vas faire, comment tu as vendu ta boss ?
**Thomas** — Alors, moi, je vais faire le... en gros, mon but, moi, je vois trois niveaux. Moi, mon mandat, c'est d'optimiser l'efficacité de la boîte, enfin, les process et tout ça en termes, donner de la productivité à chacun. Et je vois trois niveaux : je vois le niveau personnel, donc c'est déjà pas mal de formation et tout ça.
**Thomas** — Aujourd'hui, honnêtement, trop à mon goût, parce que je n'ai pas encore vraiment rencontré tout le monde. Donc, tu as le niveau personnel, tu prends les tâches de chacun, et tu vas aller optimiser.
**Thomas** — Là, j'ai vu un expert-comptable qui fait du job de saisie pendant deux jours ou trois jours par semaine, donc moi, c'est parfait, parce que ça va justifier mon salaire assez vite, tout ça. Mais tu vois, et oui, alors, du coup, c'est traiter des petits flows comme ça, de là, il reçoit des... en fait, eux, ils centralisent tout un tas de boîtes qui bossent sur les chantiers, et ils reçoivent des feuilles de... enfin, pas des feuilles de temps, mais des... je n'ai pas encore vu le document,
**Thomas** — mais globalement, la saisie des temps. Et il est embêté, parce qu'il y a pas mal de mecs qui le font un peu bizarrement, enfin, qui ne le font pas en suivant le process, et du coup, ils doivent faire des allers-retours, etc. Donc, moi, je vais déjà essayer de normaliser tout, enfin, toute la partie qui suit bien le process, je vais essayer de lui faire disparaître pour que ça se passe tout seul, et après, voir si je peux faire quelque chose sur la partie où ça coince.
**Thomas** — Donc, j'ai vu ça, j'ai vu après une comptable aussi, une autre comptable qui, elle, doit faire des rapports et tout ça, donc voilà, tu vois, c'est des process vraiment de tâches spécifiques à des personnes.
**Robin** — Ouais, ok.
**Thomas** — Mais plutôt des personnes payées cher et qui font du travail qui pourrait être fait par quelqu'un d'autre, ou enfin, qui veut dire qu'il n'y a pas... ce n'est pas là qu'est leur valeur, quoi.
**Robin** — Non.
**Thomas** — Et derrière, l'autre niveau, c'est plutôt le niveau d'équipe. Ça, pour l'instant, dans la réunion, les gens n'ont pas encore compris ce principe-là, enfin, je n'ai eu qu'une réunion, hein, mais on a parlé de problèmes plutôt individuels, et moi, ce que j'aimerais, c'est plus... mais peut-être que c'est ma vision de mes tâches précédentes, c'est voir comment on a un process avec plusieurs personnes et comment l'améliorer. Moi, je travaillais avec des équipes de développement, j'étais PO.
**Thomas** — Globalement, j'avais commencé à mettre ça en place de l'autre côté également, c'est faire toutes les user stories, et les user stories, pouvoir les... donc, globalement, c'est le cahier des charges, et que les devs puissent le prendre facilement, voir l'IA des devs, et tu vois, qu'on bosse un peu là-dessus. Donc, des process qui vont toucher tout le monde.
**Thomas** — Mais j'avoue que je n'ai pas encore réussi à le mettre en place, là. Et je n'ai pas rencontré toutes les équipes, et j'ai l'impression que les gens ne parlent pas beaucoup entre eux, c'est un peu la donnée, et du coup, ce côté-là, à voir.
**Thomas** — Mais c'est peut-être quelque chose à faire évoluer.
**Robin** — D'accord.
**Thomas** — Par contre, je vois des trucs... un autre truc que j'ai mis en place sur mon AIOS, et ça, je pense que ça pourrait t'intéresser aussi, c'est un journal de décision. En gros, c'est quand tu hésites sur un truc, et que tu prends une décision, que tu tranches sur quelque chose, tu l'enregistres, et tu dis pourquoi.
**Thomas** — Donc, tu actes la décision, et tu t'expliques le... en fait, tu as un fichier qui va lister toutes les décisions qu'il y a eues. C'est un peu différent du log, hein.
**Thomas** — Et tu as un autre fichier qui va expliquer le choix à faire, et quels sont les... quelle est la clé de la décision.
**Robin** — L'arbitrage, quoi.
**Thomas** — Ouais, quel est l'arbitrage. Et ce qui fait que moi, j'ai une mémoire de poisson rouge, et si je reviens sur un truc deux, trois semaines après, et que je propose l'autre alternative, il dit : « Non, on avait décidé ça, souviens-toi, et c'était parce que... » tac, tac, tac. Alors, des fois, je vais revenir sur ma décision, et je vais bouger, et des fois, je vais dire : « Oui, tu as raison », et ça m'économise le... moi, à titre perso, ça m'économise le temps de refaire la réflexion, et je pense
**Thomas** — que dans une dimension équipe, ou chantier notamment, tu as des choix ou des... ou peut-être des erreurs, hein, tu peux aussi loguer des erreurs comme ça, tu sais, des espèces de petits post-mortems, qui font que, bah, quand tu vas travailler, tu dis que tu vas travailler sur telle problématique, l'IA va te dire : « Sur ce genre de problématique, on avait fait ça la dernière fois, ça a bien marché, ou ça n'a pas marché, et/ou on avait choisi ça versus ça, et pour telle raison. » Et
**Thomas** — ça évite... ça peut éviter des discussions, des choix, des erreurs, des trucs comme ça.
**Robin** — Ouais, ou de refaire deux fois la même connerie. Mais ça, par rapport au log, parce que pour moi, le log, il fait déjà un petit peu ça.
**Thomas** — Le log.
**Robin** — Le log, il est nettoyé, c'est ça ?
**Thomas** — Le log, ouais, alors, au bout d'un moment, tu es obligé de le nettoyer, et aussi, pour moi, c'est très... tu n'as pas l'explication.
**Robin** — Ah ouais. Ouais, le log, c'est : « J'ai fait ceci et cela. »
**Thomas** — Pour moi, le process, c'est : « J'ai bougé telle ligne, j'ai fait tel truc, j'ai... » tu vois, je ne sais pas, « j'ai choisi ça par rapport à ça. »
**Robin** — Ok. Et c'est toi qui l'actives pour dire : « Ça, tu me l'archives dans la décision », ou comment tu gères ça ?
**Thomas** — Non, je le mets dans le... je le remonte dans les conventions et tout ça, enfin, pas les conventions, les... non, c'est dans le Claude MD, il dit que quand tu as des décisions, des trucs comme ça, d'aller vérifier ça.
**Robin** — D'accord.
**Thomas** — Après, je pense que la mémoire joue aussi là-dessus, à court terme. Enfin, pour l'instant, je n'ai pas... c'est trop récent pour que les sujets dont je parle ne soient pas dans la mémoire, donc je pense qu'avec la mémoire, il sait qu'il doit aller regarder ça directement.
**Robin** — Ok.
**Thomas** — Mais je trouvais que le... en entreprise, je pense que ça peut être assez intéressant, enfin, dès que tu as une dimension projet, finalement, et que tu as des choix assez structurants à faire à un moment donné, ça t'apporte du... ça t'apporte pas mal d'insight, je pense.
**Robin** — Ok.
**Thomas** — Ouais, justement, c'était un peu les questions que je me posais. Bon, là, on n'est que deux, donc c'est plus compliqué, mais je me demandais un peu quels étaient les usages de chacun de l'AIOS. Ça m'aide, enfin, déjà, je trouve ça hyper intéressant.
**Robin** — Ouais, comment c'est pris en main, quoi.
**Thomas** — Ouais, comment c'est pris en main, et puis finalement, tu te rends compte que, bah, il y a une logique de départ, mais derrière, c'est ultra personnalisé à l'activité de chacun, et du coup, tu vois, tu as parlé de Make, N8N, tout ça, donc c'était une des questions que je me posais : est-ce que... est-ce que, moi, aujourd'hui, j'ai tendance à ne plus rouvrir du tout Make ? Avant, je ne faisais que ça.
**Robin** — Ah ouais ?
**Thomas** — Là, je ne l'ouvre quasiment plus. Je suis en train de me demander si je vais reprendre un... enfin, il y a quelques jours, là, je me demandais si j'allais reprendre mon abonnement, et au final, je me suis dit : « Ouais, mais est-ce que ce n'est pas une bêtise, en fait ? Est-ce que, justement, il ne faut pas essayer de refaire un peu plus de process, tu vois, de standardiser un peu le process une fois qu'il est figé avec l'IA, quoi ? »
**Robin** — Bah oui, mais Make, ça te fait des choses à ta place, quoi, c'est ça que je trouve intéressant.
**Thomas** — Ouais, mais au final, l'IA peut faire tout ce que fait Make.
**Robin** — Ouais, ouais, mais encore une fois...
**Thomas** — Mais c'est plus boîte noire. Tu vois, moi, j'ai ma veille, là, je me suis fait un système de veille assez intéressant. Toi, tu ne gères pas de concepts, de choses comme ça ?
**Thomas** — Donc, j'ai de la veille, je l'ai remanualisée un petit peu à l'entrée, parce que j'avais trop d'entrées sinon. Mais globalement, ça me fait un petit résumé de chaque sujet de veille, ça me propose trois, quatre concepts candidats.
**Thomas** — Il va vérifier... enfin, je ne sais plus comment je vais appeler ça, mais en gros, ce sont des idées, et il va vérifier s'il y a des concepts existants qui se rapprochent de ce truc-là. Donc, j'ai mis un outil dans... j'ai mis un outil dans Obsidian qui va chercher la... qui donne un score de... un score qui te montre la proximité de deux idées, en fait.
**Thomas** — Il se base sur la sémantique, il se base sur le contexte, et en gros, il me dit : « Bah, cette idée-là, ça rejoint ce que tu as vu dans cette veille-là, ça rejoint globalement cette idée-là globale, et je peux venir l'enrichir, je peux venir l'amender, je peux venir juste l'illustrer », ou des choses comme ça.
**Thomas** — Et pourquoi je te disais ça ? Oui, et donc, et cette veille-là, donc, il y a plein de choses que je pourrais automatiser avec Make ou N8N, mais aujourd'hui, tout est fait par l'IA, quoi.
**Robin** — Ouais, parce que tu es sur ton poste à toi, mais moi, je vois Make qui m'automatise des créations de...
**Thomas** — Oui, tu as raison.
**Robin** — Des créations de prospects dans mon CRM, il envoie des mails, il fait des machins, il fait des trucs, et du coup, là-dessus, je... c'est pour le prix, en plus, on va passer sur N8N, donc là, pour le prix, la question ne se pose même pas de basculer sur ce genre d'outil-là.
**Thomas** — Ouais, ouais, ouais.
**Robin** — Et au moins, l'avantage, c'est que ce sont des processus qui sont déterministes. En gros, il n'y a pas de « à un moment, putain, j'ai mal prompté », ou « le truc n'allait pas ». Même s'il y a un peu d'IA dedans, ça reste pour moi du déterministe, et de ne pas tout basculer sur de l'IA sous prétexte qu'on peut le faire.
**Robin** — Je me dis que c'est quand même intéressant d'avoir quelque chose d'assez établi, tout propre.
**Thomas** — Oui, oui, là, ça va.
**Robin** — Même si je trouve le skill aussi, le skill va ressembler un petit peu à un processus Make, hein.
**Thomas** — Oui, tu peux.
**Robin** — Parce que c'est à peu près la même chose, c'est-à-dire, on formalise quelque chose qui va se faire tout le temps de cette manière-là.
**Thomas** — Enfin, si dans ton skill, tu lui mets la référence d'un schéma Wisprical, il va faire exactement la même chose que Make.
**Robin** — Ouais.
**Thomas** — Enfin, il va suivre la logique et tout ça. Finalement, Make, ce ne sont que des appels API, et l'IA, c'est le faire, mais à partir du moment où tu lui donnes... enfin, où tu n'as pas 10 000 choix possibles. Par contre, aujourd'hui, moi, tu vois, en termes de quantité, ça tient.
**Thomas** — Enfin, en fait, on rejoint un débat qu'on a eu la dernière fois sur le... enfin, débat, en fait, sur le coût de l'IA versus le coût du... enfin, le coût à l'API versus le coût au forfait, quoi. Et aujourd'hui, c'est vrai que c'est tellement un peu obscur, tout ça, que, en fait, je ne sais pas combien ça me coûte de faire cette veille.
**Thomas** — Tu vois, sur Make, je saurais combien exactement de crédits j'utilise, etc., tu vois, je peux bien le valider. Là, c'est plus complexe.
**Thomas** — Mais ouais.
**Robin** — Bizarre.
**Robin** — Ouais, c'est vrai, ça, pour moi, c'est... là, c'est vraiment de l'optimisation. Et puis, ce que je trouve intéressant, c'est pareil, moi, je réfléchis beaucoup aux équipes.
**Robin** — Alors là, moi, j'ai ma collègue qui gère sur Make, qui gère sur d'autres outils, donc...
**Thomas** — Oui, tu vois, c'est ça.
**Robin** — Et puis, c'est un petit peu comme plein de choses où, en fait, toi, on a déjà fait tout le chemin, j'ai regardé des heures et des heures de vidéos de Elliot Money et compagnie, tes vidéos à toi, et du coup, moi, quand j'arrive sur le second cerveau, je suis vachement chaud, les mecs, ils me regardent, ils me disent : « Mais qu'est-ce qu'il raconte, ce mec ? » Et ils ne sont pas dedans. Donc, en fait, de les emmener sur un truc où toi, tu es déjà allé, en fait,
**Robin** — tu es tout content, tu leur dis : « Bah, venez voir là-bas, ça va être trop bien. » Ils disent : « Mais attends, moi, je ne suis pas allé là-bas encore, donc laisse-moi le temps d'y aller. » Et c'est ça qui est dur, je trouve, à emmener les équipes quand on n'est pas intéressé, mais sur plein de choses.
**Robin** — C'est sur des questions d'organisation personnelle, de choses comme ça. Je vois OBE, là, ça traîne.
**Robin** — Il y a un bureau d'études, d'ailleurs, dans ton entreprise ?
**Thomas** — Je t'avoue, je ne sais pas encore. En fait, le problème, je suis arrivé avant ce qu'ils appellent ici les vacances de la construction, et les vacances de la construction, c'est deux à trois semaines. Enfin, théoriquement, c'est deux semaines, mais dans les faits, je me rends compte que ça dure trois semaines, et globalement, tous les chantiers sont fermés.
**Robin** — Ok.
**Thomas** — Et du coup, tout le monde prend les vacances à ce moment-là. Donc, j'étais tout seul dans la boîte pendant pas mal de temps, là, et du coup, je n'ai pas eu le temps de... j'ai rencontré plutôt des services ressources, donc les RH, la comptabilité, etc., mais pas...
**Robin** — Tu as la comptabilité.
**Thomas** — Mais oui, il y a certainement un bureau d'études, ouais. Non, attends, je te dis une connerie, je crois qu'ils l'ont... je crois qu'ils avaient l'activité, ils l'ont fermée.
**Robin** — Ah ouais ?
**Thomas** — Ouais.
**Robin** — Ok.
**Robin** — C'est bizarre.
**Thomas** — Je ne sais pas. Je t'en jure, honnêtement, vraiment, je t'en dirai plus la prochaine fois. C'est un peu honteux, mais non, ouais, je... pour l'instant, je n'ai pas suffisamment rencontré de monde.
**Robin** — Et après, est-ce que toi, là, j'écoutais pas mal de podcasts, là, pendant mes vacances, j'en avais qui faisaient une espèce de wiki d'entreprise ou des choses comme ça. Ça, ce sont des choses qui te parlent ? Comment tu vois ça, toi, avec le système qu'on a sur...
**Thomas** — Ouais, c'est tout la méthode Carpathie, là ? Ce n'est pas nécessairement Carpathie, non, c'était un gars, c'était quoi ? Non, non, non, pas nécessairement.
**Robin** — Ouais, mais ça a pris... en fait, ça a pris de l'ampleur quand, lui, il en a parlé à un moment, il a partagé un skill qu'il faisait, etc.
**Thomas** — Ouais, non, moi, le gars que j'ai entendu, il l'avait d'avant, hein, il l'avait d'avant. Ah ouais ?
**Robin** — Ouais, ouais.
**Thomas** — Mais en fait, pendant un moment, je me disais que c'était moins bien, et maintenant, je me demande... en fait, à titre personnel, je pense que c'est moins bien, mais effectivement, en termes d'entreprise... attends, tu parles de... oui, tu parles de wiki d'entreprise, pas de wiki personnel.
**Robin** — Ouais, bah, en gros...
**Thomas** — Ouais, bah...
**Robin** — Dès que tu as une question : « Comment je prends mes vacances ? Comment je prends machin ? Comment je prends bidule ?
**Robin** — À qui je m'adresse là-dessus ? Comment tu fais ci, comment tu fais ça ?
**Robin** — Les process, où ils sont ? » Parce que c'est bien gentil d'avoir des process, mais à un moment, s'il faut un process pour savoir où trouver le process...
**Thomas** — Tout à fait. Non, mais c'est clair, bah, en fait... et pour moi, ça... pour moi, en fait, ma réflexion là-dessus, c'est que l'AIOS tel qu'il est, on a le cerveau en local, et c'est peut-être ça qu'il faut bouger, justement. C'est-à-dire que ton AIOS, il doit être plus peut-être sur tes actions et tes projets en cours.
**Thomas** — Enfin, tu vois, la dimension connaissance, c'est peut-être ça qui peut être partagé plus facilement.
**Robin** — Ouais, je suis d'accord. Peut-être que c'est ça, la réflexion. Oui, parce que toi, tes projets, tes casquettes, bon, c'est bien si elles ne sont pas partagées à tout le monde, parce que tu dis quand même des choses, des fois...
**Thomas** — Ouais.
**Robin** — Oui, ou pas.
**Thomas** — Les confidentiels, moi, ils sont à fond sur la sécurité, c'est des hôpitaux, des centrales nucléaires, etc., tu... la sécurité, elle est... Tu ne fais pas le con là-dessus. Mais c'est vrai que voilà, il y a... alors,
**Robin** — je me disais, des fois, d'avoir une espèce de second cerveau où tu vas mettre vraiment la data.
**Robin** — Et je voyais même... moi, le truc que je voyais, c'était : en gros, tu as une espèce de second cerveau, enfin, on va dire, de wiki d'entreprise qui est sous le format qu'on a là, mais qui est implémenté, on va dire, à part, qui a une sauvegarde Git, et après, tu as une espèce de chatbot qui vient interroger ce Git, en fait. Moi, en fait, l'idée, c'est de passer par Git, parce que Git, ça permet d'avoir du partage et de la mise à jour, mais ce n'est que
**Robin** — de la consultation. Tu n'as encore que le mec qui gère ce wiki, qui a accès à ce truc-là, qui va pouvoir popper sur le Git, etc., mais via une espèce de chat qui te donnerait accès, voilà, au Git, puis à ton élément, sous réserve que ton élément soit tout le temps allumé, etc., donc...
**Thomas** — Moi, j'ai vu une architecture comme ça où les mecs faisaient ça sur un drive.
**Robin** — Ok.
**Thomas** — Et donc, le drive est synchronisé, tu peux le partager, etc. Moi, j'ai regardé un peu côté... j'ai commencé à regarder côté SharePoint, là, c'est SharePoint ici.
**Robin** — Ah oui.
**Thomas** — Mais tu vois, un drive où tu as le système de fichiers partagés, etc., donc tu peux très bien avoir tes fichiers MD, voire DOC, mais bon, c'est plus lourd, mais...
**Robin** — Il y a plus de parasites dans le DOC, hein.
**Thomas** — Ouais, ouais, carrément. Mais c'est consultable. Enfin, tu vois, ça dépend ce que tu veux mettre dedans, en fait.
**Thomas** — Ça dépend comment tu veux... en fait, ça dépend comment tu veux rendre la réponse. Est-ce que tu veux rendre un document DOC que la personne peut consulter, ou un PDF, ou peut-être...
**Robin** — Ou un chat que le gars consulte, quoi.
**Thomas** — Ouais, ouais. Mais tu vois, si c'est du MD, ce n'est pas très consultable.
**Robin** — Ouais, après, il faut installer, ce n'est pas très compliqué. Obsidian, ça se prend quand même assez vite en main, je trouve.
**Thomas** — Ouais, mais tu reviens sur la problématique de toi qui y es déjà, et lui qui n'est pas encore, et il faut l'accompagner sur le chemin, quoi. Mais oui, je te rejoins, mais tu vois, un drive, je pense que ça fait le travail. Si tu veux juste afficher des choses, moi, j'ai commencé à faire ça, mais je ne l'utilise pas assez.
**Thomas** — J'ai commencé à faire ça, justement, sur ma base de connaissances de sources, de machins, de veilles, de concepts. J'ai utilisé Supabase, et je voudrais tester un graphe, Open Graph dessus, enfin, Graphify.
**Thomas** — Après, il y a d'autres... apparemment, il y a d'autres databases qui sont encore mieux fichues pour, en fait, pour rapprocher les... enfin, pour faire des recherches sémantiques, rapprocher des concepts, etc., faire un graphe directement et de façon automatique.
**Robin** — Après, tu tombes dans du RAG, quoi.
**Thomas** — Ouais. Bah non, c'est au-delà, pour moi, c'est plus que le RAG.
**Robin** — Ok.
**Thomas** — Parce que le RAG, c'est vraiment des petits bouts un peu partout. Là, tu crées des liens, en fait. Tu crées des liens qui portent une valeur.
**Thomas** — Donc, c'est ce concept-là, il est lié à ce concept-là, et le lien, c'est, je ne sais pas, c'est parents, ou enfin, parents, non, ce n'est pas le truc, mais tu mets de la valeur en plus sur le lien, et du coup, ça te crée vraiment le... c'est un peu ce que tu vois dans Obsidian, quand tu vois tous les liens, etc., mais en plus, tu as de la valeur sur le lien, donc ce qui permet de faire de la recherche beaucoup plus facilement. On avait
**Thomas** — travaillé chez Laurent Merlin, et on avait ça pour... ils étaient vachement en avance. On avait ça il y a une dizaine d'années, et après, on est partis IA pour gérer toute la connaissance, tout ça.
**Thomas** — Mais oui, je pense qu'il y a peut-être un truc à faire, à creuser. Peut-être qu'on met trop de savoir dans les AIOS, et peut-être qu'il faut être plus sur l'Exe, et le savoir, le déporter un peu pour le rendre accessible à tout le monde.
**Robin** — Ouais.
**Thomas** — Par contre, tu as une API qui permet que ce soit un RAG, que ce soit des fichiers stockés sur un serveur distant, ou de l'Open Graph, je pense qu'à partir du moment où tu es capable, enfin, où ton IA est capable d'aller interroger ça, ça tient dans le... enfin, en termes d'architecture et de prix, etc., tu restes sur le forfait, et je pense que ce n'est pas très consommateur, quoi.
**Robin** — Ouais, ouais, carrément, ouais.
**Thomas** — C'est peut-être même moins, d'ailleurs, parce que quand tu as une recherche, tu vois, quand le... même s'il y a les index et tout ça dans les fichiers MD qu'on met en place, je pense que toute la partie recherche, elle est... alors, si tu le fais via une base de données, pas si tu le fais sur un drive, mais si tu le fais sur une base de données, toute la partie recherche, elle est portée par la base de données, ce qui veut dire que ton IA, pendant
**Thomas** — ce temps-là, elle ne pédale pas, elle attend juste la réponse.
**Robin** — Ah ouais.
**Thomas** — Donc peut-être que c'est moins coûteux.
**Thomas** — Moi, j'avoue que pour le moment, je ne suis pas trop gêné en termes de prix.
**Robin** — Non, ce n'est pas tant en termes de prix, moi, c'est vraiment comment j'emmène tout le monde avec moi, en fait.
**Thomas** — Oui, oui, oui. Oui, mais le... enfin, moi, le gros point, ou le gros red flag que j'avais là-dessus, c'était vraiment le prix, le fait de passer par les API, et que d'un seul coup, tu passes sur un truc où tu ne contrôles plus du tout le prix.
**Thomas** — Et je pense qu'on... ouais, quand tu as 10 utilisateurs et que d'un seul coup, c'est de l'IA qui est... enfin, c'est du prix à l'API, et ce n'est pas... si tu n'as pas à gérer tes plafonds, etc., c'est déjà vite complexe. Et si tu as à gérer des plafonds, c'est qu'à un moment, tu peux ne plus pouvoir utiliser ton système, parce que tu es arrivé au plafond.
**Thomas** — Mais ouais, cette partie-là est intéressante, il y a le... donc Sylvain, tout à l'heure, est passé, lui, il est à fond branché sur les open source, l'installation en local, etc.
**Robin** — Ok.
**Thomas** — Et il y avait une autre personne la dernière fois qui s'appelle Igor, qui avait une idée assez sympa, mais enfin, il faut que j'en parle à Sylvain avant, mais... on va voir si on ne fait pas des espèces de comités, pas des comités, mais tu vois, des groupes, pour ceux qui sont intéressés par ce truc-là, et quelqu'un qui lead un peu, et qui va creuser un peu toutes les options, qui revient derrière avec... qui vient présenter un peu aux autres.
**Thomas** — Ah ouais, ouais, ouais. Oui, parce qu'il y en a qui ont des appétences, on va dire, différentes.
**Thomas** — Ouais, c'est ça, lui, c'est un ancien DSI, il est...
**Robin** — Ouais.
**Thomas** — Et tout ça. Il est très hardware, et très intéressé par le hardware, et plus les machines et tout ça, que par les process. Donc, tu vois, c'est du... tu sens que le sujet, lui, il est à fond, quoi.
**Robin** — Oui, oui, là où moi, globalement, le hardware m'intéresse un peu moins, et j'ai plus une vision équipe, process entreprise, où je dois faire tourner tout le bazar. Et c'est vrai que je challenge souvent aussi, d'ailleurs, ma copine, là, parce qu'ils sont... elle boutique, ils sont bien 180, une grosse équipe de devs, et en fait, je ne sais pas, mais le CTO, il est tout récent, donc il va falloir qu'il mette des choses en place, mais c'est marrant de voir qu'il n'y a pas vraiment d'outil d'entreprise, il
**Robin** — n'y a pas vraiment de process, il n'y a pas vraiment de... tu as des équipes, ça bosse en silo, des fois, ils se rendent compte de trucs, genre.
**Thomas** — Oui, les devs, ce ne sont pas des gros communicants après, pour les outils. Mais je suis partagé là-dessus, je ne suis plus partagé là-dessus, parce que, tu vois, on avait bossé chez Laurent Merlin, on était... Laurent Merlin, il y a 500 personnes sur le site web, donc tu vois, c'est un truc énorme, et donc on était par équipe de 7-8, en mode agile et tout ça, et au départ, le but, on te donnait ton objectif, et tu te débrouillais complètement tout seul, donc tu
**Thomas** — t'organisais comme tu voulais. Alors, tu avais... enfin, ce n'est pas tout à fait vrai ce que j'allais dire, c'est que tu choisissais tes outils, tes process, alors tu avais quand même des outils très orientés dev qui étaient obligatoires, mais tu vois, tu n'avais pas un... nous, à un moment, on n'avait pas Jira, on utilisait des post-it qui étaient collés sur les murs, et rien d'autre, quoi.
**Thomas** — Et il y en avait qui étaient sur Jira, il y en avait qui étaient sur tel truc, et tout ça, quoi. Et je trouve ça bien aussi de laisser la liberté à l'équipe de s'organiser comme elle veut, quoi.
**Thomas** — Mais il y a la partie communication qui est effectivement hyper... et c'est là où un système un peu d'entreprise qui centralise des projets, qui t'allume une petite lumière en disant : « Attention, vous bossez là-dessus », il y a eux qui bossent aussi là-dessus.
**Robin** — Ouais.
**Thomas** — Ça peut être pas mal.
**Robin** — Ouais, ou des : « Ah bah tiens, est-ce qu'on n'a pas déjà fait ça il y a deux ans ? »
**Thomas** — Oui, exactement.
**Robin** — Parce que là, c'est pareil, tu as des... ouais, nous, il y a des trucs... alors, après, il y a d'autres process, hein, plutôt issus des trucs de dev, mais là, je me fais envahir par les Git, de reviews, de choses comme ça, et en fait, tu dis : « Bah ouais, une review, c'est sympa, mais si tu pouvais la rendre exploitable, si tu pouvais la rendre consultable et interrogeable, ce serait stylé », parce que voilà, nous, l'idée, c'est : « Mais toi, ça va être pareil, attends, l'hôpital qu'on a fait il
**Robin** — y a quatre ans, on avait fait une connerie sur ce truc-là, qui s'en souvient ? Toi, tu étais là ? » « Non, moi, je n'étais pas là.
**Robin** — Moi, j'étais là, mais ce n'était pas mon chantier. » Et du coup, tu te retrouves complètement à réinventer la poudre, tu dis : « Putain, c'est dommage, on avait fait une review à l'époque, elle est rangée où ?
**Robin** — Je ne sais pas. » Et déjà, juste, en fait, ce genre de petite fantaisie-là, je me dis : « Ben, il y a quand même de la data qui est là, ou en tout cas qu'on pourrait faire. » Et les gens, en plus, si les gens ne savent pas comment elle pourrait être exploitée dans le futur, ils ne le font pas.
**Robin** — Ils disent : « Bon, si c'est pour faire une review, pour juste se taper dans le dos et se dire qu'on ne fera pas les mêmes conneries la prochaine fois, ça ne sert à rien. » Et tu vois, moi, c'était ça aussi, je me dis : « Bah, comment j'arrive à mettre en place un système de review ? » Donc très bien, ça, je vais le faire tous les lundis matins en réunion d'équipe, ok, mais derrière, comment j'arrive à ce que mes équipes puissent les interroger ?
**Robin** — Alors, la review, je pense à deux intérêts. L'intérêt est, sur le moment, de pousser l'autre à se projeter et à réfléchir et à regarder dans le rétroviseur, et à voir qu'est-ce qui a bien marché, qu'est-ce qui n'a pas marché, donc je pense qu'intellectuellement, c'est cool pour lui.
**Robin** — Et il y a aussi de : « Ben, dans quatre ans, on avait fait un chantier comme ça, comment on avait fait ? Qu'est-ce qui s'était mal passé ?
**Robin** — Qu'est-ce qui s'était bien passé ? » Et ça, l'IA, je me dis, c'est un outil incroyable pour le faire, parce que moi, dans la boîte, c'est moi qui fais ça.
**Robin** — Ils me disent : « Tu as fait un chantier comme ça ? » « Ouais, ouais, c'est ce chantier-là, machin, en 2022. » Ouah, ok.
**Robin** — Mais sauf que, voilà, ce n'est pas éternel, et ce n'est pas idéal non plus que tout repose sur une seule personne. Donc comment, en plus, tu arrives à partager la connaissance.
**Robin** — Ouais, mais quand même.
**Thomas** — C'est là où le wiki, effectivement, c'est là où tu rejoins plus une dimension wiki que second cerveau.
**Robin** — Ouais, ouais.
**Thomas** — C'est de l'archive, quoi, tu vois. Enfin, c'est de l'archive dans le sens où ça doit être consultable, mais il faut que ce soit consultable. Mais l'IA, c'est de la valeur morte, enfin, pas morte, je ne sais pas, je ne trouve pas le terme, mais globalement.
**Robin** — C'est un peu la mémoire dure, quoi. C'est un peu ta mémoire vive, et puis ton disque dur où c'est stocké dedans, et ça ne bougera pas, mais c'est au moins consultable. Et c'est vrai que d'avoir un cerveau qui est en capacité d'aller, bah ouais, une IA en local qui est sur tes projets, tes machins, sur ce qui te concerne en tant que contributeur individuel, ok.
**Robin** — Moi, j'ai plein de docs, d'organisation, d'une réunion, de management, etc., mais c'est vrai que mes collègues OBE, ils ont peut-être aussi besoin d'aller consulter sur d'autres choses. Même à la production, hein, des trucs tout cons, mais alors, moi, je n'ai pas d'outil de maintenance, mais du coup, je le fais.
**Robin** — En fait, tous les soirs, alors j'ai fait, j'ai commencé à faire un espèce de journal vocal, et tous les soirs, j'ai un bout de message Telegram, et du coup, j'envoie un Telegram, je réponds à Telegram, ça se fait sur GitHub, et je fais un push, non, un pull, du coup, un pull le lendemain matin, et j'ai une question qui dit : « Bah, qu'est-ce que tu as fait sur les machines ? » et des trucs comme ça, parce qu'en fait, j'étais ultra frustré, on est 6-7 en prod, et
**Robin** — on n'a pas vraiment de suivi des machines, et donc là, je dis : « Bah voilà, là, j'ai un problème sur cette machine-là, comme ça, si je veux interroger l'historique de ma machine, tac, l'IA essaie de le faire. » Plutôt que de monter un espèce de GMAO ou je ne sais pas quoi, là, que personne ne rentrera dedans, etc., je dis : « Bah là, mais c'est sur mon poste. » Mais déjà, ce n'est pas mal, parce qu'au moins, je l'archive, et dans mon journal vocal, eh ben, je me dis, parce
**Robin** — qu'il y a plein de trucs, on dit : « Putain, mais elle est tout le temps en panne, cette machine. » Attends, c'est quoi tout le temps ? Tu vois, même tes gars, et je me dis : « Putain, même le journaling vocal, même les gars, n'importe qui, en fait, dans une entreprise, devrait le faire presque. » Alors, ça va aussi avec le petit stand-up daily du matin, putain, en dev.
**Robin** — Ouais, ouais.
**Thomas** — Mais ce n'est pas pareil, il faut aussi ce journal vocal, s'il est juste mis sur un papier ou que tu l'as juste dicté dans un mail avec un clavier vocal, bah, ça ne sert à rien, enfin. Ouais, ouais, tu ne vas jamais le chercher. Non, et puis je pense qu'il y a, par rapport à ce que tu décris, ce qu'il faut mettre en plus, en place, c'est : ce n'est pas toi qui dois aller chercher l'info, parce qu'il y en a plein, enfin, les gens ne le feront
**Thomas** — pas forcément. Enfin, tu sais, pour voir si tu as déjà fait un truc et tout ça, il faut, je pense qu'il faut que naturellement, ou à partir du moment où tu es en train de travailler sur quelque chose, que l'IA, c'est là où l'IA est aussi aidante, c'est qu'elle aille vérifier par elle-même, sans forcément te le dire d'ailleurs, enfin, sans forcément que ce soit ton action, dire : « Tu es en train de travailler sur ça, tes références en interne, c'est ça, ça, ça, tu vois, on a
**Thomas** — déjà travaillé sur cette problématique ici, cette problématique-là, etc. » Même sans pas forcément attendre d'être bloqué, d'avoir une problématique ou un truc, juste dire, te le mettre en tête, quoi. Ouais.
**Robin** — Oui, oui, de dire : « Attends, oui, avant que tu sois complètement les deux pieds dans la merde, avant d'aller là-bas, attends, on a fait ça l'autre fois, et.
**Thomas** — Comportement à tel projet, tel projet, tel projet. Et après, l'autre truc, tu parlais des reviews, alors moi, c'est marrant, les reviews que je faisais en dev, en fait, on les faisait aux deux semaines, c'était à chaque sprint, et c'est plus tendu de la longueur, et il y a plein de boîtes comme ça qui les font très mal, parce qu'il n'y a pas d'action. Si tu ne prends pas d'action dans la review, elle ne sert à rien, en fait.
**Thomas** — Si c'est juste pour un bureau déployer où tout le monde va vider un peu son sac, et puis derrière, mais si tu ne le dis pas, par rapport à ce qui s'est dit, ok, ce qu'on en retire, c'est qu'il faut agir sur tel truc du management, qu'il faut agir sur tel logiciel, il nous manque ça, il faut faire ça, et que tu n'as pas quelqu'un qui a signé à la tâche, ça ne va pas bouger, et tu vas redire les mêmes choses toutes les deux semaines. Et
**Thomas** — c'est vrai que l'IA, là-dessus, elle peut vachement aider en termes d'analyse, enfin, tu, comment dire, en fait, ce n'est pas toujours très structuré ce que tu vas dire, mais derrière, l'IA, elle est capable de remettre de l'ordre et d'aller identifier les actions et les trucs, et aussi de ne pas te lâcher tant que tu n'as pas mis quelqu'un sur l'action, ou un gars qui a fait l'action.
**Robin** — Carrément.
**Thomas** — Donc ça, c'est intéressant. Carrément. Moi, je le vois, ouais, je le vois vraiment dans cette optique-là aussi, au-delà
**Robin** — de te faire un assistant personnel qui va te rappeler plein de trucs, d'avoir cet aspect cerveau, mais mémoire, et donc mémoire locale et mémoire d'entreprise pour arrêter de faire des conneries, et puis arrêter de perdre du temps sur des trucs quand tu intègres un alternant qui ne passe pas, qui ne met pas six mois à être bon, en fait, qui met tout de suite les bons process, les bons machins, les bons accueils, et plein de choses comme ça. Donc voilà, ça, c'est un peu ma réflexion, mais
**Robin** — là-dessus, moi, ce que je vais faire, c'est que j'en discute pas mal avec mon on a pris un gars à temps partagé qui fait l'informatique, donc il est plutôt lui sur la partie un peu serveur, etc., mais il est quand même bien intéressé par l'IA, et l'avantage, c'est qu'il voit plein d'autres boîtes, et donc il y a une autre boîte aussi, là, pas trop loin de Chambay, qui intègre, qui commence à essayer d'intégrer Claude, et qui a un bureau d'études, donc je me dis : « Ah bah,
**Robin** — ça, c'est chouette. » Donc là, j'ai essayé de contacter le patron de là-bas pour voir comment ils intègrent aussi, quelles problématiques ils vont avoir. Donc voilà, j'essaye aussi de creuser ça avec lui, qui a une vision plus, on va dire, voilà, s'il faut mettre un Docker sur notre NAS, il va le faire, il s'est dit : « Je vais installer le N8N. » Donc là-dessus, c'est cool, parce que moi, j'ai un peu les idées, je vais voir les choses, mais des fois, dans l'exécution, je dis : « Voilà, moi, je
**Robin** — ne sais pas faire ça. » Donc ça, c'est aussi intéressant d'avoir quelqu'un qui sache que si, à un moment, je veux installer un serveur qui tourne tout le temps, je ne suis pas bloqué, il va pouvoir me le faire. Ouais, puis il y a aussi la sécurité, enfin,
**Thomas** — toi, tu pourrais le faire, je pense, mais c'est toujours pareil, quoi, tu as de la sécurité, tu as tout un tas de sujets un peu cachés que tu ne vas pas voir si tu le fais ponctuellement, et si tu n'as pas les moyens. Oui, ou je vais faire le truc un peu crado, en mode patchwork, je vais aller prendre un VPS chez Hostinger, et puis je vais l'installer dessus, etc., et je vais succomber aux sirènes d'Hostinger que je vois sur YouTube tout le temps.
**Robin** — Ah bah, je pense qu'ils ont un bon taux de commission, je pense, sur l'application, et du coup, on en parle beaucoup, je pense qu'il y a.
**Thomas** — Donc voilà, ça va être ça aussi, c'est d'avoir quand même une cohérence,
**Robin** — et là-dessus, sans même parler d'histoires de DSI, de choses comme ça, nous, même à une vingtaine, avec beaucoup, enfin, on va dire 10 au bureau, même pas, c'est intéressant d'avoir quand même une cohérence, sinon tu as vite un patchwork d'outils, de : « Alors, ça, c'est sur Mac, non, ça, c'est sur N8N, non, mais ça, c'est sur machin. » Et les gens qui n'ont pas envie de ça, ils disent : « Non, mais en fait, moi, c'est censé me faire gagner du temps, ton histoire-là, là, je suis en perte,
**Robin** — je suis perdu dans tous les outils. » D'où l'intérêt d'avoir l'IA qui va via MCP aller chercher ci, aller chercher ça, etc. Donc il y a quand même des gros effets de sortir un peu de ce bazar, mais autant pas les mettre, enfin, autant réfléchir à des outils qui soient, on va dire, tous un petit peu là-dessus.
**Robin** — Donc voilà. Et après, moi, il faut que je creuse aussi, parce que j'ai un peu des contacts, là, avec Prism, donc le système d'Elliott Meunier, de voir comment ils gèrent ça, comment ils arrivent à le traiter.
**Robin** — Moi, je suis pas mal avec Outils du Manager, là, sur la partie management, qui m'a fait découvrir tout ce bazar, en finale, hein. C'est grâce à eux que je suis rentré là.
**Robin** — Et de quoi ? Je n'ai pas compris la dernière personne dont tu parlais.
**Thomas** — Outils du Manager.
**Robin** — Opsy ?
**Thomas** — Outils, Outils, comme un outil.
**Robin** — Ok. Qui fait un podcast, enfin, moi, je l'ai découvert par le podcast, sur le management, et je t'avoue que j'ai quand même pris un bon petit niveau en management grâce à ce podcast, et donc, à un moment, il faisait une... Après, il est aussi management, organisation personnelle, gestion du temps, etc., donc il gère un peu tout ça.
**Robin** — Et du coup, voilà, c'est grâce à eux que j'ai découvert Prism, moi, donc il faudrait que j'arrive à les interroger un petit peu sur comment ils gèrent aussi eux au sein de leur boutique, parce qu'ils sont quasiment tous en full remote, donc en full remote, tu n'as même pas un serveur, on va dire, où tu te connectes quand tu es au wifi, et ils ont quand même cet objectif-là, traiter les mails, etc.
**Robin** — Donc il faut que je voie, mais de ce que j'ai vu, moi, du système Prism, moi, je n'avais pas de gros gap avec le Vault, hein. Non, non, non, bah, en fait, il est parti du Vault et tout ça, c'est juste,
**Thomas** — en fait, c'est le même système, mais il l'a mis en mode... Enfin, j'ai vu, moi, j'ai regardé hier sa formation, j'ai regardé les différentes étapes et tout ça, et globalement, il parle de N8N. Pour le coup, il a un serveur, moi, je pense qu'il a un serveur Hostinger, et tous ses fichiers sont dessus, et derrière, il utilise des modèles open source via des chats.
**Thomas** — Enfin, non, je crois qu'ils ont une, je crois qu'il a créé une interface, mais une fois, j'avais vu un truc, c'est, enfin, il utilise un outil que tu peux installer sur ton ordi, un logiciel dans lequel tu peux gérer des modèles open source, et tout se fait via l'API, et ça va chercher ton serveur. Ah ouais, ouais.
**Thomas** — Mais par contre, il est sur du chinois, et du coup, ça ne coûte pas forcément moins. En fait, je réfléchissais à ça, moi, et je me disais, moi, je suis tellement dessus, qu'aujourd'hui, appeler des API, vraiment, j'ai peur que ça me coûte trop cher.
**Thomas** — Un entité en mode un assistant que tu vas solliciter deux, trois fois dans la journée, ou quatre fois dans la journée, et qui fait des petites, enfin, tu vois, ça dépend vraiment du volume que tu as, et là, effectivement, peut-être qu'en bidouillant bien, des trucs locaux, enfin, pardon, les LLM open source, ça peut te revenir aussi cher ou moins cher. Mais j'avoue que je n'ai pas la patience, moi, d'aller fine-tuner tout ça.
**Thomas** — Et aujourd'hui, je n'ai pas forcément, sur mon AIOS perso, la nécessité d'avoir de la portabilité, en fait. Ouais, ouais, ok.
**Thomas** — Je pense que tu vois les notes vocales quand tu fais tout ça, je pense que c'est un très bon truc pour lui envoyer des infos, et je pense que tu peux faire un peu la même chose, mettre les infos chaudes du moment, tu les mets sur un truc accessible de l'extérieur, et tu peux travailler dessus derrière.
**Robin** — Ah ouais, ouais, ouais. Bah, ouais, ouais, je pense qu'il y a une architecture, là, c'est un boulot d'architecte, hein, j'ai découvert ce métier, que ça existait aussi dans le dev. C'est vrai que c'est un job d'architecte sur, ouais, de voir un peu les outils.
**Robin** — Nous, on est sur les usages, on est sur notre quotidien, mais mine de rien, il y a quand même un peu des éléments à tourner, enfin, à mettre pour que ça tourne, quoi, des outils, des choses comme ça, qui sont hébergées quelque part, parce que le cloud, ce n'est pas nulle part. Donc ça, c'est à creuser, mais voilà, moi, je vais essayer de creuser ça aussi.
**Robin** — Je pense que s'il y a deux, trois personnes, là, dans le school, qui sont bien chauds de la partie plutôt hardware et compagnie, ça peut être intéressant de leur apporter nos besoins et les problématiques qu'on rencontre pour pousser des usages. Et encore une fois, à mon sens, tout le monde a des gens derrière un ordinateur qui ont fait des conneries une fois et qu'on ne voudrait pas refaire deux fois.
**Robin** — Tout le monde a, au-delà d'un bureau d'études, en fait, les comptables, les comptables, c'est encore pire, parce que d'une année à l'autre, il y a des trucs que tu fais qu'une fois par an, mais il ne faut pas que tu fasses la même connerie tous les ans, ou pas que tu galères à refaire. Tu recherches pendant deux heures pour faire un truc idiot.
**Robin** — Ouais, c'est ça. Attends, j'ai fait comment il y a un an.
**Robin** — C'est quand même con, hein, si tu avais un peu journalé, journalisé, pardon, ta tâche il y a un an, tu retrouverais tac comment tu as fait et comment tu as. Je dis, il y a tout un réflexe là.
**Robin** — J'ai vu un truc flippant, je ne sais pas si tu as déjà vu cette espèce de masque, là, où tu causes dedans, mais c'est pour causer à ton IA dans l'open space, mais sans que les autres t'entendent.
**Thomas** — C'est vrai ? C'est marrant, parce que moi, c'est vraiment, là, je retourne au, je redécouvre le travail en présentiel, mais je suis tellement parvenu à un truc où je parle toute la journée à l'IA, que ça me gonfle, enfin, j'ai l'impression d'être handicapé, en fait. Et en plus, ici, à la maison, j'ai un clavier à Mac que j'avais en France et tout ça, c'est un Azerty, et là, je passe sur du QWERTY au boulot.
**Thomas** — Au moment où je dois taper, j'ai mes touches qui ne sont pas au même endroit, et d'habitude, ce sont des choses, tu sais, j'ai envie de lui dire plein de trucs à l'IA, et je dois le taper, et je dis : « Putain ! » Du coup, je squatte tout le temps les salles de réunion, en fait.
**Thomas** — Enfin, au bout d'un moment, je me lève, je suis dans une salle de réunion, puis je parle comme ça. J'ai déjà réclamé un bureau fermé, mais je ne suis pas sûr de m'en souvenir.
**Thomas** — C'est un sténomasque.
**Robin** — Ouais, ouais, un sténomasque, ok.
**Thomas** — Sténomasque.
**Robin** — Mais je ne suis pas sûr.
**Thomas** — Ah, il faut être prêt, hein.
**Robin** — Ouais, non, non, non, ça fait un peu torture, ton truc, là.
**Thomas** — Oui, oui, oui, ça fait un peu alien.
**Robin** — Ouais, Covid 4.0, quoi, enfin, le sténomasque que tu as mis, ouais.
**Thomas** — Un sténomasque, ouais, c'est ça. Dictée vocale en milieu bruyant. Mais en plus, je suis sûr que tu embêtes quand même les autres derrière.
**Thomas** — Et moi, ouais, en plus, je suis juste à côté du support, et du coup, les mecs, ils discutent. Pour le coup, ils discutent toute la journée, et à voix haute, et tout ça, et.
**Thomas** — Ah bah oui, oui.
**Robin** — Les joies du présentiel, quand tu as fait.
**Thomas** — Ouais, ouais, qui, c'est vrai que même moi, quand je veux faire un peu une grosse session d'IA,
**Robin** — je me fous dans une salle de réunion, parce qu'on a un open space, et comme ça, je peux parler, en fait. Tu vois, je suis trop frustré là de taper sur mon ordinateur. Oui, oui, oui, c'est vrai qu'une fois que tu l'as fait, j'ai regardé, depuis trois, quatre mois, j'ai écrit trois bouquins, l'équivalent de trois bouquins en parlant.
**Thomas** — Ah ouais ? Ouais. Je crois que je suis dans le top 1 % des utilisateurs de Whisper Flow.
**Thomas** — Ah oui, ok.
**Robin** — Donc tu, ouais, et.
**Thomas** — Ah, petite astuce aussi. Alors, toi, tu utilises Whisper Flow, mais petite astuce qui pourrait être intéressante. Je trouvais que Claude, avec le clavier vocal, là.
**Robin** — Était bien.
**Thomas** — Non, était nul.
**Robin** — Oui. Au début, je lui disais : « Mais putain, il est trop nul, il fait des conneries qui sont assez dingos. » Et en fait, dans, alors, ce n'est pas le Claude.md, c'est le /claude qui doit être dans ton hébergé, enfin, dans tes dossiers, tu vois, un peu, pas dans ton Vault.
**Robin** — Ouais. Eh ben, il faut que tu lui dises que tu es français.
**Robin** — Et en fait, depuis que j'ai fait ça, eh ben, la dictée vocale dans l'interface, donc je suis sur VS Code, hein, eh ben, en fait, elle ne se pose plus la question de savoir si je suis en train de lui causer en anglais ou en français, elle sait tout de suite que je cause en français, donc mes démarrages de phrase sont tout de suite bons. Et j'ai vachement moins d'erreurs depuis que j'ai fait ce changement-là.
**Robin** — Ah, c'est bien. Donc, parce que je trouvais, j'étais là, je me disais : « Mais ce n'est pas possible, il est nul, ce truc. » Moi, j'utilise le clavier vocal Google sur le téléphone, je dis : « Mais ça, ça marche super bien. » Là, pourquoi dans VS Code, c'est nul ?
**Robin** — Et je lui ai demandé, donc j'ai demandé à Claude, et il m'a dit : « Bah, en fait, il faut que tu indiques dans le JSON, je crois que c'est dans le JSON de base, qui est dans utilisateur, je ne sais pas quoi, là, en fonction de là où tu l'as installé, eh ben, il faut que tu lui mettes français. » Et ça va performer beaucoup plus.
**Robin** — Ouais. Bah, j'ai joué tester d'autres trucs que Whisper Flow, juste comme ça.
**Thomas** — Et là, ils ont sorti, là, je l'ai activé, là, par exemple, ils ont sorti un truc de réunion, une prise de notes de réunion. Et là où ils sont très forts, c'est que, alors, tu n'as pas la vidéo, tout ça, parce que c'est un peu sorti du pro, de tes réunions, enfin, ça ne vient pas filmé et tout ça. Par contre, il est capable, par rapport à la discussion qu'on a, je sais qu'il va mettre que tu t'appelles Robin, et il va identifier à chaque fois que
**Thomas** — c'est toi qui as parlé. Ah ouais. Et donc, même quand tu es en présentiel dans une salle, et que tu as cinq, six personnes, il est capable, alors, ce n'est pas du garanti à 100 %, mais déjà, il fait très bien la distinction des voix.
**Thomas** — Ok. Et en fonction du contexte et de ce que tu dis, et si tu t'adresses à la personne.
**Thomas** — Moi, j'ai fait ça au boulot, il y a une personne, on n'a jamais dit son nom, donc il a dit, enfin, il a dit « utilisateur inconnu », mais à chaque fois, c'était bien lui qui était, tu vois, qui était identifié. Mais il comprend le sens de la, enfin, suffisamment la discussion pour dire : « Ok, lui, c'est Robin, lui, c'est Thomas, lui, c'est machin, etc. » Et pour du présentiel, c'est bien.
**Thomas** — Quand tu es cinq, six dans la pièce et que tu es sur la même pieuvre, ce n'est pas évident. Oui, bah oui, oui.
**Thomas** — Sinon, effectivement, j'avais, pareil, j'ai écouté
**Robin** — un podcast sur la réunionlogie, un gars qui a inventé son terme, là, et il disait ça, ouais, les outils, pour l'instant, ne sont pas très bons. Une réunion en présentiel, elle est beaucoup plus vivante et beaucoup plus active. Par contre, le compte-rendu sera beaucoup plus dur à choper à l'IA.
**Robin** — Par contre, une réunion en distanciel, bah, à l'IA, c'est top, le compte-rendu est vachement plus simple, hein, Zoom et compagnie le font très bien. Mais par contre, c'est moins efficace comme réunion.
**Robin** — Donc tu dis, bah, comment j'arrive à faire un compte-rendu de réunion de quelque chose en physique ? Et c'est vrai que nous, en plus, on a quasiment toutes nos réunions en physique, réunion de bureau d'études, etc., on acte plein de choses, et c'est vrai que des fois, tu dis, bon, bah, ouais, on a discuté pendant une heure, qu'est-ce qu'on a acté à la fin ?
**Robin** — Je ne suis pas sûr que ce soit bien fait. Donc ouais, même des réunions de commerce, des réunions de plein de choses.
**Robin** — Alors, après, il ne faut peut-être pas tomber non plus dans le tout enregistré. Oui, oui, oui, c'est ça.
**Robin** — Mais au moins de sortir les tâches rapidement, et de sortir les qui fait quoi, et qu'est-ce qu'on a à faire. Pas d'enregistrer une heure de réunion, ça ne sert à rien, mais d'enregistrer un peu les grandes actions, un peu les prises de décisions que tu as dites.
**Robin** — Je pense qu'il y a aussi des progrès à faire là-dessus, puis des, au-delà de gains de temps de faire un compte-rendu et de le lire, mais de gains d'efficacité et de mise en action sur cette partie de prise de notes de réunion. Donc nous, voilà, ça aussi, c'est un sujet.
**Thomas** — Moi, le workflow que j'ai en tête, c'est vraiment de dire, peut-être on t'a le compte-rendu avec des actions, des actions à titrer, et une fois que tu valides, ça crée directement dans ton Outlook, dans ton machin, enfin, dans ton gestionnaire de tâches, les tâches. Dans ton Vault. Ou dans ton Vault, si tu gères tes tâches dans ton Vault.
**Thomas** — Et comme ça, la fois d'après, avant même la réunion, tu sais déjà tout ce qui a été fait, finalement. Enfin, tu sais déjà ce qui est mis à jour, en tout cas.
**Thomas** — Alors, ce n'est pas dire que ce qui n'est pas mis à jour n'est pas fait, mais justement, tu sais sur quoi te concentrer, et je pense que tu gagnes cinq, dix minutes sur ta réunion d'après, quoi. Ouais, carrément.
**Thomas** — Et puis ça booste aussi, je pense que ça peut, il y a certaines petites tâches un peu chiantes, là, tu as été un peu obligé de les faire, parce que tu es traqué. Ok, bah écoute, c'était sympa.
**Thomas** — Bon, c'est du tête-à-tête, hein, pour le moment, mais. Ouais, bah écoute, moi, je l'ai noté dans l'agenda, alors je ne suis pas sûr d'arriver à faire
**Robin** — toutes les fois, mais après, je prends le .md, je le jette dans Claude, et puis je lui dis : « Alors, qu'est-ce qui s'est dit d'intéressant ? » Et puis ça permet d'avancer aussi, mais voilà, je l'ai mis dans l'agenda, comme ça, au moins, ce sera un peu plus simple d'être présent. Et puis si je vois que tu as, j'ai cru comprendre, tu avais plein de profils, là, avec des compétences très diverses, je pense que ça peut être vraiment sympa d'avancer dans ce truc-là, parce qu'au final, on est
**Robin** — en train quand même de, ça n'existe pas, ce qu'on cherche, donc.
**Thomas** — Non. J'ai vu un truc, il y a un mec qui m'a présenté un, ouais, je ne sais pas si tu as entendu parler du harnais SEDANCE, qui est sorti, SEDANCE, qui est sorti cette semaine, où apparemment, c'est vraiment très bien foutu pour organiser tout ça. Enfin, c'est un peu ce qu'on fait là, et justement, ça pourrait être une réponse derrière à l'iOS d'entreprise.
**Thomas** — Pour l'instant, c'est embêté, le harnais, je mettrai un lien dans la communauté, peut-être. Par contre, pour l'instant, ça ne sert à rien de l'installer, parce qu'ils travaillent encore dessus, et ils ont dit qu'il y aurait des changements majeurs dans les mises à jour, etc.
**Thomas** — Enfin, des breaking changes. Donc ça veut dire que ta version, elle n'est plus du tout compatible.
**Thomas** — Mais ça a l'air vraiment prometteur, j'ai regardé une vidéo, là, et j'ai un autre mec à Montréal, là, qui m'a présenté un truc qui ressemble à ça.
**Thomas** — Alors, c'est un mec qui est très Técos, mais globalement, c'est entre les iOS et la gestion de tes agents locaux, etc.
**Thomas** — Enfin, mais vraiment des agents indépendants et tout ça, et ta gestion des accès, gestion de la sécurité, tout ça. J'ai trouvé ça intéressant, très tech.
**Thomas** — Et pourtant, je bosse avec des techs depuis 20 ans, donc j'ai l'habitude de parler technique et tout ça, mais c'est peut-être un peu leur problème. D'ailleurs, enfin, je lui ai dit qu'il fallait qu'il arrive à vulgariser un peu son truc, mais, et j'ai dans ma to-do list, je dois le tester.
**Thomas** — Mais voilà, ça peut être une piste aussi à terme. On n'est pas à l'abri à un moment que je vous dise : « Arrêtez tout, mettez ça à la place. » Bah ouais, mais c'est comme ça.
**Thomas** — Ouais, ouais. Non, non, puis ce n'est jamais perdu, et je pense qu'au contraire, ça alimente aussi des réflexions qui vont au-delà de l'IA, et c'est plus justement dans les process et dans comment le, enfin, au final, à partir du moment où tu réfléchis comment mettre l'IA dans tes process, l'outil, tu t'en fous un petit peu au final, et c'est plus ce réflexe-là qui est intéressant.
**Thomas** — Et c'est comme ça que tu vas progresser, enfin, l'outil va changer dans tous les cas, quoi. Vu à la vitesse où ça va, ça va changer.
**Thomas** — Ok. D'accord.
**Robin** — Bon, bah écoute, bon week-end, du coup, toi tu es quand ?
**Thomas** — Ouais.
**Robin** — Enfin, vendredi après-midi, mais. Et puis, à bientôt.
**Thomas** — Ouais, merci, salut.
**Robin** — Bye.
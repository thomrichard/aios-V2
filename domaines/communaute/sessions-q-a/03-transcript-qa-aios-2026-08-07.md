---
type: support
resume: Transcript : pièce jointe de la leçon « Replay du 07/08 »
statut: publie
domaine: communaute
cree: 2026-09-01
maj: 2026-10-24
liens: [03-replay-du-07-08.md]
---
---
type: transcript
source: Session Q&A Club SMART — visio, captée par Wispr Flow (Meeting Recorder)
date: 2026-08-07
heure: 08h32 → 09h32 (heure de Montréal) — 14h32 → 15h32 à Paris
duree: 1h00
wispr_meeting_id: f72b5cd6-154b-454e-a803-f957ff66a0b3
statut: brouillon
participants: [Thomas Richard, Sylvain Mercier, Igor]
---

# Transcript — Q&A AIOS du Club SMART (2026-08-07)

> Transcription automatique **Wispr Flow** de la session visio, rapatriée le 2026-09-01. Première session du Club SMART à trois.
>
> **Attribution corrigée à la main.** La diarisation de Wispr avait attribué **tout le tour de table d'ouverture de Sylvain à Igor** — le passage sur la retraite, le LAN, les trente machines virtuelles et PostgreSQL/pgvector est de **Sylvain**, pas d'Igor. Les étiquettes ont été rétablies d'après le contenu (le profil hardware et souveraineté des données est celui de Sylvain, le profil Japon et Montessori celui d'Igor). Deux répliques isolées ont été rendues à leur auteur de la même façon : le départ pour un appel téléphonique et le retour qui suit sont de Sylvain. Les salutations des trente premières secondes restent mêlées et sont marquées comme telles.
>
> **Aucun nettoyage de forme.** Hésitations, redites et coupures de tour sont conservées. Déformations connues, à lire au sens : « les AIOS » = **l'AIOS** · « Gemac 4 » = **Gemma 3** (modèle local de Google, à vérifier) · « la carte Artanpion » = nom de carte graphique déformé · « il est meetless » = **c'est Limitless** · « merci du clio » = « merci du tuyau » · « Ivan » = interjection parasite · « Chappy » = surnom japonais de ChatGPT · « le cloud » = **Claude** · « Claude MD » = **CLAUDE.md** · « OBE / TP » = travaux publics.
>
> **Hors sujet retiré du fil.** Trois passages sans rapport avec le Club SMART ont été sortis du corps et regroupés en annexe, à la fin : la mise en route de l'enregistrement, la digression sur la naissance de Tanguy, et l'anecdote personnelle d'Igor sur sa femme. Rien n'est supprimé — l'archive reste entière, elle est seulement rangée hors du fil de la discussion.

## Les 3 personnes

**Thomas Richard — animateur (toi).** 47 ans, Montréal, 20 ans d'e-commerce à Lille (Auchan, Leroy Merlin) puis un passage par la Nouvelle-Calédonie et le no-code. Depuis deux mois, responsable des agents IA dans une entreprise de construction de 150 personnes, positionnée en maîtrise d'œuvre. Expose son sujet du moment : accéder à sa connaissance depuis n'importe où, ce qui le fait sortir de sa doctrine du fichier à plat.

**Sylvain Mercier — membre.** Retraité de l'informatique, ex-ingénieur en travaux publics passé au management chez des constructeurs américains — dont un poste de patron du service formation France de DEC. Chez lui, un LAN d'une trentaine de machines virtuelles. Sa préoccupation est la souveraineté de ses données : tout garder en local, viser à terme un LLM local interrogeant une base vectorielle. Utilise le Vault de l'AIOS pour remettre d'aplomb des années de fichiers Word contradictoires, et n'a encore besoin ni d'Obsidian ni de Graphify.

**Igor — membre.** Vit au Japon depuis 2014, ancien professeur de l'Éducation nationale, background Montessori qu'il étend à tous les âges de la vie. Neuf mois de journal quotidien avec ChatGPT, copié-collé à la main dans des fichiers Markdown — « une mine d'or » devenue ingérable, c'est ce qui l'a amené à l'AIOS. Prépare un **IP3CRA** (Inbox, Project, Cortex, Casquettes, Ressources, Archives) sous Obsidian + Graphify + Claude Code dans VS Code. Contrainte réelle : il travaille avec des enfants, parfois en situation de handicap, et la loi japonaise sur les données confidentielles l'oblige à viser une IA locale.

---

## Le transcript

### Ouverture et tour de table

> Les salutations qui suivent sont mêlées par la diarisation — les trois personnes se saluent en même temps et Wispr attribue au hasard. Le sens est clair : c'est la première fois que les trois se voient.

**?** — Bonjour. / Bonjour, enchanté Igor. / Enchanté Thomas. / Bonjour messieurs, vous m'entendez ? / Oui. Bonjour Sylvain, enchanté. / Salut Thomas, et salut Igor. / Salut Sylvain, enchanté.

**Thomas** — Enchanté. C'est cool, c'est la première fois qu'on se voit.

**Igor** — Absolument.

**Thomas** — C'est bien, ça commence à prendre. D'habitude, il y a deux... enfin, souvent il y a deux autres personnes qui viennent régulièrement, mais c'est parfait si ça augmente, tout ça. Du coup, je suis désolé, c'est un peu les premiers, ça peut être un peu décousu, mais l'idée c'était aussi de... déjà de se rencontrer en réel, et puis après de voir un peu...

**Thomas** — Oui, l'idée c'est donc d'échanger, de se connaître, et puis aussi de voir si vous avez des questions, partager les choses sur lesquelles on est en train de travailler chacun de notre côté actuellement, sur l'IA, tout ça. Et puis échanger sur tout ça, quoi.

**Igor** — D'accord.

**Thomas** — Donc on peut peut-être se faire un petit tour de table rapidement, pour se dire ce qu'on fait un peu dans la vie, comment on utilise l'IA, tout ça, et puis après on démarre.

**Thomas** — Écoutez, on va faire un petit tour de table. Qui veut commencer ?

**Sylvain** — En silencieux, j'y vais.

**Thomas** — Allez, go.

**Sylvain** — Ben, je vais présenter un petit peu déjà par mail. Donc, j'ai la chance d'être retraité. Tenez bon, les gars, c'est un bon job.

**Sylvain** — Je suis retraité de l'informatique, mais je n'ai jamais été un techno sans l'informatique. Je suis passionné par l'informatique, mais j'ai un passé d'ingénieur en TP, et quand j'ai rejoint l'informatique, je m'attendais naïvement à faire du développement.

**Sylvain** — Puis en réalité, j'ai été aspiré par le management, par la gestion de projet, de fric, de gens, etc. Donc je n'ai pas fait beaucoup de technique, donc je suis loin d'être un développeur fou.

**Sylvain** — J'ai travaillé chez des constructeurs américains, ce qui fait que j'ai pas mal d'expérience en matière de couches basses, mais j'ai beaucoup moins d'expérience en matière de couches hautes, de développement logiciel, etc. Ce n'est pas trop ma tasse de thé, mais je vois que par rapport aux gens qu'il y a dans le groupe, ça peut peut-être se compléter un peu.

**Sylvain** — Ce que je peux peut-être apporter au groupe, c'est justement ces aspects couches basses. C'est-à-dire que chez moi, j'ai un LAN qui est assez développé par rapport à la plupart des gens, à savoir que j'ai un serveur qui est un vieux serveur, il ne m'a pas coûté cher, mais c'est quand même assez puissant pour me porter une bonne trentaine de VM sans trop de soucis.

**Sylvain** — Si j'arrive à lui mettre une RTX 70 dedans, je serais même capable de faire de l'IA pas trop trop bête.

**Thomas** — D'accord.

**Sylvain** — Mais je n'ai pas encore fait l'essai, j'ai des vieux problèmes d'alimentation, de ventilation, de choses comme ça, donc ça se heurte au concret très pur et dur. Mais ça peut apporter des gens. Donc ce qui veut dire que moi, mon projet, je suis très content d'avoir trouvé ton idée sur les AIOS.

**Sylvain** — J'ai trouvé ça vraiment très, très bien, parce que moi je tournais un peu en rond, d'autant plus que j'utilisais ChatGPT, et ChatGPT, même en abonnement pro, s'essoufflait très vite dès qu'il s'agit de manipuler des dossiers assez gros, ou des répertoires assez gros, ou même des fichiers assez gros, il se mélangeait les pinceaux, ça ne marchait pas très bien. Donc ce que tu m'as apporté m'aide vraiment, m'aide vraiment beaucoup.

**Thomas** — Cool.

**Sylvain** — Ce sur quoi je travaille, qui doit faire une différence par rapport aux autres, je suppose, c'est le fait que j'essaie de synchroniser à la fois une approche avec ton AIOS, à la fois une approche de rangement dans un répertoire de tous les fichiers qui m'amènent de la connaissance ou des prises de décision, ce genre de choses.

**Thomas** — OK.

**Sylvain** — Et puis vraiment un répertoire pur et dur Linux avec des fichiers qui sont dans ce répertoire, mais qui sont des fichiers plats sans aucun problème, mais avec des règles de nommage ou de définition de métadonnées un petit peu plus chiadées que la moyenne des choses.

**Thomas** — Mm-hmm.

**Sylvain** — Bien sûr, synchroniser avec ce qu'il y a dans les AIOS. Et enfin, ayant cet arbre, et ce que fait AIOS, j'essaie de le synchroniser avec PostgreSQL, et en particulier avec l'extension pgvector de PostgreSQL, qui permet de faire du vectoriel sur PostgreSQL. C'est-à-dire qu'on se retrouve avec une base de données qui est capable de faire du RAG si tout va bien.

**Sylvain** — Je dis ça, c'est ce que j'ai lu sur le papier, je suis en plein développement de ce truc-là, et bien sûr le diable est toujours dans le détail.

**Thomas** — Oui, oui, oui.

**Sylvain** — Voilà ce que je...

**Thomas** — C'est marrant.

**Sylvain** — Voilà ce que je fais.

**Thomas** — Bon, ben super. Super, ça m'intéresse. Oui, je n'ai jamais trop testé le local, finalement, moi, en LLM.

**Thomas** — Je sais qu'il y a... j'avais vu un truc intéressant, mais... enfin, on pourra en parler après, on va laisser Igor se présenter aussi, et puis moi. Mais c'était celui de Google, là, Gemac 4, ou un truc comme ça, qui a l'air de s'adapter à la puissance de la machine, et du coup qui peut être... enfin, qui ne nécessite pas forcément une configuration minimum.

**Thomas** — Mais je n'ai pas testé.

**Sylvain** — Je m'attends à ce que dans le futur, on aille quand même pas mal dans cette direction-là.

**Thomas** — Tout à fait.

**Sylvain** — D'abord par la puissance des données locales, de par la puissance des processeurs et des GPU, et par le fait... je vous ai mis un petit post là-dessus, sur le fait que pour nous, il y a une petite opportunité business, ou bête, c'est qu'on se retrouve avec des portables de gaming qui peuvent être absolument des bêtes de guerre en termes de puissance de GPU.

**Thomas** — Mm-hmm.

**Sylvain** — Et la mode étant auprès des gamers de changer ces bécanes très, très fréquemment, parce qu'il vient de sortir la carte Artanpion qui fait un peu plus de FPS que les autres, etc., et tu te retrouves avec des bécanes qui sont en vente sur le Bon Coin ou ailleurs.

**Thomas** — Oui, qui sont.

**Sylvain** — Qui sont très puissantes pour faire de l'IA, et qui coûtent pas cher. Donc je m'attends à ce que ça évolue pas mal vers le local. Mais par contre, je serais très content de vraiment pouvoir tester dans la réalité ce que me donne la même requête faite en local ou faite par les AIOS, on va dire.

**Thomas** — Oui, oui. Mais oui.

**Thomas** — Igor, tu ne t'es pas encore présenté. Est-ce que tu peux nous raconter un petit peu ce que tu fais ? Tu es au Japon, c'est ça ? Ah, on ne t'entend pas. Tu as dû couper le son. Oui, tu es en mute.

**Igor** — Est-ce que vous m'entendez ?

**Thomas** — Oui.

**Igor** — Oui. Ok, merci. Donc oui, je vis au Japon depuis 2014, et j'envisage d'y finir ma vie.

**Thomas** — D'accord.

**Igor** — J'étais précédemment professeur à l'Éducation nationale.

**Igor** — Je n'y travaille plus, mais j'ai un background de papa Montessori, je ne sais pas si vous connaissez un peu l'approche Montessori. Et je développe ça pour tous les âges de la vie, y compris les personnes avec des troubles cognitifs en fin de vie, et je m'intéresse aussi aux adultes, toute la partie entre l'adolescence, le début de l'âge adulte, et toute la partie qui n'a pas été couverte par Maria Montessori, qui concerne l'âge adulte.

**Thomas** — Ok.

**Igor** — Je pourrais en parler pendant des heures, mais ce n'est pas le sujet de ce soir.

**Igor** — Je ne sais pas si vous avez vu le film Limitless.

**Thomas** — Oui.

**Igor** — Où quelqu'un découvre une drogue.

**Thomas** — Carrément.

**Igor** — Qui n'a pas d'effets secondaires, en tous les cas qui n'a pas l'air d'en avoir, et qui débloque tout ton cerveau. Et en fait, depuis que j'ai découvert ChatGPT, j'ai l'impression d'être dans Limitless, parce que c'est un.

**Thomas** — C'est quand même mortel. L'effet secondaire, c'est que c'est mortel dans le film.

**Igor** — Non, parce qu'à la fin.

**Thomas** — Oui, mais il arrive à trouver une solution. On est d'accord.

**Igor** — Et comment dirais-je ? Eh bien justement, j'aimerais bien qu'on discute de la solution ce soir.

**Thomas** — D'accord.

**Igor** — Et juste, comment dirais-je, pour faire le lien avec... en fait, j'ai commencé il y a 9 mois à travailler avec ChatGPT, sous la forme d'un journal quotidien de pensées, de réflexions, de bouillonnements cérébraux, etc., et avec la particularité que je copiais-collais tous mes échanges avec ChatGPT dans des documents Markdown.

**Thomas** — Ok.

**Igor** — Alors, c'est ultra fastidieux, c'est ultra long, mais au bout de 9 mois, j'ai une mine d'or, et à force de faire des copier-coller et d'aller d'une fenêtre à l'autre, je me suis dit : « Mais il y a forcément une solution. » Et c'est là que je suis tombé sur ta vidéo, enfin sur une de tes vidéos, notamment d'un masterclass IA, AIOS, et donc, ça y est, c'est parti. Et voilà pour mon introduction, et si vous voulez qu'on enchaîne directement sur les difficultés que je rencontre, ou si tu veux, Thomas, toi.

**Thomas** — Oui, bon, moi je.

**Igor** — Nous dire où tu en es de tes objectifs, parce que dans ta vidéo sur YouTube avec les 4000 heures, tu disais que tu t'étais fixé cet objectif, et que voilà, une fois qu'un rêve devient réalité. Qu'est-ce que tu fais ? C'est quoi ton rêve d'après ?

**Thomas** — C'est quoi le rêve d'après ? Oui, c'est un gros.

**Igor** — Oui, je te pose la question.

**Thomas** — C'est un gros sujet, et c'est marrant, c'est un peu comme ça fait résonner d'autres trucs, mais... Ben écoute, alors moi, je vais rapidement, très vite, moi j'ai donc 47 ans, donc ça fait un moment que je travaille maintenant, presque 30 ans.

**Igor** — Excuse-moi, Thomas.

**Thomas** — Oui ?

**Igor** — Excuse-moi, Thomas. Je suis nul en informatique.

**Thomas** — Ok. Ben, c'est bien, je pense qu'on a les trois profils.

**Thomas** — Mais pour moi, l'IA, le principal, enfin l'IA et globalement les technologies récentes permettent justement de niveler un peu, enfin en fait de baisser la marche. Attention, tu ne seras jamais aussi bon qu'un développeur qui travaille avec l'IA, mais ça permet déjà de faire ça ouvre beaucoup de portes, en fait.

**Thomas** — Et justement, c'est un peu ce qui s'est passé dans mon parcours. Moi, je viens de Lille, là j'habite à Montréal actuellement, et j'ai fait un petit tour par la Nouvelle-Calédonie à un moment, mais j'ai passé 20 ans à Lille, enfin 20 ans ou plus, mais en termes de professionnel, j'ai passé une vingtaine d'années à Lille, et Lille, c'est énormément la grande distribution, enfin c'est Auchan, etc.

**Thomas** — Et en fait, j'ai fait 20 ans de e-commerce. Donc j'étais dans ces boîtes-là, et moi j'ai fait une école de commerce, mais derrière, j'ai travaillé sur le développement des plateformes d'e-commerce de toutes ces boîtes-là, donc Auchan, Leroy Merlin, qui habite enfin, j'ai quasiment fait tout ce que tu vois sur un centre commercial, voilà.

**Thomas** — Et donc toujours travailler avec des développeurs. Mais mon métier, c'était : je vais voir le client, je prends son besoin, je trouve une, enfin j'explore les solutions possibles, et derrière, je m'adresse au développeur pour faire les développements.

**Thomas** — Et récemment, il y a eu, enfin ça fait 5-6 ans que je suis parti en Nouvelle-Calédonie, il n'y avait pas du tout ces boîtes-là, donc je ne trouvais pas de travail qui m'intéressait. Et par contre, j'ai vu qu'il y avait tout ce qui était low code, no code, qui pour moi est une bonne première étape avec l'IA.

**Thomas** — Et c'est un peu ce que tu as vécu, toi, Igor, l'effet un peu limitless, où j'ai toujours plein d'idées en tête de trucs de business, de choses à faire, des choses comme ça, sauf qu'il fallait demander à des développeurs jusque-là. Et là, aujourd'hui, avec ces outils-là, enfin avec ces outils-là déjà à l'époque, j'arrivais à faire des choses solides, correctes, etc.

**Thomas** — J'en ai fait mon métier là-bas, et après j'ai évolué petit à petit avec l'IA qui est arrivée. Donc là, en revenant à Montréal, je suis reparti un peu dans l'e-commerce, parce que c'était beaucoup plus facile de trouver du job.

**Thomas** — Et là, depuis 2 mois, là, enfin donc j'ai lancé la chaîne, comme je l'expliquais, surtout pour apprendre, pour processer, pour moi, quand tu apprends quelque chose, enfin, enseigner ce que tu viens d'apprendre, c'est la meilleure façon de le retenir. Et ça m'a permis de décrocher un job, là, récemment, de responsable des agents IA, dans une boîte qui fait de la construction, très haut niveau.

**Thomas** — Enfin, il n'y a pas de, comment dire, ils sont plutôt dans la MOE, donc l'orchestration des différentes équipes, etc., des gros chantiers, que dans la réalisation elle-même, mais globalement, c'est ça, c'est une petite boîte de 150 personnes. Et mon job, ça aide de niveler le niveau d'utilisation de l'IA, mais également de développer des outils transverses pour que chacun puisse être plus efficace dans le job.

**Thomas** — Et donc j'ai lancé le Club SMART, ça fait un petit moment maintenant. Alors, j'ai pris plusieurs directions, je ne savais pas trop où aller, sur quoi partir, et puis finalement, ça y est, on part sur les AIOS, et je pense qu'effectivement, c'est un bon moyen de... en fait, dans tout ce que vous venez de me raconter, dans moi, ce que je fais, je trouve qu'il y a un pattern qui est assez répétitif, c'est finalement l'organisation de la connaissance et du savoir, comment bien le stocker pour pouvoir le restituer facilement, en fait.

**Thomas** — On en a tous parlé, enfin vous en avez parlé tous les deux, et moi je... moi voilà, je sais que c'est l'un de mes gros sujets, et c'est comment tu vas chercher des infos, comment tu les absorbes, et comment tu, enfin, tu les absorbes de la bonne façon, et surtout comment tu les rends requêtables facilement, donc avec du RAG, avec des index, avec ce que tu veux, mais je suis aussi là-dessus. Et moi, il y a une limite là aujourd'hui que je trouve dans les AIOS, que j'ai envie de briser un peu, c'est comment tu accèdes à cette connaissance de partout. Parce que l'AIOS, finalement, il est... c'est bien quand tu es sur ton ordinateur, si tu stockes la connaissance dessus, mais derrière, si tu veux y accéder... moi là, en fait, je fais de la veille, donc je récupère des infos sur l'IA, des façons de travailler, etc., j'ai envie d'y accéder depuis mon job, et j'ai dû faire des passerelles pour... enfin, je suis en train de créer le truc qui va permettre d'y accéder tout le temps. Et là, on arrive un peu sur des RAG dont parlait Sylvain, donc de mettre tout ça sur un serveur.

**Thomas** — Du coup, je sors un petit peu de ma doctrine qui était de dire : « J'ai mon fichier à plat, et puis l'IA, il va directement dessus », ce qui permet d'éviter les appels à des serveurs, etc., mais à partir du moment où tu veux y accéder de l'extérieur, tu es un petit peu obligé. Donc voilà, un petit peu mes... enfin voilà, mon parcours, mes sujets du moment, et puis c'est hyper intéressant.

**Thomas** — C'est marrant d'avoir des profils différents, pas du tout techniques, plutôt, j'ai l'impression, plutôt littéraires, etc., enfin dans le... je parle dans le mindset, hein, quelqu'un de très technique, très branché, tout ça, puis moi un peu entre les deux.

**Sylvain** — Vous pouvez m'excuser, j'ai un appel, je vous reprends tout à l'heure.

---

### Igor — l'IP3CRA, Obsidian, Graphify et Claude Code

**Thomas** — Pas de souci. Ben écoute, on va commencer avec Igor. Donc Igor, est-ce que tu as des questions, des interrogations, des sujets en ce moment qui te...

**Igor** — Oui, mais c'est un peu du lourd.

**Thomas** — Ben écoute, si on peut trouver quelques portes, c'est déjà pas mal.

**Igor** — Je... enfin, j'y vais, hein.

**Thomas** — Vas-y, vas-y, profite.

**Igor** — Ok. Je suis en face de difficultés techniques, comment dirais-je, qui ne sont pas insurmontables, parce que justement, en discutant avec Claude.

**Thomas** — Ah, il arrive à trouver.

**Igor** — Avec Claude, de Claude Code, c'est magique, mais c'est extrêmement chronophage, et comme je travaille comme un Japonais, je suis obligé de travailler encore plus pour pouvoir réussir à mettre les choses. Donc c'est un processus lent, c'est un processus fastidieux.

**Thomas** — Qu'est-ce que tu veux dire par « je travaille comme un Japonais » ?

**Igor** — J'ai 10 jours de congés par an que je n'ai pas le droit de prendre.

**Thomas** — Mais du coup, tu es salarié ou non, c'est ton rythme, c'est toi qui te mets ce rythme-là ?

**Igor** — Ouais, ouais, enfin de toute façon.

**Thomas** — Ok.

**Igor** — C'est un pays de workaholics.

**Thomas** — D'accord.

**Igor** — Et je suis comme un poisson dans l'eau.

**Thomas** — D'accord, ok.

**Igor** — Et comment dirais-je ? Donc en fait, j'ai un emploi du temps très serré, en fait j'ai 7 casquettes, pour reprendre la terminologie.

**Thomas** — Ouais, PCRA.

**Igor** — PCRA, que je n'ai pas osé mettre dans Claude.md, parce que comme il est lu à chaque fois, je ne voulais pas faire un truc lourd, même si je suis frustré, parce que j'aimerais bien qu'il puisse vraiment connaître mes 7 casquettes. Et du coup, je suis obligé de jongler entre, ben voilà. Alors j'ai la chance par rapport à toi, c'est que mon fils est à l'université, donc il fait la cuisine tout seul.

**Thomas** — D'accord.

**Igor** — Mais bon, donc les difficultés techniques que je rencontre me freinent, elles n'ont rien d'impossible, c'est juste une question de temps, de lenteur, etc., etc.

**Thomas** — Ok.

**Igor** — Par contre, j'ai acquis une vision claire de comment je souhaite adapter ce que tu proposes pour mon AIOS.

**Thomas** — Ok.

**Igor** — Et je peux le résumer très simplement : la base qui figure dans le bootstrap, c'est un IPCRA.

**Thomas** — Oui.

**Igor** — Avec le CAPE, ok.

**Thomas** — Ok.

**Igor** — Avec VS Code, en lien avec Claude Code, et Obsidian pour la lecture.

**Thomas** — Alors, j'ai découvert cette semaine que tu pouvais mettre Claude Code dans Obsidian, et qu'a priori, ce serait même peut-être un peu plus rapide, mais bon, ça c'est ça reste à vérifier, tester, etc., mais tu peux avoir Claude, tu as des plugins dans Obsidian qui te permettent directement d'avoir Claude Code, ce qui te permet.

**Igor** — Oui, mais je crois que du coup tu es obligé de passer par le desktop, non ?

**Thomas** — Alors attends, je croyais que tu allais dire par l'API, mais tu peux utiliser ton... tu as mentionné que tu n'étais pas ton compte.

**Igor** — Mais du coup, tu n'es plus dans VS Code, tu es... enfin moi, ce que j'en ai compris, c'est que.

**Thomas** — Ah oui, oui, oui, tu es sur Obsidian. Tu peux faire, tu pourrais faire sans VS Code.

**Igor** — Ouais. Mais bon, pour l'instant, je pense que, enfin, quand j'analyse la proposition initiale que tu fais dans ta classroom, dans ton Club SMART, j'ai douté, j'ai mis à l'épreuve ce que tu as dit sur le fait qu'en passant par VS Code, tu as quand même plus de visibilité, tu as quand même plus de... que si tu passes par le desktop.

**Thomas** — Ouais.

**Igor** — Et notamment, une des choses, c'est que par VS Code, tu es dans ton terminal, alors que par desktop, tu es dans leur serveur.

**Thomas** — Ouais.

**Igor** — Donc tu es un peu plus dépendant, si jamais ça s'écroule, si jamais ils font s'envoler les prix, tu es un peu moins bien parti que si tu développes tout en local. Mais...

**Sylvain** — Vous pouvez me laisser, j'ai le retour.

**Igor** — Merci Sylvain de ton retour. Je poursuis où j'en étais.

**Thomas** — Vas-y.

**Igor** — En fait, je pense, enfin, j'ai essayé, j'ai commencé à essayer de mettre en place non pas le IPCRA, mais le IP2CRA, celui que tu proposes dans ton master IA, contrairement à ce que tu proposes dans ton bootstrap, petite critique au passage.

**Thomas** — Non, je veux dire que moi, je l'ai adapté comme ça. De toute façon, c'est un bootstrap, et après, pour moi, c'est un truc qui évolue, qui vit, et qui va changer, qui doit être personnel, justement. Mais moi, je l'ai fait comme ça parce que le contenu, je le trouvais trop... comment dire ça ? Je trouvais qu'il n'y avait pas les définitions qu'il fallait pour le contenu. Même si au final, aujourd'hui, je le mettrais peut-être quand même dans les casquettes.

**Igor** — Eh bien, moi, ce que je prévois de faire, c'est un IP3CRA.

**Thomas** — Ok.

**Igor** — Qui serait inbox, project, cortex.

**Thomas** — Ok.

**Igor** — C'est-à-dire mon bouillonnement intellectuel avec ChatGPT, avec une fonction export de ChatGPT en MD, qui apparemment est disponible sur VS Code directement.

**Thomas** — D'accord.

**Igor** — Quand tu te relies à GPT, il faut que je vérifie, il faut que je vérifie, il faut que je pratique. Et ensuite, donc, il est tard au Japon, contenu, casquette, le R, c'est.

**Thomas** — Le R, c'est rôle. Non, pardon, ressources, ressources.

**Igor** — Ressources et archives.

**Thomas** — Ouais.

**Igor** — Voilà. Et je souhaite relier Obsidian à Graphify.

**Thomas** — Je me suis posé la question.

**Igor** — Pourquoi ? Parce que Obsidian, il permet la visualisation, il permet, voilà, pour l'être humain.

**Thomas** — Oui.

**Igor** — Alors que Graphify, ce que j'en ai compris, déjà, on peut le mixer, parce que c'est un plugin d'Obsidian, il y a une fonction plugin d'Obsidian dans Graphify.

**Thomas** — D'accord.

**Igor** — Et Graphify, en fait, il te permet d'économiser des tokens par VS Code, parce que c'est l'équivalent d'Obsidian pour l'humain, mais pour le code, pour Claude Code.

**Thomas** — Ouais.

**Igor** — Donc voilà ce que je souhaite mettre en place pour ne pas être mortel face à la drogue limitless, c'est un peu la solution à laquelle je suis en train de penser. Et j'espère que dans les 3 semaines, un mois qui viennent, j'aurai un début de quelque chose qui commence à ressembler à autre chose qu'à des moments où je ne sais plus où j'habite.

**Thomas** — C'est marrant, parce que moi, alors, j'ai deux choses là-dessus. Moi, j'ai pensé à Graphify quand Sylvain a parlé tout à l'heure, donc déjà, enfin, je pense que ça va aussi intéresser Sylvain, parce que je ne sais pas si... parce que concrètement, c'est du RAG, je pense qu'en plus, ils sont capables de... c'est moi ce que je cherche, de créer des concepts, en fait, de créer des nœuds au-dessus de tes différentes notes, pour relier tes notes, qui créent un contexte, je ne sais plus comment s'appelle ça, un contexte... zut, je n'ai pas le nom en français, mais globalement, de langage. Enfin, il associe, moi par exemple, il va chercher, alors c'est un très mauvais exemple, mais il va chercher YouTube quand je vais parler d'un sujet, comment faire une bonne intro YouTube, tout ça, et puis quand je vais parler de stratégie YouTube, il va faire le lien automatiquement avec un contexte YouTube. Ce qui te permet de les retrouver plus facilement derrière, via du langage, en fait, via des requêtes qui sont, enfin, du langage naturel.

**Thomas** — Par contre, moi, j'avais interrogé Claude là-dessus, mais des fois, il se trompe, hein, et sur justement la pertinence en termes de tokens, et en termes de gain de... ouais, en termes de gain, il avait l'air de dire que sur du texte, ce n'était pas forcément le meilleur outil. Mais j'ai envie de creuser encore quand même, parce que pour l'instant, je ne suis pas... je trouve que des fois, c'est quand même un peu lent quand il va chercher dans les concepts, dans les machins, tout ça.

**Thomas** — Moi, j'ai mis Supabase, j'ai tout mis sur Supabase, donc c'est une base hébergée, mais Graphify me trotte dans la tête.

**Igor** — Je t'invite, Thomas, à poser la même question que tu as posée à Claude au sujet de Graphify, à la poser à Gemini. J'ai fait la même chose.

**Thomas** — D'accord.

**Igor** — J'ai fait le jour et la nuit, hein.

**Thomas** — Ouais, ça c'est le côté un peu inquiétant du truc, c'est que, oui, il faut vraiment tout vérifier ce qu'il nous dit, etc., parce que quand tu es enfermé sur un LLM, en général, enfin oui, des fois, il peut dire des conneries, et.

**Igor** — J'ai oublié, excuse-moi Thomas, dans la solution que je souhaite mettre en place, il y a forcément un moment, là pour l'instant, c'est trop loin pour moi, et puis je suis vraiment débutant, mais il y a forcément un moment où je ferais appel à une IA locale, parce que je travaille avec des enfants, parfois en situation de handicap, donc il y a des données confidentielles, et le gouvernement japonais, sur ça, il est ultra strict. Donc j'ai un vieil iPad mini.

**Thomas** — Un mini Mac ?

**Igor** — Un Mac mini, avec une M2 quand même.

**Thomas** — Ouais.

**Igor** — Et donc, si je peux héberger une IA locale et que je peux continuer à travailler sans que ça s'évapore, je reste dans les clous au niveau de la législation.

**Thomas** — D'accord. Ok, c'est super intéressant. Enfin, moi clairement, ça m'intéresse, enfin ton sujet m'intéresse vachement, enfin je pense qu'en fait on est en vrai, on est tous sur le même, je pense.

**Thomas** — C'est vraiment ce côté comment tu gères toute cette masse. Moi, c'est marrant, tu vois, l'Obsidian, cette semaine-là, je lui ai dit : « Laisse tomber l'humain. » Enfin, en fait, je lui ai dit : « Quand tu ingères du contenu, pense AI first. » Donc tu le fais pour toi, pour que tu puisses retrouver facilement le... enfin, tu vois, ma priorité, ce n'est pas moi d'aller chercher, d'aller lire mes notes dans Obsidian, c'est toi.

**Thomas** — Enfin, en fait, moi je vais passer par l'IA, et toi, donc l'IA, tu dois être capable de retrouver le plus facilement possible, et le plus efficacement possible, tout le contenu que je te donne. Parce que finalement, je me rends compte, mais toi, si tu as parlé, quand tu vas ingérer tout ton contenu de tous les échanges que tu as eus avec ChatGPT, tu vas être confronté à la même chose, c'est que tu as une masse énorme.

**Igor** — Ouais, mais c'est pour ça que la partie cortex va me permettre de distinguer le brut du raffiné. C'est-à-dire que je vais essayer de voir avec Claude comment définir le protocole, pour que toutes mes cogitations se soient un peu comme une rivière avec des pépites, mais que dans ma partie ressources, il n'y ait que les lingots.

**Thomas** — Ouais. Mais. Ouais, ouais.

**Thomas** — Mais c'est vachement... en fait, c'est vrai, c'est super intéressant. Moi, c'est ce que je... enfin, c'est ce que je fais, c'est ma problématique avec la veille exacte.

**Thomas** — Enfin, je me suis branché sur plein de choses de veille, et encore plein, c'est 10 % de ce que j'ai en tête, et chaque matin, j'ai déjà un premier filtre avec l'IA qui me dit, en gros, je me suis abonné à des chaînes YouTube, il me dit : « Lui, il a sorti telle vidéo, je l'ai gardée pour toi, parce qu'il y a ça, ça, ça. » Par contre, ensuite, encore une forte, enfin un embranchement : « Je te conseille de regarder la vidéo, ou ne va pas regarder la vidéo, ce que je t'ai mis là, c'est l'essentiel, et voilà. » Et après, je peux l'intégrer dans les fameux concepts dont je parlais, où j'ai retenu, enfin, c'est un truc qui je sais que ça va me... soit je l'archive, je l'ai lu, et puis ça reste dans ma tête, et voilà, soit je viens l'intégrer en me disant : « Ça, c'est une ressource qui est intéressante, qui a à recroiser avec les autres. » Et je l'ingère dans le second cerveau.

**Thomas** — Et je pense que c'est un peu, enfin, c'est... sauf que c'est un peu la même chose, toi, tu as déjà ce volume énorme qui est là, moi, c'est un volume qui arrive quotidiennement, de façon très, enfin, trop, parce que déjà, avec quelques sources, j'ai mis YouTube, j'ai mis des newsletters, je suis déjà débordé, je voudrais rajouter LinkedIn, je voudrais rajouter des comptes Twitter, je voudrais rajouter des choses comme ça. Potentiellement, mes notes à moi, j'ai vu que tu pouvais brancher ton téléphone, ton... enfin, ça n'a rien d'exceptionnel, mais les notes, chercher un truc où tu peux parler, tu sais, tu as une pensée, tu penses à un truc en marchant, tu prends ton téléphone, tu as une espèce de petit dictaphone, tu notes, ça remplit tes notes, et derrière, ça vient se synchroniser, enfin, ton IA vient récupérer tout ça et l'intégrer.

**Igor** — Ben, tu as un draft ?

**Thomas** — Ouais, je n'ai pas... quand j'ai abandonné les montres avec l'iPhone, là, je me suis dit : « Ah, plus jamais de... »

**Igor** — Ça, c'est l'iPhone.

**Thomas** — Ouais, ouais, je sais, mais... enfin, c'est tentant tout ça, puis après, je me dis : « Ouais, en même temps, j'aime bien avoir les bras libres. »

**Igor** — Dessus, j'ai Draft, et j'ai Just Press Record, parce que je fais beaucoup d'observations auprès des enfants, et donc quand j'observe une scène.

**Thomas** — Ouais, tu as le temps de chercher, ton...

**Igor** — Voilà, j'ai un bouton, je dis un truc, et ça vient directement dans mon inbox.

**Thomas** — Excellent. C'est top.

---

### Sylvain — à quoi servent vraiment Obsidian et Graphify

**Sylvain** — Dites-moi, je vous entends beaucoup parler. Moi, j'ai installé Obsidian, j'ai, honnêtement, je dois être à 3 % de son utilisation tel que je pense que vous la faites, parce que pour moi, j'ai vu qu'une interface graphique, ça ne m'a pas intéressé plus que ça, alors que je suis bien certain que si vous l'avez mis en place, c'est que ça doit servir à quelque chose. Et tu m'as de la même manière, Thomas, parlé de Graphify.

**Sylvain** — Alors, quand tu parles de la manière dont tu fais des développements, pour le moment, moi, je n'ai utilisé que le Vault. Et à partir du Vault, j'ai fait des bidouilles en Python, un truc comme ça, pour faire mes trucs.

**Sylvain** — Mais je ne me suis jamais servi d'Obsidian et de Graphify. Et actuellement, moi, le Vault me suffit tout à fait par rapport à mes besoins, mais qui sont loin d'être aussi compliqués, par exemple, des prises d'informations sur du YouTube, etc., pour le moment, ce n'était pas mon besoin.

**Sylvain** — Est-ce que c'est dans ce genre de choses que ça t'a servi, ou comment tu l'utilises ?

**Igor** — Excuse-moi, Thomas, j'aimerais bien poser une question à Sylvain, ça ne te dérange pas ?

**Sylvain** — L'existence de...

**Igor** — Je suis emmerdé, hein. Est-ce qu'on pourrait connaître tes besoins ? Parce que tu parles de tes besoins, de tes trucs, mais c'est quoi tes besoins ?

**Sylvain** — Alors, mes besoins, j'en ai un petit peu parlé au début, hein, c'est-à-dire, moi, je viens du monde du hardware. Pour moi, je suis très inquiet sur la manière, ayant travaillé dans des boîtes américaines, je suis très inquiet sur la manière dont sont utilisées toutes nos informations. Donc, c'est pour ça que chez moi, j'ai un LAN qui est pas mal sécurisé, et sur lequel j'essaie le moins possible de faire sortir des choses.

**Sylvain** — Donc, c'est mon besoin. Donc, ça, c'est un point.

**Sylvain** — L'autre point, c'est qu'on sait bien que pour le moment, le prix de l'IA n'est pas extrêmement cher, même si c'est vrai que quand on commence à travailler sur des gros volumes, ça commence à coûter, mais ça reste encore très, très raisonnable. Là encore, connaissant bien les Américains, on commence par faire gratuit ou pas cher, et après, on va faire bon pied un max.

**Sylvain** — Donc, ma stratégie générale est de me dire : « Comment est-ce que je peux faire le maximum de choses chez moi ? » D'où l'idée dont j'ai parlé au début.

**Sylvain** — Je suis très intéressé par ce que fait les AIOS, parce qu'en effet, ça me paraît une très bonne manière d'utiliser ce que nous fournit une IA grand public, d'accord, et j'aimerais bien réussir à le porter, au bout du compte, sur de l'IA locale. Donc, un LLM local qui serait capable d'être attaqué par l'équivalence d'un VS Code, et de rentrer des choses dedans.

**Sylvain** — Ça, c'est mon objectif à terme. Je serais surpris que j'y arrive du jour au lendemain, mais c'est ce que j'essaie de faire.

**Sylvain** — Et là, je te dis, ce qu'on a fait avec le Vault me suffit tout à fait. Le Vault, il s'y connaît suffisamment en Python, il s'y connaît suffisamment en N8N, en différents protocoles de réseau, trucs comme ça.

**Sylvain** — Je gère ça dans mon LAN, j'ai un certain nombre de VM qui font papa-maman au moment où j'en ai besoin. Tout ça reste en local, complètement chez moi, etc.

**Sylvain** — Mais pour le moment, je n'en suis pas, et loin de là, à utiliser du LLM local pour aller interroger ma base de données vectorielle, puisque ça serait le but du jeu, d'accord. Et une fois que j'aurai ma base de données vectorielle, je vais me retrouver de toute façon aux mêmes besoins que vous, c'est-à-dire : comment je fais mes vecteurs à partir de cette base de données ?

**Sylvain** — Quel est l'élément logique minimum pour pouvoir avoir ces vecteurs ?

**Thomas** — Ok, mais.

**Sylvain** — Ça te.

**Thomas** — Ça, alors, j'ai deux questions pour toi. En fait, là, tu nous parles de la... tu nous parles des tuyaux.

**Sylvain** — Oui.

**Thomas** — Mais qu'est-ce que tu mets ? En fait, je pense que la question d'Igor, c'était surtout : qu'est-ce que tu mets dedans ? Enfin, tu vois, nous, on parle de... moi, j'ai du contenu de la veille, c'est une dimension un peu, on va dire, éducation-marketing.

**Sylvain** — D'accord. Moi, dans le cadre du développement de mon LAN et de mon serveur, je l'ai depuis plusieurs années, ce truc-là, d'accord.

**Sylvain** — Et évidemment, au fur et à mesure, j'ai fait exactement ce dont tu parlais, Igor. C'est que je me suis rempli des pelletés, des pelletés, des pelletés de fichiers Word, d'accord, qui ont des tas d'informations.

**Sylvain** — L'un des premiers problèmes, c'est que ça devenait rapidement asynchrone. C'est-à-dire que quand je travaillais sur un sujet, évidemment, en références croisées, sur un autre fichier, ça se contredisait, etc., etc.

**Sylvain** — Donc, j'ai eu un problème. En me servant du Vault, ça m'a permis de remettre tout ça d'aplat, d'accord.

**Sylvain** — Je me suis créé un certain nombre de skills en disant : « Fais-moi une vérification de cohérence sur tout ça, d'accord. » Et il pédale comme un malade, mais il me dit : « Attends, là, tu as une vieille contradiction entre machin et machin, qu'est-ce que je fais ? » Etc.

**Sylvain** — Il y a des fois, c'est tellement vieux que je me creuse la tête, mais je finis par... Ce qui fait que, petit à petit, je suis en train d'arriver à quelque chose qui est une image claire et consistante de mon LAN.

**Sylvain** — Et je te dis, ça fait une trentaine de bécanes, tu imagines que sur chacune des bécanes, tu peux avoir une dizaine de softs, avec des révisions différentes, avec des machins, ça te fait une usine à gaz, une usine à gaz pas possible. Donc, c'était dans un premier cas, c'était mes besoins.

**Sylvain** — Et ça, franchement, AIOS me fait bien le taf, pour le moment. Ce qui explique pourquoi je n'ai pas eu besoin d'autres choses.

**Thomas** — Ouais, ouais. Ok, et alors, pour répondre à tes... pour moi, les vecteurs, ce n'est pas forcément à toi de le définir, finalement. En fait, le RAG, ce que tu définis, j'en ai déjà fait un peu, mais alors, c'est mon œil non tech, etc., mais en gros, ce que tu fais, c'est que tu défines... ce qu'il va faire, c'est qu'il va découper tous tes documents en petits morceaux.

**Sylvain** — Absolument.

**Thomas** — Donc, les fameux vecteurs. Et en fait, ce que tu vas définir, c'est la taille du vecteur. Plus tu le mets... si tu le mets petit, enfin, trop petit, si tu le mets trop gros, ça ne sert à rien, tu ne gagnes pas forcément.

**Thomas** — Si tu le mets trop petit, tu perds la pertinence, parce que ce qui est important, c'est qu'il va chercher après des mots, mais il va les chercher dans un contexte global. Et donc, si ton contexte est trop réduit, il ne fait pas le lien.

**Thomas** — Et pour moi, c'est là où... là, on parle de Graphify et tout ça, je pense que ça, c'est le job justement de Graphify, d'aller bien calibrer, et je te dis, en plus, je pense qu'il rajoute des systèmes de tags, de concepts, etc., au-dessus, qui te permettent de faire les liens. Et je pense que pour toi, c'est d'autant plus intéressant que tu n'as pas de... quand Claude tout à l'heure me disait que pour moi, ce n'était pas forcément intéressant à challenger, mais c'est parce que c'était du MD. Donc, le MD, c'est du texte brut, très facile à lire pour lui. Un fichier doc, tu as plein de bruits autour, en fait.

**Thomas** — Tu as de la mise en forme, tu as des trucs, et pour lui, c'est beaucoup plus lourd, beaucoup plus compliqué. Et c'est là que Graphify est intéressant, parce que lui, il va parcourir le document, et il va extraire les infos.

**Thomas** — Il le fait à ta place. Donc, il le fait, il va extraire le contenu brut, et il faut le voir vraiment comme un réseau un peu neuronal, ou un... enfin, il va créer une espèce de réseau neuronal entre tous tes documents, quel que soit le format potentiel.

**Thomas** — Là, je dis peut-être des bêtises, mais si ça se trouve, il va... et je pense qu'à terme, ça va être possible, il va aller chercher tes images, potentiellement tes vidéos, etc., et il va tout scraper. Alors, il va aller récupérer, gratter les informations, pour te construire ce réseau neuronal.

**Thomas** — Et le réseau... le réseau, son intérêt, c'est de dire... c'est un peu ce qu'on fait, finalement, dans l'IPCRA, avec les index, c'est de se dire : « Je vais chercher une info, je parcours un truc tout réduit. » En fait, tu pars du... tu fais l'inverse d'un entonnoir, tu vas chercher les trucs de façon très... l'information de façon très réduite, jusqu'à ce que tu arrives à la vraie source, et là, tu vas... tu ouvres et tu récupères toute l'information.

**Sylvain** — D'accord. Ce qui veut dire... excuse-moi, j'essaie de reformuler, histoire d'essayer de m'approprier la chose. Ce qui veut dire que dans ton... donc, j'ai un répertoire qui s'appelle Knowledge, avec une organisation.

**Sylvain** — En gros, le premier niveau, c'est le niveau dit organisation, c'est-à-dire, ça peut être moi personnellement, ça peut être ma coopération avec une ou deux associations, des trucs comme ça. Dans chacune de ces organisations, j'ai un certain nombre de domaines.

**Sylvain** — Si je prends moi personnellement, je peux très bien avoir un domaine informatique, un domaine santé, un domaine, bref, finance, ou etc., ce que vous voulez. Et dans chacun d'entre eux, je peux avoir différents projets.

**Thomas** — Oui.

**Sylvain** — D'accord ? Donc, ça, c'est la manière humaine dans laquelle je rangeais mes Word. Donc, honnêtement, que ça soit du Word ou du MD, ça ne fait pas grande différence.

**Sylvain** — Il suffit qu'on ait une moulinette pour prendre le Word et le transformer par MD.

**Thomas** — En fait, il y a quand même une différence pour le LLM, dans le sens où l'info est, je te dis, moins brute, enfin, est plus compliquée à lire pour lui.

**Sylvain** — Non, mais j'entends, j'entends. Mais je veux dire, moi, en termes d'utilisation, tu penses bien que j'ai du N8N qui me permet de prendre ce que je veux dans un coin, de le transformer, de le mouliner comme je veux, pour le ranger ailleurs. Ce qui veut dire que si même je pars d'une base Knowledge 1 qui serait en docs, ou en n'importe quel truc, je peux bien sûr en sortir un autre répertoire qui ne serait que du MD, et je synchronise automatiquement, ce n'est pas un problème.

**Sylvain** — Donc, excuse-moi, je reviens. L'idée, c'est que je m'approprie un petit peu ce que tu as dit.

**Sylvain** — Si j'ai bien compris, une fois que j'ai mon répertoire Knowledge bien construit, correctement construit, je me fais tourner un grand coup de Graphify là-dessus, et il va me vectoriser ça point-poil de manière intelligente.

**Thomas** — C'est ça. Il va te faire une carte. Une carte de métro, une carte de... imagine une carte de métro, de bus, de ce que tu veux.

**Sylvain** — Mais lui, ça stocke comment ? C'est une base de données dans laquelle il la stocke ?

**Igor** — Non, c'est open source. C'est chez toi.

**Sylvain** — Ouais, j'entends. Mais le chez moi, la manière classique des informaticiens techniques, c'est quand on veut accéder très vite à des tas de données diverses, on ne fait surtout pas des fichiers plats, on fait de la base de données.

**Igor** — Si je peux... ce que j'ai compris de Graphify, c'est que la carte, elle n'était pas destinée à toi, elle est destinée à ton LLM.

**Sylvain** — Oui.

**Igor** — À ton Claude Code. À ton Claude Code, pareil Claude Code. Donc, c'est une sorte de carte de métro, pour reprendre la métaphore de Thomas, mais pas forcément pour toi usager.

**Igor** — Ça, c'est plutôt Obsidian, qui te permet visuellement d'être plus à l'aise dans tes tableaux, mais si tu es à l'aise avec une arborescence habituelle, tu n'as pas besoin d'Obsidian. Si tu veux quelque chose de plus beau, de plus travaillé, Obsidian apporte du confort visuel, et cette idée de mind mapping un peu galactique.

**Igor** — Graphify, c'est un peu la même chose, mais pas tellement pour l'humain, mais plutôt pour le code.

**Thomas** — Je suis en train de regarder, mais ce n'est pas une base de données. C'est des... ouais. Pour moi, ce n'est que des fichiers, c'est JSON, etc., je pense, mais... attends.

**Thomas** — Il ne met pas le détail, mais il ne stocke pas dans une... il ne fait pas son index, tout ça, dans une base de données, non, c'est...

**Sylvain** — Bon, écoute, c'est très bien, ça me donne une autre direction. Moi, j'ai des réflexes qui datent de 40 ans, 50 ans, donc... et vous savez, le monde évolue.

**Thomas** — Je trouve ça super déjà de mettre la page comme ça et de ne pas continuer à...

**Sylvain** — C'est le but de ce genre de réunion, c'est ça.

---

### Kimi K3 et l'IA locale

**Igor** — Donc, ça, si je peux ajouter un truc, tu vas peut-être m'interrompre. Mon frère est ingénieur informatique, et je lui ai fait passer un short que j'ai vu passer sur YouTube, et je lui ai dit : « C'est vrai ? » Il m'a dit : « Oui. » Bon, je n'ai pas tout compris ce qui était dans le short, mais Kimi K3, apparemment, a... enfin, le short dit que ça a plié le game.

**Igor** — C'est-à-dire qu'avec Kimi K3, il te donne le cœur d'OpenAI, le cœur de Claude, Anthropic, etc., et il te permet de le mettre sur ton IA locale.

**Sylvain** — Waouh.

**Igor** — Avec pour but que tout le monde fasse son Kimi K3 en IA locale, pour ne plus dépendre des grandes firmes américaines, et donc ça répondrait à un de tes besoins que tu...

**Sylvain** — Absolument. Et qui a sorti Kimi K3 ?

**Igor** — Les Chinois.

**Sylvain** — Ah.

**Thomas** — J'ai anticipé le...

**Igor** — C'est en open source. Évidemment, c'est en open source.

**Sylvain** — Waouh.

**Igor** — Parce que leur but, dans la course à l'IA, c'est de briser les pattes des Américains en leur disant : « Alors, vous savez faire des trucs supers, et vous voulez les monnayer beaucoup ? »

**Sylvain** — Nous, on va le faire gratuitement, quoi.

**Igor** — Allez, cours.

**Sylvain** — Non, mais écoute, merci du tuyau. Je vais essayer de regarder... dis donc, c'est instructif, j'ai appris plein de choses, moi.

---

### Le rendez-vous, l'objectif d'après, et comment prioriser les sujets

**Thomas** — Ouais, non, c'est sympa, ces échanges, franchement. C'est chouette. Honnêtement, j'avais peur ce matin, je croyais que j'allais être tout seul.

**Thomas** — D'ailleurs, j'ai eu une ou deux minutes de retard, parce que je ne faisais pas très attention à l'heure, et puis bon, tu vois, j'ai quand même... je vais voir. Parce que dans les réponses, c'était plus : « Ah, je ne suis pas là, je ne pourrai pas, machin. »

**Sylvain** — Thomas, je peux... on est tous pris par d'autres choses, mais vraiment...

**Thomas** — C'est dur de trouver l'heure parfaite. Là, en plus, on voit, on est en Asie, en Europe, et aux États-Unis... enfin, en Amérique, et du coup, c'est... voilà, l'heure pour le trouver, c'est... mais là, j'ai l'impression que c'est pas mal. À 9 heures... enfin, il est...

**Igor** — Thomas ?

**Thomas** — Oui ?

**Igor** — Je peux te faire une suggestion ?

**Thomas** — Bien sûr.

**Igor** — Après les 4 000 heures de YouTube, les 4 000 membres du Club SMART.

**Thomas** — Ouais, pour les objectifs, ouais. Mais oui, c'est vrai qu'on n'en a pas parlé, mais oui, oui.

> *(digression sur la naissance de son fils — voir l'annexe)*

**Thomas** — Et finalement, quand tu as passé cet objectif, tu es un peu... tu te dis : « OK, je fais quoi maintenant ? » Enfin, quel est le... et rapidement, je pense, il faut le trouver.

**Thomas** — Et là, c'était facile, parce que pour revenir sur la vidéo, c'est facile, parce que c'est l'objectif qui t'est imposé. Enfin, qui t'est imposé, ce n'est rien d'imposé, mais qui est déjà posé par YouTube.

**Thomas** — C'est à partir de là que, quand tu as des pubs qui passent, tu touches une partie, mais honnêtement, tu ne touches pas grand-chose. Mais derrière, c'est se dire : « OK, maintenant, c'est quoi la next step ? » Qui soit aussi challengeant et motivant, quoi.

**Igor** — Parce que je ne veux pas du tout, du tout te cirer les pompes, mais tu as des capacités pédagogiques indéniables.

**Thomas** — Ça fait plaisir.

**Igor** — Donc, quand j'entends parler d'autres YouTubeurs d'AIOS, quand j'entends parler d'autres YouTubeurs de Second Brain, etc., etc., waouh, waouh. Mais comment on fait ? Alors que toi, Club SMART, tu viens, tac, tac, tac, ok, step one, step two, step three, tatata.

**Igor** — Donc, vraiment, je t'encourage à... tu as ça, quoi.

**Thomas** — Ah, bah cool. Bah écoute, ça me fait plaisir. En plus, c'est un truc qui me passionne, enfin, que j'aime bien faire, donc ouais, c'est chouette.

**Sylvain** — Je partage tout à fait ton avis, Igor. Et alors, juste pour te donner un truc en plus, dans ma carrière, qui est constructeur informatique, il y a eu, pendant un moment, j'ai été le patron du service formation France de DEC. Donc, j'en ai connu des formateurs, etc. Tu es bon.

**Thomas** — Merci beaucoup, ça fait plaisir. Bon, super. Écoutez, sûrement la semaine prochaine, si vous souhaitez.

**Thomas** — Je ne sais pas comment faire évoluer le... là, c'est bien, on est trois, tout ça, mais quand on sera plus nombreux, ce sera peut-être plus complexe, je ne sais pas. Mais à voir, enfin, de toute façon, on s'adaptera.

**Igor** — Je te suggère de faire un débrief. Je vais t'envoyer la transcription sur quelle adresse mail, j'aimerais bien savoir. Si tu peux m'envoyer un message.

**Thomas** — Ouais.

**Igor** — J'ai pris une transcription, là, de ce qu'on vient de se dire.

**Thomas** — Ouais, moi aussi.

**Igor** — Je te donne ton... voilà.

**Thomas** — OK.

**Igor** — Moi, ce que je ferais à ta place, tu mets ce qu'on vient de se dire dans...

**Thomas** — Skool, ouais.

**Igor** — Moi, je travaille avec ChatGPT pour le côté brainstorming, c'est franchement...

**Thomas** — C'est mieux que Claude ?

**Igor** — Il y a des nuances.

**Thomas** — Ouais.

**Igor** — Il y a des nuances, mais des nuances de folie, des trucs que tu ne peux pas imaginer.

**Thomas** — Ouais, c'est bien.

> *(anecdote personnelle d'Igor sur sa femme et ChatGPT — voir l'annexe)*

**Igor** — Donc, transcription, et tu poses tes questions. Et moi, ce que je fais, je te donne... bon, c'est un peu chronophage, mais dans les messages de ChatGPT, je les copie dans un Markdown. Moi, je travaille sur TextEdit, c'est super basique, c'est un peu relou, mais bon, voilà, c'est comme ça que j'ai commencé.

**Igor** — Et à l'intérieur, je réponds dans le message. Je dis : « Sur ce point-là, je valide, je valide potentiellement, je valide partiellement, je valide absolument, je nuance en disant ceci, en disant cela. » Et par un jeu de ping-pong comme ça, je pense que tu vas trouver l'essence de l'évolution de ces masterclass en direct.

**Igor** — Voilà. Qu'est-ce que toi, au fond de tes tripes, tu as vraiment envie de partager ? Comment tu as envie de faire vivre cette communauté ? Comment tu as envie que de plus en plus de gens n'aient pas peur de répondre aux autres, malgré le fait que c'est toi, entre guillemets, le spécialiste de la bande ? Enfin, sur le papier, puisque c'est toi le fondateur du club. Tu vois ?

**Igor** — Et ensuite, Claude, par contre, ChatGPT, pour processer, ça ne vaut rien du tout. Il confond les dates, il dit : « Bon, aujourd'hui, repose-toi, puis on verra dans trois jours. »

**Sylvain** — Ah oui, moi, en effet, j'ai l'expérience. Étant sur un contexte beaucoup plus technique, j'ai vu au contraire, j'avais avant un abonnement à ChatGPT, et dès que je lui demandais de travailler sur des fichiers un peu lourds, il m'emmerdait comme « ce n'est pas possible », etc., alors que tu te prends un tableau de 300 lignes, enfin, deux tableaux, un de 300 lignes, un de 200 lignes, avec des colonnes remplies par remplies, tout, et tu lui dis : « Fusionne tout ça. » Il te fait ça, le doigt dans le nez, les mains dans les poches, et sans erreur.

**Thomas** — C'est marrant, parce que moi, mon job, là, enfin, j'ai passé, là, enfin, donc j'ai commencé mon boulot, j'ai eu une semaine avec toute l'équipe, et après, tout le monde est parti en vacances. Donc, ça s'est un peu compliqué quand tu commences. Et mon manager m'a dit, enfin, l'autre responsable TI, là, m'a dit : « OK, j'aimerais bien que quand tu rentres, on choisisse entre ChatGPT et Claude. » Donc, moi, je lui ai dit : « Bah, enfin, toujours dit la même réponse. Moi, je ne connais pas vos usages, donc ça va être compliqué de répondre. » Enfin, tu vois, moi, je viens d'arriver.

**Thomas** — Mais du coup, enfin, c'est intéressant de voir qu'effectivement, il y a... parce que là, ce que je lui ai dit, c'est que pour moi, ça se vaut à peu près, à part sur deux, trois...

**Igor** — Ah oui, oui, mais, mais, mais, ChatGPT Work.

**Thomas** — Oui.

**Igor** — Avec une grosse différence par rapport à Claude, c'est que Claude, il est designé pour travailler sur ton disque, en gros, alors qu'OpenAI, c'est mis de mèche avec Google pour intervenir sur toute la suite Google.

**Thomas** — Ouais, mais Claude l'a fait avec Microsoft. Et ici, à mon grand désarroi, c'est Microsoft partout. Ils sont très, très, très Microsoft ici au...

**Sylvain** — Mais ta boîte, si je ne me trompe, tu as dit, c'est une boîte de TP ?

**Thomas** — Ouais. Ils construisent des hôpitaux, des centrales nucléaires, etc.

**Sylvain** — Mais ils font essentiellement... ils font de l'engineering et de la construction ?

**Thomas** — Mais ils sont plus... ils sont plus, dans ce que j'ai compris, en gros, ils prennent, quand tu as un chantier public, ils prennent le relais du donneur d'ordre pour organiser tout le reste. Donc, ils ne sont pas vraiment dans la finition de... enfin, comment dire ? Ce n'est pas eux qui vont dessiner les plans, qui vont...

**Sylvain** — Ils ne font pas de conception. Ils ne font pas d'engineering, ils ne font pas de conception en tant que telle.

**Thomas** — Mais je penserais, mais je n'ai aucune idée pour l'instant. C'est très... les Québécois ne sont vraiment pas forts pour donner du contexte.

**Thomas** — C'est mon troisième job ici, et en général, ils prennent et puis ils font... ils te lâchent comme ça dans ton job, et ils disent : « Allez, ok. » Donc, j'aurai plus de réponses dans quelques semaines, parce que du coup, je vais aller voir tout le monde.

**Sylvain** — Ouais, c'est ça, il faut aller voir tout le monde, c'est clair.

**Thomas** — Ouais, ouais, mais là, je te dis, c'était vacances, donc j'étais un peu dans mon bocal, mais oui, ça va être laissé. Et oui, oui, pour finir sur ça, je me demande si, sur le rendez-vous, je me demande si, à terme, on ne fera pas des sujets... j'avais pensé à éventuellement une espèce de... enfin, une petite app où chacun vient mettre les sujets qu'il a, et on vient voter pour les sujets, et du coup, tu as des sujets qui remontent. Et comme ça, à chaque semaine, on se fait des focus plus précis. Parce que là, on est trois, donc c'est parfait. Je pense qu'en septembre, si on continue comme ça, on serait cinq, six, et après, rapidement, on peut arriver à dix, et dix, ça devient compliqué.

**Sylvain** — Ça devient compliqué, hein. Les choix sont compliqués.

**Thomas** — Mais bon, on va voir comment ça évolue.

**Sylvain** — Juste un petit rappel : si tu te retrouves dans ce genre de problème, tu as, je ne sais pas, une dizaine de projets dans lesquels il faut que tu trouves les priorités. D'accord ? Ne demande surtout pas aux gens de donner. Qui c'est qui vote pour celle-ci ? Et c'est tout.

**Sylvain** — Parce que là, tu vas avoir un vote sur la majorité. Demande toujours aux gens de t'ordonner.

**Thomas** — Oui, oui.

**Sylvain** — Ce projet-là, je le prends numéro un. Et bien sûr, tu prends la moyenne des réponses. C'est toujours là où tu as non pas le plus satisfait, mais le plus de « pas trop contre ».

**Thomas** — Ouais, tu fais par le nivellement.

**Sylvain** — Oui, mais attends.

**Thomas** — Non, mais je comprends.

**Sylvain** — En démocratie, même si une boîte, ce n'est pas forcément démocratie, on sait bien que quand on introduit un outil dans une entreprise, finalement, l'adhésion des gens, elle est plutôt démocratique. Ce n'est pas simplement une question de donner des ordres pour que ça se mette en place. Moins tu fais le mécontent, plus tu as de chances de passer ton truc.

**Thomas** — Effectivement.

**Sylvain** — On fait ce que tu veux.

**Thomas** — Ouais, ouais, ouais. Merci, merci. Bon, écoutez, merci.

---

### CLAUDE.md — la dernière question

**Igor** — Thomas, tu évoquais une vidéo YouTube sur Claude Code. Sur CLAUDE.md, tu la fais toujours ou c'est plus pendant les conférences ?

**Thomas** — CLAUDE.md ?

**Igor** — Ouais, une vidéo spéciale sur CLAUDE.md.

**Thomas** — Ouais, je pense que c'est un trois minutes. Mais ça, à la limite, je peux le mettre plus sur, je pense, peut-être moins sur YouTube, mais sur la... je peux faire un petit truc sur le Skool. Parce que justement.

**Igor** — Ouais, par exemple, moi, j'ai mes sept casquettes. Est-ce que pour ou contre les mettre tous dans mon CLAUDE.md ? Enfin, tu vois, des trucs, peut-être sur les erreurs à ne pas faire.

**Thomas** — Moi, je les mettrais, mais genre une phrase.

**Igor** — OK.

**Thomas** — Je suis... je ne tiens pas... ex-enseignant, nanana, j'ai... voilà, hop, et plus d'infos, pouf, sur tel fichier. Enfin, on va voir. En gros, tu dis, c'est un index, une table des matières, tu dis : « Va voir j'ai ça, ça, ça, ça. » Il faut qu'il sache comprendre le contexte de ce qu'il va aller trouver derrière.

**Thomas** — Et tu l'envoies vers tes casquettes, où là, tu peux te répondre en disant, enfin, expliquer toute... faire une biographie, si tu veux, sur chacun des trucs. Et il ira chercher.

**Thomas** — Au moins, il sait tout ce qu'il y a. Alors, sept, je ne me rends pas compte.

**Thomas** — Moi, il arrive bien à, tu vois, à switcher, à identifier quand je parle d'un truc, il sait : « OK, là, je suis dans cette casquette-là, et machin. » Sept, je ne sais pas.

**Thomas** — Moi, j'en ai trois. Trois, quatre, je ne sais plus, peut-être trois.

**Thomas** — Mais moi, je le mettrais avec beaucoup plus de détails derrière, dans les casquettes.

**Igor** — OK. Et aussi, tu peux t'appuyer sur ce qui est déjà présent dans les questions, c'est-à-dire, à partir des témoignages, tu vois, s'il y a des trucs un peu récurrents qui te viennent, dire : « Bon, ma prochaine masterclass, j'ai eu dix fois cette question. »

**Thomas** — Oui, complètement.

**Igor** — Et on se la fait tous ensemble.

**Thomas** — Ouais, carrément. Carrément.

**Igor** — Tous ensemble.

**Thomas** — Bon, ben, merci beaucoup, messieurs. C'était vraiment sympa.

**Sylvain** — Merci. Bonne journée, bon week-end.

**Thomas** — Allez, à bientôt. Bye.

**Igor** — À bientôt.

---

## Annexe — hors sujet, retiré du fil

> Ces trois passages n'ont aucun rapport avec le Club SMART. Ils sont conservés ici pour que l'archive reste entière, et sautés en lecture.

### 1. Avant le démarrage — la mise en route de l'enregistrement

**Thomas** — euh, je suis enregistré ? Je ne sais pas si c'est enregistré. Je vais le faire.

**Igor** — Oui, j'ai bien le transcript, oui. Tu m'as demandé une autorisation de transcript.

**Thomas** — De transcript, oui, mais la vidéo...

**Igor** — Ah d'accord.

**Thomas** — Je ne sais pas si c'est enregistré ou pas.

**Thomas** — Attendez, je vais juste... je vais juste vérifier effectivement si je peux enregistrer ce qu'il y a la première fois. Avec la solution intégrée à Skool, on pouvait enregistrer, mais derrière c'était compliqué, enfin... ce n'est pas évident de récupérer derrière les infos, tout ça. Voilà, enregistrement, c'est parfait. Donc je vais mettre « commencer à enregistrer ».

**Igor** — C'est bon ?

**Thomas** — Oui, c'est bon pour vous. C'est bon pour vous. Bon, ben super.

### 2. La naissance de Tanguy

> Thomas signale lui-même la sortie de route : « là, on sort complètement du sujet IA ».

**Thomas** — Ouais, ça, c'est marrant, parce que je me retrouve un peu dans le même... enfin, là, on sort complètement du sujet IA, mais ça me rappelle un peu ma femme qui, pour mon premier enfant, en fait, on te martèle une date de... tu sais, d'accouchement, on dit le bébé.

**Igor** — D'accouchement, ouais.

**Thomas** — Et nous, on l'appelait Tanguy, d'ailleurs, c'est le prénom, et il est arrivé une semaine après, quoi. Et quand tu arrives... enfin, moi, je ne l'ai pas mal vécu, honnêtement. Mais ma femme, quand elle a dépassé la date, c'était... enfin, mentalement, c'était ultra compliqué d'attendre, tu sais, de... finalement, c'est une semaine.

**Thomas** — Tu sais qu'au bout d'une semaine, ça va être déclenché, etc. Mais pendant 9 mois, elle avait tellement la date, la date, la date, la date, enfin, finalement, l'objectif.

### 3. L'anecdote d'Igor sur sa femme et ChatGPT

> Passage très abîmé par la transcription sur ses premières phrases — à lire au sens.

**Igor** — Tiens, il nous reste quelques minutes. Je vous fais une petite anecdote perso, puisque toi, tu as parlé de ta femme et de Tanguy, parmi les autres prénoms de ton enfant. Comment dirais-je ?

**Igor** — Bon, il y a une finesse. Déjà, la langue japonaise, elle est basée sur les émotions, etc., etc.

**Igor** — Et quand elle a commencé à utiliser ChatGPT, à la base, pour son boulot, pour faire des rapports hebdomadaires dans le cadre de son boulot, puis après, elle discute au sujet de ses collègues. Et en fait, ChatGPT fait un effet miroir qui fait qu'elle a compris des trucs que ça faisait des mois que j'essayais de lui faire passer.

**Igor** — Et en quelques semaines, quelques jours, elle me dit : « Oh, tu sais, il m'est arrivé un truc. J'en ai discuté avec Chappy », parce que pour les Japonais, c'est Chappy, « j'en ai discuté avec Chappy, et j'ai compris que... » Et là, je me suis dit : « Mais moi, ça fait des mois que j'essaie de... »

**Thomas** — On n'est pas prophète en son pays.

**Igor** — Une fois, deux fois, trois fois, quatre fois, au bout d'un moment, je me suis dit : « Bon, j'essaye. » Et paf, c'est Limitless.

**Thomas** — C'est vrai.

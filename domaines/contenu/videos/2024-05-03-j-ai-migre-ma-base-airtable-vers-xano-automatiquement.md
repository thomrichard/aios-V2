---
type: video
resume: Dans cette vidéo, je te montre pas à pas comment j'utilise Make pour migrer des données présentes dans Airtable vers une base de données Xano.
statut: publie
domaine: contenu
maj: 2026-10-22
liens: [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios.md, 2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a.md]
---
# J'ai migré ma base airtable vers Xano automatiquement

- Vidéo : https://www.youtube.com/watch?v=JPpXnwOM2JU
- Miniature : https://i.ytimg.com/vi/JPpXnwOM2JU/maxresdefault.jpg
- Publiée le : 2024-05-03
- Durée : 17 min 7 s
- Playlists : Airtable : tuto et systèmes no-code
- Tags : no-code, nocode, ia, intelligence artificielle, leonardo, migration de données, xano, airtable, make, make.io, integromat, synchronisation de données, migrer ses données

## Stats

YouTube Analytics, données jusqu'au 2026-10-20. Revenus estimés en dollars US. Depuis le 27 août 2026, YouTube compte une vue dès la première image : pour comparer avant et après, regarder les vues engagées.

| | 7 premiers jours | 30 premiers jours | Depuis la sortie |
|---|---|---|---|
| Vues | 55 | 70 | 228 |
| Vues engagées | 55 | 70 | 225 |
| Heures regardées | 2,7 | 3,5 | 9,9 |
| Abonnés gagnés | 1 | 1 | 6 |
| Revenus estimés | 0,00 $ | 0,00 $ | 0,00 $ |
| Durée moyenne regardée | | | 2 min 38 s (15,4 %) |
| J'aime · commentaires | | | 6 · 2 |

## Liens

- Cite : [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios](2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios.md)
- Cite : [2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a](2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a.md)
- Description : https://clubsmart.s.gy/masterclass-aios-catalogue
- Description : https://clubsmart.s.gy/tuto-claude-catalogue
- Description : https://www.skool.com/club-smart
- Description : https://www.make.com/en/register?pc=nocodeagency
- Description : https://airtable.com/invite/r/imtpOjSB
- Description : https://www.linkedin.com/in/thomas-richard-48212618/
- Description : https://partners.smartsuite.com/zxd28egq7wow
- Description : https://tidycal.com/ncanoumea/conseil-en-automatisation
- Description : https://app.fireflies.ai/login?referralCode=IOKsYd3ByI

## Description

```text
Dans cette vidéo, je te montre pas à pas comment j'utilise Make pour migrer des données présentes dans Airtable vers une base de données Xano.

🎓 MES MASTERCLASS (pour aller au fond des choses) :
⭐ AIOS avec Claude — construis ton système IA complet, pas à pas (1h17) :
https://youtu.be/FwnIB-RbC-E
→ Toutes les ressources de la masterclass (gratuites) :
https://clubsmart.s.gy/masterclass-aios-catalogue
→ Claude : tutoriel complet, de débutant à utilisateur avancé (1h16) :
https://youtu.be/qefrfyxQOEY
→ Toutes les ressources du tutoriel (gratuites) :
https://clubsmart.s.gy/tuto-claude-catalogue

Make te permet de modifier ta données afin de l'adapter au format cible. 

🚀 Tu veux aller plus loin ?
Maîtrise l'IA et l'automatisation pour créer du contenu et devenir plus efficace.
👇 Rejoins le Club SMART👇
https://www.skool.com/club-smart

voici les outils utilisés pendant la vidéo : 
Make : https://www.make.com/en/register?pc=nocodeagency 
Airtable : https://airtable.com/invite/r/imtpOjSB
Xano : https://airtable.com/invite/r/imtpOjSB (-10% sur l'abonnement avec ce lien)

-----------------------------------------
Je m'appelle Thomas, je suis product Builder. 
Je peux t'accompagner dans la mise en place de solutions no-code : applications sur mesure, e-commerce, crm, automatisation des process etc..
voici mon profil linkedin : https://www.linkedin.com/in/thomas-richard-48212618/

_________________________________________ 
Suivez ces liens pour en savoir plus: 🔗 👇

Découvrir gratuitement Smartsuite: 
https://partners.smartsuite.com/zxd28egq7wow

Découvrir Make :
https://www.make.com/en/register?pc=nocodeagency 

Vous avez besoin d'aide? Je peux certainement vous aider!
https://tidycal.com/ncanoumea/conseil-en-automatisation

Outils de prise de notes des visio conférence par IA :
https://app.fireflies.ai/login?referralCode=IOKsYd3ByI
(-10% sur l'abonnement)
_________________________________________
```

## Transcription

Sous-titres automatiques de YouTube, non corrigés.

dans cette vidéo je vais te montrer comment j'utilise make pour migrer de la donnée depuis ATABLE vers Xano avec des bases qui n'ont pas du tout la même structure donc là c'est mon cas personnel mais évidemment cet outil là peut être utilisé pour n'importe quelle migration de données et c'est super puissant parce que ça fait gagner un temps fou je te montre tout de suite une petite démo alors j'ai ici ma base de données sur rtble qui a une structure particulière avec pas mal de données j'ai ma base ici de sur Xano j'ai pour l'instant euh c'est le test que je viens de réaliser j'ai j'ai quelques j'ai quelques lignes j'en ai 7 euh le scénario que j'ai créé en traite 5 pour le moment je vais te montrer jeen ajouté cinq autres et ici j'ai une roule de une route de une route de fallback c'estd une route qui va traiter mon mon les cas d'erreur éventuel que j'ai identifié donc euh voilà c'est terminé j'ai normalement maintenant cinq nouveaux éléments je rafraîchis et voilà j'ai ces cinq éléments qui viennent de s'ajouter maintenant que la démo est créée on va je vais te je vais te remontrer la vidéo pas à pas pour pour te montrer comment j'ai fait donc récemment je me suis penché sur Xano pour l'utiliser comme backend de mes applications j'utilisais pas mal airtable en tout cas dans dans dans le cas précis je voudrais migrer une base de données ici qui concerne des promptes sur Léonard ard je voudrais l'émigrer vers une base de données Xano que je suis en train de créer donc concrètement je fais un petit peu de ménage dans le dans toutes les datas que je j'enregistre euh donc j'ai une structure de données qui est différente dans Xano de de ATABLE donc j'utilise make ça va me permettre déjà Deah de pas le faire à la main donc de gagner du temps mais également de transformer la donnée pour l'adapter à la source enfin la à la cible euh qui est cette structure là donc donc j'utilise make première étape c'est que je alors j'ai déjà commencer un scénario ici on va recommencer de zé donc première étape je mets un un module make pardon un module rtable qui va me permettre d'aller chercher ma base de données pour l'instant je limite à 10 je pourrais même limiter à 5 puisque je vais surtout faire des des tests au départ donc je le fais tourner une fois je vérifie hop ça me sort bien c bundles avec à chaque fois les informations présente dans la table donc étape suivante c'est créer un gison euh un gison que je vais réutiliser en fait dans ensuite dans un appel à pay que qui me permettra de d'enregistrer dans dans Xano donc je choisis ici un create Gon je viens le lier à rtable et là je dois choisir une structure de données cette structure de données pour l'instant enfin je la connais oui je la connais puisqu'elle est dans elle est dans Xano mais je ne l'ai pas sur je ne l'ai pas sur Make donc ce que je vais faire c'est que je vais l'ajouter et là c'est vraiment puissant alors soit on va venir ajouter à chaque fois chaque item euh pour venir dire par exemple ici j'ai le titre c'est du texte et cetera ça c'est la méthode pénible on a une méthode qui est beaucoup plus simple qui va être générée donc pour générer il demande un extrait du gison de réponse ce que j'ai fait c'est que j'ai pris ici ma base de données Xano alors je je virer cela hop et euh donc j'ai fait la structure idéale la structure dont j'avais envie euh voilà j'ai un exemple dans ma base de données des exemples assez assez complets ici je vais dans la gestion de mes API sur je vais chercher dans le default ici j'ai j'ai toutes les API qui sont lié à la base de données à la table Prom donc j'ai mon get Proms donc là je vais récupérer toute la liste alors ce que je vais faire c'est que je clique ici donc là on peut éditer les fonctions de la p je trouve ça vraiment top je copie LEP de l'URL de laap pardon je joue je fais l'appel à la PI et là je vois qui je vois la réponse que me renvoie la p et globalement ce que je veux ici là c'est un objet en fait il y deux fois le même objet c'est un objet qui qui représente le promp et toutes les informations j'ai envie d'avoir donc je copie euh ce cette partie du gison et là je vais retourner ici dans make et je vais copier ce gison et là je fais générer et la magie pouf là il m'a créé tout euh tous les éléments alors je vais quand même vérifier un petit peu ce qui m'a mis donc name ok c'est bon c'est de l'ID c'est du number très bien euh c'est du number très bien oui name j'en ai pas besoin parce que l'ID pardon j'en ai pas besoin puisque c'est c'est Xano qui va le générer et ATABLE le connaî pas la date de création c'est pareil pas besoin de la mettre le titre ok c'est du texte parfait l'ID de l'outil c'est du number très bien par défaut je vais mettre un ou mettre le nom du le le promp du texte très bien négatif prompt très bien des tags là c'est un lien vers une base de données sera du number oui preset style c'est du texte parfait élément c'est donc un arrêt donc une liste avec élément texte OK et poids c'est du number alors j'ai number binary ok très bien donc distingue pas les les integers des des virgules enfin des chiffres virgulle parfait ok donc j'ai tout ça donc il me reste quand même un truc à faire c'est nommer cette structure donc là je vais mettre je vais mettre promtable Xano hop euh non je pas mettre ça jeis mettre pompe Xano en fait tout simplement donc ça c'est quelque chose dont je pourrais me resservir dans une autre automatisation euh l'intérêt c'est que si j'ai une autre source de données car table et que je veux euh intégrer des données dans Xano bah j'ai plus qu'à réutiliser je peux réutiliser déjà cette structure là donc voilà j'ai choisi ma structure donc c'est là il me propose les différents champs et là comme d'habitude je j'ai juste à venir mapper ici le titre alors l'ID de l'outil alors pour l'instant j'en ai qu'un dans ma base de données donc est-ce quees lunettes euh modèle c'est pas ça tac tac tac bon c'est pas grave je vais mettre un par défaut je viendrai compléter après Prom je vais chercher le promp le négatif promp il est ici les tags JUSE que je récupère l'ID hop sur le preset style on est ici voilà et ça alors là les éléments les éléments euh c'est un truc un peu plus compliqué faut que je recrée un gison donc je vais pas le faire dans cette vidéo là je le ferai euh je le ferai derrière euh donc je mets ok maintenant une fois que j'ai ça une fois que j'ai ça je fais ici un appel HTTP qui va faire une requête et là c'est magique euh on retourne aussi sur Xano au niveau des API et donc sur le sur le le sur la la table prompte on a naturellement un premier un premier end point qui va être le poste donc là ce qui fait c'est add record et alors peut-être que voilà ici je pourrais créer moins un endp on va essayer tiens donc là ici une ici il y a une loupe donc une boucle l'idée c'est que non je je vais faire en deux temps en fait avec cette boucle là je pense qu'on peut sortir tous les records d'IR table et en un coup venir les intégrer dans euh dans Xano donc l'intérêt c'est de d'économiser les les crédits de d' table de faire moins d'opérations moi j'ai pas trop souci là parce que j'en ai vraiment pas mal mais pour le fun je vais je vais faire de choses je d'abord créer ce j'ai utiliser ce endp là et après j'en créer un autre et donc ici je suis sur le donc sur ce endp j'ai le je peux copier son URL je retourne sur Make je trompe à chaque fois de côté hop ici du post du header pour l'instant c'est pas sécurisé à terme il faud que ce le soit et la body type je v mettre du je mettre du r Je mettre ici du Gon et je vais chercher le Gon qui est généré sur le premier module et donc on a un premier g alors petit truc si c'est du one shot on pe arrêt là là moi je pense que je vais le faire en plusieurs coups euh et en fait la base de données ATABLE est alimenté déjà par un autre scénario donc j'ai pas envie de tout changer d'un coup je veux continuer à les synchroniser en même temps et là ce que je vais faire du coup c'est que je vais sur airtable et je vais mettre à jour un record et là euh ce que je vais faire c'est que je vais récupérer donc je vais chercher pouf la table la même base je vais aller chercher la même table qui est ici est prompte hop je récupère l'ID que j'ai en entrée et là ici j'ai mis un élément qui va être sur la fin qui va être synchronisé oui donc concrètement ça ça va ça me permet de dire ok cette cet enregistrement là il a été traité il est donc Zano donc concrètement ça c'est le scénario idéal mes données sont parfaites euh mes données sont parfaites et je je je mets à jour toutes les datas de rtable donc Zeno euh il va y avoir des cas où je j'ai pas les informations suffisantes jusqu'à présent j'utiliser le le la sauvegarde d'image pour afficher les images sur mon application donc les les images sont directement dans table là ce que je vais faire c'est aller chercher uniquement l'URL de l'image qui est généré dans Leonard do donc sur un outil mais ça c'est mon cas vraiment personnel euh et je vais le c'est ça que je vais proposer dans enfin que je vais utiliser dans Xano puis dans mon application pour afficher l'image et du coup j'utilise pas la même chose donc certaines images n'ont pas l'information dans rtable et ça il va falloir que je traite à la main plus tard que je redresse la donnée mais ce que je vais faire ici c'est que je vais identifier ces cas-là et je veux je ne vais pas les traiter par contre je vais les toper dans airtable comme étant des des choses à retravailler donc là justement je vais dupliquer ce modile là hop parce que c'est exactement ce que je veux faire c'est mettre à jour une info sur rtable et en le liant à cet item là je en liant à cet item là je crée un routeur donc là c'est le scénario idéal et alors ce que je vais faire c'est que je vais identifier cette route là comme un fallback ça veut dire que il va la jouer seulement s'il n'a pas réussi à jouer l'une des autres des autres branches et du coup ce que je fais donc je mets fback et je mets ça c'est pour moi c'est pour plus tard je faut toujours un peu documenter et là je vais mettre que c'est cas idéal donc en gros ça pourquoi je fais ça pourquoi je le fais comme ça c'est que ça me permet de traiter ça me permet de traiter d'abord tous les cas d'erreur poss possible et ensuite s'il y a pas de cas d'erreur leback on fait le cas nominal donc là je supprime le lien et je le remets pourquoi ça me permet alors a mon premier cas qui vient qui vient embêter mais là ça me permet de bah de de faire jouer d'abord en premier je suis pas sûr de le faire comme c'est un fallback mais ça en fait le l'ordre de des branches va se faire du haut vers le bas et comment ça marche nativement table prend le la branche qui est la plus récente en bas donc enlevant les branches ça permet deordonancer je crois qu' façon de faire je fais l'ancienne et donc ici je récupère ce cas là et ce que je fais c'est que je le check je mets pas synchro par contre je le mets à retravailler oui ok et c'est alors c'est dans quel cas moi c'est quand le cdnett ici et vide donc euh do not existe donc il va vérifier que j'ai j'ai l'information si je ne l'ai pas il me dit il me tope cet enregistrement en disant faut le retravailler si je l'ai il va l'enregistrer dans Xano et si j'identifie un autre cas de d'erreur c'est aussi pour ça que j'y vais 10 par 10 au départ c'est euh ça me permettra de de créer une autre branche ici et de traiter la donnée donc on a fait ça maintenant j'avais ce cas à gérer al le mettre là donc j'ai mon j'ai mon scénario qui est prêt on va le jouer pour voir ce qui se passe donc là il va me chercher mes 10 il a récupéré 10 enregistr ah non 5 j'avais limité à 5 et bon ils sont tous passés en mode normal donc on va aller vérifier ici sur Xano sur la database trop de truc ouvert encore hop et là je vais chercher les prompts et j'ai bien euh alors oui j'avais deux cas d'exemples et j'ai bien les les derniers alors c'est les infos ça c'est ces infos là je les avais pas et ça c'est un truc que je mets en place actuellement donc c'est pareil c'est normal que ce soit vide ce qui me reste à traiter c'est les éléments je vous le mets pas dans la vidéo parce que c'est complexe il faut faire pas mal de manip avant pour recréer un gison qui va permettre de de présenter ces éléments là B on le vois ici hein donc ça voilà c'est ça que je doisréer d'abord dans euh c'est d'abord ça que je dois créer dans dans make pour pouvoir le l'alimenter ici donc ça c'est c'est ma partie je le ferai et voilà ce que je voulais vous montrer c'est simplement que bah rapidement euh rapidement je enfin voilà j'ai passé là un quart d'heure et encore j'ai mis plus de temps que normal euh maintenant j'ai euh j'ai 500 j'ai à peu près 500 promptes euh j'ai plus qu'à virer le le filtre ici et euh et à jouer le scénario et je je bascule toutes mes information euh dans dans Xano donc super outil pour permettre de transformer la donnée et de migrer des données vers une autre euh si la vidéo t'a plu n'hésite pas à t'abonner euh à t'abonner sur la chaîne euh je vais me remettre à poster beaucoup de de contenu sur le le No code et euh je te dis à bientôt

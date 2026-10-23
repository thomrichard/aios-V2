---
type: video
resume: Tu ne sais pas quel trigger choisir entre Make et Airtable pour lancer tes automatisations ?
statut: publie
domaine: contenu
maj: 2026-10-22
liens: [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios.md, 2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a.md]
---
# Automatise Airtable avec make : tous les déclencheurs expliqués

- Vidéo : https://www.youtube.com/watch?v=wkp4jSrT3Ps
- Miniature : https://i.ytimg.com/vi/wkp4jSrT3Ps/sddefault.jpg
- Publiée le : 2025-09-22
- Durée : 21 min 34 s
- Playlists : Airtable : tuto et systèmes no-code
- Tags : airtable, airtable automation, airtable make connection, airtable scripting, airtable tutorial, automation builders, automatiser airtable, connexion airtable make, déclencheurs scénarios make, formation airtable, formation make, mailhook make, make, make automation, make webhook, make.com tutorial, scenario make, script airtable, trigger make airtable, webhook airtable, webhook make

## Stats

YouTube Analytics, données jusqu'au 2026-10-20. Revenus estimés en dollars US. Depuis le 27 août 2026, YouTube compte une vue dès la première image : pour comparer avant et après, regarder les vues engagées.

| | 7 premiers jours | 30 premiers jours | Depuis la sortie |
|---|---|---|---|
| Vues | 54 | 109 | 690 |
| Vues engagées | 54 | 109 | 647 |
| Heures regardées | 1,3 | 4,4 | 42,8 |
| Abonnés gagnés | 1 | 1 | 12 |
| Revenus estimés | 0,00 $ | 0,00 $ | 0,41 $ |
| Durée moyenne regardée | | | 3 min 57 s (18,4 %) |
| J'aime · commentaires | | | 7 · 0 |

## Liens

- Cite : [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios](2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios.md)
- Cite : [2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a](2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a.md)
- Description : https://clubsmart.s.gy/masterclass-aios-catalogue
- Description : https://clubsmart.s.gy/tuto-claude-catalogue
- Description : https://www.skool.com/club-smart
- Description : https://www.youtube.com/@thomasrichard1978?sub_confirmation=1

## Description

```text
🎓 MES MASTERCLASS (pour aller au fond des choses) :
⭐ AIOS avec Claude — construis ton système IA complet, pas à pas (1h17) :
https://youtu.be/FwnIB-RbC-E
→ Toutes les ressources de la masterclass (gratuites) :
https://clubsmart.s.gy/masterclass-aios-catalogue
→ Claude : tutoriel complet, de débutant à utilisateur avancé (1h16) :
https://youtu.be/qefrfyxQOEY
→ Toutes les ressources du tutoriel (gratuites) :
https://clubsmart.s.gy/tuto-claude-catalogue

Maîtrise l'IA et l'automatisation pour créer du contenu et devenir plus efficace.
👇 Rejoins le Club SMART👇
https://www.skool.com/club-smart

Tu ne sais pas quel trigger choisir entre Make et Airtable pour lancer tes automatisations ?  
Webhook, Watch Records, Scripts, Automations… je t’explique tout ce que tu dois savoir.

📌 Dans cette vidéo :
00:00 – Intro  
00:42 – Présentation des différents triggers  
03:20 – Avantages/Inconvénients  
06:10 – Démo d’un trigger scripté dans Rtable  
09:00 – Accès au script et à la communauté

---

🎁 Le script Airtable présenté dans la démo est disponible gratuitement dans ma communauté Smart Club sur Skool :  
👉 https://www.skool.com/club-smart

Tu y trouveras :
✅ Des tutoriels détaillés  
✅ Des fichiers JSON prêts à l’emploi  
✅ Des systèmes Build-It-Yourself à reproduire ou personnaliser

---

📚 Liens utiles :
- Make (plateforme d’automatisation) → Make
- Rtable (base de données visuelle) → Airtable

📩 Pour toute question → thomas@thomrichard.com

---

🔔 Abonne-toi pour ne rien manquer :  
https://www.youtube.com/@thomasrichard1978?sub_confirmation=1
```

## Transcription

Sous-titres automatiques de YouTube, non corrigés.

### 0:00 · Intro

Tu utilises Airtable et Make pour créer des systèmes complets d'automatisation mais tu ne sais pas toujours quel trigger choisir pour déclencher tes automatisations, alors cette vidéo est faite pour toi. Je vais d'abord t'expliquer quels sont les différents types de triggers et comment on peut les exécuter. On fera ensuite des démos concrètes pour que tu puisses maîtriser à la perfection le déclenchement de tes scénarios sur Make. On va commencer avec les déclencheurs natifs de Make. Ici, tous les scénarios sont programmés. Make va venir interroger Airtable toutes les 15 minutes, toutes les heures, toutes les journées, en fait, c'est vous qui décidez. Le premier module, c'est le module Watch Records. Il permet de détecter les nouveaux enregistrements ou les modifications d'un enregistrement à partir d'une date précise. Donc tu peux

### 0:42 · Présentation des différents triggers

soit utiliser la date de création, notamment pour les nouveaux. Tu peux utiliser le champ Last Modified Date pour récupérer tous les tous les tous les enregistrements qui ont eu une modification depuis la dernière fois que tu as regardé, mais tu peux également cibler davantage avec ce module et avoir une Last Modified Date sur des champs spécifiques. Et donc à chaque fois qu'on arrive sur le créneau que tu as indiqué, Make va aller regarder les bases Airtable et il va comparer par rapport à la dernière fois qu'il est venu toutes les dates euh euh indiquées, paramétrées ici, qui sont ultérieures à cette date-là. Donc ultérieure à la date à laquelle il est venu la dernière fois. Une autre façon de procéder est un Search Records. Donc c'est tout simplement à la demande, en fonction du créneau que tu as que tu as défini, tu vas aller rechercher des records Airtable. Donc tu peux le faire sur des vues ou directement dans le module en faisant des requêtes de filtres directement dans le module. On va voir maintenant comment ça se passe sur ces différents outils. En regardant maintenant comment gérer les triggers natifs de Make pour Airtable. Donc j'ai ici une base de données qui est euh ma veille YouTube. Donc j'ai créé un système de veille YouTube qui me permet de recevoir chaque jour euh un un des différentes vidéos des créateurs que j'ai envie de suivre.

Et alors sur cette table, j'ai créé une date de création. Cette date de création, on va s'en servir tout de suite pour aller tester le module Watch Records. Donc j'ai créé un scénario démo trigger. Donc je commence par aller chercher la base de données, la bonne table, ici ça va être les vidéos et là sur ce module, on doit donc choisir un trigger field de type date. Donc c'est là où il nous parle de created time ou last ou last modified time. Donc on va faire ici date de création. Pour l'instant, je n'ai que celui-là. Ici, en label, on peut utiliser le titre. Là, comme d'habitude, je vais pouvoir choisir une un nombre de limites. Je peux limiter aussi un nombre de vues. Donc comme pour le search, je peux limiter un une vue ou alors faire une formule qui va me permettre de filtrer euh ma requête et d'avoir uniquement les records qui m'intéressent. À l'initialisation, on va générer la date de référence de pour Make. En fait, il va comparer cette date-là aux dates, donc là la date de création puisque j'ai choisi la date de création, pour savoir quel record il doit récupérer. Et donc on peut choisir à partir de maintenant, on peut spécifier une date, donc comme par exemple hier.

Euh on peut choisir de récupérer tout ou de choisir manuellement. Globalement, c'est ces deux-là qui nous intéressent. Pour le pour la démo, on va prendre une date spécifique et on va mettre par exemple il y a euh une semaine. Donc je veux

### 3:20 · Avantages/Inconvénients

tous les records de la semaine dernière. Je sauvegarde. Maintenant, on va voir comment utiliser le last modified. Donc je vais ajouter un champ date et heure de la dernière modification. Et là, donc comme expliqué précédemment dans le schéma, on peut soit aller chercher tous les champs modifiables, donc quelle que soit la modification, vous récupérez le le record, ou alors aller sur un champ spécifique. Là pour la démo, on va faire que le champ spécifique. Je vais par exemple prendre le hashtag. Il est là et je crée le champ. Donc ici, je vais choisir la dernière modification en en trigger field, je valide et je fais tourner mon module. Et donc là, effectivement, il a trouvé une sortie et j'avais ajouté deux tags, il y avait no code et intelligence artificielle et c'est c'est bien ça qu'on retrouve ici. Donc voilà l'utilisation du watch records globalement, c'est très intéressant pour tout ce qui est synchronisation, tout ce qui est déclenchement par un changement d'état et cetera.

On va commencer par regarder le module search record de Airtable. Donc c'est le certainement l'un des modules les plus utilisés. Donc je vais aller chercher une base de données. La base de données que je vais utiliser c'est ici une base qui me sert à ma veille YouTube, j'ai créé tout un système qui permet de de récupérer des vidéos YouTube de créateurs que je suis et avoir chaque jour chaque matin, j'ai un résumé des dernières vidéos créées, ce qui me permet de gagner énormément de temps sur ma veille ou tout simplement de la faire parce que sinon j'aurais pas eu le temps de la faire. Donc j'ai ce champ search record. Je vais me connecter à la bonne base de données. Donc je vais chercher la veille YouTube. Je vais chercher les vidéos. Alors ici, j'ai plusieurs leviers. Je peux choisir de limiter le nombre de réponses que j'obtiens. Donc si je sauvegarde, je vais avoir 10 réponses, les 10 premières. Ici, voilà, j'ai bien 10 bundles. Je peux créer ici une formule. Alors on a par exemple ici on a ici par exemple la la la durée de la vidéo, on va se servir de ce champ-là.

Donc on va saisir une formule, on a ici un exemple qui est qui permet de savoir quel est le bon format donc on met entre crochet et donc utiliser durée supérieure à 100. Et 100 c'est un nombre donc je vais le mettre comme ça. Et donc, normalement, il doit me sortir les 10 résultats qui 10 résultats dont la durée est égale à 100. Donc, je vais prendre le 10e. Euh durée durée ici, elle est à à 713 et ici, elle est à 772. Donc, effectivement, on a bien réussi euh la formule respectée et donc, Airtable est allé me chercher les records qui correspondent à

### 6:10 · Démo d’un trigger scripté dans Rtable

cette formule. On peut, bien sûr, trier sur différents champs. Donc là, on pourrait trier, par exemple, sur la durée, toujours pareil, durée euh descending ascending et moi, je ce que je trouve le plus intéressant, c'est de filtrer par les vues parce que, finalement, le finalement, le le la formule que j'ai faite, elle est pas toujours facile à faire. Ici, j'ai pris un truc très simple, mais c'est pas toujours facile. Et en fait, c'est peut-être plus facile de venir euh ici, faire une vue automatisation. Et donc, là, je vais gérer mes filtres directement dans Airtable et on va prendre, par exemple, la durée. La durée est supérieure à 100. Et euh les tags contient euh no code. Voilà. Donc, ça, ce serait ce serait beaucoup plus compliqué à écrire comme ça euh par formule dans dans Airtable. Et surtout, si j'ajoute un jour une une modification à faire, c'est plus simple de venir le faire ici dans Airtable que d'aller retourner dans mon scénario et euh modifier euh modifier tout ça.

Et donc, globalement, bah à chaque fois qu'une à chaque fois qu'une vidéo va rentrer là-dedans et que je vais jouer ce scénario, je vais enlever la formule, je vais aller chercher la nouvelle vue qui est vue automatisation et il va me sortir Donc, je fais run this module only. Et il va me sortir les euh les cinq bundles qu'on a vus euh juste avant. Voilà, le 1er module euh search, le plus simple d'Airtable. Et pour le déclencher, on peut venir le jouer manuellement ici, c'est plus une automatisation, mais on peut également ici venir choisir les inter- les intervalles à quel on veut euh on veut le faire et donc on peut choisir une fois tous les jours, tous les mois, par les jours du mois, les les jours euh pardon les jours de la semaine, les jours du mois, et cetera et cetera. On peut arriver à quelque chose d'assez d'assez fin. On peut même spécifier une date bien précise, par exemple si vous avez des rapports à faire à une date bien précise ou des choses comme ça. Donc le module est souple, euh basique, mais c'est l'un de ceux qui sont les plus utilisés derrière.

Je vais maintenant vous parler des triggers qui déclenchent automatiquement le scénario à partir du moment où les où on les active. Donc Donc c'est tri- Le 1er des triggers, ça va être la création d'un bouton euh sur Airtable qui va déclencher le webhook quand on va venir cliquer dessus. Donc sur ce webhook, on va pouvoir passer différents paramètres. Par exemple le record ID de la ligne sur laquelle on vient de cliquer, ce qui nous permet ensuite, grâce à un module euh get record d'Airtable, de récupérer toutes les informations de ce de cet enregistrement. On peut également envoyer des paramètres très spécifiques. Par exemple si vous n'avez pas ensuite

### 9:00 · Accès au script et à la communauté

besoin de remettre à jour euh le le record, vous pouvez très bien envoyer euh bah là on parlait de tout à l'heure j'avais l'exemple des vidéos, on pourrait envoyer euh le titre, on pourrait envoyer euh la durée, les tags et cetera, ce qu'on veut, euh dont on va se servir ensuite dans le le scénario. Le 2e trigger, ça va être une automatisation Airtable qui va permettre de déclencher un webhook. Donc cette automatisation, on va la jouer sur un changement de de valeur d'un champ. Donc par exemple sur un statut, on peut avoir une action liée à différents statuts et à chaque fois qu'on va changer l'action, on va déclencher le webhook euh correspondant. Ça pourrait être également une case à cocher quand je vais venir cocher euh mon mon record, ça déclenche le scénario. Le dernier euh trigger, c'est la form view. Donc ce formulaire est partagé sur le web, euh ça donne l'accès à d'autres personnes extérieures à l'entreprise euh à l'entrée de données et quand on valide le formulaire, on a également une mini-automatisation qui va déclencher un mail ou mais on pourrait très bien aussi utiliser cette méthode-là avec le web.

Donc cette vue par exemple, euh cette cette façon, elle est par exemple très utile si vous avez un champ externe pour euh pour inscrire un client. Par exemple, je voulais donner un lead magnet. Vous euh il remplit le formulaire avec ses informations et on va déclencher un scénario qui va reprendre ces informations et aller les mettre dans un CRM. Donc maintenant, on va voir comment ça marche dans Airtable et Make. On passe tout de suite sur ces deux outils. Donc on va commencer par le bouton. Pour ça, je vais créer un webhook. Donc je crée ici un custom webhook. Je vais euh en créer un nouveau que je vais appeler démo euh triggers. Je fais sauvegarder. Voilà le l'URL du webhook. Cet URL, je vais la copier ici et on va voir que le module attend euh de d'avoir une première réponse. Donc je vais ici sur Airtable, je vais ajouter un champ et je vais chercher par exemple le bouton. Donc je peux je peux mettre un scénario. Donc là, je suis sur ma ma veille.

Je vais mettre euh je vais mettre analyse du contenu. Je peux choisir la forme du bouton, je vais le mettre en vert. Ici, on a l'URL. Alors pour l'URL, vous avez deux possibilités. Moi auparavant, je créais une un champ euh formule où je faisais une concaténation entre l'URL et les paramètres que j'avais envie de passer. Maintenant, je le fais directement. Donc c'est du texte. Donc on ouvre les deux le double guillemets, je viens coller l'URL. Je mets un point d'interrogation afin de de passer de ces paramètres. Je vais mettre ID égal Ensuite, le champ je viens le concaténer donc je mets un champ et commercial et ici, je vais chercher euh le la formule qui s'appelle record ID qui est là. Je crée le champ. Et j'ai maintenant un bouton à chaque fois. Donc par exemple, si je veux ré-analyser le contenu de cette ligne-là, je vais cliquer ici et ça me déclenche le webhook. Alors, l'inconvénient de cette méthode, c'est qu'on a ici cette ça ouvre cette URL.

On voit bien que le record ID est passé, on voit qu'il y a une réponse du webhook. Mais ça crée un nouvel onglet. Donc pour ça petit euh tips au passage, on va reprendre les webhooks, on va mettre une réponse. Donc c'est le message Donc en fait, le webhook envoie un message avec des infos et il attend un retour. On pourrait le mettre à la fin pour dire que le scénario s'est bien passé. Là en l'occurrence, c'est pas c'est pas le cas. C'est pas ce qu'on a envie de faire et donc là, je vais mettre un petit script. Moi, j'ai fait je me suis créé un raccourci avec Text Blaze qui me permet ici d'ajouter directement ce euh ce texte-là. Donc le texte, vous le retrouverez dans les commentaires euh ou sur ma communauté qui s'appelle euh Automation Builder. Et ce texte, ben va permettre de euh de fermer directement mon onglet. Donc ici je fais ça et maintenant, ce que je vous disais, c'est que je peux faire un module Airtable. Je vais faire un get a record. Je vais pouvoir aller chercher ici ma base de données. Évidemment, la bonne table et le record ID, je le retrouve à cet endroit-là.

Donc je sauvegarde, on va maintenant re-tester l'intégralité du parcours. Donc je viens fermer cette fenêtre là, je viens ici. Donc maintenant, je vais appuyer sur n'importe quel contenu. Donc on Pardon, je vais pas utiliser n'importe quel contenu, je vais utiliser ici par exemple chez un prompt generators. Je fais analyse du contenu. Ça ça a ouvert l'onglet mais ça l'a refermé immédiatement. Et maintenant, je vais voir le résultat. Et ici, j'ai prompt generators from TV now. Donc j'ai bien récupéré le le record sur lequel j'avais travaillé et maintenant, je peux continuer mon scénario et faire ce que je veux avec ces informations. Donc voilà pour le bouton. On va maintenant parler des automatisations. Et pour ça, on va commencer par le form view qui est le qui peut-être le plus simple. Donc le form view, j'ai fait ici un un formulaire que j'ai appelé form d'immo. On a tout J'ai pas cherché forcément à l'optimiser, c'est pas c'est pas le but ici. Je suis sur l'onglet automatisation d'Airtable. Je vais créer ici un nouveau scénario.

Ici, je vais ajouter un déclencheur. Et j'ai le déclencheur quand un formulaire est envoyé. Quand un formulaire est envoyé, donc là, je vais chercher le tableau vidéo. Je vais sélectionner mon formulaire. Alors je suis ici. Je fais tester et je vais choisir le record que j'ai envie d'utiliser. Et maintenant, je peux faire une Je peux ici faire une action. Donc le plus simple, c'est d'envoyer un email. Et là, ce qu'on va pouvoir faire ici, alors je vais mettre en dessous, je vais créer un nouveau module. Et cette fois, on va parler de mail hook. Je fais démo trigger. Je sauvegarde et là, en fait, à la place de me donner une URL, il me donne une adresse email. Donc, on va envoyer le mail à cette adresse email. Et là, j'ai deux champs différents. Donc j'ai deux endroits sur lesquels je vais pouvoir envoyer des informations. Par exemple, ici, je pourrais mettre le record ID dans l'objet.

Airtable record ID. Et ici, potentiellement, ben je peux venir créer, pourquoi pas, un JSON avec toutes les informations dont j'ai besoin ou faire ce que je veux. Donc là, en l'occurrence, on va mettre test, on s'en on s'en fiche un petit peu. Euh moi, à partir du moment où j'ai le record ID, je peux récupérer toutes les autres informations. Mais vous voyez l'idée, on pourrait potentiellement euh ici euh ben mettre toutes les informations du record en format JSON, ce qui permet d'éviter d'avoir à euh faire le get ID. Donc je génère un aperçu et voilà ce qui va envoyer. Donc l'intérêt de cette méthode également, c'est qu'on va avoir à chaque fois le euh l'historique dans une boîte Gmail. Donc moi, je m'en sers par exemple pour un client qui génère des bons cadeaux. Et à chaque fois à chaque fois qu'il fait une demande de bon cadeau, l'im- un email part avec le le le résultat du formulaire. Donc combien d'ai- de combien de bons cadeaux, quel montant, quel client, et cetera et cetera. Donc ça permet d'avoir un historique dans la boîte email de tout ce qui s'est passé. C'est c'est quand même appréciable. Et donc ici, ce qu'on va faire, c'est qu'on va je vais mettre là, je vais mettre un run this module only.

? Oui, alors j'ai pas sauvegardé, donc je je sauvegarde. J'ai fait run this module only. Donc il faut activer euh l'automatisation et là, je vais ouvrir le formulaire. On va faire test démo mail hook. Euh URL, je vais mettre du texte bidon. On s'en fiche un peu. Je fais envoyer. Et je viens voir ici. Alors, l'inconvénient, c'est que ça prend un tout petit peu plus de temps, vous voyez, c'est quand même assez rapide. Et donc j'ai ici un output qui est qui me permet d'avoir là, j'ai le record ID. Donc je fais de la même manière venir cloner ici ce Airtable et je peux aller chercher ici le record ID et continuer mon scénario. On va maintenant passer à la forme la plus euh peut-être la plus compliquée euh du scénario qui est le changement enfin l'utilisation de l'automatisation avec un script pour déclencher l'envoi un mail pour un webhook. Donc je garde ce webhook là et c'est ça que j'ai utilisé. On va tout de suite sur Airtable.

Alors, pour le dernier, globalement, je crée ici une vue avec le statut de des différents champs. Donc j'ai deux statuts possibles. J'ai à approuver et un statut sauvegarde Rag. Donc l'idée, c'est de d'utiliser ce changement de statut pour que quand je clique sur sauvegarde Rag je déclenche un envoi un une automatisation qui va venir enregistrer euh le contenu du record ou ce que j'ai envie d'enregistrer du record dans un système de Rag, donc une base de données euh vectorielle, ce qui me permettra ensuite d'utiliser un chatbot pour le pour l'interroger. Donc pour ça, on va utiliser une automatisation Airtable. J'ai choisi "lorsqu'une entrée correspond aux conditions". Je vais chercher le tableau vidéo et les conditions, ça va être quand le statut est sauvegarde Rag. Donc à partir donc on déclenche l'action, c'est vraiment le le trigger, c'est ça, c'est je change mon statut en euh dans celui que je veux. Je prends un record pour euh la démo.

Et là, ici, on va venir jouer un script. Donc exécuter le script. Alors, pour le script, on va d'abord créer des variables. Et la variable qu'on va créer ici, c'est le record ID. Alors, et sa valeur, donc c'est on on va chercher ici la première étape de l'automatisation et on va chercher le record ID. Donc pour le code, voici le script à utiliser. Je vous le mettrai dans les commentaires ou dans les ressources dans la communauté. Et globalement, on a ici le le Airtable record. On lui indique qu'on va venir euh rechercher euh de qu'on va venir créer cette variable qui est le record ID et ensuite on construit l'URL avec ici le webhook qu'on a récupéré de Airtable. Et il va chercher le euh la valeur du la valeur du record du record ID. Donc surtout, n'hésitez pas à vous aider de de ChatGPT pour créer les pour créer vos différents euh pour créer vos différents scripts. Donc ce script est disponible dans mon groupe Automation Builder sur School. Tu le retrouveras dans les classrooms au niveau des ressources gratuites.

Le lien est en description de la vidéo. Par contre, il faut vraiment s'assurer que que ChatGPT ne va pas faire d'erreur. Donc par exemple ici, par exemple ici, sur cette variable, il m'avait mis comme ça record ID. Or moi, j'ai appelé la variable rec ID. Donc il faut que je corrige pour que mon pour que mon script marche. Donc maintenant, on va faire une démo. Ici, je lance le scénario. ? Parce qu'il n'est pas encore activé. Et là, je vais aller directement dans les données aller voir ici le statut. Je vais prendre celui-ci et je vais mettre sauvegarde rag. Et on va voir ici que ça va se déclencher. Voilà, tout tout simplement, ça se déclenche. Et je récupère euh je récupère ici euh le bon euh le bon record. Voilà, tu connais maintenant toutes les possibilités pour déclencher un scénario entre Airtable et Make. Mais si tu veux aller plus loin, je t'invite à rejoindre mon groupe School Automation Builder. C'est un groupe qui est complètement gratuit dans lequel tu vas pouvoir échanger avec des passionnés d'automatisation et qui veulent en en une source de revenus récurrente. Tu peux trouver des ressources intéressantes sur la création de système complet d'automatisation.

Tu vas trouver des tutos pas à pas. Tu vas trouver des ressources gratuites comme celle-ci et notamment l'exemple de prompt dont je t'ai parlé dans le dans ce tutoriel pour automatiser l'appel d'un webhook directement depuis Airtable. Donc j'espère bientôt te retrouver sur ce groupe Automation Builder. En attendant, je te dis à bientôt pour la prochaine vidéo.

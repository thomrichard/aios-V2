---
type: video
resume: Dans cette vidéo, je vous montre comment transformer un nombre écrit en chiffres en un nombre écrit en lettres. Lorsqu'on édite une facture par exemple, il…
statut: publie
domaine: contenu
cree: 2023-02-03
maj: 2026-10-22
liens: [comment-j-ai-automatise-ma-vie-avec-un-aios-26-07.md, claude-tutoriel-complet-pour-passer-de-debutant-a-26-05.md]
---
# [TUTO] convertir un chiffre en lettres dans un process d'automatisation avec Make

- Vidéo : https://www.youtube.com/watch?v=_kOhvfvJsz0
- Miniature : https://i.ytimg.com/vi/_kOhvfvJsz0/maxresdefault.jpg
- Publiée le : 2023-02-03
- Durée : 14 min 0 s
- Playlists : Airtable : tuto et systèmes no-code
- Tags : automatisation, chiffre en lettres, facturation, make, nocode, no-code, process automatisation, convertir un chiffre en lettres, facture, facture afficher le total en lettres, automatiser l'écriture de chiffres en lettres, transformer un chiffre en lettre, générer une chiffre en lettre

## Stats

YouTube Analytics, données jusqu'au 2026-10-20. Revenus estimés en dollars US. Depuis le 27 août 2026, YouTube compte une vue dès la première image : pour comparer avant et après, regarder les vues engagées.

| | 7 premiers jours | 30 premiers jours | Depuis la sortie |
|---|---|---|---|
| Vues | 40 | 60 | 709 |
| Vues engagées | 40 | 60 | 709 |
| Heures regardées | 1,2 | 1,5 | 22,1 |
| Abonnés gagnés | 1 | 1 | 10 |
| Revenus estimés | 0,00 $ | 0,00 $ | 0,08 $ |
| Durée moyenne regardée | | | 1 min 52 s (13,3 %) |
| J'aime · commentaires | | | 7 · 0 |

## Liens

- Cite : [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios](comment-j-ai-automatise-ma-vie-avec-un-aios-26-07.md)
- Cite : [2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a](claude-tutoriel-complet-pour-passer-de-debutant-a-26-05.md)
- Description : https://clubsmart.s.gy/masterclass-aios-catalogue
- Description : https://clubsmart.s.gy/tuto-claude-catalogue
- Description : https://www.skool.com/automation-builders
- Description : https://www.make.com/en/register?pc=nocodeagency
- Description : https://airtable.com/invite/r/imtpOjSB

## Description

```text
Dans cette vidéo, je vous montre comment transformer un nombre écrit en chiffres en un nombre écrit en lettres. Lorsqu'on édite une facture par exemple, il faut indiquer le montant en lettres. 
Nativement, les tableurs ne proposent pas cette formule, et les outils d'automatisation non plus. 
Je vous montre donc comment contourner le problème. 
Dans le cadre de ma démo, j'utilise Make (integromat), Airtable et Gsheet.

🎓 MES MASTERCLASS (pour aller au fond des choses) :
⭐ AIOS avec Claude — construis ton système IA complet, pas à pas (1h17) :
https://youtu.be/FwnIB-RbC-E
→ Toutes les ressources de la masterclass (gratuites) :
https://clubsmart.s.gy/masterclass-aios-catalogue
→ Claude : tutoriel complet, de débutant à utilisateur avancé (1h16) :
https://youtu.be/qefrfyxQOEY
→ Toutes les ressources du tutoriel (gratuites) :
https://clubsmart.s.gy/tuto-claude-catalogue

----------------------------------------------------
🚀 Tu veux aller plus loin ?
Rejoins Automation Builders, la communauté où on apprend à créer et vendre ses propres systèmes automatisés, pas à pas.
👉 https://www.skool.com/automation-builders
----------------------------------------------------

Petit bonus, il est possible de le faire dans n'importe quelle langue. 

***
Pour utiliser Make : https://www.make.com/en/register?pc=nocodeagency
Pour utiliser Airtable : https://airtable.com/invite/r/imtpOjSB
***

Je m'appelle Thomas, j'optimise les process de mes clients en leur créant des outils sur mesure, et en automatisant au maximum les tâches répétitives sans valeur ajoutée.
```

## Transcription

Sous-titres automatiques de YouTube, non corrigés.

dans cette vidéo je vais vous montrer comment dans le cadre d'une automatisation transformer un chiffre au format toutes lettres c'est à dire par exemple dans une facture indiquez le montant total de la facture en lettres écrites comme prévu par la loi donc on commence par créer un fichier alors moi je l'ai appelé number texte donc je suis sur Google sheet voilà j'ai saisi un chiffre je vais mettre par exemple 123 le résultat voulu c'est bien d'écrire ici 123 donc ça voilà c'est ce qu'on veut faire aujourd'hui nativement ni Excel ni shit ne propose cette fonctionnalité là donc ce qu'il faut faire c'est ici télécharger un module complémentaire qui va être qui va être celui-ci Hop qui va être number texte alors moi je l'ai déjà mis donc je pourrai pas refaire le process devant vous mais voilà je recherche même vortex on l'a ici il suffit de l'installer il suffit d'installer de suivre tout simplement le bouton ensuite on peut aller sur extension ici number texte symbole il va nous montrer un peu tout ce qui est possible de faire avec avec cette formule et donc tout simplement on peut aller chercher ici donc j'efface ça je vais recréer la formule donc number texte il me le propose le chiffre c'est bien le A1 et vous voyez qu'en plus si on veut on peut le mettre en français par exemple 123 mais on peut également le mettre en anglais ou n'importe quelle langue il suffit d'avoir le code ISO de la langue donc moi en l'occurrence dans le cadre de ma démo je voudrais vous montrer comment automatiser la génération de facture en affichant à la fois un montant chiffre et un montant lettres donc ce que je vais faire tout simplement c'est de venir dans le cadre de mon automatisation peuplée ici ce cette cellule pardon et elle est chercher une fois que le une fois que c'était traduit elle est le chercher ici au format texte donc on passe maintenant sur sur Mac non pardon je vais vous montrer vite fait sur rtbble donc RTBF j'ai créé une une petite table démon undertale ici on a un numéro auto on a un montant qu'on voudrait traduire on a une zone document où on va mettre le document final et là je le record d'ID donc je suis sur Make je vais créer un nouveau scénario on va l'appeler ici des mots number texte et donc on va commencer par un module rtble le voilà on va aller chercher tous les records de ma table des mots undertale donc la table c'est la table à faire on va aller chercher toutes les affaires et ce que je vais faire c'est que je vais quand même filtrer tout simplement alors quand je vais appeler document donc voilà je vais mettre une formule rtbble donc pour l'instant on va pas le faire ce qu'on pourrait faire c'est ici avoir une formule qui filtre sur les documents vides là je sais juste dans le cas d'une petite démo je vais pas embêter avec ça voilà donc je vais chercher tous les éléments je vérifie en mettant du Lonely et donc j'ai bien mes trois mes trois sorties ici ensuite on va aller chercher un template non pardon on va aller chercher la feuille donc qui va être Google site que j'ai appelé number texte ce qu'on va faire c'est qu'on va upgrader une ligne alors pourquoi une ligne j'aurais pu faire la cellule mais en fait l'idée c'est que moi j'ai déjà eu le cas dans un scénario j'ai plusieurs chiffres à aller afficher en lettres et donc potentiellement on pourra avoir un ici un deuxième et ici un troisième et on a envie de récupérer ces trois chiffres donc ici je vais chercher mon fichier donc cette fois on a besoin de faire un template c'est juste un fichier ça va être le même fichier qu'on va mettre à jour à chaque fois et alors est-ce que je suis non je suis pas sur la bonne sur leboncoin alors comment je l'ai appelé je l'ai appelé number taxi doit être normalement à la racine donc j'ai bien qu'un seul onglet et je vais je vais aller chercher la ligne une et sur la ligne 1 ce que je vais saisir alors sur la ligne une ici je vais aller chercher le montant le montant de la faire juste pour la démo je mets ici le numéro c'est pas forcément intéressant mais globalement je vais aller c'est pour montrer qu'on peut on peut pardon excusez-moi on peut transcrire en lettres plusieurs chiffres d'un coup donc là voilà maintenant je vais ici je vais je vais faire un étape que j'ai pas encore fait c'est transformer créer un terrain des mots un des mots pour pardon un template pour la démo donc là je l'appelais template des mots lettres donc j'ai mon numéro d'affaires je vais être classiquement aller chercher l'information rtble j'ai une vidéo complète là dessus je la mettrai en fin de en fin de vidéo si vous si elle vous intéresse je vais aller chercher la date et ici je vais aller chercher je vais recréer en mettant un double crochet ici je vais mettre mon plan chiffre et ici quand la crainte je ferme le double crochet donc ce fichier là il va falloir que je le transforme en template donc pour ça je vais ici sur l'accueil de mon de mon module là je vais sur mes galeries de modèles et je vais envoyer ton play démolet donc je dois choisir une catégorie je vais mettre financer comptabilité je l'envoie et donc voilà maintenant je vais pouvoir ici dans make créer utiliser la fonctionnalité créer une feuille à partir d'un template donc je relis à mon scénario ici je vais je suis bien ouh là j'étais bien sur le bon compte donc je remets sur le bon compte je vais chercher ici donc dans mon drive alors où est-ce que je l'ai mis où est-ce qu'il est dans une tempête de factures ok donc ici je vais chercher ici dans mes template je vais le trouver c'est un peu long donc mon hop pourquoi je le vois pas ici voilà tempête démolitres il est au-dessus et donc là make va me proposer les différentes valeurs que j'ai mis entre crochet donc le numéro d'affaires je vais tout simplement chercher ici le numéro qui est là la date on va aller chercher la fonction non et qu'on va formater ici en donc en jour moi le montant du chiffre je retourne ici je vais le chercher le montant qui est chiffré et donc pour le montant net c'est là que je vais c'est là que j'ai oublié une information j'ai oublié une étape le titre je vais l'appeler et avec le numéro ici donc pour l'instant je ferme je ferme ce module ah non et je dois mettre aussi ma destination je vais mettre dans des mots voilà hop donc ici ce que j'ai oublié de faire c'est avant d'aller récupérer la cellule donc je mets get cell donc là je vais cette fois aller chercher la même le même spreadshit que j'ai utilisé auparavant donc le nom c'est des feuilles 1 de mémoire on va les vérifier 1 et en cellule donc là on est venu changer ce chiffre là donc on va aller chercher la cellule celle-ci donc la cellule A2 donc ce que je peux faire je voulais pas encore bien montré ici je vais aller je vais tout simplement jouer donc je reviens sur la création de mon document à partir d'un template et cette fois-ci je peux aller chercher la valeur que j'ai récupéré ici et dernière étape je reprends mon rtble et je vais venir associer le document donc là c'était des mots le meilleur texte la table à faire donc en fait je vais venir télécharger le document et l'associer à mon enregistrement stable donc le rtble est ici alors on peut imaginer là c'est juste pour vous montrer on peut imaginer bien sûr l'envoyer par mail allez le télécharger ailleurs enfin bref il y a tout un tas de choses à faire là c'est vraiment c'est vraiment au plus simple donc là voilà j'ai le record d'ID je vais chercher ici dans le module dans le module qui va générer le template je me trompe il y a plusieurs voilà ici je vais aller chercher application de flash PDF dans les xbox live me générer automatiquement un fichier PDF et là comme pour précédemment on va l'appeler on va mettre le numéro de la faire qu'on avait imaginé et là ici l'extension un point PDF et voilà donc on va tester ça tout de suite je vais gérer ici alors on peut venir voir voilà il est en train vous voyez chez le scénario de somatisation et en train de devenir changer les valeurs et il les a voilà normalement il a fini il les a mis dans make donc ici on voit premier document PDF donc on en vient le 897 qui est devenu du 897 on va aller voir tout de suite le plus long si c'est trop ça peut prendre éventuellement du temps à ce moment-là il faut juste rajouter un petit timer entre le moment à la fin du scénario pour avant de relancer le l'enregistrement suivant et là voilà on a dû 654 millions 133 voilà donc bref c'est efficace et rapide ça permet de faire plein de choses notamment dans tout ce qui est contrat facture etc donc à partir du moment où vous avez besoin d'automatiser la création de documents et que par cette automatisation vous devez transformer un chiffre un nombre et qui en chiffres en un nombre écrit en lettres vous pouvez utiliser cette méthode qui est très simple et qui nécessite aucun développement je vous mets donc les liens des vidéos où j'explique davantage comment créer ces documents à partir de template et je vous dis à bientôt pour une nouvelle vidéo

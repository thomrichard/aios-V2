---
type: video
resume: Afin d'exploiter au maximum la puissance d'Airtable, la bonne maîtrise du lien entre objets est indispensable, ainsi que les champs de liaison: recherche et…
statut: publie
domaine: contenu
cree: 2022-06-09
maj: 2026-10-25
liens: [comment-j-ai-automatise-ma-vie-avec-un-aios-26-07.md, claude-tutoriel-complet-pour-passer-de-debutant-a-26-05.md]
---
# La puissance d'Airtable: Liens, Lookup, et Rollup expliqués

- Vidéo : https://www.youtube.com/watch?v=It5ZOgqM--U
- Miniature : https://i.ytimg.com/vi/It5ZOgqM--U/sddefault.jpg
- Publiée le : 2022-06-09
- Durée : 10 min 27 s
- Playlists : Airtable : tuto et systèmes no-code
- Tags : lookup airtable, rollup Airtable, tutoriel Airtable, tutoriel francais airtable, Airtable formules, airtable liens, base de données, base de données relationnelle

## Stats

YouTube Analytics, données jusqu'au 2026-10-22. Revenus estimés en dollars US. Depuis le 27 août 2026, YouTube compte une vue dès la première image : pour comparer avant et après, regarder les vues engagées.

| | 7 premiers jours | 30 premiers jours | Depuis la sortie |
|---|---|---|---|
| Vues | 43 | 73 | 4 067 |
| Vues engagées | 43 | 73 | 4 057 |
| Heures regardées | 1,7 | 4,7 | 286,2 |
| Abonnés gagnés | 8 | 9 | 65 |
| Revenus estimés | 0,00 $ | 0,00 $ | 0,34 $ |
| Durée moyenne regardée | | | 4 min 13 s (40,5 %) |
| J'aime · commentaires | | | 57 · 1 |

## Liens

- Cite : [comment-j-ai-automatise-ma-vie-avec-un-aios-26-07](comment-j-ai-automatise-ma-vie-avec-un-aios-26-07.md)
- Cite : [claude-tutoriel-complet-pour-passer-de-debutant-a-26-05](claude-tutoriel-complet-pour-passer-de-debutant-a-26-05.md)
- Description : https://clubsmart.s.gy/masterclass-aios-catalogue
- Description : https://clubsmart.s.gy/tuto-claude-catalogue
- Description : https://www.skool.com/club-smart
- Description : https://www.make.com/en/register?pc=nocodeagency
- Description : https://airtable.com/invite/r/imtpOjSB

## Description

```text
Afin d'exploiter au maximum la puissance d'Airtable, la bonne maîtrise du lien entre objets est indispensable, ainsi que les champs de liaison: recherche et cumul ou lookup et rollup en anglais

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
Maîtrise l'IA et l'automatisation pour créer du contenu et devenir plus efficace.
👇 Rejoins le Club SMART👇
https://www.skool.com/club-smart
----------------------------------------------------

Dans cette vidéo, je te montre 
- comment créer un lien entre deux enregistrements de la même table
- comment créer un lien entre deux enregistrements de table différentes
- Comment utiliser la fonction lookup, pour aller chercher les informations d'un objet lié
- Comment utiliser la fonction roolup, pour filtrer ce informations, faire des claculs etc...
- la fonction count, pour compter le nombre d'objets liés.

Ces fonctionnalités, et le fait de raisonner objet et de créer sa base en conséquence, sont indispensable si tu souhaite mettre un front devant ta base airtable.

J'illustre ces fonctionnalités par des cas concrets, comme à mon habitude.

***
Pour utiliser Make : https://www.make.com/en/register?pc=nocodeagency
Pour utiliser Airtable : https://airtable.com/invite/r/imtpOjSB
***

N'hésite pas à me faire des retours, à me poser des questions ou à m'avertir si j'ai oublié un usage autour du lien entre objets.
Tu peux également t'abonner à ma chaine pour découvrir mes autres vidéos.
```

## Transcription

Sous-titres automatiques de YouTube, non corrigés.

cette vidéo est dédié aux liens entre enregistrement dans rt veulent nous allons explorer ensemble toutes les possibilités que cela offre et nous allons voir pourquoi c'est un ensemble de fonctionnalités très important contre créer une base de données efficace pour illustrer cette vidéo j'ai choisi de prendre une base vertébrale déjà préconçues un template et donc j'ai choisi le temple est speed and organizations ça permet d'avoir plusieurs plusieurs objets c'est ce qui définit une base de données donc plusieurs objets différents des membres des événements des projets des tâches des dépenses on va voir comment comment les liens entre ces différents objets permettent d'avoir une base de données qui qui va de ne pas nous donner des informations utiles là on bascule sur la base de données on a ici une table qui reprend la liste de tous les membres de cette association une association étudiante ce qu'on va faire dans un premier temps c'est regarder comment lier deux enregistrements entre eux et donc on peut imaginer pour ce cas précis la création de binômes donc je crée de nouvelles colonnes que je nomme binôme et je vais aller mettre comme type de chants lien vers un nouveau record donc je vais faire un lien vers un nouvel enregistrement donc je clique dessus je choisi exactement la même table donc members liste sommes donc on a ici deux options la première permet de définir si ce lien et du un pour un ou alors si ce lien permet de lier un élément à un groupe d'éléments donc dans ce cas précis on a choisi binôme nom va rester plutôt sur du un point mais on pourrait imaginer on verra tout à l'heure créer plusieurs enregistrements donc je décès les jeux des sélections de cette option la deuxième c'est pour limiter ce lien sur une pour l'instant on va pas leur va pas le faire donc je crée ma donné ici on va me choisir on va me proposer proposé de choisir plusieurs champs et donc de créer automatiquement des looks et l'occupant avoir juste après ce que c'est pour l'instant je skip cette étape est donc ici j'ai eduardo eduardo il va travailler par exemple avec sacha donc je vais choisir ici de lits de créer ce lien entre de riz cordes et je peux aller chercher sacha pour dire qu' il travaille à deux et comme on a choisi de limiter à 1 pour 1 je ne peux pas si je clique je ne peux pas ajouter d'autres membres il faut pour ça que je les sélectionne sacha et que je recommence pour choisir quelqu'un d'autre maintenant je vais vous montrer comment lier deux enregistrements de tables différentes donc je suis toujours sur ma liste de membres je veux liés sur ses membres à ses membres des dépenses donc voilà qui sont les une liste de dépenses je veux je veux licite connaître expenses liste les toutes les dépenses qui a fait un membre donc je choisis un champ de type links je vais chercher la bonne table cette fois je vais laisser l'option qui permet de relier plusieurs enregistrements on peut avoir plusieurs dépenses à son actif je crée le champ et donc la r&t 'burn me propose des looks donc des loups cap qu'est ce que c'est en fait un look up va te permettre d'aller chercher les informations liées à l'enregistrement enfin les informations de l'enregistrement que tu viens de lier attendre premier enregistrement donc concrètement ici je lis une dépense à un membre et on me propose d'afficher directement le nom de la dépense mais ça sort automatiquement par exemple son coût sa date son statut etc donc je vais choisir ici la date j'ajoute ce champ là est donc ici j'ai une première colonne sur laquelle je vais pouvoir aller chercher une dépense donc on va prendre ici la vidéo caméra est automatiquement cartable a créé une deuxième colonne où il va me chercher l'information de la date de cette dépense l'intérêt tout ça c'est justement d'avoir des objets bien indépendants les uns des autres et par contre si un objet venait à changer donc sur un statut sur une information quelconque ça se met automatiquement à jour sur tous les champs sur lequel cette donnée est présente si je veux en créer une autre par exemple ici il me manque le statut je vais pouvoir tout simplement aller chercher ici créé un nouveau champ de type cloud cup et je retourne sur ma table des dépenses et je vais chercher ici le statut je crée le champ et voilà il va me chercher directement cette information là ce qui est intéressant également sur arte bones et que je peux par exemple allez ouvrir directement l'objet en question donc là je clique sur video camera hop et je retrouve toutes les informations et si je vais changer ici le statut de 7,2 cet enregistrement je le change à projective hop ça le change automatiquement là ce qui est intéressant également c'est que rtb alma crée automatiquement un champ member liste dans au niveau des dépenses donc ici on va le champ on va changer le nom du chan paige bail et donc on retrouve eduardo l'information qu'eduardo a bien créé c'est bien eduardo qui a qui a fait cette dépense là on peut venir également à ce niveau là donc du côté un peu miroir de cette information venir régler le type de relation tout à l'heure on a vu qu'on pouvait faire de la relation 1 pour 1 ou alors un pour l om pour n concrètement donc une personne d'avoir plusieurs dépenses par contre une dépense ne va être gérée que par une personne qui ce que je vais me refaire par défaut le halo linkin tome multiples rikon zh et sélectionné je vais le des sélectionnés et donc maintenant je ne peux avoir qu'un seul payeur par dépenses étape suivante on va retourner sur la liste et les membres j'ai saisi un peu un peu de data pour pour illustrer la suite et donc on voit que certains bonbons plusieurs dépenses moi ce que j'aimerais avoir maintenant comme informations c'est le total le total des dépenses fait par un membre donc je crée une nouvelle nouvelle nouvelle colonne total voilà et donc je vais chercher cette fois un champ de type rollup donc le rôle hop ça va permettre d'aller chercher parmi les différents champs d'un enregistrement qui est lié d'aller chercher des valeurs et de faire une opération sur ces valeurs je vais chercher la liste des dépenses je vais choisir le tac tac tac low cost et je vais mettre la valeur voilà donc tout simplement on voit que eduardo a dépensé pour le moment pour 373 $ tandis que et midi on a dépensé pour 430 externe on a vu juste avant que parmi les dépenses on avait plusieurs statues certaines étaient payés cette haine était juste profiter donc une fonctionnalité enfin une autre partie de la fonction interlope c'est qu'on peut aussi venir donner des conditions sûres sur le calcul donc ici on voit que cette petite case permet par exemple de créer une sorte de filtre on retrouve exactement les mêmes opérateurs que le filtre est donc là on va voir que le statut up et payer effectivement voilà donc là on a l'ensemble des dépenses qui sont payés et non plus l'ensemble des dépenses non convoi qui est midi est repassé à 0 le type de champ suivant liés aux liens entre les entre les enregistrements de la table et c'est la possibilité de compter donc concrètement dans ce cas précis on va se dire ok moi j'ai envie de savoir combien de dépenses a fait chacun des membres donc je vais ici tout simplement m nombre de dépenses up et je vais chercher le type kangoo voilà donc je choisis un champ parmi les différents liens et donc on voit ici la liste des dépenses je le crée voilà on voit qu edward ou en a 3 emilie on a une donc là on n'est plus sûr de la donnée de la donne est filtré mais on peut retrouver exactement la même fonctionnalité ici on peut reprendre donc les dépenses qui ont été qui ont un statut payer donc voilà nombre de dépenses effectives hop on voit que donc au pied de l'arbre où on a une voix là donc on a vu comment gérer des liens entre différents objets d'une table rt belle est une base rtbf on a vu qu'on pouvait ensuite affichés choisir d'afficher au nom des informations de permettre ça permet d'avoir des informations toujours à jour on a vu également comment faire des opérations comment faire des calculs comment filtrer voilà très intéressant c'est indispensable si vous mettez un fronton au dessus d'autres bases rtb on aura l'occasion d'y revenir dans d'autres vidéos merci d'avoir regardé n'oubliez pas voilà et voir les autres vidéos je donne des tips j'essaie d'être concret à chaque fois n'hésitez pas à faire des commentaires n'hésitez pas à faire des retours si vous voyez des usages que j'aurais oublié ça me permet également d'apprendre voilà merci beaucoup à bientôt

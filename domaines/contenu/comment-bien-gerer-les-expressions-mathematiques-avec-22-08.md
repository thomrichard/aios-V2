---
type: video
resume: Nativement, Bubble ne gère pas la priorité des multiplications et des divisions sur les additions et soustractions. Il enchaine le calcul en prenant signe…
statut: publie
domaine: contenu
cree: 2022-08-08
maj: 2026-10-22
liens: [comment-j-ai-automatise-ma-vie-avec-un-aios-26-07.md, claude-tutoriel-complet-pour-passer-de-debutant-a-26-05.md]
---
# Comment bien gérer les expressions mathématiques avec Bubble : faire des calculs de type A*B+C*D

- Vidéo : https://www.youtube.com/watch?v=MinUpeYgDWk
- Miniature : https://i.ytimg.com/vi/MinUpeYgDWk/maxresdefault.jpg
- Publiée le : 2022-08-08
- Durée : 9 min 15 s
- Tags : Bubble, expression mathématique, calcul, multiplication, addition, coefficient

## Stats

YouTube Analytics, données jusqu'au 2026-10-20. Revenus estimés en dollars US. Depuis le 27 août 2026, YouTube compte une vue dès la première image : pour comparer avant et après, regarder les vues engagées.

| | 7 premiers jours | 30 premiers jours | Depuis la sortie |
|---|---|---|---|
| Vues | 25 | 41 | 1 631 |
| Vues engagées | 25 | 41 | 1 629 |
| Heures regardées | 0,7 | 1,4 | 76,9 |
| Abonnés gagnés | 1 | 2 | 31 |
| Revenus estimés | 0,00 $ | 0,00 $ | 0,01 $ |
| Durée moyenne regardée | | | 2 min 49 s (30,6 %) |
| J'aime · commentaires | | | 25 · 3 |

## Liens

- Cite : [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios](comment-j-ai-automatise-ma-vie-avec-un-aios-26-07.md)
- Cite : [2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a](claude-tutoriel-complet-pour-passer-de-debutant-a-26-05.md)
- Description : https://clubsmart.s.gy/masterclass-aios-catalogue
- Description : https://clubsmart.s.gy/tuto-claude-catalogue
- Description : https://www.skool.com/automation-builders

## Description

```text
Nativement, Bubble ne gère pas la priorité des multiplications et des divisions sur les additions et soustractions. Il enchaine le calcul en prenant signe par signe. 
Alors comment faire pour additionner plusieurs multiplications? 
C'est le cas que j'ai eu à traiter lors du développement d'un logiciel de caisse pour l'un de mes clients. 
Je devais calculer la valeur du fond de caisse en comptant le nombre de chaque type de pièces et de billets.

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

J'ai trouvé deux méthodes : 
- l'utilisation d'un plugin, qui permet d'ajouter une élément "expression". 
- configurer Bubble pour qu'il gère les parenthèses dans la création d'une expression mathématique.
```

## Transcription

Sous-titres automatiques de YouTube, non corrigés.

si tu as besoin de faire des additions des multiplications et des calculs avec des coefficients sur ton application bubble cette vidéo est faite pour toi donc pour commencer je vais te montrer un besoin très concret que j'ai eu ces points clients je suis en train de lui développer un logiciel de caisse sur cette logiciel de caisse il y a un une page qui est la fermeture de caisse où on vient compter chacun chacune des pièces chacun des billets qu'il y a dans le fond de caisse afin de déterminer le montant global de celle-ci donc concrètement ça se présente comme ça un premier champ une première ligne avec plusieurs champs pour chacun des types de pièces qu'on a ici en Nouvelle-Calédonie et ensuite une deuxième ligne pareil avec les 7 fois les billets et donc pour chacun des champs le numéro inscrire une valeur comptez mes pièces de 10 par exemple montrer que j'en ai quatre ici le montant se met à jour automatiquement hop et dès que j'avais dès que je viens ajouter un montant je mets à jour le calcul sur le papier c'est très simple en réalité c'est beaucoup plus compliqué on va voir que bubble ne gère pas la priorité entre les signes multiplication division et les signes de d'addition et de soustraction ok c'est parti donc ici c'est une page que j'ai dédiée que j'ai créé pour cette vidéo un formulaire tout simple on a quatre champs une avec des valeurs a pour les valeurs ABC et d ce qu'on va faire c'est qu'on va commencer par faire le la somme de ces quatre de ces quatre valeurs et donc pour ça ici on va créer l'expression qui va être toute simple donc c'est le la valeur de input a + la valeur de l'infood zut je n'ai pas faire les poubelles plus la valeur de c'est plus la valeur du qu'est ce qu'on va faire c'est que ici je pense que de B hop voilà et on va faire les deux en même temps et du coup là tout simplement on va voir comment on va ce que donne nativement bubble quand on va faire ici la valeur de l'input à fois la valeur de B plus plus plus il ouvre je suis passé plus ici la valeur d'une C x la valeur de l'input d hop ok on est bon on va donc maintenant ce que je fais ici c'est que je mets la preview je bascule mon écran voilà donc on est sur la visualisation donc on va faire un essai si je mets 5 + 5 + 5 5 hop on a bien ici un vin donc 5 + 5 + 5 ça fait 20 par contre ici on a normalement 5 x 5 25 + 5 x 5 25 on devrait être à 50 et là bubble nous sort un résultat de 150 donc qui est pas du tout le bon résultat ce qui se passe c'est qu'il a il a fait vraiment dans l'ordre donc on a du 5 x 5 ça fait 25 + 5 ça fait 30 x 5 ça fait 150 donc on est bien sur ça en fait il va prendre chaque chacun des éléments de l'opération et les ajouter les enfants et les et les traiter de façon successive sans tenir en compte de la priorité de multiplicateur ou du diviseur versus 1 une édition ou une soustraction donc pour ça on a deux solutions ok donc on va retourner on va retourner dans l'éditeur première solution on va utiliser un plugin on va utiliser un plugin qui propose plusieurs outils intéressants il s'appelle pull box on installe et alors dans dans tout le box hop on va voilà on va voir toute cette liste de de plugins et donc grâce à Toolbox ici on va utiliser expression qu'on va rajouter qu'on va rajouter en haut ici et là dans cette expression on va venir refaire notre calque donc je suis sur l'expression hop je viens saisir ici une première parenthèse ensuite je viens créer mon calcul ferme la parenthèse ensuite je viens ajouter une fermeture de parenthèse un signe plus une ouverture de parenthèse cette fois je vais chercher la valeur de l'input c que je multiplie celle du DOP et je ferme ma parenthèse ici je viens chercher je vais venir afficher la valeur de cette expression un port très important ici il faut valider le type de résultat il faut bien valider que vous êtes sur du nombre dans ce cas précis en tout cas et donc on va voir tout de suite le rendu j'actualise ma page de test je remets les valeurs qu'on avait indiquées ensemble hop et là cette fois il m'a bien pris l'expression et il a bien affiché un 50 alors maintenant on va voir une deuxième façon de de traiter le cas récemment en avril bubble a sorti une nouvelle version je ne sais pas pourquoi elle n'est pas activée mais on va pouvoir activer une une option qui permet de faire ce calcul donc pour ça tout simplement on va dans settings ensuite sur les versions et vous voyez ici on a on a cette figure qui est ici il suffit de cocher voilà donc là je confirme et cette fois je vais reprendre mon expression donc une fois que le l'option expression est activé je vais venir ici dans ce champ réécrire mon opération donc exactement comme j'ai voulu le faire au départ donc dans l'ordre donc là on voit que il a mis automatiquement des parenthèses entre mon champ 1 montchanbé si je veux je peux revenir ici pour rajouter un nouveau une autre valeur là je mets mon plus je vais chercher le la valeur du champ c que je multiplie alors attention il m'aime pas pourquoi il me fait ça mais voilà je me remets au bon endroit et là cette fois je vais chercher la valeur du champ d et je vais venir ici supprimer on a bien une première expression qui prend le champ à fois le champ B et une deuxième expression qui prend ici le champ C + e fois le champ d et on vient additionner les deux concrètement si on retourne sur la page de test on va refaire le calcul on remet du 5 partout voilà et donc on est bien on a bien le 20 évidemment et ici on a le 50 qui est le bon résultat voilà donc deux façons très simple de gérer ses multiplications et ses additions la première c'est en utilisant un plugin ensuite on vient créer une expression qu'on va réutiliser un dont on va afficher le résultat dans le champ mais le champ voulu le champ destination et la deuxième solution c'est d'appliquer de configurer le Bubble pour qu'il puisse prioriser les signes on voit des fois il faut juste faire attention qu'on saisit il vient mettre un curseur au mauvais endroit faut être vigilant mais concrètement ça se fait très bien moi c'est comme ça que j'ai fait l'application que je vous ai montré juste avant voilà merci beaucoup n'hésitez pas à vous abonner si vous voulez continuer à avoir des vidéos très pratiques sur l'utilisation d'outils au code et je vous dis à bientôt merci

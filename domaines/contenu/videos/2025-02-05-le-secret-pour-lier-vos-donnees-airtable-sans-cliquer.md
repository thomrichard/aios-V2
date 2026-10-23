---
type: video
resume: Automatiser la liaison de tables dans Airtable
statut: publie
domaine: contenu
cree: 2025-02-05
maj: 2026-10-22
liens: [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios.md, 2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a.md]
---
# Le secret pour lier vos données Airtable sans cliquer

- Vidéo : https://www.youtube.com/watch?v=17-r2CQP9lM
- Miniature : https://i.ytimg.com/vi/17-r2CQP9lM/maxresdefault.jpg
- Publiée le : 2025-02-05
- Durée : 7 min 47 s
- Playlists : Airtable : tuto et systèmes no-code
- Tags : airtable, airtable tips, automatisation, automatisation airtable, custom airtable, formation airtable, ia, lier les tables airtable automatiqement, nocode, tutoriel airtable

## Stats

YouTube Analytics, données jusqu'au 2026-10-20. Revenus estimés en dollars US. Depuis le 27 août 2026, YouTube compte une vue dès la première image : pour comparer avant et après, regarder les vues engagées.

| | 7 premiers jours | 30 premiers jours | Depuis la sortie |
|---|---|---|---|
| Vues | 41 | 102 | 1 918 |
| Vues engagées | 41 | 102 | 1 892 |
| Heures regardées | 1,8 | 5,2 | 96,8 |
| Abonnés gagnés | 0 | 1 | 18 |
| Revenus estimés | 0,00 $ | 0,00 $ | 0,12 $ |
| Durée moyenne regardée | | | 3 min 4 s (39,5 %) |
| J'aime · commentaires | | | 31 · 3 |

## Liens

- Cite : [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios](2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios.md)
- Cite : [2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a](2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a.md)
- Description : https://clubsmart.s.gy/masterclass-aios-catalogue
- Description : https://clubsmart.s.gy/tuto-claude-catalogue
- Description : https://www.skool.com/club-smart
- Description : https://partners.smartsuite.com/zxd28egq7wow
- Description : https://www.make.com/en/register?pc=nocodeagency
- Description : https://tidycal.com/ncanoumea/conseil-en-automatisation
- Description : https://app.fireflies.ai/login?referralCode=IOKsYd3ByI

## Description

```text
🔹 Automatiser la liaison de tables dans Airtable 🔹

🎓 MES MASTERCLASS (pour aller au fond des choses) :
⭐ AIOS avec Claude — construis ton système IA complet, pas à pas (1h17) :
https://youtu.be/FwnIB-RbC-E
→ Toutes les ressources de la masterclass (gratuites) :
https://clubsmart.s.gy/masterclass-aios-catalogue
→ Claude : tutoriel complet, de débutant à utilisateur avancé (1h16) :
https://youtu.be/qefrfyxQOEY
→ Toutes les ressources du tutoriel (gratuites) :
https://clubsmart.s.gy/tuto-claude-catalogue

Dans ce tutoriel, je te montre comment utiliser l'automatisation d'Airtable pour lier automatiquement des enregistrements entre deux tables. 🚀

🚀 Tu veux aller plus loin ?
Maîtrise l'IA et l'automatisation pour créer du contenu et devenir plus efficace.
👇 Rejoins le Club SMART👇
https://www.skool.com/club-smart

Concernant cette vidéo : 

💡 Exemple concret :
👉 Une table avec les employés
👉 Une table avec les demandes de congé
👉 Objectif : Relier automatiquement une demande de congé à l’employé correspondant en utilisant l’adresse email comme identifiant unique.

📌 Au programme :
✅ Création d'une vue filtrée pour identifier les enregistrements non liés
✅ Configuration d'une automatisation déclenchée par une nouvelle demande
✅ Recherche et association automatique de l’employé correspondant
✅ Test et validation du processus

📈 Pourquoi automatiser avec Airtable ?
✔️ Gain de temps
✔️ Moins d’erreurs manuelles
✔️ Processus scalable et personnalisable

Si ce tutoriel t’a été utile, pense à liker 👍, commenter 💬 et t’abonner 🔔 pour ne rien rater des prochaines vidéos sur Airtable et l’automatisation !

📣 Besoin d’aide ou de conseils ? Pose tes questions en commentaire, je réponds dès que possible !

#Airtable #Automatisation #NoCode #GestionDeDonnées #Productivité

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
```

## Transcription

Sous-titres automatiques de YouTube, non corrigés.

Dans cette vidéo, je vais te montrer comment utiliser l'automatisation d'Airtable pour lier ensemble deux enregistrements de tables différentes. Alors voilà, j'ai préparé une petite base de données fictive qui ou dans ce sur une première table, on va avoir des employés et sur la deuxième, on va créer des demandes de congé. Donc comment ça se ? Ça va se faire via un formulaire où en gros les employés vont pouvoir venir sélectionner une date de début une date de fin et saisir leur email. Donc je vais prendre par exemple celui-ci, je vais faire une demande de congé. Je valide. Je retourne voir la base et donc là en tant qu'admin, je vois ici une nouvelle demande hop avec date de début, date de fin et adresse email. Moi ce que j'aimerais c'est pouvoir par exemple à terme lier ça avec mes employés et compter le nombre de jours de vacances qu'ils ont pris et cetera.

Donc ça c'est un exemple avec une demande, ça peut bien sûr marcher avec n'importe quoi. Donc la première étape qu'on va faire, c'est créer une vue sur lesquelles on a les employés qui ne sont pas liés. En fait, les vues, c'est vraiment un outil très puissant pour ça parce que ça permet bah de gérer de de pouvoir modifier assez facilement les règles métiers mais de garder toujours la même logique. Donc là en l'occurrence, je vais appliquer mon automatisation sur les employés qui n'ont pas encore qui ne sont pas encore liés. Donc je vais ensuite sur automatisation. Celle-là, je vais la désactiver. Je vais créer une automatisation et là je vais mettre ici en trigger quand une entrée est dans une vue. Donc le trigger, ça va être le déclencheur de l'automatisation. Et donc là, je vais chercher ici la demande de congé et la vue, c'est celle que je je de créer employés non lié. Donc à chaque fois, alors je vais bouger un peu ça, hop. À chaque fois, euh Airtable propose de de tester les étapes. Donc là, je vais choisir un record, je vais prendre celui-ci.

Maintenant, deuxième étape la logique en fait, ça va être de trouver l'élément qui est unique sur la table euh de la table des employés. Donc on peut pas forcément utiliser le nom le nom car potentiellement, je peux avoir deux employés qui ont le même nom. Par contre, ces employés n'auront pas la même email adresse email. Donc ce qu'on va faire, c'est qu'on va se baser sur l'adresse email pour trouver le bon employé. La logique ça va être se faire en deux étapes. Je vais d'abord chercher dans la table employé la ligne qui a la même adresse email que celle euh qui est saisie dans le formulaire. Et en deuxième étape, je vais lier les deux en prenant l'ID de la ligne des employés et euh le lier directement euh dans le le champ qui est prévu à cet effet. Donc je cherche des entrées. Donc là, je vais mettre recherche de l'employé. Hop. Donc le tableau, ce sont donc les employés chercher des entrées en fonction d'une condition.

Donc là, je vais dire euh lorsque l'adresse email contient celle-là on va Alors, je vais agrandir un peu ici. Donc lorsque l'adresse email contient hop je vais aller chercher une donnée dynamique. Je vais appuyer sur le plus et là, je retrouve mes différentes étapes. Et donc on retrouve, vous voyez ici qu'on retrouve quand une entrée quand une entrée entre dans une vue, donc la première étape du process. Et là, on a toutes les possibilités qui sont euh fournies par cette euh par cette étape. En l'occurrence moi, je vais chercher le mail. Donc je vais tester l'étape. Donc là, il va aller chercher l'entrée qui a le mail que j'avais pris en test en première étape. Donc il trouve effectivement une personne. Parfait. Maintenant, c'est ici qu'on va mettre mettre à jour l'entrée. Donc euh, on va mettre à jour l'entrée, configuration. Donc on va sélectionner le tableau non, on va sélectionner la demande de congé.

L'ID de l'entrée, on va aller chercher ici toujours la l'entrée de la première étape, c'est-à-dire que celle qui n'a pas de de de lien entre les les deux tables. Je vais faire l'ID de l'entrée. Hop. Maintenant, je vais chercher ici le champ que je vais mettre à jour et là, c'est le lien avec l'employé. Cette fois-ci, je vais chercher dans la deuxième étape, rechercher des entrées. Recherche de l'employé. Et là, ici, on va créer une liste de record Airtable, sachant que on aura qu'un seul une seule réponse, mais c'est possible de le faire avec plusieurs potentiellement. Donc là, je vais chercher l'ID. Donc c'est bien important de ne pas prendre ici la Alors, je me tais. C'est c'est important de ne pas prendre ici le la clé utilisée pour chaque pour chaque ligne, mais bien l'ID euh l'ID de la ligne.

Donc on a ici la liste d'ID Airtable. Donc maintenant, on va venir tester euh tester la l'auto l'automatisation. Donc je l'ai activée. Ce qu'il faut savoir, c'est que euh le déclencheur se fait comment dire, quand le le record rentre dans le le la vue. Donc là, par exemple, ça va pas sur celle-ci. Ce qu'on va faire du coup, c'est juste ajouter une condition. On va mettre que le nom contient ça. Peu de chance que ça arrive. Et euh voilà, j'ai plus le record dans la vue. Maintenant je vais remodifier euh je je je je supprime le la condition un peu débile que j'ai mise pour que le le record que j'avais précédemment revienne rentre dans la vue. Donc j'applique. Et donc là la ligne s'affiche bien et normalement ça devrait voilà, ça s'est mis à jour automatiquement. Et quand je vais voir ma grille, j'ai bien ici le nom qui s'est le lien qui s'est fait. Et si on veut pousser le test un peu plus loin, on va reprendre alors je vais reprendre un email. On va reprendre celui-ci.

Je vais refaire une demande de congé en ligne. Donc date de début, on va qu'on s'en fout. Hop, je vais prendre ça, date de fin ici. Je mets l'adresse email. J'envoie. Ici, on va voir, je touche à rien. Hop, vous voyez ça s'est mis automatiquement. Euh ça crée le lien entre les deux. Voilà, donc si on résume, euh la logique, c'est d'aller d'abord chercher le créer une vue pour aller sélectionner les les enregistrements sur lesquels on va jouer l'automatisation. Deuxième étape, on va chercher les éléments qui correspondent euh qu'on veut lier à cette euh à ces ces premiers enregistrements. Et troisième étape, on récupère l'ID les ID listés dans l'étape 2 pour les ajouter au bon champ dans les dans l'étape 3. J'espère que euh le tuto t'a plu. N'hésite pas à commenter, n'hésite pas à me contacter si tu as besoin euh d'aide sur sur tout ça. Inscris-le en commentaire, je euh quand je quand je peux. Voilà, merci beaucoup. À plus.

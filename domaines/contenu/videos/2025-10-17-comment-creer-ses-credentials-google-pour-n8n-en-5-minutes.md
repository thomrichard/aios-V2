---
type: video
resume: Comment configurer sa OAuth Google pour N8N et autres services web
statut: publie
domaine: contenu
cree: 2025-10-17
maj: 2026-10-22
liens: [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios.md, 2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a.md]
---
# Comment créer ses credentials Google pour N8N en 5 minutes !

- Vidéo : https://www.youtube.com/watch?v=pWGsjE3T9Lg
- Miniature : https://i.ytimg.com/vi/pWGsjE3T9Lg/maxresdefault.jpg
- Publiée le : 2025-10-17
- Durée : 6 min 38 s
- Playlists : Airtable : tuto et systèmes no-code
- Tags : n8n, n8n ai agent, n8n tutorial, tutoriel n8n francais, tutoriel n8n, tuto N8N, low code, n8n automation, n8n google drive, n8n google sheet, n8n google api

## Stats

YouTube Analytics, données jusqu'au 2026-10-20. Revenus estimés en dollars US. Depuis le 27 août 2026, YouTube compte une vue dès la première image : pour comparer avant et après, regarder les vues engagées.

| | 7 premiers jours | 30 premiers jours | Depuis la sortie |
|---|---|---|---|
| Vues | 52 | 116 | 1 726 |
| Vues engagées | 52 | 116 | 1 637 |
| Heures regardées | 1,2 | 4,4 | 82,1 |
| Abonnés gagnés | 2 | 3 | 14 |
| Revenus estimés | 0,00 $ | 0,00 $ | 0,60 $ |
| Durée moyenne regardée | | | 3 min 0 s (45,3 %) |
| J'aime · commentaires | | | 22 · 3 |

## Liens

- Cite : [2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios](2026-07-07-comment-j-ai-automatise-ma-vie-avec-un-aios.md)
- Cite : [2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a](2026-05-20-claude-tutoriel-complet-pour-passer-de-debutant-a.md)
- Description : https://clubsmart.s.gy/masterclass-aios-catalogue
- Description : https://clubsmart.s.gy/tuto-claude-catalogue
- Description : https://www.skool.com/club-smart

## Description

```text
Comment configurer sa OAuth Google pour N8N et autres services web
Dans ce tuto de 5 minutes, je te montre comment faire pas à pas pour paramétrer ton accès aux APIs Google à partir de N8N

🎓 MES MASTERCLASS (pour aller au fond des choses) :
⭐ AIOS avec Claude — construis ton système IA complet, pas à pas (1h17) :
https://youtu.be/FwnIB-RbC-E
→ Toutes les ressources de la masterclass (gratuites) :
https://clubsmart.s.gy/masterclass-aios-catalogue
→ Claude : tutoriel complet, de débutant à utilisateur avancé (1h16) :
https://youtu.be/qefrfyxQOEY
→ Toutes les ressources du tutoriel (gratuites) :
https://clubsmart.s.gy/tuto-claude-catalogue

Tu pourras don tuiliser tous les services Google dans tes automatisations

--------------------------------------------------
👇 Rejoins le Club SMART👇
https://www.skool.com/club-smart
Maîtrise l'IA et l'automatisation pour créer du contenu et devenir plus efficace.Tu veux rester à jour sur l'IA sans te noyer dans la tech ? Bienvenue.

---------------------------------------------------
```

## Transcription

Sous-titres automatiques de YouTube, non corrigés.

Dans cette vidéo, on va regarder comment créer des credentials pour n8n pour accéder à tous les services Google. Donc globalement à quoi ça ? Ça va servir ça va servir à connecter tous ces éléments-là à n8n, à vos scénarios n8n. Donc on a Google Calendar, Google Contact, Drive, Mail, Sheets, Sheets Trigger et Tasks. Donc autant dire que c'est vraiment ultra important. Et euh et on va faire ça ensemble. Donc on va suivre tout simplement la documentation qu'il y a euh dans euh n8n, donc en cliquant ici. On voit d'ailleurs que ils ont sorti une nouvelle fonctionnalité qui est l'IA qui permet de guider au fur et à mesure. Donc c'est assez intéressant si on a des questions. Maintenant moi, je vais suivre ça. Donc première étape, avoir un service un un compte Google Cloud. Ça tombe bien, moi j'en ai un. Je vous je vous invite à le faire également. Je vais ici dans ma console. Donc ici. Créer un nouveau euh Google Cloud euh Console Project. Donc je suis dans ma dans mon dans mon projet. Moi je j'en ai déjà ici, mais on va en faire un nouveau projet. Donc je vais cliquer ici sur Nouveau projet. Alors je idéalement, il vaut mieux euh faire des vraiment respecter la notion de projet.

Ici, moi je vais faire une connexion qui s'appelle euh qui est n8n. Donc n8n, on a le droit seulement à de l'alphanumérique euh et potentiellement à des tirets, il me semble. Oui, OK. Donc voilà, j'ai créé un nouveau système. Pourquoi il ne l'a pas directement Ah, il est en train de le créer. OK. OK. Donc je vais sur ce projet. Maintenant, quelle est l'étape ? Donc je l'ai créé, maintenant il faut activer les les API. Donc on va aller cliquer ici sur le menu et on va cliquer ici sur API et services. Je vais ici aller dans Bibliothèque pour aller chercher euh les bonnes API. Alors c'est assez intéressant de voir euh toutes les API auxquelles on a accès. On a ici du machine learning, Google Workspace et cetera. Donc moi, je vais ici aller sur Google Drive et je vais activer. Alors ce que je vais faire et donc validant, il m'a il m'a remis ici. Ce que je vais faire c'est que je vais aller chercher tout ce dont j'ai besoin. Alors Google Sheets, je le ferai peut-être une autre fois, mais en tout cas, Calendar et Gmail, j'en ai envie.

Bien avoir aussi mon YouTube Analytics. Réseaux sociaux, pour l'instant, j'en ai pas forcément besoin. Ad Server non plus. Tout ça. Alors ici, on a des métriques, c'est assez intéressant. Mais j'en ai pas besoin là immédiatement. Donc j'active Google Calendar. J'active Google Gmail. J'active YouTube. Hop, Analytics. Et voilà. Donc j'ai activé mes API. Et maintenant, il va falloir configurer le Auth Screen. Donc, on est sur le bon projet. Dans le menu dans dans le menu de gauche, il faut aller sur API et Services, Auth Screen Consent. Donc je vais ici, je retourne sur écran de consentement OAuth. Alors donc on va mettre premier pas. Nom de l'application, on va mettre N8N. Thomas.

Adresse email, c'est la mienne. Suivant, la cible. Alors je vais mettre externe parce que pour moi, ça va être externe. Corps. Voilà mon truc, mais j'en ai pas forcément besoin et terminé, OK. Donc j'ai créé maintenant mon projet. Donc maintenant, on va aller dans le menu de gauche et on va aller cliquer sur Branding. Nom de l'application, c'est bon. Les validations, c'est bon. Le logo, on s'en fiche un peu. Dans le domaine de l'application. Là, j'imagine qu'il va falloir saisir des informations liées à Make. Donc exactement, in the authorized domains, select app domain et on doit Alors moi, j'utilise le Cloud. Et donc je vais utiliser ça, sinon c'est euh l'URL de votre de votre hosting. Ici, je fais ajouter un domaine. Je sélectionne N8N et je sauvegarde. On n'a qu'un ça. Hop, coordonnées et là, je vais euh Alors, j'ai ça qui m'embête. Et là, je vais sauvegarder. Et voilà, et ça a été pris en compte.

Ensuite, on doit créer les Google OAuth credentials. Donc, on va On retourne sur la Google console, OK, API service credential et on va cliquer sur ajouter OAuth client ID. C'est au niveau des clients. Donc, je clique sur cliquer un client. Ici, dans le type d'application, on va aller choisir application web, le premier. Et le nom, on va encore Je vais encore l'appeler N8N. Ensuite, on doit ajouter ici une URI de redirection. Ici, je vais sur euh mon N8N et il va me donner ici directement l'URL à copier. Donc, en cliquant dessus, ça copie. On vient l'ajouter ici. Et on va créer. Donc, à la validation, on a ces informations qui sont très importantes euh et qui sont à Ici, on a le client ID. Un simple clic permet de le copier. On va aller le coller ici dans euh dans N8N et ensuite, on a ici le code client du secret.

Et je vais le cliquer ici. Je sauvegarde. Et maintenant, on voit qu'on a un bouton sign in with Google qui apparaît. Je clique dessus. Je sélectionne mon compte. Donc là, il va me permettre de comme je suis dans le dans le node Google Drive, il me propose uniquement des choses de Google Drive. Je valide. Connexion euh successful. Et voilà, et je suis connecté et maintenant je vais pouvoir continuer mon scénario. On a donc plusieurs étapes à suivre, mais vous voyez, c'est assez euh straight forward, donc c'est assez facile à faire. Une fois que c'est fait, vous avez accès à tous les services Google sur un WeTen. Et si euh vous n'avez pas chercher les API euh correspondantes dans votre projet, il suffit d'y retourner et ensuite de revenir de revenir ici euh sur les API. Allez dans la bibliothèque et allez chercher les API dont vous avez besoin. Vous pouvez également les rechercher ici. Et il y en a énormément.

Donc amusez-vous et à bientôt.

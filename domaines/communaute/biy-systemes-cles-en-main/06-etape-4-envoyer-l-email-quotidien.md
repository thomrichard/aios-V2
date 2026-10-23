---
type: support
resume: Leçon Skool de « ⚙️ BIY – Systèmes clés en main », dossier « 🔎 Automatiser sa Veille Youtube » : Etape 4 - envoyer l'email quotidien
statut: en-cours
domaine: communaute
cree: 2025-09-11
maj: 2026-07-28
liens: [biy-systemes-cles-en-main.md, https://www.skool.com/club-smart/classroom/d48817a3?md=66e2d807f0784cb3bdc871b68cee7e85]
---
# Etape 4 - envoyer l'email quotidien

Vidéo : https://www.youtube.com/watch?v=LOLGlt52l6U

---

🎬 **Titre résumé de la vidéo** : Créer un scénario Make qui récupère des vidéos depuis Airtable, transforme les résumés YAML en HTML et envoie une veille par e‑mail aux destinataires configurés.

🧠 **Ce que la vidéo vous apprend concrètement** :

- Importer un blueprint Make et réutiliser un scénario existant.
- Connecter Make à Airtable et sélectionner une vue pour filtrer les enregistrements (ex. vue "dernier jour" avec filtre sur la date de publication).
- Lire tous les enregistrements d’une table Airtable (titre, URL, thumbnail, durée, username, hashtags, etc.).
- Récupérer une chaîne d’adresses e‑mail depuis la table Paramètres (champ "destinataire" contenant des adresses séparées par des virgules).
- Transformer un résumé stocké au format YAML en HTML via un module de transformation.
- Agréger les éléments HTML pour chaque enregistrement (image, titre, durée, etc.) et construire le contenu du mail.
- Connecter et utiliser un compte Gmail (ou Outlook / le module Email natif de Make) pour envoyer l’e‑mail.
- Programmer la fréquence d’exécution du scénario (module Schedule) et coordonner deux scénarios (récupération + envoi) avec des horaires distincts.

🔧 **Outils utilisés** :

- [Make.com](http://Make.com) (scénario / blueprint)
- Airtable (base de données, vues, filtre, table Paramètres)
- Gmail (connexion OAuth via Google) — alternative : Outlook ou module Email natif de Make
- Module de transformation YAML → HTML (dans Make)
- (Fonctionnalités Make : import blueprint, programmation Schedule)

⚙️ **Modules Make (ou autres outils) utilisés** :

- Déclencheur :
- Schedule (planification d’exécution : ex. tous les jours à 6h pour la récupération, à 7h pour l’envoi)
- Modules principaux :
- Airtable — List/Get Records (récupérer tous les records depuis une vue spécifique : ex. vue "dernier jour" filtrée sur la date de publication)
- Module de transformation YAML → HTML (transforme le résumé YAML en HTML exploitable dans le mail)
- Module d’agrégation / construction HTML (agrège les blocs HTML par enregistrement : thumbnail URL, titre, durée, username, hashtags)
- Gmail — Send an email (envoi via connexion Google OAuth) ; alternatives mentionnées : Outlook ou Email natif de Make
- (Action) Import blueprint (import du template de scénario dans Make)
- (Action/Param) Connexion Airtable (clé/choix de la base et de la table) et lecture du champ "destinataire" dans la table Paramètres

🔁 **Workflow présenté** :

- Préparation :
- S’assurer que la table Paramètres d’Airtable contient un enregistrement "destinataire" avec les adresses e‑mail (séparées par des virgules si plusieurs).
- Importer le blueprint du scénario dans Make.
- Créer/configurer les connexions : Airtable (base correcte) et Gmail via OAuth.
- Récupération des données :
- Trigger Schedule démarre le scénario à la fréquence choisie.
- Module Airtable — List/Get Records : on lit une vue filtrée (ex. "dernier jour" = vidéos publiées dans les X derniers jours).
- Pour chaque enregistrement, on récupère les champs nécessaires : titre, URL, thumbnail (image), durée, username, hashtags, résumé (au format YAML).
- Transformation et assemblage :
- Module de transformation : convertir le résumé YAML en HTML.
- Pour chaque enregistrement, construire un bloc HTML (image, titre, durée, username, hashtags, résumé HTML).
- Agréger tous les blocs en un seul contenu HTML pour le message.
- Envoi :
- Lire le champ "destinataire" depuis la table Paramètres.
- Module Gmail (ou Outlook / Email natif Make) — Send an email : injecter l’HTML agrégé dans le corps du message et envoyer aux destinataires.
- Programmation et orchestration :
- Programmer la planification (ex. récupération à 6h pour analyser / créer les contenus, envoi à 7h) — s’assurer que l’autre scénario (si vous en avez deux) utilise la même fréquence cohérente.
- Conseils : éviter une planification toutes les 15 minutes (consommation de crédits Make) ; préférer une exécution quotidienne ou selon la fréquence de veille souhaitée (3, 7, 30 jours, etc.).

---

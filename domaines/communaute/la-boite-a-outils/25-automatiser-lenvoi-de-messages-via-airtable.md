---
type: support
resume: Leçon Skool de « ✅ La boite à outils », dossier « Systèmes complets » : Automatiser l’envoi de messages via Airtable
statut: publie
domaine: communaute
cree: 2025-09-11
maj: 2026-07-30
liens: [la-boite-a-outils.md, https://www.skool.com/club-smart/classroom/ecf9b15e?md=241ca7f95bd44f50a76f05fc1cb1222f]
---
# Automatiser l’envoi de messages via Airtable

Vidéo : https://www.youtube.com/watch?v=b3yG1Hiz5FI

🎬 **Titre résumé de la vidéo** : Automatiser l’envoi mensuel de rapports (avec ou sans pièce jointe) depuis Airtable via Make

🧠 **Ce que la vidéo vous apprend concrètement** :

- Déclencher un scénario Make à partir d’enregistrements Airtable filtrés (par formule ou par vue).
- Filtrer les rapports à envoyer : utiliser une formule ({statut} = 'validé') ou sélectionner une vue Airtable ("vu valider").
- Télécharger automatiquement un document via son URL avec le module HTTP (Get a file).
- Composer et envoyer un email personnalisé en HTML avec Gmail, en joignant le fichier téléchargé.
- Tester et itérer le scénario (limite de résultats, vérification du code HTTP 200, contrôle des vues partagées).
- Bonnes pratiques : créer une vue dédiée pour la sélection, attention à ne pas supprimer la vue partagée.

🔧 **Outils utilisés** :

- Airtable (base : contacts, biens, rapports de gestion)
- Make (scénarios / modules)
- Module HTTP de Make
- Module Gmail de Make (connexion au compte Gmail)

⚙️ **Modules Make (ou autres outils) utilisés** :

- Déclencheur : Airtable — Search Records (recherche d’enregistrements) utilisé comme déclencheur (deux options : formule ou sélection d’une vue "vu valider")
- Exemple de formule utilisée : {statut} = 'validé'
- Option alternative : sélectionner la vue Airtable "vu valider"
- Paramètre de pagination/limite : traitement par lots (ex. limit = 50)
- Modules principaux :
- HTTP — Get a file (action "Get file" à partir de l’URL fournie par Airtable/RTBOL)
- Gmail — Send an email (action "Send an email") :
- Destinataire : email du contact récupéré depuis Airtable
- Sujet : "Votre rapport locatif"
- Contenu : HTML + personnalisation (Bonjour {Nom})
- Pièce jointe : fichier issu du module HTTP (output du Get file)

🔁 **Workflow présenté** :

- Étape 1 — Trigger : Make lance une Search Records sur la table "rapports de gestion" pour récupérer les enregistrements dont {statut} = 'validé' (ou en lisant la vue Airtable "vu valider").
- Étape 2 — Pour chaque enregistrement trouvé (traitement par lots / pagination), récupérer l’URL du document (champ document dans Airtable).
- Étape 3 — HTTP Get a file : télécharger le fichier à partir de l’URL (vérifier code 200).
- Étape 4 — Gmail Send an email : composer l’email en HTML, insérer la personnalisation (nom du contact), joindre le fichier téléchargé et envoyer.
- Étape 5 — Tests : relancer le scénario, vérifier réception de l’email et la présence de la pièce jointe ; attention à la pérennité de la vue si utilisée.

Notes / extensions évoquées dans la vidéo :

- Possibilité d’ajouter un Router pour gérer les cas "avec pièce jointe" vs "sans pièce jointe".
- Alternative de déclenchement : bouton dans Airtable si l’envoi doit être manuel plutôt que récurrent.

---
type: support
resume: Leçon Skool de « ⚙️ BIY – Systèmes clés en main », dossier « 🔎 Automatiser sa Veille Youtube » : Etape 3 - Installer le workflow
statut: en-cours
domaine: communaute
cree: 2025-09-11
maj: 2026-07-28
liens: [biy-systemes-cles-en-main.md, https://www.skool.com/club-smart/classroom/d48817a3?md=6e9d7cacb0c4447a82aa6ba3296582a0]
---
# Etape 3 - Installer le workflow

Vidéo : https://youtu.be/pQlIdldO5G8

---

🎬 **Titre résumé de la vidéo** : Automatiser la veille YouTube : récupérer les dernières vidéos, enrichir avec ChatGPT et stocker dans Airtable via un scénario Make (import blueprint)

🧠 **Ce que la vidéo vous apprend concrètement** :

- Stocker une clé API dans une table "Paramètres" d'Airtable pour la réutiliser automatiquement dans le scénario.
- Importer un blueprint (fichier fourni) dans Make et récupérer tous les modules du scénario prêt à l'emploi.
- Créer et configurer des connexions : Airtable (Personal Access Token) et OpenAI / ChatGPT (clé API).
- Configurer la fréquence d'exécution du scénario (Scheduler) et tester le scénario avec "Run once".
- Filtrer les vidéos déjà présentes en base pour ne traiter que les nouvelles.
- Interroger ChatGPT pour enrichir les métadonnées des nouvelles vidéos puis créer les enregistrements correspondants dans Airtable.

🔧 **Outils utilisés** :

- [Make.com](http://Make.com) (création/import de scénario, modules, scheduler, exécution "Run once")
- Airtable (base + onglet "Paramètres" + table de stockage des vidéos)
- OpenAI / ChatGPT (connexion via clé API)
- YouTube (URL de chaîne utilisée pour récupérer les vidéos)

⚙️ **Modules Make (ou autres outils) utilisés** :

- Déclencheur : Scheduler (module de planification pour définir fréquence : everyday / day of the week, heure, etc.)
- Modules principaux :
- Airtable — connexion via Personal Access Token (utilisée pour : lire la table "Paramètres" et lire/créer des enregistrements dans la base vidéos)
- Lecture du record "rapide API" dans l'onglet Paramètres (pour récupérer la clé stockée)
- Recherche de la vidéo en base (vérifier si la vidéo existe déjà)
- Create Record (ajout des nouvelles vidéos enrichies)
- YouTube — module / requête pour récupérer les N dernières vidéos d'une chaîne (paramètre : URL de la chaîne, nombre de vidéos à interroger — ici réglé sur 2)
- OpenAI / ChatGPT — module d'appel (envoi d'un prompt / prompte personnalisable) pour générer/enrichir les infos sur chaque vidéo
- Filter (module Filtre) — vérifie si la vidéo n'existe pas en base ; passe/stop selon le résultat
- Scheduler (module de planification) — réglage de la fréquence d'exécution
- (Action de test) Run once pour lancer un test manuel du scénario

🔁 **Workflow présenté** :

- 1) Préparation : ajout d'un onglet "Paramètres" dans Airtable et stockage d'une clé (record nommé "rapide API") pour éviter de saisir la clé dans chaque module.
- 2) Importer le blueprint du scénario dans Make (Import blueprint) : récupère automatiquement tous les modules nécessaires.
- 3) Créer les connexions :
- Airtable : configurer la connexion avec un Personal Access Token (valider et sélectionner la base / table "Paramètres").
- OpenAI / ChatGPT : ajouter la clé API dans la connexion ChatGPT.
- 4) Vérifier que le scénario lit bien le record "rapide API" depuis Airtable (ne pas renommer le champ/record).
- 5) Configurer les modules de récupération YouTube : renseigner l'URL de la chaîne et le nombre de dernières vidéos à interroger (ex. 2).
- 6) Exécution test : activer le scénario puis utiliser "Run once" pour vérifier l'exécution et vérifier que les deux dernières vidéos sont récupérées.
- 7) Filtrage : pour chaque vidéo récupérée, utiliser un filtre / recherche Airtable pour vérifier si elle existe déjà en base ; si elle existe, arrêter la branche ; sinon continuer.
- 8) Enrichissement : pour chaque nouvelle vidéo, appeler le module OpenAI / ChatGPT avec le prompt (modifiable) pour générer les métadonnées ou résumé.
- 9) Stockage : créer un enregistrement Airtable pour chaque vidéo enrichie (Airtable — Create Record).
- 10) Planification : configurer la fréquence du Scheduler (ex. everyday ou day-of-week, choix des jours/horaires) pour exécuter la veille automatiquement.

---

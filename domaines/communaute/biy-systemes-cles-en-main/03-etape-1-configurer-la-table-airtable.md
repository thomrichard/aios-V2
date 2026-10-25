---
type: support
resume: Leçon Skool de « ⚙️ BIY – Systèmes clés en main », dossier « 🔎 Automatiser sa Veille Youtube » : Etape 1 - configurer la table Airtable
statut: en-cours
domaine: communaute
cree: 2025-09-11
maj: 2026-07-28
liens: [biy-systemes-cles-en-main.md, https://www.skool.com/club-smart/classroom/d48817a3?md=4d8f20e119b640719643c0950a133ada]
---
# Etape 1 - configurer la table Airtable

Vidéo : https://www.youtube.com/watch?v=MlkJkBbda_U

---

🎬 **Titre résumé de la vidéo** : Dupliquer la base Airtable template, configurer les vues et automatisations, et créer un jeton d'accès pour l'utiliser depuis Make

🧠 **Ce que la vidéo vous apprend concrètement** :

- Dupliquer une base Airtable template dans votre propre workspace (et options de duplication).
- Examiner la structure : tables "Chaînes" et "Vidéos", champs clés et vues (ex. galerie).
- Activer et comprendre les automatisations Airtable fournies (déclencheur + action de mise à jour).
- Construire/placer une formule Airtable pour extraire le USERNAME depuis une URL de chaîne.
- Générer un jeton d'accès personnel (personal access token) dans Airtable avec les scopes nécessaires, et le copier pour utilisation dans Make.

🔧 **Outils utilisés** :

- Airtable (interface web : duplication de base, vues, champs, automatisations, espace développeur / jetons).
- [Make.com](https://www.make.com/en/register?pc=nocodeagency) (mentionné comme l'outil d'automatisation qui utilisera le jeton — configuration dans une prochaine vidéo).
- ChatGPT (utilisé dans la base pour générer le résumé automatique des vidéos).

⚙️ **Modules Make (ou autres outils) utilisés** :

- Déclencheur :
- Airtable Automations — "When record matches conditions" (quand un nouveau record remplit les conditions : URL contient un "@", et champ USERNAME vide).
- Modules / actions principaux (dans Airtable) :
- Airtable Automations — "Update record" : sélectionner le Record ID fourni par le déclencheur et mettre à jour le champ USERNAME.
- Champ formule Airtable (pour calculer automatiquement le USERNAME à partir de l'URL).
- UI Airtable — Duplicate base (action manuelle via le chevron > Duplicate base).
- Airtable Developer / Personal access token — création et copie du jeton avec scopes (lecture/écriture, lecture/écriture du schema, gestion des webhooks…).

🔁 **Workflow présenté** :

- Vérifier que vous avez un workspace Airtable fonctionnel (compte free possible).
- Cliquer sur le lien du template fourni dans la leçon, ouvrir la base en lecture seule.
- Dans la base template : cliquer sur le chevron en haut à gauche → Duplicate base → choisir votre workspace et options (dupliquer les enregistrements si souhaité) → valider.
- Ouvrir la copie dans votre workspace et parcourir les deux tables principales :
- Table "Chaînes" : champs = URL de la chaîne (champ à copier), Channel name (rempli par automation), description (texte saisi par le youtubeur), USERNAME (champ calculé/à remplir par automation), Avatar URL, vues (ex. galerie).
- Table "Vidéos" : champs = titre, URL vidéo, date de publication, transcript, description, résumé (généré par ChatGPT), durée (en secondes), thumbnail URL, ID, tags, etc.
- Activer les automatisations Airtable fournies (ouvrir chaque automation et cliquer sur "Activate") — NE PAS modifier leur configuration.
- Comprendre l'automatisation expliquée :
- Déclencheur : "When record matches conditions" → condition = URL contains "@" AND USERNAME is empty.
- Action : "Update record" → prendre le Record ID du déclencheur et écrire dans le champ USERNAME la valeur calculée par la formule.
- Formule présentée (exemple donné dans la vidéo) : extraire la partie finale de l'URL en faisant RIGHT({URL}, LEN({URL}) - 24) — (24 correspond au nombre de caractères à retirer avant le username dans l'URL donnée).
- Générer un jeton d'accès personnel Airtable :
- Cliquer sur votre icône → aller dans "Developer" / "Constructeur" (espace développeur) → Personal access tokens.
- Créer un nouveau jeton : nommer (ex. "veille YouTube"), définir les scopes/permissions (lecture & écriture, lecture/écriture du schéma, gestion des webhooks — exclure ou inclure commentaires selon besoin).
- Restreindre le jeton aux base(s) nécessaires (sélectionner la base "veille YouTube" ou plusieurs si besoin).
- Créer → copier le jeton et le stocker en lieu sûr (sera utilisé dans Make dans la vidéo suivante).
- Rappel final : les trois actions essentielles à faire après duplication :

1. Vérifier la base dans votre workspace, 2) Générer/copier le jeton d'accès, 3) Activer les automatisations Airtable (sinon ça ne fonctionnera pas).

---

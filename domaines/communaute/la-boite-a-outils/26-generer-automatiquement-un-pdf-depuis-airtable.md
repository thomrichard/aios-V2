---
type: support
resume: Leçon Skool de « ✅ La boite à outils », dossier « Systèmes complets » : Générer automatiquement un PDF depuis Airtable
statut: publie
domaine: communaute
cree: 2025-09-11
maj: 2026-07-30
liens: [la-boite-a-outils.md, https://www.skool.com/club-smart/classroom/ecf9b15e?md=6d3bda30fd104bcf9730d494ee95b78e]
---
# Générer automatiquement un PDF depuis Airtable

Vidéo : https://www.youtube.com/watch?v=f5CJ-NA9Z3Y

---

🎬 **Titre résumé de la vidéo** : Générer automatiquement un PDF à partir d’un enregistrement Airtable via un bouton + scénario Make

## 🧠 **Ce que la vidéo vous apprend concrètement** :

- Créer un template Google Docs avec variables (double crochets) pour produire des documents dynamiques (devis, contrats, rapports…).
- Publier ce document comme modèle (template) dans Google Docs.
- Déclencher une automatisation Make via un Webhook activé par un bouton dans Airtable.
- Récupérer un enregistrement Airtable (record id passé au webhook), mapper ses champs dans le template Google Docs (texte et image).
- Exporter le document créé en PDF et attacher le PDF dans l’enregistrement Airtable.
- Optionnel : supprimer le document Google Docs intermédiaire pour éviter l’encombrement dans Google Drive.
- Gérer le cas où l’image est stockée dans une table liée (utiliser une recherche/get record pour récupérer l’URL de l’image).

#### 🔧 **Outils utilisés** :

- Make
- Google Docs
- Google Drive
- Airtable (base, tables, champs formule, bouton, attachments)

## ⚙️ **Modules Make (ou autres outils) utilisés** :

- Déclencheur :
- Webhook (Custom webhook) — trigger qui reçoit l’appel depuis le bouton Airtable
- Modules principaux :
- Airtable — Get a record / Search records (récupérer l’enregistrement principal et, si besoin, rechercher l’enregistrement lié contenant l’image)
- Google Docs — Create a document from a template (créer le Google Doc en remplissant variables)
- Google Docs — Export (Export links / application/pdf) → obtenir l’URL du PDF
- Airtable — Update a record (mettre à jour l’enregistrement pour ajouter l’URL / attachement du PDF)
- Google Drive / Google Docs — Delete file/document (optionnel : supprimer le Google Doc intermédiaire)

## 🔁 **Workflow présenté** :

- Préparation côté Google Docs :

1. Créer le document modèle (ex : rapport locatif) et identifier les variables dynamiques en les encadrant avec [[double crochets]].
2. Déclarer/enregistrer ce document comme template via la galerie de modèles Google Docs.

#### Préparation côté Airtable :

1. Ajouter un champ formule qui concatène l’URL du webhook + "?ref=" + RECORD_ID (pour passer l’identifiant d’enregistrement).

- Exemple : CONCATENATE("[https://hook-url](https://hook-url)", "?ref=", RECORD_ID)

1. Ajouter un champ bouton (type URL open) intitulé “Générer rapport” qui ouvre l’URL construite (le webhook).

#### Scénario Make :

1. Déclenchement : Webhook custom reçoit la requête avec paramètre ref (= record id).
2. Airtable — Get a record : récupérer l’enregistrement correspondant à l’ID reçu.
3. (Si image liée) Airtable — Search/Get record : récupérer l’enregistrement de la table liée (bien immobilier) pour obtenir l’URL de l’image.
4. Google Docs — Create a document from a template : choisir le template déclaré et mapper toutes les variables (texte, montants, titre concaténé adresse+mois, et champs image en passant l’URL d’image).

- Choisir le dossier de destination sur Google Drive si nécessaire.

1. Optionnel : (après création) Google Drive / Google Docs — Delete file : supprimer le Google Doc intermédiaire pour éviter l’accumulation.
2. Google Docs — Export (Export links/application/pdf) : exporter le document créé en PDF et récupérer l’URL du PDF.
3. Airtable — Update a record : mettre à jour l’enregistrement initial pour y attacher l’URL/ le fichier PDF (champ attachments/documents).
4. Fin : le PDF est accessible depuis la fiche Airtable.

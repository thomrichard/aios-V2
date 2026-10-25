---
type: support
resume: Leçon Skool de « Vendre » : Automatiser un devis/facture PDF multi‑lignes
statut: en-cours
domaine: communaute
cree: 2026-05-12
maj: 2026-07-23
liens: [vendre.md, https://www.skool.com/club-smart/classroom/6c8a7edc?md=62f680ba01424914a3f7bc1d8b847fc3]
---
# Automatiser un devis/facture PDF multi‑lignes

Vidéo : https://www.youtube.com/watch?v=kdJY2yBZdOQ

---

🎬 **Titre résumé de la vidéo** : Générer automatiquement un devis/facture PDF multi‑lignes depuis Airtable avec Make

🧠 **Ce que la vidéo vous apprend concrètement** :

- Comment déclencher une automation depuis un bouton dans Airtable en passant le Record ID via un webhook Make.
- Comment créer un fichier à partir d’un template (document) puis y injecter dynamiquement plusieurs lignes de facture.
- Comment interroger deux tables Airtable (devis + lignes de facture) pour récupérer les données liées au document.
- Comment écrire ligne par ligne dans un tableau Google Sheets en ciblant des cellules précises (module Update cell) pour construire le tableau du document.
- La logique pour calculer l’adresse de cellule : utiliser une ligne de départ (ici 14) + bundle_order_position pour positionner chaque ligne (ex. A15 pour le premier item).
- Comment n’exécuter les étapes finales (génération PDF / update Airtable) qu’une seule fois via un filtre lorsque la dernière ligne a été traitée.
- Comment récupérer le lien d’export PDF, l’attacher au record Airtable, supprimer le fichier temporaire et ajouter une courte pause pour s’assurer que le PDF est généré.
- Astuce UX : renvoyer une réponse au webhook contenant un petit script qui ferme automatiquement l’onglet navigateur ouvert pour l’appel webhook.

🔧 **Outils utilisés** :

- Make (scenario/automation)
- Airtable (base, table "devis" et table "ligne facture")
- Google Sheets (feuille "ligne" utilisée comme tableau du template)
- Google Docs / Drive (template de document — création du fichier à partir du template)
- Module PDF (pour obtenir le lien d’export en PDF)
- Navigateurs / petit script JS (fermeture automatique de l’onglet webhook)
- Loom (enregistrement de la démo — non impactant sur l’automatisation)

⚙️ **Modules Make (ou autres outils) utilisés** :

- Déclencheur :
- Webhook (Make) — reçoit ref=RecordID depuis le bouton Airtable
- Modules principaux :
- Airtable — Get/Search record(s) sur la table "devis" (récupération du devis principal)
- Airtable — Search records sur la table "ligne facture" (récupération de toutes les lignes liées au devis)
- Google Sheets — Update cell (x4 modules par itération) :
- 1 module pour la désignation (colonne A)
- 1 module pour le prix unitaire/HT (colonne B / selon mapping)
- 1 module pour la quantité (colonne C / selon mapping)
- 1 module pour le total ligne / somme (colonne E / selon mapping)
- Module de création de document à partir d’un template (Google Docs / Drive) — copie/remplissage du template
- Module PDF (Make) — récupérer le lien d’export en PDF du document généré
- Airtable — Update record — attacher le lien PDF au record du devis
- Filtre Make — condition pour n’exécuter les étapes finales que sur la dernière itération
- (Pause/Delay) — attente ~10s avant suppression/étapes finales (mentionnée dans la démo)
- (Réponse Webhook avec script JS) — fermer l’onglet navigateur côté client

🔁 **Workflow présenté** :

- L’utilisateur clique sur un bouton dans Airtable qui appelle un Webhook Make en passant ref=RecordID.
- Le Webhook déclenche le scénario Make.
- Make récupère le record Devis (Airtable) à partir du Record ID.
- Make crée un nouveau fichier à partir du template de document (Google Docs/Drive).
- Make interroge la table "ligne facture" (Airtable) pour récupérer toutes les lignes liées au devis (chaque ligne contient bundle_order_position).
- Pour chaque ligne récupérée :
- Calculer la ligne du tableau Google Sheets : ligne_de_départ (14) + bundle_order_position → adresse de cellule (ex. A15 pour bundle 1).
- Écrire la désignation dans la colonne A via Google Sheets — Update cell.
- Écrire le prix unitaire / quantité / total ligne dans les colonnes correspondantes via les autres modules Google Sheets — Update cell (4 modules distincts pour cibler des cellules précises).
- Après chaque itération, un filtre vérifie : bundle_order_position == nombre_total_de_lignes_du_devis ?
- Si non : on continue d’itérer (on n’exécute pas les étapes finales).
- Si oui (on est sur la dernière ligne) : on poursuit avec les étapes finales :
- (Optionnel) Pause d’environ 10 secondes pour s’assurer que le document est prêt.
- Récupérer via le module PDF le lien d’export en PDF du document généré.
- Mettre à jour le record Airtable du devis pour y associer le lien PDF (Airtable — Update record).
- Supprimer le fichier temporaire si souhaité.
- En parallèle, le webhook renvoie une petite réponse HTML/JS qui ferme automatiquement l’onglet navigateur ouvert pour l’appel webhook afin d’éviter l’onglet noir restant ouvert.

---

**Remarques techniques importantes à retenir (extraits précis de la démo) :**

- On utilise bien 1 module Google Sheets Update cell par variable/colonne (c’est la raison d’avoir 4 modules par itération).
- Le calcul d’adresse de cellule = ligne de départ (14) + bundle_order_position (ex. 14 + 1 = 15 → A15).
- Le filtre "bundle_order_position == total_lines" évite d’exécuter les actions finales (export PDF + update Airtable) à chaque ligne.
- Ajouter une courte attente (~10s) avant de récupérer/supprimer le PDF évite les erreurs liées au délai de génération.
- Petite amélioration UX : renvoyer un petit script dans la réponse webhook pour fermer automatiquement l’onglet ouvert par l’appel (évite l’onglet noir rémanent).

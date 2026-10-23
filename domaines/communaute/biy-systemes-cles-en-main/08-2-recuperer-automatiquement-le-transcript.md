---
type: support
resume: Leçon Skool de « ⚙️ BIY – Systèmes clés en main », dossier « Crée du contenu depuis des vidéos Youtube [ ▶︎ ] » : 🎯 2 — Récupérer automatiquement le transcript
statut: en-cours
domaine: communaute
cree: 2025-10-09
maj: 2026-07-28
liens: [biy-systemes-cles-en-main.md, https://www.skool.com/club-smart/classroom/d48817a3?md=135771ea7dbf4fafbdc2bac2b768de6a]
---
# 🎯 2 — Récupérer automatiquement le transcript

## **🚀 Objectif :**

Importer automatiquement le transcript, le titre, les tags et la description d’une vidéo YouTube directement dans ta base **Airtable**, en un clic.

## ⭐️Tu auras besoin de :

Un compte APIFY  => [tu le trouveras ici ](https://apify.com/store?fpr=98e7cw)

Au delà de ce scénario, le compte APIFY te permettra de scrapper des informations sur les plus grands réseaux sociaux : Instagram, Facebook, Linkedin etc...

## **🧩 Le scénario Make**

1. **Module 1 — Webhook**
   → Reçoit le record_id depuis Airtable.
   → Vérifie qu’il s’ouvre bien avec le paramètre ?recid=....
2. **Module 2 — Get Record (Airtable)**
   → Récupère les infos de la vidéo : URL YouTube, titre, etc.
3. **Module 3 — Apify : YouTube Transcript Extractor**
   → Cet acteur Apify extrait :
     - le transcript complet
     - le titre
     - les tags YouTube
     - la description
     - l’image de miniature (thumbnail)
   💰 _Apify coûte environ 4 $/mois + usage, mais tu peux tester gratuitement avec des crédits._
4. **Module 4 — Get Dataset Items (Apify)**
   → Récupère le transcript au format JSON.
   → On garde uniquement la version “text-only”.
5. **Module 5 — Update Record (Airtable)**
   → Met à jour automatiquement les champs :
     - Transcript
     - Titre
     - Description
     - Tags (via SPLIT() pour créer des valeurs multiples)
     - Thumbnail URL
     - Date de publication
     - ID de chaîne
   
   💡 _Active “Smart Links” pour éviter les erreurs quand de nouveaux tags sont créés._

#### **⚙️ Mise en place dans Airtable**

1. **Crée un bouton “Get Transcript”** dans ta table Mes Vidéos.
   Ce bouton appellera ton scénario **Make** via un **webhook**.
2. **Formule du bouton :**
   On génère une URL dynamique qui envoie le record_id à Make :

```
CONCATENATE("https://hook.eu1.make.com/ton-webhook?recid=", RECORD_ID())
```

#### **🚀 Résultat**

👉 En un clic sur le bouton “Get Transcript”, ta vidéo YouTube est enrichie automatiquement dans ta base **Airtable** avec :

- son transcript complet
- ses métadonnées (titre, description, tags, miniature, etc.)
- tout ce qu’il faut pour générer des posts LinkedIn ensuite.

C’est la **fondation** de tout le système : sans cette étape, tu n’as pas de matière à transformer.

Et le meilleur ? Tu peux facilement l’adapter pour extraire plusieurs vidéos d’un coup.

---
type: support
resume: Leçon Skool de « Réflexes IA », dossier « Claude » : Appliquer son propre style à un LLM
statut: publie
domaine: communaute
cree: 2026-05-12
maj: 2026-07-29
liens: [reflexes-ia.md, https://www.skool.com/club-smart/classroom/0f85424d?md=745386befe6d4587a55862da8147521a]
---
# Appliquer son propre style à un LLM

Vidéo : https://www.youtube.com/watch?v=DwnLniV_WTw

🎬 **Titre résumé de la vidéo** : Comment faire écrire du contenu à l'IA dans votre propre style et l'intégrer dans des automatisations

> LA vidéo est sur chat GPT, mais cela foncitonnera avec n'importe quel LLM

🧠 **Ce que la vidéo vous apprend concrètement** :

- Extraire automatiquement ou manuellement vos anciens posts LinkedIn pour constituer un corpus d'exemples.
- Structurer ces exemples dans un document (Google Docs → PDF) pour les envoyer à ChatGPT.
- Demander à ChatGPT d'identifier les critères d'un style d'écriture (rôle “expert linguistique”), d'analyser vos exemples et de produire un résumé / version en bullet points.
- Créer un snippet réutilisable avec Text Blaze qui contient la description de votre style (insertion par slash).
- Utiliser ce snippet + un prompt structuré (rôle, audience, objectif, contexte, style) pour générer puis itérer un post LinkedIn.
- Préparer la bascule vers des automatisations et un assistant personnalisé via l'API OpenAI.

🔧 **Outils utilisés** :

- ChatGPT (interface web) — upload de fichier & conversation itérative.
- PhantomBuster — phantoms pour extraire activités LinkedIn.
- Google Docs (édition) → Export PDF.
- Google Sheets (optionnel) comme source d'URL de profils pour PhantomBuster.
- Text Blaze (extension Chrome) — snippets.
- Proxy (configuré dans PhantomBuster pour protéger le compte LinkedIn).
- (Mention) OpenAI API / assistant personnalisé pour intégration future.

⚙️ **Modules Make (ou autres outils) utilisés** :

- Déclencheur :
- Webhook (optionnel) configuré depuis PhantomBuster dans les settings avancés pour déclencher un scénario/extraction.
- Exécution manuelle / programmée du phantom (PhantomBuster).
- Modules principaux / actions :
- PhantomBuster — phantom "LinkedIn Activity Extractor" : input = URL de profil ou Google Sheet d'URLs ; options = extraire "posts" et "articles", définir nombre d'items.
- PhantomBuster — settings avancés : configuration du proxy (réutiliser le même proxy) ; possibilité de déclencher un webhook.
- Google Docs — création et mise en forme du document ; séparation claire des posts (Post 1 / Post 2 …).
- Google Docs → Export PDF (téléchargement du PDF contenant les exemples + analyse).
- ChatGPT (interface) — upload du PDF dans une nouvelle discussion ; envoi de prompts structurés :
- Prompt 1 : “Agis en tant qu'expert linguistique → quels sont les critères pour analyser un style ?”
- Prompt 2 : “À partir de ces critères, analyse le fichier joint (exemples) et fournis une analyse détaillée + résumé (ex : 300 mots puis version bullet points).”
- Iteration : demander modifications (réduire emojis, changer format, etc.) dans la même discussion pour conserver le style.
- Text Blaze (extension) — création d’un snippet nommé (ex : "style LinkedIn") collant l'analyse / résumé du style ; trigger = /LinkedIn ; variables dynamiques possibles (date, etc.).
- (Futur) OpenAI API — création d’un assistant personnalisé pour brancher aux automatisations.

🔁 **Workflow présenté** :

1) Récupération des exemples de posts

- Option A (manuelle) : copier-coller vos posts LinkedIn dans Google Docs.
- Option B (automatisée) : utiliser PhantomBuster → phantom "LinkedIn Activity Extractor" avec une URL de profil ou un Google Sheet d'URLs ; extraire posts/articles ; exécuter une fois ou programmer.
- Dans PhantomBuster : définir extraction (posts/articles), nombre d'items, et dans Settings avancer configurer proxy + webhook si besoin.

2) Préparation du corpus

- Sélectionner les posts extraits, coller dans Google Docs.
- Séparer clairement chaque post (Post 1 / Post 2 …), ajouter un titre, puis exporter en PDF.

3) Analyse du style via ChatGPT

- Créer une nouvelle discussion, uploader le PDF.
- Demander d'abord quels critères d'analyse utiliser (rôle : expert linguistique).
- Puis demander l'analyse du style à partir du fichier joint → obtenir une analyse détaillée (ex. 10 points) + demander un résumé (300 mots puis version orientée bullet points).

4) Centraliser l'analyse et créer un snippet réutilisable

- Coller l'analyse et le résumé dans le Google Doc (saut de page).
- Créer un snippet Text Blaze nommé (ex : /LinkedIn) contenant la description du style (bullet points) et variables dynamiques si besoin.

5) Génération et itération de contenu

- Dans ChatGPT, charger le document (exemples + analyse) et utiliser un prompt structuré (rôle = expert en copywriting, audience = indépendants & managers PME, objectif = maximiser l'engagement, style = insérer snippet Text Blaze).
- Générer le post (exemple traité : “Comment détecter et prioriser les process à automatiser”), puis affiner dans la même conversation (ex. réduire emojis, ajuster ton).

6) Passage à l'échelle / automatisation future

- Idée recommandée : créer un assistant via l'API OpenAI (compte pay-per-use) pour brancher l'assistant à des scénarios d'automatisation (ex. récupérer nouveaux posts avec PhantomBuster → envoyer au modèle via API → créer drafts → poster / programmer).
- Utiliser webhooks ou intégrations entre PhantomBuster / automation platform et votre backend pour automatiser le pipeline.

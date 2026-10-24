---
type: support
resume: skill compte rendu de réunion : pièce jointe de la leçon « Maîtriser Claude AI de A à Z (Le Tutoriel Complet) »
statut: publie
domaine: communaute
cree: 2026-05-20
maj: 2026-10-24
liens: [01-maitriser-claude-ai-de-a-a-z-le-tutoriel-complet.md]
---
---
name: compte-rendu-reunion
description: Produit un compte-rendu structuré à partir de notes ou d'une transcription de réunion, extrait les décisions et les actions, et les pousse dans les outils connectés (CRM, gestion de tâches, projet client). Déclenche quand l'utilisateur dit "compte-rendu de réunion", "CR de l'appel", "synthèse de la réunion", "traite mes notes", ou équivalent.
---

# Compte-rendu de réunion

Tu es un assistant qui transforme des notes ou une transcription brute en compte-rendu professionnel, puis qui propage les actions dans les outils du quotidien.

## Procédure

Quand l'utilisateur fournit une transcription, des notes vocales, ou dit "compte-rendu de réunion", suis exactement cette procédure :

### Étape 1 — Identifier le client / contexte
- Lis le contenu fourni (transcription, notes, fichier joint).
- Identifie :
  - Le **client** ou interlocuteur principal (nom + entreprise)
  - Le **projet** ou sujet concerné
  - La **date** et la durée approximative de la réunion
- Si tu hésites, demande à l'utilisateur avant de continuer.

### Étape 2 — Extraire les décisions prises
Liste toutes les décisions actées pendant la réunion. Une décision = un choix qui a été tranché, pas une simple discussion.

Format attendu :
- [Décision claire en 1 phrase]

### Étape 3 — Extraire les actions à mener
Pour chaque action, identifie :
- **Quoi** (description de l'action)
- **Qui** (responsable)
- **Pour quand** (date butoir si mentionnée, sinon "à définir")

Format attendu :

| Action | Responsable | Échéance |
| --- | --- | --- |
| ... | ... | ... |

### Étape 4 — Produire le compte-rendu
Sors un document structuré avec EXACTEMENT ces sections :

```
# Compte-rendu — [Client] — [Date]

**Participants**
- [Liste des participants]

**Sujet de la réunion**
- [1-2 lignes]

**Décisions prises**
1. [Décision 1]
2. [Décision 2]
...

**Actions à mener**
[Tableau actions / responsables / échéances]

**Points en suspens**
- [Sujets qui n'ont pas été tranchés et qui doivent revenir au prochain RDV]

**Prochaine étape**
- [Prochain RDV prévu, ou prochaine action déclenchante]
```

### Étape 5 — Propager dans les outils connectés
Une fois le CR validé par l'utilisateur (ou en mode automatique si l'utilisateur a configuré le déclenchement direct) :

1. **Pousser le CR dans le projet Claude / Notion / Drive du client**
   - Vérifie qu'un projet existe pour ce client. Sinon, demande à l'utilisateur où ranger le document.

2. **Créer les actions dans le gestionnaire de tâches**
   - Pour chaque ligne du tableau actions : crée une tâche dans **le système connecté** (Airtable, Asana, Linear, Notion, Todoist, ou autre).
   - Préfixe le titre par `[Client]` pour faciliter le filtrage.
   - Ajoute la date d'échéance et le responsable si possible.

3. **Préparer un brouillon d'email de suivi** (optionnel)
   - Si l'utilisateur a Gmail / Outlook connecté, propose un brouillon de mail de suivi adressé au client, qui récapitule les décisions et confirme les prochaines étapes.
   - Ne l'envoie jamais directement — toujours en brouillon.

## Règles

- **Pas d'invention** : si une info manque (responsable d'une action, date), écris "à définir" plutôt que de deviner.
- **Demande confirmation** avant de pousser dans plusieurs outils en chaîne.
- **Garde un ton neutre et professionnel** dans le CR. Pas d'emoji. Pas de jugement sur ce qui s'est dit en réunion.
- **Si la transcription est très longue** (> 1h de réunion), résume agressivement les décisions et actions — pas de paraphrase exhaustive.

---

*Skill partagé par le Club SMART — communauté gratuite de créateurs et freelances IA francophones. Rejoins-nous : skool.com/club-smart*

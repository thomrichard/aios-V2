---
type: support
resume: skill préparation de rendez vous : pièce jointe de la leçon « Maîtriser Claude AI de A à Z (Le Tutoriel Complet) »
statut: publie
domaine: communaute
cree: 2026-05-20
maj: 2026-10-24
liens: [01-maitriser-claude-ai-de-a-a-z-le-tutoriel-complet.md]
---
---
name: preparation-rendez-vous
description: Prépare un brief structuré pour un rendez-vous client à venir en croisant Calendar, CRM, emails et recherche externe. Déclenche quand l'utilisateur dit "prépare mon RDV", "brief client", "fiche de prépa", "qui je vois demain", ou équivalent.
---

# Préparation de rendez-vous

Tu es un assistant de préparation de rendez-vous. Ton rôle : produire un brief court, structuré et actionnable avant un appel ou une réunion, en croisant plusieurs sources de données.

## Procédure

Quand l'utilisateur demande de préparer un rendez-vous (avec ou sans nom de personne), suis exactement cette procédure :

### Étape 1 — Identifier le RDV
- Va dans **Google Calendar** (ou l'agenda connecté).
- Identifie le RDV concerné : aujourd'hui, demain, ou la date spécifiée par l'utilisateur.
- Récupère : date, heure, durée, invités, lieu/lien visio, intitulé.

### Étape 2 — Identifier la personne
- À partir des invités du calendrier, identifie l'interlocuteur principal (nom + email).
- Si plusieurs personnes : prends celui qui n'est pas dans le domaine de l'utilisateur.

### Étape 3 — Récupérer le dossier dans le CRM
- Cherche cette personne (par email ou par nom) dans **le CRM connecté** (Airtable, HubSpot, Notion, ou autre).
- Récupère : statut, dernier contact, projet en cours, contexte business, historique des échanges.
- Si la personne n'existe pas dans le CRM, note-le.

### Étape 4 — Lire les derniers emails
- Va dans **Gmail** (ou l'email connecté).
- Récupère les 3-5 derniers échanges avec cette personne.
- Identifie : sujet le plus récent, demandes en attente, ton de la relation.

### Étape 5 — Recherche externe si nécessaire
- Si l'étape 3 n'a rien donné (pas de fiche dans le CRM), lance une **Deep Research** rapide sur la personne :
  - Profil LinkedIn (rôle, entreprise, ancienneté)
  - Entreprise (taille, secteur, actualité récente)
- Limite : 1-2 minutes de research max, pas plus.

### Étape 6 — Produire le brief
Sors une fiche structurée avec EXACTEMENT ces sections :

```
## Brief RDV — [Nom de la personne] — [Date / heure]

**Identité**
- [Rôle, entreprise, lien LinkedIn si trouvé]

**Contexte projet / relation**
- [État du dossier, où on en est, dernier livrable, dernière question en attente]

**Dernier échange**
- [Résumé du dernier email ou réunion en 2-3 lignes : sujet, ton, demandes]

**3 objectifs pour cet appel**
1. [Objectif 1]
2. [Objectif 2]
3. [Objectif 3]

**3 questions à poser**
1. [Question 1]
2. [Question 2]
3. [Question 3]

**Points de vigilance**
- [Sujets sensibles, incohérences détectées, attentes implicites]
```

## Règles

- **Brièveté** : le brief tient en 1 page maximum. Pas de remplissage.
- **Actionnable** : chaque section doit aider l'utilisateur à mieux mener le RDV, pas juste résumer.
- **Si une source est vide** (pas d'email récent, pas de fiche CRM), dis-le clairement plutôt que d'inventer.
- **Si tu n'as pas accès** à une des sources (connecteur non actif), demande à l'utilisateur de la connecter ou propose de produire le brief sans cette source.

---

*Skill partagé par le Club SMART — communauté gratuite de créateurs et freelances IA francophones. Rejoins-nous : skool.com/club-smart*

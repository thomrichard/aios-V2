---
type: support
resume: Skill Grill-me : pièce jointe de la leçon « Grill Me : vider ta tête dans un fichier »
statut: publie
domaine: communaute
cree: 2026-07-28
maj: 2026-10-24
liens: [02-grill-me-vider-ta-tete-dans-un-fichier.md]
---
---
name: grill-me
description: Interviewe l'utilisateur en profondeur sur un plan, un design ou une idée, en checkpointant chaque réponse dans un fichier de capture durable. Déclencheurs — "grill me", "cuisine-moi", "challenge mon plan", "stress-teste cette idée", "brainstorm", "session de discovery", "vider ma tête sur [sujet]".
---

# Grill Me — interview de discovery

Interview intensive pour **extraire ce que l'utilisateur a en tête vers un fichier markdown
durable**. Le fichier, pas ton contexte, est la source de vérité : si le contexte saute à
n'importe quel moment, le fichier contient déjà tout.

## Setup — AVANT la première question

1. **Vérifier s'il existe une session à reprendre.** Chercher dans le dossier de captures
   un fichier sur le même sujet (par nom, puis par recherche plein texte si doute).
   - **Trouvé** → mode reprise : relire le fichier, résumer en 3-5 lignes où on en est
     (décisions prises, flags ouverts, branches non couvertes), confirmer avec l'utilisateur,
     puis reprendre depuis les flags et branches ouvertes. Ne PAS créer de nouveau fichier.
   - **Rien** → créer `{dossier de captures}/{AAAA-MM-JJ}-{sujet-slug}.md`
     (date réelle via `date +%F`).
2. **Dresser la carte des branches.** Lister toutes les branches du sujet à couvrir, chacune
   avec un statut : `à faire` / `partiel` / `couvert`. L'écrire dans le fichier ET la montrer
   à l'utilisateur avant Q1 : il peut réordonner, élaguer, ajouter. La carte rend la complétude
   mesurable — « on a fini » = toutes les branches couvertes ou explicitement parquées.
3. **Annoncer l'emplacement du fichier** en une ligne. Puis poser Q1.

## La règle du checkpoint (non négociable)

Après CHAQUE réponse de l'utilisateur, AVANT la question suivante :
- Appender une entrée au log Q&A : sujet de la question, faits et décisions captés (dans ses
  mots quand la formulation compte), flags éventuels (point sans réponse → qui peut répondre).
- **Le log Q&A est append-only.** Si une réponse change une entrée antérieure, ne jamais
  réécrire l'ancienne : ajouter une entrée `Correctif de Qn` qui dit ce qui change et pourquoi.
- Jamais de batch : une réponse = un checkpoint.

**La synthèse se réécrit aux jalons seulement** (fin de branche, fin de session), jamais à
chaque réponse — réécrire en continu fait dériver les formulations et injecte tes conclusions
à la place des siennes.

À chaque fin de branche : mettre à jour le statut dans la carte + réécrire la synthèse de
cette branche.

## Méthode d'interview

- **Une question à la fois**, avec ta **réponse recommandée** (ta meilleure inférence depuis
  le contexte) pour que l'utilisateur confirme, corrige ou redirige.
- Dépendances dans l'ordre : la décision amont avant celles qui en dépendent.
- Si une question peut être répondue en lisant ses notes, son code ou un doc, le faire au lieu
  de la poser.
- Si l'utilisateur ne sait pas répondre : flag avec un owner, on avance. Pas de blocage.
- **Contradiction détectée** (une réponse contredit une entrée antérieure) : la confronter
  immédiatement à l'oral — « Tu m'as dit X en Q3, là tu dis Y. Lequel tient ? » Ne JAMAIS
  lisser silencieusement dans le fichier. Une contradiction est un signal, pas une faute de frappe.

### Postures (environ 1 par branche)

De temps en temps, poser une question depuis une posture différente, **annoncée explicitement**
(« Posture : avocat du diable — »). Choisir selon le sujet :
- **Avocat du diable** — attaquer l'hypothèse la plus confortable de la branche
- **Investisseur sceptique** — « pourquoi ça marcherait, chiffres à l'appui ? »
- **Toi dans 6 mois** — « est-ce que ce choix tient encore quand le contexte a bougé ? »
- **Le destinataire final** — client, utilisateur, lecteur : « qu'est-ce que j'y gagne,
  concrètement ? »

Une posture par branche suffit ; c'est un coup de sonde, pas un mode permanent.

## Fin de session

1. **Diff contre la carte** : passer chaque branche en revue, pas un vague « autre chose ? ».
   Branches partielles ou à faire → couvrir ou parquer explicitement.
2. Relire le fichier : contradictions non résolues, trous → réconcilier avec l'utilisateur.
3. Réécrire la synthèse finale.
4. **Proposer les deux sorties actionnables** :
   - **Livrable poli** (plan, spec, doc de décision) produit depuis la capture et rangé selon
     ta structure de dossiers — la capture brute, elle, reste dans le dossier de captures.
   - **Routage des flags** : transformer chaque flag ouvert en action concrète vers son owner
     (message à envoyer, question à poser, recherche à lancer).
5. Logger la session dans ton journal (`## [AAAA-MM-JJ] brainstorm | {sujet}`).

## Structure du fichier de capture

```markdown
# {Sujet} : Brainstorm / Discovery
Date : {date} · Objectif : {une ligne}

## Carte des branches
- [couvert] {branche couverte}
- [partiel] {branche partielle}
- [à faire] {branche à faire}
- [parqué]  {branche parquée — raison}

## Synthèse / décisions clés
(réécrite aux jalons seulement)

## Log Q&A (append-only)
### Q1 — {sujet}
- Posé : {question} {[Posture : X] si applicable}
- Capté : {faits, décisions, dans ses mots}
- Flags : {point ouvert → owner}
### Correctif de Q1 — {ce qui change et pourquoi}
...

## Flags ouverts
- {item} → {owner}
```

## Pièges à éviter

| Tentation | Réalité |
|---|---|
| « Je checkpointe à la fin de la branche » | Une réponse = un checkpoint. Le contexte peut sauter à tout moment. |
| « Je réécris le résumé à chaque réponse, c'est plus propre » | C'est comme ça qu'on dérive. Synthèse aux jalons seulement. |
| « La contradiction est mineure, je corrige dans le fichier » | Confronter à l'oral d'abord. Le fichier ne ment jamais en silence. |
| « On a fait le tour, je le sens » | Le tour = diff contre la carte. Pas un feeling. |
| « Nouveau jour, nouveau fichier » | Toujours chercher une session existante avant d'en créer une. |

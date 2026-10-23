---
name: grill-me
description: Interviewe l'utilisateur en profondeur sur un plan, un design ou une idée, ou lui pose une liste de questions imposées (installation), en enregistrant chaque réponse dans une fiche de capture. Déclencheurs : « grill me », « grille-moi », « cuisine-moi », « challenge mon plan », « stress-teste cette idée », « brainstorm », « session de discovery », « vider ma tête sur [sujet] ».
---
# grill-me

Faire passer ce que l'utilisateur a en tête dans un fichier durable. La fiche, pas ton contexte, fait foi : si le contexte saute, elle contient déjà tout.

## Avant la première question
1. Cherche une session à reprendre dans `journal/entretiens/` (par slug, puis recherche texte).
   - Trouvée : relis-la, résume en 3 à 5 lignes (décisions, flags ouverts, branches non couvertes), fais confirmer, reprends là. Pas de nouveau fichier.
   - Rien : crée `journal/entretiens/<sujet>-AA-MM.md` (date : `date +%y-%m`), structure dans `references/fiche.md`.
2. Dresse la carte des branches, chacune avec un statut : ⬜ à faire, 🟡 partiel, ✅ couvert, 🅿️ parqué. Écris-la et montre-la avant Q1 : l'utilisateur peut réordonner, élaguer, ajouter.
   - Avec une liste imposée (ex. `skills/installation/references/questions.md`), chaque bloc est une branche et aucune ne se retire ; une question sans réponse est parquée « À définir ».
3. Annonce l'emplacement de la fiche en une ligne, puis pose Q1.

## Le checkpoint (non négociable)
Après chaque réponse, avant la question suivante :
- Ajoute une entrée au log Q&A : la question, les faits et décisions captés (dans ses mots quand la formulation compte), les flags (point sans réponse → qui peut répondre).
- Le log ne se réécrit jamais : si une réponse change une entrée, ajoute « Correctif de Qn » (ce qui change, et pourquoi).
- Une réponse = un checkpoint. Jamais de lot.

La synthèse se réécrit aux jalons seulement : fin de branche (avec le statut dans la carte) et fin de session.

## L'entretien
- Une question à la fois, avec ta réponse recommandée (ta meilleure inférence), à confirmer, corriger ou rediriger.
- La décision en amont avant celles qui en dépendent.
- Si le workspace répond (carte, routeurs, `memory/`, un document), lis-le au lieu de demander.
- Pas de réponse : un flag avec son owner, et on avance.
- Contradiction avec une réponse antérieure : confronte-la tout de suite (« En Q3 tu as dit X, là Y : lequel tient ? »). Ne lisse jamais en silence dans la fiche.
- Environ une posture par branche, annoncée (« Posture : avocat du diable — ») : voir `references/postures.md`.

## Fin de session
1. Passe la carte branche par branche : ce qui reste 🟡 ou ⬜ est couvert ou parqué explicitement.
2. Relis la fiche : contradictions et trous se réconcilient avec l'utilisateur.
3. Réécris la synthèse finale.
4. Propose les deux sorties :
   - le livrable propre (plan, spec, décision), rangé selon `systeme/doctrine.md` ; avec la liste de l'installation, le gabarit `skills/installation/references/profil.md` rempli : c'est le profil qu'on dépose dans `inbox/`. La fiche brute reste dans `journal/entretiens/` ;
   - les flags ouverts, transformés en actions concrètes vers leur owner ; ceux qui attendent l'utilisateur remontent dans le point du jour.
5. Ajoute une ligne à `journal/log.md` : `- AAAA-MM-JJ · entretien | <sujet>`.

## Garde-fous
- Les pièges à éviter : `references/pieges.md`.
- Ne demande jamais une clé ou un mot de passe.

## Journal des changements
- 2026-10-22 · création · entretien une question à la fois
- 2026-10-22 · reprise de la grill-me de Thomas Richard, adaptée à AIOS v2 (chemins, socle neutre, liste imposée) · sa version est plus complète

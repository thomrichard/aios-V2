---
type: tableau
resume: Le carnet où le widget e-mails apprend à classer les messages (partenariat, coaching, perso, autre)
statut: en-cours
domaine: operations
cree: 2026-10-25
maj: 2026-10-25
liens: []
---
# Carnet d'apprentissage des e-mails

Le widget e-mails de l'interface lit ce carnet **avant** ses mots-clés (`interface/os-config.json`). Une règle apprise gagne toujours.

Comment ça marche :
1. Un e-mail que ni le carnet ni les mots-clés ne classent devient un **doute** (`interface/snapshots/mail-doutes.json`). Les envois automatiques (newsletters, no-reply) sont ignorés.
2. R4 te le demande. Ta réponse devient une ligne ci-dessous.
3. Quand un mot revient souvent, R4 propose de l'ajouter aux mots-clés.

Règle : `expediteur` (adresse exacte), `domaine` (ce qui suit le @) ou `mot` (dans l'objet). Catégorie : `partenariat`, `coaching`, `perso` ou `autre`. Une ligne par règle, au format du tableau.

## Règles apprises

| Règle | Valeur | Catégorie |
|---|---|---|

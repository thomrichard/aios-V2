---
type: cloture
resume: Bilan de session, des vues du socle aux idées « un jour, peut-être », à la sauvegarde de nuit vers prive et aux types newsletter et atelier
cree: 2026-10-24
maj: 2026-10-24
liens: [../../AGENTS.md, ../../systeme/routines.md, ../../systeme/metadonnees.md, ../../vues/_index.md]
---
# Vues, idées et sauvegarde de nuit

## Périmètre
Appliquer une consigne en étapes de Thomas : récupérer le socle (les vues), ranger les idées « un jour, peut-être », mettre en place la sauvegarde de nuit vers `prive`. Thomas a d'abord collé une ancienne version (5 étapes), puis la bonne (4 étapes, où le plafond et la routine viennent du socle) : le résultat est le même.

## Réalisé
- Socle récupéré deux fois : les vues (PR #20 à #22, `f438dc7`), puis le plafond du rangement, la sauvegarde de nuit et le plafond d'`AGENTS.md` (PR #23 à #25, `36b292a`). Conflits : les sections de Thomas dans `AGENTS.md` gardées, « Où chercher » et la règle 6 pris du socle ; dans `systeme/routines.md`, ses lignes plus celles du socle.
- PR [#25](https://github.com/thomrichard/aios-V2/pull/25) au socle : `verifier.py` ne compte plus la carte ni les projets actifs dans le plafond d'`AGENTS.md`.
- Idées : type `idee`, champ `ressortir`, section « Idées » d'`AGENTS.md` (5 lignes). `systeme/idees.md`, écrit la veille par une autre session et jamais commité, est archivé dans `archives/systeme/`.
- Rangement : plafond de 20 éléments par nuit.
- Sauvegarde de nuit : ligne dans `systeme/routines.md`, autorisation dans `journal/decisions.md`, essai à la main réussi sans mot de passe (`f605495`, sur `prive`), `~/Library/LaunchAgents/com.sm4rt.sauvegarde-de-nuit.plist` chargé pour 3 h, ligne « en place ».
- Types `newsletter` et `atelier` ; `perso` couvre aussi la maison et les projets perso.
- Dossier `AIOSV2/` supprimé : un coffre Obsidian créé par erreur. Pour ouvrir le workspace, c'est « Ouvrir un dossier comme coffre ».
- Commits : `f438dc7`, `36b292a`, `ce7e7b0`, `f605495`, `50b9ad8`, `a1e4587`, `c61f283`.

## Décisions
- R4 pousse chaque nuit `main` vers `prive`, sans demander.
- Les règles des idées vivent dans `AGENTS.md`, leur liste est `vues/idee.md` (générée).
- Le plafond d'`AGENTS.md` ne compte que le texte écrit à la main.
- Types `newsletter` et `atelier` (une fiche par édition, domaine consulting).

## Propositions non engagées
- Relancer les ateliers : « on verra ».
- Test de rangement, exploré sans rien créer : « modifier le logiciel de ma télé » → une idée dans perso ; « un sujet de newsletter sur les erreurs de débutant avec Claude » → une fiche `newsletter` au statut `sujet` dans contenu (le type n'existait pas encore) ; « refaire la page de vente de l'atelier cette semaine » → un projet, si les ateliers reprennent.

## Limites
- La CLI `claude` est déconnectée : le rangement de nuit a planté (OAuth expiré) et `outbox/points/` est vide. `claude auth login` attend dans le terminal de l'app.
- La sauvegarde committe tout (`git add -A`) : un dossier ajouté par erreur à la racine part vers `prive`. `.env` reste écarté par le `.gitignore`.
- Si le vérificateur bloque le commit, seuls les commits déjà faits partent.
- Si le Mac dort à 3 h, launchd lance la sauvegarde au réveil, comme le rangement du 24 octobre (parti à 10 h 26).
- `inbox/capture.md` contient des lignes en double, d'une session précédente.

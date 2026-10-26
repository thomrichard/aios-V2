---
name: personalise
description: Vérifie qu'une ressource externe (skill, outil, article, repo, prompt, process) est saine et colle au workspace avant de l'installer, puis propose comment l'adapter : où elle vit, quoi renommer, quoi retirer, quoi ajouter, prérequis, validations à demander. Déclencheurs : « personnalise ça », « adapte ça pour moi », « fais que ça colle à l'AIOS », « /personalise [chose] ».
---
# personalise

Tu reçois une chose venue de l'extérieur (URL, texte collé, chemin, nom d'outil, prompt). Tu rends une recommandation pour l'adapter au workspace. Pas un résumé générique, pas une installation à l'aveugle.

## Démarche
1. Classe l'entrée en une ligne : skill, outil, article, repo, prompt, process, contenu.
2. Lis seulement ce qu'il faut :
   - Toujours : `AGENTS.md` (qui est l'utilisateur, objectifs, façon de lui parler, règles).
   - Pour une skill : `skills/README.md`, `systeme/modeles.md`, et `skills/_index.md` pour repérer les doublons.
   - Pour un outil ou une connexion : `systeme/connexions.md`.
   - Pour un process : `processus/_index.md`.
   - Pour une idée ou un projet : `vues/idee.md`, `projets/`.
   - Toujours : `memory/MEMORY.md`, pour les `feedback_` qui s'appliquent.
3. Évalue : ce qui sert les objectifs, ce qui ne colle pas, ce qui manque, ce qui chevauche l'existant.
4. Rends la recommandation.

## Sortie
Trois blocs courts :

**Ce que c'est** : une ligne.

**Taux d'adoption** : `fort`, `moyen`, `faible` ou `ne pas adopter`, avec une raison en une ligne, filtrée par les objectifs d'`AGENTS.md`. Si l'entrée ne rapproche d'aucune cible, dis-le en une ligne.

**Plan d'adaptation** : des puces concrètes seulement.
- Où elle vit : pour une skill, `skills/<nom>/`, une seule fois. Les liens `.claude/skills` et `.agents/skills` pointent déjà vers `skills/`.
- Ce qu'il faut renommer : nom et marque d'origine, orthographe du workspace, termes du workspace (domaine, routeur, fiche, projet, idée).
- Ce qu'il faut retirer : ce qui contredit `AGENTS.md`, les `feedback_` ou les règles de la doctrine.
- Ce qu'il faut ajouter : liens vers les skills, routeurs ou processus à citer.
- Prérequis : variables dans `.env` (sans les lire ni les demander dans le chat), paquets, outils.
- Validations à demander : coût, envoi ou publication, Git, système externe, messages.

Termine par une question de choix seulement s'il y a un vrai choix. Sinon, arrête-toi là.

## Règles à appliquer
- Respecte la voix définie dans `AGENTS.md` et les `feedback_` de `memory/`.
- Cherche les doublons avant tout. Si l'existant couvre le besoin, propose de le mettre à jour (retour via `note`), jamais une seconde skill.
- Une entrée dans `memory/` n'existe que pour une préférence ou une correction (`user_`, `feedback_`, `reference_`). Un outil, une idée ou un tutoriel n'y va pas.
- Le kit reste neutre : rien de personnel dans une skill du socle (ni nom, ni contenu d'un profil, ni données).

## Garde-fous
- N'installe rien et ne crée aucun fichier sans le feu vert de l'utilisateur. Recommande d'abord.
- Une entrée, une adaptation : pas de sœurs ni de « au cas où ».
- Pas de document de planification, sauf demande. La réponse reste dans le chat.
- La version adaptée n'est écrite qu'une fois le taux d'adoption et l'emplacement validés.
- Après installation : relance `systeme/scripts/index.py` pour que `skills/_index.md` la référence.

## Références
- `references/` (les images sont listées dans `references/_images.md`)
- Retours en attente : `feedback.md`

## Journal des changements
- 2026-10-26 · création, adaptée depuis robonuggets/skills (personalise) · vérifier une ressource avant de l'installer dans le workspace

---
name: humanizer
description: Repère dans un texte les tics d'écriture qui sentent l'IA (formules creuses, structures répétées, ponctuation et mise en forme de machine) et le réécrit pour qu'il sonne comme son auteur, ou se contente de les nommer. Modes : script, newsletter, post, page. Déclencheurs : « humanizer », « humanise ce texte », « ça sent l'IA », « enlève le style IA », « humanizer liste ».
---
# humanizer

Un texte écrit avec l'IA garde des tics qui le rendent plat et reconnaissable. Le but n'est pas de tromper un détecteur : c'est que le texte sonne comme son auteur, et qu'il dise les choses plus clairement.

## Étapes
1. **Le texte et son support.** Un fichier ou un passage de la discussion. Le support : `script` (lu à voix haute), `newsletter`, `post` (réseaux), `page` ; devine-le s'il n'est pas dit.
2. **La voix de l'auteur.** Cherche sa charte d'écriture : un souvenir `reference_` ou `feedback_` dans `memory/`, ou un guide de style dans son domaine. Elle prime sur tout le reste. Sans charte : phrases courtes, mots simples, du concret.
3. **Repère les tics**, avec la liste de `references/motifs.md` : note chaque motif trouvé et où.
4. **Selon la demande :**
   - « humanizer liste » : rends seulement la liste (motif, passage, piste), sans toucher au texte ;
   - sinon, réécris : même sens, mêmes faits, même longueur à 10 % près. Garde les tics de l'auteur, ceux qui font sa voix : ce ne sont pas des tics d'IA.
5. **Rends** le texte réécrit, puis, en 3 lignes au plus, les motifs les plus fréquents qui ont sauté. Dans un fichier, écris par-dessus seulement si l'utilisateur le demande ; sinon, propose.

## Selon le support
- `script` : phrases courtes, faites pour l'oral ; une idée par phrase ; pas de liste à puces ; des transitions parlées.
- `newsletter` : un « je » qui raconte, un exemple vécu, une seule idée forte.
- `post` : une accroche concrète, pas une question rhétorique ; pas d'émojis en tête de ligne ; une fin sans formule creuse.
- `page` : des titres qui disent quelque chose, des preuves plutôt que des adjectifs.

## Garde-fous
- N'invente ni fait, ni chiffre, ni anecdote pour « faire humain ».
- Ne change pas le fond : en cas de doute sur une phrase, garde-la et signale-la.

## Références
- `references/motifs.md` : les tics à repérer, en français.
- D'après la skill `humanizer` de Jay E | RoboNuggets (leçon j1) : son fichier n'est pas public, celle-ci est réécrite pour l'AIOS et pour le français.

## Journal des changements
- 2026-10-23 · création · que le texte sonne comme son auteur, pas comme un modèle

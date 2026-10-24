---
type: support
resume: Leçon Skool de « Faire vivre ton AIOS » : Grill Me : vider ta tête dans un fichier
statut: publie
domaine: communaute
cree: 2026-07-28
maj: 2026-10-24
liens: [faire-vivre-ton-aios.md, https://www.skool.com/club-smart/classroom/dd9dc077?md=2090cfa7a86b4effa1429b6568fbe6bf]
---
# Grill Me : vider ta tête dans un fichier

> **Promesse de la leçon :** à la fin, tu as un rituel d'interview qui vide ce que tu as
> en tête dans un fichier durable, branche par branche — et qui te dit quand tu as
> vraiment fait le tour. Tes idées, pas celles de ton IA.

---

## Le besoin que ça couvre

Tu as un projet en tête. Pas encore un plan : une intuition, trois contraintes, deux options qui s'affrontent. Tu ouvres un chat et tu demandes à ton IA de t'aider à structurer ça.

Il se passe trois choses, à chaque fois.

**Ton IA remplit les blancs.** Tu dis 30 % du truc, elle produit un doc à 100 %. Le reste vient d'elle. Le résultat est propre, cohérent — et il ne ressemble déjà plus tout à fait à ce que tu voulais. Tu le relis en te disant « oui, à peu près », ce qui est le pire retour possible sur son propre projet.

**Tu ne sais pas quand tu as fini.** À un moment tu t'arrêtes parce que tu es fatigué, pas parce que le sujet est couvert. « On a fait le tour » reste un feeling. Deux jours plus tard tu découvres la branche que personne n'a ouverte.

**Et la conversation s'évapore.** Une heure d'échange dense, et il ne reste qu'un long fil de chat que tu ne reliras jamais.

`Grill Me` inverse le rapport de force. Ce n'est plus toi qui demandes à l'IA de produire : c'est elle qui t'interroge, et qui écrit ce que _tu_ réponds. Là où `/close` range ce qui s'est passé, Grill Me sert avant — il fait exister ce qui n'existait que dans ta tête.

---

## Ce que fait Grill Me

Quand tu lances `grill me` sur un sujet, ton AIOS déroule un protocole précis :

1. **Il cherche une session existante.** Même sujet déjà entamé ? Il rouvre le fichier, te résume où vous en êtes et reprend là où ça s'est arrêté. Une idée = un fichier, jamais trois brouillons éparpillés.
2. **Il dresse la carte des branches.** Avant la première question, il liste tous les axes du sujet à couvrir, chacun avec un statut : à faire, partiel, couvert. Il te la montre — tu réordonnes, tu élagues, tu ajoutes. Cette carte est la pièce maîtresse : c'est elle qui rend la complétude _mesurable_.
3. **Il t'interroge une question à la fois**, en donnant à chaque fois **sa réponse recommandée**. Tu n'es jamais devant une page blanche : tu confirmes, tu corriges, tu rediriges. C'est infiniment plus rapide que de formuler à froid, et ça reste ta décision.
4. **Il checkpointe après chaque réponse.** Pas à la fin de la branche, pas en fin de session : après chaque réponse, avant la question suivante. Le fichier est écrit en temps réel, en append-only.
5. **Il change de posture.** Environ une fois par branche, il annonce qu'il attaque depuis un autre angle — avocat du diable, investisseur sceptique, toi dans six mois, ton client final. Un coup de sonde là où tu es le plus confortable.
6. **Il confronte tes contradictions.** Si ta réponse à la question 12 contredit celle de la question 3, il te le dit à voix haute au lieu de lisser en douce dans le fichier.
7. **Il ferme par un diff contre la carte.** Branche par branche. Ce qui reste ouvert est soit couvert, soit parqué avec sa raison. Puis il te propose deux sorties : le livrable propre (le plan, la spec, la note de décision) et le routage de chaque question restée sans réponse vers quelqu'un capable d'y répondre.

Le principe qui tient tout : **le fichier est la source de vérité, pas la conversation.** Si ton chat plante à la question 14, tu n'as rien perdu — les quatorze réponses sont déjà sur ton disque.

---

## Installe la skill

**Ce qu'il te faut :** un agent qui écrit sur ton disque — Claude Code dans VSCode, ton setup de C9. Tout le protocole repose sur le fichier rempli en temps réel. Dans un chat web qui n'a pas accès à tes fichiers, Grill Me se dégrade en simple conversation, et tu perds exactement ce que la skill vient corriger.

La skill est un fichier joint à cette leçon, sous le nom `grill-me-SKILL.md`. Trois gestes, dans l'ordre :

1. **Crée le dossier** `.claude/skills/grill-me/` dans ton Vault.
2. **Dépose le fichier dedans et renomme-le **`**SKILL.md**`**.** Le nom compte : ton agent cherche un fichier `SKILL.md` à l'intérieur d'un dossier qui porte le nom de la skill. Un `grill-me-SKILL.md` posé en vrac ne se déclenchera jamais — et rien ne te préviendra.
3. **Redémarre ton agent** pour qu'il recharge ses skills. Pour vérifier que c'est bon, tape `/` : `grill-me` doit apparaître dans la liste des commandes. S'il n'y est pas, c'est le dossier ou le nom du fichier — reprends l'étape 2.

Le fichier est écrit en langage universel : « ton dossier de captures », « ton journal », « ta structure de dossiers ». Il marche tel quel. Mais il sera bien meilleur branché sur _ta_ structure à toi.

Alors ne t'arrête pas au copier-coller. Demande à ton AIOS de l'adapter :

> « Voici ma skill `grill-me`, que je viens de déposer dans `.claude/skills/grill-me/SKILL.md`.
> Adapte-la à mon architecture en te basant sur mon CLAUDE.md et la structure de mon Vault :
> choisis où ranger les fichiers de capture **et crée le dossier s'il n'existe pas**, dis-lui
> où vit mon journal et où doit atterrir le livrable final. Remplace tous les chemins
> génériques par mes vrais chemins. »

Ton AIOS connaît déjà ton arborescence — il va recâbler la skill sur tes vrais chemins. En deux minutes, tu passes d'un protocole générique à un protocole qui range chez toi.

---

## Fais-la à ton goût

Le starter est une base. Quelques directions une fois que tu l'as en main :

- **Tes postures.** Remplace la liste par les voix qui comptent dans _ton_ métier : ton associé, ton comptable, le membre le plus exigeant de ta communauté, ton toi d'il y a deux ans.
- **La longueur.** Ajoute une consigne de format court si tu veux des sessions de vingt minutes plutôt que d'une heure — par exemple : maximum trois branches par session.
- **L'enchaînement.** Termine systématiquement par `/close` : Grill Me remplit le fichier de capture, `/close` range le livrable et met à jour ton journal. Les deux skills se complètent.
- **Le déclencheur.** Prends le réflexe de lancer Grill Me _avant_ d'écrire un gros document. Une heure d'interview te fera gagner trois heures de réécriture.

C'est ça, faire vivre ton AIOS : chaque rituel que tu ajoutes couvre un moment précis de ton travail. `/close` couvre la fin. Grill Me couvre le début.

## Ressources

- Skill Grill-me : [`02-grill-me-skill.md`](02-grill-me-skill.md), joint à la leçon sur Skool

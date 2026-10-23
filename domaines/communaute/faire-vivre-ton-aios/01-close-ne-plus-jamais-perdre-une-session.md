---
type: support
resume: Leçon Skool de « Faire vivre ton AIOS » : /close : ne plus jamais perdre une session
statut: publie
domaine: communaute
cree: 2026-07-21
maj: 2026-07-28
liens: [faire-vivre-ton-aios.md, https://www.skool.com/club-smart/classroom/dd9dc077?md=2b5790b322554f2ebde39fb3412ccdf0]
---
# /close : ne plus jamais perdre une session

> **Promesse de la leçon :** à la fin, tu as un rituel de fin de session qui range
> tout seul ce que tu viens de faire au bon endroit. Tu fermes ton chat l'esprit
> tranquille — rien ne s'évapore. C'est la première skill qui fait _vivre_ ton AIOS.

---

## Le besoin que ça couvre

Tu passes une heure avec ton IA. Vous décidez trois choses, vous rédigez deux textes, tu explores quatre pistes dont une seule est retenue. Puis tu fermes la fenêtre.

Le lendemain, il ne reste rien. Le chat a tout gardé pendant la session, mais il n'a rien **écrit** — ni dans tes notes, ni dans ton journal, ni dans sa mémoire. Le raisonnement, les options, le pourquoi de tes décisions : perdus. Tu repars de zéro.

C'est le trou le plus courant d'un AIOS débutant. Tu as construit un beau second cerveau en C9, mais si chaque session s'évapore en fermant l'onglet, il ne se remplit jamais. Un second cerveau qui n'enregistre pas, c'est juste un chat un peu mieux rangé.

`/close` bouche ce trou. C'est le geste de fin : tu fermes les tables ouvertes, et tu _sais_ que tout est rangé où il faut.

---

## Ce que fait /close

Quand tu tapes `/close`, ton AIOS déroule cinq étapes, dans l'ordre :

1. **Il fait l'inventaire.** Il relit la session et trie ce qui s'est passé en quatre : les décisions (avec leur pourquoi), les livrables produits, la matière volatile (tout ce qui n'existe QUE dans le chat), et les sujets encore ouverts.
2. **Il écrit dans le système.** La matière qui a de la valeur va dans la bonne note ; les projets touchés sont mis à jour ; une ligne part dans ton journal de bord.
3. **Il alimente sa mémoire.** Chaque fait durable qu'il ne pourrait pas retrouver ailleurs (une préférence à toi, l'état d'un projet) est écrit dans sa mémoire.
4. **Il passe la checklist « rien n'est perdu ».** Un livrable promis mais jamais écrit ? Un serveur encore lancé ? Des changements non commités ? Il te le signale.
5. **Il te fait un récap.** Ce qui est fait, où c'est écrit, ce qui reste, et la phrase exacte pour reprendre demain.

La clé, c'est l'étape 1. On croit qu'on perd les décisions. En réalité, ce qu'on perd, c'est le **chemin** : les options qu'on a écartées et pourquoi. `/close` capture la carte complète, pas seulement la destination.

---

## Installe la skill

**Ce qu'il te faut :** un agent qui écrit sur ton disque — Claude Code dans VSCode, ton setup de C9. Toute la valeur de `/close` est de _ranger sur disque_ ; dans un chat web sans accès à tes fichiers, il n'a rien à ranger.

La skill est un fichier joint à cette leçon, sous le nom `close-SKILL.md`. Trois gestes, dans l'ordre :

1. **Crée le dossier** `.claude/skills/close/` dans ton Vault.
2. **Dépose le fichier dedans et renomme-le ****`SKILL.md`****.** Le nom compte : ton agent cherche un fichier `SKILL.md` à l'intérieur d'un dossier qui porte le nom de la skill. Un `close-SKILL.md` posé en vrac ne se déclenchera jamais — et rien ne te préviendra.
3. **Redémarre ton agent** pour qu'il recharge ses skills. Pour vérifier que c'est bon, tape `/` : `close` doit apparaître dans la liste des commandes. S'il n'y est pas, c'est le dossier ou le nom du fichier — reprends l'étape 2.

Le fichier est écrit en langage universel : « ton journal », « ta note de capture », « ta mémoire ». Il marche tel quel. Mais il sera bien meilleur branché sur _ta_ structure à toi.

Alors ne t'arrête pas au copier-coller. Demande à ton AIOS de l'adapter :

> « Voici ma skill `close`, que je viens de déposer dans `.claude/skills/close/SKILL.md`.
> Adapte-la à mon architecture, en te basant sur mon CLAUDE.md et la structure de mon
> Vault : dis-lui exactement où vit mon journal, quels sont mes dossiers de rangement et
> où est ma mémoire. Remplace tous les chemins génériques par mes vrais chemins. »

Ton AIOS connaît déjà ton arborescence — il va recâbler la skill sur tes vrais chemins. En deux minutes, tu passes d'un rituel générique à un rituel qui parle _ta_ langue.

---

## Fais-la à ton goût

Le starter est une base, pas une fin. Quelques directions une fois que tu l'as en main :

- **Le commit automatique.** Ajoute à l'étape 4 un vrai commit git de fin de session, pour que ton disque et ton historique soient toujours alignés.
- **Le déclencheur.** Prends le réflexe de taper `/close` avant chaque fermeture — ou fais-en la dernière étape systématique de tes sessions de travail.
- **Ton nommage.** Cale le format des lignes de journal et le nom des fichiers sur tes propres conventions.

C'est ça, faire vivre ton AIOS : tu ne l'as pas fini en C9, tu l'affûtes à chaque session. `/close` est le premier outil de cet atelier — les prochaines leçons en ajoutent d'autres.

## Ressources

- La skill CLOSE : fichier `close-SKILL.md`, joint à la leçon sur Skool

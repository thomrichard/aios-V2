---
type: support
resume: Arbitrage - la skill : pièce jointe de la leçon « Les arbitrages : trace tes décisions »
statut: publie
domaine: communaute
cree: 2026-08-28
maj: 2026-10-24
liens: [04-les-arbitrages-trace-tes-decisions.md]
---
---
name: arbitrage
description: Trace une décision tranchée dans .ai/arbitrages/ avec ses options écartées, pour qu'elle ne se repaie pas à chaque session. Déclencheurs explicites — "/arbitrage", "trace cette décision", "on acte ça", "note qu'on a tranché", "pourquoi on avait choisi X". Déclencheurs proactifs (tu proposes toi-même, sans qu'on te le demande) — un choix se fait entre au moins deux options réelles, un outil ou un pattern nouveau est introduit, tu t'apprêtes à contredire un arbitrage existant, ou tu commences à écrire un long commentaire qui explique « pourquoi ».
---

# Arbitrage — tracer une décision et ses refus

Une décision tranchée qui n'est écrite nulle part **se repaie à chaque session** : l'agent
redémarre à zéro, re-propose ce qui a été rejeté, et contredit en silence ce qui a été acté la
veille. Ce que cette skill produit n'est pas un compte-rendu — c'est un **refus qui fait autorité
la fois suivante**.

---

## Étape 0 — Le seuil (avant tout le reste)

Une fiche se justifie si la décision coche **au moins trois** sur quatre :

1. elle change la façon dont le système est bâti ou opéré ;
2. elle est difficilement réversible une fois qu'on a construit dessus ;
3. elle affecte des sessions ou des agents ultérieurs ;
4. elle avait de **vraies** alternatives.

**Pas de fiche** pour : un choix de routine dans un pattern établi · une correction · une
préférence de style déjà écrite dans tes conventions · un sujet déjà couvert par un arbitrage
existant (c'est un **remplacement**, voir étape 2).

Sous le seuil, dis-le en une ligne et n'écris rien. Le plafond du réservoir n'est pas décoratif :
chaque fiche de trop dilue les autres. Il se compte en **arbitrages actifs** — 80 —, pas en
lignes d'index.

---

## Étape 1 — Vérifier l'existant

Lis l'index `.ai/arbitrages/arbitrages.md`, puis cherche sur le sujet :

```bash
grep -ril "<mot-clé>" .ai/arbitrages/
```

- **Un arbitrage couvre déjà le terrain** → c'est un **remplacement**, pas une création.
  Ne jamais écrire deux fiches concurrentes sur le même sujet.
- **Un arbitrage voisin existe** → note-le, tu le citeras dans `## Écarté` ou dans le corps.

---

## Étape 2 — Interroger

Une question à la fois, jamais en liste. Ne demande pas ce que tu peux déduire du contexte.

Le minimum non déductible, et il est **non négociable** :

> **Qu'est-ce qui a été écarté, et pour quelle raison ?**

Sans au moins une option rejetée et son motif, **arrête-toi**. On ne devine pas un refus, et une
fiche sans refus est un compte-rendu de plus.

Autres questions utiles quand elles ne sont pas évidentes : ce que ça coûte (« qu'est-ce qui
devient plus dur ? ») · la condition de réouverture (`revoir_si`) · le niveau de `confiance`
(1-5 : à 5 l'agent bloque quand on contredit, à 2 il signale la fragilité).

---

## Étape 3 — Le résumé d'intention, puis l'accord

Présente, et **attends la confirmation avant d'écrire** :

> - **Titre** : {groupe verbal — la décision, pas le problème}
> - **La règle** : {l'impératif en 1-2 lignes}
> - **Écarté** : {option → raison, pour chacune}
> - **Ce que ça coûte** : {le compromis}
> - **Revoir si** : {condition}
> - **Portée** : {une ou plusieurs de : systeme · donnees · contenu · design · business}
> - **Gouverne** : {chemins réels que ça contraint}
> - **Confiance** : {1-5}
>
> **Ça capture bien ce qu'on a tranché ?**

---

## Étape 4 — Écrire

1. **La fiche** : `.ai/arbitrages/<id>.md`, à partir de `_TEMPLATE.md`.
   - `id` = nom du fichier = groupe verbal en kebab-case, 3-6 mots. **Pas de numérotation** :
     le nom doit se lire dans le chemin. Un `D-0042` oblige à ouvrir le fichier pour savoir de
     quoi il parle ; `sortir-d-airtable` se lit dans le chemin.
   - `provenance: tranché-en-session` **seulement** si la décision vient d'être prise et que le
     pourquoi est attesté. Sinon `reconstruit`.
   - `portee` : mappe sur le vocabulaire existant. Créer une 6ᵉ valeur est un acte délibéré, à
     proposer — jamais un réflexe.
   - `implemente` : **l'état du monde, pas celui de la décision.** Les deux sont orthogonaux —
     un arbitrage peut être `statut: actif` (il fait autorité, tu l'appliques) **et**
     `implemente: non` (la réalité ne s'y conforme pas encore). Dans ce cas, **crée aussi une
     tâche** qui comble l'écart et renseigne `tache:` avec son chemin. Ne dégrade jamais le
     `statut` pour signaler un manque d'implémentation : ce serait dire que la décision n'est
     pas prise, alors qu'elle l'est.
   - `a_rouvrir` : **ce qui dérange dans cette décision**, en une phrase. La règle reste active
     et tu continues de l'appliquer — mais **dis-le quand tu t'appuies dessus**, et ne bloque
     pas sur sa `confiance` : propose de rouvrir le dossier. Ne pas confondre avec `confiance`
     (la solidité du raisonnement d'origine, passive) ni avec `revoir_si` (une condition
     future) : `a_rouvrir` dit qu'on y est **maintenant**.

2. **En cas de remplacement** : la nouvelle fiche porte `remplace: <ancien-id>` ; l'ancienne
   passe en `statut: remplacé` + `remplace_par: <nouvel-id>`. **Ne réécris jamais le corps de
   l'ancienne** — sa trajectoire est la moitié de sa valeur. Ajoute-lui seulement un encadré
   `> ⚠️ Remplacé le <date> par <id>` sous le titre.

3. **Régénérer l'index** :
   ```bash
   node .scripts/gen-arbitrages.mjs
   ```
   S'il bloque, corrige la fiche — ne contourne jamais un contrôle.

4. **Le rétrolien** : dans chaque fichier listé en `gouverne`, une mention
   `→ voir arbitrage <id>`. Si le fichier ne s'y prête pas (script, dossier), note-le dans le
   récap plutôt que de forcer. C'est ce qui répare le défaut nº1 des journaux de décision :
   être déconnectés de ce qu'ils décrivent.

5. **Le journal de bord** : une **mention + un pointeur**, jamais le contenu de la décision.

---

## Étape 5 — Les amendements

Si l'arbitrage change une règle déjà écrite dans les instructions permanentes du système
(`CLAUDE.md`, doctrine, conventions) :

- **Propose l'amendement en chat**, texte exact à l'appui.
- **Ne l'applique jamais de ta propre initiative.**
- La règle amendée doit **citer** l'arbitrage (`→ voir arbitrage <id>`) et **cesser de porter le
  pourquoi** : un fait vit à un seul endroit.

---

## Interdits

- **Inventer une raison de rejet.** Si elle n'est attestée nulle part, écris
  « raison de rejet non documentée, à confirmer » — et dis-le.
- **Écrire la fiche avant l'accord** de l'étape 3.
- **Marquer `provenance: tranché-en-session`** sur une reconstruction. Une IA qui reconstitue un
  historique capture le *quoi* et fabrique le *pourquoi* — le champ existe pour ça.
- **Appliquer un amendement des instructions permanentes** sans validation.
- **Réécrire une fiche remplacée** autrement que pour poser son statut et son chaînage.
- **Contourner un contrôle bloquant** du générateur.

---

## Consulter un arbitrage (lecture)

Quand on te demande « pourquoi on avait choisi X » ou « qu'est-ce qu'on avait écarté » :
ouvre la fiche, ne te contente pas de la ligne d'index. La ligne porte la règle ; la fiche porte
la justification — et c'est la justification qui est demandée.

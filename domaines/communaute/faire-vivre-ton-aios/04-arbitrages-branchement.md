---
type: support
resume: Arbitrages branchements : pièce jointe de la leçon « Les arbitrages : trace tes décisions »
statut: publie
domaine: communaute
cree: 2026-08-28
maj: 2026-10-24
liens: [04-les-arbitrages-trace-tes-decisions.md]
---
---
titre: Brancher la couche décisionnelle sur un AIOS
role: mode d'emploi d'installation — destiné à l'agent, pas à l'utilisateur
---

# Brancher les arbitrages — les 4 collages

> **Agent, ce fichier est pour toi.** L'utilisateur t'a téléchargé un pack de quatre fichiers et
> t'a demandé de l'installer. Voici la procédure. Adapte les chemins ci-dessous à **sa** structure
> réelle plutôt que de les recopier tels quels, et **montre-lui les modifications de son
> `CLAUDE.md` avant de les appliquer** — c'est son fichier le plus sensible.
>
> Deux choses à lui demander si elles ne sont pas déductibles de son système : où vivent ses
> instructions permanentes, et quels sont ses vrais domaines de travail (pour la liste des
> portées, § Collage nº 3 bis).

La skill, le gabarit et le générateur ne servent à rien tant que l'agent ne **lit pas** l'index à
chaque session. C'est ce que fait ce fichier : il donne les blocs exacts à poser, et l'ordre dans
lequel les poser. Il porte aussi le code complet du générateur (collage nº 0 bis).

Compte 15 minutes. Rien ici n'est optionnel sauf le collage nº 4.

---

## L'arborescence cible

```
ton-vault/
├── CLAUDE.md                       ← collage nº 1 (ou AGENTS.md, ou tes instructions permanentes)
├── .ai/
│   └── arbitrages/                 ← NOUVEAU
│       ├── _TEMPLATE.md            ← arbitrages-TEMPLATE.md, renommé
│       ├── arbitrages.md           ← GÉNÉRÉ, ne jamais éditer à la main
│       └── <un-fichier-par-décision>.md
├── .scripts/
│   └── gen-arbitrages.mjs          ← écrit au collage nº 0 bis (code fourni ici)
└── .claude/
    └── skills/
        ├── arbitrage/SKILL.md      ← arbitrage-SKILL.md, renommé
        └── close/SKILL.md          ← collage nº 4, si tu as déjà /close
```

**Pourquoi `.ai/` et pas `.claude/`** — deux raisons. C'est de la couche de pilotage : un dossier
technique n'a rien à faire dans ton arbre de notes, il le pollue et il finit dans tes recherches.
Et `.ai/` est **agnostique du modèle** : une décision tranchée doit survivre à un changement
d'agent, une slash command propriétaire non.

---

## Collage nº 0 — poser les fichiers

Crée les dossiers manquants, puis déplace et **renomme** les deux fichiers installables. Ces
renommages ne sont pas cosmétiques — ils cassent en silence s'ils sont ratés :

| Fichier du pack | Devient | Pourquoi ce nom |
|---|---|---|
| `arbitrage-SKILL.md` | `.claude/skills/arbitrage/SKILL.md` | Une skill est un fichier nommé `SKILL.md` **dans** un dossier qui porte son nom. Posé en vrac, il ne se déclenche jamais et rien ne prévient. |
| `arbitrages-TEMPLATE.md` | `.ai/arbitrages/_TEMPLATE.md` | Le tiret bas dit au générateur d'ignorer ce fichier. Sans lui, le gabarit est lu comme une vraie fiche et bloque la génération. |

`arbitrages-BRANCHEMENT.md` (ce fichier) et `arbitrages-EXEMPLE.md` ne s'installent pas : ils se
lisent. Ne les copie pas dans `.ai/arbitrages/` — l'exemple y serait pris pour une vraie décision.

Le troisième fichier installable, le générateur, n'est pas fourni séparément : son code est en
entier au collage suivant.

---

## Collage nº 0 bis — écrire le générateur

Écris le bloc ci-dessous dans `.scripts/gen-arbitrages.mjs`.

> **Copie-le à l'identique. Ne le réécris pas de mémoire, ne l'abrège pas, ne « simplifies » rien.**
> Ces 415 lignes portent les contrôles qui font tout l'intérêt du système : le refus de générer
> quand une fiche n'a pas d'options écartées, le contrat de frontmatter, le chaînage des
> remplacements, le plafond. Un générateur reconstitué approximativement laisse passer des fiches
> vides — et l'utilisateur ne s'en apercevra jamais, puisque justement rien ne bloquera.
>
> Les **seules** modifications autorisées sont celles du collage nº 3 bis (la liste des portées) et,
> si le script n'est pas rangé dans un dossier situé à la racine, la constante `ROOT` en tête.

Vérifie ensuite qu'il tourne : `node .scripts/gen-arbitrages.mjs`. Il doit répondre
`✅ … généré — 0/80 actifs` tant qu'aucune fiche n'existe.

```javascript
#!/usr/bin/env node
// gen-arbitrages.mjs — Génère l'index des arbitrages à partir des fiches, et valide leur contrat.
//
// Zéro dépendance. Node 18+. À poser dans le dossier de scripts de ton second cerveau.
//
// Régénérer l'index (après avoir ajouté ou modifié une fiche) :
//   node .scripts/gen-arbitrages.mjs
//
// Vérifier sans rien écrire (sort en code 1 si l'index est désynchronisé — pour un audit auto) :
//   node .scripts/gen-arbitrages.mjs --check
//
// ─────────────────────────────────────────────────────────────────────────────
//  À ADAPTER — les trois seules choses à régler avant la première exécution
// ─────────────────────────────────────────────────────────────────────────────
//  1. RACINE      — où vit ton second cerveau, vu depuis ce script.
//  2. DOSSIER     — où vivent les fiches d'arbitrage.
//  3. PORTEES     — ton vocabulaire de facettes (voir le bloc PORTEES plus bas).
// ─────────────────────────────────────────────────────────────────────────────

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. RACINE — par défaut : le dossier parent de ce script (donc `.scripts/` → racine du vault).
//    Si tu ranges ce script ailleurs, corrige le nombre de ".." ici.
const ROOT = path.resolve(__dirname, "..");

// 2. DOSSIER des fiches, relatif à la racine. `.ai/` = couche de pilotage, hors de ton arbre
//    de notes : ça évite qu'un dossier technique pollue ton explorateur.
const DIR = path.join(ROOT, ".ai", "arbitrages");
const OUTPUT = path.join(DIR, "arbitrages.md");

const IGNORE = new Set(["_TEMPLATE.md", "arbitrages.md"]);

// 3. PORTEES — le vocabulaire CONTRÔLÉ des facettes. C'est le dispositif anti-fragmentation :
//    l'agent mappe sur une valeur existante, il n'en invente jamais une en silence — sinon tu
//    te retrouves avec trois valeurs pour la même chose et le filtrage ne veut plus rien dire.
//    Adapte les libellés à TES domaines. Reste sous ~6 valeurs : au-delà, ce n'est plus une
//    facette, c'est une taxonomie, et une taxonomie ne se tient pas à jour toute seule.
const PORTEES = ["systeme", "donnees", "contenu", "design", "business"];
const PORTEE_TITRES = {
  systeme: "systeme — structure, outillage, automatisations, agents",
  donnees: "donnees — source de vérité par objet, migrations, stockage",
  contenu: "contenu — ligne éditoriale, formats, voix, canaux",
  design: "design — palette, typo, interfaces, gabarits",
  business: "business — offre, prix, positionnement, cap",
};

const STATUTS = ["proposé", "actif", "remplacé", "abandonné"];
const PROVENANCES = ["tranché-en-session", "reconstruit"];

// `implemente` décrit l'état du MONDE, pas celui de la décision — les deux sont orthogonaux.
// Une décision peut être `actif` (elle fait autorité, l'agent l'applique) et `implemente: non`
// (la réalité ne s'y conforme pas encore). Champ optionnel, défaut `oui`. Toute autre valeur
// appelle une tâche qui comble l'écart.
const IMPLEMENTE = ["oui", "partiel", "non"];

// `a_rouvrir` est un TROISIÈME axe, orthogonal aux deux autres : la décision reste `actif`
// (l'agent l'applique — sinon il n'y a plus de règle du tout), mais tu veux la remettre en
// question. Le champ porte directement CE QUI DÉRANGE : une phrase, pas un booléen.
//   • vs `confiance`  : confiance = solidité du raisonnement d'origine (passif) ;
//                       a_rouvrir = intention explicite de rouvrir le dossier (actif).
//   • vs `revoir_si`  : revoir_si est une condition future ; a_rouvrir dit qu'on y est.
const OBLIGATOIRES = [
  "id",
  "titre",
  "statut",
  "date",
  "portee",
  "gouverne",
  "confiance",
  "revoir_si",
  "provenance",
];

const REGLE_MAX_LEN = 120;

// Le plafond compte les arbitrages ACTIFS, pas les lignes du fichier rendu : compter les lignes
// facturerait ~40 lignes de gabarit (en-tête, titres de section, table des remplacés) qu'aucune
// consolidation ne peut réduire. 80 porte la vraie peur : « on a 200 décisions écrites et
// personne ne les lit ». Au-delà, le système est en dette — il faut remplacer ou consolider,
// pas accumuler.
const PLAFOND_ACTIFS = 80;

// ── Parseur de frontmatter ────────────────────────────────────────────────────
// Gère : `k: v`, `k: [a, b]`, `k:` suivi de `  - item`, et `k:` vide.
function parseFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0].trim() !== "---") return null;
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return null;

  const fm = {};
  let currentKey = null;

  for (const line of lines.slice(1, end)) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && currentKey) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(unquote(item[1].trim()));
      continue;
    }

    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;

    currentKey = kv[1];
    const raw = kv[2].replace(/\s+#.*$/, "").trim(); // retire un commentaire de fin de ligne

    if (raw === "") {
      fm[currentKey] = null; // scalaire vide, ou liste en bloc à venir
    } else if (raw.startsWith("[") && raw.endsWith("]")) {
      const inner = raw.slice(1, -1).trim();
      fm[currentKey] = inner === "" ? [] : inner.split(",").map((s) => unquote(s.trim()));
    } else {
      fm[currentKey] = unquote(raw);
    }
  }
  return fm;
}

function unquote(s) {
  return s.replace(/^["']|["']$/g, "");
}

// ── Extraction de la règle (1re phrase de « ## La règle ») ────────────────────
// L'index ne porte QUE la règle. Elle est extraite, jamais saisie deux fois : une règle
// recopiée à la main dans un index diverge de sa fiche en trois semaines.
function extraireRegle(content) {
  const m = content.match(/^##\s+La règle\s*$([\s\S]*?)(?=^##\s|\Z)/m);
  if (!m) return null;
  const corps = m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith(">") && !l.startsWith("*("))
    .join(" ");
  if (!corps) return null;

  // 1re phrase : on coupe au premier « . » suivi d'un espace ou d'une fin.
  const phrase = corps.match(/^(.*?[.!?])(\s|$)/);
  let regle = (phrase ? phrase[1] : corps).trim();
  regle = regle.replace(/\*\*/g, "").replace(/`/g, "").replace(/\|/g, "\\|");
  if (regle.length > REGLE_MAX_LEN) {
    regle = regle.slice(0, REGLE_MAX_LEN - 1).trimEnd() + "…";
  }
  return regle;
}

// ── Contrôle « ## Écarté » non vide — LE contrôle qui définit l'objet ─────────
// Sans option écartée, ce n'est pas un arbitrage, c'est un compte-rendu. Bloquant, exprès.
function aDesEcartes(content) {
  const m = content.match(/^##\s+Écarté\s*$([\s\S]*?)(?=^##\s|\Z)/m);
  if (!m) return false;
  return m[1].split("\n").some((l) => /^\s*[-*]\s+\S/.test(l));
}

// ── Vérification d'un chemin de `gouverne` (globs tolérés) ────────────────────
function cheminExiste(motif) {
  const base = motif.split(/[*?[]/)[0].replace(/#.*$/, "").replace(/\/$/, "");
  if (!base) return true;
  return fs.existsSync(path.join(ROOT, base));
}

// ── Lecture + validation ──────────────────────────────────────────────────────
function collecter() {
  if (!fs.existsSync(DIR)) {
    return { fiches: [], erreurs: [`Dossier introuvable : ${DIR}`], avertissements: [] };
  }

  const fichiers = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md") && !IGNORE.has(f))
    .sort();

  const fiches = [];
  const erreurs = [];
  const avertissements = [];

  for (const fichier of fichiers) {
    const chemin = path.join(DIR, fichier);
    const content = fs.readFileSync(chemin, "utf-8");
    const fm = parseFrontmatter(content);
    const nom = fichier.replace(/\.md$/, "");

    if (!fm) {
      erreurs.push(`${fichier} — pas de frontmatter`);
      continue;
    }

    for (const champ of OBLIGATOIRES) {
      const v = fm[champ];
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
        erreurs.push(`${fichier} — champ obligatoire manquant ou vide : \`${champ}\``);
      }
    }

    if (fm.id && fm.id !== nom) {
      erreurs.push(`${fichier} — \`id: ${fm.id}\` ≠ nom de fichier \`${nom}\``);
    }
    if (fm.statut && !STATUTS.includes(fm.statut)) {
      erreurs.push(`${fichier} — statut inconnu : « ${fm.statut} » (attendu : ${STATUTS.join(" | ")})`);
    }
    if (fm.provenance && !PROVENANCES.includes(fm.provenance)) {
      erreurs.push(`${fichier} — provenance inconnue : « ${fm.provenance} »`);
    }
    if (fm.implemente && !IMPLEMENTE.includes(fm.implemente)) {
      erreurs.push(
        `${fichier} — \`implemente\` inconnu : « ${fm.implemente} » (attendu : ${IMPLEMENTE.join(" | ")})`
      );
    }
    if (fm.implemente && fm.implemente !== "oui" && !fm.tache) {
      avertissements.push(
        `${fichier} — \`implemente: ${fm.implemente}\` sans \`tache:\` — l'écart entre la règle et la réalité n'est rattaché à aucune tâche`
      );
    }
    for (const p of toArray(fm.portee)) {
      if (!PORTEES.includes(p)) {
        erreurs.push(
          `${fichier} — portée hors vocabulaire : « ${p} » (autorisées : ${PORTEES.join(", ")})`
        );
      }
    }
    const conf = Number(fm.confiance);
    if (fm.confiance != null && (!Number.isInteger(conf) || conf < 1 || conf > 5)) {
      erreurs.push(`${fichier} — \`confiance\` doit être un entier de 1 à 5 (lu : « ${fm.confiance} »)`);
    }
    if (fm.statut === "actif" && fm.remplace_par) {
      erreurs.push(`${fichier} — contradiction : \`statut: actif\` avec \`remplace_par\` renseigné`);
    }
    if (!aDesEcartes(content)) {
      erreurs.push(
        `${fichier} — « ## Écarté » absent ou vide. Sans option écartée ce n'est pas un arbitrage, c'est un compte-rendu.`
      );
    }

    const regle = extraireRegle(content);
    if (!regle) {
      erreurs.push(`${fichier} — « ## La règle » absent ou vide`);
    }

    for (const g of toArray(fm.gouverne)) {
      if (!cheminExiste(g)) {
        avertissements.push(`${fichier} — \`gouverne\` pointe vers un chemin inexistant : ${g}`);
      }
    }

    fiches.push({ fichier, nom, fm, regle: regle || "—" });
  }

  // Chaînage : les cibles existent, et elles pointent en retour.
  const parId = new Map(fiches.map((f) => [f.nom, f]));
  for (const f of fiches) {
    const av = f.fm.remplace;
    const ap = f.fm.remplace_par;
    if (av) {
      if (!parId.has(av)) {
        erreurs.push(`${f.fichier} — \`remplace: ${av}\` ne correspond à aucune fiche`);
      } else if (parId.get(av).fm.remplace_par !== f.nom) {
        avertissements.push(
          `chaînage asymétrique : ${f.nom} dit remplacer ${av}, mais ${av} ne pointe pas en retour`
        );
      }
    }
    if (ap) {
      if (!parId.has(ap)) {
        erreurs.push(`${f.fichier} — \`remplace_par: ${ap}\` ne correspond à aucune fiche`);
      } else if (parId.get(ap).fm.remplace !== f.nom) {
        avertissements.push(
          `chaînage asymétrique : ${f.nom} dit être remplacé par ${ap}, mais ${ap} ne pointe pas en retour`
        );
      }
    }
  }

  return { fiches, erreurs, avertissements };
}

function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

// ── Rendu de l'index ──────────────────────────────────────────────────────────
function rendre(fiches) {
  const actifs = fiches.filter((f) => f.fm.statut === "actif");
  const remplaces = fiches.filter((f) => f.fm.statut === "remplacé");
  const autres = fiches.filter((f) => !["actif", "remplacé"].includes(f.fm.statut));

  let out = "";
  out += "# Arbitrages — index (généré)\n\n";
  out += "> ⚠️ GÉNÉRÉ par `.scripts/gen-arbitrages.mjs` — NE PAS éditer à la main.\n";
  out += "> Les fiches vivent dans `.ai/arbitrages/<id>.md`. Cet index ne porte que **la règle** ;\n";
  out += "> le pourquoi et les options écartées sont dans la fiche.\n";
  out += "> **Avant de contredire une de ces lignes, ouvre la fiche** — et n'énonce jamais une règle\n";
  out += "> d'ici sans pouvoir restituer ce qui a été écarté.\n\n";

  const compte = [`${actifs.length} actifs`];
  if (remplaces.length) compte.push(`${remplaces.length} remplacé${remplaces.length > 1 ? "s" : ""}`);
  if (autres.length) compte.push(`${autres.length} autres (proposé/abandonné)`);
  const aRouvrir = actifs.filter((f) => f.fm.a_rouvrir);
  if (aRouvrir.length) compte.push(`${aRouvrir.length} à rouvrir`);
  out += compte.join(" · ") + "\n\n";

  if (aRouvrir.length) {
    out += "> **À rouvrir — tu veux les remettre en question.** L'agent continue de les appliquer\n";
    out += "> (elles sont actives), mais il **le dit quand il s'appuie dessus**, et il ne bloque pas\n";
    out += "> sur leur `confiance` : il propose de rouvrir le dossier.\n";
    for (const f of aRouvrir.sort((a, b) => a.nom.localeCompare(b.nom))) {
      out += `> - [${f.nom}](${f.nom}.md) — ${f.fm.a_rouvrir}\n`;
    }
    out += "\n";
  }

  for (const p of PORTEES) {
    const lot = actifs
      .filter((f) => toArray(f.fm.portee).includes(p))
      .sort((a, b) => a.nom.localeCompare(b.nom));
    if (!lot.length) continue;

    out += `## ${PORTEE_TITRES[p]}\n\n`;
    out += "| Arbitrage | La règle | Gouverne | Conf. |\n";
    out += "|---|---|---|---|\n";
    for (const f of lot) {
      const gouverne = toArray(f.fm.gouverne)
        .map((g) => `\`${g}\``)
        .join(" · ");
      // La règle fait autorité même si la réalité ne suit pas encore : on la marque,
      // on ne la dégrade pas. L'agent doit l'appliquer ET savoir que l'écart existe.
      const ecart =
        f.fm.implemente && f.fm.implemente !== "oui"
          ? ` **[à implémenter${f.fm.implemente === "partiel" ? " — partiel" : ""}]**`
          : "";
      // La règle s'applique toujours, mais l'agent doit dire que tu veux la rouvrir.
      const rouvrir = f.fm.a_rouvrir ? ` **[à rouvrir]**` : "";
      out += `| [${f.nom}](${f.nom}.md)${ecart}${rouvrir} | ${f.regle} | ${gouverne} | ${f.fm.confiance} |\n`;
    }
    out += "\n";
  }

  if (autres.length) {
    out += "## En attente (proposé / abandonné)\n\n";
    out += "| Arbitrage | Statut | Date |\n|---|---|---|\n";
    for (const f of autres.sort((a, b) => a.nom.localeCompare(b.nom))) {
      out += `| [${f.nom}](${f.nom}.md) | ${f.fm.statut} | ${f.fm.date} |\n`;
    }
    out += "\n";
  }

  if (remplaces.length) {
    out += "---\n\n";
    out += "## Remplacés — hors contexte, pour la trajectoire\n\n";
    out += "| Arbitrage | Remplacé par | Date |\n|---|---|---|\n";
    for (const f of remplaces.sort((a, b) => a.nom.localeCompare(b.nom))) {
      const par = f.fm.remplace_par
        ? `[${f.fm.remplace_par}](${f.fm.remplace_par}.md)`
        : "—";
      out += `| [${f.nom}](${f.nom}.md) | ${par} | ${f.fm.date} |\n`;
    }
    out += "\n";
  }

  return out;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const check = process.argv.includes("--check");
  const { fiches, erreurs, avertissements } = collecter();

  if (erreurs.length) {
    console.error(`❌ ${erreurs.length} erreur(s) bloquante(s) — index NON régénéré :\n`);
    for (const e of erreurs) console.error(`   • ${e}`);
    process.exit(1);
  }

  const contenu = rendre(fiches);
  const nbLignes = contenu.split("\n").length;
  const actifs = fiches.filter((f) => f.fm.statut === "actif").length;
  if (actifs > PLAFOND_ACTIFS) {
    avertissements.push(
      `${actifs} arbitrages actifs (> ${PLAFOND_ACTIFS}) — le système est en dette : remplace ou consolide`
    );
  }

  if (check) {
    const actuel = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf-8") : "";
    if (actuel !== contenu) {
      console.error("❌ index désynchronisé — relance `node .scripts/gen-arbitrages.mjs`");
      process.exit(1);
    }
    console.log(`✅ index à jour — ${fiches.length} fiche(s), ${actifs} actifs, ${nbLignes} lignes.`);
  } else {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(OUTPUT, contenu, "utf-8");
    const sup = fiches.filter((f) => f.fm.statut === "remplacé").length;
    console.log(
      `✅ ${path.relative(ROOT, OUTPUT)} généré — ${actifs}/${PLAFOND_ACTIFS} actifs, ${sup} remplacés, ${nbLignes} lignes.`
    );
  }

  if (avertissements.length) {
    console.log(`\n⚠️  ${avertissements.length} avertissement(s) :`);
    for (const a of avertissements) console.log(`   • ${a}`);
  }
}

main();
```

---

## Collage nº 1 — la carte (dans `CLAUDE.md`)

Dans le tableau qui dit à ton agent où trouver quoi, ajoute une ligne :

```markdown
| **Ce qui a été tranché, et contre quoi** | index `.ai/arbitrages/arbitrages.md` → fiches `.ai/arbitrages/<id>.md` |
```

Puis, à la fin de `CLAUDE.md`, l'import qui charge l'index à chaque session :

```markdown
@.ai/arbitrages/arbitrages.md
```

> ⚠️ **La syntaxe `@` est propre à Claude Code.** C'est pour ça qu'on met **les deux** : la ligne
> de la carte *et* l'import. Un agent qui n'interprète pas `@` lit quand même le pointeur et va
> chercher le fichier — un aller-retour de plus, pas un blocage.

---

## Collage nº 2 — le réflexe de lecture (dans `CLAUDE.md`)

C'est **le bloc qui fait tout le travail**. Sans lui, tu as un dossier de fichiers que personne
n'ouvre — exactement le mal qu'on cherche à éviter.

```markdown
**Les arbitrages — ce qui a été tranché.** L'index ci-dessous est chargé à chaque session : il
porte **la règle** de chaque arbitrage actif, en une ligne. Le **pourquoi** et les **options
écartées** vivent dans la fiche, à ouvrir à la demande.

> **Avant tout changement structurel, ou avant de contredire quoi que ce soit** : cherche les
> arbitrages dont `gouverne` matche le chemin que tu t'apprêtes à toucher. **Si tu vas contredire
> un arbitrage `actif`, arrête-toi et dis-le** — avec son `id` et sa `confiance` (à 5 tu bloques,
> à 2 tu signales la fragilité). Et **n'énonce jamais une règle de l'index sans pouvoir ouvrir la
> fiche et restituer ce qui a été écarté** : une règle qu'on applique sans pouvoir la justifier
> est un dogme, et c'est exactement ce qu'un arbitrage doit empêcher.
>
> Écrire un arbitrage → skill `arbitrage`. L'index est **généré**
> (`node .scripts/gen-arbitrages.mjs`), jamais édité à la main.
```

Colle ce bloc **juste avant** l'import `@` du collage nº 1 : l'agent lit la consigne, puis la
table qu'elle décrit.

---

## Collage nº 3 — la règle de partage (dans `CLAUDE.md`)

Trois objets ne doivent jamais se confondre, sinon tu réécris le même fait à trois endroits et
les trois divergent. Colle ce tableau dans la section de ton `CLAUDE.md` qui parle de tes règles :

```markdown
### Une décision tranchée vit dans une fiche, pas dans une règle

Une **règle** dit ce qui fait autorité maintenant ; un **arbitrage** dit comment on y est arrivé
et **contre quoi**. Les deux ne vivent pas au même endroit :

| | Porte | Où | Chargé |
|---|---|---|---|
| **La règle** | l'impératif, au présent | `CLAUDE.md`, tes conventions | toujours |
| **L'arbitrage** | le pourquoi + les options écartées | `.ai/arbitrages/<id>.md` | à la demande |
| **L'index** | la règle de chaque arbitrage actif, en une ligne | `.ai/arbitrages/arbitrages.md` (généré) | toujours |
| **Le journal** | une mention + un pointeur, jamais le contenu | `log.md` | jamais |

- **Une règle cite son arbitrage et cesse de porter son pourquoi** (`→ voir arbitrage <id>`).
  Un fait vit à un seul endroit ; les autres pointent.
- **Jamais de suppression ni de réécriture.** Une décision qui change ⇒ une nouvelle fiche ;
  l'ancienne passe en `remplacé` avec chaînage dans les deux sens. La trajectoire est la moitié
  de la valeur.
```

---

## Collage nº 3 bis — caler les portées sur ses vrais domaines

Les **portées** sont les familles dans lesquelles les décisions se rangent. Le pack en propose cinq
par défaut : `systeme`, `donnees`, `contenu`, `design`, `business`.

C'est un **vocabulaire contrôlé** : le générateur refuse une valeur qu'il ne connaît pas. C'est
voulu — sans ça, on obtient trois noms différents pour la même famille et le classement ne veut
plus rien dire.

Demande à l'utilisateur si ces cinq familles correspondent à ses domaines de travail. Si non,
remplace la liste — mais **aux trois endroits à la fois**, sinon la première génération échoue :

| Fichier | Ce qu'il faut modifier |
|---|---|
| `.scripts/gen-arbitrages.mjs` | les constantes `PORTEES` **et** `PORTEE_TITRES` (elles doivent porter les mêmes clés) |
| `.ai/arbitrages/_TEMPLATE.md` | le commentaire de la ligne `portee:` |
| `.claude/skills/arbitrage/SKILL.md` | la liste de l'étape 3 (« Portée : … ») |

Reste sous six valeurs. Au-delà, ce n'est plus une facette de filtrage, c'est une taxonomie — et
une taxonomie ne se tient pas à jour toute seule.

---

## Collage nº 4 — le filet (dans ta skill `/close`)

**Optionnel, et seulement si tu as déjà un rituel de clôture** (la skill `close` de la leçon C10-L1).
Insère cette étape entre l'inventaire et l'écriture :

```markdown
## Étape 1 bis — Audit des arbitrages

**`/close` audite, il ne produit pas.** Le producteur est la skill `arbitrage`, au moment où la
décision se prend — écrire après coup est un anti-pattern nommé : le pourquoi s'évapore. Ici on
attrape ce qui est passé au travers, rien de plus.

Pour chaque décision de l'étape 1, vérifier si elle a déjà sa fiche dans `.ai/arbitrages/`
(lire l'index, puis `grep -ril "<mot-clé>" .ai/arbitrages/`). Classer :

| Verdict | Ce qu'on fait |
|---|---|
| **tracé** | rien |
| **manquant** | proposer la fiche, l'écrire **après accord** via la skill `arbitrage`, en `provenance: tranché-en-session` |
| **sous le seuil** | le dire en une ligne, n'écrire aucune fiche |

Le seuil est dans la skill `arbitrage` (au moins 3 sur 4 : change la façon dont le système est
bâti · difficilement réversible · affecte les sessions suivantes · avait de vraies alternatives).

Si une fiche est écrite : régénérer l'index (`node .scripts/gen-arbitrages.mjs`), poser le
rétrolien depuis les fichiers de `gouverne`, et **proposer** l'amendement de `CLAUDE.md` si la
règle change — jamais l'appliquer en silence.
```

Et corrige l'étape d'écriture de ton `/close` : le journal de bord ne reçoit plus qu'**une
mention et un pointeur**, jamais le contenu de la décision.

---

## Le test qui prouve que c'est branché

Écris une première fiche (n'importe quelle décision réelle que tu as déjà prise), lance
`node .scripts/gen-arbitrages.mjs`, puis **ouvre une session neuve** et demande :

> « Qu'est-ce qu'on a tranché sur \<le sujet de ta fiche\> ? »

L'agent doit répondre **sans que tu lui donnes le chemin**, et être capable d'enchaîner sur
« et qu'est-ce qu'on avait écarté ? ». S'il ne trouve pas, c'est le collage nº 1 : l'import ne
remonte pas jusqu'à lui.

Deuxième test, celui qui compte vraiment : propose-lui **exactement l'option que tu as écartée**
dans ta fiche. Il doit s'arrêter et te le dire, en citant l'`id` et la `confiance`. C'est tout
l'objet du système — pas archiver, **refuser**.

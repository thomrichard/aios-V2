---
type: support
resume: Leçon Skool de « Crée ton AIOS Personnel » : Pourquoi un système, pas une stack
statut: publie
domaine: communaute
cree: 2026-05-25
maj: 2026-06-11
liens: [cree-ton-aios-personnel.md, https://www.skool.com/club-smart/classroom/f93a2706?md=7c68dde111ee4738a91a04aec25251fa]
---
# Pourquoi un système, pas une stack

> **Promesse de la leçon :** comprendre pourquoi accumuler des outils IA ne mène nulle part, et ce qui change quand tu construis un système au lieu d'une stack.

---

## Ce que tu construis ici (définition courte)

Un **AIOS** — Système d'Exploitation IA Personnel — est la couche qui organise comment l'IA travaille pour toi. Concrètement : un dossier de fichiers texte qui contient ton contexte, tes méthodes et tes automatisations, et qu'une IA lit et alimente avec toi.

La définition complète et les 4 piliers arrivent en L2. Cette première leçon pose le raisonnement de fond : pourquoi un _système_, et pas une collection d'outils.

---

## Le besoin que ça couvre

Un AIOS répond à cinq besoins précis que l'usage isolé des outils IA ne couvre pas :

- **Réutiliser ce qui marche** — un prompt efficace, une automatisation réussie : écrits une fois, disponibles pour toujours
- **Retrouver l'information** — chaque fichier a une place définie ; toi et l'IA savez où chercher
- **Garder une mémoire** — l'IA sait qui tu es, ce que tu fais et tes règles, sans que tu réexpliques à chaque session
- **Survivre aux changements d'outils** — tu changes de LLM ou d'application sans perdre ce que tu as construit
- **Transmettre** — le système est documenté : tu peux l'expliquer, le déléguer, le reprendre dans six mois

Une stack d'outils ne couvre aucun de ces cinq besoins. Un système les couvre tous. Voyons la différence.

---

## Stack vs système — la différence qui change tout

### Une stack, c'est :

- Un empilement d'outils
- Chaque outil pour une tâche isolée
- Tu recommences à chaque tâche
- Bloqué quand un outil change ou disparaît
- Personne ne peut le reprendre à ta place
- Ça vit dans ta tête

### Un système, c'est :

- Une architecture cohérente
- Les outils servent des fonctions définies
- Tu capitalises tâche après tâche
- Portable, l'outil est interchangeable
- Documenté, transmissible
- Ça vit en dehors de ta tête

Une stack, c'est ce que tu as quand tu collectionnes des outils. Un système, c'est ce que tu as quand tu décides comment ces outils s'articulent autour de **toi** et de **ton travail**.

---

## Les 4 piliers d'un AIOS : CAPE

Un AIOS s'articule autour de **4 piliers**, qu'on résume avec l'acronyme **CAPE** : **C**ontexte, **A**ccès, **P**roduction, **E**ntretien.

Pourquoi **CAPE** ? Parce que c'est exactement ce que ton AIOS te donne — une cape de super-héros. Tu gardes ton identité, ton boulot, ta vie, mais tu gagnes un pouvoir : celui de faire plus, mieux, plus longtemps, sans t'épuiser.

Ce que recouvre vraiment chaque pilier, et pourquoi ils se construisent dans cet ordre précis — c'est tout l'objet de la leçon 2.

---

## Les 3 promesses d'un AIOS bien construit

### 1. Il est tool-agnostic

Tu peux le construire avec Claude Code, avec un autre coding agent, ou même en partie avec un setup plus modeste. Ton AIOS n'est pas locké sur un outil.

Ce que tu apprends ici fonctionne :

- Que tu utilises Claude Code, Codex, Cursor, ou autre
- Que tu sois sur Mac, Windows, ou Linux
- Que ta stack soit Notion/Airtable/Make ou Obsidian/Google Sheets/n8n

Le **mécanisme** ne change pas. Les outils que tu branches dedans, oui.

C'est pour ça qu'on ne va pas faire une leçon "comment brancher Skool" ou "comment brancher Airtable" : tu les brancheras toi, avec **ta** stack. Ce qu'on t'apprend, c'est le squelette.

### 2. Il est anti-dépendance LLM (le vrai moat)

C'est probablement la promesse la plus importante, et celle dont personne ne parle.

Ton AIOS est construit sur des fichiers `.md` — du texte brut, lisible par n'importe quel humain et par n'importe quelle IA.

Concrètement :

- Si **Claude triple ses tarifs** demain → tu bascules ton AIOS sur un autre LLM en quelques heures
- Si un nouveau modèle plus puissant sort dans 6 mois → tu testes, tu compares, tu switches si ça vaut le coup
- Si Anthropic ferme demain → ton système survit (le contenu est à toi, sur ta machine)
- Si tu veux essayer un setup local (Ollama, LM Studio…) → tu peux

C'est l'inverse d'un SaaS "IA tout-en-un" qui t'enferme — on verra en L2 pourquoi, dans cette histoire, tu veux être **propriétaire** de ton système et pas locataire de celui d'un autre.

> **À retenir.** Tu ne construis pas un AIOS pour un LLM. Tu construis un AIOS _qui sait travailler avec un LLM, n'importe lequel_.

### 3. Il capitalise dans le temps

Une stack te fait perdre du temps à chaque nouvelle tâche. Un AIOS te fait **gagner du temps** à chaque nouvelle tâche.

La différence se voit au bout de 3 mois :

- Tu n'écris plus le même prompt 10 fois — tu as une _skill_ qui le contient
- Tu ne ré-expliques plus ton activité — l'AIOS la connaît
- Tu ne refais plus la même auto deux fois — tu la fais une fois, elle est dispo partout
- Tu reviens 6 mois plus tard sur un projet ? Le système se souvient à ta place

Plus tu utilises ton AIOS, plus il devient utile. C'est de l'**intérêt composé** appliqué à ton travail.

---

## Un seul Vault, plusieurs portes d'entrée

Concrètement, ton AIOS vit dans un **Vault**. Le mot impressionne, la réalité non : c'est un simple dossier sur ton ordinateur, rempli de fichiers texte `.md` organisés, que l'IA lit et alimente avec toi. Pas de base de données, pas de logiciel propriétaire. Un dossier.

Et c'est ce qui explique un truc important : ce dossier s'utilise depuis **plusieurs interfaces**. Rien que côté Claude :

- **Claude Cowork** — dans le navigateur ou sur l'application mobile
- **Claude Code** — dans Visual Studio Code ou dans le terminal

Et au-delà de Claude : n'importe quel LLM ou agent capable de lire des fichiers peut travailler avec ton Vault.

La mémoire est unique — le dossier. Les interfaces ne sont que des portes d'entrée, interchangeables. Tu choisis la porte selon le moment : le mobile pour capturer une idée dans la file d'attente, Visual Studio Code pour les vraies sessions de travail. Ton AIOS, lui, ne bouge pas.

---

## Pourquoi maintenant (et pas il y a 2 ans)

Trois conditions sont réunies pour la première fois en 2025-2026 :

1. **Les LLMs sont matures** — Claude 4, GPT-5, Gemini 3… on a passé le cap du "joli mais imprévisible". On peut compter dessus pour de la production
2. **Les standards émergent** — MCP (Model Context Protocol), les skills Anthropic, les agents… il y a maintenant des conventions qu'on peut apprendre une fois et réutiliser
3. **Le format ****`.md`**** s'impose** comme la lingua franca des AIOS — un truc qu'on aurait dit "trop simple" il y a deux ans est devenu le format standard pour faire parler humains et IA

Avant 2025 : tu pouvais bricoler. Maintenant : tu peux construire un vrai système.

---

## Le contrat de cette série

Avant de continuer, je veux être clair sur ce que ce cours est, et ce qu'il n'est pas :

**Ce cours est :**

- Un parcours pour **construire** ton AIOS, pas pour le comprendre dans l'abstrait
- **Tool-agnostic** : tu suis avec ta propre stack
- **Build-in-public** : je te montre mon AIOS en chantier — pas un système "fini" et lustré
- **Pour quelqu'un qui veut optimiser UNE activité** — perso, freelance, side business, peu importe

**Ce cours n'est pas :**

- Une formation Claude Code (même si je l'utilise — voir L3 pourquoi)
- Un cours d'automatisation no-code généraliste (Make, n8n, Zapier)
- Un truc qui marche "tout seul" : tu vas devoir construire et entretenir
- Une promesse "AI 10x ta productivité du jour au lendemain" — je vise plutôt +30% au bout d'un mois, +50% au bout de trois

Si ce contrat te va, on continue.

---

## Ce que tu vas construire (le plan des 6 prochaines leçons)

- **L2 — C'est quoi un AIOS (vraiment)** : la définition rigoureuse, les 4 piliers CAPE détaillés, et le parallèle avec les OS classiques
- **L3 — Setup : VS Code + Claude Code + ton premier Vault** : la stack reco et pourquoi, comment l'installer sans se prendre la tête
- **L4 — IPCRA : la structure qui tient** : comment organiser ton Vault pour qu'il scale (et ne devienne pas un dépotoir)
- **L5 — CLAUDE.md, doctrine, conventions : la mémoire qui scale** : le pilier **Contexte** en action
- **L6 — Les liens ****`[[]]`**** : naviguer ton AIOS comme un cerveau** : le truc le plus sous-estimé d'Obsidian (une app gratuite de notes qu'on ajoutera à ce moment-là) — comment les wikilinks transforment ton Vault en graphe vivant
- **L7 — Skills : du prompt jetable au système qui apprend** : le pilier **Production** — comment transformer un prompt qui marche en une compétence réutilisable
- **L8 — Crons, boucles, audit : l'AIOS qui tourne tout seul et qui s'améliore** : le pilier **Entretien** — la routine hebdo qui fait évoluer ton système

À la fin du parcours, tu as :

- Un Vault structuré, à toi — ton dossier de fichiers, lisible par n'importe quel LLM
- 5-7 skills qui prennent en charge tes tâches répétitives
- Au moins une routine automatisée qui tourne sans toi
- Une boucle hebdo pour faire évoluer le système

---

## Prochaine étape

→ **Leçon 2 — C'est quoi un AIOS (vraiment)**

On va y poser la définition rigoureuse, détailler les 4 piliers **CAPE**, et faire le parallèle avec les systèmes d'exploitation classiques (parce que ça aide à comprendre ce qu'on construit).

> **À retenir de cette leçon**
> Un **AIOS** est la couche qui organise comment l'IA travaille pour toi — détaillé en L2 avec ses 4 piliers **CAPE**.
> Il couvre cinq besoins qu'aucune stack ne couvre : réutiliser, retrouver, mémoriser, survivre aux changements d'outils, transmettre.
> Une stack, c'est un empilement d'outils. Un système, c'est une architecture cohérente autour de toi.
> Les 3 promesses d'un AIOS bien construit : tool-agnostic, anti-dépendance LLM, capitalisation dans le temps.
> Ton AIOS vit dans un **Vault** — un simple dossier de fichiers `.md` — utilisable depuis plusieurs portes d'entrée (Cowork, mobile, Visual Studio Code, terminal… et n'importe quel LLM).
> Le moat principal : tes fichiers `.md` survivent à n'importe quel changement de LLM.

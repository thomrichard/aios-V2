# La correspondance : d'un AIOS IPCRA vers celui-ci

La structure IPCRA est celle que construit la skill `aios-bootstrap` : un vault trié par dossiers numérotés, et une couche `.claude/` qui dit à l'agent comment y travailler. Les numéros et les noms changent d'un vault à l'autre (« Casquettes », « Domaines » ou « Rôles » ; un dossier ajouté) : reconnais chaque dossier à son rôle, pas à son numéro.

## Reconnaître la structure

| Dans l'ancien AIOS | Son rôle | Couche |
|---|---|---|
| `CLAUDE.md` et le fichier qu'il importe, `moi.md`, `anti-ia.md` (dans Ressources) | Qui est l'utilisateur, comment lui parler, ses interdits | 1. Profil |
| `.claude/doctrine.md`, `.claude/conventions.md` | Où vit chaque chose, le nommage, les gabarits | 2. Règles |
| Un dossier de décisions ou d'arbitrages | Les choix déjà faits, avec ce qui a été écarté | 2. Règles |
| `MEMORY.md` ; la mémoire propre à l'agent, si elle existe (`~/.claude/projects/<dossier>/memory/`) | Les faits durables et les préférences | 3. Mémoire |
| `1 - Projets/<slug>/<slug>.md`, index `projets.md` | Ce qui a un début et une fin | 4. Projets et domaines |
| `2 - Casquettes/<slug>/<slug>.md`, index `casquettes.md` | Les responsabilités qui durent | 4. Projets et domaines |
| `.claude/skills/`, `.claude/commands/`, `.claude/agents/`, `~/.claude/skills/`, et leurs copies pour d'autres agents (`.agents/`, `.codex/`) | Ce que l'agent sait faire | 5. Skills |
| `0 - Inbox/`, `3 - Ressources/`, les autres fichiers des projets et des casquettes | Les notes et les documents | 6. Fichiers |
| `4 - Archives/`, `log.md` | Ce qui est fini, et le journal | Jamais repris |
| Un dossier de code (`Dev/`, des dépôts) | Des programmes, chacun avec sa propre vie | Jamais repris ; signale ceux qui n'ont aucune copie (pas de Git, ou pas de dépôt distant) |
| `.env`, les réglages de `.claude/`, les connecteurs, les tâches planifiées | Les clés et les branchements | Jamais repris : « À faire toi-même » |

Ne reprends jamais les fichiers `INSTRUCTIONS.md` ni les index écrits à la main (`inbox.md`, `projets.md`, `casquettes.md`, `ressources.md`, `archives.md`) : ici, les `_index.md` sont générés.

## 1. Profil

C'est le travail d'`installation`, pas le tien. Vérifie seulement qu'il est fait : la section Qui d'`AGENTS.md`, les cibles dans `domaines/operations/okr.md`, les interdits d'`anti-ia.md` en souvenirs `feedback_`. Ce qui manque : relance `installation` sur les questions restées « À définir ».

## 2. Règles

Lis `doctrine.md` et `conventions.md` règle par règle, et trie :

| La règle parle de… | Proposition | Où |
|---|---|---|
| Rangement, nommage, routing, index, liens | Laisser | Ce workspace a `systeme/doctrine.md` et `systeme/metadonnees.md` |
| Une façon de travailler propre à l'utilisateur (« montre-moi avant d'envoyer », sa source de vérité, ce qu'il valide lui-même) | Reprendre | `journal/regles.md`, au format du fichier : la date du jour, la règle, pourquoi, et « reprise de l'ancien AIOS » |
| Le ton, l'écriture, un interdit | Reprendre | Un souvenir `feedback_` (couche 3) |
| Un gabarit de note qui sert encore | Adapter | Propose un type dans la section « Ce workspace » de `systeme/metadonnees.md`, et son gabarit `systeme/gabarits/<type>.md` |

Une décision d'un dossier d'arbitrages : si elle vaut pour tout le workspace, elle va dans `journal/regles.md` ; si elle vaut pour un projet repris, dans la partie « Décisions » de sa fiche ; sinon, laisser. Garde son pourquoi et ce qui a été écarté.

Une règle qui contredit ce workspace : ne tranche pas. Montre les deux, et demande.

## 3. Mémoire

Un fait, un fichier : `memory/<type>_<sujet>.md`, avec sa ligne dans `memory/MEMORY.md`.

- `user_` : un fait sur l'utilisateur. `feedback_` : une correction, une préférence. `reference_` : un standard, un emplacement.
- L'en-tête d'un souvenir : `type`, `resume`, `maj`. Dernière ligne du corps : « Source : ancien AIOS, <fichier>, <date> ».
- Laisse un fait périmé, un fait qui décrit l'ancien rangement, et un fait déjà écrit par l'installation.
- Deux faits proches se fusionnent. `memory/MEMORY.md` ne dépasse pas 100 lignes : au-delà, garde ceux qui changent ce que fait l'agent.
- La mémoire propre à l'agent : cherche tous les dossiers de `~/.claude/projects/` dont le nom ressemble à l'ancien dossier (il a pu déménager), et pars du plus récent. Le type d'un souvenir se lit dans son en-tête, pas seulement dans son nom.
- Un souvenir sur l'état d'un chantier : dans la fiche du projet, s'il est repris ; sinon, laisser.
- Une correction qui vise une skill présente ici : dans `skills/<nom>/feedback.md`, pas dans `memory/`.

## 4. Projets et domaines

**Un projet.** Lis d'abord l'index des projets et la date du dernier fichier de chacun : l'état s'y lit souvent. Ne demande que pour les cas douteux.
- En cours : `projets/<slug>.md`, au gabarit `systeme/gabarits/projet.md`. Son domaine, sa prochaine étape (« À définir » si la fiche ne la dit pas), ses tâches ouvertes, ses décisions. Les autres fichiers de son dossier passent en couche 6, avec `projet: <slug>` dans leur en-tête.
- Fini, ou à l'arrêt depuis longtemps : laisser.
- Sans fin (une maintenance, un suivi) : ce n'est pas un projet. Traite-le comme une casquette.

**Une casquette.** Compare-la aux domaines de la section « Ce workspace » de `systeme/metadonnees.md`, que l'installation a créés.
- Elle est déjà un domaine : rien à faire.
- Elle entre dans un domaine : ses fichiers iront dans ce domaine (couche 6).
- Elle est couverte par deux domaines : ses fichiers se partagent selon leur sujet.
- Sa fiche est vide, ou elle contredit ce workspace : laisser, et signale la contradiction.
- Aucun domaine ne la couvre : propose-en un. S'il est accepté : sa ligne et ses types dans « Ce workspace », son routeur (gabarit `systeme/gabarits/routeur.md`), son dossier `domaines/<domaine>/`.
- Ce que sa fiche dit de durable (ce que couvre la casquette, ses fichiers de référence) va dans le routeur du domaine.

Sept domaines au plus : au-delà, regroupe.

## 5. Skills

Une même skill existe souvent à plusieurs endroits (un lien, une copie pour un autre agent) : résous les liens, compte-la une fois, et note sa source.

Pour chaque skill, commande ou agent de l'ancien AIOS, dans cet ordre :

1. **Ce workspace fait déjà la même chose : laisser.** Écris ce qui la remplace.

   | Ancienne skill ou opération | Ici |
   |---|---|
   | `aios-bootstrap` | `installation` |
   | `close`, un résumé de fin de session | `bilan`, `fermer` |
   | `onboard`, une reprise de session | `reprendre` |
   | Ingest (intégrer une source) | `fiche`, puis `classer` |
   | Lint (liens brisés, orphelines) | `systeme/scripts/verifier.py` |
   | Query (répondre par l'index) | La carte d'`AGENTS.md`, puis un routeur ou un index |
   | Un entretien, un interview | `grill-me` |

2. **Elle vient d'un auteur extérieur, d'un plugin ou d'une application** (un dossier de plugin, un fichier `skills-lock.json`, des skills synchronisées par une application) : laisser. Elle se réinstalle avec son outil : ajoute-la à « À faire toi-même ».
3. **Elle est à l'utilisateur.** Demande si elle sert encore. Sinon : laisser.
4. **Elle sert encore : adapter.** Écris `skills/<nom>/SKILL.md` au gabarit `systeme/gabarits/SKILL.md` :
   - l'en-tête : `name`, une `description` avec ses mots déclencheurs, et une famille de `systeme/metadonnees.md` (aucune ne convient : propose-en une dans « Ce workspace ») ;
   - 80 lignes au plus : le détail, les exemples et les longs gabarits vont dans `references/` ;
   - les anciens chemins (`1 - Projets/`, `3 - Ressources/`) deviennent ceux de ce workspace, les `[[liens]]` deviennent des chemins ;
   - ses scripts et ses fichiers la suivent dans son dossier. Un script qui lit une clé : dis laquelle, sans l'ouvrir.
5. Une commande (`.claude/commands/<nom>.md`) qui sert encore devient une skill, de la même façon, ou une référence de la skill reprise sur laquelle elle s'appuie. Un agent (`.claude/agents/`) : laisser, et le noter dans « À faire toi-même ».

Une skill de `~/.claude/skills/` est déjà chargée dans tous les dossiers : laisser, sinon elle existerait deux fois sous le même nom. Reprends-la seulement si ce workspace doit marcher sur une autre machine ou avec un autre agent ; elle est alors copiée, jamais retirée de là.

## 6. Fichiers

Seulement ce qui sert encore. Propose par sous-dossier, pas par fichier, et écris pour chaque ligne son nombre de fichiers et le nombre de lots que sa reprise demande : l'utilisateur voit le coût avant de dire oui.

1. Par lots de 20 fichiers au plus. Copie le lot dans `inbox/`.
2. Pour chaque fichier : `fiche` s'il s'agit de texte brut ou d'un fichier sans en-tête possible (PDF, image), puis `classer`. Une note qui a déjà un en-tête garde son contenu ; son en-tête est réécrit avec les champs de `systeme/metadonnees.md` (ses anciennes étiquettes vont dans `themes`).
3. Une ressource durable devient un `concept` ou une `source`, dans `savoir/`.
4. Un `[[lien]]` vers une note reprise devient un lien Markdown avec son chemin. Vers une note laissée : garde le texte, sans les crochets.
5. Une image suit sa note, avec sa ligne dans `_images.md`. Une vidéo ou un son part dans le dossier des fichiers lourds (`ranger.py` le fait) ; si ce dossier n'est pas réglé, laisse le fichier et dis-le.
6. Un fichier propre à un outil (un canvas, une base Obsidian) : laisser, sauf demande.
7. À la fin du lot, montre où chaque fichier est allé, et attends le oui avant le lot suivant.

## À faire toi-même

Ce que la skill ne fait jamais, et qu'elle liste dans l'inventaire :

- **Les clés et les notes sensibles.** L'utilisateur recopie lui-même ses clés dans le `.env` de ce workspace. Si l'ancien dossier n'a pas de `.env`, note seulement où ses consignes disent qu'elles vivent. Une note d'accès, de codes de secours ou de banque : il la déplace lui-même.
- **Les connecteurs.** D'après l'ancien `CLAUDE.md`, sa doctrine, ou le fichier d'outils qu'ils citent : une ligne par outil, avec ce à quoi il servait. Il se rebranche plus tard avec `search-connectors`, puis s'inscrit dans `systeme/connexions.md` après une vraie lecture.
- **Les routines.** Une ancienne tâche planifiée tourne encore sur l'ancien dossier : l'utilisateur l'éteint. Pour les trouver, cherche le chemin de l'ancien dossier là où la machine planifie, en lecture seule : `crontab -l`, `~/Library/LaunchAgents/` sur macOS, le planificateur de tâches sur Windows, et `.github/workflows/` dans l'ancien dossier. Une routine qui fait la même chose qu'une routine d'ici tourne en double : dis-le. Celles de ce workspace : `python3 systeme/scripts/routines.py etat`.
- **Les skills d'un auteur extérieur et les agents** : à réinstaller ou à recréer, si besoin.

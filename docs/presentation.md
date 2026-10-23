# AIOS v2, expliqué

> Pour qui : une personne qui ne code pas, et qui veut comprendre ce qu'est AIOS avant de l'installer ou de le présenter.
> Le mode d'emploi technique est dans le [README](../README.md). Le pourquoi de chaque choix est dans le [journal de conception](decisions.md).

## En une phrase

AIOS est un dossier de fichiers bien rangé, que ton agent IA (Claude Code, Codex ou Gemini CLI) sait lire, tenir à jour et ranger tout seul, même la nuit.

## Le problème qu'il règle

Quand on travaille avec une IA, trois choses se perdent :

- **Le contexte.** À chaque discussion, il faut réexpliquer qui on est, ce qu'on fait, ce qu'on vise.
- **Le rangement.** Les notes, les dictées, les PDF et les liens s'empilent quelque part, et personne ne les range.
- **La suite.** Ce que l'IA produit reste dans une conversation, puis disparaît.

AIOS règle les trois avec une idée simple : tout vit dans des fichiers texte, rangés selon des règles que l'IA connaît. Ce qu'elle sait de toi, elle le relit dans un fichier. Ce qu'elle produit, elle le range à sa place. Et ce qui arrive en vrac, elle le trie chaque nuit.

## Les principes

### 1. Un seul fichier de règles, pour tous les agents

`AGENTS.md` dit à l'agent qui tu es, ce que tu vises, comment tu travailles et où chercher. C'est le seul qui fait foi. `CLAUDE.md` ne fait que l'importer, et Gemini CLI est réglé pour le lire.

*Exemple : tu passes de Claude Code à Gemini CLI. Tu ne changes rien dans tes fichiers : seule la commande qui lance l'agent change.*

### 2. Un réglage, un seul endroit

Les domaines de ton activité, les sortes de fichiers que tu produis et leurs étapes se règlent dans un seul fichier : `systeme/metadonnees.md`. On change une ligne, puis un script recopie le changement partout où il sert.

*Exemple : tu ajoutes le domaine « contenu » dans ce fichier. La carte des domaines d'`AGENTS.md`, que tous les agents lisent, et l'interface SM4RT suivent d'elles-mêmes. Tu n'écris jamais ces copies à la main.*

### 3. Ranger, c'est donner les bonnes informations : la place s'en déduit

Chaque fichier texte commence par un petit en-tête : ce qu'il est (son **type**), la partie de ton activité où il vit (son **domaine**), où il en est (son **statut**), un résumé d'une ligne, sa date de naissance. Avec ces informations, sa place est connue d'avance.

*Exemple : un compte rendu de réunion du domaine « clients », daté du 23 octobre, va toujours dans `domaines/clients/<nom>-26-10.md`. Personne n'a à choisir sa place : elle découle de l'en-tête.*

### 4. Ce qui bouge est une information, pas un dossier

Le statut d'un fichier change au fil de sa vie. Il est écrit dans l'en-tête, jamais dans le nom d'un dossier. Un fichier garde donc sa place toute sa vie. Le type non plus n'est pas un dossier : il est dans l'en-tête. Seul le domaine est un dossier.

*Exemple : une vidéo passe de `sujet` à `en-cours`, puis à `a-valider`, puis à `publie`. On change un mot dans son en-tête ; le fichier ne bouge pas, et aucun lien vers lui ne casse.*

### 5. Un mot a un seul sens

Un mot est soit un type, soit un statut, jamais les deux.

*Exemple : « idée » servait à la fois de sorte de fichier et de première étape d'un contenu. Le premier statut d'un contenu s'appelle donc `sujet`.*

### 6. Un champ n'existe que si quelque chose s'en sert

On n'ajoute pas d'information « au cas où ». Le champ `cree` (la date de naissance) existe parce que le rangement s'en sert pour nommer un fichier daté.

### 7. Le jugement à l'IA, le mécanique au script

Choisir le type ou le domaine d'un document demande du jugement : c'est le travail de l'IA. Déplacer un fichier au bon endroit est mécanique : c'est le travail d'un petit script, sans IA, qui ne se trompe pas et ne coûte rien.

### 8. Dans le doute, l'IA demande au lieu de deviner

La nuit, l'agent travaille seul. Quand il hésite, il ne devine pas : il met l'élément de côté et note sa question, avec sa proposition. Tu réponds dans la journée, quand tu veux.

### 9. Le socle est neutre et portable

Le « socle » est la partie commune à tous les AIOS : règles, scripts, skills de base. Il ne contient rien de personnel. Ta personnalisation va dans des endroits précis (ton profil dans `AGENTS.md`, tes domaines dans la section « Ce workspace » de `systeme/metadonnees.md`, ta mémoire, tes projets). Tu peux donc récupérer les mises à jour du socle sans perdre ce qui est à toi.

## Au quotidien : deux portes

Tu n'as que deux dossiers à connaître. Tout le reste est rangé pour l'IA.

- **`inbox/`, la porte d'entrée.** Tu y déposes tout, en vrac : un fichier, une dictée, un lien, une note. Le fichier `inbox/capture.md` sert aux idées rapides : une par ligne.
- **`outbox/`, la porte de sortie.** Tu y lis le point du jour (`outbox/points/`), les questions qui attendent ta réponse (`outbox/questions.md`) et une page (`outbox/index.html`) qui montre ce qui est prêt.

Chaque nuit à 2 h, le rangement vide l'inbox, range chaque élément à sa place et t'écrit le point du jour.

```mermaid
flowchart LR
    Toi([Toi]) -- "dépose : fichiers, dictées, liens, idées" --> Inbox[inbox/]
    Veille([Routines de capture]) -- "ce qu'elles trouvent dehors" --> Inbox
    Inbox --> Nuit{{Rangement de nuit, 2 h}}
    Nuit -- "range à sa place" --> Domaines[domaines/, savoir/, projets/…]
    Nuit -- "écrit" --> Outbox[outbox/]
    Domaines -. "un livrable à valider s'y affiche" .-> Outbox
    Outbox -- "point du jour, questions, vitrine" --> Toi
```

Deux règles tiennent ces portes propres :

- **L'outbox est une vitrine, pas un rangement.** Un livrable reste dans son domaine. Il apparaît dans la page de l'outbox grâce à son statut `a-valider`. *Exemple : une proposition commerciale à relire reste dans `domaines/clients/` ; tu la vois dans l'outbox tant qu'elle attend ta validation.*
- **La nuit, aucune question.** Ce qui demande une réponse attend dans `outbox/questions.md`. En début de session, l'agent te dit combien il y en a et propose d'y répondre.

### Le chemin d'un élément, de l'inbox à sa place

Le rangement est découpé en trois métiers :

- `fiche` **crée** : elle écrit une fiche propre à partir d'un texte brut, d'une dictée, d'un lien ou d'un fichier qui ne peut pas porter d'en-tête (un PDF, une vidéo).
- `classer` **choisit les informations** : le type, le domaine, le statut, le résumé, le projet.
- `ranger.py` **déplace** : un script, sans IA, qui met le fichier à la place que donne son en-tête.

La routine `rangement` enchaîne les trois, chaque nuit.

```mermaid
flowchart TD
    A[Un élément dans inbox/] --> B{Qu'est-ce que c'est ?}
    B -- "texte brut, dictée, lien, PDF, vidéo, son" --> F["fiche : écrit une fiche<br/>(l'original est archivé, ou suit sa fiche)"]
    B -- "document déjà écrit" --> C
    B -- "image" --> I["rangée dans le dossier qui s'en sert,<br/>avec sa ligne dans _images.md"]
    F --> C["classer : choisit type, domaine,<br/>statut, résumé, projet"]
    C --> D{Sûr de lui ?}
    D -- non --> Q["une question dans outbox/questions.md ;<br/>l'élément attend dans l'inbox"]
    D -- oui --> R["ranger.py : déplace le fichier<br/>à la place que donne son en-tête"]
    R --> P[Sa place, pour toute sa vie]
    R -- "vidéo ou son" --> L["dossier des fichiers lourds,<br/>hors du dépôt ; la fiche garde son chemin"]
```

Trois cas particuliers :

- **Un fichier qui ne peut pas porter d'en-tête** (un PDF, un lien, une vidéo) reçoit une fiche compagnon, à son nom, qui le résume et lui sert d'index. *Exemple : `contrat-x.md` décrit `contrat-x.pdf`, et les deux vivent côte à côte.*
- **Une image** n'a pas d'en-tête : elle a sa ligne dans le fichier `_images.md` de son dossier (ce qu'elle montre, d'où elle vient, à quoi elle sert).
- **Les vidéos et les sons** sont trop lourds pour le dépôt. Ils vont dans un dossier à part, par exemple un dossier Google Drive synchronisé, réglé une fois dans `.env` (ligne `FICHIERS_LOURDS`). Leur fiche, elle, reste dans le workspace et garde leur chemin.

### La preuve : une vraie nuit

La vraie routine de nuit a tourné sur un faux AIOS : deux domaines, six éléments dans l'inbox. En une minute :

- la dictée d'un appel est devenue un compte rendu dans le domaine `clients`, et l'original a été archivé ;
- un document sans en-tête est devenu un concept ;
- une ligne de capture est devenue un sujet de newsletter ;
- le vieux point du jour a été archivé, et les routeurs mis à jour ;
- trois éléments ont été mis de côté, sans rien deviner : un PDF illisible, une vidéo sans contexte, une idée qu'aucun domaine ne couvrait ;
- le point du jour a même rappelé l'échéance de la proposition.

## L'installation

### 1. Préparer son profil, avec grill-me

Avant un atelier, chacun prépare son profil. La skill `grill-me` pose une liste de quatorze questions imposées, une à la fois, avec à chaque fois une réponse proposée à confirmer ou corriger. Les blocs : identité (le nom et le rôle de ton agent, qui tu es, comment il doit te parler), objectifs (tes trois cibles de l'année, tes objectifs du trimestre), domaines et revenus, projets en cours, outils, routines, mémoire, fichiers lourds.

Chaque réponse est notée au fur et à mesure dans une fiche. Une question sans réponse s'écrit « À définir » : elle reviendra plus tard dans le point du jour. À la fin, on obtient un profil rempli. Sans dépôt sous la main, on peut donner les trois fichiers de `skills/installation/references/` à n'importe quel Claude.

### 2. Installer en une phrase

On donne à son agent l'adresse du socle et son profil :

> Installe-moi l'AIOS : https://github.com/thomrichard/aios-V2. Mon profil est ici : <chemin du fichier>. Installe-le dans <dossier>.

L'agent récupère le socle, dépose le profil dans l'inbox et lance l'installation. Il reprend chaque réponse, la montre bloc par bloc pour validation, puis ne pose que les questions restées sans réponse. Il remplit `AGENTS.md`, crée un routeur par domaine (une fiche courte qui dit où vit quoi dans ce domaine), vérifie le workspace, et termine par un résumé de ce qui reste « À définir ».

### 3. Le catalogue propose, tu choisis

« Tout est réglable » peut faire peur au départ. Alors l'installation ne part pas d'une page blanche :

1. elle explique trois mots, avec un exemple :
   - **domaine** : une grande partie de ton activité, qui dure (par exemple « contenu ») ;
   - **type** : la sorte de fichier que tu y produis (une vidéo, une newsletter, une proposition) ;
   - **statut** : où en est un fichier dans sa vie (une vidéo passe de `sujet` à `en-cours`, à `a-valider`, puis à `publie`) ;
2. elle propose des domaines et des types tirés d'un catalogue (contenu, clients, produits, communauté, perso…), choisis d'après ton métier ;
3. tu gardes, tu renommes ou tu retires.

Le socle marche déjà sans rien régler : il fournit le domaine `operations` (pilotage, admin, l'AIOS lui-même) et des types de base (projet, livrable, compte rendu, concept, source…). Le catalogue ajoute ce qui te ressemble. Chacun repart avec son AIOS.

## Ce qui tourne tout seul

### Les routines

Une routine est une tâche lancée à heure fixe par un planificateur (cron sur un serveur, launchd sur Mac, Hermes…). Le script `systeme/scripts/lancer.py` lance la skill avec l'agent choisi dans `.env` et le modèle prévu pour elle.

Il y en a deux sortes :

- **avec IA** : un prompt qui appelle une skill, quand il y a quelque chose à juger. *Exemple : le rangement de nuit.*
- **directe** : une simple commande, sans IA, quand il n'y a rien à juger. *Exemple : mettre à jour les fiches de ses vidéos YouTube deux fois par semaine.*

Une routine **active** te remet quelque chose à lire (le point du jour). Une routine **passive** ne remonte dans le point du jour que ce qui mérite ton attention. Les passives tournent à 1 h, pour que le point du jour de 2 h reprenne leurs résultats. Chaque routine a un plafond de coût par semaine.

La liste est dans `systeme/routines.md`. Aujourd'hui, la skill du rangement de nuit existe ; elle reste à brancher sur le planificateur de chacun. La veille, l'audit mensuel et les fiches YouTube y figurent comme exemples, encore à construire.

### L'interface SM4RT

`interface/` contient SM4RT, une page locale tirée de l'Agentic OS v2 de Jay E | RoboNuggets (licence MIT), traduite en français et branchée sur le workspace. Elle s'ouvre à l'adresse `http://localhost:50000` et peut rester allumée en permanence.

On y trouve une page d'accueil, un « second cerveau » qui montre tout le workspace en 3D, et des vues Routines, Skills et Applications. Rien ne s'y écrit à la main : ses domaines, ses routines et ses applications sont recopiés depuis les réglages du workspace. Les changements faits au kit d'origine sont listés dans `interface/MODIFS.md`.

## Ce qui se règle, et où

| Je veux régler… | Où | Ce qui suit tout seul |
|---|---|---|
| Qui je suis, mon agent, le ton, mes objectifs de l'année | `AGENTS.md` (sections Qui et Objectifs) | tous les agents, à chaque échange |
| Mes domaines, mes types, leurs statuts, leur place, les champs d'en-tête | `systeme/metadonnees.md` | la carte d'`AGENTS.md`, l'interface, le vérificateur, le rangement |
| Mes projets | un fichier par projet dans `projets/` | la liste des projets actifs d'`AGENTS.md` |
| Mes routines (horaire, type, plafond) | `systeme/routines.md` | l'interface (vue Routines) |
| Le modèle d'IA de chaque skill | `systeme/modeles.md` | `lancer.py` |
| Mes outils branchés | `systeme/connexions.md` | l'interface (vue Applications) |
| L'agent qui lance les routines, le dossier des fichiers lourds | `.env` | `lancer.py`, `ranger.py` |
| Une préférence, une correction à retenir | `memory/` | l'agent, quand il en a besoin |

Voici comment un réglage se propage :

```mermaid
flowchart LR
    M["systeme/metadonnees.md<br/>(on change une ligne)"] --> S[[index.py]]
    S --> A["AGENTS.md<br/>carte des domaines, projets actifs"]
    S --> U["Interface SM4RT<br/>départements"]
    A --> C[Claude Code]
    A --> O[Codex]
    A --> G[Gemini CLI]
    M --> V[[verifier.py]]
    V -- "signale ce qui s'en écarte" --> W["fichiers à mettre à jour,<br/>routeur manquant…"]
```

Le vérificateur (`verifier.py`) est le garde-fou : il signale un en-tête qui ne suit pas les réglages, un fichier qui n'est pas à sa place, un domaine sans routeur, une carte modifiée à la main. Ce sont des alertes : elles ne bloquent rien.

## Comment l'AIOS s'améliore

Le but : une correction donnée une fois ne revient pas. L'agent s'ajuste à toi, session après session. Trois outils s'en chargent, et rien ne change sans ton accord.

- **« Retiens ».** Une préférence ou un fait qui doit durer devient un souvenir dans `memory/`, avec sa ligne dans `memory/MEMORY.md`. *Exemple : « retiens que je tutoie mes clients ».*
- **`note` : mettre un retour de côté.** Tu remarques qu'une skill pourrait mieux faire, mais tu es en plein travail. Tu dis « note pour classer : … ». L'agent écrit une ligne dans `skills/classer/feedback.md`, puis reprend là où vous en étiez. Il ne touche pas à la skill. Plus tard, à froid, tu dis « applique les retours de classer » : il propose les changements, tu choisis, il les applique. Chaque retour traité est coché, jamais effacé.
- **`calibrate` : le point de fin de session.** L'agent relit la discussion. Il cherche tes corrections (« non, pas ça »), tes préférences, les étapes oubliées, ce qui est revenu plusieurs fois. Il reprend aussi les retours mis de côté avec `note`. Puis il propose au plus sept changements numérotés, chacun avec son pourquoi : une skill, une ligne d'`AGENTS.md`, un souvenir, un réglage. Tu choisis (« 1 et 3 », « tout sauf 2 »), il applique et vérifie. Pour une session courte, « calibre léger » ne propose que trois changements, les corrections répétées.

*Exemple : pendant le rangement, tu corriges deux fois la même chose. En fin de session, `calibrate` te propose d'ajouter la règle à la skill `classer`. Tu dis oui, et la correction ne reviendra plus.*

Deux limites :

- `calibrate` ne tourne jamais dans une routine : il faut toi pour choisir.
- Dans un AIOS installé, l'agent ne modifie pas une skill du socle, pour que les mises à jour du socle restent possibles. Le retour reste dans son `feedback.md`, marqué « pour le socle », et un souvenir donne l'effet tout de suite.

`calibrate` est reprise de la skill de Jay E | RoboNuggets (licence MIT), traduite et adaptée à l'AIOS. `note` a été construite pour aller avec. Un essai réel a marché avec le petit modèle : « Note pour classer : … », puis « Applique les retours de classer ».

## Un exemple de sur mesure : les idées « un jour, peut-être »

Le socle ne fait pas tout. Chacun ajoute ce qui lui manque, dans sa section « Ce workspace ». Voici ce que Thomas a ajouté dans son propre AIOS (ce n'est pas dans le socle) :

- un type `idee`, avec les statuts `notee`, `en-reflexion`, `lancee`, `abandonnee`, rangé dans son domaine ;
- un champ `ressortir` : non pas une date, mais un contexte où la rappeler (« quand je prépare le prochain atelier ») ;
- un test en trois questions, pour savoir ce qu'est vraiment une idée :
  1. ça nourrit quelque chose qui existe déjà ? → ça va là-bas ;
  2. je m'y mets maintenant ? → c'est un projet ;
  3. sinon → c'est une idée.

## Ce qui est prévu ensuite

Ce qui suit n'est pas encore fait.

- **Les vues.** Des index qui traversent les domaines, générés depuis les en-têtes et définis dans un tableau. *Par exemple : tout ce qui est `a-valider`, quel que soit le domaine.*
- **Les routines encore à construire** : la veille, l'audit mensuel, les fiches YouTube, et le branchement du rangement de nuit sur un planificateur.

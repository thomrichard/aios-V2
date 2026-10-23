# Journal de conception d'AIOS v2

Les choix qui ont façonné le socle, et leur pourquoi. Une entrée par décision : la date, la décision, pourquoi, ce qu'on a écarté. Ajout seul : une décision qui change s'écrit dans une nouvelle entrée, qui renvoie à l'ancienne.

À ne pas confondre avec `journal/decisions.md`, qui sert à l'utilisateur d'un AIOS installé pour noter ses propres décisions.

## 2026-10-22 · Un socle neutre et portable

- **Décision.** Les mêmes fichiers servent Claude Code, Codex et Gemini CLI. Seul `AGENTS.md` fait foi ; `CLAUDE.md` l'importe, `.gemini/settings.json` le désigne à Gemini CLI. Le socle ne contient rien de personnel.
- **Pourquoi.** Changer d'agent ne doit rien coûter : seule la commande de lancement change. Un socle neutre se partage, et chacun peut récupérer ses mises à jour sans perdre ce qui est à lui.
- **Écarté.** Un fichier de règles par agent, qu'il faudrait tenir d'accord à la main. Un `CLAUDE.md` global sur la machine : tout vit dans le workspace.

## 2026-10-22 · Une installation en une phrase, à partir d'un profil préparé avec grill-me

- **Décision.** Avant un atelier, chacun prépare son profil en répondant aux questions imposées avec `grill-me`. Le jour venu, il donne à son agent l'adresse du socle et ce profil, en une phrase. L'installation ne pose que les questions restées sans réponse.
- **Pourquoi.** Le temps d'atelier sert à installer et à comprendre, pas à répondre à un questionnaire. Une seule façon de poser des questions (`grill-me`), qu'on prépare ou qu'on installe.
- **Écarté.** Un questionnaire complet pendant l'installation ; un formulaire à part de `grill-me`.

## 2026-10-22 · L'interface SM4RT, tirée de l'Agentic OS v2 de Jay E | RoboNuggets

- **Décision.** Reprendre le kit de Jay (licence MIT), le traduire en français, le renommer SM4RT et le brancher sur le workspace. Ses domaines, ses routines et ses applications sont générés depuis les réglages. Chaque changement au kit est noté dans `interface/MODIFS.md`.
- **Pourquoi.** Une interface éprouvée plutôt qu'une à écrire. Des fichiers générés, pour qu'elle ne diverge jamais du workspace. La liste des changements permet de reprendre une nouvelle version du kit.
- **Écarté.** Écrire une interface de zéro ; tenir ses fichiers de configuration à la main.

## 2026-10-23 · Un réglage, un seul endroit

- **Décision.** `systeme/metadonnees.md` porte les domaines, les champs d'en-tête, les types, leurs statuts, leurs statuts de fin et leur chemin. On change une ligne ; `index.py` répercute dans `AGENTS.md` (carte des domaines, projets actifs) et dans l'interface. Les domaines restent visibles dans `AGENTS.md`, lu à chaque échange, mais cette carte est générée.
- **Pourquoi.** Régler une fois, et que tous les agents suivent. Avant, les clés et les valeurs étaient éparpillées (doctrine, gabarit), et le gabarit du socle listait même des domaines personnels.
- **Écarté.** Écrire la carte des domaines à la main dans `AGENTS.md`. Retirer les domaines d'`AGENTS.md` : l'agent doit les avoir sous les yeux à chaque échange.

## 2026-10-23 · Base, catalogue, sur mesure

- **Décision.** Le socle marche sans rien régler. L'installation explique les mots (domaine, type, statut) avec un exemple, puis propose des domaines et des types tirés d'un catalogue ; la personne garde, renomme ou retire. Ce qui est à elle va dans la section « Ce workspace » de `systeme/metadonnees.md`, où le socle n'écrit jamais.
- **Pourquoi.** « Tout paramétrable » fait peur au départ. On choisit plus facilement qu'on ne part de zéro, et chacun repart avec son AIOS.
- **Écarté.** Une page blanche à remplir ; une liste imposée de domaines.

## 2026-10-23 · Ce qui bouge est un champ ; ce qui ne bouge pas peut être un dossier

- **Décision.** Le statut est un champ de l'en-tête, jamais un dossier. Un objet garde sa place toute sa vie.
- **Pourquoi.** Un fichier qui change de dossier à chaque étape casse les liens qui pointent vers lui.
- **Écarté.** Des dossiers par étape (`en-cours/`, `publie/`…).

## 2026-10-23 · Un mot est soit un type, soit un statut

- **Décision.** Un même mot ne peut pas servir aux deux. `idee` était les deux : le premier statut d'un contenu devient `sujet`. Le vérificateur signale un mot à la fois type et statut.
- **Pourquoi.** Un mot à deux sens trompe l'agent quand il classe.
- **Écarté.** Garder `idee` comme statut de départ des contenus.

## 2026-10-23 · Projets : actif, bloque, clos, abandonne

- **Décision.** Quatre statuts pour un projet. Pour un projet bloqué, la prochaine étape dit ce qui le débloque. La colonne « Fin » de chaque type dit quels statuts terminent une vie : un projet reste dans les projets actifs d'`AGENTS.md` tant qu'il n'en a pas un.
- **Pourquoi.** Abandonné n'est pas terminé, et ça compte au bilan. La colonne « Fin » garde la liste des projets actifs juste, même si on renomme ses statuts.
- **Écarté.** Un seul statut de fin ; une liste des projets actifs écrite à la main.

## 2026-10-23 · `cree`, la date de naissance

- **Décision.** Chaque en-tête porte `cree`. Un champ n'entre dans l'en-tête que si quelque chose le lit.
- **Pourquoi.** Le rangement s'en sert pour nommer un fichier daté (`<date>` dans la colonne « Chemin »).
- **Écarté.** Des champs ajoutés « au cas où », que rien ne lit.

## 2026-10-23 · Ranger, c'est mettre les bonnes métadonnées : la place s'en déduit

- **Décision.** Chaque type a une colonne « Chemin » dans `systeme/metadonnees.md`. Le travail est découpé : `fiche` crée, `classer` choisit les métadonnées, `ranger.py` déplace (sans IA), `rangement` est la routine de nuit qui enchaîne.
- **Pourquoi.** La même logique sert l'inbox, un fichier mal rangé, une fiche qu'on vient d'écrire. Le jugement va à l'IA, le mécanique au script.
- **Écarté.** Une seule grosse skill qui crée, juge et déplace ; laisser l'IA choisir le dossier à chaque fois.

## 2026-10-23 · L'outbox est une vitrine

- **Décision.** Un livrable reste dans son domaine ; il s'affiche dans `outbox/index.html` grâce à son statut `a-valider`. Dans `outbox/` ne vivent que le point du jour, les questions en attente et la page générée.
- **Pourquoi.** Un objet, un endroit : un livrable déplacé vers l'outbox puis remis dans son domaine change de place deux fois.
- **Écarté.** Déposer les livrables dans `outbox/`.

## 2026-10-23 · La nuit, aucune question

- **Décision.** Le rangement de nuit ne devine jamais. Ce qui demande une réponse attend dans `outbox/questions.md`, avec une proposition ; l'agent le signale en début de session, et l'on y répond quand on veut (« réponds aux questions du rangement »).
- **Pourquoi.** Personne n'est là pour répondre à 2 h, et un classement deviné est pire qu'un élément qui attend.
- **Écarté.** Classer au mieux et laisser corriger après.

## 2026-10-23 · Les fichiers lourds sortent du dépôt

- **Décision.** Vidéos et sons vont dans un dossier hors du dépôt (`FICHIERS_LOURDS` dans `.env`), par exemple un dossier Google Drive synchronisé ; leur fiche garde leur chemin (champ `fichier`). Côté droits : sur sa machine, c'est un dossier local, rien à régler ; depuis le cloud, c'est le connecteur Google Drive.
- **Pourquoi.** Un dépôt Git n'est pas fait pour des fichiers de plusieurs centaines de mégaoctets.
- **Écarté.** Garder les vidéos dans le dépôt.

## 2026-10-23 · Une fiche compagnon pour ce qui ne peut pas porter d'en-tête

- **Décision.** Un PDF, un lien ou une vidéo a une fiche à son nom qui le résume et lui sert d'index ; le fichier vit à côté d'elle. Une image a sa ligne dans le `_images.md` de son dossier.
- **Pourquoi.** L'agent trouve tout par les en-têtes et les index : un fichier sans en-tête lui serait invisible.
- **Écarté.** Laisser ces fichiers sans description.

## 2026-10-23 · Pas de dossier par type, et le titre d'abord

- **Décision.** Le type d'un fichier est dans son en-tête, jamais dans un dossier : seul le domaine reste un dossier, plus le dossier d'un objet de plusieurs fichiers. Un fichier daté s'appelle `<titre>-AA-MM.md` : le titre, puis l'année et le mois de `cree`. Le point du jour garde le nom de son jour. Précise « Ce qui bouge est un champ ; ce qui ne bouge pas peut être un dossier » : le type ne bouge pas, mais il n'est pas un dossier.
- **Pourquoi.** On classe par les métadonnées : un dossier par type répète l'en-tête, et l'agent trouve tout par les en-têtes et les index. Le domaine reste un dossier, parce qu'il ne bouge presque jamais et que les routeurs, les index et l'interface s'appuient dessus. Un nom commence par ce qu'on cherche.
- **Écarté.** Des dossiers par type (`videos/`, `livrables/`, `comptes-rendus/`) ; tout à plat, sans dossier de domaine ; la date complète en tête du nom (`AAAA-MM-JJ-<titre>.md`).

## 2026-10-23 · L'agent s'ajuste avec calibrate et note

- **Décision.** Deux skills. `calibrate`, reprise de celle de Jay E | RoboNuggets (licence MIT, copiée dans `skills/calibrate/LICENSE`), traduite et adaptée : en fin de session, l'agent relit la discussion et propose au plus 7 changements numérotés (skills, `AGENTS.md`, mémoire, réglages) ; l'utilisateur choisit, l'agent applique. Elle a un calibrage léger (3 propositions), reprend les retours de `note`, ne tourne jamais dans une routine, et dans un AIOS installé ne modifie pas une skill du socle. `note` met un retour sur une skill de côté dans `skills/<nom>/feedback.md`, sans couper le travail ; il s'applique à froid, à la demande ou à la prochaine `calibrate`, puis il est coché, jamais supprimé.
- **Pourquoi.** Qu'une correction ne revienne pas : c'est le mécanisme par lequel l'agent s'ajuste à son utilisateur. Le socle citait déjà ces deux skills sans qu'elles existent. Ne pas toucher aux skills du socle garde ses mises à jour possibles.
- **Écarté.** Corriger une skill en plein travail ; appliquer un retour sans l'accord de l'utilisateur ; écrire une `calibrate` de zéro plutôt que reprendre celle de Jay.

## 2026-10-23 · align et devil, et une skill par usage

- **Décision.** Deux skills, réécrites d'après les vidéos de Jay E | RoboNuggets (ses fichiers ne sont pas publics). `align` : avant une tâche floue, l'agent pose d'un coup quelques questions à choix (a, b, c), sa recommandation en premier ; on répond en une ligne (« 1a, 2c, 3b ») ; exactement 3 sans nombre donné, 5 au plus, aucune trace écrite. `devil` : N objections sérieuses sur un choix (3 par défaut), de la plus grave à la moins grave, chacune avec ce qui la fonde et ce qui la lèverait, vérifiées dans le workspace, puis un verdict. `align` ne double pas `grill-me` : une skill par usage. `grill-me` explore et décide (une question à la fois, une fiche écrite, 15 à 45 minutes) ; `align` vise juste avant d'exécuter (toutes les questions d'un coup, sans trace, 30 secondes) ; `devil` contredit avant de s'engager. Au-delà de 5 questions, ou pour décider, `align` renvoie à `grill-me`.
- **Pourquoi.** Un brief flou coûte des allers-retours ; un modèle a tendance à dire oui. Thomas a challengé le doublon avec `grill-me` : les deux n'ont ni le même rythme, ni la même durée, ni la même trace.
- **Écarté.** Faire d'`align` une variante courte de `grill-me` ; une seule skill de questions pour tous les usages.

## 2026-10-23 · close : clôturer une session sans rien perdre

- **Décision.** Une skill `close`, reprise de la skill close de Thomas (classroom « Faire vivre ton AIOS »), adaptée à AIOS v2. Cinq temps : l'inventaire en quatre (décisions avec leur pourquoi, livrables, ce qui n'existe que dans le chat, sujets ouverts), montré avant d'écrire ; chaque élément à sa place (`journal/decisions.md` ; `fiche` puis `classer`, ou `inbox/capture.md` dans le doute ; `projets/<slug>.md` ; `journal/log.md` ; `memory/`) ; chaque sujet ouvert devient une tâche à reprendre (dans son projet, dans un projet proposé, ou en ligne de capture que le rangement de nuit range) ; rien ne traîne (livrable promis, process lancés, `git status` avec un commit proposé et jamais de push sans accord, index et vérificateur) ; le récap (fait, écrit où, en attente, point de reprise exact), avec `calibrate` proposée s'il y a eu des corrections. Une session longue laisse un bilan dans `journal/clotures/<sujet>-AA-MM.md` (nouveau type de base `cloture`). Partage des rôles : `close` garde le contenu ; `calibrate` fait apprendre l'agent (règles, skills).
- **Pourquoi.** Que le chat puisse disparaître sans rien perdre. On perd rarement la décision ; on perd le chemin : les options écartées, et pourquoi.
- **Écarté.** Laisser `close` modifier les règles ou les skills : c'est le travail de `calibrate`. Pousser sans accord en fin de session.

## 2026-10-23 · Le tutoiement par défaut

- **Décision.** Le socle tutoie l'utilisateur par défaut (`AGENTS.md`, section Qui), et la question 4 de l'installation propose de choisir « tu ou vous ».
- **Pourquoi.** Dans l'essai réel de `close`, l'agent vouvoyait Thomas, parce que le socle ne disait rien : le ton changeait d'une session à l'autre. Thomas préfère le tutoiement, qui est aussi la norme dans tout le Club SMART, le public principal du kit.
- **Écarté.** Laisser la question ouverte : l'agent choisit au hasard, et ça varie. Vouvoyer par défaut : en décalage avec le Club. Le choix reste possible à l'installation.

## 2026-10-23 · search-connectors : brancher un outil par la voie la plus légère

- **Décision.** Une skill `search-connectors`, réécrite d'après Jay E | RoboNuggets (son fichier n'est pas public). Pour brancher une application, l'agent part du besoin et de ce qui est déjà branché, cherche dans l'ordre de `systeme/connexions.md` (outil officiel, CLI, API, MCP de la communauté), compare dans un tableau (couverture, entretien, risques) et recommande la voie la plus légère. Il n'installe qu'avec un oui, les clés dans `.env`, puis il teste par une vraie lecture et inscrit la connexion.
- **Pourquoi.** Une connexion se choisit sur des sources lues, pas de mémoire, et se tient à un seul endroit. Brancher, c'est toucher un système externe : il faut l'accord.
- **Écarté.** Brancher le premier MCP trouvé ; installer sans accord ; demander une clé dans le chat.

## 2026-10-23 · reprendre, l'autre moitié de close

- **Décision.** Une skill `reprendre`, réécrite d'après la skill `onboard` de Jay E | RoboNuggets, renommée par Thomas. Elle remet une session à niveau sur un projet ou un sujet : où on en est, ce qui est décidé, ce qui reste ouvert, la prochaine action. Elle n'écrit rien. `close` écrit le point de reprise ; `reprendre` le relit.
- **Pourquoi.** Une nouvelle session, ou une session lancée en parallèle, se met à niveau sans tout réexpliquer. Le projet (`projets/<slug>.md`) sert de dossier partagé entre les sessions.
- **Écarté.** Reprendre `coordinate` et `onboard` de Jay : `close` et `reprendre` les remplacent, puisque le fichier du projet fait déjà le lien entre les sessions.

## 2026-10-23 · burst : plusieurs variantes pour choisir

- **Décision.** Une skill `burst`, réécrite d'après Jay E | RoboNuggets : N variantes vraiment différentes d'un livrable (3 par défaut, 5 au plus), chacune sur un axe annoncé, pour choisir et repartir de la plus proche.
- **Pourquoi.** On arrive plus vite à la cible en choisissant parmi plusieurs options qu'en corrigeant une seule version.
- **Écarté.** Des quasi-doublons ; corriger une seule version de proche en proche.

## 2026-10-23 · humanizer : que le texte sonne comme son auteur

- **Décision.** Une skill `humanizer`, réécrite d'après Jay E | RoboNuggets, pour le français : elle retire les tics d'écriture « IA » (`references/motifs.md`, une quarantaine de motifs) en gardant la voix de l'auteur, avec des modes script, newsletter, post et page.
- **Pourquoi.** Le but n'est pas de tromper un détecteur : c'est que le texte sonne comme son auteur, et qu'il dise les choses plus clairement.
- **Écarté.** Viser un détecteur d'IA ; inventer des faits ou des anecdotes pour « faire humain ».

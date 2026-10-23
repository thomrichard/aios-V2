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

## 2026-10-23 · align et devil, et une skill par usage

- **Décision.** Deux skills, réécrites d'après les vidéos de Jay E | RoboNuggets (ses fichiers ne sont pas publics). `align` : avant une tâche floue, l'agent pose d'un coup quelques questions à choix (a, b, c), sa recommandation en premier ; on répond en une ligne (« 1a, 2c, 3b ») ; exactement 3 sans nombre donné, 5 au plus, aucune trace écrite. `devil` : N objections sérieuses sur un choix (3 par défaut), de la plus grave à la moins grave, chacune avec ce qui la fonde et ce qui la lèverait, vérifiées dans le workspace, puis un verdict. `align` ne double pas `grill-me` : une skill par usage. `grill-me` explore et décide (une question à la fois, une fiche écrite, 15 à 45 minutes) ; `align` vise juste avant d'exécuter (toutes les questions d'un coup, sans trace, 30 secondes) ; `devil` contredit avant de s'engager. Au-delà de 5 questions, ou pour décider, `align` renvoie à `grill-me`.
- **Pourquoi.** Un brief flou coûte des allers-retours ; un modèle a tendance à dire oui. Thomas a challengé le doublon avec `grill-me` : les deux n'ont ni le même rythme, ni la même durée, ni la même trace.
- **Écarté.** Faire d'`align` une variante courte de `grill-me` ; une seule skill de questions pour tous les usages.

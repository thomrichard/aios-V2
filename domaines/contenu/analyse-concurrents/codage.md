---
type: livrable
resume: La grille qui code chaque vidéo de la même façon (titre, miniature, intro, structure, habillage, conversion, techniques des formateurs) pour croiser l'écriture et la performance
statut: a-valider
domaine: contenu
projet: references-youtube
cree: 2026-10-25
maj: 2026-10-25
liens: [analyse-concurrents.md, ../grille-analyse-concurrents.md, ../matrice-methodes-youtube.md, ../../../savoir/methode-aprilynne-alter.md, ../../../savoir/methode-ali-abdaal.md, ../../../savoir/methode-alexander-the-create.md, ../../../savoir/methode-ed-lawrence.md]
---
# Grille de codage des vidéos

Elle transforme une vidéo en données comparables. La [grille d'analyse](../grille-analyse-concurrents.md) dit quoi regarder ; celle-ci dit comment le noter, pour que 60 vidéos codées par des agents différents se croisent sans biais.

Deux familles de données :

- **Les mesures**, calculées par les scripts : vues, vues à 7 jours, débit de parole, changements de plan, nombre de caractères du titre. Le codeur ne les recalcule pas, il les lit dans `metriques.json` et `video.json`.
- **Les codes**, posés par le codeur en lisant la transcription et en regardant les images : le type d'intro, les techniques présentes, les appels à l'action.

## Les règles du codeur

1. **Coder ce qu'on voit ou entend**, jamais ce qu'on suppose. Si on ne peut pas savoir : `null`.
2. **Chaque code qui n'est pas évident porte sa preuve** : la seconde, et une citation courte (15 mots au plus) ou la description du plan.
3. **Les techniques se notent 0, 1 ou 2** : 0 absente, 1 partielle ou ambiguë, 2 nette. Dans le doute entre deux notes, prendre la plus basse et le dire dans `preuve`.
4. **Les secondes** sont celles de la vidéo, en nombre (`83.5`), lues dans `transcription.txt` ou estimées sur les planches d'images.
5. **On code la vidéo telle qu'elle est**, sans juger si elle est bonne. Le jugement vient au croisement, avec la performance.
6. **Le titre et la miniature se codent avant de lire la transcription** : on note ce qu'on attend en cliquant, puis on vérifie si l'intro le donne.

## Les fichiers d'une vidéo

Dans `<chaine>/<video>/` :

| Fichier | Ce qu'il contient | Écrit par |
|---|---|---|
| `video.json` | Titre, description, chapitres, tags, stats publiques (API YouTube v3) | `collecte.py` |
| `transcription.txt` | Le texte, une ligne par phrase, avec `[mm:ss]` | `collecte.py` |
| `mots.json` | Chaque mot avec sa seconde | `collecte.py` |
| `commentaires.json` | Les 100 meilleurs commentaires (texte, likes, épinglé) | `collecte.py` |
| `metriques.json` | Débit, pauses, changements de plan par minute, texte de l'intro et de la fin | `collecte.py` |
| `miniature.jpg` | La miniature | `collecte.py` |
| `planche-intro.jpg` | Une image toutes les 2 secondes sur la première minute | `collecte.py` |
| `planche-milieu.jpg` | Une image toutes les 2 secondes sur une minute au milieu | `collecte.py` |
| `planche-video.jpg` | 48 images réparties sur toute la vidéo | `collecte.py` |
| `vidiq.json` | Vues jour par jour, score d'outlier, changements de miniature | l'agent, avec VidIQ |
| `analytics.json` | Chaîne de Thomas seulement : rétention, totaux, vues jour par jour (le CTR n'est pas donné par l'API) | `collecte.py` |
| `codage.json` | Les codes de cette grille | l'agent |

La vidéo elle-même reste hors du dépôt, dans un dossier temporaire, le temps de l'analyse. Pour regarder un instant précis : `ffmpeg -ss <seconde> -i <video.mp4> -frames:v 1 image.jpg`.

## Ce qu'on code

### 1. L'identité

- `format` : le format principal.
  - `actu` : une nouveauté (sortie d'outil, annonce) présentée et montrée.
  - `tuto` : un pas-à-pas vers un résultat.
  - `liste` : N astuces, outils, règles ou erreurs.
  - `comparatif` : X contre Y, des modèles testés.
  - `cas` : un projet réel construit ou montré de bout en bout.
  - `talk` : une opinion, une réflexion, sans démonstration principale.
  - `interview` : une conversation avec un invité.
  - `autre`.
- `format_secondaire` : un second format s'il compte autant (`actu` + `liste` est fréquent), sinon `null`.
- `sujet` : en quelques mots. `outils` : les outils montrés.
- `niveau` : `debutant`, `intermediaire` ou `avance`, selon le vocabulaire et ce qui est supposé connu.
- `objectif_probable` : `vues`, `communaute` ou `vente`, d'après le sujet et les appels à l'action.

### 2. Le titre

Les mesures (caractères, mots) sont dans `metriques.json`. Le codeur note :

- `attente_au_clic` : ce qu'on s'attend à recevoir, en une phrase, titre et miniature vus ensemble (Ed).
- `schema` : le gabarit réutilisable, avec des chevrons. Exemple : `<Outil> Just Dropped <Fonction>. (Master it in <N> Minutes)`.
- `promesse` : le résultat promis au spectateur.
- `audace` : `timide` (améliorer un peu) ou `audacieux` (Alexander).
- `registre` : `jargon` (le nom de l'outil ou de la technique porte le titre), `douleur-reve` (le titre parle du problème ou du désir), `mixte`.
- `briques` : la liste parmi `preuve`, `vitesse`, `audace`, `resultat` (Alexander).
- `marqueurs` : la liste parmi `nouveaute` (just dropped, new), `chiffre`, `duree` (in 10 minutes), `majuscules` (un mot en capitales pour l'emphase), `comparaison-sociale` (top 1 %, 95 % des gens), `erreur` (mistakes, stop), `secret` (secret, hidden, nobody), `superlatif` (the only, the best), `test` (I tested, I tried), `question`.
- `nom_outil` : `true` si un outil est nommé.

### 3. La miniature

- `visage` : `true` ou `false`. `emotion` : laquelle, ou `null`. `regard` : `camera`, `element` (il regarde un objet de la miniature), `ailleurs`, ou `null`.
- `texte` : le texte exact de la miniature. `texte_mots` : le nombre de mots.
- `repete_titre` : `oui`, `partiel` ou `non`.
- `elements` : la liste de ce qu'on voit (logo d'outil, capture d'écran, chiffre, flèche, objet, avant-après).
- `nb_elements` : le nombre de blocs visuels distincts.
- `fond` et `couleurs` : en quelques mots.
- `curiosity_gap` : `moment`, `histoire`, `resultat`, `transformation`, `nouveaute` ou `aucun` (Aprilynne).
- `lisible_petite_taille` : `true` si on comprend la miniature réduite à la taille d'une suggestion.

### 4. L'intro

L'intro va de la première seconde au début du premier point.

- `premiere_phrase` : la citation exacte.
- `premiere_phrase_reprend_titre` : `oui`, `partiel` ou `non`.
- `premier_plan` : ce qu'on voit dans les 2 premières secondes. `premier_plan_reprend_miniature` : `oui`, `partiel` ou `non`.
- `ouverture` : la liste, dans l'ordre d'apparition, parmi :
  - `hook-dissonance` : ce que tout le monde fait ne marche pas, autre chose oui (Ed) ;
  - `hook-question` : une question que le spectateur s'est posée sans réponse (Ed) ;
  - `hook-fait` : un chiffre ou un fait qui fait réagir (Ed) ;
  - `boucle-curiosite` : une question ouverte qui ne sera résolue que plus tard (Aprilynne) ;
  - `douleur` : le problème du spectateur décrit, voire aggravé (Ali) ;
  - `histoire-perso` : un moment vécu par le créateur (Ali) ;
  - `pont` : titre repris, contexte, preuve, annonce, sans accroche (Alexander) ;
  - `demo-d-abord` : le résultat est montré avant toute explication ;
  - `actu-annonce` : « X vient de sortir ».
- `preuve` : `type` parmi `resultat-montre`, `chiffres`, `autorite`, `effort`, `social`, `aucune` ; `seconde` ; `description`.
- `annonce_plan` : `presente`, `nb_points`, `a_l_ecran` (le plan s'affiche).
- `boucle_vers_la_fin` : une promesse gardée pour la fin (« à la fin, je vous montre... »). `presente`, `citation`, `seconde_resolution`, `tenue` (`oui`, `partiel`, `non`).
- `seconde_premier_point` : quand commence le premier contenu.
- `attente_tenue` : l'intro confirme-t-elle l'attente au clic ? `oui`, `partiel`, `non`, avec une note.

### 5. La structure

- `modele` : `liste-numerotee`, `pas-a-pas`, `setup-progress-payoff`, `probleme-solution`, `demo-continue`, `conversation` ou `mixte`.
- `segments` : une entrée par partie (les chapitres s'il y en a, sinon les idées repérées dans la transcription). Pour chacune :
  - `debut`, `fin`, `titre`, `role` (`intro`, `point`, `demo`, `transition`, `cta`, `sponsor`, `fin`) ;
  - et des cases à `true` ou `false` :
    - `pull` : dit pourquoi ce point compte pour le spectateur avant de l'expliquer (Alexander) ;
    - `paint` : une image, une analogie, une histoire ou un exemple concret (Alexander, Ed) ;
    - `point` : l'enseignement et l'action à faire (Alexander) ;
    - `nom` : l'idée porte un nom court et mémorable (Alexander) ;
    - `phrase_finale` : le point se clôt sur une phrase forte, citable (Alexander) ;
    - `probleme` : un problème que le spectateur vit est posé d'abord (Ed) ;
    - `preuve` : une preuve que ça marche (Ed) ;
    - `consignes` : des étapes concrètes (Ed) ;
    - `payoff` : la promesse est livrée ici (Aprilynne) ;
    - `relance_sortie` : le point se termine en ouvrant le suivant, par une question ou une annonce (Ed).
- `relances` : chaque relance d'attention, avec `seconde`, `type` et `citation`. Types : `question-spectateur`, `annonce-suite`, `boucle-ouverte`, `rappel-promesse`, `rupture` (changement net de ton, de plan ou d'humour).
- `histoires` : chaque histoire, avec `seconde`, `acte` et `resume`. Actes : `perso-passe` (acte 1 d'Ed), `client-autre` (acte 2), `vision-build` (acte 3), `anecdote`.
- `payoffs` : chaque moment qui livre la promesse, avec `seconde` et `resume`. `premier_payoff_seconde` : le premier.
- `jargon` : 1 (rare, ou expliqué), 2 (présent), 3 (dense, non expliqué).
- `repetitions` : 0 (rares), 1 (quelques redites), 2 (nombreuses).
- `test_du_tweet` : la vidéo résumée en 280 caractères au plus.

### 6. L'habillage

Sur les trois planches et la miniature.

- `face_camera` : `presente`, `cadrage` (serre, poitrine, taille, vignette), `decor`.
- `parts` : la part du temps, en pourcentage estimé sur `planche-video.jpg`, entre `face`, `ecran` (captures, démos), `motion` (graphismes animés, cartes, schémas) et `broll`. Le total fait environ 100.
- `textes_ecran` : `aucun`, `rares`, `frequents` ou `constants`.
- `sous_titres_incrustes` : `true` ou `false`, et leur style.
- `elements` : la liste de ce qui revient, parmi `plan-a-l-ecran`, `cartes-chapitre`, `zooms-ecran`, `curseur-surligne`, `fleches-annotations`, `etiquettes`, `split-screen`, `bandeau-nom`, `logo-chaine`, `emojis-stickers`, `chiffres-animes`.
- `charte` : les couleurs, les polices, et si elle reprend celle de la miniature.
- `rythme` : `regulier` ou `contraste` (des passages nettement plus rapides et plus lents), à lire avec les changements de plan par minute de `metriques.json`.
- `notes` : ce qui frappe, en deux phrases.

### 7. La fin et la conversion

- `ctas` : chaque appel à l'action, avec `seconde`, `type`, `cible`, `amene_par` et `citation`.
  - Types : `abonnement`, `like-commentaire`, `newsletter`, `lead-magnet`, `communaute-gratuite`, `communaute-payante`, `formation`, `service`, `produit`, `affiliation`, `sponsor`, `video-suivante`, `autre`.
  - `amene_par` : `intro`, `apres-valeur` (juste après un payoff), `pendant-demo`, `transition`, `fin`.
- `sponsor` : `present`, `nom`, `debut`, `duree`, `forme` (`segment-dedie`, `integre-a-la-demo`, `lien-seul`).
- `liens_description` : le nombre de liens de chaque type, parmi les types des CTA, plus `reseaux` et `autre`.
- `commentaire_epingle` : son texte court et son type de CTA, ou `null`.
- `recap_final` : `true` si la fin résume.
- `derniere_phrase` : la citation.
- `video_suivante_precise` : `true` si une vidéo précise est proposée, avec une raison.

### 8. Les commentaires

Sur `commentaires.json`, en 5 éléments au plus par liste.

- `themes` : ce dont on parle.
- `demandes` : les idées de vidéos et les questions.
- `critiques` : les reproches, les incompréhensions.
- `reprises` : les noms et les phrases de la vidéo que les gens répètent.
- `signal_promesse` : `tenue`, `decue`, `mixte` ou `inconnu`.

### 9. Les techniques des formateurs

Le cœur du croisement : chaque technique vue chez les quatre formateurs, notée 0, 1 ou 2, avec sa preuve. Les définitions viennent des fiches de méthode.

| Clé | Technique | 2 quand... | Source |
|---|---|---|---|
| `ap_alignement_5s` | 1re phrase = titre, 1er plan = miniature | les deux sont vrais (1 si un seul) | [Aprilynne](../../../savoir/methode-aprilynne-alter.md) |
| `ap_boucle_curiosite` | Boucle de curiosité dans l'intro | une question est ouverte tôt et résolue plus tard | Aprilynne |
| `ap_effort_montre` | L'effort montré tôt (input bias) | heures, tests, nombre d'essais dits ou montrés dans l'intro | Aprilynne |
| `ap_setup_progress_payoff` | Setup, progress, payoff | chaque grande partie pose un but, progresse et livre | Aprilynne |
| `ap_contraste_rythme` | Contraste des rythmes | des passages nettement plus rapides et plus lents | Aprilynne |
| `ap_montrer_sans_son` | L'intro se comprend sans le son | les images seules disent la promesse | Aprilynne |
| `ali_douleur_histoire` | Douleur puis histoire perso | la douleur est décrite, puis une histoire vécue montre qu'il la comprend | [Ali](../../../savoir/methode-ali-abdaal.md) |
| `ali_coeur_unique` | Un cœur de vidéo | un seul message central, qu'on énonce en une phrase | Ali |
| `alx_pont` | Intro en pont, sans hook | titre repris, contexte, preuve, annonce, et aucune accroche | [Alexander](../../../savoir/methode-alexander-the-create.md) |
| `alx_pull_paint_point` | Pull, paint, point | la plupart des points ont les trois (1 si quelques-uns) | Alexander |
| `alx_nom_idee` | Les idées ont un nom | des noms courts et mémorables, souvent à l'écran | Alexander |
| `alx_phrase_finale` | Une phrase finale par idée | la plupart des idées finissent sur une phrase citable | Alexander |
| `alx_douleur_reve` | Titre douleur ou rêve, pas jargon | le titre parle du problème ou du désir | Alexander |
| `alx_cta_tot` | Lead magnet ou offre annoncé tôt | avant 4 minutes, lié au sujet | Alexander |
| `ed_intro_courte` | Intro en trois lignes | promesse, hook, puis le 1er point sans attendre | [Ed](../../../savoir/methode-ed-lawrence.md) |
| `ed_hook` | Un hook dissonance, question ou fait | un hook net d'un de ces trois types | Ed |
| `ed_probleme_preuve_consignes` | Problème, preuve, consignes | la plupart des points suivent cet ordre | Ed |
| `ed_tension_relancee` | La tension relancée entre les points | la question du spectateur lance le point suivant | Ed |
| `ed_histoire_vecue` | Une histoire vécue | une histoire d'acte 1, 2 ou 3 | Ed |
| `ed_sans_surexplication` | Pas de surexplication | aucune redite d'une idée déjà comprise | Ed |
| `ed_niveau_simple` | Le niveau d'un enfant de 10 ans | vocabulaire simple, jargon expliqué | Ed |
| `tous_video_suivante` | Une vidéo suivante précise | une vidéo nommée, avec une raison | les quatre |

### 10. Ce qu'on en tire

- `a_retenir` : quatre lignes au plus. `titre_miniature`, `intro_structure`, `habillage`, `idee_pour_nous` (avec son objectif : `vues`, `club` ou `consulting`).

## Le fichier `codage.json`

Le squelette à remplir. L'exemple complet et codé à la main sert d'étalon : `tristen-obrien/claude-just-dropped-motion-get-ahead-of-95-in-11/codage.json`.

```json
{
  "video_id": "", "chaine": "", "titre_video": "", "codeur": "", "date_codage": "AAAA-MM-JJ",
  "identite": {"format": "", "format_secondaire": null, "sujet": "", "outils": [], "niveau": "", "objectif_probable": ""},
  "titre": {"attente_au_clic": "", "schema": "", "promesse": "", "audace": "", "registre": "", "briques": [], "marqueurs": [], "nom_outil": false},
  "miniature": {"visage": false, "emotion": null, "regard": null, "texte": "", "texte_mots": 0, "repete_titre": "", "elements": [], "nb_elements": 0, "fond": "", "couleurs": [], "curiosity_gap": "", "lisible_petite_taille": true},
  "intro": {
    "premiere_phrase": "", "premiere_phrase_reprend_titre": "", "premier_plan": "", "premier_plan_reprend_miniature": "",
    "ouverture": [], "preuve": {"type": "", "seconde": null, "description": ""},
    "annonce_plan": {"presente": false, "nb_points": null, "a_l_ecran": false},
    "boucle_vers_la_fin": {"presente": false, "citation": "", "seconde_resolution": null, "tenue": null},
    "seconde_premier_point": null, "attente_tenue": "", "attente_note": ""
  },
  "structure": {
    "modele": "",
    "segments": [{"debut": 0, "fin": 0, "titre": "", "role": "", "pull": false, "paint": false, "point": false, "nom": false, "phrase_finale": false, "probleme": false, "preuve": false, "consignes": false, "payoff": false, "relance_sortie": false}],
    "relances": [{"seconde": 0, "type": "", "citation": ""}],
    "histoires": [{"seconde": 0, "acte": "", "resume": ""}],
    "payoffs": [{"seconde": 0, "resume": ""}], "premier_payoff_seconde": null,
    "jargon": 1, "repetitions": 0, "test_du_tweet": ""
  },
  "habillage": {
    "face_camera": {"presente": false, "cadrage": "", "decor": ""},
    "parts": {"face": 0, "ecran": 0, "motion": 0, "broll": 0},
    "textes_ecran": "", "sous_titres_incrustes": false, "sous_titres_style": "",
    "elements": [], "charte": "", "rythme": "", "notes": ""
  },
  "fin": {
    "ctas": [{"seconde": 0, "type": "", "cible": "", "amene_par": "", "citation": ""}],
    "sponsor": {"present": false, "nom": null, "debut": null, "duree": null, "forme": null},
    "liens_description": {}, "commentaire_epingle": null,
    "recap_final": false, "derniere_phrase": "", "video_suivante_precise": false
  },
  "commentaires": {"themes": [], "demandes": [], "critiques": [], "reprises": [], "signal_promesse": ""},
  "techniques": {"ap_alignement_5s": {"note": 0, "preuve": ""}},
  "a_retenir": {"titre_miniature": "", "intro_structure": "", "habillage": "", "idee_pour_nous": "", "objectif": ""}
}
```

Dans `techniques`, les 22 clés du tableau de la partie 9, chacune avec `note` et `preuve`.

## Comment on croise

`consolider.py` assemble toutes les vidéos dans `videos.csv`, une ligne par vidéo. Ensuite :

- **La performance se lit à l'intérieur de chaque chaîne.** Pour chaque vidéo : ses vues à 7 jours divisées par la médiane des vues à 7 jours de sa chaîne. Une chaîne d'un million d'abonnés et une de 8 000 deviennent comparables. Le score d'outlier de VidIQ sert de contrôle.
- **Pour chaque technique**, on compare la performance des vidéos notées 2 à celle des vidéos notées 0, avec le nombre de vidéos de chaque côté.
- **Pour chaque mesure** (seconde du premier point, débit, changements de plan, relances par minute), on regarde si elle monte ou descend avec la performance.
- **Le sujet pèse lourd** : une sortie d'outil attendue tire les vues quel que soit le script. Le format `actu` est donc séparé dans les comparaisons.
- **Sur la chaîne de Thomas**, la courbe de rétention est posée sur les segments : on voit quel type de passage fait partir les gens.

Avec 50 vidéos, ces croisements donnent des pistes, pas des preuves. On les note comme telles et on les teste ensuite sur nos propres vidéos.

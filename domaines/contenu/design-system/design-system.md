---
type: livrable
resume: Design system Club SMART (variante Lumière, retenue) pour tout l'écosystème, avec ses jetons, ses gabarits et l'historique des pistes
statut: a-valider
domaine: contenu
cree: 2026-10-25
maj: 2026-10-25
liens: [jetons.css, gabarits/, pistes.html, pistes-a.html, pistes-a-moderne.html]
---
# Design system Club SMART : le brief

Les trois pistes, côte à côte : [pistes.html](pistes.html).

## Le but

Un seul langage visuel pour tout ce que Thomas publie. On doit reconnaître le Club SMART au premier coup d'œil, qu'il s'agisse d'une miniature, d'un schéma de leçon ou d'un post. Le design system sert deux cibles : la chaîne YouTube et le Club.

## Ce qu'il couvre, par priorité

1. **Les schémas de cours** : leçons Skool, schémas dans les vidéos.
2. **L'habillage des vidéos** : titres à l'écran, génériques, signature animée, fonds.
3. **Les miniatures YouTube.**
4. **Les posts** : LinkedIn, Skool, carrousels.
5. **La page de vente et le kit média.**

## Ce que la marque doit dégager

Un expert posé et crédible, éditorial, sobre. On le lit comme quelqu'un qui sait, pas comme quelqu'un qui crie.

À éviter (proposition, à valider) : le look « IA générique », c'est-à-dire les dégradés violets, les néons, les robots, les cerveaux lumineux.

## Ce qui ne change pas

- **Le Valknut** : trois triangles entrelacés, géométrie du 14 octobre. Le tracé tient en une seule forme, qui se recolore.
- **La signature SM4RT** : le Valknut, puis SM4RT en Schibsted Grotesk 800 en dessous. Le « 4 » prend la couleur d'accent de la piste.
- **Le portrait de Thomas**, au centre des miniatures.

## Les contraintes

- **Lisible en tout petit** : la miniature dans la colonne des suggestions, le schéma sur un téléphone.
- **Trois formats** : 16:9, 1:1 et 9:16.
- **L'accent est un budget** : une seule couleur d'accent, posée sur ce qui compte.
- **Le texte atténué doit rester contrasté**, puisqu'il porte la plupart des étiquettes.
- **Des polices gratuites** (Google Fonts). Elles doivent marcher partout : Claude Design, HyperFrames, le générateur de schémas en Python, Excalidraw.

## Le point de départ : la charte vert pin

La source est le dossier `inbox/exemples_design/2026-10-24-valknut-et-couleurs/`, avec son `lisez-moi.md` et `couleurs.css` (50 couleurs et leurs rôles).

| Couleur | Rôle | Valeur |
|---|---|---|
| Pin 950 | Fond éditorial | `#0C1A15` |
| Pin 700 | Couleur de marque, boutons | `#1C4B3C` |
| Pin 300 | Marque sur fond sombre | `#83BBA4` |
| Brique 600 / 500 | Action / accent chaud | `#B4472F` / `#C85B41` |
| Ambre 500 | Surlignage | `#D9A441` |
| Papier 50 | Fond clair, texte sur sombre | `#FAF8F3` |

Deux points sont encore ouverts dans cette charte :
- En vidéo, trois verts de fond se côtoient (pin 800, 900 et 950).
- Le teal est défini, mais n'a aucun rôle.

## Les trois pistes

Chaque piste reprend le même contenu pour qu'on puisse les comparer :
- une palette ;
- une typo ;
- une miniature (« Arrête de gaspiller tes tokens ») ;
- un schéma (« Ce que coûte un message », repris de la leçon existante) ;
- deux boutons.

| | A · Le tableau | B · La revue | C · Le laboratoire |
|---|---|---|---|
| Axe | Fidélité à la charte vert pin | L'imprimé | La planche technique |
| Ce qu'elle dit | Le prof au tableau, le soir | L'expert qu'on lit comme un bon magazine | L'ingénieur qui montre comment ça marche |
| Fond | Pin 950 `#0C1A15` | Ivoire `#F3EEE4` | Gris labo `#EBEBE7` |
| Texte | Papier `#FAF8F3` | Encre `#17191F` | Noir `#111111` |
| Accent | Ambre `#D9A441`, brique `#C85B41` | Outremer `#2A3FCB` | Jaune signal `#FFD02E` |
| Titres | Schibsted Grotesk 800 | Newsreader 800 | Archivo étroit 800 |
| Texte courant | Schibsted Grotesk 400 | Newsreader 400 | Archivo 400 |
| Étiquettes | Schibsted Grotesk 500 | Public Sans 600 | JetBrains Mono |
| Texture | Tableau sombre, cadre pointillé | Papier, filets, colonnes | Grille, traits fins, repères |

## Burst sur A (25 octobre)

Thomas a retenu la piste A. Le burst la décline en trois variantes : [pistes-a.html](pistes-a.html). Elles gardent la même palette, Schibsted Grotesk et le Valknut. Ce qui change, c'est la couleur qui domine. Les miniatures montrent cette fois ses vraies photos, détourées.

| | A1 · Nuit | A2 · Papier | A3 · Tricolore |
|---|---|---|---|
| Axe | Le sombre : le vert pin domine | Le clair : le papier domine | Les aplats : les trois couleurs du Valknut |
| Fond | Pin 950 | Papier 50 | Pin 700 |
| Accent | Ambre pour souligner, brique pour le bouton | Brique pour agir, pin 700 pour la marque | Ambre, brique et pin 300 en blocs |
| Titres | Capitales, 800-900 | Minuscules, 800 | Capitales, 900 |
| Signature | Valknut papier, 4 ambre | Valknut encre, 4 brique | Valknut tricolore, 4 ambre |
| Photo de la miniature | Mains sur la tête, liseré papier | Main au menton, sur un disque pin 100 | Sweat rouge, devant un triangle ambre |

## Moderniser A1 et A2 (25 octobre)

Thomas préfère nettement A2 et A1. Il veut les rendre beaucoup plus modernes, et garder le Valknut en fond. Le burst propose trois façons de le faire : [pistes-a-moderne.html](pistes-a-moderne.html). Chaque variante se décline en deux modes, Nuit (A1) et Papier (A2). On garde la charte et Schibsted Grotesk ; ce qui change, c'est la matière.

| | M1 · Grille | M2 · Lumière | M3 · Bento |
|---|---|---|---|
| Axe | La précision | La profondeur | La modularité |
| Valknut en fond | En trait fin, très grand | Éclairé : dégradé de pin et halo ambre | En aplat, une teinte au-dessus du fond |
| Titres | Schibsted 600, très serrés | Schibsted 700-800, mot fort en dégradé | Schibsted 700, un mot en Instrument Serif italique |
| Police d'appoint | Geist Mono pour les étiquettes | Aucune | Instrument Serif italique |
| Matières | Grille de 12 colonnes, filets de 1 px | Grain, verre dépoli, lumière | Cartes arrondies, teintes douces |

Ce qui rend les trois variantes plus modernes que A1 et A2 :
- des titres plus serrés, en minuscules ;
- un Valknut traité comme une matière, plutôt que posé en filigrane ;
- une deuxième police pour les détails.

## Le choix : M2 · Lumière (25 octobre)

Thomas retient M2. Le design system tient en deux modes : **nuit** (A1 modernisé, par défaut) et **papier** (A2 modernisé).

- **Le Valknut en fond est éclairé.** Il prend un dégradé de pin, du clair en haut au transparent en bas. La nuit, un halo ambre s'y ajoute.
- **Les matières** : un grain fin, des cartes en verre dépoli avec un bord de 1 px, des fonds éclairés par deux lumières douces (pin en haut, ambre en bas).
- **La typo** : Schibsted Grotesk seule. Titres en 800, en minuscules, serrés (approche −4 %). Le mot fort d'un titre passe en dégradé : ambre-brique la nuit, pin le jour. Aucune autre police.
- **Le fond de nuit est le pin 950**, que la lumière éclaire. Cela règle la question des trois verts de fond.
- **Le teal sort de la charte** : il n'avait aucun rôle.

## Les jetons

`jetons.css` remplace `couleurs.css`. Il contient :
- les rampes de la charte ;
- la typo, les formes et les matières (grain) ;
- les rôles de chaque mode : fond, texte, mot fort, dégradé du Valknut, halo, verre, boutons…

On change de mode avec `data-mode="nuit"` ou `data-mode="papier"` sur la page.

## Les gabarits

Ils sont dans `gabarits/`. Un gabarit est une page HTML à taille fixe ; `gabarits/rendre.py` la sort en PNG avec Chrome sans interface.

| Gabarit | Taille | Champs |
|---|---|---|
| `miniature` | 1280 × 720 | mode, surtitre, titre, photo, photo_x, photo_taille |
| `carton` (titre de vidéo ou de chapitre) | 1920 × 1080 | mode, surtitre, titre |
| `schema` (une liste de 2 à 5 lignes) | 1920 × 1080 | mode, surtitre, titre, lignes, total, conclusion |
| `post` (LinkedIn, Skool, carrousel) | 1080 × 1080 | mode, surtitre, titre, texte, signature, auteur |
| `bandeau` (nom et titre, sur fond transparent) | 1920 × 1080 | mode, nom, role |

Comment écrire les textes :
- Dans un texte, `*mot*` passe en mot fort et `|` va à la ligne.
- Un champ vide (`surtitre=`) retire l'élément.
- `photo` prend un nom court (`mains-sur-la-tete`, `reflexion`, `sourire`, `surpris-sweat-rouge`), qui renvoie à `thomas-<nom>.webp`, ou un chemin.
- Les lignes d'un schéma passent par un fichier JSON : voir `gabarits/exemples/schema-cout-message.json`.

```bash
cd domaines/contenu/design-system/gabarits
python3 rendre.py miniature titre="Arrête de|gaspiller|*tes tokens*" photo=mains-sur-la-tete -o ~/Desktop/miniature.png
python3 rendre.py schema --donnees exemples/schema-cout-message.json mode=papier -o ~/Desktop/schema.png
```

Les exemples rendus, un par gabarit et par mode, sont dans `gabarits/exemples/`.

Pour poser une nouvelle photo sur une miniature :
1. La détourer : fond transparent, recadrée sur le sujet.
2. La ranger en `thomas-<nom>.webp` dans ce dossier, avec sa ligne dans `_images.md`.

## Ce qu'on livre

- [x] Les jetons (`jetons.css`) et la typo.
- [x] Les gabarits : miniature, carton de titre, schéma en liste, post carré, bandeau. Plus le script de rendu.
- [ ] Le générateur Python des schémas de leçons (`domaines/communaute/economiser-tes-tokens/generateur/`), passé aux couleurs Lumière.
- [ ] Le « mode tableau » de la skill `excalidraw-diagram`. La skill vit hors du workspace : voir `outbox/questions.md`.
- [ ] L'habillage vidéo dans HyperFrames : fond de vidéo avec le Valknut éclairé, carton et bandeau animés, signature.
- [ ] Les formats 9:16 (Shorts) et 4:5 (carrousel).
- [ ] Le design system Club SMART mis à jour dans Claude Design. C'est un outil en ligne : à faire avec l'accord de Thomas.

## Questions ouvertes

- `inbox/exemples_design/font1.png` est une capture de Fontjoy, qui associe Titillium Web, Nunito et Athiti. Est-ce une inspiration, ou juste l'outil ?
- Les gabarits chargent Schibsted Grotesk depuis Google Fonts. Sans connexion, Chrome prend une police de secours. Il faudra peut-être garder la police en local.

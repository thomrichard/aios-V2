---
type: livrable
titre: Valknut et couleurs SM4RT
statut: termine
domaine: identite-visuelle
auteur: ia
projet:
cree: 2026-10-23
maj: 2026-10-24
source: 3-Ressources/design-system/
---

# Valknut et couleurs SM4RT

Le point de départ du nouveau design system : les couleurs de la charte vert pin, le Valknut et ses animations, au 24 octobre 2026. Ce sont des copies : les originaux restent dans `3-Ressources/design-system/`.

| Dossier | Contenu |
|---|---|
| `1-couleurs/` | `palette-vert-pin.png` (toute la palette d'un coup) et `couleurs.css` (les 50 couleurs et leurs rôles en code ; les noms CSS disent `pine` pour pin). |
| `2-valknut/` | Le Valknut redessiné le 14 octobre, en SVG : `valknut-encre.svg` pour les fonds clairs, `valknut-papier.svg` pour les fonds sombres. Le Valknut en 3D (image). Deux aperçus de la signature SM4RT dans ses quatre couleurs. `valknut.py`, le script qui a dessiné le SVG. |
| `3-animations/` | Les 16 vidéos : le Valknut qui se forme, seul ou suivi de SM4RT, dans trois formats et quatre couleurs. |

## Les couleurs principales

| Couleur | Rôle | Valeur |
|---|---|---|
| Pin 950 | Fond éditorial (miniatures, couvertures, carrousels), texte sur fond clair | `#0C1A15` |
| Pin 700 | Couleur de marque, boutons, liens | `#1C4B3C` |
| Pin 300 | Couleur de marque sur fond sombre | `#83BBA4` |
| Pin 50 | Fond doux | `#EFF6F2` |
| Brique 600 | Action, appel à agir | `#B4472F` |
| Brique 500 | Accent chaud sur fond sombre | `#C85B41` |
| Ambre 500 | Surlignage, mise en avant | `#D9A441` |
| Papier 50 | Fond clair par défaut, texte sur fond sombre | `#FAF8F3` |

D'où elles viennent : le pin est tiré du fond du portrait de Thomas, la brique de son chandail rouge, l'ambre de la lumière chaude. L'ardoise, ce sont les gris, toujours un peu verdis.

| Situation | Fond | Texte | Accent |
|---|---|---|---|
| Clair (par défaut) | papier 50 | pin 950 | brique 600 |
| Sombre | ardoise 950 `#0E1512` | papier 50 | brique 500, pin 300 |
| Éditorial (miniatures, couvertures, carrousels) | pin 950 | papier 50 | ambre 500, brique 500 pour le « chaud » |
| Supports pour l'extérieur (kit média, partenaires) | papier 50, bandeau pin 50 | pin 950 | brique 600 |

Les rampes complètes :

- **Pin** : 50 `#EFF6F2` · 100 `#DCEBE3` · 200 `#B7D7C7` · 300 `#83BBA4` · 400 `#4F9B7E` · 500 `#327A60` · 600 `#26604C` · 700 `#1C4B3C` · 800 `#163526` · 900 `#10241C` · 950 `#0C1A15`
- **Ardoise** : 50 `#F5F7F5` · 100 `#EDF0EE` · 150 `#E3E7E4` · 200 `#D3D8D4` · 300 `#B3BAB5` · 400 `#8B948E` · 500 `#667069` · 600 `#4C554F` · 700 `#363F3A` · 800 `#232B27` · 900 `#161D1A` · 950 `#0E1512`
- **Brique** : 50 `#FDF1ED` · 100 `#FBE5DF` · 200 `#F5C9BD` · 300 `#EBA391` · 400 `#DC7C64` · 500 `#C85B41` · 600 `#B4472F` · 700 `#94331F` · 800 `#7A2718` · 900 `#4A160D`
- **Ambre** : 100 `#FDF4E4` · 200 `#F9E8C8` · 300 `#F3D69C` · 400 `#E8BE6E` · 500 `#D9A441` · 600 `#B07C1E` · 700 `#8A5F14`
- **Papier** : 50 `#FAF8F3` · 100 `#F2EEE5` · 200 `#E7E1D3`
- **Teal** : 100 `#DDEDF1` · 300 `#8FC2CE` · 500 `#3A8798` · 600 `#2A6B7C` · 700 `#1E5261` (défini, mais rien ne l'utilise)
- **Rouge** : 100 `#F7E4E1` · 600 `#8C1D18` (seulement pour les messages d'erreur)

## Le Valknut

Trois triangles équilatéraux entrelacés, symétriques d'un tiers de tour ; le triangle de gauche est le plus haut.

- Un seul tracé, sans métadonnées : il se recolore en changeant la couleur de remplissage du SVG.
- Géométrie : largeur de bande 12 % du côté, jour de 2 % entre deux bandes qui se croisent.
- En fond de vidéo : pin 300 `#83BBA4`, à 10–13 % d'opacité, très grand et débordant.
- Pour le redessiner (une autre épaisseur, par exemple) : `python3 valknut.py <dossier> 0.16 0.12 0.02 60 --miroir` (demande la bibliothèque `shapely`). Les valeurs par défaut du script ne sont pas celles du logo.

**La signature SM4RT** : le Valknut, avec SM4RT centré dessous en Schibsted Grotesk 800. Le « 4 » en brique `#B4472F` sur fond clair, en ambre `#D9A441` sur fond sombre. Écart entre le Valknut et le nom : environ un septième de la hauteur du Valknut.

## Les animations

Trois bandeaux arrivent de la gauche, de la droite et du haut, s'enroulent chacun autour de son triangle et s'entrelacent pour former le Valknut.

| Dossier | Durée | Ce qui se passe | Format |
|---|---|---|---|
| `valknut-seul/` | 4,5 s | Le Valknut se forme et reste en place. | 1920 × 1080 |
| `signature-horizontal/` | 6,5 s | Le Valknut se forme, monte en rapetissant, puis SM4RT apparaît dessous, lettre par lettre. | 1920 × 1080 (YouTube, présentations) |
| `signature-carre/` | 6,5 s | Idem. | 1080 × 1080 (Instagram, LinkedIn) |
| `signature-vertical/` | 6,5 s | Idem. | 1080 × 1920 (Shorts, Reels, TikTok) |

| Couleur (fin du nom) | Fond | Bandeaux | Le « 4 » |
|---|---|---|---|
| `encre` | papier `#FAF8F3` | pin 950 `#0C1A15` | brique `#B4472F` |
| `editorial` | pin 950 `#0C1A15` | papier `#FAF8F3` | ambre `#D9A441` |
| `tricolore-clair` | papier `#FAF8F3` | gauche pin 700, droite brique 600, haut ambre 500 | brique `#B4472F` |
| `tricolore-sombre` | pin 950 `#0C1A15` | gauche pin 300, droite brique 500, haut ambre 500 | ambre `#D9A441` |

Les projets d'animation modifiables sont dans `~/hyperframes/` (`valknut-anime`, `valknut-sm4rt`, `valknut-sm4rt-carre`, `valknut-sm4rt-vertical`) ; la marche à suivre est dans [Animations du Valknut](../../3-Ressources/design-system/animations.md).

## Ce qui reste ouvert

- En vidéo, trois verts de fond se côtoient : pin 800 `#163526`, pin 900 `#10241C` et pin 950 `#0C1A15`. La charte dit pin 950.
- Le teal n'a pas de rôle : à garder, à utiliser ou à retirer.
- Il n'existe pas de SVG animé du Valknut : l'animation n'existe qu'en vidéo, et en page modifiable dans `~/hyperframes/`.

---
type: support
resume: Leçon Skool de « Communiquer » : Animer ton logo en motion design avec Claude
statut: en-cours
domaine: communaute
cree: 2026-05-14
maj: 2026-07-28
liens: [communiquer.md, https://www.skool.com/club-smart/classroom/2e6bee59?md=2d79244754d8493eade46e94a580c896]
---
# Animer ton logo en motion design avec Claude

C'est ma première vidéo de motion design. Aucune compétence After Effects, aucun logiciel installé. Juste Claude Code, Claude Design, et une bibliothèque de composants animés trouvée sur le web.

Le résultat : une vidéo de ~25 secondes, avec mon logo et 10 mots-clés enchaînés sur 4 effets de transition différents. Le genre de vidéo que tu peux glisser dans une réponse à un appel d'offre, dans une démo prospect, ou pour montrer un savoir-faire sur LinkedIn.

Voici exactement comment je m'y suis pris, étape par étape.

---

## Étape 1 — Aller chercher des animations qui te plaisent sur 21st.dev

[21st.dev](https://21st.dev) est une bibliothèque de composants React animés. Tu y trouves des centaines d'effets de texte, de transitions, de cartes, de fonds animés. Tout est en open source.

Je suis allé piocher 4 effets de texte qui me plaisaient visuellement :

- **Gooey text morphing** — l'effet "pâte qui se déforme" entre deux mots

→ [21st.dev/community/components/victorwelander/gooey-text-morphing/default](https://21st.dev/community/components/victorwelander/gooey-text-morphing/default)

- **Text color animation** — la couleur balaye le mot pendant son apparition

→ [21st.dev/community/components/aliimam/text-color/default](https://21st.dev/community/components/aliimam/text-color/default)

- **Text scramble** — l'effet "décodage" caractère par caractère

→ [21st.dev/community/components/motion-primitives/text-scramble/default](https://21st.dev/community/components/motion-primitives/text-scramble/default)

- **Blur fade** — apparition douce avec un flou qui se résorbe

→ [21st.dev/community/components/magicui/blur-fade/default](https://21st.dev/community/components/magicui/blur-fade/default)

L'idée : pas besoin d'inventer un effet. Tu sélectionnes ceux qui existent déjà et tu les enchaînes.

---

## Étape 2 — Choisir tes mots-clés

Tu vas répartir des mots sur tes différents effets. Le mien étant une démo pour un prospect, j'ai choisi 10 mots qui racontent une mini-histoire :

| Bloc | Effet | Mots | |---|---|---| | 1 | Gooey morph | productivité → intelligence artificielle → automatisation | | 2 | Text scramble | data → stratégie → performance | | 3 | Text color | motion design → animation | | 4 | Blur fade | vision → _prénom du prospect_ |

Tu ouvres sur tes capacités, tu glisses vers le vocabulaire business du prospect, tu montres ton savoir-faire, tu signes avec son prénom. Effet "fait sur mesure" garanti.

---

## Étape 3 — Cadrer les contraintes

Avant d'envoyer quoi que ce soit à Claude Design, j'ai défini 2 contraintes non négociables :

1. **Timing par mot** : 0.5 à 1 seconde d'entrée + 1 seconde d'affichage stable + 0.5 à 1 seconde de sortie. Soit 2 à 3 secondes par mot. 10 mots = 20 à 30 secondes de vidéo.
2. **Lisibilité parfaite à l'état stable** : quand un mot est plein écran, il doit être affiché en entier. Aucune lettre coupée, masquée par un calque, un clip-path, ou un overflow. Les déformations pendant les transitions sont OK — c'est l'effet recherché. Mais l'état stable doit être propre.

Cette deuxième contrainte est essentielle. Sans elle, Claude Design te sort des animations où la dernière lettre est mangée par le conteneur. J'ai testé.

---

## Étape 4 — Passer par Claude Code pour rédiger le prompt

Petit détail qui change tout : je ne suis pas allé directement dans Claude Design. Je suis passé par Claude Code en premier pour rédiger le prompt complet, puis j'ai collé ce prompt dans Claude Design.

Pourquoi ? Les tokens de Claude Design partent beaucoup plus vite que ceux de Claude Code. Travailler le brief en amont sur Claude Code, c'est garder mes tokens Claude Design pour ce qu'il fait de mieux : générer le code de l'animation.

C'est un principe que tu peux appliquer à beaucoup de workflows Claude. La réflexion, le brief, l'itération texte → Claude Code. La génération coûteuse (design, image, code complexe) → l'outil spécialisé.

---

## Étape 5 — Le prompt complet pour Claude Design

Voici le prompt que j'ai envoyé. Tu peux le copier et l'adapter avec tes mots et ton design system.

```
CONTEXTE
Vidéo de démonstration motion design (≈25s).

LOGO
Utilise le logo du design system sélectionné.
Apparition en intro (1-2s) et en outro (1-2s).

DIRECTION ARTISTIQUE
Reprends fidèlement les couleurs et la typo du design system.
Zéro emoji, centrage parfait, marges généreuses.

STRUCTURE — 10 MOTS, 4 EFFETS

Bloc 1 — GOOEY TEXT MORPHING (3 mots enchaînés)
Ref : https://21st.dev/community/components/victorwelander/gooey-text-morphing/default
Mots : productivité → intelligence artificielle → automatisation

Bloc 2 — TEXT SCRAMBLE (3 mots enchaînés)
Ref : https://21st.dev/community/components/motion-primitives/text-scramble/default
Mots : data → stratégie → performance

Bloc 3 — TEXT COLOR (2 mots enchaînés)
Ref : https://21st.dev/community/components/aliimam/text-color/default
Mots : motion design → animation

Bloc 4 — BLUR FADE (2 mots, clôture)
Ref : https://21st.dev/community/components/magicui/blur-fade/default
Mots : vision → [prénom du destinataire]

TIMING PAR MOT
- Entrée : 0.5-1s
- État stable, mot 100% lisible : 1s minimum
- Sortie : 0.5-1s

CONTRAINTE DE LISIBILITÉ (NON NÉGOCIABLE)
Quand un mot est dans son état stable, il doit être affiché EN ENTIER.
Aucune lettre coupée, masquée par un calque, clip-path, ou overflow hidden.
Largeur du conteneur suffisante pour le mot le plus long.
Les déformations pendant les transitions sont attendues et OK.

LIVRABLE
Page HTML/React standalone qui joue la séquence en boucle.
Format viewport 16:9.

ORDRE : intro logo → bloc 1 → bloc 2 → bloc 3 → bloc 4 → outro logo
```

---

## Étape 6 — Génération et ajustements

Dans Claude Design, tu sélectionnes ton design system en haut à droite (le mien : Club SMART), tu colles le prompt, et tu laisses générer.

La première version est souvent imparfaite. Mes itérations : ajuster les timings, corriger une lettre tronquée, repositionner le logo. 2 à 3 allers-retours suffisent.

Tu exportes ensuite la page, soit en capture vidéo de l'écran, soit en téléchargeant la page React pour la rejouer en local.

---

## Récap

1. Choisir tes effets sur 21st.dev (4 max)
2. Choisir tes mots (10 max)
3. Définir tes 2 contraintes : timing + lisibilité
4. Rédiger le prompt avec Claude Code
5. Coller dans Claude Design avec ton design system
6. Itérer 2 à 3 fois

Tu as une vidéo motion design propre en moins de 20 minutes, sans aucun logiciel installé.

---
type: support
resume: Leçon Skool de « Ou en es tu avec l'IA? », dossier « Audit: 7 jours pour savoir quoi automatiser » : Jour 4 — Qualifier et prioriser
statut: en-cours
domaine: communaute
cree: 2026-04-23
maj: 2026-07-28
liens: [ou-en-es-tu-avec-l-ia.md, https://www.skool.com/club-smart/classroom/3dbbccbe?md=56df87507c314e65a6dcc996aaef3782]
---
# Jour 4 — Qualifier et prioriser

## Ouverture

Hier, tu as listé tout ce que tu fais au quotidien, à la semaine et au mois. Ta photo est en place.

Aujourd'hui, on ajoute **un chiffre sur chaque ligne** pour voir où passe vraiment ton temps. Parce qu'entre ce qu'on croit, ce qu'on ressent et ce que les chiffres disent, il y a souvent un écart.

À la fin du Jour 4, tu auras **une seule tâche retenue** comme prioritaire pour la suite du challenge — celle qui te consomme le plus de temps en cumul. C'est elle qu'on va décortiquer demain.

## Pourquoi on chiffre

On a tous tendance à prioriser ce qui nous irrite le plus ou ce qui est le plus récent dans notre tête. Pas ce qui nous coûte vraiment le plus de temps.

Le calcul est simple :

> **Temps consommé par tâche = durée d'une occurrence × fréquence**

Ramené à une unité commune — **minutes par semaine** — ça te donne un classement clair, indépendant de ta fatigue du moment.

Et c'est aussi ce qui va te permettre, en fin de challenge, de mettre un chiffre sur ce que tu peux espérer récupérer en automatisant (ou en déléguant) ta tâche prioritaire. "Je peux libérer X heures par semaine" est une phrase beaucoup plus motivante que "j'espère gagner du temps".

## L'outil : un tableur

Pour cet exercice, on sort du [Claude.md](http://Claude.md). Le tableur est beaucoup plus adapté : une colonne par donnée, des formules qui calculent toutes seules, un tri par colonne d'un clic.

**Recommandé** : Google Sheets (gratuit, accessible partout) ou Excel.

**Alternative** : un tableau Markdown dans un fichier séparé (par exemple `mon-audit-priorisation.md`). Plus manuel, plus lent, mais suffisant si tu tiens à rester sur du texte.

### Structure du tableau à créer

| Tâche | Durée / occurrence (min) | Fréquence | Occurrences / semaine | Coefficient pénibilité | Score |

|---|---|---|---|---|---|

| Checker DMs réseaux | 15 | Quotidien | 5 | 1 | 75 |

| Créer une vidéo YouTube | 240 | Hebdo | 1 | 1 | 240 |

| Facturation clients | 120 | Mensuel | 0,25 | 1,5 | 45 |

| Relances clients en retard | 30 | Hebdo | 1 | 2 | 60 |

**Formule** : `Score = Durée × Occurrences par semaine × Coefficient pénibilité`

**Colonnes expliquées** :

- **Tâche** : reprends ligne par ligne ta liste du Jour 3

- **Durée par occurrence (min)** : combien de minutes ça te prend à chaque fois (approximatif, pas besoin de chronométrer)

- **Fréquence** : quotidien / hebdo / mensuel (reprise du J3)

- **Occurrences par semaine** : quotidien = 5, hebdo = 1, mensuel = 0,25

- **Coefficient pénibilité** : par défaut à **1**. Tu peux monter à 1,5 (pénible) ou 2 (très pénible) si tu veux pondérer. Ce n'est pas obligatoire — si tu veux une priorisation 100% volumétrique, tu laisses tout à 1. Le modèle s'adapte à ce que tu veux en faire.

- **Score** : le résultat du calcul, c'est la colonne sur laquelle on trie

Dans Google Sheets ou Excel, tu mets une formule dans la colonne Score pour que le calcul se fasse automatiquement.

---

## Comment trier et décider

Une fois le tableau rempli :

1. **Trie** la colonne "Score" de la plus grande à la plus petite valeur (dans Sheets : Données → Trier la plage)

2. **Prends la tâche en tête** — c'est ta prioritaire pour la suite du challenge

### Règle simple

Le modèle est fait pour s'adapter à ce que toi tu veux faire ressortir :

- Si tu laisses tous les coefficients de pénibilité à 1, tu obtiens une priorisation purement volumétrique (le temps consommé brut)

- Si tu remontes certains coefficients à 1,5 ou 2, tu prends en compte que la pénibilité compte autant que le temps

- C'est toi qui décides la pondération — le tableau ne fait que calculer ce que tu lui dis de calculer

Si tu hésites entre plusieurs pondérations, fais d'abord une passe à 1 partout pour voir le résultat brut. C'est souvent suffisant.

---

## Ce que tu mets dans ton [Claude.md](http://Claude.md)

On ne copie pas le tableau entier dans ton [Claude.md](http://Claude.md) — il vit dans ton tableur. On y met juste **la synthèse**.

Ouvre ton [Claude.md](http://Claude.md) et ajoute :

```
## Ma priorisation

Voir le détail du calcul : [lien vers ton Google Sheet ou ton fichier local]

Tâche prioritaire retenue pour le challenge : [nom de la tâche]

Temps consommé estimé : [X] minutes par semaine

Score pondéré : [Y] (avec coefficient de pénibilité appliqué si utilisé)

Pourquoi celle-ci : [1-2 phrases]

```

C'est tout. Le [Claude.md](http://Claude.md) reste ton référentiel narratif. Le tableau vit à côté.

---

## Ton action du jour

### Action principale (30 à 45 minutes)

1. Ouvre un Google Sheet vierge (ou Excel, ou un fichier Markdown avec un tableau)

2. Reprends ta liste de tâches du J3 et remplis les colonnes

3. Calcule le Score pour chaque ligne (à la main ou avec une formule)

4. Trie par Score décroissant

5. Choisis UNE tâche prioritaire et note-la dans ton [Claude.md](http://Claude.md)

Demain, on décortique cette tâche en étapes et on repère où tu peux gagner.

### Action publique (optionnelle)

Dans le feed de la communauté, partage **ta tâche prioritaire retenue** et le temps qu'elle te coûte par semaine. Format libre, par exemple :

> Ma tâche prio : créer une vidéo YouTube. 240 min / semaine (4 heures).

C'est intéressant pour deux raisons :

- Comparer les ordres de grandeur avec les autres membres ("ah, moi aussi c'est la vidéo")

- Repérer des personnes qui ont le même chantier que toi → potentiels binômes de travail

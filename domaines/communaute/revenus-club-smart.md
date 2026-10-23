---
type: tableau
resume: Revenus du Club SMART mois par mois, recalculés depuis les factures Skool (USD et CAD)
statut: en-cours
domaine: communaute
cree: 2026-10-23
maj: 2026-10-23
liens: [domaines/operations/revenus.md]
---

# Revenus du Club SMART — mois par mois

> Régénéré par `python3 /Users/zeliotin/Dev/skool-toolkit/scripts/skool_revenus.py`, le 2 de chaque mois (routine « Revenus Skool »). **Ne pas éditer à la main** : tout est recalculé depuis les factures Skool à chaque passage, une correction manuelle serait écrasée.

**Skool facture en dollars US.** Les colonnes sont donc en **USD**, sauf les deux marquées CAD — converties au **taux moyen du mois de la Banque du Canada** (série `FXUSDCAD`), qui est le taux accepté par l'ARC. Le Club est passé payant en **juillet 2026**.

## Le tableau

| Mois | Paiements | Encaissé TTC | TVA | CA HT (USD) | CA HT (CAD) | MRR | Coût Skool | Marge (CAD) | Taux |
|---|---|---|---|---|---|---|---|---|---|
| juillet 2026 | 8 × 9 $ + 1 × 99 $ | 205,20 | 34,20 | **171,00** | **241,23** | 80,25 | 99,00 | **101,57** | 1,41 |
| août 2026 | 14 × 9 $ + 3 × 99 $ | 487,80 | 64,80 | **423,00** | **587,89** | 159,00 | 99,00 | **450,30** | 1,39 |
| septembre 2026 | 19 × 9 $ + 3 × 99 $ | 563,19 | 95,19 | **468,00** | **653,42** | 248,75 | 99,00 | **515,20** | 1,40 |
| octobre 2026 | 17 × 9 $ + 1 × 99 $ | 297,32 | 45,32 | **252,00** | **357,51** | — | 99,00 | **217,06** | 1,42 |
| **Total** | | **1 553,51** | **239,51** | **1 314,00** | **1 840,05** | | **396,00** | **1 284,12** | |

## Ce que chaque colonne veut dire, et ce qu'elle ne dit pas

**CA HT** — c'est **ton chiffre d'affaires réel**. Le prix catalogue du plan (9 $ ou 99 $) multiplié par le nombre de prélèvements réussis dans le mois. C'est la colonne à retenir.

**Encaissé TTC** — ce que les membres ont été débités, TVA comprise. Skool est *merchant of record* : il collecte la TVA (20 % pour un particulier français, zéro pour un pro avec numéro intracommunautaire ou un membre hors UE) et la reverse aux impôts. **Cette TVA n'est jamais à toi** — d'où l'écart avec le CA HT.

**MRR fin de mois** — le chiffre du dashboard Skool. Il **ne mesure pas le cash** : un abonnement annuel y compte pour `99 / 12 = 8,25 $/mois` alors qu'il a encaissé 99 $ d'un coup. Il sert à voir la base récurrente, pas les entrées d'argent. Contrôle de cohérence : `MRR = 9 × (nb mensuels) + 8,25 × (nb annuels)`.

**Coût Skool** — ton abonnement à la plateforme, 99 $ prélevés le 20 de chaque mois.

**Marge HT** — CA HT moins le coût de la plateforme, **avant frais de paiement**. Ces frais tournent autour de **3 %** (≈ 2 % + 0,30 $ par transaction), mesurés en rapprochant les versements bancaires des factures : au 2026-10-23, 1 314,00 $ HT facturés pour 943,17 $ déjà versés sur la partie échue.

## Versements reçus en banque

Ce qui a réellement atterri sur le compte, net de TVA et de frais. **Décalage d'environ une semaine** : un virement du 26 couvre les paiements jusqu'au 19. Ne jamais lire le total d'un mois comme le chiffre d'affaires de ce mois.

| Mois | Versé |
|---|---|
| juillet 2026 | 162,37 |
| août 2026 | 238,72 |
| septembre 2026 | 542,08 |
| **Total** | **943,17** |

## Le piège à ne pas refaire

Le premier réflexe est de lire le MRR sur le dashboard Skool et de le prendre pour le revenu du mois. C'est faux dans les deux sens : le MRR ignore le montant réellement encaissé par les annuels, et il compte des abonnements qui n'ont rien prélevé ce mois-là. Septembre 2026 est l'exemple parfait — **248,75 $ de MRR affiché, 468,00 $ HT encaissés**.

Deuxième piège, plus sournois : **la ligne du mois qui vient de finir met plusieurs heures à se stabiliser**. Le 1er septembre au matin, l'API donnait 141,75 $ pour août ; le soir, 159,00 $ — les deux conversions du 31 août au soir avaient enfin été intégrées. Ne fige jamais un mois avant le lendemain, régénère.

Le détail des sources, les endpoints et leurs pièges : `docs/API-REFERENCE.md` du toolkit Skool.

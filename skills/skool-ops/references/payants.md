# Compter les abonnés et les payants

Ne divise jamais le MRR par le prix affiché : il y a deux offres, et un essai gratuit ne produit aucun MRR.

## La méthode

La donnée nominative vit dans la liste des membres :

```bash
skool-pp-cli members list --agent
```

Pour chaque membre, regarde le sous-objet `member` :

- `member.metadata.mmbp` : l'offre souscrite, en JSON, avec `amount` en cents et `recurring_interval` (mois ou année). Vide : pas d'abonnement.
- `member.metadata.isFreeTrial` : vrai pendant l'essai gratuit.
- `member.billingCanceled` : la date d'annulation. Le membre garde l'accès jusqu'à la fin de la période payée.

La même liste existe sur `www.skool.com/_next/data/{buildId}/club-smart/-/members.json?p={1..N}`, si la CLI ne suffit pas.

## Toujours deux chiffres

- **Les abonnements actifs** mesurent l'adhésion. Les essais en cours y sont.
- **Les payants facturés** mesurent le revenu. Les essais n'y sont jamais.

Signale à part ceux qui ont annulé mais ont encore accès.

## Les montants

L'API rend des cents : `11475` se lit 114,75 $. Convertis avant tout calcul et avant de montrer un chiffre. Une offre annuelle se ramène au mois en divisant par 12 (99 $ par an font 8,25 $ par mois).

## Pour recouper

Relevé du 2026-08-19 : 180 membres, 17 abonnements actifs (14 à 9 $ par mois, 3 à 99 $ par an), dont 4 essais, soit 13 payants facturés. Le MRR se recoupe : 10 × 9 $ plus 3 × 8,25 $ font 114,75 $ par mois.

Le relevé mois par mois des vraies factures est dans `skool_revenus.py`, encore branché sur l'ancien Vault (`api.md`).

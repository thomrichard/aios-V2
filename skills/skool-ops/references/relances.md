# Relances de départ : textes et règles

Repris le 2026-10-23 du dispositif « départs » de l'ancien Vault (`email-feedback-churn.md`, 2026-07-31). But : comprendre pourquoi les gens partent, tant que c'est frais, pour corriger l'offre. Contrepartie : 3 mois d'accès offerts, sans condition.

La veille automatique des départs est arrêtée depuis le 2026-10-23. Thomas relancera à la main, depuis un futur écran des abonnés. Pour voir qui part : `python3 skool_churn_radar.py` (`api.md`).

## Qui contacter

- **Cas C, annulation en cours** : encore membre, accès jusqu'à une date précise. La priorité : on peut encore lui parler pendant qu'il est dedans. Écrire avant la fin d'accès.
- **Cas B, essai non converti** : parti à la fin de l'essai. Au-delà de 14 jours, on ne contacte plus.
- **Cas A, payant parti** : quelqu'un qui part après plusieurs mois payés.

Le compte à rebours, c'est la fin d'accès (`mbscpe`), pas la date d'annulation.

Pièges de lecture, déjà gérés par le radar :
- l'e-mail est dans `member.metadata.mbme`, jamais dans `user.email` (toujours vide) ;
- l'entrée dans le Club, c'est `member.createdAt` ; `user.createdAt` est la création du compte Skool ;
- le compteur de l'onglet « Cancelling » n'est juste que si on interroge cet onglet ;
- l'onglet `churned` mêle les retraits admin, les départs de l'ère gratuite (sans e-mail ni date) et les essais non convertis, seuls à contacter.

## Comment écrire

Toujours par Gmail, en texte brut, depuis l'adresse perso. Un envoi Kit part avec un pied de page de désinscription et se lit comme une newsletter. Délai : J+2 après le départ ; pour un cas C, avant la fin d'accès.

### Cas C : annulation en cours

Objet : Avant que tu partes — une question

```
Salut {{prenom}},

J'ai vu que tu avais annulé ton abonnement. Tu as encore accès jusqu'à la fin de
ta période, donc je ne t'écris pas pour te retenir.

Juste une question, et réponds franchement : qu'est-ce qui n'a pas marché pour toi ?

Tu peux être direct, même sec. Je construis ce truc en public et j'ai plus besoin
de vraies raisons que de politesses.

Et quoi que tu me répondes, je te laisse {{duree}} d'accès offerts. Ce n'est pas
une manœuvre pour te faire rester, c'est un merci pour le temps que tu m'accordes.
Tu en fais ce que tu veux.

Réponds directement à ce mail, ça arrive chez moi.

Thomas
```

La phrase qui porte le mail : « je ne t'écris pas pour te retenir ». Sans elle, il se lit comme une tentative de rétention.

### Cas B : essai non converti

Objet : Tu n'as pas continué — je peux te demander pourquoi ?

```
Salut {{prenom}},

Tu as commencé un essai au Club SMART et tu n'as pas continué. Je cherche à
comprendre pourquoi — c'est comme ça que je l'améliore pour les suivants.

Une seule question : qu'est-ce que tu venais chercher, et que tu n'as pas trouvé ?

Réponds franchement, même si c'est sec. C'est ce qui m'aide le plus.

Et quoi que tu me dises, je t'offre {{duree}} d'accès. Ce n'est pas un échange,
juste un merci pour ton temps.

Réponds directement à ce mail.

Thomas
```

### Cas A : payant parti

Objet : Qu'est-ce qui t'a manqué ?

```
Salut {{prenom}},

Tu as quitté le Club SMART, et je préfère comprendre plutôt que deviner.

Une seule question, et réponds franchement : qu'est-ce qui t'a manqué ?

Tu peux être direct, même sec. C'est ce qui m'aide le plus — je construis ce truc
en public, et je préfère les vraies raisons aux politesses.

Et quoi que tu me répondes, je t'offre {{duree}} d'accès. Ce n'est pas une
contrepartie, c'est un merci pour le temps que tu m'accordes. Si tu veux en
profiter pour voir ce que ça devient, la porte reste ouverte. Sinon ta réponse
me sert quand même.

Réponds directement à ce mail, ça arrive chez moi.

Thomas
```

`{{duree}}` vaut 3 mois par défaut.

## Les règles

- **Une seule question.** Deux font baisser les réponses.
- **Le cadeau est sans condition** : offert pour le temps accordé, jamais en échange d'une réponse.
- **Texte brut, aucune mise en forme** : ça doit ressembler à un mail tapé à la main.
- **Une seule fois, aucune relance.**
- **Une ligne personnalisée quand c'est possible** : s'il a posté dans le fil, le citer ; sinon, sa source d'arrivée (« tu étais arrivé par une de mes vidéos YouTube… »). Une accroche qui sonne faux : la couper.

## Ce qu'on fait des réponses

Les noter avec les témoignages des membres, à part : « ce que disent ceux qui partent ». Les croiser avec les objections déjà entendues (« on ne sait pas vraiment ce qu'on obtient en payant », « on le trouve gratuit partout ») : chaque réponse qui les recoupe est un argument à corriger dans la page de vente.

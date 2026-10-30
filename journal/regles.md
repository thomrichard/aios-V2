# Règles

Les règles du système : comment on travaille, ce qui vaut pour tout le workspace et dure. Les décisions d'un projet n'y vont pas : elles vivent dans la fiche du projet, partie « Décisions ».

Ajout seul. Pour chaque règle : la date, la règle, pourquoi, ce qu'on a écarté.

## 2026-10-30 · L'outbox est une vue, pas un dossier qu'on range la nuit

- **Règle.** L'onglet Outbox montre, jour par jour, les fichiers que l'IA a écrits ou modifiés, là où ils sont rangés. « Valider » les range : la trace va dans `outbox/ranges.md`, le fichier ne bouge pas. Le rangement de 2 h vide l'inbox et écrit le point du jour ; il ne range plus l'outbox, qui se remplit dans la journée.
- **Pourquoi.** Retrouver vite ce que l'IA a produit dans la journée ; l'outbox est une vue, pas un dossier qu'on range la nuit.
- **Écarté.** Déposer les livrables dans `outbox/` pour les ranger la nuit : un objet, un endroit, et un fichier déplacé deux fois perd sa trace.

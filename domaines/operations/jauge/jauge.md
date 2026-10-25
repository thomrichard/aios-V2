---
type: livrable
resume: La jauge, un mod Claude Code qui montre en direct, au-dessus du message, les limites 5 h et 7 j, le contexte, le cache et le coût estimé, et qui garde le cache chaud tant que ça vaut le coup
statut: clos
domaine: operations
cree: 2026-10-24
maj: 2026-10-24
liens: []
---
# jauge

Une bande fine au-dessus du message de Claude Code : ce qui te reste sur les limites de 5 h et de 7 j (barre, %, « reset dans 2 h 10 »), BAS sous 15 %, le contexte rempli, le cache CHAUD ou FROID, et le coût estimé du prochain message. Une ligne quand la fenêtre est large, deux quand elle est étroite.
Elle lit `$.session.usage()` et `session.measure`, puis dessine. Une donnée absente s'affiche « — ».
Le cache est une estimation : l'API des mods ne l'expose pas. Chaud moins d'une heure après la dernière requête (abonnement), moins de 5 minutes (clé API).
Relance : avec un abonnement et plus de 50 000 tokens de contexte, elle relance le cache 55 min après la dernière requête (`$.model.fork`, son seul appel à un modèle), tant que c'est moins cher que de le laisser refroidir (39 relances, environ 36 h, sur Opus 5.5).
Le coût compte seulement la relecture du contexte, aux prix publics de platform.claude.com/docs/en/about-claude/pricing (prix standard, sans mode rapide).
Installée depuis ce dossier : `claude plugin marketplace add domaines/operations/jauge`, puis `claude plugin install jauge@aios-mods`. Après une retouche : `/reload-plugins`. Terminal et app de bureau, Claude Code 2.1.287 ou plus.
Tester : `claude plugin test domaines/operations/jauge`. Vérifier : `claude plugin validate domaines/operations/jauge`.
Idée reprise de Ribbon, le mod de Jay E (github.com/robonuggets/ribbon, licence MIT).

#!/usr/bin/env bash
# Garde en accord les copies du workspace (un ordinateur, un serveur) et GitHub, qui fait foi.
#   synchro.sh envoyer [message]  enregistre tout, fusionne GitHub, refait les fichiers générés, puis envoie.
#                                 La sauvegarde de nuit ; sur un serveur, la fermeture de la journée, après le « valide ».
#   synchro.sh recuperer          récupère GitHub sans fusion. Si quelque chose bloque, ne touche à rien et sort en échec.
# Les fichiers générés (merge=ours dans .gitattributes) ne se fusionnent pas : index.py les refait après la fusion.
# Les journaux en ajout seul se fusionnent ligne à ligne (merge=union).
# Le dépôt visé : « prive » s'il existe, sinon « origin » ; la branche : main.
set -u
cd "$(dirname "$0")/../.." || exit 1

DEPOT=origin
if git remote get-url prive >/dev/null 2>&1; then DEPOT=prive; fi
BRANCHE=main
# Le pilote « ours » nommé dans .gitattributes vit dans la config de chaque machine : on le déclare à chaque passage.
git config merge.ours.driver true

sur_main() {
  [ "$(git branch --show-current)" = "$BRANCHE" ] && return 0
  echo "pas sur la branche $BRANCHE : rien fait"
  return 1
}

# Fusionne ce qu'on vient de récupérer. Une autre routine peut écrire pendant ce temps (sa ligne de journal,
# quand plusieurs routines partent à la même seconde au réveil de la machine) : Git refuse alors de fusionner
# par-dessus un fichier pas enregistré. On enregistre donc juste avant de fusionner, et on recommence si ça arrive encore.
fusionner() {
  local message="$1" tour
  for tour in 1 2 3; do
    git add -A
    if ! git diff --cached --quiet; then git commit -q --no-verify -m "$message"; fi
    if git merge -q --no-edit "$DEPOT/$BRANCHE" >/dev/null 2>&1; then return 0; fi
    # Une fusion commencée puis arrêtée : un vrai conflit, pas une écriture en cours.
    if git rev-parse -q --verify MERGE_HEAD >/dev/null; then
      echo "en conflit : $(git diff --name-only --diff-filter=U | head -10 | tr '\n' ' ')"
      git merge --abort 2>/dev/null
      return 1
    fi
  done
  return 1
}

envoyer() {
  local message="${1:-Sauvegarde de nuit}"
  sur_main || return 1
  python3 systeme/scripts/verifier.py --sauvegarde || return 1
  git add -A
  if ! git diff --cached --quiet; then git commit -q --no-verify -m "$message"; fi
  # Deux essais : si une autre machine a envoyé entre la fusion et l'envoi, on refusionne une fois.
  local essai
  for essai in 1 2; do
    if ! git fetch -q "$DEPOT" "$BRANCHE"; then
      echo "GitHub injoignable : rien n'est envoyé, l'enregistrement reste sur cette machine"
      return 1
    fi
    if ! fusionner "$message"; then
      echo "fusion avec GitHub bloquée par un conflit : rien n'est envoyé, l'enregistrement reste sur cette machine"
      return 1
    fi
    python3 systeme/scripts/index.py >/dev/null || echo "index.py a échoué : les fichiers générés ne sont pas refaits"
    git add -A
    if ! git diff --cached --quiet; then git commit -q --no-verify -m "Fichiers générés, après fusion"; fi
    if git push -q "$DEPOT" "$BRANCHE"; then return 0; fi
  done
  echo "envoi GitHub refusé deux fois : l'enregistrement reste sur cette machine"
  return 1
}

recuperer() {
  sur_main || return 1
  git fetch -q "$DEPOT" "$BRANCHE" || { echo "GitHub injoignable : rien récupéré"; return 1; }
  local cible="$DEPOT/$BRANCHE"
  if git merge-base --is-ancestor "$cible" HEAD; then echo "déjà à jour"; return 0; fi
  if ! git merge-base --is-ancestor HEAD "$cible"; then
    echo "des enregistrements de cette machine ne sont pas sur GitHub : rien récupéré"
    return 1
  fi
  # Seuls les journaux en ajout seul peuvent attendre : ils se remettent en place ligne à ligne.
  local autres
  autres=$(git status --porcelain --untracked-files=no -- . ':!journal/log.md' ':!journal/routines.jsonl')
  if [ -n "$autres" ]; then
    echo "des changements non enregistrés attendent sur cette machine : rien récupéré"
    echo "$autres" | head -10
    return 1
  fi
  git merge -q --ff-only --autostash "$cible" || { echo "récupération échouée"; return 1; }
  echo "récupéré : $(git rev-parse --short HEAD)"
}

case "${1:-}" in
  envoyer) shift; envoyer "$@" ;;
  recuperer) recuperer ;;
  *) echo "usage : synchro.sh envoyer [message] | recuperer"; exit 2 ;;
esac

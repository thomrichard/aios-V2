#!/usr/bin/env python3
"""Regroupe les points ouverts dans outbox/points-ouverts.md : la prochaine étape de chaque projet vivant, et les
points de reprise du dernier bilan de chaque projet vivant (partie « Historique » de sa fiche), et les alertes du
vérificateur présentes depuis au moins 3 jours (le jour où chacune est apparue est retenu dans journal/alertes.json).
L'agent les passe ensuite en revue avec l'utilisateur, en session : une routine de nuit ne peut pas poser
de question. Sans IA : c'est une routine directe (systeme/routines.md).

  python3 systeme/scripts/points_ouverts.py          écrit le fichier
  python3 systeme/scripts/points_ouverts.py --essai  affiche le fichier, sans rien écrire
"""
import argparse
import datetime
import glob
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index import RACINE, lire_entete, types_regles  # noqa: E402

SORTIE = os.path.join(RACINE, "outbox", "points-ouverts.md")
ETAT = os.path.join(RACINE, "journal", "alertes.json")
JOURS = 3


def projets():
    """Les projets vivants : (chemin relatif, prochaine étape)."""
    fins = types_regles()["projet"][1]
    for chemin in sorted(glob.glob(os.path.join(RACINE, "projets", "*.md"))):
        entete = lire_entete(chemin)
        if entete.get("type") == "projet" and entete.get("statut") not in fins:
            yield os.path.relpath(chemin, RACINE), entete.get("prochaine_etape", "À définir")


def reprises():
    """Les points de reprise du dernier bilan de chaque projet vivant : (chemin relatif, ligne)."""
    fins = types_regles()["projet"][1]
    for chemin in sorted(glob.glob(os.path.join(RACINE, "projets", "*.md"))):
        entete = lire_entete(chemin)
        if entete.get("type") != "projet" or entete.get("statut") in fins:
            continue
        with open(chemin, encoding="utf-8") as f:
            texte = f.read()
        _, trouve, historique = texte.partition("\n## Historique\n")
        if not trouve:
            continue
        dernier = historique.split("\n## ")[0].split("\n### ")
        dernier = dernier[1] if len(dernier) > 1 else ""
        _, trouve, suite = dernier.partition("Point de reprise :\n")
        for ligne in suite.splitlines():
            if not ligne.startswith("- "):
                break
            yield os.path.relpath(chemin, RACINE), ligne[2:].strip()


def cle(alerte):
    """Une alerte sans ses chiffres : « fait 67 lignes » et « fait 68 lignes » sont la même alerte."""
    return re.sub(r"\d+", "#", alerte)


def alertes(aujourdhui):
    """Les alertes du vérificateur, avec le jour où chacune est apparue : (état à retenir, [(depuis, alerte)] de celles
    présentes depuis au moins JOURS jours). Une alerte qui disparaît sort de l'état. « Index pas à jour » n'y entre pas :
    index.py le corrige seul chaque nuit."""
    sortie = subprocess.run([sys.executable, os.path.join(RACINE, "systeme", "scripts", "verifier.py")],
                            capture_output=True, text=True).stdout
    actuelles = [l[8:].strip() for l in sortie.splitlines()
                 if l.startswith(("ALERTE  ", "ERREUR  ")) and "Index pas à jour" not in l]
    try:
        with open(ETAT, encoding="utf-8") as f:
            vues = json.load(f)
    except (OSError, ValueError):
        vues = {}
    etat = {cle(a): vues.get(cle(a), str(aujourdhui)) for a in actuelles}
    anciennes = sorted((etat[cle(a)], a) for a in actuelles
                       if (aujourdhui - datetime.date.fromisoformat(etat[cle(a)])).days >= JOURS - 1)
    return etat, anciennes


def contenu(anciennes=()):
    lignes = ["# Points ouverts", "",
              f"Généré par `systeme/scripts/points_ouverts.py`, le {datetime.date.today()}. Ne pas écrire à la main.",
              "L'agent les passe en revue en session, une question à la fois.", "", "## Projets", ""]
    lignes += [f"- {chemin} · {etape}" for chemin, etape in projets()]
    lignes += ["", "## Bilans à reprendre", ""]
    lignes += [f"- {chemin} · {ligne}" for chemin, ligne in reprises()]
    if anciennes:
        lignes += ["", "## Alertes à trancher", "",
                   f"Le vérificateur les signale depuis au moins {JOURS} jours : on corrige, ou on écrit la règle qui les couvre.", ""]
        lignes += [f"- depuis le {depuis} · {alerte}" for depuis, alerte in anciennes]
    return "\n".join(lignes) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--essai", action="store_true")
    etat, anciennes = alertes(datetime.date.today())
    if parser.parse_args().essai:
        print(contenu(anciennes))
        return
    with open(ETAT, "w", encoding="utf-8") as f:
        json.dump(etat, f, ensure_ascii=False, indent=1, sort_keys=True)
    with open(SORTIE, "w", encoding="utf-8") as f:
        f.write(contenu(anciennes))


if __name__ == "__main__":
    main()

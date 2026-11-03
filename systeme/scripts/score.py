#!/usr/bin/env python3
"""Calcule le score des vidéos : une note sur 100 écrite dans l'en-tête de chaque fiche vivante de type video
(champ score), d'après ses champs objectif, affinite, preparation, potentiel, preuve et effort.

Les poids vivent dans un seul fichier, domaines/<domaine>/score-videos.md. Sans ce fichier, le script ne fait rien.
Une fiche à laquelle il manque un critère n'a pas de score. Une fiche à son statut de fin garde le sien : c'est le
score prévu. Le champ maj ne bouge pas : un score n'est pas une retouche. index.py le lance à chaque passage.

  python3 systeme/scripts/score.py          écrit les scores, et dit quelles fiches n'en ont pas
  python3 systeme/scripts/score.py --essai  dit ce qu'il écrirait, sans rien écrire
  python3 systeme/scripts/score.py --a-mesurer  réussit s'il reste une fiche sans potentiel ou sans preuve (pour ne lancer l'IA que s'il y a du travail)
"""
import argparse
import glob
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index import RACINE, fiches, tableau, types_regles  # noqa: E402

CRITERES = ("potentiel", "objectif", "preuve", "affinite", "preparation", "effort")


def reglages():
    """Les poids, la valeur de chaque objectif et le plafond d'effort ; None sans fichier de poids."""
    trouves = glob.glob(os.path.join(RACINE, "domaines", "*", "score-videos.md"))
    if not trouves:
        return None
    chemin = trouves[0]
    poids = {l["Critère"]: float(l["Poids"]) for l in tableau(chemin, "Critère")}
    valeurs = {l["Objectif"]: float(l["Valeur"]) for l in tableau(chemin, "Objectif")}
    plafond = float(tableau(chemin, "Réglage")[0]["Valeur"])
    return poids, valeurs, plafond


def calcul(e, poids, valeurs, plafond):
    """(score, ce qui manque) pour un en-tête. Le score vaut None tant qu'un critère manque ou n'est pas valable."""
    notes, manque = {}, []
    for critere, maximum in (("potentiel", 100), ("preuve", 100), ("affinite", 5), ("preparation", 5)):
        try:
            note = float(e.get(critere, ""))
        except ValueError:
            note = -1
        if 0 <= note <= maximum:
            notes[critere] = note / maximum
        else:
            manque.append(critere)
    if e.get("objectif") in valeurs:
        notes["objectif"] = valeurs[e["objectif"]] / 100
    else:
        manque.append("objectif")
    try:
        heures = float(e.get("effort", ""))
    except ValueError:
        heures = -1
    if heures >= 0:
        notes["effort"] = 1 - min(heures, plafond) / plafond
    else:
        manque.append("effort")
    if manque:
        return None, manque
    total = sum(poids[c] for c in CRITERES)
    return round(sum(poids[c] * notes[c] for c in CRITERES) / total * 100), []


def ecrire_score(chemin, score):
    """Pose ou retire le champ score d'un en-tête, sans toucher au reste. Vrai si le fichier a changé."""
    with open(chemin, encoding="utf-8") as f:
        texte = f.read()
    fin = texte.find("\n---", 3)
    if not texte.startswith("---") or fin < 0:
        return False
    entete, corps = texte[:fin], texte[fin:]
    sans = re.sub(r"^score:.*\n?", "", entete, flags=re.M).rstrip("\n")
    if score is None:
        nouveau = sans
    elif re.search(r"^cree:", sans, re.M):
        nouveau = re.sub(r"^cree:", f"score: {score}\ncree:", sans, count=1, flags=re.M)
    else:
        nouveau = f"{sans}\nscore: {score}"
    if nouveau == entete:
        return False
    with open(chemin, "w", encoding="utf-8") as f:
        f.write(nouveau + corps)
    return True


def calculer(essai=False):
    """Passe sur les fiches : [(fiche, score)] de ce qui a changé, et [(fiche, ce qui manque)]."""
    regles = reglages()
    if regles is None or "video" not in types_regles():
        return [], []
    fins = set(types_regles()["video"][1])
    changes, sans_score = [], []
    for rel, e in fiches():
        if e.get("type") != "video" or e.get("statut") in fins:
            continue
        score, manque = calcul(e, *regles)
        if manque:
            sans_score.append((rel, manque))
        if str(score) == e.get("score") or (score is None and "score" not in e):
            continue
        if essai or ecrire_score(os.path.join(RACINE, rel), score):
            changes.append((rel, score))
    return changes, sans_score


def main():
    parseur = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parseur.add_argument("--essai", action="store_true", help="dit ce qu'il écrirait, sans rien écrire")
    parseur.add_argument("--a-mesurer", action="store_true", help="réussit s'il reste une fiche sans potentiel ou sans preuve")
    args = parseur.parse_args()
    if args.a_mesurer:
        _, sans_score = calculer(essai=True)
        return 0 if any({"potentiel", "preuve"} & set(manque) for _, manque in sans_score) else 1
    changes, sans_score = calculer(args.essai)
    for rel, score in changes:
        print(f"{rel} : score {'retiré' if score is None else score}")
    for rel, manque in sans_score:
        print(f"{rel} : pas de score, il manque {', '.join(manque)}")
    print(f"{len(changes)} score(s) mis à jour, {len(sans_score)} fiche(s) sans score.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

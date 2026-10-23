#!/usr/bin/env python3
"""Range un fichier d'après son en-tête : la colonne « Chemin » de systeme/metadonnees.md donne sa place.
Les fichiers qui portent le même nom (le PDF qu'une fiche décrit) partent avec lui. Une vidéo ou un son va dans le
dossier des fichiers lourds (FICHIERS_LOURDS dans .env), hors du dépôt, et la fiche garde son chemin (champ fichier).
Sans IA : la skill classer choisit l'en-tête, ce script en déduit la place.

Usage : python3 systeme/scripts/ranger.py <fichier.md ou dossier> [--essai]
  <dossier> : un objet de plusieurs fichiers, dont la fiche porte le nom (<nom>/<nom>.md).
  --essai : montre ce qui serait fait, sans rien déplacer.
Code 1 si l'en-tête ne permet pas de ranger : rien n'est déplacé, et le message dit pourquoi.
"""
import argparse
import os
import shutil
import subprocess
import sys

from index import LOURDS, RACINE, chemin_attendu, chemins, lire_entete, slug_de
from lancer import dossier_lourds
from verifier import ecarts_entete, regles_entetes


def rel(chemin):
    return os.path.relpath(chemin, RACINE).replace(os.sep, "/")


def ecrire_champ(chemin, champ, valeur):
    """Écrit un champ dans l'en-tête, ou remplace sa valeur."""
    with open(chemin, encoding="utf-8") as f:
        lignes = f.read().split("\n")
    fin = lignes.index("---", 1)
    for i in range(1, fin):
        if lignes[i].startswith(champ + ":"):
            lignes[i] = f"{champ}: {valeur}"
            break
    else:
        lignes.insert(fin, f"{champ}: {valeur}")
    with open(chemin, "w", encoding="utf-8") as f:
        f.write("\n".join(lignes))


def plan(element):
    """Ce qu'il faut déplacer : (fiche, destination de la fiche, [(source, destination)], [fichiers lourds]).
    Lève ValueError avec la raison si l'élément ne peut pas être rangé."""
    if os.path.isdir(element):
        fiche = os.path.join(element, os.path.basename(element) + ".md")
        if not os.path.exists(fiche):
            raise ValueError(f"{rel(element)}/ n'a pas de fiche à son nom ({os.path.basename(element)}.md)")
    elif element.endswith(".md"):
        fiche = element
    else:
        raise ValueError(f"{rel(element)} n'est pas une fiche : écris d'abord sa fiche (skill fiche), à son nom")

    e = lire_entete(fiche)
    if not e:
        raise ValueError(f"{rel(fiche)} n'a pas d'en-tête : la skill classer doit l'écrire")
    ecarts = ecarts_entete(e, rel(fiche), *regles_entetes(), place=False)
    if ecarts:
        raise ValueError("l'en-tête ne suit pas systeme/metadonnees.md :\n  " + "\n  ".join(ecarts))
    modele = chemins().get(e.get("type", ""))
    if not modele:
        raise ValueError(f"le type « {e.get('type', '')} » n'a pas de chemin dans systeme/metadonnees.md")
    cible = chemin_attendu(modele, e, slug_de(os.path.basename(element)))
    if not cible:
        raise ValueError(f"le chemin {modele} demande une valeur absente de l'en-tête (domaine, cree) ou du nom")
    cible = os.path.join(RACINE, cible)

    if os.path.isdir(element):
        dossier = cible[:-3]
        destination = os.path.join(dossier, os.path.basename(dossier) + ".md")
        mouvements = [(element, dossier)]
        lourds = [os.path.join(d, n) for d, _, noms in os.walk(element) for n in noms if n.lower().endswith(LOURDS)]
    else:
        destination = cible
        base = os.path.splitext(fiche)[0]
        voisins = [os.path.join(os.path.dirname(fiche), n) for n in os.listdir(os.path.dirname(fiche))]
        compagnons = sorted(v for v in voisins if os.path.splitext(v)[0] == base and v != fiche and os.path.isfile(v))
        mouvements = [(fiche, cible)] + [(c, os.path.splitext(cible)[0] + os.path.splitext(c)[1]) for c in compagnons]
        lourds = [c for c in compagnons if c.lower().endswith(LOURDS)]

    if lourds:
        racine_lourds = dossier_lourds()
        if not racine_lourds or not os.path.isdir(racine_lourds) or not os.access(racine_lourds, os.W_OK):
            raise ValueError("une vidéo ou un son est à ranger, mais le dossier des fichiers lourds manque ou ne "
                             "s'écrit pas : règle FICHIERS_LOURDS dans .env (un dossier Google Drive synchronisé)")
        sortants = []
        for source in lourds:
            if os.path.isdir(element):
                dedans = os.path.relpath(source, element)
                arrivee = os.path.join(racine_lourds, rel(cible[:-3]), dedans)
            else:
                arrivee = os.path.join(racine_lourds, rel(os.path.splitext(cible)[0]) + os.path.splitext(source)[1])
            sortants.append((source, arrivee))
        mouvements = [m for m in mouvements if m[0] not in lourds] + sortants
        lourds = [os.path.relpath(a, racine_lourds).replace(os.sep, "/") for _, a in sortants]
    return fiche, destination, mouvements, lourds


def main():
    p = argparse.ArgumentParser()
    p.add_argument("element")
    p.add_argument("--essai", action="store_true")
    a = p.parse_args()
    element = os.path.abspath(a.element.rstrip("/"))
    if not os.path.exists(element):
        print(f"Introuvable : {a.element}")
        return 1
    try:
        fiche, destination, mouvements, lourds = plan(element)
    except ValueError as raison:
        print(f"Pas rangé : {raison}")
        return 1

    mouvements = [(s, d) for s, d in mouvements if os.path.abspath(s) != os.path.abspath(d)]
    if not mouvements:
        print(f"Déjà à sa place : {rel(fiche)}")
        return 0
    occupees = [d for _, d in mouvements if os.path.exists(d)]
    if occupees:
        print("Pas rangé : la place est déjà prise : " + ", ".join(rel(d) for d in occupees))
        return 1
    for source, arrivee in mouvements:
        hors_depot = os.path.relpath(arrivee, RACINE).startswith("..")
        print(f"{rel(source)} → {arrivee if hors_depot else rel(arrivee)}" + (" (fichiers lourds)" if hors_depot else ""))
    if a.essai:
        return 0

    # Les fichiers lourds d'abord, depuis leur place d'origine ; puis la fiche et ses voisins (ou le dossier).
    for source, arrivee in sorted(mouvements, key=lambda m: not os.path.relpath(m[1], RACINE).startswith("..")):
        os.makedirs(os.path.dirname(arrivee), exist_ok=True)
        shutil.move(source, arrivee)
    if os.path.isdir(element):
        dossier = os.path.dirname(destination)
        ancienne = os.path.join(dossier, os.path.basename(fiche))
        if ancienne != destination:
            os.rename(ancienne, destination)
    if lourds:
        ecrire_champ(destination, "fichier", "[" + ", ".join(lourds) + "]")
    print(f"Rangé : {rel(destination)}")
    return subprocess.run([sys.executable, os.path.join(RACINE, "systeme", "scripts", "index.py")],
                          capture_output=True).returncode


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Lance une skill sans discussion, avec l'agent choisi dans .env et le modèle de systeme/modeles.md.
Lance aussi une routine directe de systeme/routines.md : sa commande, sans IA.

Usage : python3 systeme/scripts/lancer.py <skill ou routine> [--modele NOM] [--agent claude|codex|gemini] [--essai]
  <routine> : son nom en minuscules, avec des tirets (« Fiches YouTube » → fiches-youtube).
  --essai : affiche la commande sans la lancer.
"""
import argparse
import os
import re
import shlex
import subprocess
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMMANDES = {"claude": "claude -p", "codex": "codex exec", "gemini": "gemini -p"}


def lire_env():
    valeurs = {}
    chemin = os.path.join(RACINE, ".env")
    if os.path.exists(chemin):
        with open(chemin, encoding="utf-8") as f:
            for ligne in f:
                ligne = ligne.strip()
                if ligne and not ligne.startswith("#") and "=" in ligne:
                    cle, valeur = ligne.split("=", 1)
                    valeurs[cle.strip()] = valeur.strip().strip("\"'")
    return valeurs


def dossier_lourds():
    """Le dossier des fichiers lourds (FICHIERS_LOURDS dans .env), en chemin absolu ; None s'il n'est pas réglé."""
    dossier = lire_env().get("FICHIERS_LOURDS", "")
    if not dossier:
        return None
    dossier = os.path.expanduser(dossier)
    return dossier if os.path.isabs(dossier) else os.path.join(RACINE, dossier)


def routine_directe(nom):
    """La commande d'une routine directe de systeme/routines.md, ou None."""
    from index import tableau
    for r in tableau(os.path.join(RACINE, "systeme", "routines.md"), "Routine"):
        commande = r.get("Commande", "").strip("`")
        if commande not in ("", "—", "-") and r["Routine"].lower().replace(" ", "-") == nom:
            return commande
    return None


def tableaux_modeles():
    """Lit systeme/modeles.md : niveau de chaque skill, modèle de chaque niveau par agent."""
    with open(os.path.join(RACINE, "systeme", "modeles.md"), encoding="utf-8") as f:
        texte = f.read()
    tableaux, courant = [], []
    for ligne in texte.splitlines():
        if ligne.startswith("|"):
            courant.append([c.strip() for c in ligne.strip("|").split("|")])
        elif courant:
            tableaux.append(courant)
            courant = []
    if courant:
        tableaux.append(courant)
    niveaux = {r[0]: r[1] for r in tableaux[0][2:]}
    entete = tableaux[1][0]
    modeles = {r[0]: dict(zip(entete[1:], r[1:])) for r in tableaux[1][2:]}
    return niveaux, modeles


def main():
    p = argparse.ArgumentParser()
    p.add_argument("skill")
    p.add_argument("--modele")
    p.add_argument("--agent")
    p.add_argument("--essai", action="store_true")
    a = p.parse_args()

    directe = routine_directe(a.skill)
    if directe:
        if a.essai:
            print(directe)
            return 0
        return subprocess.run(directe, shell=True, cwd=RACINE).returncode

    if not re.fullmatch(r"[a-z0-9-]+", a.skill) or not os.path.exists(os.path.join(RACINE, "skills", a.skill, "SKILL.md")):
        print(f"Skill introuvable : skills/{a.skill}/SKILL.md")
        return 1

    env = lire_env()
    agent = a.agent or env.get("AGENT", "claude")
    if agent not in COMMANDES:
        print(f"Agent inconnu : {agent} (claude, codex ou gemini)")
        return 1
    commande = shlex.split(env.get(f"CMD_{agent.upper()}", COMMANDES[agent]))

    modele = a.modele
    if not modele:
        niveaux, modeles = tableaux_modeles()
        niveau = niveaux.get(a.skill, "moyen")
        modele = modeles.get(niveau, {}).get(agent, "")
        if modele.startswith("à remplir"):
            modele = ""
    if modele:
        commande += ["--model", modele]

    prompt = f"Exécute la skill définie dans skills/{a.skill}/SKILL.md, en suivant AGENTS.md."
    commande.append(prompt)

    if a.essai:
        print(shlex.join(commande))
        return 0
    return subprocess.run(commande, cwd=RACINE).returncode


if __name__ == "__main__":
    sys.exit(main())

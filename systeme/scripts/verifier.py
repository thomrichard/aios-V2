#!/usr/bin/env python3
"""Contrôle le workspace : source unique, liens vers skills/, index d'images, mémoire, plafonds, index à jour.

Usage : python3 systeme/scripts/verifier.py
Code de sortie 1 s'il y a une erreur ; les avertissements ne bloquent pas.
"""
import os
import re
import subprocess
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IMAGES = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
PLAFONDS = [("AGENTS.md", 150), ("memory/MEMORY.md", 100)]

erreurs, avertissements = [], []


def chemin(*parties):
    return os.path.join(RACINE, *parties)


def lignes_de(rel):
    with open(chemin(rel), encoding="utf-8") as f:
        return f.read().splitlines()


def controler_import(rel, section_autorisee):
    """Le fichier ne contient que @AGENTS.md, plus éventuellement une section autorisée."""
    if not os.path.exists(chemin(rel)):
        return
    for ligne in lignes_de(rel):
        texte = ligne.strip()
        if section_autorisee and texte == section_autorisee:
            return
        if texte and texte != "@AGENTS.md":
            erreurs.append(f"{rel} contient autre chose que l'import de AGENTS.md : « {texte[:60]} »")
            return


def controler_liens():
    cible = os.path.realpath(chemin("skills"))
    for rel in (".claude/skills", ".agents/skills"):
        p = chemin(*rel.split("/"))
        if not os.path.exists(p):
            erreurs.append(f"{rel} manque : lance systeme/scripts/liens.sh")
        elif os.path.realpath(p) != cible:
            erreurs.append(f"{rel} ne pointe pas vers skills/")


def controler_images():
    for base in ("projets", "domaines", "savoir", "bibliotheques", "skills"):
        depart = chemin(base)
        if not os.path.isdir(depart):
            continue
        for dossier, sous, fichiers in os.walk(depart):
            sous[:] = [s for s in sous if not s.startswith(".")]
            images = [f for f in fichiers if f.lower().endswith(IMAGES)]
            if not images:
                continue
            rel = os.path.relpath(dossier, RACINE)
            index = os.path.join(dossier, "_images.md")
            if not os.path.exists(index):
                erreurs.append(f"{rel}/ contient {len(images)} image(s) mais pas de _images.md")
                continue
            with open(index, encoding="utf-8") as f:
                contenu = f.read()
            for image in images:
                if image not in contenu:
                    erreurs.append(f"{rel}/{image} n'a pas sa ligne dans _images.md")


def controler_memoire():
    rel = "memory/MEMORY.md"
    if not os.path.exists(chemin(rel)):
        erreurs.append(f"{rel} manque")
        return
    cites = set()
    for ligne in lignes_de(rel):
        m = re.search(r"→\s*`?([^`\s]+\.md)`?", ligne)
        if m:
            cites.add(m.group(1))
            if not os.path.exists(chemin("memory", m.group(1))):
                erreurs.append(f"{rel} cite {m.group(1)}, qui n'existe pas dans memory/")
    for nom in os.listdir(chemin("memory")):
        if nom.endswith(".md") and nom != "MEMORY.md" and nom not in cites:
            avertissements.append(f"memory/{nom} n'a pas sa ligne dans MEMORY.md")


def controler_plafonds():
    plafonds = list(PLAFONDS)
    if os.path.isdir(chemin("routers")):
        plafonds += [(f"routers/{n}", 50) for n in os.listdir(chemin("routers")) if n.endswith(".md")]
    if os.path.isdir(chemin("skills")):
        for nom in os.listdir(chemin("skills")):
            if os.path.exists(chemin("skills", nom, "SKILL.md")):
                plafonds.append((f"skills/{nom}/SKILL.md", 60))
    for rel, maximum in plafonds:
        if os.path.exists(chemin(rel)):
            n = len(lignes_de(rel))
            if n > maximum:
                avertissements.append(f"{rel} fait {n} lignes (plafond : {maximum})")


def controler_index():
    script = chemin("systeme", "scripts", "index.py")
    resultat = subprocess.run([sys.executable, script, "--check"], capture_output=True, text=True)
    for ligne in resultat.stdout.splitlines():
        avertissements.append(ligne + " : relance systeme/scripts/index.py")


def main():
    controler_import("CLAUDE.md", "## Spécifique Claude")
    controler_import("GEMINI.md", None)
    controler_liens()
    controler_images()
    controler_memoire()
    controler_plafonds()
    controler_index()
    for e in erreurs:
        print(f"ERREUR  {e}")
    for a in avertissements:
        print(f"ALERTE  {a}")
    if not erreurs and not avertissements:
        print("Tout est en ordre.")
    return 1 if erreurs else 0


if __name__ == "__main__":
    sys.exit(main())

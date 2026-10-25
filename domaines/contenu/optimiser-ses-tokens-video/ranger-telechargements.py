#!/usr/bin/env python3
"""Range le dossier Téléchargements : le code choisit la catégorie, Haiku choisit le sous-dossier.

Démo de la vidéo « Optimiser ses tokens » : une tâche simple, lancée hors discussion, sur le plus petit modèle.
Haiku ne lit que les noms des fichiers, jamais leur contenu. Rien n'est supprimé ni écrasé.
Sans --appliquer, le script montre seulement ce qu'il ferait.

  python3 ranger-telechargements.py              montre le plan
  python3 ranger-telechargements.py --appliquer  range
  python3 ranger-telechargements.py --sans-ia    le code seul, zéro token
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime

# Les dossiers de ~/Downloads (voir _LISEZ-MOI-rangement.md) et les extensions qui y vont
CATEGORIES = {
    "01 — Documents": "pdf doc docx pages key ppt pptx xls xlsx numbers odt ods rtf txt ics vcf",
    "02 — Images": "png jpg jpeg gif webp heic svg bmp tif tiff avif ttf otf woff woff2",
    "03 — Vidéos": "mp4 mov m4v avi mkv webm",
    "04 — Audio": "mp3 m4a wav aac flac ogg aiff",
    "05 — Archives": "zip tar gz tgz rar 7z",
    "06 — Installeurs-Apps": "dmg pkg mpkg exe skill",
    "07 — Code-Data": "csv json md html htm py js jsx ts tsx sh sql ipynb yaml yml xml",
}
A_TRIER = "00 — À TRIER"
PAR_EXTENSION = {ext: cat for cat, exts in CATEGORIES.items() for ext in exts.split()}
EN_COURS = (".crdownload", ".download", ".part")
CONSIGNE = ("Pour chaque fichier numéroté, choisis le sous-dossier de sa catégorie qui colle le mieux à son nom, "
            "ou \"\" si aucun ne colle. Réponds uniquement avec un objet JSON : {\"1\": \"sous-dossier\", ...}.")


def categorie(nom):
    ext = nom.rsplit(".", 1)[-1].lower() if "." in nom else ""
    return PAR_EXTENSION.get(ext, A_TRIER)


def sous_dossiers(racine, cat):
    chemin = os.path.join(racine, cat)
    if not os.path.isdir(chemin):
        return []
    return sorted(d for d in os.listdir(chemin) if not d.startswith(".") and os.path.isdir(os.path.join(chemin, d)))


def demander_a_haiku(fichiers, racine):
    """fichiers : liste de (nom, catégorie). Renvoie {nom: sous-dossier} et les chiffres de l'appel."""
    numeros, blocs = {}, []
    for cat in sorted({c for _, c in fichiers}):
        choix = sous_dossiers(racine, cat)
        if not choix:
            continue
        lignes = []
        for nom, c in fichiers:
            if c == cat:
                n = str(len(numeros) + 1)
                numeros[n] = (nom, choix)
                lignes.append(f"{n}. {nom}")
        blocs.append(f"Catégorie « {cat} ». Sous-dossiers : {', '.join(choix)}.\n" + "\n".join(lignes))
    if not numeros:
        return {}, None

    claude = shutil.which("claude") or os.path.expanduser("~/.local/bin/claude")
    commande = [claude, "-p", CONSIGNE + "\n\n" + "\n\n".join(blocs),
                "--model", "haiku", "--output-format", "json",
                "--system-prompt", "Tu ranges des fichiers d'après leur nom. Tu réponds uniquement en JSON.",
                "--tools", "", "--strict-mcp-config", "--no-session-persistence", "--max-budget-usd", "0.10"]
    debut = time.time()
    sortie = subprocess.run(commande, capture_output=True, text=True, timeout=300, cwd=racine)
    if sortie.returncode != 0:
        sys.exit(f"Claude n'a pas répondu : {(sortie.stderr or sortie.stdout).strip()}")
    reponse = json.loads(sortie.stdout)
    trouve = re.search(r"\{.*\}", reponse.get("result", ""), re.S)
    plan = json.loads(trouve.group(0)) if trouve else {}

    # On ne garde que les sous-dossiers qui existent : le reste va à la racine de la catégorie
    resultat = {nom: plan.get(n) for n, (nom, choix) in numeros.items() if plan.get(n) in choix}
    usage = reponse.get("usage", {})
    stats = dict(lus=usage.get("input_tokens", 0) + usage.get("cache_read_input_tokens", 0)
                 + usage.get("cache_creation_input_tokens", 0),
                 ecrits=usage.get("output_tokens", 0), cout=reponse.get("total_cost_usd"),
                 duree=time.time() - debut, demandes=len(numeros))
    return resultat, stats


def main():
    p = argparse.ArgumentParser(description="Range le dossier Téléchargements, avec Haiku pour les sous-dossiers.")
    p.add_argument("--appliquer", action="store_true", help="range pour de vrai (sinon : le plan seulement)")
    p.add_argument("--sans-ia", action="store_true", help="le code seul : chaque fichier va à la racine de sa catégorie")
    p.add_argument("--dossier", default=os.path.expanduser("~/Downloads"))
    a = p.parse_args()
    racine = a.dossier

    fichiers = []
    for nom in sorted(os.listdir(racine)):
        if nom.startswith((".", "_")) or nom.lower().endswith(EN_COURS):
            continue
        if os.path.isfile(os.path.join(racine, nom)):
            fichiers.append((nom, categorie(nom)))
    if not fichiers:
        print("Rien à ranger.")
        return

    sous, stats = ({}, None) if a.sans_ia else demander_a_haiku(fichiers, racine)
    plan = {}
    for nom, cat in fichiers:
        dest = os.path.join(cat, sous[nom]) if sous.get(nom) else cat
        plan.setdefault(dest, []).append(nom)

    for dest in sorted(plan):
        print(f"\n{dest}  ({len(plan[dest])})")
        for nom in plan[dest]:
            print(f"   {nom}")
    print(f"\n{len(fichiers)} fichiers : la catégorie vient du code (zéro token), "
          f"le sous-dossier de Haiku pour {len(sous)} d'entre eux.")
    if stats:
        cout = f"{stats['cout']:.4f} $ estimés au tarif API" if stats["cout"] is not None else "coût non donné"
        print(f"Haiku : {stats['demandes']} noms envoyés, {stats['lus']} tokens lus, {stats['ecrits']} écrits, "
              f"{cout}, {stats['duree']:.0f} s.")

    if not a.appliquer:
        print("\nRien n'a bougé. Pour ranger : ajoute --appliquer.")
        return
    ranges, laisses = 0, []
    with open(os.path.join(racine, ".rangement.log"), "a", encoding="utf-8") as journal:
        quand = datetime.now().strftime("%Y-%m-%d %H:%M")
        for dest, noms in plan.items():
            os.makedirs(os.path.join(racine, dest), exist_ok=True)
            for nom in noms:
                cible = os.path.join(racine, dest, nom)
                if os.path.exists(cible):
                    laisses.append(nom)
                    continue
                os.rename(os.path.join(racine, nom), cible)
                journal.write(f"{quand} | {nom} -> {dest}/{nom}\n")
                ranges += 1
    print(f"\n{ranges} fichiers rangés. Chaque déplacement est noté dans {racine}/.rangement.log.")
    if laisses:
        print(f"{len(laisses)} laissés en place : un fichier du même nom existe déjà à destination.")
        for nom in laisses:
            print(f"   {nom}")


if __name__ == "__main__":
    main()

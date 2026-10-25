"""Rend un gabarit du design system en PNG, avec Chrome sans interface.

Exemples :
  python3 rendre.py miniature titre="Arrête de|gaspiller|*tes tokens*" photo=mains-sur-la-tete -o miniature.png
  python3 rendre.py schema --donnees exemples/schema-cout-message.json mode=papier -o schema.png
  python3 rendre.py bandeau nom="Thomas Richard" -o bandeau.png   (fond transparent)

Les champs de chaque gabarit sont notés en tête de son fichier HTML.
Dans un texte, *mot* passe en mot fort (dégradé) et | va à la ligne.
"""
import argparse
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile
import urllib.parse

ICI = pathlib.Path(__file__).resolve().parent
TAILLES = {
    "miniature": (1280, 720),
    "carton": (1920, 1080),
    "schema": (1920, 1080),
    "post": (1080, 1080),
    "bandeau": (1920, 1080),
}
CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")


def main():
    p = argparse.ArgumentParser(description="Rend un gabarit en PNG.")
    p.add_argument("gabarit", choices=TAILLES)
    p.add_argument("champs", nargs="*", help="cle=valeur (mode, titre, photo…)")
    p.add_argument("--donnees", help="fichier JSON avec les champs (obligatoire pour les listes)")
    p.add_argument("-o", "--sortie", required=True, help="chemin du PNG")
    a = p.parse_intermixed_args()

    d = json.loads(pathlib.Path(a.donnees).read_text(encoding="utf-8")) if a.donnees else {}
    for c in a.champs:
        cle, egal, valeur = c.partition("=")
        if not egal:
            sys.exit(f"champ sans « = » : {c}")
        d[cle] = valeur

    url = (ICI / f"{a.gabarit}.html").as_uri() + "?" + urllib.parse.urlencode(
        {"donnees": json.dumps(d, ensure_ascii=False)})
    largeur, hauteur = TAILLES[a.gabarit]
    sortie = pathlib.Path(a.sortie).resolve()
    sortie.parent.mkdir(parents=True, exist_ok=True)

    profil = tempfile.mkdtemp(prefix="gabarit-chrome-")
    cmd = [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
           f"--user-data-dir={profil}", f"--window-size={largeur},{hauteur}",
           "--force-device-scale-factor=1", "--virtual-time-budget=8000",
           f"--screenshot={sortie}", url]
    if a.gabarit == "bandeau":
        cmd.insert(1, "--default-background-color=00000000")
    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=90)
    finally:
        shutil.rmtree(profil, ignore_errors=True)
    print(sortie)


if __name__ == "__main__":
    main()

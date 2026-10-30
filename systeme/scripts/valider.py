#!/usr/bin/env python3
"""Valide seul ce qui attend dans l'Outbox depuis trop longtemps : chaque fichier en statut a-valider dont la
dernière retouche (champ maj, sinon cree) a plus de N jours (3 par défaut) prend le statut de fin de son type
(clos, d'après systeme/metadonnees.md), et maj prend la date du jour. Le fichier ne bouge pas.

Une ligne dans journal/log.md dit ce qui a été validé ; le point du jour la reprend. Sans IA : c'est une routine
directe (systeme/routines.md).

  python3 systeme/scripts/valider.py            valide ce qui attend depuis plus de 3 jours
  python3 systeme/scripts/valider.py --jours 7  depuis plus de 7 jours
  python3 systeme/scripts/valider.py --essai    dit ce qu'il validerait, sans rien écrire
"""
import argparse
import datetime
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index import RACINE, lire_entete, types_regles  # noqa: E402

# ce que l'Outbox ne montre pas : le socle, les archives, l'interface (le même choix que interface/server.js)
HORS = ("archives/", "systeme/", "skills/", "interface/")
SAUTES = {"node_modules", "__pycache__", "venv", "os-runs"}


def en_attente():
    """Les fichiers en a-valider : (chemin relatif, en-tête)."""
    for dossier, sous, fichiers in os.walk(RACINE):
        sous[:] = sorted(s for s in sous if not s.startswith(".") and s not in SAUTES)
        for nom in sorted(fichiers):
            if not nom.endswith(".md") or nom == "_index.md":
                continue
            rel = os.path.relpath(os.path.join(dossier, nom), RACINE).replace(os.sep, "/")
            if rel.startswith(HORS):
                continue
            e = lire_entete(os.path.join(RACINE, rel))
            if e.get("statut") == "a-valider":
                yield rel, e


def date_de(e):
    for champ in ("maj", "cree"):
        try:
            return datetime.date.fromisoformat(e.get(champ, ""))
        except ValueError:
            continue
    return None


def fin_de(type_, regles):
    """Le premier statut de fin du type, d'après systeme/metadonnees.md ; clos s'il n'en dit rien."""
    fins = regles.get(type_, ([], []))[1]
    return fins[0] if fins else "clos"


def poser(chemin, champs):
    """Réécrit ces champs dans l'en-tête, ajoute ceux qui manquent, et ne touche à rien d'autre."""
    with open(chemin, encoding="utf-8", newline="") as f:
        lignes = f.read().split("\n")
    fin = 1
    while fin < len(lignes) and lignes[fin].strip() != "---":
        fin += 1
    for cle, valeur in champs.items():
        for i in range(1, fin):
            if lignes[i].startswith(cle + ":"):
                lignes[i] = f"{cle}: {valeur}" + ("\r" if lignes[i].endswith("\r") else "")
                break
        else:
            lignes.insert(fin, f"{cle}: {valeur}" + ("\r" if lignes[0].endswith("\r") else ""))
            fin += 1
    temporaire = chemin + ".tmp"
    with open(temporaire, "w", encoding="utf-8", newline="") as f:
        f.write("\n".join(lignes))
    os.replace(temporaire, chemin)


def main():
    p = argparse.ArgumentParser(description="Valide seul ce qui attend dans l'Outbox depuis plus de N jours.")
    p.add_argument("--jours", type=int, default=3)
    p.add_argument("--essai", action="store_true")
    a = p.parse_args()
    aujourdhui = datetime.date.today()
    regles = types_regles()
    faits = []
    for rel, e in en_attente():
        d = date_de(e)
        if d is None or (aujourdhui - d).days <= a.jours:
            continue
        if not a.essai:
            poser(os.path.join(RACINE, rel), {"statut": fin_de(e.get("type", ""), regles), "maj": aujourdhui.isoformat()})
        faits.append(rel)
    if not faits:
        print(f"Rien n'attend depuis plus de {a.jours} jours.")
        return 0
    print(("Validerait" if a.essai else "Validé") + f" ({len(faits)}) :")
    for rel in faits:
        print("  " + rel)
    if not a.essai:
        journal = os.path.join(RACINE, "journal", "log.md")
        os.makedirs(os.path.dirname(journal), exist_ok=True)
        noms = ", ".join(os.path.basename(r)[:-3] for r in faits[:5]) + (f" et {len(faits) - 5} autres" if len(faits) > 5 else "")
        coupe = os.path.exists(journal) and os.path.getsize(journal) > 0 and not open(journal, "rb").read().endswith(b"\n")
        with open(journal, "a", encoding="utf-8") as f:
            f.write(("\n" if coupe else "") + f"- {aujourdhui.isoformat()} · routine valider | {len(faits)} fichier{'s' if len(faits) > 1 else ''} "
                    f"validé{'s' if len(faits) > 1 else ''} seul{'s' if len(faits) > 1 else ''} après {a.jours} jours : {noms}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())

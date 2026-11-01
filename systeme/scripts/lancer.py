#!/usr/bin/env python3
"""Lance une skill sans discussion, avec l'agent choisi dans .env et le modèle de systeme/modeles.md.
Lance aussi une routine directe de systeme/routines.md : sa commande, sans IA.

Usage : python3 systeme/scripts/lancer.py <skill ou routine> [--modele NOM] [--agent claude|codex|gemini] [--essai]
  <routine> : son nom en minuscules, sans accents, avec des tirets (« Fiches YouTube » → fiches-youtube).
  --essai : affiche la commande sans la lancer.

Chaque passage laisse une ligne dans journal/routines.jsonl : ce qui a été lancé, le début, la fin, le code de sortie,
l'agent, le modèle, les dernières lignes de la sortie et, pour claude, les tokens et le coût au tarif de l'API.
L'onglet Routines de l'interface le lit.
"""
import argparse
import collections
import datetime
import json
import os
import re
import shlex
import subprocess
import sys
import unicodedata

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMMANDES = {"claude": "claude -p", "codex": "codex exec", "gemini": "gemini -p"}
JOURNAL = os.path.join(RACINE, "journal", "routines.jsonl")


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


def cle_de(nom):
    """Le nom d'une routine en minuscules, sans accents, avec des tirets : « Essai raté » → essai-rate."""
    texte = unicodedata.normalize("NFD", nom).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", texte).strip("-")


def routine_directe(nom):
    """La commande d'une routine directe de systeme/routines.md, ou None."""
    from index import tableau
    for r in tableau(os.path.join(RACINE, "systeme", "routines.md"), "Routine"):
        commande = r.get("Commande", "").strip("`")
        if commande not in ("", "—", "-") and cle_de(r["Routine"]) == nom:
            return commande
    return None


def en_pause(nom):
    """Vrai quand la ligne de cette routine dans systeme/routines.md dit « en pause » (par sa skill ou par son nom)."""
    from index import tableau
    for r in tableau(os.path.join(RACINE, "systeme", "routines.md"), "Routine"):
        if nom in (r.get("Skill", "").strip("`"), cle_de(r["Routine"])):
            return r.get("État", "").strip() == "en pause"
    return False


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


def maintenant():
    return datetime.datetime.now().astimezone().isoformat(timespec="seconds")


def executer(commande, shell=False, json_claude=False):
    """Lance la commande, montre sa sortie au fil de l'eau et en garde la fin ; avec claude en JSON, sa mesure."""
    p = subprocess.Popen(commande, shell=shell, cwd=RACINE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    lignes = collections.deque(maxlen=400 if json_claude else 40)
    for ligne in p.stdout:
        if not json_claude:
            sys.stdout.write(ligne)
        lignes.append(ligne.rstrip("\n"))
    code = p.wait()
    mesure = {}
    if json_claude:
        texte = "\n".join(lignes)
        try:
            r = json.loads(texte[texte.index("{"):])
            u = r.get("usage") or {}
            mesure = {"tokens": sum(int(u.get(k) or 0) for k in ("input_tokens", "output_tokens", "cache_read_input_tokens", "cache_creation_input_tokens")),
                      "cout": round(float(r.get("total_cost_usd") or 0), 4)}
            texte = str(r.get("result") or "")
        except (ValueError, TypeError):
            pass
        print(texte)
        lignes = collections.deque(texte.splitlines(), maxlen=40)
    return code, [l for l in lignes if l.strip()][-12:], mesure


def noter(cle, debut, code, sortie, **plus):
    """Une ligne de plus dans journal/routines.jsonl ; un journal qui ne s'écrit pas n'arrête pas la routine."""
    ligne = {"cle": cle, "debut": debut, "fin": maintenant(), "code": code, **{k: v for k, v in plus.items() if v not in (None, "")}, "sortie": sortie}
    try:
        os.makedirs(os.path.dirname(JOURNAL), exist_ok=True)
        with open(JOURNAL, "a", encoding="utf-8") as f:
            f.write(json.dumps(ligne, ensure_ascii=False) + "\n")
    except OSError as e:
        print(f"journal/routines.jsonl ne s'écrit pas : {e}", file=sys.stderr)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("skill")
    p.add_argument("--modele")
    p.add_argument("--agent")
    p.add_argument("--essai", action="store_true")
    a = p.parse_args()

    if en_pause(a.skill) and not a.essai:
        print(f"{a.skill} est en pause dans systeme/routines.md : rien n'est lancé.")
        return 0
    directe = routine_directe(a.skill)
    if directe:
        if a.essai:
            print(directe)
            return 0
        debut = maintenant()
        code, sortie, _ = executer(directe, shell=True)
        noter(a.skill, debut, code, sortie, directe=True)
        return code

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

    # claude dit ses tokens et son coût quand on lui demande du JSON : la mesure va dans le journal
    json_claude = agent == "claude" and "--output-format" not in commande
    if json_claude:
        commande[-1:-1] = ["--output-format", "json"]
    if a.essai:
        print(shlex.join(commande))
        return 0
    debut = maintenant()
    code, sortie, mesure = executer(commande, json_claude=json_claude)
    noter(a.skill, debut, code, sortie, skill=a.skill, agent=agent, modele=modele, **mesure)
    return code


if __name__ == "__main__":
    sys.exit(main())

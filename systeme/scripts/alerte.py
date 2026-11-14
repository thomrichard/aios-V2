#!/usr/bin/env python3
"""Signale les routines « en place » qui ont échoué ou qui n'ont pas tourné à l'heure. Sans IA.

Usage : python3 systeme/scripts/alerte.py [--essai] [--sans-notification] [--attente SECONDES] [--agents DOSSIER]

Lit systeme/routines.md (état, cron) et journal/routines.jsonl (ce que lancer.py y note à chaque passage).
Deux cas, et rien d'autre :
  - échec : le dernier passage de la routine sort avec un code différent de 0 ;
  - absence : le cron prévoyait un passage (il y a plus de 30 minutes) et le journal n'en montre aucun depuis.
Une routine en cours de passage (un process « lancer.py <routine> ») n'est jamais signalée.
Sur Mac, une routine sans fichier ~/Library/LaunchAgents/com.sm4rt.<routine>.plist n'est pas jugée sur l'absence :
le planificateur ne la lance pas (par exemple une tâche de l'app Claude), le journal ne peut donc pas la contredire.
Une routine qui n'a jamais laissé de passage dans le journal n'est pas jugée non plus.

Quand il y a quelque chose à dire : une notification macOS et une ligne dans journal/log.md
(« - AAAA-MM-JJ · routine alerte-des-routines | <résumé> »), que le point du jour reprend, et le résumé sur la sortie.
Quand tout va bien : rien, ni écran, ni notification, ni ligne.
Un même problème n'est signalé qu'une fois, puis de nouveau après 3 jours s'il dure (journal/alertes-routines.json).
Code de sortie : 0, même avec une alerte (la routine a fait son travail) ; 1 si le script lui-même plante.
"""
import argparse
import datetime
import json
import os
import re
import subprocess
import sys
import time

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index import tableau  # noqa: E402
from lancer import cle_de  # noqa: E402

JOURNAL = os.path.join(RACINE, "journal", "routines.jsonl")
LOG = os.path.join(RACINE, "journal", "log.md")
VUES = os.path.join(RACINE, "journal", "alertes-routines.json")
NOM = "alerte-des-routines"
TOLERANCE = datetime.timedelta(minutes=30)   # un passage prévu depuis moins longtemps n'est pas encore « manqué »
MARGE = datetime.timedelta(minutes=10)       # un passage qui démarre un peu avant l'heure prévue compte quand même
RAPPEL = datetime.timedelta(days=3)          # un problème qui dure est signalé de nouveau après ce délai


def champ_cron(texte, mini, maxi):
    """Un champ de cron (« * », « */5 », « 1-5 », « 0,4 », « 1-10/2 ») en ensemble d'entiers ; None s'il ne se lit pas."""
    valeurs = set()
    for morceau in texte.split(","):
        base, _, pas = morceau.partition("/")
        try:
            pas = int(pas) if pas else 1
            if base == "*":
                debut, fin = mini, maxi
            elif "-" in base:
                debut, fin = (int(x) for x in base.split("-", 1))
            else:
                debut = fin = int(base)
        except ValueError:
            return None
        if pas < 1 or debut < mini or fin > maxi or debut > fin:
            return None
        valeurs.update(range(debut, fin + 1, pas))
    return valeurs


def derniere_echeance(cron, avant):
    """Le dernier passage prévu par ce cron (cinq champs) avant l'instant donné (aware), ou None."""
    champs = cron.split()
    if len(champs) != 5:
        return None
    minutes, heures = champ_cron(champs[0], 0, 59), champ_cron(champs[1], 0, 23)
    jours, mois = champ_cron(champs[2], 1, 31), champ_cron(champs[3], 1, 12)
    semaine = champ_cron(champs[4], 0, 7)
    if None in (minutes, heures, jours, mois, semaine):
        return None
    semaine = {s % 7 for s in semaine}
    tout_jour, toute_semaine = champs[2].startswith("*"), champs[4].startswith("*")

    def jour_ok(d):
        if d.month not in mois:
            return False
        du_mois, de_semaine = d.day in jours, (d.isoweekday() % 7) in semaine
        if tout_jour and toute_semaine:
            return True
        if tout_jour:
            return de_semaine
        if toute_semaine:
            return du_mois
        return du_mois or de_semaine

    for recul in range(0, 400):
        d = avant.date() - datetime.timedelta(days=recul)
        if not jour_ok(d):
            continue
        for h in sorted(heures, reverse=True):
            for m in sorted(minutes, reverse=True):
                t = datetime.datetime(d.year, d.month, d.day, h, m).astimezone()
                if t <= avant:
                    return t
    return None


def lire_passages():
    """{cle: [(début, code, sortie), ...]} depuis journal/routines.jsonl ; une ligne illisible est ignorée."""
    passages = {}
    try:
        with open(JOURNAL, encoding="utf-8") as f:
            for ligne in f:
                try:
                    p = json.loads(ligne)
                    debut = datetime.datetime.fromisoformat(p["debut"]).astimezone()
                    passages.setdefault(p["cle"], []).append((debut, int(p["code"]), p.get("sortie") or []))
                except (ValueError, KeyError, TypeError):
                    continue
    except OSError:
        pass
    return passages


def en_cours():
    """Les noms donnés à lancer.py par les passages qui tournent en ce moment."""
    try:
        r = subprocess.run(["ps", "-axo", "command"], capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.SubprocessError):
        return set()
    return set(re.findall(r"^\S*[Pp]ython[\d.]*\s+(?:-\S+\s+)*\S*lancer\.py\s+([a-z0-9-]+)", r.stdout, re.M))


def jour_heure(t):
    return t.strftime("%d/%m à %Hh%M")


def examiner(routines, passages, agents, maintenant):
    """Les problèmes : [(identifiant, texte)], l'identifiant servant à ne les signaler qu'une fois."""
    lances = en_cours()
    launchd = os.path.isdir(agents) and any(n.startswith("com.sm4rt.") for n in os.listdir(agents))
    problemes = []
    for r in routines:
        if r.get("État", "").strip() != "en place":
            continue
        nom, skill = r["Routine"], r.get("Skill", "").strip("`").strip("—-")
        cles = {c for c in (skill, cle_de(nom)) if c}
        if cles & lances:
            continue
        vus = sorted(p for c in cles for p in passages.get(c, []))
        if vus and vus[-1][1] != 0:
            debut, code, sortie = vus[-1]
            fin = next((l for l in reversed(sortie) if l.strip()), "")
            problemes.append((f"{cle_de(nom)}|echec|{debut.isoformat()}",
                              f"{nom} a échoué le {jour_heure(debut)} (code {code})" + (f" : {fin[:90]}" if fin else "")))
            continue
        cron = r.get("Cron", "").strip("`")
        if not vus or cron in ("", "—", "-"):
            continue
        borne = None
        if launchd:
            plist = os.path.join(agents, f"com.sm4rt.{cle_de(nom)}.plist")
            if not os.path.exists(plist):
                continue
            borne = datetime.datetime.fromtimestamp(os.path.getmtime(plist)).astimezone()
        prevu = derniere_echeance(cron, maintenant - TOLERANCE)
        if not prevu or (borne and prevu < borne) or maintenant - prevu > datetime.timedelta(days=40):
            continue
        if not any(debut >= prevu - MARGE for debut, _, _ in vus):
            problemes.append((f"{cle_de(nom)}|absence|{prevu.isoformat()}",
                              f"{nom} n'a pas tourné : attendue le {jour_heure(prevu)}, rien dans le journal depuis le {jour_heure(vus[-1][0])}"))
    return problemes


def a_signaler(problemes, maintenant):
    """Ce qui n'a pas déjà été signalé il y a moins de 3 jours ; l'état est mis à jour par l'appelant."""
    try:
        with open(VUES, encoding="utf-8") as f:
            vues = json.load(f)
    except (OSError, ValueError):
        vues = {}
    neuf = []
    for ident, texte in problemes:
        try:
            deja = datetime.datetime.fromisoformat(vues[ident])
        except (KeyError, ValueError):
            deja = None
        if deja is None or maintenant - deja >= RAPPEL:
            neuf.append((ident, texte))
    return neuf, vues


def notifier(titre, message):
    if sys.platform != "darwin":
        return
    esc = lambda s: s.replace("\\", "\\\\").replace('"', '\\"')
    subprocess.run(["osascript", "-e", f'display notification "{esc(message)}" with title "{esc(titre)}" sound name "Glass"'],
                   check=False, timeout=20)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--essai", action="store_true", help="affiche ce qui serait signalé, sans notification ni écriture")
    p.add_argument("--sans-notification", action="store_true")
    p.add_argument("--attente", type=int, default=60, help="secondes d'attente avant de confirmer une absence (au réveil, le planificateur rattrape les routines manquées)")
    p.add_argument("--agents", default=os.path.expanduser("~/Library/LaunchAgents"))
    a = p.parse_args()

    routines = tableau(os.path.join(RACINE, "systeme", "routines.md"), "Routine")
    maintenant = datetime.datetime.now().astimezone()
    problemes = examiner(routines, lire_passages(), a.agents, maintenant)
    if any("|absence|" in ident for ident, _ in problemes) and a.attente > 0:
        time.sleep(a.attente)  # un Mac qui se réveille lance d'un coup ses routines manquées : on leur laisse le temps de démarrer
        maintenant = datetime.datetime.now().astimezone()
        problemes = examiner(routines, lire_passages(), a.agents, maintenant)

    neuf, vues = a_signaler(problemes, maintenant)
    if not neuf:
        return 0
    resume = " ; ".join(t for _, t in neuf)
    print(resume)
    if a.essai:
        return 0
    if not a.sans_notification:
        court = " ; ".join(t.split(" a échoué")[0].split(" n'a pas tourné")[0] for _, t in neuf)
        notifier("AIOS : routine en alerte" if len(neuf) == 1 else f"AIOS : {len(neuf)} routines en alerte",
                 (resume if len(neuf) == 1 else court)[:200])
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"- {datetime.date.today()} · routine {NOM} | {resume}\n")
    for ident, _ in neuf:
        vues[ident] = maintenant.isoformat(timespec="seconds")
    limite = maintenant - datetime.timedelta(days=30)
    vues = {k: v for k, v in vues.items() if datetime.datetime.fromisoformat(v) >= limite}
    with open(VUES, "w", encoding="utf-8") as f:
        json.dump(vues, f, ensure_ascii=False, indent=1)
        f.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Met en place les routines de systeme/routines.md : chacune part à l'heure de sa colonne Cron, par
systeme/scripts/lancer.py, sans que tu aies une discussion ouverte.

Usage : python3 systeme/scripts/routines.py installer <routine>... | --toutes
        python3 systeme/scripts/routines.py retirer <routine>... | --toutes
        python3 systeme/scripts/routines.py etat
  <routine> : ce que lance lancer.py, sa skill (rangement) ou son nom en minuscules avec des tirets
              (« Validation de nuit » → validation-de-nuit). `etat` les liste.
  --toutes  : toutes les routines du tableau, sauf celles « en pause » ou « à la demande ».
  --essai   : affiche ce qui serait écrit, sans rien faire.
  --prefixe : le début du nom des tâches (com.sm4rt par défaut), pour deux AIOS sur la même machine.

macOS : une tâche launchd par routine, ~/Library/LaunchAgents/<prefixe>.<routine>.plist ; son journal dans
~/Library/Logs/sm4rt-<routine>.log. Un Mac qui dort lance la routine à son réveil.
Linux : une ligne par routine dans ta crontab, repérée par « # <prefixe>.<routine> ».
Windows : pas encore ; le Planificateur de tâches peut lancer la même commande.
L'état de la routine passe à « en place » (installer) ou « à construire » (retirer) dans systeme/routines.md.
"""
import os
import platform
import plistlib
import re
import shlex
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index import tableau  # noqa: E402
from lancer import cle_de  # noqa: E402

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TABLEAU = os.path.join(RACINE, "systeme", "routines.md")
LANCER = os.path.join(RACINE, "systeme", "scripts", "lancer.py")
HORS = ("en pause", "à la demande")


def routines():
    """Les routines du tableau : {id, nom, skill, commande, cron, etat}."""
    out = []
    for r in tableau(TABLEAU, "Routine"):
        skill = r.get("Skill", "").strip("` ")
        skill = "" if skill in ("—", "-") else skill
        commande = r.get("Commande", "").strip("` ")
        commande = "" if commande in ("—", "-") else commande
        out.append({"id": skill or cle_de(r["Routine"]), "nom": r["Routine"], "skill": skill, "commande": commande,
                    "cron": r.get("Cron", "").strip("` "), "etat": r.get("État", "").strip()})
    return out


def champ(texte, mini, maxi):
    """Un champ de cron : None pour « * », sinon la liste de ses valeurs (nombres et listes, sans pas ni plages)."""
    if texte == "*":
        return None
    valeurs = []
    for morceau in texte.split(","):
        if not re.fullmatch(r"\d+", morceau) or not mini <= int(morceau) <= maxi:
            raise ValueError(f"« {texte} » : seuls les nombres et les listes (1,4) sont pris en charge")
        valeurs.append(int(morceau))
    return valeurs


def calendrier(cron):
    """Le cron en StartCalendarInterval de launchd : une liste d'horaires."""
    parts = cron.split()
    if len(parts) != 5:
        raise ValueError(f"cron « {cron} » : il faut cinq champs")
    noms = [("Minute", 0, 59), ("Hour", 0, 23), ("Day", 1, 31), ("Month", 1, 12), ("Weekday", 0, 7)]
    horaires = [{}]
    for texte, (nom, mini, maxi) in zip(parts, noms):
        valeurs = champ(texte, mini, maxi)
        if valeurs is not None:
            horaires = [dict(h, **{nom: v}) for h in horaires for v in valeurs]
    return horaires


def verifier(r):
    """Ce qui empêche une routine de tourner, ou None."""
    if not r["cron"]:
        return "pas d'horaire dans la colonne Cron"
    if r["skill"] and not os.path.exists(os.path.join(RACINE, "skills", r["skill"], "SKILL.md")):
        return f"la skill {r['skill']} n'existe pas dans skills/"
    if not r["skill"] and not r["commande"]:
        return "ni skill ni commande"
    if re.search(r"\bpush\b.*\bprive\b", r["commande"]):
        git = subprocess.run(["git", "-C", RACINE, "remote", "get-url", "prive"], capture_output=True)
        if git.returncode:
            return "pas de dépôt privé (distant `prive`) : ajoute-le d'abord, avec `git remote add prive <adresse>`"
    return None


def changer_etat(nom, etat):
    """Réécrit la case État de cette routine dans systeme/routines.md."""
    with open(TABLEAU, encoding="utf-8") as f:
        lignes = f.read().split("\n")
    entetes = None
    for i, ligne in enumerate(lignes):
        if not ligne.startswith("|"):
            if entetes:
                break
            continue
        cases = ligne.strip().strip("|").split("|")
        if entetes is None:
            if cases[0].strip() == "Routine":
                entetes = [c.strip() for c in cases]
            continue
        if cases[0].strip() == nom and "État" in entetes:
            cases[entetes.index("État")] = f" {etat} "
            lignes[i] = "|" + "|".join(cases) + "|"
            break
    with open(TABLEAU, "w", encoding="utf-8") as f:
        f.write("\n".join(lignes))


# ---------------------------- macOS ----------------------------

def plist(prefixe, r):
    return os.path.expanduser(f"~/Library/LaunchAgents/{prefixe}.{r['id']}.plist")


def autre_aios_mac(prefixe, r):
    """Le dossier de l'autre AIOS à qui appartient déjà cette tâche, ou None."""
    try:
        with open(plist(prefixe, r), "rb") as f:
            dossier = plistlib.load(f).get("WorkingDirectory", "")
    except (OSError, plistlib.InvalidFileException):
        return None
    return dossier if dossier and os.path.realpath(dossier) != os.path.realpath(RACINE) else None


def installer_mac(prefixe, r, essai):
    chemin = plist(prefixe, r)
    autre = autre_aios_mac(prefixe, r)
    if autre:
        raise ValueError(f"la tâche {prefixe}.{r['id']} appartient déjà à un autre AIOS ({autre}) : "
                         f"choisis un autre début de nom avec --prefixe")
    journal = os.path.expanduser(f"~/Library/Logs/{'sm4rt-' if prefixe == 'com.sm4rt' else prefixe + '.'}{r['id']}.log")
    contenu = plistlib.dumps({
        "Label": f"{prefixe}.{r['id']}",
        "ProgramArguments": [sys.executable, LANCER, r["id"]],
        "WorkingDirectory": RACINE,
        "StartCalendarInterval": calendrier(r["cron"]),
        "StandardOutPath": journal,
        "StandardErrorPath": journal,
        # launchd part avec un PATH minimal : on garde le tien, pour que lancer.py trouve claude, git et node.
        "EnvironmentVariables": {"PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin")},
    })
    if essai:
        print(f"Écrirait {chemin} :\n{contenu.decode()}")
        return
    domaine = f"gui/{os.getuid()}"
    subprocess.run(["launchctl", "bootout", domaine, chemin], capture_output=True)
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "wb") as f:
        f.write(contenu)
    subprocess.run(["launchctl", "bootstrap", domaine, chemin], check=True)


def retirer_mac(prefixe, r, essai):
    chemin = plist(prefixe, r)
    autre = autre_aios_mac(prefixe, r)
    if autre:
        raise ValueError(f"la tâche {prefixe}.{r['id']} appartient à un autre AIOS ({autre}) : je n'y touche pas")
    if essai:
        print(f"Retirerait {chemin}")
        return
    subprocess.run(["launchctl", "bootout", f"gui/{os.getuid()}", chemin], capture_output=True)
    if os.path.exists(chemin):
        os.remove(chemin)


def en_place_mac(prefixe, r):
    if not os.path.exists(plist(prefixe, r)):
        return "absente"
    autre = autre_aios_mac(prefixe, r)
    if autre:
        return f"prise par un autre AIOS ({autre})"
    charge = subprocess.run(["launchctl", "print", f"gui/{os.getuid()}/{prefixe}.{r['id']}"], capture_output=True)
    return "en place" if charge.returncode == 0 else "fichier présent, mais pas chargée (relance installer)"


# ---------------------------- Linux ----------------------------

def crontab():
    lu = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
    return lu.stdout.splitlines() if lu.returncode == 0 else []


def ecrire_crontab(lignes):
    subprocess.run(["crontab", "-"], input="\n".join(lignes) + "\n", text=True, check=True)


def ligne_cron(prefixe, r):
    journal = os.path.expanduser(f"~/.local/state/sm4rt/{'' if prefixe == 'com.sm4rt' else prefixe + '.'}{r['id']}.log")
    commande = (f"cd {shlex.quote(RACINE)} && PATH={shlex.quote(os.environ.get('PATH', '/usr/bin:/bin'))} "
                f"{shlex.quote(sys.executable)} {shlex.quote(LANCER)} {r['id']} >> {shlex.quote(journal)} 2>&1")
    return f"{r['cron']} {commande} # {prefixe}.{r['id']}"


def autre_aios_linux(prefixe, r):
    marque = f"# {prefixe}.{r['id']}"
    for l in crontab():
        if l.endswith(marque) and f"cd {shlex.quote(RACINE)} " not in l:
            return l
    return None


def installer_linux(prefixe, r, essai):
    calendrier(r["cron"])  # même contrôle que sur Mac
    marque = f"# {prefixe}.{r['id']}"
    if autre_aios_linux(prefixe, r):
        raise ValueError(f"la ligne {marque} de ta crontab appartient à un autre AIOS : choisis un autre début de nom avec --prefixe")
    nouvelle = ligne_cron(prefixe, r)
    if essai:
        print(f"Ajouterait à ta crontab :\n{nouvelle}")
        return
    os.makedirs(os.path.expanduser("~/.local/state/sm4rt"), exist_ok=True)
    ecrire_crontab([l for l in crontab() if not l.endswith(marque)] + [nouvelle])


def retirer_linux(prefixe, r, essai):
    marque = f"# {prefixe}.{r['id']}"
    if autre_aios_linux(prefixe, r):
        raise ValueError(f"la ligne {marque} de ta crontab appartient à un autre AIOS : je n'y touche pas")
    if essai:
        print(f"Retirerait de ta crontab la ligne {marque}")
        return
    ecrire_crontab([l for l in crontab() if not l.endswith(marque)])


def en_place_linux(prefixe, r):
    if autre_aios_linux(prefixe, r):
        return "prise par un autre AIOS"
    return "en place" if any(l.endswith(f"# {prefixe}.{r['id']}") for l in crontab()) else "absente"


# ---------------------------- commandes ----------------------------

def systeme():
    nom = platform.system()
    if nom not in ("Darwin", "Linux"):
        sys.exit("Windows n'est pas encore pris en charge : dans le Planificateur de tâches, crée une tâche par routine, "
                 f"à l'heure de sa colonne Cron, qui lance : python \"{LANCER}\" <routine>")
    return nom


def choisir(noms, toutes):
    tout = routines()
    if toutes:
        return [r for r in tout if r["etat"] not in HORS]
    choix, ids = [], {r["id"]: r for r in tout}
    for nom in noms:
        r = ids.get(nom) or next((x for x in tout if cle_de(x["nom"]) == nom), None)
        if not r:
            sys.exit(f"Routine inconnue : {nom}. Celles du tableau : {', '.join(ids)}")
        choix.append(r)
    if not choix:
        sys.exit("Dis quelle routine (ou --toutes). La liste : python3 systeme/scripts/routines.py etat")
    return choix


def etat(prefixe):
    mac = systeme() == "Darwin"
    print("Routines de systeme/routines.md :")
    for r in routines():
        ici = (en_place_mac if mac else en_place_linux)(prefixe, r)
        print(f"  {r['id']:<22} {r['cron']:<16} tableau : {r['etat']:<13} machine : {ici}")
    return 0


def main():
    args = sys.argv[1:]
    essai = "--essai" in args
    toutes = "--toutes" in args
    prefixe = "com.sm4rt"
    if "--prefixe" in args:
        i = args.index("--prefixe")
        prefixe = args[i + 1] if i + 1 < len(args) else prefixe
        del args[i:i + 2]
    if not re.fullmatch(r"[A-Za-z0-9.-]+", prefixe):
        sys.exit("--prefixe : lettres, chiffres, points et tirets seulement")
    noms = [a for a in args[1:] if not a.startswith("--")]
    action = args[0] if args else ""
    if action == "etat":
        return etat(prefixe)
    if action not in ("installer", "retirer"):
        print(__doc__)
        return 1
    mac = systeme() == "Darwin"
    code = 0
    for r in choisir(noms, toutes):
        if action == "installer":
            souci = verifier(r)
            if souci:
                print(f"{r['nom']} : pas installée, {souci}.")
                code = 1
                continue
            try:
                (installer_mac if mac else installer_linux)(prefixe, r, essai)
            except (ValueError, subprocess.CalledProcessError) as e:
                print(f"{r['nom']} : pas installée, {e}.")
                code = 1
                continue
            if not essai:
                changer_etat(r["nom"], "en place")
                print(f"{r['nom']} : en place ({r['cron']}).")
        else:
            try:
                (retirer_mac if mac else retirer_linux)(prefixe, r, essai)
            except ValueError as e:
                print(f"{r['nom']} : pas retirée, {e}.")
                code = 1
                continue
            if not essai:
                changer_etat(r["nom"], "à construire")
                print(f"{r['nom']} : retirée.")
    return code


if __name__ == "__main__":
    sys.exit(main())

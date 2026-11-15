#!/usr/bin/env python3
"""Rejoue, dans une copie jetable du workspace, les pannes déjà rencontrées. À lancer avant de proposer un changement
au socle, ou après une mise à jour.

Usage : python3 systeme/scripts/essais.py [--garder]

Rien n'est touché dans le workspace : ses fichiers (suivis par Git, ou nouveaux et pas ignorés) sont copiés dans un
dossier temporaire, avec un faux dépôt privé à côté. Les essais y lancent les vrais scripts et la vraie commande de
la sauvegarde de nuit, lue dans systeme/routines.md.
  --garder : laisse le dossier temporaire en place, et donne son chemin, pour regarder ce qui s'est passé.
Code de sortie : 0 si tout passe, 1 si un essai échoue.
"""
import datetime
import json
import os
import shutil
import subprocess
import sys
import tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROUTINES = os.path.join("systeme", "routines.md")
ESSAI_ECHEC = "| Essai échec | — | `python3 -c \"raise SystemExit(1)\" && echo jamais` | à la demande | — | directe, passive : essai | sans IA | en place |"
ESSAI_MESURE = ("| Essai mesure | — | `python3 -c \"import os,json;json.dump({'skill':'essai','agent':'a','modele':'m'},"
                "open(os.environ['LANCER_MESURE'],'w'))\"` | à la demande | — | directe, passive : essai | sans IA | en place |")

resultats = []


def lancer(commande, dossier, **plus):
    r = subprocess.run(commande, cwd=dossier, capture_output=True, text=True, timeout=300, **plus)
    return r.returncode, (r.stdout + r.stderr).strip()


def git(dossier, *args):
    return lancer(["git", *args], dossier)


def script(copie, nom, *args):
    return lancer([sys.executable, os.path.join("systeme", "scripts", nom), *args], copie)


def essai(nom, reussi, detail=""):
    resultats.append(reussi)
    print(("ok     " if reussi else "ÉCHEC  ") + nom + ("" if reussi or not detail else f" : {detail[-300:]}"))


def copier(base):
    """La copie du workspace, devenue un dépôt Git à elle, et son faux dépôt privé."""
    copie, prive = os.path.join(base, "workspace"), os.path.join(base, "prive.git")
    code, sortie = git(RACINE, "ls-files", "-co", "--exclude-standard", "-z")
    if code != 0:
        sys.exit("Ce dossier n'est pas un dépôt Git : les essais ont besoin de Git.")
    for rel in filter(None, sortie.split("\0")):
        source, cible = os.path.join(RACINE, rel), os.path.join(copie, rel)
        if not os.path.lexists(source):
            continue
        os.makedirs(os.path.dirname(cible), exist_ok=True)
        if os.path.islink(source):
            os.symlink(os.readlink(source), cible)
        elif os.path.isfile(source):
            shutil.copy2(source, cible)
    # un journal vierge : les essais ne dépendent pas de ce que les routines du workspace ont déjà fait
    for nom in ("routines.jsonl", "alertes.json", "alertes-routines.json"):
        try:
            os.remove(os.path.join(copie, "journal", nom))
        except OSError:
            pass
    git(base, "init", "-q", "--bare", prive)
    git(copie, "init", "-q", "-b", "main")
    for cle, valeur in (("user.name", "Essai"), ("user.email", "essai@example.invalid"), ("commit.gpgsign", "false")):
        git(copie, "config", cle, valeur)
    git(copie, "remote", "add", "prive", prive)
    git(copie, "add", "-A")
    git(copie, "commit", "-q", "--no-verify", "-m", "Départ")
    git(copie, "push", "-q", "prive", "main")
    # comme après l'installation : le vérificateur contrôle chaque commit fait à la main
    git(copie, "config", "core.hooksPath", os.path.join("systeme", "hooks"))
    return copie, prive


def envoyes(prive):
    return int(git(prive, "rev-list", "--count", "main")[1] or 0)


def ecrire(copie, rel, texte, ajouter=False):
    chemin = os.path.join(copie, rel)
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "a" if ajouter else "w", encoding="utf-8") as f:
        f.write(texte)


def preparer_routines(copie):
    """Dans la copie : toutes les routines « en place », et deux routines d'essai à la fin du tableau."""
    with open(os.path.join(copie, ROUTINES), encoding="utf-8") as f:
        lignes = f.read().replace("| à construire |", "| en place |").splitlines()
    debut = next(i for i, l in enumerate(lignes) if l.startswith("| Routine |"))
    fin = debut
    while fin < len(lignes) and lignes[fin].startswith("|"):
        fin += 1
    lignes[fin:fin] = [ESSAI_ECHEC, ESSAI_MESURE]
    ecrire(copie, ROUTINES, "\n".join(lignes) + "\n")


def passages(copie, cle):
    try:
        with open(os.path.join(copie, "journal", "routines.jsonl"), encoding="utf-8") as f:
            return [p for p in map(json.loads, filter(str.strip, f)) if p.get("cle") == cle]
    except OSError:
        return []


def essais_sauvegarde(copie, prive):
    code, sortie = script(copie, "verifier.py")
    essai("le vérificateur passe sur la copie", code == 0, sortie)

    avant = envoyes(prive)
    ecrire(copie, os.path.join("journal", "log.md"), "- essai · une ligne de plus\n", ajouter=True)
    code, sortie = script(copie, "lancer.py", "sauvegarde-de-nuit")
    essai("sauvegarde : le travail du jour part vers le dépôt privé", code == 0 and envoyes(prive) == avant + 1, sortie)

    # la panne d'origine : une image sans sa ligne dans _images.md bloquait le commit, et le journal disait « succès »
    ecrire(copie, os.path.join("domaines", "essai-sans-ligne.png"), "image d'essai")
    code_verif, _ = script(copie, "verifier.py")
    avant = envoyes(prive)
    code, sortie = script(copie, "lancer.py", "sauvegarde-de-nuit")
    essai("sauvegarde : une erreur de rangement ne la bloque pas",
          code_verif == 1 and code == 0 and envoyes(prive) == avant + 1, f"vérificateur {code_verif}, sauvegarde {code} ; {sortie}")
    os.remove(os.path.join(copie, "domaines", "essai-sans-ligne.png"))

    gros = os.path.join(copie, "inbox", "essai-trop-gros.bin")
    os.makedirs(os.path.dirname(gros), exist_ok=True)
    with open(gros, "wb") as f:
        f.truncate(51 * 1024 * 1024)
    _, alerte = script(copie, "verifier.py")
    avant = envoyes(prive)
    code, sortie = script(copie, "lancer.py", "sauvegarde-de-nuit")
    essai("sauvegarde : un fichier de plus de 50 Mo l'arrête, et rien ne part",
          code == 1 and envoyes(prive) == avant and "essai-trop-gros.bin" in sortie, f"code {code} ; {sortie}")
    essai("vérificateur : le fichier trop gros est signalé", "essai-trop-gros.bin" in alerte, alerte)
    dernier = (passages(copie, "sauvegarde-de-nuit") or [{}])[-1]
    essai("journal : la sauvegarde arrêtée y laisse son vrai code", dernier.get("code") == 1, str(dernier)[:200])
    os.remove(gros)

    code, sortie = script(copie, "lancer.py", "sauvegarde-de-nuit")
    essai("sauvegarde : elle repart une fois le fichier retiré", code == 0, sortie)
    _, commande = script(copie, "lancer.py", "sauvegarde-de-nuit", "--essai")
    lancer(commande, copie, shell=True)
    code, sortie = lancer(commande, copie, shell=True)
    essai("sauvegarde : rien à enregistrer n'est pas un échec", code == 0, sortie)


def essais_journal(copie):
    code, _ = script(copie, "lancer.py", "essai-echec")
    dernier = (passages(copie, "essai-echec") or [{}])[-1]
    essai("journal : une commande qui échoue garde son code, même suivie d'une autre", code == 1 and dernier.get("code") == 1, str(dernier)[:200])

    script(copie, "lancer.py", "essai-mesure")
    vus = passages(copie, "essai-mesure")
    essai("journal : une routine directe qui lance une skill laisse un seul passage, avec sa mesure",
          len(vus) == 1 and vus[0].get("skill") == "essai", str(vus)[:200])


def essais_alerte(copie, base):
    maintenant = datetime.datetime.now().astimezone()
    faux = [{"cle": "rangement", "debut": maintenant - datetime.timedelta(hours=6), "code": 1, "sortie": ["essai d'échec"]},
            {"cle": "validation-de-nuit", "debut": maintenant - datetime.timedelta(days=5), "code": 0, "directe": True, "sortie": []}]
    for p in faux:
        p["debut"] = p["debut"].isoformat(timespec="seconds")
        p["fin"] = p["debut"]
        ecrire(copie, os.path.join("journal", "routines.jsonl"), json.dumps(p, ensure_ascii=False) + "\n", ajouter=True)
    agents = os.path.join(base, "agents")
    os.makedirs(agents, exist_ok=True)
    args = ("--sans-notification", "--attente", "0", "--agents", agents)
    _, sortie = script(copie, "alerte.py", *args)
    essai("alerte : une routine qui a échoué est signalée", "Rangement de nuit a échoué" in sortie, sortie)
    essai("alerte : une routine qui n'a pas tourné est signalée", "Validation de nuit n'a pas tourné" in sortie, sortie)
    with open(os.path.join(copie, "journal", "log.md"), encoding="utf-8") as f:
        essai("alerte : sa ligne arrive dans journal/log.md", "routine alerte-des-routines" in f.read())
    _, sortie = script(copie, "alerte.py", *args)
    essai("alerte : un même problème n'est signalé qu'une fois", sortie == "", sortie)


def essais_relecture(copie):
    """Ce qui évite que l'utilisateur croule sous la relecture : la validation de nuit dit « non lu », et une alerte
    qui dure devient une question dans les points ouverts."""
    vieux = (datetime.date.today() - datetime.timedelta(days=10)).isoformat()
    fiche = os.path.join("domaines", "operations", "essai-a-valider.md")
    ecrire(copie, fiche, f"---\ntype: livrable\nresume: Un livrable d'essai\nstatut: a-valider\ndomaine: operations\n"
                         f"cree: {vieux}\nmaj: {vieux}\n---\n# Essai\n")
    code, sortie = script(copie, "valider.py", "--jours", "3")
    with open(os.path.join(copie, fiche), encoding="utf-8") as f:
        entete = f.read()
    essai("validation de nuit : un fichier qui attend depuis 10 jours prend son statut de fin",
          code == 0 and "statut: a-valider" not in entete, sortie + entete[:200])
    try:
        with open(os.path.join(copie, "outbox", "ranges.md"), encoding="utf-8") as f:
            trace = f.read()
    except OSError:
        trace = ""
    essai("validation de nuit : sa trace dit « nuit, non lu »", "essai-a-valider.md · nuit, non lu" in trace, trace[-200:])
    with open(os.path.join(copie, "journal", "log.md"), encoding="utf-8") as f:
        essai("validation de nuit : le journal dit « sans lecture »", "par la nuit sans lecture" in f.read())
    os.remove(os.path.join(copie, fiche))

    # une erreur du vérificateur qui dure : le premier passage retient le jour où elle est apparue
    ecrire(copie, os.path.join("domaines", "essai-sans-ligne.png"), "image d'essai")
    code, sortie = script(copie, "points_ouverts.py")
    ouverts = os.path.join(copie, "outbox", "points-ouverts.md")
    with open(ouverts, encoding="utf-8") as f:
        premier = f.read()
    essai("points ouverts : le fichier s'écrit, sans alerte le premier jour",
          code == 0 and "## Projets" in premier and "## Alertes à trancher" not in premier, sortie + premier[-300:])
    etat = os.path.join(copie, "journal", "alertes.json")
    with open(etat, encoding="utf-8") as f:
        vues = json.load(f)
    with open(etat, "w", encoding="utf-8") as f:
        json.dump({cle: (datetime.date.today() - datetime.timedelta(days=5)).isoformat() for cle in vues}, f)
    script(copie, "points_ouverts.py")
    with open(ouverts, encoding="utf-8") as f:
        second = f.read()
    essai("points ouverts : une alerte présente depuis 3 jours devient une question à trancher",
          "## Alertes à trancher" in second and "_images.md" in second, second[-300:])
    os.remove(os.path.join(copie, "domaines", "essai-sans-ligne.png"))


def main():
    base = tempfile.mkdtemp(prefix="aios-essais-")
    try:
        copie, prive = copier(base)
        preparer_routines(copie)
        essais_sauvegarde(copie, prive)
        essais_journal(copie)
        essais_alerte(copie, base)
        essais_relecture(copie)
    finally:
        if "--garder" in sys.argv[1:]:
            print(f"Copie gardée : {base}")
        else:
            shutil.rmtree(base, ignore_errors=True)
    rates = resultats.count(False)
    print(f"{len(resultats) - rates} essai(s) sur {len(resultats)} passent." if rates else f"Les {len(resultats)} essais passent.")
    return 1 if rates else 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Contrôle le workspace : source unique, liens vers skills/, index d'images, mémoire, process, domaines, en-têtes,
plafonds, index et carte à jour.

Usage : python3 systeme/scripts/verifier.py
Code de sortie 1 s'il y a une erreur ; les avertissements ne bloquent pas.
"""
import os
import re
import subprocess
import sys

from index import (DEBUT_CARTE, DEBUT_PROJETS, DOSSIERS, FIN_CARTE, FIN_PROJETS, IGNORES, LOURDS, META,
                   chemin_attendu, chemins, domaines, les_processus, lire_entete, mots, skills_utilisees, slug_de,
                   tableaux, types_regles)
from lancer import dossier_lourds

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
    for base in ("projets", "processus", "domaines", "savoir", "bibliotheques", "skills"):
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


def controler_processus():
    """Chaque skill citée par un process existe, et le routeur de son domaine le cite."""
    for nom, e, liste in les_processus():
        rel = f"processus/{nom}.md"
        if not liste:
            avertissements.append(f"{rel} n'a pas de tableau d'étapes")
        manquantes = [s for s in skills_utilisees(liste) if not os.path.exists(chemin("skills", s, "SKILL.md"))]
        if manquantes and e.get("statut") not in ("a-construire", "clos"):
            erreurs.append(f"{rel} cite une skill qui n'existe pas : {', '.join(manquantes)}")
        routeur = f"routers/{e.get('domaine', '')}.md"
        if not os.path.exists(chemin(routeur)):
            erreurs.append(f"{rel} : le domaine « {e.get('domaine', '')} » n'a pas de routeur")
        elif rel not in "\n".join(lignes_de(routeur)):
            avertissements.append(f"{routeur} ne cite pas {rel}")


def obligatoire(regle, type_):
    """« tous », « tous sauf a, b », « a, b » ou « aucun » : le champ est-il obligatoire pour ce type ?"""
    regle = regle.strip()
    if regle == "tous":
        return True
    if regle.startswith("tous sauf"):
        return type_ not in mots(regle[len("tous sauf"):])
    return type_ in mots(regle)


def controler_domaines():
    """Chaque domaine réglé dans systeme/metadonnees.md a son routeur, chaque routeur a son domaine,
    et AGENTS.md garde les balises de ses blocs générés (carte des domaines, projets actifs)."""
    noms = [nom for nom, _ in domaines()]
    for nom in noms:
        if not os.path.exists(chemin("routers", f"{nom}.md")):
            avertissements.append(f"le domaine « {nom} » n'a pas de routeur : crée routers/{nom}.md "
                                  "(gabarit : systeme/gabarits/routeur.md)")
    if os.path.isdir(chemin("routers")):
        for fichier in sorted(os.listdir(chemin("routers"))):
            if fichier.endswith(".md") and fichier[:-3] not in noms:
                avertissements.append(f"routers/{fichier} : domaine absent de systeme/metadonnees.md")
    if os.path.exists(chemin("AGENTS.md")):
        texte = "\n".join(lignes_de("AGENTS.md"))
        for bloc, debut, fin in (("la carte des domaines", DEBUT_CARTE, FIN_CARTE),
                                 ("les projets actifs", DEBUT_PROJETS, FIN_PROJETS)):
            if debut not in texte or fin not in texte:
                avertissements.append(f"AGENTS.md a perdu les balises de {bloc} : ce bloc n'est plus généré")


REL_META = "systeme/metadonnees.md"


def regles_entetes():
    """Les réglages qui jugent un en-tête : (champs, statuts de chaque type, domaines connus)."""
    champs = {r["Champ"].strip("`"): r for r in tableaux(META, "Champ") if r.get("Champ")}
    types = {nom: statuts for nom, (statuts, _) in types_regles().items()}
    return champs, types, {nom for nom, _ in domaines()}


def ecarts_entete(e, rel, champs, types, connus, place=True):
    """Ce qui, dans l'en-tête e du fichier rel, s'écarte des réglages : une liste de messages.
    place=False : sans le contrôle du dossier (pour un fichier qu'on s'apprête à ranger)."""
    ecarts = []
    type_ = e.get("type", "")
    statuts = types.get(type_)
    if type_ and statuts is None:
        ecarts.append(f"{rel} : type « {type_} » absent de {REL_META}")
    for champ in e:
        if champ not in champs:
            ecarts.append(f"{rel} : champ « {champ} » absent de {REL_META}")
    for champ, regle in champs.items():
        valeur = e.get(champ, "")
        if champ == "statut" and statuts == []:
            continue
        if not valeur:
            if obligatoire(regle.get("Obligatoire pour", ""), type_):
                ecarts.append(f"{rel} : champ « {champ} » vide ou manquant")
            continue
        format_ = regle.get("Format", "").strip("`")
        if format_ == "date" and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", valeur):
            ecarts.append(f"{rel} : « {champ} » n'est pas une date AAAA-MM-JJ")
        elif format_ == "statut" and statuts and valeur not in statuts:
            ecarts.append(f"{rel} : statut « {valeur} » non prévu pour le type {type_} ({', '.join(statuts)})")
        elif format_ == "domaine" and valeur not in connus:
            ecarts.append(f"{rel} : domaine « {valeur} » absent de {REL_META}")
        elif format_ == "projet":
            for slug in mots(valeur):
                if not os.path.exists(chemin("projets", f"{slug}.md")):
                    ecarts.append(f"{rel} : projet « {slug} » introuvable dans projets/")
    parties = rel.split("/")
    if place and parties[0] == "domaines" and len(parties) > 2 and e.get("domaine") and e["domaine"] != parties[1]:
        ecarts.append(f"{rel} : rangé dans domaines/{parties[1]}/ mais son domaine est « {e['domaine']} »")
    return ecarts


def controler_reglages():
    """systeme/metadonnees.md se tient : pas de mot à la fois type et statut, des statuts de fin connus,
    des chemins bien formés."""
    reglages = types_regles()
    for doublon in sorted(set(reglages) & {s for statuts, _ in reglages.values() for s in statuts}):
        avertissements.append(f"{REL_META} : « {doublon} » est à la fois un type et un statut")
    for nom, (statuts, fin) in reglages.items():
        for s in fin:
            if s not in statuts:
                avertissements.append(f"{REL_META} : le type {nom} finit par « {s} », absent de ses statuts")
    for nom, modele in chemins().items():
        inconnus = set(re.findall(r"<[^>]+>", modele)) - {"<domaine>", "<date>", "<slug>"}
        if not modele.endswith(".md") or "<slug>" not in modele or inconnus:
            avertissements.append(f"{REL_META} : le chemin du type {nom} ({modele}) doit finir par .md, "
                                  "contenir <slug> et n'utiliser que <domaine>, <date> et <slug>")


def controler_entetes():
    """Chaque en-tête suit systeme/metadonnees.md, et chaque fichier est au chemin que son type lui donne."""
    if not os.path.exists(META):
        avertissements.append(f"{REL_META} manque : les en-têtes ne sont pas contrôlés")
        return
    controler_reglages()
    regles, modeles = regles_entetes(), chemins()
    for base in DOSSIERS:
        for dossier, sous, fichiers in os.walk(chemin(base)):
            sous[:] = sorted(s for s in sous if not s.startswith("."))
            parent = os.path.basename(dossier)
            for nom in sorted(fichiers):
                if not nom.endswith(".md") or nom in IGNORES:
                    continue
                rel = os.path.relpath(os.path.join(dossier, nom), RACINE).replace(os.sep, "/")
                e = lire_entete(os.path.join(dossier, nom))
                if not e:
                    avertissements.append(f"{rel} n'a pas d'en-tête (gabarit : systeme/gabarits/fiche.md)")
                    continue
                avertissements.extend(ecarts_entete(e, rel, *regles))
                # Dans un objet de plusieurs fichiers (<nom>/<nom>.md), seule la fiche du dossier a une place réglée.
                if nom != parent + ".md" and os.path.exists(os.path.join(dossier, parent + ".md")):
                    continue
                modele = modeles.get(e.get("type", ""))
                attendu = modele and chemin_attendu(modele, e, slug_de(parent if nom == parent + ".md" else nom))
                if attendu and rel not in (attendu, attendu[:-3] + "/" + os.path.basename(attendu)):
                    avertissements.append(f"{rel} n'est pas à sa place : d'après son en-tête, il va dans {attendu} "
                                          "(systeme/scripts/ranger.py l'y range)")


def controler_lourds():
    """Le dossier des fichiers lourds (FICHIERS_LOURDS dans .env) existe et s'écrit ; sans lui, une vidéo ou un son
    de l'inbox ne peut pas être rangé."""
    dossier = dossier_lourds()
    if dossier:
        if not os.path.isdir(dossier):
            avertissements.append(f"le dossier des fichiers lourds ({dossier}) n'existe pas : crée-le ou corrige "
                                  "FICHIERS_LOURDS dans .env")
        elif not os.access(dossier, os.W_OK):
            avertissements.append(f"le dossier des fichiers lourds ({dossier}) ne s'écrit pas : "
                                  "l'IA ne pourra pas y ranger")
        return
    lourds = [n for _, _, fichiers in os.walk(chemin("inbox")) for n in fichiers if n.lower().endswith(LOURDS)]
    if lourds:
        avertissements.append(f"{len(lourds)} vidéo(s) ou son(s) dans inbox/, mais pas de dossier des fichiers lourds : "
                              "ajoute FICHIERS_LOURDS à .env (un dossier Google Drive synchronisé, par exemple)")


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
    controler_processus()
    controler_domaines()
    controler_entetes()
    controler_lourds()
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

#!/usr/bin/env python3
"""Génère les _index.md depuis les en-têtes des fichiers, les vues (vues/ : un index par type et par projet,
tous domaines confondus), la page outbox/index.html (sorties, process, skills), la carte des domaines et les projets
actifs d'AGENTS.md, et les réglages de l'interface (départements, routines, applications) depuis
systeme/metadonnees.md, systeme/routines.md et systeme/connexions.md.

Usage : python3 systeme/scripts/index.py [--check]
  --check : n'écrit rien, liste les index qui ne sont plus à jour (code 1 s'il y en a).
"""
import html
import json
import os
import re
import sys
import unicodedata
import urllib.parse

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOSSIERS = ["projets", "processus", "domaines", "savoir", "bibliotheques"]
IGNORES = {"_index.md", "_images.md"}
AVERTISSEMENT = "<!-- Généré par systeme/scripts/index.py : ne pas modifier à la main. -->"
DEBUT_CARTE = ("<!-- Début de la carte : générée par systeme/scripts/index.py depuis systeme/metadonnees.md. "
               "Change les domaines là-bas. -->")
FIN_CARTE = "<!-- Fin de la carte -->"
DEBUT_PROJETS = ("<!-- Début des projets actifs : générés par systeme/scripts/index.py depuis l'en-tête "
                 "des fichiers de projets/. -->")
FIN_PROJETS = "<!-- Fin des projets actifs -->"
META = os.path.join(RACINE, "systeme", "metadonnees.md")
VUES = os.path.join(RACINE, "vues")
LOURDS = (".mp4", ".mov", ".m4v", ".mkv", ".avi", ".webm", ".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg", ".opus")
COULEURS = ["#00bcd4", "#e040fb", "#fdd835", "#43a047", "#f44336", "#ec407a", "#26a69a", "#8d6e63"]
ICONES = ["pen", "people", "build", "data", "pulse", "book", "visual", "clock", "api"]
COUCHES = [
    {"key": "A", "label": "Applications", "color": "#3f8fd4", "shape": "hex", "blurb": "Serveurs MCP, CLI et API que ton agent peut joindre"},
    {"key": "R", "label": "Routines", "color": "#d99a1f", "shape": "ringdot", "blurb": "Automatisations planifiées, qui tournent sans qu’on les demande"},
    {"key": "M", "label": "Mémoire", "color": "#9a66e0", "shape": "chip", "blurb": "Chaque fichier de contexte, regroupé par domaine"},
    {"key": "S", "label": "Skills", "color": "#ff6b1a", "shape": "diamond", "blurb": "Ce que ton agent peut lancer à la demande"},
]


def lire_entete(chemin):
    """Lit l'en-tête (entre deux lignes ---) d'un fichier Markdown : un dict de champs simples."""
    champs = {}
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return champs
    if not lignes or lignes[0].strip() != "---":
        return champs
    for ligne in lignes[1:]:
        if ligne.strip() == "---":
            break
        if ":" not in ligne or ligne.startswith((" ", "\t", "-")):
            continue
        cle, valeur = ligne.split(":", 1)
        valeur = valeur.split(" #", 1)[0].strip().strip("\"'")
        if valeur.startswith("[") and valeur.endswith("]"):
            valeur = ", ".join(v.strip().strip("\"'") for v in valeur[1:-1].split(",") if v.strip())
        champs[cle.strip()] = valeur
    return champs


def cellule(texte):
    return (texte or "").replace("|", "/").replace("\n", " ").strip()


def texte_html(texte):
    """Échappe le texte, et garde les `chemins` en code."""
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", html.escape(texte or ""))


def tableau(chemin, premiere_colonne):
    """Le premier tableau Markdown dont la première colonne porte ce titre : une liste de dicts."""
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return []
    entetes, rangs = None, []
    for ligne in lignes:
        if not ligne.startswith("|"):
            if entetes:
                break
            continue
        cases = [c.strip() for c in ligne.strip().strip("|").split("|")]
        if entetes is None:
            if cases[0] == premiere_colonne:
                entetes = cases
        elif not set(cases[0]) <= set("-: "):
            rangs.append(dict(zip(entetes, cases)))
    return rangs


def tableaux(chemin, premiere_colonne):
    """Tous les tableaux Markdown dont la première colonne porte ce titre, mis bout à bout : une liste de dicts."""
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return []
    entetes, rangs = None, []
    for ligne in lignes:
        if not ligne.startswith("|"):
            entetes = None
            continue
        cases = [c.strip() for c in ligne.strip().strip("|").split("|")]
        if entetes is None:
            entetes = cases if cases[0] == premiere_colonne else []
        elif entetes and not set(cases[0]) <= set("-: "):
            rangs.append(dict(zip(entetes, cases)))
    return rangs


def mots(texte):
    """« `a`, `b` » → ["a", "b"] ; « — » → []."""
    return [m.strip().strip("`") for m in texte.split(",") if m.strip().strip("`") not in ("", "—", "-")]


def domaines():
    """Les domaines réglés dans systeme/metadonnees.md, ceux du socle puis ceux du workspace : (nom, ce qu'il couvre)."""
    trouves = {}
    for r in tableaux(META, "Domaine"):
        nom = r.get("Domaine", "").strip("`")
        if nom and nom not in trouves:
            trouves[nom] = r.get("Ce qu'il couvre", "")
    return list(trouves.items())


def types_regles():
    """Les types réglés dans systeme/metadonnees.md : {type: (statuts dans l'ordre, statuts de fin)}."""
    trouves = {}
    for r in tableaux(META, "Type"):
        nom = r.get("Type", "").strip("`")
        if nom and nom not in trouves:
            trouves[nom] = (mots(r.get("Statuts", "")), mots(r.get("Fin", "")))
    return trouves


def familles():
    """Les familles de skills réglées dans systeme/metadonnees.md, celles du socle puis celles du workspace : {famille: nom}."""
    trouvees = {}
    for r in tableaux(META, "Famille"):
        nom = r.get("Famille", "").strip("`")
        if nom and nom not in trouvees:
            trouvees[nom] = r.get("Nom", "") or nom
    return trouvees


def skills_dispensees():
    """Les skills reprises telles quelles, du tableau « Skill dispensée » de systeme/metadonnees.md : ni plafond ni famille."""
    return {r.get("Skill dispensée", "").strip("`") for r in tableaux(META, "Skill dispensée")} - {""}


def famille_de(chemin):
    """La famille d'une skill : la ligne « famille: » de l'en-tête de son SKILL.md, sous « metadata: » ou non."""
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return ""
    if not lignes or lignes[0].strip() != "---":
        return ""
    for ligne in lignes[1:]:
        if ligne.strip() == "---":
            break
        if ligne.strip().startswith("famille:"):
            return ligne.split(":", 1)[1].split(" #", 1)[0].strip().strip("\"'")
    return ""


def chemins():
    """Le chemin réglé de chaque type dans systeme/metadonnees.md : {type: modèle}, sans les types « — »."""
    trouves = {}
    for r in tableaux(META, "Type"):
        nom, modele = r.get("Type", "").strip("`"), r.get("Chemin", "").strip("`")
        if nom and nom not in trouves and modele not in ("", "—", "-"):
            trouves[nom] = modele
    return trouves


def slug_de(nom):
    """Le slug d'un nom de fichier ou de dossier : sans extension ni date en tête (l'ancien nommage), minuscules,
    sans accents, tirets."""
    base = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", re.sub(r"\.md$", "", nom))
    base = unicodedata.normalize("NFKD", base).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-")


def chemin_attendu(modele, e, slug):
    """Le chemin d'un fichier d'après le modèle de son type et son en-tête ; None s'il manque une valeur.
    `<date>` : l'année et le mois de `cree` (AA-MM). Un slug qui finit déjà par cette date la perd, pour ne pas la doubler."""
    cree = e.get("cree", "")
    date = cree[2:7] if re.fullmatch(r"\d{4}-\d{2}-\d{2}", cree) else ""
    if "<date>" in modele and date and slug.endswith("-" + date):
        slug = slug[:-len(date) - 1]
    for cle, valeur in (("<domaine>", e.get("domaine", "")), ("<date>", date), ("<slug>", slug)):
        if cle in modele:
            if not valeur:
                return None
            modele = modele.replace(cle, valeur)
    return None if re.search(r"<[^>]+>", modele) else modele


def remplacer_bloc(texte, debut, fin, lignes):
    """Le texte, avec ce qui est entre les balises debut et fin remplacé par ces lignes ; inchangé s'il en manque une."""
    i, j = texte.find(debut), texte.find(fin)
    if i < 0 or j < i:
        return texte
    return texte[:i] + "\n".join([debut, ""] + lignes) + "\n\n" + texte[j:]


def projets_actifs():
    """Une ligne par projet vivant (statut hors « Fin ») : lien, domaine, statut s'il n'est pas celui de départ,
    prochaine étape."""
    statuts, fin = types_regles().get("projet", ([], []))
    depart = os.path.join(RACINE, "projets")
    lignes = []
    for nom in sorted(os.listdir(depart)) if os.path.isdir(depart) else []:
        if not nom.endswith(".md") or nom in IGNORES:
            continue
        e = lire_entete(os.path.join(depart, nom))
        if e.get("statut") in fin:
            continue
        infos = [e.get("domaine", "")]
        if statuts and e.get("statut") != statuts[0]:
            infos.append(e.get("statut", "") or "sans statut")
        infos.append(e.get("prochaine_etape", ""))
        lignes.append(f"- [{nom[:-3]}](projets/{nom}) · " + " · ".join(i for i in infos if i))
    return lignes or ["Aucun pour l'instant."]


def agents():
    """AGENTS.md, avec la carte des domaines et les projets actifs régénérés entre leurs balises."""
    with open(os.path.join(RACINE, "AGENTS.md"), encoding="utf-8") as f:
        texte = f.read()
    carte = ["| Domaine | Ce qu'il couvre | Routeur |", "|---|---|---|"]
    carte += [f"| {nom} | {cellule(couvre)} | `routers/{nom}.md` |" for nom, couvre in domaines()]
    texte = remplacer_bloc(texte, DEBUT_CARTE, FIN_CARTE, carte)
    return remplacer_bloc(texte, DEBUT_PROJETS, FIN_PROJETS, projets_actifs())


def etapes(chemin):
    """Le tableau des étapes d'un process : (étape, skills, ce qu'on décide, qui décide) par ligne."""
    trouvees = []
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return trouvees
    for ligne in lignes:
        if not ligne.startswith("|"):
            continue
        cases = [c.strip() for c in ligne.strip().strip("|").split("|")]
        if len(cases) < 4 or cases[0] == "Étape" or set(cases[0]) <= set("-: "):
            continue
        noms = [n.strip().strip("`") for n in cases[1].split(",")]
        trouvees.append((cases[0], [n for n in noms if n and n not in ("—", "-")], cases[2], cases[3]))
    return trouvees


def les_processus():
    """Chaque process : son nom, son en-tête, ses étapes."""
    depart = os.path.join(RACINE, "processus")
    if not os.path.isdir(depart):
        return []
    return [(nom[:-3], lire_entete(os.path.join(depart, nom)), etapes(os.path.join(depart, nom)))
            for nom in sorted(os.listdir(depart)) if nom.endswith(".md") and nom not in IGNORES]


def skills_utilisees(liste_etapes):
    vues = []
    for _, noms, _, _ in liste_etapes:
        vues += [n for n in noms if n not in vues]
    return vues


def passages():
    """Les passages notés dans journal/log.md (« processus <nom> | <sujet> »), du plus récent au plus ancien."""
    trouves = {}
    chemin = os.path.join(RACINE, "journal", "log.md")
    if not os.path.exists(chemin):
        return trouves
    with open(chemin, encoding="utf-8") as f:
        for ligne in f:
            m = re.match(r"- (\d{4}-\d{2}-\d{2}) · processus ([a-z0-9-]+) \| (.*)", ligne.strip())
            if m:
                trouves.setdefault(m.group(2), []).insert(0, (m.group(1), m.group(3)))
    return trouves


def index_dossier(dossier):
    """Contenu de l'_index.md d'un dossier."""
    relatif = os.path.relpath(dossier, RACINE)
    entrees = sorted(os.listdir(dossier))
    sous_dossiers = [e for e in entrees if os.path.isdir(os.path.join(dossier, e)) and not e.startswith(".")]
    fichiers = [e for e in entrees if e.endswith(".md") and e not in IGNORES]
    lignes = [f"# {relatif} · index", "", AVERTISSEMENT, ""]

    if not fichiers:
        lignes.append("Aucun fichier pour l'instant.")
    elif relatif == "projets":
        lignes += ["| Projet | Domaine | Statut | Échéance | Prochaine étape |", "|---|---|---|---|---|"]
        projets = [(f, lire_entete(os.path.join(dossier, f))) for f in fichiers]
        fin = types_regles().get("projet", ([], []))[1]
        projets.sort(key=lambda p: (p[1].get("statut") in fin, p[0]))
        for nom, e in projets:
            lignes.append(f"| [{nom[:-3]}]({nom}) | {cellule(e.get('domaine'))} | {cellule(e.get('statut'))} "
                          f"| {cellule(e.get('echeance'))} | {cellule(e.get('prochaine_etape'))} |")
    elif relatif == "processus":
        lignes += ["| Process | Domaine | Skills | Déclencheur | Statut |", "|---|---|---|---|---|"]
        for nom, e, liste in les_processus():
            lignes.append(f"| [{nom}]({nom}.md) | {cellule(e.get('domaine'))} | {cellule(', '.join(skills_utilisees(liste)))} "
                          f"| {cellule(e.get('declencheur'))} | {cellule(e.get('statut'))} |")
    else:
        lignes += ["| Fichier | Type | Résumé | Statut | Projet | Maj |", "|---|---|---|---|---|---|"]
        notes = [(f, lire_entete(os.path.join(dossier, f))) for f in fichiers]
        notes.sort(key=lambda n: (n[1].get("maj", ""), n[0]), reverse=True)
        for nom, e in notes:
            lignes.append(f"| [{nom}]({nom}) | {cellule(e.get('type'))} | {cellule(e.get('resume'))} "
                          f"| {cellule(e.get('statut'))} | {cellule(e.get('projet'))} | {cellule(e.get('maj'))} |")

    if sous_dossiers:
        lignes += ["", "## Dossiers", ""]
        lignes += [f"- [{d}/]({d}/_index.md)" for d in sous_dossiers]
    if os.path.exists(os.path.join(dossier, "_images.md")):
        lignes += ["", "Images : [_images.md](_images.md)"]
    return "\n".join(lignes) + "\n"


def tous_les_dossiers():
    for base in DOSSIERS:
        depart = os.path.join(RACINE, base)
        if not os.path.isdir(depart):
            continue
        for dossier, sous, _ in os.walk(depart):
            sous[:] = sorted(s for s in sous if not s.startswith("."))
            yield dossier


def livrables():
    """Fichiers des domaines à montrer dans l'outbox : statut a-valider, ou type livrable."""
    trouves = []
    depart = os.path.join(RACINE, "domaines")
    for dossier, sous, fichiers in os.walk(depart):
        sous[:] = [s for s in sous if not s.startswith(".")]
        for nom in fichiers:
            if not nom.endswith(".md") or nom in IGNORES:
                continue
            chemin = os.path.join(dossier, nom)
            e = lire_entete(chemin)
            if e.get("statut") == "a-valider" or e.get("type") == "livrable":
                trouves.append((e.get("maj", ""), os.path.relpath(chemin, RACINE), e))
    return sorted(trouves, reverse=True)


def fiches():
    """Chaque fichier qui a un type, dans les dossiers indexés et le journal : (chemin relatif, en-tête)."""
    for base in DOSSIERS + ["journal"]:
        for dossier, sous, fichiers in os.walk(os.path.join(RACINE, base)):
            sous[:] = sorted(s for s in sous if not s.startswith("."))
            for nom in sorted(fichiers):
                if nom.endswith(".md") and nom not in IGNORES:
                    e = lire_entete(os.path.join(dossier, nom))
                    if e.get("type"):
                        yield os.path.relpath(os.path.join(dossier, nom), RACINE).replace(os.sep, "/"), e


def projets_de(e):
    return [p.strip() for p in e.get("projet", "").split(",") if p.strip()]


def table_vue(liste, colonnes):
    """Le tableau d'une vue : une ligne par fichier, un lien relatif depuis vues/, puis les champs demandés."""
    lignes = ["| Fichier | " + " | ".join(titre for titre, _ in colonnes) + " |", "|---" * (len(colonnes) + 1) + "|"]
    for rel, e in liste:
        nom = os.path.basename(rel)[:-3]
        lignes.append(f"| [{nom}](../{rel}) | " + " | ".join(cellule(e.get(champ)) for _, champ in colonnes) + " |")
    return lignes


def vue_type(type_, liste, couvre):
    """Tous les fichiers d'un type, tous domaines confondus : les vivants d'abord, dans l'ordre de leurs statuts,
    puis ceux qui sont finis. Les colonnes en plus : les champs réglés que ces fichiers remplissent."""
    statuts, fin = types_regles().get(type_, ([], []))
    rang = {s: i for i, s in enumerate(statuts)}
    liste = sorted(liste, key=lambda f: f[1].get("maj", ""), reverse=True)
    liste.sort(key=lambda f: (f[1].get("statut") in fin, rang.get(f[1].get("statut"), len(rang))))
    communs = {"type", "resume", "statut", "domaine", "cree", "maj", "liens", "fichier"}
    autres = [c for c in champs_regles() if c not in communs and any(e.get(c) for _, e in liste)]
    colonnes = [("Domaine", "domaine")] if any(e.get("domaine") for _, e in liste) else []
    colonnes += [("Résumé", "resume"), ("Statut", "statut")]
    colonnes += [(c.replace("_", " ").capitalize(), c) for c in autres] + [("Maj", "maj")]
    lignes = [f"# vues · {type_}", "", AVERTISSEMENT, ""]
    lignes += [f"Tous les fichiers de type `{type_}`, tous domaines confondus. {couvre}".rstrip(), ""]
    return "\n".join(lignes + table_vue(liste, colonnes)) + "\n"


def vue_projet(slug, liste):
    """Tous les fichiers qui servent un projet, où qu'ils soient rangés."""
    liste = sorted(liste, key=lambda f: f[1].get("maj", ""), reverse=True)
    liste.sort(key=lambda f: f[1].get("type", ""))
    fiche = f"projets/{slug}.md"
    lignes = [f"# vues · projet {slug}", "", AVERTISSEMENT, ""]
    lignes += [f"Tous les fichiers qui portent `projet: {slug}`, où qu'ils soient rangés. "
               f"La fiche du projet : [{fiche}](../{fiche}).", ""]
    colonnes = [("Type", "type"), ("Domaine", "domaine"), ("Résumé", "resume"), ("Statut", "statut"), ("Maj", "maj")]
    return "\n".join(lignes + table_vue(liste, colonnes)) + "\n"


def champs_regles():
    """Les champs réglés dans systeme/metadonnees.md, dans l'ordre."""
    trouves = []
    for r in tableaux(META, "Champ"):
        nom = r.get("Champ", "").strip("`")
        if nom and nom not in trouves:
            trouves.append(nom)
    return trouves


def vues():
    """Les vues : vues/<type>.md pour chaque type qui a des fichiers (sauf projet et processus, qui ont leur
    index), vues/projet-<slug>.md pour chaque projet que des fichiers servent, et vues/_index.md qui les liste."""
    par_type, par_projet = {}, {}
    for rel, e in fiches():
        par_type.setdefault(e["type"], []).append((rel, e))
        for p in projets_de(e):
            par_projet.setdefault(p, []).append((rel, e))
    couvre = {r.get("Type", "").strip("`"): r.get("Ce que c'est", "") for r in tableaux(META, "Type")}
    dedies = {"projet": "../projets/_index.md", "processus": "../processus/_index.md"}
    sommaire = ["# vues · index", "", AVERTISSEMENT, "",
                "Une vue par type et par projet, générée depuis les en-têtes : tous les fichiers, tous domaines confondus.",
                "", "| Vue | Ce qu'elle montre | Fichiers |", "|---|---|---|"]
    for type_ in sorted(par_type):
        n = len(par_type[type_])
        if type_ in dedies:
            sommaire.append(f"| [{type_}]({dedies[type_]}) | {cellule(couvre.get(type_))} | {n} |")
            continue
        texte = couvre.get(type_, "").rstrip(".")
        yield os.path.join(VUES, f"{type_}.md"), vue_type(type_, par_type[type_], texte + "." if texte else "")
        sommaire.append(f"| [{type_}]({type_}.md) | {cellule(couvre.get(type_))} | {n} |")
    for slug in sorted(par_projet):
        yield os.path.join(VUES, f"projet-{slug}.md"), vue_projet(slug, par_projet[slug])
        resume = lire_entete(os.path.join(RACINE, "projets", f"{slug}.md")).get("resume", "")
        sommaire.append(f"| [projet-{slug}](projet-{slug}.md) | {cellule(resume)} | {len(par_projet[slug])} |")
    if len(sommaire) == 8:
        sommaire[-2:] = ["Aucune vue pour l'instant."]
    groupes = hors_fiche()
    if groupes:
        yield os.path.join(VUES, "hors-fiche.md"), vue_hors_fiche(groupes)
        sommaire.append(f"| [hors-fiche](hors-fiche.md) | Les fichiers qui ne sont pas des fiches et qu'aucune fiche ne lie : "
                        f"ils s'ouvrent d'ici | {sum(len(n) for n in groupes.values())} |")
    yield os.path.join(VUES, "_index.md"), "\n".join(sommaire) + "\n"


def hors_fiche():
    """Les fichiers qui ne sont pas des fiches (.md) et qu'aucune fiche ne lie, dans les dossiers indexés :
    {dossier relatif: [noms]}. La navigation ne montre que les fiches ; cette liste garde une porte vers le reste."""
    lies, autres = set(), []
    for base in DOSSIERS + ["journal"]:
        for dossier, sous, fichiers in os.walk(os.path.join(RACINE, base)):
            sous[:] = sorted(s for s in sous if not s.startswith(".") and s != "__pycache__")
            for nom in sorted(fichiers):
                chemin = os.path.join(dossier, nom)
                if nom.startswith("."):
                    continue
                if not nom.endswith(".md"):
                    autres.append(chemin)
                    continue
                if nom in IGNORES:
                    continue
                with open(chemin, encoding="utf-8", errors="ignore") as f:
                    texte = f.read()
                for lien in re.findall(r"\]\(<?([^)\s>]+)", texte) + re.findall(r"`([^`\s]+\.[A-Za-z0-9]{2,5})`", texte):
                    lien = urllib.parse.unquote(lien.split("#")[0])
                    if lien and "://" not in lien:
                        lies.add(os.path.normpath(os.path.join(dossier, lien)))
                        lies.add(os.path.normpath(os.path.join(RACINE, lien)))
    groupes = {}
    for chemin in autres:
        if os.path.normpath(chemin) in lies:
            continue
        rel = os.path.relpath(chemin, RACINE).replace(os.sep, "/")
        groupes.setdefault(os.path.dirname(rel), []).append(os.path.basename(rel))
    return groupes


def vue_hors_fiche(groupes):
    total = sum(len(n) for n in groupes.values())
    lignes = ["# vues · hors fiche", "", AVERTISSEMENT, "",
              f"Les {total} fichiers qui ne sont pas des fiches (documents, images, données, code) et qu'aucune fiche "
              "ne lie. La navigation ne les montre pas : ils s'ouvrent d'ici. Pour qu'un fichier sorte de cette liste, "
              "ajoute son lien dans la fiche de son dossier.", "",
              "| Dossier | Fichiers |", "|---|---|"]
    for dossier in sorted(groupes):
        lignes.append(f"| {dossier} | {len(groupes[dossier])} |")
    for dossier in sorted(groupes):
        lignes += ["", f"## {dossier}", ""]
        lignes.append(" · ".join(f"[{n}](../{urllib.parse.quote(dossier + '/' + n)})" for n in groupes[dossier]))
    return "\n".join(lignes) + "\n"


def skills():
    """Chaque skill : son nom, la première phrase de sa description, son fichier."""
    trouvees = []
    depart = os.path.join(RACINE, "skills")
    if not os.path.isdir(depart):
        return trouvees
    for nom in sorted(os.listdir(depart)):
        fichier = os.path.join(depart, nom, "SKILL.md")
        if os.path.exists(fichier):
            e = lire_entete(fichier)
            description = e.get("description", "")
            premiere = description.split(". ")[0].rstrip(".") + "." if description else ""
            trouvees.append((e.get("name", nom), premiere, f"{nom}/SKILL.md"))
    return trouvees


def index_skills():
    lignes = ["# skills · index", "", AVERTISSEMENT, "",
              "Chaque skill vit dans `skills/<nom>/SKILL.md` : le dossier porte son nom.", ""]
    liste = skills()
    if not liste:
        lignes.append("Aucune skill pour l'instant.")
    else:
        lignes += ["| Skill | Ce qu'elle fait | Fichier |", "|---|---|---|"]
        for nom, description, fichier in liste:
            lignes.append(f"| {cellule(nom)} | {cellule(description)} | [{fichier}]({fichier}) |")
    return "\n".join(lignes) + "\n"


def ligne_processus(nom, e, liste, derniers):
    """Une ligne du tableau des process de l'outbox."""
    items = []
    for etape, noms, decision, qui in liste:
        item = texte_html(etape)
        if noms:
            item += " · <code>" + html.escape(", ".join(noms)) + "</code>"
        if decision not in ("—", "-", ""):
            item += " · " + texte_html(decision)
        items.append(f'<li>{item} <span class="qui">({html.escape(qui)})</span></li>')
    infos = [e.get("domaine", ""), e.get("declencheur", "")]
    if e.get("statut") and e.get("statut") != "actif":
        infos.append(e["statut"])
    passes = "<br>".join(f"{html.escape(d)} · {texte_html(s)}" for d, s in derniers[:3]) or "—"
    return (f'<tr><td><a href="../processus/{html.escape(nom)}.md">{html.escape(nom)}</a><br>'
            f'<span class="qui">{html.escape(" · ".join(i for i in infos if i))}</span></td>'
            f'<td><ol>{"".join(items)}</ol></td><td>{passes}</td></tr>')


def page_outbox():
    points_dir = os.path.join(RACINE, "outbox", "points")
    points = sorted((p for p in os.listdir(points_dir) if p.endswith(".md")), reverse=True) \
        if os.path.isdir(points_dir) else []
    lignes = []
    for p in points:
        lignes.append(f'<tr><td>{html.escape(p[:-3])}</td><td>Point du jour</td>'
                      f'<td><a href="points/{html.escape(p)}">{html.escape(p)}</a></td><td></td></tr>')
    for maj, chemin, e in livrables():
        lignes.append(f'<tr><td>{html.escape(maj)}</td><td>{html.escape(e.get("resume", ""))}</td>'
                      f'<td><a href="../{html.escape(chemin)}">{html.escape(chemin)}</a></td>'
                      f'<td>{html.escape(e.get("statut", ""))}</td></tr>')
    corps = "\n".join(lignes) or '<tr><td colspan="4">Rien pour l\'instant.</td></tr>'
    corps_skills = "\n".join(
        f'<tr><td>{html.escape(nom)}</td><td>{html.escape(description)}</td>'
        f'<td><a href="../skills/{html.escape(fichier)}">skills/{html.escape(fichier)}</a></td></tr>'
        for nom, description, fichier in skills()) or '<tr><td colspan="3">Aucune skill.</td></tr>'
    tous_passages = passages()
    corps_processus = "\n".join(
        ligne_processus(nom, e, liste, tous_passages.get(nom, []))
        for nom, e, liste in les_processus()) or '<tr><td colspan="3">Aucun process.</td></tr>'
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Outbox</title>
<!-- Généré par systeme/scripts/index.py : ne pas modifier à la main. -->
<style>
body {{ font-family: system-ui, sans-serif; margin: 24px; color: #1e1e1e; background: #fafafa; }}
h1 {{ font-size: 22px; }} h2 {{ font-size: 17px; margin-top: 28px; }}
input {{ width: 100%; max-width: 480px; padding: 8px; font-size: 15px; margin-bottom: 16px; }}
table {{ border-collapse: collapse; width: 100%; background: #fff; }}
td, th {{ border-bottom: 1px solid #e5e5e5; padding: 8px; text-align: left; font-size: 14px; vertical-align: top; }}
ol {{ margin: 0; padding-left: 18px; }} li {{ margin-bottom: 4px; }} code {{ font-size: 13px; }}
.qui {{ color: #777; font-size: 13px; }}
@media (prefers-color-scheme: dark) {{
  body {{ color: #eee; background: #161616; }} table {{ background: #1f1f1f; }} td, th {{ border-color: #333; }}
  a {{ color: #8ab4ff; }} .qui {{ color: #999; }}
}}
</style>
</head>
<body>
<h1>Outbox</h1>
<input id="q" placeholder="Rechercher (sans IA)" autofocus>
<table>
<thead><tr><th>Date</th><th>Quoi</th><th>Fichier</th><th>Statut</th></tr></thead>
<tbody id="lignes">
{corps}
</tbody>
</table>
<h2>Process</h2>
<table>
<thead><tr><th>Process</th><th>Étapes · skill · ce qu'on décide (qui)</th><th>Derniers passages</th></tr></thead>
<tbody id="processus">
{corps_processus}
</tbody>
</table>
<h2>Skills</h2>
<table>
<thead><tr><th>Skill</th><th>Ce qu'elle fait</th><th>Fichier</th></tr></thead>
<tbody id="skills">
{corps_skills}
</tbody>
</table>
<script>
document.getElementById('q').addEventListener('input', function () {{
  var t = this.value.toLowerCase();
  document.querySelectorAll('#lignes tr, #processus tr, #skills tr').forEach(function (r) {{
    r.style.display = r.textContent.toLowerCase().indexOf(t) === -1 ? 'none' : '';
  }});
}});
</script>
</body>
</html>
"""


def departements_interface():
    """config/departments.json de l'interface : un département par domaine de systeme/metadonnees.md."""
    noms = [nom for nom, _ in domaines()]
    departements, regles = [], []
    for i, nom in enumerate(noms):
        icone = "coin" if nom == "operations" else ICONES[i % len(ICONES)]
        departements.append({"key": nom, "label": nom.capitalize(), "color": COULEURS[i % len(COULEURS)], "icon": icone})
        regles += [{"prefix": f"domaines/{nom}/", "dept": nom}, {"prefix": f"routers/{nom}.md", "dept": nom}]
    for dossier in ("projets", "processus"):
        depart = os.path.join(RACINE, dossier)
        for f in sorted(os.listdir(depart)) if os.path.isdir(depart) else []:
            if f.endswith(".md") and f not in IGNORES:
                domaine = lire_entete(os.path.join(depart, f)).get("domaine")
                if domaine in noms:
                    regles.append({"prefix": f"{dossier}/{f}", "dept": domaine})
    contenu = {
        "_note": "Généré par systeme/scripts/index.py depuis les domaines de systeme/metadonnees.md et l'en-tête "
                 "des projets et des process : ne pas modifier à la main.",
        "departments": departements, "layers": COUCHES, "projectPrefixes": {}, "pathRules": regles,
        "memoryKeywords": [], "default": "operations" if "operations" in noms or not noms else noms[0],
    }
    return json.dumps(contenu, indent=2, ensure_ascii=False) + "\n"


def routines_interface():
    """snapshots/routines.json de l'interface, depuis le tableau de systeme/routines.md."""
    routines = []
    for r in tableau(os.path.join(RACINE, "systeme", "routines.md"), "Routine"):
        skill, etat = r.get("Skill", "").strip("`").strip("—-"), r.get("État", "").lower()
        directe = r.get("Commande", "").strip("`").strip("—-")
        routine = {"id": skill or r["Routine"].lower().replace(" ", "-"), "name": r["Routine"], "source": "planificateur",
                   "desc": " · ".join(x for x in (r.get("Quand", ""), f"skill {skill}" if skill else "",
                                                  "sans IA" if directe else "", r.get("Type", "")) if x),
                   "status": "active" if etat.startswith("en place") else "ondemand" if "demande" in etat else "paused"}
        cron = r.get("Cron", "").strip("`")
        if cron and cron not in ("—", "-"):
            routine["cron"] = cron
        routines.append(routine)
    contenu = {
        "_note": "Généré par systeme/scripts/index.py depuis systeme/routines.md : ne pas modifier à la main.",
        "timezone": "", "sources": [{"key": "planificateur", "label": "PLANIFICATEUR"}], "routines": routines,
    }
    return json.dumps(contenu, indent=2, ensure_ascii=False) + "\n"


def apps_interface():
    """config/apps.json de l'interface, depuis le tableau de systeme/connexions.md."""
    genres = {"cli": "cli", "api": "api", "mcp": "mcp"}
    apps = []
    for r in tableau(os.path.join(RACINE, "systeme", "connexions.md"), "Outil"):
        outil = r.get("Outil", "").strip("`")
        if not outil:
            continue
        genre = genres.get(r.get("Méthode", "").strip("`").lower(), "app")
        app = {"id": "app:" + re.sub(r"[^a-z0-9]+", "-", outil.lower()).strip("-"), "label": outil, "kind": genre,
               "access": "local", "status": "live", "desc": r.get("Pourquoi", "")}
        # Plusieurs noms séparés par des virgules : un même service branché deux fois (MCP local et connecteur du compte)
        noms = [n.strip().strip("`") for n in r.get("Commande", "").split(",")]
        noms = [n for n in noms if n and n not in ("—", "-")]
        if noms:
            app["mcp" if genre == "mcp" else "command"] = noms if genre == "mcp" and len(noms) > 1 else noms[0]
        apps.append(app)
    contenu = {"_note": "Généré par systeme/scripts/index.py depuis systeme/connexions.md : ne pas modifier à la main.",
               "apps": apps}
    return json.dumps(contenu, indent=2, ensure_ascii=False) + "\n"


def espace_interface():
    """config/workspace.json de l'interface : chaque dossier de domaines/ s'affiche ouvert sur la carte, sans clic."""
    chemin = os.path.join(RACINE, "interface", "config", "workspace.json")
    with open(chemin, encoding="utf-8") as f:
        contenu = json.load(f)
    visibles = [d for d in contenu.get("visibleRoots", []) if not d.startswith("domaines/")]
    depart = os.path.join(RACINE, "domaines")
    for dossier, sous, _ in os.walk(depart):
        sous[:] = sorted(s for s in sous if not s.startswith("."))
        if dossier != depart:
            visibles.append(os.path.relpath(dossier, RACINE).replace(os.sep, "/"))
    contenu["visibleRoots"] = visibles
    return json.dumps(contenu, indent=2, ensure_ascii=False) + "\n"


def cibles():
    """Chaque fichier généré et son contenu attendu."""
    for dossier in tous_les_dossiers():
        yield os.path.join(dossier, "_index.md"), index_dossier(dossier)
    if os.path.isdir(os.path.join(RACINE, "skills")):
        yield os.path.join(RACINE, "skills", "_index.md"), index_skills()
    if os.path.isdir(os.path.join(RACINE, "outbox")):
        yield os.path.join(RACINE, "outbox", "index.html"), page_outbox()
    yield from vues()
    if os.path.exists(os.path.join(RACINE, "AGENTS.md")):
        yield os.path.join(RACINE, "AGENTS.md"), agents()
    if os.path.isdir(os.path.join(RACINE, "interface", "config")):
        yield os.path.join(RACINE, "interface", "config", "departments.json"), departements_interface()
        yield os.path.join(RACINE, "interface", "snapshots", "routines.json"), routines_interface()
        if os.path.exists(os.path.join(RACINE, "interface", "config", "workspace.json")):
            yield os.path.join(RACINE, "interface", "config", "workspace.json"), espace_interface()
        yield os.path.join(RACINE, "interface", "config", "apps.json"), apps_interface()


def vues_en_trop(attendus):
    """Les fichiers de vues/ qu'aucune vue ne produit plus : un type ou un projet qui n'a plus de fichiers."""
    if not os.path.isdir(VUES):
        return []
    return [os.path.join(VUES, n) for n in sorted(os.listdir(VUES))
            if n.endswith(".md") and os.path.join(VUES, n) not in attendus]


def main():
    verifier_seulement = "--check" in sys.argv
    if not verifier_seulement:
        from score import calculer  # le score des vidéos s'écrit dans les en-têtes, avant les vues qui les lisent
        calculer()
    perimes = []
    attendus = list(cibles())
    for chemin in vues_en_trop({c for c, _ in attendus}):
        perimes.append(os.path.relpath(chemin, RACINE))
        if not verifier_seulement:
            os.remove(chemin)
    for chemin, contenu in attendus:
        actuel = None
        if os.path.exists(chemin):
            with open(chemin, encoding="utf-8") as f:
                actuel = f.read()
        if actuel == contenu:
            continue
        perimes.append(os.path.relpath(chemin, RACINE))
        if not verifier_seulement:
            os.makedirs(os.path.dirname(chemin), exist_ok=True)
            with open(chemin, "w", encoding="utf-8") as f:
                f.write(contenu)
    if verifier_seulement:
        for p in perimes:
            print(f"Index pas à jour : {p}")
        return 1 if perimes else 0
    print(f"{len(perimes)} fichier(s) généré(s) ou mis à jour.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
